var Eng = new Ar({debug:true});

var canvas = new Eng.Canvas("canvas_zone").extend(Eng.Container);

var square = new Eng.DisplayObject({
	data:'../demo1/images/textures/digicam-test1.png',
	width:100,
	height:100,
	x:0,
	y:0
});
canvas.Container.addChild(square);

var super_square = new Eng.DisplayObject({
	data:'http://1.bp.blogspot.com/-fzh16uhTAjw/TfeP-zPfDcI/AAAAAAAAA2k/pq9UW3h-eSE/s1600/filosofem.jpg',
	width:100,
	height:100,
	x:0,
	y:100
}).extend([
	Eng.Dockable, 
	Eng.Container
]);
canvas.Container.addChild(super_square);

var lame_square;
var lamer_square;
setTimeout(function() {
	lame_square = new Eng.DisplayObject({
		data:'../demo1/images/textures/digicam-test1.png',
		y:200,
		x:0
	});
	canvas.Container.addChild(lame_square);
	
	lamer_square= new Eng.DisplayObject({
		data:super_square._data(),
		y:0,
		x:100,
		width:100,
		height:100
	});
	canvas.Container.addChild(lamer_square)
},500);

//window.requireFS();
//super_square.Dockable.relativeDock("left","top");
