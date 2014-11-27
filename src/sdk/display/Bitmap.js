/**
 * Bitmap
 *
 * @version 2.1.2
 * @author frederic charette <fredc@meetfidel.com>
 */
define("Arstider/display/Bitmap",
[
	"Arstider/core/DisplayObjectContainer", 

	"Arstider/components/Display",
	"Arstider/components/Transform"
], 
/** @lends display/Bitmap */ 
function (DisplayObjectContainer, Display, Transform){
	
	/**
	 * Bitmap constructor
	 * The basic display element
	 * @class display/Bitmap
	 * @constructor
	 * @extends {Entity}
	 * @param {Object|null} props Optional properties for the element.
	 */
	function Bitmap(props) {
		Arstider.Super(this, DisplayObjectContainer, props);
		
		this.addComponents([Display, Transform]);
	};
	
	Arstider.Inherit(Bitmap, DisplayObjectContainer);
	
	return Bitmap; 
});