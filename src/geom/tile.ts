import { Units } from "./world2d";
import { Point2D } from "./point2d";

export abstract class TileLayer {
	
	constructor(public tileWidth: number, public tileHeight: number){}

	abstract getTile(xUnits: number, yUnits: number): Tile;

	abstract getTiles(position: Point2D, xWidth: number, yWidth: number): Array<Tile>;

}

export class Tile {
	
	static emptyTile: Tile = new Tile(-1,-1);

	constructor(xIndex: number, yIndex: number){}

}