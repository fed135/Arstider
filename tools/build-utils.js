/* NodeJS module public API */
module.exports = {
	init:init,
	load:load,
	replaceInFile: replaceInFile
}

// Node JS modules

/**
 * FileSystem
 * http://nodejs.org/api/fs.html
 */ 
var fs = require('fs');

// RequireJS
//var requirejs = require('grunt-contrib-requirejs/node_modules/requirejs'); // ../node_modules/

// Grunt
var grunt;
var _; // lodash

var _taskMap = {
	"uglify":loadUglify,
	"tokenize":loadTokenize
}

function init(gruntInstance)
{
	grunt = gruntInstance;
	_ = grunt.util._; // lodash
}

function load(name)
{
	if(!_taskMap[name])
	{
		console.log("ERROR TASK NOT FOUND: '"+name+"'");
		return;
	}

	_taskMap[name]();
}

function loadUglify()
{
	//console.log("Loading UglifyJS2 custom task...");

	var UglifyJS = require("uglify-js");
	grunt.registerMultiTask('uglify', 'UglifyJS2 Custom Task', function()
	{
		// Default options
		var allFilesOptions = this.options({
			fromString: true,

			// Output options
			// http://lisperator.net/uglifyjs/codegen
			output: {
				comments: /@preserve|@license|@cc_on/
			},

			// Compressor options
			// http://lisperator.net/uglifyjs/compress
			compress: {

			}
		});

		this.files.forEach(function (f)
		{
			var src;
			var options = allFilesOptions;

			// String manipulations mode
			if(options.fromString)
			{
				src = getGruntFilesSource(f);

				if(options.tokenize)
				{
					src = tokenize(options.tokenize, src)
				}

				// AngularJS pass
				// Fills Angular injection annotations to avoid mangling issues with minification and AngularJS
				// Similar result than in this Google Closure class: http://code.google.com/p/closure-compiler/source/browse/src/com/google/javascript/jscomp/AngularPass.java
				//if(options.angularPass) src = angularPass(src.toString());

			} 
			// Default (let uglify concat files, good for source maps)
			else {
				src = f.src;
			}

			// Contextual options
			if(f.map)
			{
				options.outSourceMap = f.map;
			}

			// https://github.com/mishoo/UglifyJS2#the-simple-way
			var result = UglifyJS.minify(src, options);

			// Prepend license?
			if(options.license)
			{
				result.code=options.license+result.code;
			}

			// Write result
			console.log("\nWriting uglify output: "+f.dest);

			grunt.file.write(f.dest, result.code);

			// Write source map
			if(f.map)
			{
				var map;

				if(options.fromString)
				{
					map = JSON.parse(result.map);
					map.sources = f.src;
					map = JSON.stringify(map);
				} else {
					map = result.map;
				}

				console.log("\tsource map: "+f.map);
				
				grunt.file.write(f.map, map);
			}
			
		});
	});
}


function loadTokenize()
{
	grunt.registerMultiTask('tokenize', 'Tokenize Custom Task', function()
	{
		// Default options
		var options = this.options({
			
		});

		this.files.forEach(function (f)
		{
			var src = getGruntFilesSource(f);

			src = tokenize(options, src)

			console.log("Writing tokenized output: "+f.dest)
			grunt.file.write(f.dest, src);
		});
	});
}


function getGruntFilesSource(f)
{
	var src = f.src.filter(function (filepath)
		{
			if (!grunt.file.exists(filepath)) {
				grunt.log.warn('Source file "' + filepath + '" not found.');
				return false;
			} else {
				return true;
			}
		}).map(function (filepath)
		{
			var content = fs.readFileSync(filepath).toString();
			return content;
	}).join('\n');

	return src;
}

function tokenize(tokens, s)
{
	// Ant tokens ie: @debug@
	if(tokens.ant)
	{
		s = replaceTokens(s, tokens.ant,"@","@");
	}

	return s;
}
function replaceTokens(s, values,prefix,suffix)
{
	console.log("Ant tokens: ")
	for(p in values)
	{
		var val = values[p];
		console.log("\t"+p+":"+val);
		var regex = new RegExp("@"+p+"@", "gi");
		s = s.replace(regex, val);
	}
	return s;
}

function replaceInFile(file,regexOrString,to)
{
	// https://github.com/gruntjs/grunt/wiki/grunt.file
	var text = grunt.file.read(file);
	text = text.replace(regexOrString, to);
	grunt.file.write(file, text);
}