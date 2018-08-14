import { Transform, WorldState } from "./view";
import { CanvasLayer } from "./canvasview";
import { DisplayElement } from "./display";

export class ImageLayer extends CanvasLayer implements DisplayElement {

	private visible = true;
	private opacity = 1.0;
	public layers: Array<CanvasLayer> = [];

	constructor(worldState: WorldState, opacity: number) {
		super(worldState);
		this.opacity = opacity;
	};

	isVisible(): boolean {
		return this.visible;
	}

	setVisible(visible: boolean): void {
		this.visible = visible;
	}

	getOpacity(): number {
		return this.opacity;
	}

	setOpacity(opacity: number): void {
		this.opacity = opacity;
	}

	draw(ctx: CanvasRenderingContext2D, transform: Transform){
		let layerTransform = transform.modify(this.worldState);
		for (let layer of this.layers){
			layer.draw(ctx, layerTransform);
		}
	}

}