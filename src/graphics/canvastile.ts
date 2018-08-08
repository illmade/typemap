import { Tile, TileLayer } from "../geom/tile";
import { Point2D } from "../geom/point2d";

export abstract class CanvasTile extends Tile {

	abstract draw(ctx: CanvasRenderingContext2D, scalingX: number, scalingY: number, 
		canvasX: number, canvasY: number): void;

}

export class ImageStruct {

	prefix: string = "";
	suffix: string = "";
	tileDir: string = "images/";
	visible: boolean = true;
	opacity: number = 0.7;
	tileWidthPx: number = 256;
	tileHeightPx: number = 256;
	widthMapUnits: number = 1;
	heightMapUnits: number = 1; 

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

export class StaticImage {

	private img: HTMLImageElement;

	constructor(public xIndex: number, public yIndex: number, 
		public scalingX: number, public scalingY: number, public rotation: number, 
		imageSrc: string, public alpha: number) {
		
		this.img = new Image();
		this.img.src = imageSrc;
	};

	private drawImage(ctx: CanvasRenderingContext2D, canvasX: number, canvasY: number){

		//scalingX = scalingX * this.scaling;
		//scalingY = scalingY * this.scaling;

		// let cosX = Math.cos(this.rotation);
		// let sinX = Math.sin(this.rotation);

		ctx.translate(canvasX, canvasY);
		ctx.rotate(this.rotation);
		ctx.scale(this.scalingX, this.scalingY);
		//console.log("xyScaling " + this.scalingX + ", " + this.scalingY);
		ctx.globalAlpha = this.alpha;

		// ctx.transform(cosX * scalingX, sinX * scalingY, -sinX * scalingX, cosX * scalingY, 
		// 	canvasX / this.scaling, canvasY / this.scaling);

		ctx.drawImage(this.img, -(this.img.width/2), -(this.img.height/2));
		
		ctx.scale(1/this.scalingX, 1/this.scalingY);
		ctx.rotate(-this.rotation);
		ctx.translate(-canvasX, -canvasY);
		ctx.globalAlpha = 1;
	}

	draw(ctx: CanvasRenderingContext2D, canvasX: number, canvasY: number){
		if (this.img.complete) {
			this.drawImage(ctx, canvasX, canvasY);
		}
		else {
			this.img.onload = (event) => {
				this.img.crossOrigin = "Anonymous";
				this.drawImage(ctx, canvasX, canvasY);
			};
		}
	};

}


export abstract class ShowTileLayer extends TileLayer {
	
	constructor(public imageProperties: ImageStruct){
		super(imageProperties.widthMapUnits, imageProperties.heightMapUnits);
	}

}

export class ImageTileLayer extends ShowTileLayer {

	readonly imageProperties: ImageStruct;

	constructor(imageProperties: ImageStruct) {
		//super(imageProperties.widthMapUnits, imageProperties.heightMapUnits);
		super(imageProperties);
		//this.imageProperties = imageProperties;
	}

	/**
	  leave caching up to the browser
	**/
	getTile(xUnits: number, yUnits: number): Tile {
		let imageSrc = this.imageProperties.tileDir + 
			this.imageProperties.prefix + xUnits + "_" + yUnits + this.imageProperties.suffix;
		return new ImageTile(xUnits-1, yUnits+1, imageSrc);
	}

}

export class SlippyTileLayer extends ShowTileLayer {

	readonly imageProperties: ImageStruct;
	private baseX = 0;
	private baseY = 0;

	constructor(imageProperties: ImageStruct, private zoom: number,
		private xOffset: number, private yOffset: number) {
		//super(imageProperties.widthMapUnits, imageProperties.heightMapUnits);
		super(imageProperties);
		//this.imageProperties = imageProperties;
	}

	private offsets(){
		let zoomExp = Math.pow(2, this.zoom);
		this.baseX = this.xOffset / zoomExp;
		this.baseY = this.yOffset / zoomExp;
	}

	/**
	  leave caching up to the browser
	**/
	getTile(xUnits: number, yUnits: number): Tile {
		
		let imageSrc = this.imageProperties.tileDir + this.zoom + "/" + (this.xOffset+xUnits) + "/" + 
			 + (this.yOffset+yUnits) + this.imageProperties.suffix;
		return new ImageTile(xUnits, yUnits, imageSrc);
	}

}
