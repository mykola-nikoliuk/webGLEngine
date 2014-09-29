var Engine = require('./webGLEngine/webGLEngine'),
	engine = new Engine(),
	camera = engine.getCamera();

var hummer = engine.createMeshFromFile('./game/Humvee/humvee.obj');
//var hummer = engine.createMeshFromFile('./game/cubus/faun_stw.obj');
var transform = hummer.getTransformations();
//transform.position.y = -130;
//transform.position.x = 330;
//transform.rotation.z = -0.1;
transform.rotation.x = -Math.PI / 2;

camera.position.set(0.3, -140, -500);