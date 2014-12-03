/**
 * Text Field.
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */
define( "Arstider/TextField", [
		"Arstider/Buffer", 
		"Arstider/Entity", 
		"Arstider/Fonts",
		"Arstider/Signal",
		"Arstider/texts/Segment",
		"Arstider/texts/BBParser"  
	], /** @lends TextField */ function (Buffer, Entity, Fonts, Signal, Segment, Parser) {

	/**
	 * Static entity reference
	 * @private
	 * @type {Object|null}
	 */
	TextField._entityRef = new Entity();

	TextField.CROP_PADDING = 1;

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
		 * Stores the text value of the TextField.
		 * Changed through the setText method.
		 *
		 * @private
		 * @type {string|null}
		 */
		this._textValue = null;

		/**
		 * An Array of parsed Words
		 *
		 * @private
		 * @type {Array}
		 */
		this._words = [];

		/**
		 * Whether to wrap text in a predefined space
		 * @type {boolean}
		 */
		this.textWrap = Arstider.checkIn(props.textWrap, false);

		/**
		 * Stores the font to use for this TextField.
		 * Changed through the setFont method
		 *
		 * @private
		 * @type {Object|null}
		 */
		this._font = null;

		this._finalFont = null;

		/**
		 * Custom unique mods
		 * @private
		 * @type {Object}
		 */
		this._custom = {};

		//Fast render
		this.dynamic = null;

		this.onchange = new Signal();

		Arstider.Super(this, Entity, props);

        if(props.font != undefined) this.setFont(props.font);
        if(props.text != undefined) this.setText(props.text);
	};

	Arstider.Inherit(TextField, Entity);

	/**
	 * Sets the text of the TextField and re-renders it's data.
	 * @type {function(this:TextField)}
	 * @param {string} name The desired text.
	 */
	TextField.prototype.setText = function(txt){
		txt = txt + "";

		if(txt != this._textValue){
			if(txt.indexOf(Parser.breakLine) != -1) this.textWrap = true;
			this._textValue = txt;
			if(txt.indexOf(Parser.openSegment) != -1 || this.textWrap){
				this._words = Parser.parse(txt);
				this._words = Parser.splitSymbol(this._words, Parser.breakLine, false, true);
				this._words = Parser.trimSpaces(this._words);
			}
			else{
				this._words = [new Segment(txt)];
			}
			this.render();
		}
	};

	TextField.prototype.setFastText = function(txt){
		txt = txt + "";
		this.dynamic = false;
		this.textWrap = false;

		if(txt != this._textValue){
			this._textValue = txt;
			this._words = [new Segment(txt)];
		}

		this.render(true);
	};

	/**
	 * Sets the font of the TextField and re-renders it's data.
	 * @type {function(this:TextField)}
	 * @param {Font|Object} name The desired text.
	 */
	TextField.prototype.setFont = function(font, specials){
		this._finalFont = null;
		this._custom = specials || {};
		this._font = Fonts.get(font);

		var thisRef = this;
		this._font._onFontLoaded(function(){
			thisRef.render.call(thisRef);
		});
	};

	/**
	 * Makes the buffer to draw the text in
	 * @private
	 * @type {function(this:TextField)}
	 */
	TextField.prototype._makeBuffer = function(){
		if(this.data == null) this.data = new Buffer({name:"Arstider_TextField_"+this.name});
	};

	/**
	 * Organizes the list of string segments so they are properly positioned
	 * @private
	 * @type {function(this:TextField)}
	 * @param {Object} fontRef Final transformation options
	 * @param {number} maxWidth The maximum width allowed
	 */
	TextField.prototype._renderWordList = function(f, needToApply, fastRender){

		var 
			caret = {x:0, y:0},
			fieldWidth = this.width - (f.paddingLeft*2),
			longestLine = 0,
			currentLine = 0,
			lines = [],
			l = null,
			i,
			u,
			heightVal,
			widthVal,
			headRoom = 0
		;

		//get width
		for(i = 0; i<this._words.length; i++){
			if(!this._words[i].width){
				this._words[i].calculateWidth(this.data.context, f);
			}
		}

		//get height to calculate topSpace
		headRoom = Math.max(0, f.lineSpacing - parseInt(f.size));

		//need to manually parse
		if((fieldWidth > 0 || this.textWrap) && !fastRender){
			for(i = 0; i<this._words.length; i++){
				if(this._words[i].text.indexOf(Parser.breakLine) != -1){
					if(l != null) lines.push(l);
					l = [];
					currentLine = 0;
				}

				if(fieldWidth > 0){
					if(currentLine + this._words[i].width > fieldWidth){
						if(l != null && l.length != 0) lines.push(l);
						l = [];
						currentLine = 0;
					}
				}
					
				if(l == null) l = [];
				l.push(this._words[i]);
				currentLine += this._words[i].width;
				if(currentLine > longestLine) longestLine = currentLine;
			}
			if(l && l.length > 0) lines.push(l);
		}
		else{
			lines[0] = this._words;
			longestLine =  this._getLineWidth(lines[0]);
		}

		heightVal = (lines.length * f.lineSpacing) + (f.paddingTop * 2) + Math.abs(f.fontOffsetY) + (f.lineWidth * 2) + f.shadowBlur/* + (f.lineSpacing * 0.25)*/;

		//set buffer width 
		if(fieldWidth <= 0){
			widthVal = longestLine + Math.abs(f.paddingLeft * 2) + Math.abs(f.fontOffsetX) + Math.abs(f.shadowBlur * 2) + (TextField.CROP_PADDING * 2);
			if(this.strokeText) widthVal += Math.abs(f.lineWidth * 2);
			this.data.setSize(widthVal, heightVal);
			fieldWidth = longestLine;
		}
		else{
			if(this.data.width != this.width && this.data.height != this.height){
				this.data.setSize(this.width, this.height || heightVal);
				needToApply = true;
			}
			else{
				this.data.context.clearRect(0,0,this.width,this.height);
			}
		}
		this.width = this.data.width;
		this.height = this.data.height;

		//apply font
		if(needToApply) this.applyFont(f);
			
		//We handle that here, thank you
		this.data.context.textAlign = "left";

		for(i = 0; i< lines.length; i++){
			caret.x = f.paddingLeft + f.fontOffsetX + Math.abs(f.lineWidth) + TextField.CROP_PADDING;
			if(f.textAlign == "right") caret.x += fieldWidth;
			else if(f.textAlign == "center"){
				l = this._getLineWidth(lines[i]);
				caret.x += ((fieldWidth - l)*0.5);
			}

			caret.y = f.paddingTop + ((i+1)*f.lineSpacing) + f.fontOffsetY - headRoom;

			for(u = 0; u<lines[i].length; u++){
				if(f.textAlign == "right"){
					caret.x -= lines[i][lines[i].length-(u +1)].width;
					lines[i][lines[i].length-(u +1)].render(this.data.context, f, caret.x, caret.y, this.strokeText, this.fillText);
				}
				else{
					lines[i][u].render(this.data.context, f, caret.x, caret.y, this.strokeText, this.fillText);
					caret.x += lines[i][u].width;
				}
			}
		}
	};

	TextField.prototype._getLineWidth = function(l){
		var total = 0;
		for(var i = 0; i<l.length; i++){
			total += l[i].width;
		}
		return total;
	};

	TextField.prototype.applyFont = function(f){
		for(var i in f){
			if(this[i] != undefined && !(i in TextField._entityRef)) this.data.context[i] = [i];
			else this.data.context[i] = f[i];
		}
		this.data.context.font = ((f.bold)?"bold ":"") + ((f.italic)?"italic ":"") + f.size + " " + f.family;
	};

	/**
	 * Renders the text and it's style into a buffer. Saves on context transformation.
	 * @private
	 * @type {function(this:TextField)}
	 */
	TextField.prototype.render = function(fastText){

		var needApply = false;

		if(this.dynamic == null){
			if(this.width == 0){
				this.dynamic = true;
			}
			else this.dynamic = false;
		}

		if(this.dynamic === true){
			this.width = 0;
			this.height = 0;
		}

		if(this.dynamic || this.textWrap || this._finalFont == null){
			this._makeBuffer();
			needApply = true;
		}

		/**
		 * Cancel operation if not all required fields are filled
		 */
		if(this._font === null || this._textValue === null || this._textValue === "") return;
		if(this._font.loaded === false) return;
		if(this._font.temp && !Fonts.collection[this._font.name].temp) this.setFont(Fonts.get(this._font.name));

		if(this._finalFont == null){
			this._finalFont = Arstider.mixin(Arstider.clone(this._font), this._custom, true);
			this._renderWordList(this._finalFont, true, fastText);
		}
		else{
			this._renderWordList(this._finalFont, needApply, fastText);
		}

		this.onchange.dispatch(this);
	};

	return TextField;
});