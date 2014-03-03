;(function(){

	var singleton = null;
	
	define( "Arstider/Viewport", [], function(){
		if(singleton != null) return singleton;
		
		function Viewport(){
			this.tag = null;
			
			this.orientation = "portrait";
				
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
			
			//Override me!
			this.onresize = function(){};
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
				
				this.container.addEventListener("resize", this._resize);
				
				this._requestFullscreenEvent = (this.tag.requestFullScreen)?"requestFullScreen":(this.tag.mozRequestFullScreen)?"mozRequestFullScreen":(this.tag.webkitRequestFullScreenWithKeys)?"webkitRequestFullScreenWithKeys":(this.tag.webkitRequestFullScreen)?"webkitRequestFullScreen":"FullscreenError";
				this._cancelFullscreenEvent =  (window.document.cancelFullScreen)?"cancelFullScreen":(window.document.mozCancelFullScreen)?"mozCancelFullScreen":(window.document.webkitCancelFullScreen)?"webkitCancelFullScreen":"FullscreenError";
			}
			else{
				console.error("Could not find element with id \"" + tag + "\"");
			}
		};
		
		Viewport.prototype.enterFullScreen = function(scale){
			scale = scale || false;
		
			if(scale) this.tag.classList.add("fs_scaled_element");
			else this.tag.classList.remove("fs_scaled_element");
			
			return this.tag[this._requestFullscreenEvent]();
		};
		
		Viewport.prototype.quitFullScreen = function(){
			return window.document[this._cancelFullscreenEvent]();
		};
			
		Viewport.prototype._resize = function(){
			console.log(singleton.container.innerWidth, ",", singleton.container.innerHeight);
			
			singleton.resize();
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