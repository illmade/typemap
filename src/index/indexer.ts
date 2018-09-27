import { CanvasLayer } from "../graphics/layer";

export interface Indexer {

	getLayers(x: number, y: number): Array<CanvasLayer>;

	add(canvasLayer: CanvasLayer);

}