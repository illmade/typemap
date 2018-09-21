
import {CanvasView, DisplayElement} from "./canvasview";
import {CanvasLayer} from "./layer";
import {RectLayer} from "./static";

export class DisplayElementController {

    constructor(canvasView: CanvasView, readonly displayElement: DisplayElement,  public mod: string = "v") {
        document.addEventListener("keypress", (e:Event) => 
            this.pressed(canvasView, e  as KeyboardEvent));
    }

    pressed(canvasView: CanvasView, event: KeyboardEvent) {
        //console.log("pressed layer" + event.target + ", " + event.key);

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

    private canvasLayer: CanvasLayer;
    private layerOutline: RectLayer;

    constructor(canvasView: CanvasView, canvasLayer: CanvasLayer) {
    	document.addEventListener("keypress", (e:Event) => 
    		this.pressed(canvasView, e  as KeyboardEvent));
        this.canvasLayer = canvasLayer;
    }

    setCanvasLayer(canvasLayer: CanvasLayer){
        this.canvasLayer = canvasLayer;
    }

    setLayerOutline(layerOutline: RectLayer){
        this.layerOutline = layerOutline;
    }

    pressed(canvasView: CanvasView, event: KeyboardEvent) {
    	console.log("pressed" + event.target + ", " + event.key);

        let multiplier = 1;

    	switch (event.key) {
    		case "a":
    			this.canvasLayer.x = this.canvasLayer.x - 0.5 * multiplier;
    			this.updateCanvas(canvasView);
    			break;
            case "A":
                this.canvasLayer.x = this.canvasLayer.x - 5 * multiplier;
                this.updateCanvas(canvasView);
                break;
    		case "d":
    			this.canvasLayer.x = this.canvasLayer.x + 0.5 * multiplier;
    			this.updateCanvas(canvasView);
    			break;
            case "D":
                this.canvasLayer.x = this.canvasLayer.x + 5 * multiplier;
                this.updateCanvas(canvasView);
                break;
    		case "w":
    			this.canvasLayer.y = this.canvasLayer.y - 0.5 * multiplier;
    			this.updateCanvas(canvasView);
    			break;
            case "W":
                this.canvasLayer.y = this.canvasLayer.y - 5 * multiplier;
                this.updateCanvas(canvasView);
                break;    
    		case "s":
    			this.canvasLayer.y = this.canvasLayer.y + 0.5 * multiplier;
    			this.updateCanvas(canvasView);
    			break;
            case "S":
                this.canvasLayer.y = this.canvasLayer.y + 5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "e":
                this.canvasLayer.rotation = this.canvasLayer.rotation - 0.005;
                this.updateCanvas(canvasView);
                break;
            case "E":
                this.canvasLayer.rotation = this.canvasLayer.rotation - 0.05;
                this.updateCanvas(canvasView);
                break;
            case "q":
                this.canvasLayer.rotation = this.canvasLayer.rotation + 0.005;
                this.updateCanvas(canvasView);
                break;
            case "Q":
                this.canvasLayer.rotation = this.canvasLayer.rotation + 0.05;
                this.updateCanvas(canvasView);
                break;
    		case "x":
    			this.canvasLayer.zoomX = this.canvasLayer.zoomX - 0.002 * multiplier;
    			this.updateCanvas(canvasView);
    			break;
    		case "X":
    			this.canvasLayer.zoomX = this.canvasLayer.zoomX + 0.002 * multiplier;
    			this.updateCanvas(canvasView);
    			break;
    		case "z":
    			this.canvasLayer.zoomY = this.canvasLayer.zoomY - 0.002 * multiplier;
    			this.updateCanvas(canvasView);
    			break;
    		case "Z":
    			this.canvasLayer.zoomY = this.canvasLayer.zoomY + 0.002 * multiplier;
    			this.updateCanvas(canvasView);
    			break;
            case "c":
                this.canvasLayer.setVisible(!this.canvasLayer.visible);
                this.updateCanvas(canvasView);
                break;
            case "T":
                this.canvasLayer.opacity = Math.min(1.0, this.canvasLayer.opacity + 0.1);
                this.updateCanvas(canvasView);
                break;
            case "t":
                this.canvasLayer.opacity = Math.max(0, this.canvasLayer.opacity - 0.1);
                this.updateCanvas(canvasView);
                break;
    		default:
    			// code...
    			break;
    	}
        console.log('"name": "wsc-100-2", "x": ' + this.canvasLayer.x + 
            ', "y": ' + this.canvasLayer.y + 
            ', "zoomX": '+ this.canvasLayer.zoomX + 
            ', "zoomY": ' + this.canvasLayer.zoomY + 
            ', "rotation": '+ this.canvasLayer.rotation);
    	//console.log("image at: " +  this.canvasLayer.x + ", " + this.canvasLayer.y);
    	//console.log("image ro sc: " +  this.canvasLayer.rotation + ", " + this.canvasLayer.zoomX + ", " + this.canvasLayer.zoomY);
    };

    updateCanvas(canvasView: CanvasView) {

        if (this.layerOutline != undefined){
            let newDimension = this.canvasLayer.getDimension();
            //console.log("image outline " + newDimension);
            this.layerOutline.updateDimension(newDimension);
        }

        canvasView.draw();
    }

};