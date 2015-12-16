precision mediump float;

varying vec4 vColor;
varying vec2 vTextureCoord;
varying vec3 vTransformedNormal;
varying vec4 vPosition;
varying vec3 vLighting;
varying vec3 vLightWeighting;

uniform float uMaterialDissolved;
uniform float uMaterialSpecular;

uniform bool uUseLighting;
uniform bool uUseLight[10];
uniform bool uUseTexture;

//uniform vec3 uLightDirection[10];
//uniform vec3 uLightColor[10];
//uniform float uLightDistance;

uniform sampler2D uSampler;

vec3 avarage (vec3 a, vec3 b) {
	return vec3((a.r + b.r) / 2.0, (a.g + b.g) / 2.0, (a.b + b.b) / 2.0);
}

void main(void) {
/*	vec3 lightWeighting;
	vec4 totalColor = uUseTexture ? texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)) : vColor;
	vec3 lightColor;
	vec3 vLightWeighting;

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
  //				lightWeighting[i] = vec3(1, 1, 1) * diffuseLightWeighting*//* * distanceLightWeighting*//*;

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

	gl_FragColor = vec4(totalColor.rgb, totalColor.a);*/

	vec4 textureColor = uUseTexture ? texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)) : vColor;
  gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a * uMaterialDissolved);
//  if (gl_FragColor.a < 0.8) {
//  	discard;
//  }
}