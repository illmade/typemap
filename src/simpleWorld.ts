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
liffeyLabelLayerProperties.opacity = 1;
liffeyLabelLayerProperties.tileDir = "images/liffey/";
liffeyLabelLayerProperties.visible = true;

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

let lowerabbeyImage = new StaticImage(1.295, 0.3776, .425, .435, -.23, 
	"images/maps_145_b_4_(2)_f007r[SVC2].jpg", 0.7);

let dameImage = new StaticImage(0.98, 2.315, .41, .428, -0.095, 
	"images/maps_145_b_4_(2)_f016r_2[SVC2].png", 0.7);

let customImage = new StaticImage(5.21, -.245, .42, .44, 0.03, 
	"images/maps_145_b_4_(2)_f010r_2[SVC2].jpg", 0.7);

let manorImage = new StaticImage(6.36, 0.025, .415, .435, 0.11, 
	"images/maps_145_b_4_(2)_f011r[SVC2].jpg", 0.7);

let sackvilleImage = new StaticImage(1.29, -1.28, .46, .42, -0.265, 
	"images/maps_145_b_4_(2)_f004r[SVC2].jpg", 0.7);

let greatImage = new StaticImage(.19, -0.705, .4, .42, -.51, 
	"images/maps_145_b_4_(2)_f003r[SVC2].jpg", 0.7);

let lowerormondImage = new StaticImage(0.16, 0.71, .405, .44, -0.205, 
	"images/maps_145_b_4_(2)_f006r[SVC2].jpg", 0.7);

let stephensImage = new StaticImage(1.73, 4.935, .415, .42, 0.205, 
	"images/maps_145_b_4_(2)_f020R[SVC2].jpg", 0.7);

let marysImage = new StaticImage(-1.055, 0.985, .43, .435, -0.21, 
	"images/maps_145_b_4_(2)_f005r[SVC2].jpg", 0.7);

let steamImage = new StaticImage(8.145, 0.265, .815, .92, 0.12, 
	"images/maps_145_b_4_(2)_f012r_1[SVC2].jpg", 0.7);

let crossPoddle = new StaticImage(-2.846, 6.125, .199, .205, -0.025, 
	"images/wsc-maps-433-2.jpg", 0.7);

let patricksImage = new StaticImage(-2.27, 5.95, .4, .4, 0.035, 
	"images/wsc-maps-184-1-front.jpg", 0.6);

let clonmelImage = new StaticImage(1.845, 8.12, .83, .83, -2.725, 
	"images/wsc-maps-467-02.png", 0.7);

let broadstoneImage = new StaticImage(-2.61, -0.055, 1.455, 1.455, 1.565, 
	"images/wsc-maps-072.png", 0.7);

let parliamentImage = new StaticImage(-0.9, 2.67, .5, .5, -3.32, 
	"images/wsc-maps-088-1.png", 0.7);

let cutpurseImage = new StaticImage(-3.885, 3.43, .535, .545, -0.074, 
	"images/wsc-maps-106-1.jpg", 0.7);

let cutpatrickImage = new StaticImage(-2.98, 4.32, 1.53, 1.53, -0.025, 
	"images/WSC-Maps-757.png", 0.7);

let cutpatrickOverlayImage = new StaticImage(-2.98, 4.32, 1.53, 1.53, -0.025, 
	"images/WSC-Maps-757_overlay.png", 0.7);

let thingImage = new StaticImage(-2.5, 3.6, 1.22, 1.16, 0, 
	"images/IMG_0646.png", 0.4);

let grandImage = new StaticImage(0.755, 3.2, .6, .6, 1.235, "images/wsc-maps-334.png", 0.4);

let totalImage = new StaticImage(4.485, -1.875, 7.465, 7.35, 0, 
	"images/maps_145_b_4_(2)_f001r[SVC2].jpg", .5);

let totalOverlayImage = new StaticImage(4.45, -1.84, 3.893, 3.829, 0, 
	"images/maps_145_b_4_(2)_f001r[SVC2].png", .5);

function showMap(divName: string, name: string) {
    const canvas = <HTMLCanvasElement>document.getElementById(divName);

    var ctx = canvas.getContext('2d');

	let viewCanvas = new ViewCanvas(new Point2D(0,0), 9, 6, ctx);
	// viewCanvas.addTileLayer(baseLayer);
	// viewCanvas.addTileLayer(sentinelLayer);
	//viewCanvas.addTileLayer(liffeySentinelLayer);
	viewCanvas.addTileLayer(liffeyLabelLayer);

	viewCanvas.addStaticElement(totalImage);
	viewCanvas.addStaticElement(totalOverlayImage);
	viewCanvas.addStaticElement(broadstoneImage);
	viewCanvas.addStaticElement(parliamentImage);
	viewCanvas.addStaticElement(cutpurseImage);
	viewCanvas.addStaticElement(grandImage);
	//viewCanvas.addStaticElement(cutpatrickImage);
	viewCanvas.addStaticElement(cutpatrickOverlayImage);
	viewCanvas.addStaticElement(dolierImage);
	viewCanvas.addStaticElement(trinityImage);
	viewCanvas.addStaticElement(poolbegImage);
	viewCanvas.addStaticElement(abbeyImage);
	viewCanvas.addStaticElement(lowerabbeyImage);
	viewCanvas.addStaticElement(busarasImage);
	viewCanvas.addStaticElement(steamImage);
	viewCanvas.addStaticElement(dameImage);
	viewCanvas.addStaticElement(customImage);
	viewCanvas.addStaticElement(manorImage);
	viewCanvas.addStaticElement(sackvilleImage);
	viewCanvas.addStaticElement(greatImage);
	viewCanvas.addStaticElement(lowerormondImage);
	viewCanvas.addStaticElement(stephensImage);
	viewCanvas.addStaticElement(marysImage);
	viewCanvas.addStaticElement(patricksImage);
	//viewCanvas.addStaticElement(crossPoddle);
	viewCanvas.addStaticElement(clonmelImage);
	viewCanvas.addStaticElement(thingImage);

	let imageController = new ImageController(viewCanvas, totalOverlayImage);

	const plus = <HTMLCanvasElement>document.getElementById("plus");
	const minus = <HTMLCanvasElement>document.getElementById("minus");

	let panControl = new PanController(viewCanvas, canvas);
	let canvasControl = new ZoomController(viewCanvas, plus, minus);

	canvasControl.addZoomListener(panControl);

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

