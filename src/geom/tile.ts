import { Point2D } from "./point2d";

export interface TileLayer {

	getTile(xIndex: number, yIndex: number): Tile;
	getTiles(position: Point2D, xMapUnits: number, yMapUnits: number): Array<Tile>;

}

export abstract class AbstractTileLayer implements TileLayer {
	
	constructor(public widthMapUnits: number, public heightMapUnits: number){}

	abstract getTile(xIndex: number, yIndex: number): Tile;

	getTiles(position: Point2D, xMapUnits: number, yMapUnits: number): Array<Tile> {

		let relativeX = position.x / this.widthMapUnits;
		let relativeY = position.y / this.heightMapUnits;

		let width = xMapUnits / this.widthMapUnits;
		let height = yMapUnits / this.heightMapUnits;

		let firstX = Math.floor(relativeX);
		let lastX = Math.ceil(relativeX) + width;

		let firstY = Math.floor(relativeY);
		let lastY = Math.ceil(relativeY) + height;

		let tiles = new Array<Tile>();

		for (var x=firstX; x<lastX; x++){
			for (var y=firstY; y<lastY; y++){
				tiles.push(this.getTile(x, y))
			}
		}

		return tiles;
	}

}

export interface Tile {
	xIndex: number;
	yIndex: number;
}