import { Viewport } from "./geom/viewport";
import { Point2D } from "./geom/point2d";
import { ImageStruct, , TileStruct } from "./graphics/display";
import { ImageTileLayer } from "./graphics/imagetile";
import { StaticImage } from "./graphics/static";
import { SlippyTileLayer } from "./graphics/slippytile";
import { ViewCanvas } from "./graphics/viewcanvas";
import { Zoomer, ZoomController, PanController } from "./ui/mapController";
import { ImageController, DisplayElementController} from "./ui/imageController";

import * as firemaps from "./imagegroups/firemaps.json";
import * as wsc from "./imagegroups/wsc.json";
import * as landmarks from "./imagegroups/landmarks.json";

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
let liffeyLayerTileProperties = new TileStruct();
liffeyLayerTileProperties.suffix = "liffey.jpeg";
liffeyLayerTileProperties.tileDirectory = "images/liffey/";

let liffeyLabelLayerProperties = new ImageStruct();
liffeyLabelLayerProperties.opacity = 1;

let liffeyLabelTileProperties = new TileStruct();
liffeyLabelTileProperties.suffix = "liffey.png";
liffeyLabelTileProperties.tileDirectory = "images/liffey/";

let slippyDisplayProperties = new ImageStruct();
slippyDisplayProperties.opacity = .4;
slippyDisplayProperties.widthMapUnits = 2;
slippyDisplayProperties.heightMapUnits = 2;

let slippyTileProperties = new TileStruct();
slippyTileProperties.tileDirectory = "images/qtile/dublin/";
slippyTileProperties.suffix = ".png";


// let baseLayer = new ImageTileLayer(layerProperties);
// let sentinelLayer = new ImageTileLayer(sentinelLayerProperties);
// let roadLayer = new ImageTileLayer(roadLayerProperties);
// let terrainLayer = new ImageTileLayer(sentinelTerrainLayerProperties);

let liffeySentinelLayer = new ImageTileLayer(liffeyLayerProperties, liffeyLayerTileProperties);
let liffeyLabelLayer = new ImageTileLayer(liffeyLabelLayerProperties, liffeyLabelTileProperties);

let slippyTileLayer = new SlippyTileLayer(slippyDisplayProperties, slippyTileProperties, 
	16, 31628, 21242);

let totalImage = new StaticImage(4.485, -1.875, 7.465, 7.35, 0, 
	"images/firemap/maps_145_b_4_(2)_f001r[SVC2].jpg", .3);

let totalOverlayImage = new StaticImage(4.45, -1.84, 3.893, 3.829, 0, 
	"images/firemap/maps_145_b_4_(2)_f001r[SVC2].png", .5);

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
	let landmarkImages = viewCanvas.layerManager.addLayer(landmarks, "landmarks");
	//viewCanvas.addStaticElement(totalOverlayImage);

	let moveImage = wscImages.getImage("wsc-157-3");

	let imageController = new ImageController(viewCanvas, moveImage);

	const plus = <HTMLCanvasElement>document.getElementById("plus");
	const minus = <HTMLCanvasElement>document.getElementById("minus");

	let zoomer = new Zoomer();
	let panControl = new PanController(viewCanvas, canvas, zoomer);
	let canvasControl = new ZoomController(viewCanvas, plus, minus, zoomer);

	//canvasControl.addZoomListener(panControl);

	let layerController = new LayerController(viewCanvas, slippyTileLayer);
	layerController.mod = "v";
	let layerControllerb = new LayerController(viewCanvas, wscImages);
	layerControllerb.mod = "b";
	let layerControllerc = new LayerController(viewCanvas, fireImages);
	layerControllerc.mod = "n";
	let layerControllerd = new LayerController(viewCanvas, landmarkImages);
	layerControllerd.mod = "m";

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

