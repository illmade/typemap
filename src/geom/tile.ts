import { Units } from "./world2d";
import { Point2D } from "./point2d";

export abstract class TileLayer {
	
	constructor(public widthMapUnits: number, public heightMapUnits: number){}

	abstract getTile(xIndex: number, yIndex: number): Tile;

	getTiles(position: Point2D, xMapUnits: number, yMapUnits: number): Array<Tile> {

		let firstX = Math.floor(position.x / this.widthMapUnits);
		let lastX = Math.ceil((position.x + xMapUnits)/ this.widthMapUnits);

		let firstY = Math.floor(position.y / this.heightMapUnits);
		let lastY = Math.ceil((position.y + yMapUnits)/ this.heightMapUnits);

		let tiles = new Array<Tile>();

		for (var x=firstX; x<lastX; x++){
			for (var y=firstY; y<lastY; y++){
				tiles.push(this.getTile(x, y))
			}
		}

		return tiles;
	}

}

export class Tile {
	
	static emptyTile: Tile = new Tile(-1,-1);

	constructor(xIndex: number, yIndex: number){}

}