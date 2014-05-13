// ...
define("screens/title", [
	// List sdk required module here...
	"Arstider/Events",
	"Arstider/Background",
	"Arstider/DisplayObject",
	"Arstider/Dictionary",
	"Arstider/Tween",
	"Arstider/Easings",
	"Arstider/GameData",
	"Arstider/Sound",
	// List game custom entities here...
	"entities/LargeButton",
	"entities/Overlay"
],
function(Events, Background, DisplayObject, Dictionary, Tween, Easings, GameData, Sound, LargeButton, Overlay){	
        
        /**
         * Returns an object to be mixed-in to a screen class object. Methods are rescoped so that the 'this' keyword refers to the screen. 
         */
	return {
                //You can define screen properties, in this case, is an overlay is visible
		overlayVisible: false,
                //Called when class loads
		init:function(){
                        //Adds First time property to the screen
			this.firstTime = GameData.get("firstTime", true);

			Background.set("media/images/backgrounds/titleBg.jpg");

			this.property = new DisplayObject({
				name: "property",
				data: "media/images/localized/property.png",
				width: 206,
				height: 133,
				x: 212,
				y: 75
			});
			this.addChild(this.property);

				this.logo = new DisplayObject({
					name: "logo",
					data: "media/images/localized/logo.png",
					width: 344,
					height: 207,
					x: 142,
					y: 212
				});
				this.addChild(this.logo);

				this.btnPlay = new LargeButton({
					name: "btnPlay",
					label: Dictionary.translate("PLAY"),
					font: "btnLargeFont",
					x: 240,
					y: 672,
					alpha: 0,
					callback: thisRef.play
				});
				this.addChild(this.btnPlay);
				
				this.btnContinue = new LargeButton({
					name: "btnContinue",
					label: Dictionary.translate("CONTINUE"),
					font: "btnLargeFont",
					x: 240,
					y: 672,
					alpha: 0,
					callback: thisRef.play
				});
				this.addChild(this.btnContinue);
				
				this.btnNewGame = new LargeButton({
					name: "btnNewGame",
					label: Dictionary.translate("NEW_GAME"),
					font: "btnLargeFont",
					x: 240,
					y: 752,
					alpha: 0,
					callback: thisRef.showOverlay
				});
				this.addChild(this.btnNewGame);

				// Overlay assets

				this.overlay = new Overlay({
					name: "overlay",
					x: 0,
					y: -672,
					text: {
						font: "overlayFont",
						value: Dictionary.translate("CONFIRM_ERASE")
					},
					confirm: {
						font: "btnSmallFont",
						label: Dictionary.translate("YES"),
						callback: thisRef.reset
					},
					cancel: {
						font: "btnSmallFont",
						label: Dictionary.translate("NO"),
						callback: thisRef.hideOverlay
					}
				});
				this.addChild(this.overlay);
			},
                        
                        //called at the end of the preloading
			onload:function(){
				var muted = (GameData.get("muted", true) || false) + ""; //Force string format, to reduce error margin
				GameData.set("muted", muted, true); //Save properly formatted value
				if(muted != "true"){
					if(!GameData.get("menuTrack")){
						GameData.set("menuTrack", true); //Store the fact that the menu song is currently playing
						Sound.play("menu");
					}
				}
				
				if(thisRef.firstTime == undefined || thisRef.firstTime === "true")
				{
					thisRef.playTween = new Tween(thisRef.btnPlay, { alpha: 1, y: 445 }, 300, Easings.CIRC).play();

					thisRef.setDefaultLocalStorage();
				}
				else
				{
					thisRef.continueTween = new Tween(thisRef.btnContinue, { alpha: 1, y: 445 }, 300, Easings.CIRC).play();
					thisRef.newGameTween = new Tween(thisRef.btnNewGame, { alpha: 1, y: 525 }, 300, Easings.CIRC).play();
				}
			},

			play:function(){
				if(thisRef.isOverlay) return;

				GameData.set("firstTime", "false", true);

				Events.broadcast("Engine.gotoScreen", "screens/story");
			},

			showOverlay:function()
			{
				if(thisRef.isOverlay) return;

				thisRef.overlayTween = new Tween(thisRef.overlay, { y: 0 }, 400, Easings.QUAD_IN).then(function(){ thisRef.isOverlay = true; }).play();
			},

			hideOverlay:function()
			{
				thisRef.overlayTween = new Tween(thisRef.overlay, { y: 672 }, 400, Easings.QUAD_OUT).then(function(){ thisRef.overlay.y = -672; thisRef.isOverlay = false; }).play();
			},

			reset:function()
			{
				thisRef.setDefaultLocalStorage();

				thisRef.btnPlay.alpha = 1;
				thisRef.btnPlay.y = 445;

				thisRef.btnNewGame.alpha = 0;
				thisRef.btnNewGame.y = 672;

				thisRef.btnContinue.alpha = 0;
				thisRef.btnContinue.y = 752;

				thisRef.hideOverlay();
			},

			setDefaultLocalStorage:function()
			{
				var songPlaying = GameData.get("menuTrack");
				GameData.reset(true);

				GameData.set("firstTime", "true", true);
				GameData.set("muted", "false", true);

				GameData.set("completedSongs", 0, true);

				GameData.set("currentPlayer", "", true);
				GameData.set("currentSong", "", true);
				GameData.set("currentDifficulty", "", true);

				GameData.set("austinHighscore", 0, true);
				GameData.set("austinCurrentCompleted", 0, true);
				GameData.set("austinCurrentObjective", 0, true);

				GameData.set("allyHighscore", 0, true);
				GameData.set("allyCurrentCompleted", 0, true);
				GameData.set("allyCurrentObjective", 0, true);
				
				if(!songPlaying){
					Sound.play("menu");
				}
				GameData.set("menuTrack", true);
			}
		};
	}
);