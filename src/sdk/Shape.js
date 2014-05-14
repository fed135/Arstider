/**
 * Shape
 *
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */
;(function(){

	/**
	 * Defines the Shape Module
	 */	
	define( "Arstider/Shape", ["Arstider/Entity"], /** @lends Shape */ function (Entity) {
		
		/**
		 * Shape constructor
		 * The basic vector shape display element
		 * @class Shape
		 * @constructor
		 * @extends {Entity}
		 * @param {Object|null} props Optional properties for the element.
		 */
		function Shape(props) {
			Arstider.Super(this, Entity, props);
			
			/**
			 * If props is undefined, use the Engine's empty object constant
			 */
			props = props || Arstider.emptyObject;	
			
			/**
			 * List of steps to recreate the shape
			 * @type {Array}
			 */
			this.steps = Arstider.checkIn(props.steps, []);
			
			/**
			 * If data is present,assign it
			 */
			this.data = Arstider.checkIn(props.data, Arstider.checkIn(props.bitmap, null));
		};
		
		/**
		 * Defines parent module
		 */
		Arstider.Inherit(Shape, Entity);
		
                /**
                 * Adds a render instruction to draw the shape
                 * @type {function(this:Shape)}
                 * @param {*} cmd Draw command
                 */
                Shape.prototype.addStep = function(cmd){
                    this.steps.push(arguments);
                };
                
                /**
                 * Renders the shape, step by step on the given context
                 * @type {function(this:Shape)}
                 * @param {type} ctx The context to draw on
                 */
		Shape.protoytpe.render = function(ctx){
                    for(var i = 0; i<this.steps.length; i++){
                        ctx[this.steps[i][0]](this.steps[i].slice(1));
                    }
                };
		
		return Shape; 
	});
})();