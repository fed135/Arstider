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
					context.fillStyle = rule;
				}
			},
			"G":{
				param : true,
				render:function(context, font, rule){
					context.shadowBlur = parseInt(rule);
				}
			},
			"L":{
				param : true,
				render:function(context, font, rule){
					context.lineWidth = parseInt(rule);
				}
			},
			"S":{
				param : true,
				render:function(context, font, rule){
					font.size = rule+"px";
				}
			},
			"T":{
				param : true,
				render:function(context, font, rule, segment){
					segment.width = parseInt(rule);
					segment.isTab = true;
				}
			},
			"X":{
				param : true,
				render:function(context, font, rule, segment){
					segment.xOffset = parseInt(rule);
				}
			},
			"Y":{
				param : true,
				render:function(context, font, rule, segment){
					segment.yOffset = parseInt(rule);
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
		function BBParser(){
			this.openSegment = "[[";
			this.closeSegment = "]]";
			this.ruleEnd = "/";
			this.assignation = "=";
			this.breakLine = "<br>";
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
				currentStyle = null,
				segments = [],
				styleObject = null
			;

			carot = str.indexOf(this.openSegment);
			
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
				currentStyle = (str[carot+this.openSegment.length]).toUpperCase();
				
				//check if style in list
				if(currentStyle === this.ruleEnd) styles.pop();
				if(BBTagsList[currentStyle] == undefined) currentStyle = null;
				
				
				//cutStart
				cutStart = str.indexOf(this.closeSegment) + this.closeSegment.length;
				
				if(currentStyle === "T"){
					cut = new Segment("");
					cut.styles = [
						{
							style:"T",
							rule:str.substring(carot+this.openSegment.length+this.assignation.length+1, cutStart-this.closeSegment.length),
							render:BBTagsList["T"].render
						}
					];
					segments.push(cut);
					
					//reparse the rest
					segments = segments.concat(singleton.parse(str.substring(cutStart), styles));
				}
				else{
					if(currentStyle != null){

						styleObject = {
							style:currentStyle,
							render:BBTagsList[currentStyle].render
						};

						if(BBTagsList[currentStyle].param === true){
							styleObject.rule = str.substring(carot+this.openSegment.length+this.assignation.length+1, cutStart-this.closeSegment.length);
						}
					}
				}
				
				//check for closing tag
				
				cutEnd = str.substring(carot).indexOf(this.openSegment);
				if(str[cutEnd+this.openSegment.length] === this.ruleEnd){
					cut = new Segment("");
					cut.styles = styles.concat();
					if(currentStyle != null){
						cut.styles.push(styleObject);
					}
					segments.push(cut);
					
					//reparse the rest
					segments = segments.concat(singleton.parse(str.substring(cutStart), styles));
				}
				else{
					if(currentStyle != null){
						styles.push(styleObject);
					}
					segments = segments.concat(singleton.parse(str.substring(cutStart), styles));
				}
			}

			return segments;
		};

		BBParser.prototype.splitSymbol = function(segments, symbol, replace, insert){

			var 
				i = 0,
				u = 0,
				ret = [],
				seg
			;

			for(i = 0; i<segments.length; i++){
				seg = segments[i].text.split(symbol);
				for(u = 0; u<seg.length; u++){
					if(u > 0 && insert) ret.push(new Segment(symbol, segments[i].styles));
					ret.push(new Segment(seg[u] + ((replace)?symbol:""), segments[i].styles));
				}
			}
			
			return ret;
		};

		BBParser.prototype.trimSpaces = function(segments){

			var 
				i = 0,
				u = 0,
				ret = [],
				seg
			;

			for(i = 0; i<segments.length; i++){
				seg = segments[i].text.split(" ");
				for(u = 0; u<seg.length; u++){
					ret.push(new Segment(seg[u], segments[i].styles));
					if(u < seg.length-1) ret.push(new Segment(" ", segments[i].styles));
				}
			}
			
			return ret;
		};
			
		singleton = new BBParser();
		return singleton;
	});
})();