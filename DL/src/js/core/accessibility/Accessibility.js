//Accessibility Package
if(window.Ar == undefined) {
	window.Ar = { };
}

window.Ar.Accessibility = { };

//On document load
document.addEventListener("DOMContentLoaded", function() {
	Ar.parseDomAccData();
}

Ar.parseDomAccData = function() {
	//collect elements with data-ar_tab to assign them a quick tab-index access.
	
	//...
}
