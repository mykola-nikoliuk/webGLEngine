document.addEventListener('DOMContentLoaded', function () { ns.init.apply(ns); }, false);

var client = {

	data : {
		id       : '',
		position : [0, 0, 0],
		angle    : [0, 0, 0]
	},

	users : {},

	/** @public */
	init : function () {
		var request = new XMLHttpRequest();
		request.open('post', '', true);
		request.onreadystatechange = function () { client.response.call(client, request); };
		request.send(JSON.stringify(this.data));
	},

	/** @private */
	response : function (request) {
		if (request.readyState === 4) {
			// If we got HTTP status 200 (OK)
			if (request.status !== 200) {
				console.log('Can\'t download file: ');
			}
			else {
				var response = JSON.parse(request.responseText);

				//noinspection FallThroughInSwitchStatementJS
				switch (response.type) {
					case 'logged':
						this.data.id = response.id;

					case 'update':
						break;
				}

				for (var user in response.users) {
					if (response.users.hasOwnProperty(user)) {
						if (this.users.hasOwnProperty(user)) {
							this.users[user].position = response.users[user].position;
							this.users[user].angles = response.users[user].angles;
						}
						else {
							// new user
							ns.addNewPlayer(user);
							console.log(user + ' has joined');
							this.users[user] = {
								position : response.users[user].position,
								angles   : response.users[user].angles
							};
						}
					}
				}

				for (user in this.users) {
					if (this.users.hasOwnProperty(user)) {
						if (!response.users.hasOwnProperty(user)) {
							console.log(user + ' has leave the game');
							ns.removePlayer(user);
							delete this.users[user];
						}
					}
				}

				//				console.log(response.type);

				this.init();
			}
		}
	}
};


