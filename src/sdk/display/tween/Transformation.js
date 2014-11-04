/**
 * Transformation
 * 
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the Transformation module
 */
define("Arstider/tweens/Transformation", [], /** @lends tweens/Transformation */ function(){

	/**
	 * Transformation Object constructor
	 * @constructor
	 * @class tweens/Transformation
	 * @private
	 * @param {Object} property The property affected by the transformation
	 * @param {Object} start The starting value
	 * @param {Object} end The end value
	 */
	function Transformation(props){
		this.property = Arstider.checkIn(props.property, null);
		this.start = Arstider.checkIn(props.start, 0);
		this.end = Arstider.checkIn(props.end, 1);
		this.lastStep = Arstider.checkIn(props.start, 0);
		this.isColor = Arstider.checkIn(props.isColor, false);
	}

	return Transformation;
});