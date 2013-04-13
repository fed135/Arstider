
}

	//Allow AMD definition of Arstider
	if (typeof define === "function" && define.amd) {
		define( "arstider", function () { return Ar; } );
	}
	else {
		window.Ar = Ar;
	}
})(window);