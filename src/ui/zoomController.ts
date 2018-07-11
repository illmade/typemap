import { ViewCanvas } from "../graphics/viewcanvas";

export class ZoomController {

    constructor(viewCanvas: ViewCanvas, readonly zoomIn: HTMLElement, readonly zoomOut: HTMLElement) {
    	zoomIn.addEventListener("click", (e:Event) => this.clicked(e, viewCanvas, 0.1));
    	zoomOut.addEventListener("click", (e:Event) => this.clicked(e, viewCanvas, -0.1));
    }

    clicked(event: Event, viewCanvas: ViewCanvas, zoom: number) {
    	console.log("clicked" + event.target + ", " + event.type);
    	viewCanvas.setView(viewCanvas.width + zoom, viewCanvas.height + zoom);
    	viewCanvas.draw();
    };

};

