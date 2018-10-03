import { Transform, BasicTransform, combineTransform } from "./view";
import { DrawLayer } from "./layer";
import { DisplayElement } from "./canvasview";
import { Dimension, rotate, Point2D } from "../geom/point2d";

export function arrayToPoints(pointArray: Array<Array<number>>): Array<Point2D> {
	let points: Array<Point2D> = [];
	for (let arrayPoint of pointArray){
		let point = new Point2D(arrayPoint[0], arrayPoint[1]);
		points.push(point);
	}
	return points;
}

export class Shape extends DrawLayer  {

	public fill: boolean;
	public points: Array<Point2D>;

	constructor(
	  localTransform: Transform, 
	  opacity: number,
	  visible: boolean,
	  name: string, 
	  description: string,
	) {
		super(localTransform, opacity, visible, name, description);
	}

	draw(ctx: CanvasRenderingContext2D, parentTransform: Transform, 
	  view: Transform): boolean {

	  	let ctxTransform = combineTransform(this, parentTransform);

		this.prepareCtx(ctx, ctxTransform, view);

		if (this.visible) {
			ctx.beginPath();
			let start = this.points[0];
			ctx.moveTo(start.x, start.y);
			for (let point of this.points){
				ctx.lineTo(point.x, point.y);
			}
			if (this.fill) {
				ctx.fill();
			}
			ctx.stroke();
		}

		this.cleanCtx(ctx, ctxTransform, view);

		return true;
	}

	getDimension(): Dimension {
		return new Dimension(0, 0, 0, 0);
	}
}

export class Point extends DrawLayer implements DisplayElement {

	constructor(x: number, y:number, public radius: number, 
		opacity: number,
		visible: boolean) {

		super(new BasicTransform(x, y, 1, 1, 0), 
			opacity, visible, "point");
	}

	draw(ctx: CanvasRenderingContext2D, parentTransform: Transform, 
		view: Transform): boolean {

		let x = (this.x + parentTransform.x - view.x) * view.zoomX;
		let y = (this.y + parentTransform.y - view.y) * view.zoomY;

		let width = this.radius * view.zoomX;
		let height = this.radius * view.zoomY;

		ctx.strokeStyle = "red";
		ctx.fillStyle = "red";
		
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.arc(x, y, width, 0, 2 * Math.PI, false);
		ctx.fill();

		return true;
	}

	getDimension(): Dimension {
		return new Dimension(this.x, this.y, this.radius, this.radius);
	}

	inside(x: number, y: number): boolean {
		let xdiff = this.x - x;
		let ydiff = this.y - y;

		let distance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
		
		return distance < this.radius;
	}

}
