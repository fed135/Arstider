;(function(window){

	var grad = null;
	var gradCtx = null;

/**
 * AMD Closure
 */	
	define( "Arstider/Gradient", ['Arstider/Buffer'], function (Buffer) {
	
		if(grad == null){
			grad = Buffer.create('Arstider_fontGradient');
			grad.width = 100;
			grad.height = 100;
			gradCtx = grad.context2D();
		}
		
		function Gradient(x1,y1,x2,y2)
		{	
			y2 = (GameContainer.browserInfo.browserName === "Firefox") ? -y2 : y2;

			this._grad = gradCtx.createLinearGradient(x1,y1,x2,y2);
		}
			
		Gradient.prototype.addColorStop = function(position, color){
			this._grad.addColorStop(position, color);
			return this;
		};
			
		Gradient.prototype.export = function(){
			return this._grad;
		};
		
		return Gradient;
	});

})(window);