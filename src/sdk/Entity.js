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
	define("Arstider/Entity", ["Arstider/Buffer"], function(Buffer){
			
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
			 * Name of the data's buffer/ image url. Can be used for memory management.
			 * @type {string|null}
			 */
			this.dataUrl = null;
			
			/**
			 * Is element a mask for inferior layers
			 * @type {boolean}
			 */
			this.mask = false;
			
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
			 * User-defined behavior when element is updated before a draw
			 * @override
			 * @type {function(this:Entity)}
			 */
			this.update = Arstider.emptyFunction;
			
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
		};
		
		/**
		 * Private logic when element is hovered
		 * @this {Entity}
		 * @protected
		 */
		Entity.prototype._onhover = function(){
			this._hovered = true;
			
			this.onhover();
		};
		
		/**
		 * Private logic when element is left
		 * @this {Entity}
		 * @protected
		 */
		Entity.prototype._onleave = function(){
			this._hovered = false;
			
			this.onleave();
		};
		
		/**
		 * Private logic when element is pressed
		 * @this {Entity}
		 * @protected
		 */
		Entity.prototype._onpress = function(){
			this._pressed = true;
			
			this.onpress();
		};
		
		/**
		 * Private logic when element is released
		 * @this {Entity}
		 * @protected
		 */
		Entity.prototype._onrelease = function(){
			this._pressed = false;
			
			this.onrelease();
		};
		
		/**
		 * Private logic with each frame updates (see core/Performance for draw vs update skips)
		 * @this {Entity}
		 * @protected
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
					this.x = this.parent.x + (this.parent.width * this._dockX) - (this.width * this._dockX);
				}
				if(this._dockY != null){
					this.y = this.parent.y + (this.parent.height * this._dockY) - (this.width * this._dockY);
				}
			}
			
			this.update();
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
		 * Checks if coordinates fit in the global location of the Entity
		 * @this {Entity}
		 * @param {number} x The x coordinate to check against.
		 * @param {number} y The y coordinate to check against.
		 * @return {boolean} Are the coordinates within the zone of the Entity
		 */
		Entity.prototype.isTouched = function(x,y){
			
			if(x > this.global.x && x < (this.global.x + this.global.width)){
				if(y > this.global.y && y < (this.global.y + this.global.height)) return true;
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
					console.warn("No re-order occured.");
				}
			}
			else{
				console.warn("Element has no parent!");
			}
			
			return this;
		};
			
		/**
		 * Gets the index of the Entity inside it's parent's array - must be parented
		 * @this {Entity}
		 * @returns {number} Returns the element index
		 */
		Entity.prototype.getIndex = function(index) {
			if(this.parent){
				return this.parent.children.indexOf(this);
			}
			else{
				console.warn("Element has no parent!");
			}
			
			return -1;
		};
		
		/**
		 * Kills the Entity's Buffer(s).
		 * @this {Entity}
		 */
		Entity.prototype.killBuffer = function(){
			this.data = null;
			this.dataCtx = null;
			Buffer.kill(this.name);
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