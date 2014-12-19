/**
 * Canvas2d
 * 
 * @version 1.1.6
 * @author frederic charette <fredericcharette@gmail.com>
 */
define( "Arstider/contexts/Canvas2d", [], /** @lends contexts/Canvas2d */ function (){
		
	/**
	 * Canvas2d class
     * Every draw frame, this module is called upon to render every child of every container
     * @class contexts/Canvas2d
     * @name contexts/Canvas2d
	 * @constructor 
	 */
	function Canvas2d(){
		this.maxDataSize = 2048;
	}

	Canvas2d.prototype.init = function(context, callback){
		//context = context.canvas.buffer.getContext();
		if(callback) callback();
	};
	Canvas2d.prototype.save = function(context){
		context.save();
	};
	Canvas2d.prototype.restore = function(context){
		//context.restore();
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
	Canvas2d.prototype.setTransform = function(context, scX, skX, skY, scY, tX, tY){
		context.setTransform(scX, skX, skY, scY, tX, tY);
	};
	Canvas2d.prototype.scale = function(context, sx, sy){
		context.scale(sx, sy);
	};
	Canvas2d.prototype.rotate = function(context, angle){
		context.rotate(angle * Arstider.degToRad);
	};
	Canvas2d.prototype.alpha = function(context, opacity){
		
		var newAlpha = context.globalAlpha * opacity;
		if (newAlpha > 1) newAlpha = 1;
		//Firefox completely ignores globalAlpha assignments of greater than 1,
		//and it also reports a rounded value when you read globalAlpha,
		//so rounding errors can VERY easily wind up creating a >1 assignment
		//when dividing alpha changes back out on the way back up the display list
		//
		//ideally we would just restore a manually-saved value,
		//but I'm not sure whether that would fit into this 'pencil' system;
		//this seems to be the fix that would change the existing system the least
		
		context.globalAlpha = newAlpha;
		
	};
	Canvas2d.prototype.clip = function(context, x, y, w, h){
		context.beginPath();
		context.rect(x, y, w, h);
		context.clip();
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
		if(data instanceof Image || data instanceof HTMLCanvasElement){
			if(pX == undefined || pX < 0) pX = 0;
            if(pY == undefined || pY < 0) pY = 0;

            if(pX >= data.width || pY >= data.height){
            	Arstider.log("Attempting to draw a sprite element using coordinates {x:"+pX+", y:"+pY+"} larger than the image size {width:"+data.width+", height:"+data.height+", type:'"+data.nodeName+"', id:'"+data.id+"', src:'"+data.src+"'}");
            	return;
            }

            if(data.width > this.maxDataSize || data.height > this.maxDataSize){
            	Arstider.log("Maximum data size exceeded! {type:'"+data.nodeName+"', id:'"+data.id+"', src:'"+data.src+"'}");
            	return;
            }

            if(width <= 0){
            	Arstider.log("Attempting to draw an image with negative width {type:'"+data.nodeName+"', id:'"+data.id+"', src:'"+data.src+"'}");
            	return;
            }
            if(height <= 0){
            	Arstider.log("Attempting to draw an image with negative height {type:'"+data.nodeName+"', id:'"+data.id+"', src:'"+data.src+"'}");
            	return;
            }

            if(destWidth == undefined){
            	destWidth = width;
            }
            
            if(destWidth <= 0){
            	Arstider.log("The provided destination width is inferior or equal to 0 : "+destWidth);
            	return;
            }
            if(destWidth + pX > data.width) destWidth = data.width - pX;
            
            if(destHeight == undefined){
            	destHeight = height;
            }
            
            if(destHeight <= 0){
            	Arstider.log("The provided destination height is inferior or equal to 0 : "+destHeight);
            	return;
            }
            if(destHeight + pY > data.height) destHeight = data.height - pY;
            

			context.drawImage(data, pX, pY, destWidth, destHeight, x, y, width, height);
		}
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

	return new Canvas2d();
});