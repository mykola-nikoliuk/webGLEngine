/* jshint unused: false */
/**
 * @typedef module
 * @type {object}
 * @property {string} id - the identifier for the module.
 * @property {string} filename - the fully resolved filename to the module.
 * @property {module} parent - the module that required this one.
 * @property {module[]} children - the module objects required by this one.
 * @property {boolean} loaded - whether or not the module is done loading, or is in the process of loading
 */
/**
	*
	* Define scope for `require`
	*/
var _require = (function(){
	var /**
			* Store modules (types assigned to module.exports)
			* @type {module[]}
			*/
			imports = [],
			/**
			 * Store the code that constructs a module (and assigns to exports)
			 * @type {*[]}
			 */
			factories = [],
			/**
			 * @type {module}
			 */
			module = {},
			/**
			 * Implement CommonJS `require`
			 * http://wiki.commonjs.org/wiki/Modules/1.1.1
			 * @param {string} filename
			 * @returns {*}
			 */
			__require = function( filename ) {

				if ( typeof imports[ filename ] !== "undefined" ) {
					return imports[ filename ].exports;
				}
				module = {
					id: filename,
					filename: filename,
					parent: module,
					children: [],
					exports: {},
					loaded: false
				};
				if ( typeof factories[ filename ] === "undefined" ) {
					throw new Error( "The factory of " + filename + " module not found" );
				}
				// Called first time, so let's run code constructing (exporting) the module
				imports[ filename ] = factories[ filename ]( _require, module.exports, module );
				imports[ filename ].loaded = true;
				if ( imports[ filename ].parent.children ) {
					imports[ filename ].parent.children.push( imports[ filename ] );
				}
				return imports[ filename ].exports;
			};
	/**
	 * Register module
	 * @param {string} filename
	 * @param {function(module, *)} moduleFactory
	 */
	__require.def = function( filename, moduleFactory ) {
		factories[ filename ] = moduleFactory;
	};
	return __require;
}());
// Must run for UMD, but under CommonJS do not conflict with global require
if ( typeof require === "undefined" ) {
	require = _require;
}
_require.def( "..\\..\\..\\app\\source\\game\\main.js", function( _require, exports, module ){
var Engine = _require( "..\\..\\..\\app\\source\\game\\webGLEngine\\webGLEngine.js" ),
	engine = new Engine();

var hummer = engine.createMeshFromFile('./game/Humvee/humvee.obj');
var transform = hummer.getTransformations();
transform.position.y = -130;
//transform.position.x = -130;
//transform.rotation.z = -0.1;
transform.rotation.x = -Math.PI / 2;
	return module;
});

