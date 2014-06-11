define("Arstider/Gesture", ["Arstider/Mouse"], /** @lends Gesture */ function(Mouse){

	/**
	 * Gesture constructor
	 * @constructor
	 * @class Gesture
	 * @name Gesture
	 */
	function Gesture(){
		this.reccording = false;

		this.points = [];
		this.center = null;
		this.speed = 0;
		this.speedX = 0;
		this.speedY = 0;
		this.distance = 0;
		this.distanceX = 0;
		this.distanceY = 0;
		this.resembles = null;
		this.scale = 1;
		this.drawTime = 0;
		this.angle = 0;
		
		this.startSpread = null;
		
		this._savedDelay = 0;
		this._savedDistanceX = 0;
		this._savedDistanceY = 0;
		this._startDelay =null;

		this.maxPoints = 6;
	}
	
	/**
	 * Updates the points of a gesture and analyzes them
	 * @private
	 * @type {function(this:Gesture)} 
	 */
	Gesture.prototype.update = function(){
		
		if(this.points.length == 0) return;
		
		var 
			currX = null,
			currY = null,
		
			distX = 0,
			distY = 0,
			delay = 0,
			
			spreadSet = false,
			spread = 0
		;
		
		for(var i = 0; i< this.points.length; i++){
			spreadSet = false;
			
			if(currX == null || currY == null){
				//first input
				currX = this.points[i].inputs[0].x;
				currY = this.points[i].inputs[0].y;
			}
			
			if(this.points[i].inputs[1] != null){
				if(this.center == null){
					this.center = {x:(this.points[i].inputs[0].x + this.points[i].inputs[1].x) / 2, y:(this.points[i].inputs[0].y + this.points[i].inputs[1].y) / 2};
				}
				if(this.startSpread == null){
					spreadSet = true;
					this.startSpread = Math.sqrt(Math.pow((this.points[i].inputs[0].x - this.points[i].inputs[1].x), 2) + Math.pow((this.points[i].inputs[0].x + this.points[i].inputs[1].y), 2));
				}
			}
			
			//distance
			if(this.points[i].inputs[0].x < currX) distX += (currX - this.points[i].inputs[0].x);
			else distX += (this.points[i].inputs[0].x - currX);
			
			if(this.points[i].inputs[0].y < currY) distY += (currY - this.points[i].inputs[0].y);
			else distY += (this.points[i].inputs[0].y - currY);
			
			if(i>0){
				delay += (this.points[i].delay - this.points[i-1].delay);
				this.angle = Math.atan2(this.points[i].inputs[0].y - this.points[i-1].inputs[0].y, this.points[i].inputs[0].x - this.points[i-1].inputs[0].x) * 180 / Math.PI;
			}
				
			currX = this.points[i].inputs[0].x;
			currY = this.points[i].inputs[0].y;
			
			if(this.startSpread != null && this.points[i].inputs.length > 1 && !spreadSet){
				spread = Math.sqrt(Math.pow((currX - this.points[i].inputs[1].x), 2) + Math.pow((currY + this.points[i].inputs[1].y), 2));
			}
		}
		
		delay += this._savedDelay;
		distX += this._savedDistanceX;
		distY += this._savedDistanceY;
		
		this.drawTime = delay;
		
		this.distanceX = distX;
		this.distanceY = distY;
		this.distance = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
		
		this.speedX = distX/delay;
		this.speedY = distY/delay;
		this.speed = this.distance/delay;
		
		if(this.startSpread != null && spread != 0){
			this.scale = spread/this.startSpread;
			
			if(this.scale < 1){
				this.resembles = gestures.PINCH_IN;
			}
			else{
				this.resembles = gestures.PINCH_OUT;
			}
		}
		else{
			this.resembles = gestures.SWIPE;
		}
	};

	Gesture.prototype.step = function(points){
		this.points.push({
			inputs: [points[0],points[1] || null],
			delay:parseInt(Arstider.timeStamp()) - this._startDelay
		});

		if(this.points.length > this.maxPoints) this.points.shift()
		this.update();
	};

	Gesture.prototype.startReccording = function(){
		this.reccording = true;
		this._startDelay = parseInt(Arstider.timeStamp());
		if(Mouse._currentGestures.indexOf(this) != -1) return;
		Mouse._currentGestures.push(this);
	};

	Gesture.prototype.stopReccording = function(){
		this.reccording = true;
		var i = Mouse._currentGestures.indexOf(this);
		if(i != -1) Mouse._currentGestures.splice(i, 1);
	};

	return Gesture;
});