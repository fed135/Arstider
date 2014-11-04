/**
 * Action
 * 
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the Action module
 */
define("Arstider/tweens/Action", [], /** @lends tweens/Action */ function(){

	/**
	 * Tween action step constructor
	 * @constructor
	 * @name tweens/Action
	 * @private
	 * @param {function} callback The method to call at that step
	 * @param {*} option Optional data to provide the callback with
	 */
	function Action(callback, option){
		this.startTime = 1;
		this.timesToRun = Arstider.checkIn(option, 1);
		this.timesRan = 0;
		this.time = this.startTime;
		this.callback = callback;
		this.callbackOption = [Arstider.checkIn(option, null)];
	}
	
	/**
	 * Rewinds the action step
	 * @private
	 * @type {function(this:Action)}
	 */
	Action.prototype.rewind = function(){
		this.time = this.startTime;
		this.timesRan = 0;
	};
	
	/**
	 * Calls the callback function
	 * @private
	 * @type {function(this:Action)}
	 * @param {Tween} target The tween chain holding the animation
	 */	
	Action.prototype.step = function(target){
		if(this.timesToRun > this.timesRan || this.timesToRun == -1){
			this.callback.apply(target, this.callbackOption);
			this.timesRan++;
		}
	};

	return Action;
});