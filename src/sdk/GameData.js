/**
 * Game Data Singleton Wrapper. 
 * 
 * Provides AMD Closure.
 *
 * @author frederic charette <fredc@meetfidel.com>
 */
;(function(window){

	var singleton = null,
		defaultSet = {},
		runtimeSet = {}
	;
	
	/**
	 * AMD Closure
	 */	
		define( "Arstider/GameData", ["Arstider/core/Storage", "libs/text!../media/config.json"], function (Storage, config) {
			if(singleton != null){return singleton;}
			
			function GameData(){
				
				this.defaultSet = JSON.parse(config);
				this.runtimeSet = {};
			}
			
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
			
			singleton = new GameData();
			return singleton;
		});
})(window);