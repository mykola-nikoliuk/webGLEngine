import Vector3 from "../common/Vector3";

export default class Text {
    private _canvas: CanvasRenderingContext2D | any;
    private _text: string;
    private _size: number;
    private _color: Vector3;
    private _opacity: number;

    constructor(canvas: CanvasRenderingContext2D | any) {
        this._canvas = canvas;
        this._text = '';
        this._size = 12;
        this._color = new Vector3(0, 0, 0);
        this._opacity = 1;
    }

    public draw(): void {
        let font = this._canvas.font,
            style = this._canvas.fillStyle;

        // TODO : optimize
        this._canvas.font = this._size + 'px Verdana';
        this._canvas.fillStyle = 'rgba(' +
            (this._color.r * 255 | 0) + ', ' +
            (this._color.g * 255 | 0) + ',' +
            (this._color.b * 255 | 0) + ', ' +
            (this._opacity * 255 | 0) + ')';
        this._canvas.fillText(this._text, 600, 100);

        // revert
        this._canvas.font = font;
        this._canvas.fillStyle = style;
    }

    get text(): string {
        return this._text;
    }

    set text(text: string) {
        if (typeof text === 'string') {
            this._text = text;
        }
    }

    get size(): number {
        return this._size;
    }

    set size(size: number) {
        if (typeof size === 'number') {
            this._size = size;
        }
    }

    get color(): Vector3 {
        return this._color;
    }

    set color(color: Vector3) {
        if (color instanceof Vector3) {
            this._color = color;
        }
    }

    get opacity(): number {
        return this._opacity;
    }

    set opacity(value: number) {
        if (typeof value === 'number' && value >= 0 && value <= 1) {
            this._opacity = value;
        }
    }
}