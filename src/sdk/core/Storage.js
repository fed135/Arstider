;(function(){
	
	var singleton = null;
			
	function isSafekey(key, safes){
		for(var i = 0; i<safes.length; i++){
			if(safes[i] == key) return true;
		}
		return false;
	}
	
	define("Arstider/core/Storage", [], function(){
		
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
			}
		};
						
		Storage.prototype.get = function(key){
			if(this.enabled === false) return null;
			
			if(localStorage[this.key+key] == undefined){
				if(isSafekey(key)){
					if(localStorage[key] == undefined) return null;
					else return localStorage[key];
				}
				return null;
			}
			else return localStorage[this.key+key];
		};
					
		Storage.prototype.set = function(key, value){
			if(this.enabled === false) return null;
			
			if(isSafekey(key)) localStorage[key]=value;
			else localStorage[this.key+key]=value;
		};
		
		Storage.prototype.reset = function(){
			var item;
			
			if(this.enabled === false) return null;
			for(item in localStorage) {
				if(!isSafekey(item) && item.indexOf(this.key) != -1) {
					localStorage.removeItem(item);
				}
			}
		};
	});
})();