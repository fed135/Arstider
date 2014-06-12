/**
 * Storage
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */

;(function(){
	
	var 
		/**
		 * Singleton static
	 	 * @private
	 	 * @type {Storage|null}
	 	 */
		singleton = null
	;
	
	/**
	 * Defines Storage module
	 */
	define("Arstider/core/Storage", [], /** @lends core/Storage */ function(){
		
		if(singleton != null) return singleton;
		
		/** 
	     * Storage class
	     * Local Storage Interface
	     * @class core/Storage
	     * @name core/Storage
	     * @constructor
	     */
		function Storage(){
			
			/**
			 * Tells if the localStorage is available and functional
			 * @type {boolean}
			 */
			this.enabled = false;
			
			/**
			 * Storage key prefix. Affects all saves, except safeKeys
			 * @type {string}
			 */
			this.prefix = "";
			
			/**
			 * Safe keys list. Unaffected by Storage.reset and not prefixed.
			 * @private
			 * @type {Array}
			 */
			this._safeKeys = [];
			
			//Check localStorage availability
			this._test();
		}
		
		/**
		 * Checks for localStorage availability
		 * @private
		 * @type {function(this:Storage)}
		 * @return {boolean} Whether it is available or not
		 */
		Storage.prototype._test = function(){
			try{
				localStorage.test = "a";
				localStorage.removeItem("test");
				this.enabled = true;
			} catch(e){
				this.enabled = false;
				if(Arstider.verbose > 0) console.warn("Arstider.Storage.test: localStorage is unavailable");
				return false;
			}
			return true;
		};
		
		/**
		 * Defines the list un-deletable keys 
		 * @type {function(this:Storage)}
		 * @param {Array} keys The list of keys to use as safeKeys
		 */
		Storage.prototype.setSafeKeys = function(keys){
			this._safeKeys = keys;
		};
		
		/**
		 * Returns an element from the localStorage
		 * @type {function(this:Storage)}
		 * @param {string} key The storage item to return
		 * @return {?} Storage item
		 */
		Storage.prototype.get = function(key){
			if(this.enabled === false){
				if(Arstider.verbose > 1) console.warn("Arstider.Storage.get: localStorage is unavailable");
				return null;
			} 
			
			if(localStorage[this.prefix+key] == undefined){
				if(this._safeKeys.indexOf(key) != -1){
					if(localStorage[key] == undefined){
						if(Arstider.verbose > 1) console.warn("Arstider.Storage.get: ", key, " not found");
						return null;
					}
					else return localStorage[key];
				}
				if(Arstider.verbose > 1) console.warn("Arstider.Storage.get: ", this.prefix+key, " not found");
				return null;
			}
			else return localStorage[this.prefix+key];
		};
		
		/**
		 * Saves an entry in the localStorage
		 * @type {function(this:Storage)}
		 * @param {string} key The name of the Storage key
		 * @param {?} value The value to store
		 * @return {boolean} Whether the operation was successful or not
		 */	
		Storage.prototype.set = function(key, value){
			if(this.enabled === false){
				if(Arstider.verbose > 1) console.warn("Arstider.Storage.set: localStorage is unavailable");
				return false;
			}
			
			if(this._safeKeys.indexOf(key) != -1){
				localStorage[key]=value;
				if(Arstider.verbose > 2) console.warn("Arstider.Storage.set: setting safeKey ",key);
			}
			else localStorage[this.prefix+key]=value;
			
			return true;
		};

		/**
		 * Removes an entry from the localStorage
		 * @type {function(this:Storage)}
		 * @param {string} key The name of the Storage key
		 * @return {boolean} Whether the operation was successful or not
		 */	
		Storage.prototype.remove = function(key){
			if(this.enabled === false){
				return false;
				if(Arstider.verbose > 1) console.warn("Arstider.Storage.remove: localStorage is unavailable");
			}

			localStorage.removeItem(key);
			localStorage.removeItem(this.prefix+key);
			return true;
		};

		/**
		 * Returns a list of all the entries for this app
		 * @type {function(this:Storage)}
		 * @retrun {Array}
		 */
		Storage.prototype.list = function(){
			var ret = [];
			for(item in localStorage){
				if(this._safeKeys.indexOf(item) == -1 && item.indexOf(this.prefix) != -1){
					ret[ret.length] = item;
				}
			}
			return ret;
		};
		
		/**
		 * Wipes all non-safeKey entries from localStorage
		 * @type {function(this:Storage)}
		 * @return {boolean} Whether the operation was successful or not
		 */
		Storage.prototype.reset = function(){
			var item;
			
			if(this.enabled === false){
				return false;
				if(Arstider.verbose > 1) console.warn("Arstider.Storage.reset: localStorage is unavailable");
			} 
			for(item in localStorage) {
				if(this._safeKeys.indexOf(item) == -1 && item.indexOf(this.prefix) != -1) {
					localStorage.removeItem(item);
				}
				else{
					if(Arstider.verbose > 2) console.warn("Arstider.Storage.reset: keeping safeKey ",item);
				}
			}
			return true;
		};
		
		singleton = new Storage();
		return singleton;
	});
})();