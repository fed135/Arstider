;(function(){
	
	var
		empty = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=',
		blobCache = {}
	;

	define("Arstider/Bitmap", ["Arstider/Request"], function(Request){
	
		function Bitmap(url, success){
			this.url = url;
			this.data = new Image();
			this.post = success;
			this.width = 0;
			this.height = 0;
			
			if(blobCache[url] != undefined){
				this.loadUrl(blobCache[url]);
			}
			else{
				this.req = new Request({
					url:url,
					caller:this,
					callback:this.parse
				});
			
				this.req.send();
			}
		}
		
		Bitmap.prototype.parse = function(e){
			if(blobCache[this.url] == undefined){
				blobCache[this.url] = {url:window.URL.createObjectURL(e), size:e.size};
			}
			this.loadUrl(blobCache[this.url].url);
		};
		
		Bitmap.prototype.loadUrl = function(url){
			var thisRef = this;
			
			this.data.onload = function(){
				thisRef.data.onload = null;
				thisRef.width = thisRef.data.width;
				thisRef.height = thisRef.data.height;
				
				Arstider.setRenderStyle(thisRef.data);
				
				if(thisRef.post) thisRef.post();
			};
			this.data.src = url;
		};
		
		Bitmap.prototype.save = function(){
			//Arstider.saveToCanvas();
		};
		
		return Bitmap;
	});
	
})();
