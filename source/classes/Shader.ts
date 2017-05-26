import Callback from "./utils/Callback";
import {requestManager} from "./utils/Utils";
import console from "./utils/Console";
import {WebGL3dRenderingContext} from "./Interfaces";
const {error, log} = console;

export default class Shader {

    private _gl: WebGL3dRenderingContext;
    private _vertexShader: WebGLShader;
    private _fragmentShader: WebGLShader;
    private _vertexShaderURL: string;
    private _fragmentShaderURL: string;
    private _callback: Callback;
    private _shaderCounter: number;
    private _isLoading: boolean;

    constructor(gl: WebGL3dRenderingContext) {

        if (!gl) {
            return null;
        }

        this._gl = gl;
        this._vertexShader = null;
        this._fragmentShader = null;

        this._vertexShaderURL = null;
        this._fragmentShaderURL = null;
        this._callback = null;

        this._shaderCounter = 0;
        this._isLoading = false;
    }

    public add(callback: Callback, fragmentShader: string, vertexShader: string): void {

        this._callback = callback;

        if (this._isLoading) {
            error('Another shader is loading for now.');
            this._callback.apply();
        }

        if (typeof fragmentShader !== 'string' || typeof vertexShader !== 'string') {
            return;
        }
        else {
            this._vertexShaderURL = vertexShader;
            this._fragmentShaderURL = fragmentShader;
        }

        this._shaderCounter = 0;
        this._vertexShader = null;
        this._fragmentShader = null;
        this._isLoading = true;

        requestManager.request(fragmentShader, new Callback(this._loaded, this));
        requestManager.request(vertexShader, new Callback(this._loaded, this));
    }

    private _loaded(text: string, url: string): void {
        let shader;

        if (!text) {
            error('Error loading shader: "' + url + '"')
        }
        else {
            log('\tshader loaded => ' + url);
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
                error(this._gl.getShaderInfoLog(shader));
                return null;
            }
        }

        if (++this._shaderCounter >= 2) {
            this._isLoading = false;
            log('Shaders loaded successfully.');
            this._callback.apply();
        }
    }

    public getVertexShader(): WebGLShader {
        return this._vertexShader;
    }

    public getFragmentShader(): WebGLShader {
        return this._fragmentShader;
    }

    public request(url: string, callback: Function, thisArg: any) {

        let _request = new XMLHttpRequest();
        _request.open('get', url, true);

        callback = typeof callback === 'function' ? callback : () => {
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