define("Arstider/scene/Cameras", 
[
	"Arstider/system/Viewport"
],
function(){
	
	Cameras.ORTHOGRAPHIC = "orthographic";
	Cameras.PERSPECTIVE = "perspective";

	Cameras.DEFAULTS = {
		nearPlane:1,
		farPlane:1000,
		fov:45
	};

	function Cameras(){

		this.list = {};

		this.currentCamera = null;
	}

	Cameras.prototype.create = function(id, type){

		if(id in this.list){
			Arstider.log("Arstider.Cameras.create: camera with id "+id+" already exists, it will be replaced.");
		}

		if(type === Cameras.ORTHOGRAPHIC){
			this.list[id] = new THREE.OrthographicCamera(-(Viewport.maxWidth*0.5), (Viewport.maxWidth*0.5), -(Viewport.maxHeight*0.5), (Viewport.maxHeight*0.5), Cameras.DEFAULTS.nearPlane, Cameras.DEFAULTS.farPlane);
		}
		else{
			if(type !== Cameras.PERSPECTIVE){
				Arstider.log("Arstider.Cameras.create: unknown camera type "+type+", perspective will be used.");
			}
			this.list[id] = new THREE.PerspectiveCamera(Cameras.DEFAULTS.fov, Viewport.maxWidth/Viewport.maxHeight, Cameras.DEFAULTS.nearPlane, Cameras.DEFAULTS.farPlane);
		}

		return this;
	};

	Cameras.prototype.setCurrentCamera = function(id){

		if(id in this.list){
			this.currentCamera = this.list[id];
		}
		else{
			Arstider.log("Arstider.Cameras.setCurrentCamera: camera "+id+ " does not exist!");
		}

		return this;
	};

	return new Cameras();
});