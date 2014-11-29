/**
 * Display Component
 * 
 * @version 2.0.1
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/components/Display",
[
	"Arstider/managers/AssetManager",
	"Arstider/scene/Materials",
	"Arstider/events/Signal"
],
/** @lends components/Display */
function(AssetManager, Materials, Signal){
	
	Display.DEFAULTS = {
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
		composite:Arstider.defaultComposition,
		material:null,
		materialType:null
	};

	Display.namespace = "display";

	function Display(){

		this.data = null;

		Arstider.mixin(this, Display.DEFAULTS);
	}

	Display.prototype.load = function(url, materialType, callback, errorCallback){

		var
			thisRef = this,
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
			if(callback) callback(mat);
			return;
		}

		this.material = url;
		this.materialType = materialType;

		AssetManager.get(url, 
			function(imageData){
				if(thisRef.owner.transform){
					if(thisRef.owner.transform.size.x == 0) thisRef.owner.transform.size.x = imageData.width;
					if(thisRef.owner.transform.size.y == 0) thisRef.owner.transform.size.y = imageData.height;
				}
				thisRef.crop.width = thisRef.crop.width || imageData.width;
				thisRef.crop.height = thisRef.crop.height || imageData.height;

				thisRef.data = Materials.create(url, materialType, {map:imageData.data});

				if(thisRef.owner.onload) thisRef.owner.onload.dispatch();
				if(callback) callback(thisRef.data);
			},
			function(error){
				if(thisRef.owner.onerror) thisRef.owner.onerror.dispatch();
				if(errorCallback) errorCallback(error);
			}
		);
	}

	Display.prototype.dispose = function(){
		this.data = null;
	};

	return Display;
});