/**
 * Mouse
 * 
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */

;(function(){
	
	var 
		/**
		 * Singleton static
		 * @private
		 * @type {Mouse|null}
		 */
		singleton = null
	;
	
	/**
	 * Defines the Mouse module
	 */
	define( "Arstider/Mouse", ["Arstider/Browser", "Arstider/Viewport", "Arstider/Events"], /** @lends Mouse */ function (Browser, Viewport, Events){
			
		if(singleton != null) return singleton;
		
		/**
		 * Copies a touch event
		 * @private
		 * @type {function}
		 * @param {Object} touch The touch event object
		 * @return {Object} The simplified copy of the event object
		 */
		function copyTouch(touch, state){
			return {
				id:Arstider.checkIn(touch.identifier, -1), 
				x:((touch.clientX - Viewport.xOffset) / Viewport.canvasRatio) / Viewport.globalScale,
				y:((touch.clientY - Viewport.yOffset) / Viewport.canvasRatio) / Viewport.globalScale,
				pressed:Arstider.checkIn(state, true)
			};
		}

		/**
		 * Mouse constructor
		 * A mouse events mapper
		 * @class Mouse 
		 * @constructor
		 */
		function Mouse(){
			/**
			 * Whether the mouse is pressed/finger[0] is down
			 * @type {boolean}
			 */
			this.pressed = false;
			/**
			 * Whether the mouse right click button is pressed (desktop only)
			 * @type {boolean}
			 */
			this.rightPressed = false;
			
			/**
			 * Mouse position raw (desktop) ***Use the Mouse.x() and Mouse.y() methods for cross-platform final result***
			 * @private
			 * @type {Object}
			 */
			this._mouse = {x:0,y:0};

			/**
			 * Overriden by the engine. Called on input to keep the event chain
			 * @type {function}
			 */
			this._touchRelay = Arstider.emptyFunction;

			/**
			 * Keeps track of the touches in progress
			 * @private
			 * @type {Array}
			 */
			this._ongoingTouches = [];

			/**
			 * Current gestures to step on touchmove
			 * @private
			 * @type {Array}
			 */
			this._currentGestures = [];
		}

		/**
		 * Setups the event listeners on the provided DOM Element
		 * @type {function(this:Mouse)}
		 * @param {Object} div The DOM element object
		 */
		Mouse.prototype.init = function(div){
			if(div){
				if(Browser.isMobile){
					window.addEventListener('touchmove', this._handleTouchMove);
					window.addEventListener('touchstart',  this._handleTouchStart, false);			
					window.addEventListener('touchend',  this._handleTouchEnd,false);
					window.addEventListener('touchcancel', this._handleTouchEnd, false);
					window.addEventListener('touchleave', this._handleTouchEnd, false);
				}
				else{
					div.addEventListener('mouseup', this._handleMouseUp,false);
					div.addEventListener('mousedown', this._handleMouseDown,false);
					div.addEventListener('mousemove',  this._handleMouseMove);
					div.addEventListener('mouseleave',  this._handleMouseUp,false);
					div.addEventListener("mousewheel", this._mouseWheel, false);
					div.addEventListener("DOMMouseScroll", this._mouseWheel, false);
				}
			}
			else{
				if(Arstider.verbose > 0) console.warn("Arstider.Mouse: no Viewport tag, cannot bind mouse events");
			}
		};
		
		/**
		 * Resets mouse values
		 * @type {function(this:Mouse)}
		 */
		Mouse.prototype.reset = function(){
			singleton._ongoingTouches = [];
			singleton.pressed = false;
			singleton.rightPressed = false;
			singleton._mouse.x = 0;
			singleton._mouse.y = 0;
		};
		
		/**
		 * Returns the x location of the mouse/current touch input
		 * @type {function(this:Mouse)}
		 * @param {number|null} input Optional touch id
		 * @return {number}
		 */
		Mouse.prototype.x = function(input){
			input = input || 0;
			
			if(Browser.isMobile){
				if(singleton._ongoingTouches[input] != undefined) return parseInt(singleton._ongoingTouches[input].x);
				else return -1;
			}
			else return parseInt(singleton._mouse.x);
		};
		
		/**
		 * Returns the y location of the mouse/current touch input
		 * @type {function(this:Mouse)}
		 * @param {number|null} input Optional touch id
		 * @return {number}
		 */
		Mouse.prototype.y = function(input){
			input = input || 0;
		
			if(Browser.isMobile){
				if(singleton._ongoingTouches[input] != undefined) return parseInt(singleton._ongoingTouches[input].y);
				else return -1;
			}
			else return parseInt(singleton._mouse.y);
		};

		/**
		 * Returns the pressed state of the mouse/current touch input
		 * @type {function(this:Mouse)}
		 * @param {number|string|null} input Optional touch id/ or "left"/"right" on desktop
		 * @return {boolean}
		 */
		Mouse.prototype.isPressed = function(input){
			input = input || 0;
		
			if(Browser.isMobile){
				if(singleton._ongoingTouches[input] != undefined) return singleton._ongoingTouches[input].pressed;
				else return false;
			}
			else{
				if(input == "right") return singleton.rightPressed;
				else return singleton.pressed;
			} 
		};

		/**
		 * Returns the number of touch inputs
		 * @type {function(this:Mouse)}
		 * @return {number} The number of inputs
		 */
		Mouse.prototype.count = function(includeReleased){
			if(includeReleased) return singleton._ongoingTouches.length;

			var i = 0;
			for(i; i<singleton._ongoingTouches.length; i++){
				if(!singleton._ongoingTouches[i].pressed) break;
			}
			return i;
		};
		
		/**
		 * Internal handler for touch input movement
		 * @private
		 * @type {function(this:Mouse)}
		 * @param {event} event The touch event from the browser
		 */
		Mouse.prototype._handleTouchMove = function(event){
			e = event || window.event;
			e.preventDefault();
			
			var i, idx = -1, touches = e.changedTouches, prevState;

  			for(i=0; i<touches.length; i++){
  				idx = singleton.getIndexFromId(touches[i].identifier);
  				if(idx >= 0){
  					prevState = singleton._ongoingTouches[idx].pressed;
  					singleton._ongoingTouches.splice(idx, 1, copyTouch(touches[i], prevState));
  				}
  				else{
  					if(Arstider.verbose > 2) console.warn("Arstider.Mouse.handleTouchMove: could not resolve input id ",idx);
  				}
  			}

  			singleton.stepGestures();
		};
		
		/**
		 * Internal handler for touch input start
		 * @private
		 * @type {function(this:Mouse)}
		 * @param {event} event The touch event from the browser
		 */
		Mouse.prototype._handleTouchStart = function(e){
			e = e || window.event;
			e.preventDefault();

			var touches = e.changedTouches;

			for(var i=0; i<touches.length; i++){
				singleton._ongoingTouches.push(copyTouch(touches[i]));
			}
			singleton._touchRelay(e);
		};
		
		/**
		 * Steps all the current reccording gestures
		 * @private
		 * @type {function(this:Mouse)}
		 */
		Mouse.prototype.stepGestures = function(){
			for(i = 0; i< singleton._currentGestures.length; i++){
  				if(singleton._currentGestures[i] && singleton._currentGestures[i].reccording) singleton._currentGestures[i].step();
  			}
		}

		/**
		 * Internal handler for touch input end
		 * @private
		 * @type {function(this:Mouse)}
		 * @param {event} event The touch event from the browser
		 */
		Mouse.prototype._handleTouchEnd = function(e){
			e = e || window.event;
			e.preventDefault();

			var idx = -1, touches = e.changedTouches;

  			for(var i=0; i<touches.length; i++){
  				idx = singleton.getIndexFromId(touches[i].identifier);
  				if(idx >= 0){
  					singleton._ongoingTouches[idx].pressed = false; 
			    }
			    else{
  					if(Arstider.verbose > 2) console.warn("Arstider.Mouse.handleTouchEnd: could not resolve input id ",idx);
  				}
  			}

			singleton._touchRelay(e);
		};

		/**
		 * Cahnge cursor appearance over the viewport via css
		 * @type {function(this:Mouse)}
		 * @param {string} style The style rule to apply to the cursor
		 */
		Mouse.prototype.setCursor = function(style){
			document.body.style.cursor = style;
		};
		
		/**
		 * Internal handler for mouse input start
		 * @private
		 * @type {function(this:Mouse)}
		 * @param {event} event The mouse event from the browser
		 */
		Mouse.prototype._handleMouseDown = function(e){
			var rightclick;
			var e = e || window.event;
			if (e.which) rightclick = (e.which == 3);
    		else if (e.button) rightclick = (e.button == 2);
    		
    		if(rightclick) singleton.rightPressed = true;
			else singleton.pressed = true;
			
			singleton._handleMouseMove(e);
			singleton._touchRelay(e);
		};
		
		/**
		 * Internal handler for mouse input end
		 * @private
		 * @type {function(this:Mouse)}
		 * @param {event} event The mouse event from the browser
		 */
		Mouse.prototype._handleMouseUp = function(e){
			var rightclick;
			var e = e || window.event;
			if (e.which) rightclick = (e.which == 3);
    		else if (e.button) rightclick = (e.button == 2);
    		
    		if(rightclick) singleton.rightPressed = false;
			else singleton.pressed = false;
			
			singleton._handleMouseMove(e);
			singleton._touchRelay(e);
		};
		
		/**
		 * Internal handler for mouse input movement
		 * @private
		 * @type {function(this:Mouse)}
		 * @param {event} event The mouse event from the browser
		 */
		Mouse.prototype._handleMouseMove = function(event){
			event = event || window.event; // IE-ism
	        var input = copyTouch(event);
	        singleton._mouse.x = input.x;
	        singleton._mouse.y = input.y;
		};
		
		/**
		 * Internal handler for a mouse wheel event
		 * @private
		 * @type {function(this:Mouse)}
		 * @param {event} event The mouse event from the browser
		 */
		Mouse.prototype._mouseWheel = function(event){
			event = event || window.event; // IE-ism
			var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
			Events.broadcast("Mouse.wheel", delta);
		};

		/**
		 * Cleans up touch inputs after frame render (removes released entries)
		 * @type {function(this:Mouse)}
		 */
		Mouse.prototype.cleanTouches = function(){
			for(i=singleton._ongoingTouches.length-1; i>=0; i--){
				if(!singleton._ongoingTouches[i].pressed) singleton._ongoingTouches.splice(i, 1);
			}
		};

		/**
		 * Gets ongoing touch array index for a touch id
		 * @type {function(this:Mouse)}
		 */
		Mouse.prototype.getIndexFromId = function(id){
			for (var i=0; i < singleton._ongoingTouches.length; i++){
			    if(id == singleton._ongoingTouches[i].id) return i;
			}
			return -1;
		};
		
		singleton = new Mouse();
		
		return singleton;
	});
})();