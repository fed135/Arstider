/**
 * Engine Namespace
 */

window.Arstider = {};

/**
 * Re-usable empties
 */
Arstider.emptyObject === {};
Arstider.emptyFunction = function(){};
Arstider.emptyString = "";
Arstider.emptyImgSrc = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

/**
 * Private Utils
 */
Arstider._inheritanceHistory = {};
Arstider._fullFPS = 1000/60;

/**
 * Common methods
 */
Arstider.delegate = function(){}; //TODO

Arstider.checkIn = function(val, def){
	if(val === undefined) return def;
	return val;
};

Arstider.randomSort = function(){
	var i = this.length, j, temp;
	if ( i === 0 ) return false;
	while ( --i ) {
	   j = Math.floor( Math.random() * ( i + 1 ) );
	   temp = this[i];
	   this[i] = this[j]; 
	   this[j] = temp;
	 }
};

Arstider.chop = function(i){
	return (0.5 + i) | 0;
};

Arstider.Super = function(child){
	var parent = Arstider._inheritanceHistory[child.constructor.toString()];
	if(arguments.length > 1) parent.apply(child, Array.prototype.slice.call(arguments,1));
	else parent.call(child);
};

Arstider.Inherit = function(child, parent){
	if(parent instanceof Function || typeof parent === 'function'){
		Arstider._inheritanceHistory[child.toString()] = parent;
		child.prototype = new parent();
		child.prototype.constructor = child;
	}
	else console.error("could not make ",child, " inherit", parent);
};

Arstider.fixedAnimationFrame = function(callback){
	window.setTimeout(callback, Arstider._fullFPS);
};
	
/**
 * Private wrapper for vendor-prefixed request animation frame
 */
Arstider.requestAnimFrame = (function(){
	return window.requestAnimationFrame    || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame    || 
		window.oRequestAnimationFrame      || 
		window.msRequestAnimationFrame     ||
		Arstider.fixedAnimationFrame;
})();


/**
 * Image Transformations
 */
require(["Arstider/Buffer"], function(Buffer){
	
	/**
	* Inverts the colors of the Entity.
	*
	* @this {Entity}
	*/
	Arstider.invertColors = function(buffer, x, y, w, h){
		
		var 
			imageData = buffer.getContext("2d").getImageData(Arstider.checkIn(x,0),Arstider.checkIn(y,0), Arstider.checkIn(w,buffer.width), Arstider.checkIn(h,buffer.height)), 
			pixels = imageData.data, 
			i = (Arstider.checkIn(w,buffer.width), Arstider.checkIn(h,buffer.height))-1,
			ret = Buffer.create(buffer.name + " _inverted")
		;
		
		
		for (i; i >= 0; i--) {  
		    pixels[i*4] = 255-pixels[i*4];
	    	pixels[i*4+1] = 255-pixels[i*4+1];  
	    	pixels[i*4+2] = 255-pixels[i*4+2];  
		}
			
		ret.width = Arstider.checkIn(w, buffer.width);
		ret.height = Arstider.checkIn(h, buffer.height);
		ret.getContext("2d").putImageData(imageData, 0, 0);
	
		return ret;
	};
	
	/**
	* Grayscales the colors of the Entity.
	* 
	* Countered by Saturate
	*
	* @this {Entity}
	*/
	Arstider.grayscale = function(buffer, x, y, w, h) {
		
		var 
			imageData = buffer.getContext("2d").getImageData(Arstider.checkIn(x,0),Arstider.checkIn(y,0), Arstider.checkIn(w,buffer.width), Arstider.checkIn(h,buffer.height)), 
			pixels = imageData.data, 
			i = (Arstider.checkIn(w,buffer.width), Arstider.checkIn(h,buffer.height))-1,
			ret = Buffer.create(buffer.name + " _grayscale"),
			avg = null
		;
		
		for(i; i >= 0; i--){
			avg = (pixels[i*4] + pixels[i*4+1] +  + pixels[i*4+2])/3;
			
			pixels[i*4] = avg;
	    	pixels[i*4+1] = avg;  
	    	pixels[i*4+2] = avg;
		}
		
		ret.width = Arstider.checkIn(w, buffer.width);
		ret.height = Arstider.checkIn(h, buffer.height);
		ret.getContext("2d").putImageData(imageData, 0, 0);
	
		return ret;
	};
	
	Arstider.tint = function(buffer, r, g, b, x, y, w, h){
		var 
			imageData = buffer.getContext("2d").getImageData(Arstider.checkIn(x,0),Arstider.checkIn(y,0), Arstider.checkIn(w,buffer.width), Arstider.checkIn(h,buffer.height)), 
			pixels = imageData.data, 
			i = (Arstider.checkIn(w,buffer.width), Arstider.checkIn(h,buffer.height))-1,
			ret = Buffer.create(buffer.name + " _tint"+r+g+b),
			rPcent = r/255,
			gPcent = g/255,
			bPcent = b/255
		;
		
		for (i; i >= 0; i--) {  
		    pixels[i*4] = pixels[i*4] * rPcent;
	    	pixels[i*4+1] = pixels[i*4+1] * gPcent;  
	    	pixels[i*4+2] = pixels[i*4+2] * bPcent;  
		}
		
		ret.width = Arstider.checkIn(w, buffer.width);
		ret.height = Arstider.checkIn(h, buffer.height);	
		ret.getContext("2d").putImageData(imageData, 0, 0);
	
		return ret;
	};
	
	
	Arstider.blur = function(buffer, force, quality, x, y, w, h){
		var 
			i = 0,
			copy = Buffer.create(buffer.name+"_blurred_temp"), 
			copyCtx = copy.getContext("2d"), 
			ratio = (1/force),
			ret = Buffer.create(buffer.name+"_blurred"),
			retCtx = ret.getContext("2d")
		;
		
		Buffer.setRenderMode(copy.name, "AUTO");
		Buffer.setRenderMode(ret.name, "AUTO");
		
		ret.width = Arstider.checkIn(w, buffer.width);
		ret.height = Arstider.checkIn(h, buffer.height);
		copy.width *= ratio;
		copy.height *= ratio;
		
		for(i; i<quality; i++){
			if(i === 0){
				copyCtx.drawImage(buffer, Arstider.checkIn(x, 0), Arstider.checkIn(y, 0), copy.width, copy.height);
				retCtx.drawImage(copy, 0, 0, ret.width, ret.height);
			}
			else{
				copyCtx.clearRect(0,0,copy.width, copy.height);
				copyCtx.drawImage(ret, 0, 0, copy.width, copy.height);
				retCtx.clearRect(0,0,ret.width, ret.height);
				retCtx.drawImage(copy, 0, 0, ret.width, ret.height);
			}
		}
			
		return ret;
	};
});