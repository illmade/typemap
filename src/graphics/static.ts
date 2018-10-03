import { Transform, BasicTransform, combineTransform } from "./view";
import { DrawLayer, CanvasElement } from "./layer";
import { DisplayElement } from "./canvasview";
import { Dimension, rotate, Point2D } from "../geom/point2d";

export interface Thumb extends DisplayElement {

	drawThumb(ctx: CanvasRenderingContext2D, w: number, h: number): boolean;

}

export class StaticImage extends DrawLayer implements Thumb {

	private img: HTMLImageElement;

	constructor(
	  localTransform: Transform, 
	  imageSrc: string, 
	  opacity: number,
	  visible: boolean,
	  description: string,
	) {

		super(localTransform, opacity, visible, imageSrc, description);
		
		this.img = new Image();
		this.img.src = imageSrc;
	}

	private drawImage(ctx: CanvasRenderingContext2D, parentTransform: Transform, view: Transform){

		if (this.isVisible()){
			let ctxTransform = combineTransform(this, parentTransform);

			this.prepareCtx(ctx, ctxTransform, view);
			
			ctx.globalAlpha = this.opacity;
			ctx.drawImage(this.img, 0, 0);
			ctx.globalAlpha = 1;

			this.cleanCtx(ctx, ctxTransform, view);
		}
		
	}

	draw(ctx: CanvasRenderingContext2D, parentTransform: Transform, 
	  view: Transform): boolean {

		if (this.visible && this.img.complete) {
			this.drawImage(ctx, parentTransform, view);
			return true;
		}
		else if (!this.img.complete){
			return false;
		}
		return true;
	}

	drawThumb(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
		
		if (this.visible && this.img.complete) {
			let scaleX = w / this.img.width;
			let scaleY = h / this.img.height;
			let scale = Math.min(scaleX, scaleY);
			ctx.scale(scale, scale);
			//console.log("scalex " + (this.img.width * scale));
			//console.log("scaley " + (this.img.height * scale));
			//console.log("xy " + this.img.x + ", " + this.img.y);
			ctx.drawImage(this.img, 0, 0);
			ctx.scale(1/scale, 1/scale);
			return true;
		}
		else if (!this.img.complete){
			return false;
		}
		return true;
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

			return new Dimension(this.x + minX, this.y - maxY, maxX-minX, maxY-minY);
		}

		return new Dimension(this.x, this.y, 0, 0);
	}
}

export class RectLayer extends DrawLayer implements DisplayElement {

	constructor(private dimension: Dimension, 
		opacity: number,
		visible: boolean) {

		super(new BasicTransform(dimension.x, dimension.y, 1, 1, 0), 
			opacity, visible, "rect");
	}

	updateDimension(dimension: Dimension): void {
		this.dimension = dimension;
	}

	draw(ctx: CanvasRenderingContext2D, parentTransform: Transform, 
		view: Transform): boolean {

		let x = (this.dimension.x + parentTransform.x - view.x) * view.zoomX;
		let y = (this.dimension.y + parentTransform.y - view.y) * view.zoomY;

		ctx.strokeStyle = "red";
		ctx.strokeRect(x, y, this.dimension.w * view.zoomX, this.dimension.h * view.zoomY);

		return true;
	}

	getDimension(): Dimension {
		return this.dimension;
	}

}