/**
 * Screen 
 * 
 * @version 1.1
 * @author frederic charette <fredc@meetfidel.com>
 */

/**
 * Defines the screen module
 */
define("Arstider/Screen", ["Arstider/DisplayObject", "Arstider/Viewport", "Arstider/Events", "Arstider/Bitmap"], function(DisplayObject, Viewport, Events, Bitmap){
	
	/**
	 * Screen constructor
	 * Implements display object to create a stage for the screen
	 * 
	 * @constructor
	 */
	function Screen(screenObj, stage){
		
		Arstider.Super(this, DisplayObject);
		
		Arstider.mixin(this, screenObj, true, true);
		
		/**
		 * Whether the screen is loaded or not
		 * @private
		 * @type {boolean}
		 */
		this.__loaded = false;
		
		/**
		 * The engine reference
		 * @type {Engine|null}
		 */
		this.stage = stage;
		
		/**
		 * Set initial screen size and ratio
		 */
		this.width = Viewport.maxWidth;
		this.height = Viewport.maxHeight;
		this.scaleX = this.scaleY = Viewport.globalScale;
		this.onStage = true;
		
		if(this.init) this.init();
		else{
			if(Arstider.verbose > 2) console.warn("Arstider.Screen: new screen has no init method");
		}
		
		/**
		 * Listen for scale change
		 */
		Events.bind("Viewport.globalScaleChange", this.updateScale, this);
	}
	
	Arstider.Inherit(Screen, DisplayObject);
	
	/**
	 * Private method called when screen unloads, then calls user-defined method
	 * @private
	 * @type {function(this:Screen)}
	 */
	Screen.prototype._unload = function(){
		this.loaded = false;
		this.removeChildren();
		Arstider.clearBlobUrls();
		Events.unbind("Viewport.globalScaleChange", this.updateScale);
		
		if(this.onunload) this.onunload();
	};
	
	/**
	 * Resizes the screen when globalScale changes
	 * @private
	 * @type {function(this:Screen)}
	 */
	Screen.prototype.updateScale = function(){
		this.width = Viewport.maxWidth;
		this.height = Viewport.maxHeight;
		this.scaleX = this.scaleY = Viewport.globalScale;
	};
	
	return Screen;
});
