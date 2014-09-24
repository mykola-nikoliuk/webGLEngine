var Engine = require('./webGLEngine/webGLEngine'),
	engine = new Engine();

var hummer = engine.createMeshFromFile('./game/Humvee/humvee.obj');
var transform = hummer.getTransformations();
transform.position.y = -130;
transform.position.x = -130;
transform.rotation.z = -0.1;
transform.rotation.x = -Math.PI / 2;