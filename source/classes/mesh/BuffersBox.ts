module WebGLEngine.Types {

	export class BuffersBox {

		private _indexBuffers : any;
		private _positionBuffer : any;
		private _normalBuffer : any;
		private _colorBuffer : any;
		private _textureBuffer : any;
		private _webGL;

		constructor(webGL, indexes : {}, positions, normals, colors, textures) {
			this._webGL = webGL;
			this._createIndexBuffers(indexes);
			this._createBuffers(positions, normals, colors, textures);
		}

		public getIndexBuffers() : void {
			return this._indexBuffers;
		}

		public getPositionBuffer() : void {
			return this._positionBuffer
		}

		public getColorBuffer() : void {
			return this._colorBuffer;
		}

		public getNormalBuffer() : void {
			return this._normalBuffer;
		}

		public getTextureBuffer() : void {
			return this._textureBuffer;
		}

		private _createIndexBuffers(indexes) : void {
			var indexBuffer,
				material : string;

			this._indexBuffers = {};

			for (material in indexes) {
				if (indexes.hasOwnProperty(material)) {
					indexBuffer = this._bindBuffer(indexes[material], this._webGL.ELEMENT_ARRAY_BUFFER, Uint16Array, 1);
					this._indexBuffers[material] = {
						material: material,
						buffer  : indexBuffer
					};
				}
			}
		}

		private _createBuffers(positions, normals, colors, textures) : void {
			this._positionBuffer = this._bindBuffer(positions, this._webGL.ARRAY_BUFFER, Float32Array, 3);
			this._normalBuffer = this._bindBuffer(normals, this._webGL.ARRAY_BUFFER, Float32Array, 3);
			this._colorBuffer = this._bindBuffer(colors, this._webGL.ARRAY_BUFFER, Float32Array, 3);
			this._textureBuffer = this._bindBuffer(textures, this._webGL.ARRAY_BUFFER, Float32Array, 2);
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