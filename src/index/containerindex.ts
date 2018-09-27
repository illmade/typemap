import { Indexer } from "./indexer";
import { GridIndexer } from "./gridindexer";
import { ContainerLayer, CanvasLayer } from "../graphics/layer";

export class ContainerIndex implements Indexer {

	constructor(
	  readonly container: ContainerLayer, 
	  readonly indexer: Indexer = new GridIndexer(256)){
		for (let layer of container.layers()){
			this.add(layer);
		}
	}

	getLayers(x: number, y: number): Array<CanvasLayer>{
		if (this.container.isVisible()){
			return this.indexer.getLayers(x, y);
		}
		else {
			return [];
		}
	}

	add(canvasLayer: CanvasLayer){
		this.indexer.add(canvasLayer);
	}

}