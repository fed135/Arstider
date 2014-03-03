/**
 * DisplayList Wrapper. (singleton)
 * 
 * Provides common private variables and methods for the DisplayList as well as
 * AMD Closure and prototypes.
 *
 * @author frederic charette <fredc@meetfidel.com>
 */
;(function(){
	
	/**
	 * Single-instance values for all instances of engines
	 */
	
	var singleton = null;
	
	define( "Arstider/GlobalTimers", [], function (){
			
		if(singleton != null) return singleton;
			
		function GlobalTimers(){
			this.list = [];
			this.stepLength = 20; //ms between animationFrames
		}
				
		GlobalTimers.prototype.step = function(realtimeDelay){
			var i = this.list.length-1;
			for(i; i>=0; i--){
				if(this.list[i].running){
					
					this.list[i].delay -= this.stepLength;
					
					if(this.list[i].step){
						this.list[i].step();
					}
					
					if(this.list[i].delay <= 0 && this.list[i].completed == false){
						this.list[i].finish();
					}
				}
			}
		};
				
		GlobalTimers.prototype.push = function(elem){
			this.list.push(elem);
		};
				
		GlobalTimers.prototype.remove = function(elem){
			var i = this.list.length-1;
			for(i; i>=0; i--){
				if(elem == this.list[i]){
					this.list.splice(i,1);
					break;
				}
			}
		};
			
		singleton = new GlobalTimers();
		return singleton;	
	});
})();