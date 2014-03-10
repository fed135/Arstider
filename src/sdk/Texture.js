;(function(){

	var cnv = null;
	var ctx = null;

/**
 * AMD Closure
 */	
	define( "Arstider/Texture", ['Arstider/Buffer', 'Arstider/FileSystem'], function (Buffer, FileSystem) {
	
		if(cnv == null){
			cnv = Buffer.create('textureLoader');
			cnv.width = 100;
			cnv.height = 100;
			ctx = cnv.context2D();
		}
		
		function Texture(url){
			this.pattern = null;
			this.url = url;
			
			this.loadAsset(url);
		}
		
		Texture.prototype.loadAsset = function(url){
			
			var thisRef = this;
			
			FileSystem.download(url, function(b){
				thisRef.pattern = ctx.createPattern(b, 'repeat');
			});
		};
			
		Texture.prototype.setSize = function(width, height){
			if(width && width != null){
				grad.width = width;
			}
			
			if(height && height != null){
				grad.height = height;
			}
			
			this.loadAsset(this.url);
		};
			
		Texture.prototype.export = function(){
			return this.pattern;
		};
		
		return Texture;
	});

})();