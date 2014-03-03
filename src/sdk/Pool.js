/**
 * Pool Wrapper. 
 * 
 * Provides pooling system for memory-intensive/ large sets 
 *
 * @author frederic charette <fredc@meetfidel.com>
 */	
;(function(window){
	
    var singleton = null;	
    
    function constructorName(type){
    	var func = type.toString()
    	return func.substring(func.indexOf("function") + 9, func.indexOf("("));
    }

	/**
	 * AMD Closure
	 */	
		define( "Arstider/Pool", [], function () {
			
			if(singleton != null) return singleton;
			
			function Pool(){
				this._sets = {};
				this._useKey = "_inUse";
				this._trashCan = [];
				this._caps = {};
				this._pending = {};
			}
			
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
			
			Pool.prototype._alloc = function(typeName, type){
				
				var poolItem = new type();
				poolItem[this._useKey] = false;
				
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
			
			Pool.prototype.free = function(item, obliterate){
				var 
					_i = 0,
					typeName = constructorName(item.constructor)
				;
				
				if(typeName in this._sets){
					_i = this._sets[typeName].length;
					
					for(_i; _i>= 0; _i--){
						if(this._sets[typeName][_i] == item){
							if(obliterate){
								this._trashCan = this._sets[typeName].splice(_i, 1);
							}
							else{
								if(this._pending[typeName].length > 0){
									(this._pending[typeName].shift())(this._sets[typeName][_i]);
								}
								else{
									this._sets[typeName][_i][this._useKey] = false;
								}
							}
							break;
						}
					}
				}
				
				return this;
			};
			
			Pool.prototype.get = function(type, callback){
				var 
					_i = 0,
					typeName = constructorName(type)
				;
				
				if(typeName in this._sets){
					_i = this._sets[typeName].length-1;
					
					for(_i; _i>= 0; _i--){
						if(this._sets[typeName][_i][this._useKey] == false){
							this._sets[typeName][_i][this._useKey] = true;
							callback(this._sets[typeName][_i]);
						}
					}	
				}
				
				if(this._sets[typeName] == undefined || this._sets[typeName].length < this._caps[typeName]){
					callback(this._alloc(typeName, type));
				}
				else{
					this._pending[typeName].push(callback);
				}
			};
			
			Pool.prototype._addSet = function(typeName, item){
				this._sets[typeName] = [item];
				this._pending[typeName] = [];
			};
			
			Pool.prototype.removeSet = function(type){
				delete this._sets[constructorName(type)];
			};
			
			singleton = new Pool();
			return singleton;
		});
	})(window);