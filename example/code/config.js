/** Configuration structure */
ns.config = {

	game : {
		tracks : {
			amount : 3,
			width  : 3
		},

		runner : {
			radius: 1
		},

		playerPosition : {
			x : 0,
			y : 0,
			z : -32
		},

		move : {
			horizontalSpeed : 16,
			verticalSpeed : 12
		},

		planet : {
			radius : 100
		}
	},

	engine : {
		FPS: 30
	},

	webGL : {
		shaders : {
			fragment : './code/libs/webGLEngine/shaders/fragmentShader.fsh',
			vertex : './code/libs/webGLEngine/shaders/vertexShader.vsh',
		}
	}
};