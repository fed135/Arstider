/**
 * Request
 * 
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */
;(function(){
	
	var
		/**
		 * Pending response calls
		 * @private
		 * @type {Array}
		 */
		pending = [],
		/**
		 * Call cache
		 * @private
		 * @type {Object}
		 */
		cache = {},
		/**
		 * List of headers that are blocked by the browser
		 * @private
		 * @const
		 * @type {Object}
		 */
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
	
	window.URL = window.URL || window.webkitURL || null;
	
	/**
	 * Look for a call in the list of pending calls
	 * @private
	 * @type {function}
	 * @param {string} url The url to look for in the list of pending calls
	 * @return {boolean} If the call is in the list or not
	 */
	function findInPending(url){
		var i = pending.length-1;
		for(i;i>=0;i--){
			if(url == pending[i].url) return true;
		}
		return false;
	}
	
	/**
	 * Updates the list of pending calls with the result of a similar call response
	 * @private
	 * @type {function}
	 * @param {string} url The url of the call
	 * @param {Object} preloaderRef The instance of the preloader singleton
	 */
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
	
	/**
	 * Defines the Request module
	 */
	define("Arstider/Request", [], /** @lends Request */ function(){
		
		/**
		 * Request constructor
		 * A cover-all-situations network call class
		 * @class Request
		 * @constructor
		 * @param {Object} props Request properties
		 */
		function Request(props){
			/**
			 * Url to hit
			 * @type {string}
			 */
			this.url = props.url;
			/**
			 * Callback function
			 * @type {function}
			 */
			this.callback = Arstider.checkIn(props.callback, Arstider.emptyFunction);
			/**
			 * Method to call on progress
			 * @type {function}
			 */
			this.progress = Arstider.checkIn(props.progress, Arstider.emptyFunction);
			/**
			 * Whether to track the call in the preloader or not
			 * @type {boolean}
			 */
			this.track = Arstider.checkIn(props.track, false);
			/**
			 * Returning data type
			 * @type {string}
			 */
			this.type = Arstider.checkIn(props.type, "blob");
			/**
			 * Whether to cache the response for this call
			 * @type {boolean}
			 */
			this.cache = Arstider.checkIn(props.cache, true);
			/**
			 * On error function
			 * @type {function}
			 */
			this.error = Arstider.checkIn(props.error, Arstider.emptyFunction);
			/**
			 * Reference to the calling object, for callback scope
			 * @type {string}
			 */
			this.caller = Arstider.checkIn(props.caller, this);
			
			/**
			 * Advanced
			 */
			
			/**
			 * Request method (GET, POST, PUT, CHANGE, UPDATE, etc.)
			 * @type {string}
			 */
			this.method = Arstider.checkIn(props.method, "GET");
			/**
			 * Is call asynchronous (true is prefered)
			 * @type {boolean}
			 */
			this.async = Arstider.checkIn(props.async, true);
                        /**
                         * Mime override
                         * @type {string|null}
                         */
                        this.mimeOverride = Arstider.checkIn(props.mimeOverride, null);
			/**
			 * Optional server user name
			 * @type {string}
			 */
			this.user = Arstider.checkIn(props.user, Arstider.emptyString);
			/**
			 * Optional server password
			 * @type {string}
			 */
			this.password = Arstider.checkIn(props.password, Arstider.emptyString);
			/**
			 * Optional list of headers to send {key:value} format
			 * @type {Object}
			 */
			this.headers = Arstider.checkIn(props.headers, Arstider.emptyObj);
			/**
			 * Post data to send
			 * @type {*}
			 */
			this.postData = Arstider.checkIn(props.postData, null);
			
			/**
			 * Defines a unique call id
			 * @type {string}
			 */
			this.id = this.url+"_"+Arstider.timestamp();
			
			/**
			 * If response requires parsing
			 * @private
			 * @type {boolean}
			 */
			this._parseRequired = false;
		}
		
		/**
		 * Sends the request
		 * @type {function(this:Request)}
		 */
		Request.prototype.send = function(){
			
			var 
				xhr,
				thisRef = this,
				header
			;
			
			require(["Arstider/Preloader", "Arstider/Browser"], function(Preloader, Browser){
			
				function handleError(e){
					if(thisRef.error){
						thisRef.error.apply(thisRef.caller, [e]);
					}
					if(thisRef.track) Preloader.progress(thisRef.id, 100);
				};
			
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
				
				if(window.URL == null && thisRef.type == "blob"){
					var tag;
					if(thisRef.url.indexOf(".jpg") || thisRef.url.indexOf(".png") || thisRef.url.indexOf(".gif")){
						tag = new Image();
					}
					else if(thisRef.url.indexOf(".mp3") || thisRef.url.indexOf(".ogg")){
						tag = new Audio();
					}
					else if(thisRef.url.indexOf(".ttf") || thisRef.url.indexOf(".woff") || thisRef.url.indexOf(".otf") || thisRef.url.indexOf(".fon")|| thisRef.url.indexOf(".fnt")){
						tag = new Image(); //What would be best for simply loading a font file ?
					}
					else{
						if(Arstider.verbose > 0) console.warn("Arstider.Request.send: unsupported format, call aborted");
						return;
					}
					tag.onload = function(){
						if(thisRef.cache){
							cache[thisRef.url] = tag;
							updateInPending(thisRef.url, Preloader);
						}
						
						if(thisRef.callback) thisRef.callback.apply(thisRef.caller, [tag]);
						if(thisRef.track) Preloader.progress(thisRef.id, 100);
					};
					
					tag.onerror = handleError;
					tag.src = thisRef.url;
				}
				else{
					xhr = new XMLHttpRequest();
						
					xhr.open(thisRef.method, thisRef.url, thisRef.async, thisRef.user, thisRef.password); 
					if((Browser.name == "safari" || Browser.name == "unknown") && thisRef.type == "json") thisRef._parseRequired = true;
					else {
                                            if(thisRef.async) xhr.responseType = thisRef.type;
                                        }
                                        
                                        if(thisRef.mimeOverride != null) xhr.overrideMimeType(thisRef.mimeOverride);
					
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
							
					xhr.onload = function(){
						if(this.status == 200){
							var res;
							if(thisRef._parseRequired) res = JSON.parse(this.responseText);
							else res = this.response;
							
							if(thisRef.cache){
								cache[thisRef.url] = res;
								updateInPending(thisRef.url, Preloader);
							}
							
							if(thisRef.callback) thisRef.callback.apply(thisRef.caller, [res]);
							if(thisRef.track) Preloader.progress(thisRef.id, 100);
						}
					};
							
					xhr.onerror = handleError;
								
					xhr.send(thisRef.postData);
				}
			});
		};
		
		return Request;
	});
})();			