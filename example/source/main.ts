///<reference path="config.ts"/>
///<reference path="../../source/WebGLEngine.ts"/>
///<reference path="./classes/vehicle/configurations/SimpleVehicle.ts"/>
///<reference path="./classes/vehicle/VehicleConfiguration.ts"/>
///<reference path="./classes/vehicle/VehicleBridge.ts"/>
///<reference path="./classes/vehicle/Vehicle.ts"/>
///<reference path="./classes/MeshManager.ts"/>

var game = null;

module Example {

	document.addEventListener('DOMContentLoaded', function () {
		game = new Game();
	}, false);

	export var meshManager = new MeshManager();

	export class Game {
		private static _cameraModes = {
			FLY         : 0,
			FOLLOW      : 1,
			FOLLOW_CLOSE: 2
		};

		private _engine : WebGLEngine.Engine;
		private _meshes;
		private _camera : WebGLEngine.Types.Camera;

		private _timers;
		private _canvas : HTMLCanvasElement;

		private _mouseHandler : EventListener;
		private _animation : WebGLEngine.Types.Animation;
		private _animation2 : WebGLEngine.Types.Animation;

		private _cameraMode : number;

		constructor() {
			// create console
			WebGLEngine.Console.create(16, 16, 600, 800, 30);

			// create WebGLEngine instance
			this._engine = new WebGLEngine.Engine(
				Config.webGL.shaders.fragment,
				Config.webGL.shaders.vertex
			);
			this._engine.createDebugger();

			// subscribe for webGLEngine events
			this._engine.Controller.subscribe(new WebGLEngine.Utils.Callback(this._controllerHandler, this));

			// get camera instance
			this._camera = this._engine.createCamera();
			// TODO : move camera modes to camera class
			this._cameraMode = Game._cameraModes.FLY;

			// TODO : create input class
			this._timers = {
				key_a    : false,
				key_d    : false,
				key_w    : false,
				key_s    : false,
				key_up   : false,
				key_down : false,
				key_left : false,
				key_right: false
			};

			this._meshes = {
				street: this._engine.createMeshFromFile('./resources/environment/street_deoptimized.obj'),
				sky   : this._engine.createMeshFromFile('./resources/world/cubemap.obj'),
				cube  : this._engine.createMeshFromFile('./resources/cube/cube.obj'),
				cube2  : this._engine.createMeshFromFile('./resources/cube/cube.obj')
			};

			this._camera.setPositionRule(WebGLEngine.Types.Camera.ATTACHED, new WebGLEngine.Types.Vector3(0,200,0), this._meshes.cube2);
			this._camera.setFocusRule(WebGLEngine.Types.Camera.FOLLOW, new WebGLEngine.Types.Vector3(), this._meshes.cube);

			// get canvas instance
			this._canvas = <HTMLCanvasElement>WebGLEngine.Engine.getCanvas();
			this._mouseHandler = this._updateCameraRotation.bind(this);

			// configure game objects
			this._configure();
			// TODO : add listeners to library
			this._addListeners();
			// create scene lights
			this._createLights();

			this._createAnimation();
			this._startAnimation();

			if (this._engine) {
				this._engine.Render.subscribe(new WebGLEngine.Utils.Callback(this._mainProc, this));
				// TODO : what about setFPS? Probably better to use requestAnimationFrame before setFPS wasn't called
				//this._engine.Render.setFPS(Config.engine.FPS);
			}
		}

		private _configure() : void {
			this._meshes.sky.scale.set(10000, 10000, 10000);

			this._camera.position.set(59, 19, 48);
			this._camera.rotation.set(-0.26, 0.78, 0);

			this._meshes.street.scale.set(5, 5, 5);
			this._meshes.street.position.set(0, -2, 0);
		}

		private _addListeners() : void {
			this._canvas.addEventListener('mousedown', WebGLEngine.Utils.bind(this._lockCursor, this), false);
			document.addEventListener('keydown', WebGLEngine.Utils.bind(this._keyDown, this), false);
			document.addEventListener('keyup', WebGLEngine.Utils.bind(this._keyUp, this), false);
			if ("onpointerlockchange" in document) {
				document.addEventListener('pointerlockchange', WebGLEngine.Utils.bind(this._releaseCursor, this), false);
			} else if ("onmozpointerlockchange" in document) {
				document.addEventListener('mozpointerlockchange', WebGLEngine.Utils.bind(this._releaseCursor, this), false);
			} else if ("onwebkitpointerlockchange" in document) {
				document.addEventListener('webkitpointerlockchange', WebGLEngine.Utils.bind(this._releaseCursor, this), false);
			}
		}

