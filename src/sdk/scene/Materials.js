define("Arstider/scene/Materials",
[],
function(){

	function Materials(){

		this.list = {};
	}

	Materials.prototype.LINE_BASIC = "lineBasic";
	Materials.prototype.LINE_DASHED = "lineDashed";
	Materials.prototype.MESH_BASIC = "meshBasic";
	Materials.prototype.MESH_DEPTH = "meshDepth";
	Materials.prototype.MESH_FACE =  "meshFace";
	Materials.prototype.MESH_LAMBERT = "meshLambert";
	Materials.prototype.MESH_NORMAL = "meshNormal";
	Materials.prototype.MESH_PHONG = "meshPhong";
	Materials.prototype.POINT_CLOUD = "pointCloud";
	Materials.prototype.RAW_SHADER = "rawShader";
	Materials.prototype.SHADER = "shader";
	Materials.prototype.SPRITE_CANVAS = "spriteCanvas";
	Materials.prototype.SPRITE = "sprite";

	Materials.prototype.create = function(id, type, data){

		if(id in this.list){
			Arstider.log("Arstider.Materials.create: material "+id+" already exists, it will be replaced.");
		}

		console.log(id, type, data);

		switch(type){
			case this.LINE_BASIC:
				this.list[id] = new THREE.LineBasicMaterial(data);
				break;
			case this.LINE_DASHED:
				this.list[id] = new THREE.LineDashedMaterial(data);
				break;
			case this.MESH_BASIC:
				this.list[id] = new THREE.MeshBasicMaterial(data);
				break;
			case this.MESH_DEPTH:
				this.list[id] = new THREE.MeshDepthMaterial(data);
				break;
			case this.MESH_FACE:
				this.list[id] = new THREE.MeshFaceMaterial(data);
				break;
			case this.MESH_LAMBERT:
				this.list[id] = new THREE.MeshLambertMaterial(data);
				break;
			case this.MESH_NORMAL:
				this.list[id] = new THREE.MeshNormalMaterial(data);
				break;
			case this.MESH_PHONG:
				this.list[id] = new THREE.MeshPhongMaterial(data);
				break;
			case this.POINT_CLOUD:
				this.list[id] = new THREE.PointCloudMaterial(data);
				break;
			case this.RAW_SHADER:
				this.list[id] = new THREE.RawShaderMaterial(data);
				break;
			case this.SHADER:
				this.list[id] = new THREE.ShaderMaterial(data);
				break;
			case this.SPRITE_CANVAS:
				this.list[id] = new THREE.SpriteCanvasMaterial(data);
				break;
			case this.SPRITE:
				this.list[id] = new THREE.SpriteMaterial(data);
				break;
			default:
				Arstider.log("Arstider.Materials.create: material type not found "+type);
		}

		console.log("me?", this.list);

		return this.list[id];
	};

	Materials.prototype.get = function(id){

		return this.list[id];
	};

	Materials.prototype.dispose = function(id){

		delete this.list[id];
	};

	return new Materials();
});