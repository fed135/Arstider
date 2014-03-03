;(function(){
	
	var singleton = null;
	
	define( "Arstider/Background", ["Arstider/FileSystem", "Arstider/Viewport"], function (FileSystem, Viewport) {
		if(singleton != null) return singleton;
			
		/**
		 * Background Singleton Wrapper. 
		 * 
		 * Provides AMD Closure.
		 *
		 * @author frederic charette <fredc@meetfidel.com>
		 */
		function Background(){
			this.data = null;	
		}
			
		Background.prototype.set = function(url){
			var thisRef = this;
			FileSystem.download(url,function(img){
				thisRef.data = img;
			});
		};
				
		Background.prototype.reset = function(){
			this.data = null;
		};
		
		Background.prototype.render = function(ctx){
			if(singleton.data == null){
				ctx.clearRect(0, 0, Viewport.maxWidth, Viewport.maxHeight);
			}
			else{
				if(singleton.data != "none"){
					ctx.drawImage(singleton.data, 0, 0, Viewport.maxWidth, Viewport.maxHeight);
				}
			}
		};
		
		singleton = new Background();
		return singleton;
	});
})();		