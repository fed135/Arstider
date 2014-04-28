/**
 * Arstider Utilities and namespace wrapper
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Engine Namespace
 * @const
 * @type {Object}
 */
window.Arstider = {};

/**
* RandomGenerator
* @constructor
* @param {number=} seed The generator seed.
*/
Arstider.RandomGenerator = function(seed) {

    /** @type {number} */
    this.seed = seed && !isNaN(seed) ? seed : Arstider.timestamp();

    /** @type {number} @private */
    this.i_ = 0;

    /** @type {number} @private */
    this.j_ = 0;

    /** @type {Array.<number>} @private */
    this.S_ = [];

    this.init(('' + seed).split(''));
};

/**
 * Gets a number timestamp, usefull for id-ing or cache busting
 * @type {function}
 * @return {number} the timestamp
 */
Arstider.timestamp = function(){
	return (new Date()).getTime();
};

/**
 * Generates a Unique UID string
 * @type {function}
 * @return {String} the resulting unique ID
 */
Arstider.guid = function() {
  function s4(){
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

/**
* Get a random number
* @param {Array.<number>} key The generator key.
*/
Arstider.RandomGenerator.prototype.init = function(key) {
    var i, j, t;
    for (i = 0; i < 256; ++i) {
        this.S_[i] = i;
    }
    j = 0;
    for (i = 0; i < 256; ++i) {
        j = (j + this.S_[i] + key[i % key.length]) & 255;
        t = this.S_[i];
        this.S_[i] = this.S_[j];
        this.S_[j] = t;
    }
    this.i_ = 0;
    this.j_ = 0;
};

/**
* Get a random number
* @return {number} A random number.
*/
Arstider.RandomGenerator.prototype.next = function() {
    var t;
    this.i_ = (this.i_ + 1) & 255;
    this.j_ = (this.j_ + this.S_[this.i_]) & 255;
    t = this.S_[this.i_];
    this.S_[this.i_] = this.S_[this.j_];
    this.S_[this.j_] = t;
    return this.S_[(t + this.S_[this.i_]) & 255];
};

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
 * Min/Max FPS value
 * @const
 * @type {number}
 */
Arstider._fullFPS = 1000/60;

/**
 * Degrees-to-radians constant
 * @const
 * @type {number}
 */
Arstider.degToRad = Math.PI/180;

/**
 * Default composition mode constant
 * @const
 * @type {string}
 */
Arstider.defaultComposition = "source-over";

/**
 * Default color constant
 * @const
 * @type {string}
 */
Arstider.defaultColor = "transparent";

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
 * Indicates whether or not to output full verbose warnings
 * 
 * 0 = nothing,
 * 1 = important warnings
 * 2 = notices
 * 3+ = EVERYTHING!
 * 
 * @type {number}
 */
Arstider.verbose = 0;

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
 * Generic, simple mixin function. Replaces undefined elements in obj A with properties of obj B 
 * @const
 * @param {Object} objA The object that will receive the new properties
 * @param {Object} objB The object to transfer the properties from
 * @param {boolean} force Whether or not to override objA values with objB values in case they were already defined
 * @param {boolean} includeMethods Whether or not to include functions, defaults to false
 * @return {Object} Returns the updated objA
 */
Arstider.mixin = function(objA, objB, force, includeMethods, prefix){
	
	for(var i in objB){
		if(objA[i] == undefined || force){
			if(objB[i] instanceof Function || typeof objB[i] === 'function'){
				if(includeMethods){
					objA[(prefix || "") + i] = objB[i];
				}
			}
			else objA[(prefix || "") + i] = objB[i];
		}
	}
	
	return objA;
};

/**
 * Utility function to copy the simple direct properties of an object
 * @const
 * @param {Object} obj The object to copy
 * @param {boolean} includeMethods Whether or not to include functions, defaults to false 
 * @return {Object} The newly created object
 */
Arstider.clone = function(obj, includeMethods, prefix){
	return Arstider.mixin({}, obj, true, includeMethods, prefix);
};

/**
 * Supers the values of a module to it's parent module
 * @param {?} child The child that will super to a defined inherited parent - requires the constructor to have been Inherited at least once
 */
Arstider.Super = function(child, parent){
	if(arguments.length > 2) parent.apply(child, Array.prototype.slice.call(arguments,2));
	else parent.call(child);
};

/**
 * Parse a string for safe server storage
 * http://ajaxref.com/
 * @type {function}
 * @param {string} val The string to make uri-safe
 * @return {string} The uri-safe string
 */
Arstider.URIEncode = function(val){
	var encodedVal;
	if(!encodeURIComponent){
		encodedVal = escape(val);
		encodedVal = encodedVal.replace(/@/g, '%40');
		encodedVal = encodedVal.replace(/\//g, '%2F');
		encodedVal = encodedVal.replace(/\+/g, '%2B');
	}else{
   		encodedVal = encodeURIComponent(val);
		encodedVal = encodedVal.replace(/~/g, '%7E');
		encodedVal = encodedVal.replace(/!/g, '%21');
		encodedVal = encodedVal.replace(/\(/g, '%28');
		encodedVal = encodedVal.replace(/\)/g, '%29');
		encodedVal = encodedVal.replace(/'/g, '%27');
	}
	/* clean up the spaces and return */
	return encodedVal.replace(/\%20/g,'+'); 
};

/**
 * Creates Inheritance for a module
 * @param {?} child The child module
 * @param {?} parent The module that will gives it's properties to the child
 */
Arstider.Inherit = function(child, parent){
	if(parent instanceof Function || typeof parent === 'function'){
		child.prototype = Object.create(parent.prototype);
		child.prototype.constructor = child;
	}
	else console.warn("Arstider.Inherit: Could not make ",child, " inherit", parent);
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
 * Global blobURL cache
 * @private
 * @type {Object}
 */
Arstider.blobCache = {empty:{url:Arstider.emptyImgSrc, size:0}};

/**
 * Clears cached blobURLs
 * @type {function}
 */
Arstider.clearBlobUrls = function(){
	for(var i in Arstider.blobCache){
		try{
			window.URL.revokeObjectURL(Arstider.blobCache[i].url);
		}
		catch(e){
			if(Arstider.verbose > 2) console.log("Arstider.clearBlobUrls: could not revoke blob url '",i, "'");
		}
	}
	
	Arstider.blobCache = {empty:{url:Arstider.emptyImgSrc, size:0}};
};

/**
 * Image Transformations, requiring Buffer
 */
require(["Arstider/Buffer", "Arstider/Browser"], function(Buffer, Browser){
	
	/**
	 * Set render style for canvas tags 
	 *
	 * @private
	 * @param {HTMLCanvasElement} cnv Applies the imageRendering style from the tag's _renderMode property
	 * @param {string} style The rendering style to apply
	 */
	Arstider.setRenderStyle = function(element, style){
		
		if(style === "sharp"){
			if(Browser.name == "firefox") element.style.imageRendering = '-moz-crisp-edges';
			else if(Browser.name == "opera") element.style.imageRendering = '-o-crisp-edges';
			else if(Browser.name == "safari") element.style.imageRendering = '-webkit-optimize-contrast';
			else if(Browser.name == "ie") element.style.msInterpolationMode = 'nearest-neighbor';
			else element.style.imageRendering = 'crisp-edges';
		}
		else if(style === "auto"){
			element.style.imageRendering = 'auto';
			element.style.msInterpolationMode = 'auto';
		}
		else{
			if(Arstider.verbose > 0) console.warn("Arstider.setRenderStyle: Cannot apply mode '",style,"'");
		}
	};
	
	/**
	 * Sets image smoothing for canvas contexts 
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx The context to switch the smoothing mode on
	 * @param {Boolean} val Image smoothing activated
	 */
	Arstider.setImageSmoothing = function(ctx, val){
		var attr = 'imageSmoothingEnabled', uc = attr.charAt(0).toUpperCase() + attr.substr(1);
		ctx[attr] = ctx['ms'+uc] = ctx['moz'+uc] = ctx['webkit'+uc] = ctx['o'+uc] = val;
	}
	
	/**
	 * Default rendering style
	 * @type {string}
	 */
	Arstider.defaultRenderStyle = "auto";
	
	/**
	 * Collection of the intantiated buffers
	 * @type {Object}
	 */
	Arstider.bufferPool = {};
	
	/**
	 * Counts the number of buffers in the system
	 * @type {function}
	 * @return {number} The number of buffers
	 */
	Arstider.countBuffers = function(){
		var 
			i, 
			total = 0
		;
		
		for(i in Arstider.bufferPool){
			total ++;
		}
		
		return total;
	};
	
	/**
	 * Returns the total size of assets in memory
	 * @type {function}
	 * @return {number} memory (in MB)
	 */
	Arstider.getMemory = function(){
		var 
			i, 
			total = 0
		;
		
		for(i in Arstider.blobCache){
			total += (Arstider.blobCache[i].size || 0);
		}
		
		for(i in Arstider.bufferPool){
			total += (Arstider.bufferPool[i].getMemory());
		}
		
		return total >> 20;
	};
	
	/**
	 * Saves graphic data into a new buffer
	 * @param {string} name The name of the future Buffer
	 * @param {Image|HTMLCanvasElement} img The graphic resource to draw onto the canvas
	 * @return {Buffer} The newly created Buffer
	 */
	Arstider.saveToBuffer = function(name, img){
		
		var
			canvas = new Buffer({
				name:name,
				width:img.width,
				height:img.height
			})
		;
		
		canvas.context.drawImage(img,0,0,canvas.width,canvas.height);
		
		return canvas;
	};
	
	/**
	 * Inverts the colors of the Entity.
	 * @param {Buffer} buffer The target data buffer
	 * @param {number=} x Optional zone horizontal offset
	 * @param {number=} y Optional zone vertical offset
	 * @param {number=} w Optional zone width
	 * @param {number=} h Optional zone height
	 * @return {Buffer} The newly created buffer with the inverted colors
	 */
	Arstider.invertColors = function(buffer, x, y, w, h){
		
		var 
			imageData = buffer.context.getImageData(Arstider.checkIn(x,0),Arstider.checkIn(y,0), Arstider.checkIn(w,buffer.width), Arstider.checkIn(h,buffer.height)), 
			pixels = imageData.data, 
			i = (Arstider.checkIn(w,buffer.width), Arstider.checkIn(h,buffer.height))-1,
			ret = new Buffer({
				name:buffer.name + "_inverted_",
				width:Arstider.checkIn(w, buffer.width),
				height:Arstider.checkIn(h, buffer.height)
			})
		;
		
		
		for (i; i >= 0; i--) {  
		    pixels[i*4] = 255-pixels[i*4];
	    	pixels[i*4+1] = 255-pixels[i*4+1];  
	    	pixels[i*4+2] = 255-pixels[i*4+2];  
		}
			
		ret.context.putImageData(imageData, 0, 0);
	
		return ret;
	};
	
	/**
	 * Grayscales the colors of the Entity.
	 * @param {Buffer} buffer The target data buffer
	 * @param {number=} x Optional zone horizontal offset
	 * @param {number=} y Optional zone vertical offset
	 * @param {number=} w Optional zone width
	 * @param {number=} h Optional zone height
	 * @return {Buffer} The newly created buffer with the grayscaled colors
	 */
	Arstider.grayscale = function(buffer, x, y, w, h) {
		
		var 
			imageData = buffer.context.getImageData(Arstider.checkIn(x,0),Arstider.checkIn(y,0), Arstider.checkIn(w,buffer.width), Arstider.checkIn(h,buffer.height)), 
			pixels = imageData.data, 
			i = (Arstider.checkIn(w,buffer.width) * Arstider.checkIn(h,buffer.height))-1,
			ret = new Buffer({
				name:buffer.name + "_grayscale",
				width:Arstider.checkIn(w, buffer.width),
				height:Arstider.checkIn(h, buffer.height)
			}),
			avg = null
		;
		
		for(i; i >= 0; i--){
			avg = (pixels[i*4] + pixels[i*4+1] + pixels[i*4+2])/3;
			
			pixels[i*4] = avg;
	    	pixels[i*4+1] = avg;  
	    	pixels[i*4+2] = avg;
		}
		
		ret.context.putImageData(imageData, 0, 0);
	
		return ret;
	};
	
	/**
	 * Tints an element
	 * @param {Buffer} buffer The target data buffer
	 * @param {number} r Red value
	 * @param {number} g Green value
	 * @param {number} b Blue value
	 * @param {number=} x Optional zone horizontal offset
	 * @param {number=} y Optional zone vertical offset
	 * @param {number=} w Optional zone width
	 * @param {number=} h Optional zone height
	 * @return {Buffer} The newly created buffer with the new colors
	 */
	Arstider.tint = function(buffer, r, g, b, f, x, y, w, h){
		var 
			imageData = buffer.context.getImageData(Arstider.checkIn(x,0),Arstider.checkIn(y,0), Arstider.checkIn(w,buffer.width), Arstider.checkIn(h,buffer.height)), 
			pixels = imageData.data, 
			i = (Arstider.checkIn(w,buffer.width), Arstider.checkIn(h,buffer.height))-1,
			ret = new Buffer({
				name:buffer.name + "_tint"+r+g+b,
				width:Arstider.checkIn(w, buffer.width),
				height:Arstider.checkIn(h, buffer.height)
			})
		;
		
		f = Arstider.checkIn(f, 1);
		
		for (i; i >= 0; i--) {  
		    pixels[i*4] = Math.min(r + pixels[i*4] * f);
	    	pixels[i*4+1] = Math.min(r + pixels[i*4+1] * f); 
	    	pixels[i*4+2] = Math.min(r + pixels[i*4+2] * f); 
		}
			
		ret.context.putImageData(imageData, 0, 0);
	
		return ret;
	};
	
	/**
	 * Blurs an element
	 * @param {Buffer} buffer The target data buffer
	 * @param {number} force The amount of blur to add
	 * @param {number} quality The amount of passes (more passes for better looking blur, at the cost of a longer process)
	 * @param {number=} x Optional zone horizontal offset
	 * @param {number=} y Optional zone vertical offset
	 * @param {number=} w Optional zone width
	 * @param {number=} h Optional zone height
	 * @return {Buffer} The newly created buffer with the blurred content
	 */
	Arstider.blur = function(buffer, force, quality, x, y, w, h){
		
		var 
			i = 0,
			copy = new Buffer({
				name:buffer.name+"_blurred_temp",
				renderStyle:"auto"
			}), 
			ratio = (1/force),
			ret = new Buffer({
				name:buffer.name+"_blur",
				width:Arstider.checkIn(w, buffer.width),
				height:Arstider.checkIn(h, buffer.height),
				renderStyle:"auto"
			})
		;
		
		copy.setSize(copy.width*ratio, copy.height*ratio);
		
		for(i; i<quality; i++){
			if(i === 0){
				copy.context.drawImage(buffer.tag, Arstider.checkIn(x, 0), Arstider.checkIn(y, 0), copy.width, copy.height);
				ret.context.drawImage(copy.tag, 0, 0, ret.width, ret.height);
			}
			else{
				copy.context.clearRect(0,0,copy.width, copy.height);
				copy.context.drawImage(ret.tag, 0, 0, copy.width, copy.height);
				ret.context.clearRect(0,0,ret.width, ret.height);
				ret.context.drawImage(copy.tag, 0, 0, ret.width, ret.height);
			}
		}
			
		return ret;
	};
});

/**
 * Debug methods, requiring Engine and Events
 */
require(["Arstider/Engine", "Arstider/Events"], function(Engine, Events){
	
	/**
	 * Returns an element or a list of elements that match the search criterias for inspection
	 * @type {function}
	 * @const
	 * @param {string|null} name The name of the element to search for. If none is provided, returns all elements
	 * @param {Object|null} t The target to perform the seach in. If none is provided, seaches in the current screen
	 * @return {Array|Object} The element(s) that fit the search query
	 */
	Arstider.findElement = function(name, t){
		if(!Engine.debug) return;
		
		var 
			ret = [], 
			i = 0, 
			t = t || Engine.currentScreen
		;
			
		if(t && t.children){
			for(i; i<t.children.length; i++){
				if(!name || name === t.children[i].name){
					ret.push(t.children[i]);
				}
				if(t.children[i].children){
					ret = ret.concat(Arstider.findElement(name, t.children[i]));
				}
			}
		}
		
		if(ret.length == 1) return ret[0];
		return ret;
	};
	
	/**
	 * Draws the desired data object into a separate buffer for inspection
	 * @type {function}
	 * @const
	 * @param {Image|HTMLCanvasElement} targetData The data to draw on the debug canvas
	 */
	Arstider.debugDraw = function(targetData){
		if(!Engine.debug) return;
		
		var 
			ctx = null,
			win = document.getElementById("debugWindow")
		;
			
		if(!win){
			win = document.createElement('canvas');
			win.width=300;
			win.height=300;
			win.id = "debugWindow";
			win.style.height = "300px";
			win.style.width = "300px";
			win.style.position = "absolute";
			win.style.display = "block";
			win.style.backgroundColor = "green";
			win.style.bottom = "0px";
			win.style.right = "0px";
			win.style.zIndex = 999;
			document.body.appendChild(win);
		}
		ctx = win.getContext('2d');
		ctx.clearRect(0,0,300,300);
		ctx.drawImage(targetData, 0,0,300,300);
	};
	
	/**
	 * Broadcasts an event for debugging
	 * @type {function}
	 * @const
	 * @param {string} name The name of the event to call
	 * @param {?} param The parameters to provide the broadcast
	 * @param {?} target The target for broadcast
	 */
	Arstider.debugBroadcast = function(name, param, target){
		if(!Engine.debug) return;
		
		Events.broadcast(name, param, target);
	};
});