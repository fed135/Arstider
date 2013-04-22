this.Dockable = function(p){
	
	var
		_bound = false,
		_self = p
	;
	
	return {
		_packageName : "Dockable",
	
		currentXDock : null,
		currentYDock : null,

		relativeDock : function(x, y, static){
			
			if(!_self.parent) {
				systemError("Unable to dock an element with no parent.", _self);
				return false;
			}
		
			var 
				wWidth = _self.parent._width(),
				wHeight = _self.parent._height()
			;
			
			if(x == x){
				if(x === "left"){
					_self._x(0);
				}
				else if(x === "mid"){
					_self._x((wWidth * 0.5)-(_self._width() *  0.5));
				}
				else if(x === "right"){
					_self._x(wWidth - _self._width());
				}
				else{
					_self._x((wWidth*0.01)*x);
				}
				this.currentXDock = "r"+x;
			}
			
			if(y == y){
				if(y === "top"){
					_self._y(0);
				}
				if(y === "mid"){
					_self._y((wHeight * 0.5) - (_self._height() * 0.5));
				}
				if(y === "bottom"){
					_self._y(wHeight - _self._height());
				}
				else{
					_self._y((wHeight*0.01)*y);
				}
				this.currentYDock = "r"+y;
			}
			
			if(!static){
				if(!_bound){
					_bound = true;
					window.addEventListener("resize", this.doDock);
				}
			}
		},
	
		absoluteDock : function(x, y, static){
			
			if(!_self.parent) {
				systemError("Unable to dock an element with no parent.", _self);
				return false;
			}
			
			if(x == x){
				if(x < 0){
					_self._x(_self.parent._width() - x);
				}
				else {
					_self._x(x);
				}
				this.currentXDock = "a" + x;
			}
			if(y == y){
				if(y < 0){
					_self._y(_self.parent._height() - y);
				}
				else {
					_self._y(y);
				}
				this.currentYDock = "a" + y;
			}
			
			if(!static){
				if(!_bound){
					_bound = true;
					window.addEventListener("resize", this.doDock);
				}
			}
		},
	
		doDock : function(){
			if(this.currentXDock == this.currentXDock){
				if(this.currentXDock[0] === "r"){
					this.relativeDock(this.currentXDock.substring(1), null);
				}
				else if(this.currentXDock[0] === "a"){
					this.absoluteDock(this.currentXDock.substring(1), null);
				}
			}
			if(this.currentYDock == this.currentYDock){
				if(this.currentYDock[0] === "r"){
					this.relativeDock(null, this.currentYDock.substring(1));
				}
				else if(this.currentYDock[0] === "a"){
					this.absoluteDock(null, this.currentYDock.substring(1));
				}
			}
		}
	}
}
