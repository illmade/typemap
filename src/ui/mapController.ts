import { ViewCanvas } from "../graphics/viewcanvas";
import { Point2D } from "../geom/point2d";

abstract class ZoomListener {
	abstract zoom(by: number);
}

export class ZoomController {

	private listeners: Array<ZoomListener> = [];
	private zoom = 1;

    constructor(viewCanvas: ViewCanvas, readonly zoomIn: HTMLElement, readonly zoomOut: HTMLElement) {
    	zoomIn.addEventListener("click", (e:Event) => this.clicked(e, viewCanvas, .95));
    	zoomOut.addEventListener("click", (e:Event) => this.clicked(e, viewCanvas, 1.05));
    	viewCanvas.ctx.canvas.addEventListener("dblclick", (e:Event) => 
    		this.clicked(e, viewCanvas, .75));
    }

    addZoomListener(zoomListener: ZoomListener){
    	this.listeners.push(zoomListener);
    }

    clicked(event: Event, viewCanvas: ViewCanvas, by: number) {
    	console.log("clicked" + event.target + ", " + event.type);

    	viewCanvas.zoomView(by);
    	console.log("listeners " + this.listeners.length);

    	this.zoom = this.zoom * by;
    	for (let value of this.listeners){
    		value.zoom(this.zoom);
    	}

    	viewCanvas.draw();
    };

};

export class PanController extends ZoomListener{

	private xPrevious: number;
	private yPrevious: number;
	private record: boolean = false;
	private baseMove: number = 512;
	private move: number = 512;

    constructor(viewCanvas: ViewCanvas, readonly dragElement: HTMLElement) {
    	super();
    	dragElement.addEventListener("mousemove", (e:Event) => 
    		this.dragged(e as MouseEvent, viewCanvas));
    	dragElement.addEventListener("mousedown", (e:Event) => 
    		this.dragged(e as MouseEvent, viewCanvas));
    	dragElement.addEventListener("mouseup", (e:Event) => 
    		this.dragged(e as MouseEvent, viewCanvas));
    }

    zoom(by: number){
    	console.log("zoom by " + by);
    	this.move = this.baseMove / by;
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

    				let xDelta = (event.clientX - this.xPrevious) / this.move;
	    			let yDelta = (event.clientY - this.yPrevious) / this.move;

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

