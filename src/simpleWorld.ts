import { World2D } from "./geom/world2d";
import { Viewport } from "./geom/viewport";
import { Point2D } from "./geom/point2d";
import { StaticImage, ImageTileLayer, ImageStruct } from "./graphics/canvastile";
import { ViewCanvas } from "./graphics/viewcanvas";
import { ZoomController, PanController } from "./ui/mapController";
import { ImageController } from "./ui/imageController";

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
liffeyLayerProperties.tileDir = "images/liffey/";

let liffeyLabelLayerProperties = new ImageStruct();
liffeyLabelLayerProperties.suffix = "liffey.png";
liffeyLabelLayerProperties.tileDir = "images/liffey/";

let baseLayer = new ImageTileLayer(1, 1, layerProperties);
let sentinelLayer = new ImageTileLayer(1, 1, sentinelLayerProperties);
let roadLayer = new ImageTileLayer(1, 1, roadLayerProperties);
let terrainLayer = new ImageTileLayer(1, 1, sentinelTerrainLayerProperties);

let liffeySentinelLayer = new ImageTileLayer(1, 1, liffeyLayerProperties);
let liffeyLabelLayer = new ImageTileLayer(1, 1, liffeyLabelLayerProperties);

// let dolierImage = new StaticImage(1.46, 1.09, .44, -0.07, 
// 	"images/maps_145_b_4_(2)_f017R[SVC2].jpg", 0.7);

let dolierImage = new StaticImage(2.24, 1.87, .43, .43, -0.06, 
	"images/maps_145_b_4_(2)_f017R[SVC2].jpg", 0.7);

let trinityImage = new StaticImage(1.99, 3.59, .43, .43, 0.15, 
	"images/maps_145_b_4_(2)_f019R[SVC2].jpg", 0.7);

let poolbegImage = new StaticImage(3.34, 1.625, .405, .43, 0.05,
	"images/maps_145_b_4_(2)_f018R[SVC2].jpg", 0.7);

function showMap(divName: string, name: string) {
    const canvas = <HTMLCanvasElement>document.getElementById(divName);

    var ctx = canvas.getContext('2d');

	let canvasView = new ViewCanvas(simpleWorld, new Point2D(1, 1), 2, 2, ctx);
	// canvasView.addTileLayer(baseLayer);
	// canvasView.addTileLayer(sentinelLayer);
	canvasView.addTileLayer(liffeySentinelLayer);
	canvasView.addTileLayer(liffeyLabelLayer);

	canvasView.addStaticElement(dolierImage);
	canvasView.addStaticElement(trinityImage);
	canvasView.addStaticElement(poolbegImage);

	let imageController = new ImageController(canvasView, poolbegImage);

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

