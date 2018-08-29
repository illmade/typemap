import { DrawLayer } from "./layer";
import { Transform, BasicTransform, ViewTransform, combineTransform } from "./view";

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
		public xOffset: number = 0,
		public yOffset: number = 0,
		public zoom: number = 1,
		readonly gridWidth: number = 256, 
		readonly gridHeight: number = 256,
		opacity: number = 1){

		super(localTransform, opacity);

		this.tileManager = new TileManager();
	}

	draw(ctx: CanvasRenderingContext2D, parentTransform: Transform, view: ViewTransform): boolean {

		let ctxTransform = combineTransform(this, parentTransform);

		let zoomWidth: number = this.gridWidth * ctxTransform.zoomX
		let zoomHeight: number = this.gridHeight * ctxTransform.zoomY;

		//console.log("ctx zoomWidth: " + zoomWidth);

		let viewX = view.x * view.zoomX;
		let viewY = view.y * view.zoomY;

		let viewWidth = view.width / view.zoomX;
		let viewHeight = view.height / view.zoomY;

		let gridAcross = viewWidth / zoomWidth; //good
		let gridHigh = viewHeight / zoomHeight; //good

		let xMin = Math.floor(view.x/zoomWidth);
		let xMax = Math.ceil((view.x + viewWidth) / zoomWidth);

		let yMin = Math.floor(view.y/zoomHeight);
		let yMax = Math.ceil((view.y + viewHeight) / zoomHeight);

		//console.log("x y s " + xMin + ", " + xMax + ": " + yMin + ", " + yMax);
		//console.log("across high" + gridAcross + ", " + gridHigh);

		var drawingComplete = true;

		let fullZoomX = ctxTransform.zoomX * view.zoomX;
		let fullZoomY = ctxTransform.zoomY * view.zoomY;

		//console.log("fullzooms " + fullZoomX + " " + fullZoomY);

		ctx.scale(fullZoomX, fullZoomY);

		for (var x = xMin; x<xMax; x++){
			let xMove = x * this.gridWidth - view.x / ctxTransform.zoomX;
			for (var y = yMin; y<yMax; y++){
				let yMove = y * this.gridHeight - view.y/ ctxTransform.zoomY;
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

		console.log("drew tiles " + drawingComplete);
		return drawingComplete;
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