		private _createLights() {
			// TODO : fix multiple lights
			this._engine.addLight(new WebGLEngine.Types.Light(
				WebGLEngine.Types.Light.Types.DIRECTIONAL,
				new WebGLEngine.Types.Vector3(1,1,1),
				new WebGLEngine.Types.Vector3(1, 0.5, 0.25)
			));
		}

		private _mainProc(deltaTime : number) : void {
			var engine = this._engine;

			this._keysHandler();
			this._updateCameraPosition(deltaTime);
			// TODO : probably better to add chaining?
			engine.beginDraw();
			engine.turnOffLight();
			engine.draw(this._meshes.sky);
			engine.draw(this._meshes.cube);
			engine.draw(this._meshes.cube2);
			engine.draw(this._meshes.street);
			engine.turnOnLight();
		}

		// TODO : move handler to library
		private _lockCursor() : void {
			document.addEventListener('mousemove', this._mouseHandler, false);
			var canvas = <any>this._canvas;
			canvas.requestPointerLock = canvas.requestPointerLock ||
				canvas.mozRequestPointerLock ||
				canvas.webkitRequestPointerLock;
			canvas.requestPointerLock();
		}

		// TODO : move handler to library
		private _releaseCursor() : void {
			var doc = <any>document;
			if (doc.pointerLockElement !== this._canvas &&
				doc.mozPointerLockElement !== this._canvas &&
				doc.webkitPointerLockElement !== this._canvas) {
				doc.removeEventListener('mousemove', this._mouseHandler, false);
			}
		}

		private _keysHandler() : void {
			if (this._timers.key_left) {
				this._meshes.car.turnLeft();
			}
			if (this._timers.key_right) {
				this._meshes.car.turnRight();
			}
		}

		// TODO : should be moved to library as some mode but left this functionality for user
		private _updateCameraRotation(e) : void {
			var x = e.movementX || e.mozMovementX || e.webkitMovementX || 0,
				y = e.movementY || e.mozMovementY || e.webkitMovementY || 0,
				sensitivity = Config.camera.mouse.sensitivity;

			var vec31 = [0, -x / sensitivity, 0],
				vec32 = [-y / sensitivity, 0, 0];

			this._camera.rotation.add(vec31[0], vec31[1], vec31[2]);
			this._camera.rotation.add(vec32[0], vec32[1], vec32[2]);
		}

		// TODO : should be moved to library as some mode but left this functionality for user
		private _updateCameraPosition(deltaTime : number) : void {
			var speed,
				staticSpeed = 100,
				offset = [];

			speed = deltaTime / 1000 * staticSpeed;

			var direction = new WebGLEngine.Types.Vector3();

			if (this._timers.key_w) {
				direction.z = -1;
			}

			if (this._timers.key_s) {
				direction.z = 1;
			}

			if (this._timers.key_a) {
				direction.x = -1;
			}

			if (this._timers.key_d) {
				direction.x = 1;
			}

			WebGLEngine.Utils.GLMatrix.mat4.multiplyVec3(this._camera.rotationMatrix.matrixArray, direction.getArray(), offset);

			this._camera.position.add(offset[0] * speed, offset[1] * speed, offset[2] * speed);
		}

