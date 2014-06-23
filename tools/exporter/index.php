<?php


?>

<!DOCTYPE html>
<html>
	<head>
		<title>Custom Arstider Exporter</title>
		<meta charset="utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		
		<meta name="description" content="Arstider test project" />
		<meta name="robots" content="noindex,nofollow" />
		
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<meta name="apple-mobile-web-app-title" content="Arstider Exporter" />
		<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
		<meta content="telephone=no" name="format-detection">
		<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, minimal-ui" />
		<meta name="HandheldFriendly" content="true" />
		
		<link rel="icon" href="favicon.png">

		<link href="main.css" media="screen" rel="stylesheet" type="text/css">
	</head>
	<body>
		<h1>Arstider Custom Exporter</h1>
		<div id="instructions">
			Select the packages you want in your custom Arstider Build, then click "Export"
		</div>

		<div id="selectedClasses"></div>

		<div id="availableClasses">
			<?php echo ""; ?>
		</div>

		<div id="actions">
			<div id="linkSrcBtn">Link Source</div>
			<div id="resetBtn">Reset</div>
			<div id="exportBtn">Export</div>
		</div>

		<div id="result">
			<div id="loadingContainer">
				<div id="loadingBar"></div>
			</div>
			<div id="downloads"></div>
		</div>

		<script src="http://cdnjs.cloudflare.com/ajax/libs/require.js/2.1.11/require.min.js"></script>
		<script src="main.js"></script>
	</body>
</html>