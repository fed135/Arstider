;(function(){

	function resetParticleSettings(particle, settings){
		particle.__isParticle = true;
		
		particle.__maxLifeTime = (settings.maxLifeTime == undefined)?1000:settings.maxLifeTime;
		particle.__maxLifeTimeVariant = (settings.maxLifeTimeVariant == undefined)?0:settings.maxLifeTimeVariant;
		particle.__lifeTime = 0;
		
		particle.__xVelocity = (settings.xVelocity == undefined)?0:settings.xVelocity;
		particle.__xVelocityDecay = (settings.xVelocityDecay == undefined)?0:settings.xVelocityDecay;
		particle.__xVelocityVariant = (settings.xVelocityVariant == undefined)?0:settings.xVelocityVariant;
		
		particle.__yVelocity = (settings.yVelocity == undefined)?0:settings.yVelocity;
		particle.__yVelocityDecay = (settings.yVelocityDecay == undefined)?0:settings.yVelocityDecay;
		particle.__yVelocityVariant = (settings.yVelocityVariant == undefined)?0:settings.yVelocityVariant;
		
		particle.__scale  = (settings.scale == undefined)?1:settings.scale;
		particle.__scaleDecay = (settings.scaleDecay == undefined)?0:settings.scaleDecay;
		particle.__scaleVariant = (settings.scaleVariant == undefined)?0:settings.scaleVariant;
		
		particle.__rotation = (settings.rotation == undefined)?0:settings.rotation;
		particle.__rotationDecay = (settings.rotationDecay == undefined)?0:settings.rotationDecay;
		particle.__rotationVariant = (settings.rotationVariant == undefined)?0:settings.rotationVariant;
		
		particle.__alpha = (settings.alpha == undefined)?1:settings.alpha;
		particle.__alphaDecay = (settings.alphaDecay == undefined)?0:settings.alphaDecay;
		particle.__alphaVariant = (settings.alphaVariant == undefined)?0:settings.alphaVariant;
	}
	
	function rollVariant(base, variant){
		return base + ((Math.random()*(variant*2))-variant);
	}

define("Arstider/Emitter", ["Arstider/DisplayObject", "Arstider/Pool", "Arstider/GlobalTimers", "Arstider/Timer"], function(DisplayObject, Pool, GlobalTimers, Timer){

	
	function Emitter(name){
		Arstider.Super(this, DisplayObject, name);
		
		//TODO
		//this.maxParticles = 100;
		
		this.modulePool = [];
		
		this.spawnRate = 100;
		
		this.canonTimer = null;
		this.canonActivated = false;
	}
	
	Arstider.Inherit(Emitter, DisplayObject);
	
	Emitter.prototype.addParticleType = function(name, module, options){
		this.modulePool.push({name:name, module:module, options:options});
	};
	
	Emitter.prototype.start = function(){
		this.canonActivated = true;
		var thisRef = this;
		if(this.canonTimer == null){
			this.canonTimer = new Timer(function(){thisRef.spawn(thisRef);}, this.spawnRate);
			GlobalTimers.push(this.canonTimer);
		}
		
		this.canonTimer.initialDelay = this.spawnRate;
		this.canonTimer.restart();
	};
	
	Emitter.prototype.stop = function(){
		this.canonActivated = false;
	};
	
	Emitter.prototype.spawn = function(thisRef){
		
		if(!this.canonActivated) return;
		
		//Call next timer
		thisRef.canonTimer.initialDelay = thisRef.spawnRate;
		thisRef.canonTimer.restart();
		
		var type;
		
		if(thisRef.modulePool.length > 1){
			type = thisRef.modulePool[Math.ceil(Math.random()*thisRef.modulePool.length)-1];
		}
		else{
			type = thisRef.modulePool[0];
		}
		
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
			particle.x = 0;
			particle.y = 0;
			
			thisRef.addChild(particle);
		});
	};
	
	Emitter.prototype.update = function(){
		var i = this.children.length, currPart;
		for(i; i>=0; i--){
			if(this.children[i].__isParticle){
				currPart = this.children[i];
				currPart.__lifeTime++;
				if(currPart.__lifeTime >= currPart.__maxLifeTime){
					Pool.free(currPart);
					this.children.splice(i,1);
				}
				else{
					//Move it
					currPart.alpha -= currPart.__alphaDecay;
					currPart.rotation = currPart.__rotation;
					currPart.scaleX = currPart.scaleY = currPart.__scale;
					currPart.x += currPart.__xVelocity;
					currPart.y += currPart.__yVelocity;
					
					//Change speed values
					currPart.__rotation += currPart.__rotationDecay;
					currPart.__scale -= currPart.__scaleDecay;
					currPart.__xVelocity -= currPart.__xVelocityDecay;
					currPart.__yVelocity -= currPart.__yVelocityDecay;
				}
			}
		}
	};

	return Emitter;
});
})();
