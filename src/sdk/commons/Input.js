define("Arstider/commons/Input", ["Arstider/Tag"], function(Tag){
	
	function Input(props){
		props.type = props.password || "text";
		this.enabled = Arstider.checkIn(props.enabled, true);
		
		Arstider.Super(this, Tag, props);
	}

	Arstider.Inherit(Input, Tag);

	Input.prototype._onhover = function(){
		if(this.enabled){
			Tag.prototype._onhover.call(this);
		}
	};

	Input.prototype._onleave = function(){
		Tag.prototype._onleave.call(this);
	};
	
	Input.prototype._onpress = function(){
		if(this.enabled){
			Tag.prototype._onpress.call(this);
		}
	};

	Input.prototype._onrelease = function(){
		if(this.enabled){
			Tag.prototype._onrelease.call(this);
		}
	};

	return Input;
});