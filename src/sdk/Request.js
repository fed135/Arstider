;(function(){
	
	var
		pending = [],
		cache = {}
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
			this.callback = props.callback;
			this.progress = props.progress || Arstider.emptyFunction;
			this.type = props.type || "blob";
			this.cache = props.cache || true;
			this.error = props.error || Arstider.emptyFunction;
			this.caller = props.caller || this;
			
			this.id = this.url+"_"+Arstider.timestamp();
		}
		
		Request.prototype.send = function(){
			
			var 
				xhr,
				thisRef = this
			;
			
			require(["Arstider/Preloader"], function(Preloader){
			
				Preloader.progress(thisRef.id, 0);
				
				if(thisRef.cache){
					if(cache[thisRef.url] !== undefined){
						thisRef.callback.apply(thisRef.caller, [cache[thisRef.url]]);
						updateInPending(thisRef.url);
						Preloader.progress(thisRef.id, 100);
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
					
				xhr.open('GET', thisRef.url, true); 
				xhr.responseType = thisRef.type;
				
				xhr.onprogress = function(e) {
					if(thisRef.progress) {
						thisRef.progress.apply(thisRef.caller, [e]);
					}
					Preloader.progress(thisRef.id, Math.round((e.loaded/e.total)*100));
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
						Preloader.progress(thisRef.id, 100);
					}
				};
						
				xhr.onerror = function(e){
					if(thisRef.error){
						thisRef.error.apply(thisRef.caller, [e]);
					}
					Preloader.progress(thisRef.id, 100);
				};
							
				xhr.send(null);
			});
		};
		
		return Request;
	});
})();
			