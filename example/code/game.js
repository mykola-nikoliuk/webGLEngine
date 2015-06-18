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
	},

	/** @private */
	moveHandler : function () {

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

	accelerate : function () {
		this.throttle += 1;
	},

	disaccelerate : function () {
		this.throttle -= 1;
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
	getTrackIndex : function () {
		return this._gameData.trackIndex;
	},

})