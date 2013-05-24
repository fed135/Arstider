;(function(w) {
	var 
		fsTarget = w.document.createElement("div"),
		sheet,
		cssClass = "fs_scaled_element",
		requestFullscreen = (fsTarget.requestFullScreen)?"requestFullScreen":(fsTarget.mozRequestFullScreen)?"mozRequestFullScreen":(fsTarget.webkitRequestFullScreenWithKeys)?"webkitRequestFullScreenWithKeys":(fsTarget.webkitRequestFullScreen)?"webkitRequestFullScreen":"FullscreenError",
		cancelFullscreen =  (w.document.cancelFullScreen)?"cancelFullScreen":(w.document.mozCancelFullScreen)?"mozCancelFullScreen":(w.document.webkitCancelFullScreen)?"webkitCancelFullScreen":"FullscreenError"
	;
	
	fsTarget = null;
	
	function requireFS(ele, scale) {
		
		ele = ele || w.document;
		scale = scale || false;
		
		if(scale) {
			if(sheet == null) {
				sheet = document.createElement("style");
				document.getElementsByTagName("head")[0].appendChild(sheet);
				sheet = sheet.sheet || sheet.styleSheet;
				if (sheet.insertRule) {
					try {
						sheet.insertRule(".fs_scaled_element:-webkit-full-screen, .fs_scaled_element:-webkit-full-screen canvas{width:100%;height:100%;display:block;}", 0);
						sheet.insertRule(".fs_scaled_element:-moz-full-screen{width:100%;height:100%;display:block;}", 1);
					}
					catch(e){}
				} 
			}
			ele.classList.add(cssClass);
		}
		else {
			ele.classList.remove(cssClass);
		}
		return ele[requestFullscreen]();
	}
	
	function cancelFS() {
		return w.document[cancelFullscreen]();
	}
	
	w.requireFS = requireFS;
	w.cancelFS = cancelFS;
	
})(window);