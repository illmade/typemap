import { Tile, TileLayer } from "../geom/tile";
import { Point2D } from "../geom/point2d";

export abstract class CanvasTile extends Tile {

	abstract draw(canvas: CanvasRenderingContext2D, canvasX: number, canvasY: number): void;

}

export class ImageStruct {

	prefix: string;
	suffix: string;
	tileDir: string;
	visible: boolean;

}

export class ImageTile extends CanvasTile {

	private img: HTMLImageElement;

	constructor(readonly xIndex: number, readonly yIndex: number, imageSrc: string) {
		super(xIndex, yIndex);
		this.img = new Image();
		this.img.src = imageSrc;
	};

	draw(canvas: CanvasRenderingContext2D, canvasX: number, canvasY: number) {
		if (this.img.complete) {
			canvas.drawImage(this.img, canvasX, canvasY);
		}
		else {
			this.img.onload = (event) => {
				canvas.drawImage(this.img, canvasX, canvasY);
			};
		}
	};

}

export class ImageTileLayer extends TileLayer {

	readonly imageProperties: ImageStruct;

	constructor(tileWidth: number, tileHeight: number, imageProperties: ImageStruct) {
		super(tileWidth, tileHeight);
		this.imageProperties = imageProperties;
	}

	/**
	  leave caching up to the browser
	**/
	getTile(xUnits: number, yUnits: number): Tile {
		let imageSrc = this.imageProperties.tileDir + 
			this.imageProperties.prefix + xUnits + "_" + yUnits + this.imageProperties.suffix;
		return new ImageTile(xUnits, yUnits, imageSrc);
	}

	getTiles(position: Point2D, xWidth: number, yWidth: number): Array<Tile> {

		let firstX = Math.floor(position.x / this.tileWidth);
		let lastX = Math.ceil((position.x + xWidth)/ this.tileWidth);

		let firstY = Math.floor(position.y / this.tileHeight);
		let lastY = Math.ceil((position.y + yWidth)/ this.tileHeight);

		let tiles = new Array<Tile>();

		for (var x=firstX; x<lastX; x++){
			for (var y=firstY; y<lastY; y++){
				tiles.push(this.getTile(x, y))
			}
		}

		return tiles;
	}
}
