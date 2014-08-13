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
	}

	Segment.prototype.calculateWidth = function(context, font){
		context.save();
		this.applyStyles(context);
		this.width = context.measureText(this.text);
		context.restore();
	};

	Segment.prototype.applyStyles = function(context, font){
		for(var i = 0; i<this.styles.length){
			this.styles[i].
		}

		context.font = ((font.style == "")?"":(font.style + " ")) + font.size + " " + font.family;
	};

	Segment.prototype.render = function(context, font){
		context.save();

		this.applyStyles(context);

		context.restore();
	};

	return Segment;
});