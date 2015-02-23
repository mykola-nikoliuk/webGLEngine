/** @class ns.classes.Game
 * @extends {Class} */
ns.classes.Game = Class.extend(/** @lends {ns.classes.Game#} */ {

	/** @constructs */
	init : function () {

		this.config = ns.config.game;

		this._enums = {
			moves : {
				NONE  : -1,
				UP    : 0,
				DOWN  : 1,
				LEFT  : 2,
				RIGHT : 3
			}
		}

		this._gameData = {
			trackIndex     : this.config.tracks.amount / 2 | 0,
			movements      : {
				horizontalDirection : this._enums.moves.NONE,
				verticalDirection   : this._enums.moves.NONE,
				verticalSpeed       : 0,
				jumpTime            : 0
			},
			playerPosition : {
				x : 0,
				y : this.config.playerPosition.y + this.config.runner.radius,
				z : this.config.playerPosition.z
			}
		};

		this._gameData.playerPosition.x = this.getPositionFromTrackIndex();
	},

	/** @public */
	convertPositions : function (position, transformations) {
		var radius = ns.config.game.planet.radius + position[1],
				halfSphereLenght = radius * Math.PI,
				alphaZ = position[0] * Math.PI / halfSphereLenght,
				alphaX = position[2] * Math.PI / halfSphereLenght,
				x = Math.sin(alphaZ) * radius,
				y = Math.cos(alphaX) * Math.cos(alphaZ) * radius,
				z = Math.sin(alphaX) * Math.cos(alphaZ) * radius;
		transformations.position.set(x, y, -z);
//		transformations.rotation.set(alphaX, 0, -alphaZ);
//		transformations.rotation.add(alphaX, 0, -alphaZ);
	},

	/** @public */
	engine : function () {
		this.moveHandler();
//		this.o
	},

	/** @private */
	moveHandler : function () {
		switch (this._gameData.movements.horizontalDirection) {

			case this._enums.moves.LEFT:
				this._gameData.playerPosition.x -= this.config.move.horizontalSpeed / ns.config.engine.FPS;
				if (this._gameData.playerPosition.x < this.getPositionFromTrackIndex()) {
					this._gameData.playerPosition.x = this.getPositionFromTrackIndex();
					this._gameData.movements.horizontalDirection = this._enums.moves.NONE;
				}
				break;

			case this._enums.moves.RIGHT:
				this._gameData.playerPosition.x += this.config.move.horizontalSpeed / ns.config.engine.FPS;
				if (this._gameData.playerPosition.x > this.getPositionFromTrackIndex()) {
					this._gameData.playerPosition.x = this.getPositionFromTrackIndex();
					this._gameData.movements.horizontalDirection = this._enums.moves.NONE;
				}
				break;
		}

		switch (this._gameData.movements.verticalDirection) {

			case this._enums.moves.UP:
				var time = this._gameData.movements.jumpTime + 1 / ns.config.engine.FPS,
					gSpeed = 9.81 * Math.pow(time, 2),
					speed = this._gameData.movements.verticalSpeed * time - gSpeed;

				this._gameData.movements.jumpTime = time;

//				console.log(this._gameData.playerPosition.y - speed);

				this._gameData.playerPosition.y = speed + this.config.runner.radius;
				if (this._gameData.playerPosition.y < this.config.playerPosition.y + this.config.runner.radius) {
					this._gameData.playerPosition.y = this.config.playerPosition.y + this.config.runner.radius;
					this._gameData.movements.verticalDirection = this._enums.moves.NONE;
				}
				break;
		}
	},

	/** @public */
	goLeft : function () {
		this._gameData.movements.horizontalDirection = this._enums.moves.LEFT;
		this._gameData.trackIndex = --this._gameData.trackIndex < 0 ? 0 : this._gameData.trackIndex;
	},

	/** @public */
	goRight : function () {
		this._gameData.movements.horizontalDirection = this._enums.moves.RIGHT;
		this._gameData.trackIndex = ++this._gameData.trackIndex >= this.config.tracks.amount ?
			this.config.tracks.amount - 1 : this._gameData.trackIndex;
	},

	/** @public */
	jump : function () {
		if (this._gameData.movements.verticalDirection === this._enums.moves.NONE) {
			this._gameData.movements.verticalDirection = this._enums.moves.UP;
			this._gameData.movements.jumpTime = 0;
			this._gameData.movements.verticalSpeed = this.config.move.verticalSpeed;
		}
	},

	/** @private */
	getPositionFromTrackIndex : function () {
		var position = this.config.tracks.width * this._gameData.trackIndex
			+ this.config.tracks.width / 2
			- this.config.tracks.width * this.config.tracks.amount / 2
			+ this.config.playerPosition.x;
		return position;
	},

	/** @public */
	getPlayerPosition : function () {
		return ns.utils.clone(this._gameData.playerPosition);
	},

	/** @public */
	getTrackIndex : function () {
		return this._gameData.trackIndex;
	},

})