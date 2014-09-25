var Class = require('./../libs/class'),
	utils = require('./../libs/utils'),
	config = require('./webGLConfig'),
	glMatrix = require('glMatrix'),
	classes3d = require('./'),
	Mesh = require('./mesh');

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

		this._camera = {
			position : null,
			rotation : null
		};

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

//		this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
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

		glMatrix.mat4.perspective(90, this.gl.viewportWidth / this.gl.viewportHeight, 1, 10000.0, this.pMatrix);

		glMatrix.mat4.identity(this.mvMatrix);

		glMatrix.mat4.rotate(this.mvMatrix, this.rTri, [0, 1, 0]);
		glMatrix.mat4.translate(this.mvMatrix, [0.0, 0.0, 0.0]);

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
			glMatrix.mat4.rotate(this.mvMatrix, transformations.rotation.z, [0, 0, 1]);
			glMatrix.mat4.rotate(this.mvMatrix, transformations.rotation.y, [0, 1, 0]);
			glMatrix.mat4.rotate(this.mvMatrix, transformations.rotation.x, [1, 0, 0]);
			glMatrix.mat4.translate(this.mvMatrix,
				[transformations.position.x, transformations.position.y, transformations.position.z, 0.0]);

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

	/** @public */
	setCameraPosition : function (x, y, z) {

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
			vertex = [], texture = [], normal = [], materials = [],
			currentMaterial = 'noMaterial',
			require, objList, mesh, materialPath;

		objList = objFile.split('\n');
		for (i = 0; i < objList.length; i++) {
			nodes = objList[i].split(' ');
			switch (nodes[0]) {
				case 'v':
					for (j = 1; j < nodes.length; j++) {
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
					for (j = 1; j < nodes.length; j++) {
						/** @class Face */
						var faceArray = nodes[j].split('/'),
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
					material = {
						diffuseColor : [0, 0, 0],
						imageLink    : '',
						ready        : true,
						texture      : null
					};
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