import { DrawLayer } from "./layer";
import { Transform, BasicTransform, ViewTransform, combineTransform } from "./view";
import { Dimension } from "../geom/point2d";

export class TileStruct {
	
	constructor(
		public prefix: string,
		public suffix: string,
		public tileDirectory: string){}
}

export function zoomByLevel(zoomLevel: number){
	return Math.pow(2, zoomLevel);
}

export class TileLayer extends DrawLayer {

	tileManager: TileManager;

	constructor(
		localTransform: Transform, 
		readonly tileStruct: TileStruct,
		visbile: boolean,
		name: string = "tiles",
		public xOffset: number = 0,
		public yOffset: number = 0,
		public zoom: number = 1,
		readonly gridWidth: number = 256, 
		readonly gridHeight: number = 256,
		opacity: number = 1){

		super(localTransform, opacity, visbile, name);

		this.tileManager = new TileManager();
	}

	draw(ctx: CanvasRenderingContext2D, parentTransform: Transform, view: ViewTransform): boolean {

		if (this.isVisible()){

			let ctxTransform = combineTransform(this, parentTransform);

			let zoomWidth: number = this.gridWidth * ctxTransform.zoomX
			let zoomHeight: number = this.gridHeight * ctxTransform.zoomY;

			let transformX = view.x + ctxTransform.x;
			let transformY = view.y + ctxTransform.y;

			let viewX = view.x * view.zoomX;
			let viewY = view.y * view.zoomY;

			let viewWidth = view.width / view.zoomX;
			let viewHeight = view.height / view.zoomY;

			let gridAcross = viewWidth / zoomWidth;
			let gridHigh = viewHeight / zoomHeight;

			let xMin = Math.floor(transformX / zoomWidth);
			let xMax = Math.ceil((transformX + viewWidth) / zoomWidth);

			let yMin = Math.floor(transformY / zoomHeight);
			let yMax = Math.ceil((transformY + viewHeight) / zoomHeight);

			var drawingComplete = true;

			let fullZoomX = ctxTransform.zoomX * view.zoomX;
			let fullZoomY = ctxTransform.zoomY * view.zoomY;

			ctx.scale(fullZoomX, fullZoomY);

			for (var x = xMin; x<xMax; x++){
				let xMove = x * this.gridWidth - transformX / ctxTransform.zoomX;
				for (var y = yMin; y<yMax; y++){
					let yMove = y * this.gridHeight - transformY / ctxTransform.zoomY;
					//console.log("tile x y " + x + " " + y + ": " + xMove + ", " + yMove);

					ctx.translate(xMove, yMove);
					let tileSrc = this.tileStruct.tileDirectory + this.zoom + "/" + 
						(x + this.xOffset) + "/" + 
						(y + this.yOffset) + this.tileStruct.suffix;

					if (this.tileManager.has(tileSrc)) {
						let imageTile = this.tileManager.get(tileSrc);
						drawingComplete = drawingComplete && imageTile.draw(ctx);
					}
					else {
						let imageTile = new ImageTile(x, y, tileSrc);

						drawingComplete = drawingComplete && imageTile.draw(ctx);

						this.tileManager.set(tileSrc, imageTile);
					}

					ctx.translate(-xMove, -yMove);
				}
			}

			ctx.scale(1 / fullZoomX, 1 / fullZoomY);

			//console.log("drew tiles " + drawingComplete);
			return drawingComplete;
		} else { 
			return true;
		}
	}

	getDimension(): Dimension {
		return new Dimension(0, 0, 0, 0);
	}
}

export class TileManager {

	tileMap: Map<string, ImageTile>;

	constructor(){
		this.tileMap = new Map<string, ImageTile>();
	}

	get(tileKey: string): ImageTile {
		return this.tileMap.get(tileKey);
	}

	has(tileKey: string): boolean {
		return this.tileMap.has(tileKey);
	}

	set(tileKey: string, tile: ImageTile){
		this.tileMap.set(tileKey, tile);
	}

}

export class ImageTile {

	private img: HTMLImageElement;
	private exists: boolean;

	constructor(readonly xIndex: number, readonly yIndex: number, imageSrc: string) {
		this.img = new Image();
		this.img.src = imageSrc;
		this.img.onerror = function(eventOrMessage: any){
			eventOrMessage.target.src = "";
		};
	};

	private drawImage(ctx: CanvasRenderingContext2D){
		ctx.drawImage(this.img, 0, 0);
	}

	draw(ctx: CanvasRenderingContext2D): boolean {
		if (this.img.src != "" && this.img.complete ) {
			this.drawImage(ctx);
			return true;
		}
		return false;
	};

}