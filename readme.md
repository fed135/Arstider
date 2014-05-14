# Arstider

### Making mobile-web games quicker than ever!

Created by: 
	Frederic Charette <fredericcharette@gmail.com>
		on Feb 9th 2012

Current version: 1.1.3
Copyright: GNU Licence (2012-2014)

Collaborators:
	Ariel Chouinard,
	Andrew Fraticelli,
	Frederic Denis,
	Steve Paquette
	
Special thanks to:
	Fidel Studios
	
Javascript Libraries included:
        Google Closure Compiler <https://developers.google.com/closure/compiler>,
	JSDoc3 <http://usejsdoc.org>, 
	
Non-included Javascript Libraries:
	RequireJS <http://requirejs.org> (Required for loading modules)

/*** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***/


## Prerequisites

	- Python (any)
	- Apache Ant <http://ant.apache.org/>
	- Local/remote server 
		Recommended:
			Windows : WAMP <http://www.wampserver.com/>
			Mac/Linux : Apache2 (command line)

## Installation

	- Sync the repository in a safe location
        - Create a global Environment variable named BUILD_DEST pointing to the folder where the sdk will be compiled to

## Building

	- build.all task outputs the un-minified Arstider.js, the minified version and the turbo (ADVANCED_OPTIMIZATIONS) version
	- build.documentation task creates the API documentation pages in the $dest folder
	
## Getting started

	You might want to sync the Project Template <http://github.com/fed135/Arstider_template>
	This is a ready project with most modules showcased
        Some snippets in the documentation folder are also available
	
## Minimum Browser Requirements

	Mobile/ desktop browser with javascript and cookies enabled
	
	Minimum version:
	- IE9,
	- Firefox 8,
	- Safari 5,
	
	- iOS 6,
	- Android 4.0
