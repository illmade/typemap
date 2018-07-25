import { Point2D } from "../geom/point2d";

export class GridLayer {

	private gridSpacing: number;

	constructor(public ctx: CanvasRenderingContext2D, gridSpacing: number) {
		this.gridSpacing = gridSpacing;
	}

	setGridSpacing(gridSpacing: number){
		this.gridSpacing = gridSpacing;
	}
	/**
	  leave caching up to the browser
	**/
	draw(topLeft: Point2D, width: number, height: number): void {
		let minX = Math.floor(topLeft.x);
		let minY = Math.floor(topLeft.y);

		this.ctx.globalAlpha = 0.5;
		this.ctx.translate(-256 * topLeft.x, -256 * topLeft.y);
		//console.log("mins " + width + ", " + height);

		let lastX = Math.ceil(topLeft.x + width);
		let lastY = Math.ceil(topLeft.y + height);

		this.ctx.strokeStyle = 'blue';
		this.ctx.font = '48px serif';

		let yZero = minY * this.gridSpacing * 256;
		let yMax = lastY * this.gridSpacing * 256;
		let xJump = this.gridSpacing * 256;

		let xZero = minX * this.gridSpacing * 256;
		let xMax = lastX * this.gridSpacing * 256;
		let yJump = this.gridSpacing * 256;

		this.ctx.beginPath();
    	//this.ctx.clearRect(xZero, yZero, xMax, yMax);

		for (var x = minX; x<lastX; x++){
			//console.log("at " + minX);
			let xMove = x * xJump;
			this.ctx.moveTo(xMove, yZero);
			this.ctx.lineTo(xMove, yMax);
		}

		for (var y = minY; y<lastY; y++){
			let yMove = y * yJump;
			this.ctx.moveTo(xZero, yMove);
			this.ctx.lineTo(xMax, yMove);

			for (var x = minX; x<lastX; x++){
				let xMove = (x - 0.5) * xJump;
				yMove = (y - 0.5) * yJump;
				let text = "" + (x-1) + ", " + (y-1);
				this.ctx.fillText(text, xMove, yMove);
			}
		}
		this.ctx.stroke();
		this.ctx.translate(256 * topLeft.x, 256 * topLeft.y);
		this.ctx.globalAlpha = 1;
	}


}