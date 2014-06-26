/**
 * Renderrer
 * 
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */

;(function(){
	
	var
		/**
		 * Singleton static
	 	 * @private
	 	 * @type {Renderer|null}
	 	 */
		singleton = null
	;
	
	 /**
	 * Defines performance module
	 */	
	define( "Arstider/core/Renderer", ["Arstider/Sprite", "Arstider/DisplayObject", "Arstider/TextField", "Arstider/core/Performance", "Arstider/Buffer", "Arstider/Shape", "Arstider/Viewport"], /** @lends core/Renderer */ function (Sprite, DisplayObject, TextField, Performance, Buffer, Shape, Viewport){
		
		if(singleton != null) return singleton;
			
		/**
		 * Renderer class
	     * Every draw frame, this module is called upon to render every child of every container
	     * @class core/Renderer
	     * @name core/Renderer
		 * @constructor 
		 */
		function Renderer(){
			
			/**
			 * Current frame rendering context target
			 * @private
			 * @type {CanvasRenderingContext2D|null}
			 */
			this._context = null;
			
			/**
			 * Optional pre-render method to call on elements
			 * @private
			 * @type {function}
			 */
			this._preRender = null;
				
			/**
			 * Optional post-render method to call on elements
			 * @private
			 * @type {function}
			 */
			this._postRender = null;
				
			/**
			 * Whether or not to show the debug boxes around elements
			 * @private
			 * @type {boolean}
			 */
			this._showBoxes = false;
		}
			
		/**
		 * Render a single child and it's children
		 * @private
		 * @type {function}
		 * @param {Object} curChild Entity-type element to draw and call draw upon the children of
		 */
		Renderer.prototype.renderChild = function(curChild, _currentX, _currentY){
				
			if(!curChild || curChild.__skip) return;
				
			var 
				isComplex = false,	//Determines if geometrical transformations have been applied
				oldAlpha = null,	//Stores the old alpha of the context, if need be
				li = null,			//To loop through the element's children, if need be
				len = null,
				oldShadowColor,
				oldShadowBlur,
				oldShadowOffsetX,
				oldShadowOffsetY,
				shadowSafe,
				prevFill
			;
				
			Performance.elements++;
			
				
			if(curChild.alpha <= 0) return;
				
			if(
				(curChild.scaleX != 1) ||
				(curChild.scaleY != 1) ||
				(curChild.rotation != 0) ||
				(curChild.skewX != 0) ||
				(curChild.skewY != 0)
				) {
					
				isComplex = true;
				this._context.save();
			}
				
			if(curChild.alpha != 1) {
				oldAlpha = this._context.globalAlpha;
				this._context.globalAlpha *= curChild.alpha;
			}
				
			_currentX += curChild.x;
			_currentY += curChild.y;
				
			if(isComplex) {
				this._context.translate(_currentX+ (curChild.width * curChild.rpX),_currentY+ (curChild.height * curChild.rpY));
				_currentX = -(curChild.width * curChild.rpX);
				_currentY = -(curChild.height * curChild.rpY);
			}
				
			//Scale
			if((curChild.scaleX != 1) || (curChild.scaleY != 1)){
				this._context.scale(curChild.scaleX, curChild.scaleY);
				Performance.transforms++;
			}
			//Rotation
			if (curChild.rotation != 0){
				this._context.rotate(curChild.rotation*Arstider.degToRad);
				Performance.transforms++;
			}
			//Skey X
			if (curChild.skewX){
				this._context.transform(1, 0, curChild.skewX, 1, 0, 0);
				Performance.transforms++;
			}
			//Skew Y
			if (curChild.skewY){
				this._context.transform(1, curChild.skewY, 0, 1, 0, 0);
				Performance.transforms++;
			}
				
			//Runs pre-render method:
			if(this._preRender) this._preRender(curChild);
			
			if(curChild.compositeMode != Arstider.defaultComposition) this._context.globalCompositeOperation = curChild.compositeMode;
			
			if(curChild.mask === true) this._context.globalCompositeOperation = "destination-in";
				
			//Update globals
			if(curChild.global && curChild.parent){
				curChild.global.x = (isComplex)?(curChild.parent.global.x + curChild.x):_currentX;
				curChild.global.y = (isComplex)?(curChild.parent.global.y + curChild.y):_currentY;
				curChild.global.scaleX = curChild.scaleX * curChild.parent.scaleX;
				curChild.global.scaleY = curChild.scaleY * curChild.parent.scaleY;
				curChild.global.width = curChild.width * curChild.global.scaleX;
				curChild.global.height = curChild.height * curChild.global.scaleY;
				curChild.global.rotation = curChild.rotation + curChild.parent.rotation;
				curChild.global.alpha = curChild.alpha * curChild.parent.alpha;
			}
				
			//Shadow
			if(curChild.shadowColor != Arstider.defaultColor){
					
				//save old properties
				oldShadowColor = this._context.shadowColor;
				oldShadowBlur = this._context.shadowBlur;
				oldShadowOffsetX = this._context.shadowOffsetX;
				oldShadowOffsetY = this._context.shadowOffsetY;
					
				this._context.shadowColor = curChild.shadowColor;
				this._context.shadowBlur = curChild.shadowBlur;
				this._context.shadowOffsetX = curChild.shadowOffsetX;
				this._context.shadowOffsetY = curChild.shadowOffsetY;
			}
				
			//Render
			if(curChild.data){
				Performance.draws++;
				if(curChild.data._pattern || curChild instanceof Shape){
					prevFill = this._context.fillStyle;
					this._context.fillStyle = curChild.data._pattern;
                                        if(curChild instanceof Shape){
                                            curChild.render();
                                            this._context.fill();
                                        }
					else this._context.fillRect(Math.round(_currentX), Math.round(_currentY), curChild.width, curChild.height);
					this._context.fillStyle = prevFill;
				}
				else{
					//instanceof is pretty fast,  we want to leverage data offset rather than having an extra buffer for sprites.
					
					var isOffscreen;
					
					if (isComplex) {
						isOffscreen = false;
					} else {
						isOffscreen = true;
						if (_currentX < Viewport.maxWidth) {
							if (_currentY < Viewport.maxHeight) {
								if (_currentX + curChild.width >= 0) {
									if (_currentY + curChild.height >= 0) {
										isOffscreen = false;
									}
								}
							}
						}
					}
					
					if (!isOffscreen) {
						
						if(curChild instanceof Sprite || curChild.largeData === true){
							this._context.drawImage((curChild.data instanceof Buffer)?curChild.data.data:curChild.data, curChild.xOffset, curChild.yOffset, curChild.dataWidth, curChild.dataHeight, Math.round(_currentX), Math.round(_currentY), curChild.width, curChild.height);
						}
						else{
							this._context.drawImage((curChild.data instanceof Buffer)?curChild.data.data:curChild.data, Math.round(_currentX), Math.round(_currentY), curChild.width, curChild.height);
						}
						
					}
					
				}
			}
                        
                        if(curChild.draw) curChild.draw();
				
			if(this._showBoxes || curChild.showOutline === true){
				shadowSafe = this._context.shadowColor;
				this._context.shadowColor = "transparent";
				var prevAlpha = this._context.globalAlpha;
				this._context.globalAlpha = 0.7;
				this._context.lineWidth = 1;
				if(curChild instanceof Sprite) this._context.strokeStyle = "blue";
				else if(curChild instanceof TextField) this._context.strokeStyle = "green";
				else if(curChild instanceof DisplayObject) this._context.strokeStyle = "red";
				else this._context.strokeStyle = "yellow";
					
				this._context.strokeRect(Math.round(_currentX), Math.round(_currentY), curChild.width, curChild.height);
				this._context.globalAlpha = prevAlpha;
				this._context.shadowColor = shadowSafe;
			}
				
			//runs post-render methods
			if(this._postRender) this._postRender(curChild);
				
			//Render Children
			if(curChild.children){
				if(curChild.children.length > 0) {
					len = curChild.children.length;
					for(li=0; li<len; li++){
						if(curChild.children[li]){
							this.renderChild(curChild.children[li], _currentX, _currentY);
						}
					}
				}
			}
				
			//Restore
			if(oldAlpha !== null) this._context.globalAlpha = oldAlpha;
			if(curChild.compositeMode != Arstider.defaultComposition) this._context.globalCompositeOperation = Arstider.defaultComposition;
			if(isComplex) this._context.restore();
			else{
				if(curChild.shadowColor != Arstider.defaultColor){
					this._context.shadowColor = oldShadowColor;
					this._context.shadowBlur = oldShadowBlur;
					this._context.shadowOffsetX = oldShadowOffsetX;
					this._context.shadowOffsetY = oldShadowOffsetY;
				}
			}
		};
			
		/**
		 * Recursively draw elements from the rootChild on the desired context
		 * @param {Engine} eng Engine reference
		 * @param {Object} rootChild Root element to start render process at
		 * @param {Object} pre Pre-render operation
		 * @param {Object} post Post-render operation
		 * @param {Object} showBoxes Whether or not to show the debug outlines
		 */
		Renderer.prototype.draw = function(eng, rootChild, pre, post, showBoxes){
			this._context = this._context || eng.context;
			this._preRender = pre;
			this._postRender = post;
			this._showBoxes = showBoxes;
			
			this.renderChild(rootChild, 0, 0);
		};
			
		singleton = new Renderer();
		return singleton;
	});
})();