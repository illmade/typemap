import { Transform, BasicTransform, 
	ViewTransform, 
	combineTransform } from "./view";
import { Dimension } from "../geom/point2d";
import { CanvasElement } from "./layer";

export class ContainerLayer extends CanvasElement {

	layerMap: Map<string, CanvasElement>;
	displayLayers: Array<CanvasElement>;

	constructor(localTransform: Transform, opacity: number = 1, visible: boolean = true) {
		super(localTransform, opacity, visible);
		this.layerMap = new Map<string, CanvasElement>();
		this.displayLayers = [];
	}

	set(name: string, layer: CanvasElement): void {
		this.layerMap.set(name, layer);
		this.displayLayers.push(layer);
	}

	get(name: string): CanvasElement {
		return this.layerMap.get(name);
	}

	layers(): Array<CanvasElement> {
		return this.displayLayers;
	}

	setTop(name: string) {
		let topLayer = this.get(name);
		if (topLayer != undefined){
			this.displayLayers = this.displayLayers.filter(function(element: CanvasElement){ 
				if (element == topLayer){
					return false;
				} else {
					return true;
				}});
			this.displayLayers.push(topLayer);
		} else {
			console.log("top layer undefined " + name);
		}
	}

	draw(
	  ctx: CanvasRenderingContext2D, 
	  parentTransform: Transform, 
	  view: ViewTransform): boolean {

		let layerTransform = combineTransform(this.localTransform, parentTransform);

		var drawingComplete = true;

		for (let layer of this.displayLayers) {
			if (layer.isVisible()){
				drawingComplete = drawingComplete && layer.draw(ctx, layerTransform, view);
			}
			
		}

		return drawingComplete;
	}

	getDimension(): Dimension {
		var xMin = this.x;
		var yMin = this.y;
		var xMax = this.x;
		var yMax = this.y;

		for (let layer of this.displayLayers) {
			let layerDimension = layer.getDimension();
			xMin = Math.min(xMin, this.x + layerDimension.x);
			yMin = Math.min(yMin, this.y + layerDimension.y);
			xMax = Math.max(xMax, this.x + layerDimension.x + this.zoomX * layerDimension.w);
			yMax = Math.max(yMax, this.y + layerDimension.y + this.zoomY * layerDimension.h);
		}

		return new Dimension(xMin, yMin, xMax - xMin, yMax - yMin);
	}

}