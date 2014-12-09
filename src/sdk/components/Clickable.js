/**
 * Clickable Component
 * 
 * @version 2.0.1
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/components/Clickable", 
[
	"Arstider/components/IComponent",
	"Arstider/components/LComponents",
	"Arstider/events/Signal",
	"Arstider/system/Mouse"
],
/** @lends components/Clickable */
function(IComponent, List, Signal, Mouse){
	
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
		complexTouchPadding:0.05	//5% outside padding
	};

	Clickable.namespace = "clickable";

	/**
	 * Clickable component constructor
	 * Handles entity coordinates and transformations
	 * @class components/Clickable
	 * @constructor
	 * @param {Object|null} props Can optionally overwrite build properties of the entity    
	 */
	function Clickable(){

		Arstider.utils.Super(this, IComponent, Clickable.DEFAULTS);

		this.availableInputs = 1;

		this._status = {
			hovered:[],
			pressed:[],
			preclick:[],
			rightPressed:false,
			doubleClickCheck:[]
		};

		this.onleave = new Signal();
		this.onhover = new Signal();
		this.onpress = new Signal();
		this.ondoubleclick = new Signal();
		this.onclick = new Signal();
		this.onrightclick = new Signal();

		Mouse.registerComponent(this);
	}
	Arstider.utils.Inherit(Clickable, IComponent);

	/**
	 * Checks if coordinates fit in the global location of the Entity
	 * @type {function(this:Entity)}
	 * @param {number} x The x coordinate to check against.
	 * @param {number} y The y coordinate to check against.
	 * @return {boolean} Are the coordinates within the zone of the Entity
	 */
	Clickable.prototype.isTouched = function(x,y){

		var 
			t = this.owner.getComponent(List.transform)
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

	Clickable.prototype.setMaxInputs = function(num){

		this.availableInputs = num;
		this.reset();
	};

	Clickable.prototype.reset = function(){

		this._status.hovered.length = new Array(availableInputs);
		this._status.pressed.length = new Array(availableInputs);
		this._status.preclick.length = new Array(availableInputs);
		this._status.rightPressed = false;
		this._status.doubleClickCheck.length = new Array(availableInputs);
	};

	/**
	 * Checks if coordinates fit in the global location of a complex Entity
	 * @type {function(this:Entity)}
	 * @param {number} x The x coordinate to check against.
	 * @param {number} y The y coordinate to check against.
	 * @return {boolean} Are the coordinates within the zone of the Entity
	 */
	Clickable.prototype.isComplexTouched = function(x, y){

		var 
			t = this.owner.getComponent(List.transform),
			distAP = Arstider.math.distance(t.global.points[0], t.global.points[1], x, y),
			distBP = Arstider.math.distance(t.global.points[2], t.global.points[3], x, y),
			distCP = Arstider.math.distance(t.global.points[4], t.global.points[5], x, y),
			distDP = Arstider.math.distance(t.global.points[6], t.global.points[7], x, y),
			quad1 = ((distAP + distBP + t.global.width) * 0.5),
			quad1 = Math.sqrt(quad1 * (quad1 - distAP) * (quad1 - distBP) * (quad1 - t.global.width)) || 0;
			quad2 = ((distBP + distDP + t.global.height) * 0.5),
			quad2 = Math.sqrt(quad2 * (quad2 - distBP) * (quad2 - distDP) * (quad2 - t.global.height)) || 0;
			quad3 = ((distCP + distDP + t.global.width) * 0.5),
			quad3 = Math.sqrt(quad3 * (quad3 - distCP) * (quad3 - distDP) * (quad3 - t.global.width)) || 0;
			quad4 = ((distAP + distCP + t.global.height) * 0.5),
			quad4 = Math.sqrt(quad4 * (quad4 - distAP) * (quad4 - distCP) * (quad4 - t.global.height)) || 0;
			sum = quad1 + quad2 + quad3 + quad4,
			total = t.global.width * t.global.height
		;

		if(sum >= total - (total * this.complexTouchPadding) && sum <= total + (total * this.complexTouchPadding)) return true;
		
		return false;
	};

	/**
	 * Private logic when element is hovered
	 * @protected
	 * @type {function(this:Entity)}
	 */
	Clickable.prototype._onhover = function(id, event){

		if(id >= this.availableInputs) return;

		this._status.hovered[id] = true;
		this.onhover.dispatch(event);
	};
	
	/**
	 * Private logic when element is left
	 * @protected
	 * @type {function(this:Entity)}
	 */
	Clickable.prototype._onleave = function(id, event){

		if(id >= this.availableInputs) return;

		this._status.hovered[id] = false;
		this._status.preclick[id] = false;
		this._status.rightPressed = false;
		this.onleave.dispatch(event);
	};
	
	/**
	 * Private logic when element is pressed
	 * @protected
	 * @type {function(this:Entity)}
	 */
	Clickable.prototype._onpress = function(id, event){

		if(id >= this.availableInputs) return;

		this._status.pressed[id] = true;
		this.onpress.dispatch(event);
	};
	
	/**
	 * Private logic when element is released
	 * @protected
	 * @type {function(this:Entity)}
	 */
	Clickable.prototype._onrelease = function(id, event){

		var
			time
		;

		if(id >= this.availableInputs) return;

		this._status.pressed[id] = false;
		time = Arstider.timestamp();
		
		if(this._status.preclick[id]){
			if(time - (this._status.doubleClickCheck[id] || 0) < this.doubleClickDelay) this.ondoubleclick.dispatch(event);
			else{
				this.onclick.dispatch(event);
			}
			
			this._status.doubleClickCheck[id] = time;
		}
		this.onrelease.dispatch(event);
		
		this._status.preclick[id] = false;
	};

	Clickable.prototype.applyTouchEvent = function(event){

	};
	
	/**
	 * Private logic when element is clicked with the right mouse button
	 * @protected
	 * @type {function(this:Entity)}
	 */
	Clickable.prototype._onrightclick = function(event){

		this._status.rightPressed = false;
		this.onrightclick.dispatch(event);
	};

	return Clickable;
});		