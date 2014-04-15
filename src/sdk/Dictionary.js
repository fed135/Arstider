/**
 * Dictionary
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */

;(function(){

	var 
		/*
		 * Singleton static
		 * @private
		 * @type {Dictionary|null}
		 */
		singleton = null
	;
	
	/*
	 * Defines the Dictionary module
	 */
	define("Arstider/Dictionary", [], function(){
		
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
			 * Is string file being loaded
			 * @private
			 * @type {boolean}
			 */
			this._isLoading = false;
			
			/**
			 * Pending loaded strings file callbacks
			 * @private
			 * @type {Array}
			 */
			this._pendingStrings = [];
			
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
		Dictionary.prototype.translate = function(key, delimiters, callback){
			
			if(singleton.strList === null && !singleton._isLoading){
				if(Arstider.verbose > 2) console.warn("Arstider.Dictionary.translate: no string file");
				return key;
			} 
			
			if(singleton._isLoading){
				singleton._pendingStrings.push([key, delimiters, callback]);
				return key;
			}
			
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
			else{
				if(Arstider.verbose > 2) console.warn("Arstider.Dictionary.translate: string not found");
			}
			if(callback) callback(ret);
			return ret;
		};
		
		/**
		 * Set the string file to download
		 * @type {function(this:Dictionary)}
		 * @param {string} filename The url of the string file
		 * @param {function} callback The function to trigger once the download is completed
		 */
		Dictionary.prototype.load = function(filename, callback){
			var thisRef = this;
			
			this._isLoading = true;
			
			require(["textLib!./"+filename],function(file){
				thisRef.strList = JSON.parse(file);
				thisRef._isLoading = false;
				if(thisRef._pendingStrings.length > 0){
					for(var i = 0; i < thisRef._pendingStrings.length; i++){
						thisRef.translate(thisRef._pendingStrings[i][0], thisRef._pendingStrings[i][1], thisRef._pendingStrings[i][2]);
					}
					thisRef._pendingStrings = [];
				}
				if(callback) callback();
			});
		};
		
		singleton = new Dictionary();
		return singleton;
	});
})();