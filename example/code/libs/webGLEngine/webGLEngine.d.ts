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
        function bind(callBackFunc: Function, thisArg: any, ...arg: any[]): () => any;
        function requestFile(url: string, callback: Callback): void;
        function requestResult(event: Event, request: XMLHttpRequest, url: string, callback: Callback): void;
        function getFileNameFromPath(path: string): string;
    }
}
declare module webGLEngine {
    module Types {
        class Vector3 {
            private _x;
            private _y;
            private _z;
            constructor(x?: any, y?: any, z?: any);
            set(x: any, y: any, z: any): void;
            add(x: any, y: any, z: any): void;
            minus(vector: Vector3): void;
            plus(vector: Vector3): void;
            multiply(multiplier: number): void;
            clone(): Vector3;
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
        class Transformations {
            position: Vector3;
            rotation: Vector3;
            scale: Vector3;
            constructor();
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
        class Mesh extends Transformations {
            private _webGL;
            private _vertexes;
            private _vertextTextures;
            private _vertexNormals;
            private _faces;
            private _materials;
            private _isReady;
            private _vertexIndexBuffers;
            private _vertexPositionBuffer;
            private _vertexNormalBuffer;
            private _vertexColorBuffer;
            private _vertexTextureBuffer;
            static defaultMaterialName: string;
            constructor(webGL: any);
            fillBuffers(vertexes: number[], vertexTexture: number[], vertexNormals: number[], faces: Face[][], materials: Material[]): void;
            initBuffers(materials?: Material[]): void;
            isReady(): boolean;
            getVertexIndexBuffers(): void;
            getVertexPositionBuffer(): void;
            getVertexColorBuffer(): void;
            getVertexNormalBuffer(): void;
            getVertexTextureBuffer(): void;
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
        class Camera extends Transformations {
            constructor();
        }
    }
}
declare module webGLEngine {
    module Types {
        class Render {
            private _engine;
            private _subscribers;
            private _renderTimer;
            constructor(engine: Engine);
            /** set render frequency per second
             * @param framePerSecond frames per second
             * @returns is set successful
             */
            setFPS(framePerSecond: number): boolean;
            /** Add render subscriber
             * @param renderCallback
             * @return is callback Was added
             */
            subscribe(renderCallback: Utils.Callback): boolean;
            /** Removes render subscriber
             * @param renderCallback
             * @return is callback Was deleted
             */
            unsubscribe(renderCallback: Utils.Callback): boolean;
            /** render the scene
             * if you want to use your own uneven render */
            render(): void;
            private _render();
        }
    }
}
declare module webGLEngine {
    module Types {
        class Material {
            diffuseColor: number[];
            specular: number;
            imageLink: string;
            ready: boolean;
            texture: any;
            textureRepeat: boolean;
            constructor();
            loadTexture(gl: any, path: any, textureRepeat: any): void;
            /** @private */
            createTexture(): void;
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
            private _mesh;
            private _startTime;
            private _frameIndex;
            private _callback;
            constructor(mesh: Transformations);
            getFrameIndex(): number;
            getMesh(): Transformations;
            getStartTime(): number;
            start(callback?: Utils.Callback): void;
            nextFrame(): number;
            shiftStartTime(time: number): void;
            callback(): void;
        }
    }
}
declare module webGLEngine {
    module Types {
        class Animation {
            private _type;
            private _frames;
            private _initialFrame;
            private _targets;
            static animations: Animation[];
            static Types: {
                WITH_CHANGES: number;
                WITHOUT_CHANGES: number;
            };
            constructor(type: number, initialFrame: Frame, frames: Frame[]);
            start(mesh: Transformations, callback?: Utils.Callback): void;
            /** Do updates before render */
            updateBeforeRender(): void;
            /** Do updated after render */
            updateAfterRender(): void;
            update(): void;
            setTimeByDistance(time: number): void;
            /** Removes animation from general animations list */
            destroy(): void;
            private _updateTarget(target, frameIndex, percents);
        }
    }
}
declare module webGLEngine {
    class config {
        static version: string;
        static html: {
            canvasID: string;
        };
    }
}
declare module webGLEngine {
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
        private _shaderProgram;
        private _isLightingEnable;
        constructor(fragmentShaderPath: string, vertexShaderPath: string);
        Render: Types.Render;
        private _crateCanvas();
        private _initGL();
        private _loadShaders(fragmentShaderPath, vertexShaderPath);
        private _initShaders();
        private _mvPushMatrix();
        private _mvPopMatrix();
        private _setMatrixUniforms();
        beginDraw(): void;
        isReady(): boolean;
        draw(mesh: Types.Mesh): void;
        createLight(type: number, color: number[], param: number[], distance: number): Types.Light;
        turnOnLight(): boolean;
        turnOffLight(): boolean;
        onResize(): void;
        getCamera(): Types.Transformations;
        createMesh(vertexes: any, textures: any, normals: any, faces: any, materials: any): Types.Mesh;
        private _createMeshFromFile(path, params);
        private _parseObjFile(objFile, mesh, path, parameters);
        private _parseMaterial(mtlFile, path, mesh, parameters);
        getGLInstance(): any;
    }
}
