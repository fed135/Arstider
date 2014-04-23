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
		
		props = props || Arstider.emptyObject;
		
		if(props.url && !document.getElementById("Arstider_font_loader_"+props.url.split(".").join(""))){
			var xhr = new XMLHttpRequest();
			var thisRef = this;
			xhr.open('GET', props.url, true); 
			xhr.responseType = 'blob';
					
			xhr.onload = function (){
				if (this.status == 200){
					setTimeout(function(){
						thisRef.loaded = true;
						thisRef._runCallbacks();
						var div = document.getElementById("Arstider_font_loader_"+props.url.split(".").join(""));
						if(div) div.parentNode.removeChild(div);
					}, 100);
				}
			};
			xhr.send(null);
			
			var style = document.getElementById("Arstider_font_loader");
			var fontLoaderDiv = document.createElement("div");
			if(style == null){
				style = document.createElement('style');
				style.type = 'text/css';
				style.id = "Arstider_font_loader";
				document.getElementsByTagName('head')[0].appendChild(style);
			}

			fontLoaderDiv.id = "Arstider_font_loader_"+props.url.split(".").join("");
			fontLoaderDiv.style.position = "absolute";
			fontLoaderDiv.style.overflow = "hidden";
			fontLoaderDiv.style.marginLeft = "-9999px";
			fontLoaderDiv.innerHTML = "Loading font "+props.name;
			document.body.appendChild(fontLoaderDiv);
				
			style.innerHTML += '@font-face{font-family: '+props.name+'; src: url('+props.url+');} .'+props.name+'_fontLoader{font-family:'+props.name+', sans-serif;}';
			fontLoaderDiv.className = props.name+'_fontLoader';
			this.family = props.name;
			this.loaded = false;
		}
		else{
			this.family = Arstider.checkIn(props.family, "Arial");
			this.loaded = true;
		}
		
		this.name = props.name;
		
		//is temp fonts - async
		this.temp = Arstider.checkIn(props.temp, false);
		
		this.padding = Arstider.checkIn(props.padding, 0);
		this.lineSpacing = Arstider.checkIn(props.lineSpacing, null);
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
	Font.prototype._runCallbacks = function(){
		var i = this.loadCallbacks.length-1;
		
		for(i; i>=0;i--){
			this.loadCallbacks[i]();
		}
		
		this.loadCallbacks = [];
	};
	
	
	/**
	 * Defines the Fonts module
	 */	
	define( "Arstider/Fonts", ["Arstider/Request"], function (Request) {
		
		/**
		 * Returns singleton if it has been instantiated
		 */
		if(singleton != null) return singleton;
		
		/**
		 * Creates an instance of Fonts.
		 * @constructor
		 * @this {Font}
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