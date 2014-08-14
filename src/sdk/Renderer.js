/**
 * Renderer
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
			this.abort = false;
		}

		Renderer.prototype.checkOnScreen = function(context, element, matrix, xo, yo){
			var 
				mW = context.canvas.width,
				mH = context.canvas.height,
				fx = -xo,
				fy = -yo,
				fh = element.height - yo,
				fw = element.width - xo,
				p1 = matrix.transformPoint(fx, fy),
				p2 = matrix.transformPoint(fw, fy),
				p3 = matrix.transformPoint(fx, fh),
				p4 = matrix.transformPoint(fw, fh)
			;

			element.global.points = [p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y];

			if((p1.x < mW && p1.x >= 0) ||
			(p2.x <= mW && p2.x > 0) ||
			(p3.x < mW && p3.x >= 0) ||
			(p4.x <= mW && p4.x > 0)){

				if((p1.y < mH && p1.y >= 0) ||
					(p2.y <= mH && p2.y > 0) ||
					(p3.y < mH && p3.y >= 0) ||
					(p4.y <= mH && p4.y > 0)){
					return true;
				}
			}
			return false;
		};
			
		/**
		 * Render a single child and it's children
		 * @private
		 * @type {function}
		 * @param {Object} curChild Entity-type element to draw and call draw upon the children of
		 */
		Renderer.prototype.renderChild = function(context, element, complex, pre, post, currMatrix, debug, callback, main){

			var 
				xAnchor = 0,
				yAnchor = 0,
				t,
				prevX,
				prevY
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

			t = new MatrixTransform(this.pencil, context);
			if(currMatrix){
				t.setMatrix(currMatrix.matrix);
			}
				
			xAnchor = (element.width * element.rpX);
			yAnchor = (element.height * element.rpY);

			//Update globals
			if(element.global){
				element.global.x = element.x;
				element.global.y = element.y;
				element.global.scaleX = element.scaleX;
				element.global.scaleY = element.scaleY;
				element.global.skewX = element.skewX;
				element.global.skewY = element.skewY;
				element.global.width = element.width;
				element.global.height = element.height;
				element.global.rotation = element.rotation;
				element.global.alpha = element.alpha;

				if(element.parent){
					element.global.x += element.parent.global.x;
					element.global.y += element.parent.global.y;
					element.global.scaleX *= element.parent.global.scaleX;
					element.global.scaleY *= element.parent.global.scaleY;
					element.global.skewX *= element.parent.global.skewX;
					element.global.skewY *= element.parent.global.skewY;
					element.global.width *= ((element.global.scaleX<0)?(element.global.scaleX*-1):element.global.scaleX);
					element.global.height *= ((element.global.scaleY<0)?(element.global.scaleY*-1):element.global.scaleY);
					element.global.rotation += element.parent.global.rotation;
					element.global.alpha *= element.parent.global.alpha;
				}
			}

			//return to 0
			prevX = t.matrix[4];
			prevY = t.matrix[5];
			t.translate(-prevX, -prevY);

			if(element.rotation != 0){
				Performance.transforms++;
				t.rotate(element.rotation * Arstider.degToRad);
				complex = true;
			}

			if(element.scaleX != 1 || element.scaleY != 1){
				Performance.transforms++;
				t.scale(element.scaleX, element.scaleY);
				complex = true;
			}
				
			if(element.skewX != 0 || element.skewY != 0){
				Performance.transforms++;
				//TODO
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

			//Problem 1 :
			if(!complex){
				t.translate(prevX, prevY);
			}
			else{
				t.translate(prevX + element.x, prevY + element.y);
			}

			//Runs pre-render method:
			if(pre) pre(element);

			//Render data
			if(element.data || element.draw){
				//Custom draw method :: WARNING! Only context is provided... could be any of Webgl or Canvas2d !!!
				if(element.draw){
					Performance.draws++;
					element.draw.apply(element, [context]);
				}
				else{
					if(element.onScreen) {
						
						var node = Arstider.getNode(element);
						if(node && node.data){
							Performance.draws++;
							if(element.largeData === true){
								//Problem 2:
								this.pencil.renderAt(context, node.data, (complex)?-xAnchor:element.x, (complex)?-yAnchor:element.y, element.width, element.height, element.xOffset, element.yOffset, element.dataWidth, element.dataHeight);
							}
							else{
								this.pencil.renderAt(context, node.data, (complex)?-xAnchor:element.x, (complex)?-yAnchor:element.y, element.width, element.height);
							}
						}
						node = null;
					}
				}
			}
				
			//debug outlines
			if(debug || element.showOutline === true){
				//Problem 2-2:
				this.pencil.debugOutline(context, (complex)?-xAnchor:element.x, (complex)?-yAnchor:element.y, element.width, element.height, "magenta");
			}
			
			//Problem 3:
			element.onScreen = this.checkOnScreen(context, element, t, xAnchor, yAnchor);

			//runs post-render methods
			if(post) post(element);
				
			//Render Children
			if(element.children){
				if(element.children.length > 0) {
					var len = element.children.length;
					for(var li=0; li<len; li++){
						if(element.children[li]){
							this.renderChild(context, element.children[li], complex, pre, post, t, debug);
						}
					}
					len = null;
				}
			}
				
			//Restore
			this.pencil.restore(context);
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
				singleton.renderChild.apply(singleton, [context, element, false, pre, post, null, debug, callback, true]);
			});
		};
			
		singleton = new Renderer();
		return singleton;
	});
})();