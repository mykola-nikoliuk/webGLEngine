attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec4 aVertexColor;
attribute vec2 aTextureCoord;

uniform highp mat4 uNormalMatrix;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;
uniform bool uUseLighting;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform vec3 uDirectionalColor;
uniform vec3 uAmbientColor;


varying vec4 vColor;
varying vec2 vTextureCoord;
varying vec3 vTransformedNormal;
varying vec4 vPosition;
varying vec3 vLightWeighting;

void main(void) {
//		vPosition = uMVMatrix * vec4(aVertexPosition, 1.0);
//		gl_Position = uPMatrix * vPosition;
//		vColor = aVertexColor;
//		vTextureCoord = aTextureCoord;
//		vTransformedNormal = uNMatrix * aVertexNormal;
//
//		highp vec3 ambientLight = vec3(1, 1, 1);
//		highp vec3 directionalLightColor = vec3(1, 1, 1);
//		highp vec3 directionalVector = vec3(1, 0, 0);
//
//		highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
//
//		highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
//		vLighting = ambientLight + (directionalLightColor * directional);

			vColor = aVertexColor;
			gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
			vTextureCoord = aTextureCoord;

			if (!uUseLighting) {
					vLightWeighting = vec3(1.0, 1.0, 1.0);
			} else {
					vec3 LightingDirection = uLightDirection;
					vec3 DirectionalColor = uLightColor;
					vec3 transformedNormal = uNMatrix * aVertexNormal;
					float directionalLightWeighting = max(dot(transformedNormal, LightingDirection), 0.0);
					vLightWeighting = DirectionalColor * directionalLightWeighting;
			}
}