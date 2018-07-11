import { Tile, TileLayer } from "../geom/tile";
import { Point2D } from "../geom/point2d";

export abstract class CanvasTile extends Tile {

	abstract draw(canvas: CanvasRenderingContext2D, scalingX: number, scalingY: number, 
		canvasX: number, canvasY: number): void;

}

export class ImageStruct {

	prefix: string = "";
	suffix: string = "";
	tileDir: string = "images/";
	visible: boolean = true;
	tileWidthPx: number = 256;
	tileHeightPx: number = 256;

}

export class ImageTile extends CanvasTile {

	private img: HTMLImageElement;

	constructor(readonly xIndex: number, readonly yIndex: number, imageSrc: string) {
		super(xIndex, yIndex);
		this.img = new Image();
		this.img.src = imageSrc;
	};

	private drawImage(ctx: CanvasRenderingContext2D, scalingX: number,  scalingY: number, 
			canvasX: number, canvasY: number){
		console.log("scaling " + scalingX + " " + scalingY);
		ctx.save();
		ctx.scale(scalingX, scalingY);
		ctx.drawImage(this.img, canvasX, canvasY);
		ctx.restore();
	}

	draw(ctx: CanvasRenderingContext2D, scalingX: number,  scalingY: number, 
			canvasX: number, canvasY: number){
		if (this.img.complete) {
			this.drawImage(ctx, scalingX, scalingY, canvasX, canvasY);
		}
		else {
			this.img.onload = (event) => {
				this.drawImage(ctx, scalingX, scalingY, canvasX, canvasY);
			};
		}
	};

}

export class ImageTileLayer extends TileLayer {

	readonly imageProperties: ImageStruct;

	constructor(widthMapUnits: number, heightMapUnits: number, imageProperties: ImageStruct) {
		super(widthMapUnits, heightMapUnits);
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
