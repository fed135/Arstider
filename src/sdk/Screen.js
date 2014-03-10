/**
 * Screen 
 * 
 * @version 1.1
 * @author frederic charette <fredc@meetfidel.com>
 */

/**
 * Defines the screen module
 */
define("Arstider/Screen", ["Arstider/DisplayObject", "Arstider/Viewport"], function(DisplayObject, Viewport){
	
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
		 * Sets initial width and height
		 */
		this.width = Viewport.maxWidth;
		this.height = Viewport.maxHeight;
		
		/**
		 * On screen load behavior
		 * @override
		 * @type {function(this:Screen)}
		 */
		this.onload = Arstider.emptyFunction;
		
		/**
		 * On screen unload behavior
		 * @override
		 * @type {function(this:Screen)}
		 */
		this.onunload = Arstider.emptyFunction;
		
		/**
		 * On screen resume behavior - when overlay closes
		 * @override
		 * @type {function(this:Screen)}
		 */
		this.onresume = Arstider.emptyFunction;
	}
	
	Arstider.Inherit(Screen, DisplayObject);
	
	return Screen;
});
