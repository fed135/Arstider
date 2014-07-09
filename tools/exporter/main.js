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
	window.availableModules = {};
	window.selectedModules = [];
	window.loadedModules = {};

	$(document).ready(function(){
		$("#linkSrcBtn").on("change", function(e){
			reset();
			uploadFile(document.getElementById("linkSrcBtn"));
		});

		$("#resetBtn").click(reset);

		$("#exportBtn").click(createExport);

		$("body").on("click", ".module", function(){
			$(this).toggleClass("expended")
		});

		$("body").on("click", ".pushLeft", function(e){
			e.stopPropagation();
			var key = $(this).parent().parent().data("name");
			addModule(key);

			return false;
		});

		$("body").on("click", ".pushRight", function(e){
			e.stopPropagation();
			var key = $(this).parent().parent().data("name");
			removeModule(key);

			return false;
		});
	});


	function removeModule(key){
		if(!(key in window.availableModules)) return;

		window.availableModules[key].picked = false;
		window.availableModules[key].isDependency = null;
		var index = window.selectedModules.indexOf(window.availableModules[key]);
		if(index != -1){
			window.selectedModules.splice(index, 1);
		}
			

		//remove single-dependencies
		var dep = window.availableModules[key].requirements;
		var i, o, remove;
		for(i= 0; i< dep.length; i++){
			remove = true;
			for(o=0;o<window.selectedModules.length; o++){
				if(window.selectedModules[o].requirements.indexOf(dep[i]) != -1){
					remove = false;
					break;
				}
			}
			if(remove){
				removeModule(dep[i]);
			}
		}

		updateAvailableList();
		updateSelectedList();
		updateFinalInfo();
	}

	function saveFile(val){
		var mapForm = document.createElement("form");
		mapForm.style.display = "none";
		mapForm.target = "_blank";    
		mapForm.method = "POST";
		mapForm.action = "compiler.php";
		var mapInput = document.createElement("input");
		mapInput.type = "hidden";
		mapInput.name = "selected";
		mapInput.value = val;
		mapForm.appendChild(mapInput);
		
		document.body.appendChild(mapForm);
		
		mapForm.submit();
		
		document.body.removeChild(mapForm);
	}

	function addModule(key, isDependency){
		isDependency = isDependency || false;

		window.availableModules[key].picked = true;
		if(window.availableModules[key].isDependency !== false) window.availableModules[key].isDependency = isDependency;

		var index = window.selectedModules.indexOf(window.availableModules[key]);
		if(index != -1) return;

		window.selectedModules.push(window.availableModules[key]);

		//put dependencies as picked
		var dep = window.availableModules[key].requirements;
		for(var i = 0; i<dep.length; i++){
			if(dep[i] in window.availableModules) addModule(dep[i], true);
		}

		updateAvailableList();
		updateSelectedList();
		updateFinalInfo();
	}

	function reset(){
		for(var i in window.availableModules){
			if(window.availableModules[i].picked) window.availableModules[i].picked = false;
		}
		window.selectedModules = [];
		updateAvailableList();
		updateSelectedList();
		updateFinalInfo();
	}

	function updateFinalInfo(){
		var totalSize = 0;
		for(var i = 0; i<window.selectedModules.length; i++){
			totalSize += window.selectedModules[i].size;
		}
		$("#finalSize").html((totalSize/1024).toFixed(2)+"Kb");
		$("#finalFiles").html(window.selectedModules.length);
	}

	function updateAvailableList(){
		$("#availableClasses").html("");

		var o = false;
		var keys = Object.keys(window.availableModules);

		if(keys.length == 0){
			$("#availableClasses").html("Link sources to begin");
			return;
		}

		keys.sort();
		for(var i = 0; i<keys.length; i++){
			if(!window.availableModules[keys[i]].picked){
				$("#availableClasses").append(renderModule(window.availableModules[keys[i]], o));
				o = !o;
			}
		}
	}

	function updateSelectedList(){

		if(window.selectedModules.length != 0){
			$("#selectedClasses").html("");

			var o = false;
			for(var i = 0; i<window.selectedModules.length; i++){
				if(!window.selectedModules[i].isDependency){
					$("#selectedClasses").append(renderSelected(window.selectedModules[i], o, false));
					o = !o;
				}
			}

			$("#selectedClasses").append("<div class='dependencySeparator'>Dependencies:</div>");

			for(var i = 0; i<window.selectedModules.length; i++){
				if(window.selectedModules[i].isDependency) $("#selectedClasses").append(renderSelected(window.selectedModules[i], false, true));
			}
		}
		else{
			$("#selectedClasses").html("Add classes here");
		}
	}

	//Left : &#9668;

	function renderSelected(module, odd, dependency){
		return ["<div class='module ",((odd)?"odd":"even")," ",((dependency)?"dependency":"") ,"' data-name='",module.name,"'>",
					"<div class='moduleName'>",module.name,"</div>",
					"<div class='moduleActions'>",
						"<div class='modulePush pushRight'> &#9668; </div>",
					"</div>",
					"<div class='moduleInfo'>",
						"<div class='moduleDescription'><span class='label'>Description:</span>",module.description,"</div>",
						"<div class='moduleStatus'><span class='label'>Status:</span>",module.status,"</div>",
						"<div class='moduleMod'><span class='label'>Last Modified:</span>",module.lastModified,"</div>",
						"<div class='moduleSize'><span class='label'>Size:</span>",((module.size/1024).toFixed(2)),"Kb</div>",
						"<div class='moduleRequirements'><span class='label'>Requirements:</span>",module.requirements.join(),"</div>",
					"</div>",
				"</div>"].join("");
	}

	function renderModule(module, odd){
		return ["<div class='module ",((odd)?"odd":"even"),"' data-name='",module.name,"'>",
					"<div class='moduleName'>",module.name,"</div>",
					"<div class='moduleActions'>",
						"<div class='modulePush pushLeft'> &#9658; </div>",
					"</div>",
					"<div class='moduleInfo'>",
						"<div class='moduleDescription'><span class='label'>Description:</span>",module.description,"</div>",
						"<div class='moduleStatus'><span class='label'>Status:</span>",module.status,"</div>",
						"<div class='moduleMod'><span class='label'>Last Modified:</span>",module.lastModified,"</div>",
						"<div class='moduleSize'><span class='label'>Size:</span>",((module.size/1024).toFixed(2)),"Kb</div>",
						"<div class='moduleRequirements'><span class='label'>Requirements:</span>",module.requirements.join(),"</div>",
					"</div>",
				"</div>"].join("");
	}

	function createExport(){
		$("#result").html("");

		var finalFile = "";
		for(var i = 0; i<window.selectedModules.length; i++){
			finalFile += window.loadedModules[window.selectedModules[i].name];
		}

		$.ajax("compiler.php", {
			method:"POST",
			data:{raw:finalFile},
			success:function(e){
				if(e == "success"){
					createFileIcons();
				}
				else{
					console.log(e);
				}
			}
		})
	}

	function createFileIcons(){
		$("#result").append("<div id='unmin' onclick='saveFile(\"unmin\");' class='fileOutput'>Arstider.js</div>");
		$("#result").append("<div id='min' onclick='saveFile(\"min\");' class='fileOutput'>Arstider.min.js</div>");
	}

	function parseClass(f, data){
		if(f.name.indexOf(".js") == -1) return;

		var className = f.name.substring(0, f.name.indexOf(".js"));
		var desc = className+ " class";
		var reqs = [];
		var status = "N/A";
		var cut;

		//ClassName
		if(data.indexOf("@lends ") != -1){
			cut = data.substring(data.indexOf("@lends ") + 7);
			className = cut.substring(0, cut.indexOf(" "));
		}

		window.loadedModules[className] = data;

		//if(className.indexOf("core/") != -1) return;

		//Description
		if(data.indexOf("@constructor") != -1){
			cut = data.substring(0, data.indexOf("@constructor"));
			desc = cut.substring(cut.lastIndexOf("/**")+3, cut.lastIndexOf("@"));
			desc = desc.replace(/\n|\r|\t/g, "");
			desc = desc.split("* ").join();
		}
		else if(className == "Utils"){
			desc = "Core module. It is required for any class to work.";
		}

		//Requirements
		if(className != "Utils"){
			cut = data.substring(data.indexOf("define"));
			cut = cut.substring(cut.indexOf(className));
			cut = cut.substring(cut.indexOf("[") +1, cut.indexOf("]"));
			cut = cut.replace(/\n|\r|\t/g, "");
			cut = cut.split('"').join("").split("'").join("").split(" ").join("").split("Arstider/").join("");

			if(cut.length > 1) reqs = cut.split(",");

			reqs.push("Utils");
		}

		//Status
		if(data.indexOf("@status") != -1){
			cut = data.substring(data.indexOf("@status ") + 8);
			status = cut.substring(0, cut.indexOf("."));
		}

		var c={
			name:className,
			description:desc,
			lastModified:f.lastModifiedDate,
			size:f.size,
			status:status,
			picked:false,
			requirements:reqs
		};

		window.availableModules[className] = c;
	}

	function uploadFile(file){
		var fileReader;

		if(file && file.files && file.files.length > 0){
			for(var i = 0; i< file.files.length; i++){
    			fileReader = new FileReader();
				fileReader.onload = (function(_file) {
					return function(event){
						parseClass(_file, event.target.result);
								
						updateAvailableList();
					};
				})(file.files[i]);
		
				fileReader.readAsText(file.files[i]);
			}
		}
    };
}