_require.def( "..\\..\\..\\app\\source\\game\\webGLEngine\\webGLEngine.js", function( _require, exports, module ){
var Class = _require( "..\\..\\..\\app\\source\\game\\libs\\class.js" ),
	utils = _require( "..\\..\\..\\app\\source\\game\\libs\\utils.js" ),
	config = _require( "..\\..\\..\\app\\source\\game\\webGLEngine\\webGLConfig.js" ),
	glMatrix = _require( "..\\..\\..\\app\\source\\game\\webGLEngine\\glMatrix-0.9.5.min.js" ),
	classes3d = _require( "..\\..\\..\\app\\source\\game\\webGLEngine\\classes3d.js" ),
	Mesh = _require( "..\\..\\..\\app\\source\\game\\webGLEngine\\mesh.js" );

/** @class Engine
 * @extends {Class} */
var Engine = Class.extend(/** @lends {Engine#} */ {
	init : function (renderType) {

		/** @private
		 * @type {WebGLRenderingContext} */
		this.gl = null;

		/** @private */
		this.inited = false;

		/** @private
		 * @type {HTMLCanvasElement} */
		this.canvasNode = null;

		/** @private */
		this.mvMatrix = glMatrix.mat4.create();
		/** @private */
		this.pMatrix = glMatrix.mat4.create();
		/** @private */
		this.mvMatrixStack = [];

		/** @private */
		this.rTri = 0;

		/** @private */
		this.lastTime = new Date().getTime();

		/** @private
		 * @type {Array.<Mesh>} */
		this.meshes = [];

		/** @private */
		this.shaderProgram = null;

		// check is render type are correct
		if (typeof renderType === 'undefined') {
			renderType = Engine.TYPES.render3d;
		}
		if (typeof renderType === 'number' && Engine.TYPES[renderType] !== 'undefined') {
			this.renderType = renderType;
			window.addEventListener('resize', utils.bind(this.onResize, this), false);
			this.webGLStart();
		}
		else {
			return null;
		}
	},

	webGLStart : function () {
		this.crateCanvas();
		this.initGL();
		this.initShaders();

				this.gl.clearColor(0.2, 0.2, 0.2, 1.0);
		this.gl.enable(this.gl.DEPTH_TEST);

		setInterval(utils.bind(this.drawScene, this), 30);
	},

	/** @private */
	crateCanvas : function () {
		this.canvasNode = utils.html.getById(config.html.canvasID);
		if (this.canvasNode === null) {
			this.canvasNode = utils.html.createElement({
				id    : config.html.canvasID,
				style : {
					position : 'fixed',
					left     : '0px',
					top      : '0px'
				}
			}, 'canvas');
			document.body.appendChild(this.canvasNode);
		}
	},

	/** @private */
	initGL : function () {
		try {
			this.gl = this.canvasNode.getContext("webgl") || this.canvasNode.getContext("experimental-webgl");
			this.inited = true;
			this.onResize();
		}
		catch (e) {
		}
		if (!this.gl) {
			alert("Could not initialise WebGL, sorry :-(");
		}
	},

	getShader : function (gl, id) {
		var shaderScript = document.getElementById(id);
		if (!shaderScript) {
			return null;
		}

		var str = "";
		var k = shaderScript.firstChild;
		while (k) {
			if (k.nodeType == 3) {
				str += k.textContent;
			}
			k = k.nextSibling;
		}

		var shader;
		if (shaderScript.type == "x-shader/x-fragment") {
			shader = gl.createShader(gl.FRAGMENT_SHADER);
		} else if (shaderScript.type == "x-shader/x-vertex") {
			shader = gl.createShader(gl.VERTEX_SHADER);
		} else {
			return null;
		}

		gl.shaderSource(shader, str);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.log(gl.getShaderInfoLog(shader));
			return null;
		}

		return shader;
	},

	initShaders : function () {
		var fragmentShader = this.getShader(this.gl, "shader-fs");
		var vertexShader = this.getShader(this.gl, "shader-vs");

		this.shaderProgram = this.gl.createProgram();
		this.gl.attachShader(this.shaderProgram, vertexShader);
		this.gl.attachShader(this.shaderProgram, fragmentShader);
		this.gl.linkProgram(this.shaderProgram);

		if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
			console.log("Could not initialise shaders");
		}

		this.gl.useProgram(this.shaderProgram);

		this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
		this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

		this.shaderProgram.vertexColorAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexColor");
		this.gl.enableVertexAttribArray(this.shaderProgram.vertexColorAttribute);

		this.shaderProgram.textureCoordAttribute = this.gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
		this.gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);

		this.shaderProgram.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
		this.shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
		this.shaderProgram.samplerUniform = this.gl.getUniformLocation(this.shaderProgram, "uSampler");
		this.shaderProgram.textureEnabled = this.gl.getUniformLocation(this.shaderProgram, "uTextureEnabled");
	},

	mvPushMatrix : function () {
		var copy = glMatrix.mat4.create();
		glMatrix.mat4.set(this.mvMatrix, copy);
		this.mvMatrixStack.push(copy);
	},

	mvPopMatrix : function () {
		if (this.mvMatrixStack.length == 0) {
			throw "Invalid popMatrix!";
		}
		this.mvMatrix = this.mvMatrixStack.pop();
	},

	setMatrixUniforms : function () {
		this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
		this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
	},

	degToRad : function (degrees) {
		return degrees * Math.PI / 180;
	},

	drawScene : function () {

		var vertexIndexBuffers,
			vertexPositionBuffer,
			vertexColorBuffer,
			vertexTextureBuffer,
			transformations,
			i, material;

		var timeNow = new Date().getTime();
		if (this.lastTime != 0) {
			var elapsed = timeNow - this.lastTime;

			this.rTri += (90 * elapsed) / 1000000.0;
		}
		this.lastTime = timeNow;

		this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		glMatrix.mat4.perspective(45, this.gl.viewportWidth / this.gl.viewportHeight, 1, 10000.0, this.pMatrix);

		glMatrix.mat4.identity(this.mvMatrix);

		glMatrix.mat4.translate(this.mvMatrix, [0.0, 0.0, 0.2]);
		glMatrix.mat4.rotate(this.mvMatrix, this.rTri, [0, 1, 0]);

		// draw meshes
		for (i = 0; i < this.meshes.length; i++) {

			this.mvPushMatrix();

			/** @type {Object.<string, Buffer>} */
			vertexIndexBuffers = this.meshes[i].getVertexIndexBuffers();
			vertexPositionBuffer = this.meshes[i].getVertexPositionBuffer();
			vertexColorBuffer = this.meshes[i].getVertexColorBuffer();
			vertexTextureBuffer = this.meshes[i].getVertexTextureBuffer();
			transformations = this.meshes[i].getTransformations();

			// apply matrix transformations
			glMatrix.mat4.translate(this.mvMatrix,
				[transformations.position.x, transformations.position.y, transformations.position.z, 0.0]);
			glMatrix.mat4.rotate(this.mvMatrix, transformations.rotation.z, [0, 0, 1]);
			glMatrix.mat4.rotate(this.mvMatrix, transformations.rotation.y, [0, 1, 0]);
			glMatrix.mat4.rotate(this.mvMatrix, transformations.rotation.x, [1, 0, 0]);

			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexPositionBuffer);
			this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, vertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexColorBuffer);
			this.gl.vertexAttribPointer(this.shaderProgram.vertexColorAttribute, vertexColorBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

			for (material in vertexIndexBuffers) {
				if (vertexIndexBuffers.hasOwnProperty(material)) {

					if (!vertexIndexBuffers[material].material.ready) continue;

					// set texture if it has material, texture and texture already loaded
					if (material !== 'noMaterial' && vertexIndexBuffers[material].material.texture) {
						this.gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
						this.gl.uniform1i(this.shaderProgram.textureEnabled, true);

						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexTextureBuffer);
						this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, vertexTextureBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

						this.gl.activeTexture(this.gl.TEXTURE0);
						this.gl.bindTexture(this.gl.TEXTURE_2D, vertexIndexBuffers[material].material.texture);
						this.gl.uniform1i(this.shaderProgram.samplerUniform, 0);
					}
					else {
						this.gl.disableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
						this.gl.uniform1i(this.shaderProgram.textureEnabled, false);
					}

					//					this.gl.disableVertexAttribArray(this.shaderProgram.textureCoordAttribute);

					this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffers[material].buffer);
					this.setMatrixUniforms();
					this.gl.drawElements(this.gl.TRIANGLES, vertexIndexBuffers[material].buffer.numItems, this.gl.UNSIGNED_SHORT, 0);
				}
			}

			this.mvPopMatrix();
		}
	},

	/** @private */
	onResize : function () {
		if (this.inited) {
			this.canvasNode.setAttribute('width', window.innerWidth + 'px');
			this.canvasNode.setAttribute('height', window.innerHeight + 'px');
			this.gl.viewportWidth = window.innerWidth;
			this.gl.viewportHeight = window.innerHeight;
		}
	},

	/** @public
	 * @param {string} path
	 * @returns {Mesh|null} */
	createMeshFromFile : function (path) {
		var require = new XMLHttpRequest();

		require.open('GET', path, false);
		require.send(null);
		if (require.status == 200) {
			return this.parseObjFile(require.responseText, path);
		}
		return null;
	},

	/** @private
	 * @param objFile
	 * @param path
	 * @returns {Mesh} */
	parseObjFile : function (objFile, path) {
		var i, j, nodes, material,
			vertexes = [], textures = [], normals = [], faces = { noMaterial : [] },
			vertex = [], texture = [], normal = [], materials = {},
			currentMaterial = 'noMaterial',
			require, objList, mesh, materialPath;

		objList = objFile.split('\n');
		for (i = 0; i < objList.length; i++) {
			nodes = objList[i].split(' ');
			switch (nodes[0]) {
				case 'v':
					for (j = 1; j < nodes.length; j++) {
						if (nodes[j] === '') continue;
						vertexes.push(Number(nodes[j]));
					}
					break;

				case 'vt':
					/** @class VertexTexture */
					textures.push(Number(nodes[1]));
					textures.push(Number(nodes[2]));
					break;

				case 'vn':
					normal = [];
					for (j = 1; j < nodes.length; j++) {
						normal.push(Number(nodes[j]));
					}
					normals.push(normal);
					break;

				case 'f':
					if (nodes.length > 4) {
						//							console.log('face isn\'t triangle');
					}
					var lastFace = null, firstFace = null;
					for (j = 1; j < nodes.length && isNaN(nodes[j]); j++) {
						/** @class Face */
						var faceArray = nodes[j].split('/'), face;

						if (isNaN(faceArray[0])) break;

						face = {
							vertexIndex  : Number(faceArray[0]),
							textureIndex : faceArray.length > 1 ? Number(faceArray[1]) : 0,
							normalIndex  : faceArray.length > 2 ? Number(faceArray[2]) : 0
						};

						if (j >= 4) {
							faces[currentMaterial].push(firstFace);
							faces[currentMaterial].push(lastFace);
						}

						if (j === 1) {
							firstFace = face;
						}
						lastFace = face;

						faces[currentMaterial].push(face);
					}
					break;

				case 'mtllib':
					materialPath = path.substring(0, path.lastIndexOf("/") + 1) + nodes[1];
					require = new XMLHttpRequest();
					require.open('GET', materialPath, false);
					require.send(null);
					if (require.status == 200) {
						materials = this.parseMaterial(require.responseText, materialPath);
						for (material in materials) {
							if (materials.hasOwnProperty(material)) {
								faces[material] = [];
							}
						}
					}
					break;

				case 'usemtl':
					if (typeof materials[nodes[1]] !== 'undefined') {
						currentMaterial = nodes[1];
					}
					break;
			}
		}

		console.log('parsed');
		materials['noMaterial'] = new classes3d.Material();
		mesh = new Mesh(this.gl, vertexes, textures, normals, faces, materials);
		this.meshes.push(mesh);
		return mesh;
	},

	/** @private */
	parseMaterial : function (mtlFile, path) {
		var mtlList, i, j, nodes, material, texture,
			allMaterials = {}, currentMaterial = null;

		mtlList = mtlFile.split('\n');
		for (i = 0; i < mtlList.length; i++) {
			nodes = mtlList[i].split(' ');
			switch (nodes[0]) {
				case 'newmtl':
					material = new classes3d.Material();
					allMaterials[nodes[1]] = material;
					currentMaterial = material;
					break;

				case 'map_Kd':
					if (currentMaterial) {
						currentMaterial.ready = false;
						currentMaterial.imageLink = path.substring(0, path.lastIndexOf("/") + 1) + nodes[1];
						currentMaterial.texture = texture = this.gl.createTexture();

						texture.image = new Image();
						texture.image.onload = utils.bind(this.createTexture, this, currentMaterial);
						texture.image.src = currentMaterial.imageLink;
					}
					break;

				case 'Kd':
				{
					for (j = 1; j < nodes.length; j++) {
						currentMaterial.diffuseColor[j - 1] = Number(nodes[j]);
					}
				}
					break;
			}
		}
		return allMaterials;
	},

	/** @private */
	createTexture : function () {
		var gl = this.gl,
			currentMaterial = arguments[arguments.length - 1];
		gl.bindTexture(gl.TEXTURE_2D, currentMaterial.texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, currentMaterial.texture.image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);
		currentMaterial.ready = true;
	}
});

