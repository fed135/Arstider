define("Arstider/commons/Radio",[
	"Arstider/DisplayObject",
	"Arstider/TextField"
	], /** @lends commons/Radio */ 
	function(DisplayObject, TextField){
	
	var listBtn = {};
	var id = 0;

	function Radio(props){	

		Arstider.Super(this, DisplayObject, props);

		var thisRef = this;
		this.disabled = Arstider.checkIn(props.disabled, false);
		this.isCheckBox = Arstider.checkIn(props.checkBox, false);
		///Add radio Button
		var btnRadio = new DisplayObject({
			name:"btnRadio"+this.name,
			onclick:function(){
						if(this.disabled || btnRadio.disabled) return;
						thisRef.changeState(btnRadio);
		        }
		});

		// Add properties
		btnRadio.id = id;
		btnRadio.disabled = this.disabled;
		   // buttons must have the same name to be in the same group
		btnRadio.name = Arstider.checkIn(props.name, "btnRadio"+id);
		btnRadio.image = Arstider.checkIn(props.image, Arstider.checkIn(props.btnRadio, Arstider.checkIn(props.data,null)));
		btnRadio.imageCheck = Arstider.checkIn(props.imageCheck, Arstider.checkIn(props.btnRadioCheck, Arstider.checkIn(props.dataCheck,null)));
		btnRadio.imageDisabled = Arstider.checkIn(props.imageDisabled, Arstider.checkIn(props.btnRadioDisabled, Arstider.checkIn(props.dataDisabled,null)));
		btnRadio.imageDisabledCheck = Arstider.checkIn(props.imageDisabledCheck, Arstider.checkIn(props.btnRadioDisabledCheck, Arstider.checkIn(props.dataDisabledCheck,null)));

		if (props.defaultChecked) btnRadio.defaultChecked = btnRadio.checked = props.defaultChecked;

		this.btnRadio = this.updateState(btnRadio);
		this.addChild(this.btnRadio);

		//Add Label
		if (props.label){

			var label = new TextField({
				strokeText: props.strokeText || false
			});
			this.btnRadio.addChild(label);	

			label.name = Arstider.checkIn(props.label.name, "labelBtnRadio"+id);
			label.width = Arstider.checkIn(props.label.width,50);
			//label.height = Arstider.checkIn(props.label.height,50);
			label.x = Arstider.checkIn(props.label.x,0 - label.width - 4);
			label.y = Arstider.checkIn(props.label.y, btnRadio.height/2);
			label.font = Arstider.checkIn(props.label.font, Arstider.checkIn(props.font),null);
			label.fontDisabled = Arstider.checkIn(props.label.fontDisabled, Arstider.checkIn(props.fontDisabled),null);

			if(props.label.text) label.setText(props.label.text);
			else if(typeof props.label === "string") label.setText(props.label);
			
			if(!btnRadio.disabled) label.setFont(label.font);
			else{
				if(!label.fontDisabled) label.fontDisabled = label.font;
				label.setFont(label.fontDisabled);
			}
			this.btnRadio.label = label;
		}

		//Add Icon
		if (props.icon){

			var icon = new DisplayObject({
				onload : function(){
						icon.x =  Arstider.checkIn(props.icon.x,0 - icon.width - 6);
						icon.y = Arstider.checkIn(props.icon.y,0 - icon.height/2 + btnRadio.height/2);
					}
			});
			this.btnRadio.addChild(icon);	
			
			icon.name = Arstider.checkIn(props.icon.name, "iconBtnRadio"+id);
			icon.image = typeof props.icon === "string"? props.icon : Arstider.checkIn(props.icon.image, Arstider.checkIn(props.icon.data,null));
			icon.imageDisabled = typeof props.iconDisabled === "string"? props.iconDisabled : Arstider.checkIn(props.icon.imageDisabled, Arstider.checkIn(props.icon.dataDisabled,null));

			if(!btnRadio.disabled && icon.image)
				icon.loadBitmap(icon.image);		
			else {
				if(!icon.imageDisabled) icon.imageDisabled = icon.image;
				icon.loadBitmap(icon.imageDisabled);		
			}
			this.btnRadio.icon = icon;
		}

		///Add Radio Button to the List of Btn 
		if (!listBtn[btnRadio.name]) listBtn[btnRadio.name] = {};
		listBtn[btnRadio.name][btnRadio.id] = btnRadio;

		id++;
	}
	
	Arstider.Inherit(Radio, DisplayObject);


	Radio.prototype.getDisabled = function(){
		return this.btnRadio.disabled ;		
	};

	Radio.prototype.setDisabled = function(value){
		this.btnRadio.disabled = value ;	
		this.updateState(this.btnRadio);
	};

	Radio.prototype.getChecked = function(){
		return this.btnRadio.checked	
	};

	Radio.prototype.setChecked = function(value){
		if(value){
			if(!this.btnRadio.disabled){
				this.btnRadio.checked = true ;	
				this.changeState(this.btnRadio);
			}
			else{
				this.btnRadio.checked = true ;	
				this.updateState(this.btnRadio);
			}
		}
		else{
			btnRadio.checked = false;
			this.updateState(this.btnRadio);
		}
	};

	Radio.prototype.changeState= function(btnRadio){
		
		if(!btnRadio.checked){
			if(!btnRadio.disabled){
				for (id in listBtn[btnRadio.name]){

					if(id != btnRadio.id && !listBtn[btnRadio.name][id].disabled){
						listBtn[btnRadio.name][id].checked = false;
						listBtn[btnRadio.name][id].loadBitmap(listBtn[btnRadio.name][id].image);
					}				
				}
				btnRadio.loadBitmap(btnRadio.imageCheck);
				btnRadio.checked = true;	
			}
		}
		else if(btnRadio.checked && this.isCheckBox)
		{
			if(!btnRadio.disabled){
				btnRadio.loadBitmap(btnRadio.image);
				btnRadio.checked = false;
			}
		}	
	};

	Radio.prototype.updateState= function(btnRadio){
		
		if(!btnRadio.disabled){ 

			if(btnRadio.image != null && btnRadio.imageCheck != null){
				if (btnRadio.checked)
					btnRadio.loadBitmap(btnRadio.imageCheck);
				else 
					btnRadio.loadBitmap(btnRadio.image);
			}
			if(btnRadio.icon)
				btnRadio.icon.loadBitmap(btnRadio.icon.image);
			if(btnRadio.label)
				btnRadio.label.setFont(btnRadio.label.font);
		}
		else{

			if (btnRadio.checked && btnRadio.imageDisabledCheck != null)
				btnRadio.loadBitmap(btnRadio.imageDisabledCheck);
			else if(btnRadio.imageDisabled != null )
				btnRadio.loadBitmap(btnRadio.imageDisabled);
			
			if(btnRadio.icon)
				btnRadio.icon.loadBitmap(btnRadio.icon.imageDisabled);
			if(btnRadio.label)
				btnRadio.label.setFont(btnRadio.label.fontDisabled);
		}
		return btnRadio;
	};

	return Radio;
});


			
