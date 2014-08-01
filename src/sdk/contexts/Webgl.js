/**
 * WEB-GL 2D Renderer
 * 
 * @version 1.1.4
 * @author frederic charette <fredericcharette@gmail.com>
 */

;(function(){
	
	var
		/**
		 * Singleton static
	 	 * @private
	 	 * @type {Renderer|null}
	 	 */
		singleton = null
	;
	
	 /**
	 * Defines performance module
	 */	
	define( "Arstider/contexts/Webgl", ["Arstider/contexts/webgl/Program"], /** @lends contexts/Webgl */ function (Program){
		
		if(singleton != null) return singleton;
			
		/**
		 * Renderer class
	     * Every draw frame, this module is called upon to render every child of every container
	     * @class contexts/Webgl
	     * @name contexts/Webgl
		 * @constructor 
		 */
		function Webgl(){
			
            this.enabled = true;

            this.program;

            this.context;
        }

        Webgl.prototype.init = function(context, callback){

            this.context = context.canvas.buffer.getContext();

            if(!this.context.__program){
                this.program = new Program(context);
                this.program.setShaders(context.canvas.buffer.vertexShader, context.canvas.buffer.fragmentShader, callback);
            }
            else{
                this.program = this.context.__program;
                if(callback) callback();
            }
        };
                
        Webgl.prototype._setRectangle = function(x, y, width, height) {
            if(!this.context){
                if(Arstider.verbose > 0) console.warn("Arstider.Webgl.setRectangle: no context initialized");
                return;
            }
                    
            var x1 = x;
            var x2 = x + width;
            var y1 = y;
            var y2 = y + height;
            this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array([
                x1, y1,
                x2, y1,
                x1, y2,
                x1, y2,
                x2, y1,
                x2, y2]), this.context.STATIC_DRAW);
        };

        Webgl.prototype.setCompositionMode = function(){

        };

        Webgl.prototype.debugOutline = function(){

        };

        Webgl.prototype.dropShadow = function(){

        };

        Webgl.prototype.transform = function(){

        };
                
        Webgl.prototype.translate = function(){

        };

        Webgl.prototype.rotate = function(){

        };

        Webgl.prototype.alpha = function(){

        };

        Webgl.prototype.save = function(){

        };

        Webgl.prototype.restore = function(){

        };

        Webgl.prototype.clear = function(){
            this.context.clear(this.context.COLOR_BUFFER_BIT);
        };
                
        Webgl.prototype.renderAt = function(data, x, y, width, height, pX, pY, destWidth, destHeight){
            pX = Arstider.checkIn(pX, x);
            py = Arstider.checkIn(pY, y);
            destWidth = Arstider.checkIn(destWidth, width);
            destHeight = Arstider.checkIn(destHeight, height);

            this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.context.RGBA, this.context.UNSIGNED_BYTE, data);
            this._setRectangle(pX, pY, destWidth, destHeight);
            this.context.drawArrays(this.context.TRIANGLES, 0, 6);
		};
                
        singleton = new Webgl();
		return singleton;
	});
})();                  