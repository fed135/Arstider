define("Arstider/commons/ComboBox",[
	"Arstider/DisplayObject",
	"Arstider/TextField",
	"Arstider/commons/Input",
	"Arstider/Keyboard",
	"Arstider/Mouse",
	"Arstider/Events",
	"Arstider/commons/Scrollbar"
	], /** @lends commons/ComboBox */ 
	function(DisplayObject, TextField, Input, Keyboard, Mouse, Events, Scrollbar){

	function ComboBox(props){	

		Arstider.Super(this, DisplayObject, props);

		var thisRef = this;
		this.addScrollbar = false; 
		this.scrollValue = 0;

		///Add comboBox container
		var comboBox = new DisplayObject({
			name: this.name + "_comboBox"
		});

		// Add properties
		comboBox.imageBar = Arstider.checkIn(props.bar, Arstider.checkIn(props.imageBar, null));
		comboBox.imageButton = Arstider.checkIn(props.button, Arstider.checkIn(props.imageButton, null));
		comboBox.imageList = Arstider.checkIn(props.list, Arstider.checkIn(props.imageList, null)); 
		comboBox.imageSlider =Arstider.checkIn(props.slider, Arstider.checkIn(props.imageSlider, null)); 
		comboBox.imageHandle = Arstider.checkIn(props.handle, Arstider.checkIn(props.imageHandle, null));
		comboBox.dataList = Arstider.checkIn(props.data, Arstider.checkIn(props.dataList,["item1","item2","item3","item4"]));
		comboBox.font = Arstider.checkIn(props.font, Arstider.checkIn(props.fontList, null));
		comboBox.heightItem = Arstider.checkIn(props.heightItem, Arstider.checkIn(props.heightText,Arstider.checkIn(props.heightOption, 40)));
		comboBox.widthItem = Arstider.checkIn(props.widthItem, Arstider.checkIn(props.widthText,Arstider.checkIn(props.widthOption, 140)));

			// Optional properties
		comboBox.imageBarDisabled = Arstider.checkIn(props.barDisabled, Arstider.checkIn(props.imageBarDisabled, comboBox.imageBar)); 
		comboBox.imageButtonPress = Arstider.checkIn(props.buttonPress, Arstider.checkIn(props.imageButtonPress, comboBox.imageButton)); 
		comboBox.imageButtonDisabled = Arstider.checkIn(props.buttonDisabled, Arstider.checkIn(props.imageButtonDisabled, comboBox.imageButton));
		comboBox.imageListFocus = Arstider.checkIn(props.listFocus, Arstider.checkIn(props.imageListFocus, null)); 
		comboBox.placeHolder = Arstider.checkIn(props.placeHolder, Arstider.checkIn(props.placeholder, " ")); 
		comboBox.label = Arstider.checkIn(props.label," "); 
		comboBox.disabled = Arstider.checkIn(props.disabled, false),
		comboBox.inputX =  Arstider.checkIn(props.inputX, Arstider.checkIn(props.inputTextX, null)); 
		comboBox.inputY =  Arstider.checkIn(props.inputY, Arstider.checkIn(props.inputTextY, null)); 
		comboBox.inputSize =  Arstider.checkIn(props.inputSize, Arstider.checkIn(props.inputTextSize, 20)); 
		comboBox.buttonX =  Arstider.checkIn(props.buttonX, null); 
		comboBox.buttonY =  Arstider.checkIn(props.buttonY, null); 
		comboBox.scrollbarX =  Arstider.checkIn(props.scrollbarX, null); 
		comboBox.scrollbarY =  Arstider.checkIn(props.scrollbarY, null); 
		
		// Add bar 
		comboBox.bar = new DisplayObject({
			name: this.name + "_bar",
			data: comboBox.disabled? comboBox.imageBarDisabled : comboBox.imageBar,
			onload: function(){
				comboBox.bar.textInput.y = comboBox.inputY? comboBox.inputY : comboBox.bar.height/2 - 10;
				comboBox.bar.textInput.x = comboBox.inputX? comboBox.inputX : 8;
			} 	
		});

		// Text Input
		comboBox.bar.textInput = new Input({
			name: this.name + "_input",
			placeholder: comboBox.placeHolder,
			label: comboBox.label,
			enabled: !comboBox.disabled,
			size: comboBox.inputSize
		});

		// Add Button 
		comboBox.bar.button = new DisplayObject({
			name: this.name + "_button",
			data: comboBox.disabled? comboBox.imageButtonDisabled : comboBox.imageButton,
			onclick: function(){
				if(comboBox.disabled) return;
				if (comboBox.list.alpha == 0){
					if(thisRef.addScrollbar) thisRef.getAttr("scrollbar").setValue(0);
					thisRef.showList();
				} 
				else comboBox.list.alpha = 0;
			}, 	
			onpress: function(){
				if(comboBox.disabled) return;
				comboBox.bar.button.loadBitmap(comboBox.imageButtonPress);
			},
			onhover: function(){
				if(comboBox.disabled) return;
				comboBox.bar.button.loadBitmap(comboBox.imageButtonPress);
			},
			onleave: function(){
				if(comboBox.disabled) return;
				comboBox.bar.button.loadBitmap(comboBox.imageButton);
			},
			onrelease: function(){
				if(comboBox.disabled) return;
				comboBox.bar.button.loadBitmap(comboBox.imageButton);
			}
		});

		// Add list Popup
		comboBox.list = new DisplayObject({
			name: this.name + "_list",
			data: comboBox.imageList,
			alpha:0,
			onload: function(){
				setTimeout(function fixPosition(){
					comboBox.list.y = comboBox.bar.height;
					comboBox.bar.button.x = comboBox.buttonX? comboBox.buttonX : comboBox.bar.width - comboBox.bar.button.width;
					comboBox.bar.button.y = comboBox.buttonY? comboBox.buttonY :0; 
					thisRef.listHeight = comboBox.list.height ;
					thisRef.listWidth = comboBox.list.width ;
					thisRef.addScrollBar();
				},1); 	
			},
			onhover: function(){
				if(thisRef.addScrollbar)
					thisRef.getAttr("scrollbar").setFocus(true);
			}
		});

		comboBox.addChild(comboBox.bar);
		comboBox.addChild(comboBox.bar.textInput);
		comboBox.addChild(comboBox.bar.button);
		comboBox.addChild(comboBox.list);

		this.addChild(comboBox);

		// Add Items to List
		this.showNewItem(comboBox.dataList);
		this.startSearch();
	}
	
	Arstider.Inherit(ComboBox, DisplayObject);


	ComboBox.prototype.getDisabled = function(){
		return this.getAttr("comboBox").disabled ;		
	};

	ComboBox.prototype.setDisabled = function(value){
		this.getAttr("comboBox").disabled = value ;	
		this.getAttr("button").loadBitmap(value? this.getAttr("comboBox").imageButtonDisabled : this.getAttr("comboBox").imageButton);
		this.getAttr("bar").loadBitmap(value? this.getAttr("comboBox").imageBarDisabled: this.getAttr("comboBox").imageBar);
		if(value)
			this.getAttr("input").disable();
		else
			this.getAttr("input").enable();
	};

	ComboBox.prototype.getValue = function(){
		return this.getAttr("input").value();
	};

	ComboBox.prototype.setValue = function(value){
		this.getAttr("input").attr('value',value);
	}; 

	ComboBox.prototype.addItem = function(value){
		if(typeof value === "string")
			this.getAttr("comboBox").dataList.push(value);
		else{
			for(var i=0 ; i<value.length; i++)
				this.getAttr("comboBox").dataList.push(value[i]);
			if(this.addScrollbar) 
				this.getAttr("scrollbar").setSizeParent(this.getAttr("comboBox").heightItem * (this.getAttr("comboBox").dataList.length - (this.getAttr("scrollbar").itemVisible - 1) ));
		}
		this.showNewItem(value);
	}; 

	ComboBox.prototype.showNewItem = function(value){
		
		var thisRef = this;	
		if(typeof value === "string") 
			var i = this.getAttr("comboBox").dataList.length - 1;
		else
			var i = this.getAttr("comboBox").dataList.length - value.length;

		// Add Items to List
		for(; i < this.getAttr("comboBox").dataList.length; i++){

			// Add item container
			var item = new DisplayObject({
				name: this.name +"_item_"+i,
				alpha: 0.0000000000001,
				y: i * this.getAttr("comboBox").heightItem,
				height: this.getAttr("comboBox").heightItem,
				width: this.getAttr("comboBox").widthItem,
				onhover: function(){
					this.alpha = 1;
				},
				onleave: function(){
					this.alpha = 0.0000000000001;
				},
				onclick: function(){
					thisRef.getAttr("input").attr('value',thisRef.getAttr("comboBox").dataList[this.num]);
					thisRef.getAttr("list").alpha = 0;
					thisRef.oldLength = thisRef.getAttr("input").value().length; 
				}
			});
			if(this.getAttr("comboBox").imageListFocus)
				item.loadBitmap(this.getAttr("comboBox").imageListFocus);
			item.num = i;

			// Add Text 
			var txt = new TextField({
				name: this.name+"_txt_"+i,
				alpha:1,
				width:this.getAttr("comboBox").widthItem,
	            height:this.getAttr("comboBox").heightItem,
	            y: i*this.getAttr("comboBox").heightItem

			});
			txt.setText(this.getAttr("comboBox").dataList[i]);
			txt.setFont(this.getAttr("comboBox").font);
			this.getAttr("list").addChild(item);
			this.getAttr("list").addChild(txt);
		}

	}; 

	ComboBox.prototype.showList = function(index){

		if(this.getAttr("comboBox").disabled) return;

		this.getAttr("list").height = this.listHeight ;
		this.getAttr("list").width = this.listWidth;
		this.getAttr("list").loadSection(this.getAttr("comboBox").imageList, 0, 0,this.listWidth,this.listHeight);
		this.getAttr("list").alpha = 1;
	
		if (!index) var index = 0;
		var indexMax = this.getAttr("comboBox").dataList.length ;

		if(this.addScrollbar){
			var itemVisible = this.getAttr("scrollbar").itemVisible;
			this.getAttr("scrollbar").alpha = 1;
			this.getAttr("scrollbar").step = 100/(this.getAttr("comboBox").dataList.length - (itemVisible - 1));

			if(index < 0) index = 0;
			if(index + itemVisible  > this.getAttr("comboBox").dataList.length ) {
				indexMax = this.getAttr("comboBox").dataList.length;
				index  = this.getAttr("comboBox").dataList.length - itemVisible;
			}
			else
				indexMax = index + itemVisible ;

			this.getAttr("scrollbar").index = index;
		}

		for (var i = 0 ; i < this.getAttr("comboBox").dataList.length; i++) {
			this.getAttr("txt", i).alpha = this.getAttr("item", i).alpha = 0;
		}
		var i = 0;
		for (; index < indexMax; index++, i++) {
			this.getAttr("item", index).y = this.getAttr("txt", index).y = this.getAttr("comboBox").heightItem * i;
			this.getAttr("txt", index).alpha = 1;
			this.getAttr("item", index).alpha = 0.0000000000001;
		}

	};

	ComboBox.prototype.resizeList = function(nbResult){

		var sizeResult = nbResult * this.getAttr("comboBox").heightItem;
		if(sizeResult <= this.listHeight)
		   this.getAttr("list").loadSection(this.getAttr("comboBox").imageList, 0, this.listHeight - sizeResult, this.listWidth, sizeResult);
	};

	ComboBox.prototype.addScrollBar = function(nbResult){
		var thisRef = this;
		if(!this.getAttr("comboBox").imageSlider || !this.getAttr("comboBox").imageHandle) return;

		this.addScrollbar = this.getAttr("comboBox").heightItem * this.getAttr("comboBox").dataList.length > this.listHeight;

		if(this.addScrollbar){
			var itemVisible = this.listHeight / this.getAttr("comboBox").heightItem;
				itemVisible =  Math.round(itemVisible) > itemVisible ? Math.round(itemVisible)-1 : Math.round(itemVisible);

			var scrollbar = new Scrollbar({
				name: thisRef.name+"_scrollbar",
				data: thisRef.getAttr("comboBox").imageSlider,
				handle: thisRef.getAttr("comboBox").imageHandle,
	            maxSize: thisRef.getAttr("comboBox").heightItem * (thisRef.getAttr("comboBox").dataList.length - (itemVisible - 1)),
				y: thisRef.getAttr("comboBox").scrollbarY? thisRef.getAttr("comboBox").scrollbarY : 0,
				x: thisRef.getAttr("comboBox").scrollbarX? thisRef.getAttr("comboBox").scrollbarX : thisRef.getAttr("comboBox").widthItem
			});
			scrollbar.itemVisible = itemVisible;
			this.getAttr("list").addChild(scrollbar);
		}
	};

	ComboBox.prototype.startSearch = function(){
		var thisRef = this,
			comboBox,
			lenght;

		Keyboard.bind("any", "up", function searchItem(){

			length = thisRef.getAttr("input").value().length ;
			comboBox = thisRef.getAttr("comboBox");

			if(length == 0 || length == thisRef.oldLength ) thisRef.getAttr("list").alpha = 0;
			else{
				var nbResult = 0;
				for(var i=0; i< comboBox.dataList.length; i++){

					if(thisRef.addScrollbar && nbResult > thisRef.getAttr("scrollbar").itemVisible) return;

					if(comboBox.dataList[i].search(thisRef.getAttr("input").value()) == 0){
						thisRef.getAttr("list").alpha = 1;	
						thisRef.getAttr("item",i).alpha = 0.0000000000001;				
						thisRef.getAttr("txt",i).alpha = 1;	
						thisRef.getAttr("txt",i).y = thisRef.getAttr("item",i).y = nbResult * comboBox.heightItem;
						nbResult++;			
					}
					else{
						thisRef.getAttr("item",i).alpha = 0;
						thisRef.getAttr("txt",i).alpha= 0;
					}
				}
				if(nbResult == 0) thisRef.getAttr("list").alpha = 0;
				else {
					if(thisRef.addScrollbar)
						thisRef.getAttr("scrollbar").alpha = 0;
					thisRef.resizeList(nbResult);
				}
			}
			thisRef.oldLength = length;
		});
	};

	ComboBox.prototype.update = function(){
		
		// Hide List if mouse is pressed out 
		if(Mouse.isPressed() && !this.getAttr("bar").collides(Mouse.x()-this.x,Mouse.y()-this.y,1,1) && !this.getAttr("list").collides(Mouse.x()-this.x,Mouse.y()-this.y,1,1) ) {
			if(!this.addScrollbar) 
				this.getAttr("list").alpha = 0;
			else if(!this.getAttr("scrollbar").getIsDragged())
				this.getAttr("list").alpha = 0;		
		}

		// update index if scrollbar move
		if(this.addScrollbar && this.scrollValue != this.getAttr("scrollbar").getValue() ){
			var index = (this.getAttr("scrollbar").getValue('%')) / this.getAttr("scrollbar").step;
				index = Math.round(index) ;
			this.showList(index);
			this.scrollValue = this.getAttr("scrollbar").getValue();
		}
		
	};

	ComboBox.prototype.getAttr = function(name , id){
		var child;
		switch(name){
			case "comboBox": 
				child = this.getChild(this.name + "_comboBox"); 
				break;
			case "bar":
			case "list":
			case "input":
			case "button": 
				child = this.getChild(this.name + "_comboBox").getChild(this.name + "_" + name);
				break;
			case "item": 
			case "txt": 
				child = this.getChild(this.name + "_comboBox").getChild(this.name + "_list").getChild(this.name + "_" + name + "_" +id);
				break;
			case "scrollbar": 
				child = this.getChild(this.name + "_comboBox").getChild(this.name + "_list").getChild(this.name + "_" + name);
				break;	
		}
		return child;
	};

	return ComboBox;
});


			
