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
_require.def( "..\\..\\source\\webGLEngine.js", function( _require, exports, module ){
var glMatrix = _require( "..\\..\\source\\libs\\glMatrix.js" );
var Class = _require( "..\\..\\source\\libs\\class.js" ),
	Mesh = _require( "..\\..\\source\\classes\\Mesh.js" ),
	Face = _require( "..\\..\\source\\classes\\Face.js" ),
	Light = _require( "..\\..\\source\\classes\\Light.js" ),
	utils = _require( "..\\..\\source\\libs\\utils.js" ),
	config = _require( "..\\..\\source\\webGLConfig.js" ),
	Material = _require( "..\\..\\source\\classes\\Material.js" ),
	Transformations = _require( "..\\..\\source\\classes\\Transformations.js" );

/** @class webGLEngine
 * @extends {Class} */
var webGLEngine = Class.extend(/** @lends {webGLEngine#} */ {

	/** @constructs */
	init : function () {

		/** @private
		 * @type {CanvasRenderingContext2D|null} */
		this._gl = null;

		/** @private */
		this._inited = false;

		/** @private
		 * @type {HTMLCanvasElement|null} */
		this._canvasNode = null;

		/** @private
		 * @type {Float32Array} */
		this.mvMatrix = glMatrix.mat4.create(undefined);
		/** @private */
		this.pMatrix = glMatrix.mat4.create(undefined);
		/** @private */
		this.mvMatrixStack = [];

		/** @private
		 * @type {Transformations} */
		this._camera = new Transformations();

		/** @private
		 * @type {Array.<Mesh>} */
		this._meshes = [];

		/** @type {Array.<Light>}
		 * @private */
		this._lights = [];

		/** @private */
		this._shaderProgram = null;

		/** @private
		 * @type {boolean} */
		this._isLightingEnable = true;

		/** @public
		 * @type {{Material: (Material|exports)}} */
		this.classes = {
			Material : Material,
			Face     : Face
		};

		window.addEventListener('resize', utils.bind(this.onResize, this), false);
		this.webGLStart();
	},

	/** @private */
	webGLStart : function () {
		this.crateCanvas();
		this.initGL();
		this.initShaders();

		//		this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this._gl.enable(this._gl.DEPTH_TEST);
	},

	/** @private */
	crateCanvas : function () {
		this._canvasNode = document.getElementById(config.html.canvasID);
		if (this._canvasNode === null) {
			this._canvasNode = document.createElement('canvas');
			this._canvasNode.id = config.html.canvasID;
			this._canvasNode.style.position = 'fixed';
			this._canvasNode.style.left = '0px';
			this._canvasNode.style.top = '0px';
			document.body.appendChild(this._canvasNode);
		}
	},

	/** @private */
	initGL : function () {
		try {
			this._gl = this._canvasNode.getContext("webgl") || this._canvasNode.getContext("experimental-webgl");
			this._inited = true;
			this.onResize();
		}
		catch (e) {
		}
		if (!this._gl) {
			console.log("Could not initialise WebGL, sorry :-(");
		}
	},

	/** @private */
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

	/** @private */
	initShaders : function () {
		var fragmentShader = this.getShader(this._gl, "shader-fs");
		var vertexShader = this.getShader(this._gl, "shader-vs");

		this._shaderProgram = this._gl.createProgram();
		this._gl.attachShader(this._shaderProgram, vertexShader);
		this._gl.attachShader(this._shaderProgram, fragmentShader);
		this._gl.linkProgram(this._shaderProgram);

		if (!this._gl.getProgramParameter(this._shaderProgram, this._gl.LINK_STATUS)) {
			console.log("Could not initialise shaders");
		}

		this._gl.useProgram(this._shaderProgram);

		this._shaderProgram.vertexPositionAttribute = this._gl.getAttribLocation(this._shaderProgram, "aVertexPosition");
		this._gl.enableVertexAttribArray(this._shaderProgram.vertexPositionAttribute);

		this._shaderProgram.vertexNormalAttribute = this._gl.getAttribLocation(this._shaderProgram, "aVertexNormal");
		this._gl.enableVertexAttribArray(this._shaderProgram.vertexNormalAttribute);

		this._shaderProgram.vertexColorAttribute = this._gl.getAttribLocation(this._shaderProgram, "aVertexColor");
		this._gl.enableVertexAttribArray(this._shaderProgram.vertexColorAttribute);

		this._shaderProgram.textureCoordAttribute = this._gl.getAttribLocation(this._shaderProgram, "aTextureCoord");
		this._gl.enableVertexAttribArray(this._shaderProgram.textureCoordAttribute);

		this._shaderProgram.pMatrixUniform = this._gl.getUniformLocation(this._shaderProgram, "uPMatrix");
		this._shaderProgram.mvMatrixUniform = this._gl.getUniformLocation(this._shaderProgram, "uMVMatrix");
		this._shaderProgram.nMatrixUniform = this._gl.getUniformLocation(this._shaderProgram, "uNMatrix");
		this._shaderProgram.samplerUniform = this._gl.getUniformLocation(this._shaderProgram, "uSampler");
		this._shaderProgram.useLightingUniform = this._gl.getUniformLocation(this._shaderProgram, "uUseLighting");
		this._shaderProgram.useLightUniform = this._gl.getUniformLocation(this._shaderProgram, "uUseLight");
		this._shaderProgram.ambientColorUniform = this._gl.getUniformLocation(this._shaderProgram, "uAmbientColor");
		this._shaderProgram.lightingPositionUniform = this._gl.getUniformLocation(this._shaderProgram, "uLightPosition");
		this._shaderProgram.lightColorUniform = this._gl.getUniformLocation(this._shaderProgram, "uLightColor");
		this._shaderProgram.lightingDistanceUniform = this._gl.getUniformLocation(this._shaderProgram, "uLightDistance");
		this._shaderProgram.textureEnabled = this._gl.getUniformLocation(this._shaderProgram, "uUseTexture");
		this._shaderProgram.materialSpecular = this._gl.getUniformLocation(this._shaderProgram, "uMaterialSpecular");
	},

	/** @private */
	mvPushMatrix : function () {
		var copy = glMatrix.mat4.create(undefined);
		glMatrix.mat4.set(this.mvMatrix, copy);
		this.mvMatrixStack.push(copy);
	},

	/** @private */
	mvPopMatrix : function () {
		if (this.mvMatrixStack.length == 0) {
			throw "Invalid popMatrix!";
		}
		this.mvMatrix = this.mvMatrixStack.pop();
	},

	/** @private */
	setMatrixUniforms : function () {
		this._gl.uniformMatrix4fv(this._shaderProgram.pMatrixUniform, false, this.pMatrix);
		this._gl.uniformMatrix4fv(this._shaderProgram.mvMatrixUniform, false, this.mvMatrix);

		var normalMatrix = glMatrix.mat3.create(undefined);
		glMatrix.mat4.toInverseMat3(this.mvMatrix, normalMatrix);
		glMatrix.mat3.transpose(normalMatrix);
		this._gl.uniformMatrix3fv(this._shaderProgram.nMatrixUniform, false, normalMatrix);
	},

	/** @private */
	degToRad : function (degrees) {
		return degrees * Math.PI / 180;
	},

	/** @public */
	beginDraw : function () {
		this._gl.viewport(0, 0, this._gl.viewportWidth, this._gl.viewportHeight);
		this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

		glMatrix.mat4.perspective(45, this._gl.viewportWidth / this._gl.viewportHeight, 1, 1000000.0, this.pMatrix);

		glMatrix.mat4.identity(this.mvMatrix);

		// set camera position
		glMatrix.mat4.rotateX(this.mvMatrix, this._camera.rotation.x);
		glMatrix.mat4.rotateY(this.mvMatrix, this._camera.rotation.y);
		glMatrix.mat4.rotateZ(this.mvMatrix, this._camera.rotation.z);
		glMatrix.mat4.translate(this.mvMatrix, this._camera.position.getArray());

		if (true) {
			this._gl.blendFunc(this._gl.ONE, this._gl.ONE);
			this._gl.enable(this._gl.BLEND);
			this._gl.disable(this._gl.DEPTH_TEST);
		} else {
			this._gl.disable(this._gl.BLEND);
			this._gl.enable(this._gl.DEPTH_TEST);
		}
	},

	/** @public
	 * @param {Mesh} mesh */
	draw : function (mesh) {

		var vertexIndexBuffers,
			vertexPositionBuffer,
			vertexNormalBuffer,
			vertexColorBuffer,
			vertexTextureBuffer,
			transformations,
			i, material;

		this.mvPushMatrix();

		vertexIndexBuffers = mesh.getVertexIndexBuffers();
		vertexPositionBuffer = mesh.getVertexPositionBuffer();
		vertexNormalBuffer = mesh.getVertexNormalBuffer();
		vertexColorBuffer = mesh.getVertexColorBuffer();
		vertexTextureBuffer = mesh.getVertexTextureBuffer();
		transformations = mesh.getTransformations();

		// apply matrix transformations
		glMatrix.mat4.rotateZ(this.mvMatrix, transformations.rotation.z);
		glMatrix.mat4.rotateY(this.mvMatrix, transformations.rotation.y);
		glMatrix.mat4.rotateX(this.mvMatrix, transformations.rotation.x);
		glMatrix.mat4.translate(this.mvMatrix, transformations.position.getArray());

		this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexPositionBuffer);
		this._gl.vertexAttribPointer(this._shaderProgram.vertexPositionAttribute, vertexPositionBuffer.itemSize, this._gl.FLOAT, false, 0, 0);

		this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexNormalBuffer);
		this._gl.vertexAttribPointer(this._shaderProgram.vertexNormalAttribute, vertexNormalBuffer.itemSize, this._gl.FLOAT, false, 0, 0);

		this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexColorBuffer);
		this._gl.vertexAttribPointer(this._shaderProgram.vertexColorAttribute, vertexColorBuffer.itemSize, this._gl.FLOAT, false, 0, 0);

		for (material in vertexIndexBuffers) {
			if (vertexIndexBuffers.hasOwnProperty(material)) {

				if (!vertexIndexBuffers[material].material.ready) continue;

				// set texture if it has material, texture and texture already loaded
				if (material !== 'noMaterial' && vertexIndexBuffers[material].material.texture) {
					this._gl.enableVertexAttribArray(this._shaderProgram.textureCoordAttribute);
					this._gl.uniform1i(this._shaderProgram.textureEnabled, 1);

					this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexTextureBuffer);
					this._gl.vertexAttribPointer(this._shaderProgram.textureCoordAttribute, vertexTextureBuffer.itemSize, this._gl.FLOAT, false, 0, 0);

					this._gl.activeTexture(this._gl.TEXTURE0);
					this._gl.bindTexture(this._gl.TEXTURE_2D, vertexIndexBuffers[material].material.texture);
					this._gl.uniform1i(this._shaderProgram.samplerUniform, 0);
				}
				else {
					this._gl.disableVertexAttribArray(this._shaderProgram.textureCoordAttribute);
					this._gl.uniform1i(this._shaderProgram.textureEnabled, 0);
				}

				this._gl.uniform1i(this._shaderProgram.useLightingUniform, Number(this._isLightingEnable));


				if (this._isLightingEnable) {
					var lightEnables = [], positions = [], colors = [], distances = [],
						position, color;

					for (i = 0; i < this._lights.length; i++) {
						position = this._lights[i].position;
						color = this._lights[i].color;
						lightEnables.push(this._lights[i].isEnabled());
						positions.push(position.x + this.mvMatrix[0]);
						positions.push(position.y + this.mvMatrix[1]);
						positions.push(position.z + this.mvMatrix[2]);
						colors.push(color.r);
						colors.push(color.g);
						colors.push(color.b);
						distances.push(this._lights[i].distance)
					}

					this._gl.uniform1iv(this._shaderProgram.useLightUniform, lightEnables);
					this._gl.uniform1fv(this._shaderProgram.lightingDistanceUniform, distances);
					this._gl.uniform3fv(this._shaderProgram.lightColorUniform, colors);
					this._gl.uniform3fv(this._shaderProgram.lightingPositionUniform, positions);
					this._gl.uniform1f(this._shaderProgram.materialSpecular, vertexIndexBuffers[material].material.specular);

					//						this._gl.uniform3f(this._shaderProgram.ambientColorUniform, 0.2, 0.2, 0.2);
					//						var lightingDirection = [0.0, 0.0, 0.0];
					//
					//						var adjustedLD = glMatrix.vec3.create();
					//						glMatrix.vec3.normalize(lightingDirection, adjustedLD);
					//						glMatrix.vec3.scale(adjustedLD, -1);
				}

				//					this._gl.disableVertexAttribArray(this._shaderProgram.textureCoordAttribute);

				this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffers[material].buffer);
				this.setMatrixUniforms();
				this._gl.drawElements(this._gl.TRIANGLES, vertexIndexBuffers[material].buffer.numItems, this._gl.UNSIGNED_SHORT, 0);
			}
		}
		this.mvPopMatrix();
	},

	/** @public
	 * @param {number} type
	 * @param {Array<number>} color
	 * @param {Array<number>} param direction or position
	 * @param {number} distance */
	createLight : function (type, color, param, distance) {
		this._lights.push(new Light(type, color, param, distance));
		return this._lights[this._lights.length - 1];
	},

	/** @public */
	turnOnLight : function () {
		this._isLightingEnable = true;
	},

	/** @public */
	turnOffLight : function () {
		this._isLightingEnable = false;
	},

	/** @private */
	onResize : function () {
		if (this._inited) {
			this._canvasNode.setAttribute('width', window.innerWidth + 'px');
			this._canvasNode.setAttribute('height', window.innerHeight + 'px');
			this._gl.viewportWidth = window.innerWidth;
			this._gl.viewportHeight = window.innerHeight;
		}
	},

	/** @public
	 * @returns {Transformations} */
	getCamera : function () {
		return this._camera;
	},

	/** @public */
	createMesh : function (vertexes, textures, normals, faces, materials) {
		var mesh = new Mesh(this._gl, vertexes, textures, normals, faces, materials);
		this._meshes.push(mesh);
		return mesh;
	},

	/** @public
	 * @param {string} path
	 * @param {object} params
	 * @returns {Mesh|null} */
	createMeshFromFile : function (path, params) {
		var require = new XMLHttpRequest(),
			parameters = {
				textureRepeat : true
			};

		if (typeof params === 'object') {
			if (typeof params.textureRepeat === 'boolean') {
				parameters.textureRepeat = params.textureRepeat;
			}
		}

		require.open('GET', path, false);
		require.send(null);
		if (require.status == 200) {
			return this.parseObjFile(require.responseText, path, parameters);
		}
		return null;
	},

	/** @private
	 * @param objFile
	 * @param path
	 * @param {object} parameters
	 * @returns {Mesh} */
	parseObjFile : function (objFile, path, parameters) {
		var i, j, nodes, material,
			vertexes = [], textures = [], normals = [], faces = { noMaterial : [] },
			materials = {},
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
					for (j = 1; j < nodes.length; j++) {
						if (nodes[j] === '') continue;
						normals.push(Number(nodes[j]));
					}
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

						face = new Face(
								Number(faceArray[0]) - 1,
								faceArray.length > 1 ? Number(faceArray[1]) - 1 : 0,
								faceArray.length > 2 ? Number(faceArray[2]) - 1 : 0
						);

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
						materials = this.parseMaterial(require.responseText, materialPath, parameters);
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
		/** @type {Material} */
		materials['noMaterial'] = new Material();
		mesh = new Mesh(this._gl, vertexes, textures, normals, faces, materials);
		this._meshes.push(mesh);
		return mesh;
	},

	/** @private */
	parseMaterial : function (mtlFile, path, parameters) {
		var mtlList, i, j, nodes, material, allMaterials = {};
		/** @type {Material} */
		var currentMaterial = null;

		mtlList = mtlFile.split('\n');
		for (i = 0; i < mtlList.length; i++) {
			nodes = mtlList[i].split(' ');
			switch (nodes[0]) {
				case 'newmtl':
					/** @type {Material} */
					material = new Material();
					allMaterials[nodes[1]] = material;
					currentMaterial = material;
					break;

				case 'map_Kd':
					if (currentMaterial) {
						currentMaterial.loadTexture(
							this._gl,
							(path.substring(0, path.lastIndexOf("/") + 1) + nodes[1]),
							parameters.textureRepeat
						);
					}
					break;

				case 'Kd':
					for (j = 1; j < nodes.length; j++) {
						currentMaterial.diffuseColor[j - 1] = Number(nodes[j]);
					}
					break;

				case 'Ns':
//				case 'Tr':
					for (j = 1; j < nodes.length; j++) {
						if (!isNaN(nodes[j])) {
							currentMaterial.specular = Number(nodes[j]);
							break;
						}
					}
					break;
			}
		}
		return allMaterials;
	},

	/** @public */
	getGLInstance : function () {
		return this._gl;
	}
});

