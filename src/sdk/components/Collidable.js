           /**
	 * Checks if coordinates fit in the local location of the Entity
	 * @type {function(this:Entity)}
	 * @param {number} x The x coordinate to check against.
	 * @param {number} y The y coordinate to check against.
                * @param {number} w The width of the element to check against.
	 * @param {number} h The height of the element to check against.
	 * @return {boolean} Are the coordinates within the zone of the Entity
	 */
	Entity.prototype.collides = function(x,y,w,h){
		return (this.x < x + w && this.x + this.width > x && this.y < y + h && this.y + this.height > y);
	};