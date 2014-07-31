/**
 * Preloader
 * 
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */

;(function(){
		
	var 
		/**
		 * Singleton static
		 * @private
		 * @type {Preloader|null}
		 */
		singleton = null
	;
	
	/**
	 * Checks if a preload item is in the queue
	 * @private
	 * @type {function}
	 * @param {Array} queue The list of queued preload item
	 * @param {string} key The name of the item to check for
	 * @return {boolean} If the item is in the list
	 */
	function notInQueue(queue, key){
		var i = queue.length-1;
		for(i; i>=0; i--){
			if(queue[i].name === key) return false;
		}
		return true;
	}
	
	/**
	 * Defines the Preloader module
	 */	
	define( "Arstider/Preloader", ["Arstider/Events"], /** @lends Preloader */ function(Events) {
	
		if(singleton != null) return singleton;
			
		/**
		 * Preloader constructor
		 * The screen preloading logic
		 * @class Preloader
		 * @constructor
		 */
		function Preloader(){
			
			/**
			 * The list of items in the preload queue
			 * @private
			 * @type {Array}
			 */
			this._queue = [];
			/**
			 * The timer that runs at 100% to allow for late entries to resume the preloading
			 * @private
			 * @type {number|null}
			 */
			this._gracePeriodTimer = null;
			/**
			 * The number of checks performed at the end (late entries)
			 * @private
			 * @type {number}
			 */
			this._checks = 0;
			
			/**
			 * The screen associated with the preloader
			 * @private
			 * @type {Object}
			 */
			this._screen = null;
			
			
			/**
			 * Sets the name of the preloader object
			 */
			this.name = "_Arstider_Preloader";

			this.visible = false;
		}
			
		/**
		 * Resets the preloader and prepares the load of a new screen
		 * @type {function(this:Preloader)}
		 * @param {string} name The name of the screen that is about to be preloaded
		 */
		Preloader.prototype.set = function(name){
			this.reset();
			Events.broadcast("Preloader.showPreloader", name);
			this.visible = true;
		};
		
		/**
		 * Sets the screen object
		 * @type {function(this:Preloader)}
		 * @param {Object} preloaderScreen The screen object to use
		 */
		Preloader.prototype.setScreen = function(preloaderScreen){
			this._screen = preloaderScreen;
		};
		
		/**
		 * Updates the progress of a preload item
		 * @type {function(this:Preloader)}
		 * @param {string} key The name of the preload item
		 * @param {number} value The percentage value of the item that is loaded (delayed if)
		 * @param {boolean|null} force Whether to force the update of an item's value or not
		 */
		Preloader.prototype.progress = function(key, value, force){

			if(!this.visible) return false;

			var
				i,
				len = this._queue.length,
				thisRef = this
			;
			
			if(value > 0 && !force){
				if(!notInQueue(this._queue, key)){
					for(i = len-1; i>=0; i--){
						if(this._queue[i].name == key){
							if(this._queue[i].timer != null) clearTimeout(this._queue[i].timer);
							
							this._queue[i].timer = setTimeout(function queueProgressRelay(){
								thisRef.progress.apply(thisRef, [key, value, true]);
							}, 100);
							return;
						}
					}
				}
				else this.progress(key, value, true);
				return;
			}
			
			if(value == undefined || value === 0){
				if(notInQueue(this._queue, key)){
					this._queue.push({
						name:key,
						loaded:value,
						timer:null
					});
				}
			}
			else{
				for(i = len-1; i>=0; i--){
					if(this._queue[i].name == key){
						this._queue[i].loaded = value;
						break;
					}
				}
			}
			
			var currPcent = this.totalPercent();
			if(this._screen && this._screen.update) this._screen.update.apply(this._screen, [currPcent]);
			if(currPcent >= 100) this._checkComplete(true);
		};
			
		/**
		 * Checks if the preloading is completed, triggers the grace period timer
		 * @type {function(this:Preloader)}
		 * @param {boolean} fromProgress If the method was called from a progress update
		 */
		Preloader.prototype._checkComplete = function(fromProgress){
			if(singleton._checks == 0 && fromProgress){
				singleton._checks = 1;
				singleton._gracePeriodTimer = setTimeout(singleton._checkComplete, 100);
			}
			else if(!fromProgress && singleton._checks == 1){
				if(singleton.totalPercent() < 100) singleton._checks = 0;
				else singleton.hide();
			}
		};
			
		/**
		 * Returns the total percentage loaded
		 * @type {function(this:Preloader)}
		 * @return {number} The average percentage of loaded items
		 */
		Preloader.prototype.totalPercent = function(){
			var
				i,
				len = this._queue.length,
				total = 0
			;
			
			for(i = len-1; i>=0; i--){
				total += this._queue[i].loaded;
			}
				
			return Math.floor(total/len);
		};
		
		/**
		 * Resets the values of the preloader
		 * @type {function(this:Preloader)}
		 */
		Preloader.prototype.reset = function(){
			this._queue = [];
			this._checks = 0;
		};
		
		/**
		 * Hides the preloader (called upon completion)
		 * @type {function(this:Preloader)}
		 */
		Preloader.prototype.hide = function(){
			Events.broadcast("Preloader.loadingCompleted");
			this.visible = false;
			this.reset();
		};
		
		singleton = new Preloader();
		return singleton;
	});
})();