/*
 * Transform tracker
 *
 * @author Kevin Moot <kevin.moot@gmail.com>
 * Based on a class created by Simon Sarris - www.simonsarris.com - sarris@acm.org
 */
define("Arstider/contexts/MatrixTransform", [], function(){
	
	function MatrixTransform(pencil, context){
	    this.pencil = pencil;
	    this.context = context;
        this.baseMatrix = [1,0,0,1,0,0];
	    this.matrix = this.baseMatrix; //initialize with the identity matrix
	    this.stack = [];
	}  
    
    MatrixTransform.prototype.setContext = function(pencil) {
        this.pencil = pencil;
    };

    MatrixTransform.prototype.getMatrix = function() {
        return this.matrix;
    };
    
    MatrixTransform.prototype.setMatrix = function(m) {
        this.matrix = [m[0],m[1],m[2],m[3],m[4],m[5]];
    };
    
    MatrixTransform.prototype.cloneMatrix = function(m) {
        return [m[0],m[1],m[2],m[3],m[4],m[5]];
    };
    
    MatrixTransform.prototype.save = function() {
        var matrix = this.cloneMatrix(this.getMatrix());
        this.stack.push(matrix);
        
        if (this.pencil) this.pencil.save(this.context);
    };

    MatrixTransform.prototype.restore = function() {
        if (this.stack.length > 0) {
            var matrix = this.stack.pop();
            this.setMatrix(matrix);
        }
        
        if (this.pencil) this.pencil.restore(this.context);
    };

    MatrixTransform.prototype.reset = function(){
        this.setMatrix(this.baseMatrix);
        this.setTransform(true);
    }

    MatrixTransform.prototype.setTransform = function(force) {
        if (this.pencil){
        	if(this.matrix != this.baseMatrix || force){
                this.pencil.setTransform(this.context,
                    this.matrix[0],
                    this.matrix[1],
                    this.matrix[2],
                    this.matrix[3],
                    this.matrix[4],
                    this.matrix[5]
                );
            }
        }
    };
    
    MatrixTransform.prototype.translate = function(x, y) {
        this.matrix[4] += this.matrix[0] * x + this.matrix[2] * y;
        this.matrix[5] += this.matrix[1] * x + this.matrix[3] * y;
    };
    
    MatrixTransform.prototype.rotate = function(rad) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        var m11 = this.matrix[0] * c + this.matrix[2] * s;
        var m12 = this.matrix[1] * c + this.matrix[3] * s;
        var m21 = this.matrix[0] * -s + this.matrix[2] * c;
        var m22 = this.matrix[1] * -s + this.matrix[3] * c;
        this.matrix[0] = m11;
        this.matrix[1] = m12;
        this.matrix[2] = m21;
        this.matrix[3] = m22;
    };

    MatrixTransform.prototype.scale = function(sx, sy) {
        this.matrix[0] *= sx;
        this.matrix[1] *= sx;
        this.matrix[2] *= sy;
        this.matrix[3] *= sy;
    };

    MatrixTransform.prototype.rotateAbout = function(rad, x, y) {
        this.translate(x, y);
        this.rotate(rad);
    };

    MatrixTransform.prototype.scaleAbout = function(scaleX, scaleY, x, y) {
        this.translate(x, y);
        this.scale(scaleX, scaleY);
    };
    
    MatrixTransform.prototype.identity = function() {
        this.m = this.baseMatrix;
    };

    MatrixTransform.prototype.multiply = function(matrix) {
        var m11 = this.matrix[0] * matrix.m[0] + this.matrix[2] * matrix.m[1];
        var m12 = this.matrix[1] * matrix.m[0] + this.matrix[3] * matrix.m[1];

        var m21 = this.matrix[0] * matrix.m[2] + this.matrix[2] * matrix.m[3];
        var m22 = this.matrix[1] * matrix.m[2] + this.matrix[3] * matrix.m[3];

        var dx = this.matrix[0] * matrix.m[4] + this.matrix[2] * matrix.m[5] + this.matrix[4];
        var dy = this.matrix[1] * matrix.m[4] + this.matrix[3] * matrix.m[5] + this.matrix[5];

        this.matrix[0] = m11;
        this.matrix[1] = m12;
        this.matrix[2] = m21;
        this.matrix[3] = m22;
        this.matrix[4] = dx;
        this.matrix[5] = dy;
    };

    MatrixTransform.prototype.invert = function() {
        var d = 1 / (this.matrix[0] * this.matrix[3] - this.matrix[1] * this.matrix[2]);
        var m0 = this.matrix[3] * d;
        var m1 = -this.matrix[1] * d;
        var m2 = -this.matrix[2] * d;
        var m3 = this.matrix[0] * d;
        var m4 = d * (this.matrix[2] * this.matrix[5] - this.matrix[3] * this.matrix[4]);
        var m5 = d * (this.matrix[1] * this.matrix[4] - this.matrix[0] * this.matrix[5]);
        this.matrix[0] = m0;
        this.matrix[1] = m1;
        this.matrix[2] = m2;
        this.matrix[3] = m3;
        this.matrix[4] = m4;
        this.matrix[5] = m5;
    };

    MatrixTransform.prototype.transformPoint = function(x, y) {
        return {
            x: x * this.matrix[0] + y * this.matrix[2] + this.matrix[4], 
            y: x * this.matrix[1] + y * this.matrix[3] + this.matrix[5]
        };
    };

	return MatrixTransform;
});