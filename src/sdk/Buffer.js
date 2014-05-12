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
	define("Arstider/Buffer", [], /** @lends Buffer */ function(){
		
		/**
		 * Buffer constructor
		 * Displayable data container (offscreen canvas)
		 * @class Buffer
		 * @constructor
		 * @param {Object} props The proprieties of the Buffer
		 */
		function Buffer(props){
			this.tag = document.createElement("canvas");
			this.context = this.tag.getContext("2d");
			
			this.name = props.name || ("buffer"+(anonymousBuffers++));
			this.tag.id = props.id || this.name;
			this.renderStyle = Arstider.checkIn(props.renderStyle, Arstider.defaultRenderStyle); 
			this.width = this.tag.width = Arstider.checkIn(props.width, 1);
			this.height = this.tag.height = Arstider.checkIn(props.height, 1);
			
			this._updateRenderStyle();
			
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
			this.tag = null;
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
			this.width = this.tag.width = width;
			this.height = this.tag.height = height;
			
			this._updateRenderStyle();
		};
		
		/**
		 * Updates the Buffer's rendering mode
		 * @private
		 * @type {function(this:Buffer)}
		 * @param {string|null} style Optional rendering style change
		 */
		Buffer.prototype._updateRenderStyle = function(style){
			if(style) this.renderStyle = style;
			
			Arstider.setImageSmoothing(this.context, this.renderStyle == "auto");
			Arstider.setRenderStyle(this.tag, this.renderStyle);
		};
		
		/**
		 * Returns a blobURL for the canvas data
		 * @type {function(this:Buffer)}
		 * @param {string|null} type Optionnal toDataUrl parameter
		 * @return {string} The blobUrl
		 */
		Buffer.prototype.getURL = function(type){
			return this.tag.toDataURL(type || "image/png");
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
			
			return new Pixel(x, y, this.tag, r, g, b, a);
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
		
		return Buffer;
	});
})();