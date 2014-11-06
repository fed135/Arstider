/**
 * Clickable Component
 * 
 * @version 2.0.1
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/components/Clickable", 
[
	"Arstider/components/Component",
	"Arstider/events/Signal",
	"Arstider/system/Mouse"
],
/** @lends components/Clickable */
function(Component, Signal, Mouse){
	
	/**
	 * No click registering, temporary disabling method
	 */
	Clickable.PASSIVE = 0;
	/**
	 * Typical click detection.
	 */
	Clickable.ACTIVE = 1;
	/**
	 * Can detect clicks on element that have been rotated, skewed, etc.
	 */
	Clickable.COMPLEX = 2;

	/**
	 * Component defaults
	 */
	Clickable.DEFAULTS = {
		type:Clickable.ACTIVE,
		doubleClickDelay:250,
		complexTouchPadding:100
	};

	/**
	 * Clickable component constructor
	 * Handles entity coordinates and transformations
	 * @class components/Clickable
	 * @constructor
	 * @param {Object|null} props Can optionally overwrite build properties of the entity    
	 */
	function Clickable(data){

		this._status = {
			hovered:false,
			pressed:false,
			preclick:false,
			rightPressed:false,
			doubleClickCheck:0
		};

		/**
		 * User-defined behavior when element is pressed
		 * @override
		 * @type {function(this:Entity)}
		 */
		this.onpress = null;
		
		/**
		 * User-defined behavior when element is pressed
		 * @override
		 * @type {function(this:Entity)}
		 */
		this.onrelease = null;
		
		/**
		 * User-defined behavior when element is pressed
		 * @override
		 * @type {function(this:Entity)}
		 */
		this.onhover = null;
		
		/**
		 * User-defined behavior when element is pressed
		 * @override
		 * @type {function(this:Entity)}
		 */
		this.onleave = null;
		
		/**
		 * User-defined behavior when element is pressed, then released
		 * @override
		 * @type {function(this:Entity)}
		 */
		this.onclick = null;
		
		/**
		 * User-defined behavior when element is pressed with the right mouse button, then released
		 * @override
		 * @type {function(this:Entity)}
		 */
		this.onrightclick = null;
		
		/**
		 * User-defined behavior when element is pressed with the right mouse button, then released
		 * @override
		 * @type {function(this:Entity)}
		 */
		this.ondoubleclick = null;

		Arstider.Super(this, Component, data, Clickable.DEFAULTS);

		Mouse.registerComponent()
	}
	Arstider.Inherit(Clickable, Component);

	/**
	 * Checks if coordinates fit in the global location of the Entity
	 * @type {function(this:Entity)}
	 * @param {number} x The x coordinate to check against.
	 * @param {number} y The y coordinate to check against.
	 * @return {boolean} Are the coordinates within the zone of the Entity
	 */
	Clickable.prototype.isTouched = function(x,y){

		var 
			t = this.owner.transform
		;

		if(this.touchAccuracy == Clickable.PASSIVE) return false;

		if(this.touchAccuracy == Clickable.ACTIVE || !this.global.points){
			// --Simple version
			if(x > t.global.x && x < t.global.x + (t.width * t.global.scale.x)){
				if(y > t.global.y && y < t.global.y + (t.height * t.global.scale.y)) return true;
			}
			return false;
		}
		
		/**
		 * Complex detection
		 */
		return this.isComplexTouched(x, y);
	};

	Clickable.prototype.addListener = function(event, method){

		if(this[event] != undefined){
			if(!this[event].add) this[event] = new Signal();
			if(method) this[event].add(method); 
		}
		else Arstider.log("Arstider.Clickable.addListener: "+event+ " is not a valid event name.", 1);

		return this;
	};

	Clickable.prototype.removeListener = function(event, method){

		if(this[event] && this[event].remove){
			if(method) this[event].remove(method);
			else this[event] = null;
		}

		return this;
	};

	Clickable.prototype.dispose = function(){

	};

	/**
	 * Checks if coordinates fit in the global location of a complex Entity
	 * @type {function(this:Entity)}
	 * @param {number} x The x coordinate to check against.
	 * @param {number} y The y coordinate to check against.
	 * @return {boolean} Are the coordinates within the zone of the Entity
	 */
	Clickable.prototype.isComplexTouched = function(){

		var 
			distAP = Arstider.distance(this.global.points[0], this.global.points[1], x, y),
			distBP = Arstider.distance(this.global.points[2], this.global.points[3], x, y),
			distCP = Arstider.distance(this.global.points[4], this.global.points[5], x, y),
			distDP = Arstider.distance(this.global.points[6], this.global.points[7], x, y),
			quad1 = ((distAP + distBP + this.global.width) * 0.5),
			quad1 = Math.sqrt(quad1 * (quad1 - distAP) * (quad1 - distBP) * (quad1 - this.global.width)) || 0;
			quad2 = ((distBP + distDP + this.global.height) * 0.5),
			quad2 = Math.sqrt(quad2 * (quad2 - distBP) * (quad2 - distDP) * (quad2 - this.global.height)) || 0;
			quad3 = ((distCP + distDP + this.global.width) * 0.5),
			quad3 = Math.sqrt(quad3 * (quad3 - distCP) * (quad3 - distDP) * (quad3 - this.global.width)) || 0;
			quad4 = ((distAP + distCP + this.global.height) * 0.5),
			quad4 = Math.sqrt(quad4 * (quad4 - distAP) * (quad4 - distCP) * (quad4 - this.global.height)) || 0;
			sum = quad1 + quad2 + quad3 + quad4,
			total = this.global.width * this.global.height
		;
		if(sum >= total - this.complexTouchPadding && sum <= total + this.complexTouchPadding) return true;
		
		return false;
	};

	/**
	 * Private logic when element is hovered
	 * @protected
	 * @type {function(this:Entity)}
	 */
	Clickable.prototype._onhover = function(){

		this._status.hovered = true;
		
		if(this.onhover.dispatch) this.onhover.dispatch();
	};
	
	/**
	 * Private logic when element is left
	 * @protected
	 * @type {function(this:Entity)}
	 */
	Clickable.prototype._onleave = function(){

		this._status.hovered = false;
		this._status.preclick = false;
		this._status.rightPressed = false;
		
		if(this.onleave.dispatch) this.onleave.dispatch();
	};
	
	/**
	 * Private logic when element is pressed
	 * @protected
	 * @type {function(this:Entity)}
	 */
	Clickable.prototype._onpress = function(){

		this._status.pressed = true;
		
		if(this.onpress.dispatch) this.onpress.dispatch();
	};
	
	/**
	 * Private logic when element is released
	 * @protected
	 * @type {function(this:Entity)}
	 */
	Clickable.prototype._onrelease = function(){

		this._status.pressed = false;
		
		var time = Arstider.timestamp();
		
		if(this._status.preclick){
			if(time - this._status.doubleClickCheck < this.doubleClickDelay && this.ondoubleclick.dispatch) this.ondoubleclick.dispatch();
			else{
				if(this.onclick.dispatch) this.onclick.dispatch();
			}
			
			this._status.doubleClickCheck = time;
		}
		if(this.onrelease.dispatch) this.onrelease.dispatch();
		
		this._status.preclick = false;
	};
	
	/**
	 * Private logic when element is clicked with the right mouse button
	 * @protected
	 * @type {function(this:Entity)}
	 */
	Clickable.prototype._onrightclick = function(){

		this._status.rightPressed = false;

		if(this.onrightclick.dispatch) this.onrightclick.dispatch();
	};

	return Clickable;
});		