define("Arstider/contexts/webgl/Program", ["Arstider/contexts/webgl/Shader", "Arstider/contexts/webgl/Texture"], function(Shader, Texture){
	
	function Program(context){
		this.program = null;
		this.vertexShader = null;
		this.fragmentShader = null;

        this.context = context;
        this.context.__program = {loaded:false};

        this.texture;

        this.compileCallback = Arstider.emptyFunction;
	}

	Program.prototype.setShaders = function(vertex, fragment, callback){
        var thisRef = this;

        this.compileCallback = callback;

        Shader.get("vertex", vertex, function vertexShaderLoaded(v){
            thisRef._compileShader.apply(thisRef, [v]);
        });

        Shader.get("fragment", fragment, function fragmentShaderLoaded(f){
            thisRef._compileShader.apply(thisRef, [f]);
        });
	};

	Program.prototype._compileShader = function(shader){
        var shader;

        if(shader.type === "fragment"){
            this.fragmentShader = this.context.createShader(this.context.FRAGMENT_SHADER);
            this.context.shaderSource(this.fragmentShader, shader.script);
            this.context.compileShader(this.fragmentShader);
                        
            if (!this.context.getShaderParameter(this.fragmentShader, this.context.COMPILE_STATUS)) {
                if(Arstider.verbose > 0) console.warn("Arstider.contexts.webgl.Program : ", this.context.getShaderInfoLog(this.fragmentShader));
                return null;
            }
        }
        else if(shader.type === "vertex"){
            this.vertexShader = this.context.createShader(this.context.VERTEX_SHADER);
            this.context.shaderSource(this.vertexShader, shader.script);
            this.context.compileShader(this.vertexShader);
                        
            if (!this.context.getShaderParameter(this.vertexShader, this.context.COMPILE_STATUS)) {
                if(Arstider.verbose > 0) console.warn("Arstider.contexts.webgl.Program : ", this.context.getShaderInfoLog(this.vertexShader));
                return null;
            }
        }

        this._compile();
	}

    Program.prototype._compile = function(){
        if(this.vertexShader == null || this.fragmentShader == null) return;

        this.program = this.context.createProgram(this.context, [this.vertexShader, this.fragmentShader]);
        this.context.__program = this.program;

        this.context.attachShader(this.program, this.vertexShader);
        this.context.attachShader(this.program, this.fragmentShader);
        this.context.linkProgram(this.program);
        this.context.useProgram(this.program);

        this.program.texture = new Texture(this.context, this.program);

        this.compileCallback();
    };

	return Program;
});