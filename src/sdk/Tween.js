/**
 * Animations Wrapper. 
 * 
 * Provides common private variables and methods for the Animations as well as
 * AMD Closure and prototypes.
 *
 * @author frederic charette <fredc@meetfidel.com>
 */
	
	/**
	 * AMD Closure
	 */	

		define( "Arstider/Tween", ["Arstider/Easings", "Arstider/GlobalTimers"], function (Easings, GlobalTimers){
			
			function Transformation(property, start, end){
				this.property = property;
				this.start = start;
				this.end = end;
				this.lastStep = start;
			}
			
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
			
			Animation.prototype.rewind = function(target){
				this.time = this.startTime;
			};
			
			Animation.prototype.step = function(target){
				var i = this.changes.length-1, progress = Math.min(this.time / this.startTime, 1);
				
				for(i; i>= 0; i--){
					this.changes[i].lastStep = target.target[this.changes[i].property];
					target.target[this.changes[i].property] = this.changes[i].end - ((this.changes[i].end - this.changes[i].start) * this.easing(progress, this.easeOpt));
				}
			};
			
			Animation.prototype.stepBack = function(target){
				var i = this.changes.length-1;
				
				for(i; i>= 0; i--){
					target.target[this.changes[i].property] = this.changes[i].lastStep;
				}
			};
			
			function Action(callback, option){
				this.startTime = 1;
				this.time = this.startTime;
				this.callback = callback;
				this.callbackOption = Arstider.checkIn(option, []);
			}
			
			Action.prototype.rewind = function(target){
				this.time = this.startTime;
			};
			
			Action.prototype.step = function(target){
				this.callback.apply(target, this.callbackOption);
			};
			
			function Tween(target, changes, time, easing, easeOpt){
				this.target = target;
				this.running = false;
				this.completed = false;
				
				this._stack = [];
				this._currentStep = 0;
				this._repeat = 0;
				this.maxLoop = null;
				
				this.delay = 512;
				
				this._addAnimation(changes, time, easing, easeOpt);
			}
			
			Tween.prototype._addAnimation = function(changes, time, easing, easeOpt){
				this._stack.push(new Animation(this.target, changes, time, easing, easeOpt));
			};
			
			Tween.prototype._addAction = function(callback, option){
				this._stack.push(new Action(callback, option));
			};
			
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
			
			Tween.prototype.step = function(){
				this.delay = 512;
				
				if(this._currentStep < this._stack.length){
					if(this._stack[this._currentStep].time > 0){
						if(this._stack[this._currentStep].step) this._stack[this._currentStep].step(this);
						this._stack[this._currentStep].time -= Arstider._fullFPS;;
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
			
			Tween.prototype.play = function(){
				GlobalTimers.push(this);
				
				this.running = true;
				return this;
			};
			
			Tween.prototype.pause = function(){
				this.running = false;
				return this;
			};
			
			Tween.prototype.sleep = function(time){
				var sleepProp = {};
				sleepProp["__tweenSleep" + Arstider.timestamp()] = time;
				
				this.then(sleepProp, time);
				
				return this;
			};
			
			Tween.prototype.then = function(parA, parB, easing, easeOpt){
				if(parA instanceof Function || typeof parA === "function") this._addAction(parA, parB);
				else this._addAnimation(parA, parB, easing, easeOpt);
				
				return this;
			};
			
			Tween.prototype.rewind = function(){
				this._repeat++;
				if(this.maxLoop && this._repeat > this.maxLoop){
					this.completed = true;
					
					return;
				} 
				
				this._currentStep = 0;
				for(var i = this._stack.length-1; i>=0; i--){
					this._stack[i].rewind();
				}
				
				return this;
			};
			
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
			
			Tween.prototype.kill = Tween.prototype.stop = function(){
				this.running = false;
				GlobalTimers.remove(this);
				return this;
			};
			
			
			Tween.prototype.loop = function(val){
				if(val) this.maxLoop = val;
				
				this._addAction(this.rewind);
				return this;
			};
			
			Tween.prototype.yoyo = function(val){
				this._addAction(this.reverse);
				return this;
			};
			
			Tween.prototype.stepBack = function(){
				if(this._stack[this._currentStep].stepBack) this._stack[this._currentStep].stepBack(this);
				else{
					if(Arstider.verbose > 2) console.warn("Arstider.Tween.stepBack: no step to back to");
				}
				return this;
			};
			
			
			return Tween;
		});