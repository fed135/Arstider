/**
 * Game Data. 
 *
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */
;(function(){

	var 
		/**
		 * Singleton static
		 * @private
		 * @type {GameData|null}
		 */
		singleton = null
	;
	
	/**
	 * Defines the GameData Module
	 */	
	define( "Arstider/GameData", ["Arstider/core/Storage"], function (Storage){
		
		if(singleton != null){return singleton;}
			
		function GameData(){
			
			/**
			 * The data set that comes from the config file, second in priority to the runtime set (defined at runtime)
			 * @private
			 * @type {Object}
			 */			
			this._defaultSet = {};
			
			/**
			 * The data set that is defined at runtime, also serves as a cache for localStorage
			 * @private
			 * @type {Object}
			 */	
			this._runtimeSet = {};
		}
			
		/**
		 * Loads a JSON file to populate the default data set
		 * @type {function(this:GameData)}
		 * @param {string} filename The JSON file to load
		 * @param {Object} callback The callback function to call once the file has been parsed
		 */
		GameData.prototype.load = function(filename, callback){
			var thisRef = this;
		
			require(["textLib!./"+filename],function(file){
				thisRef._defaultSet = JSON.parse(file);
				
				if(callback) callback();
			});
		};
			
		/**
		 * Sets the localStorage key prefix for the game
		 * @type {function(this:GameData)}
		 * @param {string} key The key prefix
		 */
		GameData.prototype.setStoragePrefix = function(key){
			Storage.prefix = key;
		};
		
		/**
		 * Gets some data from the data sets
		 * NB: Priorities are : 1- Runtime set, 2- localStorage (if seekLocalStorage is true) or Default set, 3- Default set 
		 * @type {function(this:GameData)}
		 * @param {Object} id The data key
		 * @param {Object} seekLocalStorage Whether to look into the localStorage 
		 * @return {?} The data
		 */
		GameData.prototype.get = function(id, seekLocalStorage){
			var ls = null;
				
			if(this._runtimeSet[id] != undefined){
				return this._runtimeSet[id];
			}
			else{
				if(seekLocalStorage){
					ls = Storage.get(id);
					if(ls != null && ls != undefined){
						this._runtimeSet[id] = ls;
						return this._runtimeSet[id];
					}
					else{
						if(Arstider.verbose > 1) console.warn("Arstider.GameData.get: ", id," not found in localStorage");
					}
				}
				
				if(this._defaultSet[id] != undefined){
					this._runtimeSet[id] = this._defaultSet[id];
					return this._runtimeSet[id];
				}
				else{
					if(Arstider.verbose > 1) console.warn("Arstider.GameData.get: ", id," not found in config");
					return;
				}
			}
		};
		
		/**
		 * Saves an entry in the runtime data set (and in localStorage if save is true)
		 * @type {function(this:GameData)}
		 * @param {string} id The data key
		 * @param {?} val The data to save
		 * @param {boolean|null} save Whether to save in the localStorage as well or not
		 */
		GameData.prototype.set = function(id, val, save){
			this._runtimeSet[id] = val;
			if(save===true){
				Storage.set(id, val);
			}
		};
		
		/**
		 * Flushes the runtime set (and localStorage if seekLocalStorage is true)
		 * @type {function(this:GameData)}
		 * @param {boolean|null} seekLocalStorage Whether to reset the localStorage or not
		 */
		GameData.prototype.reset = function(seekLocalStorage){
			if(Arstider.verbose > 1) console.warn("Arstider.GameData.reset: resetting runtime variables");
			this._runtimeSet = {};
			if(seekLocalStorage) Storage.reset();
		};
		
		singleton = new GameData();
		return singleton;
	});
})();