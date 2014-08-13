/**
 * Canvas2d
 * 
 * @version 1.1.6
 * @author frederic charette <fredericcharette@gmail.com>
 */

;(function(){
	
	var
		/**
		 * Singleton static
	 	 * @private
	 	 * @type {Canvas2d|null}
	 	 */
		singleton = null
	;
	
	 /**
	 * Defines performance module
	 */	
	define( "Arstider/contexts/Canvas2d", [], /** @lends contexts/Canvas2d */ function (){
		
		if(singleton != null) return singleton;
			
		/**
		 * Canvas2d class
	     * Every draw frame, this module is called upon to render every child of every container
	     * @class contexts/Canvas2d
	     * @name contexts/Canvas2d
		 * @constructor 
		 */
		function Canvas2d(){}

		Canvas2d.prototype.init = function(context, callback){
			//context = context.canvas.buffer.getContext();
			if(callback) callback();
		};

		Canvas2d.prototype.save = function(context){
			context.save();
		};

		Canvas2d.prototype.restore = function(context){
			context.restore();

			context.globalAlpha = 1;

			if(context.__savedShadowColor) context.shadowColor = context.__savedShadowColor;
			if(context.__savedShadowBlur) context.shadowBlur = context.__savedShadowBlur;
			if(context.__savedShadowOffsetX) context.shadowOffsetX = context.__savedShadowOffsetX;
			if(context.__savedShadowOffsetY) context.shadowOffsetY = context.__savedShadowOffsetY;

			if(context.__savedGlobalCompositeOperation) context.globalCompositeOperation = context.__savedGlobalCompositeOperation;

			context.__savedShadowColor = null;
			context.__savedShadowBlur = null;
			context.__savedShadowOffsetX = null;
			context.__savedShadowOffsetY = null;

			context.__savedGlobalCompositeOperation = null;
		};

		Canvas2d.prototype.translate = function(context, x, y){
			context.translate(x, y);
		};

		Canvas2d.prototype.transform = function(context, scX, skX, skY, scY, tX, tY){
			context.transform(scX, skX, skY, scY, tX, tY);
		};

		Canvas2d.prototype.scale = function(context, sx, sy){
			context.scale(sx, sy);
		};

		Canvas2d.prototype.rotate = function(context, angle){
			context.rotate(angle * Arstider.degToRad);
		};

		Canvas2d.prototype.alpha = function(context, opacity){
			context.globalAlpha *= opacity;
		};

		Canvas2d.prototype.reset = function(context){
			context.setTransform(1,0,0,1,0,0);
		};

		Canvas2d.prototype.setCompositionMode = function(context, mode){
			context.__savedGlobalCompositeOperation = context.globalCompositeOperation;
			context.globalCompositeOperation = mode;
		};

		Canvas2d.prototype.dropShadow = function(context, x, y, blur, color){
			//save old properties
			context.__savedShadowColor = context.shadowColor;
			context.__savedShadowBlur = context.shadowBlur;
			context.__savedShadowOffsetX = context.shadowOffsetX;
			context.__savedShadowOffsetY = context.shadowOffsetY;
					
			context.shadowColor = color;
			context.shadowBlur = blur;
			context.shadowOffsetX = x;
			context.shadowOffsetY = y;
		};
			
		Canvas2d.prototype.renderAt = function(context, data, x, y, width, height, pX, pY, destWidth, destHeight){
			pX = Arstider.checkIn(pX, 0);
            pY = Arstider.checkIn(pY, 0);
            destWidth = Arstider.checkIn(destWidth, data.width);
            destHeight = Arstider.checkIn(destHeight, data.height);

			context.drawImage(data, pX, pY, destWidth, destHeight, x, y, width, height);
		};

		Canvas2d.prototype.debugOutline = function(context, x, y, w, h, fill){
				
			var shadowSafe = context.shadowColor;
			var prevAlpha = context.globalAlpha;
			var strokeSafe = context.strokeStyle;
			var lineSafe = context.lineWidth;

			context.shadowColor = "transparent";
			context.globalAlpha = 0.8;
			context.lineWidth = 1;
			context.strokeStyle = fill;
				
			context.strokeRect(x, y, w, h);

			context.globalAlpha = prevAlpha;
			context.shadowColor = shadowSafe;
			context.strokeStyle = strokeSafe;
			context.lineWidth = lineSafe;
		};

		Canvas2d.prototype.debugOutlineComplex = function(context, x, y, points, fill){
			if(!points) return;

			var shadowSafe = context.shadowColor;
			var prevAlpha = context.globalAlpha;
			var strokeSafe = context.strokeStyle;
			var lineSafe = context.lineWidth;

			context.shadowColor = "transparent";
			context.globalAlpha = 0.9;
			context.lineWidth = 1;
			context.strokeStyle = fill;

			context.beginPath();
			context.moveTo(points[0], points[1]);
			context.lineTo(points[2], points[3]);
			context.lineTo(points[4], points[5]);
			context.lineTo(points[6], points[7]);
			context.lineTo(points[0], points[1]);
			context.stroke();
			context.closePath();

			//RP
			context.lineWidth = 3;
			context.strokeStyle = "white";

			context.beginPath();
			context.moveTo(x - 5, y);
			context.lineTo(x + 5, y);
			context.moveTo(x, y - 5);
			context.lineTo(x, y + 5);
			context.stroke();
			context.closePath();	

			context.globalAlpha = prevAlpha;
			context.shadowColor = shadowSafe;
			context.strokeStyle = strokeSafe;
			context.lineWidth = lineSafe;
		};

		Canvas2d.prototype.clear = function(context, x,y,w,h){
			context.clearRect(x,y,w,h);
		};
			
		singleton = new Canvas2d();
		return singleton;
	});
})();