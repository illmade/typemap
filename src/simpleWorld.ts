import { World2D } from "./geom/world2d";
import { Viewport } from "./geom/viewport";
import { Point2D } from "./geom/point2d";
import { ImageTileLayer, ImageStruct } from "./graphics/canvastile";
import { ViewCanvas } from "./graphics/viewcanvas";
import { ZoomController, PanController } from "./ui/mapController";

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

let liffeyLayerProperties = new ImageStruct();
liffeyLayerProperties.suffix = "liffey.jpeg";

let liffeyLabelLayerProperties = new ImageStruct();
liffeyLabelLayerProperties.suffix = "liffey.png";

let baseLayer = new ImageTileLayer(1, 1, layerProperties);
let sentinelLayer = new ImageTileLayer(1, 1, sentinelLayerProperties);
let roadLayer = new ImageTileLayer(1, 1, roadLayerProperties);
let terrainLayer = new ImageTileLayer(1, 1, sentinelTerrainLayerProperties);

let liffeySentinelLayer = new ImageTileLayer(1, 1, liffeyLayerProperties);
let liffeyLabelLayer = new ImageTileLayer(1, 1, liffeyLabelLayerProperties);

function showMap(divName: string, name: string) {
    const canvas = <HTMLCanvasElement>document.getElementById(divName);

    var ctx = canvas.getContext('2d');

	let canvasView = new ViewCanvas(simpleWorld, new Point2D(0.5, 0.5), 2, 2, ctx);
	//canvasView.addTileLayer(baseLayer);
	// canvasView.addTileLayer(sentinelLayer);
	canvasView.addTileLayer(liffeySentinelLayer);
	canvasView.addTileLayer(liffeyLabelLayer);

	canvasView.draw();

	const plus = <HTMLCanvasElement>document.getElementById("plus");
	const minus = <HTMLCanvasElement>document.getElementById("minus");

	let panControl = new PanController(canvasView, canvas);
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

