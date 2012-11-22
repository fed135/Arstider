var Main = Ar.Class({
	requireOnce:true,
	name:"Main",
	body:function(){
		
		//===Class body goes here===//
		
		//Private
		var private_test = "pumpkin";
		var passcode = "bonjour";		//Let's just pretend here for a minute that the function and the rest of the javascript are 2 different itenties.
		var cnv = null;
		
		//Public
		return {
			getPrivate:function(pass) {
				if(pass === passcode) {
					return "Passcode correct. Private was \""+private_test+"\""; //The rest of the program cannot read 'private_test' otherwise.
				}
			},
			createCanvas:function() {
				cnv = document.getElementById("canvas_zone").drawCanvas();
				
				//Layer
				var menuLayer = new Ar.Graphics.Layer("overlay",{engine:"2d", width:240, height:200});
				cnv.addLayer(menuLayer);
				
				//Item
				var testMc = new Ar.Graphics.MovieClip("testMc",{data:"images/textures/digicam-test1.png", width:120, height:100});
				menuLayer.addClip(testMc);
				
				cnv.startDraw();
				
				setTimeout(cnv.stopDraw, 3000);
			},
			stopAll:function() {
				cnv.stopDraw();
			}
		};
		
		//===End of Class
	}()
});