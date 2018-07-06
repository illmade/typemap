import { World2D } from "./geom/world2d";
import { Viewport } from "./geom/viewport";
import { Point2D } from "./geom/point2d";
import { ImageTileLayer, ImageStruct } from "./graphics/canvastile";
import { ViewCanvas } from "./graphics/viewcanvas";

let simpleWorld = new World2D(2, 2, true, false);

let layerProperties = new ImageStruct();
layerProperties.prefix = "";
layerProperties.suffix = ".png";
layerProperties.tileDir = "images/tiles/test/1/";
.
let baseLayer = new ImageTileLayer(1, 1, layerProperties);


function showMap(divName: string, name: string) {
    const canvas = <HTMLCanvasElement>document.getElementById(divName);
    var ctx = canvas.getContext('2d');
	let canvasView = new ViewCanvas(simpleWorld, new Point2D(.5, .5), 1, 1, ctx);
}

showMap("canvas", "TypeScript");