/**
 * Shape
 *
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */
;(function(){

	var 
		SHAPES = {
			RECT:"rect",
			TRIANGLE:"triangle",
			CIRCLE:"circ",
			ROUNDED_RECT:"roundRect",
			STAR:"star",
			CUSTOM:"custom"
		}
	;

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
			
			this.shape = props.shape || SHAPES.RECT;

			this.points = props.points || [];
			
			this.fillStyle = props.fillStyle || Arstider.defaultColor;
			this.strokeStyle = props.strokeStyle || Arstider.defaultColor;
			this.lineWidth = props.lineWidth || 0;
			this.lineCap = props.lineCap || "square";
			this.lineDash = props.lineDash || [];
			this.lineDashOffset = props.lineDashOffset || 0;
		};
		
		/**
		 * Defines parent module
		 */
		Arstider.Inherit(Shape, Entity);
                
        /**
         * Renders the shape, step by step on the given context
         * @type {function(this:Shape)}
         * @param {type} ctx The context to draw on
         */
		Shape.prototype.draw = function(ctx, _x, _y){
			ctx.save();

			var i;

			if(this.fillStyle.changeOffset) this.fillStyle.changeOffset(_x, _y);
			if(this.strokeStyle.changeOffset) this.strokeStyle.changeOffset(_x, _y);

			ctx.fillStyle = (this.fillStyle.pattern)?this.fillStyle.pattern:this.fillStyle;
			ctx.strokeStyle = (this.strokeStyle.pattern)?this.strokeStyle.pattern:this.strokeStyle;
			ctx.lineWidth = this.lineWidth;
			ctx.lineCap = this.lineCap;
			if(ctx.setLineDash){
				ctx.setLineDash(this.lineDash);
				ctx.lineDashOffset = this.lineDashOffset;
			}

			ctx.beginPath();
            switch(this.shape){
            	case SHAPES.RECT:
            		ctx.rect(_x, _y, this.width, this.height);
            		break;
            	case SHAPES.CIRCLE:
            		ctx.arc(_x + this.width*0.5, _y + this.height*0.5, this.width*0.5, 0, 2*Math.PI, false);
            		break;
            	case SHAPES.CUSTOM:
            		if(this.points.length > 0){
            			ctx.moveTo(_x + this.points[0].x, _y + this.points[0].y);
            			for(i = 1;i<this.points.length; i++){
            				if(this.points[i].cpX != undefined && this.points[i].cpY != undefined){
            					ctx.quadraticCurveTo(_x + this.points[i].cpX, _y + this.points[0].cpY, _x + this.points[i].x, _y + this.points[0].y);
            				}
            				else ctx.lineTo(_x + this.points[i].x, _y + this.points[i].y);
            			}
            		}
            		break;
            }
            ctx.closePath();
            if(this.fillStyle != Arstider.defaultColor) ctx.fill();
            if(this.strokeStyle != Arstider.defaultColor) ctx.stroke();

            ctx.restore();
        };
		
		return Shape; 
	});
})();