		// TODO : make animation work with separate types of animation
		private _createAnimation() : void {

			this._animation = new WebGLEngine.Types.Animation(
				WebGLEngine.Types.Animation.Types.WITH_CHANGES,

				new WebGLEngine.Types.Frame()
					.setPosition(new WebGLEngine.Types.Vector3(0, 0, 0))
					.setRotation(new WebGLEngine.Types.Vector3(0, 0, 0)),
				[
					new WebGLEngine.Types.Frame()
						.setPosition(new WebGLEngine.Types.Vector3(40, 0, 0))
						.setRotation(new WebGLEngine.Types.Vector3(Math.PI * 2, Math.PI / 4, 0))
						.setTime(1000),
					new WebGLEngine.Types.Frame()
						.setPosition(new WebGLEngine.Types.Vector3(40, 0, 40))
						.setRotation(new WebGLEngine.Types.Vector3(Math.PI * 4, 0, 0))
						.setTime(1000),
					new WebGLEngine.Types.Frame()
						.setPosition(new WebGLEngine.Types.Vector3(0, 0, 40))
						.setRotation(new WebGLEngine.Types.Vector3(Math.PI * 2, 0, 0))
						.setTime(1000),
					new WebGLEngine.Types.Frame()
						.setPosition(new WebGLEngine.Types.Vector3(0, 40, 40))
						.setRotation(new WebGLEngine.Types.Vector3(Math.PI * 4, 0, 0))
						.setTime(1000),
					new WebGLEngine.Types.Frame()
						.setPosition(new WebGLEngine.Types.Vector3(0, 40, 0))
						.setRotation(new WebGLEngine.Types.Vector3(Math.PI * 4, 0, 0))
						.setTime(4000),
					new WebGLEngine.Types.Frame()
						.setPosition(new WebGLEngine.Types.Vector3(0, 0, 0))
						.setRotation(new WebGLEngine.Types.Vector3(Math.PI * 4, 0, 0))
						.setTime(4000)
				]
			);
			// test animation
			// this._animation = new WebGLEngine.Types.Animation(
			// 	WebGLEngine.Types.Animation.Types.WITH_CHANGES,
            //
			// 	new WebGLEngine.Types.Frame()
			// 		.setPosition(new WebGLEngine.Types.Vector3(-16.85797848025723, 12.674998062742992, 135.3757210551033))
			// 		.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + -0.08250000000000035, -1.610796326794911, 0)),
            //
			// 	[
			// 		new WebGLEngine.Types.Frame()
			// 			.setPosition(new WebGLEngine.Types.Vector3(136.40451406685602, 5.415755109754397, 133.30897309960255))
			// 			.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + 0.04249999999999963, -1.5382963267949123, 0)),
			// 		new WebGLEngine.Types.Frame()
			// 			.setPosition(new WebGLEngine.Types.Vector3(166.92537377876405, 13.87551154649805, 135.66199169524546))
			// 			.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + 0.059999999999999554, -1.158296326794911, 0)),
			// 		new WebGLEngine.Types.Frame()
			// 			.setPosition(new WebGLEngine.Types.Vector3(176.56004296081076, 22.734961602354524, 125.54120391044728))
			// 			.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + 0.07249999999999955, -0.7057963267949127, 0)),
			// 		new WebGLEngine.Types.Frame()
			// 			.setPosition(new WebGLEngine.Types.Vector3(179.28899592498212, 24.84508806214609, 107.87830239480094))
			// 			.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + 0.039999999999999515, -0.07079632679491238, 0)),
			// 		new WebGLEngine.Types.Frame()
			// 			.setPosition(new WebGLEngine.Types.Vector3(182.96241814113472, 26.42981155369769, 54.02852808470881))
			// 			.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + 0.01999999999999952, -0.06329632679491237, 0)),
			// 		new WebGLEngine.Types.Frame()
			// 			.setPosition(new WebGLEngine.Types.Vector3(135.45437959461776, 16.6388461574058, -4.666124544685863))
			// 			.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + -0.1850000000000006, 1.3692036732050852, 0)),
			// 		new WebGLEngine.Types.Frame()
			// 			.setPosition(new WebGLEngine.Types.Vector3(79.6288098713936, 14.491545215427712, -7.243745352305449))
			// 			.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + -0.012500000000000497, 1.551703673205082, 0)),
			// 		new WebGLEngine.Types.Frame()
			// 			.setPosition(new WebGLEngine.Types.Vector3(18.47103498247786, 11.988485530725889, 4.17309100277266))
			// 			.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + -0.08250000000000052, 2.1142036732050804, 0)),
			// 		new WebGLEngine.Types.Frame()
			// 			.setPosition(new WebGLEngine.Types.Vector3(-11.839525845439713, 9.859977467817682, 37.74541925333037))
			// 			.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + -0.0200000000000005, 2.6217036732050745, 0)),
			// 		new WebGLEngine.Types.Frame()
			// 			.setPosition(new WebGLEngine.Types.Vector3(-19.272998573951327, 9.71999955068464, 97.612877613702))
			// 			.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + 0.004999999999999498, 3.3042036732050626, 0)),
			// 		new WebGLEngine.Types.Frame()
			// 			.setPosition(new WebGLEngine.Types.Vector3(-16.85797848025723, 12.674998062742992, 135.3757210551033))
			// 			.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + -0.08250000000000035, Math.PI + 1.610796326794911, 0))
			// 	]
			// );
			// this._animation.setTimeByDistance(10000);
            //
			// this._animation2 = new WebGLEngine.Types.Animation(
			// 	WebGLEngine.Types.Animation.Types.WITH_CHANGES,
            //
			// 	new WebGLEngine.Types.Frame()
			// 		.setPosition(new WebGLEngine.Types.Vector3(0, 10.0001, 0))
			// 		.setRotation(new WebGLEngine.Types.Vector3(0, 0, 0)),
			// 	[
			// 		new WebGLEngine.Types.Frame()
			// 			.setPosition(new WebGLEngine.Types.Vector3(0, 10.0002, 0))
			// 			.setRotation(new WebGLEngine.Types.Vector3(Math.PI * 2, Math.PI / 4, 0))
			// 			.setTime(2000),
			// 		new WebGLEngine.Types.Frame()
			// 			.setPosition(new WebGLEngine.Types.Vector3(0, 10.0001, 0))
			// 			.setRotation(new WebGLEngine.Types.Vector3(Math.PI * 4, 0, 0))
			// 			.setTime(2000),
			// 	]
			// );
		}

