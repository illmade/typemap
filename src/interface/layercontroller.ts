import { ContainerLayerManager } from "../graphics/layermanager";
import { CanvasView } from "../graphics/canvasview";

export class LayerController {

	private mod: string = "i";

	constructor(canvasView: CanvasView, readonly containerLayerManager: ContainerLayerManager){
		document.addEventListener("keypress", (e:Event) => 
            this.pressed(canvasView, e  as KeyboardEvent));
	}

	pressed(canvasView: CanvasView, event: KeyboardEvent) {

        switch (event.key) {
            case this.mod:
                console.log("toggle visible");
                this.containerLayerManager.toggleVisibility(false);
                canvasView.draw();
                break;
        }
    }

}