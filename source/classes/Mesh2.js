var Class = require('./../libs/class'),
	Material = require('./Material'),
	Transformations = require('./Transformations');

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