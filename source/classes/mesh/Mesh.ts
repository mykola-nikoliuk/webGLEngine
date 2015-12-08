///<reference path="./Vertex.ts"/>
///<reference path="./Face.ts"/>

module WebGLEngine.Types {

	// TODO : refactor (Create material manager)
	export class Mesh extends LinkedTransformations {

		public static defaultMaterialName = 'noMaterial';

		private _webGL : any;
		private _vertexes : number[];
		private _vertextTextures : number[];
		private _vertexNormals : number[];
		private _faces : Face[][];

		private _materials : {[materialName:string] : Material};
		private _materialsLoaded : number;

		private _isReady : boolean;
		private _vertexIndexBuffers;
		private _vertexPositionBuffer : any;
		private _vertexNormalBuffer : any;
		private _vertexColorBuffer : any;
		private _vertexTextureBuffer : any;
		private _materialCallback : Utils.Callback;

		private _transformationChildren : Mesh[];

		private _createCallback : Utils.Callback[];

		constructor(webGL : any) {
			super();

			this._webGL = webGL;

			this._vertexes = null;
			this._vertextTextures = null;
			this._vertexNormals = null;
			this._faces = null;
			this._materials = null;
			this._materialsLoaded = 0;
			this._isReady = false;
			this._createCallback = null;

			this._vertexIndexBuffers = {};
			this._vertexPositionBuffer = this._webGL.createBuffer();
			this._vertexNormalBuffer = this._webGL.createBuffer();
			this._vertexColorBuffer = this._webGL.createBuffer();
			this._vertexTextureBuffer = this._webGL.createBuffer();

			this._transformationChildren = [];

			this._createCallback = [];

			this._materialCallback = new Utils.Callback(this._materialIsReady, this);
		}

		public fillBuffers(vertexes : number[], vertexTexture : number[],
											 vertexNormals : number[], faces : Face[][],
											 materials : {[materialName:string] : Material}) : void {

			this._vertexes = vertexes;
			this._vertextTextures = vertexTexture;
			this._vertexNormals = vertexNormals;
			this._faces = faces;
			// TODO : check for dublicate
			this._materials = materials;

			// create vertex index buffer
			this._webGL.bindBuffer(this._webGL.ARRAY_BUFFER, this._vertexPositionBuffer);
			this._webGL.bufferData(this._webGL.ARRAY_BUFFER, new Float32Array(this._vertexes), this._webGL.STATIC_DRAW);
			this._vertexPositionBuffer.itemSize = 3;
			this._vertexPositionBuffer.numItems = this._vertexes.length / this._vertexPositionBuffer.itemSize;
		}

