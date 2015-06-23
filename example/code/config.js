/** Configuration structure */
ns.config = {

	engine : {
		FPS: 30
	},

	camera : {
		mouse : {
			sensitivity : 400
		}
	},

	webGL : {
		shaders : {
			fragment : './code/libs/webGLEngine/shaders/fragmentShader.fsh',
			vertex : './code/libs/webGLEngine/shaders/vertexShader.vsh',
		}
	}
};