
import {CanvasView, DisplayElement} from "./canvasview";
import {CanvasLayer} from "./layer";

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

    constructor(canvasView: CanvasView, readonly canvasLayer: CanvasLayer) {
    	document.addEventListener("keypress", (e:Event) => 
    		this.pressed(canvasView, e  as KeyboardEvent));
    }

    pressed(viewCanvas: CanvasView, event: KeyboardEvent) {
    	console.log("pressed" + event.target + ", " + event.key);

        let multiplier = 1;

    	switch (event.key) {
    		case "a":
    			this.canvasLayer.x = this.canvasLayer.x - 0.5 * multiplier;
    			viewCanvas.draw();
    			break;
            case "A":
                this.canvasLayer.x = this.canvasLayer.x - 5 * multiplier;
                viewCanvas.draw();
                break;
    		case "d":
    			this.canvasLayer.x = this.canvasLayer.x + 0.5 * multiplier;
    			viewCanvas.draw();
    			break;
            case "D":
                this.canvasLayer.x = this.canvasLayer.x + 5 * multiplier;
                viewCanvas.draw();
                break;
    		case "w":
    			this.canvasLayer.y = this.canvasLayer.y - 0.5 * multiplier;
    			viewCanvas.draw();
    			break;
            case "W":
                this.canvasLayer.y = this.canvasLayer.y - 5 * multiplier;
                viewCanvas.draw();
                break;    
    		case "s":
    			this.canvasLayer.y = this.canvasLayer.y + 0.5 * multiplier;
    			viewCanvas.draw();
    			break;
            case "S":
                this.canvasLayer.y = this.canvasLayer.y + 5 * multiplier;
                viewCanvas.draw();
                break;
    		case "e":
    			this.canvasLayer.rotation = this.canvasLayer.rotation - 0.005;
    			viewCanvas.draw();
    			break;
    		case "q":
    			this.canvasLayer.rotation = this.canvasLayer.rotation + 0.005;
    			viewCanvas.draw();
    			break;
    		case "x":
    			this.canvasLayer.zoomX = this.canvasLayer.zoomX - 0.002 * multiplier;
    			viewCanvas.draw();
    			break;
    		case "X":
    			this.canvasLayer.zoomX = this.canvasLayer.zoomX + 0.002 * multiplier;
    			viewCanvas.draw();
    			break;
    		case "z":
    			this.canvasLayer.zoomY = this.canvasLayer.zoomY - 0.002 * multiplier;
    			viewCanvas.draw();
    			break;
    		case "Z":
    			this.canvasLayer.zoomY = this.canvasLayer.zoomY + 0.002 * multiplier;
    			viewCanvas.draw();
    			break;
            case "T":
                this.canvasLayer.opacity = Math.min(1.0, this.canvasLayer.opacity + 0.1);
                viewCanvas.draw();
                break;
            case "t":
                this.canvasLayer.opacity = Math.max(0, this.canvasLayer.opacity - 0.1);
                viewCanvas.draw();
                break;
    		default:
    			// code...
    			break;
    	}
    	console.log("image at: " +  this.canvasLayer.x + ", " + this.canvasLayer.y);
    	console.log("image ro sc: " +  this.canvasLayer.rotation + ", " + this.canvasLayer.zoomX + ", " + this.canvasLayer.zoomY);
    };

};