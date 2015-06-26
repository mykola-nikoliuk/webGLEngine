module webGLEngine {

	export var Config = {

		version: '0.2',
		html   : {
			canvasID: 'webGLCanvas'
		},

		File: {
			obj: {
				lineSeparator: /(\r\n|\n|\r)/g,
				nodeSeparator: /\s+/g,
				lineTypes    : {
					MATERIAL_LIBRARY: 'mtllib',
					USE_MATERIAL    : 'usemtl',
					FACE            : 'f',
					VERTEX          : 'v',
					VERTEX_TEXTURE  : 'vt',
					VERTEX_NORMAL   : 'vn'
				}
			},
			mtl: {
				lineSeparator: /(\r\n|\n|\r)/g,
				nodeSeparator: /\s+/g,
				lineTypes    : {
					NEW_MATERIAL : 'newmtl',
					MAP_TEXTURE  : 'map_kd',
					DIFFUSE_COLOR: 'kd',
					SPECULAR     : 'ns'
				}
			}
		}
	}
}
