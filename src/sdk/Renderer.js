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

		Renderer.prototype.checkOnScreen = function(context, element, points){
			var mW = context.canvas.width;
			var mH = context.canvas.height;

			if((points[0] < mW && points[0] >= 0) ||
			(points[2] < mW && points[2] >= 0) ||
			(points[4] < mW && points[4] >= 0) ||
			(points[6] < mW && points[6] >= 0)){

				if((points[1] < mH && points[1] >= 0) ||
					(points[3] < mH && points[3] >= 0) ||
					(points[5] < mH && points[5] >= 0) ||
					(points[7] < mH && points[7] >= 0)){
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
		Renderer.prototype.renderChild = function(context, element, pre, post, debug, callback, main){

			var 
				xAnchor = 0,
				yAnchor = 0,
				points
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
				
			xAnchor = (element.width * element.rpX);
			yAnchor = (element.height * element.rpY);

			points = [
				- xAnchor, 
				- yAnchor, 
				element.width - xAnchor, 
				- yAnchor,
				- xAnchor,
				element.height - yAnchor,
				element.width - xAnchor,
				element.height - yAnchor
			];

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

			//Visual translate
			this.pencil.translate(context, element.x + xAnchor, element.y + yAnchor);

			if(element.rotation != 0){
				Performance.transforms++;
				this.pencil.rotate(context, element.rotation);
				MatrixTransform.rotation(element.global.rotation * Arstider.degToRad, points);
			}

			if(element.scaleX != 1 || element.scaleY != 1){
				Performance.transforms++;
				this.pencil.scale(context, element.scaleX, element.scaleY);
				MatrixTransform.scaling(element.global.scaleX, element.global.scaleY, points);
			}
				
			if(element.skewX != 0 || element.skewY != 0){
				Performance.transforms++;
				this.pencil.transform(context, 1, element.skewX, element.skewY, 1, 0, 0);
				MatrixTransform.skewing(element.global.skewX, element.global.skewY, points);
			}

			MatrixTransform.translation(element.global.x, element.global.y, points);

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

			element.onScreen = this.checkOnScreen(context, element, points);

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
								this.pencil.renderAt(context, node.data, -xAnchor, -yAnchor, element.width, element.height, element.xOffset, element.yOffset, element.dataWidth, element.dataHeight);
							}
							else{
								this.pencil.renderAt(context, node.data, -xAnchor, -yAnchor, element.width, element.height);
							}
						}
						node = null;
					}
				}
			}
				
			//debug outlines
			if(debug || element.showOutline === true){
				this.pencil.debugOutline(context, -xAnchor, -yAnchor, element.width, element.height, "magenta");
			}
				
			//runs post-render methods
			if(post) post(element);
				
			//Render Children
			if(element.children){
				if(element.children.length > 0) {
					var len = element.children.length;
					for(var li=0; li<len; li++){
						if(element.children[li]){
							this.renderChild(context, element.children[li], pre, post, debug);
						}
					}
					len = null;
				}
			}

			//restore x position
			this.pencil.translate(context, -(element.x + xAnchor), -(element.y + yAnchor));
				
			//Restore
			this.pencil.restore(context);
			//this.pencil.reset(context);
			if(debug || element.showOutline === true){
				if(element.data || element.draw){
					this.pencil.debugOutlineComplex(context, element.global.x, element.global.y, points, "cyan");
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
				singleton.renderChild.apply(singleton, [context, element, 0, 0, 0, 0, pre, post, debug, callback, true]);
			});
		};
			
		singleton = new Renderer();
		return singleton;
	});
})();