import { CanvasView } from "../graphics/canvasview";
import { CanvasElement } from "../graphics/layer";
import { Point2D } from "../geom/point2d";
import { MouseController } from "./mousecontroller";
import { Indexer } from "../index/indexer";
import { Logger, ConsoleLogger } from "../logging/logger";

import { ImageController } from "./imagecontroller";
import { IndexView } from "./indexview";
import { CanvasLayerView } from "./canvaslayerview";

export class IndexController extends MouseController {

	private logger: Logger;
	private indexers: Array<Indexer>;
	private menu: HTMLElement;

    constructor(
      readonly canvasView: CanvasView,
      readonly imageController: ImageController
    ) {
    	super();

    	document.addEventListener("dblclick", (e:Event) => 
    		this.clicked(e  as MouseEvent));

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

    clicked(e: MouseEvent){
    	let point = this.mousePosition(e, this.canvasView.canvasElement);

    	let worldPoint = this.canvasView.getBasePoint(
    		new Point2D(point.x, point.y));

    	var layers: Array<CanvasElement> = [];

    	for (let indexer of this.indexers) {
    		let newLayers = this.filterVisible(
    			indexer.getLayers(worldPoint.x, worldPoint.y));
    		layers = layers.concat(newLayers);
    	}

    	if (this.menu != undefined){
    		let layerView = new IndexView(this.menu, this.canvasView, 
    			this.imageController);
    		layerView.setElements(layers);
    	}
    }

	private filterVisible(layers: Array<CanvasElement>){
		return layers.filter(function(layer) { 
			return layer.isVisible();
		});
	}

}