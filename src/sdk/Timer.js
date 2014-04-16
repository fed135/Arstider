/**
 * Timer. 
 *
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the Timer module
 */
define( "Arstider/Timer", [], function () {
		
	/**
	 * Timer constructor.
	 * @constructor
	 * @this {Timer}
	 * @param {function} callback Function to be ran after the delay.
	 * @param {number} delay Number of millisecond before {callback} is triggered. 
	 * @param {boolean|null} autoRun whether to start the timer immediately or not. default : true
	 */
	function Timer(callback, delay, autoRun){
		/**
		 * Tells if the timer is running
		 * @type {boolean}
		 */
	    this.running = (autoRun == undefined)?true:autoRun;
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
	}
	
	/**
	 * Pauses the timer
	 * @type {function(this:Timer)}
	 * @return {Timer} Returns self, for chaining
	 */
	Timer.prototype.pause = function() {
	    this.running = false;
	    return this;
	};
	
	/**
	 * Resumes the timer
	 * @type {function(this:Timer)}
	 * @return {Timer} Returns self, for chaining
	 */
	Timer.prototype.resume = function() {
	    this.running = true;
	    return this; 
	};
	
	/**
	 * Restarts the timer
	 * @type {function(this:Timer)}
	 * @return {Timer} Returns self, for chaining
	 */
	Timer.prototype.restart = function(){
		this.running = true;
	  	this.completed = false;
	  	this.delay = this.initialDelay;
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