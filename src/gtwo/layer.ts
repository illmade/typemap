import { Transform, BasicTransform, ViewTransform, combineTransform } from "./view";
import { DisplayElement } from "./canvasview";

export abstract class CanvasLayer extends BasicTransform {

	constructor(public localTransform: Transform, public opacity: number){
		super(localTransform.x, localTransform.y, localTransform.zoomX, localTransform.zoomY, localTransform.rotation);
	}

	abstract draw(ctx: CanvasRenderingContext2D, parentTransform: Transform, view: ViewTransform): boolean;

}

export abstract class DrawLayer extends CanvasLayer {

    protected prepareCtx(ctx: CanvasRenderingContext2D, transform: Transform, view: Transform): void {
		ctx.translate((transform.x - view.x) * view.zoomX, (transform.y - view.y) * view.zoomY);
		ctx.scale(transform.zoomX * view.zoomX, transform.zoomY * view.zoomY);
		ctx.rotate(transform.rotation);
    }

    protected cleanCtx(ctx: CanvasRenderingContext2D, transform: Transform, view: Transform): void {	
		ctx.rotate(-transform.rotation);
		ctx.scale(1/transform.zoomX/view.zoomX, 1/transform.zoomY/view.zoomY);
		ctx.translate(-(transform.x -view.x) *view.zoomX, -(transform.y - view.y) * view.zoomY);
    }

}

export class ContainerLayer extends CanvasLayer implements DisplayElement {

	private visible = true;

	layerMap: Map<string, CanvasLayer>;

	constructor(localTransform: Transform, opacity: number) {
		super(localTransform, opacity);
		this.layerMap = new Map<string, CanvasLayer>();
	}

	set(name: string, layer: CanvasLayer){
		this.layerMap.set(name, layer);
	}

	get(name: string): CanvasLayer {
		return this.layerMap.get(name);
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

	draw(ctx: CanvasRenderingContext2D, parentTransform: Transform, view: ViewTransform): boolean {

		let layerTransform = combineTransform(this.localTransform, parentTransform);

		var drawingComplete = true;

		for (let layer of this.layerMap) {
			drawingComplete = drawingComplete && layer[1].draw(ctx, layerTransform, view);
		}

		return drawingComplete;
	}

}