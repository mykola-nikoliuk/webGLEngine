document.addEventListener('DOMContentLoaded', function () { ns.init.apply(ns); }, false);

var ns;
ns = {

	init : function () {
		this.utils = new InitUtilities();

		this._engine = new webGLEngine();
		this._camera = this._engine.getCamera();
		this._timers = {
			left  : false,
			right : false,
			up    : false,
			down  : false
		};

		this._meshes = {
			sky    : this._engine.createMeshFromFile('./resources/world/sky.obj', { textureRepeat : false }),
			planet : this.createSphere(200, 96)//,
//			mesh   : this._engine.createMeshFromFile('./resources/game/pigsybus/pigsybus.obj', { textureRepeat : false })
		};

		this._system = {
			canvas : document.getElementById('webGLCanvas'),
			mouseMoveHandler : this.utils.bind(this.updateCameraRotation, this)
		};

		this.configure();
		this.addListeners();
		this.createLights();

		if (this._engine) {
			setInterval(this.utils.bind(this.mainProc, this), 33);
		}
	},

	/** @public */
	configure : function () {
		this._camera.position.set(0, -408, 0);
		this._camera.rotation.set(1.6, Math.PI / 2, 0);

		this._meshes.sky.getTransformations().position.set(-this._camera.position.x,
			-this._camera.position.y, -this._camera.position.z);
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
		this._engine.createLight(0, [1, 0, 0], [-600, 0, 000], 10000);
		this._engine.createLight(0, [0, 1, 0], [600, 0, 0], 10000.0);
		this._engine.createLight(0, [1, 1, 1], [0, 0, 0], 10000.0);
	},

	/** Create sphere (mesh) from code
	 * @public */
	createSphere : function (radius, size) {

		var vertexes = [], normals = [], textures = [], faces = {}, materials = {},
			materialName = 'planetMaterial',
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
		materials[materialName].specular = 100;
		materials[materialName].loadTexture(this._engine.getGLInstance(), './resources/planet/earth.png', false);

		return this._engine.createMesh(vertexes, textures, normals, faces, materials);
	},

	/** Main loop function
	 * @private */
	mainProc : function () {
		var engine = this._engine

		this.updateCameraPosition();

		this._meshes.planet.getTransformations().rotation.set(Math.PI / 2, 0, Date.now() / 10000 % (Math.PI * 2));

		engine.beginDraw();
		engine.turnOffLight();
		engine.draw(this._meshes.sky);
		engine.turnOnLight();
		engine.draw(this._meshes.planet);
//		engine.draw(this._meshes.mesh);
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
		if(document.pointerLockElement !== this._system.canvas &&
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
		staticSpeed = 5;
		cosX = Math.cos(this._camera.rotation.x);

		speed = staticSpeed;

		if (this._timers.up) {
			Y += Math.sin(this._camera.rotation.x);
			X += cosX * -Math.sin(this._camera.rotation.y);
			Z += cosX * Math.cos(this._camera.rotation.y);
		}

		if (this._timers.down) {
			Y -= Math.sin(this._camera.rotation.x);
			X -= cosX * -Math.sin(this._camera.rotation.y);
			Z -= cosX * Math.cos(this._camera.rotation.y);
		}

		if (this._timers.left) {
			X += -Math.sin(this._camera.rotation.y - Math.PI / 2);
			Z += Math.cos(this._camera.rotation.y - Math.PI / 2);
		}

		if (this._timers.right) {
			X += Math.sin(this._camera.rotation.y - Math.PI / 2);
			Z += -Math.cos(this._camera.rotation.y - Math.PI / 2);
		}

		this._camera.position.add(X * speed, Y * speed, Z * speed);

				this._meshes.sky.getTransformations().position.set(-this._camera.position.x,
					-this._camera.position.y, -this._camera.position.z);
	},

	/** Global key down handler
	 * @public */
	keyDown : function (e) {
		switch (e.keyCode) {
			case 65:
				this._timers.left = true;
				break;

			case 87:
				this._timers.up = true;
				break;

			case 68:
				this._timers.right = true;
				break;

			case 83:
				this._timers.down = true;
				break;
		}
	},

	/** Global key up handler
	 * @public */
	keyUp : function (e) {
		switch (e.keyCode) {
			case 65:
				this._timers.left = false;
				break;

			case 87:
				this._timers.up = false;
				break;

			case 68:
				this._timers.right = false;
				break;

			case 83:
				this._timers.down = false;
				break;
		}
	}
};

