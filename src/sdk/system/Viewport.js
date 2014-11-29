/**
 * Viewport. 
 *
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */
define( "Arstider/system/Viewport", 
[
	"Arstider/events/Signal",
	"Arstider/system/Browser"
], 
/** @lends Viewport */ 
function(Signal, Browser){
	
	Viewport.PORTRAIT = "portrait";
	Viewport.LANDSCAPE = "landscape";
	
	/**
	 * Viewport constructor
	 * Handles screen size, orientation and features
	 * @class Viewport
	 * @constructor
	 */
	function Viewport(){

		/**
		 * Main canvas tag parent node
		 * @type {HTMLDivElement}
		 */
		this.container = null;
		/**
		 * The main canvas html tag element
		 * @type {HTMLCanvasElement|null}
		 */
		this.tag = null;


		/**
		 * Current device orientation
		 * @type {string}
		 */
		this.orientation = Viewport.LANDSCAPE;


		/**
		 * Canvas left offset in the parent in pixel (automatically centers in the window)
		 * @type {number}
		 */
		this.xOffset = 0;
		/**
		 * Canvas left offset in the parent in pixel (automatically centers in the window)
		 * @type {number}
		 */
		this.yOffset = 0;
		/**
		 * Canvas visible height (not cut-off by frame's smaller resolution)
		 * @type {number}
		 */
		this.visibleHeight = 0;
		/**
		 * Canvas visible width (not cut-off by frame's smaller resolution)
		 * @type {number}
		 */
		this.visibleWidth = 0;
		
		/**
		 * Game global scale (usefull for pixel-art style games) 
		 * @type {number}
		 */
		this.globalScale = 1;	

		this.pixelRatio = 1;
		
		/**
		 * Maximum visible width
		 * @type {number}
		 */
		this.maxWidth = 1136;
		/**
		 * Maximum visible height
		 * @type {number}
		 */
		this.maxHeight = 672;
		/**
		 * Minimum visible width
		 * @type {number}
		 */
		this.minWidth = 960;
		/**
		 * Minimum visible height
		 * @type {number}
		 */
		this.minHeight = 536;

		/**
		 * Signals
		 */
		this.onrotate = new Signal();
		this.onresize = new Signal();
		this.onunload = new Signal();
		this.onpageshow = new Signal();
		this.onpagehide = new Signal();
		this.onfullscreen = new Signal();
		this.onfullscreenleave = new Signal();
		this.onscalechange = new Signal();
	}
	
	/**
	 * Initializes the main canvas tag, adds the listeners and repositions the game in it's container
	 * @type {function(this:Viewport)}
	 * @param {string} tag The tag id in which to initialize the engine
	 * @param {Buffer} canvas The Buffer object to append to the tag
	 */
	Viewport.prototype.init = function(tag, canvas){

		this.container = tag;

		this.container.appendChild(canvas);
		this.tag = canvas;
			
		this.container.style.position = "relative";
		this.container.style.display = "block";
		this.container.style.width = "100%";
		this.container.style.height = "100%";
			
		window.addEventListener("resize", this._handleResize.bind(this));
		if(Browser.isMobile){
			window.addEventListener("orientationchange", this._handleOrientationChange.bind(this));
		}
			
		window.addEventListener("beforeunload", this.onunload.dispatch.bind(this.onunload));
		document.addEventListener("visibilitychange", this._handleVisibilityChange.bind(this));
			 
		this._handleOrientationChange();
	};

	Viewport.prototype._handleVisibilityChange = function(e){

		if(window.document.hidden) this.onpagehide.dispatch();
		else this.onpageshow.dispatch();
	};
	
	/**
	 * Enters the fullscreen mode
	 * @type {function(this:Viewport)}
	 * @param {boolean|null} scale Whether to scale the game or not
	 * @return {*} The result of the fullscreen request
	 */
	Viewport.prototype.enterFullScreen = function(scale){
		
		var
			method = (document.requestFullScreen)?"requestFullScreen":(document.mozRequestFullScreen)?"mozRequestFullScreen":(document.webkitRequestFullScreenWithKeys)?"webkitRequestFullScreenWithKeys":(document.webkitRequestFullScreen)?"webkitRequestFullScreen":null
		;

		if(method == null){
			Arstider.log("Arstider.Viewport.enterFullscreen: API not supoported.");
			return;
		}

		scale = Arstider.checkIn(scale, false);
	
		if(scale) this.tag.classList.add("fs_scaled_element");
		else this.tag.classList.remove("fs_scaled_element");
		
		this.tag[method]();
		
		this.onfullscreen.dispatch();
		
		return this;
	};
	
	/**
	 * Leaves the fullscreen mode
	 * @type {function(this:Viewport)}
	 * @return {*} The result of the fullscreen request
	 */
	Viewport.prototype.quitFullScreen = function(){

		var 
			method = (document.cancelFullScreen)?"cancelFullScreen":(document.mozCancelFullScreen)?"mozCancelFullScreen":(document.webkitCancelFullScreen)?"webkitCancelFullScreen":null
		;

		if(method == null){
			Arstider.log("Arstider.Viewport.quitFullscreen: API not supoported.");
			return;
		}

		document[method]();
		
		this.onfullscreenleave.dispatch();
		
		return this;
	};
	
	/**
	 * Internal handler for container resize
	 * @private
	 * @type {function(this:Viewport)}
	 * @param {event} e Event from the browser
	 */
	Viewport.prototype._handleResize = function(e){

		if(!this.container) return;

		var 
			windowW,
			windowH,
			ratio = 1,
			scaleX,
			scaleY,
			posX,
			posY,
			style = window.getComputedStyle(this.container, null)
		;

		if(this.orientation == Viewport.LANDSCAPE || !Browser.isMobile){
			windowW = parseInt(style.getPropertyValue("width"));
			windowH = parseInt(style.getPropertyValue("height"));
		}
		else if(this.orientation == Viewport.PORTRAIT){
			windowW = parseInt(style.getPropertyValue("height"));
			windowH = parseInt(style.getPropertyValue("width"));
		}
		else return;
		
		if(Browser.isMobile){
			document.body.scrollTop=0;
			ratio = 1/window.devicePixelRatio;
		}
				
		scaleX = Math.round(this.maxWidth*ratio);
		scaleY = Math.round(this.maxHeight*ratio);
		posX = Math.round( (windowW - scaleX) * 0.5 );
		posY = Math.round( (windowH - scaleY) * 0.5 );
			
		this.xOffset = posX;
		this.yOffset = posY;
			
		this.tag.style.left = posX+"px";
		this.tag.style.top = posY+"px";
		this.tag.style.width = scaleX+"px";
		this.tag.style.height = scaleY+"px";
		this.tag.style.position = "absolute";
		this.tag.width = this.maxWidth;
		this.tag.height = this.maxHeight;
		
		this.canvasRatio = ratio;
		this.visibleWidth = Arstider.chop(windowW / ratio);
		this.visibleHeight = Arstider.chop(windowH / ratio);
		this.visibleWidth = Arstider.min(this.visibleWidth, this.maxWidth)/this.globalScale;
		this.visibleHeight = Arstider.min(this.visibleHeight, this.maxHeight)/this.globalScale;
                       
		this.onresize.dispatch();
	};
	
	/**
	 * Internal handler for container orientation change
	 * @private
	 * @type {function(this:Viewport)}
	 * @param {event} e Event from the browser
	 */
	Viewport.prototype._handleOrientationChange = function(e){

		var 
			prevOrientation = this.orientation
		;

		if(Browser.isMobile){
			this.orientation = (window.orientation == 90 || window.orientation == -90)?Viewport.PORTRAIT:Viewport.LANDSCAPE;
		}
		else{
			this.orientation = Viewport.LANDSCAPE;
		}

		if(this.orientation != prevOrientation){
			this.onrotate.dispatch();
		}
	};
	
	/**
	 * Updates the game's global scale
	 * @type {function(this:Viewport)}
	 * @param {number} num The new global scale of the game
	 */
	Viewport.prototype.setGlobalScale = function(num){

		var 
			numRevert = 1/this.globalScale
		;

		this.visibleWidth = this.visibleWidth / numRevert;
		this.visibleHeight = this.visibleHeight / numRevert;
		
		this.globalScale = num;
		this.visibleWidth = this.visibleWidth / num;
		this.visibleHeight = this.visibleHeight / num;
		
		this.onscalechange.dispatch();
	};
	/**
	 * Updates the game's viewport size
	 * @type {function(this:Viewport)}
	 * @param {number} minWidth The new minimum width
	 * @param {number} maxWidth The new maximum width
	 * @param {number} minHeight The new minimum height
	 * @param {number} maxHeight The new maximum height
	 */
	Viewport.prototype.changeResolution = function(maxWidth, maxHeight, minWidth, minHeight){

		this.maxWidth = maxWidth;
		this.maxHeight = maxHeight;
		this.minWidth = minWidth || 0;
		this.minHeight = minHeight || 0;

		this._handleResize();
	};

	return new Viewport();
});