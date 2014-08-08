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
	define( "Arstider/Renderer", ["Arstider/contexts/Webgl", "Arstider/contexts/Canvas2d", "Arstider/core/Performance", "Arstider/Viewport", "Arstider/contexts/MatrixTransform"], /** @lends core/Renderer */ function (Webgl, Canvas2d, Performance, Viewport, MatrixTransform){
		
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
		Renderer.prototype.renderChild = function(context, element, currX, currY, pre, post, debug, complexParent, callback){

			var 
				xAnchor,
				yAnchor
			;

			if(!element || element.__skip) return;
				
			Performance.elements++;
			
			if(!element._skipUpdateBubble && element.update) Performance.numUpdates++; 
				
			if(element.alpha <= 0) return;

			currX += element.x;
			currY += element.y;

			if(element.scaleX != 1 || element.scaleY != 1 || element.skewX != 0 || element.skewY != 0 || element.rotation != 0){
				//Check for transformations
			
				complexParent = true;
				Performance.transforms++;
				this.pencil.save(context);
			}

			xAnchor = (element.width * element.rpX);
			yAnchor = (element.height * element.rpY);

			//Update globals
			if(element.global && element.parent){

				element.global.x = currX;
				element.global.y = currY;
				element.global.scaleX = element.scaleX * element.parent.scaleX;
				element.global.scaleY = element.scaleY * element.parent.scaleY;
				element.global.skewX = element.skewX * element.parent.skewX;
				element.global.skewY = element.skewY * element.parent.skewY;
				element.global.width = element.width * ((element.global.scaleX<0)?(element.global.scaleX*-1):element.global.scaleX);
				element.global.height = element.height * ((element.global.scaleY<0)?(element.global.scaleY*-1):element.global.scaleY);
				element.global.rotation = element.rotation + element.parent.rotation;
				element.global.alpha = element.alpha * element.parent.alpha;

				element.global.points = [
					- xAnchor, 
					- yAnchor, 
					element.width - xAnchor, 
					- yAnchor,
					- xAnchor,
					element.height - yAnchor,
					element.width - xAnchor,
					element.height - yAnchor
				];
			}

			if(complexParent){
				this.pencil.translate(context, currX + xAnchor, currY + yAnchor);

				currX = -xAnchor;
				currY = -yAnchor;
			}

			if(element.rotation != 0){
				Performance.transforms++;
				Arstider.applyMatrix(MatrixTransform.rotation(element.rotation), element.global.points);
				this.pencil.rotate(context, element.rotation);
			}

			if(element.scaleX != 1 || element.scaleY != 1){
				Performance.transforms++;
				Arstider.applyMatrix(MatrixTransform.scaling(element.scaleX, element.scaleY), element.global.points);
				this.pencil.scale(context, element.scaleX, element.scaleY);
			}
				
			if(element.skewX != 0 || element.skewY != 0){
				Performance.transforms++;
				Arstider.applyMatrix(MatrixTransform.skewing(element.skewX, element.skewY), element.global.points);
				this.pencil.transform(context, 1, element.skewX, element.skewY, 1, 0, 0);
			}

			//Update globals
			if(element.global && element.parent && complexParent){
				element.global.x = element.parent.global.x + element.global.x + element.global.points[0] - currX;
				element.global.y = element.parent.global.y + element.global.y + element.global.points[1] - currY;
				if(element.global.scaleX < 0) element.global.x -= element.global.width;
				if(element.global.scaleY < 0) element.global.y -= element.global.height;
			}


			//Alpha
			if(element.alpha != 1){
				Performance.transforms++;
				this.pencil.alpha(context, element.alpha);
			}
			
			//Composite Mode / Mask
			if(element.compositeMode != Arstider.defaultComposition){
				Performance.transforms++;
				this.pencil.setCompositionMode(context, element.compositeMode);
			} 
			else if(element.mask === true){
				Performance.transforms++;
				this.pencil.setCompositionMode(context, "destination-in");
			}
				
			//Shadow
			if(element.shadowColor != Arstider.defaultColor){
				Performance.transforms++;
				this.pencil.dropShadow(context, element.shadowOffsetX, element.shadowOffsetY, element.shadowBlur, element.shadowColor);
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
					//element.__isOffscreen = true;
					if(complexParent){
						//TODO: need more performant and permissive algorythm for complex offscreen elements
						/*if (element.global.x - ((element.global.width*this.padding)*0.5)< Viewport.maxWidth) {
							if (element.global.y - ((element.global.height*this.padding)*0.5)< Viewport.maxHeight) {
								if (element.global.x + (element.global.width*this.padding) >= 0) {
									if (element.global.y + (element.global.height*this.padding) >= 0) {
										element.__isOffscreen = false;
									}
								}
							}
						}*/
					} 
					else {
						if (currX < Viewport.maxWidth && currY < Viewport.maxHeight && currX + element.width >= 0 && currY + element.height >= 0) element.__isOffscreen = false;
					}
					
					if (!element.__isOffscreen) {
						
						var node = Arstider.getNode(element);
						if(node && node.data){
							Performance.draws++;
							if(element.largeData === true){
								this.pencil.renderAt(context, node.data, currX, currY, element.width, element.height, element.xOffset, element.yOffset, element.dataWidth, element.dataHeight);
							}
							else{
								this.pencil.renderAt(context, node.data, currX, currY, element.width, element.height);
							}
						}
						node = null;
					}
				}
			}
				
			//debug outlines
			if(debug || element.showOutline === true){
				this.pencil.debugOutline(context, currX, currY, element.width, element.height, "red");
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
			this.pencil.restore(context);
			if(debug || element.showOutline === true){
				this.pencil.debugOutlineComplex(context, element.global.x, element.global.y, element.global.points, "green");
			}

			if(callback) callback();
		};

		Renderer.prototype.clear = function(context, x, y, width, height){
			this._recoverContextPencil(context, function(){
				singleton.pencil.clear(context, x,y,width,height);
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
		Renderer.prototype.draw = function(context, element, pre, post, debug, callback){
			this._recoverContextPencil(context, function recoverContext(){
				singleton.renderChild.apply(singleton, [context, element, 0, 0, pre, post, debug, false, callback]);
			});
		};
			
		singleton = new Renderer();
		return singleton;
	});
})();