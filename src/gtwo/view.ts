/**
* A world is 0,0 based but any element can be positioned relative to this.
*/
export interface Transform {
	x: number;
	y: number;
	zoomX: number;
	zoomY: number;
	rotation: number;
}

export class BasicTransform implements Transform {

    static readonly unitTransform = new BasicTransform(0, 0, 1, 1, 0);

	constructor(public x: number, public y: number, 
		public zoomX: number, public zoomY: number, 
		public rotation: number){}
}

export function combineTransform(child: Transform, container: Transform): Transform {
	let zoomX = child.zoomX * container.zoomX;
	//console.log("modified " + child.zoomX + " to " + zoomX);
	let zoomY = child.zoomY * container.zoomY;
	//console.log("modified " + child.zoomY + " by " + container.zoomY + " to " + zoomY);
	let x = (child.x * container.zoomX) + container.x;
	let y = (child.y * container.zoomY) + container.y;
	//console.log("modified x " + child.x + " by " + container.zoomX + " and " + container.x + " to " + x);
	let rotation = child.rotation + container.rotation;
	return new BasicTransform(x, y, zoomX, zoomY, rotation);
}

export function clone(transform: Transform): Transform {
	return new BasicTransform(transform.x, transform.y, 
		transform.zoomX, transform.zoomY, transform.rotation);
}

export function invertTransform(worldState: Transform): Transform {
	return new BasicTransform(-worldState.x, -worldState.y, 
		1/worldState.zoomX, 1/worldState.zoomY, -worldState.rotation);
}

export interface ViewTransform extends Transform {
	width: number;
	height: number;
}

export class BasicViewTransform extends BasicTransform implements ViewTransform {

	constructor(x: number, y: number, 
		readonly width: number, readonly height: number,
		zoomX: number, zoomY: number, 
	    rotation: number){

		super(x, y, zoomX, zoomY, rotation);
	}

}



