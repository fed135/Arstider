# Arstider

### Making mobile-web games quicker than ever!

Created by: 
	Frederic Charette <fredericcharette@gmail.com>
		on Feb 9th 2012

Current version: 1.1.2
Copyright: GNU Licence (2012-2014)

Collaborators:
	Ariel Chouinard,
	Andrew Fraticelli,
	Frederic Denis,
	Steve Paquette
	
Special thanks to:
	Fidel Studios
	
Javascript Libraries included:
	Howler <http://howlerjs.com>
	JSDoc3 <http://usejsdoc.org>
	

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
	- Adjust the $dest compile setting in build.xml (output folder)

## Building

	- build.dev task outputs the un-minified Arstider.js
	- build.release task uses the online google closure minifier to create an optimized and minified Arstider.min.js
	- build.documentation task creates the API documentation pages in the $dest folder
	
## Getting started

	You might want to sync the Project Template <http://github.com/fed135/Arstider_template>
	This is a ready project with most modules showcased
	
## Requirements

	Mobile/ desktop browser with javascript and cookies enabled
	
	Minimum version:
	- IE9,
	- Firefox 8,
	- Safari 5,
	
	- iOS 6,
	- Android 4.0