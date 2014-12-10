/**
 * Draggable Component
 * 
 * @version 2.0.1
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/components/Draggable", 
[
	"Arstider/components/IComponent",
	"Arstider/components/LComponents",
	"Arstider/system/Mouse"
],
/** @lends components/Draggable */
function(IComponent, List, Mouse){

	Draggable.DEFAULTS = {
		bindToParent:false,
		snapToCenter:false
	};

	Draggable.namespace = "draggable";

	function Draggable(){

		Arstider.utils.Super(this, IComponent, Draggable.DEFAULTS);

		this._status = {
			dragged:false
		};

		this.targetInput = null;

		this._centerOffset = {
			x:null,
			y:null
		};
	}
	Arstider.utils.Inherit(Draggable, IComponent);

	/**
	 * Starts dragging the element, following the mouse
	 * @type {function(this:Entity)}
	 * @param {boolean|null} snapToCenter Whether to snap the dragged object centered with the pointer.
	 * @param {boolean|null} bindToParent Whether to bound the dragging to the confines of the parent
	 */
	Draggable.prototype.startDrag = function(touchIndex, snapToCenter, bindToParent){
		
		var 
			mouseX,
			mouseY,
			t = this.owner.getComponent(List.transform)
		;

		this.targetInput = (touchIndex || 0);

		if(this.owner.parent == null){
			Arstider.debug.log("Arstider.Entity.startDrag: cannot drag an element with no parent");
			return;
		}

		mouseX = Mouse.x(this.targetInput);
		mouseY = Mouse.y(this.targetInput);
		
		this.snapToCenter = Arstider.utils.checkIn(snapToCenter, this.snapToCenter);
		this.bindToParent = Arstider.utils.checkIn(bindToParent, this.bindToParent);
			
		this._status.dragged = true;
		if(this.snapToCenter || mouseX == -1 || mouseY == -1){
			this._centerOffset.x = t.width*0.5;
			this._centerOffset.y = t.height*0.5;
		}
		else{
			this._centerOffset.x = mouseX - t.global.x;
			this._centerOffset.y = mouseY - t.global.y;
		}
		
		return this;
	};
	
	/**
	 * Stops dragging the element
	 * @type {function(this:Entity)}
	 */
	Draggable.prototype.stopDrag = function(){

		this._status.dragged = false;
		this._centerOffset.x = 0;
		this._centerOffset.y = 0;
		
		return this;
	};

	return Draggable;
});