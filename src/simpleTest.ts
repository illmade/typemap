import { CanvasView } from "./gtwo/canvasview";
import { StaticImage } from "./gtwo/static";
import { ContainerLayer } from "./gtwo/layer";
import { BasicTransform } from "./gtwo/view";
import { StaticGrid } from "./gtwo/grid";
import { TileLayer, TileStruct, zoomByLevel} from "./gtwo/tilelayer";


function showMap(divName: string, name: string) {
    const canvas = <HTMLCanvasElement>document.getElementById(divName);
    let canvasTransform = new BasicTransform(288, 288, 1.4, 1.4, 0);
    let canvasView = new CanvasView(canvasTransform, canvas.clientWidth, canvas.clientHeight, canvas);

    let layerState = new BasicTransform(384, 384, 2, 2, 0);
    let imageLayer = new ContainerLayer(layerState, 1);

    let imageState = new BasicTransform(0,0, 0.222, 0.222, 0);
    let helloImage = new StaticImage(imageState, "images/bluecoat.png", .5);

    //let zoomState = new BasicTransform(128, 128, 1, 1, 0);
    //let zoomLayer = new ContainerLayer(zoomState, 1);

    //let rotateState = new BasicTransform(25, 25, 0.10, 0.10, Math.PI/4);
    //let nextImage = new StaticImage(rotateState, "images/bluecoat.png", 0.8);

    let gridTransform = new BasicTransform(0, 0, 1, 1, 0);
    let staticGrid = new StaticGrid(gridTransform, 0);

    let tileStruct = new TileStruct("test/", ".png", "images/test/");
    let zoom = zoomByLevel(0);
    let tileTransform = new BasicTransform(0, 0, zoom, zoom, 0);
    let tileLayer = new TileLayer(tileTransform, tileStruct);
    //let staticGridb = new StaticGrid(gridTransform, 3);

    imageLayer.layers.push(helloImage);
    //zoomLayer.layers.push(nextImage);

    canvasView.layers.push(tileLayer);
    canvasView.layers.push(imageLayer);
    //canvasView.layers.push(zoomLayer);
    canvasView.layers.push(staticGrid);
    //canvasView.layers.push(staticGridb);

    if (!canvasView.draw() ){
        console.log("waiting for complete");
        setTimeout(1500, canvasView.draw());
    }

    let lctx = canvas.getContext("2d");
    lctx.fillStyle = "white";
    lctx.fillRect(0, 0, 128, 128);
    lctx.fillStyle = "red";
    lctx.fillRect(0, 0, 64, 64);

    //setTimeout(() =>  canvasView.draw(), 2500);
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