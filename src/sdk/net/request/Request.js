/**
 * Request
 * 
 * @version 2.0.1
 * @status Dev
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/net/request/Request", 
[
	"Arstider/net/request/Header",
	"Arstider/net/request/Response"
],
/** @lends net/request/Request */ 
function(Header, Response){

	Request.DEFAULTS = {
		url:"/",
		dataType:null,
		timeout:12000,
		method:Header.GET,
		async:true,
		user:"",
		password:"",
		headers:{},
		data:null,
		mimeOverride:null,
		urlArgs:null,
		parser:null
	};
	
	/**
	 * Request constructor
	 * @class Request
	 * @constructor
	 * @param {Object} props Request properties
	 */
	function Request(props){
		
		Arstider.deepMerge(Request.DEFAULTS, this);
		if(props) Arstider.deepMerge(props, this);

		// Runtime urlArguments appending (Like Require.js config.urlArgs)
		// Mostly used for cachebusting json files in your game
		if(this.urlArgs != null){
			this.url+= (this.url.indexOf('?') === -1 ? '?' : '&') + this.urlArgs;
		}
		
		/**
		 * Defines a unique call id
		 * @type {string}
		 */
		this.id = this.url+"_"+Arstider.timestamp();
	}

	Request.prototype._prepareHeaders = function(xhr){

		if(this.mimeOverride != null && xhr.overrideMimeType) xhr.overrideMimeType(this.mimeOverride);
        
        if(this.method.toLowerCase() == Header.POST){
        	if(this.headers["Content-Type"] == undefined) this.headers["Content-Type"] = "application/x-www-form-urlencoded";
        }
		
		for(var header in this.headers){
			if(refusedHeaders.indexOf(header) === -1){
				xhr.setRequestHeader(header, this.headers[header]);
			}
			else{
				Arstider.log("Arstider.Request.send: header ",header," is not accepted and will be ignored", 1);
			}
		}
	};
	
	/**
	 * Sends the request
	 * @type {function(this:Request)}
	 */
	Request.prototype.send = function(resolve, reject){

		var 
			xhr = new XMLHttpRequest()
		;
		
		xhr.timeout = this.timeout;
		if(this.dataType != null && this.async) xhr.responseType = this.dataType;
		xhr.open(this.method, this.url, this.async, this.user, this.password);
        this._prepareHeaders(xhr);
        xhr.parseType = this.parser;                   
        
		if(this.onprogress) xhr.onprogress = this.onprogress.bind(this);	
		xhr.onloadend = function(e){
			if(xhr.status == 200){
				resolve(new Response(xhr));
			}
			else{
				reject(new Response(xhr));
			}
		};

		xhr.send(Arstider.serialize(this.postData));
		return xhr;
	};
	
	return Request;
});