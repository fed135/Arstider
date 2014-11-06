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
	 * Private logic when element is hovered
	 * @protected
	 * @type {function(this:Entity)}
	 */
	Entity.prototype._onhover = function(){
		this._hovered = true;
		
		if(this.onhover) this.onhover();
	};
	
	/**
	 * Private logic when element is left
	 * @protected
	 * @type {function(this:Entity)}
	 */
	Entity.prototype._onleave = function(){
		this._hovered = false;
		this._preclick = false;
		this._rightPressed = false;
		
		if(this.onleave) this.onleave();
	};
	
	/**
	 * Private logic when element is pressed
	 * @protected
	 * @type {function(this:Entity)}
	 */
	Entity.prototype._onpress = function(){
		this._pressed = true;
		
		if(this.onpress) this.onpress();
	};
	
	/**
	 * Private logic when element is released
	 * @protected
	 * @type {function(this:Entity)}
	 */
	Entity.prototype._onrelease = function(){
		this._pressed = false;
		
		var time = Arstider.timestamp();
		
		if(this._preclick){
			if(time - this._doubleClickCheck < this._doubleClickDelay && this.ondoubleclick) this.ondoubleclick();
			else{
				if(this.onclick) this.onclick();
			}
			
			this._doubleClickCheck = time;
		}
		if(this.onrelease) this.onrelease();
		
		this._preclick = false;
	};
	
	/**
	 * Private logic when element is clicked with the right mouse button
	 * @protected
	 * @type {function(this:Entity)}
	 */
	Entity.prototype._onrightclick = function(){
		this._rightPressed = false;
		if(this.onrightclick) this.onrightclick();
	};


		Entity.PASSIVE = 0;
	Entity.ACTIVE = 1;
	Entity.COMPLEX = 2;

/**
		 * Complex interactive element - prevents intensive lookup
		 * @type {boolean}
		 */
		this.touchAccuracy = Arstider.checkIn(props.touchAccuracy, Entity.ACTIVE);

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