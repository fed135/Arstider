define("Arstider/contexts/MatrixTransform", [], {
	
	rotation:function(angle){
		return [Math.cos(angle), Math.sin(angle), -Math.cos(angle), Math.cos(angle)]; 
	},

	translation:function(x, y){
		return [x, y];
	},

	scaling:function(sx, sy){
		return [sx, 0, 0, sy];
	},

	skewing:function(sx, sy){
		return [1, sx, sy, 1];
	}

});