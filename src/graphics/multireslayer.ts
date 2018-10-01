import { DisplayElement } from "./canvasview";
import { Transform, 
	BasicTransform, 
	ViewTransform, 
	combineTransform } from "./view";
import { Dimension } from "../geom/point2d";
import { CanvasLayer } from "./layer";

export class DisplayRange {

    static readonly AllRange = new DisplayRange(-1, -1);

	constructor(public minZoom: number, public maxZoom: number){}

	withinRange(zoom: number): Boolean {
		return ((zoom >= this.minZoom || this.minZoom == -1) && 
			(zoom <= this.maxZoom || this.maxZoom == -1));
	}
}

export class MultiResLayer extends CanvasLayer {

	layerMap = new Map<DisplayRange, CanvasLayer>();

	set(displayRange: DisplayRange, layer: CanvasLayer){
		this.layerMap.set(displayRange, layer);
	}
	
	draw(
	  ctx: CanvasRenderingContext2D, 
	  parentTransform: Transform, 
	  view: ViewTransform): boolean {

		let layerTransform = combineTransform(this.localTransform, parentTransform);

		var drawingComplete = true;

		for (let [range, layer] of this.layerMap){
			if (range.withinRange(view.zoomX) && layer.isVisible()){
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

		for (let [range, layer] of this.layerMap){
			let layerDimension = layer.getDimension();
			xMin = Math.min(xMin, this.x + layerDimension.x);
			yMin = Math.min(yMin, this.y + layerDimension.y);
			xMax = Math.max(xMax, this.x + layerDimension.x + this.zoomX * layerDimension.w);
			yMax = Math.max(yMax, this.y + layerDimension.y + this.zoomY * layerDimension.h);
		}
		
		return new Dimension(xMin, yMin, xMax - xMin, yMax - yMin);
	}
}