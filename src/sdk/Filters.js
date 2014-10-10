define("Arstider/Filters", ["Arstider/Buffer", "Arstider/Browser"], /** @lends Filters */ function(Buffer, Browser){
	
	/**
	 * @namespace Filters
	 * @type {Object}
	 */
	var Filters = {};

	/**
	 * Inverts the colors of the Entity.
	 * @memberof Filters
	 * @param {Buffer} buffer The target data buffer
	 * @param {number=} x Optional zone horizontal offset
	 * @param {number=} y Optional zone vertical offset
	 * @param {number=} w Optional zone width
	 * @param {number=} h Optional zone height
	 * @return {Buffer} The newly created buffer with the inverted colors
	 */
	Filters.invertColors = function(buffer, x, y, w, h){
		
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
	 * @memberof Filters
	 * @param {Buffer} buffer The target data buffer
	 * @param {number=} x Optional zone horizontal offset
	 * @param {number=} y Optional zone vertical offset
	 * @param {number=} w Optional zone width
	 * @param {number=} h Optional zone height
	 * @return {Buffer} The newly created buffer with the grayscaled colors
	 */
	Filters.grayscale = function(buffer, x, y, w, h) {
		
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
	 * @memberof Filters
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
	Filters.tint = function(buffer, r, g, b, f, x, y, w, h){
		var 
			imageData = buffer.context.getImageData(Arstider.checkIn(x,0),Arstider.checkIn(y,0), Arstider.checkIn(w,buffer.width), Arstider.checkIn(h,buffer.height)), 
			pixels = imageData.data, 
			i = (Arstider.checkIn(w,buffer.width) * Arstider.checkIn(h,buffer.height))-1,
			ret = new Buffer({
				name:buffer.name + "_tint"+r+g+b,
				width:Arstider.checkIn(w, buffer.width),
				height:Arstider.checkIn(h, buffer.height)
			})
		;
		
		f = Arstider.checkIn(f, 1);
		//console.log("tinting ", i, " pixels");
		for (i; i >= 0; i--) {  
		    pixels[i*4] = Arstider.min(r + pixels[i*4] * f);
	    	pixels[i*4+1] = Arstider.min(g + pixels[i*4+1] * f); 
	    	pixels[i*4+2] = Arstider.min(b + pixels[i*4+2] * f); 
		}
			
		ret.context.putImageData(imageData, 0, 0);
	
		return ret;
	};
	
	/**
	 * Blurs an element
	 * @memberof Filters
	 * @param {Buffer} buffer The target data buffer
	 * @param {number} force The amount of blur to add
	 * @param {number} quality The amount of passes (more passes for better looking blur, at the cost of a longer process)
	 * @param {number=} x Optional zone horizontal offset
	 * @param {number=} y Optional zone vertical offset
	 * @param {number=} w Optional zone width
	 * @param {number=} h Optional zone height
	 * @return {Buffer} The newly created buffer with the blurred content
	 */
	Filters.blur = function(buffer, force, quality, x, y, w, h){
		
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
				copy.context.drawImage(buffer.data, Arstider.checkIn(x, 0), Arstider.checkIn(y, 0), copy.width, copy.height);
				ret.context.drawImage(copy.data, 0, 0, ret.width, ret.height);
			}
			else{
				copy.context.clearRect(0,0,copy.width, copy.height);
				copy.context.drawImage(ret.data, 0, 0, copy.width, copy.height);
				ret.context.clearRect(0,0,ret.width, ret.height);
				ret.context.drawImage(copy.data, 0, 0, ret.width, ret.height);
			}
		}
			
		return ret;
	};

	return Filters;
});