this.DisplayObjectContainer = function(){
	//Private
	var
		children = [],
		currentIndex = 0
	;
	
	function getChildIndexByName(/*(String) name*/name) {
		for(var i=0; i<children.length; i++) {
			if(children[i].name == clip) {
				return i;
			}
		}
		return -1;
	}
	
	//Public
	return {
		constructor:function(index) {
			currentIndex = index;
		},
		addChild:function(/*(Clip) clip*/clip) {
			clip.parent = this;
			clip.name = clip.name || Date.now();
			children[children.length]=clip;
			return children.length-1;
		},
		removeChildByName:function(/*(String) name*/name) {
			var index = getChildIndexByName(name);
			if(index != -1) {
				children.splice(index,1);
				return true;
			}
			return false;
		},
		removeChildAt:function(index) {
			return children.splice(index,1);
		},
		getChildByName:function(name) {
			var index = getChildIndexByName(name);
			if(index != -1) {
				return children[index];
			}
			return null;
		},
		getChildren:function() {
			return children;
		},
		getChildAt:function() {
			return children[index];
		}/*,
		//Should be to set own index in parent
		setIndex:function(index) {
			if(parent.
		}*/
	}
}
