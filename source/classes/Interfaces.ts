export interface WebGL3dProgram extends WebGLProgram {
    vertexPositionAttribute: number;
    vertexNormalAttribute: number;
    vertexColorAttribute: number;
    pMatrixUniform: WebGLUniformLocation;
    mvMatrixUniform: WebGLUniformLocation;
    nMatrixUniform: WebGLUniformLocation;
    textureCoordAttribute: number;
    textureEnabled: WebGLUniformLocation;
    samplerUniform: WebGLUniformLocation;
    useLightingUniform: WebGLUniformLocation;
    lightingDistanceUniform: WebGLUniformLocation;
    lightColorUniform: WebGLUniformLocation;
    lightingDirectionUniform: WebGLUniformLocation;
    materialSpecular: WebGLUniformLocation;
    materialDissolved: WebGLUniformLocation;
    useLightUniform: WebGLUniformLocation;
    ambientColorUniform: WebGLUniformLocation;
}

export interface WebGL3dRenderingContext extends WebGLRenderingContext {
    viewportWidth: number;
    viewportHeight: number;
}