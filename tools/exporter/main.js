function isInputDirSupported() {
    var tmpInput = document.createElement('input');
    if ('webkitdirectory' in tmpInput 
        || 'mozdirectory' in tmpInput 
        || 'odirectory' in tmpInput 
        || 'msdirectory' in tmpInput 
        || 'directory' in tmpInput) return true;
    return false;
}


//Hi there, entry point
//Lets see if your browser is supported
if(isInputDirSupported() == false) alert("Browser not supported !");
else{
	console.log("ok");
}