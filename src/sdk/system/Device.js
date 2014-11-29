define("Arstider/system/Device", 
[
	"Arstider/system/Browser"
],
function(){

	function Device(){

		/**
		 * Indicates if geolocation feature is enabled or null if untested (displays prompt to user)
		 * @type {boolean|null}
		 */
		this.geolocationEnabled = false;
			
		/**
		 * Cached latest geolocation object
		 * @private
		 * @type {Object}
		 */
		this._location = null;
			
		/**
		 * Indicates if vibration feature is enabled
		 * @type {boolean}
		 */
		this.vibrationEnabled = false;
			
		/**
		 * Indicates if accelerometer feature is enabled
		 * @type {boolean}
		 */
		this.accelerometerEnabled = false;
			
		/**
		 * Current device tilt Object
		 * @private
		 * @type {Object}
		 */
		this._tilt = {x:0,y:0,z:0};


		if(Browser.isMobile){
			this.init();
		}
	}

	Device.prototype.init = function(){

		window.ondevicemotion = this._handleDeviceTilt.bind(this);
		this.vibrate();
	};

	Device.prototype._handleDeviceTilt = function(e){
		event = event || window.event;
		if(event.accelerationIncludingGravity.x == null || event.accelerationIncludingGravity.y == null || event.accelerationIncludingGravity.z == null) return;
				
		this.accelerometerEnabled = true;
		this._tilt.x = event.accelerationIncludingGravity.x;  
		this._tilt.y = event.accelerationIncludingGravity.y;  
		this._tilt.z = event.accelerationIncludingGravity.z; 
	}

	/**
	 * Returns the geolocation object
	 * @type {function(this:Viewport)}
	 * @param {function} callback The method to call once the geolocation object has returned
	 */
	Device.prototype.getLocation = function(callback){

		if(this._location == null){
			this.updateLocation(callback);
		}
		else callback(this._location);
	};
	
	/**
	 * Updates the geolocation object
	 * @type {function(this:Viewport)}
	 * @param {function} callback The method to call once the geolocation object has returned
	 */
	Device.prototype.updateLocation = function(callback){

		var 
			thisRef = this
		;

		if(navigator.geolocation){
			this.geolocationEnabled = true;
			try{
				navigator.geolocation.getCurrentPosition(function(p){
					thisRef._location = p;
					if(callback) callback(thisRef._location);
				});
			}
			catch(e){
				this.geolocationEnabled = false;
				this._location = {};
				if(Arstider.verbose > 0) console.warn("Arstider.Viewport.updateGeolocation: ", e);
			}
		}
		else{
			this.geolocationEnabled = false;
			this._location = {};
			if(callback) callback(this._location);
		}
	};
	
	/**
	 * Attempts to vibrate the device 
	 * @type {function(this:Viewport)}
	 * @param {Array} param The vibration pattern, as if calling the API 
	 */
	Device.prototype.vibrate = function(param){

		param = param || 0;

		var 
			vibrate = window.navigator.vibrate || window.navigator.webkitVibrate || window.navigator.mozVibrate || window.navigator.msVibrate || null
		;
		
		if(vibrate){
			try{
				vibrate(0);
				vibrate(param);
				this.vibrationEnabled = true;
			}
			catch(e){
				if(Arstider.verbose > 0) console.warn("Arstider.Browser.vibrate: error while trying to vibrate API may be broken");
				this.vibrationEnabled = false;
			}
		}
		else{
			if(Arstider.verbose > 1) console.warn("Arstider.Browser.vibrate: feature not supported");
		}
	};
	
	/**
	 * Gets the current tilt of the device via the accelerometer
	 * @type {function(this:Viewport)}
	 * @return {Object} The current tilt {x:,y:,z:}
	 */
	Device.prototype.getDeviceTilt = function(){

		return this._tilt;
	};

	return new Device();
});