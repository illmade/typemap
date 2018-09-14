import { Transform, BasicTransform, ViewTransform, combineTransform } from "./view";
import { DisplayElement } from "./canvasview";

export abstract class CanvasLayer extends BasicTransform implements DisplayElement {

	constructor(public localTransform: Transform, public opacity: number, public visible){
		super(localTransform.x, localTransform.y, localTransform.zoomX, localTransform.zoomY, localTransform.rotation);
	}

	abstract draw(ctx: CanvasRenderingContext2D, parentTransform: Transform, view: ViewTransform): boolean;

	isVisible(): boolean {
		return this.visible;
	}

	setVisible(visible: boolean): void {
		console.log("setting visibility: " + visible);
		this.visible = visible;
	}

	getOpacity(): number {
		return this.opacity;
	}

	setOpacity(opacity: number): void {
		this.opacity = opacity;
	}

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

export class ContainerLayer extends CanvasLayer {

	layerMap: Map<string, CanvasLayer>;
	displayLayers: Array<CanvasLayer>;

	constructor(localTransform: Transform, opacity: number = 1, visible: boolean = true) {
		super(localTransform, opacity, visible);
		this.layerMap = new Map<string, CanvasLayer>();
		this.displayLayers = [];
	}

	set(name: string, layer: CanvasLayer){
		this.layerMap.set(name, layer);
		this.displayLayers.push(layer);
	}

	get(name: string): CanvasLayer {
		return this.layerMap.get(name);
	}

	setTop(name: string) {
		let topLayer = this.get(name);
		if (topLayer != undefined){
			this.displayLayers = this.displayLayers.filter(function(element: CanvasLayer){ 
				if (element == topLayer){
					return false;
				} else {
					return true;
				}});
			this.displayLayers.push(topLayer);
		} else {
			console.log("top layer undefined " + name);
		}
	}

	draw(ctx: CanvasRenderingContext2D, parentTransform: Transform, view: ViewTransform): boolean {

		let layerTransform = combineTransform(this.localTransform, parentTransform);

		var drawingComplete = true;

		for (let layer of this.displayLayers) {
			if (layer.isVisible()){
				drawingComplete = drawingComplete && layer.draw(ctx, layerTransform, view);
			}
			
		}

		return drawingComplete;
	}

}