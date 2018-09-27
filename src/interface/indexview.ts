import { CanvasLayer } from "../graphics/layer";
import { CanvasLayerView } from "./layerview";

export class IndexView {

	constructor(readonly viewElement: HTMLElement){}

	setElements(canvasElements: Array<CanvasLayer> ){
		for (let canvasLayer of canvasElements){
			let layerView = new CanvasLayerView(canvasLayer);
			this.viewElement.appendChild(layerView.visibility);
		}
	}

}