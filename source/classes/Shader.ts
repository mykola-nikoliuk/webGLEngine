module WebGLEngine.Types {

	export class Shader {

		private _gl : any;
		private _vertexShader : string;
		private _fragmentShader : string;
		private _vertexShaderURL : string;
		private _fragmentShaderURL : string;
		private _callback : Utils.Callback;
		private _shaderCouter : number;
		private _isLoading : boolean;

		constructor(gl) {

			if (!gl) {
				return null;
			}

			this._gl = gl;
			this._vertexShader = null;
			this._fragmentShader = null;

			this._vertexShaderURL = null;
			this._fragmentShaderURL = null;
			this._callback = null;

			this._shaderCouter = 0;
			this._isLoading = false;
		}

		public add(callback : Utils.Callback, fragmentShader : string, vertexShader : string) : void {

			this._callback = callback;

			if (this._isLoading) {
				Console.error('Another shader is loading for now.');
				this._callback.apply();
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

			Utils.requestManager.request(fragmentShader, new Utils.Callback(this._loaded, this));
			Utils.requestManager.request(vertexShader, new Utils.Callback(this._loaded, this));
		}

		private _loaded(text : string, url : string) : void {
			var shader;

			if (!text) {
				Console.error('Error loading shader: "' + url + '"')
			}
			else {
				Console.log('\tshader loaded => ' + url);
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
					Console.error(this._gl.getShaderInfoLog(shader));
					return null;
				}
			}

			if (++this._shaderCouter >= 2) {
				this._isLoading = false;
				Console.log('Shaders loaded successfully.');
				this._callback.apply();
			}
		}

		public getVertexShader() {
			return this._vertexShader;
		}

		public getFragmentShader() {
			return this._fragmentShader;
		}

		/** Request shader
		 * @private
		 * @param {string} url
		 * @param {function} callback
		 * @param {object} thisArg */
		public request(url, callback, thisArg) {

			var _request = new XMLHttpRequest();
			_request.open('get', url, true);

			callback = typeof callback === 'function' ? callback : function () {
			};
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
	}
}