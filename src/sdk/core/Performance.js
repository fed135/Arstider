;(function(){
	
	var singleton = null;
    /**
	 * AMD Closure
	 */	
		define( "Arstider/core/Performance", [], function (){
			
			if(singleton != null) return singleton;
			
			function Performance(){
				
				this.draws = 0;
				this.elements = 0;
				this.transforms = 0;
				this.frames = 0;
				this.skippedDraw = 0;
				this.skippedUpdate = 0;
				this.topFrames = 0;
				this.frameDelay = 0;
				this.numBuffers = 0;
				this.bufferMem = 0;
				
				this.now = 0;
				this.lastFrame = 0;
				this.skipTreshold = 40; //ms
				
				this._onTrack = true;
			}
			
			Performance.prototype.update = function(){
				if(singleton.frames > singleton.topFrames){
					singleton.topFrames = singleton.frames;
				}
				
				singleton.draws = 0;
				singleton.elements = 0;
				singleton.transforms = 0;
				singleton.frames = 0;
			};
			
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
						singleton.skippedUpdate++;
					}
					
					if(singleton.frames >= 60){
						if(singleton._onTrack === 1){
							singleton._onTrack = 2;
							singleton.skippedUpdate++;
						}
					}
				}
			};
			
			Performance.prototype.endStep = function(){
				singleton.lastFrame = singleton.now;
			};
			
			Performance.prototype.getStatus = function(){
				return singleton._onTrack;
			};
			
			singleton = new Performance();
			return singleton;
		});
})();
