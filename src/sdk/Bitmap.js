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
	 * @param {Object|null} props The properties for the bitmap (data/url, callback, width, height)
	 */
	function Bitmap(props){
		props = props || {};

		this.url = Arstider.checkIn(props.data, (props.url || ""));
		this.data = new Image();
		this.callback = props.callback || Arstider.emptyFunction;
		this.width = Arstider.checkIn(props.width, 0);
		this.height = Arstider.checkIn(props.height, 0);
			
		if(this.url != ""){
			if(Arstider.blobCache[this.url] != undefined) this.load(Arstider.blobCache[this.url].url);
			else if(this.url.indexOf("data:image") != -1 || (Browser.name == "safari" && Browser.version < 7)) this.load(this.url);
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
				    thisRef.load.apply(thisRef, [Arstider.blobCache[thisRef.url].url]);          
				}
				return;
			}
			else Arstider.blobCache[this.url] = {url:testURL, size:e.size};
		}
		
		//loads the element into bitmap data
		this.load(Arstider.blobCache[this.url].url);
	};
	
	/**
	 * Loads the processed url into Bitmap data for use
	 * @type {function(this:Bitmap)}
	 * @param {string} url URL to load
	 */
	Bitmap.prototype.load = function(url, callback){
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
				if(callback) callback(thisRef);
				else thisRef.callback(thisRef);
			};
			img.src = url;


			return;
		}

		this.data.onload = function(){
			thisRef.data.onload = null;
			thisRef.width = thisRef.data.width;
			thisRef.height = thisRef.data.height;
			
			Arstider.setRenderStyle(thisRef.data, Arstider.defaultRenderStyle);
			
			if(callback) callback(thisRef);
			else thisRef.callback(thisRef);
		};
		this.data.src = url;
	};
	
	return Bitmap;
});