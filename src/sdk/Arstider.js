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
Arstider = {
	_core : {
		emptyObject : {},
		emptyFunction : function(){},
		emptyString : "",
		emptyImgSrc : "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",
		savedStates : {}
	},
	debug : {
		logEnabled : true,
		profilerEnabled : true,
		optimizerEnabled : true,
		verboseLevel : 0
	},
	math : {
		degToRad : Math.PI/180,
		radToDeg : 180/Math.PI
	},
	scene : null,
	settings : {
		fps : 60,
		defaultComposition : "source-over",
		defaultColor : "transparent",
		defaultRenderStyle : "smooth"
	},
	utils: {}
};


/**
 * 	======================
 * 	=====	 		 =====
 * 	===	     CORE 	   ===
 * 	=====			 =====
 * 	======================
 */

/**
 * Fixed drawing rate, when vendor-prefixed is unavailable or because of platform restrictions
 * @memberof Arstider
 * @const
 * @param {function()} callback The called method for rendering
 */
Arstider._core.fixedAnimationFrame = function(callback, dt){
	
	var 
		targetFPS = Math.round(1000/Arstider.FPS),
		nextFrame = Math.max(10, targetFPS - (dt - targetFPS))
	;

	Arstider.__animTimer = window.setTimeout(callback, nextFrame);
};

/**
 * Cancels the fixed drawing rate, when vendor-prefixed is unavailable or because of platform restrictions
 * @memberof Arstider
 * @const
 * @param {*} ref The requestAnimationFrame method
 */
Arstider._core.fixedCancelAnimationFrame = function(ref){

	if(Arstider.__animTimer != undefined) window.clearTimeout(Arstider.__animTimer);
};


/**
 * 	======================
 * 	=====	 		 =====
 * 	===	    DEBUG 	   ===
 * 	=====			 =====
 * 	======================
 */

Arstider.debug.error = function(type, props){
	var i, err = new type(props.message);
	for(i in props){
		if(i != "message") err[i] = props[i];
	}
	return err;
}

Arstider.debug.log = function(data, level){
	level = level || 1; 

	var 
		message = "",
		asset = null
	;

	if(typeof data === 'string') message=data;
	else{
		if(data.message) message=data.message;
		if(data.asset) asset=data.asset;
	}

	if(Arstider.verbose >= level){
		//Error output, for stack info
		if(asset!=null){
			console.log('%c', 'padding:'+(asset.height || null)+'px '+(asset.width || null)+'px;line-height:'+(asset.height || null)+'px;background:url('+(asset.src || null)+')');
		}
		console.error('%c'+message, 'color:purple');
	}
};

/**
 * Disables the console element
 * @memberof Arstider
 * @type {function}
 */
Arstider.debug.disableConsole = function(){
	window.console = {
		log:Arstider.emptyFunction,
		warn:Arstider.emptyFunction
		//error:Arstider.emptyFunction
	};
};

/**
 * 	======================
 * 	=====	 		 =====
 * 	===	    MATH 	   ===
 * 	=====			 =====
 * 	======================
 */

Arstider.math.powerOf2 = function(num){

	return (num > 0 && (num & (num - 1)) === 0);
};

Arstider.math.nextPowerOf2 = function(number){
	
    if (number > 0 && (number & (number - 1)) === 0) // see: http://goo.gl/D9kPj
        return number;
    else{
        var result = 1;
        while (result < number) result <<= 1;
        return result;
    }
};

/**
 * Calculate the distance between 2 coordinates in 3d space
 * @memberof Arstider.math
 * @type {function}
 * @param {object} pointA The coordinates of the first point
 * @param {object} pointB The coordinates of the second point
 * @return {number} the distance between the 2 points
 */
Arstider.math.distance = function(pointA, pointB){

	return Math.sqrt(Math.pow((pointB.x - pointA.x),2) + Math.pow((pointB.y - pointA.y),2) + Math.pow((pointB.z - pointA.z),2));
};

/**
 * Calculate direction in radians of pointB in relation to pointA
 * @memberof math.Arstider
 * @type {function}
 * @param {object} pointA The coordinates of the first point
 * @param {object} pointB The coordinates of the second point
 * @return {object} the rotation matrix between the 2 points
 */
