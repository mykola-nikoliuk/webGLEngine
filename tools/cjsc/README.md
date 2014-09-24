CommonJS Compiler
==============
[![Build Status](https://travis-ci.org/dsheiko/cjsc.png)](https://travis-ci.org/dsheiko/cjsc)
[![NPM version](https://badge.fury.io/js/cjsc.png)](http://badge.fury.io/js/cjsc)

`cjsc` is a command-line tool that makes your Common JS modules suitable for in-browser use.
While every AMD-module results in a separate HTTP request and therefore [badly affects page response time](https://developer.yahoo.com/performance/rules.html),
`cjsc`, instead, combines all the acting modules in a single file (optionally compressed).


## Features

* Does not bring into you production code any additional library
* Works fine with UMD modules (including jQuery, Backbone, Underscore and others)
* Allows exporting globals of 3rd party libraries without intervention in their code
* Supports source maps http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/
* Supports JavaScript templates ( Mustache, Handlebars, Underscore and others )
* Produces a string out of (multiline) non-JS external text file


## Features inherited from CommonJS
* Allows splitting large projects into multiple files (modules) making web-application scalable and maintainable
* Enclosures every file in its own unique module context

# Contents
* [How to install](#a-install)
* [Getting Started](#a-work)
* [How to use in the command line](#a-use)
* [File modules](#a-file-modules)
* [Caching](#a-caching)
* [How to configure dependency](#a-config)
* [How to make module of a globally exposed variable](#a-config-a)
* [How to make modules of jQuery and its plugins](#a-config-b)
* [How to make modules of 3rd party libraries](#a-vendors)
* [How to use Mustache templates](#a-mustache)
* [How to use Handlebars templates](#a-handlebars)


## <a name="a-install"></a>How to install

### Install nodejs/npm
`cjsc` utilizes nodejs and its package manager (NPM). If don't have these tools yet installed, you can find details on
https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager

### Install `cjsc`

Locally:
```bash
npm i cjsc
```

or globally:
```bash
sudo npm i cjsc -g
```
Note: in this case npm creates a symlink `/usr/bin/cjsc`




## <a name="a-work"></a>Getting Started

Let's define a few CommonJS modules (http://wiki.commonjs.org/wiki/Modules/1.1.1):

`./main.js`
```javascript
console.log( "main.js running..." );
console.log( "Imported name in main.js is `%s`", require( "./lib/dep1" ).name );
console.log( "Getting imported object from the cache:" );
console.log( " imported name in main.js is still `%s`", require( "./lib/dep1" ).name );
```

`./lib/dep1.js`
```javascript
console.log( "dep1.js running..." );
console.log( " it has __diname = `%s`", __dirname );
console.log( " it has __filename = `%s`", __filename );
console.log( "Imported name in dep1.js is `%s`", require( "./dep2" ).name );
exports.name = "dep1";
```

`./lib/dep2.js`
```javascript
console.log( "dep2.js running..." );
module.exports.name = "dep2";
```

Now we can compile the modules:
```bash
cjsc main.js script.js
```

As we fire up script.js we get the following output:
```
main.js running...
dep1.js running...
 it has __diname = `.../demo/lib`
 it has __filename = `.../demo/lib/dep1.js`
dep2.js running...
Imported name in dep1.js is `dep2`
Imported name in main.js is `dep1`
Getting imported object from the cache:
 imported name in main.js is still `dep1`
```







## <a name="a-use"></a>Using CommonJS Compiler in the command line

Compile `main-module.js` into `build.js`:
```bash
./cjsc main-module.js build.js
```
or
```bash
node cjsc.js main-module.js build.js
```

Compile `main-module.js` into `build.js` and generate source map
```bash
./cjsc main-module.js build.js  --source-map=build/build.js.map --source-map-url=http://localhost/
```
or the following options for automatic naming
```bash
./cjsc main-module.js build.js  --source-map=*.map
```
or this way to explicitly specify the path to sources relative to the source map
```bash
./cjsc main-module.js build.js  --source-map=build/*.map --source-map-root=../src
```

Whereas:
* `--source-map` is a source map file path relative to the project directory (the directory where cjsc is running)
* `--source-map-url` by default is "." and means the same path as source map file
* `--source-map-root` is sources path relative to the source map file. For instance: sources are in `<project>/src`, build is in `<project>/build`. So specify `--source-map-root=../src` to let the browser know that it must look for mapped source file in `../src/**/file.js` relative to the source map path.

Now breakpoints and console messages mapped to the original sources
![Source mapping example](https://raw.github.com//dsheiko/cjsc/master/demo/img/console-ex.jpg "Source mapping example")


Compile `main-module.js` into `build.js` and minify `build.js`
```bash
./cjsc main-module.js build.js -M
```

With a banner
```bash
./cjsc main-module.js build.js -M --banner="/*! pkg v.0.0.1 */"
```



## <a name="a-file-modules"></a>File Modules

If the exact filename is not found, then CJSC will try the
required filename with the added extension of .js.

## The `module` object
Every module has available `module` variable that references to an object representing the module.
Like in [NodeJS](http://nodejs.org/api/modules.html) th object has following structure:

* module.id {string} - The identifier for the module.
* module.filename {string} - The fully resolved filename to the module.
* module.loaded {boolean} - Whether or not the module is done loading.
* module.parent {Object} - The module that required this one.
* module.children {Object[]} - The module objects required by this one

## <a name="a-caching"></a>Caching

Caching goes the same as in nodejs. Modules are cached after the first time they are loaded.
So every call to `require('foo')` returns exactly the same object, if it refers to the same file.

Multiple calls to `require('foo')` don't execute the module code multiple times.





## <a name="a-grunt"></a>Setting up [Grunt](http://gruntjs.com/) task

*Gruntfile.js*
```javascript
grunt.loadNpmTasks('grunt-contrib-cjsc');
grunt.initConfig({
     cjsc: {
      development: {
				options: {
					minify: true
				},
        files: {
          "<path>/compiled.js" : "<path>/source.js"
        }
      }
    }
  });
```
*package.json*
```javascript
"devDependencies": {
    //..
    "grunt-contrib-cjsc": "*"
  }
```

Please find details at https://github.com/dsheiko/grunt-contrib-cjsc



## <a name="a-config"></a>How to configure dependency
You can configure your dependencies in a JSON file like that:
```javascript
{
	"<dependency-name>": {
		"path": "<dependency-path>",
		"globalProperty": "<global-property>",
		exports: [ "<variable>", "<variable>" ],
		require: [ "<dependency-name>", "<dependency-name>" ]
	}
}
```
or
```javascript
{
	"<dependency-name>": {
		"path": "<dependency-path>",
		"globalProperty": "<global-property>",
		exports: "<variable>",
		require: "<dependency-name>"
	}
}
```
And apply it as follows:
```
node cjsc main.js build.js --config=config.json
```



## <a name="a-config-a"></a>How to make module of a globally exposed variable
`config.json`:
```javascript
{
	"jQuery": {
		"globalProperty": "jQuery"
	}
}
```
`main.json`:
```javascript
var $ = require( "jQuery" );
// $ - is a reference to globally exposed jQuery instance (assuming window.jQuery si defined outside this module)
console.log( $( window ) );
```
Compilation:
```
node cjsc main.js build.js --config=config.json
```



## <a name="a-config-b"></a>How to make modules of jQuery and its plugins
`config.json`:
```javascript
{
	"jQuery": {
		"path": "./vendors/jquery-2.1.0.min.js"
	},
	"placeholder": {
		"path": "./vendors/jquery.placeholder.js",
		"require": "jQuery",
		"exports": "jQuery"
	}
}
```
`main.json`:
```javascript
// Obtain jQuery as UMD-module
var $ = require( "jQuery" );
// Attach plugin to jQuery
require( "placeholder" );
console.log( $.fn.placeholder );
```
Compilation:
```
node cjsc main.js build.js --config=config.json
```


## <a name="a-vendors"></a>How to make modules of 3rd party libraries

Options #1:
```javascript
// Load 3rd-party library and export the globals it exposes ("exp1" and "exp2")
var exp1 = require( "./vendors/lib.js", "exp1", "exp2" ).exp1,
// Take the second exported object from the module cache
		exp2 = require( "./vendors/lib.js" ).exp2;

console.log( "exp1", exp1 );
console.log( "exp2", exp2 );
```

Options #2:

`config.json`:
```javascript
{
	"lib": {
		"path": "./vendors/lib.js",
		"exports": [ "exp1", "exp2" ]
	}
}
```
`main.json`:
```javascript
var lib = require( "lib" );
console.log( lib.exp1, lib.exp2 );
```
Compilation:
```
node cjsc main.js build.js --config=config.json
```

If 3rd party code exposes the only object, it can be done like that:

`config.json`:
```javascript
{
	"lib": {
		"path": "./vendors/lib.js",
		"exports": "exp1"
	}
}
```
Note: The `"path"` must be relative to the project directory (where the compiler is running from)

`main.json`:
```javascript
var lib = require( "lib" );
// Exp1
console.log( lib );
```




## <a name="a-mustache"></a>How to use Mustache templates
Template file: ./mustache/example.tpl
```
{{title}} spends {{calc}}
```
Module that uses the template
```javascript
var mustache = require( "./mustache/mustache" ),
		tpl = require( "./mustache/example.tpl" ),
		view = {
			title: "Joe",
			calc: function () {
				return 2 + 4;
			}
		};

console.log( mustache.render( tpl, view ) );
```


## <a name="a-handlebars"></a>How to use Handlebars templates
Template file: ./handlebarsjs/example.hbs
```
<div class="entry">
  <h1>{{title}}</h1>
  <div class="body">
    {{body}}
  </div>
</div>
```
Module that uses the template
```javascript
var handlebars = require( "./handlebarsjs/handlebars", "Handlebars" ).Handlebars,
		tpl = require( "./handlebarsjs/example.hbs" ),
		view = {
			title: "My New Post",
			body: "This is my first post!"
		};

console.log( handlebars.compile( tpl )( view ) );
```

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/fb790e90a5c2e6afb69ba979b6ac34b1 "githalytics.com")](http://githalytics.com/dsheiko/cjsc)