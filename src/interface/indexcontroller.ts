import { CanvasView } from "../graphics/canvasview";
import { CanvasLayer, ContainerLayer } from "../graphics/layer";
import { OffsetProjection } from "../geom/projection";
import { Point2D } from "../geom/point2d";
import { MouseController } from "./viewcontroller";
import { Indexer } from "../index/indexer";
import { Logger, ConsoleLogger } from "../logging/logger";

import { IndexView } from "./indexview";
import { CanvasLayerView } from "./layerview";

export class IndexController extends MouseController {

	private logger: Logger;
	private indexers: Array<Indexer>;
	private menu: HTMLElement;

    constructor(canvasView: CanvasView) {
    	super();

    	document.addEventListener("dblclick", (e:Event) => 
    		this.clicked(canvasView, e  as MouseEvent));

    	this.indexers = [];
    	this.logger = new ConsoleLogger();
    }

    setLogging(logger: Logger){
    	this.logger = logger;
    }

    setMenu(menu: HTMLElement){
    	this.menu = menu;
    }

    addIndexer(indexer: Indexer){
    	this.indexers.push(indexer);
    }

    clicked(canvasView: CanvasView, e: MouseEvent){
    	let point  = this.mousePosition(e, canvasView.canvasElement);

    	let worldPoint = canvasView.getBasePoint(
    		new Point2D(point[0], point[1]));

    	var layers: Array<CanvasLayer> = [];

    	for (let indexer of this.indexers) {
    		let newLayers = this.filterVisible(
    			indexer.getLayers(worldPoint.x, worldPoint.y));
    		layers = layers.concat(newLayers);
    	}

    	for (let layer of layers){
    		this.logger.log("layer " + layer.name);
    	}

    	if (this.menu != undefined){
    		let layerView = new IndexView(this.menu);
    		layerView.setElements(layers);
    	}
    }

	private filterVisible(layers: Array<CanvasLayer>){
		return layers.filter(function(layer) { 
			return layer.isVisible();
		})
	}

}