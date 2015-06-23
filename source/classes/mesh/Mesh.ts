///<reference path="Material.ts"/>
///<reference path="Transformations.ts"/>

module webGLEngine {

	export module Types {

		export class Mesh extends Transformations {

			private _webGL : any;
			private _vertexes : number[] = null;
			private _vertextTextures : number[] = null;
			private _vertexNormals : number[] = null;
			private _faces : Face[][] = null;
			private _materials : Material[] = null;
			private _isReady : boolean;
			private _vertexIndexBuffers;
			private _vertexPositionBuffer : any;
			private _vertexNormalBuffer : any;
			private _vertexColorBuffer : any;
			private _vertexTextureBuffer : any;


			public static defaultMaterialName = 'noMaterial';

			constructor(webGL : any) {
				super();

				this._webGL = webGL;

				this._isReady = false;

				this._vertexIndexBuffers = {};

				this._vertexPositionBuffer = this._webGL.createBuffer();

				this._vertexNormalBuffer = this._webGL.createBuffer();

				this._vertexColorBuffer = this._webGL.createBuffer();

				this._vertexTextureBuffer = this._webGL.createBuffer();
			}

			public fillBuffers(vertexes : number[], vertexTexture : number[],
												 vertexNormals : number[], faces : Face[][],
												 materials : Material[]) : void {

				this._vertexes = vertexes;
				this._vertextTextures = vertexTexture;
				this._vertexNormals = vertexNormals;
				this._faces = faces;
				this._materials = materials;

				// create vertex index buffer
				this._webGL.bindBuffer(this._webGL.ARRAY_BUFFER, this._vertexPositionBuffer);
				this._webGL.bufferData(this._webGL.ARRAY_BUFFER, new Float32Array(this._vertexes), this._webGL.STATIC_DRAW);
				this._vertexPositionBuffer.itemSize = 3;
				this._vertexPositionBuffer.numItems = this._vertexes.length / this._vertexPositionBuffer.itemSize;
			}

			public initBuffers(materials? : Material[]) : void {
				var colors = [], indexes = [], textures = [], normals = [],
					i, j, material, vertexIndexBuffer,
					colorIndex;

				// create empty color and texture buffer
//		for (i = 0; i < this._vertexes.length / 3; i++) {
//			colors.push(1);
//			colors.push(1);
//			colors.push(1);
//			colors.push(1);
//		}

				if (typeof materials !== 'undefined') {
					for (material in this._materials) {
						if (this._materials.hasOwnProperty(material)) {
							if (materials.hasOwnProperty(material)) {
								this._materials[material] = materials[material];
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
							for (j = 0; j < 3; j++) {
								colors.push(this._materials[material].diffuseColor[j]);
							}
							colors.push(1);
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
				this._vertexColorBuffer.itemSize = 4;
				this._vertexColorBuffer.numItems = colors.length / this._vertexColorBuffer.itemSize;

				// create vertex texture buffer
				this._webGL.bindBuffer(this._webGL.ARRAY_BUFFER, this._vertexTextureBuffer);
				this._webGL.bufferData(this._webGL.ARRAY_BUFFER, new Float32Array(textures), this._webGL.STATIC_DRAW);
				this._vertexTextureBuffer.itemSize = 2;
				this._vertexTextureBuffer.numItems = this._vertextTextures.length / this._vertexTextureBuffer.itemSize;

				this._isReady = true;
			}

			public isReady() : boolean {
				return this._isReady;
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
		}
	}
}