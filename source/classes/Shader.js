/**
 * Created by mykolan on 2/19/2015.
 */

var Shader = function (gl) {

	if (!gl) {
		return null;
	}

	this._gl = gl;
	this._vertexShader = null;
	this._fragmentShader = null;

	this._vertexShaderURL = null;
	this._fragmentShaderURL = null;
	this._callback = null;
	this._thisArg = null;

	this._shaderCouter = 0;
	this._isLoading = false;
};


Shader.prototype = {

	/** Load and compile a shader
	 * @public
	 * @param {function} callback
	 * @param {object} thisArg
	 * @param {string} fragmentShader
	 * @param {string} vertexShader */
	add : function (callback, thisArg, fragmentShader, vertexShader) {

		this._callback = typeof callback === 'function' ? callback : function () {};
		this._thisArg = typeof thisArg === 'object' ? thisArg : {};

		if (this._isLoading) {
			console.log('> Another shader is loading for now.');
			this._callback.apply(this._thisArg);
		}

		if (typeof fragmentShader !== 'string' || typeof vertexShader !== 'string') {
			return;
		}
		else {
			this._vertexShaderURL = vertexShader;
			this._fragmentShaderURL = fragmentShader;
		}

		this._shaderCouter = 0;
		this._vertexShader = null;
		this._fragmentShader = null;
		this._isLoading = true;

		this.request(fragmentShader, this.loaded, this);
		this.request(vertexShader, this.loaded, this);

	},

	/** Shader loaded
	 * @private
	 * @param {boolean} result
	 * @param {string} url
	 * @param {string} text */
	loaded : function (result, url, text) {
		var shader;

		if (!result) {
			console.log('Error loading shader: "' + url + '"')
		}
		else {
			console.log('    shader loaded from: ' + url);
			switch (url) {
				case this._fragmentShaderURL:
					this._fragmentShader = shader = this._gl.createShader(this._gl.FRAGMENT_SHADER);
					break;

				case this._vertexShaderURL:
					this._vertexShader = shader = this._gl.createShader(this._gl.VERTEX_SHADER);
					break;

				default:
					return null;
			}

			this._gl.shaderSource(shader, text);
			this._gl.compileShader(shader);

			if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
				console.log(this._gl.getShaderInfoLog(shader));
				return null;
			}
		}

		if (++this._shaderCouter >= 2) {
			this._isLoading = false;
			console.log('> Shaders loaded successfully.');
			this._callback.apply(this._thisArg);
		}
	},

	/** @public */
	getVertexShader : function () {
		return this._vertexShader;
	},

	/** @public */
	getFragmentShader : function () {
		return this._fragmentShader;
	},

	/** Request shader
	 * @private
	 * @param {string} url
	 * @param {function} callback
	 * @param {object} thisArg */
	request : function (url, callback, thisArg) {

		var _request = new XMLHttpRequest();
		_request.open('get', url, true);

		callback = typeof callback === 'function' ? callback : function () {};
		thisArg = typeof thisArg === 'object' ? thisArg : {};

		// Hook the event that gets called as the request progresses
		_request.onreadystatechange = function () {
			// If the request is "DONE" (completed or failed)
			if (_request.readyState == 4) {
				// If we got HTTP status 200 (OK)\
				callback.call(thisArg, _request.status == 200, url, _request.responseText);
			}
		};

		_request.send(null);
	}

};

module.exports = Shader;