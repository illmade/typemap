import { CanvasView } from "./canvasview";
import { CanvasLayer } from "./layer";
import { OffsetProjection } from "./projection";
import { Point2D } from "./projection";
import { MouseController } from "./viewcontroller";

export class ImageController extends MouseController {

	private projection: OffsetProjection;

    constructor(canvasView: CanvasView, readonly canvasLayer: CanvasLayer) {
    	super();

    	this.projection = new OffsetProjection(new Point2D(0, 0));

    	document.addEventListener("keypress", (e:Event) => 
    		this.pressed(canvasView, e  as KeyboardEvent));
    }

    pressed(canvasView: CanvasView, e: KeyboardEvent){

    }

}