/**
 * Tween. 
 *
 * @version 1.1.3
 * @status Stable
 * @author frederic charette <fredericcharette@gmail.com>
 */
	
/**
 * Defines the Tween module
 */	
define( "Arstider/Tween", [
	"Arstider/Easings", 
	"Arstider/GlobalTimers", 
	"Arstider/tweens/Transformation", 
	"Arstider/tweens/Animation",
	"Arstider/tweens/Action"
	], /** @lends Tween */ function (Easings, GlobalTimers, Transformation, Animation, Action){
	

	/**
	 * Default Easing method static variable
	 */
	Tween.DEFAULT_EASING = Easings.LINEAR;

	/**
	 * Default Easing time static variable
	 */
	Tween.DEFAULT_TIME = 1000;

	/**
	 * If tweens kill themselves when complete
	 */
	Tween.AUTO_KILL = false;

	/**
	 * Tween constructor
	 * Used to create smooth animations
	 * @class Tween
	 * @constructor
	 * @param {Object} target The object to apply the tween on
	 * @param {Object} changes The list of changes to apply
	 * @param {number} options Easing options OR easing time
	 * @param {function|null} easing The easing method to use
	 * @param {number|null} easeOpt Optional easing option (for bounce, backswing and elastic)
	 */
	function Tween(target, changes, options, easing, easeOpt){
		this.target = target;
		this.running = false;
		this.completed = false;
			
		this._stack = [];
		this._currentStep = 0;
		
		// To keep receiving step() from GlobalTimers
		this.delay = 512;
				
		if(changes) this._addAnimation(changes, options, easing, easeOpt);
	}

	/**
	 * Tween.to static constructor
	 * Ease the creation of tweens and make them auto-run
	 * @param {Object} target The object to apply the tween on
	 * @param {Object} changes The list of changes to apply
	 * @param {number} options Easing options OR easing time
	 * @param {function|null} easing The easing method to use (optional)
	 * @return {Tween}
	 */
	Tween.to = function(target, changes, options, easing) 
	{
		return new Tween(target).to(target, changes, options, easing).play();
	}

	/**
	 * Tween.from static constructor
	 * Ease the creation of tweens and make them auto-run
	 * @param {Object} target The object to apply the tween on
	 * @param {Object} changes The list of changes to apply
	 * @param {number} options Easing options OR easing time
	 * @param {function|null} easing The easing method to use (optional)
	 * @return {Tween}
	 */
	Tween.from = function(target, changes, options, easing) 
	{
		return new Tween(target).from(target, changes, options, easing).play();
	}

	/**
	 * A tween to a destination point
	 * @param {Object} target The object to apply the tween on
	 * @param {Object} changes The list of changes to apply
	 * @param {number} options Easing options OR easing time
	 * @param {function|null} easing The easing method to use (optional)
	 * @return {Tween}
	 */
	Tween.prototype.to = function(target, changes, options, easing)
	{
		// Got delay before the animation?
		if(options && options.delay>0) this.sleep(options.delay);

		this._addAnimation(changes, options, easing);

		return this;
	};

	/**
	 * A tween from an origin 
	 * @param {Object} target The object to apply the tween on
	 * @param {Object} changes The list of changes to apply
	 * @param {number} options Easing options OR easing time
	 * @param {function|null} easing The easing method to use (optional)
	 * @return {Tween}
	 */
	Tween.prototype.from = function(target, changes, options, easing)
	{
		var val;
		var p;

		// Reverse origin and destination
		var newChanges = {};
		for(p in changes)
		{
			val = changes[p];
			newChanges[p] = target[p];
			target[p]=val;
		}

		return this.to(target, newChanges, options, easing);
	};

	
	/**
	 * Adds an animation step to the tween chain
	 * @private
	 * @type {function(this:Tween)}
	 * @param {Object} changes The list of changes
	 * @param {number} options Easing options OR easing time
	 * @param {function|null} easing The easing method to use
	 * @param {number|null} easeOpt Optional easing option (for bounce, backswing and elastic)
	 */
	Tween.prototype._addAnimation = function(changes, options, easing, easeOpt)
	{
		// Time validation
		var time;

		// Options is time
		if(options>0 || options===0)
		{
			time = options;
		}
		// Options is object
		else if(options)
		{
			time = options.time;
			easing = options.easing;
		}

		// Time validation
		if(!time && time!==0) time = Tween.DEFAULT_TIME;

		// Easing validation
		if(!easing) easing = Tween.DEFAULT_EASING;

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
	Tween.prototype.step = function()
	{
		// To keep receiving step() from GlobalTimers
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

			if(Tween.AUTO_KILL)
			{
				this.kill();
			}
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