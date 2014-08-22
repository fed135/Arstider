/**
 * Request
 * 
 * @version 1.1.3
 * @status Stable
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
		],

		preloaderRef = null
	;
	
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
	function updateInPending(url){
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
	define("Arstider/Request", ["Arstider/Browser"], /** @lends Request */ function(Browser){
		
		Request.urlArgs = null;

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

			// Runtime urlArguments appending (Like Require.js config.urlArgs)
			// Mostly used for cachebusting json files in your game
			if(Request.urlArgs)
			{
				this.url+= (this.url.indexOf('?') === -1 ? '?' : '&') + Request.urlArgs;
			}

			this._compatibilityMode = ((Browser.name == "ie" && Browser.version == 9) || (Browser.name == "safari" && Browser.platformVersion <= 6));

			/**
			 * Callback function
			 * @type {function}
			 */
			this.callback = Arstider.checkIn(props.callback, null);
			/**
			 * Method to call on progress
			 * @type {function}
			 */
			this.progress = Arstider.checkIn(props.progress, null);
			/**
			 * Whether to track the call in the preloader or not
			 * @type {boolean}
			 */
			this.track = Arstider.checkIn(props.track, false);
			/**
			 * Returning data type
			 * @type {string}
			 */
			this.type = Arstider.checkIn(props.type, (this._compatibilityMode)?"arraybuffer":"blob");
			/**
			 * Whether to cache the response for this call
			 * @type {boolean}
			 */
			this.cache = Arstider.checkIn(props.cache, true);
			/**
			 * On error function
			 * @type {function}
			 */
			this.error = Arstider.checkIn(props.error, null);
			/**
			 * Reference to the calling object, for callback scope
			 * @type {string}
			 */
			this.caller = Arstider.checkIn(props.caller, this);
			
			/**
			 * Advanced
			 */
			this.timeout = Arstider.checkIn(props.timeout, 12000); //10 Seconds
			this.timeoutTimer = null;
			
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
			this.postData = Arstider.checkIn(props.postData, Arstider.checkIn(props.data, null));
			
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

			/**
			 * For stanbdalone
			 */
			var thisRef = this;
			if(this.track){
				requirejs(["Arstider/Preloader"],function(p){
					preloaderRef = p;
					if(thisRef._sendPending) thisRef.send.apply(thisRef);
				});
			}

			/**
			 * If a send request is pending
			 */
			this._sendPending = false;

			this.completed = false;
		}
		
		/**
		 * Sends the request
		 * @type {function(this:Request)}
		 */
		Request.prototype.send = function(){
			
			if(preloaderRef == null && this.track){
				this._sendPending = true;
				return;
			}

			var 
				xhr,
				thisRef = this,
				header
			;

			this.completed = false;
			if(this.timeoutTimer != null) clearTimeout(this.timeoutTimer);
			
			function handleError(e){
				if(thisRef.error){
					thisRef.error.apply(thisRef.caller, [e]);
				}
				if(thisRef.track) preloaderRef.progress(thisRef.id, 100);
			};
			
			if(this.track) preloaderRef.progress(this.id, 0);

			if(this.cache){
				if(cache[this.url] !== undefined){
					this.callback.apply(this.caller, [cache[this.url]]);
					updateInPending(this.url);
					if(this.track) preloaderRef.progress(this.id, 100);
					return;
				}
					
				if(findInPending(this.url)){
					pending.push(this);
					return;
				}
				else{
					pending.push({url:this.url});
				}
			}

			if(this.type == "arraybuffer"){
				var loader = new Image();
				var ret;
				loader.onload = function(){
					loader.onload = null;
					//Only for images
					if(thisRef.url.indexOf(".jpg") || thisRef.url.indexOf(".png") || thisRef.url.indexOf(".gif")){
						setTimeout(function loadBitmapDelay(){
							ret = Arstider.saveToBuffer(thisRef.id, loader);
							ret.getPixelAt(1,1);
							ret = ret.getURL("image/png", 0);
							thisRef.cache[thisRef.url] = ret;
							if(thisRef.callback) thisRef.callback.apply(thisRef.caller, [ret]);
							if(thisRef.track) preloaderRef.progress(thisRef.id, 100);
							loader.src = Arstider.emptyImgSrc;
							if(Arstider.bufferPool[thisRef.id] && Arstider.bufferPool[thisRef.id].kill) Arstider.bufferPool[thisRef.id].kill();
						}, 50);
					}
					else{
						thisRef.cache[thisRef.url] = ret;
						if(thisRef.callback) thisRef.callback.apply(thisRef.caller, [ret]);
						if(thisRef.track) preloaderRef.progress(thisRef.id, 100);
						loader.src = Arstider.emptyImgSrc;
					}
					this.completed = true;
				};
				loader.src = this.url;

				if(this.track){
					this.timeoutTimer = setTimeout(function(){
						if(!thisRef.completed){
							preloaderRef.progress(thisRef.id, 100);
						}
					}, this.timeout);
				}
				return;
			}
				
			/**
			 * Older browser, need to use Tag-loading method, not xhr
			 */
			xhr = new XMLHttpRequest();
					
			xhr.open(this.method, this.url, this.async, this.user, this.password);

			
            if(this.async) xhr.responseType = this.type;
            if(this.type == "json") xhr.responseType = "text";
                                       
            if(this.mimeOverride != null && xhr.overrideMimeType) xhr.overrideMimeType(this.mimeOverride);

            if(this.method.toLowerCase() == "post"){
               		//check for content-type header
           		if(this.headers === Arstider.emptyObj) this.headers = {};
           		if(this.headers["Content-Type"] == undefined) this.headers["Content-Type"] = "application/x-www-form-urlencoded";
           	}

			for(header in this.headers){
				if(refusedHeaders.indexOf(header) === -1){
					xhr.setRequestHeader(header, this.headers[header]);
				}
				else{
					if(Arstider.verbose > 1) console.warn("Arstider.Request.send: header ",header," is not accepted and will be ignored");
				}
			}
				
			xhr.onprogress = function(e) {
				if(thisRef.progress) {
					thisRef.progress.apply(thisRef.caller, [e]);
				}
				if(thisRef.track) preloaderRef.progress(thisRef.id, Math.round((e.loaded/e.total)*100));
			};
						
			xhr.onload = function(){
				if(this.status == 200){
					var res;
					if(thisRef.type == "json"){
						try{
							res = JSON.parse(this.responseText);
						}
						catch(e){
							console.error(e);
							res = {};
						}
					}
					else{
						if(thisRef.type == "text"){
							res = this.responseText;
						}
						else res = this.response;
					}

					if(thisRef.cache){
						cache[thisRef.url] = res;
						updateInPending(thisRef.url, preloaderRef);
					}
					
					if(thisRef.callback) thisRef.callback.apply(thisRef.caller, [res]);
					if(thisRef.track) preloaderRef.progress(thisRef.id, 100);
				}
				else{
					if(thisRef.track) preloaderRef.progress(thisRef.id, 100);
				}
				thisRef.completed = true;
				if(thisRef.timeoutTimer != null) clearTimeout(thisRef.timeoutTimer);
				thisRef.timeoutTimer = null;
			};
						
			xhr.onerror = handleError;
						
			xhr.send(Arstider.serialize(this.postData));

			if(this.track){
				this.timeoutTimer = setTimeout(function(){
					if(!thisRef.completed){
						//xhr.abort(); -> they might eventually complete, they'll just pop-in. no big deal.
						preloaderRef.progress(thisRef.id, 100);
					}
				}, this.timeout);
			}

			return xhr;
		};
		
		return Request;
	});
})();			