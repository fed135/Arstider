[![Arstider](https://github.com/fed135/Arstider/blob/master/arstider.png)](https://github.com/fed135/Arstider)

---

**Deprecated!**

Arstider will no longer be maintained. 
Arstider was developped at a point in time when there were very few options for making
canvas apps. It served it's purpose well, helping a couple indiviuals as well as studios build
close to 50 titles (est.). It was a great learning experience!

I strongly suggest that you take a look at [Phaser](http://www.phaser.io) - for your small to medium projects.
Unity 5 now offers HTML5 export - which covers your larger project needs. 

Thank you for helping build Arstider during these 3 years! 

Cheers! 

---

### Making mobile-web games quicker than ever!

	
**Special thanks**: Fidel Studios/ Stolo
	
**Javascript Libraries included**:

- Google Closure Compiler <https://developers.google.com/closure/compiler>,

- JSDoc3 <http://usejsdoc.org>, 
	
**Non-included Javascript Libraries**:

- RequireJS <http://requirejs.org>,
	
- HowlerJS <https://github.com/goldfire/howler.js>
  

/*** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***/

## Purpose

Arstider was build as a tool to facilitate the development of games on the 2D Canvas. The modules are designed to reduce the learning curve of Flash programmers moving to HTML5. 

As compared to other HTML5 libraries available, Arstider is a complete solution for games, providing the logic for screen management, object hierarchy, asset loading, sound, network, social integration, telemetry and much much more. Major strengths inclure text customization, live debugging, live layout editing, advanced spriting options, data storage and localization support.


## Building

To build Arstider, you can use on of the many options below:

- **Apache Ant**

> ant build.all

  Requires 
  
  * ant 1.7+
  * Java JRE7

- **Bash/Shell (cross-compatible) executable**

> Arstider -c /destination_folder
    
  Requires
    
  * compatible version of shell/bash runtime
  
- **Grunt**

> grunt build
    
  Requires
    
  * Grunt
  

These build methods will output an unminified version AND a minified version of the Arstider lib at the specified location OR, if defined, the location of Environment variable 'BUILD_DEST'.
    
    
## Dependencies

Once you have built the SDK, all you need to make it work is RequireJS or any AMD library that exports 'requirejs'.

The SDK currently uses HowlerJS as a Sound API interface. There is plans to make an Arstider interface to remove the need for this dependency.


## Documentation

To build the Arstider API Documentation, you can use one of the targets below:

- **Apache Ant**

> ant build.documentation

- **Bash/Shell (cross-compatible) executable**

> Arstider -d /destination_folder
    
    
The grunt task is a todo.
	
	
## Getting started

You might want to sync the Project Template <http://github.com/fed135/Arstider_template>
This is a ready project with most modules showcased
Some *snippets* for your IDE are also available in the documentation folder.
	

## Minimum Browser Requirements

Mobile/ desktop browser with javascript and cookies enabled
	
**Minimum versions**:

- IE9,
- Firefox 8,
- Safari 5,
	
- iOS 6,
- Android 4.0
