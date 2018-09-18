import { CanvasView } from "./gtwo/canvasview";
import { StaticImage } from "./gtwo/static";
import { ContainerLayer } from "./gtwo/layer";
import { BasicTransform } from "./gtwo/view";
import { StaticGrid } from "./gtwo/grid";
import { ViewController } from "./gtwo/viewcontroller";
import { ImageController, DisplayElementController } from "./gtwo/imagecontroller";
import { TileLayer, TileStruct, zoomByLevel} from "./gtwo/tilelayer";
import { LayerManager, ContainerLayerManager } from "./gtwo/layermanager";
import { LayerController } from "./gtwo/layercontroller";

import * as firemaps from "./imagegroups/firemaps.json";
import * as landmarks from "./imagegroups/landmarks.json";
import * as wsc from "./imagegroups/wsc.json";

let layerState = new BasicTransform(0, 0, 1, 1, 0);
let imageLayer = new ContainerLayer(layerState);

let imageState = new BasicTransform(-1440,-1440, 0.222, 0.222, 0);

let countyState = new BasicTransform(-2631, -2051.5, 1.716, 1.674, 0);
let countyImage = new StaticImage(countyState, 
    "images/County_of_the_City_of_Dublin_1837_map.png", 0.5, true);

let bgState = new BasicTransform(-1126,-1086, 1.58, 1.55, 0);

let bgImage = new StaticImage(bgState, "images/fmss.jpeg", .6, true);

let tmState = new BasicTransform(-1033.5,149, 0.59, 0.59, 0);
let tmImage = new StaticImage(tmState, "images/thingmot.png", .3, true);

let duState = new BasicTransform(-929,-105.5, 0.464, 0.506, 0);
let duImage = new StaticImage(duState, "images/dublin1610.jpg", .3, false);

let gridTransform = new BasicTransform(0, 0, 1, 1, 0);
let staticGrid = new StaticGrid(gridTransform, 0, false, 256, 256);

let sentinelStruct = new TileStruct("qtile/dublin/", ".png", "images/qtile/dublin/");

let sentinelTransform = new BasicTransform(0, 0, 2, 2, 0);
let sentinelLayer = new TileLayer(sentinelTransform, sentinelStruct, true, 15814, 10621, 15);
//let sentinelLayer = new TileLayer(BasicTransform.unitTransform, sentinelStruct, 31628, 21242, 16);

imageLayer.set("county", countyImage);
imageLayer.set("background", bgImage);

let layerManager = new LayerManager();

let firemapLayer = layerManager.addLayer(firemaps, "firemaps");
let landmarksLayer = layerManager.addLayer(landmarks, "landmarks");
let wscLayer = layerManager.addLayer(wsc, "wsc");

let edit = wscLayer.get("wsc-198-1");

let containerLayerManager = new ContainerLayerManager(wscLayer);
containerLayerManager.setSelected("wsc-198-1");

imageLayer.set("wsc", wscLayer);
imageLayer.set("firemaps", firemapLayer);

imageLayer.set("dublin1610", duImage);
imageLayer.set("thingmot", tmImage);
imageLayer.set("landmarks", landmarksLayer);

wscLayer.setTop("wsc-535");

function showMap(divName: string, name: string) {
    const canvas = <HTMLCanvasElement>document.getElementById(divName);
    let canvasTransform = new BasicTransform(-512, -512, 0.5, 0.5, 0);
    let canvasView = new CanvasView(canvasTransform, canvas.clientWidth, canvas.clientHeight, canvas);

    canvasView.layers.push(sentinelLayer);
    canvasView.layers.push(imageLayer);
    canvasView.layers.push(staticGrid);

    let tileController = new DisplayElementController(canvasView, sentinelLayer, "v");
    let baseController = new DisplayElementController(canvasView, bgImage, "B");
    let countyController = new DisplayElementController(canvasView, countyImage, "V");
    let firemapController = new DisplayElementController(canvasView, firemapLayer, "b");
    let wscController = new DisplayElementController(canvasView, wscLayer, "n");
    let landmarkController = new DisplayElementController(canvasView, landmarksLayer, "m");
    let tmController = new DisplayElementController(canvasView, tmImage, "N");
    let duController = new DisplayElementController(canvasView, duImage, "M");
    let gridController = new DisplayElementController(canvasView, staticGrid, "g");

    let controller = new ViewController(canvasView, canvas, canvasView);

    let imageController = new ImageController(canvasView, edit);

    let layerController = new LayerController(canvasView, containerLayerManager);

    drawMap(canvasView);

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