/** @public
 * @type {Object.<string, number>} */
Engine.TYPES = {
	render2d : 0,
	render3d : 1
};

module.exports = Engine;
	return module;
});

_require.def( "..\\..\\..\\app\\source\\game\\libs\\class.js", function( _require, exports, module ){
/* Simple JavaScript Inheritance by John Resig http://ejohn.org/ MIT Licensed. Inspired by base2 and Prototype */
/* description: http://blog.buymeasoda.com/understanding-john-resigs-simple-javascript-i/ */

/**
 * @version 0.1
 * - original John Resig inheritance
 */

	var initializing = false, fnTest = /xyz/.test((function () { return 'xyz'; }) + '') ? /\b_super\b/ : /.*/;

	/**
	 *  The base Class implementation (does nothing)
	 *  @class Class
	 *  @constructor
	 */
	function Class() {}

	/**
	 * Create a new Class that inherits from this class
	 * @public
	 * @param {object} childPrototype properties of Child Class
	 * @returns {Class} new constructed Class
	 */
	Class.extend = function (childPrototype) {
		var prototype, NewClass, name, _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		prototype = new this();
		initializing = false;

		// Copy the properties over onto the new prototype
		for (name in childPrototype) {
			if (childPrototype.hasOwnProperty(name)) {
				// Check if we're overwriting an existing function
				prototype[name] = typeof childPrototype[name] === "function" &&
					typeof _super[name] === "function" && fnTest.test(childPrototype[name]) ?
					(function (name, fn) {
						return function () {

							//noinspection JSUnresolvedVariable
							var ret, tmp = this._super;

							// Add a new ._super() method that is the same method
							// but on the super-class
							this._super = _super[name];

							// The method only need to be bound temporarily, so we
							// remove it when we're done executing
							ret = fn.apply(this, arguments);
							this._super = tmp;

							return ret;
						};
					})(name, childPrototype[name]) :
					childPrototype[name];
			}
		}

		// The dummy class constructor
		NewClass = function () {
			if (!initializing && this.init) {
				// All construction is actually done in the init method
				this.init.apply(this, arguments);
			}
		};

		// Populate our constructed prototype object
		NewClass.prototype = prototype;

		// Enforce the constructor to be what we expect
		NewClass.prototype.constructor = NewClass;

		// And make this class extendable
		NewClass.extend = this.extend;//arguments.callee;

		/** @constructs */
		NewClass.init = childPrototype.init || function () {};

		//noinspection JSValidateTypes
		return NewClass;
	};

module.exports = Class;
	return module;
});

