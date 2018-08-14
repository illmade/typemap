import { Point2D } from "./point2d";
import { Vector2D } from "./vector2d";

export class Viewport {
	
	constructor(public topLeft: Point2D, 
		private widthMapUnits: number, private heightMapUnits: number){

		console.log("w h" + widthMapUnits + ", " + heightMapUnits);
	}

	moveView(topLeft: Point2D){
		this.topLeft = topLeft;
	}

	zoomView(zoom: number){
		let newWidth = this.widthMapUnits * zoom;
		let newHeight = this.heightMapUnits * zoom;

		let moveX = (this.widthMapUnits - newWidth) / 2;
		let moveY = (this.heightMapUnits - newHeight) / 2;

		this.topLeft = new Point2D(this.topLeft.x + moveX, this.topLeft.y + moveY);

		this.widthMapUnits = newWidth;
		this.heightMapUnits = newHeight;
	}

	zoomAbout(xRelative: number, yRelative: number, zoom: number){

		let xDiff = 0.5 - xRelative;
		let yDiff = 0.5 - yRelative;

		var xMove = xDiff * this.widthMapUnits;
		var yMove = yDiff * this.heightMapUnits;

		this.topLeft = new Point2D(this.topLeft.x - xMove, this.topLeft.y - yMove);

		this.zoomView(zoom);

		xMove = xDiff * this.widthMapUnits;
		yMove = yDiff * this.heightMapUnits;

		this.topLeft = new Point2D(this.topLeft.x + xMove, this.topLeft.y + yMove);

	}

	getDimensions(){
		return new Point2D(this.widthMapUnits, this.heightMapUnits);
	}

}