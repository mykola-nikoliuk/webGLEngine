export var Config = {
	engine: {
		FPS: 30
	},

	camera: {
		mouse: {
			sensitivity: 400
		}
	},

	webGL: {
		shaders: {
			fragment: '../source/shaders/fragmentShader.fsh',
			vertex  : '../source/shaders/vertexShader.vsh',
		}
	}
};
