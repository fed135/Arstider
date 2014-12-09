define("Arstider/managers/AssetManager", 
[
	"Arstider/display/bitmap/ImageData"
],
function(ImageData){

	function AssetManager(){

		this._assetList = {};
	}

	AssetManager.prototype.register = function(id, data){

		data.name = id;
		this._assetList[id] = new ImageData(data);
		this._assetList[id].usedBy++;

		return this._assetList[id];
	};

	AssetManager.prototype.get = function(id, callback){

		if(id in this._assetList){
			this._assetList[id].usedBy++;
			if(callback) callback(this._assetList[id]);
		}
		else{
			this.register(id, {
				url:id,
				callback:callback
			});
		}
	};

	AssetManager.prototype.dispose = function(id){

		if(this._assetList[id]){
			if(this._assetList[id].dispose) this._assetList[id].dispose();
			delete this._assetList[id];
		}

		return true;
	};

	AssetManager.prototype.unassign = function(id){

		if(this._assetList[id]){
			this._assetList[id].usedBy--;
			if(this._assetList[id].usedBy <= 0){
				this.dispose(id);
			}
		}
	};

	AssetManager.prototype.getMemoryInfo = function(){

		var
			i,
			total = 0
		;

		for(i in this._assetList){
			if(this._assetList[i].size){
				total += this._assetList[i].size;
			}
			else{
				if(this._assetList[i] && this._assetList[i].width && this._assetList[i].height){
					total += (this._assetList[i].width * this._assetList[i].height * 4);
				}
			}
		}

		return total;
	};

	return new AssetManager();
});