		private _startAnimation() : void {
			this._animation.start(this._meshes.cube2, new WebGLEngine.Utils.Callback(this._startAnimation, this));
		}

		// TODO : move handler to library
		private _keyDown(e) : void {
			switch (e.keyCode) {
				case 65:
					this._timers.key_a = true;
					break;

				case 87:
					this._timers.key_w = true;
					break;

				case 68:
					this._timers.key_d = true;
					break;

				case 83:
					this._timers.key_s = true;
					break;

				case 38:
				case 29460:
					this._timers.key_up = true;
					break;

				case 40:
				case 29461:
					this._timers.key_down = true;
					break;

				case 37:
				case 4:
					this._timers.key_left = true;
					break;

				case 39:
				case 5:
					this._timers.key_right = true;
					break;

				// this.KEY_WHEELDOWN = 29469;
				// this.KEY_WHEELUP = 29468;
				// this.KEY_ENTER = 29443;
			}
		}

		// TODO : move handler to library
		private _keyUp(e) : void {
			switch (e.keyCode) {
				case 65:
					this._timers.key_a = false;
					break;

				case 87:
					this._timers.key_w = false;
					break;

				case 68:
					this._timers.key_d = false;
					break;

				case 83:
					this._timers.key_s = false;
					break;

				case 13:
					//this._startAnimation();
					break;

				case 67: // C
					this._changeCameraMode();
					break;

				case 38:
				case 29460:
					//this._startAnimation();
					break;

				case 40:
				case 29461:
					this._timers.key_down = false;
					break;

				case 37:
				case 4:
					this._timers.key_left = false;
					break;

				case 39:
				case 5:
					this._timers.key_right = false;
					break;
			}
		}

		// TODO : move camera modes to Camera class
		private _changeCameraMode() : void {
			// switch (this._cameraMode) {
			// 	case Game._cameraModes.FLY:
			// 		this._camera.follow(this._meshes.plane);
			// 		this._cameraMode = Game._cameraModes.FOLLOW;
			// 		break;
            //
			// 	case Game._cameraModes.FOLLOW:
			// 		this._camera.follow(this._meshes.plane, 10);
			// 		this._cameraMode = Game._cameraModes.FOLLOW_CLOSE;
			// 		break;
            //
			// 	case Game._cameraModes.FOLLOW_CLOSE:
			// 		this._camera.unfollow();
			// 		this._cameraMode = Game._cameraModes.FLY;
			// 		break;
			// }
		}

		private _controllerHandler(event : string) : void {
			var events = WebGLEngine.Types.Controller.Events;

			switch (event) {
				case events.ALL_MESHES_LOADED:
					WebGLEngine.Console.log('So example is loaded', 'yellow');
					WebGLEngine.Console.log('Use "WASD" and mouse to fly', 'yellow');
					WebGLEngine.Console.log('To toggle camera modes use "C". Modes: FLY/FOLLOW/FOLLOW_CLOSE', 'yellow');
					break;
			}
		}
	}
}