var Example;
(function (Example) {
    Example.Config = {
        engine: {
            FPS: 30
        },
        camera: {
            mouse: {
                sensitivity: 400
            }
        },
        webGL: {
            shaders: {
                fragment: '../source/shaders/fragmentShader.glsl',
                vertex: '../source/shaders/vertexShader.glsl',
            }
        }
    };
})(Example || (Example = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Utils;
    (function (Utils) {
        var Callback = (function () {
            function Callback(func, thisArg) {
                if (func === void 0) { func = function () {
                }; }
                if (thisArg === void 0) { thisArg = {}; }
                var args = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    args[_i - 2] = arguments[_i];
                }
                this._func = func;
                this._thisArg = thisArg;
                this._args = args;
            }
            Callback.prototype.apply = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                return this._func.apply(this._thisArg, args.concat(this._args));
            };
            return Callback;
        })();
        Utils.Callback = Callback;
    })(Utils = WebGLEngine.Utils || (WebGLEngine.Utils = {}));
})(WebGLEngine || (WebGLEngine = {}));
glMatrixArrayType = typeof Float32Array != "undefined" ?
    Float32Array : typeof WebGLFloatArray != "undefined" ? WebGLFloatArray : Array;
var WebGLEngine;
(function (WebGLEngine) {
    var Utils;
    (function (Utils) {
        var GLMatrix;
        (function (GLMatrix) {
            var vec3 = (function () {
                function vec3() {
                }
                vec3.create = function (a) {
                    var b = new glMatrixArrayType(3);
                    if (a) {
                        b[0] = a[0];
                        b[1] = a[1];
                        b[2] = a[2];
                    }
                    return b;
                };
                vec3.set = function (a, b) {
                    b[0] = a[0];
                    b[1] = a[1];
                    b[2] = a[2];
                    return b;
                };
                vec3.add = function (a, b, c) {
                    if (!c || a == c) {
                        a[0] += b[0];
                        a[1] += b[1];
                        a[2] += b[2];
                        return a;
                    }
                    c[0] = a[0] + b[0];
                    c[1] = a[1] + b[1];
                    c[2] = a[2] + b[2];
                    return c;
                };
                vec3.subtract = function (a, b, c) {
                    if (!c || a == c) {
                        a[0] -= b[0];
                        a[1] -= b[1];
                        a[2] -= b[2];
                        return a;
                    }
                    c[0] = a[0] - b[0];
                    c[1] = a[1] - b[1];
                    c[2] = a[2] - b[2];
                    return c;
                };
                vec3.negate = function (a, b) {
                    b || (b = a);
                    b[0] = -a[0];
                    b[1] = -a[1];
                    b[2] = -a[2];
                    return b;
                };
                vec3.scale = function (a, b, c) {
                    if (!c || a == c) {
                        a[0] *= b;
                        a[1] *= b;
                        a[2] *= b;
                        return a;
                    }
                    c[0] = a[0] * b;
                    c[1] = a[1] * b;
                    c[2] = a[2] * b;
                    return c;
                };
                vec3.normalize = function (a, b) {
                    b || (b = a);
                    var c = a[0], d = a[1], e = a[2], g = Math.sqrt(c * c + d * d + e * e);
                    if (g) {
                        if (g == 1) {
                            b[0] = c;
                            b[1] = d;
                            b[2] = e;
                            return b;
                        }
                    }
                    else {
                        b[0] = 0;
                        b[1] = 0;
                        b[2] = 0;
                        return b;
                    }
                    g = 1 / g;
                    b[0] = c * g;
                    b[1] = d * g;
                    b[2] = e * g;
                    return b;
                };
                vec3.cross = function (a, b, c) {
                    c || (c = a);
                    var d = a[0], e = a[1];
                    a = a[2];
                    var g = b[0], f = b[1];
                    b = b[2];
                    c[0] = e * b - a * f;
                    c[1] = a * g - d * b;
                    c[2] = d * f - e * g;
                    return c;
                };
                vec3.length = function (a) {
                    var b = a[0], c = a[1];
                    a = a[2];
                    return Math.sqrt(b * b + c * c + a * a);
                };
                vec3.dot = function (a, b) {
                    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
                };
                vec3.direction = function (a, b, c) {
                    c || (c = a);
                    var d = a[0] - b[0], e = a[1] - b[1];
                    a = a[2] - b[2];
                    b = Math.sqrt(d * d + e * e + a * a);
                    if (!b) {
                        c[0] = 0;
                        c[1] = 0;
                        c[2] = 0;
                        return c;
                    }
                    b = 1 / b;
                    c[0] = d * b;
                    c[1] = e * b;
                    c[2] = a * b;
                    return c;
                };
                vec3.lerp = function (a, b, c, d) {
                    d || (d = a);
                    d[0] = a[0] + c * (b[0] - a[0]);
                    d[1] = a[1] + c * (b[1] - a[1]);
                    d[2] = a[2] + c * (b[2] - a[2]);
                    return d;
                };
                vec3.str = function (a) {
                    return "[" + a[0] + ", " + a[1] + ", " + a[2] + "]";
                };
                return vec3;
            })();
            GLMatrix.vec3 = vec3;
            var mat3 = (function () {
                function mat3() {
                }
                mat3.create = function (a) {
                    var b = new glMatrixArrayType(9);
                    if (a) {
                        b[0] = a[0];
                        b[1] = a[1];
                        b[2] = a[2];
                        b[3] = a[3];
                        b[4] = a[4];
                        b[5] = a[5];
                        b[6] = a[6];
                        b[7] = a[7];
                        b[8] = a[8];
                        b[9] = a[9];
                    }
                    return b;
                };
                mat3.set = function (a, b) {
                    b[0] = a[0];
                    b[1] = a[1];
                    b[2] = a[2];
                    b[3] = a[3];
                    b[4] = a[4];
                    b[5] = a[5];
                    b[6] = a[6];
                    b[7] = a[7];
                    b[8] = a[8];
                    return b;
                };
                mat3.identity = function (a) {
                    a[0] = 1;
                    a[1] = 0;
                    a[2] = 0;
                    a[3] = 0;
                    a[4] = 1;
                    a[5] = 0;
                    a[6] = 0;
                    a[7] = 0;
                    a[8] = 1;
                    return a;
                };
                mat3.transpose = function (a, b) {
                    if (!b || a == b) {
                        var c = a[1], d = a[2], e = a[5];
                        a[1] = a[3];
                        a[2] = a[6];
                        a[3] = c;
                        a[5] = a[7];
                        a[6] = d;
                        a[7] = e;
                        return a;
                    }
                    b[0] = a[0];
                    b[1] = a[3];
                    b[2] = a[6];
                    b[3] = a[1];
                    b[4] = a[4];
                    b[5] = a[7];
                    b[6] = a[2];
                    b[7] = a[5];
                    b[8] = a[8];
                    return b;
                };
                mat3.toMat4 = function (a, b) {
                    b || (b = mat4.create());
                    b[0] = a[0];
                    b[1] = a[1];
                    b[2] = a[2];
                    b[3] = 0;
                    b[4] = a[3];
                    b[5] = a[4];
                    b[6] = a[5];
                    b[7] = 0;
                    b[8] = a[6];
                    b[9] = a[7];
                    b[10] = a[8];
                    b[11] = 0;
                    b[12] = 0;
                    b[13] = 0;
                    b[14] = 0;
                    b[15] = 1;
                    return b;
                };
                mat3.str = function (a) {
                    return "[" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + "]";
                };
                return mat3;
            })();
            GLMatrix.mat3 = mat3;
            var mat4 = (function () {
                function mat4() {
                }
                mat4.create = function (a) {
                    var b = new glMatrixArrayType(16);
                    if (a) {
                        b[0] = a[0];
                        b[1] = a[1];
                        b[2] = a[2];
                        b[3] = a[3];
                        b[4] = a[4];
                        b[5] = a[5];
                        b[6] = a[6];
                        b[7] = a[7];
                        b[8] = a[8];
                        b[9] = a[9];
                        b[10] = a[10];
                        b[11] = a[11];
                        b[12] = a[12];
                        b[13] = a[13];
                        b[14] = a[14];
                        b[15] = a[15];
                    }
                    return b;
                };
                mat4.set = function (a, b) {
                    b[0] = a[0];
                    b[1] = a[1];
                    b[2] = a[2];
                    b[3] = a[3];
                    b[4] = a[4];
                    b[5] = a[5];
                    b[6] = a[6];
                    b[7] = a[7];
                    b[8] = a[8];
                    b[9] = a[9];
                    b[10] = a[10];
                    b[11] = a[11];
                    b[12] = a[12];
                    b[13] = a[13];
                    b[14] = a[14];
                    b[15] = a[15];
                    return b;
                };
                mat4.identity = function (a) {
                    a[0] = 1;
                    a[1] = 0;
                    a[2] = 0;
                    a[3] = 0;
                    a[4] = 0;
                    a[5] = 1;
                    a[6] = 0;
                    a[7] = 0;
                    a[8] = 0;
                    a[9] = 0;
                    a[10] = 1;
                    a[11] = 0;
                    a[12] = 0;
                    a[13] = 0;
                    a[14] = 0;
                    a[15] = 1;
                    return a;
                };
                mat4.transpose = function (a, b) {
                    if (!b || a == b) {
                        var c = a[1], d = a[2], e = a[3], g = a[6], f = a[7], h = a[11];
                        a[1] = a[4];
                        a[2] = a[8];
                        a[3] = a[12];
                        a[4] = c;
                        a[6] = a[9];
                        a[7] = a[13];
                        a[8] = d;
                        a[9] = g;
                        a[11] = a[14];
                        a[12] = e;
                        a[13] = f;
                        a[14] = h;
                        return a;
                    }
                    b[0] = a[0];
                    b[1] = a[4];
                    b[2] = a[8];
                    b[3] = a[12];
                    b[4] = a[1];
                    b[5] = a[5];
                    b[6] = a[9];
                    b[7] = a[13];
                    b[8] = a[2];
                    b[9] = a[6];
                    b[10] = a[10];
                    b[11] = a[14];
                    b[12] = a[3];
                    b[13] = a[7];
                    b[14] = a[11];
                    b[15] = a[15];
                    return b;
                };
                mat4.determinant = function (a) {
                    var b = a[0], c = a[1], d = a[2], e = a[3], g = a[4], f = a[5], h = a[6], i = a[7], j = a[8], k = a[9], l = a[10], o = a[11], m = a[12], n = a[13], p = a[14];
                    a = a[15];
                    return m * k * h * e - j * n * h * e - m * f * l * e + g * n * l * e + j * f * p * e - g * k * p * e - m * k * d * i + j * n * d * i + m * c * l * i - b * n * l * i - j * c * p * i + b * k * p * i + m * f * d * o - g * n * d * o - m * c * h * o + b * n * h * o + g * c * p * o - b * f * p * o - j * f * d * a + g * k * d * a + j * c * h * a - b * k * h * a - g * c * l * a + b * f * l * a;
                };
                mat4.inverse = function (a, b) {
                    b || (b = a);
                    var c = a[0], d = a[1], e = a[2], g = a[3], f = a[4], h = a[5], i = a[6], j = a[7], k = a[8], l = a[9], o = a[10], m = a[11], n = a[12], p = a[13], r = a[14], s = a[15], A = c * h - d * f, B = c * i - e * f, t = c * j - g * f, u = d * i - e * h, v = d * j - g * h, w = e * j - g * i, x = k * p - l * n, y = k * r - o * n, z = k * s - m * n, C = l * r - o * p, D = l * s - m * p, E = o * s - m * r, q = 1 / (A * E - B * D + t * C + u * z - v * y + w * x);
                    b[0] = (h * E - i * D + j * C) * q;
                    b[1] = (-d * E + e * D - g * C) * q;
                    b[2] = (p * w - r * v + s * u) * q;
                    b[3] = (-l * w + o * v - m * u) * q;
                    b[4] = (-f * E + i * z - j * y) * q;
                    b[5] = (c * E - e * z + g * y) * q;
                    b[6] = (-n * w + r * t - s * B) * q;
                    b[7] = (k * w - o * t + m * B) * q;
                    b[8] = (f * D - h * z + j * x) * q;
                    b[9] = (-c * D + d * z - g * x) * q;
                    b[10] = (n * v - p * t + s * A) * q;
                    b[11] = (-k * v + l * t - m * A) * q;
                    b[12] = (-f * C + h * y - i * x) * q;
                    b[13] = (c * C - d * y + e * x) * q;
                    b[14] = (-n * u + p * B - r * A) * q;
                    b[15] = (k * u - l * B + o * A) * q;
                    return b;
                };
                mat4.toRotationMat = function (a, b) {
                    b || (b = mat4.create());
                    b[0] = a[0];
                    b[1] = a[1];
                    b[2] = a[2];
                    b[3] = a[3];
                    b[4] = a[4];
                    b[5] = a[5];
                    b[6] = a[6];
                    b[7] = a[7];
                    b[8] = a[8];
                    b[9] = a[9];
                    b[10] = a[10];
                    b[11] = a[11];
                    b[12] = 0;
                    b[13] = 0;
                    b[14] = 0;
                    b[15] = 1;
                    return b;
                };
                mat4.toMat3 = function (a, b) {
                    b || (b = mat3.create());
                    b[0] = a[0];
                    b[1] = a[1];
                    b[2] = a[2];
                    b[3] = a[4];
                    b[4] = a[5];
                    b[5] = a[6];
                    b[6] = a[8];
                    b[7] = a[9];
                    b[8] = a[10];
                    return b;
                };
                mat4.toInverseMat3 = function (a, b) {
                    var c = a[0], d = a[1], e = a[2], g = a[4], f = a[5], h = a[6], i = a[8], j = a[9], k = a[10], l = k * f - h * j, o = -k * g + h * i, m = j * g - f * i, n = c * l + d * o + e * m;
                    if (!n)
                        return null;
                    n = 1 / n;
                    b || (b = mat3.create());
                    b[0] = l * n;
                    b[1] = (-k * d + e * j) * n;
                    b[2] = (h * d - e * f) * n;
                    b[3] = o * n;
                    b[4] = (k * c - e * i) * n;
                    b[5] = (-h * c + e * g) * n;
                    b[6] = m * n;
                    b[7] = (-j * c + d * i) * n;
                    b[8] = (f * c - d * g) * n;
                    return b;
                };
                mat4.multiply = function (a, b, c) {
                    c || (c = a);
                    var d = a[0], e = a[1], g = a[2], f = a[3], h = a[4], i = a[5], j = a[6], k = a[7], l = a[8], o = a[9], m = a[10], n = a[11], p = a[12], r = a[13], s = a[14];
                    a = a[15];
                    var A = b[0], B = b[1], t = b[2], u = b[3], v = b[4], w = b[5], x = b[6], y = b[7], z = b[8], C = b[9], D = b[10], E = b[11], q = b[12], F = b[13], G = b[14];
                    b = b[15];
                    c[0] = A * d + B * h + t * l + u * p;
                    c[1] = A * e + B * i + t * o + u * r;
                    c[2] = A * g + B * j + t * m + u * s;
                    c[3] = A * f + B * k + t * n + u * a;
                    c[4] = v * d + w * h + x * l + y * p;
                    c[5] = v * e + w * i + x * o + y * r;
                    c[6] = v * g + w * j + x * m + y * s;
                    c[7] = v * f + w * k + x * n + y * a;
                    c[8] = z * d + C * h + D * l + E * p;
                    c[9] = z * e + C * i + D * o + E * r;
                    c[10] = z *
                        g + C * j + D * m + E * s;
                    c[11] = z * f + C * k + D * n + E * a;
                    c[12] = q * d + F * h + G * l + b * p;
                    c[13] = q * e + F * i + G * o + b * r;
                    c[14] = q * g + F * j + G * m + b * s;
                    c[15] = q * f + F * k + G * n + b * a;
                    return c;
                };
                mat4.multiplyVec3 = function (a, b, c) {
                    c || (c = b);
                    var d = b[0], e = b[1];
                    b = b[2];
                    c[0] = a[0] * d + a[4] * e + a[8] * b + a[12];
                    c[1] = a[1] * d + a[5] * e + a[9] * b + a[13];
                    c[2] = a[2] * d + a[6] * e + a[10] * b + a[14];
                    return c;
                };
                mat4.multiplyVec4 = function (a, b, c) {
                    c || (c = b);
                    var d = b[0], e = b[1], g = b[2];
                    b = b[3];
                    c[0] = a[0] * d + a[4] * e + a[8] * g + a[12] * b;
                    c[1] = a[1] * d + a[5] * e + a[9] * g + a[13] * b;
                    c[2] = a[2] * d + a[6] * e + a[10] * g + a[14] * b;
                    c[3] = a[3] * d + a[7] * e + a[11] * g + a[15] * b;
                    return c;
                };
                mat4.translate = function (a, b, c) {
                    var d = b[0], e = b[1];
                    b = b[2];
                    if (!c || a == c) {
                        a[12] = a[0] * d + a[4] * e + a[8] * b + a[12];
                        a[13] = a[1] * d + a[5] * e + a[9] * b + a[13];
                        a[14] = a[2] * d + a[6] * e + a[10] * b + a[14];
                        a[15] = a[3] * d + a[7] * e + a[11] * b + a[15];
                        return a;
                    }
                    var g = a[0], f = a[1], h = a[2], i = a[3], j = a[4], k = a[5], l = a[6], o = a[7], m = a[8], n = a[9], p = a[10], r = a[11];
                    c[0] = g;
                    c[1] = f;
                    c[2] = h;
                    c[3] = i;
                    c[4] = j;
                    c[5] = k;
                    c[6] = l;
                    c[7] = o;
                    c[8] = m;
                    c[9] = n;
                    c[10] = p;
                    c[11] = r;
                    c[12] = g * d + j * e + m * b + a[12];
                    c[13] = f * d + k * e + n * b + a[13];
                    c[14] = h * d + l * e + p * b + a[14];
                    c[15] = i * d + o * e + r * b + a[15];
                    return c;
                };
                mat4.scale = function (a, b, c) {
                    var d = b[0], e = b[1];
                    b = b[2];
                    if (!c || a == c) {
                        a[0] *= d;
                        a[1] *= d;
                        a[2] *= d;
                        a[3] *= d;
                        a[4] *= e;
                        a[5] *= e;
                        a[6] *= e;
                        a[7] *= e;
                        a[8] *= b;
                        a[9] *= b;
                        a[10] *= b;
                        a[11] *= b;
                        return a;
                    }
                    c[0] = a[0] * d;
                    c[1] = a[1] * d;
                    c[2] = a[2] * d;
                    c[3] = a[3] * d;
                    c[4] = a[4] * e;
                    c[5] = a[5] * e;
                    c[6] = a[6] * e;
                    c[7] = a[7] * e;
                    c[8] = a[8] * b;
                    c[9] = a[9] * b;
                    c[10] = a[10] * b;
                    c[11] = a[11] * b;
                    c[12] = a[12];
                    c[13] = a[13];
                    c[14] = a[14];
                    c[15] = a[15];
                    return c;
                };
                mat4.rotate = function (a, b, c, d) {
                    var e = c[0], g = c[1];
                    c = c[2];
                    var f = Math.sqrt(e * e + g * g + c * c);
                    if (!f)
                        return null;
                    if (f != 1) {
                        f = 1 / f;
                        e *= f;
                        g *= f;
                        c *= f;
                    }
                    var h = Math.sin(b), i = Math.cos(b), j = 1 - i;
                    b = a[0];
                    f = a[1];
                    var k = a[2], l = a[3], o = a[4], m = a[5], n = a[6], p = a[7], r = a[8], s = a[9], A = a[10], B = a[11], t = e * e * j + i, u = g * e * j + c * h, v = c * e * j - g * h, w = e * g * j - c * h, x = g * g * j + i, y = c * g * j + e * h, z = e * c * j + g * h;
                    e = g * c * j - e * h;
                    g = c * c * j + i;
                    if (d) {
                        if (a != d) {
                            d[12] = a[12];
                            d[13] = a[13];
                            d[14] = a[14];
                            d[15] = a[15];
                        }
                    }
                    else
                        d = a;
                    d[0] = b * t + o * u + r * v;
                    d[1] = f * t + m * u + s * v;
                    d[2] = k * t + n * u + A * v;
                    d[3] = l * t + p * u + B *
                        v;
                    d[4] = b * w + o * x + r * y;
                    d[5] = f * w + m * x + s * y;
                    d[6] = k * w + n * x + A * y;
                    d[7] = l * w + p * x + B * y;
                    d[8] = b * z + o * e + r * g;
                    d[9] = f * z + m * e + s * g;
                    d[10] = k * z + n * e + A * g;
                    d[11] = l * z + p * e + B * g;
                    return d;
                };
                mat4.rotateX = function (a, b, c) {
                    var d = Math.sin(b);
                    b = Math.cos(b);
                    var e = a[4], g = a[5], f = a[6], h = a[7], i = a[8], j = a[9], k = a[10], l = a[11];
                    if (c) {
                        if (a != c) {
                            c[0] = a[0];
                            c[1] = a[1];
                            c[2] = a[2];
                            c[3] = a[3];
                            c[12] = a[12];
                            c[13] = a[13];
                            c[14] = a[14];
                            c[15] = a[15];
                        }
                    }
                    else
                        c = a;
                    c[4] = e * b + i * d;
                    c[5] = g * b + j * d;
                    c[6] = f * b + k * d;
                    c[7] = h * b + l * d;
                    c[8] = e * -d + i * b;
                    c[9] = g * -d + j * b;
                    c[10] = f * -d + k * b;
                    c[11] = h * -d + l * b;
                    return c;
                };
                mat4.rotateY = function (a, b, c) {
                    var d = Math.sin(b);
                    b = Math.cos(b);
                    var e = a[0], g = a[1], f = a[2], h = a[3], i = a[8], j = a[9], k = a[10], l = a[11];
                    if (c) {
                        if (a != c) {
                            c[4] = a[4];
                            c[5] = a[5];
                            c[6] = a[6];
                            c[7] = a[7];
                            c[12] = a[12];
                            c[13] = a[13];
                            c[14] = a[14];
                            c[15] = a[15];
                        }
                    }
                    else
                        c = a;
                    c[0] = e * b + i * -d;
                    c[1] = g * b + j * -d;
                    c[2] = f * b + k * -d;
                    c[3] = h * b + l * -d;
                    c[8] = e * d + i * b;
                    c[9] = g * d + j * b;
                    c[10] = f * d + k * b;
                    c[11] = h * d + l * b;
                    return c;
                };
                mat4.rotateZ = function (a, b, c) {
                    var d = Math.sin(b);
                    b = Math.cos(b);
                    var e = a[0], g = a[1], f = a[2], h = a[3], i = a[4], j = a[5], k = a[6], l = a[7];
                    if (c) {
                        if (a != c) {
                            c[8] = a[8];
                            c[9] = a[9];
                            c[10] = a[10];
                            c[11] = a[11];
                            c[12] = a[12];
                            c[13] = a[13];
                            c[14] = a[14];
                            c[15] = a[15];
                        }
                    }
                    else
                        c = a;
                    c[0] = e * b + i * d;
                    c[1] = g * b + j * d;
                    c[2] = f * b + k * d;
                    c[3] = h * b + l * d;
                    c[4] = e * -d + i * b;
                    c[5] = g * -d + j * b;
                    c[6] = f * -d + k * b;
                    c[7] = h * -d + l * b;
                    return c;
                };
                mat4.frustum = function (a, b, c, d, e, g, f) {
                    f || (f = mat4.create());
                    var h = b - a, i = d - c, j = g - e;
                    f[0] = e * 2 / h;
                    f[1] = 0;
                    f[2] = 0;
                    f[3] = 0;
                    f[4] = 0;
                    f[5] = e * 2 / i;
                    f[6] = 0;
                    f[7] = 0;
                    f[8] = (b + a) / h;
                    f[9] = (d + c) / i;
                    f[10] = -(g + e) / j;
                    f[11] = -1;
                    f[12] = 0;
                    f[13] = 0;
                    f[14] = -(g * e * 2) / j;
                    f[15] = 0;
                    return f;
                };
                mat4.perspective = function (a, b, c, d, e) {
                    a = c * Math.tan(a * Math.PI / 360);
                    b = a * b;
                    return mat4.frustum(-b, b, -a, a, c, d, e);
                };
                mat4.ortho = function (a, b, c, d, e, g, f) {
                    f || (f = mat4.create());
                    var h = b - a, i = d - c, j = g - e;
                    f[0] = 2 / h;
                    f[1] = 0;
                    f[2] = 0;
                    f[3] = 0;
                    f[4] = 0;
                    f[5] = 2 / i;
                    f[6] = 0;
                    f[7] = 0;
                    f[8] = 0;
                    f[9] = 0;
                    f[10] = -2 / j;
                    f[11] = 0;
                    f[12] = -(a + b) / h;
                    f[13] = -(d + c) / i;
                    f[14] = -(g + e) / j;
                    f[15] = 1;
                    return f;
                };
                mat4.lookAt = function (a, b, c, d) {
                    d || (d = mat4.create());
                    var e = a[0], g = a[1];
                    a = a[2];
                    var f = c[0], h = c[1], i = c[2];
                    c = b[1];
                    var j = b[2];
                    if (e == b[0] && g == c && a == j)
                        return mat4.identity(d);
                    var k, l, o, m;
                    c = e - b[0];
                    j = g - b[1];
                    b = a - b[2];
                    m = 1 / Math.sqrt(c * c + j * j + b * b);
                    c *= m;
                    j *= m;
                    b *= m;
                    k = h * b - i * j;
                    i = i * c - f * b;
                    f = f * j - h * c;
                    if (m = Math.sqrt(k * k + i * i + f * f)) {
                        m = 1 / m;
                        k *= m;
                        i *= m;
                        f *= m;
                    }
                    else
                        f = i = k = 0;
                    h = j * f - b * i;
                    l = b * k - c * f;
                    o = c * i - j * k;
                    if (m = Math.sqrt(h * h + l * l + o * o)) {
                        m = 1 / m;
                        h *= m;
                        l *= m;
                        o *= m;
                    }
                    else
                        o = l = h = 0;
                    d[0] = k;
                    d[1] = h;
                    d[2] = c;
                    d[3] = 0;
                    d[4] = i;
                    d[5] = l;
                    d[6] = j;
                    d[7] = 0;
                    d[8] = f;
                    d[9] =
                        o;
                    d[10] = b;
                    d[11] = 0;
                    d[12] = -(k * e + i * g + f * a);
                    d[13] = -(h * e + l * g + o * a);
                    d[14] = -(c * e + j * g + b * a);
                    d[15] = 1;
                    return d;
                };
                mat4.str = function (a) {
                    return "[" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ", " + a[9] + ", " + a[10] + ", " + a[11] + ", " + a[12] + ", " + a[13] + ", " + a[14] + ", " + a[15] + "]";
                };
                return mat4;
            })();
            GLMatrix.mat4 = mat4;
        })(GLMatrix = Utils.GLMatrix || (Utils.GLMatrix = {}));
    })(Utils = WebGLEngine.Utils || (WebGLEngine.Utils = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Utils;
    (function (Utils) {
        var Timer = (function () {
            function Timer() {
                this._timerInterval = null;
                this._timerTimeout = null;
                this._timerEnabled = false;
                this._timeout = 0;
                this._pauseTimeout = 0;
                this._startTime = 0;
                this._isItTimeout = false;
                this._isTimeoutMode = false;
            }
            Timer.prototype.start = function (callback, timeout, callOnce) {
                if (!this._timerInterval) {
                    this._callback = callback;
                    if (typeof timeout === 'number') {
                        this._timeout = timeout;
                    }
                    else {
                        this._timeout = 0;
                    }
                    this._isItTimeout = typeof callOnce === 'boolean' ? callOnce : false;
                    this._createTimer();
                    this._timerEnabled = true;
                    this._isTimeoutMode = false;
                }
            };
            Timer.prototype.pause = function () {
                if (this._timerEnabled && this._timerInterval) {
                    if (this._isTimeoutMode)
                        clearTimeout(this._timerTimeout);
                    else
                        clearInterval(this._timerInterval);
                    this._isTimeoutMode = true;
                    this._timerInterval = null;
                    this._pauseTimeout -= Date.now() - this._startTime;
                    if (this._pauseTimeout < 0)
                        this._pauseTimeout = 0;
                }
            };
            Timer.prototype.resume = function () {
                if (this._timerEnabled && !this._timerInterval) {
                    var func = function (func, thisArg) {
                        return function () {
                            return func.apply(thisArg, arguments);
                        };
                    }.call(this, this.resumeInterval, this);
                    this._startTime = Date.now();
                    this._timerInterval = setTimeout(func, this._pauseTimeout);
                }
            };
            Timer.prototype.stop = function () {
                if (this._timerEnabled) {
                    if (this._timerInterval)
                        clearInterval(this._timerInterval);
                    this._timerInterval = null;
                    this._timerEnabled = false;
                }
            };
            Timer.prototype.isTimerEnabled = function () {
                return this._timerEnabled;
            };
            Timer.prototype.resumeInterval = function () {
                this._isTimeoutMode = false;
                this._createTimer();
            };
            Timer.prototype._createTimer = function () {
                var func = function (func, thisArg) {
                    return function () {
                        return func.apply(thisArg, arguments);
                    };
                }.call(this, this._nativeFunction, this);
                this._startTime = Date.now();
                this._timerInterval = setInterval(func, this._timeout);
            };
            Timer.prototype._nativeFunction = function () {
                this._callback.apply();
                this._startTime = Date.now();
                if (this._isItTimeout)
                    this.stop();
            };
            return Timer;
        })();
        Utils.Timer = Timer;
    })(Utils = WebGLEngine.Utils || (WebGLEngine.Utils = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Utils;
    (function (Utils) {
        var Console = (function () {
            function Console() {
                this._isCreated = false;
                this._previousMessage = '';
                this._sameMassagesCounter = 0;
            }
            /** creates console and show on screen */
            Console.prototype.create = function (x, y, maxWidth, maxHeight, maxLines) {
                if (!this._isCreated) {
                    this._isCreated = true;
                    this._freeLinesLeft = maxLines;
                    this._createView.apply(this, arguments);
                    this.log('console created');
                }
            };
            Console.prototype.log = function (msg, color) {
                if (this._isCreated) {
                    this._addLine(msg, color ? color : Console._colors.INFO);
                }
            };
            Console.prototype.warning = function (msg) {
                if (this._isCreated) {
                    this._addLine(msg, Console._colors.WARNING);
                }
            };
            Console.prototype.error = function (msg) {
                if (this._isCreated) {
                    this._addLine(msg, Console._colors.ERROR);
                }
            };
            /** creates console view */
            Console.prototype._createView = function (x, y, maxWidth, maxHeight) {
                var consoleDiv = document.createElement('div');
                this._maxHeight = typeof maxHeight === 'number' ? maxHeight : 100000;
                this._consoleView = consoleDiv;
                consoleDiv.style.position = 'fixed';
                consoleDiv.style.overflowX = 'hidden';
                consoleDiv.style.overflowY = 'scroll';
                consoleDiv.style.left = x + 'px';
                consoleDiv.style.top = y + 'px';
                consoleDiv.style.maxWidth = maxWidth + 'px';
                consoleDiv.style.maxHeight = maxHeight + 'px';
                consoleDiv.style.padding = Console._config.consolePadding + 'px 0';
                consoleDiv.style.zIndex = Console._config.zIndex + '';
                consoleDiv.style.backgroundColor = Console._config.consoleColor;
                document.body.appendChild(consoleDiv);
            };
            /** adds line to log */
            Console.prototype._addLine = function (msg, color) {
                var lineDiv = document.createElement('div');
                if (msg === this._previousMessage) {
                    this._sameMassagesCounter++;
                    this._previousLine.innerText = msg + ' (' + (this._sameMassagesCounter + 1) + ' times)';
                }
                else {
                    lineDiv.style.color = color;
                    lineDiv.style.fontSize = Console._config.fontSize + 'px';
                    lineDiv.style.margin = Console._config.lineMargin + 'px';
                    lineDiv.style.marginLeft = Console._config.lineMargin +
                        (Console._config.lineIndent * (msg.split('\t').length - 1)) +
                        'px';
                    lineDiv.style.padding = Console._config.linePadding + 'px';
                    lineDiv.style.backgroundColor = Console._config.lineColor;
                    lineDiv.innerText = msg;
                    this._consoleView.appendChild(lineDiv);
                    this._consoleView.scrollTop = this._maxHeight;
                    // save
                    this._previousLine = lineDiv;
                    this._previousMessage = msg;
                    this._sameMassagesCounter = 0;
                    if (this._freeLinesLeft - 1 < 0) {
                        this._consoleView.removeChild(this._consoleView.firstChild);
                    }
                    else {
                        this._freeLinesLeft--;
                    }
                }
            };
            Console._colors = {
                ERROR: 'red',
                WARNING: 'orange',
                INFO: 'white'
            };
            Console._config = {
                zIndex: 9999,
                consolePadding: 8,
                consoleColor: 'rgba(0, 0, 0, 0.6)',
                lineMargin: 4,
                linePadding: 4,
                lineColor: 'rgba(32, 32, 32, 0.5)',
                lineIndent: 16,
                fontSize: 14
            };
            return Console;
        })();
        Utils.Console = Console;
    })(Utils = WebGLEngine.Utils || (WebGLEngine.Utils = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Utils;
    (function (Utils) {
        var Request = (function () {
            function Request(url, callback) {
                this._url = url;
                this._request = new XMLHttpRequest();
                this._callback = callback;
                this._retryCount = 0;
                this._request.open('get', this._url, true);
                this._request.onreadystatechange = Utils.bind(this._requestResult, this);
            }
            Request.prototype.request = function () {
                this._send();
            };
            Request.prototype._send = function () {
                if (++this._retryCount > Request._retryAmount) {
                    console.error('Can\'t download file: ' + this._url);
                    this._callback.apply(null, this._url);
                }
                else {
                    this._request.open('get', this._url, true);
                    this._request.send(null);
                }
            };
            Request.prototype._requestResult = function () {
                // If the request is "DONE" (completed or failed)
                if (this._request.readyState === 4) {
                    // If we got HTTP status 200 (OK)
                    if (this._request.status !== 200) {
                        this._send();
                    }
                    else {
                        this._callback.apply(this._request.responseText, this._url);
                    }
                }
            };
            Request._retryAmount = 3;
            return Request;
        })();
        Utils.Request = Request;
    })(Utils = WebGLEngine.Utils || (WebGLEngine.Utils = {}));
})(WebGLEngine || (WebGLEngine = {}));
///<reference path="Request.ts"/>
var WebGLEngine;
(function (WebGLEngine) {
    var Utils;
    (function (Utils) {
        var RequestManager = (function () {
            function RequestManager() {
                this._requestQueue = [];
                this._queueTimer = new WebGLEngine.Utils.Timer();
                this._queueCallback = new Utils.Callback(this._nextRequest, this);
            }
            RequestManager.prototype.request = function (url, callback) {
                this._requestQueue.push(new Utils.Request(url, callback));
                if (!this._queueTimer.isTimerEnabled()) {
                    this._queueTimer.start(this._queueCallback, RequestManager._requestDelay);
                }
            };
            RequestManager.prototype._nextRequest = function () {
                if (this._requestQueue.length > 0) {
                    this._requestQueue.shift().request();
                }
                else {
                    this._queueTimer.stop();
                }
            };
            RequestManager._requestDelay = 10;
            return RequestManager;
        })();
        Utils.RequestManager = RequestManager;
    })(Utils = WebGLEngine.Utils || (WebGLEngine.Utils = {}));
})(WebGLEngine || (WebGLEngine = {}));
///<reference path="Callback.ts"/>
///<reference path="glMatrix.ts"/>
///<reference path="Timer.ts"/>
///<reference path="Console.ts"/>
///<reference path="RequestManager.ts"/>
var WebGLEngine;
(function (WebGLEngine) {
    var Utils;
    (function (Utils) {
        Utils.requestManager = new Utils.RequestManager();
        function bind(callBackFunc, thisArg) {
            var arg = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                arg[_i - 2] = arguments[_i];
            }
            var args = Array.prototype.slice.call(arguments, 2);
            return function () {
                var argv = Array.prototype.slice.call(arguments, 0);
                return callBackFunc.apply(thisArg, argv.concat(args));
            };
        }
        Utils.bind = bind;
        //export function requestFile(url : string, callback : Callback) {
        //	var request = new XMLHttpRequest();
        //
        //	request.open('get', url, true);
        //	request.onreadystatechange = this.bind(this.requestResult, this, request, url, callback);
        //	request.send(null);
        //}
        //
        //export function requestResult(event : Event,
        //															request : XMLHttpRequest,
        //															url : string,
        //															callback : Callback) {
        //	// If the request is "DONE" (completed or failed)
        //	if (request.readyState === 4) {
        //		// If we got HTTP status 200 (OK)
        //		if (request.status !== 200) {
        //			console.log('Can\'t download file: ' + url);
        //			//callback.apply('');
        //			// TODO : remove hack and create request manager
        //			this.requestFile(url, callback);
        //		}
        //		else {
        //			callback.apply(request.responseText);
        //		}
        //	}
        //}
        function getFileNameFromPath(path) {
            var nodes = path.split(/\\|\//g);
            return nodes[nodes.length - 1];
        }
        Utils.getFileNameFromPath = getFileNameFromPath;
    })(Utils = WebGLEngine.Utils || (WebGLEngine.Utils = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Types;
    (function (Types) {
        var Pool = (function () {
            function Pool() {
                this._pool = [];
            }
            /** Returns pool size */
            Pool.prototype.size = function () {
                return this._pool.length;
            };
            /** Returns pool element */
            Pool.prototype.get = function (index) {
                if (typeof index === 'number') {
                    if (index >= 0 && index < this._pool.length) {
                        return this._pool[index];
                    }
                    else {
                        WebGLEngine.Console.error('Pool:get() : index is out of range');
                    }
                }
                else {
                    WebGLEngine.Console.error('Pool:get() : parameter should be number');
                }
                return null;
            };
            /** Add element to pool
             * Returns true if element was added, otherwise false */
            Pool.prototype.add = function (element) {
                if (this._pool.indexOf(element) < 0) {
                    this._pool.push(element);
                    return true;
                }
                else {
                    WebGLEngine.Console.warning('Pool.add() : element already added. To add element you should remove it first\n' +
                        'Please note, constructor() may adding himself to this pool when element created');
                }
                return false;
            };
            /** Removes element from general pool
             * Returns true if element was removed, otherwise false */
            Pool.prototype.remove = function (element) {
                var index;
                if ((index = this._pool.indexOf(element)) >= 0) {
                    this._pool.splice(index, 1);
                    return true;
                }
                else {
                    WebGLEngine.Console.warning('Pool.remove() : Element not found');
                }
                return false;
            };
            return Pool;
        })();
        Types.Pool = Pool;
    })(Types = WebGLEngine.Types || (WebGLEngine.Types = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Types;
    (function (Types) {
        var Matrix = (function () {
            function Matrix() {
            }
            Matrix.transformationsToMatrix = function (transformations, type) {
                if (type === void 0) { type = Matrix.transformToMatrixTypes.USUAL; }
                var matrix = WebGLEngine.Utils.GLMatrix.mat4.identity(WebGLEngine.Utils.GLMatrix.mat4.create());
                //noinspection FallThroughInSwitchStatementJS
                switch (type) {
                    case Matrix.transformToMatrixTypes.USUAL:
                        WebGLEngine.Utils.GLMatrix.mat4.scale(matrix, transformations.scale.getArray());
                    case Matrix.transformToMatrixTypes.WITHOUT_SCALE:
                        WebGLEngine.Utils.GLMatrix.mat4.rotateX(matrix, transformations.rotation.x);
                        WebGLEngine.Utils.GLMatrix.mat4.rotateY(matrix, transformations.rotation.y);
                        WebGLEngine.Utils.GLMatrix.mat4.rotateZ(matrix, transformations.rotation.z);
                        WebGLEngine.Utils.GLMatrix.mat4.translate(matrix, transformations.position.getArray());
                        break;
                }
                return matrix;
            };
            Matrix.transformToMatrixTypes = {
                USUAL: 1,
                WITHOUT_SCALE: 2
            };
            return Matrix;
        })();
        Types.Matrix = Matrix;
    })(Types = WebGLEngine.Types || (WebGLEngine.Types = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Types;
    (function (Types) {
        var Transformations = (function () {
            function Transformations() {
                this.position = new Types.Vector3(0, 0, 0);
                this.rotation = new Types.Vector3(0, 0, 0);
                this.scale = new Types.Vector3(1, 1, 1);
            }
            //public set(position : Vector3, rotation : Vector3, scale : Vector3) : void {
            //	this.position = position;
            //	this.rotation = rotation;
            //	this.scale = scale;
            //}
            Transformations.prototype.copyFrom = function (transformation) {
                this.position.copyFrom(transformation.position);
                this.rotation.copyFrom(transformation.rotation);
                this.scale.copyFrom(transformation.scale);
            };
            Transformations.prototype.cloneTransformations = function () {
                var transformation = new Transformations();
                transformation.copyFrom(this);
                return transformation;
            };
            return Transformations;
        })();
        Types.Transformations = Transformations;
    })(Types = WebGLEngine.Types || (WebGLEngine.Types = {}));
})(WebGLEngine || (WebGLEngine = {}));
///<reference path="./Matrix.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var WebGLEngine;
(function (WebGLEngine) {
    var Types;
    (function (Types) {
        var LinkedTransformations = (function (_super) {
            __extends(LinkedTransformations, _super);
            function LinkedTransformations() {
                _super.call(this);
                this._parent = null;
                this._children = [];
            }
            /** Sets parent and adds current child to parent */
            LinkedTransformations.prototype.setParent = function (parent) {
                if (parent instanceof LinkedTransformations) {
                    this._parent = parent;
                    this._parent._children.push(this);
                    return true;
                }
                else {
                    WebGLEngine.Console.warning('LinkedTransformations.setParent() : parent isn\'t instance of LinkedTransformations\n' +
                        'parent isn\'t added');
                }
                return false;
            };
            /** Clear parent and current child from it */
            LinkedTransformations.prototype.clearParent = function () {
                this._parent.removeChild(this);
                this._parent = null;
            };
            /** Returns parent */
            LinkedTransformations.prototype.getParent = function () {
                return this._parent;
            };
            /** Returns matrix of mesh parent tree */
            LinkedTransformations.prototype.getMatrix = function (type) {
                if (type === void 0) { type = Types.Matrix.transformToMatrixTypes.USUAL; }
                var parent = this, parents = [], matrix = Types.Matrix.transformationsToMatrix(this, type);
                while (parent = parent.getParent()) {
                    parents.push(parent);
                }
                //while (parents.length) {
                //	 TODO : check this operation
                //Utils.GLMatrix.mat4.multiply(matrix, Matrix.transformationsToMatrix(parents.pop(), type));
                //}
                return matrix;
            };
            /** Adds dependent child
             * Returns true if child was added, otherwise false */
            LinkedTransformations.prototype.addChild = function (child) {
                if (child instanceof LinkedTransformations) {
                    this._children.push(child);
                    return true;
                }
                else {
                    WebGLEngine.Console.error('LinkedTransformations.addChild() : parameter should be instance on LinkedTransformations');
                    return false;
                }
            };
            /** Removes dependent child
             * Returns true if child was removed, otherwise false */
            LinkedTransformations.prototype.removeChild = function (child) {
                var index;
                if (child instanceof LinkedTransformations) {
                    if ((index = this._children.indexOf(child)) >= 0) {
                        this._children.splice(index, 1);
                        return true;
                    }
                    else {
                        WebGLEngine.Console.warning('LinkedTransformations.removeChild() : child not found');
                    }
                    this._children.push(child);
                }
                else {
                    WebGLEngine.Console.error('LinkedTransformations.removeChild() : parameter should be instance on LinkedTransformations');
                }
                return false;
            };
            /** Check is child presented
             * Returns true if child presented, otherwise false */
            LinkedTransformations.prototype.hasChild = function (child) {
                if (child instanceof LinkedTransformations) {
                    return this._children.indexOf(child) >= 0;
                }
                else {
                    WebGLEngine.Console.error('LinkedTransformations.hasChild() : parameter should be instance on LinkedTransformations');
                }
                return null;
            };
            return LinkedTransformations;
        })(Types.Transformations);
        Types.LinkedTransformations = LinkedTransformations;
    })(Types = WebGLEngine.Types || (WebGLEngine.Types = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Types;
    (function (Types) {
        var Vertex = (function () {
            function Vertex(vertexIndex, textureIndex, normalIndex) {
                this.index = typeof vertexIndex === 'number' ? vertexIndex : 0;
                this.textureIndex = typeof textureIndex === 'number' ? textureIndex : 0;
                this.normalIndex = typeof normalIndex === 'number' ? normalIndex : -1;
            }
            return Vertex;
        })();
        Types.Vertex = Vertex;
    })(Types = WebGLEngine.Types || (WebGLEngine.Types = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Types;
    (function (Types) {
        var Face = (function () {
            function Face() {
                this.vertexes = [];
            }
            return Face;
        })();
        Types.Face = Face;
    })(Types = WebGLEngine.Types || (WebGLEngine.Types = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Types;
    (function (Types) {
        var BuffersBox = (function () {
            function BuffersBox(webGL, indexes, positions, normals, colors, textures) {
                this._webGL = webGL;
                this._createIndexBuffers(indexes);
                this._createBuffers(positions, normals, colors, textures);
            }
            BuffersBox.prototype.getVertexIndexBuffers = function () {
                return this._vertexIndexBuffers;
            };
            BuffersBox.prototype.getVertexPositionBuffer = function () {
                return this._vertexPositionBuffer;
            };
            BuffersBox.prototype.getVertexColorBuffer = function () {
                return this._vertexColorBuffer;
            };
            BuffersBox.prototype.getVertexNormalBuffer = function () {
                return this._vertexNormalBuffer;
            };
            BuffersBox.prototype.getVertexTextureBuffer = function () {
                return this._vertexTextureBuffer;
            };
            BuffersBox.prototype._createIndexBuffers = function (indexes) {
                var indexBuffer, material;
                this._vertexIndexBuffers = {};
                for (material in indexes) {
                    if (indexes.hasOwnProperty(material)) {
                        indexBuffer = this._bindBuffer(indexes[material], this._webGL.ELEMENT_ARRAY_BUFFER, Uint16Array, 1);
                        this._vertexIndexBuffers[material] = {
                            material: material,
                            buffer: indexBuffer
                        };
                    }
                }
            };
            BuffersBox.prototype._createBuffers = function (positions, normals, colors, textures) {
                this._vertexPositionBuffer = this._bindBuffer(positions, this._webGL.ARRAY_BUFFER, Float32Array, 3);
                this._vertexNormalBuffer = this._bindBuffer(normals, this._webGL.ARRAY_BUFFER, Float32Array, 3);
                this._vertexColorBuffer = this._bindBuffer(colors, this._webGL.ARRAY_BUFFER, Float32Array, 3);
                this._vertexTextureBuffer = this._bindBuffer(textures, this._webGL.ARRAY_BUFFER, Float32Array, 2);
            };
            BuffersBox.prototype._bindBuffer = function (array, bufferType, constructor, itemSize) {
                var buffer = this._webGL.createBuffer();
                this._webGL.bindBuffer(bufferType, buffer);
                this._webGL.bufferData(bufferType, new constructor(array), this._webGL.STATIC_DRAW);
                buffer.itemSize = itemSize;
                buffer.numItems = array.length / itemSize;
                return buffer;
            };
            return BuffersBox;
        })();
        Types.BuffersBox = BuffersBox;
    })(Types = WebGLEngine.Types || (WebGLEngine.Types = {}));
})(WebGLEngine || (WebGLEngine = {}));
///<reference path="./Vertex.ts"/>
///<reference path="./Face.ts"/>
///<reference path="./BuffersBox.ts"/>
var WebGLEngine;
(function (WebGLEngine) {
    var Types;
    (function (Types) {
        // TODO : refactor (Create material manager)
        var Mesh = (function (_super) {
            __extends(Mesh, _super);
            function Mesh(webGL) {
                _super.call(this);
                this._webGL = webGL;
                this._vertexes = null;
                this._vertextTextures = null;
                this._vertexNormals = null;
                this._faces = null;
                this._materials = null;
                this._materialsLoaded = 0;
                this._isReady = false;
                this._createCallback = null;
                this._bufferBoxes = [];
                this._transformationChildren = [];
                this._createCallback = [];
                this._materialCallback = new WebGLEngine.Utils.Callback(this._materialIsReady, this);
            }
            Mesh.prototype.fillBuffers = function (vertexes, vertexTexture, vertexNormals, faces, materials) {
                this._vertexes = vertexes;
                this._vertextTextures = vertexTexture;
                this._vertexNormals = vertexNormals;
                this._faces = faces;
                // TODO : check for dublicate
                this._materials = materials;
            };
            Mesh.prototype.initBuffers = function (materials) {
                var indexes = {}, colors = [], textures = [], normals = [], positions = [], vertex, itemSize, vectorColors, i, j, k, counter, material;
                this._materials[Types.Mesh.defaultMaterialName].callback(this._materialCallback);
                if (typeof materials !== 'undefined') {
                    for (material in this._materials) {
                        if (this._materials.hasOwnProperty(material)) {
                            if (materials.hasOwnProperty(material)) {
                                this._materials[material] = materials[material];
                                this._materials[material].callback(this._materialCallback);
                            }
                        }
                    }
                }
                // create buffers
                counter = 0;
                for (material in this._faces) {
                    if (this._faces.hasOwnProperty(material)) {
                        if (this._faces[material].length === 0)
                            continue;
                        indexes[material] = [];
                        for (i = 0; i < this._faces[material].length; i++) {
                            for (j = 0; j < this._faces[material][i].vertexes.length; j++) {
                                if (counter >= 21845) {
                                    this._bufferBoxes.push(new Types.BuffersBox(this._webGL, indexes, positions, normals, colors, textures));
                                    indexes = {};
                                    indexes[material] = [];
                                    positions = [];
                                    normals = [];
                                    colors = [];
                                    textures = [];
                                    counter = 0;
                                    continue;
                                }
                                vertex = this._faces[material][i].vertexes[j];
                                indexes[material].push(counter);
                                // positions
                                for (k = 0, itemSize = 3; k < itemSize; k++) {
                                    positions.push(this._vertexes[vertex.index * itemSize + k]);
                                }
                                // texture coordinates
                                for (k = 0, itemSize = 2; k < itemSize; k++) {
                                    textures.push(this._vertextTextures[vertex.textureIndex * itemSize + k]);
                                }
                                // normals
                                for (k = 0, itemSize = 3; k < itemSize; k++) {
                                    if (vertex.normalIndex >= 0) {
                                        normals.push(this._vertexNormals[vertex.normalIndex * itemSize + k]);
                                    }
                                    else {
                                        normals.push(null);
                                    }
                                }
                                // colors
                                vectorColors = this._materials[material].diffuseColor.getArray();
                                for (k = 0, itemSize = 3; k < itemSize; k++) {
                                    colors.push(vectorColors[k]);
                                }
                                counter++;
                            }
                            WebGLEngine.Types.Mesh._fixNormals(normals, positions, this._faces[material][i], counter - 3);
                        }
                    }
                }
                if (counter > 0) {
                    this._bufferBoxes.push(new Types.BuffersBox(this._webGL, indexes, positions, normals, colors, textures));
                }
            };
            Mesh.prototype.getBufferBoxes = function () {
                return this._bufferBoxes;
            };
            Mesh.prototype.getMaterials = function () {
                return this._materials;
            };
            Mesh.prototype.isReady = function () {
                return this._isReady;
            };
            Mesh.prototype.clone = function () {
                // TODO : finish clone
            };
            /** Sets create callback, that will called when mesh will be ready */
            Mesh.prototype.callback = function (callback) {
                this._createCallback.push(callback);
                if (this._isReady) {
                    while (this._createCallback.length) {
                        this._createCallback.shift().apply();
                    }
                }
                return this;
            };
            /** Create the same mesh with unique transformation
             * Other parameters just will be copied */
            Mesh.prototype.transformationClone = function () {
                var mesh = new Mesh(this._webGL);
                mesh._vertexes = this._vertexes;
                mesh._vertextTextures = this._vertextTextures;
                mesh._vertexNormals = this._vertexNormals;
                mesh._faces = this._faces;
                mesh._materials = this._materials;
                mesh._materialsLoaded = this._materialsLoaded;
                mesh._isReady = this._isReady;
                // TODO : check is that copy works
                mesh._bufferBoxes = this._bufferBoxes.slice(0);
                mesh._materialCallback = this._materialCallback;
                if (!this._isReady) {
                    this._transformationChildren.push(mesh);
                }
                return mesh;
            };
            // TODO : finish implementation
            Mesh._fixNormals = function (normals, vertexes, face, counter) {
                var i, j, p, point = [], normal, U, V, itemSize = 3, multiplier, isFixNeeded = false;
                for (i = 0; i < face.vertexes.length; i++) {
                    if (face.vertexes[i].normalIndex < 0) {
                        isFixNeeded = true;
                    }
                }
                if (isFixNeeded) {
                    for (i = 0; i < face.vertexes.length; i++) {
                        p = [];
                        for (j = 0; j < itemSize; j++) {
                            p.push(vertexes[(counter + i) * itemSize + j]);
                        }
                        point.push(new Types.Vector3(p[0], p[1], p[2]));
                    }
                    U = point[1].clone().minus(point[0]);
                    V = point[2].clone().minus(point[0]);
                    normal = new Types.Vector3(U.y * V.z - U.z * V.y, U.z * V.x - U.x * V.z, U.x * V.y - U.y * V.x);
                    multiplier = 1 / Math.sqrt(Math.pow(normal.x, 2) + Math.pow(normal.y, 2) + Math.pow(normal.z, 2));
                    normal.multiply(multiplier);
                    for (i = 0; i < face.vertexes.length; i++) {
                        normals[(counter + i) * itemSize] = normal.x;
                        normals[(counter + i) * itemSize + 1] = normal.y;
                        normals[(counter + i) * itemSize + 2] = normal.z;
                    }
                }
            };
            Mesh.prototype._materialIsReady = function () {
                var loaded = true, material;
                for (material in this._materials) {
                    if (this._materials.hasOwnProperty(material) && !this._materials[material].ready) {
                        loaded = false;
                        break;
                    }
                }
                if (loaded) {
                    while (this._transformationChildren.length) {
                        // TODO : fix that (ready callback may be missed)
                        this._transformationChildren.shift()._isReady = loaded;
                    }
                }
                this._isReady = loaded;
                if (this._isReady) {
                    if (this._createCallback.length) {
                        while (this._createCallback.length) {
                            this._createCallback.shift().apply();
                        }
                    }
                }
            };
            Mesh.defaultMaterialName = 'noMaterial';
            return Mesh;
        })(Types.LinkedTransformations);
        Types.Mesh = Mesh;
    })(Types = WebGLEngine.Types || (WebGLEngine.Types = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Types;
    (function (Types) {
        var Light = (function () {
            function Light(type, color, positionDirection, distance) {
                this._enabled = true;
                this._type = type;
                this._color = color;
                switch (type) {
                    case Light.Types.DIRECTIONAL:
                        this._direction = positionDirection;
                        break;
                    case Light.Types.POINT:
                        this._position = positionDirection;
                }
                this._distance = typeof distance === 'number' ? distance : 0;
            }
            Light.prototype.turnOn = function () {
                this._enabled = true;
            };
            Light.prototype.turnOff = function () {
                this._enabled = false;
            };
            Light.prototype.isEnabled = function () {
                return this._enabled;
            };
            Object.defineProperty(Light.prototype, "color", {
                get: function () {
                    return this._color;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Light.prototype, "position", {
                //set color(color) {
                //}
                get: function () {
                    return this._position;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Light.prototype, "distance", {
                //set position(position) {
                //}
                get: function () {
                    return this._distance;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Light.prototype, "direction", {
                //set distance(distance) {
                //}
                get: function () {
                    return this._direction;
                },
                enumerable: true,
                configurable: true
            });
            Light.Types = {
                DIRECTIONAL: 1,
                POINT: 2
            };
            return Light;
        })();
        Types.Light = Light;
    })(Types = WebGLEngine.Types || (WebGLEngine.Types = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Types;
    (function (Types) {
        var Shader = (function () {
            function Shader(gl) {
                if (!gl) {
                    return null;
                }
                this._gl = gl;
                this._vertexShader = null;
                this._fragmentShader = null;
                this._vertexShaderURL = null;
                this._fragmentShaderURL = null;
                this._callback = null;
                this._shaderCouter = 0;
                this._isLoading = false;
            }
            Shader.prototype.add = function (callback, fragmentShader, vertexShader) {
                this._callback = callback;
                if (this._isLoading) {
                    WebGLEngine.Console.error('Another shader is loading for now.');
                    this._callback.apply();
                }
                if (typeof fragmentShader !== 'string' || typeof vertexShader !== 'string') {
                    return;
                }
                else {
                    this._vertexShaderURL = vertexShader;
                    this._fragmentShaderURL = fragmentShader;
                }
                this._shaderCouter = 0;
                this._vertexShader = null;
                this._fragmentShader = null;
                this._isLoading = true;
                WebGLEngine.Utils.requestManager.request(fragmentShader, new WebGLEngine.Utils.Callback(this._loaded, this));
                WebGLEngine.Utils.requestManager.request(vertexShader, new WebGLEngine.Utils.Callback(this._loaded, this));
            };
            Shader.prototype._loaded = function (text, url) {
                var shader;
                if (!text) {
                    WebGLEngine.Console.error('Error loading shader: "' + url + '"');
                }
                else {
                    WebGLEngine.Console.log('\tshader loaded => ' + url);
                    switch (url) {
                        case this._fragmentShaderURL:
                            this._fragmentShader = shader = this._gl.createShader(this._gl.FRAGMENT_SHADER);
                            break;
                        case this._vertexShaderURL:
                            this._vertexShader = shader = this._gl.createShader(this._gl.VERTEX_SHADER);
                            break;
                        default:
                            return null;
                    }
                    this._gl.shaderSource(shader, text);
                    this._gl.compileShader(shader);
                    if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
                        WebGLEngine.Console.error(this._gl.getShaderInfoLog(shader));
                        return null;
                    }
                }
                if (++this._shaderCouter >= 2) {
                    this._isLoading = false;
                    WebGLEngine.Console.log('Shaders loaded successfully.');
                    this._callback.apply();
                }
            };
            Shader.prototype.getVertexShader = function () {
                return this._vertexShader;
            };
            Shader.prototype.getFragmentShader = function () {
                return this._fragmentShader;
            };
            /** Request shader
             * @private
             * @param {string} url
             * @param {function} callback
             * @param {object} thisArg */
            Shader.prototype.request = function (url, callback, thisArg) {
                var _request = new XMLHttpRequest();
                _request.open('get', url, true);
                callback = typeof callback === 'function' ? callback : function () {
                };
                thisArg = typeof thisArg === 'object' ? thisArg : {};
                // Hook the event that gets called as the request progresses
                _request.onreadystatechange = function () {
                    // If the request is "DONE" (completed or failed)
                    if (_request.readyState == 4) {
                        // If we got HTTP status 200 (OK)\
                        callback.call(thisArg, _request.status == 200, url, _request.responseText);
                    }
                };
                _request.send(null);
            };
            return Shader;
        })();
        Types.Shader = Shader;
    })(Types = WebGLEngine.Types || (WebGLEngine.Types = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Types;
    (function (Types) {
        var Camera = (function (_super) {
            __extends(Camera, _super);
            function Camera() {
                _super.call(this);
                this._followTarget = null;
                this.turnOn();
            }
            Object.defineProperty(Camera, "pool", {
                get: function () {
                    return this._pool;
                },
                enumerable: true,
                configurable: true
            });
            /** Sets follow state for camera */
            Camera.prototype.follow = function (transformations, distance) {
                if (transformations instanceof Types.Transformations) {
                    this._followTarget = transformations;
                    this._distance = typeof distance === 'number' ? distance : -1;
                }
                else {
                    WebGLEngine.Console.error('Camera:follow() : first parameter should be instance of Transformations');
                }
            };
            /** Removes follow state */
            Camera.prototype.unfollow = function () {
                this._followTarget = null;
            };
            Camera.prototype.update = function () {
                var hypotenuse2D, distance, ratio, yAngle, position;
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
                            this.position = this._followTarget.position.clone().minus(position);
                        }
                    }
                }
            };
            /** Adds camera to cameras pool
             * Removes true if animation was added, otherwise false */
            Camera.prototype.turnOn = function () {
                return Camera.pool.add(this);
            };
            /** Remove camera from cameras pool
             * Removes true if camera was removed, otherwise false  */
            Camera.prototype.turnOff = function () {
                return Camera.pool.remove(this);
            };
            Camera._pool = new Types.Pool();
            return Camera;
        })(Types.LinkedTransformations);
        Types.Camera = Camera;
    })(Types = WebGLEngine.Types || (WebGLEngine.Types = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Types;
    (function (Types) {
        var Subscribe = (function () {
            function Subscribe() {
                this._subscribers = [];
            }
            /** Add subscriber
             * @param callback
             * @return is callback Was added
             */
            Subscribe.prototype.subscribe = function (callback) {
                if (this._subscribers.indexOf(callback) < 0) {
                    this._subscribers.push(callback);
                    return true;
                }
                return false;
            };
            /** Removes subscriber
             * @param callback
             * @return is callback Was deleted
             */
            Subscribe.prototype.unsubscribe = function (callback) {
                var index;
                if ((index = this._subscribers.indexOf(callback)) > 0) {
                    this._subscribers.splice(index, 1);
                    return true;
                }
                return false;
            };
            return Subscribe;
        })();
        Types.Subscribe = Subscribe;
    })(Types = WebGLEngine.Types || (WebGLEngine.Types = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Types;
    (function (Types) {
        var Render = (function (_super) {
            __extends(Render, _super);
            function Render(engine) {
                _super.call(this);
                this._renderTimer = new WebGLEngine.Utils.Timer();
                this._engine = engine;
                this._renderTimer = new WebGLEngine.Utils.Timer();
            }
            /** set render frequency per second
             * @param framePerSecond frames per second
             * @returns is set successful
             */
            Render.prototype.setFPS = function (framePerSecond) {
                if (typeof framePerSecond === 'number') {
                    if (this._renderTimer.isTimerEnabled()) {
                        this._renderTimer.stop();
                    }
                    this._renderTimer.start(new WebGLEngine.Utils.Callback(this._render, this), 1000 / framePerSecond);
                    return true;
                }
                return false;
            };
            /** render the scene
             * if you want to use your own uneven render */
            Render.prototype.render = function () {
                this._render();
            };
            Render.prototype._render = function () {
                var i;
                if (this._engine.isReady()) {
                    // updates before render
                    for (i = 0; i < Types.Animation.pool.size(); i++) {
                        Types.Animation.pool.get(i).updateBeforeRender();
                    }
                    // updates cameras
                    for (i = 0; i < Types.Camera.pool.size(); i++) {
                        Types.Camera.pool.get(i).update();
                    }
                    // call subscribed functions for render
                    for (i = 0; i < this._subscribers.length; i++) {
                        this._subscribers[i].apply();
                    }
                    // update after render
                    for (i = 0; i < Types.Animation.pool.size(); i++) {
                        Types.Animation.pool.get(i).updateAfterRender();
                    }
                }
            };
            return Render;
        })(Types.Subscribe);
        Types.Render = Render;
    })(Types = WebGLEngine.Types || (WebGLEngine.Types = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Types;
    (function (Types) {
        var Controller = (function (_super) {
            __extends(Controller, _super);
            function Controller(engine) {
                _super.call(this);
                this._engine = engine;
                this._lastLoadedMesh = null;
            }
            Controller.prototype.sendEvent = function (event) {
                this._handler.call(this, arguments);
                for (var i = 0; i < this._subscribers.length; i++) {
                    this._subscribers[i].apply(event);
                }
            };
            Controller.prototype.getLastLoadedMesh = function () {
                return this._lastLoadedMesh;
            };
            Controller.prototype._handler = function (event, parameter) {
                switch (event) {
                    case Controller.Events.MESH_LOADED:
                        this._lastLoadedMesh = parameter;
                        break;
                }
            };
            Controller.Events = {
                MESH_LOADED: 'mesh_loaded',
                ALL_MESHES_LOADED: 'all_meshes_loaded'
            };
            return Controller;
        })(Types.Subscribe);
        Types.Controller = Controller;
    })(Types = WebGLEngine.Types || (WebGLEngine.Types = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Types;
    (function (Types) {
        var Vector3 = (function () {
            function Vector3(x, y, z) {
                this._x = 0;
                this._y = 0;
                this._z = 0;
                this.set(x, y, z);
            }
            Vector3.prototype.set = function (x, y, z) {
                this._x = typeof x === 'number' ? x : 0;
                this._y = typeof y === 'number' ? y : 0;
                this._z = typeof z === 'number' ? z : 0;
                return this;
            };
            Vector3.prototype.add = function (x, y, z) {
                this._x += typeof x === 'number' ? x : 0;
                this._y += typeof y === 'number' ? y : 0;
                this._z += typeof z === 'number' ? z : 0;
            };
            Vector3.prototype.minus = function (vector) {
                this._x -= vector._x;
                this._y -= vector._y;
                this._z -= vector._z;
                return this;
            };
            Vector3.prototype.plus = function (vector) {
                this._x += vector._x;
                this._y += vector._y;
                this._z += vector._z;
                return this;
            };
            Vector3.prototype.multiply = function (multiplier) {
                this._x *= multiplier;
                this._y *= multiplier;
                this._z *= multiplier;
                return this;
            };
            Vector3.prototype.divide = function (divider) {
                this._x /= divider;
                this._y /= divider;
                this._z /= divider;
                return this;
            };
            Vector3.prototype.clone = function () {
                return new Vector3(this._x, this._y, this._z);
            };
            Vector3.prototype.invertSign = function () {
                this._x *= -1;
                this._y *= -1;
                this._z *= -1;
                return this;
            };
            Vector3.prototype.copyFrom = function (vector) {
                this._x = vector._x;
                this._y = vector._y;
                this._z = vector._z;
            };
            Vector3.prototype.getArray = function () {
                return [this._x, this._y, this._z];
            };
            Vector3.prototype.getDistanceTo = function (point) {
                return Math.sqrt(Math.abs(Math.pow(this._x - point._x, 2) +
                    Math.pow(this._y - point._y, 2) +
                    Math.pow(this._z - point._z, 2)));
            };
            Object.defineProperty(Vector3.prototype, "x", {
                get: function () {
                    return this._x;
                },
                set: function (value) {
                    if (typeof value === 'number')
                        this._x = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Vector3.prototype, "y", {
                get: function () {
                    return this._y;
                },
                set: function (value) {
                    if (typeof value === 'number')
                        this._y = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Vector3.prototype, "z", {
                get: function () {
                    return this._z;
                },
                set: function (value) {
                    if (typeof value === 'number')
                        this._z = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Vector3.prototype, "r", {
                get: function () {
                    return this._x;
                },
                set: function (value) {
                    if (typeof value === 'number')
                        this._x = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Vector3.prototype, "g", {
                get: function () {
                    return this._y;
                },
                set: function (value) {
                    if (typeof value === 'number')
                        this._y = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Vector3.prototype, "b", {
                get: function () {
                    return this._z;
                },
                set: function (value) {
                    if (typeof value === 'number')
                        this._z = value;
                },
                enumerable: true,
                configurable: true
            });
            return Vector3;
        })();
        Types.Vector3 = Vector3;
    })(Types = WebGLEngine.Types || (WebGLEngine.Types = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Types;
    (function (Types) {
        var Material = (function () {
            function Material() {
                this.texture = null;
                this.image = null;
                this.diffuseColor = new Types.Vector3(1, 0, 1);
                this.specular = 0;
                this.imageLink = '';
                this.ready = true;
                this.texture = null;
                this.textureRepeat = Material.RepeatTypes.CLAMP_TO_EDGE;
                this._loadingImage = null;
                this._callback = null;
                Material._pool.add(this);
            }
            Object.defineProperty(Material, "pool", {
                get: function () {
                    return this._pool;
                },
                enumerable: true,
                configurable: true
            });
            Material.prototype.callback = function (callback) {
                this._callback = callback;
                if (this.ready) {
                    callback.apply();
                }
            };
            Material.prototype.loadTexture = function (gl, path, textureRepeat) {
                if (typeof gl !== 'object') {
                    WebGLEngine.Console.error('GL parameter is not a object');
                    return;
                }
                if (typeof path !== 'string') {
                    WebGLEngine.Console.error('Texture path parameter is not a string');
                    return;
                }
                if (typeof textureRepeat === 'string') {
                    this.textureRepeat = textureRepeat;
                }
                if (!this.image) {
                    this.ready = false;
                    this.texture = gl.createTexture();
                }
                this.imageLink = path;
                this._loadingImage = new Image();
                this._loadingImage.onload = WebGLEngine.Utils.bind(this._createTexture, this, gl);
                this._loadingImage.src = path;
            };
            Material.prototype._createTexture = function () {
                var gl = arguments[arguments.length - 1];
                this.image = this._loadingImage;
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[this.textureRepeat]);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[this.textureRepeat]);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                // TODO : better use LINEAR_MIPMAP_NEAREST
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
                gl.bindTexture(gl.TEXTURE_2D, null);
                this.ready = true;
                if (this._callback) {
                    this._callback.apply();
                }
            };
            Material.RepeatTypes = {
                REPEAT: 'REPEAT',
                MIRRORED_REPEAT: 'MIRRORED_REPEAT',
                CLAMP_TO_EDGE: 'CLAMP_TO_EDGE',
                CLAMP_TO_BORDER: 'CLAMP_TO_BORDER'
            };
            Material._pool = new Types.Pool();
            return Material;
        })();
        Types.Material = Material;
    })(Types = WebGLEngine.Types || (WebGLEngine.Types = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Types;
    (function (Types) {
        var Frame = (function () {
            function Frame() {
                this._position = null;
            }
            Frame.prototype.setPosition = function (position) {
                if (position instanceof Types.Vector3) {
                    this._position = position;
                }
                else {
                    WebGLEngine.Console.error('>>> Frame:setPosition() : position is not instance of Vector3');
                }
                return this;
            };
            Frame.prototype.getPosition = function () {
                return this._position;
            };
            Frame.prototype.setRotation = function (rotation) {
                if (rotation instanceof Types.Vector3) {
                    this._rotation = rotation;
                }
                else {
                    WebGLEngine.Console.log('>>> Frame:setRotation() : rotation is not instance of Vector3');
                }
                return this;
            };
            Frame.prototype.getRotation = function () {
                return this._rotation;
            };
            Frame.prototype.setTime = function (time) {
                if (typeof time === 'number') {
                    this._time = time;
                }
                return this;
            };
            Frame.prototype.getTime = function () {
                return this._time;
            };
            return Frame;
        })();
        Types.Frame = Frame;
    })(Types = WebGLEngine.Types || (WebGLEngine.Types = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Types;
    (function (Types) {
        var AnimationTarget = (function () {
            function AnimationTarget(mesh) {
                if (mesh instanceof Types.Transformations) {
                    this._startTime = 0;
                    this._pausedTime = 0;
                    this._mesh = mesh;
                    this._frameIndex = 0;
                }
                else {
                    WebGLEngine.Console.error('>>> AnimationTarget:constructor() : mesh isn\'t instance of Transformations()');
                }
            }
            AnimationTarget.prototype.start = function (callback) {
                this._startTime = Date.now();
                if (callback instanceof WebGLEngine.Utils.Callback) {
                    this._isPaused = false;
                    this._callback = callback;
                }
                else {
                    this._callback = new WebGLEngine.Utils.Callback(function () {
                    }, {});
                }
            };
            AnimationTarget.prototype.pause = function () {
                if (!this._isPaused) {
                    this._isPaused = true;
                    this._pausedTime = Date.now();
                }
            };
            AnimationTarget.prototype.resume = function () {
                if (this._isPaused) {
                    this._isPaused = false;
                    this._startTime += Date.now() - this._pausedTime;
                }
            };
            AnimationTarget.prototype.isPaused = function () {
                return this._isPaused;
            };
            AnimationTarget.prototype.nextFrame = function () {
                return ++this._frameIndex;
            };
            AnimationTarget.prototype.shiftStartTime = function (time) {
                this._startTime += time;
            };
            AnimationTarget.prototype.callback = function () {
                this._callback.apply();
            };
            AnimationTarget.prototype.saveTransformation = function () {
                this._reservedTransformation = this._mesh.cloneTransformations();
            };
            AnimationTarget.prototype.revertTransformation = function () {
                this._mesh.copyFrom(this._reservedTransformation);
            };
            AnimationTarget.prototype.getFrameIndex = function () {
                return this._frameIndex;
            };
            AnimationTarget.prototype.getTransformable = function () {
                return this._mesh;
            };
            AnimationTarget.prototype.getStartTime = function () {
                return this._startTime;
            };
            return AnimationTarget;
        })();
        Types.AnimationTarget = AnimationTarget;
    })(Types = WebGLEngine.Types || (WebGLEngine.Types = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    var Types;
    (function (Types) {
        var Animation = (function () {
            // TODO : add separated animation support
            function Animation(type, initialFrame, frames) {
                this._type = type;
                this._initialFrame = initialFrame;
                this._frames = [];
                this._targets = [];
                if (frames instanceof Array) {
                    for (var i = 0; i < frames.length; i++) {
                        if (frames[i] instanceof Types.Frame) {
                            this._frames.push(frames[i]);
                        }
                    }
                }
                this.turnOn();
            }
            Object.defineProperty(Animation, "pool", {
                get: function () {
                    return this._pool;
                },
                enumerable: true,
                configurable: true
            });
            Animation.prototype.start = function (transformable, callback) {
                var target = new Types.AnimationTarget(transformable), i;
                target.start(callback);
                for (i = 0; i < this._targets.length; i++) {
                    if (this._targets[i].getTransformable() === transformable) {
                        this._targets.splice(i, 1);
                        i--;
                    }
                }
                this._targets.push(target);
            };
            /** Do updates before render */
            Animation.prototype.updateBeforeRender = function () {
                this._update();
            };
            /** Do updated after render */
            Animation.prototype.updateAfterRender = function () {
                var i;
                if (this._type === Animation.Types.WITHOUT_CHANGES) {
                    for (i = 0; i < this._targets.length; i++) {
                        this._targets[i].revertTransformation();
                    }
                }
            };
            Animation.prototype.setTimeByDistance = function (time) {
                var length, totalLength = 0, frame, nextFrame, sectorsLength = [], i;
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
                    WebGLEngine.Console.error('>>> Animation:setTimeByDistance() : time should be a positive number');
                }
            };
            Animation.prototype.pause = function (transformable) {
                for (var i = 0; i < this._targets.length; i++) {
                    if (this._targets[i].getTransformable() === transformable) {
                        this._targets[i].pause();
                        break;
                    }
                }
            };
            Animation.prototype.resume = function (transformable) {
                for (var i = 0; i < this._targets.length; i++) {
                    if (this._targets[i].getTransformable() === transformable) {
                        this._targets[i].resume();
                        break;
                    }
                }
            };
            /** Adds animation to general animations pool
             * Removes true if animation was added, otherwise false */
            Animation.prototype.turnOn = function () {
                for (var i = 0; i < this._targets.length; i++) {
                    this._targets[i].resume();
                }
                return Animation._pool.add(this);
            };
            /** Removes animation from general animations pool
             * Removes true if animation was removed, otherwise false */
            Animation.prototype.turnOff = function () {
                for (var i = 0; i < this._targets.length; i++) {
                    this._targets[i].pause();
                }
                return Animation._pool.remove(this);
            };
            Animation.prototype._update = function () {
                var elapsedTime, frameIndex, targetRemoved, target, i;
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
                    } while (elapsedTime >= this._frames[frameIndex].getTime());
                }
            };
            Animation.prototype._updateTarget = function (target, frameIndex, percents) {
                var frame, previousFrame = frameIndex > 0 ? this._frames[frameIndex - 1] : this._initialFrame, mesh, vector;
                frame = this._frames[frameIndex];
                mesh = target.getTransformable();
                if (frame.getPosition()) {
                    vector = frame.getPosition().clone();
                    vector.minus(previousFrame.getPosition());
                    //- previousFrame.getPosition()
                    vector.multiply(percents);
                    vector.plus(previousFrame.getPosition());
                    mesh.position = vector;
                }
                if (frame.getRotation()) {
                    vector = frame.getRotation().clone();
                    vector.minus(previousFrame.getRotation());
                    //- previousFrame.getPosition()
                    vector.multiply(percents);
                    vector.plus(previousFrame.getRotation());
                    mesh.rotation = vector;
                }
            };
            Animation.Types = {
                WITH_CHANGES: 0,
                WITHOUT_CHANGES: 1
            };
            Animation._pool = new Types.Pool();
            return Animation;
        })();
        Types.Animation = Animation;
    })(Types = WebGLEngine.Types || (WebGLEngine.Types = {}));
})(WebGLEngine || (WebGLEngine = {}));
var WebGLEngine;
(function (WebGLEngine) {
    WebGLEngine.Config = {
        version: '0.2',
        html: {
            canvasID: 'webGLCanvas'
        },
        File: {
            obj: {
                lineSeparator: /(\r\n|\n|\r)/g,
                nodeSeparator: /\s+/g,
                lineTypes: {
                    MATERIAL_LIBRARY: 'mtllib',
                    USE_MATERIAL: 'usemtl',
                    FACE: 'f',
                    VERTEX: 'v',
                    VERTEX_TEXTURE: 'vt',
                    VERTEX_NORMAL: 'vn'
                }
            },
            mtl: {
                lineSeparator: /(\r\n|\n|\r)/g,
                nodeSeparator: /\s+/g,
                lineTypes: {
                    NEW_MATERIAL: 'newmtl',
                    MAP_TEXTURE: 'map_kd',
                    DIFFUSE_COLOR: 'kd',
                    SPECULAR: 'ns'
                }
            }
        }
    };
})(WebGLEngine || (WebGLEngine = {}));
///<reference path="./classes/utils/Utils.ts"/>
///<reference path="./classes/common/Pool.ts"/>
///<reference path="./classes/common/Matrix.ts"/>
///<reference path="./classes/common/Transformations.ts"/>
///<reference path="./classes/common/LinkedTransformations.ts"/>
///<reference path="./classes/mesh/Mesh.ts"/>
///<reference path="./classes/Light.ts"/>
///<reference path="./classes/Shader.ts"/>
///<reference path="./classes/Camera.ts"/>
///<reference path="./classes/Subscribe.ts"/>
///<reference path="./classes/Render.ts"/>
///<reference path="./classes/Controller.ts"/>
///<reference path="./classes/common/Vector3.ts"/>
///<reference path="./classes/mesh/Material.ts"/>
///<reference path="./classes/animation/Frame.ts"/>
///<reference path="./classes/animation/AnimationTarget.ts"/>
///<reference path="./classes/animation/Animation.ts"/>
///<reference path="config.ts"/>
var WebGLEngine;
(function (WebGLEngine) {
    WebGLEngine.Console = new WebGLEngine.Utils.Console();
    var Engine = (function () {
        function Engine(fragmentShaderPath, vertexShaderPath) {
            WebGLEngine.Console.log('Start webGL initialization.');
            this._gl = null;
            this._isReady = false;
            this._shader = null;
            this._inited = false;
            this._canvasNode = null;
            this._mvMatrix = WebGLEngine.Utils.GLMatrix.mat4.create(undefined);
            this._pMatrix = WebGLEngine.Utils.GLMatrix.mat4.create(undefined);
            this._mvMatrixStack = [];
            this._camera = new WebGLEngine.Types.Camera();
            this._render = new WebGLEngine.Types.Render(this);
            this._controller = new WebGLEngine.Types.Controller(this);
            this._meshes = [];
            this._lights = [];
            this._shaderProgram = null;
            this._isLightingEnable = true;
            window.addEventListener('resize', WebGLEngine.Utils.bind(this.onResize, this), false);
            this._createCanvas();
            this._initGL();
            this._loadShaders(fragmentShaderPath, vertexShaderPath);
        }
        Engine.getCanvas = function () {
            return document.getElementById(WebGLEngine.Config.html.canvasID);
        };
        Object.defineProperty(Engine.prototype, "Render", {
            get: function () {
                return this._render;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Engine.prototype, "Controller", {
            get: function () {
                return this._controller;
            },
            enumerable: true,
            configurable: true
        });
        Engine.prototype.beginDraw = function () {
            this._gl.viewport(0, 0, this._gl.viewportWidth, this._gl.viewportHeight);
            this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
            WebGLEngine.Utils.GLMatrix.mat4.perspective(45, this._gl.viewportWidth / this._gl.viewportHeight, 1, 1000000.0, this._pMatrix);
            WebGLEngine.Utils.GLMatrix.mat4.identity(this._mvMatrix);
            // set camera position
            //Utils.GLMatrix.mat4.rotateX(this._mvMatrix, -this._camera.rotation.x);
            //Utils.GLMatrix.mat4.rotateY(this._mvMatrix, -this._camera.rotation.y);
            //Utils.GLMatrix.mat4.rotateZ(this._mvMatrix, -this._camera.rotation.z);
            //Utils.GLMatrix.mat4.translate(this._mvMatrix, this._camera.position.clone().invertSign().getArray());
            //noinspection ConstantIfStatementJS
            if (false) {
                this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);
                this._gl.enable(this._gl.BLEND);
                this._gl.disable(this._gl.DEPTH_TEST);
            }
            else {
                this._gl.disable(this._gl.BLEND);
                this._gl.enable(this._gl.DEPTH_TEST);
            }
        };
        Engine.prototype.isReady = function () {
            return this._isReady;
        };
        // TODO : add draw for LinkedTransformations
        Engine.prototype.draw = function (mesh) {
            var bufferBoxes, vertexIndexBuffers, vertexPositionBuffer, vertexNormalBuffer, vertexColorBuffer, vertexTextureBuffer, normalMatrix3, normalMatrix4, bufferBoxes, meshMaterial, i, j, material;
            if (!(mesh instanceof WebGLEngine.Types.Mesh) || !mesh.isReady()) {
                return;
            }
            this._mvPushMatrix();
            // apply matrix mesh
            WebGLEngine.Utils.GLMatrix.mat4.multiply(this._camera.getMatrix(), mesh.getMatrix(), this._mvMatrix);
            bufferBoxes = mesh.getBufferBoxes();
            for (j = 0; j < bufferBoxes.length; j++) {
                vertexIndexBuffers = bufferBoxes[j].getVertexIndexBuffers();
                vertexPositionBuffer = bufferBoxes[j].getVertexPositionBuffer();
                vertexNormalBuffer = bufferBoxes[j].getVertexNormalBuffer();
                vertexColorBuffer = bufferBoxes[j].getVertexColorBuffer();
                vertexTextureBuffer = bufferBoxes[j].getVertexTextureBuffer();
                this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexPositionBuffer);
                this._gl.vertexAttribPointer(this._shaderProgram.vertexPositionAttribute, vertexPositionBuffer.itemSize, this._gl.FLOAT, false, 0, 0);
                this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexNormalBuffer);
                this._gl.vertexAttribPointer(this._shaderProgram.vertexNormalAttribute, vertexNormalBuffer.itemSize, this._gl.FLOAT, false, 0, 0);
                this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexColorBuffer);
                this._gl.vertexAttribPointer(this._shaderProgram.vertexColorAttribute, vertexColorBuffer.itemSize, this._gl.FLOAT, false, 0, 0);
                for (material in vertexIndexBuffers) {
                    if (vertexIndexBuffers.hasOwnProperty(material)) {
                        meshMaterial = mesh.getMaterials()[vertexIndexBuffers[material].material];
                        if (!meshMaterial.ready)
                            continue;
                        // set texture if it has material, texture and texture already loaded
                        if (material !== WebGLEngine.Types.Mesh.defaultMaterialName && meshMaterial.texture) {
                            this._gl.enableVertexAttribArray(this._shaderProgram.textureCoordAttribute);
                            this._gl.uniform1i(this._shaderProgram.textureEnabled, 1);
                            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexTextureBuffer);
                            this._gl.vertexAttribPointer(this._shaderProgram.textureCoordAttribute, vertexTextureBuffer.itemSize, this._gl.FLOAT, false, 0, 0);
                            this._gl.activeTexture(this._gl.TEXTURE0);
                            this._gl.bindTexture(this._gl.TEXTURE_2D, meshMaterial.texture);
                            this._gl.uniform1i(this._shaderProgram.samplerUniform, 0);
                        }
                        else {
                            this._gl.disableVertexAttribArray(this._shaderProgram.textureCoordAttribute);
                            this._gl.uniform1i(this._shaderProgram.textureEnabled, 0);
                        }
                        this._gl.uniform1i(this._shaderProgram.useLightingUniform, Number(this._isLightingEnable));
                        if (this._isLightingEnable) {
                            var lightEnables = [], directions = [], colors = [], distances = [], direction, color;
                            for (i = 0; i < this._lights.length; i++) {
                                direction = this._lights[i].direction;
                                color = this._lights[i].color;
                                lightEnables.push(this._lights[i].isEnabled());
                                directions.push(direction.x);
                                directions.push(direction.y);
                                directions.push(direction.z);
                                colors.push(color.r);
                                colors.push(color.g);
                                colors.push(color.b);
                                distances.push(this._lights[i].distance);
                            }
                            this._gl.uniform1fv(this._shaderProgram.lightingDistanceUniform, distances);
                            this._gl.uniform3fv(this._shaderProgram.lightColorUniform, colors);
                            this._gl.uniform3fv(this._shaderProgram.lightingDirectionUniform, directions);
                            this._gl.uniform1f(this._shaderProgram.materialSpecular, meshMaterial.specular);
                        }
                        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffers[material].buffer);
                        // TODO : fix light by changing mesh matrix
                        this._gl.uniformMatrix4fv(this._shaderProgram.pMatrixUniform, false, this._pMatrix);
                        this._gl.uniformMatrix4fv(this._shaderProgram.mvMatrixUniform, false, this._mvMatrix);
                        normalMatrix4 = mesh.getMatrix(WebGLEngine.Types.Matrix.transformToMatrixTypes.WITHOUT_SCALE);
                        normalMatrix3 = WebGLEngine.Utils.GLMatrix.mat4.toMat3(normalMatrix4, WebGLEngine.Utils.GLMatrix.mat3.create());
                        this._gl.uniformMatrix3fv(this._shaderProgram.nMatrixUniform, false, normalMatrix3);
                        this._gl.drawElements(this._gl.TRIANGLES, vertexIndexBuffers[material].buffer.numItems, this._gl.UNSIGNED_SHORT, 0);
                    }
                }
            }
            this._mvPopMatrix();
        };
        Engine.prototype.addLight = function (light) {
            this._lights.push(light);
        };
        Engine.prototype.turnOnLight = function () {
            var changed = false;
            if (!this._isLightingEnable) {
                this._isLightingEnable = true;
                changed = false;
            }
            return changed;
        };
        Engine.prototype.turnOffLight = function () {
            var changed = false;
            if (this._isLightingEnable) {
                this._isLightingEnable = false;
                changed = true;
            }
            return changed;
        };
        Engine.prototype.onResize = function () {
            if (this._inited) {
                this._canvasNode.setAttribute('width', window.innerWidth + 'px');
                this._canvasNode.setAttribute('height', window.innerHeight + 'px');
                this._gl.viewportWidth = window.innerWidth;
                this._gl.viewportHeight = window.innerHeight;
            }
        };
        Engine.prototype.createMesh = function (vertexes, textures, normals, faces, materials) {
            var mesh = new WebGLEngine.Types.Mesh(this._gl);
            mesh.fillBuffers(vertexes, textures, normals, faces, materials);
            mesh.initBuffers();
            this._meshes.push(mesh);
            return mesh;
        };
        Engine.prototype.createMeshFromFile = function (path, params) {
            var mesh = new WebGLEngine.Types.Mesh(this._gl), parameters = {
                textureRepeat: true
            };
            WebGLEngine.Console.log('Start loading mesh => "' + WebGLEngine.Utils.getFileNameFromPath(path) + '"');
            this._meshes.push(mesh);
            if (typeof params === 'object') {
                if (typeof params.textureRepeat === 'string') {
                    parameters.textureRepeat = params.textureRepeat;
                }
            }
            WebGLEngine.Utils.requestManager.request(path, new WebGLEngine.Utils.Callback(this._parseObjFile, this, mesh, path, parameters));
            return mesh;
        };
        Engine.prototype.getCamera = function () {
            return this._camera;
        };
        Engine.prototype.getGLInstance = function () {
            return this._gl;
        };
        Engine.prototype._applyTransformations = function (matrix, object) {
            WebGLEngine.Utils.GLMatrix.mat4.translate(matrix, object.position.getArray());
            WebGLEngine.Utils.GLMatrix.mat4.rotateZ(matrix, object.rotation.z);
            WebGLEngine.Utils.GLMatrix.mat4.rotateY(matrix, object.rotation.y);
            WebGLEngine.Utils.GLMatrix.mat4.rotateX(matrix, object.rotation.x);
            if (matrix === this._mvMatrix) {
                WebGLEngine.Utils.GLMatrix.mat4.scale(matrix, object.scale.getArray());
            }
        };
        Engine.prototype._createCanvas = function () {
            this._canvasNode = document.getElementById(WebGLEngine.Config.html.canvasID);
            if (this._canvasNode === null) {
                this._canvasNode = document.createElement('canvas');
                this._canvasNode.id = WebGLEngine.Config.html.canvasID;
                this._canvasNode.style.position = 'fixed';
                this._canvasNode.style.left = '0px';
                this._canvasNode.style.top = '0px';
                document.body.appendChild(this._canvasNode);
            }
        };
        Engine.prototype._initGL = function () {
            try {
                this._gl = this._canvasNode.getContext("webgl") || this._canvasNode.getContext("experimental-webgl");
                this._inited = true;
                this.onResize();
            }
            catch (e) {
            }
            if (!this._gl) {
                WebGLEngine.Console.error("Could not initialise WebGL, sorry :-(");
            }
        };
        Engine.prototype._loadShaders = function (fragmentShaderPath, vertexShaderPath) {
            this._shader = new WebGLEngine.Types.Shader(this._gl);
            WebGLEngine.Console.log('Start shaders loading.');
            this._isReady = false;
            this._shader.add(new WebGLEngine.Utils.Callback(this._initShaders, this), fragmentShaderPath, vertexShaderPath);
        };
        Engine.prototype._initShaders = function () {
            var fragmentShader = this._shader.getFragmentShader();
            var vertexShader = this._shader.getVertexShader();
            this._shaderProgram = this._gl.createProgram();
            //		console.log('test: ' + typeof this._shader);
            this._gl.attachShader(this._shaderProgram, vertexShader);
            this._gl.attachShader(this._shaderProgram, fragmentShader);
            this._gl.linkProgram(this._shaderProgram);
            if (!this._gl.getProgramParameter(this._shaderProgram, this._gl.LINK_STATUS)) {
                WebGLEngine.Console.error("Could not initialise shaders");
            }
            this._gl.useProgram(this._shaderProgram);
            this._shaderProgram.vertexPositionAttribute = this._gl.getAttribLocation(this._shaderProgram, "aVertexPosition");
            this._gl.enableVertexAttribArray(this._shaderProgram.vertexPositionAttribute);
            this._shaderProgram.vertexNormalAttribute = this._gl.getAttribLocation(this._shaderProgram, "aVertexNormal");
            this._gl.enableVertexAttribArray(this._shaderProgram.vertexNormalAttribute);
            this._shaderProgram.vertexColorAttribute = this._gl.getAttribLocation(this._shaderProgram, "aVertexColor");
            this._gl.enableVertexAttribArray(this._shaderProgram.vertexColorAttribute);
            this._shaderProgram.textureCoordAttribute = this._gl.getAttribLocation(this._shaderProgram, "aTextureCoord");
            this._gl.enableVertexAttribArray(this._shaderProgram.textureCoordAttribute);
            this._shaderProgram.pMatrixUniform = this._gl.getUniformLocation(this._shaderProgram, "uPMatrix");
            this._shaderProgram.mvMatrixUniform = this._gl.getUniformLocation(this._shaderProgram, "uMVMatrix");
            this._shaderProgram.nMatrixUniform = this._gl.getUniformLocation(this._shaderProgram, "uNMatrix");
            this._shaderProgram.samplerUniform = this._gl.getUniformLocation(this._shaderProgram, "uSampler");
            this._shaderProgram.useLightingUniform = this._gl.getUniformLocation(this._shaderProgram, "uUseLighting");
            this._shaderProgram.useLightUniform = this._gl.getUniformLocation(this._shaderProgram, "uUseLight");
            this._shaderProgram.ambientColorUniform = this._gl.getUniformLocation(this._shaderProgram, "uAmbientColor");
            this._shaderProgram.lightingDirectionUniform = this._gl.getUniformLocation(this._shaderProgram, "uLightDirection");
            this._shaderProgram.lightColorUniform = this._gl.getUniformLocation(this._shaderProgram, "uLightColor");
            this._shaderProgram.lightingDistanceUniform = this._gl.getUniformLocation(this._shaderProgram, "uLightDistance");
            this._shaderProgram.textureEnabled = this._gl.getUniformLocation(this._shaderProgram, "uUseTexture");
            this._shaderProgram.materialSpecular = this._gl.getUniformLocation(this._shaderProgram, "uMaterialSpecular");
            this._gl.enable(this._gl.DEPTH_TEST);
            this._isReady = true;
        };
        Engine.prototype._mvPushMatrix = function () {
            var copy = WebGLEngine.Utils.GLMatrix.mat4.create(undefined);
            WebGLEngine.Utils.GLMatrix.mat4.set(this._mvMatrix, copy);
            this._mvMatrixStack.push(copy);
        };
        Engine.prototype._mvPopMatrix = function () {
            if (this._mvMatrixStack.length == 0) {
                throw "Invalid popMatrix!";
            }
            this._mvMatrix = this._mvMatrixStack.pop();
        };
        Engine.prototype._parseObjFile = function (objFile, url, mesh, path, parameters) {
            var i, j, nodes, vertexes = [], textures = [], normals = [], faces = [], materials = {}, currentMaterial = WebGLEngine.Types.Mesh.defaultMaterialName, objConfig = WebGLEngine.Config.File.obj, lineTypes = objConfig.lineTypes, startParsingTime = Date.now(), totalFaceCounter = 0, vertexCounter, hasMaterial = false, objList, materialPath;
            WebGLEngine.Console.log('Start parsing mesh => "' + WebGLEngine.Utils.getFileNameFromPath(path) + '"');
            mesh.callback(new WebGLEngine.Utils.Callback(this._checkMeshes, this));
            materials[currentMaterial] = new WebGLEngine.Types.Material();
            faces[currentMaterial] = [];
            objConfig.lineSeparator.lastIndex = 0;
            objList = objFile.split(objConfig.lineSeparator);
            for (i = 0; i < objList.length; i++) {
                objConfig.nodeSeparator.lastIndex = 0;
                nodes = objList[i].split(objConfig.nodeSeparator);
                switch (nodes[0].toLowerCase()) {
                    case lineTypes.VERTEX:
                        for (j = 1; j < 4; j++) {
                            vertexes.push(Number(nodes[j]));
                        }
                        if (nodes.length !== 4) {
                            WebGLEngine.Console.error('\t_parseObjFile() : wrong parameters amount in vertex, should be 3');
                        }
                        break;
                    case lineTypes.VERTEX_TEXTURE:
                        textures.push(Number(nodes[1]));
                        textures.push(Number(nodes[2]));
                        //textures.push(Number(Math.random());
                        //textures.push(Number(Math.random());
                        break;
                    case lineTypes.VERTEX_NORMAL:
                        for (j = 1; j < nodes.length; j++) {
                            if (nodes[j] === '')
                                continue;
                            normals.push(Number(nodes[j]));
                        }
                        break;
                    case lineTypes.FACE:
                        var lastFace = null, firstFace = null, faceArray, vertex, face = new WebGLEngine.Types.Face();
                        for (j = 1; j < nodes.length && isNaN(nodes[j]); j++) {
                            faceArray = nodes[j].split('/');
                            if (isNaN(faceArray[0]))
                                break;
                            vertex = new WebGLEngine.Types.Vertex(Number(faceArray[0]) - 1, faceArray.length > 1 && faceArray[1] !== '' ? Number(faceArray[1]) - 1 : null, faceArray.length > 2 && faceArray[2] !== '' ? Number(faceArray[2]) - 1 : null);
                            if (faceArray.length < 2) {
                                WebGLEngine.Console.warning('\t_parseObjFile : There is no texture coordinate');
                            }
                            if (j >= 4) {
                                face = new WebGLEngine.Types.Face();
                                face.vertexes[0] = firstFace;
                                face.vertexes[1] = lastFace;
                                face.vertexes[2] = vertex;
                            }
                            else {
                                face.vertexes[j - 1] = vertex;
                            }
                            if (j >= 3) {
                                faces[currentMaterial].push(face);
                            }
                            if (j === 1) {
                                firstFace = vertex;
                            }
                            lastFace = vertex;
                        }
                        totalFaceCounter++;
                        if (j > 4) {
                        }
                        break;
                    case lineTypes.MATERIAL_LIBRARY:
                        hasMaterial = true;
                        materialPath = path.substring(0, path.lastIndexOf("/") + 1) + nodes[1];
                        WebGLEngine.Utils.requestManager.request(materialPath, new WebGLEngine.Utils.Callback(this._parseMaterial, this, materialPath, mesh, parameters));
                        break;
                    case lineTypes.USE_MATERIAL:
                        if (!materials.hasOwnProperty(nodes[1])) {
                            materials[nodes[1]] = new WebGLEngine.Types.Material();
                            faces[nodes[1]] = [];
                        }
                        currentMaterial = nodes[1];
                        break;
                }
            }
            WebGLEngine.Console.log('\tdone =>' +
                ' Parse time: ' + (Date.now() - startParsingTime) + 'ms' +
                ' | F: ' + totalFaceCounter +
                ' | V: ' + vertexes.length / 3 +
                ' | VT: ' + textures.length +
                ' | N: ' + normals.length / 3);
            mesh.fillBuffers(vertexes, textures, normals, faces, materials);
            if (!hasMaterial) {
                mesh.initBuffers();
            }
        };
        Engine.prototype._parseMaterial = function (mtlFile, url, path, mesh, parameters) {
            var mtlList, i, j, nodes, material, mtlConfig = WebGLEngine.Config.File.mtl, lineTypes = mtlConfig.lineTypes, allMaterials = {}, currentMaterial = null;
            WebGLEngine.Console.log('Start parsing material => "' + WebGLEngine.Utils.getFileNameFromPath(path) + '"');
            mtlConfig.lineSeparator.lastIndex = 0;
            mtlList = mtlFile.split(mtlConfig.lineSeparator);
            for (i = 0; i < mtlList.length; i++) {
                mtlConfig.nodeSeparator.lastIndex = 0;
                nodes = mtlList[i].split(mtlConfig.nodeSeparator);
                // remove leading spaces and tabs
                for (j = 0; j < nodes.length; j++) {
                    if (nodes[j] === '' || nodes[j] === '\t') {
                        nodes.shift();
                        j--;
                    }
                    else {
                        break;
                    }
                }
                if (nodes.length > 0) {
                    switch (nodes[0].toLowerCase()) {
                        case lineTypes.NEW_MATERIAL:
                            material = new WebGLEngine.Types.Material();
                            allMaterials[nodes[1]] = material;
                            currentMaterial = material;
                            break;
                        case lineTypes.MAP_TEXTURE:
                            if (currentMaterial) {
                                //path = path.replace(/\\/g, '/');
                                currentMaterial.loadTexture(this._gl, (path.substring(0, path.lastIndexOf("/") + 1) + nodes[1]), parameters.textureRepeat);
                            }
                            break;
                        case lineTypes.DIFFUSE_COLOR:
                            var color = new WebGLEngine.Types.Vector3(), colors = [];
                            for (j = 1; j < nodes.length && colors.length < 3; j++) {
                                if (nodes[j] === '')
                                    continue;
                                colors.push(Number(nodes[j]));
                                if (colors.length === 3) {
                                    currentMaterial.diffuseColor = color.set(colors[0], colors[1], colors[2]);
                                    break;
                                }
                            }
                            if (colors.length !== 3) {
                                WebGLEngine.Console.error('>>> _parseMaterial() : color.length !== 3');
                            }
                            break;
                        case lineTypes.SPECULAR:
                            //				case 'Tr':
                            for (j = 1; j < nodes.length; j++) {
                                if (!isNaN(nodes[j])) {
                                    currentMaterial.specular = Number(nodes[j]);
                                    break;
                                }
                            }
                            break;
                    }
                }
            }
            WebGLEngine.Console.log('\tdone');
            mesh.initBuffers(allMaterials);
        };
        Engine.prototype._checkMeshes = function () {
            var i, allMeshesLoaded = true;
            for (i = 0; i < this._meshes.length; i++) {
                if (!this._meshes[i].isReady()) {
                    //console.log(i);
                    allMeshesLoaded = false;
                    break;
                }
            }
            this._controller.sendEvent(WebGLEngine.Types.Controller.Events.MESH_LOADED);
            if (allMeshesLoaded) {
                this._controller.sendEvent(WebGLEngine.Types.Controller.Events.ALL_MESHES_LOADED);
            }
        };
        return Engine;
    })();
    WebGLEngine.Engine = Engine;
})(WebGLEngine || (WebGLEngine = {}));
var Example;
(function (Example) {
    var Cars;
    (function (Cars) {
        Cars.SimpleVehicle = {
            size: new WebGLEngine.Types.Vector3(4, 4, 12),
            maxControlWheelAngle: Math.PI / 4,
            wheelAngleCoefficientPerStep: 1 / Example.Config.engine.FPS,
            bridges: [
                {
                    position: new WebGLEngine.Types.Vector3(0, 0, -5.5),
                    wheel: 'simpleCarWheel',
                    width: 4,
                    control: true,
                    drive: false
                },
                {
                    position: new WebGLEngine.Types.Vector3(0, 0, -4),
                    wheel: 'simpleCarWheel',
                    width: 4,
                    control: true,
                    drive: false
                },
                {
                    position: new WebGLEngine.Types.Vector3(0, 0, 4),
                    wheel: 'simpleCarWheel',
                    width: 4,
                    control: false,
                    drive: true
                },
                {
                    position: new WebGLEngine.Types.Vector3(0, 0, 5),
                    wheel: 'simpleCarWheel',
                    width: 4,
                    control: false,
                    drive: true
                }
            ]
        };
    })(Cars = Example.Cars || (Example.Cars = {}));
})(Example || (Example = {}));
var Example;
(function (Example) {
    var VehicleAxle = (function () {
        function VehicleAxle(position, width, wheel) {
            this.position = position.clone();
            this.leftWheel = wheel.transformationClone();
            this.rightWheel = wheel.transformationClone();
            this.controlCoefficient = 0;
            this.width = width;
            this.drive = false;
            this.control = false;
            this._setupWheels();
        }
        VehicleAxle.prototype._setupWheels = function () {
            this.leftWheel.position.copyFrom(this.position);
            this.rightWheel.position.copyFrom(this.position);
            this.rightWheel.rotation.y += Math.PI;
            this.leftWheel.position.x -= this.width / 2;
            this.rightWheel.position.x += this.width / 2;
        };
        return VehicleAxle;
    })();
    Example.VehicleAxle = VehicleAxle;
})(Example || (Example = {}));
var Example;
(function (Example) {
    var Vehicle = (function (_super) {
        __extends(Vehicle, _super);
        //private _configuration : VehicleConfiguration;
        function Vehicle(configuration) {
            var i, axle, wheel, currentDistance, newDistance, axleConfig;
            _super.call(this);
            //this._configuration = configuration;
            this._wheelAngleCoefficient = 0;
            this._wheelAngleCoefficientPerStep = configuration.wheelAngleCoefficientPerStep;
            this._maxControlWheelAngle = configuration.maxControlWheelAngle;
            this._frontAxles = [];
            this._rearAxles = [];
            this._frontFarthestAxle = null;
            this._rearFarthestAxle = null;
            this._frontControlPoint = new WebGLEngine.Types.Vector3(0, 0, 0);
            this._rearControlPoint = new WebGLEngine.Types.Vector3(0, 0, 0);
            for (i = 0; i < configuration.bridges.length; i++) {
                axleConfig = configuration.bridges[i];
                wheel = Example.meshManager.get(axleConfig.wheel);
                axle = new Example.VehicleAxle(axleConfig.position, axleConfig.width, wheel);
                axle.drive = axleConfig.drive;
                axle.control = axleConfig.control;
                axle.leftWheel.setParent(this);
                axle.rightWheel.setParent(this);
                if (axleConfig.position.z < 0) {
                    this._frontControlPoint.plus(axleConfig.position);
                    this._frontAxles.push(axle);
                }
                else {
                    this._rearControlPoint.plus(axleConfig.position);
                    this._rearAxles.push(axle);
                }
            }
            this._frontControlPoint.divide(this._frontAxles.length);
            this._rearControlPoint.divide(this._rearAxles.length);
            this._calculateAxleControlCoefficients();
        }
        Vehicle.prototype.draw = function (engine) {
            var i, bridge;
            for (i = 0; i < this._frontAxles.length + this._rearAxles.length; i++) {
                bridge = i < this._frontAxles.length ? this._frontAxles[i] : this._rearAxles[i - this._frontAxles.length];
                // TODO : remove animation
                bridge.leftWheel.rotation.x -= 0.02;
                bridge.rightWheel.rotation.x += 0.02;
                engine.draw(bridge.leftWheel);
                engine.draw(bridge.rightWheel);
            }
        };
        Vehicle.prototype.turnLeft = function () {
            this._wheelAngleCoefficient += this._wheelAngleCoefficientPerStep;
            if (this._wheelAngleCoefficient > 1) {
                this._wheelAngleCoefficient = 1;
            }
            this._setWheelAngle(this._wheelAngleCoefficient);
        };
        Vehicle.prototype.turnRight = function () {
            this._wheelAngleCoefficient -= this._wheelAngleCoefficientPerStep;
            if (this._wheelAngleCoefficient < -1) {
                this._wheelAngleCoefficient = -1;
            }
            this._setWheelAngle(this._wheelAngleCoefficient);
        };
        Vehicle.prototype._setWheelAngle = function (coefficient) {
            var i, angle, axle;
            if (coefficient < -1 || coefficient > 1) {
                WebGLEngine.Console.warning('Vehicle._setWheelAngle() coefficient is out of range.\n' +
                    'Should be from -1 to 1');
            }
            else {
                for (i = 0; i < this._frontAxles.length; i++) {
                    axle = this._frontAxles[i];
                    if (axle.control) {
                        angle = this._maxControlWheelAngle * axle.controlCoefficient * coefficient;
                        axle.leftWheel.rotation.y = angle;
                        axle.rightWheel.rotation.y = angle + Math.PI;
                    }
                }
                for (i = 0; i < this._rearAxles.length; i++) {
                    axle = this._rearAxles[i];
                    if (axle.control) {
                        angle = this._maxControlWheelAngle * axle.controlCoefficient * coefficient;
                        axle.leftWheel.rotation.y = -angle;
                        axle.rightWheel.rotation.y = -angle + Math.PI;
                    }
                }
            }
        };
        Vehicle.prototype._calculateAxleControlCoefficients = function () {
            var i, maxFrontDistance = 0, maxRearDistance = 0, frontDistances = [], rearDistances = [], currentDistance, axle;
            // search for max front distance
            for (i = 0; i < this._frontAxles.length; i++) {
                axle = this._frontAxles[i];
                currentDistance = axle.position.getDistanceTo(this.position);
                frontDistances.push(currentDistance);
                if (currentDistance > maxFrontDistance) {
                    maxFrontDistance = currentDistance;
                }
            }
            // search for max rear distance
            for (i = 0; i < this._rearAxles.length; i++) {
                axle = this._rearAxles[i];
                currentDistance = axle.position.getDistanceTo(this.position);
                rearDistances.push(currentDistance);
                if (currentDistance > maxRearDistance) {
                    maxRearDistance = currentDistance;
                }
            }
            // set front coefficients
            for (i = 0; i < this._frontAxles.length; i++) {
                axle = this._frontAxles[i];
                axle.controlCoefficient = frontDistances[i] / maxFrontDistance;
            }
            // set rear coefficients
            for (i = 0; i < this._rearAxles.length; i++) {
                axle = this._rearAxles[i];
                axle.controlCoefficient = rearDistances[i] / maxRearDistance;
            }
        };
        return Vehicle;
    })(WebGLEngine.Types.LinkedTransformations);
    Example.Vehicle = Vehicle;
})(Example || (Example = {}));
var Example;
(function (Example) {
    var MeshManager = (function () {
        function MeshManager() {
            this._meshPool = {};
        }
        MeshManager.prototype.add = function (name, mesh) {
            if (this._meshPool.hasOwnProperty(name)) {
                WebGLEngine.Console.error('MeshManager.add() : mesh with this name already exist');
            }
            else {
                this._meshPool[name] = mesh;
            }
        };
        MeshManager.prototype.remove = function (name) {
            if (this._meshPool.hasOwnProperty(name)) {
                delete this._meshPool[name];
            }
            else {
                WebGLEngine.Console.error('MeshManager.remove() : mesh with this name not found');
            }
        };
        MeshManager.prototype.get = function (name) {
            if (this._meshPool.hasOwnProperty(name)) {
                return this._meshPool[name];
            }
            else {
                WebGLEngine.Console.error('MeshManager.get() : mesh with this name doesn\'t exist');
                return null;
            }
        };
        return MeshManager;
    })();
    Example.MeshManager = MeshManager;
})(Example || (Example = {}));
///<reference path="config.ts"/>
///<reference path="../../source/WebGLEngine.ts"/>
///<reference path="./classes/vehicle/configurations/SimpleVehicle.ts"/>
///<reference path="./classes/vehicle/VehicleConfiguration.ts"/>
///<reference path="./classes/vehicle/VehicleBridge.ts"/>
///<reference path="./classes/vehicle/Vehicle.ts"/>
///<reference path="./classes/MeshManager.ts"/>
var game = null;
var Example;
(function (Example) {
    document.addEventListener('DOMContentLoaded', function () {
        game = new Game();
    }, false);
    Example.meshManager = new Example.MeshManager();
    var Game = (function () {
        function Game() {
            WebGLEngine.Console.create(16, 16, 600, 800, 30);
            this._engine = new WebGLEngine.Engine(Example.Config.webGL.shaders.fragment, Example.Config.webGL.shaders.vertex);
            this._engine.Controller.subscribe(new WebGLEngine.Utils.Callback(this._controllerHandler, this));
            this._camera = this._engine.getCamera();
            this._cameraMode = Game._cameraModes.FLY;
            this._timers = {
                key_a: false,
                key_d: false,
                key_w: false,
                key_s: false,
                key_up: false,
                key_down: false,
                key_left: false,
                key_right: false
            };
            this._meshes = {
                street: this._engine.createMeshFromFile('./resources/environment/street_deoptimized.obj'),
                //street: this._engine.createMeshFromFile('./resources/paris/Paris2010_0.obj', {textureRepeat: WebGLEngine.Types.Material.RepeatTypes.REPEAT}),
                //castle: this._engine.createMeshFromFile('./resources/castle/castle01.obj', {textureRepeat: WebGLEngine.Types.Material.RepeatTypes.REPEAT}),
                sky: this._engine.createMeshFromFile('./resources/world/cubemap.obj'),
                //plane : this._engine.createMeshFromFile('./resources/F14A/F-14A_Tomcat.obj'),
                //wheel : this._engine.createMeshFromFile('./resources/wheel/disk_g.obj', {textureRepeat: WebGLEngine.Types.Material.RepeatTypes.REPEAT}),
                //bus: this._engine.createMeshFromFile('./resources/bus/bus.obj'),
                //car   : this._engine.createMeshFromFile('./resources/crown/crown_victoria.obj'),
                car: this._engine.createMeshFromFile('./resources/BMW_M3/BMW_M3_GTR.obj'),
            };
            Example.meshManager.add('simpleCarWheel', this._meshes.wheel);
            //this._meshes.car = new Vehicle(Cars.SimpleVehicle);
            this._canvas = WebGLEngine.Engine.getCanvas();
            this._mouseHandler = WebGLEngine.Utils.bind(this._updateCameraRotation, this);
            this._configure();
            this._addListeners();
            this._createLights();
            //this._createAnimation();
            //this._startAnimation();
            if (this._engine) {
                this._engine.Render.subscribe(new WebGLEngine.Utils.Callback(this._mainProc, this));
                this._engine.Render.setFPS(Example.Config.engine.FPS);
            }
        }
        Game.prototype._configure = function () {
            this._meshes.sky.scale.set(10000, 10000, 10000);
            //this._meshes.cube.scale.set(20, 20, 20);
            //this._meshes.cube.position.set(0, 20, 0);
            //this._meshes.bus.scale.set(20, 20, 20);
            //this._meshes.castle.scale.set(0.01, 0.01, 0.01);
            //this._meshes.car.scale.set(15, 15, 15);
            this._meshes.car.scale.set(0.002, 0.002, 0.002);
            //this._meshes.wheel.scale.set(10, 10, 10);
            //this._meshes.car.position.set(0, 1, 0);
            this._camera.position.set(138, 83, -111);
            this._camera.rotation.set(-0.49, 2.11, 0);
            this._meshes.street.scale.set(5, 5, 5);
            this._meshes.street.position.set(0, -20, 0);
            //this._meshes.street.scale.set(1, 1, 1);
            //this._meshes.plane.scale.set(0.3, 0.3, 0.3);
            //this._meshes.plane.position.set(70, -10, 0);
        };
        Game.prototype._addListeners = function () {
            this._canvas.addEventListener('mousedown', WebGLEngine.Utils.bind(this._lockCursor, this), false);
            document.addEventListener('keydown', WebGLEngine.Utils.bind(this._keyDown, this), false);
            document.addEventListener('keyup', WebGLEngine.Utils.bind(this._keyUp, this), false);
            if ("onpointerlockchange" in document) {
                document.addEventListener('pointerlockchange', WebGLEngine.Utils.bind(this._releaseCursor, this), false);
            }
            else if ("onmozpointerlockchange" in document) {
                document.addEventListener('mozpointerlockchange', WebGLEngine.Utils.bind(this._releaseCursor, this), false);
            }
            else if ("onwebkitpointerlockchange" in document) {
                document.addEventListener('webkitpointerlockchange', WebGLEngine.Utils.bind(this._releaseCursor, this), false);
            }
        };
        Game.prototype._createLights = function () {
            this._engine.addLight(new WebGLEngine.Types.Light(WebGLEngine.Types.Light.Types.DIRECTIONAL, new WebGLEngine.Types.Vector3(0.5, 0.5, 0.5), new WebGLEngine.Types.Vector3(1, 0.5, 0.25)));
        };
        Game.prototype._mainProc = function () {
            var engine = this._engine;
            this._keysHandler();
            this._updateCameraPosition();
            engine.beginDraw();
            engine.turnOffLight();
            engine.draw(this._meshes.sky);
            //engine.draw(this._meshes.plane);
            //engine.draw(this._meshes.bus);
            //engine.draw(this._meshes.house);
            //engine.draw(this._meshes.cube);
            engine.turnOnLight();
            engine.draw(this._meshes.street);
            engine.draw(this._meshes.car);
            //engine.draw(this._meshes.castle);
            //this._meshes.car.draw(this._engine);
            //engine.draw(this._meshes.sphere);
            //engine.draw(this._meshes.wheel);
            this._meshes.car.rotation.add(0, 0.05, 0);
        };
        Game.prototype._lockCursor = function () {
            document.addEventListener('mousemove', this._mouseHandler, false);
            var canvas = this._canvas;
            canvas.requestPointerLock = canvas.requestPointerLock ||
                canvas.mozRequestPointerLock ||
                canvas.webkitRequestPointerLock;
            canvas.requestPointerLock();
        };
        Game.prototype._releaseCursor = function () {
            var doc = document;
            if (doc.pointerLockElement !== this._canvas &&
                doc.mozPointerLockElement !== this._canvas &&
                doc.webkitPointerLockElement !== this._canvas) {
                doc.removeEventListener('mousemove', this._mouseHandler, false);
            }
        };
        Game.prototype._keysHandler = function () {
            if (this._timers.key_left) {
                this._meshes.car.turnLeft();
            }
            if (this._timers.key_right) {
                this._meshes.car.turnRight();
            }
        };
        Game.prototype._updateCameraRotation = function (e) {
            var x = e.movementX || e.mozMovementX || e.webkitMovementX || 0, y = e.movementY || e.mozMovementY || e.webkitMovementY || 0, sensitivity = Example.Config.camera.mouse.sensitivity;
            this._camera.rotation.add(y / sensitivity, x / sensitivity, 0);
            // look limitation
            if (this._camera.rotation.x > Math.PI / 2) {
                this._camera.rotation.x = Math.PI / 2;
            }
            if (this._camera.rotation.x < -Math.PI / 2) {
                this._camera.rotation.x = -Math.PI / 2;
            }
            // prevent overflow
            this._camera.rotation.y %= Math.PI * 2;
        };
        Game.prototype._updateCameraPosition = function () {
            var staticSpeed, speed, cosX, Y = 0, X = 0, Z = 0;
            staticSpeed = 2;
            cosX = Math.cos(-this._camera.rotation.x);
            speed = staticSpeed;
            if (this._timers.key_w) {
                Y -= Math.sin(-this._camera.rotation.x);
                X += cosX * Math.sin(-this._camera.rotation.y);
                Z += cosX * Math.cos(-this._camera.rotation.y);
            }
            if (this._timers.key_s) {
                Y += Math.sin(-this._camera.rotation.x);
                X -= cosX * Math.sin(-this._camera.rotation.y);
                Z -= cosX * Math.cos(-this._camera.rotation.y);
            }
            if (this._timers.key_a) {
                X -= Math.sin(-this._camera.rotation.y - Math.PI / 2);
                Z -= Math.cos(-this._camera.rotation.y - Math.PI / 2);
            }
            if (this._timers.key_d) {
                X += Math.sin(-this._camera.rotation.y - Math.PI / 2);
                Z += Math.cos(-this._camera.rotation.y - Math.PI / 2);
            }
            this._camera.position.add(X * speed, Y * speed, Z * speed);
            //this._meshes.sky.position.copyFrom(this._camera.position);
        };
        Game.prototype._createAnimation = function () {
            // test animation
            this._animation = new WebGLEngine.Types.Animation(WebGLEngine.Types.Animation.Types.WITH_CHANGES, new WebGLEngine.Types.Frame()
                .setPosition(new WebGLEngine.Types.Vector3(-16.85797848025723, 12.674998062742992, 135.3757210551033))
                .setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + -0.08250000000000035, -1.610796326794911, 0)), [
                new WebGLEngine.Types.Frame()
                    .setPosition(new WebGLEngine.Types.Vector3(136.40451406685602, 5.415755109754397, 133.30897309960255))
                    .setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + 0.04249999999999963, -1.5382963267949123, 0)),
                new WebGLEngine.Types.Frame()
                    .setPosition(new WebGLEngine.Types.Vector3(166.92537377876405, 13.87551154649805, 135.66199169524546))
                    .setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + 0.059999999999999554, -1.158296326794911, 0)),
                new WebGLEngine.Types.Frame()
                    .setPosition(new WebGLEngine.Types.Vector3(176.56004296081076, 22.734961602354524, 125.54120391044728))
                    .setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + 0.07249999999999955, -0.7057963267949127, 0)),
                new WebGLEngine.Types.Frame()
                    .setPosition(new WebGLEngine.Types.Vector3(179.28899592498212, 24.84508806214609, 107.87830239480094))
                    .setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + 0.039999999999999515, -0.07079632679491238, 0)),
                new WebGLEngine.Types.Frame()
                    .setPosition(new WebGLEngine.Types.Vector3(182.96241814113472, 26.42981155369769, 54.02852808470881))
                    .setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + 0.01999999999999952, -0.06329632679491237, 0)),
                new WebGLEngine.Types.Frame()
                    .setPosition(new WebGLEngine.Types.Vector3(135.45437959461776, 16.6388461574058, -4.666124544685863))
                    .setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + -0.1850000000000006, 1.3692036732050852, 0)),
                new WebGLEngine.Types.Frame()
                    .setPosition(new WebGLEngine.Types.Vector3(79.6288098713936, 14.491545215427712, -7.243745352305449))
                    .setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + -0.012500000000000497, 1.551703673205082, 0)),
                new WebGLEngine.Types.Frame()
                    .setPosition(new WebGLEngine.Types.Vector3(18.47103498247786, 11.988485530725889, 4.17309100277266))
                    .setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + -0.08250000000000052, 2.1142036732050804, 0)),
                new WebGLEngine.Types.Frame()
                    .setPosition(new WebGLEngine.Types.Vector3(-11.839525845439713, 9.859977467817682, 37.74541925333037))
                    .setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + -0.0200000000000005, 2.6217036732050745, 0)),
                new WebGLEngine.Types.Frame()
                    .setPosition(new WebGLEngine.Types.Vector3(-19.272998573951327, 9.71999955068464, 97.612877613702))
                    .setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + 0.004999999999999498, 3.3042036732050626, 0)),
                new WebGLEngine.Types.Frame()
                    .setPosition(new WebGLEngine.Types.Vector3(-16.85797848025723, 12.674998062742992, 135.3757210551033))
                    .setRotation(new WebGLEngine.Types.Vector3(-Math.PI / 2 + -0.08250000000000035, Math.PI + 1.610796326794911, 0))
            ]);
            this._animation.setTimeByDistance(10000);
            this._animation2 = new WebGLEngine.Types.Animation(WebGLEngine.Types.Animation.Types.WITH_CHANGES, new WebGLEngine.Types.Frame()
                .setPosition(new WebGLEngine.Types.Vector3(0, 10.0001, 0))
                .setRotation(new WebGLEngine.Types.Vector3(0, 0, 0)), [
                new WebGLEngine.Types.Frame()
                    .setPosition(new WebGLEngine.Types.Vector3(0, 10.0002, 0))
                    .setRotation(new WebGLEngine.Types.Vector3(Math.PI * 2, Math.PI / 4, 0))
                    .setTime(2000),
                new WebGLEngine.Types.Frame()
                    .setPosition(new WebGLEngine.Types.Vector3(0, 10.0001, 0))
                    .setRotation(new WebGLEngine.Types.Vector3(Math.PI * 4, 0, 0))
                    .setTime(2000),
            ]);
        };
        Game.prototype._startAnimation = function () {
            this._animation.start(this._meshes.plane, new WebGLEngine.Utils.Callback(this._startAnimation, this));
        };
        Game.prototype._startAnimation2 = function () {
            this._animation2.start(this._meshes.wheel, new WebGLEngine.Utils.Callback(this._startAnimation2, this));
        };
        Game.prototype._showTransformations = function () {
            console.log('--');
            console.log('' + this._camera.position.x + ', ' + this._camera.position.y + ', ' + this._camera.position.z);
            console.log('' + this._camera.rotation.x + ', ' + this._camera.rotation.y + ', ' + this._camera.rotation.z);
        };
        Game.prototype._keyDown = function (e) {
            switch (e.keyCode) {
                case 65:
                    this._timers.key_a = true;
                    break;
                case 87:
                    this._timers.key_w = true;
                    break;
                case 68:
                    this._timers.key_d = true;
                    break;
                case 83:
                    this._timers.key_s = true;
                    break;
                case 38:
                case 29460:
                    this._timers.key_up = true;
                    break;
                case 40:
                case 29461:
                    this._timers.key_down = true;
                    break;
                case 37:
                case 4:
                    this._timers.key_left = true;
                    break;
                case 39:
                case 5:
                    this._timers.key_right = true;
                    break;
            }
        };
        Game.prototype._keyUp = function (e) {
            switch (e.keyCode) {
                case 65:
                    this._timers.key_a = false;
                    break;
                case 87:
                    this._timers.key_w = false;
                    break;
                case 68:
                    this._timers.key_d = false;
                    break;
                case 83:
                    this._timers.key_s = false;
                    break;
                case 13:
                    //this._startAnimation();
                    break;
                case 32:
                    this._showTransformations();
                    break;
                case 67:
                    this._changeCameraMode();
                    break;
                case 38:
                case 29460:
                    //this._startAnimation();
                    break;
                case 40:
                case 29461:
                    this._timers.key_down = false;
                    break;
                case 37:
                case 4:
                    this._timers.key_left = false;
                    break;
                case 39:
                case 5:
                    this._timers.key_right = false;
                    break;
            }
        };
        Game.prototype._changeCameraMode = function () {
            switch (this._cameraMode) {
                case Game._cameraModes.FLY:
                    this._camera.follow(this._meshes.plane);
                    this._cameraMode = Game._cameraModes.FOLLOW;
                    break;
                case Game._cameraModes.FOLLOW:
                    this._camera.follow(this._meshes.plane, 10);
                    this._cameraMode = Game._cameraModes.FOLLOW_CLOSE;
                    break;
                case Game._cameraModes.FOLLOW_CLOSE:
                    this._camera.unfollow();
                    this._cameraMode = Game._cameraModes.FLY;
                    break;
            }
        };
        Game.prototype._controllerHandler = function (event) {
            var events = WebGLEngine.Types.Controller.Events;
            switch (event) {
                case events.ALL_MESHES_LOADED:
                    WebGLEngine.Console.log('So example is loaded', 'yellow');
                    WebGLEngine.Console.log('Use "WASD" and mouse to fly', 'yellow');
                    WebGLEngine.Console.log('To toggle camera modes use "C". Modes: FLY/FOLLOW/FOLLOW_CLOSE', 'yellow');
                    break;
            }
        };
        Game._cameraModes = {
            FLY: 0,
            FOLLOW: 1,
            FOLLOW_CLOSE: 2
        };
        return Game;
    })();
    Example.Game = Game;
})(Example || (Example = {}));
//# sourceMappingURL=main.js.map