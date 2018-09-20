
export class Point2D {
    static readonly zero = new Point2D(0, 0);
    static readonly one = new Point2D(1, 1);

    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
	}

    toString(): string {
        return "Point2D(" + this.x + ", " + this.y + ")";
    }

}

export function rotate(point: Point2D, angle: number, about: Point2D = new Point2D(0,0)): Point2D {
    let s = Math.sin(angle);
    let c = Math.cos(angle);

    let px = point.x - about.x;
    let py = point.y - about.y;

    let xnew = px * c - py * s;
    let ynew = px * s + py * c;

    return new Point2D(xnew + about.x, ynew + about.y);
}

export class Dimension {

    constructor(public x: number, public y: number, public w: number, public h: number){}

}