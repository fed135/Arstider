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

	/*
	 * Singleton static
	 * @private
	 * @type {Background|null}
	 */
	var singleton = null;
	
	/*
	 * Defines the Background module
	 */
	define( "Arstider/Background", ["Arstider/FileSystem", "Arstider/Viewport"], function (FileSystem, Viewport) {
		
		/**
		 * Returns singleton if it has been instantiated
		 */
		if(singleton != null) return singleton;
			
		/**
		 * Background constructor
		 * 
		 * @constructor
		 * @this {Background}
		 */
		function Background(){
			
			/**
			 * Frame redraw data - null for clearRect
			 * @type {Image|null}
			 */
			this.data = null;	
		}
		
		/**
		 * Downloads the asset and updates frame redraw data
		 * @this {Background}
		 * @param {string} url The url of the image/ resource to load
		 */
		Background.prototype.set = function(url){
			FileSystem.download(url,function(img){
				singleton.data = img;
			});
		};
		
		/**
		 * Nullifies the data so that clearRect is called each frame instead
		 * @this {Background}
		 */
		Background.prototype.reset = function(){
			singleton.data = null;
		};
		
		/**
		 * Renders the background
		 * @this {Background}
		 * @param {CanvasRenderingContext2D} ctx The Engine's canvas context
		 */
		Background.prototype.render = function(ctx){
			if(singleton.data == null) ctx.clearRect(0, 0, Viewport.maxWidth, Viewport.maxHeight);
			else ctx.drawImage(singleton.data, 0, 0, Viewport.maxWidth, Viewport.maxHeight);
		};
		
		/**
		 * Instantiates the singleton
		 */
		singleton = new Background();
		return singleton;
	});
})();		