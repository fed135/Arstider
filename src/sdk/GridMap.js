/**
 * GridMap Wrapper. 
 * 
 * Provides common private variables and methods for Entities
 *
 * @author frederic charette <fredc@meetfidel.com>
 */	
	
		define( "Arstider/GridMap", ["Arstider/GridLayer", "Arstider/DisplayObject"], function (GridLayer, DisplayObject) {
		
			/**
			 * Creates an instance of Entity.
			 *
			 * @constructor
			 * @this {Entity}
			 * @param {string} name The desired name of the Entity
			 */
			Arstider.Inherit(GridMap, DisplayObject);
			function GridMap(map) {
				Arstider.Super(this, DisplayObject);
				var thisRef = this;
				
				this.asset = null;
				this.lower = null;
				
				//this.mid = new Grid(map.tileSize, map.mid || [], map.width, map.height);
				//this.upper = new Grid(map.tileSize, map.upper || [], map.width, map.height);
				this.parallax = map.parallax || 0;
				
				this.mapWidth = parseInt(map.width);
				this.mapHeight = parseInt(map.height);
				
				this.tileSize = parseInt(map.tileSize);
				this.width = this.mapWidth*this.tileSize;
				this.height = this.mapHeight*this.tileSize;
				
				this.spawns = map.spawns;
				
				this.createLayer("lower", map.lower, map.properties, map.asset);
			};
			
			GridMap.prototype.createLayer = function(name, tiles, props, data){
				this[name] = new GridLayer(name, data, this.tileSize, tiles || [], this.mapWidth, this.mapHeight, props);
				this.addChild(this[name]);
			};
			
			GridMap.prototype.canStep = function(x,y){
				if(this.lower.tiles[x] && this.lower.tiles[x][y]){
					return !this.lower.tiles[x][y].isCollidable == "1";
				}
				return true;
			};
				
			GridMap.prototype.getTile = function(level, x,y){
				return this[level].tiles[x][y];
			};
			
			return GridMap; 
		});