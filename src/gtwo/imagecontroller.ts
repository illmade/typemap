
import {CanvasView} from "./canvasview";
import {CanvasLayer} from "./layer";

export class ImageController {

    constructor(canvasView: CanvasView, readonly canvasLayer: CanvasLayer) {
    	document.addEventListener("keypress", (e:Event) => 
    		this.pressed(canvasView, e  as KeyboardEvent));
    }

    pressed(viewCanvas: CanvasView, event: KeyboardEvent) {
    	console.log("pressed" + event.target + ", " + event.key);

    	switch (event.key) {
    		case "a":
    			this.canvasLayer.x = this.canvasLayer.x - 0.5;
    			viewCanvas.draw();
    			break;
    		case "d":
    			this.canvasLayer.x = this.canvasLayer.x + 0.5;
    			viewCanvas.draw();
    			break;
    		case "w":
    			this.canvasLayer.y = this.canvasLayer.y - 0.5;
    			viewCanvas.draw();
    			break;
    		case "s":
    			this.canvasLayer.y = this.canvasLayer.y + 0.5;
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
    			this.canvasLayer.zoomX = this.canvasLayer.zoomX - 0.002;
    			viewCanvas.draw();
    			break;
    		case "X":
    			this.canvasLayer.zoomX = this.canvasLayer.zoomX + 0.002;
    			viewCanvas.draw();
    			break;
    		case "z":
    			this.canvasLayer.zoomY = this.canvasLayer.zoomY - 0.002;
    			viewCanvas.draw();
    			break;
    		case "Z":
    			this.canvasLayer.zoomY = this.canvasLayer.zoomY + 0.002;
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