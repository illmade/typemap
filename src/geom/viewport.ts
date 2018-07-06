import { Point2D } from "./point2d";
import { Vector2D } from "./vector2d";
import { World2D, Units } from "./world2d";

export class Viewport {
	
	constructor(world: World2D, public topLeft: Point2D, public xWidth: number, public yWidth: number){}

	setView(xWidth: Units, yWidth: Units){};

}