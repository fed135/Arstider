/**
 * Request
 * 
 * @version 2.0.1
 * @status Dev
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/net/request/Response", 
[], 
/** @lends net/request/Response */ 
function(){
	
	Response.DEFAULTS = {
		response:"",
		responseType: "text",
		status: 200,
		statusText:""
	};

	function Response(props){
		Arstider.deepMerge(Response.DEFAULTS, this);

		if(props){
			if(props.status == undefined){
				status = props;
				statusText = "Network error.";
			}
			else{
				Arstider.deepMerge(props, this);
			}
		}

		if(this.status == 200 && this.parseType){
			this.parse();
		}
	}

	Response.prototype.parse = function(){
		
		if(this.parseType.parser){
			this.response = this.parseType.parser(this.response);
		}

		return this.response;
	};
	
	return Response;
});