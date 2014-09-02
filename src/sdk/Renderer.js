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
	define( "Arstider/Renderer", ["Arstider/contexts/Webgl", "Arstider/contexts/Canvas2d", "Arstider/contexts/MatrixTransform"], /** @lends core/Renderer */ function (Webgl, Canvas2d, MatrixTransform){
		
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
			this.padding = 100;
			this.allowSkip = true;
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
				p4 = matrix.transformPoint(fw, fh),
				pc = {x:(p1.x+p2.x+p3.x+p4.x)*0.25, y:(p1.y+p2.y+p3.y+p4.y)*0.25}
			;

			if((p1.x - singleton.padding < mW && p1.x >=  -singleton.padding) ||
			(p2.x - singleton.padding <= mW && p2.x >  -singleton.padding) ||
			(p3.x - singleton.padding < mW && p3.x >=  -singleton.padding) ||
			(p4.x - singleton.padding <= mW && p4.x >  -singleton.padding) ||
			(pc.x - singleton.padding <= mW && pc.x >  -singleton.padding)){

				if((p1.y - singleton.padding < mH && p1.y >=  -singleton.padding) ||
					(p2.y - singleton.padding <= mH && p2.y >  -singleton.padding) ||
					(p3.y - singleton.padding < mH && p3.y >=  -singleton.padding) ||
					(p4.y - singleton.padding <= mH && p4.y >  -singleton.padding) ||
					(pc.y - singleton.padding <= mH && pc.y >  -singleton.padding)){
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
		Renderer.prototype.renderChild = function(context, element, complex, pre, post, performance, t, debug, callback, main){

			var 
				xAnchor = 0,
				yAnchor = 0,
				prevX = 0,
				prevY = 0
			;

			if(!element || element.__skip) return;
				
			performance.elements++;
			if(!element._skipUpdateBubble && element.update) performance.updates++; 

			if(element.alpha <= 0) return;

			
			if(!t){
				t = new MatrixTransform(this.pencil, context);
				t.restore();
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

			//Alpha
			if(element.alpha != 1){
				performance.transforms++;
				this.pencil.alpha(context, element.alpha);
			}
			
			if(element.rotation != 0 || element.scaleX != 1 || element.scaleY != 1 || complex){
				t.save();
				if (complex) {
					t.translate(element.x  + xAnchor, element.y + yAnchor);
				} else {
					t.translate(element.global.x + xAnchor, element.global.y + yAnchor);
				}
				complex = true;
			}

			if(element.rotation != 0){
				performance.transforms++;
				t.rotate(element.rotation * Arstider.degToRad);
			}

			if(element.scaleX != 1 || element.scaleY != 1){
				performance.transforms++;
				t.scale(element.scaleX, element.scaleY);
			}
				
			if(element.skewX != 0 || element.skewY != 0){
				performance.transforms++;
				//TODO
			}

			//Composite Mode / Mask
			if(element.compositeMode != Arstider.defaultComposition){
				performance.transforms++;
				this.pencil.setCompositionMode(context, element.compositeMode);
			} 
			else if(element.mask === true){
				performance.transforms++;
				this.pencil.setCompositionMode(context, "destination-in");
			}
				
			//Shadow
			if(element.shadowColor != Arstider.defaultColor){
				performance.transforms++;
				this.pencil.dropShadow(context, element.shadowOffsetX, element.shadowOffsetY, element.shadowBlur, element.shadowColor);
			}

			//Runs pre-render method:
			if(pre) pre(element);

			t.setTransform();

			//Render data
			if(element.data || element.draw){	
				var onScreen = (element.global.x < context.canvas.width && element.global.x + element.global.width > 0 && element.global.y < context.canvas.height && element.global.y + element.global.height > 0);
				if((!complex && onScreen) || complex){
					//Custom draw method :: WARNING! Only context is provided... could be any of Webgl or Canvas2d !!!
					if(element.draw){
						performance.draws++;
						element.draw.call(element, context, (complex)?prevX-xAnchor:element.global.x, (complex)?prevY-yAnchor:element.global.y);
					}
					else{
						//if(element.onScreen) {
						var node = Arstider.getNode(element);
						if(node && node.data){
							performance.draws++;
							if(element.largeData === true){
								this.pencil.renderAt(context, node.data, (complex)?prevX-xAnchor:element.global.x, (complex)?prevY-yAnchor:element.global.y, element.width, element.height, element.xOffset, element.yOffset, element.dataWidth, element.dataHeight);
							}
							else{
								this.pencil.renderAt(context, node.data, (complex)?prevX-xAnchor:element.global.x, (complex)?prevY-yAnchor:element.global.y, element.width, element.height);
							}
						}
						node = null;
					}
				}
			}
				
			//debug outlines
			if(debug || element.showOutline === true){
				this.pencil.debugOutline(context, (complex)?prevX-xAnchor:element.global.x, (complex)?prevY-yAnchor:element.global.y, element.width, element.height, "magenta");
			}
			
			
			//element.onScreen = this.checkOnScreen(context, element, t, (complex)?xAnchor:-element.global.x, (complex)?yAnchor:-element.global.y);

			//runs post-render methods
			if(post) post(element);
				
			//Render Children
			if(element.children){
				if(element.children.length > 0) {
					var len = element.children.length;
					for(var li=0; li<len; li++){
						if(element.children[li]){
							this.renderChild(context, element.children[li], complex, pre, post, performance, t, debug);
						}
					}
					len = null;
				}
			}
				
			//Restore
			if(complex) t.restore();
			if(element.alpha != 1) this.pencil.alpha(context, 1/element.alpha);

			if(callback) callback();
		};

		Renderer.prototype.clear = function(context, x, y, width, height){
			this._recoverContextPencil(context, function(){
				singleton.pencil.reset(context);
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

		Renderer.prototype.clip = function(context){
			this.pencil.clip(context, 0, 0, context.canvas.width, context.canvas.height);
		};
			
		/**
		 * Recursively draw elements from the rootChild on the desired context
		 * @param {Engine} eng Engine reference
		 * @param {Object} rootChild Root element to start render process at
		 * @param {Object} pre Pre-render operation
		 * @param {Object} post Post-render operation
		 * @param {Object} showBoxes Whether or not to show the debug outlines
		 */
		Renderer.prototype.draw = function(context, element, pre, post, performance, debug, callback){
			this._recoverContextPencil(context, function recoverContext(){
				singleton.renderChild.call(singleton, context, element, false, pre, post, performance, null, debug, callback, true);
				performance.frames++;
			});
		};
			
		singleton = new Renderer();
		return singleton;
	});
})();