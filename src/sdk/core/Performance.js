/**
 * Performance
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */

/*
 * Self-invoked singleton wrapper
 */
;(function(){
	
	var 
		/**
		 * Singleton static
	 	 * @private
	 	 * @type {Performance|null}
	 	 */
		singleton = null
	;
	
    /**
	 * Defines performance module
	 */	
	define( "Arstider/core/Performance", ["Arstider/Signal"], /** @lends core/Performance */ function (Signal){
		
		if(singleton != null) return singleton;
		
		/**
		 * Performance class
		 * This module tracks current performance and adjusts logic and draw timing accordingly
	     * @class core/Performance
	     * @name core/Performance
		 * @constructor
		 */	
		function Performance(){

			this.allowSkip = true;

			this._signals = {};
		}

		Performance.prototype.getFrameSignal = function(fps){
			if(!fps || fps == "auto" || fps > 60) fps = 60;

			if(this._signals[fps] && this._signals[fps].signal) return this._signals[fps].signal;
			else{
				this._signals[fps] = {
					signal:new Signal(),
					lastCalled:Arstider.timestamp()
				};
				if(fps == 60 && Arstider.requestAnimFrame){
					this.nativeRequest();
				}
				else{
					this._signals[fps].targetRate = Math.round(1000/fps);
					this.timeoutRequest(fps);
				}
				return this._signals[fps].signal;
			}
		};

		Performance.prototype.nativeRequest = function(){
			var 
				ts = Arstider.timestamp(),
				dt = ts - this._signals[60].lastCalled,
				thisRef = this
			;

			this._signals[60].lastCalled = ts;
			this._signals[60].signal.dispatch(dt);

			Arstider.requestAnimFrame.call(window, function ArstiderRequestAnimFrame(){
				thisRef.nativeRequest.call(thisRef);
			});
		};

		Performance.prototype.timeoutRequest = function(fps){
			var 
				ts = Arstider.timestamp(),
				dt = ts - this._signals[fps].lastCalled,
				nextFrame = Math.max(0, this._signals[fps].targetRate - dt),
				thisRef = this
			;

			this._signals[fps].lastCalled = ts;
			this._signals[fps].signal.dispatch(dt);

			this._signals[fps].timeout = setTimeout(function(){
				thisRef.timeoutRequest.call(thisRef, fps);
			}, nextFrame);
		};
		
		singleton = new Performance();	
		return singleton;
	});
})();