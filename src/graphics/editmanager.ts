import { CanvasElement } from "./layer";
import { Transform, BasicTransform, ViewTransform } from "./view";
import { Shape, Point } from "./shape";
import { Dimension, Point2D } from "../geom/point2d";

export class EditManager extends CanvasElement {

	private pointMap: Map<Point, Point2D>;

	constructor(readonly shape: Shape, readonly radius = 5){

		super(shape.localTransform);

		this.pointMap = new Map<Point, Point2D>();

		for  (let point2d of shape.points){
			let point = new Point(point2d.x, point2d.y, this.radius, 1, true);
			this.pointMap.set(point, point2d);
		}
	}

	addPoint(x: number, y: number): void {
		let point = new Point(x, y, this.radius, 1, true);
		let point2d = new Point2D(x, y);
		this.shape.points.push(point2d);
		this.pointMap.set(point, point2d);
	}

	updatePoint(point: Point){
		let shapePoint = this.pointMap.get(point);
		shapePoint.x = point.x;
		shapePoint.y = point.y;
	}

	draw(ctx: CanvasRenderingContext2D, 
	  parentTransform: Transform, 
	  view: ViewTransform): boolean {

		for (let [point, point2d] of this.pointMap){
			point.draw(ctx, parentTransform, view);
		}

		return true;
	}

	getPoint(x: number, y: number): Point {
		for (let [point, point2d] of this.pointMap){
			if (point.inside(x, y)){
				return point;
			}
		}
		return undefined;
	}

	getDimension(): Dimension {
		return this.shape.getDimension();
	}
}