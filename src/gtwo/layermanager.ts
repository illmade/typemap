import { CanvasLayer, ContainerLayer } from "./layer";
import { StaticImage, RectLayer } from "./static";
import { Transform , BasicTransform } from "./view";
import {CanvasView, DisplayElement} from "./canvasview";

export interface ImageStruct extends Transform {
	opacity: number;
	visible: boolean;
	src: string;
	name: string;
	date: number;
}

export function dateFilter(
  imageStruct: Array<ImageStruct>, 
  from: number, 
  to: number): Array<ImageStruct>{
	return imageStruct.filter(function(imageStruct){ 
		if (imageStruct.date == undefined)
			return false;
		if (imageStruct.date >= from && imageStruct.date <= to) {
			return true;
		} else {
			return false}
		});
}

export function datelessFilter(
  imageStruct: Array<ImageStruct>): Array<ImageStruct>{
	return imageStruct.filter(function(imageStruct){ 
		if (imageStruct.date == undefined)
			return true;
		else {
			return false}
		});
}

export class LayerManager {

	private layerMap: Map<string, ContainerLayer>;;

	readonly defaultLayer: string = "default";

	constructor(){
		this.layerMap = new Map<string, ContainerLayer>();

		let imageLayer = new ContainerLayer(BasicTransform.unitTransform, 1, true);	

		this.layerMap.set(this.defaultLayer, imageLayer);
	}

	addImage(image: StaticImage, name: string){
		this.layerMap.get(this.defaultLayer).set(name, image);
	}

	addLayer(
	  imageDetails: Array<ImageStruct>, 
	  layerName: string, 
	  layerTransform: Transform = BasicTransform.unitTransform): ContainerLayer {

		let imageLayer = new ContainerLayer(layerTransform, 1, true);	

		for (var image of imageDetails){
			let staticImage = new StaticImage(image, image.src, image.opacity, image.visible);
			imageLayer.set(image.name, staticImage);
		}

		this.layerMap.set(layerName, imageLayer);

		return imageLayer;
	}

	getLayers(): Map<string, ContainerLayer> {
		return this.layerMap;
	}

	getLayer(name: string): ContainerLayer {
		return this.layerMap.get(name);
	}

}

export class ContainerLayerManager {

	private containerLayer: ContainerLayer;
	private selected: string;
	
	constructor(containerLayer: ContainerLayer, 
	  readonly displayLayer: ContainerLayer = containerLayer) {
		this.containerLayer = containerLayer;
	}

	setLayerContainer(containerLayer: ContainerLayer) {
		this.containerLayer = containerLayer;
	}

	setSelected(name: string): RectLayer {
		this.selected = name;

		let layer: CanvasLayer = this.containerLayer.get(this.selected);

		let layerRect = new RectLayer(layer.getDimension(), 1, true);

		let layerName = "outline";//name + "_o"

		this.displayLayer.set(layerName, layerRect);

		return layerRect;
	}

	toggleVisibility(selected: boolean = true){
		let toggleGroup: Array<DisplayElement> = [];
		if (selected){
			if (this.selected != ""){
				toggleGroup.push(this.containerLayer.get(this.selected));
			}
		} else {
			for (let pair of this.containerLayer.layerMap){

				if (pair[0] != this.selected){
					toggleGroup.push(pair[1]);
				}
				else {
					console.log("layerName: " + this.selected);
				}
			}
		}

		for (let element of toggleGroup){
			element.setVisible(!element.isVisible())
		}
	}

}