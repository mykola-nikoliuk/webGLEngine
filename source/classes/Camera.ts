import Pool from "./common/Pool";
import Vector3 from "./common/Vector3";
import Transformations from "./common/Transformations";
import LinkedTransformations from "./common/LinkedTransformations";
import console from "./utils/Console";
const {error} = console;

class CameraType {
    private _type: number;
    private _offset: Vector3;
    private _parent: LinkedTransformations;

    constructor() {
        this._type = Camera.FREE;
        this._offset = new Vector3();
        this._parent = null;
    }

    public set(type: number, offset: Vector3, parent: LinkedTransformations = null): boolean {
        let verified = CameraType._isDataCorrect.apply(this, arguments);
        if (verified) {
            this._type = type;
            this._offset = offset;
            this._parent = parent;
        }
        return verified;
    }

    public get type() {
        return this._type
    };

    public get offset() {
        return this._offset
    };

    public get parent() {
        return this._parent
    };

    protected static _isDataCorrect(type: number, offset: Vector3, parent: LinkedTransformations = null): boolean {
        return typeof type === 'number' && offset instanceof Vector3 && (parent instanceof LinkedTransformations || parent === null);
    }
}

class CameraPositionType extends CameraType {
    public distance: number;

    constructor() {
        super();
        this.distance = 0;
    }

    public set(type: number, offset: Vector3, parent: LinkedTransformations = null, distance: number = 0): boolean {
        let verified = CameraType._isDataCorrect.apply(this, arguments) && typeof  distance === 'number';
        if (verified) {
            super.set(type, offset, parent);
            this.distance = distance;
        }
        return verified;
    }
}

export default class Camera extends LinkedTransformations {

    public static FREE = 1;		// (default) position: use current, focus: use current
    public static FOLLOW = 2;	// position: keeps distance to its position parent, focus: always on its focus parent
    public static ATTACHED = 4;	// position: updates position accordingly its position parent

    private static _current: Camera = null;
    private static _pool = new Pool<Camera>();
    private _positionType: CameraPositionType;
    private _focusType: CameraType;

    // TODO : remove when camera types were implemented
    private _followTarget: Transformations;

    constructor() {
        super();
        if (Camera._current === null) {
            Camera._current = this;
        }
        this._positionType = new CameraPositionType();
        this._focusType = new CameraType();
        this._add();
    }

    public static get pool(): Pool<Camera> {
        return this._pool;
    }

    public static get current(): Camera {
        return Camera._current;
    }

    public setActive(): Camera {
        return Camera._current = this;
    }

    public setPositionRule(type: number, offset: Vector3, parent: LinkedTransformations = null, distance: number = 0): Camera {
        let newType = new CameraPositionType(),
            success = true;
        switch (type) {
            case Camera.FREE:
                success = newType.set(type, offset);
                break;
            case Camera.FOLLOW:
                success = parent !== null && newType.set(type, offset, parent, distance);
                break;
            case Camera.ATTACHED:
                success = parent !== null && newType.set(type, offset, parent);
                break;
            default:
                error('Camera:setPositionRule() : unknown type: "' + type + '"');
                break;
        }
        if (success) {
            this._positionType = newType;
        }
        else {
            error('Camera:setPositionRule() : wrong parameters type');
        }
        return this;
    }

    public setFocusRule(type: number, offset: Vector3, parent ?: LinkedTransformations): Camera {
        let newType = new CameraType(),
            success = true;
        switch (type) {
            case Camera.FREE:
                success = newType.set(type, offset);
                break;
            case Camera.FOLLOW:
                success = parent !== null && newType.set(type, offset, parent);
                break;
            default:
                error('Camera:setFocusRule() : unknown type: "' + type + '"');
                break;
        }
        if (success) {
            this._focusType = newType;
        }
        else {
            error('Camera:setFocusRule() : wrong parameters type');
        }
        return this;
    }

    public update(deltaTime: number) {
        let hypotenuse2D: number,
            distance: number,
            ratio: number,
            yAngle: number,
            position: Vector3;

        let positionType = this._positionType,
            focusType = this._focusType,
            parentPosition = positionType.parent,
            parentFocus = focusType.parent;

        switch (positionType.type) {
            case Camera.FOLLOW:
                position = parentPosition.position.clone().minus(this.position);
                distance = this.position.getDistanceTo(parentPosition.position);
                ratio = this._positionType.distance / distance;
                position.multiply(ratio);
                this.position.copyFrom(parentPosition.position).plus(positionType.offset).minus(position);
                break;
            case Camera.ATTACHED:
                this.position.copyFrom(parentPosition.position).plus(positionType.offset);
                break;
        }

        switch (focusType.type) {
            case Camera.FOLLOW:
                position = parentFocus.position.clone().plus(focusType.offset).minus(this.position);
                hypotenuse2D = Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.z, 2));
                if (hypotenuse2D === 0) {
                    this.rotation.x = Math.PI / 2;
                    if (position.y < 0) {
                        this.rotation.x *= -1;
                    }
                }
                else {
                    yAngle = Math.asin(position.x / hypotenuse2D);
                    if (position.z > 0) {
                        if (position.x < 0) {
                            yAngle = -Math.PI - yAngle;
                        }
                        else {
                            yAngle = Math.PI - yAngle;
                        }
                    }
                    this.rotation.set(Math.atan(position.y / hypotenuse2D), -yAngle);
                }
                break;
        }
    }

    /** Adds camera to cameras pool
     * Removes true if camera was added, otherwise false */
    private _add(): boolean {
        return Camera.pool.add(this);
    }

    /** Remove camera from cameras pool
     * Removes true if camera was removed, otherwise false  */
    private _remove(): boolean {
        return Camera.pool.remove(this);
    }
}