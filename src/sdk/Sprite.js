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
	define( "Arstider/Sprite", ["Arstider/DisplayObject", "Arstider/GlobalTimers"], /** @lends Sprite */ function (DisplayObject, GlobalTimers) {

		/**
		 * Sprite constructor
		 * Animated sprite stage object
		 * @class Sprite
		 * @constructor
		 * @param {Object} props The list of properties
		 */
		function Sprite(props) {

			props = props || {};

			Arstider.Super(this, DisplayObject, props);

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
			 * Current step timer - gets reset every step
			 * @private
			 * @type {number}
			 */
			this.delay = 512;

			this.running = false;

			this.completed = false;

			this.stopped = false;

			GlobalTimers.push(this);
		};

		Arstider.Inherit(Sprite, DisplayObject);

		/**
		 * Kills the Sprite's Buffer(s).
		 * @type {function(this:Sprite)}
		 */
		Sprite.prototype.killBuffer = function(){
			this.kill();

			if(this.data && this.data.kill) this.data.kill();
			this.data = null;

			if(this.currentAnim && this.currentAnim.sheet.url && Arstider.bufferPool[this.currentAnim.sheet.url]) Arstider.bufferPool[this.currentAnim.sheet.url].kill();
		};

		Sprite.prototype.kill = function(){
			this.running = false;
			GlobalTimers.remove(this);
			return this;
		};

		Sprite.prototype.step = function(){
			if(this.currentAnim == null){
				this.delay = 512;
				this.running = false;
			}
			else{
				if(this.running == false && this.completed == false && this.stopped == false){
					this.running = true;
					this.delay = this.currentAnim.time;
				}
			}
		};

		/**
		 * Draws the current Sprite onto the canvas
		 * @private
		 * @type {function(this:Sprite)}
		 */
		Sprite.prototype.finish = function(){

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

						for(; i < len; i++){
							if(this.currentAnim.callbacks[i]) this.currentAnim.callbacks[i].call(this);
						}
					}
				}

				if(stopping === false){
					this.running = true;
					this.completed = false;
					this.delay = this.currentAnim.time;
					this.showFrame(this.currentAnim.sheet,this.currentAnim.frames[this.currentFrame]);
				}
			}
			else{
				this.running = true;
				this.completed = false;
				this.delay = this.currentAnim.time;
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

				this.width = this.dataWidth;
				this.height = this.dataHeight;

				this.xOffset = animSheet.frames[frameNum][0];
				this.yOffset = animSheet.frames[frameNum][1];
				return this;
			}

			if(animSheet.frameWidth != 0) this.width = animSheet.frameWidth;
			if(animSheet.frameHeight != 0) this.height = animSheet.frameHeight;

			var theFrame = getFrame(animSheet, frameNum, this.width, this.height);
			this.loadSection(animSheet.data, theFrame[0], theFrame[1], this.width, this.height);

			for (var i = this.currentAnim.frameCallbacks.length - 1; i >= 0; i--) {
				if(this.currentAnim.frameCallbacks[i]) this.currentAnim.frameCallbacks[i].call(this, frameNum);
			}

			return this;
		};

		/**
		 * Stops the stepping, rewinds.
		 * @type {function(this:Sprite)}
		 * @return {Sprite} Returns self reference for chaining
		 */
		Sprite.prototype.stop = function(){
			this.pause();
			this.currentFrame = -1;
			if(this.currentAnim != null) this.delay = this.currentAnim.time;
			else this.delay = 512;
			return this;
		};

		/**
		 * Pauses the stepping, will resume at the exact smae frame, with the exact same delay before the next step
		 * @type {function(this:Sprite)}
		 * @return {Sprite} Returns self reference for chaining
		 */
		Sprite.prototype.pause = function(){
			this.stopped = true;
			this.running = false;
			return this;
		};

        /**
		 * Resumes the playing of the current Animation sheet
		 * @type {function(this:Sprite)}
		 * @return {Sprite} Returns self reference for chaining
		 */
        Sprite.prototype.resume = function(){
        	GlobalTimers.push(this);
            this.running = true;
			this.completed = false;
			this.stopped = false;
			return this;
        };

		/**
		 * Rewinds the current Animation sheet
		 * @type {function(this:Sprite)}
		 * @return {Sprite} Returns self reference for chaining
		 */
		Sprite.prototype.rewind = function(){
			this.stop();
			this.resume();
			this.finish();
			return this;
		};

		return Sprite;
	});
})();