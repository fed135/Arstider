/**
 * Viewport. 
 *
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */
	
 ;(function(){

	var 
		/**
		 * Singleton static
		 * @private
		 * @type {Viewport|null}
		 */
		singleton = null,
		/**
		 * Portrait orientation static
		 * @private
		 * @const
		 * @type {string}
		 */
		PORTRAIT = "portrait",
		/**
		 * Landscape orientation static
		 * @private
		 * @const
		 * @type {string}
		 */
		LANDSCAPE = "landscape"
	;
	
	/**
	 * Defines the Viewport module
	 */	
	define( "Arstider/Viewport", ["Arstider/Browser", "Arstider/Events"], function(Browser, Events){
		
		if(singleton != null) return singleton;
		
		/**
		 * Viewport constructor
		 * @constructor
		 */
		function Viewport(){
			/**
			 * The main canvas html tag element
			 * @type {HTMLCanvasElement|null}
			 */
			this.tag = null;
			/**
			 * Current device orientation
			 * @type {string|null}
			 */
			this.orientation = null;
			/**
			 * Current canvas scale ratio (automatically scales on smaller resolution devices)
			 * @type {number}
			 */
			this.canvasRatio = 1;
			
			/**
			 * Canvas left offset in the parent in pixel (automatically centers in the window)
			 * @type {number}
			 */
			this.xOffset = 0;
			/**
			 * Canvas left offset in the parent in pixel (automatically centers in the window)
			 * @type {number}
			 */
			this.yOffset = 0;
			/**
			 * Canvas visible height (not cut-off by frame's smaller resolution)
			 * @type {number}
			 */
			this.visibleHeight = 0;
			/**
			 * Canvas visible width (not cut-off by frame's smaller resolution)
			 * @type {number}
			 */
			this.visibleWidth = 0;
			
			/**
			 * Game global scale (usefull for pixel-art style games) 
			 * @type {number}
			 */
			this.globalScale = 1;	
			
			/**
			 * Maximum visible width
			 * @type {number}
			 */
			this.maxWidth = 1136;
			/**
			 * Maximum visible height
			 * @type {number}
			 */
			this.maxHeight = 672;
			/**
			 * Minimum visible width
			 * @type {number}
			 */
			this.minWidth = 960;
			/**
			 * Minimum visible height
			 * @type {number}
			 */
			this.minHeight = 536;
			
			/**
			 * Main canvas tag parent node
			 * @type {HTMLDivElement}
			 */
			this.container = null;
			
			/**
			 * Vendor prefixed fullscreen event name
			 * @type {string|null}
			 */
			this._requestFullscreenEvent = null;
			/**
			 * Vendor prefixed fullscreen event name
			 * @type {string|null}
			 */
			this._cancelFullscreenEvent = null;
		}
		
		/**
		 * Initializes the main canvas tag, adds the listeners and repositions the game in it's container
		 * @type {function(this:Viewport)}
		 * @param {string} tag The tag id in which to initialize the engine
		 * @param {Buffer} canvas The Buffer object to append to the tag
		 */
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
				
				this._requestFullscreenEvent = (this.tag.requestFullScreen)?"requestFullScreen":(this.tag.mozRequestFullScreen)?"mozRequestFullScreen":(this.tag.webkitRequestFullScreenWithKeys)?"webkitRequestFullScreenWithKeys":(this.tag.webkitRequestFullScreen)?"webkitRequestFullScreen":"FullscreenError";
				this._cancelFullscreenEvent =  (window.document.cancelFullScreen)?"cancelFullScreen":(window.document.mozCancelFullScreen)?"mozCancelFullScreen":(window.document.webkitCancelFullScreen)?"webkitCancelFullScreen":"FullscreenError";
				
				this._resize();
				this._rotate();
			}
			else{
				if(Arstider.verbose > 0) console.warn("Arstider.Viewport.init: no DOM element specified, viewport broken");
			}
		};
		
		/**
		 * Enters the fullscreen mode
		 * @type {function(this:Viewport)}
		 * @param {boolean|null} scale Whether to scale the game or not
		 * @return {?=} The result of the fullscreen request
		 */
		Viewport.prototype.enterFullScreen = function(scale){
			
			scale = Arstider.checkIn(scale, false);
		
			if(scale) this.tag.classList.add("fs_scaled_element");
			else this.tag.classList.remove("fs_scaled_element");
			
			var res = this.tag[this._requestFullscreenEvent]();
			
			Events.broadcast("Viewport.enterFullscreen", singleton);
			
			return res;
		};
		
		/**
		 * Leaves the fullscreen mode
		 * @type {function(this:Viewport)}
		 * @return {?=} The result of the fullscreen request
		 */
		Viewport.prototype.quitFullScreen = function(){
			var res = window.document[this._cancelFullscreenEvent]();
			
			Events.broadcast("Viewport.quitFullscreen", singleton);
			
			return res;
		};
		
		/**
		 * Internal handler for container resize
		 * @private
		 * @type {function(this:Viewport)}
		 * @param {event} e Event from the browser
		 */
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
		
		/**
		 * Internal handler for container orientation change
		 * @private
		 * @type {function(this:Viewport)}
		 * @param {event} e Event from the browser
		 */
		Viewport.prototype._rotate = function(e){
			if(window.orientation){
				if (window.orientation === -90 || window.orientation === 90) singleton.orientation = LANDSCAPE;
				else singleton.orientation = PORTRAIT;
			}
			else singleton.orientation = (window.innerHeight>window.innerWidth)?PORTRAIT:LANDSCAPE;
			
			Events.broadcast("Viewport.rotate", singleton);
		};
		
		/**
		 * Internal handler for container unload
		 * @private
		 * @type {function(this:Viewport)}
		 * @param {event} e Event from the browser
		 */
		Viewport.prototype._unload = function(e){
			Events.broadcast("Viewport.unload", singleton);
		};
		
		/**
		 * Internal handler for container pagehide (mobile process kill or put in idle mode)
		 * @private
		 * @type {function(this:Viewport)}
		 * @param {event} e Event from the browser
		 */
		Viewport.prototype._pagehide = function(e){
			Events.broadcast("Viewport.pagehide", singleton);
		};
		
		/**
		 * Removes browser decorations and extra tabs ***see platform limitations***
		 * @type {function(this:Viewport)}
		 * @param {?=} target Optional window type element to remove browser decorations from 
		 */
		Viewport.prototype.removeDecorations = function(target){
			target = target || window;
			if(target.locationbar) target.locationbar.visible=false;
			if(target.menubar) target.menubar.visible=false;
			if(target.personalbar) target.personalbar.visible=false;
			if(target.scrollbars) target.scrollbars.visible=false;
			if(target.statusbar) target.statusbar.visible=false;
			if(target.toolbar) target.toolbar.visible=false;
		};
		
		/**
		 * Updates the game's global scale
		 * @type {function(this:Viewport)}
		 * @param {number} num The new global scale of the game
		 */
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