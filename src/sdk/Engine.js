/**
 * Engine 
 * 
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */
;(function(){
	
	var 
		/*
		 * Singleton static
		 * @private
		 * @type {Engine|null}
		 */
		singleton = null
	;
	
	/**
	 * Defines Engine module
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
		"Arstider/core/Renderer",
        "Arstider/core/WEBGLRenderer",
		"Arstider/Telemetry",
        "Arstider/Sound"
	], /** @lends Engine */ function (Browser, Screen, Buffer, Events, Background, Watermark, Preloader, GlobalTimers, Performance, Mouse, Viewport, Renderer, WEBGLRenderer, Telemetry, Sound){
		
		if(singleton != null) return singleton;
			
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
			 * Saved copy of a screen with a popup over it
			 * @private
			 * @type {Screen}
			 */
			this._savedScreen = null;
			
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
		}
		
		/**
		 * Starts the engine on a defined HTML div tag
		 * @type {function(this:Engine)}
		 * @param {HTMLDivElement} tag The div to start the engine in
		 * @param {boolean} synchronous Makes the logic run at the same speed as render
		 */
		Engine.prototype.start = function(tag, synchronous){
			if(this.debug){
				requirejs(["Arstider/core/Debugger"], function(Debugger){
					singleton.profiler = new Debugger(singleton);
					singleton.profiler.init();
				});
			}
			else{
				Arstider.verbose = 0;
				Arstider.disableConsole();
			}
				
            WEBGLRenderer.test();
            this.canvas = new Buffer({
                name:"Arstider_main",
                id:"Arstider_main_canvas",
                webgl:WEBGLRenderer.enabled
            });
            Arstider.usingWebGl = WEBGLRenderer.enabled;
            WEBGLRenderer._context = this.canvas.context;
                        
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
				singleton.stop();
				if(!singleton._emergencySoundMute){
					singleton._emergencySoundMute = true;
					Sound.pause("__emergency-stop__");
				}
			});
			Events.bind("Viewport.pageshow", function(){
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
         * Quick-access method to change the shaders of the WebGl Renderer
         * @type {function(this:Engine)}
         * @param {string} vertex The url of the vertex shader
         * @param {string} fragment The url of the fragment shader
         */
        Engine.prototype.setShaders = function(vertex, fragment){
            if(WEBGLRenderer.enabled){
                WEBGLRenderer.setShaders(vertex, fragment);
            }
            else{
                if(Arstider.verbose > 1) console.warn("Arstider.Engine.setShaders: ignored because WebGl is not enabled");
            }
        };
		
		/**
		 * Steps the logic of the game (GlobalTimers)
		 * @type {function(this:Engine)}
		 * @param {number} dt Delta time (delay between now and the last frame) 
		 */
		Engine.prototype.stepLogic = function(dt){
			if(Arstider.skipUpdate) return;

			Performance.numUpdates = 0;

			if(singleton === null) return;

			//Check if canvas rendering is on/off
			if(singleton.handbreak) return;

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
			Events.broadcast("Engine.error", e);
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
                    if(!Sound._fileInPipe) Sound.play("empty");
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
			var preloaderParams = (params.preloader) ? params.preloader : {};
			Preloader.interactive = Arstider.checkIn(preloaderParams.interactive, false);
			Preloader.animated = Arstider.checkIn(preloaderParams.animated, false);
			
			singleton.stop();
			singleton.isPreloading = true;
			Preloader.set(name);
			Preloader.progress("__screen__", 0);
			
			requirejs([name], function(_menu)
			{
				if(Viewport.unsupportedOrientation){
					Events.bind("Viewport.rotate", function finishLoadScreen(){
						Events.unbind("Viewport.rotate", finishLoadScreen);
						singleton.currentScreen = new Screen(_menu, singleton, hasMap);

						//singleton.currentScreen.stage = singleton;
						singleton.currentScreen.name = name;
						setTimeout(function(){
							Preloader.progress("__screen__", 100);
						},100);
					});
				}
				else
				{
					singleton.currentScreen = new Screen(_menu, singleton, hasMap);

					singleton.currentScreen.stage = singleton;
					singleton.currentScreen.name = name;
					setTimeout(function(){
						Preloader.progress("__screen__", 100);
					},100);
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
			var orig = obj;
			if(orig){
				//add protected flag to buffer tags of background/watermark 
				if(obj.data){
					while(obj.data.nodeName == undefined){
						if(obj.data.data){
							obj = obj.data;
						}
						else break;
					}

					if(obj.data.toDataURL){
						obj._protected = true;
					}
				}

				if(orig.children && orig.children.length > 0){
					for(var i = 0; i<orig.children.length; i++){
						singleton.protectData(orig.children[i]);
					}
				}
			}
		};

		Engine.prototype.releaseData = function(obj){
			var orig = obj;
			if(orig){
				//add protected flag to buffer tags of background/watermark 
				if(obj.data){
					while(obj.data.nodeName == undefined){
						if(obj.data.data){
							obj = obj.data;
						}
						else break;
					}

					if(obj.data.toDataURL){
						obj._protected = false;
					}
				}

				if(orig.children && orig.children.length > 0){
					for(var i = 0; i<orig.children.length; i++){
						singleton.releaseData(orig.children[i]);
					}
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
	                	if(i.indexOf("_compatBuffer_") != -1 || i.indexOf("Arstider_Gradient") != -1 || i.indexOf("Arstider_TextField") != -1){
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
				if(singleton.frameRequest || Arstider.__animTimer) Arstider.cancelAnimFrame.apply(window, [singleton.frameRequest]);
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
			
			var 
				i,
				u,
				numInputs = 1
			;

			if(Browser.isMobile){
				numInputs = Math.min(Mouse.count(true), 5);
				Sound._queueFile();
			}
			
			if(target && target.children && target.children.length > 0){
				for(i = target.children.length-1; i>=0; i--){
					if(target && target.children && target.children[i] && !target.children[i].__skip){
						for(u=0; u<numInputs;u++){
							if(Arstider.__cancelBubble[u] !== true){
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
						if(target && target.children && target.children[i] && !target.children[i].__skip && target.children[i].children && target.children[i].children.length > 0) singleton.applyTouch(e, target.children[i]);
					}
				}
			}

			Arstider.__cancelBubble = {};
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


			if(Browser.isMobile){
				for(i=0; i< inputs.length; i++){
					if(Arstider.__cancelBubble[i] !== true){
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
				if(Arstider.__cancelBubble[0] !== true){
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
				showFrames = false,
                pencil
			;

			if(Viewport.unsupportedOrientation) return;

			if(singleton._isSynchronous){
				Performance.deltaTime = Arstider.timestamp() - Performance.lastFrame;
				singleton.stepLogic(Performance.deltaTime);
			} 
                        
            pencil = WEBGLRenderer;
            if(!pencil.enabled) pencil = Renderer;
            else{
                if(pencil.program == null) return;
            }
			
			if(!singleton.debug && Arstider.verbose > 0) Arstider.verbose = 0;
			
			//Immediately request the next frame
			singleton.frameRequest = Arstider.requestAnimFrame.apply(window, [singleton.draw]);
			
			if(Arstider.defaultRenderStyle == "sharp") singleton.canvas.updateRenderStyle(Arstider.defaultRenderStyle);

			// Preloader rendering
			if(singleton.handbreak){
				if(Preloader.interactive || Preloader.animated || Preloader._queue.length > 0){
                    if(pencil == WEBGLRenderer) singleton.context.clear(singleton.context.COLOR_BUFFER_BIT);
					else singleton.context.clearRect(0,0,Viewport.maxWidth,Viewport.maxHeight);
					//Preloader._screen.cancelBubble();
					//Preloader._screen._update();
					pencil.draw(singleton, Preloader._screen, function(e){singleton.applyRelease(e, ((Browser.isMobile)?Mouse._ongoingTouches:[{x:Mouse.x(), y:Mouse.y(), pressed:Mouse.pressed}]));}, null, showFrames);
					if(Viewport.tagParentNode) Viewport.tagParentNode.style.display = "none";
					Mouse.cleanTouches();
				}
				return;
			}

			if(Viewport.tagParentNode) Viewport.tagParentNode.style.display = "block";
			
			Performance.startStep(singleton.allowSkip);
			
			if(Performance.getStatus() === 0){
				Performance.endStep();
				if(Arstider.verbose > 2) console.warn("Arstider.Engine.draw: skipping draw step");
				Events.broadcast("Engine.skip", singleton);
				return;	
			}
				
			if(singleton.profiler) showFrames = singleton.profiler.showFrames;
			
			pencil.draw(singleton, Background, null, null, showFrames);  
			pencil.draw(singleton, singleton.currentScreen, function(e){singleton.applyRelease(e, ((Browser.isMobile)?Mouse._ongoingTouches:[{x:Mouse.x(), y:Mouse.y(), pressed:Mouse.pressed}]));}, null, showFrames);
			pencil.draw(singleton, Watermark, null, null, showFrames);
			Performance.frames++;

			Mouse.cleanTouches();

			if(showFrames) singleton.profiler.drawFrames();
			
			singleton.removePending(singleton.currentScreen);
			
			Performance.endStep();

			showFrames = null;
            pencil = null;
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
})();