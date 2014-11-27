define("Arstider/core/DisplayObjectContainer", 
[
	"Arstider/core/Entity"
], 
function(Entity){
	
	function DisplayObjectContainer(props){
		Arstider.Super(this, Entity, props);

		/**
		 * List of children
		 * @type {Array}
		 */
		this.children = [];

	}
	Arstider.Inherit(DisplayObjectContainer, Entity);

	/**
	 * Private logic with each frame updates (see core/Performance for draw vs update skips)
	 * @protected
	 * @type {function(this:Entity)}
	 * @param {number} dt Delta time (the time spent since last frame)
	 */
	DisplayObjectContainer.prototype._update = function(dt){
		
		var 
			i, 
			c, 
			len
		;
		
		if(!this._cancelBubble && this.update) this.update(dt);

		if(this.children && !this._cancelBubble){

			len = this.children.length;
			if(len > 0){
				for(i = 0; i<len; i++){
					c = this.children[i];
					if(c && c._update){
						if(this._cancelBubble && c._cancelBubble != undefined) c._cancelBubble = true;
						if(!c._cancelUpdate) c._update(dt);
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
	DisplayObjectContainer.prototype.addChild = function(ref){

		if(!ref){
			Arstider.log("Arstider.DisplayObjectContainer.addChild: no object given");
			return;
		}

		if(ref.parent != null) Arstider.log("Arstider.DisplayObjectContainer.addChild: object already has a parent", 1);
		ref.parent = this;
		this.children[this.children.length]=ref;
		if(ref._cancelBubble) ref._cancelBubble()._update();
		return this;
	};
	
	/**
	 * Removes an Entity from the list of children.
	 * @type {function(this:Entity)}
	 * @param {Entity} ref The reference of the Entity to be removed from the Entity's list of children
	 * @return {Object} Self reference for chaining
	 */
	DisplayObjectContainer.prototype.removeChild = function(ref, keepBuffer) {
		
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
			Arstider.log("Arstider.DisplayObjectContainer.removeChild: could not find child", 1);
		}
		return this;
	};
	
	/**
	 * Removes all children from stage and destroys their buffers.
	 * @type {function(this:Entity)}
	 * @return {Object} Self reference for chaining
	 */
	DisplayObjectContainer.prototype.removeChildren = function(){

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
	DisplayObjectContainer.prototype.detachChild = function(ref){
		
		var 
			i = this.children.indexOf(ref)
		;

		if(i != -1){
			this.children[i].parent = null;
			this.children.splice(i,1);
		}

		return this;
	};

	return DisplayObjectContainer;
});