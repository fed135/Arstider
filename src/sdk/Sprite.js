/**
 * Sprite
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */
;(function(){

	/**
	 * Gets the proper frame X for current animation step
	 * @private
	 * @type {function}
	 * @param {Object} animSheet The animation sheet Object
	 * @param {number} currentFrame The frame to show
	 * @param {number} w The with of a single frame
	 * @param {number} h The height of a single frame
	 * @return {Array} Coordinates of the requested frame [x,y]
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
	 * Defines the Sprite module
	 */
	define( "Arstider/Sprite", ["Arstider/Entity"], /** @lends Sprite */ function (Entity) {

		/**
		 * Sprite constructor
		 * Animated sprite stage object
		 * @class Sprite
		 * @constructor
		 * @param {Object} props The list of properties
		 */
		function Sprite(props) {

			Arstider.Super(this, Entity, props);

			var thisRef = this;

			/**
			 * Current animation sequence
			 * @type {Sequence|null}
			 */
			this.currentAnim = Arstider.checkIn(props.currentAnim, null);
			/**
			 * Current animation frame
			 * @type {number}
			 */
			this.currentFrame = -1;
			/**
			 * Current step timer
			 * @private
			 * @type {number}
			 */
			this._stepTimer = setTimeout(function(){thisRef._step.apply(thisRef);}, Arstider._fullFPS); //wait 1 frame
		};

		Arstider.Inherit(Sprite, Entity);

		/**
		 * Kills the Sprite's Buffer(s).
		 * @type {function(this:Sprite)}
		 */
		Sprite.prototype.killBuffer = function(){
			this.stop();

			if(this.data.kill) this.data.kill();
			this.data = null;

			if(this.currentAnim && this.currentAnim.sheet.url && Arstider.bufferPool[this.currentAnim.sheet.url]) Arstider.bufferPool[this.currentAnim.sheet.url].kill();
		};


		/**
		 * Draws the current Sprite onto the canvas
		 * @private
		 * @type {function(this:Sprite)}
		 */
		Sprite.prototype._step = function() {

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
						else this.currentFrame = 0;

						for(i; i<len; i++){
							if(this.currentAnim.callbacks[i]){
								this.currentAnim.callbacks[i].apply(this);
							}
						}
					}
				}

				if(stopping === false){
					this._stepTimer = setTimeout(function(){thisRef._step(thisRef);}, this.currentAnim.time);
					this.showFrame(this.currentAnim.sheet,this.currentAnim.frames[this.currentFrame]);
				}
			}
			else{
				this._stepTimer = setTimeout(function(){thisRef._step(thisRef);}, (this.currentAnim)?this.currentAnim.time:1000);
			}
		};

		/**
		 * Displays a specific frame from the SpriteSheet
		 * @type {function(this:Sprite)}
		 * @param {SpriteSheet} animSheet The SpriteSheet to use
		 * @param {number} frameNum The id of the frame to show
		 * @return {Sprite} Returns self reference for chaining
		 */
		Sprite.prototype.showFrame = function(animSheet,frameNum){
			this.data = animSheet.data;
			if(animSheet.frames && animSheet.frames[frameNum]){
				this.dataWidth = animSheet.frames[frameNum][2] || animSheet.frameWidth || 0;
				this.dataHeight = animSheet.frames[frameNum][3] || animSheet.frameHeight || 0;
				this.xOffset = animSheet.frames[frameNum][0];
				this.yOffset = animSheet.frames[frameNum][1];
				return this;
			}
			
			if(animSheet.frameWidth != 0) this.width = animSheet.frameWidth;
			if(animSheet.frameHeight != 0) this.height = animSheet.frameHeight;

			var theFrame = getFrame(animSheet, frameNum, this.width, this.height);
			this.dataWidth = this.width;
			this.dataHeight = this.height;
			this.xOffset = theFrame[0];
			this.yOffset = theFrame[1];
			return this;
		};

		/**
		 * Stops the stepping.
		 * @type {function(this:Sprite)}
		 * @return {Sprite} Returns self reference for chaining
		 */
		Sprite.prototype.stop = Sprite.prototype.pause = function(){
			if(this._stepTimer != null) clearTimeout(this._stepTimer);
			this._stepTimer = null;
			return this;
		};

                /**
		 * Resumes the playing of the current Animation sheet
		 * @type {function(this:Sprite)}
		 * @return {Sprite} Returns self reference for chaining
		 */
                Sprite.prototype.resume = function(){
                    this.step(this);

                    return this;
                };

		/**
		 * Rewinds the current Animation sheet
		 * @type {function(this:Sprite)}
		 * @return {Sprite} Returns self reference for chaining
		 */
		Sprite.prototype.rewind = function(){
			this.stop();
			this.currentFrame = -1;
			this.resume();

			return this;
		};

		return Sprite;
	});
})();