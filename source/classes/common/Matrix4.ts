import Vector3 from './Vector3';

export default class Matrix4 {

    public matrixArray: number[];

    public static TranslateMatrix(vector: Vector3): Matrix4 {
        var translateMatrix = new Matrix4();
        translateMatrix.matrixArray[12] = vector.x;
        translateMatrix.matrixArray[13] = vector.y;
        translateMatrix.matrixArray[14] = vector.z;
        return translateMatrix;
    }

    public static ScaleMatrix(vector: Vector3): Matrix4 {
        var translateMatrix = new Matrix4();
        translateMatrix.matrixArray[0] = vector.x;
        translateMatrix.matrixArray[5] = vector.y;
        translateMatrix.matrixArray[10] = vector.z;
        return translateMatrix;
    }

    public static RotationMatrix(vector: Vector3): Matrix4 {
        var translateMatrix = new Matrix4();
        translateMatrix.rotateZYX(vector);
        return translateMatrix;
    }

    constructor() {
        this.matrixArray = [];
        this.identity();
    }

    public identity(): Matrix4 {
        for (var i = 0; i < 16; i++) {
            this.matrixArray[i] = i % 5 === 0 ? 1 : 0;
        }
        return this;
    }

    public translate(vector: Vector3): Matrix4 {
        var x = vector.x,
            y = vector.y,
            z = vector.z,
            m = this.matrixArray;

        m[12] = m[0] * x + m[4] * y + m[8] * z + m[12];
        m[13] = m[1] * x + m[5] * y + m[9] * z + m[13];
        m[14] = m[2] * x + m[6] * y + m[10] * z + m[14];
        m[15] = m[3] * x + m[7] * y + m[11] * z + m[15];
        return this;
    }

    public rotateZYX(vector: Vector3): Matrix4 {
        var a = Math.cos(vector.x),
            b = Math.sin(vector.x),
            c = Math.cos(vector.y),
            d = Math.sin(vector.y),
            e = Math.cos(vector.z),
            f = Math.sin(vector.z),
            ae = a * e,
            af = a * f,
            be = b * e,
            bf = b * f;

        this.matrixArray[0] = c * e;
        this.matrixArray[4] = be * d - af;
        this.matrixArray[8] = ae * d + bf;

        this.matrixArray[1] = c * f;
        this.matrixArray[5] = bf * d + ae;
        this.matrixArray[9] = af * d - be;

        this.matrixArray[2] = -d;
        this.matrixArray[6] = b * c;
        this.matrixArray[10] = a * c;

        return this;
    }

    public scale(vector: Vector3): Matrix4 {
        this.matrixArray[0] *= vector.x;
        this.matrixArray[1] *= vector.x;
        this.matrixArray[2] *= vector.x;
        this.matrixArray[3] *= vector.x;
        this.matrixArray[4] *= vector.y;
        this.matrixArray[5] *= vector.y;
        this.matrixArray[6] *= vector.y;
        this.matrixArray[7] *= vector.y;
        this.matrixArray[8] *= vector.z;
        this.matrixArray[9] *= vector.z;
        this.matrixArray[10] *= vector.z;
        this.matrixArray[11] *= vector.z;
        return this;
    }

    public multiply(matrix: Matrix4): Matrix4 {
        var a = this.matrixArray,
            b = matrix.matrixArray,
            m00 = a[0], m01 = a[1], m02 = a[2], m03 = a[3], m10 = a[4], m11 = a[5], m12 = a[6], m13 = a[7], m20 = a[8],
            m21 = a[9], m22 = a[10], m23 = a[11], m30 = a[12], m31 = a[13], m32 = a[14], m33 = a[15],
            n00 = b[0], n01 = b[1], n02 = b[2], n03 = b[3], n10 = b[4], n11 = b[5], n12 = b[6], n13 = b[7], n20 = b[8],
            n21 = b[9], n22 = b[10], n23 = b[11], n30 = b[12], n31 = b[13], n32 = b[14], n33 = b[15];

        a[0] = n00 * m00 + n01 * m10 + n02 * m20 + n03 * m30;
        a[1] = n00 * m01 + n01 * m11 + n02 * m21 + n03 * m31;
        a[2] = n00 * m02 + n01 * m12 + n02 * m22 + n03 * m32;
        a[3] = n00 * m03 + n01 * m13 + n02 * m23 + n03 * m33;
        a[4] = n10 * m00 + n11 * m10 + n12 * m20 + n13 * m30;
        a[5] = n10 * m01 + n11 * m11 + n12 * m21 + n13 * m31;
        a[6] = n10 * m02 + n11 * m12 + n12 * m22 + n13 * m32;
        a[7] = n10 * m03 + n11 * m13 + n12 * m23 + n13 * m33;
        a[8] = n20 * m00 + n21 * m10 + n22 * m20 + n23 * m30;
        a[9] = n20 * m01 + n21 * m11 + n22 * m21 + n23 * m31;
        a[10] = n20 * m02 + n21 * m12 + n22 * m22 + n23 * m32;
        a[11] = n20 * m03 + n21 * m13 + n22 * m23 + n23 * m33;
        a[12] = n30 * m00 + n31 * m10 + n32 * m20 + n33 * m30;
        a[13] = n30 * m01 + n31 * m11 + n32 * m21 + n33 * m31;
        a[14] = n30 * m02 + n31 * m12 + n32 * m22 + n33 * m32;
        a[15] = n30 * m03 + n31 * m13 + n32 * m23 + n33 * m33;
        return this;
    }

    public inverse(): Matrix4 {
        // TODO : clean
        var a = this.matrixArray,
            b = a,
            c = a[0], d = a[1], e = a[2], g = a[3], f = a[4], h = a[5], i = a[6], j = a[7], k = a[8], l = a[9],
            o = a[10], m = a[11], n = a[12], p = a[13], r = a[14], s = a[15], A = c * h - d * f, B = c * i - e * f,
            t = c * j - g * f, u = d * i - e * h, v = d * j - g * h, w = e * j - g * i, x = k * p - l * n,
            y = k * r - o * n, z = k * s - m * n, C = l * r - o * p, D = l * s - m * p, E = o * s - m * r,
            q = 1 / (A * E - B * D + t * C + u * z - v * y + w * x);

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
        return this;
    }

    public copyFrom(matrix): Matrix4 {
        this.matrixArray = matrix.matrixArray.slice(0);
        return this;
    }
}