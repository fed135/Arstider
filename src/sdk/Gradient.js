/**
 * Gradient. 
 *
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */
;(function(){

	var 
		/**
		 * Gradient buffer reference
		 * @private
		 * @type {Object|null}
		 */
		grad = null
	;

	/**
	 * Defines the Gradient module
	 */	
	define( "Arstider/Gradient", ["Arstider/Buffer", ], /** @lends Gradient */ function (Buffer) {
		
		/**
		 * If the gradient buffer wasn't initialized, do it here
		 */
		if(grad == null){
			grad = new Buffer({
				name:'Arstider_gradient',
				width:100,
				height:100
			});
		}
		
		/**
		 * Gradient constructor
		 * Creates a linear gradient data object
		 * @class Gradient
		 * @constructor
		 * @param {string} The gradient type (linear or radial)
		 * @param {number} x1 The x value of the first gradient line point (0 to 100)
		 * @param {number} y1 The y value of the first gradient line point (0 to 100)
		 * @param {number} x2 The x value of the second gradient line point (0 to 100)
		 * @param {number} y2 The y value of the second gradient line point (0 to 100)
		 */
		function Gradient(type, x1, y1, x2, y2){	
			y2 = (GameContainer.browserInfo.browserName === "Firefox") ? -y2 : y2;

			/**
			 * Gradient data
			 * @private
			 * @type {nsIDOMCanvasGradient}
			 */
			this._pattern = grad.context.createLinearGradient(x1,y1,x2,y2);
		}
		
		/**
		 * Add a color point to the gradient
		 * @type {function(this:Gradient)}
		 * @param {number} position The position of the color point (0 to 1)
		 * @param {string} color The color to apply at that point
		 * @return {Object} Returns the Gradient object for easy chaining
		 */
		Gradient.prototype.addColorStop = function(position, color){
			this._grad.addColorStop(position, color);
			return this;
		};
		
		return Gradient;
	});
})();