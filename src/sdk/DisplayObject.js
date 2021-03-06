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
			 * List of children
			 * @type {Array}
			 */
			this.children = [];
			
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
		 * Adds an Entity-type to the list of children.
		 * @type {function(this:DisplayObject)}
		 * @param {Entity} clip The Entity to be added to the DisplayObject's list of children
		 * @return {Object} Self reference for chaining
		 */
		DisplayObject.prototype.addChild = function(clip){
			if(!clip) {
				Arstider.log("Arstider.DisplayObject.addChild: no object given");
				return;
			}
			if(clip.parent != null && Arstider.verbose > 1) console.error("Arstider.DisplayObject.addChild: object already has a parent");
			clip.parent = this;
			/*clip.onStage = this.onStage;
			if(clip.children && clip.children.length > 0){
				for(var i = 0; i< clip.children.length; i++){
					clip.children[i].onStage = this.onStage;
				}
			}*/
			this.children[this.children.length]=clip;

			if(clip.cancelBubble) clip.cancelBubble()._update();
			return this;
		};
		
		/**
		 * Removes an Entity-type from the list of children.
		 * @type {function(this:DisplayObject)}
		 * @param {string} name The name of the Entity to be removed from the DisplayObject's list of children
		 * @return {Object} Self reference for chaining
		 */
		DisplayObject.prototype.removeChildByName = function(name) {
			var index = getChildIndexByName(this.children, name);
			if(index != -1) {
				if(this.children[index].removeChildren && this.children[index].children.length != 0) this.children[index].removeChildren(true);
				
				/*if(this.children[index].onStage){
					this.children[index].__skip = true;
				}
				else{*/
					//this.children[index].onStage = false;
					if(this.children[index].killBuffer) this.children[index].killBuffer();
					this.children[index].parent = null;
					
					this.children.splice(index,1);
				//}
			}
			else{
				if(Arstider.verbose > 1) console.warn("Arstider.DisplayObject.removeChildByName: could not find children "+name);
			}
			return this;
		};
		
		/**
		 * Removes an Entity from the list of children.
		 * @type {function(this:DisplayObject)}
		 * @param {Entity} ref The reference of the Entity to be removed from the DisplayObject's list of children
		 * @return {Object} Self reference for chaining
		 */
		DisplayObject.prototype.removeChild = function(ref, keepBuffer) {
			var index = this.children.indexOf(ref);
			if(index != -1){
				if(this.children[index].removeChildren && this.children[index].children.length != 0) this.children[index].removeChildren(true);
				
				/*if(this.children[index].onStage){
					this.children[index].__skip = true;
				}
				else{*/
					//this.children[index].onStage = false;
					if(this.children[index].killBuffer) this.children[index].killBuffer();
					this.children[index].parent = null;
					
					this.children.splice(index,1);
				//}
			}
			else{
				if(Arstider.verbose > 1) console.warn("Arstider.DisplayObject.removeChild: could not find child");
			}
			return this;
		};
		
		/**
		 * Get an Entity from the list of children by name.
		 * @type {function(this:DisplayObject)}
		 * @param {string} name The name of the desired Entity.
		 * @return {Entity|null} The desired Entity or null if not found.
		 */
		DisplayObject.prototype.getChild = function(name) {
			var index = getChildIndexByName(this.children, name);
			if(index != -1) return this.children[index];
			if(Arstider.verbose > 1) console.warn("Arstider.DisplayObject.getChild: could not find child ", name);
			return null;
		};
		
		/**
		 * Get the list of children.
		 * @type {function(this:DisplayObject)}
		 * @return {Array} The list of children.
		 */
		DisplayObject.prototype.getChildren = function(){
			if(this.children.length === 0 && Arstider.verbose > 2) console.warn("Arstider.DisplayObject.getChildren: object has no children");
			return this.children;
		};
		
		/**
		 * Removes all children from stage and destroys their buffers.
		 * @type {function(this:DisplayObject)}
		 * @return {Object} Self reference for chaining
		 */
		DisplayObject.prototype.removeChildren = function(){

			if(this.children.length === 0 && Arstider.verbose > 2) console.warn("Arstider.DisplayObject.removeChildren: object has no children");
			for(var i=0; i<this.children.length; i++) {
				if(this.children[i]){
					if(this.children[i].children && this.children[i].removeChildren && this.children[i].children.length != 0){
						this.children[i].removeChildren(true);
					}
					
					if(this.children[i].killBuffer) this.children[i].killBuffer();
					this.children[i].parent = null;
					delete this.children[i];
				}
			}
			
			this.children.length = 0;

			return this;
		};

		/**
		 * Detaches a child from it's parent while keeping buffers and children intact
		 * @type {function(this:DisplayObject)}
		 * @param {string|Object} ref The name or reference of the child to detach
		 * @return {Object} Self reference for chaining
		 */
		DisplayObject.prototype.detachChild = function(ref){
			var i = this.children.indexOf(ref);
			if(i != -1){
				this.children[i].parent = null;
				this.children.splice(i,1);
			}
			else{
				i = getChildIndexByName(this.children, ref);
				if(i != -1){
					this.children[i].parent = null;
					this.children.splice(i,1);
				}
				else{
					if(Arstider.verbose > 1) console.warn("Arstider.DisplayObject.detachChild: could not find child ", ref);
				}
			}
			return this;
		};
		
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

		/**
		 * Loads a Bitmap into the DisplayObject
		 * @type {function(this:DisplayObject)}
		 * @param {string|Image|HTMLCanvasElement} url Loads an image to be used as data
		 * @param {function(this:DisplayObject)} callback Optional function to be triggered upon successful loading.
		 */
		DisplayObject.prototype.loadOptional = function(url, success) {
			var thisRef = this;
			var img = new Image();

			img.onload=thisRef.loadBitmap.bind(thisRef, url, success);
			img.src = url;
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