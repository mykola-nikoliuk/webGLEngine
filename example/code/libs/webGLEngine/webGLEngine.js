glMatrixArrayType = typeof Float32Array != "undefined" ?
    Float32Array : typeof WebGLFloatArray != "undefined" ? WebGLFloatArray : Array;
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
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var Callback = (function () {
        function Callback(func, thisArg) {
            if (func === void 0) { func = function () { }; }
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
})(Utils || (Utils = {}));
///<reference path="Callback.ts"/>
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
})(Utils || (Utils = {}));
///<reference path="glMatrix.ts"/>
///<reference path="Callback.ts"/>
///<reference path="Timer.ts"/>
var Utils;
(function (Utils) {
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
    function requestFile(url, callback) {
        var request = new XMLHttpRequest();
        request.open('get', url, true);
        request.onreadystatechange = this.bind(this.requestResult, this, request, url, callback);
        request.send(null);
    }
    Utils.requestFile = requestFile;
    function requestResult(event, request, url, callback) {
        // If the request is "DONE" (completed or failed)
        if (request.readyState === 4) {
            // If we got HTTP status 200 (OK)
            if (request.status !== 200) {
                console.log('Can\'t download file: ' + url);
                callback.apply('');
            }
            else {
                callback.apply(request.responseText);
            }
        }
    }
    Utils.requestResult = requestResult;
    function getFileNameFromPath(path) {
        var nodes = path.split(/\\|\//g);
        return nodes[nodes.length - 1];
    }
    Utils.getFileNameFromPath = getFileNameFromPath;
})(Utils || (Utils = {}));
///<reference path="./../utils/Utils.ts"/>
var webGLEngine;
(function (webGLEngine) {
    var Types;
    (function (Types) {
        var Material = (function () {
            function Material() {
                this.texture = null;
                this.diffuseColor = [Math.random(), Math.random(), Math.random()];
                this.specular = 0;
                this.imageLink = '';
                this.ready = true;
                this.texture = null;
                this.textureRepeat = true;
            }
            Material.prototype.loadTexture = function (gl, path, textureRepeat) {
                if (typeof gl !== 'object') {
                    console.log('GL parameter is not a object');
                    return;
                }
                if (typeof path !== 'string') {
                    console.log('Texture path parameter is not a string');
                    return;
                }
                this.textureRepeat = typeof textureRepeat === 'boolean' ? textureRepeat : true;
                this.ready = false;
                this.imageLink = path;
                this.texture = gl.createTexture();
                this.texture.image = new Image();
                this.texture.image.onload = Utils.bind(this.createTexture, this, gl);
                this.texture.image.src = this.imageLink;
            };
            /** @private */
            Material.prototype.createTexture = function () {
                var gl = arguments[arguments.length - 1], repeatType = this.textureRepeat ? 'REPEAT' : 'CLAMP_TO_EDGE';
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture.image);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[repeatType]);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[repeatType]);
                gl.bindTexture(gl.TEXTURE_2D, null);
                this.ready = true;
            };
            return Material;
        })();
        Types.Material = Material;
    })(Types = webGLEngine.Types || (webGLEngine.Types = {}));
})(webGLEngine || (webGLEngine = {}));
var webGLEngine;
(function (webGLEngine) {
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
            };
            Vector3.prototype.add = function (x, y, z) {
                this._x += typeof x === 'number' ? x : 0;
                this._y += typeof y === 'number' ? y : 0;
                this._z += typeof z === 'number' ? z : 0;
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
    })(Types = webGLEngine.Types || (webGLEngine.Types = {}));
})(webGLEngine || (webGLEngine = {}));
///<reference path="../common/Vector3.ts"/>
var webGLEngine;
(function (webGLEngine) {
    var Types;
    (function (Types) {
        var Transformations = (function () {
            function Transformations() {
                this.position = new Types.Vector3();
                this.rotation = new Types.Vector3(0, 0, 0);
                this.scale = new Types.Vector3(1, 1, 1);
            }
            return Transformations;
        })();
        Types.Transformations = Transformations;
    })(Types = webGLEngine.Types || (webGLEngine.Types = {}));
})(webGLEngine || (webGLEngine = {}));
///<reference path="Material.ts"/>
///<reference path="Transformations.ts"/>
var webGLEngine;
(function (webGLEngine) {
    var Types;
    (function (Types) {
        var Mesh = (function () {
            function Mesh(webGL) {
                this._vertexes = null;
                this._vertextTextures = null;
                this._vertexNormals = null;
                this._faces = null;
                this._materials = null;
                this._webGL = webGL;
                this._isReady = false;
                this._transformations = new Types.Transformations();
                this._vertexIndexBuffers = {};
                this._vertexPositionBuffer = this._webGL.createBuffer();
                this._vertexNormalBuffer = this._webGL.createBuffer();
                this._vertexColorBuffer = this._webGL.createBuffer();
                this._vertexTextureBuffer = this._webGL.createBuffer();
            }
            /** @public
             * @param {Array.<number>} vertexes
             * @param {Array.<number>} vertexTexture
             * @param {Array.<number>} vertexNormals
             * @param {Array.<number>} faces
             * @param {Array.<number>} materials */
            Mesh.prototype.fillBuffers = function (vertexes, vertexTexture, vertexNormals, faces, materials) {
                this._vertexes = vertexes;
                this._vertextTextures = vertexTexture;
                this._vertexNormals = vertexNormals;
                this._faces = faces;
                this._materials = materials;
                // create vertex index buffer
                this._webGL.bindBuffer(this._webGL.ARRAY_BUFFER, this._vertexPositionBuffer);
                this._webGL.bufferData(this._webGL.ARRAY_BUFFER, new Float32Array(this._vertexes), this._webGL.STATIC_DRAW);
                this._vertexPositionBuffer.itemSize = 3;
                this._vertexPositionBuffer.numItems = this._vertexes.length / this._vertexPositionBuffer.itemSize;
            };
            /** @public
             * @param {Array.<number>} [materials] */
            Mesh.prototype.initBuffers = function (materials) {
                var colors = [], indexes = [], textures = [], normals = [], i, j, material, vertexIndexBuffer, colorIndex;
                // create empty color and texture buffer
                //		for (i = 0; i < this._vertexes.length / 3; i++) {
                //			colors.push(1);
                //			colors.push(1);
                //			colors.push(1);
                //			colors.push(1);
                //		}
                if (typeof materials !== 'undefined') {
                    for (material in this._materials) {
                        if (this._materials.hasOwnProperty(material)) {
                            if (materials.hasOwnProperty(material)) {
                                this._materials[material] = materials[material];
                            }
                        }
                    }
                }
                // create empty color and texture buffer
                for (material in this._faces) {
                    if (this._faces.hasOwnProperty(material)) {
                        if (this._faces[material].length === 0)
                            continue;
                        indexes = [];
                        for (i = 0; i < this._faces[material].length; i++) {
                            colorIndex = (this._faces[material][i].vertexIndex) * 4;
                            indexes.push(this._faces[material][i].vertexIndex);
                            textures[this._faces[material][i].vertexIndex * 2] = this._vertextTextures[this._faces[material][i].textureIndex * 2];
                            textures[this._faces[material][i].vertexIndex * 2 + 1] = this._vertextTextures[this._faces[material][i].textureIndex * 2 + 1];
                            normals[this._faces[material][i].vertexIndex * 3] = this._vertexNormals[this._faces[material][i].normalIndex * 3];
                            normals[this._faces[material][i].vertexIndex * 3 + 1] = this._vertexNormals[this._faces[material][i].normalIndex * 3 + 1];
                            normals[this._faces[material][i].vertexIndex * 3 + 2] = this._vertexNormals[this._faces[material][i].normalIndex * 3 + 2];
                            for (j = 0; j < 3; j++) {
                                colors.push(this._materials[material].diffuseColor[j]);
                            }
                            colors.push(1);
                        }
                        vertexIndexBuffer = this._webGL.createBuffer();
                        this._webGL.bindBuffer(this._webGL.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
                        this._webGL.bufferData(this._webGL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), this._webGL.STATIC_DRAW);
                        vertexIndexBuffer.itemSize = 1;
                        vertexIndexBuffer.numItems = indexes.length / vertexIndexBuffer.itemSize;
                        this._vertexIndexBuffers[material] = {
                            material: this._materials[material],
                            buffer: vertexIndexBuffer
                        };
                    }
                }
                // create vertex normal buffer
                this._webGL.bindBuffer(this._webGL.ARRAY_BUFFER, this._vertexNormalBuffer);
                this._webGL.bufferData(this._webGL.ARRAY_BUFFER, new Float32Array(normals), this._webGL.STATIC_DRAW);
                this._vertexNormalBuffer.itemSize = 3;
                this._vertexNormalBuffer.numItems = normals.length / this._vertexNormalBuffer.itemSize;
                // create vertex color buffer
                this._webGL.bindBuffer(this._webGL.ARRAY_BUFFER, this._vertexColorBuffer);
                this._webGL.bufferData(this._webGL.ARRAY_BUFFER, new Float32Array(colors), this._webGL.STATIC_DRAW);
                this._vertexColorBuffer.itemSize = 4;
                this._vertexColorBuffer.numItems = colors.length / this._vertexColorBuffer.itemSize;
                // create vertex texture buffer
                this._webGL.bindBuffer(this._webGL.ARRAY_BUFFER, this._vertexTextureBuffer);
                this._webGL.bufferData(this._webGL.ARRAY_BUFFER, new Float32Array(textures), this._webGL.STATIC_DRAW);
                this._vertexTextureBuffer.itemSize = 2;
                this._vertexTextureBuffer.numItems = this._vertextTextures.length / this._vertexTextureBuffer.itemSize;
                this._isReady = true;
            };
            /** @public */
            Mesh.prototype.isReady = function () {
                return this._isReady;
            };
            /** @public */
            Mesh.prototype.getVertexIndexBuffers = function () {
                return this._vertexIndexBuffers;
            };
            /** @public */
            Mesh.prototype.getVertexPositionBuffer = function () {
                return this._vertexPositionBuffer;
            };
            /** @public */
            Mesh.prototype.getVertexColorBuffer = function () {
                return this._vertexColorBuffer;
            };
            /** @public */
            Mesh.prototype.getVertexNormalBuffer = function () {
                return this._vertexNormalBuffer;
            };
            /** @public */
            Mesh.prototype.getVertexTextureBuffer = function () {
                return this._vertexTextureBuffer;
            };
            /** @public
             * @returns {Transformations} */
            Mesh.prototype.getTransformations = function () {
                return this._transformations;
            };
            Mesh.defaultMaterialName = 'noMaterial';
            return Mesh;
        })();
        Types.Mesh = Mesh;
    })(Types = webGLEngine.Types || (webGLEngine.Types = {}));
})(webGLEngine || (webGLEngine = {}));
var webGLEngine;
(function (webGLEngine) {
    var Types;
    (function (Types) {
        var Face = (function () {
            function Face(vertexIndex, textureIndex, normalIndex) {
                this.vertexIndex = typeof vertexIndex === 'number' ? vertexIndex : 0;
                this.textureIndex = typeof textureIndex === 'number' ? textureIndex : 0;
                this.normalIndex = typeof normalIndex === 'number' ? normalIndex : 0;
            }
            return Face;
        })();
        Types.Face = Face;
    })(Types = webGLEngine.Types || (webGLEngine.Types = {}));
})(webGLEngine || (webGLEngine = {}));
///<reference path="common/Vector3.ts"/>
var webGLEngine;
(function (webGLEngine) {
    var Types;
    (function (Types) {
        var Light = (function () {
            function Light(type, color, param, distance) {
                this._type = 0;
                this._enabled = true;
                this._distance = typeof distance === 'number' ? distance : 10;
                /** @private
                 * @type {Vector3} */
                this._color = new Types.Vector3();
                /** @private
                 * @type {Vector3} */
                this._position = new Types.Vector3();
                if (typeof color === 'object') {
                    this._color.r = typeof color[0] === 'number' ? color[0] : 0;
                    this._color.g = typeof color[1] === 'number' ? color[1] : 0;
                    this._color.b = typeof color[2] === 'number' ? color[2] : 0;
                }
                if (typeof param === 'object') {
                    this._position.r = typeof param[0] === 'number' ? param[0] : 0;
                    this._position.g = typeof param[1] === 'number' ? param[1] : 0;
                    this._position.b = typeof param[2] === 'number' ? param[2] : 0;
                }
            }
            Light.prototype.turnOn = function () {
                this._enabled = true;
            };
            Light.prototype.turnOff = function () {
                this._enabled = false;
            };
            /** @public */
            Light.prototype.isEnabled = function () {
                return this._enabled;
            };
            Object.defineProperty(Light.prototype, "color", {
                get: function () {
                    return this._color;
                },
                set: function (color) {
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Light.prototype, "position", {
                get: function () {
                    return this._position;
                },
                set: function (position) {
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Light.prototype, "distance", {
                get: function () {
                    return this._distance;
                },
                set: function (distance) {
                },
                enumerable: true,
                configurable: true
            });
            return Light;
        })();
        Types.Light = Light;
    })(Types = webGLEngine.Types || (webGLEngine.Types = {}));
})(webGLEngine || (webGLEngine = {}));
///<reference path="utils/Callback.ts"/>
var webGLEngine;
(function (webGLEngine) {
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
                    console.log('> Another shader is loading for now.');
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
                this.request(fragmentShader, this.loaded, this);
                this.request(vertexShader, this.loaded, this);
            };
            /** Shader loaded
             * @private
             * @param {boolean} result
             * @param {string} url
             * @param {string} text */
            Shader.prototype.loaded = function (result, url, text) {
                var shader;
                if (!result) {
                    console.log('Error loading shader: "' + url + '"');
                }
                else {
                    console.log('    shader loaded from: ' + url);
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
                        console.log(this._gl.getShaderInfoLog(shader));
                        return null;
                    }
                }
                if (++this._shaderCouter >= 2) {
                    this._isLoading = false;
                    console.log('> Shaders loaded successfully.');
                    this._callback.apply();
                }
            };
            /** @public */
            Shader.prototype.getVertexShader = function () {
                return this._vertexShader;
            };
            /** @public */
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
    })(Types = webGLEngine.Types || (webGLEngine.Types = {}));
})(webGLEngine || (webGLEngine = {}));
var webGLEngine;
(function (webGLEngine) {
    var Types;
    (function (Types) {
        var Frame = (function () {
            function Frame() {
                this._position = null;
            }
            Frame.prototype.setPosition = function (position) {
                if (position instanceof Types.Vector3) {
                    this._position = position;
                    console.log('>>> Error: Frame:setPosition() position is not instance of Vector3');
                }
                return this;
            };
            Frame.prototype.getPosition = function () {
                return this._position;
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
    })(Types = webGLEngine.Types || (webGLEngine.Types = {}));
})(webGLEngine || (webGLEngine = {}));
var webGLEngine;
(function (webGLEngine) {
    var Types;
    (function (Types) {
        var Animation = (function () {
            function Animation(frames) {
                this._frames = [];
                if (frames instanceof Array) {
                    for (var i = 0; i < frames.length; i++) {
                        if (frames[i] instanceof Types.Frame) {
                            this._frames.push(frames[i]);
                        }
                    }
                }
            }
            Animation.prototype.setTimeByDistance = function (time) {
                var length, totalLength = 0, sectorsLength = [], i;
                if (typeof time === 'number' && time > 0) {
                    sectorsLength.push(0);
                    // get distance between frames
                    for (i = 0; i < this._frames.length - 1; i++) {
                        length = this._frames[i].getPosition().getDistanceTo(this._frames[i + 1].getPosition());
                        totalLength += length;
                        sectorsLength.push(length);
                    }
                    for (i = 0; i < this._frames.length; i++) {
                        this._frames[i].setTime(time * (sectorsLength[i] / totalLength));
                    }
                }
                else {
                    console.log('>>> Error: Animation:setTimeByDistance() time should be a positive number');
                }
            };
            return Animation;
        })();
        Types.Animation = Animation;
    })(Types = webGLEngine.Types || (webGLEngine.Types = {}));
})(webGLEngine || (webGLEngine = {}));
var webGLEngine;
(function (webGLEngine) {
    var config = (function () {
        function config() {
        }
        config.version = '0.2';
        config.html = {
            canvasID: 'webGLCanvas'
        };
        return config;
    })();
    webGLEngine.config = config;
})(webGLEngine || (webGLEngine = {}));
///<reference path="./classes/utils/Utils.ts"/>
///<reference path="./classes/mesh/Mesh.ts"/>
///<reference path="./classes/mesh/Face.ts"/>
///<reference path="./classes/Light.ts"/>
///<reference path="./classes/Shader.ts"/>
///<reference path="./classes/common/Vector3.ts"/>
///<reference path="./classes/mesh/Material.ts"/>
///<reference path="./classes/mesh/Transformations.ts"/>
///<reference path="./classes/animation/Frame.ts"/>
///<reference path="./classes/animation/Animation.ts"/>
///<reference path="webGLConfig.ts"/>
var webGLEngine;
(function (webGLEngine) {
    var Engine = (function () {
        function Engine(fragmentShaderPath, vertexShaderPath) {
            console.log('> Start webGL initialization.');
            this._gl = null;
            this._isReady = false;
            this._shader = null;
            this._inited = false;
            this._canvasNode = null;
            this._mvMatrix = Utils.GLMatrix.mat4.create(undefined);
            this._pMatrix = Utils.GLMatrix.mat4.create(undefined);
            this._mvMatrixStack = [];
            this._camera = new webGLEngine.Types.Transformations();
            this._meshes = [];
            this._lights = [];
            this._shaderProgram = null;
            this._isLightingEnable = true;
            window.addEventListener('resize', Utils.bind(this.onResize, this), false);
            this._crateCanvas();
            this._initGL();
            this._loadShaders(fragmentShaderPath, vertexShaderPath);
        }
        Engine.prototype._crateCanvas = function () {
            this._canvasNode = document.getElementById(webGLEngine.config.html.canvasID);
            if (this._canvasNode === null) {
                this._canvasNode = document.createElement('canvas');
                this._canvasNode.id = webGLEngine.config.html.canvasID;
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
                console.log("Could not initialise WebGL, sorry :-(");
            }
        };
        Engine.prototype._loadShaders = function (fragmentShaderPath, vertexShaderPath) {
            this._shader = new webGLEngine.Types.Shader(this._gl);
            console.log('> Start shaders loading.');
            this._isReady = false;
            this._shader.add(new Utils.Callback(this._initShaders, this), fragmentShaderPath, vertexShaderPath);
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
                console.log("Could not initialise shaders");
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
            this._shaderProgram.lightingPositionUniform = this._gl.getUniformLocation(this._shaderProgram, "uLightPosition");
            this._shaderProgram.lightColorUniform = this._gl.getUniformLocation(this._shaderProgram, "uLightColor");
            this._shaderProgram.lightingDistanceUniform = this._gl.getUniformLocation(this._shaderProgram, "uLightDistance");
            this._shaderProgram.textureEnabled = this._gl.getUniformLocation(this._shaderProgram, "uUseTexture");
            this._shaderProgram.materialSpecular = this._gl.getUniformLocation(this._shaderProgram, "uMaterialSpecular");
            this._gl.enable(this._gl.DEPTH_TEST);
            this._isReady = true;
        };
        Engine.prototype._mvPushMatrix = function () {
            var copy = Utils.GLMatrix.mat4.create(undefined);
            Utils.GLMatrix.mat4.set(this._mvMatrix, copy);
            this._mvMatrixStack.push(copy);
        };
        Engine.prototype._mvPopMatrix = function () {
            if (this._mvMatrixStack.length == 0) {
                throw "Invalid popMatrix!";
            }
            this._mvMatrix = this._mvMatrixStack.pop();
        };
        Engine.prototype._setMatrixUniforms = function () {
            this._gl.uniformMatrix4fv(this._shaderProgram.pMatrixUniform, false, this._pMatrix);
            this._gl.uniformMatrix4fv(this._shaderProgram.mvMatrixUniform, false, this._mvMatrix);
            var normalMatrix = Utils.GLMatrix.mat3.create(undefined);
            Utils.GLMatrix.mat4.toInverseMat3(this._mvMatrix, normalMatrix);
            Utils.GLMatrix.mat3.transpose(normalMatrix);
            this._gl.uniformMatrix3fv(this._shaderProgram.nMatrixUniform, false, normalMatrix);
        };
        //private _degToRad(degrees : number) : number {
        //	return degrees * Math.PI / 180;
        //}
        Engine.prototype.beginDraw = function () {
            this._gl.viewport(0, 0, this._gl.viewportWidth, this._gl.viewportHeight);
            this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
            Utils.GLMatrix.mat4.perspective(45, this._gl.viewportWidth / this._gl.viewportHeight, 1, 1000000.0, this._pMatrix);
            Utils.GLMatrix.mat4.identity(this._mvMatrix);
            // set camera position
            Utils.GLMatrix.mat4.rotateX(this._mvMatrix, this._camera.rotation.x);
            Utils.GLMatrix.mat4.rotateY(this._mvMatrix, this._camera.rotation.y);
            Utils.GLMatrix.mat4.rotateZ(this._mvMatrix, this._camera.rotation.z);
            Utils.GLMatrix.mat4.translate(this._mvMatrix, this._camera.position.getArray());
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
        Engine.prototype.draw = function (mesh) {
            if (typeof mesh === 'undefined' || mesh === null || !mesh.isReady()) {
                return;
            }
            var vertexIndexBuffers, vertexPositionBuffer, vertexNormalBuffer, vertexColorBuffer, vertexTextureBuffer, transformations, i, material;
            this._mvPushMatrix();
            vertexIndexBuffers = mesh.getVertexIndexBuffers();
            vertexPositionBuffer = mesh.getVertexPositionBuffer();
            vertexNormalBuffer = mesh.getVertexNormalBuffer();
            vertexColorBuffer = mesh.getVertexColorBuffer();
            vertexTextureBuffer = mesh.getVertexTextureBuffer();
            transformations = mesh.getTransformations();
            // apply matrix transformations
            Utils.GLMatrix.mat4.translate(this._mvMatrix, transformations.position.getArray());
            Utils.GLMatrix.mat4.rotateZ(this._mvMatrix, transformations.rotation.z);
            Utils.GLMatrix.mat4.rotateY(this._mvMatrix, transformations.rotation.y);
            Utils.GLMatrix.mat4.rotateX(this._mvMatrix, transformations.rotation.x);
            Utils.GLMatrix.mat4.scale(this._mvMatrix, transformations.scale.getArray());
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexPositionBuffer);
            this._gl.vertexAttribPointer(this._shaderProgram.vertexPositionAttribute, vertexPositionBuffer.itemSize, this._gl.FLOAT, false, 0, 0);
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexNormalBuffer);
            this._gl.vertexAttribPointer(this._shaderProgram.vertexNormalAttribute, vertexNormalBuffer.itemSize, this._gl.FLOAT, false, 0, 0);
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexColorBuffer);
            this._gl.vertexAttribPointer(this._shaderProgram.vertexColorAttribute, vertexColorBuffer.itemSize, this._gl.FLOAT, false, 0, 0);
            for (material in vertexIndexBuffers) {
                if (vertexIndexBuffers.hasOwnProperty(material)) {
                    if (!vertexIndexBuffers[material].material.ready)
                        continue;
                    // set texture if it has material, texture and texture already loaded
                    if (material !== 'noMaterial' && vertexIndexBuffers[material].material.texture) {
                        this._gl.enableVertexAttribArray(this._shaderProgram.textureCoordAttribute);
                        this._gl.uniform1i(this._shaderProgram.textureEnabled, 1);
                        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexTextureBuffer);
                        this._gl.vertexAttribPointer(this._shaderProgram.textureCoordAttribute, vertexTextureBuffer.itemSize, this._gl.FLOAT, false, 0, 0);
                        this._gl.activeTexture(this._gl.TEXTURE0);
                        this._gl.bindTexture(this._gl.TEXTURE_2D, vertexIndexBuffers[material].material.texture);
                        this._gl.uniform1i(this._shaderProgram.samplerUniform, 0);
                    }
                    else {
                        this._gl.disableVertexAttribArray(this._shaderProgram.textureCoordAttribute);
                        this._gl.uniform1i(this._shaderProgram.textureEnabled, 0);
                    }
                    this._gl.uniform1i(this._shaderProgram.useLightingUniform, Number(this._isLightingEnable));
                    if (this._isLightingEnable) {
                        var lightEnables = [], positions = [], colors = [], distances = [], position, color;
                        for (i = 0; i < this._lights.length; i++) {
                            position = this._lights[i].position;
                            color = this._lights[i].color;
                            lightEnables.push(this._lights[i].isEnabled());
                            positions.push(position.x + this._mvMatrix[0]);
                            positions.push(position.y + this._mvMatrix[1]);
                            positions.push(position.z + this._mvMatrix[2]);
                            colors.push(color.r);
                            colors.push(color.g);
                            colors.push(color.b);
                            distances.push(this._lights[i].distance);
                        }
                        this._gl.uniform1iv(this._shaderProgram.useLightUniform, lightEnables);
                        this._gl.uniform1fv(this._shaderProgram.lightingDistanceUniform, distances);
                        this._gl.uniform3fv(this._shaderProgram.lightColorUniform, colors);
                        this._gl.uniform3fv(this._shaderProgram.lightingPositionUniform, positions);
                        this._gl.uniform1f(this._shaderProgram.materialSpecular, vertexIndexBuffers[material].material.specular);
                    }
                    //					this._gl.disableVertexAttribArray(this._shaderProgram.textureCoordAttribute);
                    this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffers[material].buffer);
                    this._setMatrixUniforms();
                    this._gl.drawElements(this._gl.TRIANGLES, vertexIndexBuffers[material].buffer.numItems, this._gl.UNSIGNED_SHORT, 0);
                }
            }
            this._mvPopMatrix();
        };
        Engine.prototype.createLight = function (type, color, param, distance) {
            this._lights.push(new webGLEngine.Types.Light(type, color, param, distance));
            return this._lights[this._lights.length - 1];
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
        Engine.prototype.getCamera = function () {
            return this._camera;
        };
        Engine.prototype.createMesh = function (vertexes, textures, normals, faces, materials) {
            var mesh = new webGLEngine.Types.Mesh(this._gl);
            mesh.fillBuffers(vertexes, textures, normals, faces, materials);
            mesh.initBuffers();
            this._meshes.push(mesh);
            return mesh;
        };
        Engine.prototype._createMeshFromFile = function (path, params) {
            var mesh = new webGLEngine.Types.Mesh(this._gl), parameters = {
                textureRepeat: true
            };
            console.log('> Start loading mesh => "' + Utils.getFileNameFromPath(path) + '"');
            this._meshes.push(mesh);
            if (typeof params === 'object') {
                if (typeof params.textureRepeat === 'boolean') {
                    parameters.textureRepeat = params.textureRepeat;
                }
            }
            Utils.requestFile(path, new Utils.Callback(this._parseObjFile, this, mesh, path, parameters));
            return mesh;
        };
        Engine.prototype._parseObjFile = function (objFile, mesh, path, parameters) {
            var i, j, nodes, vertexes = [], textures = [], normals = [], faces = [], materials = [], currentMaterial = webGLEngine.Types.Mesh.defaultMaterialName, vertexCounter, hasMaterial = false, objList, materialPath;
            // TODO : Async and fill mesh
            console.log('> Start parsing mesh => "' + Utils.getFileNameFromPath(path) + '"');
            materials[currentMaterial] = new webGLEngine.Types.Material();
            faces[currentMaterial] = [];
            objList = objFile.split(/\r\n|\n|\r/g);
            for (i = 0; i < objList.length; i++) {
                nodes = objList[i].split(/\s+/g);
                switch (nodes[0].toLowerCase()) {
                    case 'v':
                        vertexCounter = 0;
                        for (j = 1; j < nodes.length && vertexCounter < 3; j++) {
                            if (nodes[j] === '')
                                continue;
                            vertexCounter++;
                            vertexes.push(Number(nodes[j]));
                        }
                        if (vertexCounter !== 3) {
                            console.log('>>> Error : ' + vertexCounter + ' parameter(s) in vertex, should be 3');
                        }
                        break;
                    case 'vt':
                        textures.push(Number(nodes[1]));
                        textures.push(Number(nodes[2]));
                        //textures.push(Number(Math.random());
                        //textures.push(Number(Math.random());
                        break;
                    case 'vn':
                        for (j = 1; j < nodes.length; j++) {
                            if (nodes[j] === '')
                                continue;
                            normals.push(Number(nodes[j]));
                        }
                        break;
                    case 'f':
                        if (nodes.length > 4) {
                        }
                        var lastFace = null, firstFace = null;
                        for (j = 1; j < nodes.length && isNaN(nodes[j]); j++) {
                            /** @class Face */
                            var faceArray = nodes[j].split('/'), face;
                            if (isNaN(faceArray[0]))
                                break;
                            //console.log(Number(faceArray[1]));
                            face = new webGLEngine.Types.Face(Number(faceArray[0]) - 1, faceArray.length > 1 ? Number(faceArray[1]) - 1 : 0, faceArray.length > 2 ? Number(faceArray[2]) - 1 : 0);
                            if (faceArray.length < 2) {
                                console.log('>>> Warning : There is no texture coordinate');
                            }
                            if (j >= 4) {
                                faces[currentMaterial].push(firstFace);
                                faces[currentMaterial].push(lastFace);
                            }
                            if (j === 1) {
                                firstFace = face;
                            }
                            lastFace = face;
                            faces[currentMaterial].push(face);
                        }
                        if (j > 4) {
                            console.log('>>> Warning : ' + (j - 1) + ' vertexes in face');
                        }
                        break;
                    case 'mtllib':
                        hasMaterial = true;
                        materialPath = path.substring(0, path.lastIndexOf("/") + 1) + nodes[1];
                        Utils.requestFile(materialPath, new Utils.Callback(this._parseMaterial, this, materialPath, mesh, parameters));
                        break;
                    case 'usemtl':
                        if (!materials.hasOwnProperty(nodes[1])) {
                            materials[nodes[1]] = new webGLEngine.Types.Material();
                            faces[nodes[1]] = [];
                        }
                        currentMaterial = nodes[1];
                        break;
                }
            }
            console.log('    done => V: ' + vertexes.length / 3 +
                ' | VT: ' + textures.length +
                ' | N: ' + normals.length / 3);
            mesh.fillBuffers(vertexes, textures, normals, faces, materials);
            if (!hasMaterial) {
                mesh.initBuffers();
            }
        };
        Engine.prototype._parseMaterial = function (mtlFile, path, mesh, parameters) {
            var mtlList, i, j, nodes, material, allMaterials = {};
            /** @type {Material} */
            var currentMaterial = null;
            console.log('> Start parsing material => "' + Utils.getFileNameFromPath(path) + '"');
            mtlList = mtlFile.split(/\r\n|\n|\r/g);
            for (i = 0; i < mtlList.length; i++) {
                nodes = mtlList[i].split(/\s+/g);
                switch (nodes[0].toLowerCase()) {
                    case 'newmtl':
                        /** @type {Material} */
                        material = new webGLEngine.Types.Material();
                        allMaterials[nodes[1]] = material;
                        currentMaterial = material;
                        break;
                    case 'map_kd':
                        if (currentMaterial) {
                            currentMaterial.loadTexture(this._gl, (path.substring(0, path.lastIndexOf("/") + 1) + nodes[1]), parameters.textureRepeat);
                        }
                        break;
                    case 'kd':
                        for (j = 1; j < nodes.length; j++) {
                            if (nodes[j] === '')
                                continue;
                            currentMaterial.diffuseColor[j - 1] = Number(nodes[j]);
                        }
                        break;
                    case 'ns':
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
            console.log('    done');
            mesh.initBuffers(allMaterials);
        };
        Engine.prototype.getGLInstance = function () {
            return this._gl;
        };
        return Engine;
    })();
    webGLEngine.Engine = Engine;
})(webGLEngine || (webGLEngine = {}));
//# sourceMappingURL=webGLEngine.js.map