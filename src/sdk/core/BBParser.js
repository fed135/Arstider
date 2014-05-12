/**
 * BB Parser
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */

/*
 * Self-invoked singleton wrapper
 */
;(function(){
	
	var 
		/**
		 * The list of accepted BBTags
		 * @private
		 * @type {Object}
		 */
		BBTagsList = {
			"B":{},
			"I":{},
			"C":{param : true},
			"S":{param : true}, 
			"T":{param : true}
		}
	;
	
	/**
	 * Segment constructor
	 * @private
	 * @constructor
	 * @param {string} text The parsed text
	 */
	function Segment(text){
		
		/**
		 * The segment of text
		 * @type {string}
		 */
		this.text = text;
		
		/**
		 * The list of styles for the segment of text
		 * @type {Array}
		 */
		this.styles = [];
	}
	
	/**
	 * defines BBParser
	 */
	define("Arstider/core/BBParser", [], /** @lends core/BBParser */ function(){
		/** 
	     * BBParser class
	     * This module splits strings into Segment objects for enriched text drawing
	     * @class core/BBParser
	     */
		
		/**
		 * BB Syntax parser constructor
 		 * @param {string} text Translated or not piece of text to split into style-ruled segments
		 */
		function BBParser(text){
			
			/**
			 * The list of segments for the string
			 * @type {Array}
			 */
			this.segments = [];
			
			this.parse(text);
		}
		
		/**
		 * Recursive string parsing method
		 * @param {string} str The piece of string to parse
 		 * @param {Array} styles The current list of styles
 		 * @return {boolean} If parsing was successful or not
		 */
		BBParser.prototype.parse = function(str, styles){
			var 
				carot,
				cutStart,
				cutEnd = null,
				cut,
				styles = styles || [],
				currentStyle = null
			;
			
			carot = str.indexOf("[[");
			
			//If no tags or string all parsed
			if(carot === -1){
				if(str !== ""){
					this.segments.push(new Segment(str));
				}
				return true;
			}
			else{
				//segment before carot
				if(carot > 0){
					cut = new Segment(str.substring(0, carot));
					cut.styles = styles.concat();
					this.segments.push(cut);
				}
				
				//define currentStyle
				currentStyle = (str[carot+2]).toUpperCase();
				
				//check if style in list
				if(currentStyle === "/") styles.pop();
				if(BBTagsList[currentStyle] == undefined) currentStyle = null;
				
				
				//cutStart
				cutStart = str.indexOf("]]") + 2;
				
				if(currentStyle === "T"){
					cut = new Segment(" ");
					cut.styles = ["T="+str.substring(carot+4, cutStart-2)];
					this.segments.push(cut);
					
					//reparse the rest
					return this.parse(str.substring(cutStart), styles);
				}
				
				if(currentStyle != null && BBTagsList[currentStyle].param === true){
					currentStyle += ("=" + str.substring(carot+4, cutStart-2));
				}
				
				//check for closing tag
				
				cutEnd = str.substring(carot).indexOf("[[");
				if(str[cutEnd+2] === "/"){
					cut = new Segment(" ");
					cut.styles = styles.concat();
					if(currentStyle != null){
						cut.styles.push(currentStyle);
					}
					this.segments.push(cut);
					
					//reparse the rest
					return this.parse(str.substring(cutStart), styles);
				}
				else{
					if(currentStyle != null){
						styles.push(currentStyle);
					}
					return this.parse(str.substring(cutStart), styles);
				}
			}
		};
			
		return BBParser;
	});
})();