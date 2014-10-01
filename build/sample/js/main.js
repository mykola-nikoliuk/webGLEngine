document.addEventListener('DOMContentLoaded', function () { ns.init.apply(ns); }, false);

var ns = {

	init : function () {
		this.utils = new InitUtilities();

		this._engine = new webGLEngine();
		this._camera = this._engine.getCamera();
		this._timer = new this.utils.Timer();
		this._timers = {
			left  : false,
			right : false,
			up    : false,
			down  : false
		};
		this._meshes = {
			sky    : this._engine.createMeshFromFile('./resources/world/sky.obj', { textureRepeat : false }),
			hummer : this._engine.createMeshFromFile('./resources/Humvee/humvee.obj')
		};

		this.configure();
		this.addListeners();
	},

	/** @public */
	configure : function () {
		this._meshes.hummer.getTransformations().rotation.x = -Math.PI / 2;

		this._camera.position.set(0, -140, -500);

		this._meshes.sky.getTransformations().position.set(-this._camera.position.x,
			-this._camera.position.y, -this._camera.position.z);
	},

	/** @public */
	addListeners : function () {
		document.addEventListener('mousedown', this.utils.bind(this.lockCursor, this), false);
		document.addEventListener('mousemove', this.utils.bind(this.updateCameraRotation, this), false);
		document.addEventListener('keydown', this.utils.bind(this.keyDown, this), false);
		document.addEventListener('keyup', this.utils.bind(this.keyUp, this), false);
	},

	/** @public */
	lockCursor : function () {
		var canvas = document.getElementById('webGLCanvas');
		canvas.requestPointerLock = canvas.requestPointerLock ||
			canvas.mozRequestPointerLock ||
			canvas.webkitRequestPointerLock;
		canvas.requestPointerLock();
	},

	/** @public */
	updateCameraRotation : function (e) {
		var x = e.movementX || e.mozMovementX || e.webkitMovementX || 0,
			y = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
		this._camera.rotation.add(y / 400, x / 400, 0);
	},

	/** @public */
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

	/** @public */
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
		this._timer.start(this.updateCameraPosition, this, 30);
	},

	/** @public */
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
		if (!this._timers.left && !this._timers.right && !this._timers.up && !this._timers.down) {
			this._timer.stop();
		}
	}
}

