/**
 * Engine Namespace
 * @const
 * @type {Object}
 */
window.Arstider = {};

/**
 * Re-usable empty object
 * @const
 * @type {Object}
 */
Arstider.emptyObject = {};

/**
 * Re-usable empty function
 * @const
 * @type {function()}
 */
Arstider.emptyFunction = function(){};

/**
 * Re-usable empty string
 * @const
 * @type {string}
 */
Arstider.emptyString = "";

/**
 * Re-usable empty images url
 * @const
 * @type {string}
 */
Arstider.emptyImgSrc = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

/**
 * Quick-ref for Module Inheritance
 * @const
 * @private
 * @type {Object}
 */
Arstider._inheritanceHistory = {};

/**
 * Min/Max FPS value
 * @const
 * @type {number}
 */
Arstider._fullFPS = 1000/60;

/**
 * Utility function to apply a method through a desired scope
 * @const
 * @param {function(this:selfObj, [?])} fn Method to call
 * @param {?} selfObj The scope
 * @param {Array=} var_args Arguments
 * @return {function([?])} The function with the proper scope
 */
Arstider.delegate = function(fn, selfObj, var_args){
	return (fn.call.apply(fn.bind, arguments));
};

/**
 * Quick if-exist method 
 * @const
 * @param {?} val The value to check against undefined
 * @param {?} def The default value to provide is val is undefined
 * @return {?} The final value
 */
Arstider.checkIn = function(val, def){
	if(val === undefined) return def;
	return val;
};

/**
 * Fisher-Yates array shuffling method
 * @const
 * @param {Array} arr The array to shuffle
 * @return {Array} The shuffled array
 */
Arstider.randomSort = function(arr){
	var i = arr.length, j, temp;
	if ( i === 0 ) return false;
	while ( --i ) {
	   j = Math.floor( Math.random() * ( i + 1 ) );
	   temp = arr[i];
	   arr[i] = arr[j]; 
	   arr[j] = temp;
	}
	return arr;
};

/**
 * Quick number rounding method (see jsperf)
 * @const
 * @param {number} i The number to round
 * @return {number} The rounded number
 */
Arstider.chop = function(i){
	return (0.5 + i) | 0;
};

/**
 * Supers the values of a module to it's parent module
 * @param {?} child The child that will super to a defined inherited parent - requires the constructor to have been Inherited at least once
 */
Arstider.Super = function(child){
	var parent = Arstider._inheritanceHistory[child.constructor.toString()];
	if(arguments.length > 1) parent.apply(child, Array.prototype.slice.call(arguments,1));
	else parent.call(child);
};

/**
 * Creates Inheritance for a module
 * @param {?} child The child module
 * @param {?} parent The module that will gives it's properties to the child
 */
Arstider.Inherit = function(child, parent){
	if(parent instanceof Function || typeof parent === 'function'){
		Arstider._inheritanceHistory[child.toString()] = parent;
		child.prototype = new parent();
		child.prototype.constructor = child;
	}
	else console.error("could not make ",child, " inherit", parent);
};

/**
 * Fixed drawing rate, when vendor-prefixed is unavailable or because of platform restrictions
 * @const
 * @param {function()} callback The called method for rendering
 */
Arstider.fixedAnimationFrame = function(callback){
	window.setTimeout(callback, Arstider._fullFPS);
};

/**
 * Cancels the fixed drawing rate, when vendor-prefixed is unavailable or because of platform restrictions
 * @const
 * @param {?=} ref The requestAnimationFrame method
 */
Arstider.fixedCancelAnimationFrame = function(ref){
	window.clearTimeout(ref);
};
	
/**
 * Parses vendor-prefixed values for requesting an animation frame
 * @const
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
 * Parses vendor-prefixed values for canceling request animation frame
 * @const
 */
Arstider.cancelAnimFrame = (function(){
	return	window.cancelAnimationFrame    || 
		window.webkitCancelAnimationFrame  || 
		window.mozCancelAnimationFrame     || 
		window.oCancelAnimationFrame       || 
		window.msCancelAnimationFrame      || 
		Arstider.fixedCancelAnimationFrame;
})();


/**
 * Image Transformations
 */
require(["Arstider/Buffer"], function(Buffer){
	
	/**
	* Inverts the colors of the Entity.
	* @param {HTMLCanvasElement} buffer The target data buffer
	* @param {number=} x Optional zone horizontal offset
	* @param {number=} y Optional zone vertical offset
	* @param {number=} w Optional zone width
	* @param {number=} h Optional zone height
	* @return {HTMLCanvasElement} The newly created buffer with the inverted colors
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
	* @param {HTMLCanvasElement} buffer The target data buffer
	* @param {number=} x Optional zone horizontal offset
	* @param {number=} y Optional zone vertical offset
	* @param {number=} w Optional zone width
	* @param {number=} h Optional zone height
	* @return {HTMLCanvasElement} The newly created buffer with the grayscaled colors
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
	
	/**
	 * Tints an element
	 * @param {HTMLCanvasElement} buffer The target data buffer
	 * @param {number} r Red value
	 * @param {number} g Green value
	 * @param {number} b Blue value
	 * @param {number=} x Optional zone horizontal offset
	 * @param {number=} y Optional zone vertical offset
	 * @param {number=} w Optional zone width
	 * @param {number=} h Optional zone height
	 * @return {HTMLCanvasElement} The newly created buffer with the new colors
	 */
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
	
	/**
	 * Blurs an element
	 * @param {HTMLCanvasElement} buffer The target data buffer
	 * @param {number} force The amount of blur to add
	 * @param {number} quality The amount of passes (more passes for better looking blur, at the cost of a longer process)
	 * @param {number=} x Optional zone horizontal offset
	 * @param {number=} y Optional zone vertical offset
	 * @param {number=} w Optional zone width
	 * @param {number=} h Optional zone height
	 * @return {HTMLCanvasElement} The newly created buffer with the blurred content
	 */
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