import Camera from "./Camera";
import Engine from "../WebGLEngine";
import Subscribe from "./Subscribe";
import Callback from "./utils/Callback";
import Animation from "./animation/Animation";

export default class Render extends Subscribe {

    private _engine: Engine;
    private _renderCallback: Function;
    private _lastDrawCallback: Callback;
    private _lastFPSSecond: number;
    private _lastRenderCall: number;
    private _FPSCounter: number;
    private _FPS: number;

    constructor(engine: Engine, lastDrawCallback = null) {
        super();
        this._engine = engine;
        this._renderCallback = this._render.bind(this);
        this._lastDrawCallback = lastDrawCallback;
        this._lastRenderCall = Date.now();
        this._lastFPSSecond = this._lastRenderCall / 1000 | 0;
        this._FPSCounter = 0;
        this._FPS = 0;
        this._render();
    }

    public getFPS(): number {
        return this._FPS;
    }

    // TODO : add custom render

    private _render() {
        window.requestAnimationFrame(<FrameRequestCallback>this._renderCallback);

        var i: number,
            canvas = this._engine.getCanvasInstance(),
            currentTime = Date.now(),
            deltaTime = currentTime - this._lastRenderCall,
            currentFPSSecond: number;

        this._lastRenderCall = Date.now();
        currentFPSSecond = this._lastRenderCall / 1000 | 0;

        if (this._lastFPSSecond !== currentFPSSecond) {
            this._FPS = this._FPSCounter;
            this._lastFPSSecond = currentFPSSecond;
            this._FPSCounter = 0;
        }
        else {
            this._FPSCounter++;
        }

        if (this._engine.isReady()) {
            if (canvas) {
                canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
            }

            // updates before render
            for (i = 0; i < Animation.pool.size(); i++) {
                Animation.pool.get(i).updateBeforeRender(deltaTime);
            }

            // updates cameras
            for (i = 0; i < Camera.pool.size(); i++) {
                Camera.pool.get(i).update(deltaTime);
            }

            // call subscribed functions for render
            for (i = 0; i < this._subscribers.length; i++) {
                this._subscribers[i].apply(deltaTime);
            }

            if (this._lastDrawCallback) {
                this._lastDrawCallback.apply(deltaTime);
            }

            // update after render
            for (i = 0; i < Animation.pool.size(); i++) {
                Animation.pool.get(i).updateAfterRender(deltaTime);
            }
        }
    }
}