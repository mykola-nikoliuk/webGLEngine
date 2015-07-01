///<reference path="../../source/webGLEngine.ts"/>
///<reference path="config.ts"/>

var game = null;


document.addEventListener('DOMContentLoaded', function () {
	game = new Game();
}, false);

export class Game {
	private _engine : WebGLEngine.Engine;
	private _meshes;
	private _camera : WebGLEngine.Types.Camera;

	private _timers;
	private _canvas : HTMLCanvasElement;

	private _mouseHandler : EventListener;
	private _animation : WebGLEngine.Types.Animation;
	private _animation2 : WebGLEngine.Types.Animation;

	constructor() {

		WebGLEngine.Console.create(16, 16, 600, 800, 30);

		this._engine = new WebGLEngine.Engine(
			Config.webGL.shaders.fragment,
			Config.webGL.shaders.vertex
		);

		this._camera = this._engine.getCamera();

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
			sky   : this._engine.createMeshFromFile('./resources/world/cubemap.obj', {textureRepeat: false}),
			cube  : null,
			plane : this._engine.createMeshFromFile('./resources/F14A/F-14A_Tomcat.obj', {textureRepeat: false}),
			plane2: null,
			street: this._engine.createMeshFromFile('./resources/environment/street_deoptimized.obj', {textureRepeat: false})
		};

		this._meshes.sky.callback(new WebGLEngine.Utils.Callback(this._createCube, this));

		this._canvas = <HTMLCanvasElement>WebGLEngine.Engine.getCanvas();
		this._mouseHandler = WebGLEngine.Utils.bind(this._updateCameraRotation, this);

		this._configure();
		this._addListeners();
		this._createLights();

		this._createAnimation();
		this._startAnimation();

