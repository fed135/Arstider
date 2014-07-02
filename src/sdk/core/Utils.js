/**
 * Arstider Utilities and namespace wrapper
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Engine Namespace
 * @namespace Arstider
 * @type {Object}
 */
window.Arstider = {};

/**
 * Gets a number timestamp, usefull for id-ing or cache busting
 * @memberof Arstider
 * @type {function}
 * @return {number} the timestamp
 */
Arstider.timestamp = function(){
	return Date.now();
};

/**
 * Generates a Unique UID string
 * @memberof Arstider
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
 * Indicates if the engine should remain with canvas2D context or attempt WebGl rendering
 * @memberof Arstider
 * @type {boolean}
 */
Arstider.force2d = true;

/**
 * Re-usable empty object
 * @memberof Arstider
 * @const
 * @type {Object}
 */
Arstider.emptyObject = {};

/**
 * Re-usable empty function
 * @memberof Arstider
 * @const
 * @type {function()}
 */
Arstider.emptyFunction = function(){};

/**
 * Re-usable empty string
 * @memberof Arstider
 * @const
 * @type {string}
 */
Arstider.emptyString = "";

/**
 * Re-usable empty images url
 * @memberof Arstider
 * @const
 * @type {string}
 */
Arstider.emptyImgSrc = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

/**
 * Max FPS value
 * @memberof Arstider
 * @type {number}
 */
Arstider.FPS = 60;

/**
 * Saved screen states
 * @memberof Arstider
 * @const
 * @type {Object}
 */
Arstider.savedStates = {};

/**
 * Degrees-to-radians constant
 * @memberof Arstider
 * @const
 * @type {number}
 */
Arstider.degToRad = Math.PI/180;

/**
 * Default composition mode constant
 * @memberof Arstider
 * @const
 * @type {string}
 */
Arstider.defaultComposition = "source-over";

/**
 * Default color constant
 * @memberof Arstider
 * @const
 * @type {string}
 */
Arstider.defaultColor = "transparent";

/**
 * Utility function to apply a method through a desired scope
 * @memberof Arstider
 * @const
 * @param {function(this:selfObj)} fn Method to call
 * @param {*} selfObj The scope
 * @param {Array|null} var_args Arguments
 * @return {function()} The function with the proper scope
 */
Arstider.delegate = function(fn, selfObj, var_args){
	return (fn.call.apply(fn.bind, arguments));
};

/**
 * Quick if-exist method 
 * @memberof Arstider
 * @const
 * @param {*} val The value to check against undefined
 * @param {*} def The default value to provide is val is undefined
 * @return {*} The final value
 */
Arstider.checkIn = function(val, def){
	if(val === undefined) return def;
	return val;
};

/**
 * Test if a value exist
 * @memberof Arstider
 * @const
 * @param {*} val The value to check against undefined
 * @return {*} A boolean
 */
Arstider.isDefine = function(val){
	return typeof val != 'undefined';
};


/**
 * Multiple check-if-exist method in order of fallback
 * @memberof Arstider
 * @const
 * @param {Array} val The values to check against undefined, one after another
 * @param {*} def The default value to provide if all val are undefined
 * @return {*} The final value
 */
 Arstider.firstOf = function(val, def){
 	if(!val.length) return def;
 	for(var i = 0; i<val.length; i++){
 		if(val[i] != undefined) return val[i];
 	}
 	return def;
 };

/**
 * Indicates whether or not to output full verbose warnings
 * 
 * 0 = nothing,
 * 1 = important warnings
 * 2 = notices
 * 3+ = EVERYTHING!
 * @memberof Arstider
 * @type {number}
 */
Arstider.verbose = 0;

/**
 * Removes duplicate entries from an array
 * @memberof Arstider
 * @const
 * @param {Array} arr The array to shuffle
 * @return {Array} The shuffled array
 */
Arstider.trimDuplicates = function(arr){
    var 
    	o = {},
        i = 0,
        l = arr.length,
        r = []
    ;

    for (i; i<l; i++){
        o[arr[i]] = arr[i];
    }

    for (i in o) {
        if(o.hasOwnProperty(i)) r.push(o[i]);
    }

    arr = r;
    return arr;
};

/**
 * Attempts to reload the page
 * @memberof Arstider
 * @const
 */
 Arstider.reload = function() {
    if("reload" in window.location) window.location.reload();
    else if("history" in window && "go" in window.history) window.history.go(0);
    else window.location.href = window.location.href;
};

/**
 * Detects if an element is a plain object
 * @memberof Arstider
 * @const
 * @param {*} obj The object to analyse
 * @return {boolean}
 */
Arstider.isObject = function(obj){
	if(!obj || !(typeof obj === "object") || obj.nodeType || Arstider.isWindow(obj)) return false;
	if (obj.constructor && !Object.prototype.hasOwnProperty.call(obj, "constructor") && !Object.prototype.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) return false;
    var key;
    for (key in obj) {
        if(obj.hasOwnProperty(key)) continue;
    }

    return (key == undefined) || Object.prototype.hasOwnProperty.call(obj, key);
};

/**
 * Detects if an element is the window element
 * @memberof Arstider
 * @const
 * @param {*} obj The object to analyse
 * @return {boolean}
 */
