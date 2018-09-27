import { CanvasLayer } from "../gtwo/layer";
import { ConsoleLogger, Logger } from "../logging/logger";

export class GridIndex {

	private logger: Logger;

	constructor(readonly gridWidth: number, 
	  readonly gridHeight: number = gridWidth){
		this.logger = new ConsoleLogger();
	}

	addLayer(canvasLayer: CanvasLayer){

		let dimension = canvasLayer.getDimension();

		let xMin = Math.floor(dimension.x / this.gridWidth);
		let xMax = Math.ceil((dimension.x + dimension.w) / this.gridWidth);

		let yMin = Math.floor(dimension.y / this.gridHeight);
		let yMax = Math.ceil((dimension.y + dimension.h) / this.gridHeight);

		this.logger.log("GridIndex xMin: " + xMin + " xMax: " + xMax + 
			" yMin: " + yMin + " yMax: " + yMax);

	}

}
