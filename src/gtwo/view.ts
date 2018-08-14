/**
* A world is 0,0 based but any element can be positioned relative to this.
*/
export interface WorldState {
	x: number;
	y: number;
	zoomX: number;
	zoomY: number;
	rotation: number;
}

export class BasicState implements WorldState{
	constructor(public x: number, public y: number, 
		public zoomX: number, public zoomY: number, 
		public rotation: number){}
}

export class Transform extends BasicState {

	copy(){
		return new BasicState(this.x, this.y, this.zoomX, this.zoomY, this.rotation);
	}

	modify(worldState: WorldState): Transform {
		let zoomX = this.zoomX * worldState.zoomX;
		console.log("modified " + this.zoomX + " to " + zoomX);
		let zoomY = this.zoomY * worldState.zoomY;
		console.log("modified " + this.zoomY + " by " + worldState.zoomY + " to " + zoomY);
		let x = (this.x * this.zoomX) + worldState.x;
		let y = (this.y * this.zoomY) + worldState.y;
		let rotation = this.rotation + worldState.rotation;
		return new Transform(x, y, zoomX, zoomY, rotation);
	}

}

export function toTransform(worldState: WorldState): Transform {
	return new Transform(worldState.x, worldState.y, 
		worldState.zoomX, worldState.zoomY, worldState.rotation);
}

export interface ViewElement extends WorldState {
	width: number;
	height: number;
}

export class BasicViewElement implements ViewElement {

	constructor(public x: number, public y: number, 
		readonly width: number, readonly height: number,
		public zoomX: number, public zoomY: number, 
		public rotation: number){}

}



