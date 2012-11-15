
		*** *** *** *** *** *** *** *** *** *** ***
		*** **				     ** ***
		*** *		*Artstider* 	      * ***
		*** **				     ** ***
		*** *** *** *** *** *** *** *** *** *** ***







@Author: Frederic Charette <fredericcharette@gmail.com>
@Version: 0.1.3
@Copyright: Feb 9 2012 - GNU License



/*** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***/



TABLE OF CONTENTS:
==================

1 - Summary 
2 - Architecture 
3 - Roadmap











/*** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***/


#####
# 1 # Summary
#####

Arstider is a Quick and simple library to get you started with some Canvas action.
All you need is a bit of background in any animation or composition software (Flash, etc.) and 
a bit of Javascript.



Arstider as a Main package, Arstider.js(*1).
	It contains the means to structure your code in packages and classes, full with non-duplicating extends, 
	making your code neat, readable and very light.

	[Package] is an object that contains [Class]es. [Package]s also have the ability to require external classes
	asynchronously. 

	[Class]es are chunks of proprieties and functions that represent an Action, a Behavior or a View. 
	This is very based on the MVC design. [Class]es can inherit proprieties from another class, as a child would a
	parent. With Arstider, inheritance is not simply done by copying functions from the parent inside the children's 
	prototype. Instead, we define getters and setters so that it actually uses the parent's function.
	A transparent fix is planned to resolve scoping issues.

The Drawing Package, known as [Graphics] is what actually allows you to turn a Dom element into a [Canvas].
	A [Canvas]  







/*** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***/


#####
# 2 # Architecture and use cases
#####
















/*** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***/
#####
# 3 # Roadmap 
#####

//Main
- 0.1.4		- Fix Scoping issues with Inherit (the only potent thing in this branch)


//Graphics
- 0.0.2 	- Completing MovieClip and Layer Classes.
		- Test implementation in a Demo (with in and out interactivity).
		- Add framerate counter.
		  

//Backlog
		- (Graphics)Allow 'Dom' as a drawing engine for older browsers.
		- (Graphics)Make Canvas size adjust in realtime so that you get a nice viewport of your scene.



/*** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***/
(*1)Please use Minified packaged version, or better yet, the latest version directly from our CDN.