/**
 * Screen
 * 
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the screen module
 */
define("Arstider/Screen", [
	"Arstider/DisplayObject", 
	"Arstider/Viewport", 
	"Arstider/Events", 
	"Arstider/Bitmap", 
	"Arstider/Request"
	], /** @lends Screen */ function(DisplayObject, Viewport, Events, Bitmap, Request){
	
	/**
	 * Screen constructor
	 * Implements display object to create a stage for the screen
	 * @class Screen
	 * @constructor
	 */
	function Screen(screenObj, stage){
		
		Arstider.Super(this, DisplayObject);
		
		Arstider.mixin(this, Arstider.clone(screenObj, true), true, true);
		
		/**
		 * Whether the screen is loaded or not
		 * @private
		 * @type {boolean}
		 */
		this.__loaded = false;
		
		/**
		 * The engine reference
		 * @type {Engine|null}
		 */
		this.stage = stage;

		if(screenObj._screenData)
			var req = new Request({
				url:screenObj._screenData,
				track:true,
				type:"json",
				caller:this,
				cache:true,
				callback:this._finishSetup
			}).send();
		}
		else{
			this._finishSetup();
		}
	}
	
	Arstider.Inherit(Screen, DisplayObject);
	
	/**
	 * Private method called after checking for an editor created list of objects to instantiate
	 * @private
	 * @type {function(this:Screen)}
	 */
	Screen.prototype._finishSetup = function(data){
		if(data) return this._instantiateElements(data);

		/**
		 * Set initial screen size and ratio
		 */
		this.width = Viewport.maxWidth;
		this.height = Viewport.maxHeight;
		this.scaleX = this.scaleY = Viewport.globalScale;
		this.global.x = 0;
		this.global.y = 0;
		this.global.alpha = 1;
		this.global.rotation = 0;
		this.global.scaleX = this.global.scaleX = Viewport.globalScale;
		this.global.width = Viewport.maxWidth;
		this.global.height = Viewport.maxHeight;
		
		this.onStage = true;

		if(this.init) this.init();
		else{
			if(Arstider.verbose > 2) console.warn("Arstider.Screen: new screen has no init method");
		}
		
		/**
		 * Listen for scale change
		 */
		Events.bind("Viewport.globalScaleChange", this.updateScale, this);
	};

	/**
	 * Private method that adds editor-created elements on the stage
	 * @private
	 * @type {function(this:Screen)}
	 */
	Screen.prototype._instantiateElements = function(data){
		this.__elementsToSpawn = data.elements.length;
		this.__elements = [];

		this.basePath = data.path;

		//bg
		if()

		for(var i = 0; i<data.elements.length; i++){
			this._spawnElement(data.elements[i], function(){
				if(this.__elementsToSpawn == this.__elements.length){
					this._resolveHierarchy(this.__elements);
					delete this.__elementsToSpawn;
					delete this.__elements;
					this._finishSetup();
				}
			});
		}
	};

	/**
	 * Private method to attach children to the proper parent
	 * @private
	 * @type {function(this:Screen)}
	 */
	 Screen.prototype._resolveHierarchy = function(elements){
	 	var i = 0, u = 0;

	 	for(i; i<elements.length; i++){
	 		if(elements[i].parent != null){
	 			for(u = 0; u<elements.length; u++){
	 				if(elements[u].name == elements[i].parent){
	 					elements[u].addChild(elements[i]);
	 					break;
	 				}
	 			}
	 		}
	 		else{
	 			this.addChild(elements[i]);
	 		}
	 	}
	 };

	/**
	 * Private method to create a single editor-made element
	 * @private
	 * @type {function(this:Screen)}
	 */
	Screen.prototype._spawnElement = function(element, callback){
		var thisRef = this;

		require([element._type], function(c){
			var e = new c(element);
			if(element._export === true){
				thisRef[e.name] = e;
			}
			thisRef.__elements.push(e);
			callback.apply(thisRef);
		});
	}

	/**
	 * Private method called when screen unloads, then calls user-defined method
	 * @private
	 * @type {function(this:Screen)}
	 */
	Screen.prototype._unload = function(){
		this.loaded = false;
		this.removeChildren();
		Arstider.clearBlobUrls();
		Events.unbind("Viewport.globalScaleChange", this.updateScale);
		
		if(this.onunload) this.onunload();
	};
	
	/**
	 * Resizes the screen when globalScale changes
	 * @private
	 * @type {function(this:Screen)}
	 */
	Screen.prototype.updateScale = function(){
		this.width = Viewport.maxWidth;
		this.height = Viewport.maxHeight;
		this.scaleX = this.scaleY = Viewport.globalScale;
	};
	
	return Screen;
});
