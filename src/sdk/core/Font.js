/**
 * Font
 *
 * @version 1.1.5
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the Fonts module
 */
define("Arstider/core/Font", ["Arstider/Request"], /** @lends core/Font */ function(Request){
	/**
	 * Font object constructor
	 * @constructor
	 * @class core/Font
	 * @param {Object} props The optional build params
	 */
	function Font(props){
		
		var thisRef = this;
		
		props = props || Arstider.emptyObject;
		
		if(props.url){
			this.url = props.url.split(".").join("");
			this.family = props.name;
			this.loaded = false;
			
			var style = window.document.getElementById("Arstider_font_loader");
			if(style == null){
				style = window.document.createElement('style');
				style.type = 'text/css';
				style.id = "Arstider_font_loader";
				window.document.getElementsByTagName('head')[0].appendChild(style);
			}
			style.innerHTML += '@font-face{font-family: '+props.name+'; src: url('+props.url+');} .'+props.name+'_fontLoader{font-family:'+props.name+', sans-serif;} \n';
			
			var fontLoaderDiv = window.document.createElement("input");
			fontLoaderDiv.id = "Arstider_font_loader_"+props.name;
			fontLoaderDiv.style.position = "fixed";
			fontLoaderDiv.style.border = "0px";
			fontLoaderDiv.style.backgroundColor = "transparent";
			fontLoaderDiv.style.zIndex = -1;
			fontLoaderDiv.value = ".";
			window.document.body.appendChild(fontLoaderDiv);
				
			fontLoaderDiv.className = props.name+'_fontLoader';
			
			var req = new Request({
				url:props.url,
				type:"blob",
				caller:thisRef,
				callback:function(){
					var div = window.document.getElementById("Arstider_font_loader_"+this.name);
					div.value += ".";
					setTimeout(function(){
						thisRef.loaded = true;
						thisRef._runCallbacks.apply(thisRef);
						setTimeout(function(){
							thisRef._runCallbacks.apply(thisRef, [true]);
							if(div) div.parentNode.removeChild(div);
						}, 150);
					}, 150);
				}
			}).send();
		}
		else{
			this.family = Arstider.checkIn(props.family, "Arial");
			this.loaded = true;
			this.url = "null";
		}
		
		this.name = props.name;
		
		//is temp fonts - async
		this.temp = Arstider.checkIn(props.temp, false);
		
		this.padding = Arstider.checkIn(props.padding, 0);
		this.lineSpacing = Arstider.checkIn(props.lineSpacing, null);
		this.lineHeight = Arstider.checkIn(props.lineHeight, "1em");
		this.textWrap = Arstider.checkIn(props.textWrap, false);
		this.size = Arstider.checkIn(props.size, "12px");
		this.style = Arstider.checkIn(props.style, "");
		this.strokeStyle = Arstider.checkIn(props.strokeStyle, "transparent");
		this.fillStyle = Arstider.checkIn(props.fillStyle, "black");
		this.lineWidth = Arstider.checkIn(props.lineWidth, 0);
		this.shadowColor = Arstider.checkIn(props.shadowColor, "transparent");
		this.shadowBlur = Arstider.checkIn(props.shadowBlur, 0);
		this.shadowOffsetX = Arstider.checkIn(props.shadowOffsetX, 0);
		this.shadowOffsetY = Arstider.checkIn(props.shadowOffsetY, 0);
		this.fontOffsetX = Arstider.checkIn(props.fontOffsetX, 0);
		this.fontOffsetY = Arstider.checkIn(props.fontOffsetY, 0);
		this.textAlign = Arstider.checkIn(props.textAlign, "left");
		this.textBaseline = Arstider.checkIn(props.textBaseline, "middle");
		
		this.loadCallbacks = Arstider.checkIn(props.loadCallbacks, []);
	}
	
	/**
	 * Internal callback stack when font file has finished loading
	 * @type {function(this:Font)}
	 * @param {function} callback A callback function to trigger when font has finished loading
	 */
	Font.prototype._onFontLoaded = function(callback){
		if(this.loaded && !this.temp){
			callback();
			return;
		}
		
		this.loadCallbacks.push(callback);
	};
	
	/**
	 * Runs the list of callbacks when font has finished loading
	 * @private
	 * @type {function(this:Font)}
	 */
	Font.prototype._runCallbacks = function(remove){
		var i = this.loadCallbacks.length-1;
		
		for(i; i>=0;i--){
			this.loadCallbacks[i]();
		}
		if(remove) this.loadCallbacks = [];
	};

	return Font;
});