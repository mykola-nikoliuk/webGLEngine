/*
 * Project: cjsc
 *
 * User: igorbz
 * Date: 8/21/2014
 * Time: 9:58 AM
 * © 2014 TRANSGAMING INC. AND ITS AFFILIATES. ALL RIGHTS RESERVED.
 */
var fs   = require("fs"),
	path = require('path');

var config = {
	folders : {
		root    : path.join(path.dirname(process.argv[1]), '..'),
		project : 'app/source',
		js      : 'game',
		build   : 'build',
		tools   : 'tools'
	},
	main    : 'main.js'
};

var cjsc = require(path.join(config.folders.root, config.folders.tools, 'cjsc/cjsc-module.js'));
console.log('var config = ' + JSON.stringify(config, null, " "));

createFolders([
	//config.folders.build,
	path.join(config.folders.build, 'release/game')
]);

process.chdir(path.join(config.folders.root, config.folders.build, 'release/game'));
cjsc([
	process.argv[0],
	process.argv[1],
	'../../../app/source/game/main.js',
	'bundle.js',
	'--source-map=bundle.js.map',
	'--config=' + path.join(config.folders.root, 'config/config.json')
]);
/*
 copyFilesRecursive([
 { from: path.join(config.folders.root, config.folders.project }
 ]);
 */

function createFolders (folderArray) {
	for (var i = 0; i < folderArray.length; i++) {
		var folder = path.join(config.folders.root, folderArray[i]);

		if (!fs.existsSync(folder)) {
			console.log('create folder ' + folder);
			try {
				fs.mkdirSync(folder);
			} catch (e) {
				console.log('' + e);
			}
		} else {
			console.log('folder is already exists: ' + folder);
		}
	}
}

/**
 * @param {string} folder
 * @return {Array.<string>}
 * @param {function} filter
 */
function getFilesRecursive (folder, filter) {
	var filesArray = [];
	if (fs.existsSync(folder)) {
		if (fs.statSync(folder).isDirectory()) {
			//fs.mkdirSync(dest);
			fs.readdirSync(folder).forEach(function (childItemName) {
				filesArray = filesArray.concat(
					getFilesRecursive(
						path.join(folder, childItemName),
						filter
						//path.join(dest, childItemName)
					)
				);
			});
		} else {
			//fs.linkSync(folder, dest);
			var add = true;
			if (filter) {
				if (filter instanceof RegExp) {
					add = filter.test(folder);
				}
				else if (typeof filter === 'function') {
					add = filter(folder);
				}
			}
			if (add) {
				filesArray.push(folder);
			}
		}
	}
	return filesArray;
}

/*
 console.dir(getFilesRecursive('D://media', function(fileName) {
 return fileName.indexOf('.jpg') < 0;
 }));
 */
