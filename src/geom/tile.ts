import { Units } from "./world2d";
import { Point2D } from "./point2d";

export abstract class TileLayer {
	
	constructor(public widthMapUnits: number, public heightMapUnits: number){}

	abstract getTile(xIndex: number, yIndex: number): Tile;

	abstract getTiles(position: Point2D, xUnits: number, yUnits: number): Array<Tile>;

}

export class Tile {
	
	static emptyTile: Tile = new Tile(-1,-1);

	constructor(xIndex: number, yIndex: number){}

}