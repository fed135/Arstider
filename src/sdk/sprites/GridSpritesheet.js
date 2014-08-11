/**
 * Grid spritesheet model for original SDK2 Spritesheets
 *
 * Example JSON Data:
 * http://pastie.org/9415012
 *
 * @author Jo Simard <josimard@meetfidel.com>
 *
 */
define("Arstider/sprites/GridSpritesheet",
[
	"Arstider/Bitmap"
],
function (Bitmap)
{
	/**
	 * GridSpritesheet constructor
	 * @class GridSpritesheet
	 * @constructor
	 * @param {Object} data
	 */
	function GridSpritesheet(data, params, fileInfo, onComplete)
	{
		this.data = data;

		if(!params) params = {};

		// defaults
		this.name = params.name;
		this.defaultAnim = params.defaultAnim;
		this.fps = (params.fps>0) ? params.fps : 15;
		this.animations = {};
		this.path = fileInfo.path;
		this.onComplete = onComplete;

		// Parse the JSON data to fill animations
		this.parseJSON(data, fileInfo.path);
	};


	GridSpritesheet.prototype.getAnim = function(animName)
	{
		return this.animations[animName];
	}

    /**
	 * Resumes the playing of the current Animation sheet
	 * @type {function(this:BitmapAnimation)}
	 * @return {BitmapAnimation} Returns self reference for chaining
	 */
    GridSpritesheet.prototype.parseJSON = function(data, path)
	{
		// Spritesheet image in the meta object
		var imageUrl = this.imageUrl = path + data.image;

		var req = new Bitmap({
			url:imageUrl, 
			callback:this.onImageComplete.bind(this)
		});
	
		// Set animations duration?
		// duration:_frames.length / frameRate,
	}

	GridSpritesheet.prototype.onImageComplete = function(image)
	{
		var data = this.data;
		var path = this.path;

		this.imageWidth = image.width;
		this.imageHeight = image.height;
		this.frameWidth = data.frameWidth;
		this.frameHeight = data.frameHeight;


		if (data.anchor != null)
		{
			this.anchor = {
				x: data.anchor.x,
				y: data.anchor.y
			}
		}

		this.frames = [];
		
		// Parse animations
		var animation;
		var animName;
		var frameIndex;
		var frameList;
		var fps;

		for(animName in data.animations)
		{
			var animationData =  data.animations[animName];

			animation = this.animations[animName];

			// Set default animation if not set
			if(!this.defaultAnim || animName == "idle")
			{
				this.defaultAnim = animName;
			}

			// New animation?
			if(!animation) {
				animation = this.animations[animName] = Arstider.clone(animationData);

				// Write or re-write BitmapAnimation variables
				animation.name = animName;
				animation.spritesheet = this;
				animation.frames = [];
			}

			n = animationData.frames.length;
			for (i = 0; i < n; i++) {
				frameIndex = animationData.frames[i];
				frameData = this.getFrameData(frameIndex);
				animation.frames.push(frameData);
			};
		};

		this.onComplete();
	}

	GridSpritesheet.prototype.getFrameData = function(frameIndex)
	{
		if(this.frames[frameIndex]) return this.frames[frameIndex];

		var frameX = 0;
		var frameY = 0;
		var dist = (this.frameWidth*frameIndex);
		while(dist >= this.imageWidth)
		{
			dist-= this.imageWidth;
			frameY += this.frameHeight;
		}
		frameX += dist;

		var frameData = {
			index:frameIndex,
			rect: [
				frameX, 
				frameY, 
				this.frameWidth, 
				this.frameHeight
				],
			origin: [0, 0]
		}

		return frameData;
	}

	return GridSpritesheet;
});