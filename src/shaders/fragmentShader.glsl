precision mediump float;

varying vec4 vColor;
varying vec2 vTextureCoord;
varying vec3 vLightWeighting;

uniform float uMaterialDissolved;
uniform bool uUseTexture;
uniform sampler2D uSampler;

void main(void) {
    vec4 textureColor = uUseTexture ? texture2D(uSampler, vTextureCoord) : vColor;
    gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a * uMaterialDissolved);

    if (gl_FragColor.a < 0.8) {
        discard;
    }
}
