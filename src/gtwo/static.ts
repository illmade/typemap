import { Transform, combineTransform } from "./view";
import { DrawLayer, CanvasLayer } from "./layer";
import { DisplayElement } from "./canvasview";

export class StaticImage extends DrawLayer implements DisplayElement {

	private img: HTMLImageElement;

	constructor(localTransform: Transform, 
		imageSrc: string, 
		opacity: number,
		visible: boolean) {

		super(localTransform, opacity, visible);
		
		this.img = new Image();
		this.img.src = imageSrc;
	}

	private drawImage(ctx: CanvasRenderingContext2D, parentTransform: Transform, view: Transform){

		if (this.isVisible()){
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
}