Arstider.math.direction = function(pointA, pointB){

	return {
		x:Math.arctan((pointB.z-pointA.z)/(pointB.y - pointA.y)),
		y:Math.arctan((pointB.x-pointA.x)/(pointB.z - pointA.z)),
		z:Math.arctan((pointB.y-pointA.y)/(pointB.x - pointA.x))
	};
};

/**
 * 	======================
 * 	=====	 		 =====
 * 	===	   SETTINGS	   ===
 * 	=====			 =====
 * 	======================
 */

/**
 * Sets the FPS of the game (max 60)
 * @memberof Arstider
 * @type {function}
 */
Arstider.settings.setFPS = function(val){
	val = val || 60;

	if(val == "auto" || val >= 60){
		Arstider.settings.FPS = 60;
		Arstider._core.requestAnimFrame = window.requestAnimationFrame;
		Arstider._core.cancelAnimFrame = window.cancelAnimationFrame;
	}
	else{
		Arstider.settings.FPS = val;
		Arstider._core.requestAnimFrame = Arstider.fixedAnimationFrame;
		Arstider._core.cancelAnimFrame = Arstider.fixedCancelAnimationFrame;
	}
};

/**
 * 	======================
 * 	=====	 		 =====
 * 	===	    UTILS 	   ===
 * 	=====			 =====
 * 	======================
 */

/**
 * Gets a number timestamp, usefull for id-ing or cache busting
 * @memberof Arstider
 * @type {function}
 * @return {number} the timestamp
 */
Arstider.utils.timestamp = function(){

	return Date.now();
};

Arstider.utils.queryStringToObject = function(str) {
	return (str || document.location.search).replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
};

/**
 * Quick if-exist method
 * @memberof Arstider
 * @const
 * @param {*} val The value to check against undefined
 * @param {*} def The default value to provide is val is undefined
 * @return {*} The final value
 */
Arstider.utils.checkIn = function(val, def){
	if(val === undefined) return def;
	return val;
};

/**
 * Multiple check-if-exist method in order of fallback
 * @memberof Arstider
 * @const
 * @param {Array} val The values to check against undefined, one after another
 * @param {*} def The default value to provide if all val are undefined
 * @return {*} The final value
 */
 Arstider.utils.firstOf = function(val, def){
 	if(!val.length) return def;
 	for(var i = 0; i<val.length; i++){
 		if(val[i] != undefined) return val[i];
 	}
 	return def;
 };

/**
 * Removes duplicate entries from an array
 * @memberof Arstider
 * @const
 * @param {Array} arr The array to shuffle
 * @return {Array} The shuffled array
 */
