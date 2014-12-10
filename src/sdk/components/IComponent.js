define("Arstider/components/IComponent",
[],
function(){

	function IComponent(){

		this.owner = null;
		this.enabled = true;
	}

	IComponent.prototype.onadded = Arstider._core.emptyFunction;

	IComponent.prototype.onremoved = Arstider._core.emptyFunction;

	IComponent.prototype.onstart = Arstider._core.emptyFunction;

	IComponent.prototype.onupdate = Arstider._core.emptyFunction;

	IComponent.prototype.onstop = Arstider._core.emptyFunction;

	IComponent.prototype.dispose = function(){

		if(this.owner != null){
			this.onstop();
			this.onremoved();
			this.owner.removeComponent(this);
		}
	};

	IComponent.prototype.enable = function(){

		if(this.enabled === false && this.owner != null){
			this.enabled = true;
			this.onstart();
		}
	};

	IComponent.prototype.disable = function(){

		if(this.enabled === true && this.owner != null){
			this.enabled = false;
			this.onstop();
		}
	};

	IComponent.prototype._update = function(dt){

		if(this.enabled === true && this.owner != null){
			this.onupdate(dt);
		}
	};

	return IComponent;
});