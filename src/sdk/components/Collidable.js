/**
 * Collidable Component
 * 
 * @version 2.0.1
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/components/Collidable", 
[
	"Arstider/events/Signal"
],
/** @lends components/Collidable */
function(Signal){

	Collidable.DEFAULTS = {

	};

	Collidable.namespace = "collidable";

	function Collidable(data){

		Arstider.mixin(this, Collidable.DEFAULTS);
	}

    /**
	 * Checks if coordinates fit in the local location of the Entity
	 * @type {function(this:Entity)}
	 * @param {number} x The x coordinate to check against.
	 * @param {number} y The y coordinate to check against.
     * @param {number} w The width of the element to check against.
	 * @param {number} h The height of the element to check against.
	 * @return {boolean} Are the coordinates within the zone of the Entity
	 */
	Collidable.prototype.collides = function(x,y,w,h){

		var
			t = this.owner.transform
		;

		return (t.x < x + w && t.x + t.width > x && t.y < y + h && t.y + t.height > y);
	};

	return Collidable;
});