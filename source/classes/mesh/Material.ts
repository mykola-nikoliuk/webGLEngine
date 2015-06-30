module webGLEngine {

	export module Types {

		export class Material {

			public diffuseColor : Vector3;
			public specular : number;
			public imageLink : string;
			public ready : boolean;
			public texture : WebGLTexture = null;
			public image : WebGLTexture = null;
			public textureRepeat : boolean;

			private static _pool = new Pool<Material>();

			private _loadingImage;
			private _callback : Utils.Callback;

			constructor() {
				this.diffuseColor = new Vector3(0, 0, 0);
				this.specular = 0;
				this.imageLink = '';
				this.ready = true;
				this.texture = null;
				this.textureRepeat = true;
				this._loadingImage = null;
				this._callback = null;
				Material._pool.add(this);
			}

			public static get pool() : Pool<Material> {
				return this._pool;
			}

			public callback(callback : Utils.Callback) : void {
				this._callback = callback;
				if (this.ready) {
					callback.apply();
				}
			}

			public loadTexture(gl, path, textureRepeat) {
				if (typeof gl !== 'object') {
					Console.error('GL parameter is not a object');
					return;
				}
				if (typeof path !== 'string') {
					Console.error('Texture path parameter is not a string');
					return;
				}
				this.textureRepeat = typeof textureRepeat === 'boolean' ? textureRepeat : true;
				if (!this.image) {
					this.ready = false;
					this.texture = gl.createTexture();
				}

				this.imageLink = path;
				this._loadingImage = new Image();
				this._loadingImage.onload = Utils.bind(this._createTexture, this, gl);
				this._loadingImage.src = path;
			}

			private _createTexture() {
				var gl = arguments[arguments.length - 1],
					repeatType = this.textureRepeat ? 'REPEAT' : 'CLAMP_TO_EDGE';

				this.image = this._loadingImage;

				gl.bindTexture(gl.TEXTURE_2D, this.texture);
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[repeatType]);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[repeatType]);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
				gl.bindTexture(gl.TEXTURE_2D, null);

				this.ready = true;
				if (this._callback) {
					this._callback.apply();
				}
			}
		}
	}
}
