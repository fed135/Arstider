/**
 * Tag modules common properties. 
 * 
 * Provides AMD Closure.
 *
 * @author frederic charette <fredc@meetfidel.com>
 */

	define( "Arstider/Tag", [], function(){
	
		/**
		 * Creates an instance of Tag. A holder for generic tag methods
		 *
		 * @constructor
		 * @this {Tag}
		 */
		var Tag = function(){};
		
		Tag.prototype.bind = function(event, method){
			if(this._tag){
				this._tag.addEventListener(event, method);
			}
		};
		
		Tag.prototype.unbind = function(event, method){
			if(this._tag){
				this._tag.removeEventListener(event, method);
			}
		};
		
		Tag.prototype.setPosition = function(x, y){
			if(this._tag){
				this._tag.style.position = "absolute";
				this._tag.style.zIndex = "999";
				this._tag.style.left = x + "px";
				this._tag.style.top = y + "px";
			}
		};
		
		return Tag;
	});