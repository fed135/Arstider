/**
 * Create JS or Texture Packer "Easel JS" Spritesheet model 
 *
 * @see  http://www.createjs.com/#!/Zoe
 * 
 * Example spritesheet with animation names and multiple images:
 * http://pastie.org/9255064
 *
 * TexturePacker configuration:
 * - Data-Format : "Easel JS"
 * - CHECK "Multipack" (to generate more than one image when necessary)
 * - UNCHECK "Allow Rotation"
 * - MAX 1024x1024 (for iPad)
 *
 * @see http://www.createjs.com/Docs/EaselJS/SpriteSheet.html
 *
 * @author Jo Simard <josimard@meetfidel.com>
 *
 */
define("Arstider/sprites/ZoeSpritesheet",
[
	
],
function ()
{
	/**
	 * ZoeSpritesheet constructor
	 * @class ZoeSpritesheet
	 * @constructor
	 * @param {Object} data
	 */
	function ZoeSpritesheet(data, params, fileInfo)
	{
		this.data = data;

		if(!params) params = {};

		// defaults
		this.frames = [];
		this.name = params.name;
		this.defaultAnim = params.defaultAnim;
		this.fps = (params.fps>0) ? params.fps : 15;
		this.animations = {};

		// Parse the JSON data to fill animations
		this.parseJSON(data, fileInfo.path);
	};

	ZoeSpritesheet.prototype.getAnim = function(animName)
	{
		return this.animations[animName];
	}

    /**
	 * Resumes the playing of the current Animation sheet
	 * @type {function(this:BitmapAnimation)}
	 * @return {BitmapAnimation} Returns self reference for chaining
	 */
    ZoeSpritesheet.prototype.parseJSON = function(data, path)
	{
		// Images
		this.images = [];
		var imageUrl;
		for (var i = 0; i < data.images.length; i++) {
			imageUrl = path + data.images[i];
			this.images.push(imageUrl);
		};
	
		if (data.anchor != null)
		{
			this.anchor = {
				x: data.anchor.x,
				y: data.anchor.y
			}
		}
		
		var frame;
		var frameData;
		var fps = this.fps;

		// FPS set in data
		if(data.framerate > 0 ) fps = this.fps = data.framerate;

		var sepIndex;
		//var rotateWarning = false;

		// Parse Frames
		var n = data.frames.length;
		for (i = 0; i < n; i++)
		{
			// frameData:  [x, y, width, height, imageIndex, regX, regY]
			frameData =  data.frames[i];

			imageUrl = this.images[ frameData[4] ];

			/*if(!rotateWarning && frameData.rotated)
			{
				rotateWarning = true;
				console.log("ZoeSpritesheet ERROR for "+this.name+": rotated frames are not supported, please uncheck this options before exporting");
			}*/
			
			// Create frameInfo
			frame = {
				index:i,
				image:imageUrl,
				rect: [frameData[0], frameData[1], frameData[2], frameData[3]],
				origin: [-frameData[5], -frameData[6]]
			}

			this.frames.push(frame);
		}

		// Parse animations
		var animation;
		var animName;
		var frameIndex;
		var animSpeed;
		for(animName in data.animations)
		{
			var animationData =  data.animations[animName];

			animation = this.animations[animName];

			animSpeed = (animationData.speed>0) ? animationData.speed : 1;

			// Set default animation if not set
			if(!this.defaultAnim || animName == "idle")
			{
				this.defaultAnim = animName;
			}

			// New animation?
			if(!animation) {
				animation = this.animations[animName] = {
					name:animName,
					fps: fps*animSpeed,
					speed:animSpeed,
					spritesheet:this,
					frames:[]
				};
			}

			n = animationData.frames.length;
			for (i = 0; i < n; i++) {
				frameIndex = animationData.frames[i];
				frameData = this.frames[frameIndex];
				animation.frames.push(frameData);
			};
		};


		// Set animations duration?
		// duration:_frames.length / frameRate,
	}

	return ZoeSpritesheet;
});