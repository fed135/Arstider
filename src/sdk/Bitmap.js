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

		this.url = Arstider.checkIn(props.data, (props.url || ""));
		this.data = new Image();
		this.callback = props.callback || Arstider.emptyFunction;
		this.width = Arstider.checkIn(props.width, 0);
		this.height = Arstider.checkIn(props.height, 0);
		this.id = this.url+Arstider.timestamp()+Math.random();
			
		if(this.url != ""){
			if(Arstider.blobCache[this.url] != undefined) this.load(Arstider.blobCache[this.url].url);
			else if(this.url.indexOf("data:image") != -1 || (Browser.name == "safari" && Browser.version < 7) || (Browser.name == "ie")) this.load(this.url);
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
		
		if((Browser.name == "safari" && Browser.version < 7) || Browser.name == "ie"){
			Preloader.progress(this.id, 0);
			//need to save into a canvas
			this.data = new Buffer({
				name:"_compatBuffer_"+this.id
			});
			var img = new Image();
			img.onload = function(){
				//Added a padding for IE's innacurate onload...
				//setTimeout(function(){
					thisRef.data.setSize(img.width, img.height)
					thisRef.data.width = thisRef.width = img.width;
					thisRef.data.height = thisRef.height = img.height;
					thisRef.data.context.drawImage(img, 0,0);
					//fetches data - another IE safety measure
					thisRef.data.context.getImageData(1,1,1,1);
					img.onload = null;
					img.src = Arstider.emptyImgSrc;
					if(callback) callback(thisRef.data.data);
					else thisRef.callback(thisRef.data.data);
					Preloader.progress(thisRef.id, 100);
				//},0);
			};
			img.onerror = function(){
				console.warn("Could not load image ", thisRef.url);
				Preloader.progress(thisRef.id, 100);
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
			else thisRef.callback(thisRef);
		};
		this.data.src = url;
	};

	Bitmap.prototype.kill = function(){
		if(this.data && this.data.kill) this.data.kill();
		this.data = null;

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