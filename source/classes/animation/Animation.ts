import Pool from "../common/Pool";
import Transformations from "../common/Transformations";
import Callback from "../utils/Callback";
import Frame from "./Frame";
import AnimationTarget from "./AnimationTarget";
import Vector3 from "../common/Vector3";
import console from "../utils/Console";
const {error} = console;

export default class Animation {

    public static Types = {
        WITH_CHANGES: 0,
        WITHOUT_CHANGES: 1
    };

    private static _pool = new Pool<Animation>();
    private _type: number;
    private _frames: Frame[];
    private _initialFrame: Frame;
    private _targets: AnimationTarget[];

    // TODO : add separated animation support

    constructor(type: number, initialFrame: Frame, frames: Frame[]) {
        this._type = type;
        this._initialFrame = initialFrame;
        this._frames = [];
        this._targets = [];

        if (frames instanceof Array) {
            for (let i = 0; i < frames.length; i++) {
                if (frames[i] instanceof Frame) {
                    this._frames.push(frames[i]);
                }
            }
        }

        this.turnOn();
    }

    public static get pool(): Pool<Animation> {
        return this._pool;
    }

    public start(transformable: Transformations, callback?: Callback): void {
        let target = new AnimationTarget(transformable),
            i: number;

        target.start(callback);
        for (i = 0; i < this._targets.length; i++) {
            if (this._targets[i].getTransformable() === transformable) {
                this._targets.splice(i, 1);
                i--;
            }
        }
        this._targets.push(target);
    }

    /** Do updates before render */
    public updateBeforeRender(deltaTime: number) {
        this._update(deltaTime);
    }

    /** Do updates after render */
    public updateAfterRender(deltaTime: number) {
        let i: number;

        if (this._type === Animation.Types.WITHOUT_CHANGES) {
            for (i = 0; i < this._targets.length; i++) {
                this._targets[i].revertTransformation();
            }
        }
    }

    public setTimeByDistance(time: number) {
        let length: number,
            totalLength = 0,
            frame: Frame,
            nextFrame: Frame,
            sectorsLength = [],
            i: number;

        if (typeof time === 'number' && time > 0) {
            // get distance between frames
            for (i = 0; i < this._frames.length; i++) {
                frame = i === 0 ? this._initialFrame : this._frames[i - 1];
                nextFrame = this._frames[i];
                length = frame.getPosition().getDistanceTo(nextFrame.getPosition());
                totalLength += length;
                sectorsLength.push(length);
            }
            for (i = 0; i < this._frames.length; i++) {
                this._frames[i].setTime(time * (sectorsLength[i] / totalLength));
            }
        }
        else {
            error('>>> Animation:setTimeByDistance() : time should be a positive number');
        }
    }

    public pause(transformable: Transformations): void {
        for (let i = 0; i < this._targets.length; i++) {
            if (this._targets[i].getTransformable() === transformable) {
                this._targets[i].pause();
                break;
            }
        }
    }

    public resume(transformable: Transformations): void {
        for (let i = 0; i < this._targets.length; i++) {
            if (this._targets[i].getTransformable() === transformable) {
                this._targets[i].resume();
                break;
            }
        }
    }

    /** Adds animation to general animations pool
     * Removes true if animation was added, otherwise false */
    public turnOn(): boolean {
        for (let i = 0; i < this._targets.length; i++) {
            this._targets[i].resume();
        }

        return Animation._pool.add(this);
    }

    /** Removes animation from general animations pool
     * Removes true if animation was removed, otherwise false */
    public turnOff(): boolean {
        for (let i = 0; i < this._targets.length; i++) {
            this._targets[i].pause();
        }

        return Animation._pool.remove(this);
    }

    private _update(deltaTime: number): void {
        let elapsedTime: number,
            frameIndex: number,
            targetRemoved: boolean,
            target: AnimationTarget,
            i: number;

        for (i = 0; i < this._targets.length; i++) {
            target = this._targets[i];

            if (target.isPaused()) {
                continue;
            }

            if (this._type === Animation.Types.WITHOUT_CHANGES) {
                target.saveTransformation();
            }

            frameIndex = target.getFrameIndex();

            // search for current frame
            do {
                elapsedTime = Date.now() - target.getStartTime();
                if (elapsedTime >= this._frames[frameIndex].getTime()) {
                    target.shiftStartTime(this._frames[frameIndex].getTime());
                    frameIndex = target.nextFrame();
                    if (frameIndex >= this._frames.length) {
                        // last update
                        this._updateTarget(target, frameIndex - 1, 1);
                        this._targets.shift();
                        target.callback();
                        i--;
                        break;
                    }
                }
                else {
                    this._updateTarget(target, frameIndex, elapsedTime / this._frames[frameIndex].getTime());
                }
            }
            while (elapsedTime >= this._frames[frameIndex].getTime());
        }
    }

    private _updateTarget(target: AnimationTarget, frameIndex: number, percents: number): void {
        let frame: Frame,
            previousFrame: Frame = frameIndex > 0 ? this._frames[frameIndex - 1] : this._initialFrame,
            mesh: Transformations,
            vector: Vector3;

        frame = this._frames[frameIndex];
        mesh = target.getTransformable();
        if (frame.getPosition()) {
            vector = frame.getPosition().clone();
            vector.minus(previousFrame.getPosition());
            //- previousFrame.getPosition()
            vector.multiply(percents);
            vector.plus(previousFrame.getPosition());
            mesh.position.copyFrom(vector);
        }
        if (frame.getRotation()) {
            vector = frame.getRotation().clone();
            vector.minus(previousFrame.getRotation());
            //- previousFrame.getPosition()
            vector.multiply(percents);
            vector.plus(previousFrame.getRotation());
            mesh.rotation.copyFrom(vector);
        }
    }
}