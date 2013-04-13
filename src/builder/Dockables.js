this.Dockable = function(){

	this._bound = false;
	this.currentXDock = null;
	this.currentYDock = null;

	this.relativeDock = function(x, y, static){
			var 
				wWidth = window.stage.width || window.innerWidth,
				wHeight = window.stage.height || window.innerHeight
			;
			
			if(x == x){
				if(x === "left"){
					this.x = 0;
				}
				else if(x === "mid"){
					this.x = (wWidth * 0.5)-(this.width *  0.5);
				}
				else if(x === "right"){
					this.x = wWidth - this.width;
				}
				else{
					this.x = (wWidth*0.01)*x;
				}
				this.currentXDock = "r"+x;
			}
			
			if(y == y){
				if(y === "top"){
					this.y = 0;
				}
				if(y === "mid"){
					this.y = (wHeight * 0.5) - (this.height * 0.5);
				}
				if(y === "bottom"){
					this.y = wHeight - this.height;
				}
				else{
					this.y = (wHeight*0.01)*y;
				}
				this.currentYDock = "r"+y;
			}
			
			if(!static){
				if(!this._bound){
					this._bound = true;
					window.addEventListener("resize", this.doDock);
				}
			}
	}
	
	this.absoluteDock = function(x, y, static){
			if(x == x){
				if(x < 0){
					x = (window.stage.width || window.innerWidth) - x;
				}
				this.x = x;
				this.currentXDock = "a" + x;
			}
			if(y == y){
				if(y < 0){
					y = (window.stage.height || window.innerHeight) - y;
				}
				this.y = y;
				this.currentYDock = "a" + y;
			}
			
			if(!static){
				if(!this._bound){
					this._bound = true;
					window.addEventListener("resize", this.doDock);
				}
			}
	}
	
	doDock = function(){
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