Arstider.isWindow = function(obj){
	return obj && (typeof obj === "object") && "setInterval" in obj;
};

/**
 * Find the length of an Object or array
 * @memberof Arstider
 * @const
 * @param {*} obj The object to find the length of
 * @return {number} The length 
 */
Arstider.lengthOf = function(obj){
    if(typeof obj === "array") return obj.length;
    else if(Arstider.isObject(obj)){
        var 
        	l = 0,
            i
        ;

        for (i in obj) {
            if (obj.hasOwnProperty(i)) l ++;
        }

        return l;
    }
    return 0;
};

/**
 * Compares two elements
 * @memberof Arstider
 * @const
 * @param {*} a The first element
 * @param {*} b The second element
 * @return {boolean}
 */
Arstider.compare = function(a, b){
    var i;

    if(typeof a !== typeof b) return false;

    switch (typeof a){
        case "object":
            if(Arstider.lengthOf(a) !== Arstider.lengthOf(b)) return false;

            for(i in a) {
                if (a.hasOwnProperty(i)){
                    if(!b.hasOwnProperty(i) || !Arstider.compare(a[i], b[i])) return false;
                }
            }

            for(i in b){
                if(b.hasOwnProperty(i) && !a.hasOwnProperty(i)) return false;
            }

            break;
        case "array":
            i = a.length;
            if(i !== b.length) return false;

            i--;
            while(i >= 0){
                if(!Arstider.compare(a[i], b[i])) return false;
                i--;
            }

            break;
        default:
            return a === b;
    }

    return true;
};

/**
 * Fisher-Yates array shuffling method
 * @memberof Arstider
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
 * @memberof Arstider
 * @const
 * @param {number} i The number to round
 * @return {number} The rounded number
 */
Arstider.chop = function(i){
	return (0.5 + i) | 0;
};

/**
 * Generic, simple mixin function. Replaces undefined elements in obj A with properties of obj B 
 * @memberof Arstider
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
 * @memberof Arstider
 * @const
 * @param {Object} obj The object to copy
 * @param {boolean} includeMethods Whether or not to include functions, defaults to false 
 * @return {Object} The newly created object
 */
Arstider.clone = function(obj, includeMethods, prefix){
	return Arstider.mixin({}, obj, true, includeMethods, prefix);
};

/**
 * Utility function to clone an object recursively
 * @memberof Arstider
 * @const
 * @param {Object} obj The object to copy
 */
Arstider.deepClone = function(obj) {

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = Arstider.deepClone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = Arstider.deepClone(obj[attr]);
        }
        return copy;
    }
    if(Arstider.verbose > 0){
   		console.warn("Arstider.deepClone: Object type unsupported ",obj);
   	}
}

/**
 * Supers the values of a module to it's parent module
 * @memberof Arstider
 * @param {*} child The child that will super to a defined inherited parent - requires the constructor to have been Inherited at least once
 */
Arstider.Super = function(child, parent){
	if(arguments.length > 2) parent.apply(child, Array.prototype.slice.call(arguments,2));
	else parent.call(child);
};

/**
 * Parse a string for safe server storage
 * http://ajaxref.com/
 * @memberof Arstider
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
 * @memberof Arstider
 * @param {*} child The child module
 * @param {*} parent The module that will gives it's properties to the child
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
 * @memberof Arstider
 * @const
 * @param {function()} callback The called method for rendering
 */
Arstider.fixedAnimationFrame = function(callback){
	Arstider.__animTimer = window.setTimeout(callback, 1000/Arstider.FPS);
};

/**
 * Cancels the fixed drawing rate, when vendor-prefixed is unavailable or because of platform restrictions
 * @memberof Arstider
 * @const
 * @param {*} ref The requestAnimationFrame method
 */
Arstider.fixedCancelAnimationFrame = function(ref){
	if(Arstider.__animTimer != undefined) window.clearTimeout(Arstider.__animTimer);
};

/**
 * Global blobURL cache
 * @memberof Arstider
 * @private
 * @type {Object}
 */
Arstider.blobCache = {empty:{url:Arstider.emptyImgSrc, size:0}};

/**
 * Clears cached blobURLs
 * @memberof Arstider
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
 * Sets the FPS of the game (max 60)
 * @memberof Arstider
 * @type {function} 
 */
Arstider.setFPS = function(val){
	val = val || 60;

	if(val == "auto" || val >= 60){
		Arstider.FPS = 60;
		/**
		 * Parses vendor-prefixed values for requesting an animation frame
		 * @memberof Arstider
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
		 * @memberof Arstider
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
	}
	else{
		Arstider.FPS = val;
		Arstider.requestAnimFrame = Arstider.fixedAnimationFrame;
		Arstider.cancelAnimFrame = Arstider.fixedCancelAnimationFrame;
	}
};
	
/**
 * Default rendering style
 * @memberof Arstider
 * @type {string}
 */
Arstider.defaultRenderStyle = "auto";
	
/**
 * Collection of the intantiated buffers
 * @memberof Arstider
 * @type {Object}
 */
Arstider.bufferPool = {};
	
/**
 * Counts the number of buffers in the system
 * @memberof Arstider
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
 * @memberof Arstider
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