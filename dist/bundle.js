(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const view_1 = require("./view");
class CanvasView extends view_1.BasicViewTransform {
    constructor(localTransform, width, height, canvasElement) {
        super(localTransform.x, localTransform.y, width, height, localTransform.zoomX, localTransform.zoomY, localTransform.rotation);
        this.canvasElement = canvasElement;
        this.layers = [];
        this.initCanvas();
        this.ctx = canvasElement.getContext("2d");
    }
    zoomAbout(x, y, zoomBy) {
        this.zoomX = this.zoomX * zoomBy;
        this.zoomY = this.zoomY * zoomBy;
        let relativeX = x * zoomBy - x;
        let relativeY = y * zoomBy - y;
        let worldX = relativeX / this.zoomX;
        let worldY = relativeY / this.zoomY;
        this.x = this.x + worldX;
        this.y = this.y + worldY;
    }
    draw() {
        let transform = view_1.invertTransform(this);
        this.ctx.fillStyle = "grey";
        this.ctx.fillRect(0, 0, this.width, this.height);
        var drawingComplete = true;
        for (let layer of this.layers) {
            if (layer.isVisible()) {
                drawingComplete = drawingComplete && layer.draw(this.ctx, view_1.BasicTransform.unitTransform, this);
            }
        }
        this.drawCentre(this.ctx);
        return drawingComplete;
    }
    drawCentre(context) {
        context.beginPath();
        context.globalAlpha = 0.3;
        context.strokeStyle = "red";
        context.moveTo(this.width / 2, 6 / 16 * this.height);
        context.lineTo(this.width / 2, 10 / 16 * this.height);
        context.moveTo(7 / 16 * this.width, this.height / 2);
        context.lineTo(9 / 16 * this.width, this.height / 2);
        context.stroke();
        context.strokeStyle = "black";
        context.globalAlpha = 1;
    }
    initCanvas() {
        let width = this.canvasElement.clientWidth;
        let height = this.canvasElement.clientHeight;
        this.canvasElement.width = width;
        this.canvasElement.height = height;
    }
}
exports.CanvasView = CanvasView;

},{"./view":8}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const layer_1 = require("./layer");
/**
* We don't want to draw a grid into a transformed canvas as this gives us grid lines that are too
thick or too thin
*/
class StaticGrid extends layer_1.DrawLayer {
    constructor(localTransform, zoomLevel, gridWidth = 256, gridHeight = 256) {
        super(localTransform, 1);
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        let zoom = Math.pow(2, zoomLevel);
        this.zoomWidth = gridWidth / zoom;
        this.zoomHeight = gridHeight / zoom;
    }
    draw(ctx, transform, view) {
        let offsetX = view.x * view.zoomX;
        let offsetY = view.y * view.zoomY;
        let viewWidth = view.width / view.zoomX;
        let viewHeight = view.height / view.zoomY;
        let gridAcross = viewWidth / this.zoomWidth;
        let gridHigh = viewHeight / this.zoomHeight;
        let xMin = Math.floor(view.x / this.zoomWidth);
        let xLeft = xMin * this.zoomWidth * view.zoomX;
        let xMax = Math.ceil((view.x + viewWidth) / this.zoomWidth);
        let xRight = xMax * this.zoomWidth * view.zoomX;
        let yMin = Math.floor(view.y / this.zoomHeight);
        let yTop = yMin * this.zoomHeight * view.zoomX;
        let yMax = Math.ceil((view.y + viewHeight) / this.zoomHeight);
        let yBottom = yMax * this.zoomHeight * view.zoomX;
        console.log("xMin " + xMin + " xMax " + xMax);
        console.log("yMin " + yMin + " yMax " + yMax);
        ctx.beginPath();
        for (var x = xMin; x <= xMax; x++) {
            //console.log("at " + minX);
            let xMove = x * this.zoomWidth * view.zoomX;
            ctx.moveTo(xMove - offsetX, yTop - offsetY);
            ctx.lineTo(xMove - offsetX, yBottom - offsetY);
        }
        for (var y = yMin; y <= yMax; y++) {
            let yMove = y * this.zoomHeight * view.zoomY;
            ctx.moveTo(xLeft - offsetX, yMove - offsetY);
            ctx.lineTo(xRight - offsetX, yMove - offsetY);
            for (var x = xMin; x <= xMax; x++) {
                let xMove = (x - .5) * this.zoomWidth * view.zoomX;
                yMove = (y - .5) * this.zoomHeight * view.zoomY;
                let text = "" + (x - 1) + ", " + (y - 1);
                ctx.strokeText(text, xMove - offsetX, yMove - offsetY);
            }
        }
        ctx.closePath();
        ctx.stroke();
        console.log("drew grid");
        return true;
    }
}
exports.StaticGrid = StaticGrid;

},{"./layer":4}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DisplayElementController {
    constructor(canvasView, displayElement, mod = "v") {
        this.displayElement = displayElement;
        this.mod = mod;
        document.addEventListener("keypress", (e) => this.pressed(canvasView, e));
    }
    pressed(canvasView, event) {
        //console.log("pressed layer" + event.target + ", " + event.key);
        switch (event.key) {
            case this.mod:
                console.log("toggle visible");
                this.displayElement.setVisible(!this.displayElement.isVisible());
                canvasView.draw();
                break;
        }
    }
}
exports.DisplayElementController = DisplayElementController;
class ImageController {
    constructor(canvasView, canvasLayer) {
        this.canvasLayer = canvasLayer;
        document.addEventListener("keypress", (e) => this.pressed(canvasView, e));
    }
    pressed(viewCanvas, event) {
        console.log("pressed" + event.target + ", " + event.key);
        switch (event.key) {
            case "a":
                this.canvasLayer.x = this.canvasLayer.x - 0.5;
                viewCanvas.draw();
                break;
            case "d":
                this.canvasLayer.x = this.canvasLayer.x + 0.5;
                viewCanvas.draw();
                break;
            case "w":
                this.canvasLayer.y = this.canvasLayer.y - 0.5;
                viewCanvas.draw();
                break;
            case "s":
                this.canvasLayer.y = this.canvasLayer.y + 0.5;
                viewCanvas.draw();
                break;
            case "e":
                this.canvasLayer.rotation = this.canvasLayer.rotation - 0.005;
                viewCanvas.draw();
                break;
            case "q":
                this.canvasLayer.rotation = this.canvasLayer.rotation + 0.005;
                viewCanvas.draw();
                break;
            case "x":
                this.canvasLayer.zoomX = this.canvasLayer.zoomX - 0.002;
                viewCanvas.draw();
                break;
            case "X":
                this.canvasLayer.zoomX = this.canvasLayer.zoomX + 0.002;
                viewCanvas.draw();
                break;
            case "z":
                this.canvasLayer.zoomY = this.canvasLayer.zoomY - 0.002;
                viewCanvas.draw();
                break;
            case "Z":
                this.canvasLayer.zoomY = this.canvasLayer.zoomY + 0.002;
                viewCanvas.draw();
                break;
            case "T":
                this.canvasLayer.opacity = Math.min(1.0, this.canvasLayer.opacity + 0.1);
                viewCanvas.draw();
                break;
            case "t":
                this.canvasLayer.opacity = Math.max(0, this.canvasLayer.opacity - 0.1);
                viewCanvas.draw();
                break;
            default:
                // code...
                break;
        }
        console.log("image at: " + this.canvasLayer.x + ", " + this.canvasLayer.y);
        console.log("image ro sc: " + this.canvasLayer.rotation + ", " + this.canvasLayer.zoomX + ", " + this.canvasLayer.zoomY);
    }
    ;
}
exports.ImageController = ImageController;
;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const view_1 = require("./view");
class CanvasLayer extends view_1.BasicTransform {
    constructor(localTransform, opacity, visible) {
        super(localTransform.x, localTransform.y, localTransform.zoomX, localTransform.zoomY, localTransform.rotation);
        this.localTransform = localTransform;
        this.opacity = opacity;
        this.visible = visible;
    }
    isVisible() {
        return this.visible;
    }
    setVisible(visible) {
        console.log("setting visibility: " + visible);
        this.visible = visible;
    }
    getOpacity() {
        return this.opacity;
    }
    setOpacity(opacity) {
        this.opacity = opacity;
    }
}
exports.CanvasLayer = CanvasLayer;
class DrawLayer extends CanvasLayer {
    prepareCtx(ctx, transform, view) {
        ctx.translate((transform.x - view.x) * view.zoomX, (transform.y - view.y) * view.zoomY);
        ctx.scale(transform.zoomX * view.zoomX, transform.zoomY * view.zoomY);
        ctx.rotate(transform.rotation);
    }
    cleanCtx(ctx, transform, view) {
        ctx.rotate(-transform.rotation);
        ctx.scale(1 / transform.zoomX / view.zoomX, 1 / transform.zoomY / view.zoomY);
        ctx.translate(-(transform.x - view.x) * view.zoomX, -(transform.y - view.y) * view.zoomY);
    }
}
exports.DrawLayer = DrawLayer;
class ContainerLayer extends CanvasLayer {
    constructor(localTransform, opacity = 1, visible = true) {
        super(localTransform, opacity, visible);
        this.layerMap = new Map();
    }
    set(name, layer) {
        this.layerMap.set(name, layer);
    }
    get(name) {
        return this.layerMap.get(name);
    }
    draw(ctx, parentTransform, view) {
        let layerTransform = view_1.combineTransform(this.localTransform, parentTransform);
        var drawingComplete = true;
        for (let layer of this.layerMap) {
            if (layer[1].isVisible()) {
                drawingComplete = drawingComplete && layer[1].draw(ctx, layerTransform, view);
            }
        }
        return drawingComplete;
    }
}
exports.ContainerLayer = ContainerLayer;

},{"./view":8}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const layer_1 = require("./layer");
const static_1 = require("./static");
const view_1 = require("./view");
class LayerManager {
    constructor() {
        this.defaultLayer = "default";
        this.layerMap = new Map();
        let imageLayer = new layer_1.ContainerLayer(view_1.BasicTransform.unitTransform, 1, true);
        this.layerMap.set(this.defaultLayer, imageLayer);
    }
    ;
    addImage(image, name) {
        this.layerMap.get(this.defaultLayer).set(name, image);
    }
    addLayer(imageDetails, layerName) {
        let imageLayer = new layer_1.ContainerLayer(view_1.BasicTransform.unitTransform, 1, true);
        for (var image of imageDetails) {
            let staticImage = new static_1.StaticImage(image, image.src, image.opacity, image.visible);
            imageLayer.set(image.name, staticImage);
        }
        this.layerMap.set(layerName, imageLayer);
        return imageLayer;
    }
    getLayers() {
        return this.layerMap;
    }
}
exports.LayerManager = LayerManager;

},{"./layer":4,"./static":6,"./view":8}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const view_1 = require("./view");
const layer_1 = require("./layer");
class StaticImage extends layer_1.DrawLayer {
    constructor(localTransform, imageSrc, opacity, visible = true) {
        super(localTransform, opacity, visible);
        this.img = new Image();
        this.img.src = imageSrc;
    }
    drawImage(ctx, parentTransform, view) {
        let ctxTransform = view_1.combineTransform(this, parentTransform);
        //console.log("ctx x " + ctxTransform.x);
        this.prepareCtx(ctx, ctxTransform, view);
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(this.img, 0, 0);
        ctx.globalAlpha = 1;
        this.cleanCtx(ctx, ctxTransform, view);
    }
    draw(ctx, parentTransform, view) {
        if (this.visible && this.img.complete) {
            this.drawImage(ctx, parentTransform, view);
            //	console.log("drew image " + this.img.src);
            return true;
        }
        return false;
    }
}
exports.StaticImage = StaticImage;

},{"./layer":4,"./view":8}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const layer_1 = require("./layer");
const view_1 = require("./view");
class TileStruct {
    constructor(prefix, suffix, tileDirectory) {
        this.prefix = prefix;
        this.suffix = suffix;
        this.tileDirectory = tileDirectory;
    }
}
exports.TileStruct = TileStruct;
function zoomByLevel(zoomLevel) {
    return Math.pow(2, zoomLevel);
}
exports.zoomByLevel = zoomByLevel;
class TileLayer extends layer_1.DrawLayer {
    constructor(localTransform, tileStruct, xOffset = 0, yOffset = 0, zoom = 1, gridWidth = 256, gridHeight = 256, opacity = 1, visbile = true) {
        super(localTransform, opacity, visbile);
        this.tileStruct = tileStruct;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.zoom = zoom;
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.tileManager = new TileManager();
    }
    draw(ctx, parentTransform, view) {
        let ctxTransform = view_1.combineTransform(this, parentTransform);
        let zoomWidth = this.gridWidth * ctxTransform.zoomX;
        let zoomHeight = this.gridHeight * ctxTransform.zoomY;
        //console.log("ctx zoomWidth: " + zoomWidth);
        let viewX = view.x * view.zoomX;
        let viewY = view.y * view.zoomY;
        let viewWidth = view.width / view.zoomX;
        let viewHeight = view.height / view.zoomY;
        let gridAcross = viewWidth / zoomWidth; //good
        let gridHigh = viewHeight / zoomHeight; //good
        let xMin = Math.floor(view.x / zoomWidth);
        let xMax = Math.ceil((view.x + viewWidth) / zoomWidth);
        let yMin = Math.floor(view.y / zoomHeight);
        let yMax = Math.ceil((view.y + viewHeight) / zoomHeight);
        //console.log("x y s " + xMin + ", " + xMax + ": " + yMin + ", " + yMax);
        //console.log("across high" + gridAcross + ", " + gridHigh);
        var drawingComplete = true;
        let fullZoomX = ctxTransform.zoomX * view.zoomX;
        let fullZoomY = ctxTransform.zoomY * view.zoomY;
        //console.log("fullzooms " + fullZoomX + " " + fullZoomY);
        ctx.scale(fullZoomX, fullZoomY);
        for (var x = xMin; x < xMax; x++) {
            let xMove = x * this.gridWidth - view.x / ctxTransform.zoomX;
            for (var y = yMin; y < yMax; y++) {
                let yMove = y * this.gridHeight - view.y / ctxTransform.zoomY;
                //console.log("tile x y " + x + " " + y + ": " + xMove + ", " + yMove);
                ctx.translate(xMove, yMove);
                let tileSrc = this.tileStruct.tileDirectory + this.zoom + "/" +
                    (x + this.xOffset) + "/" +
                    (y + this.yOffset) + this.tileStruct.suffix;
                if (this.tileManager.has(tileSrc)) {
                    let imageTile = this.tileManager.get(tileSrc);
                    drawingComplete = drawingComplete && imageTile.draw(ctx);
                }
                else {
                    let imageTile = new ImageTile(x, y, tileSrc);
                    drawingComplete = drawingComplete && imageTile.draw(ctx);
                    this.tileManager.set(tileSrc, imageTile);
                }
                ctx.translate(-xMove, -yMove);
            }
        }
        ctx.scale(1 / fullZoomX, 1 / fullZoomY);
        //console.log("drew tiles " + drawingComplete);
        return drawingComplete;
    }
}
exports.TileLayer = TileLayer;
class TileManager {
    constructor() {
        this.tileMap = new Map();
    }
    get(tileKey) {
        return this.tileMap.get(tileKey);
    }
    has(tileKey) {
        return this.tileMap.has(tileKey);
    }
    set(tileKey, tile) {
        this.tileMap.set(tileKey, tile);
    }
}
exports.TileManager = TileManager;
class ImageTile {
    constructor(xIndex, yIndex, imageSrc) {
        this.xIndex = xIndex;
        this.yIndex = yIndex;
        this.img = new Image();
        this.img.src = imageSrc;
        this.img.onerror = function (eventOrMessage) {
            eventOrMessage.target.src = "";
        };
    }
    ;
    drawImage(ctx) {
        ctx.drawImage(this.img, 0, 0);
    }
    draw(ctx) {
        if (this.img.src != "" && this.img.complete) {
            this.drawImage(ctx);
            return true;
        }
        return false;
    }
    ;
}
exports.ImageTile = ImageTile;

},{"./layer":4,"./view":8}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BasicTransform {
    constructor(x, y, zoomX, zoomY, rotation) {
        this.x = x;
        this.y = y;
        this.zoomX = zoomX;
        this.zoomY = zoomY;
        this.rotation = rotation;
    }
}
BasicTransform.unitTransform = new BasicTransform(0, 0, 1, 1, 0);
exports.BasicTransform = BasicTransform;
function combineTransform(child, container) {
    let zoomX = child.zoomX * container.zoomX;
    //console.log("modified " + child.zoomX + " to " + zoomX);
    let zoomY = child.zoomY * container.zoomY;
    //console.log("modified " + child.zoomY + " by " + container.zoomY + " to " + zoomY);
    let x = (child.x * container.zoomX) + container.x;
    let y = (child.y * container.zoomY) + container.y;
    //console.log("modified x " + child.x + " by " + container.zoomX + " and " + container.x + " to " + x);
    let rotation = child.rotation + container.rotation;
    return new BasicTransform(x, y, zoomX, zoomY, rotation);
}
exports.combineTransform = combineTransform;
function clone(transform) {
    return new BasicTransform(transform.x, transform.y, transform.zoomX, transform.zoomY, transform.rotation);
}
exports.clone = clone;
function invertTransform(worldState) {
    return new BasicTransform(-worldState.x, -worldState.y, 1 / worldState.zoomX, 1 / worldState.zoomY, -worldState.rotation);
}
exports.invertTransform = invertTransform;
class BasicViewTransform extends BasicTransform {
    constructor(x, y, width, height, zoomX, zoomY, rotation) {
        super(x, y, zoomX, zoomY, rotation);
        this.width = width;
        this.height = height;
    }
}
exports.BasicViewTransform = BasicViewTransform;

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MouseController {
    mousePosition(event, within) {
        let m_posx = event.clientX + document.body.scrollLeft
            + document.documentElement.scrollLeft;
        let m_posy = event.clientY + document.body.scrollTop
            + document.documentElement.scrollTop;
        var e_posx = 0;
        var e_posy = 0;
        if (within.offsetParent) {
            do {
                e_posx += within.offsetLeft;
                e_posy += within.offsetTop;
            } while (within = within.offsetParent);
        }
        return [m_posx - e_posx, m_posy - e_posy];
    }
}
class ViewController extends MouseController {
    constructor(viewTransform, dragElement, canvasView) {
        super();
        this.dragElement = dragElement;
        this.canvasView = canvasView;
        this.move = 1;
        dragElement.addEventListener("mousemove", (e) => this.dragged(e, viewTransform));
        dragElement.addEventListener("mousedown", (e) => this.dragged(e, viewTransform));
        dragElement.addEventListener("mouseup", (e) => this.dragged(e, viewTransform));
        dragElement.addEventListener("mouseleave", (e) => this.record = false);
        dragElement.addEventListener("dblclick", (e) => this.clicked(e, canvasView, 1.2));
        dragElement.addEventListener("wheel", (e) => this.wheel(e, canvasView));
    }
    clicked(event, viewTransform, zoomBy) {
        switch (event.type) {
            case "dblclick":
                if (event.ctrlKey) {
                    zoomBy = 1 / zoomBy;
                }
                let mXY = this.mousePosition(event, this.dragElement);
                this.canvasView.zoomAbout(mXY[0], mXY[1], zoomBy);
                this.canvasView.draw();
            default:
        }
    }
    dragged(event, viewTransform) {
        switch (event.type) {
            case "mousedown":
                this.record = true;
                break;
            case "mouseup":
                this.record = false;
                break;
            default:
                if (this.record) {
                    let xDelta = (event.clientX - this.xPrevious) / this.move / viewTransform.zoomX;
                    let yDelta = (event.clientY - this.yPrevious) / this.move / viewTransform.zoomY;
                    viewTransform.x = viewTransform.x - xDelta;
                    viewTransform.y = viewTransform.y - yDelta;
                    this.canvasView.draw();
                }
                this.xPrevious = event.clientX;
                this.yPrevious = event.clientY;
        }
    }
    wheel(event, viewTransform) {
        //console.log("wheel" + event.target + ", " + event.type);
        let xDelta = event.deltaX / this.move / viewTransform.zoomX;
        let yDelta = event.deltaY / this.move / viewTransform.zoomY;
        if (event.ctrlKey) {
            let mXY = this.mousePosition(event, this.dragElement);
            var by = 1.05;
            if (yDelta < 0) {
                by = 0.95;
            }
            this.canvasView.zoomAbout(mXY[0], mXY[1], by);
        }
        else {
            this.canvasView.x = this.canvasView.x + xDelta;
            this.canvasView.y = this.canvasView.y + yDelta;
        }
        this.canvasView.draw();
    }
}
exports.ViewController = ViewController;

},{}],10:[function(require,module,exports){
module.exports=[
	{
	"name": "2-2", "x": -364, "y": -12.5, "zoomX": 0.213, "zoomY": 0.205, "rotation": -0.31, 
	"src": "images/firemap/maps_145_b_4_(2)_f002r_2[SVC2].png", "visible": true, "opacity": 0.7
	},
	{
	"name": "3", "x": -216, "y": -0.705, "zoomX": 0.2, "zoomY": 0.21, "rotation": -0.51, 
	"src": "images/firemap/maps_145_b_4_(2)_f003r[SVC2].jpg", "visible": true, "opacity": 0.7
	},
	{
	"name": "4", "x": -74.29, "y": -99.78, "zoomX": 0.222, "zoomY": 0.208, "rotation": -0.285, 
	"src": "images/firemap/maps_145_b_4_(2)_f004r[SVC2].jpg", "visible": true, "opacity": 0.7
	},
	{
	"name": "5", "x": -375.555, "y": 180.519, "zoomX": 0.215, "zoomY": 0.207, "rotation": -0.21, 
	"src": "images/firemap/maps_145_b_4_(2)_f005r[SVC2].jpg", "visible": true, "opacity": 0.7
	},
	{
	"name": "6", "x": -216.16, "y": 146, "zoomX": 0.218, "zoomY": 0.218, "rotation": -0.225, 
	"src": "images/firemap/maps_145_b_4_(2)_f006r[SVC2].jpg", "visible": true, "opacity": 0.7
	},
	{
	"name": "7", "x": -63.3, "y": 100.3776, "zoomX": 0.2125, "zoomY": 0.217, "rotation": -0.23, 
	"src": "images/firemap/maps_145_b_4_(2)_f007r[SVC2].jpg", "visible": true, "opacity": 0.7
	},
	{
	"name": "8", "x": 78.1, "y": 58.535, "zoomX": 0.207, "zoomY": 0.217, "rotation": -0.25, 
	"src": "images/firemap/maps_145_b_4_(2)_f008r[SVC2].jpg", "visible": true, "opacity": 0.7
	},
	{
	"name": "9", "x": 219.5, "y": 24, "zoomX": 0.215, "zoomY": 0.2145, "rotation": -0.26,
	"src": "images/firemap/maps_145_b_4_(2)_f009r[SVC2].jpg", "visible": true, "opacity": 0.7
	},
	{
	"name": "10", "x": 454.21, "y": -1.5, "zoomX": 0.218, "zoomY": 0.214, "rotation": 0.015, 
	"src": "images/firemap/maps_145_b_4_(2)_f010r_2[SVC2].jpg", "visible": true, "opacity": 0.7
	},
	{
	"name": "11", "x": 621.86, "y": 25.525, "zoomX": 0.213, "zoomY": 0.2115, "rotation": 0.11, 
	"src": "images/firemap/maps_145_b_4_(2)_f011r[SVC2].jpg", "visible": true, "opacity": 0.7
	}, 
	{
	"name": "12-1", "x": 769.645, "y": 50.265, "zoomX": 0.424, "zoomY": 0.422, "rotation": 0.12, 
	"src": "images/firemap/maps_145_b_4_(2)_f012r_1[SVC2].jpg", "visible": true, "opacity": 0.7
	},
	{
	"name": "14", "x": -915.6, "y": 557.865, "zoomX": 0.208, "zoomY": 0.208, "rotation": -1.215, 
	"src": "images/firemap/maps_145_b_4_(2)_f014R[SVC2].jpg", "visible": true, "opacity": 0.7
	},
	{
	"name": "15-2", "x": -717.3, "y": 572, "zoomX": 0.21, "zoomY": 0.206, "rotation": -1.47, 
	"src": "images/firemap/maps_145_b_4_(2)_f015r_2[SVC2].png", "visible": true, "opacity": 0.7
	},
	{
	"name": "16-2", "x": -92, "y": 336, "zoomX": 0.215, "zoomY": 0.204, "rotation": -0.095, 
	"src": "images/firemap/maps_145_b_4_(2)_f016r_2[SVC2].png", "visible": true, "opacity": 0.7
	},
	{
	"name": "17", "x": 78, "y": 279, "zoomX": 0.2, "zoomY": 0.2, "rotation": -0.035, 
	"src": "images/firemap/maps_145_b_4_(2)_f017R[SVC2].jpg", "visible": true, "opacity": 0.7
	},
	{
	"name": "18", "x": 223.5, "y": 244.5, "zoomX": 0.214, "zoomY": 0.2, "rotation": 0.075, 
	"src": "images/firemap/maps_145_b_4_(2)_f018R[SVC2].jpg", "visible": true, "opacity": 0.7
	},
	{
	"name": "19", "x": 64.5, "y": 471.5, "zoomX": 0.209, "zoomY": 0.214, "rotation": 0.16, 
	"src": "images/firemap/maps_145_b_4_(2)_f019R[SVC2].jpg", "visible": true, "opacity": 0.7
	},
	{
	"name": "20", "x": 38.5, "y": 642, "zoomX": 0.102, "zoomY": 0.102, "rotation": 0.195, 
	"src": "images/firemap/maps_145_b_4_(2)_f020R[SVC2].jpg", "visible": true, "opacity": 0.7
	}

]




},{}],11:[function(require,module,exports){
module.exports=[
	{
		"name": "henrietta", "x": -486.5, "y": -252.5, "zoomX": 0.29, "zoomY": 0.5, "rotation": 0.05, 
		"src": "images/landmarks/henrietta.png", "visible": true, "opacity": 1
	},
	{
		"name": "mater", "x": -342, "y": -747, "zoomX": 0.08, "zoomY": 0.18, "rotation": -0.05, 
		"src": "images/landmarks/matermis.png", "visible": true, "opacity": 1
	},
	{
		"name": "peters", "x": -719, "y": -836, "zoomX": 0.07, "zoomY": 0.14, "rotation": -0.15, 
		"src": "images/landmarks/peters.png", "visible": true, "opacity": 1
	},
	{
		"name": "oconnell", "x": -821, "y": -1835, "zoomX": 0.25, "zoomY": 0.25, "rotation": 0, 
		"src": "images/landmarks/oconnell.png", "visible": true, "opacity": 0.9
	},
	{
		"name": "fourcourts", "x": -606, "y": 302, "zoomX": 0.23, "zoomY": 0.43, "rotation": -0.085, 
		"src": "images/landmarks/fourcourts.png", "visible": true, "opacity": 1
	},
	{
		"name": "michans", "x": -639, "y": 160, "zoomX": 0.14, "zoomY": 0.24, "rotation": 0.02, 
		"src": "images/landmarks/michans.png", "visible": true, "opacity": 0.8
	},
	{
		"name": "thecastle", "x": -290, "y": 520, "zoomX": 0.22, "zoomY": 0.42, "rotation": -0.015, 
		"src": "images/landmarks/thecastle.png", "visible": true, "opacity": 1
	},
	{
		"name": "market", "x": -617, "y": 565, "zoomX": 0.15, "zoomY": 0.26, "rotation": 0.04, 
		"src": "images/landmarks/market.png", "visible": true, "opacity": 0.5
	},
	{
		"name": "patricks", "x": -462, "y": 795, "zoomX": 0.1, "zoomY": 0.12, "rotation": 0.04, 
		"src": "images/landmarks/patricks.png", "visible": true, "opacity": 0.8
	},
	{
		"name": "ngireland", "x": 406, "y": 684, "zoomX": 0.19, "zoomY": 0.42, "rotation": -0.105, 
		"src": "images/landmarks/ngireland.png", "visible": true, "opacity": 0.8
	},
	{
		"name": "bluecoats", "x": -997, "y": 86, "zoomX": 0.1, "zoomY": 0.2, "rotation": -0.05, 
		"src": "images/landmarks/bluecoats.png", "visible": true, "opacity": 0.6
	},
	{
		"name": "collinsbarracks", "x": -1130, "y": 90, "zoomX": 0.13, "zoomY": 0.37, "rotation": 0.015, 
		"src": "images/landmarks/collinsbarracks.png", "visible": true, "opacity": 0.8
	},
	{
		"name": "hughlane", "x": -172, "y": -335, "zoomX": 0.2, "zoomY": 0.33, "rotation": -0.06, 
		"src": "images/landmarks/hughlane.png", "visible": true, "opacity": 0.7
	},
	{
		"name": "gpo", "x": 52, "y": 50, "zoomX": 0.086, "zoomY": 0.25, "rotation": -0.035, 
		"src": "images/landmarks/gpo.png", "visible": true, "opacity": 0.7
	},
	{
		"name": "mountjoy", "x": 263, "y": -560, "zoomX": 0.15, "zoomY": 0.285, "rotation": 0.17, 
		"src": "images/landmarks/mountjoy.png", "visible": true, "opacity": 0.7
	},
	{
		"name": "royalhospital", "x": -1851, "y": 487.5, "zoomX": 0.21, "zoomY": 0.3, "rotation": -0.05, 
		"src": "images/landmarks/royalhospital.png", "visible": true, "opacity": 0.9
	},
	{
		"name": "pepper", "x": 834, "y": 990, "zoomX": 0.06, "zoomY": 0.145, "rotation": -0.05, 
		"src": "images/landmarks/pepper.png", "visible": true, "opacity": 0.9
	},
	{
		"name": "libertyhall", "x": 270, "y": -14, "zoomX": 0.43, "zoomY": 0.43, "rotation": -0.05, 
		"src": "images/landmarks/liberty.png", "visible": true, "opacity": 0.7
	},
	{
		"name": "customshouse", "x": 382, "y": 107, "zoomX": 0.15, "zoomY": 0.30, "rotation": -0.05, 
		"src": "images/landmarks/customshouse.png", "visible": true, "opacity": 0.7
	}
]
},{}],12:[function(require,module,exports){
module.exports=[
	{
		"name": "wsc-032", "x": -776, "y": 32.55, "zoomX": 0.29, "zoomY": 0.28, "rotation": -1.47, 
		"src": "images/wsc/wsc-maps-032-m.png", "visibile": true, "opacity": 0.7, 
		"description": "Constitution Hill - Turnpike, Glasnevin Road; showing proposed road to Botanic Gardens"
	},
	{
		"name": "wsc-072", "x": -252, "y": -247, "zoomX": 0.318, "zoomY": 0.314, "rotation": 1.585, 
		"src": "images/wsc/wsc-maps-072-m.png", "visibile": false, "opacity": 0.7,
		"description": "Plan of improving the streets between Richmond Bridge (Four Courts) and Constitution Hill (King’s Inns) Date: 1837"
	},
	{
		"name": "wsc-075", "x": -217.5, "y": -1414.5, "zoomX": 0.87, "zoomY": 0.772, "rotation": 1.615, 
		"src": "images/wsc/wsc-maps-075-m2.png", "visibile": false, "opacity": 0.7,
		"description": "Survey of a line of road, leading from Linen Hall to Glasnevin Road, showing the Royal Canal Date: 1800"
	},
	{
		"name": "wsc-088-1", "x": -0.9, "y": 2.67, "zoomX": 0.5, "zoomY": 0.5, "rotation": -3.32, 
		"src": "images/wsc/wsc-maps-088-1.jpg", "visibile": false, "opacity": 0.0
	},
	{
		"name": "wsc-106-1", "x": -757, "y": 495.5, "zoomX": 0.265, "zoomY": 0.265, "rotation": -0.074, 
		"src": "images/wsc/wsc-maps-106-1.jpg", "visibile": true, "opacity": 1.0, 
		"description": "Map showing proposed improvements to be made in Cornmarket, Cutpurse Row, Lamb Alley - Francis Street - and an improved entrance from Kevin Street to Saint Patrick’s Cathedral, through Mitre Alley and at James’s Gate. Date: 1845-46 "
	},
	{
		"name": "wsc-138", "x": 215.5, "y": 154, "zoomX": 0.19, "zoomY": 0.172, "rotation": 0, 
		"src": "images/wsc/wsc-maps-138-l.png", "visibile": true, "opacity": 1.0,
		"description": "Map of premises, George’s Quay, City Quay, Townsend Street and neighbourhood, showing property lost to the City, in a suit by 'The Corporation - with Trinity College'"
	},
	{
		"name": "wsc-142", "x": 94.995, "y": 2377.5, "zoomX": 0.482, "zoomY": 0.476, "rotation": -2.015, 
		"src": "images/wsc/wsc-maps-142-l.png", "visibile": true, "opacity": 1.0,
		"description": "Map of the New Streets, and other improvements intended to be immediately executed. Situate on the South Side of the City of Dublin, submitted for the approbation of the Commissioners of Wide Streets, particularly of those parts belonging to Wm. Cope and John Locker, Esq., Harcourt Street, Charlemount Street, Portobello, etc. Date: 1792"
	},
	{
		"name": "wsc-155", "x": -1506, "y": -50.5, "zoomX": 1.01, "zoomY": 0.972, "rotation": -0.025, 
		"src": "images/wsc/wsc-maps-155-m.png", "visibile": false, "opacity": 0.6,
		"description": "New approach from Military Road to King’s Bridge, and along the Quays to Aston’s Quay Date: 1841"
	},
	{
		"name": "wsc-157-3", "x": 3.115, "y": 3.65, "zoomX": 0.525, "zoomY": 0.59, "rotation": 0.54, 
		"src": "images/wsc/wsc-maps-157-3-m.png", "visibile": false, "opacity": 0.0, 
		"description": "showing the improvements proposed by the Commissioners of Wide Streets in Nassau Street, Leinster Street and Clare Street"
	},
	{
		"name": "wsc-164", "x": -472, "y":805, "zoomX": 0.056, "zoomY": 0.056, "rotation": 0.09, 
		"src": "images/wsc/wsc-maps-164-l.png", "visibile": true, "opacity": 1.0, 
		"description": "Plan of Saint Patrick’s, etc. Date: 1824"
	},
	{
		"name": "wsc-184-1", "x": -2.27, "y": 5.95, "zoomX": 0.4, "zoomY": 0.4, "rotation": 0.035, 
		"src": "images/wsc/wsc-maps-184-1-front.jpg", "visibile": false, "opacity": 0.0
	},
	{
		"name": "wsc-433-2", "x": -2.846, "y": 6.125, "zoomX": 0.199, "zoomY": 0.205, "rotation": -0.025, 
		"src": "images/wsc/wsc-maps-433-2.jpg", "visibile": false, "opacity": 0.0
	},
	{
		"name": "wsc-467-02", "x": 1.845, "y": 8.12, "zoomX": 0.83, "zoomY": 0.83, "rotation": -2.725, 
		"src": "images/wsc/wsc-maps-467-02.jpg", "visibile": false, "opacity": 0.0
	},
	{
		"name": "wsc-469-02", "x": 255, "y": 1389.5, "zoomX": 0.245, "zoomY": 0.245, "rotation": -2.75, 
		"src": "images/wsc/wsc-maps-469-2-m.png", "visibile": true, "opacity": 0.8, 
		"description": "Earlsfort Terrace, Stephen’s Green South and Harcourt Street showing plan of proposed new street"
	},
	{
		"name": "wsc-355-1", "x": 696, "y": 713.5, "zoomX": 0.323, "zoomY": 0.289, "rotation": 1.14, 
		"src": "images/wsc/wsc-355-1.png", "visibile": true, "opacity": 0.8, 
		"description": "Plan of Baggot Street and Fitzwilliam Street, showing avenues thereof No. 1 Date: 1790"
	},
	{
		"name": "wsc-729", "x": -1088.5, "y": 652, "zoomX": 0.184, "zoomY": 0.184, "rotation": -3.425, 
		"src": "images/wsc/wsc-maps-729.png", "visibile": true, "opacity": 0.5, 
		"description": "Map - James’s Street, Bason Lane, Echlin’s Lane, Grand Canal Place, City Bason and Grand Canal Harbour"
	},
	{
		"name": "wsc-757", "x": -881, "y": 261.5, "zoomX": 0.355, "zoomY": 0.355, "rotation": -0.025, 
		"src": "images/wsc/wsc-maps-757-l.png", "visibile": true, "opacity": 0.5, 
		"description": "four courts to st patricks, the castle to thomas street"
	},
	{
		"name": "wsc-098", "x": -475, "y": 524, "zoomX": 0.063, "zoomY": 0.063, "rotation": -0.16, 
		"src": "images/wsc/wsc-maps-098.png", "visibile": true, "opacity": 0.7,
		"description": "Map of Christchurch, Skinners Row etc. Thomas Sherrard, 5 January 1821 Date: 1821"
	}
]

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const canvasview_1 = require("./gtwo/canvasview");
const static_1 = require("./gtwo/static");
const layer_1 = require("./gtwo/layer");
const view_1 = require("./gtwo/view");
const grid_1 = require("./gtwo/grid");
const viewcontroller_1 = require("./gtwo/viewcontroller");
const imagecontroller_1 = require("./gtwo/imagecontroller");
const tilelayer_1 = require("./gtwo/tilelayer");
const layermanager_1 = require("./gtwo/layermanager");
const firemaps = require("./imagegroups/firemaps.json");
const landmarks = require("./imagegroups/landmarks.json");
const wsc = require("./imagegroups/wsc.json");
let layerState = new view_1.BasicTransform(0, 0, 1, 1, 0);
let imageLayer = new layer_1.ContainerLayer(layerState);
let imageState = new view_1.BasicTransform(-1440, -1440, 0.222, 0.222, 0);
let helloImage = new static_1.StaticImage(imageState, "images/bluecoat.png", .5);
let countyState = new view_1.BasicTransform(-2631, -2051.5, 1.716, 1.674, 0);
let countyImage = new static_1.StaticImage(countyState, "images/County_of_the_City_of_Dublin_1837_map.jpg", 0.5);
let bgState = new view_1.BasicTransform(-1126, -1086, 1.58, 1.55, 0);
let bgImage = new static_1.StaticImage(bgState, "images/fmss.jpeg", .7);
let gridTransform = new view_1.BasicTransform(0, 0, 1, 1, 0);
let staticGrid = new grid_1.StaticGrid(gridTransform, 0, 512, 512);
let sentinelStruct = new tilelayer_1.TileStruct("qtile/dublin/", ".png", "images/qtile/dublin/");
let sentinelTransform = new view_1.BasicTransform(0, 0, 2, 2, 0);
let sentinelLayer = new tilelayer_1.TileLayer(sentinelTransform, sentinelStruct, 15814, 10621, 15);
//let sentinelLayer = new TileLayer(BasicTransform.unitTransform, sentinelStruct, 31628, 21242, 16);
imageLayer.set("county", countyImage);
imageLayer.set("background", bgImage);
let layerManager = new layermanager_1.LayerManager();
let firemapLayer = layerManager.addLayer(firemaps, "firemaps");
let landmarksLayer = layerManager.addLayer(landmarks, "landmarks");
let wscLayer = layerManager.addLayer(wsc, "wsc");
let edit = wscLayer.get("wsc-469-02");
imageLayer.set("firemaps", firemapLayer);
imageLayer.set("wsc", wscLayer);
imageLayer.set("landmarks", landmarksLayer);
function showMap(divName, name) {
    const canvas = document.getElementById(divName);
    let canvasTransform = new view_1.BasicTransform(-512, -512, 0.5, 0.5, 0);
    let canvasView = new canvasview_1.CanvasView(canvasTransform, canvas.clientWidth, canvas.clientHeight, canvas);
    canvasView.layers.push(sentinelLayer);
    canvasView.layers.push(imageLayer);
    canvasView.layers.push(staticGrid);
    let tileController = new imagecontroller_1.DisplayElementController(canvasView, sentinelLayer, "v");
    let countyController = new imagecontroller_1.DisplayElementController(canvasView, countyImage, "V");
    let firemapController = new imagecontroller_1.DisplayElementController(canvasView, firemapLayer, "b");
    let wscController = new imagecontroller_1.DisplayElementController(canvasView, wscLayer, "n");
    let landmarkController = new imagecontroller_1.DisplayElementController(canvasView, landmarksLayer, "m");
    let controller = new viewcontroller_1.ViewController(canvasView, canvas, canvasView);
    let imageController = new imagecontroller_1.ImageController(canvasView, edit);
    drawMap(canvasView);
}
function drawMap(canvasView) {
    if (!canvasView.draw()) {
        console.log("In timeout");
        setTimeout(function () { drawMap(canvasView); }, 500);
    }
}
function show() {
    showMap("canvas", "TypeScript");
}
if (document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)) {
    show();
}
else {
    document.addEventListener("DOMContentLoaded", show);
}

},{"./gtwo/canvasview":1,"./gtwo/grid":2,"./gtwo/imagecontroller":3,"./gtwo/layer":4,"./gtwo/layermanager":5,"./gtwo/static":6,"./gtwo/tilelayer":7,"./gtwo/view":8,"./gtwo/viewcontroller":9,"./imagegroups/firemaps.json":10,"./imagegroups/landmarks.json":11,"./imagegroups/wsc.json":12}]},{},[13])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ3R3by9jYW52YXN2aWV3LnRzIiwic3JjL2d0d28vZ3JpZC50cyIsInNyYy9ndHdvL2ltYWdlY29udHJvbGxlci50cyIsInNyYy9ndHdvL2xheWVyLnRzIiwic3JjL2d0d28vbGF5ZXJtYW5hZ2VyLnRzIiwic3JjL2d0d28vc3RhdGljLnRzIiwic3JjL2d0d28vdGlsZWxheWVyLnRzIiwic3JjL2d0d28vdmlldy50cyIsInNyYy9ndHdvL3ZpZXdjb250cm9sbGVyLnRzIiwic3JjL2ltYWdlZ3JvdXBzL2ZpcmVtYXBzLmpzb24iLCJzcmMvaW1hZ2Vncm91cHMvbGFuZG1hcmtzLmpzb24iLCJzcmMvaW1hZ2Vncm91cHMvd3NjLmpzb24iLCJzcmMvc2ltcGxlV29ybGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0NBLGlDQUU4RTtBQVM5RSxNQUFhLFVBQVcsU0FBUSx5QkFBa0I7SUFLakQsWUFDQyxjQUF5QixFQUN6QixLQUFhLEVBQUUsTUFBYyxFQUNwQixhQUFnQztRQUV6QyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQ3RELGNBQWMsQ0FBQyxLQUFLLEVBQUUsY0FBYyxDQUFDLEtBQUssRUFDMUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBSmpCLGtCQUFhLEdBQWIsYUFBYSxDQUFtQjtRQU4xQyxXQUFNLEdBQXVCLEVBQUUsQ0FBQztRQVkvQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFbEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRCxTQUFTLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxNQUFjO1FBRXZDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxN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QztRQUMvQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUQsSUFBSSxNQUFNLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUVoRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzlDLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDL0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzlELElBQUksT0FBTyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUU7UUFFbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBRTlDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUVoQixLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLElBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFDO1lBQy9CLDRCQUE0QjtZQUM1QixJQUFJLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQzVDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sRUFBRSxJQUFJLEdBQUcsT0FB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QUksR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFekQsUUFBUSxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ2xCLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7Z0JBQzlDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7Z0JBQzlDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7Z0JBQzlDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7Z0JBQzlDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJ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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4RkEsa0RBQStDO0FBQy9DLDBDQUE0QztBQUM1Qyx3Q0FBOEM7QUFDOUMsc0NBQTZDO0FBQzdDLHNDQUF5QztBQUN6QywwREFBdUQ7QUFDdkQsNERBQW1GO0FBQ25GLGdEQUFxRTtBQUNyRSxzREFBbUQ7QUFFbkQsd0RBQXdEO0FBQ3hELDBEQUEwRDtBQUMxRCw4Q0FBOEM7QUFFOUMsSUFBSSxVQUFVLEdBQUcsSUFBSSxxQkFBYyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNuRCxJQUFJLFVBQVUsR0FBRyxJQUFJLHNCQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7QUFFaEQsSUFBSSxVQUFVLEdBQUcsSUFBSSxxQkFBYyxDQUFDLENBQUMsSUFBSSxFQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEUsSUFBSSxVQUFVLEdBQUcsSUFBSSxvQkFBVyxDQUFDLFVBQVUsRUFBRSxxQkFBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUV4RSxJQUFJLFdBQVcsR0FBRyxJQUFJLHFCQUFjLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN0RSxJQUFJLFdBQVcsR0FBRyxJQUFJLG9CQUFXLENBQUMsV0FBVyxFQUFFLGtEQUFrRCxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBRXhHLElBQUksT0FBTyxHQUFHLElBQUkscUJBQWMsQ0FBQyxDQUFDLElBQUksRUFBQyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzdELElBQUksT0FBTyxHQUFHLElBQUksb0JBQVcsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFFL0QsSUFBSSxhQUFhLEdBQUcsSUFBSSxxQkFBYyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN0RCxJQUFJLFVBQVUsR0FBRyxJQUFJLGlCQUFVLENBQUMsYUFBYSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFFNUQsSUFBSSxjQUFjLEdBQUcsSUFBSSxzQkFBVSxDQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztBQUVyRixJQUFJLGlCQUFpQixHQUFHLElBQUkscUJBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSxhQUFhLEdBQUcsSUFBSSxxQkFBUyxDQUFDLGlCQUFpQixFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZGLG9HQUFvRztBQUVwRyxVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUN0QyxVQUFVLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztBQUV0QyxJQUFJLFlBQVksR0FBRyxJQUFJLDJCQUFZLEVBQUUsQ0FBQztBQUV0QyxJQUFJLFlBQVksR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUMvRCxJQUFJLGNBQWMsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUNuRSxJQUFJLFFBQVEsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUVqRCxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBRXRDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3pDLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ2hDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBRTVDLFNBQVMsT0FBTyxDQUFDLE9BQWUsRUFBRSxJQUFZO0lBQzFDLE1BQU0sTUFBTSxHQUFzQixRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ25FLElBQUksZUFBZSxHQUFHLElBQUkscUJBQWMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLElBQUksVUFBVSxHQUFHLElBQUksdUJBQVUsQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRWxHLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3RDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ25DLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRW5DLElBQUksY0FBYyxHQUFHLElBQUksMENBQXdCLENBQUMsVUFBVSxFQUFFLGFBQWEsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNsRixJQUFJLGdCQUFnQixHQUFHLElBQUksMENBQXdCLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNsRixJQUFJLGlCQUFpQixHQUFHLElBQUksMENBQXdCLENBQUMsVUFBVSxFQUFFLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNwRixJQUFJLGFBQWEsR0FBRyxJQUFJLDBDQUF3QixDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDNUUsSUFBSSxrQkFBa0IsR0FBRyxJQUFJLDBDQUF3QixDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFdkYsSUFBSSxVQUFVLEdBQUcsSUFBSSwrQkFBYyxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFFcEUsSUFBSSxlQUFlLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUU1RCxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFFeEIsQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFDLFVBQXNCO0lBQ25DLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUc7UUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixVQUFVLENBQUMsY0FBWSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUEsQ0FBQSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDckQ7QUFDTCxDQUFDO0FBRUQsU0FBUyxJQUFJO0lBQ1osT0FBTyxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBRUQsSUFDSSxRQUFRLENBQUMsVUFBVSxLQUFLLFVBQVU7SUFDbEMsQ0FBQyxRQUFRLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQzNFO0lBQ0QsSUFBSSxFQUFFLENBQUM7Q0FDUDtLQUFNO0lBQ04sUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ3BEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IHsgQ2FudmFzTGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgXG5cdGludmVydFRyYW5zZm9ybSwgXG5cdFZpZXdUcmFuc2Zvcm0sIEJhc2ljVmlld1RyYW5zZm9ybSwgVHJhbnNmb3JtLCBCYXNpY1RyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcblxuZXhwb3J0IGludGVyZmFjZSBEaXNwbGF5RWxlbWVudCBleHRlbmRzIFRyYW5zZm9ybSB7XG5cdGlzVmlzaWJsZSgpOiBib29sZWFuO1xuXHRzZXRWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4pOiB2b2lkO1xuXHRnZXRPcGFjaXR5KCk6IG51bWJlcjtcblx0c2V0T3BhY2l0eShvcGFjaXR5OiBudW1iZXIpOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgQ2FudmFzVmlldyBleHRlbmRzIEJhc2ljVmlld1RyYW5zZm9ybSB7XG5cblx0bGF5ZXJzOiBBcnJheTxDYW52YXNMYXllcj4gPSBbXTtcblx0Y3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0bG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdFx0d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIFxuXHRcdHJlYWRvbmx5IGNhbnZhc0VsZW1lbnQ6IEhUTUxDYW52YXNFbGVtZW50KXtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLngsIGxvY2FsVHJhbnNmb3JtLnksIHdpZHRoLCBoZWlnaHQsIFxuXHRcdFx0bG9jYWxUcmFuc2Zvcm0uem9vbVgsIGxvY2FsVHJhbnNmb3JtLnpvb21ZLCBcblx0XHRcdGxvY2FsVHJhbnNmb3JtLnJvdGF0aW9uKTtcblxuXHRcdHRoaXMuaW5pdENhbnZhcygpO1xuXG5cdFx0dGhpcy5jdHggPSBjYW52YXNFbGVtZW50LmdldENvbnRleHQoXCIyZFwiKTtcblx0fVxuXG5cdHpvb21BYm91dCh4OiBudW1iZXIsIHk6IG51bWJlciwgem9vbUJ5OiBudW1iZXIpe1xuXG4gICAgICAgIHRoaXMuem9vbVggPSB0aGlzLnpvb21YICogem9vbUJ5O1xuICAgICAgICB0aGlzLnpvb21ZID0gdGhpcy56b29tWSAqIHpvb21CeTtcblxuICAgICAgICBsZXQgcmVsYXRpdmVYID0geCAqIHpvb21CeSAtIHg7XG4gICAgICAgIGxldCByZWxhdGl2ZVkgPSB5ICogem9vbUJ5IC0geTtcblxuICAgICAgICBsZXQgd29ybGRYID0gcmVsYXRpdmVYIC8gdGhpcy56b29tWDtcbiAgICAgICAgbGV0IHdvcmxkWSA9IHJlbGF0aXZlWSAvIHRoaXMuem9vbVk7XG5cbiAgICAgICAgdGhpcy54ID0gdGhpcy54ICsgd29ybGRYO1xuICAgICAgICB0aGlzLnkgPSB0aGlzLnkgKyB3b3JsZFk7XG5cblx0fVxuXG5cdGRyYXcoKTogYm9vbGVhbiB7XG5cdFx0bGV0IHRyYW5zZm9ybSA9IGludmVydFRyYW5zZm9ybSh0aGlzKTtcblxuXHRcdHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwiZ3JleVwiO1xuXHRcdHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuXHRcdHZhciBkcmF3aW5nQ29tcGxldGUgPSB0cnVlO1xuXG5cdFx0Zm9yIChsZXQgbGF5ZXIgb2YgdGhpcy5sYXllcnMpe1xuXHRcdFx0aWYgKGxheWVyLmlzVmlzaWJsZSgpKXtcblx0XHRcdFx0ZHJhd2luZ0NvbXBsZXRlID0gZHJhd2luZ0NvbXBsZXRlICYmIGxheWVyLmRyYXcodGhpcy5jdHgsIEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0sIHRoaXMpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fVxuXG5cdFx0dGhpcy5kcmF3Q2VudHJlKHRoaXMuY3R4KTtcblxuXHRcdHJldHVybiBkcmF3aW5nQ29tcGxldGU7XG5cdH1cblxuXHRkcmF3Q2VudHJlKGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCl7XG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIGNvbnRleHQuZ2xvYmFsQWxwaGEgPSAwLjM7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLndpZHRoLzIsIDYvMTYqdGhpcy5oZWlnaHQpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyh0aGlzLndpZHRoLzIsIDEwLzE2KnRoaXMuaGVpZ2h0KTtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8oNy8xNip0aGlzLndpZHRoLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oOS8xNip0aGlzLndpZHRoLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcbiAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XG4gICAgfVxuXG5cdHByaXZhdGUgaW5pdENhbnZhcygpe1xuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLmNhbnZhc0VsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLmNhbnZhc0VsZW1lbnQuY2xpZW50SGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQuaGVpZ2h0ID0gaGVpZ2h0O1xuXHR9XG5cbn0iLCJpbXBvcnQgeyBEcmF3TGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgVHJhbnNmb3JtLCBWaWV3VHJhbnNmb3JtLCBjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuXG4vKipcbiogV2UgZG9uJ3Qgd2FudCB0byBkcmF3IGEgZ3JpZCBpbnRvIGEgdHJhbnNmb3JtZWQgY2FudmFzIGFzIHRoaXMgZ2l2ZXMgdXMgZ3JpZCBsaW5lcyB0aGF0IGFyZSB0b29cbnRoaWNrIG9yIHRvbyB0aGluXG4qL1xuZXhwb3J0IGNsYXNzIFN0YXRpY0dyaWQgZXh0ZW5kcyBEcmF3TGF5ZXIge1xuXG5cdHpvb21XaWR0aDogbnVtYmVyO1xuXHR6b29tSGVpZ2h0OiBudW1iZXI7XG5cblx0Y29uc3RydWN0b3IobG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgem9vbUxldmVsOiBudW1iZXIsIFxuXHRcdHJlYWRvbmx5IGdyaWRXaWR0aDogbnVtYmVyID0gMjU2LCByZWFkb25seSBncmlkSGVpZ2h0OiBudW1iZXIgPSAyNTYpe1xuXG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0sIDEpO1xuXG5cdFx0bGV0IHpvb20gPSBNYXRoLnBvdygyLCB6b29tTGV2ZWwpO1xuXHRcdHRoaXMuem9vbVdpZHRoID0gZ3JpZFdpZHRoIC8gem9vbTtcblx0XHR0aGlzLnpvb21IZWlnaHQgPSBncmlkSGVpZ2h0IC8gem9vbTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBWaWV3VHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0XHRsZXQgb2Zmc2V0WCA9IHZpZXcueCAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IG9mZnNldFkgPSB2aWV3LnkgKiB2aWV3Lnpvb21ZO1xuXG5cdFx0bGV0IHZpZXdXaWR0aCA9IHZpZXcud2lkdGggLyB2aWV3Lnpvb21YO1xuXHRcdGxldCB2aWV3SGVpZ2h0ID0gdmlldy5oZWlnaHQgLyB2aWV3Lnpvb21ZO1xuXG5cdFx0bGV0IGdyaWRBY3Jvc3MgPSB2aWV3V2lkdGggLyB0aGlzLnpvb21XaWR0aDtcblx0XHRsZXQgZ3JpZEhpZ2ggPSB2aWV3SGVpZ2h0IC8gdGhpcy56b29tSGVpZ2h0O1xuXG5cdFx0bGV0IHhNaW4gPSBNYXRoLmZsb29yKHZpZXcueC90aGlzLnpvb21XaWR0aCk7XG5cdFx0bGV0IHhMZWZ0ID0geE1pbiAqIHRoaXMuem9vbVdpZHRoICogdmlldy56b29tWDtcblx0XHRsZXQgeE1heCA9IE1hdGguY2VpbCgodmlldy54ICsgdmlld1dpZHRoKSAvIHRoaXMuem9vbVdpZHRoKTtcblx0XHRsZXQgeFJpZ2h0ID0geE1heCAqIHRoaXMuem9vbVdpZHRoICogdmlldy56b29tWDtcblxuXHRcdGxldCB5TWluID0gTWF0aC5mbG9vcih2aWV3LnkvdGhpcy56b29tSGVpZ2h0KTtcblx0XHRsZXQgeVRvcCA9IHlNaW4gKiB0aGlzLnpvb21IZWlnaHQgKiB2aWV3Lnpvb21YO1xuXHRcdGxldCB5TWF4ID0gTWF0aC5jZWlsKCh2aWV3LnkgKyB2aWV3SGVpZ2h0KSAvIHRoaXMuem9vbUhlaWdodCk7XG5cdFx0bGV0IHlCb3R0b20gPSB5TWF4ICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWCA7XG5cblx0XHRjb25zb2xlLmxvZyhcInhNaW4gXCIgKyB4TWluICsgXCIgeE1heCBcIiArIHhNYXgpO1xuXHRcdGNvbnNvbGUubG9nKFwieU1pbiBcIiArIHlNaW4gKyBcIiB5TWF4IFwiICsgeU1heCk7XG5cblx0XHRjdHguYmVnaW5QYXRoKCk7XG5cblx0XHRmb3IgKHZhciB4ID0geE1pbjsgeDw9eE1heDsgeCsrKXtcblx0XHRcdC8vY29uc29sZS5sb2coXCJhdCBcIiArIG1pblgpO1xuXHRcdFx0bGV0IHhNb3ZlID0geCAqIHRoaXMuem9vbVdpZHRoICogdmlldy56b29tWDtcblx0XHRcdGN0eC5tb3ZlVG8oeE1vdmUgLSBvZmZzZXRYLCB5VG9wIC0gb2Zmc2V0WSk7XG5cdFx0XHRjdHgubGluZVRvKHhNb3ZlIC0gb2Zmc2V0WCwgeUJvdHRvbSAtIG9mZnNldFkpO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIHkgPSB5TWluOyB5PD15TWF4OyB5Kyspe1xuXG5cdFx0XHRsZXQgeU1vdmUgPSB5ICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWTtcblx0XHRcdGN0eC5tb3ZlVG8oeExlZnQgLSBvZmZzZXRYLCB5TW92ZSAtIG9mZnNldFkpO1xuXHRcdFx0Y3R4LmxpbmVUbyh4UmlnaHQgLSBvZmZzZXRYLCB5TW92ZSAtIG9mZnNldFkpO1xuXG5cdFx0XHRmb3IgKHZhciB4ID0geE1pbjsgeDw9eE1heDsgeCsrKXtcblx0XHRcdFx0bGV0IHhNb3ZlID0gKHgtLjUpICogdGhpcy56b29tV2lkdGggKiB2aWV3Lnpvb21YO1xuXHRcdFx0XHR5TW92ZSA9ICh5LS41KSAqIHRoaXMuem9vbUhlaWdodCAqIHZpZXcuem9vbVk7XG5cdFx0XHRcdGxldCB0ZXh0ID0gXCJcIiArICh4LTEpICsgXCIsIFwiICsgKHktMSk7XG5cdFx0XHRcdGN0eC5zdHJva2VUZXh0KHRleHQsIHhNb3ZlIC0gb2Zmc2V0WCwgeU1vdmUgLSBvZmZzZXRZKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdGNvbnNvbGUubG9nKFwiZHJldyBncmlkXCIpO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cbn0iLCJcbmltcG9ydCB7Q2FudmFzVmlldywgRGlzcGxheUVsZW1lbnR9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7Q2FudmFzTGF5ZXJ9IGZyb20gXCIuL2xheWVyXCI7XG5cbmV4cG9ydCBjbGFzcyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3IoY2FudmFzVmlldzogQ2FudmFzVmlldywgcmVhZG9ubHkgZGlzcGxheUVsZW1lbnQ6IERpc3BsYXlFbGVtZW50LCAgcHVibGljIG1vZDogc3RyaW5nID0gXCJ2XCIpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZChjYW52YXNWaWV3LCBlICBhcyBLZXlib2FyZEV2ZW50KSk7XG4gICAgfVxuXG4gICAgcHJlc3NlZChjYW52YXNWaWV3OiBDYW52YXNWaWV3LCBldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwicHJlc3NlZCBsYXllclwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQua2V5KTtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgICAgICAgICAgY2FzZSB0aGlzLm1vZDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInRvZ2dsZSB2aXNpYmxlXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheUVsZW1lbnQuc2V0VmlzaWJsZSghdGhpcy5kaXNwbGF5RWxlbWVudC5pc1Zpc2libGUoKSk7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZUNvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3IoY2FudmFzVmlldzogQ2FudmFzVmlldywgcmVhZG9ubHkgY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyKSB7XG4gICAgXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLnByZXNzZWQoY2FudmFzVmlldywgZSAgYXMgS2V5Ym9hcmRFdmVudCkpO1xuICAgIH1cblxuICAgIHByZXNzZWQodmlld0NhbnZhczogQ2FudmFzVmlldywgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBcdGNvbnNvbGUubG9nKFwicHJlc3NlZFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQua2V5KTtcblxuICAgIFx0c3dpdGNoIChldmVudC5rZXkpIHtcbiAgICBcdFx0Y2FzZSBcImFcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnggPSB0aGlzLmNhbnZhc0xheWVyLnggLSAwLjU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJkXCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54ICsgMC41O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwid1wiOlxuICAgIFx0XHRcdHRoaXMuY2FudmFzTGF5ZXIueSA9IHRoaXMuY2FudmFzTGF5ZXIueSAtIDAuNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInNcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnkgPSB0aGlzLmNhbnZhc0xheWVyLnkgKyAwLjU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJlXCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiA9IHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gLSAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInFcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uID0gdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiArIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwieFwiOlxuICAgIFx0XHRcdHRoaXMuY2FudmFzTGF5ZXIuem9vbVggPSB0aGlzLmNhbnZhc0xheWVyLnpvb21YIC0gMC4wMDI7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJYXCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci56b29tWCA9IHRoaXMuY2FudmFzTGF5ZXIuem9vbVggKyAwLjAwMjtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInpcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnpvb21ZID0gdGhpcy5jYW52YXNMYXllci56b29tWSAtIDAuMDAyO1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiWlwiOlxuICAgIFx0XHRcdHRoaXMuY2FudmFzTGF5ZXIuem9vbVkgPSB0aGlzLmNhbnZhc0xheWVyLnpvb21ZICsgMC4wMDI7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiVFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIub3BhY2l0eSA9IE1hdGgubWluKDEuMCwgdGhpcy5jYW52YXNMYXllci5vcGFjaXR5ICsgMC4xKTtcbiAgICAgICAgICAgICAgICB2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJ0XCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5vcGFjaXR5ID0gTWF0aC5tYXgoMCwgdGhpcy5jYW52YXNMYXllci5vcGFjaXR5IC0gMC4xKTtcbiAgICAgICAgICAgICAgICB2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICBcdFx0ZGVmYXVsdDpcbiAgICBcdFx0XHQvLyBjb2RlLi4uXG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHR9XG4gICAgXHRjb25zb2xlLmxvZyhcImltYWdlIGF0OiBcIiArICB0aGlzLmNhbnZhc0xheWVyLnggKyBcIiwgXCIgKyB0aGlzLmNhbnZhc0xheWVyLnkpO1xuICAgIFx0Y29uc29sZS5sb2coXCJpbWFnZSBybyBzYzogXCIgKyAgdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiArIFwiLCBcIiArIHRoaXMuY2FudmFzTGF5ZXIuem9vbVggKyBcIiwgXCIgKyB0aGlzLmNhbnZhc0xheWVyLnpvb21ZKTtcbiAgICB9O1xuXG59OyIsImltcG9ydCB7IFRyYW5zZm9ybSwgQmFzaWNUcmFuc2Zvcm0sIFZpZXdUcmFuc2Zvcm0sIGNvbWJpbmVUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBEaXNwbGF5RWxlbWVudCB9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENhbnZhc0xheWVyIGV4dGVuZHMgQmFzaWNUcmFuc2Zvcm0gaW1wbGVtZW50cyBEaXNwbGF5RWxlbWVudCB7XG5cblx0Y29uc3RydWN0b3IocHVibGljIGxvY2FsVHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHB1YmxpYyBvcGFjaXR5OiBudW1iZXIsIHB1YmxpYyB2aXNpYmxlKXtcblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybS54LCBsb2NhbFRyYW5zZm9ybS55LCBsb2NhbFRyYW5zZm9ybS56b29tWCwgbG9jYWxUcmFuc2Zvcm0uem9vbVksIGxvY2FsVHJhbnNmb3JtLnJvdGF0aW9uKTtcblx0fVxuXG5cdGFic3RyYWN0IGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHBhcmVudFRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBWaWV3VHJhbnNmb3JtKTogYm9vbGVhbjtcblxuXHRpc1Zpc2libGUoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudmlzaWJsZTtcblx0fVxuXG5cdHNldFZpc2libGUodmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xuXHRcdGNvbnNvbGUubG9nKFwic2V0dGluZyB2aXNpYmlsaXR5OiBcIiArIHZpc2libGUpO1xuXHRcdHRoaXMudmlzaWJsZSA9IHZpc2libGU7XG5cdH1cblxuXHRnZXRPcGFjaXR5KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMub3BhY2l0eTtcblx0fVxuXG5cdHNldE9wYWNpdHkob3BhY2l0eTogbnVtYmVyKTogdm9pZCB7XG5cdFx0dGhpcy5vcGFjaXR5ID0gb3BhY2l0eTtcblx0fVxuXG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBEcmF3TGF5ZXIgZXh0ZW5kcyBDYW52YXNMYXllciB7XG5cbiAgICBwcm90ZWN0ZWQgcHJlcGFyZUN0eChjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFRyYW5zZm9ybSk6IHZvaWQge1xuXHRcdGN0eC50cmFuc2xhdGUoKHRyYW5zZm9ybS54IC0gdmlldy54KSAqIHZpZXcuem9vbVgsICh0cmFuc2Zvcm0ueSAtIHZpZXcueSkgKiB2aWV3Lnpvb21ZKTtcblx0XHRjdHguc2NhbGUodHJhbnNmb3JtLnpvb21YICogdmlldy56b29tWCwgdHJhbnNmb3JtLnpvb21ZICogdmlldy56b29tWSk7XG5cdFx0Y3R4LnJvdGF0ZSh0cmFuc2Zvcm0ucm90YXRpb24pO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBjbGVhbkN0eChjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFRyYW5zZm9ybSk6IHZvaWQge1x0XG5cdFx0Y3R4LnJvdGF0ZSgtdHJhbnNmb3JtLnJvdGF0aW9uKTtcblx0XHRjdHguc2NhbGUoMS90cmFuc2Zvcm0uem9vbVgvdmlldy56b29tWCwgMS90cmFuc2Zvcm0uem9vbVkvdmlldy56b29tWSk7XG5cdFx0Y3R4LnRyYW5zbGF0ZSgtKHRyYW5zZm9ybS54IC12aWV3LngpICp2aWV3Lnpvb21YLCAtKHRyYW5zZm9ybS55IC0gdmlldy55KSAqIHZpZXcuem9vbVkpO1xuICAgIH1cblxufVxuXG5leHBvcnQgY2xhc3MgQ29udGFpbmVyTGF5ZXIgZXh0ZW5kcyBDYW52YXNMYXllciB7XG5cblx0bGF5ZXJNYXA6IE1hcDxzdHJpbmcsIENhbnZhc0xheWVyPjtcblxuXHRjb25zdHJ1Y3Rvcihsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBvcGFjaXR5OiBudW1iZXIgPSAxLCB2aXNpYmxlOiBib29sZWFuID0gdHJ1ZSkge1xuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCBvcGFjaXR5LCB2aXNpYmxlKTtcblx0XHR0aGlzLmxheWVyTWFwID0gbmV3IE1hcDxzdHJpbmcsIENhbnZhc0xheWVyPigpO1xuXHR9XG5cblx0c2V0KG5hbWU6IHN0cmluZywgbGF5ZXI6IENhbnZhc0xheWVyKXtcblx0XHR0aGlzLmxheWVyTWFwLnNldChuYW1lLCBsYXllcik7XG5cdH1cblxuXHRnZXQobmFtZTogc3RyaW5nKTogQ2FudmFzTGF5ZXIge1xuXHRcdHJldHVybiB0aGlzLmxheWVyTWFwLmdldChuYW1lKTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHBhcmVudFRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBWaWV3VHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0XHRsZXQgbGF5ZXJUcmFuc2Zvcm0gPSBjb21iaW5lVHJhbnNmb3JtKHRoaXMubG9jYWxUcmFuc2Zvcm0sIHBhcmVudFRyYW5zZm9ybSk7XG5cblx0XHR2YXIgZHJhd2luZ0NvbXBsZXRlID0gdHJ1ZTtcblxuXHRcdGZvciAobGV0IGxheWVyIG9mIHRoaXMubGF5ZXJNYXApIHtcblx0XHRcdGlmIChsYXllclsxXS5pc1Zpc2libGUoKSl7XG5cdFx0XHRcdGRyYXdpbmdDb21wbGV0ZSA9IGRyYXdpbmdDb21wbGV0ZSAmJiBsYXllclsxXS5kcmF3KGN0eCwgbGF5ZXJUcmFuc2Zvcm0sIHZpZXcpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRyYXdpbmdDb21wbGV0ZTtcblx0fVxuXG59IiwiaW1wb3J0IHsgQ2FudmFzTGF5ZXIsIENvbnRhaW5lckxheWVyIH0gZnJvbSBcIi4vbGF5ZXJcIjtcbmltcG9ydCB7IFN0YXRpY0ltYWdlIH0gZnJvbSBcIi4vc3RhdGljXCI7XG5pbXBvcnQgeyBUcmFuc2Zvcm0gLCBCYXNpY1RyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcblxuZXhwb3J0IGludGVyZmFjZSBJbWFnZVN0cnVjdCBleHRlbmRzIFRyYW5zZm9ybSB7XG5cdFxuXHRvcGFjaXR5OiBudW1iZXI7XG5cdHZpc2libGU6IGJvb2xlYW47XG5cdHNyYzogc3RyaW5nO1xuXHRuYW1lOiBzdHJpbmc7XG5cbn1cblxuZXhwb3J0IGNsYXNzIExheWVyTWFuYWdlciB7XG5cblx0cHJpdmF0ZSBsYXllck1hcDogTWFwPHN0cmluZywgQ29udGFpbmVyTGF5ZXI+OztcblxuXHRyZWFkb25seSBkZWZhdWx0TGF5ZXI6IHN0cmluZyA9IFwiZGVmYXVsdFwiO1xuXG5cdGNvbnN0cnVjdG9yKCl7XG5cdFx0dGhpcy5sYXllck1hcCA9IG5ldyBNYXA8c3RyaW5nLCBDb250YWluZXJMYXllcj4oKTtcblxuXHRcdGxldCBpbWFnZUxheWVyID0gbmV3IENvbnRhaW5lckxheWVyKEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0sIDEsIHRydWUpO1x0XG5cblx0XHR0aGlzLmxheWVyTWFwLnNldCh0aGlzLmRlZmF1bHRMYXllciwgaW1hZ2VMYXllcik7XG5cdH1cblxuXHRhZGRJbWFnZShpbWFnZTogU3RhdGljSW1hZ2UsIG5hbWU6IHN0cmluZyl7XG5cdFx0dGhpcy5sYXllck1hcC5nZXQodGhpcy5kZWZhdWx0TGF5ZXIpLnNldChuYW1lLCBpbWFnZSk7XG5cdH1cblxuXHRhZGRMYXllcihpbWFnZURldGFpbHM6IEFycmF5PEltYWdlU3RydWN0PiwgbGF5ZXJOYW1lOiBzdHJpbmcpOiBDb250YWluZXJMYXllciB7XG5cdFx0bGV0IGltYWdlTGF5ZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXIoQmFzaWNUcmFuc2Zvcm0udW5pdFRyYW5zZm9ybSwgMSwgdHJ1ZSk7XHRcblxuXHRcdGZvciAodmFyIGltYWdlIG9mIGltYWdlRGV0YWlscyl7XG5cdFx0XHRsZXQgc3RhdGljSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoaW1hZ2UsIGltYWdlLnNyYywgaW1hZ2Uub3BhY2l0eSwgaW1hZ2UudmlzaWJsZSk7XG5cdFx0XHRpbWFnZUxheWVyLnNldChpbWFnZS5uYW1lLCBzdGF0aWNJbWFnZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5sYXllck1hcC5zZXQobGF5ZXJOYW1lLCBpbWFnZUxheWVyKTtcblxuXHRcdHJldHVybiBpbWFnZUxheWVyO1xuXHR9XG5cblx0Z2V0TGF5ZXJzKCk6IE1hcDxzdHJpbmcsIENvbnRhaW5lckxheWVyPiB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXA7XG5cdH1cblxufSIsImltcG9ydCB7IFRyYW5zZm9ybSwgY29tYmluZVRyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IERyYXdMYXllciwgQ2FudmFzTGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgRGlzcGxheUVsZW1lbnQgfSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5cbmV4cG9ydCBjbGFzcyBTdGF0aWNJbWFnZSBleHRlbmRzIERyYXdMYXllciBpbXBsZW1lbnRzIERpc3BsYXlFbGVtZW50IHtcblxuXHRwcml2YXRlIGltZzogSFRNTEltYWdlRWxlbWVudDtcblxuXHRjb25zdHJ1Y3Rvcihsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHRpbWFnZVNyYzogc3RyaW5nLCBcblx0XHRvcGFjaXR5OiBudW1iZXIsXG5cdFx0dmlzaWJsZTogYm9vbGVhbiA9IHRydWUpIHtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCBvcGFjaXR5LCB2aXNpYmxlKTtcblx0XHRcblx0XHR0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuXHRcdHRoaXMuaW1nLnNyYyA9IGltYWdlU3JjO1xuXHR9XG5cblx0cHJpdmF0ZSBkcmF3SW1hZ2UoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHBhcmVudFRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBUcmFuc2Zvcm0pe1xuXG5cdFx0bGV0IGN0eFRyYW5zZm9ybSA9IGNvbWJpbmVUcmFuc2Zvcm0odGhpcywgcGFyZW50VHJhbnNmb3JtKTtcblxuXHRcdC8vY29uc29sZS5sb2coXCJjdHggeCBcIiArIGN0eFRyYW5zZm9ybS54KTtcblxuXHRcdHRoaXMucHJlcGFyZUN0eChjdHgsIGN0eFRyYW5zZm9ybSwgdmlldyk7XG5cdFx0XG5cdFx0Y3R4Lmdsb2JhbEFscGhhID0gdGhpcy5vcGFjaXR5O1xuXHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDApO1xuXHRcdGN0eC5nbG9iYWxBbHBoYSA9IDE7XG5cblx0XHR0aGlzLmNsZWFuQ3R4KGN0eCwgY3R4VHJhbnNmb3JtLCB2aWV3KTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHBhcmVudFRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBUcmFuc2Zvcm0pOiBib29sZWFuIHtcblx0XHRpZiAodGhpcy52aXNpYmxlICYmIHRoaXMuaW1nLmNvbXBsZXRlKSB7XG5cdFx0XHR0aGlzLmRyYXdJbWFnZShjdHgsIHBhcmVudFRyYW5zZm9ybSwgdmlldyk7XG5cdFx0Ly9cdGNvbnNvbGUubG9nKFwiZHJldyBpbWFnZSBcIiArIHRoaXMuaW1nLnNyYyk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59XG4iLCJpbXBvcnQgeyBEcmF3TGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgVHJhbnNmb3JtLCBCYXNpY1RyYW5zZm9ybSwgVmlld1RyYW5zZm9ybSwgY29tYmluZVRyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcblxuZXhwb3J0IGNsYXNzIFRpbGVTdHJ1Y3Qge1xuXHRcblx0Y29uc3RydWN0b3IoXG5cdFx0cHVibGljIHByZWZpeDogc3RyaW5nLFxuXHRcdHB1YmxpYyBzdWZmaXg6IHN0cmluZyxcblx0XHRwdWJsaWMgdGlsZURpcmVjdG9yeTogc3RyaW5nKXt9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB6b29tQnlMZXZlbCh6b29tTGV2ZWw6IG51bWJlcil7XG5cdHJldHVybiBNYXRoLnBvdygyLCB6b29tTGV2ZWwpO1xufVxuXG5leHBvcnQgY2xhc3MgVGlsZUxheWVyIGV4dGVuZHMgRHJhd0xheWVyIHtcblxuXHR0aWxlTWFuYWdlcjogVGlsZU1hbmFnZXI7XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0bG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdFx0cmVhZG9ubHkgdGlsZVN0cnVjdDogVGlsZVN0cnVjdCxcblx0XHRwdWJsaWMgeE9mZnNldDogbnVtYmVyID0gMCxcblx0XHRwdWJsaWMgeU9mZnNldDogbnVtYmVyID0gMCxcblx0XHRwdWJsaWMgem9vbTogbnVtYmVyID0gMSxcblx0XHRyZWFkb25seSBncmlkV2lkdGg6IG51bWJlciA9IDI1NiwgXG5cdFx0cmVhZG9ubHkgZ3JpZEhlaWdodDogbnVtYmVyID0gMjU2LFxuXHRcdG9wYWNpdHk6IG51bWJlciA9IDEsXG5cdFx0dmlzYmlsZTogYm9vbGVhbiA9IHRydWUpe1xuXG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0sIG9wYWNpdHksIHZpc2JpbGUpO1xuXG5cdFx0dGhpcy50aWxlTWFuYWdlciA9IG5ldyBUaWxlTWFuYWdlcigpO1xuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFZpZXdUcmFuc2Zvcm0pOiBib29sZWFuIHtcblxuXHRcdGxldCBjdHhUcmFuc2Zvcm0gPSBjb21iaW5lVHJhbnNmb3JtKHRoaXMsIHBhcmVudFRyYW5zZm9ybSk7XG5cblx0XHRsZXQgem9vbVdpZHRoOiBudW1iZXIgPSB0aGlzLmdyaWRXaWR0aCAqIGN0eFRyYW5zZm9ybS56b29tWFxuXHRcdGxldCB6b29tSGVpZ2h0OiBudW1iZXIgPSB0aGlzLmdyaWRIZWlnaHQgKiBjdHhUcmFuc2Zvcm0uem9vbVk7XG5cblx0XHQvL2NvbnNvbGUubG9nKFwiY3R4IHpvb21XaWR0aDogXCIgKyB6b29tV2lkdGgpO1xuXG5cdFx0bGV0IHZpZXdYID0gdmlldy54ICogdmlldy56b29tWDtcblx0XHRsZXQgdmlld1kgPSB2aWV3LnkgKiB2aWV3Lnpvb21ZO1xuXG5cdFx0bGV0IHZpZXdXaWR0aCA9IHZpZXcud2lkdGggLyB2aWV3Lnpvb21YO1xuXHRcdGxldCB2aWV3SGVpZ2h0ID0gdmlldy5oZWlnaHQgLyB2aWV3Lnpvb21ZO1xuXG5cdFx0bGV0IGdyaWRBY3Jvc3MgPSB2aWV3V2lkdGggLyB6b29tV2lkdGg7IC8vZ29vZFxuXHRcdGxldCBncmlkSGlnaCA9IHZpZXdIZWlnaHQgLyB6b29tSGVpZ2h0OyAvL2dvb2RcblxuXHRcdGxldCB4TWluID0gTWF0aC5mbG9vcih2aWV3Lngvem9vbVdpZHRoKTtcblx0XHRsZXQgeE1heCA9IE1hdGguY2VpbCgodmlldy54ICsgdmlld1dpZHRoKSAvIHpvb21XaWR0aCk7XG5cblx0XHRsZXQgeU1pbiA9IE1hdGguZmxvb3Iodmlldy55L3pvb21IZWlnaHQpO1xuXHRcdGxldCB5TWF4ID0gTWF0aC5jZWlsKCh2aWV3LnkgKyB2aWV3SGVpZ2h0KSAvIHpvb21IZWlnaHQpO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhcInggeSBzIFwiICsgeE1pbiArIFwiLCBcIiArIHhNYXggKyBcIjogXCIgKyB5TWluICsgXCIsIFwiICsgeU1heCk7XG5cdFx0Ly9jb25zb2xlLmxvZyhcImFjcm9zcyBoaWdoXCIgKyBncmlkQWNyb3NzICsgXCIsIFwiICsgZ3JpZEhpZ2gpO1xuXG5cdFx0dmFyIGRyYXdpbmdDb21wbGV0ZSA9IHRydWU7XG5cblx0XHRsZXQgZnVsbFpvb21YID0gY3R4VHJhbnNmb3JtLnpvb21YICogdmlldy56b29tWDtcblx0XHRsZXQgZnVsbFpvb21ZID0gY3R4VHJhbnNmb3JtLnpvb21ZICogdmlldy56b29tWTtcblxuXHRcdC8vY29uc29sZS5sb2coXCJmdWxsem9vbXMgXCIgKyBmdWxsWm9vbVggKyBcIiBcIiArIGZ1bGxab29tWSk7XG5cblx0XHRjdHguc2NhbGUoZnVsbFpvb21YLCBmdWxsWm9vbVkpO1xuXG5cdFx0Zm9yICh2YXIgeCA9IHhNaW47IHg8eE1heDsgeCsrKXtcblx0XHRcdGxldCB4TW92ZSA9IHggKiB0aGlzLmdyaWRXaWR0aCAtIHZpZXcueCAvIGN0eFRyYW5zZm9ybS56b29tWDtcblx0XHRcdGZvciAodmFyIHkgPSB5TWluOyB5PHlNYXg7IHkrKyl7XG5cdFx0XHRcdGxldCB5TW92ZSA9IHkgKiB0aGlzLmdyaWRIZWlnaHQgLSB2aWV3LnkvIGN0eFRyYW5zZm9ybS56b29tWTtcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcInRpbGUgeCB5IFwiICsgeCArIFwiIFwiICsgeSArIFwiOiBcIiArIHhNb3ZlICsgXCIsIFwiICsgeU1vdmUpO1xuXG5cdFx0XHRcdGN0eC50cmFuc2xhdGUoeE1vdmUsIHlNb3ZlKTtcblx0XHRcdFx0bGV0IHRpbGVTcmMgPSB0aGlzLnRpbGVTdHJ1Y3QudGlsZURpcmVjdG9yeSArIHRoaXMuem9vbSArIFwiL1wiICsgXG5cdFx0XHRcdFx0KHggKyB0aGlzLnhPZmZzZXQpICsgXCIvXCIgKyBcblx0XHRcdFx0XHQoeSArIHRoaXMueU9mZnNldCkgKyB0aGlzLnRpbGVTdHJ1Y3Quc3VmZml4O1xuXG5cdFx0XHRcdGlmICh0aGlzLnRpbGVNYW5hZ2VyLmhhcyh0aWxlU3JjKSkge1xuXHRcdFx0XHRcdGxldCBpbWFnZVRpbGUgPSB0aGlzLnRpbGVNYW5hZ2VyLmdldCh0aWxlU3JjKTtcblx0XHRcdFx0XHRkcmF3aW5nQ29tcGxldGUgPSBkcmF3aW5nQ29tcGxldGUgJiYgaW1hZ2VUaWxlLmRyYXcoY3R4KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRsZXQgaW1hZ2VUaWxlID0gbmV3IEltYWdlVGlsZSh4LCB5LCB0aWxlU3JjKTtcblxuXHRcdFx0XHRcdGRyYXdpbmdDb21wbGV0ZSA9IGRyYXdpbmdDb21wbGV0ZSAmJiBpbWFnZVRpbGUuZHJhdyhjdHgpO1xuXG5cdFx0XHRcdFx0dGhpcy50aWxlTWFuYWdlci5zZXQodGlsZVNyYywgaW1hZ2VUaWxlKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGN0eC50cmFuc2xhdGUoLXhNb3ZlLCAteU1vdmUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGN0eC5zY2FsZSgxIC8gZnVsbFpvb21YLCAxIC8gZnVsbFpvb21ZKTtcblxuXHRcdC8vY29uc29sZS5sb2coXCJkcmV3IHRpbGVzIFwiICsgZHJhd2luZ0NvbXBsZXRlKTtcblx0XHRyZXR1cm4gZHJhd2luZ0NvbXBsZXRlO1xuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlTWFuYWdlciB7XG5cblx0dGlsZU1hcDogTWFwPHN0cmluZywgSW1hZ2VUaWxlPjtcblxuXHRjb25zdHJ1Y3Rvcigpe1xuXHRcdHRoaXMudGlsZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBJbWFnZVRpbGU+KCk7XG5cdH1cblxuXHRnZXQodGlsZUtleTogc3RyaW5nKTogSW1hZ2VUaWxlIHtcblx0XHRyZXR1cm4gdGhpcy50aWxlTWFwLmdldCh0aWxlS2V5KTtcblx0fVxuXG5cdGhhcyh0aWxlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy50aWxlTWFwLmhhcyh0aWxlS2V5KTtcblx0fVxuXG5cdHNldCh0aWxlS2V5OiBzdHJpbmcsIHRpbGU6IEltYWdlVGlsZSl7XG5cdFx0dGhpcy50aWxlTWFwLnNldCh0aWxlS2V5LCB0aWxlKTtcblx0fVxuXG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZVRpbGUge1xuXG5cdHByaXZhdGUgaW1nOiBIVE1MSW1hZ2VFbGVtZW50O1xuXHRwcml2YXRlIGV4aXN0czogYm9vbGVhbjtcblxuXHRjb25zdHJ1Y3RvcihyZWFkb25seSB4SW5kZXg6IG51bWJlciwgcmVhZG9ubHkgeUluZGV4OiBudW1iZXIsIGltYWdlU3JjOiBzdHJpbmcpIHtcblx0XHR0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuXHRcdHRoaXMuaW1nLnNyYyA9IGltYWdlU3JjO1xuXHRcdHRoaXMuaW1nLm9uZXJyb3IgPSBmdW5jdGlvbihldmVudE9yTWVzc2FnZTogYW55KXtcblx0XHRcdGV2ZW50T3JNZXNzYWdlLnRhcmdldC5zcmMgPSBcIlwiO1xuXHRcdH07XG5cdH07XG5cblx0cHJpdmF0ZSBkcmF3SW1hZ2UoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpe1xuXHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDApO1xuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCk6IGJvb2xlYW4ge1xuXHRcdGlmICh0aGlzLmltZy5zcmMgIT0gXCJcIiAmJiB0aGlzLmltZy5jb21wbGV0ZSApIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xuXG59XG4iLCIvKipcbiogQSB3b3JsZCBpcyAwLDAgYmFzZWQgYnV0IGFueSBlbGVtZW50IGNhbiBiZSBwb3NpdGlvbmVkIHJlbGF0aXZlIHRvIHRoaXMuXG4qL1xuZXhwb3J0IGludGVyZmFjZSBUcmFuc2Zvcm0ge1xuXHR4OiBudW1iZXI7XG5cdHk6IG51bWJlcjtcblx0em9vbVg6IG51bWJlcjtcblx0em9vbVk6IG51bWJlcjtcblx0cm90YXRpb246IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIEJhc2ljVHJhbnNmb3JtIGltcGxlbWVudHMgVHJhbnNmb3JtIHtcblxuICAgIHN0YXRpYyByZWFkb25seSB1bml0VHJhbnNmb3JtID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDEsIDEsIDApO1xuXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB4OiBudW1iZXIsIHB1YmxpYyB5OiBudW1iZXIsIFxuXHRcdHB1YmxpYyB6b29tWDogbnVtYmVyLCBwdWJsaWMgem9vbVk6IG51bWJlciwgXG5cdFx0cHVibGljIHJvdGF0aW9uOiBudW1iZXIpe31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbWJpbmVUcmFuc2Zvcm0oY2hpbGQ6IFRyYW5zZm9ybSwgY29udGFpbmVyOiBUcmFuc2Zvcm0pOiBUcmFuc2Zvcm0ge1xuXHRsZXQgem9vbVggPSBjaGlsZC56b29tWCAqIGNvbnRhaW5lci56b29tWDtcblx0Ly9jb25zb2xlLmxvZyhcIm1vZGlmaWVkIFwiICsgY2hpbGQuem9vbVggKyBcIiB0byBcIiArIHpvb21YKTtcblx0bGV0IHpvb21ZID0gY2hpbGQuem9vbVkgKiBjb250YWluZXIuem9vbVk7XG5cdC8vY29uc29sZS5sb2coXCJtb2RpZmllZCBcIiArIGNoaWxkLnpvb21ZICsgXCIgYnkgXCIgKyBjb250YWluZXIuem9vbVkgKyBcIiB0byBcIiArIHpvb21ZKTtcblx0bGV0IHggPSAoY2hpbGQueCAqIGNvbnRhaW5lci56b29tWCkgKyBjb250YWluZXIueDtcblx0bGV0IHkgPSAoY2hpbGQueSAqIGNvbnRhaW5lci56b29tWSkgKyBjb250YWluZXIueTtcblx0Ly9jb25zb2xlLmxvZyhcIm1vZGlmaWVkIHggXCIgKyBjaGlsZC54ICsgXCIgYnkgXCIgKyBjb250YWluZXIuem9vbVggKyBcIiBhbmQgXCIgKyBjb250YWluZXIueCArIFwiIHRvIFwiICsgeCk7XG5cdGxldCByb3RhdGlvbiA9IGNoaWxkLnJvdGF0aW9uICsgY29udGFpbmVyLnJvdGF0aW9uO1xuXHRyZXR1cm4gbmV3IEJhc2ljVHJhbnNmb3JtKHgsIHksIHpvb21YLCB6b29tWSwgcm90YXRpb24pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUodHJhbnNmb3JtOiBUcmFuc2Zvcm0pOiBUcmFuc2Zvcm0ge1xuXHRyZXR1cm4gbmV3IEJhc2ljVHJhbnNmb3JtKHRyYW5zZm9ybS54LCB0cmFuc2Zvcm0ueSwgXG5cdFx0dHJhbnNmb3JtLnpvb21YLCB0cmFuc2Zvcm0uem9vbVksIHRyYW5zZm9ybS5yb3RhdGlvbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnRUcmFuc2Zvcm0od29ybGRTdGF0ZTogVHJhbnNmb3JtKTogVHJhbnNmb3JtIHtcblx0cmV0dXJuIG5ldyBCYXNpY1RyYW5zZm9ybSgtd29ybGRTdGF0ZS54LCAtd29ybGRTdGF0ZS55LCBcblx0XHQxL3dvcmxkU3RhdGUuem9vbVgsIDEvd29ybGRTdGF0ZS56b29tWSwgLXdvcmxkU3RhdGUucm90YXRpb24pO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFZpZXdUcmFuc2Zvcm0gZXh0ZW5kcyBUcmFuc2Zvcm0ge1xuXHR3aWR0aDogbnVtYmVyO1xuXHRoZWlnaHQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIEJhc2ljVmlld1RyYW5zZm9ybSBleHRlbmRzIEJhc2ljVHJhbnNmb3JtIGltcGxlbWVudHMgVmlld1RyYW5zZm9ybSB7XG5cblx0Y29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIFxuXHRcdHJlYWRvbmx5IHdpZHRoOiBudW1iZXIsIHJlYWRvbmx5IGhlaWdodDogbnVtYmVyLFxuXHRcdHpvb21YOiBudW1iZXIsIHpvb21ZOiBudW1iZXIsIFxuXHQgICAgcm90YXRpb246IG51bWJlcil7XG5cblx0XHRzdXBlcih4LCB5LCB6b29tWCwgem9vbVksIHJvdGF0aW9uKTtcblx0fVxuXG59XG5cblxuXG4iLCJpbXBvcnQgeyBWaWV3VHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgQ2FudmFzVmlldyB9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcblxuXG5hYnN0cmFjdCBjbGFzcyBNb3VzZUNvbnRyb2xsZXIge1xuXG4gICAgbW91c2VQb3NpdGlvbihldmVudDogTW91c2VFdmVudCwgd2l0aGluOiBIVE1MRWxlbWVudCk6IEFycmF5PG51bWJlcj4ge1xuICAgICAgICBsZXQgbV9wb3N4ID0gZXZlbnQuY2xpZW50WCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0O1xuICAgICAgICBsZXQgbV9wb3N5ID0gZXZlbnQuY2xpZW50WSArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wXG4gICAgICAgICAgICAgICAgICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcblxuICAgICAgICB2YXIgZV9wb3N4ID0gMDtcbiAgICAgICAgdmFyIGVfcG9zeSA9IDA7XG5cbiAgICAgICAgaWYgKHdpdGhpbi5vZmZzZXRQYXJlbnQpe1xuICAgICAgICAgICAgZG8geyBcbiAgICAgICAgICAgICAgICBlX3Bvc3ggKz0gd2l0aGluLm9mZnNldExlZnQ7XG4gICAgICAgICAgICAgICAgZV9wb3N5ICs9IHdpdGhpbi5vZmZzZXRUb3A7XG4gICAgICAgICAgICB9IHdoaWxlICh3aXRoaW4gPSA8SFRNTEVsZW1lbnQ+d2l0aGluLm9mZnNldFBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW21fcG9zeCAtIGVfcG9zeCwgbV9wb3N5IC0gZV9wb3N5XTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIFZpZXdDb250cm9sbGVyIGV4dGVuZHMgTW91c2VDb250cm9sbGVyIHtcblxuXHRyZWNvcmQ6IGJvb2xlYW47XG5cdG1vdmU6IG51bWJlciA9IDE7XG5cblx0cHJpdmF0ZSB4UHJldmlvdXM6IG51bWJlcjtcblx0cHJpdmF0ZSB5UHJldmlvdXM6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3Rvcih2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtLCBcbiAgICAgICAgcmVhZG9ubHkgZHJhZ0VsZW1lbnQ6IEhUTUxFbGVtZW50LCByZWFkb25seSBjYW52YXNWaWV3OiBDYW52YXNWaWV3KSB7XG5cbiAgICBcdHN1cGVyKCk7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybSkpO1xuICAgIFx0ZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm0pKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybSkpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLnJlY29yZCA9IGZhbHNlKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5jbGlja2VkKGUgYXMgTW91c2VFdmVudCwgY2FudmFzVmlldywgMS4yKSk7XG4gICAgICAgIGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCAoZTogRXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy53aGVlbChlIGFzIFdoZWVsRXZlbnQsIGNhbnZhc1ZpZXcpKTtcbiAgICB9XG5cbiAgICBjbGlja2VkKGV2ZW50OiBNb3VzZUV2ZW50LCB2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtLCB6b29tQnk6IG51bWJlcil7XG4gICAgXHRzd2l0Y2goZXZlbnQudHlwZSl7XG4gICAgXHRcdGNhc2UgXCJkYmxjbGlja1wiOlxuICAgICAgICAgICAgICAgIGlmICAoZXZlbnQuY3RybEtleSkge1xuICAgICAgICAgICAgICAgICAgICB6b29tQnkgPSAxIC8gem9vbUJ5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsZXQgbVhZID0gdGhpcy5tb3VzZVBvc2l0aW9uKGV2ZW50LCB0aGlzLmRyYWdFbGVtZW50KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy56b29tQWJvdXQobVhZWzBdLCBtWFlbMV0sIHpvb21CeSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYWdnZWQoZXZlbnQ6IE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm06IFZpZXdUcmFuc2Zvcm0pIHtcblxuICAgIFx0c3dpdGNoKGV2ZW50LnR5cGUpe1xuICAgIFx0XHRjYXNlIFwibW91c2Vkb3duXCI6XG4gICAgXHRcdFx0dGhpcy5yZWNvcmQgPSB0cnVlO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwibW91c2V1cFwiOlxuICAgIFx0XHRcdHRoaXMucmVjb3JkID0gZmFsc2U7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGRlZmF1bHQ6XG4gICAgXHRcdFx0aWYgKHRoaXMucmVjb3JkKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHhEZWx0YSA9IChldmVudC5jbGllbnRYIC0gdGhpcy54UHJldmlvdXMpIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHlEZWx0YSA9IChldmVudC5jbGllbnRZIC0gdGhpcy55UHJldmlvdXMpIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWTtcblxuICAgICAgICAgICAgICAgICAgICB2aWV3VHJhbnNmb3JtLnggPSB2aWV3VHJhbnNmb3JtLnggLSB4RGVsdGE7XG4gICAgICAgICAgICAgICAgICAgIHZpZXdUcmFuc2Zvcm0ueSA9IHZpZXdUcmFuc2Zvcm0ueSAtIHlEZWx0YTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgIFx0XHRcdH1cblxuXHRcdFx0dGhpcy54UHJldmlvdXMgPSBldmVudC5jbGllbnRYO1xuXHRcdFx0dGhpcy55UHJldmlvdXMgPSBldmVudC5jbGllbnRZO1xuICAgIFx0fVxuICAgIH1cblxuICAgIHdoZWVsKGV2ZW50OiBXaGVlbEV2ZW50LCB2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtKSB7XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIndoZWVsXCIgKyBldmVudC50YXJnZXQgKyBcIiwgXCIgKyBldmVudC50eXBlKTtcblxuICAgICAgICBsZXQgeERlbHRhID0gZXZlbnQuZGVsdGFYIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWDtcbiAgICAgICAgbGV0IHlEZWx0YSA9IGV2ZW50LmRlbHRhWSAvIHRoaXMubW92ZSAvIHZpZXdUcmFuc2Zvcm0uem9vbVk7XG5cbiAgICAgICAgaWYgIChldmVudC5jdHJsS2V5KSB7XG4gICAgICAgICAgICBsZXQgbVhZID0gdGhpcy5tb3VzZVBvc2l0aW9uKGV2ZW50LCB0aGlzLmRyYWdFbGVtZW50KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBieSA9IDEuMDU7XG4gICAgICAgICAgICBpZiAoeURlbHRhIDwgMCl7XG4gICAgICAgICAgICAgICAgYnkgPSAwLjk1O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuem9vbUFib3V0KG1YWVswXSwgbVhZWzFdLCBieSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcueCA9ICB0aGlzLmNhbnZhc1ZpZXcueCArIHhEZWx0YTtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy55ID0gIHRoaXMuY2FudmFzVmlldy55ICsgeURlbHRhO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgIH1cblxufVxuIiwibW9kdWxlLmV4cG9ydHM9W1xuXHR7XG5cdFwibmFtZVwiOiBcIjItMlwiLCBcInhcIjogLTM2NCwgXCJ5XCI6IC0xMi41LCBcInpvb21YXCI6IDAuMjEzLCBcInpvb21ZXCI6IDAuMjA1LCBcInJvdGF0aW9uXCI6IC0wLjMxLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDJyXzJbU1ZDMl0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiM1wiLCBcInhcIjogLTIxNiwgXCJ5XCI6IC0wLjcwNSwgXCJ6b29tWFwiOiAwLjIsIFwiem9vbVlcIjogMC4yMSwgXCJyb3RhdGlvblwiOiAtMC41MSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDAzcltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI0XCIsIFwieFwiOiAtNzQuMjksIFwieVwiOiAtOTkuNzgsIFwiem9vbVhcIjogMC4yMjIsIFwiem9vbVlcIjogMC4yMDgsIFwicm90YXRpb25cIjogLTAuMjg1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDRyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjVcIiwgXCJ4XCI6IC0zNzUuNTU1LCBcInlcIjogMTgwLjUxOSwgXCJ6b29tWFwiOiAwLjIxNSwgXCJ6b29tWVwiOiAwLjIwNywgXCJyb3RhdGlvblwiOiAtMC4yMSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA1cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI2XCIsIFwieFwiOiAtMjE2LjE2LCBcInlcIjogMTQ2LCBcInpvb21YXCI6IDAuMjE4LCBcInpvb21ZXCI6IDAuMjE4LCBcInJvdGF0aW9uXCI6IC0wLjIyNSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA2cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI3XCIsIFwieFwiOiAtNjMuMywgXCJ5XCI6IDEwMC4zNzc2LCBcInpvb21YXCI6IDAuMjEyNSwgXCJ6b29tWVwiOiAwLjIxNywgXCJyb3RhdGlvblwiOiAtMC4yMywgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA3cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI4XCIsIFwieFwiOiA3OC4xLCBcInlcIjogNTguNTM1LCBcInpvb21YXCI6IDAuMjA3LCBcInpvb21ZXCI6IDAuMjE3LCBcInJvdGF0aW9uXCI6IC0wLjI1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDhyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjlcIiwgXCJ4XCI6IDIxOS41LCBcInlcIjogMjQsIFwiem9vbVhcIjogMC4yMTUsIFwiem9vbVlcIjogMC4yMTQ1LCBcInJvdGF0aW9uXCI6IC0wLjI2LFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwOXJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTBcIiwgXCJ4XCI6IDQ1NC4yMSwgXCJ5XCI6IC0xLjUsIFwiem9vbVhcIjogMC4yMTgsIFwiem9vbVlcIjogMC4yMTQsIFwicm90YXRpb25cIjogMC4wMTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxMHJfMltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxMVwiLCBcInhcIjogNjIxLjg2LCBcInlcIjogMjUuNTI1LCBcInpvb21YXCI6IDAuMjEzLCBcInpvb21ZXCI6IDAuMjExNSwgXCJyb3RhdGlvblwiOiAwLjExLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTFyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LCBcblx0e1xuXHRcIm5hbWVcIjogXCIxMi0xXCIsIFwieFwiOiA3NjkuNjQ1LCBcInlcIjogNTAuMjY1LCBcInpvb21YXCI6IDAuNDI0LCBcInpvb21ZXCI6IDAuNDIyLCBcInJvdGF0aW9uXCI6IDAuMTIsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxMnJfMVtTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxNFwiLCBcInhcIjogLTkxNS42LCBcInlcIjogNTU3Ljg2NSwgXCJ6b29tWFwiOiAwLjIwOCwgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAtMS4yMTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxNFJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTUtMlwiLCBcInhcIjogLTcxNy4zLCBcInlcIjogNTcyLCBcInpvb21YXCI6IDAuMjEsIFwiem9vbVlcIjogMC4yMDYsIFwicm90YXRpb25cIjogLTEuNDcsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxNXJfMltTVkMyXS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxNi0yXCIsIFwieFwiOiAtOTIsIFwieVwiOiAzMzYsIFwiem9vbVhcIjogMC4yMTUsIFwiem9vbVlcIjogMC4yMDQsIFwicm90YXRpb25cIjogLTAuMDk1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTZyXzJbU1ZDMl0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTdcIiwgXCJ4XCI6IDc4LCBcInlcIjogMjc5LCBcInpvb21YXCI6IDAuMiwgXCJ6b29tWVwiOiAwLjIsIFwicm90YXRpb25cIjogLTAuMDM1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTdSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE4XCIsIFwieFwiOiAyMjMuNSwgXCJ5XCI6IDI0NC41LCBcInpvb21YXCI6IDAuMjE0LCBcInpvb21ZXCI6IDAuMiwgXCJyb3RhdGlvblwiOiAwLjA3NSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDE4UltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxOVwiLCBcInhcIjogNjQuNSwgXCJ5XCI6IDQ3MS41LCBcInpvb21YXCI6IDAuMjA5LCBcInpvb21ZXCI6IDAuMjE0LCBcInJvdGF0aW9uXCI6IDAuMTYsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxOVJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMjBcIiwgXCJ4XCI6IDM4LjUsIFwieVwiOiA2NDIsIFwiem9vbVhcIjogMC4xMDIsIFwiem9vbVlcIjogMC4xMDIsIFwicm90YXRpb25cIjogMC4xOTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAyMFJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH1cblxuXVxuXG5cblxuIiwibW9kdWxlLmV4cG9ydHM9W1xuXHR7XG5cdFx0XCJuYW1lXCI6IFwiaGVucmlldHRhXCIsIFwieFwiOiAtNDg2LjUsIFwieVwiOiAtMjUyLjUsIFwiem9vbVhcIjogMC4yOSwgXCJ6b29tWVwiOiAwLjUsIFwicm90YXRpb25cIjogMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2hlbnJpZXR0YS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtYXRlclwiLCBcInhcIjogLTM0MiwgXCJ5XCI6IC03NDcsIFwiem9vbVhcIjogMC4wOCwgXCJ6b29tWVwiOiAwLjE4LCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbWF0ZXJtaXMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwicGV0ZXJzXCIsIFwieFwiOiAtNzE5LCBcInlcIjogLTgzNiwgXCJ6b29tWFwiOiAwLjA3LCBcInpvb21ZXCI6IDAuMTQsIFwicm90YXRpb25cIjogLTAuMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9wZXRlcnMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwib2Nvbm5lbGxcIiwgXCJ4XCI6IC04MjEsIFwieVwiOiAtMTgzNSwgXCJ6b29tWFwiOiAwLjI1LCBcInpvb21ZXCI6IDAuMjUsIFwicm90YXRpb25cIjogMCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL29jb25uZWxsLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiZm91cmNvdXJ0c1wiLCBcInhcIjogLTYwNiwgXCJ5XCI6IDMwMiwgXCJ6b29tWFwiOiAwLjIzLCBcInpvb21ZXCI6IDAuNDMsIFwicm90YXRpb25cIjogLTAuMDg1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvZm91cmNvdXJ0cy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtaWNoYW5zXCIsIFwieFwiOiAtNjM5LCBcInlcIjogMTYwLCBcInpvb21YXCI6IDAuMTQsIFwiem9vbVlcIjogMC4yNCwgXCJyb3RhdGlvblwiOiAwLjAyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbWljaGFucy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjhcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInRoZWNhc3RsZVwiLCBcInhcIjogLTI5MCwgXCJ5XCI6IDUyMCwgXCJ6b29tWFwiOiAwLjIyLCBcInpvb21ZXCI6IDAuNDIsIFwicm90YXRpb25cIjogLTAuMDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvdGhlY2FzdGxlLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm1hcmtldFwiLCBcInhcIjogLTYxNywgXCJ5XCI6IDU2NSwgXCJ6b29tWFwiOiAwLjE1LCBcInpvb21ZXCI6IDAuMjYsIFwicm90YXRpb25cIjogMC4wNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21hcmtldC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjVcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInBhdHJpY2tzXCIsIFwieFwiOiAtNDYyLCBcInlcIjogNzk1LCBcInpvb21YXCI6IDAuMSwgXCJ6b29tWVwiOiAwLjEyLCBcInJvdGF0aW9uXCI6IDAuMDQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9wYXRyaWNrcy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjhcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm5naXJlbGFuZFwiLCBcInhcIjogNDA2LCBcInlcIjogNjg0LCBcInpvb21YXCI6IDAuMTksIFwiem9vbVlcIjogMC40MiwgXCJyb3RhdGlvblwiOiAtMC4xMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9uZ2lyZWxhbmQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJibHVlY29hdHNcIiwgXCJ4XCI6IC05OTcsIFwieVwiOiA4NiwgXCJ6b29tWFwiOiAwLjEsIFwiem9vbVlcIjogMC4yLCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvYmx1ZWNvYXRzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiY29sbGluc2JhcnJhY2tzXCIsIFwieFwiOiAtMTEzMCwgXCJ5XCI6IDkwLCBcInpvb21YXCI6IDAuMTMsIFwiem9vbVlcIjogMC4zNywgXCJyb3RhdGlvblwiOiAwLjAxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2NvbGxpbnNiYXJyYWNrcy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjhcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImh1Z2hsYW5lXCIsIFwieFwiOiAtMTcyLCBcInlcIjogLTMzNSwgXCJ6b29tWFwiOiAwLjIsIFwiem9vbVlcIjogMC4zMywgXCJyb3RhdGlvblwiOiAtMC4wNiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2h1Z2hsYW5lLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiZ3BvXCIsIFwieFwiOiA1MiwgXCJ5XCI6IDUwLCBcInpvb21YXCI6IDAuMDg2LCBcInpvb21ZXCI6IDAuMjUsIFwicm90YXRpb25cIjogLTAuMDM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvZ3BvLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibW91bnRqb3lcIiwgXCJ4XCI6IDI2MywgXCJ5XCI6IC01NjAsIFwiem9vbVhcIjogMC4xNSwgXCJ6b29tWVwiOiAwLjI4NSwgXCJyb3RhdGlvblwiOiAwLjE3LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbW91bnRqb3kucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJyb3lhbGhvc3BpdGFsXCIsIFwieFwiOiAtMTg1MSwgXCJ5XCI6IDQ4Ny41LCBcInpvb21YXCI6IDAuMjEsIFwiem9vbVlcIjogMC4zLCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3Mvcm95YWxob3NwaXRhbC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInBlcHBlclwiLCBcInhcIjogODM0LCBcInlcIjogOTkwLCBcInpvb21YXCI6IDAuMDYsIFwiem9vbVlcIjogMC4xNDUsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9wZXBwZXIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC45XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJsaWJlcnR5aGFsbFwiLCBcInhcIjogMjcwLCBcInlcIjogLTE0LCBcInpvb21YXCI6IDAuNDMsIFwiem9vbVlcIjogMC40MywgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2xpYmVydHkucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJjdXN0b21zaG91c2VcIiwgXCJ4XCI6IDM4MiwgXCJ5XCI6IDEwNywgXCJ6b29tWFwiOiAwLjE1LCBcInpvb21ZXCI6IDAuMzAsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9jdXN0b21zaG91c2UucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH1cbl0iLCJtb2R1bGUuZXhwb3J0cz1bXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDMyXCIsIFwieFwiOiAtNzc2LCBcInlcIjogMzIuNTUsIFwiem9vbVhcIjogMC4yOSwgXCJ6b29tWVwiOiAwLjI4LCBcInJvdGF0aW9uXCI6IC0xLjQ3LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMDMyLW0ucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNywgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNvbnN0aXR1dGlvbiBIaWxsIC0gVHVybnBpa2UsIEdsYXNuZXZpbiBSb2FkOyBzaG93aW5nIHByb3Bvc2VkIHJvYWQgdG8gQm90YW5pYyBHYXJkZW5zXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNzJcIiwgXCJ4XCI6IC0yNTIsIFwieVwiOiAtMjQ3LCBcInpvb21YXCI6IDAuMzE4LCBcInpvb21ZXCI6IDAuMzE0LCBcInJvdGF0aW9uXCI6IDEuNTg1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMDcyLW0ucG5nXCIsIFwidmlzaWJpbGVcIjogZmFsc2UsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gb2YgaW1wcm92aW5nIHRoZSBzdHJlZXRzIGJldHdlZW4gUmljaG1vbmQgQnJpZGdlIChGb3VyIENvdXJ0cykgYW5kIENvbnN0aXR1dGlvbiBIaWxsIChLaW5n4oCZcyBJbm5zKSBEYXRlOiAxODM3XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNzVcIiwgXCJ4XCI6IC0yMTcuNSwgXCJ5XCI6IC0xNDE0LjUsIFwiem9vbVhcIjogMC44NywgXCJ6b29tWVwiOiAwLjc3MiwgXCJyb3RhdGlvblwiOiAxLjYxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTA3NS1tMi5wbmdcIiwgXCJ2aXNpYmlsZVwiOiBmYWxzZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIGEgbGluZSBvZiByb2FkLCBsZWFkaW5nIGZyb20gTGluZW4gSGFsbCB0byBHbGFzbmV2aW4gUm9hZCwgc2hvd2luZyB0aGUgUm95YWwgQ2FuYWwgRGF0ZTogMTgwMFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDg4LTFcIiwgXCJ4XCI6IC0wLjksIFwieVwiOiAyLjY3LCBcInpvb21YXCI6IDAuNSwgXCJ6b29tWVwiOiAwLjUsIFwicm90YXRpb25cIjogLTMuMzIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0wODgtMS5qcGdcIiwgXCJ2aXNpYmlsZVwiOiBmYWxzZSwgXCJvcGFjaXR5XCI6IDAuMFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTEwNi0xXCIsIFwieFwiOiAtNzU3LCBcInlcIjogNDk1LjUsIFwiem9vbVhcIjogMC4yNjUsIFwiem9vbVlcIjogMC4yNjUsIFwicm90YXRpb25cIjogLTAuMDc0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTA2LTEuanBnXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDEuMCwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBzaG93aW5nIHByb3Bvc2VkIGltcHJvdmVtZW50cyB0byBiZSBtYWRlIGluIENvcm5tYXJrZXQsIEN1dHB1cnNlIFJvdywgTGFtYiBBbGxleSAtIEZyYW5jaXMgU3RyZWV0IC0gYW5kIGFuIGltcHJvdmVkIGVudHJhbmNlIGZyb20gS2V2aW4gU3RyZWV0IHRvIFNhaW50IFBhdHJpY2vigJlzIENhdGhlZHJhbCwgdGhyb3VnaCBNaXRyZSBBbGxleSBhbmQgYXQgSmFtZXPigJlzIEdhdGUuIERhdGU6IDE4NDUtNDYgXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMzhcIiwgXCJ4XCI6IDIxNS41LCBcInlcIjogMTU0LCBcInpvb21YXCI6IDAuMTksIFwiem9vbVlcIjogMC4xNzIsIFwicm90YXRpb25cIjogMCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTEzOC1sLnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxLjAsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwcmVtaXNlcywgR2Vvcmdl4oCZcyBRdWF5LCBDaXR5IFF1YXksIFRvd25zZW5kIFN0cmVldCBhbmQgbmVpZ2hib3VyaG9vZCwgc2hvd2luZyBwcm9wZXJ0eSBsb3N0IHRvIHRoZSBDaXR5LCBpbiBhIHN1aXQgYnkgJ1RoZSBDb3Jwb3JhdGlvbiAtIHdpdGggVHJpbml0eSBDb2xsZWdlJ1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTQyXCIsIFwieFwiOiA5NC45OTUsIFwieVwiOiAyMzc3LjUsIFwiem9vbVhcIjogMC40ODIsIFwiem9vbVlcIjogMC40NzYsIFwicm90YXRpb25cIjogLTIuMDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTQyLWwucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDEuMCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBOZXcgU3RyZWV0cywgYW5kIG90aGVyIGltcHJvdmVtZW50cyBpbnRlbmRlZCB0byBiZSBpbW1lZGlhdGVseSBleGVjdXRlZC4gU2l0dWF0ZSBvbiB0aGUgU291dGggU2lkZSBvZiB0aGUgQ2l0eSBvZiBEdWJsaW4sIHN1Ym1pdHRlZCBmb3IgdGhlIGFwcHJvYmF0aW9uIG9mIHRoZSBDb21taXNzaW9uZXJzIG9mIFdpZGUgU3RyZWV0cywgcGFydGljdWxhcmx5IG9mIHRob3NlIHBhcnRzIGJlbG9uZ2luZyB0byBXbS4gQ29wZSBhbmQgSm9obiBMb2NrZXIsIEVzcS4sIEhhcmNvdXJ0IFN0cmVldCwgQ2hhcmxlbW91bnQgU3RyZWV0LCBQb3J0b2JlbGxvLCBldGMuIERhdGU6IDE3OTJcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE1NVwiLCBcInhcIjogLTE1MDYsIFwieVwiOiAtNTAuNSwgXCJ6b29tWFwiOiAxLjAxLCBcInpvb21ZXCI6IDAuOTcyLCBcInJvdGF0aW9uXCI6IC0wLjAyNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE1NS1tLnBuZ1wiLCBcInZpc2liaWxlXCI6IGZhbHNlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJOZXcgYXBwcm9hY2ggZnJvbSBNaWxpdGFyeSBSb2FkIHRvIEtpbmfigJlzIEJyaWRnZSwgYW5kIGFsb25nIHRoZSBRdWF5cyB0byBBc3RvbuKAmXMgUXVheSBEYXRlOiAxODQxXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNTctM1wiLCBcInhcIjogMy4xMTUsIFwieVwiOiAzLjY1LCBcInpvb21YXCI6IDAuNTI1LCBcInpvb21ZXCI6IDAuNTksIFwicm90YXRpb25cIjogMC41NCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE1Ny0zLW0ucG5nXCIsIFwidmlzaWJpbGVcIjogZmFsc2UsIFwib3BhY2l0eVwiOiAwLjAsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJzaG93aW5nIHRoZSBpbXByb3ZlbWVudHMgcHJvcG9zZWQgYnkgdGhlIENvbW1pc3Npb25lcnMgb2YgV2lkZSBTdHJlZXRzIGluIE5hc3NhdSBTdHJlZXQsIExlaW5zdGVyIFN0cmVldCBhbmQgQ2xhcmUgU3RyZWV0XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNjRcIiwgXCJ4XCI6IC00NzIsIFwieVwiOjgwNSwgXCJ6b29tWFwiOiAwLjA1NiwgXCJ6b29tWVwiOiAwLjA1NiwgXCJyb3RhdGlvblwiOiAwLjA5LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTY0LWwucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDEuMCwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gb2YgU2FpbnQgUGF0cmlja+KAmXMsIGV0Yy4gRGF0ZTogMTgyNFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTg0LTFcIiwgXCJ4XCI6IC0yLjI3LCBcInlcIjogNS45NSwgXCJ6b29tWFwiOiAwLjQsIFwiem9vbVlcIjogMC40LCBcInJvdGF0aW9uXCI6IDAuMDM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTg0LTEtZnJvbnQuanBnXCIsIFwidmlzaWJpbGVcIjogZmFsc2UsIFwib3BhY2l0eVwiOiAwLjBcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MzMtMlwiLCBcInhcIjogLTIuODQ2LCBcInlcIjogNi4xMjUsIFwiem9vbVhcIjogMC4xOTksIFwiem9vbVlcIjogMC4yMDUsIFwicm90YXRpb25cIjogLTAuMDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNDMzLTIuanBnXCIsIFwidmlzaWJpbGVcIjogZmFsc2UsIFwib3BhY2l0eVwiOiAwLjBcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00NjctMDJcIiwgXCJ4XCI6IDEuODQ1LCBcInlcIjogOC4xMiwgXCJ6b29tWFwiOiAwLjgzLCBcInpvb21ZXCI6IDAuODMsIFwicm90YXRpb25cIjogLTIuNzI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNDY3LTAyLmpwZ1wiLCBcInZpc2liaWxlXCI6IGZhbHNlLCBcIm9wYWNpdHlcIjogMC4wXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDY5LTAyXCIsIFwieFwiOiAyNTUsIFwieVwiOiAxMzg5LjUsIFwiem9vbVhcIjogMC4yNDUsIFwiem9vbVlcIjogMC4yNDUsIFwicm90YXRpb25cIjogLTIuNzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy00NjktMi1tLnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJFYXJsc2ZvcnQgVGVycmFjZSwgU3RlcGhlbuKAmXMgR3JlZW4gU291dGggYW5kIEhhcmNvdXJ0IFN0cmVldCBzaG93aW5nIHBsYW4gb2YgcHJvcG9zZWQgbmV3IHN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzU1LTFcIiwgXCJ4XCI6IDY5NiwgXCJ5XCI6IDcxMy41LCBcInpvb21YXCI6IDAuMzIzLCBcInpvb21ZXCI6IDAuMjg5LCBcInJvdGF0aW9uXCI6IDEuMTQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzU1LTEucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gb2YgQmFnZ290IFN0cmVldCBhbmQgRml0endpbGxpYW0gU3RyZWV0LCBzaG93aW5nIGF2ZW51ZXMgdGhlcmVvZiBOby4gMSBEYXRlOiAxNzkwXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy03MjlcIiwgXCJ4XCI6IC0xMDg4LjUsIFwieVwiOiA2NTIsIFwiem9vbVhcIjogMC4xODQsIFwiem9vbVlcIjogMC4xODQsIFwicm90YXRpb25cIjogLTMuNDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNzI5LnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBKYW1lc+KAmXMgU3RyZWV0LCBCYXNvbiBMYW5lLCBFY2hsaW7igJlzIExhbmUsIEdyYW5kIENhbmFsIFBsYWNlLCBDaXR5IEJhc29uIGFuZCBHcmFuZCBDYW5hbCBIYXJib3VyXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy03NTdcIiwgXCJ4XCI6IC04ODEsIFwieVwiOiAyNjEuNSwgXCJ6b29tWFwiOiAwLjM1NSwgXCJ6b29tWVwiOiAwLjM1NSwgXCJyb3RhdGlvblwiOiAtMC4wMjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy03NTctbC5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiZm91ciBjb3VydHMgdG8gc3QgcGF0cmlja3MsIHRoZSBjYXN0bGUgdG8gdGhvbWFzIHN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDk4XCIsIFwieFwiOiAtNDc1LCBcInlcIjogNTI0LCBcInpvb21YXCI6IDAuMDYzLCBcInpvb21ZXCI6IDAuMDYzLCBcInJvdGF0aW9uXCI6IC0wLjE2LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMDk4LnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBDaHJpc3RjaHVyY2gsIFNraW5uZXJzIFJvdyBldGMuIFRob21hcyBTaGVycmFyZCwgNSBKYW51YXJ5IDE4MjEgRGF0ZTogMTgyMVwiXG5cdH1cbl1cbiIsImltcG9ydCB7IENhbnZhc1ZpZXcgfSBmcm9tIFwiLi9ndHdvL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IFN0YXRpY0ltYWdlIH0gZnJvbSBcIi4vZ3R3by9zdGF0aWNcIjtcbmltcG9ydCB7IENvbnRhaW5lckxheWVyIH0gZnJvbSBcIi4vZ3R3by9sYXllclwiO1xuaW1wb3J0IHsgQmFzaWNUcmFuc2Zvcm0gfSBmcm9tIFwiLi9ndHdvL3ZpZXdcIjtcbmltcG9ydCB7IFN0YXRpY0dyaWQgfSBmcm9tIFwiLi9ndHdvL2dyaWRcIjtcbmltcG9ydCB7IFZpZXdDb250cm9sbGVyIH0gZnJvbSBcIi4vZ3R3by92aWV3Y29udHJvbGxlclwiO1xuaW1wb3J0IHsgSW1hZ2VDb250cm9sbGVyLCBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIgfSBmcm9tIFwiLi9ndHdvL2ltYWdlY29udHJvbGxlclwiO1xuaW1wb3J0IHsgVGlsZUxheWVyLCBUaWxlU3RydWN0LCB6b29tQnlMZXZlbH0gZnJvbSBcIi4vZ3R3by90aWxlbGF5ZXJcIjtcbmltcG9ydCB7IExheWVyTWFuYWdlciB9IGZyb20gXCIuL2d0d28vbGF5ZXJtYW5hZ2VyXCI7XG5cbmltcG9ydCAqIGFzIGZpcmVtYXBzIGZyb20gXCIuL2ltYWdlZ3JvdXBzL2ZpcmVtYXBzLmpzb25cIjtcbmltcG9ydCAqIGFzIGxhbmRtYXJrcyBmcm9tIFwiLi9pbWFnZWdyb3Vwcy9sYW5kbWFya3MuanNvblwiO1xuaW1wb3J0ICogYXMgd3NjIGZyb20gXCIuL2ltYWdlZ3JvdXBzL3dzYy5qc29uXCI7XG5cbmxldCBsYXllclN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDEsIDEsIDApO1xubGV0IGltYWdlTGF5ZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXIobGF5ZXJTdGF0ZSk7XG5cbmxldCBpbWFnZVN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0xNDQwLC0xNDQwLCAwLjIyMiwgMC4yMjIsIDApO1xubGV0IGhlbGxvSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoaW1hZ2VTdGF0ZSwgXCJpbWFnZXMvYmx1ZWNvYXQucG5nXCIsIC41KTtcblxubGV0IGNvdW50eVN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0yNjMxLCAtMjA1MS41LCAxLjcxNiwgMS42NzQsIDApO1xubGV0IGNvdW50eUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKGNvdW50eVN0YXRlLCBcImltYWdlcy9Db3VudHlfb2ZfdGhlX0NpdHlfb2ZfRHVibGluXzE4MzdfbWFwLmpwZ1wiLCAwLjUpO1xuXG5sZXQgYmdTdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtMTEyNiwtMTA4NiwgMS41OCwgMS41NSwgMCk7XG5sZXQgYmdJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZShiZ1N0YXRlLCBcImltYWdlcy9mbXNzLmpwZWdcIiwgLjcpO1xuXG5sZXQgZ3JpZFRyYW5zZm9ybSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgwLCAwLCAxLCAxLCAwKTtcbmxldCBzdGF0aWNHcmlkID0gbmV3IFN0YXRpY0dyaWQoZ3JpZFRyYW5zZm9ybSwgMCwgNTEyLCA1MTIpO1xuXG5sZXQgc2VudGluZWxTdHJ1Y3QgPSBuZXcgVGlsZVN0cnVjdChcInF0aWxlL2R1Ymxpbi9cIiwgXCIucG5nXCIsIFwiaW1hZ2VzL3F0aWxlL2R1Ymxpbi9cIik7XG5cbmxldCBzZW50aW5lbFRyYW5zZm9ybSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgwLCAwLCAyLCAyLCAwKTtcbmxldCBzZW50aW5lbExheWVyID0gbmV3IFRpbGVMYXllcihzZW50aW5lbFRyYW5zZm9ybSwgc2VudGluZWxTdHJ1Y3QsIDE1ODE0LCAxMDYyMSwgMTUpO1xuLy9sZXQgc2VudGluZWxMYXllciA9IG5ldyBUaWxlTGF5ZXIoQmFzaWNUcmFuc2Zvcm0udW5pdFRyYW5zZm9ybSwgc2VudGluZWxTdHJ1Y3QsIDMxNjI4LCAyMTI0MiwgMTYpO1xuXG5pbWFnZUxheWVyLnNldChcImNvdW50eVwiLCBjb3VudHlJbWFnZSk7XG5pbWFnZUxheWVyLnNldChcImJhY2tncm91bmRcIiwgYmdJbWFnZSk7XG5cbmxldCBsYXllck1hbmFnZXIgPSBuZXcgTGF5ZXJNYW5hZ2VyKCk7XG5cbmxldCBmaXJlbWFwTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkTGF5ZXIoZmlyZW1hcHMsIFwiZmlyZW1hcHNcIik7XG5sZXQgbGFuZG1hcmtzTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkTGF5ZXIobGFuZG1hcmtzLCBcImxhbmRtYXJrc1wiKTtcbmxldCB3c2NMYXllciA9IGxheWVyTWFuYWdlci5hZGRMYXllcih3c2MsIFwid3NjXCIpO1xuXG5sZXQgZWRpdCA9IHdzY0xheWVyLmdldChcIndzYy00NjktMDJcIik7XG5cbmltYWdlTGF5ZXIuc2V0KFwiZmlyZW1hcHNcIiwgZmlyZW1hcExheWVyKTtcbmltYWdlTGF5ZXIuc2V0KFwid3NjXCIsIHdzY0xheWVyKTtcbmltYWdlTGF5ZXIuc2V0KFwibGFuZG1hcmtzXCIsIGxhbmRtYXJrc0xheWVyKTtcblxuZnVuY3Rpb24gc2hvd01hcChkaXZOYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGNhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChkaXZOYW1lKTtcbiAgICBsZXQgY2FudmFzVHJhbnNmb3JtID0gbmV3IEJhc2ljVHJhbnNmb3JtKC01MTIsIC01MTIsIDAuNSwgMC41LCAwKTtcbiAgICBsZXQgY2FudmFzVmlldyA9IG5ldyBDYW52YXNWaWV3KGNhbnZhc1RyYW5zZm9ybSwgY2FudmFzLmNsaWVudFdpZHRoLCBjYW52YXMuY2xpZW50SGVpZ2h0LCBjYW52YXMpO1xuXG4gICAgY2FudmFzVmlldy5sYXllcnMucHVzaChzZW50aW5lbExheWVyKTtcbiAgICBjYW52YXNWaWV3LmxheWVycy5wdXNoKGltYWdlTGF5ZXIpO1xuICAgIGNhbnZhc1ZpZXcubGF5ZXJzLnB1c2goc3RhdGljR3JpZCk7XG5cbiAgICBsZXQgdGlsZUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHNlbnRpbmVsTGF5ZXIsIFwidlwiKTtcbiAgICBsZXQgY291bnR5Q29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgY291bnR5SW1hZ2UsIFwiVlwiKTtcbiAgICBsZXQgZmlyZW1hcENvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGZpcmVtYXBMYXllciwgXCJiXCIpO1xuICAgIGxldCB3c2NDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCB3c2NMYXllciwgXCJuXCIpO1xuICAgIGxldCBsYW5kbWFya0NvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGxhbmRtYXJrc0xheWVyLCBcIm1cIik7XG5cbiAgICBsZXQgY29udHJvbGxlciA9IG5ldyBWaWV3Q29udHJvbGxlcihjYW52YXNWaWV3LCBjYW52YXMsIGNhbnZhc1ZpZXcpO1xuXG4gICAgbGV0IGltYWdlQ29udHJvbGxlciA9IG5ldyBJbWFnZUNvbnRyb2xsZXIoY2FudmFzVmlldywgZWRpdCk7XG5cbiAgICBkcmF3TWFwKGNhbnZhc1ZpZXcpO1xuXG59XG5cbmZ1bmN0aW9uIGRyYXdNYXAoY2FudmFzVmlldzogQ2FudmFzVmlldyl7XG4gICAgaWYgKCFjYW52YXNWaWV3LmRyYXcoKSApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJJbiB0aW1lb3V0XCIpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGRyYXdNYXAoY2FudmFzVmlldyl9LCA1MDApO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc2hvdygpe1xuXHRzaG93TWFwKFwiY2FudmFzXCIsIFwiVHlwZVNjcmlwdFwiKTtcbn1cblxuaWYgKFxuICAgIGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIiB8fFxuICAgIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSBcImxvYWRpbmdcIiAmJiAhZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmRvU2Nyb2xsKVxuKSB7XG5cdHNob3coKTtcbn0gZWxzZSB7XG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIHNob3cpO1xufSJdfQ==
