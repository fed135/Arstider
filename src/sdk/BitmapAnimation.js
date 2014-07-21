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
	var _stepFrame;
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
		this.isPlaying = true;

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

		if (this.isPlaying)
		{
			_stepFrame = (dt/1000 * this.animation.fps) * this.speed;

			this.gotoFrame(this.currentFrame + _stepFrame);

			// Last frame reached?
			if(this.currentFrame >= this.frames.length)
			{
				this._onAnimComplete();
			}
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
			this.playlist = null;
			this.gotoFrame(frameOrAnim)
		} 
		// Animation name
		else if(typeof(frameOrAnim)=="string")
		{
			this.playlist = null;
			this.gotoAnim(frameOrAnim, params);
		}
		// Playlist animation names
		else if(frameOrAnim.length>0)
		{
			this.playlist = frameOrAnim;
			this._next(params);
		}
		this.isPlaying = true;

		return this;
	};

	/**
	 * [next description]
	 * @param  {[type]}   params
	 * @return {Function}
	 */
	BitmapAnimation.prototype._next = function(params)
	{
		if(!this.playlist || this.playlist.length<=0) return;

		var animName = this.playlist.shift();

		this.gotoAnim(animName, params);

		if(this.playlist.length<=0)
		{
			this.playlist = null;
		}

		// TODO: Playlist complete event
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
			//if(animation.speed>0) this.speed = animation.speed;

			// Set frames
			this.frames = animation.frames;

			// Additional parameters
			if(params)
			{
				if(params.next) this.nextAnim = params.next;
				if(params.loop===true || params.loop===false) this.loop = params.loop;
			}

			// Kick-in animation
			return this.gotoFrame(frameNum);

		} else {
			console.log("BitmapAnimation ERROR: anim '"+animName+"' not found.");
		}

		return this;
	};

	/**
	 * Set the playhead of the current animation, should not be used directly: 
	 * gotoAndPlay() and gotoAndStop() should be used.
	 * @param {Object} frame Frame number, first frame BASE "1"
	 * @param {Object} params Additional parameters
	 * @type {function(this:BitmapAnimation)}
	 * @return {BitmapAnimation} Returns self reference for chaining
	 */
	BitmapAnimation.prototype.gotoFrame = function(frame)
	{
		if(!frame) frame=1;

		// Min/max
		if(frame<1) frame=1;
		if(frame>this.frames.length) frame = this.frames.length;

		// Need to change?
		if(frame==this.currentFrame) return;
		this.currentFrame = frame;

		// First frame is one
		_newFrame = this.frames[Math.round(frame)-1];

		// Frame specific bitmap?
		if(_newFrame.image)
		{
			this._setImage(_newFrame.image)
		}

		this._setFrame(_newFrame);

		return this;
	};


	BitmapAnimation.prototype._onAnimComplete = function()
	{
		// Playlist to proceed?
		if(this.playlist)
		{
			this._next();
		}
		// Next chained anim?
		else if(this.nextAnim)
		{
			this.gotoAnim(this.nextAnim, this.nextAnimParams);
			// Release next anim
			this.nextAnim = null;
			this.nextAnimParams = null;

		}
		// Stop?
		else if (!this.loop || this.frames.length<=1)
		{
			this.currentFrame = this.frames.length;
			this.stop();
		} 
		// Loop
		else {
			this.currentFrame = 0;
		}

		// Anim complete signal
		//animComplete.emit(this);
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