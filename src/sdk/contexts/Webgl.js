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
	define( "Arstider/contexts/Webgl", ["Arstider/contexts/webgl/Program"], /** @lends contexts/Webgl */ function (Program, Viewport){
		
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
        }

        Webgl.prototype.init = function(context, callback){

            if(!context.__program){
                context.__program = new Program(context);
                context.__program.setShaders(context.canvas.buffer.vertexShader, context.canvas.buffer.fragmentShader, callback);
            }
            else{
                if(!context.__program.ready){
                    context.__program.compileCallback = callback;
                }
                else{
                    if(callback) callback();
                }
            }
        };
                
        Webgl.prototype._setRectangle = function(context, x, y, width, height) {
            var x1 = x;
            var x2 = x + width;
            var y1 = y;
            var y2 = y + height;
            context.bufferData(context.ARRAY_BUFFER, new Float32Array([
                x1, y1,
                x2, y1,
                x1, y2,
                x1, y2,
                x2, y1,
                x2, y2]), context.STATIC_DRAW);
        };

        Webgl.prototype.setCompositionMode = function(){

        };

        Webgl.prototype.debugOutline = function(){

        };

        Webgl.prototype.dropShadow = function(){

        };

        Webgl.prototype.transform = function(){
            //gl.uniformMatrix3fv(shader.translationMatrix, false, this.worldTransform.toArray(true));
            //gl.uniform2f(shader.projectionVector, projection.x, -projection.y);
            //gl.uniform2f(shader.offsetVector, -offset.x, -offset.y);
            //gl.uniform1f(shader.alpha, 1);
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

        Webgl.prototype.clear = function(context){
            context.clear(context.COLOR_BUFFER_BIT);
        };

        Webgl.prototype._prepareAttribs = function(context){
            var resolutionLocation = context.getUniformLocation(context.__program.program, "u_resolution");
            context.uniform2f(resolutionLocation, context.canvas.width, context.canvas.height);

            // look up where the vertex data needs to go.
            var positionLocation = context.getAttribLocation(context.__program.program, "a_position");

            // Create a buffer and put a single clipspace rectangle in
            // it (2 triangles)
            var buffer = context.createBuffer();
            context.bindBuffer(context.ARRAY_BUFFER, buffer);
            context.bufferData(
                context.ARRAY_BUFFER, 
                new Float32Array([
                    -1.0, -1.0, 
                     1.0, -1.0, 
                    -1.0,  1.0, 
                    -1.0,  1.0, 
                     1.0, -1.0, 
                     1.0,  1.0]), 
                context.STATIC_DRAW);
            context.enableVertexAttribArray(positionLocation);
            context.vertexAttribPointer(positionLocation, 2, context.FLOAT, false, 0, 0);

            
        };
                
        Webgl.prototype.renderAt = function(context, data, x, y, width, height, pX, pY, destWidth, destHeight){
            //context.viewport(0,0,context.canvas.width, context.canvas.height);

            this._prepareAttribs(context);

            pX = Arstider.checkIn(pX, x);
            py = Arstider.checkIn(pY, y);
            destWidth = Arstider.checkIn(destWidth, width);
            destHeight = Arstider.checkIn(destHeight, height);

            context.__program.texture.update(data, destWidth, destHeight);

            this._setRectangle(context, pX, pY, destWidth, destHeight);
            context.drawArrays(context.TRIANGLES, 0, 6);
		};
                
        singleton = new Webgl();
		return singleton;
	});
})();                  