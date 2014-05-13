/**
 * Texture. 
 *
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */
;(function(){

	var 
		/**
		 * Texture buffer reference
		 * @private
		 * @type {Object|null}
		 */
		cnv = null
	;

	/**
	 * Defines the Texture module
	 */	
	define( "Arstider/Texture", ['Arstider/Buffer', 'Arstider/Bitmap'], /** @lends Texture */ function (Buffer, Bitmap) {
		
		if(cnv == null){
			cnv = new Buffer({
				name:'Arstider_textureLoader',
				width:100,
				height:100
			});
		}
			
		/**
		 * Texture constructor
		 * Creates a texture data object
		 * @class Texture
		 * @constructor
		 * @param {string|Image|HTMLCanvasElement} url The url or asset to use as texture
                 * @param {function(this:Texture)} callback The method to cal once the texture is ready
		 */
		function Texture(url, callback){
			/**
			 * Texture data
			 * @private
			 * @type {nsIDOMCanvasPattern}
			 */
			this._pattern = null;
			
			/**
			 * Safe copy of the url/data, in case we resize the texture and need to re-render
			 * @private
			 * @type {string|Image|HTMLCanvasElement}
			 */
			this._url = url;
				
			this.loadBitmap(url, callback);
		}
		
		/**
		 * Loads the data, then calls to create the pattern
		 * @type {function(this:Texture)}
		 * @param {string|Image|HTMLCanvasElement} url
		 */
		Texture.prototype.loadBitmap = function(url, callback){
				
			if(!(typeof url === 'string') && !(url instanceof String)){
				thisRef._createPattern(url, callback);
				return;
			}
				
			var thisRef = this;
			
			var req = new Bitmap(url, function(){
				thisRef._createPattern.apply(thisRef, [this.data, callback]);
			});
		};
		
		/**
		 * Creates the texture pattern from the data
		 * @private
		 * @type {function(this:Texture)}
		 * @param {Image|HTMLCanvasElement} data The data to create a texture from
		 */
		Texture.prototype._createPattern = function(data, callback){
			this._pattern = cnv.context.createPattern(data, 'repeat');
                        if(callback) callback.apply(this);
		};
		
		/**
		 * Changes the size of the texture
		 * @type {function(this:Texture)}
		 * @param {number} width The new width
		 * @param {number} height The new height
		 */
		Texture.prototype.setSize = function(width, height){
			cnv.setSize(width, height);
			
			this.loadBitmap(this._url);
		};
			
		return Texture;
	});
})();