<?php
	session_start();

	if(isset($_POST["raw"])){
		$_SESSION["Arstider"] = $_POST["raw"];
		$ch = curl_init('http://closure-compiler.appspot.com/compile');
	 
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, 'output_info=compiled_code&output_format=text&compilation_level=SIMPLE_OPTIMIZATIONS&js_code=' . urlencode($_POST["raw"]));
		$output = curl_exec($ch);
		curl_close($ch);

		if($output != ""){
			$_SESSION["Arstider.min"] = $output;
			echo "success";
		}
		else{
			echo "error";
		}
	}
	else{
		if(isset($_POST["selected"])){
			$name = "Arstider";
			if($_POST["selected"] == "unmin"){
				$content = $_SESSION["Arstider"];
			}
			else if($_POST["selected"] == "min"){
				$name = "Arstider.min";
				$content = $_SESSION["Arstider.min"];
			}

		}

		header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
		header('Content-Type: application/octet-stream');
		//header('Content-Description: File Transfer');

		//header('Content-disposition: attachment; filename="'.$mapName.'.json"');

		header('Content-disposition: inline; filename="'.$name.'.js"');

		echo($content);
	}
?>