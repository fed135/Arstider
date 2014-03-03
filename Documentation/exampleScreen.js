(function(){
	/**
 	* Permanent + private section
 	*/
 	
 	var timesSeen = 0;

	define("TestScreen", ["Arstider/Screen", "Arstider/DisplayObject"], function(Screen, DisplayObject){
		
		/**
		 * Temp + private section
		 */
		
		var title = new DisplayObject({
			name:"title",
			x:100,
			y:200,
			data:"someAsset.png",
			onclick:function(){
				console.log("My name is ", this.name);
			}
		});
		
		
		
		/**
		 * Screen object
		 */
		Arstider.Inherit(TestScreen, Screen);
		function TestScreen(){
			Arstider.Super(this);
			
			/**
			 * Add elements to screen object
			 */
			this.addChild(title);
		}
		
		/**
		 * Screen methods
		 */
		TestScreen.prototype.onload = function(){
			console.log("Screen launching for the "+(timesSeen++)+" time!");
		};
		
		TestScreen.prototype.resetTimesSeen = function(){
			timesSeen = 0;
		};
		
		return TestScreen;
	});
})();