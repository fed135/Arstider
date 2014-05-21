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
		singleton = null,
                
                /**
                 * Static reference to fragment shader type
                 * @private
                 * @const
                 * @type {string}
                 */
                SHADER_TYPE_FRAGMENT = "x-shader/x-fragment",
                
                /**
                 * Static reference to vertex shader type
                 * @private
                 * @const
                 * @type {string}
                 */
                SHADER_TYPE_VERTEX = "x-shader/x-vertex"
	;
	
	 /**
	 * Defines performance module
	 */	
	define( "Arstider/core/WEBGLRenderer", ["Arstider/Sprite", "Arstider/DisplayObject", "Arstider/TextField", "Arstider/core/Performance", "Arstider/Buffer", "Arstider/Shape", "Arstider/Request", "Arstider/Viewport"], /** @lends core/WEBGLRenderer */ function (Sprite, DisplayObject, TextField, Performance, Buffer, Shape, Request, Viewport){
		
		if(singleton != null) return singleton;
			
		/**
		 * Renderer class
	     * Every draw frame, this module is called upon to render every child of every container
	     * @class core/WEBGLRenderer
	     * @name core/WEBGLRenderer
		 * @constructor 
		 */
		function WEBGLRenderer(){
			
			/**
			 * Current frame rendering context target
			 * @private
			 * @type {CanvasRenderingContext2D|WebGLRenderingContext|null}
			 */
			this._context = null;
                        
                        /**
                         * Whether the webgl rendering method is enabled
                         * @type {boolean}
                         */
                        this.enabled = false;
                        
                        /**
                         * WEBGL context program
                         */
                        this.program = null;
                        
                        /**
                         * List of loader shader
                         * @private
                         * @type {Object}
                         */
                        this._shaders = {};
                }
                
                WEBGLRenderer.prototype.test = function(){
                    //disable for now 
                    return false;
                    
                    var testCnv = new Buffer({webgl:true});
                    
                    this.enabled = (testCnv.context != null);
                    
                    testCnv.kill();
                    
                    return this.enabled;
                };
                
                WEBGLRenderer.prototype.setShaders = function(vertex, fragment){
                    
                    if(!this.test()) return;
                    
                    if(!this._context){
                        if(Arstider.verbose > 0) console.warn("Arstider.WEBGLRenderer.setShaders: could not load shaders, no context initialized");
                        return;
                    }
                
                    var onFinish = function(){
                        this._createProgram(vertex, fragment);
                    };
                
                    this._loadShader(vertex, SHADER_TYPE_VERTEX, onFinish);
                    this._loadShader(fragment, SHADER_TYPE_FRAGMENT, onFinish);
                };
                
                WEBGLRenderer.prototype._createProgram = function(vertex, fragment){
                    var vertexShader = this.getShader(vertex);
                    var fragmentShader = this.getShader(fragment);
                    
                    if(vertexShader == null || fragmentShader == null) return;
                    
                    this.program = this._context.createProgram(this._context, [vertexShader, fragmentShader]);
                    this._context.attachShader(this.program, vertexShader);
                    this._context.attachShader(this.program, fragmentShader);
                    this._context.linkProgram(this.program);
                    this._context.useProgram(this.program);
                    
                    if (!this._context.getProgramParameter(this.program, this._context.LINK_STATUS)){
                        if(Arstider.verbose > 0) console.warn("Arstider.WEBGLRenderer.setShaders: could not initialise main shaders");
                        return;
                    }
                    
                    //create texture
                    var positionLocation = this._context.getAttribLocation(this.program, "a_position");
                    var texCoordLocation = this._context.getAttribLocation(this.program, "a_texCoord");

                    // provide texture coordinates for the rectangle.
                    var texCoordBuffer = this._context.createBuffer();
                    this._context.bindBuffer(this._context.ARRAY_BUFFER, texCoordBuffer);
                    this._context.bufferData(this._context.ARRAY_BUFFER, new Float32Array([
                        0.0,  0.0,
                        1.0,  0.0,
                        0.0,  1.0,
                        0.0,  1.0,
                        1.0,  0.0,
                        1.0,  1.0]), this._context.STATIC_DRAW);
                    this._context.enableVertexAttribArray(texCoordLocation);
                    this._context.vertexAttribPointer(texCoordLocation, 2, this._context.FLOAT, false, 0, 0);

                    // Create a texture.
                    var texture = this._context.createTexture();
                    this._context.bindTexture(this._context.TEXTURE_2D, texture);

                    // Set the parameters so we can render any size image.
                    this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_WRAP_S, this._context.CLAMP_TO_EDGE);
                    this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_WRAP_T, this._context.CLAMP_TO_EDGE);
                    this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_MIN_FILTER, this._context.NEAREST);
                    this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_MAG_FILTER, this._context.NEAREST);

                    // lookup uniforms
                    var resolutionLocation = this._context.getUniformLocation(this.program, "u_resolution");

                    // set the resolution
                    this._context.uniform2f(resolutionLocation, Viewport.maxWidth, Viewport.maxHeight);

                    // Create a buffer for the position of the rectangle corners.
                    var buffer = this._context.createBuffer();
                    this._context.bindBuffer(this._context.ARRAY_BUFFER, buffer);
                    this._context.enableVertexAttribArray(positionLocation);
                    this._context.vertexAttribPointer(positionLocation, 2, this._context.FLOAT, false, 0, 0);
                    return this.program;
                };
                
                WEBGLRenderer.prototype._loadShader = function(file, type, complete){
                    
                    if(this._shaders[file]){
                         complete.apply(this);
                         return;
                    }
                    
                    var req = new Request({
                        url:file,
                        cache:true,
                        track:true,
                        caller:this,
                        mimeOverride:"text",
                        async:false,
                        callback:function(res){
                            this._shaders[file] = {script: res, type: type};
                            complete.apply(this);
                        }
                    }).send();
                };
                
                WEBGLRenderer.prototype.getShader = function(id){
                    if(!this._context){
                        if(Arstider.verbose > 0) console.warn("Arstider.WEBGLRenderer.getShader: could not load shaders, no context initialized");
                        return;
                    }
                    
                    if(!this._shaders[id]) return null;
                    
                    var shader;
                    if(this._shaders[id].type === SHADER_TYPE_FRAGMENT){
                        shader = this._context.createShader(this._context.FRAGMENT_SHADER);
                    }
                    else if(this._shaders[id].type === SHADER_TYPE_VERTEX){
                        shader = this._context.createShader(this._context.VERTEX_SHADER);
                    }
                    else{
                        if(Arstider.verbose > 0) console.warn("Arstider.WEBGLRenderer.getShader: unrecognized shader type ", this._shaders[id].type);
                        return null;
                    }
                    
                    this._context.shaderSource(shader, this._shaders[id].script);
                    this._context.compileShader(shader);
                    
                    if (!this._context.getShaderParameter(shader, this._context.COMPILE_STATUS)) {
                        if(Arstider.verbose > 0) console.warn(this._context.getShaderInfoLog(shader));
                        return null;
                    }
                    
                    return shader;
                };
                
                WEBGLRenderer.prototype.setRectangle = function(x, y, width, height) {
                    if(!this._context){
                        if(Arstider.verbose > 0) console.warn("Arstider.WEBGLRenderer.setRectangle: no context initialized");
                        return;
                    }
                    
                    var x1 = x;
                    var x2 = x + width;
                    var y1 = y;
                    var y2 = y + height;
                    this._context.bufferData(this._context.ARRAY_BUFFER, new Float32Array([
                       x1, y1,
                       x2, y1,
                       x1, y2,
                       x1, y2,
                       x2, y1,
                       x2, y2]), this._context.STATIC_DRAW);
                };
                
                WEBGLRenderer.prototype.setShape = function(){
                    
                };
                
                WEBGLRenderer.prototype.renderChild = function(curChild, _currentX, _currentY){
                    if(!curChild || curChild.__skip) return;
				
			var 
				isComplex = false,	//Determines if geometrical transformations have been applied
				oldAlpha = null,	//Stores the old alpha of the context, if need be
				li = null,			//To loop through the element's children, if need be
				len = null,
				oldShadowColor,
				oldShadowBlur,
				oldShadowOffsetX,
				oldShadowOffsetY,
				shadowSafe,
				prevFill
			;
				
			Performance.elements++;
			
				
			if(curChild.alpha <= 0) return;
				
			if(
				(curChild.scaleX != 1) ||
				(curChild.scaleY != 1) ||
				(curChild.rotation != 0) ||
				(curChild.skewX != 0) ||
				(curChild.skewY != 0)
				) {
					
				isComplex = true;
				//this._context.save();
			}
				
			if(curChild.alpha != 1) {
				//oldAlpha = this._context.globalAlpha;
				//this._context.globalAlpha *= curChild.alpha;
			}
				
			_currentX += curChild.x;
			_currentY += curChild.y;
				
			if(isComplex) {
				//this._context.translate(_currentX+ (curChild.width * curChild.rpX),_currentY+ (curChild.height * curChild.rpY));
				//_currentX = -(curChild.width * curChild.rpX);
				//_currentY = -(curChild.height * curChild.rpY);
			}
				
			//Scale
			if((curChild.scaleX != 1) || (curChild.scaleY != 1)){
				//this._context.scale(curChild.scaleX, curChild.scaleY);
				Performance.transforms++;
			}
			//Rotation
			if (curChild.rotation != 0){
				//this._context.rotate(curChild.rotation*Arstider.degToRad);
				Performance.transforms++;
			}
			//Skey X
			if (curChild.skewX){
				//this._context.transform(1, 0, curChild.skewX, 1, 0, 0);
				Performance.transforms++;
			}
			//Skew Y
			if (curChild.skewY){
				//this._context.transform(1, curChild.skewY, 0, 1, 0, 0);
				Performance.transforms++;
			}
				
			//Runs pre-render method:
			if(this._preRender) this._preRender(curChild);
			
			//if(curChild.compositeMode != Arstider.defaultComposition) this._context.globalCompositeOperation = curChild.compositeMode;
			
			//if(curChild.mask === true) this._context.globalCompositeOperation = "destination-in";
				
			//Update globals
			if(curChild.global && curChild.parent){
				curChild.global.x = (isComplex)?(curChild.parent.global.x + curChild.x):_currentX;
				curChild.global.y = (isComplex)?(curChild.parent.global.y + curChild.y):_currentY;
				curChild.global.scaleX = curChild.scaleX * curChild.parent.scaleX;
				curChild.global.scaleY = curChild.scaleY * curChild.parent.scaleY;
				curChild.global.width = curChild.width * curChild.global.scaleX;
				curChild.global.height = curChild.height * curChild.global.scaleY;
				curChild.global.rotation = curChild.rotation + curChild.parent.rotation;
				curChild.global.alpha = curChild.alpha * curChild.parent.alpha;
			}
				
			//Shadow
			if(curChild.shadowColor != Arstider.defaultColor){
					
				//save old properties
				/*oldShadowColor = this._context.shadowColor;
				oldShadowBlur = this._context.shadowBlur;
				oldShadowOffsetX = this._context.shadowOffsetX;
				oldShadowOffsetY = this._context.shadowOffsetY;
					
				this._context.shadowColor = curChild.shadowColor;
				this._context.shadowBlur = curChild.shadowBlur;
				this._context.shadowOffsetX = curChild.shadowOffsetX;
				this._context.shadowOffsetY = curChild.shadowOffsetY;*/
			}
				
			//Render
			if(curChild.data){
				Performance.draws++;
				if(curChild.data._pattern || curChild instanceof Shape){
					/*prevFill = this._context.fillStyle;
					this._context.fillStyle = curChild.data._pattern;
                                        if(curChild instanceof Shape){
                                            curChild.render();
                                            this._context.fill();
                                        }
					else this._context.fillRect(Math.round(_currentX), Math.round(_currentY), curChild.width, curChild.height);
					this._context.fillStyle = prevFill;*/
				}
				else{
					//instanceof is pretty fast,  we want to leverage data offset rather than having an extra buffer for sprites.
					if(curChild instanceof Sprite || curChild.largeData === true){
						//this._context.drawImage((curChild.data instanceof Buffer)?curChild.data.data:curChild.data, curChild.xOffset, curChild.yOffset, curChild.dataWidth, curChild.dataHeight, Math.round(_currentX), Math.round(_currentY), curChild.width, curChild.height);
					}
					else{
						//this._context.drawImage((curChild.data instanceof Buffer)?curChild.data.data:curChild.data, Math.round(_currentX), Math.round(_currentY), curChild.width, curChild.height);
                                                this._context.texImage2D(this._context.TEXTURE_2D, 0, this._context.RGBA, this._context.RGBA, this._context.UNSIGNED_BYTE, (curChild.data instanceof Buffer)?curChild.data.data:curChild.data);
                                                this.setRectangle(Math.round(_currentX), Math.round(_currentY), curChild.width, curChild.height);
                                                this._context.drawArrays(this._context.TRIANGLES, 0, 6);
					}
				}
			}
                        
                        if(curChild.draw) curChild.draw();
				
			if(this._showBoxes || curChild.showOutline === true){
				/*shadowSafe = this._context.shadowColor;
				this._context.shadowColor = "transparent";
				var prevAlpha = this._context.globalAlpha;
				this._context.globalAlpha = 0.7;
				this._context.lineWidth = 1;
				if(curChild instanceof Sprite) this._context.strokeStyle = "blue";
				else if(curChild instanceof TextField) this._context.strokeStyle = "green";
				else if(curChild instanceof DisplayObject) this._context.strokeStyle = "red";
				else this._context.strokeStyle = "yellow";
					
				this._context.strokeRect(Math.round(_currentX), Math.round(_currentY), curChild.width, curChild.height);
				this._context.globalAlpha = prevAlpha;
				this._context.shadowColor = shadowSafe;*/
			}
				
			//runs post-render methods
			if(this._postRender) this._postRender(curChild);
				
			//Render Children
			if(curChild.children){
				if(curChild.children.length > 0) {
					len = curChild.children.length;
					for(li=0; li<len; li++){
						if(curChild.children[li]){
							this.renderChild(curChild.children[li], _currentX, _currentY);
						}
					}
				}
			}
				
			//Restore
			//if(oldAlpha !== null) this._context.globalAlpha = oldAlpha;
			//if(curChild.compositeMode != Arstider.defaultComposition) this._context.globalCompositeOperation = Arstider.defaultComposition;
			//if(isComplex) this._context.restore();
			/*else{
				if(curChild.shadowColor != Arstider.defaultColor){
					this._context.shadowColor = oldShadowColor;
					this._context.shadowBlur = oldShadowBlur;
					this._context.shadowOffsetX = oldShadowOffsetX;
					this._context.shadowOffsetY = oldShadowOffsetY;
				}
			}*/
                };
                
                WEBGLRenderer.prototype.draw = function(eng, rootChild, pre, post, showBoxes){
                    this._preRender = pre;
                    this._postRender = post;
                    this._showBoxes = showBoxes;
			
                    this.renderChild(rootChild, 0, 0);
                    Performance.frames++;
                };
                
                singleton = new WEBGLRenderer();
		return singleton;
	});
})();                  