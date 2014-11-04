/**
 * Gradient. 
 *
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */
;(function(){

	var 
		/**
		 * Anonymous Gradient buffer reference
		 * @private
		 * @type {Object|null}
		 */
		gradNum = 0
	;

	/**
	 * Defines the Gradient module
	 */	
	define( "Arstider/Gradient", ["Arstider/Buffer", "Arstider/Browser"], /** @lends Gradient */ function (Buffer, Browser) {
		
		/**
		 * Gradient constructor
		 * Creates a linear gradient data object
		 * @class Gradient
		 * @constructor
		 * @param {string} The gradient type (linear or radial)
		 * @param {number} x1 The x value of the first gradient line point (0 to 1)
		 * @param {number} y1 The y value of the first gradient line point (0 to 1)
		 * @param {number} x2 The x value of the second gradient line point (0 to 1)
		 * @param {number} y2 The y value of the second gradient line point (0 to 1)
         * @param {number} r1 The radius value of the first gradient point
		 * @param {number} r2 The radius value of the second gradient point
		 */
		function Gradient(props){

			props = props || {};

			this.type = props.type || "linear";
			this.name = props.name || (this.type+"_gradient" + (gradNum++));
			this.x1 = Arstider.checkIn(props.x1, 0);
			this.y1 = Arstider.checkIn(props.y1, 0);
			this.x2 = Arstider.checkIn(props.x2, 1);
			this.y2 = Arstider.checkIn(props.y2, 1);
			this.r1 = Arstider.checkIn(props.r1, 1);
			this.r2 = Arstider.checkIn(props.r2, 50);

			this.width = props.width || 100;
			this.height = props.height || 100;

			this.colors = props.colors || [];

			this.xOffset = props.x || 0;
			this.yOffset = props.y || 0;

			/**
			 * Gradient data
			 * @private
			 * @type {nsIDOMCanvasGradient|null}
			 */
			this.pattern = null;

			/**
			 * If the gradient buffer wasn't initialized, do it here
			 */
			this.grad = new Buffer({
				name:'Arstider_Gradient_'+this.name,
				width:this.width,
				height:this.height
			});

			this.render();    
		}

		Gradient.prototype.render = function(){

			var 
				i = 0,
				x1 = this.xOffset + (this.x1*this.width),
				x2 = this.xOffset + (this.x2*this.width),
				y1 = this.yOffset + (this.y1*this.height),
				y2 = this.yOffset + (this.y2*this.height)
			;

			if(this.type == "linear") this.pattern = this.grad.context.createLinearGradient(x1,y1,x2,y2);
            else if(this.type == "radial") this.pattern = this.grad.context.createRadialGradient(x1,y1,this.r1,x2,y2,this.r2);
            else{
                if(Arstider.verbose > 0) console.warn("Arstider.Gradient: gradient must be of type \"linear\" or \"radial\" ");
            }

            for(i; i<this.colors.length; i++){
				this.pattern.addColorStop(this.colors[i].pos, this.colors[i].color);
			}

			return this;
		};
		
		/**
		 * Add a color point to the gradient
		 * @type {function(this:Gradient)}
		 * @param {number} position The position of the color point (0 to 1)
		 * @param {string} color The color to apply at that point
		 * @return {Object} Returns the Gradient object for easy chaining
		 */
		Gradient.prototype.addColor = function(position, color){
			this.colors.push({pos:position, color:color});
			this.render();
			return this;
		};

		Gradient.prototype.changeSize = function(width, height){
			this.grad.setSize(width, height);
			this.render();
			return this;
		};

		Gradient.prototype.changeOffset = function(x, y){
			if(x != this.xOffset || y != this.yOffset){
				this.xOffset = x;
				this.yOffset = y;
				this.render();
			}
			return this;
		};
		
		return Gradient;
	});
})();