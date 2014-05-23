/**
 * Tag. 
 *
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the Tag module
 */
define("Arstider/Tag", ["Arstider/Entity", "Arstider/Viewport"], /** @lends Tag */ function(Entity, Viewport){
	
	/**
	 * Tag constructor
	 * Creates a new tag and adds it over the canvas
	 * @class Tag
	 * @constructor
	 * @param {Object|null} props Optional properties
	 */
	function Tag(props){
		Arstider.Super(this, Entity, props);
		
		this._tag = document.createElement(props.tag || "input");
		
		var parentNode = document.getElementById("Arstider_tag_overlay");
		if(!parentNode){
			parentNode = document.createElement("div");
			parentNode.id = "Arstider_tag_overlay";
			Viewport.tag.parentNode.appendChild(parentNode);
                        Viewport._resize();
		}
		
		if(props.type) this._tag.type = props.type;
		if(props.value) this._tag.value = props.value;
		this._tag.id = props.id || "Arstider_tag_"+name;
		parentNode.appendChild(this._tag);
		this.parentNode = parentNode;
	}
	
	Arstider.Inherit(Tag, Entity);
	
	/**
	 * Adds an attribute to the tag
	 * @type {function(this:Tag)}
	 * @param {string} name The attribute name
	 * @param {string} value The value to assign
	 */
	Tag.prototype.attr = function(name, value){
		if(value != undefined) this._tag[name] = value;
		return this._tag[name];
	};
	
	/**
	 * Adds a style rule attribute to the tag
	 * @type {function(this:Tag)}
	 * @param {string} name The attribute name
	 * @param {string} value The value to assign
	 */
	Tag.prototype.style = function(name, value){
		if(value != undefined) this._tag.style[name] = value;
		return this._tag.style[name];
	};
	
	/**
	 * Behavior when about to destroy the element
	 * @type {function(this:Tag)}
	 */
	Tag.prototype.killBuffer = function(){
		if(this.parentNode != null) this.parentNode.removeChild(this._tag);
		this._tag = null;
	};
	
	/**
	 * Binds an event to the tag
	 * @type {function(this:Tag)}
	 * @param {string} event The event name
	 * @param {function} value The callback method
	 */
	Tag.prototype.bind = function(event, method){
		if(this._tag) this._tag.addEventListener(event, method);
		else{
			if(Arstider.verbose > 0) console.warn("Arstider.Tag.bind: no DOM element");
		}
	};
	
	/**
	 * Unbinds an event from the tag
	 * @type {function(this:Tag)}
	 * @param {string} event The event name
	 * @param {function} value The callback method
	 */
	Tag.prototype.unbind = function(event, method){
		if(this._tag) this._tag.removeEventListener(event, method);
		else{
			if(Arstider.verbose > 0) console.warn("Arstider.Tag.unbind: no DOM element");
		}
	};
	
	/**
	 * Overrides the _update method so that the tag's position matches the entities'
	 * @type {function(this:Tag)}
	 */
	Tag.prototype._update = function(){
            
                /**
		 * Check for docking options
		 */
		if(this.parent != null){
			if(this._fillX != null){
				this.width = this.parent.width * this._fillX;
			}
			if(this._fillY != null){
				this.height = this.parent.height * this._fillY;
			}
			if(this._dockX != null){
				this.x = (this.parent.width * this._dockX) - (this.width * this._dockX);
			}
			if(this._dockY != null){
				this.y = (this.parent.height * this._dockY) - (this.height * this._dockY);
			}
		}
            	if(this._tag){
			this._tag.style.position = "absolute";
			this._tag.style.zIndex = "999";
			
			this._tag.style.left = this.global.x + "px";
			this._tag.style.top = this.global.y + "px";
			this._tag.width = this._tag.style.width = this.global.width + "px";
			this._tag.height = this._tag.style.height = this.global.height + "px";
			this._tag.style.opacity = this.global.alpha;
		}
		else{
			if(Arstider.verbose > 1) console.warn("Arstider.Tag.update: no DOM element");
		}
	};
	
	return Tag;
});