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
		this.frames = [];
		this.frameDict = {};

		this.baseUrl = fileInfo.path;

		if(params.imagesAtlas){
			// Parse the JSON data to fill animations
			this.parseJSONImages(data, this.baseUrl);
		}else{
			// Parse the JSON data to fill animations
			this.parseJSON(data, this.baseUrl);
		}
	};

	JsonSpritesheet.prototype.getFrameByName = function(frameName)
	{
		if(!this.frameDict[frameName])
		{
			console.log("Unable to get frame or image "+frameName+" from the Spritesheet");
		}
		return this.frameDict[frameName];
	}

	JsonSpritesheet.prototype.getAnim = function(animName)
	{
		return this.animations[animName];
	}

    JsonSpritesheet.prototype.parseJSONImages = function(data, path)
    {
		// Spritesheet image in the meta object
		var imageUrl = path + data.meta.image;
		
		var frame;
		var frameData;
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

			// Create frameInfo
			frame = this.createFrame(imageUrl, i, frameData);
			this.frameDict[frame.name] = frame;
		}	
    }

    /**
	 * Resumes the playing of the current Animation sheet
	 * @type {function(this:BitmapAnimation)}
	 * @return {BitmapAnimation} Returns self reference for chaining
	 */
    JsonSpritesheet.prototype.parseJSON = function(data, path)
	{
		// Spritesheet image in the meta object
		var imageUrl = path + data.meta.image;
	
		if (data.anchor != null)
		{
			this.anchor = {
				x: data.anchor.x,
				y: data.anchor.y
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

			sepIndex = frameData.filename.lastIndexOf("/");
			
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
				animation = this.animations[animName] = {}; //Arstider.clone(frameData);

				// Write or re-write BitmapAnimation variables
				animation.name = animName;
				animation.spritesheet = this;
				animation.frames = [];
			}

			// Create frameInfo
			frame = this.createFrame(imageUrl, i, frameData);

			animation.frames.push(frame);
			this.frameDict[frame.name] = frame;
			this.frames.push(frame);
		}
	}

	JsonSpritesheet.prototype.createFrame = function(imageUrl, index, frameData){

		var name = frameData.filename
		if(name)
		{
			name = name.replace(".png", "");
		} else {
			name = index+"";
		}

		var frame = {
			index: index,
			name:name,
			image:imageUrl,
			rect: [frameData.frame.x, frameData.frame.y, frameData.frame.w, frameData.frame.h],
			origin: [frameData.spriteSourceSize.x, frameData.spriteSourceSize.y],
			sourceSize: [frameData.sourceSize.w, frameData.sourceSize.h]
		}
		return frame;
	}

	return JsonSpritesheet;
});