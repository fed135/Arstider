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
		
		this._tag = window.document.createElement(props.tag || "input");
		
		if(props.type) this._tag.type = props.type;
		if(props.value) this._tag.value = props.value;
		this._tag.id = props.id || "Arstider_tag_"+this.name;
	}
	
	Arstider.Inherit(Tag, Entity);
	
	/**
	 * Adds an attribute to the tag
	 * @type {function(this:Tag)}
	 * @param {string} name The attribute name
	 * @param {string} value The value to assign
	 */
	Tag.prototype.attr = function(name, value){
		if(value != undefined){
			this._tag[name] = value;
			return this;
		}
		return this._tag[name];
	};
	
	/**
	 * Adds a style rule attribute to the tag
	 * @type {function(this:Tag)}
	 * @param {string} name The attribute name
	 * @param {string} value The value to assign
	 */
	Tag.prototype.style = function(name, value){
		if(value != undefined){
			this._tag.style[name] = value;
			return this;
		}
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

	Tag.prototype.appendChild = function(element){
		if(element.nodeName || element._tag){
			if(element.nodeName){
				this._tag.appendChild(element);
			}
			else if(element._tag && element._tag.nodeName){
				this._tag.appendChild(element._tag);
			}
			else{
				console.error("Problem with element, cannot append to DOM tree! :: ", element);
			}
		}
		else{
			console.error("Cannot append non-DOM element to DOM tree! :: ", element);
		}
	};
	
	/**
	 * Overrides the _update method so that the tag's position matches the entities'
	 * @type {function(this:Tag)}
	 */
	Tag.prototype._update = function(){
        if(this._tag){
        	if(this.global.x == null){
				this._tag.style.display = "none";
				return;
			}
			else{
				this._tag.style.display = "block";
			}

			Entity.prototype._update.call(this);

			this._tag.style.position = "absolute";
			this._tag.style.zIndex = "999";
			
			this._tag.style.left = this.global.x + "px";
			this._tag.style.top = this.global.y + "px";
			this._tag.width = this._tag.style.width = this.global.width + "px";
			this._tag.height = this._tag.style.height = this.global.height + "px";
			this._tag.style.opacity = this.global.alpha;
		}
	};
	
	return Tag;
});