		public initBuffers(materials? : {[materialName:string] : Material}) : void {
			var colors = [], indexes = [], textures = [], normals = [],
				vertex : Vertex,
				itemSize : number,
				vectorColors : number[],
				i, j, k,
				material, vertexIndexBuffer;

			if (typeof materials !== 'undefined') {
				for (material in this._materials) {
					if (this._materials.hasOwnProperty(material)) {
						if (materials.hasOwnProperty(material)) {
							this._materials[material] = materials[material];
							this._materials[material].callback(this._materialCallback);
						}
					}
				}
			}

			// create empty color and texture buffer
			var counter = 0;

			var vertexes = this._vertexes;
			this._vertexes = [];

			for (material in this._faces) {
				if (this._faces.hasOwnProperty(material)) {

					if (this._faces[material].length === 0) continue;

					indexes = [];
					for (i = 0; i < this._faces[material].length; i++) {
						for (j = 0; j < this._faces[material][i].vertexes.length; j++) {

							vertex = this._faces[material][i].vertexes[j];

							indexes.push(counter);

							// vertexes
							for (k = 0, itemSize = 3; k < itemSize; k++) {
								this._vertexes.push(vertexes[vertex.index * itemSize + k]);
							}



							counter++;

							// texture coordinates
							for (k = 0, itemSize = 2; k < itemSize; k++) {
								textures.push(this._vertextTextures[vertex.textureIndex * itemSize + k]);
							}

							// normals
							for (k = 0, itemSize = 3; k < itemSize; k++) {
								if (vertex.normalIndex >= 0) {
									normals.push(this._vertexNormals[vertex.normalIndex * itemSize + k]);
								}
								else {
									normals.push(null);
								}
							}

							//this._fixNormals(normals, this._faces[material][i]);

							// colors
							vectorColors = this._materials[material].diffuseColor.getArray();
							for (k = 0, itemSize = 3; k < itemSize; k++) {
								colors.push(vectorColors[k]);
							}
						}

						//colors.push(1);
					}

					// create vertex index buffer
					this._webGL.bindBuffer(this._webGL.ARRAY_BUFFER, this._vertexPositionBuffer);
					this._webGL.bufferData(this._webGL.ARRAY_BUFFER, new Float32Array(this._vertexes), this._webGL.STATIC_DRAW);
					this._vertexPositionBuffer.itemSize = 3;
					this._vertexPositionBuffer.numItems = this._vertexes.length / this._vertexPositionBuffer.itemSize;

					vertexIndexBuffer = this._webGL.createBuffer();
					this._webGL.bindBuffer(this._webGL.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
					this._webGL.bufferData(this._webGL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), this._webGL.STATIC_DRAW);
					vertexIndexBuffer.itemSize = 1;
					vertexIndexBuffer.numItems = indexes.length / vertexIndexBuffer.itemSize;

					this._vertexIndexBuffers[material] = {
						material: this._materials[material],
						buffer  : vertexIndexBuffer
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
			this._vertexColorBuffer.itemSize = 3;
			this._vertexColorBuffer.numItems = colors.length / this._vertexColorBuffer.itemSize;

			// create vertex texture buffer
			this._webGL.bindBuffer(this._webGL.ARRAY_BUFFER, this._vertexTextureBuffer);
			this._webGL.bufferData(this._webGL.ARRAY_BUFFER, new Float32Array(textures), this._webGL.STATIC_DRAW);
			this._vertexTextureBuffer.itemSize = 2;
			this._vertexTextureBuffer.numItems = this._vertextTextures.length / this._vertexTextureBuffer.itemSize;
		}

		public isReady() : boolean {
			return this._isReady;
		}

		public clone() {
			// TODO : finish clone
		}

		/** Sets create callback, that will called when mesh will be ready */
		public callback(callback : Utils.Callback) : Mesh {
			this._createCallback.push(callback);
			if (this._isReady) {
				while (this._createCallback.length) {
					this._createCallback.shift().apply();
				}
			}
			return this;
		}

		/** Create the same mesh with unique transformation
		 * Other parameters just will be copied */
		public transformationClone() : Mesh {
			var mesh = new Mesh(this._webGL);
			mesh._vertexes = this._vertexes;
			mesh._vertextTextures = this._vertextTextures;
			mesh._vertexNormals = this._vertexNormals;
			mesh._faces = this._faces;
			mesh._materials = this._materials;
			mesh._materialsLoaded = this._materialsLoaded;
			mesh._isReady = this._isReady;
			mesh._vertexIndexBuffers = this._vertexIndexBuffers;
			mesh._vertexPositionBuffer = this._vertexPositionBuffer;
			mesh._vertexNormalBuffer = this._vertexNormalBuffer;
			mesh._vertexColorBuffer = this._vertexColorBuffer;
			mesh._vertexTextureBuffer = this._vertexTextureBuffer;
			mesh._materialCallback = this._materialCallback;
			if (!this._isReady) {
				this._transformationChildren.push(mesh);
			}
			return mesh;
		}

		public getVertexIndexBuffers() : void {
			return this._vertexIndexBuffers;
		}

		public getVertexPositionBuffer() : void {
			return this._vertexPositionBuffer
		}

		public getVertexColorBuffer() : void {
			return this._vertexColorBuffer;
		}

		public getVertexNormalBuffer() : void {
			return this._vertexNormalBuffer;
		}

		public getVertexTextureBuffer() : void {
			return this._vertexTextureBuffer;
		}

		// TODO : finish implementation
		private _fixNormals(normals : number[], face : Face) {
			var i : number,
				j : number,
				p : number[],
				point : Vector3[] = [],
				normal : Vector3,
				U : Vector3, V : Vector3,
				vertexIndex : number,
				itemSize = 3,
				isFixNeeded = false;

			for (i = 0; i < face.vertexes.length; i++) {
				if (face.vertexes[i].normalIndex < 0) {
					isFixNeeded = true;
				}
			}

			if (isFixNeeded) {
				for (i = 0; i < face.vertexes.length; i++) {
					p = [];
					for (j = 0; j < itemSize; j++) {
						p.push(this._vertexes[face.vertexes[i].index * itemSize + j]);
					}
					point.push(new Vector3(p[0], p[1], p[2]));
				}

				U = point[1].clone().minus(point[0]);
				V = point[2].clone().minus(point[0]);

				normal = new Vector3(
					U.y * V.z - U.z * V.y,
					U.z * V.x - U.x * V.z,
					U.x * V.y - U.y * V.x
				);

				var huynya = 1 / Math.sqrt(Math.pow(normal.x, 2) + Math.pow(normal.y, 2) + Math.pow(normal.z, 2));

				normal.multiply(huynya);

				//Console.log('x : ' + normal.x + ' | y : ' + normal.y + ' | z : ' + normal.z);

				for (i = 0; i < face.vertexes.length; i++) {
						normals[face.vertexes[i].index * itemSize] = normal.x;
						normals[face.vertexes[i].index * itemSize + 1] = normal.y;
						normals[face.vertexes[i].index * itemSize + 2] = normal.z;
				}
			}
		}

		private _materialIsReady() {
			var loaded = true,
				material : string;

			for (material in this._materials) {
				if (this._materials.hasOwnProperty(material) && !this._materials[material].ready) {
					loaded = false;
					break;
				}
			}

			if (loaded) {
				while (this._transformationChildren.length) {
					// TODO : fix that (ready callback may be missed)
					this._transformationChildren.shift()._isReady = loaded;
				}
			}

			this._isReady = loaded;

			if (this._isReady) {
				if (this._createCallback.length) {
					while (this._createCallback.length) {
						this._createCallback.shift().apply();
					}
				}
			}
		}
	}
}