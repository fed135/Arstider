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
			else{
				if(Arstider.verbose > 0) console.warn("Arstider.Tag.bind: no DOM element");
			}
		};
		
		Tag.prototype.unbind = function(event, method){
			if(this._tag){
				this._tag.removeEventListener(event, method);
			}
			else{
				if(Arstider.verbose > 0) console.warn("Arstider.Tag.unbind: no DOM element");
			}
		};
		
		Tag.prototype.setPosition = function(x, y){
			if(this._tag){
				this._tag.style.position = "absolute";
				this._tag.style.zIndex = "999";
				this._tag.style.left = x + "px";
				this._tag.style.top = y + "px";
			}
			else{
				if(Arstider.verbose > 0) console.warn("Arstider.Tag.setPosition: no DOM element");
			}
		};
		
		return Tag;
	});