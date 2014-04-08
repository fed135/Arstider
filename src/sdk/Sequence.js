/**
 * AMD Closure
 */	

	define( "Arstider/Sequence", [], function () {
		
		/**
		 * Creates an instance of Sequence.
		 *
		 * @constructor
		 * @this {Sequence}
		 * @param {Sheet Class} sheet The Sheet class to pool frames from 
		 * @param {number} time The amount of time between frames
		 * @param {array} frames The frames in order for the sequence
		 * @param {boolean | int} stop Weither the animation should stop at the end or loop - if int the amount of loops (TODO).
		 */
		 	
			var Sequence = function(sheet, time, frames, stop){
				this.sheet = sheet;
				this.time = time*1000;
				this.frames = frames || [0];
				
				//Completed loops
				this.loops = 0;
				
				//Required loops
				if(typeof stop === "number"){
					this.stop = stop;
				}
				if(stop == undefined || stop === -1){
					this.stop = -1;
				}
				if(stop === true || stop === 0){
					this.stop = 0;
				}
				
				//Minimum 1 frame interval
				if(this.time < 20){
					this.time = 20; 
				}
				this.chainedAnim = null;
				this.callbacks = [];
			};
			
			/**
			 * Draws the current Sprite onto the canvas
			 *
			 * @this {Sequence}
			 * @param {Number} time The amount of time in seconds between frames
			 * @param {Array} frames The frame indexes in the order they will be displayed
			 * @param {Boolean | Integer} stop The number of loops before the animation stops (accepts boolean for backwards compatibility)
			 * @return @this.chainedAnim
			 */
			Sequence.prototype.then = function(parA, frames, stop){
				if(parA instanceof Function || typeof parA === "function") this.callbacks.push(parA);
				else if(parA instanceof String || typeof parA === "string") this.callbacks.push(function(){
					this.currentAnim = this.currentAnim.sheet[parA];
					this.rewind();
				});
				else this.chainedAnim = new Sequence(this.sheet, parA, frames, stop);
				return this.chainedAnim;
			};
			
			/**
			 * Adds a function to the list of callbacks
			 *
			 * @this {Sequence}
			 * @param {Function} fct The function to add to the list of callbacks that run after every sequence.
			 * @return @this
			 */
			Sequence.prototype.callback = function(fct){
				this.callbacks.push(fct);
				return this;
			};
			
			return Sequence;
	});