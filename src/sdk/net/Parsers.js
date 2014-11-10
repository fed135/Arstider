define("Arstider/net/Parsers", 
[],
function(){
	
	return {
		JSON:function(data){
			//Check if data is valid json.
			if(typeof data === "string") return JSON.parse(data);

			//Could add a try/catch for safety

			return data;
		}
	};
});