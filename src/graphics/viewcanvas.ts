import { Viewport } from "../geom/viewport";
import { World2D } from "../geom/world2d";
import { Point2D } from "../geom/point2d";
import { StaticImage, ImageTile, ImageTileLayer } from "./canvastile";

export class ViewCanvas extends Viewport {

    private staticElements: Array<StaticImage> = [];
    private imageTileLayers = [];

    constructor(world: World2D, topLeft: Point2D, 
    	widthMapUnits: number, heightMapUnits: number, 
    	readonly canvasRenderContext: CanvasRenderingContext2D) {

    	super(world, topLeft, widthMapUnits, heightMapUnits);

    	this.canvasRenderContext.canvas.width = this.canvasRenderContext.canvas.clientWidth;
    	this.canvasRenderContext.canvas.height = this.canvasRenderContext.canvas.clientHeight;
    }

    addTileLayer(imageTileLayer: ImageTileLayer): void {
    	this.imageTileLayers.push(imageTileLayer);
    }

    addStaticElement(staticImage: StaticImage): void {
    	this.staticElements.push(staticImage);
    }

    draw(): void {

    	let viewScalingX = this.canvasRenderContext.canvas.clientWidth / this.widthMapUnits / 256;
    	let viewScalingY = this.canvasRenderContext.canvas.clientHeight / this.heightMapUnits / 256;

    	this.canvasRenderContext.save();
    	this.canvasRenderContext.scale(viewScalingX, viewScalingY);
    	console.log("view scaling ", viewScalingX);

    	for (let value of this.imageTileLayers){
    		if (value.imageProperties.visible) {

    			let tileScalingX = value.widthMapUnits / value.imageProperties.tileWidthPx;
    			let tileScalingY = value.heightMapUnits / value.imageProperties.tileHeightPx;

    			let tiles: Array<ImageTile> = value.getTiles(this.topLeft, 
    				this.widthMapUnits, this.heightMapUnits);

    			for (let tile of tiles){
    				var tileX = (tile.xIndex - this.topLeft.x) / tileScalingX;
    				var tileY = (tile.yIndex - this.topLeft.y) / tileScalingY;

    				tile.draw(this.canvasRenderContext, tileScalingX, tileScalingY, 
    					tileX, tileY);
    			}
    		}
    	}

    	for (let value of this.staticElements){

    		//256 px is 1 map unit
			let tileScalingX = 256;
			let tileScalingY = 256;

    		let imageX = (value.xIndex - this.topLeft.x) * tileScalingX;
    		let imageY = (value.yIndex - this.topLeft.y) * tileScalingY;

    		console.log("image x y " + value.xIndex + ", " + this.topLeft.x);

    		value.draw(this.canvasRenderContext, imageX, imageY);
    	}
    	this.canvasRenderContext.restore();
    }

}