;(function(window) {

	var FileSystem = function(maxMem) {
		
		var 
			thisRef = this,
			maxMem = (maxMem)?parseInt(maxMem):1024,
			storedURLs = {}
		;
		
		window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
		window.storageInfo = window.storageInfo || window.webkitStorageInfo;
		window.URL = window.URL || window.webkitURL;

		this.fileSystem = null;
		this._tCB = null;
		this.offline = false;
		this.root = "fs_001";
		
		this.imgMem = 0;

		window.storageInfo.requestQuota(PERSISTENT, (maxMem * 1024 * 1024), function(gb) {
			window.requestFileSystem(PERSISTENT, gb, function(fs) {
				thisRef.fileSystem = fs;
				if(thisRef._tCB != null) {
					thisRef.ready(thisRef._tCB);
					thisRef._tCB = null;
				}
			}, errorHandler);
		}, errorHandler);
		
		this.downloadImg = function(url, success, progress, error) {
			
			var 
				xhr,
				blob,
				img
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
						img = new Image();
						img.onload = function(){
							//window.URL.revokeObjectURL(img.src);
							success(img);
							storedURLs[url] = img;
							return;
						};
						img.src = window.URL.createObjectURL(blob);
						//thisRef.saveImg(this.response, url);
					}
				}
			};
			xhr.onerror = error || function(){};
			xhr.send(null);
		}

		this.saveImg = function(data, path) {

			thisRef.fileSystem.root.getDirectory(thisRef.root, {create:true}, function(dir){
				dir.getFile(path, {create: true}, function(fileEntry) {
					fileEntry.createWriter(function(writer) {
						writer.write(data);
					}, errorHandler);
				}, errorHandler);
			}, errorHandler);
		}

		this.readFile = function(path, success) {
			
			var
				img
			;
			
			thisRef.fileSystem.root.getDirectory(thisRef.root, {}, function(dir){
				dir.getFile(path, {}, function(fileEntry) {
					if (success) {
						img = new Image();
						img.src = fileEntry.toURL();
						success(img);
					}
				}, errorHandler);
			}, errorHandler);
		}
		
		this.clear = function() {
			thisRef.fileSystem.root.getDirectory(thisRef.root, {}, function(dir){
				dir.removeRecursively(function(e) {
					console.log("Files cleared!")
				},errorHandler);
			}, errorHandler);
		}
		
		this.ready = function(callback) {
			if(thisRef.fileSystem != null) {
				callback(thisRef);
			}
			else {
				thisRef._tCB = callback;
			}
		}
		
		this.getFileExt = function(path) {
			path = path.toLowerCase();
			return path.substring(path.indexOf(".")+1);
		}
	}
	
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
	
})(window);