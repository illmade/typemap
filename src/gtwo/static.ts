import { Transform, WorldState } from "./view";
import { DrawLayer, CanvasLayer } from "./canvasview";
import { DisplayElement } from "./display";

export class StaticImage extends DrawLayer implements DisplayElement {

	private img: HTMLImageElement;

	private visible = true;

	constructor(worldState: WorldState, 
		imageSrc: string, 
		public opacity: number) {

		super(worldState);
		
		this.img = new Image();
		this.img.src = imageSrc;
	};

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

	private drawImage(ctx: CanvasRenderingContext2D, transform: Transform){

		let ctxTransform = transform.modify(this.worldState);
		let width = this.img.width * ctxTransform.zoomX;
		let height = this.img.height * ctxTransform.zoomY;

		this.prepareCtx(ctx, ctxTransform, width, height);
		
		ctx.globalAlpha = this.opacity;

		ctx.drawImage(this.img, 0, 0);
		
		ctx.globalAlpha = 1;

		this.cleanCtx(ctx, ctxTransform);

	}

	draw(ctx: CanvasRenderingContext2D, transform: Transform){
		if (this.visible){
			if (this.img.complete) {
				this.drawImage(ctx, transform);
			}
			else {
				this.img.onload = (event) => {
					this.img.crossOrigin = "Anonymous";
					this.drawImage(ctx, transform);
				};
			}
		}
	};

}
