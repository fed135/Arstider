define("Arstider/texts/Segment", [], function(){
	/**
	 * Segment constructor
	 * @constructor
	 * @param {string} text The parsed text
	 */
	function Segment(text, styles){
		
		/**
		 * The segment of text
		 * @type {string}
		 */
		this.text = text;
		
		/**
		 * The list of styles for the segment of text
		 * @type {Array}
		 */
		this.styles = Arstider.checkIn(styles, []);

		this.width = 0;
		this.yOffset = 0;
		this.xOffset = 0;

		this.isTab = false;
	}

	Segment.prototype.calculateWidth = function(context, font){
		if(this.isTab) return;
		if(this.text.indexOf("<br>") != -1){
			this.width = 0;
			return;
		}

		context.save();
		this.applyStyles(context, Arstider.clone(font));
		this.width = Math.ceil(context.measureText(this.text).width + this.xOffset);
		context.restore();
	};

	Segment.prototype.applyStyles = function(context, font){

		//context.textAlign = "left";
		for(var i = 0; i<this.styles.length; i++){
			//console.warn("applying style : ", this.styles[i].rule);
			this.styles[i].render(context, font, this.styles[i].rule, this);
			//console.log("result :", font);
		}

		context.font = ((font.bold)?"bold ":"") + ((font.italic)?"italic ":"") + font.size + " " + font.family;
	};

	Segment.prototype.render = function(context, font, x, y, stroke, fill){

		if(this.text.indexOf("<br>") != -1 || this.text == "" || this.text == " ") return;

		//console.log("==RENDER==");

		context.save();

		this.applyStyles(context, Arstider.clone(font));

		if(stroke) context.strokeText(this.text, Math.round(x+this.xOffset), Math.round(y+this.yOffset), this.width);
		if(fill){
			if(stroke && font.shadowColor){
				context.shadowColor = Arstider.defaultColor;
			}
			//console.log("F:", context.font);
			context.fillText(this.text, Math.round(x+this.xOffset), Math.round(y+this.yOffset), this.width);
		}

		context.restore();

		//console.log("==========");
	};

	return Segment;
});