import Engine from "../WebGLEngine";

export default class Debugger {

    public static currentDebugger: Debugger = null;

    private _engine: Engine;
    private _FPSText: any;

    constructor(engine: Engine) {
        this._engine = engine;
        // this._FPSText = this._engine.createText();
        this._FPSText.size = 20;
        this._FPSText.color.r = 1;
        this._FPSText.opacity = 0.5;
        this.focus();
    }

    /** Make current debugger as main */
    public focus(): void {
        Debugger.currentDebugger = this;
    }

    public draw(): void {
        this._FPSText.text = this._engine.Render.getFPS() + '';
        this._FPSText.draw();
    }
}