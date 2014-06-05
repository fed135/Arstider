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
	define( "Arstider/Background", ["Arstider/Bitmap"], /** @lends Background */ function (Bitmap) {
		
		/**
		 * Returns singleton if it has been instantiated
		 */
		if(singleton != null) return singleton;
			
		/**
		 * Background constructor
		 * Updates the frame redraw data
		 * @class Background
		 * @constructor
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
		 * @type {function(this:Background)}
		 * @param {string} url The url of the image/ resource to load
		 */
		Background.prototype.set = function(url){
			var req = new Bitmap({
				url:url,
				callback:function(img){
					singleton.data = img.data;
				}
			});
		};
		
		/**
		 * Nullifies the data so that clearRect is called each frame instead
		 * @type {function(this:Background)}
		 */
		Background.prototype.reset = function(){
			singleton.data = null;
		};
		
		/**
		 * Renders the background
		 * @type {function(this:Background)}
		 * @param {CanvasRenderingContext2D} ctx The Engine's canvas context
		 * @param {number} w The width to draw the background (only if scale is not 1)
		 * @param {number} h The height to draw the background (only if scale is not 1)
		 * @param {number} s The scale of the background
		 */
		Background.prototype.render = function(ctx, w, h,s){
			s = Arstider.checkIn(s, 1);
			if(singleton.data == null){
                if(ctx.clearRect) ctx.clearRect(0, 0, w, h);
                else ctx.clear(ctx.COLOR_BUFFER_BIT);
            }
			else{
                if(ctx.drawImage){
					if(s != 1){
						ctx.scale(s, s);
						ctx.drawImage(singleton.data, 0, 0);
						ctx.scale(1/s, 1/s);
					}
					else ctx.drawImage(singleton.data, 0, 0);
                }
                else{
                    //WEBGL        
                }
			}
		};
		
		/**
		 * Instantiates the singleton
		 */
		singleton = new Background();
		return singleton;
	});
})();		