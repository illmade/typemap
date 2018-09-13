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

},{"./view":9}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const layer_1 = require("./layer");
/**
* We don't want to draw a grid into a transformed canvas as this gives us grid lines that are too
thick or too thin
*/
class StaticGrid extends layer_1.DrawLayer {
    constructor(localTransform, zoomLevel, visible, gridWidth = 256, gridHeight = 256) {
        super(localTransform, 1, visible);
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
        document.addEventListener("keypress", (e) => this.pressed(canvasView, e));
        this.canvasLayer = canvasLayer;
    }
    setCanvasLayer(canvasLayer) {
        this.canvasLayer = canvasLayer;
    }
    pressed(canvasView, event) {
        console.log("pressed" + event.target + ", " + event.key);
        let multiplier = 1;
        switch (event.key) {
            case "a":
                this.canvasLayer.x = this.canvasLayer.x - 0.5 * multiplier;
                canvasView.draw();
                break;
            case "A":
                this.canvasLayer.x = this.canvasLayer.x - 5 * multiplier;
                canvasView.draw();
                break;
            case "d":
                this.canvasLayer.x = this.canvasLayer.x + 0.5 * multiplier;
                canvasView.draw();
                break;
            case "D":
                this.canvasLayer.x = this.canvasLayer.x + 5 * multiplier;
                canvasView.draw();
                break;
            case "w":
                this.canvasLayer.y = this.canvasLayer.y - 0.5 * multiplier;
                canvasView.draw();
                break;
            case "W":
                this.canvasLayer.y = this.canvasLayer.y - 5 * multiplier;
                canvasView.draw();
                break;
            case "s":
                this.canvasLayer.y = this.canvasLayer.y + 0.5 * multiplier;
                canvasView.draw();
                break;
            case "S":
                this.canvasLayer.y = this.canvasLayer.y + 5 * multiplier;
                canvasView.draw();
                break;
            case "e":
                this.canvasLayer.rotation = this.canvasLayer.rotation - 0.005;
                canvasView.draw();
                break;
            case "E":
                this.canvasLayer.rotation = this.canvasLayer.rotation - 0.05;
                canvasView.draw();
                break;
            case "q":
                this.canvasLayer.rotation = this.canvasLayer.rotation + 0.005;
                canvasView.draw();
                break;
            case "Q":
                this.canvasLayer.rotation = this.canvasLayer.rotation + 0.05;
                canvasView.draw();
                break;
            case "x":
                this.canvasLayer.zoomX = this.canvasLayer.zoomX - 0.002 * multiplier;
                canvasView.draw();
                break;
            case "X":
                this.canvasLayer.zoomX = this.canvasLayer.zoomX + 0.002 * multiplier;
                canvasView.draw();
                break;
            case "z":
                this.canvasLayer.zoomY = this.canvasLayer.zoomY - 0.002 * multiplier;
                canvasView.draw();
                break;
            case "Z":
                this.canvasLayer.zoomY = this.canvasLayer.zoomY + 0.002 * multiplier;
                canvasView.draw();
                break;
            case "c":
                this.canvasLayer.setVisible(!this.canvasLayer.visible);
                canvasView.draw();
                break;
            case "T":
                this.canvasLayer.opacity = Math.min(1.0, this.canvasLayer.opacity + 0.1);
                canvasView.draw();
                break;
            case "t":
                this.canvasLayer.opacity = Math.max(0, this.canvasLayer.opacity - 0.1);
                canvasView.draw();
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
        this.displayLayers = [];
    }
    set(name, layer) {
        this.layerMap.set(name, layer);
        this.displayLayers.push(layer);
    }
    get(name) {
        return this.layerMap.get(name);
    }
    setTop(name) {
        let topLayer = this.get(name);
        this.displayLayers = this.displayLayers.filter(function (element) {
            if (element == topLayer) {
                return false;
            }
            else {
                return true;
            }
        });
        this.displayLayers.push(topLayer);
    }
    draw(ctx, parentTransform, view) {
        let layerTransform = view_1.combineTransform(this.localTransform, parentTransform);
        var drawingComplete = true;
        for (let layer of this.displayLayers) {
            if (layer.isVisible()) {
                drawingComplete = drawingComplete && layer.draw(ctx, layerTransform, view);
            }
        }
        return drawingComplete;
    }
}
exports.ContainerLayer = ContainerLayer;

},{"./view":9}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LayerController {
    constructor(canvasView, containerLayerManager) {
        this.containerLayerManager = containerLayerManager;
        this.mod = "i";
        document.addEventListener("keypress", (e) => this.pressed(canvasView, e));
    }
    pressed(canvasView, event) {
        switch (event.key) {
            case this.mod:
                console.log("toggle visible");
                this.containerLayerManager.toggleVisibility(false);
                canvasView.draw();
                break;
        }
    }
}
exports.LayerController = LayerController;

},{}],6:[function(require,module,exports){
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
    getLayer(name) {
        return this.layerMap.get(name);
    }
}
exports.LayerManager = LayerManager;
class ContainerLayerManager {
    constructor(layerContainer) {
        this.layerContainer = layerContainer;
    }
    setLayerContainer(layerContainer) {
        this.layerContainer = layerContainer;
    }
    setSelected(name) {
        this.selected = name;
    }
    toggleVisibility(selected = true) {
        let toggleGroup = [];
        if (selected) {
            if (this.selected != "") {
                toggleGroup.push(this.layerContainer.layerMap.get(this.selected));
            }
        }
        else {
            for (let pair of this.layerContainer.layerMap) {
                //console.log("layerName: " + pair[0]);
                if (pair[0] != this.selected) {
                    toggleGroup.push(pair[1]);
                }
                else {
                    console.log("layerName: " + this.selected);
                }
            }
        }
        for (let element of toggleGroup) {
            element.setVisible(!element.isVisible());
        }
    }
}
exports.ContainerLayerManager = ContainerLayerManager;

},{"./layer":4,"./static":7,"./view":9}],7:[function(require,module,exports){
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
        if (this.isVisible()) {
            let ctxTransform = view_1.combineTransform(this, parentTransform);
            //console.log("ctx x " + ctxTransform.x);
            this.prepareCtx(ctx, ctxTransform, view);
            ctx.globalAlpha = this.opacity;
            ctx.drawImage(this.img, 0, 0);
            ctx.globalAlpha = 1;
            this.cleanCtx(ctx, ctxTransform, view);
        }
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

},{"./layer":4,"./view":9}],8:[function(require,module,exports){
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

},{"./layer":4,"./view":9}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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




},{}],12:[function(require,module,exports){
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
		"name": "fourcourts", "x": -567.5, "y": 323.5, "zoomX": 0.16, "zoomY": 0.328, "rotation": -0.12, 
		"src": "images/landmarks/fourcourts.png", "visible": true, "opacity": 0.8
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
		"name": "ngireland", "x": 431, "y": 694, "zoomX": 0.14, "zoomY": 0.375, "rotation": -0.135, 
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
},{}],13:[function(require,module,exports){
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
		"name": "wsc-361", "x": 464, "y": 2131, "zoomX": 0.436, "zoomY": 0.436, "rotation": -2.04, 
		"src": "images/wsc/wsc-361.png", "visibile": true, "opacity": 0.7,
		"description": "Leeson Street, Portland Street (now Upper Leeson Street), Eustace Place, Eustace Bridge (now Leeson Street), Hatch Street, Circular Road - signed by Commissioners of Wide Streets Date: 1792"
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
		"src": "images/wsc/wsc-329.png", "visibile": true, "opacity": 0.3,
		"description": "Plan for opening and widening a principal Avenue to the Castle, now (1900) Parliament Street - showing Dame Street, Castle Street, and all the Avenues thereof Date: 1757"
	},
	{
		"name": "wsc-187", "x": -226, "y": 494.5, "zoomX": 0.066, "zoomY": 0.064, "rotation": 0.0, 
		"src": "images/wsc/wsc-187.png", "visibile": true, "opacity": 1.0,
		"description": "A survey of several holdings in South Great George's Street - total purchase £11528.16.3 Date:1801"
	},
	{
		"name": "wsc-124", "x": -279, "y": 366, "zoomX": 0.057, "zoomY": 0.051, "rotation": -0.16, 
		"src": "images/wsc/wsc-124.png", "visibile": true, "opacity": 0.4,
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
		"name": "wsc-387", "x": 280, "y": 423.5, "zoomX": 0.083, "zoomY": 0.077, "rotation": 3.035, 
		"src": "images/wsc/wsc-387.png", "visibile": true, "opacity": 0.4,
		"description": "Survey of holdings in Fleet Street and College Street, showing site of Old Watch House Date: 1801"
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
		"name": "wsc-380", "x": 241.5, "y": 286, "zoomX": 0.033, "zoomY": 0.033, "rotation": 0.05, 
		"src": "images/wsc/wsc-380-1.png", "visibile": true, "opacity": 0.4,
		"description": "Map - Fleet Market, Poolbeg Street, Hawkins Street, Townsend Street, Fleet Street, Dublin Society Stores Date: 1800"
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
	},
	{
		"name": "wsc-334", "x": 90.5, "y": 357, "zoomX": 0.128, "zoomY": 0.128, "rotation": 1.265, 
		"src": "images/wsc/wsc-334.png", "visibile": true, "opacity": 0.5,
		"description": "Dame Street, College Green, George’s Lane, George’s Street, Chequer Street and avenues thereof"
	},
	{
		"name": "wsc-112", "x": -298, "y": 339.5, "zoomX": 0.185, "zoomY": 0.185, "rotation": -0.255, 
		"src": "images/wsc/wsc-112.png", "visibile": true, "opacity": 0.1,
		"description": "Dame Street, from the corner of Palace Street to the corner of George’s Street - laid out in lots for building North and South and vicinity Date: 1782"
	},
	{
		"name": "wsc-355-2", "x": 185, "y": 1029, "zoomX": 0.302, "zoomY": 0.302, "rotation": -0.45, 
		"src": "images/wsc/wsc-355-2.png", "visibile": true, "opacity": 0.7,
		"description": "Plan of Baggot Street and Fitzwilliam Street, showing avenues thereof No. 2 Date: 1792"
	},
	{
		"name": "wsc-368", "x": -687.5, "y": 277.5, "zoomX": 0.156, "zoomY": 0.15, "rotation": 0.12, 
		"src": "images/wsc/wsc-368.png", "visibile": true, "opacity": 0.7,
		"description": "Map of King’s Inn Quay and Merchants Quay, showing site of Ormond Bridge - below Charles Street - afterwards removed and re-erected opposite Winetavern Street Date: 1797"
	},
	{
		"name": "wsc-372", "x": 341.5, "y": 296.5, "zoomX": 0.036, "zoomY": 0.0339, "rotation": 2.955, 
		"src": "images/wsc/wsc-372.png", "visibile": true, "opacity": 0.7,
		"description": "George's Quay, Whites Lane, and Hawkins Street, showing site of Sweetman's Brewery which ran down to River Liffey Date: 1799"
	},
	{
		"name": "wsc-390-1", "x": -804.5, "y": 420, "zoomX": 0.204, "zoomY": 0.202, "rotation": -0.07, 
		"src": "images/wsc/wsc-390-1.png", "visibile": true, "opacity": 0.5,
		"description": "Plan of proposed Market House, adjoining Thomas Street, Vicar Street, Market Street and Francis Street Date: 1801"
	},
	{
		"name": "wsc-395-3", "x": -588, "y": 578, "zoomX": 0.036, "zoomY": 0.036, "rotation": -3.65, 
		"src": "images/wsc/wsc-395-3.png", "visibile": true, "opacity": 0.5,
		"description": "New Row and Cutpurse Row Date: 1800"
	},
	{
		"name": "wsc-404", "x": -15, "y": 379, "zoomX": 0.064, "zoomY": 0.064, "rotation": -0.32, 
		"src": "images/wsc/wsc-404.png", "visibile": true, "opacity": 0.5,
		"description": "Anglesea Street and Parliament House Date: 1802"
	},
	{
		"name": "wsc-411", "x": 343.5, "y": 657, "zoomX": 0.086, "zoomY": 0.086, "rotation": 0.325,
		"src": "images/wsc/wsc-411.png", "visibile": true, "opacity": 0.5,
		"description": "Leinster House and part of the estate of Viscount Fitzwilliam (formerly Leinster Lawn), laid out in lots for building - showing Kildare Street, Upper Merrion Street and Leinster Place (Street), Merrion Place, and the Old Boundary between Leinster and Lord Fitzwilliam - taken from a map signed Robert Gibson, May 18, 1754 Date: 1812"
	},
	{
		"name": "wsc-251", "x": 220, "y": 64, "zoomX": 0.236, "zoomY": 0.236, "rotation": -1.49,
		"src": "images/wsc/wsc-251.png", "visibile": true, "opacity": 0.5,
		"description": "Map of portion of City, showing Montgomery Street, Mecklinburgh Street, Lower Gloucester Street and portion of Mabbot Street"
	},
	{
		"name": "wsc-413", "x": -373, "y": 806.5, "zoomX": 0.078, "zoomY": 0.076, "rotation": -0.15,
		"src": "images/wsc/wsc-413.png", "visibile": true, "opacity": 0.5,
		"description": "Peter Street, Peter’s Row, Whitefriar Street, Wood Street and Bride Street - showing site of the Amphitheatre in Bride Street, where the Moleyneux Church now (1900) stands Date: 1812"
	},
	{
		"name": "wsc-414", "x": -194.5, "y": 364.5, "zoomX": 0.072, "zoomY": 0.074, "rotation": -0.24,
		"src": "images/wsc/wsc-414.png", "visibile": true, "opacity": 0.5,
		"description": "Temple Bar, Wellington Quay, Old Custom House, Bagnio Slip etc. Date: 1813"
	},
	{
		"name": "wsc-421", "x": -474.5, "y": 527, "zoomX": 0.062, "zoomY": 0.06, "rotation": -0.185,
		"src": "images/wsc/wsc-421.png", "visibile": true, "opacity": 0.6,
		"description": "Map of the precincts of Christ Church Dublin, showing Skinners Row, to which is attached a Memorandum denominating the premises, taken by the Commissioners of Wide Streets for the purpose of widening said Skinners Row, now (1900) known as Christ Church Place Date: 1817"
	},
	{ 
		"name": "wsc-408-2", "x": -397.5, "y": 545.5, "zoomX": 0.044, "zoomY": 0.044, "rotation": -0.12, 
		"src": "images/wsc/wsc-408-2.png", "visibile": true, "opacity": 0.5,
		"description": "Werburgh Street, Skinners Row, Fishamble Street and Castle Street Date: c. 1810"
	},
	{
		"name": "wsc-425-1", "x": -917.5, "y": 577.5, "zoomX": 0.045, "zoomY": 0.046, "rotation": -1.425, 
		"src": "images/wsc/wsc-425-1.png", "visibile": true, "opacity": 0.5,
		"description": "Meath Row, Mark’s Alley and Dirty Lane - showing Bridgefoot Street, Mass Lane, Thomas Street and St. Catherine’s Church Date: 1820-24"
	},
	{
		"name": "wsc-426", "x": -735.5, "y": 578.5, "zoomX": 0.034, "zoomY": 0.034, "rotation": 1.565, 
		"src": "images/wsc/wsc-426.png", "visibile": true, "opacity": 0.5,
		"description": "Map of several houses and premises on the East side of Meath Row, the property of Mr. John Walsh - showing the situation of Thomas Street, Hanbury Lane and site of Chapel Date: 1821"
	},
	{
		"name": "wsc-112-1", "x": -303, "y": 332.5, "zoomX": 0.188, "zoomY": 0.188, "rotation": -0.24, 
		"src": "images/wsc/wsc-112-1.png", "visibile": false, "opacity": 0.1,
		"description": "Dame Street, from the corner of Palace Street to the corner of George’s Street - laid out in lots for building North and South and vicinity Date: 1782"
	},
	{
		"name": "wsc-455", "x": 635.5, "y": 1258, "zoomX": 0.263, "zoomY": 0.263, "rotation": -0.9, 
		"src": "images/wsc/wsc-455.png", "visibile": true, "opacity": 0.6,
		"description": "Herbert Place and Avenues adjacent to Upper Mount Street, showing Upper Baggot Street - Herbert Street, Warrington Place and Percy Place, Northumberland Road and Lower Mount Street Date: 1833"
	},
	{
		"name": "wsc-199", "x": 878.5, "y": 1217.5, "zoomX": 0.241, "zoomY": 0.241, "rotation": 2.115, 
		"src": "images/wsc/wsc-199-1.png", "visibile": true, "opacity": 0.6,
		"description": "Map of part of the estate of the Hon. Sidney Herbert, called Wilton Parade, showing the proposed appropriation thereof in sites for building. Also showing Baggot Street, Grand Canal and Fitzwilliam Place."
	},
	{
		"name": "wsc-465", "x": 301.5, "y": 711.5, "zoomX": 0.207, "zoomY": 0.207, "rotation": 3.3, 
		"src": "images/wsc/wsc-465.png", "visibile": true, "opacity": 0.6,
		"description": "Grafton Street, Nassau Street (South side) and Dawson Street Date: 1837"
	},
	{
		"name": "wsc-480-2", "x": -65, "y": 377, "zoomX": 0.07, "zoomY": 0.07, "rotation": -0.045, 
		"src": "images/wsc/wsc-480-2.png", "visibile": true, "opacity": 0.6,
		"description": "North side of College Green showing Avenues thereof, and ground plan of Parliament House, Anglesea Street, Blackmoor Yard etc. - with reference giving tenants, names of premises required or purpose of improvement. Date: 1786"
	},
	{
		"name": "wsc-491", "x": -21.5, "y": 938, "zoomX": 0.164, "zoomY": 0.164, "rotation": -3.08, 
		"src": "images/wsc/wsc-491.png", "visibile": true, "opacity": 0.8,
		"description": "Aungier Street, Mercer Street, York Street and Avenues thereof, viz: - French Street (Mercer Street), Bow Lane, Digges Lane, Stephen Street, Drury Lane, Great and Little Longford Streets"
	},
	{
		"name": "wsc-496", "x": -278, "y": 456, "zoomX": 0.018, "zoomY": 0.018, "rotation": -3.26, 
		"src": "images/wsc/wsc-496.png", "visibile": true, "opacity": 0.7,
		"description": "Essex Quay, Change Alley, Smock Alley and ground plan of Smock Alley Theatre"
	},
	{
		"name": "wsc-507", "x": -273.5, "y": 350.4, "zoomX": 0.087, "zoomY": 0.0859, "rotation": -0.215, 
		"src": "images/wsc/wsc-507.png", "visibile": true, "opacity": 0.7,
		"description": "Essex Street, Parliament Street, showing Old Custom House Quay, Lower Ormond Quay and Dame Street"
	},
	{
		"name": "wsc-423-2", "x": 34.5, "y": 478.5, "zoomX": 0.078, "zoomY": 0.082, "rotation": -3.215, 
		"src": "images/wsc/wsc-423-2.png", "visibile": true, "opacity": 0.5,
		"description": "Crown Alley, Cope Street, Ardill’s Row, Temple Bar, Aston’s Quay and Wellington Quay No. 2 Date: 1820-5"
	}
]

},{}],14:[function(require,module,exports){
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
const layercontroller_1 = require("./gtwo/layercontroller");
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
let staticGrid = new grid_1.StaticGrid(gridTransform, 0, false, 256, 256);
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
let edit = firemapLayer.get("17");
let containerLayerManager = new layermanager_1.ContainerLayerManager(firemapLayer);
containerLayerManager.setSelected("17");
imageLayer.set("firemaps", firemapLayer);
imageLayer.set("wsc", wscLayer);
imageLayer.set("landmarks", landmarksLayer);
wscLayer.setTop("17");
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
    let gridController = new imagecontroller_1.DisplayElementController(canvasView, staticGrid, "g");
    let controller = new viewcontroller_1.ViewController(canvasView, canvas, canvasView);
    let imageController = new imagecontroller_1.ImageController(canvasView, edit);
    let layerController = new layercontroller_1.LayerController(canvasView, containerLayerManager);
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

},{"./gtwo/canvasview":1,"./gtwo/grid":2,"./gtwo/imagecontroller":3,"./gtwo/layer":4,"./gtwo/layercontroller":5,"./gtwo/layermanager":6,"./gtwo/static":7,"./gtwo/tilelayer":8,"./gtwo/view":9,"./gtwo/viewcontroller":10,"./imagegroups/firemaps.json":11,"./imagegroups/landmarks.json":12,"./imagegroups/wsc.json":13}]},{},[14])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ3R3by9jYW52YXN2aWV3LnRzIiwic3JjL2d0d28vZ3JpZC50cyIsInNyYy9ndHdvL2ltYWdlY29udHJvbGxlci50cyIsInNyYy9ndHdvL2xheWVyLnRzIiwic3JjL2d0d28vbGF5ZXJjb250cm9sbGVyLnRzIiwic3JjL2d0d28vbGF5ZXJtYW5hZ2VyLnRzIiwic3JjL2d0d28vc3RhdGljLnRzIiwic3JjL2d0d28vdGlsZWxheWVyLnRzIiwic3JjL2d0d28vdmlldy50cyIsInNyYy9ndHdvL3ZpZXdjb250cm9sbGVyLnRzIiwic3JjL2ltYWdlZ3JvdXBzL2ZpcmVtYXBzLmpzb24iLCJzcmMvaW1hZ2Vncm91cHMvbGFuZG1hcmtzLmpzb24iLCJzcmMvaW1hZ2Vncm91cHMvd3NjLmpzb24iLCJzcmMvc2ltcGxlV29ybGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0NBLGlDQUtnQztBQVNoQyxNQUFhLFVBQVcsU0FBUSx5QkFBa0I7SUFLakQsWUFDQyxjQUF5QixFQUN6QixLQUFhLEVBQUUsTUFBYyxFQUNwQixhQUFnQztRQUV6QyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQ3RELGNBQWMsQ0FBQyxLQUFLLEVBQUUsY0FBYyxDQUFDLEtBQUssRUFDMUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBSmpCLGtCQUFhLEdBQWIsYUFBYSxDQUFtQjtRQU4xQyxXQUFNLEdBQXVCLEVBQUUsQ0FBQztRQVkvQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFbEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRCxTQUFTLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxNQUFjO1FBRXZDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7UUFDakMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztRQUVqQyxJQUFJLFNBQVMsR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUMvQixJQUFJLFNBQVMsR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUUvQixJQUFJLE1BQU0sR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNwQyxJQUFJLE1BQU0sR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUVwQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7SUFFaEMsQ0FBQztJQUVELElBQUk7UUFDSCxJQUFJLFNBQVMsR0FBRyxzQkFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXRDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztRQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWpELElBQUksZUFBZSxHQUFHLElBQUksQ0FBQztRQUUzQixLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUM7WUFDN0IsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQUM7Z0JBQ3JCLGVBQWUsR0FBRyxlQUFlLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLHFCQUFjLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQzlGO1NBRUQ7UUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUUxQixPQUFPLGVBQWUsQ0FBQztJQUN4QixDQUFDO0lBRUQsVUFBVSxDQUFDLE9BQWlDO1FBQ3JDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNwQixPQUFPLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQztRQUMxQixPQUFPLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUM1QixPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxFQUFFLEdBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQy9DLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFDLEVBQUUsR0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUMsRUFBRSxHQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBQyxFQUFFLEdBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9DLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNqQixPQUFPLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQztRQUM5QixPQUFPLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUksVUFBVTtRQUNYLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDO1FBQzNDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDO1FBRTdDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNqQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDMUMsQ0FBQztDQUVEO0FBNUVELGdDQTRFQzs7Ozs7QUMzRkQsbUNBQW9DO0FBR3BDOzs7RUFHRTtBQUNGLE1BQWEsVUFBVyxTQUFRLGlCQUFTO0lBS3hDLFlBQVksY0FBeUIsRUFBRSxTQUFpQixFQUFFLE9BQWdCLEVBQ2hFLFlBQW9CLEdBQUcsRUFBVyxhQUFxQixHQUFHO1FBRW5FLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRnpCLGNBQVMsR0FBVCxTQUFTLENBQWM7UUFBVyxlQUFVLEdBQVYsVUFBVSxDQUFjO1FBSW5FLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQztRQUNsQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUM7SUFDckMsQ0FBQztJQUVELElBQUksQ0FBQyxHQUE2QixFQUFFLFNBQW9CLEVBQUUsSUFBbUI7UUFFNUUsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2xDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUVsQyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDeEMsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBRTFDLElBQUksVUFBVSxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzVDLElBQUksUUFBUSxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBRTVDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0MsSUFBSSxLQUFLLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUMvQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUQsSUFBSSxNQUFNLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUVoRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzlDLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDL0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzlELElBQUksT0FBTyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUU7UUFFbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBRTlDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUVoQixLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLElBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFDO1lBQy9CLDRCQUE0QjtZQUM1QixJQUFJLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQzVDLEdB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VSxDQUFDO2dCQUMzRCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDRCxLQUFLLEdBQUc7Z0JBQ0osSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQztnQkFDekQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ2hCLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsVUFBVSxDQUFDO2dCQUMzRCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDRCxLQUFLLEdBQUc7Z0JBQ0osSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQztnQkFDekQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1YsS0FBSyxHQUFHO2dCQUNKLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1YsS0FBSyxHQUFHO2dCQUNKLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDN0QsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1YsS0FBSyxHQUFHO2dCQUNKLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1YsS0FB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QUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztZQUNoRCxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7U0FDbkQ7UUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzNCLENBQUM7Q0FFSjtBQTVGRCx3Q0E0RkM7OztBQ3ZIRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDN1VBLGtEQUErQztBQUMvQyww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c291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgeyBDYW52YXNMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBcblx0aW52ZXJ0VHJhbnNmb3JtLCBcblx0Vmlld1RyYW5zZm9ybSwgXG5cdEJhc2ljVmlld1RyYW5zZm9ybSwgXG5cdFRyYW5zZm9ybSwgXG5cdEJhc2ljVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIERpc3BsYXlFbGVtZW50IGV4dGVuZHMgVHJhbnNmb3JtIHtcblx0aXNWaXNpYmxlKCk6IGJvb2xlYW47XG5cdHNldFZpc2libGUodmlzaWJsZTogYm9vbGVhbik6IHZvaWQ7XG5cdGdldE9wYWNpdHkoKTogbnVtYmVyO1xuXHRzZXRPcGFjaXR5KG9wYWNpdHk6IG51bWJlcik6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBDYW52YXNWaWV3IGV4dGVuZHMgQmFzaWNWaWV3VHJhbnNmb3JtIHtcblxuXHRsYXllcnM6IEFycmF5PENhbnZhc0xheWVyPiA9IFtdO1xuXHRjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHR3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgXG5cdFx0cmVhZG9ubHkgY2FudmFzRWxlbWVudDogSFRNTENhbnZhc0VsZW1lbnQpe1xuXG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0ueCwgbG9jYWxUcmFuc2Zvcm0ueSwgd2lkdGgsIGhlaWdodCwgXG5cdFx0XHRsb2NhbFRyYW5zZm9ybS56b29tWCwgbG9jYWxUcmFuc2Zvcm0uem9vbVksIFxuXHRcdFx0bG9jYWxUcmFuc2Zvcm0ucm90YXRpb24pO1xuXG5cdFx0dGhpcy5pbml0Q2FudmFzKCk7XG5cblx0XHR0aGlzLmN0eCA9IGNhbnZhc0VsZW1lbnQuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHR9XG5cblx0em9vbUFib3V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB6b29tQnk6IG51bWJlcil7XG5cbiAgICAgICAgdGhpcy56b29tWCA9IHRoaXMuem9vbVggKiB6b29tQnk7XG4gICAgICAgIHRoaXMuem9vbVkgPSB0aGlzLnpvb21ZICogem9vbUJ5O1xuXG4gICAgICAgIGxldCByZWxhdGl2ZVggPSB4ICogem9vbUJ5IC0geDtcbiAgICAgICAgbGV0IHJlbGF0aXZlWSA9IHkgKiB6b29tQnkgLSB5O1xuXG4gICAgICAgIGxldCB3b3JsZFggPSByZWxhdGl2ZVggLyB0aGlzLnpvb21YO1xuICAgICAgICBsZXQgd29ybGRZID0gcmVsYXRpdmVZIC8gdGhpcy56b29tWTtcblxuICAgICAgICB0aGlzLnggPSB0aGlzLnggKyB3b3JsZFg7XG4gICAgICAgIHRoaXMueSA9IHRoaXMueSArIHdvcmxkWTtcblxuXHR9XG5cblx0ZHJhdygpOiBib29sZWFuIHtcblx0XHRsZXQgdHJhbnNmb3JtID0gaW52ZXJ0VHJhbnNmb3JtKHRoaXMpO1xuXG5cdFx0dGhpcy5jdHguZmlsbFN0eWxlID0gXCJncmV5XCI7XG5cdFx0dGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXG5cdFx0dmFyIGRyYXdpbmdDb21wbGV0ZSA9IHRydWU7XG5cblx0XHRmb3IgKGxldCBsYXllciBvZiB0aGlzLmxheWVycyl7XG5cdFx0XHRpZiAobGF5ZXIuaXNWaXNpYmxlKCkpe1xuXHRcdFx0XHRkcmF3aW5nQ29tcGxldGUgPSBkcmF3aW5nQ29tcGxldGUgJiYgbGF5ZXIuZHJhdyh0aGlzLmN0eCwgQmFzaWNUcmFuc2Zvcm0udW5pdFRyYW5zZm9ybSwgdGhpcyk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9XG5cblx0XHR0aGlzLmRyYXdDZW50cmUodGhpcy5jdHgpO1xuXG5cdFx0cmV0dXJuIGRyYXdpbmdDb21wbGV0ZTtcblx0fVxuXG5cdGRyYXdDZW50cmUoY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKXtcbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IDAuMztcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKHRoaXMud2lkdGgvMiwgNi8xNip0aGlzLmhlaWdodCk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKHRoaXMud2lkdGgvMiwgMTAvMTYqdGhpcy5oZWlnaHQpO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyg3LzE2KnRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LzIpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyg5LzE2KnRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LzIpO1xuICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gXCJibGFja1wiO1xuICAgICAgICBjb250ZXh0Lmdsb2JhbEFscGhhID0gMTtcbiAgICB9XG5cblx0cHJpdmF0ZSBpbml0Q2FudmFzKCl7XG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMuY2FudmFzRWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgbGV0IGhlaWdodCA9IHRoaXMuY2FudmFzRWxlbWVudC5jbGllbnRIZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC5oZWlnaHQgPSBoZWlnaHQ7XG5cdH1cblxufSIsImltcG9ydCB7IERyYXdMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBUcmFuc2Zvcm0sIFZpZXdUcmFuc2Zvcm0sIGNvbWJpbmVUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5cbi8qKlxuKiBXZSBkb24ndCB3YW50IHRvIGRyYXcgYSBncmlkIGludG8gYSB0cmFuc2Zvcm1lZCBjYW52YXMgYXMgdGhpcyBnaXZlcyB1cyBncmlkIGxpbmVzIHRoYXQgYXJlIHRvb1xudGhpY2sgb3IgdG9vIHRoaW5cbiovXG5leHBvcnQgY2xhc3MgU3RhdGljR3JpZCBleHRlbmRzIERyYXdMYXllciB7XG5cblx0em9vbVdpZHRoOiBudW1iZXI7XG5cdHpvb21IZWlnaHQ6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3Rvcihsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCB6b29tTGV2ZWw6IG51bWJlciwgdmlzaWJsZTogYm9vbGVhbixcblx0XHRyZWFkb25seSBncmlkV2lkdGg6IG51bWJlciA9IDI1NiwgcmVhZG9ubHkgZ3JpZEhlaWdodDogbnVtYmVyID0gMjU2KXtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCAxLCB2aXNpYmxlKTtcblxuXHRcdGxldCB6b29tID0gTWF0aC5wb3coMiwgem9vbUxldmVsKTtcblx0XHR0aGlzLnpvb21XaWR0aCA9IGdyaWRXaWR0aCAvIHpvb207XG5cdFx0dGhpcy56b29tSGVpZ2h0ID0gZ3JpZEhlaWdodCAvIHpvb207XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB0cmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0bGV0IG9mZnNldFggPSB2aWV3LnggKiB2aWV3Lnpvb21YO1xuXHRcdGxldCBvZmZzZXRZID0gdmlldy55ICogdmlldy56b29tWTtcblxuXHRcdGxldCB2aWV3V2lkdGggPSB2aWV3LndpZHRoIC8gdmlldy56b29tWDtcblx0XHRsZXQgdmlld0hlaWdodCA9IHZpZXcuaGVpZ2h0IC8gdmlldy56b29tWTtcblxuXHRcdGxldCBncmlkQWNyb3NzID0gdmlld1dpZHRoIC8gdGhpcy56b29tV2lkdGg7XG5cdFx0bGV0IGdyaWRIaWdoID0gdmlld0hlaWdodCAvIHRoaXMuem9vbUhlaWdodDtcblxuXHRcdGxldCB4TWluID0gTWF0aC5mbG9vcih2aWV3LngvdGhpcy56b29tV2lkdGgpO1xuXHRcdGxldCB4TGVmdCA9IHhNaW4gKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IHhNYXggPSBNYXRoLmNlaWwoKHZpZXcueCArIHZpZXdXaWR0aCkgLyB0aGlzLnpvb21XaWR0aCk7XG5cdFx0bGV0IHhSaWdodCA9IHhNYXggKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cblx0XHRsZXQgeU1pbiA9IE1hdGguZmxvb3Iodmlldy55L3RoaXMuem9vbUhlaWdodCk7XG5cdFx0bGV0IHlUb3AgPSB5TWluICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWDtcblx0XHRsZXQgeU1heCA9IE1hdGguY2VpbCgodmlldy55ICsgdmlld0hlaWdodCkgLyB0aGlzLnpvb21IZWlnaHQpO1xuXHRcdGxldCB5Qm90dG9tID0geU1heCAqIHRoaXMuem9vbUhlaWdodCAqIHZpZXcuem9vbVggO1xuXG5cdFx0Y29uc29sZS5sb2coXCJ4TWluIFwiICsgeE1pbiArIFwiIHhNYXggXCIgKyB4TWF4KTtcblx0XHRjb25zb2xlLmxvZyhcInlNaW4gXCIgKyB5TWluICsgXCIgeU1heCBcIiArIHlNYXgpO1xuXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXG5cdFx0Zm9yICh2YXIgeCA9IHhNaW47IHg8PXhNYXg7IHgrKyl7XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiYXQgXCIgKyBtaW5YKTtcblx0XHRcdGxldCB4TW92ZSA9IHggKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cdFx0XHRjdHgubW92ZVRvKHhNb3ZlIC0gb2Zmc2V0WCwgeVRvcCAtIG9mZnNldFkpO1xuXHRcdFx0Y3R4LmxpbmVUbyh4TW92ZSAtIG9mZnNldFgsIHlCb3R0b20gLSBvZmZzZXRZKTtcblx0XHR9XG5cblx0XHRmb3IgKHZhciB5ID0geU1pbjsgeTw9eU1heDsgeSsrKXtcblxuXHRcdFx0bGV0IHlNb3ZlID0geSAqIHRoaXMuem9vbUhlaWdodCAqIHZpZXcuem9vbVk7XG5cdFx0XHRjdHgubW92ZVRvKHhMZWZ0IC0gb2Zmc2V0WCwgeU1vdmUgLSBvZmZzZXRZKTtcblx0XHRcdGN0eC5saW5lVG8oeFJpZ2h0IC0gb2Zmc2V0WCwgeU1vdmUgLSBvZmZzZXRZKTtcblxuXHRcdFx0Zm9yICh2YXIgeCA9IHhNaW47IHg8PXhNYXg7IHgrKyl7XG5cdFx0XHRcdGxldCB4TW92ZSA9ICh4LS41KSAqIHRoaXMuem9vbVdpZHRoICogdmlldy56b29tWDtcblx0XHRcdFx0eU1vdmUgPSAoeS0uNSkgKiB0aGlzLnpvb21IZWlnaHQgKiB2aWV3Lnpvb21ZO1xuXHRcdFx0XHRsZXQgdGV4dCA9IFwiXCIgKyAoeC0xKSArIFwiLCBcIiArICh5LTEpO1xuXHRcdFx0XHRjdHguc3Ryb2tlVGV4dCh0ZXh0LCB4TW92ZSAtIG9mZnNldFgsIHlNb3ZlIC0gb2Zmc2V0WSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdGN0eC5zdHJva2UoKTtcblx0XHRjb25zb2xlLmxvZyhcImRyZXcgZ3JpZFwiKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG59IiwiXG5pbXBvcnQge0NhbnZhc1ZpZXcsIERpc3BsYXlFbGVtZW50fSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5pbXBvcnQge0NhbnZhc0xheWVyfSBmcm9tIFwiLi9sYXllclwiO1xuXG5leHBvcnQgY2xhc3MgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIHJlYWRvbmx5IGRpc3BsYXlFbGVtZW50OiBEaXNwbGF5RWxlbWVudCwgIHB1YmxpYyBtb2Q6IHN0cmluZyA9IFwidlwiKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLnByZXNzZWQoY2FudmFzVmlldywgZSAgYXMgS2V5Ym9hcmRFdmVudCkpO1xuICAgIH1cblxuICAgIHByZXNzZWQoY2FudmFzVmlldzogQ2FudmFzVmlldywgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcInByZXNzZWQgbGF5ZXJcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LmtleSk7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgIGNhc2UgdGhpcy5tb2Q6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0b2dnbGUgdmlzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlFbGVtZW50LnNldFZpc2libGUoIXRoaXMuZGlzcGxheUVsZW1lbnQuaXNWaXNpYmxlKCkpO1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VDb250cm9sbGVyIHtcblxuICAgIHByaXZhdGUgY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyO1xuXG4gICAgY29uc3RydWN0b3IoY2FudmFzVmlldzogQ2FudmFzVmlldywgY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyKSB7XG4gICAgXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLnByZXNzZWQoY2FudmFzVmlldywgZSAgYXMgS2V5Ym9hcmRFdmVudCkpO1xuICAgICAgICB0aGlzLmNhbnZhc0xheWVyID0gY2FudmFzTGF5ZXI7XG4gICAgfVxuXG4gICAgc2V0Q2FudmFzTGF5ZXIoY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyKXtcbiAgICAgICAgdGhpcy5jYW52YXNMYXllciA9IGNhbnZhc0xheWVyO1xuICAgIH1cblxuICAgIHByZXNzZWQoY2FudmFzVmlldzogQ2FudmFzVmlldywgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBcdGNvbnNvbGUubG9nKFwicHJlc3NlZFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQua2V5KTtcblxuICAgICAgICBsZXQgbXVsdGlwbGllciA9IDE7XG5cbiAgICBcdHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgXHRcdGNhc2UgXCJhXCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54IC0gMC41ICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHRjYW52YXNWaWV3LmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJBXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54IC0gNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgXHRcdGNhc2UgXCJkXCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54ICsgMC41ICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHRjYW52YXNWaWV3LmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJEXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54ICsgNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgXHRcdGNhc2UgXCJ3XCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci55ID0gdGhpcy5jYW52YXNMYXllci55IC0gMC41ICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHRjYW52YXNWaWV3LmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJXXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci55ID0gdGhpcy5jYW52YXNMYXllci55IC0gNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7ICAgIFxuICAgIFx0XHRjYXNlIFwic1wiOlxuICAgIFx0XHRcdHRoaXMuY2FudmFzTGF5ZXIueSA9IHRoaXMuY2FudmFzTGF5ZXIueSArIDAuNSAqIG11bHRpcGxpZXI7XG4gICAgXHRcdFx0Y2FudmFzVmlldy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiU1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIueSA9IHRoaXMuY2FudmFzTGF5ZXIueSArIDUgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImVcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uID0gdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiAtIDAuMDA1O1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIkVcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uID0gdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiAtIDAuMDU7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwicVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gPSB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uICsgMC4wMDU7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiUVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gPSB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uICsgMC4wNTtcbiAgICAgICAgICAgICAgICBjYW52YXNWaWV3LmRyYXcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICBcdFx0Y2FzZSBcInhcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnpvb21YID0gdGhpcy5jYW52YXNMYXllci56b29tWCAtIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHRjYW52YXNWaWV3LmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIlhcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnpvb21YID0gdGhpcy5jYW52YXNMYXllci56b29tWCArIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHRjYW52YXNWaWV3LmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInpcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnpvb21ZID0gdGhpcy5jYW52YXNMYXllci56b29tWSAtIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHRjYW52YXNWaWV3LmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIlpcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnpvb21ZID0gdGhpcy5jYW52YXNMYXllci56b29tWSArIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHRjYW52YXNWaWV3LmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJjXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5zZXRWaXNpYmxlKCF0aGlzLmNhbnZhc0xheWVyLnZpc2libGUpO1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLm9wYWNpdHkgPSBNYXRoLm1pbigxLjAsIHRoaXMuY2FudmFzTGF5ZXIub3BhY2l0eSArIDAuMSk7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwidFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIub3BhY2l0eSA9IE1hdGgubWF4KDAsIHRoaXMuY2FudmFzTGF5ZXIub3BhY2l0eSAtIDAuMSk7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgXHRcdGRlZmF1bHQ6XG4gICAgXHRcdFx0Ly8gY29kZS4uLlxuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0fVxuICAgIFx0Y29uc29sZS5sb2coXCJpbWFnZSBhdDogXCIgKyAgdGhpcy5jYW52YXNMYXllci54ICsgXCIsIFwiICsgdGhpcy5jYW52YXNMYXllci55KTtcbiAgICBcdGNvbnNvbGUubG9nKFwiaW1hZ2Ugcm8gc2M6IFwiICsgIHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gKyBcIiwgXCIgKyB0aGlzLmNhbnZhc0xheWVyLnpvb21YICsgXCIsIFwiICsgdGhpcy5jYW52YXNMYXllci56b29tWSk7XG4gICAgfTtcblxufTsiLCJpbXBvcnQgeyBUcmFuc2Zvcm0sIEJhc2ljVHJhbnNmb3JtLCBWaWV3VHJhbnNmb3JtLCBjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgRGlzcGxheUVsZW1lbnQgfSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDYW52YXNMYXllciBleHRlbmRzIEJhc2ljVHJhbnNmb3JtIGltcGxlbWVudHMgRGlzcGxheUVsZW1lbnQge1xuXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBwdWJsaWMgb3BhY2l0eTogbnVtYmVyLCBwdWJsaWMgdmlzaWJsZSl7XG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0ueCwgbG9jYWxUcmFuc2Zvcm0ueSwgbG9jYWxUcmFuc2Zvcm0uem9vbVgsIGxvY2FsVHJhbnNmb3JtLnpvb21ZLCBsb2NhbFRyYW5zZm9ybS5yb3RhdGlvbik7XG5cdH1cblxuXHRhYnN0cmFjdCBkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW47XG5cblx0aXNWaXNpYmxlKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnZpc2libGU7XG5cdH1cblxuXHRzZXRWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4pOiB2b2lkIHtcblx0XHRjb25zb2xlLmxvZyhcInNldHRpbmcgdmlzaWJpbGl0eTogXCIgKyB2aXNpYmxlKTtcblx0XHR0aGlzLnZpc2libGUgPSB2aXNpYmxlO1xuXHR9XG5cblx0Z2V0T3BhY2l0eSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLm9wYWNpdHk7XG5cdH1cblxuXHRzZXRPcGFjaXR5KG9wYWNpdHk6IG51bWJlcik6IHZvaWQge1xuXHRcdHRoaXMub3BhY2l0eSA9IG9wYWNpdHk7XG5cdH1cblxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRHJhd0xheWVyIGV4dGVuZHMgQ2FudmFzTGF5ZXIge1xuXG4gICAgcHJvdGVjdGVkIHByZXBhcmVDdHgoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBUcmFuc2Zvcm0pOiB2b2lkIHtcblx0XHRjdHgudHJhbnNsYXRlKCh0cmFuc2Zvcm0ueCAtIHZpZXcueCkgKiB2aWV3Lnpvb21YLCAodHJhbnNmb3JtLnkgLSB2aWV3LnkpICogdmlldy56b29tWSk7XG5cdFx0Y3R4LnNjYWxlKHRyYW5zZm9ybS56b29tWCAqIHZpZXcuem9vbVgsIHRyYW5zZm9ybS56b29tWSAqIHZpZXcuem9vbVkpO1xuXHRcdGN0eC5yb3RhdGUodHJhbnNmb3JtLnJvdGF0aW9uKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgY2xlYW5DdHgoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBUcmFuc2Zvcm0pOiB2b2lkIHtcdFxuXHRcdGN0eC5yb3RhdGUoLXRyYW5zZm9ybS5yb3RhdGlvbik7XG5cdFx0Y3R4LnNjYWxlKDEvdHJhbnNmb3JtLnpvb21YL3ZpZXcuem9vbVgsIDEvdHJhbnNmb3JtLnpvb21ZL3ZpZXcuem9vbVkpO1xuXHRcdGN0eC50cmFuc2xhdGUoLSh0cmFuc2Zvcm0ueCAtdmlldy54KSAqdmlldy56b29tWCwgLSh0cmFuc2Zvcm0ueSAtIHZpZXcueSkgKiB2aWV3Lnpvb21ZKTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIENvbnRhaW5lckxheWVyIGV4dGVuZHMgQ2FudmFzTGF5ZXIge1xuXG5cdGxheWVyTWFwOiBNYXA8c3RyaW5nLCBDYW52YXNMYXllcj47XG5cdGRpc3BsYXlMYXllcnM6IEFycmF5PENhbnZhc0xheWVyPjtcblxuXHRjb25zdHJ1Y3Rvcihsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBvcGFjaXR5OiBudW1iZXIgPSAxLCB2aXNpYmxlOiBib29sZWFuID0gdHJ1ZSkge1xuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCBvcGFjaXR5LCB2aXNpYmxlKTtcblx0XHR0aGlzLmxheWVyTWFwID0gbmV3IE1hcDxzdHJpbmcsIENhbnZhc0xheWVyPigpO1xuXHRcdHRoaXMuZGlzcGxheUxheWVycyA9IFtdO1xuXHR9XG5cblx0c2V0KG5hbWU6IHN0cmluZywgbGF5ZXI6IENhbnZhc0xheWVyKXtcblx0XHR0aGlzLmxheWVyTWFwLnNldChuYW1lLCBsYXllcik7XG5cdFx0dGhpcy5kaXNwbGF5TGF5ZXJzLnB1c2gobGF5ZXIpO1xuXHR9XG5cblx0Z2V0KG5hbWU6IHN0cmluZyk6IENhbnZhc0xheWVyIHtcblx0XHRyZXR1cm4gdGhpcy5sYXllck1hcC5nZXQobmFtZSk7XG5cdH1cblxuXHRzZXRUb3AobmFtZTogc3RyaW5nKSB7XG5cdFx0bGV0IHRvcExheWVyID0gdGhpcy5nZXQobmFtZSk7XG5cdFx0dGhpcy5kaXNwbGF5TGF5ZXJzID0gdGhpcy5kaXNwbGF5TGF5ZXJzLmZpbHRlcihmdW5jdGlvbihlbGVtZW50OiBDYW52YXNMYXllcil7IFxuXHRcdFx0aWYgKGVsZW1lbnQgPT0gdG9wTGF5ZXIpe1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH19KTtcblx0XHR0aGlzLmRpc3BsYXlMYXllcnMucHVzaCh0b3BMYXllcik7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0bGV0IGxheWVyVHJhbnNmb3JtID0gY29tYmluZVRyYW5zZm9ybSh0aGlzLmxvY2FsVHJhbnNmb3JtLCBwYXJlbnRUcmFuc2Zvcm0pO1xuXG5cdFx0dmFyIGRyYXdpbmdDb21wbGV0ZSA9IHRydWU7XG5cblx0XHRmb3IgKGxldCBsYXllciBvZiB0aGlzLmRpc3BsYXlMYXllcnMpIHtcblx0XHRcdGlmIChsYXllci5pc1Zpc2libGUoKSl7XG5cdFx0XHRcdGRyYXdpbmdDb21wbGV0ZSA9IGRyYXdpbmdDb21wbGV0ZSAmJiBsYXllci5kcmF3KGN0eCwgbGF5ZXJUcmFuc2Zvcm0sIHZpZXcpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRyYXdpbmdDb21wbGV0ZTtcblx0fVxuXG59IiwiaW1wb3J0IHsgQ29udGFpbmVyTGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgQ29udGFpbmVyTGF5ZXJNYW5hZ2VyIH0gZnJvbSBcIi4vbGF5ZXJtYW5hZ2VyXCI7XG5pbXBvcnQgeyBDYW52YXNWaWV3IH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuXG5leHBvcnQgY2xhc3MgTGF5ZXJDb250cm9sbGVyIHtcblxuXHRwcml2YXRlIG1vZDogc3RyaW5nID0gXCJpXCI7XG5cblx0Y29uc3RydWN0b3IoY2FudmFzVmlldzogQ2FudmFzVmlldywgcmVhZG9ubHkgY29udGFpbmVyTGF5ZXJNYW5hZ2VyOiBDb250YWluZXJMYXllck1hbmFnZXIpe1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLnByZXNzZWQoY2FudmFzVmlldywgZSAgYXMgS2V5Ym9hcmRFdmVudCkpO1xuXHR9XG5cblx0cHJlc3NlZChjYW52YXNWaWV3OiBDYW52YXNWaWV3LCBldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICAgICAgICBjYXNlIHRoaXMubW9kOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidG9nZ2xlIHZpc2libGVcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXJMYXllck1hbmFnZXIudG9nZ2xlVmlzaWJpbGl0eShmYWxzZSk7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBDYW52YXNMYXllciwgQ29udGFpbmVyTGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgU3RhdGljSW1hZ2UgfSBmcm9tIFwiLi9zdGF0aWNcIjtcbmltcG9ydCB7IFRyYW5zZm9ybSAsIEJhc2ljVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHtDYW52YXNWaWV3LCBEaXNwbGF5RWxlbWVudH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEltYWdlU3RydWN0IGV4dGVuZHMgVHJhbnNmb3JtIHtcblx0XG5cdG9wYWNpdHk6IG51bWJlcjtcblx0dmlzaWJsZTogYm9vbGVhbjtcblx0c3JjOiBzdHJpbmc7XG5cdG5hbWU6IHN0cmluZztcblxufVxuXG5leHBvcnQgY2xhc3MgTGF5ZXJNYW5hZ2VyIHtcblxuXHRwcml2YXRlIGxheWVyTWFwOiBNYXA8c3RyaW5nLCBDb250YWluZXJMYXllcj47O1xuXG5cdHJlYWRvbmx5IGRlZmF1bHRMYXllcjogc3RyaW5nID0gXCJkZWZhdWx0XCI7XG5cblx0Y29uc3RydWN0b3IoKXtcblx0XHR0aGlzLmxheWVyTWFwID0gbmV3IE1hcDxzdHJpbmcsIENvbnRhaW5lckxheWVyPigpO1xuXG5cdFx0bGV0IGltYWdlTGF5ZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXIoQmFzaWNUcmFuc2Zvcm0udW5pdFRyYW5zZm9ybSwgMSwgdHJ1ZSk7XHRcblxuXHRcdHRoaXMubGF5ZXJNYXAuc2V0KHRoaXMuZGVmYXVsdExheWVyLCBpbWFnZUxheWVyKTtcblx0fVxuXG5cdGFkZEltYWdlKGltYWdlOiBTdGF0aWNJbWFnZSwgbmFtZTogc3RyaW5nKXtcblx0XHR0aGlzLmxheWVyTWFwLmdldCh0aGlzLmRlZmF1bHRMYXllcikuc2V0KG5hbWUsIGltYWdlKTtcblx0fVxuXG5cdGFkZExheWVyKGltYWdlRGV0YWlsczogQXJyYXk8SW1hZ2VTdHJ1Y3Q+LCBsYXllck5hbWU6IHN0cmluZyk6IENvbnRhaW5lckxheWVyIHtcblx0XHRsZXQgaW1hZ2VMYXllciA9IG5ldyBDb250YWluZXJMYXllcihCYXNpY1RyYW5zZm9ybS51bml0VHJhbnNmb3JtLCAxLCB0cnVlKTtcdFxuXG5cdFx0Zm9yICh2YXIgaW1hZ2Ugb2YgaW1hZ2VEZXRhaWxzKXtcblx0XHRcdGxldCBzdGF0aWNJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZShpbWFnZSwgaW1hZ2Uuc3JjLCBpbWFnZS5vcGFjaXR5LCBpbWFnZS52aXNpYmxlKTtcblx0XHRcdGltYWdlTGF5ZXIuc2V0KGltYWdlLm5hbWUsIHN0YXRpY0ltYWdlKTtcblx0XHR9XG5cblx0XHR0aGlzLmxheWVyTWFwLnNldChsYXllck5hbWUsIGltYWdlTGF5ZXIpO1xuXG5cdFx0cmV0dXJuIGltYWdlTGF5ZXI7XG5cdH1cblxuXHRnZXRMYXllcnMoKTogTWFwPHN0cmluZywgQ29udGFpbmVyTGF5ZXI+IHtcblx0XHRyZXR1cm4gdGhpcy5sYXllck1hcDtcblx0fVxuXG5cdGdldExheWVyKG5hbWU6IHN0cmluZyk6IENvbnRhaW5lckxheWVyIHtcblx0XHRyZXR1cm4gdGhpcy5sYXllck1hcC5nZXQobmFtZSk7XG5cdH1cblxufVxuXG5leHBvcnQgY2xhc3MgQ29udGFpbmVyTGF5ZXJNYW5hZ2VyIHtcblxuXHRwcml2YXRlIGxheWVyQ29udGFpbmVyOiBDb250YWluZXJMYXllcjtcblx0cHJpdmF0ZSBzZWxlY3RlZDogc3RyaW5nO1xuXHRcblx0Y29uc3RydWN0b3IobGF5ZXJDb250YWluZXI6IENvbnRhaW5lckxheWVyKSB7XG5cdFx0dGhpcy5sYXllckNvbnRhaW5lciA9IGxheWVyQ29udGFpbmVyO1xuXHR9XG5cblx0c2V0TGF5ZXJDb250YWluZXIobGF5ZXJDb250YWluZXI6IENvbnRhaW5lckxheWVyKSB7XG5cdFx0dGhpcy5sYXllckNvbnRhaW5lciA9IGxheWVyQ29udGFpbmVyO1xuXHR9XG5cblx0c2V0U2VsZWN0ZWQobmFtZTogc3RyaW5nKXtcblx0XHR0aGlzLnNlbGVjdGVkID0gbmFtZTtcblx0fVxuXG5cdHRvZ2dsZVZpc2liaWxpdHkoc2VsZWN0ZWQ6IGJvb2xlYW4gPSB0cnVlKXtcblx0XHRsZXQgdG9nZ2xlR3JvdXA6IEFycmF5PERpc3BsYXlFbGVtZW50PiA9IFtdO1xuXHRcdGlmIChzZWxlY3RlZCl7XG5cdFx0XHRpZiAodGhpcy5zZWxlY3RlZCAhPSBcIlwiKXtcblx0XHRcdFx0dG9nZ2xlR3JvdXAucHVzaCh0aGlzLmxheWVyQ29udGFpbmVyLmxheWVyTWFwLmdldCh0aGlzLnNlbGVjdGVkKSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZvciAobGV0IHBhaXIgb2YgdGhpcy5sYXllckNvbnRhaW5lci5sYXllck1hcCl7XG5cblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcImxheWVyTmFtZTogXCIgKyBwYWlyWzBdKTtcblx0XHRcdFx0aWYgKHBhaXJbMF0gIT0gdGhpcy5zZWxlY3RlZCl7XG5cdFx0XHRcdFx0dG9nZ2xlR3JvdXAucHVzaChwYWlyWzFdKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcImxheWVyTmFtZTogXCIgKyB0aGlzLnNlbGVjdGVkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZvciAobGV0IGVsZW1lbnQgb2YgdG9nZ2xlR3JvdXApe1xuXHRcdFx0ZWxlbWVudC5zZXRWaXNpYmxlKCFlbGVtZW50LmlzVmlzaWJsZSgpKVxuXHRcdH1cblx0fVxuXG59IiwiaW1wb3J0IHsgVHJhbnNmb3JtLCBjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgRHJhd0xheWVyLCBDYW52YXNMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBEaXNwbGF5RWxlbWVudCB9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcblxuZXhwb3J0IGNsYXNzIFN0YXRpY0ltYWdlIGV4dGVuZHMgRHJhd0xheWVyIGltcGxlbWVudHMgRGlzcGxheUVsZW1lbnQge1xuXG5cdHByaXZhdGUgaW1nOiBIVE1MSW1hZ2VFbGVtZW50O1xuXG5cdGNvbnN0cnVjdG9yKGxvY2FsVHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHRcdGltYWdlU3JjOiBzdHJpbmcsIFxuXHRcdG9wYWNpdHk6IG51bWJlcixcblx0XHR2aXNpYmxlOiBib29sZWFuID0gdHJ1ZSkge1xuXG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0sIG9wYWNpdHksIHZpc2libGUpO1xuXHRcdFxuXHRcdHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG5cdFx0dGhpcy5pbWcuc3JjID0gaW1hZ2VTcmM7XG5cdH1cblxuXHRwcml2YXRlIGRyYXdJbWFnZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFRyYW5zZm9ybSl7XG5cblx0XHRpZiAodGhpcy5pc1Zpc2libGUoKSl7XG5cdFx0XHRsZXQgY3R4VHJhbnNmb3JtID0gY29tYmluZVRyYW5zZm9ybSh0aGlzLCBwYXJlbnRUcmFuc2Zvcm0pO1xuXG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiY3R4IHggXCIgKyBjdHhUcmFuc2Zvcm0ueCk7XG5cblx0XHRcdHRoaXMucHJlcGFyZUN0eChjdHgsIGN0eFRyYW5zZm9ybSwgdmlldyk7XG5cdFx0XHRcblx0XHRcdGN0eC5nbG9iYWxBbHBoYSA9IHRoaXMub3BhY2l0eTtcblx0XHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDApO1xuXHRcdFx0Y3R4Lmdsb2JhbEFscGhhID0gMTtcblxuXHRcdFx0dGhpcy5jbGVhbkN0eChjdHgsIGN0eFRyYW5zZm9ybSwgdmlldyk7XG5cdFx0fVxuXHRcdFxuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFRyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXHRcdGlmICh0aGlzLnZpc2libGUgJiYgdGhpcy5pbWcuY29tcGxldGUpIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgcGFyZW50VHJhbnNmb3JtLCB2aWV3KTtcblx0XHQvL1x0Y29uc29sZS5sb2coXCJkcmV3IGltYWdlIFwiICsgdGhpcy5pbWcuc3JjKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cbiIsImltcG9ydCB7IERyYXdMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBUcmFuc2Zvcm0sIEJhc2ljVHJhbnNmb3JtLCBWaWV3VHJhbnNmb3JtLCBjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuXG5leHBvcnQgY2xhc3MgVGlsZVN0cnVjdCB7XG5cdFxuXHRjb25zdHJ1Y3Rvcihcblx0XHRwdWJsaWMgcHJlZml4OiBzdHJpbmcsXG5cdFx0cHVibGljIHN1ZmZpeDogc3RyaW5nLFxuXHRcdHB1YmxpYyB0aWxlRGlyZWN0b3J5OiBzdHJpbmcpe31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHpvb21CeUxldmVsKHpvb21MZXZlbDogbnVtYmVyKXtcblx0cmV0dXJuIE1hdGgucG93KDIsIHpvb21MZXZlbCk7XG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlTGF5ZXIgZXh0ZW5kcyBEcmF3TGF5ZXIge1xuXG5cdHRpbGVNYW5hZ2VyOiBUaWxlTWFuYWdlcjtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHRyZWFkb25seSB0aWxlU3RydWN0OiBUaWxlU3RydWN0LFxuXHRcdHB1YmxpYyB4T2Zmc2V0OiBudW1iZXIgPSAwLFxuXHRcdHB1YmxpYyB5T2Zmc2V0OiBudW1iZXIgPSAwLFxuXHRcdHB1YmxpYyB6b29tOiBudW1iZXIgPSAxLFxuXHRcdHJlYWRvbmx5IGdyaWRXaWR0aDogbnVtYmVyID0gMjU2LCBcblx0XHRyZWFkb25seSBncmlkSGVpZ2h0OiBudW1iZXIgPSAyNTYsXG5cdFx0b3BhY2l0eTogbnVtYmVyID0gMSxcblx0XHR2aXNiaWxlOiBib29sZWFuID0gdHJ1ZSl7XG5cblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybSwgb3BhY2l0eSwgdmlzYmlsZSk7XG5cblx0XHR0aGlzLnRpbGVNYW5hZ2VyID0gbmV3IFRpbGVNYW5hZ2VyKCk7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0bGV0IGN0eFRyYW5zZm9ybSA9IGNvbWJpbmVUcmFuc2Zvcm0odGhpcywgcGFyZW50VHJhbnNmb3JtKTtcblxuXHRcdGxldCB6b29tV2lkdGg6IG51bWJlciA9IHRoaXMuZ3JpZFdpZHRoICogY3R4VHJhbnNmb3JtLnpvb21YXG5cdFx0bGV0IHpvb21IZWlnaHQ6IG51bWJlciA9IHRoaXMuZ3JpZEhlaWdodCAqIGN0eFRyYW5zZm9ybS56b29tWTtcblxuXHRcdC8vY29uc29sZS5sb2coXCJjdHggem9vbVdpZHRoOiBcIiArIHpvb21XaWR0aCk7XG5cblx0XHRsZXQgdmlld1ggPSB2aWV3LnggKiB2aWV3Lnpvb21YO1xuXHRcdGxldCB2aWV3WSA9IHZpZXcueSAqIHZpZXcuem9vbVk7XG5cblx0XHRsZXQgdmlld1dpZHRoID0gdmlldy53aWR0aCAvIHZpZXcuem9vbVg7XG5cdFx0bGV0IHZpZXdIZWlnaHQgPSB2aWV3LmhlaWdodCAvIHZpZXcuem9vbVk7XG5cblx0XHRsZXQgZ3JpZEFjcm9zcyA9IHZpZXdXaWR0aCAvIHpvb21XaWR0aDsgLy9nb29kXG5cdFx0bGV0IGdyaWRIaWdoID0gdmlld0hlaWdodCAvIHpvb21IZWlnaHQ7IC8vZ29vZFxuXG5cdFx0bGV0IHhNaW4gPSBNYXRoLmZsb29yKHZpZXcueC96b29tV2lkdGgpO1xuXHRcdGxldCB4TWF4ID0gTWF0aC5jZWlsKCh2aWV3LnggKyB2aWV3V2lkdGgpIC8gem9vbVdpZHRoKTtcblxuXHRcdGxldCB5TWluID0gTWF0aC5mbG9vcih2aWV3Lnkvem9vbUhlaWdodCk7XG5cdFx0bGV0IHlNYXggPSBNYXRoLmNlaWwoKHZpZXcueSArIHZpZXdIZWlnaHQpIC8gem9vbUhlaWdodCk7XG5cblx0XHQvL2NvbnNvbGUubG9nKFwieCB5IHMgXCIgKyB4TWluICsgXCIsIFwiICsgeE1heCArIFwiOiBcIiArIHlNaW4gKyBcIiwgXCIgKyB5TWF4KTtcblx0XHQvL2NvbnNvbGUubG9nKFwiYWNyb3NzIGhpZ2hcIiArIGdyaWRBY3Jvc3MgKyBcIiwgXCIgKyBncmlkSGlnaCk7XG5cblx0XHR2YXIgZHJhd2luZ0NvbXBsZXRlID0gdHJ1ZTtcblxuXHRcdGxldCBmdWxsWm9vbVggPSBjdHhUcmFuc2Zvcm0uem9vbVggKiB2aWV3Lnpvb21YO1xuXHRcdGxldCBmdWxsWm9vbVkgPSBjdHhUcmFuc2Zvcm0uem9vbVkgKiB2aWV3Lnpvb21ZO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhcImZ1bGx6b29tcyBcIiArIGZ1bGxab29tWCArIFwiIFwiICsgZnVsbFpvb21ZKTtcblxuXHRcdGN0eC5zY2FsZShmdWxsWm9vbVgsIGZ1bGxab29tWSk7XG5cblx0XHRmb3IgKHZhciB4ID0geE1pbjsgeDx4TWF4OyB4Kyspe1xuXHRcdFx0bGV0IHhNb3ZlID0geCAqIHRoaXMuZ3JpZFdpZHRoIC0gdmlldy54IC8gY3R4VHJhbnNmb3JtLnpvb21YO1xuXHRcdFx0Zm9yICh2YXIgeSA9IHlNaW47IHk8eU1heDsgeSsrKXtcblx0XHRcdFx0bGV0IHlNb3ZlID0geSAqIHRoaXMuZ3JpZEhlaWdodCAtIHZpZXcueS8gY3R4VHJhbnNmb3JtLnpvb21ZO1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKFwidGlsZSB4IHkgXCIgKyB4ICsgXCIgXCIgKyB5ICsgXCI6IFwiICsgeE1vdmUgKyBcIiwgXCIgKyB5TW92ZSk7XG5cblx0XHRcdFx0Y3R4LnRyYW5zbGF0ZSh4TW92ZSwgeU1vdmUpO1xuXHRcdFx0XHRsZXQgdGlsZVNyYyA9IHRoaXMudGlsZVN0cnVjdC50aWxlRGlyZWN0b3J5ICsgdGhpcy56b29tICsgXCIvXCIgKyBcblx0XHRcdFx0XHQoeCArIHRoaXMueE9mZnNldCkgKyBcIi9cIiArIFxuXHRcdFx0XHRcdCh5ICsgdGhpcy55T2Zmc2V0KSArIHRoaXMudGlsZVN0cnVjdC5zdWZmaXg7XG5cblx0XHRcdFx0aWYgKHRoaXMudGlsZU1hbmFnZXIuaGFzKHRpbGVTcmMpKSB7XG5cdFx0XHRcdFx0bGV0IGltYWdlVGlsZSA9IHRoaXMudGlsZU1hbmFnZXIuZ2V0KHRpbGVTcmMpO1xuXHRcdFx0XHRcdGRyYXdpbmdDb21wbGV0ZSA9IGRyYXdpbmdDb21wbGV0ZSAmJiBpbWFnZVRpbGUuZHJhdyhjdHgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGxldCBpbWFnZVRpbGUgPSBuZXcgSW1hZ2VUaWxlKHgsIHksIHRpbGVTcmMpO1xuXG5cdFx0XHRcdFx0ZHJhd2luZ0NvbXBsZXRlID0gZHJhd2luZ0NvbXBsZXRlICYmIGltYWdlVGlsZS5kcmF3KGN0eCk7XG5cblx0XHRcdFx0XHR0aGlzLnRpbGVNYW5hZ2VyLnNldCh0aWxlU3JjLCBpbWFnZVRpbGUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y3R4LnRyYW5zbGF0ZSgteE1vdmUsIC15TW92ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y3R4LnNjYWxlKDEgLyBmdWxsWm9vbVgsIDEgLyBmdWxsWm9vbVkpO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhcImRyZXcgdGlsZXMgXCIgKyBkcmF3aW5nQ29tcGxldGUpO1xuXHRcdHJldHVybiBkcmF3aW5nQ29tcGxldGU7XG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIFRpbGVNYW5hZ2VyIHtcblxuXHR0aWxlTWFwOiBNYXA8c3RyaW5nLCBJbWFnZVRpbGU+O1xuXG5cdGNvbnN0cnVjdG9yKCl7XG5cdFx0dGhpcy50aWxlTWFwID0gbmV3IE1hcDxzdHJpbmcsIEltYWdlVGlsZT4oKTtcblx0fVxuXG5cdGdldCh0aWxlS2V5OiBzdHJpbmcpOiBJbWFnZVRpbGUge1xuXHRcdHJldHVybiB0aGlzLnRpbGVNYXAuZ2V0KHRpbGVLZXkpO1xuXHR9XG5cblx0aGFzKHRpbGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnRpbGVNYXAuaGFzKHRpbGVLZXkpO1xuXHR9XG5cblx0c2V0KHRpbGVLZXk6IHN0cmluZywgdGlsZTogSW1hZ2VUaWxlKXtcblx0XHR0aGlzLnRpbGVNYXAuc2V0KHRpbGVLZXksIHRpbGUpO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlVGlsZSB7XG5cblx0cHJpdmF0ZSBpbWc6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cdHByaXZhdGUgZXhpc3RzOiBib29sZWFuO1xuXG5cdGNvbnN0cnVjdG9yKHJlYWRvbmx5IHhJbmRleDogbnVtYmVyLCByZWFkb25seSB5SW5kZXg6IG51bWJlciwgaW1hZ2VTcmM6IHN0cmluZykge1xuXHRcdHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG5cdFx0dGhpcy5pbWcuc3JjID0gaW1hZ2VTcmM7XG5cdFx0dGhpcy5pbWcub25lcnJvciA9IGZ1bmN0aW9uKGV2ZW50T3JNZXNzYWdlOiBhbnkpe1xuXHRcdFx0ZXZlbnRPck1lc3NhZ2UudGFyZ2V0LnNyYyA9IFwiXCI7XG5cdFx0fTtcblx0fTtcblxuXHRwcml2YXRlIGRyYXdJbWFnZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCl7XG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZywgMCwgMCk7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKTogYm9vbGVhbiB7XG5cdFx0aWYgKHRoaXMuaW1nLnNyYyAhPSBcIlwiICYmIHRoaXMuaW1nLmNvbXBsZXRlICkge1xuXHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4KTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH07XG5cbn1cbiIsIi8qKlxuKiBBIHdvcmxkIGlzIDAsMCBiYXNlZCBidXQgYW55IGVsZW1lbnQgY2FuIGJlIHBvc2l0aW9uZWQgcmVsYXRpdmUgdG8gdGhpcy5cbiovXG5leHBvcnQgaW50ZXJmYWNlIFRyYW5zZm9ybSB7XG5cdHg6IG51bWJlcjtcblx0eTogbnVtYmVyO1xuXHR6b29tWDogbnVtYmVyO1xuXHR6b29tWTogbnVtYmVyO1xuXHRyb3RhdGlvbjogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgQmFzaWNUcmFuc2Zvcm0gaW1wbGVtZW50cyBUcmFuc2Zvcm0ge1xuXG4gICAgc3RhdGljIHJlYWRvbmx5IHVuaXRUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgMSwgMSwgMCk7XG5cblx0Y29uc3RydWN0b3IocHVibGljIHg6IG51bWJlciwgcHVibGljIHk6IG51bWJlciwgXG5cdFx0cHVibGljIHpvb21YOiBudW1iZXIsIHB1YmxpYyB6b29tWTogbnVtYmVyLCBcblx0XHRwdWJsaWMgcm90YXRpb246IG51bWJlcil7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tYmluZVRyYW5zZm9ybShjaGlsZDogVHJhbnNmb3JtLCBjb250YWluZXI6IFRyYW5zZm9ybSk6IFRyYW5zZm9ybSB7XG5cdGxldCB6b29tWCA9IGNoaWxkLnpvb21YICogY29udGFpbmVyLnpvb21YO1xuXHQvL2NvbnNvbGUubG9nKFwibW9kaWZpZWQgXCIgKyBjaGlsZC56b29tWCArIFwiIHRvIFwiICsgem9vbVgpO1xuXHRsZXQgem9vbVkgPSBjaGlsZC56b29tWSAqIGNvbnRhaW5lci56b29tWTtcblx0Ly9jb25zb2xlLmxvZyhcIm1vZGlmaWVkIFwiICsgY2hpbGQuem9vbVkgKyBcIiBieSBcIiArIGNvbnRhaW5lci56b29tWSArIFwiIHRvIFwiICsgem9vbVkpO1xuXHRsZXQgeCA9IChjaGlsZC54ICogY29udGFpbmVyLnpvb21YKSArIGNvbnRhaW5lci54O1xuXHRsZXQgeSA9IChjaGlsZC55ICogY29udGFpbmVyLnpvb21ZKSArIGNvbnRhaW5lci55O1xuXHQvL2NvbnNvbGUubG9nKFwibW9kaWZpZWQgeCBcIiArIGNoaWxkLnggKyBcIiBieSBcIiArIGNvbnRhaW5lci56b29tWCArIFwiIGFuZCBcIiArIGNvbnRhaW5lci54ICsgXCIgdG8gXCIgKyB4KTtcblx0bGV0IHJvdGF0aW9uID0gY2hpbGQucm90YXRpb24gKyBjb250YWluZXIucm90YXRpb247XG5cdHJldHVybiBuZXcgQmFzaWNUcmFuc2Zvcm0oeCwgeSwgem9vbVgsIHpvb21ZLCByb3RhdGlvbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZSh0cmFuc2Zvcm06IFRyYW5zZm9ybSk6IFRyYW5zZm9ybSB7XG5cdHJldHVybiBuZXcgQmFzaWNUcmFuc2Zvcm0odHJhbnNmb3JtLngsIHRyYW5zZm9ybS55LCBcblx0XHR0cmFuc2Zvcm0uem9vbVgsIHRyYW5zZm9ybS56b29tWSwgdHJhbnNmb3JtLnJvdGF0aW9uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludmVydFRyYW5zZm9ybSh3b3JsZFN0YXRlOiBUcmFuc2Zvcm0pOiBUcmFuc2Zvcm0ge1xuXHRyZXR1cm4gbmV3IEJhc2ljVHJhbnNmb3JtKC13b3JsZFN0YXRlLngsIC13b3JsZFN0YXRlLnksIFxuXHRcdDEvd29ybGRTdGF0ZS56b29tWCwgMS93b3JsZFN0YXRlLnpvb21ZLCAtd29ybGRTdGF0ZS5yb3RhdGlvbik7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmlld1RyYW5zZm9ybSBleHRlbmRzIFRyYW5zZm9ybSB7XG5cdHdpZHRoOiBudW1iZXI7XG5cdGhlaWdodDogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgQmFzaWNWaWV3VHJhbnNmb3JtIGV4dGVuZHMgQmFzaWNUcmFuc2Zvcm0gaW1wbGVtZW50cyBWaWV3VHJhbnNmb3JtIHtcblxuXHRjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgXG5cdFx0cmVhZG9ubHkgd2lkdGg6IG51bWJlciwgcmVhZG9ubHkgaGVpZ2h0OiBudW1iZXIsXG5cdFx0em9vbVg6IG51bWJlciwgem9vbVk6IG51bWJlciwgXG5cdCAgICByb3RhdGlvbjogbnVtYmVyKXtcblxuXHRcdHN1cGVyKHgsIHksIHpvb21YLCB6b29tWSwgcm90YXRpb24pO1xuXHR9XG5cbn1cblxuXG5cbiIsImltcG9ydCB7IFZpZXdUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBDYW52YXNWaWV3IH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuXG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNb3VzZUNvbnRyb2xsZXIge1xuXG4gICAgbW91c2VQb3NpdGlvbihldmVudDogTW91c2VFdmVudCwgd2l0aGluOiBIVE1MRWxlbWVudCk6IEFycmF5PG51bWJlcj4ge1xuICAgICAgICBsZXQgbV9wb3N4ID0gZXZlbnQuY2xpZW50WCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0O1xuICAgICAgICBsZXQgbV9wb3N5ID0gZXZlbnQuY2xpZW50WSArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wXG4gICAgICAgICAgICAgICAgICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcblxuICAgICAgICB2YXIgZV9wb3N4ID0gMDtcbiAgICAgICAgdmFyIGVfcG9zeSA9IDA7XG5cbiAgICAgICAgaWYgKHdpdGhpbi5vZmZzZXRQYXJlbnQpe1xuICAgICAgICAgICAgZG8geyBcbiAgICAgICAgICAgICAgICBlX3Bvc3ggKz0gd2l0aGluLm9mZnNldExlZnQ7XG4gICAgICAgICAgICAgICAgZV9wb3N5ICs9IHdpdGhpbi5vZmZzZXRUb3A7XG4gICAgICAgICAgICB9IHdoaWxlICh3aXRoaW4gPSA8SFRNTEVsZW1lbnQ+d2l0aGluLm9mZnNldFBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW21fcG9zeCAtIGVfcG9zeCwgbV9wb3N5IC0gZV9wb3N5XTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIFZpZXdDb250cm9sbGVyIGV4dGVuZHMgTW91c2VDb250cm9sbGVyIHtcblxuXHRyZWNvcmQ6IGJvb2xlYW47XG5cdG1vdmU6IG51bWJlciA9IDE7XG5cblx0cHJpdmF0ZSB4UHJldmlvdXM6IG51bWJlcjtcblx0cHJpdmF0ZSB5UHJldmlvdXM6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3Rvcih2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtLCBcbiAgICAgICAgcmVhZG9ubHkgZHJhZ0VsZW1lbnQ6IEhUTUxFbGVtZW50LCByZWFkb25seSBjYW52YXNWaWV3OiBDYW52YXNWaWV3KSB7XG5cbiAgICBcdHN1cGVyKCk7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybSkpO1xuICAgIFx0ZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm0pKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybSkpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLnJlY29yZCA9IGZhbHNlKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5jbGlja2VkKGUgYXMgTW91c2VFdmVudCwgY2FudmFzVmlldywgMS4yKSk7XG4gICAgICAgIGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCAoZTogRXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy53aGVlbChlIGFzIFdoZWVsRXZlbnQsIGNhbnZhc1ZpZXcpKTtcbiAgICB9XG5cbiAgICBjbGlja2VkKGV2ZW50OiBNb3VzZUV2ZW50LCB2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtLCB6b29tQnk6IG51bWJlcil7XG4gICAgXHRzd2l0Y2goZXZlbnQudHlwZSl7XG4gICAgXHRcdGNhc2UgXCJkYmxjbGlja1wiOlxuICAgICAgICAgICAgICAgIGlmICAoZXZlbnQuY3RybEtleSkge1xuICAgICAgICAgICAgICAgICAgICB6b29tQnkgPSAxIC8gem9vbUJ5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsZXQgbVhZID0gdGhpcy5tb3VzZVBvc2l0aW9uKGV2ZW50LCB0aGlzLmRyYWdFbGVtZW50KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy56b29tQWJvdXQobVhZWzBdLCBtWFlbMV0sIHpvb21CeSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYWdnZWQoZXZlbnQ6IE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm06IFZpZXdUcmFuc2Zvcm0pIHtcblxuICAgIFx0c3dpdGNoKGV2ZW50LnR5cGUpe1xuICAgIFx0XHRjYXNlIFwibW91c2Vkb3duXCI6XG4gICAgXHRcdFx0dGhpcy5yZWNvcmQgPSB0cnVlO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwibW91c2V1cFwiOlxuICAgIFx0XHRcdHRoaXMucmVjb3JkID0gZmFsc2U7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGRlZmF1bHQ6XG4gICAgXHRcdFx0aWYgKHRoaXMucmVjb3JkKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHhEZWx0YSA9IChldmVudC5jbGllbnRYIC0gdGhpcy54UHJldmlvdXMpIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHlEZWx0YSA9IChldmVudC5jbGllbnRZIC0gdGhpcy55UHJldmlvdXMpIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWTtcblxuICAgICAgICAgICAgICAgICAgICB2aWV3VHJhbnNmb3JtLnggPSB2aWV3VHJhbnNmb3JtLnggLSB4RGVsdGE7XG4gICAgICAgICAgICAgICAgICAgIHZpZXdUcmFuc2Zvcm0ueSA9IHZpZXdUcmFuc2Zvcm0ueSAtIHlEZWx0YTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgIFx0XHRcdH1cblxuXHRcdFx0dGhpcy54UHJldmlvdXMgPSBldmVudC5jbGllbnRYO1xuXHRcdFx0dGhpcy55UHJldmlvdXMgPSBldmVudC5jbGllbnRZO1xuICAgIFx0fVxuICAgIH1cblxuICAgIHdoZWVsKGV2ZW50OiBXaGVlbEV2ZW50LCB2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtKSB7XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIndoZWVsXCIgKyBldmVudC50YXJnZXQgKyBcIiwgXCIgKyBldmVudC50eXBlKTtcblxuICAgICAgICBsZXQgeERlbHRhID0gZXZlbnQuZGVsdGFYIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWDtcbiAgICAgICAgbGV0IHlEZWx0YSA9IGV2ZW50LmRlbHRhWSAvIHRoaXMubW92ZSAvIHZpZXdUcmFuc2Zvcm0uem9vbVk7XG5cbiAgICAgICAgaWYgIChldmVudC5jdHJsS2V5KSB7XG4gICAgICAgICAgICBsZXQgbVhZID0gdGhpcy5tb3VzZVBvc2l0aW9uKGV2ZW50LCB0aGlzLmRyYWdFbGVtZW50KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBieSA9IDEuMDU7XG4gICAgICAgICAgICBpZiAoeURlbHRhIDwgMCl7XG4gICAgICAgICAgICAgICAgYnkgPSAwLjk1O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuem9vbUFib3V0KG1YWVswXSwgbVhZWzFdLCBieSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcueCA9ICB0aGlzLmNhbnZhc1ZpZXcueCArIHhEZWx0YTtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy55ID0gIHRoaXMuY2FudmFzVmlldy55ICsgeURlbHRhO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgIH1cblxufVxuIiwibW9kdWxlLmV4cG9ydHM9W1xuXHR7XG5cdFwibmFtZVwiOiBcIjItMlwiLCBcInhcIjogLTM2NCwgXCJ5XCI6IC0xMi41LCBcInpvb21YXCI6IDAuMjEzLCBcInpvb21ZXCI6IDAuMjA1LCBcInJvdGF0aW9uXCI6IC0wLjMxLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDJyXzJbU1ZDMl0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiM1wiLCBcInhcIjogLTIxNiwgXCJ5XCI6IC0wLjcwNSwgXCJ6b29tWFwiOiAwLjIsIFwiem9vbVlcIjogMC4yMSwgXCJyb3RhdGlvblwiOiAtMC41MSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDAzcltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI0XCIsIFwieFwiOiAtNzQuMjksIFwieVwiOiAtOTkuNzgsIFwiem9vbVhcIjogMC4yMjIsIFwiem9vbVlcIjogMC4yMDgsIFwicm90YXRpb25cIjogLTAuMjg1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDRyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjVcIiwgXCJ4XCI6IC0zNzUuNTU1LCBcInlcIjogMTgwLjUxOSwgXCJ6b29tWFwiOiAwLjIxNSwgXCJ6b29tWVwiOiAwLjIwNywgXCJyb3RhdGlvblwiOiAtMC4yMSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA1cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI2XCIsIFwieFwiOiAtMjE2LjE2LCBcInlcIjogMTQ2LCBcInpvb21YXCI6IDAuMjE4LCBcInpvb21ZXCI6IDAuMjE4LCBcInJvdGF0aW9uXCI6IC0wLjIyNSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA2cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI3XCIsIFwieFwiOiAtNjMuMywgXCJ5XCI6IDEwMC4zNzc2LCBcInpvb21YXCI6IDAuMjEyNSwgXCJ6b29tWVwiOiAwLjIxNywgXCJyb3RhdGlvblwiOiAtMC4yMywgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA3cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI4XCIsIFwieFwiOiA3OC4xLCBcInlcIjogNTguNTM1LCBcInpvb21YXCI6IDAuMjA3LCBcInpvb21ZXCI6IDAuMjE3LCBcInJvdGF0aW9uXCI6IC0wLjI1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDhyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjlcIiwgXCJ4XCI6IDIxOS41LCBcInlcIjogMjQsIFwiem9vbVhcIjogMC4yMTUsIFwiem9vbVlcIjogMC4yMTQ1LCBcInJvdGF0aW9uXCI6IC0wLjI2LFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwOXJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTBcIiwgXCJ4XCI6IDQ1NC4yMSwgXCJ5XCI6IC0xLjUsIFwiem9vbVhcIjogMC4yMTgsIFwiem9vbVlcIjogMC4yMTQsIFwicm90YXRpb25cIjogMC4wMTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxMHJfMltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxMVwiLCBcInhcIjogNjIxLjg2LCBcInlcIjogMjUuNTI1LCBcInpvb21YXCI6IDAuMjEzLCBcInpvb21ZXCI6IDAuMjExNSwgXCJyb3RhdGlvblwiOiAwLjExLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTFyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LCBcblx0e1xuXHRcIm5hbWVcIjogXCIxMi0xXCIsIFwieFwiOiA3NjkuNjQ1LCBcInlcIjogNTAuMjY1LCBcInpvb21YXCI6IDAuNDI0LCBcInpvb21ZXCI6IDAuNDIyLCBcInJvdGF0aW9uXCI6IDAuMTIsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxMnJfMVtTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxNFwiLCBcInhcIjogLTkxNS42LCBcInlcIjogNTU3Ljg2NSwgXCJ6b29tWFwiOiAwLjIwOCwgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAtMS4yMTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxNFJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTUtMlwiLCBcInhcIjogLTcxNy4zLCBcInlcIjogNTcyLCBcInpvb21YXCI6IDAuMjEsIFwiem9vbVlcIjogMC4yMDYsIFwicm90YXRpb25cIjogLTEuNDcsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxNXJfMltTVkMyXS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxNi0yXCIsIFwieFwiOiAtOTIsIFwieVwiOiAzMzIuNSwgXCJ6b29tWFwiOiAwLjIxNywgXCJ6b29tWVwiOiAwLjIxNCwgXCJyb3RhdGlvblwiOiAtMC4xLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTZyXzJbU1ZDMl0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTdcIiwgXCJ4XCI6IDg3LjUsIFwieVwiOiAyNzUsIFwiem9vbVhcIjogMC4yLCBcInpvb21ZXCI6IDAuMjA4LCBcInJvdGF0aW9uXCI6IC0wLjAyLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTdSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE4XCIsIFwieFwiOiAyMzIsIFwieVwiOiAyNDMsIFwiem9vbVhcIjogMC4yMDgsIFwiem9vbVlcIjogMC4yMDgsIFwicm90YXRpb25cIjogMC4wNywgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDE4UltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxOVwiLCBcInhcIjogNzEuNSwgXCJ5XCI6IDQ3NCwgXCJ6b29tWFwiOiAwLjIwMywgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAwLjE3LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTlSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjIwXCIsIFwieFwiOiA0My41LCBcInlcIjogNjQwLCBcInpvb21YXCI6IDAuMSwgXCJ6b29tWVwiOiAwLjEwNCwgXCJyb3RhdGlvblwiOiAwLjIwNSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDIwUltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fVxuXG5dXG5cblxuXG4iLCJtb2R1bGUuZXhwb3J0cz1bXG5cdHtcblx0XHRcIm5hbWVcIjogXCJoZW5yaWV0dGFcIiwgXCJ4XCI6IC00ODYuNSwgXCJ5XCI6IC0yNTIuNSwgXCJ6b29tWFwiOiAwLjI5LCBcInpvb21ZXCI6IDAuNSwgXCJyb3RhdGlvblwiOiAwLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvaGVucmlldHRhLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm1hdGVyXCIsIFwieFwiOiAtMzQyLCBcInlcIjogLTc0NywgXCJ6b29tWFwiOiAwLjA4LCBcInpvb21ZXCI6IDAuMTgsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9tYXRlcm1pcy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJwZXRlcnNcIiwgXCJ4XCI6IC03MTksIFwieVwiOiAtODM2LCBcInpvb21YXCI6IDAuMDcsIFwiem9vbVlcIjogMC4xNCwgXCJyb3RhdGlvblwiOiAtMC4xNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL3BldGVycy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJvY29ubmVsbFwiLCBcInhcIjogLTgyMSwgXCJ5XCI6IC0xODM1LCBcInpvb21YXCI6IDAuMjUsIFwiem9vbVlcIjogMC4yNSwgXCJyb3RhdGlvblwiOiAwLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3Mvb2Nvbm5lbGwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC45XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJmb3VyY291cnRzXCIsIFwieFwiOiAtNTY3LjUsIFwieVwiOiAzMjMuNSwgXCJ6b29tWFwiOiAwLjE2LCBcInpvb21ZXCI6IDAuMzI4LCBcInJvdGF0aW9uXCI6IC0wLjEyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvZm91cmNvdXJ0cy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjhcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm1pY2hhbnNcIiwgXCJ4XCI6IC02MzksIFwieVwiOiAxNjAsIFwiem9vbVhcIjogMC4xNCwgXCJ6b29tWVwiOiAwLjI0LCBcInJvdGF0aW9uXCI6IDAuMDIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9taWNoYW5zLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwidGhlY2FzdGxlXCIsIFwieFwiOiAtMjkwLCBcInlcIjogNTIwLCBcInpvb21YXCI6IDAuMjIsIFwiem9vbVlcIjogMC40MiwgXCJyb3RhdGlvblwiOiAtMC4wMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy90aGVjYXN0bGUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibWFya2V0XCIsIFwieFwiOiAtNjE3LCBcInlcIjogNTY1LCBcInpvb21YXCI6IDAuMTUsIFwiem9vbVlcIjogMC4yNiwgXCJyb3RhdGlvblwiOiAwLjA0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbWFya2V0LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwicGF0cmlja3NcIiwgXCJ4XCI6IC00NjIsIFwieVwiOiA3OTUsIFwiem9vbVhcIjogMC4xLCBcInpvb21ZXCI6IDAuMTIsIFwicm90YXRpb25cIjogMC4wNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL3BhdHJpY2tzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibmdpcmVsYW5kXCIsIFwieFwiOiA0MzEsIFwieVwiOiA2OTQsIFwiem9vbVhcIjogMC4xNCwgXCJ6b29tWVwiOiAwLjM3NSwgXCJyb3RhdGlvblwiOiAtMC4xMzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9uZ2lyZWxhbmQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJibHVlY29hdHNcIiwgXCJ4XCI6IC05OTcsIFwieVwiOiA4NiwgXCJ6b29tWFwiOiAwLjEsIFwiem9vbVlcIjogMC4yLCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvYmx1ZWNvYXRzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiY29sbGluc2JhcnJhY2tzXCIsIFwieFwiOiAtMTEzMCwgXCJ5XCI6IDkwLCBcInpvb21YXCI6IDAuMTMsIFwiem9vbVlcIjogMC4zNywgXCJyb3RhdGlvblwiOiAwLjAxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2NvbGxpbnNiYXJyYWNrcy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjhcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImh1Z2hsYW5lXCIsIFwieFwiOiAtMTcyLCBcInlcIjogLTMzNSwgXCJ6b29tWFwiOiAwLjIsIFwiem9vbVlcIjogMC4zMywgXCJyb3RhdGlvblwiOiAtMC4wNiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2h1Z2hsYW5lLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiZ3BvXCIsIFwieFwiOiA1MiwgXCJ5XCI6IDUwLCBcInpvb21YXCI6IDAuMDg2LCBcInpvb21ZXCI6IDAuMjUsIFwicm90YXRpb25cIjogLTAuMDM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvZ3BvLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibW91bnRqb3lcIiwgXCJ4XCI6IDI2MywgXCJ5XCI6IC01NjAsIFwiem9vbVhcIjogMC4xNSwgXCJ6b29tWVwiOiAwLjI4NSwgXCJyb3RhdGlvblwiOiAwLjE3LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbW91bnRqb3kucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtb3VudGpveWJcIiwgXCJ4XCI6IDE1MiwgXCJ5XCI6IC01NzAsIFwiem9vbVhcIjogMC4yLCBcInpvb21ZXCI6IDAuMzA1LCBcInJvdGF0aW9uXCI6IDAuMDQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9tb3VudGpveWIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJyb3lhbGhvc3BpdGFsXCIsIFwieFwiOiAtMTg1MSwgXCJ5XCI6IDQ4Ny41LCBcInpvb21YXCI6IDAuMjEsIFwiem9vbVlcIjogMC4zLCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3Mvcm95YWxob3NwaXRhbC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInBlcHBlclwiLCBcInhcIjogODM0LCBcInlcIjogOTkwLCBcInpvb21YXCI6IDAuMDYsIFwiem9vbVlcIjogMC4xNDUsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9wZXBwZXIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC45XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJsaWJlcnR5aGFsbFwiLCBcInhcIjogMjcwLCBcInlcIjogLTE0LCBcInpvb21YXCI6IDAuNDMsIFwiem9vbVlcIjogMC40MywgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2xpYmVydHkucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJjdXN0b21zaG91c2VcIiwgXCJ4XCI6IDM4MiwgXCJ5XCI6IDEwNywgXCJ6b29tWFwiOiAwLjE1LCBcInpvb21ZXCI6IDAuMzAsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9jdXN0b21zaG91c2UucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH1cbl0iLCJtb2R1bGUuZXhwb3J0cz1bXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDMyXCIsIFwieFwiOiAtNzc2LCBcInlcIjogMzIuNTUsIFwiem9vbVhcIjogMC4yOSwgXCJ6b29tWVwiOiAwLjI4LCBcInJvdGF0aW9uXCI6IC0xLjQ3LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMDMyLW0ucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNywgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNvbnN0aXR1dGlvbiBIaWxsIC0gVHVybnBpa2UsIEdsYXNuZXZpbiBSb2FkOyBzaG93aW5nIHByb3Bvc2VkIHJvYWQgdG8gQm90YW5pYyBHYXJkZW5zXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNzJcIiwgXCJ4XCI6IC0yNTIsIFwieVwiOiAtMjQ3LCBcInpvb21YXCI6IDAuMzE4LCBcInpvb21ZXCI6IDAuMzE0LCBcInJvdGF0aW9uXCI6IDEuNTg1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMDcyLW0ucG5nXCIsIFwidmlzaWJpbGVcIjogZmFsc2UsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gb2YgaW1wcm92aW5nIHRoZSBzdHJlZXRzIGJldHdlZW4gUmljaG1vbmQgQnJpZGdlIChGb3VyIENvdXJ0cykgYW5kIENvbnN0aXR1dGlvbiBIaWxsIChLaW5n4oCZcyBJbm5zKSBEYXRlOiAxODM3XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNzVcIiwgXCJ4XCI6IC0yMTcuNSwgXCJ5XCI6IC0xNDE0LjUsIFwiem9vbVhcIjogMC44NywgXCJ6b29tWVwiOiAwLjc3MiwgXCJyb3RhdGlvblwiOiAxLjYxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTA3NS1tMi5wbmdcIiwgXCJ2aXNpYmlsZVwiOiBmYWxzZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIGEgbGluZSBvZiByb2FkLCBsZWFkaW5nIGZyb20gTGluZW4gSGFsbCB0byBHbGFzbmV2aW4gUm9hZCwgc2hvd2luZyB0aGUgUm95YWwgQ2FuYWwgRGF0ZTogMTgwMFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzYxXCIsIFwieFwiOiA0NjQsIFwieVwiOiAyMTMxLCBcInpvb21YXCI6IDAuNDM2LCBcInpvb21ZXCI6IDAuNDM2LCBcInJvdGF0aW9uXCI6IC0yLjA0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM2MS5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJMZWVzb24gU3RyZWV0LCBQb3J0bGFuZCBTdHJlZXQgKG5vdyBVcHBlciBMZWVzb24gU3RyZWV0KSwgRXVzdGFjZSBQbGFjZSwgRXVzdGFjZSBCcmlkZ2UgKG5vdyBMZWVzb24gU3RyZWV0KSwgSGF0Y2ggU3RyZWV0LCBDaXJjdWxhciBSb2FkIC0gc2lnbmVkIGJ5IENvbW1pc3Npb25lcnMgb2YgV2lkZSBTdHJlZXRzIERhdGU6IDE3OTJcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA4OC0xXCIsIFwieFwiOiAtMC45LCBcInlcIjogMi42NywgXCJ6b29tWFwiOiAwLjUsIFwiem9vbVlcIjogMC41LCBcInJvdGF0aW9uXCI6IC0zLjMyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMDg4LTEuanBnXCIsIFwidmlzaWJpbGVcIjogZmFsc2UsIFwib3BhY2l0eVwiOiAwLjBcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMDYtMVwiLCBcInhcIjogLTc1NywgXCJ5XCI6IDQ5NS41LCBcInpvb21YXCI6IDAuMjY1LCBcInpvb21ZXCI6IDAuMjY1LCBcInJvdGF0aW9uXCI6IC0wLjA3NCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTEwNi0xLmpwZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxLjAsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgc2hvd2luZyBwcm9wb3NlZCBpbXByb3ZlbWVudHMgdG8gYmUgbWFkZSBpbiBDb3JubWFya2V0LCBDdXRwdXJzZSBSb3csIExhbWIgQWxsZXkgLSBGcmFuY2lzIFN0cmVldCAtIGFuZCBhbiBpbXByb3ZlZCBlbnRyYW5jZSBmcm9tIEtldmluIFN0cmVldCB0byBTYWludCBQYXRyaWNr4oCZcyBDYXRoZWRyYWwsIHRocm91Z2ggTWl0cmUgQWxsZXkgYW5kIGF0IEphbWVz4oCZcyBHYXRlLiBEYXRlOiAxODQ1LTQ2IFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTQyXCIsIFwieFwiOiA5NC45OTUsIFwieVwiOiAyMzc3LjUsIFwiem9vbVhcIjogMC40ODIsIFwiem9vbVlcIjogMC40NzYsIFwicm90YXRpb25cIjogLTIuMDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTQyLWwucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDEuMCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBOZXcgU3RyZWV0cywgYW5kIG90aGVyIGltcHJvdmVtZW50cyBpbnRlbmRlZCB0byBiZSBpbW1lZGlhdGVseSBleGVjdXRlZC4gU2l0dWF0ZSBvbiB0aGUgU291dGggU2lkZSBvZiB0aGUgQ2l0eSBvZiBEdWJsaW4sIHN1Ym1pdHRlZCBmb3IgdGhlIGFwcHJvYmF0aW9uIG9mIHRoZSBDb21taXNzaW9uZXJzIG9mIFdpZGUgU3RyZWV0cywgcGFydGljdWxhcmx5IG9mIHRob3NlIHBhcnRzIGJlbG9uZ2luZyB0byBXbS4gQ29wZSBhbmQgSm9obiBMb2NrZXIsIEVzcS4sIEhhcmNvdXJ0IFN0cmVldCwgQ2hhcmxlbW91bnQgU3RyZWV0LCBQb3J0b2JlbGxvLCBldGMuIERhdGU6IDE3OTJcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE1NVwiLCBcInhcIjogLTE1MDYsIFwieVwiOiAtNTAuNSwgXCJ6b29tWFwiOiAxLjAxLCBcInpvb21ZXCI6IDAuOTcyLCBcInJvdGF0aW9uXCI6IC0wLjAyNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE1NS1tLnBuZ1wiLCBcInZpc2liaWxlXCI6IGZhbHNlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJOZXcgYXBwcm9hY2ggZnJvbSBNaWxpdGFyeSBSb2FkIHRvIEtpbmfigJlzIEJyaWRnZSwgYW5kIGFsb25nIHRoZSBRdWF5cyB0byBBc3RvbuKAmXMgUXVheSBEYXRlOiAxODQxXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNTctM1wiLCBcInhcIjogMy4xMTUsIFwieVwiOiAzLjY1LCBcInpvb21YXCI6IDAuNTI1LCBcInpvb21ZXCI6IDAuNTksIFwicm90YXRpb25cIjogMC41NCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE1Ny0zLW0ucG5nXCIsIFwidmlzaWJpbGVcIjogZmFsc2UsIFwib3BhY2l0eVwiOiAwLjAsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJzaG93aW5nIHRoZSBpbXByb3ZlbWVudHMgcHJvcG9zZWQgYnkgdGhlIENvbW1pc3Npb25lcnMgb2YgV2lkZSBTdHJlZXRzIGluIE5hc3NhdSBTdHJlZXQsIExlaW5zdGVyIFN0cmVldCBhbmQgQ2xhcmUgU3RyZWV0XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNjRcIiwgXCJ4XCI6IC00NzIsIFwieVwiOjgwNSwgXCJ6b29tWFwiOiAwLjA1NiwgXCJ6b29tWVwiOiAwLjA1NiwgXCJyb3RhdGlvblwiOiAwLjA5LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTY0LWwucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDEuMCwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gb2YgU2FpbnQgUGF0cmlja+KAmXMsIGV0Yy4gRGF0ZTogMTgyNFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTg0LTFcIiwgXCJ4XCI6IC0yLjI3LCBcInlcIjogNS45NSwgXCJ6b29tWFwiOiAwLjQsIFwiem9vbVlcIjogMC40LCBcInJvdGF0aW9uXCI6IDAuMDM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTg0LTEtZnJvbnQuanBnXCIsIFwidmlzaWJpbGVcIjogZmFsc2UsIFwib3BhY2l0eVwiOiAwLjBcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MzMtMlwiLCBcInhcIjogLTIuODQ2LCBcInlcIjogNi4xMjUsIFwiem9vbVhcIjogMC4xOTksIFwiem9vbVlcIjogMC4yMDUsIFwicm90YXRpb25cIjogLTAuMDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNDMzLTIuanBnXCIsIFwidmlzaWJpbGVcIjogZmFsc2UsIFwib3BhY2l0eVwiOiAwLjBcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00NjctMDJcIiwgXCJ4XCI6IDEuODQ1LCBcInlcIjogOC4xMiwgXCJ6b29tWFwiOiAwLjgzLCBcInpvb21ZXCI6IDAuODMsIFwicm90YXRpb25cIjogLTIuNzI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNDY3LTAyLmpwZ1wiLCBcInZpc2liaWxlXCI6IGZhbHNlLCBcIm9wYWNpdHlcIjogMC4wXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDY5LTAyXCIsIFwieFwiOiAyNTUsIFwieVwiOiAxMzg5LjUsIFwiem9vbVhcIjogMC4yNDUsIFwiem9vbVlcIjogMC4yNDUsIFwicm90YXRpb25cIjogLTIuNzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy00NjktMi1tLnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJFYXJsc2ZvcnQgVGVycmFjZSwgU3RlcGhlbuKAmXMgR3JlZW4gU291dGggYW5kIEhhcmNvdXJ0IFN0cmVldCBzaG93aW5nIHBsYW4gb2YgcHJvcG9zZWQgbmV3IHN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzU1LTFcIiwgXCJ4XCI6IDY5NiwgXCJ5XCI6IDcxMy41LCBcInpvb21YXCI6IDAuMzIzLCBcInpvb21ZXCI6IDAuMjg5LCBcInJvdGF0aW9uXCI6IDEuMTQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzU1LTEucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gb2YgQmFnZ290IFN0cmVldCBhbmQgRml0endpbGxpYW0gU3RyZWV0LCBzaG93aW5nIGF2ZW51ZXMgdGhlcmVvZiBOby4gMSBEYXRlOiAxNzkwXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy03MjlcIiwgXCJ4XCI6IC0xMDg4LjUsIFwieVwiOiA2NTIsIFwiem9vbVhcIjogMC4xODQsIFwiem9vbVlcIjogMC4xODQsIFwicm90YXRpb25cIjogLTMuNDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNzI5LnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBKYW1lc+KAmXMgU3RyZWV0LCBCYXNvbiBMYW5lLCBFY2hsaW7igJlzIExhbmUsIEdyYW5kIENhbmFsIFBsYWNlLCBDaXR5IEJhc29uIGFuZCBHcmFuZCBDYW5hbCBIYXJib3VyXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy03NTdcIiwgXCJ4XCI6IC04ODEsIFwieVwiOiAyNjEuNSwgXCJ6b29tWFwiOiAwLjM1NSwgXCJ6b29tWVwiOiAwLjM1NSwgXCJyb3RhdGlvblwiOiAtMC4wMjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy03NTctbC5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiZm91ciBjb3VydHMgdG8gc3QgcGF0cmlja3MsIHRoZSBjYXN0bGUgdG8gdGhvbWFzIHN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTM4XCIsIFwieFwiOiAyMTIuNSwgXCJ5XCI6IDE0NywgXCJ6b29tWFwiOiAwLjE5LCBcInpvb21ZXCI6IDAuMTc2LCBcInJvdGF0aW9uXCI6IDAsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0xMzgtbC5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcHJlbWlzZXMsIEdlb3JnZeKAmXMgUXVheSwgQ2l0eSBRdWF5LCBUb3duc2VuZCBTdHJlZXQgYW5kIG5laWdoYm91cmhvb2QsIHNob3dpbmcgcHJvcGVydHkgbG9zdCB0byB0aGUgQ2l0eSwgaW4gYSBzdWl0IGJ5ICdUaGUgQ29ycG9yYXRpb24gLSB3aXRoIFRyaW5pdHkgQ29sbGVnZSdcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE4OVwiLCBcInhcIjogLTc5Mi41LCBcInlcIjogMjYyLjUsIFwiem9vbVhcIjogMC4yNiwgXCJ6b29tWVwiOiAwLjI1OCwgXCJyb3RhdGlvblwiOiAwLjAwMywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xODkucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQ29weSBvZiBtYXAgb2YgcHJvcG9zZWQgTmV3IFN0cmVldCBmcm9tIEVzc2V4IFN0cmVldCB0byBDb3JubWFya2V0LCB3aXRoIHRoZSBlbnZpcm9ucyBhbmQgc3RyZWV0cyBicmFuY2hpbmcgb2ZmXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wOThcIiwgXCJ4XCI6IC00NzUsIFwieVwiOiA1MjQsIFwiem9vbVhcIjogMC4wNjMsIFwiem9vbVlcIjogMC4wNjMsIFwicm90YXRpb25cIjogLTAuMTYsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0wOTgucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIENocmlzdGNodXJjaCwgU2tpbm5lcnMgUm93IGV0Yy4gVGhvbWFzIFNoZXJyYXJkLCA1IEphbnVhcnkgMTgyMSBEYXRlOiAxODIxXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yMDJcIiwgXCJ4XCI6IDE2LCBcInlcIjogODEsIFwiem9vbVhcIjogMC4yODksIFwiem9vbVlcIjogMC4yNjMsIFwicm90YXRpb25cIjogLTAuMTA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTIwMi1jLnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjQsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcImFyZWEgaW1tZWRpYXRlbHkgbm9ydGggb2YgUml2ZXIgTGlmZmV5IGZyb20gU2Fja3ZpbGxlIFN0LCBMb3dlciBBYmJleSBTdCwgQmVyZXNmb3JkIFBsYWNlLCBhcyBmYXIgYXMgZW5kIG9mIE5vcnRoIFdhbGwuIEFsc28gc291dGggb2YgTGlmZmV5IGZyb20gV2VzdG1vcmxhbmQgU3RyZWV0IHRvIGVuZCBvZiBKb2huIFJvZ2Vyc29uJ3MgUXVheVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTc5XCIsIFwieFwiOiAtNTM3LjUsIFwieVwiOiA3MzAsIFwiem9vbVhcIjogMC4xNjgsIFwiem9vbVlcIjogMC4xNjQsIFwicm90YXRpb25cIjogMC4wMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xNzkucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDEuMCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU2FpbnQgUGF0cmlja+KAmXMgQ2F0aGVkcmFsLCBOb3J0aCBDbG9zZSBhbmQgdmljaW5pdHlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTMyOVwiLCBcInhcIjogLTY3OCwgXCJ5XCI6IDM0NS41LCBcInpvb21YXCI6IDAuMzM2LCBcInpvb21ZXCI6IDAuMzM2LCBcInJvdGF0aW9uXCI6IC0wLjIxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zMjkucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuMyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBmb3Igb3BlbmluZyBhbmQgd2lkZW5pbmcgYSBwcmluY2lwYWwgQXZlbnVlIHRvIHRoZSBDYXN0bGUsIG5vdyAoMTkwMCkgUGFybGlhbWVudCBTdHJlZXQgLSBzaG93aW5nIERhbWUgU3RyZWV0LCBDYXN0bGUgU3RyZWV0LCBhbmQgYWxsIHRoZSBBdmVudWVzIHRoZXJlb2YgRGF0ZTogMTc1N1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTg3XCIsIFwieFwiOiAtMjI2LCBcInlcIjogNDk0LjUsIFwiem9vbVhcIjogMC4wNjYsIFwiem9vbVlcIjogMC4wNjQsIFwicm90YXRpb25cIjogMC4wLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE4Ny5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMS4wLFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJBIHN1cnZleSBvZiBzZXZlcmFsIGhvbGRpbmdzIGluIFNvdXRoIEdyZWF0IEdlb3JnZSdzIFN0cmVldCAtIHRvdGFsIHB1cmNoYXNlIMKjMTE1MjguMTYuMyBEYXRlOjE4MDFcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTEyNFwiLCBcInhcIjogLTI3OSwgXCJ5XCI6IDM2NiwgXCJ6b29tWFwiOiAwLjA1NywgXCJ6b29tWVwiOiAwLjA1MSwgXCJyb3RhdGlvblwiOiAtMC4xNiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xMjQucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHByZW1pc2VzIGluIEVzc2V4IFN0cmVldCBhbmQgUGFybGlhbWVudCBTdHJlZXQsIHNob3dpbmcgRXNzZXggQnJpZGdlIGFuZCBPbGQgQ3VzdG9tIEhvdXNlLiBULiBhbmQgRC5ILiBTaGVycmFyZCBEYXRlOiAxODEzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zNjBcIiwgXCJ4XCI6IC0xNDQsIFwieVwiOiA0MjEuNSwgXCJ6b29tWFwiOiAwLjEyMSwgXCJ6b29tWVwiOiAwLjEwNywgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNjAucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gRGFtZSBTdHJlZXQgYW5kIGF2ZW51ZXMgdGhlcmVvZiAtIEV1c3RhY2UgU3RyZWV0LCBDZWNpbGlhIFN0cmVldCwgYW5kIHNpdGUgb2YgT2xkIFRoZWF0cmUsIEZvd25lcyBTdHJlZXQsIENyb3duIEFsbGV5IGFuZCBDb3BlIFN0cmVldCBEYXRlOiAxNzkyXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zNjJcIiwgXCJ4XCI6IDM4LCBcInlcIjogODcuNSwgXCJ6b29tWFwiOiAwLjIzMywgXCJ6b29tWVwiOiAwLjIzMywgXCJyb3RhdGlvblwiOiAwLjEyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM2Mi0xLnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjQsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcHMgLSBDb2xsZWdlIEdyZWVuLCBDb2xsZWdlIFN0cmVldCwgV2VzdG1vcmVsYW5kIFN0cmVldCBhbmQgYXZlbnVlcyB0aGVyZW9mLCBzaG93aW5nIHRoZSBzaXRlIG9mIFBhcmxpYW1lbnQgSG91c2UgYW5kIFRyaW5pdHkgQ29sbGVnZSBOby4gMSBEYXRlOiAxNzkzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zODdcIiwgXCJ4XCI6IDI4MCwgXCJ5XCI6IDQyMy41LCBcInpvb21YXCI6IDAuMDgzLCBcInpvb21ZXCI6IDAuMDc3LCBcInJvdGF0aW9uXCI6IDMuMDM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM4Ny5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTdXJ2ZXkgb2YgaG9sZGluZ3MgaW4gRmxlZXQgU3RyZWV0IGFuZCBDb2xsZWdlIFN0cmVldCwgc2hvd2luZyBzaXRlIG9mIE9sZCBXYXRjaCBIb3VzZSBEYXRlOiAxODAxXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yMThcIiwgXCJ4XCI6IC0yNDU1LCBcInlcIjogLTI4NC41LCBcInpvb21YXCI6IDAuNDUzLCBcInpvb21ZXCI6IDAuNDUxLCBcInJvdGF0aW9uXCI6IC0wLjA0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTIxOC5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTdXJ2ZXkgb2YgdGhlIExvbmcgTWVhZG93cyBhbmQgcGFydCBvZiB0aGUgUGhvZW5peCBQYXJrIGFuZCBQYXJrZ2F0ZSBTdHJlZXQgRGF0ZTogMTc4NlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjI5XCIsIFwieFwiOiAtMjM4NCwgXCJ5XCI6IDU1LjUsIFwiem9vbVhcIjogMC4zNzksIFwiem9vbVlcIjogMC4zNzksIFwicm90YXRpb25cIjogMC4wMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjI5LnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjYsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlNlY3Rpb24gYWNyb3NzIHRoZSBwcm9wb3NlZCBSb2FkIGZyb20gdGhlIFBhcmsgR2F0ZSB0byBJc2xhbmQgQnJpZGdlIEdhdGUgLSBub3cgKDE5MDApIENvbnluZ2hhbSBSb2FkIERhdGU6IDE3ODlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTI0MlwiLCBcInhcIjogLTQwNS41LCBcInlcIjogMjEsIFwiem9vbVhcIjogMC4wODQsIFwiem9vbVlcIjogMC4wODQsIFwicm90YXRpb25cIjogMS4wODUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjQyLTIucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIGEgaG9sZGluZyBpbiBNYXJ54oCZcyBMYW5lLCB0aGUgZXN0YXRlIG9mIHRoZSBSaWdodCBIb25vdXJhYmxlIExvcmQgTW91bnRqb3kgRGF0ZTogMTc5M1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjQ1XCIsIFwieFwiOiAtMjEwLjAsIFwieVwiOi0zOTcuNSwgXCJ6b29tWFwiOiAwLjA4NCwgXCJ6b29tWVwiOiAwLjA4NCwgXCJyb3RhdGlvblwiOiAtMC42MiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yNDUtMi5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgdGhlIEJhcmxleSBGaWVsZHMgZXRjLiwgYW5kIGEgcGxhbiBmb3Igb3BlbmluZyBhIHN0cmVldCBmcm9tIFJ1dGxhbmQgU3F1YXJlLCBEb3JzZXQgU3RyZWV0LCBiZWluZyBub3cgKDE4OTkpIGtub3duIGFzIFNvdXRoIEZyZWRlcmljayBTdHJlZXQgLSB3aXRoIHJlZmVyZW5jZSBEYXRlOiAxNzg5XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yNTdcIiwgXCJ4XCI6IDY4MS4wLCBcInlcIjotMTIyMy41LCBcInpvb21YXCI6IDAuMzQ2LCBcInpvb21ZXCI6IDAuMzg4LCBcInJvdGF0aW9uXCI6IDAuMjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjU3LnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBDbG9ubGlmZmUgUm9hZCBhbmQgdGhlIE9sZCBUdXJucGlrZSBIb3VzZSBhdCBCYWxseWJvdWdoIEJyaWRnZSAtIE5vcnRoIFN0cmFuZCBEYXRlOiAxODIzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yNjhcIiwgXCJ4XCI6IC0xNTI4LjAsIFwieVwiOiAxMDUuNSwgXCJ6b29tWFwiOiAwLjA4NiwgXCJ6b29tWVwiOiAwLjA4NiwgXCJyb3RhdGlvblwiOiAwLjA3LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTI2OC0zLnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCAtIFBhcmtnYXRlIFN0cmVldCwgQ29ueW5naGFtIFJvYWQsIHdpdGggcmVmZXJlbmNlIHRvIG5hbWVzIG9mIHRlbmFudHMgZW5kb3JzZWQgTm8uIDNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE3MVwiLCBcInhcIjogMTEyLjAsIFwieVwiOiAxODEuNSwgXCJ6b29tWFwiOiAwLjAyMSwgXCJ6b29tWVwiOiAwLjAyMSwgXCJyb3RhdGlvblwiOiAtMC4yNjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTcxLTIuanBlZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBMb3dlciBBYmJleSBTdHJlZXQsIHRvIGNvcm5lciBvZiBFZGVuIFF1YXkgKFNhY2t2aWxsZSBTdHJlZXQpIERhdGU6IDE4MTNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM4MFwiLCBcInhcIjogMjQxLjUsIFwieVwiOiAyODYsIFwiem9vbVhcIjogMC4wMzMsIFwiem9vbVlcIjogMC4wMzMsIFwicm90YXRpb25cIjogMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zODAtMS5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBGbGVldCBNYXJrZXQsIFBvb2xiZWcgU3RyZWV0LCBIYXdraW5zIFN0cmVldCwgVG93bnNlbmQgU3RyZWV0LCBGbGVldCBTdHJlZXQsIER1YmxpbiBTb2NpZXR5IFN0b3JlcyBEYXRlOiAxODAwXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMDlcIiwgXCJ4XCI6IDM2LjAsIFwieVwiOiAtMjk3LCBcInpvb21YXCI6IDAuMjE5LCBcInpvb21ZXCI6IDAuMjE5LCBcInJvdGF0aW9uXCI6IC0wLjQzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zMDkucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGFydCBvZiBHYXJkaW5lciBTdHJlZXQgYW5kIHBhcnQgb2YgR2xvdWNlc3RlciBTdHJlZXQsIGxhbmQgb3V0IGluIGxvdHMgZm9yIGJ1aWxkaW5nIC0gc2hvd2luZyBHbG91Y2VzdGVyIFN0cmVldCwgR2xvdWNlc3RlciBQbGFjZSwgdGhlIERpYW1vbmQsIFN1bW1lciBIaWxsLCBHcmVhdCBCcml0YWluIFN0cmVldCwgQ3VtYmVybGFuZCBTdHJlZXQsIE1hcmxib3Jv4oCZIFN0cmVldCwgTWFiYm90IFN0cmVldCwgTWVja2xpbmJ1cmdoIGV0Yy5EYXRlOiAxNzkxXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yOTRcIiwgXCJ4XCI6IDEyNS4wLCBcInlcIjogLTExOCwgXCJ6b29tWFwiOiAwLjEyOSwgXCJ6b29tWVwiOiAwLjEyOSwgXCJyb3RhdGlvblwiOiAtMC4xOTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0yOTQtMi5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTdXJ2ZXkgb2YgcGFydCBvZiB0aGUgTG9yZHNoaXAgb2YgU2FpbnQgTWFyeeKAmXMgQWJiZXkgLSBwYXJ0IG9mIHRoZSBlc3RhdGUgb2YgdGhlIFJpZ2h0IEhvbm9yYWJsZSBMdWtlIFZpc2NvdW50IE1vdW50am95LCBzb2xkIHRvIFJpY2hhcmQgRnJlbmNoIEVzcS4sIHB1cnN1YW50IHRvIGEgRGVjcmVlIG9mIEhpcyBNYWplc3R54oCZcyBIaWdoIENvdXJ0IG9mIENoYW5jZXJ5LCAxNyBGZWIgMTc5NFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzEwXCIsIFwieFwiOiA0NzQuMCwgXCJ5XCI6IC04MjEuNSwgXCJ6b29tWFwiOiAwLjU3NiwgXCJ6b29tWVwiOiAwLjU3NiwgXCJyb3RhdGlvblwiOiAwLjE0NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zMTAucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTm9ydGggTG90cyAtIGZyb20gdGhlIE5vcnRoIFN0cmFuZCBSb2FkLCB0byB0aGUgTm9ydGggYW5kIEVhc3QgV2FsbHMgRGF0ZTogMTc5M1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzI1XCIsIFwieFwiOiAtODkzLjAsIFwieVwiOiA0MSwgXCJ6b29tWFwiOiAwLjI4NiwgXCJ6b29tWVwiOiAwLjI4NiwgXCJyb3RhdGlvblwiOiAwLjAzLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMyNS5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTbWl0aGZpZWxkLCBBcnJhbiBRdWF5LCBIYXltYXJrZXQsIFdlc3QgQXJyYW4gU3RyZWV0LCBOZXcgQ2h1cmNoIFN0cmVldCwgQm93IExhbmUsIEJvdyBTdHJlZXQsIE1heSBMYW5lXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMjYtMVwiLCBcInhcIjogLTE0MTUuNSwgXCJ5XCI6IDExMi41LCBcInpvb21YXCI6IDAuMTE0LCBcInpvb21ZXCI6IDAuMTEyLCBcInJvdGF0aW9uXCI6IDAuMTcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzI2LTEucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQmFycmFjayBTdHJlZXQsIFBhcmsgU3RyZWV0LCBQYXJrZ2F0ZSBTdHJlZXQgYW5kIFRlbXBsZSBTdHJlZXQsIHdpdGggcmVmZXJlbmNlIHRvIG5hbWVzIG9mIHRlbmFudHMgYW5kIHByZW1pc2VzIE5vLiAxXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMjYtMlwiLCBcInhcIjogLTEyNTcuNSwgXCJ5XCI6IDE0My41LCBcInpvb21YXCI6IDAuMSwgXCJ6b29tWVwiOiAwLjEsIFwicm90YXRpb25cIjogMC4wNzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzI2LTIucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQmFycmFjayBTdHJlZXQsIFBhcmsgU3RyZWV0LCBQYXJrZ2F0ZSBTdHJlZXQgYW5kIFRlbXBsZSBTdHJlZXQsIHdpdGggcmVmZXJlbmNlIHRvIG5hbWVzIG9mIHRlbmFudHMgYW5kIHByZW1pc2VzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMzRcIiwgXCJ4XCI6IDkwLjUsIFwieVwiOiAzNTcsIFwiem9vbVhcIjogMC4xMjgsIFwiem9vbVlcIjogMC4xMjgsIFwicm90YXRpb25cIjogMS4yNjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzM0LnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkRhbWUgU3RyZWV0LCBDb2xsZWdlIEdyZWVuLCBHZW9yZ2XigJlzIExhbmUsIEdlb3JnZeKAmXMgU3RyZWV0LCBDaGVxdWVyIFN0cmVldCBhbmQgYXZlbnVlcyB0aGVyZW9mXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMTJcIiwgXCJ4XCI6IC0yOTgsIFwieVwiOiAzMzkuNSwgXCJ6b29tWFwiOiAwLjE4NSwgXCJ6b29tWVwiOiAwLjE4NSwgXCJyb3RhdGlvblwiOiAtMC4yNTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTEyLnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjEsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkRhbWUgU3RyZWV0LCBmcm9tIHRoZSBjb3JuZXIgb2YgUGFsYWNlIFN0cmVldCB0byB0aGUgY29ybmVyIG9mIEdlb3JnZeKAmXMgU3RyZWV0IC0gbGFpZCBvdXQgaW4gbG90cyBmb3IgYnVpbGRpbmcgTm9ydGggYW5kIFNvdXRoIGFuZCB2aWNpbml0eSBEYXRlOiAxNzgyXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zNTUtMlwiLCBcInhcIjogMTg1LCBcInlcIjogMTAyOSwgXCJ6b29tWFwiOiAwLjMwMiwgXCJ6b29tWVwiOiAwLjMwMiwgXCJyb3RhdGlvblwiOiAtMC40NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNTUtMi5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIEJhZ2dvdCBTdHJlZXQgYW5kIEZpdHp3aWxsaWFtIFN0cmVldCwgc2hvd2luZyBhdmVudWVzIHRoZXJlb2YgTm8uIDIgRGF0ZTogMTc5MlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzY4XCIsIFwieFwiOiAtNjg3LjUsIFwieVwiOiAyNzcuNSwgXCJ6b29tWFwiOiAwLjE1NiwgXCJ6b29tWVwiOiAwLjE1LCBcInJvdGF0aW9uXCI6IDAuMTIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzY4LnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBLaW5n4oCZcyBJbm4gUXVheSBhbmQgTWVyY2hhbnRzIFF1YXksIHNob3dpbmcgc2l0ZSBvZiBPcm1vbmQgQnJpZGdlIC0gYmVsb3cgQ2hhcmxlcyBTdHJlZXQgLSBhZnRlcndhcmRzIHJlbW92ZWQgYW5kIHJlLWVyZWN0ZWQgb3Bwb3NpdGUgV2luZXRhdmVybiBTdHJlZXQgRGF0ZTogMTc5N1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzcyXCIsIFwieFwiOiAzNDEuNSwgXCJ5XCI6IDI5Ni41LCBcInpvb21YXCI6IDAuMDM2LCBcInpvb21ZXCI6IDAuMDMzOSwgXCJyb3RhdGlvblwiOiAyLjk1NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNzIucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiR2VvcmdlJ3MgUXVheSwgV2hpdGVzIExhbmUsIGFuZCBIYXdraW5zIFN0cmVldCwgc2hvd2luZyBzaXRlIG9mIFN3ZWV0bWFuJ3MgQnJld2VyeSB3aGljaCByYW4gZG93biB0byBSaXZlciBMaWZmZXkgRGF0ZTogMTc5OVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzkwLTFcIiwgXCJ4XCI6IC04MDQuNSwgXCJ5XCI6IDQyMCwgXCJ6b29tWFwiOiAwLjIwNCwgXCJ6b29tWVwiOiAwLjIwMiwgXCJyb3RhdGlvblwiOiAtMC4wNywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zOTAtMS5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIHByb3Bvc2VkIE1hcmtldCBIb3VzZSwgYWRqb2luaW5nIFRob21hcyBTdHJlZXQsIFZpY2FyIFN0cmVldCwgTWFya2V0IFN0cmVldCBhbmQgRnJhbmNpcyBTdHJlZXQgRGF0ZTogMTgwMVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzk1LTNcIiwgXCJ4XCI6IC01ODgsIFwieVwiOiA1NzgsIFwiem9vbVhcIjogMC4wMzYsIFwiem9vbVlcIjogMC4wMzYsIFwicm90YXRpb25cIjogLTMuNjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzk1LTMucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTmV3IFJvdyBhbmQgQ3V0cHVyc2UgUm93IERhdGU6IDE4MDBcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQwNFwiLCBcInhcIjogLTE1LCBcInlcIjogMzc5LCBcInpvb21YXCI6IDAuMDY0LCBcInpvb21ZXCI6IDAuMDY0LCBcInJvdGF0aW9uXCI6IC0wLjMyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQwNC5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJBbmdsZXNlYSBTdHJlZXQgYW5kIFBhcmxpYW1lbnQgSG91c2UgRGF0ZTogMTgwMlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDExXCIsIFwieFwiOiAzNDMuNSwgXCJ5XCI6IDY1NywgXCJ6b29tWFwiOiAwLjA4NiwgXCJ6b29tWVwiOiAwLjA4NiwgXCJyb3RhdGlvblwiOiAwLjMyNSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQxMS5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJMZWluc3RlciBIb3VzZSBhbmQgcGFydCBvZiB0aGUgZXN0YXRlIG9mIFZpc2NvdW50IEZpdHp3aWxsaWFtIChmb3JtZXJseSBMZWluc3RlciBMYXduKSwgbGFpZCBvdXQgaW4gbG90cyBmb3IgYnVpbGRpbmcgLSBzaG93aW5nIEtpbGRhcmUgU3RyZWV0LCBVcHBlciBNZXJyaW9uIFN0cmVldCBhbmQgTGVpbnN0ZXIgUGxhY2UgKFN0cmVldCksIE1lcnJpb24gUGxhY2UsIGFuZCB0aGUgT2xkIEJvdW5kYXJ5IGJldHdlZW4gTGVpbnN0ZXIgYW5kIExvcmQgRml0endpbGxpYW0gLSB0YWtlbiBmcm9tIGEgbWFwIHNpZ25lZCBSb2JlcnQgR2lic29uLCBNYXkgMTgsIDE3NTQgRGF0ZTogMTgxMlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjUxXCIsIFwieFwiOiAyMjAsIFwieVwiOiA2NCwgXCJ6b29tWFwiOiAwLjIzNiwgXCJ6b29tWVwiOiAwLjIzNiwgXCJyb3RhdGlvblwiOiAtMS40OSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTI1MS5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcG9ydGlvbiBvZiBDaXR5LCBzaG93aW5nIE1vbnRnb21lcnkgU3RyZWV0LCBNZWNrbGluYnVyZ2ggU3RyZWV0LCBMb3dlciBHbG91Y2VzdGVyIFN0cmVldCBhbmQgcG9ydGlvbiBvZiBNYWJib3QgU3RyZWV0XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MTNcIiwgXCJ4XCI6IC0zNzMsIFwieVwiOiA4MDYuNSwgXCJ6b29tWFwiOiAwLjA3OCwgXCJ6b29tWVwiOiAwLjA3NiwgXCJyb3RhdGlvblwiOiAtMC4xNSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQxMy5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQZXRlciBTdHJlZXQsIFBldGVy4oCZcyBSb3csIFdoaXRlZnJpYXIgU3RyZWV0LCBXb29kIFN0cmVldCBhbmQgQnJpZGUgU3RyZWV0IC0gc2hvd2luZyBzaXRlIG9mIHRoZSBBbXBoaXRoZWF0cmUgaW4gQnJpZGUgU3RyZWV0LCB3aGVyZSB0aGUgTW9sZXluZXV4IENodXJjaCBub3cgKDE5MDApIHN0YW5kcyBEYXRlOiAxODEyXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MTRcIiwgXCJ4XCI6IC0xOTQuNSwgXCJ5XCI6IDM2NC41LCBcInpvb21YXCI6IDAuMDcyLCBcInpvb21ZXCI6IDAuMDc0LCBcInJvdGF0aW9uXCI6IC0wLjI0LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDE0LnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlRlbXBsZSBCYXIsIFdlbGxpbmd0b24gUXVheSwgT2xkIEN1c3RvbSBIb3VzZSwgQmFnbmlvIFNsaXAgZXRjLiBEYXRlOiAxODEzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MjFcIiwgXCJ4XCI6IC00NzQuNSwgXCJ5XCI6IDUyNywgXCJ6b29tWFwiOiAwLjA2MiwgXCJ6b29tWVwiOiAwLjA2LCBcInJvdGF0aW9uXCI6IC0wLjE4NSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQyMS5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgdGhlIHByZWNpbmN0cyBvZiBDaHJpc3QgQ2h1cmNoIER1Ymxpbiwgc2hvd2luZyBTa2lubmVycyBSb3csIHRvIHdoaWNoIGlzIGF0dGFjaGVkIGEgTWVtb3JhbmR1bSBkZW5vbWluYXRpbmcgdGhlIHByZW1pc2VzLCB0YWtlbiBieSB0aGUgQ29tbWlzc2lvbmVycyBvZiBXaWRlIFN0cmVldHMgZm9yIHRoZSBwdXJwb3NlIG9mIHdpZGVuaW5nIHNhaWQgU2tpbm5lcnMgUm93LCBub3cgKDE5MDApIGtub3duIGFzIENocmlzdCBDaHVyY2ggUGxhY2UgRGF0ZTogMTgxN1wiXG5cdH0sXG5cdHsgXG5cdFx0XCJuYW1lXCI6IFwid3NjLTQwOC0yXCIsIFwieFwiOiAtMzk3LjUsIFwieVwiOiA1NDUuNSwgXCJ6b29tWFwiOiAwLjA0NCwgXCJ6b29tWVwiOiAwLjA0NCwgXCJyb3RhdGlvblwiOiAtMC4xMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MDgtMi5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJXZXJidXJnaCBTdHJlZXQsIFNraW5uZXJzIFJvdywgRmlzaGFtYmxlIFN0cmVldCBhbmQgQ2FzdGxlIFN0cmVldCBEYXRlOiBjLiAxODEwXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MjUtMVwiLCBcInhcIjogLTkxNy41LCBcInlcIjogNTc3LjUsIFwiem9vbVhcIjogMC4wNDUsIFwiem9vbVlcIjogMC4wNDYsIFwicm90YXRpb25cIjogLTEuNDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQyNS0xLnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1lYXRoIFJvdywgTWFya+KAmXMgQWxsZXkgYW5kIERpcnR5IExhbmUgLSBzaG93aW5nIEJyaWRnZWZvb3QgU3RyZWV0LCBNYXNzIExhbmUsIFRob21hcyBTdHJlZXQgYW5kIFN0LiBDYXRoZXJpbmXigJlzIENodXJjaCBEYXRlOiAxODIwLTI0XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MjZcIiwgXCJ4XCI6IC03MzUuNSwgXCJ5XCI6IDU3OC41LCBcInpvb21YXCI6IDAuMDM0LCBcInpvb21ZXCI6IDAuMDM0LCBcInJvdGF0aW9uXCI6IDEuNTY1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQyNi5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2Ygc2V2ZXJhbCBob3VzZXMgYW5kIHByZW1pc2VzIG9uIHRoZSBFYXN0IHNpZGUgb2YgTWVhdGggUm93LCB0aGUgcHJvcGVydHkgb2YgTXIuIEpvaG4gV2Fsc2ggLSBzaG93aW5nIHRoZSBzaXR1YXRpb24gb2YgVGhvbWFzIFN0cmVldCwgSGFuYnVyeSBMYW5lIGFuZCBzaXRlIG9mIENoYXBlbCBEYXRlOiAxODIxXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMTItMVwiLCBcInhcIjogLTMwMywgXCJ5XCI6IDMzMi41LCBcInpvb21YXCI6IDAuMTg4LCBcInpvb21ZXCI6IDAuMTg4LCBcInJvdGF0aW9uXCI6IC0wLjI0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTExMi0xLnBuZ1wiLCBcInZpc2liaWxlXCI6IGZhbHNlLCBcIm9wYWNpdHlcIjogMC4xLFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJEYW1lIFN0cmVldCwgZnJvbSB0aGUgY29ybmVyIG9mIFBhbGFjZSBTdHJlZXQgdG8gdGhlIGNvcm5lciBvZiBHZW9yZ2XigJlzIFN0cmVldCAtIGxhaWQgb3V0IGluIGxvdHMgZm9yIGJ1aWxkaW5nIE5vcnRoIGFuZCBTb3V0aCBhbmQgdmljaW5pdHkgRGF0ZTogMTc4MlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDU1XCIsIFwieFwiOiA2MzUuNSwgXCJ5XCI6IDEyNTgsIFwiem9vbVhcIjogMC4yNjMsIFwiem9vbVlcIjogMC4yNjMsIFwicm90YXRpb25cIjogLTAuOSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00NTUucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiSGVyYmVydCBQbGFjZSBhbmQgQXZlbnVlcyBhZGphY2VudCB0byBVcHBlciBNb3VudCBTdHJlZXQsIHNob3dpbmcgVXBwZXIgQmFnZ290IFN0cmVldCAtIEhlcmJlcnQgU3RyZWV0LCBXYXJyaW5ndG9uIFBsYWNlIGFuZCBQZXJjeSBQbGFjZSwgTm9ydGh1bWJlcmxhbmQgUm9hZCBhbmQgTG93ZXIgTW91bnQgU3RyZWV0IERhdGU6IDE4MzNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE5OVwiLCBcInhcIjogODc4LjUsIFwieVwiOiAxMjE3LjUsIFwiem9vbVhcIjogMC4yNDEsIFwiem9vbVlcIjogMC4yNDEsIFwicm90YXRpb25cIjogMi4xMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTk5LTEucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHBhcnQgb2YgdGhlIGVzdGF0ZSBvZiB0aGUgSG9uLiBTaWRuZXkgSGVyYmVydCwgY2FsbGVkIFdpbHRvbiBQYXJhZGUsIHNob3dpbmcgdGhlIHByb3Bvc2VkIGFwcHJvcHJpYXRpb24gdGhlcmVvZiBpbiBzaXRlcyBmb3IgYnVpbGRpbmcuIEFsc28gc2hvd2luZyBCYWdnb3QgU3RyZWV0LCBHcmFuZCBDYW5hbCBhbmQgRml0endpbGxpYW0gUGxhY2UuXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00NjVcIiwgXCJ4XCI6IDMwMS41LCBcInlcIjogNzExLjUsIFwiem9vbVhcIjogMC4yMDcsIFwiem9vbVlcIjogMC4yMDcsIFwicm90YXRpb25cIjogMy4zLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQ2NS5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJHcmFmdG9uIFN0cmVldCwgTmFzc2F1IFN0cmVldCAoU291dGggc2lkZSkgYW5kIERhd3NvbiBTdHJlZXQgRGF0ZTogMTgzN1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDgwLTJcIiwgXCJ4XCI6IC02NSwgXCJ5XCI6IDM3NywgXCJ6b29tWFwiOiAwLjA3LCBcInpvb21ZXCI6IDAuMDcsIFwicm90YXRpb25cIjogLTAuMDQ1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQ4MC0yLnBuZ1wiLCBcInZpc2liaWxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjYsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk5vcnRoIHNpZGUgb2YgQ29sbGVnZSBHcmVlbiBzaG93aW5nIEF2ZW51ZXMgdGhlcmVvZiwgYW5kIGdyb3VuZCBwbGFuIG9mIFBhcmxpYW1lbnQgSG91c2UsIEFuZ2xlc2VhIFN0cmVldCwgQmxhY2ttb29yIFlhcmQgZXRjLiAtIHdpdGggcmVmZXJlbmNlIGdpdmluZyB0ZW5hbnRzLCBuYW1lcyBvZiBwcmVtaXNlcyByZXF1aXJlZCBvciBwdXJwb3NlIG9mIGltcHJvdmVtZW50LiBEYXRlOiAxNzg2XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00OTFcIiwgXCJ4XCI6IC0yMS41LCBcInlcIjogOTM4LCBcInpvb21YXCI6IDAuMTY0LCBcInpvb21ZXCI6IDAuMTY0LCBcInJvdGF0aW9uXCI6IC0zLjA4LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQ5MS5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJBdW5naWVyIFN0cmVldCwgTWVyY2VyIFN0cmVldCwgWW9yayBTdHJlZXQgYW5kIEF2ZW51ZXMgdGhlcmVvZiwgdml6OiAtIEZyZW5jaCBTdHJlZXQgKE1lcmNlciBTdHJlZXQpLCBCb3cgTGFuZSwgRGlnZ2VzIExhbmUsIFN0ZXBoZW4gU3RyZWV0LCBEcnVyeSBMYW5lLCBHcmVhdCBhbmQgTGl0dGxlIExvbmdmb3JkIFN0cmVldHNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ5NlwiLCBcInhcIjogLTI3OCwgXCJ5XCI6IDQ1NiwgXCJ6b29tWFwiOiAwLjAxOCwgXCJ6b29tWVwiOiAwLjAxOCwgXCJyb3RhdGlvblwiOiAtMy4yNiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00OTYucG5nXCIsIFwidmlzaWJpbGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRXNzZXggUXVheSwgQ2hhbmdlIEFsbGV5LCBTbW9jayBBbGxleSBhbmQgZ3JvdW5kIHBsYW4gb2YgU21vY2sgQWxsZXkgVGhlYXRyZVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNTA3XCIsIFwieFwiOiAtMjczLjUsIFwieVwiOiAzNTAuNCwgXCJ6b29tWFwiOiAwLjA4NywgXCJ6b29tWVwiOiAwLjA4NTksIFwicm90YXRpb25cIjogLTAuMjE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTUwNy5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJFc3NleCBTdHJlZXQsIFBhcmxpYW1lbnQgU3RyZWV0LCBzaG93aW5nIE9sZCBDdXN0b20gSG91c2UgUXVheSwgTG93ZXIgT3Jtb25kIFF1YXkgYW5kIERhbWUgU3RyZWV0XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MjMtMlwiLCBcInhcIjogMzQuNSwgXCJ5XCI6IDQ3OC41LCBcInpvb21YXCI6IDAuMDc4LCBcInpvb21ZXCI6IDAuMDgyLCBcInJvdGF0aW9uXCI6IC0zLjIxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MjMtMi5wbmdcIiwgXCJ2aXNpYmlsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDcm93biBBbGxleSwgQ29wZSBTdHJlZXQsIEFyZGlsbOKAmXMgUm93LCBUZW1wbGUgQmFyLCBBc3RvbuKAmXMgUXVheSBhbmQgV2VsbGluZ3RvbiBRdWF5IE5vLiAyIERhdGU6IDE4MjAtNVwiXG5cdH1cbl1cbiIsImltcG9ydCB7IENhbnZhc1ZpZXcgfSBmcm9tIFwiLi9ndHdvL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IFN0YXRpY0ltYWdlIH0gZnJvbSBcIi4vZ3R3by9zdGF0aWNcIjtcbmltcG9ydCB7IENvbnRhaW5lckxheWVyIH0gZnJvbSBcIi4vZ3R3by9sYXllclwiO1xuaW1wb3J0IHsgQmFzaWNUcmFuc2Zvcm0gfSBmcm9tIFwiLi9ndHdvL3ZpZXdcIjtcbmltcG9ydCB7IFN0YXRpY0dyaWQgfSBmcm9tIFwiLi9ndHdvL2dyaWRcIjtcbmltcG9ydCB7IFZpZXdDb250cm9sbGVyIH0gZnJvbSBcIi4vZ3R3by92aWV3Y29udHJvbGxlclwiO1xuaW1wb3J0IHsgSW1hZ2VDb250cm9sbGVyLCBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIgfSBmcm9tIFwiLi9ndHdvL2ltYWdlY29udHJvbGxlclwiO1xuaW1wb3J0IHsgVGlsZUxheWVyLCBUaWxlU3RydWN0LCB6b29tQnlMZXZlbH0gZnJvbSBcIi4vZ3R3by90aWxlbGF5ZXJcIjtcbmltcG9ydCB7IExheWVyTWFuYWdlciwgQ29udGFpbmVyTGF5ZXJNYW5hZ2VyIH0gZnJvbSBcIi4vZ3R3by9sYXllcm1hbmFnZXJcIjtcbmltcG9ydCB7IExheWVyQ29udHJvbGxlciB9IGZyb20gXCIuL2d0d28vbGF5ZXJjb250cm9sbGVyXCI7XG5cbmltcG9ydCAqIGFzIGZpcmVtYXBzIGZyb20gXCIuL2ltYWdlZ3JvdXBzL2ZpcmVtYXBzLmpzb25cIjtcbmltcG9ydCAqIGFzIGxhbmRtYXJrcyBmcm9tIFwiLi9pbWFnZWdyb3Vwcy9sYW5kbWFya3MuanNvblwiO1xuaW1wb3J0ICogYXMgd3NjIGZyb20gXCIuL2ltYWdlZ3JvdXBzL3dzYy5qc29uXCI7XG5cbmxldCBsYXllclN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDEsIDEsIDApO1xubGV0IGltYWdlTGF5ZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXIobGF5ZXJTdGF0ZSk7XG5cbmxldCBpbWFnZVN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0xNDQwLC0xNDQwLCAwLjIyMiwgMC4yMjIsIDApO1xuXG5sZXQgY291bnR5U3RhdGUgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oLTI2MzEsIC0yMDUxLjUsIDEuNzE2LCAxLjY3NCwgMCk7XG5sZXQgY291bnR5SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoY291bnR5U3RhdGUsIFwiaW1hZ2VzL0NvdW50eV9vZl90aGVfQ2l0eV9vZl9EdWJsaW5fMTgzN19tYXAucG5nXCIsIDAuNSk7XG5cbmxldCBiZ1N0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0xMTI2LC0xMDg2LCAxLjU4LCAxLjU1LCAwKTtcbmxldCBiZ0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKGJnU3RhdGUsIFwiaW1hZ2VzL2Ztc3MuanBlZ1wiLCAuNyk7XG5cbmxldCBncmlkVHJhbnNmb3JtID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDEsIDEsIDApO1xubGV0IHN0YXRpY0dyaWQgPSBuZXcgU3RhdGljR3JpZChncmlkVHJhbnNmb3JtLCAwLCBmYWxzZSwgMjU2LCAyNTYpO1xuXG5sZXQgc2VudGluZWxTdHJ1Y3QgPSBuZXcgVGlsZVN0cnVjdChcInF0aWxlL2R1Ymxpbi9cIiwgXCIucG5nXCIsIFwiaW1hZ2VzL3F0aWxlL2R1Ymxpbi9cIik7XG5cbmxldCBzZW50aW5lbFRyYW5zZm9ybSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgwLCAwLCAyLCAyLCAwKTtcbmxldCBzZW50aW5lbExheWVyID0gbmV3IFRpbGVMYXllcihzZW50aW5lbFRyYW5zZm9ybSwgc2VudGluZWxTdHJ1Y3QsIDE1ODE0LCAxMDYyMSwgMTUpO1xuLy9sZXQgc2VudGluZWxMYXllciA9IG5ldyBUaWxlTGF5ZXIoQmFzaWNUcmFuc2Zvcm0udW5pdFRyYW5zZm9ybSwgc2VudGluZWxTdHJ1Y3QsIDMxNjI4LCAyMTI0MiwgMTYpO1xuXG5pbWFnZUxheWVyLnNldChcImNvdW50eVwiLCBjb3VudHlJbWFnZSk7XG5pbWFnZUxheWVyLnNldChcImJhY2tncm91bmRcIiwgYmdJbWFnZSk7XG5cbmxldCBsYXllck1hbmFnZXIgPSBuZXcgTGF5ZXJNYW5hZ2VyKCk7XG5cbmxldCBmaXJlbWFwTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkTGF5ZXIoZmlyZW1hcHMsIFwiZmlyZW1hcHNcIik7XG5sZXQgbGFuZG1hcmtzTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkTGF5ZXIobGFuZG1hcmtzLCBcImxhbmRtYXJrc1wiKTtcbmxldCB3c2NMYXllciA9IGxheWVyTWFuYWdlci5hZGRMYXllcih3c2MsIFwid3NjXCIpO1xuXG5sZXQgZWRpdCA9IGZpcmVtYXBMYXllci5nZXQoXCIxN1wiKTtcblxubGV0IGNvbnRhaW5lckxheWVyTWFuYWdlciA9IG5ldyBDb250YWluZXJMYXllck1hbmFnZXIoZmlyZW1hcExheWVyKTtcbmNvbnRhaW5lckxheWVyTWFuYWdlci5zZXRTZWxlY3RlZChcIjE3XCIpO1xuXG5pbWFnZUxheWVyLnNldChcImZpcmVtYXBzXCIsIGZpcmVtYXBMYXllcik7XG5pbWFnZUxheWVyLnNldChcIndzY1wiLCB3c2NMYXllcik7XG5pbWFnZUxheWVyLnNldChcImxhbmRtYXJrc1wiLCBsYW5kbWFya3NMYXllcik7XG5cbndzY0xheWVyLnNldFRvcChcIjE3XCIpO1xuXG5mdW5jdGlvbiBzaG93TWFwKGRpdk5hbWU6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpdk5hbWUpO1xuICAgIGxldCBjYW52YXNUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oLTUxMiwgLTUxMiwgMC41LCAwLjUsIDApO1xuICAgIGxldCBjYW52YXNWaWV3ID0gbmV3IENhbnZhc1ZpZXcoY2FudmFzVHJhbnNmb3JtLCBjYW52YXMuY2xpZW50V2lkdGgsIGNhbnZhcy5jbGllbnRIZWlnaHQsIGNhbnZhcyk7XG5cbiAgICBjYW52YXNWaWV3LmxheWVycy5wdXNoKHNlbnRpbmVsTGF5ZXIpO1xuICAgIGNhbnZhc1ZpZXcubGF5ZXJzLnB1c2goaW1hZ2VMYXllcik7XG4gICAgY2FudmFzVmlldy5sYXllcnMucHVzaChzdGF0aWNHcmlkKTtcblxuICAgIGxldCB0aWxlQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgc2VudGluZWxMYXllciwgXCJ2XCIpO1xuICAgIGxldCBiYXNlQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgYmdJbWFnZSwgXCJCXCIpO1xuICAgIGxldCBjb3VudHlDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBjb3VudHlJbWFnZSwgXCJWXCIpO1xuICAgIGxldCBmaXJlbWFwQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgZmlyZW1hcExheWVyLCBcImJcIik7XG4gICAgbGV0IHdzY0NvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHdzY0xheWVyLCBcIm5cIik7XG4gICAgbGV0IGxhbmRtYXJrQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgbGFuZG1hcmtzTGF5ZXIsIFwibVwiKTtcbiAgICBsZXQgZ3JpZENvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHN0YXRpY0dyaWQsIFwiZ1wiKTtcblxuICAgIGxldCBjb250cm9sbGVyID0gbmV3IFZpZXdDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGNhbnZhcywgY2FudmFzVmlldyk7XG5cbiAgICBsZXQgaW1hZ2VDb250cm9sbGVyID0gbmV3IEltYWdlQ29udHJvbGxlcihjYW52YXNWaWV3LCBlZGl0KTtcblxuICAgIGxldCBsYXllckNvbnRyb2xsZXIgPSBuZXcgTGF5ZXJDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGNvbnRhaW5lckxheWVyTWFuYWdlcik7XG5cbiAgICBkcmF3TWFwKGNhbnZhc1ZpZXcpO1xuXG59XG5cbmZ1bmN0aW9uIGRyYXdNYXAoY2FudmFzVmlldzogQ2FudmFzVmlldyl7XG4gICAgaWYgKCFjYW52YXNWaWV3LmRyYXcoKSApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJJbiB0aW1lb3V0XCIpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGRyYXdNYXAoY2FudmFzVmlldyl9LCA1MDApO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc2hvdygpe1xuXHRzaG93TWFwKFwiY2FudmFzXCIsIFwiVHlwZVNjcmlwdFwiKTtcbn1cblxuaWYgKFxuICAgIGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIiB8fFxuICAgIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSBcImxvYWRpbmdcIiAmJiAhZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmRvU2Nyb2xsKVxuKSB7XG5cdHNob3coKTtcbn0gZWxzZSB7XG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIHNob3cpO1xufSJdfQ==
