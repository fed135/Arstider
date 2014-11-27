/**
 * Entity
 *
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */	
define("Arstider/core/Entity", 
[], 
/** @lends Entity */ 
function(){

	Entity._anonymousEntities = 0;

	/**
	 * Entity constructor
	 * Most basic form of stage element, core class
	 * @class Entity
	 * @constructor
	 * @param {Object|null} props Can optionally overwrite build properties of the entity    
	 */
	function Entity(props){
		
		/**
		 * If props is undefined, use the Engine's empty object constant
		 */
		props = props || Arstider.emptyObject;

		/**
		 * Entity unique ID
		 * @type {number}
		 */
		this.id = Entity._anonymousEntities++;
		
		/**
		 * Flag to skip update propagation
		 * @private
		 * @type {boolean}
		 */
		this._cancelBubble = false;

		/**
		 * Number of frames to skip update chain
		 * @private
		 * @type {number}
		 */
		this._cancelUpdate = false;
		
		/**
		 * The element's parent
		 * @type {*}
		 */	
		this.parent = null;

		/**
		 * List of components
		 * @type {Array}
		 */
		this._components = [];
	};
	
	/**
	 * Private logic with each frame updates (see core/Performance for draw vs update skips)
	 * @protected
	 * @type {function(this:Entity)}
	 * @param {number} dt Delta time (the time spent since last frame)
	 */
	Entity.prototype._update = function(dt){
		
		var 
			i, 
			c, 
			len
		;
		
		if(!this._cancelBubble && this.update) this.update(dt);

		if(this.children && !this._cancelBubble){
			len = this._components.length;
			if(len > 0){
				for(i = 0; i<len; i++){
					c = this[this._components[i]];
					if(c && c.update) c.update(dt);
				}
			}
		}
	};
	
	/**
	 * Destroys all the components of the entity.
	 * @type {function(this:Entity)}
	 * @return {Object} Self reference for chaining
	 */
	Entity.prototype.destroyComponents = function(){

		var
			i,
			len = this._components.length -1,
			ns
		;

		for(i = len; i >= 0; i--){
			ns = this._components[i];
			if(this[ns].dispose) this[ns].dispose();
			delete this[ns];
		}

		this._components.length = 0;
	};

	Entity.prototype.addComponents = function(components){

		var
			i = 0,
			len = components.length,
			ns,
			a
		;

		for(i; i<len;i++){
			if(!components[i].namespace){
				Arstider.log("ERROR: component has no namespace attribute:");
				Arstider.log(components[i]);
				return;
			}

			ns = components[i].namespace;

			if(ns in this){
				Arstider.log("Arstider.Entity.addComponent: overriding component " + ns);
				a = this._components.indexOf(ns);
				if(a != -1){
					this._components.splice(a, 1);
				}
			}

			this[ns] = new components[i]();
			this[ns].owner = this;
			this._components.push(ns);
		}
	};

	Entity.prototype.removeComponent = function(component){

		var
			ns = component.namespace || component || null,
			i = this._components.indexOf(ns)
		;

		if(ns in this){
			if(this[ns].dispose) this[ns].dispose();
			delete this[ns];
		}

		if(i != -1){
			this._components.splice(i, 1);
		}
	};
		
	/**
	 * Sets the index of the Entity inside it's parent's array - must be parented
	 * @type {function(this:Entity)}
	 * @param {number} index
	 * @returns {Entity} Returns the element for chaining
	 */
	Entity.prototype.setIndex = function(index) {

		if(this.parent){
			var myIndex = this.parent.children.indexOf(this);
			if(myIndex > -1 && this.parent.children.length > 1){
				
				//If higher than array size, put at end
				if(index > this.parent.children.length-1){
					index = this.parent.children.length-1;
				}
				
				this.parent.children.splice(index,0,this.parent.children.splice(myIndex,1)[0]);
			}
			else{
				Arstider.log("Arstider.Entity.setIndex: no re-order occured", 1);
			}
		}
		else{
			Arstider.log("Arstider.Entity.setIndex: element has no parent", 1);
		}
		
		return this;
	};
		
	/**
	 * Gets the index of the Entity inside it's parent's array - must be parented
	 * @type {function(this:Entity)}
	 * @returns {number} Returns the element index
	 */
	Entity.prototype.getIndex = function(index){

		if(this.parent){
			return this.parent.children.indexOf(this);
		}
		else{
			Arstider.log("Arstider.Entity.getIndex: element has no parent", 1);
		}
		
		return -1;
	};

	Entity.prototype.addListener = function(event, method){

		if(this[event] != undefined){
			if(!this[event].add) this[event] = new Signal();
			if(method) this[event].add(method); 
		}
		else Arstider.log("Arstider.Clickable.addListener: "+event+ " is not a valid event name.", 1);

		return this;
	};

	Entity.prototype.removeListener = function(event, method){

		if(this[event] && this[event].remove){
			if(method) this[event].remove(method);
			else this[event] = null;
		}

		return this;
	};
	
	return Entity; 
});