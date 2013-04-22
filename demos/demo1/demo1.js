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


//super_square.Dockable.relativeDock("left","top");

//console.warn(canvas);
//console.warn(square);
//console.warn(super_square);
//setTimeout(function(){console.warn(square._data());},1000);