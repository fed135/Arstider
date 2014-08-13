define("Arstider/contexts/MatrixTransform", [], {
	
	rotation:function(angle, points){
		var 
			s = Math.sin(angle),
			c = Math.cos(angle)
		;

		/*
			rotation matrix formula:
	        x' = x*c - y*s
	        y' = x*s + y*c
		*/
    
	    for(var i=0; i<points.length; i+=2){
	        var oldX = points[i+0];
       		var oldY = points[i+1];
        	points[i+0] = oldX*c - oldY*s;
        	points[i+1] = oldX*s + oldY*c;
	    }
	},

	translation:function(x, y, points){
		var matrix = [x, y];
		points[0] = (matrix[0] + points[0]);
		points[1] = (matrix[1] + points[1]);
		points[2] = (matrix[0] + points[2]);
		points[3] = (matrix[1] + points[3]);
		points[4] = (matrix[0] + points[4]);
		points[5] = (matrix[1] + points[5]);
		points[6] = (matrix[0] + points[6]);
		points[7] = (matrix[1] + points[7]);
	},

	scaling:function(sx, sy, points){
		var matrix = [sx, 0, 0, sy];
		points[0] = (matrix[0]*points[0])+(matrix[1]*points[0]);
		points[1] = (matrix[2]*points[1])+(matrix[3]*points[1]);
		points[2] = (matrix[0]*points[2])+(matrix[1]*points[2]);
		points[3] = (matrix[2]*points[3])+(matrix[3]*points[3]);
		points[4] = (matrix[0]*points[4])+(matrix[1]*points[4]);
		points[5] = (matrix[2]*points[5])+(matrix[3]*points[5]);
		points[6] = (matrix[0]*points[6])+(matrix[1]*points[6]);
		points[7] = (matrix[2]*points[7])+(matrix[3]*points[7]);
	},

	skewing:function(sx, sy, points){
		var matrix = [1, sx, sy, 1];
		points[0] = (matrix[0]*points[0])+(matrix[1]*points[0]);
		points[1] = (matrix[2]*points[1])+(matrix[3]*points[1]);
		points[2] = (matrix[0]*points[2])+(matrix[1]*points[2]);
		points[3] = (matrix[2]*points[3])+(matrix[3]*points[3]);
		points[4] = (matrix[0]*points[4])+(matrix[1]*points[4]);
		points[5] = (matrix[2]*points[5])+(matrix[3]*points[5]);
		points[6] = (matrix[0]*points[6])+(matrix[1]*points[6]);
		points[7] = (matrix[2]*points[7])+(matrix[3]*points[7]);
	}

});