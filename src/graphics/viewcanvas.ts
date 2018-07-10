import { Viewport } from "../geom/viewport";
import { World2D } from "../geom/world2d";
import { Point2D } from "../geom/point2d";
import { ImageTile, ImageTileLayer } from "./canvastile";

export class ViewCanvas extends Viewport {

    private imageTileLayers = [];

    constructor(world: World2D, topLeft: Point2D, readonly xWidth: number, readonly yWidth: number, 
    	readonly canvasRenderContext: CanvasRenderingContext2D) {

    	super(world, topLeft, xWidth, yWidth);

    	this.canvasRenderContext.canvas.width = this.canvasRenderContext.canvas.clientWidth;
    	this.canvasRenderContext.canvas.height = this.canvasRenderContext.canvas.clientHeight;
    }

    addTileLayer(imageTileLayer: ImageTileLayer): void {
    	this.imageTileLayers.push(imageTileLayer);
    }

    draw(): void {

    	var scalingX = this.canvasRenderContext.canvas.clientWidth / this.xWidth;
    	var scalingY = this.canvasRenderContext.canvas.clientHeight / this.yWidth;
    	console.log("scaling ", scalingX, scalingY);

    	for (let value of this.imageTileLayers){
    		if (value.imageProperties.visible) {
    			let tiles: Array<ImageTile> = value.getTiles(this.topLeft, this.xWidth, this.yWidth);

    			for (let tile of tiles){
    				console.log("drawing " + tile.xIndex + ", " + this.topLeft.x)
    				var tileX = (tile.xIndex - this.topLeft.x) * scalingX;
    				var tileY = (tile.yIndex - this.topLeft.y) * scalingY;

    				tile.draw(this.canvasRenderContext, tileX, tileY);
    			}
    			console.log("got tiles ", tiles);
    		}
    	}
    }

}