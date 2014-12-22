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
		this.error = props.error || null;
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
			else{
				if(Browser.name == "ie" && Browser.version == 9){
					this.compatibilityLoad(this.url);
					return;
				}

				this.req = new Request({
					url:this.url,
					caller:this,
					callback:this._parse,
					cache:false,
					track:true,
					error:this.error
				});
				
				this.req.send();
			}
		}
	};

	Bitmap.prototype.compatibilityLoad = function(url){
		var thisRef = this;

		Preloader.progress(url, 0);

		this.data.onload = function(){
			thisRef.data.onload = null;
			thisRef.width = thisRef.data.width;
			thisRef.height = thisRef.data.height;

			Preloader.progress(url, 100);
			if(thisRef.callback){
				thisRef.callback(thisRef);
			}
		};

		this.data.onerror= function(e){
			if(thisRef.error) thisRef.error(Arstider.error(URIError, {code:500, module:"Arstider/Bitmap", message:"Error while parsing saved blob information for "+ thisRef.url}));

			if(e && e.preventDefault) e.preventDefault();
			return false;
		};
		this.data.src = url;
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
			if(e.indexOf && e.indexOf("data:") != -1){
				testURL = e;
			}
			else{
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
					    thisRef._fetchUrl.call(thisRef, Arstider.blobCache[thisRef.url].url);          
					}
					return;
				}
			}

			Arstider.blobCache[this.url] = {url:testURL, size:e.size || e.length*8};
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
		var thisRef = this, compatMode = (Browser.name == "safari" && Browser.platformVersion < 7);

		if(compatMode){
			this.compatPrivilege = true;
			if(Arstider.bufferPool[Arstider.tempBufferLabel + this.url] && Arstider.bufferPool[Arstider.tempBufferLabel +this.url].data != null){
				if(callback) callback(Arstider.bufferPool[Arstider.tempBufferLabel +this.url]);
				else{
					if(thisRef.callback) thisRef.callback(Arstider.bufferPool[Arstider.tempBufferLabel +this.url]);
				}
				return;
			}
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
			Arstider.log("Arstider.setRenderStyle: Cannot apply mode '"+Arstider.defaultRenderStyle+"'", 1);
		}

		this.data.onload = function(){
			var ret;

			thisRef.data.onload = null;
			ret = thisRef;
			if(compatMode){
				if(Arstider.bufferPool[Arstider.tempBufferLabel +thisRef.url] && Arstider.bufferPool[Arstider.tempBufferLabel +thisRef.url].data != null){
					ret = Arstider.bufferPool[Arstider.tempBufferLabel +thisRef.url];
				}
				else{
					ret = Arstider.saveToBuffer(Arstider.tempBufferLabel +thisRef.url, thisRef.data);
					ret.compatPrivilege = true;
				}
			}
			else{
				thisRef.width = thisRef.data.width;
				thisRef.height = thisRef.data.height;
			}


			if(callback) callback(ret);
			else{
				if(thisRef.callback) thisRef.callback(ret);
			}
		};
		this.data.onerror= function(e){
			//IE randomly removes blobs...is there some sort of limit?
			delete Arstider.blobCache[thisRef.url];
			if(thisRef.error) thisRef.error(Arstider.error(URIError, {code:500, module:"Arstider/Bitmap", message:"Error while parsing saved blob information for "+ thisRef.url}));

			if(e && e.preventDefault) e.preventDefault();
			return false;
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
				Arstider.log("Arstider.Bitmap.kill: could not revoke blob url '"+this.url+ "'", 2);
			}
			delete Arstider.blobCache[this.url];
		}
	};
	
	return Bitmap;
});