define("Arstider/commons/Popup",[
	"Arstider/DisplayObject",
	"Arstider/Viewport", 
	], /** @lends commons/Popup */
	function(DisplayObject, Viewport){
			
		function Popup(props){
			
			Arstider.Super(this, DisplayObject, props);
			/**
			 * If props is undefined, use the Engine's empty object constant
			 */
			props = props || Arstider.emptyObject;	

			this.overlay = new DisplayObject({
					name:"overlay",
					alpha:0
				});
			this.addChild(this.overlay);
	
			var thisRef = this;
			var overlayBg = Arstider.checkIn(props.bg, Arstider.checkIn(props.image, null)); 
			var popupBg =  Arstider.checkIn(props.popup,null);

			if(overlayBg != null && typeof overlayBg === "string"){
				var background = new DisplayObject({
					name:"backgroundOverlay",
					onclick: function(){
						thisRef.hidePopup();
					}
				});

				background.loadBitmap(overlayBg);
				this.overlay.addChild(background);
			}

			if(popupBg != null){
				var popup = new DisplayObject({
					name:"PopupBackground",
					onclick: function(){
						Arstider.cancelBubble();
					},
					onload : function(){
						popup.x =  Viewport.maxWidth/2 - popup.width/2 ;
						popup.y =  Viewport.maxHeight/2 - popup.height/2;
					}
				});

				if(typeof popupBg === "string"){
					popup.loadBitmap(popupBg);
				}	
				else {
					popupBg.data = Arstider.checkIn(props.popup.image,Arstider.checkIn(props.popup.bg,null));
					popup.loadBitmap(popupBg.data);
					popup.x = popupBg.x;
					popup.y = popupBg.y;	
				}
				this.overlay.addChild(popup);
			}
		}
		Arstider.Inherit(Popup, DisplayObject);

		Popup.prototype.showPopup= function(){
		 this.overlay.alpha = 1;
		};

		Popup.prototype.hidePopup= function(){
		this.overlay.alpha = 0;
		};
		
		return Popup;
	});