import { TileLayer } from "./tile";

export class Units {

	static readonly WebWU = new Units("Mercator Web World Units");

	constructor(name: string){}

}
/**
  A world is the base that all other elements orientate from 
**/
export class World2D {

	private tileLayers: Array<TileLayer> = [];
	
	constructor(){}

    addTileLayer(tileLayer: TileLayer): number {
    	return this.tileLayers.push(tileLayer);
    }

}