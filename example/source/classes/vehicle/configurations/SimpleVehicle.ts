module Example.Cars {

	export let SimpleVehicle : VehicleConfiguration = {
		size                : new WebGLEngine.Types.Vector3(4, 4, 12),
		maxControlWheelAngle: Math.PI / 4,
		wheelAngleCoefficientPerStep : 1 / Config.engine.FPS,
		bridges             : [
			{ // front
				position: new WebGLEngine.Types.Vector3(0, 0, -5.5),
				wheel   : 'simpleCarWheel',
				width   : 4,
				control : true,
				drive   : false
			},
			{ // front
				position: new WebGLEngine.Types.Vector3(0, 0, -4),
				wheel   : 'simpleCarWheel',
				width   : 4,
				control : true,
				drive   : false
			},
			{ // rear
				position: new WebGLEngine.Types.Vector3(0, 0, 4),
				wheel   : 'simpleCarWheel',
				width   : 4,
				control : false,
				drive   : true
			},
			{ // rear
				position: new WebGLEngine.Types.Vector3(0, 0, 5),
				wheel   : 'simpleCarWheel',
				width   : 4,
				control : false,
				drive   : true
			}
		]
	};


}
