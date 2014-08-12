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
	define( "Arstider/Renderer", ["Arstider/contexts/Webgl", "Arstider/contexts/Canvas2d", "Arstider/core/Performance", "Arstider/contexts/MatrixTransform"], /** @lends core/Renderer */ function (Webgl, Canvas2d, Performance, MatrixTransform){
		
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

			this.abort = false;
		}
			
		/**
		 * Render a single child and it's children
		 * @private
		 * @type {function}
		 * @param {Object} curChild Entity-type element to draw and call draw upon the children of
		 */
		Renderer.prototype.renderChild = function(context, element, currX, currY, pre, post, debug, complexParent, callback, main){

			var 
				xAnchor = 0,
				yAnchor = 0,
				needRestore = false
			;

			if(!element || element.__skip) return;

			if(singleton.abort){
				if(main){
					singleton.abort = false;
					this.pencil.reset(context);
				}
				else return;
			}
				
			Performance.elements++;
			
			if(!element._skipUpdateBubble && element.update) Performance.numUpdates++; 
				
			if(element.alpha <= 0) return;

			currX += element.x;
			currY += element.y;

			if(element.scaleX != 1 || element.scaleY != 1 || element.skewX != 0 || element.skewY != 0 || element.rotation != 0){
				//Check for transformations
			
				complexParent = true;
				Performance.transforms++;
				needRestore = true;
				this.pencil.save(context);
				xAnchor = (element.width * element.rpX);
				yAnchor = (element.height * element.rpY);
			}

			//Update globals
			if(element.global && element.parent){

				element.global.x = element.parent.global.x + element.x;
				element.global.y = element.parent.global.y + element.y;
				element.global.scaleX = element.scaleX * element.parent.global.scaleX;
				element.global.scaleY = element.scaleY * element.parent.global.scaleY;
				element.global.skewX = element.skewX * element.parent.global.skewX;
				element.global.skewY = element.skewY * element.parent.global.skewY;
				element.global.width = element.width * ((element.global.scaleX<0)?(element.global.scaleX*-1):element.global.scaleX);
				element.global.height = element.height * ((element.global.scaleY<0)?(element.global.scaleY*-1):element.global.scaleY);
				element.global.rotation = element.rotation + element.parent.global.rotation;
				element.global.alpha = element.alpha * element.parent.global.alpha;

				element.global.points = [
					- xAnchor, 
					- yAnchor, 
					element.global.width - xAnchor, 
					- yAnchor,
					- xAnchor,
					element.global.height - yAnchor,
					element.global.width - xAnchor,
					element.global.height - yAnchor
				];
			}

			if(complexParent){
				this.pencil.translate(context, currX + xAnchor, currY + yAnchor);

				currX = -xAnchor;
				currY = -yAnchor;


				MatrixTransform.scaling(element.global.scaleX, element.global.scaleY, element.global.points);
				MatrixTransform.skewing(element.global.skewX, element.global.skewY, element.global.points);
				MatrixTransform.rotation(element.global.rotation * Arstider.degToRad, element.global.points);
			}

			if(element.rotation != 0){
				Performance.transforms++;
				this.pencil.rotate(context, element.rotation);
			}

			if(element.scaleX != 1 || element.scaleY != 1){
				Performance.transforms++;
				this.pencil.scale(context, element.scaleX, element.scaleY);
			}
				
			if(element.skewX != 0 || element.skewY != 0){
				Performance.transforms++;
				this.pencil.transform(context, 1, element.skewX, element.skewY, 1, 0, 0);
			}

			//Update globals
			if(element.global && element.parent){
				if(complexParent){
					element.global.x -= currX;
					element.global.y -= currY;
				}
				MatrixTransform.translation(element.global.x, element.global.y, element.global.points);
			}


			//Alpha
			if(element.alpha != 1){
				Performance.transforms++;
				needRestore = true;
				this.pencil.alpha(context, element.alpha);
			}
			
			//Composite Mode / Mask
			if(element.compositeMode != Arstider.defaultComposition){
				Performance.transforms++;
				needRestore = true;
				this.pencil.setCompositionMode(context, element.compositeMode);
			} 
			else if(element.mask === true){
				Performance.transforms++;
				needRestore = true;
				this.pencil.setCompositionMode(context, "destination-in");
			}
				
			//Shadow
			if(element.shadowColor != Arstider.defaultColor){
				needRestore = true;
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
					element.__isOffscreen = true;

					var mW = context.canvas.width;
					var mH = context.canvas.height;

					if(complexParent){
						if((element.global.points[0] < mW && element.global.points[0] >= 0) ||
							(element.global.points[2] < mW && element.global.points[2] >= 0) ||
							(element.global.points[4] < mW && element.global.points[4] >= 0) ||
							(element.global.points[6] < mW && element.global.points[6] >= 0)){

							if((element.global.points[1] < mH && element.global.points[1] >= 0) ||
								(element.global.points[3] < mH && element.global.points[3] >= 0) ||
								(element.global.points[5] < mH && element.global.points[5] >= 0) ||
								(element.global.points[7] < mH && element.global.points[7] >= 0)){
								element.__isOffscreen = false;
							}
						}
					} 
					else {
						if (currX < mW && currY < mH && currX + element.width >= 0 && currY + element.height >= 0) element.__isOffscreen = false;
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
				this.pencil.debugOutline(context, currX, currY, element.width, element.height, "magenta");
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
			if(needRestore) this.pencil.restore(context);
			this.pencil.reset(context);
			if(debug || element.showOutline === true){
				if(element.data || element.draw){
					this.pencil.debugOutlineComplex(context, element.global.x, element.global.y, element.global.points, "cyan");
				}
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

		Renderer.prototype.reset = function(context){
			this.abort = true;
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
				singleton.reset(context);
				singleton.renderChild.apply(singleton, [context, element, 0, 0, pre, post, debug, false, callback, true]);
			});
		};
			
		singleton = new Renderer();
		return singleton;
	});
})();