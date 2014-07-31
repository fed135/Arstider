define("Arstider/contexts/webgl/Texture", ["Arstider/Viewport"], function(Viewport){
	
	function Texture(context, program){

		this.context = context;
		this.program = program;

		this.positionLocation = this.context.getAttribLocation(this.program, "a_position");
		this.texCoordLocation = this.context.getAttribLocation(this.program, "a_texCoord");


        // provide texture coordinates for the rectangle.
        this.texCoordBuffer = this.context.createBuffer();
        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.texCoordBuffer);
        this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
        	0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0]), this.context.STATIC_DRAW);
        this.context.enableVertexAttribArray(this.texCoordLocation);
        this.context.vertexAttribPointer(this.texCoordLocation, 2, this.context.FLOAT, false, 0, 0);

        // Create a texture.
        this.texture = this.this.context.createTexture();
        this.context.bindTexture(this.context.TEXTURE_2D, this.texture);

        // Set the parameters so we can render any size image.
        this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
        this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
    	this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.LINEAR);
        this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.LINEAR);

        // lookup uniforms
        this.resolutionLocation = this.context.getUniformLocation(this.program, "u_resolution");

        // Create a buffer for the position of the rectangle corners.
        this.buffer = this.context.createBuffer();
        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.buffer);
      	
        this.setResolution(Viewport.maxWidth, Viewport.maxHeight);
	}

	Texture.prototype.setResolution = function(w, h){
		// set the resolution
        this.context.uniform2f(this.resolutionLocation, w, h);

        this.context.enableVertexAttribArray(this.positionLocation);
        this.context.vertexAttribPointer(this.positionLocation, 2, this.context.FLOAT, false, 0, 0);
	};

	return Texture;
});