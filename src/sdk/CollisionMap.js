define("Arstider/CollisionMap", ["Arstider/Bitmap", "Arstider/Entity"], function(Bitmap, Entity){
	
	function CollisionMap(props){
		Arstider.Super(this, Entity, props);
		
		this._collMask = null;
		this._maskData = null;
		this._collMaskUrl = Arstider.checkIn(props.mask, null);
		this._collMaskScale = Arstider.checkIn(props.maskScale, 1);
		
		this._debugDraw = Arstider.checkIn(props.debug, false);
		
		if(this._collMaskUrl != null) this.loadMask(this._collMaskUrl);
	}
	
	Arstider.Inherit(CollisionMap, Entity);
	
	CollisionMap.prototype.setScale = function(val){
		this._collMaskScale = val;
	};
	
	CollisionMap.prototype.loadMask = function(url){
		var thisRef = this;
		
		if(!(typeof url === 'string') && !(url instanceof String)){
			thisRef.data = url;
			if(thisRef.width == 0) thisRef.width = url.width;
			if(thisRef.height == 0) thisRef.height = url.height;
			return;
		}
				
		var req = new Bitmap(url, function(){
			thisRef._collMask = this.data;
			thisRef._maskData = Arstider.saveToCanvas("CollisionMap_"+thisRef._collMaskUrl, this.data).context2D().getImageData(0,0,this.width,this.height);
			thisRef._parseMap();
			if(thisRef.width == 0) thisRef.width = thisRef.dataWidth = this.width;
			if(thisRef.height == 0) thisRef.height = thisRef.dataHeight = this.height;
			
			if(thisRef._debugDraw) thisRef._drawShape.apply(thisRef);
		});
	};
	
	CollisionMap.prototype._drawShape = function(){
		this.alpha = 0.25;
		this.data = this._collMask;
		this.scaleX = this.scaleY = this._collMaskScale;
	};
	
	CollisionMap.prototype._parseMap = function(){
		var 
			ret = []
			i = 0,
			len = this._maskData.data.length,
			thisRef = this
		;
		
		for(i; i<len; i+=4){
			ret[ret.length] = (this._maskData.data[i] === 0)?1:null;
		}
		
		this._maskData = ret;
		
		require(["Arstider/Buffer"], function(Buffer){
			Buffer.kill("CollisionMap_"+thisRef._collMaskUrl);
		})
	};
	
	CollisionMap.prototype.updateAt = function(x, y, value){
		this._maskData[(Arstider.chop(y/this._collMaskScale) * this.width) + (Arstider.chop(x/this._collMaskScale))] = value;
	};
	
	CollisionMap.prototype.collisionAt = function(x, y){
		return this._maskData[(Arstider.chop(y/this._collMaskScale) * this.width) + (Arstider.chop(x/this._collMaskScale))] === 1;
	};
	
	return CollisionMap;
	
});