_require.def( "..\\..\\..\\app\\source\\game\\libs\\utils.js", function( _require, exports, module ){
module.exports = {
	Console : function () {
		var consoleID = 'console-block',
			startTime = new Date().getTime(),
			consoleDiv = document.createElement('div');
		consoleDiv.id = consoleID;

		document.body.appendChild(consoleDiv);
		var console = document.getElementById(consoleID);

		this.log = function (msg) {
			var dt = new Date().getTime() - startTime;
			var time = '+' + dt.toString();
			for (var i = 10000; i > 9; i /= 10)
				if (dt < i) time = '&nbsp;' + time;
			var logDiv = document.createElement('div');
			logDiv.className = 'consoleItem';
			logDiv.innerHTML = time + ' > ' + msg;
			logDiv.style.color = this.getColor(dt);
			document.getElementById('console-block').insertBefore(logDiv,
				document.getElementById('console-block').firstChild);
			startTime += dt;
		};

		this.show = function () {
			var consoleDiv = nickNS.utils.getById('console-block');
			consoleDiv.style.display = 'block';
		};

		/**
		 * return string with color in rgb() format
		 * @param {number} value
		 */
		this.getColor = function (value) {
			if (value > 1000) value = 1000;
			if (value < 500) {
				return 'rgb(' +
					(( value / 500 * 255 ) | 0) + ', ' +
					(( (500 - value) / 500 * 255 ) | 0) + ', 0)';
			} else {
				return 'rgb(' +
					(( (value - 500) / 500 * 255 ) | 0) + ', ' +
					(( (1000 - value) / 500 * 255 ) | 0) + ', 0)';
			}
		};
	},

	/** @public */
	html : {
		/** @public
		 * @param {string} id */
		getById : function (id) {
			return document.getElementById(id);
		},

		/** Create and return HTML element (div as default)
		 * @public
		 * @param {object} parameters - all parameter of object
		 * @param {string} [tag] - HTML tag name
		 * @returns {HTMLElement} HTML element */
		createElement : function (parameters, tag) {
			if (typeof tag !== 'string')
				tag = 'div';
			var element = document.createElement(tag);
			return this.editElement(element, parameters);
		},

		/** @public */
		updateElement : function (elementID, parameters) {
			var element = document.getElementById(elementID);
			return this.editElement(element, parameters);
		},

		/** @public */
		removeElement : function (element) {
			if (typeof element !== 'object')
				element = this.getById(element);
			if (element && element.parentNode)
				element.parentNode.removeChild(element);
		},

		/** @public
		 * @param {object} element - HTML element
		 * @param {object} parameters
		 * @returns {HTMLElement} HTML element
		 */
		editElement : function (element, parameters) {
			for (var key in parameters) {
				if (parameters.hasOwnProperty(key) &&
					(typeof element[key] !== 'undefined' || key.substr(0, 5) === 'data-')) {
					if (typeof parameters[key] === 'object') {
						for (var subKey in parameters[key])
							if (parameters[key].hasOwnProperty(subKey) && subKey in element[key])
								element[key][subKey] = parameters[key][subKey];
					}
					else {
						if (key.substr(0, 5) === 'data-')
							element.setAttribute(key, parameters[key]);
						else
							element[key] = parameters[key];
					}
				}
			}
			return element;
		},

		/** @public */
		showElement : function (element, parameter) {
			var node = typeof element === 'string' ?
				document.getElementById(element) : element;
			if (typeof parameter !== 'string')
				parameter = 'block';
			if (node)
				node.style.display = parameter;
		},

		/** @public */
		hideElement : function (element) {
			var node = typeof element === 'string' ?
				document.getElementById(element) : element;
			if (node)
				node.style.display = 'none';
		}
	},

	/** creates function who will called with some this argument
	 * @public
	 * @param {function} callBackFunc
	 * @param {T} thisArg
	 * pram {...*} [args]
	 * @return {function(this:T)}
	 * @template T */
	bind : function (callBackFunc, thisArg) {
		var args = Array.prototype.slice.call(arguments, 2);
		return function () {
			var argv = Array.prototype.slice.call(arguments, 0);
			return callBackFunc.apply(thisArg, argv.concat(args));
		};
	},

	secondsToTime : function (totalSeconds, useZero) {
		var hours, minutes, seconds, time = '';
		if (typeof useZero === 'undefined')
			useZero = false;

		seconds = totalSeconds % 60;
		minutes = ((totalSeconds / 60) | 0);
		hours = ((totalSeconds / 3600) | 0);

		if (hours) {
			if (useZero && hours < 10)
				time += 0;
			time += hours + ':';
			useZero = true;
		}
		if (minutes) {
			if (useZero && minutes < 10)
				time += 0;
			time += minutes + ':';
			useZero = true;
		}
		if (useZero && seconds < 10)
			time += 0;
		time += seconds;

		return time;
	},

	clone : function (obj) {
		if (obj === null || typeof obj !== 'object')
			return obj;
		var temp = new obj.constructor();
		for (var key in obj)
			if (obj.hasOwnProperty(key))
				temp[key] = this.clone(obj[key]);
		return temp;
	},

	onError : function (message, url, lineNumber) {
		this.log('massage: ' + message);
		this.log('url: ' + url);
		this.log('lineNumber: ' + lineNumber);
	},

	toSpecialChars : function (text) {
		if (typeof text === 'string')
			text = text.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/ /g, "&nbsp;");
		return text;
	}
};

/** creates managed timeout based on setTimeout
 * @class {Timer} */
var Timer = function () {

	/** @private */
	this.timerInterval = null;
	/** @private */
	this.timerTimeout = null;
	/** @private */
	this.timerEnable = false;

	/** @private
	 * @type {function} */
	this.func = function () {};
	/** @private
	 * @type {object} */
	this.thisArg = {};
	/** @private
	 * @type {number} */
	this.timeout = 0;
	/** @private
	 * @type {number} */
	this.pauseTimeout = 0;
	/** @private
	 * @type {number} */
	this.startTime = 0;
	/** @private
	 * @type {boolean} */
	this.isItTimeout = false;
	/** @private
	 * @type {boolean} */
	this.isTimeoutMode = false;
};

Timer.prototype = {
	/** set function to timeout
	 * @public
	 * @param {function} func
	 * @param {object} thisArg
	 * @param {number} timeout
	 * @param {boolean} callOnce */
	start : function (func, thisArg, timeout, callOnce) {
		if (!this.timerInterval) {
			if (typeof func === 'function')
				this.func = func;
			else
				return;

			if (typeof thisArg === 'object' && thisArg !== null)
				this.thisArg = thisArg;
			else
				this.thisArg = {};

			if (typeof timeout === 'number')
				this.timeout = timeout;
			else
				this.timeout = 0;

			this.isItTimeout = typeof callOnce === 'boolean' ? callOnce : false;

			this.createTimer();
			this.timerEnable = true;
			this.isTimeoutMode = false;
		}
	},

	/** @public */
	pause : function () {
		if (this.timerEnable && this.timerInterval) {
			if (this.isTimeoutMode)
				clearTimeout(this.timerTimeout);
			else
				clearInterval(this.timerInterval);
			this.isTimeoutMode = true;
			this.timerInterval = null;
			this.pauseTimeout -= Date.now() - this.startTime;
			if (this.pauseTimeout < 0)
				this.pauseTimeout = 0;
		}
	},

	/** @public */
	resume : function () {
		if (this.timerEnable && !this.timerInterval) {

			var func = function (func, thisArg) {
				return function () {
					return func.apply(thisArg, arguments);
				};
			}.call(this, this.resumeInterval, this);

			this.startTime = Date.now();
			this.timerInterval = setTimeout(func, this.pauseTimeout);
		}
	},

	/** @public */
	stop : function () {
		if (this.timerEnable) {
			if (this.timerInterval)
				clearInterval(this.timerInterval);
			this.timerInterval = null;
			this.timerEnable = false;
		}
	},

	/** @public */
	isTimerEnabled : function () {
		return this.timerEnable;
	},

	/** @private */
	resumeInterval : function () {
		this.isTimeoutMode = false;
		this.createTimer();
	},

	/** @private */
	createTimer : function () {
		var func = function (func, thisArg) {
			return function () {
				return func.apply(thisArg, arguments);
			};
		}.call(this, this.nativeFunction, this);

		this.startTime = Date.now();
		this.timerInterval = setInterval(func, this.timeout);
	},

	/** @private */
	nativeFunction : function () {
		this.func.apply(this.thisArg);
		this.startTime = Date.now();
		if (this.isItTimeout)
			this.stop();
	}
};
	return module;
});

_require.def( "..\\..\\..\\app\\source\\game\\webGLEngine\\webGLConfig.js", function( _require, exports, module ){
module.exports = {
	version : '0.1',

	html : {
		canvasID : 'webGLCanvas'
	}
};

	return module;
});

