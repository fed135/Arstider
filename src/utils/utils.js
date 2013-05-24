Object.prototype.extend = function(extentions) {
	if(typeof extentions === "function" || extentions instanceof Function) {
		extentions = [extentions];
	}
	
	if(extentions.push) {
		var t = null;
		for(var i = 0; i < extentions.length; i++) {
			if(typeof extentions[i] === "function" || extentions[i] instanceof Function) {
				t = new extentions[i](this);
				this[t._packageName] = t;
			}
		}
	}
	
	return this;
};