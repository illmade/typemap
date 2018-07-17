import { ViewCanvas } from "../graphics/viewcanvas";
import { Point2D } from "../geom/point2d";

export class ZoomController {

    constructor(viewCanvas: ViewCanvas, readonly zoomIn: HTMLElement, readonly zoomOut: HTMLElement) {
    	zoomIn.addEventListener("click", (e:Event) => this.clicked(e, viewCanvas, .95));
    	zoomOut.addEventListener("click", (e:Event) => this.clicked(e, viewCanvas, 1.05));
    	viewCanvas.ctx.canvas.addEventListener("dblclick", (e:Event) => 
    		this.clicked(e, viewCanvas, .75));
    }

    clicked(event: Event, viewCanvas: ViewCanvas, zoom: number) {
    	console.log("clicked" + event.target + ", " + event.type);

    	viewCanvas.zoomView(zoom);

    	viewCanvas.draw();
    };

};

export class PanController {

	private xPrevious: number;
	private yPrevious: number;
	private record: boolean = false;

    constructor(viewCanvas: ViewCanvas, readonly dragElement: HTMLElement) {
    	dragElement.addEventListener("mousemove", (e:Event) => 
    		this.dragged(e as MouseEvent, viewCanvas));
    	dragElement.addEventListener("mousedown", (e:Event) => 
    		this.dragged(e as MouseEvent, viewCanvas));
    	dragElement.addEventListener("mouseup", (e:Event) => 
    		this.dragged(e as MouseEvent, viewCanvas));
    }

    dragged(event: MouseEvent, viewCanvas: ViewCanvas) {

    	switch(event.type){
    		case "mousedown":
    			this.record = true;
    			break;
    		case "mouseup":
    			this.record = false;
    			break;
    		default:
    			if (this.record){
    				let xDelta = (event.clientX - this.xPrevious) / 512;
	    			let yDelta = (event.clientY - this.yPrevious) / 512;

	    			let newTopLeft = new Point2D(viewCanvas.topLeft.x - xDelta, 
	    				viewCanvas.topLeft.y - yDelta);

	    			viewCanvas.moveView(newTopLeft);
	    			viewCanvas.draw();
    			}
    			
    	}

		this.xPrevious = event.clientX;
		this.yPrevious = event.clientY;

    };

};

