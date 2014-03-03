/**
 * Display Object Wrapper. 
 * 
 * Provides common private variables and methods for the D.O as well as
 * AMD Closure and prototypes.
 *
 * @author frederic charette <fredc@meetfidel.com>
 */
;(function(){
	
	//Private utility method
	function getChildIndexByName(children, name) {
		for(var i=0; i<children.length; i++) {
			if(children[i].name == name) {
				return i;
			}
		}
		return -1;
	}
	
	function handleAssetLoaded(ref, asset, callback){
		if(asset != null){
			ref.data = asset;
			ref.dataWidth = asset.width;
			ref.dataHeight = asset.height;
		
			if(ref.width == 0){
				ref.width = asset.width;
			}
			if(ref.height == 0){
				ref.height = asset.height;
			}
		}
		
		if(callback){
			callback();
		}
	}

	/**
	 * AMD Closure
	 */	
		define( "Arstider/DisplayObject", ["Arstider/Buffer", "Arstider/Entity", "Arstider/FileSystem"], function (Buffer, Entity, FileSystem) {
		
			/**
			 * Creates an instance of DisplayObject.
			 *
			 * @constructor
			 * @this {DisplayObject}
			 * @param {string} name The desired name of the display object. Uses anonymous entity count if empty.
			 */
			DisplayObject.Inherit(Entity);
			function DisplayObject(name, keepAssetBuffer) {
				
				Super(this, name);
				
				/**
				 * List of children
				 */
				this.children = [];
				
				/**
				 * If true, keeps buffer from dataUrl
				 */
				this.keepAssetBuffer = keepAssetBuffer || false;
			};
			
			/**
			 * Kills the Display Object's Buffer(s).
			 *
			 * @this {DisplayObject}
			 */
			DisplayObject.prototype.killBuffer = function(){
				this.data = null;
				this.dataCtx = null;
				Buffer.kill(this.name);
				if(this.keepAssetBuffer === false && this.dataUrl){
					Buffer.kill(this.dataUrl);
				}
			};
			
			/**
			 * Adds an Entity to the list of children.
			 *
			 * @this {DisplayObject}
			 * @param {Entity} clip The Entity to be added to the DisplayObject's list of children
			 * @returns {int} Index of the newly added child
			 */
			DisplayObject.prototype.addChild = function(clip) {
				clip.parent = this;
				this.children[this.children.length]=clip;
				return this.children.length-1;
			};
			
			/**
			 * Removes an Entity from the list of children.
			 *
			 * @this {DisplayObject}
			 * @param {string} name The name of the Entity to be removed from the DisplayObject's list of children
			 * @returns {boolean} Was a child removed or not.
			 */
			DisplayObject.prototype.removeChildByName = function(name) {
				var index = getChildIndexByName(this.children, name);
				if(index != -1) {
					if(this.children[index].killBuffer){
						this.children[index].killBuffer();
					}
					if(this.children[index].children && this.children[index].removeChildren && this.children[index].children.length != 0){
						this.children[index].removeChildren();
					}
					this.children.splice(index,1);
					return true;
				}
				console.warn("could not find children "+name);
				return false;
			};
			
			/**
			 * Removes an Entity from the list of children.
			 *
			 * @this {DisplayObject}
			 * @param {Entity} ref The reference of the Entity to be removed from the DisplayObject's list of children
			 * @returns {boolean} Was a child removed or not.
			 */
			DisplayObject.prototype.removeChild = function(ref, keepBuffer) {
				var index = this.children.indexOf(ref);
				if(index != -1) {
					if(this.children[index].killBuffer && !keepBuffer){
						this.children[index].killBuffer();
					}
					if(this.children[index].children && this.children[index].removeChildren && this.children[index].children.length != 0){
						this.children[index].removeChildren();
					}
					
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
			 * @returns {Entity | null} The desired Entity or null if not found.
			 */
			DisplayObject.prototype.getChild = function(name) {
				var index = getChildIndexByName(this.children, name);
				if(index != -1) {
					return this.children[index];
				}
				return null;
			};
			
			/**
			 * Get the list of children.
			 *
			 * @this {DisplayObject}
			 * @returns {Array} The list of children.
			 */
			DisplayObject.prototype.getChildren = function(){
				return this.children;
			};
			
			/**
			 * Removes all children from stage and destroys their buffers.
			 *
			 * @this {DisplayObject}
			 */
			DisplayObject.prototype.removeChildren = function(keepBuffer){
				for(var i=0; i<this.children.length; i++) {
					if(this.children[i]){
						if(this.children[i].children && this.children[i].removeChildren && this.children[i].children.length != 0 && !keepBuffer){
							this.children[i].removeChildren();
						}
						if(this.children[i].killBuffer && !keepBuffer){
							this.children[i].killBuffer();
						}
						delete this.children[i];
					}
				}
				this.children = [];
			};
			
			/**
			 * Loads a Bitmap into the DisplayObject
			 *
			 * @this {DisplayObject}
			 * @param {string | Image | Canvas} url Loads an image to be used as D.O. data
			 * @param {function} callback Optional function to be triggered upon succesful loading.
			 */
			DisplayObject.prototype.loadBitmap = function(url, success) {
				var thisRef = this;
				
				if(!(typeof url === 'string') && !(url instanceof String)){
					handleAssetLoaded(thisRef, url, success);
					return;
				}
				
				thisRef.dataUrl = url;
				
				FileSystem.download(url, function(b) {
					handleAssetLoaded(thisRef, b, success);
				},
				null,
				function(e){
					console.error("Error loading image '"+url+"': "+e);
				});
			};
			
			/**
			 * Loads a Bitmap into the DisplayObject from an atlas
			 *
			 * @this {DisplayObject}
			 * @param {string | Image | Canvas} url Loads an image to be used as D.O. data
			 * @param {function} callback Optional function to be triggered upon succesful loading.
			 */
			DisplayObject.prototype.loadFromAtlas = function(url, x,y,w,h, success) {
				var thisRef = this;
				this.width = w;
				this.height = h;
				this.loadBitmap(url,function(){
					thisRef.dataWidth = w;
					thisRef.dataHeight = h;
				});
				this.largeData = true;
				this.xOffset = x;
				this.yOffset = y;
			};
			
			return DisplayObject; 
		});
})();