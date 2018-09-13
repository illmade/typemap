import { CanvasLayer, ContainerLayer } from "./layer";
import { StaticImage } from "./static";
import { Transform , BasicTransform } from "./view";
import {CanvasView, DisplayElement} from "./canvasview";

export interface ImageStruct extends Transform {
	
	opacity: number;
	visible: boolean;
	src: string;
	name: string;

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

	addLayer(imageDetails: Array<ImageStruct>, layerName: string): ContainerLayer {
		let imageLayer = new ContainerLayer(BasicTransform.unitTransform, 1, true);	

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

	private layerContainer: ContainerLayer;
	private selected: string;
	
	constructor(layerContainer: ContainerLayer) {
		this.layerContainer = layerContainer;
	}

	setLayerContainer(layerContainer: ContainerLayer) {
		this.layerContainer = layerContainer;
	}

	setSelected(name: string){
		this.selected = name;
	}

	toggleVisibility(selected: boolean = true){
		let toggleGroup: Array<DisplayElement> = [];
		if (selected){
			if (this.selected != ""){
				toggleGroup.push(this.layerContainer.layerMap.get(this.selected));
			}
		} else {
			for (let pair of this.layerContainer.layerMap){

				//console.log("layerName: " + pair[0]);
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