;(function(){
	var BBTagsList = {
	
		//BOLDNESS
		"B":{
			effect : function(segment){
				segment.addStyle("bold");
			}
		},
		
		//ITALIC
		"I":{
			effect : function(segment){
				segment.addStyle("italic");
			}
		},
		
		//COLOR
		"C":{
			effect : function(segment, param){
				segment.fillStyle = param;
			},
			param : true
		},
		
		//ENABLE STROKE
		"S":{
			effect : function(segment, param){
				if(param == "true") segment.stroke = true;
				else segment.stroke = false;
			},
			param : true
		},
		
		//ENABLE FILL
		"F":{
			effect : function(segment, param){
				if(param == "true") segment.fill = true;
				else segment.fill = false;
			},
			param : true
		},
		
		//TABS 
		"T":{
			effect : function(segment, param){
				segment.paddingRight = parseInt(param);
			},
			param : true
		}
	};
	
	define("BBParser", [], function(){
	
		function Segment(text){
			this.text = text;
			this.styles = [];
		}
		
		BBParser.prototype.parse = function(str, styles){
			var 
				carot,
				cutStart,
				cutEnd = null,
				cut,
				
				styles = styles || []
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
		}
	
		function BBParser(text){
			this.segments = [];
			
			this.parse(text);
		}
			
			
		return BBParser;
	});
})();