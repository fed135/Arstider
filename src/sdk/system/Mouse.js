/**
 * Mouse
 * 
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */
define( "Arstider/system/Mouse", 
[
	"Arstider/events/Signal",
	"Arstider/system/Browser", 
	"Arstider/system/Viewport"
], 
/** @lends system/Mouse */ 
function (Signal, Browser, Viewport){

	/**
	 * Mouse constructor
	 * A mouse events mapper
	 * @class system/Mouse 
	 * @constructor
	 */
	function Mouse(){

		this._status = {
			pressed:false,
			rightPressed:false
		};

		this.onmousewheel = new Signal();

		/**
		 * Keeps track of the touches in progress
		 * @private
		 * @type {Array}
		 */
		this._inputs = [];

		/**
		 * Overriden by the engine. Called on input to keep the event chain
		 * @type {function}
		 */
		this._components = [];
	}

	/**
	 * Setups the event listeners on the provided DOM Element
	 * @type {function(this:Mouse)}
	 * @param {Object} div The DOM element object
	 */
	Mouse.prototype.init = function(div){
		if(div){
			if(Browser.isMobile || ('ontouchmove' in window)){
				div.addEventListener('touchmove', this._handleTouchMove);
				div.addEventListener('touchstart',  this._handleTouchStart, false);			
				div.addEventListener('touchend',  this._handleTouchEnd,false);
				div.addEventListener('touchcancel', this._handleTouchEnd, false);
				div.addEventListener('touchleave', this._handleTouchEnd, false);
			}
			
			if(!Browser.isMobile && ('onmousemove' in window)){
				div.addEventListener('mouseup', this._handleMouseUp,false);
				div.addEventListener('mousedown', this._handleMouseDown,false);
				div.addEventListener('mousemove',  this._handleMouseMove);
				div.addEventListener('mouseleave',  this._handleMouseUp,false);
				div.addEventListener("mousewheel", this._mouseWheel, false);
				div.addEventListener("DOMMouseScroll", this._mouseWheel, false);
			}
		}
		else{
			Arstider.log("Arstider.Mouse: no Viewport tag, cannot bind mouse events", 1);
		}
	};

	/**
	 * Copies a touch event
	 * @private
	 * @type {function}
	 * @param {Object} touch The touch event object
	 * @return {Object} The simplified copy of the event object
	 */
	Mouse.prototype._copyTouch = function(touch, state){
		return {
			id:Arstider.checkIn(touch.identifier, -1), 
			x:((touch.clientX - Viewport.xOffset) / Viewport.canvasRatio) / Viewport.globalScale,
			y:((touch.clientY - Viewport.yOffset) / Viewport.canvasRatio) / Viewport.globalScale,
			pressed:Arstider.checkIn(state, true)
		};
	}

	Mouse.prototype.registerComponent = function(clickable){
		
		var 
			index = this._components.indexOf(clickable)
		;

		if(index == -1) this._components.push(clickable);

		return this;
	};

	Mouse.prototype.unregisterComponent = function(clickable){

		var 
			index = this._components.indexOf(clickable)
		;

		if(index != -1) this._components.splice(index, 1);

		return this;
	}
		
	/**
	 * Resets mouse values
	 * @type {function(this:Mouse)}
	 */
	Mouse.prototype.reset = function(){

		this._inputs.length = 0;
		this._status.pressed = false;
		this._status.rightPressed = false;

		return this;
	};
		
	/**
	 * Returns the x location of the mouse/current touch input
	 * @type {function(this:Mouse)}
	 * @param {number|null} input Optional touch id
	 * @return {number}
	 */
	Mouse.prototype.x = function(input){

		input = input || 0;
		
		if(this._inputs[input] != undefined) return this._inputs[input].x;

		return -1;
	};
		
	/**
	 * Returns the y location of the mouse/current touch input
	 * @type {function(this:Mouse)}
	 * @param {number|null} input Optional touch id
	 * @return {number}
	 */
	Mouse.prototype.y = function(input){

		input = input || 0;
	
		if(this._inputs[input] != undefined) return this._inputs[input].y;

		return -1;
	};

	/**
	 * Returns the pressed state of the mouse/current touch input
	 * @type {function(this:Mouse)}
	 * @param {number|string|null} input Optional touch id/ or "left"/"right" on desktop
	 * @return {boolean}
	 */
	Mouse.prototype.isPressed = function(input){
		
		input = input || 0;
		
		if(this._inputs[input] != undefined) return this._inputs[input].pressed;
		
		return false; 
	};

	/**
	 * Returns the number of touch inputs
	 * @type {function(this:Mouse)}
	 * @return {number} The number of inputs
	 */
	Mouse.prototype.count = function(includeReleased){
		
		var
			i = 0
		;

		if(includeReleased) return this._inputs.length;

		for(i; i<this._inputs.length; i++){
			if(!this._inputs[i].pressed) break;
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

		var
			i = 0,
			idx = -1,
			touches = e.changedTouches,
			len = touches.length,
			prevState
		;
		
		for(i; i<len; i++){
			idx = this.getIndexFromId(touches[i].identifier);
  			if(idx >= 0){
  				prevState = this._inputs[idx].pressed;
  				this._inputs.splice(idx, 1, this._copyTouch(touches[i], prevState));
  			}
  			else{
  				Arstider.log("Arstider.Mouse.handleTouchMove: could not resolve input id "+idx);
  			}
  		}
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

		var
			i = 0,
			touches = e.changedTouches,
			len = touches.length
		;

		for(i; i<len; i++){
			this._inputs.push(this._copyTouch(touches[i]));
		}
		this.dispatch(e);
	};

	/**
	 * Internal handler for touch input end
	 * @private
	 * @type {function(this:Mouse)}
	 * @param {event} event The touch event from the browser
	 */
	Mouse.prototype._handleTouchEnd = function(e){

		e = e || window.event;
		e.preventDefault();

		var 
			i = 0,
			idx = -1, 
			touches = e.changedTouches,
			len = touches.length
		;

		for(i; i<len; i++){
  			idx = this._getIndexFromId(touches[i].identifier);
  			if(idx >= 0){
  				this._inputs[idx].pressed = false; 
		    }
		    else{
  				Arstider.log("Arstider.Mouse.handleTouchEnd: could not resolve input id " +idx);
  			}
  		}
		this.dispatch(e);
	};

	/**
	 * Change cursor appearance over the viewport via css
	 * @type {function(this:Mouse)}
	 * @param {string} style The style rule to apply to the cursor
	 */
	Mouse.prototype.setCursor = function(style){

		Viewport.container.style.cursor = style;
	};

	/**
	 * Get cursor appearance
	 * @type {function(this:Mouse)}
	 * @return {string} The style rule to applied to the cursor
	 */
	Mouse.prototype.getCursor = function(){

		return Viewport.container.style.cursor;
	};
		
	/**
	 * Internal handler for mouse input start
	 * @private
	 * @type {function(this:Mouse)}
	 * @param {event} event The mouse event from the browser
	 */
	Mouse.prototype._handleMouseDown = function(e){

		var 
			rightclick,
			e = e || window.event
		;

		if (e.which) rightclick = (e.which == 3);
    	else if (e.button) rightclick = (e.button == 2);
    	
    	if(rightclick) this._status.rightPressed = true;
		else this._status.pressed = true;

		if(this._inputs[0]) this._inputs[0].pressed = true; 
			
		this._handleMouseMove(e);
		this.dispatch(e);
	};
		
	/**
	 * Internal handler for mouse input end
	 * @private
	 * @type {function(this:Mouse)}
	 * @param {event} event The mouse event from the browser
	 */
	Mouse.prototype._handleMouseUp = function(e){
		
		var
			rightclick
			e = e || window.event
		;

		if (e.which) rightclick = (e.which == 3);
    	else if (e.button) rightclick = (e.button == 2);
    	
    	if(rightclick) this._status.rightPressed = false;
		else this._status.pressed = false;

		if(this._inputs[0]) this._inputs[0].pressed = false;
			
		this._handleMouseMove(e);
		this.dispatch(e);
	};
		
	/**
	 * Internal handler for mouse input movement
	 * @private
	 * @type {function(this:Mouse)}
	 * @param {event} event The mouse event from the browser
	 */
	Mouse.prototype._handleMouseMove = function(event){

		event = event || window.event; // IE-ism

	    this._inputs[0] = this._copyTouch(event);
	};
		
	/**
	 * Internal handler for a mouse wheel event
	 * @private
	 * @type {function(this:Mouse)}
	 * @param {event} event The mouse event from the browser
	 */
	Mouse.prototype._mouseWheel = function(event){

		event = event || window.event; // IE-ism

		var 
			delta = Arstider.max(-1, Arstider.min(1, (event.wheelDelta || -event.detail)))
		;

		this.onmousewheel.dispatch(delta);
	};

	/**
	 * Cleans up touch inputs after frame render (removes released entries)
	 * @type {function(this:Mouse)}
	 */
	Mouse.prototype.cleanTouches = function(){

		var 
			i = this._ongoingTouches.length-1
		;

		for(i; i>=0; i--){
			if(!this._ongoingTouches[i].pressed) this._ongoingTouches.splice(i, 1);
		}
	};

	/**
	 * Gets ongoing touch array index for a touch id
	 * @type {function(this:Mouse)}
	 */
	Mouse.prototype.getIndexFromId = function(id){

		var 
			i = 0
		;

		for (i; i < this._ongoingTouches.length; i++){
		    if(id == this._ongoingTouches[i].id) return i;
		}

		return -1;
	};

	Mouse.prototype.dispatch = function(event){

		var 
			i = this._components.length-1
		;

		for(i; i >= 0; i--){
			this._components[i].applyTouchEvent(event);
		}
	};
			
	return new Mouse();
});