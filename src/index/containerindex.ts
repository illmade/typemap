import { Indexer } from "./indexer";
import { GridIndexer } from "./gridindexer";
import { CanvasLayer } from "../graphics/layer";
import { ContainerLayer } from "../graphics/containerlayer";

export class ContainerIndex implements Indexer {

	constructor(
	  readonly container: ContainerLayer, 
	  readonly name: string,
	  readonly indexer: Indexer = new GridIndexer(256)){
		for (let layer of container.layers()){
			this.add(layer);
		}
	}

	getLayers(x: number, y: number): Array<CanvasLayer>{
		if (this.container.isVisible()){
			console.log(this.name + " is visible ");
			return this.indexer.getLayers(x, y);
		}
		else {
			return [];
		}
	}

	add(canvasLayer: CanvasLayer): void {
		this.indexer.add(canvasLayer);
	}

}