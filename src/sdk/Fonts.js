/**
 * Fonts. 
 *
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */
;(function(){
	
	var 
		/**
		 * Singleton static
		 * @private
		 * @type {Fonts|null}
		 */
		singleton = null
	;
	
	/**
	 * Font object constructor
	 * @constructor
	 * @param {Object} props The optional build params
	 */
	function Font(props){
		
		var thisRef = this;
		
		props = props || Arstider.emptyObject;
		
		if(props.url){
			this.url = props.url.split(".").join("");
			this.family = props.name;
			this.loaded = false;
			
			var style = document.getElementById("Arstider_font_loader");
			if(style == null){
				style = document.createElement('style');
				style.type = 'text/css';
				style.id = "Arstider_font_loader";
				document.getElementsByTagName('head')[0].appendChild(style);
			}
			style.innerHTML += '@font-face{font-family: '+props.name+'; src: url('+props.url+');} .'+props.name+'_fontLoader{font-family:'+props.name+', sans-serif;} \n';
			
			var fontLoaderDiv = document.createElement("input");
			fontLoaderDiv.id = "Arstider_font_loader_"+props.name;
			fontLoaderDiv.style.position = "fixed";
			fontLoaderDiv.style.border = "0px";
			fontLoaderDiv.style.backgroundColor = "transparent";
			fontLoaderDiv.style.zIndex = -1;
			fontLoaderDiv.value = ".";
			document.body.appendChild(fontLoaderDiv);
				
			fontLoaderDiv.className = props.name+'_fontLoader';
			
			require(["Arstider/Request"], function(Request){
				var req = new Request({
					url:props.url,
					type:"blob",
					caller:thisRef,
					callback:function(){
						var div = document.getElementById("Arstider_font_loader_"+this.name);
						div.value += ".";
						setTimeout(function(){
							console.log("div onload son!");
							thisRef.loaded = true;
							thisRef._runCallbacks.apply(thisRef);
							setTimeout(function(){
								thisRef._runCallbacks.apply(thisRef, [true]);
								if(div) div.parentNode.removeChild(div);
							}, 150);
						}, 150);
					}
				}).send();
			});
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
	
	
	/**
	 * Defines the Fonts module
	 */	
	define( "Arstider/Fonts", ["Arstider/Request"], /** @lends Fonts */ function (Request) {
		
		/**
		 * Returns singleton if it has been instantiated
		 */
		if(singleton != null) return singleton;
		
		/**
		 * Fonts constructor
		 * A font loading and defining module
		 * @class Fonts
		 * @constructor
		 */
		function Fonts(){
		 
			/**
			 * Collection of created font objects
			 * @type {Object}
			 */
			this.collection = {};
		};
		
		/**
		 * Gets a font object by name
		 * @type {function(this:Fonts)}
		 * @param {string} name The name of the font to find
		 * @return {Object} The font object, or a new temporary font if the requested one doesn't exist
		 */
		Fonts.prototype.get = function(name){
			if(this.collection[name]) return this.collection[name];
			
			this.collection[name] = new Font({temp:true, name:name});
			return this.collection[name];
		};
		
		/**
		 * Creates a font
		 * @type {function(this:Fonts)}
		 * @param {Object} props The font properties
		 * @return {Object} The newly created font object
		 */
		Fonts.prototype.create = function(props){
			
			if(props.name == undefined){
				if(Arstider.verbose > 0) console.warn("Arstider.Fonts.create: name not specified, font not created");
				return false;	
			}
			
			if(this.collection[props.name] && this.collection[props.name].temp == false) return this.collection[props.name];
			
			if(this.collection[props.name] && this.collection[props.name].loadCallbacks.length > 0) props.loadCallbacks = this.collection[props.name].loadCallbacks;
			this.collection[props.name] = new Font(props);
			
			return this.collection[props.name];
		};
		
		/**
		 * Loads a list of font objects from a JSON file
		 * @type {function(this:Fonts)}
		 * @param {string} filename The JSON file to load
		 * @param {function} callback The callback function, once all fonts have been initialized
		 */
		Fonts.prototype.load = function(filename, callback){
			var req = new Request({
				url:filename,
				caller:this,
				track:true,
				type:"json",
				cache:false,
				callback:function(file){
					var fontList = file;
					for(var i in fontList){
						fontList[i].name = i;
						this.create(fontList[i]);
					}
					
					if(callback) callback();
				}
			}).send();
		};
			
		singleton = new Fonts();
		return singleton;
	});
})();