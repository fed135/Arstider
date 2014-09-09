define("@pathname@", [
	"Arstider/DisplayObject",
	"Arstider/TextField",
	"Arstider/Fonts",
	"Arstider/ScreenManager",

	"Arstider/commons/Button"
], function(DisplayObject, TextField, Fonts, ScreenManager, Button){
	
	return {
		/**
		 * Assets manifest
		 */
		assets:{
			//name:"url"
		},
		/**
		 * Screen Setup
		 */
		init:function(){

			//This usually shouldn't go there
			Fonts.create({
				name:"@name@ScreenTitle"
				family:"Arial"
				fillStyle:"#333"
				size:"32px"
				bold:true
			});
			//This usually shouldn't go there
			Fonts.create({
				name:"@name@ScreenButton"
				family:"Arial"
				fillStyle:"#117"
				size:"14px"
				bold:true
			});

			//Title text
			this.title = new TextField({
				name:"title"
				text:"@name@",
				font:"@name@ScreenTitle"
			});
			this.title.dock(0.5, 0.1);
			this.addChild(this.title);

			//Previous button
			this.prevScreenBtn = new Button({
				label:"Go back",
				font:"@name@ScreenButton"
				states:{
					normal:{}
				},
				callback:this.goPrevScreen,
				width:120,
				height:30
			});
			this.prevScreenBtn.dock(0.9, 0.9);
			this.addChild(this.prevScreenBtn);
		},
		/**
		 * On screen load
		 */
		onload:function(){
			//Once assets have finished loading and init has run
		},
		/**
		 * On frame update
		 */
		update:function(deltaTime){
			//Runs every frame, provides the time past since last frame 
		},
		/**
		 * On screen unload
		 */
		unload:function(){
			//When the screen unloads
		},
		/**
		 * On screen resume
		 */
		onresume:function(){
			//When returning to a saved state of this screen 
		},

		/**
		 * Custom defined screen methods
		 */
		goPrevScreen:function(){
			ScreenManager.goto(ScreenManager.LAST_SCREEN);
		}
	};
});