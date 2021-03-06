/**
 * Profiler
 * TODO: Make it prettier and cleaner
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the profiler module
 */
define("Arstider/core/Profiler", ["Arstider/Browser"], /** @lends core/Profiler */ function(Browser){
	/** 
     * Profiler class
     * The visual profiler UI
     * @class core/Profiler
     */
	
	/**
	 * Applies the styles of a profiler button to an element
	 */
	function styleAsButton(element){
		element.style.position = "relative";
		element.style.display = "block";
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
		element.style.cssFloat = "right";
		element.style.cursor = "pointer";
		element.style.textAlign = "center";
		element.style.borderRadius = "2px";
		element.style.maxWidth = "80px";
		
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
	var profiler = window.document.createElement("div");
	profiler.id = "_ArstiderProfiler";
	profiler.style.position = "fixed";
	profiler.style.display = "block";
	profiler.style.width = "100%";
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
	profiler.minibar = window.document.createElement("div");
	
	if(!Browser.isMobile){
		/**
		 * Close button
		 */
		var closeProfiler = window.document.createElement("div");
		closeProfiler.id = "_ArstiderProfilerCloseBtn";
		styleAsButton(closeProfiler);
		closeProfiler.onclick = function(){profiler.style.display = "none";};
		closeProfiler.innerHTML = "X";
		profiler.appendChild(closeProfiler);
		
		/**
		 * Toggle button
		 */
		var toggleProfiler = window.document.createElement("div");
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
		var drawTab = window.document.createElement("div");
		drawTab.id = "_ArstiderProfilerDrawTab";
		styleAsButton(drawTab);
		drawTab.style.cssFloat = "left";
		drawTab.onclick = function(){
			profiler.currentTab = "draw";
			details.innerHTML = "";
		};
		drawTab.innerHTML = "Drawing";
		profiler.appendChild(drawTab);
		
		/**
		 * Memory tab
		 */
		var memTab = window.document.createElement("div");
		memTab.id = "_ArstiderProfilerMemoryTab";
		styleAsButton(memTab);
		memTab.style.cssFloat = "left";
		memTab.onclick = function(){
			profiler.currentTab = "memory";
			details.innerHTML = "";
		};
		memTab.innerHTML = "Memory";
		profiler.appendChild(memTab);
	
		var details = window.document.createElement("div");
		details.style.width = "100%";
		details.style.height = "300px";
		details.style.overflowY = "auto";
		details.style.overflowX = "hidden";
		details.style.borderTop = "1px solid #333";
		details.style.display = "none";
		details.style.position = "relative";
		
		profiler.detailsTab = details;
		profiler.appendChild(details);
	}
	
	profiler.minibar.id = "_ArstiderProfilerMinibar";
	profiler.minibar.style.position = "relative";
	profiler.minibar.style.display = "block";
	profiler.minibar.style.cssFloat = "left";
	profiler.minibar.style.paddingTop = "5px";
	profiler.minibar.style.fontSize = "12px";
	profiler.appendChild(profiler.minibar);
	
	return profiler;
});
