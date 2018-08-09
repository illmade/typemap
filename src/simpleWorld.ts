import { World2D } from "./geom/world2d";
import { Viewport } from "./geom/viewport";
import { Point2D } from "./geom/point2d";
import { StaticImage, ImageTileLayer, ImageStruct, SlippyTileLayer } from "./graphics/canvastile";
import { ViewCanvas } from "./graphics/viewcanvas";
import { ZoomController, PanController } from "./ui/mapController";
import { ImageController, LayerController} from "./ui/imageController";

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

let dolierImage = new StaticImage(2.24, 1.87, .43, .43, -0.06, 
	"images/maps_145_b_4_(2)_f017R[SVC2].jpg", .7);

let maryImage = new StaticImage(-.96, -.59, .41, .42, -0.325, 
	"images/maps_145_b_4_(2)_f002r_2[SVC2] (1).png", 0.7);

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

let stephensImage = new StaticImage(1.725, 4.9, .205, .215, 0.195, 
	"images/maps_145_b_4_(2)_f020R[SVC2].jpg", 0.6);

let stmarysImage = new StaticImage(-1.055, 1.02, .43, .415, -0.21, 
	"images/maps_145_b_4_(2)_f005r[SVC2].jpg", 0.7);

let steamImage = new StaticImage(8.145, 0.265, .815, .92, 0.12, 
	"images/maps_145_b_4_(2)_f012r_1[SVC2].jpg", 0.7);

let fifteenImage = new StaticImage(-3.8, 2.85, 0.4, .4, -1.47, 
	"images/maps_145_b_4_(2)_f015r_2[SVC2].png", 0.7);


let henriettaImage = new StaticImage(-2.355, -2.43, 0.61, 0.61, 0.05, 
	"images/henrietta.png", 0.7);

let matermisImage = new StaticImage(-1.18, -6.4, 0.25, 0.32, 0.145, 
	"images/matermis.png", 0.7);

let oconnellImage = new StaticImage(-4.54, -13.55, 0.25, 0.32, 0, 
	"images/oconnell.png", 0.7);

let fourcourtsImage = new StaticImage(-3.28, 1.77, 0.55, 0.55, -0.03, 
	"images/fourcourts.png", 1);

let michansImage = new StaticImage(-3.88, 0.7, 0.32, 0.32, -0.03, 
	"images/michans.png", 1);


let marketImage = new StaticImage(-3.365, 3.79, 0.3, 0.3, 0.04, 
	"images/market.png", 0.7);


let thecastleImage = new StaticImage(-0.87, 3.48, 0.48, 0.56, -0.115, 
	"images/thecastle.png", 1);

let ngirelandImage = new StaticImage(4.58, 4.92, 0.36, 0.46, -0.085, 
	"images/ngireland.png", 1);

let bluecoatsImage = new StaticImage(-6.619, -0.165, 0.4, 0.4, -0.05, 
	"images/bluecoats.png", 0.7);

let hughlaneImage = new StaticImage(0.11, -3.27, 0.4, 0.4, -0.225, 
	"images/hughlane.png", 0.7);

let mountjoyImage = new StaticImage(3.335, -5.135, 0.4, 0.4, 0.17, 
	"images/mountjoy.png", 0.7);

let customsImage = new StaticImage(4.39, 0.32, 0.43, 0.43, -0.05, 
	"images/customshouse.png", 0.7);

let libertyImage = new StaticImage(3.43, 0.009, 0.43, 0.43, -0.05, 
	"images/liberty.png", 0.7);

let crossPoddle = new StaticImage(-2.846, 6.125, .199, .205, -0.025, 
	"images/wsc-maps-433-2.jpg", 0.7);

let patricksImage = new StaticImage(-2.27, 5.95, .4, .4, 0.035, 
	"images/wsc-maps-184-1-front.jpg", 0.6);

let clonmelImage = new StaticImage(1.845, 8.12, .83, .83, -2.725, 
	"images/wsc-maps-467-02.png", 0.7);

let parliamentImage = new StaticImage(-0.9, 2.67, .5, .5, -3.32, 
	"images/wsc-maps-088-1.png", 0.7);

let cutpurseImage = new StaticImage(-3.885, 3.43, .535, .545, -0.074, 
	"images/wsc-maps-106-1.jpg", 0.7);


let cutpatrickOverlayImage = new StaticImage(-2.98, 4.32, 1.53, 1.53, -0.025, 
	"images/WSC-Maps-757_overlay.png", 0.7);

let broadstoneImage = new StaticImage(-2.61, -0.055, .62, .62, 1.565, 
	"images/wsc-maps-072-m.png", 0.9);

let broadstoneUpImage = new StaticImage(-2.675, -6.23, 1.58, 1.58, 1.615, 
	"images/wsc-maps-075-m2.png", 0.9);

let cutpatrickImage = new StaticImage(-2.96, 4.375, .71499, .71499, -0.025, 
	"images/wsc-maps-757-l.png", 0.7);

