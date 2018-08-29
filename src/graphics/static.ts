import { DisplayElement } from "./display"

export class StaticImage implements DisplayElement {

	private img: HTMLImageElement;

	isVisible(): boolean {
		return true;
	}

	setVisible(visible: boolean){
		
	}

	getOpacity(): number {
		return this.opacity;
	}

	constructor(public xIndex: number, public yIndex: number, 
		public scalingX: number, public scalingY: number, public rotation: number, 
		imageSrc: string, public opacity: number) {
		
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
		ctx.globalAlpha = this.opacity;

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
