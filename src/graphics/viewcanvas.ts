import { Viewport } from "../geom/viewport";
import { World2D } from "../geom/world2d";
import { Point2D } from "../geom/point2d";
import { TileDisplayProperties } from "../geom/tile";
import { ImageTileLayer } from "./canvastile";

export class ViewCanvas extends Viewport {
    static scale: number = 1;

    private imageTileLayers = {};
    private imageTileProperties = {};
    //private props = new Map<string><string>();

    constructor(world: World2D, topLeft: Point2D, xWidth: number, yWidth: number, 
    	canvasRenderContext: CanvasRenderingContext2D) {

    	super(world, topLeft, xWidth, yWidth)
    }

    addTileLayer(properties: TileDisplayProperties, imageTileLayer: ImageTileLayer): void {
    	this.imageTileLayers[properties.name] = imageTileLayer;
    	this.imageTileProperties[properties.name] = properties;
    }

    draw(): void {
    	for (let key in this.imageTileLayers){
    		let properties = this.imageTileProperties[key];
    		if (properties.visible) {
    			let imageTileLayer = this.imageTileLayers[key];
    			let tiles = imageTileLayer.getTiles(this.topLeft, this.xWidth, this.yWidth);

    			
    		}
    	}
    }

}