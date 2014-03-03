;(function(){

	var singleton = null;
	
	define("Arstider/Dictionary", ["libs/text!..{game}/media/strings.json"], function(strs){
	
		if(singleton != null) return singleton;
		
		function Dictionary(){
			this.strList = JSON.parse(strs);
		}
		
		Dictionary.prototype.translate = function(key, delimiters){
			return key; //TODO
		};
		
		singleton = new Dictionary();
		return singleton;
	});
})();
