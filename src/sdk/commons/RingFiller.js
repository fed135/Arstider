define("Arstider/commons/RingFiller", 
[
	"Arstider/Entity",
	"Arstider/Bitmap",
	"Arstider/Buffer"
],
function(Entity, Bitmap, Buffer){
	
	function RingFiller(props){
		Arstider.Super(this, Entity, props);

		this.centerRadius = Arstider.checkIn(props.centerRadius, 10);
		this.outsideRadius = Arstider.checkIn(props.outsideRadius, 20);

		this.data = new Buffer();

		var size = this.outsideRadius * 2;
		this.width = this.height = this.dataWidth = this.dataHeight = size;

		this._pcent = 0;
		this.startAngle = Arstider.checkIn(props.startAngle, 0);
		this.counterClockwise = Arstider.checkIn(props.counterClockwise, false);

		if(props.texture){
			this.texture = new Bitmap({
				url:props.texture,
				callback:this._draw.bind(this)
			});
		}

		if(props.fillStyle){
			this.fillStyle = props.fillStyle;
		}
	}

	Arstider.Inherit(RingFiller, Entity);

	RingFiller.prototype._draw = function(){

		var starts = (this.startAngle/360)*(2*Math.PI);
		this.data.setSize(this.width, this.height);

		//console.log("starts at ", starts, " ends at ", (((2 * Math.PI)*this._pcent) - starts));

		this.data.context.beginPath();
		this.data.context.moveTo(this.outsideRadius, this.outsideRadius);
		this.data.context.arc(this.outsideRadius, this.outsideRadius, this.outsideRadius, starts, ((2 * Math.PI)*this._pcent) - starts, this.counterClockwise);
		this.data.context.lineTo(this.outsideRadius, this.outsideRadius);
		this.data.context.clip();

		if(this.texture){
			this.data.context.drawImage(this.texture.data, (this.width - this.texture.width)*0.5, (this.height - this.texture.height)*0.5);
		}
		else{
			this.data.context.fillStyle = this.fillStyle || "red";
			this.data.context.fill();
		}
		this.data.context.closePath();

		this.data.context.beginPath();
		this.data.context.arc(this.outsideRadius, this.outsideRadius, this.centerRadius, 0, 2 * Math.PI, false);
		this.data.context.clip();
		this.data.context.clearRect(0,0,this.outsideRadius*2, this.outsideRadius*2);
		this.data.context.closePath();
	};

	/*From 0 to 1*/
	RingFiller.prototype.setProgress = function(prog){
		this._pcent = prog;
		this._draw();
	};

	return RingFiller;

});