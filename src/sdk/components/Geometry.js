/**
 * Geometry Component
 * 
 * @version 2.0.1
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/components/Geometry",
[
	"Arstider/components/IComponent"
],
/** @lends components/Geometry */
function(IComponent){
	
	Geometry.DEFAULTS = {
		meshType:null
	};

	Geometry.namespace = "geometry";
	Geometry.PLANE = "planeBufferGeometry";

	function Geometry(){

		Arstider.utils.Super(this, IComponent, Geometry.DEFAULTS);

		this.data = null;
		this.sceneElement = null;
	}
	Arstider.utils.Inherit(Geometry, IComponent);

	Geometry.prototype.load = function(data){

		//TODO: allow different mesh types - only 2d for now
		this.meshType = data.meshType || Geometry.PLANE_GEOMETRY;
		this.data = new THREE.PlaneBufferGeometry(data.width || 1, data.height || 1);
	};

	return Geometry;
});