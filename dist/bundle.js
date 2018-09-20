(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return "Point2D(" + this.x + ", " + this.y + ")";
    }
}
Point2D.zero = new Point2D(0, 0);
Point2D.one = new Point2D(1, 1);
exports.Point2D = Point2D;
function rotate(point, angle, about = new Point2D(0, 0)) {
    let s = Math.sin(angle);
    let c = Math.cos(angle);
    let px = point.x - about.x;
    let py = point.y - about.y;
    let xnew = px * c - py * s;
    let ynew = px * s + py * c;
    return new Point2D(xnew + about.x, ynew + about.y);
}
exports.rotate = rotate;
class Dimension {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}
exports.Dimension = Dimension;

},{}],2:[function(require,module,exports){
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

},{"./view":10}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const layer_1 = require("./layer");
const point2d_1 = require("../geom/point2d");
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
    getDimension() {
        return new point2d_1.Dimension(0, 0, 0, 0);
    }
}
exports.StaticGrid = StaticGrid;

},{"../geom/point2d":1,"./layer":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const view_1 = require("./view");
const point2d_1 = require("../geom/point2d");
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
    getDimension() {
        var xMin = this.x;
        var yMin = this.y;
        var xMax = this.x;
        var yMax = this.y;
        for (let layer of this.displayLayers) {
            let layerDimension = layer.getDimension();
            xMin = Math.min(xMin, this.x + layerDimension.x);
            yMin = Math.min(yMin, this.y + layerDimension.y);
            xMax = Math.max(xMax, this.x + layerDimension.x + this.zoomX * layerDimension.w);
            yMax = Math.max(yMax, this.y + layerDimension.y + this.zoomY * layerDimension.h);
        }
        return new point2d_1.Dimension(xMin, yMin, xMax - xMin, yMax - yMin);
    }
}
exports.ContainerLayer = ContainerLayer;

},{"../geom/point2d":1,"./view":10}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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
    constructor(containerLayer) {
        this.containerLayer = containerLayer;
    }
    setLayerContainer(containerLayer) {
        this.containerLayer = containerLayer;
    }
    setSelected(name) {
        this.selected = name;
        let layer = this.containerLayer.get(this.selected);
        let layerRect = new static_1.RectLayer(new view_1.BasicTransform(0, 0, 1, 1, 0), layer.getDimension(), 1, true);
        this.containerLayer.set("outline", layerRect);
    }
    toggleVisibility(selected = true) {
        let toggleGroup = [];
        if (selected) {
            if (this.selected != "") {
                toggleGroup.push(this.containerLayer.get(this.selected));
            }
        }
        else {
            for (let pair of this.containerLayer.layerMap) {
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

},{"./layer":5,"./static":8,"./view":10}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const view_1 = require("./view");
const layer_1 = require("./layer");
const point2d_1 = require("../geom/point2d");
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
    getDimension() {
        if (this.img.complete) {
            var width = this.img.width * this.zoomX;
            var height = this.img.height * this.zoomY;
            //console.log("img width " + width + " height " + height);
            let p1 = point2d_1.rotate(new point2d_1.Point2D(width, 0), this.rotation);
            //console.log("p1 " + p1);
            let p2 = point2d_1.rotate(new point2d_1.Point2D(width, height), this.rotation);
            //console.log("p2 " + p2);
            let p3 = point2d_1.rotate(new point2d_1.Point2D(0, height), this.rotation);
            //console.log("p3 " + p3);
            let minX = Math.min(0, p1.x, p2.x, p3.x);
            let minY = Math.min(0, p1.y, p2.y, p3.y);
            let maxX = Math.max(0, p1.x, p2.x, p3.x);
            let maxY = Math.max(0, p1.y, p2.y, p3.y);
            //console.log("xy " + this.x, this.y);
            console.log("minX " + minX + " minY " + minY + " maxX " + maxX + "maxY " + maxY);
            return new point2d_1.Dimension(this.x + minX * this.zoomX, this.y + minY, maxX - minX, maxY - minY);
        }
        return new point2d_1.Dimension(this.x, this.y, 0, 0);
    }
}
exports.StaticImage = StaticImage;
class RectLayer extends layer_1.DrawLayer {
    constructor(localTransform, dimension, opacity, visible) {
        super(localTransform, opacity, visible);
        this.dimension = dimension;
    }
    draw(ctx, parentTransform, view) {
        let x = (this.dimension.x - view.x) * view.zoomX;
        let y = (this.dimension.y - view.y) * view.zoomY;
        //console.log("dimension " + this.dimension.x);
        //console.log("outline: " + x + " view: " + view.x + 
        //	" parent " + parentTransform.x + " w " + this.dimension.w);
        ctx.strokeStyle = "red";
        ctx.strokeRect(x, y, this.dimension.w * view.zoomX, this.dimension.h * view.zoomY);
        return true;
    }
    getDimension() {
        return this.dimension;
    }
}
exports.RectLayer = RectLayer;

},{"../geom/point2d":1,"./layer":5,"./view":10}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const layer_1 = require("./layer");
const view_1 = require("./view");
const point2d_1 = require("../geom/point2d");
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
    getDimension() {
        return new point2d_1.Dimension(0, 0, 0, 0);
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

},{"../geom/point2d":1,"./layer":5,"./view":10}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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
	"name": "16-2", "x": -92, "y": 336.5, "zoomX": 0.217, "zoomY": 0.21, "rotation": -0.1, 
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




},{}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
module.exports=[
	{
		"name": "wsc-018", "x": -194, "y": -395.5, "zoomX": 0.12, "zoomY": 0.12, "rotation": -0.63, 
		"src": "images/wsc/wsc-018.png", "visible": true, "opacity": 0.5,
		"description": "Survey of Barley fields etc. (Dorset Street). Plan of opening a street from Rutland Square to Dorset Street - (Palace Row and Gardiners Row) - Thomas Sherrard Date: 1789"
	},
	{
		"name": "wsc-025", "x": -1010, "y": 105, "zoomX": 0.12, "zoomY": 0.12, "rotation": 0.16, 
		"src": "images/wsc/wsc-025.png", "visible": true, "opacity": 0.5,
		"description": "Blackhall Place - New Street to the Quay"
	},
	{
		"name": "wsc-057", "x": -224, "y": 330.5, "zoomX": 0.084, "zoomY": 0.084, "rotation": 2.865, 
		"src": "images/wsc/wsc-057.png", "visible": true, "opacity": 0.5,
		"description": "Plan of streets about Mary’s Abbey and Boot Lane - (Old Bank) Date: 1811"
	},
	{
		"name": "wsc-063", "x": -88.5, "y": 26.5, "zoomX": 0.3, "zoomY": 0.3, "rotation": -2.145, 
		"src": "images/wsc/wsc-063.png", "visible": true, "opacity": 0.5,
		"description": "Elevation of the west front and plan of Mountjoy Square laid out on the rising ground, near George’s Church - the estate of the Right Hon. Luke Gardiner, and now (1787), to be let for building - Lord Mountjoy’s plan. Date: 1787"
	},
	{
		"name": "wsc-087-2", "x": -172.5, "y": 1419, "zoomX": 0.086, "zoomY": 0.086, "rotation": -1.695, 
		"src": "images/wsc/wsc-087-2.png", "visible": true, "opacity": 0.5,
		"description": "Camden Street Upper and Charlotte Street Date: 1841"
	},
	{
		"name": "wsc-090", "x": -261, "y": 505, "zoomX": 0.074, "zoomY": 0.066, "rotation": -0.23, 
		"src": "images/wsc/wsc-090.png", "visible": true, "opacity": 0.5,
		"description": "Castle Yard, Castle Street, Dame Street, Parliament Street and vicinity Date: 1764"
	},
	{
		"name": "wsc-100-2", "x": -528, "y": 464, "zoomX": 0.078, "zoomY": 0.078, "rotation": -0.27, 
		"src": "images/wsc/wsc-100-2.png", "visible": true, "opacity": 0.5,
		"description": "Map of premises to be valued by Jury; Cock Hill, Michael’s Lane, Winetavern Street, John’s Lane, Christchurch, Patrick Street and Patrick’s Close Date: 1813"
	},
	{
		"name": "wsc-103", "x": 99.5, "y": 566, "zoomX": 0.062, "zoomY": 0.06, "rotation": -3.155, 
		"src": "images/wsc/wsc-103.png", "visible": true, "opacity": 0.5,
		"description": "Map of South Side of College Green and vicinity Date: 1808"
	}
]

},{}],15:[function(require,module,exports){
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
const wsc = require("./imagegroups/wsct.json");
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
let edit = wscLayer.get("wsc-018");
let containerLayerManager = new layermanager_1.ContainerLayerManager(wscLayer);
containerLayerManager.setSelected("wsc-018");
imageLayer.set("wsc", wscLayer);
//imageLayer.set("firemaps", firemapLayer);
//imageLayer.set("dublin1610", duImage);
//imageLayer.set("thingmot", tmImage);
//imageLayer.set("landmarks", landmarksLayer);
wscLayer.setTop("wsc-103");
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

},{"./gtwo/canvasview":2,"./gtwo/grid":3,"./gtwo/imagecontroller":4,"./gtwo/layer":5,"./gtwo/layercontroller":6,"./gtwo/layermanager":7,"./gtwo/static":8,"./gtwo/tilelayer":9,"./gtwo/view":10,"./gtwo/viewcontroller":11,"./imagegroups/firemaps.json":12,"./imagegroups/landmarks.json":13,"./imagegroups/wsct.json":14}]},{},[15])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2d0d28vY2FudmFzdmlldy50cyIsInNyYy9ndHdvL2dyaWQudHMiLCJzcmMvZ3R3by9pbWFnZWNvbnRyb2xsZXIudHMiLCJzcmMvZ3R3by9sYXllci50cyIsInNyYy9ndHdvL2xheWVyY29udHJvbGxlci50cyIsInNyYy9ndHdvL2xheWVybWFuYWdlci50cyIsInNyYy9ndHdvL3N0YXRpYy50cyIsInNyYy9ndHdvL3RpbGVsYXllci50cyIsInNyYy9ndHdvL3ZpZXcudHMiLCJzcmMvZ3R3by92aWV3Y29udHJvbGxlci50cyIsInNyYy9pbWFnZWdyb3Vwcy9maXJlbWFwcy5qc29uIiwic3JjL2ltYWdlZ3JvdXBzL2xhbmRtYXJrcy5qc29uIiwic3JjL2ltYWdlZ3JvdXBzL3dzY3QuanNvbiIsInNyYy9zaW1wbGVXb3JsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQ0EsTUFBYSxPQUFPO0lBT2hCLFlBQVksQ0FBUyxFQUFFLENBQVM7UUFDNUIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBRUUsUUFBUTtRQUNKLE9BQU8sVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQ3JELENBQUM7O0FBYmUsWUFBSSxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN6QixXQUFHLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRjVDLDBCQWdCQztBQUVELFNBQWdCLE1BQU0sQ0FBQyxLQUFjLEVBQUUsS0FBYSxFQUFFLFFBQWlCLElBQUksT0FBTyxDQUFDLENBQUMsRUFBQyxDQUFD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R0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBRTFDLElBQUksVUFBVSxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzVDLElBQUksUUFBUSxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBRTVDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0MsSUFBSSxLQUFLLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUMvQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUQsSUFBSSxNQUFNLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUVoRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzlDLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDL0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzlELElBQUksT0FBTyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUU7UUFFbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FB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Q0FBQyxHQUFHLENBQUMsUUFBUSxFQUFDO1lBQ3JCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDeEMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUUxQywwREFBMEQ7WUFFMUQsSUFBSSxFQUFFLEdBQUcsZ0JBQU0sQ0FBQyxJQUFJLGlCQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN0RCwwQkFBMEI7WUFDMUIsSUFBSSxFQUFFLEdBQUcsZ0JBQU0sQ0FBQyxJQUFJLGlCQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzRCwwQkFBMEI7WUFDMUIsSUFBSSxFQUFFLEdBQUcsZ0JBQU0sQ0FBQyxJQUFJLGlCQUFPLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2RCwwQkFBMEI7WUFFMUIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV6QyxzQ0FBc0M7WUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLFFBQVEsR0FBRyxJQUFJLEdBQUcsUUFBUSxHQUFHLElBQUksR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFFakYsT0FBTyxJQUFJLG1CQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxJQUFJLEdBQUMsSUFBSSxFQUFFLElBQUksR0FBQyxJQUFJLENBQUMsQ0FBQztTQUN0RjtRQUVELE9BQU8sSUFBSSxtQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDNUMsQ0FBQztDQUNEO0FBdEVELGtDQXNFQztBQUVELE1BQWEsU0FBVSxTQUFRLGlCQUFTO0lBRXZDLFlBQVksY0FBeUIsRUFDM0IsU0FBb0IsRUFDN0IsT0FBZSxFQUNmLE9BQWdCO1FBRWhCLEtBQUssQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBSi9CLGNBQVMsR0FBVCxTQUFTLENBQVc7SUFLOUIsQ0FBQztJQUVELElBQUksQ0FBQyxHQUE2QixFQUFFLGVBQTBCLEVBQUUsSUFBZTtRQUU5RSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2pELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFFakQsK0NBQStDO1FBRS9DLHFEQUFxRDtRQUNyRCw4REFBOEQ7UUFDOUQsR0FBRyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDeEIsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRW5GLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELFlBQVk7UUFDWCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDdkIsQ0FBQztDQUVEO0FBN0JELDhCQTZCQzs7Ozs7QUMxR0QsbUNBQW9DO0FBQ3BDLGlDQUFvRjtBQUNwRiw2Q0FBNEM7QUFFNUMsTUFBYSxVQUFVO0lBRXRCLFlBQ1EsTUFBYyxFQUNkLE1BQWMsRUFDZCxhQUFxQjtRQUZyQixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNkLGtCQUFhLEdBQWIsYUFBYSxDQUFRO0lBQUUsQ0FBQztDQUNoQztBQU5ELGdDQU1DO0FBRUQsU0FBZ0IsV0FBVyxDQUFDLFNBQWlCO0lBQzVDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDL0IsQ0FBQztBQUZELGtDQUVDO0FBRUQsTUFBYSxTQUFVLFNBQVEsaUJBQVM7SUFJdkMsWUFDQyxjQUF5QixFQUNoQixVQUFzQixFQUMvQixPQUFnQixFQUNULFVBQWtCLENBQUMsRUFDbkIsVUFBa0IsQ0FBQyxFQUNuQixPQUFlLENBQUMsRUFDZCxZQUFvQixHQUFHLEVBQ3ZCLGFBQXFCLEdBQUcsRUFDakMsVUFBa0IsQ0FBQztRQUVuQixLQUFLLENBQUMsY0FBYyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQVQvQixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBRXhCLFlBQU8sR0FBUCxPQUFPLENBQVk7UUFDbkIsWUFBTyxHQUFQLE9BQU8sQ0FBWTtRQUNuQixTQUFJLEdBQUosSUFBSSxDQUFZO1FBQ2QsY0FBUyxHQUFULFNBQVMsQ0FBYztRQUN2QixlQUFVLEdBQVYsVUFBVSxDQUFjO1FBS2pDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0lBRUQsSUFBSSxDQUFDLEdBQTZCLEVBQUUsZUFBMEIsRUFBRSxJQUFtQjtRQUVsRixJQUFJLFlBQVksR0FBRyx1QkFBZ0IsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFFM0QsSUFBSSxTQUFTLEdBQVcsSUFBSSxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFBO1FBQzNELElBQUksVUFBVSxHQUFXLElBQUksQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQztRQUU5RCw2Q0FBNkM7UUFFN0MsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2hDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUVoQyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDeEMsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBRTFDLElBQUksVUFBVSxHQUFHLFNBQVMsR0FBRyxTQUFTLENBQUMsQ0FBQyxNQUFNO1FBQzlDLElBQUksUUFBUSxHQUFHLFVBQVUsR0FBRyxVQUFVLENBQUMsQ0FBQyxNQUFNO1FBRTlDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBQyxTQUFTLENBQUMsQ0FBQztRQUN4QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQztRQUV2RCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUM7UUFDekMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUM7UUFFekQseUVBQXlFO1FBQ3pFLDREQUE0RDtRQUU1RCxJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUM7UUFFM0IsSUFBSSxTQUFTLEdBQUcsWUFBWSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2hELElBQUksU0FBUyxHQUFHLFlBQVksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUVoRCwwREFBMEQ7UUFFMUQsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFaEMsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBQztZQUM5QixJQUFJLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFDN0QsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBQztnQkFDOUIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRSxZQUFZLENBQUMsS0FBSyxDQUFDO2dCQUM3RCx1RUFBdUU7Z0JBRXZFLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM1QixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUc7b0JBQzVELENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHO29CQUN4QixDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7Z0JBRTdDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ2xDLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUM5QyxlQUFlLEdBQUcsZUFBZSxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3pEO3FCQUNJO29CQUNKLElBQUksU0FBUyxHQUFHLElBQUksU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBRTdDLGVBQWUsR0FBRyxlQUFlLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFFekQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2lCQUN6QztnQkFFRCxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDOUI7U0FDRDtRQUVELEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUM7UUFFeEMsK0NBQStDO1FBQy9DLE9BQU8sZUFBZSxDQUFDO0lBQ3hCLENBQUM7SUFFRCxZQUFZO1FBQ1gsT0FBTyxJQUFJLG1CQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbEMsQ0FBQztDQUNEO0FBNUZELDhCQTRGQztBQUVELE1BQWEsV0FBVztJQUl2QjtRQUNDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUM7SUFDN0MsQ0FBQztJQUVELEdBQUcsQ0FBQyxPQUFlO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVELEdBQUcsQ0FBQyxPQUFlO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVELEdBQUcsQ0FBQyxPQUFlLEVBQUUsSUFBZTtRQUNuQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDakMsQ0FBQztDQUVEO0FBcEJELGtDQW9CQztBQUVELE1BQWEsU0FBUztJQUtyQixZQUFxQixNQUFjLEVBQVcsTUFBYyxFQUFFLFFBQWdCO1FBQXpELFdBQU0sR0FBTixNQUFNLENBQVE7UUFBVyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQzNELElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUM7UUFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsVUFBUyxjQUFtQjtZQUM5QyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDaEMsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQUFBLENBQUM7SUFFTSxTQUFTLENBQUMsR0FBNkI7UUFDOUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQsSUFBSSxDQUFDLEdBQTZCO1FBQ2pDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFHO1lBQzdDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEIsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUFBLENBQUM7Q0FFRjtBQXpCRCw4QkF5QkM7Ozs7O0FDbEpELE1BQWEsY0FBYztJQUkxQixZQUFtQixDQUFTLEVBQVMsQ0FBUyxFQUN0QyxLQUFhLEVBQVMsS0FBYSxFQUNuQyxRQUFnQjtRQUZMLE1BQUMsR0FBRCxDQUFDLENBQVE7UUFBUyxNQUFDLEdBQUQsQ0FBQyxDQUFRO1FBQ3RDLFVBQUssR0FBTCxLQUFLLENBQVE7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQ25DLGFBQVEsR0FBUixRQUFRLENBQVE7SUFBRSxDQUFDOztBQUpSLDRCQUFhLEdBQUcsSUFBSSxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRnRFLHdDQU9DO0FBRUQsU0FBZ0IsZ0JBQWdCLENBQUMsS0FBZ0IsRUFBRSxTQUFvQjtJQUN0RSxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7SUFDMUMsMERBQTBEO0lBQzFELElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztJQUMxQyxxRkFBcUY7SUFDckYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ2xELElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUNsRCx1R0FBdUc7SUFDdkcsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDO0lBQ25ELE9BQU8sSUFBSSxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFWRCw0Q0FVQztBQUVELFNBQWdCLEtBQUssQ0FBQyxTQUFvQjtJQUN6QyxPQUFPLElBQUksY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsRUFDakQsU0FBUyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN4RCxDQUFDO0FBSEQsc0JBR0M7QUFFRCxTQUFnQixlQUFlLENBQUMsVUFBcUI7SUFDcEQsT0FBTyxJQUFJLGNBQWMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUNyRCxDQUFDLEdBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNoRSxDQUFDO0FBSEQsMENBR0M7QUFPRCxNQUFhLGtCQUFtQixTQUFRLGNBQWM7SUFFckQsWUFBWSxDQUFTLEVBQUUsQ0FBUyxFQUN0QixLQUFhLEVBQVcsTUFBYyxFQUMvQyxLQUFhLEVBQUUsS0FBYSxFQUN6QixRQUFnQjtRQUVuQixLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBSjNCLFVBQUssR0FBTCxLQUFLLENBQVE7UUFBVyxXQUFNLEdBQU4sTUFBTSxDQUFRO0lBS2hELENBQUM7Q0FFRDtBQVZELGdEQVVDOzs7OztBQ3JERCxNQUFzQixlQUFlO0lBRWpDLGFBQWEsQ0FBQyxLQUFpQixFQUFFLE1BQW1CO1FBQ2hELElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVO2NBQzFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDO1FBQy9DLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTO2NBQ3pDLFFBQVEsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDO1FBRTlDLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNmLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztRQUVmLElBQUksTUFBTSxDQUFDLFlBQVksRUFBQztZQUNwQixHQUFHO2dCQUNDLE1BQU0sSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDO2dCQUM1QixNQUFNLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQzthQUM5QixRQUFRLE1BQU0sR0FBZ0IsTUFBTSxDQUFDLFlBQVksRUFBRTtTQUN2RDtRQUVELE9BQU8sQ0FBQyxNQUFNLEdBQUcsTUFBTSxFQUFFLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQztJQUM5QyxDQUFDO0NBRUo7QUFyQkQsMENBcUJDO0FBRUQsTUFBYSxjQUFlLFNBQVEsZUFBZTtJQVFsRCxZQUFZLGFBQTRCLEVBQ3hCLFdBQXdCLEVBQVcsVUFBc0I7UUFFckUsS0FBSyxFQUFFLENBQUM7UUFGSSxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUFXLGVBQVUsR0FBVixVQUFVLENBQVk7UUFOekUsU0FBSSxHQUFXLENBQUMsQ0FBQztRQVNiLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFPLEVBQUUsRUFBRSxDQUNyRCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQWUsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQy9DLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFPLEVBQUUsRUFBRSxDQUNyRCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQWUsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQzVDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFPLEVBQUUsRUFBRSxDQUNoRCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQWUsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQ2xELFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFPLEVBQUUsRUFBRSxDQUNuRCxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQ3pCLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFPLEVBQUUsRUFBRSxDQUN2RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQWUsRUFBRSxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM5QyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBUSxFQUFFLEVBQUUsQ0FDL0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFlLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQsT0FBTyxDQUFDLEtBQWlCLEVBQUUsYUFBNEIsRUFBRSxNQUFjO1FBQ3RFLFFBQU8sS0FBSyxDQUFDLElBQUksRUFBQztZQUNqQixLQUFLLFVBQVU7Z0JBQ0wsSUFBSyxLQUFLLENBQUMsT0FBTyxFQUFFO29CQUNoQixNQUFNLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQztpQkFDdkI7Z0JBRUQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUV0RCxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUVsRCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzNCLFFBQVE7U0FDWDtJQUNMLENBQUM7SUFFRCxPQUFPLENBQUMsS0FBaUIsRUFBRSxhQUE0QjtRQUV0RCxRQUFPLEtBQUssQ0FBQyxJQUFJLEVBQUM7WUFDakIsS0FBSyxXQUFXO2dCQUNmLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO2dCQUNuQixNQUFNO1lBQ1AsS0FBSyxTQUFTO2dCQUNiLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO2dCQUNwQixNQUFNO1lBQ1A7Z0JBQ0MsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFDO29CQUNILElBQUksTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDO29CQUNoRixJQUFJLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQztvQkFFaEYsYUFBYSxDQUFDLENBQUMsR0FBRyxhQUFhLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztvQkFDM0MsYUFBYSxDQUFDLENBQUMsR0FBRyxhQUFhLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztvQkFFM0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQkFDbkM7Z0JBRUwsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO2dCQUMvQixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7U0FDNUI7SUFDRixDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQWlCLEVBQUUsYUFBNEI7UUFFakQsMERBQTBEO1FBRTFELElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDO1FBQzVELElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDO1FBRTVELElBQUssS0FBSyxDQUFDLE9BQU8sRUFBRTtZQUNoQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFdEQsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1lBQ2QsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFDO2dCQUNYLEVBQUUsR0FBRyxJQUFJLENBQUM7YUFDYjtZQUVELElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDakQ7YUFDSTtZQUNELElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztZQUNoRCxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7U0FDbkQ7UUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzNCLENBQUM7Q0FFSjtBQTVGRCx3Q0E0RkM7OztBQ3ZIRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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O0NBQ1A7S0FBTTtJQUNOLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztDQUNwRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlxuZXhwb3J0IGNsYXNzIFBvaW50MkQge1xuICAgIHN0YXRpYyByZWFkb25seSB6ZXJvID0gbmV3IFBvaW50MkQoMCwgMCk7XG4gICAgc3RhdGljIHJlYWRvbmx5IG9uZSA9IG5ldyBQb2ludDJEKDEsIDEpO1xuXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xuICAgIHJlYWRvbmx5IHk6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG5cdH1cblxuICAgIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcIlBvaW50MkQoXCIgKyB0aGlzLnggKyBcIiwgXCIgKyB0aGlzLnkgKyBcIilcIjtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZShwb2ludDogUG9pbnQyRCwgYW5nbGU6IG51bWJlciwgYWJvdXQ6IFBvaW50MkQgPSBuZXcgUG9pbnQyRCgwLDApKTogUG9pbnQyRCB7XG4gICAgbGV0IHMgPSBNYXRoLnNpbihhbmdsZSk7XG4gICAgbGV0IGMgPSBNYXRoLmNvcyhhbmdsZSk7XG5cbiAgICBsZXQgcHggPSBwb2ludC54IC0gYWJvdXQueDtcbiAgICBsZXQgcHkgPSBwb2ludC55IC0gYWJvdXQueTtcblxuICAgIGxldCB4bmV3ID0gcHggKiBjIC0gcHkgKiBzO1xuICAgIGxldCB5bmV3ID0gcHggKiBzICsgcHkgKiBjO1xuXG4gICAgcmV0dXJuIG5ldyBQb2ludDJEKHhuZXcgKyBhYm91dC54LCB5bmV3ICsgYWJvdXQueSk7XG59XG5cbmV4cG9ydCBjbGFzcyBEaW1lbnNpb24ge1xuXG4gICAgY29uc3RydWN0b3IocHVibGljIHg6IG51bWJlciwgcHVibGljIHk6IG51bWJlciwgcHVibGljIHc6IG51bWJlciwgcHVibGljIGg6IG51bWJlcil7fVxuXG59IiwiaW1wb3J0IHsgQ2FudmFzTGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgXG5cdGludmVydFRyYW5zZm9ybSwgXG5cdFZpZXdUcmFuc2Zvcm0sIFxuXHRCYXNpY1ZpZXdUcmFuc2Zvcm0sIFxuXHRUcmFuc2Zvcm0sIFxuXHRCYXNpY1RyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcblxuZXhwb3J0IGludGVyZmFjZSBEaXNwbGF5RWxlbWVudCBleHRlbmRzIFRyYW5zZm9ybSB7XG5cdGlzVmlzaWJsZSgpOiBib29sZWFuO1xuXHRzZXRWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4pOiB2b2lkO1xuXHRnZXRPcGFjaXR5KCk6IG51bWJlcjtcblx0c2V0T3BhY2l0eShvcGFjaXR5OiBudW1iZXIpOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgQ2FudmFzVmlldyBleHRlbmRzIEJhc2ljVmlld1RyYW5zZm9ybSB7XG5cblx0bGF5ZXJzOiBBcnJheTxDYW52YXNMYXllcj4gPSBbXTtcblx0Y3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0bG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdFx0d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIFxuXHRcdHJlYWRvbmx5IGNhbnZhc0VsZW1lbnQ6IEhUTUxDYW52YXNFbGVtZW50KXtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLngsIGxvY2FsVHJhbnNmb3JtLnksIHdpZHRoLCBoZWlnaHQsIFxuXHRcdFx0bG9jYWxUcmFuc2Zvcm0uem9vbVgsIGxvY2FsVHJhbnNmb3JtLnpvb21ZLCBcblx0XHRcdGxvY2FsVHJhbnNmb3JtLnJvdGF0aW9uKTtcblxuXHRcdHRoaXMuaW5pdENhbnZhcygpO1xuXG5cdFx0dGhpcy5jdHggPSBjYW52YXNFbGVtZW50LmdldENvbnRleHQoXCIyZFwiKTtcblx0fVxuXG5cdHpvb21BYm91dCh4OiBudW1iZXIsIHk6IG51bWJlciwgem9vbUJ5OiBudW1iZXIpe1xuXG4gICAgICAgIHRoaXMuem9vbVggPSB0aGlzLnpvb21YICogem9vbUJ5O1xuICAgICAgICB0aGlzLnpvb21ZID0gdGhpcy56b29tWSAqIHpvb21CeTtcblxuICAgICAgICBsZXQgcmVsYXRpdmVYID0geCAqIHpvb21CeSAtIHg7XG4gICAgICAgIGxldCByZWxhdGl2ZVkgPSB5ICogem9vbUJ5IC0geTtcblxuICAgICAgICBsZXQgd29ybGRYID0gcmVsYXRpdmVYIC8gdGhpcy56b29tWDtcbiAgICAgICAgbGV0IHdvcmxkWSA9IHJlbGF0aXZlWSAvIHRoaXMuem9vbVk7XG5cbiAgICAgICAgdGhpcy54ID0gdGhpcy54ICsgd29ybGRYO1xuICAgICAgICB0aGlzLnkgPSB0aGlzLnkgKyB3b3JsZFk7XG5cblx0fVxuXG5cdGRyYXcoKTogYm9vbGVhbiB7XG5cdFx0bGV0IHRyYW5zZm9ybSA9IGludmVydFRyYW5zZm9ybSh0aGlzKTtcblxuXHRcdHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwiZ3JleVwiO1xuXHRcdHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuXHRcdHZhciBkcmF3aW5nQ29tcGxldGUgPSB0cnVlO1xuXG5cdFx0Zm9yIChsZXQgbGF5ZXIgb2YgdGhpcy5sYXllcnMpe1xuXHRcdFx0aWYgKGxheWVyLmlzVmlzaWJsZSgpKXtcblx0XHRcdFx0ZHJhd2luZ0NvbXBsZXRlID0gZHJhd2luZ0NvbXBsZXRlICYmIGxheWVyLmRyYXcodGhpcy5jdHgsIEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0sIHRoaXMpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fVxuXG5cdFx0dGhpcy5kcmF3Q2VudHJlKHRoaXMuY3R4KTtcblxuXHRcdHJldHVybiBkcmF3aW5nQ29tcGxldGU7XG5cdH1cblxuXHRkcmF3Q2VudHJlKGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCl7XG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIGNvbnRleHQuZ2xvYmFsQWxwaGEgPSAwLjM7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLndpZHRoLzIsIDYvMTYqdGhpcy5oZWlnaHQpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyh0aGlzLndpZHRoLzIsIDEwLzE2KnRoaXMuaGVpZ2h0KTtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8oNy8xNip0aGlzLndpZHRoLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oOS8xNip0aGlzLndpZHRoLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcbiAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XG4gICAgfVxuXG5cdHByaXZhdGUgaW5pdENhbnZhcygpe1xuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLmNhbnZhc0VsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLmNhbnZhc0VsZW1lbnQuY2xpZW50SGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQuaGVpZ2h0ID0gaGVpZ2h0O1xuXHR9XG5cbn0iLCJpbXBvcnQgeyBEcmF3TGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgVHJhbnNmb3JtLCBWaWV3VHJhbnNmb3JtLCBjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgRGltZW5zaW9uIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG4vKipcbiogV2UgZG9uJ3Qgd2FudCB0byBkcmF3IGEgZ3JpZCBpbnRvIGEgdHJhbnNmb3JtZWQgY2FudmFzIGFzIHRoaXMgZ2l2ZXMgdXMgZ3JpZCBsaW5lcyB0aGF0IGFyZSB0b29cbnRoaWNrIG9yIHRvbyB0aGluXG4qL1xuZXhwb3J0IGNsYXNzIFN0YXRpY0dyaWQgZXh0ZW5kcyBEcmF3TGF5ZXIge1xuXG5cdHpvb21XaWR0aDogbnVtYmVyO1xuXHR6b29tSGVpZ2h0OiBudW1iZXI7XG5cblx0Y29uc3RydWN0b3IobG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgem9vbUxldmVsOiBudW1iZXIsIHZpc2libGU6IGJvb2xlYW4sXG5cdFx0cmVhZG9ubHkgZ3JpZFdpZHRoOiBudW1iZXIgPSAyNTYsIHJlYWRvbmx5IGdyaWRIZWlnaHQ6IG51bWJlciA9IDI1Nil7XG5cblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybSwgMSwgdmlzaWJsZSk7XG5cblx0XHRsZXQgem9vbSA9IE1hdGgucG93KDIsIHpvb21MZXZlbCk7XG5cdFx0dGhpcy56b29tV2lkdGggPSBncmlkV2lkdGggLyB6b29tO1xuXHRcdHRoaXMuem9vbUhlaWdodCA9IGdyaWRIZWlnaHQgLyB6b29tO1xuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFZpZXdUcmFuc2Zvcm0pOiBib29sZWFuIHtcblxuXHRcdGxldCBvZmZzZXRYID0gdmlldy54ICogdmlldy56b29tWDtcblx0XHRsZXQgb2Zmc2V0WSA9IHZpZXcueSAqIHZpZXcuem9vbVk7XG5cblx0XHRsZXQgdmlld1dpZHRoID0gdmlldy53aWR0aCAvIHZpZXcuem9vbVg7XG5cdFx0bGV0IHZpZXdIZWlnaHQgPSB2aWV3LmhlaWdodCAvIHZpZXcuem9vbVk7XG5cblx0XHRsZXQgZ3JpZEFjcm9zcyA9IHZpZXdXaWR0aCAvIHRoaXMuem9vbVdpZHRoO1xuXHRcdGxldCBncmlkSGlnaCA9IHZpZXdIZWlnaHQgLyB0aGlzLnpvb21IZWlnaHQ7XG5cblx0XHRsZXQgeE1pbiA9IE1hdGguZmxvb3Iodmlldy54L3RoaXMuem9vbVdpZHRoKTtcblx0XHRsZXQgeExlZnQgPSB4TWluICogdGhpcy56b29tV2lkdGggKiB2aWV3Lnpvb21YO1xuXHRcdGxldCB4TWF4ID0gTWF0aC5jZWlsKCh2aWV3LnggKyB2aWV3V2lkdGgpIC8gdGhpcy56b29tV2lkdGgpO1xuXHRcdGxldCB4UmlnaHQgPSB4TWF4ICogdGhpcy56b29tV2lkdGggKiB2aWV3Lnpvb21YO1xuXG5cdFx0bGV0IHlNaW4gPSBNYXRoLmZsb29yKHZpZXcueS90aGlzLnpvb21IZWlnaHQpO1xuXHRcdGxldCB5VG9wID0geU1pbiAqIHRoaXMuem9vbUhlaWdodCAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IHlNYXggPSBNYXRoLmNlaWwoKHZpZXcueSArIHZpZXdIZWlnaHQpIC8gdGhpcy56b29tSGVpZ2h0KTtcblx0XHRsZXQgeUJvdHRvbSA9IHlNYXggKiB0aGlzLnpvb21IZWlnaHQgKiB2aWV3Lnpvb21YIDtcblxuXHRcdGNvbnNvbGUubG9nKFwieE1pbiBcIiArIHhNaW4gKyBcIiB4TWF4IFwiICsgeE1heCk7XG5cdFx0Y29uc29sZS5sb2coXCJ5TWluIFwiICsgeU1pbiArIFwiIHlNYXggXCIgKyB5TWF4KTtcblxuXHRcdGN0eC5iZWdpblBhdGgoKTtcblxuXHRcdGZvciAodmFyIHggPSB4TWluOyB4PD14TWF4OyB4Kyspe1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImF0IFwiICsgbWluWCk7XG5cdFx0XHRsZXQgeE1vdmUgPSB4ICogdGhpcy56b29tV2lkdGggKiB2aWV3Lnpvb21YO1xuXHRcdFx0Y3R4Lm1vdmVUbyh4TW92ZSAtIG9mZnNldFgsIHlUb3AgLSBvZmZzZXRZKTtcblx0XHRcdGN0eC5saW5lVG8oeE1vdmUgLSBvZmZzZXRYLCB5Qm90dG9tIC0gb2Zmc2V0WSk7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgeSA9IHlNaW47IHk8PXlNYXg7IHkrKyl7XG5cblx0XHRcdGxldCB5TW92ZSA9IHkgKiB0aGlzLnpvb21IZWlnaHQgKiB2aWV3Lnpvb21ZO1xuXHRcdFx0Y3R4Lm1vdmVUbyh4TGVmdCAtIG9mZnNldFgsIHlNb3ZlIC0gb2Zmc2V0WSk7XG5cdFx0XHRjdHgubGluZVRvKHhSaWdodCAtIG9mZnNldFgsIHlNb3ZlIC0gb2Zmc2V0WSk7XG5cblx0XHRcdGZvciAodmFyIHggPSB4TWluOyB4PD14TWF4OyB4Kyspe1xuXHRcdFx0XHRsZXQgeE1vdmUgPSAoeC0uNSkgKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cdFx0XHRcdHlNb3ZlID0gKHktLjUpICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWTtcblx0XHRcdFx0bGV0IHRleHQgPSBcIlwiICsgKHgtMSkgKyBcIiwgXCIgKyAoeS0xKTtcblx0XHRcdFx0Y3R4LnN0cm9rZVRleHQodGV4dCwgeE1vdmUgLSBvZmZzZXRYLCB5TW92ZSAtIG9mZnNldFkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0Y29uc29sZS5sb2coXCJkcmV3IGdyaWRcIik7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHRyZXR1cm4gbmV3IERpbWVuc2lvbigwLCAwLCAwLCAwKTtcblx0fVxufSIsIlxuaW1wb3J0IHtDYW52YXNWaWV3LCBEaXNwbGF5RWxlbWVudH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuaW1wb3J0IHtDYW52YXNMYXllcn0gZnJvbSBcIi4vbGF5ZXJcIjtcblxuZXhwb3J0IGNsYXNzIERpc3BsYXlFbGVtZW50Q29udHJvbGxlciB7XG5cbiAgICBjb25zdHJ1Y3RvcihjYW52YXNWaWV3OiBDYW52YXNWaWV3LCByZWFkb25seSBkaXNwbGF5RWxlbWVudDogRGlzcGxheUVsZW1lbnQsICBwdWJsaWMgbW9kOiBzdHJpbmcgPSBcInZcIikge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5wcmVzc2VkKGNhbnZhc1ZpZXcsIGUgIGFzIEtleWJvYXJkRXZlbnQpKTtcbiAgICB9XG5cbiAgICBwcmVzc2VkKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJwcmVzc2VkIGxheWVyXCIgKyBldmVudC50YXJnZXQgKyBcIiwgXCIgKyBldmVudC5rZXkpO1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICAgICAgICBjYXNlIHRoaXMubW9kOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidG9nZ2xlIHZpc2libGVcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5RWxlbWVudC5zZXRWaXNpYmxlKCF0aGlzLmRpc3BsYXlFbGVtZW50LmlzVmlzaWJsZSgpKTtcbiAgICAgICAgICAgICAgICBjYW52YXNWaWV3LmRyYXcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlQ29udHJvbGxlciB7XG5cbiAgICBwcml2YXRlIGNhbnZhc0xheWVyOiBDYW52YXNMYXllcjtcblxuICAgIGNvbnN0cnVjdG9yKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIGNhbnZhc0xheWVyOiBDYW52YXNMYXllcikge1xuICAgIFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5wcmVzc2VkKGNhbnZhc1ZpZXcsIGUgIGFzIEtleWJvYXJkRXZlbnQpKTtcbiAgICAgICAgdGhpcy5jYW52YXNMYXllciA9IGNhbnZhc0xheWVyO1xuICAgIH1cblxuICAgIHNldENhbnZhc0xheWVyKGNhbnZhc0xheWVyOiBDYW52YXNMYXllcil7XG4gICAgICAgIHRoaXMuY2FudmFzTGF5ZXIgPSBjYW52YXNMYXllcjtcbiAgICB9XG5cbiAgICBwcmVzc2VkKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgXHRjb25zb2xlLmxvZyhcInByZXNzZWRcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LmtleSk7XG5cbiAgICAgICAgbGV0IG11bHRpcGxpZXIgPSAxO1xuXG4gICAgXHRzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgIFx0XHRjYXNlIFwiYVwiOlxuICAgIFx0XHRcdHRoaXMuY2FudmFzTGF5ZXIueCA9IHRoaXMuY2FudmFzTGF5ZXIueCAtIDAuNSAqIG11bHRpcGxpZXI7XG4gICAgXHRcdFx0Y2FudmFzVmlldy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiQVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIueCA9IHRoaXMuY2FudmFzTGF5ZXIueCAtIDUgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiZFwiOlxuICAgIFx0XHRcdHRoaXMuY2FudmFzTGF5ZXIueCA9IHRoaXMuY2FudmFzTGF5ZXIueCArIDAuNSAqIG11bHRpcGxpZXI7XG4gICAgXHRcdFx0Y2FudmFzVmlldy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiRFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIueCA9IHRoaXMuY2FudmFzTGF5ZXIueCArIDUgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgIFx0XHRjYXNlIFwid1wiOlxuICAgIFx0XHRcdHRoaXMuY2FudmFzTGF5ZXIueSA9IHRoaXMuY2FudmFzTGF5ZXIueSAtIDAuNSAqIG11bHRpcGxpZXI7XG4gICAgXHRcdFx0Y2FudmFzVmlldy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiV1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIueSA9IHRoaXMuY2FudmFzTGF5ZXIueSAtIDUgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrOyAgICBcbiAgICBcdFx0Y2FzZSBcInNcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnkgPSB0aGlzLmNhbnZhc0xheWVyLnkgKyAwLjUgKiBtdWx0aXBsaWVyO1xuICAgIFx0XHRcdGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlNcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnkgPSB0aGlzLmNhbnZhc0xheWVyLnkgKyA1ICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICBjYW52YXNWaWV3LmRyYXcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJlXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiA9IHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gLSAwLjAwNTtcbiAgICAgICAgICAgICAgICBjYW52YXNWaWV3LmRyYXcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJFXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiA9IHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gLSAwLjA1O1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInFcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uID0gdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiArIDAuMDA1O1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlFcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uID0gdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiArIDAuMDU7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgXHRcdGNhc2UgXCJ4XCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci56b29tWCA9IHRoaXMuY2FudmFzTGF5ZXIuem9vbVggLSAwLjAwMiAqIG11bHRpcGxpZXI7XG4gICAgXHRcdFx0Y2FudmFzVmlldy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJYXCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci56b29tWCA9IHRoaXMuY2FudmFzTGF5ZXIuem9vbVggKyAwLjAwMiAqIG11bHRpcGxpZXI7XG4gICAgXHRcdFx0Y2FudmFzVmlldy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJ6XCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci56b29tWSA9IHRoaXMuY2FudmFzTGF5ZXIuem9vbVkgLSAwLjAwMiAqIG11bHRpcGxpZXI7XG4gICAgXHRcdFx0Y2FudmFzVmlldy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJaXCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci56b29tWSA9IHRoaXMuY2FudmFzTGF5ZXIuem9vbVkgKyAwLjAwMiAqIG11bHRpcGxpZXI7XG4gICAgXHRcdFx0Y2FudmFzVmlldy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiY1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIuc2V0VmlzaWJsZSghdGhpcy5jYW52YXNMYXllci52aXNpYmxlKTtcbiAgICAgICAgICAgICAgICBjYW52YXNWaWV3LmRyYXcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJUXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5vcGFjaXR5ID0gTWF0aC5taW4oMS4wLCB0aGlzLmNhbnZhc0xheWVyLm9wYWNpdHkgKyAwLjEpO1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLm9wYWNpdHkgPSBNYXRoLm1heCgwLCB0aGlzLmNhbnZhc0xheWVyLm9wYWNpdHkgLSAwLjEpO1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgIFx0XHRkZWZhdWx0OlxuICAgIFx0XHRcdC8vIGNvZGUuLi5cbiAgICBcdFx0XHRicmVhaztcbiAgICBcdH1cbiAgICBcdGNvbnNvbGUubG9nKFwiaW1hZ2UgYXQ6IFwiICsgIHRoaXMuY2FudmFzTGF5ZXIueCArIFwiLCBcIiArIHRoaXMuY2FudmFzTGF5ZXIueSk7XG4gICAgXHRjb25zb2xlLmxvZyhcImltYWdlIHJvIHNjOiBcIiArICB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uICsgXCIsIFwiICsgdGhpcy5jYW52YXNMYXllci56b29tWCArIFwiLCBcIiArIHRoaXMuY2FudmFzTGF5ZXIuem9vbVkpO1xuICAgIH07XG5cbn07IiwiaW1wb3J0IHsgVHJhbnNmb3JtLCBCYXNpY1RyYW5zZm9ybSwgVmlld1RyYW5zZm9ybSwgY29tYmluZVRyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IERpc3BsYXlFbGVtZW50IH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgRGltZW5zaW9uIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiXG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDYW52YXNMYXllciBleHRlbmRzIEJhc2ljVHJhbnNmb3JtIGltcGxlbWVudHMgRGlzcGxheUVsZW1lbnQge1xuXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBwdWJsaWMgb3BhY2l0eTogbnVtYmVyLCBwdWJsaWMgdmlzaWJsZSl7XG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0ueCwgbG9jYWxUcmFuc2Zvcm0ueSwgbG9jYWxUcmFuc2Zvcm0uem9vbVgsIGxvY2FsVHJhbnNmb3JtLnpvb21ZLCBsb2NhbFRyYW5zZm9ybS5yb3RhdGlvbik7XG5cdH1cblxuXHRhYnN0cmFjdCBkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW47XG5cblx0YWJzdHJhY3QgZ2V0RGltZW5zaW9uKCk6IERpbWVuc2lvbjtcblxuXHRpc1Zpc2libGUoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudmlzaWJsZTtcblx0fVxuXG5cdHNldFZpc2libGUodmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xuXHRcdGNvbnNvbGUubG9nKFwic2V0dGluZyB2aXNpYmlsaXR5OiBcIiArIHZpc2libGUpO1xuXHRcdHRoaXMudmlzaWJsZSA9IHZpc2libGU7XG5cdH1cblxuXHRnZXRPcGFjaXR5KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMub3BhY2l0eTtcblx0fVxuXG5cdHNldE9wYWNpdHkob3BhY2l0eTogbnVtYmVyKTogdm9pZCB7XG5cdFx0dGhpcy5vcGFjaXR5ID0gb3BhY2l0eTtcblx0fVxuXG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBEcmF3TGF5ZXIgZXh0ZW5kcyBDYW52YXNMYXllciB7XG5cbiAgICBwcm90ZWN0ZWQgcHJlcGFyZUN0eChjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFRyYW5zZm9ybSk6IHZvaWQge1xuXHRcdGN0eC50cmFuc2xhdGUoKHRyYW5zZm9ybS54IC0gdmlldy54KSAqIHZpZXcuem9vbVgsICh0cmFuc2Zvcm0ueSAtIHZpZXcueSkgKiB2aWV3Lnpvb21ZKTtcblx0XHRjdHguc2NhbGUodHJhbnNmb3JtLnpvb21YICogdmlldy56b29tWCwgdHJhbnNmb3JtLnpvb21ZICogdmlldy56b29tWSk7XG5cdFx0Y3R4LnJvdGF0ZSh0cmFuc2Zvcm0ucm90YXRpb24pO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBjbGVhbkN0eChjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFRyYW5zZm9ybSk6IHZvaWQge1x0XG5cdFx0Y3R4LnJvdGF0ZSgtdHJhbnNmb3JtLnJvdGF0aW9uKTtcblx0XHRjdHguc2NhbGUoMS90cmFuc2Zvcm0uem9vbVgvdmlldy56b29tWCwgMS90cmFuc2Zvcm0uem9vbVkvdmlldy56b29tWSk7XG5cdFx0Y3R4LnRyYW5zbGF0ZSgtKHRyYW5zZm9ybS54IC12aWV3LngpICp2aWV3Lnpvb21YLCAtKHRyYW5zZm9ybS55IC0gdmlldy55KSAqIHZpZXcuem9vbVkpO1xuICAgIH1cblxufVxuXG5leHBvcnQgY2xhc3MgQ29udGFpbmVyTGF5ZXIgZXh0ZW5kcyBDYW52YXNMYXllciB7XG5cblx0bGF5ZXJNYXA6IE1hcDxzdHJpbmcsIENhbnZhc0xheWVyPjtcblx0ZGlzcGxheUxheWVyczogQXJyYXk8Q2FudmFzTGF5ZXI+O1xuXG5cdGNvbnN0cnVjdG9yKGxvY2FsVHJhbnNmb3JtOiBUcmFuc2Zvcm0sIG9wYWNpdHk6IG51bWJlciA9IDEsIHZpc2libGU6IGJvb2xlYW4gPSB0cnVlKSB7XG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0sIG9wYWNpdHksIHZpc2libGUpO1xuXHRcdHRoaXMubGF5ZXJNYXAgPSBuZXcgTWFwPHN0cmluZywgQ2FudmFzTGF5ZXI+KCk7XG5cdFx0dGhpcy5kaXNwbGF5TGF5ZXJzID0gW107XG5cdH1cblxuXHRzZXQobmFtZTogc3RyaW5nLCBsYXllcjogQ2FudmFzTGF5ZXIpe1xuXHRcdHRoaXMubGF5ZXJNYXAuc2V0KG5hbWUsIGxheWVyKTtcblx0XHR0aGlzLmRpc3BsYXlMYXllcnMucHVzaChsYXllcik7XG5cdH1cblxuXHRnZXQobmFtZTogc3RyaW5nKTogQ2FudmFzTGF5ZXIge1xuXHRcdHJldHVybiB0aGlzLmxheWVyTWFwLmdldChuYW1lKTtcblx0fVxuXG5cdHNldFRvcChuYW1lOiBzdHJpbmcpIHtcblx0XHRsZXQgdG9wTGF5ZXIgPSB0aGlzLmdldChuYW1lKTtcblx0XHRpZiAodG9wTGF5ZXIgIT0gdW5kZWZpbmVkKXtcblx0XHRcdHRoaXMuZGlzcGxheUxheWVycyA9IHRoaXMuZGlzcGxheUxheWVycy5maWx0ZXIoZnVuY3Rpb24oZWxlbWVudDogQ2FudmFzTGF5ZXIpeyBcblx0XHRcdFx0aWYgKGVsZW1lbnQgPT0gdG9wTGF5ZXIpe1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fX0pO1xuXHRcdFx0dGhpcy5kaXNwbGF5TGF5ZXJzLnB1c2godG9wTGF5ZXIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcInRvcCBsYXllciB1bmRlZmluZWQgXCIgKyBuYW1lKTtcblx0XHR9XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0bGV0IGxheWVyVHJhbnNmb3JtID0gY29tYmluZVRyYW5zZm9ybSh0aGlzLmxvY2FsVHJhbnNmb3JtLCBwYXJlbnRUcmFuc2Zvcm0pO1xuXG5cdFx0dmFyIGRyYXdpbmdDb21wbGV0ZSA9IHRydWU7XG5cblx0XHRmb3IgKGxldCBsYXllciBvZiB0aGlzLmRpc3BsYXlMYXllcnMpIHtcblx0XHRcdGlmIChsYXllci5pc1Zpc2libGUoKSl7XG5cdFx0XHRcdGRyYXdpbmdDb21wbGV0ZSA9IGRyYXdpbmdDb21wbGV0ZSAmJiBsYXllci5kcmF3KGN0eCwgbGF5ZXJUcmFuc2Zvcm0sIHZpZXcpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRyYXdpbmdDb21wbGV0ZTtcblx0fVxuXG5cdGdldERpbWVuc2lvbigpOiBEaW1lbnNpb24ge1xuXHRcdHZhciB4TWluID0gdGhpcy54O1xuXHRcdHZhciB5TWluID0gdGhpcy55O1xuXHRcdHZhciB4TWF4ID0gdGhpcy54O1xuXHRcdHZhciB5TWF4ID0gdGhpcy55O1xuXG5cdFx0Zm9yIChsZXQgbGF5ZXIgb2YgdGhpcy5kaXNwbGF5TGF5ZXJzKSB7XG5cdFx0XHRsZXQgbGF5ZXJEaW1lbnNpb24gPSBsYXllci5nZXREaW1lbnNpb24oKTtcblx0XHRcdHhNaW4gPSBNYXRoLm1pbih4TWluLCB0aGlzLnggKyBsYXllckRpbWVuc2lvbi54KTtcblx0XHRcdHlNaW4gPSBNYXRoLm1pbih5TWluLCB0aGlzLnkgKyBsYXllckRpbWVuc2lvbi55KTtcblx0XHRcdHhNYXggPSBNYXRoLm1heCh4TWF4LCB0aGlzLnggKyBsYXllckRpbWVuc2lvbi54ICsgdGhpcy56b29tWCAqIGxheWVyRGltZW5zaW9uLncpO1xuXHRcdFx0eU1heCA9IE1hdGgubWF4KHlNYXgsIHRoaXMueSArIGxheWVyRGltZW5zaW9uLnkgKyB0aGlzLnpvb21ZICogbGF5ZXJEaW1lbnNpb24uaCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBEaW1lbnNpb24oeE1pbiwgeU1pbiwgeE1heCAtIHhNaW4sIHlNYXggLSB5TWluKTtcblx0fVxuXG5cbn0iLCJpbXBvcnQgeyBDb250YWluZXJMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBDb250YWluZXJMYXllck1hbmFnZXIgfSBmcm9tIFwiLi9sYXllcm1hbmFnZXJcIjtcbmltcG9ydCB7IENhbnZhc1ZpZXcgfSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5cbmV4cG9ydCBjbGFzcyBMYXllckNvbnRyb2xsZXIge1xuXG5cdHByaXZhdGUgbW9kOiBzdHJpbmcgPSBcImlcIjtcblxuXHRjb25zdHJ1Y3RvcihjYW52YXNWaWV3OiBDYW52YXNWaWV3LCByZWFkb25seSBjb250YWluZXJMYXllck1hbmFnZXI6IENvbnRhaW5lckxheWVyTWFuYWdlcil7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZChjYW52YXNWaWV3LCBlICBhcyBLZXlib2FyZEV2ZW50KSk7XG5cdH1cblxuXHRwcmVzc2VkKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgIGNhc2UgdGhpcy5tb2Q6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0b2dnbGUgdmlzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lckxheWVyTWFuYWdlci50b2dnbGVWaXNpYmlsaXR5KGZhbHNlKTtcbiAgICAgICAgICAgICAgICBjYW52YXNWaWV3LmRyYXcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxufSIsImltcG9ydCB7IENhbnZhc0xheWVyLCBDb250YWluZXJMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBTdGF0aWNJbWFnZSwgUmVjdExheWVyIH0gZnJvbSBcIi4vc3RhdGljXCI7XG5pbXBvcnQgeyBUcmFuc2Zvcm0gLCBCYXNpY1RyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7Q2FudmFzVmlldywgRGlzcGxheUVsZW1lbnR9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcblxuZXhwb3J0IGludGVyZmFjZSBJbWFnZVN0cnVjdCBleHRlbmRzIFRyYW5zZm9ybSB7XG5cdFxuXHRvcGFjaXR5OiBudW1iZXI7XG5cdHZpc2libGU6IGJvb2xlYW47XG5cdHNyYzogc3RyaW5nO1xuXHRuYW1lOiBzdHJpbmc7XG5cbn1cblxuZXhwb3J0IGNsYXNzIExheWVyTWFuYWdlciB7XG5cblx0cHJpdmF0ZSBsYXllck1hcDogTWFwPHN0cmluZywgQ29udGFpbmVyTGF5ZXI+OztcblxuXHRyZWFkb25seSBkZWZhdWx0TGF5ZXI6IHN0cmluZyA9IFwiZGVmYXVsdFwiO1xuXG5cdGNvbnN0cnVjdG9yKCl7XG5cdFx0dGhpcy5sYXllck1hcCA9IG5ldyBNYXA8c3RyaW5nLCBDb250YWluZXJMYXllcj4oKTtcblxuXHRcdGxldCBpbWFnZUxheWVyID0gbmV3IENvbnRhaW5lckxheWVyKEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0sIDEsIHRydWUpO1x0XG5cblx0XHR0aGlzLmxheWVyTWFwLnNldCh0aGlzLmRlZmF1bHRMYXllciwgaW1hZ2VMYXllcik7XG5cdH1cblxuXHRhZGRJbWFnZShpbWFnZTogU3RhdGljSW1hZ2UsIG5hbWU6IHN0cmluZyl7XG5cdFx0dGhpcy5sYXllck1hcC5nZXQodGhpcy5kZWZhdWx0TGF5ZXIpLnNldChuYW1lLCBpbWFnZSk7XG5cdH1cblxuXHRhZGRMYXllcihpbWFnZURldGFpbHM6IEFycmF5PEltYWdlU3RydWN0PiwgbGF5ZXJOYW1lOiBzdHJpbmcpOiBDb250YWluZXJMYXllciB7XG5cdFx0bGV0IGltYWdlTGF5ZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXIoQmFzaWNUcmFuc2Zvcm0udW5pdFRyYW5zZm9ybSwgMSwgdHJ1ZSk7XHRcblxuXHRcdGZvciAodmFyIGltYWdlIG9mIGltYWdlRGV0YWlscyl7XG5cdFx0XHRsZXQgc3RhdGljSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoaW1hZ2UsIGltYWdlLnNyYywgaW1hZ2Uub3BhY2l0eSwgaW1hZ2UudmlzaWJsZSk7XG5cdFx0XHRpbWFnZUxheWVyLnNldChpbWFnZS5uYW1lLCBzdGF0aWNJbWFnZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5sYXllck1hcC5zZXQobGF5ZXJOYW1lLCBpbWFnZUxheWVyKTtcblxuXHRcdHJldHVybiBpbWFnZUxheWVyO1xuXHR9XG5cblx0Z2V0TGF5ZXJzKCk6IE1hcDxzdHJpbmcsIENvbnRhaW5lckxheWVyPiB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXA7XG5cdH1cblxuXHRnZXRMYXllcihuYW1lOiBzdHJpbmcpOiBDb250YWluZXJMYXllciB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXAuZ2V0KG5hbWUpO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNsYXNzIENvbnRhaW5lckxheWVyTWFuYWdlciB7XG5cblx0cHJpdmF0ZSBjb250YWluZXJMYXllcjogQ29udGFpbmVyTGF5ZXI7XG5cdHByaXZhdGUgc2VsZWN0ZWQ6IHN0cmluZztcblx0XG5cdGNvbnN0cnVjdG9yKGNvbnRhaW5lckxheWVyOiBDb250YWluZXJMYXllcikge1xuXHRcdHRoaXMuY29udGFpbmVyTGF5ZXIgPSBjb250YWluZXJMYXllcjtcblx0fVxuXG5cdHNldExheWVyQ29udGFpbmVyKGNvbnRhaW5lckxheWVyOiBDb250YWluZXJMYXllcikge1xuXHRcdHRoaXMuY29udGFpbmVyTGF5ZXIgPSBjb250YWluZXJMYXllcjtcblx0fVxuXG5cdHNldFNlbGVjdGVkKG5hbWU6IHN0cmluZyl7XG5cdFx0dGhpcy5zZWxlY3RlZCA9IG5hbWU7XG5cblx0XHRsZXQgbGF5ZXI6IENhbnZhc0xheWVyID0gdGhpcy5jb250YWluZXJMYXllci5nZXQodGhpcy5zZWxlY3RlZCk7XG5cblx0XHRsZXQgbGF5ZXJSZWN0ID0gbmV3IFJlY3RMYXllcihcblx0XHRcdG5ldyBCYXNpY1RyYW5zZm9ybSgwLCAwLCAxLCAxLCAwKSwgbGF5ZXIuZ2V0RGltZW5zaW9uKCksIDEsIHRydWUpO1xuXG5cdFx0dGhpcy5jb250YWluZXJMYXllci5zZXQoXCJvdXRsaW5lXCIsIGxheWVyUmVjdCk7XG5cblx0fVxuXG5cdHRvZ2dsZVZpc2liaWxpdHkoc2VsZWN0ZWQ6IGJvb2xlYW4gPSB0cnVlKXtcblx0XHRsZXQgdG9nZ2xlR3JvdXA6IEFycmF5PERpc3BsYXlFbGVtZW50PiA9IFtdO1xuXHRcdGlmIChzZWxlY3RlZCl7XG5cdFx0XHRpZiAodGhpcy5zZWxlY3RlZCAhPSBcIlwiKXtcblx0XHRcdFx0dG9nZ2xlR3JvdXAucHVzaCh0aGlzLmNvbnRhaW5lckxheWVyLmdldCh0aGlzLnNlbGVjdGVkKSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZvciAobGV0IHBhaXIgb2YgdGhpcy5jb250YWluZXJMYXllci5sYXllck1hcCl7XG5cblx0XHRcdFx0aWYgKHBhaXJbMF0gIT0gdGhpcy5zZWxlY3RlZCl7XG5cdFx0XHRcdFx0dG9nZ2xlR3JvdXAucHVzaChwYWlyWzFdKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcImxheWVyTmFtZTogXCIgKyB0aGlzLnNlbGVjdGVkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZvciAobGV0IGVsZW1lbnQgb2YgdG9nZ2xlR3JvdXApe1xuXHRcdFx0ZWxlbWVudC5zZXRWaXNpYmxlKCFlbGVtZW50LmlzVmlzaWJsZSgpKVxuXHRcdH1cblx0fVxuXG59IiwiaW1wb3J0IHsgVHJhbnNmb3JtLCBjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgRHJhd0xheWVyLCBDYW52YXNMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBEaXNwbGF5RWxlbWVudCB9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IERpbWVuc2lvbiwgcm90YXRlLCBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgY2xhc3MgU3RhdGljSW1hZ2UgZXh0ZW5kcyBEcmF3TGF5ZXIgaW1wbGVtZW50cyBEaXNwbGF5RWxlbWVudCB7XG5cblx0cHJpdmF0ZSBpbWc6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cblx0Y29uc3RydWN0b3IobG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdFx0aW1hZ2VTcmM6IHN0cmluZywgXG5cdFx0b3BhY2l0eTogbnVtYmVyLFxuXHRcdHZpc2libGU6IGJvb2xlYW4pIHtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCBvcGFjaXR5LCB2aXNpYmxlKTtcblx0XHRcblx0XHR0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuXHRcdHRoaXMuaW1nLnNyYyA9IGltYWdlU3JjO1xuXHR9XG5cblx0cHJpdmF0ZSBkcmF3SW1hZ2UoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHBhcmVudFRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBUcmFuc2Zvcm0pe1xuXG5cdFx0aWYgKHRoaXMuaXNWaXNpYmxlKCkpe1xuXHRcdFx0bGV0IGN0eFRyYW5zZm9ybSA9IGNvbWJpbmVUcmFuc2Zvcm0odGhpcywgcGFyZW50VHJhbnNmb3JtKTtcblxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImN0eCB4IFwiICsgY3R4VHJhbnNmb3JtLngpO1xuXG5cdFx0XHR0aGlzLnByZXBhcmVDdHgoY3R4LCBjdHhUcmFuc2Zvcm0sIHZpZXcpO1xuXHRcdFx0XG5cdFx0XHRjdHguZ2xvYmFsQWxwaGEgPSB0aGlzLm9wYWNpdHk7XG5cdFx0XHRjdHguZHJhd0ltYWdlKHRoaXMuaW1nLCAwLCAwKTtcblx0XHRcdGN0eC5nbG9iYWxBbHBoYSA9IDE7XG5cblx0XHRcdHRoaXMuY2xlYW5DdHgoY3R4LCBjdHhUcmFuc2Zvcm0sIHZpZXcpO1xuXHRcdH1cblx0XHRcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHBhcmVudFRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBUcmFuc2Zvcm0pOiBib29sZWFuIHtcblx0XHRpZiAodGhpcy52aXNpYmxlICYmIHRoaXMuaW1nLmNvbXBsZXRlKSB7XG5cdFx0XHR0aGlzLmRyYXdJbWFnZShjdHgsIHBhcmVudFRyYW5zZm9ybSwgdmlldyk7XG5cdFx0Ly9cdGNvbnNvbGUubG9nKFwiZHJldyBpbWFnZSBcIiArIHRoaXMuaW1nLnNyYyk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Z2V0RGltZW5zaW9uKCk6IERpbWVuc2lvbiB7XG5cdFx0XG5cdFx0aWYgKHRoaXMuaW1nLmNvbXBsZXRlKXtcblx0XHRcdHZhciB3aWR0aCA9IHRoaXMuaW1nLndpZHRoICogdGhpcy56b29tWDtcblx0XHRcdHZhciBoZWlnaHQgPSB0aGlzLmltZy5oZWlnaHQgKiB0aGlzLnpvb21ZO1xuXG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiaW1nIHdpZHRoIFwiICsgd2lkdGggKyBcIiBoZWlnaHQgXCIgKyBoZWlnaHQpO1xuXG5cdFx0XHRsZXQgcDEgPSByb3RhdGUobmV3IFBvaW50MkQod2lkdGgsIDApLCB0aGlzLnJvdGF0aW9uKTtcblx0XHRcdC8vY29uc29sZS5sb2coXCJwMSBcIiArIHAxKTtcblx0XHRcdGxldCBwMiA9IHJvdGF0ZShuZXcgUG9pbnQyRCh3aWR0aCwgaGVpZ2h0KSwgdGhpcy5yb3RhdGlvbik7XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwicDIgXCIgKyBwMik7XG5cdFx0XHRsZXQgcDMgPSByb3RhdGUobmV3IFBvaW50MkQoMCwgaGVpZ2h0KSwgdGhpcy5yb3RhdGlvbik7XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwicDMgXCIgKyBwMyk7XG5cblx0XHRcdGxldCBtaW5YID0gTWF0aC5taW4oMCwgcDEueCwgcDIueCwgcDMueCk7XG5cdFx0XHRsZXQgbWluWSA9IE1hdGgubWluKDAsIHAxLnksIHAyLnksIHAzLnkpO1xuXHRcdFx0bGV0IG1heFggPSBNYXRoLm1heCgwLCBwMS54LCBwMi54LCBwMy54KTtcblx0XHRcdGxldCBtYXhZID0gTWF0aC5tYXgoMCwgcDEueSwgcDIueSwgcDMueSk7XG5cblx0XHRcdC8vY29uc29sZS5sb2coXCJ4eSBcIiArIHRoaXMueCwgdGhpcy55KTtcblx0XHRcdGNvbnNvbGUubG9nKFwibWluWCBcIiArIG1pblggKyBcIiBtaW5ZIFwiICsgbWluWSArIFwiIG1heFggXCIgKyBtYXhYICsgXCJtYXhZIFwiICsgbWF4WSk7XG5cblx0XHRcdHJldHVybiBuZXcgRGltZW5zaW9uKHRoaXMueCArIG1pblggKiB0aGlzLnpvb21YLCB0aGlzLnkgKyBtaW5ZLCBtYXhYLW1pblgsIG1heFktbWluWSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBEaW1lbnNpb24odGhpcy54LCB0aGlzLnksIDAsIDApO1xuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWN0TGF5ZXIgZXh0ZW5kcyBEcmF3TGF5ZXIgaW1wbGVtZW50cyBEaXNwbGF5RWxlbWVudCB7XG5cblx0Y29uc3RydWN0b3IobG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdFx0cmVhZG9ubHkgZGltZW5zaW9uOiBEaW1lbnNpb24sIFxuXHRcdG9wYWNpdHk6IG51bWJlcixcblx0XHR2aXNpYmxlOiBib29sZWFuKSB7XG5cblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybSwgb3BhY2l0eSwgdmlzaWJsZSk7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0XHRsZXQgeCA9ICh0aGlzLmRpbWVuc2lvbi54IC0gdmlldy54KSAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IHkgPSAodGhpcy5kaW1lbnNpb24ueSAtIHZpZXcueSkgKiB2aWV3Lnpvb21ZO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhcImRpbWVuc2lvbiBcIiArIHRoaXMuZGltZW5zaW9uLngpO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhcIm91dGxpbmU6IFwiICsgeCArIFwiIHZpZXc6IFwiICsgdmlldy54ICsgXG5cdFx0Ly9cdFwiIHBhcmVudCBcIiArIHBhcmVudFRyYW5zZm9ybS54ICsgXCIgdyBcIiArIHRoaXMuZGltZW5zaW9uLncpO1xuXHRcdGN0eC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG5cdFx0Y3R4LnN0cm9rZVJlY3QoeCwgeSwgdGhpcy5kaW1lbnNpb24udyAqIHZpZXcuem9vbVgsIHRoaXMuZGltZW5zaW9uLmggKiB2aWV3Lnpvb21ZKTtcblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0Z2V0RGltZW5zaW9uKCk6IERpbWVuc2lvbiB7XG5cdFx0cmV0dXJuIHRoaXMuZGltZW5zaW9uO1xuXHR9XG5cbn1cbiIsImltcG9ydCB7IERyYXdMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBUcmFuc2Zvcm0sIEJhc2ljVHJhbnNmb3JtLCBWaWV3VHJhbnNmb3JtLCBjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgRGltZW5zaW9uIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgY2xhc3MgVGlsZVN0cnVjdCB7XG5cdFxuXHRjb25zdHJ1Y3Rvcihcblx0XHRwdWJsaWMgcHJlZml4OiBzdHJpbmcsXG5cdFx0cHVibGljIHN1ZmZpeDogc3RyaW5nLFxuXHRcdHB1YmxpYyB0aWxlRGlyZWN0b3J5OiBzdHJpbmcpe31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHpvb21CeUxldmVsKHpvb21MZXZlbDogbnVtYmVyKXtcblx0cmV0dXJuIE1hdGgucG93KDIsIHpvb21MZXZlbCk7XG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlTGF5ZXIgZXh0ZW5kcyBEcmF3TGF5ZXIge1xuXG5cdHRpbGVNYW5hZ2VyOiBUaWxlTWFuYWdlcjtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHRyZWFkb25seSB0aWxlU3RydWN0OiBUaWxlU3RydWN0LFxuXHRcdHZpc2JpbGU6IGJvb2xlYW4sXG5cdFx0cHVibGljIHhPZmZzZXQ6IG51bWJlciA9IDAsXG5cdFx0cHVibGljIHlPZmZzZXQ6IG51bWJlciA9IDAsXG5cdFx0cHVibGljIHpvb206IG51bWJlciA9IDEsXG5cdFx0cmVhZG9ubHkgZ3JpZFdpZHRoOiBudW1iZXIgPSAyNTYsIFxuXHRcdHJlYWRvbmx5IGdyaWRIZWlnaHQ6IG51bWJlciA9IDI1Nixcblx0XHRvcGFjaXR5OiBudW1iZXIgPSAxKXtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCBvcGFjaXR5LCB2aXNiaWxlKTtcblxuXHRcdHRoaXMudGlsZU1hbmFnZXIgPSBuZXcgVGlsZU1hbmFnZXIoKTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHBhcmVudFRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBWaWV3VHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0XHRsZXQgY3R4VHJhbnNmb3JtID0gY29tYmluZVRyYW5zZm9ybSh0aGlzLCBwYXJlbnRUcmFuc2Zvcm0pO1xuXG5cdFx0bGV0IHpvb21XaWR0aDogbnVtYmVyID0gdGhpcy5ncmlkV2lkdGggKiBjdHhUcmFuc2Zvcm0uem9vbVhcblx0XHRsZXQgem9vbUhlaWdodDogbnVtYmVyID0gdGhpcy5ncmlkSGVpZ2h0ICogY3R4VHJhbnNmb3JtLnpvb21ZO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhcImN0eCB6b29tV2lkdGg6IFwiICsgem9vbVdpZHRoKTtcblxuXHRcdGxldCB2aWV3WCA9IHZpZXcueCAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IHZpZXdZID0gdmlldy55ICogdmlldy56b29tWTtcblxuXHRcdGxldCB2aWV3V2lkdGggPSB2aWV3LndpZHRoIC8gdmlldy56b29tWDtcblx0XHRsZXQgdmlld0hlaWdodCA9IHZpZXcuaGVpZ2h0IC8gdmlldy56b29tWTtcblxuXHRcdGxldCBncmlkQWNyb3NzID0gdmlld1dpZHRoIC8gem9vbVdpZHRoOyAvL2dvb2Rcblx0XHRsZXQgZ3JpZEhpZ2ggPSB2aWV3SGVpZ2h0IC8gem9vbUhlaWdodDsgLy9nb29kXG5cblx0XHRsZXQgeE1pbiA9IE1hdGguZmxvb3Iodmlldy54L3pvb21XaWR0aCk7XG5cdFx0bGV0IHhNYXggPSBNYXRoLmNlaWwoKHZpZXcueCArIHZpZXdXaWR0aCkgLyB6b29tV2lkdGgpO1xuXG5cdFx0bGV0IHlNaW4gPSBNYXRoLmZsb29yKHZpZXcueS96b29tSGVpZ2h0KTtcblx0XHRsZXQgeU1heCA9IE1hdGguY2VpbCgodmlldy55ICsgdmlld0hlaWdodCkgLyB6b29tSGVpZ2h0KTtcblxuXHRcdC8vY29uc29sZS5sb2coXCJ4IHkgcyBcIiArIHhNaW4gKyBcIiwgXCIgKyB4TWF4ICsgXCI6IFwiICsgeU1pbiArIFwiLCBcIiArIHlNYXgpO1xuXHRcdC8vY29uc29sZS5sb2coXCJhY3Jvc3MgaGlnaFwiICsgZ3JpZEFjcm9zcyArIFwiLCBcIiArIGdyaWRIaWdoKTtcblxuXHRcdHZhciBkcmF3aW5nQ29tcGxldGUgPSB0cnVlO1xuXG5cdFx0bGV0IGZ1bGxab29tWCA9IGN0eFRyYW5zZm9ybS56b29tWCAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IGZ1bGxab29tWSA9IGN0eFRyYW5zZm9ybS56b29tWSAqIHZpZXcuem9vbVk7XG5cblx0XHQvL2NvbnNvbGUubG9nKFwiZnVsbHpvb21zIFwiICsgZnVsbFpvb21YICsgXCIgXCIgKyBmdWxsWm9vbVkpO1xuXG5cdFx0Y3R4LnNjYWxlKGZ1bGxab29tWCwgZnVsbFpvb21ZKTtcblxuXHRcdGZvciAodmFyIHggPSB4TWluOyB4PHhNYXg7IHgrKyl7XG5cdFx0XHRsZXQgeE1vdmUgPSB4ICogdGhpcy5ncmlkV2lkdGggLSB2aWV3LnggLyBjdHhUcmFuc2Zvcm0uem9vbVg7XG5cdFx0XHRmb3IgKHZhciB5ID0geU1pbjsgeTx5TWF4OyB5Kyspe1xuXHRcdFx0XHRsZXQgeU1vdmUgPSB5ICogdGhpcy5ncmlkSGVpZ2h0IC0gdmlldy55LyBjdHhUcmFuc2Zvcm0uem9vbVk7XG5cdFx0XHRcdC8vY29uc29sZS5sb2coXCJ0aWxlIHggeSBcIiArIHggKyBcIiBcIiArIHkgKyBcIjogXCIgKyB4TW92ZSArIFwiLCBcIiArIHlNb3ZlKTtcblxuXHRcdFx0XHRjdHgudHJhbnNsYXRlKHhNb3ZlLCB5TW92ZSk7XG5cdFx0XHRcdGxldCB0aWxlU3JjID0gdGhpcy50aWxlU3RydWN0LnRpbGVEaXJlY3RvcnkgKyB0aGlzLnpvb20gKyBcIi9cIiArIFxuXHRcdFx0XHRcdCh4ICsgdGhpcy54T2Zmc2V0KSArIFwiL1wiICsgXG5cdFx0XHRcdFx0KHkgKyB0aGlzLnlPZmZzZXQpICsgdGhpcy50aWxlU3RydWN0LnN1ZmZpeDtcblxuXHRcdFx0XHRpZiAodGhpcy50aWxlTWFuYWdlci5oYXModGlsZVNyYykpIHtcblx0XHRcdFx0XHRsZXQgaW1hZ2VUaWxlID0gdGhpcy50aWxlTWFuYWdlci5nZXQodGlsZVNyYyk7XG5cdFx0XHRcdFx0ZHJhd2luZ0NvbXBsZXRlID0gZHJhd2luZ0NvbXBsZXRlICYmIGltYWdlVGlsZS5kcmF3KGN0eCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0bGV0IGltYWdlVGlsZSA9IG5ldyBJbWFnZVRpbGUoeCwgeSwgdGlsZVNyYyk7XG5cblx0XHRcdFx0XHRkcmF3aW5nQ29tcGxldGUgPSBkcmF3aW5nQ29tcGxldGUgJiYgaW1hZ2VUaWxlLmRyYXcoY3R4KTtcblxuXHRcdFx0XHRcdHRoaXMudGlsZU1hbmFnZXIuc2V0KHRpbGVTcmMsIGltYWdlVGlsZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjdHgudHJhbnNsYXRlKC14TW92ZSwgLXlNb3ZlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjdHguc2NhbGUoMSAvIGZ1bGxab29tWCwgMSAvIGZ1bGxab29tWSk7XG5cblx0XHQvL2NvbnNvbGUubG9nKFwiZHJldyB0aWxlcyBcIiArIGRyYXdpbmdDb21wbGV0ZSk7XG5cdFx0cmV0dXJuIGRyYXdpbmdDb21wbGV0ZTtcblx0fVxuXG5cdGdldERpbWVuc2lvbigpOiBEaW1lbnNpb24ge1xuXHRcdHJldHVybiBuZXcgRGltZW5zaW9uKDAsIDAsIDAsIDApO1xuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlTWFuYWdlciB7XG5cblx0dGlsZU1hcDogTWFwPHN0cmluZywgSW1hZ2VUaWxlPjtcblxuXHRjb25zdHJ1Y3Rvcigpe1xuXHRcdHRoaXMudGlsZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBJbWFnZVRpbGU+KCk7XG5cdH1cblxuXHRnZXQodGlsZUtleTogc3RyaW5nKTogSW1hZ2VUaWxlIHtcblx0XHRyZXR1cm4gdGhpcy50aWxlTWFwLmdldCh0aWxlS2V5KTtcblx0fVxuXG5cdGhhcyh0aWxlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy50aWxlTWFwLmhhcyh0aWxlS2V5KTtcblx0fVxuXG5cdHNldCh0aWxlS2V5OiBzdHJpbmcsIHRpbGU6IEltYWdlVGlsZSl7XG5cdFx0dGhpcy50aWxlTWFwLnNldCh0aWxlS2V5LCB0aWxlKTtcblx0fVxuXG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZVRpbGUge1xuXG5cdHByaXZhdGUgaW1nOiBIVE1MSW1hZ2VFbGVtZW50O1xuXHRwcml2YXRlIGV4aXN0czogYm9vbGVhbjtcblxuXHRjb25zdHJ1Y3RvcihyZWFkb25seSB4SW5kZXg6IG51bWJlciwgcmVhZG9ubHkgeUluZGV4OiBudW1iZXIsIGltYWdlU3JjOiBzdHJpbmcpIHtcblx0XHR0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuXHRcdHRoaXMuaW1nLnNyYyA9IGltYWdlU3JjO1xuXHRcdHRoaXMuaW1nLm9uZXJyb3IgPSBmdW5jdGlvbihldmVudE9yTWVzc2FnZTogYW55KXtcblx0XHRcdGV2ZW50T3JNZXNzYWdlLnRhcmdldC5zcmMgPSBcIlwiO1xuXHRcdH07XG5cdH07XG5cblx0cHJpdmF0ZSBkcmF3SW1hZ2UoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpe1xuXHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDApO1xuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCk6IGJvb2xlYW4ge1xuXHRcdGlmICh0aGlzLmltZy5zcmMgIT0gXCJcIiAmJiB0aGlzLmltZy5jb21wbGV0ZSApIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xuXG59XG4iLCIvKipcbiogQSB3b3JsZCBpcyAwLDAgYmFzZWQgYnV0IGFueSBlbGVtZW50IGNhbiBiZSBwb3NpdGlvbmVkIHJlbGF0aXZlIHRvIHRoaXMuXG4qL1xuZXhwb3J0IGludGVyZmFjZSBUcmFuc2Zvcm0ge1xuXHR4OiBudW1iZXI7XG5cdHk6IG51bWJlcjtcblx0em9vbVg6IG51bWJlcjtcblx0em9vbVk6IG51bWJlcjtcblx0cm90YXRpb246IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIEJhc2ljVHJhbnNmb3JtIGltcGxlbWVudHMgVHJhbnNmb3JtIHtcblxuICAgIHN0YXRpYyByZWFkb25seSB1bml0VHJhbnNmb3JtID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDEsIDEsIDApO1xuXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB4OiBudW1iZXIsIHB1YmxpYyB5OiBudW1iZXIsIFxuXHRcdHB1YmxpYyB6b29tWDogbnVtYmVyLCBwdWJsaWMgem9vbVk6IG51bWJlciwgXG5cdFx0cHVibGljIHJvdGF0aW9uOiBudW1iZXIpe31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbWJpbmVUcmFuc2Zvcm0oY2hpbGQ6IFRyYW5zZm9ybSwgY29udGFpbmVyOiBUcmFuc2Zvcm0pOiBUcmFuc2Zvcm0ge1xuXHRsZXQgem9vbVggPSBjaGlsZC56b29tWCAqIGNvbnRhaW5lci56b29tWDtcblx0Ly9jb25zb2xlLmxvZyhcIm1vZGlmaWVkIFwiICsgY2hpbGQuem9vbVggKyBcIiB0byBcIiArIHpvb21YKTtcblx0bGV0IHpvb21ZID0gY2hpbGQuem9vbVkgKiBjb250YWluZXIuem9vbVk7XG5cdC8vY29uc29sZS5sb2coXCJtb2RpZmllZCBcIiArIGNoaWxkLnpvb21ZICsgXCIgYnkgXCIgKyBjb250YWluZXIuem9vbVkgKyBcIiB0byBcIiArIHpvb21ZKTtcblx0bGV0IHggPSAoY2hpbGQueCAqIGNvbnRhaW5lci56b29tWCkgKyBjb250YWluZXIueDtcblx0bGV0IHkgPSAoY2hpbGQueSAqIGNvbnRhaW5lci56b29tWSkgKyBjb250YWluZXIueTtcblx0Ly9jb25zb2xlLmxvZyhcIm1vZGlmaWVkIHggXCIgKyBjaGlsZC54ICsgXCIgYnkgXCIgKyBjb250YWluZXIuem9vbVggKyBcIiBhbmQgXCIgKyBjb250YWluZXIueCArIFwiIHRvIFwiICsgeCk7XG5cdGxldCByb3RhdGlvbiA9IGNoaWxkLnJvdGF0aW9uICsgY29udGFpbmVyLnJvdGF0aW9uO1xuXHRyZXR1cm4gbmV3IEJhc2ljVHJhbnNmb3JtKHgsIHksIHpvb21YLCB6b29tWSwgcm90YXRpb24pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUodHJhbnNmb3JtOiBUcmFuc2Zvcm0pOiBUcmFuc2Zvcm0ge1xuXHRyZXR1cm4gbmV3IEJhc2ljVHJhbnNmb3JtKHRyYW5zZm9ybS54LCB0cmFuc2Zvcm0ueSwgXG5cdFx0dHJhbnNmb3JtLnpvb21YLCB0cmFuc2Zvcm0uem9vbVksIHRyYW5zZm9ybS5yb3RhdGlvbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnRUcmFuc2Zvcm0od29ybGRTdGF0ZTogVHJhbnNmb3JtKTogVHJhbnNmb3JtIHtcblx0cmV0dXJuIG5ldyBCYXNpY1RyYW5zZm9ybSgtd29ybGRTdGF0ZS54LCAtd29ybGRTdGF0ZS55LCBcblx0XHQxL3dvcmxkU3RhdGUuem9vbVgsIDEvd29ybGRTdGF0ZS56b29tWSwgLXdvcmxkU3RhdGUucm90YXRpb24pO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFZpZXdUcmFuc2Zvcm0gZXh0ZW5kcyBUcmFuc2Zvcm0ge1xuXHR3aWR0aDogbnVtYmVyO1xuXHRoZWlnaHQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIEJhc2ljVmlld1RyYW5zZm9ybSBleHRlbmRzIEJhc2ljVHJhbnNmb3JtIGltcGxlbWVudHMgVmlld1RyYW5zZm9ybSB7XG5cblx0Y29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIFxuXHRcdHJlYWRvbmx5IHdpZHRoOiBudW1iZXIsIHJlYWRvbmx5IGhlaWdodDogbnVtYmVyLFxuXHRcdHpvb21YOiBudW1iZXIsIHpvb21ZOiBudW1iZXIsIFxuXHQgICAgcm90YXRpb246IG51bWJlcil7XG5cblx0XHRzdXBlcih4LCB5LCB6b29tWCwgem9vbVksIHJvdGF0aW9uKTtcblx0fVxuXG59XG5cblxuXG4iLCJpbXBvcnQgeyBWaWV3VHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgQ2FudmFzVmlldyB9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcblxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTW91c2VDb250cm9sbGVyIHtcblxuICAgIG1vdXNlUG9zaXRpb24oZXZlbnQ6IE1vdXNlRXZlbnQsIHdpdGhpbjogSFRNTEVsZW1lbnQpOiBBcnJheTxudW1iZXI+IHtcbiAgICAgICAgbGV0IG1fcG9zeCA9IGV2ZW50LmNsaWVudFggKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnRcbiAgICAgICAgICAgICAgICAgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdDtcbiAgICAgICAgbGV0IG1fcG9zeSA9IGV2ZW50LmNsaWVudFkgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7XG5cbiAgICAgICAgdmFyIGVfcG9zeCA9IDA7XG4gICAgICAgIHZhciBlX3Bvc3kgPSAwO1xuXG4gICAgICAgIGlmICh3aXRoaW4ub2Zmc2V0UGFyZW50KXtcbiAgICAgICAgICAgIGRvIHsgXG4gICAgICAgICAgICAgICAgZV9wb3N4ICs9IHdpdGhpbi5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgICAgIGVfcG9zeSArPSB3aXRoaW4ub2Zmc2V0VG9wO1xuICAgICAgICAgICAgfSB3aGlsZSAod2l0aGluID0gPEhUTUxFbGVtZW50PndpdGhpbi5vZmZzZXRQYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFttX3Bvc3ggLSBlX3Bvc3gsIG1fcG9zeSAtIGVfcG9zeV07XG4gICAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBWaWV3Q29udHJvbGxlciBleHRlbmRzIE1vdXNlQ29udHJvbGxlciB7XG5cblx0cmVjb3JkOiBib29sZWFuO1xuXHRtb3ZlOiBudW1iZXIgPSAxO1xuXG5cdHByaXZhdGUgeFByZXZpb3VzOiBudW1iZXI7XG5cdHByaXZhdGUgeVByZXZpb3VzOiBudW1iZXI7XG5cblx0Y29uc3RydWN0b3Iodmlld1RyYW5zZm9ybTogVmlld1RyYW5zZm9ybSwgXG4gICAgICAgIHJlYWRvbmx5IGRyYWdFbGVtZW50OiBIVE1MRWxlbWVudCwgcmVhZG9ubHkgY2FudmFzVmlldzogQ2FudmFzVmlldykge1xuXG4gICAgXHRzdXBlcigpO1xuICAgIFx0ZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm0pKTtcbiAgICBcdGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3VHJhbnNmb3JtKSk7XG4gICAgICAgIGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm0pKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5yZWNvcmQgPSBmYWxzZSk7XG4gICAgICAgIGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkYmxjbGlja1wiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuY2xpY2tlZChlIGFzIE1vdXNlRXZlbnQsIGNhbnZhc1ZpZXcsIDEuMikpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwid2hlZWxcIiwgKGU6IEV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMud2hlZWwoZSBhcyBXaGVlbEV2ZW50LCBjYW52YXNWaWV3KSk7XG4gICAgfVxuXG4gICAgY2xpY2tlZChldmVudDogTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybTogVmlld1RyYW5zZm9ybSwgem9vbUJ5OiBudW1iZXIpe1xuICAgIFx0c3dpdGNoKGV2ZW50LnR5cGUpe1xuICAgIFx0XHRjYXNlIFwiZGJsY2xpY2tcIjpcbiAgICAgICAgICAgICAgICBpZiAgKGV2ZW50LmN0cmxLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgem9vbUJ5ID0gMSAvIHpvb21CeTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbGV0IG1YWSA9IHRoaXMubW91c2VQb3NpdGlvbihldmVudCwgdGhpcy5kcmFnRWxlbWVudCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuem9vbUFib3V0KG1YWVswXSwgbVhZWzFdLCB6b29tQnkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3LmRyYXcoKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmFnZ2VkKGV2ZW50OiBNb3VzZUV2ZW50LCB2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtKSB7XG5cbiAgICBcdHN3aXRjaChldmVudC50eXBlKXtcbiAgICBcdFx0Y2FzZSBcIm1vdXNlZG93blwiOlxuICAgIFx0XHRcdHRoaXMucmVjb3JkID0gdHJ1ZTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIm1vdXNldXBcIjpcbiAgICBcdFx0XHR0aGlzLnJlY29yZCA9IGZhbHNlO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRkZWZhdWx0OlxuICAgIFx0XHRcdGlmICh0aGlzLnJlY29yZCl7XG4gICAgICAgICAgICAgICAgICAgIGxldCB4RGVsdGEgPSAoZXZlbnQuY2xpZW50WCAtIHRoaXMueFByZXZpb3VzKSAvIHRoaXMubW92ZSAvIHZpZXdUcmFuc2Zvcm0uem9vbVg7XG4gICAgICAgICAgICAgICAgICAgIGxldCB5RGVsdGEgPSAoZXZlbnQuY2xpZW50WSAtIHRoaXMueVByZXZpb3VzKSAvIHRoaXMubW92ZSAvIHZpZXdUcmFuc2Zvcm0uem9vbVk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmlld1RyYW5zZm9ybS54ID0gdmlld1RyYW5zZm9ybS54IC0geERlbHRhO1xuICAgICAgICAgICAgICAgICAgICB2aWV3VHJhbnNmb3JtLnkgPSB2aWV3VHJhbnNmb3JtLnkgLSB5RGVsdGE7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3LmRyYXcoKTtcbiAgICBcdFx0XHR9XG5cblx0XHRcdHRoaXMueFByZXZpb3VzID0gZXZlbnQuY2xpZW50WDtcblx0XHRcdHRoaXMueVByZXZpb3VzID0gZXZlbnQuY2xpZW50WTtcbiAgICBcdH1cbiAgICB9XG5cbiAgICB3aGVlbChldmVudDogV2hlZWxFdmVudCwgdmlld1RyYW5zZm9ybTogVmlld1RyYW5zZm9ybSkge1xuXG4gICAgICAgIC8vY29uc29sZS5sb2coXCJ3aGVlbFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQudHlwZSk7XG5cbiAgICAgICAgbGV0IHhEZWx0YSA9IGV2ZW50LmRlbHRhWCAvIHRoaXMubW92ZSAvIHZpZXdUcmFuc2Zvcm0uem9vbVg7XG4gICAgICAgIGxldCB5RGVsdGEgPSBldmVudC5kZWx0YVkgLyB0aGlzLm1vdmUgLyB2aWV3VHJhbnNmb3JtLnpvb21ZO1xuXG4gICAgICAgIGlmICAoZXZlbnQuY3RybEtleSkge1xuICAgICAgICAgICAgbGV0IG1YWSA9IHRoaXMubW91c2VQb3NpdGlvbihldmVudCwgdGhpcy5kcmFnRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgYnkgPSAxLjA1O1xuICAgICAgICAgICAgaWYgKHlEZWx0YSA8IDApe1xuICAgICAgICAgICAgICAgIGJ5ID0gMC45NTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3Lnpvb21BYm91dChtWFlbMF0sIG1YWVsxXSwgYnkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3LnggPSAgdGhpcy5jYW52YXNWaWV3LnggKyB4RGVsdGE7XG4gICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcueSA9ICB0aGlzLmNhbnZhc1ZpZXcueSArIHlEZWx0YTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5jYW52YXNWaWV3LmRyYXcoKTtcbiAgICB9XG5cbn1cbiIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1xuXHRcIm5hbWVcIjogXCIyLTJcIiwgXCJ4XCI6IC0zNjQsIFwieVwiOiAtMTIuNSwgXCJ6b29tWFwiOiAwLjIxMywgXCJ6b29tWVwiOiAwLjIwNSwgXCJyb3RhdGlvblwiOiAtMC4zMSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDAycl8yW1NWQzJdLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjNcIiwgXCJ4XCI6IC0yMTYsIFwieVwiOiAtMC43MDUsIFwiem9vbVhcIjogMC4yLCBcInpvb21ZXCI6IDAuMjEsIFwicm90YXRpb25cIjogLTAuNTEsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwM3JbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiNFwiLCBcInhcIjogLTc0LjI5LCBcInlcIjogLTk5Ljc4LCBcInpvb21YXCI6IDAuMjIyLCBcInpvb21ZXCI6IDAuMjA4LCBcInJvdGF0aW9uXCI6IC0wLjI4NSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA0cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI1XCIsIFwieFwiOiAtMzY2LjUsIFwieVwiOiAxODAuMDE5LCBcInpvb21YXCI6IDAuMjE1LCBcInpvb21ZXCI6IDAuMjA3LCBcInJvdGF0aW9uXCI6IC0wLjIxLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDVyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjZcIiwgXCJ4XCI6IC0yMDYuMTYsIFwieVwiOiAxNDYsIFwiem9vbVhcIjogMC4yMSwgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAtMC4yMTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwNnJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiN1wiLCBcInhcIjogLTYzLjMsIFwieVwiOiAxMDAuMzc3NiwgXCJ6b29tWFwiOiAwLjIxMjUsIFwiem9vbVlcIjogMC4yMTMsIFwicm90YXRpb25cIjogLTAuMjMsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwN3JbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiOFwiLCBcInhcIjogNzguMSwgXCJ5XCI6IDU4LjUzNSwgXCJ6b29tWFwiOiAwLjIwNywgXCJ6b29tWVwiOiAwLjIxNywgXCJyb3RhdGlvblwiOiAtMC4yNSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA4cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI5XCIsIFwieFwiOiAyMTkuNSwgXCJ5XCI6IDI0LCBcInpvb21YXCI6IDAuMjE1LCBcInpvb21ZXCI6IDAuMjE0NSwgXCJyb3RhdGlvblwiOiAtMC4yNixcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDlyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjEwXCIsIFwieFwiOiA0NTQuMjEsIFwieVwiOiAtMS41LCBcInpvb21YXCI6IDAuMjE4LCBcInpvb21ZXCI6IDAuMjE0LCBcInJvdGF0aW9uXCI6IDAuMDE1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTByXzJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTFcIiwgXCJ4XCI6IDYyMS44NiwgXCJ5XCI6IDI1LjUyNSwgXCJ6b29tWFwiOiAwLjIxMywgXCJ6b29tWVwiOiAwLjIxMTUsIFwicm90YXRpb25cIjogMC4xMSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDExcltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSwgXG5cdHtcblx0XCJuYW1lXCI6IFwiMTItMVwiLCBcInhcIjogNzY5LjY0NSwgXCJ5XCI6IDUwLjI2NSwgXCJ6b29tWFwiOiAwLjQyNCwgXCJ6b29tWVwiOiAwLjQyMiwgXCJyb3RhdGlvblwiOiAwLjEyLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTJyXzFbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTRcIiwgXCJ4XCI6IC05MTUuNiwgXCJ5XCI6IDU1Ny44NjUsIFwiem9vbVhcIjogMC4yMDgsIFwiem9vbVlcIjogMC4yMDgsIFwicm90YXRpb25cIjogLTEuMjE1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTRSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE1LTJcIiwgXCJ4XCI6IC03MTcuMywgXCJ5XCI6IDU3MiwgXCJ6b29tWFwiOiAwLjIxLCBcInpvb21ZXCI6IDAuMjA2LCBcInJvdGF0aW9uXCI6IC0xLjQ3LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTVyXzJbU1ZDMl0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTYtMlwiLCBcInhcIjogLTkyLCBcInlcIjogMzM2LjUsIFwiem9vbVhcIjogMC4yMTcsIFwiem9vbVlcIjogMC4yMSwgXCJyb3RhdGlvblwiOiAtMC4xLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTZyXzJbU1ZDMl0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTdcIiwgXCJ4XCI6IDc3LCBcInlcIjogMjc4LjUsIFwiem9vbVhcIjogMC4yMDYsIFwiem9vbVlcIjogMC4yMDYsIFwicm90YXRpb25cIjogLTAuMDU1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTdSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE4XCIsIFwieFwiOiAyMjksIFwieVwiOiAyMzkuNSwgXCJ6b29tWFwiOiAwLjIwOCwgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAwLjA3LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMThSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE5XCIsIFwieFwiOiA3MS41LCBcInlcIjogNDc0LCBcInpvb21YXCI6IDAuMjAzLCBcInpvb21ZXCI6IDAuMjA4LCBcInJvdGF0aW9uXCI6IDAuMTcsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxOVJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMjBcIiwgXCJ4XCI6IDQzLjUsIFwieVwiOiA2NDAsIFwiem9vbVhcIjogMC4xLCBcInpvb21ZXCI6IDAuMTA0LCBcInJvdGF0aW9uXCI6IDAuMjA1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMjBSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9XG5cbl1cblxuXG5cbiIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1xuXHRcdFwibmFtZVwiOiBcImhlbnJpZXR0YVwiLCBcInhcIjogLTQ4Ni41LCBcInlcIjogLTI1Mi41LCBcInpvb21YXCI6IDAuMjksIFwiem9vbVlcIjogMC41LCBcInJvdGF0aW9uXCI6IDAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9oZW5yaWV0dGEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibWF0ZXJcIiwgXCJ4XCI6IC0zNDIsIFwieVwiOiAtNzQ3LCBcInpvb21YXCI6IDAuMDgsIFwiem9vbVlcIjogMC4xOCwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21hdGVybWlzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInBldGVyc1wiLCBcInhcIjogLTcxOSwgXCJ5XCI6IC04MzYsIFwiem9vbVhcIjogMC4wNywgXCJ6b29tWVwiOiAwLjE0LCBcInJvdGF0aW9uXCI6IC0wLjE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvcGV0ZXJzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm9jb25uZWxsXCIsIFwieFwiOiAtODIxLCBcInlcIjogLTE4MzUsIFwiem9vbVhcIjogMC4yNSwgXCJ6b29tWVwiOiAwLjI1LCBcInJvdGF0aW9uXCI6IDAsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9vY29ubmVsbC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImZvdXJjb3VydHNcIiwgXCJ4XCI6IC01NjcuNSwgXCJ5XCI6IDMyMy41LCBcInpvb21YXCI6IDAuMTYsIFwiem9vbVlcIjogMC4zMjgsIFwicm90YXRpb25cIjogLTAuMTIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9mb3VyY291cnRzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibWljaGFuc1wiLCBcInhcIjogLTYzOSwgXCJ5XCI6IDE2MCwgXCJ6b29tWFwiOiAwLjE0LCBcInpvb21ZXCI6IDAuMjQsIFwicm90YXRpb25cIjogMC4wMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21pY2hhbnMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ0aGVjYXN0bGVcIiwgXCJ4XCI6IC0yOTAsIFwieVwiOiA1MjAsIFwiem9vbVhcIjogMC4yMiwgXCJ6b29tWVwiOiAwLjQyLCBcInJvdGF0aW9uXCI6IC0wLjAxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL3RoZWNhc3RsZS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtYXJrZXRcIiwgXCJ4XCI6IC02MTcsIFwieVwiOiA1NjUsIFwiem9vbVhcIjogMC4xNSwgXCJ6b29tWVwiOiAwLjI2LCBcInJvdGF0aW9uXCI6IDAuMDQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9tYXJrZXQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJwYXRyaWNrc1wiLCBcInhcIjogLTQ2MiwgXCJ5XCI6IDc5NSwgXCJ6b29tWFwiOiAwLjEsIFwiem9vbVlcIjogMC4xMiwgXCJyb3RhdGlvblwiOiAwLjA0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvcGF0cmlja3MucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJuZ2lyZWxhbmRcIiwgXCJ4XCI6IDQzMSwgXCJ5XCI6IDY5NCwgXCJ6b29tWFwiOiAwLjE0LCBcInpvb21ZXCI6IDAuMzc1LCBcInJvdGF0aW9uXCI6IC0wLjEzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL25naXJlbGFuZC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjhcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImJsdWVjb2F0c1wiLCBcInhcIjogLTk5NywgXCJ5XCI6IDg2LCBcInpvb21YXCI6IDAuMSwgXCJ6b29tWVwiOiAwLjIsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9ibHVlY29hdHMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJjb2xsaW5zYmFycmFja3NcIiwgXCJ4XCI6IC0xMTMwLCBcInlcIjogOTAsIFwiem9vbVhcIjogMC4xMywgXCJ6b29tWVwiOiAwLjM3LCBcInJvdGF0aW9uXCI6IDAuMDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvY29sbGluc2JhcnJhY2tzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiaHVnaGxhbmVcIiwgXCJ4XCI6IC0xNzIsIFwieVwiOiAtMzM1LCBcInpvb21YXCI6IDAuMiwgXCJ6b29tWVwiOiAwLjMzLCBcInJvdGF0aW9uXCI6IC0wLjA2LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvaHVnaGxhbmUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJncG9cIiwgXCJ4XCI6IDUyLCBcInlcIjogNTAsIFwiem9vbVhcIjogMC4wODYsIFwiem9vbVlcIjogMC4yNSwgXCJyb3RhdGlvblwiOiAtMC4wMzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9ncG8ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtb3VudGpveVwiLCBcInhcIjogMjYzLCBcInlcIjogLTU2MCwgXCJ6b29tWFwiOiAwLjE1LCBcInpvb21ZXCI6IDAuMjg1LCBcInJvdGF0aW9uXCI6IDAuMTcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9tb3VudGpveS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm1vdW50am95YlwiLCBcInhcIjogMTUyLCBcInlcIjogLTU3MCwgXCJ6b29tWFwiOiAwLjIsIFwiem9vbVlcIjogMC4zMDUsIFwicm90YXRpb25cIjogMC4wNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21vdW50am95Yi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInJveWFsaG9zcGl0YWxcIiwgXCJ4XCI6IC0xODUxLCBcInlcIjogNDg3LjUsIFwiem9vbVhcIjogMC4yMSwgXCJ6b29tWVwiOiAwLjMsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9yb3lhbGhvc3BpdGFsLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwicGVwcGVyXCIsIFwieFwiOiA4MzQsIFwieVwiOiA5OTAsIFwiem9vbVhcIjogMC4wNiwgXCJ6b29tWVwiOiAwLjE0NSwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL3BlcHBlci5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImxpYmVydHloYWxsXCIsIFwieFwiOiAyNzAsIFwieVwiOiAtMTQsIFwiem9vbVhcIjogMC40MywgXCJ6b29tWVwiOiAwLjQzLCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbGliZXJ0eS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImN1c3RvbXNob3VzZVwiLCBcInhcIjogMzgyLCBcInlcIjogMTA3LCBcInpvb21YXCI6IDAuMTUsIFwiem9vbVlcIjogMC4zMCwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2N1c3RvbXNob3VzZS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fVxuXSIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMThcIiwgXCJ4XCI6IC0xOTQsIFwieVwiOiAtMzk1LjUsIFwiem9vbVhcIjogMC4xMiwgXCJ6b29tWVwiOiAwLjEyLCBcInJvdGF0aW9uXCI6IC0wLjYzLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTAxOC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiBCYXJsZXkgZmllbGRzIGV0Yy4gKERvcnNldCBTdHJlZXQpLiBQbGFuIG9mIG9wZW5pbmcgYSBzdHJlZXQgZnJvbSBSdXRsYW5kIFNxdWFyZSB0byBEb3JzZXQgU3RyZWV0IC0gKFBhbGFjZSBSb3cgYW5kIEdhcmRpbmVycyBSb3cpIC0gVGhvbWFzIFNoZXJyYXJkIERhdGU6IDE3ODlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAyNVwiLCBcInhcIjogLTEwMTAsIFwieVwiOiAxMDUsIFwiem9vbVhcIjogMC4xMiwgXCJ6b29tWVwiOiAwLjEyLCBcInJvdGF0aW9uXCI6IDAuMTYsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDI1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQmxhY2toYWxsIFBsYWNlIC0gTmV3IFN0cmVldCB0byB0aGUgUXVheVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDU3XCIsIFwieFwiOiAtMjI0LCBcInlcIjogMzMwLjUsIFwiem9vbVhcIjogMC4wODQsIFwiem9vbVlcIjogMC4wODQsIFwicm90YXRpb25cIjogMi44NjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDU3LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBvZiBzdHJlZXRzIGFib3V0IE1hcnnigJlzIEFiYmV5IGFuZCBCb290IExhbmUgLSAoT2xkIEJhbmspIERhdGU6IDE4MTFcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA2M1wiLCBcInhcIjogLTg4LjUsIFwieVwiOiAyNi41LCBcInpvb21YXCI6IDAuMywgXCJ6b29tWVwiOiAwLjMsIFwicm90YXRpb25cIjogLTIuMTQ1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTA2My5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkVsZXZhdGlvbiBvZiB0aGUgd2VzdCBmcm9udCBhbmQgcGxhbiBvZiBNb3VudGpveSBTcXVhcmUgbGFpZCBvdXQgb24gdGhlIHJpc2luZyBncm91bmQsIG5lYXIgR2Vvcmdl4oCZcyBDaHVyY2ggLSB0aGUgZXN0YXRlIG9mIHRoZSBSaWdodCBIb24uIEx1a2UgR2FyZGluZXIsIGFuZCBub3cgKDE3ODcpLCB0byBiZSBsZXQgZm9yIGJ1aWxkaW5nIC0gTG9yZCBNb3VudGpveeKAmXMgcGxhbi4gRGF0ZTogMTc4N1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDg3LTJcIiwgXCJ4XCI6IC0xNzIuNSwgXCJ5XCI6IDE0MTksIFwiem9vbVhcIjogMC4wODYsIFwiem9vbVlcIjogMC4wODYsIFwicm90YXRpb25cIjogLTEuNjk1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTA4Ny0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQ2FtZGVuIFN0cmVldCBVcHBlciBhbmQgQ2hhcmxvdHRlIFN0cmVldCBEYXRlOiAxODQxXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wOTBcIiwgXCJ4XCI6IC0yNjEsIFwieVwiOiA1MDUsIFwiem9vbVhcIjogMC4wNzQsIFwiem9vbVlcIjogMC4wNjYsIFwicm90YXRpb25cIjogLTAuMjMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDkwLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQ2FzdGxlIFlhcmQsIENhc3RsZSBTdHJlZXQsIERhbWUgU3RyZWV0LCBQYXJsaWFtZW50IFN0cmVldCBhbmQgdmljaW5pdHkgRGF0ZTogMTc2NFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTAwLTJcIiwgXCJ4XCI6IC01MjgsIFwieVwiOiA0NjQsIFwiem9vbVhcIjogMC4wNzgsIFwiem9vbVlcIjogMC4wNzgsIFwicm90YXRpb25cIjogLTAuMjcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTAwLTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcHJlbWlzZXMgdG8gYmUgdmFsdWVkIGJ5IEp1cnk7IENvY2sgSGlsbCwgTWljaGFlbOKAmXMgTGFuZSwgV2luZXRhdmVybiBTdHJlZXQsIEpvaG7igJlzIExhbmUsIENocmlzdGNodXJjaCwgUGF0cmljayBTdHJlZXQgYW5kIFBhdHJpY2vigJlzIENsb3NlIERhdGU6IDE4MTNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTEwM1wiLCBcInhcIjogOTkuNSwgXCJ5XCI6IDU2NiwgXCJ6b29tWFwiOiAwLjA2MiwgXCJ6b29tWVwiOiAwLjA2LCBcInJvdGF0aW9uXCI6IC0zLjE1NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xMDMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgU291dGggU2lkZSBvZiBDb2xsZWdlIEdyZWVuIGFuZCB2aWNpbml0eSBEYXRlOiAxODA4XCJcblx0fVxuXVxuIiwiaW1wb3J0IHsgQ2FudmFzVmlldyB9IGZyb20gXCIuL2d0d28vY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgU3RhdGljSW1hZ2UgfSBmcm9tIFwiLi9ndHdvL3N0YXRpY1wiO1xuaW1wb3J0IHsgQ29udGFpbmVyTGF5ZXIgfSBmcm9tIFwiLi9ndHdvL2xheWVyXCI7XG5pbXBvcnQgeyBCYXNpY1RyYW5zZm9ybSB9IGZyb20gXCIuL2d0d28vdmlld1wiO1xuaW1wb3J0IHsgU3RhdGljR3JpZCB9IGZyb20gXCIuL2d0d28vZ3JpZFwiO1xuaW1wb3J0IHsgVmlld0NvbnRyb2xsZXIgfSBmcm9tIFwiLi9ndHdvL3ZpZXdjb250cm9sbGVyXCI7XG5pbXBvcnQgeyBJbWFnZUNvbnRyb2xsZXIsIERpc3BsYXlFbGVtZW50Q29udHJvbGxlciB9IGZyb20gXCIuL2d0d28vaW1hZ2Vjb250cm9sbGVyXCI7XG5pbXBvcnQgeyBUaWxlTGF5ZXIsIFRpbGVTdHJ1Y3QsIHpvb21CeUxldmVsfSBmcm9tIFwiLi9ndHdvL3RpbGVsYXllclwiO1xuaW1wb3J0IHsgTGF5ZXJNYW5hZ2VyLCBDb250YWluZXJMYXllck1hbmFnZXIgfSBmcm9tIFwiLi9ndHdvL2xheWVybWFuYWdlclwiO1xuaW1wb3J0IHsgTGF5ZXJDb250cm9sbGVyIH0gZnJvbSBcIi4vZ3R3by9sYXllcmNvbnRyb2xsZXJcIjtcblxuaW1wb3J0ICogYXMgZmlyZW1hcHMgZnJvbSBcIi4vaW1hZ2Vncm91cHMvZmlyZW1hcHMuanNvblwiO1xuaW1wb3J0ICogYXMgbGFuZG1hcmtzIGZyb20gXCIuL2ltYWdlZ3JvdXBzL2xhbmRtYXJrcy5qc29uXCI7XG5pbXBvcnQgKiBhcyB3c2MgZnJvbSBcIi4vaW1hZ2Vncm91cHMvd3NjdC5qc29uXCI7XG5cbmxldCBsYXllclN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDEsIDEsIDApO1xubGV0IGltYWdlTGF5ZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXIobGF5ZXJTdGF0ZSk7XG5cbmxldCBpbWFnZVN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0xNDQwLC0xNDQwLCAwLjIyMiwgMC4yMjIsIDApO1xuXG5sZXQgY291bnR5U3RhdGUgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oLTI2MzEsIC0yMDUxLjUsIDEuNzE2LCAxLjY3NCwgMCk7XG5sZXQgY291bnR5SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoY291bnR5U3RhdGUsIFxuICAgIFwiaW1hZ2VzL0NvdW50eV9vZl90aGVfQ2l0eV9vZl9EdWJsaW5fMTgzN19tYXAucG5nXCIsIDAuNSwgdHJ1ZSk7XG5cbmxldCBiZ1N0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0xMTI2LC0xMDg2LCAxLjU4LCAxLjU1LCAwKTtcblxubGV0IGJnSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoYmdTdGF0ZSwgXCJpbWFnZXMvZm1zcy5qcGVnXCIsIC42LCB0cnVlKTtcblxubGV0IHRtU3RhdGUgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oLTEwMzMuNSwxNDksIDAuNTksIDAuNTksIDApO1xubGV0IHRtSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UodG1TdGF0ZSwgXCJpbWFnZXMvdGhpbmdtb3QucG5nXCIsIC4zLCB0cnVlKTtcblxubGV0IGR1U3RhdGUgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oLTkyOSwtMTA1LjUsIDAuNDY0LCAwLjUwNiwgMCk7XG5sZXQgZHVJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZShkdVN0YXRlLCBcImltYWdlcy9kdWJsaW4xNjEwLmpwZ1wiLCAuMywgZmFsc2UpO1xuXG5sZXQgZ3JpZFRyYW5zZm9ybSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgwLCAwLCAxLCAxLCAwKTtcbmxldCBzdGF0aWNHcmlkID0gbmV3IFN0YXRpY0dyaWQoZ3JpZFRyYW5zZm9ybSwgMCwgZmFsc2UsIDI1NiwgMjU2KTtcblxubGV0IHNlbnRpbmVsU3RydWN0ID0gbmV3IFRpbGVTdHJ1Y3QoXCJxdGlsZS9kdWJsaW4vXCIsIFwiLnBuZ1wiLCBcImltYWdlcy9xdGlsZS9kdWJsaW4vXCIpO1xuXG5sZXQgc2VudGluZWxUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgMiwgMiwgMCk7XG5sZXQgc2VudGluZWxMYXllciA9IG5ldyBUaWxlTGF5ZXIoc2VudGluZWxUcmFuc2Zvcm0sIHNlbnRpbmVsU3RydWN0LCB0cnVlLCAxNTgxNCwgMTA2MjEsIDE1KTtcbi8vbGV0IHNlbnRpbmVsTGF5ZXIgPSBuZXcgVGlsZUxheWVyKEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0sIHNlbnRpbmVsU3RydWN0LCAzMTYyOCwgMjEyNDIsIDE2KTtcblxuaW1hZ2VMYXllci5zZXQoXCJjb3VudHlcIiwgY291bnR5SW1hZ2UpO1xuaW1hZ2VMYXllci5zZXQoXCJiYWNrZ3JvdW5kXCIsIGJnSW1hZ2UpO1xuXG5sZXQgbGF5ZXJNYW5hZ2VyID0gbmV3IExheWVyTWFuYWdlcigpO1xuXG5sZXQgZmlyZW1hcExheWVyID0gbGF5ZXJNYW5hZ2VyLmFkZExheWVyKGZpcmVtYXBzLCBcImZpcmVtYXBzXCIpO1xubGV0IGxhbmRtYXJrc0xheWVyID0gbGF5ZXJNYW5hZ2VyLmFkZExheWVyKGxhbmRtYXJrcywgXCJsYW5kbWFya3NcIik7XG5sZXQgd3NjTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkTGF5ZXIod3NjLCBcIndzY1wiKTtcblxubGV0IGVkaXQgPSB3c2NMYXllci5nZXQoXCJ3c2MtMDE4XCIpO1xuXG5sZXQgY29udGFpbmVyTGF5ZXJNYW5hZ2VyID0gbmV3IENvbnRhaW5lckxheWVyTWFuYWdlcih3c2NMYXllcik7XG5jb250YWluZXJMYXllck1hbmFnZXIuc2V0U2VsZWN0ZWQoXCJ3c2MtMDE4XCIpO1xuXG5pbWFnZUxheWVyLnNldChcIndzY1wiLCB3c2NMYXllcik7XG4vL2ltYWdlTGF5ZXIuc2V0KFwiZmlyZW1hcHNcIiwgZmlyZW1hcExheWVyKTtcblxuLy9pbWFnZUxheWVyLnNldChcImR1YmxpbjE2MTBcIiwgZHVJbWFnZSk7XG4vL2ltYWdlTGF5ZXIuc2V0KFwidGhpbmdtb3RcIiwgdG1JbWFnZSk7XG4vL2ltYWdlTGF5ZXIuc2V0KFwibGFuZG1hcmtzXCIsIGxhbmRtYXJrc0xheWVyKTtcblxud3NjTGF5ZXIuc2V0VG9wKFwid3NjLTEwM1wiKTtcblxuZnVuY3Rpb24gc2hvd01hcChkaXZOYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGNhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChkaXZOYW1lKTtcbiAgICBsZXQgY2FudmFzVHJhbnNmb3JtID0gbmV3IEJhc2ljVHJhbnNmb3JtKC01MTIsIC01MTIsIDAuNSwgMC41LCAwKTtcbiAgICBsZXQgY2FudmFzVmlldyA9IG5ldyBDYW52YXNWaWV3KGNhbnZhc1RyYW5zZm9ybSwgY2FudmFzLmNsaWVudFdpZHRoLCBjYW52YXMuY2xpZW50SGVpZ2h0LCBjYW52YXMpO1xuXG4gICAgY2FudmFzVmlldy5sYXllcnMucHVzaChzZW50aW5lbExheWVyKTtcbiAgICBjYW52YXNWaWV3LmxheWVycy5wdXNoKGltYWdlTGF5ZXIpO1xuICAgIGNhbnZhc1ZpZXcubGF5ZXJzLnB1c2goc3RhdGljR3JpZCk7XG5cbiAgICBsZXQgdGlsZUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHNlbnRpbmVsTGF5ZXIsIFwidlwiKTtcbiAgICBsZXQgYmFzZUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGJnSW1hZ2UsIFwiQlwiKTtcbiAgICBsZXQgY291bnR5Q29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgY291bnR5SW1hZ2UsIFwiVlwiKTtcbiAgICBsZXQgZmlyZW1hcENvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGZpcmVtYXBMYXllciwgXCJiXCIpO1xuICAgIGxldCB3c2NDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCB3c2NMYXllciwgXCJuXCIpO1xuICAgIGxldCBsYW5kbWFya0NvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGxhbmRtYXJrc0xheWVyLCBcIm1cIik7XG4gICAgbGV0IHRtQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgdG1JbWFnZSwgXCJOXCIpO1xuICAgIGxldCBkdUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGR1SW1hZ2UsIFwiTVwiKTtcbiAgICBsZXQgZ3JpZENvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHN0YXRpY0dyaWQsIFwiZ1wiKTtcblxuICAgIGxldCBjb250cm9sbGVyID0gbmV3IFZpZXdDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGNhbnZhcywgY2FudmFzVmlldyk7XG5cbiAgICBsZXQgaW1hZ2VDb250cm9sbGVyID0gbmV3IEltYWdlQ29udHJvbGxlcihjYW52YXNWaWV3LCBlZGl0KTtcblxuICAgIGxldCBsYXllckNvbnRyb2xsZXIgPSBuZXcgTGF5ZXJDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGNvbnRhaW5lckxheWVyTWFuYWdlcik7XG5cbiAgICBkcmF3TWFwKGNhbnZhc1ZpZXcpO1xuXG59XG5cbmZ1bmN0aW9uIGRyYXdNYXAoY2FudmFzVmlldzogQ2FudmFzVmlldyl7XG4gICAgaWYgKCFjYW52YXNWaWV3LmRyYXcoKSApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJJbiB0aW1lb3V0XCIpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGRyYXdNYXAoY2FudmFzVmlldyl9LCA1MDApO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc2hvdygpe1xuXHRzaG93TWFwKFwiY2FudmFzXCIsIFwiVHlwZVNjcmlwdFwiKTtcbn1cblxuaWYgKFxuICAgIGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIiB8fFxuICAgIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSBcImxvYWRpbmdcIiAmJiAhZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmRvU2Nyb2xsKVxuKSB7XG5cdHNob3coKTtcbn0gZWxzZSB7XG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIHNob3cpO1xufSJdfQ==
