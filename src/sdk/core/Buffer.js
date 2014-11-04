/**
 * Buffer
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/Buffer", ["Arstider/Browser", "Arstider/core/Pixel"], /** @lends Buffer */ function(Browser, Pixel){
	Buffer._anonymousBuffers = 0;
	Buffer.WEBGL = "webgl";
	Buffer.CANVAS2D = "2d";
	Buffer.SHARP = "sharp";
	Buffer.SMOOTH = "auto";
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
		this.preferedContext = (props.webgl)?Buffer.WEBGL:Buffer.CANVAS2D;
        this.renderStyle = Arstider.checkIn(props.renderStyle, Arstider.defaultRenderStyle);
        this.contextType = null;
		
		this.name = props.name || ("buffer"+(Buffer._anonymousBuffers++));
		this.data.id = props.id || this.name;
		
		this.width = this.data.width = Arstider.checkIn(props.width, 0);
		this.height = this.data.height = Arstider.checkIn(props.height, 0);
		this.data.buffer = this;
		this.vertexShader = props.vertexShader || null;
		this.fragmentShader = props.fragmentShader || null;
		//TODO: Remove this confusing iOS6 compatibility hack
		this.compatPrivilege = false;
		
		this.getContext();
		
		if(Arstider.bufferPool[this.name] != undefined){
			Arstider.log("Arstider.Buffer: buffer "+ this.name+ " already exists, it will be ovewritten", 1);
			Arstider.bufferPool[this.name].kill();
		}
		
		Arstider.bufferPool[this.name] = this;
	}
	Buffer.prototype.getContext = function(){
		if(this.context && this.preferedContext == this.contextType) return this.context;
		if(this.preferedContext == Buffer.WEBGL){
			this.contextType = Buffer.WEBGL;
			this.context = this.data.getContext(Buffer.WEBGL) || this.data.getContext("experimental-webgl") || null;
			//If null, this means that webgl is not supported, stop trying to reload that context!
			if(this.context == null) this.preferedContext = Buffer.CANVAS2D;
		} 
		if(this.preferedContext == Buffer.CANVAS2D || this.context == null){
			this.contextType = Buffer.CANVAS2D;
			this.context = this.data.getContext(Buffer.CANVAS2D);
		} 
		this.context.__init = false;
        this.updateRenderStyle();
        return this.context;
	};
	
	/**
	 * Destroys the buffer from memory
	 * @type {function(this:Buffer)}
	 */
	Buffer.prototype.kill = function(force){
		if(this.compatPrivilege){
			if(force !== true) return;
		}
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
		if(!this.data) return 0;
		return (this.height * this.width);
	};
	
	/**
	 * Updates the size of a buffer
	 * @type {function(this:Buffer)}
	 * @param {number} width The desired width to apply
	 * @param {number} height The desired height to apply
	 */
	Buffer.prototype.setSize = function(width, height){
		if(!this.data) return;
		if(width) this.width = this.data.width = Math.abs(width);
		if(height) this.height = this.data.height = Math.abs(height);
		
		this.updateRenderStyle();
		return this;
	};
	
	/**
	 * Updates the Buffer's rendering mode
	 * @type {function(this:Buffer)}
	 * @param {string|null} style Optional rendering style change
	 */
	Buffer.prototype.updateRenderStyle = function(style){
		if(!this.data) return;
		if(style){
			if(style != Buffer.SMOOTH && style != Buffer.SHARP){
				Arstider.log("Arstider.setRenderStyle: Cannot apply mode '"+style+"'", 1);
				return;
			}
			this.renderStyle = this.context.renderStyle = style;
		}

		if(this.renderStyle === Buffer.SHARP){
			if(Browser.name == "firefox") this.data.style.imageRendering = '-moz-crisp-edges';
			else if(Browser.name == "opera") this.data.style.imageRendering = '-o-crisp-edges';
			else if(Browser.name == "safari") this.data.style.imageRendering = '-webkit-optimize-contrast';
			else if(Browser.name == "ie") this.data.style.msInterpolationMode = 'nearest-neighbor';
			else this.data.style.imageRendering = 'crisp-edges';
		}
		else if(this.renderStyle === Buffer.SMOOTH){
			this.data.style.imageRendering = Buffer.SMOOTH;
			this.data.style.msInterpolationMode = Buffer.SMOOTH;
		}
		var attr = 'imageSmoothingEnabled', uc = attr.charAt(0).toUpperCase() + attr.substr(1);
		this.context[attr] = this.context['ms'+uc] = this.context['moz'+uc] = this.context['webkit'+uc] = this.context['o'+uc] = (this.renderStyle == Buffer.SMOOTH);
		
		return this;
	};
	
	/**
	 * Returns a blobURL for the canvas data
	 * @type {function(this:Buffer)}
	 * @param {string|null} type Optionnal toDataUrl parameter
	 * @return {string} The blobUrl
	 */
	Buffer.prototype.getURL = function(type, quality){
		if(!this.data) return;
		return this.data.toDataURL(type || "image/png", Arstider.checkIn(quality, 10));
	};
	Buffer.prototype.setShaders = function(vertex, fragment){
		this.vertexShader = vertex;
		this.fragmentShader = fragment;
		if(this.context && this.context.__program) this.context.__program = null;
	};
	
	/**
	 * Returns a Pixel object for the desired data
	 * @type {function(this:Buffer)}
	 * @param {number} x The x position to look at in the data 
	 * @param {number} y The y position to look at in the data
	 * @return {Pixel} The pixel object for the inputed location
	 */
	Buffer.prototype.getPixelAt = function(x, y){
		if(!this.data) return;
		if(x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
		var 
			imgd = this.context.getImageData(x, y, 1, 1),
			pix = imgd.data
		;
		
		return new Pixel(x, y, this.data, pix[0], pix[1], pix[2], pix[3]/255);
	};
	
	/**
	 * Returns the alpha value for the desired data
	 * @type {function(this:Buffer)}
	 * @param {number} x The x position to look at in the data 
	 * @param {number} y The y position to look at in the data
	 * @return {number} The pixel alpha for the inputed location
	 */
	Buffer.prototype.getAlphaAt = function(x, y){
		if(!this.data) return null;
		if(x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
		var 
			imgd = this.context.getImageData(x, y, 1, 1),
			pix = imgd.data
		;
		
		return pix[3]/255; // alpha
	};
	
	/**
	 * Changes a pixel in the data
	 * @type {function(this:Buffer)}
	 * @param {number} x The x position to look at in the data 
	 * @param {number} y The y position to look at in the data
	 * @param {Pixel} The pixel object to place at the inputed location
	 */
	Buffer.prototype.setPixelAt = function(x, y, pixel){
		if(!this.data) return;
		if(x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
		var 
			imgd = this.context.createImageData(1,1),
			pix = imgd.data
		;
		
		pix[0] = pixel.r; // red
		pix[1] = pixel.g; // green
		pix[2] = pixel.b; // blue
		pix[3] = pixel.a*255; // alpha
		
		this.context.putImageData(imgd, x, y);
		return this;
	};
	/**
	 * Saves graphic data into a new buffer
	 * @memberof Arstider
	 * @param {string} name The name of the future Buffer
	 * @param {Image|HTMLCanvasElement} img The graphic resource to draw onto the canvas
	 * @return {Buffer} The newly created Buffer
	 */
	Arstider.saveToBuffer = function(name, img, w, h){
		
		var
			canvas = new Buffer({
				name:name,
				width:Arstider.firstOf([w, img.width], 1),
				height:Arstider.firstOf([h, img.height], 1)
			})
		;
		
		canvas.context.drawImage(img,0,0,canvas.width,canvas.height);
		
		return canvas;
	};
	
	return Buffer;
});