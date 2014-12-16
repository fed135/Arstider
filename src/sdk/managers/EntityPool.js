/**
 * Pool
 * 
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */	
define( "Arstider/managers/EntityPool", 
[
	"Arstider/core/Entity"
], 
/** @lends managers/Pool */ 
function (Entity){
	
	/**
	 * Pool constructor
	 * A memory pool manager (limits instantiation of a certain constructor)
	 * @class managers/Pool
	 * @constructor
	 */
	function EntityPool(){
		/**
		 * The list of pools
		 * @private
		 * @type {Object}
		 */
		this._sets = {};
	}
	
	/**
	 * Pre-allocates a set number of instances
	 * @type {function(this:EntityPool)}
	 * @param {function} type The constructor to instantiate
	 * @param {number|null} number The number of instances to prepare
	 * @return {EntityPool} Returns pool singleton for chaining
	 */
	EntityPool.prototype.preallocate = function(type, components, num){

		var 
			i = (num || 1)-1
		;

		if(!(type in this._sets)){
			this._addSet(type);
		}
		
		for(i; i>= 0; i--){
			this._sets[type].push(this._spawn(type, components));
		}
		
		return this;
	};
	
	/**
	 * Instantiates a constructor and saves the result in the pool
	 * @private
	 * @type {function(this:EntityPool)}
	 * @param {string} typeName The constructor name
	 * @param {function} type The constructor
	 * @return {Object} The resulting instance
	 */
	EntityPool.prototype._spawn = function(type, components){
		
		var poolItem = new Entity();
		poolItem.addComponents(components);
		return poolItem;
	};
	
	/**
	 * Puts an instance back in the pool
	 * @type {function(this:EntityPool)}
	 * @param {Object} item The instance to liberate
	 * @param {boolean|null} obliterate If true, will permanently delete the instance
	 * @return {EntityPool} Returns pool singleton for chaining
	 */
	EntityPool.prototype.free = function(item){

		var 
			i
		;

		if(type in this._sets){
			i = this._sets[type].indexOf(item);
			
			if(i == -1){
				this._sets[type].push(item);
			}
		}
		
		return this;
	};
	
	/**
	 * Gets an instance from the pool (async)
	 * @type {function(this:EntityPool)}
	 * @param {function} type The constructor to get an instance of
	 * @param {function} callback The callback method with the instance as a parameter
	 */
	EntityPool.prototype.get = function(type, components){
		
		if(type in this._sets){
			if(this._sets[type].length > 0){
				return this._sets[type].shift();
			}
		}
		
		return this._spawn(type, components || []);
	};
	
	/**
	 * Adds a constructor set in the pool
	 * @private
	 * @type {function(this:EntityPool)}
	 * @param {string} typeName The name of the constructor
	 * @param {Object} item An instance of the constructor
	 */
	EntityPool.prototype._addSet = function(type){

		this._sets[type] = [];
	};
	
	/**
	 * Removes a constructor from the pool sets
	 * @type {function(this:EntityPool)}
	 * @param {function} type The Object constructor to remove from the pool sets
	 */
	EntityPool.prototype.removeSet = function(type){

		delete this._sets[type];
	};
	
	return new EntityPool();
});