/**
 * Screen 
 * 
 * @version 1.1
 * @author frederic charette <fredc@meetfidel.com>
 */

/**
 * Defines the screen module
 */
define("Arstider/Screen", ["Arstider/DisplayObject", "Arstider/Viewport", "Arstider/Events"], function(DisplayObject, Viewport, Events){
	
	/**
	 * Screen constructor
	 * Implements display object to create a stage for the screen
	 * 
	 * @constructor
	 */
	function Screen(name){
		Arstider.Super(this, DisplayObject, {"name":"Screen_" + name});
		
		/**
		 * Whether the screen is loaded or not
		 * @private
		 * @type {boolean}
		 */
		this.loaded = false;
		
		/**
		 * The engine reference
		 * @type {Engine|null}
		 */
		this.stage = null;
		
		/**
		 * Sets initial width, height and scale
		 */
		this.width = Viewport.maxWidth;
		this.height = Viewport.maxHeight;
		this.scaleX = this.scaleY = Viewport.globalScale;
		
		/**
		 * Listen for scale change
		 */
		Events.bind("Viewport.globalScaleChange", this.updateScale, this);
	}
	
	Arstider.Inherit(Screen, DisplayObject);
	
	/**
	 * On screen load behavior
	 * @override
	 * @type {function(this:Screen)}
	 */
	Screen.prototype.onload = Arstider.emptyFunction;
		
	/**
	 * On screen unload behavior
	 * @override
	 * @type {function(this:Screen)}
	 */
	Screen.prototype.onunload = Arstider.emptyFunction;
		
	/**
	 * On screen resume behavior - when overlay closes
	 * @override
	 * @type {function(this:Screen)}
	 */
	Screen.prototype.onresume = Arstider.emptyFunction;
	
	/**
	 * Private method called when screen unloads, then calls user-defined method
	 * @private
	 * @type {function(this:Screen)}
	 */
	Screen.prototype._unload = function(){
		Events.unbind("Viewport.globalScaleChange", this.updateScale);
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
