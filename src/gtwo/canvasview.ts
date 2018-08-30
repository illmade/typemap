import { CanvasLayer } from "./layer";
import { 
	invertTransform, 
	ViewTransform, BasicViewTransform, Transform, BasicTransform } from "./view";

export interface DisplayElement extends Transform {
	isVisible(): boolean;
	setVisible(visible: boolean): void;
	getOpacity(): number;
	setOpacity(opacity: number): void;
}

export class CanvasView extends BasicViewTransform {

	layers: Array<CanvasLayer> = [];
	ctx: CanvasRenderingContext2D;

	constructor(
		localTransform: Transform, 
		width: number, height: number, 
		readonly canvasElement: HTMLCanvasElement){

		super(localTransform.x, localTransform.y, width, height, 
			localTransform.zoomX, localTransform.zoomY, 
			localTransform.rotation);

		this.initCanvas();

		this.ctx = canvasElement.getContext("2d");
	}

	zoomAbout(x: number, y: number, zoomBy: number){

        this.zoomX = this.zoomX * zoomBy;
        this.zoomY = this.zoomY * zoomBy;

        let relativeX = x * zoomBy - x;
        let relativeY = y * zoomBy - y;

        let worldX = relativeX / this.zoomX;
        let worldY = relativeY / this.zoomY;

        this.x = this.x + worldX;
        this.y = this.y + worldY;

	}

	draw(): boolean {
		let transform = invertTransform(this);

		this.ctx.fillStyle = "grey";
		this.ctx.fillRect(0, 0, this.width, this.height);

		var drawingComplete = true;

		for (let layer of this.layers){
			if (layer.isVisible()){
				drawingComplete = drawingComplete && layer.draw(this.ctx, BasicTransform.unitTransform, this);
			}
			
		}

		this.drawCentre(this.ctx);

		return drawingComplete;
	}

	drawCentre(context: CanvasRenderingContext2D){
        context.beginPath();
        context.globalAlpha = 0.3;
        context.strokeStyle = "red";
        context.moveTo(this.width/2, 6/16*this.height);
        context.lineTo(this.width/2, 10/16*this.height);
        context.moveTo(7/16*this.width, this.height/2);
        context.lineTo(9/16*this.width, this.height/2);
        context.stroke();
        context.strokeStyle = "black";
        context.globalAlpha = 1;
    }

	private initCanvas(){
        let width = this.canvasElement.clientWidth;
        let height = this.canvasElement.clientHeight;

        this.canvasElement.width = width;
        this.canvasElement.height = height;
	}

}