_require.def( "..\\..\\..\\app\\source\\game\\webGLEngine\\glMatrix-0.9.5.min.js", function( _require, exports, module ){
// glMatrix v0.9.5
glMatrixArrayType=typeof Float32Array!="undefined"?Float32Array:typeof WebGLFloatArray!="undefined"?WebGLFloatArray:Array;var vec3={};vec3.create=function(a){var b=new glMatrixArrayType(3);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2]}return b};vec3.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];return b};vec3.add=function(a,b,c){if(!c||a==c){a[0]+=b[0];a[1]+=b[1];a[2]+=b[2];return a}c[0]=a[0]+b[0];c[1]=a[1]+b[1];c[2]=a[2]+b[2];return c};
vec3.subtract=function(a,b,c){if(!c||a==c){a[0]-=b[0];a[1]-=b[1];a[2]-=b[2];return a}c[0]=a[0]-b[0];c[1]=a[1]-b[1];c[2]=a[2]-b[2];return c};vec3.negate=function(a,b){b||(b=a);b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];return b};vec3.scale=function(a,b,c){if(!c||a==c){a[0]*=b;a[1]*=b;a[2]*=b;return a}c[0]=a[0]*b;c[1]=a[1]*b;c[2]=a[2]*b;return c};
vec3.normalize=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=Math.sqrt(c*c+d*d+e*e);if(g){if(g==1){b[0]=c;b[1]=d;b[2]=e;return b}}else{b[0]=0;b[1]=0;b[2]=0;return b}g=1/g;b[0]=c*g;b[1]=d*g;b[2]=e*g;return b};vec3.cross=function(a,b,c){c||(c=a);var d=a[0],e=a[1];a=a[2];var g=b[0],f=b[1];b=b[2];c[0]=e*b-a*f;c[1]=a*g-d*b;c[2]=d*f-e*g;return c};vec3.length=function(a){var b=a[0],c=a[1];a=a[2];return Math.sqrt(b*b+c*c+a*a)};vec3.dot=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]};
vec3.direction=function(a,b,c){c||(c=a);var d=a[0]-b[0],e=a[1]-b[1];a=a[2]-b[2];b=Math.sqrt(d*d+e*e+a*a);if(!b){c[0]=0;c[1]=0;c[2]=0;return c}b=1/b;c[0]=d*b;c[1]=e*b;c[2]=a*b;return c};vec3.lerp=function(a,b,c,d){d||(d=a);d[0]=a[0]+c*(b[0]-a[0]);d[1]=a[1]+c*(b[1]-a[1]);d[2]=a[2]+c*(b[2]-a[2]);return d};vec3.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+"]"};var mat3={};
mat3.create=function(a){var b=new glMatrixArrayType(9);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9]}return b};mat3.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];return b};mat3.identity=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=1;a[5]=0;a[6]=0;a[7]=0;a[8]=1;return a};
mat3.transpose=function(a,b){if(!b||a==b){var c=a[1],d=a[2],e=a[5];a[1]=a[3];a[2]=a[6];a[3]=c;a[5]=a[7];a[6]=d;a[7]=e;return a}b[0]=a[0];b[1]=a[3];b[2]=a[6];b[3]=a[1];b[4]=a[4];b[5]=a[7];b[6]=a[2];b[7]=a[5];b[8]=a[8];return b};mat3.toMat4=function(a,b){b||(b=mat4.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=0;b[4]=a[3];b[5]=a[4];b[6]=a[5];b[7]=0;b[8]=a[6];b[9]=a[7];b[10]=a[8];b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
mat3.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+"]"};var mat4={};mat4.create=function(a){var b=new glMatrixArrayType(16);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15]}return b};
mat4.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15];return b};mat4.identity=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=0;a[5]=1;a[6]=0;a[7]=0;a[8]=0;a[9]=0;a[10]=1;a[11]=0;a[12]=0;a[13]=0;a[14]=0;a[15]=1;return a};
mat4.transpose=function(a,b){if(!b||a==b){var c=a[1],d=a[2],e=a[3],g=a[6],f=a[7],h=a[11];a[1]=a[4];a[2]=a[8];a[3]=a[12];a[4]=c;a[6]=a[9];a[7]=a[13];a[8]=d;a[9]=g;a[11]=a[14];a[12]=e;a[13]=f;a[14]=h;return a}b[0]=a[0];b[1]=a[4];b[2]=a[8];b[3]=a[12];b[4]=a[1];b[5]=a[5];b[6]=a[9];b[7]=a[13];b[8]=a[2];b[9]=a[6];b[10]=a[10];b[11]=a[14];b[12]=a[3];b[13]=a[7];b[14]=a[11];b[15]=a[15];return b};
mat4.determinant=function(a){var b=a[0],c=a[1],d=a[2],e=a[3],g=a[4],f=a[5],h=a[6],i=a[7],j=a[8],k=a[9],l=a[10],o=a[11],m=a[12],n=a[13],p=a[14];a=a[15];return m*k*h*e-j*n*h*e-m*f*l*e+g*n*l*e+j*f*p*e-g*k*p*e-m*k*d*i+j*n*d*i+m*c*l*i-b*n*l*i-j*c*p*i+b*k*p*i+m*f*d*o-g*n*d*o-m*c*h*o+b*n*h*o+g*c*p*o-b*f*p*o-j*f*d*a+g*k*d*a+j*c*h*a-b*k*h*a-g*c*l*a+b*f*l*a};
mat4.inverse=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=a[4],h=a[5],i=a[6],j=a[7],k=a[8],l=a[9],o=a[10],m=a[11],n=a[12],p=a[13],r=a[14],s=a[15],A=c*h-d*f,B=c*i-e*f,t=c*j-g*f,u=d*i-e*h,v=d*j-g*h,w=e*j-g*i,x=k*p-l*n,y=k*r-o*n,z=k*s-m*n,C=l*r-o*p,D=l*s-m*p,E=o*s-m*r,q=1/(A*E-B*D+t*C+u*z-v*y+w*x);b[0]=(h*E-i*D+j*C)*q;b[1]=(-d*E+e*D-g*C)*q;b[2]=(p*w-r*v+s*u)*q;b[3]=(-l*w+o*v-m*u)*q;b[4]=(-f*E+i*z-j*y)*q;b[5]=(c*E-e*z+g*y)*q;b[6]=(-n*w+r*t-s*B)*q;b[7]=(k*w-o*t+m*B)*q;b[8]=(f*D-h*z+j*x)*q;
b[9]=(-c*D+d*z-g*x)*q;b[10]=(n*v-p*t+s*A)*q;b[11]=(-k*v+l*t-m*A)*q;b[12]=(-f*C+h*y-i*x)*q;b[13]=(c*C-d*y+e*x)*q;b[14]=(-n*u+p*B-r*A)*q;b[15]=(k*u-l*B+o*A)*q;return b};mat4.toRotationMat=function(a,b){b||(b=mat4.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
mat4.toMat3=function(a,b){b||(b=mat3.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[4];b[4]=a[5];b[5]=a[6];b[6]=a[8];b[7]=a[9];b[8]=a[10];return b};mat4.toInverseMat3=function(a,b){var c=a[0],d=a[1],e=a[2],g=a[4],f=a[5],h=a[6],i=a[8],j=a[9],k=a[10],l=k*f-h*j,o=-k*g+h*i,m=j*g-f*i,n=c*l+d*o+e*m;if(!n)return null;n=1/n;b||(b=mat3.create());b[0]=l*n;b[1]=(-k*d+e*j)*n;b[2]=(h*d-e*f)*n;b[3]=o*n;b[4]=(k*c-e*i)*n;b[5]=(-h*c+e*g)*n;b[6]=m*n;b[7]=(-j*c+d*i)*n;b[8]=(f*c-d*g)*n;return b};
mat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2],f=a[3],h=a[4],i=a[5],j=a[6],k=a[7],l=a[8],o=a[9],m=a[10],n=a[11],p=a[12],r=a[13],s=a[14];a=a[15];var A=b[0],B=b[1],t=b[2],u=b[3],v=b[4],w=b[5],x=b[6],y=b[7],z=b[8],C=b[9],D=b[10],E=b[11],q=b[12],F=b[13],G=b[14];b=b[15];c[0]=A*d+B*h+t*l+u*p;c[1]=A*e+B*i+t*o+u*r;c[2]=A*g+B*j+t*m+u*s;c[3]=A*f+B*k+t*n+u*a;c[4]=v*d+w*h+x*l+y*p;c[5]=v*e+w*i+x*o+y*r;c[6]=v*g+w*j+x*m+y*s;c[7]=v*f+w*k+x*n+y*a;c[8]=z*d+C*h+D*l+E*p;c[9]=z*e+C*i+D*o+E*r;c[10]=z*
g+C*j+D*m+E*s;c[11]=z*f+C*k+D*n+E*a;c[12]=q*d+F*h+G*l+b*p;c[13]=q*e+F*i+G*o+b*r;c[14]=q*g+F*j+G*m+b*s;c[15]=q*f+F*k+G*n+b*a;return c};mat4.multiplyVec3=function(a,b,c){c||(c=b);var d=b[0],e=b[1];b=b[2];c[0]=a[0]*d+a[4]*e+a[8]*b+a[12];c[1]=a[1]*d+a[5]*e+a[9]*b+a[13];c[2]=a[2]*d+a[6]*e+a[10]*b+a[14];return c};
mat4.multiplyVec4=function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2];b=b[3];c[0]=a[0]*d+a[4]*e+a[8]*g+a[12]*b;c[1]=a[1]*d+a[5]*e+a[9]*g+a[13]*b;c[2]=a[2]*d+a[6]*e+a[10]*g+a[14]*b;c[3]=a[3]*d+a[7]*e+a[11]*g+a[15]*b;return c};
mat4.translate=function(a,b,c){var d=b[0],e=b[1];b=b[2];if(!c||a==c){a[12]=a[0]*d+a[4]*e+a[8]*b+a[12];a[13]=a[1]*d+a[5]*e+a[9]*b+a[13];a[14]=a[2]*d+a[6]*e+a[10]*b+a[14];a[15]=a[3]*d+a[7]*e+a[11]*b+a[15];return a}var g=a[0],f=a[1],h=a[2],i=a[3],j=a[4],k=a[5],l=a[6],o=a[7],m=a[8],n=a[9],p=a[10],r=a[11];c[0]=g;c[1]=f;c[2]=h;c[3]=i;c[4]=j;c[5]=k;c[6]=l;c[7]=o;c[8]=m;c[9]=n;c[10]=p;c[11]=r;c[12]=g*d+j*e+m*b+a[12];c[13]=f*d+k*e+n*b+a[13];c[14]=h*d+l*e+p*b+a[14];c[15]=i*d+o*e+r*b+a[15];return c};
mat4.scale=function(a,b,c){var d=b[0],e=b[1];b=b[2];if(!c||a==c){a[0]*=d;a[1]*=d;a[2]*=d;a[3]*=d;a[4]*=e;a[5]*=e;a[6]*=e;a[7]*=e;a[8]*=b;a[9]*=b;a[10]*=b;a[11]*=b;return a}c[0]=a[0]*d;c[1]=a[1]*d;c[2]=a[2]*d;c[3]=a[3]*d;c[4]=a[4]*e;c[5]=a[5]*e;c[6]=a[6]*e;c[7]=a[7]*e;c[8]=a[8]*b;c[9]=a[9]*b;c[10]=a[10]*b;c[11]=a[11]*b;c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15];return c};
mat4.rotate=function(a,b,c,d){var e=c[0],g=c[1];c=c[2];var f=Math.sqrt(e*e+g*g+c*c);if(!f)return null;if(f!=1){f=1/f;e*=f;g*=f;c*=f}var h=Math.sin(b),i=Math.cos(b),j=1-i;b=a[0];f=a[1];var k=a[2],l=a[3],o=a[4],m=a[5],n=a[6],p=a[7],r=a[8],s=a[9],A=a[10],B=a[11],t=e*e*j+i,u=g*e*j+c*h,v=c*e*j-g*h,w=e*g*j-c*h,x=g*g*j+i,y=c*g*j+e*h,z=e*c*j+g*h;e=g*c*j-e*h;g=c*c*j+i;if(d){if(a!=d){d[12]=a[12];d[13]=a[13];d[14]=a[14];d[15]=a[15]}}else d=a;d[0]=b*t+o*u+r*v;d[1]=f*t+m*u+s*v;d[2]=k*t+n*u+A*v;d[3]=l*t+p*u+B*
v;d[4]=b*w+o*x+r*y;d[5]=f*w+m*x+s*y;d[6]=k*w+n*x+A*y;d[7]=l*w+p*x+B*y;d[8]=b*z+o*e+r*g;d[9]=f*z+m*e+s*g;d[10]=k*z+n*e+A*g;d[11]=l*z+p*e+B*g;return d};mat4.rotateX=function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[4],g=a[5],f=a[6],h=a[7],i=a[8],j=a[9],k=a[10],l=a[11];if(c){if(a!=c){c[0]=a[0];c[1]=a[1];c[2]=a[2];c[3]=a[3];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[4]=e*b+i*d;c[5]=g*b+j*d;c[6]=f*b+k*d;c[7]=h*b+l*d;c[8]=e*-d+i*b;c[9]=g*-d+j*b;c[10]=f*-d+k*b;c[11]=h*-d+l*b;return c};
mat4.rotateY=function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[0],g=a[1],f=a[2],h=a[3],i=a[8],j=a[9],k=a[10],l=a[11];if(c){if(a!=c){c[4]=a[4];c[5]=a[5];c[6]=a[6];c[7]=a[7];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[0]=e*b+i*-d;c[1]=g*b+j*-d;c[2]=f*b+k*-d;c[3]=h*b+l*-d;c[8]=e*d+i*b;c[9]=g*d+j*b;c[10]=f*d+k*b;c[11]=h*d+l*b;return c};
mat4.rotateZ=function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[0],g=a[1],f=a[2],h=a[3],i=a[4],j=a[5],k=a[6],l=a[7];if(c){if(a!=c){c[8]=a[8];c[9]=a[9];c[10]=a[10];c[11]=a[11];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[0]=e*b+i*d;c[1]=g*b+j*d;c[2]=f*b+k*d;c[3]=h*b+l*d;c[4]=e*-d+i*b;c[5]=g*-d+j*b;c[6]=f*-d+k*b;c[7]=h*-d+l*b;return c};
mat4.frustum=function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=e*2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=e*2/i;f[6]=0;f[7]=0;f[8]=(b+a)/h;f[9]=(d+c)/i;f[10]=-(g+e)/j;f[11]=-1;f[12]=0;f[13]=0;f[14]=-(g*e*2)/j;f[15]=0;return f};mat4.perspective=function(a,b,c,d,e){a=c*Math.tan(a*Math.PI/360);b=a*b;return mat4.frustum(-b,b,-a,a,c,d,e)};
mat4.ortho=function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=2/i;f[6]=0;f[7]=0;f[8]=0;f[9]=0;f[10]=-2/j;f[11]=0;f[12]=-(a+b)/h;f[13]=-(d+c)/i;f[14]=-(g+e)/j;f[15]=1;return f};
mat4.lookAt=function(a,b,c,d){d||(d=mat4.create());var e=a[0],g=a[1];a=a[2];var f=c[0],h=c[1],i=c[2];c=b[1];var j=b[2];if(e==b[0]&&g==c&&a==j)return mat4.identity(d);var k,l,o,m;c=e-b[0];j=g-b[1];b=a-b[2];m=1/Math.sqrt(c*c+j*j+b*b);c*=m;j*=m;b*=m;k=h*b-i*j;i=i*c-f*b;f=f*j-h*c;if(m=Math.sqrt(k*k+i*i+f*f)){m=1/m;k*=m;i*=m;f*=m}else f=i=k=0;h=j*f-b*i;l=b*k-c*f;o=c*i-j*k;if(m=Math.sqrt(h*h+l*l+o*o)){m=1/m;h*=m;l*=m;o*=m}else o=l=h=0;d[0]=k;d[1]=h;d[2]=c;d[3]=0;d[4]=i;d[5]=l;d[6]=j;d[7]=0;d[8]=f;d[9]=
o;d[10]=b;d[11]=0;d[12]=-(k*e+i*g+f*a);d[13]=-(h*e+l*g+o*a);d[14]=-(c*e+j*g+b*a);d[15]=1;return d};mat4.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+", "+a[9]+", "+a[10]+", "+a[11]+", "+a[12]+", "+a[13]+", "+a[14]+", "+a[15]+"]"};quat4={};quat4.create=function(a){var b=new glMatrixArrayType(4);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3]}return b};quat4.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];return b};
quat4.calculateW=function(a,b){var c=a[0],d=a[1],e=a[2];if(!b||a==b){a[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e));return a}b[0]=c;b[1]=d;b[2]=e;b[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e));return b};quat4.inverse=function(a,b){if(!b||a==b){a[0]*=1;a[1]*=1;a[2]*=1;return a}b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];b[3]=a[3];return b};quat4.length=function(a){var b=a[0],c=a[1],d=a[2];a=a[3];return Math.sqrt(b*b+c*c+d*d+a*a)};
quat4.normalize=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=Math.sqrt(c*c+d*d+e*e+g*g);if(f==0){b[0]=0;b[1]=0;b[2]=0;b[3]=0;return b}f=1/f;b[0]=c*f;b[1]=d*f;b[2]=e*f;b[3]=g*f;return b};quat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2];a=a[3];var f=b[0],h=b[1],i=b[2];b=b[3];c[0]=d*b+a*f+e*i-g*h;c[1]=e*b+a*h+g*f-d*i;c[2]=g*b+a*i+d*h-e*f;c[3]=a*b-d*f-e*h-g*i;return c};
quat4.multiplyVec3=function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2];b=a[0];var f=a[1],h=a[2];a=a[3];var i=a*d+f*g-h*e,j=a*e+h*d-b*g,k=a*g+b*e-f*d;d=-b*d-f*e-h*g;c[0]=i*a+d*-b+j*-h-k*-f;c[1]=j*a+d*-f+k*-b-i*-h;c[2]=k*a+d*-h+i*-f-j*-b;return c};quat4.toMat3=function(a,b){b||(b=mat3.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c=c*i;var l=d*h;d=d*i;e=e*i;f=g*f;h=g*h;g=g*i;b[0]=1-(l+e);b[1]=k-g;b[2]=c+h;b[3]=k+g;b[4]=1-(j+e);b[5]=d-f;b[6]=c-h;b[7]=d+f;b[8]=1-(j+l);return b};
quat4.toMat4=function(a,b){b||(b=mat4.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c=c*i;var l=d*h;d=d*i;e=e*i;f=g*f;h=g*h;g=g*i;b[0]=1-(l+e);b[1]=k-g;b[2]=c+h;b[3]=0;b[4]=k+g;b[5]=1-(j+e);b[6]=d-f;b[7]=0;b[8]=c-h;b[9]=d+f;b[10]=1-(j+l);b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};quat4.slerp=function(a,b,c,d){d||(d=a);var e=c;if(a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3]<0)e=-1*c;d[0]=1-c*a[0]+e*b[0];d[1]=1-c*a[1]+e*b[1];d[2]=1-c*a[2]+e*b[2];d[3]=1-c*a[3]+e*b[3];return d};
quat4.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+"]"};
	module.exports.mat4 = mat4;
	return module;
});

