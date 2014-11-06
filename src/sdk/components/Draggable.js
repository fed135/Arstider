/**
 * Draggable Component
 * 
 * @version 2.0.1
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/components/Draggable", 
[
	"Arstider/components/Component",
	"Arstider/system/Mouse"
],
/** @lends components/Draggable */
function(Component, Mouse){

	Draggable.DEFAULTS = {
		bindToParent:false,
		snapToCenter:false
	};

	function Draggable(data){

		this._status = {
			dragged:false
		};

		this._centerOffset = {
			x:null,
			y:null
		};

		Arstider.Super(this, Component, data, Draggable.DEFAULTS);
	}
	Arstider.Inherit(Draggable, Component);

	/**
	 * Starts dragging the element, following the mouse
	 * @type {function(this:Entity)}
	 * @param {boolean|null} snapToCenter Whether to snap the dragged object centered with the pointer.
	 * @param {boolean|null} bindToParent Whether to bound the dragging to the confines of the parent
	 */
	Draggable.prototype.start = function(snapToCenter, bindToParent){
		
		var 
			mouseX = Mouse.x(),
			mouseY = Mouse.y(),
			t = this.owner.transform
		;

		if(this.parent == null){
			Arstider.log("Arstider.Entity.startDrag: cannot drag an element with no parent", 1);
			return;
		}
		
		this.snapToCenter = Arstider.checkIn(snapToCenter, this.snapToCenter);
		this.bindToParent = Arstider.checkIn(bind, this.bindToParent);
			
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

	Draggable.prototype.update = function(dt){

	};
	
	/**
	 * Stops dragging the element
	 * @type {function(this:Entity)}
	 */
	Draggable.prototype.stop = function(){

		this._status.dragged = false;
		this._centerOffset.x = 0;
		this._centerOffset.y = 0;
		
		return this;
	};

	return Draggable;
});