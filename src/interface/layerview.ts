import { CanvasLayer } from "../graphics/layer";

export class CanvasLayerView {

	readonly visibility: HTMLInputElement;

	constructor(layer: CanvasLayer){
		this.visibility = new HTMLInputElement();
		this.visibility.type = "radio";
	}

}