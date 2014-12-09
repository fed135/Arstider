/**
 * Bitmap
 *
 * @version 2.1.2
 * @author frederic charette <fredc@meetfidel.com>
 */
define("Arstider/display/Bitmap",
[
	"Arstider/managers/EntityFactory", 

	"Arstider/components/Material",
	"Arstider/components/Geometry",
	"Arstider/components/Transform",
	"Arstider/components/WorldObject"
], 
/** @lends display/Bitmap */ 
function (EntityFactory, Material, Geometry, Transform, WorldObject){
	
	/**
	 * Bitmap constructor
	 * The basic display element
	 * @class display/Bitmap
	 * @constructor
	 * @extends {Entity}
	 * @param {Object|null} props Optional properties for the element.
	 */
	EntityFactory.register("bitmap", [Material, Geometry, Transform, WorldObject]);
		
	
	/*Bitmap.prototype.loadImage = function(url){
		this.material.load(url);
	};

	Bitmap.prototype._updateMesh = function(){
		this.geometry.load({
			meshType:Geometry.PLANE,
			width:this.material.crop.width,
			height:this.material.crop.height
		});
		this.worldObject.create();
		this.onready.dispatch();
	};*/

	return null; 
});