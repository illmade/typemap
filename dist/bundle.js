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
    let xnew = px * c + py * s;
    let ynew = py * c - px * s;
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
    toString() {
        return "Dimension(" + this.x + ", " + this.y + ", " + this.w + ", " + this.h + ")";
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
    setLayerOutline(layerOutline) {
        this.layerOutline = layerOutline;
    }
    pressed(canvasView, event) {
        console.log("pressed" + event.target + ", " + event.key);
        let multiplier = 1;
        switch (event.key) {
            case "a":
                this.canvasLayer.x = this.canvasLayer.x - 0.5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "A":
                this.canvasLayer.x = this.canvasLayer.x - 5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "d":
                this.canvasLayer.x = this.canvasLayer.x + 0.5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "D":
                this.canvasLayer.x = this.canvasLayer.x + 5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "w":
                this.canvasLayer.y = this.canvasLayer.y - 0.5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "W":
                this.canvasLayer.y = this.canvasLayer.y - 5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "s":
                this.canvasLayer.y = this.canvasLayer.y + 0.5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "S":
                this.canvasLayer.y = this.canvasLayer.y + 5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "e":
                this.canvasLayer.rotation = this.canvasLayer.rotation - 0.005;
                this.updateCanvas(canvasView);
                break;
            case "E":
                this.canvasLayer.rotation = this.canvasLayer.rotation - 0.05;
                this.updateCanvas(canvasView);
                break;
            case "q":
                this.canvasLayer.rotation = this.canvasLayer.rotation + 0.005;
                this.updateCanvas(canvasView);
                break;
            case "Q":
                this.canvasLayer.rotation = this.canvasLayer.rotation + 0.05;
                this.updateCanvas(canvasView);
                break;
            case "x":
                this.canvasLayer.zoomX = this.canvasLayer.zoomX - 0.002 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "X":
                this.canvasLayer.zoomX = this.canvasLayer.zoomX + 0.002 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "z":
                this.canvasLayer.zoomY = this.canvasLayer.zoomY - 0.002 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "Z":
                this.canvasLayer.zoomY = this.canvasLayer.zoomY + 0.002 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "c":
                this.canvasLayer.setVisible(!this.canvasLayer.visible);
                this.updateCanvas(canvasView);
                break;
            case "T":
                this.canvasLayer.opacity = Math.min(1.0, this.canvasLayer.opacity + 0.1);
                this.updateCanvas(canvasView);
                break;
            case "t":
                this.canvasLayer.opacity = Math.max(0, this.canvasLayer.opacity - 0.1);
                this.updateCanvas(canvasView);
                break;
            default:
                // code...
                break;
        }
        console.log('"name": "wsc-100-2", "x": ' + this.canvasLayer.x +
            ', "y": ' + this.canvasLayer.y +
            ', "zoomX": ' + this.canvasLayer.zoomX +
            ', "zoomY": ' + this.canvasLayer.zoomY +
            ', "rotation": ' + this.canvasLayer.rotation);
        //console.log("image at: " +  this.canvasLayer.x + ", " + this.canvasLayer.y);
        //console.log("image ro sc: " +  this.canvasLayer.rotation + ", " + this.canvasLayer.zoomX + ", " + this.canvasLayer.zoomY);
    }
    ;
    updateCanvas(canvasView) {
        if (this.layerOutline != undefined) {
            let newDimension = this.canvasLayer.getDimension();
            //console.log("image outline " + newDimension);
            this.layerOutline.updateDimension(newDimension);
        }
        canvasView.draw();
    }
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
        let layerRect = new static_1.RectLayer(layer.getDimension(), 1, true);
        let layerName = "outline"; //name + "_o"
        this.containerLayer.set(layerName, layerRect);
        return layerRect;
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
            let p1 = point2d_1.rotate(new point2d_1.Point2D(width, 0), this.rotation);
            let p2 = point2d_1.rotate(new point2d_1.Point2D(width, -height), this.rotation);
            let p3 = point2d_1.rotate(new point2d_1.Point2D(0, -height), this.rotation);
            let minX = Math.min(0, p1.x, p2.x, p3.x);
            let minY = Math.min(0, p1.y, p2.y, p3.y);
            let maxX = Math.max(0, p1.x, p2.x, p3.x);
            let maxY = Math.max(0, p1.y, p2.y, p3.y);
            console.log("minx: " + minX);
            console.log("height: " + (maxY - minY));
            return new point2d_1.Dimension(this.x + minX, this.y - maxY, maxX - minX, maxY - minY);
        }
        return new point2d_1.Dimension(this.x, this.y, 0, 0);
    }
}
exports.StaticImage = StaticImage;
class RectLayer extends layer_1.DrawLayer {
    constructor(dimension, opacity, visible) {
        super(new view_1.BasicTransform(dimension.x, dimension.y, 1, 1, 0), opacity, visible);
        this.dimension = dimension;
    }
    updateDimension(dimension) {
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
		"src": "images/wsc/wsc-maps-075-m.png", "visible": true, "opacity": 0.7,
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
	},
	{
		"name": "wsc-055", "x": -1775, "y": -1446, "zoomX": 1.11, "zoomY": 1.162, "rotation": 0.015, 
		"src": "images/wsc/wsc-055.png", "visible": true, "opacity": 0.5,
		"description": "Plan of Mail Coach Road, through Blessington Street to Cabra, of New Line Road, being part of the Navan Turnpike Road and connecting an improvement lately made upon that Line with the City of Dublin - showing the most direct line and also a Circuitons line whereby the expense of a Bridge across the Royal Canal may be avoided. Done by His Majesty's Post Masters of Ireland by Mr. Larkin Date: 1818"
	},
	{
		"name": "wsc-060", "x": -104.5, "y": -1, "zoomX": 0.674, "zoomY": 0.702, "rotation": 3.165, 
		"src": "images/wsc/wsc-60.png", "visible": true, "opacity": 0.5,
		"description": "Map showing the alterations proposed in the new line of road, leading from Dublin to Navan, commencing at Blessington Street; passing along the Circular Road to Prussia Street, and hence along the Turnpike Road to Ratoath, and terminating at the Turnpike"
	},
	{
		"name": "wsc-065", "x": -545.5, "y": -275, "zoomX": 0.298, "zoomY": 0.292, "rotation": -1.05, 
		"src": "images/wsc/wsc-065.png", "visible": true, "opacity": 0.5,
		"description": "Map showing Mountjoy Street, Dorset Street, Dominick Street and vicinity - plan of Saint Mary’s Chapel of Ease, and proposed opening leading thereunto from Granby Row - Thomas Sherrard 30 Nov 1827"
	},
	{
		"name": "wsc-012", "x": -125.5, "y": 149.5, "zoomX": 0.044, "zoomY": 0.044, "rotation": -0.22, 
		"src": "images/wsc/wsc-012.png", "visible": true, "opacity": 0.5,
		"description": "Map of premises Lower Abbey Street, Lower Sackville Street and Eden Quay"
	},
	{
		"name": "wsc-014", "x": -1555.5, "y": 27, "zoomX": 0.14, "zoomY": 0.14, "rotation": 0.055, 
		"src": "images/wsc/wsc-014.png", "visible": true, "opacity": 0.5,
		"description": "A survey of ground contiguous to the Horse Barracks, Dublin - showing Montpelier Hill, Barrack Street, Parkgate Street and environs (Thomas Sherrard) Date: 1790"
	},
	{
		"name": "wsc-015", "x": -1414.5, "y": 29, "zoomX": 0.116, "zoomY": 0.112, "rotation": 0.075, 
		"src": "images/wsc/wsc-015.png", "visible": true, "opacity": 0.5,
		"description": "Arbour Hill, Royal Barracks and vicinity. With reference. Date: 1790"
	},
	{
		"name": "wsc-016", "x": -847, "y": 231.5, "zoomX": 0.038, "zoomY": 0.038, "rotation": 0.095, 
		"src": "images/wsc/wsc-016.png", "visible": true, "opacity": 0.5,
		"description": "Map - Arran Quay, Queen Street Date:1790"
	},
	{
		"name": "wsc-017", "x": -564, "y": 440, "zoomX": 0.068, "zoomY": 0.06, "rotation": 3.39, 
		"src": "images/wsc/wsc-017.png", "visible": true, "opacity": 0.5,
		"description": "Arran Quay, Church Street"
	},
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
	},
	{
		"name": "wsc-149-1", "x": -1091, "y": 515.5, "zoomX": 0.062, "zoomY": 0.06, "rotation": 0, 
		"src": "images/wsc/wsc-149-1.png", "visible": true, "opacity": 0.8,
		"description": "Map - James’s Gate, James Street, Thomas Street and Watling Street. Mr. Guinness’s Place Date: 1845"
	},
	{
		"name": "wsc-149-2", "x": -1074.5, "y": 488, "zoomX": 0.044, "zoomY": 0.048, "rotation": 0, 
		"src": "images/wsc/wsc-149-2.png", "visible": true, "opacity": 0.5,
		"description": "Map - James’s Gate, James Street, Thomas Street and Watling Street. Mr. Guinness’s Place Date: 1845"
	},
	{
		"name": "wsc-254", "x": -438, "y": -142, "zoomX": 0.118, "zoomY": 0.12, "rotation": -0.415, 
		"src": "images/wsc/wsc-254.png", "visible": true, "opacity": 0.5,
		"description": "Map of Mabbot Street, Montgomery Street, Dominick Street, Cherry Lane, Cross Lane and Turn-again-Lane Date: 1801"
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
let edit = wscLayer.get("wsc-254");
let containerLayerManager = new layermanager_1.ContainerLayerManager(wscLayer);
let outlineLayer = containerLayerManager.setSelected("wsc-254");
imageLayer.set("wsc", wscLayer);
//imageLayer.set("firemaps", firemapLayer);
//imageLayer.set("dublin1610", duImage);
//imageLayer.set("thingmot", tmImage);
//imageLayer.set("landmarks", landmarksLayer);
wscLayer.setTop("wsc-254");
function showMap(divName, name) {
    const canvas = document.getElementById(divName);
    let x = outlineLayer.x;
    let y = outlineLayer.y;
    let canvasTransform = new view_1.BasicTransform(x - 100, y - 100, 0.5, 0.5, 0);
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
    imageController.setLayerOutline(outlineLayer);
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

},{"./gtwo/canvasview":2,"./gtwo/grid":3,"./gtwo/imagecontroller":4,"./gtwo/layer":5,"./gtwo/layercontroller":6,"./gtwo/layermanager":7,"./gtwo/static":8,"./gtwo/tilelayer":9,"./gtwo/view":10,"./gtwo/viewcontroller":11,"./imagegroups/firemaps.json":12,"./imagegroups/landmarks.json":13,"./imagegroups/wsc.json":14}]},{},[15])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2d0d28vY2FudmFzdmlldy50cyIsInNyYy9ndHdvL2dyaWQudHMiLCJzcmMvZ3R3by9pbWFnZWNvbnRyb2xsZXIudHMiLCJzcmMvZ3R3by9sYXllci50cyIsInNyYy9ndHdvL2xheWVyY29udHJvbGxlci50cyIsInNyYy9ndHdvL2xheWVybWFuYWdlci50cyIsInNyYy9ndHdvL3N0YXRpYy50cyIsInNyYy9ndHdvL3RpbGVsYXllci50cyIsInNyYy9ndHdvL3ZpZXcudHMiLCJzcmMvZ3R3by92aWV3Y29udHJvbGxlci50cyIsInNyYy9pbWFnZWdyb3Vwcy9maXJlbWFwcy5qc29uIiwic3JjL2ltYWdlZ3JvdXBzL2xhbmRtYXJrcy5qc29uIiwic3JjL2ltYWdlZ3JvdXBzL3dzYy5qc29uIiwic3JjL3NpbXBsZVdvcmxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNDQSxNQUFhLE9BQU87SUFPaEIsWUFBWSxDQUFTLEVBQUUsQ0FBUztRQUM1QixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFRSxRQUFRO1FBQ0osT0FBTyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDckQsQ0FBQzs7QUFiZSxZQUFJLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3pCLFdBQUcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFGNUMsMEJBZ0JDO0FBRUQsU0FBZ0IsTUFBTSxDQUNwQixLQUFjLEVBQ2QsS0FBYSxFQUNiLFFBQWlCLElBQUksT0FBTyxDQUFDLENBQUMsRUFBQyxDQUFD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Q0FBQztRQUNsQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFFbEMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3hDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUUxQyxJQUFJLFVBQVUsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUM1QyxJQUFJLFFBQVEsR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUU1QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzdDLElBQUksS0FBSyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDL0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzVELElBQUksTUFBTSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFFaEQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5QyxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQy9DLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5RCxJQUFJLE9B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QyxHQUFHLE1BQU0sQ0FBQztZQUNoRCxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7U0FDbkQ7UUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzNCLENBQUM7Q0FFSjtBQTVGRCx3Q0E0RkM7OztBQ3ZIRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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VUFBVSxDQUFDLElBQUksRUFBRSxFQUFHO1FBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsVUFBVSxDQUFDLGNBQVksT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFBLENBQUEsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQ3JEO0FBQ0wsQ0FBQztBQUVELFNBQVMsSUFBSTtJQUNaLE9BQU8sQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDakMsQ0FBQztBQUVELElBQ0ksUUFBUSxDQUFDLFVBQVUsS0FBSyxVQUFVO0lBQ2xDLENBQUMsUUFBUSxDQUFDLFVBQVUsS0FBSyxTQUFTLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxFQUMzRTtJQUNELElBQUksRUFBRSxDQUFDO0NBQ1A7S0FBTTtJQUNOLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztDQUNwRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlxuZXhwb3J0IGNsYXNzIFBvaW50MkQge1xuICAgIHN0YXRpYyByZWFkb25seSB6ZXJvID0gbmV3IFBvaW50MkQoMCwgMCk7XG4gICAgc3RhdGljIHJlYWRvbmx5IG9uZSA9IG5ldyBQb2ludDJEKDEsIDEpO1xuXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xuICAgIHJlYWRvbmx5IHk6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG5cdH1cblxuICAgIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcIlBvaW50MkQoXCIgKyB0aGlzLnggKyBcIiwgXCIgKyB0aGlzLnkgKyBcIilcIjtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZShcbiAgcG9pbnQ6IFBvaW50MkQsIFxuICBhbmdsZTogbnVtYmVyLCBcbiAgYWJvdXQ6IFBvaW50MkQgPSBuZXcgUG9pbnQyRCgwLDApXG4pOiBQb2ludDJEIHtcblxuICAgIGxldCBzID0gTWF0aC5zaW4oYW5nbGUpO1xuICAgIGxldCBjID0gTWF0aC5jb3MoYW5nbGUpO1xuXG4gICAgbGV0IHB4ID0gcG9pbnQueCAtIGFib3V0Lng7XG4gICAgbGV0IHB5ID0gcG9pbnQueSAtIGFib3V0Lnk7XG5cbiAgICBsZXQgeG5ldyA9IHB4ICogYyArIHB5ICogcztcbiAgICBsZXQgeW5ldyA9IHB5ICogYyAtIHB4ICogcztcblxuICAgIHJldHVybiBuZXcgUG9pbnQyRCh4bmV3ICsgYWJvdXQueCwgeW5ldyArIGFib3V0LnkpO1xufVxuXG5leHBvcnQgY2xhc3MgRGltZW5zaW9uIHtcblxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyB4OiBudW1iZXIsIHB1YmxpYyB5OiBudW1iZXIsIHB1YmxpYyB3OiBudW1iZXIsIHB1YmxpYyBoOiBudW1iZXIpe31cblxuICAgIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcIkRpbWVuc2lvbihcIiArIHRoaXMueCArIFwiLCBcIiArIHRoaXMueSArIFwiLCBcIiArIHRoaXMudyArIFwiLCBcIiArIHRoaXMuaCArIFwiKVwiO1xuICAgIH1cblxufSIsImltcG9ydCB7IENhbnZhc0xheWVyIH0gZnJvbSBcIi4vbGF5ZXJcIjtcbmltcG9ydCB7IFxuXHRpbnZlcnRUcmFuc2Zvcm0sIFxuXHRWaWV3VHJhbnNmb3JtLCBcblx0QmFzaWNWaWV3VHJhbnNmb3JtLCBcblx0VHJhbnNmb3JtLCBcblx0QmFzaWNUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlzcGxheUVsZW1lbnQgZXh0ZW5kcyBUcmFuc2Zvcm0ge1xuXHRpc1Zpc2libGUoKTogYm9vbGVhbjtcblx0c2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdm9pZDtcblx0Z2V0T3BhY2l0eSgpOiBudW1iZXI7XG5cdHNldE9wYWNpdHkob3BhY2l0eTogbnVtYmVyKTogdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIENhbnZhc1ZpZXcgZXh0ZW5kcyBCYXNpY1ZpZXdUcmFuc2Zvcm0ge1xuXG5cdGxheWVyczogQXJyYXk8Q2FudmFzTGF5ZXI+ID0gW107XG5cdGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdGxvY2FsVHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHRcdHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBcblx0XHRyZWFkb25seSBjYW52YXNFbGVtZW50OiBIVE1MQ2FudmFzRWxlbWVudCl7XG5cblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybS54LCBsb2NhbFRyYW5zZm9ybS55LCB3aWR0aCwgaGVpZ2h0LCBcblx0XHRcdGxvY2FsVHJhbnNmb3JtLnpvb21YLCBsb2NhbFRyYW5zZm9ybS56b29tWSwgXG5cdFx0XHRsb2NhbFRyYW5zZm9ybS5yb3RhdGlvbik7XG5cblx0XHR0aGlzLmluaXRDYW52YXMoKTtcblxuXHRcdHRoaXMuY3R4ID0gY2FudmFzRWxlbWVudC5nZXRDb250ZXh0KFwiMmRcIik7XG5cdH1cblxuXHR6b29tQWJvdXQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHpvb21CeTogbnVtYmVyKXtcblxuICAgICAgICB0aGlzLnpvb21YID0gdGhpcy56b29tWCAqIHpvb21CeTtcbiAgICAgICAgdGhpcy56b29tWSA9IHRoaXMuem9vbVkgKiB6b29tQnk7XG5cbiAgICAgICAgbGV0IHJlbGF0aXZlWCA9IHggKiB6b29tQnkgLSB4O1xuICAgICAgICBsZXQgcmVsYXRpdmVZID0geSAqIHpvb21CeSAtIHk7XG5cbiAgICAgICAgbGV0IHdvcmxkWCA9IHJlbGF0aXZlWCAvIHRoaXMuem9vbVg7XG4gICAgICAgIGxldCB3b3JsZFkgPSByZWxhdGl2ZVkgLyB0aGlzLnpvb21ZO1xuXG4gICAgICAgIHRoaXMueCA9IHRoaXMueCArIHdvcmxkWDtcbiAgICAgICAgdGhpcy55ID0gdGhpcy55ICsgd29ybGRZO1xuXG5cdH1cblxuXHRkcmF3KCk6IGJvb2xlYW4ge1xuXHRcdGxldCB0cmFuc2Zvcm0gPSBpbnZlcnRUcmFuc2Zvcm0odGhpcyk7XG5cblx0XHR0aGlzLmN0eC5maWxsU3R5bGUgPSBcImdyZXlcIjtcblx0XHR0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG5cblx0XHR2YXIgZHJhd2luZ0NvbXBsZXRlID0gdHJ1ZTtcblxuXHRcdGZvciAobGV0IGxheWVyIG9mIHRoaXMubGF5ZXJzKXtcblx0XHRcdGlmIChsYXllci5pc1Zpc2libGUoKSl7XG5cdFx0XHRcdGRyYXdpbmdDb21wbGV0ZSA9IGRyYXdpbmdDb21wbGV0ZSAmJiBsYXllci5kcmF3KHRoaXMuY3R4LCBCYXNpY1RyYW5zZm9ybS51bml0VHJhbnNmb3JtLCB0aGlzKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdH1cblxuXHRcdHRoaXMuZHJhd0NlbnRyZSh0aGlzLmN0eCk7XG5cblx0XHRyZXR1cm4gZHJhd2luZ0NvbXBsZXRlO1xuXHR9XG5cblx0ZHJhd0NlbnRyZShjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpe1xuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICBjb250ZXh0Lmdsb2JhbEFscGhhID0gMC4zO1xuICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gXCJyZWRcIjtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8odGhpcy53aWR0aC8yLCA2LzE2KnRoaXMuaGVpZ2h0KTtcbiAgICAgICAgY29udGV4dC5saW5lVG8odGhpcy53aWR0aC8yLCAxMC8xNip0aGlzLmhlaWdodCk7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKDcvMTYqdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQvMik7XG4gICAgICAgIGNvbnRleHQubGluZVRvKDkvMTYqdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQvMik7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBcImJsYWNrXCI7XG4gICAgICAgIGNvbnRleHQuZ2xvYmFsQWxwaGEgPSAxO1xuICAgIH1cblxuXHRwcml2YXRlIGluaXRDYW52YXMoKXtcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5jYW52YXNFbGVtZW50LmNsaWVudFdpZHRoO1xuICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5jYW52YXNFbGVtZW50LmNsaWVudEhlaWdodDtcblxuICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LmhlaWdodCA9IGhlaWdodDtcblx0fVxuXG59IiwiaW1wb3J0IHsgRHJhd0xheWVyIH0gZnJvbSBcIi4vbGF5ZXJcIjtcbmltcG9ydCB7IFRyYW5zZm9ybSwgVmlld1RyYW5zZm9ybSwgY29tYmluZVRyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IERpbWVuc2lvbiB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuLyoqXG4qIFdlIGRvbid0IHdhbnQgdG8gZHJhdyBhIGdyaWQgaW50byBhIHRyYW5zZm9ybWVkIGNhbnZhcyBhcyB0aGlzIGdpdmVzIHVzIGdyaWQgbGluZXMgdGhhdCBhcmUgdG9vXG50aGljayBvciB0b28gdGhpblxuKi9cbmV4cG9ydCBjbGFzcyBTdGF0aWNHcmlkIGV4dGVuZHMgRHJhd0xheWVyIHtcblxuXHR6b29tV2lkdGg6IG51bWJlcjtcblx0em9vbUhlaWdodDogbnVtYmVyO1xuXG5cdGNvbnN0cnVjdG9yKGxvY2FsVHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHpvb21MZXZlbDogbnVtYmVyLCB2aXNpYmxlOiBib29sZWFuLFxuXHRcdHJlYWRvbmx5IGdyaWRXaWR0aDogbnVtYmVyID0gMjU2LCByZWFkb25seSBncmlkSGVpZ2h0OiBudW1iZXIgPSAyNTYpe1xuXG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0sIDEsIHZpc2libGUpO1xuXG5cdFx0bGV0IHpvb20gPSBNYXRoLnBvdygyLCB6b29tTGV2ZWwpO1xuXHRcdHRoaXMuem9vbVdpZHRoID0gZ3JpZFdpZHRoIC8gem9vbTtcblx0XHR0aGlzLnpvb21IZWlnaHQgPSBncmlkSGVpZ2h0IC8gem9vbTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBWaWV3VHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0XHRsZXQgb2Zmc2V0WCA9IHZpZXcueCAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IG9mZnNldFkgPSB2aWV3LnkgKiB2aWV3Lnpvb21ZO1xuXG5cdFx0bGV0IHZpZXdXaWR0aCA9IHZpZXcud2lkdGggLyB2aWV3Lnpvb21YO1xuXHRcdGxldCB2aWV3SGVpZ2h0ID0gdmlldy5oZWlnaHQgLyB2aWV3Lnpvb21ZO1xuXG5cdFx0bGV0IGdyaWRBY3Jvc3MgPSB2aWV3V2lkdGggLyB0aGlzLnpvb21XaWR0aDtcblx0XHRsZXQgZ3JpZEhpZ2ggPSB2aWV3SGVpZ2h0IC8gdGhpcy56b29tSGVpZ2h0O1xuXG5cdFx0bGV0IHhNaW4gPSBNYXRoLmZsb29yKHZpZXcueC90aGlzLnpvb21XaWR0aCk7XG5cdFx0bGV0IHhMZWZ0ID0geE1pbiAqIHRoaXMuem9vbVdpZHRoICogdmlldy56b29tWDtcblx0XHRsZXQgeE1heCA9IE1hdGguY2VpbCgodmlldy54ICsgdmlld1dpZHRoKSAvIHRoaXMuem9vbVdpZHRoKTtcblx0XHRsZXQgeFJpZ2h0ID0geE1heCAqIHRoaXMuem9vbVdpZHRoICogdmlldy56b29tWDtcblxuXHRcdGxldCB5TWluID0gTWF0aC5mbG9vcih2aWV3LnkvdGhpcy56b29tSGVpZ2h0KTtcblx0XHRsZXQgeVRvcCA9IHlNaW4gKiB0aGlzLnpvb21IZWlnaHQgKiB2aWV3Lnpvb21YO1xuXHRcdGxldCB5TWF4ID0gTWF0aC5jZWlsKCh2aWV3LnkgKyB2aWV3SGVpZ2h0KSAvIHRoaXMuem9vbUhlaWdodCk7XG5cdFx0bGV0IHlCb3R0b20gPSB5TWF4ICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWCA7XG5cblx0XHRjb25zb2xlLmxvZyhcInhNaW4gXCIgKyB4TWluICsgXCIgeE1heCBcIiArIHhNYXgpO1xuXHRcdGNvbnNvbGUubG9nKFwieU1pbiBcIiArIHlNaW4gKyBcIiB5TWF4IFwiICsgeU1heCk7XG5cblx0XHRjdHguYmVnaW5QYXRoKCk7XG5cblx0XHRmb3IgKHZhciB4ID0geE1pbjsgeDw9eE1heDsgeCsrKXtcblx0XHRcdC8vY29uc29sZS5sb2coXCJhdCBcIiArIG1pblgpO1xuXHRcdFx0bGV0IHhNb3ZlID0geCAqIHRoaXMuem9vbVdpZHRoICogdmlldy56b29tWDtcblx0XHRcdGN0eC5tb3ZlVG8oeE1vdmUgLSBvZmZzZXRYLCB5VG9wIC0gb2Zmc2V0WSk7XG5cdFx0XHRjdHgubGluZVRvKHhNb3ZlIC0gb2Zmc2V0WCwgeUJvdHRvbSAtIG9mZnNldFkpO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIHkgPSB5TWluOyB5PD15TWF4OyB5Kyspe1xuXG5cdFx0XHRsZXQgeU1vdmUgPSB5ICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWTtcblx0XHRcdGN0eC5tb3ZlVG8oeExlZnQgLSBvZmZzZXRYLCB5TW92ZSAtIG9mZnNldFkpO1xuXHRcdFx0Y3R4LmxpbmVUbyh4UmlnaHQgLSBvZmZzZXRYLCB5TW92ZSAtIG9mZnNldFkpO1xuXG5cdFx0XHRmb3IgKHZhciB4ID0geE1pbjsgeDw9eE1heDsgeCsrKXtcblx0XHRcdFx0bGV0IHhNb3ZlID0gKHgtLjUpICogdGhpcy56b29tV2lkdGggKiB2aWV3Lnpvb21YO1xuXHRcdFx0XHR5TW92ZSA9ICh5LS41KSAqIHRoaXMuem9vbUhlaWdodCAqIHZpZXcuem9vbVk7XG5cdFx0XHRcdGxldCB0ZXh0ID0gXCJcIiArICh4LTEpICsgXCIsIFwiICsgKHktMSk7XG5cdFx0XHRcdGN0eC5zdHJva2VUZXh0KHRleHQsIHhNb3ZlIC0gb2Zmc2V0WCwgeU1vdmUgLSBvZmZzZXRZKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdGNvbnNvbGUubG9nKFwiZHJldyBncmlkXCIpO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0Z2V0RGltZW5zaW9uKCk6IERpbWVuc2lvbiB7XG5cdFx0cmV0dXJuIG5ldyBEaW1lbnNpb24oMCwgMCwgMCwgMCk7XG5cdH1cbn0iLCJcbmltcG9ydCB7Q2FudmFzVmlldywgRGlzcGxheUVsZW1lbnR9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7Q2FudmFzTGF5ZXJ9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQge1JlY3RMYXllcn0gZnJvbSBcIi4vc3RhdGljXCI7XG5cbmV4cG9ydCBjbGFzcyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3IoY2FudmFzVmlldzogQ2FudmFzVmlldywgcmVhZG9ubHkgZGlzcGxheUVsZW1lbnQ6IERpc3BsYXlFbGVtZW50LCAgcHVibGljIG1vZDogc3RyaW5nID0gXCJ2XCIpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZChjYW52YXNWaWV3LCBlICBhcyBLZXlib2FyZEV2ZW50KSk7XG4gICAgfVxuXG4gICAgcHJlc3NlZChjYW52YXNWaWV3OiBDYW52YXNWaWV3LCBldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwicHJlc3NlZCBsYXllclwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQua2V5KTtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgICAgICAgICAgY2FzZSB0aGlzLm1vZDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInRvZ2dsZSB2aXNpYmxlXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheUVsZW1lbnQuc2V0VmlzaWJsZSghdGhpcy5kaXNwbGF5RWxlbWVudC5pc1Zpc2libGUoKSk7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZUNvbnRyb2xsZXIge1xuXG4gICAgcHJpdmF0ZSBjYW52YXNMYXllcjogQ2FudmFzTGF5ZXI7XG4gICAgcHJpdmF0ZSBsYXllck91dGxpbmU6IFJlY3RMYXllcjtcblxuICAgIGNvbnN0cnVjdG9yKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIGNhbnZhc0xheWVyOiBDYW52YXNMYXllcikge1xuICAgIFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5wcmVzc2VkKGNhbnZhc1ZpZXcsIGUgIGFzIEtleWJvYXJkRXZlbnQpKTtcbiAgICAgICAgdGhpcy5jYW52YXNMYXllciA9IGNhbnZhc0xheWVyO1xuICAgIH1cblxuICAgIHNldENhbnZhc0xheWVyKGNhbnZhc0xheWVyOiBDYW52YXNMYXllcil7XG4gICAgICAgIHRoaXMuY2FudmFzTGF5ZXIgPSBjYW52YXNMYXllcjtcbiAgICB9XG5cbiAgICBzZXRMYXllck91dGxpbmUobGF5ZXJPdXRsaW5lOiBSZWN0TGF5ZXIpe1xuICAgICAgICB0aGlzLmxheWVyT3V0bGluZSA9IGxheWVyT3V0bGluZTtcbiAgICB9XG5cbiAgICBwcmVzc2VkKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgXHRjb25zb2xlLmxvZyhcInByZXNzZWRcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LmtleSk7XG5cbiAgICAgICAgbGV0IG11bHRpcGxpZXIgPSAxO1xuXG4gICAgXHRzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgIFx0XHRjYXNlIFwiYVwiOlxuICAgIFx0XHRcdHRoaXMuY2FudmFzTGF5ZXIueCA9IHRoaXMuY2FudmFzTGF5ZXIueCAtIDAuNSAqIG11bHRpcGxpZXI7XG4gICAgXHRcdFx0dGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiQVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIueCA9IHRoaXMuY2FudmFzTGF5ZXIueCAtIDUgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiZFwiOlxuICAgIFx0XHRcdHRoaXMuY2FudmFzTGF5ZXIueCA9IHRoaXMuY2FudmFzTGF5ZXIueCArIDAuNSAqIG11bHRpcGxpZXI7XG4gICAgXHRcdFx0dGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiRFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIueCA9IHRoaXMuY2FudmFzTGF5ZXIueCArIDUgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgIFx0XHRjYXNlIFwid1wiOlxuICAgIFx0XHRcdHRoaXMuY2FudmFzTGF5ZXIueSA9IHRoaXMuY2FudmFzTGF5ZXIueSAtIDAuNSAqIG11bHRpcGxpZXI7XG4gICAgXHRcdFx0dGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiV1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIueSA9IHRoaXMuY2FudmFzTGF5ZXIueSAtIDUgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrOyAgICBcbiAgICBcdFx0Y2FzZSBcInNcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnkgPSB0aGlzLmNhbnZhc0xheWVyLnkgKyAwLjUgKiBtdWx0aXBsaWVyO1xuICAgIFx0XHRcdHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlNcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnkgPSB0aGlzLmNhbnZhc0xheWVyLnkgKyA1ICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJlXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiA9IHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gLSAwLjAwNTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJFXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiA9IHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gLSAwLjA1O1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInFcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uID0gdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiArIDAuMDA1O1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlFcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uID0gdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiArIDAuMDU7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgXHRcdGNhc2UgXCJ4XCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci56b29tWCA9IHRoaXMuY2FudmFzTGF5ZXIuem9vbVggLSAwLjAwMiAqIG11bHRpcGxpZXI7XG4gICAgXHRcdFx0dGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJYXCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci56b29tWCA9IHRoaXMuY2FudmFzTGF5ZXIuem9vbVggKyAwLjAwMiAqIG11bHRpcGxpZXI7XG4gICAgXHRcdFx0dGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJ6XCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci56b29tWSA9IHRoaXMuY2FudmFzTGF5ZXIuem9vbVkgLSAwLjAwMiAqIG11bHRpcGxpZXI7XG4gICAgXHRcdFx0dGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJaXCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci56b29tWSA9IHRoaXMuY2FudmFzTGF5ZXIuem9vbVkgKyAwLjAwMiAqIG11bHRpcGxpZXI7XG4gICAgXHRcdFx0dGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiY1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIuc2V0VmlzaWJsZSghdGhpcy5jYW52YXNMYXllci52aXNpYmxlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJUXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5vcGFjaXR5ID0gTWF0aC5taW4oMS4wLCB0aGlzLmNhbnZhc0xheWVyLm9wYWNpdHkgKyAwLjEpO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLm9wYWNpdHkgPSBNYXRoLm1heCgwLCB0aGlzLmNhbnZhc0xheWVyLm9wYWNpdHkgLSAwLjEpO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgIFx0XHRkZWZhdWx0OlxuICAgIFx0XHRcdC8vIGNvZGUuLi5cbiAgICBcdFx0XHRicmVhaztcbiAgICBcdH1cbiAgICAgICAgY29uc29sZS5sb2coJ1wibmFtZVwiOiBcIndzYy0xMDAtMlwiLCBcInhcIjogJyArIHRoaXMuY2FudmFzTGF5ZXIueCArIFxuICAgICAgICAgICAgJywgXCJ5XCI6ICcgKyB0aGlzLmNhbnZhc0xheWVyLnkgKyBcbiAgICAgICAgICAgICcsIFwiem9vbVhcIjogJysgdGhpcy5jYW52YXNMYXllci56b29tWCArIFxuICAgICAgICAgICAgJywgXCJ6b29tWVwiOiAnICsgdGhpcy5jYW52YXNMYXllci56b29tWSArIFxuICAgICAgICAgICAgJywgXCJyb3RhdGlvblwiOiAnKyB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uKTtcbiAgICBcdC8vY29uc29sZS5sb2coXCJpbWFnZSBhdDogXCIgKyAgdGhpcy5jYW52YXNMYXllci54ICsgXCIsIFwiICsgdGhpcy5jYW52YXNMYXllci55KTtcbiAgICBcdC8vY29uc29sZS5sb2coXCJpbWFnZSBybyBzYzogXCIgKyAgdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiArIFwiLCBcIiArIHRoaXMuY2FudmFzTGF5ZXIuem9vbVggKyBcIiwgXCIgKyB0aGlzLmNhbnZhc0xheWVyLnpvb21ZKTtcbiAgICB9O1xuXG4gICAgdXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcpIHtcblxuICAgICAgICBpZiAodGhpcy5sYXllck91dGxpbmUgIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIGxldCBuZXdEaW1lbnNpb24gPSB0aGlzLmNhbnZhc0xheWVyLmdldERpbWVuc2lvbigpO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcImltYWdlIG91dGxpbmUgXCIgKyBuZXdEaW1lbnNpb24pO1xuICAgICAgICAgICAgdGhpcy5sYXllck91dGxpbmUudXBkYXRlRGltZW5zaW9uKG5ld0RpbWVuc2lvbik7XG4gICAgICAgIH1cblxuICAgICAgICBjYW52YXNWaWV3LmRyYXcoKTtcbiAgICB9XG5cbn07IiwiaW1wb3J0IHsgVHJhbnNmb3JtLCBCYXNpY1RyYW5zZm9ybSwgVmlld1RyYW5zZm9ybSwgY29tYmluZVRyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IERpc3BsYXlFbGVtZW50IH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgRGltZW5zaW9uIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2FudmFzTGF5ZXIgZXh0ZW5kcyBCYXNpY1RyYW5zZm9ybSBpbXBsZW1lbnRzIERpc3BsYXlFbGVtZW50IHtcblxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgbG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgcHVibGljIG9wYWNpdHk6IG51bWJlciwgcHVibGljIHZpc2libGUpe1xuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLngsIGxvY2FsVHJhbnNmb3JtLnksIGxvY2FsVHJhbnNmb3JtLnpvb21YLCBsb2NhbFRyYW5zZm9ybS56b29tWSwgbG9jYWxUcmFuc2Zvcm0ucm90YXRpb24pO1xuXHR9XG5cblx0YWJzdHJhY3QgZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFZpZXdUcmFuc2Zvcm0pOiBib29sZWFuO1xuXG5cdGFic3RyYWN0IGdldERpbWVuc2lvbigpOiBEaW1lbnNpb247XG5cblx0aXNWaXNpYmxlKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnZpc2libGU7XG5cdH1cblxuXHRzZXRWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4pOiB2b2lkIHtcblx0XHRjb25zb2xlLmxvZyhcInNldHRpbmcgdmlzaWJpbGl0eTogXCIgKyB2aXNpYmxlKTtcblx0XHR0aGlzLnZpc2libGUgPSB2aXNpYmxlO1xuXHR9XG5cblx0Z2V0T3BhY2l0eSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLm9wYWNpdHk7XG5cdH1cblxuXHRzZXRPcGFjaXR5KG9wYWNpdHk6IG51bWJlcik6IHZvaWQge1xuXHRcdHRoaXMub3BhY2l0eSA9IG9wYWNpdHk7XG5cdH1cblxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRHJhd0xheWVyIGV4dGVuZHMgQ2FudmFzTGF5ZXIge1xuXG4gICAgcHJvdGVjdGVkIHByZXBhcmVDdHgoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBUcmFuc2Zvcm0pOiB2b2lkIHtcblx0XHRjdHgudHJhbnNsYXRlKCh0cmFuc2Zvcm0ueCAtIHZpZXcueCkgKiB2aWV3Lnpvb21YLCAodHJhbnNmb3JtLnkgLSB2aWV3LnkpICogdmlldy56b29tWSk7XG5cdFx0Y3R4LnNjYWxlKHRyYW5zZm9ybS56b29tWCAqIHZpZXcuem9vbVgsIHRyYW5zZm9ybS56b29tWSAqIHZpZXcuem9vbVkpO1xuXHRcdGN0eC5yb3RhdGUodHJhbnNmb3JtLnJvdGF0aW9uKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgY2xlYW5DdHgoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBUcmFuc2Zvcm0pOiB2b2lkIHtcdFxuXHRcdGN0eC5yb3RhdGUoLXRyYW5zZm9ybS5yb3RhdGlvbik7XG5cdFx0Y3R4LnNjYWxlKDEvdHJhbnNmb3JtLnpvb21YL3ZpZXcuem9vbVgsIDEvdHJhbnNmb3JtLnpvb21ZL3ZpZXcuem9vbVkpO1xuXHRcdGN0eC50cmFuc2xhdGUoLSh0cmFuc2Zvcm0ueCAtdmlldy54KSAqdmlldy56b29tWCwgLSh0cmFuc2Zvcm0ueSAtIHZpZXcueSkgKiB2aWV3Lnpvb21ZKTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIENvbnRhaW5lckxheWVyIGV4dGVuZHMgQ2FudmFzTGF5ZXIge1xuXG5cdGxheWVyTWFwOiBNYXA8c3RyaW5nLCBDYW52YXNMYXllcj47XG5cdGRpc3BsYXlMYXllcnM6IEFycmF5PENhbnZhc0xheWVyPjtcblxuXHRjb25zdHJ1Y3Rvcihsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBvcGFjaXR5OiBudW1iZXIgPSAxLCB2aXNpYmxlOiBib29sZWFuID0gdHJ1ZSkge1xuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCBvcGFjaXR5LCB2aXNpYmxlKTtcblx0XHR0aGlzLmxheWVyTWFwID0gbmV3IE1hcDxzdHJpbmcsIENhbnZhc0xheWVyPigpO1xuXHRcdHRoaXMuZGlzcGxheUxheWVycyA9IFtdO1xuXHR9XG5cblx0c2V0KG5hbWU6IHN0cmluZywgbGF5ZXI6IENhbnZhc0xheWVyKXtcblx0XHR0aGlzLmxheWVyTWFwLnNldChuYW1lLCBsYXllcik7XG5cdFx0dGhpcy5kaXNwbGF5TGF5ZXJzLnB1c2gobGF5ZXIpO1xuXHR9XG5cblx0Z2V0KG5hbWU6IHN0cmluZyk6IENhbnZhc0xheWVyIHtcblx0XHRyZXR1cm4gdGhpcy5sYXllck1hcC5nZXQobmFtZSk7XG5cdH1cblxuXHRzZXRUb3AobmFtZTogc3RyaW5nKSB7XG5cdFx0bGV0IHRvcExheWVyID0gdGhpcy5nZXQobmFtZSk7XG5cdFx0aWYgKHRvcExheWVyICE9IHVuZGVmaW5lZCl7XG5cdFx0XHR0aGlzLmRpc3BsYXlMYXllcnMgPSB0aGlzLmRpc3BsYXlMYXllcnMuZmlsdGVyKGZ1bmN0aW9uKGVsZW1lbnQ6IENhbnZhc0xheWVyKXsgXG5cdFx0XHRcdGlmIChlbGVtZW50ID09IHRvcExheWVyKXtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH19KTtcblx0XHRcdHRoaXMuZGlzcGxheUxheWVycy5wdXNoKHRvcExheWVyKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5sb2coXCJ0b3AgbGF5ZXIgdW5kZWZpbmVkIFwiICsgbmFtZSk7XG5cdFx0fVxuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFZpZXdUcmFuc2Zvcm0pOiBib29sZWFuIHtcblxuXHRcdGxldCBsYXllclRyYW5zZm9ybSA9IGNvbWJpbmVUcmFuc2Zvcm0odGhpcy5sb2NhbFRyYW5zZm9ybSwgcGFyZW50VHJhbnNmb3JtKTtcblxuXHRcdHZhciBkcmF3aW5nQ29tcGxldGUgPSB0cnVlO1xuXG5cdFx0Zm9yIChsZXQgbGF5ZXIgb2YgdGhpcy5kaXNwbGF5TGF5ZXJzKSB7XG5cdFx0XHRpZiAobGF5ZXIuaXNWaXNpYmxlKCkpe1xuXHRcdFx0XHRkcmF3aW5nQ29tcGxldGUgPSBkcmF3aW5nQ29tcGxldGUgJiYgbGF5ZXIuZHJhdyhjdHgsIGxheWVyVHJhbnNmb3JtLCB2aWV3KTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdH1cblxuXHRcdHJldHVybiBkcmF3aW5nQ29tcGxldGU7XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHR2YXIgeE1pbiA9IHRoaXMueDtcblx0XHR2YXIgeU1pbiA9IHRoaXMueTtcblx0XHR2YXIgeE1heCA9IHRoaXMueDtcblx0XHR2YXIgeU1heCA9IHRoaXMueTtcblxuXHRcdGZvciAobGV0IGxheWVyIG9mIHRoaXMuZGlzcGxheUxheWVycykge1xuXHRcdFx0bGV0IGxheWVyRGltZW5zaW9uID0gbGF5ZXIuZ2V0RGltZW5zaW9uKCk7XG5cdFx0XHR4TWluID0gTWF0aC5taW4oeE1pbiwgdGhpcy54ICsgbGF5ZXJEaW1lbnNpb24ueCk7XG5cdFx0XHR5TWluID0gTWF0aC5taW4oeU1pbiwgdGhpcy55ICsgbGF5ZXJEaW1lbnNpb24ueSk7XG5cdFx0XHR4TWF4ID0gTWF0aC5tYXgoeE1heCwgdGhpcy54ICsgbGF5ZXJEaW1lbnNpb24ueCArIHRoaXMuem9vbVggKiBsYXllckRpbWVuc2lvbi53KTtcblx0XHRcdHlNYXggPSBNYXRoLm1heCh5TWF4LCB0aGlzLnkgKyBsYXllckRpbWVuc2lvbi55ICsgdGhpcy56b29tWSAqIGxheWVyRGltZW5zaW9uLmgpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgRGltZW5zaW9uKHhNaW4sIHlNaW4sIHhNYXggLSB4TWluLCB5TWF4IC0geU1pbik7XG5cdH1cblxuXG59IiwiaW1wb3J0IHsgQ29udGFpbmVyTGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgQ29udGFpbmVyTGF5ZXJNYW5hZ2VyIH0gZnJvbSBcIi4vbGF5ZXJtYW5hZ2VyXCI7XG5pbXBvcnQgeyBDYW52YXNWaWV3IH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuXG5leHBvcnQgY2xhc3MgTGF5ZXJDb250cm9sbGVyIHtcblxuXHRwcml2YXRlIG1vZDogc3RyaW5nID0gXCJpXCI7XG5cblx0Y29uc3RydWN0b3IoY2FudmFzVmlldzogQ2FudmFzVmlldywgcmVhZG9ubHkgY29udGFpbmVyTGF5ZXJNYW5hZ2VyOiBDb250YWluZXJMYXllck1hbmFnZXIpe1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLnByZXNzZWQoY2FudmFzVmlldywgZSAgYXMgS2V5Ym9hcmRFdmVudCkpO1xuXHR9XG5cblx0cHJlc3NlZChjYW52YXNWaWV3OiBDYW52YXNWaWV3LCBldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICAgICAgICBjYXNlIHRoaXMubW9kOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidG9nZ2xlIHZpc2libGVcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXJMYXllck1hbmFnZXIudG9nZ2xlVmlzaWJpbGl0eShmYWxzZSk7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBDYW52YXNMYXllciwgQ29udGFpbmVyTGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgU3RhdGljSW1hZ2UsIFJlY3RMYXllciB9IGZyb20gXCIuL3N0YXRpY1wiO1xuaW1wb3J0IHsgVHJhbnNmb3JtICwgQmFzaWNUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQge0NhbnZhc1ZpZXcsIERpc3BsYXlFbGVtZW50fSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW1hZ2VTdHJ1Y3QgZXh0ZW5kcyBUcmFuc2Zvcm0ge1xuXHRcblx0b3BhY2l0eTogbnVtYmVyO1xuXHR2aXNpYmxlOiBib29sZWFuO1xuXHRzcmM6IHN0cmluZztcblx0bmFtZTogc3RyaW5nO1xuXG59XG5cbmV4cG9ydCBjbGFzcyBMYXllck1hbmFnZXIge1xuXG5cdHByaXZhdGUgbGF5ZXJNYXA6IE1hcDxzdHJpbmcsIENvbnRhaW5lckxheWVyPjs7XG5cblx0cmVhZG9ubHkgZGVmYXVsdExheWVyOiBzdHJpbmcgPSBcImRlZmF1bHRcIjtcblxuXHRjb25zdHJ1Y3Rvcigpe1xuXHRcdHRoaXMubGF5ZXJNYXAgPSBuZXcgTWFwPHN0cmluZywgQ29udGFpbmVyTGF5ZXI+KCk7XG5cblx0XHRsZXQgaW1hZ2VMYXllciA9IG5ldyBDb250YWluZXJMYXllcihCYXNpY1RyYW5zZm9ybS51bml0VHJhbnNmb3JtLCAxLCB0cnVlKTtcdFxuXG5cdFx0dGhpcy5sYXllck1hcC5zZXQodGhpcy5kZWZhdWx0TGF5ZXIsIGltYWdlTGF5ZXIpO1xuXHR9XG5cblx0YWRkSW1hZ2UoaW1hZ2U6IFN0YXRpY0ltYWdlLCBuYW1lOiBzdHJpbmcpe1xuXHRcdHRoaXMubGF5ZXJNYXAuZ2V0KHRoaXMuZGVmYXVsdExheWVyKS5zZXQobmFtZSwgaW1hZ2UpO1xuXHR9XG5cblx0YWRkTGF5ZXIoaW1hZ2VEZXRhaWxzOiBBcnJheTxJbWFnZVN0cnVjdD4sIGxheWVyTmFtZTogc3RyaW5nKTogQ29udGFpbmVyTGF5ZXIge1xuXHRcdGxldCBpbWFnZUxheWVyID0gbmV3IENvbnRhaW5lckxheWVyKEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0sIDEsIHRydWUpO1x0XG5cblx0XHRmb3IgKHZhciBpbWFnZSBvZiBpbWFnZURldGFpbHMpe1xuXHRcdFx0bGV0IHN0YXRpY0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKGltYWdlLCBpbWFnZS5zcmMsIGltYWdlLm9wYWNpdHksIGltYWdlLnZpc2libGUpO1xuXHRcdFx0aW1hZ2VMYXllci5zZXQoaW1hZ2UubmFtZSwgc3RhdGljSW1hZ2UpO1xuXHRcdH1cblxuXHRcdHRoaXMubGF5ZXJNYXAuc2V0KGxheWVyTmFtZSwgaW1hZ2VMYXllcik7XG5cblx0XHRyZXR1cm4gaW1hZ2VMYXllcjtcblx0fVxuXG5cdGdldExheWVycygpOiBNYXA8c3RyaW5nLCBDb250YWluZXJMYXllcj4ge1xuXHRcdHJldHVybiB0aGlzLmxheWVyTWFwO1xuXHR9XG5cblx0Z2V0TGF5ZXIobmFtZTogc3RyaW5nKTogQ29udGFpbmVyTGF5ZXIge1xuXHRcdHJldHVybiB0aGlzLmxheWVyTWFwLmdldChuYW1lKTtcblx0fVxuXG59XG5cbmV4cG9ydCBjbGFzcyBDb250YWluZXJMYXllck1hbmFnZXIge1xuXG5cdHByaXZhdGUgY29udGFpbmVyTGF5ZXI6IENvbnRhaW5lckxheWVyO1xuXHRwcml2YXRlIHNlbGVjdGVkOiBzdHJpbmc7XG5cdFxuXHRjb25zdHJ1Y3Rvcihjb250YWluZXJMYXllcjogQ29udGFpbmVyTGF5ZXIpIHtcblx0XHR0aGlzLmNvbnRhaW5lckxheWVyID0gY29udGFpbmVyTGF5ZXI7XG5cdH1cblxuXHRzZXRMYXllckNvbnRhaW5lcihjb250YWluZXJMYXllcjogQ29udGFpbmVyTGF5ZXIpIHtcblx0XHR0aGlzLmNvbnRhaW5lckxheWVyID0gY29udGFpbmVyTGF5ZXI7XG5cdH1cblxuXHRzZXRTZWxlY3RlZChuYW1lOiBzdHJpbmcpOiBSZWN0TGF5ZXIge1xuXHRcdHRoaXMuc2VsZWN0ZWQgPSBuYW1lO1xuXG5cdFx0bGV0IGxheWVyOiBDYW52YXNMYXllciA9IHRoaXMuY29udGFpbmVyTGF5ZXIuZ2V0KHRoaXMuc2VsZWN0ZWQpO1xuXG5cdFx0bGV0IGxheWVyUmVjdCA9IG5ldyBSZWN0TGF5ZXIobGF5ZXIuZ2V0RGltZW5zaW9uKCksIDEsIHRydWUpO1xuXG5cdFx0bGV0IGxheWVyTmFtZSA9IFwib3V0bGluZVwiOy8vbmFtZSArIFwiX29cIlxuXG5cdFx0dGhpcy5jb250YWluZXJMYXllci5zZXQobGF5ZXJOYW1lLCBsYXllclJlY3QpO1xuXG5cdFx0cmV0dXJuIGxheWVyUmVjdDtcblx0fVxuXG5cdHRvZ2dsZVZpc2liaWxpdHkoc2VsZWN0ZWQ6IGJvb2xlYW4gPSB0cnVlKXtcblx0XHRsZXQgdG9nZ2xlR3JvdXA6IEFycmF5PERpc3BsYXlFbGVtZW50PiA9IFtdO1xuXHRcdGlmIChzZWxlY3RlZCl7XG5cdFx0XHRpZiAodGhpcy5zZWxlY3RlZCAhPSBcIlwiKXtcblx0XHRcdFx0dG9nZ2xlR3JvdXAucHVzaCh0aGlzLmNvbnRhaW5lckxheWVyLmdldCh0aGlzLnNlbGVjdGVkKSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZvciAobGV0IHBhaXIgb2YgdGhpcy5jb250YWluZXJMYXllci5sYXllck1hcCl7XG5cblx0XHRcdFx0aWYgKHBhaXJbMF0gIT0gdGhpcy5zZWxlY3RlZCl7XG5cdFx0XHRcdFx0dG9nZ2xlR3JvdXAucHVzaChwYWlyWzFdKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcImxheWVyTmFtZTogXCIgKyB0aGlzLnNlbGVjdGVkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZvciAobGV0IGVsZW1lbnQgb2YgdG9nZ2xlR3JvdXApe1xuXHRcdFx0ZWxlbWVudC5zZXRWaXNpYmxlKCFlbGVtZW50LmlzVmlzaWJsZSgpKVxuXHRcdH1cblx0fVxuXG59IiwiaW1wb3J0IHsgVHJhbnNmb3JtLCBCYXNpY1RyYW5zZm9ybSwgY29tYmluZVRyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IERyYXdMYXllciwgQ2FudmFzTGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgRGlzcGxheUVsZW1lbnQgfSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5pbXBvcnQgeyBEaW1lbnNpb24sIHJvdGF0ZSwgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuZXhwb3J0IGNsYXNzIFN0YXRpY0ltYWdlIGV4dGVuZHMgRHJhd0xheWVyIGltcGxlbWVudHMgRGlzcGxheUVsZW1lbnQge1xuXG5cdHByaXZhdGUgaW1nOiBIVE1MSW1hZ2VFbGVtZW50O1xuXG5cdGNvbnN0cnVjdG9yKGxvY2FsVHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHRcdGltYWdlU3JjOiBzdHJpbmcsIFxuXHRcdG9wYWNpdHk6IG51bWJlcixcblx0XHR2aXNpYmxlOiBib29sZWFuKSB7XG5cblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybSwgb3BhY2l0eSwgdmlzaWJsZSk7XG5cdFx0XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0fVxuXG5cdHByaXZhdGUgZHJhd0ltYWdlKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVHJhbnNmb3JtKXtcblxuXHRcdGlmICh0aGlzLmlzVmlzaWJsZSgpKXtcblx0XHRcdGxldCBjdHhUcmFuc2Zvcm0gPSBjb21iaW5lVHJhbnNmb3JtKHRoaXMsIHBhcmVudFRyYW5zZm9ybSk7XG5cblx0XHRcdC8vY29uc29sZS5sb2coXCJjdHggeCBcIiArIGN0eFRyYW5zZm9ybS54KTtcblxuXHRcdFx0dGhpcy5wcmVwYXJlQ3R4KGN0eCwgY3R4VHJhbnNmb3JtLCB2aWV3KTtcblx0XHRcdFxuXHRcdFx0Y3R4Lmdsb2JhbEFscGhhID0gdGhpcy5vcGFjaXR5O1xuXHRcdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZywgMCwgMCk7XG5cdFx0XHRjdHguZ2xvYmFsQWxwaGEgPSAxO1xuXG5cdFx0XHR0aGlzLmNsZWFuQ3R4KGN0eCwgY3R4VHJhbnNmb3JtLCB2aWV3KTtcblx0XHR9XG5cdFx0XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cdFx0aWYgKHRoaXMudmlzaWJsZSAmJiB0aGlzLmltZy5jb21wbGV0ZSkge1xuXHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCBwYXJlbnRUcmFuc2Zvcm0sIHZpZXcpO1xuXHRcdC8vXHRjb25zb2xlLmxvZyhcImRyZXcgaW1hZ2UgXCIgKyB0aGlzLmltZy5zcmMpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGdldERpbWVuc2lvbigpOiBEaW1lbnNpb24ge1xuXHRcdFxuXHRcdGlmICh0aGlzLmltZy5jb21wbGV0ZSl7XG5cdFx0XHR2YXIgd2lkdGggPSB0aGlzLmltZy53aWR0aCAqIHRoaXMuem9vbVg7XG5cdFx0XHR2YXIgaGVpZ2h0ID0gdGhpcy5pbWcuaGVpZ2h0ICogdGhpcy56b29tWTtcblxuXHRcdFx0bGV0IHAxID0gcm90YXRlKG5ldyBQb2ludDJEKHdpZHRoLCAwKSwgdGhpcy5yb3RhdGlvbik7XG5cdFx0XHRsZXQgcDIgPSByb3RhdGUobmV3IFBvaW50MkQod2lkdGgsIC1oZWlnaHQpLCB0aGlzLnJvdGF0aW9uKTtcblx0XHRcdGxldCBwMyA9IHJvdGF0ZShuZXcgUG9pbnQyRCgwLCAtaGVpZ2h0KSwgdGhpcy5yb3RhdGlvbik7XG5cblx0XHRcdGxldCBtaW5YID0gTWF0aC5taW4oMCwgcDEueCwgcDIueCwgcDMueCk7XG5cdFx0XHRsZXQgbWluWSA9IE1hdGgubWluKDAsIHAxLnksIHAyLnksIHAzLnkpO1xuXHRcdFx0bGV0IG1heFggPSBNYXRoLm1heCgwLCBwMS54LCBwMi54LCBwMy54KTtcblx0XHRcdGxldCBtYXhZID0gTWF0aC5tYXgoMCwgcDEueSwgcDIueSwgcDMueSk7XG5cblx0XHRcdGNvbnNvbGUubG9nKFwibWlueDogXCIgKyBtaW5YKTtcblx0XHRcdGNvbnNvbGUubG9nKFwiaGVpZ2h0OiBcIiArIChtYXhZIC0gbWluWSkpO1xuXHRcdFx0XG5cdFx0XHRyZXR1cm4gbmV3IERpbWVuc2lvbih0aGlzLnggKyBtaW5YLCB0aGlzLnkgLSBtYXhZLCBtYXhYLW1pblgsIG1heFktbWluWSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBEaW1lbnNpb24odGhpcy54LCB0aGlzLnksIDAsIDApO1xuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWN0TGF5ZXIgZXh0ZW5kcyBEcmF3TGF5ZXIgaW1wbGVtZW50cyBEaXNwbGF5RWxlbWVudCB7XG5cblx0Y29uc3RydWN0b3IocHJpdmF0ZSBkaW1lbnNpb246IERpbWVuc2lvbiwgXG5cdFx0b3BhY2l0eTogbnVtYmVyLFxuXHRcdHZpc2libGU6IGJvb2xlYW4pIHtcblxuXHRcdHN1cGVyKG5ldyBCYXNpY1RyYW5zZm9ybShkaW1lbnNpb24ueCwgZGltZW5zaW9uLnksIDEsIDEsIDApLCBvcGFjaXR5LCB2aXNpYmxlKTtcblx0fVxuXG5cdHVwZGF0ZURpbWVuc2lvbihkaW1lbnNpb246IERpbWVuc2lvbil7XG5cdFx0dGhpcy5kaW1lbnNpb24gPSBkaW1lbnNpb247XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0XHRsZXQgeCA9ICh0aGlzLmRpbWVuc2lvbi54IC0gdmlldy54KSAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IHkgPSAodGhpcy5kaW1lbnNpb24ueSAtIHZpZXcueSkgKiB2aWV3Lnpvb21ZO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhcImRpbWVuc2lvbiBcIiArIHRoaXMuZGltZW5zaW9uLngpO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhcIm91dGxpbmU6IFwiICsgeCArIFwiIHZpZXc6IFwiICsgdmlldy54ICsgXG5cdFx0Ly9cdFwiIHBhcmVudCBcIiArIHBhcmVudFRyYW5zZm9ybS54ICsgXCIgdyBcIiArIHRoaXMuZGltZW5zaW9uLncpO1xuXHRcdGN0eC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG5cdFx0Y3R4LnN0cm9rZVJlY3QoeCwgeSwgdGhpcy5kaW1lbnNpb24udyAqIHZpZXcuem9vbVgsIHRoaXMuZGltZW5zaW9uLmggKiB2aWV3Lnpvb21ZKTtcblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0Z2V0RGltZW5zaW9uKCk6IERpbWVuc2lvbiB7XG5cdFx0cmV0dXJuIHRoaXMuZGltZW5zaW9uO1xuXHR9XG5cbn1cbiIsImltcG9ydCB7IERyYXdMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBUcmFuc2Zvcm0sIEJhc2ljVHJhbnNmb3JtLCBWaWV3VHJhbnNmb3JtLCBjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgRGltZW5zaW9uIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgY2xhc3MgVGlsZVN0cnVjdCB7XG5cdFxuXHRjb25zdHJ1Y3Rvcihcblx0XHRwdWJsaWMgcHJlZml4OiBzdHJpbmcsXG5cdFx0cHVibGljIHN1ZmZpeDogc3RyaW5nLFxuXHRcdHB1YmxpYyB0aWxlRGlyZWN0b3J5OiBzdHJpbmcpe31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHpvb21CeUxldmVsKHpvb21MZXZlbDogbnVtYmVyKXtcblx0cmV0dXJuIE1hdGgucG93KDIsIHpvb21MZXZlbCk7XG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlTGF5ZXIgZXh0ZW5kcyBEcmF3TGF5ZXIge1xuXG5cdHRpbGVNYW5hZ2VyOiBUaWxlTWFuYWdlcjtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHRyZWFkb25seSB0aWxlU3RydWN0OiBUaWxlU3RydWN0LFxuXHRcdHZpc2JpbGU6IGJvb2xlYW4sXG5cdFx0cHVibGljIHhPZmZzZXQ6IG51bWJlciA9IDAsXG5cdFx0cHVibGljIHlPZmZzZXQ6IG51bWJlciA9IDAsXG5cdFx0cHVibGljIHpvb206IG51bWJlciA9IDEsXG5cdFx0cmVhZG9ubHkgZ3JpZFdpZHRoOiBudW1iZXIgPSAyNTYsIFxuXHRcdHJlYWRvbmx5IGdyaWRIZWlnaHQ6IG51bWJlciA9IDI1Nixcblx0XHRvcGFjaXR5OiBudW1iZXIgPSAxKXtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCBvcGFjaXR5LCB2aXNiaWxlKTtcblxuXHRcdHRoaXMudGlsZU1hbmFnZXIgPSBuZXcgVGlsZU1hbmFnZXIoKTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHBhcmVudFRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBWaWV3VHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0XHRsZXQgY3R4VHJhbnNmb3JtID0gY29tYmluZVRyYW5zZm9ybSh0aGlzLCBwYXJlbnRUcmFuc2Zvcm0pO1xuXG5cdFx0bGV0IHpvb21XaWR0aDogbnVtYmVyID0gdGhpcy5ncmlkV2lkdGggKiBjdHhUcmFuc2Zvcm0uem9vbVhcblx0XHRsZXQgem9vbUhlaWdodDogbnVtYmVyID0gdGhpcy5ncmlkSGVpZ2h0ICogY3R4VHJhbnNmb3JtLnpvb21ZO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhcImN0eCB6b29tV2lkdGg6IFwiICsgem9vbVdpZHRoKTtcblxuXHRcdGxldCB2aWV3WCA9IHZpZXcueCAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IHZpZXdZID0gdmlldy55ICogdmlldy56b29tWTtcblxuXHRcdGxldCB2aWV3V2lkdGggPSB2aWV3LndpZHRoIC8gdmlldy56b29tWDtcblx0XHRsZXQgdmlld0hlaWdodCA9IHZpZXcuaGVpZ2h0IC8gdmlldy56b29tWTtcblxuXHRcdGxldCBncmlkQWNyb3NzID0gdmlld1dpZHRoIC8gem9vbVdpZHRoOyAvL2dvb2Rcblx0XHRsZXQgZ3JpZEhpZ2ggPSB2aWV3SGVpZ2h0IC8gem9vbUhlaWdodDsgLy9nb29kXG5cblx0XHRsZXQgeE1pbiA9IE1hdGguZmxvb3Iodmlldy54L3pvb21XaWR0aCk7XG5cdFx0bGV0IHhNYXggPSBNYXRoLmNlaWwoKHZpZXcueCArIHZpZXdXaWR0aCkgLyB6b29tV2lkdGgpO1xuXG5cdFx0bGV0IHlNaW4gPSBNYXRoLmZsb29yKHZpZXcueS96b29tSGVpZ2h0KTtcblx0XHRsZXQgeU1heCA9IE1hdGguY2VpbCgodmlldy55ICsgdmlld0hlaWdodCkgLyB6b29tSGVpZ2h0KTtcblxuXHRcdC8vY29uc29sZS5sb2coXCJ4IHkgcyBcIiArIHhNaW4gKyBcIiwgXCIgKyB4TWF4ICsgXCI6IFwiICsgeU1pbiArIFwiLCBcIiArIHlNYXgpO1xuXHRcdC8vY29uc29sZS5sb2coXCJhY3Jvc3MgaGlnaFwiICsgZ3JpZEFjcm9zcyArIFwiLCBcIiArIGdyaWRIaWdoKTtcblxuXHRcdHZhciBkcmF3aW5nQ29tcGxldGUgPSB0cnVlO1xuXG5cdFx0bGV0IGZ1bGxab29tWCA9IGN0eFRyYW5zZm9ybS56b29tWCAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IGZ1bGxab29tWSA9IGN0eFRyYW5zZm9ybS56b29tWSAqIHZpZXcuem9vbVk7XG5cblx0XHQvL2NvbnNvbGUubG9nKFwiZnVsbHpvb21zIFwiICsgZnVsbFpvb21YICsgXCIgXCIgKyBmdWxsWm9vbVkpO1xuXG5cdFx0Y3R4LnNjYWxlKGZ1bGxab29tWCwgZnVsbFpvb21ZKTtcblxuXHRcdGZvciAodmFyIHggPSB4TWluOyB4PHhNYXg7IHgrKyl7XG5cdFx0XHRsZXQgeE1vdmUgPSB4ICogdGhpcy5ncmlkV2lkdGggLSB2aWV3LnggLyBjdHhUcmFuc2Zvcm0uem9vbVg7XG5cdFx0XHRmb3IgKHZhciB5ID0geU1pbjsgeTx5TWF4OyB5Kyspe1xuXHRcdFx0XHRsZXQgeU1vdmUgPSB5ICogdGhpcy5ncmlkSGVpZ2h0IC0gdmlldy55LyBjdHhUcmFuc2Zvcm0uem9vbVk7XG5cdFx0XHRcdC8vY29uc29sZS5sb2coXCJ0aWxlIHggeSBcIiArIHggKyBcIiBcIiArIHkgKyBcIjogXCIgKyB4TW92ZSArIFwiLCBcIiArIHlNb3ZlKTtcblxuXHRcdFx0XHRjdHgudHJhbnNsYXRlKHhNb3ZlLCB5TW92ZSk7XG5cdFx0XHRcdGxldCB0aWxlU3JjID0gdGhpcy50aWxlU3RydWN0LnRpbGVEaXJlY3RvcnkgKyB0aGlzLnpvb20gKyBcIi9cIiArIFxuXHRcdFx0XHRcdCh4ICsgdGhpcy54T2Zmc2V0KSArIFwiL1wiICsgXG5cdFx0XHRcdFx0KHkgKyB0aGlzLnlPZmZzZXQpICsgdGhpcy50aWxlU3RydWN0LnN1ZmZpeDtcblxuXHRcdFx0XHRpZiAodGhpcy50aWxlTWFuYWdlci5oYXModGlsZVNyYykpIHtcblx0XHRcdFx0XHRsZXQgaW1hZ2VUaWxlID0gdGhpcy50aWxlTWFuYWdlci5nZXQodGlsZVNyYyk7XG5cdFx0XHRcdFx0ZHJhd2luZ0NvbXBsZXRlID0gZHJhd2luZ0NvbXBsZXRlICYmIGltYWdlVGlsZS5kcmF3KGN0eCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0bGV0IGltYWdlVGlsZSA9IG5ldyBJbWFnZVRpbGUoeCwgeSwgdGlsZVNyYyk7XG5cblx0XHRcdFx0XHRkcmF3aW5nQ29tcGxldGUgPSBkcmF3aW5nQ29tcGxldGUgJiYgaW1hZ2VUaWxlLmRyYXcoY3R4KTtcblxuXHRcdFx0XHRcdHRoaXMudGlsZU1hbmFnZXIuc2V0KHRpbGVTcmMsIGltYWdlVGlsZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjdHgudHJhbnNsYXRlKC14TW92ZSwgLXlNb3ZlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjdHguc2NhbGUoMSAvIGZ1bGxab29tWCwgMSAvIGZ1bGxab29tWSk7XG5cblx0XHQvL2NvbnNvbGUubG9nKFwiZHJldyB0aWxlcyBcIiArIGRyYXdpbmdDb21wbGV0ZSk7XG5cdFx0cmV0dXJuIGRyYXdpbmdDb21wbGV0ZTtcblx0fVxuXG5cdGdldERpbWVuc2lvbigpOiBEaW1lbnNpb24ge1xuXHRcdHJldHVybiBuZXcgRGltZW5zaW9uKDAsIDAsIDAsIDApO1xuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlTWFuYWdlciB7XG5cblx0dGlsZU1hcDogTWFwPHN0cmluZywgSW1hZ2VUaWxlPjtcblxuXHRjb25zdHJ1Y3Rvcigpe1xuXHRcdHRoaXMudGlsZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBJbWFnZVRpbGU+KCk7XG5cdH1cblxuXHRnZXQodGlsZUtleTogc3RyaW5nKTogSW1hZ2VUaWxlIHtcblx0XHRyZXR1cm4gdGhpcy50aWxlTWFwLmdldCh0aWxlS2V5KTtcblx0fVxuXG5cdGhhcyh0aWxlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy50aWxlTWFwLmhhcyh0aWxlS2V5KTtcblx0fVxuXG5cdHNldCh0aWxlS2V5OiBzdHJpbmcsIHRpbGU6IEltYWdlVGlsZSl7XG5cdFx0dGhpcy50aWxlTWFwLnNldCh0aWxlS2V5LCB0aWxlKTtcblx0fVxuXG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZVRpbGUge1xuXG5cdHByaXZhdGUgaW1nOiBIVE1MSW1hZ2VFbGVtZW50O1xuXHRwcml2YXRlIGV4aXN0czogYm9vbGVhbjtcblxuXHRjb25zdHJ1Y3RvcihyZWFkb25seSB4SW5kZXg6IG51bWJlciwgcmVhZG9ubHkgeUluZGV4OiBudW1iZXIsIGltYWdlU3JjOiBzdHJpbmcpIHtcblx0XHR0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuXHRcdHRoaXMuaW1nLnNyYyA9IGltYWdlU3JjO1xuXHRcdHRoaXMuaW1nLm9uZXJyb3IgPSBmdW5jdGlvbihldmVudE9yTWVzc2FnZTogYW55KXtcblx0XHRcdGV2ZW50T3JNZXNzYWdlLnRhcmdldC5zcmMgPSBcIlwiO1xuXHRcdH07XG5cdH07XG5cblx0cHJpdmF0ZSBkcmF3SW1hZ2UoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpe1xuXHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDApO1xuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCk6IGJvb2xlYW4ge1xuXHRcdGlmICh0aGlzLmltZy5zcmMgIT0gXCJcIiAmJiB0aGlzLmltZy5jb21wbGV0ZSApIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xuXG59XG4iLCIvKipcbiogQSB3b3JsZCBpcyAwLDAgYmFzZWQgYnV0IGFueSBlbGVtZW50IGNhbiBiZSBwb3NpdGlvbmVkIHJlbGF0aXZlIHRvIHRoaXMuXG4qL1xuZXhwb3J0IGludGVyZmFjZSBUcmFuc2Zvcm0ge1xuXHR4OiBudW1iZXI7XG5cdHk6IG51bWJlcjtcblx0em9vbVg6IG51bWJlcjtcblx0em9vbVk6IG51bWJlcjtcblx0cm90YXRpb246IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIEJhc2ljVHJhbnNmb3JtIGltcGxlbWVudHMgVHJhbnNmb3JtIHtcblxuICAgIHN0YXRpYyByZWFkb25seSB1bml0VHJhbnNmb3JtID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDEsIDEsIDApO1xuXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB4OiBudW1iZXIsIHB1YmxpYyB5OiBudW1iZXIsIFxuXHRcdHB1YmxpYyB6b29tWDogbnVtYmVyLCBwdWJsaWMgem9vbVk6IG51bWJlciwgXG5cdFx0cHVibGljIHJvdGF0aW9uOiBudW1iZXIpe31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbWJpbmVUcmFuc2Zvcm0oY2hpbGQ6IFRyYW5zZm9ybSwgY29udGFpbmVyOiBUcmFuc2Zvcm0pOiBUcmFuc2Zvcm0ge1xuXHRsZXQgem9vbVggPSBjaGlsZC56b29tWCAqIGNvbnRhaW5lci56b29tWDtcblx0Ly9jb25zb2xlLmxvZyhcIm1vZGlmaWVkIFwiICsgY2hpbGQuem9vbVggKyBcIiB0byBcIiArIHpvb21YKTtcblx0bGV0IHpvb21ZID0gY2hpbGQuem9vbVkgKiBjb250YWluZXIuem9vbVk7XG5cdC8vY29uc29sZS5sb2coXCJtb2RpZmllZCBcIiArIGNoaWxkLnpvb21ZICsgXCIgYnkgXCIgKyBjb250YWluZXIuem9vbVkgKyBcIiB0byBcIiArIHpvb21ZKTtcblx0bGV0IHggPSAoY2hpbGQueCAqIGNvbnRhaW5lci56b29tWCkgKyBjb250YWluZXIueDtcblx0bGV0IHkgPSAoY2hpbGQueSAqIGNvbnRhaW5lci56b29tWSkgKyBjb250YWluZXIueTtcblx0Ly9jb25zb2xlLmxvZyhcIm1vZGlmaWVkIHggXCIgKyBjaGlsZC54ICsgXCIgYnkgXCIgKyBjb250YWluZXIuem9vbVggKyBcIiBhbmQgXCIgKyBjb250YWluZXIueCArIFwiIHRvIFwiICsgeCk7XG5cdGxldCByb3RhdGlvbiA9IGNoaWxkLnJvdGF0aW9uICsgY29udGFpbmVyLnJvdGF0aW9uO1xuXHRyZXR1cm4gbmV3IEJhc2ljVHJhbnNmb3JtKHgsIHksIHpvb21YLCB6b29tWSwgcm90YXRpb24pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUodHJhbnNmb3JtOiBUcmFuc2Zvcm0pOiBUcmFuc2Zvcm0ge1xuXHRyZXR1cm4gbmV3IEJhc2ljVHJhbnNmb3JtKHRyYW5zZm9ybS54LCB0cmFuc2Zvcm0ueSwgXG5cdFx0dHJhbnNmb3JtLnpvb21YLCB0cmFuc2Zvcm0uem9vbVksIHRyYW5zZm9ybS5yb3RhdGlvbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnRUcmFuc2Zvcm0od29ybGRTdGF0ZTogVHJhbnNmb3JtKTogVHJhbnNmb3JtIHtcblx0cmV0dXJuIG5ldyBCYXNpY1RyYW5zZm9ybSgtd29ybGRTdGF0ZS54LCAtd29ybGRTdGF0ZS55LCBcblx0XHQxL3dvcmxkU3RhdGUuem9vbVgsIDEvd29ybGRTdGF0ZS56b29tWSwgLXdvcmxkU3RhdGUucm90YXRpb24pO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFZpZXdUcmFuc2Zvcm0gZXh0ZW5kcyBUcmFuc2Zvcm0ge1xuXHR3aWR0aDogbnVtYmVyO1xuXHRoZWlnaHQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIEJhc2ljVmlld1RyYW5zZm9ybSBleHRlbmRzIEJhc2ljVHJhbnNmb3JtIGltcGxlbWVudHMgVmlld1RyYW5zZm9ybSB7XG5cblx0Y29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIFxuXHRcdHJlYWRvbmx5IHdpZHRoOiBudW1iZXIsIHJlYWRvbmx5IGhlaWdodDogbnVtYmVyLFxuXHRcdHpvb21YOiBudW1iZXIsIHpvb21ZOiBudW1iZXIsIFxuXHQgICAgcm90YXRpb246IG51bWJlcil7XG5cblx0XHRzdXBlcih4LCB5LCB6b29tWCwgem9vbVksIHJvdGF0aW9uKTtcblx0fVxuXG59XG5cblxuXG4iLCJpbXBvcnQgeyBWaWV3VHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgQ2FudmFzVmlldyB9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcblxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTW91c2VDb250cm9sbGVyIHtcblxuICAgIG1vdXNlUG9zaXRpb24oZXZlbnQ6IE1vdXNlRXZlbnQsIHdpdGhpbjogSFRNTEVsZW1lbnQpOiBBcnJheTxudW1iZXI+IHtcbiAgICAgICAgbGV0IG1fcG9zeCA9IGV2ZW50LmNsaWVudFggKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnRcbiAgICAgICAgICAgICAgICAgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdDtcbiAgICAgICAgbGV0IG1fcG9zeSA9IGV2ZW50LmNsaWVudFkgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7XG5cbiAgICAgICAgdmFyIGVfcG9zeCA9IDA7XG4gICAgICAgIHZhciBlX3Bvc3kgPSAwO1xuXG4gICAgICAgIGlmICh3aXRoaW4ub2Zmc2V0UGFyZW50KXtcbiAgICAgICAgICAgIGRvIHsgXG4gICAgICAgICAgICAgICAgZV9wb3N4ICs9IHdpdGhpbi5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgICAgIGVfcG9zeSArPSB3aXRoaW4ub2Zmc2V0VG9wO1xuICAgICAgICAgICAgfSB3aGlsZSAod2l0aGluID0gPEhUTUxFbGVtZW50PndpdGhpbi5vZmZzZXRQYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFttX3Bvc3ggLSBlX3Bvc3gsIG1fcG9zeSAtIGVfcG9zeV07XG4gICAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBWaWV3Q29udHJvbGxlciBleHRlbmRzIE1vdXNlQ29udHJvbGxlciB7XG5cblx0cmVjb3JkOiBib29sZWFuO1xuXHRtb3ZlOiBudW1iZXIgPSAxO1xuXG5cdHByaXZhdGUgeFByZXZpb3VzOiBudW1iZXI7XG5cdHByaXZhdGUgeVByZXZpb3VzOiBudW1iZXI7XG5cblx0Y29uc3RydWN0b3Iodmlld1RyYW5zZm9ybTogVmlld1RyYW5zZm9ybSwgXG4gICAgICAgIHJlYWRvbmx5IGRyYWdFbGVtZW50OiBIVE1MRWxlbWVudCwgcmVhZG9ubHkgY2FudmFzVmlldzogQ2FudmFzVmlldykge1xuXG4gICAgXHRzdXBlcigpO1xuICAgIFx0ZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm0pKTtcbiAgICBcdGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3VHJhbnNmb3JtKSk7XG4gICAgICAgIGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm0pKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5yZWNvcmQgPSBmYWxzZSk7XG4gICAgICAgIGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkYmxjbGlja1wiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuY2xpY2tlZChlIGFzIE1vdXNlRXZlbnQsIGNhbnZhc1ZpZXcsIDEuMikpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwid2hlZWxcIiwgKGU6IEV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMud2hlZWwoZSBhcyBXaGVlbEV2ZW50LCBjYW52YXNWaWV3KSk7XG4gICAgfVxuXG4gICAgY2xpY2tlZChldmVudDogTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybTogVmlld1RyYW5zZm9ybSwgem9vbUJ5OiBudW1iZXIpe1xuICAgIFx0c3dpdGNoKGV2ZW50LnR5cGUpe1xuICAgIFx0XHRjYXNlIFwiZGJsY2xpY2tcIjpcbiAgICAgICAgICAgICAgICBpZiAgKGV2ZW50LmN0cmxLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgem9vbUJ5ID0gMSAvIHpvb21CeTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbGV0IG1YWSA9IHRoaXMubW91c2VQb3NpdGlvbihldmVudCwgdGhpcy5kcmFnRWxlbWVudCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuem9vbUFib3V0KG1YWVswXSwgbVhZWzFdLCB6b29tQnkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3LmRyYXcoKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmFnZ2VkKGV2ZW50OiBNb3VzZUV2ZW50LCB2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtKSB7XG5cbiAgICBcdHN3aXRjaChldmVudC50eXBlKXtcbiAgICBcdFx0Y2FzZSBcIm1vdXNlZG93blwiOlxuICAgIFx0XHRcdHRoaXMucmVjb3JkID0gdHJ1ZTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIm1vdXNldXBcIjpcbiAgICBcdFx0XHR0aGlzLnJlY29yZCA9IGZhbHNlO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRkZWZhdWx0OlxuICAgIFx0XHRcdGlmICh0aGlzLnJlY29yZCl7XG4gICAgICAgICAgICAgICAgICAgIGxldCB4RGVsdGEgPSAoZXZlbnQuY2xpZW50WCAtIHRoaXMueFByZXZpb3VzKSAvIHRoaXMubW92ZSAvIHZpZXdUcmFuc2Zvcm0uem9vbVg7XG4gICAgICAgICAgICAgICAgICAgIGxldCB5RGVsdGEgPSAoZXZlbnQuY2xpZW50WSAtIHRoaXMueVByZXZpb3VzKSAvIHRoaXMubW92ZSAvIHZpZXdUcmFuc2Zvcm0uem9vbVk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmlld1RyYW5zZm9ybS54ID0gdmlld1RyYW5zZm9ybS54IC0geERlbHRhO1xuICAgICAgICAgICAgICAgICAgICB2aWV3VHJhbnNmb3JtLnkgPSB2aWV3VHJhbnNmb3JtLnkgLSB5RGVsdGE7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3LmRyYXcoKTtcbiAgICBcdFx0XHR9XG5cblx0XHRcdHRoaXMueFByZXZpb3VzID0gZXZlbnQuY2xpZW50WDtcblx0XHRcdHRoaXMueVByZXZpb3VzID0gZXZlbnQuY2xpZW50WTtcbiAgICBcdH1cbiAgICB9XG5cbiAgICB3aGVlbChldmVudDogV2hlZWxFdmVudCwgdmlld1RyYW5zZm9ybTogVmlld1RyYW5zZm9ybSkge1xuXG4gICAgICAgIC8vY29uc29sZS5sb2coXCJ3aGVlbFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQudHlwZSk7XG5cbiAgICAgICAgbGV0IHhEZWx0YSA9IGV2ZW50LmRlbHRhWCAvIHRoaXMubW92ZSAvIHZpZXdUcmFuc2Zvcm0uem9vbVg7XG4gICAgICAgIGxldCB5RGVsdGEgPSBldmVudC5kZWx0YVkgLyB0aGlzLm1vdmUgLyB2aWV3VHJhbnNmb3JtLnpvb21ZO1xuXG4gICAgICAgIGlmICAoZXZlbnQuY3RybEtleSkge1xuICAgICAgICAgICAgbGV0IG1YWSA9IHRoaXMubW91c2VQb3NpdGlvbihldmVudCwgdGhpcy5kcmFnRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgYnkgPSAxLjA1O1xuICAgICAgICAgICAgaWYgKHlEZWx0YSA8IDApe1xuICAgICAgICAgICAgICAgIGJ5ID0gMC45NTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3Lnpvb21BYm91dChtWFlbMF0sIG1YWVsxXSwgYnkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3LnggPSAgdGhpcy5jYW52YXNWaWV3LnggKyB4RGVsdGE7XG4gICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcueSA9ICB0aGlzLmNhbnZhc1ZpZXcueSArIHlEZWx0YTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5jYW52YXNWaWV3LmRyYXcoKTtcbiAgICB9XG5cbn1cbiIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1xuXHRcIm5hbWVcIjogXCIyLTJcIiwgXCJ4XCI6IC0zNjQsIFwieVwiOiAtMTIuNSwgXCJ6b29tWFwiOiAwLjIxMywgXCJ6b29tWVwiOiAwLjIwNSwgXCJyb3RhdGlvblwiOiAtMC4zMSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDAycl8yW1NWQzJdLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjNcIiwgXCJ4XCI6IC0yMTYsIFwieVwiOiAtMC43MDUsIFwiem9vbVhcIjogMC4yLCBcInpvb21ZXCI6IDAuMjEsIFwicm90YXRpb25cIjogLTAuNTEsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwM3JbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiNFwiLCBcInhcIjogLTc0LjI5LCBcInlcIjogLTk5Ljc4LCBcInpvb21YXCI6IDAuMjIyLCBcInpvb21ZXCI6IDAuMjA4LCBcInJvdGF0aW9uXCI6IC0wLjI4NSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA0cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI1XCIsIFwieFwiOiAtMzY2LjUsIFwieVwiOiAxODAuMDE5LCBcInpvb21YXCI6IDAuMjE1LCBcInpvb21ZXCI6IDAuMjA3LCBcInJvdGF0aW9uXCI6IC0wLjIxLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDVyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjZcIiwgXCJ4XCI6IC0yMDYuMTYsIFwieVwiOiAxNDYsIFwiem9vbVhcIjogMC4yMSwgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAtMC4yMTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwNnJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiN1wiLCBcInhcIjogLTYzLjMsIFwieVwiOiAxMDAuMzc3NiwgXCJ6b29tWFwiOiAwLjIxMjUsIFwiem9vbVlcIjogMC4yMTMsIFwicm90YXRpb25cIjogLTAuMjMsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwN3JbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiOFwiLCBcInhcIjogNzguMSwgXCJ5XCI6IDU4LjUzNSwgXCJ6b29tWFwiOiAwLjIwNywgXCJ6b29tWVwiOiAwLjIxNywgXCJyb3RhdGlvblwiOiAtMC4yNSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA4cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI5XCIsIFwieFwiOiAyMTkuNSwgXCJ5XCI6IDI0LCBcInpvb21YXCI6IDAuMjE1LCBcInpvb21ZXCI6IDAuMjE0NSwgXCJyb3RhdGlvblwiOiAtMC4yNixcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDlyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjEwXCIsIFwieFwiOiA0NTQuMjEsIFwieVwiOiAtMS41LCBcInpvb21YXCI6IDAuMjE4LCBcInpvb21ZXCI6IDAuMjE0LCBcInJvdGF0aW9uXCI6IDAuMDE1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTByXzJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTFcIiwgXCJ4XCI6IDYyMS44NiwgXCJ5XCI6IDI1LjUyNSwgXCJ6b29tWFwiOiAwLjIxMywgXCJ6b29tWVwiOiAwLjIxMTUsIFwicm90YXRpb25cIjogMC4xMSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDExcltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSwgXG5cdHtcblx0XCJuYW1lXCI6IFwiMTItMVwiLCBcInhcIjogNzY5LjY0NSwgXCJ5XCI6IDUwLjI2NSwgXCJ6b29tWFwiOiAwLjQyNCwgXCJ6b29tWVwiOiAwLjQyMiwgXCJyb3RhdGlvblwiOiAwLjEyLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTJyXzFbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTRcIiwgXCJ4XCI6IC05MTUuNiwgXCJ5XCI6IDU1Ny44NjUsIFwiem9vbVhcIjogMC4yMDgsIFwiem9vbVlcIjogMC4yMDgsIFwicm90YXRpb25cIjogLTEuMjE1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTRSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE1LTJcIiwgXCJ4XCI6IC03MTcuMywgXCJ5XCI6IDU3MiwgXCJ6b29tWFwiOiAwLjIxLCBcInpvb21ZXCI6IDAuMjA2LCBcInJvdGF0aW9uXCI6IC0xLjQ3LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTVyXzJbU1ZDMl0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTYtMlwiLCBcInhcIjogLTkyLCBcInlcIjogMzM2LjUsIFwiem9vbVhcIjogMC4yMTcsIFwiem9vbVlcIjogMC4yMSwgXCJyb3RhdGlvblwiOiAtMC4xLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTZyXzJbU1ZDMl0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTdcIiwgXCJ4XCI6IDc3LCBcInlcIjogMjc4LjUsIFwiem9vbVhcIjogMC4yMDYsIFwiem9vbVlcIjogMC4yMDYsIFwicm90YXRpb25cIjogLTAuMDU1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTdSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE4XCIsIFwieFwiOiAyMjksIFwieVwiOiAyMzkuNSwgXCJ6b29tWFwiOiAwLjIwOCwgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAwLjA3LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMThSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE5XCIsIFwieFwiOiA3MS41LCBcInlcIjogNDc0LCBcInpvb21YXCI6IDAuMjAzLCBcInpvb21ZXCI6IDAuMjA4LCBcInJvdGF0aW9uXCI6IDAuMTcsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxOVJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMjBcIiwgXCJ4XCI6IDQzLjUsIFwieVwiOiA2NDAsIFwiem9vbVhcIjogMC4xLCBcInpvb21ZXCI6IDAuMTA0LCBcInJvdGF0aW9uXCI6IDAuMjA1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMjBSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9XG5cbl1cblxuXG5cbiIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1xuXHRcdFwibmFtZVwiOiBcImhlbnJpZXR0YVwiLCBcInhcIjogLTQ4Ni41LCBcInlcIjogLTI1Mi41LCBcInpvb21YXCI6IDAuMjksIFwiem9vbVlcIjogMC41LCBcInJvdGF0aW9uXCI6IDAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9oZW5yaWV0dGEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibWF0ZXJcIiwgXCJ4XCI6IC0zNDIsIFwieVwiOiAtNzQ3LCBcInpvb21YXCI6IDAuMDgsIFwiem9vbVlcIjogMC4xOCwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21hdGVybWlzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInBldGVyc1wiLCBcInhcIjogLTcxOSwgXCJ5XCI6IC04MzYsIFwiem9vbVhcIjogMC4wNywgXCJ6b29tWVwiOiAwLjE0LCBcInJvdGF0aW9uXCI6IC0wLjE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvcGV0ZXJzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm9jb25uZWxsXCIsIFwieFwiOiAtODIxLCBcInlcIjogLTE4MzUsIFwiem9vbVhcIjogMC4yNSwgXCJ6b29tWVwiOiAwLjI1LCBcInJvdGF0aW9uXCI6IDAsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9vY29ubmVsbC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImZvdXJjb3VydHNcIiwgXCJ4XCI6IC01NjcuNSwgXCJ5XCI6IDMyMy41LCBcInpvb21YXCI6IDAuMTYsIFwiem9vbVlcIjogMC4zMjgsIFwicm90YXRpb25cIjogLTAuMTIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9mb3VyY291cnRzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibWljaGFuc1wiLCBcInhcIjogLTYzOSwgXCJ5XCI6IDE2MCwgXCJ6b29tWFwiOiAwLjE0LCBcInpvb21ZXCI6IDAuMjQsIFwicm90YXRpb25cIjogMC4wMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21pY2hhbnMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ0aGVjYXN0bGVcIiwgXCJ4XCI6IC0yOTAsIFwieVwiOiA1MjAsIFwiem9vbVhcIjogMC4yMiwgXCJ6b29tWVwiOiAwLjQyLCBcInJvdGF0aW9uXCI6IC0wLjAxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL3RoZWNhc3RsZS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtYXJrZXRcIiwgXCJ4XCI6IC02MTcsIFwieVwiOiA1NjUsIFwiem9vbVhcIjogMC4xNSwgXCJ6b29tWVwiOiAwLjI2LCBcInJvdGF0aW9uXCI6IDAuMDQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9tYXJrZXQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJwYXRyaWNrc1wiLCBcInhcIjogLTQ2MiwgXCJ5XCI6IDc5NSwgXCJ6b29tWFwiOiAwLjEsIFwiem9vbVlcIjogMC4xMiwgXCJyb3RhdGlvblwiOiAwLjA0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvcGF0cmlja3MucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJuZ2lyZWxhbmRcIiwgXCJ4XCI6IDQzMSwgXCJ5XCI6IDY5NCwgXCJ6b29tWFwiOiAwLjE0LCBcInpvb21ZXCI6IDAuMzc1LCBcInJvdGF0aW9uXCI6IC0wLjEzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL25naXJlbGFuZC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjhcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImJsdWVjb2F0c1wiLCBcInhcIjogLTk5NywgXCJ5XCI6IDg2LCBcInpvb21YXCI6IDAuMSwgXCJ6b29tWVwiOiAwLjIsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9ibHVlY29hdHMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJjb2xsaW5zYmFycmFja3NcIiwgXCJ4XCI6IC0xMTMwLCBcInlcIjogOTAsIFwiem9vbVhcIjogMC4xMywgXCJ6b29tWVwiOiAwLjM3LCBcInJvdGF0aW9uXCI6IDAuMDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvY29sbGluc2JhcnJhY2tzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiaHVnaGxhbmVcIiwgXCJ4XCI6IC0xNzIsIFwieVwiOiAtMzM1LCBcInpvb21YXCI6IDAuMiwgXCJ6b29tWVwiOiAwLjMzLCBcInJvdGF0aW9uXCI6IC0wLjA2LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvaHVnaGxhbmUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJncG9cIiwgXCJ4XCI6IDUyLCBcInlcIjogNTAsIFwiem9vbVhcIjogMC4wODYsIFwiem9vbVlcIjogMC4yNSwgXCJyb3RhdGlvblwiOiAtMC4wMzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9ncG8ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtb3VudGpveVwiLCBcInhcIjogMjYzLCBcInlcIjogLTU2MCwgXCJ6b29tWFwiOiAwLjE1LCBcInpvb21ZXCI6IDAuMjg1LCBcInJvdGF0aW9uXCI6IDAuMTcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9tb3VudGpveS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm1vdW50am95YlwiLCBcInhcIjogMTUyLCBcInlcIjogLTU3MCwgXCJ6b29tWFwiOiAwLjIsIFwiem9vbVlcIjogMC4zMDUsIFwicm90YXRpb25cIjogMC4wNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21vdW50am95Yi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInJveWFsaG9zcGl0YWxcIiwgXCJ4XCI6IC0xODUxLCBcInlcIjogNDg3LjUsIFwiem9vbVhcIjogMC4yMSwgXCJ6b29tWVwiOiAwLjMsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9yb3lhbGhvc3BpdGFsLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwicGVwcGVyXCIsIFwieFwiOiA4MzQsIFwieVwiOiA5OTAsIFwiem9vbVhcIjogMC4wNiwgXCJ6b29tWVwiOiAwLjE0NSwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL3BlcHBlci5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImxpYmVydHloYWxsXCIsIFwieFwiOiAyNzAsIFwieVwiOiAtMTQsIFwiem9vbVhcIjogMC40MywgXCJ6b29tWVwiOiAwLjQzLCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbGliZXJ0eS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImN1c3RvbXNob3VzZVwiLCBcInhcIjogMzgyLCBcInlcIjogMTA3LCBcInpvb21YXCI6IDAuMTUsIFwiem9vbVlcIjogMC4zMCwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2N1c3RvbXNob3VzZS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fVxuXSIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMzJcIiwgXCJ4XCI6IC03NzYsIFwieVwiOiAzMi41NSwgXCJ6b29tWFwiOiAwLjI5LCBcInpvb21ZXCI6IDAuMjgsIFwicm90YXRpb25cIjogLTEuNDcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0wMzItbS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDb25zdGl0dXRpb24gSGlsbCAtIFR1cm5waWtlLCBHbGFzbmV2aW4gUm9hZDsgc2hvd2luZyBwcm9wb3NlZCByb2FkIHRvIEJvdGFuaWMgR2FyZGVuc1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDcyXCIsIFwieFwiOiAtMjUyLCBcInlcIjogLTI0NywgXCJ6b29tWFwiOiAwLjMxOCwgXCJ6b29tWVwiOiAwLjMxNCwgXCJyb3RhdGlvblwiOiAxLjU4NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTA3Mi1tLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBvZiBpbXByb3ZpbmcgdGhlIHN0cmVldHMgYmV0d2VlbiBSaWNobW9uZCBCcmlkZ2UgKEZvdXIgQ291cnRzKSBhbmQgQ29uc3RpdHV0aW9uIEhpbGwgKEtpbmfigJlzIElubnMpIERhdGU6IDE4MzdcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA3NVwiLCBcInhcIjogLTIxNy41LCBcInlcIjogLTE0MTQuNSwgXCJ6b29tWFwiOiAwLjg3LCBcInpvb21ZXCI6IDAuNzcyLCBcInJvdGF0aW9uXCI6IDEuNjE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMDc1LW0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTdXJ2ZXkgb2YgYSBsaW5lIG9mIHJvYWQsIGxlYWRpbmcgZnJvbSBMaW5lbiBIYWxsIHRvIEdsYXNuZXZpbiBSb2FkLCBzaG93aW5nIHRoZSBSb3lhbCBDYW5hbCBEYXRlOiAxODAwXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zNjFcIiwgXCJ4XCI6IDQ2NCwgXCJ5XCI6IDIxMzEsIFwiem9vbVhcIjogMC40MzYsIFwiem9vbVlcIjogMC40MzYsIFwicm90YXRpb25cIjogLTIuMDQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzYxLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTGVlc29uIFN0cmVldCwgUG9ydGxhbmQgU3RyZWV0IChub3cgVXBwZXIgTGVlc29uIFN0cmVldCksIEV1c3RhY2UgUGxhY2UsIEV1c3RhY2UgQnJpZGdlIChub3cgTGVlc29uIFN0cmVldCksIEhhdGNoIFN0cmVldCwgQ2lyY3VsYXIgUm9hZCAtIHNpZ25lZCBieSBDb21taXNzaW9uZXJzIG9mIFdpZGUgU3RyZWV0cyBEYXRlOiAxNzkyXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wODgtMVwiLCBcInhcIjogLTAuOSwgXCJ5XCI6IDIuNjcsIFwiem9vbVhcIjogMC41LCBcInpvb21ZXCI6IDAuNSwgXCJyb3RhdGlvblwiOiAtMy4zMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTA4OC0xLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuMFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTEwNi0xXCIsIFwieFwiOiAtNzU3LCBcInlcIjogNDk1LjUsIFwiem9vbVhcIjogMC4yNjUsIFwiem9vbVlcIjogMC4yNjUsIFwicm90YXRpb25cIjogLTAuMDc0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTA2LTEuanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMS4wLCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIHNob3dpbmcgcHJvcG9zZWQgaW1wcm92ZW1lbnRzIHRvIGJlIG1hZGUgaW4gQ29ybm1hcmtldCwgQ3V0cHVyc2UgUm93LCBMYW1iIEFsbGV5IC0gRnJhbmNpcyBTdHJlZXQgLSBhbmQgYW4gaW1wcm92ZWQgZW50cmFuY2UgZnJvbSBLZXZpbiBTdHJlZXQgdG8gU2FpbnQgUGF0cmlja+KAmXMgQ2F0aGVkcmFsLCB0aHJvdWdoIE1pdHJlIEFsbGV5IGFuZCBhdCBKYW1lc+KAmXMgR2F0ZS4gRGF0ZTogMTg0NS00NiBcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE0MlwiLCBcInhcIjogOTQuOTk1LCBcInlcIjogMjM3Ny41LCBcInpvb21YXCI6IDAuNDgyLCBcInpvb21ZXCI6IDAuNDc2LCBcInJvdGF0aW9uXCI6IC0yLjAxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE0Mi1sLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDEuMCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBOZXcgU3RyZWV0cywgYW5kIG90aGVyIGltcHJvdmVtZW50cyBpbnRlbmRlZCB0byBiZSBpbW1lZGlhdGVseSBleGVjdXRlZC4gU2l0dWF0ZSBvbiB0aGUgU291dGggU2lkZSBvZiB0aGUgQ2l0eSBvZiBEdWJsaW4sIHN1Ym1pdHRlZCBmb3IgdGhlIGFwcHJvYmF0aW9uIG9mIHRoZSBDb21taXNzaW9uZXJzIG9mIFdpZGUgU3RyZWV0cywgcGFydGljdWxhcmx5IG9mIHRob3NlIHBhcnRzIGJlbG9uZ2luZyB0byBXbS4gQ29wZSBhbmQgSm9obiBMb2NrZXIsIEVzcS4sIEhhcmNvdXJ0IFN0cmVldCwgQ2hhcmxlbW91bnQgU3RyZWV0LCBQb3J0b2JlbGxvLCBldGMuIERhdGU6IDE3OTJcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE1NVwiLCBcInhcIjogLTE1MDYsIFwieVwiOiAtNTAuNSwgXCJ6b29tWFwiOiAxLjAxLCBcInpvb21ZXCI6IDAuOTcyLCBcInJvdGF0aW9uXCI6IC0wLjAyNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE1NS1tLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTmV3IGFwcHJvYWNoIGZyb20gTWlsaXRhcnkgUm9hZCB0byBLaW5n4oCZcyBCcmlkZ2UsIGFuZCBhbG9uZyB0aGUgUXVheXMgdG8gQXN0b27igJlzIFF1YXkgRGF0ZTogMTg0MVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTU3LTNcIiwgXCJ4XCI6IDMuMTE1LCBcInlcIjogMy42NSwgXCJ6b29tWFwiOiAwLjUyNSwgXCJ6b29tWVwiOiAwLjU5LCBcInJvdGF0aW9uXCI6IDAuNTQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0xNTctMy1tLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuMCwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcInNob3dpbmcgdGhlIGltcHJvdmVtZW50cyBwcm9wb3NlZCBieSB0aGUgQ29tbWlzc2lvbmVycyBvZiBXaWRlIFN0cmVldHMgaW4gTmFzc2F1IFN0cmVldCwgTGVpbnN0ZXIgU3RyZWV0IGFuZCBDbGFyZSBTdHJlZXRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE2NFwiLCBcInhcIjogLTQ3MiwgXCJ5XCI6ODA1LCBcInpvb21YXCI6IDAuMDU2LCBcInpvb21ZXCI6IDAuMDU2LCBcInJvdGF0aW9uXCI6IDAuMDksIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0xNjQtbC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxLjAsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIFNhaW50IFBhdHJpY2vigJlzLCBldGMuIERhdGU6IDE4MjRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ2OS0wMlwiLCBcInhcIjogMjU1LCBcInlcIjogMTM4OS41LCBcInpvb21YXCI6IDAuMjQ1LCBcInpvb21ZXCI6IDAuMjQ1LCBcInJvdGF0aW9uXCI6IC0yLjc1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNDY5LTItbS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJFYXJsc2ZvcnQgVGVycmFjZSwgU3RlcGhlbuKAmXMgR3JlZW4gU291dGggYW5kIEhhcmNvdXJ0IFN0cmVldCBzaG93aW5nIHBsYW4gb2YgcHJvcG9zZWQgbmV3IHN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzU1LTFcIiwgXCJ4XCI6IDY5NiwgXCJ5XCI6IDcxMy41LCBcInpvb21YXCI6IDAuMzIzLCBcInpvb21ZXCI6IDAuMjg5LCBcInJvdGF0aW9uXCI6IDEuMTQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzU1LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBvZiBCYWdnb3QgU3RyZWV0IGFuZCBGaXR6d2lsbGlhbSBTdHJlZXQsIHNob3dpbmcgYXZlbnVlcyB0aGVyZW9mIE5vLiAxIERhdGU6IDE3OTBcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTcyOVwiLCBcInhcIjogLTEwODguNSwgXCJ5XCI6IDY1MiwgXCJ6b29tWFwiOiAwLjE4NCwgXCJ6b29tWVwiOiAwLjE4NCwgXCJyb3RhdGlvblwiOiAtMy40MjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy03MjkucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gSmFtZXPigJlzIFN0cmVldCwgQmFzb24gTGFuZSwgRWNobGlu4oCZcyBMYW5lLCBHcmFuZCBDYW5hbCBQbGFjZSwgQ2l0eSBCYXNvbiBhbmQgR3JhbmQgQ2FuYWwgSGFyYm91clwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNzU3XCIsIFwieFwiOiAtODgxLCBcInlcIjogMjYxLjUsIFwiem9vbVhcIjogMC4zNTUsIFwiem9vbVlcIjogMC4zNTUsIFwicm90YXRpb25cIjogLTAuMDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNzU3LWwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiZm91ciBjb3VydHMgdG8gc3QgcGF0cmlja3MsIHRoZSBjYXN0bGUgdG8gdGhvbWFzIHN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTM4XCIsIFwieFwiOiAyMTIuNSwgXCJ5XCI6IDE0NywgXCJ6b29tWFwiOiAwLjE5LCBcInpvb21ZXCI6IDAuMTc2LCBcInJvdGF0aW9uXCI6IDAsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0xMzgtbC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjQsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwcmVtaXNlcywgR2Vvcmdl4oCZcyBRdWF5LCBDaXR5IFF1YXksIFRvd25zZW5kIFN0cmVldCBhbmQgbmVpZ2hib3VyaG9vZCwgc2hvd2luZyBwcm9wZXJ0eSBsb3N0IHRvIHRoZSBDaXR5LCBpbiBhIHN1aXQgYnkgJ1RoZSBDb3Jwb3JhdGlvbiAtIHdpdGggVHJpbml0eSBDb2xsZWdlJ1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTg5XCIsIFwieFwiOiAtNzkyLjUsIFwieVwiOiAyNjIuNSwgXCJ6b29tWFwiOiAwLjI2LCBcInpvb21ZXCI6IDAuMjU4LCBcInJvdGF0aW9uXCI6IDAuMDAzLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE4OS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNvcHkgb2YgbWFwIG9mIHByb3Bvc2VkIE5ldyBTdHJlZXQgZnJvbSBFc3NleCBTdHJlZXQgdG8gQ29ybm1hcmtldCwgd2l0aCB0aGUgZW52aXJvbnMgYW5kIHN0cmVldHMgYnJhbmNoaW5nIG9mZlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDk4XCIsIFwieFwiOiAtNDc1LCBcInlcIjogNTI0LCBcInpvb21YXCI6IDAuMDYzLCBcInpvb21ZXCI6IDAuMDYzLCBcInJvdGF0aW9uXCI6IC0wLjE2LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMDk4LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIENocmlzdGNodXJjaCwgU2tpbm5lcnMgUm93IGV0Yy4gVGhvbWFzIFNoZXJyYXJkLCA1IEphbnVhcnkgMTgyMSBEYXRlOiAxODIxXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yMDJcIiwgXCJ4XCI6IDE2LCBcInlcIjogODEsIFwiem9vbVhcIjogMC4yODksIFwiem9vbVlcIjogMC4yNjMsIFwicm90YXRpb25cIjogLTAuMTA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTIwMi1jLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiYXJlYSBpbW1lZGlhdGVseSBub3J0aCBvZiBSaXZlciBMaWZmZXkgZnJvbSBTYWNrdmlsbGUgU3QsIExvd2VyIEFiYmV5IFN0LCBCZXJlc2ZvcmQgUGxhY2UsIGFzIGZhciBhcyBlbmQgb2YgTm9ydGggV2FsbC4gQWxzbyBzb3V0aCBvZiBMaWZmZXkgZnJvbSBXZXN0bW9ybGFuZCBTdHJlZXQgdG8gZW5kIG9mIEpvaG4gUm9nZXJzb24ncyBRdWF5XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNzlcIiwgXCJ4XCI6IC01MzcuNSwgXCJ5XCI6IDczMCwgXCJ6b29tWFwiOiAwLjE2OCwgXCJ6b29tWVwiOiAwLjE2NCwgXCJyb3RhdGlvblwiOiAwLjAyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE3OS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxLjAsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlNhaW50IFBhdHJpY2vigJlzIENhdGhlZHJhbCwgTm9ydGggQ2xvc2UgYW5kIHZpY2luaXR5XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMjlcIiwgXCJ4XCI6IC02NzgsIFwieVwiOiAzNDUuNSwgXCJ6b29tWFwiOiAwLjMzNiwgXCJ6b29tWVwiOiAwLjMzNiwgXCJyb3RhdGlvblwiOiAtMC4yMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzI5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuMyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBmb3Igb3BlbmluZyBhbmQgd2lkZW5pbmcgYSBwcmluY2lwYWwgQXZlbnVlIHRvIHRoZSBDYXN0bGUsIG5vdyAoMTkwMCkgUGFybGlhbWVudCBTdHJlZXQgLSBzaG93aW5nIERhbWUgU3RyZWV0LCBDYXN0bGUgU3RyZWV0LCBhbmQgYWxsIHRoZSBBdmVudWVzIHRoZXJlb2YgRGF0ZTogMTc1N1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTg3XCIsIFwieFwiOiAtMjI2LCBcInlcIjogNDk0LjUsIFwiem9vbVhcIjogMC4wNjYsIFwiem9vbVlcIjogMC4wNjQsIFwicm90YXRpb25cIjogMC4wLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE4Ny5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxLjAsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkEgc3VydmV5IG9mIHNldmVyYWwgaG9sZGluZ3MgaW4gU291dGggR3JlYXQgR2VvcmdlJ3MgU3RyZWV0IC0gdG90YWwgcHVyY2hhc2UgwqMxMTUyOC4xNi4zIERhdGU6MTgwMVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTI0XCIsIFwieFwiOiAtMjc5LCBcInlcIjogMzY2LCBcInpvb21YXCI6IDAuMDU3LCBcInpvb21ZXCI6IDAuMDUxLCBcInJvdGF0aW9uXCI6IC0wLjE2LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTEyNC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjQsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwcmVtaXNlcyBpbiBFc3NleCBTdHJlZXQgYW5kIFBhcmxpYW1lbnQgU3RyZWV0LCBzaG93aW5nIEVzc2V4IEJyaWRnZSBhbmQgT2xkIEN1c3RvbSBIb3VzZS4gVC4gYW5kIEQuSC4gU2hlcnJhcmQgRGF0ZTogMTgxM1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzYwXCIsIFwieFwiOiAtMTQ0LCBcInlcIjogNDIxLjUsIFwiem9vbVhcIjogMC4xMjEsIFwiem9vbVlcIjogMC4xMDcsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzYwLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gRGFtZSBTdHJlZXQgYW5kIGF2ZW51ZXMgdGhlcmVvZiAtIEV1c3RhY2UgU3RyZWV0LCBDZWNpbGlhIFN0cmVldCwgYW5kIHNpdGUgb2YgT2xkIFRoZWF0cmUsIEZvd25lcyBTdHJlZXQsIENyb3duIEFsbGV5IGFuZCBDb3BlIFN0cmVldCBEYXRlOiAxNzkyXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zNjJcIiwgXCJ4XCI6IDM1LjUsIFwieVwiOiA4NC41LCBcInpvb21YXCI6IDAuMjI5LCBcInpvb21ZXCI6IDAuMjM1LCBcInJvdGF0aW9uXCI6IDAuMTI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM2Mi0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwcyAtIENvbGxlZ2UgR3JlZW4sIENvbGxlZ2UgU3RyZWV0LCBXZXN0bW9yZWxhbmQgU3RyZWV0IGFuZCBhdmVudWVzIHRoZXJlb2YsIHNob3dpbmcgdGhlIHNpdGUgb2YgUGFybGlhbWVudCBIb3VzZSBhbmQgVHJpbml0eSBDb2xsZWdlIE5vLiAxIERhdGU6IDE3OTNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM4N1wiLCBcInhcIjogMjcyLjUsIFwieVwiOiA0MjMuNSwgXCJ6b29tWFwiOiAwLjA4MSwgXCJ6b29tWVwiOiAwLjA3NywgXCJyb3RhdGlvblwiOiAzLjAzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zODcucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTdXJ2ZXkgb2YgaG9sZGluZ3MgaW4gRmxlZXQgU3RyZWV0IGFuZCBDb2xsZWdlIFN0cmVldCwgc2hvd2luZyBzaXRlIG9mIE9sZCBXYXRjaCBIb3VzZSBEYXRlOiAxODAxXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yMThcIiwgXCJ4XCI6IC0yNDU1LCBcInlcIjogLTI4NC41LCBcInpvb21YXCI6IDAuNDUzLCBcInpvb21ZXCI6IDAuNDUxLCBcInJvdGF0aW9uXCI6IC0wLjA0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTIxOC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiB0aGUgTG9uZyBNZWFkb3dzIGFuZCBwYXJ0IG9mIHRoZSBQaG9lbml4IFBhcmsgYW5kIFBhcmtnYXRlIFN0cmVldCBEYXRlOiAxNzg2XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yMjlcIiwgXCJ4XCI6IC0yMzg0LCBcInlcIjogNTUuNSwgXCJ6b29tWFwiOiAwLjM3OSwgXCJ6b29tWVwiOiAwLjM3OSwgXCJyb3RhdGlvblwiOiAwLjAxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yMjkucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTZWN0aW9uIGFjcm9zcyB0aGUgcHJvcG9zZWQgUm9hZCBmcm9tIHRoZSBQYXJrIEdhdGUgdG8gSXNsYW5kIEJyaWRnZSBHYXRlIC0gbm93ICgxOTAwKSBDb255bmdoYW0gUm9hZCBEYXRlOiAxNzg5XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yNDJcIiwgXCJ4XCI6IC00MDUuNSwgXCJ5XCI6IDIxLCBcInpvb21YXCI6IDAuMDg0LCBcInpvb21ZXCI6IDAuMDg0LCBcInJvdGF0aW9uXCI6IDEuMDg1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTI0Mi0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIGEgaG9sZGluZyBpbiBNYXJ54oCZcyBMYW5lLCB0aGUgZXN0YXRlIG9mIHRoZSBSaWdodCBIb25vdXJhYmxlIExvcmQgTW91bnRqb3kgRGF0ZTogMTc5M1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjQ1XCIsIFwieFwiOiAtMjEwLjAsIFwieVwiOi0zOTcuNSwgXCJ6b29tWFwiOiAwLjA4NCwgXCJ6b29tWVwiOiAwLjA4NCwgXCJyb3RhdGlvblwiOiAtMC42MiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yNDUtMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiB0aGUgQmFybGV5IEZpZWxkcyBldGMuLCBhbmQgYSBwbGFuIGZvciBvcGVuaW5nIGEgc3RyZWV0IGZyb20gUnV0bGFuZCBTcXVhcmUsIERvcnNldCBTdHJlZXQsIGJlaW5nIG5vdyAoMTg5OSkga25vd24gYXMgU291dGggRnJlZGVyaWNrIFN0cmVldCAtIHdpdGggcmVmZXJlbmNlIERhdGU6IDE3ODlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTI1N1wiLCBcInhcIjogNjgxLjAsIFwieVwiOi0xMjIzLjUsIFwiem9vbVhcIjogMC4zNDYsIFwiem9vbVlcIjogMC4zODgsIFwicm90YXRpb25cIjogMC4yNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yNTcucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgQ2xvbmxpZmZlIFJvYWQgYW5kIHRoZSBPbGQgVHVybnBpa2UgSG91c2UgYXQgQmFsbHlib3VnaCBCcmlkZ2UgLSBOb3J0aCBTdHJhbmQgRGF0ZTogMTgyM1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjY4XCIsIFwieFwiOiAtMTUyOC4wLCBcInlcIjogMTA1LjUsIFwiem9vbVhcIjogMC4wODYsIFwiem9vbVlcIjogMC4wODYsIFwicm90YXRpb25cIjogMC4wNywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yNjgtMy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCAtIFBhcmtnYXRlIFN0cmVldCwgQ29ueW5naGFtIFJvYWQsIHdpdGggcmVmZXJlbmNlIHRvIG5hbWVzIG9mIHRlbmFudHMgZW5kb3JzZWQgTm8uIDNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE3MVwiLCBcInhcIjogMTEyLjAsIFwieVwiOiAxODEuNSwgXCJ6b29tWFwiOiAwLjAyMSwgXCJ6b29tWVwiOiAwLjAyMSwgXCJyb3RhdGlvblwiOiAtMC4yNjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTcxLTIuanBlZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIExvd2VyIEFiYmV5IFN0cmVldCwgdG8gY29ybmVyIG9mIEVkZW4gUXVheSAoU2Fja3ZpbGxlIFN0cmVldCkgRGF0ZTogMTgxM1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzgwXCIsIFwieFwiOiAyNDEuNSwgXCJ5XCI6IDI4NiwgXCJ6b29tWFwiOiAwLjAzMywgXCJ6b29tWVwiOiAwLjAzMywgXCJyb3RhdGlvblwiOiAwLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM4MC0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gRmxlZXQgTWFya2V0LCBQb29sYmVnIFN0cmVldCwgSGF3a2lucyBTdHJlZXQsIFRvd25zZW5kIFN0cmVldCwgRmxlZXQgU3RyZWV0LCBEdWJsaW4gU29jaWV0eSBTdG9yZXMgRGF0ZTogMTgwMFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzA5XCIsIFwieFwiOiAzNi4wLCBcInlcIjogLTI5NywgXCJ6b29tWFwiOiAwLjIxOSwgXCJ6b29tWVwiOiAwLjIxOSwgXCJyb3RhdGlvblwiOiAtMC40MzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzA5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGFydCBvZiBHYXJkaW5lciBTdHJlZXQgYW5kIHBhcnQgb2YgR2xvdWNlc3RlciBTdHJlZXQsIGxhbmQgb3V0IGluIGxvdHMgZm9yIGJ1aWxkaW5nIC0gc2hvd2luZyBHbG91Y2VzdGVyIFN0cmVldCwgR2xvdWNlc3RlciBQbGFjZSwgdGhlIERpYW1vbmQsIFN1bW1lciBIaWxsLCBHcmVhdCBCcml0YWluIFN0cmVldCwgQ3VtYmVybGFuZCBTdHJlZXQsIE1hcmxib3Jv4oCZIFN0cmVldCwgTWFiYm90IFN0cmVldCwgTWVja2xpbmJ1cmdoIGV0Yy5EYXRlOiAxNzkxXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yOTRcIiwgXCJ4XCI6IDEyNS4wLCBcInlcIjogLTExOCwgXCJ6b29tWFwiOiAwLjEyOSwgXCJ6b29tWVwiOiAwLjEyOSwgXCJyb3RhdGlvblwiOiAtMC4xOTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0yOTQtMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiBwYXJ0IG9mIHRoZSBMb3Jkc2hpcCBvZiBTYWludCBNYXJ54oCZcyBBYmJleSAtIHBhcnQgb2YgdGhlIGVzdGF0ZSBvZiB0aGUgUmlnaHQgSG9ub3JhYmxlIEx1a2UgVmlzY291bnQgTW91bnRqb3ksIHNvbGQgdG8gUmljaGFyZCBGcmVuY2ggRXNxLiwgcHVyc3VhbnQgdG8gYSBEZWNyZWUgb2YgSGlzIE1hamVzdHnigJlzIEhpZ2ggQ291cnQgb2YgQ2hhbmNlcnksIDE3IEZlYiAxNzk0XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMTBcIiwgXCJ4XCI6IDQ3NC4wLCBcInlcIjogLTgyMS41LCBcInpvb21YXCI6IDAuNTc2LCBcInpvb21ZXCI6IDAuNTc2LCBcInJvdGF0aW9uXCI6IDAuMTQ1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMxMC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk5vcnRoIExvdHMgLSBmcm9tIHRoZSBOb3J0aCBTdHJhbmQgUm9hZCwgdG8gdGhlIE5vcnRoIGFuZCBFYXN0IFdhbGxzIERhdGU6IDE3OTNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTMyNVwiLCBcInhcIjogLTg5My4wLCBcInlcIjogNDEsIFwiem9vbVhcIjogMC4yODYsIFwiem9vbVlcIjogMC4yODYsIFwicm90YXRpb25cIjogMC4wMywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zMjUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTbWl0aGZpZWxkLCBBcnJhbiBRdWF5LCBIYXltYXJrZXQsIFdlc3QgQXJyYW4gU3RyZWV0LCBOZXcgQ2h1cmNoIFN0cmVldCwgQm93IExhbmUsIEJvdyBTdHJlZXQsIE1heSBMYW5lXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMjYtMVwiLCBcInhcIjogLTE0MTUuNSwgXCJ5XCI6IDExMi41LCBcInpvb21YXCI6IDAuMTE0LCBcInpvb21ZXCI6IDAuMTEyLCBcInJvdGF0aW9uXCI6IDAuMTcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzI2LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJCYXJyYWNrIFN0cmVldCwgUGFyayBTdHJlZXQsIFBhcmtnYXRlIFN0cmVldCBhbmQgVGVtcGxlIFN0cmVldCwgd2l0aCByZWZlcmVuY2UgdG8gbmFtZXMgb2YgdGVuYW50cyBhbmQgcHJlbWlzZXMgTm8uIDFcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTYzMlwiLCBcInhcIjogMTI1LCBcInlcIjogMzQ3LjUsIFwiem9vbVhcIjogMC4xNzIsIFwiem9vbVlcIjogMC4xNjQsIFwicm90YXRpb25cIjogMC41MywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy02MzIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgTmFzc2F1IFN0cmVldCwgbGVhZGluZyBmcm9tIEdyYWZ0b24gU3RyZWV0IHRvIE1lcnJpb24gU3F1YXJlIC0gc2hvd2luZyB0aGUgb2ZmIHN0cmVldHMgYW5kIHBvcnRpb24gb2YgR3JhZnRvbiBTdHJlZXQgYW5kIFN1ZmZvbGsgU3RyZWV0IERhdGU6IDE4MzNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTMyNi0yXCIsIFwieFwiOiAtMTI1Ny41LCBcInlcIjogMTQzLjUsIFwiem9vbVhcIjogMC4xLCBcInpvb21ZXCI6IDAuMSwgXCJyb3RhdGlvblwiOiAwLjA3NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zMjYtMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkJhcnJhY2sgU3RyZWV0LCBQYXJrIFN0cmVldCwgUGFya2dhdGUgU3RyZWV0IGFuZCBUZW1wbGUgU3RyZWV0LCB3aXRoIHJlZmVyZW5jZSB0byBuYW1lcyBvZiB0ZW5hbnRzIGFuZCBwcmVtaXNlc1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzM0XCIsIFwieFwiOiA5MC41LCBcInlcIjogMzU3LCBcInpvb21YXCI6IDAuMTI4LCBcInpvb21ZXCI6IDAuMTI4LCBcInJvdGF0aW9uXCI6IDEuMjY1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMzNC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjEsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkRhbWUgU3RyZWV0LCBDb2xsZWdlIEdyZWVuLCBHZW9yZ2XigJlzIExhbmUsIEdlb3JnZeKAmXMgU3RyZWV0LCBDaGVxdWVyIFN0cmVldCBhbmQgYXZlbnVlcyB0aGVyZW9mXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zNTUtMlwiLCBcInhcIjogMTg1LCBcInlcIjogMTAyOSwgXCJ6b29tWFwiOiAwLjMwMiwgXCJ6b29tWVwiOiAwLjMwMiwgXCJyb3RhdGlvblwiOiAtMC40NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNTUtMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gb2YgQmFnZ290IFN0cmVldCBhbmQgRml0endpbGxpYW0gU3RyZWV0LCBzaG93aW5nIGF2ZW51ZXMgdGhlcmVvZiBOby4gMiBEYXRlOiAxNzkyXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zNjhcIiwgXCJ4XCI6IC02ODcuNSwgXCJ5XCI6IDI3Ny41LCBcInpvb21YXCI6IDAuMTU2LCBcInpvb21ZXCI6IDAuMTUsIFwicm90YXRpb25cIjogMC4xMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNjgucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgS2luZ+KAmXMgSW5uIFF1YXkgYW5kIE1lcmNoYW50cyBRdWF5LCBzaG93aW5nIHNpdGUgb2YgT3Jtb25kIEJyaWRnZSAtIGJlbG93IENoYXJsZXMgU3RyZWV0IC0gYWZ0ZXJ3YXJkcyByZW1vdmVkIGFuZCByZS1lcmVjdGVkIG9wcG9zaXRlIFdpbmV0YXZlcm4gU3RyZWV0IERhdGU6IDE3OTdcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM3MlwiLCBcInhcIjogMzQxLjUsIFwieVwiOiAyOTYuNSwgXCJ6b29tWFwiOiAwLjAzNiwgXCJ6b29tWVwiOiAwLjAzMzksIFwicm90YXRpb25cIjogMi45NTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzcyLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiR2VvcmdlJ3MgUXVheSwgV2hpdGVzIExhbmUsIGFuZCBIYXdraW5zIFN0cmVldCwgc2hvd2luZyBzaXRlIG9mIFN3ZWV0bWFuJ3MgQnJld2VyeSB3aGljaCByYW4gZG93biB0byBSaXZlciBMaWZmZXkgRGF0ZTogMTc5OVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzkwLTFcIiwgXCJ4XCI6IC04MDQuNSwgXCJ5XCI6IDQyMCwgXCJ6b29tWFwiOiAwLjIwNCwgXCJ6b29tWVwiOiAwLjIwMiwgXCJyb3RhdGlvblwiOiAtMC4wNywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zOTAtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gb2YgcHJvcG9zZWQgTWFya2V0IEhvdXNlLCBhZGpvaW5pbmcgVGhvbWFzIFN0cmVldCwgVmljYXIgU3RyZWV0LCBNYXJrZXQgU3RyZWV0IGFuZCBGcmFuY2lzIFN0cmVldCBEYXRlOiAxODAxXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zOTUtM1wiLCBcInhcIjogLTU4OCwgXCJ5XCI6IDU3OCwgXCJ6b29tWFwiOiAwLjAzNiwgXCJ6b29tWVwiOiAwLjAzNiwgXCJyb3RhdGlvblwiOiAtMy42NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zOTUtMy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk5ldyBSb3cgYW5kIEN1dHB1cnNlIFJvdyBEYXRlOiAxODAwXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MDRcIiwgXCJ4XCI6IC0xNiwgXCJ5XCI6IDM3MiwgXCJ6b29tWFwiOiAwLjA2MiwgXCJ6b29tWVwiOiAwLjA2LCBcInJvdGF0aW9uXCI6IC0wLjI1NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MDQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJBbmdsZXNlYSBTdHJlZXQgYW5kIFBhcmxpYW1lbnQgSG91c2UgRGF0ZTogMTgwMlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDExXCIsIFwieFwiOiAzNDMuNSwgXCJ5XCI6IDY1NywgXCJ6b29tWFwiOiAwLjA4NiwgXCJ6b29tWVwiOiAwLjA4NiwgXCJyb3RhdGlvblwiOiAwLjMyNSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQxMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkxlaW5zdGVyIEhvdXNlIGFuZCBwYXJ0IG9mIHRoZSBlc3RhdGUgb2YgVmlzY291bnQgRml0endpbGxpYW0gKGZvcm1lcmx5IExlaW5zdGVyIExhd24pLCBsYWlkIG91dCBpbiBsb3RzIGZvciBidWlsZGluZyAtIHNob3dpbmcgS2lsZGFyZSBTdHJlZXQsIFVwcGVyIE1lcnJpb24gU3RyZWV0IGFuZCBMZWluc3RlciBQbGFjZSAoU3RyZWV0KSwgTWVycmlvbiBQbGFjZSwgYW5kIHRoZSBPbGQgQm91bmRhcnkgYmV0d2VlbiBMZWluc3RlciBhbmQgTG9yZCBGaXR6d2lsbGlhbSAtIHRha2VuIGZyb20gYSBtYXAgc2lnbmVkIFJvYmVydCBHaWJzb24sIE1heSAxOCwgMTc1NCBEYXRlOiAxODEyXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yNTFcIiwgXCJ4XCI6IDIyMCwgXCJ5XCI6IDY0LCBcInpvb21YXCI6IDAuMjM2LCBcInpvb21ZXCI6IDAuMjM2LCBcInJvdGF0aW9uXCI6IC0xLjQ5LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjUxLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHBvcnRpb24gb2YgQ2l0eSwgc2hvd2luZyBNb250Z29tZXJ5IFN0cmVldCwgTWVja2xpbmJ1cmdoIFN0cmVldCwgTG93ZXIgR2xvdWNlc3RlciBTdHJlZXQgYW5kIHBvcnRpb24gb2YgTWFiYm90IFN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDEzXCIsIFwieFwiOiAtMzczLCBcInlcIjogODA2LjUsIFwiem9vbVhcIjogMC4wNzgsIFwiem9vbVlcIjogMC4wNzYsIFwicm90YXRpb25cIjogLTAuMTUsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MTMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQZXRlciBTdHJlZXQsIFBldGVy4oCZcyBSb3csIFdoaXRlZnJpYXIgU3RyZWV0LCBXb29kIFN0cmVldCBhbmQgQnJpZGUgU3RyZWV0IC0gc2hvd2luZyBzaXRlIG9mIHRoZSBBbXBoaXRoZWF0cmUgaW4gQnJpZGUgU3RyZWV0LCB3aGVyZSB0aGUgTW9sZXluZXV4IENodXJjaCBub3cgKDE5MDApIHN0YW5kcyBEYXRlOiAxODEyXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MTRcIiwgXCJ4XCI6IC0xOTMuNSwgXCJ5XCI6IDM2My41LCBcInpvb21YXCI6IDAuMDcyLCBcInpvb21ZXCI6IDAuMDc0LCBcInJvdGF0aW9uXCI6IC0wLjIzLFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDE0LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiVGVtcGxlIEJhciwgV2VsbGluZ3RvbiBRdWF5LCBPbGQgQ3VzdG9tIEhvdXNlLCBCYWduaW8gU2xpcCBldGMuIERhdGU6IDE4MTNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQyMVwiLCBcInhcIjogLTQ3NC41LCBcInlcIjogNTI3LCBcInpvb21YXCI6IDAuMDYyLCBcInpvb21ZXCI6IDAuMDYsIFwicm90YXRpb25cIjogLTAuMTg1LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDIxLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBwcmVjaW5jdHMgb2YgQ2hyaXN0IENodXJjaCBEdWJsaW4sIHNob3dpbmcgU2tpbm5lcnMgUm93LCB0byB3aGljaCBpcyBhdHRhY2hlZCBhIE1lbW9yYW5kdW0gZGVub21pbmF0aW5nIHRoZSBwcmVtaXNlcywgdGFrZW4gYnkgdGhlIENvbW1pc3Npb25lcnMgb2YgV2lkZSBTdHJlZXRzIGZvciB0aGUgcHVycG9zZSBvZiB3aWRlbmluZyBzYWlkIFNraW5uZXJzIFJvdywgbm93ICgxOTAwKSBrbm93biBhcyBDaHJpc3QgQ2h1cmNoIFBsYWNlIERhdGU6IDE4MTdcIlxuXHR9LFxuXHR7IFxuXHRcdFwibmFtZVwiOiBcIndzYy00MDgtMlwiLCBcInhcIjogLTM5Ny41LCBcInlcIjogNTQ1LjUsIFwiem9vbVhcIjogMC4wNDQsIFwiem9vbVlcIjogMC4wNDQsIFwicm90YXRpb25cIjogLTAuMTIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDA4LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJXZXJidXJnaCBTdHJlZXQsIFNraW5uZXJzIFJvdywgRmlzaGFtYmxlIFN0cmVldCBhbmQgQ2FzdGxlIFN0cmVldCBEYXRlOiBjLiAxODEwXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MjUtMVwiLCBcInhcIjogLTkxNy41LCBcInlcIjogNTc3LjUsIFwiem9vbVhcIjogMC4wNDUsIFwiem9vbVlcIjogMC4wNDYsIFwicm90YXRpb25cIjogLTEuNDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQyNS0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWVhdGggUm93LCBNYXJr4oCZcyBBbGxleSBhbmQgRGlydHkgTGFuZSAtIHNob3dpbmcgQnJpZGdlZm9vdCBTdHJlZXQsIE1hc3MgTGFuZSwgVGhvbWFzIFN0cmVldCBhbmQgU3QuIENhdGhlcmluZeKAmXMgQ2h1cmNoIERhdGU6IDE4MjAtMjRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQyNlwiLCBcInhcIjogLTczNS41LCBcInlcIjogNTc4LjUsIFwiem9vbVhcIjogMC4wMzQsIFwiem9vbVlcIjogMC4wMzQsIFwicm90YXRpb25cIjogMS41NjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDI2LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHNldmVyYWwgaG91c2VzIGFuZCBwcmVtaXNlcyBvbiB0aGUgRWFzdCBzaWRlIG9mIE1lYXRoIFJvdywgdGhlIHByb3BlcnR5IG9mIE1yLiBKb2huIFdhbHNoIC0gc2hvd2luZyB0aGUgc2l0dWF0aW9uIG9mIFRob21hcyBTdHJlZXQsIEhhbmJ1cnkgTGFuZSBhbmQgc2l0ZSBvZiBDaGFwZWwgRGF0ZTogMTgyMVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTEyLTFcIiwgXCJ4XCI6IC0yOTAuNSwgXCJ5XCI6IDM0NC41LCBcInpvb21YXCI6IDAuMTgsIFwiem9vbVlcIjogMC4xODIsIFwicm90YXRpb25cIjogLTAuMjYsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTEyLTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC4zLFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJEYW1lIFN0cmVldCwgZnJvbSB0aGUgY29ybmVyIG9mIFBhbGFjZSBTdHJlZXQgdG8gdGhlIGNvcm5lciBvZiBHZW9yZ2XigJlzIFN0cmVldCAtIGxhaWQgb3V0IGluIGxvdHMgZm9yIGJ1aWxkaW5nIE5vcnRoIGFuZCBTb3V0aCBhbmQgdmljaW5pdHkgRGF0ZTogMTc4MlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTEyXCIsIFwieFwiOiAtMjk4LCBcInlcIjogMzM5LjUsIFwiem9vbVhcIjogMC4xODUsIFwiem9vbVlcIjogMC4xODUsIFwicm90YXRpb25cIjogLTAuMjU1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTExMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcIm9wYWNpdHlcIjogMC4wLFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJEYW1lIFN0cmVldCwgZnJvbSB0aGUgY29ybmVyIG9mIFBhbGFjZSBTdHJlZXQgdG8gdGhlIGNvcm5lciBvZiBHZW9yZ2XigJlzIFN0cmVldCAtIGxhaWQgb3V0IGluIGxvdHMgZm9yIGJ1aWxkaW5nIE5vcnRoIGFuZCBTb3V0aCBhbmQgdmljaW5pdHkgRGF0ZTogMTc4MlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDU1XCIsIFwieFwiOiA2MzUuNSwgXCJ5XCI6IDEyNTgsIFwiem9vbVhcIjogMC4yNjMsIFwiem9vbVlcIjogMC4yNjMsIFwicm90YXRpb25cIjogLTAuOSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00NTUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJIZXJiZXJ0IFBsYWNlIGFuZCBBdmVudWVzIGFkamFjZW50IHRvIFVwcGVyIE1vdW50IFN0cmVldCwgc2hvd2luZyBVcHBlciBCYWdnb3QgU3RyZWV0IC0gSGVyYmVydCBTdHJlZXQsIFdhcnJpbmd0b24gUGxhY2UgYW5kIFBlcmN5IFBsYWNlLCBOb3J0aHVtYmVybGFuZCBSb2FkIGFuZCBMb3dlciBNb3VudCBTdHJlZXQgRGF0ZTogMTgzM1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTk5XCIsIFwieFwiOiA4NzguNSwgXCJ5XCI6IDEyMTcuNSwgXCJ6b29tWFwiOiAwLjI0MSwgXCJ6b29tWVwiOiAwLjI0MSwgXCJyb3RhdGlvblwiOiAyLjExNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xOTktMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjYsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwYXJ0IG9mIHRoZSBlc3RhdGUgb2YgdGhlIEhvbi4gU2lkbmV5IEhlcmJlcnQsIGNhbGxlZCBXaWx0b24gUGFyYWRlLCBzaG93aW5nIHRoZSBwcm9wb3NlZCBhcHByb3ByaWF0aW9uIHRoZXJlb2YgaW4gc2l0ZXMgZm9yIGJ1aWxkaW5nLiBBbHNvIHNob3dpbmcgQmFnZ290IFN0cmVldCwgR3JhbmQgQ2FuYWwgYW5kIEZpdHp3aWxsaWFtIFBsYWNlLlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDY1XCIsIFwieFwiOiAzMDEuNSwgXCJ5XCI6IDcxMS41LCBcInpvb21YXCI6IDAuMjA3LCBcInpvb21ZXCI6IDAuMjA3LCBcInJvdGF0aW9uXCI6IDMuMywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00NjUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJHcmFmdG9uIFN0cmVldCwgTmFzc2F1IFN0cmVldCAoU291dGggc2lkZSkgYW5kIERhd3NvbiBTdHJlZXQgRGF0ZTogMTgzN1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDgwLTJcIiwgXCJ4XCI6IC02MywgXCJ5XCI6IDM4MiwgXCJ6b29tWFwiOiAwLjA2OCwgXCJ6b29tWVwiOiAwLjA2OCwgXCJyb3RhdGlvblwiOiAtMC4wNTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDgwLTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJOb3J0aCBzaWRlIG9mIENvbGxlZ2UgR3JlZW4gc2hvd2luZyBBdmVudWVzIHRoZXJlb2YsIGFuZCBncm91bmQgcGxhbiBvZiBQYXJsaWFtZW50IEhvdXNlLCBBbmdsZXNlYSBTdHJlZXQsIEJsYWNrbW9vciBZYXJkIGV0Yy4gLSB3aXRoIHJlZmVyZW5jZSBnaXZpbmcgdGVuYW50cywgbmFtZXMgb2YgcHJlbWlzZXMgcmVxdWlyZWQgb3IgcHVycG9zZSBvZiBpbXByb3ZlbWVudC4gRGF0ZTogMTc4NlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDkxXCIsIFwieFwiOiAtMjEuNSwgXCJ5XCI6IDkzOCwgXCJ6b29tWFwiOiAwLjE2NCwgXCJ6b29tWVwiOiAwLjE2NCwgXCJyb3RhdGlvblwiOiAtMy4wOCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00OTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJBdW5naWVyIFN0cmVldCwgTWVyY2VyIFN0cmVldCwgWW9yayBTdHJlZXQgYW5kIEF2ZW51ZXMgdGhlcmVvZiwgdml6OiAtIEZyZW5jaCBTdHJlZXQgKE1lcmNlciBTdHJlZXQpLCBCb3cgTGFuZSwgRGlnZ2VzIExhbmUsIFN0ZXBoZW4gU3RyZWV0LCBEcnVyeSBMYW5lLCBHcmVhdCBhbmQgTGl0dGxlIExvbmdmb3JkIFN0cmVldHNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ5NlwiLCBcInhcIjogLTI3OCwgXCJ5XCI6IDQ1NiwgXCJ6b29tWFwiOiAwLjAxOCwgXCJ6b29tWVwiOiAwLjAxOCwgXCJyb3RhdGlvblwiOiAtMy4yNiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00OTYucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJFc3NleCBRdWF5LCBDaGFuZ2UgQWxsZXksIFNtb2NrIEFsbGV5IGFuZCBncm91bmQgcGxhbiBvZiBTbW9jayBBbGxleSBUaGVhdHJlXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy01MDdcIiwgXCJ4XCI6IC0yNzIuNSwgXCJ5XCI6IDM0NiwgXCJ6b29tWFwiOiAwLjA4NywgXCJ6b29tWVwiOiAwLjA4OSwgXCJyb3RhdGlvblwiOiAtMC4yLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTUwNy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkVzc2V4IFN0cmVldCwgUGFybGlhbWVudCBTdHJlZXQsIHNob3dpbmcgT2xkIEN1c3RvbSBIb3VzZSBRdWF5LCBMb3dlciBPcm1vbmQgUXVheSBhbmQgRGFtZSBTdHJlZXRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTIwNi0xXCIsIFwieFwiOiAtNDQuNSwgXCJ5XCI6IC0yMjEsIFwiem9vbVhcIjogMC4wNSwgXCJ6b29tWVwiOiAwLjA1LCBcInJvdGF0aW9uXCI6IC0wLjY1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTIwNi0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIGFuZ2xlIG9mIENhdmVuZGlzaCBSb3csIFJ1dGxhbmQgU3F1YXJlIGFuZCBHcmVhdCBCcml0YWluIFN0cmVldCAtIHNob3dpbmcgdW5zaWduZWQgZWxldmF0aW9ucyBhbmQgZ3JvdW5kIHBsYW4gb2YgUm90dW5kYSBieSBGcmVkZXJpY2sgVHJlbmNoLiBEYXRlOiAxNzg3XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yMDNcIiwgXCJ4XCI6IC0zOTIsIFwieVwiOiAyNzIuNSwgXCJ6b29tWFwiOiAwLjA3OCwgXCJ6b29tWVwiOiAwLjA3NiwgXCJyb3RhdGlvblwiOiAtMC4yNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yMDMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDaXR5IFN1cnZleSAtIHNob3dpbmcgT3Jtb25kIFF1YXksIEFycmFuIFN0cmVldCwgTWFyeeKAmXMgQWJiZXksIExpdHRsZSBTdHJhbmQgU3RyZWV0LCBDYXBlbCBTdHJlZXQgYW5kIEVzc2V4IEJyaWRnZSBEYXRlOiAxODExXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy01MTVcIiwgXCJ4XCI6IC03NSwgXCJ5XCI6IDU1MCwgXCJ6b29tWFwiOiAwLjA4OCwgXCJ6b29tWVwiOiAwLjA4OCwgXCJyb3RhdGlvblwiOiAyLjkzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy01MTUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJzaG93aW5nIERhbWUgU3RyZWV0LCBFc3NleCBTdHJlZXQgZXRjLiAtIGFsc28gc2l0ZSBmb3IgcHJvcG9zZWQgTmF0aW9uYWwgQmFuaywgb24gb3IgYWJvdXQgd2hlcmUgdGhlICdFbXBpcmUnIChmb3JtZXJseSB0aGUgJ1N0YXInKSBUaGVhdHJlIG9mIFZhcmlldGllcyBub3cgKDE5MDApIHN0YW5kcyBOby4xXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy01MjMtMVwiLCBcInhcIjogLTI5Ny41LCBcInlcIjogMzY4LjUsIFwiem9vbVhcIjogMC4wODgsIFwiem9vbVlcIjogMC4wODgsIFwicm90YXRpb25cIjogLTAuMTg1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTUyMy0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRXNzZXggU3RyZWV0LCBUZW1wbGUgQmFyIGFuZCB2aWNpbml0eSB0byBFc3NleCBCcmlkZ2UsIHNob3dpbmcgcHJvcG9zZWQgbmV3IHF1YXkgd2FsbCAoV2VsbGluZ3RvbiBRdWF5KVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDIzLTJcIiwgXCJ4XCI6IDM0LjUsIFwieVwiOiA0NzguNSwgXCJ6b29tWFwiOiAwLjA3OCwgXCJ6b29tWVwiOiAwLjA4MiwgXCJyb3RhdGlvblwiOiAtMy4yMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDIzLTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDcm93biBBbGxleSwgQ29wZSBTdHJlZXQsIEFyZGlsbOKAmXMgUm93LCBUZW1wbGUgQmFyLCBBc3RvbuKAmXMgUXVheSBhbmQgV2VsbGluZ3RvbiBRdWF5IE5vLiAyIERhdGU6IDE4MjAtNVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNTM1XCIsIFwieFwiOiAtMjA5LjUsIFwieVwiOiAzMjUsIFwiem9vbVhcIjogMC4xMzQsIFwiem9vbVlcIjogMC4xMzQsIFwicm90YXRpb25cIjogLTAuMDcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNTM1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiV2VsbGluZ3RvbiBRdWF5IC0gY29udGludWF0aW9uIG9mIEV1c3RhY2UgU3RyZWV0IERhdGVcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTU2Ny0zXCIsIFwieFwiOiAxOTQuNSwgXCJ5XCI6IDQ1MCwgXCJ6b29tWFwiOiAwLjEyNiwgXCJ6b29tWVwiOiAwLjEyNiwgXCJyb3RhdGlvblwiOiAxLjQ4LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTU2Ny0zLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIGEgcGFyY2VsIG9mIGdyb3VuZCBib3VuZGVkIGJ5IEdyYWZ0b24gU3RyZWV0LCBDb2xsZWdlIEdyZWVuLCBhbmQgQ2hlcXVlciBMYW5lIC0gbGVhc2VkIHRvIE1yLiBQb29sZXkgKDMgY29waWVzKSBOby4gMyBEYXRlOiAxNjgyXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy01OTQtMVwiLCBcInhcIjogLTU2NC41LCBcInlcIjogNTcyLjUsIFwiem9vbVhcIjogMC4wNDQsIFwiem9vbVlcIjogMC4wNDQsIFwicm90YXRpb25cIjogMi41MzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNTk0LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgTmV3IEhhbGwgTWFya2V0IC0gcGFydCBvZiB0aGUgQ2l0eSBFc3RhdGUgRGF0ZTogMTc4MFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNjI1LTFcIiwgXCJ4XCI6IC0zMjAuNSwgXCJ5XCI6IDYwOS41LCBcInpvb21YXCI6IDAuMDU4LCBcInpvb21ZXCI6IDAuMDU4LCBcInJvdGF0aW9uXCI6IDIuNjEsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNjI1LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgdGhlIE9sZCBUaG9sc2VsbCBncm91bmQsIGZvcm1lcmx5IGNhbGxlZCBTb3V0aGVy4oCZcyBMYW5lLCBiZWxvbmdpbmcgdG8gdGhlIENpdHkgb2YgRHVibGluIC0gbGFpZCBvdXQgZm9yIGJ1aWxkaW5nLCBOaWNob2xhcyBTdHJlZXQsIFNraW5uZXJzIFJvdyBhbmQgV2VyYnVyZ2ggU3RyZWV0IEJ5IEEuIFIuIE5ldmlsbGUsIEMuIFMuIERhdGU6IDE4MTJcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTY1NFwiLCBcInhcIjogLTM5Ny41LCBcInlcIjogNDA5LCBcInpvb21YXCI6IDAuMTIyLCBcInpvb21ZXCI6IDAuMTIyLCBcInJvdGF0aW9uXCI6IC0wLjEzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy02NTQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgdGhlIGdyb3VuZCBwbG90cyBvZiBzZXZlcmFsIGhvbGRpbmdzIGJlbG9uZ2luZyB0byB0aGUgQ2l0eSBvZiBEdWJsaW4sIE1hZGFtIE/igJlIYXJhLCBDb2xvbmVsIEJlcnJ5IGFuZCBvdGhlcnMsIG9uIEJhY2sgUXVheSAtIChFc3NleCBRdWF5KSBCbGluZCBRdWF5IC0gRXhjaGFuZ2UgU3RyZWV0LCBFc3NleCBCcmlkZ2UsIENyYW5lIExhbmUgYW5kIERhbWUgU3RyZWV0LCBTeWNhbW9yZSBBbGxleSAtIHNob3dpbmcgcG9ydGlvbiBvZiB0aGUgQ2l0eSBXYWxsLCBFc3NleCBHYXRlLCBEYW1lIEdhdGUsIERhbWVzIE1pbGwgYW5kIGJyYW5jaCBvZiB0aGUgUml2ZXIgRG9kZGVyXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy03MDVcIiwgXCJ4XCI6IC0xODcuNSwgXCJ5XCI6IDM5MiwgXCJ6b29tWFwiOiAwLjA0LCBcInpvb21ZXCI6IDAuMDQyLCBcInJvdGF0aW9uXCI6IC0wLjM4LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTcwNS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBFc3NleCBTdHJlZXQgYW5kIHZpY2luaXR5IERhdGU6IDE4MDZcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTcyNVwiLCBcInhcIjogLTY1NCwgXCJ5XCI6IDIyNiwgXCJ6b29tWFwiOiAwLjA5NCwgXCJ6b29tWVwiOiAwLjA5NCwgXCJyb3RhdGlvblwiOiAwLjA3LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTcyNS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNodXJjaCBTdHJlZXQsIENoYXJsZXMgU3RyZWV0LCBJbm7igJlzIFF1YXkgLSAnV2hpdGUgQ3Jvc3MgSW5uJyAtIHJlcmUgb2YgRm91ciBDb3VydHMgLSBVc2hlcnPigJkgUXVheSwgTWVyY2hhbnTigJlzIFF1YXksIFdvb2QgUXVheSAtIHdpdGggcmVmZXJlbmNlIERhdGU6IDE4MzNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE5OC0xXCIsIFwieFwiOiAtNDU5LjUsIFwieVwiOiA0NjksIFwiem9vbVhcIjogMC4wMjYsIFwiem9vbVlcIjogMC4wMjYsIFwicm90YXRpb25cIjogLTAuMzA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE5OC0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIFdoaXRlaG9yc2UgWWFyZCAoV2luZXRhdmVybiBTdHJlZXQpIFN1cnZleW9yOiBBcnRodXIgTmV2aWxsZSBEYXRlOiAxODQ3XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNTVcIiwgXCJ4XCI6IC0xNzc1LCBcInlcIjogLTE0NDYsIFwiem9vbVhcIjogMS4xMSwgXCJ6b29tWVwiOiAxLjE2MiwgXCJyb3RhdGlvblwiOiAwLjAxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wNTUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIE1haWwgQ29hY2ggUm9hZCwgdGhyb3VnaCBCbGVzc2luZ3RvbiBTdHJlZXQgdG8gQ2FicmEsIG9mIE5ldyBMaW5lIFJvYWQsIGJlaW5nIHBhcnQgb2YgdGhlIE5hdmFuIFR1cm5waWtlIFJvYWQgYW5kIGNvbm5lY3RpbmcgYW4gaW1wcm92ZW1lbnQgbGF0ZWx5IG1hZGUgdXBvbiB0aGF0IExpbmUgd2l0aCB0aGUgQ2l0eSBvZiBEdWJsaW4gLSBzaG93aW5nIHRoZSBtb3N0IGRpcmVjdCBsaW5lIGFuZCBhbHNvIGEgQ2lyY3VpdG9ucyBsaW5lIHdoZXJlYnkgdGhlIGV4cGVuc2Ugb2YgYSBCcmlkZ2UgYWNyb3NzIHRoZSBSb3lhbCBDYW5hbCBtYXkgYmUgYXZvaWRlZC4gRG9uZSBieSBIaXMgTWFqZXN0eSdzIFBvc3QgTWFzdGVycyBvZiBJcmVsYW5kIGJ5IE1yLiBMYXJraW4gRGF0ZTogMTgxOFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDYwXCIsIFwieFwiOiAtMTA0LjUsIFwieVwiOiAtMSwgXCJ6b29tWFwiOiAwLjY3NCwgXCJ6b29tWVwiOiAwLjcwMiwgXCJyb3RhdGlvblwiOiAzLjE2NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy02MC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBzaG93aW5nIHRoZSBhbHRlcmF0aW9ucyBwcm9wb3NlZCBpbiB0aGUgbmV3IGxpbmUgb2Ygcm9hZCwgbGVhZGluZyBmcm9tIER1YmxpbiB0byBOYXZhbiwgY29tbWVuY2luZyBhdCBCbGVzc2luZ3RvbiBTdHJlZXQ7IHBhc3NpbmcgYWxvbmcgdGhlIENpcmN1bGFyIFJvYWQgdG8gUHJ1c3NpYSBTdHJlZXQsIGFuZCBoZW5jZSBhbG9uZyB0aGUgVHVybnBpa2UgUm9hZCB0byBSYXRvYXRoLCBhbmQgdGVybWluYXRpbmcgYXQgdGhlIFR1cm5waWtlXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNjVcIiwgXCJ4XCI6IC01NDUuNSwgXCJ5XCI6IC0yNzUsIFwiem9vbVhcIjogMC4yOTgsIFwiem9vbVlcIjogMC4yOTIsIFwicm90YXRpb25cIjogLTEuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDY1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIHNob3dpbmcgTW91bnRqb3kgU3RyZWV0LCBEb3JzZXQgU3RyZWV0LCBEb21pbmljayBTdHJlZXQgYW5kIHZpY2luaXR5IC0gcGxhbiBvZiBTYWludCBNYXJ54oCZcyBDaGFwZWwgb2YgRWFzZSwgYW5kIHByb3Bvc2VkIG9wZW5pbmcgbGVhZGluZyB0aGVyZXVudG8gZnJvbSBHcmFuYnkgUm93IC0gVGhvbWFzIFNoZXJyYXJkIDMwIE5vdiAxODI3XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMTJcIiwgXCJ4XCI6IC0xMjUuNSwgXCJ5XCI6IDE0OS41LCBcInpvb21YXCI6IDAuMDQ0LCBcInpvb21ZXCI6IDAuMDQ0LCBcInJvdGF0aW9uXCI6IC0wLjIyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTAxMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwcmVtaXNlcyBMb3dlciBBYmJleSBTdHJlZXQsIExvd2VyIFNhY2t2aWxsZSBTdHJlZXQgYW5kIEVkZW4gUXVheVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDE0XCIsIFwieFwiOiAtMTU1NS41LCBcInlcIjogMjcsIFwiem9vbVhcIjogMC4xNCwgXCJ6b29tWVwiOiAwLjE0LCBcInJvdGF0aW9uXCI6IDAuMDU1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTAxNC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkEgc3VydmV5IG9mIGdyb3VuZCBjb250aWd1b3VzIHRvIHRoZSBIb3JzZSBCYXJyYWNrcywgRHVibGluIC0gc2hvd2luZyBNb250cGVsaWVyIEhpbGwsIEJhcnJhY2sgU3RyZWV0LCBQYXJrZ2F0ZSBTdHJlZXQgYW5kIGVudmlyb25zIChUaG9tYXMgU2hlcnJhcmQpIERhdGU6IDE3OTBcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAxNVwiLCBcInhcIjogLTE0MTQuNSwgXCJ5XCI6IDI5LCBcInpvb21YXCI6IDAuMTE2LCBcInpvb21ZXCI6IDAuMTEyLCBcInJvdGF0aW9uXCI6IDAuMDc1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTAxNS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkFyYm91ciBIaWxsLCBSb3lhbCBCYXJyYWNrcyBhbmQgdmljaW5pdHkuIFdpdGggcmVmZXJlbmNlLiBEYXRlOiAxNzkwXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMTZcIiwgXCJ4XCI6IC04NDcsIFwieVwiOiAyMzEuNSwgXCJ6b29tWFwiOiAwLjAzOCwgXCJ6b29tWVwiOiAwLjAzOCwgXCJyb3RhdGlvblwiOiAwLjA5NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wMTYucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBBcnJhbiBRdWF5LCBRdWVlbiBTdHJlZXQgRGF0ZToxNzkwXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMTdcIiwgXCJ4XCI6IC01NjQsIFwieVwiOiA0NDAsIFwiem9vbVhcIjogMC4wNjgsIFwiem9vbVlcIjogMC4wNiwgXCJyb3RhdGlvblwiOiAzLjM5LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTAxNy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkFycmFuIFF1YXksIENodXJjaCBTdHJlZXRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAxOFwiLCBcInhcIjogLTE5NCwgXCJ5XCI6IC0zOTUuNSwgXCJ6b29tWFwiOiAwLjEyLCBcInpvb21ZXCI6IDAuMTIsIFwicm90YXRpb25cIjogLTAuNjMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDE4LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIEJhcmxleSBmaWVsZHMgZXRjLiAoRG9yc2V0IFN0cmVldCkuIFBsYW4gb2Ygb3BlbmluZyBhIHN0cmVldCBmcm9tIFJ1dGxhbmQgU3F1YXJlIHRvIERvcnNldCBTdHJlZXQgLSAoUGFsYWNlIFJvdyBhbmQgR2FyZGluZXJzIFJvdykgLSBUaG9tYXMgU2hlcnJhcmQgRGF0ZTogMTc4OVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDI1XCIsIFwieFwiOiAtMTAxMCwgXCJ5XCI6IDEwNSwgXCJ6b29tWFwiOiAwLjEyLCBcInpvb21ZXCI6IDAuMTIsIFwicm90YXRpb25cIjogMC4xNiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wMjUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJCbGFja2hhbGwgUGxhY2UgLSBOZXcgU3RyZWV0IHRvIHRoZSBRdWF5XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNTdcIiwgXCJ4XCI6IC0yMjQsIFwieVwiOiAzMzAuNSwgXCJ6b29tWFwiOiAwLjA4NCwgXCJ6b29tWVwiOiAwLjA4NCwgXCJyb3RhdGlvblwiOiAyLjg2NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wNTcucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIHN0cmVldHMgYWJvdXQgTWFyeeKAmXMgQWJiZXkgYW5kIEJvb3QgTGFuZSAtIChPbGQgQmFuaykgRGF0ZTogMTgxMVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDYzXCIsIFwieFwiOiAtODguNSwgXCJ5XCI6IDI2LjUsIFwiem9vbVhcIjogMC4zLCBcInpvb21ZXCI6IDAuMywgXCJyb3RhdGlvblwiOiAtMi4xNDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDYzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRWxldmF0aW9uIG9mIHRoZSB3ZXN0IGZyb250IGFuZCBwbGFuIG9mIE1vdW50am95IFNxdWFyZSBsYWlkIG91dCBvbiB0aGUgcmlzaW5nIGdyb3VuZCwgbmVhciBHZW9yZ2XigJlzIENodXJjaCAtIHRoZSBlc3RhdGUgb2YgdGhlIFJpZ2h0IEhvbi4gTHVrZSBHYXJkaW5lciwgYW5kIG5vdyAoMTc4NyksIHRvIGJlIGxldCBmb3IgYnVpbGRpbmcgLSBMb3JkIE1vdW50am954oCZcyBwbGFuLiBEYXRlOiAxNzg3XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wODctMlwiLCBcInhcIjogLTE3Mi41LCBcInlcIjogMTQxOSwgXCJ6b29tWFwiOiAwLjA4NiwgXCJ6b29tWVwiOiAwLjA4NiwgXCJyb3RhdGlvblwiOiAtMS42OTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDg3LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDYW1kZW4gU3RyZWV0IFVwcGVyIGFuZCBDaGFybG90dGUgU3RyZWV0IERhdGU6IDE4NDFcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA5MFwiLCBcInhcIjogLTI2MSwgXCJ5XCI6IDUwNSwgXCJ6b29tWFwiOiAwLjA3NCwgXCJ6b29tWVwiOiAwLjA2NiwgXCJyb3RhdGlvblwiOiAtMC4yMywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wOTAucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDYXN0bGUgWWFyZCwgQ2FzdGxlIFN0cmVldCwgRGFtZSBTdHJlZXQsIFBhcmxpYW1lbnQgU3RyZWV0IGFuZCB2aWNpbml0eSBEYXRlOiAxNzY0XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMDAtMlwiLCBcInhcIjogLTUyOCwgXCJ5XCI6IDQ2NCwgXCJ6b29tWFwiOiAwLjA3OCwgXCJ6b29tWVwiOiAwLjA3OCwgXCJyb3RhdGlvblwiOiAtMC4yNywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xMDAtMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwcmVtaXNlcyB0byBiZSB2YWx1ZWQgYnkgSnVyeTsgQ29jayBIaWxsLCBNaWNoYWVs4oCZcyBMYW5lLCBXaW5ldGF2ZXJuIFN0cmVldCwgSm9obuKAmXMgTGFuZSwgQ2hyaXN0Y2h1cmNoLCBQYXRyaWNrIFN0cmVldCBhbmQgUGF0cmlja+KAmXMgQ2xvc2UgRGF0ZTogMTgxM1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTAzXCIsIFwieFwiOiA5OS41LCBcInlcIjogNTY2LCBcInpvb21YXCI6IDAuMDYyLCBcInpvb21ZXCI6IDAuMDYsIFwicm90YXRpb25cIjogLTMuMTU1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTEwMy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBTb3V0aCBTaWRlIG9mIENvbGxlZ2UgR3JlZW4gYW5kIHZpY2luaXR5IERhdGU6IDE4MDhcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE0OS0xXCIsIFwieFwiOiAtMTA5MSwgXCJ5XCI6IDUxNS41LCBcInpvb21YXCI6IDAuMDYyLCBcInpvb21ZXCI6IDAuMDYsIFwicm90YXRpb25cIjogMCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xNDktMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCAtIEphbWVz4oCZcyBHYXRlLCBKYW1lcyBTdHJlZXQsIFRob21hcyBTdHJlZXQgYW5kIFdhdGxpbmcgU3RyZWV0LiBNci4gR3Vpbm5lc3PigJlzIFBsYWNlIERhdGU6IDE4NDVcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE0OS0yXCIsIFwieFwiOiAtMTA3NC41LCBcInlcIjogNDg4LCBcInpvb21YXCI6IDAuMDQ0LCBcInpvb21ZXCI6IDAuMDQ4LCBcInJvdGF0aW9uXCI6IDAsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTQ5LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBKYW1lc+KAmXMgR2F0ZSwgSmFtZXMgU3RyZWV0LCBUaG9tYXMgU3RyZWV0IGFuZCBXYXRsaW5nIFN0cmVldC4gTXIuIEd1aW5uZXNz4oCZcyBQbGFjZSBEYXRlOiAxODQ1XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yNTRcIiwgXCJ4XCI6IC00MzgsIFwieVwiOiAtMTQyLCBcInpvb21YXCI6IDAuMTE4LCBcInpvb21ZXCI6IDAuMTIsIFwicm90YXRpb25cIjogLTAuNDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTI1NC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBNYWJib3QgU3RyZWV0LCBNb250Z29tZXJ5IFN0cmVldCwgRG9taW5pY2sgU3RyZWV0LCBDaGVycnkgTGFuZSwgQ3Jvc3MgTGFuZSBhbmQgVHVybi1hZ2Fpbi1MYW5lIERhdGU6IDE4MDFcIlxuXHR9XG5dXG4iLCJpbXBvcnQgeyBDYW52YXNWaWV3IH0gZnJvbSBcIi4vZ3R3by9jYW52YXN2aWV3XCI7XG5pbXBvcnQgeyBTdGF0aWNJbWFnZSB9IGZyb20gXCIuL2d0d28vc3RhdGljXCI7XG5pbXBvcnQgeyBDb250YWluZXJMYXllciB9IGZyb20gXCIuL2d0d28vbGF5ZXJcIjtcbmltcG9ydCB7IEJhc2ljVHJhbnNmb3JtIH0gZnJvbSBcIi4vZ3R3by92aWV3XCI7XG5pbXBvcnQgeyBTdGF0aWNHcmlkIH0gZnJvbSBcIi4vZ3R3by9ncmlkXCI7XG5pbXBvcnQgeyBWaWV3Q29udHJvbGxlciB9IGZyb20gXCIuL2d0d28vdmlld2NvbnRyb2xsZXJcIjtcbmltcG9ydCB7IEltYWdlQ29udHJvbGxlciwgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyIH0gZnJvbSBcIi4vZ3R3by9pbWFnZWNvbnRyb2xsZXJcIjtcbmltcG9ydCB7IFRpbGVMYXllciwgVGlsZVN0cnVjdCwgem9vbUJ5TGV2ZWx9IGZyb20gXCIuL2d0d28vdGlsZWxheWVyXCI7XG5pbXBvcnQgeyBMYXllck1hbmFnZXIsIENvbnRhaW5lckxheWVyTWFuYWdlciB9IGZyb20gXCIuL2d0d28vbGF5ZXJtYW5hZ2VyXCI7XG5pbXBvcnQgeyBMYXllckNvbnRyb2xsZXIgfSBmcm9tIFwiLi9ndHdvL2xheWVyY29udHJvbGxlclwiO1xuXG5pbXBvcnQgKiBhcyBmaXJlbWFwcyBmcm9tIFwiLi9pbWFnZWdyb3Vwcy9maXJlbWFwcy5qc29uXCI7XG5pbXBvcnQgKiBhcyBsYW5kbWFya3MgZnJvbSBcIi4vaW1hZ2Vncm91cHMvbGFuZG1hcmtzLmpzb25cIjtcbmltcG9ydCAqIGFzIHdzYyBmcm9tIFwiLi9pbWFnZWdyb3Vwcy93c2MuanNvblwiO1xuXG5sZXQgbGF5ZXJTdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgwLCAwLCAxLCAxLCAwKTtcbmxldCBpbWFnZUxheWVyID0gbmV3IENvbnRhaW5lckxheWVyKGxheWVyU3RhdGUpO1xuXG5sZXQgaW1hZ2VTdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtMTQ0MCwtMTQ0MCwgMC4yMjIsIDAuMjIyLCAwKTtcblxubGV0IGNvdW50eVN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0yNjMxLCAtMjA1MS41LCAxLjcxNiwgMS42NzQsIDApO1xubGV0IGNvdW50eUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKGNvdW50eVN0YXRlLCBcbiAgICBcImltYWdlcy9Db3VudHlfb2ZfdGhlX0NpdHlfb2ZfRHVibGluXzE4MzdfbWFwLnBuZ1wiLCAwLjUsIHRydWUpO1xuXG5sZXQgYmdTdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtMTEyNiwtMTA4NiwgMS41OCwgMS41NSwgMCk7XG5cbmxldCBiZ0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKGJnU3RhdGUsIFwiaW1hZ2VzL2Ztc3MuanBlZ1wiLCAuNiwgdHJ1ZSk7XG5cbmxldCB0bVN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0xMDMzLjUsMTQ5LCAwLjU5LCAwLjU5LCAwKTtcbmxldCB0bUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKHRtU3RhdGUsIFwiaW1hZ2VzL3RoaW5nbW90LnBuZ1wiLCAuMywgdHJ1ZSk7XG5cbmxldCBkdVN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC05MjksLTEwNS41LCAwLjQ2NCwgMC41MDYsIDApO1xubGV0IGR1SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoZHVTdGF0ZSwgXCJpbWFnZXMvZHVibGluMTYxMC5qcGdcIiwgLjMsIGZhbHNlKTtcblxubGV0IGdyaWRUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgMSwgMSwgMCk7XG5sZXQgc3RhdGljR3JpZCA9IG5ldyBTdGF0aWNHcmlkKGdyaWRUcmFuc2Zvcm0sIDAsIGZhbHNlLCAyNTYsIDI1Nik7XG5cbmxldCBzZW50aW5lbFN0cnVjdCA9IG5ldyBUaWxlU3RydWN0KFwicXRpbGUvZHVibGluL1wiLCBcIi5wbmdcIiwgXCJpbWFnZXMvcXRpbGUvZHVibGluL1wiKTtcblxubGV0IHNlbnRpbmVsVHJhbnNmb3JtID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDIsIDIsIDApO1xubGV0IHNlbnRpbmVsTGF5ZXIgPSBuZXcgVGlsZUxheWVyKHNlbnRpbmVsVHJhbnNmb3JtLCBzZW50aW5lbFN0cnVjdCwgdHJ1ZSwgMTU4MTQsIDEwNjIxLCAxNSk7XG4vL2xldCBzZW50aW5lbExheWVyID0gbmV3IFRpbGVMYXllcihCYXNpY1RyYW5zZm9ybS51bml0VHJhbnNmb3JtLCBzZW50aW5lbFN0cnVjdCwgMzE2MjgsIDIxMjQyLCAxNik7XG5cbmltYWdlTGF5ZXIuc2V0KFwiY291bnR5XCIsIGNvdW50eUltYWdlKTtcbmltYWdlTGF5ZXIuc2V0KFwiYmFja2dyb3VuZFwiLCBiZ0ltYWdlKTtcblxubGV0IGxheWVyTWFuYWdlciA9IG5ldyBMYXllck1hbmFnZXIoKTtcblxubGV0IGZpcmVtYXBMYXllciA9IGxheWVyTWFuYWdlci5hZGRMYXllcihmaXJlbWFwcywgXCJmaXJlbWFwc1wiKTtcbmxldCBsYW5kbWFya3NMYXllciA9IGxheWVyTWFuYWdlci5hZGRMYXllcihsYW5kbWFya3MsIFwibGFuZG1hcmtzXCIpO1xubGV0IHdzY0xheWVyID0gbGF5ZXJNYW5hZ2VyLmFkZExheWVyKHdzYywgXCJ3c2NcIik7XG5cbmxldCBlZGl0ID0gd3NjTGF5ZXIuZ2V0KFwid3NjLTI1NFwiKTtcblxubGV0IGNvbnRhaW5lckxheWVyTWFuYWdlciA9IG5ldyBDb250YWluZXJMYXllck1hbmFnZXIod3NjTGF5ZXIpO1xubGV0IG91dGxpbmVMYXllciA9IGNvbnRhaW5lckxheWVyTWFuYWdlci5zZXRTZWxlY3RlZChcIndzYy0yNTRcIik7XG5cbmltYWdlTGF5ZXIuc2V0KFwid3NjXCIsIHdzY0xheWVyKTtcbi8vaW1hZ2VMYXllci5zZXQoXCJmaXJlbWFwc1wiLCBmaXJlbWFwTGF5ZXIpO1xuXG4vL2ltYWdlTGF5ZXIuc2V0KFwiZHVibGluMTYxMFwiLCBkdUltYWdlKTtcbi8vaW1hZ2VMYXllci5zZXQoXCJ0aGluZ21vdFwiLCB0bUltYWdlKTtcbi8vaW1hZ2VMYXllci5zZXQoXCJsYW5kbWFya3NcIiwgbGFuZG1hcmtzTGF5ZXIpO1xuXG53c2NMYXllci5zZXRUb3AoXCJ3c2MtMjU0XCIpO1xuXG5mdW5jdGlvbiBzaG93TWFwKGRpdk5hbWU6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpdk5hbWUpO1xuXG4gICAgbGV0IHggPSBvdXRsaW5lTGF5ZXIueDtcbiAgICBsZXQgeSA9IG91dGxpbmVMYXllci55O1xuXG4gICAgbGV0IGNhbnZhc1RyYW5zZm9ybSA9IG5ldyBCYXNpY1RyYW5zZm9ybSh4IC0gMTAwLCB5IC0gMTAwLCAwLjUsIDAuNSwgMCk7XG4gICAgbGV0IGNhbnZhc1ZpZXcgPSBuZXcgQ2FudmFzVmlldyhjYW52YXNUcmFuc2Zvcm0sIGNhbnZhcy5jbGllbnRXaWR0aCwgY2FudmFzLmNsaWVudEhlaWdodCwgY2FudmFzKTtcblxuICAgIGNhbnZhc1ZpZXcubGF5ZXJzLnB1c2goc2VudGluZWxMYXllcik7XG4gICAgY2FudmFzVmlldy5sYXllcnMucHVzaChpbWFnZUxheWVyKTtcbiAgICBjYW52YXNWaWV3LmxheWVycy5wdXNoKHN0YXRpY0dyaWQpO1xuXG4gICAgbGV0IHRpbGVDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBzZW50aW5lbExheWVyLCBcInZcIik7XG4gICAgbGV0IGJhc2VDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBiZ0ltYWdlLCBcIkJcIik7XG4gICAgbGV0IGNvdW50eUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGNvdW50eUltYWdlLCBcIlZcIik7XG4gICAgbGV0IGZpcmVtYXBDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBmaXJlbWFwTGF5ZXIsIFwiYlwiKTtcbiAgICBsZXQgd3NjQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgd3NjTGF5ZXIsIFwiblwiKTtcbiAgICBsZXQgbGFuZG1hcmtDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBsYW5kbWFya3NMYXllciwgXCJtXCIpO1xuICAgIGxldCB0bUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHRtSW1hZ2UsIFwiTlwiKTtcbiAgICBsZXQgZHVDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBkdUltYWdlLCBcIk1cIik7XG4gICAgbGV0IGdyaWRDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBzdGF0aWNHcmlkLCBcImdcIik7XG5cbiAgICBsZXQgY29udHJvbGxlciA9IG5ldyBWaWV3Q29udHJvbGxlcihjYW52YXNWaWV3LCBjYW52YXMsIGNhbnZhc1ZpZXcpO1xuXG4gICAgbGV0IGltYWdlQ29udHJvbGxlciA9IG5ldyBJbWFnZUNvbnRyb2xsZXIoY2FudmFzVmlldywgZWRpdCk7XG5cbiAgICBpbWFnZUNvbnRyb2xsZXIuc2V0TGF5ZXJPdXRsaW5lKG91dGxpbmVMYXllcik7XG5cbiAgICBsZXQgbGF5ZXJDb250cm9sbGVyID0gbmV3IExheWVyQ29udHJvbGxlcihjYW52YXNWaWV3LCBjb250YWluZXJMYXllck1hbmFnZXIpO1xuXG4gICAgZHJhd01hcChjYW52YXNWaWV3KTtcblxufVxuXG5mdW5jdGlvbiBkcmF3TWFwKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcpe1xuICAgIGlmICghY2FudmFzVmlldy5kcmF3KCkgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiSW4gdGltZW91dFwiKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpeyBkcmF3TWFwKGNhbnZhc1ZpZXcpfSwgNTAwKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNob3coKXtcblx0c2hvd01hcChcImNhbnZhc1wiLCBcIlR5cGVTY3JpcHRcIik7XG59XG5cbmlmIChcbiAgICBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgfHxcbiAgICAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gXCJsb2FkaW5nXCIgJiYgIWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5kb1Njcm9sbClcbikge1xuXHRzaG93KCk7XG59IGVsc2Uge1xuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBzaG93KTtcbn0iXX0=
