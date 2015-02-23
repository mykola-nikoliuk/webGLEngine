var utils = require('../libs/utils');

/** @constructor */
var Material = function () {
	this.diffuseColor = [Math.random(), Math.random(), Math.random()];
	this.specular = 0;
	this.imageLink = '';
	this.ready = true;
	this.texture = null;
	this.textureRepeat = true;
};

Material.prototype = {
	/** @public */
	loadTexture : function (gl, path, textureRepeat) {
		if (typeof gl !== 'object') {
			console.log('GL parameter is not a object');
			return;
		}
		if (typeof path !== 'string') {
			console.log('Texture path parameter is not a string');
			return;
		}
		this.textureRepeat = typeof textureRepeat === 'boolean' ? textureRepeat : true;
		this.ready = false;
		this.imageLink = path;
		this.texture = gl.createTexture();

		this.texture.image = new Image();
		this.texture.image.onload = utils.bind(this.createTexture, this, gl);
		this.texture.image.src = this.imageLink;
	},

	/** @private */
	createTexture : function () {
		var gl = arguments[arguments.length - 1];
		var repeatType = this.textureRepeat ? 'REPEAT' : 'CLAMP_TO_EDGE';
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture.image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[repeatType]);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[repeatType]);
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.ready = true;
	}
};

module.exports = Material;