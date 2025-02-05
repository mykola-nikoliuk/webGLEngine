///<reference path="./Vertex.ts"/>
///<reference path="./Face.ts"/>
///<reference path="./BuffersBox.ts"/>

module WebGLEngine.Types {

	// TODO : refactor (Create material manager)
	export class Mesh extends LinkedTransformations {

		public static defaultMaterialName = 'noMaterial';
		public static maxVertexIndexValue = 21845; // unsigned short

		private _webGL : WebGLRenderingContext|any;
		private _vertexes : number[];
		private _vertextTextures : number[];
		private _vertexNormals : number[];
		private _faces : Face[][];

		private _materials : {[materialName:string] : Material};
		private _materialsLoaded : number;

		private _isReady : boolean;
		private _materialCallback : Utils.Callback;

		private _bufferBoxes : BuffersBox[];

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

			this._bufferBoxes = [];
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
			this._materials = materials;
		}

		public initBuffers(materials? : {[materialName:string] : Material}) : void {
			var
				indexes = [],
				colors = [],
				textures = [],
				normals = [],
				positions = [],
				indexesPerMaterial = {},
				vertex : Vertex,
				itemSize : number,
				vectorColors : number[],
				i, j, k,
				counter,
				material;

			this._materials[Types.Mesh.defaultMaterialName].callback(this._materialCallback);
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

			// create buffers
			counter = 0;
			for (material in this._faces) {
				if (this._faces.hasOwnProperty(material)) {
					if (this._faces[material].length === 0) continue;

					indexesPerMaterial[material] = 0;

					for (i = 0; i < this._faces[material].length; i++) {
						for (j = 0; j < this._faces[material][i].vertexes.length; j++) {

							if (counter >= Mesh.maxVertexIndexValue) {
								this._bufferBoxes.push(new BuffersBox(this._webGL, indexes, positions, normals, colors, textures, indexesPerMaterial));
								indexes = [];
								positions = [];
								normals = [];
								colors = [];
								textures = [];
								indexesPerMaterial = {};
								indexesPerMaterial[material] = 0;
								counter = 0;
								continue;
							}

							vertex = this._faces[material][i].vertexes[j];
							indexes.push(counter);

							// positions
							for (k = 0, itemSize = 3; k < itemSize; k++) {
								positions.push(this._vertexes[vertex.index * itemSize + k]);
							}

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

							// colors
							vectorColors = this._materials[material].diffuseColor.getArray();
							for (k = 0, itemSize = 3; k < itemSize; k++) {
								colors.push(vectorColors[k]);
							}

							counter++;
							indexesPerMaterial[material]++;
						}

						WebGLEngine.Types.Mesh._fixNormals(normals, positions, this._faces[material][i], counter - 3);
					}
				}
			}

			if (counter > 0) {
				this._bufferBoxes.push(new BuffersBox(this._webGL, indexes, positions, normals, colors, textures, indexesPerMaterial));
			}
		}

		public getBufferBoxes() : BuffersBox[] {
			return this._bufferBoxes;
		}

		public getMaterials() : {[key : string] : Material} {
			return this._materials;
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
			mesh._bufferBoxes = this._bufferBoxes;
			mesh._materialCallback = this._materialCallback;
			if (!this._isReady) {
				this._transformationChildren.push(mesh);
			}
			return mesh;
		}

		// TODO : finish implementation
		private static _fixNormals(normals : number[], vertexes : number[], face : Face, counter) {
			var i : number,
				j : number,
				p : number[],
				point : Vector3[] = [],
				normal : Vector3,
				U : Vector3, V : Vector3,
				itemSize = 3,
				multiplier : number,
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
						p.push(vertexes[(counter + i) * itemSize + j]);
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

				multiplier = 1 / Math.sqrt(Math.pow(normal.x, 2) + Math.pow(normal.y, 2) + Math.pow(normal.z, 2));
				normal.multiply(multiplier);

				for (i = 0; i < face.vertexes.length; i++) {
						normals[(counter + i) * itemSize] = normal.x;
						normals[(counter + i) * itemSize + 1] = normal.y;
						normals[(counter + i) * itemSize + 2] = normal.z;
				}
			}
		}

		private _materialIsReady() {
			var loaded = true,
				material : string,
				child : Mesh;

			for (material in this._materials) {
				if (this._materials.hasOwnProperty(material) && !this._materials[material].ready) {
					loaded = false;
					break;
				}
			}

			if (loaded) {
				while (this._transformationChildren.length) {
					// TODO : fix that (ready callback may be missed)
					child = this._transformationChildren.shift();
					child._isReady = loaded;
					child._materials = this._materials;
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