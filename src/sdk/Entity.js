/**
 * Entity
 *
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */	
define("Arstider/Entity", [], /** @lends Entity */ function(){

	Entity.anonymousEntities = 0;

	Entity.PASSIVE = 0;
	Entity.ACTIVE = 1;
	Entity.COMPLEX = 2;

	/**
	 * Entity constructor
	 * Most basic form of stage element, core class
	 * @class Entity
	 * @constructor
	 * @param {Object|null} props Can optionally overwrite build properties of the entity    
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
		this.name = props.name || ( "entity" + (++Entity.anonymousEntities) );
			
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
			alpha:1,
			x:0,
			y:0,
			rotation:0,
			scaleX:1,
			scaleY:1,
			skewX:0,
			skewY:0,
			width:0,
			height:0
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
		this.shadowColor = Arstider.checkIn(props.shadowColor, Arstider.defaultColor);
		
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
		this.compositeMode = Arstider.checkIn(props.compositeMode, Arstider.defaultComposition);
		
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
		this.largeData = Arstider.checkIn(props.largeData, false);

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
		this.onpress = Arstider.checkIn(props.onpress, null);
		
		/**
		 * User-defined behavior when element is pressed
		 * @override
		 * @type {function(this:Entity)}
		 */
		this.onrelease = Arstider.checkIn(props.onrelease, null);
		
		/**
		 * User-defined behavior when element is pressed
		 * @override
		 * @type {function(this:Entity)}
		 */
		this.onhover = Arstider.checkIn(props.onhover, null);
		
		/**
		 * User-defined behavior when element is pressed
		 * @override
		 * @type {function(this:Entity)}
		 */
		this.onleave = Arstider.checkIn(props.onleave, null);
		
		/**
		 * User-defined behavior when element is pressed, then released
		 * @override
		 * @type {function(this:Entity)}
		 */
		this.onclick = Arstider.checkIn(props.onclick, null);
		
		/**
		 * User-defined behavior when element is pressed with the right mouse button, then released
		 * @override
		 * @type {function(this:Entity)}
		 */
		this.onrightclick = Arstider.checkIn(props.onrightclick, null);
		
		/**
		 * User-defined behavior when element is pressed with the right mouse button, then released
		 * @override
		 * @type {function(this:Entity)}
		 */
		this.ondoubleclick = Arstider.checkIn(props.ondoubleclick, null);
		
		/**
		 * User-defined behavior when element data has finished loading
		 * @override
		 * @type {function(this:Entity)}
		 */
		this.onload = Arstider.checkIn(props.onload, null);
		
		/**
		 * Whether or not to display de debug outline
		 * @type {boolean}
		 */
		this.showOutline = Arstider.checkIn(props.showOutline, false);
		
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
		this._dockX = Arstider.checkIn(props.dockX, null);
		
		/**
		 * Defines vertical docking option
		 * @private
		 * @type {string|number|null}
		 */
		this._dockY = Arstider.checkIn(props.dockY, null);
		
		/**
		 * Defines horizontal filling option
		 * @private
		 * @type {string|number|null}
		 */
		this._fillX = Arstider.checkIn(props.fillX, null);
		
		/**
		 * Defines vertical filling option
		 * @private
		 * @type {string|number|null}
		 */
		this._fillY = Arstider.checkIn(props.fillX, null);
		
		/**
		 * Flag to skip update propagation
		 * @private
		 * @type {boolean}
		 */
		this._skipUpdateBubble = false;

		this._skipUpdate = 0;
		
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
		/**
		 * Called after disposal of data
		 * @type {function(this:Entity)}
		 */
		this.onunload = Arstider.checkIn(props.onunload, null);
		/**
		 * Complex interactive element - prevents intensive lookup
		 * @type {boolean}
		 */
		this.touchAccuracy = Arstider.checkIn(props.touchAccuracy, Entity.ACTIVE);
		if(props.update) this.update = props.update;
	};
	
	/**
	 * User-defined behavior for asynchronous, constant logic
	 * @override
	 * @type {function(this:Entity)}
	 */
	Entity.prototype.update = null;
	
	/**
	 * Private logic when element is hovered
	 * @protected
	 * @type {function(this:Entity)}
	 */
	Entity.prototype._onhover = function(e){
		this._hovered = true;
		
		if(this.onhover) this.onhover(e);
	};
	
	/**
	 * Private logic when element is left
	 * @protected
	 * @type {function(this:Entity)}
	 */
	Entity.prototype._onleave = function(e){
		this._hovered = false;
		this._preclick = false;
		this._rightPressed = false;
		
		if(this.onleave) this.onleave(e);
	};
	
	/**
	 * Private logic when element is pressed
	 * @protected
	 * @type {function(this:Entity)}
	 */
	Entity.prototype._onpress = function(e){
		this._pressed = true;
		
		if(this.onpress) this.onpress(e);
	};
	
	/**
	 * Private logic when element is released
	 * @protected
	 * @type {function(this:Entity)}
	 */
	Entity.prototype._onrelease = function(e){
		this._pressed = false;
		
		var time = Arstider.timestamp();
		
		if(this._preclick){
			if(time - this._doubleClickCheck < this._doubleClickDelay && this.ondoubleclick) this.ondoubleclick(e);
			else{
				if(this.onclick) this.onclick(e);
			}
			
			this._doubleClickCheck = time;
		}
		if(this.onrelease) this.onrelease(e);
		
		this._preclick = false;
	};
	
	/**
	 * Private logic when element is clicked with the right mouse button
	 * @protected
	 * @type {function(this:Entity)}
	 */
	Entity.prototype._onrightclick = function(e){
		this._rightPressed = false;
		if(this.onrightclick) this.onrightclick(e);
	};
	
	/**
	 * Private logic with each frame updates (see core/Performance for draw vs update skips)
	 * @protected
	 * @type {function(this:Entity)}
	 * @param {number} dt Delta time (the time spent since last frame)
	 */
	Entity.prototype._update = function(dt){
		
		var i, c, len;
		/**
		 * Check for docking options
		 */
		if(this.parent != null){
			if(this.global.alpha > 0){
				if(this._fillX != null){
					this.width = this.parent.width * parseFloat(this._fillX);
				}
				if(this._fillY != null){
					this.height = this.parent.height * parseFloat(this._fillY);
				}
				if(this._dockX != null){
					this.x = Math.round((this.parent.width * parseFloat(this._dockX)) - (this.width * parseFloat(this._dockX)));
				}
				if(this._dockY != null){
					this.y = Math.round((this.parent.height * parseFloat(this._dockY)) - (this.height * parseFloat(this._dockY)));
				}
			}
		}
		
		if(!this._skipUpdateBubble && this.update) this.update(dt);
		if(this.children && !this._skipUpdateBubble){
			len = this.children.length;
			if(len > 0){
				for(i = 0; i<len; i++){
					c = this.children[i];
					if(c && c._update){
						if(this._skipUpdateBubble && c.cancelBubble) c._skipUpdateBubble = true;
						if(c._skipUpdate <= 0) c._update(dt);
						else c._skipUpdate--;
					}
				}
			}
		}
		
		if(this._skipUpdateBubble) this._skipUpdateBubble = false;
	};
	
	/**
	 * Starts dragging the element, following the mouse
	 * @type {function(this:Entity)}
	 * @param {boolean|null} snapToCenter Whether to snap the dragged object centered with the pointer.
	 * @param {boolean|null} bound Whether to bound the dragging to the confines of the parent
	 */
	Entity.prototype.startDrag = function(snapToCenter, bound){
		var thisRef = this;
		
		if(this.parent == null){
			if(Arstider.verbose > 0) console.warn("Arstider.Entity.startDrag: cannot drag an element with no parent");
		}
		
		requirejs(["Arstider/Mouse"], function(Mouse){
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
		
		return this;
	};
	
	/**
	 * Stops dragging the element
	 * @type {function(this:Entity)}
	 */
	Entity.prototype.stopDrag = function(){
		var thisRef = this;
		setTimeout(function stopDragRelay(){
			thisRef._dragged = false;
			thisRef._dragOffsetX = 0;
			thisRef._dragOffsetY = 0;
			thisRef._boundDrag = false;
		},0);
		
		return this;
	};

	/**
	 * 
	 */
	Entity.prototype.updateGlobalProperties = function(){
		//Update globals
		if(this.global){
			this.global.x = this.x;
			this.global.y = this.y;
			this.global.scaleX = this.scaleX;
			this.global.scaleY = this.scaleY;
			this.global.skewX = this.skewX;
			this.global.skewY = this.skewY;
			this.global.width = this.width;
			this.global.height = this.height;
			this.global.rotation = this.rotation;
			this.global.alpha = this.alpha;
			if(this.parent){
				this.global.x += this.parent.global.x;
				this.global.y += this.parent.global.y;
				this.global.scaleX *= this.parent.global.scaleX;
				this.global.scaleY *= this.parent.global.scaleY;
				this.global.skewX *= this.parent.global.skewX;
				this.global.skewY *= this.parent.global.skewY;
				this.global.width *= ((this.global.scaleX<0)?(this.global.scaleX*-1):this.global.scaleX);
				this.global.height *= ((this.global.scaleY<0)?(this.global.scaleY*-1):this.global.scaleY);
				this.global.rotation += this.parent.global.rotation;
				this.global.alpha *= this.parent.global.alpha;
			}
		}
	};
	
	/**
	 * Sets the value for horizontal and vertical docking of the Entity
	 * @type {function(this:Entity)}
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
		
		this.cancelBubble()._update();
		return this;
	};
	
	/**
	 * Sets the value for horizontal and vertical filling of the Entity
	 * @type {function(this:Entity)}
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
		
		this.cancelBubble()._update();
		return this;
	};
	
	/**
	 * Checks if coordinates fit in the global location of the Entity
	 * @type {function(this:Entity)}
	 * @param {number} x The x coordinate to check against.
	 * @param {number} y The y coordinate to check against.
	 * @return {boolean} Are the coordinates within the zone of the Entity
	 */
	Entity.prototype.isTouched = function(x,y){
		if(this.touchAccuracy == Entity.PASSIVE) return false;

		if(this.touchAccuracy == Entity.ACTIVE || !this.global.points){
			// --Simple version
			if(x > this.global.x && x < this.global.x + (this.width * this.global.scaleX)){
				if(y > this.global.y && y < this.global.y + (this.height * this.global.scaleY)) return true;
			}
			return false;
		}
		//-- Complex version, let's see how expensive this is.
		var 
			distAP = Arstider.distance(this.global.points[0], this.global.points[1], x, y),
			distBP = Arstider.distance(this.global.points[2], this.global.points[3], x, y),
			distCP = Arstider.distance(this.global.points[4], this.global.points[5], x, y),
			distDP = Arstider.distance(this.global.points[6], this.global.points[7], x, y),
			quad1 = ((distAP + distBP + this.global.width) * 0.5),
			quad1 = Math.sqrt(quad1 * (quad1 - distAP) * (quad1 - distBP) * (quad1 - this.global.width)) || 0;
			quad2 = ((distBP + distDP + this.global.height) * 0.5),
			quad2 = Math.sqrt(quad2 * (quad2 - distBP) * (quad2 - distDP) * (quad2 - this.global.height)) || 0;
			quad3 = ((distCP + distDP + this.global.width) * 0.5),
			quad3 = Math.sqrt(quad3 * (quad3 - distCP) * (quad3 - distDP) * (quad3 - this.global.width)) || 0;
			quad4 = ((distAP + distCP + this.global.height) * 0.5),
			quad4 = Math.sqrt(quad4 * (quad4 - distAP) * (quad4 - distCP) * (quad4 - this.global.height)) || 0;
			sum = quad1 + quad2 + quad3 + quad4,
			total = this.global.width * this.global.height
		;
		if(sum >= total - 100 && sum <= total + 100) return true;
		
		return false;
	};
               
               /**
	 * Checks if coordinates fit in the local location of the Entity
	 * @type {function(this:Entity)}
	 * @param {number} x The x coordinate to check against.
	 * @param {number} y The y coordinate to check against.
                * @param {number} w The width of the element to check against.
	 * @param {number} h The height of the element to check against.
	 * @return {boolean} Are the coordinates within the zone of the Entity
	 */
	Entity.prototype.collides = function(x,y,w,h){
		return (this.x < x + w && this.x + this.width > x && this.y < y + h && this.y + this.height > y);
	};
		
	/**
	 * Sets the index of the Entity inside it's parent's array - must be parented
	 * @type {function(this:Entity)}
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
	 * @type {function(this:Entity)}
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
	 * @type {function(this:Entity)}
	 */
	Entity.prototype.cancelBubble = function(){
		this._skipUpdateBubble = true;
		
		return this;
	};

	/**
	 * Stops update propagation during that frame
	 * @type {function(this:Entity)}
	 */
	Entity.prototype.cancelUpdate = function(num){
		this._skipUpdate = num || 1;
		
		return this;
	};
	
	/**
	 * Kills the Entity's Buffer(s).
	 * @type {function(this:Entity)}
	 */
	Entity.prototype.killBuffer = function(wipe){
		if(this.data && this.data.kill) this.data.kill();
		
		this.data = null;
		
		if(this.onunload) this.onunload();
		this._requestedAsset = null;
		
		return this;
	};
		
	/**
	 * Getter for the global 'id' attribute. (Includes parents' value)
	 * @type {function(this:Entity)}
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