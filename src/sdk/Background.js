/**
 * Background
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
		 * @type {Background|null}
		 */
		singleton = null
	;
	
	/*
	 * Defines the Background module
	 */
	define( "Arstider/Background", ["Arstider/DisplayObject"], /** @lends Background */ function (DisplayObject) {
		
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