/** @public
 * @type {Object.<string, number>} */
webGLEngine.TYPES = {
	render2d : 0,
	render3d : 1
};

window.webGLEngine = webGLEngine;
	return module;
});

_require.def( "..\\..\\source\\libs\\glMatrix.js", function( _require, exports, module ){
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

module.exports = /** @class glMatrix */ {

	/** @type {mat4} */
	mat4 : mat4,

	/** @type {mat3} */
	mat3 : mat3,

	/** @type {vec3} */
	vec3 : vec3
};
	return module;
});

_require.def( "..\\..\\source\\libs\\class.js", function( _require, exports, module ){
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

_require.def( "..\\..\\source\\classes\\Mesh.js", function( _require, exports, module ){
var Class = _require( "..\\..\\source\\libs\\class.js" ),
	Material = _require( "..\\..\\source\\classes\\Material.js" ),
	Transformations = _require( "..\\..\\source\\classes\\Transformations.js" );

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

		/** @type {Transformations} */
		this._transformations = new Transformations();

		this._vertexIndexBuffers = {};

		/** @type {WebGLBuffer} */
		this._vertexPositionBuffer = this._webGL.createBuffer();

		/** @type {WebGLBuffer} */
		this._vertexNormalBuffer = this._webGL.createBuffer();

		/** @type {WebGLBuffer} */
		this._vertexColorBuffer = this._webGL.createBuffer();

		/** @type {WebGLBuffer} */
		this._vertexTextureBuffer = this._webGL.createBuffer();

		this.initBuffers();
	},

	/** @private */
	initBuffers : function () {
		var colors = [], indexes = [], textures = [], normals = [],
			i, j, material, vertexIndexBuffer,
			colorIndex;

		/** @type {Buffer} */
		lastMaterialName = null;

		// create vertex index buffer
		this._webGL.bindBuffer(this._webGL.ARRAY_BUFFER, this._vertexPositionBuffer);
		this._webGL.bufferData(this._webGL.ARRAY_BUFFER, new Float32Array(this._vertexes), this._webGL.STATIC_DRAW);
		this._vertexPositionBuffer.itemSize = 3;
		this._vertexPositionBuffer.numItems = this._vertexes.length / this._vertexPositionBuffer.itemSize;

	// create empty color and texture buffer
		for (i = 0; i < this._vertexes.length / 3; i++) {
			colors.push(0);
			colors.push(0);
			colors.push(0);
			colors.push(1);
			normals.push(0);
			normals.push(0);
			normals.push(0);
			textures.push(0);
			textures.push(0);
		}

		for (material in this._faces) {
			if (this._faces.hasOwnProperty(material)) {

				if (this._faces[material].length === 0) continue;

				indexes = [];
				for (i = 0; i < this._faces[material].length; i++) {
					colorIndex = (this._faces[material][i].vertexIndex) * 4;

					indexes.push(this._faces[material][i].vertexIndex);
					textures[this._faces[material][i].vertexIndex * 2] = this._vertextTextures[this._faces[material][i].textureIndex * 2];
					textures[this._faces[material][i].vertexIndex * 2 + 1] = this._vertextTextures[this._faces[material][i].textureIndex * 2 + 1];
					normals[this._faces[material][i].vertexIndex * 3] = this._vertexNormals[this._faces[material][i].normalIndex * 3];
					normals[this._faces[material][i].vertexIndex * 3 + 1] = this._vertexNormals[this._faces[material][i].normalIndex * 3 + 1];
					normals[this._faces[material][i].vertexIndex * 3 + 2] = this._vertexNormals[this._faces[material][i].normalIndex * 3 + 2];
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

		// create vertex normal buffer
		this._webGL.bindBuffer(this._webGL.ARRAY_BUFFER, this._vertexNormalBuffer);
		this._webGL.bufferData(this._webGL.ARRAY_BUFFER, new Float32Array(normals), this._webGL.STATIC_DRAW);
		this._vertexNormalBuffer.itemSize = 3;
		this._vertexNormalBuffer.numItems = normals.length / this._vertexNormalBuffer.itemSize;

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
	getVertexNormalBuffer : function () {
		return this._vertexNormalBuffer;
	},

	/** @public */
	getVertexTextureBuffer : function () {
		return this._vertexTextureBuffer;
	},

	/** @public
	 * @returns {Transformations} */
	getTransformations : function () {
		return this._transformations;
	}
});

module.exports = Mesh;
	return module;
});

_require.def( "..\\..\\source\\classes\\Material.js", function( _require, exports, module ){
var utils = _require( "..\\..\\source\\libs\\utils.js" );

/** @constructor */
var Material = function () {
	this.diffuseColor = [1, 1, 1];
	this.specular = 0;
	this.imageLink = '';
	this.ready = true;
	this.texture = null;
	this.textureRepeat = true;
};

Material.prototype = {
	/** @public */
	loadTexture : function (gl, path, textureRepeat) {
		if (typeof gl !== 'object') {
			console.log('GL parameter is not a object');
			return;
		}
		if (typeof path !== 'string') {
			console.log('Texture path parameter is not a string');
			return;
		}
		this.textureRepeat = typeof textureRepeat === 'boolean' ? textureRepeat : true;
		this.ready = false;
		this.imageLink = path;
		this.texture = gl.createTexture();

		this.texture.image = new Image();
		this.texture.image.onload = utils.bind(this.createTexture, this, gl);
		this.texture.image.src = this.imageLink;
	},

	/** @private */
	createTexture : function () {
		var gl = arguments[arguments.length - 1];
		var repeatType = this.textureRepeat ? 'REPEAT' : 'CLAMP_TO_EDGE';
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture.image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[repeatType]);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[repeatType]);
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.ready = true;
	}
};

module.exports = Material;
	return module;
});

_require.def( "..\\..\\source\\libs\\utils.js", function( _require, exports, module ){

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
		 * @type {HTMLElement|HTMLCanvasElement|Node} */
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
		 * @returns {HTMLElement|HTMLCanvasElement|Node} HTML element
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
	},

	Timer : Timer
};

	return module;
});

