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
			"B":{
				render:function(context, font){
					font.bold = true;
				}
			},
			"I":{
				render:function(context, font){
					font.italic = true;
				}
			},
			"C":{
				param : true,
				render:function(context, font, rule){
					context.fillStyle = rule.substring(2);
				}
			},
			"S":{
				param : true,
				render:function(context, font, rule){
					font.size = rule.substring(2);
				}
			}, 
			"T":{
				param : true,
				render:function(context, font, rule, segment){
					segment.width = rule.substring(2);
					segment.isTab = true;
				}
			}
		},

		singleton = null
	;
	
	/**
	 * defines BBParser
	 */
	define("Arstider/texts/BBParser", ["Arstider/texts/Segment"], /** @lends texts/BBParser */ function(Segment){

		if(singleton != null) return singleton;

		/** 
	     * BBParser class
	     * This module splits strings into Segment objects for enriched text drawing
	     * @class texts/BBParser
	     * @constructor
	     */
		function BBParser(){}
		
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
				currentStyle = null,
				segments = []
			;

			carot = str.indexOf("[[");
			
			//If no tags or string all parsed
			if(carot === -1){
				if(str !== ""){
					segments.push(new Segment(str));
				}
				return segments;
			}
			else{
				//segment before carot
				if(carot > 0){
					cut = new Segment(str.substring(0, carot));
					cut.styles = styles.concat();
					segments.push(cut);
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
					cut.styles = [
						{
							style:"T",
							rule:str.substring(carot+4, cutStart-2),
							render:BBTagsList["T"].render
						}
					];
					segments.push(cut);
					
					//reparse the rest
					segments = segments.concat(singleton.parse(str.substring(cutStart), styles));
				}
				else{
					if(currentStyle != null){

						var stl = {
							style:currentStyle,
							render:BBTagsList[currentStyle].render
						};

						if(BBTagsList[currentStyle].param === true){
							stl.rule = str.substring(carot+4, cutStart-2);
						}
					}
				}
				
				//check for closing tag
				
				cutEnd = str.substring(carot).indexOf("[[");
				if(str[cutEnd+2] === "/"){
					cut = new Segment(" ");
					cut.styles = styles.concat();
					if(currentStyle != null){
						cut.styles.push(currentStyle);
					}
					segments.push(cut);
					
					//reparse the rest
					segments = segments.concat(singleton.parse(str.substring(cutStart), styles));
				}
				else{
					if(currentStyle != null){
						styles.push(currentStyle);
					}
					segments = segments.concat(singleton.parse(str.substring(cutStart), styles));
				}
			}

			return segments;
		};

		BBParser.prototype.splitInWords = function(segments){

			var 
				i = 0,
				u = 0,
				ret = [],
				seg
			;

			for (i = 0; i<segments.length; i++) {
				seg = segments[i].text.split(" ");
				for(u = 0; u<seg.length; u++){
					ret.push(new Segment(seg[u] + " ", segments[i].styles));
				}
			}
			
			return ret;
		};
			
		singleton = new BBParser();
		return singleton;
	});
})();