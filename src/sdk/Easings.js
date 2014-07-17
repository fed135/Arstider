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
		singleton = null,

		/**
		 * 10% bounce math constant
		 * @const
		 * @private
		 * @type {number}
		 */
		tc = 1.70158,

		/**
		 * 10% return swing
		 * @const
		 * @private
		 * @type {number}
		 */
		tr = tc * 1.525,

		/**
		 * Initial bounce factor
		 * @const
		 * @private
		 * @type {number}
		 */
		inib = 7.5625,

		/**
		 * Bounce friction factor
		 * @const
		 * @private
		 * @type {Array}
		 */
		bff = [1/2.75, 2/2.75, 2.5/2.75],

		/**
		 * Rebounce friction factor
		 * @const
		 * @private
		 * @type {Array}
		 */
		rff = [1.5/2.75, 2.25/2.75, 2.625/2.75],

		/**
		 * Rebounce friction factor
		 * @const
		 * @private
		 * @type {Array}
		 */
		rbff = [0.75, 0.9375, 0.984375]
	;
	
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
			 * Linear progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.LINEAR = function (p){
				return p;
			};
			
			/**
			 * Quadratic progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.QUAD_IN = function (p){
				return p*p;
			};
			/**
			 * Quadratic progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.QUAD_OUT = function (p){
				return p*(2-p);
			};
			/**
			 * Quadratic progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.QUAD_IN_OUT = function (p){
				if ((p *= 2) < 1) return 0.5 * p * p;
				return - 0.5 * (--p * (p - 2) - 1);
			};
			
			/**
			 * Cubic progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.CUBIC_IN = function (p){
				return p*p*p;
			};
			/**
			 * Cubic progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.CUBIC_OUT = function (p){
				return --p*p*p + 1;
			};
			/**
			 * Cubic progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.CUBIC_IN_OUT = function (p){
				if ( ( p *= 2 ) < 1 ) return 0.5 * p * p * p;
				return 0.5 * ( ( p -= 2 ) * p * p + 2 );
			};

			/**
			 * Quartic progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.QUART_IN = function (p){
				return p*p*p*p;
			};
			/**
			 * Quartic progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.QUART_OUT = function (p){
				return 1-(--p*p*p*p);
			};
			/**
			 * Quartic progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.QUART_IN_OUT = function (p){
				if ( ( p *= 2 ) < 1) return 0.5 * p * p * p * p;
				return - 0.5 * ( ( p -= 2 ) * p * p * p - 2 );
			};

			/**
			 * Quintic progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.QUINT_IN = function (p){
				return p*p*p*p*p;
			};
			/**
			 * Quintic progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.QUINT_OUT = function (p){
				return --p*p*p*p*p+1;
			};
			/**
			 * Quintic progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.QUINT_IN_OUT = function (p){
				if ( ( p *= 2 ) < 1 ) return 0.5 * p * p * p * p * p;
				return 0.5 * ( ( p -= 2 ) * p * p * p * p + 2 );
			};

			/**
			 * Sinusoidal progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.SIN_IN = function (p){
				return 1 - Math.cos( p * Math.PI / 2 );
			};
			/**
			 * Sinusoidal progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.SIN_OUT = function (p){
				return Math.sin( p * Math.PI / 2 );
			};
			/**
			 * Sinusoidal progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.SIN_IN_OUT = function (p){
				return 0.5 * ( 1 - Math.cos( Math.PI * p ) );
			};

			/**
			 * Exponential progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.EXP_IN = function (p){
				return p === 0 ? 0 : Math.pow( 1024, p - 1 );
			};
			/**
			 * Exponential progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.EXP_OUT = function (p){
				return p === 1 ? 1 : 1 - Math.pow( 2, - 10 * p );
			};
			/**
			 * Exponential progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.EXP_IN_OUT = function (p){
				if ( p === 0 ) return 0;
				if ( p === 1 ) return 1;
				if ( ( p *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, p - 1 );
				return 0.5 * ( - Math.pow( 2, - 10 * ( p - 1 ) ) + 2 );
			};

			/**
			 * Circular progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.CIRC_IN = function (p){
				return 1 - Math.sqrt( 1 - p * p);
			};
			/**
			 * Circular progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.CIRC_OUT = function (p){
				return Math.sqrt( 1 - ( --p * p ) );
			};
			/**
			 * Circular progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.CIRC_IN_OUT = function (p){
				if ( ( p *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - p * p) - 1);
				return 0.5 * ( Math.sqrt( 1 - ( p -= 2) * p) + 1);
			};

			/**
			 * Elastic progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.ELASTIC_IN = function (p){
				var s, a = 0.1, o = 0.4;
				if ( p === 0 ) return 0;
				if ( p === 1 ) return 1;
				if ( !a || a < 1 ) { a = 1; s = o / 4; }
				else s = o * Math.asin( 1 / a ) / ( 2 * Math.PI );
				return - ( a * Math.pow( 2, 10 * ( p -= 1 ) ) * Math.sin( ( p - s ) * ( 2 * Math.PI ) / o ) );
			};
			/**
			 * Elastic progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.ELASTIC_OUT = function (p){
				var s, a = 0.1, o = 0.4;
				if ( p === 0 ) return 0;
				if ( p === 1 ) return 1;
				if ( !a || a < 1 ) { a = 1; s = o / 4; }
				else s = o * Math.asin( 1 / a ) / ( 2 * Math.PI );
				return ( a * Math.pow( 2, - 10 * p) * Math.sin( ( p - s ) * ( 2 * Math.PI ) / o ) + 1 );
			};
			/**
			 * Elastic progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.ELASTIC_IN_OUT = function (p){
				var s, a = 0.1, o = 0.4;
				if ( p === 0 ) return 0;
				if ( p === 1 ) return 1;
				if ( !a || a < 1 ) { a = 1; s = o / 4; }
				else s = o * Math.asin( 1 / a ) / ( 2 * Math.PI );
				if ( ( p *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( p -= 1 ) ) * Math.sin( ( p - s ) * ( 2 * Math.PI ) / o ) );
				return a * Math.pow( 2, -10 * ( p -= 1 ) ) * Math.sin( ( p - s ) * ( 2 * Math.PI ) / o ) * 0.5 + 1;
			};
			
			/**
			 * Backswing progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.BACK_IN = function (p){
				return p * p * ( ( tc + 1 ) * p - tc );
			};
			/**
			 * Backswing progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.BACK_OUT = function (p){
				return --p * p * ( ( tc + 1 ) * p + tc ) + 1;
			};
			/**
			 * Backswing progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.BACK_IN_OUT = function (p){
				if ( ( p *= 2 ) < 1 ) return 0.5 * ( p * p * ( ( tr + 1 ) * p - tr ) );
				return 0.5 * ( ( p -= 2 ) * p * ( ( tr + 1 ) * p + tr ) + 2 );
			};

			/**
			 * Bouncing progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.BOUNCE_IN = function (p){
				return 1 - this.BOUNCE_OUT( 1 - p );
			};
			/**
			 * Bouncing progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.BOUNCE_OUT = function (p){
				if ( p < ( bff[0] ) ) return inib * p * p;
				else if ( p < ( bff[1] ) ) return inib * ( p -= ( rff[0] ) ) * p + rbff[0];
				else if ( p < ( bff[2] ) ) return inib * ( p -= ( rff[1] ) ) * p + rbff[1];
				else return inib * ( p -= ( rff[2] ) ) * p + rbff[2];
			};
			/**
			 * Bouncing progress curve
			 * @const
			 * @private
			 * @type {function}
			 * @param {number} progress Current progress
			 * @return {number} Modified progress
			 */
			this.BOUNCE_IN_OUT = function (p){
				if ( p < 0.5 ) return this.BOUNCE_IN( p * 2 ) * 0.5;
				return this.BOUNCE_OUT( p * 2 - 1 ) * 0.5 + 0.5;
			};
		}
		
		singleton = new Easings();
		return singleton;
	});
})();