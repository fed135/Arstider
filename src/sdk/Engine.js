/**
 * Engine 
 * 
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */
;(function(){
	
	var 
		/**
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
	], /** @lends Engine */ function (Browser, Screen, Buffer, Events, Preloader, GlobalTimers, Performance, Mouse, Viewport, Renderer, Telemetry, Sound, Signal, Hash){
		
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
		Engine.prototype.start = function(tag){
			if(this.debug){
				requirejs(["Arstider/core/Debugger"], function(Debugger){
					Debugger.init();
				});
			}
			else{
				if(Hash.anchor && Hash.anchor.indexOf && Hash.anchor.indexOf("debug") == -1){
					Arstider.verbose = 0;
					Arstider.disableConsole();
				}
			}  
			console.log("New instance of the Arstider Engine.");
			console.log("Build: "+ this.release+" Version: "+this.version);
			console.log("DEBUG MODE");
			console.log("##################################################");
			
			window.addEventListener("error", this._handleError);
				
			Viewport.init(tag);
			
			Mouse.init(Viewport.container);
			
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
			
			Performance.getFrameSignal(Arstider.FPS).add(function(dt){
				if(!singleton.handbreak && !Viewport.unsupportedOrientation){
					GlobalTimers.step.call(GlobalTimers, dt);
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
			require([preloaderScreen], function(s){
				Preloader.setScreen(s);
				Preloader._screen.stage = singleton;
			});
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
					setTimeout(function screenProgressRelay(){
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
                
                singleton.protectData(Preloader._screen);

				for(var i in Arstider.bufferPool){
	               	if(i.indexOf("_compatBuffer_") != -1 || i.indexOf("Arstider_Gradient") != -1 || i.indexOf("Arstider_TextField") != -1){
	               		if(Arstider.bufferPool[i].data && !Arstider.bufferPool[i]._protected){
	               			Arstider.bufferPool[i].kill();
	               		}
	               	}
	               }

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
				//singleton.draw();
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
		 * Rendering of the preloader screen
		 * @type {function(this:Engine)}
		 */
		Engine.prototype.drawPreloader = function(showFrames){
			Renderer.clear(singleton.context, 0,0, Viewport.maxWidth,Viewport.maxHeight);
			Renderer.draw(singleton.context, Preloader._screen, function(e){singleton.applyRelease(e, ((Browser.isMobile)?Mouse._ongoingTouches:[{x:Mouse.x(), y:Mouse.y(), pressed:Mouse.pressed}]));}, null, showFrames);
			if(Viewport.tagParentNode) Viewport.tagParentNode.style.display = "none";
			Mouse.cleanTouches();
		};

		/**
		 * Returns an element or a list of elements that match the search criterias for inspection
		 * @memberof Arstider
		 * @type {function}
		 * @const
		 * @param {string|null} name The name of the element to search for. If none is provided, returns all elements
		 * @param {Object|null} t The target to perform the seach in. If none is provided, seaches in the current screen
		 * @return {Array|Object} The element(s) that fit the search query
		 */
		Arstider.findElement = function(name, t){
			if(!singleton.debug) return;
			
			var 
				ret = [], 
				i = 0, 
				t = t || singleton.currentScreen
			;
				
			if(t && t.children){
				for(i; i<t.children.length; i++){
					if(!name || name === t.children[i].name){
						ret.push(t.children[i]);
					}
					if(t.children[i].children){
						ret = ret.concat(Arstider.findElement.apply(singleton,[name, t.children[i]]));
					}
				}
			}
			
			if(ret.length == 1) return ret[0];
			return ret;
		};
		
		/**
		 * Draws the desired data object into a separate buffer for inspection
		 * @memberof Arstider
		 * @type {function}
		 * @const
		 * @param {Image|HTMLCanvasElement} targetData The data to draw on the debug canvas
		 */
		Arstider.debugDraw = function(targetData){
			if(!singleton.debug) return;
			
			var 
				ctx = null,
				win = window.document.getElementById("debugWindow")
			;
				
			if(!win){
				win = window.document.createElement('canvas');
				win.width=300;
				win.height=300;
				win.id = "debugWindow";
				win.style.height = "300px";
				win.style.width = "300px";
				win.style.position = "absolute";
				win.style.display = "block";
				win.style.backgroundColor = "green";
				win.style.bottom = "0px";
				win.style.right = "0px";
				win.style.zIndex = 999;
				window.document.body.appendChild(win);
			}
			ctx = win.getContext('2d');
			ctx.clearRect(0,0,300,300);
			ctx.drawImage(targetData, 0,0,300,300);
		};

		/**
		 * Broadcasts an event for debugging
		 * @memberof Arstider
		 * @type {function}
		 * @const
		 * @param {string} name The name of the event to call
		 * @param {*} param The parameters to provide the broadcast
		 * @param {*} target The target for broadcast
		 */
		Arstider.debugBroadcast = function(name, param, target){
			if(!singleton.debug) return;
			
			Events.broadcast(name, param, target);
		};
		
		singleton = new Engine();
		return singleton;
	});	
})();