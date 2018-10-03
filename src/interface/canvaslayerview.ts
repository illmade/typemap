import { CanvasElement } from "../graphics/layer";
import { CanvasView } from "../graphics/canvasview";
import { Thumb } from "../graphics/static";
import { ImageController } from "./imagecontroller";

export class CanvasLayerView {

	readonly container: HTMLSpanElement;

	constructor(
	  layer: CanvasElement, 
	  canvasView: CanvasView, 
	  imageController: ImageController
	){

		this.container = document.createElement("span");
		this.container.className = "layer";

		let editdiv = document.createElement("span");

		let label = document.createElement("span");
		label.innerHTML = layer.name;

		let visibility: HTMLInputElement = document.createElement("input");
		visibility.type = "checkbox";
		visibility.checked = true;

		let edit: HTMLInputElement = document.createElement("input");
		edit.type = "radio";
		edit.name = "edit";

		visibility.addEventListener('change', function(event){
			if (this.checked){
				layer.setVisible(true);
			} else {
				layer.setVisible(false);
			}
			canvasView.draw();
		});

		edit.addEventListener('change', function(event){
			if (this.checked){
				imageController.setCanvasElement(layer);
			} 
			canvasView.draw();
		});

		var thumb = <Thumb> layer;

		let canvasImage = document.createElement("canvas");
		let thumbCtx = canvasImage.getContext("2d");
		thumb.drawThumb(thumbCtx, 200, 200);

		let thumbnail: HTMLImageElement = new Image();
		thumbnail.src = canvasImage.toDataURL();
		thumbnail.className = "thumbnail";
		thumbnail.title = layer.description;

		editdiv.appendChild(label);
		editdiv.appendChild(visibility);
		editdiv.appendChild(edit);
		this.container.appendChild(editdiv);
		this.container.appendChild(thumbnail);
	}

}