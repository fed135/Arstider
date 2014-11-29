/**
 * Transform Component
 * 
 * @version 2.0.1
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/components/Transform", 
[],
/** @lends components/Transform */
function(){
	
	Transform.DEFAULTS = {
		position:{
			x:0,
			y:0,
			z:0
		},
		size:{
			x:0,
			y:0,
			z:1
		},
		rotation:{
			x:0,
			y:0,
			z:0
		},
		scale:{
			x:1,
			y:1,
			z:1
		},
		skew:{
			x:0,
			y:0,
			z:0
		},
		origin:{
			x:0,
			y:0,
			z:0
		},
		dock:{
			x:null,
			y:null,
			z:null
		},
		fill:{
			x:null,
			y:null,
			z:null
		}
	};

	Transform.LEFT = 0;
	Transform.CENTER = 0.5;
	Transform.RIGHT = 1;

	Transform.TOP = 0;
	Transform.BOTTOM = 1;

	Transform.FRONT = 0;
	Transform.BACK = 1;

	Transform.namespace = "transform";

	/**
	 * Transform component constructor
	 * Handles entity coordinates and transformations
	 * @class components/Transform
	 * @constructor
	 * @param {Object|null} props Can optionally overwrite build properties of the entity    
	 */
	function Transform(){

		this.global = {};

		Arstider.mixin(this, Transform.DEFAULTS);
	}

	/**
	 * Sets the value for horizontal and vertical docking of the Entity
	 * @type {function(this:Entity)}
	 * @param {number|null} x The horizontal docking propriety.
	 * @param {number|null} y The vertical docking propriety.
	 */
	Transform.prototype.dock = function(x, y, z){

		this.dock.x = x || null;
		this.dock.y = y || null;
		this.dock.z = z || null;
		
		this.owner.cancelBubble()._update();
		return this;
	};
	
	/**
	 * Sets the value for horizontal and vertical filling of the Entity
	 * @type {function(this:Entity)}
	 * @param {string|number|null} x The horizontal filling propriety.
	 * @param {string|number|null} y The vertical filling propriety.
	 */
	Transform.prototype.fill = function(x, y, z){
		
		this.fill.x = x || null;
		this.fill.y = y || null;
		this.fill.z = z || null;
		
		this.owner.cancelBubble()._update();
		return this;
	};


	Transform.prototype.update = function(){

		var 
			pt = this.owner.parent.transform
		;
	
		if(this.owner.parent != null){
			if(this.fill.x != null) this.size.x = pt.size.x * this.fill.x;
			if(this.fill.y != null) this.size.y = pt.size.y * this.fill.y;
			if(this.fill.z != null) this.size.z = pt.size.z * this.fill.z;

			if(this.dock.x != null) this.position.x = (pt.size.x * this.dock.x) - (this.size.x * this.dock.x);
			if(this.dock.y != null) this.position.y = (pt.size.y * this.dock.y) - (this.size.y * this.dock.y);
			if(this.dock.z != null) this.position.z = (pt.size.z * this.dock.z) - (this.size.z * this.dock.z);
		}
	};

	return Transform;
});