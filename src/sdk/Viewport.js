;(function(){

	var 
		singleton = null,
		PORTRAIT = "portrait",
		LANDSCAPE = "landscape"
	;
	
	define( "Arstider/Viewport", ["Arstider/Browser"], function(Browser){
		if(singleton != null) return singleton;
		
		function Viewport(){
			this.tag = null;
			
			this.orientation = PORTRAIT;
				
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
			
			this._fullScreenRequested = false;
			this._requestFullscreenEvent = null;
			this._cancelFullscreenEvent = null;
			
			//Override me!
			this.onresize = Arstider.emptyFunction;
			this.onrotate = function(){console.log("New orientation:",singleton.orientation);};
		}
			
		Viewport.prototype.init = function(tag, canvas){
			this.container = document.getElementById(tag);
			if(this.container){
				this.container.appendChild(canvas);
				this.tag = canvas;
				
				this.container.style.position = "relative";
				this.container.style.display = "block";
				this.container.style.width = this.maxWidth + "px";
				this.container.style.height = this.maxHeight + "px";
				
				window.addEventListener("resize", this._resize);
				if(Browser.isMobile){
					window.addEventListener("orientationchange", this._rotate);
				}
				
				this._requestFullscreenEvent = (this.tag.requestFullScreen)?"requestFullScreen":(this.tag.mozRequestFullScreen)?"mozRequestFullScreen":(this.tag.webkitRequestFullScreenWithKeys)?"webkitRequestFullScreenWithKeys":(this.tag.webkitRequestFullScreen)?"webkitRequestFullScreen":"FullscreenError";
				this._cancelFullscreenEvent =  (window.document.cancelFullScreen)?"cancelFullScreen":(window.document.mozCancelFullScreen)?"mozCancelFullScreen":(window.document.webkitCancelFullScreen)?"webkitCancelFullScreen":"FullscreenError";
				
				this._resize();
			}
			else{
				console.error("Could not find element with id \"" + tag + "\"");
			}
		};
		
		Viewport.prototype._enterFullScreen = function(scale){
			
			this._fullScreenRequested = false;
			
			scale = Arstider.checkIn(scale, false);
		
			if(scale) this.tag.classList.add("fs_scaled_element");
			else this.tag.classList.remove("fs_scaled_element");
			
			console.log(this._requestFullscreenEvent);
			console.log(this.tag);
			
			return this.tag[this._requestFullscreenEvent]();
		};
		
		Viewport.prototype.enterFullScreen = function(scale){
			this._fullScreenRequested = true;
		};
		
		Viewport.prototype.quitFullScreen = function(){
			return window.document[this._cancelFullscreenEvent]();
		};
			
		Viewport.prototype._resize = function(e){
			var windowW = window.innerWidth;
			var windowH = window.innerHeight;
			var ratio = 1;
			var scaleX, scaleY;
			var posX, posY;
			
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
			
			singleton.onresize();
		};
		
		Viewport.prototype._rotate = function(e){
			if(window.orientation){
				if (window.orientation === -90 || window.orientation === 90) singleton.orientation = LANDSCAPE;
				else singleton.orientation = PORTRAIT;
			}
			else singleton.orientation = (window.innerHeight>window.innerWidth)?PORTRAIT:LANDSCAPE;
			
			singleton.onrotate();
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
			
			this.globalScale = num;
			this.maxWidth = this.maxWidth / num;
			this.maxHeight = this.maxHeight / num;
		};
			
		singleton = new Viewport();
		return singleton;
	});
})();