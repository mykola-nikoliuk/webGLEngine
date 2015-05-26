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

function copyFile(source, destination) {
	if (fs.existsSync(source)) {
		if (fs.existsSync(destination)) {
			fs.unlink(destination);
		}
		fs.writeFileSync(destination, fs.readFileSync(source));
	}
}


function mkDir(path) {
	if (!fs.existsSync(path))
		fs.mkdirSync(path);
	else
		this.error('folder already exist');
}


function rmDir(path, logging, hideEntrance) {

	logging = typeof logging === 'boolean' ? logging : false;
	hideEntrance = typeof hideEntrance === 'boolean' ? hideEntrance : false;

	if (logging && !hideEntrance) {
		console.log('-- remove dir: "' + path + '"');
	}

	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function (file) {
			var curPath = path + "\\" + file;
			if (fs.lstatSync(curPath).isDirectory()) { // recurse
				rmDir(curPath, logging, true);
				if (logging) {
					console.log('  dir: ' + curPath);
				}
			} else { // delete file
				if (logging) {
					console.log(' file: ' + curPath);
				}
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
}

function copyDir(source, destination, mask, logging) {
	var isMaskInclude, realMask;

	logging = typeof logging === 'boolean' ? logging : false;
	mask = typeof mask === 'string' ? mask : '';
	isMaskInclude = mask.indexOf('!') < 0;
	realMask = isMaskInclude ? mask : mask.substring(1);
	if (fs.existsSync(source)) {
		fs.readdirSync(source).forEach(function (file) {
			// cheack mask
			if ((isMaskInclude && file.indexOf(realMask) < 0) || (!isMaskInclude && file.indexOf(realMask) >= 0)) {
				return;
			}
			var sourcePath = path.join(source, file);
			var destinationPath = path.join(destination, file);
			if (fs.lstatSync(sourcePath).isDirectory()) { // recurse
				if (logging) {
					console.log('copyDir: copy folder "' + file + '"')
				}
				mkDir(destinationPath);
				copyDir(sourcePath, destinationPath, mask);
			} else { // copy file
				copyFile(sourcePath, destinationPath);
			}
		});
	}
}

function createFolders(folderArray) {
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
function getFilesRecursive(folder, filter) {
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


var config = {
	folders : {
		root        : path.join(path.dirname(process.argv[1]), '../..'),
		project     : 'source',
		build       : 'build',
		release     : 'release',
		shaders     : 'shaders',
		examplePath : 'example/code/libs/webGLEngine',
		projectName : 'webGLEngine',
		tools       : 'tools'
	},
	main    : 'webGLEngine.js'
};

var exampleProjectFolder = path.join(config.folders.root, config.folders.examplePath),
		projectFolder        = path.join(config.folders.root, config.folders.project),
		releaseFolder        = path.join(config.folders.root, config.folders.build, config.folders.release);

//config.folders.release = path.join(config.folders.build, config.folders.release);

process.chdir(config.folders.root);
rmDir(config.folders.build);
mkDir(config.folders.build);
mkDir(releaseFolder);
mkDir(path.join(releaseFolder, config.folders.shaders));

// copy shaders
copyDir(
	path.join(projectFolder, config.folders.shaders),
	path.join(releaseFolder, config.folders.shaders)
);

// TODO: fix copy to release
copyFile(path.join(projectFolder, config.main), (path.join(releaseFolder, config.main)));

process.chdir(releaseFolder);

rmDir(exampleProjectFolder);
mkDir(exampleProjectFolder);

// copy release
copyDir(
	path.join(releaseFolder),
	path.join(exampleProjectFolder)
);

//copyFile('webGLEngine.js', '../sample/js/webGLEngine.js');
//rmDir('../build/release');
//copyDir('../source/shaders', '../build/release/');
//copyFile('webGLEngine.js.map', '../sample/js/webGLEngine.js.map');

/*
 console.dir(getFilesRecursive('D://media', function(fileName) {
 return fileName.indexOf('.jpg') < 0;
 }));
 */
