import { Viewport } from "../geom/viewport";
import { World2D } from "../geom/world2d";
import { Point2D } from "../geom/point2d";
import { StaticImage, ImageTile, ImageTileLayer } from "./canvastile";

export class ViewCanvas extends Viewport {

    private staticElements: Array<StaticImage> = [];
    private imageTileLayers = [];

    constructor(topLeft: Point2D, 
    	widthMapUnits: number, heightMapUnits: number, 
    	readonly ctx: CanvasRenderingContext2D) {

    	super(topLeft, widthMapUnits, heightMapUnits);
    }

    addTileLayer(imageTileLayer: ImageTileLayer): void {
    	this.imageTileLayers.push(imageTileLayer);
    }

    addStaticElement(staticImage: StaticImage): void {
    	this.staticElements.push(staticImage);
    }

    private scale(pixelsPerUnit: number, dimension: Point2D, reverse: boolean): void {

    	let viewScalingX = this.ctx.canvas.clientWidth / dimension.x / pixelsPerUnit;
    	let viewScalingY = this.ctx.canvas.clientHeight / dimension.y / pixelsPerUnit;

    	console.log("view scaling " +  viewScalingX, ", " + viewScalingY);
    	console.log("dimensions: " + dimension);

    	if (reverse){
    		this.ctx.scale(1/viewScalingX, 1/viewScalingY);
    	} else {
    		this.ctx.scale(viewScalingX, viewScalingY);
    	}
    	
    }

    draw(): void {
    	let dimension = this.getDimensions();

    	let width = this.ctx.canvas.clientWidth;
    	let height = this.ctx.canvas.clientHeight;

    	this.ctx.clearRect(0, 0, width, height);

    	for (let value of this.imageTileLayers){
    		if (value.imageProperties.visible) {

    			this.scale(value.imageProperties.tileWidthPx, dimension, false);

    			let tileScalingX = value.imageProperties.tileWidthPx / value.widthMapUnits;
    			let tileScalingY = value.imageProperties.tileHeightPx / value.heightMapUnits;

    			console.log("layer scaling is " + tileScalingX + ", " + tileScalingY);

    			let tiles: Array<ImageTile> = value.getTiles(this.topLeft, 
    				dimension.x, dimension.y);

    			for (let tile of tiles){
    				var tileX = (tile.xIndex - this.topLeft.x) * tileScalingX;
    				var tileY = (tile.yIndex - this.topLeft.y) * tileScalingY;

    				tile.draw(this.ctx, tileX, tileY);
    			}

    			this.scale(256, dimension, true);
    		}
    	}

    	for (let value of this.staticElements){
    		//256 px is 1 map unit
			let tileScalingX = 256;
			let tileScalingY = 256;

    		this.scale(256, dimension, false);

    		let imageX = (value.xIndex - this.topLeft.x) * tileScalingX;
    		let imageY = (value.yIndex - this.topLeft.y) * tileScalingY;

    		value.draw(this.ctx, imageX, imageY);
    		this.scale(256, dimension, true);

    	}

    }

}