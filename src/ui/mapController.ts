import { ViewCanvas } from "../graphics/viewcanvas";
import { Point2D } from "../geom/point2d";

abstract class MouseController {

    mousePosition(event: MouseEvent, within: HTMLElement): Point2D {
        let m_posx = event.clientX + document.body.scrollLeft
                 + document.documentElement.scrollLeft;
        let m_posy = event.clientY + document.body.scrollTop
                 + document.documentElement.scrollTop;

        var e_posx = 0;
        var e_posy = 0;
        if (within.offsetParent){
            do { 
                e_posx += within.offsetLeft;
                e_posy += within.offsetTop;
            } while (within = <HTMLElement>within.offsetParent);
        }

        return new Point2D(m_posx - e_posx, m_posy - e_posy);
    }
    
}

abstract class ZoomListener {
    abstract zoom(by: number);
}

export class Zoomer {
    private zoom = 1;
    private listeners: Array<ZoomListener> = [];

    constructor(){}

    zoomBy(by: number){

        this.zoom = this.zoom * by;

        for (let value of this.listeners){
            value.zoom(this.zoom);
        }

    }

    addZoomListener(zoomListener: ZoomListener){
        this.listeners.push(zoomListener);
    }

    getZoom(): number {
        return this.zoom;
    }
}

export class ZoomController extends MouseController {

    constructor(viewCanvas: ViewCanvas, 
        readonly zoomIn: HTMLElement, 
        readonly zoomOut: HTMLElement,
        private zoomer: Zoomer) {

        super();

    	zoomIn.addEventListener("click", (e:Event) => 
            this.clicked(e as MouseEvent, viewCanvas, .95));
    	zoomOut.addEventListener("click", (e:Event) => 
            this.clicked(e as MouseEvent, viewCanvas, 1.05));
    	viewCanvas.ctx.canvas.addEventListener("dblclick", (e:Event) => 
    		this.clicked(e as MouseEvent, viewCanvas, .75));
    }


    clicked(event: MouseEvent, viewCanvas: ViewCanvas, by: number) {

    	console.log("clicked" + event.target + ", " + event.type);

        switch(event.type){
            case "dblclick":
                let canvas = viewCanvas.ctx.canvas;

                if  (event.ctrlKey) {
                    by = 1 / by;
                }
                
                let mXY = this.mousePosition(event, viewCanvas.ctx.canvas);
                
                viewCanvas.zoomAbout(mXY.x / canvas.clientWidth, mXY.y / canvas.clientHeight, by);
                break;
            default:
                viewCanvas.zoomView(by);
        }

    	this.zoomer.zoomBy(by);

    	viewCanvas.draw();
    };

};

export class PanController extends ZoomListener {

	private xPrevious: number;
	private yPrevious: number;
	private record: boolean = false;
	private baseMove: number = 256;
	private move: number = 256;

    constructor(viewCanvas: ViewCanvas, 
        readonly dragElement: HTMLElement,
        private zoomer: Zoomer) {

    	super();
    	dragElement.addEventListener("mousemove", (e:Event) => 
    		this.dragged(e as MouseEvent, viewCanvas));
    	dragElement.addEventListener("mousedown", (e:Event) => 
    		this.dragged(e as MouseEvent, viewCanvas));
        dragElement.addEventListener("mouseup", (e:Event) => 
            this.dragged(e as MouseEvent, viewCanvas));
        dragElement.addEventListener("mouseleave", (e:Event) => 
            this.record = false);
        viewCanvas.ctx.canvas.addEventListener("wheel", (e: Event) => 
            this.wheel(e as WheelEvent, viewCanvas));
    }

    zoom(zoomLevel: number){
    	this.move = this.baseMove / zoomLevel;
    }

    wheel(event: WheelEvent, viewCanvas: ViewCanvas) {

        let canvas = viewCanvas.ctx.canvas;
        //console.log("wheel" + event.target + ", " + event.type);

        let xDelta = event.deltaX / this.move;
        let yDelta = event.deltaY / this.move;

        if  (event.ctrlKey) {
            let mXY = this.mousePosition(event, viewCanvas.ctx.canvas);
                
            var by = 1.05;
            if (yDelta < 0){
                by = 0.95;
            }
            this.zoomer.zoomBy(by);
            viewCanvas.zoomAbout(mXY.x / canvas.clientWidth, mXY.y / canvas.clientHeight, by);
        }
        else {
            this.zoom(this.zoomer.getZoom());
            let newTopLeft = new Point2D(viewCanvas.topLeft.x - xDelta, 
            viewCanvas.topLeft.y - yDelta);

            //console.log("topleft " + newTopLeft);

            viewCanvas.moveView(newTopLeft);
        }
        
        viewCanvas.draw();
    }


    dragged(event: MouseEvent, viewCanvas: ViewCanvas) {

        let canvas = viewCanvas.ctx.canvas;

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

    mousePosition(event: MouseEvent, within: HTMLElement): Point2D {
        let m_posx = event.clientX + document.body.scrollLeft
                 + document.documentElement.scrollLeft;
        let m_posy = event.clientY + document.body.scrollTop
                 + document.documentElement.scrollTop;

        var e_posx = 0;
        var e_posy = 0;
        if (within.offsetParent){
            do { 
                e_posx += within.offsetLeft;
                e_posy += within.offsetTop;
            } while (within = <HTMLElement>within.offsetParent);
        }

        return new Point2D(m_posx - e_posx, m_posy - e_posy);
    }
    
};

