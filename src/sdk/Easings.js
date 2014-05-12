/**
 * Easings
 *
 * @version 1.1.2
 * @author frederic charette <fredc@meetfidel.com>
 */
;(function(){

	var 
		/*
		 * Singleton static
		 * @private
		 * @type {Easings|null}
		 */
		singleton = null
	;
	
	/**
	 * Linear progress curve
	 * @const
	 * @private
	 * @type {function}
	 * @param {number} progress Current progress
	 * @return {number} Modified progress
	 */
	function linear(progress){
		return progress;
	}
	
	/**
	 * Quadratic progress curve
	 * @const
	 * @private
	 * @type {function}
	 * @param {number} progress Current progress
	 * @return {number} Modified progress
	 */
	function quad(progress){
		return Math.pow(progress, 2);
	}
	
	/**
	 * Circular progress curve
	 * @const
	 * @private
	 * @type {function}
	 * @param {number} progress Current progress
	 * @return {number} Modified progress
	 */
	function circ(progress){
		return 1 - Math.sin(Math.acos(progress));
	}
	
	/**
	 * Backswing progress curve
	 * @const
	 * @private
	 * @type {function}
	 * @param {number} progress Current progress
	 * @return {number} Modified progress
	 */
	function back(progress, x){
		return Math.pow(progress, 2) * ((x + 1) * progress - x);
	}
	
	/**
	 * Bouncing progress curve
	 * @const
	 * @private
	 * @type {function}
	 * @param {number} progress Current progress
	 * @return {number} Modified progress
	 */
	function bounce(progress){
		for(var a = 0, b = 1, result; 1; a += b, b /= 2) {
			if(progress >= (7 - 4 * a) / 11) return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2);
		}
	}
	
	/**
	 * Elastic progress curve
	 * @const
	 * @private
	 * @type {function}
	 * @param {number} progress Current progress
	 * @param {number} x Extra parameter
	 * @return {number} Modified progress
	 */
	function elastic(progress, x){
		return Math.pow(2, 10 * (progress-1)) * Math.cos(20*Math.PI*x/3*progress);
	}
	
	/**
	 * Reversed out progress curve
	 * @const
	 * @private
	 * @type {function}
	 * @param {number} delta Current progress
	 * @return {number} Modified progress
	 */
	function easeOut(delta){ 
		return function(progress, x){
			return 1-delta(1-progress, x);
		};
	}
	
	/**
	 * In, then reversed out progress curve
	 * @const
	 * @private
	 * @type {function}
	 * @param {number} delta Current progress
	 * @param {number} x Extra parameter
	 */
	function easeInOut(delta){ 
		return function(progress, x){
			if (progress < 0.5) return delta(2*progress, x) * 0.5;
			else return (2 - delta(2*(1-progress), x)) * 0.5;
		};
	}
	
	/**
	 * Defines the Easings module
	 */
	define( "Arstider/Easings", [], /** @lends Easings */ function () {
		
		/**
		 * Returns singleton if it has been instantiated
		 */
		if(singleton != null) return singleton;
		
		/**
		 * Easings constructor
		 * Collection of Easing
		 * @class Easings
		 * @constructor
		 */
		function Easings(){
			/**
			 * Basic linear transition, no easing.
			 * @type {function()}
			 */
			this.LINEAR = linear;
			
			/**
			 * Quad easing start, linear end.
			 * @type {function()}
			 */
			this.QUAD_IN = quad;
			/**
			 * Quad easing end, linear start.
			 * @type {function()}
			 */
			this.QUAD_OUT = easeOut(quad);
			/**
			 * Quad easing start, quad easing end.
			 * @type {function()}
			 */
			this.QUAD_IN_OUT = easeInOut(quad);
			
			/**
			 * Circular easing pattern.
			 * @type {function()}
			 */
			this.CIRC = circ,
			
			/**
			 * Swing backwards before linear completion.
			 * Requires force extra parameter 
			 * @type {function()}
			 */
			this.BACKSWING = back,
			
			/**
			 * Bounce before linear completion.
			 * Requires force extra parameter 
			 * @type {function()}
			 */
			this.BOUNCE_IN = bounce,
			/**
			 * Linear progression, then bounces out.
			 * Requires force extra parameter 
			 * @type {function()}
			 */
			this.BOUNCE_OUT = easeOut(bounce),
			/**
			 * Bounce before linear completion, then bounces out.
			 * Requires force extra parameter 
			 * @type {function()}
			 */
			this.BOUNCE_IN_OUT = easeInOut(bounce),
			
			/**
			 * Elastic swing, then linear completion.
			 * Requires force extra parameter 
			 * @type {function()}
			 */
			this.ELASTIC_IN = elastic,
			/**
			 * Linear progression, then Elastic swing out.
			 * Requires force extra parameter 
			 * @type {function()}
			 */
			this.ELASTIC_OUT = easeOut(elastic),
			/**
			 * Elastic swing, Linear progression, then Elastic swing out.
			 * Requires force extra parameter 
			 * @type {function()}
			 */
			this.ELASTIC_IN_OUT = easeInOut(elastic)
		}
		
		singleton = new Easings();
		return singleton;
	});
})();