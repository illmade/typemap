import { Viewport } from "../geom/viewport";
import { World2D } from "../geom/world2d";
import { Point2D } from "../geom/point2d";
import { StaticImage, ImageTile, ImageTileLayer } from "./canvastile";
import { GridLayer } from "./grid";

export class ViewCanvas extends Viewport {

    private staticElements: Array<StaticImage> = [];
    private imageTileLayers = [];

    private gridLayer: GridLayer;

    private offscreen: CanvasRenderingContext2D;
    private width: number;
    private height: number;

    constructor(topLeft: Point2D, 
    	widthMapUnits: number, heightMapUnits: number, 
    	private ctx: CanvasRenderingContext2D) {

    	super(topLeft, widthMapUnits, heightMapUnits);

        this.width = ctx.canvas.clientWidth;
        this.height = ctx.canvas.clientHeight;

        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;

        console.log("onscreen " + this.ctx.canvas.width + ", " + this.ctx.canvas.height);

        //const c = document.createElement("canvas");
        const c = <HTMLCanvasElement>document.getElementById("offscreen");
        c.width = this.width;
        c.height = this.height;

        this.offscreen = <CanvasRenderingContext2D>c.getContext("2d");

        console.log("offscreen " + this.ctx.canvas.clientWidth);

    	this.gridLayer = new GridLayer(this.ctx, 1);
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

        let localContext = this.ctx;

    	localContext.clearRect(0, 0, this.width, this.height);

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

    				tile.draw(localContext, tileX, tileY);
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

    		value.draw(localContext, imageX, imageY);
    		this.scale(256, dimension, true);

    	}

    	this.scale(256, dimension, false);
    	this.gridLayer.draw(this.topLeft, dimension.x, dimension.y);
    	this.scale(256, dimension, true);

        // let imageData: ImageData = localContext.getImageData(0, 0, this.width, this.height);

        // this.ctx.clearRect(0, 0, this.width, this.height);
        // console.log("image data ", imageData);
        // this.ctx.putImageData(imageData, 0, 0);

        this.drawCentre(this.ctx);

    }

    drawCentre(context: CanvasRenderingContext2D){
        context.beginPath();
        context.strokeStyle = "red";
        context.moveTo(this.width/2, 0);
        context.lineTo(this.width/2, this.height);
        context.moveTo(0, this.height/2);
        context.lineTo(this.width, this.height/2);
        context.stroke();
    }

}