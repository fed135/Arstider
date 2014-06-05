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
		 * @param {Object|null} props The proprieties of the Texture (url/data)
		 */
		function Texture(props){

			props = props || {};

			/**
			 * Texture data
			 * @private
			 * @type {nsIDOMCanvasPattern}
			 */
			this._pattern = null;
			
			/**
			 * Url/data, saved for reference and in case we resize the texture and need to re-render
			 * @type {string|Image|HTMLCanvasElement}
			 */
			this.url = Arstider.checkIn(props.data, (props.url || ""));

			/**
			 * Callback when texture is loaded
			 * @type {string|Image|HTMLCanvasElement}
			 */
			this.callback = props.callback || Arstider.emptyFunction;

			if(this.url != "") this.loadBitmap(this.url);
		}
		
		/**
		 * Loads the data, then calls to create the pattern
		 * @type {function(this:Texture)}
		 * @param {string|Image|HTMLCanvasElement} url The data to load
		 * @param {function|null} callback The method to call after the loading of this texture. Will call Texture callback if not specified
		 */
		Texture.prototype.loadBitmap = function(url, callback){
				
			if(!(typeof url === 'string') && !(url instanceof String)){
				thisRef._createPattern(url, callback);
				return;
			}
				
			var thisRef = this;
			
			this.url = url;

			var req = new Bitmap({
				url:url, 
				callback:function(img){
					thisRef._createPattern.apply(thisRef, [img.data, callback]);
				}
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
            else this.callback(this);
		};
		
		/**
		 * Changes the size of the texture
		 * @type {function(this:Texture)}
		 * @param {number} width The new width
		 * @param {number} height The new height
		 */
		Texture.prototype.setSize = function(width, height){
			cnv.setSize(width, height);
			
			this.loadBitmap(this.url);
		};
			
		return Texture;
	});
})();