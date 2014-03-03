;(function(){
	
	var degToRad = Math.PI/180;
	var fctCheck = "function";
	var defaultComposition = "source-over";
	var engRef = null;
	var singleton = null;
	
	/**
	 * AMD Closure
	 */	
		define( "Arstider/core/Renderer", ["Arstider/Sprite", "Arstider/DisplayObject", "Arstider/TextField", "Arstider/core/Performance"], function (Sprite, DisplayObject, TextField, Performance){
			
			if(singleton != null) return singleton;
			
			function renderChild(curChild,curX,curY,ctx,pre,post,skip,showBoxes){
				
				if(!curChild) return;
				
				var 
					isComplex = false,	//Determines if geometrical transformations have been applied
					oldAlpha = null,	//Stores the old alpha of the context, if need be
					li = null,			//To loop through the element's children, if need be
					len = null
				;
				
				Performance.elements++;
				
				if(curChild.alpha <= 0) return;
				
				if(!skip){
					if(typeof curChild.update === fctCheck) curChild.update();
				}
				
				if(
					(curChild.scaleX != 1) ||
					(curChild.scaleY != 1) ||
					(curChild.rotation != 0) ||
					(curChild.skewX != 0) ||
					(curChild.skewY != 0)
					) {
					
					isComplex = true;
					ctx.save();
				}
				
				if(curChild.alpha != 1) {
					oldAlpha = ctx.globalAlpha;
					ctx.globalAlpha *= curChild.alpha;
				}
				
				curX += curChild.x;
				curY += curChild.y;
				
				if(isComplex) {
					ctx.translate(curX+ (curChild.width * curChild.rpX),curY+ (curChild.height * curChild.rpY));
					curX = -(curChild.width * curChild.rpX);
					curY = -(curChild.height * curChild.rpY);
				}
				
				//Scale
				if((curChild.scaleX != 1) || (curChild.scaleY != 1)){
					ctx.scale(curChild.scaleX, curChild.scaleY);
					Performance.transforms++;
				}
				//Rotation
				if (curChild.rotation != 0){
					ctx.rotate(curChild.rotation*degToRad);
					Performance.transforms++;
				}
				//Skey X
				if (curChild.skewX){
					ctx.transform(1, 0, curChild.skewX, 1, 0, 0);
					Performance.transforms++;
				}
				//Skew Y
				if (curChild.skewY){
					ctx.transform(1, curChild.skewY, 0, 1, 0, 0);
					Performance.transforms++;
				}
				
				//Runs pre-render method:
				if(pre) pre(curChild);
				
				if(curChild.compositeMode != defaultComposition) ctx.globalCompositeOperation = curChild.compositeMode;
				
				if(curChild.mask === true) ctx.globalCompositeOperation = "destination-in";
				
				//Update globals
				curChild.global.x = curX;
				curChild.global.y = curY;
				curChild.global.scaleX = curChild.scaleX * curChild.parent.scaleX;
				curChild.global.scaleY = curChild.scaleY * curChild.parent.scaleY;
				curChild.global.rotation = curChild.rotation + curChild.parent.rotation;
				curChild.global.alpha = curChild.alpha * curChild.parent.alpha;
				
				//Render
				if(curChild.data && curChild.data != null){
					Performance.draws++;
					//instanceof is pretty fast,  we want to leverage data offset rather than having an extra buffer for sprites.
					if(curChild instanceof Sprite || curChild.largeData === true){
						ctx.drawImage(curChild.data, curChild.xOffset, curChild.yOffset, curChild.dataWidth, curChild.dataHeight, Math.round(curX), Math.round(curY), curChild.width, curChild.height);
					}
					else{
						ctx.drawImage(curChild.data, Math.round(curX), Math.round(curY), curChild.width, curChild.height);
					}
				}
				
				if(showBoxes || curChild.showDebugBox === true){
					var prevAlpha = ctx.globalAlpha;
					ctx.globalAlpha = 0.5;
					if(curChild instanceof Sprite) ctx.strokeStyle = "blue";
					else if(curChild instanceof TextField) ctx.strokeStyle = "green";
					else if(curChild instanceof DisplayObject) ctx.strokeStyle = "red";
					else ctx.strokeStyle = "yellow";
					
					ctx.strokeRect(Math.round(curX), Math.round(curY), curChild.width, curChild.height);
					ctx.globalAlpha = prevAlpha;
				}
				
				//runs post-render methods
				if(post) post(curChild);
				
				//Render Children
				if(curChild.children){
					if(curChild.children.length > 0) {
						len = curChild.children.length;
						for(li=0; li<len; li++){
							renderChild(curChild.children[li],curX,curY,ctx,pre,post,skip,showBoxes);
						}
					}
				}
				
				//Restore
				if(oldAlpha !== null) ctx.globalAlpha = oldAlpha;
				if(curChild.compositeMode != defaultComposition) ctx.globalCompositeOperation = defaultComposition;
				if(isComplex) ctx.restore();
			}
			
			
			//Module construction
			function Renderer(){}
			
			Renderer.prototype.draw = function(eng, pre, post, skip, showBoxes){
				engRef = eng;
				if(eng.currentScreen) renderChild(eng.currentScreen,0,0,eng.context,pre,post,skip, showBoxes);
				Performance.frames++;
			};
			
			singleton = new Renderer();
			return singleton;
			
		});
})();