Ar.prototype.FileSystem = new function() {
		
		var 
			thisRef = this,
			storedURLs = {},
			_tCB = null,
			fileSystem = null,
			errorHandler = Ar.error
		;
		
		//Vendor prefix the API references
		window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
		window.storageInfo = window.storageInfo || window.webkitStorageInfo;
		window.URL = window.URL || window.webkitURL;

		this.offline = false;					//Is in offline mode
		this.rootDir = "fs_001";				//Root directory on user's machine
		this.requestedMem = 1024;				//Default requested memory
		
		this.imgMem = 0;						//Number of downloaded/saved bytes
		
		//Requests permission for storage
		this.init = function(){
			window.storageInfo.requestQuota(PERSISTENT, (maxMem * 1024 * 1024), function(gb) {
				window.requestFileSystem(PERSISTENT, gb, function(fs) {
					fileSystem = fs;
					if(_tCB != null) {
						thisRef.ready(_tCB);
						_tCB = null;
					}
				}, errorHandler);
			}, errorHandler);
		}
		
		//Downloads/fetches an image from the storage
		this.download = function(url, success, progress, error) {
			
			var 
				xhr,
				blob,
				item
			; 
			
			if(storedURLs[url] != undefined) {
				if(success) {
					success(storedURLs[url]);
					return;
				}
			}
			
			if(thisRef.offline) {
				thisRef.readFile(url, success);
				return;
			}
			
			xhr = new XMLHttpRequest();
			xhr.open('GET', url, true); 
			xhr.responseType = 'blob';
			if(progress) {
				xhr.onprogress = function(e) {
					progress(e);
				}
			}
			
			xhr.onload = function () { 
				if (this.status == 200) {
					if (success) {
						blob = this.response;
						thisRef.imgMem += (parseInt(blob.size));
						item = new Image();	//TODO: support other media types
						item.onload = function(){
							//window.URL.revokeObjectURL(item.src);
							success(item);
							storedURLs[url] = item;
							return;
						};
						item.src = window.URL.createObjectURL(blob);
						//thisRef.save(this.response, url);
					}
				}
			};
			xhr.onerror = error || function(){};
			xhr.send(null);
		}
		
		this.revokeURLs = function(){
			for(var u in storedURLs){
				window.URL.revokeObjectURL(storedURLs[u].src);
				//TODO: decrease imgMem
			}
		}

		this.save = function(data, path) {

			fileSystem.root.getDirectory(thisRef.rootDir, {create:true}, function(dir){
				dir.getFile(path, {create: true}, function(fileEntry) {
					fileEntry.createWriter(function(writer) {
						writer.write(data);
					}, errorHandler);
				}, errorHandler);
			}, errorHandler);
		}

		this.readFile = function(path, success) {
			
			var
				item
			;
			
			fileSystem.root.getDirectory(thisRef.rootDir, {}, function(dir){
				dir.getFile(path, {}, function(fileEntry) {
					if (success) {
						item = new Image();	//TODO: support other media types
						item.src = fileEntry.toURL();
						success(item);
					}
				}, errorHandler);
			}, errorHandler);
		}
		
	this.clear = function() {
		root.getDirectory(thisRef.rootDir, {}, function(dir){
			dir.removeRecursively(function(e) {
				console.log("Files cleared!")
			},errorHandler);
		}, errorHandler);
	}
	
	this.ready = function(callback) {
		if(fileSystem != null) {
			callback(thisRef);
		}
		else {
			_tCB = callback;
		}
	}
	
	this.getFileExt = function(path) {
		path = path.toLowerCase();
		return path.substring(path.indexOf(".")+1);
	}
	/*
		function errorHandler(e) {
			var msg = '';
	
			switch (e.code) {
				case FileError.QUOTA_EXCEEDED_ERR:
					msg = 'QUOTA_EXCEEDED_ERR';
					break;
				case FileError.NOT_FOUND_ERR:
					msg = 'NOT_FOUND_ERR';
					break;
				case FileError.SECURITY_ERR:
					msg = 'SECURITY_ERR';
					break;
				case FileError.INVALID_MODIFICATION_ERR:
					msg = 'INVALID_MODIFICATION_ERR';
					break;
				case FileError.INVALID_STATE_ERR:
					msg = 'INVALID_STATE_ERR';
					break;
				default:
					msg = 'Unknown Error';
					break;
			};
	
			console.error('Error: ' + msg);
		}
		
		window.FileSystem = new FileSystem();
		
	})(window);*/
}();
	
