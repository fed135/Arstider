define("Arstider/Collidable", [], function (){
	
	var
		minForceValue = 1/10000,
		topSpeed = 50
	;
			
	function decreaseForce(force, weight, formula){
		return formula(force, weight);
	}
			
			
	/**
	 * Creates Collidable Module for an entity.
	 *
	 * @constructor
	 * @this {Collidable}
	 * @param {Entity} entity The Entity to use as a collidable form
	 */
	var Collidable = function(entity, padding) {
		
		this.target = entity;
	};			
			
	/**
	 * Detects if the entity enters in collision with something Entity.
	 *
	 * @this {Entity}
	 * @param {Number} gravity The amount of world gravity
	 */
	Collidable.prototype.step = function(gravity) {
		
		return this;
	};
	
	Collidable.prototype.checkCollision = function(x1, y1, w1, h1, x2, y2, w2, h2) {
		return !(((x1 + w1 - 1) < x2) ||
				((x2 + w2 - 1) < x1) ||
		        ((y1 + h1 - 1) < y2) ||
		        ((y2 + h2 - 1) < y1));
	};
			
	Collidable.prototype.update = function(){
		
		return this;
	};
			
	return Collidable; 
});