
export class Point2D {
    static readonly zero = new Point2D(0, 0);
    static readonly one = new Point2D(1, 1);

    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
	}

}