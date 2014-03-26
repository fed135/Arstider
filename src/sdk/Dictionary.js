/**
 * Dictionary
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */

/*
 * Self-invoked singleton wrapper
 */
;(function(){

	/*
	 * Singleton static
	 * @private
	 * @type {Dictionary|null}
	 */
	var singleton = null;
	
	/*
	 * Defines the Dictionary module
	 */
	define("Arstider/Dictionary", ["textLib!../media/strings.json"], function(strs){
		
		/**
		 * Returns singleton if it has been instantiated
		 */
		if(singleton != null) return singleton;
		
		/**
		 * Dictionary constructor
		 * 
		 * @constructor
		 * @this {Dictionary}
		 */
		function Dictionary(){
			
			/**
			 * List of strings
			 * @type {Object|null}
			 */
			this.strList = null;
		}
		
		/**
		 * Translates a string ID
		 * 
		 * Note on delimiters: 
		 * Delimiters indicate dynamic values to be inserted in specific spots once the string has been translated
		 * Example: 
		 * 
		 * 	//String file
		 * 	stringID_001:"You have [X] points!"
		 * 
		 * 	//Game code
		 * 	Dictionary.translate("stringID_001", {"[X]":20});
		 * 	//Result: "You have 20 points!"
		 * 
		 * @param {string} key The string ID to translate
		 * @param {Object} delimiters The dynamic data delimiters
		 * @return {string} The translated string
		 */
		Dictionary.prototype.translate = function(key, delimiters){
			
			if(singleton.strList === null) return key;
			
			var 
				ret = key, 
				keyword
			;
							
			if(singleton.strList[key] != undefined) {
				ret = singleton.strList[key];
				if(delimiters != undefined) {
					for(keyword in delimiters) {
						ret = ret.split(keyword).join(delimiters[keyword]);
					}
				}
			}
			return ret;
		};
		
		Dictionary.prototype.load = function(filename){
			var thisRef = this;
			
			require(["textLib!./"+filename],function(file){
				thisRef.strList = JSON.parse(file);
			});
		};
		
		/**
		 * Instantiates the singleton
		 */
		singleton = new Dictionary();
		return singleton;
	});
})();