_require.def( "..\\..\\..\\app\\source\\game\\webGLEngine\\classes3d.js", function( _require, exports, module ){
var classes3D = {
	/** @class Vector3
	 * @extends {Class} */
	Vector3 : function (x, y, z) {
		this._x = 0;
		this._y = 0;
		this._z = 0;

		this.set.apply(this, arguments);
	},

	/**
	 * @class
	 * @returns {{diffuseColor: number[], imageLink: string, ready: boolean, texture: null}}
	 * @constructor
	 */
	Material : function () {
		this.diffuseColor = [0, 0, 0];
		this.imageLink = '';
		this.ready = true;
		this.texture = null;
	}
};

classes3D.Vector3.prototype = {

	/** @public */
	set : function (x, y, z) {
		this._x = typeof x === 'number' ? x : 0;
		this._y = typeof y === 'number' ? y : 0;
		this._z = typeof z === 'number' ? z : 0;
	},

	/** @public */
	get x() { return this._x; },
	/** @public */
	get y() { return this._y; },
	/** @public */
	get z() { return this._z; },

	/** @public */
	set x(value) { if (typeof value === 'number') this._x = value; },
	/** @public */
	set y(value) { if (typeof value === 'number') this._y = value; },
	/** @public */
	set z(value) { if (typeof value === 'number') this._z = value; }
};

module.exports = classes3D;
	return module;
});

