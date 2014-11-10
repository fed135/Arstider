/**
 * Request
 * 
 * @version 1.1.3
 * @status Stable
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/net/Net", 
[
	"Arstider/net/request/Promise",	//Needed for IE support
	"Arstider/net/request/Request",
	"Arstider/net/request/Header"
], 
/** @lends net/Net */ 
function(Promise, Request, Header){
	

	Net.urlArgs = null;

	function Net(){}

	Net.prototype.get = function(props){

		props.method = Header.GET;
		
		return this.xhr(props);
	};

	Net.prototype.post = function(props){
		
		props.method = Header.POST;
		
		return this.xhr(props);
	};

	Net.prototype.xhr = function(props){
		
		var 
			req,
			promise
		;

		props.urlArgs = Net.urlArgs;

		req = new Request(props);
		promise = new Promise(function(resolve, reject){
			req.send(resolve, reject);
		});

		return promise;
	};
	
	return new Net();
});