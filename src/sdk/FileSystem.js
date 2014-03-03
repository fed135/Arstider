;(function(){
	
	var 
		singleton = null,
		empty = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
	;
	
		define("Arstider/FileSystem", ["Arstider/Buffer", "Arstider/Preloader", "Arstider/Events"], function (Buffer, Preloader, Events) {
			
			if(singleton != null) return singleton;
			
			function FileSystem(){
				this.stored = {};
				this.pending = [];
				this.retroMode = true;
				this.basePath = "";
				Events.bind("clearStoredAsset", this.clear);
			}
			
			FileSystem.prototype._updateInPending = function(url){
				var i = this.pending.length-1;
				for(i;i>=0;i--){
					if(url == this.pending[i].url){
						if(this.pending[i].callback){
							this.pending[i].callback(this.stored[url]);
						}
						this.pending.splice(i, 1);
					}
				}
			};
			
			FileSystem.prototype._findInPending = function(url){
				var i = this.pending.length-1;
				for(i;i>=0;i--){
					if(url == this.pending[i].url){
						return true;
					}
				}
				return false;
			};
			
			function Request(url, callback, progress, error){
				this.url = url;
				this.callback = callback;
				this.progress = progress;
				this.error = error;
			}
			
			FileSystem.prototype.blobToImage = function(name, blob, callback){
				var 
					thisRef = this, 
					blobUrl = null
				;
				
				if(this.stored[name] != null && this.stored[name] != null){
					Preloader.progress(name, 100);
					callback(this.stored[name]);
					thisRef._updateInPending(name);
					return;
				}
				
				if(blobUrl = window.URL.createObjectURL(blob)){
					thisRef.generateImage(name, blobUrl, callback);
				}
			};
			
			FileSystem.prototype.generateImage = function(name, path, callback){
				var 
					img = new Image(),
					thisRef = singleton
				;
				
				img.onerror = function(e){
					console.error("FileSystem :: Image error - "+name, e);
				};
				
				img.onload = function(){
					img.onload = null;
					img.onerror = null;
					
					if(thisRef.retroMode === false){
						window.URL.revokeObjectURL(img.src);
					}
					
					Preloader.progress(name, 100);
					
					callback(img);
				};
				img.src = encodeURI(path);
			};
			
			FileSystem.prototype.save = function(name, img){
				var
					canvas = Buffer.create(name),
					ctx = canvas.context2D()
				;
				
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img,0,0,canvas.width,canvas.height);
				
				this.stored[name] = canvas;
				img.src = empty;
			};
			
			FileSystem.prototype.download = function(url, success, progress, error){
				var 
					xhr, 
					blob, 
					item
				;
				
				Preloader.progress(url, 0);
				
				if(singleton.retroMode === true){
					singleton.generateImage(url, singleton.basePath+url, success);
				}
				else{
					xhr = new XMLHttpRequest();
					
					xhr.open('GET', singleton.basePath+url, true); 
					xhr.responseType = 'blob';
					
					xhr.onprogress = function(e) {
						if(progress) {
							progress(e);
						}
						Preloader.progress(url, Math.round((e.loaded/e.total)*100));
					};
					
					xhr.onload = function () { 
						if (this.status == 200) {
							if (success) {
								singleton.blobToImage(url, this.response, success);
							}
						}
					};
					
					xhr.onerror = function(e){
						console.error("Could not download image "+url);
						console.error(e);
					};
					
					xhr.send(null);
				}
			};
			
			FileSystem.prototype.downloadAndSave = function(url, success, progress, error){
				Preloader.progress(url, 0);
				
				if(singleton.stored[url] !== undefined){
					success(singleton.stored[url], true);
					singleton._updateInPending(url);
					Preloader.progress(url, 100);
					return;
				}
				
				if(singleton._findInPending(url)){
					singleton.pending.push(new Request(url, success, progress, error));
					return;
				}
				else{
					singleton.pending.push(new Request(url));
				}
				
				singleton.download(url, function(img){
					singleton.save(url, img);
					singleton._updateInPending(url);
				});
			};
			
			FileSystem.prototype.clear = function(name){
				singleton._updateInPending(name);
				if(singleton.stored[name]){
					delete singleton.stored[name];
				}
			};
			
			singleton = new FileSystem();
			return singleton;
		});
})();