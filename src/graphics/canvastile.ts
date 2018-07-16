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

	private drawImage(ctx: CanvasRenderingContext2D, canvasX: number, canvasY: number){
		ctx.drawImage(this.img, canvasX, canvasY);
	}

	draw(ctx: CanvasRenderingContext2D, scalingX: number,  scalingY: number, 
			canvasX: number, canvasY: number){
		if (this.img.complete) {
			this.drawImage(ctx, canvasX, canvasY);
		}
		else {
			this.img.onload = (event) => {
				this.drawImage(ctx, canvasX, canvasY);
			};
		}
	};

}

export class StaticImage {

	private img: HTMLImageElement;

	constructor(public xIndex: number, public yIndex: number, 
		public scalingX: number, public scalingY: number, public rotation: number, 
		imageSrc: string, readonly alpha: number) {
		
		this.img = new Image();
		this.img.src = imageSrc;
	};

	private drawImage(ctx: CanvasRenderingContext2D, canvasX: number, canvasY: number){

		//scalingX = scalingX * this.scaling;
		//scalingY = scalingY * this.scaling;

		let cosX = Math.cos(this.rotation);
		let sinX = Math.sin(this.rotation);

		ctx.translate(canvasX, canvasY);
		ctx.rotate(this.rotation);
		ctx.scale(this.scalingX, this.scalingY);
		ctx.globalAlpha = this.alpha;

		// ctx.transform(cosX * scalingX, sinX * scalingY, -sinX * scalingX, cosX * scalingY, 
		// 	canvasX / this.scaling, canvasY / this.scaling);

		ctx.drawImage(this.img, -(this.img.width/2), -(this.img.height/2));
		
		ctx.scale(1/this.scalingX, 1/this.scalingY);
		ctx.rotate(-this.rotation);
		ctx.translate(-canvasX, -canvasY);

	}

	draw(ctx: CanvasRenderingContext2D, canvasX: number, canvasY: number){
		if (this.img.complete) {
			this.drawImage(ctx, canvasX, canvasY);
		}
		else {
			this.img.onload = (event) => {
				this.drawImage(ctx, canvasX, canvasY);
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
