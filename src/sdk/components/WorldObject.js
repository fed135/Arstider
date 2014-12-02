/**
 * WorldObject Component
 * 
 * @version 2.0.1
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/components/WorldObject",
[],
/** @lends components/WorldObject */
function(){
	
	WorldObject.DEFAULTS = {
		objectType:null
	};

	WorldObject.namespace = "worldObject";

	WorldObject.MESH = "mesh";

	function WorldObject(){

		this.data = null;

		Arstider.mixin(this, WorldObject.DEFAULTS);
	}

	WorldObject.prototype.create = function(data){

		data = data || {};

		this.objectType = data.objectType || WorldObject.MESH;

		//TODO: Allow more than one type - only 2d for now
		if(this.owner.material && this.owner.material.data && this.owner.geometry && this.owner.geometry.data){
			this.data = new THREE.Mesh(this.owner.geometry.data, this.owner.material.data);
		}
	};

	return WorldObject;
});