import Object3D from "Object3D"

module WebGLEngine.Types {

    export class Object3DGroup {
        private _objects: Object3D[];
        private _objectLinksByName: { string: Object3D };

        constructor() {
            this._objects = [];
            this._objectLinksByName = {};
        }

        public size(): number {
            return this._objects.length;
        }

        public addObject(object: Object3D): void {
            var name: string;

            if (object instanceof Object3D) {
                this._objects.push(object);
                name = object.getName();
                if (name) {
                    if (this._objectLinksByName.hasOwnProperty(name)) {
                        Console.warning('Object3DGroup:addObject : Group already exist link to object with the same name\nLink skipped');
                    }
                    else {
                        this._objectLinksByName[name] = object;
                    }
                }
            }
        }

        public removeObject(object: Object3D): boolean {
            var index: number,
                name: string;

            if (object instanceof Object3D) {
                if ((index = this._objects.indexOf(object)) >= 0) {
                    this._objects.splice(index, 1);
                    name = object.getName();
                    if (name) {
                        if (this._objectLinksByName.hasOwnProperty(name)) {
                            delete this._objectLinksByName[name];
                        }
                    }
                    return true;
                }
                else {
                    Console.warning('Object3DGroup:removeObject() : Objects "' + object.getName() + '" doesn\'t exist.');
                }
            }
            else {
                Console.warning('Object3DGroup:removeObject() :Parameter type should be instance of Object3D()');
            }
            return false;
        }

        public getObject(objectIndex: string | number): Object3D {
            switch (typeof objectIndex) {
                case 'number':
                    if (objectIndex >= 0 && objectIndex < this._objects.length) {
                        return this._objects[objectIndex];
                    }
                    else {
                        Console.error('Object3DGroup:getObject() : index is out of range');
                    }
                    break;

                case 'string':
                    if (this._objectLinksByName.hasOwnProperty(<string>objectIndex)) {
                        return this._objectLinksByName[objectIndex];
                    }
                    break;

                default :
                    Console.error('Object3DGroup:getObject() : Unknown parameter type');
                    break;
            }
            return null;
        }
    }
}