/**
 * Display Component
 * 
 * @version 2.0.1
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/components/Material",
[
	"Arstider/components/IComponent",
	"Arstider/components/LComponents",
	"Arstider/managers/AssetManager",
	"Arstider/scene/Materials"
],
/** @lends components/Material */
function(IComponent, List, AssetManager, Materials){
	
	Material.DEFAULTS = {
		alpha:1,
		outline:{
			color:"red",
			size:1,
			visible:false
		},
		crop:{
			x:0,
			y:0,
			width:null,
			height:null
		},
		mask:false,
		composite:Arstider._core.defaultComposition,
		material:null,
		materialType:null
	};

	Material.namespace = "material";

	function Material(){

		Arstider.utils.Super(this, IComponent, Material.DEFAULTS);

		this.data = null;

		this.onload = new Signal();
		this.onunload = new Signal();
		this.onerror = new Signal();
	}
	Arstider.utils.Inherit(Material, IComponent);

	Material.prototype.load = function(url, materialType){

		var
			mat
		;

		if(!(materialType instanceof String)){
			errorCallback = callback;
			callback = materialType;
			materialType = Materials.MESH_PHONG;
		}

		mat = Materials.get(url);
		if(mat){
			this.data = mat;
			this.material = url;
			this.materialType = materialType;
			this.onload.dispatch();
			if(callback) callback(mat);
			return;
		}

		this.material = url;
		this.materialType = materialType;

		AssetManager.get(url, this._handleLoadSuccess.bind(this), this._handleLoadError.bind(this));
	};

	Material.prototype._handleLoadSuccess = function(imageData){
		
		var
			t = this.owner.getComponent(List.transform)
		;

		if(t){
			if(t.size.x == 0) t.size.x = imageData.width;
			if(t.size.y == 0) t.size.y = imageData.height;
		}

		this.crop.width = this.crop.width || imageData.width;
		this.crop.height = this.crop.height || imageData.height;

		this.data = Materials.create(url, materialType, {map:imageData.data});

		this.onload.dispatch();
		if(callback) callback(this.data);
	};

	Material.prototype._handleLoadError = function(error){

		this.onerror.dispatch();
		if(errorCallback) errorCallback(error);
	};

	Material.prototype.onremoved = function(){

		AssetManager.unassign(this.material);
		this.data = null;
		this.material = Material.DEFAULTS.material;
		this.materialType = Material.DEFAULTS.materialType;
		this.crop = Material.DEFAULTS.crop;
	};

	return Material;
});