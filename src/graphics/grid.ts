import { DrawLayer } from "./layer";
import { Transform, ViewTransform, combineTransform } from "./view";
import { Dimension } from "../geom/point2d";

/**
* We don't want to draw a grid into a transformed canvas as this gives us grid lines that are too
thick or too thin
*/
export class StaticGrid extends DrawLayer {

	zoomWidth: number;
	zoomHeight: number;

	constructor(localTransform: Transform, zoomLevel: number, visible: boolean,
		readonly gridWidth: number = 256, readonly gridHeight: number = 256){

		super(localTransform, 1, visible);

		let zoom = Math.pow(2, zoomLevel);
		this.zoomWidth = gridWidth / zoom;
		this.zoomHeight = gridHeight / zoom;
	}

	draw(ctx: CanvasRenderingContext2D, transform: Transform, view: ViewTransform): boolean {

		let offsetX = view.x * view.zoomX;
		let offsetY = view.y * view.zoomY;

		let viewWidth = view.width / view.zoomX;
		let viewHeight = view.height / view.zoomY;

		let gridAcross = viewWidth / this.zoomWidth;
		let gridHigh = viewHeight / this.zoomHeight;

		let xMin = Math.floor(view.x/this.zoomWidth);
		let xLeft = xMin * this.zoomWidth * view.zoomX;
		let xMax = Math.ceil((view.x + viewWidth) / this.zoomWidth);
		let xRight = xMax * this.zoomWidth * view.zoomX;

		let yMin = Math.floor(view.y/this.zoomHeight);
		let yTop = yMin * this.zoomHeight * view.zoomX;
		let yMax = Math.ceil((view.y + viewHeight) / this.zoomHeight);
		let yBottom = yMax * this.zoomHeight * view.zoomX ;

		//console.log("xMin " + xMin + " xMax " + xMax);
		//console.log("yMin " + yMin + " yMax " + yMax);

		ctx.beginPath();
		ctx.strokeStyle = "black";

		for (var x = xMin; x<=xMax; x++){
			//console.log("at " + minX);
			let xMove = x * this.zoomWidth * view.zoomX;
			ctx.moveTo(xMove - offsetX, yTop - offsetY);
			ctx.lineTo(xMove - offsetX, yBottom - offsetY);
		}

		for (var y = yMin; y<=yMax; y++){

			let yMove = y * this.zoomHeight * view.zoomY;
			ctx.moveTo(xLeft - offsetX, yMove - offsetY);
			ctx.lineTo(xRight - offsetX, yMove - offsetY);

			for (var x = xMin; x<=xMax; x++){
				let xMove = (x-.5) * this.zoomWidth * view.zoomX;
				yMove = (y-.5) * this.zoomHeight * view.zoomY;
				let text = "" + (x-1) + ", " + (y-1);
				ctx.strokeText(text, xMove - offsetX, yMove - offsetY);
			}
		}

		ctx.closePath();
		ctx.stroke();
		
		return true;
	}

	getDimension(): Dimension {
		return new Dimension(0, 0, 0, 0);
	}
}