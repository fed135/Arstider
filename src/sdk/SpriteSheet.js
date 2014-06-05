/**
 * SpriteSheet
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the SpriteSheet module
 */
define( "Arstider/SpriteSheet", ["Arstider/Bitmap", "Arstider/Sequence"], /** @lends SpriteSheet */ function (Bitmap, Sequence) {
		
	/**
	 * SpriteSheet constructor
	 * A bitmap representing a collection of frames
	 * @class SpriteSheet
	 * @constructor
	 * @param {Object} props The properties for the spriteSheet
	 */		 	
	var SpriteSheet = function(props){
		props = props || {};
		
		this.data = null;
		this.width = 0;
		this.height = 0;
		this.frames = Arstider.checkIn(props.frames, null);
			
		this.frameWidth = Arstider.checkIn(props.width, 0);
		this.frameHeight = Arstider.checkIn(props.height, 0);
				
		this.onload = Arstider.checkIn(props.onload, Arstider.emptyFunction);
		
		var url = Arstider.checkIn(Arstider.checkIn(props.data, props.bitmap), null);
		
		if(url) this.loadBitmap(url);
	};
	
	/**
	 * Creates a sequence and adds it to the SpriteSheet Object
	 * @type {function(this:SpriteSheet)}
	 * @param {string} name The name of the sequence
	 * @param {number} time The interval in seconds between frames
	 * @param {Array} frames The list of frames in the order they will be shown
	 * @param {boolean|null} stop Whther to stop at the end of the Sequence or not (loop)
	 * @return {Sequence} The newly created Sequence
	 */
	SpriteSheet.prototype.addSequence = function(name, time, frames, stop){
		this[name] = new Sequence(this, time, frames, stop);
		return this[name];
	};
	
	/**
	 * Loads the asset for the SpriteSheet
	 * @type {function(this:SpriteSheet)}
	 * @param {string|Image|HTMLCanvasElement} url The data to use, or url to load
	 */
	SpriteSheet.prototype.loadBitmap = function(url){
		var thisRef = this;
				
		if(!(typeof url === 'string') && !(url instanceof String)){
			thisRef.data = url;
			if(thisRef.width == 0) thisRef.width = url.width;
			if(thisRef.height == 0) thisRef.height = url.height;
			return;
		}
			
		this.url = url;
		var req = new Bitmap({
			url:url, 
			callback:function(img){
				thisRef.data = img.data;
				if(thisRef.width == 0) thisRef.width = img.width;
				if(thisRef.height == 0) thisRef.height = img.height;
				
				thisRef.onload();
			}
		});
	};
			
	return SpriteSheet;
});