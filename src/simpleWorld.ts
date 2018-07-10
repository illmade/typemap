import { World2D } from "./geom/world2d";
import { Viewport } from "./geom/viewport";
import { Point2D } from "./geom/point2d";
import { ImageTileLayer, ImageStruct } from "./graphics/canvastile";
import { ViewCanvas } from "./graphics/viewcanvas";

let simpleWorld = new World2D(2, 2, true, false);

let layerProperties = new ImageStruct();
layerProperties.prefix = "";
layerProperties.suffix = ".png";
layerProperties.tileDir = "images/";
layerProperties.visible = true;


let roadLayerProperties = new ImageStruct();
roadLayerProperties.prefix = "";
roadLayerProperties.suffix = "b.png";
roadLayerProperties.tileDir = "images/";
roadLayerProperties.visible = true;

let sentinelLayerProperties = new ImageStruct();
sentinelLayerProperties.prefix = "";
sentinelLayerProperties.suffix = "l.jpeg";
sentinelLayerProperties.tileDir = "images/";
sentinelLayerProperties.visible = true;

let baseLayer = new ImageTileLayer(1, 1, layerProperties);
let sentinelLayer = new ImageTileLayer(1, 1, sentinelLayerProperties);
let roadLayer = new ImageTileLayer(1, 1, roadLayerProperties);

function showMap(divName: string, name: string) {
    const canvas = <HTMLCanvasElement>document.getElementById(divName);
    var ctx = canvas.getContext('2d');

	let canvasView = new ViewCanvas(simpleWorld, new Point2D(0, 0), 2, 2, ctx);
	canvasView.addTileLayer(baseLayer);
	canvasView.addTileLayer(sentinelLayer);
	canvasView.addTileLayer(roadLayer);

	canvasView.draw();
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

