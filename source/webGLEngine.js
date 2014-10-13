var glMatrix = require('./libs/glMatrix');
var Class = require('./libs/class'),
	Mesh = require('./classes/Mesh'),
	Face = require('./classes/Face'),
	Light = require('./classes/Light'),
	utils = require('./libs/utils'),
	config = require('./webGLConfig'),
	Material = require('./classes/Material'),
	Transformations = require('./classes/Transformations');

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

		if (false) {
			this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);
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

		// apply matrix tranwsformations
		glMatrix.mat4.translate(this.mvMatrix, transformations.position.getArray());
		glMatrix.mat4.rotateZ(this.mvMatrix, transformations.rotation.z);
		glMatrix.mat4.rotateY(this.mvMatrix, transformations.rotation.y);
		glMatrix.mat4.rotateX(this.mvMatrix, transformations.rotation.x);
		glMatrix.mat4.scale(this.mvMatrix, transformations.scale.getArray());

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
			switch (nodes[0].toLowerCase()) {
				case 'newmtl':
					/** @type {Material} */
					material = new Material();
					allMaterials[nodes[1]] = material;
					currentMaterial = material;
					break;

				case 'map_kd':
					if (currentMaterial) {
						currentMaterial.loadTexture(
							this._gl,
							(path.substring(0, path.lastIndexOf("/") + 1) + nodes[1]),
							parameters.textureRepeat
						);
					}
					break;

				case 'kd':
					for (j = 1; j < nodes.length; j++) {
						currentMaterial.diffuseColor[j - 1] = Number(nodes[j]);
					}
					break;

				case 'ns':
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