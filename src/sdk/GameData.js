/**
 * Game Data Singleton Wrapper. 
 * 
 * Provides AMD Closure.
 *
 * @author frederic charette <fredc@meetfidel.com>
 */
;(function(){

	var singleton = null,
		defaultSet = {},
		runtimeSet = {}
	;
	
	/**
	 * AMD Closure
	 */	
		define( "Arstider/GameData", ["Arstider/core/Storage"], function (Storage) {
			if(singleton != null){return singleton;}
			
			function GameData(){
				
				this.defaultSet = {};
				this.runtimeSet = {};
			}
			
			GameData.prototype.load = function(filename){
				var thisRef = this;
			
				require(["textLib!./"+filename],function(file){
					thisRef.defaultSet = JSON.parse(file);
				});
			};
			
			GameData.prototype.setStorageKey = function(key){
				Storage.key = key;
			};
			
			GameData.prototype.get = function(id, seekLocalStorage){
				var ls = null;
					
				if(this.runtimeSet[id] != undefined){
					return this.runtimeSet[id];
				}
				else{
					if(seekLocalStorage){
						ls = Storage.get(id);
						if(ls != null && ls != undefined){
							this.runtimeSet[id] = ls;
							return runtimeSet[id];
						}
					}
					
					if(this.defaultSet[id] != undefined){
						this.runtimeSet[id] = this.defaultSet[id];
						return this.runtimeSet[id];
					}
					else{
						return;
					}
				}
			};
				
			GameData.prototype.set = function(id, val, save){
				this.runtimeSet[id] = val;
				if(save===true){
					Storage.set(id, val);
				}
			};
			
			GameData.prototype.reset = function(){
				this.runtimeSet = {};
			};
			
			singleton = new GameData();
			return singleton;
		});
})();