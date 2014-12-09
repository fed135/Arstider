/**
 * WorldObject Component
 * 
 * @version 2.0.1
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/components/WorldObject",
[
	"Arstider/components/IComponent",
	"Arstider/components/LComponents"
],
/** @lends components/WorldObject */
function(IComponent, List){
	
	WorldObject.DEFAULTS = {
		objectType:null
	};

	WorldObject.namespace = "worldObject";
	WorldObject.MESH = "mesh";

	function WorldObject(){

		Arstider.utils.Super(this, IComponent, WorldObject.DEFAULTS);

		this.data = null;
	}
	Arstider.utils.Inherit(WorldObject, IComponent);

	WorldObject.prototype.create = function(data){

		var
			mat = this.owner.getComponent(List.material),
			geo	= this.owner.getComponent(List.geometry)
		;

		data = data || {};
		this.objectType = data.objectType || WorldObject.MESH;

		//TODO: Allow more than one type - only 2d for now
		if(mat && mat.data && geo && geo.data){
			this.data = new THREE.Mesh(geo.data, mat.data);
		}
	};

	return WorldObject;
});