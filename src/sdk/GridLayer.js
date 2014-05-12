/**
 * Grid Layer. 
 *
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */
;(function(){
	
	/**
	 * Finds tile data
	 * @private
	 * @type {function}
	 * @param {number} x The tile x position
	 * @param {number} y The tile y position
	 * @param {Array} data The tileset to look in
	 * @return {Object|null} The tile, if it was found, or null
	 */
	function findTile(x, y, data){
		var i = data.length-1;
		
		for(i; i>=0; i--){
			if(data[i].x === x && data[i].y === y) return data[i];	
		}
		
		return null;
	}
	
	/**
	 * Defines the GridLayer module
	 */	
	define( "Arstider/GridLayer", ["Arstider/DisplayObject", "Arstider/Bitmap"], /** @lends GridLayer */ function (DisplayObject, Bitmap) {
	
		/**
		 * GridLayer constructor
		 * A single layer of tiles in a grid map
		 * @class GridLayer
		 * @constructor
		 * @param {string} name The name of the layer
		 * @param {Object} data The tile data from the JSON map file
		 * @param {number} tileSizeX The width of each tiles
		 * @param {number} tileSizeY The height of each tiles
		 * @param {number} mapWidth The number of tiles in the grid horizontally
		 * @param {number} mapHeight The number of tiles in the grid vertically
		 */
		function GridLayer(name, data, tileSizeX, tileSizeY, mapWidth, mapHeight){
			Arstider.Super(this, DisplayObject);
			
			this.tileSizeX = tileSizeX;
			this.tileSizeY = tileSizeY;
			
			this.name = name;
			
			this.tiles = [];
			
			this.mapData = data.tiles;
			
			this._parseRequested = false;
			this._texturePosSave = {};
			
			var thisRef = this;
			this._data = null;
			var req = new Bitmap(data.asset || Arstider.emptyImgSrc, function(bitmap){
				thisRef._data = this.data;
				thisRef._parseRequested = true;
			});
		};
		
		Arstider.Inherit(GridLayer, DisplayObject);
		
		/**
		 * Gets the position of a texture tile by id
		 * @private
		 * @type {function(this:GridLayer)}
		 * @param {number} id The id of the texture tile
		 * @param {number} w The width of a single tile
		 * @return {Array} The point coordinates of the texture tile [x,y]
		 */
		GridLayer.prototype._getTileTexturePos = function(id, w){
			
			if(this._texturePosSave[id] != undefined) return this._texturePosSave[id];
			else{
				if(Arstider.verbose > 2) console.warn("Arstider.GridLayer._getTileTexturePos: texture tile not found");
			}
			
			var xCoord = id*this.tileSizeX, yCoord = 0;
			
			while(xCoord >= w){
				xCoord -= (w);
				yCoord += this.tileSizeY;
			}
			
			this._texturePosSave[id] = [xCoord, yCoord];
			return this._texturePosSave[id];
		};
		
		/**
		 * Creates a tile Object at the specified spot
		 * @private
		 * @type {function(this:GridLayer)}
		 * @param {number} x The x coordinate
		 * @param {number} y The y coordinate
		 */
		GridLayer.prototype._createTile = function(x, y){
			
			var dataTile = findTile(x, y, this.mapData);
			
			if(dataTile == undefined) return Arstider.emptyObject;
			
			var ret = new DisplayObject({
				x:(x*this.tileSizeX),
				y:(y*this.tileSizeY),
				name:this.name + "_tile_"+x+"_"+y,
				width:this.tileSizeX,
				height:this.tileSizeY
			});
			
			if(dataTile.tileId != undefined){
				ret.data = this._data;
				ret.dataWidth = this.tileSizeX;
				ret.dataHeight = this.tileSizeY;
				
				ret.largeData = true;
				
				ret.xOffset = this._getTileTexturePos(dataTile.tileId, this._data.width)[0];
				ret.yOffset = this._getTileTexturePos(dataTile.tileId)[1];
			}
			
			if(dataTile.spawns && dataTile.spawns.length > 0){
				for(var i = 0; i< dataTile.spawns.length;i++){
					(function(_ret, _spawns, _i, _x, _y){
						try{
							require([_spawns[_i].module], function(spwn){
								if(_ret.spawns == undefined) _ret.spawns = [];
								
								if(_spawns[_i].props == undefined) _spawns[_i].props = {};
								if(_spawns[_i].props.x == undefined) _spawns[_i].props.x = _x;
								if(_spawns[_i].props.y == undefined) _spawns[_i].props.y = _y;
								
								_ret.spawns.push(new spwn(_spawns[_i].props));
							});
						}
						catch(e){
							console.warn("Spawn error:", e);
						}
					})(ret, dataTile.spawns, i, x*this.tileSizeX, y*this.tileSizeY);
				}
			}
			
			return ret;
		};
		
		/**
		 * Parses the field of view, so to only render and update tiles on screen
		 * @parse
		 * @type {function(this:GridLayer)}
		 */
		GridLayer.prototype._parseFOV = function(){
			this.children = [];
			
			var 
				rz = this.parent._getRenderZone(),
				i,
				u
			;
			
			for(i = rz[0]; i<rz[1]; i++){
				if(i>=0 && i<=this.parent.mapWidth){
					if(this.tiles[i] == undefined) this.tiles[i] = [];
					
					for(u = rz[2]; u<rz[3]; u++){
						if(u>=0 && u<=this.parent.mapHeight){
							if(this.tiles[i][u] == undefined) this.tiles[i][u] = this._createTile(i, u);
							
							//place tile in children tile
							if(this.tiles[i][u].data != null) this.children[this.children.length] = this.tiles[i][u];
							
							if(this.tiles[i][u].spawns && this.tiles[i][u].spawns.length != 0) this.children = this.children.concat(this.tiles[i][u].spawns);
						}
					}
				}
			}
		};
			
		/**
		 * Overrides the DisplayObject's update method to parse the field of view
		 * @override
		 * @type {function(this:GridLayer)}
		 */
		GridLayer.prototype.update = function(){
			if(this._parseRequested) this._parseFOV();
			else this.cancelBubble();
		};
		
		return GridLayer; 
	});
})();
