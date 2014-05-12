/**
 * Pool
 * 
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */

;(function(){
	
    var 
    	/**
		 * Singleton static
		 * @private
		 * @type {Pool|null}
		 */
    	singleton = null
    ;	
    
    /**
     * Returns the name of a class constructor
     * @private
     * @type {function}
     * @param {function} type The class constructor function
     * @return {string} The name of the constructor
     */
    function constructorName(type){
    	var func = type.toString();
    	return func.substring(func.indexOf("function") + 9, func.indexOf("("));
    }

	/**
	 * Defines the Pool module
	 */	
	define( "Arstider/Pool", [], /** @lends Pool */ function (){
			
		if(singleton != null) return singleton;
		
		/**
		 * Pool constructor
		 * A memory pool manager (limits instantiation of a certain constructor)
		 * @class Pool
		 * @constructor
		 */
		function Pool(){
			/**
			 * The list of pools
			 * @private
			 * @type {Object}
			 */
			this._sets = {};
			
			/**
			 * The property to add to objects in use
			 * @type {string}
			 */
			this.useKey = "__inUse";
			
			/**
			 * The current pool limits for sets
			 * @private
			 * @type {Object}
			 */
			this._caps = {};
			
			/**
			 * Pending fetch requests in sets
			 * @private
			 * @type {Object}
			 */
			this._pending = {};
		}
		
		/**
		 * Pre-allocates a set number of instances and optionally set a cap
		 * @type {function(this:Pool)}
		 * @param {function} type The constructor to instantiate
		 * @param {number} number The number of instances to prepare
		 * @param {number|null} cap The maximum number of allowed instances for that constructor
		 * @return {Pool} Returns pool singleton for chaining
		 */
		Pool.prototype.prealloc = function(type, number, cap){
			var 
				_i = number-1,
				typeName = constructorName(type)
			;
			
			for(_i; _i>= 0; _i--){
				this._alloc(typeName, type);
			}
			
			cap = cap || 9999;
			this._caps[typeName] = cap;
			
			return this;
		};
		
		/**
		 * Instantiates a constructor and saves the result in the pool
		 * @private
		 * @type {function(this:Pool)}
		 * @param {string} typeName The constructor name
		 * @param {function} type The constructor
		 * @return {Object} The resulting instance
		 */
		Pool.prototype._alloc = function(typeName, type){
			
			var poolItem = new type();
			poolItem[this.useKey] = false;
			
			if(!(typeName in this._sets)){
				this._addSet(typeName, poolItem);
			}
			else{
				if(this._sets[typeName][0] == undefined){
					this._sets[typeName][0] = poolItem;
				}
				else{
					this._sets[typeName].push(poolItem);
				}
			}
			
			return poolItem;
		};
		
		/**
		 * Puts an instance back in the pool
		 * @type {function(this:Pool)}
		 * @param {Object} item The instance to liberate
		 * @param {boolean|null} obliterate If true, will permanently delete the instance
		 * @return {Pool} Returns pool singleton for chaining
		 */
		Pool.prototype.free = function(item, obliterate){
			var 
				_i = 0,
				typeName = constructorName(item.constructor)
			;
			
			if(typeName in this._sets){
				_i = this._sets[typeName].length;
				
				for(_i; _i>= 0; _i--){
					if(this._sets[typeName][_i] == item){
						if(obliterate) this._sets[typeName].splice(_i, 1);
						else{
							if(this._pending[typeName].length > 0) (this._pending[typeName].shift())(this._sets[typeName][_i]);
							else this._sets[typeName][_i][this.useKey] = false;
						}
						break;
					}
				}
			}
			
			return this;
		};
		
		/**
		 * Gets an instance from the pool (async)
		 * @type {function(this:Pool)}
		 * @param {function} type The constructor to get an instance of
		 * @param {function} callback The callback method with the instance as a parameter
		 */
		Pool.prototype.get = function(type, callback){
			var 
				_i = 0,
				typeName = constructorName(type)
			;
			
			if(typeName in this._sets){
				_i = this._sets[typeName].length-1;
				
				for(_i; _i>= 0; _i--){
					if(this._sets[typeName][_i][this.useKey] == false){
						this._sets[typeName][_i][this.useKey] = true;
						callback(this._sets[typeName][_i]);
					}
				}	
			}
			
			if(this._sets[typeName] == undefined || this._sets[typeName].length < this._caps[typeName]) callback(this._alloc(typeName, type));
			else this._pending[typeName].push(callback);
		};
		
		/**
		 * Adds a constructor set in the pool
		 * @private
		 * @type {function(this:Pool)}
		 * @param {string} typeName The name of the constructor
		 * @param {Object} item An instance of the constructor
		 */
		Pool.prototype._addSet = function(typeName, item){
			this._sets[typeName] = [item];
			this._pending[typeName] = [];
		};
		
		/**
		 * Removes a constructor from the pool sets
		 * @type {function(this:Pool)}
		 * @param {function} type The Object constructor to remove from the pool sets
		 */
		Pool.prototype.removeSet = function(type){
			delete this._sets[constructorName(type)];
		};
		
		singleton = new Pool();
		return singleton;
	});
})();