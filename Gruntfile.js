/* 
* Modular Grunt build
*/
module.exports = function(grunt) {
'use strict';

	// TODO:
	// https://github.com/jsdoc3/jsdoc

	////////////////////////////////////////////////////////////////////////////////////////////
	// Build configuration

	var buildConfig = grunt.file.readJSON('build.json');

	var pkg = grunt.file.readJSON('package.json');

	////////////////////////////////////////////////////////////////////////////////////////////
	// Custom utilities to ease the mix of AngularJS, the RequireJS optimizer and UglifyJS2

	var buildUtils = require('./tools/build-utils');
	buildUtils.init(grunt);
	
	////////////////////////////////////////////////////////////////////////////////////////////
	// Default tasks

	grunt.registerTask('default', ["build"]);


	////////////////////////////////////////////////////////////////////////////////////////////
	// BUILD TASK

	grunt.registerTask('build', 'Default SDK Build Config', function()
	{
		// sub-tasks sequence
		var taskList = ["concat_sourcemap","uglify","tokenize","copy"];

		// Load build utilities
		buildUtils.load("uglify");
		buildUtils.load("tokenize");

		//////////////////////////////////////////////
		// Grunt Plugins
		// https://github.com/thanpolas/grunt-closure-tools
		//grunt.loadNpmTasks('grunt-closure-tools');

		// https://github.com/gruntjs/grunt-contrib-copy
		grunt.loadNpmTasks('grunt-contrib-copy');

		// https://www.npmjs.org/package/grunt-concat-sourcemap
		grunt.loadNpmTasks('grunt-concat-sourcemap');

		var gruntConfig =
		{
			pkg: pkg,

			/* Concatenate ALL files in SRC (not using require.js to resolve dependencies) */
			// https://www.npmjs.org/package/grunt-concat-sourcemap
			concat_sourcemap: {
				options: {
					// define a string to put between each file in the concatenated output
					separator: '\n',
					sourceRoot: ""
				},
				dist: {
					// the files to concatenate
					src: ['src/**/*.js'],
					// the location of the resulting JS file
					dest: buildConfig.dest+'<%= pkg.name %>.js'
				}
			},

			tokenize: {
				options: {
					// Ant tokens ie: @debug@
					ant: {
						debug: true,
						target: "dev",
						version: pkg.version
					}
				},
				dist: {
					src: buildConfig.dest+'<%= pkg.name %>.js', dest: buildConfig.dest+'<%= pkg.name %>.js'
				}
			},

			/* UglifyJS2 */
			// Custom task defined in tools/build-utils.js
			// https://github.com/mishoo/UglifyJS2
			uglify: {
				options: {
					license: buildConfig.js.license,
					tokenize: {
						// Ant tokens ie: @debug@
						ant: {
							debug: false,
							target: "dist",
							version: pkg.version
						},
					},
					
					// http://lisperator.net/uglifyjs/compress
					compress: {
						unsafe:true,
						warnings:false,
						drop_console:false,
						unused:true
					}
				},
				main: {
					files: [
						{
							src:  buildConfig.dest+'<%= pkg.name %>.js', 
							dest: buildConfig.dest+'<%= pkg.name %>.min.js', 
							map:  buildConfig.dest+'<%= pkg.name %>.min.js.map'
						}

						/* Combined vendor scripts/plugins
						{ src: [
							"./app/lib/plugins/jquery.pep.js",
							// https://github.com/brandonaaron/jquery-mousewheel/blob/4.0.x/jquery.mousewheel.js
							"./app/lib/plugins/jquery.mousewheel.js",
							"./app/lib/plugins/jquery.magnific-popup.js",

							// Greensock Tweenmax -- http://www.greensock.com/gsap-js/ 
							"./app/lib/greensock/src/uncompressed/TweenMax.js",

							// http://www.greensock.com/jquery-gsap-plugin/
							"./app/lib/greensock/src/uncompressed/jquery.gsap.js",

							// https://github.com/ftlabs/fastclick 
							"./app/lib/plugins/fastclick.js"

						], dest: "./app/lib/plugins.min.js"} */
					]
				}
			}, 


			/* Copy build */
			// https://github.com/gruntjs/grunt-contrib-copy
			copy: {
				main: {
					// http://gruntjs.com/configuring-tasks#globbing-patterns
					// http://gruntjs.com/configuring-tasks#building-the-files-object-dynamically
					files: [
						{expand: true, src: ['./readme.md'], dest: buildConfig.dest},
					]
				}
			}
		}
		
		// Configure grunt
		grunt.initConfig(gruntConfig);

		// Run sub-tasks
		grunt.task.run(taskList);

	}); // End task build


	////////////////////////////////////////////////////////////////////////////////////////////
	// JSDOC TASK

	grunt.registerTask('doc', 'JSDOC', function()
	{

	});


}