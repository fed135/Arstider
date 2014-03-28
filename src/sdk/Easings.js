;(function(window){

	//CORE EASINGS
	function linear(progress){
		return progress;
	}
	
	function quad(progress){
		return Math.pow(progress, 2);
	}
	
	function circ(progress){
		return 1 - Math.sin(Math.acos(progress));
	}
	
	function back(progress, x){
		return Math.pow(progress, 2) * ((x + 1) * progress - x);
	}
	
	function bounce(progress){
		for(var a = 0, b = 1, result; 1; a += b, b /= 2) {
			if (progress >= (7 - 4 * a) / 11) {
				return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2);
			}
		}
	}
	
	function elastic(progress, x){
		return Math.pow(2, 10 * (progress-1)) * Math.cos(20*Math.PI*x/3*progress);
	}
	
	//EASE OUTS
	function easeOut(delta){ 
		return function(progress, x){
			return 1-delta(1-progress, x);
		};
	}
	
	//EASE IN-OUTS
	function easeInOut(delta){ 
		return function(progress, x){
			if (progress < 0.5){
				return delta(2*progress, x) * 0.5;
			}
			else{
				return (2 - delta(2*(1-progress), x)) * 0.5;
			}
		};
	}
	
	define( "Arstider/Easings", [], function () {
		
		return {
			LINEAR:linear,
			
			QUAD_IN:quad,
			QUAD_OUT:easeOut(quad),
			QUAD_IN_OUT:easeInOut(quad),
			
			CIRC:circ,
			
			BACKSWING:back,
			
			BOUNCE_IN:bounce,
			BOUNCE_OUT:easeOut(bounce),
			BOUNCE_IN_OUT:easeInOut(bounce),
			
			ELASTIC_IN:elastic,
			ELASTIC_OUT:easeOut(elastic),
			ELASTIC_IN_OUT:easeInOut(elastic)
		};
		
	});
})(window);