/**
 * 
 * Spritesheet Manager SINGLETON
 * 
 * @author Jo Simard <josimard@meetfidel.com>
 */
define("Arstider/sprites/SpritesheetManager", 
[
	"Arstider/Request",
	"Arstider/sprites/JsonSpritesheet",
	"Arstider/sprites/ZoeSpritesheet",
	"Arstider/sprites/GridSpritesheet"
],
function (Request, JsonSpritesheet, ZoeSpritesheet, GridSpritesheet)
{
	var _instance;

	function SpritesheetManager()
	{
		this.defaultFileName = "{{name}}.json";

		// Loaded spritesheets dictionnary, indexed by name
		this.spritesheets = {};

		this.loadCallbacks = {};

		// Spritesheets overrides, indexed by name
		this.overrides = {};
	}

	SpritesheetManager.prototype.get = function(nameOrPath, params, onComplete)
	{
		var fileInfo = getFileInfo(nameOrPath, this.defaultFileName);

		var name = getName(fileInfo.name);
		// Append params to name
		params.name = name;

		// Already Loading?
		if(this.loadCallbacks[name]) 
		{
			this.loadCallbacks[name].push(onComplete);
			return;
		}

		// Cached?
		if(this.spritesheets[name])
		{
			onComplete( spritesheets[name] );
			return;
		}

		// New spritesheet
		if(!this.loadCallbacks[name]) this.loadCallbacks[name] = [];
		this.loadCallbacks[name].push(onComplete);

		var context = this;
		this.loadJSON(fileInfo.url, function(data)
		{
			var spritesheet;

			// Texture packer EaselJS or Zoe spritesheets
			if(data.images && data.images.length>=1)
			{
				spritesheet = new ZoeSpritesheet(data, params, fileInfo);

				// Return to callback
				context.onSpritesheetLoaded(name, spritesheet, params);
			}
			
			// Texture packer JSON Array format
			else if(data.frames && data.frames.length>=1)
			{
				spritesheet = new JsonSpritesheet(data, params, fileInfo);

				// Return to callback
				context.onSpritesheetLoaded(name, spritesheet, params);
			} 

			// Grid format (OLD SDK2 format)
			else if(data.frameWidth>0)
			{
				spritesheet = new GridSpritesheet(data, params, fileInfo, function() {

					// Return to callback
					context.onSpritesheetLoaded(name, spritesheet, params);
				});
			} 

			// Not supported
			else {
				console.log("SpritesheetManager ERROR: Unkown spritesheet format.");
				console.log(data);
				context.onSpritesheetLoaded(name, spritesheet, params);
				return;
			}

		});
	}

	SpritesheetManager.prototype.onSpritesheetLoaded = function(name, spritesheet, params)
	{
		// Singleton-registered overrides (From your game code calling SpritesheetManager.registerAnimationOverrides() )
		this.applyOverrides(this.overrides[name], name, spritesheet, params);

		// Run-time overrides
		if(params.overrides) this.applyOverrides(params.overrides, name, spritesheet, params);

		// Assign to cache
		this.spritesheets[name] = spritesheet;

		if(this.loadCallbacks[name])
		{
			var n = this.loadCallbacks[name].length;
			
			for (var i = 0; i < n; i++) {
				var callback = this.loadCallbacks[name][i];
				if(callback) callback(spritesheet);
			};

			// Flush callbacks
			this.loadCallbacks[name] = null;
		}
	}

	SpritesheetManager.prototype.registerOverrides = function(overrides)
	{
		console.log("Animation overrides: ", overrides);

		for (var i = 0; i < overrides.length; i++)
		{
			var overrideData = overrides[i];

			var fileInfo = getFileInfo(overrideData.spritesheet, this.defaultFileName);

			var name = getName(fileInfo.name);

			console.error(name);
		
			this.overrides[name] = overrideData;
		};
	}

	SpritesheetManager.prototype.applyOverrides = function(overrideData, name, spritesheet, params)
	{
		if(!overrideData) return;

		console.log("Applying overrides to "+name, overrideData);

		if(overrideData)
		{
			if(overrideData.animations)
			{
				// Spriteshett default FPS
				if(overrideData.fps>0) spritesheet.fps = fps;

				for(var animName in overrideData.animations)
				{
					var animOverrides = overrideData.animations[animName];

					for(var p in animOverrides)
					{
						// Anim does not exists
						if(!spritesheet.animations[animName])
						{
							// TODO: create anim if possible
							console.error("SpritesheetManager error: Anim '"+animName+"' not found for overrides: ", animName, animOverrides);
							
							continue;
						}
						spritesheet.animations[animName][p] = animOverrides[p];
					}
					
					console.log(animName, animOverrides, spritesheet.animations[animName]);
				}
			}
		}
	}

	SpritesheetManager.prototype.loadJSON = function(url, onComplete)
	{
		var request = new Request({
			url:url,
			caller:this,
			cache:false,
			track:true,
			type:"json",
			callback:function(file){
				onComplete(file);
			}
		}).send();

		return request;
	}

	function getName(nameOrPath)
	{
		return nameOrPath.replace(/\//g,'_');
	}

	/*
	* Get information from a file url 
	*/
	function getFileInfo(url, defaultFileName)
	{
		var name;
		var ext = getFileExtension( url );
		var path;
		
		// Only received folder
		if (ext == null && defaultFileName!=null)
		{
			// Remove trailing slash 
			if (url.lastIndexOf("/") == url.length-1) url = url.substr(0, url.lastIndexOf("/"));

			path = url;

			var nameFromPath = url.substr(url.lastIndexOf("/")+1, url.length);

			// Replace known token if existing
			defaultFileName = defaultFileName.replace("{{name}}", nameFromPath);

			name = nameFromPath;

			// Add trailing slash to path
			if (path.lastIndexOf("/") < path.length-1) path += "/";
			url = path + defaultFileName;

			ext = getFileExtension( url );
		}
		// Received file with ext
		else
		{
			path = url.substr(0, url.lastIndexOf("/") + 1);
			
			name = url.substr(0, url.lastIndexOf("."));
		}

		return {
			name:name,
			path:path,
			url:url,
			ext:ext
		}
	}

	/**
	* Gets the extension of a file name, or null if there is no extension.
	*/
	function getFileExtension(fileName)
	{
		var dot = fileName.lastIndexOf(".");
		return (dot > 0) ? fileName.substr(dot+1) : null;
	}

	/**
	* Returns a file name without its extension.
	*/
	function removeFileExtension(fileName)
	{
		var dot = fileName.lastIndexOf(".");
		return (dot > 0) ? fileName.substr(0, dot) : fileName;
	}

	_instance = new SpritesheetManager();

	return _instance;
});