define("Arstider/contexts/webgl/Texture", [], function(){
	
	function Texture(context, program){

		this.context = context;
		this.program = program;
	}

    Texture.prototype.update = function(data){

        var texCoordLocation = this.context.getAttribLocation(this.program, "a_texCoord");

        // provide texture coordinates for the rectangle.
        var texCoordBuffer = this.context.createBuffer();
        this.context.bindBuffer(this.context.ARRAY_BUFFER, texCoordBuffer);
        this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0]), this.context.STATIC_DRAW);
        this.context.enableVertexAttribArray(texCoordLocation);
        this.context.vertexAttribPointer(texCoordLocation, 2, this.context.FLOAT, false, 0, 0);

        //this.context.activeTexture(this.context.TEXTURE0);
        // Create a texture.
        this.texture = this.context.createTexture();
        this.context.bindTexture(this.context.TEXTURE_2D, this.texture);

        // Set the parameters so we can render any size image.
        this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, (this.context.renderStyle == "sharp")?this.context.NEAREST:this.context.LINEAR);
        this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, (this.context.renderStyle == "sharp")?this.context.NEAREST:this.context.LINEAR);

        //if(Arstider.powerOf2(data.width) && Arstider.powerOf2(data.height)){
            this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
            this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
        /*}
        else{
            this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.REPEAT);
            this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.REPEAT);
        }*/

        this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.context.RGBA, this.context.UNSIGNED_BYTE, data);
    };

	return Texture;
});