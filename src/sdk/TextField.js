/**
 * Text Field. 
 *
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */

;(function(){
	
	var
		/**
		 * Break-line character
		 * @const
		 * @private
		 * @type {string}
		 */
		breakLine = "@@"
	;
	
	/**
	 * Utility method to calculate the size in pixel of some text rendered with a set font
	 * 
	 * @private
	 * @param {CanvasRenderingContext2D} context The Context to use for testing
	 * @param {Obejct} font The font object
	 * @param {string} text The text to test
	 * @return {number} The size in pixels
	 */
	function calculateTextWidth(context, font, text){
		
		var ret;
		
		context.save();
		context.font  = ((font.style == "")?"":(font.style + " ")) + font.size + " " + font.family;
		ret = context.measureText(text);
		context.restore();
		
		return ret.width;
	}
	
	/**
	 * Method for text-wrap and multiline TEXT, not sequences
	 * 
	 * @private
	 * @param {CanvasRenderingContext2D} context The Textfield's context
	 * @param {string} myText The full string to wrap/multiline
	 * @param {boolean} strokeText Defines if text needs to be stroked
	 * @param {boolean} fillText Defines if text needs to be filled
	 * @param {number} x Initial horizontal position of the writing carot
	 * @param {number} maxWidth Maximum width of the paragraph, delimits wrapping edges
	 */
	function wrapText(context, myText, strokeText, fillText, x, padding, maxWidth) {
				
		var 
	       	words = [],
	       	paragraphs = [],
	       	line = '',
	       	n,
	       	y = padding,
	       	inc,
	       	testLine,
	       	metrics,
	       	testWidth,
	       	oldShadow = null
		;
		
		paragraphs = myText.split(breakLine);
		        
		for(inc = 0; inc < paragraphs.length; inc++){
		   	words = paragraphs[inc].split(" ");
		   	line = '';
		   	for(n = 0; n < words.length; n++) {
		      	testLine = line + words[n] + ' ';
		       	metrics = context.measureText(testLine);
		       	testWidth = metrics.width;
		       	if(testWidth > maxWidth) {
		       		if(strokeText){
		       			context.strokeText(line, x, y + (inc*context.lineHeight));
					}
					if(fillText){
						if(strokeText && context.shadowColor){
							oldShadow = context.shadowColor;
							context.shadowColor = "transparent";
						} 
						
						context.fillText(line, x, y + (inc*context.lineHeight));
						
						if(oldShadow != null){
							context.shadowColor = oldShadow;
							oldShadow = null;
						}
					}
					line = words[n] + ' ';
					y += context.lineHeight;
		       	}
		       	else {
		       		line = testLine;
		       	}
			}
		    if(strokeText){
		 		context.strokeText(line, x, y + (inc*context.lineHeight));
			}
			if(fillText){
				
				if(strokeText && context.shadowColor){
					oldShadow = context.shadowColor;
					context.shadowColor = "transparent";
				}
				
				context.fillText(line, x, y + (inc*context.lineHeight));
				
				if(oldShadow != null){
					context.shadowColor = oldShadow;
					oldShadow = null;
				}
			}
	    }
	}
	
	/**
	 * Defines the TextField module
	 */	
	define( "Arstider/TextField", ["Arstider/Buffer", "Arstider/Entity", "Arstider/core/BBParser"], function (Buffer, Entity, Parser) {
		
		/**
		 * Creates an instance of TextField.
		 *
		 * @constructor
		 * @this {TextField}
		 * @param {Object=} props Can optionally overwrite build properties of the entity    
		 */
		function TextField(props) {
			
			/**
			 * Defines if text should be filled
			 * @type {boolean}
			 */
			this.fillText = Arstider.checkIn(props.fillText, true);
			
			/**
			 * Defines if text should be stroked
			 * @type {boolean}
			 */
			this.strokeText = Arstider.checkIn(props.strokeText, false);
			
			/**
			 * The amount of pixels between the text and the edges of the buffer
			 */
			this.padding = Arstider.checkIn(props.padding, 0);
			
			/**
			 * Stores the context of the TextField's buffer
			 * @type {CanvasRenderingContext2D|null}
			 */
			this.dataCtx = null;
			
			/**
			 * Stores the text value of the TextField.
			 * Changed through the setText method.
			 * Can be a plain String, an Array of Segments or empty (null)
			 * 
			 * @private
			 * @type {string|Array|null}
			 */
			this._textValue = null;
			
			/**
			 * Indicates whether data is text or BB-parsed array
			 * @private
			 * @type {boolean} 
			 */
			this._BBparsed = false;
			
			/**
			 * Stores the font to use for this TextField.
			 * Changed through the setFont method
			 * 
			 * @private
			 * @type {Object|null}
			 */
			this._font = null;
			
			Arstider.Super(this, Entity, props);
		};
		
		/**
		 * Defines parent module
		 */
		Arstider.Inherit(TextField, Entity);
			
		/**
		 * Kills the TextField's Buffer(s).
		 *
		 * @override
		 * @this {TextField}
		 */
		TextField.prototype.killBuffer = function(){
			this.data = null;
			this.dataCtx = null;
			Buffer.kill("TextField_"+this.name);
		};
			
		/**
		 * Sets the text of the TextField and re-renders it's data.
		 * @this {TextField}
		 * @param {string} name The desired text.
		 */
		TextField.prototype.setText = function(txt, parse){
			
			this._BBparsed = parse || false;
			if(parse) this._textValue = new Parser(txt).segments;
			else this._textValue = txt;
			
			this.render();
		};
		
		/**
		 * Sets the font of the TextField and re-renders it's data.
		 * @this {TextField}
		 * @param {Font|Object} name The desired text.
		 */
		TextField.prototype.setFont = function(font){
			this._font = font;
			
			if(font.size == undefined) this._font.size = "12px";
			if(font.family == undefined) this._font.family = "arial";
			if(font.textBaseline == undefined) this._font.textBaseline = "top";
			if(font.lineHeight == undefined) this._font.lineHeight = 12;
			
			this.render();
		};
			
		/**
		 * Makes the buffer to draw the text in
		 * @this {TextField}
		 * @private
		 */
		TextField.prototype._makeBuffer = function(){
			
			if (this.data == null) this.data = Buffer.create("TextField_"+this.name);
			this.dataCtx = this.data.getContext('2d');
				
			if(this.width === 0) this.width = calculateTextWidth(this.dataCtx, this._font, this._textValue) + (this.padding*2);
			
			this.data.width = this.dataWidth = this.width;
			
			if(this.height === 0) this.height = parseInt(this._font.size.split("px").join("")) + (this.padding*2);
			
			this.data.height = this.dataHeight = this.height;
		};
		
		/**
		 * Renders a single segment of text with over-ruling styles
		 */
		Textfield.prototype._renderSegment = function(segment, startX, startY){
			
		};
		
		/**
		 * Renders the text and it's style into a buffer. Saves on context transformation. 
		 *
		 * @this {TextField}
		 * @private
		 * @param {CanvasContext} buff The context to use as buffer.
		 */
		TextField.prototype.render = function(buff){
			
			var 
				i,
				oldShadow,
				xShift = 0
			;
			
			/**
			 * Cancel operation if not all required fields are filled
			 */
			if(this._font === null || this._textValue === null) return;
			
			this._makeBuffer();
			
			for(i in this._font){
				this.dataCtx[i] = this._font[i];
			}
			this.dataCtx.font = ((this._font.style == "")?"":(this._font.style + " ")) + this._font.size + " " + this._font.family;
			
			if(this._font.textAlign === "left") xShift = this.padding;
			else if(this._font.textAlign === "center") xShift = this.width*0.5;
			else if(this._font.textAlign === "right") xShift = this.width - this.padding;
			
			if(this._font.textWrap === true){
				if(this._BBparsed){
					
				}
				else{
					wrapText(this.dataCtx, this._textValue, this.strokeText, this.fillText, xShift, this.padding, this.width - (this.padding*2));
				}
			}
			else{
				//TODO:Strings only, do check for BB Segments
				if(this.strokeText){
					this.dataCtx.strokeText(this._textValue, xShift, this.padding);
				}
				if(this.fillText){
					//Prevent shadow from being applied twice- and over the already placed stroke
					if(this.strokeText && this._font.shadowColor){
						oldShadow = this.dataCtx.shadowColor;
						this.dataCtx.shadowColor = "transparent";
					}
					
					this.dataCtx.fillText(this._textValue, xShift, this.padding);
					
					if(oldShadow != null){
						this.dataCtx.shadowColor = oldShadow;
						oldShadow = null;
					}
				}
			}
		};
		
		return TextField; 
	});
})();