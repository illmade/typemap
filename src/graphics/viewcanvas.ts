import { Viewport } from "../geom/viewport";
import { Point2D } from "../geom/point2d";
import { Tile } from "../geom/tile";
import { ImageTile, ImageTileLayer } from "./imagetile";
import { CanvasTileLayer } from "./canvastile";
import { StaticImage } from "./static";
import { GridLayer } from "./grid";
import { LayerManager, ImageLayer } from "./layerloader";

export class ViewCanvas extends Viewport {

    public layerManager: LayerManager = new LayerManager();
    private canvasTileLayers: Array<CanvasTileLayer> = [];

    private gridLayer: GridLayer;

    private offscreen: CanvasRenderingContext2D;
    private width: number;
    private height: number;

    constructor(topLeft: Point2D, 
    	widthMapUnits: number, heightMapUnits: number, private grid: boolean,
    	public ctx: CanvasRenderingContext2D) {

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

        if (grid)
    	    this.gridLayer = new GridLayer(this.offscreen, 1);
    }

    addTileLayer(imageTileLayer: CanvasTileLayer): void {
        console.log("adding: " + imageTileLayer);
    	this.canvasTileLayers.push(imageTileLayer);
    }

    addStaticElement(staticImage: StaticImage): void {
    	this.layerManager.addImage(staticImage, "hi");
    }

    getViewScaling(pixelsPerUnit: number): Point2D {
    	let dimension = this.getDimensions();
    	let viewScalingX = this.ctx.canvas.clientWidth / dimension.x / pixelsPerUnit;
    	let viewScalingY = this.ctx.canvas.clientHeight / dimension.y / pixelsPerUnit;
    	return new Point2D(viewScalingX, viewScalingY);
    }

    private scale(ctx: CanvasRenderingContext2D, 
        pixelsPerUnit: number, dimension: Point2D, reverse: boolean): void {

    	let viewScaling = this.getViewScaling(pixelsPerUnit);

    	if (reverse){
    		ctx.scale(1/viewScaling.x, 1/viewScaling.y);
    	} else {
    		ctx.scale(viewScaling.x, viewScaling.y);
    	}
    	
    }

    draw(): void {
    	let dimension = this.getDimensions();

        let localContext = this.offscreen;

    	localContext.clearRect(0, 0, this.width, this.height);

    	for (let value of this.canvasTileLayers){
    		if (value.isVisible()) {

                localContext.globalAlpha = value.getOpacity();

                let scaledTileWidth = value.viewProperties.tileWidthPx / 
                    value.viewProperties.widthMapUnits;

                let scaledTileHeight = value.viewProperties.tileHeightPx / 
                    value.viewProperties.heightMapUnits;

                console.log("stwh: " + scaledTileWidth + ", " + scaledTileHeight);
    			this.scale(localContext, scaledTileWidth, dimension, false);

                let x = this.topLeft.x / value.viewProperties.widthMapUnits;
                let y = this.topLeft.y / value.viewProperties.heightMapUnits;
                
    			let tiles: Array<Tile> = value.getTiles(this.topLeft, 
    				dimension.x, 
                    dimension.y);

    			for (let tile of tiles){

                    let viewTile = tile as ImageTile;

    				var tileX = scaledTileWidth + (viewTile.xIndex - x) * 
                        value.viewProperties.tileWidthPx;
    				var tileY = -scaledTileHeight + (viewTile.yIndex - y) * 
                        value.viewProperties.tileHeightPx;

    				viewTile.draw(localContext, tileX, tileY);
    			}

    			this.scale(localContext, scaledTileWidth, dimension, true);
                localContext.globalAlpha = 1;
    		}
    	}

        let staticLayers: Map<string, ImageLayer> = this.layerManager.getLayers();
        let keys = staticLayers.keys();
        let entries = staticLayers.entries();

        for (let layerName of keys) {
            let layer = staticLayers.get(layerName);

            if (layer.isVisible()){
                for (let value of layer.images){
                    //256 px is 1 map unit
                    let tileScalingX = 256;
                    let tileScalingY = 256;

                    this.scale(localContext, 256, dimension, false);

                    let imageX = (value.xIndex - this.topLeft.x) * tileScalingX;
                    let imageY = (value.yIndex - this.topLeft.y) * tileScalingY;

                    value.draw(localContext, imageX, imageY);
                    this.scale(localContext, 256, dimension, true);

                }
            }
            
        }

        if (this.grid){
            this.scale(localContext, 256, dimension, false);
            this.gridLayer.draw(this.topLeft, dimension.x, dimension.y);
            this.scale(localContext, 256, dimension, true);
        }
    	
        let imageData: ImageData = localContext.getImageData(0, 0, this.width, this.height);

        this.ctx.clearRect(0, 0, this.width, this.height);
        // console.log("image data ", imageData);
        this.ctx.putImageData(imageData, 0, 0);

        this.drawCentre(this.ctx);

    }

    drawCentre(context: CanvasRenderingContext2D){
        context.beginPath();
        context.globalAlpha = 0.3;
        context.strokeStyle = "red";
        context.moveTo(this.width/2, 6/16*this.height);
        context.lineTo(this.width/2, 10/16*this.height);
        context.moveTo(7/16*this.width, this.height/2);
        context.lineTo(9/16*this.width, this.height/2);
        context.stroke();
        context.globalAlpha = 1;
    }

}