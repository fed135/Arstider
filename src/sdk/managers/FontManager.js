/**
 * Font Manager. 
 *
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */
define( "Arstider/managers/FontManager", 
[
	"Arstider/core/Dataset", 
	"Arstider/texts/Font"
],
/** @lends managers/FontManager */ 
function (Dataset, Font){
	
	FontManager.DEFAULTS = {};

	/**
	 * FontManager constructor
	 * A font loading and defining module
	 * @class managers/FontManager
	 * @constructor
	 */
	function FontManager(){

		this.fontList = {};

		Arstider.Super(this, Dataset, FontManager.DEFAULTS, this._parse);
	};
	Arstider.Inherit(FontManager, Dataset);
	
	/**
	 * Creates a font
	 * @type {function(this:FontManager)}
	 * @param {Object} props The font properties
	 * @return {Object} The newly created font object
	 */
	FontManager.prototype.create = function(props){
		
		if(props.name == undefined){
			if(Arstider.verbose > 0) console.warn("Arstider.FontManager.create: name not specified, font not created");
			return false;	
		}

		var nFont = new Font(props);
		this.fontList[props.name] = nFont;
		return nFont;
	};

	FontManager.prototype.get = function(font){
		this.fontList[font]
	};
	
	FontManager.prototype._parse = function(config){
		for(var i in config.fonts){
			config.fonts[i].name = i;
			this.create(config.fonts[i]);
		}
	};
		
	return new FontManager();
});