import { World2D } from "./geom/world2d";
import { Viewport } from "./geom/viewport";
import { Point2D } from "./geom/point2d";
import { ImageTileLayer, ImageStruct } from "./graphics/canvastile";
import { ViewCanvas } from "./graphics/viewcanvas";
import { ZoomController } from "./ui/zoomController";

let simpleWorld = new World2D(2, 2, true, false);

let layerProperties = new ImageStruct();
layerProperties.prefix = "";
layerProperties.suffix = ".png";


let roadLayerProperties = new ImageStruct();
roadLayerProperties.suffix = "b.png";

let sentinelLayerProperties = new ImageStruct();
sentinelLayerProperties.suffix = "l.jpeg";

let sentinelTerrainLayerProperties = new ImageStruct();
sentinelTerrainLayerProperties.suffix = "t.jpeg";

let baseLayer = new ImageTileLayer(1, 1, layerProperties);
let sentinelLayer = new ImageTileLayer(1, 1, sentinelLayerProperties);
let roadLayer = new ImageTileLayer(1, 1, roadLayerProperties);
let terrainLayer = new ImageTileLayer(1, 1, sentinelTerrainLayerProperties);

function showMap(divName: string, name: string) {
    const canvas = <HTMLCanvasElement>document.getElementById(divName);

    var ctx = canvas.getContext('2d');

	let canvasView = new ViewCanvas(simpleWorld, new Point2D(0.5, 0.5), 1.0, 1.0, ctx);
	//canvasView.addTileLayer(baseLayer);
	canvasView.addTileLayer(sentinelLayer);
	canvasView.addTileLayer(terrainLayer);
	canvasView.addTileLayer(roadLayer);

	canvasView.draw();

	const plus = <HTMLCanvasElement>document.getElementById("plus");
	const minus = <HTMLCanvasElement>document.getElementById("minus");

	let canvasControl = new ZoomController(canvasView, plus, minus);
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

