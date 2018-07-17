import { World2D } from "./geom/world2d";
import { Viewport } from "./geom/viewport";
import { Point2D } from "./geom/point2d";
import { StaticImage, ImageTileLayer, ImageStruct } from "./graphics/canvastile";
import { ViewCanvas } from "./graphics/viewcanvas";
import { ZoomController, PanController } from "./ui/mapController";
import { ImageController } from "./ui/imageController";

let simpleWorld = new World2D();

// let layerProperties = new ImageStruct();
// layerProperties.prefix = "";
// layerProperties.suffix = ".png";

// let roadLayerProperties = new ImageStruct();
// roadLayerProperties.suffix = "b.png";

// let sentinelLayerProperties = new ImageStruct();
// sentinelLayerProperties.suffix = "l.jpeg";

// let sentinelTerrainLayerProperties = new ImageStruct();
// sentinelTerrainLayerProperties.suffix = "t.jpeg";

let liffeyLayerProperties = new ImageStruct();
liffeyLayerProperties.suffix = "liffey.jpeg";
liffeyLayerProperties.tileDir = "images/liffey/";

let liffeyLabelLayerProperties = new ImageStruct();
liffeyLabelLayerProperties.suffix = "liffey.png";
liffeyLabelLayerProperties.tileDir = "images/liffey/";

// let baseLayer = new ImageTileLayer(layerProperties);
// let sentinelLayer = new ImageTileLayer(sentinelLayerProperties);
// let roadLayer = new ImageTileLayer(roadLayerProperties);
// let terrainLayer = new ImageTileLayer(sentinelTerrainLayerProperties);

let liffeySentinelLayer = new ImageTileLayer(liffeyLayerProperties);
let liffeyLabelLayer = new ImageTileLayer(liffeyLabelLayerProperties);

let dolierImage = new StaticImage(2.24, 1.87, .43, .43, -0.06, 
	"images/maps_145_b_4_(2)_f017R[SVC2].jpg", .7);

let trinityImage = new StaticImage(1.99, 3.59, .43, .43, 0.15, 
	"images/maps_145_b_4_(2)_f019R[SVC2].jpg", .7);

let poolbegImage = new StaticImage(3.34, 1.625, .405, .43, 0.05,
	"images/maps_145_b_4_(2)_f018R[SVC2].jpg", .7);

let abbeyImage = new StaticImage(2.39, 0.035, .415, .435, -.25, 
	"images/maps_145_b_4_(2)_f008r[SVC2].jpg", .7);

let busarasImage = new StaticImage(3.49, -0.24, .41, .425, -.26, 
	"images/maps_145_b_4_(2)_f009r[SVC2].jpg", .7);

let totalImage = new StaticImage(4.485, -1.875, 7.465, 7.35, 0, 
	"images/maps_145_b_4_(2)_f001r[SVC2].jpg", .7);

function showMap(divName: string, name: string) {
    const canvas = <HTMLCanvasElement>document.getElementById(divName);

    var ctx = canvas.getContext('2d');
    ctx.canvas.width = ctx.canvas.clientWidth;
    ctx.canvas.height = ctx.canvas.clientHeight;

	let viewCanvas = new ViewCanvas(new Point2D(-1, -1), 12, 8, ctx);
	// viewCanvas.addTileLayer(baseLayer);
	// viewCanvas.addTileLayer(sentinelLayer);
	viewCanvas.addTileLayer(liffeySentinelLayer);
	viewCanvas.addTileLayer(liffeyLabelLayer);

	viewCanvas.addStaticElement(totalImage);
	viewCanvas.addStaticElement(dolierImage);
	viewCanvas.addStaticElement(trinityImage);
	viewCanvas.addStaticElement(poolbegImage);
	viewCanvas.addStaticElement(abbeyImage);
	viewCanvas.addStaticElement(busarasImage);

	let imageController = new ImageController(viewCanvas, busarasImage);

	viewCanvas.draw();

	const plus = <HTMLCanvasElement>document.getElementById("plus");
	const minus = <HTMLCanvasElement>document.getElementById("minus");

	let panControl = new PanController(viewCanvas, canvas);
	let canvasControl = new ZoomController(viewCanvas, plus, minus);
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

