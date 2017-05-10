module Example {

	export let Config = {
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
				fragment: 'resources/shaders/fragmentShader.glsl',
				vertex  : 'resources/shaders/vertexShader.glsl',
			}
		}
	};
}