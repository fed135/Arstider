;(function(){

	var 
		singleton = null,
		PORTRAIT = "portrait",
		LANDSCAPE = "landscape"
	;
	
	define( "Arstider/Viewport", ["Arstider/Browser", "Arstider/Events"], function(Browser, Events){
		if(singleton != null) return singleton;
		
		function Viewport(){
			this.tag = null;
			
			this.orientation = null;
				
			this.canvasRatio = 1;
			
			this.xOffset = 0;
			this.yOffset = 0;
				
			this.visibleHeight = 0;
			this.visibleWidth = 0;
				
			this.globalScale = 1;	
			
			this.maxWidth = 1136;
			this.maxHeight = 672;
			this.minWidth = 960;
			this.minHeight = 536;
			
			this.container = null;
			
			this._requestFullscreenEvent = null;
			this._cancelFullscreenEvent = null;
		}
			
		Viewport.prototype.init = function(tag, canvas){
			this.container = document.getElementById(tag);
			if(this.container){
				this.container.appendChild(canvas);
				this.tag = canvas;
				
				this.container.style.position = "relative";
				this.container.style.display = "block";
				this.container.style.width = "100%";
				this.container.style.height = "100%";
				
				window.addEventListener("resize", this._resize);
				if(Browser.isMobile){
					window.addEventListener("orientationchange", this._rotate);
				}
				
				window.document.addEventListener("unload", this._unload);
				window.addEventListener('pagehide', this._pagehide);
				
				this.container.addEventListener("mousewheel", this._mouseWheel, false);
				this.container.addEventListener("DOMMouseScroll", this._mouseWheel, false);
				
				this._requestFullscreenEvent = (this.tag.requestFullScreen)?"requestFullScreen":(this.tag.mozRequestFullScreen)?"mozRequestFullScreen":(this.tag.webkitRequestFullScreenWithKeys)?"webkitRequestFullScreenWithKeys":(this.tag.webkitRequestFullScreen)?"webkitRequestFullScreen":"FullscreenError";
				this._cancelFullscreenEvent =  (window.document.cancelFullScreen)?"cancelFullScreen":(window.document.mozCancelFullScreen)?"mozCancelFullScreen":(window.document.webkitCancelFullScreen)?"webkitCancelFullScreen":"FullscreenError";
				
				this._resize();
				this._rotate();
			}
			else{
				if(Arstider.verbose > 0) console.warn("Arstider.Viewport.init: no DOM element specified, viewport broken");
			}
		};
		
		Viewport.prototype.enterFullScreen = function(scale){
			
			scale = Arstider.checkIn(scale, false);
		
			if(scale) this.tag.classList.add("fs_scaled_element");
			else this.tag.classList.remove("fs_scaled_element");
			
			var res = this.tag[this._requestFullscreenEvent]();
			
			Events.broadcast("Viewport.enterFullscreen", singleton);
			
			return res;
		};
		
		Viewport.prototype.quitFullScreen = function(){
			var res = window.document[this._cancelFullscreenEvent]();
			
			Events.broadcast("Viewport.quitFullscreen", singleton);
			
			return res;
		};
		
		Viewport.prototype._mouseWheel = function(e){
			var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
			Events.broadcast("Mouse.wheel", delta);
		};
			
		Viewport.prototype._resize = function(e){
			var windowW = window.innerWidth;
			var windowH = window.innerHeight;
			var ratio = 1;
			var scaleX, scaleY;
			var posX, posY;
			
			if(singleton.orientation != PORTRAIT){
				//Retina detection
				if( Browser.isMobile &&
				    windowW*2 >= singleton.minWidth &&
				    windowW*2 <= singleton.maxWidth &&
				    windowH*2 >= singleton.minHeight &&
				    windowH*2 <= singleton.maxHeight
				){
					ratio = 0.5;
				} else {	
					scaleX = windowW / singleton.minWidth;
					scaleY = windowH / singleton.minHeight;
					ratio = Math.min(scaleX,scaleY);
					ratio = Math.min(1,ratio);
				}
					
				scaleX = Math.round(singleton.maxWidth*ratio);
				scaleY = Math.round(singleton.maxHeight*ratio);
				
				posX = Math.round( (windowW - scaleX) * 0.5 );
				posY = Math.round( (windowH - scaleY) * 0.5 );
				
				singleton.xOffset = posX;
				singleton.yOffset = posY;
				
				singleton.tag.style.left = posX+"px";
				singleton.tag.style.top = posY+"px";
				singleton.tag.style.width = scaleX+"px";
				singleton.tag.style.height = scaleY+"px";
				singleton.tag.style.position = "absolute";
				singleton.tag.width = singleton.maxWidth;
				singleton.tag.height = singleton.maxHeight;
				
				singleton.canvasRatio = ratio;
				singleton.visibleWidth = Math.round(windowW / ratio);
				singleton.visibleHeight = Math.round(windowH / ratio);
				singleton.visibleWidth = Math.min(singleton.visibleWidth, singleton.maxWidth);
				singleton.visibleHeight = Math.min(singleton.visibleHeight, singleton.maxHeight);
			}
			
			Events.broadcast("Viewport.resize", singleton);
		};
		
		Viewport.prototype._rotate = function(e){
			if(window.orientation){
				if (window.orientation === -90 || window.orientation === 90) singleton.orientation = LANDSCAPE;
				else singleton.orientation = PORTRAIT;
			}
			else singleton.orientation = (window.innerHeight>window.innerWidth)?PORTRAIT:LANDSCAPE;
			
			Events.broadcast("Viewport.rotate", singleton);
		};
		
		Viewport.prototype._unload = function(e){
			Events.broadcast("Viewport.unload", singleton);
		};
		
		Viewport.prototype._pagehide = function(e){
			Events.broadcast("Viewport.pagehide", singleton);
		};
		
		Viewport.prototype.removeDecorations = function(target){
			target = target || window;
			if(target.locationbar) target.locationbar.visible=false;
			if(target.menubar) target.menubar.visible=false;
			if(target.personalbar) target.personalbar.visible=false;
			if(target.scrollbars) target.scrollbars.visible=false;
			if(target.statusbar) target.statusbar.visible=false;
			if(target.toolbar) target.toolbar.visible=false;
		};
		
		Viewport.prototype.setGlobalScale = function(num){		
			var numRevert = 1/this.globalScale;
			this.maxWidth = this.maxWidth / numRevert;
			this.maxHeight = this.maxHeight / numRevert;
			this.visibleWidth = this.visibleWidth / numRevert;
			this.visibleHeight = this.visibleHeight / numRevert;
			
			this.globalScale = num;
			this.maxWidth = this.maxWidth / num;
			this.maxHeight = this.maxHeight / num;
			this.visibleWidth = this.visibleWidth / num;
			this.visibleHeight = this.visibleHeight / num;
			
			Events.broadcast("Viewport.globalScaleChange", num);
		};
			
		singleton = new Viewport();
		return singleton;
	});
})();