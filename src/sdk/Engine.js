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
        "Arstider/commons/Ad",
		"Arstider/Browser",
		"Arstider/Screen",
		"Arstider/Buffer", 
		"Arstider/Events",
		"Arstider/Background",
		"Arstider/Preloader",
		"Arstider/GlobalTimers",
		"Arstider/core/Performance",
		"Arstider/Debugger",
		"Arstider/Mouse",
		"Arstider/Viewport",
		"Arstider/core/Renderer",
        "Arstider/core/WEBGLRenderer",
		"Arstider/Telemetry",
        "Arstider/Sound", 
        "Arstider/Filters"
	], /** @lends Engine */ function (Ad, Browser, Screen, Buffer, Events, Background, Preloader, GlobalTimers, Performance, Debugger, Mouse, Viewport, Renderer, WEBGLRenderer, Telemetry, Sound, Filters){
		
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
			this.debug = @debug@;
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
			this.handbreak = false;
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
		}
		
		/**
		 * Starts the engine on a defined HTML div tag
		 * @type {function(this:Engine)}
		 * @param {HTMLDivElement} tag The div to start the engine in
		 * @param {boolean} synchronous Makes the logic run at the same speed as render
		 */
		Engine.prototype.start = function(tag, synchronous){
			if(this.debug){
				this.profiler = new Debugger(this);
				this.profiler.init();
			}
			else{
				Arstider.verbose = 0;
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
			
			Mouse._touchRelay = this.applyTouch;
			
			Events.bind("Engine.gotoScreen", this.loadScreen);
			Events.bind("Engine.showPopup", this.showPopup);
			Events.bind("Engine.hidePopup", this.hidePopup);
			
			Events.bind("Viewport.pagehide", this.stop);
			Events.bind("Viewport.pageshow", this.play);
			
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
		 */
		Engine.prototype.stepLogic = function(){
			if(singleton === null) return;
			
			//Check if canvas rendering is on/off
			if(singleton.handbreak) return;
			
			GlobalTimers.step();
			if(singleton.currentScreen && singleton.currentScreen._update) singleton.currentScreen._update();
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
                    Sound.play("empty");
					singleton.currentScreen.onload();
				}
				singleton.canvas.data.focus();
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
		Engine.prototype.loadScreen = function(name){
			Events.unbind("Preloader.loadingCompleted", singleton.startScreen);
			Events.bind("Preloader.loadingCompleted", singleton.startScreen);
			
			singleton.stop();
			singleton.isPreloading = true;
			Preloader.set(name);
			Preloader.progress("__screen__", 0);
			singleton.killScreen();
			
			require([name], function(_menu){
				
				if(Viewport.unsupportedOrientation){
                                    Events.bind("Viewport.rotate", function finishLoadScreen(){
                                        Events.unbind("Viewport.rotate", finishLoadScreen);
                                        singleton.currentScreen = new Screen(_menu, singleton);

                                        singleton.currentScreen.stage = singleton;
                                        singleton.currentScreen.name = name;
                                        setTimeout(function(){
                                                Preloader.progress("__screen__", 100);
                                        },100);
                                    });
                                }
                                else{
                                    singleton.currentScreen = new Screen(_menu, singleton);

                                    singleton.currentScreen.stage = singleton;
                                    singleton.currentScreen.name = name;
                                    setTimeout(function(){
                                            Preloader.progress("__screen__", 100);
                                    },100);
                               }
			});
		};
			
		/**
		 * Kills the current screen
		 * @type {function(this:Engine)}
		 */
		Engine.prototype.killScreen = function(){
			if(singleton.currentScreen != null){
				Telemetry.log("system", "screenstop", {screen:singleton.currentScreen.name});
				singleton.currentScreen._unload();
                Ad.closeAll();
				delete singleton.currentScreen;
				if(Viewport.tagParentNode) Viewport.tagParentNode.innerHTML = "";
			}
			else{
				if(Arstider.verbose > 1) console.warn("Arstider.Engine.killScreen: no current screen");
			}
		};
		
		/**
		 * Displays a screen while keeping the previous screen's state intact
		 * @type {function(this:Engine)}
		 * @param {string} name The url of the screen to load (must match define!)
		 */
		Engine.prototype.showPopup = function(name){
			singleton.stop();
			
			if(singleton.currentScreen.onpopup) singleton.currentScreen.onpopup(name);
					
			singleton._savedScreen = singleton.currentScreen;
			singleton.currentScreen = null;
				
			require([name], function(_menu){
				singleton.currentScreen = new Screen(_menu, singleton);
				singleton.currentScreen.stage = singleton;
				singleton.currentScreen.name = name;
				singleton.currentScreen.origin = singleton._savedScreen;
				singleton.play();
				if(singleton.currentScreen.onload) singleton.currentScreen.onload();
				Telemetry.log("system", "screenstart", {screen:singleton.currentScreen.name, originscreen:singleton._savedScreen.name});
			});
		};
			
		/**
		 * Kills the popup screen and returns to the previous screen in the state it was in
		 * @type {function(this:Engine)}
		 */
		Engine.prototype.hidePopup = function(){
			singleton.killScreen();
				
			singleton.currentScreen = singleton._savedScreen;
				
			if(singleton.currentScreen.onresume) singleton.currentScreen.onresume();
		};
			
		/**
		 * Starts rendering
		 * @type {function(this:Engine)}
		 */
		Engine.prototype.play = function(){
			if(Viewport.unsupportedOrientation) return;
			
			if(Arstider.verbose > 2) console.warn("Arstider.Engine.play: playing...");
			if(!singleton.isPreloading) singleton.handbreak = false;
			if(singleton.frameRequest) Arstider.cancelAnimFrame.apply(window, [singleton.frameRequest]);
			singleton.draw();
			Events.broadcast("Engine.play", singleton);
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
		 * @param {number|null} inputId The id of the mobile input to look at
		 */
		Engine.prototype.applyTouch = function(e, target, inputId){
			
			target = target || singleton.currentScreen;
			inputId = inputId || 0;
			
			var 
				mouseX = Mouse.x(inputId),
				mouseY = Mouse.y(inputId),
				i
			;
			
			if(mouseX == -1 && mouseY == -1) return;
			
			if(target && target.children && target.children.length > 0){
				for(i = target.children.length-1; i>=0; i--){
					if(target && target.children && target.children[i] && !target.children[i].__skip){
						if(target.children[i].isTouched(mouseX, mouseY)){
							if(Mouse.pressed){
								if(!target.children[i]._pressed) target.children[i]._onpress(e);
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
						}
					
						//recursion
						if(target && target.children && target.children[i] && !target.children[i].__skip && target.children[i].children && target.children[i].children.length > 0) singleton.applyTouch(e, target.children[i]);
					}
				}
			}

			if(Browser.isMobile && inputId <4) singleton.applyTouch(e, target, inputId++);
		};

		/**
		 * Finishes touch behaviours to the canvas element before draw
		 * @type {function(this:Engine)}
		 * @param {Object|null} target The target to apply the event to (defaults to current screen) 
		 * @param {number|null} inputId The id of the mobile input to look at
		 */
		Engine.prototype.applyRelease = function(target, inputId){

			inputId = inputId || 0;

			var
				mouseX = Mouse.x(inputId),
				mouseY = Mouse.y(inputId)
			;

			if(mouseX == -1 && mouseY == -1) return;
			
			if(target.isTouched(mouseX, mouseY)){
				if(!target._hovered) target._onhover();
				if(!Mouse.pressed) target._preclick = true;
			}
			else{
				if(target._hovered) target._onleave();
				target._pressed = false;
			}
			
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

			if(Browser.isMobile && inputId <4) singleton.applyTouch(target, inputId++);
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
                        
            pencil = WEBGLRenderer;
            if(!pencil.enabled) pencil = Renderer;
            else{
                if(pencil.program == null) return;
            }
                        
                        
			
			if(!singleton.debug && Arstider.verbose > 0) Arstider.verbose = 0;
			
			//Immediately request the next frame
			singleton.frameRequest = Arstider.requestAnimFrame.apply(window, [singleton.draw]);
			
			if(Arstider.defaultRenderStyle == "sharp") singleton.canvas.updateRenderStyle(Arstider.defaultRenderStyle);

			//Check if canvas rendering is on/off
			if(singleton.handbreak){
				if(Preloader._queue.length > 0){
                    if(pencil == WEBGLRenderer) singleton.context.clear(singleton.context.COLOR_BUFFER_BIT);
					else singleton.context.clearRect(0,0,Viewport.maxWidth,Viewport.maxHeight);
					Preloader._screen.cancelBubble();
					Preloader._screen._update();
					pencil.draw(singleton, Preloader._screen, null, null, false);
					if(Viewport.tagParentNode) Viewport.tagParentNode.style.display = "none";
				}
				else{
					console.log("Nope", singleton.pausedByRequest);
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
			
			Background.render(singleton.context, Viewport.maxWidth, Viewport.maxHeight, Viewport.globalScale);
			
			//Run through the elements and draw them at their global x and y with their global width and height
                        
                        
			pencil.draw(singleton, singleton.currentScreen, singleton.applyRelease, null, showFrames);
				
			if(showFrames) singleton.profiler.drawFrames();
			
			singleton.removePending(singleton.currentScreen);
			
			if(singleton._isSynchronous) singleton.stepLogic();
			
			Performance.endStep();
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