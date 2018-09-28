import { CanvasView } from "./graphics/canvasview";
import { StaticImage } from "./graphics/static";
import { ContainerLayer } from "./graphics/layer";
import { BasicTransform } from "./graphics/view";
import { StaticGrid } from "./graphics/grid";
import { ZoomDisplayRange } from "./graphics/canvasview";
import { TileLayer, TileStruct, zoomByLevel} from "./graphics/tilelayer";
import { LayerManager, ContainerLayerManager, dateFilter, datelessFilter } from 
  "./graphics/layermanager";

import { IndexController } from "./interface/indexcontroller";
import { ViewController } from "./interface/viewcontroller";
import { ImageController, DisplayElementController } from "./interface/imagecontroller";
import { LayerController } from "./interface/layercontroller";

import { GridIndexer } from "./index/gridindexer";
import { ContainerIndex } from "./index/containerindex";
import { ElementLogger } from "./logging/logger";

import * as firemaps from "./imagegroups/firemapsab.json";

let layerState = new BasicTransform(0, 0, 1, 1, 0);
let imageLayer = new ContainerLayer(layerState);

let imageState = new BasicTransform(-1440,-1440, 0.222, 0.222, 0);

let bgState = new BasicTransform(-1126,-1086, 1.58, 1.55, 0);
let bgImage = new StaticImage(bgState, "https://github.com/illmade/typemap/tree/master/dist/images/fmss.jpeg", .6, true);

let gridTransform = BasicTransform.unitTransform;
// new BasicTransform(0, 0, 1, 1, 0);
let staticGrid = new StaticGrid(gridTransform, 0, false, 256, 256);

let editContainerLayer = new ContainerLayer(BasicTransform.unitTransform);

imageLayer.set("background", bgImage);

let layerManager = new LayerManager();

let firemapLayer = layerManager.addLayer(firemaps, "firemaps");

let edit = firemapLayer.get("3");

let fireIndex = new ContainerIndex(firemapLayer, "firemaps");

let containerLayerManager = new ContainerLayerManager(firemapLayer, editContainerLayer);
let outlineLayer = containerLayerManager.setSelected("3");

imageLayer.set("firemaps", firemapLayer);

firemapLayer.setTop("3");

function showMap(divName: string, name: string) {
    const canvas = <HTMLCanvasElement>document.getElementById(divName);

    const info = <HTMLElement>document.getElementById("edit_info");

    const layers = <HTMLElement>document.getElementById("layers");

    let x = outlineLayer.x;
    let y = outlineLayer.y;

    let canvasTransform = new BasicTransform(x - 200, y - 200, 0.5, 0.5, 0);
    let canvasView = new CanvasView(canvasTransform, canvas.clientWidth, canvas.clientHeight, canvas);

    canvasView.layers.push(imageLayer);
    canvasView.layers.push(staticGrid);
    canvasView.layers.push(editContainerLayer);

    let firemapController = new DisplayElementController(canvasView, firemapLayer, "b");
    let gridController = new DisplayElementController(canvasView, staticGrid, "g");

    let controller = new ViewController(canvasView, canvas, canvasView);

    let imageController = new ImageController(canvasView, edit);

    imageController.setLayerOutline(outlineLayer);

    imageController.setEditInfoPane(info);

    let layerController = new LayerController(canvasView, containerLayerManager);

    drawMap(canvasView);

    let logger = new ElementLogger(info);

    let indexController = new IndexController(canvasView, imageController);
    indexController.addIndexer(fireIndex);

    indexController.setMenu(layers);

}

function drawMap(canvasView: CanvasView){
    if (!canvasView.draw() ) {
        console.log("In timeout");
        setTimeout(function(){ drawMap(canvasView)}, 500);
    }
}

function show(){
    showMap("canvas", "TypeScript");
}

if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
    show();
} else {
    document.addEventListener("DOMContentLoaded", show);
}