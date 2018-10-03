import { Transform, BasicTransform, 
	ViewTransform, 
	combineTransform } from "./view";
import { DisplayElement } from "./canvasview";
import { Dimension } from "../geom/point2d";

export abstract class CanvasElement extends BasicTransform implements 
  DisplayElement {

	constructor(
	  public localTransform: Transform, 
	  public opacity = 1, 
	  public visible = true,
	  public name = "",
	  public description = "",
	  ){
		super(localTransform.x, localTransform.y, localTransform.zoomX, localTransform.zoomY, 
			localTransform.rotation);
	}

	abstract draw(ctx: CanvasRenderingContext2D, parentTransform: Transform, 
		view: ViewTransform): boolean;

	abstract getDimension(): Dimension;

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

export abstract class DrawLayer extends CanvasElement {

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