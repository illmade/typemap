import { ViewTransform } from "../graphics/view";
import { CanvasView } from "../graphics/canvasview";
import { MouseController } from "./mousecontroller";

export class ViewController extends MouseController {

	record: boolean;
	move: number = 1;

	private xPrevious: number;
	private yPrevious: number;

	constructor(viewTransform: ViewTransform, 
        readonly dragElement: HTMLElement, readonly canvasView: CanvasView) {

    	super();
    	dragElement.addEventListener("mousemove", (e:Event) => 
    		this.dragged(e as MouseEvent, viewTransform));
    	dragElement.addEventListener("mousedown", (e:Event) => 
    		this.dragged(e as MouseEvent, viewTransform));
        dragElement.addEventListener("mouseup", (e:Event) => 
            this.dragged(e as MouseEvent, viewTransform));
        dragElement.addEventListener("mouseleave", (e:Event) => 
            this.record = false);
        dragElement.addEventListener("dblclick", (e:Event) => 
    		this.clicked(e as MouseEvent, canvasView, 1.2));
        dragElement.addEventListener("wheel", (e: Event) => 
            this.wheel(e as WheelEvent, canvasView));
    }

    clicked(event: MouseEvent, viewTransform: ViewTransform, zoomBy: number){
    	switch(event.type){
    		case "dblclick":
                // if  (event.ctrlKey) {
                //     zoomBy = 1 / zoomBy;
                // }
                
                // let mXY = this.mousePosition(event, this.dragElement);

                // this.canvasView.zoomAbout(mXY[0], mXY[1], zoomBy);

                // this.canvasView.draw();
            default:
        }
    }

    dragged(event: MouseEvent, viewTransform: ViewTransform) {

   //  	switch(event.type){
   //  		case "mousedown":
   //  			this.record = true;
   //  			break;
   //  		case "mouseup":
   //  			this.record = false;
   //  			break;
   //  		default:
   //  			if (this.record){
   //                  let xDelta = (event.clientX - this.xPrevious) / this.move / viewTransform.zoomX;
   //                  let yDelta = (event.clientY - this.yPrevious) / this.move / viewTransform.zoomY;

   //                  viewTransform.x = viewTransform.x - xDelta;
   //                  viewTransform.y = viewTransform.y - yDelta;

   //                  this.canvasView.draw();
   //  			}

			// this.xPrevious = event.clientX;
			// this.yPrevious = event.clientY;
   //  	}
    }

    wheel(event: WheelEvent, viewTransform: ViewTransform) {

        //console.log("wheel" + event.target + ", " + event.type);

        let xDelta = event.deltaX / this.move / viewTransform.zoomX;
        let yDelta = event.deltaY / this.move / viewTransform.zoomY;

        if  (event.ctrlKey) {
            let mXY = this.mousePosition(event, this.dragElement);
                
            var by = 1.05;
            if (yDelta < 0){
                by = 0.95;
            }
            
            this.canvasView.zoomAbout(mXY[0], mXY[1], by);
        }
        else {
            this.canvasView.x =  this.canvasView.x + xDelta;
            this.canvasView.y =  this.canvasView.y + yDelta;
        }
        
        this.canvasView.draw();
    }

}
