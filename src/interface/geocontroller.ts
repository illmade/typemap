import { CanvasView } from "../graphics/canvasview";
import { CanvasLayer } from "../graphics/layer";
import { OffsetProjection } from "../geom/projection";
import { Point2D } from "../geom/point2d";
import { MouseController } from "./viewcontroller";

export class GeoController extends MouseController {

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