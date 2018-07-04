export class Vector2D {
    
    static readonly half = new Vector2D(.5, .5);
    static readonly zero = new Vector2D(0, 0);
    static readonly one = new Vector2D(1, 1);

    static readonly unitX = new Vector2D(1, 0);
    static readonly unitY = new Vector2D(0, 1);

    constructor(public x: number, public y: number) {
    }

    add(other: Vector2D): Vector2D {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }

    minus(other: Vector2D): Vector2D {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }

    divide(amount: number): Vector2D {
        return new Vector2D(this.x / amount, this.y / amount);
    }

    multiply(amount: number): Vector2D {
        return new Vector2D(this.x * amount, this.y * amount);
    }

}