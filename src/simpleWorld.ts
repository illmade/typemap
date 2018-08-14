import { CanvasView } from "./gtwo/canvasview";
import { StaticImage } from "./gtwo/static";
import { BasicState } from "./gtwo/view";
import { ImageLayer } from "./gtwo/layer";


function showMap(divName: string, name: string) {
    const canvas = <HTMLCanvasElement>document.getElementById(divName);
    let worldState = new BasicState(0, 0, 1, 1, 0);
    let canvasView = new CanvasView(worldState, canvas.clientWidth, canvas.clientHeight, canvas);

    let layerState = new BasicState(0, 0, 4, 4, 0);
    let imageLayer = new ImageLayer(layerState, 1);

    let imageState = new BasicState(10, 10, 0.15, 0.15, 0);
    let helloImage = new StaticImage(imageState, "images/mater.png", .5);

    let lctx = canvas.getContext("2d");
    lctx.fillRect(0, 0, 50, 50);
    lctx.fillStyle = "red";
    lctx.fillRect(0, 0, 10, 10);

    let rotateState = new BasicState(50, 50, 0.10, 0.10, Math.PI/6);
    let nextImage = new StaticImage(rotateState, "images/rutland.png", 0.8);

    imageLayer.layers.push(helloImage);
    imageLayer.layers.push(nextImage);
    canvasView.layers.push(imageLayer);
    canvasView.draw();
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