define("Arstider/Screen", ["Arstider/DisplayObject", "Arstider/Viewport"], function(DisplayObject, Viewport){
	
	Screen.Inherit(DisplayObject);
	function Screen(){
		this.loaded = false;
		this.stage = null;
		this.width = Viewport.maxWidth;
		this.height = Viewport.maxHeight;
		
		//Legacy
		this.binds = {};
	}
	
	Screen.prototype.onload = function(){};
	Screen.prototype.onunload = function(){};
	Screen.prototype.update = function(){};
	Screen.prototype.onresume = function(){};
	
	return Screen;
});
