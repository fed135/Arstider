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
	var context = this;

	// Public methods
	this.get = get;

	// Loaded spritesheets dictionnary, indexed by name
	var spritesheets = {};

	// Spritesheets overrides, indexed by name
	var overrides = {};

	function get(nameOrPath, params, onComplete)
	{
		var fileInfo = getFileInfo(nameOrPath, "{{name}}.json");

		var name = getName(fileInfo.name);
		if(spritesheets[name]) return spritesheets[name];

		// Append params to name
		params.name = name;

		loadJSON(fileInfo.url, function(data)
		{
			var spritesheet;

			// Texture packer EaselJS or Zoe spritesheets
			if(data.images && data.images.length>=1)
			{
				spritesheet = new ZoeSpritesheet(data, params, fileInfo);

				// Assign to cache
				spritesheets[name] = spritesheet;

				// Return to callback
				onComplete(spritesheet);
			}
			
			// Texture packer JSON Array format
			else if(data.frames && data.frames.length>=1)
			{
				spritesheet = new JsonSpritesheet(data, params, fileInfo);

				// Assign to cache
				spritesheets[name] = spritesheet;

				// Return to callback
				onComplete(spritesheet);
			} 

			// Grid format (OLD SDK2 format)
			else if(data.frameWidth>0)
			{
				spritesheet = new GridSpritesheet(data, params, fileInfo, function() {

					// Assign to cache
					spritesheets[name] = spritesheet;

					// Return to callback
					onComplete(spritesheet);
				});
			} 

			// Not supported
			else {
				console.log("SpritesheetManager ERROR: Unkown spritesheet format.");
				console.log(data)
			}

			
		});
	}

	function loadJSON(url, onComplete)
	{
		var req = new Request({
			url:url,
			caller:this,
			cache:false,
			track:true,
			type:"json",
			callback:function(file){
				onComplete(file);
			}
		}).send();
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


	return context;
});