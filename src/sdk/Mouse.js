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
		singleton = null,
		/**
		 * Non-exhaustive list of gestures for "resembles" property
		 * @private
		 * @type {Object}
		 */
		gestures = {
			PINCH_IN:"pinch-in",
			PINCH_OUT:"pinch-out",
			SWIPE:"swipe"
		},
		/**
		 * The maximum number of gesture history states
		 * @private
		 * @const
		 * @type {number}
		 */
		maxGesturePoints = 6,
		/**
		 * Maximum number of fingers allowed at once
		 * @private
		 * @const
		 * @type {number}
		 */
		touchLimit = 5,
		/**
		 * Array bank, to prevent creation of arrays every time the input changes
		 * @private
		 * @type {Array}
		 */
		touchObjBank = []
	;
	
	/**
	 * Gesture constructor
	 * @constructor
	 * @private
	 */
	function Gesture(){
		this.points = [];
		this.center = null;
		this.speed = 0;
		this.speedX = 0;
		this.speedY = 0;
		this.distance = 0;
		this.distanceX = 0;
		this.distanceY = 0;
		this.resembles = null;
		this.scale = 1;
		this.drawTime = 0;
		this.angle = 0;
		
		this.startSpread = null;
		
		this._savedDelay = 0;
		this._savedDistanceX = 0;
		this._savedDistanceY = 0;
	}
	
	/**
	 * Updates the points of a gesture and analyzes them
	 * @private
	 * @type {function(this:Gesture)} 
	 */
	Gesture.prototype.update = function(){
		
		if(this.points.length == 0) return;
		
		var 
			currX = null,
			currY = null,
		
			distX = 0,
			distY = 0,
			delay = 0,
			
			spreadSet = false,
			spread = 0
		;
		
		for(var i = 0; i< this.points.length; i++){
			spreadSet = false;
			
			if(currX == null || currY == null){
				//first input
				currX = this.points[i].inputs[0].x;
				currY = this.points[i].inputs[0].y;
			}
			
			if(this.points[i].inputs.length > 1){
				if(this.center == null){
					this.center = {x:(this.points[i].inputs[0].x + this.points[i].inputs[1].x) / 2, y:(this.points[i].inputs[0].y + this.points[i].inputs[1].y) / 2};
				}
				if(this.startSpread == null){
					spreadSet = true;
					this.startSpread = Math.sqrt(Math.pow((this.points[i].inputs[0].x - this.points[i].inputs[1].x), 2) + Math.pow((this.points[i].inputs[0].x + this.points[i].inputs[1].y), 2));
				}
			}
			
			//distance
			if(this.points[i].inputs[0].x < currX) distX += (currX - this.points[i].inputs[0].x);
			else distX += (this.points[i].inputs[0].x - currX);
			
			if(this.points[i].inputs[0].y < currY) distY += (currY - this.points[i].inputs[0].y);
			else distY += (this.points[i].inputs[0].y - currY);
			
			if(i>0){
				delay += (this.points[i].delay - this.points[i-1].delay);
				this.angle = Math.atan2(this.points[i].inputs[0].y - this.points[i-1].inputs[0].y, this.points[i].inputs[0].x - this.points[i-1].inputs[0].x) * 180 / Math.PI;
			}
				
			currX = this.points[i].inputs[0].x;
			currY = this.points[i].inputs[0].y;
			
			if(this.startSpread != null && this.points[i].inputs.length > 1 && !spreadSet){
				spread = Math.sqrt(Math.pow((currX - this.points[i].inputs[1].x), 2) + Math.pow((currY + this.points[i].inputs[1].y), 2));
			}
		}
		
		delay += this._savedDelay;
		distX += this._savedDistanceX;
		distY += this._savedDistanceY;
		
		this.drawTime = delay;
		
		this.distanceX = distX;
		this.distanceY = distY;
		this.distance = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
		
		this.speedX = distX/delay;
		this.speedY = distY/delay;
		this.speed = this.distance/delay;
		
		if(this.startSpread != null && spread != 0){
			this.scale = spread/this.startSpread;
			
			if(this.scale < 1){
				this.resembles = gestures.PINCH_IN;
			}
			else{
				this.resembles = gestures.PINCH_OUT;
			}
		}
		else{
			this.resembles = gestures.SWIPE;
		}
	};
	
	/**
	 * Adds a gesture history point
	 * @private
	 * @type {function(this:Gesture)} 
	 */
	Gesture.prototype.addPoint = function(point){
		if(point.inputs[0].x === -1 || point.inputs[0].y === -1) return;
		
		if(point.inputs[1]){
			if(point.inputs[1].x === -1 || point.inputs[0].y === -1) point.inputs.splice(1,1);
		}
		
		if(this.points.length > maxGesturePoints){
			this._savedDelay = this.drawTime;
			this._savedDistanceX = this.distanceX;
			this._savedDistanceY = this.distanceY;
			
			this.points = [this.points[this.points.length-1]];
			
			//this.startSpread = null;
			this.center = null;
		}
		
		this.points.push(point);
		this.update();
	};
	
	/**
	 * Gesture point constructor
	 * @private
	 * @constructor
	 * @param {Array} inputs The list of inputs
	 * @param {Object} prevDelay Time stamp (to calculate velocity)
	 */
	function GesturePoint(inputs, prevDelay){
		this.inputs = inputs;
		this.delay = prevDelay;
	}
	
	/**
	 * Defines the Mouse module
	 */
	define( "Arstider/Mouse", ["Arstider/Browser", "Arstider/Viewport", "Arstider/Events"], /** @lends Mouse */ function (Browser, Viewport, Events){
			
		if(singleton != null) return singleton;
		
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
			 * The current Gesture object (mobile only)
			 * @type {Gesture|null}
			 */
			this.currentGesture = null;
			
			/**
			 * Mouse position raw (desktop) ***Use the Mouse.x() and Mouse.y() methods for cross-platform final result***
			 * @private
			 * @type {Object}
			 */
			this._mouse = {x:0,y:0};
			
			/**
			 * Mouse position raw (mobile) ***Use the Mouse.x() and Mouse.y() methods for cross-platform final result***
			 * @private
			 * @type {Array}
			 */
			this._touch = [];
			
			/**
			 * Whether or not to register gestures on input
			 * @private
			 * @type {boolean}
			 */
			this._registerGestures = false;
			
			/**
			 * Overriden by the engine. Called on input to keep the event chain
			 * @type {function}
			 */
			this._touchRelay = Arstider.emptyFunction;
			
			/**
			 * Populate the touch array
			 */
			for(var i=0; i<touchLimit; i++) touchObjBank.push({x:0,y:0});
			
			/**
			 * Add event listeners
			 */
			if(Browser.isMobile){
				window.addEventListener('touchmove', this._handleTouchMove);
				window.addEventListener('touchstart',  this._handleTouchStart, false);			
				window.addEventListener('touchend',  this._handleTouchEnd,false);
			}
			else{
				window.addEventListener('mouseup', this._handleMouseUp);
				window.addEventListener('mousedown', this._handleMouseDown);
				window.addEventListener('mousemove',  this._handleMouseMove);
				
				if(Viewport.container){
					Viewport.container.addEventListener("mousewheel", this._mouseWheel, false);
					Viewport.container.addEventListener("DOMMouseScroll", this._mouseWheel, false);
				}
				else{
					if(Arstider.verbose > 0) console.warn("Arstider.Mouse: no Viewport container, cannot bind mouse wheel");
				}
			}
		}
		
		/**
		 * Tells the module to start recording inputs for gesture recognition
		 * @type {function(this:Mouse)}
		 */
		Mouse.prototype.registerGestures = function(){
			this._registerGestures = true;
		};
		
		/**
		 * Tells the module to stop recording inputs for gesture recognition
		 * @type {function(this:Mouse)}
		 */
		Mouse.prototype.stopGestures = function(){
			this._registerGestures = false;
		};
		
		/**
		 * Returns a new gesture point based on current inputs
		 * @private
		 * @type {function(this:Mouse)}
		 * @return {GesturePoint} The newly created gesture point
		 */
		Mouse.prototype._gesturePoint = function(){
			return new GesturePoint((Browser.isMobile)?singleton.touch:[{x:singleton._mouse.x, y:singleton._mouse.y}], Arstider.timestamp());
		};
		
		/**
		 * Resets mouse values
		 * @type {function(this:Mouse)}
		 */
		Mouse.prototype.reset = function(){
			singleton._touch = [];
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
				if(singleton._touch[input]) return singleton._touch[input].x;
				else return -1;
			}
			else return singleton._mouse.x;
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
				if(singleton._touch[input]) return singleton._touch[input].y;
				else return -1;
			}
			else return singleton._mouse.y;
		};
		
		/**
		 * Internal handler for touch input movement
		 * @private
		 * @type {function(this:Mouse)}
		 * @param {event} event The touch event from the browser
		 */
		Mouse.prototype._handleTouchMove = function(event){
			e = event || window.event;
			e.stopPropagation();
			e.preventDefault();
			
			singleton._touch.length = 0;
			var newTouch;
			for(var i=0; i<e.touches.length && i<touchLimit; i++){
				newTouch = touchObjBank[i];
				newTouch.x = ((e.touches[i].clientX - Viewport.xOffset) / Viewport.canvasRatio) / Viewport.globalScale;
	        	newTouch.y = ((e.touches[i].clientY - Viewport.yOffset) / Viewport.canvasRatio) / Viewport.globalScale;
				singleton._touch[i] = newTouch;
			}
			
			if(singleton._registerGestures && singleton.currentGesture != null) singleton.currentGesture.addPoint(singleton._gesturePoint());
		};
		
		/**
		 * Internal handler for touch input start
		 * @private
		 * @type {function(this:Mouse)}
		 * @param {event} event The touch event from the browser
		 */
		Mouse.prototype._handleTouchStart = function(e){
			var isFresh = (singleton.pressed == false);
			singleton.pressed = true;
			
			singleton._handleTouchMove(e);
			singleton._touchRelay(e);
			
			if(singleton._registerGestures && isFresh){
				singleton.currentGesture = new Gesture();
				singleton.currentGesture.addPoint(singleton._gesturePoint(true));
			}
			
			e = e || window.event;
			e.stopPropagation();
			e.preventDefault();
			return false;
		};
		
		/**
		 * Internal handler for touch input end
		 * @private
		 * @type {function(this:Mouse)}
		 * @param {event} event The touch event from the browser
		 */
		Mouse.prototype._handleTouchEnd = function(e){
			singleton.currentGesture = null;
			
			singleton.pressed = false;  
			
			setTimeout(function(){singleton._handleTouchMove(e);},10);
			singleton._touchRelay(e);
			
			e = e || window.event;
			e.stopPropagation();
			e.preventDefault();
			return false;
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
			
			if(singleton._registerGestures){
				singleton.currentGesture = new Gesture();
				singleton.currentGesture.addPoint(singleton._gesturePoint());
			}
		};
		
		/**
		 * Internal handler for mouse input end
		 * @private
		 * @type {function(this:Mouse)}
		 * @param {event} event The mouse event from the browser
		 */
		Mouse.prototype._handleMouseUp = function(e){
			singleton.currentGesture = null;
			
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
	        singleton._mouse.x = ((event.clientX - Viewport.xOffset) / Viewport.canvasRatio) / Viewport.globalScale;
	        singleton._mouse.y = ((event.clientY - Viewport.yOffset) / Viewport.canvasRatio) / Viewport.globalScale;
	        
	        if(singleton._registerGestures && singleton.currentGesture != null) singleton.currentGesture.addPoint(singleton._gesturePoint());
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
		
		singleton = new Mouse();
		
		return singleton;
	});
})();