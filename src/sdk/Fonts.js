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
	 * Defines the Fonts module
	 */	
	define( "Arstider/Fonts", ["Arstider/Request", "Arstider/core/Font"], /** @lends Fonts */ function (Request, Font) {
		
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