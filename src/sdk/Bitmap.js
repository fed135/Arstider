/**
 * Bitmap
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the Bitmap module
 */
define("Arstider/Bitmap", ["Arstider/Request", "Arstider/Browser"], /** @lends Bitmap */ function(Request, Browser){

	window.URL = (window.URL != undefined && window.URL.createObjectURL)?window.URL:(window.webkitURL || {});

	/**
	 * Bitmap constructor
	 * Image bitmap data object
	 * @class Bitmap
	 * @constructor
	 * @param {string|Image|HTMLCanvasElement|null} url The data to load/download
	 * @param {Object} success The callback method
	 */
	function Bitmap(url, success){
		this.url = url;
		this.data = new Image();
		this.post = success;
		this.width = 0;
		this.height = 0;
			
		if(Arstider.blobCache[url] != undefined) this._loadUrl(Arstider.blobCache[url].url);
		else if(url.indexOf("data:image") != -1 || (Browser.name == "safari" && Browser.version < 7)) this._loadUrl(url);
		else{
			this.req = new Request({
				url:url,
				caller:this,
				callback:this._parse,
				cache:false,
				track:true
			});
			
			this.req.send();
		}
			
		this.data.onerror = function(){
			if(Arstider.verbose > 1) console.warn("Arstider.Bitmap.onerror: error loading asset");
			this.url = Arstider.emptyImgSrc;
		};
	}
	
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
				    thisRef._loadUrl.apply(thisRef, [Arstider.blobCache[thisRef.url].url]);          
				}
				return;
			}
			else Arstider.blobCache[this.url] = {url:testURL, size:e.size};
		}
		
		//loads the element into bitmap data
		this._loadUrl(Arstider.blobCache[this.url].url);
	};
	
	/**
	 * Loads the processed url into Bitmap data for use
	 * @private
	 * @type {function(this:Bitmap)}
	 * @param {string} url URL to load
	 */
	Bitmap.prototype._loadUrl = function(url){
		var thisRef = this;
		
		if(Browser.name == "safari" && Browser.version < 7){
			//need to save into a canvas
			this.data = document.createElement("canvas");
			var ctx = this.data.getContext("2d");
			var img = new Image();
			img.onload = function(){
				thisRef.data.width = thisRef.width = img.width;
				thisRef.data.height = thisRef.height = img.height;
				ctx.drawImage(img, 0,0);
				img.onload = null;
				img.src = Arstider.emptyImgSrc;
				if(thisRef.post) thisRef.post();
			};
			img.src = url;


			return;
		}

		this.data.onload = function(){
			thisRef.data.onload = null;
			thisRef.width = thisRef.data.width;
			thisRef.height = thisRef.data.height;
			
			Arstider.setRenderStyle(thisRef.data, Arstider.defaultRenderStyle);
			
			if(thisRef.post) thisRef.post();
		};
		this.data.src = url;
	};
	
	return Bitmap;
});