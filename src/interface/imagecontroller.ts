import {CanvasView, DisplayElement} from "../graphics/canvasview";
import {CanvasElement} from "../graphics/layer";
import {RectLayer} from "../graphics/static";
import {GridIndexer} from "../index/gridindexer";
import {ElementLogger} from "../logging/logger";

export class DisplayElementController {

    constructor(canvasView: CanvasView, readonly displayElement: DisplayElement,  public mod: string = "v") {
        document.addEventListener("keypress", (e:Event) => 
            this.pressed(canvasView, e  as KeyboardEvent));
    }

    pressed(canvasView: CanvasView, event: KeyboardEvent) {
        
        switch (event.key) {
            case this.mod:
                console.log("toggle visible");
                this.displayElement.setVisible(!this.displayElement.isVisible());
                canvasView.draw();
                break;
        }
    }
}

export class ImageController {

    private canvasElement: CanvasElement;
    private layerOutline: RectLayer;
    private editInfoPane: HTMLElement;

    private indexer: GridIndexer = new GridIndexer(256);

    constructor(private canvasView: CanvasView, canvasElement: CanvasElement) {
        document.addEventListener("keypress", (e:Event) => 
            this.pressed(canvasView, e  as KeyboardEvent));
        this.canvasElement = canvasElement;
    }

    setCanvasElement(CanvasElement: CanvasElement){
        this.canvasElement = CanvasElement;

        this.indexer.showIndices(CanvasElement);
        
        this.updateCanvas(this.canvasView);
    }

    setEditInfoPane(editInfoPane: HTMLElement){
        this.editInfoPane = editInfoPane;
    }

    setLayerOutline(layerOutline: RectLayer){
        this.layerOutline = layerOutline;
    }

    pressed(canvasView: CanvasView, event: KeyboardEvent) {
        console.log("pressed" + event.target + ", " + event.key);

        let multiplier = 1;

        switch (event.key) {
            case "a":
                this.canvasElement.x = this.canvasElement.x - 0.5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "A":
                this.canvasElement.x = this.canvasElement.x - 5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "d":
                this.canvasElement.x = this.canvasElement.x + 0.5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "D":
                this.canvasElement.x = this.canvasElement.x + 5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "w":
                this.canvasElement.y = this.canvasElement.y - 0.5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "W":
                this.canvasElement.y = this.canvasElement.y - 5 * multiplier;
                this.updateCanvas(canvasView);
                break;    
            case "s":
                this.canvasElement.y = this.canvasElement.y + 0.5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "S":
                this.canvasElement.y = this.canvasElement.y + 5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "e":
                this.canvasElement.rotation = this.canvasElement.rotation - 0.005;
                this.updateCanvas(canvasView);
                break;
            case "E":
                this.canvasElement.rotation = this.canvasElement.rotation - 0.05;
                this.updateCanvas(canvasView);
                break;
            case "q":
                this.canvasElement.rotation = this.canvasElement.rotation + 0.005;
                this.updateCanvas(canvasView);
                break;
            case "Q":
                this.canvasElement.rotation = this.canvasElement.rotation + 0.05;
                this.updateCanvas(canvasView);
                break;
            case "x":
                this.canvasElement.zoomX = this.canvasElement.zoomX - 0.002 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "X":
                this.canvasElement.zoomX = this.canvasElement.zoomX + 0.002 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "z":
                this.canvasElement.zoomY = this.canvasElement.zoomY - 0.002 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "Z":
                this.canvasElement.zoomY = this.canvasElement.zoomY + 0.002 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "c":
                this.canvasElement.setVisible(!this.canvasElement.visible);
                this.updateCanvas(canvasView);
                break;
            case "T":
                this.canvasElement.opacity = Math.min(1.0, this.canvasElement.opacity + 0.1);
                this.updateCanvas(canvasView);
                break;
            case "t":
                this.canvasElement.opacity = Math.max(0, this.canvasElement.opacity - 0.1);
                this.updateCanvas(canvasView);
                break;
            default:
                // code...
                break;
        }

        let info: string = '"name": ' + this.canvasElement.name +
              ' "x": ' + this.canvasElement.x +
              ', "y": ' + this.canvasElement.y +
              ', "zoomX": '+ this.canvasElement.zoomX + 
              ', "zoomY": ' + this.canvasElement.zoomY + 
              ', "rotation": '+ this.canvasElement.rotation;

        if (this.editInfoPane != undefined){
            this.editInfoPane.innerHTML = info;
        }
        else {
            console.log(info);
        }
    };

    updateCanvas(canvasView: CanvasView) {

        if (this.layerOutline != undefined){
            let newDimension = this.canvasElement.getDimension();
            //console.log("image outline " + newDimension);
            this.layerOutline.updateDimension(newDimension);
        }

        canvasView.draw();
    }

};