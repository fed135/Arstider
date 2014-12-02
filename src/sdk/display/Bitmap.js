/**
 * Bitmap
 *
 * @version 2.1.2
 * @author frederic charette <fredc@meetfidel.com>
 */
define("Arstider/display/Bitmap",
[
	"Arstider/core/DisplayObjectContainer", 

	"Arstider/components/Material",
	"Arstider/components/Geometry",
	"Arstider/components/Transform",
	"Arstider/components/WorldObject",

	"Arstider/events/Signal"
], 
/** @lends display/Bitmap */ 
function (DisplayObjectContainer, Material, Geometry, Transform, WorldObject, Signal){
	
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
		
		this.addComponents([Material, Geometry, Transform, WorldObject]);

		this.onready = new Signal();
	};
	
	Arstider.Inherit(Bitmap, DisplayObjectContainer);
	
	Bitmap.prototype.load = function(url){
		this.material.load(url, this._updateMesh.bind(this));
	};

	Bitmap.prototype._updateMesh = function(){
		this.geometry.load({
			meshType:Geometry.PLANE,
			width:this.material.crop.width,
			height:this.material.crop.height
		});
		this.worldObject.create();
		this.onready.dispatch();
	};

	return Bitmap; 
});