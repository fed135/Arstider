;(function(){
	
	var singleton = null;
			
	function isSafekey(key, safes){
		for(var i = 0; i<safes.length; i++){
			if(safes[i] == key) return true;
		}
		return false;
	}
	
	define("Arstider/core/Storage", [], function(){
		
		if(singleton != null) return singleton;
		
		function Storage(){
			this.enabled = false;
			this.key = "";
			this.safeKeys = ["sfxVol", "musicVol"];
			
			this.test();
		}
		
		Storage.prototype.test = function(){
			try{
				localStorage.test = "a";
				localStorage.removeItem("test");
				this.enabled = true;
			} catch(e){
				this.enabled = false;
				if(Arstider.verbose > 0) console.warn("Arstider.Storage.test: localStorage is unavailable");
			}
		};
						
		Storage.prototype.get = function(key){
			if(this.enabled === false){
				if(Arstider.verbose > 1) console.warn("Arstider.Storage.get: localStorage is unavailable");
				return null;
			} 
			
			if(localStorage[this.key+key] == undefined){
				if(isSafekey(key, this.safeKeys)){
					if(localStorage[key] == undefined){
						if(Arstider.verbose > 1) console.warn("Arstider.Storage.get: ", key, " not found");
						return null;
					}
					else return localStorage[key];
				}
				if(Arstider.verbose > 1) console.warn("Arstider.Storage.get: ", this.key+key, " not found");
				return null;
			}
			else return localStorage[this.key+key];
		};
					
		Storage.prototype.set = function(key, value){
			if(this.enabled === false){
				if(Arstider.verbose > 1) console.warn("Arstider.Storage.set: localStorage is unavailable");
				return null;
			}
			
			if(isSafekey(key, this.safeKeys)){
				localStorage[key]=value;
				if(Arstider.verbose > 2) console.warn("Arstider.Storage.set: setting safeKey ",key);
			}
			else localStorage[this.key+key]=value;
		};
		
		Storage.prototype.reset = function(){
			var item;
			
			if(this.enabled === false){
				return null;
				if(Arstider.verbose > 1) console.warn("Arstider.Storage.reset: localStorage is unavailable");
			} 
			for(item in localStorage) {
				if(!isSafekey(item, this.safeKeys) && item.indexOf(this.key) != -1) {
					localStorage.removeItem(item);
				}
				else{
					if(Arstider.verbose > 2) console.warn("Arstider.Storage.reset: keeping safeKey ",item);
				}
			}
		};
		
		singleton = new Storage();
		return singleton;
	});
})();