_require.def( "..\\..\\..\\app\\source\\game\\webGLEngine\\mesh.js", function( _require, exports, module ){
var Class = _require( "..\\..\\..\\app\\source\\game\\libs\\class.js" ),
	classes3D = _require( "..\\..\\..\\app\\source\\game\\webGLEngine\\classes3D.js" );

/** @class Mesh
 * @extends {Class} */
var Mesh = Class.extend(/** @lends {Mesh#} */ {
	/** @param {WebGLRenderingContext}  webGL
	 * @param {Array.<number>} vertexes
	 * @param {Array.<number>} vertexTexture
	 * @param {Array.<number>} vertexNormals
	 * @param {Array.<number>} faces
	 * @param {Array.<object>} materials
	 * @constructs */
	init : function (webGL, vertexes, vertexTexture, vertexNormals, faces, materials) {

		/** @type {WebGLRenderingContext} */
		this._webGL = webGL;

		this._vertexes = vertexes;
		this._vertextTextures = vertexTexture;
		this._vertexNormals = vertexNormals;
		this._faces = faces;
		this._materials = materials;

		/** @private
		 * @type {{position: classes3D.Vector3, rotation: classes3D.Vector3, scale: classes3D.Vector3}} */
		this._transformations = {
			position: new classes3D.Vector3(0, 0, 0),
			rotation: new classes3D.Vector3(0, 0, 0),
			scale: new classes3D.Vector3(0, 0, 0)
		};

		this._vertexIndexBuffers = {};

		/** @type {WebGLBuffer} */
		this._vertexPositionBuffer = this._webGL.createBuffer();

		/** @type {WebGLBuffer} */
		this._vertexColorBuffer = this._webGL.createBuffer();

		/** @type {WebGLBuffer} */
		this._vertexTextureBuffer = this._webGL.createBuffer();

		this.initBuffers();
	},

	/** @private */
	initBuffers : function () {
		var colors = [], indexes = [], textures = [],
			i, j, material, vertexIndexBuffer,
			colorIndex;

		/** @type {Buffer} */
		lastMaterialName = null;

		// create vertex index buffer
		this._webGL.bindBuffer(this._webGL.ARRAY_BUFFER, this._vertexPositionBuffer);
		this._webGL.bufferData(this._webGL.ARRAY_BUFFER, new Float32Array(this._vertexes), this._webGL.STATIC_DRAW);
		this._vertexPositionBuffer.itemSize = 3;
		this._vertexPositionBuffer.numItems = this._vertexes.length / this._vertexPositionBuffer.itemSize;

		for (i = 0; i < this._vertexes.length / 3; i++) {
			colors.push(0);
			colors.push(0);
			colors.push(0);
			colors.push(1);
			textures.push(0);
			textures.push(0);
		}

		for (material in this._faces) {
			if (this._faces.hasOwnProperty(material)) {

				if (this._faces[material].length === 0) continue;

				indexes = [];
				for (i = 0; i < this._faces[material].length; i++) {
					colorIndex = (this._faces[material][i].vertexIndex - 1) * 4;

					indexes.push(this._faces[material][i].vertexIndex - 1);
					textures[(this._faces[material][i].vertexIndex - 1) * 2] = this._vertextTextures[(this._faces[material][i].textureIndex - 1) * 2];
					textures[(this._faces[material][i].vertexIndex - 1) * 2 + 1] = this._vertextTextures[(this._faces[material][i].textureIndex - 1) * 2 + 1];
					for (j = 0; j < 3; j++) {
						colors[colorIndex + j] = this._materials[material].diffuseColor[j];
					}
				}

				vertexIndexBuffer = this._webGL.createBuffer();
				this._webGL.bindBuffer(this._webGL.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
				this._webGL.bufferData(this._webGL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), this._webGL.STATIC_DRAW);
				vertexIndexBuffer.itemSize = 1;
				vertexIndexBuffer.numItems = indexes.length / vertexIndexBuffer.itemSize;

				this._vertexIndexBuffers[material] = {
					material : this._materials[material],
					buffer   : vertexIndexBuffer
				};
			}
		}

		// create vertex color buffer
		this._webGL.bindBuffer(this._webGL.ARRAY_BUFFER, this._vertexColorBuffer);
		this._webGL.bufferData(this._webGL.ARRAY_BUFFER, new Float32Array(colors), this._webGL.STATIC_DRAW);
		this._vertexColorBuffer.itemSize = 4;
		this._vertexColorBuffer.numItems = colors.length / this._vertexColorBuffer.itemSize;

		// create vertex texture buffer
		this._webGL.bindBuffer(this._webGL.ARRAY_BUFFER, this._vertexTextureBuffer);
		this._webGL.bufferData(this._webGL.ARRAY_BUFFER, new Float32Array(textures), this._webGL.STATIC_DRAW);
		this._vertexTextureBuffer.itemSize = 2;
		this._vertexTextureBuffer.numItems = this._vertextTextures.length / this._vertexTextureBuffer.itemSize;
	},

	/** @public */
	getVertexIndexBuffers : function () {
		return this._vertexIndexBuffers;
	},

	/** @public */
	getVertexPositionBuffer : function () {
		return this._vertexPositionBuffer
	},

	/** @public */
	getVertexColorBuffer : function () {
		return this._vertexColorBuffer;
	},

	/** @public */
	getVertexTextureBuffer : function () {
		return this._vertexTextureBuffer;
	},

	/** @public
	 * @returns {{position: classes3D.Vector3, rotation: classes3D.Vector3, scale: classes3D.Vector3}} */
	getTransformations : function () {
		return this._transformations;
	}
});

module.exports = Mesh;
	return module;
});

