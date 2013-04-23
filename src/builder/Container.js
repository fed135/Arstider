this.Container = function(p){
	//Private
	var
		children = [],
		currentIndex = 0,
		_self = p
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
		_packageName : "Container",
		
		addChild:function(/*(Clip) clip*/clip) {
			clip.parent = _self;
			clip.name = clip.name || Date.now();
			children[children.length]=clip;
			_self._update();
			return children.length-1;
		},
		removeChildByName:function(/*(String) name*/name) {
			var index = getChildIndexByName(name);
			if(index != -1) {
				children.splice(index,1);
				_self._update();
				return true;
			}
			return false;
		},
		removeChildAt:function(index) {
			var r = children.splice(index,1);
			_self._update();
			return r;
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
