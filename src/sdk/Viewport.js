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
	define( "Arstider/Viewport", ["Arstider/Browser", "Arstider/Events"], /** @lends Viewport */ function(Browser, Events){
		
		if(singleton != null) return singleton;
		
		/**
		 * Viewport constructor
		 * Handles screen size, orientation and features
		 * @class Viewport
		 * @constructor
		 */
		function Viewport(){
			/**
			 * The main canvas html tag element
			 * @type {HTMLCanvasElement|null}
			 */
			this.layers = [];
			/**
			 * Layer Wrapper
			 * @type {HTMLDivElement}
			 */
			this.wrapper = null;

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
			
			/**
			 * Indicates if geolocation feature is enabled or null if untested (displays prompt to user)
			 * @type {boolean|null}
			 */
			this.geolocationEnabled = false;
			
			/**
			 * Cached latest geolocation object
			 * @private
			 * @type {Object}
			 */
			this._geoloc = null;
			
			/**
			 * Indicates if vibration feature is enabled
			 * @type {boolean}
			 */
			this.vibrationEnabled = false;
			
			/**
			 * Indicates if accelerometer feature is enabled
			 * @type {boolean}
			 */
			this.accelerometerEnabled = false;
			
			/**
			 * Current device tilt Object
			 * @private
			 * @type {Object}
			 */
			this._tilt = {x:0,y:0,z:0};
			
			/**
			 * If current orientation is valid
			 * @type {boolean}
			 */
			this.unsupportedOrientation = false;
			
			/**
			 * Tests features
			 */
			setTimeout(this.vibrate,0);
		}
		
		/**
		 * Initializes the main canvas tag, adds the listeners and repositions the game in it's container
		 * @type {function(this:Viewport)}
		 * @param {string} tag The tag id in which to initialize the engine
		 * @param {Buffer} canvas The Buffer object to append to the tag
		 */
		Viewport.prototype.init = function(tag){
			var thisRef = this;
			
			if(tag.appendChild) this.container = tag;
			else this.container = window.document.getElementById(tag);
			if(this.container){
				this.container.style.position = "relative";
				this.container.style.display = "block";
				this.container.style.width = "100%";
				this.container.style.height = "100%";

				this.wrapper = document.createElement("div");
				this.wrapper.style.overflow = "hidden";
				this.container.appendChild(this.wrapper);
				
				window.addEventListener("resize", this._resize);
				if(Browser.isMobile){
					window.addEventListener("orientationchange", this._rotate);
				}
				
				window.onbeforeunload = this._unload;
				window.addEventListener('pagehide', this._pagehide);

				var hidden, visibilityChange;
				/*if(Browser.platform == "android"){
					hidden = "body";
					visibilitychange = "blur";
				}
				else{*/
					if (typeof window.document.hidden !== "undefined"){
						hidden = "hidden";
						visibilityChange = "visibilitychange";
					} else if (typeof window.document.mozHidden !== "undefined"){
						hidden = "mozHidden";
						visibilityChange = "mozvisibilitychange";
					} else if (typeof window.document.msHidden !== "undefined"){
						hidden = "msHidden";
						visibilityChange = "msvisibilitychange";
					} else if (typeof window.document.webkitHidden !== "undefined"){
						hidden = "webkitHidden";
						visibilityChange = "webkitvisibilitychange";
					}
					else{
						hidden = "body";
						visibilitychange = "blur";
					}
				//}

				//Safari doesn't support page visibility properly when switching apps.
				//We have to resort to this primitive check
				if(Browser.name == "safari" && Browser.isMobile){
					(function(){
						var now, lastFired = Arstider.timestamp();
						setInterval(function() {
						    now = Arstider.timestamp();
						    if(now - lastFired > 120){	//lowest value
						        singleton._pageshow();
						    }
						    lastFired = now;
						}, 50);
					})();
				}
				else{
					window.addEventListener('focus', this._pageshow);
				}

				window.document.addEventListener(visibilityChange, function(){
					if(window.document[hidden]) thisRef._pagehide();
					else thisRef._pageshow();
				});
				
				this._requestFullscreenEvent = (this.container.requestFullScreen)?"requestFullScreen":(this.container.mozRequestFullScreen)?"mozRequestFullScreen":(this.container.webkitRequestFullScreenWithKeys)?"webkitRequestFullScreenWithKeys":(this.container.webkitRequestFullScreen)?"webkitRequestFullScreen":"FullscreenError";
				this._cancelFullscreenEvent =  (window.document.cancelFullScreen)?"cancelFullScreen":(window.document.mozCancelFullScreen)?"mozCancelFullScreen":(window.document.webkitCancelFullScreen)?"webkitCancelFullScreen":"FullscreenError";
				
				
				window.ondevicemotion = function(event) {
					event = event || window.event;
					if(event.accelerationIncludingGravity.x == null || event.accelerationIncludingGravity.y == null || event.accelerationIncludingGravity.z == null) return;
					
					thisRef.accelerometerEnabled = true;
				    thisRef._tilt.x = event.accelerationIncludingGravity.x;  
				    thisRef._tilt.y = event.accelerationIncludingGravity.y;  
				    thisRef._tilt.z = event.accelerationIncludingGravity.z;  
				};
				
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
		 * @return {*} The result of the fullscreen request
		 */
		Viewport.prototype.enterFullScreen = function(scale){
			
			scale = Arstider.checkIn(scale, false);
		
			if(scale) this.container.classList.add("fs_scaled_element");
			else this.container.classList.remove("fs_scaled_element");
			
			var res = this.container[this._requestFullscreenEvent]();
			
			Events.broadcast("Viewport.enterFullscreen", singleton);
			
			return res;
		};
		
		/**
		 * Leaves the fullscreen mode
		 * @type {function(this:Viewport)}
		 * @return {*} The result of the fullscreen request
		 */
		Viewport.prototype.quitFullScreen = function(){
			var res = window.document[this._cancelFullscreenEvent]();
			
			Events.broadcast("Viewport.quitFullscreen", singleton);
			
			return res;
		};

		Viewport.prototype.addLayer = function(layer){
			if(singleton.layers.indexOf(layer) == -1){
				singleton.layers.push(layer);
				singleton.wrapper.appendChild(layer.wrapper._tag);
				singleton._positionLayer(layer, singleton.canvasRatio);
			}
		};

		Viewport.prototype.removeLayer = function(layer){
			var index = singleton.layers.indexOf(layer)
			if(index != -1){
				singleton.layers.splice(index, 1);
			}
		};
		
		/**
		 * Internal handler for container resize
		 * @private
		 * @type {function(this:Viewport)}
		 * @param {event} e Event from the browser
		 */
		Viewport.prototype._resize = function(e){
			if(Browser.isMobile){
				singleton._rotate();

				if(singleton.orientation == LANDSCAPE){
					window.document.body.style.width = window.innerWidth + "px";
					window.document.body.style.height = window.innerHeight +"px";
				}
				else{
					window.document.body.style.height = window.innerWidth + "px";
					window.document.body.style.width = window.innerHeight +"px";
				}
			}

			var 
				windowW,
				windowH,
				ratio = 1,
				scaleX, 
				scaleY,
				posX, 
				posY,
				style = window.getComputedStyle(singleton.container, null),
				i = 0
			;

			if(singleton.orientation == LANDSCAPE){
				windowW = parseInt(style.getPropertyValue("width"));
				windowH = parseInt(style.getPropertyValue("height"));
			}
			else if(singleton.orientation == PORTRAIT){
				windowW = parseInt(style.getPropertyValue("height"));
				windowH = parseInt(style.getPropertyValue("width"));
			}
			else return;
			
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
				
			singleton.wrapper.style.left = posX+"px";
			singleton.wrapper.style.top = posY+"px";
			singleton.wrapper.style.width = scaleX+"px";
			singleton.wrapper.style.height = scaleY+"px";
			singleton.wrapper.style.position = "absolute";
			singleton.wrapper.width = singleton.maxWidth;
			singleton.wrapper.height = singleton.maxHeight;
			
			singleton.canvasRatio = ratio;
			singleton.visibleWidth = Math.round(windowW / ratio);
			singleton.visibleHeight = Math.round(windowH / ratio);
			singleton.visibleWidth = Math.min(singleton.visibleWidth, singleton.maxWidth)/singleton.globalScale;
			singleton.visibleHeight = Math.min(singleton.visibleHeight, singleton.maxHeight)/singleton.globalScale;

			for(i; i<singleton.layers.length; i++){
				singleton._positionLayer(singleton.layers[i], ratio);
			}
                        
			Events.broadcast("Viewport.resize", singleton);
                        
			if(Browser.isMobile) window.document.body.scrollTop=0;
		};

		Viewport.prototype._positionLayer = function(layer, ratio){
			layer.wrapper._tag.style.left = (layer.x * ratio) +"px";
			layer.wrapper._tag.style.top = (layer.y * ratio) +"px";
			layer.wrapper._tag.style.width = layer.canvas.data.style.width = (layer.width * ratio) +"px";
			layer.wrapper._tag.style.height = layer.canvas.data.style.height = (layer.height * ratio) +"px";
			layer.wrapper._tag.style.position = "absolute";
		};
		
		/**
		 * Internal handler for container orientation change
		 * @private
		 * @type {function(this:Viewport)}
		 * @param {event} e Event from the browser
		 */
		Viewport.prototype._rotate = function(e){
			var prevOrientation = singleton.orientation;

			if(Browser.isMobile)
				singleton.orientation = (window.innerHeight>window.innerWidth)?PORTRAIT:LANDSCAPE;
			else
				singleton.orientation = LANDSCAPE;
			
			if(singleton.orientation != prevOrientation){
				Events.broadcast("Viewport.rotate", singleton);
			}
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
		 * Internal handler for container pagehide (process kill or put in idle mode)
		 * @private
		 * @type {function(this:Viewport)}
		 * @param {event} e Event from the browser
		 */
		Viewport.prototype._pagehide = function(e){
			Arstider.pageHidden = true;
			Events.broadcast("Viewport.pagehide", singleton);
		};

		/**
		 * Internal handler for container pageshow (process resume)
		 * @private
		 * @type {function(this:Viewport)}
		 * @param {event} e Event from the browser
		 */
		Viewport.prototype._pageshow = function(e){
			Arstider.pageHidden = false;
			Events.broadcast("Viewport.pageshow", singleton);
		};
		
		/**
		 * Returns the geolocation object
		 * @type {function(this:Viewport)}
		 * @param {function} callback The method to call once the geolocation object has returned
		 */
		Viewport.prototype.getGeolocation = function(callback){
			if(this._geoloc == null){
				this.updateGeolocation(callback);
			}
			else callback(this._geoloc);
		};
		
		/**
		 * Updates the geolocation object
		 * @type {function(this:Viewport)}
		 * @param {function} callback The method to call once the geolocation object has returned
		 */
		Viewport.prototype.updateGeolocation = function(callback){
			var thisRef = this;
			if(navigator.geolocation){
				this.geolocationEnabled = true;
				try{
					navigator.geolocation.getCurrentPosition(function(p){
						thisRef._geoloc = p;
						if(callback) callback(thisRef._geoloc);
					});
				}
				catch(e){
					this.geolocationEnabled = false;
					this._geoloc = {};
					if(Arstider.verbose > 0) console.warn("Arstider.Viewport.updateGeolocation: ", e);
				}
			}
			else{
				this.geolocationEnabled = false;
				this._geoloc = {};
				if(callback) callback(this._geoloc);
			}
		};
		
		/**
		 * Attempts to vibrate the device 
		 * @type {function(this:Viewport)}
		 * @param {Array} param The vibration pattern, as if calling the API 
		 */
		Viewport.prototype.vibrate = function(param){
			param = param || 0;
			var vibrate = window.navigator.vibrate || window.navigator.webkitVibrate || window.navigator.mozVibrate || window.navigator.msVibrate;
			
			if(Browser.isMobile){
				if(vibrate){
					try{
						vibrate(0);
						vibrate(param);
					}
					catch(e){
						if(Arstider.verbose > 0) console.warn("Arstider.Browser.vibrate: error while trying to vibrate API may be broken");
					}
				}
				else{
					if(Arstider.verbose > 1) console.warn("Arstider.Browser.vibrate: feature not supported");
				}
			}
			else{
				if(Arstider.verbose > 2) console.warn("Arstider.Browser.vibrate: feature not supported");
			}
		};
		
		/**
		 * Gets the current tilt of the device via the accelerometer
		 * @type {function(this:Viewport)}
		 * @return {Object} The current tilt {x:,y:,z:}
		 */
		Viewport.prototype.getDeviceTilt = function(){
			return this._tilt;
		};
		
		/**
		 * Removes browser decorations and extra tabs ***see platform limitations***
		 * @type {function(this:Viewport)}
		 * @param {*} target Optional window type element to remove browser decorations from 
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
			this.visibleWidth = this.visibleWidth / numRevert;
			this.visibleHeight = this.visibleHeight / numRevert;
			
			this.globalScale = num;
			this.visibleWidth = this.visibleWidth / num;
			this.visibleHeight = this.visibleHeight / num;
			
			Events.broadcast("Viewport.globalScaleChange", num);
		};

		/**
		 * Updates the game's viewport size
		 * @type {function(this:Viewport)}
		 * @param {number} minWidth The new minimum width
		 * @param {number} maxWidth The new maximum width
		 * @param {number} minHeight The new minimum height
		 * @param {number} maxHeight The new maximum height
		 */
		Viewport.prototype.changeResolution = function(minWidth, maxWidth, minHeight, maxHeight){
			this.maxWidth = maxWidth;
			this.maxHeight = maxHeight;
			this.minWidth = minWidth || 0;
			this.minHeight = minHeight || 0;
			this._resize();
		};
			
		singleton = new Viewport();
		return singleton;
	});
})();