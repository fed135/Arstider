/**
 * BitmapAnimation
 * @author Jo Simard <josimard@meetfidel.com>
 */
define( "Arstider/BitmapAnimation",
[
	"Arstider/DisplayObject",
	"Arstider/sprites/SpritesheetManager"
], 
/** @lends BitmapAnimation */
function (DisplayObject, SpriteSheetManager)
{
	Arstider.Inherit(BitmapAnimation, DisplayObject);

	// Temporary single-use variables
	var _newFrame;
	var _rect;

	/**
	 * BitmapAnimation constructor
	 * Animated sprite stage object
	 * @class BitmapAnimation
	 * @constructor
	 * @param {Object} props The list of properties
	 */
	function BitmapAnimation(props)
	{
		/**
		 * If props is undefined, use the Engine's empty object constant
		 */
		props = props || Arstider.emptyObject;	

		var context = this;

		// Default properties
		this.speed = Arstider.checkIn(props.speed, 1);
		this.loop = Arstider.checkIn(props.loop, true);

		// Default variables
		this.position = 0;
		this.isPlaying = true;
		this.nextAnim = null;
		this.nextAnimParams = null;

		// Collection of bitmaps
		this.bitmaps = {};

		// Get into SDK
		Arstider.Super(this, DisplayObject, props);

		// Go spritesheet?
		if(props.spritesheet)
		{
			SpriteSheetManager.get(props.spritesheet, props, function(spritesheet)
			{
				context._setSpritesheet(spritesheet);

				// Overrides?
				if(props.overrides)
				{
					// TODO
				}

				// Callback?
				if(props.onComplete) props.onComplete();
			});
		}
	};

	/**
	 * Handle a new spritesheet
	 * @type {function(this:Sprite)}
	 */
	BitmapAnimation.prototype._setSpritesheet = function(spritesheet)
	{
		this.spritesheet = spritesheet;

		var anim = this.nextAnim || spritesheet.defaultAnim;
		var animParams = (this.nextAnimParams) || null;

		if(anim)
		{
			this.gotoAnim(anim, animParams);
		}
	};
	
	/**
	 * Kills the DisplayObjects's Buffer(s).
	 * @type {function(this:Sprite)}
	 */
	BitmapAnimation.prototype.killBuffer = function()
	{
		this.stop();
	};



	/**
	 * Stops the stepping, rewinds.
	 * @type {function(this:BitmapAnimation)}
	 * @return {BitmapAnimation} Returns self reference for chaining
	 */
	BitmapAnimation.prototype.stop = function()
	{
		this.isPlaying = false;
		return this;
	};

	/**
	 * Pauses the stepping, will resume at the exact smae frame, with the exact same delay before the next step
	 * @type {function(this:BitmapAnimation)}
	 * @return {BitmapAnimation} Returns self reference for chaining
	 */
	BitmapAnimation.prototype.pause = function()
	{
		this.isPlaying = false;
		return this;
	};

    /**
	 * Resumes the playing of the current Animation sheet
	 * @type {function(this:BitmapAnimation)}
	 * @return {BitmapAnimation} Returns self reference for chaining
	 */
    BitmapAnimation.prototype.resume = function()
    {
    	this.isPlaying = false;
		return this;
    };


    /**
	 * Called each frame
	 * @param {Number} dt The delta time
	 */
	BitmapAnimation.prototype.update = function(dt)
	{
		if(!this.animation) return;

        /*if (Std.int(_newFrame) >= this.frames.length) {
            this.position = 0; //this.position % this.animation.duration;
        }*/

		if (this.isPlaying)
		{
			this.position += this.speed * dt/1000;

			_newFrame = this.position * this.animation.fps + 1;

			this.gotoFrame(_newFrame);
		}
	};

	/**
	 * Go to a specific animation or frame of the current animation
	 * @param {Object} frameOrAnim Animation name or frame number of current sequence
	 * @param {Object} params Additional parameters or specific frame number for anim name
	 * @type {function(this:BitmapAnimation)}
	 * @return {BitmapAnimation} Returns self reference for chaining
	 */
	BitmapAnimation.prototype.gotoAndPlay = function(frameOrAnim, params)
	{
		// Frame number
		if(frameOrAnim > 0)
		{
			this.gotoFrame(frameOrAnim)
		} else {
			this.gotoAnim(frameOrAnim, params);
		}
		this.isPlaying = true;

		return this;
	};

	/**
	 * Go to a specific animation or frame of the current animation, but stop
	 * @param {Object} frameOrAnim Animation name or frame number of current sequence
	 * @param {Object} params Additional parameters or specific frame number for anim name
	 * @type {function(this:BitmapAnimation)}
	 * @return {BitmapAnimation} Returns self reference for chaining
	 */
	BitmapAnimation.prototype.gotoAndStop = function(frameOrAnim, params)
	{
		this.gotoAndPlay(frameOrAnim, params);
		this.isPlaying = false;
		return this;
	};

	/**
	 * Set the playhead to a specific animation, should not be used directly: 
	 * gotoAndPlay() and gotoAndStop() should be used.
	 * @param {Object} animName Animation name 
	 * @param {Object} params Additional parameters or specific frame number for anim name
	 * @type {function(this:BitmapAnimation)}
	 * @return {BitmapAnimation} Returns self reference for chaining
	 */
	BitmapAnimation.prototype.gotoAnim = function(animName, params)
	{
		if(!this.spritesheet)
		{
			//console.log("BitmapAnimation.gotoAnim ERROR: no spritesheet loaded");
			this.nextAnim = animName;
			this.nextAnimParams = params;
			return this;
		}

		// Release next anim
		this.nextAnim = null;
		this.nextAnimParams = null;

		this.animName = animName;

		var animation = this.spritesheet.getAnim(animName);
		var frameNum = 1;
		if(params>1) frameNum = params;

		if(animation)
		{
			this.animation = animation;

			// Looping
			this.loop = true;
			if(animation.loop===false) this.loop = false;

			// Specific speed
			if(animation.speed>0) this.speed = animation.speed;

			// Set frames and position
			this.frames = animation.frames;
			this.position = (frameNum>1) ? frameNum/animation.frames : 0;

			// Additional parameters
			if(params)
			{
				if(params.next) this.nextAnim = params.next;
			}


			// Kick-in animation
			return this.gotoFrame(frameNum, params);

		} else {
			console.log("BitmapAnimation ERROR: anim '"+animName+"' not found.");
		}

		return this;
	};

	/**
	 * Set the playhead of the current animation, should not be used directly: 
	 * gotoAndPlay() and gotoAndStop() should be used.
	 * @param {Object} frame Frame number, first frame is "1"
	 * @param {Object} params Additional parameters
	 * @type {function(this:BitmapAnimation)}
	 * @return {BitmapAnimation} Returns self reference for chaining
	 */
	BitmapAnimation.prototype.gotoFrame = function(frame, params)
	{
		if(!frame) frame=1;

		//this.position = frame / this.frames.length;
		_newFrame = parseInt(frame);

		if(_newFrame==this.currentFrame) return;
		this.currentFrame = _newFrame;
		
		// Last frame?
		if (this.currentFrame >= this.frames.length)
		{
			// Next chained anim?
			if(this.nextAnim)
			{
				this.gotoAnim(this.nextAnim, this.nextAnimParams);
			}
			// Stop?
			else if (!this.loop || this.frames.length<=1)
			{
				this.currentFrame = this.frames.length;
				stop();
			} 
			// Loop
			else {
				this.currentFrame = 1;
				this.position = 0;
			}

			// Anim complete signal
			//animComplete.emit(this);
		}

		_newFrame = this.frames[this.currentFrame-1];

		// Frame specific bitmap?
		if(_newFrame.image)
		{
			this._setImage(_newFrame.image)
		}

		this._setFrame(_newFrame);

		// Additional parameters
		if(params)
		{
			if(params.loop===true || params.loop===false) this.loop = params.loop;
			if(params.speed>0) this.speed = params.speed;
		}

		return this;
	};

	BitmapAnimation.prototype._setFrame = function(frameData)
	{
		if(this.frame == frameData) return;
		this.frame = frameData;

		// Rectangle array [x, y, w, h]
		_rect = frameData.rect;

		if(!this.currentBitmap) return;

		// loadSection = function(url, x,y,w,h, success) 
		this.currentBitmap.alpha = 1;
		this.currentBitmap.loadSection(this.currentImageUrl, _rect[0], _rect[1], _rect[2], _rect[3]);

		if(frameData.origin)
		{
			this.currentBitmap.x = frameData.origin[0];
			this.currentBitmap.y = frameData.origin[1];
		}
		
	};

	BitmapAnimation.prototype._setImage = function(imageUrl)
	{
		if(this.currentImageUrl == imageUrl) return;
		this.currentImageUrl = imageUrl;

		if(this.currentBitmap)
		{
			this.currentBitmap.alpha = 0;
			this.currentBitmap = null;
		}

		this.currentBitmap = this.bitmaps[imageUrl];

		if(!this.currentBitmap)
		{
			this.currentBitmap = new DisplayObject();
			this.addChild(this.currentBitmap);
			this.bitmaps[imageUrl] = this.currentBitmap;
		}
	};


	

	return BitmapAnimation;
});