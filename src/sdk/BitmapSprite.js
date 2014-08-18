/**
 * BitmapSprite
 * @author Gilbert White <gilbertw@meetfidel.com>
 */
define( "Arstider/BitmapSprite",
[
	"Arstider/DisplayObject",
	"Arstider/sprites/SpritesheetManager"
], 
/** @lends BitmapSprite */
function (DisplayObject, SpriteSheetManager)
{
	Arstider.Inherit(BitmapSprite, DisplayObject);

	// Temporary single-use variables
	var _newFrame;
	var _stepFrame;
	var _rect;

	/**
	 * BitmapSprite constructor
	 * Animated sprite stage object
	 * @class BitmapSprite
	 * @constructor
	 * @param {Object} props The list of properties
	 */
	function BitmapSprite(props)
	{
		/**
		 * If props is undefined, use the Engine's empty object constant
		 */
		props = props || Arstider.emptyObject;	

		var context = this;

		// Collection of bitmaps
		this.bitmaps = {};

		// Get into SDK
		Arstider.Super(this, DisplayObject, props);
		// Go spritesheet?
		if(props.spritesheet)
		{
			SpriteSheetManager.get(props.spritesheet, {imagesAtlas:true}, function(spritesheet)
			{
				// First execution
				context._setSpritesheet(spritesheet);

				// Overrides?
				/*
				if(props.overrides)
				{
					// TODO
				}
				*/

				if(props.frame){
					context.gotoFrame(props.frame);
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
	BitmapSprite.prototype._setSpritesheet = function(spritesheet)
	{
		this.spritesheet = spritesheet;

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
	BitmapSprite.prototype.killBuffer = function()
	{
		
	};

	/**
	 * Go to a frame by it's image name
	 * @param  {[type]} frameName The image name omitting the extention, ie: "btnUp"
	 * @return {[type]}           [description]
	 */
	BitmapSprite.prototype.gotoFrame = function(frameName)
	{
		var frameData = this.spritesheet.getFrameByName(frameName);

		// Frame specific bitmap?
		if(frameData.image)
		{
			this._setImage(frameData.image)
		}

		this._setFrame(frameData);

		return this;
	};


	BitmapSprite.prototype._setFrame = function(frameData)
	{
		if(this.frame == frameData) return;
		this.frame = frameData;

		// Rectangle array [x, y, w, h]
		_rect = frameData.rect;

		if(!this.currentBitmap) return;

		// loadSection = function(url, x,y,w,h, success) 
		this.currentBitmap.alpha = 1;
		this.currentBitmap.loadSection(this.currentImageUrl, _rect[0], _rect[1], _rect[2], _rect[3]);
		this.width = _rect[2];
		this.height = _rect[3];
		
		if(frameData.origin)
		{
			this.currentBitmap.x = frameData.origin[0];
			this.currentBitmap.y = frameData.origin[1];
		}
		
	};

	BitmapSprite.prototype._setImage = function(imageUrl)
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
			this.currentBitmap.setIndex(0);
			this.bitmaps[imageUrl] = this.currentBitmap;
		}
	};


	

	return BitmapSprite;
});