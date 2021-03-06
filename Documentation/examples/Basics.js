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
 * 8- Tweens, Easings, Timers, Dock, Fill
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

//You can automatically dock an element relative to it's parent
myDO.dock(0.5, 0.5);
//This will make sure that the element is always at the center of it's parent

//You can also make sure that an element fills the parent
myDO.fill(0.5, 1);
//Item width will always be half of it's parent, while height will completely fill to match the parent's


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

//Using the map editor, you can build maps for an array of side view, top view and even isometric view games
//To create a screen from a json map file, just do as follow

define("screens/gameplay", ["Arstider/GridMap", "Arstider/Request"], function(GridMap, Request){
    return{
        level:null,
        init:function(){
            var req = new Request({
                url:"media/maps/map01.json",
                caller:this,
                track:true,
                type:"json",
                callback:function(file){
                    this.level = new GridMap(file);
                    this.addChild(this.level);
                }
            }).send();            
        }
    };
});

//The internal structure:
//To access a tile

var tile = this.level.getTile("layerName", x, y);

//Full path
var tile = this.level.layers["layerName"].tiles[x][y];
//tile = DisplayObject-type {..., spawns:[]}

//If you simply need to place a collision mask, There is a class to do it quickly
//A black and white image (black returns a hit) 
var mask = new CollisionMap({
    mask:"collMask.png"
});
screen.addChild(mask);

if(mask.collisionAt(x, y)) //Collision detected!

//If you want simple box collision, entities have a collides method
if(myDO.collides(x, y, w, h)) //Global position is used, returns true if a collision occured 


/**
 * 13- Tags
 * Arstider/Tag
 */
    
//You can place tags over the canvas and control them like entities
var myTag = new Tag({
   x:50,
   y:50,
   tag:"input",
   type:"password",
   value:"put password here"
});

//You can set attributes and style
myTag.attr("data-someData", "someValue"); //"someValue"
myTag.style("border", "1px solid red"); //"1px solid red"

//You can bind events to the field
myTag.bind("change", function(){
    //window scoped, event listener added on the tag directly
    console.log("field was modified!");
});

//you can also get tag properties 
myTag.attr("data-someData"); //"someValue"
myTag.style("border"); //"1px solid red"


/**
 * 14- Requests, Social and Telemetry
 * Arstider/Request
 * Arstider/Social
 * Arstider/Telemetry
 */

//You can create network requests very easily
 var req = new Request({
                url:"server1.com/rest/users/007",
                caller:this, //for callback scoping
                track:true, //progress tracked in the preloader
                user:"myUsername",
                password:"myPassword",
                cache:true,
                headers:{
                    "someAPIKey":"APIKeyString"
                },
                type:"json",
                callback:function(response){
                    console.log(response); //A json-parsed object fetched from the server
                }
            }).send();    

//Supports diffrent methods
var req = new Request({
                url:"server1.com/rest/users",
                caller:this, //for callback scoping
                track:true, //progress tracked in the preloader
                user:"myUsername",
                password:"myPassword",
                headers:{
                    "someAPIKey":"APIKeyString"
                },
                type:"json",
                method:"POST",
                postData:{
                    "id":0,
                    "name":"james bond"
                },
                callback:function(response){
                    console.log(response); //A json-parsed object response from the server
                }
            }).send(); 

//You can integrate social network integration (namely Facebook canvas app) very fast

Social.login("facebook", {
    cookies:true,
    appId:"xxxxx",
    permissions:["user_email", "user_likes"]
}, function(){
   console.log("Logged in!");
   console.log("You are ", Social.user);
   console.log("And your friends are ", Social.friends);
},
function(e){
    console.error("could not login to facebook because ", e);
});
//This will look at the login status and attempt to connect with the provided permissions

//and collect info like so
Social.getInfo("05623956", ["first_name", "last_name", "location"], function(user){
    console.log(user); //returns the user in the list with the freshly queried information
});

//to specifically get an avatar for a user
Social.getPictureUrl("05623956", 110, 110, function(url){
   //url is the url of the user's avatar, forced to a size of 110x110 
});

//The engine also supports telemetry events storing and sending
Telemetry.sendTo({
	url:"https://server1.com/temp/test/telemetry/[category]/[name]",
	track:false,
	cache:false,
	method:"POST",
	type:"json",
	caller:this,
	callback:function(){
		console.log("Telemetry call completed !");
	}
}, "system");
//This will send system events to server1
//you could add other rules to send diffrent events to different servers

//The SDK tracks "system" and "error" internally by default


/**
 * 15- Debugging
 * Arstider.findElement
 * Arstider.debugDraw
 * Arstider.debugBroadcast
 * 
 * Outline
 * Visual Profiler
 */

//From the browser javascript console, you can query info about the elements on stage
Arstider.findElement(); //will return an array with all on stage elements
Arstider.findElement("title"); //will return an array with all elements with name "title"/ or the object directly, if there's only one

//To inspect the image data of an object
Arstider.debugDraw(Arstider.findElement("title").data);//Will draw the content of the title element datain a seperate window

//To dispatch an event from the console
Arstider.debugBroadcast("eventName", "extraData"); //Dispatches the "eventName" event with argument "extraData"

//DEBUG OUTLINES
//You can display the outline around stage elements by holding the d key while in debug mode
//Items can have the boxes permanently displayed if showOutline is set to true in the entity object
myDO.showOutline=true;

//The visual profiler shows draw entities, canvas transformation and current fps. it can be expended, collapsed or closed
//All these features are disbaled in release mode


/**
 * 16- Build aids
 * imageOptimizer.py
 * minify_json.py
 * ping.py
 * closureMinifier.py / compiler.jar
 */

//You can run an image optimization task on a given folder with this python script
tools/imageOptimizer.py absolute/path/to/top-folder
//Be careful as this clobbers the existing files

//You can strip dev comments and remove whitespace from json files with this other script
tools/minify_json.py absolute/path/to/file.json absolute/destination/file.json

//Ping the internet, usefull if you want to create a local compile task versus using the online one, like in the engine build
//See SDK's build task for reference

//closure compiler python file will use the online google closure api, while the jar can be used to compile localy
tools/closureCompiler.py absolute/path/to/file.js absolute/destination/file.js [COMPILE_LEVEL]
//We recommend SIMPLE_OPTIMIZATIONS for compile level


/**
 * UPCOMMING Changes: 
 * 
 * Support right and center aligned parsed text
 * Auto add frame timers to global timers
 * 
 */


