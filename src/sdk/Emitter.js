/**
 * Display Object
 *
 * @version 1.1.3
 * @author frederic charette <fredc@meetfidel.com>
 */
;(function(){
	
	var 
		/**
		 * Default props
		 * @private
		 * @const
		 * @type {Object}
		 */
		defProps = {
			spawnRate:150,
			startingIndex:0,
			maxLifeTime:100,
			maxLifeTimeVariant:0,
			xVelocity:0,
			xVelocityDecay:0,
			xVelocityVariant:0,
			yVelocity:0,
			yVelocityDecay:0,
			yVelocityVariant:0,
			scale:1,
			scaleDecay:0,
			scaleVariant:0,
			rotation:0,
			rotationDecay:0,
			rotationVariant:0,
			alpha:1,
			alphaDecay:0,
			alphaVariant:0
		}
	;

	/**
	 * Resets a particle's properties to default values, for re-instantiation
	 * @private
	 * @type {function}
	 * @param {Object} particle Particle instance object
	 * @param {Object} settings Default values
	 * @return {Object} Returns the updated particle
	 */
	function resetParticleSettings(particle, settings){
		return Arstider.mixin(particle.__particleInfo, settings, true);
	}
	
	/**
	 * Rolls a random number with variant and base value
	 * @private
	 * @type {function}
	 * @param {number} base The base value to add
	 * @param {number} variant The amount of random to add (positive/negative)
	 * @return {number} The final random number
	 */
	function rollVariant(base, variant){
		return base + ((Math.random()*(variant*2))-variant);
	}

	/**
	 * Defines the Emitter module
	 */
	define("Arstider/Emitter", ["Arstider/DisplayObject", "Arstider/Pool"], function(DisplayObject, Pool){
	
		/**
		 * Emitter constructor
		 * @constructor
		 * @param {Object|null} props Optional parameters
		 */
		function Emitter(props){
			
			Arstider.Super(this, DisplayObject, props);
			
			//TODO
			//this.maxParticles = Arstider.checkIn(props.maxParticles, 100);
			
			props = props || Arstider.emptyObject;
			
			this.modulePool = [];
			
			this.canonTimers = {};
			this.canonActivated = false;
			
			this._container = new DisplayObject();
		}
		
		Arstider.Inherit(Emitter, DisplayObject);
		
		/**
		 * Adds a particle constructor to the queue with instantiation options
		 * @type {function(this:Emitter)}
		 * @param {string} name The name of the particle type (for later access)
		 * @param {function} module The particle constructor
		 * @param {Object} options The instantiation options 
		 */
		Emitter.prototype.addParticleType = function(name, module, options){
			options = options || Arstider.emptyObject;
			
			var finalOpts = Arstider.mixin(options, defProps);
			
			this.modulePool.push({name:name, module:module, options: finalOpts});
			Pool.prealloc(module, 1/*, options.maxParticles || this.maxParticles*/);
			
			if(this.canonActivated){
				//Restart already playing emitter to include new particles
				this.stop();
				this.start();
			}
		};
		
		/**
		 * Removes a particle type from the emitter
		 * @type {function(this:Emitter)}
		 * @param {string} name The name of the particle type to remove
		 */
		Emitter.prototype.removeParticleType = function(name){
			for(var i=0; i<this.modulePool.length; i++){
				if(this.modulePool[i].name === name){
					this.modulePool.splice(i,1);
				}	
			}
			
			if(this.canonActivated){
				//Restart already playing emitter to exclude new particles
				this.stop();
				this.start();
			}
		};
		
		/**
		 * Starts the canon
		 * @type {function(this:Emitter)}
		 */
		Emitter.prototype.start = function(){
			this.canonActivated = true;
			
			if(this._container.parent == null) this.parent.addChild(this._container);
			
			for(var i=0; i<this.modulePool.length; i++){
				if(this.canonTimers[this.modulePool[i].name] == undefined){
					this.spawn(this.modulePool[i]);
				}
			}
		};
		
		/**
		 * Stops the canon
		 * @type {function(this:Emitter)}
		 */
		Emitter.prototype.stop = function(){
			this.canonActivated = false;
			for(var i in this.canonTimers){
				clearTimeout(this.canonTimers[i]);
			}
			this.canonTimers = {};
		};
		
		/**
		 * Spawns a particle type
		 * @type {function(this:Emitter)}
		 * @param {string} type The name of the particle type to emit
		 */
		Emitter.prototype.spawn = function(type){
			
			var 
				thisRef = this
			;
			
			if(!this.canonActivated) return;
			
			this.canonTimers[type.name] = setTimeout(function(){
				thisRef.spawn.apply(thisRef, [type]);
			}, type.options.spawnRate || 150);
			
			Pool.get(type.module, function(particle){
				
				resetParticleSettings(particle, type.options);
				
				//adjust starting variants
				if(particle.__particleInfo.maxLifeTimeVariant != 0) particle.__particleInfo.maxLifetime 	= rollVariant(particle.__particleInfo.maxLifetime, 	particle.__particleInfo.maxLifeTimeVariant);
				if(particle.__particleInfo.xVelocityVariant != 0) particle.__particleInfo.xVelocity 		= rollVariant(particle.__particleInfo.xVelocity, 	particle.__particleInfo.xVelocityVariant);
				if(particle.__particleInfo.yVelocityVariant != 0) particle.__particleInfo.yVelocity 		= rollVariant(particle.__particleInfo.yVelocity, 	particle.__particleInfo.yVelocityVariant);
				if(particle.__particleInfo.scaleVariant != 0) particle.__particleInfo.scale 				= rollVariant(particle.__particleInfo.scale, 		particle.__particleInfo.scaleVariant);
				if(particle.__particleInfo.rotationVariant != 0) particle.__particleInfo.rotation 			= rollVariant(particle.__particleInfo.rotation, 	particle.__particleInfo.rotationVariant);
				if(particle.__particleInfo.alphaVariant != 0) particle.__particleInfo.alpha 				= rollVariant(particle.__particleInfo.alpha, 		particle.__particleInfo.alphaVariant);
				
				particle.rotation = particle.__particleInfo.rotation;
				particle.alpha = particle.__particleInfo.alpha;
				if(particle.alpha >1) particle.alpha = 1;
				if(particle.alpha < 0) particle.alpha = 0;
				particle.scaleX = particle.scaleY = particle.__particleInfo.scale;
				particle.x = this.x;
				particle.y = this.y;
				
				particle.parent = this._container;
				if(particle.__particleInfo.startingIndex < this._container.children.length){
					this._container.children.splice(particle.__particleInfo.startingIndex, 0, particle);
				}
				else{
					this._container.children[this.children.length] = particle;
				}
			});
		};
		
		/**
		 * Overrides the DisplayObject Update method. 
		 * @override
		 * @type {function(this:Emitter)}
		 */
		Emitter.prototype.update = function(){
			var i = this._container.children.length-1, currPart;
			for(i; i>=0; i--){
				currPart = this._container.children[i];
				currPart.__particleInfo.lifeTime++;
				if(currPart.__particleInfo.lifeTime >= currPart.__particleInfo.maxLifeTime || currPart.alpha <= 0){
					currPart.parent = null;
					Pool.free(currPart, true);
					this._container.children.splice(i,1);
				}
				else{
					//Move it
					currPart.alpha -= currPart.__particleInfo.alphaDecay;
					currPart.rotation += currPart.__particleInfo.rotation;
					currPart.scaleX *= currPart.__particleInfo.scale;
					currPart.scaleY *= currPart.__particleInfo.scale;
					currPart.x += currPart.__particleInfo.xVelocity;
					currPart.y += currPart.__particleInfo.yVelocity;
					
					//Change speed values
					currPart.__particleInfo.rotation += currPart.__particleInfo.rotationDecay;
					currPart.__particleInfo.scale -= currPart.__particleInfo.scaleDecay;
					currPart.__particleInfo.xVelocity -= currPart.__particleInfo.xVelocityDecay;
					currPart.__particleInfo.yVelocity -= currPart.__particleInfo.yVelocityDecay;
				}
			}
		};
	
		return Emitter;
	});
})();