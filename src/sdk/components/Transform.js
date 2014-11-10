/**
 * Transform Component
 * 
 * @version 2.0.1
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/components/Transform", 
[
	"Arstider/components/Component"
],
/** @lends components/Transform */
function(Component){
	
	Transform.DEFAULTS = {
		x:0,
		y:0,
		width:0,
		height:0,
		rotation:0,
		scale:{
			x:1,
			y:1
		},
		skew:{
			x:0,
			y:0
		},
		origin:{
			x:0,
			y:0
		},
		dock:{
			x:null,
			y:null
		},
		fill:{
			x:null,
			y:null
		}
	};

	Transform.LEFT = 0;
	Transform.CENTER = 0.5;
	Transform.RIGHT = 1;

	Transform.TOP = 0;
	Transform.BOTTOM = 1;

	/**
	 * Transform component constructor
	 * Handles entity coordinates and transformations
	 * @class components/Transform
	 * @constructor
	 * @param {Object|null} props Can optionally overwrite build properties of the entity    
	 */
	function Transform(data){
		this.global = {};

		Arstider.Super(this, Component, data, Transform.DEFAULTS);
	}

	/**
	 * Sets the value for horizontal and vertical docking of the Entity
	 * @type {function(this:Entity)}
	 * @param {number|null} x The horizontal docking propriety.
	 * @param {number|null} y The vertical docking propriety.
	 */
	Transform.prototype.dock = function(x, y){
		this.dock.x = x || null;
		this.dock.y = y || null;
		
		this.owner.cancelBubble()._update();
		return this;
	};
	
	/**
	 * Sets the value for horizontal and vertical filling of the Entity
	 * @type {function(this:Entity)}
	 * @param {string|number|null} x The horizontal filling propriety.
	 * @param {string|number|null} y The vertical filling propriety.
	 */
	Transform.prototype.fill = function(x, y){
		this.fill.x = x || null;
		this.fill.y = y || null;
		
		this.owner.cancelBubble()._update();
		return this;
	};


	Transform.prototype.update = function(){

		var 
			pt = this.owner.parent.transform
		;
	
		if(this.owner.parent != null){
			if(this.fill.x != null) this.width = pt.width * this.fill.x;
			if(this.fill.y != null) this.height = pt.height * this.fill.y;
			if(this.dockX != null) this.x = (pt.width * this.dock.x) - (this.width * this.dock.x);
			if(this.dockY != null) this.y = (pt.height * this.dock.y) - (this.height * this.dock.y);
		}
	};

	return Transform;
});