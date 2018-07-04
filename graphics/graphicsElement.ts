
export abstract class GraphicsElement {

    loadContent(): void { // nothing 
    };

    abstract get position():Point;

    abstract draw(canvas: Canvas): void;

    abstract get origin(): Point;

    abstract get size(): Vector2D;
    
}