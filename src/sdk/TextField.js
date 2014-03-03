/**
 * Text Field Wrapper. 
 * 
 * Provides common private variables and methods for the TF as well as
 * AMD Closure and prototypes.
 *
 * @author frederic charette <fredc@meetfidel.com>
 */
;(function(window){
	
	//Utility method for text-wrap and multiline
	function wrapText(context, myText, strokeText, fillText, x, y, maxWidth, lineHeight) {
				
		var 
	       	words = [],
	       	paragraphs = [],
	       	line = '',
	       	breakLine = "@@",
	       	n,
	       	inc,
	       	testLine,
	       	metrics,
	       	testWidth
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
		       			context.strokeText(line, x, y + (inc*lineHeight));
					}
					if(fillText){
						if(strokeText && context.shadowColor){
							context.shadowColor = "transparent";
						}
						context.fillText(line, x, y + (inc*lineHeight));
					}
					line = words[n] + ' ';
					y += lineHeight;
		       	}
		       	else {
		       		line = testLine;
		       	}
			}
		    if(strokeText){
		 		context.strokeText(line, x, y + (inc*lineHeight));
			}
			if(fillText){
				if(strokeText && context.shadowColor){
					context.shadowColor = "transparent";
				}
				context.fillText(line, x, y + (inc*lineHeight));
			}
	    }
	}
	
	/**
	 * AMD Closure
	 */	
		define( "Arstider/TextField", ["Arstider/Buffer", "Arstider/Entity"], function (Buffer, Entity) {
		
			/**
			 * Creates an instance of TextField.
			 *
			 * @constructor
			 * @this {TextField}
			 * @param {string} name The desired name of the TextField. Uses timestamp if empty : not recommended
			 */
			TextField.Inherit(Entity);
			function TextField(name) {
				Super(this, name);
				
			};
			
			/**
			 * Kills the TextField's Buffer(s).
			 *
			 * @this {TextField}
			 */
			TextField.prototype.killBuffer = function(){
				this.data = null;
				this.dataCtx = null;
				Buffer.kill("TextField_"+this.name);
			};
			
			/**
			 * Sets the fill text of the TextField and re-renders it's data.
			 *
			 * @this {TextField}
			 * @param {string} name The desired fill text.
			 */
			TextField.prototype.setFillText = function(txt, conc){
				this.fillText = txt?true:false;
				this.setTextInternal(txt, conc);
			};
			
			/**
			 * Sets the stroke text of the TextField and re-renders it's data.
			 * If fillText is empty, it will automatically be set unless strokeOnly is explicitly set to true 
			 *
			 * @this {TextField}
			 * @param {string} name The desired stroke text.
			 * @param {boolean} strokeOnly If text is applied to the stroke only.
			 */
			TextField.prototype.setStrokeText = function(txt, conc, strokeOnly){
				this.strokeText = txt?true:false;
				if(!strokeOnly) this.fillText = txt?true:false;
				this.setTextInternal(txt, conc);
			};
			
			/**
			 * Sets the text of the textfield and re-renders its data
			 *
			 * @this {TextField}
			 * @param {string} name The desired stroke text.
			 * @private
			 */
			TextField.prototype.setTextInternal = function(txt, conc){
				var entry = txt;
				this.customSize = entry.fontSize;
				this.myText = entry.value;
				this.render();
			}
			
			/**
			 * Makes the buffer (used by some descendants) 
			 *
			 * @this {TextField}
			 * @private
			 */
			TextField.prototype.makeBuffer = function(bufferW,bufferH){
				
				if (this.data == null) this.data = Buffer.create("TextField_"+this.name);
				
				if (bufferW) this.data.width = bufferW;
				if (bufferH) this.data.height = bufferH;
				
				this.dataCtx = this.data.getContext('2d'); //Fonts need to be smooth - could put an option if you have pixelled fonts.
				
				for(i in this.font){
					if(i != "family" && i != "size" && i != "style"){
						this.dataCtx[i] = this.font[i];
					}
					this.dataCtx.font = ((this.font.style == "")?"":(this.font.style + " ")) + this.font.family + " " + (this.customSize?this.customSize:this.font.size);
				}
				
			}
			
			/**
			 * Renders the text and it's style into a buffer. Saves on context transformation. 
			 *
			 * @this {TextField}
			 * @private
			 * @param {CanvasContext} buff The context to use as buffer.
			 */
			TextField.prototype.render = function(buff){
				var i, pad, vs, xShift = 0, lPad, tPad, fontSize;
				
				this.dataWidth = this.width;
				this.dataHeight = this.height;
				
				this.makeBuffer(this.width,this.height);
				
				pad = (this.font.padding == undefined)?0:this.font.padding;
				vs = (this.font.verticalSpacing  == undefined)?0:this.font.verticalSpacing;
				
				if(this.font.textAlign === "center"){
					xShift = this.width*0.5;
				}
				else if(this.font.textAlign === "right"){
					xShift = this.width;
				}
				
				lPad = (this.font.paddingLeft == undefined)?0:this.font.paddingLeft;
				tPad = (this.font.paddingTop == undefined)?0:this.font.paddingTop;
				
				if(this.font.textWrap === true){
					fontSize = this.font.font.split(" ");
					if(fontSize.length == 3){
						fontSize = parseFloat(fontSize[1].substring(0,fontSize[1].indexOf('px')));
					}
					else{
						fontSize = parseFloat(fontSize[0].substring(0,fontSize[0].indexOf('px')));
					}
					wrapText(this.dataCtx, this.myText, this.strokeText, this.fillText, xShift+lPad, tPad, this.width-(pad*2), fontSize+vs);
				}
				else{
					if(this.strokeText){
						this.dataCtx.strokeText(this.myText, xShift+lPad, tPad);
					}
					if(this.fillText){
						//Prevent shadow from being applied twice- and over the already placed stroke
						if(this.strokeText && this.font.shadowColor){
							this.dataCtx.shadowColor = "transparent";
						}
						this.dataCtx.fillText(this.myText, xShift+lPad, tPad);
					}
				}
			};
			
			return TextField; 
		});
})(window);