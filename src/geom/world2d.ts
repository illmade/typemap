import { TileLayer2D } from "./tile2d";

export class Units {

	static readonly WebWU = new Units("Mercator Web World Units");

	constructor(name: string){}

}
/**
  A world is the base that all other elements orientate from 
**/
export class World2D {

	private tileLayers: Array<TileLayer2D> = [];
	
	constructor(number, yUnits: number, wrapX: boolean, wrapY: boolean){}

    addTileLayer(tileLayer: TileLayer2D): number {
    	return this.tileLayers.push(tileLayer);
    }

}