_require.def( "..\\..\\..\\app\\source\\game\\webGLEngine\\classes3D.js", function( _require, exports, module ){
var classes3D = {
	/** @class Vector3
	 * @extends {Class} */
	Vector3 : function (x, y, z) {
		this._x = 0;
		this._y = 0;
		this._z = 0;

		this.set.apply(this, arguments);
	},

	/**
	 * @class
	 * @returns {{diffuseColor: number[], imageLink: string, ready: boolean, texture: null}}
	 * @constructor
	 */
	Material : function () {
		this.diffuseColor = [0, 0, 0];
		this.imageLink = '';
		this.ready = true;
		this.texture = null;
	}
};

classes3D.Vector3.prototype = {

	/** @public */
	set : function (x, y, z) {
		this._x = typeof x === 'number' ? x : 0;
		this._y = typeof y === 'number' ? y : 0;
		this._z = typeof z === 'number' ? z : 0;
	},

	/** @public */
	get x() { return this._x; },
	/** @public */
	get y() { return this._y; },
	/** @public */
	get z() { return this._z; },

	/** @public */
	set x(value) { if (typeof value === 'number') this._x = value; },
	/** @public */
	set y(value) { if (typeof value === 'number') this._y = value; },
	/** @public */
	set z(value) { if (typeof value === 'number') this._z = value; }
};

module.exports = classes3D;
	return module;
});

(function(){
_require( "..\\..\\..\\app\\source\\game\\main.js" );
}());

//# sourceMappingURL=./bundle.js.map