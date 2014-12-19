/**
 * GlobalTimers. 
 *
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */
define( "Arstider/GlobalTimers", [], /** @lends GlobalTimers */ function (){
		
	var singleton;
		
	/**
	 * GlobalTimers constructor
	 * A list of timers to update every frame (to match display in synchronous mode)
	 * @class GlobalTimers
	 * @constructor
	 */
	function GlobalTimers(){
		this.list = [];
		this._roughStarted = false;

		this.startTime = 0;
		this.logicHeartbeats = 0;
		this.maxHeartbeatsPerFrame = 3;
		this.logicHeartbeatsPerSecond = 50;

		this.paused = false
	}
			
	/**
	 * Steps the timers in the list
	 * @type {function(this:GlobalTimers)}
	 * @param {number} dt Delta time
	 */
	GlobalTimers.prototype.step = function(dt){

		var worldTime = (this.startTime += dt) *0.001;
		var goalHeartbeats = Math.floor(worldTime * this.logicHeartbeatsPerSecond);
		if ( (goalHeartbeats - this.logicHeartbeats) > this.maxHeartbeatsPerFrame ) this.logicHeartbeats = goalHeartbeats - this.maxHeartbeatsPerFrame;//eventually allow the game to just run slowly

		if ( this.paused ) this.logicHeartbeats = goalHeartbeats;

		if (this.logicHeartbeats < goalHeartbeats) {
			while (this.logicHeartbeats < goalHeartbeats) {
				this._updateTimers(17);
				this.logicHeartbeats++;
			}
		}
	};

	GlobalTimers.prototype._updateTimers = function(dt){
		for(var i=this.list.length-1; i>=0; i--){
			if(this.list[i] && this.list[i].running){
				if(this.list[i] && this.list[i].delay){
					this.list[i].delay -= dt;
					if(this.list[i] && this.list[i].step) this.list[i].step.call(this.list[i]);
					if(this.list[i] && this.list[i].delay <= 0 && this.list[i].completed == false) this.list[i].finish();
				}
			}
		}
	};

	/**
	 * Returns the number of timers in the list
	 * @type {function(this:GlobalTimers)}
	 * @return {number} The number of timers
	 */	
	GlobalTimers.prototype.count = function(){
		return this.list.length;
	};
		
	/**
	 * Pushes a timer in the timer list
	 * @type {function(this:GlobalTimers)}
	 * @param {Object} elem A timer object to call step on every heartbeat
	 */	
	GlobalTimers.prototype.push = function(elem){
		if(this.list.indexOf(elem) == -1){
			this.list.push(elem);
		}
	};
	/**
	 * Killing the tweens
	 * @type {function(this:GlobalTimers)}
	 */
	GlobalTimers.prototype.removeTweens = function(){
		for(var i = this.list.length-1; i>=0;i--){
			if(this.list[i] && this.list[i].kill){
				this.list[i].kill(); 
			}
		}
	};
	
	/**
	 * Removes a timer from the list
	 * @type {function(this:GlobalTimers)}
	 * @param {Object} elem The timer to remove
	 */
	GlobalTimers.prototype.remove = function(elem){
		var i = this.list.indexOf(elem);
		if(i !== -1) return this.list.splice(i,1);
		
		if(Arstider.verbose > 2) console.warn("Arstider.GlobalTimers.remove: timer not in list, nothing was removed");
	};
	
	/**
	 * Removes all the timers from the list
	 * @type {function(this:GlobalTimers)}
	 */
	GlobalTimers.prototype.clean = function(){
		this.list.length = 0;
	};
	/**
	 * Pauses all the timers from the list
	 * @type {function(this:GlobalTimers)}
	 */
	GlobalTimers.prototype.pauseAll = function(){
		for(var i = this.list.length-1; i>=0;i--){
			if(this.list[i] && this.list[i].pause) this.list[i].pause();
		}
	};
	/**
	 * Resumes all the timers from the list
	 * @type {function(this:GlobalTimers)}
	 */
	GlobalTimers.prototype.resumeAll = function(){
		for(var i = this.list.length-1; i>=0;i--){
			if(this.list[i] && this.list[i].resume) this.list[i].resume();
		}
	};

	singleton = new GlobalTimers();
	return singleton;	
});