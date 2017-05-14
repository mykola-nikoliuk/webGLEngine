export default class BuffersBox {

    private _indexBuffer: any;
    private _positionBuffer: any;
    private _normalBuffer: any;
    private _colorBuffer: any;
    private _textureBuffer: any;
    private _indexesPerMaterial: any;
    private _webGL: any;

    constructor(webGL, indexes, positions, normals, colors, textures, indexesPerMaterial) {
        this._webGL = webGL;
        this._indexesPerMaterial = indexesPerMaterial;
        this._indexBuffer = this._bindBuffer(indexes, this._webGL.ELEMENT_ARRAY_BUFFER, Uint16Array, 1);
        this._createBuffers(positions, normals, colors, textures);
    }

    public getIndexBuffer(): any {
        return this._indexBuffer;
    }

    public getPositionBuffer(): any {
        return this._positionBuffer
    }

    public getColorBuffer(): any {
        return this._colorBuffer;
    }

    public getNormalBuffer(): any {
        return this._normalBuffer;
    }

    public getTextureBuffer(): any {
        return this._textureBuffer;
    }

    public getIndexesPerMaterial(): any {
        return this._indexesPerMaterial;
    }

    private _createBuffers(positions, normals, colors, textures): void {
        this._positionBuffer = this._bindBuffer(positions, this._webGL.ARRAY_BUFFER, Float32Array, 3);
        this._normalBuffer = this._bindBuffer(normals, this._webGL.ARRAY_BUFFER, Float32Array, 3);
        this._colorBuffer = this._bindBuffer(colors, this._webGL.ARRAY_BUFFER, Float32Array, 3);
        this._textureBuffer = this._bindBuffer(textures, this._webGL.ARRAY_BUFFER, Float32Array, 2);
    }

    private _bindBuffer(array: number[], bufferType, constructor, itemSize: number): any {
        var buffer = this._webGL.createBuffer();
        this._webGL.bindBuffer(bufferType, buffer);
        this._webGL.bufferData(bufferType, new constructor(array), this._webGL.STATIC_DRAW);
        buffer.itemSize = itemSize;
        buffer.numItems = array.length / itemSize;
        return buffer;
    }
}