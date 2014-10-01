/** @constructor */
var Material = function () {
	this.diffuseColor = [0, 0, 0];
	this.imageLink = '';
	this.ready = true;
	this.texture = null;
	this.textureRepeat = true;
};

module.exports = Material;