import { CanvasLayer, ContainerLayer } from "../graphics/layer";
import { ConsoleLogger, Logger } from "../logging/logger";
import { Indexer } from "./indexer";

class GridMap {
	readonly layerMap: Map<string, Array<CanvasLayer>>

	constructor(){
		this.layerMap = new Map<string, Array<CanvasLayer>>();
	} 

	add(x: number, y: number, layer: CanvasLayer){
		var layerValues: Array<CanvasLayer>;
		if (this.layerMap.has(this.key(x, y))){
			layerValues = this.layerMap.get(this.key(x, y));
		} else {
			layerValues = [];
		}
		layerValues.push(layer);
		this.layerMap.set(this.key(x, y), layerValues);
	}

	get(x: number, y: number): Array<CanvasLayer>{
		return this.layerMap.get(this.key(x, y));
	}

	has(x: number, y: number): boolean {
		return this.layerMap.has(this.key(x, y));
	}

	private key(x: number, y: number): string {
		return x + "_" + y;
	}

}

export class GridIndexer implements Indexer {

	private logger: Logger;
	private canvasMap = new GridMap();

	constructor(readonly gridWidth: number, 
	  readonly gridHeight: number = gridWidth){
		this.logger = new ConsoleLogger();
	}

	setLogger(logger: Logger): void {
		this.logger = logger;
	}

	getLayers(x: number, y: number): Array<CanvasLayer> {
		let gridX = Math.floor(x / this.gridWidth);
		let gridY = Math.floor(y / this.gridHeight);

		this.logger.log("grid xy " + gridX + ", " + gridY);

		if (this.canvasMap.has(gridX, gridY)){
			return this.canvasMap.get(gridX, gridY);
		}
		else {
			return [];
		}
	}

	add(canvasLayer: CanvasLayer){

		let dimension = canvasLayer.getDimension();

		let xMin = Math.floor(dimension.x / this.gridWidth);
		let xMax = Math.floor((dimension.x + dimension.w) / this.gridWidth);

		let yMin = Math.floor(dimension.y / this.gridHeight);
		let yMax = Math.floor((dimension.y + dimension.h) / this.gridHeight);

		for (var x = xMin; x<=xMax; x++){
			for (var y = yMin; y<=yMax; y++){
				this.canvasMap.add(x, y, canvasLayer);
			}
		}
	}

	showIndices(canvasLayer: CanvasLayer): void {

		let dimension = canvasLayer.getDimension();

		let xMin = Math.floor(dimension.x / this.gridWidth);
		let xMax = Math.floor((dimension.x + dimension.w) / this.gridWidth);

		let yMin = Math.floor(dimension.y / this.gridHeight);
		let yMax = Math.floor((dimension.y + dimension.h) / this.gridHeight);

		var message = "grid: ["

		for (var x = xMin; x<=xMax; x++){
			for (var y = yMin; y<=yMax; y++){
				message = message + "[" + x + ", " + y + "]";
			}
		}

		message = message + "]";

		this.logger.log(message);
	}
}
