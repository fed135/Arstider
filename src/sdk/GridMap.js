/**
 * Grid Map. 
 *
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the GridMap module
 */
define( "Arstider/GridMap", ["Arstider/GridLayer", "Arstider/DisplayObject", "Arstider/Viewport"], function (GridLayer, DisplayObject, Viewport) {
		
	/**
	 * Creates an instance of GridMap.
	 * @constructor
	 * @this {GridMap}
	 * @param {Object} name The JSON loaded object of the map
	 */
	function GridMap(map) {
		Arstider.Super(this, DisplayObject);
		
		this.layers = [];
		
		this.mapWidth = parseInt(map.width);
		this.mapHeight = parseInt(map.height);
		
		this.fov = parseInt(map.fov);
		
		this.tileSizeX = parseInt(map.tileSizeX);
		this.tileSizeY = parseInt(map.tileSizeY);				
				
		this.width = this.mapWidth*this.tileSizeX;
		this.height = this.mapHeight*this.tileSizeY;
				
		this.__renderZone = [];
		this.__safeKey = Math.random()*2;
			
		for(var i in map.layers){
			this.addLayer(i, map.layers[i]);
		}
	};
			
	Arstider.Inherit(GridMap, DisplayObject);
	
	/**
	 * Adds a layer to the map
	 * @type {function(this:GridMap)}
	 * @param {string} name The name of the layer
	 * @param {Object} layer The layer Object from the JSON file to add
	 */	
	GridMap.prototype.addLayer = function(name, layer){
		this.layers[name] = new GridLayer(name, layer, this.tileSizeX, this.tileSizeY, this.mapWidth, this.mapHeight);
		this.addChild(this.__safeKey, this.layers[name]);
	};
	
	/**
	 * Removes a layer
	 * @type {function(this:GridMap)}
	 * @param {string} name The name of the layer to remove
	 */
	GridMap.prototype.removeLayer = function(name){
		this.removeChild(this.layers[name]);
		delete this.layers[name];
	};
	
	/**
	 * Returns the checked __collidable value of the selected tile
	 * @type {function(this:GridMap)}
	 * @param {string} layer The name of the layer
	 * @param {number} x The x coordinate
	 * @param {number} y The y coordinate
	 * @return {boolean} Whether or not the tile is 'steppable'
	 */
	GridMap.prototype.canStep = function(layer, x, y){
		var tile = this.getTile(layer, x, y);
		if(tile != null) return !tile.__collidable === 1;
		
		return true;
	};
	
	/**
	 * Returns a specific tile
	 * @type {function(this:GridMap)}
	 * @param {string} layer The layer name 
	 * @param {number} x The x coordinate
	 * @param {number} y The y coordinate
	 * @return {Object|null} The tile
	 */
	GridMap.prototype.getTile = function(layer, x,y){
		if(this[layer].tiles[x]) return this[layer].tiles[x][y];
		return null;
	};
	
	/**
	 * Gets the render zone coordinate (tiles on screen)
	 * @private
	 * @type {function(this:GridMap)}
	 * @return {Array} The render zone
	 */
	GridMap.prototype._getRenderZone = function(){
		this.__renderZone[0] = (Math.ceil(this.global.x/ this.tileSizeX)*-1) - this.fov;
		this.__renderZone[1] = this.__renderZone[0] + (Math.ceil(Viewport.maxWidth / this.tileSizeX)+(this.fov*2));
		this.__renderZone[2] = (Math.ceil(this.global.y/ this.tileSizeY)*-1) - this.fov;
		this.__renderZone[3] = this.__renderZone[2] + (Math.ceil(Viewport.maxHeight / this.tileSizeY)+(this.fov*2));
		
		return this.__renderZone;
	};
	
	/**
	 * Overrides DisplayObject's addChild method to protect from pollution (only layers from the addLayer method are accepted)
	 * @override
	 * @private
	 * @type {function(this:GridMap)}
	 * @param {number} safeKey The GridMap's private key
	 * @param {Object} element The element to add to the GridMap's children object
	 */
	GridMap.prototype.addChild = function(safeKey, element){
		var 
			i,
			pastIndex = 0
		;
				
		if(safeKey === this.__safeKey){
			element.parent = this;
			
			if(this.children.length == 0){
				this.children.push(element);
			}
			else{
				for(i = 0; i<this.children.length; i++){
					if(this.children[i].index > element.index && pastIndex <= element.index){
						this.children.splice(i,0,element);
						return;
					}
					pastIndex = this.children[i].index;
				}
				this.children.push(element);
			}
		}
		else{
			if(Arstider.verbose > 0) console.warn("Arstider.GridMap.addChild: operation was cancelled, cannot addChild on a GridMap object, must perform operation on a GridLayer");
		}
	};
			
	return GridMap; 
});