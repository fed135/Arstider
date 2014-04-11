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
		define( "Arstider/Sprite", ["Arstider/Entity"], function (Entity) {
		
			/**
			 * Creates an instance of Sprite.
			 *
			 * @constructor
			 * @this {Sprite}
			 * @param {string} name The desired name of the display object. Uses timestamp if empty : not recommended
			 */
			function Sprite(props) { 
				
				Arstider.Super(this, Entity, props);
				
				//Self reference for stepping 
				var thisRef = this;
				
				//Animation Sheet
				this.currentAnim = Arstider.checkIn(props.currentAnim, null);
				//Current animation frame
				this.currentFrame = -1;
				//Animation timer
				this.stepTimer = setTimeout(function(){thisRef.step.apply(thisRef);}, Arstider._fullFPS); //wait 1 frame
			};
			
			Arstider.Inherit(Sprite, Entity);
			
			/**
			 * Kills the Sprite's Buffer(s).
			 *
			 * @this {Sprite}
			 */
			Sprite.prototype.killBuffer = function(){
				if(this.data.kill) this.data.kill();
				
				this.data = null;
				
				if(this.stepTimer != null) clearTimeout(this.stepTimer);
				
				if(this.currentAnim && this.currentAnim.sheet.url && Arstider.bufferPool[this.currentAnim.sheet.url]) Arstider.bufferPool[this.currentAnim.sheet.url].kill();
			};
			
			
			/**
			 * Draws the current Sprite onto the canvas
			 *
			 * @this {Sprite}
			 * @param {Canvas2dContext} ctx The desired context to which the Sprite should be rendered in.
			 */
			Sprite.prototype.step = function() {
				
				var stopping = false, i = 0, len = null, thisRef = this;
				
				if(this.currentAnim !== null && this.currentAnim.sheet.data !== null){
					//Run animation logic
					len = this.currentAnim.callbacks.length;
					
					this.currentFrame++;
					if(this.currentFrame > this.currentAnim.frames.length -1){
						
						this.currentAnim.loops++;
						
						if(this.currentAnim.chainedAnim != null){
							this.currentAnim = this.currentAnim.chainedAnim;
							this.currentFrame = 0;
						}
						else{
							if(this.currentAnim.stop < this.currentAnim.loops && this.currentAnim.stop !== -1){
								this.currentFrame--;
								stopping = true;
								this.stop();
							}
							else{
								this.currentFrame = 0;
							}
							
							for(i; i<len; i++){
								if(this.currentAnim.callbacks[i]){
									this.currentAnim.callbacks[i].apply(this);
								}
							}
						}
					}
					
					if(stopping === false){
						this.stepTimer = setTimeout(function(){thisRef.step(thisRef);}, this.currentAnim.time);
						this.showFrame(this.currentAnim.sheet,this.currentAnim.frames[this.currentFrame]);
					}
				}
				else{
					this.stepTimer = setTimeout(function(){thisRef.step(thisRef);}, (this.currentAnim)?this.currentAnim.time:1000);
				}
			};
			
			Sprite.prototype.showFrame = function(animSheet,frameNum){
				this.data = animSheet.data;
				if(animSheet.frameWidth != 0){
					this.width = animSheet.frameWidth;
				}
				if(animSheet.frameHeight != 0){
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