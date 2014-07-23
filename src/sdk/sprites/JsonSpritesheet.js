/**
 * Texture Packer "JSON Array" Spritesheet model 
 *
 * TexturePacker configuration:
 * - Data-Format : JSON-ARRAY
 * - CHECK "Multipack" (to generate more than one image when necessary)
 * - UNCHECK "Allow Rotation"
 * - MAX 1024x1024 (for iPad)
 *
 * @author Jo Simard <josimard@meetfidel.com>
 *
 */
define("Arstider/sprites/JsonSpritesheet",
[
	
],
function ()
{
	/**
	 * JsonSpriteSheet constructor
	 * @class JsonSpriteSheet
	 * @constructor
	 * @param {Object} data
	 */
	function JsonSpritesheet(data, params, fileInfo)
	{
		this.data = data;

		if(!params) params = {};

		// defaults
		this.name = params.name;
		this.defaultAnim = params.defaultAnim;
		this.fps = (params.fps>0) ? params.fps : 15;
		this.animations = {};

		// Parse the JSON data to fill animations
		this.parseJSON(data, fileInfo.path);
	};


	JsonSpritesheet.prototype.getAnim = function(animName)
	{
		return this.animations[animName];
	}

    /**
	 * Resumes the playing of the current Animation sheet
	 * @type {function(this:BitmapAnimation)}
	 * @return {BitmapAnimation} Returns self reference for chaining
	 */
    JsonSpritesheet.prototype.parseJSON = function(data, path, nameSeparator)
	{
		if(!nameSeparator) nameSeparator = "/";

		// Spritesheet image in the meta object
		var imageUrl = path + data.meta.image;
	
		if (data.anchor != null)
		{
			this.anchor = {
				x: data.anchor.x,
				y: data.anchor.x,
			}
		}
		
		var animation;
		var animName;

		var frame;
		var frameData;
		var fps = this.fps;
		var sepIndex;
		var rotateWarning = false;

		// Parse frames
		var n = data.frames.length;
		for (var i = 0; i < n; i++)
		{
			frameData =  data.frames[i];

			if(!rotateWarning && frameData.rotated)
			{
				rotateWarning = true;
				console.log("JsonSpritesheet ERROR for "+this.name+": rotated frames are not supported, please uncheck this options before exporting");
			}

			sepIndex = (nameSeparator != "") ? frameData.filename.lastIndexOf(nameSeparator) : -1;
			
			// No separator found, set to default animation name
			if (sepIndex <= 0)
			{
				animName = "idle";
			} else {
				animName = frameData.filename.substr(0, sepIndex);
			}

			// Set default animation if not set
			if(!this.defaultAnim || animName == "idle")
			{
				this.defaultAnim = animName;
			}

			// Get animation by name
			animation = this.animations[animName];

			// New animation?
			if(!animation) {
				animation = this.animations[animName] = {
					name:animName,
					fps:fps,
					spritesheet:this,
					frames:[]
				};
			}

			// Create frameInfo
			frame = {
				index:i,
				image:imageUrl,
				rect: [frameData.frame.x, frameData.frame.y, frameData.frame.w, frameData.frame.h],
				origin: [frameData.spriteSourceSize.x, frameData.spriteSourceSize.y]
			}

			animation.frames.push(frame);
		}
	}

	return JsonSpritesheet;
});