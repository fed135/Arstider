/**
 * Engine
 *
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */
define( "Arstider/Engine", [
	"Arstider/Browser",
	"Arstider/Screen",
	"Arstider/Buffer",
	"Arstider/Events",
	"Arstider/Background",
	"Arstider/Watermark",
	"Arstider/Preloader",
	"Arstider/GlobalTimers",
	"Arstider/core/Performance",
	"Arstider/Mouse",
	"Arstider/Viewport",
	"Arstider/Renderer",
	"Arstider/Telemetry",
    "Arstider/Sound",
    "Arstider/Signal",
    "Arstider/Hash"
], /** @lends Engine */ function (Browser, Screen, Buffer, Events, Background, Watermark, Preloader, GlobalTimers, Performance, Mouse, Viewport, Renderer, Telemetry, Sound, Signal, Hash){

	var singleton;

	/**
	 * Engine constructor
	 * Core Engine, handles screen logic
	 * @class Engine
	 * @constructor
	 */
	function Engine(){
		/**
		 * Engine version
		 * @type {string}
		 */
		this.version = "@version@";
		/**
		 * Engine release target
		 * @type {string}
		 */
		this.release = "@target@";
		/**
		 * Engine debug flag
		 * @type {boolean}
		 */
		this.debug = ("@debug@" == "true");
		/**
		 * Build date Timestamp
		 * @type {string}
		 */
		this.timestamp = "@timestamp@"
		/**
		 * Whether or not the engine should skip the rendering of frames if performances are low
		 * @type {boolean}
		 */
		this.allowSkip = true;
		/**
		 * Engine canvas element
		 * @type {HTMLCanvasElement}
		 */
		this.canvas = null;
		/**
		 * Engine canvas context
		 * @type {CanvasRenderingContext2D}
		 */
		this.context = null;
		/**
		 * Engine canvas renderer
		 * @type {Renderer}
		 */
		this.renderer = Renderer;
		/**
		 * Request animation frame timer
		 * @type {number}
		 */
		this.frameRequest = null;
		/**
		 * Visual profiler
		 * @type {Debugger}
		 */
		this.profiler = null;
		/**
		 * Current screen object
		 * @type {Screen}
		 */
		this.currentScreen = null;
		/**
		 * Stops rendering
		 * @type {boolean}
		 */
		this.handbreak = true;
		/**
		 * Forces a stopped engine to remain paused until this gets reverted
		 * @type {boolean}
		 */
		this.pausedByRequest = false;
		/**
		 * Tells if engine is in the preloading process
		 * @type {boolean}
		 */
		this.isPreloading = false;
		/**
		 * Tells is logic and render are synchronous
		 * @private
		 * @type {boolean}
		 */
		this._isSynchronous = false;
		/**
		 * If sounds where stopped in a hurry
		 * @private
		 * @type {boolean}
		 */
		this._emergencySoundMute = false;
		/**
		 * Delta time reset required - on resume
		 * @private
		 * @type {boolean}
		 */
		this._deltaTimeReset = false;
		this.onerror = new Signal();
		this.onskip = new Signal();
	}
	/**
	 * Starts the engine on a defined HTML div tag
	 * @type {function(this:Engine)}
	 * @param {HTMLDivElement} tag The div to start the engine in
	 * @param {boolean} synchronous Makes the logic run at the same speed as render
	 */
	Engine.prototype.start = function(tag, debug, synchronous, vertex, fragment){
		if(!window.console || !this.debug){
			Arstider.verbose = 0;
			Arstider.disableConsole();
		}
		if(this.debug){
			requirejs(["Arstider/core/Debugger"], function(Debugger){
				singleton.profiler = new Debugger(singleton);
				singleton.profiler.init();
			});
		}
        this.canvas = new Buffer({
            name:"Arstider_main",
            id:"Arstider_main_canvas",
            webgl:false
        });
		this.context = this.canvas.context;
        Arstider.setFPS(Arstider.FPS);
		this._isSynchronous = synchronous || false;
		Performance.updateLogic = (this._isSynchronous)?null:this.stepLogic;
		window.addEventListener("error", this._handleError);
		Viewport.init(tag, this.canvas.data);
		Mouse.init(Viewport.container);
		Mouse._touchRelay = this.applyTouch;
		Events.bind("Engine.gotoScreen", this.loadScreen);
		Events.bind("Engine.showPopup", this.showPopup);
		Events.bind("Engine.hidePopup", this.hidePopup);
		Events.bind("Viewport.pagehide", function(){
			this._deltaTimeReset = true;
			singleton.stop();
			if(!singleton._emergencySoundMute){
				singleton._emergencySoundMute = true;
				Sound.pause("__emergency-stop__");
			}
		});
		Events.bind("Viewport.pageshow", function(){
			this._deltaTimeReset = true;
			singleton.play();
			if(singleton._emergencySoundMute){
				singleton._emergencySoundMute = false;
				Sound.resume("__emergency-stop__");
			}
		});
		if(!this.pausedByRequest) this.play();
		//Platform info
		var data = Arstider.clone(Browser, false, "browser_");
		if(window.screen){
			data._screenWidth = window.screen.width;
			data._screenHeight = window.screen.height;
		}
		else{
			data._screenWidth = window.innerWidth;
			data._screenHeight = window.innerHeight;
		}
		data._viewportWidth = window.innerWidth;
		data._viewportHeight = window.innerHeight;
		data._pixelRatio = Viewport.canvasRatio;
		data._vibration = Viewport.vibrationEnabled;
		data._accelerometer = Viewport.accelerometerEnabled;
		Telemetry.log("system", "gamestart", data);
	};

	/**
	 * Sets the screen that will act as a preloader
	 * @type {function(this:Engine)}
	 * @param {Screen} preloaderScreen The screen to use
	 */
	Engine.prototype.setPreloaderScreen = function(preloaderScreen){
		Preloader.setScreen(new Screen(preloaderScreen));
		Preloader._screen.stage = singleton;
	};
	/**
	 * Steps the logic of the game (GlobalTimers)
	 * @type {function(this:Engine)}
	 * @param {number} dt Delta time (delay between now and the last frame)
	 */
	Engine.prototype.stepLogic = function(dt){
		Performance.numUpdates = 0;
		if(Arstider.skipUpdate) return;
		if(singleton === null) return;
		//Check if canvas rendering is on/off
		if(singleton.handbreak) return;
		if(singleton._deltaTimeReset){
			singleton._deltaTimeReset = false;
			return;
		}
		if(dt <= 0) return;
		Performance.numTimers = GlobalTimers.count();
		GlobalTimers.step(dt);
		if(singleton.currentScreen && singleton.currentScreen._update){
			singleton.currentScreen._update(dt);
			Performance.numUpdates++;
		}
	};
	/**
	 * Private handler for catching script errors
	 * @private
	 * @type {function(this:Engine)}
	 * @param {Error} e The error event
	 */
	Engine.prototype._handleError = function(e){
		singleton.onerror.dispatch(e);
		Telemetry.log("error", "error", e);
	};
	/**
	 * Starts the current screen. Called when the preloader completes
	 * @type {function(this:Engine)}
	 */
	Engine.prototype.startScreen = function(){
		Events.unbind("Preloader.loadingCompleted", singleton.startScreen);
		if(singleton.currentScreen){
			if(singleton.currentScreen.onload && singleton.currentScreen.__loaded === false){
				singleton.currentScreen.__loaded = true;
				singleton.currentScreen.onload();
			}
			if(singleton.canvas && singleton.canvas.data) singleton.canvas.data.focus();
			singleton.isPreloading = false;
			if(!Viewport.unsupportedOrientation) singleton.play();
			Telemetry.log("system", "screenstart", {screen:singleton.currentScreen.name});
		}
		else{
			if(Arstider.verbose > 0) console.warn("Arstider.Engine.startScreen: no current screen");
		}
	};
	/**
	 * Starts preloading a screen
	 * @type {function(this:Engine)}
	 * @param {string} name The url of the screen to load (must match define!)
	 */
	Engine.prototype.loadScreen = function(params, hasMap)
	{
		var name;
		// Simple screen name param
		if(typeof(params) == "string") {
			name = params;
			params = {};
		} else {
			name = params.name;
		}
		singleton.killScreen((singleton.currentScreen && singleton.currentScreen.__savedState));
		if(Arstider.savedStates[name] != undefined){
			singleton.currentScreen = Arstider.savedStates[name];

			singleton.releaseData(singleton.currentScreen);
			for(var i = 0; i< Arstider.savedStates[name].__tweens.length; i++){
				Arstider.savedStates[name].__tweens[i].running = Arstider.savedStates[name].__tweens[i].__running;
				if(Arstider.savedStates[name].__tweens[i].running && Arstider.savedStates[name].__tweens[i].resume) Arstider.savedStates[name].__tweens[i].resume();
			}
			GlobalTimers.list = GlobalTimers.list.concat(Arstider.savedStates[name].__tweens);
			delete singleton.currentScreen.__tweens;
			singleton.currentScreen.__savedState = false;
			if(singleton.currentScreen.onresume) singleton.currentScreen.onresume();
			delete Arstider.savedStates[name];
			return;
		}
		Events.unbind("Preloader.loadingCompleted", singleton.onScreenLoaded);
		Events.bind("Preloader.loadingCompleted", singleton.onScreenLoaded);
		// Preloader options
		if(!params.noPreloader){
			var preloaderParams = (params.preloader) ? params.preloader : {};
			Preloader.interactive = Arstider.checkIn(preloaderParams.interactive, false);
			Preloader.animated = Arstider.checkIn(preloaderParams.animated, false);
			singleton.stop();
			singleton.isPreloading = true;
			Preloader.set(name);
			Preloader.progress("__screen__", 0);
		}

		requirejs([name], function(_menu)
		{
			if(Viewport.unsupportedOrientation){
				Events.bind("Viewport.rotate", function finishLoadScreen(){
					Events.unbind("Viewport.rotate", finishLoadScreen);
					singleton.currentScreen = new Screen(_menu, singleton, hasMap);
					//singleton.currentScreen.stage = singleton;
					singleton.currentScreen.name = name;
					setTimeout(function screenProgressRelay(){
						Preloader.progress("__screen__", 100);
					},100);
				});
			}
			else
			{
				singleton.currentScreen = new Screen(_menu, singleton, hasMap);

				singleton.currentScreen.stage = singleton;
				singleton.currentScreen.name = name;

				if(params.noPreloader){
					setTimeout(singleton.startScreen, 10);
				}
				else{
					setTimeout(function screenProgressRelay(){
						Preloader.progress("__screen__", 100);
					},100);
				}
			}
		});
	};
	Engine.prototype.onScreenLoaded = function()
	{
		// Wait for user actions in preloader
		// for interactions, stories, choose level options, etc.
		if(Preloader.interactive)
		{
			Events.bind("Preloader.userCompleted", function() {
				singleton.startScreen();
				Events.unbind("Preloader.userCompleted", singleton.startScreen);
			});
			return;
		}
		singleton.startScreen();
	};
	Engine.prototype.protectData = function(obj){
		var orig = Arstider.getNode(obj);
		if(orig.data && orig.data.toDataURL){
			orig._protected = true;
		}
		if(obj.children && obj.children.length > 0){
			for(var i = 0; i<obj.children.length; i++){
				singleton.protectData(obj.children[i]);
			}
		}
	};
	Engine.prototype.releaseData = function(obj){
		var orig = Arstider.getNode(obj);
		if(orig.data && orig.data.toDataURL){
			orig._protected = false;
		}
		if(obj.children && obj.children.length > 0){
			for(var i = 0; i<obj.children.length; i++){
				singleton.releaseData(obj.children[i]);
			}
		}
	};
	/**
	 * Kills the current screen
	 * @type {function(this:Engine)}
	 */
	Engine.prototype.killScreen = function(preserve){
		if(singleton.currentScreen != null){
			Telemetry.log("system", "screenstop", {screen:singleton.currentScreen.name});
			if(!preserve) singleton.currentScreen._unload();
               //if(Arstider.__retroAssetLoader){
				singleton.protectData(Preloader._screen);
				singleton.protectData(Background);
				singleton.protectData(Watermark);
				for(var i in Arstider.bufferPool){
                	if(i.indexOf(Arstider.tempBufferLabel) != -1 || i.indexOf("Arstider_Gradient") != -1 || i.indexOf("Arstider_TextField") != -1){
                		if(Arstider.bufferPool[i].data && !Arstider.bufferPool[i]._protected){
                			Arstider.bufferPool[i].kill();
                		}
                	}
                }
			//}
               GlobalTimers.removeTweens();
			delete singleton.currentScreen;
			if(Viewport.tagParentNode) Viewport.tagParentNode.innerHTML = "";
		}
		else{
			if(Arstider.verbose > 1) console.warn("Arstider.Engine.killScreen: no current screen");
		}
	};
	/**
	 * Starts rendering
	 * @type {function(this:Engine)}
	 */
	Engine.prototype.play = function(){
		if(singleton.handbreak){
			if(Viewport.unsupportedOrientation) return;
			if(Arstider.verbose > 2) console.warn("Arstider.Engine.play: playing...");
			if(!singleton.isPreloading) singleton.handbreak = false;
			if(singleton.frameRequest || Arstider.__animTimer) Arstider.cancelAnimFrame.call(window, singleton.frameRequest);
			singleton.draw();
			Events.broadcast("Engine.play", singleton);
		}
	};
	/**
	 * Stops rendering
	 * @type {function(this:Engine)}
	 */
	Engine.prototype.stop = function(){
		if(Arstider.verbose > 2) console.warn("Arstider.Engine.stop: stopping...");
		Mouse.reset();
		singleton.handbreak = true;
		Events.broadcast("Engine.stop", singleton);
	};
	/**
	 * Applies touch events to the canvas element recursively
	 * @type {function(this:Engine)}
	 * @param {Object} e The touch/mouse event
	 * @param {Object|null} target The target to apply the event to (defaults to current screen)
	 */
	Engine.prototype.applyTouch = function(e, target){
		if(!target){
			Arstider.__cancelBubble = {};
			target = (singleton.handbreak) ? Preloader._screen : singleton.currentScreen;
		}

		if(!target || !target.touchAccuracy || target.touchAccuracy == 0) return;

		if(target.global.x + target.global.width < 0 || target.global.x > Viewport.maxWidth || target.global.y + target.global.height < 0 || target.global.y > Viewport.maxHeight) return;

		var
			i,
			u,
			numInputs = 1
		;
		if(Browser.isMobile){
			numInputs = Arstider.min(Mouse.count(true), 5);
		}
		if(target && target.children && target.children.length > 0){
			for(i = target.children.length-1; i>=0; i--){
				if(target && target.children && target.children[i] && !target.children[i].__skip){
					for(u=0; u<numInputs;u++){
						if(Arstider.__cancelBubble[u] !== true && target.children[i].isTouched){
							if(target.children[i].isTouched(Mouse.x(u), Mouse.y(u))){
								if(Mouse.isPressed(u)){
									if(!target.children[i]._pressed) target.children[i]._onpress(e);
									if(Browser.isMobile) target.children[i]._preclick = true;
								}
								else{
									if(target.children[i]._pressed) target.children[i]._onrelease(e);
								}
								if(target && target.children && target.children[i] && !target.children[i].__skip){
									if(Mouse.rightPressed) target.children[i]._rightPressed = true;
									else{
										if(target.children[i]._rightPressed) target.children[i]._onrightclick(e);
									}
								}
								break;
							}
						}
					}
					//recursion
					if(target && target.children && target.children[i] && !target.children[i].__skip && target.children[i].children && target.children[i].children.length > 0 && target.children[i].children.touchAccuracy != 0) singleton.applyTouch(e, target.children[i]);
				}
			}
		}
		
		i = u = numInputs = null;
	};
	/**
	 * Finishes touch behaviours to the canvas element before draw
	 * @type {function(this:Engine)}
	 * @param {Object|null} target The target to apply the event to (defaults to current screen)
	 */
	Engine.prototype.applyRelease = function(target, inputs){
		var
			mouseX = (inputs.length == 0)?-1:inputs[0].x,
			mouseY = (inputs.length == 0)?-1:inputs[0].y,
			i,
			inputId = null
		;

		if(!target || !target.touchAccuracy || target.touchAccuracy == 0) return;

		if(target.global.x + target.global.width < 0 || target.global.x > Viewport.maxWidth || target.global.y + target.global.height < 0 || target.global.y > Viewport.maxHeight) return;

		if(Browser.isMobile){
			for(i=0; i< inputs.length; i++){
				if(Arstider.__cancelBubble[i] !== true && target.isTouched){
					if(target.isTouched(inputs[i].x, inputs[i].y) && inputs[i].pressed){
						inputId = i;
						mouseX = inputs[i].x;
						mouseY = inputs[i].y;
						break;
					}
				}
			}
			if(inputId == null && (target._pressed || target._preclick)){
				target._onleave();
				target._pressed = false;
				target._preclick = false;
			}
		}
		else{
			if(Arstider.__cancelBubble[0] !== true  && target.isTouched){
				if(target.isTouched(mouseX, mouseY)){
					if(!target._hovered) target._onhover();
					if(!Mouse.isPressed()) target._preclick = true;
				}
				else{
					if(target._hovered) target._onleave();
					target._pressed = false;
				}
			}
		}
		if(mouseX != -1 && mouseY != -1){
			if(target._dragged){
				target.x = mouseX - target._dragOffsetX;
				target.y = mouseY - target._dragOffsetY;
				if(target._boundDrag){
					if(target.x < 0) target.x = 0;
					if(target.y < 0) target.y = 0;
					if(target.x > target.parent.width) target.x = target.parent.width;
					if(target.y > target.parent.height) target.y = target.parent.height;
				}
			}
		}
		mouseX = mouseY = i = inputId = null;
		Arstider.__cancelBubble = {};
	};
	/**
	 * Recursively wipes pending deletion item (remove child is an async operation)
	 * @type {function(this:Engine)}
	 * @param {Object|null} target The target to check for pending deletion items in (defaults to current screen)
	 */
	Engine.prototype.removePending = function(target){
		if(target && target.children && target.children.length > 0){
			for(i = target.children.length-1; i>=0; i--){
				if(target && target.children && target.children[i] && target.children[i].__skip) target.children.splice(i, 1);
				else{
					//recursion
					if(target && target.children && target.children[i] && target.children[i].children && target.children[i].children.length > 0) singleton.removePending(target.children[i]);
				}
			}
		}
	};
	/**
	 * Renders a frame
	 * @type {function(this:Engine)}
	 */
	Engine.prototype.draw = function(){
		//Declare vars
		var
			showFrames = false
		;

		if(Viewport.unsupportedOrientation) return;
		if(singleton._isSynchronous){
			Performance.deltaTime = Arstider.timestamp() - Performance.lastFrame;
			singleton.stepLogic(Performance.deltaTime);
		}
		if(!singleton.debug && Arstider.verbose > 0) Arstider.verbose = 0;
		Performance.startStep(singleton.allowSkip);
		//Immediately request the next frame
		singleton.frameRequest = Arstider.requestAnimFrame.call(window, singleton.draw, Performance.deltaTime);
		if(Arstider.defaultRenderStyle == "sharp") singleton.canvas.updateRenderStyle(Arstider.defaultRenderStyle);
		// Preloader rendering
		if(singleton.handbreak){
			if(Preloader.interactive || Preloader.animated || Preloader._queue.length > 0){
                   singleton.drawPreloader(showFrames);
                   Performance.endStep();
			}
			return;
		}
		//if(Viewport.tagParentNode) Viewport.tagParentNode.style.display = "block";
		if(Performance.getStatus() === 0){
			Performance.endStep();
			if(Arstider.verbose > 2) console.warn("Arstider.Engine.draw: skipping draw step");
			//singleton.onskip.dispatch();
			return;
		}
		if(singleton.profiler) showFrames = singleton.profiler.showFrames;
		singleton.drawBackground(showFrames);
		singleton.drawScreen(showFrames);
		//if(Renderer.pendingRemoval > 0) singleton.removePending(singleton.currentScreen);
		//singleton.drawOverlay(showFrames);
		Performance.frames++;
		Mouse.cleanTouches();
		if(showFrames) singleton.profiler.drawFrames();
		Performance.endStep();
		showFrames = null;
	};
	/**
	 * Rendering of the preloader screen
	 * @type {function(this:Engine)}
	 */
	Engine.prototype.drawPreloader = function(showFrames){
		this.renderer.clear(singleton.context, 0,0, Viewport.maxWidth,Viewport.maxHeight);
		this.renderer.draw(singleton.context, Preloader._screen, function(e){singleton.applyRelease(e, ((Browser.isMobile)?Mouse._ongoingTouches:[{x:Mouse.x(), y:Mouse.y(), pressed:Mouse.pressed}]));}, null, showFrames);
		if(Viewport.tagParentNode) Viewport.tagParentNode.style.display = "none";
		Mouse.cleanTouches();
	};
	/**
	 * Rendering of the background
	 * @type {function(this:Engine)}
	 */
	Engine.prototype.drawBackground = function(showFrames){
		if(Background.data == null && Background.children.length == 0) return;
		this.renderer.draw(singleton.context, Background, null, null, showFrames);
	};
	/**
	 * Rendering of the background
	 * @type {function(this:Engine)}
	 */
	Engine.prototype.drawOverlay = function(showFrames){
		if(Watermark.data == null && Watermark.children.length == 0) return;
		this.renderer.draw(singleton.context, Watermark, null, null, showFrames);
	};
	/**
	 * Rendering of the current screen
	 * @type {function(this:Engine)}
	 */
	Engine.prototype.drawScreen = function(showFrames){
		this.renderer.draw(singleton.context, singleton.currentScreen, function(e){
			singleton.applyRelease(e, ((Browser.isMobile)?Mouse._ongoingTouches:[{x:Mouse.x(), y:Mouse.y(), pressed:Mouse.pressed}]));
		}, null, showFrames);
	};
	/**
	 * Returns a snapshot url of the Engine
	 * @memberof Arstider
	 * @type {function}
	 * @return {string}
	 */
	 Arstider.printScreen = function(type){
	 	return singleton.canvas.getURL(type);
	 };
	singleton = new Engine();
	return singleton;
});