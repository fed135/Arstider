/**
 * Animation
 * 
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the Animation module
 */
define("Arstider/tweens/Animation", ["Arstider/tweens/Transformation", "Arstider/Easings"], /** @lends tweens/Animation */ function(Transformation, Easings){

	/**
	 * Tween animation Object constructor
	 * @constructor
	 * @name tweens/Animation
	 * @private
	 * @param {Object} target The tween target
	 * @param {Object} changes The list of Transformation objects
	 * @param {Object} time The time to complete the transformations
	 * @param {function|null} easing The Easing method to apply
	 * @param {number|null} easeOpt Easing options (for bounce, backswing and elastic)
	 */
	function Animation(target, changes, time, easing, easeOpt){
		this.changes = [];
		var prop, propIsColor;
		for(prop in changes){
			propIsColor = false;
			if(!(target[prop] instanceof Function)){
				if(!(prop in target)) target[prop] = 0;
				if(typeof target[prop] == 'string' && target[prop].indexOf("#") != -1 && typeof changes[prop] == 'string' && changes[prop].indexOf("#") != -1) propIsColor = true;
				
				this.changes.push(new Transformation({
					property:prop, 
					start:target[prop], 
					end:changes[prop],
					isColor:propIsColor
				}));
			}
		}
				
		this.startTime = Arstider.checkIn(time, 1000);
		this.time = this.startTime;
		this.easing = Arstider.checkIn(easing.bind(Easings), Easings.LINEAR);
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
		var i = this.changes.length-1, progress = Arstider.min(this.time / this.startTime, 1);
		
		for(i; i>= 0; i--){
			this.changes[i].lastStep = target.target[this.changes[i].property];
			if(this.changes[i].isColor){
				target.target[this.changes[i].property] = this._stepColor(this.changes[i].end, this.changes[i].start, this.easing(progress));
			}
			else{
				target.target[this.changes[i].property] = this.changes[i].end - ((this.changes[i].end - this.changes[i].start) * this.easing(progress, this.easeOpt));
			}
		}
	};

	/**
	 * Animates from one color to another
	 * @private
	 * @type {function(this:Animation)}
	 * @param {string} start The starting color
	 * @param {string} end The end color
	 * @param {number} progress The current progress percentage
	 * @return {string} The current color step
	 */
	Animation.prototype._stepColor = function(start, end, progress){
		var 
			f = parseInt(start.slice(1),16),
			t = parseInt(end.slice(1),16),

			R1 = f>>16,
			G1 = f>>8&0xFF,
			B1 = f&0xFF,

			R2 = t>>16,
			G2 = t>>8&0xFF,
			B2 = t&0xFF
		;
		
    	return "#"+(0x1000000+(Arstider.chop((R2-R1)*progress)+R1)*0x10000+(Arstider.chop((G2-G1)*progress)+G1)*0x100+(Arstider.chop((B2-B1)*progress)+B1)).toString(16).slice(1);
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