/**
 * GlobalTimers. 
 *
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */
;(function(){
	
	var 
		/**
		 * Singleton static
		 * @private
		 * @type {GlobalTimers|null}
		 */
		singleton = null
	;
	
	/**
	 * Defines the GlobalTimers module
	 */
	define( "Arstider/GlobalTimers", [], /** @lends GlobalTimers */ function (){
			
		if(singleton != null) return singleton;
			
		/**
		 * GlobalTimers constructor
		 * A list of timers to update every frame (to match display in synchronous mode)
		 * @class GlobalTimers
		 * @constructor
		 */
		function GlobalTimers(){
			this.list = [];

			this._roughStarted = false;
		}
				
		/**
		 * Steps the timers in the list
		 * @type {function(this:GlobalTimers)}
		 * @param {number} dt Delta time
		 */
		GlobalTimers.prototype.step = function(dt){
			if(!require.defined("Arstider/Engine")){
				Arstider.requestAnimFrame.apply(window, [singleton.step])
			}

			dt = Arstider.checkIn(dt, Math.round(1000/Arstider.FPS));

			var i = this.list.length-1;
			for(i; i>=0; i--){
				if(this.list[i].running){
					(function(t){
						setTimeout(function(){
							t.delay -= dt;
							
							if(t.step) t.step.apply(t);
							if(t.delay <= 0 && t.completed == false) t.finish();
						},0);
					})(this.list[i]);
				}
			}
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

			if(!require.defined("Arstider/Engine")){
				if(!this._roughStarted){
					this._roughStarted = true;
					Arstider.requestAnimFrame.apply(window, [singleton.step]);
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
			this.list = [];
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
})();