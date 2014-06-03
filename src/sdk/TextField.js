/**
 * Text Field.
 * @version 1.1.3
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
		breakLine = "<br>",

		/**
		 * Static entity reference
		 * @private
		 * @type {Object|null}
		 */
		entityRef = null
	;

	/**
	 * Utility method to calculate the size in pixel of some text rendered with a set font
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
	       	y = padding + context.lineSpacing*0.5,
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
		       			context.strokeText(line, ((lineNum === 0)?x:(otherLineX == undefined)?x:otherLineX), y + (inc*context.lineSpacing));
					}
					if(fillText){
						if(strokeText && context.shadowColor){
							oldShadow = context.shadowColor;
							context.shadowColor = "transparent";
						}

						context.fillText(line, ((lineNum === 0)?x:(otherLineX == undefined)?x:otherLineX), y + (inc*context.lineSpacing));

						if(oldShadow != null){
							context.shadowColor = oldShadow;
							oldShadow = null;
						}
					}
					line = words[n] + ' ';
					y += context.lineSpacing;
					lineNum++;
		       	}
		       	else line = testLine;
			}
		    if(strokeText){
		 		context.strokeText(line, ((lineNum === 0)?x:(otherLineX == undefined)?x:otherLineX), y + (inc*context.lineSpacing));
			}
			if(fillText){

				if(strokeText && context.shadowColor){
					oldShadow = context.shadowColor;
					context.shadowColor = "transparent";
				}

				context.fillText(line, ((lineNum === 0)?x:(otherLineX == undefined)?x:otherLineX), y + (inc*context.lineSpacing));

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
	define( "Arstider/TextField", ["Arstider/Buffer", "Arstider/Entity", "Arstider/core/BBParser", "Arstider/Fonts"], /** @lends TextField */ function (Buffer, Entity, Parser, Fonts) {

		/**
		 * Defines a reference entity, for property lookup
		 */
		if(entityRef == null) entityRef = new Entity();

		/**
		 * TextField constructor
		 * Stage element for text display
		 * @class TextField
		 * @constructor
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
			this.padding = Arstider.checkIn(props.padding, null);

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

			/**
			 * Custom unique mods
			 * @private
			 * @type {Object}
			 */
			this._custom = {};

			this.onchange = Arstider.emptyFunction;

			Arstider.Super(this, Entity, props);

            if(props.font != undefined) this.setFont(props.font);
            if(props.text != undefined) this.setText(props.text);
		};

		Arstider.Inherit(TextField, Entity);

		/**
		 * Kills the TextField's Buffer(s).
		 * @override
		 * @type {function(this:TextField)}
		 */
		TextField.prototype.killBuffer = function(){
			if(this.data && this.data.kill) this.data.kill();

			this.data = null;
		};

		/**
		 * Sets the text of the TextField and re-renders it's data.
		 * @type {function(this:TextField)}
		 * @param {string} name The desired text.
		 */
		TextField.prototype.setText = function(txt, parse){
			txt = txt + "";
			if(this._autogrow === true){
				this.height = 0;
				this.width = 0;
			}
			if(txt.indexOf(breakLine) != -1 && !this.textWrap) this.textWrap = true;

			this._BBparsed = parse || false;
			if(parse) this._textValue = new Parser(txt).segments;

			else this._textValue = txt;
			this.render();
		};

		/**
		 * Sets the font of the TextField and re-renders it's data.
		 * @type {function(this:TextField)}
		 * @param {Font|Object} name The desired text.
		 */
		TextField.prototype.setFont = function(font, specials){
			this._custom = specials || {};
			this._font = Fonts.get(font);

			if(this._autogrow === true){
				this.height = 0;
				this.width = 0;
			}


			if(this.padding == null) this.padding = Arstider.checkIn(this._custom.padding, Arstider.checkIn(font.padding, 0));

			var thisRef = this;
			this._font._onFontLoaded(function(){
				thisRef.render.apply(thisRef);
			});
		};

		/**
		 * Makes the buffer to draw the text in
		 * @private
		 * @type {function(this:TextField)}
		 */
		TextField.prototype._makeBuffer = function(){

			var
				fullStr = ""
			;

			if (this.data == null) this.data = new Buffer({name:"TextField_"+this.name});

			if(this.width === 0){
				if(this._font.textWrap){
					this._textWrappingError = true;
					if(Arstider.verbose > 1) console.warn("Arstider.TextField.makeBuffer: cannot wrapText for textfield with undefined width and height");
				}
				if(this._BBparsed){
					for(i = 0; i<this._textValue.length; i++){
						fullStr += this._textValue[i].text;
					}
				}
				else{
					fullStr += this._textValue;
				}

				this.width = calculateTextWidth(this.data.context, this._font, fullStr) + (this.padding*4);
			}

			if(this.height === 0) this.height = parseInt(this._font.size.split("px").join("")) + (this.padding*2);

			this.data.setSize(this.width, this.height);
		};

		/**
		 * Organizes the list of string segments so they are properly positioned
		 * @private
		 * @type {function(this:TextField)}
		 * @param {Object} fontRef Final transformation options
		 * @param {number} maxWidth The maximum width allowed
		 */
		TextField.prototype._renderSegmentList = function(fontRef, maxWidth){
			var startX = fontRef.fontOffsetX + this.padding;
			var startY = fontRef.fontOffsetY + this.padding + fontRef.lineSpacing * 0.5;
			var segRes = null;

			if(maxWidth == undefined){
				for(var i = 0; i<this._textValue.length; i++){
					segRes = this._renderSegment(this._textValue[i], fontRef, startX, startY);
					startX += segRes.width;
					//startY += segRes.height;//in the cas of wrapped text
				}
			}
			else{
				for(var i = 0; i<this._textValue.length; i++){
					segRes = this._renderSegment(this._textValue[i], fontRef, startX, startY, fontRef.fontOffsetX + this.padding, true);
					startX = segRes[0];
					startY = segRes[1];
				}
			}
		};

		/**
		 * Renders a single segment of text with over-ruling styles
		 * @private
		 * @type {function(this:TextField)}
		 * @param {Object} segment The segment object to render
		 * @param {Object} fontRef Final transformation options
		 * @param {number} startX The starting x offset for typing
		 * @param {number} startY The starting y offset for typing
		 * @param {number|null} iniX New line x position
		 * @param {boolean|null} wrapped Is text wrapped or not (multi-lined)
		 * @return {Object} The rendered segment with it's visible width and height, so to position the next segments
		 */
		TextField.prototype._renderSegment = function(segment, fontRef, startX, startY, iniX, wrapped){

			var
				i = 0,
				fontCopy = Arstider.clone(fontRef),	//For safe revert
				wasStroke = this.strokeText,
				wasFill = this.fillText,
				oldShadow = null,
				wrapPos = null
			;

			this.data.context.save();

			for(i; i<segment.styles.length; i++){
				switch(segment.styles[i][0].toUpperCase()){
					case "B":
						fontCopy.style = "bold";
						break;
					case "I":
						fontCopy.style = "italic";
						break;
					case "C":
						this.data.context.fillStyle = segment.styles[i].substring(2);
						break;
					case "S":
						fontCopy.size = segment.styles[i].substring(2);
						break;
					case "T":
						this.width = parseInt(segment.styles[i].substring(2));
						return;
				}
			}

			this.data.context.font  = ((fontCopy.style == "")?"":(fontCopy.style + " ")) + fontCopy.size + " " + fontCopy.family;

			if(wrapped){
				wrapPos = wrapText(this.data.context, segment.text, this.strokeText, this.fillText, startX, startY, this.width - (this.padding*2) - (this.width - (this.width - startX)), iniX, this.width - (this.padding*2));

				this.strokeText = wasStroke;
				this.fillText = wasFill;
				this.data.context.restore();

				return wrapPos;
			}
			else{
				if(this.strokeText) this.data.context.strokeText(segment.text, startX, startY);
				if(this.fillText){
					if(this.strokeText && fontCopy.shadowColor){
						oldShadow = this.data.context.shadowColor;
						this.data.context.shadowColor = "transparent";
					}

					this.data.context.fillText(segment.text, startX, startY);

					if(oldShadow != null){
						this.data.context.shadowColor = oldShadow;
						oldShadow = null;
					}
				}

				segment.width = this.data.context.measureText(segment.text).width;
				segment.height = this.data.context.lineHeight;

				this.strokeText = wasStroke;
				this.fillText = wasFill;
				this.data.context.restore();

				return segment;
			}
		};

		/**
		 * Renders the text and it's style into a buffer. Saves on context transformation.
		 * @private
		 * @type {function(this:TextField)}
		 */
		TextField.prototype.render = function(){

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
			if(this._font === null || this._textValue === null || this._textValue === "") return;
			if(this._font.loaded === false) return;
			if(this._font.temp && !Fonts.collection[this._font.name].temp) this.setFont(Fonts.get(this._font.name));
			if(this._font.lineSpacing === null) this._font.lineSpacing = parseInt(this._font.size.split("px").join(""));

			if(this.width === 0 && this.height === 0 && this._autogrow == null) this._autogrow = true;
			
			this._makeBuffer();

			var _final = Arstider.mixin(Arstider.clone(this._font), this._custom, true);

			for(i in _final){
				if(this[i] != undefined && !(i in entityRef)) this.data.context[i] = [i];
				else this.data.context[i] = _final[i];
			}
			this.data.context.font = ((_final.style == "")?"":(_final.style + " ")) + _final.size + " " + _final.family;

			if(_final.textAlign === "left") xShift = this.padding;
			else if(_final.textAlign === "center") xShift = this.width*0.5;
			else if(_final.textAlign === "right") xShift = this.width - this.padding;

			if(this.textWrap === true && !this._textWrappingError){
				if(this._BBparsed) this._renderSegmentList(_final, this.width);
				else wrapText(this.data.context, this._textValue, this.strokeText, this.fillText, xShift + _final.fontOffsetX, this.padding + _final.fontOffsetY, this.width - (this.padding*2));
			}
			else{
				if(this._BBparsed) this._renderSegmentList(_final);
				else{
					if(this.strokeText) this.data.context.strokeText(this._textValue, xShift  + _final.fontOffsetX, this.padding + _final.fontOffsetY + _final.lineSpacing * 0.5);
					if(this.fillText){
						//Prevent shadow from being applied twice- and over the already placed stroke
						if(this.strokeText && _final.shadowColor){
							oldShadow = this.data.context.shadowColor;
							this.data.context.shadowColor = "transparent";
						}

						this.data.context.fillText(this._textValue, xShift + _final.fontOffsetX, this.padding + _final.fontOffsetY + _final.lineSpacing * 0.5);

						if(oldShadow != null){
							this.data.context.shadowColor = oldShadow;
							oldShadow = null;
						}
					}
				}
			}

			this.onchange();
		};

		return TextField;
	});
})();