/**
 * ImageData
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/display/bitmap/ImageData", 
[
	"Arstider/core/Buffer",
	"Arstider/net/Net"
], 
/** @lends display/bitmap/ImageData */ 
function(Buffer, Net){

	/**
	 * ImageData constructor
	 * ImageData bitmap data object
	 * @class display/bitmap/ImageData
	 * @constructor
	 * @param {Object|null} props The properties for the bitmap (data/url, callback, width, height)
	 */
	function ImageData(props){

		props = props || {};

		this.url = "";
		this.data = new Image();
		this.size = 0;
		this.width = Arstider.checkIn(props.width, 0);
		this.height = Arstider.checkIn(props.height, 0);
		this.renderStyle = props.renderStyle || Arstider.defaultRenderStyle;
			
		this.load(props.url, props.callback);
	}

	ImageData.prototype.load = function(url, callback){
		
		var
			thisRef = this
		;

		if(url) this.url = url;
		if(this.url == "") return;

		if(this.url.indexOf("data:image") != -1){
			this.data.onload = function(){
				thisRef._handleLoadComplete.call(thisRef, callback);
			};
			this.data.src = this.url;
		}
		else{
			Net.get({
				url:this.url,
				dataType:"blob"
			}).then(
				function(data){
					console.log(data);
					thisRef.size = data.response.size;
					thisRef.data.onload = function() {
      					window.URL.revokeObjectURL(thisRef.data.src);
      					thisRef._handleLoadComplete.call(thisRef, callback);
    				};
    				thisRef.data.src = window.URL.createObjectURL(data.response);
				},
				function(error){
					if(thisRef.onerror){
						thisRef.onerror.dispatch(error);
					}
				}
			);
		}
	};
	
	/**
	 * Loads the processed url into Bitmap data for use
	 * @type {function(this:Bitmap)}
	 * @param {string} url URL to load
	 */
	ImageData.prototype._handleLoadComplete = function(callback){

		this.data.onload = null;

		if(this.renderStyle === Buffer.SHARP){
			this.data.style.imageRendering = "crisp-edges";
		}
		else if(this.renderStyle === Buffer.SMOOTH){
			this.data.style.imageRendering = 'auto';
		}
		else{
			Arstider.log("Arstider.ImageData.setRenderStyle: Cannot apply mode '"+Arstider.defaultRenderStyle+"'", 1);
		}

		this.width = this.data.width;
		this.height = this.data.height;

		if(this.size  <= 0) this.size = this.width * this.height * 4;

		if(callback) callback(this);
	};

	ImageData.prototype.kill = function(){

		this.data.src = Arstider.emptyImgSrc;
		this.data = null;
	};
	
	return ImageData;
});