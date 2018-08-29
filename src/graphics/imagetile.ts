import { CanvasTile, CanvasTileLayer } from "./canvastile"
import { ImageStruct, TileStruct } from "./display"
import { Tile, AbstractTileLayer } from "../geom/tile"

export class ImageTile extends CanvasTile {

	private img: HTMLImageElement;

	constructor(xIndex: number, yIndex: number, imageSrc: string) {
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

export class ImageTileLayer extends AbstractTileLayer implements CanvasTileLayer {

	constructor(public viewProperties: ImageStruct, readonly fileProperties: TileStruct) {
		super(viewProperties.heightMapUnits, viewProperties.heightMapUnits);	
	}

	getOpacity(): number {
		return this.viewProperties.getOpacity();
	}

	isVisible(): boolean {
		return this.viewProperties.isVisible();
	}

	setVisible(visible: boolean) {
		this.viewProperties.setVisible(visible);
	}

	/**
	  leave caching up to the browser
	**/
	getTile(xUnits: number, yUnits: number): Tile {
		let imageSrc = this.fileProperties.tileDirectory + 
			this.fileProperties.prefix + xUnits + "_" + yUnits + this.fileProperties.suffix;
		return new ImageTile(xUnits-1, yUnits+1, imageSrc);
	}

}
