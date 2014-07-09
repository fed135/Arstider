/**
 * Buffer
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */

;(function(){
	
	var
		/**
		 * Static Anonymous buffer count
		 * @private
		 * @type {number}
		 */
		anonymousBuffers = 0
	;
	
	/**
	 * Defines the Buffer module
	 */
	define("Arstider/Buffer", ["Arstider/Browser", "Arstider/core/Pixel"], /** @lends Buffer */ function(Browser, Pixel){

		/**
		 * Buffer constructor
		 * Displayable data container (offscreen canvas)
		 * @class Buffer
		 * @constructor
		 * @param {Object} props The proprieties of the Buffer
		 */
		function Buffer(props){
            props = props || {};
			this.data = window.document.createElement("canvas");
            if(props.webgl) this.context = this.data.getContext("webgl") || this.data.getContext("experimental-webgl") || null;
            else this.context = this.data.getContext("2d");
			
			this.name = props.name || ("buffer"+(anonymousBuffers++));
			this.data.id = props.id || this.name;
			this.renderStyle = Arstider.checkIn(props.renderStyle, Arstider.defaultRenderStyle); 
			this.width = this.data.width = Arstider.checkIn(props.width, 1);
			this.height = this.data.height = Arstider.checkIn(props.height, 1);
			
			this.updateRenderStyle();
			
			if(Arstider.bufferPool[this.name] != undefined){
				if(Arstider.verbose > 1) console.warn("Arstider.Buffer: buffer ", this.name, " already exists, it will be ovewritten");
				Arstider.bufferPool[this.name].kill();
			}
			
			Arstider.bufferPool[this.name] = this;
		}
		
		/**
		 * Destroys the buffer from memory
		 * @type {function(this:Buffer)}
		 */
		Buffer.prototype.kill = function(){
			delete Arstider.bufferPool[this.name];
			this.width = 0;
			this.height = 0;
			this.data = null;
		};
		
		/**
		 * Returns the memory footprint of the buffer (approx.)
		 * @type {function(this:Buffer)}
		 * @return {number} The memory footprint of the buffer
		 */
		Buffer.prototype.getMemory = function(){
			return (this.height * this.width) << 3;
		};
		
		/**
		 * Updates the size of a buffer
		 * @type {function(this:Buffer)}
		 * @param {number} width The desired width to apply
		 * @param {number} height The desired height to apply
		 */
		Buffer.prototype.setSize = function(width, height){
			this.width = this.data.width = width;
			this.height = this.data.height = height;
			
			this.updateRenderStyle();
		};
		
		/**
		 * Updates the Buffer's rendering mode
		 * @type {function(this:Buffer)}
		 * @param {string|null} style Optional rendering style change
		 */
		Buffer.prototype.updateRenderStyle = function(style){
			if(style) this.renderStyle = style;
			
			if(this.renderStyle === "sharp"){
				if(Browser.name == "firefox") this.data.style.imageRendering = '-moz-crisp-edges';
				else if(Browser.name == "opera") this.data.style.imageRendering = '-o-crisp-edges';
				else if(Browser.name == "safari") this.data.style.imageRendering = '-webkit-optimize-contrast';
				else if(Browser.name == "ie") this.data.style.msInterpolationMode = 'nearest-neighbor';
				else this.data.style.imageRendering = 'crisp-edges';
			}
			else if(this.renderStyle === "auto"){
				this.data.style.imageRendering = 'auto';
				this.data.style.msInterpolationMode = 'auto';
			}
			else{
				if(Arstider.verbose > 0) console.warn("Arstider.setRenderStyle: Cannot apply mode '",this.renderStyle,"'");
			}

			var attr = 'imageSmoothingEnabled', uc = attr.charAt(0).toUpperCase() + attr.substr(1);
			this.context[attr] = this.context['ms'+uc] = this.context['moz'+uc] = this.context['webkit'+uc] = this.context['o'+uc] = (this.renderStyle == "auto");
		};
		
		/**
		 * Returns a blobURL for the canvas data
		 * @type {function(this:Buffer)}
		 * @param {string|null} type Optionnal toDataUrl parameter
		 * @return {string} The blobUrl
		 */
		Buffer.prototype.getURL = function(type){
			return this.data.toDataURL(type || "image/png");
		};
		
		/**
		 * Returns a Pixel object for the desired data
		 * @type {function(this:Buffer)}
		 * @param {number} x The x position to look at in the data 
		 * @param {number} y The y position to look at in the data
		 * @return {Pixel} The pixel object for the inputed location
		 */
		Buffer.prototype.getPixelAt = function(x, y){
			var 
				imgd = this.context.getImageData(x, y, 1, 1),
				pix = imgd.data,
				r,g,b,a
			;
			
			r = pix[0]; // red
			g = pix[1]; // green
			b = pix[2]; // blue
			a = pix[3]; // alpha
			
			return new Pixel(x, y, this.data, r, g, b, a);
		};
		
		/**
		 * Returns the alpha value for the desired data
		 * @type {function(this:Buffer)}
		 * @param {number} x The x position to look at in the data 
		 * @param {number} y The y position to look at in the data
		 * @return {number} The pixel alpha for the inputed location
		 */
		Buffer.prototype.getAlphaAt = function(x, y){
			var 
				imgd = this.context.getImageData(x, y, 1, 1),
				pix = imgd.data
			;
			
			return pix[3]; // alpha
		};
		
		/**
		 * Changes a pixel in the data
		 * @type {function(this:Buffer)}
		 * @param {number} x The x position to look at in the data 
		 * @param {number} y The y position to look at in the data
		 * @param {Pixel} The pixel object to place at the inputed location
		 */
		Buffer.prototype.setPixelAt = function(x, y, pixel){
			var 
				imgd = this.context.getImageData(x, y, 1, 1),
				pix = imgd.data
			;
			
			pix[0] = pixel.r; // red
			pix[1] = pixel.g; // green
			pix[2] = pixel.b; // blue
			pix[3] = pixel.a; // alpha
			
			this.context.putImageData(imgd, x, y);
		};

		/**
		 * Saves graphic data into a new buffer
		 * @memberof Arstider
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
		
		return Buffer;
	});
})();