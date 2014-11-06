/**
 * Display Object
 *
 * @version 1.1.2
 * @author frederic charette <fredc@meetfidel.com>
 */
;(function(){
	
	/**
	 * Get child index from name
	 * 
	 * @private
	 * @param {Array} children The children of the element
	 * @param {string} name The name we are looking for
	 * @return {number} The ID of the element (or -1 if not found)
	 */
	function getChildIndexByName(children, name) {
		for(var i=0; i<children.length; i++) {
			if(children[i].name == name) return i;
		}
		return -1;
	}

	/**
	 * Defines the DisplayObject Module
	 */	
	define( "Arstider/DisplayObject", ["Arstider/Entity", "Arstider/Bitmap", "Arstider/Renderer", "Arstider/Buffer"], /** @lends DisplayObject */ function (Entity, Bitmap, Renderer, Buffer) {
		
		/**
		 * DisplayObject constructor
		 * The basic display element
		 * @class DisplayObject
		 * @constructor
		 * @extends {Entity}
		 * @param {Object|null} props Optional properties for the element.
		 */
		function DisplayObject(props) {
			Arstider.Super(this, Entity, props);
			
			/**
			 * If props is undefined, use the Engine's empty object constant
			 */
			props = props || Arstider.emptyObject;	
			
			/**
			 * Data to render
			 * @type {HTMLCanvasElement|Image|null}
			 */
			this.data = null;
			
			
			
			/**
			 * Drawing horizontal offset of the data
			 * @type {number}
			 */
			this.xOffset = Arstider.checkIn(props.xOffset, 0);
			
			/**
			 * Drawing vertical offset of the data
			 * @type {number}
			 */
			this.yOffset = Arstider.checkIn(props.yOffset, 0);
			
			/**
			 * Drawing width portion of the data
			 * @type {number}
			 */
			this.dataWidth = Arstider.checkIn(props.dataWidth, 0);
			
			/**
			 * Drawing height portion of the data
			 * @type {number}
			 */
			this.dataHeight = Arstider.checkIn(props.dataHeight, 0);
			
			/**
			 * User-defined behavior when element data has finished loading
			 * @override
			 * @type {function(this:Entity)}
			 */
			this.onload = Arstider.checkIn(props.onload, null);
			/**
			 * Called after disposal of data
			 * @type {function(this:Entity)}
			 */
			this.onunload = Arstider.checkIn(props.onunload, null);
			
			/**
			 * Prevents loop in preloading sequence, prevents load stacks of the same element
			 * @type {string|null}
			 */
			this._requestedAsset = null;

			/**
			 * If data is present, start loading the value
			 */
			if(props.bitmap !== undefined) this.loadBitmap(props.bitmap);
			else if(props.data !== undefined) this.loadBitmap(props.data);
		};
		
		/**
		 * Defines parent module
		 */
		Arstider.Inherit(DisplayObject, Entity);
		
		
		
		/**
		 * Loads a Bitmap into the DisplayObject
		 * @type {function(this:DisplayObject)}
		 * @param {string|Image|HTMLCanvasElement} url Loads an image to be used as data
		 * @param {function(this:DisplayObject)} callback Optional function to be triggered upon successful loading.
		 */
		DisplayObject.prototype.loadBitmap = function(url, success) {
			var thisRef = this;

			if(this._requestedAsset != null){
				if(this._requestedAsset === url) return;
			}
			this._requestedAsset = url;
			
			if(!(typeof url === 'string') && !(url instanceof String)){
				this.data = url;
				return;
			}
			
			var req = new Bitmap({
				url:url, 
				callback:function(img){
					if(img){
						thisRef.data = img;
						
						if(thisRef.dataWidth == 0) thisRef.dataWidth = img.width;
						if(thisRef.dataHeight == 0) thisRef.dataHeight = img.height;
					
						if(thisRef.width == 0) thisRef.width = img.width;
						if(thisRef.height == 0) thisRef.height = img.height;
					}
					if(success) success(img);
					else{
						if(thisRef.onload) thisRef.onload();
					}
				}
			});
		};

		DisplayObject.prototype.flatten = function(callback){
			if(!this.data){
				this.data = new Buffer({
					width:this.width,
					height:this.height,
					name:Arstider.tempBufferLabel + this.name+"_flattened"
				});
			}

			if(!this.data.context){
				this.data = Arstider.saveToBuffer(Arstider.tempBufferLabel +this.name+"_flattened", this.data, this.width, this.height);
			}

			var 
				thisRef = this
				savedX = this.x,
				savedY = this.y
			;

			this.x = 0;
			this.y = 0;

			Renderer.draw(this.data.context, this, null, null, false, function(){
				thisRef.removeChildren.call(thisRef);

				thisRef.x = savedX;
				thisRef.y = savedY;

				if(callback) callback.call(thisRef);
			});
		};
		
		/**
		 * Loads a Bitmap into the DisplayObject from an atlas
		 * @type {function(this:DisplayObject)}
		 * @param {string|Image|HTMLCanvasElement} url Loads an image to be used as D.O. data
		 * @param {number} x X slicing offset
		 * @param {number} y Y slicing offset
		 * @param {number} w Width of the slicing
		 * @param {number} h Height of the slicing
		 * @param {function()} callback Optional function to be triggered upon successful loading.
		 */
		DisplayObject.prototype.loadSection = function(url, x,y,w,h, success) {
			var thisRef = this;
			this.width = this.dataWidth = w;
			this.height = this.dataHeight = h;
			this.loadBitmap(url, success);
			this.largeData = true;
			this.xOffset = x;
			this.yOffset = y;
		};
		
		return DisplayObject; 
	});
})();