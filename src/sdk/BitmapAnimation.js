/**
 * BitmapAnimation
 * @author Jo Simard <josimard@meetfidel.com>
 */
define( "Arstider/BitmapAnimation",
[
	"Arstider/DisplayObject",
	"Arstider/sprites/SpritesheetManager",
	"Arstider/Signal"
], 
/** @lends BitmapAnimation */
function (DisplayObject, SpriteSheetManager, Signal)
{
	Arstider.Inherit(BitmapAnimation, DisplayObject);

	// Temporary single-use variables
	var _newFrame;
	var _frameStep;
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

		// Signals
		this.animCompleteSignal = new Signal();
		this.frameChangeSignal = new Signal();
		this.onReadySignal = new Signal();

		// Default variables
		this.isPlaying = true;

		// Collection of bitmaps
		this.bitmaps = {};

		// Default RPX+RPY (origin)
		//this.rpX = this.rpY = 0.5;

		// Get into SDK
		Arstider.Super(this, DisplayObject, props);

		// Go spritesheet?
		if(props.spritesheet)
		{
			SpriteSheetManager.get(props.spritesheet, props, function(spritesheet)
			{
				context._setSpritesheet(spritesheet);

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

		// Spritesheet specific bitmap?
		if(spritesheet.imageUrl)
		{
			this._setImage(spritesheet.imageUrl)
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
	 * To check if we have a specific anim in it's spritesheet
	 * @param  {String}  animName The animation name
	 * @return {Boolean}
	 */
	BitmapAnimation.prototype.hasAnim = function(animName)
	{
		if(!this.spritesheet) return false;
		if(this.spritesheet.getAnim(animName)) return true;
		return false;
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
    	this.isPlaying = true;
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
			_frameStep = (dt/1000 * this.animation.fps) * this.speed;

			this.gotoFrame(this.animPosition + _frameStep);

			// Last frame reached?
			if(this.animPosition-1 + _frameStep > this.frames.length)
			{
				this._onAnimComplete();
			}
		}

		if(!this.isReady)
		{
			this.isReady = true;
			this.onReadySignal.dispatch();
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
		var waitForTimedAnim = ( this.timedAnim && !(params && !params.force) );

		if(!this.spritesheet || waitForTimedAnim )
		{
			if(waitForTimedAnim && animName==this.timedAnim) return;

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

			// No fps in animation, set to spritesheet fps
			if(!animation.fps) animation.fps = this.spritesheet.fps;

			// Clear next anim time
			clearTimeout(this.nextTimeout);
			this.timedAnim = null;

			// Animation specific bitmap?
			if(animation.image)
			{
				this._setImage(animation.image)
			}

			// Looping
			this.loopCurrentAnim = this.loop;
			if(animation.loop || animation.loop===false) this.loopCurrentAnim = animation.loop;

			// Specific speed
			//if(animation.speed>0) this.speed = animation.speed;

			// Set frames
			this.frames = animation.frames;

			// Additional parameters
			if(params)
			{
				// Play anim for a certain time?
				if(params.time>0)
				{
					this.timedAnim = animName;
					this.nextTimeout = setTimeout(this._onTimedAnimComplete.bind(this), params.time);
					if(!params.next) params.next = this.defaultAnim;
				}

				if(params.next) this.nextAnim = params.next;
				if(params.loop===true || params.loop===false) this.loopCurrentAnim = params.loop;
			}

			// Kick-in animation
			this.currentFrame = this.animPosition = 0;
			return this.gotoFrame(frameNum);

		}
		// Anim not found
		else
		{
			console.error("BitmapAnimation: anim '"+animName+"' not found.");

			//this.frame = null;
			//this.gotoAnim(this.defaultAnim, params);
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
	BitmapAnimation.prototype.gotoFrame = function(frame, force)
	{
		if(!frame) frame=1;

		// Need to change?
		if(frame==this.animPosition && !force) return;
		this.animPosition = frame;

		// Current frame index
		this.currentFrame = Math.floor(frame);

		// Min/max
		if(this.currentFrame<1) this.currentFrame=1;
		if(this.currentFrame>this.frames.length) this.currentFrame = this.frames.length;

		// First frame is one
		_newFrame = this.frames[this.currentFrame-1];

		
		// Frame specific bitmap?
		if(_newFrame.image && _newFrame.image != this.currentImageUrl)
		{
			this._setImage(_newFrame.image)
		} else {
			this._setFrame(_newFrame, force);
		}


		return this;
	};


	BitmapAnimation.prototype._onTimedAnimComplete = function()
	{
		this.timedAnim = null;
		this.nextTimeout = null;
		this._onAnimComplete();
	}

	BitmapAnimation.prototype._onAnimComplete = function()
	{
		var animName = this.animation.name;

		//console.log("Anim complete: "+animName, this.loopCurrentAnim);

		// Playlist to proceed?
		if(this.playlist)
		{
			this._next();
		}
		// Next chained anim?
		else if(this.nextAnim && !this.timedAnim)
		{
			//console.log(this.nextAnim, this.nextAnimParams);
			this.gotoAnim(this.nextAnim, this.nextAnimParams);
			// Release next anim
			this.nextAnim = null;
			this.nextAnimParams = null;
		}
		// Stop?
		else if (!this.loopCurrentAnim || this.frames.length<=1)
		{
			this.currentFrame = this.frames.length;
			this.stop();
		} 
		// Loop
		else {
			this.currentFrame = this.animPosition = 1;
		}

		// Anim complete signal
		this.animCompleteSignal.dispatch(animName, this);
	};



	BitmapAnimation.prototype._setFrame = function(frameData, force)
	{
		if(this.frame == frameData && !force) return;
		this.frame = frameData;

		// Rectangle array [x, y, w, h]
		_rect = frameData.rect;

		// No image to draw?
		if(!this.currentBitmap) return;

		
		this.currentBitmap.alpha = 1;

		/* DisplayObject.loadSection 
		loadSection = function(url, x,y,w,h, success) 
		this.currentBitmap.loadSection(this.currentImageUrl, _rect[0], _rect[1], _rect[2], _rect[3]); */

		/* MANUAL DisplayObject.loadSection */
		this.currentBitmap.width = this.currentBitmap.dataWidth = _rect[2];
		this.currentBitmap.height = this.currentBitmap.dataHeight = _rect[3];
		//this.currentBitmap.loadBitmap(this.currentImageUrl);
		this.currentBitmap.largeData = true;
		this.currentBitmap.xOffset = _rect[0];
		this.currentBitmap.yOffset = _rect[1];

		// Offset bitmap to fit origin point
		if(frameData.origin)
		{
			this.currentBitmap.x = frameData.origin[0];
			this.currentBitmap.y = frameData.origin[1];
		}

		// Set BitmapAnimation variables for outside use
		/*this.width = _rect[2];
		this.height = _rect[3];*/

		// Got original source size?
		if(frameData.sourceSize)
		{
			this.dataWidth = frameData.sourceSize[0];
			this.dataHeight = frameData.sourceSize[1];
		}
		
		this.frameChangeSignal.dispatch(this.frame, this);
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
			this.currentBitmap = new DisplayObject({bitmap:imageUrl});
			this.addChild(this.currentBitmap);
			this.bitmaps[imageUrl] = this.currentBitmap;
		}

		// Check spritesheet if needed
		//this.addChild(new DisplayObject({bitmap:imageUrl}));

		this.gotoFrame(this.currentFrame, true);
	};


	

	return BitmapAnimation;
});