		if (this._engine) {
			this._engine.Render.subscribe(new WebGLEngine.Utils.Callback(this._mainProc, this));
			this._engine.Render.setFPS(Config.engine.FPS);
		}
	}

	private _createCube() : void {
		this._meshes.cube = this._meshes.sky.transformationClone();
		this._meshes.cube.position.set(0, 0, 10);
		this._meshes.cube.rotation.set(Math.PI / 2, 0, 0);
		//this._meshes.cube.scale.set(10, 10, 10);
		this._meshes.cube.setParent(this._meshes.plane);
		this._startAnimation2();
	}

	private _configure() : void {
		this._meshes.sky.scale.set(10000, 10000, 10000);

		this._camera.position.set(-79, 63, -50);
		this._camera.rotation.set(-0.23, -2.20, 0);

		this._meshes.sky.position.set(-this._camera.position.x,
			-this._camera.position.y, -this._camera.position.z);

		this._meshes.street.scale.set(5, 5, 5);
		//this._meshes.street.position.set(0, -20, 0);

		this._meshes.plane.scale.set(0.3, 0.3, 0.3);
		this._meshes.plane.position.set(70, -10, 0);
	}

	private _addListeners() : void {
		this._canvas.addEventListener('mousedown', WebGLEngine.Utils.bind(this._lockCursor, this), false);
		document.addEventListener('keydown', WebGLEngine.Utils.bind(this._keyDown, this), false);
		document.addEventListener('keyup', WebGLEngine.Utils.bind(this.keyUp, this), false);
		if ("onpointerlockchange" in document) {
			document.addEventListener('pointerlockchange', WebGLEngine.Utils.bind(this._releaseCursor, this), false);
		} else if ("onmozpointerlockchange" in document) {
			document.addEventListener('mozpointerlockchange', WebGLEngine.Utils.bind(this._releaseCursor, this), false);
		} else if ("onwebkitpointerlockchange" in document) {
			document.addEventListener('webkitpointerlockchange', WebGLEngine.Utils.bind(this._releaseCursor, this), false);
		}
	}

	private _createLights() {
		this._engine.createLight(0, [1, 1, 1], [0, 0, 0], 1000.0);
	}

	private _mainProc() : void {
		var engine = this._engine;

		//this._game.engine();
		this._updateCameraPosition();
		engine.beginDraw();
		engine.turnOffLight();
		engine.draw(this._meshes.sky);
		engine.draw(this._meshes.cube);
		engine.draw(this._meshes.street);
		engine.draw(this._meshes.plane);
		engine.turnOnLight();
	}

	private _lockCursor() : void {
		document.addEventListener('mousemove', this._mouseHandler, false);
		var canvas = <any>this._canvas;
		canvas.requestPointerLock = canvas.requestPointerLock ||
			canvas.mozRequestPointerLock ||
			canvas.webkitRequestPointerLock;
		canvas.requestPointerLock();
	}

	private _releaseCursor() : void {
		var doc = <any>document;
		if (doc.pointerLockElement !== this._canvas &&
			doc.mozPointerLockElement !== this._canvas &&
			doc.webkitPointerLockElement !== this._canvas) {
			doc.removeEventListener('mousemove', this._mouseHandler, false);
		}
	}

	private _updateCameraRotation(e) : void {
		var x = e.movementX || e.mozMovementX || e.webkitMovementX || 0,
			y = e.movementY || e.mozMovementY || e.webkitMovementY || 0,
			sensitivity = Config.camera.mouse.sensitivity;

		this._camera.rotation.add(-y / sensitivity, -x / sensitivity, 0);
		// look limitation
		if (this._camera.rotation.x > Math.PI / 2) {
			this._camera.rotation.x = Math.PI / 2;
		}
		if (this._camera.rotation.x < -Math.PI / 2) {
			this._camera.rotation.x = -Math.PI / 2;
		}
		// prevent overflow
		this._camera.rotation.y %= Math.PI * 2;
	}

	private _updateCameraPosition() : void {
		var staticSpeed, speed, cosX, Y = 0, X = 0, Z = 0;
		staticSpeed = 2;
		cosX = Math.cos(-this._camera.rotation.x);

		speed = staticSpeed;

		if (this._timers.key_w) {
			Y -= Math.sin(-this._camera.rotation.x);
			X -= cosX * -Math.sin(-this._camera.rotation.y);
			Z -= cosX * Math.cos(-this._camera.rotation.y);
		}

		if (this._timers.key_s) {
			Y += Math.sin(-this._camera.rotation.x);
			X += cosX * -Math.sin(-this._camera.rotation.y);
			Z += cosX * Math.cos(-this._camera.rotation.y);
		}

		if (this._timers.key_a) {
			X += Math.sin(-this._camera.rotation.y - Math.PI / 2);
			Z += -Math.cos(-this._camera.rotation.y - Math.PI / 2);
		}

		if (this._timers.key_d) {
			X += -Math.sin(-this._camera.rotation.y - Math.PI / 2);
			Z += Math.cos(-this._camera.rotation.y - Math.PI / 2);
		}

		this._camera.position.add(X * speed, Y * speed, Z * speed);
	}

	private _createAnimation() : void {
		// test animation
		this._animation = new WebGLEngine.Types.Animation(
			WebGLEngine.Types.Animation.Types.WITH_CHANGES,

			new WebGLEngine.Types.Frame()
				.setPosition(new WebGLEngine.Types.Vector3(-16.85797848025723, 12.674998062742992, 135.3757210551033))
				.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + -0.08250000000000035, -1.610796326794911, 0)),

			[
				new WebGLEngine.Types.Frame()
					.setPosition(new WebGLEngine.Types.Vector3(136.40451406685602, 5.415755109754397, 133.30897309960255))
					.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + 0.04249999999999963, -1.5382963267949123, 0)),
				new WebGLEngine.Types.Frame()
					.setPosition(new WebGLEngine.Types.Vector3(166.92537377876405, 13.87551154649805, 135.66199169524546))
					.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + 0.059999999999999554, -1.158296326794911, 0)),
				new WebGLEngine.Types.Frame()
					.setPosition(new WebGLEngine.Types.Vector3(176.56004296081076, 22.734961602354524, 125.54120391044728))
					.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + 0.07249999999999955, -0.7057963267949127, 0)),
				new WebGLEngine.Types.Frame()
					.setPosition(new WebGLEngine.Types.Vector3(179.28899592498212, 24.84508806214609, 107.87830239480094))
					.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + 0.039999999999999515, -0.07079632679491238, 0)),
				new WebGLEngine.Types.Frame()
					.setPosition(new WebGLEngine.Types.Vector3(182.96241814113472, 26.42981155369769, 54.02852808470881))
					.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + 0.01999999999999952, -0.06329632679491237, 0)),
				new WebGLEngine.Types.Frame()
					.setPosition(new WebGLEngine.Types.Vector3(135.45437959461776, 16.6388461574058, -4.666124544685863))
					.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + -0.1850000000000006, 1.3692036732050852, 0)),
				new WebGLEngine.Types.Frame()
					.setPosition(new WebGLEngine.Types.Vector3(79.6288098713936, 14.491545215427712, -7.243745352305449))
					.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + -0.012500000000000497, 1.551703673205082, 0)),
				new WebGLEngine.Types.Frame()
					.setPosition(new WebGLEngine.Types.Vector3(18.47103498247786, 11.988485530725889, 4.17309100277266))
					.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + -0.08250000000000052, 2.1142036732050804, 0)),
				new WebGLEngine.Types.Frame()
					.setPosition(new WebGLEngine.Types.Vector3(-11.839525845439713, 9.859977467817682, 37.74541925333037))
					.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + -0.0200000000000005, 2.6217036732050745, 0)),
				new WebGLEngine.Types.Frame()
					.setPosition(new WebGLEngine.Types.Vector3(-19.272998573951327, 9.71999955068464, 97.612877613702))
					.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + 0.004999999999999498, 3.3042036732050626, 0)),
				new WebGLEngine.Types.Frame()
					.setPosition(new WebGLEngine.Types.Vector3(-16.85797848025723, 12.674998062742992, 135.3757210551033))
					.setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + -0.08250000000000035, Math.PI + 1.610796326794911, 0))
			]
		);
		this._animation.setTimeByDistance(10000);


		this._animation2 = new WebGLEngine.Types.Animation(
			WebGLEngine.Types.Animation.Types.WITH_CHANGES,

			new WebGLEngine.Types.Frame()
				.setPosition(new WebGLEngine.Types.Vector3(0, 0, 10))
				.setRotation(new WebGLEngine.Types.Vector3(Math.PI / 2, 0, 0)),

			[
				new WebGLEngine.Types.Frame()
					.setPosition(new WebGLEngine.Types.Vector3(0, 0, 12))
					.setRotation(new WebGLEngine.Types.Vector3(Math.PI / 2, 0, Math.PI * 2))
					.setTime(500),
				new WebGLEngine.Types.Frame()
					.setPosition(new WebGLEngine.Types.Vector3(0, 0, 10))
					.setRotation(new WebGLEngine.Types.Vector3(Math.PI / 2, 0, Math.PI * 4))
					.setTime(1000),
			]
		);
	}

	private _startAnimation() : void {
		this._animation.start(this._meshes.plane, new WebGLEngine.Utils.Callback(this._startAnimation, this));
	}

	private _startAnimation2() : void {
		this._animation2.start(this._meshes.cube, new WebGLEngine.Utils.Callback(this._startAnimation2, this));
	}

	private _showTransfrmations() : void {
		console.log('--');
		console.log('' + this._camera.position.x + ', ' + this._camera.position.y + ', ' + this._camera.position.z);
		console.log('' + this._camera.rotation.x + ', ' + this._camera.rotation.y + ', ' + this._camera.rotation.z);
	}

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

	private keyUp(e) : void {
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

			case 32:
				this._showTransfrmations();
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
}