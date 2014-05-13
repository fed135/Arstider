/**
 * ARSTIDER SDK
 * The very basics
 */


/**
 * 1- Checking if variable is a member of some object / is undefined
 * Arstider.checkIn
 */

//You have a collection
var someCollection = {
  a:1,
  b:4,
  c:0,
  d:null
};

//...or a variable
var test = "test";

//And you simply need to check if it's undefined, and if it is, use a replacement value
var r = Arstider.checkIn(someCollection.a, "replacement"); //r = 1
var r = Arstider.checkIn(someCollection.e, "replacement"); //r = "replacement"
var r = Arstider.checkIn(someCollection.d, "replacement"); //r = null
var r = Arstider.checkIn(test, "replacement"); //r = "test"


/**
 * 2- Merging and cloning Objects
 * Arstider.clone
 * Arstider.mixin
 */

//To copy properties from one object to another
var newObj = Arstider.mixin({x:1,y:1}, {a:0, y:null}); //newObj = {x:1, y:1, a:0, y:null}

//...or to simply clone an object
var newObj = Arstider.clone(myObj);

//A quick reminder on how to clone arrays:
var newArray = oldArray.concat();


/**
 * 3- Timestamp, random number generator
 * Arstider.timestamp
 * Arstider.RandomGenerator
 */

//Usefull for timing/ salting
var r = Arstider.timestamp(); //r = 1400003494794

//Seed-based random number generation
var g = new Arstider.RandomGenerator();
var r = g.next(); // r = 2


/**
 * 4- Method scoping and inheritance
 * Arstider.delegate
 * Arstider.Super
 * Arstider.Inherit
 */

//To rescope methods (in cases where the engine does not automaticaly do it)
Arstider.delegate(functionA, scopeObj, [arg1, arg2]); //The equivalent of having functionA.apply(scopeObj, [arg1, arg2])

//To create inheritance
function A(args){
    this.x = args;
    this.y = 7;
}

A.prototype.foo = function(){
    console.log("from A");
};

A.prototype.bar = function(){
    console.log("BAR!");
};

//B will inherit A...
function B(args){
    //instanciate A with B's constructor arguments
    Arstider.Super(this, A, args);
    this.a = "a";
    this.y = 9;
}
//Adds prototype of A to B
Arstider.Inherit(B, A);

B.prototype.foo = function(){
    console.log("from B");
};

//Result:
var myB = new B(3);
myB.x; //3
myB.a; //"a"
myB.y; //9
myB.foo(); //"from B"
myB.bar(); //"BAR"


/**
 * 5- Bitmaps, Buffers, image transformations
 * Arstider/Bitmap
 * Arstider/Buffer
 * 
 * Arstider.saveToBuffer
 * Arstider.invertColors
 * Arstider.grayscale
 * Arstider.tint
 * Arstider.blur
 */

//To load an image
var b = new Bitmap("image.png", function(){
   //Image has been loaded, can now access the data property 
   someContext.drawImage(this.data, 0,0);
});

//You can move it to a canvas buffer
var myBuffer = Arstider.saveToBuffer("image", b.data);
//Immediatly, you can get the buffer content from the data property
someContext.drawImage(myBuffer.data, 0,0);

//You can alter the content of a Buffer
var inverted = Arstider.invertColors(myBuffer);
//Which returns another buffer that you can use right away
someContext.drawImage(inverted.data, 0,0);

//DisplayObject types can also be instructed to load assets on instantiation and have an onload callback feature
var myDO = new DisplayObject({
   data:"image1.png",
   onload:function(){console.log("The data was loaded!");}
});


/**
 * 6- Texture and gradients
 * Arstider/Texture
 * Arstider/Gradient
 */

//To apply a texture to a displayObject
//Create the display object with a width and height defined
var myDO = new DisplayObject({
   name: "texturedDO",
   width:45,
   height:55
});

//Create a texture from image1 (tiling)
var texture = new Texture("image1.png", function(){
    //Use the texture object as data for your display object
    myDO.data = texture;
});

//...or create a gradient
var gradient = new Gradient("linear", 0, 0, 100, 100); //From top left to bottom right
//starts red
gradient.addColorStop(0, "#ff0000");
//turns white halfway
gradient.addColorStop(0.5, "#ffffff");
//and ends in red
gradient.addColorStop(1, "#0000ff");
//Use the gradient object as data for your display object
myDO.data = gradient;


/**
 * 7- Mouse, Drag and drop, Keyboard, Custom events, Accelerometer
 */

//To get the current global x position of the mouse
Mouse.x();
//Let's say you're on mobile, and want to get a specific touch input index
Mouse.x(2); //Returns the x position of the 3rd finger input or -1 if there are no longer 3 inputs

