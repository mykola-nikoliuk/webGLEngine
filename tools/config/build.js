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

function rmDir(dirPath, logging, hideEntrance) {
	logging = typeof logging === 'boolean' ? logging : false;
	hideEntrance = typeof hideEntrance === 'boolean' ? hideEntrance : false;

	if (logging && !hideEntrance) {
		console.log('-- remove dir: "' + dirPath + '"');
	}

	if (fs.existsSync(dirPath)) {
		fs.readdirSync(dirPath).forEach(function (file) {
			var curPath = path.join(dirPath, file);
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
		fs.rmdirSync(dirPath);
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
		shaders     : 'shaders',
		projectName : 'webGLEngine',
		tools       : 'tools',
		example     : 'example',
		resources   : 'resources'
	},
	formats: {
		js: 'javascript',
		ts: 'typescript'
	},
	main    : 'WebGLEngine.js',
	mainDTS : 'WebGLEngine.d.ts'
};

var sourceFolder = path.join(config.folders.root, config.folders.project),
	sourceShaders = path.join(sourceFolder, config.folders.shaders),
	buildFolder = path.join(config.folders.root, config.folders.build),
	buildShaders = path.join(buildFolder, config.folders.shaders),
	buildJS = path.join(buildFolder, config.formats.js),
	buildTS = path.join(buildFolder, config.formats.ts),
	exampleFolder = path.join(config.folders.root, config.folders.example),
	exampleShaders = path.join(exampleFolder, config.folders.resources, config.folders.shaders);

process.chdir(config.folders.root);
rmDir(buildFolder);
mkDir(buildFolder);
mkDir(buildJS);
// TODO: fix typescript version
// mkDir(buildTS);
mkDir(buildShaders);
rmDir(exampleShaders);
mkDir(exampleShaders);

// copy shaders
copyDir(sourceShaders, buildShaders);
copyDir(sourceShaders, exampleShaders);

// copy javascript version
copyFile(path.join(sourceFolder, config.main), path.join(buildJS, config.main));
copyFile(path.join(sourceFolder, config.mainDTS), path.join(buildJS, config.mainDTS));

// copy typescript version
// TODO: fix typescript version
// copyDir(sourceFolder, path.join(buildTS, config.main), '!.ts');
// copyDir(sourceFolder, path.join(buildTS, config.main), '!.glsl');

process.chdir(buildFolder);

console.log('DONE');