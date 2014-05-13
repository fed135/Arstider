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
	define( "Arstider/Gradient", ["Arstider/Buffer", "Arstider/Browser"], /** @lends Gradient */ function (Buffer, Browser) {
		
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
                 * @param {number} r1 The radius value of the first gradient point
		 * @param {number} r2 The radius value of the second gradient point
		 */
		function Gradient(type, x1, y1, x2, y2, r1, r2){	
			y2 = (Browser.name === "firefox") ? -y2 : y2;

			/**
			 * Gradient data
			 * @private
			 * @type {nsIDOMCanvasGradient|null}
			 */
			this._pattern = null;
                        
                        if(type == "linear") grad.context.createLinearGradient(x1,y1,x2,y2);
                        else if(type == "radial") grad.context.createRadialGradient(x1,y1,r1,x2,y2,r2);
                        else{
                            if(Arstider.verbose > 0) console.warn("Arstider.Gradient: gradient must be of type \"linear\" or \"radial\" ");
                        }
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