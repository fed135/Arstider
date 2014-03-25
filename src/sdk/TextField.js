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
	function wrapText(context, myText, strokeText, fillText, x, padding, maxWidth, otherLineX, otherLineWrap) {
		
		var 
	       	words = [],
	       	paragraphs = [],
	       	line = '',
	       	n,
	       	y = padding,
	       	lineNum = 0,
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
		       	if(testWidth > ((lineNum === 0)?maxWidth:(otherLineWrap == undefined)?maxWidth:otherLineWrap)) {
		       		if(strokeText){
		       			context.strokeText(line, ((lineNum === 0)?x:(otherLineX == undefined)?x:otherLineX), y + (inc*context.lineHeight));
					}
					if(fillText){
						if(strokeText && context.shadowColor){
							oldShadow = context.shadowColor;
							context.shadowColor = "transparent";
						} 
						
						context.fillText(line, ((lineNum === 0)?x:(otherLineX == undefined)?x:otherLineX), y + (inc*context.lineHeight));
						
						if(oldShadow != null){
							context.shadowColor = oldShadow;
							oldShadow = null;
						}
					}
					line = words[n] + ' ';
					y += context.lineHeight;
					lineNum++;
		       	}
		       	else {
		       		line = testLine;
		       	}
			}
		    if(strokeText){
		 		context.strokeText(line, ((lineNum === 0)?x:(otherLineX == undefined)?x:otherLineX), y + (inc*context.lineHeight));
			}
			if(fillText){
				
				if(strokeText && context.shadowColor){
					oldShadow = context.shadowColor;
					context.shadowColor = "transparent";
				}
				
				context.fillText(line, ((lineNum === 0)?x:(otherLineX == undefined)?x:otherLineX), y + (inc*context.lineHeight));
				
				if(oldShadow != null){
					context.shadowColor = oldShadow;
					oldShadow = null;
				}
			}
	    }
	    
	    return [((lineNum === 0)?x:(otherLineX == undefined)?x:otherLineX) + context.measureText(line).width,y];
	}
	
	/**
	 * Defines the TextField module
	 */	
	define( "Arstider/TextField", ["Arstider/Buffer", "Arstider/Entity", "Arstider/core/BBParser", "Arstider/Fonts"], function (Buffer, Entity, Parser, Fonts) {
		
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
			 * Whether to wrap text in a predefined space
			 * @type {boolean}
			 */
			this.textWrap = Arstider.checkIn(props.textWrap, false);
			
			/**
			 * Detects errors in textWrapping configs (width undefined)
			 * @private
			 * @type {boolean}
			 */
			this._textWrappingError = false;
			
			/**
			 * Autogrow enabled. set as true if no width or height properties are defined at spawn
			 * @private
			 * @type {boolean | null}
			 */
			this._autogrow = null;
			
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
			if(this._autogrow === true){
				this.height = 0;
				this.width = 0;
			}
			
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
			
			if(this._autogrow === true){
				this.height = 0;
				this.width = 0;
			}
			
			if(font.size == undefined) this._font.size = "12px";
			if(font.family == undefined) this._font.family = "arial";
			if(font.textBaseline == undefined) this._font.textBaseline = "top";
			if(font.lineHeight == undefined) this._font.lineHeight = 12;
			if(font.textAlign == undefined) this._font.textAlign = "left";
			
			var thisRef = this;
			this._font._onFontLoaded(function(){
				thisRef.render.apply(thisRef);
			});
		};
			
		/**
		 * Makes the buffer to draw the text in
		 * @this {TextField}
		 * @private
		 */
		TextField.prototype._makeBuffer = function(){
			
			var 
				fullStr = ""
			;
			
			if (this.data == null) this.data = Buffer.create("TextField_"+this.name);
			this.dataCtx = this.data.context2D();
				
			if(this.width === 0){
				if(this._font.textWrap) this._textWrappingError = true;
				if(this._BBparsed){
					for(i = 0; i<this._textValue.length; i++){
						fullStr += this._textValue[i].text;
					}
				}
				else{
					fullStr += this._textValue;
				}
				
				this.width = calculateTextWidth(this.dataCtx, this._font, fullStr) + (this.padding*2);
			} 
			
			this.data.width = this.dataWidth = this.width;
			
			if(this.height === 0) this.height = parseInt(this._font.size.split("px").join("")) + (this.padding*2);
			
			this.data.height = this.dataHeight = this.height;
		};
		
		TextField.prototype._renderSegmentList = function(maxWidth){
			var startX = this._font.fontOffsetX + this.padding;
			var startY = this._font.fontOffsetY + this.padding;
			var segRes = null;
			
			if(maxWidth == undefined){
				for(var i = 0; i<this._textValue.length; i++){
					segRes = this._renderSegment(this._textValue[i], startX, startY);
					startX += segRes.width;
					//startY += segRes.height;//in the cas of wrapped text
				}
			}
			else{
				for(var i = 0; i<this._textValue.length; i++){
					segRes = this._renderSegment(this._textValue[i], startX, startY, this._font.fontOffsetX + this.padding, true);
					startX = segRes[0];
					startY = segRes[1];
				}
			}
		};
		
		/**
		 * Renders a single segment of text with over-ruling styles
		 */
		TextField.prototype._renderSegment = function(segment, startX, startY, iniX, wrapped){
			
			var 
				i = 0,
				fontCopy = Arstider.clone(this._font),	//For safe revert
				wasStroke = this.strokeText,
				wasFill = this.fillText,
				oldShadow = null,
				wrapPos = null
			;
			
			this.dataCtx.save();
			
			for(i; i<segment.styles.length; i++){
				switch(segment.styles[i][0]){
					case "B": 
						fontCopy.style = "bold";
						break;
					case "I":
						fontCopy.style = "italic";
						break;
					case "C":
						this.dataCtx.fillStyle = segment.styles[i].substring(2);
						break;
					case "S":
						this.strokeText = true;
						break;
					case "F":
						this.fillText = true;
						break;
					case "T":
						this.width = parseInt(segment.styles[i].substring(2));
						return;
				}
			}
			
			this.dataCtx.font  = ((fontCopy.style == "")?"":(fontCopy.style + " ")) + fontCopy.size + " " + fontCopy.family;
			
			if(wrapped){
				wrapPos = wrapText(this.dataCtx, segment.text, this.strokeText, this.fillText, startX, startY, this.width - (this.padding*2) - (this.width - (this.width - startX)), iniX, this.width - (this.padding*2));
				
				this.strokeText = wasStroke;
				this.fillText = wasFill;
				this.dataCtx.restore();
				
				return wrapPos;
			}
			else{
				//render segment
				if(this.strokeText){
					this.dataCtx.strokeText(segment.text, startX, startY);
				}
				if(this.fillText){
					//Prevent shadow from being applied twice- and over the already placed stroke
					if(this.strokeText && fontCopy.shadowColor){
						oldShadow = this.dataCtx.shadowColor;
						this.dataCtx.shadowColor = "transparent";
					}
					
					this.dataCtx.fillText(segment.text, startX, startY);
					
					if(oldShadow != null){
						this.dataCtx.shadowColor = oldShadow;
						oldShadow = null;
					}
				}
				
				segment.width = this.dataCtx.measureText(segment.text).width;
				segment.height = this.dataCtx.lineHeight;
				
				this.strokeText = wasStroke;
				this.fillText = wasFill;
				this.dataCtx.restore();
				
				return segment;
			}
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
			
			//Reset
			this._textWrappingError = false;
			
			/**
			 * Cancel operation if not all required fields are filled
			 */
			if(this._font === null || this._textValue === null) return;
			if(this._font.loaded === false) return;
			if(this._font.temp && !Fonts.collection[this._font.name].temp) this.setFont(Fonts.get(this._font.name));
			
			if(this.width === 0 && this.height === 0 && this._autogrow == null) this._autogrow = true;
			
			this._makeBuffer();
			
			for(i in this._font){
				this.dataCtx[i] = this._font[i];
			}
			this.dataCtx.font = ((this._font.style == "")?"":(this._font.style + " ")) + this._font.size + " " + this._font.family;
			
			if(this._font.textAlign === "left") xShift = this.padding;
			else if(this._font.textAlign === "center") xShift = this.width*0.5;
			else if(this._font.textAlign === "right") xShift = this.width - this.padding;
			
			if(this.textWrap === true && !this._textWrappingError){
				if(this._BBparsed){
					this._renderSegmentList(this.width);
				}
				else{
					wrapText(this.dataCtx, this._textValue, this.strokeText, this.fillText, xShift + this._font.fontOffsetX, this.padding + this._font.fontOffsetY, this.width - (this.padding*2));
				}
			}
			else{
				if(this._BBparsed){
					this._renderSegmentList();
				}
				else{
					if(this.strokeText){
						this.dataCtx.strokeText(this._textValue, xShift  + this._font.fontOffsetX, this.padding + this._font.fontOffsetY);
					}
					if(this.fillText){
						//Prevent shadow from being applied twice- and over the already placed stroke
						if(this.strokeText && this._font.shadowColor){
							oldShadow = this.dataCtx.shadowColor;
							this.dataCtx.shadowColor = "transparent";
						}
						
						this.dataCtx.fillText(this._textValue, xShift + this._font.fontOffsetX, this.padding + this._font.fontOffsetY);
						
						if(oldShadow != null){
							this.dataCtx.shadowColor = oldShadow;
							oldShadow = null;
						}
					}
				}
			}
		};
		
		return TextField; 
	});
})();