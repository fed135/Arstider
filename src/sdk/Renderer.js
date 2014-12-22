/**
 * Renderer
 * 
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */
define( "Arstider/Renderer", 
[
	"Arstider/Buffer", 
	"Arstider/contexts/Canvas2d", 
	"Arstider/core/Performance", 
	"Arstider/contexts/MatrixTransform"
], 
/** @lends core/Renderer */ 
function (Buffer, Canvas2d, Performance, MatrixTransform){
		
	/**
	 * Renderer class
     * Every draw frame, this module is called upon to render every child of every container
     * @class core/Renderer
     * @name core/Renderer
	 * @constructor 
	 */
	function Renderer(){
		this.pencil = Canvas2d;
		this.padding = 100;
		this.pendingRemoval = 0;
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
		if((p1.x - this.padding < mW && p1.x >=  -this.padding) ||
		(p2.x - this.padding <= mW && p2.x >  -this.padding) ||
		(p3.x - this.padding < mW && p3.x >=  -this.padding) ||
		(p4.x - this.padding <= mW && p4.x >  -this.padding) ||
		(pc.x - this.padding <= mW && pc.x >  -this.padding)){
			if((p1.y - this.padding < mH && p1.y >=  -this.padding) ||
				(p2.y - this.padding <= mH && p2.y >  -this.padding) ||
				(p3.y - this.padding < mH && p3.y >=  -this.padding) ||
				(p4.y - this.padding <= mH && p4.y >  -this.padding) ||
				(pc.y - this.padding <= mH && pc.y >  -this.padding)){
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
	Renderer.prototype.renderChild = function(context, element, complex, pre, post, t, debug, callback, main){

		var 
			xAnchor = 0,
			yAnchor = 0
		;
			
		if(!element) return;
		Performance.elements++;
		if(!element._skipUpdateBubble && !element._skipUpdate && element.update) Performance.numUpdates++; 
		if(element.alpha <= 0) return;
		
		if(!t){
			t = new MatrixTransform(this.pencil, context);
			t.reset();
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
			Performance.transforms++;
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
			Performance.transforms++;
			t.rotate(element.rotation * Arstider.degToRad);
		}
		if(element.scaleX != 1 || element.scaleY != 1){
			Performance.transforms++;
			t.scale(element.scaleX, element.scaleY);
		}
			
		if(element.skewX != 0 || element.skewY != 0){
			//Performance.transforms++;
			//TODO
		}
		//Composite Mode / Mask
		if(element.compositeMode != Arstider.defaultComposition){
			Performance.transforms++;
			this.pencil.setCompositionMode(context, element.compositeMode);
		} 
		else if(element.mask === true){
			t.setTransform();
			Performance.transforms++;
			this.pencil.clip(context, (complex)?-xAnchor:element.global.x, (complex)?-yAnchor:element.global.y, element.width, element.height);
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
			if(!element.mask) t.setTransform();
			var onScreen = (element.global.x < context.canvas.width && element.global.x + element.global.width > 0 && element.global.y < context.canvas.height && element.global.y + element.global.height > 0);
			if((!complex && onScreen) || complex){
				//Custom draw method :: WARNING! Only context is provided... could be any of Webgl or Canvas2d !!!
				if(element.draw){
					Performance.draws++;
					element.draw.call(element, context, (complex)?-xAnchor:element.global.x, (complex)?-yAnchor:element.global.y);
				}
				else{
					if(element.global.height > 0 && element.global.width > 0){
						//if(element.onScreen) {
						var node = /*Arstider.getNode(*/element/*)*/;

						if(node && node.data){
							if(node.data.data) node = node.data;
							Performance.draws++;
							if(element.largeData === true){
								this.pencil.renderAt(context, node.data, (complex)?-xAnchor:element.global.x, (complex)?-yAnchor:element.global.y, element.width, element.height, element.xOffset, element.yOffset, element.dataWidth, element.dataHeight);
							}
							else{
								this.pencil.renderAt(context, node.data, (complex)?-xAnchor:element.global.x, (complex)?-yAnchor:element.global.y, element.width, element.height);
							}
						}
						node = null;
					}
				}
			}
			onScreen = null;
		}
			
		//debug outlines
		if(debug || element.showOutline === true){
			this.pencil.debugOutline(context, (complex)?-xAnchor:element.global.x, (complex)?-yAnchor:element.global.y, element.width, element.height, "magenta");
		}
		
		
		//element.onScreen = this.checkOnScreen(context, element, t, (complex)?xAnchor:-element.global.x, (complex)?yAnchor:-element.global.y);
		//runs post-render methods
		if(post) post(element);
			
		//Render Children
		if(element.children){
			if(element.children.length > 0) {
				var len = element.children.length;
				var li;
				for(li=0; li<len; li++){
					if(element.children[li] && !element.children[li].__skip){
						this.renderChild(context, element.children[li], complex, pre, post, t, debug);
					}
					else{
						this.pendingRemoval=1;
					}
				}
				len = li = null;
			}
		}
		if(element.postDraw) element.postDraw.call(element, context);
			
		//Restore
		if(!main){
			if(complex) t.restore();
			if(element.alpha != 1) this.pencil.alpha(context, 1/element.alpha);
		}
		else{
			t = null;
			if(callback) callback();
		}
	};

	Renderer.prototype.clear = function(context, x, y, width, height){
		this.pencil.clear(context, x,y,width,height);
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
		this.pendingRemoval = 0;
		this.pencil.reset(context);
		this.pencil.clip(context, 0, 0, context.canvas.width, context.canvas.height);
		this.renderChild(context, element, false, pre, post, null, debug, callback, true);
	};
	
	return new Renderer();
});