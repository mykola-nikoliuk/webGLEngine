module WebGLEngine.Types {

	export class BuffersBox {

		private _vertexIndexBuffers : any;
		private _vertexPositionBuffer : any;
		private _vertexNormalBuffer : any;
		private _vertexColorBuffer : any;
		private _vertexTextureBuffer : any;
		private _webGL;

		constructor(webGL, indexes : {}, positions, normals, colors, textures) {
			this._webGL = webGL;
			this._createIndexBuffers(indexes);
			this._createBuffers(positions, normals, colors, textures);
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

		private _createIndexBuffers(indexes) : void {
			var indexBuffer,
				material : string;

			this._vertexIndexBuffers = {};

			for (material in indexes) {
				if (indexes.hasOwnProperty(material)) {
					indexBuffer = this._bindBuffer(indexes[material], this._webGL.ELEMENT_ARRAY_BUFFER, Uint16Array, 1);
					this._vertexIndexBuffers[material] = {
						material: material,
						buffer  : indexBuffer
					};
				}
			}
		}

		private _createBuffers(positions, normals, colors, textures) : void {
			this._vertexPositionBuffer = this._bindBuffer(positions, this._webGL.ARRAY_BUFFER, Float32Array, 3);
			this._vertexNormalBuffer = this._bindBuffer(normals, this._webGL.ARRAY_BUFFER, Float32Array, 3);
			this._vertexColorBuffer = this._bindBuffer(colors, this._webGL.ARRAY_BUFFER, Float32Array, 3);
			this._vertexTextureBuffer = this._bindBuffer(textures, this._webGL.ARRAY_BUFFER, Float32Array, 2);
		}

		private _bindBuffer(array : number[], bufferType, constructor, itemSize : number) : any {
			var buffer = this._webGL.createBuffer();
			this._webGL.bindBuffer(bufferType, buffer);
			this._webGL.bufferData(bufferType, new constructor(array), this._webGL.STATIC_DRAW);
			buffer.itemSize = itemSize;
			buffer.numItems = array.length / itemSize;
			return buffer;
		}
	}
}