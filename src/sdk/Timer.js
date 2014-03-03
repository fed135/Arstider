/**
 * AMD Closure
 */	

	define( "Arstider/Timer", [], function () {
		
		/**
		 * Creates an instance of Font.
		 *
		 * @constructor
		 * @this {Timer}
		 * @param {function} callback Function to be ran after the delay.
		 * @param {int} delay Number of millisecond before {callback} is triggered. 
		 */
		function Timer(callback, delay, autoRun){
		
		    this.running = (autoRun == undefined)?true:autoRun;
		    this.completed = false;
		    this.initialDelay = delay;
		    this.delay = delay;
		    this.callback = callback;
		}
		
		Timer.prototype.pause = function() {
		    this.running = false;
		    return this;
		};
		
		Timer.prototype.resume = function() {
		    this.running = true;
		    return this; 
		};
		
		Timer.prototype.restart = function(){
			this.running = true;
		  	this.completed = false;
		  	this.delay = this.initialDelay;
		   	return this;
		};
		    
		Timer.prototype.finish = function(){
			this.running = false;
		   	this.callback();
		   	if(this.running != true){
		   		//In case there is a restart in the callback
		   		this.completed = true;
		   	}
		   	return this;
		};
		
		return Timer;
	});
