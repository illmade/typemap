import { Viewport } from "../geom/viewport";
import { World2D } from "../geom/world2d";
import { Point2D } from "../geom/point2d";
import { StaticImage, ImageTile, ImageTileLayer } from "./canvastile";
import { GridLayer } from "./grid";

export class ViewCanvas extends Viewport {

    private staticElements: Array<StaticImage> = [];
    private imageTileLayers = [];

    private gridLayer: GridLayer;

    constructor(topLeft: Point2D, 
    	widthMapUnits: number, heightMapUnits: number, 
    	readonly ctx: CanvasRenderingContext2D) {

    	super(topLeft, widthMapUnits, heightMapUnits);

    	this.gridLayer = new GridLayer(ctx, 1);
    }

    addTileLayer(imageTileLayer: ImageTileLayer): void {
    	this.imageTileLayers.push(imageTileLayer);
    }

    addStaticElement(staticImage: StaticImage): void {
    	this.staticElements.push(staticImage);
    }

    getViewScaling(pixelsPerUnit: number): Point2D {
    	let dimension = this.getDimensions();
    	let viewScalingX = this.ctx.canvas.clientWidth / dimension.x / pixelsPerUnit;
    	let viewScalingY = this.ctx.canvas.clientHeight / dimension.y / pixelsPerUnit;
    	return new Point2D(viewScalingX, viewScalingY);
    }

    private scale(pixelsPerUnit: number, dimension: Point2D, reverse: boolean): void {

    	let viewScaling = this.getViewScaling(pixelsPerUnit);

    	if (reverse){
    		this.ctx.scale(1/viewScaling.x, 1/viewScaling.y);
    	} else {
    		this.ctx.scale(viewScaling.x, viewScaling.y);
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

    			let tiles: Array<ImageTile> = value.getTiles(this.topLeft, 
    				dimension.x, dimension.y);

    			for (let tile of tiles){
    				var tileX = (tile.xIndex - this.topLeft.x) * tileScalingX;
    				var tileY = (tile.yIndex - this.topLeft.y) * tileScalingY;

    				tile.draw(this.ctx, tileX, tileY);
    			}

    			this.scale(value.imageProperties.tileWidthPx, dimension, true);
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

    	this.scale(256, dimension, false);
    	this.gridLayer.draw(this.topLeft, dimension.x, dimension.y);
    	this.scale(256, dimension, true);
    }

}