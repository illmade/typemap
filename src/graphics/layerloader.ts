import { StaticImage } from "./static";
import { DisplayElement, ImageStruct } from "./display";

export class ImageLayer implements DisplayElement {

	visible: boolean = true;
	opacity: number = 0.7;

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

	getOpacity(): number {
		return this.opacity;
	}

	isVisible(): boolean {
		return this.visible;
	}

	setVisible(visible: boolean){
		this.visible = visible;
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

	getLayers(): Map<string, ImageLayer> {
		return this.layerMap;
	}

}