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
	define( "Arstider/Renderer", ["Arstider/contexts/Webgl", "Arstider/contexts/Canvas2d", "Arstider/core/Performance", "Arstider/Viewport"], /** @lends core/Renderer */ function (Webgl, Canvas2d, Performance, Viewport){
		
		if(singleton != null) return singleton;
			
		/**
		 * Renderer class
	     * Every draw frame, this module is called upon to render every child of every container
	     * @class core/Renderer
	     * @name core/Renderer
		 * @constructor 
		 */
		function Renderer(){
			
			this.pencil = null;

			this.padding = 1;
		}
			
		/**
		 * Render a single child and it's children
		 * @private
		 * @type {function}
		 * @param {Object} curChild Entity-type element to draw and call draw upon the children of
		 */
		Renderer.prototype.renderChild = function(context, element, currX, currY, pre, post, debug, complexParent){
				
			var isComplex = false;

			if(!element || element.__skip) return;
				
			Performance.elements++;
			
			if(!element._skipUpdateBubble && element.update) Performance.numUpdates++; 
				
			if(element.alpha <= 0) return;

			currX += element.x;
			currY += element.y;

			//Update globals
			if(element.global && element.parent){
				element.global.x = (isComplex)?(element.parent.global.x + element.x):currX;
				element.global.y = (isComplex)?(element.parent.global.y + element.y):currY;
				element.global.scaleX = element.scaleX * element.parent.scaleX;
				element.global.scaleY = element.scaleY * element.parent.scaleY;
				element.global.width = element.width * element.global.scaleX;
				element.global.height = element.height * element.global.scaleY;
				element.global.rotation = element.rotation + element.parent.rotation;
				element.global.alpha = element.alpha * element.parent.alpha;
			}

			if(element.scaleX != 1 || element.scaleY != 1 || element.skewX != 0 || element.skewY != 0 || element.rotation != 0){
				//Check for transformations
			
				isComplex = true;
				complexParent = true;
				Performance.transforms++;
				this.pencil.save();
			}

			if(isComplex){
				this.pencil.translate(currX + (element.width * element.rpX), currY + (element.height * element.rpY));
				currX = -(element.width * element.rpX);
				currY = -(element.height * element.rpY);
			}

			//batch transforms for better performance
			this.pencil.transform(element.scaleX, element.skewX, element.skewY, element.scaleY, 0, 0);

			//Rotation
			if(element.rotation != 0){
				Performance.transforms++;
				this.pencil.rotate(element.rotation);
			}

			//Alpha
			if(element.alpha != 1){
				Performance.transforms++;
				this.pencil.alpha(element.alpha);
			}
			
			//Composite Mode / Mask
			if(element.compositeMode != Arstider.defaultComposition){
				Performance.transforms++;
				this.pencil.setCompositionMode(element.compositeMode);
			} 
			else if(element.mask === true){
				Performance.transforms++;
				this.pencil.setCompositionMode("destination-in");
			}
				
			//Shadow
			if(element.shadowColor != Arstider.defaultColor){
				Performance.transforms++;
				this.pencil.dropShadow(element.shadowOffsetX, element.shadowOffsetY, element.shadowBlur, element.shadowColor);
			}

			//Runs pre-render method:
			if(pre) pre(element);
				
			//Render data
			if(element.data || element.draw){
				//Custom draw method :: WARNING! Only context is provided... could be any of Webgl or Canvas2d !!!
				if(element.draw){
					Performance.draws++;
					element.draw.apply(element, [context, currX, currY]);
				}
				else{
					element.__isOffscreen = true;
					if(complexParent){
						//TODO: need more performant and permissive algorythm for complex offscreen elements
						if (element.global.x - ((element.global.width*this.padding)*0.5)< Viewport.maxWidth) {
							if (element.global.y - ((element.global.height*this.padding)*0.5)< Viewport.maxHeight) {
								if (element.global.x + (element.global.width*this.padding) >= 0) {
									if (element.global.y + (element.global.height*this.padding) >= 0) {
										element.__isOffscreen = false;
									}
								}
							}
						}
					} 
					else {
						if (currX < Viewport.maxWidth && currY < Viewport.maxHeight && currX + element.width >= 0 && currY + element.height >= 0) element.__isOffscreen = false;
					}
					
					if (!element.__isOffscreen) {
						
						var node = Arstider.getNode(element);
						if(node && node.data){
							Performance.draws++;
							if(element.largeData === true){
								this.pencil.renderAt(node.data, currX, currY, element.width, element.height, element.xOffset, element.yOffset, element.dataWidth, element.dataHeight);
							}
							else{
								this.pencil.renderAt(node.data, currX, currY, element.width, element.height);
							}
						}
						node = null;
					}
				}
			}
				
			//debug outlines
			if(debug || element.showOutline === true){
				this.pencil.debugOutline(currX, currY, element.width, element.height);
			}
				
			//runs post-render methods
			if(post) post(element);
				
			//Render Children
			if(element.children){
				if(element.children.length > 0) {
					var len = element.children.length;
					for(var li=0; li<len; li++){
						if(element.children[li]){
							this.renderChild(context, element.children[li], currX, currY, pre, post, debug, complexParent);
						}
					}
					len = null;
				}
			}
				
			//Restore
			this.pencil.restore();
		};

		Renderer.prototype.clear = function(context, x, y, width, height){
			this._recoverContextPencil(context, function(){
				singleton.pencil.clear(x,y,width,height);
			});
		};

		Renderer.prototype._recoverContextPencil = function(context, callback){
			if(context && context.canvas.buffer.contextType == "canvas2d"){
 				this.pencil = Canvas2d;
 			}
 			else{
 				this.pencil = Webgl;
 			}

			if(!context.__init){
				context.__init = true;
				if(context && context.canvas.buffer.contextType == "canvas2d"){
					this.pencil = Canvas2d;
				}
				else{
					this.pencil = Webgl;
				}
				this.pencil.init(context, callback);
			}
			else{
				callback();
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
		Renderer.prototype.draw = function(context, element, pre, post, debug){
			this._recoverContextPencil(context, function(){
				singleton.renderChild.apply(singleton, [context, element, 0, 0, pre, post, debug]);
			});
		};
			
		singleton = new Renderer();
		return singleton;
	});
})();