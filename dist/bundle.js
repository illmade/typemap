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
        if (topLayer != undefined) {
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
        else {
            console.log("top layer undefined " + name);
        }
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
    constructor(localTransform, imageSrc, opacity, visible) {
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
    constructor(localTransform, tileStruct, visbile, xOffset = 0, yOffset = 0, zoom = 1, gridWidth = 256, gridHeight = 256, opacity = 1) {
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
	"name": "5", "x": -366.5, "y": 180.019, "zoomX": 0.215, "zoomY": 0.207, "rotation": -0.21, 
	"src": "images/firemap/maps_145_b_4_(2)_f005r[SVC2].jpg", "visible": true, "opacity": 0.7
	},
	{
	"name": "6", "x": -206.16, "y": 146, "zoomX": 0.21, "zoomY": 0.208, "rotation": -0.215, 
	"src": "images/firemap/maps_145_b_4_(2)_f006r[SVC2].jpg", "visible": true, "opacity": 0.7
	},
	{
	"name": "7", "x": -63.3, "y": 100.3776, "zoomX": 0.2125, "zoomY": 0.213, "rotation": -0.23, 
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
	"name": "16-2", "x": -92, "y": 335, "zoomX": 0.217, "zoomY": 0.214, "rotation": -0.1, 
	"src": "images/firemap/maps_145_b_4_(2)_f016r_2[SVC2].png", "visible": true, "opacity": 0.7
	},
	{
	"name": "17", "x": 77, "y": 278.5, "zoomX": 0.206, "zoomY": 0.206, "rotation": -0.055, 
	"src": "images/firemap/maps_145_b_4_(2)_f017R[SVC2].jpg", "visible": true, "opacity": 0.7
	},
	{
	"name": "18", "x": 229, "y": 239.5, "zoomX": 0.208, "zoomY": 0.208, "rotation": 0.07, 
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
		"src": "images/wsc/wsc-maps-032-m.png", "visible": true, "opacity": 0.7, 
		"description": "Constitution Hill - Turnpike, Glasnevin Road; showing proposed road to Botanic Gardens"
	},
	{
		"name": "wsc-072", "x": -252, "y": -247, "zoomX": 0.318, "zoomY": 0.314, "rotation": 1.585, 
		"src": "images/wsc/wsc-maps-072-m.png", "visible": true, "opacity": 0.7,
		"description": "Plan of improving the streets between Richmond Bridge (Four Courts) and Constitution Hill (King’s Inns) Date: 1837"
	},
	{
		"name": "wsc-075", "x": -217.5, "y": -1414.5, "zoomX": 0.87, "zoomY": 0.772, "rotation": 1.615, 
		"src": "images/wsc/wsc-maps-075-m2.png", "visible": true, "opacity": 0.7,
		"description": "Survey of a line of road, leading from Linen Hall to Glasnevin Road, showing the Royal Canal Date: 1800"
	},
	{
		"name": "wsc-361", "x": 464, "y": 2131, "zoomX": 0.436, "zoomY": 0.436, "rotation": -2.04, 
		"src": "images/wsc/wsc-361.png", "visible": true, "opacity": 0.7,
		"description": "Leeson Street, Portland Street (now Upper Leeson Street), Eustace Place, Eustace Bridge (now Leeson Street), Hatch Street, Circular Road - signed by Commissioners of Wide Streets Date: 1792"
	},
	{
		"name": "wsc-088-1", "x": -0.9, "y": 2.67, "zoomX": 0.5, "zoomY": 0.5, "rotation": -3.32, 
		"src": "images/wsc/wsc-maps-088-1.jpg", "visible": true, "opacity": 0.0
	},
	{
		"name": "wsc-106-1", "x": -757, "y": 495.5, "zoomX": 0.265, "zoomY": 0.265, "rotation": -0.074, 
		"src": "images/wsc/wsc-maps-106-1.jpg", "visible": true, "opacity": 1.0, 
		"description": "Map showing proposed improvements to be made in Cornmarket, Cutpurse Row, Lamb Alley - Francis Street - and an improved entrance from Kevin Street to Saint Patrick’s Cathedral, through Mitre Alley and at James’s Gate. Date: 1845-46 "
	},
	{
		"name": "wsc-142", "x": 94.995, "y": 2377.5, "zoomX": 0.482, "zoomY": 0.476, "rotation": -2.015, 
		"src": "images/wsc/wsc-maps-142-l.png", "visible": true, "opacity": 1.0,
		"description": "Map of the New Streets, and other improvements intended to be immediately executed. Situate on the South Side of the City of Dublin, submitted for the approbation of the Commissioners of Wide Streets, particularly of those parts belonging to Wm. Cope and John Locker, Esq., Harcourt Street, Charlemount Street, Portobello, etc. Date: 1792"
	},
	{
		"name": "wsc-155", "x": -1506, "y": -50.5, "zoomX": 1.01, "zoomY": 0.972, "rotation": -0.025, 
		"src": "images/wsc/wsc-maps-155-m.png", "visible": true, "opacity": 0.6,
		"description": "New approach from Military Road to King’s Bridge, and along the Quays to Aston’s Quay Date: 1841"
	},
	{
		"name": "wsc-157-3", "x": 3.115, "y": 3.65, "zoomX": 0.525, "zoomY": 0.59, "rotation": 0.54, 
		"src": "images/wsc/wsc-maps-157-3-m.png", "visible": true, "opacity": 0.0, 
		"description": "showing the improvements proposed by the Commissioners of Wide Streets in Nassau Street, Leinster Street and Clare Street"
	},
	{
		"name": "wsc-164", "x": -472, "y":805, "zoomX": 0.056, "zoomY": 0.056, "rotation": 0.09, 
		"src": "images/wsc/wsc-maps-164-l.png", "visible": true, "opacity": 1.0, 
		"description": "Plan of Saint Patrick’s, etc. Date: 1824"
	},
	{
		"name": "wsc-469-02", "x": 255, "y": 1389.5, "zoomX": 0.245, "zoomY": 0.245, "rotation": -2.75, 
		"src": "images/wsc/wsc-maps-469-2-m.png", "visible": true, "opacity": 0.8, 
		"description": "Earlsfort Terrace, Stephen’s Green South and Harcourt Street showing plan of proposed new street"
	},
	{
		"name": "wsc-355-1", "x": 696, "y": 713.5, "zoomX": 0.323, "zoomY": 0.289, "rotation": 1.14, 
		"src": "images/wsc/wsc-355-1.png", "visible": true, "opacity": 0.8, 
		"description": "Plan of Baggot Street and Fitzwilliam Street, showing avenues thereof No. 1 Date: 1790"
	},
	{
		"name": "wsc-729", "x": -1088.5, "y": 652, "zoomX": 0.184, "zoomY": 0.184, "rotation": -3.425, 
		"src": "images/wsc/wsc-maps-729.png", "visible": true, "opacity": 0.5, 
		"description": "Map - James’s Street, Bason Lane, Echlin’s Lane, Grand Canal Place, City Bason and Grand Canal Harbour"
	},
	{
		"name": "wsc-757", "x": -881, "y": 261.5, "zoomX": 0.355, "zoomY": 0.355, "rotation": -0.025, 
		"src": "images/wsc/wsc-maps-757-l.png", "visible": true, "opacity": 0.5, 
		"description": "four courts to st patricks, the castle to thomas street"
	},
	{
		"name": "wsc-138", "x": 212.5, "y": 147, "zoomX": 0.19, "zoomY": 0.176, "rotation": 0, 
		"src": "images/wsc/wsc-maps-138-l.png", "visible": true, "opacity": 0.4,
		"description": "Map of premises, George’s Quay, City Quay, Townsend Street and neighbourhood, showing property lost to the City, in a suit by 'The Corporation - with Trinity College'"
	},
	{
		"name": "wsc-189", "x": -792.5, "y": 262.5, "zoomX": 0.26, "zoomY": 0.258, "rotation": 0.003, 
		"src": "images/wsc/wsc-189.png", "visible": true, "opacity": 0.7,
		"description": "Copy of map of proposed New Street from Essex Street to Cornmarket, with the environs and streets branching off"
	},
	{
		"name": "wsc-098", "x": -475, "y": 524, "zoomX": 0.063, "zoomY": 0.063, "rotation": -0.16, 
		"src": "images/wsc/wsc-maps-098.png", "visible": true, "opacity": 0.7,
		"description": "Map of Christchurch, Skinners Row etc. Thomas Sherrard, 5 January 1821 Date: 1821"
	},
	{
		"name": "wsc-202", "x": 16, "y": 81, "zoomX": 0.289, "zoomY": 0.263, "rotation": -0.105, 
		"src": "images/wsc/wsc-202-c.png", "visible": true, "opacity": 0.4,
		"description": "area immediately north of River Liffey from Sackville St, Lower Abbey St, Beresford Place, as far as end of North Wall. Also south of Liffey from Westmorland Street to end of John Rogerson's Quay"
	},
	{
		"name": "wsc-179", "x": -537.5, "y": 730, "zoomX": 0.168, "zoomY": 0.164, "rotation": 0.02, 
		"src": "images/wsc/wsc-179.png", "visible": true, "opacity": 1.0,
		"description": "Saint Patrick’s Cathedral, North Close and vicinity"
	},
	{
		"name": "wsc-329", "x": -678, "y": 345.5, "zoomX": 0.336, "zoomY": 0.336, "rotation": -0.215, 
		"src": "images/wsc/wsc-329.png", "visible": true, "opacity": 0.3,
		"description": "Plan for opening and widening a principal Avenue to the Castle, now (1900) Parliament Street - showing Dame Street, Castle Street, and all the Avenues thereof Date: 1757"
	},
	{
		"name": "wsc-187", "x": -226, "y": 494.5, "zoomX": 0.066, "zoomY": 0.064, "rotation": 0.0, 
		"src": "images/wsc/wsc-187.png", "visible": true, "opacity": 1.0,
		"description": "A survey of several holdings in South Great George's Street - total purchase £11528.16.3 Date:1801"
	},
	{
		"name": "wsc-124", "x": -279, "y": 366, "zoomX": 0.057, "zoomY": 0.051, "rotation": -0.16, 
		"src": "images/wsc/wsc-124.png", "visible": true, "opacity": 0.4,
		"description": "Map of premises in Essex Street and Parliament Street, showing Essex Bridge and Old Custom House. T. and D.H. Sherrard Date: 1813"
	},
	{
		"name": "wsc-360", "x": -144, "y": 421.5, "zoomX": 0.121, "zoomY": 0.107, "rotation": -0.05, 
		"src": "images/wsc/wsc-360.png", "visible": true, "opacity": 0.5,
		"description": "Map - Dame Street and avenues thereof - Eustace Street, Cecilia Street, and site of Old Theatre, Fownes Street, Crown Alley and Cope Street Date: 1792"
	},
	{
		"name": "wsc-362", "x": 35.5, "y": 84.5, "zoomX": 0.229, "zoomY": 0.235, "rotation": 0.125, 
		"src": "images/wsc/wsc-362-1.png", "visible": true, "opacity": 0.4,
		"description": "Maps - College Green, College Street, Westmoreland Street and avenues thereof, showing the site of Parliament House and Trinity College No. 1 Date: 1793"
	},
	{
		"name": "wsc-387", "x": 272.5, "y": 423.5, "zoomX": 0.081, "zoomY": 0.077, "rotation": 3.035, 
		"src": "images/wsc/wsc-387.png", "visible": true, "opacity": 0.7,
		"description": "Survey of holdings in Fleet Street and College Street, showing site of Old Watch House Date: 1801"
	},
	{
		"name": "wsc-218", "x": -2455, "y": -284.5, "zoomX": 0.453, "zoomY": 0.451, "rotation": -0.04, 
		"src": "images/wsc/wsc-218.png", "visible": true, "opacity": 0.8,
		"description": "Survey of the Long Meadows and part of the Phoenix Park and Parkgate Street Date: 1786"
	},
	{
		"name": "wsc-229", "x": -2384, "y": 55.5, "zoomX": 0.379, "zoomY": 0.379, "rotation": 0.015, 
		"src": "images/wsc/wsc-229.png", "visible": true, "opacity": 0.6,
		"description": "Section across the proposed Road from the Park Gate to Island Bridge Gate - now (1900) Conyngham Road Date: 1789"
	},
	{
		"name": "wsc-242", "x": -405.5, "y": 21, "zoomX": 0.084, "zoomY": 0.084, "rotation": 1.085, 
		"src": "images/wsc/wsc-242-2.png", "visible": true, "opacity": 0.8,
		"description": "Survey of a holding in Mary’s Lane, the estate of the Right Honourable Lord Mountjoy Date: 1793"
	},
	{
		"name": "wsc-245", "x": -210.0, "y":-397.5, "zoomX": 0.084, "zoomY": 0.084, "rotation": -0.62, 
		"src": "images/wsc/wsc-245-2.png", "visible": true, "opacity": 0.8,
		"description": "Map of the Barley Fields etc., and a plan for opening a street from Rutland Square, Dorset Street, being now (1899) known as South Frederick Street - with reference Date: 1789"
	},
	{
		"name": "wsc-257", "x": 681.0, "y":-1223.5, "zoomX": 0.346, "zoomY": 0.388, "rotation": 0.25, 
		"src": "images/wsc/wsc-257.png", "visible": true, "opacity": 0.8,
		"description": "Map of Clonliffe Road and the Old Turnpike House at Ballybough Bridge - North Strand Date: 1823"
	},
	{
		"name": "wsc-268", "x": -1528.0, "y": 105.5, "zoomX": 0.086, "zoomY": 0.086, "rotation": 0.07, 
		"src": "images/wsc/wsc-268-3.png", "visible": true, "opacity": 0.8,
		"description": "Map - Parkgate Street, Conyngham Road, with reference to names of tenants endorsed No. 3"
	},
	{
		"name": "wsc-171", "x": 112.0, "y": 181.5, "zoomX": 0.021, "zoomY": 0.021, "rotation": -0.265, 
		"src": "images/wsc/wsc-171-2.jpeg", "visible": true, "opacity": 0.8,
		"description": "Map of Lower Abbey Street, to corner of Eden Quay (Sackville Street) Date: 1813"
	},
	{
		"name": "wsc-380", "x": 241.5, "y": 286, "zoomX": 0.033, "zoomY": 0.033, "rotation": 0.05, 
		"src": "images/wsc/wsc-380-1.png", "visible": true, "opacity": 0.4,
		"description": "Map - Fleet Market, Poolbeg Street, Hawkins Street, Townsend Street, Fleet Street, Dublin Society Stores Date: 1800"
	},
	{
		"name": "wsc-309", "x": 36.0, "y": -297, "zoomX": 0.219, "zoomY": 0.219, "rotation": -0.435, 
		"src": "images/wsc/wsc-309.png", "visible": true, "opacity": 0.8,
		"description": "Part of Gardiner Street and part of Gloucester Street, land out in lots for building - showing Gloucester Street, Gloucester Place, the Diamond, Summer Hill, Great Britain Street, Cumberland Street, Marlboro’ Street, Mabbot Street, Mecklinburgh etc.Date: 1791"
	},
	{
		"name": "wsc-294", "x": 125.0, "y": -118, "zoomX": 0.129, "zoomY": 0.129, "rotation": -0.195, 
		"src": "images/wsc/wsc-maps-294-2.png", "visible": true, "opacity": 0.8,
		"description": "Survey of part of the Lordship of Saint Mary’s Abbey - part of the estate of the Right Honorable Luke Viscount Mountjoy, sold to Richard French Esq., pursuant to a Decree of His Majesty’s High Court of Chancery, 17 Feb 1794"
	},
	{
		"name": "wsc-310", "x": 474.0, "y": -821.5, "zoomX": 0.576, "zoomY": 0.576, "rotation": 0.145, 
		"src": "images/wsc/wsc-310.png", "visible": true, "opacity": 0.8,
		"description": "North Lots - from the North Strand Road, to the North and East Walls Date: 1793"
	},
	{
		"name": "wsc-325", "x": -893.0, "y": 41, "zoomX": 0.286, "zoomY": 0.286, "rotation": 0.03, 
		"src": "images/wsc/wsc-325.png", "visible": true, "opacity": 0.5,
		"description": "Smithfield, Arran Quay, Haymarket, West Arran Street, New Church Street, Bow Lane, Bow Street, May Lane"
	},
	{
		"name": "wsc-326-1", "x": -1415.5, "y": 112.5, "zoomX": 0.114, "zoomY": 0.112, "rotation": 0.17, 
		"src": "images/wsc/wsc-326-1.png", "visible": true, "opacity": 0.8,
		"description": "Barrack Street, Park Street, Parkgate Street and Temple Street, with reference to names of tenants and premises No. 1"
	},
	{
		"name": "wsc-632", "x": 125, "y": 347.5, "zoomX": 0.172, "zoomY": 0.164, "rotation": 0.53, 
		"src": "images/wsc/wsc-632.png", "visible": true, "opacity": 0.5,
		"description": "Map of Nassau Street, leading from Grafton Street to Merrion Square - showing the off streets and portion of Grafton Street and Suffolk Street Date: 1833"
	},
	{
		"name": "wsc-326-2", "x": -1257.5, "y": 143.5, "zoomX": 0.1, "zoomY": 0.1, "rotation": 0.075, 
		"src": "images/wsc/wsc-326-2.png", "visible": true, "opacity": 0.7,
		"description": "Barrack Street, Park Street, Parkgate Street and Temple Street, with reference to names of tenants and premises"
	},
	{
		"name": "wsc-334", "x": 90.5, "y": 357, "zoomX": 0.128, "zoomY": 0.128, "rotation": 1.265, 
		"src": "images/wsc/wsc-334.png", "visible": true, "opacity": 0.1,
		"description": "Dame Street, College Green, George’s Lane, George’s Street, Chequer Street and avenues thereof"
	},
	{
		"name": "wsc-355-2", "x": 185, "y": 1029, "zoomX": 0.302, "zoomY": 0.302, "rotation": -0.45, 
		"src": "images/wsc/wsc-355-2.png", "visible": true, "opacity": 0.7,
		"description": "Plan of Baggot Street and Fitzwilliam Street, showing avenues thereof No. 2 Date: 1792"
	},
	{
		"name": "wsc-368", "x": -687.5, "y": 277.5, "zoomX": 0.156, "zoomY": 0.15, "rotation": 0.12, 
		"src": "images/wsc/wsc-368.png", "visible": true, "opacity": 0.7,
		"description": "Map of King’s Inn Quay and Merchants Quay, showing site of Ormond Bridge - below Charles Street - afterwards removed and re-erected opposite Winetavern Street Date: 1797"
	},
	{
		"name": "wsc-372", "x": 341.5, "y": 296.5, "zoomX": 0.036, "zoomY": 0.0339, "rotation": 2.955, 
		"src": "images/wsc/wsc-372.png", "visible": true, "opacity": 0.7,
		"description": "George's Quay, Whites Lane, and Hawkins Street, showing site of Sweetman's Brewery which ran down to River Liffey Date: 1799"
	},
	{
		"name": "wsc-390-1", "x": -804.5, "y": 420, "zoomX": 0.204, "zoomY": 0.202, "rotation": -0.07, 
		"src": "images/wsc/wsc-390-1.png", "visible": true, "opacity": 0.5,
		"description": "Plan of proposed Market House, adjoining Thomas Street, Vicar Street, Market Street and Francis Street Date: 1801"
	},
	{
		"name": "wsc-395-3", "x": -588, "y": 578, "zoomX": 0.036, "zoomY": 0.036, "rotation": -3.65, 
		"src": "images/wsc/wsc-395-3.png", "visible": true, "opacity": 0.5,
		"description": "New Row and Cutpurse Row Date: 1800"
	},
	{
		"name": "wsc-404", "x": -16, "y": 372, "zoomX": 0.062, "zoomY": 0.06, "rotation": -0.255, 
		"src": "images/wsc/wsc-404.png", "visible": true, "opacity": 0.5,
		"description": "Anglesea Street and Parliament House Date: 1802"
	},
	{
		"name": "wsc-411", "x": 343.5, "y": 657, "zoomX": 0.086, "zoomY": 0.086, "rotation": 0.325,
		"src": "images/wsc/wsc-411.png", "visible": true, "opacity": 0.5,
		"description": "Leinster House and part of the estate of Viscount Fitzwilliam (formerly Leinster Lawn), laid out in lots for building - showing Kildare Street, Upper Merrion Street and Leinster Place (Street), Merrion Place, and the Old Boundary between Leinster and Lord Fitzwilliam - taken from a map signed Robert Gibson, May 18, 1754 Date: 1812"
	},
	{
		"name": "wsc-251", "x": 220, "y": 64, "zoomX": 0.236, "zoomY": 0.236, "rotation": -1.49,
		"src": "images/wsc/wsc-251.png", "visible": true, "opacity": 0.5,
		"description": "Map of portion of City, showing Montgomery Street, Mecklinburgh Street, Lower Gloucester Street and portion of Mabbot Street"
	},
	{
		"name": "wsc-413", "x": -373, "y": 806.5, "zoomX": 0.078, "zoomY": 0.076, "rotation": -0.15,
		"src": "images/wsc/wsc-413.png", "visible": true, "opacity": 0.5,
		"description": "Peter Street, Peter’s Row, Whitefriar Street, Wood Street and Bride Street - showing site of the Amphitheatre in Bride Street, where the Moleyneux Church now (1900) stands Date: 1812"
	},
	{
		"name": "wsc-414", "x": -193.5, "y": 363.5, "zoomX": 0.072, "zoomY": 0.074, "rotation": -0.23,
		"src": "images/wsc/wsc-414.png", "visible": true, "opacity": 0.5,
		"description": "Temple Bar, Wellington Quay, Old Custom House, Bagnio Slip etc. Date: 1813"
	},
	{
		"name": "wsc-421", "x": -474.5, "y": 527, "zoomX": 0.062, "zoomY": 0.06, "rotation": -0.185,
		"src": "images/wsc/wsc-421.png", "visible": true, "opacity": 0.6,
		"description": "Map of the precincts of Christ Church Dublin, showing Skinners Row, to which is attached a Memorandum denominating the premises, taken by the Commissioners of Wide Streets for the purpose of widening said Skinners Row, now (1900) known as Christ Church Place Date: 1817"
	},
	{ 
		"name": "wsc-408-2", "x": -397.5, "y": 545.5, "zoomX": 0.044, "zoomY": 0.044, "rotation": -0.12, 
		"src": "images/wsc/wsc-408-2.png", "visible": true, "opacity": 0.5,
		"description": "Werburgh Street, Skinners Row, Fishamble Street and Castle Street Date: c. 1810"
	},
	{
		"name": "wsc-425-1", "x": -917.5, "y": 577.5, "zoomX": 0.045, "zoomY": 0.046, "rotation": -1.425, 
		"src": "images/wsc/wsc-425-1.png", "visible": true, "opacity": 0.5,
		"description": "Meath Row, Mark’s Alley and Dirty Lane - showing Bridgefoot Street, Mass Lane, Thomas Street and St. Catherine’s Church Date: 1820-24"
	},
	{
		"name": "wsc-426", "x": -735.5, "y": 578.5, "zoomX": 0.034, "zoomY": 0.034, "rotation": 1.565, 
		"src": "images/wsc/wsc-426.png", "visible": true, "opacity": 0.5,
		"description": "Map of several houses and premises on the East side of Meath Row, the property of Mr. John Walsh - showing the situation of Thomas Street, Hanbury Lane and site of Chapel Date: 1821"
	},
	{
		"name": "wsc-112-1", "x": -290.5, "y": 344.5, "zoomX": 0.18, "zoomY": 0.182, "rotation": -0.26, 
		"src": "images/wsc/wsc-112-1.png", "visible": true, "opacity": 0.3,
		"description": "Dame Street, from the corner of Palace Street to the corner of George’s Street - laid out in lots for building North and South and vicinity Date: 1782"
	},
	{
		"name": "wsc-112", "x": -298, "y": 339.5, "zoomX": 0.185, "zoomY": 0.185, "rotation": -0.255, 
		"src": "images/wsc/wsc-112.png", "visible": false, "opacity": 0.0,
		"description": "Dame Street, from the corner of Palace Street to the corner of George’s Street - laid out in lots for building North and South and vicinity Date: 1782"
	},
	{
		"name": "wsc-455", "x": 635.5, "y": 1258, "zoomX": 0.263, "zoomY": 0.263, "rotation": -0.9, 
		"src": "images/wsc/wsc-455.png", "visible": true, "opacity": 0.6,
		"description": "Herbert Place and Avenues adjacent to Upper Mount Street, showing Upper Baggot Street - Herbert Street, Warrington Place and Percy Place, Northumberland Road and Lower Mount Street Date: 1833"
	},
	{
		"name": "wsc-199", "x": 878.5, "y": 1217.5, "zoomX": 0.241, "zoomY": 0.241, "rotation": 2.115, 
		"src": "images/wsc/wsc-199-1.png", "visible": true, "opacity": 0.6,
		"description": "Map of part of the estate of the Hon. Sidney Herbert, called Wilton Parade, showing the proposed appropriation thereof in sites for building. Also showing Baggot Street, Grand Canal and Fitzwilliam Place."
	},
	{
		"name": "wsc-465", "x": 301.5, "y": 711.5, "zoomX": 0.207, "zoomY": 0.207, "rotation": 3.3, 
		"src": "images/wsc/wsc-465.png", "visible": true, "opacity": 0.6,
		"description": "Grafton Street, Nassau Street (South side) and Dawson Street Date: 1837"
	},
	{
		"name": "wsc-480-2", "x": -63, "y": 382, "zoomX": 0.068, "zoomY": 0.068, "rotation": -0.055, 
		"src": "images/wsc/wsc-480-2.png", "visible": true, "opacity": 0.6,
		"description": "North side of College Green showing Avenues thereof, and ground plan of Parliament House, Anglesea Street, Blackmoor Yard etc. - with reference giving tenants, names of premises required or purpose of improvement. Date: 1786"
	},
	{
		"name": "wsc-491", "x": -21.5, "y": 938, "zoomX": 0.164, "zoomY": 0.164, "rotation": -3.08, 
		"src": "images/wsc/wsc-491.png", "visible": true, "opacity": 0.8,
		"description": "Aungier Street, Mercer Street, York Street and Avenues thereof, viz: - French Street (Mercer Street), Bow Lane, Digges Lane, Stephen Street, Drury Lane, Great and Little Longford Streets"
	},
	{
		"name": "wsc-496", "x": -278, "y": 456, "zoomX": 0.018, "zoomY": 0.018, "rotation": -3.26, 
		"src": "images/wsc/wsc-496.png", "visible": true, "opacity": 0.7,
		"description": "Essex Quay, Change Alley, Smock Alley and ground plan of Smock Alley Theatre"
	},
	{
		"name": "wsc-507", "x": -272.5, "y": 346, "zoomX": 0.087, "zoomY": 0.089, "rotation": -0.2, 
		"src": "images/wsc/wsc-507.png", "visible": true, "opacity": 0.7,
		"description": "Essex Street, Parliament Street, showing Old Custom House Quay, Lower Ormond Quay and Dame Street"
	},
	{
		"name": "wsc-206-1", "x": -44.5, "y": -221, "zoomX": 0.05, "zoomY": 0.05, "rotation": -0.65, 
		"src": "images/wsc/wsc-206-1.png", "visible": true, "opacity": 0.5,
		"description": "Map of angle of Cavendish Row, Rutland Square and Great Britain Street - showing unsigned elevations and ground plan of Rotunda by Frederick Trench. Date: 1787"
	},
	{
		"name": "wsc-203", "x": -392, "y": 272.5, "zoomX": 0.078, "zoomY": 0.076, "rotation": -0.25, 
		"src": "images/wsc/wsc-203.png", "visible": true, "opacity": 0.5,
		"description": "City Survey - showing Ormond Quay, Arran Street, Mary’s Abbey, Little Strand Street, Capel Street and Essex Bridge Date: 1811"
	},
	{
		"name": "wsc-515", "x": -75, "y": 550, "zoomX": 0.088, "zoomY": 0.088, "rotation": 2.935, 
		"src": "images/wsc/wsc-515.png", "visible": true, "opacity": 0.5,
		"description": "showing Dame Street, Essex Street etc. - also site for proposed National Bank, on or about where the 'Empire' (formerly the 'Star') Theatre of Varieties now (1900) stands No.1"
	},
	{
		"name": "wsc-523-1", "x": -297.5, "y": 368.5, "zoomX": 0.088, "zoomY": 0.088, "rotation": -0.185, 
		"src": "images/wsc/wsc-523-1.png", "visible": true, "opacity": 0.5,
		"description": "Essex Street, Temple Bar and vicinity to Essex Bridge, showing proposed new quay wall (Wellington Quay)"
	},
	{
		"name": "wsc-423-2", "x": 34.5, "y": 478.5, "zoomX": 0.078, "zoomY": 0.082, "rotation": -3.215, 
		"src": "images/wsc/wsc-423-2.png", "visible": true, "opacity": 0.5,
		"description": "Crown Alley, Cope Street, Ardill’s Row, Temple Bar, Aston’s Quay and Wellington Quay No. 2 Date: 1820-5"
	},
	{
		"name": "wsc-535", "x": -209.5, "y": 325, "zoomX": 0.134, "zoomY": 0.134, "rotation": -0.07, 
		"src": "images/wsc/wsc-535.png", "visible": true, "opacity": 0.5,
		"description": "Wellington Quay - continuation of Eustace Street Date"
	},
	{
		"name": "wsc-567-3", "x": 194.5, "y": 450, "zoomX": 0.126, "zoomY": 0.126, "rotation": 1.48, 
		"src": "images/wsc/wsc-567-3.png", "visible": true, "opacity": 0.5,
		"description": "Map of a parcel of ground bounded by Grafton Street, College Green, and Chequer Lane - leased to Mr. Pooley (3 copies) No. 3 Date: 1682"
	},
	{
		"name": "wsc-594-1", "x": -564.5, "y": 572.5, "zoomX": 0.044, "zoomY": 0.044, "rotation": 2.535, 
		"src": "images/wsc/wsc-594-1.png", "visible": true, "opacity": 0.5,
		"description": "Map of New Hall Market - part of the City Estate Date: 1780"
	},
	{
		"name": "wsc-625-1", "x": -320.5, "y": 609.5, "zoomX": 0.058, "zoomY": 0.058, "rotation": 2.61, 
		"src": "images/wsc/wsc-625-1.png", "visible": true, "opacity": 0.5,
		"description": "Map of the Old Tholsell ground, formerly called Souther’s Lane, belonging to the City of Dublin - laid out for building, Nicholas Street, Skinners Row and Werburgh Street By A. R. Neville, C. S. Date: 1812"
	},
	{
		"name": "wsc-654", "x": -397.5, "y": 409, "zoomX": 0.122, "zoomY": 0.122, "rotation": -0.135, 
		"src": "images/wsc/wsc-654.png", "visible": true, "opacity": 0.5,
		"description": "Map of the ground plots of several holdings belonging to the City of Dublin, Madam O’Hara, Colonel Berry and others, on Back Quay - (Essex Quay) Blind Quay - Exchange Street, Essex Bridge, Crane Lane and Dame Street, Sycamore Alley - showing portion of the City Wall, Essex Gate, Dame Gate, Dames Mill and branch of the River Dodder"
	},
	{
		"name": "wsc-705", "x": -187.5, "y": 392, "zoomX": 0.04, "zoomY": 0.042, "rotation": -0.38, 
		"src": "images/wsc/wsc-705.png", "visible": true, "opacity": 0.5,
		"description": "Map of Essex Street and vicinity Date: 1806"
	},
	{
		"name": "wsc-725", "x": -654, "y": 226, "zoomX": 0.094, "zoomY": 0.094, "rotation": 0.07, 
		"src": "images/wsc/wsc-725.png", "visible": true, "opacity": 0.5,
		"description": "Church Street, Charles Street, Inn’s Quay - 'White Cross Inn' - rere of Four Courts - Ushers’ Quay, Merchant’s Quay, Wood Quay - with reference Date: 1833"
	},
	{
		"name": "wsc-198-1", "x": -459.5, "y": 469, "zoomX": 0.026, "zoomY": 0.026, "rotation": -0.305, 
		"src": "images/wsc/wsc-198-1.png", "visible": true, "opacity": 0.5,
		"description": "Map of Whitehorse Yard (Winetavern Street) Surveyor: Arthur Neville Date: 1847"
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
let countyImage = new static_1.StaticImage(countyState, "images/County_of_the_City_of_Dublin_1837_map.png", 0.5, true);
let bgState = new view_1.BasicTransform(-1126, -1086, 1.58, 1.55, 0);
let bgImage = new static_1.StaticImage(bgState, "images/fmss.jpeg", .6, true);
let tmState = new view_1.BasicTransform(-1033.5, 149, 0.59, 0.59, 0);
let tmImage = new static_1.StaticImage(tmState, "images/thingmot.png", .3, true);
let duState = new view_1.BasicTransform(-929, -105.5, 0.464, 0.506, 0);
let duImage = new static_1.StaticImage(duState, "images/dublin1610.jpg", .3, false);
let gridTransform = new view_1.BasicTransform(0, 0, 1, 1, 0);
let staticGrid = new grid_1.StaticGrid(gridTransform, 0, false, 256, 256);
let sentinelStruct = new tilelayer_1.TileStruct("qtile/dublin/", ".png", "images/qtile/dublin/");
let sentinelTransform = new view_1.BasicTransform(0, 0, 2, 2, 0);
let sentinelLayer = new tilelayer_1.TileLayer(sentinelTransform, sentinelStruct, true, 15814, 10621, 15);
//let sentinelLayer = new TileLayer(BasicTransform.unitTransform, sentinelStruct, 31628, 21242, 16);
imageLayer.set("county", countyImage);
imageLayer.set("background", bgImage);
let layerManager = new layermanager_1.LayerManager();
let firemapLayer = layerManager.addLayer(firemaps, "firemaps");
let landmarksLayer = layerManager.addLayer(landmarks, "landmarks");
let wscLayer = layerManager.addLayer(wsc, "wsc");
let edit = wscLayer.get("wsc-198-1");
let containerLayerManager = new layermanager_1.ContainerLayerManager(wscLayer);
containerLayerManager.setSelected("wsc-198-1");
imageLayer.set("wsc", wscLayer);
imageLayer.set("firemaps", firemapLayer);
imageLayer.set("dublin1610", duImage);
imageLayer.set("thingmot", tmImage);
imageLayer.set("landmarks", landmarksLayer);
wscLayer.setTop("wsc-535");
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
    let tmController = new imagecontroller_1.DisplayElementController(canvasView, tmImage, "N");
    let duController = new imagecontroller_1.DisplayElementController(canvasView, duImage, "M");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ3R3by9jYW52YXN2aWV3LnRzIiwic3JjL2d0d28vZ3JpZC50cyIsInNyYy9ndHdvL2ltYWdlY29udHJvbGxlci50cyIsInNyYy9ndHdvL2xheWVyLnRzIiwic3JjL2d0d28vbGF5ZXJjb250cm9sbGVyLnRzIiwic3JjL2d0d28vbGF5ZXJtYW5hZ2VyLnRzIiwic3JjL2d0d28vc3RhdGljLnRzIiwic3JjL2d0d28vdGlsZWxheWVyLnRzIiwic3JjL2d0d28vdmlldy50cyIsInNyYy9ndHdvL3ZpZXdjb250cm9sbGVyLnRzIiwic3JjL2ltYWdlZ3JvdXBzL2ZpcmVtYXBzLmpzb24iLCJzcmMvaW1hZ2Vncm91cHMvbGFuZG1hcmtzLmpzb24iLCJzcmMvaW1hZ2Vncm91cHMvd3NjLmpzb24iLCJzcmMvc2ltcGxlV29ybGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0NBLGlDQUtnQztBQVNoQyxNQUFhLFVBQVcsU0FBUSx5QkFBa0I7SUFLakQsWUFDQyxjQUF5QixFQUN6QixLQUFhLEVBQUUsTUFBYyxFQUNwQixhQUFnQztRQUV6QyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQ3RELGNBQWMsQ0FBQyxLQUFLLEVBQUUsY0FBYyxDQUFDLEtBQUssRUFDMUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBSmpCLGtCQUFhLEdBQWIsYUFBYSxDQUFtQjtRQU4xQyxXQUFNLEdBQXVCLEVBQUUsQ0FBQztRQVkvQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFbEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRCxTQUFTLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxNQUFjO1FBRXZDLElBQUksQ0FBQyxL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QUcsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUMvQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUQsSUFBSSxNQUFNLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUVoRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzlDLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDL0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzlELElBQUksT0FBTyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUU7UUFFbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBRTlDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUVoQixLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLElBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFDO1lBQy9CLDRCQUE0QjtZQUM1QixJQUFJLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQzVDLEdB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VSxDQUFDO2dCQUMzRCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDRCxLQUFLLEdBQUc7Z0JBQ0osSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQztnQkFDekQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ2hCLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsVUFBVSxDQUFDO2dCQUMzRCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDRCxLQUFLLEdBQUc7Z0JBQ0osSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQztnQkFDekQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1YsS0FBSyxHQUFHO2dCQUNKLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1YsS0FBSyxHQUFHO2dCQUNKLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDN0QsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1YsS0FBSyxHQUFHO2dCQUNKLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1YsS0FB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QUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ2pEO2FBQ0k7WUFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7WUFDaEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO1NBQ25EO1FBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMzQixDQUFDO0NBRUo7QUE1RkQsd0NBNEZDOzs7QUN2SEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUUsQ0FBQztDQUNQO0tBQU07SUFDTixRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDcEQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgeyBDYW52YXNMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBcblx0aW52ZXJ0VHJhbnNmb3JtLCBcblx0Vmlld1RyYW5zZm9ybSwgXG5cdEJhc2ljVmlld1RyYW5zZm9ybSwgXG5cdFRyYW5zZm9ybSwgXG5cdEJhc2ljVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIERpc3BsYXlFbGVtZW50IGV4dGVuZHMgVHJhbnNmb3JtIHtcblx0aXNWaXNpYmxlKCk6IGJvb2xlYW47XG5cdHNldFZpc2libGUodmlzaWJsZTogYm9vbGVhbik6IHZvaWQ7XG5cdGdldE9wYWNpdHkoKTogbnVtYmVyO1xuXHRzZXRPcGFjaXR5KG9wYWNpdHk6IG51bWJlcik6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBDYW52YXNWaWV3IGV4dGVuZHMgQmFzaWNWaWV3VHJhbnNmb3JtIHtcblxuXHRsYXllcnM6IEFycmF5PENhbnZhc0xheWVyPiA9IFtdO1xuXHRjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHR3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgXG5cdFx0cmVhZG9ubHkgY2FudmFzRWxlbWVudDogSFRNTENhbnZhc0VsZW1lbnQpe1xuXG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0ueCwgbG9jYWxUcmFuc2Zvcm0ueSwgd2lkdGgsIGhlaWdodCwgXG5cdFx0XHRsb2NhbFRyYW5zZm9ybS56b29tWCwgbG9jYWxUcmFuc2Zvcm0uem9vbVksIFxuXHRcdFx0bG9jYWxUcmFuc2Zvcm0ucm90YXRpb24pO1xuXG5cdFx0dGhpcy5pbml0Q2FudmFzKCk7XG5cblx0XHR0aGlzLmN0eCA9IGNhbnZhc0VsZW1lbnQuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHR9XG5cblx0em9vbUFib3V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB6b29tQnk6IG51bWJlcil7XG5cbiAgICAgICAgdGhpcy56b29tWCA9IHRoaXMuem9vbVggKiB6b29tQnk7XG4gICAgICAgIHRoaXMuem9vbVkgPSB0aGlzLnpvb21ZICogem9vbUJ5O1xuXG4gICAgICAgIGxldCByZWxhdGl2ZVggPSB4ICogem9vbUJ5IC0geDtcbiAgICAgICAgbGV0IHJlbGF0aXZlWSA9IHkgKiB6b29tQnkgLSB5O1xuXG4gICAgICAgIGxldCB3b3JsZFggPSByZWxhdGl2ZVggLyB0aGlzLnpvb21YO1xuICAgICAgICBsZXQgd29ybGRZID0gcmVsYXRpdmVZIC8gdGhpcy56b29tWTtcblxuICAgICAgICB0aGlzLnggPSB0aGlzLnggKyB3b3JsZFg7XG4gICAgICAgIHRoaXMueSA9IHRoaXMueSArIHdvcmxkWTtcblxuXHR9XG5cblx0ZHJhdygpOiBib29sZWFuIHtcblx0XHRsZXQgdHJhbnNmb3JtID0gaW52ZXJ0VHJhbnNmb3JtKHRoaXMpO1xuXG5cdFx0dGhpcy5jdHguZmlsbFN0eWxlID0gXCJncmV5XCI7XG5cdFx0dGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXG5cdFx0dmFyIGRyYXdpbmdDb21wbGV0ZSA9IHRydWU7XG5cblx0XHRmb3IgKGxldCBsYXllciBvZiB0aGlzLmxheWVycyl7XG5cdFx0XHRpZiAobGF5ZXIuaXNWaXNpYmxlKCkpe1xuXHRcdFx0XHRkcmF3aW5nQ29tcGxldGUgPSBkcmF3aW5nQ29tcGxldGUgJiYgbGF5ZXIuZHJhdyh0aGlzLmN0eCwgQmFzaWNUcmFuc2Zvcm0udW5pdFRyYW5zZm9ybSwgdGhpcyk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9XG5cblx0XHR0aGlzLmRyYXdDZW50cmUodGhpcy5jdHgpO1xuXG5cdFx0cmV0dXJuIGRyYXdpbmdDb21wbGV0ZTtcblx0fVxuXG5cdGRyYXdDZW50cmUoY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKXtcbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IDAuMztcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKHRoaXMud2lkdGgvMiwgNi8xNip0aGlzLmhlaWdodCk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKHRoaXMud2lkdGgvMiwgMTAvMTYqdGhpcy5oZWlnaHQpO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyg3LzE2KnRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LzIpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyg5LzE2KnRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LzIpO1xuICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gXCJibGFja1wiO1xuICAgICAgICBjb250ZXh0Lmdsb2JhbEFscGhhID0gMTtcbiAgICB9XG5cblx0cHJpdmF0ZSBpbml0Q2FudmFzKCl7XG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMuY2FudmFzRWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgbGV0IGhlaWdodCA9IHRoaXMuY2FudmFzRWxlbWVudC5jbGllbnRIZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC5oZWlnaHQgPSBoZWlnaHQ7XG5cdH1cblxufSIsImltcG9ydCB7IERyYXdMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBUcmFuc2Zvcm0sIFZpZXdUcmFuc2Zvcm0sIGNvbWJpbmVUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5cbi8qKlxuKiBXZSBkb24ndCB3YW50IHRvIGRyYXcgYSBncmlkIGludG8gYSB0cmFuc2Zvcm1lZCBjYW52YXMgYXMgdGhpcyBnaXZlcyB1cyBncmlkIGxpbmVzIHRoYXQgYXJlIHRvb1xudGhpY2sgb3IgdG9vIHRoaW5cbiovXG5leHBvcnQgY2xhc3MgU3RhdGljR3JpZCBleHRlbmRzIERyYXdMYXllciB7XG5cblx0em9vbVdpZHRoOiBudW1iZXI7XG5cdHpvb21IZWlnaHQ6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3Rvcihsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCB6b29tTGV2ZWw6IG51bWJlciwgdmlzaWJsZTogYm9vbGVhbixcblx0XHRyZWFkb25seSBncmlkV2lkdGg6IG51bWJlciA9IDI1NiwgcmVhZG9ubHkgZ3JpZEhlaWdodDogbnVtYmVyID0gMjU2KXtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCAxLCB2aXNpYmxlKTtcblxuXHRcdGxldCB6b29tID0gTWF0aC5wb3coMiwgem9vbUxldmVsKTtcblx0XHR0aGlzLnpvb21XaWR0aCA9IGdyaWRXaWR0aCAvIHpvb207XG5cdFx0dGhpcy56b29tSGVpZ2h0ID0gZ3JpZEhlaWdodCAvIHpvb207XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB0cmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0bGV0IG9mZnNldFggPSB2aWV3LnggKiB2aWV3Lnpvb21YO1xuXHRcdGxldCBvZmZzZXRZID0gdmlldy55ICogdmlldy56b29tWTtcblxuXHRcdGxldCB2aWV3V2lkdGggPSB2aWV3LndpZHRoIC8gdmlldy56b29tWDtcblx0XHRsZXQgdmlld0hlaWdodCA9IHZpZXcuaGVpZ2h0IC8gdmlldy56b29tWTtcblxuXHRcdGxldCBncmlkQWNyb3NzID0gdmlld1dpZHRoIC8gdGhpcy56b29tV2lkdGg7XG5cdFx0bGV0IGdyaWRIaWdoID0gdmlld0hlaWdodCAvIHRoaXMuem9vbUhlaWdodDtcblxuXHRcdGxldCB4TWluID0gTWF0aC5mbG9vcih2aWV3LngvdGhpcy56b29tV2lkdGgpO1xuXHRcdGxldCB4TGVmdCA9IHhNaW4gKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IHhNYXggPSBNYXRoLmNlaWwoKHZpZXcueCArIHZpZXdXaWR0aCkgLyB0aGlzLnpvb21XaWR0aCk7XG5cdFx0bGV0IHhSaWdodCA9IHhNYXggKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cblx0XHRsZXQgeU1pbiA9IE1hdGguZmxvb3Iodmlldy55L3RoaXMuem9vbUhlaWdodCk7XG5cdFx0bGV0IHlUb3AgPSB5TWluICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWDtcblx0XHRsZXQgeU1heCA9IE1hdGguY2VpbCgodmlldy55ICsgdmlld0hlaWdodCkgLyB0aGlzLnpvb21IZWlnaHQpO1xuXHRcdGxldCB5Qm90dG9tID0geU1heCAqIHRoaXMuem9vbUhlaWdodCAqIHZpZXcuem9vbVggO1xuXG5cdFx0Y29uc29sZS5sb2coXCJ4TWluIFwiICsgeE1pbiArIFwiIHhNYXggXCIgKyB4TWF4KTtcblx0XHRjb25zb2xlLmxvZyhcInlNaW4gXCIgKyB5TWluICsgXCIgeU1heCBcIiArIHlNYXgpO1xuXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXG5cdFx0Zm9yICh2YXIgeCA9IHhNaW47IHg8PXhNYXg7IHgrKyl7XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiYXQgXCIgKyBtaW5YKTtcblx0XHRcdGxldCB4TW92ZSA9IHggKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cdFx0XHRjdHgubW92ZVRvKHhNb3ZlIC0gb2Zmc2V0WCwgeVRvcCAtIG9mZnNldFkpO1xuXHRcdFx0Y3R4LmxpbmVUbyh4TW92ZSAtIG9mZnNldFgsIHlCb3R0b20gLSBvZmZzZXRZKTtcblx0XHR9XG5cblx0XHRmb3IgKHZhciB5ID0geU1pbjsgeTw9eU1heDsgeSsrKXtcblxuXHRcdFx0bGV0IHlNb3ZlID0geSAqIHRoaXMuem9vbUhlaWdodCAqIHZpZXcuem9vbVk7XG5cdFx0XHRjdHgubW92ZVRvKHhMZWZ0IC0gb2Zmc2V0WCwgeU1vdmUgLSBvZmZzZXRZKTtcblx0XHRcdGN0eC5saW5lVG8oeFJpZ2h0IC0gb2Zmc2V0WCwgeU1vdmUgLSBvZmZzZXRZKTtcblxuXHRcdFx0Zm9yICh2YXIgeCA9IHhNaW47IHg8PXhNYXg7IHgrKyl7XG5cdFx0XHRcdGxldCB4TW92ZSA9ICh4LS41KSAqIHRoaXMuem9vbVdpZHRoICogdmlldy56b29tWDtcblx0XHRcdFx0eU1vdmUgPSAoeS0uNSkgKiB0aGlzLnpvb21IZWlnaHQgKiB2aWV3Lnpvb21ZO1xuXHRcdFx0XHRsZXQgdGV4dCA9IFwiXCIgKyAoeC0xKSArIFwiLCBcIiArICh5LTEpO1xuXHRcdFx0XHRjdHguc3Ryb2tlVGV4dCh0ZXh0LCB4TW92ZSAtIG9mZnNldFgsIHlNb3ZlIC0gb2Zmc2V0WSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdGN0eC5zdHJva2UoKTtcblx0XHRjb25zb2xlLmxvZyhcImRyZXcgZ3JpZFwiKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG59IiwiXG5pbXBvcnQge0NhbnZhc1ZpZXcsIERpc3BsYXlFbGVtZW50fSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5pbXBvcnQge0NhbnZhc0xheWVyfSBmcm9tIFwiLi9sYXllclwiO1xuXG5leHBvcnQgY2xhc3MgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIHJlYWRvbmx5IGRpc3BsYXlFbGVtZW50OiBEaXNwbGF5RWxlbWVudCwgIHB1YmxpYyBtb2Q6IHN0cmluZyA9IFwidlwiKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLnByZXNzZWQoY2FudmFzVmlldywgZSAgYXMgS2V5Ym9hcmRFdmVudCkpO1xuICAgIH1cblxuICAgIHByZXNzZWQoY2FudmFzVmlldzogQ2FudmFzVmlldywgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcInByZXNzZWQgbGF5ZXJcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LmtleSk7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgIGNhc2UgdGhpcy5tb2Q6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0b2dnbGUgdmlzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlFbGVtZW50LnNldFZpc2libGUoIXRoaXMuZGlzcGxheUVsZW1lbnQuaXNWaXNpYmxlKCkpO1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VDb250cm9sbGVyIHtcblxuICAgIHByaXZhdGUgY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyO1xuXG4gICAgY29uc3RydWN0b3IoY2FudmFzVmlldzogQ2FudmFzVmlldywgY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyKSB7XG4gICAgXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLnByZXNzZWQoY2FudmFzVmlldywgZSAgYXMgS2V5Ym9hcmRFdmVudCkpO1xuICAgICAgICB0aGlzLmNhbnZhc0xheWVyID0gY2FudmFzTGF5ZXI7XG4gICAgfVxuXG4gICAgc2V0Q2FudmFzTGF5ZXIoY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyKXtcbiAgICAgICAgdGhpcy5jYW52YXNMYXllciA9IGNhbnZhc0xheWVyO1xuICAgIH1cblxuICAgIHByZXNzZWQoY2FudmFzVmlldzogQ2FudmFzVmlldywgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBcdGNvbnNvbGUubG9nKFwicHJlc3NlZFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQua2V5KTtcblxuICAgICAgICBsZXQgbXVsdGlwbGllciA9IDE7XG5cbiAgICBcdHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgXHRcdGNhc2UgXCJhXCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54IC0gMC41ICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHRjYW52YXNWaWV3LmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJBXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54IC0gNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgXHRcdGNhc2UgXCJkXCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54ICsgMC41ICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHRjYW52YXNWaWV3LmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJEXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54ICsgNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgXHRcdGNhc2UgXCJ3XCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci55ID0gdGhpcy5jYW52YXNMYXllci55IC0gMC41ICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHRjYW52YXNWaWV3LmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJXXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci55ID0gdGhpcy5jYW52YXNMYXllci55IC0gNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7ICAgIFxuICAgIFx0XHRjYXNlIFwic1wiOlxuICAgIFx0XHRcdHRoaXMuY2FudmFzTGF5ZXIueSA9IHRoaXMuY2FudmFzTGF5ZXIueSArIDAuNSAqIG11bHRpcGxpZXI7XG4gICAgXHRcdFx0Y2FudmFzVmlldy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiU1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIueSA9IHRoaXMuY2FudmFzTGF5ZXIueSArIDUgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImVcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uID0gdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiAtIDAuMDA1O1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIkVcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uID0gdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiAtIDAuMDU7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwicVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gPSB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uICsgMC4wMDU7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiUVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gPSB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uICsgMC4wNTtcbiAgICAgICAgICAgICAgICBjYW52YXNWaWV3LmRyYXcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICBcdFx0Y2FzZSBcInhcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnpvb21YID0gdGhpcy5jYW52YXNMYXllci56b29tWCAtIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHRjYW52YXNWaWV3LmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIlhcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnpvb21YID0gdGhpcy5jYW52YXNMYXllci56b29tWCArIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHRjYW52YXNWaWV3LmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInpcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnpvb21ZID0gdGhpcy5jYW52YXNMYXllci56b29tWSAtIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHRjYW52YXNWaWV3LmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIlpcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnpvb21ZID0gdGhpcy5jYW52YXNMYXllci56b29tWSArIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHRjYW52YXNWaWV3LmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJjXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5zZXRWaXNpYmxlKCF0aGlzLmNhbnZhc0xheWVyLnZpc2libGUpO1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLm9wYWNpdHkgPSBNYXRoLm1pbigxLjAsIHRoaXMuY2FudmFzTGF5ZXIub3BhY2l0eSArIDAuMSk7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwidFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIub3BhY2l0eSA9IE1hdGgubWF4KDAsIHRoaXMuY2FudmFzTGF5ZXIub3BhY2l0eSAtIDAuMSk7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgXHRcdGRlZmF1bHQ6XG4gICAgXHRcdFx0Ly8gY29kZS4uLlxuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0fVxuICAgIFx0Y29uc29sZS5sb2coXCJpbWFnZSBhdDogXCIgKyAgdGhpcy5jYW52YXNMYXllci54ICsgXCIsIFwiICsgdGhpcy5jYW52YXNMYXllci55KTtcbiAgICBcdGNvbnNvbGUubG9nKFwiaW1hZ2Ugcm8gc2M6IFwiICsgIHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gKyBcIiwgXCIgKyB0aGlzLmNhbnZhc0xheWVyLnpvb21YICsgXCIsIFwiICsgdGhpcy5jYW52YXNMYXllci56b29tWSk7XG4gICAgfTtcblxufTsiLCJpbXBvcnQgeyBUcmFuc2Zvcm0sIEJhc2ljVHJhbnNmb3JtLCBWaWV3VHJhbnNmb3JtLCBjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgRGlzcGxheUVsZW1lbnQgfSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDYW52YXNMYXllciBleHRlbmRzIEJhc2ljVHJhbnNmb3JtIGltcGxlbWVudHMgRGlzcGxheUVsZW1lbnQge1xuXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBwdWJsaWMgb3BhY2l0eTogbnVtYmVyLCBwdWJsaWMgdmlzaWJsZSl7XG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0ueCwgbG9jYWxUcmFuc2Zvcm0ueSwgbG9jYWxUcmFuc2Zvcm0uem9vbVgsIGxvY2FsVHJhbnNmb3JtLnpvb21ZLCBsb2NhbFRyYW5zZm9ybS5yb3RhdGlvbik7XG5cdH1cblxuXHRhYnN0cmFjdCBkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW47XG5cblx0aXNWaXNpYmxlKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnZpc2libGU7XG5cdH1cblxuXHRzZXRWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4pOiB2b2lkIHtcblx0XHRjb25zb2xlLmxvZyhcInNldHRpbmcgdmlzaWJpbGl0eTogXCIgKyB2aXNpYmxlKTtcblx0XHR0aGlzLnZpc2libGUgPSB2aXNpYmxlO1xuXHR9XG5cblx0Z2V0T3BhY2l0eSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLm9wYWNpdHk7XG5cdH1cblxuXHRzZXRPcGFjaXR5KG9wYWNpdHk6IG51bWJlcik6IHZvaWQge1xuXHRcdHRoaXMub3BhY2l0eSA9IG9wYWNpdHk7XG5cdH1cblxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRHJhd0xheWVyIGV4dGVuZHMgQ2FudmFzTGF5ZXIge1xuXG4gICAgcHJvdGVjdGVkIHByZXBhcmVDdHgoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBUcmFuc2Zvcm0pOiB2b2lkIHtcblx0XHRjdHgudHJhbnNsYXRlKCh0cmFuc2Zvcm0ueCAtIHZpZXcueCkgKiB2aWV3Lnpvb21YLCAodHJhbnNmb3JtLnkgLSB2aWV3LnkpICogdmlldy56b29tWSk7XG5cdFx0Y3R4LnNjYWxlKHRyYW5zZm9ybS56b29tWCAqIHZpZXcuem9vbVgsIHRyYW5zZm9ybS56b29tWSAqIHZpZXcuem9vbVkpO1xuXHRcdGN0eC5yb3RhdGUodHJhbnNmb3JtLnJvdGF0aW9uKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgY2xlYW5DdHgoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBUcmFuc2Zvcm0pOiB2b2lkIHtcdFxuXHRcdGN0eC5yb3RhdGUoLXRyYW5zZm9ybS5yb3RhdGlvbik7XG5cdFx0Y3R4LnNjYWxlKDEvdHJhbnNmb3JtLnpvb21YL3ZpZXcuem9vbVgsIDEvdHJhbnNmb3JtLnpvb21ZL3ZpZXcuem9vbVkpO1xuXHRcdGN0eC50cmFuc2xhdGUoLSh0cmFuc2Zvcm0ueCAtdmlldy54KSAqdmlldy56b29tWCwgLSh0cmFuc2Zvcm0ueSAtIHZpZXcueSkgKiB2aWV3Lnpvb21ZKTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIENvbnRhaW5lckxheWVyIGV4dGVuZHMgQ2FudmFzTGF5ZXIge1xuXG5cdGxheWVyTWFwOiBNYXA8c3RyaW5nLCBDYW52YXNMYXllcj47XG5cdGRpc3BsYXlMYXllcnM6IEFycmF5PENhbnZhc0xheWVyPjtcblxuXHRjb25zdHJ1Y3Rvcihsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBvcGFjaXR5OiBudW1iZXIgPSAxLCB2aXNpYmxlOiBib29sZWFuID0gdHJ1ZSkge1xuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCBvcGFjaXR5LCB2aXNpYmxlKTtcblx0XHR0aGlzLmxheWVyTWFwID0gbmV3IE1hcDxzdHJpbmcsIENhbnZhc0xheWVyPigpO1xuXHRcdHRoaXMuZGlzcGxheUxheWVycyA9IFtdO1xuXHR9XG5cblx0c2V0KG5hbWU6IHN0cmluZywgbGF5ZXI6IENhbnZhc0xheWVyKXtcblx0XHR0aGlzLmxheWVyTWFwLnNldChuYW1lLCBsYXllcik7XG5cdFx0dGhpcy5kaXNwbGF5TGF5ZXJzLnB1c2gobGF5ZXIpO1xuXHR9XG5cblx0Z2V0KG5hbWU6IHN0cmluZyk6IENhbnZhc0xheWVyIHtcblx0XHRyZXR1cm4gdGhpcy5sYXllck1hcC5nZXQobmFtZSk7XG5cdH1cblxuXHRzZXRUb3AobmFtZTogc3RyaW5nKSB7XG5cdFx0bGV0IHRvcExheWVyID0gdGhpcy5nZXQobmFtZSk7XG5cdFx0aWYgKHRvcExheWVyICE9IHVuZGVmaW5lZCl7XG5cdFx0XHR0aGlzLmRpc3BsYXlMYXllcnMgPSB0aGlzLmRpc3BsYXlMYXllcnMuZmlsdGVyKGZ1bmN0aW9uKGVsZW1lbnQ6IENhbnZhc0xheWVyKXsgXG5cdFx0XHRcdGlmIChlbGVtZW50ID09IHRvcExheWVyKXtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH19KTtcblx0XHRcdHRoaXMuZGlzcGxheUxheWVycy5wdXNoKHRvcExheWVyKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5sb2coXCJ0b3AgbGF5ZXIgdW5kZWZpbmVkIFwiICsgbmFtZSk7XG5cdFx0fVxuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFZpZXdUcmFuc2Zvcm0pOiBib29sZWFuIHtcblxuXHRcdGxldCBsYXllclRyYW5zZm9ybSA9IGNvbWJpbmVUcmFuc2Zvcm0odGhpcy5sb2NhbFRyYW5zZm9ybSwgcGFyZW50VHJhbnNmb3JtKTtcblxuXHRcdHZhciBkcmF3aW5nQ29tcGxldGUgPSB0cnVlO1xuXG5cdFx0Zm9yIChsZXQgbGF5ZXIgb2YgdGhpcy5kaXNwbGF5TGF5ZXJzKSB7XG5cdFx0XHRpZiAobGF5ZXIuaXNWaXNpYmxlKCkpe1xuXHRcdFx0XHRkcmF3aW5nQ29tcGxldGUgPSBkcmF3aW5nQ29tcGxldGUgJiYgbGF5ZXIuZHJhdyhjdHgsIGxheWVyVHJhbnNmb3JtLCB2aWV3KTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdH1cblxuXHRcdHJldHVybiBkcmF3aW5nQ29tcGxldGU7XG5cdH1cblxufSIsImltcG9ydCB7IENvbnRhaW5lckxheWVyIH0gZnJvbSBcIi4vbGF5ZXJcIjtcbmltcG9ydCB7IENvbnRhaW5lckxheWVyTWFuYWdlciB9IGZyb20gXCIuL2xheWVybWFuYWdlclwiO1xuaW1wb3J0IHsgQ2FudmFzVmlldyB9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcblxuZXhwb3J0IGNsYXNzIExheWVyQ29udHJvbGxlciB7XG5cblx0cHJpdmF0ZSBtb2Q6IHN0cmluZyA9IFwiaVwiO1xuXG5cdGNvbnN0cnVjdG9yKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIHJlYWRvbmx5IGNvbnRhaW5lckxheWVyTWFuYWdlcjogQ29udGFpbmVyTGF5ZXJNYW5hZ2VyKXtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5wcmVzc2VkKGNhbnZhc1ZpZXcsIGUgIGFzIEtleWJvYXJkRXZlbnQpKTtcblx0fVxuXG5cdHByZXNzZWQoY2FudmFzVmlldzogQ2FudmFzVmlldywgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgICAgICAgICAgY2FzZSB0aGlzLm1vZDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInRvZ2dsZSB2aXNpYmxlXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29udGFpbmVyTGF5ZXJNYW5hZ2VyLnRvZ2dsZVZpc2liaWxpdHkoZmFsc2UpO1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgQ2FudmFzTGF5ZXIsIENvbnRhaW5lckxheWVyIH0gZnJvbSBcIi4vbGF5ZXJcIjtcbmltcG9ydCB7IFN0YXRpY0ltYWdlIH0gZnJvbSBcIi4vc3RhdGljXCI7XG5pbXBvcnQgeyBUcmFuc2Zvcm0gLCBCYXNpY1RyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7Q2FudmFzVmlldywgRGlzcGxheUVsZW1lbnR9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcblxuZXhwb3J0IGludGVyZmFjZSBJbWFnZVN0cnVjdCBleHRlbmRzIFRyYW5zZm9ybSB7XG5cdFxuXHRvcGFjaXR5OiBudW1iZXI7XG5cdHZpc2libGU6IGJvb2xlYW47XG5cdHNyYzogc3RyaW5nO1xuXHRuYW1lOiBzdHJpbmc7XG5cbn1cblxuZXhwb3J0IGNsYXNzIExheWVyTWFuYWdlciB7XG5cblx0cHJpdmF0ZSBsYXllck1hcDogTWFwPHN0cmluZywgQ29udGFpbmVyTGF5ZXI+OztcblxuXHRyZWFkb25seSBkZWZhdWx0TGF5ZXI6IHN0cmluZyA9IFwiZGVmYXVsdFwiO1xuXG5cdGNvbnN0cnVjdG9yKCl7XG5cdFx0dGhpcy5sYXllck1hcCA9IG5ldyBNYXA8c3RyaW5nLCBDb250YWluZXJMYXllcj4oKTtcblxuXHRcdGxldCBpbWFnZUxheWVyID0gbmV3IENvbnRhaW5lckxheWVyKEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0sIDEsIHRydWUpO1x0XG5cblx0XHR0aGlzLmxheWVyTWFwLnNldCh0aGlzLmRlZmF1bHRMYXllciwgaW1hZ2VMYXllcik7XG5cdH1cblxuXHRhZGRJbWFnZShpbWFnZTogU3RhdGljSW1hZ2UsIG5hbWU6IHN0cmluZyl7XG5cdFx0dGhpcy5sYXllck1hcC5nZXQodGhpcy5kZWZhdWx0TGF5ZXIpLnNldChuYW1lLCBpbWFnZSk7XG5cdH1cblxuXHRhZGRMYXllcihpbWFnZURldGFpbHM6IEFycmF5PEltYWdlU3RydWN0PiwgbGF5ZXJOYW1lOiBzdHJpbmcpOiBDb250YWluZXJMYXllciB7XG5cdFx0bGV0IGltYWdlTGF5ZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXIoQmFzaWNUcmFuc2Zvcm0udW5pdFRyYW5zZm9ybSwgMSwgdHJ1ZSk7XHRcblxuXHRcdGZvciAodmFyIGltYWdlIG9mIGltYWdlRGV0YWlscyl7XG5cdFx0XHRsZXQgc3RhdGljSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoaW1hZ2UsIGltYWdlLnNyYywgaW1hZ2Uub3BhY2l0eSwgaW1hZ2UudmlzaWJsZSk7XG5cdFx0XHRpbWFnZUxheWVyLnNldChpbWFnZS5uYW1lLCBzdGF0aWNJbWFnZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5sYXllck1hcC5zZXQobGF5ZXJOYW1lLCBpbWFnZUxheWVyKTtcblxuXHRcdHJldHVybiBpbWFnZUxheWVyO1xuXHR9XG5cblx0Z2V0TGF5ZXJzKCk6IE1hcDxzdHJpbmcsIENvbnRhaW5lckxheWVyPiB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXA7XG5cdH1cblxuXHRnZXRMYXllcihuYW1lOiBzdHJpbmcpOiBDb250YWluZXJMYXllciB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXAuZ2V0KG5hbWUpO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNsYXNzIENvbnRhaW5lckxheWVyTWFuYWdlciB7XG5cblx0cHJpdmF0ZSBsYXllckNvbnRhaW5lcjogQ29udGFpbmVyTGF5ZXI7XG5cdHByaXZhdGUgc2VsZWN0ZWQ6IHN0cmluZztcblx0XG5cdGNvbnN0cnVjdG9yKGxheWVyQ29udGFpbmVyOiBDb250YWluZXJMYXllcikge1xuXHRcdHRoaXMubGF5ZXJDb250YWluZXIgPSBsYXllckNvbnRhaW5lcjtcblx0fVxuXG5cdHNldExheWVyQ29udGFpbmVyKGxheWVyQ29udGFpbmVyOiBDb250YWluZXJMYXllcikge1xuXHRcdHRoaXMubGF5ZXJDb250YWluZXIgPSBsYXllckNvbnRhaW5lcjtcblx0fVxuXG5cdHNldFNlbGVjdGVkKG5hbWU6IHN0cmluZyl7XG5cdFx0dGhpcy5zZWxlY3RlZCA9IG5hbWU7XG5cdH1cblxuXHR0b2dnbGVWaXNpYmlsaXR5KHNlbGVjdGVkOiBib29sZWFuID0gdHJ1ZSl7XG5cdFx0bGV0IHRvZ2dsZUdyb3VwOiBBcnJheTxEaXNwbGF5RWxlbWVudD4gPSBbXTtcblx0XHRpZiAoc2VsZWN0ZWQpe1xuXHRcdFx0aWYgKHRoaXMuc2VsZWN0ZWQgIT0gXCJcIil7XG5cdFx0XHRcdHRvZ2dsZUdyb3VwLnB1c2godGhpcy5sYXllckNvbnRhaW5lci5sYXllck1hcC5nZXQodGhpcy5zZWxlY3RlZCkpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRmb3IgKGxldCBwYWlyIG9mIHRoaXMubGF5ZXJDb250YWluZXIubGF5ZXJNYXApe1xuXG5cdFx0XHRcdC8vY29uc29sZS5sb2coXCJsYXllck5hbWU6IFwiICsgcGFpclswXSk7XG5cdFx0XHRcdGlmIChwYWlyWzBdICE9IHRoaXMuc2VsZWN0ZWQpe1xuXHRcdFx0XHRcdHRvZ2dsZUdyb3VwLnB1c2gocGFpclsxXSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJsYXllck5hbWU6IFwiICsgdGhpcy5zZWxlY3RlZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRmb3IgKGxldCBlbGVtZW50IG9mIHRvZ2dsZUdyb3VwKXtcblx0XHRcdGVsZW1lbnQuc2V0VmlzaWJsZSghZWxlbWVudC5pc1Zpc2libGUoKSlcblx0XHR9XG5cdH1cblxufSIsImltcG9ydCB7IFRyYW5zZm9ybSwgY29tYmluZVRyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IERyYXdMYXllciwgQ2FudmFzTGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgRGlzcGxheUVsZW1lbnQgfSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5cbmV4cG9ydCBjbGFzcyBTdGF0aWNJbWFnZSBleHRlbmRzIERyYXdMYXllciBpbXBsZW1lbnRzIERpc3BsYXlFbGVtZW50IHtcblxuXHRwcml2YXRlIGltZzogSFRNTEltYWdlRWxlbWVudDtcblxuXHRjb25zdHJ1Y3Rvcihsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHRpbWFnZVNyYzogc3RyaW5nLCBcblx0XHRvcGFjaXR5OiBudW1iZXIsXG5cdFx0dmlzaWJsZTogYm9vbGVhbikge1xuXG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0sIG9wYWNpdHksIHZpc2libGUpO1xuXHRcdFxuXHRcdHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG5cdFx0dGhpcy5pbWcuc3JjID0gaW1hZ2VTcmM7XG5cdH1cblxuXHRwcml2YXRlIGRyYXdJbWFnZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFRyYW5zZm9ybSl7XG5cblx0XHRpZiAodGhpcy5pc1Zpc2libGUoKSl7XG5cdFx0XHRsZXQgY3R4VHJhbnNmb3JtID0gY29tYmluZVRyYW5zZm9ybSh0aGlzLCBwYXJlbnRUcmFuc2Zvcm0pO1xuXG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiY3R4IHggXCIgKyBjdHhUcmFuc2Zvcm0ueCk7XG5cblx0XHRcdHRoaXMucHJlcGFyZUN0eChjdHgsIGN0eFRyYW5zZm9ybSwgdmlldyk7XG5cdFx0XHRcblx0XHRcdGN0eC5nbG9iYWxBbHBoYSA9IHRoaXMub3BhY2l0eTtcblx0XHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDApO1xuXHRcdFx0Y3R4Lmdsb2JhbEFscGhhID0gMTtcblxuXHRcdFx0dGhpcy5jbGVhbkN0eChjdHgsIGN0eFRyYW5zZm9ybSwgdmlldyk7XG5cdFx0fVxuXHRcdFxuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFRyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXHRcdGlmICh0aGlzLnZpc2libGUgJiYgdGhpcy5pbWcuY29tcGxldGUpIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgcGFyZW50VHJhbnNmb3JtLCB2aWV3KTtcblx0XHQvL1x0Y29uc29sZS5sb2coXCJkcmV3IGltYWdlIFwiICsgdGhpcy5pbWcuc3JjKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cbiIsImltcG9ydCB7IERyYXdMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBUcmFuc2Zvcm0sIEJhc2ljVHJhbnNmb3JtLCBWaWV3VHJhbnNmb3JtLCBjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuXG5leHBvcnQgY2xhc3MgVGlsZVN0cnVjdCB7XG5cdFxuXHRjb25zdHJ1Y3Rvcihcblx0XHRwdWJsaWMgcHJlZml4OiBzdHJpbmcsXG5cdFx0cHVibGljIHN1ZmZpeDogc3RyaW5nLFxuXHRcdHB1YmxpYyB0aWxlRGlyZWN0b3J5OiBzdHJpbmcpe31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHpvb21CeUxldmVsKHpvb21MZXZlbDogbnVtYmVyKXtcblx0cmV0dXJuIE1hdGgucG93KDIsIHpvb21MZXZlbCk7XG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlTGF5ZXIgZXh0ZW5kcyBEcmF3TGF5ZXIge1xuXG5cdHRpbGVNYW5hZ2VyOiBUaWxlTWFuYWdlcjtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHRyZWFkb25seSB0aWxlU3RydWN0OiBUaWxlU3RydWN0LFxuXHRcdHZpc2JpbGU6IGJvb2xlYW4sXG5cdFx0cHVibGljIHhPZmZzZXQ6IG51bWJlciA9IDAsXG5cdFx0cHVibGljIHlPZmZzZXQ6IG51bWJlciA9IDAsXG5cdFx0cHVibGljIHpvb206IG51bWJlciA9IDEsXG5cdFx0cmVhZG9ubHkgZ3JpZFdpZHRoOiBudW1iZXIgPSAyNTYsIFxuXHRcdHJlYWRvbmx5IGdyaWRIZWlnaHQ6IG51bWJlciA9IDI1Nixcblx0XHRvcGFjaXR5OiBudW1iZXIgPSAxKXtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCBvcGFjaXR5LCB2aXNiaWxlKTtcblxuXHRcdHRoaXMudGlsZU1hbmFnZXIgPSBuZXcgVGlsZU1hbmFnZXIoKTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHBhcmVudFRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBWaWV3VHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0XHRsZXQgY3R4VHJhbnNmb3JtID0gY29tYmluZVRyYW5zZm9ybSh0aGlzLCBwYXJlbnRUcmFuc2Zvcm0pO1xuXG5cdFx0bGV0IHpvb21XaWR0aDogbnVtYmVyID0gdGhpcy5ncmlkV2lkdGggKiBjdHhUcmFuc2Zvcm0uem9vbVhcblx0XHRsZXQgem9vbUhlaWdodDogbnVtYmVyID0gdGhpcy5ncmlkSGVpZ2h0ICogY3R4VHJhbnNmb3JtLnpvb21ZO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhcImN0eCB6b29tV2lkdGg6IFwiICsgem9vbVdpZHRoKTtcblxuXHRcdGxldCB2aWV3WCA9IHZpZXcueCAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IHZpZXdZID0gdmlldy55ICogdmlldy56b29tWTtcblxuXHRcdGxldCB2aWV3V2lkdGggPSB2aWV3LndpZHRoIC8gdmlldy56b29tWDtcblx0XHRsZXQgdmlld0hlaWdodCA9IHZpZXcuaGVpZ2h0IC8gdmlldy56b29tWTtcblxuXHRcdGxldCBncmlkQWNyb3NzID0gdmlld1dpZHRoIC8gem9vbVdpZHRoOyAvL2dvb2Rcblx0XHRsZXQgZ3JpZEhpZ2ggPSB2aWV3SGVpZ2h0IC8gem9vbUhlaWdodDsgLy9nb29kXG5cblx0XHRsZXQgeE1pbiA9IE1hdGguZmxvb3Iodmlldy54L3pvb21XaWR0aCk7XG5cdFx0bGV0IHhNYXggPSBNYXRoLmNlaWwoKHZpZXcueCArIHZpZXdXaWR0aCkgLyB6b29tV2lkdGgpO1xuXG5cdFx0bGV0IHlNaW4gPSBNYXRoLmZsb29yKHZpZXcueS96b29tSGVpZ2h0KTtcblx0XHRsZXQgeU1heCA9IE1hdGguY2VpbCgodmlldy55ICsgdmlld0hlaWdodCkgLyB6b29tSGVpZ2h0KTtcblxuXHRcdC8vY29uc29sZS5sb2coXCJ4IHkgcyBcIiArIHhNaW4gKyBcIiwgXCIgKyB4TWF4ICsgXCI6IFwiICsgeU1pbiArIFwiLCBcIiArIHlNYXgpO1xuXHRcdC8vY29uc29sZS5sb2coXCJhY3Jvc3MgaGlnaFwiICsgZ3JpZEFjcm9zcyArIFwiLCBcIiArIGdyaWRIaWdoKTtcblxuXHRcdHZhciBkcmF3aW5nQ29tcGxldGUgPSB0cnVlO1xuXG5cdFx0bGV0IGZ1bGxab29tWCA9IGN0eFRyYW5zZm9ybS56b29tWCAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IGZ1bGxab29tWSA9IGN0eFRyYW5zZm9ybS56b29tWSAqIHZpZXcuem9vbVk7XG5cblx0XHQvL2NvbnNvbGUubG9nKFwiZnVsbHpvb21zIFwiICsgZnVsbFpvb21YICsgXCIgXCIgKyBmdWxsWm9vbVkpO1xuXG5cdFx0Y3R4LnNjYWxlKGZ1bGxab29tWCwgZnVsbFpvb21ZKTtcblxuXHRcdGZvciAodmFyIHggPSB4TWluOyB4PHhNYXg7IHgrKyl7XG5cdFx0XHRsZXQgeE1vdmUgPSB4ICogdGhpcy5ncmlkV2lkdGggLSB2aWV3LnggLyBjdHhUcmFuc2Zvcm0uem9vbVg7XG5cdFx0XHRmb3IgKHZhciB5ID0geU1pbjsgeTx5TWF4OyB5Kyspe1xuXHRcdFx0XHRsZXQgeU1vdmUgPSB5ICogdGhpcy5ncmlkSGVpZ2h0IC0gdmlldy55LyBjdHhUcmFuc2Zvcm0uem9vbVk7XG5cdFx0XHRcdC8vY29uc29sZS5sb2coXCJ0aWxlIHggeSBcIiArIHggKyBcIiBcIiArIHkgKyBcIjogXCIgKyB4TW92ZSArIFwiLCBcIiArIHlNb3ZlKTtcblxuXHRcdFx0XHRjdHgudHJhbnNsYXRlKHhNb3ZlLCB5TW92ZSk7XG5cdFx0XHRcdGxldCB0aWxlU3JjID0gdGhpcy50aWxlU3RydWN0LnRpbGVEaXJlY3RvcnkgKyB0aGlzLnpvb20gKyBcIi9cIiArIFxuXHRcdFx0XHRcdCh4ICsgdGhpcy54T2Zmc2V0KSArIFwiL1wiICsgXG5cdFx0XHRcdFx0KHkgKyB0aGlzLnlPZmZzZXQpICsgdGhpcy50aWxlU3RydWN0LnN1ZmZpeDtcblxuXHRcdFx0XHRpZiAodGhpcy50aWxlTWFuYWdlci5oYXModGlsZVNyYykpIHtcblx0XHRcdFx0XHRsZXQgaW1hZ2VUaWxlID0gdGhpcy50aWxlTWFuYWdlci5nZXQodGlsZVNyYyk7XG5cdFx0XHRcdFx0ZHJhd2luZ0NvbXBsZXRlID0gZHJhd2luZ0NvbXBsZXRlICYmIGltYWdlVGlsZS5kcmF3KGN0eCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0bGV0IGltYWdlVGlsZSA9IG5ldyBJbWFnZVRpbGUoeCwgeSwgdGlsZVNyYyk7XG5cblx0XHRcdFx0XHRkcmF3aW5nQ29tcGxldGUgPSBkcmF3aW5nQ29tcGxldGUgJiYgaW1hZ2VUaWxlLmRyYXcoY3R4KTtcblxuXHRcdFx0XHRcdHRoaXMudGlsZU1hbmFnZXIuc2V0KHRpbGVTcmMsIGltYWdlVGlsZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjdHgudHJhbnNsYXRlKC14TW92ZSwgLXlNb3ZlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjdHguc2NhbGUoMSAvIGZ1bGxab29tWCwgMSAvIGZ1bGxab29tWSk7XG5cblx0XHQvL2NvbnNvbGUubG9nKFwiZHJldyB0aWxlcyBcIiArIGRyYXdpbmdDb21wbGV0ZSk7XG5cdFx0cmV0dXJuIGRyYXdpbmdDb21wbGV0ZTtcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgVGlsZU1hbmFnZXIge1xuXG5cdHRpbGVNYXA6IE1hcDxzdHJpbmcsIEltYWdlVGlsZT47XG5cblx0Y29uc3RydWN0b3IoKXtcblx0XHR0aGlzLnRpbGVNYXAgPSBuZXcgTWFwPHN0cmluZywgSW1hZ2VUaWxlPigpO1xuXHR9XG5cblx0Z2V0KHRpbGVLZXk6IHN0cmluZyk6IEltYWdlVGlsZSB7XG5cdFx0cmV0dXJuIHRoaXMudGlsZU1hcC5nZXQodGlsZUtleSk7XG5cdH1cblxuXHRoYXModGlsZUtleTogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudGlsZU1hcC5oYXModGlsZUtleSk7XG5cdH1cblxuXHRzZXQodGlsZUtleTogc3RyaW5nLCB0aWxlOiBJbWFnZVRpbGUpe1xuXHRcdHRoaXMudGlsZU1hcC5zZXQodGlsZUtleSwgdGlsZSk7XG5cdH1cblxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VUaWxlIHtcblxuXHRwcml2YXRlIGltZzogSFRNTEltYWdlRWxlbWVudDtcblx0cHJpdmF0ZSBleGlzdHM6IGJvb2xlYW47XG5cblx0Y29uc3RydWN0b3IocmVhZG9ubHkgeEluZGV4OiBudW1iZXIsIHJlYWRvbmx5IHlJbmRleDogbnVtYmVyLCBpbWFnZVNyYzogc3RyaW5nKSB7XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0XHR0aGlzLmltZy5vbmVycm9yID0gZnVuY3Rpb24oZXZlbnRPck1lc3NhZ2U6IGFueSl7XG5cdFx0XHRldmVudE9yTWVzc2FnZS50YXJnZXQuc3JjID0gXCJcIjtcblx0XHR9O1xuXHR9O1xuXG5cdHByaXZhdGUgZHJhd0ltYWdlKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKXtcblx0XHRjdHguZHJhd0ltYWdlKHRoaXMuaW1nLCAwLCAwKTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpOiBib29sZWFuIHtcblx0XHRpZiAodGhpcy5pbWcuc3JjICE9IFwiXCIgJiYgdGhpcy5pbWcuY29tcGxldGUgKSB7XG5cdFx0XHR0aGlzLmRyYXdJbWFnZShjdHgpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fTtcblxufVxuIiwiLyoqXG4qIEEgd29ybGQgaXMgMCwwIGJhc2VkIGJ1dCBhbnkgZWxlbWVudCBjYW4gYmUgcG9zaXRpb25lZCByZWxhdGl2ZSB0byB0aGlzLlxuKi9cbmV4cG9ydCBpbnRlcmZhY2UgVHJhbnNmb3JtIHtcblx0eDogbnVtYmVyO1xuXHR5OiBudW1iZXI7XG5cdHpvb21YOiBudW1iZXI7XG5cdHpvb21ZOiBudW1iZXI7XG5cdHJvdGF0aW9uOiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBCYXNpY1RyYW5zZm9ybSBpbXBsZW1lbnRzIFRyYW5zZm9ybSB7XG5cbiAgICBzdGF0aWMgcmVhZG9ubHkgdW5pdFRyYW5zZm9ybSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgwLCAwLCAxLCAxLCAwKTtcblxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgeDogbnVtYmVyLCBwdWJsaWMgeTogbnVtYmVyLCBcblx0XHRwdWJsaWMgem9vbVg6IG51bWJlciwgcHVibGljIHpvb21ZOiBudW1iZXIsIFxuXHRcdHB1YmxpYyByb3RhdGlvbjogbnVtYmVyKXt9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21iaW5lVHJhbnNmb3JtKGNoaWxkOiBUcmFuc2Zvcm0sIGNvbnRhaW5lcjogVHJhbnNmb3JtKTogVHJhbnNmb3JtIHtcblx0bGV0IHpvb21YID0gY2hpbGQuem9vbVggKiBjb250YWluZXIuem9vbVg7XG5cdC8vY29uc29sZS5sb2coXCJtb2RpZmllZCBcIiArIGNoaWxkLnpvb21YICsgXCIgdG8gXCIgKyB6b29tWCk7XG5cdGxldCB6b29tWSA9IGNoaWxkLnpvb21ZICogY29udGFpbmVyLnpvb21ZO1xuXHQvL2NvbnNvbGUubG9nKFwibW9kaWZpZWQgXCIgKyBjaGlsZC56b29tWSArIFwiIGJ5IFwiICsgY29udGFpbmVyLnpvb21ZICsgXCIgdG8gXCIgKyB6b29tWSk7XG5cdGxldCB4ID0gKGNoaWxkLnggKiBjb250YWluZXIuem9vbVgpICsgY29udGFpbmVyLng7XG5cdGxldCB5ID0gKGNoaWxkLnkgKiBjb250YWluZXIuem9vbVkpICsgY29udGFpbmVyLnk7XG5cdC8vY29uc29sZS5sb2coXCJtb2RpZmllZCB4IFwiICsgY2hpbGQueCArIFwiIGJ5IFwiICsgY29udGFpbmVyLnpvb21YICsgXCIgYW5kIFwiICsgY29udGFpbmVyLnggKyBcIiB0byBcIiArIHgpO1xuXHRsZXQgcm90YXRpb24gPSBjaGlsZC5yb3RhdGlvbiArIGNvbnRhaW5lci5yb3RhdGlvbjtcblx0cmV0dXJuIG5ldyBCYXNpY1RyYW5zZm9ybSh4LCB5LCB6b29tWCwgem9vbVksIHJvdGF0aW9uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKHRyYW5zZm9ybTogVHJhbnNmb3JtKTogVHJhbnNmb3JtIHtcblx0cmV0dXJuIG5ldyBCYXNpY1RyYW5zZm9ybSh0cmFuc2Zvcm0ueCwgdHJhbnNmb3JtLnksIFxuXHRcdHRyYW5zZm9ybS56b29tWCwgdHJhbnNmb3JtLnpvb21ZLCB0cmFuc2Zvcm0ucm90YXRpb24pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0VHJhbnNmb3JtKHdvcmxkU3RhdGU6IFRyYW5zZm9ybSk6IFRyYW5zZm9ybSB7XG5cdHJldHVybiBuZXcgQmFzaWNUcmFuc2Zvcm0oLXdvcmxkU3RhdGUueCwgLXdvcmxkU3RhdGUueSwgXG5cdFx0MS93b3JsZFN0YXRlLnpvb21YLCAxL3dvcmxkU3RhdGUuem9vbVksIC13b3JsZFN0YXRlLnJvdGF0aW9uKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBWaWV3VHJhbnNmb3JtIGV4dGVuZHMgVHJhbnNmb3JtIHtcblx0d2lkdGg6IG51bWJlcjtcblx0aGVpZ2h0OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBCYXNpY1ZpZXdUcmFuc2Zvcm0gZXh0ZW5kcyBCYXNpY1RyYW5zZm9ybSBpbXBsZW1lbnRzIFZpZXdUcmFuc2Zvcm0ge1xuXG5cdGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyLCBcblx0XHRyZWFkb25seSB3aWR0aDogbnVtYmVyLCByZWFkb25seSBoZWlnaHQ6IG51bWJlcixcblx0XHR6b29tWDogbnVtYmVyLCB6b29tWTogbnVtYmVyLCBcblx0ICAgIHJvdGF0aW9uOiBudW1iZXIpe1xuXG5cdFx0c3VwZXIoeCwgeSwgem9vbVgsIHpvb21ZLCByb3RhdGlvbik7XG5cdH1cblxufVxuXG5cblxuIiwiaW1wb3J0IHsgVmlld1RyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IENhbnZhc1ZpZXcgfSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE1vdXNlQ29udHJvbGxlciB7XG5cbiAgICBtb3VzZVBvc2l0aW9uKGV2ZW50OiBNb3VzZUV2ZW50LCB3aXRoaW46IEhUTUxFbGVtZW50KTogQXJyYXk8bnVtYmVyPiB7XG4gICAgICAgIGxldCBtX3Bvc3ggPSBldmVudC5jbGllbnRYICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0XG4gICAgICAgICAgICAgICAgICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQ7XG4gICAgICAgIGxldCBtX3Bvc3kgPSBldmVudC5jbGllbnRZICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3BcbiAgICAgICAgICAgICAgICAgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuXG4gICAgICAgIHZhciBlX3Bvc3ggPSAwO1xuICAgICAgICB2YXIgZV9wb3N5ID0gMDtcblxuICAgICAgICBpZiAod2l0aGluLm9mZnNldFBhcmVudCl7XG4gICAgICAgICAgICBkbyB7IFxuICAgICAgICAgICAgICAgIGVfcG9zeCArPSB3aXRoaW4ub2Zmc2V0TGVmdDtcbiAgICAgICAgICAgICAgICBlX3Bvc3kgKz0gd2l0aGluLm9mZnNldFRvcDtcbiAgICAgICAgICAgIH0gd2hpbGUgKHdpdGhpbiA9IDxIVE1MRWxlbWVudD53aXRoaW4ub2Zmc2V0UGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBbbV9wb3N4IC0gZV9wb3N4LCBtX3Bvc3kgLSBlX3Bvc3ldO1xuICAgIH1cblxufVxuXG5leHBvcnQgY2xhc3MgVmlld0NvbnRyb2xsZXIgZXh0ZW5kcyBNb3VzZUNvbnRyb2xsZXIge1xuXG5cdHJlY29yZDogYm9vbGVhbjtcblx0bW92ZTogbnVtYmVyID0gMTtcblxuXHRwcml2YXRlIHhQcmV2aW91czogbnVtYmVyO1xuXHRwcml2YXRlIHlQcmV2aW91czogbnVtYmVyO1xuXG5cdGNvbnN0cnVjdG9yKHZpZXdUcmFuc2Zvcm06IFZpZXdUcmFuc2Zvcm0sIFxuICAgICAgICByZWFkb25seSBkcmFnRWxlbWVudDogSFRNTEVsZW1lbnQsIHJlYWRvbmx5IGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcpIHtcblxuICAgIFx0c3VwZXIoKTtcbiAgICBcdGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3VHJhbnNmb3JtKSk7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybSkpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3VHJhbnNmb3JtKSk7XG4gICAgICAgIGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMucmVjb3JkID0gZmFsc2UpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmNsaWNrZWQoZSBhcyBNb3VzZUV2ZW50LCBjYW52YXNWaWV3LCAxLjIpKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIndoZWVsXCIsIChlOiBFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLndoZWVsKGUgYXMgV2hlZWxFdmVudCwgY2FudmFzVmlldykpO1xuICAgIH1cblxuICAgIGNsaWNrZWQoZXZlbnQ6IE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm06IFZpZXdUcmFuc2Zvcm0sIHpvb21CeTogbnVtYmVyKXtcbiAgICBcdHN3aXRjaChldmVudC50eXBlKXtcbiAgICBcdFx0Y2FzZSBcImRibGNsaWNrXCI6XG4gICAgICAgICAgICAgICAgaWYgIChldmVudC5jdHJsS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHpvb21CeSA9IDEgLyB6b29tQnk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxldCBtWFkgPSB0aGlzLm1vdXNlUG9zaXRpb24oZXZlbnQsIHRoaXMuZHJhZ0VsZW1lbnQpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3Lnpvb21BYm91dChtWFlbMF0sIG1YWVsxXSwgem9vbUJ5KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHJhZ2dlZChldmVudDogTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybTogVmlld1RyYW5zZm9ybSkge1xuXG4gICAgXHRzd2l0Y2goZXZlbnQudHlwZSl7XG4gICAgXHRcdGNhc2UgXCJtb3VzZWRvd25cIjpcbiAgICBcdFx0XHR0aGlzLnJlY29yZCA9IHRydWU7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJtb3VzZXVwXCI6XG4gICAgXHRcdFx0dGhpcy5yZWNvcmQgPSBmYWxzZTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0ZGVmYXVsdDpcbiAgICBcdFx0XHRpZiAodGhpcy5yZWNvcmQpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgeERlbHRhID0gKGV2ZW50LmNsaWVudFggLSB0aGlzLnhQcmV2aW91cykgLyB0aGlzLm1vdmUgLyB2aWV3VHJhbnNmb3JtLnpvb21YO1xuICAgICAgICAgICAgICAgICAgICBsZXQgeURlbHRhID0gKGV2ZW50LmNsaWVudFkgLSB0aGlzLnlQcmV2aW91cykgLyB0aGlzLm1vdmUgLyB2aWV3VHJhbnNmb3JtLnpvb21ZO1xuXG4gICAgICAgICAgICAgICAgICAgIHZpZXdUcmFuc2Zvcm0ueCA9IHZpZXdUcmFuc2Zvcm0ueCAtIHhEZWx0YTtcbiAgICAgICAgICAgICAgICAgICAgdmlld1RyYW5zZm9ybS55ID0gdmlld1RyYW5zZm9ybS55IC0geURlbHRhO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy5kcmF3KCk7XG4gICAgXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnhQcmV2aW91cyA9IGV2ZW50LmNsaWVudFg7XG5cdFx0XHR0aGlzLnlQcmV2aW91cyA9IGV2ZW50LmNsaWVudFk7XG4gICAgXHR9XG4gICAgfVxuXG4gICAgd2hlZWwoZXZlbnQ6IFdoZWVsRXZlbnQsIHZpZXdUcmFuc2Zvcm06IFZpZXdUcmFuc2Zvcm0pIHtcblxuICAgICAgICAvL2NvbnNvbGUubG9nKFwid2hlZWxcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LnR5cGUpO1xuXG4gICAgICAgIGxldCB4RGVsdGEgPSBldmVudC5kZWx0YVggLyB0aGlzLm1vdmUgLyB2aWV3VHJhbnNmb3JtLnpvb21YO1xuICAgICAgICBsZXQgeURlbHRhID0gZXZlbnQuZGVsdGFZIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWTtcblxuICAgICAgICBpZiAgKGV2ZW50LmN0cmxLZXkpIHtcbiAgICAgICAgICAgIGxldCBtWFkgPSB0aGlzLm1vdXNlUG9zaXRpb24oZXZlbnQsIHRoaXMuZHJhZ0VsZW1lbnQpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGJ5ID0gMS4wNTtcbiAgICAgICAgICAgIGlmICh5RGVsdGEgPCAwKXtcbiAgICAgICAgICAgICAgICBieSA9IDAuOTU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy56b29tQWJvdXQobVhZWzBdLCBtWFlbMV0sIGJ5KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy54ID0gIHRoaXMuY2FudmFzVmlldy54ICsgeERlbHRhO1xuICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3LnkgPSAgdGhpcy5jYW52YXNWaWV3LnkgKyB5RGVsdGE7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuY2FudmFzVmlldy5kcmF3KCk7XG4gICAgfVxuXG59XG4iLCJtb2R1bGUuZXhwb3J0cz1bXG5cdHtcblx0XCJuYW1lXCI6IFwiMi0yXCIsIFwieFwiOiAtMzY0LCBcInlcIjogLTEyLjUsIFwiem9vbVhcIjogMC4yMTMsIFwiem9vbVlcIjogMC4yMDUsIFwicm90YXRpb25cIjogLTAuMzEsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwMnJfMltTVkMyXS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIzXCIsIFwieFwiOiAtMjE2LCBcInlcIjogLTAuNzA1LCBcInpvb21YXCI6IDAuMiwgXCJ6b29tWVwiOiAwLjIxLCBcInJvdGF0aW9uXCI6IC0wLjUxLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDNyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjRcIiwgXCJ4XCI6IC03NC4yOSwgXCJ5XCI6IC05OS43OCwgXCJ6b29tWFwiOiAwLjIyMiwgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAtMC4yODUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwNHJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiNVwiLCBcInhcIjogLTM2Ni41LCBcInlcIjogMTgwLjAxOSwgXCJ6b29tWFwiOiAwLjIxNSwgXCJ6b29tWVwiOiAwLjIwNywgXCJyb3RhdGlvblwiOiAtMC4yMSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA1cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI2XCIsIFwieFwiOiAtMjA2LjE2LCBcInlcIjogMTQ2LCBcInpvb21YXCI6IDAuMjEsIFwiem9vbVlcIjogMC4yMDgsIFwicm90YXRpb25cIjogLTAuMjE1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDZyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjdcIiwgXCJ4XCI6IC02My4zLCBcInlcIjogMTAwLjM3NzYsIFwiem9vbVhcIjogMC4yMTI1LCBcInpvb21ZXCI6IDAuMjEzLCBcInJvdGF0aW9uXCI6IC0wLjIzLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDdyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjhcIiwgXCJ4XCI6IDc4LjEsIFwieVwiOiA1OC41MzUsIFwiem9vbVhcIjogMC4yMDcsIFwiem9vbVlcIjogMC4yMTcsIFwicm90YXRpb25cIjogLTAuMjUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwOHJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiOVwiLCBcInhcIjogMjE5LjUsIFwieVwiOiAyNCwgXCJ6b29tWFwiOiAwLjIxNSwgXCJ6b29tWVwiOiAwLjIxNDUsIFwicm90YXRpb25cIjogLTAuMjYsXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA5cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxMFwiLCBcInhcIjogNDU0LjIxLCBcInlcIjogLTEuNSwgXCJ6b29tWFwiOiAwLjIxOCwgXCJ6b29tWVwiOiAwLjIxNCwgXCJyb3RhdGlvblwiOiAwLjAxNSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDEwcl8yW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjExXCIsIFwieFwiOiA2MjEuODYsIFwieVwiOiAyNS41MjUsIFwiem9vbVhcIjogMC4yMTMsIFwiem9vbVlcIjogMC4yMTE1LCBcInJvdGF0aW9uXCI6IDAuMTEsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxMXJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sIFxuXHR7XG5cdFwibmFtZVwiOiBcIjEyLTFcIiwgXCJ4XCI6IDc2OS42NDUsIFwieVwiOiA1MC4yNjUsIFwiem9vbVhcIjogMC40MjQsIFwiem9vbVlcIjogMC40MjIsIFwicm90YXRpb25cIjogMC4xMiwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDEycl8xW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE0XCIsIFwieFwiOiAtOTE1LjYsIFwieVwiOiA1NTcuODY1LCBcInpvb21YXCI6IDAuMjA4LCBcInpvb21ZXCI6IDAuMjA4LCBcInJvdGF0aW9uXCI6IC0xLjIxNSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDE0UltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxNS0yXCIsIFwieFwiOiAtNzE3LjMsIFwieVwiOiA1NzIsIFwiem9vbVhcIjogMC4yMSwgXCJ6b29tWVwiOiAwLjIwNiwgXCJyb3RhdGlvblwiOiAtMS40NywgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDE1cl8yW1NWQzJdLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE2LTJcIiwgXCJ4XCI6IC05MiwgXCJ5XCI6IDMzNSwgXCJ6b29tWFwiOiAwLjIxNywgXCJ6b29tWVwiOiAwLjIxNCwgXCJyb3RhdGlvblwiOiAtMC4xLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTZyXzJbU1ZDMl0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTdcIiwgXCJ4XCI6IDc3LCBcInlcIjogMjc4LjUsIFwiem9vbVhcIjogMC4yMDYsIFwiem9vbVlcIjogMC4yMDYsIFwicm90YXRpb25cIjogLTAuMDU1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTdSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE4XCIsIFwieFwiOiAyMjksIFwieVwiOiAyMzkuNSwgXCJ6b29tWFwiOiAwLjIwOCwgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAwLjA3LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMThSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE5XCIsIFwieFwiOiA3MS41LCBcInlcIjogNDc0LCBcInpvb21YXCI6IDAuMjAzLCBcInpvb21ZXCI6IDAuMjA4LCBcInJvdGF0aW9uXCI6IDAuMTcsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxOVJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMjBcIiwgXCJ4XCI6IDQzLjUsIFwieVwiOiA2NDAsIFwiem9vbVhcIjogMC4xLCBcInpvb21ZXCI6IDAuMTA0LCBcInJvdGF0aW9uXCI6IDAuMjA1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMjBSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9XG5cbl1cblxuXG5cbiIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1xuXHRcdFwibmFtZVwiOiBcImhlbnJpZXR0YVwiLCBcInhcIjogLTQ4Ni41LCBcInlcIjogLTI1Mi41LCBcInpvb21YXCI6IDAuMjksIFwiem9vbVlcIjogMC41LCBcInJvdGF0aW9uXCI6IDAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9oZW5yaWV0dGEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibWF0ZXJcIiwgXCJ4XCI6IC0zNDIsIFwieVwiOiAtNzQ3LCBcInpvb21YXCI6IDAuMDgsIFwiem9vbVlcIjogMC4xOCwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21hdGVybWlzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInBldGVyc1wiLCBcInhcIjogLTcxOSwgXCJ5XCI6IC04MzYsIFwiem9vbVhcIjogMC4wNywgXCJ6b29tWVwiOiAwLjE0LCBcInJvdGF0aW9uXCI6IC0wLjE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvcGV0ZXJzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm9jb25uZWxsXCIsIFwieFwiOiAtODIxLCBcInlcIjogLTE4MzUsIFwiem9vbVhcIjogMC4yNSwgXCJ6b29tWVwiOiAwLjI1LCBcInJvdGF0aW9uXCI6IDAsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9vY29ubmVsbC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImZvdXJjb3VydHNcIiwgXCJ4XCI6IC01NjcuNSwgXCJ5XCI6IDMyMy41LCBcInpvb21YXCI6IDAuMTYsIFwiem9vbVlcIjogMC4zMjgsIFwicm90YXRpb25cIjogLTAuMTIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9mb3VyY291cnRzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibWljaGFuc1wiLCBcInhcIjogLTYzOSwgXCJ5XCI6IDE2MCwgXCJ6b29tWFwiOiAwLjE0LCBcInpvb21ZXCI6IDAuMjQsIFwicm90YXRpb25cIjogMC4wMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21pY2hhbnMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ0aGVjYXN0bGVcIiwgXCJ4XCI6IC0yOTAsIFwieVwiOiA1MjAsIFwiem9vbVhcIjogMC4yMiwgXCJ6b29tWVwiOiAwLjQyLCBcInJvdGF0aW9uXCI6IC0wLjAxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL3RoZWNhc3RsZS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtYXJrZXRcIiwgXCJ4XCI6IC02MTcsIFwieVwiOiA1NjUsIFwiem9vbVhcIjogMC4xNSwgXCJ6b29tWVwiOiAwLjI2LCBcInJvdGF0aW9uXCI6IDAuMDQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9tYXJrZXQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJwYXRyaWNrc1wiLCBcInhcIjogLTQ2MiwgXCJ5XCI6IDc5NSwgXCJ6b29tWFwiOiAwLjEsIFwiem9vbVlcIjogMC4xMiwgXCJyb3RhdGlvblwiOiAwLjA0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvcGF0cmlja3MucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJuZ2lyZWxhbmRcIiwgXCJ4XCI6IDQzMSwgXCJ5XCI6IDY5NCwgXCJ6b29tWFwiOiAwLjE0LCBcInpvb21ZXCI6IDAuMzc1LCBcInJvdGF0aW9uXCI6IC0wLjEzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL25naXJlbGFuZC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjhcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImJsdWVjb2F0c1wiLCBcInhcIjogLTk5NywgXCJ5XCI6IDg2LCBcInpvb21YXCI6IDAuMSwgXCJ6b29tWVwiOiAwLjIsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9ibHVlY29hdHMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJjb2xsaW5zYmFycmFja3NcIiwgXCJ4XCI6IC0xMTMwLCBcInlcIjogOTAsIFwiem9vbVhcIjogMC4xMywgXCJ6b29tWVwiOiAwLjM3LCBcInJvdGF0aW9uXCI6IDAuMDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvY29sbGluc2JhcnJhY2tzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiaHVnaGxhbmVcIiwgXCJ4XCI6IC0xNzIsIFwieVwiOiAtMzM1LCBcInpvb21YXCI6IDAuMiwgXCJ6b29tWVwiOiAwLjMzLCBcInJvdGF0aW9uXCI6IC0wLjA2LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvaHVnaGxhbmUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJncG9cIiwgXCJ4XCI6IDUyLCBcInlcIjogNTAsIFwiem9vbVhcIjogMC4wODYsIFwiem9vbVlcIjogMC4yNSwgXCJyb3RhdGlvblwiOiAtMC4wMzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9ncG8ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtb3VudGpveVwiLCBcInhcIjogMjYzLCBcInlcIjogLTU2MCwgXCJ6b29tWFwiOiAwLjE1LCBcInpvb21ZXCI6IDAuMjg1LCBcInJvdGF0aW9uXCI6IDAuMTcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9tb3VudGpveS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm1vdW50am95YlwiLCBcInhcIjogMTUyLCBcInlcIjogLTU3MCwgXCJ6b29tWFwiOiAwLjIsIFwiem9vbVlcIjogMC4zMDUsIFwicm90YXRpb25cIjogMC4wNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21vdW50am95Yi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInJveWFsaG9zcGl0YWxcIiwgXCJ4XCI6IC0xODUxLCBcInlcIjogNDg3LjUsIFwiem9vbVhcIjogMC4yMSwgXCJ6b29tWVwiOiAwLjMsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9yb3lhbGhvc3BpdGFsLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwicGVwcGVyXCIsIFwieFwiOiA4MzQsIFwieVwiOiA5OTAsIFwiem9vbVhcIjogMC4wNiwgXCJ6b29tWVwiOiAwLjE0NSwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL3BlcHBlci5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImxpYmVydHloYWxsXCIsIFwieFwiOiAyNzAsIFwieVwiOiAtMTQsIFwiem9vbVhcIjogMC40MywgXCJ6b29tWVwiOiAwLjQzLCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbGliZXJ0eS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImN1c3RvbXNob3VzZVwiLCBcInhcIjogMzgyLCBcInlcIjogMTA3LCBcInpvb21YXCI6IDAuMTUsIFwiem9vbVlcIjogMC4zMCwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2N1c3RvbXNob3VzZS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fVxuXSIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMzJcIiwgXCJ4XCI6IC03NzYsIFwieVwiOiAzMi41NSwgXCJ6b29tWFwiOiAwLjI5LCBcInpvb21ZXCI6IDAuMjgsIFwicm90YXRpb25cIjogLTEuNDcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0wMzItbS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDb25zdGl0dXRpb24gSGlsbCAtIFR1cm5waWtlLCBHbGFzbmV2aW4gUm9hZDsgc2hvd2luZyBwcm9wb3NlZCByb2FkIHRvIEJvdGFuaWMgR2FyZGVuc1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDcyXCIsIFwieFwiOiAtMjUyLCBcInlcIjogLTI0NywgXCJ6b29tWFwiOiAwLjMxOCwgXCJ6b29tWVwiOiAwLjMxNCwgXCJyb3RhdGlvblwiOiAxLjU4NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTA3Mi1tLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBvZiBpbXByb3ZpbmcgdGhlIHN0cmVldHMgYmV0d2VlbiBSaWNobW9uZCBCcmlkZ2UgKEZvdXIgQ291cnRzKSBhbmQgQ29uc3RpdHV0aW9uIEhpbGwgKEtpbmfigJlzIElubnMpIERhdGU6IDE4MzdcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA3NVwiLCBcInhcIjogLTIxNy41LCBcInlcIjogLTE0MTQuNSwgXCJ6b29tWFwiOiAwLjg3LCBcInpvb21ZXCI6IDAuNzcyLCBcInJvdGF0aW9uXCI6IDEuNjE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMDc1LW0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIGEgbGluZSBvZiByb2FkLCBsZWFkaW5nIGZyb20gTGluZW4gSGFsbCB0byBHbGFzbmV2aW4gUm9hZCwgc2hvd2luZyB0aGUgUm95YWwgQ2FuYWwgRGF0ZTogMTgwMFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzYxXCIsIFwieFwiOiA0NjQsIFwieVwiOiAyMTMxLCBcInpvb21YXCI6IDAuNDM2LCBcInpvb21ZXCI6IDAuNDM2LCBcInJvdGF0aW9uXCI6IC0yLjA0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM2MS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkxlZXNvbiBTdHJlZXQsIFBvcnRsYW5kIFN0cmVldCAobm93IFVwcGVyIExlZXNvbiBTdHJlZXQpLCBFdXN0YWNlIFBsYWNlLCBFdXN0YWNlIEJyaWRnZSAobm93IExlZXNvbiBTdHJlZXQpLCBIYXRjaCBTdHJlZXQsIENpcmN1bGFyIFJvYWQgLSBzaWduZWQgYnkgQ29tbWlzc2lvbmVycyBvZiBXaWRlIFN0cmVldHMgRGF0ZTogMTc5MlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDg4LTFcIiwgXCJ4XCI6IC0wLjksIFwieVwiOiAyLjY3LCBcInpvb21YXCI6IDAuNSwgXCJ6b29tWVwiOiAwLjUsIFwicm90YXRpb25cIjogLTMuMzIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0wODgtMS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjBcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMDYtMVwiLCBcInhcIjogLTc1NywgXCJ5XCI6IDQ5NS41LCBcInpvb21YXCI6IDAuMjY1LCBcInpvb21ZXCI6IDAuMjY1LCBcInJvdGF0aW9uXCI6IC0wLjA3NCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTEwNi0xLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDEuMCwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBzaG93aW5nIHByb3Bvc2VkIGltcHJvdmVtZW50cyB0byBiZSBtYWRlIGluIENvcm5tYXJrZXQsIEN1dHB1cnNlIFJvdywgTGFtYiBBbGxleSAtIEZyYW5jaXMgU3RyZWV0IC0gYW5kIGFuIGltcHJvdmVkIGVudHJhbmNlIGZyb20gS2V2aW4gU3RyZWV0IHRvIFNhaW50IFBhdHJpY2vigJlzIENhdGhlZHJhbCwgdGhyb3VnaCBNaXRyZSBBbGxleSBhbmQgYXQgSmFtZXPigJlzIEdhdGUuIERhdGU6IDE4NDUtNDYgXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNDJcIiwgXCJ4XCI6IDk0Ljk5NSwgXCJ5XCI6IDIzNzcuNSwgXCJ6b29tWFwiOiAwLjQ4MiwgXCJ6b29tWVwiOiAwLjQ3NiwgXCJyb3RhdGlvblwiOiAtMi4wMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0xNDItbC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxLjAsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiB0aGUgTmV3IFN0cmVldHMsIGFuZCBvdGhlciBpbXByb3ZlbWVudHMgaW50ZW5kZWQgdG8gYmUgaW1tZWRpYXRlbHkgZXhlY3V0ZWQuIFNpdHVhdGUgb24gdGhlIFNvdXRoIFNpZGUgb2YgdGhlIENpdHkgb2YgRHVibGluLCBzdWJtaXR0ZWQgZm9yIHRoZSBhcHByb2JhdGlvbiBvZiB0aGUgQ29tbWlzc2lvbmVycyBvZiBXaWRlIFN0cmVldHMsIHBhcnRpY3VsYXJseSBvZiB0aG9zZSBwYXJ0cyBiZWxvbmdpbmcgdG8gV20uIENvcGUgYW5kIEpvaG4gTG9ja2VyLCBFc3EuLCBIYXJjb3VydCBTdHJlZXQsIENoYXJsZW1vdW50IFN0cmVldCwgUG9ydG9iZWxsbywgZXRjLiBEYXRlOiAxNzkyXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNTVcIiwgXCJ4XCI6IC0xNTA2LCBcInlcIjogLTUwLjUsIFwiem9vbVhcIjogMS4wMSwgXCJ6b29tWVwiOiAwLjk3MiwgXCJyb3RhdGlvblwiOiAtMC4wMjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0xNTUtbS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjYsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk5ldyBhcHByb2FjaCBmcm9tIE1pbGl0YXJ5IFJvYWQgdG8gS2luZ+KAmXMgQnJpZGdlLCBhbmQgYWxvbmcgdGhlIFF1YXlzIHRvIEFzdG9u4oCZcyBRdWF5IERhdGU6IDE4NDFcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE1Ny0zXCIsIFwieFwiOiAzLjExNSwgXCJ5XCI6IDMuNjUsIFwiem9vbVhcIjogMC41MjUsIFwiem9vbVlcIjogMC41OSwgXCJyb3RhdGlvblwiOiAwLjU0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTU3LTMtbS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjAsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJzaG93aW5nIHRoZSBpbXByb3ZlbWVudHMgcHJvcG9zZWQgYnkgdGhlIENvbW1pc3Npb25lcnMgb2YgV2lkZSBTdHJlZXRzIGluIE5hc3NhdSBTdHJlZXQsIExlaW5zdGVyIFN0cmVldCBhbmQgQ2xhcmUgU3RyZWV0XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNjRcIiwgXCJ4XCI6IC00NzIsIFwieVwiOjgwNSwgXCJ6b29tWFwiOiAwLjA1NiwgXCJ6b29tWVwiOiAwLjA1NiwgXCJyb3RhdGlvblwiOiAwLjA5LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTY0LWwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMS4wLCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBvZiBTYWludCBQYXRyaWNr4oCZcywgZXRjLiBEYXRlOiAxODI0XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00NjktMDJcIiwgXCJ4XCI6IDI1NSwgXCJ5XCI6IDEzODkuNSwgXCJ6b29tWFwiOiAwLjI0NSwgXCJ6b29tWVwiOiAwLjI0NSwgXCJyb3RhdGlvblwiOiAtMi43NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTQ2OS0yLW0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRWFybHNmb3J0IFRlcnJhY2UsIFN0ZXBoZW7igJlzIEdyZWVuIFNvdXRoIGFuZCBIYXJjb3VydCBTdHJlZXQgc2hvd2luZyBwbGFuIG9mIHByb3Bvc2VkIG5ldyBzdHJlZXRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM1NS0xXCIsIFwieFwiOiA2OTYsIFwieVwiOiA3MTMuNSwgXCJ6b29tWFwiOiAwLjMyMywgXCJ6b29tWVwiOiAwLjI4OSwgXCJyb3RhdGlvblwiOiAxLjE0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM1NS0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gb2YgQmFnZ290IFN0cmVldCBhbmQgRml0endpbGxpYW0gU3RyZWV0LCBzaG93aW5nIGF2ZW51ZXMgdGhlcmVvZiBOby4gMSBEYXRlOiAxNzkwXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy03MjlcIiwgXCJ4XCI6IC0xMDg4LjUsIFwieVwiOiA2NTIsIFwiem9vbVhcIjogMC4xODQsIFwiem9vbVlcIjogMC4xODQsIFwicm90YXRpb25cIjogLTMuNDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNzI5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCAtIEphbWVz4oCZcyBTdHJlZXQsIEJhc29uIExhbmUsIEVjaGxpbuKAmXMgTGFuZSwgR3JhbmQgQ2FuYWwgUGxhY2UsIENpdHkgQmFzb24gYW5kIEdyYW5kIENhbmFsIEhhcmJvdXJcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTc1N1wiLCBcInhcIjogLTg4MSwgXCJ5XCI6IDI2MS41LCBcInpvb21YXCI6IDAuMzU1LCBcInpvb21ZXCI6IDAuMzU1LCBcInJvdGF0aW9uXCI6IC0wLjAyNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTc1Ny1sLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcImZvdXIgY291cnRzIHRvIHN0IHBhdHJpY2tzLCB0aGUgY2FzdGxlIHRvIHRob21hcyBzdHJlZXRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTEzOFwiLCBcInhcIjogMjEyLjUsIFwieVwiOiAxNDcsIFwiem9vbVhcIjogMC4xOSwgXCJ6b29tWVwiOiAwLjE3NiwgXCJyb3RhdGlvblwiOiAwLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTM4LWwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcHJlbWlzZXMsIEdlb3JnZeKAmXMgUXVheSwgQ2l0eSBRdWF5LCBUb3duc2VuZCBTdHJlZXQgYW5kIG5laWdoYm91cmhvb2QsIHNob3dpbmcgcHJvcGVydHkgbG9zdCB0byB0aGUgQ2l0eSwgaW4gYSBzdWl0IGJ5ICdUaGUgQ29ycG9yYXRpb24gLSB3aXRoIFRyaW5pdHkgQ29sbGVnZSdcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE4OVwiLCBcInhcIjogLTc5Mi41LCBcInlcIjogMjYyLjUsIFwiem9vbVhcIjogMC4yNiwgXCJ6b29tWVwiOiAwLjI1OCwgXCJyb3RhdGlvblwiOiAwLjAwMywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xODkucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDb3B5IG9mIG1hcCBvZiBwcm9wb3NlZCBOZXcgU3RyZWV0IGZyb20gRXNzZXggU3RyZWV0IHRvIENvcm5tYXJrZXQsIHdpdGggdGhlIGVudmlyb25zIGFuZCBzdHJlZXRzIGJyYW5jaGluZyBvZmZcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA5OFwiLCBcInhcIjogLTQ3NSwgXCJ5XCI6IDUyNCwgXCJ6b29tWFwiOiAwLjA2MywgXCJ6b29tWVwiOiAwLjA2MywgXCJyb3RhdGlvblwiOiAtMC4xNiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTA5OC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBDaHJpc3RjaHVyY2gsIFNraW5uZXJzIFJvdyBldGMuIFRob21hcyBTaGVycmFyZCwgNSBKYW51YXJ5IDE4MjEgRGF0ZTogMTgyMVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjAyXCIsIFwieFwiOiAxNiwgXCJ5XCI6IDgxLCBcInpvb21YXCI6IDAuMjg5LCBcInpvb21ZXCI6IDAuMjYzLCBcInJvdGF0aW9uXCI6IC0wLjEwNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yMDItYy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjQsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcImFyZWEgaW1tZWRpYXRlbHkgbm9ydGggb2YgUml2ZXIgTGlmZmV5IGZyb20gU2Fja3ZpbGxlIFN0LCBMb3dlciBBYmJleSBTdCwgQmVyZXNmb3JkIFBsYWNlLCBhcyBmYXIgYXMgZW5kIG9mIE5vcnRoIFdhbGwuIEFsc28gc291dGggb2YgTGlmZmV5IGZyb20gV2VzdG1vcmxhbmQgU3RyZWV0IHRvIGVuZCBvZiBKb2huIFJvZ2Vyc29uJ3MgUXVheVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTc5XCIsIFwieFwiOiAtNTM3LjUsIFwieVwiOiA3MzAsIFwiem9vbVhcIjogMC4xNjgsIFwiem9vbVlcIjogMC4xNjQsIFwicm90YXRpb25cIjogMC4wMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xNzkucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMS4wLFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTYWludCBQYXRyaWNr4oCZcyBDYXRoZWRyYWwsIE5vcnRoIENsb3NlIGFuZCB2aWNpbml0eVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzI5XCIsIFwieFwiOiAtNjc4LCBcInlcIjogMzQ1LjUsIFwiem9vbVhcIjogMC4zMzYsIFwiem9vbVlcIjogMC4zMzYsIFwicm90YXRpb25cIjogLTAuMjE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMyOS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjMsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gZm9yIG9wZW5pbmcgYW5kIHdpZGVuaW5nIGEgcHJpbmNpcGFsIEF2ZW51ZSB0byB0aGUgQ2FzdGxlLCBub3cgKDE5MDApIFBhcmxpYW1lbnQgU3RyZWV0IC0gc2hvd2luZyBEYW1lIFN0cmVldCwgQ2FzdGxlIFN0cmVldCwgYW5kIGFsbCB0aGUgQXZlbnVlcyB0aGVyZW9mIERhdGU6IDE3NTdcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE4N1wiLCBcInhcIjogLTIyNiwgXCJ5XCI6IDQ5NC41LCBcInpvb21YXCI6IDAuMDY2LCBcInpvb21ZXCI6IDAuMDY0LCBcInJvdGF0aW9uXCI6IDAuMCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xODcucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMS4wLFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJBIHN1cnZleSBvZiBzZXZlcmFsIGhvbGRpbmdzIGluIFNvdXRoIEdyZWF0IEdlb3JnZSdzIFN0cmVldCAtIHRvdGFsIHB1cmNoYXNlIMKjMTE1MjguMTYuMyBEYXRlOjE4MDFcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTEyNFwiLCBcInhcIjogLTI3OSwgXCJ5XCI6IDM2NiwgXCJ6b29tWFwiOiAwLjA1NywgXCJ6b29tWVwiOiAwLjA1MSwgXCJyb3RhdGlvblwiOiAtMC4xNiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xMjQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcHJlbWlzZXMgaW4gRXNzZXggU3RyZWV0IGFuZCBQYXJsaWFtZW50IFN0cmVldCwgc2hvd2luZyBFc3NleCBCcmlkZ2UgYW5kIE9sZCBDdXN0b20gSG91c2UuIFQuIGFuZCBELkguIFNoZXJyYXJkIERhdGU6IDE4MTNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM2MFwiLCBcInhcIjogLTE0NCwgXCJ5XCI6IDQyMS41LCBcInpvb21YXCI6IDAuMTIxLCBcInpvb21ZXCI6IDAuMTA3LCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM2MC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCAtIERhbWUgU3RyZWV0IGFuZCBhdmVudWVzIHRoZXJlb2YgLSBFdXN0YWNlIFN0cmVldCwgQ2VjaWxpYSBTdHJlZXQsIGFuZCBzaXRlIG9mIE9sZCBUaGVhdHJlLCBGb3duZXMgU3RyZWV0LCBDcm93biBBbGxleSBhbmQgQ29wZSBTdHJlZXQgRGF0ZTogMTc5MlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzYyXCIsIFwieFwiOiAzNS41LCBcInlcIjogODQuNSwgXCJ6b29tWFwiOiAwLjIyOSwgXCJ6b29tWVwiOiAwLjIzNSwgXCJyb3RhdGlvblwiOiAwLjEyNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNjItMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjQsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcHMgLSBDb2xsZWdlIEdyZWVuLCBDb2xsZWdlIFN0cmVldCwgV2VzdG1vcmVsYW5kIFN0cmVldCBhbmQgYXZlbnVlcyB0aGVyZW9mLCBzaG93aW5nIHRoZSBzaXRlIG9mIFBhcmxpYW1lbnQgSG91c2UgYW5kIFRyaW5pdHkgQ29sbGVnZSBOby4gMSBEYXRlOiAxNzkzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zODdcIiwgXCJ4XCI6IDI3Mi41LCBcInlcIjogNDIzLjUsIFwiem9vbVhcIjogMC4wODEsIFwiem9vbVlcIjogMC4wNzcsIFwicm90YXRpb25cIjogMy4wMzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzg3LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIGhvbGRpbmdzIGluIEZsZWV0IFN0cmVldCBhbmQgQ29sbGVnZSBTdHJlZXQsIHNob3dpbmcgc2l0ZSBvZiBPbGQgV2F0Y2ggSG91c2UgRGF0ZTogMTgwMVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjE4XCIsIFwieFwiOiAtMjQ1NSwgXCJ5XCI6IC0yODQuNSwgXCJ6b29tWFwiOiAwLjQ1MywgXCJ6b29tWVwiOiAwLjQ1MSwgXCJyb3RhdGlvblwiOiAtMC4wNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yMTgucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTdXJ2ZXkgb2YgdGhlIExvbmcgTWVhZG93cyBhbmQgcGFydCBvZiB0aGUgUGhvZW5peCBQYXJrIGFuZCBQYXJrZ2F0ZSBTdHJlZXQgRGF0ZTogMTc4NlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjI5XCIsIFwieFwiOiAtMjM4NCwgXCJ5XCI6IDU1LjUsIFwiem9vbVhcIjogMC4zNzksIFwiem9vbVlcIjogMC4zNzksIFwicm90YXRpb25cIjogMC4wMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjI5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU2VjdGlvbiBhY3Jvc3MgdGhlIHByb3Bvc2VkIFJvYWQgZnJvbSB0aGUgUGFyayBHYXRlIHRvIElzbGFuZCBCcmlkZ2UgR2F0ZSAtIG5vdyAoMTkwMCkgQ29ueW5naGFtIFJvYWQgRGF0ZTogMTc4OVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjQyXCIsIFwieFwiOiAtNDA1LjUsIFwieVwiOiAyMSwgXCJ6b29tWFwiOiAwLjA4NCwgXCJ6b29tWVwiOiAwLjA4NCwgXCJyb3RhdGlvblwiOiAxLjA4NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yNDItMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiBhIGhvbGRpbmcgaW4gTWFyeeKAmXMgTGFuZSwgdGhlIGVzdGF0ZSBvZiB0aGUgUmlnaHQgSG9ub3VyYWJsZSBMb3JkIE1vdW50am95IERhdGU6IDE3OTNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTI0NVwiLCBcInhcIjogLTIxMC4wLCBcInlcIjotMzk3LjUsIFwiem9vbVhcIjogMC4wODQsIFwiem9vbVlcIjogMC4wODQsIFwicm90YXRpb25cIjogLTAuNjIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjQ1LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgdGhlIEJhcmxleSBGaWVsZHMgZXRjLiwgYW5kIGEgcGxhbiBmb3Igb3BlbmluZyBhIHN0cmVldCBmcm9tIFJ1dGxhbmQgU3F1YXJlLCBEb3JzZXQgU3RyZWV0LCBiZWluZyBub3cgKDE4OTkpIGtub3duIGFzIFNvdXRoIEZyZWRlcmljayBTdHJlZXQgLSB3aXRoIHJlZmVyZW5jZSBEYXRlOiAxNzg5XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yNTdcIiwgXCJ4XCI6IDY4MS4wLCBcInlcIjotMTIyMy41LCBcInpvb21YXCI6IDAuMzQ2LCBcInpvb21ZXCI6IDAuMzg4LCBcInJvdGF0aW9uXCI6IDAuMjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjU3LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIENsb25saWZmZSBSb2FkIGFuZCB0aGUgT2xkIFR1cm5waWtlIEhvdXNlIGF0IEJhbGx5Ym91Z2ggQnJpZGdlIC0gTm9ydGggU3RyYW5kIERhdGU6IDE4MjNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTI2OFwiLCBcInhcIjogLTE1MjguMCwgXCJ5XCI6IDEwNS41LCBcInpvb21YXCI6IDAuMDg2LCBcInpvb21ZXCI6IDAuMDg2LCBcInJvdGF0aW9uXCI6IDAuMDcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjY4LTMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBQYXJrZ2F0ZSBTdHJlZXQsIENvbnluZ2hhbSBSb2FkLCB3aXRoIHJlZmVyZW5jZSB0byBuYW1lcyBvZiB0ZW5hbnRzIGVuZG9yc2VkIE5vLiAzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNzFcIiwgXCJ4XCI6IDExMi4wLCBcInlcIjogMTgxLjUsIFwiem9vbVhcIjogMC4wMjEsIFwiem9vbVlcIjogMC4wMjEsIFwicm90YXRpb25cIjogLTAuMjY1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE3MS0yLmpwZWdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBMb3dlciBBYmJleSBTdHJlZXQsIHRvIGNvcm5lciBvZiBFZGVuIFF1YXkgKFNhY2t2aWxsZSBTdHJlZXQpIERhdGU6IDE4MTNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM4MFwiLCBcInhcIjogMjQxLjUsIFwieVwiOiAyODYsIFwiem9vbVhcIjogMC4wMzMsIFwiem9vbVlcIjogMC4wMzMsIFwicm90YXRpb25cIjogMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zODAtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjQsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCAtIEZsZWV0IE1hcmtldCwgUG9vbGJlZyBTdHJlZXQsIEhhd2tpbnMgU3RyZWV0LCBUb3duc2VuZCBTdHJlZXQsIEZsZWV0IFN0cmVldCwgRHVibGluIFNvY2lldHkgU3RvcmVzIERhdGU6IDE4MDBcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTMwOVwiLCBcInhcIjogMzYuMCwgXCJ5XCI6IC0yOTcsIFwiem9vbVhcIjogMC4yMTksIFwiem9vbVlcIjogMC4yMTksIFwicm90YXRpb25cIjogLTAuNDM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMwOS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBhcnQgb2YgR2FyZGluZXIgU3RyZWV0IGFuZCBwYXJ0IG9mIEdsb3VjZXN0ZXIgU3RyZWV0LCBsYW5kIG91dCBpbiBsb3RzIGZvciBidWlsZGluZyAtIHNob3dpbmcgR2xvdWNlc3RlciBTdHJlZXQsIEdsb3VjZXN0ZXIgUGxhY2UsIHRoZSBEaWFtb25kLCBTdW1tZXIgSGlsbCwgR3JlYXQgQnJpdGFpbiBTdHJlZXQsIEN1bWJlcmxhbmQgU3RyZWV0LCBNYXJsYm9yb+KAmSBTdHJlZXQsIE1hYmJvdCBTdHJlZXQsIE1lY2tsaW5idXJnaCBldGMuRGF0ZTogMTc5MVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjk0XCIsIFwieFwiOiAxMjUuMCwgXCJ5XCI6IC0xMTgsIFwiem9vbVhcIjogMC4xMjksIFwiem9vbVlcIjogMC4xMjksIFwicm90YXRpb25cIjogLTAuMTk1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMjk0LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTdXJ2ZXkgb2YgcGFydCBvZiB0aGUgTG9yZHNoaXAgb2YgU2FpbnQgTWFyeeKAmXMgQWJiZXkgLSBwYXJ0IG9mIHRoZSBlc3RhdGUgb2YgdGhlIFJpZ2h0IEhvbm9yYWJsZSBMdWtlIFZpc2NvdW50IE1vdW50am95LCBzb2xkIHRvIFJpY2hhcmQgRnJlbmNoIEVzcS4sIHB1cnN1YW50IHRvIGEgRGVjcmVlIG9mIEhpcyBNYWplc3R54oCZcyBIaWdoIENvdXJ0IG9mIENoYW5jZXJ5LCAxNyBGZWIgMTc5NFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzEwXCIsIFwieFwiOiA0NzQuMCwgXCJ5XCI6IC04MjEuNSwgXCJ6b29tWFwiOiAwLjU3NiwgXCJ6b29tWVwiOiAwLjU3NiwgXCJyb3RhdGlvblwiOiAwLjE0NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zMTAucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJOb3J0aCBMb3RzIC0gZnJvbSB0aGUgTm9ydGggU3RyYW5kIFJvYWQsIHRvIHRoZSBOb3J0aCBhbmQgRWFzdCBXYWxscyBEYXRlOiAxNzkzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMjVcIiwgXCJ4XCI6IC04OTMuMCwgXCJ5XCI6IDQxLCBcInpvb21YXCI6IDAuMjg2LCBcInpvb21ZXCI6IDAuMjg2LCBcInJvdGF0aW9uXCI6IDAuMDMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzI1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU21pdGhmaWVsZCwgQXJyYW4gUXVheSwgSGF5bWFya2V0LCBXZXN0IEFycmFuIFN0cmVldCwgTmV3IENodXJjaCBTdHJlZXQsIEJvdyBMYW5lLCBCb3cgU3RyZWV0LCBNYXkgTGFuZVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzI2LTFcIiwgXCJ4XCI6IC0xNDE1LjUsIFwieVwiOiAxMTIuNSwgXCJ6b29tWFwiOiAwLjExNCwgXCJ6b29tWVwiOiAwLjExMiwgXCJyb3RhdGlvblwiOiAwLjE3LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMyNi0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQmFycmFjayBTdHJlZXQsIFBhcmsgU3RyZWV0LCBQYXJrZ2F0ZSBTdHJlZXQgYW5kIFRlbXBsZSBTdHJlZXQsIHdpdGggcmVmZXJlbmNlIHRvIG5hbWVzIG9mIHRlbmFudHMgYW5kIHByZW1pc2VzIE5vLiAxXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy02MzJcIiwgXCJ4XCI6IDEyNSwgXCJ5XCI6IDM0Ny41LCBcInpvb21YXCI6IDAuMTcyLCBcInpvb21ZXCI6IDAuMTY0LCBcInJvdGF0aW9uXCI6IDAuNTMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNjMyLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIE5hc3NhdSBTdHJlZXQsIGxlYWRpbmcgZnJvbSBHcmFmdG9uIFN0cmVldCB0byBNZXJyaW9uIFNxdWFyZSAtIHNob3dpbmcgdGhlIG9mZiBzdHJlZXRzIGFuZCBwb3J0aW9uIG9mIEdyYWZ0b24gU3RyZWV0IGFuZCBTdWZmb2xrIFN0cmVldCBEYXRlOiAxODMzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMjYtMlwiLCBcInhcIjogLTEyNTcuNSwgXCJ5XCI6IDE0My41LCBcInpvb21YXCI6IDAuMSwgXCJ6b29tWVwiOiAwLjEsIFwicm90YXRpb25cIjogMC4wNzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzI2LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJCYXJyYWNrIFN0cmVldCwgUGFyayBTdHJlZXQsIFBhcmtnYXRlIFN0cmVldCBhbmQgVGVtcGxlIFN0cmVldCwgd2l0aCByZWZlcmVuY2UgdG8gbmFtZXMgb2YgdGVuYW50cyBhbmQgcHJlbWlzZXNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTMzNFwiLCBcInhcIjogOTAuNSwgXCJ5XCI6IDM1NywgXCJ6b29tWFwiOiAwLjEyOCwgXCJ6b29tWVwiOiAwLjEyOCwgXCJyb3RhdGlvblwiOiAxLjI2NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zMzQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC4xLFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJEYW1lIFN0cmVldCwgQ29sbGVnZSBHcmVlbiwgR2Vvcmdl4oCZcyBMYW5lLCBHZW9yZ2XigJlzIFN0cmVldCwgQ2hlcXVlciBTdHJlZXQgYW5kIGF2ZW51ZXMgdGhlcmVvZlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzU1LTJcIiwgXCJ4XCI6IDE4NSwgXCJ5XCI6IDEwMjksIFwiem9vbVhcIjogMC4zMDIsIFwiem9vbVlcIjogMC4zMDIsIFwicm90YXRpb25cIjogLTAuNDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzU1LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIEJhZ2dvdCBTdHJlZXQgYW5kIEZpdHp3aWxsaWFtIFN0cmVldCwgc2hvd2luZyBhdmVudWVzIHRoZXJlb2YgTm8uIDIgRGF0ZTogMTc5MlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzY4XCIsIFwieFwiOiAtNjg3LjUsIFwieVwiOiAyNzcuNSwgXCJ6b29tWFwiOiAwLjE1NiwgXCJ6b29tWVwiOiAwLjE1LCBcInJvdGF0aW9uXCI6IDAuMTIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzY4LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIEtpbmfigJlzIElubiBRdWF5IGFuZCBNZXJjaGFudHMgUXVheSwgc2hvd2luZyBzaXRlIG9mIE9ybW9uZCBCcmlkZ2UgLSBiZWxvdyBDaGFybGVzIFN0cmVldCAtIGFmdGVyd2FyZHMgcmVtb3ZlZCBhbmQgcmUtZXJlY3RlZCBvcHBvc2l0ZSBXaW5ldGF2ZXJuIFN0cmVldCBEYXRlOiAxNzk3XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zNzJcIiwgXCJ4XCI6IDM0MS41LCBcInlcIjogMjk2LjUsIFwiem9vbVhcIjogMC4wMzYsIFwiem9vbVlcIjogMC4wMzM5LCBcInJvdGF0aW9uXCI6IDIuOTU1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM3Mi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkdlb3JnZSdzIFF1YXksIFdoaXRlcyBMYW5lLCBhbmQgSGF3a2lucyBTdHJlZXQsIHNob3dpbmcgc2l0ZSBvZiBTd2VldG1hbidzIEJyZXdlcnkgd2hpY2ggcmFuIGRvd24gdG8gUml2ZXIgTGlmZmV5IERhdGU6IDE3OTlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM5MC0xXCIsIFwieFwiOiAtODA0LjUsIFwieVwiOiA0MjAsIFwiem9vbVhcIjogMC4yMDQsIFwiem9vbVlcIjogMC4yMDIsIFwicm90YXRpb25cIjogLTAuMDcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzkwLTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIHByb3Bvc2VkIE1hcmtldCBIb3VzZSwgYWRqb2luaW5nIFRob21hcyBTdHJlZXQsIFZpY2FyIFN0cmVldCwgTWFya2V0IFN0cmVldCBhbmQgRnJhbmNpcyBTdHJlZXQgRGF0ZTogMTgwMVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzk1LTNcIiwgXCJ4XCI6IC01ODgsIFwieVwiOiA1NzgsIFwiem9vbVhcIjogMC4wMzYsIFwiem9vbVlcIjogMC4wMzYsIFwicm90YXRpb25cIjogLTMuNjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzk1LTMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJOZXcgUm93IGFuZCBDdXRwdXJzZSBSb3cgRGF0ZTogMTgwMFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDA0XCIsIFwieFwiOiAtMTYsIFwieVwiOiAzNzIsIFwiem9vbVhcIjogMC4wNjIsIFwiem9vbVlcIjogMC4wNiwgXCJyb3RhdGlvblwiOiAtMC4yNTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDA0LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQW5nbGVzZWEgU3RyZWV0IGFuZCBQYXJsaWFtZW50IEhvdXNlIERhdGU6IDE4MDJcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQxMVwiLCBcInhcIjogMzQzLjUsIFwieVwiOiA2NTcsIFwiem9vbVhcIjogMC4wODYsIFwiem9vbVlcIjogMC4wODYsIFwicm90YXRpb25cIjogMC4zMjUsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJMZWluc3RlciBIb3VzZSBhbmQgcGFydCBvZiB0aGUgZXN0YXRlIG9mIFZpc2NvdW50IEZpdHp3aWxsaWFtIChmb3JtZXJseSBMZWluc3RlciBMYXduKSwgbGFpZCBvdXQgaW4gbG90cyBmb3IgYnVpbGRpbmcgLSBzaG93aW5nIEtpbGRhcmUgU3RyZWV0LCBVcHBlciBNZXJyaW9uIFN0cmVldCBhbmQgTGVpbnN0ZXIgUGxhY2UgKFN0cmVldCksIE1lcnJpb24gUGxhY2UsIGFuZCB0aGUgT2xkIEJvdW5kYXJ5IGJldHdlZW4gTGVpbnN0ZXIgYW5kIExvcmQgRml0endpbGxpYW0gLSB0YWtlbiBmcm9tIGEgbWFwIHNpZ25lZCBSb2JlcnQgR2lic29uLCBNYXkgMTgsIDE3NTQgRGF0ZTogMTgxMlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjUxXCIsIFwieFwiOiAyMjAsIFwieVwiOiA2NCwgXCJ6b29tWFwiOiAwLjIzNiwgXCJ6b29tWVwiOiAwLjIzNiwgXCJyb3RhdGlvblwiOiAtMS40OSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTI1MS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwb3J0aW9uIG9mIENpdHksIHNob3dpbmcgTW9udGdvbWVyeSBTdHJlZXQsIE1lY2tsaW5idXJnaCBTdHJlZXQsIExvd2VyIEdsb3VjZXN0ZXIgU3RyZWV0IGFuZCBwb3J0aW9uIG9mIE1hYmJvdCBTdHJlZXRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQxM1wiLCBcInhcIjogLTM3MywgXCJ5XCI6IDgwNi41LCBcInpvb21YXCI6IDAuMDc4LCBcInpvb21ZXCI6IDAuMDc2LCBcInJvdGF0aW9uXCI6IC0wLjE1LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDEzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGV0ZXIgU3RyZWV0LCBQZXRlcuKAmXMgUm93LCBXaGl0ZWZyaWFyIFN0cmVldCwgV29vZCBTdHJlZXQgYW5kIEJyaWRlIFN0cmVldCAtIHNob3dpbmcgc2l0ZSBvZiB0aGUgQW1waGl0aGVhdHJlIGluIEJyaWRlIFN0cmVldCwgd2hlcmUgdGhlIE1vbGV5bmV1eCBDaHVyY2ggbm93ICgxOTAwKSBzdGFuZHMgRGF0ZTogMTgxMlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDE0XCIsIFwieFwiOiAtMTkzLjUsIFwieVwiOiAzNjMuNSwgXCJ6b29tWFwiOiAwLjA3MiwgXCJ6b29tWVwiOiAwLjA3NCwgXCJyb3RhdGlvblwiOiAtMC4yMyxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQxNC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlRlbXBsZSBCYXIsIFdlbGxpbmd0b24gUXVheSwgT2xkIEN1c3RvbSBIb3VzZSwgQmFnbmlvIFNsaXAgZXRjLiBEYXRlOiAxODEzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MjFcIiwgXCJ4XCI6IC00NzQuNSwgXCJ5XCI6IDUyNywgXCJ6b29tWFwiOiAwLjA2MiwgXCJ6b29tWVwiOiAwLjA2LCBcInJvdGF0aW9uXCI6IC0wLjE4NSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQyMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjYsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiB0aGUgcHJlY2luY3RzIG9mIENocmlzdCBDaHVyY2ggRHVibGluLCBzaG93aW5nIFNraW5uZXJzIFJvdywgdG8gd2hpY2ggaXMgYXR0YWNoZWQgYSBNZW1vcmFuZHVtIGRlbm9taW5hdGluZyB0aGUgcHJlbWlzZXMsIHRha2VuIGJ5IHRoZSBDb21taXNzaW9uZXJzIG9mIFdpZGUgU3RyZWV0cyBmb3IgdGhlIHB1cnBvc2Ugb2Ygd2lkZW5pbmcgc2FpZCBTa2lubmVycyBSb3csIG5vdyAoMTkwMCkga25vd24gYXMgQ2hyaXN0IENodXJjaCBQbGFjZSBEYXRlOiAxODE3XCJcblx0fSxcblx0eyBcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDA4LTJcIiwgXCJ4XCI6IC0zOTcuNSwgXCJ5XCI6IDU0NS41LCBcInpvb21YXCI6IDAuMDQ0LCBcInpvb21ZXCI6IDAuMDQ0LCBcInJvdGF0aW9uXCI6IC0wLjEyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQwOC0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiV2VyYnVyZ2ggU3RyZWV0LCBTa2lubmVycyBSb3csIEZpc2hhbWJsZSBTdHJlZXQgYW5kIENhc3RsZSBTdHJlZXQgRGF0ZTogYy4gMTgxMFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDI1LTFcIiwgXCJ4XCI6IC05MTcuNSwgXCJ5XCI6IDU3Ny41LCBcInpvb21YXCI6IDAuMDQ1LCBcInpvb21ZXCI6IDAuMDQ2LCBcInJvdGF0aW9uXCI6IC0xLjQyNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MjUtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1lYXRoIFJvdywgTWFya+KAmXMgQWxsZXkgYW5kIERpcnR5IExhbmUgLSBzaG93aW5nIEJyaWRnZWZvb3QgU3RyZWV0LCBNYXNzIExhbmUsIFRob21hcyBTdHJlZXQgYW5kIFN0LiBDYXRoZXJpbmXigJlzIENodXJjaCBEYXRlOiAxODIwLTI0XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MjZcIiwgXCJ4XCI6IC03MzUuNSwgXCJ5XCI6IDU3OC41LCBcInpvb21YXCI6IDAuMDM0LCBcInpvb21ZXCI6IDAuMDM0LCBcInJvdGF0aW9uXCI6IDEuNTY1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQyNi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBzZXZlcmFsIGhvdXNlcyBhbmQgcHJlbWlzZXMgb24gdGhlIEVhc3Qgc2lkZSBvZiBNZWF0aCBSb3csIHRoZSBwcm9wZXJ0eSBvZiBNci4gSm9obiBXYWxzaCAtIHNob3dpbmcgdGhlIHNpdHVhdGlvbiBvZiBUaG9tYXMgU3RyZWV0LCBIYW5idXJ5IExhbmUgYW5kIHNpdGUgb2YgQ2hhcGVsIERhdGU6IDE4MjFcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTExMi0xXCIsIFwieFwiOiAtMjkwLjUsIFwieVwiOiAzNDQuNSwgXCJ6b29tWFwiOiAwLjE4LCBcInpvb21ZXCI6IDAuMTgyLCBcInJvdGF0aW9uXCI6IC0wLjI2LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTExMi0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuMyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRGFtZSBTdHJlZXQsIGZyb20gdGhlIGNvcm5lciBvZiBQYWxhY2UgU3RyZWV0IHRvIHRoZSBjb3JuZXIgb2YgR2Vvcmdl4oCZcyBTdHJlZXQgLSBsYWlkIG91dCBpbiBsb3RzIGZvciBidWlsZGluZyBOb3J0aCBhbmQgU291dGggYW5kIHZpY2luaXR5IERhdGU6IDE3ODJcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTExMlwiLCBcInhcIjogLTI5OCwgXCJ5XCI6IDMzOS41LCBcInpvb21YXCI6IDAuMTg1LCBcInpvb21ZXCI6IDAuMTg1LCBcInJvdGF0aW9uXCI6IC0wLjI1NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xMTIucG5nXCIsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJvcGFjaXR5XCI6IDAuMCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRGFtZSBTdHJlZXQsIGZyb20gdGhlIGNvcm5lciBvZiBQYWxhY2UgU3RyZWV0IHRvIHRoZSBjb3JuZXIgb2YgR2Vvcmdl4oCZcyBTdHJlZXQgLSBsYWlkIG91dCBpbiBsb3RzIGZvciBidWlsZGluZyBOb3J0aCBhbmQgU291dGggYW5kIHZpY2luaXR5IERhdGU6IDE3ODJcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ1NVwiLCBcInhcIjogNjM1LjUsIFwieVwiOiAxMjU4LCBcInpvb21YXCI6IDAuMjYzLCBcInpvb21ZXCI6IDAuMjYzLCBcInJvdGF0aW9uXCI6IC0wLjksIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDU1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiSGVyYmVydCBQbGFjZSBhbmQgQXZlbnVlcyBhZGphY2VudCB0byBVcHBlciBNb3VudCBTdHJlZXQsIHNob3dpbmcgVXBwZXIgQmFnZ290IFN0cmVldCAtIEhlcmJlcnQgU3RyZWV0LCBXYXJyaW5ndG9uIFBsYWNlIGFuZCBQZXJjeSBQbGFjZSwgTm9ydGh1bWJlcmxhbmQgUm9hZCBhbmQgTG93ZXIgTW91bnQgU3RyZWV0IERhdGU6IDE4MzNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE5OVwiLCBcInhcIjogODc4LjUsIFwieVwiOiAxMjE3LjUsIFwiem9vbVhcIjogMC4yNDEsIFwiem9vbVlcIjogMC4yNDEsIFwicm90YXRpb25cIjogMi4xMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTk5LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcGFydCBvZiB0aGUgZXN0YXRlIG9mIHRoZSBIb24uIFNpZG5leSBIZXJiZXJ0LCBjYWxsZWQgV2lsdG9uIFBhcmFkZSwgc2hvd2luZyB0aGUgcHJvcG9zZWQgYXBwcm9wcmlhdGlvbiB0aGVyZW9mIGluIHNpdGVzIGZvciBidWlsZGluZy4gQWxzbyBzaG93aW5nIEJhZ2dvdCBTdHJlZXQsIEdyYW5kIENhbmFsIGFuZCBGaXR6d2lsbGlhbSBQbGFjZS5cIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ2NVwiLCBcInhcIjogMzAxLjUsIFwieVwiOiA3MTEuNSwgXCJ6b29tWFwiOiAwLjIwNywgXCJ6b29tWVwiOiAwLjIwNywgXCJyb3RhdGlvblwiOiAzLjMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDY1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiR3JhZnRvbiBTdHJlZXQsIE5hc3NhdSBTdHJlZXQgKFNvdXRoIHNpZGUpIGFuZCBEYXdzb24gU3RyZWV0IERhdGU6IDE4MzdcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ4MC0yXCIsIFwieFwiOiAtNjMsIFwieVwiOiAzODIsIFwiem9vbVhcIjogMC4wNjgsIFwiem9vbVlcIjogMC4wNjgsIFwicm90YXRpb25cIjogLTAuMDU1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQ4MC0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTm9ydGggc2lkZSBvZiBDb2xsZWdlIEdyZWVuIHNob3dpbmcgQXZlbnVlcyB0aGVyZW9mLCBhbmQgZ3JvdW5kIHBsYW4gb2YgUGFybGlhbWVudCBIb3VzZSwgQW5nbGVzZWEgU3RyZWV0LCBCbGFja21vb3IgWWFyZCBldGMuIC0gd2l0aCByZWZlcmVuY2UgZ2l2aW5nIHRlbmFudHMsIG5hbWVzIG9mIHByZW1pc2VzIHJlcXVpcmVkIG9yIHB1cnBvc2Ugb2YgaW1wcm92ZW1lbnQuIERhdGU6IDE3ODZcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ5MVwiLCBcInhcIjogLTIxLjUsIFwieVwiOiA5MzgsIFwiem9vbVhcIjogMC4xNjQsIFwiem9vbVlcIjogMC4xNjQsIFwicm90YXRpb25cIjogLTMuMDgsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDkxLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQXVuZ2llciBTdHJlZXQsIE1lcmNlciBTdHJlZXQsIFlvcmsgU3RyZWV0IGFuZCBBdmVudWVzIHRoZXJlb2YsIHZpejogLSBGcmVuY2ggU3RyZWV0IChNZXJjZXIgU3RyZWV0KSwgQm93IExhbmUsIERpZ2dlcyBMYW5lLCBTdGVwaGVuIFN0cmVldCwgRHJ1cnkgTGFuZSwgR3JlYXQgYW5kIExpdHRsZSBMb25nZm9yZCBTdHJlZXRzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00OTZcIiwgXCJ4XCI6IC0yNzgsIFwieVwiOiA0NTYsIFwiem9vbVhcIjogMC4wMTgsIFwiem9vbVlcIjogMC4wMTgsIFwicm90YXRpb25cIjogLTMuMjYsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDk2LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRXNzZXggUXVheSwgQ2hhbmdlIEFsbGV5LCBTbW9jayBBbGxleSBhbmQgZ3JvdW5kIHBsYW4gb2YgU21vY2sgQWxsZXkgVGhlYXRyZVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNTA3XCIsIFwieFwiOiAtMjcyLjUsIFwieVwiOiAzNDYsIFwiem9vbVhcIjogMC4wODcsIFwiem9vbVlcIjogMC4wODksIFwicm90YXRpb25cIjogLTAuMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy01MDcucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJFc3NleCBTdHJlZXQsIFBhcmxpYW1lbnQgU3RyZWV0LCBzaG93aW5nIE9sZCBDdXN0b20gSG91c2UgUXVheSwgTG93ZXIgT3Jtb25kIFF1YXkgYW5kIERhbWUgU3RyZWV0XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yMDYtMVwiLCBcInhcIjogLTQ0LjUsIFwieVwiOiAtMjIxLCBcInpvb21YXCI6IDAuMDUsIFwiem9vbVlcIjogMC4wNSwgXCJyb3RhdGlvblwiOiAtMC42NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yMDYtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBhbmdsZSBvZiBDYXZlbmRpc2ggUm93LCBSdXRsYW5kIFNxdWFyZSBhbmQgR3JlYXQgQnJpdGFpbiBTdHJlZXQgLSBzaG93aW5nIHVuc2lnbmVkIGVsZXZhdGlvbnMgYW5kIGdyb3VuZCBwbGFuIG9mIFJvdHVuZGEgYnkgRnJlZGVyaWNrIFRyZW5jaC4gRGF0ZTogMTc4N1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjAzXCIsIFwieFwiOiAtMzkyLCBcInlcIjogMjcyLjUsIFwiem9vbVhcIjogMC4wNzgsIFwiem9vbVlcIjogMC4wNzYsIFwicm90YXRpb25cIjogLTAuMjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjAzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQ2l0eSBTdXJ2ZXkgLSBzaG93aW5nIE9ybW9uZCBRdWF5LCBBcnJhbiBTdHJlZXQsIE1hcnnigJlzIEFiYmV5LCBMaXR0bGUgU3RyYW5kIFN0cmVldCwgQ2FwZWwgU3RyZWV0IGFuZCBFc3NleCBCcmlkZ2UgRGF0ZTogMTgxMVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNTE1XCIsIFwieFwiOiAtNzUsIFwieVwiOiA1NTAsIFwiem9vbVhcIjogMC4wODgsIFwiem9vbVlcIjogMC4wODgsIFwicm90YXRpb25cIjogMi45MzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNTE1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwic2hvd2luZyBEYW1lIFN0cmVldCwgRXNzZXggU3RyZWV0IGV0Yy4gLSBhbHNvIHNpdGUgZm9yIHByb3Bvc2VkIE5hdGlvbmFsIEJhbmssIG9uIG9yIGFib3V0IHdoZXJlIHRoZSAnRW1waXJlJyAoZm9ybWVybHkgdGhlICdTdGFyJykgVGhlYXRyZSBvZiBWYXJpZXRpZXMgbm93ICgxOTAwKSBzdGFuZHMgTm8uMVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNTIzLTFcIiwgXCJ4XCI6IC0yOTcuNSwgXCJ5XCI6IDM2OC41LCBcInpvb21YXCI6IDAuMDg4LCBcInpvb21ZXCI6IDAuMDg4LCBcInJvdGF0aW9uXCI6IC0wLjE4NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy01MjMtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkVzc2V4IFN0cmVldCwgVGVtcGxlIEJhciBhbmQgdmljaW5pdHkgdG8gRXNzZXggQnJpZGdlLCBzaG93aW5nIHByb3Bvc2VkIG5ldyBxdWF5IHdhbGwgKFdlbGxpbmd0b24gUXVheSlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQyMy0yXCIsIFwieFwiOiAzNC41LCBcInlcIjogNDc4LjUsIFwiem9vbVhcIjogMC4wNzgsIFwiem9vbVlcIjogMC4wODIsIFwicm90YXRpb25cIjogLTMuMjE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQyMy0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQ3Jvd24gQWxsZXksIENvcGUgU3RyZWV0LCBBcmRpbGzigJlzIFJvdywgVGVtcGxlIEJhciwgQXN0b27igJlzIFF1YXkgYW5kIFdlbGxpbmd0b24gUXVheSBOby4gMiBEYXRlOiAxODIwLTVcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTUzNVwiLCBcInhcIjogLTIwOS41LCBcInlcIjogMzI1LCBcInpvb21YXCI6IDAuMTM0LCBcInpvb21ZXCI6IDAuMTM0LCBcInJvdGF0aW9uXCI6IC0wLjA3LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTUzNS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIldlbGxpbmd0b24gUXVheSAtIGNvbnRpbnVhdGlvbiBvZiBFdXN0YWNlIFN0cmVldCBEYXRlXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy01NjctM1wiLCBcInhcIjogMTk0LjUsIFwieVwiOiA0NTAsIFwiem9vbVhcIjogMC4xMjYsIFwiem9vbVlcIjogMC4xMjYsIFwicm90YXRpb25cIjogMS40OCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy01NjctMy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBhIHBhcmNlbCBvZiBncm91bmQgYm91bmRlZCBieSBHcmFmdG9uIFN0cmVldCwgQ29sbGVnZSBHcmVlbiwgYW5kIENoZXF1ZXIgTGFuZSAtIGxlYXNlZCB0byBNci4gUG9vbGV5ICgzIGNvcGllcykgTm8uIDMgRGF0ZTogMTY4MlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNTk0LTFcIiwgXCJ4XCI6IC01NjQuNSwgXCJ5XCI6IDU3Mi41LCBcInpvb21YXCI6IDAuMDQ0LCBcInpvb21ZXCI6IDAuMDQ0LCBcInJvdGF0aW9uXCI6IDIuNTM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTU5NC0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIE5ldyBIYWxsIE1hcmtldCAtIHBhcnQgb2YgdGhlIENpdHkgRXN0YXRlIERhdGU6IDE3ODBcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTYyNS0xXCIsIFwieFwiOiAtMzIwLjUsIFwieVwiOiA2MDkuNSwgXCJ6b29tWFwiOiAwLjA1OCwgXCJ6b29tWVwiOiAwLjA1OCwgXCJyb3RhdGlvblwiOiAyLjYxLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTYyNS0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBPbGQgVGhvbHNlbGwgZ3JvdW5kLCBmb3JtZXJseSBjYWxsZWQgU291dGhlcuKAmXMgTGFuZSwgYmVsb25naW5nIHRvIHRoZSBDaXR5IG9mIER1YmxpbiAtIGxhaWQgb3V0IGZvciBidWlsZGluZywgTmljaG9sYXMgU3RyZWV0LCBTa2lubmVycyBSb3cgYW5kIFdlcmJ1cmdoIFN0cmVldCBCeSBBLiBSLiBOZXZpbGxlLCBDLiBTLiBEYXRlOiAxODEyXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy02NTRcIiwgXCJ4XCI6IC0zOTcuNSwgXCJ5XCI6IDQwOSwgXCJ6b29tWFwiOiAwLjEyMiwgXCJ6b29tWVwiOiAwLjEyMiwgXCJyb3RhdGlvblwiOiAtMC4xMzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNjU0LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBncm91bmQgcGxvdHMgb2Ygc2V2ZXJhbCBob2xkaW5ncyBiZWxvbmdpbmcgdG8gdGhlIENpdHkgb2YgRHVibGluLCBNYWRhbSBP4oCZSGFyYSwgQ29sb25lbCBCZXJyeSBhbmQgb3RoZXJzLCBvbiBCYWNrIFF1YXkgLSAoRXNzZXggUXVheSkgQmxpbmQgUXVheSAtIEV4Y2hhbmdlIFN0cmVldCwgRXNzZXggQnJpZGdlLCBDcmFuZSBMYW5lIGFuZCBEYW1lIFN0cmVldCwgU3ljYW1vcmUgQWxsZXkgLSBzaG93aW5nIHBvcnRpb24gb2YgdGhlIENpdHkgV2FsbCwgRXNzZXggR2F0ZSwgRGFtZSBHYXRlLCBEYW1lcyBNaWxsIGFuZCBicmFuY2ggb2YgdGhlIFJpdmVyIERvZGRlclwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNzA1XCIsIFwieFwiOiAtMTg3LjUsIFwieVwiOiAzOTIsIFwiem9vbVhcIjogMC4wNCwgXCJ6b29tWVwiOiAwLjA0MiwgXCJyb3RhdGlvblwiOiAtMC4zOCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy03MDUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgRXNzZXggU3RyZWV0IGFuZCB2aWNpbml0eSBEYXRlOiAxODA2XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy03MjVcIiwgXCJ4XCI6IC02NTQsIFwieVwiOiAyMjYsIFwiem9vbVhcIjogMC4wOTQsIFwiem9vbVlcIjogMC4wOTQsIFwicm90YXRpb25cIjogMC4wNywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy03MjUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDaHVyY2ggU3RyZWV0LCBDaGFybGVzIFN0cmVldCwgSW5u4oCZcyBRdWF5IC0gJ1doaXRlIENyb3NzIElubicgLSByZXJlIG9mIEZvdXIgQ291cnRzIC0gVXNoZXJz4oCZIFF1YXksIE1lcmNoYW504oCZcyBRdWF5LCBXb29kIFF1YXkgLSB3aXRoIHJlZmVyZW5jZSBEYXRlOiAxODMzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xOTgtMVwiLCBcInhcIjogLTQ1OS41LCBcInlcIjogNDY5LCBcInpvb21YXCI6IDAuMDI2LCBcInpvb21ZXCI6IDAuMDI2LCBcInJvdGF0aW9uXCI6IC0wLjMwNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xOTgtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBXaGl0ZWhvcnNlIFlhcmQgKFdpbmV0YXZlcm4gU3RyZWV0KSBTdXJ2ZXlvcjogQXJ0aHVyIE5ldmlsbGUgRGF0ZTogMTg0N1wiXG5cdH1cbl1cbiIsImltcG9ydCB7IENhbnZhc1ZpZXcgfSBmcm9tIFwiLi9ndHdvL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IFN0YXRpY0ltYWdlIH0gZnJvbSBcIi4vZ3R3by9zdGF0aWNcIjtcbmltcG9ydCB7IENvbnRhaW5lckxheWVyIH0gZnJvbSBcIi4vZ3R3by9sYXllclwiO1xuaW1wb3J0IHsgQmFzaWNUcmFuc2Zvcm0gfSBmcm9tIFwiLi9ndHdvL3ZpZXdcIjtcbmltcG9ydCB7IFN0YXRpY0dyaWQgfSBmcm9tIFwiLi9ndHdvL2dyaWRcIjtcbmltcG9ydCB7IFZpZXdDb250cm9sbGVyIH0gZnJvbSBcIi4vZ3R3by92aWV3Y29udHJvbGxlclwiO1xuaW1wb3J0IHsgSW1hZ2VDb250cm9sbGVyLCBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIgfSBmcm9tIFwiLi9ndHdvL2ltYWdlY29udHJvbGxlclwiO1xuaW1wb3J0IHsgVGlsZUxheWVyLCBUaWxlU3RydWN0LCB6b29tQnlMZXZlbH0gZnJvbSBcIi4vZ3R3by90aWxlbGF5ZXJcIjtcbmltcG9ydCB7IExheWVyTWFuYWdlciwgQ29udGFpbmVyTGF5ZXJNYW5hZ2VyIH0gZnJvbSBcIi4vZ3R3by9sYXllcm1hbmFnZXJcIjtcbmltcG9ydCB7IExheWVyQ29udHJvbGxlciB9IGZyb20gXCIuL2d0d28vbGF5ZXJjb250cm9sbGVyXCI7XG5cbmltcG9ydCAqIGFzIGZpcmVtYXBzIGZyb20gXCIuL2ltYWdlZ3JvdXBzL2ZpcmVtYXBzLmpzb25cIjtcbmltcG9ydCAqIGFzIGxhbmRtYXJrcyBmcm9tIFwiLi9pbWFnZWdyb3Vwcy9sYW5kbWFya3MuanNvblwiO1xuaW1wb3J0ICogYXMgd3NjIGZyb20gXCIuL2ltYWdlZ3JvdXBzL3dzYy5qc29uXCI7XG5cbmxldCBsYXllclN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDEsIDEsIDApO1xubGV0IGltYWdlTGF5ZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXIobGF5ZXJTdGF0ZSk7XG5cbmxldCBpbWFnZVN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0xNDQwLC0xNDQwLCAwLjIyMiwgMC4yMjIsIDApO1xuXG5sZXQgY291bnR5U3RhdGUgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oLTI2MzEsIC0yMDUxLjUsIDEuNzE2LCAxLjY3NCwgMCk7XG5sZXQgY291bnR5SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoY291bnR5U3RhdGUsIFxuICAgIFwiaW1hZ2VzL0NvdW50eV9vZl90aGVfQ2l0eV9vZl9EdWJsaW5fMTgzN19tYXAucG5nXCIsIDAuNSwgdHJ1ZSk7XG5cbmxldCBiZ1N0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0xMTI2LC0xMDg2LCAxLjU4LCAxLjU1LCAwKTtcblxubGV0IGJnSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoYmdTdGF0ZSwgXCJpbWFnZXMvZm1zcy5qcGVnXCIsIC42LCB0cnVlKTtcblxubGV0IHRtU3RhdGUgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oLTEwMzMuNSwxNDksIDAuNTksIDAuNTksIDApO1xubGV0IHRtSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UodG1TdGF0ZSwgXCJpbWFnZXMvdGhpbmdtb3QucG5nXCIsIC4zLCB0cnVlKTtcblxubGV0IGR1U3RhdGUgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oLTkyOSwtMTA1LjUsIDAuNDY0LCAwLjUwNiwgMCk7XG5sZXQgZHVJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZShkdVN0YXRlLCBcImltYWdlcy9kdWJsaW4xNjEwLmpwZ1wiLCAuMywgZmFsc2UpO1xuXG5sZXQgZ3JpZFRyYW5zZm9ybSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgwLCAwLCAxLCAxLCAwKTtcbmxldCBzdGF0aWNHcmlkID0gbmV3IFN0YXRpY0dyaWQoZ3JpZFRyYW5zZm9ybSwgMCwgZmFsc2UsIDI1NiwgMjU2KTtcblxubGV0IHNlbnRpbmVsU3RydWN0ID0gbmV3IFRpbGVTdHJ1Y3QoXCJxdGlsZS9kdWJsaW4vXCIsIFwiLnBuZ1wiLCBcImltYWdlcy9xdGlsZS9kdWJsaW4vXCIpO1xuXG5sZXQgc2VudGluZWxUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgMiwgMiwgMCk7XG5sZXQgc2VudGluZWxMYXllciA9IG5ldyBUaWxlTGF5ZXIoc2VudGluZWxUcmFuc2Zvcm0sIHNlbnRpbmVsU3RydWN0LCB0cnVlLCAxNTgxNCwgMTA2MjEsIDE1KTtcbi8vbGV0IHNlbnRpbmVsTGF5ZXIgPSBuZXcgVGlsZUxheWVyKEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0sIHNlbnRpbmVsU3RydWN0LCAzMTYyOCwgMjEyNDIsIDE2KTtcblxuaW1hZ2VMYXllci5zZXQoXCJjb3VudHlcIiwgY291bnR5SW1hZ2UpO1xuaW1hZ2VMYXllci5zZXQoXCJiYWNrZ3JvdW5kXCIsIGJnSW1hZ2UpO1xuXG5sZXQgbGF5ZXJNYW5hZ2VyID0gbmV3IExheWVyTWFuYWdlcigpO1xuXG5sZXQgZmlyZW1hcExheWVyID0gbGF5ZXJNYW5hZ2VyLmFkZExheWVyKGZpcmVtYXBzLCBcImZpcmVtYXBzXCIpO1xubGV0IGxhbmRtYXJrc0xheWVyID0gbGF5ZXJNYW5hZ2VyLmFkZExheWVyKGxhbmRtYXJrcywgXCJsYW5kbWFya3NcIik7XG5sZXQgd3NjTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkTGF5ZXIod3NjLCBcIndzY1wiKTtcblxubGV0IGVkaXQgPSB3c2NMYXllci5nZXQoXCJ3c2MtMTk4LTFcIik7XG5cbmxldCBjb250YWluZXJMYXllck1hbmFnZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXJNYW5hZ2VyKHdzY0xheWVyKTtcbmNvbnRhaW5lckxheWVyTWFuYWdlci5zZXRTZWxlY3RlZChcIndzYy0xOTgtMVwiKTtcblxuaW1hZ2VMYXllci5zZXQoXCJ3c2NcIiwgd3NjTGF5ZXIpO1xuaW1hZ2VMYXllci5zZXQoXCJmaXJlbWFwc1wiLCBmaXJlbWFwTGF5ZXIpO1xuXG5pbWFnZUxheWVyLnNldChcImR1YmxpbjE2MTBcIiwgZHVJbWFnZSk7XG5pbWFnZUxheWVyLnNldChcInRoaW5nbW90XCIsIHRtSW1hZ2UpO1xuaW1hZ2VMYXllci5zZXQoXCJsYW5kbWFya3NcIiwgbGFuZG1hcmtzTGF5ZXIpO1xuXG53c2NMYXllci5zZXRUb3AoXCJ3c2MtNTM1XCIpO1xuXG5mdW5jdGlvbiBzaG93TWFwKGRpdk5hbWU6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpdk5hbWUpO1xuICAgIGxldCBjYW52YXNUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oLTUxMiwgLTUxMiwgMC41LCAwLjUsIDApO1xuICAgIGxldCBjYW52YXNWaWV3ID0gbmV3IENhbnZhc1ZpZXcoY2FudmFzVHJhbnNmb3JtLCBjYW52YXMuY2xpZW50V2lkdGgsIGNhbnZhcy5jbGllbnRIZWlnaHQsIGNhbnZhcyk7XG5cbiAgICBjYW52YXNWaWV3LmxheWVycy5wdXNoKHNlbnRpbmVsTGF5ZXIpO1xuICAgIGNhbnZhc1ZpZXcubGF5ZXJzLnB1c2goaW1hZ2VMYXllcik7XG4gICAgY2FudmFzVmlldy5sYXllcnMucHVzaChzdGF0aWNHcmlkKTtcblxuICAgIGxldCB0aWxlQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgc2VudGluZWxMYXllciwgXCJ2XCIpO1xuICAgIGxldCBiYXNlQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgYmdJbWFnZSwgXCJCXCIpO1xuICAgIGxldCBjb3VudHlDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBjb3VudHlJbWFnZSwgXCJWXCIpO1xuICAgIGxldCBmaXJlbWFwQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgZmlyZW1hcExheWVyLCBcImJcIik7XG4gICAgbGV0IHdzY0NvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHdzY0xheWVyLCBcIm5cIik7XG4gICAgbGV0IGxhbmRtYXJrQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgbGFuZG1hcmtzTGF5ZXIsIFwibVwiKTtcbiAgICBsZXQgdG1Db250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCB0bUltYWdlLCBcIk5cIik7XG4gICAgbGV0IGR1Q29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgZHVJbWFnZSwgXCJNXCIpO1xuICAgIGxldCBncmlkQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgc3RhdGljR3JpZCwgXCJnXCIpO1xuXG4gICAgbGV0IGNvbnRyb2xsZXIgPSBuZXcgVmlld0NvbnRyb2xsZXIoY2FudmFzVmlldywgY2FudmFzLCBjYW52YXNWaWV3KTtcblxuICAgIGxldCBpbWFnZUNvbnRyb2xsZXIgPSBuZXcgSW1hZ2VDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGVkaXQpO1xuXG4gICAgbGV0IGxheWVyQ29udHJvbGxlciA9IG5ldyBMYXllckNvbnRyb2xsZXIoY2FudmFzVmlldywgY29udGFpbmVyTGF5ZXJNYW5hZ2VyKTtcblxuICAgIGRyYXdNYXAoY2FudmFzVmlldyk7XG5cbn1cblxuZnVuY3Rpb24gZHJhd01hcChjYW52YXNWaWV3OiBDYW52YXNWaWV3KXtcbiAgICBpZiAoIWNhbnZhc1ZpZXcuZHJhdygpICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkluIHRpbWVvdXRcIik7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgZHJhd01hcChjYW52YXNWaWV3KX0sIDUwMCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzaG93KCl7XG5cdHNob3dNYXAoXCJjYW52YXNcIiwgXCJUeXBlU2NyaXB0XCIpO1xufVxuXG5pZiAoXG4gICAgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiIHx8XG4gICAgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09IFwibG9hZGluZ1wiICYmICFkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZG9TY3JvbGwpXG4pIHtcblx0c2hvdygpO1xufSBlbHNlIHtcblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgc2hvdyk7XG59Il19
