define("Arstider/core/Profiler", [], function(){
	function Profiler(){

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
		 * The number of updates called in the frame
		 * @type {number}
		 */
		this.updates = 0;
	}

	Profiler.prototype.clean = function(){
		this.draws = 0;
		this.elements = 0;
		this.transforms = 0;
		this.frames = 0;
		this.updates = 0;
	};

	return Profiler;
});