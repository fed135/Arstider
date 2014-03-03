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

		define( "Arstider/Tween", ["Arstider/Easings", "Arstider/GlobalTimers", "Arstider/Timer"], function (Easings, GlobalTimers, Timer){
			
			function Transformation(property, start, end){
				this.property = property;
				this.start = start;
				this.end = end;
				this.lastStep = start;
			}
			
			Tween.Inherit(Timer);
			function Tween(target, changes, time, easing, easeOpt, loop){
				this._setup(target, changes, time, easing, easeOpt, loop);
			}
			
			Tween.prototype._setup = function(target, changes, time, easing, easeOpt){
				this.target = target || this.target;
				this.changes = [];
				
				this.startTime = time;
				
				this._loop = this._loop || false;
				this._yoyo = this._yoyo || false;
				
				this.easing = (easing == undefined)?Easings.LINEAR:easing;
				this.easeOpt = (easeOpt == undefined)?1:easeOpt;
				
				var prop;
				for(prop in changes){
					if(prop in target && !(target[prop] instanceof Function)){
						this.changes.push(new Transformation(prop, target[prop], changes[prop]));
					}
				}
				
				this._loopCallbacks = this._loopCallbacks || [];
				
				if(!this.callbackList){
					this.callbackList = [];
				}
				Super(this, this._runCallbacks, time, false);
				
				return this;
			};
			
			Tween.prototype.step = function(){
				var i = this.changes.length-1, progress = this.delay / this.startTime;
				
				if(progress > 1){
					progress = 1;
				}
				
				for(i; i>= 0; i--){
					this.changes[i].lastStep = this.target[this.changes[i].property];
					this.target[this.changes[i].property] = this.changes[i].end - ((this.changes[i].end - this.changes[i].start) * this.easing(progress, this.easeOpt));
				}
				return this;
			};
			
			Tween.prototype.loop = function(val){
				this._loop = val || true;
			};
			
			Tween.prototype.yoyo = function(val){
				this._yoyo = val || true;
			};
			
			Tween.prototype.play = function(){
				GlobalTimers.push(this);
				
				this.running = true;
				return this;
			};
			
			Tween.prototype.sleep = function(time){
				this.target.__tweenSleep = time;
				this.then({__tweenSleep:0}, time);
				
				return this;
			};
			
			Tween.prototype.rewind = function(ref){
				var thisRef = ref || this;
				
				thisRef.callbackList = thisRef._loopCallbacks;
				thisRef._loopCallbacks = [];
				
				var i = thisRef.changes.length-1;
				
				for(i; i>= 0; i--){
					thisRef.target[thisRef.changes[i].property] = thisRef.changes[i].start;
				}
				
				thisRef.restart();
				
				return thisRef;
			};
			
			Tween.prototype.invert = function(ref){
				var thisRef = ref || this;
				
				var i = thisRef.changes.length-1, cVal;
				
				for(i; i>= 0; i--){
					cVal = thisRef.changes[i].start;
					thisRef.changes[i].start = thisRef.changes[i].end;
					thisRef.changes[i].end = cVal;
				}
				
				thisRef.restart();
				return thisRef;
			};
			
			Tween.prototype.kill = function(){
				this.running = false;
				GlobalTimers.remove(this);
				return this;
			};
			
			Tween.prototype.then = function(fct, time, easing, easeOpt){
				if(fct instanceof Function){
					this.callbackList.push(fct);
					return this;
				}
				
				this.callbackList.push([fct, time, easing, easeOpt]);
				return this;
			};
			
			Tween.prototype.stepBack = function(){
				var i = this.changes.length-1;
				
				for(i; i>= 0; i--){
					this.target[this.changes[i].property] = this.changes[i].lastStep;
				}
				return this;
			};
			
			Tween.prototype._runCallbacks = function(){
				//For tween chaining, callbacks are called one at a time, not all at once
				if(this.callbackList.length > 0){
					var thisRef = this, fct = this.callbackList.shift();
					if(fct instanceof Function){
						fct(this);
						this._runCallbacks();
					}
					else{
						(function(_fct){
							setTimeout(function(){
								thisRef._setup(thisRef.target, fct[0], fct[1], fct[2], fct[3], fct[4]).play();
							},0);
						})(fct);
					}
					
					if(this._loop || this._yoyo){
						this._loopCallbacks.push(fct);
					}
				}
				else{
					if(this._loop){
						this.rewind();
					}
					else if(this._yoyo){
						this.invert();
					}
				}
			};
			
			return Tween;
		});