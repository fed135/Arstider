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
		}
		else{
			this.family = Arstider.checkIn(props.family, "Arial");
		}
		
		this.lineHeight = Arstider.checkIn(props.lineHeight, 12);
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
	}
	
	
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
				
			return null;
		};
			
		Fonts.prototype.create = function(props){
			
			if(props.name == undefined) return false;
			
			if(this.collection[props.name]) return this.collection[props.name];
				
			this.collection[props.name] = new Font(props);
			
			return this.collection[props.name];
		};
		
		Fonts.prototype.load = function(filename){
			var thisRef = this;
			
			require(["libs/text!./"+filename],function(file){
				thisRef.create.apply(thisRef, [JSON.parse(file)]);
			});
		}
			
		singleton = new Fonts();
		return singleton;
	});
})();