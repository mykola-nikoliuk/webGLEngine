module WebGLEngine.Types {

    class CameraType {
        private _type : number;
        private _offset : Vector3;
        private _parent : LinkedTransformations;

        constructor() {
            this._type = Camera.FREE;
            this._offset = new Vector3();
            this._parent = null;
        }

        public set(type : number, offset : Vector3, parent : LinkedTransformations = null) : boolean {
            var verified = CameraType._isDataCorrect.apply(this, arguments);
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

        protected static _isDataCorrect(type : number, offset : Vector3, parent : LinkedTransformations = null) : boolean {
            return typeof type === 'number' && offset instanceof Vector3 && (parent instanceof LinkedTransformations || parent === null);
        }
    }

    class CameraPositionType extends CameraType {
        public distance;

        constructor() {
            super();
            this.distance = 0;
        }

        public set(type : number, offset : Vector3, parent : LinkedTransformations = null, distance : number = 0) : boolean {
            var verified = CameraType._isDataCorrect.apply(this, arguments) && typeof  distance === 'number';
            if (verified) {
                super.set(type, offset, parent);
                this.distance = distance;
            }
            return verified;
        }
    }

    export class Camera extends LinkedTransformations {

        public static FREE = 1;		// (default) position: use current, focus: use current
        public static FOLLOW = 2;	// position: keeps distance to its position parent, focus: always on its focus parent
        public static ATTACHED = 4;	// position: updates position accordingly its position parent

        private _positionType : CameraPositionType;
        private _focusType : CameraType;
        private static _current : Camera = null;
        private static _pool = new Pool<Camera>();

        // TODO : remove when camera types were implemented
        private _followTarget : Transformations;

        constructor() {
            super();
            if (Camera._current === null) {
                Camera._current = this;
            }
            this._positionType = new CameraPositionType();
            this._focusType = new CameraType();
            this._add();
        }

        public static get pool() : Pool<Camera> {
            return this._pool;
        }

        public setPositionRule(type : number, offset : Vector3, parent : LinkedTransformations = null, distance : number = 0) : Camera {
            var newType = new CameraPositionType(),
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
                    Console.error('Camera:setPositionRule() : unknown type: "' + type + '"');
                    break;
            }
            if (success) {
                this._positionType = newType;
            }
            else {
                Console.error('Camera:setPositionRule() : wrong parameters type');
            }
            return this;
        }

        public setFocusRule(type : number, offset : Vector3, parent : LinkedTransformations) : Camera {
            var newType = new CameraType(),
                success = true;
            switch (type) {
                case Camera.FREE:
                    success = newType.set(type, offset);
                    break;
                case Camera.FOLLOW:
                    success = parent !== null && newType.set(type, offset, parent);
                    break;
                default:
                    Console.error('Camera:setFocusRule() : unknown type: "' + type + '"');
                    break;
            }
            if (success) {
                this._focusType = newType;
            }
            else {
                Console.error('Camera:setFocusRule() : wrong parameters type');
            }
            return this;
        }

        /** Sets follow state for camera */
        public follow(transformations : Transformations, distance? : number) : void {
            if (transformations instanceof Transformations) {
                this._followTarget = transformations;
                this._distance = typeof distance === 'number' ? distance : -1;
            }
            else {
                Console.error('Camera:follow() : first parameter should be instance of Transformations');
            }
        }

        /** Removes follow state */
        public unfollow() : void {
            this._followTarget = null;
        }

        public update(deltaTime : number) {
            var hypotenuse2D : number,
                distance : number,
                ratio : number,
                yAngle : number,
                position : Vector3;

            if (this._followTarget) {
                if (this._distance === 0) {
                    this.position.copyFrom(this._followTarget.position);
                    this.rotation.y = this._followTarget.rotation.y;
                }
                else {
                    position = this._followTarget.position.clone().minus(this.position);
                    hypotenuse2D = Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.z, 2));
                    yAngle = Math.asin(position.x / hypotenuse2D);

                    if (position.z > 0) {
                        if (position.x < 0) {
                            yAngle = -Math.PI - yAngle;
                        }
                        else {
                            yAngle = Math.PI - yAngle;
                        }
                    }

                    this.rotation.y = -yAngle;
                    this.rotation.x = Math.atan(position.y / hypotenuse2D);

                    if (this._distance > 0) {
                        distance = this.position.getDistanceTo(this._followTarget.position);
                        ratio = this._distance / distance;
                        position.multiply(ratio);
                        this.position.copyFrom(this._followTarget.position.clone().minus(position));
                    }
                }
            }
        }

        private _setPositionParent(parent : LinkedTransformations) : void {
            if (parent instanceof LinkedTransformations) {
                this._positionParent = parent;
            }
            else {
                Console.error('Camera._setPositionParent() : parent should be instance of LinkedTransformations');
            }
        }

        /** Adds camera to cameras pool
         * Removes true if camera was added, otherwise false */
        private _add() : boolean {
            return Camera.pool.add(this);
        }

        /** Remove camera from cameras pool
         * Removes true if camera was removed, otherwise false  */
        private _remove() : boolean {
            return Camera.pool.remove(this);
        }
    }

}