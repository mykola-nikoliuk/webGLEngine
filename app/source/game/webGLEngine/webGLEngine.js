var Class = require('./../libs/class'),
	utils = require('./../libs/utils'),
	config = require('./webGLConfig'),
	glMatrix = require('glMatrix'),
	Material = require('./classes/Material'),
	Transformations = require('./classes/Transformations'),
	Mesh = require('./mesh');

/** @class Engine
 * @extends {Class} */
var Engine = Class.extend(/** @lends {Engine#} */ {

	/** @constructs */
	init : function (renderType) {

		/** @private
		 * @type {WebGLRenderingContext} */
		this._gl = null;

		/** @private */
		this._inited = false;

		/** @private
		 * @type {HTMLCanvasElement|null} */
		this._canvasNode = null;

		/** @private */
		this.mvMatrix = glMatrix.mat4.create();
		/** @private */
		this.pMatrix = glMatrix.mat4.create();
		/** @private */
		this.mvMatrixStack = [];

		/** @private
		 * @type {Transformations} */
		this._camera = new Transformations();

		/** @private */
		this.lastTime = new Date().getTime();

		/** @private
		 * @type {Array.<Mesh>} */
		this.meshes = [];

		/** @private */
		this.shaderProgram = null;

		/** @private
		 * @type {boolean} */
		this._isLightingEnable = true;

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

	/** @private */
	webGLStart : function () {
		this.crateCanvas();
		this.initGL();
		this.initShaders();

//		this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this._gl.enable(this._gl.DEPTH_TEST);

		setInterval(utils.bind(this.drawScene, this), 33);
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

		this.shaderProgram = this._gl.createProgram();
		this._gl.attachShader(this.shaderProgram, vertexShader);
		this._gl.attachShader(this.shaderProgram, fragmentShader);
		this._gl.linkProgram(this.shaderProgram);

		if (!this._gl.getProgramParameter(this.shaderProgram, this._gl.LINK_STATUS)) {
			console.log("Could not initialise shaders");
		}

		this._gl.useProgram(this.shaderProgram);

		this.shaderProgram.vertexPositionAttribute = this._gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
		this._gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

		this.shaderProgram.vertexNormalAttribute = this._gl.getAttribLocation(this.shaderProgram, "aVertexNormal");
		this._gl.enableVertexAttribArray(this.shaderProgram.vertexNormalAttribute);

		this.shaderProgram.vertexColorAttribute = this._gl.getAttribLocation(this.shaderProgram, "aVertexColor");
		this._gl.enableVertexAttribArray(this.shaderProgram.vertexColorAttribute);

		this.shaderProgram.textureCoordAttribute = this._gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
		this._gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);

		this.shaderProgram.pMatrixUniform = this._gl.getUniformLocation(this.shaderProgram, "uPMatrix");
		this.shaderProgram.mvMatrixUniform = this._gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
		this.shaderProgram.nMatrixUniform = this._gl.getUniformLocation(this.shaderProgram, "uNMatrix");
		this.shaderProgram.samplerUniform = this._gl.getUniformLocation(this.shaderProgram, "uSampler");
		this.shaderProgram.useLightingUniform = this._gl.getUniformLocation(this.shaderProgram, "uUseLighting");
		this.shaderProgram.ambientColorUniform = this._gl.getUniformLocation(this.shaderProgram, "uAmbientColor");
		this.shaderProgram.lightingDirectionUniform = this._gl.getUniformLocation(this.shaderProgram, "uLightingDirection");
		this.shaderProgram.directionalColorUniform = this._gl.getUniformLocation(this.shaderProgram, "uDirectionalColor");
		this.shaderProgram.textureEnabled = this._gl.getUniformLocation(this.shaderProgram, "uUseTexture");
	},

	/** @private */
	mvPushMatrix : function () {
		var copy = glMatrix.mat4.create();
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
		this._gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
		this._gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);

		var normalMatrix = glMatrix.mat3.create();
		glMatrix.mat4.toInverseMat3(this.mvMatrix, normalMatrix);
		glMatrix.mat3.transpose(normalMatrix);
		this._gl.uniformMatrix3fv(this.shaderProgram.nMatrixUniform, false, normalMatrix);
	},

	/** @private */
	degToRad : function (degrees) {
		return degrees * Math.PI / 180;
	},

	/** @private */
	drawScene : function () {

		var vertexIndexBuffers,
			vertexPositionBuffer,
			vertexNormalBuffer,
			vertexColorBuffer,
			vertexTextureBuffer,
			transformations,
			i, material;

		var timeNow = new Date().getTime();
		if (this.lastTime != 0) {
			var elapsed = timeNow - this.lastTime;

			if (this.meshes[0]) {
				var transformations = this.meshes[0].getTransformations();
				transformations.rotation.y = transformations.rotation.y + (90 * elapsed) / 500000.0;
			}
		}
		this.lastTime = timeNow;

		this._gl.viewport(0, 0, this._gl.viewportWidth, this._gl.viewportHeight);
		this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

		glMatrix.mat4.perspective(45, this._gl.viewportWidth / this._gl.viewportHeight, 1, 10000.0, this.pMatrix);

		glMatrix.mat4.identity(this.mvMatrix);

		// set camera position
		glMatrix.mat4.rotateX(this.mvMatrix, this._camera.rotation.x);
		glMatrix.mat4.rotateY(this.mvMatrix, this._camera.rotation.y);
		glMatrix.mat4.rotateZ(this.mvMatrix, this._camera.rotation.z);
		glMatrix.mat4.translate(this.mvMatrix,
			[this._camera.position.x, this._camera.position.y, this._camera.position.z]);

		// draw meshes
		for (i = 0; i < this.meshes.length; i++) {

			this.mvPushMatrix();

			vertexIndexBuffers = this.meshes[i].getVertexIndexBuffers();
			vertexPositionBuffer = this.meshes[i].getVertexPositionBuffer();
			vertexNormalBuffer = this.meshes[i].getVertexNormalBuffer();
			vertexColorBuffer = this.meshes[i].getVertexColorBuffer();
			vertexTextureBuffer = this.meshes[i].getVertexTextureBuffer();
			transformations = this.meshes[i].getTransformations();

			// apply matrix transformations
			glMatrix.mat4.rotate(this.mvMatrix, transformations.rotation.z, [0, 0, 1]);
			glMatrix.mat4.rotate(this.mvMatrix, transformations.rotation.y, [0, 1, 0]);
			glMatrix.mat4.rotate(this.mvMatrix, transformations.rotation.x, [1, 0, 0]);
			glMatrix.mat4.translate(this.mvMatrix,
				[transformations.position.x, transformations.position.y, transformations.position.z, 0.0]);

			this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexPositionBuffer);
			this._gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, vertexPositionBuffer.itemSize, this._gl.FLOAT, false, 0, 0);


			this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexNormalBuffer);
			this._gl.vertexAttribPointer(this.shaderProgram.vertexNormalAttribute, vertexNormalBuffer.itemSize, this._gl.FLOAT, false, 0, 0);


			this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexColorBuffer);
			this._gl.vertexAttribPointer(this.shaderProgram.vertexColorAttribute, vertexColorBuffer.itemSize, this._gl.FLOAT, false, 0, 0);

			for (material in vertexIndexBuffers) {
				if (vertexIndexBuffers.hasOwnProperty(material)) {

					if (!vertexIndexBuffers[material].material.ready) continue;

					// set texture if it has material, texture and texture already loaded
					if (material !== 'noMaterial' && vertexIndexBuffers[material].material.texture) {
						this._gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
						this._gl.uniform1i(this.shaderProgram.textureEnabled, true);

						this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexTextureBuffer);
						this._gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, vertexTextureBuffer.itemSize, this._gl.FLOAT, false, 0, 0);

						this._gl.activeTexture(this._gl.TEXTURE0);
						this._gl.bindTexture(this._gl.TEXTURE_2D, vertexIndexBuffers[material].material.texture);
						this._gl.uniform1i(this.shaderProgram.samplerUniform, 0);
						this._gl.uniform1i(this.shaderProgram.useLightingUniform, this._isLightingEnable);

						if (this._isLightingEnable) {
							this._gl.uniform3f(this.shaderProgram.ambientColorUniform, 0.2, 0.2, 0.2);

							var lightingDirection = [0, 0.0, 0.0];

							var adjustedLD = vec3.create();
							vec3.normalize(lightingDirection, adjustedLD);
							vec3.scale(adjustedLD, -1);
							this._gl.uniform3fv(this.shaderProgram.lightingDirectionUniform, adjustedLD);

							this._gl.uniform3f(this.shaderProgram.directionalColorUniform, 2, 1.9, 1.6);
						}
					}
					else {
						this._gl.disableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
						this._gl.uniform1i(this.shaderProgram.textureEnabled, false);
					}

					//					this._gl.disableVertexAttribArray(this.shaderProgram.textureCoordAttribute);

					this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffers[material].buffer);
					this.setMatrixUniforms();
					this._gl.drawElements(this._gl.TRIANGLES, vertexIndexBuffers[material].buffer.numItems, this._gl.UNSIGNED_SHORT, 0);
				}
			}

			this.mvPopMatrix();
		}
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
		/** @type {Material} */
		materials['noMaterial'] = new Material();
		mesh = new Mesh(this._gl, vertexes, textures, normals, faces, materials);
		this.meshes.push(mesh);
		return mesh;
	},

	/** @private */
	parseMaterial : function (mtlFile, path) {
		var mtlList, i, j, nodes, texture, material, allMaterials = {};
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
						currentMaterial.ready = false;
						currentMaterial.imageLink = path.substring(0, path.lastIndexOf("/") + 1) + nodes[1];
						currentMaterial.texture = texture = this._gl.createTexture();

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
		var gl = this._gl,
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