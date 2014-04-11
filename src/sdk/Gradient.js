;(function(){

	var 
		grad = null
	;

/**
 * AMD Closure
 */	
	define( "Arstider/Gradient", ['Arstider/Buffer'], function (Buffer) {
	
		if(grad == null){
			grad = new Buffer({
				name:'Arstider_gradient',
				width:100,
				height:100
			});
		}
		
		function Gradient(x1,y1,x2,y2)
		{	
			y2 = (GameContainer.browserInfo.browserName === "Firefox") ? -y2 : y2;

			this._grad = grad.context.createLinearGradient(x1,y1,x2,y2);
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
})();