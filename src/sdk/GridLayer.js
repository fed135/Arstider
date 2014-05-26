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
        
        var 
            /**
             * Constant for minimum locked texture chunk size
             * @private
             * @const
             * @type Number
             */
            minChunkSize = 860
        ;
	
	/**
	 * Defines the GridLayer module
	 */	
	define( "Arstider/GridLayer", ["Arstider/DisplayObject", "Arstider/Bitmap", "Arstider/Buffer", "Arstider/Preloader"], /** @lends GridLayer */ function (DisplayObject, Bitmap, Buffer, Preloader) {
	
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
            this.chunks = [];
            this.locked = false;
            this._lockRequested = false;
			
			this.mapData = data.tiles;
			
			this._parseRequested = false;
			this._texturePosSave = {};
			
			var thisRef = this;
			this._data = null;
			Preloader.progress("_mapLayer"+this.name+"Setup", 0);
			var req = new Bitmap(data.asset || Arstider.emptyImgSrc, function(bitmap){
				thisRef._data = this.data;
				thisRef._parseRequested = true;
				thisRef._parseFOV.apply(thisRef, [[0,mapWidth,0, mapHeight]]);
                thisRef._prepareChunks.apply(thisRef);
                Preloader.progress("_mapLayer"+thisRef.name+"Setup", 100);
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
						Preloader.progress("_mapSpawn"+_i+"_"+_x+"_"+_y+_spawns[_i].module, 0);
						
						try{
							require([_spawns[_i].module], function(spwn){
								if(_ret.spawns == undefined) _ret.spawns = [];
								
								if(_spawns[_i].props == undefined) _spawns[_i].props = {};
								if(_spawns[_i].props.x == undefined) _spawns[_i].props.x = _x;
								if(_spawns[_i].props.y == undefined) _spawns[_i].props.y = _y;
								
								_ret.spawns.push(new spwn(_spawns[_i].props));
								Preloader.progress("_mapSpawn"+_i+"_"+_x+"_"+_y+_spawns[_i].module, 100);
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
                 * 
                 * @returns {function(this:GridLayer)}
                 */
                GridLayer.prototype.lock = function(){
                	if(!this._parseRequested){
                		this._lockRequested = true;
                		return;
                	}
                    
                    var buffer = new Buffer({
                            width:this.chunks[0].width,
                            height:this.chunks[0].height,
                            name:"__mapChunkBuffer"
                    });
                    
                    var x=0, y=0, tile;
                    for(var i = 0; i< this.chunks.length; i++){
                    	this.chunks[i].alpha = 1;
                    	buffer.setSize(this.chunks[i].width,this.chunks[i].height);

                    	while(x + this.chunks[i]._startTileX < this.chunks[i]._endTileX){
                    		while(y + this.chunks[i]._startTileY < this.chunks[i]._endTileY){
                    			if(this.tiles[x + this.chunks[i]._startTileX]){
                    				if(this.tiles[x + this.chunks[i]._startTileX][y + this.chunks[i]._startTileY]){
                    					tile = this.tiles[x + this.chunks[i]._startTileX][y + this.chunks[i]._startTileY];
                    					if(tile.data != null){
                    						buffer.context.drawImage(tile.data, tile.xOffset, tile.yOffset, tile.dataWidth, tile.dataHeight, x*this.tileSizeX, y*this.tileSizeY, this.tileSizeX, this.tileSizeY);
                    						tile._dataLocked = tile.data;
                    						tile.data = null;
                    						//tile.alpha = 0;
                    					}
                    				}
                    			}
                    			y++;
                    		}
                    		y = 0;
                    		x++;
                    	}
                    	this.chunks[i].loadBitmap(buffer.getURL());
                    }
                    
                    buffer.kill();
                    this.locked = true;
                };
                
                GridLayer.prototype.unlock = function(){
                	if(this._lockRequested){
                		this._lockRequested = false;
                		return;
                	}
                	
                    for(var i = 0; i< this.chunks.length; i++){
                    	this.chunks[i].killBuffer();
                    	this.chunks[i].alpha = 0;
                    }
                    
                    for(var x = 0; x< this.tiles.length; x++){
                    	for(var y = 0; y< this.tiles[x].length; y++){
                    		if(this.tiles[x][y] && this.tiles[x][y]._dataLocked){
                    			this.tiles[x][y].data = this.tiles[x][y]._dataLocked;
                    			this.tiles[x][y]._dataLocked = null;
                    		}
                    	}
                    }
                    this.locked = false;
                };
                
                GridLayer.prototype._prepareChunks = function(){
                    var 
                        chunk = null,
                        tilesPerChunkX = Math.ceil(minChunkSize/this.tileSizeX),
                        numChunksX = Math.ceil(this.parent.mapWidth/tilesPerChunkX),
                        tilesPerChunkY = Math.ceil(minChunkSize/this.tileSizeY),
                        numChunksY = Math.ceil(this.parent.mapHeight/tilesPerChunkY),
                        i=0,
                        u=0
                    ;
                    
                    while(i<numChunksX){
                        while(u<numChunksY){
                            chunk = new DisplayObject({
                                x:(i*(tilesPerChunkX*this.tileSizeX)),
                                y:(u*(tilesPerChunkY*this.tileSizeY)),
                                height:(tilesPerChunkY*this.tileSizeY),
                                width:(tilesPerChunkX*this.tileSizeX)
                            });
                            chunk._startTileX = (i*(tilesPerChunkX*this.tileSizeX));
                            chunk._startTileY = (u*(tilesPerChunkY*this.tileSizeY));
                            chunk._endTileX = chunk._startTileX + tilesPerChunkX;
                            chunk._endTileY = chunk._startTileY + tilesPerChunkY;
                            chunk._numTilesX = tilesPerChunkX;
                            chunk._numTilesY = tilesPerChunkY;
                            
                            if(chunk._endTileX > this.parent.mapWidth){
                            	chunk.width -= (chunk._endTileX - this.parent.mapWidth)*this.tileSizeX;
                            	chunk._endTileX = this.parent.mapWidth;
                            }
                            if(chunk._endTileY > this.parent.mapHeight){
                            	chunk.height -= (chunk._endTileY - this.parent.mapHeight)*this.tileSizeY;
                            	chunk._endTileY = this.parent.mapHeight;
                            }
                            
                            this.chunks.push(chunk);
                            
                            u++;
                        }
                        u=0;
                        i++;
                    }
                };
		
		/**
		 * Parses the field of view, so to only render and update tiles on screen
		 * @parse
		 * @type {function(this:GridLayer)}
		 */
		GridLayer.prototype._parseFOV = function(fov){
			
			this.children = [];
			
			var 
				rz = fov || this.parent._getRenderZone(),
				i,
				u,
				spawns = []
			;
			
			for(i = rz[0]; i<rz[1]; i++){
				if(i>=0 && i<=this.parent.mapWidth){
					if(this.tiles[i] == undefined) this.tiles[i] = [];
					
					for(u = rz[2]; u<rz[3]; +u++){
						if(u>=0 && u<=this.parent.mapHeight){
							
							if(this.tiles[i][u] == undefined) this.tiles[i][u] = this._createTile(i, u);
							
							if(!this.locked){
								if(this.tiles[i][u].data != null) this.children[this.children.length] = this.tiles[i][u];
							}
							
							if(this.tiles[i][u].spawns && this.tiles[i][u].spawns.length != 0) spawns = spawns.concat(this.tiles[i][u].spawns);
						}
					}
				}
			}
			
			if(this.locked){
				for(i = 0; i<this.chunks.length; i++){
					if(this.chunks[i]._startTileX < rz[1] && this.chunks[i]._endTileX > rz[0] && this.chunks[i]._startTileY < rz[3] && this.chunks[i]._endTileY > rz[2]){
						this.children[this.children.length] = this.chunks[i];
					}
				}
			}
			
			this.children = this.children.concat(spawns);
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
