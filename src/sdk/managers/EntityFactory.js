define("Arstider/managers/EntityFactory", 
[
	"Arstider/managers/EntityPool"
],
function(EntityPool, Entity){
	
	function EntityFactory(){

		this.registeredTemplates = {};
	}

	EntityFactory.prototype.register = function(type, components, preallocate, instanceCap){

		this.registeredTemplates[type] = components;
		EntityPool.preallocate(type, components, preallocate, instanceCap);
	};


	EntityFactory.prototype.create = function(type, callback){

		EntityPool.get(type, this.registeredTemplates[type], callback);
	};

	return new EntityFactory();
});