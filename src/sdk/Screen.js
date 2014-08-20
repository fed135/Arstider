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
	"Arstider/Request",
	"Arstider/GlobalTimers"
	], /** @lends Screen */ function(DisplayObject, Viewport, Events, Request, GlobalTimers){
	
	/**
	 * Screen constructor
	 * Implements display object to create a stage for the screen
	 * @class Screen
	 * @constructor
	 */
	function Screen(screenObj, stage, hasMap){
		
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

		if(hasMap){
			var req = new Request({
				url:hasMap,
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
		//if()

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

		requirejs([element._type], function(c){
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
		this.removeChildren(true);
		
		if(this.onunload) this.onunload();
	};
	
	/**
	 * Saves the state of a screen so you can hold, show another screen, then load back the state
	 * @type {function(this:Screen)}
	 * @param {string} name The name to store the state under
	 * @param {boolean|null} save Whether to save thatr state in localStorage
	 */
	Screen.prototype.saveStateAs = function(name, save){
		this.__savedState = true;
		Arstider.savedStates[name] = this;
		Arstider.savedStates[name].__tweens = [];

		this.stage.protectData(this);

		for(var i = GlobalTimers.list.length-1; i>=0;i--){
			if(GlobalTimers.list[i] && GlobalTimers.list[i].kill){
				GlobalTimers.list[i].__running = GlobalTimers.list[i].running;
				Arstider.savedStates[name].__tweens.push(Arstider.clone(GlobalTimers.list[i], true));
			}
		}
	};
	
	return Screen;
});