_require.def( "..\\..\\source\\classes\\Transformations.js", function( _require, exports, module ){
var Vector3 = _require( "..\\..\\source\\classes\\Vector3.js" );

/** @constructor */
var Transformations = function () {
	/** @type {Vector3} */
	this.position = new Vector3();
	/** @type {Vector3} */
	this.rotation = new Vector3(0, 0, 0);
	/** @type {Vector3} */
	this.scale = new Vector3(0, 0, 0);
};

module.exports = Transformations;
	return module;
});

_require.def( "..\\..\\source\\classes\\Vector3.js", function( _require, exports, module ){
/** @class Vector3
 * @param x
 * @param y
 * @param z
 * @constructor */
var Vector3 = function (x, y, z) {
	this._x = 0;
	this._y = 0;
	this._z = 0;

	this.set.apply(this, arguments);
};


Vector3.prototype = /** @lends Vector3# */ {

	/** @public */
	set : function (x, y, z) {
		this._x = typeof x === 'number' ? x : 0;
		this._y = typeof y === 'number' ? y : 0;
		this._z = typeof z === 'number' ? z : 0;
	},

	/** @public */
	add : function (x, y, z) {
		this._x += typeof x === 'number' ? x : 0;
		this._y += typeof y === 'number' ? y : 0;
		this._z += typeof z === 'number' ? z : 0;
	},

	/** @public
	 * @returns {Float32Array} */
	getArray : function () {
		return [this._x, this._y, this._z];
	},

	get x() { return this._x; },
	get y() { return this._y; },
	get z() { return this._z; },

	set x(value) { if (typeof value === 'number') this._x = value; },
	set y(value) { if (typeof value === 'number') this._y = value; },
	set z(value) { if (typeof value === 'number') this._z = value; },

	get r() { return this._x; },
	get g() { return this._y; },
	get b() { return this._z; },

	set r(value) { if (typeof value === 'number') this._x = value; },
	set g(value) { if (typeof value === 'number') this._y = value; },
	set b(value) { if (typeof value === 'number') this._z = value; }
};

module.exports = Vector3;
	return module;
});

