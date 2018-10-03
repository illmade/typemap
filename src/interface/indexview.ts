import { CanvasElement } from "../graphics/layer";
import { CanvasView } from "../graphics/canvasview";
import { CanvasLayerView } from "./canvaslayerview";
import { ImageController } from "./imagecontroller";

export class IndexView {

	constructor(
	  readonly viewElement: HTMLElement, 
	  readonly canvasView: CanvasView,
	  readonly imageController: ImageController
	){}
	
	setElements(canvasElements: Array<CanvasElement>): void {
		this.clear();
		
		for (let canvasLayer of canvasElements){
			let layerView = new CanvasLayerView(canvasLayer, this.canvasView, 
				this.imageController);
			this.viewElement.appendChild(layerView.container);
		}
	}

	private clear(): boolean {
		let children = this.viewElement.children;
		let initialLength = children.length;

		while (children.length > 0) {
			children[0].remove();
		}

		return true;
	}

}