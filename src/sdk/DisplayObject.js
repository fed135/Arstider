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
	define( "Arstider/DisplayObject", ["Arstider/Entity", "Arstider/Bitmap"], /** @lends DisplayObject */ function (Entity, Bitmap) {
		
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
		 * @return {number} Index of the newly added child
		 */
		DisplayObject.prototype.addChild = function(clip){
			if(clip.parent != null && Arstider.verbose > 1) console.warn("Arstider.DisplayObject.addChild: object already has a parent");
			clip.parent = this;
			clip.onStage = this.onStage;
			if(clip.children && clip.children.length > 0){
				for(var i = 0; i< clip.children.length; i++){
					clip.children[i].onStage = this.onStage;
				}
			}
			this.children[this.children.length]=clip;

			if(clip.cancelBubble) clip.cancelBubble()._update();
			return this.children.length-1;
		};
		
		/**
		 * Removes an Entity-type from the list of children.
		 * @type {function(this:DisplayObject)}
		 * @param {string} name The name of the Entity to be removed from the DisplayObject's list of children
		 * @return {boolean} Was a child removed or not.
		 */
		DisplayObject.prototype.removeChildByName = function(name) {
			var index = getChildIndexByName(this.children, name);
			if(index != -1) {
				if(this.children[index].removeChildren && this.children[index].children.length != 0) this.children[index].removeChildren(true);
				
				if(this.children[index].onStage){
					this.children[index].__skip = true;
				}
				else{
					this.children[index].onStage = false;
					this.children[index].killBuffer();
					this.children[index].parent = null;
					
					this.children.splice(index,1);
				}
				return true;
			}
			if(Arstider.verbose > 1) console.warn("Arstider.DisplayObject.removeChildByName: could not find children "+name);
			return false;
		};
		
		/**
		 * Removes an Entity from the list of children.
		 * @type {function(this:DisplayObject)}
		 * @param {Entity} ref The reference of the Entity to be removed from the DisplayObject's list of children
		 * @return {boolean} Was a child removed or not.
		 */
		DisplayObject.prototype.removeChild = function(ref, keepBuffer) {
			var index = this.children.indexOf(ref);
			if(index != -1){
				if(this.children[index].removeChildren && this.children[index].children.length != 0) this.children[index].removeChildren(true);
				
				if(this.children[index].onStage){
					this.children[index].__skip = true;
				}
				else{
					this.children[index].onStage = false;
					this.children[index].killBuffer();
					this.children[index].parent = null;
					
					this.children.splice(index,1);
				}
				return true;
			}
			if(Arstider.verbose > 1) console.warn("Arstider.DisplayObject.removeChild: could not find child");
			return false;
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
		 */
		DisplayObject.prototype.removeChildren = function(force){
			var someKept = false;
			if(this.children.length === 0 && Arstider.verbose > 2) console.warn("Arstider.DisplayObject.removeChildren: object has no children");
			for(var i=0; i<this.children.length; i++) {
				if(this.children[i]){
					if(this.children[i].children && this.children[i].removeChildren && this.children[i].children.length != 0){
						this.children[i].removeChildren(true);
					}
					
					if(this.children[i].onStage && !force){
						this.children[i].__skip = true;
						someKept = true;
					}
					else{
						this.children[i].killBuffer();
						this.children[i].parent = null;
						this.children[i].onStage = false;
						delete this.children[i];
					}
				}
			}
			
			if(!someKept) this.children = [];
		};
		
		/**
		 * Loads a Bitmap into the DisplayObject
		 * @type {function(this:DisplayObject)}
		 * @param {string|Image|HTMLCanvasElement} url Loads an image to be used as data
		 * @param {function(this:DisplayObject)} callback Optional function to be triggered upon successful loading.
		 */
		DisplayObject.prototype.loadBitmap = function(url, success) {
			var thisRef = this;
			
			if(!(typeof url === 'string') && !(url instanceof String)){
				this.data = url;
				return;
			}
			
			var req = new Bitmap({
				url:url, 
				callback:function(img){
					thisRef.data = img.data;
					
					if(thisRef.dataWidth == 0) thisRef.dataWidth = img.width;
					if(thisRef.dataHeight == 0) thisRef.dataHeight = img.height;
				
					if(thisRef.width == 0) thisRef.width = img.width;
					if(thisRef.height == 0) thisRef.height = img.height;
					
					if(success) success(img);
					else thisRef.onload();
				}
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