Arstider.utils.trimDuplicates = function(arr){
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
 Arstider.utils.reload = function() {
    if("reload" in window.location) window.location.reload();
    else if("history" in window && "go" in window.history) window.history.go(0);
    else window.location.href = window.location.href;
};

/**
 * Find the length of an Object or array
 * @memberof Arstider
 * @const
 * @param {*} obj The object to find the length of
 * @return {number} The length
 */
Arstider.utils.lengthOf = function(obj){

	if(typeof obj === "array") return obj.length;

    var
		l = 0,
		i
	;

	for (i in obj) {
		if (obj.hasOwnProperty(i)) l ++;
	}

	return l;
};

/**
 * Compares two elements
 * @memberof Arstider
 * @const
 * @param {*} a The first element
 * @param {*} b The second element
 * @return {boolean}
 */
Arstider.utils.compare = function(a, b){
    var i;

    if(typeof a !== typeof b) return false;

    switch (typeof a){
        case "object":
            if(Arstider.utils.lengthOf(a) !== Arstider.utils.lengthOf(b)) return false;

            for(i in a) {
                if (a.hasOwnProperty(i)){
                    if(!b.hasOwnProperty(i) || !Arstider.utils.compare(a[i], b[i])) return false;
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
                if(!Arstider.utils.compare(a[i], b[i])) return false;
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
Arstider.utils.randomSort = function(arr){

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
 * Generic, simple mixin function. Replaces undefined elements in obj A with properties of obj B
 * @memberof Arstider
 * @const
 * @param {Object} objA The object that will receive the new properties
 * @param {Object} objB The object to transfer the properties from
 * @param {boolean} force Whether or not to override objA values with objB values in case they were already defined
 * @param {boolean} includeMethods Whether or not to include functions, defaults to false
 * @return {Object} Returns the updated objA
 */
Arstider.utils.mixin = function(objA, objB, force, includeMethods, prefix){

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
Arstider.utils.clone = function(obj, includeMethods, prefix){

	return Arstider.utils.mixin({}, obj, true, includeMethods, prefix);
};

/**
 * Utility function to clone an object recursively
 * @memberof Arstider
 * @const
 * @param {Object} obj The object to copy
 */
Arstider.utils.deepClone = function(obj, exclude) {

	exclude = exclude || [];

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
            copy[i] = Arstider.utils.deepClone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
        	if(exclude.indexOf(attr) != -1) continue;
            if (obj.hasOwnProperty(attr)) copy[attr] = Arstider.utils.deepClone(obj[attr]);
        }
        return copy;
    }
    Arstider.debug.log("Arstider.deepClone: Object type unsupported");
}

/**
 * Utility function to merge two objects recursively
 * @memberof Arstider
 * @const
 * @param {Object} src The object to copy from
 * @param {Object} target The object to copy to
 * @param {Boolean} clone Clones the source object first when true
 */
Arstider.utils.deepMerge = function(src, target, clone, includeMethods, exclude)
{
	if(clone) src = Arstider.utils.deepClone(src);
	exclude = exclude || [];

	var isArray = Array.isArray(src);
	if (isArray){
		target = target || [];
		src.forEach(function(val, i)
		{
			var val = src[i];
			if (typeof src[i] === 'undefined') {
				target[i] = val;
			} else if (typeof val === 'object') {
				target[i] = Arstider.utils.deepMerge(val, target[i], false, includeMethods, exclude);
			} else if (Array.isArray(val)){
				target[i] = Arstider.utils.deepMerge(val, target[i], false, includeMethods, exclude);
			} else {
				target[i] = val;
			}
		});
	}
	else{
		target = target || {};

		for(var key in src){
			if(exclude.indexOf(key) != -1) continue;
			if(!(key in src) || src[key] == undefined) continue;

			var val = src[key];
			if(Array.isArray(val)){
				target[key] = Arstider.utils.deepMerge(val, target[key], false, includeMethods, exclude);
			}
			else if(typeof val === 'object'){
				target[key] = target[key] || {};
				if (!src[key]) {
					target[key] = val;
				} else {
					target[key] = Arstider.utils.deepMerge(val, target[key], false, includeMethods, exclude);
				}
			}
			else{
				if(!includeMethods && src[key] instanceof Function) continue;
				target[key] = val;
			}
		}
	}

	return target;
}

/**
 * Supers the values of a module to it's parent module
 * @memberof Arstider
 * @param {*} child The child that will super to a defined inherited parent - requires the constructor to have been Inherited at least once
 */
Arstider.utils.Super = function(child, parent){

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
Arstider.utils.URIEncode = function(val){

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
Arstider.utils.Inherit = function(child, parent){

	if(parent instanceof Function || typeof parent === 'function'){
		child.prototype = Object.create(parent.prototype);
		child.prototype.constructor = child;
	}
	else console.error("Arstider.Inherit: Could not make ",child, " inherit", parent);
};

/**
 * Serializes Objects for XHR data
 * @memberof Arstider
 * @type {function}
 * @param {Object} obj The object to serialize
 * @return {string} The serialized Object
 */
Arstider.utils.serialize = function(obj, prefix) {
	
	if(typeof obj === "string" || obj == null) return obj;

	var str = [];
	for(var p in obj){
		var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
    	str.push(typeof v == "object" ?
      	Arstider.utils.serialize(v, k) :
		encodeURIComponent(k) + "=" + encodeURIComponent(v));
  	}
  	return str.join("&");
};
