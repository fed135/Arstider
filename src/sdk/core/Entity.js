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
		this.cancelBubble = false;

		/**
		 * Number of frames to skip update chain
		 * @private
		 * @type {number}
		 */
		this.cancelUpdate = false;
		
		/**
		 * The element's parent
		 * @type {*}
		 */	
		this.parent = null;

		/**
		 * List of children
		 * @type {Array}
		 */
		this.children = [];
		
		/**
		 * User-defined behavior for asynchronous, constant logic
		 * @override
		 * @type {function(this:Entity)}
		 */
		this.update = props.update || null;

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
		
		if(!this.cancelBubble && this.update) this.update(dt);

		if(this.children && !this.cancelBubble){
			len = this._components.length;
			if(len > 0){
				for(i = 0; i<len; i++){
					c = this[this._components[i]];
					if(c && c.update) c.update(dt);
				}
			}

			len = this.children.length;
			if(len > 0){
				for(i = 0; i<len; i++){
					c = this.children[i];
					if(c && c._update){
						if(this.cancelBubble && c.cancelBubble != undefined) c.cancelBubble = true;
						if(!c.cancelUpdate) c._update(dt);
					}
				}
			}
		}
	};
	
	/**
	 * Adds an Entity-type to the list of children.
	 * @type {function(this:Entity)}
	 * @param {Entity} ref The Entity to be added to the Entity's list of children
	 * @return {Object} Self reference for chaining
	 */
	Entity.prototype.addChild = function(ref){

		if(!ref){
			Arstider.log("Arstider.Entity.addChild: no object given");
			return;
		}

		if(ref.parent != null) Arstider.log("Arstider.Entity.addChild: object already has a parent", 1);
		ref.parent = this;
		this.children[this.children.length]=ref;
		if(ref.cancelBubble) ref.cancelBubble()._update();
		return this;
	};
	
	/**
	 * Removes an Entity from the list of children.
	 * @type {function(this:Entity)}
	 * @param {Entity} ref The reference of the Entity to be removed from the Entity's list of children
	 * @return {Object} Self reference for chaining
	 */
	Entity.prototype.removeChild = function(ref, keepBuffer) {
		
		var 
			index = this.children.indexOf(ref)
		;

		if(index != -1){
			if(this.children[index].removeChildren && this.children[index].children.length > 0) this.children[index].removeChildren(true);
			
			this.children[index].destroyComponents();
			this.children[index].parent = null;
				
			this.children.splice(index,1);
		}
		else{
			Arstider.log("Arstider.Entity.removeChild: could not find child", 1);
		}
		return this;
	};

	/**
	 * Destroys all the components of the entity.
	 * @type {function(this:Entity)}
	 * @return {Object} Self reference for chaining
	 */
	Entity.prototype.destroyComponents = function(){

		var
			i,
			len = this._components.length -1
		;

		for(i = len; i >= 0; i--){
			this[this._components[i]].dispose();
			delete this[this._components[i]];
			this._components.splice(i, 1);
		}
	};
	
	/**
	 * Get an Entity from the list of children by it's index.
	 * @type {function(this:Entity)}
	 * @param {string} index The index position of the desired Entity.
	 * @return {Entity|null} The desired Entity or null if not found.
	 */
	Entity.prototype.getChildAt = function(index) {

		if(this.children[index]) return this.children[index];
		Arstider.log("Arstider.Entity.getChild: could not find child at index "+index, 1);

		return null;
	};
	
	/**
	 * Removes all children from stage and destroys their buffers.
	 * @type {function(this:Entity)}
	 * @return {Object} Self reference for chaining
	 */
	Entity.prototype.removeChildren = function(){

		var
			i,
			len = this.children.length -1
		;

		for(i = len; i >= 0; i--){
			this.removeChild(this.children[i]);
		}
		
		return this;
	};

	/**
	 * Detaches a child from it's parent while keeping buffers and children intact
	 * @type {function(this:Entity)}
	 * @param {string|Object} ref The name or reference of the child to detach
	 * @return {Object} Self reference for chaining
	 */
	Entity.prototype.detachChild = function(ref){
		
		var 
			i = this.children.indexOf(ref)
		;

		if(i != -1){
			this.children[i].parent = null;
			this.children.splice(i,1);
		}

		return this;
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
	
	return Entity; 
});