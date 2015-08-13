precision mediump float;

varying vec4 vColor;
varying vec2 vTextureCoord;
varying vec3 vTransformedNormal;
varying vec4 vPosition;

uniform float uMaterialSpecular;

uniform bool uUseLighting;
uniform bool uUseLight[16];
uniform bool uUseTexture;

uniform vec3 uLightDirection[16];
uniform vec3 uLightColor[16];
uniform float uLightDistance[16];

uniform sampler2D uSampler;

vec3 avarage (vec3 a, vec3 b) {
	return vec3((a.r + b.r) / 2.0, (a.g + b.g) / 2.0, (a.b + b.b) / 2.0);
}

void main(void) {
	vec3 lightWeighting[16];
	vec4 totalColor = uUseTexture ? texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)) : vColor;
	vec3 lightColor;

	if (uUseLighting) {
		lightColor = vec3(0, 0, 0);
		for (int i = 0; i < 3; i++) {
			if (uUseLight[i]) {
				float directionalLightWeighting = max(dot(vTransformedNormal, uLightDirection[i]), 0.0);
				vec3 vLightWeighting = uLightColor[i] * directionalLightWeighting;

//				float distanceLight = distance(uLightPosition[i], vPosition.xyz);
//				vec3 lightDirection = normalize(uLightPosition[i]);
//				vec3 normal = normalize(vTransformedNormal);

//				float distanceLightWeighting = 1.0 - distanceLight / uLightDistance[i];

//				float diffuseLightWeighting = max(dot(lightDirection, normal), 0.0);
//				lightWeighting[i] = vec3(1, 1, 1) * diffuseLightWeighting/* * distanceLightWeighting*/;

//				if (uMaterialSpecular != 0.0) {
//						float specularLightWeighting = 0.0;
//						vec3 eyeDirection = normalize(-vPosition.xyz);
//						vec3 reflectionDirection = reflect(-lightDirection, normal);
//						specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uMaterialSpecular);
//						lightWeighting[i] += uLightColor[i] * specularLightWeighting;
//				}

//				if (lightWeighting[i].r < 0.0) lightWeighting[i].r = 0.0;
//				if (lightWeighting[i].g < 0.0) lightWeighting[i].g = 0.0;
//				if (lightWeighting[i].b < 0.0) lightWeighting[i].b = 0.0;

				lightColor += uLightColor[i] * vLightWeighting;
			}
		}
		totalColor = vec4(totalColor.rgb * lightColor, totalColor.a);
	}

	gl_FragColor = vec4(totalColor.rgb, totalColor.a);
}