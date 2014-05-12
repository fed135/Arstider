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
	define( "Arstider/core/Performance", [], /** @lends core/Performance */ function (){
		
		if(singleton != null) return singleton;
		
		/**
		 * Performance class
		 * This module tracks current performance and adjusts logic and draw timing accordingly
	     * @class core/Performance
	     * @name core/Performance
		 * @constructor
		 */	
		function Performance(){
			
			/**
			 * Number of canvas draws
			 * @type {number}
			 */
			this.draws = 0;
			
			/**
			 * Number of canvas elements
			 * @type {number}
			 */
			this.elements = 0;
			
			/**
			 * Number of canvas transformations
			 * @type {number}
			 */
			this.transforms = 0;
			
			/**
			 * Number of drawn frames (animationFrame cycle)
			 * @type {number}
			 */
			this.frames = 0;
			
			/**
			 * Number of skipped canvas draws (animationFrame cycle)
			 * @type {number}
			 */
			this.skippedDraw = 0;
			
			/**
			 * Top FPS reached
			 * @type {number}
			 */
			this.topFrames = 0;
			
			/**
			 * MS between animation frames
			 * @type {number}
			 */
			this.frameDelay = 0;
			
			/**
			 * Number of registered Buffers
			 * @type {number}
			 */
			this.numBuffers = 0;
			
			/**
			 * Total Buffer memory 
			 * @type {number}
			 */
			this.bufferMem = 0;
			
			/**
			 * Current time stamp
			 * @type {number}
			 */
			this.now = 0;
			
			/**
			 * Delay with previous frame
			 * @type {number}
			 */
			this.lastFrame = 0;
			
			/**
			 * Maximum MS allowed between frames
			 * @type {number}
			 */
			this.skipTreshold = 40; //ms
			
			/**
			 * Tells whether the Engine is running at the proper speed (0-1-2)
			 * @private
			 * @type {boolean}
			 */
			this._onTrack = true;
			
			/**
			 * Logic update to call
			 * @override
			 * @type {function()}
			 */
			this.updateLogic = Arstider.emptyFunction;
		}
		
		/**
		 * Gets called 60 times per second, so that logic stays constant
		 * @private
		 */
		Performance.prototype._stepLogic = function(){
			if(singleton.updateLogic == null) return;
			
			setTimeout(singleton._stepLogic, Arstider._fullFPS);
			
			singleton.updateLogic();
		};
		
		/**
		 * Updates performance info for the profiler
		 */
		Performance.prototype.update = function(){
			if(singleton.frames > singleton.topFrames){
				singleton.topFrames = singleton.frames;
			}
			
			singleton.draws = 0;
			singleton.elements = 0;
			singleton.transforms = 0;
			singleton.frames = 0;
		};
		
		/**
		 * Inits the performance info at the start of the frame
		 * @param {boolean} allowSkip Whether to allow draw/update skip
		 */
		Performance.prototype.startStep = function(allowSkip){
			singleton._onTrack = 1;
			
			if(allowSkip == true){
				singleton.now = Date.now();
				
				if(singleton.lastFrame == 0){
					singleton.lastFrame = singleton.now;
				}
				
				if(singleton.now - singleton.lastFrame > singleton.skipTreshold){
					singleton._onTrack = 0;
					singleton.skippedDraw++;
				}
			}
		};
		
		/**
		 * Completes performance cycle for a frame
		 */
		Performance.prototype.endStep = function(){
			singleton.lastFrame = singleton.now;
		};
		
		/**
		 * Fetches current performance status as compared to a 60fps target(0 = under, 1 = ok, 2 = over)
		 */
		Performance.prototype.getStatus = function(){
			return singleton._onTrack;
		};
		
		singleton = new Performance();
		
		singleton._stepLogic();
		
		return singleton;
	});
})();