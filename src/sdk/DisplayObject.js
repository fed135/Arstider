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
	define( "Arstider/DisplayObject", ["Arstider/Buffer", "Arstider/Entity", "Arstider/Bitmap"], function (Buffer, Entity, Bitmap) {
		
		/**
		 * Creates an instance of DisplayObject.
		 *
		 * @constructor
		 * @extends {Entity}
		 * @this {DisplayObject}
		 * @param {Object=} props Optional properties for the element.
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
		 * @this {DisplayObject}
		 * @param {Entity} clip The Entity to be added to the DisplayObject's list of children
		 * @return {number} Index of the newly added child
		 */
		DisplayObject.prototype.addChild = function(clip){
			if(clip.parent != null) console.warn("Object already has a parent!");
			clip.parent = this;
			this.children[this.children.length]=clip;
			return this.children.length-1;
		};
		
		/**
		 * Removes an Entity-type from the list of children.
		 * @this {DisplayObject}
		 * @param {string} name The name of the Entity to be removed from the DisplayObject's list of children
		 * @return {boolean} Was a child removed or not.
		 */
		DisplayObject.prototype.removeChildByName = function(name) {
			var index = getChildIndexByName(this.children, name);
			if(index != -1) {
				this.children[index].killBuffer();
				
				if(this.children[index].removeChildren && this.children[index].children.length != 0) this.children[index].removeChildren();
				
				this.children.splice(index,1);
				return true;
			}
			console.warn("could not find children "+name);
			return false;
		};
		
		/**
		 * Removes an Entity from the list of children.
		 * @this {DisplayObject}
		 * @param {Entity} ref The reference of the Entity to be removed from the DisplayObject's list of children
		 * @return {boolean} Was a child removed or not.
		 */
		DisplayObject.prototype.removeChild = function(ref, keepBuffer) {
			var index = this.children.indexOf(ref);
			if(index != -1){
				this.children[index].killBuffer();
			
				if(this.children[index].removeChildren && this.children[index].children.length != 0) this.children[index].removeChildren();
				
				this.children.splice(index,1);
				return true;
			}
			console.warn("could not find children");
			return false;
		};
		
		/**
		 * Get an Entity from the list of children by name.
		 *
		 * @this {DisplayObject}
		 * @param {string} name The name of the desired Entity.
		 * @return {Entity|null} The desired Entity or null if not found.
		 */
		DisplayObject.prototype.getChild = function(name) {
			var index = getChildIndexByName(this.children, name);
			if(index != -1) return this.children[index];
			return null;
		};
		
		/**
		 * Get the list of children.
		 * @this {DisplayObject}
		 * @return {Array} The list of children.
		 */
		DisplayObject.prototype.getChildren = function(){
			return this.children;
		};
		
		/**
		 * Removes all children from stage and destroys their buffers.
		 * @this {DisplayObject}
		 */
		DisplayObject.prototype.removeChildren = function(){
			for(var i=0; i<this.children.length; i++) {
				if(this.children[i]){
					if(this.children[i].children && this.children[i].removeChildren && this.children[i].children.length != 0){
						this.children[i].removeChildren();
					}
					this.children[i].killBuffer();
					delete this.children[i];
				}
			}
			this.children = [];
		};
		
		/**
		 * Loads a Bitmap into the DisplayObject
		 * @this {DisplayObject}
		 * @param {string|Image|HTMLCanvasElement} url Loads an image to be used as data
		 * @param {function(this:DisplayObject, ?)} callback Optional function to be triggered upon successful loading.
		 */
		DisplayObject.prototype.loadBitmap = function(url, success) {
			var thisRef = this;
			
			if(!(typeof url === 'string') && !(url instanceof String)){
				this.data = url;
				return;
			}
			
			var req = new Bitmap(url, function(e){
				thisRef.data = this.data;
				
				if(thisRef.dataWidth == 0) thisRef.dataWidth = this.width;
				if(thisRef.dataHeight == 0) thisRef.dataHeight = this.height;
			
				if(thisRef.width == 0) thisRef.width = this.width;
				if(thisRef.height == 0) thisRef.height = this.height;
				
				if(success) success(this);
			});
		};
		
		/**
		 * Loads a Bitmap into the DisplayObject from an atlas
		 * @this {DisplayObject}
		 * @param {string|Image|HTMLCanvasElement} url Loads an image to be used as D.O. data
		 * @param {number} x X slicing offset
		 * @param {number} y Y slicing offset
		 * @param {number} w Width of the slicing
		 * @param {number} h Height of the slicing
		 * @param {function()} callback Optional function to be triggered upon successful loading.
		 */
		DisplayObject.prototype.loadSection = function(url, x,y,w,h, success) {
			var thisRef = this;
			this.width = w;
			this.height = h;
			this.loadBitmap(url,function(){
				thisRef.dataWidth = w;
				thisRef.dataHeight = h;
				if(success) success();
			});
			this.largeData = true;
			this.xOffset = x;
			this.yOffset = y;
		};
		
		return DisplayObject; 
	});
})();