//You can add mouse behaviour on entity-type objects on instantiation
var myDO = new DisplayObject({
    name:"mouseTest",
    x:10,
    y:10,
    width:47,
    height:47,
    onhover:function(){console.log(this.name+" hovered");}, //element is hovered
    onpress:function(){console.log(this.name+" pressed");}, //element is pressed
    onleave:function(){console.log(this.name+" left");},    //mouse left the element
    onclick:function(){console.log(this.name+" clicked");}, //simple click handler (pressed, then released)
    onrelease:function(){console.log(this.name+" released");}, //element is released
    ondoubleclick:function(){console.log(this.name+" double-clicked");}, //element is double-clicked
    onrightclick:function(){console.log(this.name+" right-clicked");}, //element is clicked (onclick) with the right mouse button (desktop only)
});

//There is dragging and dropping out of the box
var myDO = new DisplayObject({
    name:"mouseTest",
    x:10,
    y:10,
    width:47,
    height:47,
    onpress:function(){
        this.startDrag(true, true); //Centers object on the mouse (snap), and confines the movement to the limits of the object's parent (drag zone)
    },
    onrelease:function(){
        this.stopDrag();
    }
});

//You can bind keyboard events like so
Keyboard.bind("r", "up", function(){
   console.log("key r was released"); 
});

Keyboard.bind("left", "down", function(){
   console.log("left arrow key was pressed");
});

//And do the same for custom events
Events.bind("User.connect", function(data){
    console.log("function called when User.connect is broadcasted and has data:", data);
});

//Broadcasting is done like this
Events.broadcast("User.connect", "fred");
//outputs "function called when User.connect is broadcasted and has data:fred"

//To collect accelerometer data, you can do so from the viewport
var tilt = Viewport.getDeviceTilt();
//tilt = {x:0, y:0, z:0}
var xTilt = tilt.x;

//It would be a good idea to calibrate it when you enter a screen or pass through a transition.
//For example,
var defXOffset = tilt.x;

//on next frames
var xTilt = Viewport.getDeviceTilt().x - defXOffset;


/**
 * 8- Tweens, Easings, Timers
 */

//Tween objects are created like so
var myTween = new Tween(myStageEntity, {x:40, y:60}, 400, Easings.QUAD_IN_OUT);
//Tween will not start until .play() is called

//you can add callbacks or chain animations
myTween.then(function(){console.log("foomacia!");});
//Adding animations is almost the same as instantiating, only the target is skipped
myTween.then({x:-30, y:0}, 2000).then({rotation:180}, 200, Easings.BOUNCE_OUT, 1.7).loop(5); //The tween is returned at every stage for quicker chaining
//We also want the whole thing to loop 5 times

//Once satisfied, you can simply play it
myTween.play();

//Tweens and timers share a lot of the basic functions, like restart, pause, play, stop, resume
//Tweens can also reverse, yoyo, stepBack and sleep

//To remove a tween from the global timers and dispose of it for good, use stop or kill

//Timers can work on the draw thread or in realtime
//Draw-synced
var myTimer = new Timer(callbackFct, 3000);
GlobalTimers.push(myTimer);

//Real time
var myTimer = new Timer(callbackFct, 3000, true);


/**
 * 9- TextFields, Fonts
 */

//Fonts can be loaded from a JSON file, or can be defined at runtime
Fonts.create({
    name:"TitleFont",
    size:"48px",
    style:"bold"
});

//TextFields are instantiated like so
var myTxt = new TextField({
    name:"myTxt"
}); //It is strongly recommended to name text-fields as they occupy buffers

//setFont
myTxt.setFont(Fonts.get("TitleFont"));
myTxt.setText(Dictionary.translate("some text, [[C=#FF0000]]some red text[[/]]"));

//Textfield size adjusts if not predefined


/**
 * 10- Sprites, Sequences
 */

//To create animated sprite entities, you new to fetch a SpriteSheet
var heroSheet = new SpriteSheet({
    data:"hero.jpg",
    width:24, //frame width
    height:36 //frame height
});

//Then, create cycles or animations with the frames in the sheet
heroSheet.addSequence("idle", 0.1, [0,1,2,1]);

//Then create the stage entity
var hero = new Sprite();
hero.currentAnim = heroSheet.idle;
hero.rewind();


/**
 * 11- Sound
 */

//To play sounds, you simply do
var titleTrack = null;
Sound.play("title", {
    volume:0.6,
    startCallback:function(i){
       //store the sound instance, for later manipulation
       titleTrack = i;
    },
    endCallback:function(){
       console.log("title finished playing");
    }
});

//Now to perform manipulations
if(titleTrack != null) Sound.fade(titleTrack, 1, 0, 350, function(){
   console.log("finished fading"); 
});

if(titleTrack != null) Sound.pause(titleTrack);

//Etc.


/**
 * 12- GridMaps, CollisionMaps and box collision
 */


/**
 * 13- Tags
 */

/**
 * 14- Requests, Social and Telemetry
 */

/**
 * 15- Debugging
 * Arstider.findElement
 * Arstider.debugDraw
 * Arstider.debugBroadcast
 * 
 * Outline
 * Visual Profiler
 */



/**
 * Important UPCOMMING Changes: 
 * 
 * Arstider/Shape (vector draw)
 * Entity boxCollision .collides
 * Font and Text can be set at instantiation of textfield (Fonts.get also performed in TextField)
 * Sprite pause, resume
 * Sound fade detects the from volume
 */


