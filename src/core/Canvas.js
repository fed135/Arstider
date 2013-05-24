Ar.prototype.Canvas = function (target, props) {
	
	var lastUpdate = Date.now();
	var lastRender = null;
	var thisRef = this;
	var froze = false;
	
	this.freeze = function() {
		froze = true;
	}
	
	this.unfreeze = function() {
		froze = false;
	}
	
	this.cnv = target;
	if(typeof target === "string" || target instanceof String) {
		this.cnv = document.getElementById(target);
	}
	
	this.ctx = this.cnv.getContext('2d');
	
	this._update=function() {
		lastUpdate = Date.now();
	}
	
	function _draw() {
		window.requestAnimFrame(_draw);
		
		if(froze === false) {
			if(thisRef.Container) {
				if((lastUpdate - lastRender)>0) {
					console.log("drawing...")
					var c = thisRef.Container.getChildren();
					for(var i = 0; i<c.length; i++) {
						if(c[i]._draw) {
							c[i]._draw(thisRef.ctx);
						}
					}
					lastRender = Date.now();
				}
			}
		}
	}

	_draw();
};
