/**
 * Bitmap
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the Bitmap module
 */
define("Arstider/Bitmap", ["Arstider/Request"], function(Request){
	
	/**
	 * Bitmap constructor
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
		else if(url.indexOf("data:image") != -1) this._loadUrl(url);
		else{
			this.req = new Request({
				url:url,
				caller:this,
				callback:this._parse,
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
		if(Arstider.blobCache[this.url] == undefined){
			Arstider.blobCache[this.url] = {url:window.URL.createObjectURL(e), size:e.size};
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