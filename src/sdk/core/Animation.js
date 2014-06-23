/**
 * Animation
 * 
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the Animation module
 */
define("Arstider/core/Animation", ["Arstider/core/Transformation", "Arstider/Easings"], /** @lends core/Animation */ function(Transformation, Easings){

	/**
	 * Tween animation Object constructor
	 * @constructor
	 * @name core/Animation
	 * @private
	 * @param {Object} target The tween target
	 * @param {Object} changes The list of Transformation objects
	 * @param {Object} time The time to complete the transformations
	 * @param {function|null} easing The Easing method to apply
	 * @param {number|null} easeOpt Easing options (for bounce, backswing and elastic)
	 */
	function Animation(target, changes, time, easing, easeOpt){
		this.changes = [];
		var prop;
		for(prop in changes){
			if(!(target[prop] instanceof Function)){
				if(!(prop in target)) target[prop] = 0;
				this.changes.push(new Transformation(prop, target[prop], changes[prop]));
			}
		}
				
		this.startTime = Arstider.checkIn(time, 1000);
		this.time = this.startTime;
		this.easing = Arstider.checkIn(easing, Easings.LINEAR);
		this.easeOpt = easeOpt;
	}
	
	/**
	 * Rewinds the current tween animation
	 * @private
	 * @type {function(this:Animation)}
	 */
	Animation.prototype.rewind = function(){
		this.time = this.startTime;
	};
	
	/**
	 * Steps the tween animation to the next frame
	 * @private
	 * @type {function(this:Animation)}
	 * @param {Tween} target The tween chain holding the animation
	 */
	Animation.prototype.step = function(target){
		var i = this.changes.length-1, progress = Math.min(this.time / this.startTime, 1);
		
		for(i; i>= 0; i--){
			this.changes[i].lastStep = target.target[this.changes[i].property];
			target.target[this.changes[i].property] = this.changes[i].end - ((this.changes[i].end - this.changes[i].start) * this.easing(progress, this.easeOpt));
		}
	};
	
	/**
	 * Returns to the previous frame
	 * @private
	 * @type {function(this:Animation)}
	 * @param {Tween} target The tween chain holding the animation
	 */
	Animation.prototype.stepBack = function(target){
		var i = this.changes.length-1;
		
		for(i; i>= 0; i--){
			target.target[this.changes[i].property] = this.changes[i].lastStep;
		}
	};

	return Animation;
});