/**
 * Entity
 *
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */	
define("Arstider/core/Entity", 
[
	"Arstider/components/IComponent"
], 
/** @lends core/Entity */ 
function(IComponent){

	Entity._anonymousEntities = 0;

	/**
	 * Entity constructor
	 * Most basic form of stage element, core class
	 * @class core/Entity
	 * @constructor
	 * @param {Object|null} props Can optionally overwrite build properties of the entity    
	 */
	function Entity(props){
		
		/**
		 * If props is undefined, use the Engine's empty object constant
		 */
		props = props || Arstider._core.emptyObject;

		/**
		 * Entity unique ID
		 * @type {number}
		 */
		this.id = Entity._anonymousEntities++;
		
		/**
		 * The element's parent
		 * @type {*}
		 */	
		this.parent = null;

		/**
		 * List of components
		 * @type {Array}
		 */
		this._components = {};
	};
	
	/**
	 * Private logic with each frame updates (see core/Performance for draw vs update skips)
	 * @protected
	 * @type {function(this:Entity)}
	 * @param {number} dt Delta time (the time spent since last frame)
	 */
	Entity.prototype._updateComponents = function(dt){
		
		var 
			i
		;

		for(i in this._components){
			if(this._components[i] instanceof IComponent){
				this[this._components[i]]._update(dt);
			}
		}
	};

	Entity.prototype.getComponent = function(ref){

		if(ref in this._components){
			if(this._components[ref] instanceof IComponent){
				return this._components[ref];
			}
		}

		return null;
	};
	
	/**
	 * Destroys all the components of the entity.
	 * @type {function(this:Entity)}
	 * @return {Object} Self reference for chaining
	 */
	Entity.prototype.destroyComponents = function(){

		var 
			i
		;

		for(i in this._components){
			this.removeComponent(i);
		}
	};

	Entity.prototype.addComponents = function(components){

		var
			i = 0,
			len = components.length,
			ns
		;

		for(i; i<len;i++){
			if(!components[i].namespace){
				Arstider.debug.log("ERROR: component has no namespace attribute:");
				Arstider.debug.log(components[i]);
				return;
			}

			ns = components[i].namespace;

			if(ns in this._components){
				Arstider.debug.log("Arstider.Entity.addComponent: overriding component " + ns);
			}

			this._components[ns] = new components[i]();
			this._components[ns].owner = this;
			this._components[ns].onadded();
			this._components[ns].onstart();
		}
	};

	Entity.prototype.removeComponent = function(ref){

		if(ref in this._components){
			if(this._components[ref] instanceof IComponent){
				this[this._components[ref]].dispose();
			}
			else{
				Arstider.debug.log("Arstider.Entity.removeComponent: object ", this._components[ref]," is not a component!");
			}
			delete this._components[ref];
		}
	};
	
	return Entity; 
});