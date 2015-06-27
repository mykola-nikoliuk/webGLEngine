module webGLEngine {

	export module Types {

		export class Mesh extends Transformations {

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

			private _createCallback : Utils.Callback;

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

				this._vertexIndexBuffers = {};
				this._vertexPositionBuffer = this._webGL.createBuffer();
				this._vertexNormalBuffer = this._webGL.createBuffer();
				this._vertexColorBuffer = this._webGL.createBuffer();
				this._vertexTextureBuffer = this._webGL.createBuffer();

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
					i, j, material, vertexIndexBuffer,
					colorIndex;

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

							colors.push(this._materials[material].diffuseColor.r);
							colors.push(this._materials[material].diffuseColor.g);
							colors.push(this._materials[material].diffuseColor.b);
							//colors.push(1);
						}

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
				if (this._isReady) {
					callback.apply();
				}
				else {
					this._createCallback = callback;
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

			private _materialIsReady() {
				var loaded = true,
					material : string;

				for (material in this._materials) {
					if (this._materials.hasOwnProperty(material) && !this._materials[material].ready) {
						loaded = false;
						break;
					}
				}

				this._isReady = loaded;
			}
		}
	}
}