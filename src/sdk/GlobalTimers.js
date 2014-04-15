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
					
					this.list[i].delay -= Arstider._fullFPS;
					
					if(this.list[i].step){
						this.list[i].step.apply(this.list[i]);
					}
					
					if(this.list[i].delay <= 0 && this.list[i].completed == false){
						this.list[i].finish();
					}
				}
			}
		};
			
		/**
		 * Pushes a timer in the timer list
		 * @type {function(this:GlobalTimers)}
		 * @param {Object} elem A timer object to call step on every heartbeat
		 */	
		GlobalTimers.prototype.push = function(elem){
			this.list.push(elem);
		};
		
		/**
		 * Removes a timer from the list
		 * @type {function(this:GlobalTimers)}
		 * @param {Object} elem The timer to remove
		 */
		GlobalTimers.prototype.remove = function(elem){
			var i = this.list.length-1;
			for(i; i>=0; i--){
				if(elem == this.list[i]){
					this.list.splice(i,1);
					return;
				}
			}
			if(Arstider.verbose > 2) console.warn("Arstider.GlobalTimers.remove: timer not in list, nothing was removed");
		};
			
		singleton = new GlobalTimers();
		return singleton;	
	});
})();