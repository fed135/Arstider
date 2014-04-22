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
	define( "Arstider/GlobalTimers", [], function (){
			
		if(singleton != null) return singleton;
			
		/**
		 * Global Timers constructor
		 * @constructor
		 */
		function GlobalTimers(){
			this.list = [];
		}
				
		/**
		 * Steps the timers in the list
		 * @type {function(this:GlobalTimers)}
		 */
		GlobalTimers.prototype.step = function(){
			var i = this.list.length-1;
			for(i; i>=0; i--){
				if(this.list[i].running){
					(function(t){
						setTimeout(function(){
							t.delay -= Arstider._fullFPS;
							
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
		
		GlobalTimers.prototype.clean = function(){
			this.list = [];
		};
			
		singleton = new GlobalTimers();
		return singleton;	
	});
})();