import { World2D } from "./geom/world2d";
import { Viewport } from "./geom/viewport";
import { Point2D } from "./geom/point2d";
import { StaticImage, ImageTileLayer, ImageStruct, SlippyTileLayer } from "./graphics/canvastile";
import { ViewCanvas } from "./graphics/viewcanvas";
import { ZoomController, PanController } from "./ui/mapController";
import { ImageController, LayerController} from "./ui/imageController";

import * as firemaps from "./imagegroups/firemaps.json";
import * as wsc from "./imagegroups/wsc.json";

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
liffeyLabelLayerProperties.opacity = 1;
liffeyLabelLayerProperties.tileDir = "images/liffey/";
liffeyLabelLayerProperties.visible = true;

let slippyLayerProperties = new ImageStruct();
slippyLayerProperties.tileDir = "images/qtile/dublin/";
slippyLayerProperties.suffix = ".png";
liffeyLabelLayerProperties.opacity = .4;
slippyLayerProperties.widthMapUnits = 2;
slippyLayerProperties.heightMapUnits = 2;


// let baseLayer = new ImageTileLayer(layerProperties);
// let sentinelLayer = new ImageTileLayer(sentinelLayerProperties);
// let roadLayer = new ImageTileLayer(roadLayerProperties);
// let terrainLayer = new ImageTileLayer(sentinelTerrainLayerProperties);

let liffeySentinelLayer = new ImageTileLayer(liffeyLayerProperties);
let liffeyLabelLayer = new ImageTileLayer(liffeyLabelLayerProperties);

let slippyTileLayer = new SlippyTileLayer(slippyLayerProperties, 16, 31628, 21242);

let totalImage = new StaticImage(4.485, -1.875, 7.465, 7.35, 0, 
	"images/maps_145_b_4_(2)_f001r[SVC2].jpg", .3);

let totalOverlayImage = new StaticImage(4.45, -1.84, 3.893, 3.829, 0, 
	"images/maps_145_b_4_(2)_f001r[SVC2].png", .5);

function showMap(divName: string, name: string) {
    const canvas = <HTMLCanvasElement>document.getElementById(divName);

    var ctx = canvas.getContext('2d');

	let viewCanvas = new ViewCanvas(new Point2D(-12,-10), 27, 18, false, ctx);
	// viewCanvas.addTileLayer(baseLayer);
	// viewCanvas.addTileLayer(sentinelLayer);
	viewCanvas.addTileLayer(slippyTileLayer);
	//viewCanvas.addTileLayer(liffeySentinelLayer);
	//viewCanvas.addTileLayer(liffeyLabelLayer);

	viewCanvas.addStaticElement(totalImage);
	let fireImages = viewCanvas.layerManager.addLayer(firemaps, "firemaps");
	let wscImages = viewCanvas.layerManager.addLayer(wsc, "wsc");
	//viewCanvas.addStaticElement(totalOverlayImage);

	let moveImage = fireImages.getImage("14");

	let imageController = new ImageController(viewCanvas, moveImage);

	const plus = <HTMLCanvasElement>document.getElementById("plus");
	const minus = <HTMLCanvasElement>document.getElementById("minus");

	let panControl = new PanController(viewCanvas, canvas);
	let canvasControl = new ZoomController(viewCanvas, plus, minus);

	canvasControl.addZoomListener(panControl);

	let layerController = new LayerController(viewCanvas, slippyTileLayer);
	let layerControllerb = new LayerController(viewCanvas, wscImages);
	layerControllerb.mod = "b";
	let layerControllerc = new LayerController(viewCanvas, fireImages);
	layerControllerc.mod = "n";

	viewCanvas.draw();
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

