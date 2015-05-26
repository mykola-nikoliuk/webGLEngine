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

	/** @type {WebClient} */
	client : new WebClient(),

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
			sky     : this._engine._createMeshFromFile('./resources/world/sky.obj', {textureRepeat : false}),
			//			planet : this.createSphere(this.config.game.planet.radius, 256, './resources/planet/blank.png'),
			//			runner : this.createSphere(this.config.game.runner.radius, 32, './resources/sphere/runner.png'),
			car     : this._engine._createMeshFromFile('./resources/mazda3/model/mazda3.obj', {textureRepeat : false}),
			players : {}
		};

		this._system = {
			canvas           : document.getElementById('webGLCanvas'),
			mouseMoveHandler : this.utils.bind(this.updateCameraRotation, this)
		};

		this.runnerPosition = new webGLEngine.Types.Vector3();


		this.client.setEventListener(this.clientEventListener, this);
		this.client.connect();

		this.configure();
		this.addListeners();
		this.createLights();

		if (this._engine) {
			setInterval(this.utils.bind(this.mainProc, this), 1000 / this.config.engine.FPS);
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

		this._meshes.sky.getTransformations().rotation.set(0, Math.PI, 0);
		//
		this._camera.position.set(0, -102, -50);
		this._camera.rotation.set(0.0, Math.PI / 2, 0);

		this._meshes.sky.getTransformations().position.set(-this._camera.position.x,
			-this._camera.position.y, -this._camera.position.z);

		this._meshes.car.getTransformations().scale.set(0.01, 0.01, 0.01);
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
		//		this._engine.createLight(0, [1, 0, 0], [-600, 0, 000], 10000);
		//				this._engine.createLight(0, [0, 0, 1], [0, 0, 0], 100.0);
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
		var engine   = this._engine,
				position = this._game.getPlayerPosition();

		// TODO: delete it
		var time = Date.now();
		var rotateAngle = -Date.now() / 8000 % (Math.PI * 2),
				runnerAngle = rotateAngle * this.config.game.planet.radius / this.config.game.runner.radius,
				player,
				clientData  = this.client.getData();

		if (this._engine.isReady()) {

			//					this._engine._lights[0]._position.set(this._camera.position.x, this._camera.position.y, this._camera.position.z);

			this._game.engine();

			this.runnerPosition.set(position.x, position.y, position.z);

			this.updateCameraPosition();

			//			this._meshes.planet.getTransformations().rotation.set(0, rotateAngle, Math.PI / 2);

			//			this._meshes.runner.getTransformations().rotation.set(runnerAngle, 0, 0);
			//					this._meshes.runner.getTransformations().scale.set(10, 10, 10);
			//					this._meshes.runner.getTransformations().position.set(0,0,0);

			//			this._game.convertPositions(this.runnerPosition.getArray(), this._meshes.runner.getTransformations());


			engine.beginDraw();
			engine.turnOffLight();
			engine.draw(this._meshes.sky);
			engine.turnOnLight();
			//engine.draw(this._meshes.planet);
			//			engine.draw(this._meshes.runner);
			engine.draw(this._meshes.car);

			clientData.position = this._camera.position.getArray();
			clientData.angles = this._camera.rotation.getArray();
			for (var playerName in clientData.users) {
				if (clientData.users.hasOwnProperty(playerName)) {
					player = clientData.users[playerName];
					this._meshes.players[playerName].getTransformations().position.set(
						player.position[0],
						-player.position[1],
						player.position[2]
					);
					this._meshes.players[playerName].getTransformations().rotation.set(
						player.angles[0],
						-player.angles[1],
						player.angles[2]
					);
					engine.draw(this._meshes.players[playerName]);
				}
			}

			// TODO : delete it
			this.count++;
			this.total += Date.now() - time;
			if (this.count >= this.config.engine.FPS) {
				document.getElementById('fps').innerHTML = this.total / this.count | 0;
				this.count = this.total = 0;
			}
		}
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
		var x = e.movementX || e.mozMovementX || e.webkitMovementX || 0,
				y = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
		this._camera.rotation.add(y / 400, x / 400, 0);
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

			case 38:
			case 29460:
				this._timers.key_up = false;
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

