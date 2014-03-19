;(function(){

	function resetParticleSettings(particle, settings){
		particle.__spawnRate = Arstider.checkIn(settings.spawnRate, 150);
		
		particle.__startingIndex = Arstider.checkIn(settings.startingIndex, 0);
		
		particle.__maxLifeTime = Arstider.checkIn(settings.maxLifeTime, 100);
		particle.__maxLifeTimeVariant = Arstider.checkIn(settings.maxLifeTimeVariant, 0);
		particle.__lifeTime = 0;
		
		particle.__xVelocity = Arstider.checkIn(settings.xVelocity, 0);
		particle.__xVelocityDecay = Arstider.checkIn(settings.xVelocityDecay, 0);
		particle.__xVelocityVariant = Arstider.checkIn(settings.xVelocityVariant, 0);
		
		particle.__yVelocity = Arstider.checkIn(settings.yVelocity, 0);
		particle.__yVelocityDecay = Arstider.checkIn(settings.yVelocityDecay, 0);
		particle.__yVelocityVariant = Arstider.checkIn(settings.yVelocityVariant, 0);
		
		particle.__scale  = Arstider.checkIn(settings.scale, 1);
		particle.__scaleDecay = Arstider.checkIn(settings.scaleDecay, 0);
		particle.__scaleVariant = Arstider.checkIn(settings.scaleVariant, 0);
		
		particle.__rotation = Arstider.checkIn(settings.rotation, 0);
		particle.__rotationDecay = Arstider.checkIn(settings.rotationDecay, 0);
		particle.__rotationVariant = Arstider.checkIn(settings.rotationVariant, 0);
		
		particle.__alpha = Arstider.checkIn(settings.alpha, 1);
		particle.__alphaDecay = Arstider.checkIn(settings.alphaDecay, 0);
		particle.__alphaVariant = Arstider.checkIn(settings.alphaVariant, 0);
	}
	
	function rollVariant(base, variant){
		return base + ((Math.random()*(variant*2))-variant);
	}

define("Arstider/Emitter", ["Arstider/DisplayObject", "Arstider/Pool"], function(DisplayObject, Pool){

	
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
	
	Emitter.prototype.addParticleType = function(name, module, options){
		options = options || Arstider.emptyObject;
		
		this.modulePool.push({name:name, module:module, options:options});
		Pool.prealloc(module, 1/*, options.maxParticles || this.maxParticles*/);
		
		if(this.canonActivated){
			//Restart already playing emitter to include new particles
			this.stop();
			this.start();
		}
	};
	
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
	
	Emitter.prototype.start = function(){
		this.canonActivated = true;
		
		if(this._container.parent == null) this.parent.addChild(this._container);
		
		for(var i=0; i<this.modulePool.length; i++){
			if(this.canonTimers[this.modulePool[i].name] == undefined){
				this.spawn(this, this.modulePool[i]);
			}
		}
	};
	
	Emitter.prototype.stop = function(){
		this.canonActivated = false;
		for(var i in this.canonTimers){
			clearTimeout(this.canonTimers[i]);
		}
		this.canonTimers = {};
	};
	
	Emitter.prototype.spawn = function(thisRef, type){
		
		if(!thisRef.canonActivated) return;
		
		thisRef.canonTimers[type.name] = setTimeout(function(){
			thisRef.spawn(thisRef, type);
		}, type.options.spawnRate || 150);
		
		Pool.get(type.module, function(particle){
			resetParticleSettings(particle, type.options);
			
			//adjust starting variants
			if(particle.__maxLifeTimeVariant != 0) particle.__maxLifetime 	= rollVariant(particle.__maxLifetime, 	particle.__maxLifeTimeVariant);
			if(particle.__xVelocityVariant != 0) particle.__xVelocity 		= rollVariant(particle.__xVelocity, 	particle.__xVelocityVariant);
			if(particle.__yVelocityVariant != 0) particle.__yVelocity 		= rollVariant(particle.__yVelocity, 	particle.__yVelocityVariant);
			if(particle.__scaleVariant != 0) particle.__scale 				= rollVariant(particle.__scale, 		particle.__scaleVariant);
			if(particle.__rotationVariant != 0) particle.__rotation 		= rollVariant(particle.__rotation, 		particle.__rotationVariant);
			if(particle.__alphaVariant != 0) particle.__alpha 				= rollVariant(particle.__alpha, 		particle.__alphaVariant);
			
			particle.rotation = particle.__rotation;
			particle.alpha = particle.__alpha;
			if(particle.alpha >1) particle.alpha = 1;
			if(particle.alpha < 0) particle.alpha = 0;
			particle.scaleX = particle.scaleY = particle.__scale;
			particle.x = thisRef.x;
			particle.y = thisRef.y;
			
			particle.parent = thisRef._container;
			if(particle.__startingIndex < thisRef._container.children.length){
				thisRef._container.children.splice(particle.__startingIndex, 0, particle);
			}
			else{
				thisRef._container.children[thisRef.children.length] = particle;
			}
		});
	};
	
	Emitter.prototype.update = function(){
		var i = this._container.children.length-1, currPart;
		for(i; i>=0; i--){
			currPart = this._container.children[i];
			currPart.__lifeTime++;
			if(currPart.__lifeTime >= currPart.__maxLifeTime || currPart.alpha <= 0){
				currPart.parent = null;
				Pool.free(currPart, true);
				this._container.children.splice(i,1);
			}
			else{
				//Move it
				currPart.alpha -= currPart.__alphaDecay;
				currPart.rotation += currPart.__rotation;
				currPart.scaleX *= currPart.__scale;
				currPart.scaleY *= currPart.__scale;
				currPart.x += currPart.__xVelocity;
				currPart.y += currPart.__yVelocity;
				
				//Change speed values
				currPart.__rotation += currPart.__rotationDecay;
				currPart.__scale -= currPart.__scaleDecay;
				currPart.__xVelocity -= currPart.__xVelocityDecay;
				currPart.__yVelocity -= currPart.__yVelocityDecay;
			}
		}
	};

	return Emitter;
});
})();
