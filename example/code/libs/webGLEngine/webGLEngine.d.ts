declare module webGLEngine {
    module Utils {
        class Callback {
            private _func;
            private _thisArg;
            private _args;
            constructor(func?: Function, thisArg?: Object, ...args: any[]);
            apply(...args: any[]): any;
        }
    }
}
declare var glMatrixArrayType: any;
declare var WebGLFloatArray: any;
declare module webGLEngine {
    module Utils {
        module GLMatrix {
            class vec3 {
                static create(a: any): any;
                static set(a: any, b: any): any;
                static add(a: any, b: any, c: any): any;
                static subtract(a: any, b: any, c: any): any;
                static negate(a: any, b: any): any;
                static scale(a: any, b: any, c: any): any;
                static normalize(a: any, b: any): any;
                static cross(a: any, b: any, c: any): any;
                static length(a: any): number;
                static dot(a: any, b: any): number;
                static direction(a: any, b: any, c: any): any;
                static lerp(a: any, b: any, c: any, d: any): any;
                static str(a: any): string;
            }
            class mat3 {
                static create(a?: any): any;
                static set(a: any, b: any): any;
                static identity(a: any): any;
                static transpose(a: any, b?: any): any;
                static toMat4(a: any, b: any): any;
                static str(a: any): string;
            }
            class mat4 {
                static create(a?: any): any;
                static set(a: any, b: any): any;
                static identity(a: any): any;
                static transpose(a: any, b: any): any;
                static determinant(a: any): number;
                static inverse(a: any, b: any): any;
                static toRotationMat(a: any, b: any): any;
                static toMat3(a: any, b: any): any;
                static toInverseMat3(a: any, b: any): any;
                static multiply(a: any, b: any, c: any): any;
                static multiplyVec3(a: any, b: any, c: any): any;
                static multiplyVec4(a: any, b: any, c: any): any;
                static translate(a: any, b: any, c?: any): any;
                static scale(a: any, b: any, c?: any): any;
                static rotate(a: any, b: any, c: any, d: any): any;
                static rotateX(a: any, b: any, c?: any): any;
                static rotateY(a: any, b: any, c?: any): any;
                static rotateZ(a: any, b: any, c?: any): any;
                static frustum(a: any, b: any, c: any, d: any, e: any, g: any, f: any): any;
                static perspective(a: any, b: any, c: any, d: any, e: any): any;
                static ortho(a: any, b: any, c: any, d: any, e: any, g: any, f: any): any;
                static lookAt(a: any, b: any, c: any, d: any): any;
                static str(a: any): string;
            }
        }
    }
}
declare module webGLEngine {
    module Utils {
        class Timer {
            private _timerInterval;
            private _timerTimeout;
            private _timerEnabled;
            private _callback;
            private _timeout;
            private _pauseTimeout;
            private _startTime;
            private _isItTimeout;
            private _isTimeoutMode;
            constructor();
            start(callback: Callback, timeout: number, callOnce?: boolean): void;
            pause(): void;
            resume(): void;
            stop(): void;
            isTimerEnabled(): boolean;
            private resumeInterval();
            private _createTimer();
            private _nativeFunction();
        }
    }
}
declare module webGLEngine {
    module Utils {
        class Console {
            private _consoleView;
            private _isCreated;
            private _freeLinesLeft;
            private _maxHeight;
            private static _colors;
            private static _config;
            constructor();
            /** creates console and show on screen */
            create(x: number, y: number, maxWidth: number, maxHeight: number, maxLines: number): void;
            log(msg: string): void;
            warning(msg: string): void;
            error(msg: string): void;
            /** creates console view */
            private _createView(x, y, maxWidth, maxHeight);
            /** adds line to log */
            private _addLine(msg, color);
        }
    }
}
declare module webGLEngine {
    module Utils {
        function bind(callBackFunc: Function, thisArg: any, ...arg: any[]): () => any;
        function requestFile(url: string, callback: Callback): void;
        function requestResult(event: Event, request: XMLHttpRequest, url: string, callback: Callback): void;
        function getFileNameFromPath(path: string): string;
    }
}
declare module webGLEngine {
    module Types {
        class Pool<T> {
            private _pool;
            constructor();
            /** Returns pool size */
            size(): number;
            /** Returns pool element */
            get(index: number): T;
            /** Add element to pool
             * Returns true if element was added, otherwise false */
            add(element: T): boolean;
            /** Removes element from general pool
             * Returns true if element was removed, otherwise false */
            remove(element: T): boolean;
        }
    }
}
declare module webGLEngine {
    module Types {
        class Transformations {
            position: Vector3;
            rotation: Vector3;
            scale: Vector3;
            constructor();
            copyFrom(transformation: Transformations): void;
            cloneTransformations(): Transformations;
        }
    }
}
declare module webGLEngine {
    module Types {
        class LinkedTransformations extends Transformations {
            private _parent;
            private _children;
            constructor();
            /** Sets parent and adds current child to parent */
            setParent(parent: LinkedTransformations): boolean;
            /** Clear parent and current child from it */
            clearParent(): void;
            /** Returns parent */
            getParent(): LinkedTransformations;
            /** Adds dependent child
             * Returns true if child was added, otherwise false */
            addChild(child: LinkedTransformations): boolean;
            /** Removes dependent child
             * Returns true if child was removed, otherwise false */
            removeChild(child: LinkedTransformations): boolean;
            /** Check is child presented
             * Returns true if child presented, otherwise false */
            hasChild(child: LinkedTransformations): boolean;
        }
    }
}
declare module webGLEngine {
    module Types {
        class Face {
            vertexIndex: number;
            normalIndex: number;
            textureIndex: number;
            constructor(vertexIndex: number, textureIndex: number, normalIndex: number);
        }
    }
}
declare module webGLEngine {
    module Types {
        class Mesh extends LinkedTransformations {
            static defaultMaterialName: string;
            private _webGL;
            private _vertexes;
            private _vertextTextures;
            private _vertexNormals;
            private _faces;
            private _materials;
            private _materialsLoaded;
            private _isReady;
            private _vertexIndexBuffers;
            private _vertexPositionBuffer;
            private _vertexNormalBuffer;
            private _vertexColorBuffer;
            private _vertexTextureBuffer;
            private _materialCallback;
            private _transformationChildren;
            private _createCallback;
            constructor(webGL: any);
            fillBuffers(vertexes: number[], vertexTexture: number[], vertexNormals: number[], faces: Face[][], materials: {
                [materialName: string]: Material;
            }): void;
            initBuffers(materials?: {
                [materialName: string]: Material;
            }): void;
            isReady(): boolean;
            clone(): void;
            /** Sets create callback, that will called when mesh will be ready */
            callback(callback: Utils.Callback): Mesh;
            /** Create the same mesh with unique transformation
             * Other parameters just will be copied */
            transformationClone(): Mesh;
            getVertexIndexBuffers(): void;
            getVertexPositionBuffer(): void;
            getVertexColorBuffer(): void;
            getVertexNormalBuffer(): void;
            getVertexTextureBuffer(): void;
            private _materialIsReady();
        }
    }
}
declare module webGLEngine {
    module Types {
        class Light {
            private _type;
            private _enabled;
            private _distance;
            private _color;
            private _position;
            constructor(type: number, color: number[], param: number[], distance: number);
            turnOn(): void;
            turnOff(): void;
            /** @public */
            isEnabled(): boolean;
            color: Vector3;
            position: Vector3;
            distance: number;
        }
    }
}
declare module webGLEngine {
    module Types {
        class Shader {
            private _gl;
            private _vertexShader;
            private _fragmentShader;
            private _vertexShaderURL;
            private _fragmentShaderURL;
            private _callback;
            private _shaderCouter;
            private _isLoading;
            constructor(gl: any);
            add(callback: Utils.Callback, fragmentShader: string, vertexShader: string): void;
            /** Shader loaded
             * @private
             * @param {boolean} result
             * @param {string} url
             * @param {string} text */
            loaded(result: boolean, url: string, text: string): void;
            /** @public */
            getVertexShader(): string;
            /** @public */
            getFragmentShader(): string;
            /** Request shader
             * @private
             * @param {string} url
             * @param {function} callback
             * @param {object} thisArg */
            request(url: any, callback: any, thisArg: any): void;
        }
    }
}
declare module webGLEngine {
    module Types {
        class Camera extends LinkedTransformations {
            private static _pool;
            private _followTarget;
            private _distance;
            constructor();
            static pool: Pool<Camera>;
            /** Sets follow state for camera */
            follow(transformations: Transformations, distance?: number): void;
            /** Removes follow state */
            unfollow(): void;
            update(): void;
            /** Adds camera to cameras pool
             * Removes true if animation was added, otherwise false */
            turnOn(): boolean;
            /** Remove camera from cameras pool
             * Removes true if camera was removed, otherwise false  */
            turnOff(): boolean;
        }
    }
}
declare module webGLEngine {
    module Types {
        class Subscribe {
            protected _subscribers: Utils.Callback[];
            constructor();
            /** Add subscriber
             * @param callback
             * @return is callback Was added
             */
            subscribe(callback: Utils.Callback): boolean;
            /** Removes subscriber
             * @param callback
             * @return is callback Was deleted
             */
            unsubscribe(callback: Utils.Callback): boolean;
        }
    }
}
declare module webGLEngine {
    module Types {
        class Render extends Subscribe {
            private _engine;
            private _renderTimer;
            constructor(engine: Engine);
            /** set render frequency per second
             * @param framePerSecond frames per second
             * @returns is set successful
             */
            setFPS(framePerSecond: number): boolean;
            /** render the scene
             * if you want to use your own uneven render */
            render(): void;
            private _render();
        }
    }
}
declare module webGLEngine {
    module Types {
        class Controller extends Subscribe {
            static Events: {
                MESH_LOADED: string;
            };
            private _engine;
            private _lastLoadedMesh;
            constructor(engine: Engine);
            sendEvent(event: string): void;
            getLastLoadedMesh(): Mesh;
            private _handler(event, parameter);
        }
    }
}
declare module webGLEngine {
    module Types {
        class Vector3 {
            private _x;
            private _y;
            private _z;
            constructor(x?: any, y?: any, z?: any);
            set(x: any, y: any, z: any): Vector3;
            add(x: any, y: any, z: any): void;
            minus(vector: Vector3): Vector3;
            plus(vector: Vector3): Vector3;
            multiply(multiplier: number): Vector3;
            divide(divider: number): Vector3;
            clone(): Vector3;
            invertSign(): Vector3;
            copyFrom(vector: Vector3): void;
            getArray(): any[];
            getDistanceTo(point: Vector3): number;
            x: number;
            y: number;
            z: number;
            r: number;
            g: number;
            b: number;
        }
    }
}
declare module webGLEngine {
    module Types {
        class Material {
            diffuseColor: Vector3;
            specular: number;
            imageLink: string;
            ready: boolean;
            texture: WebGLTexture;
            image: WebGLTexture;
            textureRepeat: boolean;
            private static _pool;
            private _loadingImage;
            private _callback;
            constructor();
            static pool: Pool<Material>;
            callback(callback: Utils.Callback): void;
            loadTexture(gl: any, path: any, textureRepeat: any): void;
            private _createTexture();
        }
    }
}
declare module webGLEngine {
    module Types {
        class Frame {
            private _position;
            private _rotation;
            private _time;
            constructor();
            setPosition(position: Types.Vector3): Frame;
            getPosition(): Types.Vector3;
            setRotation(rotation: Types.Vector3): Frame;
            getRotation(): Types.Vector3;
            setTime(time: number): Frame;
            getTime(): number;
        }
    }
}
declare module webGLEngine {
    module Types {
        class AnimationTarget {
            private _reservedTransformation;
            private _mesh;
            private _startTime;
            private _pausedTime;
            private _frameIndex;
            private _isPaused;
            private _callback;
            constructor(mesh: Transformations);
            start(callback?: Utils.Callback): void;
            pause(): void;
            resume(): void;
            isPaused(): boolean;
            nextFrame(): number;
            shiftStartTime(time: number): void;
            callback(): void;
            saveTransformation(): void;
            revertTransformation(): void;
            getFrameIndex(): number;
            getTransformable(): Transformations;
            getStartTime(): number;
        }
    }
}
declare module webGLEngine {
    module Types {
        class Animation {
            static Types: {
                WITH_CHANGES: number;
                WITHOUT_CHANGES: number;
            };
            private static _pool;
            private _type;
            private _frames;
            private _initialFrame;
            private _targets;
            constructor(type: number, initialFrame: Frame, frames: Frame[]);
            static pool: Pool<Animation>;
            start(transformable: Transformations, callback?: Utils.Callback): void;
            /** Do updates before render */
            updateBeforeRender(): void;
            /** Do updated after render */
            updateAfterRender(): void;
            setTimeByDistance(time: number): void;
            pause(transformable: Transformations): void;
            resume(transformable: Transformations): void;
            /** Adds animation to general animations pool
             * Removes true if animation was added, otherwise false */
            turnOn(): boolean;
            /** Removes animation from general animations pool
             * Removes true if animation was removed, otherwise false */
            turnOff(): boolean;
            private _update();
            private _updateTarget(target, frameIndex, percents);
        }
    }
}
declare module webGLEngine {
    var Config: {
        version: string;
        html: {
            canvasID: string;
        };
        File: {
            obj: {
                lineSeparator: RegExp;
                nodeSeparator: RegExp;
                lineTypes: {
                    MATERIAL_LIBRARY: string;
                    USE_MATERIAL: string;
                    FACE: string;
                    VERTEX: string;
                    VERTEX_TEXTURE: string;
                    VERTEX_NORMAL: string;
                };
            };
            mtl: {
                lineSeparator: RegExp;
                nodeSeparator: RegExp;
                lineTypes: {
                    NEW_MATERIAL: string;
                    MAP_TEXTURE: string;
                    DIFFUSE_COLOR: string;
                    SPECULAR: string;
                };
            };
        };
    };
}
declare module webGLEngine {
    var Console: Utils.Console;
    class Engine {
        private _gl;
        private _isReady;
        private _shader;
        private _inited;
        private _canvasNode;
        private _mvMatrix;
        private _pMatrix;
        private _mvMatrixStack;
        private _camera;
        private _meshes;
        private _lights;
        private _render;
        private _controller;
        private _shaderProgram;
        private _isLightingEnable;
        constructor(fragmentShaderPath: string, vertexShaderPath: string);
        Render: Types.Render;
        Controller: Types.Controller;
        beginDraw(): void;
        isReady(): boolean;
        draw(mesh: Types.Mesh): void;
        createLight(type: number, color: number[], param: number[], distance: number): Types.Light;
        turnOnLight(): boolean;
        turnOffLight(): boolean;
        onResize(): void;
        getCamera(): Types.Transformations;
        createMesh(vertexes: any, textures: any, normals: any, faces: any, materials: any): Types.Mesh;
        getGLInstance(): any;
        private _applyTransformations(matrix, object);
        private _createCanvas();
        private _initGL();
        private _loadShaders(fragmentShaderPath, vertexShaderPath);
        private _initShaders();
        private _mvPushMatrix();
        private _mvPopMatrix();
        private _setMatrixUniforms();
        private _createMeshFromFile(path, params);
        private _parseObjFile(objFile, mesh, path, parameters);
        private _parseMaterial(mtlFile, path, mesh, parameters);
    }
}
