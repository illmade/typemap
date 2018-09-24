import { Transform, BasicTransform, combineTransform } from "./view";
import { DrawLayer, CanvasLayer } from "./layer";
import { DisplayElement, ZoomDisplayRange } from "./canvasview";
import { Dimension, rotate, Point2D } from "../geom/point2d";

export class StaticImage extends DrawLayer implements DisplayElement {

	private img: HTMLImageElement;

	constructor(localTransform: Transform, 
	  imageSrc: string, 
	  opacity: number,
	  visible: boolean,
	  zoomDisplayRange: ZoomDisplayRange = ZoomDisplayRange.AllZoomRange) {

		super(localTransform, opacity, visible, zoomDisplayRange);
		
		this.img = new Image();
		this.img.src = imageSrc;
	}

	private drawImage(ctx: CanvasRenderingContext2D, parentTransform: Transform, view: Transform){

		if (this.isVisible() && this.getZoomDisplayRange().withinRange(view.zoomX)){
			let ctxTransform = combineTransform(this, parentTransform);

			//console.log("ctx x " + ctxTransform.x);

			this.prepareCtx(ctx, ctxTransform, view);
			
			ctx.globalAlpha = this.opacity;
			ctx.drawImage(this.img, 0, 0);
			ctx.globalAlpha = 1;

			this.cleanCtx(ctx, ctxTransform, view);
		}
		
	}

	draw(ctx: CanvasRenderingContext2D, parentTransform: Transform, view: Transform): boolean {
		if (this.visible && this.img.complete) {
			this.drawImage(ctx, parentTransform, view);
		//	console.log("drew image " + this.img.src);
			return true;
		}
		return false;
	}

	getDimension(): Dimension {
		
		if (this.img.complete){
			var width = this.img.width * this.zoomX;
			var height = this.img.height * this.zoomY;

			let p1 = rotate(new Point2D(width, 0), this.rotation);
			let p2 = rotate(new Point2D(width, -height), this.rotation);
			let p3 = rotate(new Point2D(0, -height), this.rotation);

			let minX = Math.min(0, p1.x, p2.x, p3.x);
			let minY = Math.min(0, p1.y, p2.y, p3.y);
			let maxX = Math.max(0, p1.x, p2.x, p3.x);
			let maxY = Math.max(0, p1.y, p2.y, p3.y);

			console.log("minx: " + minX);
			console.log("height: " + (maxY - minY));
			
			return new Dimension(this.x + minX, this.y - maxY, maxX-minX, maxY-minY);
		}

		return new Dimension(this.x, this.y, 0, 0);
	}
}

export class RectLayer extends DrawLayer implements DisplayElement {

	constructor(private dimension: Dimension, 
		opacity: number,
		visible: boolean,
		zoomDisplayRange: ZoomDisplayRange = ZoomDisplayRange.AllZoomRange) {

		super(new BasicTransform(dimension.x, dimension.y, 1, 1, 0), 
			opacity, visible, zoomDisplayRange);
	}

	updateDimension(dimension: Dimension){
		this.dimension = dimension;
	}

	draw(ctx: CanvasRenderingContext2D, parentTransform: Transform, view: Transform): boolean {

		let x = (this.dimension.x + parentTransform.x - view.x) * view.zoomX;
		let y = (this.dimension.y + parentTransform.y - view.y) * view.zoomY;

		//console.log("dimension " + this.dimension.x);

		//console.log("outline: " + x + " view: " + view.x + 
		//	" parent " + parentTransform.x + " w " + this.dimension.w);
		ctx.strokeStyle = "red";
		ctx.strokeRect(x, y, this.dimension.w * view.zoomX, this.dimension.h * view.zoomY);

		return true;
	}

	getDimension(): Dimension {
		return this.dimension;
	}

}
