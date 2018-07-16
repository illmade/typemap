import { StaticImage } from "../graphics/canvastile";
import { ViewCanvas } from "../graphics/viewcanvas";
import { Point2D } from "../geom/point2d";

export class ImageController {

    constructor(viewCanvas: ViewCanvas, readonly staticImage: StaticImage) {
    	document.addEventListener("keypress", (e:Event) => 
    		this.pressed(viewCanvas, e  as KeyboardEvent));
    }

    pressed(viewCanvas: ViewCanvas, event: KeyboardEvent) {
    	console.log("pressed" + event.target + ", " + event.key);

    	switch (event.key) {
    		case "a":
    			this.staticImage.xIndex = this.staticImage.xIndex - 0.005;
    			viewCanvas.draw();
    			break;
    		case "d":
    			this.staticImage.xIndex = this.staticImage.xIndex + 0.005;
    			viewCanvas.draw();
    			break;
    		case "w":
    			this.staticImage.yIndex = this.staticImage.yIndex - 0.005;
    			viewCanvas.draw();
    			break;
    		case "s":
    			this.staticImage.yIndex = this.staticImage.yIndex + 0.005;
    			viewCanvas.draw();
    			break;
    		case "e":
    			this.staticImage.rotation = this.staticImage.rotation - 0.005;
    			viewCanvas.draw();
    			break;
    		case "q":
    			this.staticImage.rotation = this.staticImage.rotation + 0.005;
    			viewCanvas.draw();
    			break;
    		case "x":
    			this.staticImage.scalingX = this.staticImage.scalingX - 0.005;
    			viewCanvas.draw();
    			break;
    		case "X":
    			this.staticImage.scalingX = this.staticImage.scalingX + 0.005;
    			viewCanvas.draw();
    			break;
    		case "z":
    			this.staticImage.scalingY = this.staticImage.scalingY - 0.005;
    			viewCanvas.draw();
    			break;
    		case "Z":
    			this.staticImage.scalingY = this.staticImage.scalingY + 0.005;
    			viewCanvas.draw();
    			break;
    		default:
    			// code...
    			break;
    	}
    	console.log("image at: " +  this.staticImage.xIndex + ", " + this.staticImage.yIndex);
    	console.log("image ro sc: " +  this.staticImage.rotation + ", " + this.staticImage.scalingX + ", " + this.staticImage.scalingY);
    };

};