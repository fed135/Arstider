;(function(){

	var 
		cnv = null
	;

/**
 * AMD Closure
 */	
	define( "Arstider/Texture", ['Arstider/Buffer', 'Arstider/Bitmap'], function (Buffer, Bitmap) {
	
		if(cnv == null){
			cnv = new Buffer({
				name:'Arstider_textureLoader',
				width:100,
				height:100
			});
		}
		
		function Texture(url){
			this.pattern = null;
			this.url = url;
			
			this.loadAsset(url);
		}
		
		Texture.prototype.loadAsset = function(url){
			
			var thisRef = this;
			
			var req = new Bitmap(url, function(){
				thisRef.pattern = cnv.context.createPattern(this.data, 'repeat');
			});
		};
			
		Texture.prototype.setSize = function(width, height){
			cnv.setSize(width, height);
			
			this.loadAsset(this.url);
		};
			
		Texture.prototype.print = function(){
			return this.pattern;
		};
		
		return Texture;
	});

})();