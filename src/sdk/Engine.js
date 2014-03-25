/**
 * Engine Wrapper. 
 * 
 * Provides common private variables and methods for the Engine as well as
 * AMD Closure and prototypes.
 *
 * @author frederic charette <fredc@meetfidel.com>
 */
;(function(){
	
	var singleton = null;
	
	define( "Arstider/Engine", [
		"Arstider/Buffer", 
		"Arstider/DisplayObject",
		"Arstider/Events",
		"Arstider/Background",
		"Arstider/Preloader",
		"Arstider/GlobalTimers",
		"Arstider/core/Performance",
		"Arstider/Debugger",
		"Arstider/Mouse",
		"Arstider/Browser",
		"Arstider/Viewport",
		"Arstider/core/Renderer"
	], function (Buffer, DisplayObject, Events, Background, Preloader, GlobalTimers, Performance, Debugger, Mouse, Browser, Viewport, Renderer){
		
		if(singleton != null) return singleton;
			
		function Engine(){
			this.name = "Arstider";
			this.version = "@version@";
			
			this.debug = true;
			this.allowSkip = true;
				
			this.canvas = null;
			this.context = null;
			
			this.frameRequest = null;
				
			this.profiler = null;
				
			this.currentScreen = null;
			
			this.handbreak = false;
			
			this._savedScreen = null;
			
			this.onerror = Arstider.emptyFunction;
		}
			
		Engine.prototype.start = function(tag){
			if(this.debug){
				this.profiler = new Debugger(this);
				this.profiler.init();
			}
				
			this.canvas = Buffer.create("Arstider_main");
			this.canvas.id = tag+"_canvas";
			this.context = this.canvas.getContext("2d");
			
			Performance.updateLogic = this.stepLogic;
			
			window.addEventListener("error", this._handleError);
				
			Viewport.init(tag, this.canvas);
			
			Events.bind("gotoScreen", this.loadScreen);
			Events.bind("showPopup", this.showPopup);
			Events.bind("hidePopup", this.hidePopup);
			Events.bind("loadingCompleted", this.startMenu);
			
			this.play();
		};
		
		Engine.prototype.stepLogic = function(){
			if(singleton === null) return;
			
			//Check if canvas rendering is on/off
			if(singleton.handbreak) return;
			
			GlobalTimers.step();
			if(singleton.currentScreen && singleton.currentScreen._update) singleton.currentScreen._update();
		};
		
		Engine.prototype._handleError = function(e){
			//Private Error behavior
			//...
			
			//User-defined Error behavior
			singleton.onerror(e);
		};
			
		Engine.prototype.startMenu = function(){
			if(singleton.currentScreen){
				if(singleton.currentScreen.onload && singleton.currentScreen.loaded === false){
					singleton.currentScreen.loaded = true;
					singleton.currentScreen.onload();
				}
				singleton.canvas.focus();
				singleton.play();
			}
		};
			
		Engine.prototype.loadScreen = function(name){
			singleton.stop();
			Preloader.set(name);
			Preloader.progress("__screen__", 0);
				
			require(["screens/"+name], function(_menu){
				singleton.killScreen();
				
				singleton.currentScreen = new _menu(name);
				singleton.currentScreen.stage = singleton;
				singleton.currentScreen.scaleX = singleton.currentScreen.scaleY = Viewport.globalScale;
				setTimeout(function(){
					Preloader.progress("__screen__", 100);
				},100);
			});
		};
			
		Engine.prototype.killScreen = function(){
			if(singleton.currentScreen != null){
				if(singleton.currentScreen.onunload) singleton.currentScreen.onunload();
				singleton.currentScreen.removeChildren();
				delete singleton.currentScreen;
			}
		};
			
		Engine.prototype.showPopup = function(name){
			singleton.stop();
				
			if(singleton.currentScreen.onpopup) singleton.currentScreen.onpopup(name);
					
			singleton._savedScreen = singleton.currentScreen;
			singleton.currentScreen = null;
				
			require(["screens/"+name], function(_menu){
				singleton.currentScreen = new _menu();
				singleton.currentScreen.stage = singleton;
				singleton.currentScreen.scaleX = singleton.currentScreen.scaleY = Viewport.globalScale;
				singleton.currentScreen.origin = singleton._savedScreen;
				singleton.play();
				if(singleton.currentScreen.onload) singleton.currentScreen.onload();
			});
		};
			
		Engine.prototype.hidePopup = function(){
			singleton.killScreen();
				
			singleton.currentScreen = singleton._savedScreen;
				
			if(singleton.currentScreen.onresume) singleton.currentScreen.onresume();
		};
			
		Engine.prototype.play = function(){
			singleton.handbreak = false;
			singleton.draw();
		};
			
		Engine.prototype.stop = function(){
			Mouse.reset();
			singleton.handbreak = true;
		};
			
		Engine.prototype.draw = function(){
			//Declare vars
			var 
				mouseX = Mouse.x(0),
				mouseY = Mouse.y(0),
				showFrames = false
			;
			
			//Immediately request the next frame
			if(singleton.frameRequest) Arstider.cancelAnimFrame.apply(window, [singleton.frameRequest]);
			singleton.frameRequest = Arstider.requestAnimFrame.apply(window, [singleton.draw]);
			
			//Check if canvas rendering is on/off
			if(singleton.handbreak){
				if(Preloader.queue.length > 0){
					Background.render(singleton.context);
					Preloader.width = Viewport.maxWidth;
					Preloader.height = Viewport.maxHeight;
					Preloader.cancelBubble();
					Preloader._update();
					Renderer.draw(singleton, Preloader, null, null, false);
				}
				return;
			}
			
			Performance.startStep(singleton.allowSkip);
			
			if(Performance.getStatus() === 0){
				Performance.endStep();
				return;	
			}
				
			if(singleton.profiler) showFrames = singleton.profiler.showFrames;
			
			Background.render(singleton.context);
			
			//Run through the elements and draw them at their global x and y with their global width and height
			Renderer.draw(singleton, singleton.currentScreen, function(e){
				if(e.isTouched(mouseX, mouseY)){
					if(Mouse.pressed){
						if(!e._pressed) e._onpress();
					}
					else{
						if(e._pressed) e._onrelease();
						if(!e._hovered) e._onhover();
					}
				}
				else{
					if(e._hovered) e._onleave();
				}
			}, null, showFrames);
				
			Mouse.step();
				
			if(showFrames) singleton.profiler.drawFrames();
				
			Performance.endStep();
		};
		
		singleton = new Engine();
		return singleton;
	});	
})();