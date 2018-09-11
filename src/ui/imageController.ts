import { DisplayElement } from "../graphics/display";
import { StaticImage } from "../graphics/static";
import { ViewCanvas } from "../graphics/viewcanvas";
import { Point2D } from "../geom/point2d";


export class DisplayElementController {

    public mod: string = "v";

    constructor(viewCanvas: ViewCanvas, readonly displayElement: DisplayElement) {
        document.addEventListener("keypress", (e:Event) => 
            this.pressed(viewCanvas, e  as KeyboardEvent));
    }

    pressed(viewCanvas: ViewCanvas, event: KeyboardEvent) {
        //console.log("pressed layer" + event.target + ", " + event.key);

        switch (event.key) {
            case this.mod:
                this.displayElement.setVisible(!this.displayElement.isVisible);
                viewCanvas.draw();
                break;
        }
    }
}

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
            case "E":
                this.staticImage.rotation = this.staticImage.rotation - 0.05;
                viewCanvas.draw();
                break;
    		case "q":
    			this.staticImage.rotation = this.staticImage.rotation + 0.005;
    			viewCanvas.draw();
    			break;
            case "Q":
                this.staticImage.rotation = this.staticImage.rotation + 0.05;
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
            case "T":
                this.staticImage.opacity = Math.min(1.0, this.staticImage.opacity + 0.1);
                viewCanvas.draw();
                break;
            case "t":
                this.staticImage.opacity = Math.max(0, this.staticImage.opacity - 0.1);
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