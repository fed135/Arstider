/**
 * Dictionary
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/Dictionary", ["Arstider/Request"], /** @lends Dictionary */ function(Request){	
	
	/**
	 * Dictionary constructor
	 * Utility class to translate pieces of string in a specific language
	 * @class Dictionary
	 * @constructor
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
		
		if(this.strList === null && !this._isLoading){
			if(Arstider.verbose > 2) console.warn("Arstider.Dictionary.translate: no string file");
			return key;
		} 
		
		if(this._isLoading){
			this._pendingStrings.push([key, delimiters, callback]);
			return key;
		}
		
		var 
			ret = key, 
			keyword
		;
						
		if(this.strList[key] != undefined) {
			ret = this.strList[key];
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
		
		this._isLoading = true;
		function parse(file){
			this.strList = file;
			this._isLoading = false;
			if(this._pendingStrings.length > 0){
				for(var i = 0; i < this._pendingStrings.length; i++){
					this.translate(this._pendingStrings[i][0], this._pendingStrings[i][1], this._pendingStrings[i][2]);
				}
				this._pendingStrings.length = 0;
			}
			if(callback) callback();
		}

		var thisRef = this;
		if(filename instanceof String || typeof filename == "string"){
			var req = new Request({
				url:filename,
				caller:this,
				cache:false,
				track:true,
				type:"json",
				callback:function(file){
					parse.call(thisRef, file);
				}
			}).send();
		}
		else{
			parse.call(thisRef, filename);
		}
	};
	
	return new Dictionary();
});