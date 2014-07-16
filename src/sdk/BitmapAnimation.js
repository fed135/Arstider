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

		// Collection of bitmaps
		this.bitmaps = {};

		// Get into SDK
		Arstider.Super(this, DisplayObject, props);

		// Go spritesheet?
		if(props.spritesheet)
		{
			SpriteSheetManager.get(props.spritesheet, props, function(spritesheet) {
				context.setSpritesheet(spritesheet)
			});
		}
	};

	/**
	 * Handle a new spritesheet
	 * @type {function(this:Sprite)}
	 */
	BitmapAnimation.prototype.setSpritesheet = function(spritesheet)
	{
		console.log(spritesheet);

		this.spritesheet = spritesheet;

		if(spritesheet.defaultAnim)
		{
			this.gotoAnim(spritesheet.defaultAnim);
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
	 * Go to a specific animation or frame of the current animation
	 * @param {Object} frameOrAnim Animation name or frame number of current sequence
	 * @param {Object} params Additional parameters or specific frame number for anim name
	 * @type {function(this:BitmapAnimation)}
	 * @return {BitmapAnimation} Returns self reference for chaining
	 */
	BitmapAnimation.prototype.gotoAndPlay = function(frameOrAnim, params)
	{
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
			console.log("BitmapAnimation.gotoAnim ERROR: no spritesheet loaded");
			return this;
		}

		var anim = this.spritesheet.getAnim(animName);
		var frameNum = 1;
		if(params>1) frameNum = params;

		if(anim)
		{
			this.currentAnimation = anim;
			this.frames = anim.frames;
			this.position = (frameNum>1) ? frameNum/anim.frames : 0;
			this.gotoFrame(frameNum);

		} else {
			console.log("BitmapAnimation.gotoAnim ERROR: anim not found '"+animName+"'");
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
			// Stop?
			if (!this.loop || this.frames.length<=1)
			{
				this.currentFrame = this.frames.length;
				stop();
			} 
			// Loop
			else {
				this.currentFrame = 1;
				this.position = 0;
			}
			//animComplete.emit(this);
		}

		_newFrame = this.frames[this.currentFrame-1];

		// Frame specific bitmap?
		if(_newFrame.image)
		{
			this.setImage(_newFrame.image)
		}

		this.setFrame(_newFrame);

	};

	BitmapAnimation.prototype.update = function(dt)
	{
		if(!this.currentAnimation) return;

        /*if (Std.int(_newFrame) >= this.frames.length) {
            this.position = 0; //this.position % this.currentAnimation.duration;
        }*/

		if (this.isPlaying)
		{
			this.position += this.speed * dt/1000;

			_newFrame = this.position * this.currentAnimation.fps + 1;

			this.gotoFrame(_newFrame);
		}
	};

	BitmapAnimation.prototype.setFrame = function(frameData)
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

	BitmapAnimation.prototype.setImage = function(imageUrl)
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