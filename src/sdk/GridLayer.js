/**
 * Grid Wrapper. 
 * 
 * Provides common private variables and methods for Grids
 *
 * @author frederic charette <fredc@meetfidel.com>
 */	
	
	/**
	 * AMD Closure
	 */	

		define( "Arstider/GridLayer", ["Arstider/DisplayObject"], function (DisplayObject) {
		
			/**
			 * Creates an instance of Grid.
			 *
			 * @constructor
			 * @this {Grid}
			 */
			Arstider.Inherit(GridLayer, DisplayObject);
			function GridLayer(name, data, tileSize, tiles, mapWidth, mapHeight, props){
				Arstider.Super(this, DisplayObject, name);
				
				this.tileSize = tileSize;
				this.tiles = new Array(mapWidth);
				
				this.props = [];
				
				var i = 0, len = tiles.length, p, newTile, off, thisRef = this;
				for(i = 0; i< props.length; i++){
					this.props[props[i].textureId] = props[i].aProps;
				}
				
				for(i = 0; i< mapWidth; i++){
					this.tiles[i] = new Array(mapHeight);
				}
				for(i = 0; i<len; i++){
					newTile = new DisplayObject();
					newTile.x = tiles[i].x*this.tileSize;
					newTile.y = tiles[i].y*this.tileSize;
					newTile.largeData = true;
					newTile.width = this.tileSize;
					newTile.height = this.tileSize;
					newTile.type = tiles[i].type;
					(function(_t){
						_t.loadBitmap("media/images/maps/"+data, function(){
							off = thisRef.getTileTexturePos(_t.type, _t.data.width);
							_t.dataHeight = thisRef.tileSize;
							_t.dataWidth = thisRef.tileSize;
							_t.xOffset = off[0];
							_t.yOffset = off[1];
						});
					})(newTile);
					
					
					if(this.props[tiles[i].type]){
						for(p in this.props[tiles[i].type]){
							if(p == "spawn"){
								this.addChild(new this.props[tiles[i].type][p]());
							}
							else{
								newTile[p] = this.props[tiles[i].type][p];
							}
						}
					}
					this.tiles[tiles[i].x][tiles[i].y] = newTile;
					this.addChild(newTile);
				}
				
				this.centerW = (1136*0.5) - (this.tileSize*0.5);
				this.centerH = (672*0.5) - (this.tileSize*0.5);
			};
			
			GridLayer.prototype.getTileTexturePos = function(id, w){
				var xCoord = id*this.tileSize, yCoord = 0;
				
				while(xCoord >= w){
					xCoord -= (w);
					yCoord += this.tileSize;
				}
				
				return [xCoord, yCoord];
			};
			
			return GridLayer; 
		});