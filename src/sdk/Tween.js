/**
 * Tween. 
 *
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */
	
/**
 * Defines the Tween module
 */	
define( "Arstider/Tween", ["Arstider/Easings", "Arstider/GlobalTimers"], /** @lends Tween */ function (Easings, GlobalTimers){
	
	/**
	 * Transformation Object constructor
	 * @constructor
	 * @private
	 * @param {Object} property The property affected by the transformation
	 * @param {Object} start The starting value
	 * @param {Object} end The end value
	 */
	function Transformation(property, start, end){
		this.property = property;
		this.start = start;
		this.end = end;
		this.lastStep = start;
	}
	
	/**
	 * Tween animation Object constructor
	 * @constructor
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
	
	/**
	 * Tween action step constructor
	 * @constructor
	 * @private
	 * @param {function} callback The method to call at that step
	 * @param {*} option Optional data to provide the callback with
	 */
	function Action(callback, option){
		this.startTime = 1;
		this.timesToRun = Arstider.checkIn(option, 1);
		this.timesRan = 0;
		this.time = this.startTime;
		this.callback = callback;
		this.callbackOption = [Arstider.checkIn(option, null)];
	}
	
	/**
	 * Rewinds the action step
	 * @private
	 * @type {function(this:Action)}
	 */
	Action.prototype.rewind = function(){
		this.time = this.startTime;
		this.timesRan = 0;
	};
	
	/**
	 * Calls the callback function
	 * @private
	 * @type {function(this:Action)}
	 * @param {Tween} target The tween chain holding the animation
	 */	
	Action.prototype.step = function(target){
		if(this.timesToRun > this.timesRan || this.timesToRun == -1){
			this.callback.apply(target, this.callbackOption);
			this.timesRan++;
		}
	};
	
	/**
	 * Tween constructor
	 * Used to create smooth animations
	 * @class Tween
	 * @constructor
	 * @param {Object} target The object to apply the tween on
	 * @param {Object} changes The list of changes to apply
	 * @param {number} time The time to complete the changes
	 * @param {function|null} easing The easing method to use
	 * @param {number|null} easeOpt Optional easing option (for bounce, backswing and elastic)
	 */
	function Tween(target, changes, time, easing, easeOpt){
		this.target = target;
		this.running = false;
		this.completed = false;
			
		this._stack = [];
		this._currentStep = 0;
				
		this.delay = 512;
				
		this._addAnimation(changes, time, easing, easeOpt);
	}
	
	/**
	 * Adds an animation step to the tween chain
	 * @private
	 * @type {function(this:Tween)}
	 * @param {Object} changes The list of changes
	 * @param {number} time The time to complete the changes
	 * @param {function|null} easing The easing method to use
	 * @param {number|null} easeOpt Optional easing option (for bounce, backswing and elastic)
	 */
	Tween.prototype._addAnimation = function(changes, time, easing, easeOpt){
		this._stack.push(new Animation(this.target, changes, time, easing, easeOpt));
	};
	
	/**
	 * Adds an action step to the tween chain
	 * @private
	 * @type {function(this:Tween)}
	 * @param {function} callback The function to call on that step
	 * @param {*} option Optional data to provide the callback with
	 */
	Tween.prototype._addAction = function(callback, option){
		this._stack.push(new Action(callback, option));
	};
	
	/**
	 * Goes to the tween's next step in the chain
	 * @type {function(this:Tween)}
	 * @return {Tween} Returns self for chaining
	 */
	Tween.prototype.nextStep = function(){
		var i;
			
		//make sure we reached the final step of the animation
		if(this._stack[this._currentStep].changes){
			for(i = this._stack[this._currentStep].changes.length-1; i >= 0; i--){
				this._stack[this._currentStep].changes[i].lastStep = this.target[this._stack[this._currentStep].changes[i].property];
				this.target[this._stack[this._currentStep].changes[i].property] = this._stack[this._currentStep].changes[i].end;
			}
		}
				
		//prepare new animation
		this._currentStep++;
		if(this._currentStep < this._stack.length){
			if(this._stack[this._currentStep].changes){
				for(i = this._stack[this._currentStep].changes.length-1; i >= 0; i--){
					this._stack[this._currentStep].changes[i].start = this.target[this._stack[this._currentStep].changes[i].property];
				}
			}
		}
				
		return this;
	};
	
	/**
	 * Performs timed step, from engine global timers
	 * @type {function(this:Tween)}
	 */	
	Tween.prototype.step = function(){
		this.delay = 512;
				
		if(this._currentStep < this._stack.length){
			if(this._stack[this._currentStep].time > 0){
				if(this._stack[this._currentStep].step) this._stack[this._currentStep].step(this);
				this._stack[this._currentStep].time -= Math.round(1000/Arstider.FPS);
			}
			else{
				this.nextStep();
				this.step();
			}
		}
		else{
			this.completed = true;
		}
	};
	
	/**
	 * Starts playing, adds the tween to global timers
	 * @type {function(this:Tween)}
	 * @return {Tween} Returns self for chaining
	 */
	Tween.prototype.play = function(){
		GlobalTimers.push(this);
				
		this.running = true;
		return this;
	};
	
	/**
	 * Pauses the tween
	 * @type {function(this:Tween)}
	 * @return {Tween} Returns self for chaining
	 */
	Tween.prototype.pause = function(){
		this.running = false;
		return this;
	};
	
	/**
	 * Resumes the tween
	 * @type {function(this:Tween)}
	 * @return {Tween} Returns self for chaining
	 */
	Tween.prototype.resume = function(){
		if(!this.completed) this.running = true;
		return this;
	};
	
	/**
	 * Adds an idle step
	 * @type {function(this:Tween)}
	 * @param {number} time The idle time in MS
	 * @return {Tween} Returns self for chaining
	 */
	Tween.prototype.sleep = function(time){
		var sleepProp = {};
		sleepProp["__tweenSleep" + Arstider.timestamp()] = time;
				
		this.then(sleepProp, time);
		
		return this;
	};
	
	/**
	 * Adds a step to the Tween
	 * @type {function(this:Tween)}
	 * @param {function|Object} parA If the element is a function, add an action step, else, add an animation step
	 * @param {*} parB If it's an action step, use as option. else, use as transformations list
	 * @param {function|null} easing If it's an animation step, use as easing function
	 * @param {number|null} easeOpt If it's an animation step, use as easing option
	 * @return {Tween} Returns self for chaining
	 */
	Tween.prototype.then = function(parA, parB, easing, easeOpt){
		if(parA instanceof Function || typeof parA === "function") this._addAction(parA, parB);
		else this._addAnimation(parA, parB, easing, easeOpt);
		
		return this;
	};
	
	/**
	 * Rewinds the tween chain
	 * @type {function(this:Tween)}
	 * @return {Tween} Returns self for chaining
	 */
	Tween.prototype.rewind = function(){
		this._currentStep = 0;
		for(var i = this._stack.length-1; i>=0; i--){
			this._stack[i].rewind();
		}
		this.step();	
		return this;
	};
	
	/**
	 * Adds the inverted steps of the tween chain at the end (forced yoyo)
	 * @type {function(this:Tween)}
	 * @return {Tween} Returns self for chaining
	 */	
	Tween.prototype.reverse = function(){
				
		var 
			cVal,
			revStep,
			trans,
			i
		;
				
		for(i = this._stack.length-1; i>= 0; i--){
			if(this._stack[i].changes){
				revStep = new Animation(this, {}, this._stack[i].startTime, this._stack[i].easing, this._stack[i].easingOpt);
				for(trans = this._stack[i].changes.length-1; trans >= 0; trans--){
					revStep.changes.push(new Transformation(this._stack[i].changes[trans].property, this._stack[i].changes[trans].start, this._stack[i].changes[trans].end));
				}
				this._stack.push(revStep);
			}
		}
				
		return this;
	};
	
	/**
	 * Stops the tween and removes it from the global timers
	 * @type {function(this:Tween)}
	 * @return {Tween} Returns self for chaining
	 */
	Tween.prototype.kill = Tween.prototype.stop = function(){
		this.running = false;
		GlobalTimers.remove(this);
		return this;
	};
			
	/**
	 * Adds a loop step
	 * @type {function(this:Tween)}
	 * @param {number} val
	 * @return {Tween} Returns self for chaining
	 */
	Tween.prototype.loop = function(val){
		this._addAction(this.rewind, Arstider.checkIn(val, -1));
		return this;
	};
	
	/**
	 * Adds a yoyo step (reversed previous steps)
	 * @type {function(this:Tween)}
	 * @return {Tween} Returns self for chaining
	 */
	Tween.prototype.yoyo = function(){
		this._addAction(this.reverse);
		return this;
	};
	
	/**
	 * Goes to the previous step in the current tween animation
	 * @type {function(this:Tween)}
	 * @return {Tween} Returns self for chaining
	 */
	Tween.prototype.stepBack = function(){
		if(this._stack[this._currentStep].stepBack) this._stack[this._currentStep].stepBack(this);
		else{
			if(Arstider.verbose > 2) console.warn("Arstider.Tween.stepBack: no step to back to");
		}
		return this;
	};
					
	return Tween;
});