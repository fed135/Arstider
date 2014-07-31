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
		function Canvas2d(){
			
			/**
			 * Current frame rendering context target
			 * @private
			 * @type {CanvasRenderingContext2D|null}
			 */
			this.context = null;
		}

		Canvas2d.prototype.init = function(context, callback){
			this.context = context.canvas.buffer.getContext();
			if(callback) callback();
		};

		Canvas2d.prototype.save = function(){
			this.context.save();
		};

		Canvas2d.prototype.restore = function(){
			this.context.restore();
			this.context.globalAlpha = 1;
		};

		Canvas2d.prototype.transform = function(scX, skX, skY, scY, tX, tY){
			this.context.transform(scX, skX, skY, scY, tX, tY);
		};

		Canvas2d.prototype.translate = function(x, y){
			this.context.translate(x, y);
		};

		Canvas2d.prototype.rotate = function(angle){
			this.context.rotate(angle * Arstider.degToRad);
		};

		Canvas2d.prototype.alpha = function(opacity){
			this.context.globalAlpha *= opacity;
		};

		Canvas2d.prototype.setCompositionMode = function(mode){
			//this.context.__savedGlobalCompositeOperation = this.context.globalCompositeOperation;
			this.context.globalCompositeOperation = mode;
		};

		Canvas2d.prototype.dropShadow = function(x, y, blur, color){
			//save old properties
			/*this.context.__savedShadowColor = this.context.shadowColor;
			this.context.__savedShadowBlur = this.context.shadowBlur;
			this.context.__savedShadowOffsetX = this.context.shadowOffsetX;
			this.context.__savedShadowOffsetY = this.context.shadowOffsetY;*/
					
			this.context.shadowColor = color;
			this.context.shadowBlur = blur;
			this.context.shadowOffsetX = x;
			this.context.shadowOffsetY = y;
		};
			
		Canvas2d.prototype.renderAt = function(data, x, y, width, height, pX, pY, destWidth, destHeight){
			pX = Arstider.checkIn(pX, 0);
            pY = Arstider.checkIn(pY, 0);
            destWidth = Arstider.checkIn(destWidth, data.width);
            destHeight = Arstider.checkIn(destHeight, data.height);

			this.context.drawImage(data, pX, pY, destWidth, destHeight, x, y, width, height);
		};

		Canvas2d.prototype.debugOutline = function(x, y, w, h){
				
			var shadowSafe = this.context.shadowColor;
			var prevAlpha = this.context.globalAlpha;

			this.context.shadowColor = "transparent";
			this.context.globalAlpha = 0.8;
			this.context.lineWidth = 1;
			this.context.strokeStyle = "red";
				
			this.context.strokeRect(x, y, w, h);

			this.context.globalAlpha = prevAlpha;
			this.context.shadowColor = shadowSafe;
		};

		Canvas2d.prototype.clear = function(x,y,w,h){
			this.context.clearRect(x,y,w,h);
		};
			
		singleton = new Canvas2d();
		return singleton;
	});
})();