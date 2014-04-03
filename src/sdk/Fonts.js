/**
 * Fonts. 
 *
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */
;(function(){
	
	/*
	 * Singleton static
	 * @private
	 * @type {Fonts|null}
	 */
	var singleton = null;
	
	/**
	 * Font object constructor
	 * @private
	 * @constructor
	 * @param {Object} props The optional build params
	 */
	function Font(props){
		
		props = props || Arstider.emptyObject;
		
		if(props.url){
			var xhr = new XMLHttpRequest();
			var thisRef = this;
			xhr.open('GET', props.url, true); 
			xhr.responseType = 'blob';
					
			xhr.onload = function (){
				if (this.status == 200){
					setTimeout(function(){
						thisRef.loaded = true;
						thisRef._runCallbacks();
					}, Arstider._fullFPS);
				}
			};
			xhr.send(null);
			
			var style = document.getElementById("Arstider_css_font_loader");
			var fontLoaderDiv;
			if(style == null){
				style = document.createElement('style');
				style.type = 'text/css';
				style.id = "Arstider_font_loader";
				document.getElementsByTagName('head')[0].appendChild(style);
				
				fontLoaderDiv = document.createElement("div");
				fontLoaderDiv.id = "Arstider_font_loader_div";
				fontLoaderDiv.style.position = "absolute";
				fontLoaderDiv.style.overflow = "hidden";
				fontLoaderDiv.style.marginLeft = "-9999px";
				fontLoaderDiv.innerHTML = "Loading font... ";
				document.body.appendChild(fontLoaderDiv);
			}
			else{
				fontLoaderDiv = document.getElementById("Arstider_font_loader_div");
			}
				
			style.innerHTML = '@font-face{font-family: '+props.name+'; src: url('+props.url+');} .'+props.name+'_fontLoader{font-family:'+props.name+', sans-serif;}';
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
	
	Font.prototype._onFontLoaded = function(callback){
		if(this.loaded && !this.temp){
			callback();
			return;
		}
		
		this.loadCallbacks.push(callback);
	};
	
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
	define( "Arstider/Fonts", [], function () {
		
		/**
		 * Returns singleton if it has been instantiated
		 */
		if(singleton != null) return singleton;
		
		/**
		 * Creates an instance of Fonts.
		 *
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
			
		Fonts.prototype.get = function(name){
			if(this.collection[name]) return this.collection[name];
			
			this.collection[name] = new Font({temp:true, name:name});
			return this.collection[name];
		};
			
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
		
		Fonts.prototype.load = function(filename, callback){
			var thisRef = this;
			
			require(["textLib!./"+filename],function(file){
				var fontList = JSON.parse(file);
				for(var i in fontList){
					fontList[i].name = i;
					thisRef.create.apply(thisRef, [fontList[i]]);
				}
				
				if(callback) callback();
			});
		};
			
		singleton = new Fonts();
		return singleton;
	});
})();