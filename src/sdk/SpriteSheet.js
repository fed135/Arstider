/**
 * AMD Closure
 */	

	define( "Arstider/SpriteSheet", ["Arstider/Bitmap", "Arstider/Sequence"], function (Bitmap, Sequence) {
		
		/**
		 * Creates an instance of SpriteSheet.
		 *
		 * @constructor
		 * @this {SpriteSheet}
		 * @param {string} url The URL for the spriteSheet
		 */
		 	
			var SpriteSheet = function(url,fW,fH){
				var thisRef = this;
				this.data = null;
				this.width = 0;
				this.height = 0;
				this.url = url;
				
				if(fW) this.frameWidth = fW;
				if(fH) this.frameHeight = fH;
				
				if(!(typeof url === 'string') && !(url instanceof String)){
					thisRef.data = url;
					if(thisRef.width == 0){
						thisRef.width = url.width;
					}
					if(thisRef.height == 0){
						thisRef.height = url.height;
					}
					return;
				}
				
				var req = new Bitmap(url, function(){
					thisRef.data = this.data;
					if(thisRef.width == 0) thisRef.width = this.width;
					if(thisRef.height == 0) thisRef.height = this.height;
				});
			};
			
			SpriteSheet.prototype.addSequence = function(name, time, frames, stop){
				this[name] = new Sequence(this, time, frames, stop);
				return this[name];
			};
			
			return SpriteSheet;
	});