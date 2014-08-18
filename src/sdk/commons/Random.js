/**
 * Random
 * 
 * @version 1.1.4
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the Random module
 */
define("Arstider/commons/Random", [], /** @lends commons/Random */function(){
	
	/**
	 * Random constructor
	 * Random number generator
	 * @constructor
	 * @class commons/Random
	 * @param {number|null} seed The generator seed.
	 */
	function Random(seed) {

	    /**
	     * @private 
	     * @type {number} 
	     */
	    this.seed = seed && !isNaN(seed) ? seed : Arstider.timestamp();

	    /**
	     * @private 
	     * @type {number} 
	     */
	    this.i_ = 0;

	    /**
	     * @private 
	     * @type {number} 
	     */
	    this.j_ = 0;

	    /**
	     * @private 
	     * @type {Array.<number>}
	     */
	    this.S_ = [];

	    this.init(('' + seed).split(''));
	};

	/**
	 * Get a random number
	 * @param {Array.<number>} key The generator key.
	 */
	Random.prototype.init = function(key) {
	    var i, j, t;
	    for (i = 0; i < 256; ++i) {
	        this.S_[i] = i;
	    }
	    j = 0;
	    for (i = 0; i < 256; ++i) {
	        j = (j + this.S_[i] + key[i % key.length]) & 255;
	        t = this.S_[i];
	        this.S_[i] = this.S_[j];
	        this.S_[j] = t;
	    }
	    this.i_ = 0;
	    this.j_ = 0;
	};

	/**
	 * Get a random number
	 * @return {number} A random number.
	 */
	Random.prototype.next = function() {
	    var t;
	    this.i_ = (this.i_ + 1) & 255;
	    this.j_ = (this.j_ + this.S_[this.i_]) & 255;
	    t = this.S_[this.i_];
	    this.S_[this.i_] = this.S_[this.j_];
	    this.S_[this.j_] = t;
	    return this.S_[(t + this.S_[this.i_]) & 255];
	};

	return Random;

});