let barracksImage = new StaticImage(-2.11, 2.87, 2.04, 1.945, -0.025, 
	"images/wsc-maps-155-m.png", 0.4);

let jamesImage = new StaticImage(-9.55, 3.95, .355, .355, -3.46, 
	"images/wsc-maps-729-m.png", 0.5);

let belloImage = new StaticImage(.995, 11.885, 1.2, 1.2, -2, 
	"images/wsc-maps-142_m.png", 0.7);



let thingImage = new StaticImage(-2.5, 3.6, 1.22, 1.16, 0, 
	"images/IMG_0646.png", 0.4);

let portoImage = new StaticImage(-1.7, 12.5, 1.52, 1.63, .54, 
	"images/portobello.png", 0.4);

// let portoImage = new StaticImage(-0.3, 11.3, 1.4, 1.4, .3, 
// 	"images/portobello.png", 0.4);

let donnyImage = new StaticImage(6, 13.01, 1.345, 1.73, .29, 
	"images/donny.png", 0.2);


let sixteentenImage = new StaticImage(-1.8, 2.795, .98, 1, .115, 
	"images/dublin1610.png", 0.2);

let bluecoatImage = new StaticImage(-3.435, -1.995, 2.39, 2.355, 0, 
	"images/bluecoat.png", 0.4);

let rutlandImage = new StaticImage(2.245, -0.795, 1.975, 1.975, 0, 
	"images/rutland.png", 0.7);

let materImage = new StaticImage(2.09, -5.355, 2.010, 2.015, 0, 
	"images/mater.png", 0.5);

let townsendImage = new StaticImage(4.575, 3.995, 2.035, 2.035, 0, 
	"images/townsend.png", 0.7);

let castleImage = new StaticImage(-3.51, 2.375, 1.985, 1.995, 0, 
	"images/castle.png", 0.4);

let innerDockImage = new StaticImage(9.215, -0.8, 3.455, 3.42, 0, 
	"images/innerDock.png", 0.4);

let grandImage = new StaticImage(0.755, 3.2, .6, .6, 1.235, 
	"images/wsc-maps-334.png", 0.4);

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
	//viewCanvas.addStaticElement(totalOverlayImage);
	viewCanvas.addStaticElement(broadstoneImage);
	viewCanvas.addStaticElement(broadstoneUpImage);
	viewCanvas.addStaticElement(parliamentImage);
	viewCanvas.addStaticElement(cutpurseImage);
	viewCanvas.addStaticElement(grandImage);
	viewCanvas.addStaticElement(rutlandImage);
	viewCanvas.addStaticElement(materImage);
	//viewCanvas.addStaticElement(townsendImage);
	viewCanvas.addStaticElement(innerDockImage);
	viewCanvas.addStaticElement(cutpatrickImage);
	//viewCanvas.addStaticElement(cutpatrickOverlayImage);

	viewCanvas.addStaticElement(maryImage);	
	viewCanvas.addStaticElement(stephensImage);
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
	viewCanvas.addStaticElement(stmarysImage);
	viewCanvas.addStaticElement(patricksImage);
	viewCanvas.addStaticElement(barracksImage);
	viewCanvas.addStaticElement(jamesImage);
	//viewCanvas.addStaticElement(crossPoddle);
	viewCanvas.addStaticElement(clonmelImage);
	viewCanvas.addStaticElement(thingImage);
	viewCanvas.addStaticElement(bluecoatImage);
	viewCanvas.addStaticElement(castleImage);
	viewCanvas.addStaticElement(fifteenImage);

	viewCanvas.addStaticElement(henriettaImage);
	viewCanvas.addStaticElement(matermisImage);
	viewCanvas.addStaticElement(fourcourtsImage);
	viewCanvas.addStaticElement(bluecoatsImage);
	viewCanvas.addStaticElement(hughlaneImage);
	viewCanvas.addStaticElement(mountjoyImage);
	viewCanvas.addStaticElement(customsImage);
	viewCanvas.addStaticElement(libertyImage);
	viewCanvas.addStaticElement(michansImage);
	viewCanvas.addStaticElement(thecastleImage);
	viewCanvas.addStaticElement(ngirelandImage);
	viewCanvas.addStaticElement(oconnellImage);
	viewCanvas.addStaticElement(marketImage);

	//viewCanvas.addStaticElement(portoImage);
	viewCanvas.addStaticElement(donnyImage);
	viewCanvas.addStaticElement(belloImage);
	viewCanvas.addStaticElement(sixteentenImage);

	let imageController = new ImageController(viewCanvas, marketImage);

	const plus = <HTMLCanvasElement>document.getElementById("plus");
	const minus = <HTMLCanvasElement>document.getElementById("minus");

	let panControl = new PanController(viewCanvas, canvas);
	let canvasControl = new ZoomController(viewCanvas, plus, minus);

	canvasControl.addZoomListener(panControl);

	let layerController = new LayerController(viewCanvas, slippyTileLayer);

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

