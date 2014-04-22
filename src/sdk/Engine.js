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
		"Arstider/core/Renderer"
	], function (Screen, Buffer, Events, Background, Preloader, GlobalTimers, Performance, Debugger, Mouse, Viewport, Renderer){
		
		if(singleton != null) return singleton;
			
		/**
		 * Engine constructor
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
		}
		
		/**
		 * Starts the engine on a defined HTML div tag
		 * @type {function(this:Engine)}
		 * @param {HTMLDivElement} tag The div to start the engine in
		 */
		Engine.prototype.start = function(tag){
			if(this.debug){
				this.profiler = new Debugger(this);
				this.profiler.init();
			}
			else{
				Arstider.verbose = 0;
			}
				
			this.canvas = new Buffer({
				name:"Arstider_main",
				id:tag+"_canvas"
			});
			
			this.context = this.canvas.context;
			this.canvas = this.canvas.tag;
			
			Performance.updateLogic = this.stepLogic;
			
			window.addEventListener("error", this._handleError);
				
			Viewport.init(tag, this.canvas);
			
			Mouse._touchRelay = this.applyTouch;
			
			Events.bind("Engine.gotoScreen", this.loadScreen);
			Events.bind("Engine.showPopup", this.showPopup);
			Events.bind("Engine.hidePopup", this.hidePopup);
			
			if(!this.pausedByRequest) this.play();
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
		 * @type {Error} e The error event
		 */
		Engine.prototype._handleError = function(e){
			Events.broadcast("Engine.error", e);
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
				singleton.canvas.focus();
				if(!singleton.pausedByRequest) singleton.play();
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
			Preloader.set(name);
			Preloader.progress("__screen__", 0);
			singleton.killScreen();
			
			require([name], function(_menu){
				
				
				singleton.currentScreen = new Screen(_menu, singleton);
				
				singleton.currentScreen.stage = singleton;
				setTimeout(function(){
					Preloader.progress("__screen__", 100);
				},100);
			});
		};
			
		/**
		 * Kills the current screen
		 * @type {function(this:Engine)}
		 */
		Engine.prototype.killScreen = function(){
			if(singleton.currentScreen != null){
				singleton.currentScreen._unload();
				delete singleton.currentScreen;
				GlobalTimers.clean();
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
				singleton.currentScreen.origin = singleton._savedScreen;
				if(!singleton.pausedByRequest) singleton.play();
				if(singleton.currentScreen.onload) singleton.currentScreen.onload();
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
			if(Arstider.verbose > 2) console.warn("Arstider.Engine.play: playing...");
			singleton.handbreak = false;
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
		 */
		Engine.prototype.applyTouch = function(e, target){
			
			target = target || singleton.currentScreen;
			
			var 
				mouseX = Mouse.x(),
				mouseY = Mouse.y(),
				i
			;
			
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
				mouseX = Mouse.x(0),
				mouseY = Mouse.y(0),
				showFrames = false
			;
			
			if(!singleton.debug && Arstider.verbose > 0) Arstider.verbose = 0;
			
			//Immediately request the next frame
			if(singleton.frameRequest) Arstider.cancelAnimFrame.apply(window, [singleton.frameRequest]);
			singleton.frameRequest = Arstider.requestAnimFrame.apply(window, [singleton.draw]);
			
			if(Viewport.globalScale != 1) Arstider.setRenderStyle(singleton.canvas, Arstider.defaultRenderStyle);
			
			//Check if canvas rendering is on/off
			if(singleton.handbreak){
				if(Preloader._queue.length > 0 && !singleton.pausedByRequest){
					singleton.context.clearRect(0,0,Viewport.maxWidth,Viewport.maxHeight);
					Preloader._screen.cancelBubble();
					Preloader._screen._update();
					Renderer.draw(singleton, Preloader._screen, null, null, false);
				}
				return;
			}
			
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
			Renderer.draw(singleton, singleton.currentScreen, function(e){
				if(e.isTouched(mouseX, mouseY)){
					if(!e._hovered) e._onhover();
					if(!Mouse.pressed) e._preclick = true;
				}
				else{
					if(e._hovered) e._onleave();
				}
				
				if(e._dragged){
					e.x = mouseX - e._dragOffsetX;
					e.y = mouseY - e._dragOffsetY;
						
					if(e._boundDrag){
						if(e.x < 0) e.x = 0;
						if(e.y < 0) e.y = 0;
						if(e.x > e.parent.width) e.x = e.parent.width;
						if(e.y > e.parent.height) e.y = e.parent.height;
					}
				}
			}, null, showFrames);
				
			if(showFrames) singleton.profiler.drawFrames();
			
			singleton.removePending(singleton.currentScreen);
				
			Performance.endStep();
		};
		
		singleton = new Engine();
		return singleton;
	});	
})();