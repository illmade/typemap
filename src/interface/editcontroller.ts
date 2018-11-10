import { CanvasView } from "../graphics/canvasview";
import { CanvasElement } from "../graphics/layer";
import { EditManager } from "../graphics/editmanager";
import { Point } from "../graphics/shape";
import { Point2D } from "../geom/point2d";
import { MouseController } from "./mousecontroller";
import { Indexer } from "../index/indexer";
import { ViewTransform } from "../graphics/view";
import { Logger, ConsoleLogger } from "../logging/logger";

import { CanvasLayerView } from "./canvaslayerview";

export class EditController extends MouseController {

	private logger: Logger;
    private dragPosition: Point2D;
    private dragPoint: Point;

    constructor(
      readonly canvasView: CanvasView,
      readonly editManager: EditManager
    ) {
    	super();

    	document.addEventListener("mousedown", (e:Event) => 
    		this.clicked(e as MouseEvent));

        document.addEventListener("mouseup", (e: Event) => 
            this.dragPoint = undefined);

        document.addEventListener("mousemove", (e: Event) => 
            this.drag(e as MouseEvent));

    	this.logger = new ConsoleLogger();
    }

    setLogging(logger: Logger): void {
    	this.logger = logger;
    }

    clicked(e: MouseEvent): void {
    	this.dragPosition = this.mousePosition(e, this.canvasView.canvasElement);

    	let worldPoint = this.canvasView.getBasePoint(
    		this.dragPosition);

        let editPoint = this.editManager.getPoint(worldPoint.x, worldPoint.y);

        if (editPoint != undefined){
            console.log("found edit point " + editPoint.x + ", " + editPoint.y);
            this.dragPoint = editPoint;
        } else {
            console.log("not an edit point ");
            this.editManager.addPoint(worldPoint.x, worldPoint.y);
            this.canvasView.draw();
        }
    }

    drag(event: MouseEvent): void {

        if (this.dragPoint != undefined){
            let point  = this.mousePosition(event, this.canvasView.canvasElement);

            let xDelta = (point.x - this.dragPosition.x) / this.canvasView.zoomX;
            let yDelta = (point.y - this.dragPosition.y) / this.canvasView.zoomY;

            this.dragPoint.x = this.dragPoint.x + xDelta;
            this.dragPoint.y = this.dragPoint.y + yDelta;

            this.editManager.updatePoint(this.dragPoint);

            this.dragPosition = point;

            this.canvasView.draw();
        }

    }

}