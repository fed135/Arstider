define("Arstider/core/Profiler", [], function(){
	
	function styleAsButton(element){
		element.style.position = "relative";
		element.style.display = "block";
		//element.style.width = "16px";
		element.style.height = "16px";
		element.style.padding = "1px";
		element.style.paddingRight = "2px";
		element.style.paddingLeft = "2px";
		element.style.marginTop = "2px";
		element.style.marginRight = "10px";
		element.style.fontSize = "14px";
		element.style.fontFamily = "Arial";
		element.style.fontWeight = "bold";
		element.style.backgroundColor = "#999";
		element.style.border = "2px solid #def";
		element.style.color = "#070a0f";
		element.style.float = "right";
		element.style.cursor = "pointer";
		element.style.textAlign = "center";
		element.style.borderRadius = "2px";
		
		element.onmouseover = function(){
			this.style.backgroundColor = "#bcc";
		};
		
		element.onmouseout = function(){
			this.style.backgroundColor = "#999";
		};
		
		return element;
	}
	
	/**
	 * Profiler bar
	 */
	var profiler = document.createElement("div");
	profiler.id = "_ArstiderProfiler";
	profiler.style.position = "fixed";
	profiler.style.display = "block";
	profiler.style.width = "100%";
	//profiler.style.height = "24px";
	//profiler.style.overflow = "hidden";
	profiler.style.left = "0px";
	profiler.style.zIndex = "9001";
	profiler.style.bottom = "0px";
	profiler.style.padding = "3px";
	profiler.style.fontSize = "10px";
	profiler.style.fontFamily = "Arial";
	profiler.style.backgroundColor = "black";
	profiler.style.opacity = "0.7";
	profiler.style.color = "white";
	profiler.style.cursor = "default";
	profiler.collapsed = true;
	profiler.currentTab = "draw";
	
	/**
	 * Close button
	 */
	var closeProfiler = document.createElement("div");
	closeProfiler.id = "_ArstiderProfilerCloseBtn";
	styleAsButton(closeProfiler);
	closeProfiler.onclick = function(){profiler.style.display = "none";};
	closeProfiler.innerHTML = "X";
	profiler.appendChild(closeProfiler);
	
	/**
	 * Toggle button
	 */
	var toggleProfiler = document.createElement("div");
	toggleProfiler.id = "_ArstiderProfilerToggleBtn";
	styleAsButton(toggleProfiler);
	toggleProfiler.onclick = function(){
		profiler.collapsed = !profiler.collapsed;
		if(profiler.collapsed){
			toggleProfiler.innerHTML = "Expend";
			details.style.display = "none";
		}
		else{
			toggleProfiler.innerHTML = "Collapse";
			details.style.display = "block";
		}
	};
	toggleProfiler.innerHTML = "Expend";
	profiler.appendChild(toggleProfiler);
	
	/**
	 * Drawing tab
	 */
	var drawTab = document.createElement("div");
	drawTab.id = "_ArstiderProfilerDrawTab";
	styleAsButton(drawTab);
	drawTab.style.float = "left";
	drawTab.onclick = function(){
		profiler.currentTab = "draw";
		details.innerHTML = "";
	};
	drawTab.innerHTML = "Drawing";
	profiler.appendChild(drawTab);
	
	/**
	 * Memory tab
	 */
	var memTab = document.createElement("div");
	memTab.id = "_ArstiderProfilerMemoryTab";
	styleAsButton(memTab);
	memTab.style.float = "left";
	memTab.onclick = function(){
		profiler.currentTab = "memory";
		details.innerHTML = "";
	};
	memTab.innerHTML = "Memory";
	profiler.appendChild(memTab);
	
	var details = document.createElement("div");
	details.style.width = "100%";
	details.style.height = "300px";
	details.style.overflowY = "auto";
	details.style.overflowX = "hidden";
	details.style.borderTop = "1px solid #333";
	details.style.display = "none";
	details.style.position = "relative";
	
	profiler.detailsTab = details;
	profiler.appendChild(details);
	
	return profiler;
});
