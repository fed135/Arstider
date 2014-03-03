;(function(){
	var 
		singleton = null, 
		anonymousBuffers = 0,
		modes={SHARP:0, AUTO:1}
	;
	
	/**
	 * Creates the buffer tag and applies the current manager settings.
	 * Also takes care of adding the context2D method 
	 *
	 * @private
	 * @param {String} name The name that will be associated with the buffer in the manager's list
	 * @param {modes.SHARP | modes.AUTO} renderMode The render mode for the canvas taken from the manager setting _renderMode
	 * @returns {HTMLCanvasElement} The new buffer
	 */
	function createBuffer(name, renderMode){
		var buffer = document.createElement("canvas");
		buffer.width = 1136;
		buffer.height = 672;
		buffer.name = name;
		buffer._renderMode = renderMode;
		
		setRenderStyle(buffer);
		
		//Encouraged method to get context
		buffer.context2D = function(){
			if(singleton._ctxPool[name] != undefined){
				return singleton._ctxPool[name];
			}
			else{
				singleton._ctxPool[name] = buffer.getContext('2d');
				setImageSmoothing(buffer, buffer._renderMode == modes.AUTO);
				return singleton._ctxPool[name];
			}
		};
		
		return buffer;
	}
	
	/**
	 * Sets image smoothing for canvas contexts 
	 *
	 * @private
	 * @param {2DContext} ctx The context to switch the smoothing mode on
	 * @param {Boolean} val Image smoothing activated
	 */
	function setImageSmoothing(ctx, val){
		var attr = 'imageSmoothingEnabled', uc = attr.charAt(0).toUpperCase() + attr.substr(1);
		ctx[attr] = ctx['ms'+uc] = ctx['moz'+uc] = ctx['webkit'+uc] = ctx['o'+uc] = val;
	}
	
	/**
	 * Set render style for canvas tags 
	 *
	 * @private
	 * @param {HTMLCanvasElement} cnv Applies the imageRendering style from the tag's _renderMode property
	 */
	function setRenderStyle(cnv){
		if(cnv._renderMode === modes.SHARP){
			cnv.style.imageRendering = '-moz-crisp-edges';
			cnv.style.imageRendering = '-o-crisp-edges';
			cnv.style.imageRendering = '-webkit-optimize-contrast';
			cnv.style.imageRendering = 'crisp-edges';
			cnv.style.msInterpolationMode = 'nearest-neighbor';
		}
		else if(cnv._renderMode === modes.AUTO){
			cnv.style.imageRendering = 'auto';
		}
	}
	
	define("Arstider/Buffer", ["Arstider/Events"], function(Events){
			
		if(singleton != null) return singleton;
			
		/**
		 * Creates an instance of Buffer manager (singleton).
		 *
		 * @constructor
		 * @this {Buffer}
		 */
		function Buffer(){
			this._renderMode = modes.AUTO;
			this._pool = {};
			this._ctxPool = {};
		}
			
		/**
		 * Returns the number of buffers
		 *
		 * @this {Buffer}
		 * @returns {int} The number of buffers
		 */
		Buffer.prototype.count = function(){
			var ret = 0;
			for(var b in this._pool){
				if(this._pool[b] && this._pool[b].context2D){
					ret++;
				}
			}
			return ret;
		};
			
		/**
		 * Sets the rendering mode for one or all buffers 
		 *
		 * @this {Buffer}
		 * @param {String} target Can target a specific buffer to change the mode on | {mode.SHARP | mode.AUTO} target -> type Type of rendering, effects all buffers if only type was specified 
		 */
		Buffer.prototype.setRenderMode = function(target, type){
				
			if(type == undefined){
				//Apply to all
				type = target;
				
				target = this._pool;
				//Can safely remove contexts without impacting the buffer content
				//They will get regenerated on demand
				this._ctxPool = {};
				this._renderMode = modes[type]; //Only applies to new buffers
			}
			else{
				target = {target:this._pool[target]};
				delete this._ctxPool[target];
			}
			
			if(!(type in modes)){
				console.warn("Cannot set render mode "+type+". Must be SHARP or AUTO");
				return false;
			}
				
			for(var b in target){
				if(b != "Inherit"){
					target[b]._renderMode = modes[type];
					setRenderStyle(target[b]);
				}
			};
		};
			
		/**
		 * Returns the desired buffer or the whole list
		 *
		 * @this {Buffer}
		 * @param {String} name Optional. The name of the desired buffer, or leave empty for all buffers
		 * @returns {HTMLCanvasElement} The selected buffer(s)
		 */
		Buffer.prototype.get = function(name){
			if(name && this._pool[name] != undefined){
				return this._pool[name]
			}
			else if(name && this._pool[name] == undefined){
				return null;
			}
			else if(!name){
				return this._pool;
			}
			return null;
		};
			
		/**
		 * Creates a buffer with the manager's configuration and adds it to the list.
		 *
		 * @this {Buffer}
		 * @param {String} name Optional. The name of the desired buffer.
		 * @returns {HTMLCanvasElement} The newly created buffer.
		 */
		Buffer.prototype.create = function(name){
			if(name && this._pool[name] != undefined){
				this._pool[name]._renderMode = this._renderMode;
				setRenderStyle(this._pool[name]);
				this._pool[name].context2D().clearRect(0,0,this._pool[name].width,this._pool[name].height);
				return this._pool[name];
			}
			else if(name && this._pool[name] == undefined){
				this._pool[name] = createBuffer(name, this._renderMode);
				return this._pool[name];
			}
			anonymousBuffers++;
			this._pool["buffer"+anonymousBuffers] = createBuffer("buffer"+anonymousBuffers, this._renderMode);
			return this._pool["buffer"+anonymousBuffers];
		};
		
		/**
		 * Kills a buffer along with it's Context
		 *
		 * @this {Buffer}
		 * @param {String} name The name of the desired buffer.
		 */
		Buffer.prototype.kill = function(name){
			if(name && this._pool[name] != undefined){
				delete this._pool[name];
			}
			if(name && this._ctxPool[name] != undefined){
				delete this._ctxPool[name];
			}
			
			Events.broadcast("clearStoredAsset",name);
		};
			
		/**
		 * Gets the approximate memory space occupied by the list of Buffers
		 *
		 * @this {Buffer}
		 * @returns {String} The mem print with unit.
		 */
		Buffer.prototype.getMemInfo = function(){
			var mem = 0;
			var hexSize = 8;
			for(var i  in this._pool){
				if(this._pool[i] && this._pool[i].context2D){
					mem+=((this._pool[i].height * this._pool[i].width * hexSize) >> 10);
				}
			}
			return (mem / 1024).toFixed(2) +"m";
		};
			
		singleton = new Buffer();
		return singleton;
	});
})();