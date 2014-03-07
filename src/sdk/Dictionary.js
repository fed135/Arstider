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
	define("Arstider/Dictionary", ["libs/text!..{game}/media/strings.json"], function(strs){
		
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
			
			/**
			 * JSON Parse of the strings.json file
			 */
			if(strs){
				this.strList = JSON.parse(strs);
			}
			else{
				console.warn("No string file");
			}
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
		 * 	Dictionary.translate("stringID_001", {"[X]":20}).value;
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
							
			if(dictionary[key] != undefined) {
				ret = singleton.strList[key].value;
				if(delimiters != undefined) {
					for(keyword in delimiters) {
						ret = ret.split(keyword).join(delimiters[keyword]);
					}
				}
			}
			return ret;
		};
		
		/**
		 * Instantiates the singleton
		 */
		singleton = new Dictionary();
		return singleton;
	});
})();