define("Arstider/commons/Input", ["Arstider/Tag"], function(Tag){
	
	function Input(props){
		
		this.enabled = Arstider.checkIn(props.enabled, true);

		props.tag = (props.label)?"label":"input";

		Arstider.Super(this, Tag, props);

		var txtField;
		if(props.label){
			this._tag.innerHTML = props.label;
			txtField = document.createElement("input");
			txtField.id = this.name + "_input";
			this._tag.appendChild(txtField); 
		}
		else{
			txtField = this._tag;
		}

		txtField.type = (props.password)?"password":"text";

		if(props.className) txtField.className = props.className;
		if(props.placeholder) txtField.placeholder = props.placeholder;
		if(!this.enabled) this.disable();
	}

	Arstider.Inherit(Input, Tag);

	Input.prototype.enable = function(){
		if(!this.enabled){
			this.enabled = true;
			var txtField = this.getField();
			txtField.classList.remove("disabled");
			delete txtField.readonly;
		}
	};

	Input.prototype.disable = function(){
		if(this.enabled){
			this.enabled = false;
			var txtField = this.getField();
			txtField.classList.add("disabled");
			txtField.readonly = "readonly";
		}
	};

	Input.prototype.attr = function(prop, value){
		this.getField()[prop] = value;
	};

	Input.prototype.style = function(prop, value){
		this.getField()["style"][prop] = value;
	};

	Input.prototype.value = function(){
		return this.getField().value;
	}

	Input.prototype.getField = function(){
		return (this._tag.tagName == "input")?this._tag:this._tag.children[0];
	};

	return Input;
});