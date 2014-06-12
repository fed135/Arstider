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

	function isInBucket(entry, bucket){
		if(entry.buckets.length == 0) return false;
		return (entry.buckets.indexOf(bucket) != -1 || bucket === "*");
	}
	
	/**
	 * Defines the GameData Module
	 */
	define( "Arstider/GameData", ["Arstider/core/Storage", "Arstider/Request"], /** @lends GameData */ function (Storage, Request){

		if(singleton != null) return singleton;

		/**
		 * GameData constructor
		 * A centralized data-store, joining config files, localstorage and runtime variables
		 * @class GameData
		 * @constructor
		 */
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
			var req = new Request({
				url:filename,
				caller:this,
				track:true,
				cache:false,
				type:"json",
				callback:function(file){
					if(file != null){
						this._defaultSet = file;
					}
					else{
						if(Arstider.verbose > 0) console.warn("Arstider.GameData.load: JSON parse error in config file");
					}
					if(callback) callback();
				}
			}).send();
		};

		/**
		 * Sets the localStorage key prefix for the game
		 * @type {function(this:GameData)}
		 * @param {string} key The key prefix
		 * @return {Object} Self reference, for chaining
		 */
		GameData.prototype.setStoragePrefix = function(key){
			Storage.prefix = key;
			return singleton;
		};

		/**
		 * Gets some data from the data sets
		 * NB: Priorities are : 1- Runtime set, 2- localStorage (if seekLocalStorage is true) or Default set, 3- Default set
		 * @type {function(this:GameData)}
		 * @param {Object} id The data key
		 * @param {Object} seekLocalStorage Whether to look into the localStorage
		 * @return {*} The data
		 */
		GameData.prototype.get = function(id, seekLocalStorage){
			var ls = null;

			if(this._runtimeSet[id] != undefined){
				return this._runtimeSet[id].hist[this._runtimeSet[id].rev];
			}
			else{
				if(seekLocalStorage){
					ls = Storage.get(id);
					if(ls != null && ls != undefined){
						this.set(id, {value:ls});
						return this._runtimeSet[id];
					}
				}

				if(this._defaultSet[id] != undefined){
					return this._defaultSet[id];
				}
			}
			return;
		};

		/**
		 * Saves an entry in the runtime data set (and in localStorage if save is true)
		 * @type {function(this:GameData)}
		 * @param {string} id The data key
		 * @param {*} value The value to assign to that entry
		 * @param {boolean} save Whether to save thatr entry in the local storage
		 * @return {Object} Self reference, for chaining
		 */
		GameData.prototype.set = function(id, value, save){
			if(id in this._runtimeSet){
				if(this._runtimeSet[id].rev != this._runtimeSet[id].hist.length -1) this._runtimeSet[id].hist.splice(this._runtimeSet[id].rev+1, this._runtimeSet[id].hist.length);
				this._runtimeSet[id].hist.push(value);
				this._runtimeSet[id].rev = this._runtimeSet[id].hist.length -1;
			}
			else{
				this._runtimeSet[id] = {
					rev:0,
					hist:[value],
					buckets:[]
				};
			}

			if(save===true) this.save(id);
			return singleton;
		};

		/**
		 * Saves an entry in LocalStorage
		 * @type {function(this:GameData)}
		 * @param {string} id The data key
		 * @return {Object} Self reference, for chaining
		 */
		GameData.prototype.save = function(id){
			Storage.set(id, this.get(id));
			return singleton;
		};

		/**
		 * Adds an entry in a labelled bucket, for data grouping, mass manipulations, etc.
		 * @type {function(this:GameData)}
		 * @param {string} id The data key
		 * @param {string} bucket The name of the bucket 
		 * @return {Object} Self reference, for chaining
		 */
		GameData.prototype.addToBucket = function(id, bucket){
			if(id in this._runtimeSet){
				if(this._runtimeSet[id].buckets.indexOf(bucket) == -1){
					this._runtimeSet[id].buckets.push(bucket);
				}
			}
			else{
				if(Arstider.verbose > 1) console.warn("Arstider.GameData.addToBucket: ", id," not found in game data");
			}
			return singleton;
		};

		/**
		 * Removes an entry from a labelled bucket
		 * @type {function(this:GameData)}
		 * @param {string} id The data key
		 * @param {string} bucket The name of the bucket 
		 * @return {Object} Self reference, for chaining
		 */
		GameData.prototype.removeFromBucket = function(id, bucket){
			if(id in this._runtimeSet){
				var index = this._runtimeSet[id].buckets.indexOf(bucket);
				if(index != -1){
					this._runtimeSet[id].buckets.splice(index, 1);
				}
			}
			else{
				if(Arstider.verbose > 1) console.warn("Arstider.GameData.addToBucket: ", id," not found in game data");
			}
			return singleton;
		};

		/**
		 * Revert an entry by x index in history
		 * @type {function(this:GameData)}
		 * @param {string} id The data key
		 * @param {number|null} times The number of revisions to go back to
		 * @return {Object} Self reference, for chaining
		 */
		GameData.prototype.revert = function(id, times){
			times = Arstider.checkIn(times, 1);

			if(id in this._runtimeSet){
				if(this._runtimeSet[id].hist.length > 1){
					if(this._runtimeSet[id].rev > 0){
						this._runtimeSet[id].rev -= times;
						if(this._runtimeSet[id].rev < 0) this._runtimeSet[id].rev = 0;
						return singleton;
					}
				}
				if(Arstider.verbose > 1) console.warn("Arstider.GameData.revert: ", id," cannot revert because no earlier versions");
			}
			else{
				if(Arstider.verbose > 1) console.warn("Arstider.GameData.revert: ", id," not found in game data");
			}
			return singleton;
		};

		/**
		 * Re-apply an update to an an entry by x index in history
		 * @type {function(this:GameData)}
		 * @param {string} id The data key
		 * @param {number|null} times The number of revisions to go forward to
		 * @return {Object} Self reference, for chaining
		 */
		GameData.prototype.redo = function(id, times){
			times = Arstider.checkIn(times, 1);

			if(id in this._runtimeSet){
				if(this._runtimeSet[id].hist.length > 1){
					if(this._runtimeSet[id].rev < this._runtimeSet[id].hist.length -1){
						this._runtimeSet[id].rev += times;
						if(this._runtimeSet[id].rev > this._runtimeSet[id].hist.length -1) this._runtimeSet[id].rev = this._runtimeSet[id].hist.length -1;
						return singleton;
					}
				}
				if(Arstider.verbose > 1) console.warn("Arstider.GameData.revert: ", id," cannot revert because no later versions");
			}
			else{
				if(Arstider.verbose > 1) console.warn("Arstider.GameData.revert: ", id," not found in game data");
			}
			return singleton;
		};

		/**
		 * Save GameData current state
		 * @type {function(this:GameData)}
		 * @param {string} id The key to save the state as (stored in Arstider.savedStates, like screens)
		 * @param {boolean|null} includeStorage Whether to include localStorage entries in the snapshot
		 * @param {boolean|null} store Whether to store the snapshot in localStorage
		 * @return {Object} Self reference, for chaining
		 */
		GameData.prototype.saveStateAs = function(id, includeStorage, store){
			Arstider.savedStates[id] = Arstider.clone(this._runtimeSet);
			if(includeStorage){
				Arstider.savedStates[id]._storage = {};
				var list = Storage.list();
				for(var i =0; i<list.length; i++){
					Arstider.savedStates[id]._storage[list[i]] = Storage.get(list[i]);
				}
			}

			if(store){
				this.set(id, JSON.stringify(Arstider.savedStates[id]), true);
			}
			return singleton;
		};
 
 		/**
		 * Load GameData previously saved current state
		 * @type {function(this:GameData)}
		 * @param {string} id The key to load the state from
		 * @param {boolean|null} includeStorage Whether to include localStorage entries from the snapshot
		 * @return {Object} Self reference, for chaining
		 */
		GameData.prototype.loadState = function(id, includeStorage){
			this._runtimeSet = Arstider.savedStates[id];
			if(includeStorage && this._runtimeSet._storage){
				for(var i in this._runtimeSet._storage){
					Storage.set(i, this._runtimeSet._storage[i]);
				}
				delete this._runtimeSet._storage;
			}
			return singleton;
		};

		/**
		 * Save entries from x bucket in localStorage
		 * @type {function(this:GameData)}
		 * @param {string} name The name of the bucket to call save on
		 * @return {Object} Self reference, for chaining
		 */
		GameData.prototype.saveBucket = function(name){
			var i;
			for(i in this._runtimeSet){
				if(isInBucket(this._runtimeSet[i], name)){
					this.save(i);
				}
			}
			return singleton;
		};

		/**
		 * Calls revert on all the entries from bucket x
		 * @type {function(this:GameData)}
		 * @param {string} name The name of the bucket to revert the entries of
		 * @param {number|null} times The number of revisions to revert
		 * @return {Object} Self reference, for chaining
		 */
		GameData.prototype.revertBucket = function(name, times){
			var i;
			for(i in this._runtimeSet){
				if(isInBucket(this._runtimeSet[i], name)){
					this.revert(i, times);
				}
			}
			return singleton;
		};

		/**
		 * Calls redo on all the entries from bucket x
		 * @type {function(this:GameData)}
		 * @param {string} name The name of the bucket to redo the entries of
		 * @param {number|null} times The number of revisions to redo
		 * @return {Object} Self reference, for chaining
		 */
		GameData.prototype.redoBucket = function(name, times){
			var i;
			for(i in this._runtimeSet){
				if(isInBucket(this._runtimeSet[i], name)){
					this.redo(i, times);
				}
			}
			return singleton;
		};

		/**
		 * Returns an object key->value of all the items of a bucket
		 * @type {function(this:GameData)}
		 * @param {string} name The name of the bucket to get the entries from
		 * @return {Object} The data from the bucket
		 */
		GameData.prototype.getBucket = function(name){
			var i, ret = {};
			for(i in this._runtimeSet){
				if(isInBucket(this._runtimeSet[i], name)){
					ret[i] = this.get(i);
				}
			}
			return ret;
		};

		/**
		 * To remove an entry from GameData
		 * @type {function(this:GameData)}
		 * @param {string} name The name of the entry to remove
		 * @param {boolean|null} storageToo Whether to clear the storage entry as well
		 * @return {Object} Self reference, for chaining
		 */
		GameData.prototype.unset = function(id, storageToo){
			delete this._runtimeSet[id];

			if(storageToo) Storage.remove(id);
			return singleton;
		};
		
		/**
		 * Removes all of the entries of a bucket 
		 * @type {function(this:GameData)}
		 * @param {string} name The name of the bucket to remove the entries from
		 * @param {boolean|null} storageToo Whether to reset the localStorage or not
		 * @return {Object} Self reference, for chaining
		 */
		GameData.prototype.clearBucket = function(name, storageToo){
			var i;
			for(i in this._runtimeSet){
				if(isInBucket(this._runtimeSet[i], name)){
					this.unset(i, storageToo);
				}
			}
			return singleton;
		};

		/**
		 * Calls the reset method on localStorage
		 * @type {function(this:GameData)}
		 * @return {Object} Self reference, for chaining
		 */
		GameData.prototype.clearStorage = function(){
			Storage.reset();
			return singleton;
		};

		singleton = new GameData();
		return singleton;
	});
})();