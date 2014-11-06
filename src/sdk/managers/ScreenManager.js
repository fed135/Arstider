define("Arstider/managers/ScreenManager", 
[
	"Arstider/core/Entity"
	"Arstider/events/Signal",
	"Arstider/managers/Preloader"
], 
/** @lends managers/ScreenManager */
function(Signal, Preloader){

	function ScreenManager(){

		this.currentScreen = null;
		this.inTransition = false;
		this.history = [];

		this.screenReady = new Signal();
	}

	ScreenManager.prototype.goto = function(name, props){
		
		var 
			thisRef
		;

		/**
		 * Possible options:
		 *
		 * - transition-in //Calls for a transition scene before the preloading screen
		 * - transition-out //Calls for a transition scene after the preloading screen
		 * - updateHash //Updates the hash value in the url to bind screen changes to browser history (browser back/forward buttons)
		 * - silent //Doesn't trigger transitions or the preloader, runs completely in the background
		 */

		this.inTransition = true;
		requirejs([name], function(_menu){
			if(_menu.manifest){
				Preloader.loadManifest(_menu.manifest, function(){
					thisRef._createScreen.call(thisRef, _menu);
				});
			}
			else{
				this._createScreen(_menu);
			}
		});
	};

	ScreenManager.prototype._createScreen = function(menu){
		var screenObj = menu;
	};


	return new ScreenManager();
});