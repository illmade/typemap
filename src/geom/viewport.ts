import { Point2D } from "./point2d";
import { Vector2D } from "./vector2d";
import { World2D, Units } from "./world2d";

export class Viewport {
	
	constructor(public topLeft: Point2D, 
		private widthMapUnits: number, private heightMapUnits: number){

		console.log("w h" + widthMapUnits + ", " + heightMapUnits);
	}

	moveView(topLeft: Point2D){
		this.topLeft = topLeft;
	}

	zoomView(zoom: number){
		this.widthMapUnits = this.widthMapUnits * zoom;
		this.heightMapUnits = this.heightMapUnits * zoom;
	}

	getDimensions(){
		return new Point2D(this.widthMapUnits, this.heightMapUnits);
	}

}