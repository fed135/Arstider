/**
 * GridMap Wrapper. 
 * 
 * Provides common private variables and methods for Entities
 *
 * @author frederic charette <fredc@meetfidel.com>
 */	
	
		define( "Arstider/GridMap", ["Arstider/GridLayer", "Arstider/DisplayObject", "Arstider/Viewport"], function (GridLayer, DisplayObject, Viewport) {
		
			/**
			 * Creates an instance of Entity.
			 *
			 * @constructor
			 * @this {Entity}
			 * @param {string} name The desired name of the Entity
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
			
			GridMap.prototype.addLayer = function(name, layer){
				this.layers[name] = new GridLayer(name, layer, this.tileSizeX, this.tileSizeY, this.mapWidth, this.mapHeight);
				this.addChild(this.__safeKey, this.layers[name]);
			};
			
			GridMap.prototype.removeLayer = function(name){
				this.removeChild(this.layers[name]);
				delete this.layers[name];
			};
			
			GridMap.prototype.canStep = function(layer, x, y){
				if(this.layers[layer].tiles[x] && this.layers[layer].tiles[x][y]){
					return !this.layers[layer].tiles[x][y].__collidable === 1;
				}
				return true;
			};
				
			GridMap.prototype.getTile = function(layer, x,y){
				return this[layer].tiles[x][y];
			};
			
			GridMap.prototype._getRenderZone = function(){
				this.__renderZone[0] = (Math.ceil(this.global.x/ this.tileSizeX)*-1) - this.fov;
				this.__renderZone[1] = this.__renderZone[0] + (Math.ceil(Viewport.maxWidth / this.tileSizeX)+(this.fov*2));
				this.__renderZone[2] = (Math.ceil(this.global.y/ this.tileSizeY)*-1) - this.fov;
				this.__renderZone[3] = this.__renderZone[2] + (Math.ceil(Viewport.maxHeight / this.tileSizeY)+(this.fov*2));
				
				return this.__renderZone;
			};
			
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
			}; //Overrides DisplayObject's to protect this layer from pollution
			
			return GridMap; 
		});