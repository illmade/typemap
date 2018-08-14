
import { Tile, TileLayer, AbstractTileLayer } from "../geom/tile";
import { ImageTile } from "./imagetile";
import { CanvasTileLayer } from "./canvastile";
import { DisplayElement, ImageStruct, TileStruct } from "./display";

export class SlippyTileLayer extends AbstractTileLayer implements CanvasTileLayer {

	private baseX = 0;
	private baseY = 0;

	constructor(public viewProperties: ImageStruct, readonly tileProperties: TileStruct, 
		private zoom: number,
		private xOffset: number, 
		private yOffset: number) 
	{
		super(viewProperties.heightMapUnits, viewProperties.heightMapUnits);
	}

	private offsets(){
		let zoomExp = Math.pow(2, this.zoom);
		this.baseX = this.xOffset / zoomExp;
		this.baseY = this.yOffset / zoomExp;
	}

	getOpacity(): number {
		return this.viewProperties.getOpacity();
	}

	isVisible(): boolean {
		return this.viewProperties.isVisible();
	}

	setVisible(visible: boolean){
		this.viewProperties.setVisible(visible);
	}
	/**
	  leave caching up to the browser
	**/
	getTile(xUnits: number, yUnits: number): Tile {
		
		let imageSrc = this.tileProperties.tileDirectory + this.zoom + "/" + (this.xOffset+xUnits) + "/" + 
			 + (this.yOffset+yUnits) + this.tileProperties.suffix;
		return new ImageTile(xUnits, yUnits, imageSrc);
	}

}