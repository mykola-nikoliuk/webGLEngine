var Vector3 = require('./Vector3');

/** @constructor */
var Transformations = function () {
	/** @type {Vector3} */
	this.position = new Vector3();
	/** @type {Vector3} */
	this.rotation = new Vector3(0, 0, 0);
	/** @type {Vector3} */
	this.scale = new Vector3(0, 0, 0);
};

module.exports = Transformations;