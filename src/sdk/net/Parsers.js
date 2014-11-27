define("Arstider/net/Parsers", 
[],
function(){
	
	return {
		JSON:function(res){
			//Check if data is valid json.
			//Could add a try/catch for safety

			if(typeof res === "string"){
				return JSON.parse(res);
			}

			return res;
		},
		BLOB_IMAGE:function(res){
			//Could transfer blob object to data url here

			return res; 
		}
	};
});