import { CanvasView } from "./graphics/canvasview";
import { StaticImage } from "./graphics/static";
import { ContainerLayer } from "./graphics/containerlayer";
import { MultiResLayer } from "./graphics/multireslayer";
import { BasicTransform } from "./graphics/view";
import { StaticGrid } from "./graphics/grid";
import { DisplayRange } from "./graphics/multireslayer";
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

import * as firemaps from "./imagegroups/firemaps.json";
import * as landmarks from "./imagegroups/landmarks.json";
import * as wsc from "./imagegroups/wscd.json";

let earlyDates = dateFilter(wsc, 1680, 1792);
let midDates = dateFilter(wsc, 1793, 1820);
let lateDates = dateFilter(wsc, 1821, 1900);
let otherDates = datelessFilter(wsc);

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
let duImage = new StaticImage(duState, "images/dublin1610.jpg", .6, false);

let gridTransform = BasicTransform.unitTransform;
// new BasicTransform(0, 0, 1, 1, 0);
let staticGrid = new StaticGrid(gridTransform, 0, false, 256, 256);

let sentinelStruct = new TileStruct("qtile/dublin/", ".png", "images/qtile/dublin/");

let sentinelTransform = new BasicTransform(0, 0, 2, 2, 0);
let displayClose = new DisplayRange(0.8, 4);

let sentinelLayer = new TileLayer(sentinelTransform, sentinelStruct, true, 
    "sentinel", 
   15816, 10624, 15);

let sentinelBTransform = new BasicTransform(0, 0, 4, 4, 0);
let displayMid = new DisplayRange(.2, 0.8);
let sentinelBLayer = new TileLayer(sentinelBTransform, sentinelStruct, true, 
    "sentinelB", 
   7908, 5312, 14);

let sentinelCTransform = new BasicTransform(0, 0, 8, 8, 0);
let displayFar = new DisplayRange(.04, .2);
let sentinelSLayer = new TileLayer(sentinelCTransform, sentinelStruct, true, 
    "sentinelC", 
    3954, 2656, 13);

let recentre = new BasicTransform(-1024, -1536, 1, 1, 0);
let sentinelContainerLayer = new MultiResLayer(recentre, 1, true);
sentinelContainerLayer.set(displayClose, sentinelLayer);
sentinelContainerLayer.set(displayMid, sentinelBLayer);
sentinelContainerLayer.set(displayFar, sentinelSLayer);

let editContainerLayer = new ContainerLayer(BasicTransform.unitTransform);

imageLayer.set("county", countyImage);
imageLayer.set("background", bgImage);

let layerManager = new LayerManager();

let firemapLayer = layerManager.addLayer(firemaps, "firemaps");
let landmarksLayer = layerManager.addLayer(landmarks, "landmarks");
let wscEarlyLayer = layerManager.addLayer(earlyDates, "wsc_early");

let wscMidLayer = layerManager.addLayer(midDates, "wsc_mid");
wscMidLayer.setVisible(false);
let wscLateLayer = layerManager.addLayer(lateDates, "wsc_late");
wscLateLayer.setVisible(false);
let wscOtherLayer = layerManager.addLayer(otherDates, "wsc_other");
wscOtherLayer.setVisible(false);

let edit = wscEarlyLayer.get("wsc-355-2");

let earlyIndex = new ContainerIndex(wscEarlyLayer, "early");
let midIndex = new ContainerIndex(wscMidLayer, "mid");
let lateIndex = new ContainerIndex(wscLateLayer, "late");
let otherIndex = new ContainerIndex(wscOtherLayer, "other");

let containerLayerManager = new ContainerLayerManager(wscEarlyLayer, editContainerLayer);
let outlineLayer = containerLayerManager.setSelected("wsc-355-2");

imageLayer.set("wsc_other", wscOtherLayer);
imageLayer.set("wsc_early", wscEarlyLayer);
imageLayer.set("wsc_mid", wscMidLayer);
imageLayer.set("wsc_late", wscLateLayer);

imageLayer.set("firemaps", firemapLayer);

imageLayer.set("dublin1610", duImage);
imageLayer.set("thingmot", tmImage);
imageLayer.set("landmarks", landmarksLayer);

wscEarlyLayer.setTop("wsc-334");

function showMap(divName: string, name: string) {
    const canvas = <HTMLCanvasElement>document.getElementById(divName);

    const info = <HTMLElement>document.getElementById("edit_info");

    const layers = <HTMLElement>document.getElementById("layers");

    let x = outlineLayer.x;
    let y = outlineLayer.y;

    let canvasTransform = new BasicTransform(x - 200, y - 200, 0.5, 0.5, 0);
    let canvasView = new CanvasView(canvasTransform, canvas.clientWidth, canvas.clientHeight, canvas);

    canvasView.layers.push(sentinelContainerLayer);
    canvasView.layers.push(imageLayer);
    canvasView.layers.push(staticGrid);
    canvasView.layers.push(editContainerLayer);

    let tileController = new DisplayElementController(canvasView, sentinelContainerLayer, "v");
    let baseController = new DisplayElementController(canvasView, bgImage, "B");
    let countyController = new DisplayElementController(canvasView, countyImage, "V");
    let firemapController = new DisplayElementController(canvasView, firemapLayer, "b");
    let wscEarlyController = new DisplayElementController(canvasView, wscEarlyLayer, "1");
    let wscLateController = new DisplayElementController(canvasView, wscMidLayer, "2");
    let wscMidController = new DisplayElementController(canvasView, wscLateLayer, "3");
    let wscOtherController = new DisplayElementController(canvasView, wscOtherLayer, "4");
    let landmarkController = new DisplayElementController(canvasView, landmarksLayer, "m");
    let tmController = new DisplayElementController(canvasView, tmImage, "n");
    let duController = new DisplayElementController(canvasView, duImage, "M");
    let gridController = new DisplayElementController(canvasView, staticGrid, "g");

    let controller = new ViewController(canvasView, canvas, canvasView);

    let imageController = new ImageController(canvasView, edit);

    imageController.setLayerOutline(outlineLayer);

    imageController.setEditInfoPane(info);

    let layerController = new LayerController(canvasView, containerLayerManager);

    drawMap(canvasView);

    let logger = new ElementLogger(info);

    let indexController = new IndexController(canvasView, imageController);
    indexController.addIndexer(earlyIndex);
    indexController.addIndexer(midIndex);
    indexController.addIndexer(lateIndex);
    indexController.addIndexer(otherIndex);

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