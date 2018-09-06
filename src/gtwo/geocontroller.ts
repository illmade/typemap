import { CanvasView } from "./canvasview";
import { CanvasLayer } from "./layer";
import { OffsetProjection } from "./projection";
import { MouseController } from "./viewcontroller";

export class ImageController extends MouseController {

    constructor(canvasView: CanvasView, readonly canvasLayer: CanvasLayer) {
    	super();
    	document.addEventListener("keypress", (e:Event) => 
    		this.pressed(canvasView, e  as KeyboardEvent));
    }

    pressed(canvasView: CanvasView, e: KeyboardEvent){

    }

}