/**
 * Timer. 
 *
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the Timer module
 */
define( "Arstider/Timer", [], /** @lends Timer */ function () {
		
	/**
	 * Timer constructor
	 * A robust timer class that can progress at real-time or draw-time
	 * @class Timer
	 * @constructor
	 * @param {function} callback Function to be ran after the delay.
	 * @param {number} delay Number of millisecond before {callback} is triggered. 
	 * @param {boolean|null} clockBased whether to use real time or frames (defaults to frames)
	 */
	function Timer(callback, delay, clockBased){
		/**
		 * Tells if the timer is running
		 * @type {boolean}
		 */
	    this.running = true;
	    /**
	     * Tells if the timer has finished
	     * @type {boolean}
	     */
	    this.completed = false;
	    /**
	     * Stores a copy of the initial delay (for restarts)
	     * @type {number}
	     */
	    this.initialDelay = delay;
	    /**
	     * Current time left (in MS)
	     * @type {number}
	     */
	    this.delay = delay;
	    /**
	     * Callback method
	     * @type {function}
	     */
	    this.callback = callback;
	    
	    /**
		 * Is timer clock based
		 * @private
		 * @type {boolean}
		 */
	    this._clockBased = clockBased;
	    /**
	     * Timeout reference (if clock based)
	     * @private
	     * @type {number}
	     */
	    this._internalTimer = null;
	    
	    /**
	     * Start time reference (if clock based)
	     * @private
	     * @type {number}
	     */
	    this._startTime = null;
	    
	    if(this._clockBased){
	    	this.resume();
	    }
	}
	
	/**
	 * Pauses the timer
	 * @type {function(this:Timer)}
	 * @return {Timer} Returns self, for chaining
	 */
	Timer.prototype.pause = function() {
	    this.running = false;
	    
	    if(this._clockBased){
	    	clearTimeout(this._internalTimer);
	    	this._internalTimer = null;
	    	this.delay -= (Arstider.timestamp() - this._startTime);
	    }
	    return this;
	};
	
	/**
	 * Resumes the timer
	 * @type {function(this:Timer)}
	 * @return {Timer} Returns self, for chaining
	 */
	Timer.prototype.resume = function() {
	    this.running = true;
	    
	    if(this._clockBased && this._internalTimer == null){
	    	var thisRef = this;
	    	this._startTime = Arstider.timestamp();
	    	this._internalTimer = setTimeout(function(){thisRef.finish.apply(thisRef);}, this.delay);
	    }
	    return this; 
	};
	
	/**
	 * Restarts the timer
	 * @type {function(this:Timer)}
	 * @return {Timer} Returns self, for chaining
	 */
	Timer.prototype.restart = function(){
	  	this.completed = false;
	  	this.delay = this.initialDelay;
	  	
	  	this.resume();
	   	return this;
	};
	   
	/**
	 * Finishes the timer and executes the callback function
	 * @type {function(this:Timer)}
	 * @return {Timer} Returns self, for chaining
	 */
	Timer.prototype.finish = function(){
		this.running = false;
	   	this.callback();
	   	if(this.running != true) this.completed = true;
	   	return this;
	};
	
	return Timer;
});