/**
 * Transformation
 * 
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the Transformation module
 */
define("Arstider/core/Transformation", [], /** @lends core/Transformation */ function(){

	/**
	 * Transformation Object constructor
	 * @constructor
	 * @class core/Transformation
	 * @private
	 * @param {Object} property The property affected by the transformation
	 * @param {Object} start The starting value
	 * @param {Object} end The end value
	 */
	function Transformation(property, start, end){
		this.property = property;
		this.start = start;
		this.end = end;
		this.lastStep = start;
	}

	return Transformation;
});