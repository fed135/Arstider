define("Arstider/components/Container", 
[
	"Arstider/components/IComponent"
], 
function(IComponent){
	
	Container.namespace = "container";

	function Container(){

		Arstider.utils.Super(this, IComponent);

		/**
		 * List of children
		 * @type {Array}
		 */
		this.children = [];
	}
	Arstider.utils.Inherit(Container, IComponent);

	/**
	 * Frame updates
	 * @protected
	 * @type {function(this:Entity)}
	 * @param {number} dt Delta time (the time spent since last frame)
	 */
	Container.prototype.onupdate = function(dt){
		
		var 
			i, 
			c, 
			len
		;

		if(this.children.length > 0){

			len = this.children.length;
			if(len > 0){
				for(i = 0; i<len; i++){
					c = this.children[i];
					if(c && c._updateComponents) c._updateComponents(dt);
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
	Container.prototype.addChild = function(ref){

		if(!ref){
			Arstider.debug.log("Arstider.Container.addChild: no object given");
			return;
		}

		if(ref.parent != null) Arstider.debug.log("Arstider.Container.addChild: object already has a parent", 1);
		ref.parent = this;
		this.children[this.children.length]=ref;
		ref._update();

		return this;
	};
	
	/**
	 * Removes an Entity from the list of children.
	 * @type {function(this:Entity)}
	 * @param {Entity} ref The reference of the Entity to be removed from the Entity's list of children
	 * @return {Object} Self reference for chaining
	 */
	Container.prototype.removeChild = function(ref) {
		
		var 
			i = this.children.indexOf(ref)
		;

		if(i != -1){
			this.children[i].destroyComponents();
			this.children[i].parent = null;
				
			this.children.splice(i,1);
		}
		else{
			Arstider.debug.log("Arstider.Container.removeChild: could not find child", 1);
		}

		return this;
	};
	
	/**
	 * Removes all children from stage and destroys their buffers.
	 * @type {function(this:Entity)}
	 * @return {Object} Self reference for chaining
	 */
	Container.prototype.removeChildren = function(){

		var
			i,
			len = this.children.length -1
		;

		for(i = len; i >= 0; i--){
			this.removeChild(this.children[i]);
		}
		
		return this;
	};

	Container.prototype.onremoved = function(){

		this.removeChildren();
	};

	/**
	 * Detaches a child from it's parent while keeping buffers and children intact
	 * @type {function(this:Entity)}
	 * @param {string|Object} ref The name or reference of the child to detach
	 * @return {Object} Self reference for chaining
	 */
	Container.prototype.detachChild = function(ref){
		
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
	Container.prototype.setIndex = function(ref, index) {

		var
			i,
			len = this.children.length
		;

		i = this.getIndexOf(ref);

		if(i != -1){
			//If higher than array size, put at end
			if(index > len-1){
				index = len-1;
			}
			
			this.children.splice(index,0,this.children.splice(i,1)[0]);
		}
		else{
			Arstider.debug.log("Arstider.Container.setIndex: element ", ref, " is not child of this container");
		}
		
		return this;
	};
		
	/**
	 * Gets the index of the Entity inside it's parent's array - must be parented
	 * @type {function(this:Entity)}
	 * @returns {number} Returns the element index
	 */
	Container.prototype.getIndexOf = function(ref){

		return this.children.indexOf(ref);
	};

	return Container;
});