_require.def( "..\\..\\source\\classes\\Face.js", function( _require, exports, module ){

/** @class Face */
var Face = function (vertexIndex, textureIndex, normalIndex) {
	this.vertexIndex = typeof vertexIndex === 'number' ? vertexIndex : 0;
	this.textureIndex = typeof textureIndex === 'number' ? textureIndex : 0;
	this.normalIndex = typeof normalIndex === 'number' ? normalIndex : 0;
};

module.exports = Face;
	return module;
});

_require.def( "..\\..\\source\\classes\\Light.js", function( _require, exports, module ){
var Class = _require( "..\\..\\source\\libs\\class.js" ),
	Vector = _require( "..\\..\\source\\classes\\Vector3.js" );

/** @class Light
 * @param {number} type
 * @param {Array<number>} color
 * @param {Array<number>} param direction or position
 * @param {number} distance */
var Light = function (type, color, param, distance) {

	this._type = 0;

	this._enabled = true;

	this._distance = typeof distance === 'number' ? distance : 10;

	/** @private
	 * @type {Vector3} */
	this._color = new Vector();

	/** @private
	 * @type {Vector3} */
	this._position = new Vector();

	if (typeof color === 'object') {
		this._color.r = typeof color[0] === 'number' ? color[0] : 0;
		this._color.g = typeof color[1] === 'number' ? color[1] : 0;
		this._color.b = typeof color[2] === 'number' ? color[2] : 0;
	}

	if (typeof param === 'object') {
		this._position.r = typeof param[0] === 'number' ? param[0] : 0;
		this._position.g = typeof param[1] === 'number' ? param[1] : 0;
		this._position.b = typeof param[2] === 'number' ? param[2] : 0;
	}
};


Light.prototype = {

	/** @public */
	turnOn : function () {
		this._enabled = true;
	},

	/** @public */
	turnOff : function () {
		this._enabled = false;
	},

	/** @public */
	isEnabled : function () {
		return this._enabled;
	},

	get color () { return this._color; },
	get position () { return this._position; },
	get distance () { return this._distance; },

	set color (color) {},
	set position (position) {},
	set distance (distance) {}
};

module.exports = Light;
	return module;
});

_require.def( "..\\..\\source\\webGLConfig.js", function( _require, exports, module ){
module.exports = {
	version : '0.1',

	html : {
		canvasID : 'webGLCanvas'
	},

	render : {
//		textureClampTypes : ['REPEAT', 'CLAMP_TO_EDGE']
	}
};

	return module;
});

(function(){
_require( "..\\..\\source\\webGLEngine.js" );
}());

//# sourceMappingURL=./webGLEngine.js.map