;(function(){
	
	var 
		degToRad = Math.PI/180,
		defaultComposition = "source-over",
		engRef = null,
		singleton = null,
		defaultShadowColor = "transparent"
	;
	
	/**
	 * AMD Closure
	 */	
		define( "Arstider/core/Renderer", ["Arstider/Sprite", "Arstider/DisplayObject", "Arstider/TextField", "Arstider/core/Performance"], function (Sprite, DisplayObject, TextField, Performance){
			
			if(singleton != null) return singleton;
			
			function renderChild(curChild,curX,curY,ctx,pre,post,showBoxes){
				
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
				
				if(curChild.draw) curChild.draw();
				
				if(curChild.alpha <= 0) return;
				
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
				if(curChild.global && curChild.parent){
					curChild.global.x = curX;
					curChild.global.y = curY;
					curChild.global.scaleX = curChild.scaleX * curChild.parent.scaleX;
					curChild.global.scaleY = curChild.scaleY * curChild.parent.scaleY;
					curChild.global.width = curChild.width * curChild.global.scaleX;
					curChild.global.height = curChild.height * curChild.global.scaleY;
					curChild.global.rotation = curChild.rotation + curChild.parent.rotation;
					curChild.global.alpha = curChild.alpha * curChild.parent.alpha;
				}
				
				//Shadow
				if(curChild.shadowColor != defaultShadowColor){
					
					//save old properties
					oldShadowColor = ctx.shadowColor;
					oldShadowBlur = ctx.shadowBlur;
					oldShadowOffsetX = ctx.shadowOffsetX;
					oldShadowOffsetY = ctx.shadowOffsetY;
					
					ctx.shadowColor = curChild.shadowColor;
					ctx.shadowBlur = curChild.shadowBlur;
					ctx.shadowOffsetX = curChild.shadowOffsetX;
					ctx.shadowOffsetY = curChild.shadowOffsetY;
				}
				
				//Render
				if(curChild.data){
					Performance.draws++;
					if(curChild.data.pattern){
						prevFill = ctx.fillStyle;
						ctx.fillStyle = curChild.data.pattern;
						ctx.fillRect(Math.round(curX), Math.round(curY), curChild.width, curChild.height);
						ctx.fillStyle = prevFill;
					}
					else{
						//instanceof is pretty fast,  we want to leverage data offset rather than having an extra buffer for sprites.
						if(curChild instanceof Sprite || curChild.largeData === true){
							ctx.drawImage(curChild.data, curChild.xOffset, curChild.yOffset, curChild.dataWidth, curChild.dataHeight, Math.round(curX), Math.round(curY), curChild.width, curChild.height);
						}
						else{
							ctx.drawImage(curChild.data, Math.round(curX), Math.round(curY), curChild.width, curChild.height);
						}
					}
				}
				
				if(showBoxes || curChild._showDebugBox === true){
					shadowSafe = ctx.shadowColor;
					ctx.shadowColor = "transparent";
					var prevAlpha = ctx.globalAlpha;
					ctx.globalAlpha = 0.7;
					ctx.lineWidth = 1;
					if(curChild instanceof Sprite) ctx.strokeStyle = "blue";
					else if(curChild instanceof TextField) ctx.strokeStyle = "green";
					else if(curChild instanceof DisplayObject) ctx.strokeStyle = "red";
					else ctx.strokeStyle = "yellow";
					
					ctx.strokeRect(Math.round(curX), Math.round(curY), curChild.width, curChild.height);
					ctx.globalAlpha = prevAlpha;
					ctx.shadowColor = shadowSafe;
				}
				
				//runs post-render methods
				if(post) post(curChild);
				
				//Render Children
				if(curChild.children){
					if(curChild.children.length > 0) {
						len = curChild.children.length;
						/*for(li=0; li<len; li++){
							renderChild(curChild.children[li],curX,curY,ctx,pre,post,showBoxes);
						}*/
						for(li=0; li<len; li++){
							if(curChild.children[li]){
								renderChild(curChild.children[li],curX,curY,ctx,pre,post,showBoxes);
							}
						}
					}
				}
				
				//Restore
				if(oldAlpha !== null) ctx.globalAlpha = oldAlpha;
				if(curChild.compositeMode != defaultComposition) ctx.globalCompositeOperation = defaultComposition;
				if(isComplex) ctx.restore();
				else{
					if(curChild.shadowColor != defaultShadowColor){
						ctx.shadowColor =oldShadowColor;
						ctx.shadowBlur = oldShadowBlur;
						ctx.shadowOffsetX = oldShadowOffsetX;
						ctx.shadowOffsetY = oldShadowOffsetY;
					}
				}
			}
			
			
			//Module construction
			function Renderer(){}
			
			Renderer.prototype.draw = function(eng, rootChild, pre, post, showBoxes){
				engRef = eng;
				renderChild(rootChild,0,0,eng.context,pre,post, showBoxes);
				Performance.frames++;
			};
			
			singleton = new Renderer();
			return singleton;
			
		});
})();