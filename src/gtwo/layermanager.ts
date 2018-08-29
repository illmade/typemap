import { CanvasLayer, ContainerLayer } from "./layer";
import { StaticImage } from "./static";
import { Transform , BasicTransform } from "./view";

export interface ImageStruct extends Transform {
	
	opacity: number;
	src: string;
	name: string;

}

export class LayerManager {

	private layerMap: Map<string, ContainerLayer>;;

	readonly defaultLayer: string = "default";

	constructor(){
		this.layerMap = new Map<string, ContainerLayer>();

		let imageLayer = new ContainerLayer(BasicTransform.unitTransform, 1);	

		this.layerMap.set(this.defaultLayer, imageLayer);
	}

	addImage(image: StaticImage, name: string){
		this.layerMap.get(this.defaultLayer).set(name, image);
	}

	addLayer(imageDetails: Array<ImageStruct>, layerName: string): ContainerLayer {
		let imageLayer = new ContainerLayer(BasicTransform.unitTransform, 1);	

		for (var image of imageDetails){
			let staticImage = new StaticImage(image, image.src, image.opacity);
			imageLayer.set(image.name, staticImage);
		}

		this.layerMap.set(layerName, imageLayer);

		return imageLayer;
	}

	getLayers(): Map<string, ContainerLayer> {
		return this.layerMap;
	}

}