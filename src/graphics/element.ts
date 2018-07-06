import { Point2D } from "../geom/point2d";
import { Vector2D } from "../geom/vector2d";
import { World2D, Units } from "../geom/world2d";
import { Canvas } from "./canvas";

export abstract class GraphicsElement {

    loadContent(): void { // nothing 
    };

    abstract get position():Point2D;

    abstract draw(canvas: Canvas): void;

    abstract get origin(): Point2D;

    abstract get size(): Vector2D;
    
}