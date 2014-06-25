define("Arstider/commons/Button",[
	"Arstider/DisplayObject",
	"Arstider/TextField",
	"Arstider/Mouse",
	"Arstider/Browser"
], /** @lends commons/Button */
function(DisplayObject, TextField, Mouse, Browser){
	function Button(props){

		Arstider.Super(this, DisplayObject, props);
		
		props = props || {states:{}};

		this.enabled = Arstider.checkIn(props.enabled, true);
		this.currentState = null;
		this.states = {};

		for(var s in props.states) this.addState(s, props.states[s]);

		if(this.enabled) this.showState("normal");
		else this.showState("disabled");
	}
	Arstider.Inherit(Button, DisplayObject);

	Button.prototype._onhover = function(){
		if(this.enabled && !Browser.isMobile){
			Mouse.setCursor("pointer");
			this.showState("hover");
			DisplayObject.prototype._onhover.call(this);
		}
	};

	Button.prototype._onleave = function(){
		Mouse.setCursor("default");
		if(this.enabled) this.showState("normal");
		else this.showState("disabled");
		DisplayObject.prototype._onleave.call(this);
	};
	
	Button.prototype._onpress = function(){
		if(this.enabled){
			this.showState("pressed");
			DisplayObject.prototype._onpress.call(this);
		}
	};

	Button.prototype._onrelease = function(){
		if(this.enabled){
			Mouse.setCursor("default");
			this.showState("normal");
			DisplayObject.prototype._onrelease.call(this);
		}
	};

	Button.prototype.addState = function(name, props){
		var thisRef = this;

		var state = new DisplayObject({
			name:name+"State",
			alpha:0
		});

		var bg = Arstider.checkIn(props.image, Arstider.checkIn(props.data, Arstider.checkIn(props.bitmap, null)));

		if(bg != null){
			if(typeof bg === "string"){
				state.loadBitmap(bg, function(e){
					if(thisRef.height == 0) thisRef.height = e.height;
					if(thisRef.width == 0) thisRef.width = e.width;
				});
			}
			else if(bg.data != null){
				state.data = bg.data;
				state.width = bg.width;
				state.height = bg.height;
				state.dataHeight = bg.dataHeight;
				state.dataWidth = bg.dataWidth;
				state.xOffset = bg.xOffset;
				state.yOffset = bg.yOffset;
				if(this.height == 0) this.height = bg.height;
				if(this.width == 0) this.width = bg.width;
			}
		}

		var label = Arstider.checkIn(props.label, Arstider.checkIn(props.text, null));
		
		if(label != null){
			state.label = new TextField({
				text:label
			});

			if(props.font){
				state.label.setFont(props.font);
			}

			state.label.dock(0.5, 0.5);
			state.addChild(state.label);
		}

		if(props.icon != null){
			if(typeof props.icon === "string"){
				state.icon = new DisplayObject({
					data:props.icon
				});
			}
			else if(bg.data != null){
				state.icon = props.icon;
			}
			else{
				state.icon = new DisplayObject();
			}
			state.addChild(state.icon);
		}

		this.addChild(state);
		this.states[name] = state;
	};

	Button.prototype.showState = function(name){
		if(this.currentState == name) return;

		if(!(name in this.states)){
			if(Arstider.verbose > 1) console.warn("Arstider.commons.Button.showState: unexisting state ", name);
			return;
		}
			
		for(s in this.states){
			if(s == name) this.states[s].alpha = 1;
			else this.states[s].alpha = 0;
		}

		this.currentState = name;
	};

	Button.prototype.enable = function(){
		this.enabled = true;
		this.showState("normal");
	};

	Button.prototype.disable = function(){
		this.enabled = false;
		this.showState("disabled");
	};
	
	return Button;
});