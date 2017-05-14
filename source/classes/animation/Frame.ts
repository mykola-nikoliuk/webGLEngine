import Vector3 from "../common/Vector3";
import console from "../utils/Console";
const {error, log} = console;

export default class Frame {
    private _position: Vector3;
    private _rotation: Vector3;
    private _time: number;

    constructor() {
        this._position = null;
    }

    public setPosition(position: Vector3): Frame {
        if (position instanceof Vector3) {
            this._position = position;
        }
        else {
            error('>>> Frame:setPosition() : position is not instance of Vector3');
        }
        return this;
    }

    public getPosition(): Vector3 {
        return this._position;
    }

    public setRotation(rotation: Vector3): Frame {
        if (rotation instanceof Vector3) {
            this._rotation = rotation;
        }
        else {
            log('>>> Frame:setRotation() : rotation is not instance of Vector3');
        }
        return this;
    }

    public getRotation(): Vector3 {
        return this._rotation;
    }

    public setTime(time: number): Frame {
        if (typeof time === 'number') {
            this._time = time;
        }
        return this;
    }

    public getTime(): number {
        return this._time;
    }
}