/**
 * CollisionMap
 * 
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the CollisionMap module
 */
define("Arstider/CollisionMap", ["Arstider/Bitmap", "Arstider/Entity"], /** @lends CollisionMap */ function(Bitmap, Entity){
	
	/**
	 * CollisionMap constructor
	 * Collision detection mask entity
	 * @class CollisionMap
	 * @constructor
	 * @param {Object} props Strating proprieties for the map.
	 */
	function CollisionMap(props){
		Arstider.Super(this, Entity, props);
		
		props = props || {};

		this._collMask = null;
		this._maskData = null;
		this._collMaskUrl = Arstider.checkIn(props.mask, null);
		this._collMaskScale = Arstider.checkIn(props.maskScale, 1);
		
		this._debugDraw = Arstider.checkIn(props.debug, false);
		
		if(this._collMaskUrl != null) this.loadMask(this._collMaskUrl);
	}
	
	Arstider.Inherit(CollisionMap, Entity);
	
	/**
	 * Changes the scale of the collision mask. 
	 * For example, your mask could be very smaller, than scaled up to match your game's scale (sharp rendered)
	 * @type {function(this:CollisionMap)}
	 * @param {number} val The amount of scale to apply to the collision mask
	 */
	CollisionMap.prototype.setScale = function(val){
		this._collMaskScale = val;
	};
	
	/**
	 * Loads the data for the collision mask
	 * @type {function(this:CollisionMap)}
	 * @param {string|Image|HTMLCanvasElement} url The url/data of the mask
	 */
	CollisionMap.prototype.loadMask = function(url){
		var thisRef = this;
		
		if(!(typeof url === 'string') && !(url instanceof String)){
			thisRef.data = url;
			if(thisRef.width == 0) thisRef.width = url.width;
			if(thisRef.height == 0) thisRef.height = url.height;
			return;
		}
				
		var req = new Bitmap({
			url:url,
			callback:function(img){
				thisRef._collMask = img.data;
				thisRef._maskData = Arstider.saveToCanvas("CollisionMap_"+thisRef._collMaskUrl, img.data).context2D().getImageData(0,0,img.width,img.height);
				thisRef._parseMap();
				if(thisRef.width == 0) thisRef.width = thisRef.dataWidth = img.width;
				if(thisRef.height == 0) thisRef.height = thisRef.dataHeight = img.height;
				
				if(thisRef._debugDraw) thisRef._drawShape.apply(thisRef);
			}
		});
	};
	
	/**
	 * Draws the debug image for visual queue
	 * @private
	 * @type {function(this:CollisionMap)}
	 */
	CollisionMap.prototype._drawShape = function(){
		this.alpha = 0.25;
		this.data = this._collMask;
		this.scaleX = this.scaleY = this._collMaskScale;
	};
	
	/**
	 * Parses the buffer to simply store a map of nulls and 1
	 * @private
	 * @type {function(this:CollisionMap)}
	 */
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
		
		if(Arstider.bufferPool["CollisionMap_"+thisRef._collMaskUrl]) Arstider.bufferPool["CollisionMap_"+thisRef._collMaskUrl].kill();
	};
	
	/**
	 * Updates the value for a given position
	 * @type {function(this:CollisionMap)}
	 * @param {number} x The x coordinate to update
	 * @param {number} y The y coordinate to update
	 * @param {number|null} value The value to apply at the point
	 */
	CollisionMap.prototype.updateAt = function(x, y, value){
		this._maskData[(Arstider.chop(y/this._collMaskScale) * this.width) + (Arstider.chop(x/this._collMaskScale))] = value;
	};
	
	/**
	 * Detects collision at a given point
	 * @type {function(this:CollisionMap)}
	 * @param {number} x The x coordinate to check
	 * @param {number} y The y coordinate to check
	 * @return {boolean} True if there is a collision (black zone in the mask)
	 */
	CollisionMap.prototype.collisionAt = function(x, y){
		return this._maskData[(Arstider.chop(y/this._collMaskScale) * this.width) + (Arstider.chop(x/this._collMaskScale))] === 1;
	};
	
	return CollisionMap;
});