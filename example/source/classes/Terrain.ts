module Example {
    export class Terrain {
        private map : Array<Array<number>>;
        private roughness : number;
        public size : number;
        public max : number;

        constructor(detail, roughness) {
            this.size = Math.pow(2, detail) + 1;
            this.max = this.size - 1;
            this.map = [];
            for (let i = 0; i < this.size; i++) {this.map.push([])}
            this.roughness = roughness;
            this.generate();
        }
        public getMap() {
            return this.map;
        }
        public set(x: number, y: number, value: number) {
            this.map[y][x] = value;
        }
        public get(x: number, y: number) {
            if (x < 0 || x > this.max || y < 0 || y > this.max) {
                return 0;
            }
            return this.map[y][x];
        }
        private generate() {
            this.set(0, 0, this.max / 2);
            this.set(this.max, 0, this.max / 2);
            this.set(this.max, this.max, this.max / 2);
            this.set(0, this.max, this.max / 2);
            this.divide(this.max);
        }
        private divide(size) {
            let x, y, half = size / 2;
            let scale = this.roughness * size;
            if (half < 1) return;

            for (y = half; y < this.max; y += size) {
                for (x = half; x < this.max; x += size) {
                    this.square(x, y, half, Math.random() * scale * 2 - scale);
                }
            }
            for (y = 0; y <= this.max; y += half) {
                for (x = (y + half) % size; x <= this.max; x += size) {
                    this.diamond(x, y, half, Math.random() * scale * 2 - scale);
                }
            }
            this.divide(size / 2);
        }
        private square(x, y, size, offset) {
            let ave = this.average([
                this.get(x - size, y - size),   // top left
                this.get(x + size, y - size),   // top right
                this.get(x - size, y + size),   // bottom left
                this.get(x + size, y + size)    // bottom right
            ]);
            this.set(x, y, ave + offset);
        }
        private diamond(x, y, size, offset) {
            let ave = this.average([
                this.get(x, y - size),      // top
                this.get(x + size, y),      // right
                this.get(x, y + size),      // bottom
                this.get(x - size, y)       // left
            ]);
            this.set(x, y, ave + offset);
        }
        private average(values: Array<number>) {
            let sum = 0;
            values.forEach(value => sum += value);
            return sum / values.length;
        }
    }
}