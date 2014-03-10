/**
 * Sprite Object Wrapper. 
 * 
 * Provides common private variables and methods for the Sprite as well as
 * AMD Closure and prototypes.
 *
 * @author frederic charette <fredc@meetfidel.com>
 */
;(function(){
	/**
	 * Gets the proper frame X for current animation step
	 * 
	 * @private
	 */
	function getFrame(animSheet, currentFrame, w, h){
		
		var ret = [0,0], dist = (w*currentFrame);
		
		while(dist >= animSheet.data.width){
			dist-= animSheet.data.width;
			ret[1] += h;
		}
		ret[0] += dist;
		return ret;
	}
	
	/**
	 * AMD Closure
	 */	
		define( "Arstider/Sprite", ["Arstider/Buffer", "Arstider/Entity"], function (Buffer, Entity) {
		
			/**
			 * Creates an instance of Sprite.
			 *
			 * @constructor
			 * @this {Sprite}
			 * @param {string} name The desired name of the display object. Uses timestamp if empty : not recommended
			 */
			function Sprite(name) { 
				
				Arstider.Super(this, name);
				
				//Self reference for stepping 
				var thisRef = this;
				
				//Animation Sheet
				this.currentAnim = null;
				//Current animation frame
				this.currentFrame = -1;
				//Animation timer
				this.stepTimer = setTimeout(function(){thisRef.step(thisRef);}, Arstider._fullFPS); //wait 1 frame
			};
			
			Arstider.Inherit(Sprite, Entity);
			
			/**
			 * Kills the Sprite's Buffer(s).
			 *
			 * @this {Sprite}
			 */
			Sprite.prototype.killBuffer = function(){
				this.data = null;
				this.dataCtx = null;
				if(this.stepTimer != null){
					clearTimeout(this.stepTimer);
				}
				Buffer.kill(this.name);
				
				if(this.currentAnim){
					Buffer.kill(this.currentAnim.sheet.url);
				}
			};
			
			
			/**
			 * Draws the current Sprite onto the canvas
			 *
			 * @this {Sprite}
			 * @param {Canvas2dContext} ctx The desired context to which the Sprite should be rendered in.
			 */
			Sprite.prototype.step = function(thisRef) {
				
				var stopping = false, i = 0, len = null;
				
				if(thisRef.currentAnim !== null && thisRef.currentAnim.sheet.data !== null){
					//Run animation logic
					len = thisRef.currentAnim.callbacks.length;
					
					thisRef.currentFrame++;
					if(thisRef.currentFrame > thisRef.currentAnim.frames.length -1){
						
						thisRef.currentAnim.loops++;
						
						if(thisRef.currentAnim.chainedAnim != null){
							thisRef.currentAnim = thisRef.currentAnim.chainedAnim;
							thisRef.currentFrame = 0;
						}
						else{
							if(thisRef.currentAnim.stop < thisRef.currentAnim.loops && thisRef.currentAnim.stop !== -1){
								thisRef.currentFrame--;
								stopping = true;
								thisRef.stop();
							}
							else{
								thisRef.currentFrame = 0;
							}
							
							for(i; i<len; i++){
								if(thisRef.currentAnim.callbacks[i]){
									thisRef.currentAnim.callbacks[i](thisRef);
								}
							}
						}
					}
					
					if(stopping === false){
						thisRef.stepTimer = setTimeout(function(){thisRef.step(thisRef);}, thisRef.currentAnim.time);
						thisRef.showFrame(thisRef.currentAnim.sheet,thisRef.currentAnim.frames[thisRef.currentFrame]);
					}
				}
				else{
					thisRef.stepTimer = setTimeout(function(){thisRef.step(thisRef);}, (thisRef.currentAnim)?thisRef.currentAnim.time:1000);
				}
			};
			
			Sprite.prototype.showFrame = function(animSheet,frameNum){
				this.data = animSheet.data;
				if(animSheet.frameWidth){
					this.width = animSheet.frameWidth;
				}
				if(animSheet.frameHeight){
					this.height = animSheet.frameHeight;
				}
				var theFrame = getFrame(animSheet, frameNum, this.width, this.height);
				this.dataWidth = this.width;
				this.dataHeight = this.height;
				this.xOffset = theFrame[0];
				this.yOffset = theFrame[1];
			};
			
			/**
			 * Stops the stepping.
			 *
			 * @this {Sprite}
			 */
			Sprite.prototype.stop = function(){
				if(this.stepTimer != null){
					clearTimeout(this.stepTimer);
				}
			};
			
			/**
			 * Rewinds the current Animation sheet
			 *
			 * @this {Sprite}
			 * @returns {Sprite} Returns self reference
			 */
			Sprite.prototype.rewind = function(){
				this.stop();
				this.currentFrame = -1;
				this.step(this);
				
				return this;
			};
			
			return Sprite; 
		});
})();