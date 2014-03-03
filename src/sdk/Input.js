define("Arstider/Input", ["Arstider/Tag"], function(Tag){
	
	Input.Inherit(Tag);
	function Input(name){
		Super(this, name);
		
		this._tag = document.createElement("input");
		this._tag.type = "text";
		this._tag.value = "";
		this._tag.id = "Arstider_tag_"+name;
		
		this.parentNode = null;
	}
	
	Input.prototype.placeAt = function(eng, x, y){
		if(this.parentNode == null){
			//Find canvas parentNode
			this.parentNode = eng.canvas.parentNode;
			this.parentNode.appendChild(this._tag);
		}
		
		this.setPosition(x, y);
	};
	
	Input.prototype.attr = function(name, value){
		if(value != undefined){
			this._tag[name] = value;
		}
		return this._tag[name];
	};
	
	Input.prototype.style = function(name, value){
		if(value != undefined){
			this._tag.style[name] = value;
		}
		return this._tag.style[name];
	};
	
	Input.prototype.kill = function(){
		if(this.parentNode == null){
			this.parentNode.removeChild(this._tag);
		}
		this._tag = null;
	};
	
	return Input;
});
