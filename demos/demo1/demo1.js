var Eng = new Ar({debug:true});

var square = new Eng.DisplayObject({data:'../demo1/images/textures/digicam-test1.png'});
console.warn(square);
setTimeout(function(){console.warn(square);},1000);