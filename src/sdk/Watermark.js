/**
 * Watermark
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */

/*
 * Self-invoked singleton wrapper
 */
;(function(){

	var 
		/**
		 * Singleton static
		 * @private
		 * @type {Watermark|null}
		 */
		singleton = null
	;
	
	/*
	 * Defines the Watermark module
	 */
	define( "Arstider/Watermark", ["Arstider/DisplayObject"], /** @lends Watermark */ function (DisplayObject) {
		
		/**
		 * Returns singleton if it has been instantiated
		 */
		if(singleton != null) return singleton;
		
		/**
		 * Instantiates the singleton
		 */
		singleton = new DisplayObject();
		return singleton;
	});
})();