/**
 * Bitmap
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the Bitmap module
 */
define("Arstider/Bitmap", ["Arstider/Request", "Arstider/Browser", "Arstider/Buffer", "Arstider/Preloader"], /** @lends Bitmap */ function(Request, Browser, Buffer, Preloader){

	window.URL = (window.URL != undefined && window.URL.createObjectURL)?window.URL:(window.webkitURL || {});

	/**
	 * Bitmap constructor
	 * Image bitmap data object
	 * @class Bitmap
	 * @constructor
	 * @param {Object|null} props The properties for the bitmap (data/url, callback, width, height)
	 */
	function Bitmap(props){
		props = props || {};

		this.attempt = 0;
		this.url = Arstider.checkIn(props.data, (props.url || ""));
		this.data = new Image();
		this.callback = props.callback || null;
		this.width = Arstider.checkIn(props.width, 0);
		this.height = Arstider.checkIn(props.height, 0);
		this.id = this.url+Arstider.timestamp()+Math.random();
			
		this.load();
	}

	Bitmap.prototype.load = function(){
		var thisRef = this;
		if(this.url != ""){
			this.attempt++;
			if(Arstider.blobCache[this.url] != undefined) this._fetchUrl(Arstider.blobCache[this.url].url);
			else if(this.url.indexOf("data:image") != -1){
				this._fetchUrl(this.url);
			}
			else if((Browser.name == "safari" && Browser.version < 7) || Browser.name == "ie"){
				if(Arstider.bufferPool["_compatBuffer_"+this.url]){
					this.data = Arstider.bufferPool["_compatBuffer_"+this.url];
					if(this.callback){
						if(this.data._loaded){
							setTimeout(function retroLoadDelay(){thisRef.callback(thisRef.data.data);},0);
						}
						else{
							this.data.onchange.addOnce(function(){
								thisRef.callback(thisRef.data.data);
							});
						}
					}
				}
				else{
					this.data = new Buffer({
						name:"_compatBuffer_"+this.url
					});
					this._fetchUrl(this.url);
				}
			}
			else{
				this.req = new Request({
					url:this.url,
					caller:this,
					callback:this._parse,
					cache:false,
					track:true
				});
				
				this.req.send();
			}
		}
	};
	
	/**
	 * Parses the received image and adds it to the blobCache
	 * @private
	 * @type {function(this:Bitmap)}
	 * @param {Object} e The response of the xhr request
	 */
	Bitmap.prototype._parse = function(e){
		var thisRef = this;

		if(Arstider.blobCache[this.url] == undefined){
			var testURL;
			try{
				testURL = window.URL.createObjectURL(e);
			}
			catch(e){
				testURL = null;
			}

			if(!window.URL.createObjectURL || !testURL){
				var reader = new window.FileReader();
				reader.readAsDataURL(e); 
				reader.onloadend = function(){
				    Arstider.blobCache[thisRef.url] = {url:reader.result, size:e.size}; 
				    thisRef._fetchUrl.apply(thisRef, [Arstider.blobCache[thisRef.url].url]);          
				}
				return;
			}
			else Arstider.blobCache[this.url] = {url:testURL, size:e.size};
		}
		
		//loads the element into bitmap data
		this._fetchUrl(Arstider.blobCache[this.url].url);
	};
	
	/**
	 * Loads the processed url into Bitmap data for use
	 * @type {function(this:Bitmap)}
	 * @param {string} url URL to load
	 */
	Bitmap.prototype._fetchUrl = function(url, callback){
		var thisRef = this;
		
		if((Browser.name == "safari" && Browser.version < 7) || Browser.name == "ie"){
			Arstider.__retroAssetLoader = true;
			Preloader.progress(this.id, 0);
			//need to save into a canvas
			var img = new Image();
			img.onload = function(){
				//Added a padding for IE's innacurate onload...
				setTimeout(function bitmapLoadDelay(){
					if(thisRef && thisRef.data){
						if(!thisRef.data.setSize){
							thisRef.data = new Buffer({
								name:"_compatBuffer_"+thisRef.url
							});
						}

						if(thisRef.data.setSize){
							thisRef.data.setSize(img.width, img.height)
							thisRef.data.width = thisRef.width = img.width;
							thisRef.data.height = thisRef.height = img.height;
							thisRef.data.context.drawImage(img, 0,0);
							//fetches data - another IE safety measure
							var bucket = thisRef.data.context.getImageData(1,1,1,1);
							img.onload = null;
							img.src = Arstider.emptyImgSrc;
							if(callback) callback(thisRef.data.data);
							else thisRef.callback(thisRef.data.data);
							thisRef.data._loaded = true;
							thisRef.data.onchange.dispatch(thisRef.data.data);
							thisRef.attempt = 0;
							Preloader.progress(thisRef.id, 100);
							bucket = null;
						}
					}
					else{
						console.warn("Arstider.Bitmap._fetchUrl: Entity or data no longer available");
					}
					img = null;
				},50);
			};
			img.onerror = function(e){
				if(thisRef.attempt > 3){
					console.warn("Arstider.Bitmap._fetchUrl: could not load image ", thisRef.url, ":", e);
					Preloader.progress(thisRef.id, 100);
				}
				else{
					if(thisRef && thisRef.load) thisRef.load.apply(thisRef);
				}
			};

			img.src = url;


			return;
		}

		if(Arstider.defaultRenderStyle === "sharp"){
			if(Browser.name == "firefox") this.data.style.imageRendering = '-moz-crisp-edges';
			else if(Browser.name == "opera") this.data.style.imageRendering = '-o-crisp-edges';
			else if(Browser.name == "safari") this.data.style.imageRendering = '-webkit-optimize-contrast';
			else if(Browser.name == "ie") this.data.style.msInterpolationMode = 'nearest-neighbor';
			else this.data.style.imageRendering = 'crisp-edges';
		}
		else if(Arstider.defaultRenderStyle === "auto"){
			this.data.style.imageRendering = 'auto';
			this.data.style.msInterpolationMode = 'auto';
		}
		else{
			if(Arstider.verbose > 0) console.warn("Arstider.setRenderStyle: Cannot apply mode '",Arstider.defaultRenderStyle,"'");
		}

		this.data.onload = function(){
			thisRef.data.onload = null;
			thisRef.width = thisRef.data.width;
			thisRef.height = thisRef.data.height;
			
			if(callback) callback(thisRef);
			else{
				if(thisRef.callback) thisRef.callback(thisRef);
			}
		};
		this.data.src = url;
	};

	Bitmap.prototype.kill = function(){
		if(this.data && this.data.kill) this.data.kill();
		this.data = null;

		//Shouldn't need to revoke... we'll see if this causes issues
		if(this.url && this.url in Arstider.blobCache){
			try{
				if(Arstider.blobCache[this.url].url) window.URL.revokeObjectURL(Arstider.blobCache[this.url].url);
			}
			catch(e){
				if(Arstider.verbose > 2) console.log("Arstider.Bitmap.kill: could not revoke blob url '",this.url, "'");
			}
			delete Arstider.blobCache[this.url];
		}
	};
	
	return Bitmap;
});