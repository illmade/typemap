import { Tile, TileLayer, AbstractTileLayer } from "../geom/tile";
import { Point2D } from "../geom/point2d";
import { DisplayElement, FileElement, TileStruct, ImageStruct } from "./display" 

export abstract class CanvasTile implements Tile {

	constructor(readonly xIndex: number, readonly yIndex: number){}

	abstract draw(ctx: CanvasRenderingContext2D, scalingX: number, scalingY: number, 
		xIndex: number, yIndex: number): void;

}

export interface CanvasTileLayer extends TileLayer, DisplayElement {

	viewProperties: ImageStruct;

}