;(function(){
	
	var
		pending = [],
		cache = {},
		refusedHeaders = [
			"Accept-Charset",
			"Accept-Encoding",
			"Access-Control-Request-Headers",
			"Access-Control-Request-Method",
			"Connection",
			"Content-Length",
			"Cookie",
			"Cookie2",
			"Date",
			"DNT",
			"Expect",
			"Host",
			"Keep-Alive",
			"Origin",
			"Referer",
			"TE",
			"Trailer",
			"Transfer-Encoding",
			"Upgrade",
			"User-Agent",
			"Via"
		]
	;

	function findInPending(url){
		var i = pending.length-1;
		for(i;i>=0;i--){
			if(url == pending[i].url) return true;
		}
		return false;
	}
	
	function updateInPending(url, preloaderRef){
		var i = pending.length-1;
		for(i;i>=0;i--){
			if(url == pending[i].url){
				if(pending[i].callback){
					pending[i].callback.apply(pending[i].caller, [cache[url]]);
					if(preloaderRef) preloaderRef.progress(pending[i].id, 100);
				} 
				
				pending.splice(i, 1);
			}
		}
	};

	define("Arstider/Request", [], function(Preloader){
		
		function Request(props){
			
			this.url = props.url;
			this.callback = Arstider.checkIn(props.callback, Arstider.emptyFunction);
			this.progress = Arstider.checkIn(props.progress, Arstider.emptyFunction);
			this.track = Arstider.checkIn(props.track, false);
			this.type = Arstider.checkIn(props.type, "blob");
			this.cache = Arstider.checkIn(props.cache, true);
			this.error = Arstider.checkIn(props.error, Arstider.emptyFunction);
			this.caller = Arstider.checkIn(props.caller, this);
			
			//advanced
			this.method = Arstider.checkIn(props.method, "GET");
			this.async = Arstider.checkIn(props.async, true);
			this.user = Arstider.checkIn(props.user, Arstider.emptyString);
			this.password = Arstider.checkIn(props.password, Arstider.emptyString);
			this.headers = Arstider.checkIn(props.headers, Arstider.emptyObj);
			this.postData = Arstider.checkIn(props.postData, null);
			
			this.id = this.url+"_"+Arstider.timestamp();
		}
		
		Request.prototype.send = function(){
			
			var 
				xhr,
				thisRef = this,
				header
			;
			
			require(["Arstider/Preloader"], function(Preloader){
			
				if(thisRef.track) Preloader.progress(thisRef.id, 0);
				
				if(thisRef.cache){
					if(cache[thisRef.url] !== undefined){
						thisRef.callback.apply(thisRef.caller, [cache[thisRef.url]]);
						updateInPending(thisRef.url);
						if(thisRef.track) Preloader.progress(thisRef.id, 100);
						return;
					}
					
					if(findInPending(thisRef.url)){
						pending.push(thisRef);
						return;
					}
					else{
						pending.push({url:thisRef.url});
					}
				}
				
				xhr = new XMLHttpRequest();
					
				xhr.open(thisRef.method, thisRef.url, thisRef.async, thisRef.user, thisRef.password); 
				xhr.responseType = thisRef.type;
				
				for(header in thisRef.headers){
					if(refusedHeaders.indexOf(header) === -1){
						xhr.setRequestHeader(header, thisRef.headers[header]);
					}
					else{
						if(Arstider.verbose > 1) console.warn("Arstider.Request.send: header ",header," is not accepted and will be ignored");
					}
				}
				
				xhr.onprogress = function(e) {
					if(thisRef.progress) {
						thisRef.progress.apply(thisRef.caller, [e]);
					}
					if(thisRef.track) Preloader.progress(thisRef.id, Math.round((e.loaded/e.total)*100));
				};
						
				xhr.onload = function () { 
					if (this.status == 200) {
						if (thisRef.callback) {
							thisRef.callback.apply(thisRef.caller, [this.response]);
							if(thisRef.cache){
								cache[thisRef.url] = this.response;
								updateInPending(thisRef.url, Preloader);
							}
						}
						if(thisRef.track) Preloader.progress(thisRef.id, 100);
					}
				};
						
				xhr.onerror = function(e){
					if(thisRef.error){
						thisRef.error.apply(thisRef.caller, [e]);
					}
					if(thisRef.track) Preloader.progress(thisRef.id, 100);
				};
							
				xhr.send(thisRef.postData);
			});
		};
		
		return Request;
	});
})();
			