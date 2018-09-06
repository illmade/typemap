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
        let multiplier = 1;
        switch (event.key) {
            case "a":
                this.canvasLayer.x = this.canvasLayer.x - 0.5 * multiplier;
                viewCanvas.draw();
                break;
            case "A":
                this.canvasLayer.x = this.canvasLayer.x - 5 * multiplier;
                viewCanvas.draw();
                break;
            case "d":
                this.canvasLayer.x = this.canvasLayer.x + 0.5 * multiplier;
                viewCanvas.draw();
                break;
            case "D":
                this.canvasLayer.x = this.canvasLayer.x + 5 * multiplier;
                viewCanvas.draw();
                break;
            case "w":
                this.canvasLayer.y = this.canvasLayer.y - 0.5 * multiplier;
                viewCanvas.draw();
                break;
            case "W":
                this.canvasLayer.y = this.canvasLayer.y - 5 * multiplier;
                viewCanvas.draw();
                break;
            case "s":
                this.canvasLayer.y = this.canvasLayer.y + 0.5 * multiplier;
                viewCanvas.draw();
                break;
            case "S":
                this.canvasLayer.y = this.canvasLayer.y + 5 * multiplier;
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
                this.canvasLayer.zoomX = this.canvasLayer.zoomX - 0.002 * multiplier;
                viewCanvas.draw();
                break;
            case "X":
                this.canvasLayer.zoomX = this.canvasLayer.zoomX + 0.002 * multiplier;
                viewCanvas.draw();
                break;
            case "z":
                this.canvasLayer.zoomY = this.canvasLayer.zoomY - 0.002 * multiplier;
                viewCanvas.draw();
                break;
            case "Z":
                this.canvasLayer.zoomY = this.canvasLayer.zoomY + 0.002 * multiplier;
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
exports.MouseController = MouseController;
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
	"name": "16-2", "x": -92, "y": 332.5, "zoomX": 0.217, "zoomY": 0.214, "rotation": -0.1, 
	"src": "images/firemap/maps_145_b_4_(2)_f016r_2[SVC2].png", "visible": true, "opacity": 0.7
	},
	{
	"name": "17", "x": 87.5, "y": 275, "zoomX": 0.2, "zoomY": 0.208, "rotation": -0.02, 
	"src": "images/firemap/maps_145_b_4_(2)_f017R[SVC2].jpg", "visible": true, "opacity": 0.7
	},
	{
	"name": "18", "x": 232, "y": 243, "zoomX": 0.208, "zoomY": 0.208, "rotation": 0.07, 
	"src": "images/firemap/maps_145_b_4_(2)_f018R[SVC2].jpg", "visible": true, "opacity": 0.7
	},
	{
	"name": "19", "x": 71.5, "y": 474, "zoomX": 0.203, "zoomY": 0.208, "rotation": 0.17, 
	"src": "images/firemap/maps_145_b_4_(2)_f019R[SVC2].jpg", "visible": true, "opacity": 0.7
	},
	{
	"name": "20", "x": 43.5, "y": 640, "zoomX": 0.1, "zoomY": 0.104, "rotation": 0.205, 
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
		"name": "mountjoyb", "x": 152, "y": -570, "zoomX": 0.2, "zoomY": 0.305, "rotation": 0.04, 
		"src": "images/landmarks/mountjoyb.png", "visible": true, "opacity": 0.7
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
		"name": "wsc-138", "x": 212.5, "y": 147, "zoomX": 0.19, "zoomY": 0.176, "rotation": 0, 
		"src": "images/wsc/wsc-maps-138-l.png", "visibile": true, "opacity": 0.4,
		"description": "Map of premises, George’s Quay, City Quay, Townsend Street and neighbourhood, showing property lost to the City, in a suit by 'The Corporation - with Trinity College'"
	},
	{
		"name": "wsc-189", "x": -792.5, "y": 262.5, "zoomX": 0.26, "zoomY": 0.258, "rotation": 0.003, 
		"src": "images/wsc/wsc-189.png", "visibile": true, "opacity": 0.7,
		"description": "Copy of map of proposed New Street from Essex Street to Cornmarket, with the environs and streets branching off"
	},
	{
		"name": "wsc-098", "x": -475, "y": 524, "zoomX": 0.063, "zoomY": 0.063, "rotation": -0.16, 
		"src": "images/wsc/wsc-maps-098.png", "visibile": true, "opacity": 0.7,
		"description": "Map of Christchurch, Skinners Row etc. Thomas Sherrard, 5 January 1821 Date: 1821"
	},
	{
		"name": "wsc-112", "x": -298, "y": 339.5, "zoomX": 0.185, "zoomY": 0.185, "rotation": -0.255, 
		"src": "images/wsc/wsc-112.png", "visibile": true, "opacity": 0.4,
		"description": "Dame Street, from the corner of Palace Street to the corner of George’s Street - laid out in lots for building North and South and vicinity Date: 1782"
	},
	{
		"name": "wsc-202", "x": 16, "y": 81, "zoomX": 0.289, "zoomY": 0.263, "rotation": -0.105, 
		"src": "images/wsc/wsc-202-c.png", "visibile": true, "opacity": 0.4,
		"description": "area immediately north of River Liffey from Sackville St, Lower Abbey St, Beresford Place, as far as end of North Wall. Also south of Liffey from Westmorland Street to end of John Rogerson's Quay"
	},
	{
		"name": "wsc-179", "x": -537.5, "y": 730, "zoomX": 0.168, "zoomY": 0.164, "rotation": 0.02, 
		"src": "images/wsc/wsc-179.png", "visibile": true, "opacity": 1.0,
		"description": "Saint Patrick’s Cathedral, North Close and vicinity"
	},
	{
		"name": "wsc-329", "x": -678, "y": 345.5, "zoomX": 0.336, "zoomY": 0.336, "rotation": -0.215, 
		"src": "images/wsc/wsc-329.png", "visibile": true, "opacity": 0.5,
		"description": "Plan for opening and widening a principal Avenue to the Castle, now (1900) Parliament Street - showing Dame Street, Castle Street, and all the Avenues thereof Date: 1757"
	},
	{
		"name": "wsc-187", "x": -226, "y": 494.5, "zoomX": 0.066, "zoomY": 0.064, "rotation": 0.0, 
		"src": "images/wsc/wsc-187.png", "visibile": true, "opacity": 1.0,
		"description": "A survey of several holdings in South Great George's Street - total purchase £11528.16.3 Date:1801"
	},
	{
		"name": "wsc-124", "x": -279, "y": 366, "zoomX": 0.057, "zoomY": 0.051, "rotation": -0.16, 
		"src": "images/wsc/wsc-124.jpeg", "visibile": true, "opacity": 0.4,
		"description": "Map of premises in Essex Street and Parliament Street, showing Essex Bridge and Old Custom House. T. and D.H. Sherrard Date: 1813"
	},
	{
		"name": "wsc-360", "x": -144, "y": 421.5, "zoomX": 0.121, "zoomY": 0.107, "rotation": -0.05, 
		"src": "images/wsc/wsc-360.png", "visibile": true, "opacity": 0.5,
		"description": "Map - Dame Street and avenues thereof - Eustace Street, Cecilia Street, and site of Old Theatre, Fownes Street, Crown Alley and Cope Street Date: 1792"
	},
	{
		"name": "wsc-362", "x": 38, "y": 87.5, "zoomX": 0.233, "zoomY": 0.233, "rotation": 0.12, 
		"src": "images/wsc/wsc-362-1.png", "visibile": true, "opacity": 0.4,
		"description": "Maps - College Green, College Street, Westmoreland Street and avenues thereof, showing the site of Parliament House and Trinity College No. 1 Date: 1793"
	},
	{
		"name": "wsc-380", "x": 241.5, "y": 286, "zoomX": 0.033, "zoomY": 0.033, "rotation": 0.05, 
		"src": "images/wsc/wsc-380-1.png", "visibile": true, "opacity": 0.4,
		"description": "Map - Fleet Market, Poolbeg Street, Hawkins Street, Townsend Street, Fleet Street, Dublin Society Stores Date: 1800"
	},
	{
		"name": "wsc-387", "x": 280, "y": 423.5, "zoomX": 0.083, "zoomY": 0.077, "rotation": 3.035, 
		"src": "images/wsc/wsc-387.png", "visibile": true, "opacity": 0.4,
		"description": "Survey of holdings in Fleet Street and College Street, showing site of Old Watch House Date: 1801"
	},
	{
		"name": "wsc-199", "x": 878.5, "y": 1217.5, "zoomX": 0.241, "zoomY": 0.241, "rotation": 2.115, 
		"src": "images/wsc/wsc-199-1.png", "visibile": true, "opacity": 0.6,
		"description": "Map of part of the estate of the Hon. Sidney Herbert, called Wilton Parade, showing the proposed appropriation thereof in sites for building. Also showing Baggot Street, Grand Canal and Fitzwilliam Place."
	},
	{
		"name": "wsc-218", "x": -2455, "y": -284.5, "zoomX": 0.453, "zoomY": 0.451, "rotation": -0.04, 
		"src": "images/wsc/wsc-218.png", "visibile": true, "opacity": 0.8,
		"description": "Survey of the Long Meadows and part of the Phoenix Park and Parkgate Street Date: 1786"
	},
	{
		"name": "wsc-229", "x": -2384, "y": 55.5, "zoomX": 0.379, "zoomY": 0.379, "rotation": 0.015, 
		"src": "images/wsc/wsc-229.png", "visibile": true, "opacity": 0.6,
		"description": "Section across the proposed Road from the Park Gate to Island Bridge Gate - now (1900) Conyngham Road Date: 1789"
	},
	{
		"name": "wsc-242", "x": -405.5, "y": 21, "zoomX": 0.084, "zoomY": 0.084, "rotation": 1.085, 
		"src": "images/wsc/wsc-242-2.png", "visibile": true, "opacity": 0.8,
		"description": "Survey of a holding in Mary’s Lane, the estate of the Right Honourable Lord Mountjoy Date: 1793"
	},
	{
		"name": "wsc-245", "x": -210.0, "y":-397.5, "zoomX": 0.084, "zoomY": 0.084, "rotation": -0.62, 
		"src": "images/wsc/wsc-245-2.png", "visibile": true, "opacity": 0.8,
		"description": "Map of the Barley Fields etc., and a plan for opening a street from Rutland Square, Dorset Street, being now (1899) known as South Frederick Street - with reference Date: 1789"
	},
	{
		"name": "wsc-257", "x": 681.0, "y":-1223.5, "zoomX": 0.346, "zoomY": 0.388, "rotation": 0.25, 
		"src": "images/wsc/wsc-257.png", "visibile": true, "opacity": 0.8,
		"description": "Map of Clonliffe Road and the Old Turnpike House at Ballybough Bridge - North Strand Date: 1823"
	},
	{
		"name": "wsc-268", "x": -1528.0, "y": 105.5, "zoomX": 0.086, "zoomY": 0.086, "rotation": 0.07, 
		"src": "images/wsc/wsc-268-3.png", "visibile": true, "opacity": 0.8,
		"description": "Map - Parkgate Street, Conyngham Road, with reference to names of tenants endorsed No. 3"
	},
	{
		"name": "wsc-171", "x": 112.0, "y": 181.5, "zoomX": 0.021, "zoomY": 0.021, "rotation": -0.265, 
		"src": "images/wsc/wsc-171-2.jpeg", "visibile": true, "opacity": 0.8,
		"description": "Map of Lower Abbey Street, to corner of Eden Quay (Sackville Street) Date: 1813"
	},
	{
		"name": "wsc-309", "x": 36.0, "y": -297, "zoomX": 0.219, "zoomY": 0.219, "rotation": -0.435, 
		"src": "images/wsc/wsc-309.png", "visibile": true, "opacity": 0.8,
		"description": "Part of Gardiner Street and part of Gloucester Street, land out in lots for building - showing Gloucester Street, Gloucester Place, the Diamond, Summer Hill, Great Britain Street, Cumberland Street, Marlboro’ Street, Mabbot Street, Mecklinburgh etc.Date: 1791"
	},
	{
		"name": "wsc-294", "x": 125.0, "y": -118, "zoomX": 0.129, "zoomY": 0.129, "rotation": -0.195, 
		"src": "images/wsc/wsc-maps-294-2.png", "visibile": true, "opacity": 0.8,
		"description": "Survey of part of the Lordship of Saint Mary’s Abbey - part of the estate of the Right Honorable Luke Viscount Mountjoy, sold to Richard French Esq., pursuant to a Decree of His Majesty’s High Court of Chancery, 17 Feb 1794"
	},
	{
		"name": "wsc-310", "x": 474.0, "y": -821.5, "zoomX": 0.576, "zoomY": 0.576, "rotation": 0.145, 
		"src": "images/wsc/wsc-310.png", "visibile": true, "opacity": 0.8,
		"description": "North Lots - from the North Strand Road, to the North and East Walls Date: 1793"
	},
	{
		"name": "wsc-325", "x": -893.0, "y": 41, "zoomX": 0.286, "zoomY": 0.286, "rotation": 0.03, 
		"src": "images/wsc/wsc-325.png", "visibile": true, "opacity": 0.5,
		"description": "Smithfield, Arran Quay, Haymarket, West Arran Street, New Church Street, Bow Lane, Bow Street, May Lane"
	},
	{
		"name": "wsc-326-1", "x": -1415.5, "y": 112.5, "zoomX": 0.114, "zoomY": 0.112, "rotation": 0.17, 
		"src": "images/wsc/wsc-326-1.png", "visibile": true, "opacity": 0.8,
		"description": "Barrack Street, Park Street, Parkgate Street and Temple Street, with reference to names of tenants and premises No. 1"
	},
	{
		"name": "wsc-326-2", "x": -1257.5, "y": 143.5, "zoomX": 0.1, "zoomY": 0.1, "rotation": 0.075, 
		"src": "images/wsc/wsc-326-2.png", "visibile": true, "opacity": 0.7,
		"description": "Barrack Street, Park Street, Parkgate Street and Temple Street, with reference to names of tenants and premises"
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
let countyState = new view_1.BasicTransform(-2631, -2051.5, 1.716, 1.674, 0);
let countyImage = new static_1.StaticImage(countyState, "images/County_of_the_City_of_Dublin_1837_map.png", 0.5);
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
let edit = wscLayer.get("wsc-329");
imageLayer.set("wsc", wscLayer);
imageLayer.set("firemaps", firemapLayer);
imageLayer.set("landmarks", landmarksLayer);
function showMap(divName, name) {
    const canvas = document.getElementById(divName);
    let canvasTransform = new view_1.BasicTransform(-512, -512, 0.5, 0.5, 0);
    let canvasView = new canvasview_1.CanvasView(canvasTransform, canvas.clientWidth, canvas.clientHeight, canvas);
    canvasView.layers.push(sentinelLayer);
    canvasView.layers.push(imageLayer);
    canvasView.layers.push(staticGrid);
    let tileController = new imagecontroller_1.DisplayElementController(canvasView, sentinelLayer, "v");
    let baseController = new imagecontroller_1.DisplayElementController(canvasView, bgImage, "B");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ3R3by9jYW52YXN2aWV3LnRzIiwic3JjL2d0d28vZ3JpZC50cyIsInNyYy9ndHdvL2ltYWdlY29udHJvbGxlci50cyIsInNyYy9ndHdvL2xheWVyLnRzIiwic3JjL2d0d28vbGF5ZXJtYW5hZ2VyLnRzIiwic3JjL2d0d28vc3RhdGljLnRzIiwic3JjL2d0d28vdGlsZWxheWVyLnRzIiwic3JjL2d0d28vdmlldy50cyIsInNyYy9ndHdvL3ZpZXdjb250cm9sbGVyLnRzIiwic3JjL2ltYWdlZ3JvdXBzL2ZpcmVtYXBzLmpzb24iLCJzcmMvaW1hZ2Vncm91cHMvbGFuZG1hcmtzLmpzb24iLCJzcmMvaW1hZ2Vncm91cHMvd3NjLmpzb24iLCJzcmMvc2ltcGxlV29ybGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0NBLGlDQUtnQztBQVNoQyxNQUFhLFVBQVcsU0FBUSx5QkFBa0I7SUFLakQsWUFDQyxjQUF5QixFQUN6QixLQUFhLEVBQUUsTUFBYyxFQUNwQixhQUFnQztRQUV6QyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQ3RELGNBQWMsQ0FBQyxLQUFLLEVBQUUsY0FBYyxDQUFDLEtBQUssRUFDMUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBSmpCLGtCQUFhLEdBQWIsYUFBYSxDQUFtQjtRQU4xQyxXQUFNLEdBQXVCLEVBQUUsQ0FBQztRQVkvQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFbEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRCxTQUFTLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxNQUFjO1FBRXZDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxN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QztRQUMvQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUQsSUFBSSxNQUFNLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUVoRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzlDLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDL0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzlELElBQUksT0FBTyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUU7UUFFbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBRTlDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUVoQixLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLElBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFDO1lBQy9CLDRCQUE0QjtZQUM1QixJQUFJLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQzVDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sRUFBRSxJQUFJLEdBQUcsT0FB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Q0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUM7S0FDckQ7QUFDTCxDQUFDO0FBRUQsU0FBUyxJQUFJO0lBQ1osT0FBTyxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBRUQsSUFDSSxRQUFRLENBQUMsVUFBVSxLQUFLLFVBQVU7SUFDbEMsQ0FBQyxRQUFRLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQzNFO0lBQ0QsSUFBSSxFQUFFLENBQUM7Q0FDUDtLQUFNO0lBQ04sUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ3BEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IHsgQ2FudmFzTGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgXG5cdGludmVydFRyYW5zZm9ybSwgXG5cdFZpZXdUcmFuc2Zvcm0sIFxuXHRCYXNpY1ZpZXdUcmFuc2Zvcm0sIFxuXHRUcmFuc2Zvcm0sIFxuXHRCYXNpY1RyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcblxuZXhwb3J0IGludGVyZmFjZSBEaXNwbGF5RWxlbWVudCBleHRlbmRzIFRyYW5zZm9ybSB7XG5cdGlzVmlzaWJsZSgpOiBib29sZWFuO1xuXHRzZXRWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4pOiB2b2lkO1xuXHRnZXRPcGFjaXR5KCk6IG51bWJlcjtcblx0c2V0T3BhY2l0eShvcGFjaXR5OiBudW1iZXIpOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgQ2FudmFzVmlldyBleHRlbmRzIEJhc2ljVmlld1RyYW5zZm9ybSB7XG5cblx0bGF5ZXJzOiBBcnJheTxDYW52YXNMYXllcj4gPSBbXTtcblx0Y3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0bG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdFx0d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIFxuXHRcdHJlYWRvbmx5IGNhbnZhc0VsZW1lbnQ6IEhUTUxDYW52YXNFbGVtZW50KXtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLngsIGxvY2FsVHJhbnNmb3JtLnksIHdpZHRoLCBoZWlnaHQsIFxuXHRcdFx0bG9jYWxUcmFuc2Zvcm0uem9vbVgsIGxvY2FsVHJhbnNmb3JtLnpvb21ZLCBcblx0XHRcdGxvY2FsVHJhbnNmb3JtLnJvdGF0aW9uKTtcblxuXHRcdHRoaXMuaW5pdENhbnZhcygpO1xuXG5cdFx0dGhpcy5jdHggPSBjYW52YXNFbGVtZW50LmdldENvbnRleHQoXCIyZFwiKTtcblx0fVxuXG5cdHpvb21BYm91dCh4OiBudW1iZXIsIHk6IG51bWJlciwgem9vbUJ5OiBudW1iZXIpe1xuXG4gICAgICAgIHRoaXMuem9vbVggPSB0aGlzLnpvb21YICogem9vbUJ5O1xuICAgICAgICB0aGlzLnpvb21ZID0gdGhpcy56b29tWSAqIHpvb21CeTtcblxuICAgICAgICBsZXQgcmVsYXRpdmVYID0geCAqIHpvb21CeSAtIHg7XG4gICAgICAgIGxldCByZWxhdGl2ZVkgPSB5ICogem9vbUJ5IC0geTtcblxuICAgICAgICBsZXQgd29ybGRYID0gcmVsYXRpdmVYIC8gdGhpcy56b29tWDtcbiAgICAgICAgbGV0IHdvcmxkWSA9IHJlbGF0aXZlWSAvIHRoaXMuem9vbVk7XG5cbiAgICAgICAgdGhpcy54ID0gdGhpcy54ICsgd29ybGRYO1xuICAgICAgICB0aGlzLnkgPSB0aGlzLnkgKyB3b3JsZFk7XG5cblx0fVxuXG5cdGRyYXcoKTogYm9vbGVhbiB7XG5cdFx0bGV0IHRyYW5zZm9ybSA9IGludmVydFRyYW5zZm9ybSh0aGlzKTtcblxuXHRcdHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwiZ3JleVwiO1xuXHRcdHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuXHRcdHZhciBkcmF3aW5nQ29tcGxldGUgPSB0cnVlO1xuXG5cdFx0Zm9yIChsZXQgbGF5ZXIgb2YgdGhpcy5sYXllcnMpe1xuXHRcdFx0aWYgKGxheWVyLmlzVmlzaWJsZSgpKXtcblx0XHRcdFx0ZHJhd2luZ0NvbXBsZXRlID0gZHJhd2luZ0NvbXBsZXRlICYmIGxheWVyLmRyYXcodGhpcy5jdHgsIEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0sIHRoaXMpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fVxuXG5cdFx0dGhpcy5kcmF3Q2VudHJlKHRoaXMuY3R4KTtcblxuXHRcdHJldHVybiBkcmF3aW5nQ29tcGxldGU7XG5cdH1cblxuXHRkcmF3Q2VudHJlKGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCl7XG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIGNvbnRleHQuZ2xvYmFsQWxwaGEgPSAwLjM7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLndpZHRoLzIsIDYvMTYqdGhpcy5oZWlnaHQpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyh0aGlzLndpZHRoLzIsIDEwLzE2KnRoaXMuaGVpZ2h0KTtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8oNy8xNip0aGlzLndpZHRoLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oOS8xNip0aGlzLndpZHRoLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcbiAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XG4gICAgfVxuXG5cdHByaXZhdGUgaW5pdENhbnZhcygpe1xuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLmNhbnZhc0VsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLmNhbnZhc0VsZW1lbnQuY2xpZW50SGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQuaGVpZ2h0ID0gaGVpZ2h0O1xuXHR9XG5cbn0iLCJpbXBvcnQgeyBEcmF3TGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgVHJhbnNmb3JtLCBWaWV3VHJhbnNmb3JtLCBjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuXG4vKipcbiogV2UgZG9uJ3Qgd2FudCB0byBkcmF3IGEgZ3JpZCBpbnRvIGEgdHJhbnNmb3JtZWQgY2FudmFzIGFzIHRoaXMgZ2l2ZXMgdXMgZ3JpZCBsaW5lcyB0aGF0IGFyZSB0b29cbnRoaWNrIG9yIHRvbyB0aGluXG4qL1xuZXhwb3J0IGNsYXNzIFN0YXRpY0dyaWQgZXh0ZW5kcyBEcmF3TGF5ZXIge1xuXG5cdHpvb21XaWR0aDogbnVtYmVyO1xuXHR6b29tSGVpZ2h0OiBudW1iZXI7XG5cblx0Y29uc3RydWN0b3IobG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgem9vbUxldmVsOiBudW1iZXIsIFxuXHRcdHJlYWRvbmx5IGdyaWRXaWR0aDogbnVtYmVyID0gMjU2LCByZWFkb25seSBncmlkSGVpZ2h0OiBudW1iZXIgPSAyNTYpe1xuXG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0sIDEpO1xuXG5cdFx0bGV0IHpvb20gPSBNYXRoLnBvdygyLCB6b29tTGV2ZWwpO1xuXHRcdHRoaXMuem9vbVdpZHRoID0gZ3JpZFdpZHRoIC8gem9vbTtcblx0XHR0aGlzLnpvb21IZWlnaHQgPSBncmlkSGVpZ2h0IC8gem9vbTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBWaWV3VHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0XHRsZXQgb2Zmc2V0WCA9IHZpZXcueCAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IG9mZnNldFkgPSB2aWV3LnkgKiB2aWV3Lnpvb21ZO1xuXG5cdFx0bGV0IHZpZXdXaWR0aCA9IHZpZXcud2lkdGggLyB2aWV3Lnpvb21YO1xuXHRcdGxldCB2aWV3SGVpZ2h0ID0gdmlldy5oZWlnaHQgLyB2aWV3Lnpvb21ZO1xuXG5cdFx0bGV0IGdyaWRBY3Jvc3MgPSB2aWV3V2lkdGggLyB0aGlzLnpvb21XaWR0aDtcblx0XHRsZXQgZ3JpZEhpZ2ggPSB2aWV3SGVpZ2h0IC8gdGhpcy56b29tSGVpZ2h0O1xuXG5cdFx0bGV0IHhNaW4gPSBNYXRoLmZsb29yKHZpZXcueC90aGlzLnpvb21XaWR0aCk7XG5cdFx0bGV0IHhMZWZ0ID0geE1pbiAqIHRoaXMuem9vbVdpZHRoICogdmlldy56b29tWDtcblx0XHRsZXQgeE1heCA9IE1hdGguY2VpbCgodmlldy54ICsgdmlld1dpZHRoKSAvIHRoaXMuem9vbVdpZHRoKTtcblx0XHRsZXQgeFJpZ2h0ID0geE1heCAqIHRoaXMuem9vbVdpZHRoICogdmlldy56b29tWDtcblxuXHRcdGxldCB5TWluID0gTWF0aC5mbG9vcih2aWV3LnkvdGhpcy56b29tSGVpZ2h0KTtcblx0XHRsZXQgeVRvcCA9IHlNaW4gKiB0aGlzLnpvb21IZWlnaHQgKiB2aWV3Lnpvb21YO1xuXHRcdGxldCB5TWF4ID0gTWF0aC5jZWlsKCh2aWV3LnkgKyB2aWV3SGVpZ2h0KSAvIHRoaXMuem9vbUhlaWdodCk7XG5cdFx0bGV0IHlCb3R0b20gPSB5TWF4ICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWCA7XG5cblx0XHRjb25zb2xlLmxvZyhcInhNaW4gXCIgKyB4TWluICsgXCIgeE1heCBcIiArIHhNYXgpO1xuXHRcdGNvbnNvbGUubG9nKFwieU1pbiBcIiArIHlNaW4gKyBcIiB5TWF4IFwiICsgeU1heCk7XG5cblx0XHRjdHguYmVnaW5QYXRoKCk7XG5cblx0XHRmb3IgKHZhciB4ID0geE1pbjsgeDw9eE1heDsgeCsrKXtcblx0XHRcdC8vY29uc29sZS5sb2coXCJhdCBcIiArIG1pblgpO1xuXHRcdFx0bGV0IHhNb3ZlID0geCAqIHRoaXMuem9vbVdpZHRoICogdmlldy56b29tWDtcblx0XHRcdGN0eC5tb3ZlVG8oeE1vdmUgLSBvZmZzZXRYLCB5VG9wIC0gb2Zmc2V0WSk7XG5cdFx0XHRjdHgubGluZVRvKHhNb3ZlIC0gb2Zmc2V0WCwgeUJvdHRvbSAtIG9mZnNldFkpO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIHkgPSB5TWluOyB5PD15TWF4OyB5Kyspe1xuXG5cdFx0XHRsZXQgeU1vdmUgPSB5ICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWTtcblx0XHRcdGN0eC5tb3ZlVG8oeExlZnQgLSBvZmZzZXRYLCB5TW92ZSAtIG9mZnNldFkpO1xuXHRcdFx0Y3R4LmxpbmVUbyh4UmlnaHQgLSBvZmZzZXRYLCB5TW92ZSAtIG9mZnNldFkpO1xuXG5cdFx0XHRmb3IgKHZhciB4ID0geE1pbjsgeDw9eE1heDsgeCsrKXtcblx0XHRcdFx0bGV0IHhNb3ZlID0gKHgtLjUpICogdGhpcy56b29tV2lkdGggKiB2aWV3Lnpvb21YO1xuXHRcdFx0XHR5TW92ZSA9ICh5LS41KSAqIHRoaXMuem9vbUhlaWdodCAqIHZpZXcuem9vbVk7XG5cdFx0XHRcdGxldCB0ZXh0ID0gXCJcIiArICh4LTEpICsgXCIsIFwiICsgKHktMSk7XG5cdFx0XHRcdGN0eC5zdHJva2VUZXh0KHRleHQsIHhNb3ZlIC0gb2Zmc2V0WCwgeU1vdmUgLSBvZmZzZXRZKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdGNvbnNvbGUubG9nKFwiZHJldyBncmlkXCIpO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cbn0iLCJcbmltcG9ydCB7Q2FudmFzVmlldywgRGlzcGxheUVsZW1lbnR9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7Q2FudmFzTGF5ZXJ9IGZyb20gXCIuL2xheWVyXCI7XG5cbmV4cG9ydCBjbGFzcyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3IoY2FudmFzVmlldzogQ2FudmFzVmlldywgcmVhZG9ubHkgZGlzcGxheUVsZW1lbnQ6IERpc3BsYXlFbGVtZW50LCAgcHVibGljIG1vZDogc3RyaW5nID0gXCJ2XCIpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZChjYW52YXNWaWV3LCBlICBhcyBLZXlib2FyZEV2ZW50KSk7XG4gICAgfVxuXG4gICAgcHJlc3NlZChjYW52YXNWaWV3OiBDYW52YXNWaWV3LCBldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwicHJlc3NlZCBsYXllclwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQua2V5KTtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgICAgICAgICAgY2FzZSB0aGlzLm1vZDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInRvZ2dsZSB2aXNpYmxlXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheUVsZW1lbnQuc2V0VmlzaWJsZSghdGhpcy5kaXNwbGF5RWxlbWVudC5pc1Zpc2libGUoKSk7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZUNvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3IoY2FudmFzVmlldzogQ2FudmFzVmlldywgcmVhZG9ubHkgY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyKSB7XG4gICAgXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLnByZXNzZWQoY2FudmFzVmlldywgZSAgYXMgS2V5Ym9hcmRFdmVudCkpO1xuICAgIH1cblxuICAgIHByZXNzZWQodmlld0NhbnZhczogQ2FudmFzVmlldywgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBcdGNvbnNvbGUubG9nKFwicHJlc3NlZFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQua2V5KTtcblxuICAgICAgICBsZXQgbXVsdGlwbGllciA9IDE7XG5cbiAgICBcdHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgXHRcdGNhc2UgXCJhXCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54IC0gMC41ICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJBXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54IC0gNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdmlld0NhbnZhcy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgXHRcdGNhc2UgXCJkXCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54ICsgMC41ICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJEXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54ICsgNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdmlld0NhbnZhcy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgXHRcdGNhc2UgXCJ3XCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci55ID0gdGhpcy5jYW52YXNMYXllci55IC0gMC41ICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJXXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci55ID0gdGhpcy5jYW52YXNMYXllci55IC0gNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdmlld0NhbnZhcy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7ICAgIFxuICAgIFx0XHRjYXNlIFwic1wiOlxuICAgIFx0XHRcdHRoaXMuY2FudmFzTGF5ZXIueSA9IHRoaXMuY2FudmFzTGF5ZXIueSArIDAuNSAqIG11bHRpcGxpZXI7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiU1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIueSA9IHRoaXMuY2FudmFzTGF5ZXIueSArIDUgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHZpZXdDYW52YXMuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiZVwiOlxuICAgIFx0XHRcdHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gPSB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uIC0gMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJxXCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiA9IHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gKyAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInhcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnpvb21YID0gdGhpcy5jYW52YXNMYXllci56b29tWCAtIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIlhcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnpvb21YID0gdGhpcy5jYW52YXNMYXllci56b29tWCArIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInpcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnpvb21ZID0gdGhpcy5jYW52YXNMYXllci56b29tWSAtIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIlpcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnpvb21ZID0gdGhpcy5jYW52YXNMYXllci56b29tWSArIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJUXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5vcGFjaXR5ID0gTWF0aC5taW4oMS4wLCB0aGlzLmNhbnZhc0xheWVyLm9wYWNpdHkgKyAwLjEpO1xuICAgICAgICAgICAgICAgIHZpZXdDYW52YXMuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLm9wYWNpdHkgPSBNYXRoLm1heCgwLCB0aGlzLmNhbnZhc0xheWVyLm9wYWNpdHkgLSAwLjEpO1xuICAgICAgICAgICAgICAgIHZpZXdDYW52YXMuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgIFx0XHRkZWZhdWx0OlxuICAgIFx0XHRcdC8vIGNvZGUuLi5cbiAgICBcdFx0XHRicmVhaztcbiAgICBcdH1cbiAgICBcdGNvbnNvbGUubG9nKFwiaW1hZ2UgYXQ6IFwiICsgIHRoaXMuY2FudmFzTGF5ZXIueCArIFwiLCBcIiArIHRoaXMuY2FudmFzTGF5ZXIueSk7XG4gICAgXHRjb25zb2xlLmxvZyhcImltYWdlIHJvIHNjOiBcIiArICB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uICsgXCIsIFwiICsgdGhpcy5jYW52YXNMYXllci56b29tWCArIFwiLCBcIiArIHRoaXMuY2FudmFzTGF5ZXIuem9vbVkpO1xuICAgIH07XG5cbn07IiwiaW1wb3J0IHsgVHJhbnNmb3JtLCBCYXNpY1RyYW5zZm9ybSwgVmlld1RyYW5zZm9ybSwgY29tYmluZVRyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IERpc3BsYXlFbGVtZW50IH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2FudmFzTGF5ZXIgZXh0ZW5kcyBCYXNpY1RyYW5zZm9ybSBpbXBsZW1lbnRzIERpc3BsYXlFbGVtZW50IHtcblxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgbG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgcHVibGljIG9wYWNpdHk6IG51bWJlciwgcHVibGljIHZpc2libGUpe1xuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLngsIGxvY2FsVHJhbnNmb3JtLnksIGxvY2FsVHJhbnNmb3JtLnpvb21YLCBsb2NhbFRyYW5zZm9ybS56b29tWSwgbG9jYWxUcmFuc2Zvcm0ucm90YXRpb24pO1xuXHR9XG5cblx0YWJzdHJhY3QgZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFZpZXdUcmFuc2Zvcm0pOiBib29sZWFuO1xuXG5cdGlzVmlzaWJsZSgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy52aXNpYmxlO1xuXHR9XG5cblx0c2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdm9pZCB7XG5cdFx0Y29uc29sZS5sb2coXCJzZXR0aW5nIHZpc2liaWxpdHk6IFwiICsgdmlzaWJsZSk7XG5cdFx0dGhpcy52aXNpYmxlID0gdmlzaWJsZTtcblx0fVxuXG5cdGdldE9wYWNpdHkoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5vcGFjaXR5O1xuXHR9XG5cblx0c2V0T3BhY2l0eShvcGFjaXR5OiBudW1iZXIpOiB2b2lkIHtcblx0XHR0aGlzLm9wYWNpdHkgPSBvcGFjaXR5O1xuXHR9XG5cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIERyYXdMYXllciBleHRlbmRzIENhbnZhc0xheWVyIHtcblxuICAgIHByb3RlY3RlZCBwcmVwYXJlQ3R4KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB0cmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVHJhbnNmb3JtKTogdm9pZCB7XG5cdFx0Y3R4LnRyYW5zbGF0ZSgodHJhbnNmb3JtLnggLSB2aWV3LngpICogdmlldy56b29tWCwgKHRyYW5zZm9ybS55IC0gdmlldy55KSAqIHZpZXcuem9vbVkpO1xuXHRcdGN0eC5zY2FsZSh0cmFuc2Zvcm0uem9vbVggKiB2aWV3Lnpvb21YLCB0cmFuc2Zvcm0uem9vbVkgKiB2aWV3Lnpvb21ZKTtcblx0XHRjdHgucm90YXRlKHRyYW5zZm9ybS5yb3RhdGlvbik7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNsZWFuQ3R4KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB0cmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVHJhbnNmb3JtKTogdm9pZCB7XHRcblx0XHRjdHgucm90YXRlKC10cmFuc2Zvcm0ucm90YXRpb24pO1xuXHRcdGN0eC5zY2FsZSgxL3RyYW5zZm9ybS56b29tWC92aWV3Lnpvb21YLCAxL3RyYW5zZm9ybS56b29tWS92aWV3Lnpvb21ZKTtcblx0XHRjdHgudHJhbnNsYXRlKC0odHJhbnNmb3JtLnggLXZpZXcueCkgKnZpZXcuem9vbVgsIC0odHJhbnNmb3JtLnkgLSB2aWV3LnkpICogdmlldy56b29tWSk7XG4gICAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBDb250YWluZXJMYXllciBleHRlbmRzIENhbnZhc0xheWVyIHtcblxuXHRsYXllck1hcDogTWFwPHN0cmluZywgQ2FudmFzTGF5ZXI+O1xuXG5cdGNvbnN0cnVjdG9yKGxvY2FsVHJhbnNmb3JtOiBUcmFuc2Zvcm0sIG9wYWNpdHk6IG51bWJlciA9IDEsIHZpc2libGU6IGJvb2xlYW4gPSB0cnVlKSB7XG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0sIG9wYWNpdHksIHZpc2libGUpO1xuXHRcdHRoaXMubGF5ZXJNYXAgPSBuZXcgTWFwPHN0cmluZywgQ2FudmFzTGF5ZXI+KCk7XG5cdH1cblxuXHRzZXQobmFtZTogc3RyaW5nLCBsYXllcjogQ2FudmFzTGF5ZXIpe1xuXHRcdHRoaXMubGF5ZXJNYXAuc2V0KG5hbWUsIGxheWVyKTtcblx0fVxuXG5cdGdldChuYW1lOiBzdHJpbmcpOiBDYW52YXNMYXllciB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXAuZ2V0KG5hbWUpO1xuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFZpZXdUcmFuc2Zvcm0pOiBib29sZWFuIHtcblxuXHRcdGxldCBsYXllclRyYW5zZm9ybSA9IGNvbWJpbmVUcmFuc2Zvcm0odGhpcy5sb2NhbFRyYW5zZm9ybSwgcGFyZW50VHJhbnNmb3JtKTtcblxuXHRcdHZhciBkcmF3aW5nQ29tcGxldGUgPSB0cnVlO1xuXG5cdFx0Zm9yIChsZXQgbGF5ZXIgb2YgdGhpcy5sYXllck1hcCkge1xuXHRcdFx0aWYgKGxheWVyWzFdLmlzVmlzaWJsZSgpKXtcblx0XHRcdFx0ZHJhd2luZ0NvbXBsZXRlID0gZHJhd2luZ0NvbXBsZXRlICYmIGxheWVyWzFdLmRyYXcoY3R4LCBsYXllclRyYW5zZm9ybSwgdmlldyk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9XG5cblx0XHRyZXR1cm4gZHJhd2luZ0NvbXBsZXRlO1xuXHR9XG5cbn0iLCJpbXBvcnQgeyBDYW52YXNMYXllciwgQ29udGFpbmVyTGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgU3RhdGljSW1hZ2UgfSBmcm9tIFwiLi9zdGF0aWNcIjtcbmltcG9ydCB7IFRyYW5zZm9ybSAsIEJhc2ljVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEltYWdlU3RydWN0IGV4dGVuZHMgVHJhbnNmb3JtIHtcblx0XG5cdG9wYWNpdHk6IG51bWJlcjtcblx0dmlzaWJsZTogYm9vbGVhbjtcblx0c3JjOiBzdHJpbmc7XG5cdG5hbWU6IHN0cmluZztcblxufVxuXG5leHBvcnQgY2xhc3MgTGF5ZXJNYW5hZ2VyIHtcblxuXHRwcml2YXRlIGxheWVyTWFwOiBNYXA8c3RyaW5nLCBDb250YWluZXJMYXllcj47O1xuXG5cdHJlYWRvbmx5IGRlZmF1bHRMYXllcjogc3RyaW5nID0gXCJkZWZhdWx0XCI7XG5cblx0Y29uc3RydWN0b3IoKXtcblx0XHR0aGlzLmxheWVyTWFwID0gbmV3IE1hcDxzdHJpbmcsIENvbnRhaW5lckxheWVyPigpO1xuXG5cdFx0bGV0IGltYWdlTGF5ZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXIoQmFzaWNUcmFuc2Zvcm0udW5pdFRyYW5zZm9ybSwgMSwgdHJ1ZSk7XHRcblxuXHRcdHRoaXMubGF5ZXJNYXAuc2V0KHRoaXMuZGVmYXVsdExheWVyLCBpbWFnZUxheWVyKTtcblx0fVxuXG5cdGFkZEltYWdlKGltYWdlOiBTdGF0aWNJbWFnZSwgbmFtZTogc3RyaW5nKXtcblx0XHR0aGlzLmxheWVyTWFwLmdldCh0aGlzLmRlZmF1bHRMYXllcikuc2V0KG5hbWUsIGltYWdlKTtcblx0fVxuXG5cdGFkZExheWVyKGltYWdlRGV0YWlsczogQXJyYXk8SW1hZ2VTdHJ1Y3Q+LCBsYXllck5hbWU6IHN0cmluZyk6IENvbnRhaW5lckxheWVyIHtcblx0XHRsZXQgaW1hZ2VMYXllciA9IG5ldyBDb250YWluZXJMYXllcihCYXNpY1RyYW5zZm9ybS51bml0VHJhbnNmb3JtLCAxLCB0cnVlKTtcdFxuXG5cdFx0Zm9yICh2YXIgaW1hZ2Ugb2YgaW1hZ2VEZXRhaWxzKXtcblx0XHRcdGxldCBzdGF0aWNJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZShpbWFnZSwgaW1hZ2Uuc3JjLCBpbWFnZS5vcGFjaXR5LCBpbWFnZS52aXNpYmxlKTtcblx0XHRcdGltYWdlTGF5ZXIuc2V0KGltYWdlLm5hbWUsIHN0YXRpY0ltYWdlKTtcblx0XHR9XG5cblx0XHR0aGlzLmxheWVyTWFwLnNldChsYXllck5hbWUsIGltYWdlTGF5ZXIpO1xuXG5cdFx0cmV0dXJuIGltYWdlTGF5ZXI7XG5cdH1cblxuXHRnZXRMYXllcnMoKTogTWFwPHN0cmluZywgQ29udGFpbmVyTGF5ZXI+IHtcblx0XHRyZXR1cm4gdGhpcy5sYXllck1hcDtcblx0fVxuXG59IiwiaW1wb3J0IHsgVHJhbnNmb3JtLCBjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgRHJhd0xheWVyLCBDYW52YXNMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBEaXNwbGF5RWxlbWVudCB9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcblxuZXhwb3J0IGNsYXNzIFN0YXRpY0ltYWdlIGV4dGVuZHMgRHJhd0xheWVyIGltcGxlbWVudHMgRGlzcGxheUVsZW1lbnQge1xuXG5cdHByaXZhdGUgaW1nOiBIVE1MSW1hZ2VFbGVtZW50O1xuXG5cdGNvbnN0cnVjdG9yKGxvY2FsVHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHRcdGltYWdlU3JjOiBzdHJpbmcsIFxuXHRcdG9wYWNpdHk6IG51bWJlcixcblx0XHR2aXNpYmxlOiBib29sZWFuID0gdHJ1ZSkge1xuXG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0sIG9wYWNpdHksIHZpc2libGUpO1xuXHRcdFxuXHRcdHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG5cdFx0dGhpcy5pbWcuc3JjID0gaW1hZ2VTcmM7XG5cdH1cblxuXHRwcml2YXRlIGRyYXdJbWFnZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFRyYW5zZm9ybSl7XG5cblx0XHRsZXQgY3R4VHJhbnNmb3JtID0gY29tYmluZVRyYW5zZm9ybSh0aGlzLCBwYXJlbnRUcmFuc2Zvcm0pO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhcImN0eCB4IFwiICsgY3R4VHJhbnNmb3JtLngpO1xuXG5cdFx0dGhpcy5wcmVwYXJlQ3R4KGN0eCwgY3R4VHJhbnNmb3JtLCB2aWV3KTtcblx0XHRcblx0XHRjdHguZ2xvYmFsQWxwaGEgPSB0aGlzLm9wYWNpdHk7XG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZywgMCwgMCk7XG5cdFx0Y3R4Lmdsb2JhbEFscGhhID0gMTtcblxuXHRcdHRoaXMuY2xlYW5DdHgoY3R4LCBjdHhUcmFuc2Zvcm0sIHZpZXcpO1xuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFRyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXHRcdGlmICh0aGlzLnZpc2libGUgJiYgdGhpcy5pbWcuY29tcGxldGUpIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgcGFyZW50VHJhbnNmb3JtLCB2aWV3KTtcblx0XHQvL1x0Y29uc29sZS5sb2coXCJkcmV3IGltYWdlIFwiICsgdGhpcy5pbWcuc3JjKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cbiIsImltcG9ydCB7IERyYXdMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBUcmFuc2Zvcm0sIEJhc2ljVHJhbnNmb3JtLCBWaWV3VHJhbnNmb3JtLCBjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuXG5leHBvcnQgY2xhc3MgVGlsZVN0cnVjdCB7XG5cdFxuXHRjb25zdHJ1Y3Rvcihcblx0XHRwdWJsaWMgcHJlZml4OiBzdHJpbmcsXG5cdFx0cHVibGljIHN1ZmZpeDogc3RyaW5nLFxuXHRcdHB1YmxpYyB0aWxlRGlyZWN0b3J5OiBzdHJpbmcpe31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHpvb21CeUxldmVsKHpvb21MZXZlbDogbnVtYmVyKXtcblx0cmV0dXJuIE1hdGgucG93KDIsIHpvb21MZXZlbCk7XG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlTGF5ZXIgZXh0ZW5kcyBEcmF3TGF5ZXIge1xuXG5cdHRpbGVNYW5hZ2VyOiBUaWxlTWFuYWdlcjtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHRyZWFkb25seSB0aWxlU3RydWN0OiBUaWxlU3RydWN0LFxuXHRcdHB1YmxpYyB4T2Zmc2V0OiBudW1iZXIgPSAwLFxuXHRcdHB1YmxpYyB5T2Zmc2V0OiBudW1iZXIgPSAwLFxuXHRcdHB1YmxpYyB6b29tOiBudW1iZXIgPSAxLFxuXHRcdHJlYWRvbmx5IGdyaWRXaWR0aDogbnVtYmVyID0gMjU2LCBcblx0XHRyZWFkb25seSBncmlkSGVpZ2h0OiBudW1iZXIgPSAyNTYsXG5cdFx0b3BhY2l0eTogbnVtYmVyID0gMSxcblx0XHR2aXNiaWxlOiBib29sZWFuID0gdHJ1ZSl7XG5cblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybSwgb3BhY2l0eSwgdmlzYmlsZSk7XG5cblx0XHR0aGlzLnRpbGVNYW5hZ2VyID0gbmV3IFRpbGVNYW5hZ2VyKCk7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0bGV0IGN0eFRyYW5zZm9ybSA9IGNvbWJpbmVUcmFuc2Zvcm0odGhpcywgcGFyZW50VHJhbnNmb3JtKTtcblxuXHRcdGxldCB6b29tV2lkdGg6IG51bWJlciA9IHRoaXMuZ3JpZFdpZHRoICogY3R4VHJhbnNmb3JtLnpvb21YXG5cdFx0bGV0IHpvb21IZWlnaHQ6IG51bWJlciA9IHRoaXMuZ3JpZEhlaWdodCAqIGN0eFRyYW5zZm9ybS56b29tWTtcblxuXHRcdC8vY29uc29sZS5sb2coXCJjdHggem9vbVdpZHRoOiBcIiArIHpvb21XaWR0aCk7XG5cblx0XHRsZXQgdmlld1ggPSB2aWV3LnggKiB2aWV3Lnpvb21YO1xuXHRcdGxldCB2aWV3WSA9IHZpZXcueSAqIHZpZXcuem9vbVk7XG5cblx0XHRsZXQgdmlld1dpZHRoID0gdmlldy53aWR0aCAvIHZpZXcuem9vbVg7XG5cdFx0bGV0IHZpZXdIZWlnaHQgPSB2aWV3LmhlaWdodCAvIHZpZXcuem9vbVk7XG5cblx0XHRsZXQgZ3JpZEFjcm9zcyA9IHZpZXdXaWR0aCAvIHpvb21XaWR0aDsgLy9nb29kXG5cdFx0bGV0IGdyaWRIaWdoID0gdmlld0hlaWdodCAvIHpvb21IZWlnaHQ7IC8vZ29vZFxuXG5cdFx0bGV0IHhNaW4gPSBNYXRoLmZsb29yKHZpZXcueC96b29tV2lkdGgpO1xuXHRcdGxldCB4TWF4ID0gTWF0aC5jZWlsKCh2aWV3LnggKyB2aWV3V2lkdGgpIC8gem9vbVdpZHRoKTtcblxuXHRcdGxldCB5TWluID0gTWF0aC5mbG9vcih2aWV3Lnkvem9vbUhlaWdodCk7XG5cdFx0bGV0IHlNYXggPSBNYXRoLmNlaWwoKHZpZXcueSArIHZpZXdIZWlnaHQpIC8gem9vbUhlaWdodCk7XG5cblx0XHQvL2NvbnNvbGUubG9nKFwieCB5IHMgXCIgKyB4TWluICsgXCIsIFwiICsgeE1heCArIFwiOiBcIiArIHlNaW4gKyBcIiwgXCIgKyB5TWF4KTtcblx0XHQvL2NvbnNvbGUubG9nKFwiYWNyb3NzIGhpZ2hcIiArIGdyaWRBY3Jvc3MgKyBcIiwgXCIgKyBncmlkSGlnaCk7XG5cblx0XHR2YXIgZHJhd2luZ0NvbXBsZXRlID0gdHJ1ZTtcblxuXHRcdGxldCBmdWxsWm9vbVggPSBjdHhUcmFuc2Zvcm0uem9vbVggKiB2aWV3Lnpvb21YO1xuXHRcdGxldCBmdWxsWm9vbVkgPSBjdHhUcmFuc2Zvcm0uem9vbVkgKiB2aWV3Lnpvb21ZO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhcImZ1bGx6b29tcyBcIiArIGZ1bGxab29tWCArIFwiIFwiICsgZnVsbFpvb21ZKTtcblxuXHRcdGN0eC5zY2FsZShmdWxsWm9vbVgsIGZ1bGxab29tWSk7XG5cblx0XHRmb3IgKHZhciB4ID0geE1pbjsgeDx4TWF4OyB4Kyspe1xuXHRcdFx0bGV0IHhNb3ZlID0geCAqIHRoaXMuZ3JpZFdpZHRoIC0gdmlldy54IC8gY3R4VHJhbnNmb3JtLnpvb21YO1xuXHRcdFx0Zm9yICh2YXIgeSA9IHlNaW47IHk8eU1heDsgeSsrKXtcblx0XHRcdFx0bGV0IHlNb3ZlID0geSAqIHRoaXMuZ3JpZEhlaWdodCAtIHZpZXcueS8gY3R4VHJhbnNmb3JtLnpvb21ZO1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKFwidGlsZSB4IHkgXCIgKyB4ICsgXCIgXCIgKyB5ICsgXCI6IFwiICsgeE1vdmUgKyBcIiwgXCIgKyB5TW92ZSk7XG5cblx0XHRcdFx0Y3R4LnRyYW5zbGF0ZSh4TW92ZSwgeU1vdmUpO1xuXHRcdFx0XHRsZXQgdGlsZVNyYyA9IHRoaXMudGlsZVN0cnVjdC50aWxlRGlyZWN0b3J5ICsgdGhpcy56b29tICsgXCIvXCIgKyBcblx0XHRcdFx0XHQoeCArIHRoaXMueE9mZnNldCkgKyBcIi9cIiArIFxuXHRcdFx0XHRcdCh5ICsgdGhpcy55T2Zmc2V0KSArIHRoaXMudGlsZVN0cnVjdC5zdWZmaXg7XG5cblx0XHRcdFx0aWYgKHRoaXMudGlsZU1hbmFnZXIuaGFzKHRpbGVTcmMpKSB7XG5cdFx0XHRcdFx0bGV0IGltYWdlVGlsZSA9IHRoaXMudGlsZU1hbmFnZXIuZ2V0KHRpbGVTcmMpO1xuXHRcdFx0XHRcdGRyYXdpbmdDb21wbGV0ZSA9IGRyYXdpbmdDb21wbGV0ZSAmJiBpbWFnZVRpbGUuZHJhdyhjdHgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGxldCBpbWFnZVRpbGUgPSBuZXcgSW1hZ2VUaWxlKHgsIHksIHRpbGVTcmMpO1xuXG5cdFx0XHRcdFx0ZHJhd2luZ0NvbXBsZXRlID0gZHJhd2luZ0NvbXBsZXRlICYmIGltYWdlVGlsZS5kcmF3KGN0eCk7XG5cblx0XHRcdFx0XHR0aGlzLnRpbGVNYW5hZ2VyLnNldCh0aWxlU3JjLCBpbWFnZVRpbGUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y3R4LnRyYW5zbGF0ZSgteE1vdmUsIC15TW92ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y3R4LnNjYWxlKDEgLyBmdWxsWm9vbVgsIDEgLyBmdWxsWm9vbVkpO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhcImRyZXcgdGlsZXMgXCIgKyBkcmF3aW5nQ29tcGxldGUpO1xuXHRcdHJldHVybiBkcmF3aW5nQ29tcGxldGU7XG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIFRpbGVNYW5hZ2VyIHtcblxuXHR0aWxlTWFwOiBNYXA8c3RyaW5nLCBJbWFnZVRpbGU+O1xuXG5cdGNvbnN0cnVjdG9yKCl7XG5cdFx0dGhpcy50aWxlTWFwID0gbmV3IE1hcDxzdHJpbmcsIEltYWdlVGlsZT4oKTtcblx0fVxuXG5cdGdldCh0aWxlS2V5OiBzdHJpbmcpOiBJbWFnZVRpbGUge1xuXHRcdHJldHVybiB0aGlzLnRpbGVNYXAuZ2V0KHRpbGVLZXkpO1xuXHR9XG5cblx0aGFzKHRpbGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnRpbGVNYXAuaGFzKHRpbGVLZXkpO1xuXHR9XG5cblx0c2V0KHRpbGVLZXk6IHN0cmluZywgdGlsZTogSW1hZ2VUaWxlKXtcblx0XHR0aGlzLnRpbGVNYXAuc2V0KHRpbGVLZXksIHRpbGUpO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlVGlsZSB7XG5cblx0cHJpdmF0ZSBpbWc6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cdHByaXZhdGUgZXhpc3RzOiBib29sZWFuO1xuXG5cdGNvbnN0cnVjdG9yKHJlYWRvbmx5IHhJbmRleDogbnVtYmVyLCByZWFkb25seSB5SW5kZXg6IG51bWJlciwgaW1hZ2VTcmM6IHN0cmluZykge1xuXHRcdHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG5cdFx0dGhpcy5pbWcuc3JjID0gaW1hZ2VTcmM7XG5cdFx0dGhpcy5pbWcub25lcnJvciA9IGZ1bmN0aW9uKGV2ZW50T3JNZXNzYWdlOiBhbnkpe1xuXHRcdFx0ZXZlbnRPck1lc3NhZ2UudGFyZ2V0LnNyYyA9IFwiXCI7XG5cdFx0fTtcblx0fTtcblxuXHRwcml2YXRlIGRyYXdJbWFnZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCl7XG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZywgMCwgMCk7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKTogYm9vbGVhbiB7XG5cdFx0aWYgKHRoaXMuaW1nLnNyYyAhPSBcIlwiICYmIHRoaXMuaW1nLmNvbXBsZXRlICkge1xuXHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4KTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH07XG5cbn1cbiIsIi8qKlxuKiBBIHdvcmxkIGlzIDAsMCBiYXNlZCBidXQgYW55IGVsZW1lbnQgY2FuIGJlIHBvc2l0aW9uZWQgcmVsYXRpdmUgdG8gdGhpcy5cbiovXG5leHBvcnQgaW50ZXJmYWNlIFRyYW5zZm9ybSB7XG5cdHg6IG51bWJlcjtcblx0eTogbnVtYmVyO1xuXHR6b29tWDogbnVtYmVyO1xuXHR6b29tWTogbnVtYmVyO1xuXHRyb3RhdGlvbjogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgQmFzaWNUcmFuc2Zvcm0gaW1wbGVtZW50cyBUcmFuc2Zvcm0ge1xuXG4gICAgc3RhdGljIHJlYWRvbmx5IHVuaXRUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgMSwgMSwgMCk7XG5cblx0Y29uc3RydWN0b3IocHVibGljIHg6IG51bWJlciwgcHVibGljIHk6IG51bWJlciwgXG5cdFx0cHVibGljIHpvb21YOiBudW1iZXIsIHB1YmxpYyB6b29tWTogbnVtYmVyLCBcblx0XHRwdWJsaWMgcm90YXRpb246IG51bWJlcil7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tYmluZVRyYW5zZm9ybShjaGlsZDogVHJhbnNmb3JtLCBjb250YWluZXI6IFRyYW5zZm9ybSk6IFRyYW5zZm9ybSB7XG5cdGxldCB6b29tWCA9IGNoaWxkLnpvb21YICogY29udGFpbmVyLnpvb21YO1xuXHQvL2NvbnNvbGUubG9nKFwibW9kaWZpZWQgXCIgKyBjaGlsZC56b29tWCArIFwiIHRvIFwiICsgem9vbVgpO1xuXHRsZXQgem9vbVkgPSBjaGlsZC56b29tWSAqIGNvbnRhaW5lci56b29tWTtcblx0Ly9jb25zb2xlLmxvZyhcIm1vZGlmaWVkIFwiICsgY2hpbGQuem9vbVkgKyBcIiBieSBcIiArIGNvbnRhaW5lci56b29tWSArIFwiIHRvIFwiICsgem9vbVkpO1xuXHRsZXQgeCA9IChjaGlsZC54ICogY29udGFpbmVyLnpvb21YKSArIGNvbnRhaW5lci54O1xuXHRsZXQgeSA9IChjaGlsZC55ICogY29udGFpbmVyLnpvb21ZKSArIGNvbnRhaW5lci55O1xuXHQvL2NvbnNvbGUubG9nKFwibW9kaWZpZWQgeCBcIiArIGNoaWxkLnggKyBcIiBieSBcIiArIGNvbnRhaW5lci56b29tWCArIFwiIGFuZCBcIiArIGNvbnRhaW5lci54ICsgXCIgdG8gXCIgKyB4KTtcblx0bGV0IHJvdGF0aW9uID0gY2hpbGQucm90YXRpb24gKyBjb250YWluZXIucm90YXRpb247XG5cdHJldHVybiBuZXcgQmFzaWNUcmFuc2Zvcm0oeCwgeSwgem9vbVgsIHpvb21ZLCByb3RhdGlvbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZSh0cmFuc2Zvcm06IFRyYW5zZm9ybSk6IFRyYW5zZm9ybSB7XG5cdHJldHVybiBuZXcgQmFzaWNUcmFuc2Zvcm0odHJhbnNmb3JtLngsIHRyYW5zZm9ybS55LCBcblx0XHR0cmFuc2Zvcm0uem9vbVgsIHRyYW5zZm9ybS56b29tWSwgdHJhbnNmb3JtLnJvdGF0aW9uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludmVydFRyYW5zZm9ybSh3b3JsZFN0YXRlOiBUcmFuc2Zvcm0pOiBUcmFuc2Zvcm0ge1xuXHRyZXR1cm4gbmV3IEJhc2ljVHJhbnNmb3JtKC13b3JsZFN0YXRlLngsIC13b3JsZFN0YXRlLnksIFxuXHRcdDEvd29ybGRTdGF0ZS56b29tWCwgMS93b3JsZFN0YXRlLnpvb21ZLCAtd29ybGRTdGF0ZS5yb3RhdGlvbik7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmlld1RyYW5zZm9ybSBleHRlbmRzIFRyYW5zZm9ybSB7XG5cdHdpZHRoOiBudW1iZXI7XG5cdGhlaWdodDogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgQmFzaWNWaWV3VHJhbnNmb3JtIGV4dGVuZHMgQmFzaWNUcmFuc2Zvcm0gaW1wbGVtZW50cyBWaWV3VHJhbnNmb3JtIHtcblxuXHRjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgXG5cdFx0cmVhZG9ubHkgd2lkdGg6IG51bWJlciwgcmVhZG9ubHkgaGVpZ2h0OiBudW1iZXIsXG5cdFx0em9vbVg6IG51bWJlciwgem9vbVk6IG51bWJlciwgXG5cdCAgICByb3RhdGlvbjogbnVtYmVyKXtcblxuXHRcdHN1cGVyKHgsIHksIHpvb21YLCB6b29tWSwgcm90YXRpb24pO1xuXHR9XG5cbn1cblxuXG5cbiIsImltcG9ydCB7IFZpZXdUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBDYW52YXNWaWV3IH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuXG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNb3VzZUNvbnRyb2xsZXIge1xuXG4gICAgbW91c2VQb3NpdGlvbihldmVudDogTW91c2VFdmVudCwgd2l0aGluOiBIVE1MRWxlbWVudCk6IEFycmF5PG51bWJlcj4ge1xuICAgICAgICBsZXQgbV9wb3N4ID0gZXZlbnQuY2xpZW50WCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0O1xuICAgICAgICBsZXQgbV9wb3N5ID0gZXZlbnQuY2xpZW50WSArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wXG4gICAgICAgICAgICAgICAgICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcblxuICAgICAgICB2YXIgZV9wb3N4ID0gMDtcbiAgICAgICAgdmFyIGVfcG9zeSA9IDA7XG5cbiAgICAgICAgaWYgKHdpdGhpbi5vZmZzZXRQYXJlbnQpe1xuICAgICAgICAgICAgZG8geyBcbiAgICAgICAgICAgICAgICBlX3Bvc3ggKz0gd2l0aGluLm9mZnNldExlZnQ7XG4gICAgICAgICAgICAgICAgZV9wb3N5ICs9IHdpdGhpbi5vZmZzZXRUb3A7XG4gICAgICAgICAgICB9IHdoaWxlICh3aXRoaW4gPSA8SFRNTEVsZW1lbnQ+d2l0aGluLm9mZnNldFBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW21fcG9zeCAtIGVfcG9zeCwgbV9wb3N5IC0gZV9wb3N5XTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIFZpZXdDb250cm9sbGVyIGV4dGVuZHMgTW91c2VDb250cm9sbGVyIHtcblxuXHRyZWNvcmQ6IGJvb2xlYW47XG5cdG1vdmU6IG51bWJlciA9IDE7XG5cblx0cHJpdmF0ZSB4UHJldmlvdXM6IG51bWJlcjtcblx0cHJpdmF0ZSB5UHJldmlvdXM6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3Rvcih2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtLCBcbiAgICAgICAgcmVhZG9ubHkgZHJhZ0VsZW1lbnQ6IEhUTUxFbGVtZW50LCByZWFkb25seSBjYW52YXNWaWV3OiBDYW52YXNWaWV3KSB7XG5cbiAgICBcdHN1cGVyKCk7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybSkpO1xuICAgIFx0ZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm0pKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybSkpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLnJlY29yZCA9IGZhbHNlKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5jbGlja2VkKGUgYXMgTW91c2VFdmVudCwgY2FudmFzVmlldywgMS4yKSk7XG4gICAgICAgIGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCAoZTogRXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy53aGVlbChlIGFzIFdoZWVsRXZlbnQsIGNhbnZhc1ZpZXcpKTtcbiAgICB9XG5cbiAgICBjbGlja2VkKGV2ZW50OiBNb3VzZUV2ZW50LCB2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtLCB6b29tQnk6IG51bWJlcil7XG4gICAgXHRzd2l0Y2goZXZlbnQudHlwZSl7XG4gICAgXHRcdGNhc2UgXCJkYmxjbGlja1wiOlxuICAgICAgICAgICAgICAgIGlmICAoZXZlbnQuY3RybEtleSkge1xuICAgICAgICAgICAgICAgICAgICB6b29tQnkgPSAxIC8gem9vbUJ5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsZXQgbVhZID0gdGhpcy5tb3VzZVBvc2l0aW9uKGV2ZW50LCB0aGlzLmRyYWdFbGVtZW50KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy56b29tQWJvdXQobVhZWzBdLCBtWFlbMV0sIHpvb21CeSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYWdnZWQoZXZlbnQ6IE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm06IFZpZXdUcmFuc2Zvcm0pIHtcblxuICAgIFx0c3dpdGNoKGV2ZW50LnR5cGUpe1xuICAgIFx0XHRjYXNlIFwibW91c2Vkb3duXCI6XG4gICAgXHRcdFx0dGhpcy5yZWNvcmQgPSB0cnVlO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwibW91c2V1cFwiOlxuICAgIFx0XHRcdHRoaXMucmVjb3JkID0gZmFsc2U7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGRlZmF1bHQ6XG4gICAgXHRcdFx0aWYgKHRoaXMucmVjb3JkKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHhEZWx0YSA9IChldmVudC5jbGllbnRYIC0gdGhpcy54UHJldmlvdXMpIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHlEZWx0YSA9IChldmVudC5jbGllbnRZIC0gdGhpcy55UHJldmlvdXMpIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWTtcblxuICAgICAgICAgICAgICAgICAgICB2aWV3VHJhbnNmb3JtLnggPSB2aWV3VHJhbnNmb3JtLnggLSB4RGVsdGE7XG4gICAgICAgICAgICAgICAgICAgIHZpZXdUcmFuc2Zvcm0ueSA9IHZpZXdUcmFuc2Zvcm0ueSAtIHlEZWx0YTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgIFx0XHRcdH1cblxuXHRcdFx0dGhpcy54UHJldmlvdXMgPSBldmVudC5jbGllbnRYO1xuXHRcdFx0dGhpcy55UHJldmlvdXMgPSBldmVudC5jbGllbnRZO1xuICAgIFx0fVxuICAgIH1cblxuICAgIHdoZWVsKGV2ZW50OiBXaGVlbEV2ZW50LCB2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtKSB7XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIndoZWVsXCIgKyBldmVudC50YXJnZXQgKyBcIiwgXCIgKyBldmVudC50eXBlKTtcblxuICAgICAgICBsZXQgeERlbHRhID0gZXZlbnQuZGVsdGFYIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWDtcbiAgICAgICAgbGV0IHlEZWx0YSA9IGV2ZW50LmRlbHRhWSAvIHRoaXMubW92ZSAvIHZpZXdUcmFuc2Zvcm0uem9vbVk7XG5cbiAgICAgICAgaWYgIChldmVudC5jdHJsS2V5KSB7XG4gICAgICAgICAgICBsZXQgbVhZID0gdGhpcy5tb3VzZVBvc2l0aW9uKGV2ZW50LCB0aGlzLmRyYWdFbGVtZW50KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBieSA9IDEuMDU7XG4gICAgICAgICAgICBpZiAoeURlbHRhIDwgMCl7XG4gICAgICAgICAgICAgICAgYnkgPSAwLjk1O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuem9vbUFib3V0KG1YWVswXSwgbVhZWzFdLCBieSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcueCA9ICB0aGlzLmNhbnZhc1ZpZXcueCArIHhEZWx0YTtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy55ID0gIHRoaXMuY2FudmFzVmlldy55ICsgeURlbHRhO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgIH1cblxufVxuIiwibW9kdWxlLmV4cG9ydHM9W1xuXHR7XG5cdFwibmFtZVwiOiBcIjItMlwiLCBcInhcIjogLTM2NCwgXCJ5XCI6IC0xMi41LCBcInpvb21YXCI6IDAuMjEzLCBcInpvb21ZXCI6IDAuMjA1LCBcInJvdGF0aW9uXCI6IC0wLjMxLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDJyXzJbU1ZDMl0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiM1wiLCBcInhcIjogLTIxNiwgXCJ5XCI6IC0wLjcwNSwgXCJ6b29tWFwiOiAwLjIsIFwiem9vbVlcIjogMC4yMSwgXCJyb3RhdGlvblwiOiAtMC41MSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDAzcltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI0XCIsIFwieFwiOiAtNzQuMjksIFwieVwiOiAtOTkuNzgsIFwiem9vbVhcIjogMC4yMjIsIFwiem9vbVlcIjogMC4yMDgsIFwicm90YXRpb25cIjogLTAuMjg1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDRyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjVcIiwgXCJ4XCI6IC0zNzUuNTU1LCBcInlcIjogMTgwLjUxOSwgXCJ6b29tWFwiOiAwLjIxNSwgXCJ6b29tWVwiOiAwLjIwNywgXCJyb3RhdGlvblwiOiAtMC4yMSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA1cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI2XCIsIFwieFwiOiAtMjE2LjE2LCBcInlcIjogMTQ2LCBcInpvb21YXCI6IDAuMjE4LCBcInpvb21ZXCI6IDAuMjE4LCBcInJvdGF0aW9uXCI6IC0wLjIyNSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA2cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI3XCIsIFwieFwiOiAtNjMuMywgXCJ5XCI6IDEwMC4zNzc2LCBcInpvb21YXCI6IDAuMjEyNSwgXCJ6b29tWVwiOiAwLjIxNywgXCJyb3RhdGlvblwiOiAtMC4yMywgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA3cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI4XCIsIFwieFwiOiA3OC4xLCBcInlcIjogNTguNTM1LCBcInpvb21YXCI6IDAuMjA3LCBcInpvb21ZXCI6IDAuMjE3LCBcInJvdGF0aW9uXCI6IC0wLjI1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDhyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjlcIiwgXCJ4XCI6IDIxOS41LCBcInlcIjogMjQsIFwiem9vbVhcIjogMC4yMTUsIFwiem9vbVlcIjogMC4yMTQ1LCBcInJvdGF0aW9uXCI6IC0wLjI2LFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwOXJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTBcIiwgXCJ4XCI6IDQ1NC4yMSwgXCJ5XCI6IC0xLjUsIFwiem9vbVhcIjogMC4yMTgsIFwiem9vbVlcIjogMC4yMTQsIFwicm90YXRpb25cIjogMC4wMTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxMHJfMltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxMVwiLCBcInhcIjogNjIxLjg2LCBcInlcIjogMjUuNTI1LCBcInpvb21YXCI6IDAuMjEzLCBcInpvb21ZXCI6IDAuMjExNSwgXCJyb3RhdGlvblwiOiAwLjExLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTFyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LCBcblx0e1xuXHRcIm5hbWVcIjogXCIxMi0xXCIsIFwieFwiOiA3NjkuNjQ1LCBcInlcIjogNTAuMjY1LCBcInpvb21YXCI6IDAuNDI0LCBcInpvb21ZXCI6IDAuNDIyLCBcInJvdGF0aW9uXCI6IDAuMTIsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxMnJfMVtTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxNFwiLCBcInhcIjogLTkxNS42LCBcInlcIjogNTU3Ljg2NSwgXCJ6b29tWFwiOiAwLjIwOCwgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAtMS4yMTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxNFJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTUtMlwiLCBcInhcIjogLTcxNy4zLCBcInlcIjogNTcyLCBcInpvb21YXCI6IDAuMjEsIFwiem9vbVlcIjogMC4yMDYsIFwicm90YXRpb25cIjogLTEuNDcsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxNXJfMltTVkMyXS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxNi0yXCIsIFwieFwiOiAtOTIsIFwieVwiOiAzMzIuNSwgXCJ6b29tWFwiOiAwLjIxNywgXCJ6b29tWVwiOiAwLjIxNCwgXCJyb3RhdGlvblwiOiAtMC4xLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTZyXzJbU1ZDMl0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTdcIiwgXCJ4XCI6IDg3LjUsIFwieVwiOiAyNzUsIFwiem9vbVhcIjogMC4yLCBcInpvb21ZXCI6IDAuMjA4LCBcInJvdGF0aW9uXCI6IC0wLjAyLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTdSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE4XCIsIFwieFwiOiAyMzIsIFwieVwiOiAyNDMsIFwiem9vbVhcIjogMC4yMDgsIFwiem9vbVlcIjogMC4yMDgsIFwicm90YXRpb25cIjogMC4wNywgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDE4UltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxOVwiLCBcInhcIjogNzEuNSwgXCJ5XCI6IDQ3NCwgXCJ6b29tWFwiOiAwLjIwMywgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAwLjE3LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTlSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjIwXCIsIFwieFwiOiA0My41LCBcInlcIjogNjQwLCBcInpvb21YXCI6IDAuMSwgXCJ6b29tWVwiOiAwLjEwNCwgXCJyb3RhdGlvblwiOiAwLjIwNSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDIwUltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fVxuXG5dXG5cblxuXG4iLCJtb2R1bGUuZXhwb3J0cz1bXG5cdHtcblx0XHRcIm5hbWVcIjogXCJoZW5yaWV0dGFcIiwgXCJ4XCI6IC00ODYuNSwgXCJ5XCI6IC0yNTIuNSwgXCJ6b29tWFwiOiAwLjI5LCBcInpvb21ZXCI6IDAuNSwgXCJyb3RhdGlvblwiOiAwLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvaGVucmlldHRhLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm1hdGVyXCIsIFwieFwiOiAtMzQyLCBcInlcIjogLTc0NywgXCJ6b29tWFwiOiAwLjA4LCBcInpvb21ZXCI6IDAuMTgsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9tYXRlcm1pcy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJwZXRlcnNcIiwgXCJ4XCI6IC03MTksIFwieVwiOiAtODM2LCBcInpvb21YXCI6IDAuMDcsIFwiem9vbVlcIjogMC4xNCwgXCJyb3RhdGlvblwiOiAtMC4xNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL3BldGVycy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJvY29ubmVsbFwiLCBcInhcIjogLTgyMSwgXCJ5XCI6IC0xODM1LCBcInpvb21YXCI6IDAuMjUsIFwiem9vbVlcIjogMC4yNSwgXCJyb3RhdGlvblwiOiAwLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3Mvb2Nvbm5lbGwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC45XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJmb3VyY291cnRzXCIsIFwieFwiOiAtNjA2LCBcInlcIjogMzAyLCBcInpvb21YXCI6IDAuMjMsIFwiem9vbVlcIjogMC40MywgXCJyb3RhdGlvblwiOiAtMC4wODUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9mb3VyY291cnRzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm1pY2hhbnNcIiwgXCJ4XCI6IC02MzksIFwieVwiOiAxNjAsIFwiem9vbVhcIjogMC4xNCwgXCJ6b29tWVwiOiAwLjI0LCBcInJvdGF0aW9uXCI6IDAuMDIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9taWNoYW5zLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwidGhlY2FzdGxlXCIsIFwieFwiOiAtMjkwLCBcInlcIjogNTIwLCBcInpvb21YXCI6IDAuMjIsIFwiem9vbVlcIjogMC40MiwgXCJyb3RhdGlvblwiOiAtMC4wMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy90aGVjYXN0bGUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibWFya2V0XCIsIFwieFwiOiAtNjE3LCBcInlcIjogNTY1LCBcInpvb21YXCI6IDAuMTUsIFwiem9vbVlcIjogMC4yNiwgXCJyb3RhdGlvblwiOiAwLjA0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbWFya2V0LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwicGF0cmlja3NcIiwgXCJ4XCI6IC00NjIsIFwieVwiOiA3OTUsIFwiem9vbVhcIjogMC4xLCBcInpvb21ZXCI6IDAuMTIsIFwicm90YXRpb25cIjogMC4wNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL3BhdHJpY2tzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibmdpcmVsYW5kXCIsIFwieFwiOiA0MDYsIFwieVwiOiA2ODQsIFwiem9vbVhcIjogMC4xOSwgXCJ6b29tWVwiOiAwLjQyLCBcInJvdGF0aW9uXCI6IC0wLjEwNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL25naXJlbGFuZC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjhcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImJsdWVjb2F0c1wiLCBcInhcIjogLTk5NywgXCJ5XCI6IDg2LCBcInpvb21YXCI6IDAuMSwgXCJ6b29tWVwiOiAwLjIsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9ibHVlY29hdHMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJjb2xsaW5zYmFycmFja3NcIiwgXCJ4XCI6IC0xMTMwLCBcInlcIjogOTAsIFwiem9vbVhcIjogMC4xMywgXCJ6b29tWVwiOiAwLjM3LCBcInJvdGF0aW9uXCI6IDAuMDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvY29sbGluc2JhcnJhY2tzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiaHVnaGxhbmVcIiwgXCJ4XCI6IC0xNzIsIFwieVwiOiAtMzM1LCBcInpvb21YXCI6IDAuMiwgXCJ6b29tWVwiOiAwLjMzLCBcInJvdGF0aW9uXCI6IC0wLjA2LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvaHVnaGxhbmUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJncG9cIiwgXCJ4XCI6IDUyLCBcInlcIjogNTAsIFwiem9vbVhcIjogMC4wODYsIFwiem9vbVlcIjogMC4yNSwgXCJyb3RhdGlvblwiOiAtMC4wMzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9ncG8ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtb3VudGpveVwiLCBcInhcIjogMjYzLCBcInlcIjogLTU2MCwgXCJ6b29tWFwiOiAwLjE1LCBcInpvb21ZXCI6IDAuMjg1LCBcInJvdGF0aW9uXCI6IDAuMTcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9tb3VudGpveS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm1vdW50am95YlwiLCBcInhcIjogMTUyLCBcInlcIjogLTU3MCwgXCJ6b29tWFwiOiAwLjIsIFwiem9vbVlcIjogMC4zMDUsIFwicm90YXRpb25cIjogMC4wNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21vdW50am95Yi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInJveWFsaG9zcGl0YWxcIiwgXCJ4XCI6IC0xODUxLCBcInlcIjogNDg3LjUsIFwiem9vbVhcIjogMC4yMSwgXCJ6b29tWVwiOiAwLjMsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9yb3lhbGhvc3BpdGFsLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwicGVwcGVyXCIsIFwieFwiOiA4MzQsIFwieVwiOiA5OTAsIFwiem9vbVhcIjogMC4wNiwgXCJ6b29tWVwiOiAwLjE0NSwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL3BlcHBlci5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImxpYmVydHloYWxsXCIsIFwieFwiOiAyNzAsIFwieVwiOiAtMTQsIFwiem9vbVhcIjogMC40MywgXCJ6b29tWVwiOiAwLjQzLCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbGliZXJ0eS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImN1c3RvbXNob3VzZVwiLCBcInhcIjogMzgyLCBcInlcIjogMTA3LCBcInpvb21YXCI6IDAuMTUsIFwiem9vbVlcIjogMC4zMCwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2N1c3RvbXNob3VzZS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fVxuXSIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMzJcIiwgXCJ4XCI6IC03NzYsIFwieVwiOiAzMi41NSwgXCJ6b29tWFwiOiAwLjI5LCBcInpvb21ZXCI6IDAuMjgsIFwicm90YXRpb25cIjogLTEuNDcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0wMzItbS5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQ29uc3RpdHV0aW9uIEhpbGwgLSBUdXJucGlrZSwgR2xhc25ldmluIFJvYWQ7IHNob3dpbmcgcHJvcG9zZWQgcm9hZCB0byBCb3RhbmljIEdhcmRlbnNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA3MlwiLCBcInhcIjogLTI1MiwgXCJ5XCI6IC0yNDcsIFwiem9vbVhcIjogMC4zMTgsIFwiem9vbVlcIjogMC4zMTQsIFwicm90YXRpb25cIjogMS41ODUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0wNzItbS5wbmdcIiwgXCJ2aXNpYmlsZVwiOiBmYWxzZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBvZiBpbXByb3ZpbmcgdGhlIHN0cmVldHMgYmV0d2VlbiBSaWNobW9uZCBCcmlkZ2UgKEZvdXIgQ291cnRzKSBhbmQgQ29uc3RpdHV0aW9uIEhpbGwgKEtpbmfigJlzIElubnMpIERhdGU6IDE4MzdcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA3NVwiLCBcInhcIjogLTIxNy41LCBcInlcIjogLTE0MTQuNSwgXCJ6b29tWFwiOiAwLjg3LCBcInpvb21ZXCI6IDAuNzcyLCBcInJvdGF0aW9uXCI6IDEuNjE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMDc1LW0yLnBuZ1wiLCBcInZpc2liaWxlXCI6IGZhbHNlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTdXJ2ZXkgb2YgYSBsaW5lIG9mIHJvYWQsIGxlYWRpbmcgZnJvbSBMaW5lbiBIYWxsIHRvIEdsYXNuZXZpbiBSb2FkLCBzaG93aW5nIHRoZSBSb3lhbCBDYW5hbCBEYXRlOiAxODAwXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wODgtMVwiLCBcInhcIjogLTAuOSwgXCJ5XCI6IDIuNjcsIFwiem9vbVhcIjogMC41LCBcInpvb21ZXCI6IDAuNSwgXCJyb3RhdGlvblwiOiAtMy4zMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTA4OC0xLmpwZ1wiLCBcInZpc2liaWxlXCI6IGZhbHNlLCBcIm9wYWNpdHlcIjogMC4wXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTA2LTFcIiwgXCJ4XCI6IC03NTcsIFwieVwiOiA0OTUuNSwgXCJ6b29tWFwiOiAwLjI2NSwgXCJ6b29tWVwiOiAwLjI2NSwgXCJyb3RhdGlvblwiOiAtMC4wNzQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0xMDYtMS5qcGdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMS4wLCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIHNob3dpbmcgcHJvcG9zZWQgaW1wcm92ZW1lbnRzIHRvIGJlIG1hZGUgaW4gQ29ybm1hcmtldCwgQ3V0cHVyc2UgUm93LCBMYW1iIEFsbGV5IC0gRnJhbmNpcyBTdHJlZXQgLSBhbmQgYW4gaW1wcm92ZWQgZW50cmFuY2UgZnJvbSBLZXZpbiBTdHJlZXQgdG8gU2FpbnQgUGF0cmlja+KAmXMgQ2F0aGVkcmFsLCB0aHJvdWdoIE1pdHJlIEFsbGV5IGFuZCBhdCBKYW1lc+KAmXMgR2F0ZS4gRGF0ZTogMTg0NS00NiBcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE0MlwiLCBcInhcIjogOTQuOTk1LCBcInlcIjogMjM3Ny41LCBcInpvb21YXCI6IDAuNDgyLCBcInpvb21ZXCI6IDAuNDc2LCBcInJvdGF0aW9uXCI6IC0yLjAxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE0Mi1sLnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxLjAsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiB0aGUgTmV3IFN0cmVldHMsIGFuZCBvdGhlciBpbXByb3ZlbWVudHMgaW50ZW5kZWQgdG8gYmUgaW1tZWRpYXRlbHkgZXhlY3V0ZWQuIFNpdHVhdGUgb24gdGhlIFNvdXRoIFNpZGUgb2YgdGhlIENpdHkgb2YgRHVibGluLCBzdWJtaXR0ZWQgZm9yIHRoZSBhcHByb2JhdGlvbiBvZiB0aGUgQ29tbWlzc2lvbmVycyBvZiBXaWRlIFN0cmVldHMsIHBhcnRpY3VsYXJseSBvZiB0aG9zZSBwYXJ0cyBiZWxvbmdpbmcgdG8gV20uIENvcGUgYW5kIEpvaG4gTG9ja2VyLCBFc3EuLCBIYXJjb3VydCBTdHJlZXQsIENoYXJsZW1vdW50IFN0cmVldCwgUG9ydG9iZWxsbywgZXRjLiBEYXRlOiAxNzkyXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNTVcIiwgXCJ4XCI6IC0xNTA2LCBcInlcIjogLTUwLjUsIFwiem9vbVhcIjogMS4wMSwgXCJ6b29tWVwiOiAwLjk3MiwgXCJyb3RhdGlvblwiOiAtMC4wMjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0xNTUtbS5wbmdcIiwgXCJ2aXNpYmlsZVwiOiBmYWxzZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTmV3IGFwcHJvYWNoIGZyb20gTWlsaXRhcnkgUm9hZCB0byBLaW5n4oCZcyBCcmlkZ2UsIGFuZCBhbG9uZyB0aGUgUXVheXMgdG8gQXN0b27igJlzIFF1YXkgRGF0ZTogMTg0MVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTU3LTNcIiwgXCJ4XCI6IDMuMTE1LCBcInlcIjogMy42NSwgXCJ6b29tWFwiOiAwLjUyNSwgXCJ6b29tWVwiOiAwLjU5LCBcInJvdGF0aW9uXCI6IDAuNTQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0xNTctMy1tLnBuZ1wiLCBcInZpc2liaWxlXCI6IGZhbHNlLCBcIm9wYWNpdHlcIjogMC4wLCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwic2hvd2luZyB0aGUgaW1wcm92ZW1lbnRzIHByb3Bvc2VkIGJ5IHRoZSBDb21taXNzaW9uZXJzIG9mIFdpZGUgU3RyZWV0cyBpbiBOYXNzYXUgU3RyZWV0LCBMZWluc3RlciBTdHJlZXQgYW5kIENsYXJlIFN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTY0XCIsIFwieFwiOiAtNDcyLCBcInlcIjo4MDUsIFwiem9vbVhcIjogMC4wNTYsIFwiem9vbVlcIjogMC4wNTYsIFwicm90YXRpb25cIjogMC4wOSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE2NC1sLnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxLjAsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIFNhaW50IFBhdHJpY2vigJlzLCBldGMuIERhdGU6IDE4MjRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE4NC0xXCIsIFwieFwiOiAtMi4yNywgXCJ5XCI6IDUuOTUsIFwiem9vbVhcIjogMC40LCBcInpvb21ZXCI6IDAuNCwgXCJyb3RhdGlvblwiOiAwLjAzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE4NC0xLWZyb250LmpwZ1wiLCBcInZpc2liaWxlXCI6IGZhbHNlLCBcIm9wYWNpdHlcIjogMC4wXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDMzLTJcIiwgXCJ4XCI6IC0yLjg0NiwgXCJ5XCI6IDYuMTI1LCBcInpvb21YXCI6IDAuMTk5LCBcInpvb21ZXCI6IDAuMjA1LCBcInJvdGF0aW9uXCI6IC0wLjAyNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTQzMy0yLmpwZ1wiLCBcInZpc2liaWxlXCI6IGZhbHNlLCBcIm9wYWNpdHlcIjogMC4wXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDY3LTAyXCIsIFwieFwiOiAxLjg0NSwgXCJ5XCI6IDguMTIsIFwiem9vbVhcIjogMC44MywgXCJ6b29tWVwiOiAwLjgzLCBcInJvdGF0aW9uXCI6IC0yLjcyNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTQ2Ny0wMi5qcGdcIiwgXCJ2aXNpYmlsZVwiOiBmYWxzZSwgXCJvcGFjaXR5XCI6IDAuMFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ2OS0wMlwiLCBcInhcIjogMjU1LCBcInlcIjogMTM4OS41LCBcInpvb21YXCI6IDAuMjQ1LCBcInpvb21ZXCI6IDAuMjQ1LCBcInJvdGF0aW9uXCI6IC0yLjc1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNDY5LTItbS5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRWFybHNmb3J0IFRlcnJhY2UsIFN0ZXBoZW7igJlzIEdyZWVuIFNvdXRoIGFuZCBIYXJjb3VydCBTdHJlZXQgc2hvd2luZyBwbGFuIG9mIHByb3Bvc2VkIG5ldyBzdHJlZXRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM1NS0xXCIsIFwieFwiOiA2OTYsIFwieVwiOiA3MTMuNSwgXCJ6b29tWFwiOiAwLjMyMywgXCJ6b29tWVwiOiAwLjI4OSwgXCJyb3RhdGlvblwiOiAxLjE0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM1NS0xLnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIEJhZ2dvdCBTdHJlZXQgYW5kIEZpdHp3aWxsaWFtIFN0cmVldCwgc2hvd2luZyBhdmVudWVzIHRoZXJlb2YgTm8uIDEgRGF0ZTogMTc5MFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNzI5XCIsIFwieFwiOiAtMTA4OC41LCBcInlcIjogNjUyLCBcInpvb21YXCI6IDAuMTg0LCBcInpvb21ZXCI6IDAuMTg0LCBcInJvdGF0aW9uXCI6IC0zLjQyNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTcyOS5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gSmFtZXPigJlzIFN0cmVldCwgQmFzb24gTGFuZSwgRWNobGlu4oCZcyBMYW5lLCBHcmFuZCBDYW5hbCBQbGFjZSwgQ2l0eSBCYXNvbiBhbmQgR3JhbmQgQ2FuYWwgSGFyYm91clwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNzU3XCIsIFwieFwiOiAtODgxLCBcInlcIjogMjYxLjUsIFwiem9vbVhcIjogMC4zNTUsIFwiem9vbVlcIjogMC4zNTUsIFwicm90YXRpb25cIjogLTAuMDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNzU3LWwucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcImZvdXIgY291cnRzIHRvIHN0IHBhdHJpY2tzLCB0aGUgY2FzdGxlIHRvIHRob21hcyBzdHJlZXRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTEzOFwiLCBcInhcIjogMjEyLjUsIFwieVwiOiAxNDcsIFwiem9vbVhcIjogMC4xOSwgXCJ6b29tWVwiOiAwLjE3NiwgXCJyb3RhdGlvblwiOiAwLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTM4LWwucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHByZW1pc2VzLCBHZW9yZ2XigJlzIFF1YXksIENpdHkgUXVheSwgVG93bnNlbmQgU3RyZWV0IGFuZCBuZWlnaGJvdXJob29kLCBzaG93aW5nIHByb3BlcnR5IGxvc3QgdG8gdGhlIENpdHksIGluIGEgc3VpdCBieSAnVGhlIENvcnBvcmF0aW9uIC0gd2l0aCBUcmluaXR5IENvbGxlZ2UnXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xODlcIiwgXCJ4XCI6IC03OTIuNSwgXCJ5XCI6IDI2Mi41LCBcInpvb21YXCI6IDAuMjYsIFwiem9vbVlcIjogMC4yNTgsIFwicm90YXRpb25cIjogMC4wMDMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTg5LnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNvcHkgb2YgbWFwIG9mIHByb3Bvc2VkIE5ldyBTdHJlZXQgZnJvbSBFc3NleCBTdHJlZXQgdG8gQ29ybm1hcmtldCwgd2l0aCB0aGUgZW52aXJvbnMgYW5kIHN0cmVldHMgYnJhbmNoaW5nIG9mZlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDk4XCIsIFwieFwiOiAtNDc1LCBcInlcIjogNTI0LCBcInpvb21YXCI6IDAuMDYzLCBcInpvb21ZXCI6IDAuMDYzLCBcInJvdGF0aW9uXCI6IC0wLjE2LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMDk4LnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBDaHJpc3RjaHVyY2gsIFNraW5uZXJzIFJvdyBldGMuIFRob21hcyBTaGVycmFyZCwgNSBKYW51YXJ5IDE4MjEgRGF0ZTogMTgyMVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTEyXCIsIFwieFwiOiAtMjk4LCBcInlcIjogMzM5LjUsIFwiem9vbVhcIjogMC4xODUsIFwiem9vbVlcIjogMC4xODUsIFwicm90YXRpb25cIjogLTAuMjU1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTExMi5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJEYW1lIFN0cmVldCwgZnJvbSB0aGUgY29ybmVyIG9mIFBhbGFjZSBTdHJlZXQgdG8gdGhlIGNvcm5lciBvZiBHZW9yZ2XigJlzIFN0cmVldCAtIGxhaWQgb3V0IGluIGxvdHMgZm9yIGJ1aWxkaW5nIE5vcnRoIGFuZCBTb3V0aCBhbmQgdmljaW5pdHkgRGF0ZTogMTc4MlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjAyXCIsIFwieFwiOiAxNiwgXCJ5XCI6IDgxLCBcInpvb21YXCI6IDAuMjg5LCBcInpvb21ZXCI6IDAuMjYzLCBcInJvdGF0aW9uXCI6IC0wLjEwNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yMDItYy5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJhcmVhIGltbWVkaWF0ZWx5IG5vcnRoIG9mIFJpdmVyIExpZmZleSBmcm9tIFNhY2t2aWxsZSBTdCwgTG93ZXIgQWJiZXkgU3QsIEJlcmVzZm9yZCBQbGFjZSwgYXMgZmFyIGFzIGVuZCBvZiBOb3J0aCBXYWxsLiBBbHNvIHNvdXRoIG9mIExpZmZleSBmcm9tIFdlc3Rtb3JsYW5kIFN0cmVldCB0byBlbmQgb2YgSm9obiBSb2dlcnNvbidzIFF1YXlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE3OVwiLCBcInhcIjogLTUzNy41LCBcInlcIjogNzMwLCBcInpvb21YXCI6IDAuMTY4LCBcInpvb21ZXCI6IDAuMTY0LCBcInJvdGF0aW9uXCI6IDAuMDIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTc5LnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxLjAsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlNhaW50IFBhdHJpY2vigJlzIENhdGhlZHJhbCwgTm9ydGggQ2xvc2UgYW5kIHZpY2luaXR5XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMjlcIiwgXCJ4XCI6IC02NzgsIFwieVwiOiAzNDUuNSwgXCJ6b29tWFwiOiAwLjMzNiwgXCJ6b29tWVwiOiAwLjMzNiwgXCJyb3RhdGlvblwiOiAtMC4yMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzI5LnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gZm9yIG9wZW5pbmcgYW5kIHdpZGVuaW5nIGEgcHJpbmNpcGFsIEF2ZW51ZSB0byB0aGUgQ2FzdGxlLCBub3cgKDE5MDApIFBhcmxpYW1lbnQgU3RyZWV0IC0gc2hvd2luZyBEYW1lIFN0cmVldCwgQ2FzdGxlIFN0cmVldCwgYW5kIGFsbCB0aGUgQXZlbnVlcyB0aGVyZW9mIERhdGU6IDE3NTdcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE4N1wiLCBcInhcIjogLTIyNiwgXCJ5XCI6IDQ5NC41LCBcInpvb21YXCI6IDAuMDY2LCBcInpvb21ZXCI6IDAuMDY0LCBcInJvdGF0aW9uXCI6IDAuMCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xODcucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDEuMCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQSBzdXJ2ZXkgb2Ygc2V2ZXJhbCBob2xkaW5ncyBpbiBTb3V0aCBHcmVhdCBHZW9yZ2UncyBTdHJlZXQgLSB0b3RhbCBwdXJjaGFzZSDCozExNTI4LjE2LjMgRGF0ZToxODAxXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMjRcIiwgXCJ4XCI6IC0yNzksIFwieVwiOiAzNjYsIFwiem9vbVhcIjogMC4wNTcsIFwiem9vbVlcIjogMC4wNTEsIFwicm90YXRpb25cIjogLTAuMTYsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTI0LmpwZWdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcHJlbWlzZXMgaW4gRXNzZXggU3RyZWV0IGFuZCBQYXJsaWFtZW50IFN0cmVldCwgc2hvd2luZyBFc3NleCBCcmlkZ2UgYW5kIE9sZCBDdXN0b20gSG91c2UuIFQuIGFuZCBELkguIFNoZXJyYXJkIERhdGU6IDE4MTNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM2MFwiLCBcInhcIjogLTE0NCwgXCJ5XCI6IDQyMS41LCBcInpvb21YXCI6IDAuMTIxLCBcInpvb21ZXCI6IDAuMTA3LCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM2MC5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBEYW1lIFN0cmVldCBhbmQgYXZlbnVlcyB0aGVyZW9mIC0gRXVzdGFjZSBTdHJlZXQsIENlY2lsaWEgU3RyZWV0LCBhbmQgc2l0ZSBvZiBPbGQgVGhlYXRyZSwgRm93bmVzIFN0cmVldCwgQ3Jvd24gQWxsZXkgYW5kIENvcGUgU3RyZWV0IERhdGU6IDE3OTJcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM2MlwiLCBcInhcIjogMzgsIFwieVwiOiA4Ny41LCBcInpvb21YXCI6IDAuMjMzLCBcInpvb21ZXCI6IDAuMjMzLCBcInJvdGF0aW9uXCI6IDAuMTIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzYyLTEucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwcyAtIENvbGxlZ2UgR3JlZW4sIENvbGxlZ2UgU3RyZWV0LCBXZXN0bW9yZWxhbmQgU3RyZWV0IGFuZCBhdmVudWVzIHRoZXJlb2YsIHNob3dpbmcgdGhlIHNpdGUgb2YgUGFybGlhbWVudCBIb3VzZSBhbmQgVHJpbml0eSBDb2xsZWdlIE5vLiAxIERhdGU6IDE3OTNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM4MFwiLCBcInhcIjogMjQxLjUsIFwieVwiOiAyODYsIFwiem9vbVhcIjogMC4wMzMsIFwiem9vbVlcIjogMC4wMzMsIFwicm90YXRpb25cIjogMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zODAtMS5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBGbGVldCBNYXJrZXQsIFBvb2xiZWcgU3RyZWV0LCBIYXdraW5zIFN0cmVldCwgVG93bnNlbmQgU3RyZWV0LCBGbGVldCBTdHJlZXQsIER1YmxpbiBTb2NpZXR5IFN0b3JlcyBEYXRlOiAxODAwXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zODdcIiwgXCJ4XCI6IDI4MCwgXCJ5XCI6IDQyMy41LCBcInpvb21YXCI6IDAuMDgzLCBcInpvb21ZXCI6IDAuMDc3LCBcInJvdGF0aW9uXCI6IDMuMDM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM4Ny5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTdXJ2ZXkgb2YgaG9sZGluZ3MgaW4gRmxlZXQgU3RyZWV0IGFuZCBDb2xsZWdlIFN0cmVldCwgc2hvd2luZyBzaXRlIG9mIE9sZCBXYXRjaCBIb3VzZSBEYXRlOiAxODAxXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xOTlcIiwgXCJ4XCI6IDg3OC41LCBcInlcIjogMTIxNy41LCBcInpvb21YXCI6IDAuMjQxLCBcInpvb21ZXCI6IDAuMjQxLCBcInJvdGF0aW9uXCI6IDIuMTE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE5OS0xLnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjYsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwYXJ0IG9mIHRoZSBlc3RhdGUgb2YgdGhlIEhvbi4gU2lkbmV5IEhlcmJlcnQsIGNhbGxlZCBXaWx0b24gUGFyYWRlLCBzaG93aW5nIHRoZSBwcm9wb3NlZCBhcHByb3ByaWF0aW9uIHRoZXJlb2YgaW4gc2l0ZXMgZm9yIGJ1aWxkaW5nLiBBbHNvIHNob3dpbmcgQmFnZ290IFN0cmVldCwgR3JhbmQgQ2FuYWwgYW5kIEZpdHp3aWxsaWFtIFBsYWNlLlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjE4XCIsIFwieFwiOiAtMjQ1NSwgXCJ5XCI6IC0yODQuNSwgXCJ6b29tWFwiOiAwLjQ1MywgXCJ6b29tWVwiOiAwLjQ1MSwgXCJyb3RhdGlvblwiOiAtMC4wNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yMTgucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIHRoZSBMb25nIE1lYWRvd3MgYW5kIHBhcnQgb2YgdGhlIFBob2VuaXggUGFyayBhbmQgUGFya2dhdGUgU3RyZWV0IERhdGU6IDE3ODZcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTIyOVwiLCBcInhcIjogLTIzODQsIFwieVwiOiA1NS41LCBcInpvb21YXCI6IDAuMzc5LCBcInpvb21ZXCI6IDAuMzc5LCBcInJvdGF0aW9uXCI6IDAuMDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTIyOS5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTZWN0aW9uIGFjcm9zcyB0aGUgcHJvcG9zZWQgUm9hZCBmcm9tIHRoZSBQYXJrIEdhdGUgdG8gSXNsYW5kIEJyaWRnZSBHYXRlIC0gbm93ICgxOTAwKSBDb255bmdoYW0gUm9hZCBEYXRlOiAxNzg5XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yNDJcIiwgXCJ4XCI6IC00MDUuNSwgXCJ5XCI6IDIxLCBcInpvb21YXCI6IDAuMDg0LCBcInpvb21ZXCI6IDAuMDg0LCBcInJvdGF0aW9uXCI6IDEuMDg1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTI0Mi0yLnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiBhIGhvbGRpbmcgaW4gTWFyeeKAmXMgTGFuZSwgdGhlIGVzdGF0ZSBvZiB0aGUgUmlnaHQgSG9ub3VyYWJsZSBMb3JkIE1vdW50am95IERhdGU6IDE3OTNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTI0NVwiLCBcInhcIjogLTIxMC4wLCBcInlcIjotMzk3LjUsIFwiem9vbVhcIjogMC4wODQsIFwiem9vbVlcIjogMC4wODQsIFwicm90YXRpb25cIjogLTAuNjIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjQ1LTIucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBCYXJsZXkgRmllbGRzIGV0Yy4sIGFuZCBhIHBsYW4gZm9yIG9wZW5pbmcgYSBzdHJlZXQgZnJvbSBSdXRsYW5kIFNxdWFyZSwgRG9yc2V0IFN0cmVldCwgYmVpbmcgbm93ICgxODk5KSBrbm93biBhcyBTb3V0aCBGcmVkZXJpY2sgU3RyZWV0IC0gd2l0aCByZWZlcmVuY2UgRGF0ZTogMTc4OVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjU3XCIsIFwieFwiOiA2ODEuMCwgXCJ5XCI6LTEyMjMuNSwgXCJ6b29tWFwiOiAwLjM0NiwgXCJ6b29tWVwiOiAwLjM4OCwgXCJyb3RhdGlvblwiOiAwLjI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTI1Ny5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgQ2xvbmxpZmZlIFJvYWQgYW5kIHRoZSBPbGQgVHVybnBpa2UgSG91c2UgYXQgQmFsbHlib3VnaCBCcmlkZ2UgLSBOb3J0aCBTdHJhbmQgRGF0ZTogMTgyM1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjY4XCIsIFwieFwiOiAtMTUyOC4wLCBcInlcIjogMTA1LjUsIFwiem9vbVhcIjogMC4wODYsIFwiem9vbVlcIjogMC4wODYsIFwicm90YXRpb25cIjogMC4wNywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yNjgtMy5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBQYXJrZ2F0ZSBTdHJlZXQsIENvbnluZ2hhbSBSb2FkLCB3aXRoIHJlZmVyZW5jZSB0byBuYW1lcyBvZiB0ZW5hbnRzIGVuZG9yc2VkIE5vLiAzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNzFcIiwgXCJ4XCI6IDExMi4wLCBcInlcIjogMTgxLjUsIFwiem9vbVhcIjogMC4wMjEsIFwiem9vbVlcIjogMC4wMjEsIFwicm90YXRpb25cIjogLTAuMjY1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE3MS0yLmpwZWdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgTG93ZXIgQWJiZXkgU3RyZWV0LCB0byBjb3JuZXIgb2YgRWRlbiBRdWF5IChTYWNrdmlsbGUgU3RyZWV0KSBEYXRlOiAxODEzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMDlcIiwgXCJ4XCI6IDM2LjAsIFwieVwiOiAtMjk3LCBcInpvb21YXCI6IDAuMjE5LCBcInpvb21ZXCI6IDAuMjE5LCBcInJvdGF0aW9uXCI6IC0wLjQzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zMDkucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGFydCBvZiBHYXJkaW5lciBTdHJlZXQgYW5kIHBhcnQgb2YgR2xvdWNlc3RlciBTdHJlZXQsIGxhbmQgb3V0IGluIGxvdHMgZm9yIGJ1aWxkaW5nIC0gc2hvd2luZyBHbG91Y2VzdGVyIFN0cmVldCwgR2xvdWNlc3RlciBQbGFjZSwgdGhlIERpYW1vbmQsIFN1bW1lciBIaWxsLCBHcmVhdCBCcml0YWluIFN0cmVldCwgQ3VtYmVybGFuZCBTdHJlZXQsIE1hcmxib3Jv4oCZIFN0cmVldCwgTWFiYm90IFN0cmVldCwgTWVja2xpbmJ1cmdoIGV0Yy5EYXRlOiAxNzkxXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yOTRcIiwgXCJ4XCI6IDEyNS4wLCBcInlcIjogLTExOCwgXCJ6b29tWFwiOiAwLjEyOSwgXCJ6b29tWVwiOiAwLjEyOSwgXCJyb3RhdGlvblwiOiAtMC4xOTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0yOTQtMi5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTdXJ2ZXkgb2YgcGFydCBvZiB0aGUgTG9yZHNoaXAgb2YgU2FpbnQgTWFyeeKAmXMgQWJiZXkgLSBwYXJ0IG9mIHRoZSBlc3RhdGUgb2YgdGhlIFJpZ2h0IEhvbm9yYWJsZSBMdWtlIFZpc2NvdW50IE1vdW50am95LCBzb2xkIHRvIFJpY2hhcmQgRnJlbmNoIEVzcS4sIHB1cnN1YW50IHRvIGEgRGVjcmVlIG9mIEhpcyBNYWplc3R54oCZcyBIaWdoIENvdXJ0IG9mIENoYW5jZXJ5LCAxNyBGZWIgMTc5NFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzEwXCIsIFwieFwiOiA0NzQuMCwgXCJ5XCI6IC04MjEuNSwgXCJ6b29tWFwiOiAwLjU3NiwgXCJ6b29tWVwiOiAwLjU3NiwgXCJyb3RhdGlvblwiOiAwLjE0NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zMTAucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTm9ydGggTG90cyAtIGZyb20gdGhlIE5vcnRoIFN0cmFuZCBSb2FkLCB0byB0aGUgTm9ydGggYW5kIEVhc3QgV2FsbHMgRGF0ZTogMTc5M1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzI1XCIsIFwieFwiOiAtODkzLjAsIFwieVwiOiA0MSwgXCJ6b29tWFwiOiAwLjI4NiwgXCJ6b29tWVwiOiAwLjI4NiwgXCJyb3RhdGlvblwiOiAwLjAzLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMyNS5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTbWl0aGZpZWxkLCBBcnJhbiBRdWF5LCBIYXltYXJrZXQsIFdlc3QgQXJyYW4gU3RyZWV0LCBOZXcgQ2h1cmNoIFN0cmVldCwgQm93IExhbmUsIEJvdyBTdHJlZXQsIE1heSBMYW5lXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMjYtMVwiLCBcInhcIjogLTE0MTUuNSwgXCJ5XCI6IDExMi41LCBcInpvb21YXCI6IDAuMTE0LCBcInpvb21ZXCI6IDAuMTEyLCBcInJvdGF0aW9uXCI6IDAuMTcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzI2LTEucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQmFycmFjayBTdHJlZXQsIFBhcmsgU3RyZWV0LCBQYXJrZ2F0ZSBTdHJlZXQgYW5kIFRlbXBsZSBTdHJlZXQsIHdpdGggcmVmZXJlbmNlIHRvIG5hbWVzIG9mIHRlbmFudHMgYW5kIHByZW1pc2VzIE5vLiAxXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMjYtMlwiLCBcInhcIjogLTEyNTcuNSwgXCJ5XCI6IDE0My41LCBcInpvb21YXCI6IDAuMSwgXCJ6b29tWVwiOiAwLjEsIFwicm90YXRpb25cIjogMC4wNzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzI2LTIucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQmFycmFjayBTdHJlZXQsIFBhcmsgU3RyZWV0LCBQYXJrZ2F0ZSBTdHJlZXQgYW5kIFRlbXBsZSBTdHJlZXQsIHdpdGggcmVmZXJlbmNlIHRvIG5hbWVzIG9mIHRlbmFudHMgYW5kIHByZW1pc2VzXCJcblx0fVxuXVxuIiwiaW1wb3J0IHsgQ2FudmFzVmlldyB9IGZyb20gXCIuL2d0d28vY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgU3RhdGljSW1hZ2UgfSBmcm9tIFwiLi9ndHdvL3N0YXRpY1wiO1xuaW1wb3J0IHsgQ29udGFpbmVyTGF5ZXIgfSBmcm9tIFwiLi9ndHdvL2xheWVyXCI7XG5pbXBvcnQgeyBCYXNpY1RyYW5zZm9ybSB9IGZyb20gXCIuL2d0d28vdmlld1wiO1xuaW1wb3J0IHsgU3RhdGljR3JpZCB9IGZyb20gXCIuL2d0d28vZ3JpZFwiO1xuaW1wb3J0IHsgVmlld0NvbnRyb2xsZXIgfSBmcm9tIFwiLi9ndHdvL3ZpZXdjb250cm9sbGVyXCI7XG5pbXBvcnQgeyBJbWFnZUNvbnRyb2xsZXIsIERpc3BsYXlFbGVtZW50Q29udHJvbGxlciB9IGZyb20gXCIuL2d0d28vaW1hZ2Vjb250cm9sbGVyXCI7XG5pbXBvcnQgeyBUaWxlTGF5ZXIsIFRpbGVTdHJ1Y3QsIHpvb21CeUxldmVsfSBmcm9tIFwiLi9ndHdvL3RpbGVsYXllclwiO1xuaW1wb3J0IHsgTGF5ZXJNYW5hZ2VyIH0gZnJvbSBcIi4vZ3R3by9sYXllcm1hbmFnZXJcIjtcblxuaW1wb3J0ICogYXMgZmlyZW1hcHMgZnJvbSBcIi4vaW1hZ2Vncm91cHMvZmlyZW1hcHMuanNvblwiO1xuaW1wb3J0ICogYXMgbGFuZG1hcmtzIGZyb20gXCIuL2ltYWdlZ3JvdXBzL2xhbmRtYXJrcy5qc29uXCI7XG5pbXBvcnQgKiBhcyB3c2MgZnJvbSBcIi4vaW1hZ2Vncm91cHMvd3NjLmpzb25cIjtcblxubGV0IGxheWVyU3RhdGUgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgMSwgMSwgMCk7XG5sZXQgaW1hZ2VMYXllciA9IG5ldyBDb250YWluZXJMYXllcihsYXllclN0YXRlKTtcblxubGV0IGltYWdlU3RhdGUgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oLTE0NDAsLTE0NDAsIDAuMjIyLCAwLjIyMiwgMCk7XG5cbmxldCBjb3VudHlTdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtMjYzMSwgLTIwNTEuNSwgMS43MTYsIDEuNjc0LCAwKTtcbmxldCBjb3VudHlJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZShjb3VudHlTdGF0ZSwgXCJpbWFnZXMvQ291bnR5X29mX3RoZV9DaXR5X29mX0R1Ymxpbl8xODM3X21hcC5wbmdcIiwgMC41KTtcblxubGV0IGJnU3RhdGUgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oLTExMjYsLTEwODYsIDEuNTgsIDEuNTUsIDApO1xubGV0IGJnSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoYmdTdGF0ZSwgXCJpbWFnZXMvZm1zcy5qcGVnXCIsIC43KTtcblxubGV0IGdyaWRUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgMSwgMSwgMCk7XG5sZXQgc3RhdGljR3JpZCA9IG5ldyBTdGF0aWNHcmlkKGdyaWRUcmFuc2Zvcm0sIDAsIDUxMiwgNTEyKTtcblxubGV0IHNlbnRpbmVsU3RydWN0ID0gbmV3IFRpbGVTdHJ1Y3QoXCJxdGlsZS9kdWJsaW4vXCIsIFwiLnBuZ1wiLCBcImltYWdlcy9xdGlsZS9kdWJsaW4vXCIpO1xuXG5sZXQgc2VudGluZWxUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgMiwgMiwgMCk7XG5sZXQgc2VudGluZWxMYXllciA9IG5ldyBUaWxlTGF5ZXIoc2VudGluZWxUcmFuc2Zvcm0sIHNlbnRpbmVsU3RydWN0LCAxNTgxNCwgMTA2MjEsIDE1KTtcbi8vbGV0IHNlbnRpbmVsTGF5ZXIgPSBuZXcgVGlsZUxheWVyKEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0sIHNlbnRpbmVsU3RydWN0LCAzMTYyOCwgMjEyNDIsIDE2KTtcblxuaW1hZ2VMYXllci5zZXQoXCJjb3VudHlcIiwgY291bnR5SW1hZ2UpO1xuaW1hZ2VMYXllci5zZXQoXCJiYWNrZ3JvdW5kXCIsIGJnSW1hZ2UpO1xuXG5sZXQgbGF5ZXJNYW5hZ2VyID0gbmV3IExheWVyTWFuYWdlcigpO1xuXG5sZXQgZmlyZW1hcExheWVyID0gbGF5ZXJNYW5hZ2VyLmFkZExheWVyKGZpcmVtYXBzLCBcImZpcmVtYXBzXCIpO1xubGV0IGxhbmRtYXJrc0xheWVyID0gbGF5ZXJNYW5hZ2VyLmFkZExheWVyKGxhbmRtYXJrcywgXCJsYW5kbWFya3NcIik7XG5sZXQgd3NjTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkTGF5ZXIod3NjLCBcIndzY1wiKTtcblxubGV0IGVkaXQgPSB3c2NMYXllci5nZXQoXCJ3c2MtMzI5XCIpO1xuXG5pbWFnZUxheWVyLnNldChcIndzY1wiLCB3c2NMYXllcik7XG5pbWFnZUxheWVyLnNldChcImZpcmVtYXBzXCIsIGZpcmVtYXBMYXllcik7XG5pbWFnZUxheWVyLnNldChcImxhbmRtYXJrc1wiLCBsYW5kbWFya3NMYXllcik7XG5cbmZ1bmN0aW9uIHNob3dNYXAoZGl2TmFtZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGl2TmFtZSk7XG4gICAgbGV0IGNhbnZhc1RyYW5zZm9ybSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtNTEyLCAtNTEyLCAwLjUsIDAuNSwgMCk7XG4gICAgbGV0IGNhbnZhc1ZpZXcgPSBuZXcgQ2FudmFzVmlldyhjYW52YXNUcmFuc2Zvcm0sIGNhbnZhcy5jbGllbnRXaWR0aCwgY2FudmFzLmNsaWVudEhlaWdodCwgY2FudmFzKTtcblxuICAgIGNhbnZhc1ZpZXcubGF5ZXJzLnB1c2goc2VudGluZWxMYXllcik7XG4gICAgY2FudmFzVmlldy5sYXllcnMucHVzaChpbWFnZUxheWVyKTtcbiAgICBjYW52YXNWaWV3LmxheWVycy5wdXNoKHN0YXRpY0dyaWQpO1xuXG4gICAgbGV0IHRpbGVDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBzZW50aW5lbExheWVyLCBcInZcIik7XG4gICAgbGV0IGJhc2VDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBiZ0ltYWdlLCBcIkJcIik7XG4gICAgbGV0IGNvdW50eUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGNvdW50eUltYWdlLCBcIlZcIik7XG4gICAgbGV0IGZpcmVtYXBDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBmaXJlbWFwTGF5ZXIsIFwiYlwiKTtcbiAgICBsZXQgd3NjQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgd3NjTGF5ZXIsIFwiblwiKTtcbiAgICBsZXQgbGFuZG1hcmtDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBsYW5kbWFya3NMYXllciwgXCJtXCIpO1xuXG4gICAgbGV0IGNvbnRyb2xsZXIgPSBuZXcgVmlld0NvbnRyb2xsZXIoY2FudmFzVmlldywgY2FudmFzLCBjYW52YXNWaWV3KTtcblxuICAgIGxldCBpbWFnZUNvbnRyb2xsZXIgPSBuZXcgSW1hZ2VDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGVkaXQpO1xuXG4gICAgZHJhd01hcChjYW52YXNWaWV3KTtcblxufVxuXG5mdW5jdGlvbiBkcmF3TWFwKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcpe1xuICAgIGlmICghY2FudmFzVmlldy5kcmF3KCkgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiSW4gdGltZW91dFwiKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpeyBkcmF3TWFwKGNhbnZhc1ZpZXcpfSwgNTAwKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNob3coKXtcblx0c2hvd01hcChcImNhbnZhc1wiLCBcIlR5cGVTY3JpcHRcIik7XG59XG5cbmlmIChcbiAgICBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgfHxcbiAgICAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gXCJsb2FkaW5nXCIgJiYgIWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5kb1Njcm9sbClcbikge1xuXHRzaG93KCk7XG59IGVsc2Uge1xuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBzaG93KTtcbn0iXX0=
