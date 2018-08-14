import { toTransform, WorldState, ViewElement, BasicViewElement, Transform } from "./view"

export abstract class CanvasLayer {

	constructor(public readonly worldState: WorldState){}

	abstract draw(ctx: CanvasRenderingContext2D, transform: Transform);

}

export abstract class DrawLayer extends CanvasLayer {

    protected prepareCtx(ctx: CanvasRenderingContext2D, transform: Transform, 
    	width: number, height: number): void {

    	let widthTranslate = width * transform.zoomX;
    	let heightTranslate = height * transform.zoomY;


		ctx.translate(-widthTranslate/2, -heightTranslate/2);
		ctx.rotate(transform.rotation);
		ctx.translate(widthTranslate/2 + transform.x, heightTranslate/2 + transform.y);
		ctx.scale(transform.zoomX, transform.zoomY);
    }

    protected cleanCtx(ctx: CanvasRenderingContext2D, transform: Transform, 
    	width?: number, height?: number): void {
    	
		ctx.scale(1/transform.zoomX, 1/transform.zoomY);
		ctx.translate(-transform.x, -transform.y);
		ctx.rotate(-transform.rotation);
    }
}

export class CanvasView extends BasicViewElement implements ViewElement {

	layers: Array<CanvasLayer> = [];
	ctx: CanvasRenderingContext2D;

	constructor(
		worldState: WorldState, 
		width: number, height: number, 
		readonly canvasElement: HTMLCanvasElement){

		super(worldState.x, worldState.y, width, height, 
			worldState.zoomX, worldState.zoomY, 
			worldState.rotation);

		this.initCanvas();

		this.ctx = canvasElement.getContext("2d");
	}

	draw(){
		let transform = toTransform(this);
		for (let layer of this.layers){
			layer.draw(this.ctx, transform);
		}
	}

	private initCanvas(){
        let width = this.canvasElement.clientWidth;
        let height = this.canvasElement.clientHeight;

        this.canvasElement.width = width;
        this.canvasElement.height = height;
	}

}