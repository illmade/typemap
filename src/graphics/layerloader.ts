import {StaticImage, DisplayElement} from "./canvastile";

interface ImageStruct {
	name: string;
	x: number;
	y: number;
	sx: number;
	sy: number;
	rot: number;
	src: string;
	opacity: number;
}

export class ImageLayer implements DisplayElement {

	public visible: boolean = true;
	public opacity: number = 0.7;

	public images: Array<StaticImage> = [];
	private imageMap: Map<string, StaticImage>;

	constructor(){
		this.imageMap = new Map<string, StaticImage>();
	}

	addImage(image: StaticImage, name: string){
		this.images.push(image);
		this.imageMap.set(name, image);
	}

	getImage(name: string) {
		return this.imageMap.get(name);
	}


}

export class LayerManager {

	private layerMap: Map<string, ImageLayer>;;

	readonly defaultLayer: string = "default";

	constructor(){
		this.layerMap = new Map<string, ImageLayer>();
		this.layerMap.set(this.defaultLayer, new ImageLayer());
	}

	addImage(image: StaticImage, name: string){
		this.layerMap.get(this.defaultLayer).addImage(image, name);
	}

	addLayer(imageDetails: Array<ImageStruct>, layerName: string): ImageLayer {

		let imageLayer = new ImageLayer();

		for (var image of imageDetails){
			let staticImage = new StaticImage(image.x, image.y, 
				image.sx, image.sy, image.rot, image.src, image.opacity);
			imageLayer.addImage(staticImage, image.name);
		}

		this.layerMap.set(layerName, imageLayer);

		return imageLayer;
	}

	getLayers() {
		return this.layerMap;
	}

}