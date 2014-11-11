define("Arstider/managers/AssetManager", 
[
	"Arstider/display/bitmap/Image"
],
function(_Image){

	function AssetManager(){

		this._assetList = {};
	}

	AssetManager.prototype.register = function(id, data){

		data.name = id;
		this._assetList[id] = new _Image(data);

		return this._assetList[id];
	};

	AssetManager.prototype.get = function(id){

		return this._assetList[id];
	};

	AssetManager.prototype.dispose = function(id){

		if(this._assetList[id]){
			if(this._assetList[id].dispose) this._assetList[id].dispose();
			delete this._assetList[id];
		}

		return true;
	};

	AssetManager.prototype.getMemoryInfo = function(){

		var
			i,
			total = 0
		;

		for(i in this._assetList){
			if(this._assetList[i] && this._assetList[i].width && this._assetList[i].height){
				total += (this._assetList[i].width * this._assetList[i].height * 4);
			}
		}

		return total;
	};

	return new AssetManager();
});