var ns = {

	classes : {},

	/** @type webGLEngine.Engine */
	_engine : null,

	///** @type {WebClient} */
	//client : new WebClient(),

	init : function () {

		// TODO: delete it
		this.count = 0;
		this.total = 0;

		this.utils = new InitUtilities();

		this._engine = new webGLEngine.Engine(
			this.config.webGL.shaders.fragment,
			this.config.webGL.shaders.vertex
		);

		this._camera = this._engine.getCamera();
		this._game = new this.classes.Game();
		this._timers = {
			key_a     : false,
			key_d     : false,
			key_w     : false,
			key_s     : false,
			key_up    : false,
			key_down  : false,
			key_left  : false,
			key_right : false
		};

		this._meshes = {
			sky     : ns._engine._createMeshFromFile('./resources/world/sky.obj', {textureRepeat : false}),
			plane   : ns._engine._createMeshFromFile('./resources/F14A/F-14A_Tomcat.obj', {textureRepeat : false}),
			street  : ns._engine._createMeshFromFile('./resources/environment/street_deoptimized.obj', {textureRepeat : false}),
			players : {}
		};

		this._system = {
			canvas           : document.getElementById('webGLCanvas'),
			mouseMoveHandler : this.utils.bind(this.updateCameraRotation, this)
		};

		this.runnerPosition = new webGLEngine.Types.Vector3();


		//this.client.setEventListener(this.clientEventListener, this);
		//this.client.connect();

		this.configure();
		this.addListeners();
		this.createLights();

		this._createAnimation();
		this._startAnimation();

		if (this._engine) {
			this._engine.Render.subscribe(new webGLEngine.Utils.Callback(this.mainProc, this));
			this._engine.Render.setFPS(this.config.engine.FPS);
		}
	},

	/** @public */
	clientEventListener : function (type) {
		var events = this.client.events;

		switch (type) {
			case events.PLAYES_HAS_JOINED:
				this.addNewPlayer(arguments[1]);
				break;

			case events.PLAYER_LEAVE:
				this.removePlayer(arguments[1]);
				break;
		}
	},

	/** @public */
	addNewPlayer : function (nickname) {
		var scale = 1;
		this._meshes.players[nickname] = this._engine._createMeshFromFile('./resources/head/head.obj', {textureRepeat : false});
		this._meshes.players[nickname].getTransformations().scale.set(scale, scale, scale);
	},

	/** @public */
	removePlayer : function (nickname) {
		delete this._meshes.players[nickname];
	},

	/** @public */
	configure : function () {
		//				this._meshes.runner.getTransformations().position.set(0, 197.8, 30);
		//				this._meshes.runner.getTransformations().rotation.set(-0.16, Math.PI, 0);
		//				this._meshes.runner.getTransformations().scale.set(3, 3, 3);

		//		var scale = 20;

		//				this._meshes.car.getTransformations().scale.set(scale, scale, scale);

		this._meshes.sky.rotation.set(0, Math.PI, 0);
		//
		this._camera.position.set(62, -62, -155);
		this._camera.rotation.set(0.45, -93, 0);

		this._meshes.sky.position.set(-this._camera.position.x,
			-this._camera.position.y, -this._camera.position.z);

		this._meshes.street.scale.set(5, 5, 5);
		this._meshes.plane.scale.set(0.3, 0.3, 0.3);
		this._meshes.plane.position.set(70, -10, 0);
	},

	/** Add global listeners to document
	 * @public */
	addListeners : function () {
		this._system.canvas.addEventListener('mousedown', this.utils.bind(this.lockCursor, this), false);
		document.addEventListener('keydown', this.utils.bind(this.keyDown, this), false);
		document.addEventListener('keyup', this.utils.bind(this.keyUp, this), false);
		if ("onpointerlockchange" in document) {
			document.addEventListener('pointerlockchange', this.utils.bind(this.releaseCursor, this), false);
		} else if ("onmozpointerlockchange" in document) {
			document.addEventListener('mozpointerlockchange', this.utils.bind(this.releaseCursor, this), false);
		} else if ("onwebkitpointerlockchange" in document) {
			document.addEventListener('webkitpointerlockchange', this.utils.bind(this.releaseCursor, this), false);
		}
	},

	/** Creates lights for scene
	 * @public */
	createLights : function () {
		//this._engine.createLight(0, [1, 0, 0], [0, 0, 0], 50);
		//this._engine.createLight(0, [0, 0, 1], [0, 0, 0], 100.0);
		this._engine.createLight(0, [1, 1, 1], [0, 0, 0], 1000.0);
	},

	/** @private */
	updatePlayersData : function () {

	},

	/** Create sphere (mesh) from code
	 * @public
	 * @param {number} radius
	 * @param {number} size
	 * @param {string} texture */
	createSphere : function (radius, size, texture) {

		var vertexes     = [], normals = [], textures = [], faces = {}, materials = {},
				materialName = texture,
				latNumber, longNumber;

		radius = typeof radius === 'number' ? radius : 10;
		size = typeof size === 'number' ? size : 16;

		materials[materialName] = new this._engine.classes.Material();
		faces[materialName] = [];

		// generates vertexes, normals and textures
		for (latNumber = 0; latNumber <= size; latNumber++) {
			var theta = latNumber * Math.PI / size;
			var sinTheta = Math.sin(theta);
			var cosTheta = Math.cos(theta);

			for (longNumber = 0; longNumber <= size; longNumber++) {
				var phi = longNumber * 2 * Math.PI / size;
				var sinPhi = Math.sin(phi);
				var cosPhi = Math.cos(phi);

				var x = cosPhi * sinTheta;
				var y = cosTheta;
				var z = sinPhi * sinTheta;
				var u = 1 - (longNumber / size);
				var v = 1 - (latNumber / size);

				normals.push(x);
				normals.push(y);
				normals.push(z);
				textures.push(u);
				textures.push(v);
				vertexes.push(radius * x);
				vertexes.push(radius * y);
				vertexes.push(radius * z);
			}
		}

		// generates vertex indexes for faces
		for (latNumber = 0; latNumber < size; latNumber++) {
			for (longNumber = 0; longNumber < size; longNumber++) {
				var first = (latNumber * (size + 1)) + longNumber;
				var second = first + size + 1;
				faces[materialName].push(new this._engine.classes.Face(first, first, first));
				faces[materialName].push(new this._engine.classes.Face(second, second, second));
				faces[materialName].push(new this._engine.classes.Face(first + 1, first + 1, first + 1));
				faces[materialName].push(new this._engine.classes.Face(second, second, second));
				faces[materialName].push(new this._engine.classes.Face(second + 1, second + 1, second + 1));
				faces[materialName].push(new this._engine.classes.Face(first + 1, first + 1, first + 1));
			}
		}

		materials[materialName].diffuseColor = [1, 1, 1];
		materials[materialName].specular = 50;
		materials[materialName].loadTexture(this._engine.getGLInstance(), texture, false);

		return this._engine.createMesh(vertexes, textures, normals, faces, materials);
	},

	/** Main loop function
	 * @private */
	mainProc : function () {
		var engine = this._engine;

		this._game.engine();
		this.updateCameraPosition();
		engine.beginDraw();
		engine.turnOffLight();
		engine.draw(this._meshes.sky);
		engine.draw(this._meshes.street);
		engine.draw(this._meshes.plane);
		engine.turnOnLight();
	},

	/** Locks cursor into canvas for using mouse
	 * @public */
	lockCursor : function () {
		document.addEventListener('mousemove', this._system.mouseMoveHandler, false);
		//noinspection JSUnresolvedVariable
		this._system.canvas.requestPointerLock = this._system.canvas.requestPointerLock ||
			this._system.canvas.mozRequestPointerLock ||
			this._system.canvas.webkitRequestPointerLock;
		this._system.canvas.requestPointerLock();
	},

	/** Release mouse cursor
	 * @public */
	releaseCursor : function () {
		//noinspection JSUnresolvedVariable
		if (document.pointerLockElement !== this._system.canvas &&
			document.mozPointerLockElement !== this._system.canvas &&
			document.webkitPointerLockElement !== this._system.canvas) {
			document.removeEventListener('mousemove', this._system.mouseMoveHandler, false);
		}
	},

	/** Updates camera direction
	 * @public */
	updateCameraRotation : function (e) {
		//noinspection JSUnresolvedVariable
		var x           = e.movementX || e.mozMovementX || e.webkitMovementX || 0,
				y           = e.movementY || e.mozMovementY || e.webkitMovementY || 0,
				sensitivity = ns.config.camera.mouse.sensitivity;

		this._camera.rotation.add(y / sensitivity, x / sensitivity, 0);
		// look limitation
		if (this._camera.rotation.x > Math.PI / 2) {
			this._camera.rotation.x = Math.PI / 2;
		}
		if (this._camera.rotation.x < -Math.PI / 2) {
			this._camera.rotation.x = -Math.PI / 2;
		}
		// prevent overflow
		this._camera.rotation.y %= Math.PI * 2;
	},

	/** Updates camera position
	 * @public */
	updateCameraPosition : function () {
		var staticSpeed, speed, cosX, Y = 0, X = 0, Z = 0;
		staticSpeed = 2;
		cosX = Math.cos(this._camera.rotation.x);

		speed = staticSpeed;

		if (this._timers.key_w) {
			Y += Math.sin(this._camera.rotation.x);
			X += cosX * -Math.sin(this._camera.rotation.y);
			Z += cosX * Math.cos(this._camera.rotation.y);
		}

		if (this._timers.key_s) {
			Y -= Math.sin(this._camera.rotation.x);
			X -= cosX * -Math.sin(this._camera.rotation.y);
			Z -= cosX * Math.cos(this._camera.rotation.y);
		}

		if (this._timers.key_a) {
			X += -Math.sin(this._camera.rotation.y - Math.PI / 2);
			Z += Math.cos(this._camera.rotation.y - Math.PI / 2);
		}

		if (this._timers.key_d) {
			X += Math.sin(this._camera.rotation.y - Math.PI / 2);
			Z += -Math.cos(this._camera.rotation.y - Math.PI / 2);
		}

		//		if (this._timers.key_up) {
		//			this.runnerPosition.add(0, 0, speed)
		//		}
		//
		//		if (this._timers.key_down) {
		//			this.runnerPosition.add(0, 0, -speed)
		//		}
		//
		//		if (this._timers.key_left) {
		//			this.runnerPosition.add(-speed, 0, 0)
		//		}
		//
		//		if (this._timers.key_right) {
		//			this.runnerPosition.add(speed, 0, 0)
		//		}

		this._camera.position.add(X * speed, Y * speed, Z * speed);

		//				this._meshes.sky.getTransformations().position.set(-this._camera.position.x,
		//					-this._camera.position.y, -this._camera.position.z);
	},

	_createAnimation : function () {
		// test animation
		this._animation = new webGLEngine.Types.Animation(
			webGLEngine.Types.Animation.Types.WITH_CHANGES,

			new webGLEngine.Types.Frame()
				.setPosition(new webGLEngine.Types.Vector3(-16.85797848025723, 12.674998062742992, 135.3757210551033))
				.setRotation(new webGLEngine.Types.Vector3(-Math.PI / 2 + -0.08250000000000035, -1.610796326794911, 0)),

			[
				new webGLEngine.Types.Frame()
					.setPosition(new webGLEngine.Types.Vector3(136.40451406685602, 5.415755109754397, 133.30897309960255))
					.setRotation(new webGLEngine.Types.Vector3(-Math.PI / 2 + 0.04249999999999963, -1.5382963267949123, 0)),
				new webGLEngine.Types.Frame()
					.setPosition(new webGLEngine.Types.Vector3(166.92537377876405, 13.87551154649805, 135.66199169524546))
					.setRotation(new webGLEngine.Types.Vector3(-Math.PI / 2 + 0.059999999999999554, -1.158296326794911, 0)),
				new webGLEngine.Types.Frame()
					.setPosition(new webGLEngine.Types.Vector3(176.56004296081076, 22.734961602354524, 125.54120391044728))
					.setRotation(new webGLEngine.Types.Vector3(-Math.PI / 2 + 0.07249999999999955, -0.7057963267949127, 0)),
				new webGLEngine.Types.Frame()
					.setPosition(new webGLEngine.Types.Vector3(179.28899592498212, 24.84508806214609, 107.87830239480094))
					.setRotation(new webGLEngine.Types.Vector3(-Math.PI / 2 + 0.039999999999999515, -0.07079632679491238, 0)),
				new webGLEngine.Types.Frame()
					.setPosition(new webGLEngine.Types.Vector3(182.96241814113472, 26.42981155369769, 54.02852808470881))
					.setRotation(new webGLEngine.Types.Vector3(-Math.PI / 2 + 0.01999999999999952, -0.06329632679491237, 0)),
				new webGLEngine.Types.Frame()
					.setPosition(new webGLEngine.Types.Vector3(135.45437959461776, 16.6388461574058, -4.666124544685863))
					.setRotation(new webGLEngine.Types.Vector3(-Math.PI / 2 + -0.1850000000000006, 1.3692036732050852, 0)),
				new webGLEngine.Types.Frame()
					.setPosition(new webGLEngine.Types.Vector3(79.6288098713936, 14.491545215427712, -7.243745352305449))
					.setRotation(new webGLEngine.Types.Vector3(-Math.PI / 2 + -0.012500000000000497, 1.551703673205082, 0)),
				new webGLEngine.Types.Frame()
					.setPosition(new webGLEngine.Types.Vector3(18.47103498247786, 11.988485530725889, 4.17309100277266))
					.setRotation(new webGLEngine.Types.Vector3(-Math.PI / 2 + -0.08250000000000052, 2.1142036732050804, 0)),
				new webGLEngine.Types.Frame()
					.setPosition(new webGLEngine.Types.Vector3(-11.839525845439713, 9.859977467817682, 37.74541925333037))
					.setRotation(new webGLEngine.Types.Vector3(-Math.PI / 2 + -0.0200000000000005, 2.6217036732050745, 0)),
				new webGLEngine.Types.Frame()
					.setPosition(new webGLEngine.Types.Vector3(-19.272998573951327, 9.71999955068464, 97.612877613702))
					.setRotation(new webGLEngine.Types.Vector3(-Math.PI / 2 + 0.004999999999999498, 3.3042036732050626, 0)),
				new webGLEngine.Types.Frame()
					.setPosition(new webGLEngine.Types.Vector3(-16.85797848025723, 12.674998062742992, 135.3757210551033))
					.setRotation(new webGLEngine.Types.Vector3(-Math.PI / 2 + -0.08250000000000035, Math.PI + 1.610796326794911, 0))
			]
		);
		this._animation.setTimeByDistance(10000);
	},

	_startAnimation : function () {
		this._animation.start(this._meshes.plane, new webGLEngine.Utils.Callback(this._startAnimation, this));
	},

	_showTransfrmations : function () {
		console.log('--');
		console.log('' + this._camera.position.x + ', ' + this._camera.position.y + ', ' + this._camera.position.z);
		console.log('' + this._camera.rotation.x + ', ' + this._camera.rotation.y + ', ' + this._camera.rotation.z);
	},

	/** Global key down handler
	 * @public */
	keyDown : function (e) {
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
				this._game.accelerate();
				this._timers.key_up = true;
				break;

			case 40:
			case 29461:
				this._game.disaccelerate();
				this._timers.key_down = true;
				break;

			case 37:
			case 4:
				this._game.goLeft();
				this._timers.key_left = true;
				break;

			case 39:
			case 5:
				this._game.goRight();
				this._timers.key_right = true;
				break;

			// this.KEY_WHEELDOWN = 29469;
			// this.KEY_WHEELUP = 29468;
			// this.KEY_ENTER = 29443;
		}
	},

	/** Global key up handler
	 * @public */
	keyUp : function (e) {
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
				this._startAnimation();
				break;

			case 32:
				this._showTransfrmations();
				break;

			case 38:
			case 29460:
				this._startAnimation();
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
};

