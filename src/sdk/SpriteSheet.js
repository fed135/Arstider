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
		 	
			var SpriteSheet = function(props){
				props = props || {};
				
				this.data = null;
				this.width = 0;
				this.height = 0;
				
				this.frameWidth = Arstider.checkIn(props.width, 0);
				this.frameHeight = Arstider.checkIn(props.height, 0);
				
				this.onload = Arstider.checkIn(props.onload, Arstider.emptyFunction);
				
				var url = Arstider.checkIn(Arstider.checkIn(props.data, props.bitmap), null);
				
				if(url) this.loadBitmap(url);
			};
			
			SpriteSheet.prototype.addSequence = function(name, time, frames, stop){
				this[name] = new Sequence(this, time, frames, stop);
				return this[name];
			};
			
			SpriteSheet.prototype.loadBitmap = function(url){
				var thisRef = this;
				
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
				
				this.url = url;
				var req = new Bitmap(url, function(){
					thisRef.data = this.data;
					if(thisRef.width == 0) thisRef.width = this.width;
					if(thisRef.height == 0) thisRef.height = this.height;
					
					thisRef.onload();
				});
			};
			
			return SpriteSheet;
	});