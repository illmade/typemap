import { Viewport } from "../geom/viewport";
import { World2D } from "../geom/world2d";
import { Point2D } from "../geom/point2d";
import { ImageTile, ImageTileLayer } from "./canvastile";

export class ViewCanvas extends Viewport {

    private imageTileLayers = [];

    constructor(world: World2D, topLeft: Point2D, 
    	readonly widthMapUnits: number, readonly heightMapUnits: number, 
    	readonly canvasRenderContext: CanvasRenderingContext2D) {

    	super(world, topLeft, widthMapUnits, heightMapUnits);

    	this.canvasRenderContext.canvas.width = this.canvasRenderContext.canvas.clientWidth;
    	this.canvasRenderContext.canvas.height = this.canvasRenderContext.canvas.clientHeight;
    }

    addTileLayer(imageTileLayer: ImageTileLayer): void {
    	this.imageTileLayers.push(imageTileLayer);
    }

    draw(): void {

    	var viewScalingX = this.canvasRenderContext.canvas.clientWidth / this.widthMapUnits;
    	var viewScalingY = this.canvasRenderContext.canvas.clientHeight / this.heightMapUnits;

    	for (let value of this.imageTileLayers){
    		if (value.imageProperties.visible) {

    			let tileScalingX = value.imageProperties.tileWidthPx / value.widthMapUnits;
    			let tileScalingY = value.imageProperties.tileHeightPx / value.heightMapUnits;

    			let canvasScalingX = viewScalingX / tileScalingX;
    			let canvasScalingY = viewScalingY / tileScalingY;

    			console.log("scaling ", canvasScalingX, canvasScalingY);

    			let tiles: Array<ImageTile> = value.getTiles(this.topLeft, 
    				this.widthMapUnits, this.heightMapUnits);

    			for (let tile of tiles){
    				console.log("drawing " + tile.xIndex + ", " + this.topLeft.x);
    				var tileX = (tile.xIndex - this.topLeft.x) * viewScalingX / canvasScalingX;
    				var tileY = (tile.yIndex - this.topLeft.y) * viewScalingY / canvasScalingY;

    				tile.draw(this.canvasRenderContext, canvasScalingX, canvasScalingY, tileX, tileY);
    			}
    		}
    	}
    }

}