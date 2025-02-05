attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec4 aVertexColor;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;

uniform bool uUseLighting;
uniform int uLightCount;
uniform vec3 uLightPosition[10];
uniform vec3 uLightColor[10];
uniform bool uUseLight[10];

uniform vec3 uAmbientColor; // NEW: Ambient light color

varying vec4 vColor;
varying vec2 vTextureCoord;
varying vec3 vLightWeighting;

void main(void) {
    vColor = aVertexColor;
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vTextureCoord = aTextureCoord;

    if (!uUseLighting) {
        vLightWeighting = vec3(1.0, 1.0, 1.0);
    } else {
        vec3 transformedNormal = normalize(uNMatrix * aVertexNormal);
        vec3 totalLight = uAmbientColor; // NEW: Start with ambient light

        for (int i = 0; i < 10; i++) {
            if (i >= uLightCount) break;

            if (uUseLight[i]) {
                vec3 lightDir = normalize(uLightPosition[i]);
                float lightIntensity = max(dot(transformedNormal, lightDir), 0.0);
                totalLight += uLightColor[i] * lightIntensity;
            }
        }

        vLightWeighting = totalLight;
    }
}
