import { Transform, combineTransform } from "./view";
import { DrawLayer, CanvasLayer } from "./layer";
import { DisplayElement } from "./canvasview";

export class StaticImage extends DrawLayer implements DisplayElement {

	private img: HTMLImageElement;

	private visible = true;

	constructor(localTransform: Transform, 
		imageSrc: string, 
		opacity: number) {

		super(localTransform, opacity);
		
		this.img = new Image();
		this.img.src = imageSrc;
	}

	isVisible(): boolean {
		return this.visible;
	}

	setVisible(visible: boolean): void {
		this.visible = visible;
	}

	getOpacity(): number {
		return this.opacity;
	}

	setOpacity(opacity: number): void {
		this.opacity = opacity;
	}

	private drawImage(ctx: CanvasRenderingContext2D, parentTransform: Transform, view: Transform){

		let ctxTransform = combineTransform(this, parentTransform);

		console.log("ctx x " + ctxTransform.x);

		this.prepareCtx(ctx, ctxTransform, view);
		
		ctx.globalAlpha = this.opacity;
		ctx.drawImage(this.img, 0, 0);
		ctx.globalAlpha = 1;

		this.cleanCtx(ctx, ctxTransform, view);
	}

	draw(ctx: CanvasRenderingContext2D, parentTransform: Transform, view: Transform): boolean {
		if (this.visible && this.img.complete) {
			this.drawImage(ctx, parentTransform, view);
			console.log("drew image " + this.img.src);
			return true;
		}
		return false;
	}
}
