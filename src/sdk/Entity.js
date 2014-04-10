/**
 * Entity
 *
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */	

;(function(){
		
	var 
		/**
		 * If no name is provided when creating an entity, assigns a number
		 * @private
		 * @type {number}
		 */
		staticAnonymousCounter = 0,
		
		/**
		 * Default composition mode 
		 * @const
		 * @private
		 * @type {string}
		 */
		defaultComposition = "source-over",
		
		/**
		 * Default shadow color
		 * @const
		 * @private
		 * @type {string}
		 */
		defaultShadowColor = "transparent",
		
		/**
		 * Anonymous name prefix
		 * @const
		 * @private
		 * @type {string}
		 */
		prefix = "entity"
	;
		
	/**
	 * Defines the Entity module
	 */
	define("Arstider/Entity", [], function(){
			
		/**
		 * Creates an instance of Entity.
		 *
		 * @constructor
		 * @this {Entity}
		 * @param {Object=} props Can optionally overwrite build properties of the entity    
		 */
		function Entity(props){
			
			/**
			 * If props is undefined, use the Engine's empty object constant
			 */
			props = props || Arstider.emptyObject;	
				
			/** 
			 * Name of the element
			 * @type {string} 
			 */
			this.name = props.name || ( prefix + (++staticAnonymousCounter) );
				
			/**
			 * Opacity of the element
			 * @type {number}
			 */
			this.alpha = Arstider.checkIn(props.alpha, 1); 
				
			/**
			 * X position of the element
			 * @type {number}
			 */
			this.x = Arstider.checkIn(props.x, 0);
			
			/**
			 * Y position of the element
			 * @type {number}
			 */
			this.y = Arstider.checkIn(props.y, 0);
			
			/**
			 * Width of the element
			 * @type {number}
			 */
			this.width = Arstider.checkIn(props.width, 0);
			
			/**
			 * Height of the element
			 * @type {number}
			 */
			this.height = Arstider.checkIn(props.height, 0);
			
			/**
			 * Horizontal scale of the element
			 * @type {number}
			 */
			this.scaleX = Arstider.checkIn(props.scaleX, 1);
			
			/**
			 * Vertical scale of the element
			 * @type {number}
			 */
			this.scaleY = Arstider.checkIn(props.scaleY, 1);
			
			/**
			 * X Skew of the element
			 * @type {number}
			 */
			this.skewX = Arstider.checkIn(props.skewX, 0);
			
			/**
			 * Y Skew of the element
			 * @type {number}
			 */
			this.skewY = Arstider.checkIn(props.skewY, 0);
			
			/**
			 * Rotation of the element in degrees
			 * @type {number}
			 */
			this.rotation =	Arstider.checkIn(props.rotation, 0);
			
			/**
			 * Horizontal reference point of the element for transformations (0-1)
			 * @type {number}
			 */
			this.rpX = Arstider.checkIn(props.rpX, 0);
			
			/**
			 * Vertical reference point of the element for transformations (0-1)
			 * @type {number}
			 */
			this.rpY = Arstider.checkIn(props.rpY, 0);
			
			/**
			 * Indicates if the element is on stage 
			 * @type {boolean}
			 */
			this.onStage = false;
			
			/**
			 * Global values for the element's properties. Updated by the renderer. (Read-only)
			 * @type {Object}
			 */
			this.global = {
				alpha:null,
				x:null,
				y:null,
				rotation:null,
				scaleX:null,
				scaleY:null
			};
			
			/**
			 * Data to render
			 * @type {HTMLCanvasElement|Image|null}
			 */
			this.data = null;
			
			/**
			 * Is element a mask for inferior layers
			 * @type {boolean}
			 */
			this.mask = false;
			
			/**
			 * Element's shadow color
			 * @type {string}
			 */
			this.shadowColor = Arstider.checkIn(props.shadowColor, defaultShadowColor);
			
			/**
			 * Element's shadow blur
			 * @type {number}
			 */
			this.shadowBlur = Arstider.checkIn(props.shadowBlur, 0);
			
			/**
			 * Element's shadow horizontal offset
			 * @type {number}
			 */
			this.shadowOffsetX = Arstider.checkIn(props.shadowOffsetX, 0);
			
			/**
			 * Element's shadow vertical offset
			 * @type {number}
			 */
			this.shadowOffsetY = Arstider.checkIn(props.shadowOffsetY, 0);
			
			/**
			 * Composite mode to draw the data in. Cancels masking!
			 * @type {string}
			 */
			this.compositeMode = Arstider.checkIn(props.compositeMode, defaultComposition);
			
			/**
			 * Drawing horizontal offset of the data
			 * @type {number}
			 */
			this.xOffset = Arstider.checkIn(props.xOffset, 0);
			
			/**
			 * Drawing vertical offset of the data
			 * @type {number}
			 */
			this.yOffset = Arstider.checkIn(props.yOffset, 0);
			
			/**
			 * Drawing width portion of the data
			 * @type {number}
			 */
			this.dataWidth = Arstider.checkIn(props.dataWidth, 0);
			
			/**
			 * Drawing height portion of the data
			 * @type {number}
			 */
			this.dataHeight = Arstider.checkIn(props.dataHeight, 0);
	
			/**
			 * Enables data slicing (xOffset, yOffset, dataWidth, dataHeight)
			 * @type {boolean}
			 */	
			this.largeData = false;
	
			/**
			 * The element's parent
			 * @type {*}
			 */	
			this.parent = null;			
			
			/**
			 * User-defined behavior when element is pressed
			 * @override
			 * @type {function(this:Entity)}
			 */
			this.onpress = Arstider.checkIn(props.onpress, Arstider.emptyFunction);
			
			/**
			 * User-defined behavior when element is pressed
			 * @override
			 * @type {function(this:Entity)}
			 */
			this.onrelease = Arstider.checkIn(props.onrelease, Arstider.emptyFunction);
			
			/**
			 * User-defined behavior when element is pressed
			 * @override
			 * @type {function(this:Entity)}
			 */
			this.onhover = Arstider.checkIn(props.onhover, Arstider.emptyFunction);
			
			/**
			 * User-defined behavior when element is pressed
			 * @override
			 * @type {function(this:Entity)}
			 */
			this.onleave = Arstider.checkIn(props.onleave, Arstider.emptyFunction);
			
			/**
			 * User-defined behavior when element is pressed, then released
			 * @override
			 * @type {function(this:Entity)}
			 */
			this.onclick = Arstider.checkIn(props.onclick, Arstider.emptyFunction);
			
			/**
			 * User-defined behavior when element is pressed with the right mouse button, then released
			 * @override
			 * @type {function(this:Entity)}
			 */
			this.onrightclick = Arstider.checkIn(props.onrightclick, Arstider.emptyFunction);
			
			/**
			 * User-defined behavior when element is pressed with the right mouse button, then released
			 * @override
			 * @type {function(this:Entity)}
			 */
			this.ondoubleclick = Arstider.checkIn(props.ondoubleclick, Arstider.emptyFunction);
			
			/**
			 * User-defined behavior when element data has finished loading
			 * @override
			 * @type {function(this:Entity)}
			 */
			this.onload = Arstider.checkIn(props.onload, Arstider.emptyFunction);
			
			/**
			 * User defined behavior for synchronous logic before a draw
			 * @override
			 * @type {function(this:Entity)}
			 */
			this.draw = Arstider.emptyFunction;
			
			/**
			 * Whether or not to display de debug outline
			 * @type {boolean}
			 */
			this.showOutline = false;
			
			/**
			 * Whenever the element is hovered
			 * @private
			 * @type {boolean}
			 */
			this._hovered = false;
			
			/**
			 * Whenever the element is pressed
			 * @private
			 * @type {boolean}
			 */
			this._pressed = false;
			
			/**
			 * Whenever an element is entered with mouse up, used to determine click behavior
			 * @private
			 * @type {boolean}
			 */
			this._preclick = false;
			
			/**
			 * Whenever the element is pressed with the right mouse button
			 * @private
			 * @type {boolean}
			 */
			this._rightPressed = false;
			
			/**
			 * Double-click delay saver
			 * @private
			 * @type {number}
			 */
			this._doubleClickCheck = 0;
			
			/**
			 * Double-click max delay
			 * @type {number}
			 */
			this._doubleClickDelay = 250;
			
			/**
			 * Defines horizontal docking option
			 * @private
			 * @type {string|number|null}
			 */
			this._dockX = null;
			
			/**
			 * Defines vertical docking option
			 * @private
			 * @type {string|number|null}
			 */
			this._dockY = null;
			
			/**
			 * Defines horizontal filling option
			 * @private
			 * @type {string|number|null}
			 */
			this._fillX = null;
			
			/**
			 * Defines vertical filling option
			 * @private
			 * @type {string|number|null}
			 */
			this._fillY = null;
			
			/**
			 * Flag to skip update propagation
			 * @private
			 * @type {boolean}
			 */
			this._skipUpdateBubble = false;
			
			/**
			 * Flag to drag element
			 * @private
			 * @type {boolean} 
			 */
			this._dragged = false;
			
			/**
			 * Flag to bound dragging to parent
			 * @private
			 * @type {boolean}
			 */
			this._boundDrag = false;
			
			/**
			 * Drag x offset
			 * @private
			 * @type {number}
			 */
			this._dragOffsetX = 0;
			
			/**
			 * Drag y offset
			 * @private
			 * @type {number}
			 */
			this._dragOffsetY = 0;
		};
		
		/**
		 * User-defined behavior for asynchronous, constant logic (60 times per sec)
		 * @override
		 * @type {function(this:Entity)}
		 */
		Entity.prototype.update = Arstider.emptyFunction;
		
		/**
		 * Private logic when element is hovered
		 * @this {Entity}
		 * @protected
		 * @type {function(this:Entity)}
		 */
		Entity.prototype._onhover = function(){
			this._hovered = true;
			
			this.onhover();
		};
		
		/**
		 * Private logic when element is left
		 * @this {Entity}
		 * @protected
		 * @type {function(this:Entity)}
		 */
		Entity.prototype._onleave = function(){
			this._hovered = false;
			this._preclick = false;
			this._rightPressed = false;
			
			this.onleave();
		};
		
		/**
		 * Private logic when element is pressed
		 * @this {Entity}
		 * @protected
		 * @type {function(this:Entity)}
		 */
		Entity.prototype._onpress = function(){
			this._pressed = true;
			
			this.onpress();
		};
		
		/**
		 * Private logic when element is released
		 * @this {Entity}
		 * @protected
		 * @type {function(this:Entity)}
		 */
		Entity.prototype._onrelease = function(){
			this._pressed = false;
			
			var time = Arstider.timestamp();
			
			if(this._preclick){
				if(time - this._doubleClickCheck < this._doubleClickDelay && this.ondoubleclick != Arstider.emptyFunction) this.ondoubleclick();
				else this.onclick();
				
				this._doubleClickCheck = time;
			}
			this.onrelease();
			
			this._preclick = false;
		};
		
		/**
		 * Private logic when element is clicked with the right mouse button
		 * @this {Entity}
		 * @protected
		 * @type {function(this:Entity)}
		 */
		Entity.prototype._onrightclick = function(){
			this._rightPressed = false;
			this.onrightclick();
		};
		
		/**
		 * Private logic with each frame updates (see core/Performance for draw vs update skips)
		 * @this {Entity}
		 * @protected
		 * @type {function(this:Entity)}
		 */
		Entity.prototype._update = function(){
			
			/**
			 * Check for docking options
			 */
			if(this.parent != null){
				if(this._fillX != null){
					this.width = this.parent.width * this._fillX;
				}
				if(this._fillY != null){
					this.height = this.parent.height * this._fillY;
				}
				if(this._dockX != null){
					this.x = (this.parent.width * this._dockX) - (this.width * this._dockX);
				}
				if(this._dockY != null){
					this.y = (this.parent.height * this._dockY) - (this.height * this._dockY);
				}
			}
			
			if(!this._skipUpdateBubble) this.update();
			
			if(this.children && this.children.length > 0){
				for(var i = 0; i<this.children.length; i++){
					if(this.children[i] && this.children[i]._update){
						if(this._skipUpdateBubble && this.children[i].cancelBubble) this.children[i].cancelBubble();
						this.children[i]._update();
					}
				}
			}
			
			if(this._skipUpdateBubble) this._skipUpdateBubble = false;
		};
		
		/**
		 * Starts dragging the element, following the mouse
		 * @this {Entity}
		 * @param {boolean|null} snapToCenter Whether to snap the dragged object centered with the pointer.
		 * @param {boolean|null} bound Whether to bound the dragging to the confines of the parent
		 */
		Entity.prototype.startDrag = function(snapToCenter, bound){
			var thisRef = this;
			
			if(this.parent == null){
				if(Arstider.verbose > 0) console.warn("Arstider.Entity.startDrag: cannot drag an element with no parent");
			}
			
			require(["Arstider/Mouse"], function(Mouse){
				var mouseX = Mouse.x();
				var mouseY = Mouse.y();
				
				thisRef._dragged = true;
				if(snapToCenter || mouseX == -1 || mouseY == -1){
					thisRef._dragOffsetX = thisRef.width*0.5;
					thisRef._dragOffsetY = thisRef.height*0.5;
				}
				else{
					thisRef._dragOffsetX = mouseX - thisRef.global.x;
					thisRef._dragOffsetY = mouseY - thisRef.global.y;
				}
				
				thisRef._boundDrag = bound || false;
			});
		};
		
		/**
		 * Stops dragging the element
		 * @this {Entity}
		 */
		Entity.prototype.stopDrag = function(){
			var thisRef = this;
			setTimeout(function(){
				thisRef._dragged = false;
				thisRef._dragOffsetX = 0;
				thisRef._dragOffsetY = 0;
				thisRef._boundDrag = false;
			},0);
		};
		
		/**
		 * Sets the value for horizontal and vertical docking of the Entity
		 * @this {Entity}
		 * @param {string|number|null} x The horizontal docking propriety.
		 * @param {string|number|null} y The vertical docking propriety.
		 */
		Entity.prototype.dock = function(x, y){
			if(x === "left") this._dockX = 0;
			else if(x === "center") this._dockX = 0.5;
			else if(x === "right") this._dockX = 1;
			else this._dockX = x || null;
			
			if(y === "top") this._dockY = 0;
			else if(y === "center") this._dockY = 0.5;
			else if(y === "bottom") this._dockY = 1;
			else this._dockY = y || null;
		};
		
		/**
		 * Sets the value for horizontal and vertical filling of the Entity
		 * @this {Entity}
		 * @param {string|number|null} x The horizontal filling propriety.
		 * @param {string|number|null} y The vertical filling propriety.
		 */
		Entity.prototype.fill = function(x, y){
			if(x === "full") this._fillX = 1;
			else if(x === "half") this._fillX = 0.5;
			else this._fillX = x || null;
			
			if(y === "full") this._fillY = 1;
			else if(y === "half") this._fillY = 0.5;
			else this._fillY = y || null;
		};
		
		/**
		 * Applies filters to element's data
		 * @this {Entity}
		 * @param {string} filter Filter name
		 * @param {?} args extra params
		 */
		Entity.prototype.filter = function(filter){
			if(this.data == null){
				if(Arstider.verbose > 0) console.warn("Arstider.Entity.filter: entity has no data");
				return;
			}
			
			if(Arstider[filter]){
				var ret = Arstider.saveToCanvas(this.name+"Filter_"+filter, this.data);
				var params = (Array.prototype.slice.call(arguments,1)).concat();
				params.unshift(ret);
				this.data = Arstider[filter].apply(window, params);
			}
			else{
				if(Arstider.verbose > 0) console.warn("Arstider.Entity.filter: cannot find filter ", filter);
			}
		};
		
		/**
		 * Checks if coordinates fit in the global location of the Entity
		 * @this {Entity}
		 * @param {number} x The x coordinate to check against.
		 * @param {number} y The y coordinate to check against.
		 * @return {boolean} Are the coordinates within the zone of the Entity
		 */
		Entity.prototype.isTouched = function(x,y){
			if(x > this.global.x && x < this.global.x + (this.global.width/this.global.scaleX)){
				if(y > this.global.y && y < this.global.y + (this.global.height/this.global.scaleY)) return true;
			}
			return false;
		};	
			
		/**
		 * Sets the index of the Entity inside it's parent's array - must be parented
		 * @this {Entity}
		 * @param {number} index
		 * @returns {Entity} Returns the element for chaining
		 */
		Entity.prototype.setIndex = function(index) {
			if(this.parent){
				var myIndex = this.parent.children.indexOf(this);
				if(myIndex > -1 && this.parent.children.length > 1){
					
					//If higher than array size, put at end
					if(index > this.parent.children.length-1){
						index = this.parent.children.length-1;
					}
					
					this.parent.children.splice(index,0,this.parent.children.splice(myIndex,1)[0]);
				}
				else{
					if(Arstider.verbose > 1) console.warn("Arstider.Entity.setIndex: no re-order occured");
				}
			}
			else{
				if(Arstider.verbose > 0) console.warn("Arstider.Entity.setIndex: element has no parent");
			}
			
			return this;
		};
			
		/**
		 * Gets the index of the Entity inside it's parent's array - must be parented
		 * @this {Entity}
		 * @returns {number} Returns the element index
		 */
		Entity.prototype.getIndex = function(index){
			if(this.parent){
				return this.parent.children.indexOf(this);
			}
			else{
				if(Arstider.verbose > 0) console.warn("Arstider.Entity.getIndex: element has no parent");
			}
			
			return -1;
		};
		
		/**
		 * Stops update propagation during that frame
		 */
		Entity.prototype.cancelBubble = function(){
			this._skipUpdateBubble = true;
		};
		
		/**
		 * Kills the Entity's Buffer(s).
		 * @this {Entity}
		 */
		Entity.prototype.killBuffer = function(wipe){
			this.data = null;
			this.dataCtx = null;
			if(wipe){
				(function(_name){
					require(["Arstider/Buffer"],function(Buffer){
						Buffer.kill(_name);
					});
				})(this.name);
			}
		};
			
		/**
		 * Getter for the global 'id' attribute. (Includes parents' value)
		 *
		 * @this {Entity}
		 * @return {string} final value for 'id'
		 */
		Entity.prototype.id = function(){
			if(this.parent){
				if(this.parent.id() != ""){
					return this.parent.id()+"."+this.name;
				}
			}
			return this.name || "";
		};
		
		return Entity; 
	});
})();