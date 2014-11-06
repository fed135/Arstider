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