/**
 * BitmapTexture
 * @author Gilbert White <gilbertw@meetfidel.com>
 */
define( "Arstider/BitmapTexture",
[
	"Arstider/Shape",
	"Arstider/Buffer",
	"Arstider/Texture"
], 
/** @lends BitmapTexture */
function (Shape, Buffer, Texture)
{
	Arstider.Inherit(BitmapTexture, Shape);

	// Temporary single-use variables
	var _newFrame;
	var _stepFrame;
	var _rect;

	/**
	 * BitmapTexture constructor
	 * Animated sprite stage object
	 * @class BitmapTexture
	 * @constructor
	 * @param {Object} props The list of properties
	 */
	function BitmapTexture(props)
	{
		/**
		 * If props is undefined, use the Engine's empty object constant
		 */
		props = props || Arstider.emptyObject;	

		var context = this;

		// Get into SDK
		Arstider.Super(this, Shape, props);

		this.texture = new Texture({data:props.texture, callback:this.drawWithTexture.bind(this)});
		/*
		var tempDO = new DisplayObject();
		tempDO.loadBitmap(props.texture, this.drawWithBuffer.bind(this));
		*/
	};

	BitmapTexture.prototype.drawWithTexture = function(img)
	{
		//console.log("texture loaded! - "+this.width+"x"+this.height);
		//console.log(img);

		this.fillStyle = this.texture;
	}

	BitmapTexture.prototype.drawWithBuffer = function(img)
	{
		//console.log("bitmap loaded! - "+this.width+"x"+this.height);
		//console.log(img);

		var buffer = new Buffer({name:"ctn", width:this.width, height:this.height});

		var currX = 0;
		while(currX < this.width){
			buffer.context.drawImage(img.data, currX, 0, img.width, img.height);
			currX += img.width;
		}
		this.data = buffer;
	};

	return BitmapTexture;
});