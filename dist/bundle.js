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
class ZoomDisplayRange {
    constructor(minZoom, maxZoom) {
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
    }
    withinRange(zoom) {
        return ((zoom >= this.minZoom || this.minZoom == -1) &&
            (zoom <= this.maxZoom || this.maxZoom == -1));
    }
}
ZoomDisplayRange.AllZoomRange = new ZoomDisplayRange(-1, -1);
exports.ZoomDisplayRange = ZoomDisplayRange;
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
        this.showInfo(this.ctx);
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
    showInfo(context) {
        context.strokeStyle = "red";
        context.fillText("zoom: " + this.zoomX, 10, 10);
        context.fill();
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
        ctx.strokeStyle = "black";
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
const canvasview_1 = require("./canvasview");
const point2d_1 = require("../geom/point2d");
class CanvasLayer extends view_1.BasicTransform {
    constructor(localTransform, opacity, visible, zoomDisplayRange = canvasview_1.ZoomDisplayRange.AllZoomRange) {
        super(localTransform.x, localTransform.y, localTransform.zoomX, localTransform.zoomY, localTransform.rotation);
        this.localTransform = localTransform;
        this.opacity = opacity;
        this.visible = visible;
        this.zoomDisplayRange = zoomDisplayRange;
    }
    getZoomDisplayRange() {
        return this.zoomDisplayRange;
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

},{"../geom/point2d":1,"./canvasview":2,"./view":10}],6:[function(require,module,exports){
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
function dateFilter(imageStruct, from, to) {
    return imageStruct.filter(function (imageStruct) {
        if (imageStruct.date == undefined)
            return false;
        if (imageStruct.date >= from && imageStruct.date <= to) {
            return true;
        }
        else {
            return false;
        }
    });
}
exports.dateFilter = dateFilter;
function datelessFilter(imageStruct) {
    return imageStruct.filter(function (imageStruct) {
        if (imageStruct.date == undefined)
            return true;
        else {
            return false;
        }
    });
}
exports.datelessFilter = datelessFilter;
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
    addLayer(imageDetails, layerName, layerTransform = view_1.BasicTransform.unitTransform) {
        let imageLayer = new layer_1.ContainerLayer(layerTransform, 1, true);
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
    constructor(containerLayer, displayLayer = containerLayer) {
        this.displayLayer = displayLayer;
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
        this.displayLayer.set(layerName, layerRect);
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
const canvasview_1 = require("./canvasview");
const point2d_1 = require("../geom/point2d");
class StaticImage extends layer_1.DrawLayer {
    constructor(localTransform, imageSrc, opacity, visible, zoomDisplayRange = canvasview_1.ZoomDisplayRange.AllZoomRange) {
        super(localTransform, opacity, visible, zoomDisplayRange);
        this.img = new Image();
        this.img.src = imageSrc;
    }
    drawImage(ctx, parentTransform, view) {
        if (this.isVisible() && this.getZoomDisplayRange().withinRange(view.zoomX)) {
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
    constructor(dimension, opacity, visible, zoomDisplayRange = canvasview_1.ZoomDisplayRange.AllZoomRange) {
        super(new view_1.BasicTransform(dimension.x, dimension.y, 1, 1, 0), opacity, visible, zoomDisplayRange);
        this.dimension = dimension;
    }
    updateDimension(dimension) {
        this.dimension = dimension;
    }
    draw(ctx, parentTransform, view) {
        let x = (this.dimension.x + parentTransform.x - view.x) * view.zoomX;
        let y = (this.dimension.y + parentTransform.y - view.y) * view.zoomY;
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

},{"../geom/point2d":1,"./canvasview":2,"./layer":5,"./view":10}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const layer_1 = require("./layer");
const view_1 = require("./view");
const point2d_1 = require("../geom/point2d");
const canvasview_1 = require("./canvasview");
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
    constructor(localTransform, tileStruct, visbile, zoomDisplayRange = canvasview_1.ZoomDisplayRange.AllZoomRange, xOffset = 0, yOffset = 0, zoom = 1, gridWidth = 256, gridHeight = 256, opacity = 1) {
        super(localTransform, opacity, visbile, zoomDisplayRange);
        this.tileStruct = tileStruct;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.zoom = zoom;
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.tileManager = new TileManager();
    }
    draw(ctx, parentTransform, view) {
        if (this.getZoomDisplayRange().withinRange(view.zoomX)) {
            let ctxTransform = view_1.combineTransform(this, parentTransform);
            let zoomWidth = this.gridWidth * ctxTransform.zoomX;
            let zoomHeight = this.gridHeight * ctxTransform.zoomY;
            let transformX = view.x + ctxTransform.x;
            let transformY = view.y + ctxTransform.y;
            //console.log("ctx zoomWidth: " + zoomWidth);
            let viewX = view.x * view.zoomX;
            let viewY = view.y * view.zoomY;
            let viewWidth = view.width / view.zoomX;
            let viewHeight = view.height / view.zoomY;
            let gridAcross = viewWidth / zoomWidth; //good
            let gridHigh = viewHeight / zoomHeight; //good
            let xMin = Math.floor(transformX / zoomWidth);
            let xMax = Math.ceil((transformX + viewWidth) / zoomWidth);
            let yMin = Math.floor(transformY / zoomHeight);
            let yMax = Math.ceil((transformY + viewHeight) / zoomHeight);
            //console.log("x y s " + xMin + ", " + xMax + ": " + yMin + ", " + yMax);
            //console.log("across high" + gridAcross + ", " + gridHigh);
            var drawingComplete = true;
            let fullZoomX = ctxTransform.zoomX * view.zoomX;
            let fullZoomY = ctxTransform.zoomY * view.zoomY;
            //console.log("fullzooms " + fullZoomX + " " + fullZoomY);
            ctx.scale(fullZoomX, fullZoomY);
            for (var x = xMin; x < xMax; x++) {
                let xMove = x * this.gridWidth - transformX / ctxTransform.zoomX;
                for (var y = yMin; y < yMax; y++) {
                    let yMove = y * this.gridHeight - transformY / ctxTransform.zoomY;
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
        else {
            return true;
        }
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

},{"../geom/point2d":1,"./canvasview":2,"./layer":5,"./view":10}],10:[function(require,module,exports){
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
		"description": "Plan of improving the streets between Richmond Bridge (Four Courts) and Constitution Hill (King’s Inns) Date: 1837",
		"date": 1837
	},
	{
		"name": "wsc-075", "x": -217.5, "y": -1414.5, "zoomX": 0.87, "zoomY": 0.772, "rotation": 1.615, 
		"src": "images/wsc/wsc-maps-075-m.png", "visible": true, "opacity": 0.7,
		"description": "Survey of a line of road, leading from Linen Hall to Glasnevin Road, showing the Royal Canal Date: 1800",
		"date": 1800
	},
	{
		"name": "wsc-361", "x": 464, "y": 2131, "zoomX": 0.436, "zoomY": 0.436, "rotation": -2.04, 
		"src": "images/wsc/wsc-361.png", "visible": true, "opacity": 0.7,
		"description": "Leeson Street, Portland Street (now Upper Leeson Street), Eustace Place, Eustace Bridge (now Leeson Street), Hatch Street, Circular Road - signed by Commissioners of Wide Streets Date: 1792",
		"date": 1792
	},
	{
		"name": "wsc-106-1", "x": -757, "y": 495.5, "zoomX": 0.265, "zoomY": 0.265, "rotation": -0.074, 
		"src": "images/wsc/wsc-maps-106-1.jpg", "visible": true, "opacity": 1.0, 
		"description": "Map showing proposed improvements to be made in Cornmarket, Cutpurse Row, Lamb Alley - Francis Street - and an improved entrance from Kevin Street to Saint Patrick’s Cathedral, through Mitre Alley and at James’s Gate. Date: 1845-46 ",
		"date": 1845
	},
	{
		"name": "wsc-142", "x": 94.995, "y": 2377.5, "zoomX": 0.482, "zoomY": 0.476, "rotation": -2.015, 
		"src": "images/wsc/wsc-maps-142-l.png", "visible": true, "opacity": 1.0,
		"description": "Map of the New Streets, and other improvements intended to be immediately executed. Situate on the South Side of the City of Dublin, submitted for the approbation of the Commissioners of Wide Streets, particularly of those parts belonging to Wm. Cope and John Locker, Esq., Harcourt Street, Charlemount Street, Portobello, etc. Date: 1792",
		"date": 1792
	},
	{
		"name": "wsc-155", "x": -1506, "y": -50.5, "zoomX": 1.01, "zoomY": 0.972, "rotation": -0.025, 
		"src": "images/wsc/wsc-maps-155-m.png", "visible": true, "opacity": 0.6,
		"description": "New approach from Military Road to King’s Bridge, and along the Quays to Aston’s Quay Date: 1841",
		"date": 1841
	},
	{
		"name": "wsc-157-3", "x": 3.115, "y": 3.65, "zoomX": 0.525, "zoomY": 0.59, "rotation": 0.54, 
		"src": "images/wsc/wsc-maps-157-3-m.png", "visible": true, "opacity": 0.0, 
		"description": "showing the improvements proposed by the Commissioners of Wide Streets in Nassau Street, Leinster Street and Clare Street"
	},
	{
		"name": "wsc-164", "x": -472, "y":805, "zoomX": 0.056, "zoomY": 0.056, "rotation": 0.09, 
		"src": "images/wsc/wsc-maps-164-l.png", "visible": true, "opacity": 1.0, 
		"description": "Plan of Saint Patrick’s, etc. Date: 1824",
		"date": 1824
	},
	{
		"name": "wsc-469-02", "x": 255, "y": 1389.5, "zoomX": 0.245, "zoomY": 0.245, "rotation": -2.75, 
		"src": "images/wsc/wsc-maps-469-2-m.png", "visible": true, "opacity": 0.8, 
		"description": "Earlsfort Terrace, Stephen’s Green South and Harcourt Street showing plan of proposed new street"
	},
	{
		"name": "wsc-355-1", "x": 696, "y": 713.5, "zoomX": 0.323, "zoomY": 0.289, "rotation": 1.14, 
		"src": "images/wsc/wsc-355-1.png", "visible": true, "opacity": 0.8, 
		"description": "Plan of Baggot Street and Fitzwilliam Street, showing avenues thereof No. 1 Date: 1790",
		"date": 1790
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
		"src": "images/wsc/wsc-189.png", "visible": true, "opacity": 0.8,
		"description": "Copy of map of proposed New Street from Essex Street to Cornmarket, with the environs and streets branching off"
	},
	{
		"name": "wsc-098", "x": -475, "y": 524, "zoomX": 0.063, "zoomY": 0.063, "rotation": -0.16, 
		"src": "images/wsc/wsc-maps-098.png", "visible": true, "opacity": 0.7,
		"description": "Map of Christchurch, Skinners Row etc. Thomas Sherrard, 5 January 1821 Date: 1821",
		"date": 1821
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
		"description": "Plan for opening and widening a principal Avenue to the Castle, now (1900) Parliament Street - showing Dame Street, Castle Street, and all the Avenues thereof Date: 1757",
		"date": 1757
	},
	{
		"name": "wsc-187", "x": -226, "y": 494.5, "zoomX": 0.066, "zoomY": 0.064, "rotation": 0.0, 
		"src": "images/wsc/wsc-187.png", "visible": true, "opacity": 1.0,
		"description": "A survey of several holdings in South Great George's Street - total purchase £11528.16.3 Date:1801",
		"date": 1801
	},
	{
		"name": "wsc-124", "x": -279, "y": 366, "zoomX": 0.057, "zoomY": 0.051, "rotation": -0.16, 
		"src": "images/wsc/wsc-124.png", "visible": true, "opacity": 0.4,
		"description": "Map of premises in Essex Street and Parliament Street, showing Essex Bridge and Old Custom House. T. and D.H. Sherrard Date: 1813",
		"date": 1813
	},
	{
		"name": "wsc-360", "x": -144, "y": 421.5, "zoomX": 0.121, "zoomY": 0.107, "rotation": -0.05, 
		"src": "images/wsc/wsc-360.png", "visible": true, "opacity": 0.5,
		"description": "Map - Dame Street and avenues thereof - Eustace Street, Cecilia Street, and site of Old Theatre, Fownes Street, Crown Alley and Cope Street Date: 1792", 
		"date": 1792
	},
	{
		"name": "wsc-362", "x": 35.5, "y": 84.5, "zoomX": 0.229, "zoomY": 0.235, "rotation": 0.125, 
		"src": "images/wsc/wsc-362-1.png", "visible": true, "opacity": 0.4,
		"description": "Maps - College Green, College Street, Westmoreland Street and avenues thereof, showing the site of Parliament House and Trinity College No. 1 Date: 1793", 
		"date": 1793
	},
	{
		"name": "wsc-387", "x": 272.5, "y": 423.5, "zoomX": 0.081, "zoomY": 0.077, "rotation": 3.035, 
		"src": "images/wsc/wsc-387.png", "visible": true, "opacity": 0.7,
		"description": "Survey of holdings in Fleet Street and College Street, showing site of Old Watch House Date: 1801", 
		"date": 1801
	},
	{
		"name": "wsc-218", "x": -2455, "y": -284.5, "zoomX": 0.453, "zoomY": 0.451, "rotation": -0.04, 
		"src": "images/wsc/wsc-218.png", "visible": true, "opacity": 0.8,
		"description": "Survey of the Long Meadows and part of the Phoenix Park and Parkgate Street Date: 1786", 
		"date": 1786
	},
	{
		"name": "wsc-229", "x": -2384, "y": 55.5, "zoomX": 0.379, "zoomY": 0.379, "rotation": 0.015, 
		"src": "images/wsc/wsc-229.png", "visible": true, "opacity": 0.6,
		"description": "Section across the proposed Road from the Park Gate to Island Bridge Gate - now (1900) Conyngham Road Date: 1789", 
		"date": 1789
	},
	{
		"name": "wsc-242", "x": -405.5, "y": 21, "zoomX": 0.084, "zoomY": 0.084, "rotation": 1.085, 
		"src": "images/wsc/wsc-242-2.png", "visible": true, "opacity": 0.8,
		"description": "Survey of a holding in Mary’s Lane, the estate of the Right Honourable Lord Mountjoy Date: 1793", 
		"date": 1793
	},
	{
		"name": "wsc-245", "x": -210.0, "y":-397.5, "zoomX": 0.084, "zoomY": 0.084, "rotation": -0.62, 
		"src": "images/wsc/wsc-245-2.png", "visible": true, "opacity": 0.8,
		"description": "Map of the Barley Fields etc., and a plan for opening a street from Rutland Square, Dorset Street, being now (1899) known as South Frederick Street - with reference Date: 1789",
		 "date": 1789
	},
	{
		"name": "wsc-257", "x": 681.0, "y":-1223.5, "zoomX": 0.346, "zoomY": 0.388, "rotation": 0.25, 
		"src": "images/wsc/wsc-257.png", "visible": true, "opacity": 0.8,
		"description": "Map of Clonliffe Road and the Old Turnpike House at Ballybough Bridge - North Strand Date: 1823", 
		"date": 1823
	},
	{
		"name": "wsc-268", "x": -1528.0, "y": 105.5, "zoomX": 0.086, "zoomY": 0.086, "rotation": 0.07, 
		"src": "images/wsc/wsc-268-3.png", "visible": true, "opacity": 0.8,
		"description": "Map - Parkgate Street, Conyngham Road, with reference to names of tenants endorsed No. 3"
	},
	{
		"name": "wsc-171", "x": 112.0, "y": 181.5, "zoomX": 0.021, "zoomY": 0.021, "rotation": -0.265, 
		"src": "images/wsc/wsc-171-2.jpeg", "visible": true, "opacity": 0.8,
		"description": "Map of Lower Abbey Street, to corner of Eden Quay (Sackville Street) Date: 1813", 
		"date": 1813
	},
	{
		"name": "wsc-380", "x": 241.5, "y": 286, "zoomX": 0.033, "zoomY": 0.033, "rotation": 0.05, 
		"src": "images/wsc/wsc-380-1.png", "visible": true, "opacity": 0.4,
		"description": "Map - Fleet Market, Poolbeg Street, Hawkins Street, Townsend Street, Fleet Street, Dublin Society Stores Date: 1800", 
		"date": 1800
	},
	{
		"name": "wsc-309", "x": 36.0, "y": -297, "zoomX": 0.219, "zoomY": 0.219, "rotation": -0.435, 
		"src": "images/wsc/wsc-309.png", "visible": true, "opacity": 0.8,
		"description": "Part of Gardiner Street and part of Gloucester Street, land out in lots for building - showing Gloucester Street, Gloucester Place, the Diamond, Summer Hill, Great Britain Street, Cumberland Street, Marlboro’ Street, Mabbot Street, Mecklinburgh etc.Date: 1791", 
		"date": 1791
	},
	{
		"name": "wsc-294", "x": 125.0, "y": -118, "zoomX": 0.129, "zoomY": 0.129, "rotation": -0.195, 
		"src": "images/wsc/wsc-maps-294-2.png", "visible": true, "opacity": 0.8,
		"description": "Survey of part of the Lordship of Saint Mary’s Abbey - part of the estate of the Right Honorable Luke Viscount Mountjoy, sold to Richard French Esq., pursuant to a Decree of His Majesty’s High Court of Chancery, 17 Feb 1794", 
		"date": 1794
	},
	{
		"name": "wsc-310", "x": 474.0, "y": -821.5, "zoomX": 0.576, "zoomY": 0.576, "rotation": 0.145, 
		"src": "images/wsc/wsc-310.png", "visible": true, "opacity": 0.8,
		"description": "North Lots - from the North Strand Road, to the North and East Walls Date: 1793", 
		"date": 1793
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
		"description": "Map of Nassau Street, leading from Grafton Street to Merrion Square - showing the off streets and portion of Grafton Street and Suffolk Street Date: 1833", 
		"date": 1833
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
		"description": "Plan of Baggot Street and Fitzwilliam Street, showing avenues thereof No. 2 Date: 1792",
		"date": 1792
	},
	{
		"name": "wsc-368", "x": -687.5, "y": 277.5, "zoomX": 0.156, "zoomY": 0.15, "rotation": 0.12, 
		"src": "images/wsc/wsc-368.png", "visible": true, "opacity": 0.7,
		"description": "Map of King’s Inn Quay and Merchants Quay, showing site of Ormond Bridge - below Charles Street - afterwards removed and re-erected opposite Winetavern Street Date: 1797", 
		"date": 1797
	},
	{
		"name": "wsc-372", "x": 341.5, "y": 296.5, "zoomX": 0.036, "zoomY": 0.0339, "rotation": 2.955, 
		"src": "images/wsc/wsc-372.png", "visible": true, "opacity": 0.7,
		"description": "George's Quay, Whites Lane, and Hawkins Street, showing site of Sweetman's Brewery which ran down to River Liffey Date: 1799", 
		"date": 1799
	},
	{
		"name": "wsc-390-1", "x": -804.5, "y": 420, "zoomX": 0.204, "zoomY": 0.202, "rotation": -0.07, 
		"src": "images/wsc/wsc-390-1.png", "visible": true, "opacity": 0.5,
		"description": "Plan of proposed Market House, adjoining Thomas Street, Vicar Street, Market Street and Francis Street Date: 1801", 
		"date": 1801
	},
	{
		"name": "wsc-395-3", "x": -588, "y": 578, "zoomX": 0.036, "zoomY": 0.036, "rotation": -3.65, 
		"src": "images/wsc/wsc-395-3.png", "visible": true, "opacity": 0.5,
		"description": "New Row and Cutpurse Row Date: 1800",
		"date": 1800
	},
	{
		"name": "wsc-404", "x": -16, "y": 372, "zoomX": 0.062, "zoomY": 0.06, "rotation": -0.255, 
		"src": "images/wsc/wsc-404.png", "visible": true, "opacity": 0.5,
		"description": "Anglesea Street and Parliament House Date: 1802", 
		"date": 1802
	},
	{
		"name": "wsc-411", "x": 343.5, "y": 657, "zoomX": 0.086, "zoomY": 0.086, "rotation": 0.325,
		"src": "images/wsc/wsc-411.png", "visible": true, "opacity": 0.5,
		"description": "Leinster House and part of the estate of Viscount Fitzwilliam (formerly Leinster Lawn), laid out in lots for building - showing Kildare Street, Upper Merrion Street and Leinster Place (Street), Merrion Place, and the Old Boundary between Leinster and Lord Fitzwilliam - taken from a map signed Robert Gibson, May 18, 1754 Date: 1812", 
		"date": 1812
	},
	{
		"name": "wsc-251", "x": 220, "y": 64, "zoomX": 0.236, "zoomY": 0.236, "rotation": -1.49,
		"src": "images/wsc/wsc-251.png", "visible": true, "opacity": 0.5,
		"description": "Map of portion of City, showing Montgomery Street, Mecklinburgh Street, Lower Gloucester Street and portion of Mabbot Street"
	},
	{
		"name": "wsc-413", "x": -373, "y": 806.5, "zoomX": 0.078, "zoomY": 0.076, "rotation": -0.15,
		"src": "images/wsc/wsc-413.png", "visible": true, "opacity": 0.5,
		"description": "Peter Street, Peter’s Row, Whitefriar Street, Wood Street and Bride Street - showing site of the Amphitheatre in Bride Street, where the Moleyneux Church now (1900) stands Date: 1812", 
		"date": 1812
	},
	{
		"name": "wsc-414", "x": -193.5, "y": 363.5, "zoomX": 0.072, "zoomY": 0.074, "rotation": -0.23,
		"src": "images/wsc/wsc-414.png", "visible": true, "opacity": 0.5,
		"description": "Temple Bar, Wellington Quay, Old Custom House, Bagnio Slip etc. Date: 1813", 
		"date": 1813
	},
	{
		"name": "wsc-421", "x": -474.5, "y": 527, "zoomX": 0.062, "zoomY": 0.06, "rotation": -0.185,
		"src": "images/wsc/wsc-421.png", "visible": true, "opacity": 0.6,
		"description": "Map of the precincts of Christ Church Dublin, showing Skinners Row, to which is attached a Memorandum denominating the premises, taken by the Commissioners of Wide Streets for the purpose of widening said Skinners Row, now (1900) known as Christ Church Place Date: 1817", 
		"date": 1817
	},
	{ 
		"name": "wsc-408-2", "x": -397.5, "y": 545.5, "zoomX": 0.044, "zoomY": 0.044, "rotation": -0.12, 
		"src": "images/wsc/wsc-408-2.png", "visible": true, "opacity": 0.5,
		"description": "Werburgh Street, Skinners Row, Fishamble Street and Castle Street Date: c. 1810",
		"date": 1810
	},
	{
		"name": "wsc-425-1", "x": -917.5, "y": 577.5, "zoomX": 0.045, "zoomY": 0.046, "rotation": -1.425, 
		"src": "images/wsc/wsc-425-1.png", "visible": true, "opacity": 0.5,
		"description": "Meath Row, Mark’s Alley and Dirty Lane - showing Bridgefoot Street, Mass Lane, Thomas Street and St. Catherine’s Church Date: 1820-24", 
		"date": 1820
	},
	{
		"name": "wsc-426", "x": -735.5, "y": 578.5, "zoomX": 0.034, "zoomY": 0.034, "rotation": 1.565, 
		"src": "images/wsc/wsc-426.png", "visible": true, "opacity": 0.5,
		"description": "Map of several houses and premises on the East side of Meath Row, the property of Mr. John Walsh - showing the situation of Thomas Street, Hanbury Lane and site of Chapel Date: 1821", 
		"date": 1821
	},
	{
		"name": "wsc-112-1", "x": -290.5, "y": 344.5, "zoomX": 0.18, "zoomY": 0.182, "rotation": -0.26, 
		"src": "images/wsc/wsc-112-1.png", "visible": true, "opacity": 0.3,
		"description": "Dame Street, from the corner of Palace Street to the corner of George’s Street - laid out in lots for building North and South and vicinity Date: 1782", 
		"date": 1782
	},
	{
		"name": "wsc-112", "x": -298, "y": 339.5, "zoomX": 0.185, "zoomY": 0.185, "rotation": -0.255, 
		"src": "images/wsc/wsc-112.png", "visible": false, "opacity": 0.0,
		"description": "Dame Street, from the corner of Palace Street to the corner of George’s Street - laid out in lots for building North and South and vicinity Date: 1782", 
		"date": 1782
	},
	{
		"name": "wsc-455", "x": 635.5, "y": 1258, "zoomX": 0.263, "zoomY": 0.263, "rotation": -0.9, 
		"src": "images/wsc/wsc-455.png", "visible": true, "opacity": 0.6,
		"description": "Herbert Place and Avenues adjacent to Upper Mount Street, showing Upper Baggot Street - Herbert Street, Warrington Place and Percy Place, Northumberland Road and Lower Mount Street Date: 1833", 
		"date": 1833
	},
	{
		"name": "wsc-199", "x": 878.5, "y": 1217.5, "zoomX": 0.241, "zoomY": 0.241, "rotation": 2.115, 
		"src": "images/wsc/wsc-199-1.png", "visible": true, "opacity": 0.6,
		"description": "Map of part of the estate of the Hon. Sidney Herbert, called Wilton Parade, showing the proposed appropriation thereof in sites for building. Also showing Baggot Street, Grand Canal and Fitzwilliam Place."
	},
	{
		"name": "wsc-465", "x": 301.5, "y": 711.5, "zoomX": 0.207, "zoomY": 0.207, "rotation": 3.3, 
		"src": "images/wsc/wsc-465.png", "visible": true, "opacity": 0.6,
		"description": "Grafton Street, Nassau Street (South side) and Dawson Street Date: 1837", 
		"date": 1837
	},
	{
		"name": "wsc-480-2", "x": -63, "y": 382, "zoomX": 0.068, "zoomY": 0.068, "rotation": -0.055, 
		"src": "images/wsc/wsc-480-2.png", "visible": true, "opacity": 0.6,
		"description": "North side of College Green showing Avenues thereof, and ground plan of Parliament House, Anglesea Street, Blackmoor Yard etc. - with reference giving tenants, names of premises required or purpose of improvement. Date: 1786", 
		"date": 1786
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
		"description": "Map of angle of Cavendish Row, Rutland Square and Great Britain Street - showing unsigned elevations and ground plan of Rotunda by Frederick Trench. Date: 1787", 
		"date": 1787
	},
	{
		"name": "wsc-203", "x": -392, "y": 272.5, "zoomX": 0.078, "zoomY": 0.076, "rotation": -0.25, 
		"src": "images/wsc/wsc-203.png", "visible": true, "opacity": 0.5,
		"description": "City Survey - showing Ormond Quay, Arran Street, Mary’s Abbey, Little Strand Street, Capel Street and Essex Bridge Date: 1811", 
		"date": 1811
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
		"description": "Crown Alley, Cope Street, Ardill’s Row, Temple Bar, Aston’s Quay and Wellington Quay No. 2 Date: 1820-5", 
		"date": 1820
	},
	{
		"name": "wsc-535", "x": -209.5, "y": 325, "zoomX": 0.134, "zoomY": 0.134, "rotation": -0.07, 
		"src": "images/wsc/wsc-535.png", "visible": true, "opacity": 0.5,
		"description": "Wellington Quay - continuation of Eustace Street Date"
	},
	{
		"name": "wsc-567-3", "x": 194.5, "y": 450, "zoomX": 0.126, "zoomY": 0.126, "rotation": 1.48, 
		"src": "images/wsc/wsc-567-3.png", "visible": true, "opacity": 0.5,
		"description": "Map of a parcel of ground bounded by Grafton Street, College Green, and Chequer Lane - leased to Mr. Pooley (3 copies) No. 3 Date: 1682", 
		"date": 1682
	},
	{
		"name": "wsc-594-1", "x": -564.5, "y": 572.5, "zoomX": 0.044, "zoomY": 0.044, "rotation": 2.535, 
		"src": "images/wsc/wsc-594-1.png", "visible": true, "opacity": 0.5,
		"description": "Map of New Hall Market - part of the City Estate Date: 1780", 
		"date": 1780
	},
	{
		"name": "wsc-625-1", "x": -320.5, "y": 609.5, "zoomX": 0.058, "zoomY": 0.058, "rotation": 2.61, 
		"src": "images/wsc/wsc-625-1.png", "visible": true, "opacity": 0.5,
		"description": "Map of the Old Tholsell ground, formerly called Souther’s Lane, belonging to the City of Dublin - laid out for building, Nicholas Street, Skinners Row and Werburgh Street By A. R. Neville, C. S. Date: 1812", 
		"date": 1812
	},
	{
		"name": "wsc-654", "x": -397.5, "y": 409, "zoomX": 0.122, "zoomY": 0.122, "rotation": -0.135, 
		"src": "images/wsc/wsc-654.png", "visible": true, "opacity": 0.5,
		"description": "Map of the ground plots of several holdings belonging to the City of Dublin, Madam O’Hara, Colonel Berry and others, on Back Quay - (Essex Quay) Blind Quay - Exchange Street, Essex Bridge, Crane Lane and Dame Street, Sycamore Alley - showing portion of the City Wall, Essex Gate, Dame Gate, Dames Mill and branch of the River Dodder"
	},
	{
		"name": "wsc-705", "x": -187.5, "y": 392, "zoomX": 0.04, "zoomY": 0.042, "rotation": -0.38, 
		"src": "images/wsc/wsc-705.png", "visible": true, "opacity": 0.5,
		"description": "Map of Essex Street and vicinity Date: 1806", 
		"date": 1806
	},
	{
		"name": "wsc-725", "x": -654, "y": 226, "zoomX": 0.094, "zoomY": 0.094, "rotation": 0.07, 
		"src": "images/wsc/wsc-725.png", "visible": true, "opacity": 0.5,
		"description": "Church Street, Charles Street, Inn’s Quay - 'White Cross Inn' - rere of Four Courts - Ushers’ Quay, Merchant’s Quay, Wood Quay - with reference Date: 1833", 
		"date": 1833
	},
	{
		"name": "wsc-198-1", "x": -459.5, "y": 469, "zoomX": 0.026, "zoomY": 0.026, "rotation": -0.305, 
		"src": "images/wsc/wsc-198-1.png", "visible": true, "opacity": 0.5,
		"description": "Map of Whitehorse Yard (Winetavern Street) Surveyor: Arthur Neville Date: 1847", 
		"date": 1847
	},
	{
		"name": "wsc-055", "x": -1775, "y": -1446, "zoomX": 1.11, "zoomY": 1.162, "rotation": 0.015, 
		"src": "images/wsc/wsc-055.png", "visible": true, "opacity": 0.5,
		"description": "Plan of Mail Coach Road, through Blessington Street to Cabra, of New Line Road, being part of the Navan Turnpike Road and connecting an improvement lately made upon that Line with the City of Dublin - showing the most direct line and also a Circuitons line whereby the expense of a Bridge across the Royal Canal may be avoided. Done by His Majesty's Post Masters of Ireland by Mr. Larkin Date: 1818", 
		"date": 1818
	},
	{
		"name": "wsc-060", "x": -104.5, "y": -1, "zoomX": 0.674, "zoomY": 0.702, "rotation": 3.165, 
		"src": "images/wsc/wsc-60.png", "visible": true, "opacity": 0.5,
		"description": "Map showing the alterations proposed in the new line of road, leading from Dublin to Navan, commencing at Blessington Street; passing along the Circular Road to Prussia Street, and hence along the Turnpike Road to Ratoath, and terminating at the Turnpike"
	},
	{
		"name": "wsc-065", "x": -545.5, "y": -275, "zoomX": 0.298, "zoomY": 0.292, "rotation": -1.05, 
		"src": "images/wsc/wsc-065.png", "visible": true, "opacity": 0.5,
		"description": "Map showing Mountjoy Street, Dorset Street, Dominick Street and vicinity - plan of Saint Mary’s Chapel of Ease, and proposed opening leading thereunto from Granby Row - Thomas Sherrard 30 Nov 1827", 
		"date": 1827
	},
	{
		"name": "wsc-012", "x": -125.5, "y": 149.5, "zoomX": 0.044, "zoomY": 0.044, "rotation": -0.22, 
		"src": "images/wsc/wsc-012.png", "visible": true, "opacity": 0.5,
		"description": "Map of premises Lower Abbey Street, Lower Sackville Street and Eden Quay"
	},
	{
		"name": "wsc-014", "x": -1555.5, "y": 27, "zoomX": 0.14, "zoomY": 0.14, "rotation": 0.055, 
		"src": "images/wsc/wsc-014.png", "visible": true, "opacity": 0.5,
		"description": "A survey of ground contiguous to the Horse Barracks, Dublin - showing Montpelier Hill, Barrack Street, Parkgate Street and environs (Thomas Sherrard) Date: 1790", 
		"date": 1790
	},
	{
		"name": "wsc-015", "x": -1414.5, "y": 29, "zoomX": 0.116, "zoomY": 0.112, "rotation": 0.075, 
		"src": "images/wsc/wsc-015.png", "visible": true, "opacity": 0.5,
		"description": "Arbour Hill, Royal Barracks and vicinity. With reference. Date: 1790",
		"date": 1790
	},
	{
		"name": "wsc-016", "x": -847, "y": 231.5, "zoomX": 0.038, "zoomY": 0.038, "rotation": 0.095, 
		"src": "images/wsc/wsc-016.png", "visible": true, "opacity": 0.5,
		"description": "Map - Arran Quay, Queen Street Date:1790",
		"date": 1790,
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
		"description": "Plan of streets about Mary’s Abbey and Boot Lane - (Old Bank) Date: 1811", 
		"date": 1811
	},
	{
		"name": "wsc-063", "x": -88.5, "y": 26.5, "zoomX": 0.3, "zoomY": 0.3, "rotation": -2.145, 
		"src": "images/wsc/wsc-063.png", "visible": true, "opacity": 0.5,
		"description": "Elevation of the west front and plan of Mountjoy Square laid out on the rising ground, near George’s Church - the estate of the Right Hon. Luke Gardiner, and now (1787), to be let for building - Lord Mountjoy’s plan. Date: 1787", 
		"date": 1787
	},
	{
		"name": "wsc-087-2", "x": -172.5, "y": 1419, "zoomX": 0.086, "zoomY": 0.086, "rotation": -1.695, 
		"src": "images/wsc/wsc-087-2.png", "visible": true, "opacity": 0.5,
		"description": "Camden Street Upper and Charlotte Street Date: 1841", 
		"date": 1841
	},
	{
		"name": "wsc-090", "x": -261, "y": 505, "zoomX": 0.074, "zoomY": 0.066, "rotation": -0.23, 
		"src": "images/wsc/wsc-090.png", "visible": true, "opacity": 0.5,
		"description": "Castle Yard, Castle Street, Dame Street, Parliament Street and vicinity Date: 1764", 
		"date": 1764
	},
	{
		"name": "wsc-100-2", "x": -528, "y": 464, "zoomX": 0.078, "zoomY": 0.078, "rotation": -0.27, 
		"src": "images/wsc/wsc-100-2.png", "visible": true, "opacity": 0.5,
		"description": "Map of premises to be valued by Jury; Cock Hill, Michael’s Lane, Winetavern Street, John’s Lane, Christchurch, Patrick Street and Patrick’s Close Date: 1813", 
		"date": 1813
	},
	{
		"name": "wsc-103", "x": 99.5, "y": 566, "zoomX": 0.062, "zoomY": 0.06, "rotation": -3.155, 
		"src": "images/wsc/wsc-103.png", "visible": true, "opacity": 0.5,
		"description": "Map of South Side of College Green and vicinity Date: 1808",
		"date": 1808
	},
	{
		"name": "wsc-149-1", "x": -1091, "y": 515.5, "zoomX": 0.062, "zoomY": 0.06, "rotation": 0, 
		"src": "images/wsc/wsc-149-1.png", "visible": true, "opacity": 0.8,
		"description": "Map - James’s Gate, James Street, Thomas Street and Watling Street. Mr. Guinness’s Place Date: 1845", 
		"date": 1845
	},
	{
		"name": "wsc-149-2", "x": -1074.5, "y": 488, "zoomX": 0.044, "zoomY": 0.048, "rotation": 0, 
		"src": "images/wsc/wsc-149-2.png", "visible": true, "opacity": 0.5,
		"description": "Map - James’s Gate, James Street, Thomas Street and Watling Street. Mr. Guinness’s Place Date: 1845", 
		"date": 1845
	},
	{
		"name": "wsc-254", "x": -438, "y": -142, "zoomX": 0.118, "zoomY": 0.12, "rotation": -0.415, 
		"src": "images/wsc/wsc-254.png", "visible": true, "opacity": 0.5,
		"description": "Map of Mabbot Street, Montgomery Street, Dominick Street, Cherry Lane, Cross Lane and Turn-again-Lane Date: 1801",
		"date": 1801
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
const canvasview_2 = require("./gtwo/canvasview");
const imagecontroller_1 = require("./gtwo/imagecontroller");
const tilelayer_1 = require("./gtwo/tilelayer");
const layermanager_1 = require("./gtwo/layermanager");
const layercontroller_1 = require("./gtwo/layercontroller");
const firemaps = require("./imagegroups/firemaps.json");
const landmarks = require("./imagegroups/landmarks.json");
const wsc = require("./imagegroups/wscd.json");
let earlyDates = layermanager_1.dateFilter(wsc, 1680, 1792);
let midDates = layermanager_1.dateFilter(wsc, 1793, 1820);
let lateDates = layermanager_1.dateFilter(wsc, 1821, 1900);
let otherDates = layermanager_1.datelessFilter(wsc);
let layerState = new view_1.BasicTransform(0, 0, 1, 1, 0);
let imageLayer = new layer_1.ContainerLayer(layerState);
let imageState = new view_1.BasicTransform(-1440, -1440, 0.222, 0.222, 0);
let countyState = new view_1.BasicTransform(-3655, -3587.5, 1.716, 1.674, 0);
let countyImage = new static_1.StaticImage(countyState, "images/County_of_the_City_of_Dublin_1837_map.png", 0.5, true);
let bgState = new view_1.BasicTransform(-1126, -1086, 1.58, 1.55, 0);
let bgImage = new static_1.StaticImage(bgState, "images/fmss.jpeg", .6, true);
let tmState = new view_1.BasicTransform(-1033.5, 149, 0.59, 0.59, 0);
let tmImage = new static_1.StaticImage(tmState, "images/thingmot.png", .3, true);
let duState = new view_1.BasicTransform(-929, -105.5, 0.464, 0.506, 0);
let duImage = new static_1.StaticImage(duState, "images/dublin1610.jpg", .3, false);
let gridTransform = new view_1.BasicTransform(0, 0, 1, 1, 0);
let staticGrid = new grid_1.StaticGrid(gridTransform, 1, false, 256, 256);
let sentinelStruct = new tilelayer_1.TileStruct("qtile/dublin/", ".png", "images/qtile/dublin/");
let sentinelTransform = new view_1.BasicTransform(0, 0, 2, 2, 0);
let zoomDisplay = new canvasview_2.ZoomDisplayRange(0.8, 4);
let sentinelLayer = new tilelayer_1.TileLayer(sentinelTransform, sentinelStruct, true, zoomDisplay, 15816, 10624, 15);
let sentinelBTransform = new view_1.BasicTransform(0, 0, 4, 4, 0);
let zoomBDisplay = new canvasview_2.ZoomDisplayRange(.2, 0.8);
let sentinelBLayer = new tilelayer_1.TileLayer(sentinelBTransform, sentinelStruct, true, zoomBDisplay, 7908, 5312, 14);
let sentinelCTransform = new view_1.BasicTransform(0, 0, 8, 8, 0);
let zoomCDisplay = new canvasview_2.ZoomDisplayRange(.04, .2);
let sentinelSLayer = new tilelayer_1.TileLayer(sentinelCTransform, sentinelStruct, true, zoomCDisplay, 3954, 2656, 13);
let recentre = new view_1.BasicTransform(-1024, -1536, 1, 1, 0);
let sentinelContainerLayer = new layer_1.ContainerLayer(recentre);
sentinelContainerLayer.set("zoomIn", sentinelLayer);
sentinelContainerLayer.set("zoomMid", sentinelBLayer);
sentinelContainerLayer.set("zoomOut", sentinelSLayer);
let editContainerLayer = new layer_1.ContainerLayer(view_1.BasicTransform.unitTransform);
//imageLayer.set("county", countyImage);
imageLayer.set("background", bgImage);
let layerManager = new layermanager_1.LayerManager();
//let recentreLayers = new BasicTransform(-1024, -1536, 1, 1, 0);
let firemapLayer = layerManager.addLayer(firemaps, "firemaps");
let landmarksLayer = layerManager.addLayer(landmarks, "landmarks");
let wscEarlyLayer = layerManager.addLayer(earlyDates, "wsc_early");
let wscMidLayer = layerManager.addLayer(midDates, "wsc_mid");
wscMidLayer.setVisible(false);
let wscLateLayer = layerManager.addLayer(lateDates, "wsc_late");
wscLateLayer.setVisible(false);
let wscOtherLayer = layerManager.addLayer(otherDates, "wsc_other");
wscOtherLayer.setVisible(false);
let edit = wscEarlyLayer.get("wsc-361");
let containerLayerManager = new layermanager_1.ContainerLayerManager(wscEarlyLayer, editContainerLayer);
let outlineLayer = containerLayerManager.setSelected("wsc-361");
imageLayer.set("wsc_other", wscOtherLayer);
imageLayer.set("wsc_early", wscEarlyLayer);
imageLayer.set("wsc_mid", wscMidLayer);
imageLayer.set("wsc_late", wscLateLayer);
imageLayer.set("firemaps", firemapLayer);
imageLayer.set("dublin1610", duImage);
imageLayer.set("thingmot", tmImage);
imageLayer.set("landmarks", landmarksLayer);
wscEarlyLayer.setTop("wsc-361");
function showMap(divName, name) {
    const canvas = document.getElementById(divName);
    let x = outlineLayer.x;
    let y = outlineLayer.y;
    let canvasTransform = new view_1.BasicTransform(x - 200, y - 200, 0.5, 0.5, 0);
    let canvasView = new canvasview_1.CanvasView(canvasTransform, canvas.clientWidth, canvas.clientHeight, canvas);
    canvasView.layers.push(sentinelContainerLayer);
    canvasView.layers.push(imageLayer);
    canvasView.layers.push(staticGrid);
    canvasView.layers.push(editContainerLayer);
    let tileController = new imagecontroller_1.DisplayElementController(canvasView, sentinelContainerLayer, "v");
    let baseController = new imagecontroller_1.DisplayElementController(canvasView, bgImage, "B");
    let countyController = new imagecontroller_1.DisplayElementController(canvasView, countyImage, "V");
    let firemapController = new imagecontroller_1.DisplayElementController(canvasView, firemapLayer, "b");
    let wscEarlyController = new imagecontroller_1.DisplayElementController(canvasView, wscEarlyLayer, "1");
    let wscLateController = new imagecontroller_1.DisplayElementController(canvasView, wscMidLayer, "2");
    let wscMidController = new imagecontroller_1.DisplayElementController(canvasView, wscLateLayer, "3");
    let wscOtherController = new imagecontroller_1.DisplayElementController(canvasView, wscOtherLayer, "4");
    let landmarkController = new imagecontroller_1.DisplayElementController(canvasView, landmarksLayer, "m");
    let tmController = new imagecontroller_1.DisplayElementController(canvasView, tmImage, "n");
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

},{"./gtwo/canvasview":2,"./gtwo/grid":3,"./gtwo/imagecontroller":4,"./gtwo/layer":5,"./gtwo/layercontroller":6,"./gtwo/layermanager":7,"./gtwo/static":8,"./gtwo/tilelayer":9,"./gtwo/view":10,"./gtwo/viewcontroller":11,"./imagegroups/firemaps.json":12,"./imagegroups/landmarks.json":13,"./imagegroups/wscd.json":14}]},{},[15])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2d0d28vY2FudmFzdmlldy50cyIsInNyYy9ndHdvL2dyaWQudHMiLCJzcmMvZ3R3by9pbWFnZWNvbnRyb2xsZXIudHMiLCJzcmMvZ3R3by9sYXllci50cyIsInNyYy9ndHdvL2xheWVyY29udHJvbGxlci50cyIsInNyYy9ndHdvL2xheWVybWFuYWdlci50cyIsInNyYy9ndHdvL3N0YXRpYy50cyIsInNyYy9ndHdvL3RpbGVsYXllci50cyIsInNyYy9ndHdvL3ZpZXcudHMiLCJzcmMvZ3R3by92aWV3Y29udHJvbGxlci50cyIsInNyYy9pbWFnZWdyb3Vwcy9maXJlbWFwcy5qc29uIiwic3JjL2ltYWdlZ3JvdXBzL2xhbmRtYXJrcy5qc29uIiwic3JjL2ltYWdlZ3JvdXBzL3dzY2QuanNvbiIsInNyYy9zaW1wbGVXb3JsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQ0EsTUFBYSxPQUFPO0lBT2hCLFlBQVksQ0FBUyxFQUFFLENBQVM7UUFDNUIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBRUUsUUFBUTtRQUNKLE9BQU8sVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQ3JELENBQUM7O0FBYmUsWUFBSSxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN6QixXQUFHLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRjVDLDBCQWdCQztBQUVELFNBQWdCLE1BQU0sQ0FDcEIsS0FBYyxFQUNkLEtBQWEsRUFDYixRQUFpQixJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUMsQ0FB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QUMsVUFBVSxDQUFDO1FBRTVDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0MsSUFBSSxLQUFLLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUMvQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUQsSUFBSSxNQUFNLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUVoRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzlDLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDL0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzlELElBQUksT0FBTyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUU7UUFFbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBRTlDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNoQixHQUFHLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQztRQUUxQixLQUFL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TUFBTSxDQUFDO1lBQ2hELElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztTQUNuRDtRQUVELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDM0IsQ0FBQztDQUVKO0FBNUZELHdDQTRGQzs7O0FDdkhEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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LEtBQUssVUFBVTtJQUNsQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEtBQUssU0FBUyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsRUFDM0U7SUFDRCxJQUFJLEVBQUUsQ0FBQztDQUNQO0tBQU07SUFDTixRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDcEQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcbmV4cG9ydCBjbGFzcyBQb2ludDJEIHtcbiAgICBzdGF0aWMgcmVhZG9ubHkgemVybyA9IG5ldyBQb2ludDJEKDAsIDApO1xuICAgIHN0YXRpYyByZWFkb25seSBvbmUgPSBuZXcgUG9pbnQyRCgxLCAxKTtcblxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcbiAgICByZWFkb25seSB5OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuXHR9XG5cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gXCJQb2ludDJEKFwiICsgdGhpcy54ICsgXCIsIFwiICsgdGhpcy55ICsgXCIpXCI7XG4gICAgfVxuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGUoXG4gIHBvaW50OiBQb2ludDJELCBcbiAgYW5nbGU6IG51bWJlciwgXG4gIGFib3V0OiBQb2ludDJEID0gbmV3IFBvaW50MkQoMCwwKVxuKTogUG9pbnQyRCB7XG5cbiAgICBsZXQgcyA9IE1hdGguc2luKGFuZ2xlKTtcbiAgICBsZXQgYyA9IE1hdGguY29zKGFuZ2xlKTtcblxuICAgIGxldCBweCA9IHBvaW50LnggLSBhYm91dC54O1xuICAgIGxldCBweSA9IHBvaW50LnkgLSBhYm91dC55O1xuXG4gICAgbGV0IHhuZXcgPSBweCAqIGMgKyBweSAqIHM7XG4gICAgbGV0IHluZXcgPSBweSAqIGMgLSBweCAqIHM7XG5cbiAgICByZXR1cm4gbmV3IFBvaW50MkQoeG5ldyArIGFib3V0LngsIHluZXcgKyBhYm91dC55KTtcbn1cblxuZXhwb3J0IGNsYXNzIERpbWVuc2lvbiB7XG5cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgeDogbnVtYmVyLCBwdWJsaWMgeTogbnVtYmVyLCBwdWJsaWMgdzogbnVtYmVyLCBwdWJsaWMgaDogbnVtYmVyKXt9XG5cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gXCJEaW1lbnNpb24oXCIgKyB0aGlzLnggKyBcIiwgXCIgKyB0aGlzLnkgKyBcIiwgXCIgKyB0aGlzLncgKyBcIiwgXCIgKyB0aGlzLmggKyBcIilcIjtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBDYW52YXNMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBcblx0aW52ZXJ0VHJhbnNmb3JtLCBcblx0Vmlld1RyYW5zZm9ybSwgXG5cdEJhc2ljVmlld1RyYW5zZm9ybSwgXG5cdFRyYW5zZm9ybSwgXG5cdEJhc2ljVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIERpc3BsYXlFbGVtZW50IGV4dGVuZHMgVHJhbnNmb3JtIHtcblx0aXNWaXNpYmxlKCk6IGJvb2xlYW47XG5cdHNldFZpc2libGUodmlzaWJsZTogYm9vbGVhbik6IHZvaWQ7XG5cdGdldE9wYWNpdHkoKTogbnVtYmVyO1xuXHRzZXRPcGFjaXR5KG9wYWNpdHk6IG51bWJlcik6IHZvaWQ7XG5cdGdldFpvb21EaXNwbGF5UmFuZ2UoKTogWm9vbURpc3BsYXlSYW5nZTtcbn1cblxuZXhwb3J0IGNsYXNzIFpvb21EaXNwbGF5UmFuZ2Uge1xuXG4gICAgc3RhdGljIHJlYWRvbmx5IEFsbFpvb21SYW5nZSA9IG5ldyBab29tRGlzcGxheVJhbmdlKC0xLCAtMSk7XG5cblx0Y29uc3RydWN0b3IocHVibGljIG1pblpvb206IG51bWJlciwgcHVibGljIG1heFpvb206IG51bWJlcil7fVxuXG5cdHdpdGhpblJhbmdlKHpvb206IG51bWJlcik6IEJvb2xlYW4ge1xuXHRcdHJldHVybiAoKHpvb20gPj0gdGhpcy5taW5ab29tIHx8IHRoaXMubWluWm9vbSA9PSAtMSkgJiYgXG5cdFx0XHQoem9vbSA8PSB0aGlzLm1heFpvb20gfHwgdGhpcy5tYXhab29tID09IC0xKSk7XG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIENhbnZhc1ZpZXcgZXh0ZW5kcyBCYXNpY1ZpZXdUcmFuc2Zvcm0ge1xuXG5cdGxheWVyczogQXJyYXk8Q2FudmFzTGF5ZXI+ID0gW107XG5cdGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdGxvY2FsVHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHRcdHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBcblx0XHRyZWFkb25seSBjYW52YXNFbGVtZW50OiBIVE1MQ2FudmFzRWxlbWVudCl7XG5cblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybS54LCBsb2NhbFRyYW5zZm9ybS55LCB3aWR0aCwgaGVpZ2h0LCBcblx0XHRcdGxvY2FsVHJhbnNmb3JtLnpvb21YLCBsb2NhbFRyYW5zZm9ybS56b29tWSwgXG5cdFx0XHRsb2NhbFRyYW5zZm9ybS5yb3RhdGlvbik7XG5cblx0XHR0aGlzLmluaXRDYW52YXMoKTtcblxuXHRcdHRoaXMuY3R4ID0gY2FudmFzRWxlbWVudC5nZXRDb250ZXh0KFwiMmRcIik7XG5cdH1cblxuXHR6b29tQWJvdXQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHpvb21CeTogbnVtYmVyKXtcblxuICAgICAgICB0aGlzLnpvb21YID0gdGhpcy56b29tWCAqIHpvb21CeTtcbiAgICAgICAgdGhpcy56b29tWSA9IHRoaXMuem9vbVkgKiB6b29tQnk7XG5cbiAgICAgICAgbGV0IHJlbGF0aXZlWCA9IHggKiB6b29tQnkgLSB4O1xuICAgICAgICBsZXQgcmVsYXRpdmVZID0geSAqIHpvb21CeSAtIHk7XG5cbiAgICAgICAgbGV0IHdvcmxkWCA9IHJlbGF0aXZlWCAvIHRoaXMuem9vbVg7XG4gICAgICAgIGxldCB3b3JsZFkgPSByZWxhdGl2ZVkgLyB0aGlzLnpvb21ZO1xuXG4gICAgICAgIHRoaXMueCA9IHRoaXMueCArIHdvcmxkWDtcbiAgICAgICAgdGhpcy55ID0gdGhpcy55ICsgd29ybGRZO1xuXG5cdH1cblxuXHRkcmF3KCk6IGJvb2xlYW4ge1xuXHRcdGxldCB0cmFuc2Zvcm0gPSBpbnZlcnRUcmFuc2Zvcm0odGhpcyk7XG5cblx0XHR0aGlzLmN0eC5maWxsU3R5bGUgPSBcImdyZXlcIjtcblx0XHR0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG5cblx0XHR2YXIgZHJhd2luZ0NvbXBsZXRlID0gdHJ1ZTtcblxuXHRcdGZvciAobGV0IGxheWVyIG9mIHRoaXMubGF5ZXJzKXtcblx0XHRcdGlmIChsYXllci5pc1Zpc2libGUoKSl7XG5cdFx0XHRcdGRyYXdpbmdDb21wbGV0ZSA9IGRyYXdpbmdDb21wbGV0ZSAmJiBsYXllci5kcmF3KHRoaXMuY3R4LCBCYXNpY1RyYW5zZm9ybS51bml0VHJhbnNmb3JtLCB0aGlzKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdH1cblxuXHRcdHRoaXMuZHJhd0NlbnRyZSh0aGlzLmN0eCk7XG5cdFx0dGhpcy5zaG93SW5mbyh0aGlzLmN0eCk7XG5cblx0XHRyZXR1cm4gZHJhd2luZ0NvbXBsZXRlO1xuXHR9XG5cblx0ZHJhd0NlbnRyZShjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpe1xuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICBjb250ZXh0Lmdsb2JhbEFscGhhID0gMC4zO1xuICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gXCJyZWRcIjtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8odGhpcy53aWR0aC8yLCA2LzE2KnRoaXMuaGVpZ2h0KTtcbiAgICAgICAgY29udGV4dC5saW5lVG8odGhpcy53aWR0aC8yLCAxMC8xNip0aGlzLmhlaWdodCk7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKDcvMTYqdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQvMik7XG4gICAgICAgIGNvbnRleHQubGluZVRvKDkvMTYqdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQvMik7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBcImJsYWNrXCI7XG4gICAgICAgIGNvbnRleHQuZ2xvYmFsQWxwaGEgPSAxO1xuICAgIH1cblxuICAgIHNob3dJbmZvKGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCl7XG4gICAgXHRjb250ZXh0LnN0cm9rZVN0eWxlID0gXCJyZWRcIjtcbiAgICBcdGNvbnRleHQuZmlsbFRleHQoXCJ6b29tOiBcIiArIHRoaXMuem9vbVgsIDEwLCAxMCk7XG4gICAgXHRjb250ZXh0LmZpbGwoKTtcbiAgICB9XG5cblx0cHJpdmF0ZSBpbml0Q2FudmFzKCl7XG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMuY2FudmFzRWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgbGV0IGhlaWdodCA9IHRoaXMuY2FudmFzRWxlbWVudC5jbGllbnRIZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC5oZWlnaHQgPSBoZWlnaHQ7XG5cdH1cblxufSIsImltcG9ydCB7IERyYXdMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBUcmFuc2Zvcm0sIFZpZXdUcmFuc2Zvcm0sIGNvbWJpbmVUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBEaW1lbnNpb24gfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbi8qKlxuKiBXZSBkb24ndCB3YW50IHRvIGRyYXcgYSBncmlkIGludG8gYSB0cmFuc2Zvcm1lZCBjYW52YXMgYXMgdGhpcyBnaXZlcyB1cyBncmlkIGxpbmVzIHRoYXQgYXJlIHRvb1xudGhpY2sgb3IgdG9vIHRoaW5cbiovXG5leHBvcnQgY2xhc3MgU3RhdGljR3JpZCBleHRlbmRzIERyYXdMYXllciB7XG5cblx0em9vbVdpZHRoOiBudW1iZXI7XG5cdHpvb21IZWlnaHQ6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3Rvcihsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCB6b29tTGV2ZWw6IG51bWJlciwgdmlzaWJsZTogYm9vbGVhbixcblx0XHRyZWFkb25seSBncmlkV2lkdGg6IG51bWJlciA9IDI1NiwgcmVhZG9ubHkgZ3JpZEhlaWdodDogbnVtYmVyID0gMjU2KXtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCAxLCB2aXNpYmxlKTtcblxuXHRcdGxldCB6b29tID0gTWF0aC5wb3coMiwgem9vbUxldmVsKTtcblx0XHR0aGlzLnpvb21XaWR0aCA9IGdyaWRXaWR0aCAvIHpvb207XG5cdFx0dGhpcy56b29tSGVpZ2h0ID0gZ3JpZEhlaWdodCAvIHpvb207XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB0cmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0bGV0IG9mZnNldFggPSB2aWV3LnggKiB2aWV3Lnpvb21YO1xuXHRcdGxldCBvZmZzZXRZID0gdmlldy55ICogdmlldy56b29tWTtcblxuXHRcdGxldCB2aWV3V2lkdGggPSB2aWV3LndpZHRoIC8gdmlldy56b29tWDtcblx0XHRsZXQgdmlld0hlaWdodCA9IHZpZXcuaGVpZ2h0IC8gdmlldy56b29tWTtcblxuXHRcdGxldCBncmlkQWNyb3NzID0gdmlld1dpZHRoIC8gdGhpcy56b29tV2lkdGg7XG5cdFx0bGV0IGdyaWRIaWdoID0gdmlld0hlaWdodCAvIHRoaXMuem9vbUhlaWdodDtcblxuXHRcdGxldCB4TWluID0gTWF0aC5mbG9vcih2aWV3LngvdGhpcy56b29tV2lkdGgpO1xuXHRcdGxldCB4TGVmdCA9IHhNaW4gKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IHhNYXggPSBNYXRoLmNlaWwoKHZpZXcueCArIHZpZXdXaWR0aCkgLyB0aGlzLnpvb21XaWR0aCk7XG5cdFx0bGV0IHhSaWdodCA9IHhNYXggKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cblx0XHRsZXQgeU1pbiA9IE1hdGguZmxvb3Iodmlldy55L3RoaXMuem9vbUhlaWdodCk7XG5cdFx0bGV0IHlUb3AgPSB5TWluICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWDtcblx0XHRsZXQgeU1heCA9IE1hdGguY2VpbCgodmlldy55ICsgdmlld0hlaWdodCkgLyB0aGlzLnpvb21IZWlnaHQpO1xuXHRcdGxldCB5Qm90dG9tID0geU1heCAqIHRoaXMuem9vbUhlaWdodCAqIHZpZXcuem9vbVggO1xuXG5cdFx0Y29uc29sZS5sb2coXCJ4TWluIFwiICsgeE1pbiArIFwiIHhNYXggXCIgKyB4TWF4KTtcblx0XHRjb25zb2xlLmxvZyhcInlNaW4gXCIgKyB5TWluICsgXCIgeU1heCBcIiArIHlNYXgpO1xuXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcblxuXHRcdGZvciAodmFyIHggPSB4TWluOyB4PD14TWF4OyB4Kyspe1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImF0IFwiICsgbWluWCk7XG5cdFx0XHRsZXQgeE1vdmUgPSB4ICogdGhpcy56b29tV2lkdGggKiB2aWV3Lnpvb21YO1xuXHRcdFx0Y3R4Lm1vdmVUbyh4TW92ZSAtIG9mZnNldFgsIHlUb3AgLSBvZmZzZXRZKTtcblx0XHRcdGN0eC5saW5lVG8oeE1vdmUgLSBvZmZzZXRYLCB5Qm90dG9tIC0gb2Zmc2V0WSk7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgeSA9IHlNaW47IHk8PXlNYXg7IHkrKyl7XG5cblx0XHRcdGxldCB5TW92ZSA9IHkgKiB0aGlzLnpvb21IZWlnaHQgKiB2aWV3Lnpvb21ZO1xuXHRcdFx0Y3R4Lm1vdmVUbyh4TGVmdCAtIG9mZnNldFgsIHlNb3ZlIC0gb2Zmc2V0WSk7XG5cdFx0XHRjdHgubGluZVRvKHhSaWdodCAtIG9mZnNldFgsIHlNb3ZlIC0gb2Zmc2V0WSk7XG5cblx0XHRcdGZvciAodmFyIHggPSB4TWluOyB4PD14TWF4OyB4Kyspe1xuXHRcdFx0XHRsZXQgeE1vdmUgPSAoeC0uNSkgKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cdFx0XHRcdHlNb3ZlID0gKHktLjUpICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWTtcblx0XHRcdFx0bGV0IHRleHQgPSBcIlwiICsgKHgtMSkgKyBcIiwgXCIgKyAoeS0xKTtcblx0XHRcdFx0Y3R4LnN0cm9rZVRleHQodGV4dCwgeE1vdmUgLSBvZmZzZXRYLCB5TW92ZSAtIG9mZnNldFkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0Y29uc29sZS5sb2coXCJkcmV3IGdyaWRcIik7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHRyZXR1cm4gbmV3IERpbWVuc2lvbigwLCAwLCAwLCAwKTtcblx0fVxufSIsIlxuaW1wb3J0IHtDYW52YXNWaWV3LCBEaXNwbGF5RWxlbWVudH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuaW1wb3J0IHtDYW52YXNMYXllcn0gZnJvbSBcIi4vbGF5ZXJcIjtcbmltcG9ydCB7UmVjdExheWVyfSBmcm9tIFwiLi9zdGF0aWNcIjtcblxuZXhwb3J0IGNsYXNzIERpc3BsYXlFbGVtZW50Q29udHJvbGxlciB7XG5cbiAgICBjb25zdHJ1Y3RvcihjYW52YXNWaWV3OiBDYW52YXNWaWV3LCByZWFkb25seSBkaXNwbGF5RWxlbWVudDogRGlzcGxheUVsZW1lbnQsICBwdWJsaWMgbW9kOiBzdHJpbmcgPSBcInZcIikge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5wcmVzc2VkKGNhbnZhc1ZpZXcsIGUgIGFzIEtleWJvYXJkRXZlbnQpKTtcbiAgICB9XG5cbiAgICBwcmVzc2VkKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJwcmVzc2VkIGxheWVyXCIgKyBldmVudC50YXJnZXQgKyBcIiwgXCIgKyBldmVudC5rZXkpO1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICAgICAgICBjYXNlIHRoaXMubW9kOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidG9nZ2xlIHZpc2libGVcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5RWxlbWVudC5zZXRWaXNpYmxlKCF0aGlzLmRpc3BsYXlFbGVtZW50LmlzVmlzaWJsZSgpKTtcbiAgICAgICAgICAgICAgICBjYW52YXNWaWV3LmRyYXcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlQ29udHJvbGxlciB7XG5cbiAgICBwcml2YXRlIGNhbnZhc0xheWVyOiBDYW52YXNMYXllcjtcbiAgICBwcml2YXRlIGxheWVyT3V0bGluZTogUmVjdExheWVyO1xuXG4gICAgY29uc3RydWN0b3IoY2FudmFzVmlldzogQ2FudmFzVmlldywgY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyKSB7XG4gICAgXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLnByZXNzZWQoY2FudmFzVmlldywgZSAgYXMgS2V5Ym9hcmRFdmVudCkpO1xuICAgICAgICB0aGlzLmNhbnZhc0xheWVyID0gY2FudmFzTGF5ZXI7XG4gICAgfVxuXG4gICAgc2V0Q2FudmFzTGF5ZXIoY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyKXtcbiAgICAgICAgdGhpcy5jYW52YXNMYXllciA9IGNhbnZhc0xheWVyO1xuICAgIH1cblxuICAgIHNldExheWVyT3V0bGluZShsYXllck91dGxpbmU6IFJlY3RMYXllcil7XG4gICAgICAgIHRoaXMubGF5ZXJPdXRsaW5lID0gbGF5ZXJPdXRsaW5lO1xuICAgIH1cblxuICAgIHByZXNzZWQoY2FudmFzVmlldzogQ2FudmFzVmlldywgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBcdGNvbnNvbGUubG9nKFwicHJlc3NlZFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQua2V5KTtcblxuICAgICAgICBsZXQgbXVsdGlwbGllciA9IDE7XG5cbiAgICBcdHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgXHRcdGNhc2UgXCJhXCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54IC0gMC41ICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHR0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICBcdFx0XHRicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJBXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54IC0gNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgXHRcdGNhc2UgXCJkXCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54ICsgMC41ICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHR0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICBcdFx0XHRicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJEXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54ICsgNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgXHRcdGNhc2UgXCJ3XCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci55ID0gdGhpcy5jYW52YXNMYXllci55IC0gMC41ICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHR0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICBcdFx0XHRicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJXXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci55ID0gdGhpcy5jYW52YXNMYXllci55IC0gNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7ICAgIFxuICAgIFx0XHRjYXNlIFwic1wiOlxuICAgIFx0XHRcdHRoaXMuY2FudmFzTGF5ZXIueSA9IHRoaXMuY2FudmFzTGF5ZXIueSArIDAuNSAqIG11bHRpcGxpZXI7XG4gICAgXHRcdFx0dGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiU1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIueSA9IHRoaXMuY2FudmFzTGF5ZXIueSArIDUgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImVcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uID0gdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiAtIDAuMDA1O1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIkVcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uID0gdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiAtIDAuMDU7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwicVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gPSB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uICsgMC4wMDU7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiUVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gPSB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uICsgMC4wNTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICBcdFx0Y2FzZSBcInhcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnpvb21YID0gdGhpcy5jYW52YXNMYXllci56b29tWCAtIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHR0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIlhcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnpvb21YID0gdGhpcy5jYW52YXNMYXllci56b29tWCArIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHR0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInpcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnpvb21ZID0gdGhpcy5jYW52YXNMYXllci56b29tWSAtIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHR0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIlpcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnpvb21ZID0gdGhpcy5jYW52YXNMYXllci56b29tWSArIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHR0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICBcdFx0XHRicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJjXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5zZXRWaXNpYmxlKCF0aGlzLmNhbnZhc0xheWVyLnZpc2libGUpO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLm9wYWNpdHkgPSBNYXRoLm1pbigxLjAsIHRoaXMuY2FudmFzTGF5ZXIub3BhY2l0eSArIDAuMSk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwidFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIub3BhY2l0eSA9IE1hdGgubWF4KDAsIHRoaXMuY2FudmFzTGF5ZXIub3BhY2l0eSAtIDAuMSk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgXHRcdGRlZmF1bHQ6XG4gICAgXHRcdFx0Ly8gY29kZS4uLlxuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0fVxuICAgICAgICBjb25zb2xlLmxvZygnXCJuYW1lXCI6IFwid3NjLTEwMC0yXCIsIFwieFwiOiAnICsgdGhpcy5jYW52YXNMYXllci54ICsgXG4gICAgICAgICAgICAnLCBcInlcIjogJyArIHRoaXMuY2FudmFzTGF5ZXIueSArIFxuICAgICAgICAgICAgJywgXCJ6b29tWFwiOiAnKyB0aGlzLmNhbnZhc0xheWVyLnpvb21YICsgXG4gICAgICAgICAgICAnLCBcInpvb21ZXCI6ICcgKyB0aGlzLmNhbnZhc0xheWVyLnpvb21ZICsgXG4gICAgICAgICAgICAnLCBcInJvdGF0aW9uXCI6ICcrIHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24pO1xuICAgIFx0Ly9jb25zb2xlLmxvZyhcImltYWdlIGF0OiBcIiArICB0aGlzLmNhbnZhc0xheWVyLnggKyBcIiwgXCIgKyB0aGlzLmNhbnZhc0xheWVyLnkpO1xuICAgIFx0Ly9jb25zb2xlLmxvZyhcImltYWdlIHJvIHNjOiBcIiArICB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uICsgXCIsIFwiICsgdGhpcy5jYW52YXNMYXllci56b29tWCArIFwiLCBcIiArIHRoaXMuY2FudmFzTGF5ZXIuem9vbVkpO1xuICAgIH07XG5cbiAgICB1cGRhdGVDYW52YXMoY2FudmFzVmlldzogQ2FudmFzVmlldykge1xuXG4gICAgICAgIGlmICh0aGlzLmxheWVyT3V0bGluZSAhPSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgbGV0IG5ld0RpbWVuc2lvbiA9IHRoaXMuY2FudmFzTGF5ZXIuZ2V0RGltZW5zaW9uKCk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiaW1hZ2Ugb3V0bGluZSBcIiArIG5ld0RpbWVuc2lvbik7XG4gICAgICAgICAgICB0aGlzLmxheWVyT3V0bGluZS51cGRhdGVEaW1lbnNpb24obmV3RGltZW5zaW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgIH1cblxufTsiLCJpbXBvcnQgeyBUcmFuc2Zvcm0sIEJhc2ljVHJhbnNmb3JtLCBWaWV3VHJhbnNmb3JtLCBjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgRGlzcGxheUVsZW1lbnQsIFpvb21EaXNwbGF5UmFuZ2UgfSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5pbXBvcnQgeyBEaW1lbnNpb24gfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDYW52YXNMYXllciBleHRlbmRzIEJhc2ljVHJhbnNmb3JtIGltcGxlbWVudHMgRGlzcGxheUVsZW1lbnQge1xuXG5cdGNvbnN0cnVjdG9yKFxuXHQgIHB1YmxpYyBsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0ICBwdWJsaWMgb3BhY2l0eTogbnVtYmVyLCBcblx0ICBwdWJsaWMgdmlzaWJsZSxcblx0ICBwcml2YXRlIHpvb21EaXNwbGF5UmFuZ2U6IFpvb21EaXNwbGF5UmFuZ2UgPSBab29tRGlzcGxheVJhbmdlLkFsbFpvb21SYW5nZSl7XG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0ueCwgbG9jYWxUcmFuc2Zvcm0ueSwgbG9jYWxUcmFuc2Zvcm0uem9vbVgsIGxvY2FsVHJhbnNmb3JtLnpvb21ZLCBcblx0XHRcdGxvY2FsVHJhbnNmb3JtLnJvdGF0aW9uKTtcblx0fVxuXG5cdGdldFpvb21EaXNwbGF5UmFuZ2UoKTogWm9vbURpc3BsYXlSYW5nZSB7XG5cdFx0cmV0dXJuIHRoaXMuem9vbURpc3BsYXlSYW5nZTtcblx0fVxuXG5cdGFic3RyYWN0IGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHBhcmVudFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHR2aWV3OiBWaWV3VHJhbnNmb3JtKTogYm9vbGVhbjtcblxuXHRhYnN0cmFjdCBnZXREaW1lbnNpb24oKTogRGltZW5zaW9uO1xuXG5cdGlzVmlzaWJsZSgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy52aXNpYmxlO1xuXHR9XG5cblx0c2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdm9pZCB7XG5cdFx0Y29uc29sZS5sb2coXCJzZXR0aW5nIHZpc2liaWxpdHk6IFwiICsgdmlzaWJsZSk7XG5cdFx0dGhpcy52aXNpYmxlID0gdmlzaWJsZTtcblx0fVxuXG5cdGdldE9wYWNpdHkoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5vcGFjaXR5O1xuXHR9XG5cblx0c2V0T3BhY2l0eShvcGFjaXR5OiBudW1iZXIpOiB2b2lkIHtcblx0XHR0aGlzLm9wYWNpdHkgPSBvcGFjaXR5O1xuXHR9XG5cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIERyYXdMYXllciBleHRlbmRzIENhbnZhc0xheWVyIHtcblxuICAgIHByb3RlY3RlZCBwcmVwYXJlQ3R4KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB0cmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVHJhbnNmb3JtKTogdm9pZCB7XG5cdFx0Y3R4LnRyYW5zbGF0ZSgodHJhbnNmb3JtLnggLSB2aWV3LngpICogdmlldy56b29tWCwgKHRyYW5zZm9ybS55IC0gdmlldy55KSAqIHZpZXcuem9vbVkpO1xuXHRcdGN0eC5zY2FsZSh0cmFuc2Zvcm0uem9vbVggKiB2aWV3Lnpvb21YLCB0cmFuc2Zvcm0uem9vbVkgKiB2aWV3Lnpvb21ZKTtcblx0XHRjdHgucm90YXRlKHRyYW5zZm9ybS5yb3RhdGlvbik7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNsZWFuQ3R4KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB0cmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVHJhbnNmb3JtKTogdm9pZCB7XHRcblx0XHRjdHgucm90YXRlKC10cmFuc2Zvcm0ucm90YXRpb24pO1xuXHRcdGN0eC5zY2FsZSgxL3RyYW5zZm9ybS56b29tWC92aWV3Lnpvb21YLCAxL3RyYW5zZm9ybS56b29tWS92aWV3Lnpvb21ZKTtcblx0XHRjdHgudHJhbnNsYXRlKC0odHJhbnNmb3JtLnggLXZpZXcueCkgKnZpZXcuem9vbVgsIC0odHJhbnNmb3JtLnkgLSB2aWV3LnkpICogdmlldy56b29tWSk7XG4gICAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBDb250YWluZXJMYXllciBleHRlbmRzIENhbnZhc0xheWVyIHtcblxuXHRsYXllck1hcDogTWFwPHN0cmluZywgQ2FudmFzTGF5ZXI+O1xuXHRkaXNwbGF5TGF5ZXJzOiBBcnJheTxDYW52YXNMYXllcj47XG5cblx0Y29uc3RydWN0b3IobG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgb3BhY2l0eTogbnVtYmVyID0gMSwgdmlzaWJsZTogYm9vbGVhbiA9IHRydWUpIHtcblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybSwgb3BhY2l0eSwgdmlzaWJsZSk7XG5cdFx0dGhpcy5sYXllck1hcCA9IG5ldyBNYXA8c3RyaW5nLCBDYW52YXNMYXllcj4oKTtcblx0XHR0aGlzLmRpc3BsYXlMYXllcnMgPSBbXTtcblx0fVxuXG5cdHNldChuYW1lOiBzdHJpbmcsIGxheWVyOiBDYW52YXNMYXllcil7XG5cdFx0dGhpcy5sYXllck1hcC5zZXQobmFtZSwgbGF5ZXIpO1xuXHRcdHRoaXMuZGlzcGxheUxheWVycy5wdXNoKGxheWVyKTtcblx0fVxuXG5cdGdldChuYW1lOiBzdHJpbmcpOiBDYW52YXNMYXllciB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXAuZ2V0KG5hbWUpO1xuXHR9XG5cblx0c2V0VG9wKG5hbWU6IHN0cmluZykge1xuXHRcdGxldCB0b3BMYXllciA9IHRoaXMuZ2V0KG5hbWUpO1xuXHRcdGlmICh0b3BMYXllciAhPSB1bmRlZmluZWQpe1xuXHRcdFx0dGhpcy5kaXNwbGF5TGF5ZXJzID0gdGhpcy5kaXNwbGF5TGF5ZXJzLmZpbHRlcihmdW5jdGlvbihlbGVtZW50OiBDYW52YXNMYXllcil7IFxuXHRcdFx0XHRpZiAoZWxlbWVudCA9PSB0b3BMYXllcil7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9fSk7XG5cdFx0XHR0aGlzLmRpc3BsYXlMYXllcnMucHVzaCh0b3BMYXllcik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUubG9nKFwidG9wIGxheWVyIHVuZGVmaW5lZCBcIiArIG5hbWUpO1xuXHRcdH1cblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHBhcmVudFRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBWaWV3VHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0XHRsZXQgbGF5ZXJUcmFuc2Zvcm0gPSBjb21iaW5lVHJhbnNmb3JtKHRoaXMubG9jYWxUcmFuc2Zvcm0sIHBhcmVudFRyYW5zZm9ybSk7XG5cblx0XHR2YXIgZHJhd2luZ0NvbXBsZXRlID0gdHJ1ZTtcblxuXHRcdGZvciAobGV0IGxheWVyIG9mIHRoaXMuZGlzcGxheUxheWVycykge1xuXHRcdFx0aWYgKGxheWVyLmlzVmlzaWJsZSgpKXtcblx0XHRcdFx0ZHJhd2luZ0NvbXBsZXRlID0gZHJhd2luZ0NvbXBsZXRlICYmIGxheWVyLmRyYXcoY3R4LCBsYXllclRyYW5zZm9ybSwgdmlldyk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9XG5cblx0XHRyZXR1cm4gZHJhd2luZ0NvbXBsZXRlO1xuXHR9XG5cblx0Z2V0RGltZW5zaW9uKCk6IERpbWVuc2lvbiB7XG5cdFx0dmFyIHhNaW4gPSB0aGlzLng7XG5cdFx0dmFyIHlNaW4gPSB0aGlzLnk7XG5cdFx0dmFyIHhNYXggPSB0aGlzLng7XG5cdFx0dmFyIHlNYXggPSB0aGlzLnk7XG5cblx0XHRmb3IgKGxldCBsYXllciBvZiB0aGlzLmRpc3BsYXlMYXllcnMpIHtcblx0XHRcdGxldCBsYXllckRpbWVuc2lvbiA9IGxheWVyLmdldERpbWVuc2lvbigpO1xuXHRcdFx0eE1pbiA9IE1hdGgubWluKHhNaW4sIHRoaXMueCArIGxheWVyRGltZW5zaW9uLngpO1xuXHRcdFx0eU1pbiA9IE1hdGgubWluKHlNaW4sIHRoaXMueSArIGxheWVyRGltZW5zaW9uLnkpO1xuXHRcdFx0eE1heCA9IE1hdGgubWF4KHhNYXgsIHRoaXMueCArIGxheWVyRGltZW5zaW9uLnggKyB0aGlzLnpvb21YICogbGF5ZXJEaW1lbnNpb24udyk7XG5cdFx0XHR5TWF4ID0gTWF0aC5tYXgoeU1heCwgdGhpcy55ICsgbGF5ZXJEaW1lbnNpb24ueSArIHRoaXMuem9vbVkgKiBsYXllckRpbWVuc2lvbi5oKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3IERpbWVuc2lvbih4TWluLCB5TWluLCB4TWF4IC0geE1pbiwgeU1heCAtIHlNaW4pO1xuXHR9XG5cblxufSIsImltcG9ydCB7IENvbnRhaW5lckxheWVyIH0gZnJvbSBcIi4vbGF5ZXJcIjtcbmltcG9ydCB7IENvbnRhaW5lckxheWVyTWFuYWdlciB9IGZyb20gXCIuL2xheWVybWFuYWdlclwiO1xuaW1wb3J0IHsgQ2FudmFzVmlldyB9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcblxuZXhwb3J0IGNsYXNzIExheWVyQ29udHJvbGxlciB7XG5cblx0cHJpdmF0ZSBtb2Q6IHN0cmluZyA9IFwiaVwiO1xuXG5cdGNvbnN0cnVjdG9yKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIHJlYWRvbmx5IGNvbnRhaW5lckxheWVyTWFuYWdlcjogQ29udGFpbmVyTGF5ZXJNYW5hZ2VyKXtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5wcmVzc2VkKGNhbnZhc1ZpZXcsIGUgIGFzIEtleWJvYXJkRXZlbnQpKTtcblx0fVxuXG5cdHByZXNzZWQoY2FudmFzVmlldzogQ2FudmFzVmlldywgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgICAgICAgICAgY2FzZSB0aGlzLm1vZDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInRvZ2dsZSB2aXNpYmxlXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29udGFpbmVyTGF5ZXJNYW5hZ2VyLnRvZ2dsZVZpc2liaWxpdHkoZmFsc2UpO1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgQ2FudmFzTGF5ZXIsIENvbnRhaW5lckxheWVyIH0gZnJvbSBcIi4vbGF5ZXJcIjtcbmltcG9ydCB7IFN0YXRpY0ltYWdlLCBSZWN0TGF5ZXIgfSBmcm9tIFwiLi9zdGF0aWNcIjtcbmltcG9ydCB7IFRyYW5zZm9ybSAsIEJhc2ljVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHtDYW52YXNWaWV3LCBEaXNwbGF5RWxlbWVudH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEltYWdlU3RydWN0IGV4dGVuZHMgVHJhbnNmb3JtIHtcblx0b3BhY2l0eTogbnVtYmVyO1xuXHR2aXNpYmxlOiBib29sZWFuO1xuXHRzcmM6IHN0cmluZztcblx0bmFtZTogc3RyaW5nO1xuXHRkYXRlOiBudW1iZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkYXRlRmlsdGVyKFxuICBpbWFnZVN0cnVjdDogQXJyYXk8SW1hZ2VTdHJ1Y3Q+LCBcbiAgZnJvbTogbnVtYmVyLCBcbiAgdG86IG51bWJlcik6IEFycmF5PEltYWdlU3RydWN0Pntcblx0cmV0dXJuIGltYWdlU3RydWN0LmZpbHRlcihmdW5jdGlvbihpbWFnZVN0cnVjdCl7IFxuXHRcdGlmIChpbWFnZVN0cnVjdC5kYXRlID09IHVuZGVmaW5lZClcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRpZiAoaW1hZ2VTdHJ1Y3QuZGF0ZSA+PSBmcm9tICYmIGltYWdlU3RydWN0LmRhdGUgPD0gdG8pIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2V9XG5cdFx0fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkYXRlbGVzc0ZpbHRlcihcbiAgaW1hZ2VTdHJ1Y3Q6IEFycmF5PEltYWdlU3RydWN0Pik6IEFycmF5PEltYWdlU3RydWN0Pntcblx0cmV0dXJuIGltYWdlU3RydWN0LmZpbHRlcihmdW5jdGlvbihpbWFnZVN0cnVjdCl7IFxuXHRcdGlmIChpbWFnZVN0cnVjdC5kYXRlID09IHVuZGVmaW5lZClcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlfVxuXHRcdH0pO1xufVxuXG5leHBvcnQgY2xhc3MgTGF5ZXJNYW5hZ2VyIHtcblxuXHRwcml2YXRlIGxheWVyTWFwOiBNYXA8c3RyaW5nLCBDb250YWluZXJMYXllcj47O1xuXG5cdHJlYWRvbmx5IGRlZmF1bHRMYXllcjogc3RyaW5nID0gXCJkZWZhdWx0XCI7XG5cblx0Y29uc3RydWN0b3IoKXtcblx0XHR0aGlzLmxheWVyTWFwID0gbmV3IE1hcDxzdHJpbmcsIENvbnRhaW5lckxheWVyPigpO1xuXG5cdFx0bGV0IGltYWdlTGF5ZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXIoQmFzaWNUcmFuc2Zvcm0udW5pdFRyYW5zZm9ybSwgMSwgdHJ1ZSk7XHRcblxuXHRcdHRoaXMubGF5ZXJNYXAuc2V0KHRoaXMuZGVmYXVsdExheWVyLCBpbWFnZUxheWVyKTtcblx0fVxuXG5cdGFkZEltYWdlKGltYWdlOiBTdGF0aWNJbWFnZSwgbmFtZTogc3RyaW5nKXtcblx0XHR0aGlzLmxheWVyTWFwLmdldCh0aGlzLmRlZmF1bHRMYXllcikuc2V0KG5hbWUsIGltYWdlKTtcblx0fVxuXG5cdGFkZExheWVyKFxuXHQgIGltYWdlRGV0YWlsczogQXJyYXk8SW1hZ2VTdHJ1Y3Q+LCBcblx0ICBsYXllck5hbWU6IHN0cmluZywgXG5cdCAgbGF5ZXJUcmFuc2Zvcm06IFRyYW5zZm9ybSA9IEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0pOiBDb250YWluZXJMYXllciB7XG5cblx0XHRsZXQgaW1hZ2VMYXllciA9IG5ldyBDb250YWluZXJMYXllcihsYXllclRyYW5zZm9ybSwgMSwgdHJ1ZSk7XHRcblxuXHRcdGZvciAodmFyIGltYWdlIG9mIGltYWdlRGV0YWlscyl7XG5cdFx0XHRsZXQgc3RhdGljSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoaW1hZ2UsIGltYWdlLnNyYywgaW1hZ2Uub3BhY2l0eSwgaW1hZ2UudmlzaWJsZSk7XG5cdFx0XHRpbWFnZUxheWVyLnNldChpbWFnZS5uYW1lLCBzdGF0aWNJbWFnZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5sYXllck1hcC5zZXQobGF5ZXJOYW1lLCBpbWFnZUxheWVyKTtcblxuXHRcdHJldHVybiBpbWFnZUxheWVyO1xuXHR9XG5cblx0Z2V0TGF5ZXJzKCk6IE1hcDxzdHJpbmcsIENvbnRhaW5lckxheWVyPiB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXA7XG5cdH1cblxuXHRnZXRMYXllcihuYW1lOiBzdHJpbmcpOiBDb250YWluZXJMYXllciB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXAuZ2V0KG5hbWUpO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNsYXNzIENvbnRhaW5lckxheWVyTWFuYWdlciB7XG5cblx0cHJpdmF0ZSBjb250YWluZXJMYXllcjogQ29udGFpbmVyTGF5ZXI7XG5cdHByaXZhdGUgc2VsZWN0ZWQ6IHN0cmluZztcblx0XG5cdGNvbnN0cnVjdG9yKGNvbnRhaW5lckxheWVyOiBDb250YWluZXJMYXllciwgXG5cdCAgcmVhZG9ubHkgZGlzcGxheUxheWVyOiBDb250YWluZXJMYXllciA9IGNvbnRhaW5lckxheWVyKSB7XG5cdFx0dGhpcy5jb250YWluZXJMYXllciA9IGNvbnRhaW5lckxheWVyO1xuXHR9XG5cblx0c2V0TGF5ZXJDb250YWluZXIoY29udGFpbmVyTGF5ZXI6IENvbnRhaW5lckxheWVyKSB7XG5cdFx0dGhpcy5jb250YWluZXJMYXllciA9IGNvbnRhaW5lckxheWVyO1xuXHR9XG5cblx0c2V0U2VsZWN0ZWQobmFtZTogc3RyaW5nKTogUmVjdExheWVyIHtcblx0XHR0aGlzLnNlbGVjdGVkID0gbmFtZTtcblxuXHRcdGxldCBsYXllcjogQ2FudmFzTGF5ZXIgPSB0aGlzLmNvbnRhaW5lckxheWVyLmdldCh0aGlzLnNlbGVjdGVkKTtcblxuXHRcdGxldCBsYXllclJlY3QgPSBuZXcgUmVjdExheWVyKGxheWVyLmdldERpbWVuc2lvbigpLCAxLCB0cnVlKTtcblxuXHRcdGxldCBsYXllck5hbWUgPSBcIm91dGxpbmVcIjsvL25hbWUgKyBcIl9vXCJcblxuXHRcdHRoaXMuZGlzcGxheUxheWVyLnNldChsYXllck5hbWUsIGxheWVyUmVjdCk7XG5cblx0XHRyZXR1cm4gbGF5ZXJSZWN0O1xuXHR9XG5cblx0dG9nZ2xlVmlzaWJpbGl0eShzZWxlY3RlZDogYm9vbGVhbiA9IHRydWUpe1xuXHRcdGxldCB0b2dnbGVHcm91cDogQXJyYXk8RGlzcGxheUVsZW1lbnQ+ID0gW107XG5cdFx0aWYgKHNlbGVjdGVkKXtcblx0XHRcdGlmICh0aGlzLnNlbGVjdGVkICE9IFwiXCIpe1xuXHRcdFx0XHR0b2dnbGVHcm91cC5wdXNoKHRoaXMuY29udGFpbmVyTGF5ZXIuZ2V0KHRoaXMuc2VsZWN0ZWQpKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Zm9yIChsZXQgcGFpciBvZiB0aGlzLmNvbnRhaW5lckxheWVyLmxheWVyTWFwKXtcblxuXHRcdFx0XHRpZiAocGFpclswXSAhPSB0aGlzLnNlbGVjdGVkKXtcblx0XHRcdFx0XHR0b2dnbGVHcm91cC5wdXNoKHBhaXJbMV0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwibGF5ZXJOYW1lOiBcIiArIHRoaXMuc2VsZWN0ZWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Zm9yIChsZXQgZWxlbWVudCBvZiB0b2dnbGVHcm91cCl7XG5cdFx0XHRlbGVtZW50LnNldFZpc2libGUoIWVsZW1lbnQuaXNWaXNpYmxlKCkpXG5cdFx0fVxuXHR9XG5cbn0iLCJpbXBvcnQgeyBUcmFuc2Zvcm0sIEJhc2ljVHJhbnNmb3JtLCBjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgRHJhd0xheWVyLCBDYW52YXNMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBEaXNwbGF5RWxlbWVudCwgWm9vbURpc3BsYXlSYW5nZSB9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IERpbWVuc2lvbiwgcm90YXRlLCBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgY2xhc3MgU3RhdGljSW1hZ2UgZXh0ZW5kcyBEcmF3TGF5ZXIgaW1wbGVtZW50cyBEaXNwbGF5RWxlbWVudCB7XG5cblx0cHJpdmF0ZSBpbWc6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cblx0Y29uc3RydWN0b3IobG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdCAgaW1hZ2VTcmM6IHN0cmluZywgXG5cdCAgb3BhY2l0eTogbnVtYmVyLFxuXHQgIHZpc2libGU6IGJvb2xlYW4sXG5cdCAgem9vbURpc3BsYXlSYW5nZTogWm9vbURpc3BsYXlSYW5nZSA9IFpvb21EaXNwbGF5UmFuZ2UuQWxsWm9vbVJhbmdlKSB7XG5cblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybSwgb3BhY2l0eSwgdmlzaWJsZSwgem9vbURpc3BsYXlSYW5nZSk7XG5cdFx0XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0fVxuXG5cdHByaXZhdGUgZHJhd0ltYWdlKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVHJhbnNmb3JtKXtcblxuXHRcdGlmICh0aGlzLmlzVmlzaWJsZSgpICYmIHRoaXMuZ2V0Wm9vbURpc3BsYXlSYW5nZSgpLndpdGhpblJhbmdlKHZpZXcuem9vbVgpKXtcblx0XHRcdGxldCBjdHhUcmFuc2Zvcm0gPSBjb21iaW5lVHJhbnNmb3JtKHRoaXMsIHBhcmVudFRyYW5zZm9ybSk7XG5cblx0XHRcdC8vY29uc29sZS5sb2coXCJjdHggeCBcIiArIGN0eFRyYW5zZm9ybS54KTtcblxuXHRcdFx0dGhpcy5wcmVwYXJlQ3R4KGN0eCwgY3R4VHJhbnNmb3JtLCB2aWV3KTtcblx0XHRcdFxuXHRcdFx0Y3R4Lmdsb2JhbEFscGhhID0gdGhpcy5vcGFjaXR5O1xuXHRcdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZywgMCwgMCk7XG5cdFx0XHRjdHguZ2xvYmFsQWxwaGEgPSAxO1xuXG5cdFx0XHR0aGlzLmNsZWFuQ3R4KGN0eCwgY3R4VHJhbnNmb3JtLCB2aWV3KTtcblx0XHR9XG5cdFx0XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cdFx0aWYgKHRoaXMudmlzaWJsZSAmJiB0aGlzLmltZy5jb21wbGV0ZSkge1xuXHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCBwYXJlbnRUcmFuc2Zvcm0sIHZpZXcpO1xuXHRcdC8vXHRjb25zb2xlLmxvZyhcImRyZXcgaW1hZ2UgXCIgKyB0aGlzLmltZy5zcmMpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGdldERpbWVuc2lvbigpOiBEaW1lbnNpb24ge1xuXHRcdFxuXHRcdGlmICh0aGlzLmltZy5jb21wbGV0ZSl7XG5cdFx0XHR2YXIgd2lkdGggPSB0aGlzLmltZy53aWR0aCAqIHRoaXMuem9vbVg7XG5cdFx0XHR2YXIgaGVpZ2h0ID0gdGhpcy5pbWcuaGVpZ2h0ICogdGhpcy56b29tWTtcblxuXHRcdFx0bGV0IHAxID0gcm90YXRlKG5ldyBQb2ludDJEKHdpZHRoLCAwKSwgdGhpcy5yb3RhdGlvbik7XG5cdFx0XHRsZXQgcDIgPSByb3RhdGUobmV3IFBvaW50MkQod2lkdGgsIC1oZWlnaHQpLCB0aGlzLnJvdGF0aW9uKTtcblx0XHRcdGxldCBwMyA9IHJvdGF0ZShuZXcgUG9pbnQyRCgwLCAtaGVpZ2h0KSwgdGhpcy5yb3RhdGlvbik7XG5cblx0XHRcdGxldCBtaW5YID0gTWF0aC5taW4oMCwgcDEueCwgcDIueCwgcDMueCk7XG5cdFx0XHRsZXQgbWluWSA9IE1hdGgubWluKDAsIHAxLnksIHAyLnksIHAzLnkpO1xuXHRcdFx0bGV0IG1heFggPSBNYXRoLm1heCgwLCBwMS54LCBwMi54LCBwMy54KTtcblx0XHRcdGxldCBtYXhZID0gTWF0aC5tYXgoMCwgcDEueSwgcDIueSwgcDMueSk7XG5cblx0XHRcdGNvbnNvbGUubG9nKFwibWlueDogXCIgKyBtaW5YKTtcblx0XHRcdGNvbnNvbGUubG9nKFwiaGVpZ2h0OiBcIiArIChtYXhZIC0gbWluWSkpO1xuXHRcdFx0XG5cdFx0XHRyZXR1cm4gbmV3IERpbWVuc2lvbih0aGlzLnggKyBtaW5YLCB0aGlzLnkgLSBtYXhZLCBtYXhYLW1pblgsIG1heFktbWluWSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBEaW1lbnNpb24odGhpcy54LCB0aGlzLnksIDAsIDApO1xuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWN0TGF5ZXIgZXh0ZW5kcyBEcmF3TGF5ZXIgaW1wbGVtZW50cyBEaXNwbGF5RWxlbWVudCB7XG5cblx0Y29uc3RydWN0b3IocHJpdmF0ZSBkaW1lbnNpb246IERpbWVuc2lvbiwgXG5cdFx0b3BhY2l0eTogbnVtYmVyLFxuXHRcdHZpc2libGU6IGJvb2xlYW4sXG5cdFx0em9vbURpc3BsYXlSYW5nZTogWm9vbURpc3BsYXlSYW5nZSA9IFpvb21EaXNwbGF5UmFuZ2UuQWxsWm9vbVJhbmdlKSB7XG5cblx0XHRzdXBlcihuZXcgQmFzaWNUcmFuc2Zvcm0oZGltZW5zaW9uLngsIGRpbWVuc2lvbi55LCAxLCAxLCAwKSwgXG5cdFx0XHRvcGFjaXR5LCB2aXNpYmxlLCB6b29tRGlzcGxheVJhbmdlKTtcblx0fVxuXG5cdHVwZGF0ZURpbWVuc2lvbihkaW1lbnNpb246IERpbWVuc2lvbil7XG5cdFx0dGhpcy5kaW1lbnNpb24gPSBkaW1lbnNpb247XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0XHRsZXQgeCA9ICh0aGlzLmRpbWVuc2lvbi54ICsgcGFyZW50VHJhbnNmb3JtLnggLSB2aWV3LngpICogdmlldy56b29tWDtcblx0XHRsZXQgeSA9ICh0aGlzLmRpbWVuc2lvbi55ICsgcGFyZW50VHJhbnNmb3JtLnkgLSB2aWV3LnkpICogdmlldy56b29tWTtcblxuXHRcdC8vY29uc29sZS5sb2coXCJkaW1lbnNpb24gXCIgKyB0aGlzLmRpbWVuc2lvbi54KTtcblxuXHRcdC8vY29uc29sZS5sb2coXCJvdXRsaW5lOiBcIiArIHggKyBcIiB2aWV3OiBcIiArIHZpZXcueCArIFxuXHRcdC8vXHRcIiBwYXJlbnQgXCIgKyBwYXJlbnRUcmFuc2Zvcm0ueCArIFwiIHcgXCIgKyB0aGlzLmRpbWVuc2lvbi53KTtcblx0XHRjdHguc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuXHRcdGN0eC5zdHJva2VSZWN0KHgsIHksIHRoaXMuZGltZW5zaW9uLncgKiB2aWV3Lnpvb21YLCB0aGlzLmRpbWVuc2lvbi5oICogdmlldy56b29tWSk7XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGdldERpbWVuc2lvbigpOiBEaW1lbnNpb24ge1xuXHRcdHJldHVybiB0aGlzLmRpbWVuc2lvbjtcblx0fVxuXG59XG4iLCJpbXBvcnQgeyBEcmF3TGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgVHJhbnNmb3JtLCBCYXNpY1RyYW5zZm9ybSwgVmlld1RyYW5zZm9ybSwgY29tYmluZVRyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IERpbWVuc2lvbiB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcbmltcG9ydCB7IFpvb21EaXNwbGF5UmFuZ2UgfSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5cbmV4cG9ydCBjbGFzcyBUaWxlU3RydWN0IHtcblx0XG5cdGNvbnN0cnVjdG9yKFxuXHRcdHB1YmxpYyBwcmVmaXg6IHN0cmluZyxcblx0XHRwdWJsaWMgc3VmZml4OiBzdHJpbmcsXG5cdFx0cHVibGljIHRpbGVEaXJlY3Rvcnk6IHN0cmluZyl7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gem9vbUJ5TGV2ZWwoem9vbUxldmVsOiBudW1iZXIpe1xuXHRyZXR1cm4gTWF0aC5wb3coMiwgem9vbUxldmVsKTtcbn1cblxuZXhwb3J0IGNsYXNzIFRpbGVMYXllciBleHRlbmRzIERyYXdMYXllciB7XG5cblx0dGlsZU1hbmFnZXI6IFRpbGVNYW5hZ2VyO1xuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdGxvY2FsVHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHRcdHJlYWRvbmx5IHRpbGVTdHJ1Y3Q6IFRpbGVTdHJ1Y3QsXG5cdFx0dmlzYmlsZTogYm9vbGVhbixcblx0XHR6b29tRGlzcGxheVJhbmdlOiBab29tRGlzcGxheVJhbmdlID0gWm9vbURpc3BsYXlSYW5nZS5BbGxab29tUmFuZ2UsIFxuXHRcdHB1YmxpYyB4T2Zmc2V0OiBudW1iZXIgPSAwLFxuXHRcdHB1YmxpYyB5T2Zmc2V0OiBudW1iZXIgPSAwLFxuXHRcdHB1YmxpYyB6b29tOiBudW1iZXIgPSAxLFxuXHRcdHJlYWRvbmx5IGdyaWRXaWR0aDogbnVtYmVyID0gMjU2LCBcblx0XHRyZWFkb25seSBncmlkSGVpZ2h0OiBudW1iZXIgPSAyNTYsXG5cdFx0b3BhY2l0eTogbnVtYmVyID0gMSl7XG5cblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybSwgb3BhY2l0eSwgdmlzYmlsZSwgem9vbURpc3BsYXlSYW5nZSk7XG5cblx0XHR0aGlzLnRpbGVNYW5hZ2VyID0gbmV3IFRpbGVNYW5hZ2VyKCk7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0aWYgKHRoaXMuZ2V0Wm9vbURpc3BsYXlSYW5nZSgpLndpdGhpblJhbmdlKHZpZXcuem9vbVgpKXtcblxuXHRcdFx0bGV0IGN0eFRyYW5zZm9ybSA9IGNvbWJpbmVUcmFuc2Zvcm0odGhpcywgcGFyZW50VHJhbnNmb3JtKTtcblxuXHRcdFx0bGV0IHpvb21XaWR0aDogbnVtYmVyID0gdGhpcy5ncmlkV2lkdGggKiBjdHhUcmFuc2Zvcm0uem9vbVhcblx0XHRcdGxldCB6b29tSGVpZ2h0OiBudW1iZXIgPSB0aGlzLmdyaWRIZWlnaHQgKiBjdHhUcmFuc2Zvcm0uem9vbVk7XG5cblx0XHRcdGxldCB0cmFuc2Zvcm1YID0gdmlldy54ICsgY3R4VHJhbnNmb3JtLng7XG5cdFx0XHRsZXQgdHJhbnNmb3JtWSA9IHZpZXcueSArIGN0eFRyYW5zZm9ybS55O1xuXG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiY3R4IHpvb21XaWR0aDogXCIgKyB6b29tV2lkdGgpO1xuXG5cdFx0XHRsZXQgdmlld1ggPSB2aWV3LnggKiB2aWV3Lnpvb21YO1xuXHRcdFx0bGV0IHZpZXdZID0gdmlldy55ICogdmlldy56b29tWTtcblxuXHRcdFx0bGV0IHZpZXdXaWR0aCA9IHZpZXcud2lkdGggLyB2aWV3Lnpvb21YO1xuXHRcdFx0bGV0IHZpZXdIZWlnaHQgPSB2aWV3LmhlaWdodCAvIHZpZXcuem9vbVk7XG5cblx0XHRcdGxldCBncmlkQWNyb3NzID0gdmlld1dpZHRoIC8gem9vbVdpZHRoOyAvL2dvb2Rcblx0XHRcdGxldCBncmlkSGlnaCA9IHZpZXdIZWlnaHQgLyB6b29tSGVpZ2h0OyAvL2dvb2RcblxuXHRcdFx0bGV0IHhNaW4gPSBNYXRoLmZsb29yKHRyYW5zZm9ybVggLyB6b29tV2lkdGgpO1xuXHRcdFx0bGV0IHhNYXggPSBNYXRoLmNlaWwoKHRyYW5zZm9ybVggKyB2aWV3V2lkdGgpIC8gem9vbVdpZHRoKTtcblxuXHRcdFx0bGV0IHlNaW4gPSBNYXRoLmZsb29yKHRyYW5zZm9ybVkgLyB6b29tSGVpZ2h0KTtcblx0XHRcdGxldCB5TWF4ID0gTWF0aC5jZWlsKCh0cmFuc2Zvcm1ZICsgdmlld0hlaWdodCkgLyB6b29tSGVpZ2h0KTtcblxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcInggeSBzIFwiICsgeE1pbiArIFwiLCBcIiArIHhNYXggKyBcIjogXCIgKyB5TWluICsgXCIsIFwiICsgeU1heCk7XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiYWNyb3NzIGhpZ2hcIiArIGdyaWRBY3Jvc3MgKyBcIiwgXCIgKyBncmlkSGlnaCk7XG5cblx0XHRcdHZhciBkcmF3aW5nQ29tcGxldGUgPSB0cnVlO1xuXG5cdFx0XHRsZXQgZnVsbFpvb21YID0gY3R4VHJhbnNmb3JtLnpvb21YICogdmlldy56b29tWDtcblx0XHRcdGxldCBmdWxsWm9vbVkgPSBjdHhUcmFuc2Zvcm0uem9vbVkgKiB2aWV3Lnpvb21ZO1xuXG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiZnVsbHpvb21zIFwiICsgZnVsbFpvb21YICsgXCIgXCIgKyBmdWxsWm9vbVkpO1xuXG5cdFx0XHRjdHguc2NhbGUoZnVsbFpvb21YLCBmdWxsWm9vbVkpO1xuXG5cdFx0XHRmb3IgKHZhciB4ID0geE1pbjsgeDx4TWF4OyB4Kyspe1xuXHRcdFx0XHRsZXQgeE1vdmUgPSB4ICogdGhpcy5ncmlkV2lkdGggLSB0cmFuc2Zvcm1YIC8gY3R4VHJhbnNmb3JtLnpvb21YO1xuXHRcdFx0XHRmb3IgKHZhciB5ID0geU1pbjsgeTx5TWF4OyB5Kyspe1xuXHRcdFx0XHRcdGxldCB5TW92ZSA9IHkgKiB0aGlzLmdyaWRIZWlnaHQgLSB0cmFuc2Zvcm1ZIC8gY3R4VHJhbnNmb3JtLnpvb21ZO1xuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coXCJ0aWxlIHggeSBcIiArIHggKyBcIiBcIiArIHkgKyBcIjogXCIgKyB4TW92ZSArIFwiLCBcIiArIHlNb3ZlKTtcblxuXHRcdFx0XHRcdGN0eC50cmFuc2xhdGUoeE1vdmUsIHlNb3ZlKTtcblx0XHRcdFx0XHRsZXQgdGlsZVNyYyA9IHRoaXMudGlsZVN0cnVjdC50aWxlRGlyZWN0b3J5ICsgdGhpcy56b29tICsgXCIvXCIgKyBcblx0XHRcdFx0XHRcdCh4ICsgdGhpcy54T2Zmc2V0KSArIFwiL1wiICsgXG5cdFx0XHRcdFx0XHQoeSArIHRoaXMueU9mZnNldCkgKyB0aGlzLnRpbGVTdHJ1Y3Quc3VmZml4O1xuXG5cdFx0XHRcdFx0aWYgKHRoaXMudGlsZU1hbmFnZXIuaGFzKHRpbGVTcmMpKSB7XG5cdFx0XHRcdFx0XHRsZXQgaW1hZ2VUaWxlID0gdGhpcy50aWxlTWFuYWdlci5nZXQodGlsZVNyYyk7XG5cdFx0XHRcdFx0XHRkcmF3aW5nQ29tcGxldGUgPSBkcmF3aW5nQ29tcGxldGUgJiYgaW1hZ2VUaWxlLmRyYXcoY3R4KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRsZXQgaW1hZ2VUaWxlID0gbmV3IEltYWdlVGlsZSh4LCB5LCB0aWxlU3JjKTtcblxuXHRcdFx0XHRcdFx0ZHJhd2luZ0NvbXBsZXRlID0gZHJhd2luZ0NvbXBsZXRlICYmIGltYWdlVGlsZS5kcmF3KGN0eCk7XG5cblx0XHRcdFx0XHRcdHRoaXMudGlsZU1hbmFnZXIuc2V0KHRpbGVTcmMsIGltYWdlVGlsZSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y3R4LnRyYW5zbGF0ZSgteE1vdmUsIC15TW92ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Y3R4LnNjYWxlKDEgLyBmdWxsWm9vbVgsIDEgLyBmdWxsWm9vbVkpO1xuXG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiZHJldyB0aWxlcyBcIiArIGRyYXdpbmdDb21wbGV0ZSk7XG5cdFx0XHRyZXR1cm4gZHJhd2luZ0NvbXBsZXRlO1xuXHRcdH0gZWxzZSB7IFxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9XG5cblx0Z2V0RGltZW5zaW9uKCk6IERpbWVuc2lvbiB7XG5cdFx0cmV0dXJuIG5ldyBEaW1lbnNpb24oMCwgMCwgMCwgMCk7XG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIFRpbGVNYW5hZ2VyIHtcblxuXHR0aWxlTWFwOiBNYXA8c3RyaW5nLCBJbWFnZVRpbGU+O1xuXG5cdGNvbnN0cnVjdG9yKCl7XG5cdFx0dGhpcy50aWxlTWFwID0gbmV3IE1hcDxzdHJpbmcsIEltYWdlVGlsZT4oKTtcblx0fVxuXG5cdGdldCh0aWxlS2V5OiBzdHJpbmcpOiBJbWFnZVRpbGUge1xuXHRcdHJldHVybiB0aGlzLnRpbGVNYXAuZ2V0KHRpbGVLZXkpO1xuXHR9XG5cblx0aGFzKHRpbGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnRpbGVNYXAuaGFzKHRpbGVLZXkpO1xuXHR9XG5cblx0c2V0KHRpbGVLZXk6IHN0cmluZywgdGlsZTogSW1hZ2VUaWxlKXtcblx0XHR0aGlzLnRpbGVNYXAuc2V0KHRpbGVLZXksIHRpbGUpO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlVGlsZSB7XG5cblx0cHJpdmF0ZSBpbWc6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cdHByaXZhdGUgZXhpc3RzOiBib29sZWFuO1xuXG5cdGNvbnN0cnVjdG9yKHJlYWRvbmx5IHhJbmRleDogbnVtYmVyLCByZWFkb25seSB5SW5kZXg6IG51bWJlciwgaW1hZ2VTcmM6IHN0cmluZykge1xuXHRcdHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG5cdFx0dGhpcy5pbWcuc3JjID0gaW1hZ2VTcmM7XG5cdFx0dGhpcy5pbWcub25lcnJvciA9IGZ1bmN0aW9uKGV2ZW50T3JNZXNzYWdlOiBhbnkpe1xuXHRcdFx0ZXZlbnRPck1lc3NhZ2UudGFyZ2V0LnNyYyA9IFwiXCI7XG5cdFx0fTtcblx0fTtcblxuXHRwcml2YXRlIGRyYXdJbWFnZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCl7XG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZywgMCwgMCk7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKTogYm9vbGVhbiB7XG5cdFx0aWYgKHRoaXMuaW1nLnNyYyAhPSBcIlwiICYmIHRoaXMuaW1nLmNvbXBsZXRlICkge1xuXHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4KTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH07XG5cbn1cbiIsIi8qKlxuKiBBIHdvcmxkIGlzIDAsMCBiYXNlZCBidXQgYW55IGVsZW1lbnQgY2FuIGJlIHBvc2l0aW9uZWQgcmVsYXRpdmUgdG8gdGhpcy5cbiovXG5leHBvcnQgaW50ZXJmYWNlIFRyYW5zZm9ybSB7XG5cdHg6IG51bWJlcjtcblx0eTogbnVtYmVyO1xuXHR6b29tWDogbnVtYmVyO1xuXHR6b29tWTogbnVtYmVyO1xuXHRyb3RhdGlvbjogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgQmFzaWNUcmFuc2Zvcm0gaW1wbGVtZW50cyBUcmFuc2Zvcm0ge1xuXG4gICAgc3RhdGljIHJlYWRvbmx5IHVuaXRUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgMSwgMSwgMCk7XG5cblx0Y29uc3RydWN0b3IocHVibGljIHg6IG51bWJlciwgcHVibGljIHk6IG51bWJlciwgXG5cdFx0cHVibGljIHpvb21YOiBudW1iZXIsIHB1YmxpYyB6b29tWTogbnVtYmVyLCBcblx0XHRwdWJsaWMgcm90YXRpb246IG51bWJlcil7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tYmluZVRyYW5zZm9ybShjaGlsZDogVHJhbnNmb3JtLCBjb250YWluZXI6IFRyYW5zZm9ybSk6IFRyYW5zZm9ybSB7XG5cdGxldCB6b29tWCA9IGNoaWxkLnpvb21YICogY29udGFpbmVyLnpvb21YO1xuXHQvL2NvbnNvbGUubG9nKFwibW9kaWZpZWQgXCIgKyBjaGlsZC56b29tWCArIFwiIHRvIFwiICsgem9vbVgpO1xuXHRsZXQgem9vbVkgPSBjaGlsZC56b29tWSAqIGNvbnRhaW5lci56b29tWTtcblx0Ly9jb25zb2xlLmxvZyhcIm1vZGlmaWVkIFwiICsgY2hpbGQuem9vbVkgKyBcIiBieSBcIiArIGNvbnRhaW5lci56b29tWSArIFwiIHRvIFwiICsgem9vbVkpO1xuXHRsZXQgeCA9IChjaGlsZC54ICogY29udGFpbmVyLnpvb21YKSArIGNvbnRhaW5lci54O1xuXHRsZXQgeSA9IChjaGlsZC55ICogY29udGFpbmVyLnpvb21ZKSArIGNvbnRhaW5lci55O1xuXHQvL2NvbnNvbGUubG9nKFwibW9kaWZpZWQgeCBcIiArIGNoaWxkLnggKyBcIiBieSBcIiArIGNvbnRhaW5lci56b29tWCArIFwiIGFuZCBcIiArIGNvbnRhaW5lci54ICsgXCIgdG8gXCIgKyB4KTtcblx0bGV0IHJvdGF0aW9uID0gY2hpbGQucm90YXRpb24gKyBjb250YWluZXIucm90YXRpb247XG5cdHJldHVybiBuZXcgQmFzaWNUcmFuc2Zvcm0oeCwgeSwgem9vbVgsIHpvb21ZLCByb3RhdGlvbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZSh0cmFuc2Zvcm06IFRyYW5zZm9ybSk6IFRyYW5zZm9ybSB7XG5cdHJldHVybiBuZXcgQmFzaWNUcmFuc2Zvcm0odHJhbnNmb3JtLngsIHRyYW5zZm9ybS55LCBcblx0XHR0cmFuc2Zvcm0uem9vbVgsIHRyYW5zZm9ybS56b29tWSwgdHJhbnNmb3JtLnJvdGF0aW9uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludmVydFRyYW5zZm9ybSh3b3JsZFN0YXRlOiBUcmFuc2Zvcm0pOiBUcmFuc2Zvcm0ge1xuXHRyZXR1cm4gbmV3IEJhc2ljVHJhbnNmb3JtKC13b3JsZFN0YXRlLngsIC13b3JsZFN0YXRlLnksIFxuXHRcdDEvd29ybGRTdGF0ZS56b29tWCwgMS93b3JsZFN0YXRlLnpvb21ZLCAtd29ybGRTdGF0ZS5yb3RhdGlvbik7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmlld1RyYW5zZm9ybSBleHRlbmRzIFRyYW5zZm9ybSB7XG5cdHdpZHRoOiBudW1iZXI7XG5cdGhlaWdodDogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgQmFzaWNWaWV3VHJhbnNmb3JtIGV4dGVuZHMgQmFzaWNUcmFuc2Zvcm0gaW1wbGVtZW50cyBWaWV3VHJhbnNmb3JtIHtcblxuXHRjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgXG5cdFx0cmVhZG9ubHkgd2lkdGg6IG51bWJlciwgcmVhZG9ubHkgaGVpZ2h0OiBudW1iZXIsXG5cdFx0em9vbVg6IG51bWJlciwgem9vbVk6IG51bWJlciwgXG5cdCAgICByb3RhdGlvbjogbnVtYmVyKXtcblxuXHRcdHN1cGVyKHgsIHksIHpvb21YLCB6b29tWSwgcm90YXRpb24pO1xuXHR9XG5cbn1cblxuXG5cbiIsImltcG9ydCB7IFZpZXdUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBDYW52YXNWaWV3IH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuXG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNb3VzZUNvbnRyb2xsZXIge1xuXG4gICAgbW91c2VQb3NpdGlvbihldmVudDogTW91c2VFdmVudCwgd2l0aGluOiBIVE1MRWxlbWVudCk6IEFycmF5PG51bWJlcj4ge1xuICAgICAgICBsZXQgbV9wb3N4ID0gZXZlbnQuY2xpZW50WCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0O1xuICAgICAgICBsZXQgbV9wb3N5ID0gZXZlbnQuY2xpZW50WSArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wXG4gICAgICAgICAgICAgICAgICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcblxuICAgICAgICB2YXIgZV9wb3N4ID0gMDtcbiAgICAgICAgdmFyIGVfcG9zeSA9IDA7XG5cbiAgICAgICAgaWYgKHdpdGhpbi5vZmZzZXRQYXJlbnQpe1xuICAgICAgICAgICAgZG8geyBcbiAgICAgICAgICAgICAgICBlX3Bvc3ggKz0gd2l0aGluLm9mZnNldExlZnQ7XG4gICAgICAgICAgICAgICAgZV9wb3N5ICs9IHdpdGhpbi5vZmZzZXRUb3A7XG4gICAgICAgICAgICB9IHdoaWxlICh3aXRoaW4gPSA8SFRNTEVsZW1lbnQ+d2l0aGluLm9mZnNldFBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW21fcG9zeCAtIGVfcG9zeCwgbV9wb3N5IC0gZV9wb3N5XTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIFZpZXdDb250cm9sbGVyIGV4dGVuZHMgTW91c2VDb250cm9sbGVyIHtcblxuXHRyZWNvcmQ6IGJvb2xlYW47XG5cdG1vdmU6IG51bWJlciA9IDE7XG5cblx0cHJpdmF0ZSB4UHJldmlvdXM6IG51bWJlcjtcblx0cHJpdmF0ZSB5UHJldmlvdXM6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3Rvcih2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtLCBcbiAgICAgICAgcmVhZG9ubHkgZHJhZ0VsZW1lbnQ6IEhUTUxFbGVtZW50LCByZWFkb25seSBjYW52YXNWaWV3OiBDYW52YXNWaWV3KSB7XG5cbiAgICBcdHN1cGVyKCk7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybSkpO1xuICAgIFx0ZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm0pKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybSkpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLnJlY29yZCA9IGZhbHNlKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5jbGlja2VkKGUgYXMgTW91c2VFdmVudCwgY2FudmFzVmlldywgMS4yKSk7XG4gICAgICAgIGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCAoZTogRXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy53aGVlbChlIGFzIFdoZWVsRXZlbnQsIGNhbnZhc1ZpZXcpKTtcbiAgICB9XG5cbiAgICBjbGlja2VkKGV2ZW50OiBNb3VzZUV2ZW50LCB2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtLCB6b29tQnk6IG51bWJlcil7XG4gICAgXHRzd2l0Y2goZXZlbnQudHlwZSl7XG4gICAgXHRcdGNhc2UgXCJkYmxjbGlja1wiOlxuICAgICAgICAgICAgICAgIGlmICAoZXZlbnQuY3RybEtleSkge1xuICAgICAgICAgICAgICAgICAgICB6b29tQnkgPSAxIC8gem9vbUJ5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsZXQgbVhZID0gdGhpcy5tb3VzZVBvc2l0aW9uKGV2ZW50LCB0aGlzLmRyYWdFbGVtZW50KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy56b29tQWJvdXQobVhZWzBdLCBtWFlbMV0sIHpvb21CeSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYWdnZWQoZXZlbnQ6IE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm06IFZpZXdUcmFuc2Zvcm0pIHtcblxuICAgIFx0c3dpdGNoKGV2ZW50LnR5cGUpe1xuICAgIFx0XHRjYXNlIFwibW91c2Vkb3duXCI6XG4gICAgXHRcdFx0dGhpcy5yZWNvcmQgPSB0cnVlO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwibW91c2V1cFwiOlxuICAgIFx0XHRcdHRoaXMucmVjb3JkID0gZmFsc2U7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGRlZmF1bHQ6XG4gICAgXHRcdFx0aWYgKHRoaXMucmVjb3JkKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHhEZWx0YSA9IChldmVudC5jbGllbnRYIC0gdGhpcy54UHJldmlvdXMpIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHlEZWx0YSA9IChldmVudC5jbGllbnRZIC0gdGhpcy55UHJldmlvdXMpIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWTtcblxuICAgICAgICAgICAgICAgICAgICB2aWV3VHJhbnNmb3JtLnggPSB2aWV3VHJhbnNmb3JtLnggLSB4RGVsdGE7XG4gICAgICAgICAgICAgICAgICAgIHZpZXdUcmFuc2Zvcm0ueSA9IHZpZXdUcmFuc2Zvcm0ueSAtIHlEZWx0YTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgIFx0XHRcdH1cblxuXHRcdFx0dGhpcy54UHJldmlvdXMgPSBldmVudC5jbGllbnRYO1xuXHRcdFx0dGhpcy55UHJldmlvdXMgPSBldmVudC5jbGllbnRZO1xuICAgIFx0fVxuICAgIH1cblxuICAgIHdoZWVsKGV2ZW50OiBXaGVlbEV2ZW50LCB2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtKSB7XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIndoZWVsXCIgKyBldmVudC50YXJnZXQgKyBcIiwgXCIgKyBldmVudC50eXBlKTtcblxuICAgICAgICBsZXQgeERlbHRhID0gZXZlbnQuZGVsdGFYIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWDtcbiAgICAgICAgbGV0IHlEZWx0YSA9IGV2ZW50LmRlbHRhWSAvIHRoaXMubW92ZSAvIHZpZXdUcmFuc2Zvcm0uem9vbVk7XG5cbiAgICAgICAgaWYgIChldmVudC5jdHJsS2V5KSB7XG4gICAgICAgICAgICBsZXQgbVhZID0gdGhpcy5tb3VzZVBvc2l0aW9uKGV2ZW50LCB0aGlzLmRyYWdFbGVtZW50KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBieSA9IDEuMDU7XG4gICAgICAgICAgICBpZiAoeURlbHRhIDwgMCl7XG4gICAgICAgICAgICAgICAgYnkgPSAwLjk1O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuem9vbUFib3V0KG1YWVswXSwgbVhZWzFdLCBieSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcueCA9ICB0aGlzLmNhbnZhc1ZpZXcueCArIHhEZWx0YTtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy55ID0gIHRoaXMuY2FudmFzVmlldy55ICsgeURlbHRhO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgIH1cblxufVxuIiwibW9kdWxlLmV4cG9ydHM9W1xuXHR7XG5cdFwibmFtZVwiOiBcIjItMlwiLCBcInhcIjogLTM2NCwgXCJ5XCI6IC0xMi41LCBcInpvb21YXCI6IDAuMjEzLCBcInpvb21ZXCI6IDAuMjA1LCBcInJvdGF0aW9uXCI6IC0wLjMxLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDJyXzJbU1ZDMl0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiM1wiLCBcInhcIjogLTIxNiwgXCJ5XCI6IC0wLjcwNSwgXCJ6b29tWFwiOiAwLjIsIFwiem9vbVlcIjogMC4yMSwgXCJyb3RhdGlvblwiOiAtMC41MSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDAzcltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI0XCIsIFwieFwiOiAtNzQuMjksIFwieVwiOiAtOTkuNzgsIFwiem9vbVhcIjogMC4yMjIsIFwiem9vbVlcIjogMC4yMDgsIFwicm90YXRpb25cIjogLTAuMjg1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDRyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjVcIiwgXCJ4XCI6IC0zNjYuNSwgXCJ5XCI6IDE4MC4wMTksIFwiem9vbVhcIjogMC4yMTUsIFwiem9vbVlcIjogMC4yMDcsIFwicm90YXRpb25cIjogLTAuMjEsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwNXJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiNlwiLCBcInhcIjogLTIwNi4xNiwgXCJ5XCI6IDE0NiwgXCJ6b29tWFwiOiAwLjIxLCBcInpvb21ZXCI6IDAuMjA4LCBcInJvdGF0aW9uXCI6IC0wLjIxNSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA2cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI3XCIsIFwieFwiOiAtNjMuMywgXCJ5XCI6IDEwMC4zNzc2LCBcInpvb21YXCI6IDAuMjEyNSwgXCJ6b29tWVwiOiAwLjIxMywgXCJyb3RhdGlvblwiOiAtMC4yMywgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA3cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI4XCIsIFwieFwiOiA3OC4xLCBcInlcIjogNTguNTM1LCBcInpvb21YXCI6IDAuMjA3LCBcInpvb21ZXCI6IDAuMjE3LCBcInJvdGF0aW9uXCI6IC0wLjI1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDhyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjlcIiwgXCJ4XCI6IDIxOS41LCBcInlcIjogMjQsIFwiem9vbVhcIjogMC4yMTUsIFwiem9vbVlcIjogMC4yMTQ1LCBcInJvdGF0aW9uXCI6IC0wLjI2LFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwOXJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTBcIiwgXCJ4XCI6IDQ1NC4yMSwgXCJ5XCI6IC0xLjUsIFwiem9vbVhcIjogMC4yMTgsIFwiem9vbVlcIjogMC4yMTQsIFwicm90YXRpb25cIjogMC4wMTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxMHJfMltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxMVwiLCBcInhcIjogNjIxLjg2LCBcInlcIjogMjUuNTI1LCBcInpvb21YXCI6IDAuMjEzLCBcInpvb21ZXCI6IDAuMjExNSwgXCJyb3RhdGlvblwiOiAwLjExLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTFyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LCBcblx0e1xuXHRcIm5hbWVcIjogXCIxMi0xXCIsIFwieFwiOiA3NjkuNjQ1LCBcInlcIjogNTAuMjY1LCBcInpvb21YXCI6IDAuNDI0LCBcInpvb21ZXCI6IDAuNDIyLCBcInJvdGF0aW9uXCI6IDAuMTIsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxMnJfMVtTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxNFwiLCBcInhcIjogLTkxNS42LCBcInlcIjogNTU3Ljg2NSwgXCJ6b29tWFwiOiAwLjIwOCwgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAtMS4yMTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxNFJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTUtMlwiLCBcInhcIjogLTcxNy4zLCBcInlcIjogNTcyLCBcInpvb21YXCI6IDAuMjEsIFwiem9vbVlcIjogMC4yMDYsIFwicm90YXRpb25cIjogLTEuNDcsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxNXJfMltTVkMyXS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxNi0yXCIsIFwieFwiOiAtOTIsIFwieVwiOiAzMzYuNSwgXCJ6b29tWFwiOiAwLjIxNywgXCJ6b29tWVwiOiAwLjIxLCBcInJvdGF0aW9uXCI6IC0wLjEsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxNnJfMltTVkMyXS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxN1wiLCBcInhcIjogNzcsIFwieVwiOiAyNzguNSwgXCJ6b29tWFwiOiAwLjIwNiwgXCJ6b29tWVwiOiAwLjIwNiwgXCJyb3RhdGlvblwiOiAtMC4wNTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxN1JbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMThcIiwgXCJ4XCI6IDIyOSwgXCJ5XCI6IDIzOS41LCBcInpvb21YXCI6IDAuMjA4LCBcInpvb21ZXCI6IDAuMjA4LCBcInJvdGF0aW9uXCI6IDAuMDcsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxOFJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTlcIiwgXCJ4XCI6IDcxLjUsIFwieVwiOiA0NzQsIFwiem9vbVhcIjogMC4yMDMsIFwiem9vbVlcIjogMC4yMDgsIFwicm90YXRpb25cIjogMC4xNywgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDE5UltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIyMFwiLCBcInhcIjogNDMuNSwgXCJ5XCI6IDY0MCwgXCJ6b29tWFwiOiAwLjEsIFwiem9vbVlcIjogMC4xMDQsIFwicm90YXRpb25cIjogMC4yMDUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAyMFJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH1cblxuXVxuXG5cblxuIiwibW9kdWxlLmV4cG9ydHM9W1xuXHR7XG5cdFx0XCJuYW1lXCI6IFwiaGVucmlldHRhXCIsIFwieFwiOiAtNDg2LjUsIFwieVwiOiAtMjUyLjUsIFwiem9vbVhcIjogMC4yOSwgXCJ6b29tWVwiOiAwLjUsIFwicm90YXRpb25cIjogMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2hlbnJpZXR0YS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtYXRlclwiLCBcInhcIjogLTM0MiwgXCJ5XCI6IC03NDcsIFwiem9vbVhcIjogMC4wOCwgXCJ6b29tWVwiOiAwLjE4LCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbWF0ZXJtaXMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwicGV0ZXJzXCIsIFwieFwiOiAtNzE5LCBcInlcIjogLTgzNiwgXCJ6b29tWFwiOiAwLjA3LCBcInpvb21ZXCI6IDAuMTQsIFwicm90YXRpb25cIjogLTAuMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9wZXRlcnMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwib2Nvbm5lbGxcIiwgXCJ4XCI6IC04MjEsIFwieVwiOiAtMTgzNSwgXCJ6b29tWFwiOiAwLjI1LCBcInpvb21ZXCI6IDAuMjUsIFwicm90YXRpb25cIjogMCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL29jb25uZWxsLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiZm91cmNvdXJ0c1wiLCBcInhcIjogLTU2Ny41LCBcInlcIjogMzIzLjUsIFwiem9vbVhcIjogMC4xNiwgXCJ6b29tWVwiOiAwLjMyOCwgXCJyb3RhdGlvblwiOiAtMC4xMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2ZvdXJjb3VydHMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtaWNoYW5zXCIsIFwieFwiOiAtNjM5LCBcInlcIjogMTYwLCBcInpvb21YXCI6IDAuMTQsIFwiem9vbVlcIjogMC4yNCwgXCJyb3RhdGlvblwiOiAwLjAyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbWljaGFucy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjhcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInRoZWNhc3RsZVwiLCBcInhcIjogLTI5MCwgXCJ5XCI6IDUyMCwgXCJ6b29tWFwiOiAwLjIyLCBcInpvb21ZXCI6IDAuNDIsIFwicm90YXRpb25cIjogLTAuMDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvdGhlY2FzdGxlLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm1hcmtldFwiLCBcInhcIjogLTYxNywgXCJ5XCI6IDU2NSwgXCJ6b29tWFwiOiAwLjE1LCBcInpvb21ZXCI6IDAuMjYsIFwicm90YXRpb25cIjogMC4wNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21hcmtldC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjVcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInBhdHJpY2tzXCIsIFwieFwiOiAtNDYyLCBcInlcIjogNzk1LCBcInpvb21YXCI6IDAuMSwgXCJ6b29tWVwiOiAwLjEyLCBcInJvdGF0aW9uXCI6IDAuMDQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9wYXRyaWNrcy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjhcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm5naXJlbGFuZFwiLCBcInhcIjogNDMxLCBcInlcIjogNjk0LCBcInpvb21YXCI6IDAuMTQsIFwiem9vbVlcIjogMC4zNzUsIFwicm90YXRpb25cIjogLTAuMTM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbmdpcmVsYW5kLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiYmx1ZWNvYXRzXCIsIFwieFwiOiAtOTk3LCBcInlcIjogODYsIFwiem9vbVhcIjogMC4xLCBcInpvb21ZXCI6IDAuMiwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2JsdWVjb2F0cy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjZcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImNvbGxpbnNiYXJyYWNrc1wiLCBcInhcIjogLTExMzAsIFwieVwiOiA5MCwgXCJ6b29tWFwiOiAwLjEzLCBcInpvb21ZXCI6IDAuMzcsIFwicm90YXRpb25cIjogMC4wMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9jb2xsaW5zYmFycmFja3MucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJodWdobGFuZVwiLCBcInhcIjogLTE3MiwgXCJ5XCI6IC0zMzUsIFwiem9vbVhcIjogMC4yLCBcInpvb21ZXCI6IDAuMzMsIFwicm90YXRpb25cIjogLTAuMDYsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9odWdobGFuZS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImdwb1wiLCBcInhcIjogNTIsIFwieVwiOiA1MCwgXCJ6b29tWFwiOiAwLjA4NiwgXCJ6b29tWVwiOiAwLjI1LCBcInJvdGF0aW9uXCI6IC0wLjAzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2dwby5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm1vdW50am95XCIsIFwieFwiOiAyNjMsIFwieVwiOiAtNTYwLCBcInpvb21YXCI6IDAuMTUsIFwiem9vbVlcIjogMC4yODUsIFwicm90YXRpb25cIjogMC4xNywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21vdW50am95LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibW91bnRqb3liXCIsIFwieFwiOiAxNTIsIFwieVwiOiAtNTcwLCBcInpvb21YXCI6IDAuMiwgXCJ6b29tWVwiOiAwLjMwNSwgXCJyb3RhdGlvblwiOiAwLjA0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbW91bnRqb3liLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwicm95YWxob3NwaXRhbFwiLCBcInhcIjogLTE4NTEsIFwieVwiOiA0ODcuNSwgXCJ6b29tWFwiOiAwLjIxLCBcInpvb21ZXCI6IDAuMywgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL3JveWFsaG9zcGl0YWwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC45XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJwZXBwZXJcIiwgXCJ4XCI6IDgzNCwgXCJ5XCI6IDk5MCwgXCJ6b29tWFwiOiAwLjA2LCBcInpvb21ZXCI6IDAuMTQ1LCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvcGVwcGVyLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibGliZXJ0eWhhbGxcIiwgXCJ4XCI6IDI3MCwgXCJ5XCI6IC0xNCwgXCJ6b29tWFwiOiAwLjQzLCBcInpvb21ZXCI6IDAuNDMsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9saWJlcnR5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiY3VzdG9tc2hvdXNlXCIsIFwieFwiOiAzODIsIFwieVwiOiAxMDcsIFwiem9vbVhcIjogMC4xNSwgXCJ6b29tWVwiOiAwLjMwLCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvY3VzdG9tc2hvdXNlLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9XG5dIiwibW9kdWxlLmV4cG9ydHM9W1xuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAzMlwiLCBcInhcIjogLTc3NiwgXCJ5XCI6IDMyLjU1LCBcInpvb21YXCI6IDAuMjksIFwiem9vbVlcIjogMC4yOCwgXCJyb3RhdGlvblwiOiAtMS40NywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTAzMi1tLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNywgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNvbnN0aXR1dGlvbiBIaWxsIC0gVHVybnBpa2UsIEdsYXNuZXZpbiBSb2FkOyBzaG93aW5nIHByb3Bvc2VkIHJvYWQgdG8gQm90YW5pYyBHYXJkZW5zXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNzJcIiwgXCJ4XCI6IC0yNTIsIFwieVwiOiAtMjQ3LCBcInpvb21YXCI6IDAuMzE4LCBcInpvb21ZXCI6IDAuMzE0LCBcInJvdGF0aW9uXCI6IDEuNTg1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMDcyLW0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIGltcHJvdmluZyB0aGUgc3RyZWV0cyBiZXR3ZWVuIFJpY2htb25kIEJyaWRnZSAoRm91ciBDb3VydHMpIGFuZCBDb25zdGl0dXRpb24gSGlsbCAoS2luZ+KAmXMgSW5ucykgRGF0ZTogMTgzN1wiLFxuXHRcdFwiZGF0ZVwiOiAxODM3XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDc1XCIsIFwieFwiOiAtMjE3LjUsIFwieVwiOiAtMTQxNC41LCBcInpvb21YXCI6IDAuODcsIFwiem9vbVlcIjogMC43NzIsIFwicm90YXRpb25cIjogMS42MTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0wNzUtbS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiBhIGxpbmUgb2Ygcm9hZCwgbGVhZGluZyBmcm9tIExpbmVuIEhhbGwgdG8gR2xhc25ldmluIFJvYWQsIHNob3dpbmcgdGhlIFJveWFsIENhbmFsIERhdGU6IDE4MDBcIixcblx0XHRcImRhdGVcIjogMTgwMFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM2MVwiLCBcInhcIjogNDY0LCBcInlcIjogMjEzMSwgXCJ6b29tWFwiOiAwLjQzNiwgXCJ6b29tWVwiOiAwLjQzNiwgXCJyb3RhdGlvblwiOiAtMi4wNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNjEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJMZWVzb24gU3RyZWV0LCBQb3J0bGFuZCBTdHJlZXQgKG5vdyBVcHBlciBMZWVzb24gU3RyZWV0KSwgRXVzdGFjZSBQbGFjZSwgRXVzdGFjZSBCcmlkZ2UgKG5vdyBMZWVzb24gU3RyZWV0KSwgSGF0Y2ggU3RyZWV0LCBDaXJjdWxhciBSb2FkIC0gc2lnbmVkIGJ5IENvbW1pc3Npb25lcnMgb2YgV2lkZSBTdHJlZXRzIERhdGU6IDE3OTJcIixcblx0XHRcImRhdGVcIjogMTc5MlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTEwNi0xXCIsIFwieFwiOiAtNzU3LCBcInlcIjogNDk1LjUsIFwiem9vbVhcIjogMC4yNjUsIFwiem9vbVlcIjogMC4yNjUsIFwicm90YXRpb25cIjogLTAuMDc0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTA2LTEuanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMS4wLCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIHNob3dpbmcgcHJvcG9zZWQgaW1wcm92ZW1lbnRzIHRvIGJlIG1hZGUgaW4gQ29ybm1hcmtldCwgQ3V0cHVyc2UgUm93LCBMYW1iIEFsbGV5IC0gRnJhbmNpcyBTdHJlZXQgLSBhbmQgYW4gaW1wcm92ZWQgZW50cmFuY2UgZnJvbSBLZXZpbiBTdHJlZXQgdG8gU2FpbnQgUGF0cmlja+KAmXMgQ2F0aGVkcmFsLCB0aHJvdWdoIE1pdHJlIEFsbGV5IGFuZCBhdCBKYW1lc+KAmXMgR2F0ZS4gRGF0ZTogMTg0NS00NiBcIixcblx0XHRcImRhdGVcIjogMTg0NVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE0MlwiLCBcInhcIjogOTQuOTk1LCBcInlcIjogMjM3Ny41LCBcInpvb21YXCI6IDAuNDgyLCBcInpvb21ZXCI6IDAuNDc2LCBcInJvdGF0aW9uXCI6IC0yLjAxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE0Mi1sLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDEuMCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBOZXcgU3RyZWV0cywgYW5kIG90aGVyIGltcHJvdmVtZW50cyBpbnRlbmRlZCB0byBiZSBpbW1lZGlhdGVseSBleGVjdXRlZC4gU2l0dWF0ZSBvbiB0aGUgU291dGggU2lkZSBvZiB0aGUgQ2l0eSBvZiBEdWJsaW4sIHN1Ym1pdHRlZCBmb3IgdGhlIGFwcHJvYmF0aW9uIG9mIHRoZSBDb21taXNzaW9uZXJzIG9mIFdpZGUgU3RyZWV0cywgcGFydGljdWxhcmx5IG9mIHRob3NlIHBhcnRzIGJlbG9uZ2luZyB0byBXbS4gQ29wZSBhbmQgSm9obiBMb2NrZXIsIEVzcS4sIEhhcmNvdXJ0IFN0cmVldCwgQ2hhcmxlbW91bnQgU3RyZWV0LCBQb3J0b2JlbGxvLCBldGMuIERhdGU6IDE3OTJcIixcblx0XHRcImRhdGVcIjogMTc5MlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE1NVwiLCBcInhcIjogLTE1MDYsIFwieVwiOiAtNTAuNSwgXCJ6b29tWFwiOiAxLjAxLCBcInpvb21ZXCI6IDAuOTcyLCBcInJvdGF0aW9uXCI6IC0wLjAyNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE1NS1tLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTmV3IGFwcHJvYWNoIGZyb20gTWlsaXRhcnkgUm9hZCB0byBLaW5n4oCZcyBCcmlkZ2UsIGFuZCBhbG9uZyB0aGUgUXVheXMgdG8gQXN0b27igJlzIFF1YXkgRGF0ZTogMTg0MVwiLFxuXHRcdFwiZGF0ZVwiOiAxODQxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTU3LTNcIiwgXCJ4XCI6IDMuMTE1LCBcInlcIjogMy42NSwgXCJ6b29tWFwiOiAwLjUyNSwgXCJ6b29tWVwiOiAwLjU5LCBcInJvdGF0aW9uXCI6IDAuNTQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0xNTctMy1tLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuMCwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcInNob3dpbmcgdGhlIGltcHJvdmVtZW50cyBwcm9wb3NlZCBieSB0aGUgQ29tbWlzc2lvbmVycyBvZiBXaWRlIFN0cmVldHMgaW4gTmFzc2F1IFN0cmVldCwgTGVpbnN0ZXIgU3RyZWV0IGFuZCBDbGFyZSBTdHJlZXRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE2NFwiLCBcInhcIjogLTQ3MiwgXCJ5XCI6ODA1LCBcInpvb21YXCI6IDAuMDU2LCBcInpvb21ZXCI6IDAuMDU2LCBcInJvdGF0aW9uXCI6IDAuMDksIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0xNjQtbC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxLjAsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIFNhaW50IFBhdHJpY2vigJlzLCBldGMuIERhdGU6IDE4MjRcIixcblx0XHRcImRhdGVcIjogMTgyNFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ2OS0wMlwiLCBcInhcIjogMjU1LCBcInlcIjogMTM4OS41LCBcInpvb21YXCI6IDAuMjQ1LCBcInpvb21ZXCI6IDAuMjQ1LCBcInJvdGF0aW9uXCI6IC0yLjc1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNDY5LTItbS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJFYXJsc2ZvcnQgVGVycmFjZSwgU3RlcGhlbuKAmXMgR3JlZW4gU291dGggYW5kIEhhcmNvdXJ0IFN0cmVldCBzaG93aW5nIHBsYW4gb2YgcHJvcG9zZWQgbmV3IHN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzU1LTFcIiwgXCJ4XCI6IDY5NiwgXCJ5XCI6IDcxMy41LCBcInpvb21YXCI6IDAuMzIzLCBcInpvb21ZXCI6IDAuMjg5LCBcInJvdGF0aW9uXCI6IDEuMTQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzU1LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBvZiBCYWdnb3QgU3RyZWV0IGFuZCBGaXR6d2lsbGlhbSBTdHJlZXQsIHNob3dpbmcgYXZlbnVlcyB0aGVyZW9mIE5vLiAxIERhdGU6IDE3OTBcIixcblx0XHRcImRhdGVcIjogMTc5MFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTcyOVwiLCBcInhcIjogLTEwODguNSwgXCJ5XCI6IDY1MiwgXCJ6b29tWFwiOiAwLjE4NCwgXCJ6b29tWVwiOiAwLjE4NCwgXCJyb3RhdGlvblwiOiAtMy40MjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy03MjkucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gSmFtZXPigJlzIFN0cmVldCwgQmFzb24gTGFuZSwgRWNobGlu4oCZcyBMYW5lLCBHcmFuZCBDYW5hbCBQbGFjZSwgQ2l0eSBCYXNvbiBhbmQgR3JhbmQgQ2FuYWwgSGFyYm91clwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNzU3XCIsIFwieFwiOiAtODgxLCBcInlcIjogMjYxLjUsIFwiem9vbVhcIjogMC4zNTUsIFwiem9vbVlcIjogMC4zNTUsIFwicm90YXRpb25cIjogLTAuMDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNzU3LWwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiZm91ciBjb3VydHMgdG8gc3QgcGF0cmlja3MsIHRoZSBjYXN0bGUgdG8gdGhvbWFzIHN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTM4XCIsIFwieFwiOiAyMTIuNSwgXCJ5XCI6IDE0NywgXCJ6b29tWFwiOiAwLjE5LCBcInpvb21ZXCI6IDAuMTc2LCBcInJvdGF0aW9uXCI6IDAsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0xMzgtbC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjQsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwcmVtaXNlcywgR2Vvcmdl4oCZcyBRdWF5LCBDaXR5IFF1YXksIFRvd25zZW5kIFN0cmVldCBhbmQgbmVpZ2hib3VyaG9vZCwgc2hvd2luZyBwcm9wZXJ0eSBsb3N0IHRvIHRoZSBDaXR5LCBpbiBhIHN1aXQgYnkgJ1RoZSBDb3Jwb3JhdGlvbiAtIHdpdGggVHJpbml0eSBDb2xsZWdlJ1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTg5XCIsIFwieFwiOiAtNzkyLjUsIFwieVwiOiAyNjIuNSwgXCJ6b29tWFwiOiAwLjI2LCBcInpvb21ZXCI6IDAuMjU4LCBcInJvdGF0aW9uXCI6IDAuMDAzLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE4OS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNvcHkgb2YgbWFwIG9mIHByb3Bvc2VkIE5ldyBTdHJlZXQgZnJvbSBFc3NleCBTdHJlZXQgdG8gQ29ybm1hcmtldCwgd2l0aCB0aGUgZW52aXJvbnMgYW5kIHN0cmVldHMgYnJhbmNoaW5nIG9mZlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDk4XCIsIFwieFwiOiAtNDc1LCBcInlcIjogNTI0LCBcInpvb21YXCI6IDAuMDYzLCBcInpvb21ZXCI6IDAuMDYzLCBcInJvdGF0aW9uXCI6IC0wLjE2LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMDk4LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIENocmlzdGNodXJjaCwgU2tpbm5lcnMgUm93IGV0Yy4gVGhvbWFzIFNoZXJyYXJkLCA1IEphbnVhcnkgMTgyMSBEYXRlOiAxODIxXCIsXG5cdFx0XCJkYXRlXCI6IDE4MjFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yMDJcIiwgXCJ4XCI6IDE2LCBcInlcIjogODEsIFwiem9vbVhcIjogMC4yODksIFwiem9vbVlcIjogMC4yNjMsIFwicm90YXRpb25cIjogLTAuMTA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTIwMi1jLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiYXJlYSBpbW1lZGlhdGVseSBub3J0aCBvZiBSaXZlciBMaWZmZXkgZnJvbSBTYWNrdmlsbGUgU3QsIExvd2VyIEFiYmV5IFN0LCBCZXJlc2ZvcmQgUGxhY2UsIGFzIGZhciBhcyBlbmQgb2YgTm9ydGggV2FsbC4gQWxzbyBzb3V0aCBvZiBMaWZmZXkgZnJvbSBXZXN0bW9ybGFuZCBTdHJlZXQgdG8gZW5kIG9mIEpvaG4gUm9nZXJzb24ncyBRdWF5XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNzlcIiwgXCJ4XCI6IC01MzcuNSwgXCJ5XCI6IDczMCwgXCJ6b29tWFwiOiAwLjE2OCwgXCJ6b29tWVwiOiAwLjE2NCwgXCJyb3RhdGlvblwiOiAwLjAyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE3OS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxLjAsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlNhaW50IFBhdHJpY2vigJlzIENhdGhlZHJhbCwgTm9ydGggQ2xvc2UgYW5kIHZpY2luaXR5XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMjlcIiwgXCJ4XCI6IC02NzgsIFwieVwiOiAzNDUuNSwgXCJ6b29tWFwiOiAwLjMzNiwgXCJ6b29tWVwiOiAwLjMzNiwgXCJyb3RhdGlvblwiOiAtMC4yMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzI5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuMyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBmb3Igb3BlbmluZyBhbmQgd2lkZW5pbmcgYSBwcmluY2lwYWwgQXZlbnVlIHRvIHRoZSBDYXN0bGUsIG5vdyAoMTkwMCkgUGFybGlhbWVudCBTdHJlZXQgLSBzaG93aW5nIERhbWUgU3RyZWV0LCBDYXN0bGUgU3RyZWV0LCBhbmQgYWxsIHRoZSBBdmVudWVzIHRoZXJlb2YgRGF0ZTogMTc1N1wiLFxuXHRcdFwiZGF0ZVwiOiAxNzU3XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTg3XCIsIFwieFwiOiAtMjI2LCBcInlcIjogNDk0LjUsIFwiem9vbVhcIjogMC4wNjYsIFwiem9vbVlcIjogMC4wNjQsIFwicm90YXRpb25cIjogMC4wLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE4Ny5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxLjAsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkEgc3VydmV5IG9mIHNldmVyYWwgaG9sZGluZ3MgaW4gU291dGggR3JlYXQgR2VvcmdlJ3MgU3RyZWV0IC0gdG90YWwgcHVyY2hhc2UgwqMxMTUyOC4xNi4zIERhdGU6MTgwMVwiLFxuXHRcdFwiZGF0ZVwiOiAxODAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTI0XCIsIFwieFwiOiAtMjc5LCBcInlcIjogMzY2LCBcInpvb21YXCI6IDAuMDU3LCBcInpvb21ZXCI6IDAuMDUxLCBcInJvdGF0aW9uXCI6IC0wLjE2LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTEyNC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjQsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwcmVtaXNlcyBpbiBFc3NleCBTdHJlZXQgYW5kIFBhcmxpYW1lbnQgU3RyZWV0LCBzaG93aW5nIEVzc2V4IEJyaWRnZSBhbmQgT2xkIEN1c3RvbSBIb3VzZS4gVC4gYW5kIEQuSC4gU2hlcnJhcmQgRGF0ZTogMTgxM1wiLFxuXHRcdFwiZGF0ZVwiOiAxODEzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzYwXCIsIFwieFwiOiAtMTQ0LCBcInlcIjogNDIxLjUsIFwiem9vbVhcIjogMC4xMjEsIFwiem9vbVlcIjogMC4xMDcsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzYwLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gRGFtZSBTdHJlZXQgYW5kIGF2ZW51ZXMgdGhlcmVvZiAtIEV1c3RhY2UgU3RyZWV0LCBDZWNpbGlhIFN0cmVldCwgYW5kIHNpdGUgb2YgT2xkIFRoZWF0cmUsIEZvd25lcyBTdHJlZXQsIENyb3duIEFsbGV5IGFuZCBDb3BlIFN0cmVldCBEYXRlOiAxNzkyXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzkyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzYyXCIsIFwieFwiOiAzNS41LCBcInlcIjogODQuNSwgXCJ6b29tWFwiOiAwLjIyOSwgXCJ6b29tWVwiOiAwLjIzNSwgXCJyb3RhdGlvblwiOiAwLjEyNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNjItMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjQsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcHMgLSBDb2xsZWdlIEdyZWVuLCBDb2xsZWdlIFN0cmVldCwgV2VzdG1vcmVsYW5kIFN0cmVldCBhbmQgYXZlbnVlcyB0aGVyZW9mLCBzaG93aW5nIHRoZSBzaXRlIG9mIFBhcmxpYW1lbnQgSG91c2UgYW5kIFRyaW5pdHkgQ29sbGVnZSBOby4gMSBEYXRlOiAxNzkzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzkzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzg3XCIsIFwieFwiOiAyNzIuNSwgXCJ5XCI6IDQyMy41LCBcInpvb21YXCI6IDAuMDgxLCBcInpvb21ZXCI6IDAuMDc3LCBcInJvdGF0aW9uXCI6IDMuMDM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM4Ny5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiBob2xkaW5ncyBpbiBGbGVldCBTdHJlZXQgYW5kIENvbGxlZ2UgU3RyZWV0LCBzaG93aW5nIHNpdGUgb2YgT2xkIFdhdGNoIEhvdXNlIERhdGU6IDE4MDFcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yMThcIiwgXCJ4XCI6IC0yNDU1LCBcInlcIjogLTI4NC41LCBcInpvb21YXCI6IDAuNDUzLCBcInpvb21ZXCI6IDAuNDUxLCBcInJvdGF0aW9uXCI6IC0wLjA0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTIxOC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiB0aGUgTG9uZyBNZWFkb3dzIGFuZCBwYXJ0IG9mIHRoZSBQaG9lbml4IFBhcmsgYW5kIFBhcmtnYXRlIFN0cmVldCBEYXRlOiAxNzg2XCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzg2XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjI5XCIsIFwieFwiOiAtMjM4NCwgXCJ5XCI6IDU1LjUsIFwiem9vbVhcIjogMC4zNzksIFwiem9vbVlcIjogMC4zNzksIFwicm90YXRpb25cIjogMC4wMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjI5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU2VjdGlvbiBhY3Jvc3MgdGhlIHByb3Bvc2VkIFJvYWQgZnJvbSB0aGUgUGFyayBHYXRlIHRvIElzbGFuZCBCcmlkZ2UgR2F0ZSAtIG5vdyAoMTkwMCkgQ29ueW5naGFtIFJvYWQgRGF0ZTogMTc4OVwiLCBcblx0XHRcImRhdGVcIjogMTc4OVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTI0MlwiLCBcInhcIjogLTQwNS41LCBcInlcIjogMjEsIFwiem9vbVhcIjogMC4wODQsIFwiem9vbVlcIjogMC4wODQsIFwicm90YXRpb25cIjogMS4wODUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjQyLTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTdXJ2ZXkgb2YgYSBob2xkaW5nIGluIE1hcnnigJlzIExhbmUsIHRoZSBlc3RhdGUgb2YgdGhlIFJpZ2h0IEhvbm91cmFibGUgTG9yZCBNb3VudGpveSBEYXRlOiAxNzkzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzkzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjQ1XCIsIFwieFwiOiAtMjEwLjAsIFwieVwiOi0zOTcuNSwgXCJ6b29tWFwiOiAwLjA4NCwgXCJ6b29tWVwiOiAwLjA4NCwgXCJyb3RhdGlvblwiOiAtMC42MiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yNDUtMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiB0aGUgQmFybGV5IEZpZWxkcyBldGMuLCBhbmQgYSBwbGFuIGZvciBvcGVuaW5nIGEgc3RyZWV0IGZyb20gUnV0bGFuZCBTcXVhcmUsIERvcnNldCBTdHJlZXQsIGJlaW5nIG5vdyAoMTg5OSkga25vd24gYXMgU291dGggRnJlZGVyaWNrIFN0cmVldCAtIHdpdGggcmVmZXJlbmNlIERhdGU6IDE3ODlcIixcblx0XHQgXCJkYXRlXCI6IDE3ODlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yNTdcIiwgXCJ4XCI6IDY4MS4wLCBcInlcIjotMTIyMy41LCBcInpvb21YXCI6IDAuMzQ2LCBcInpvb21ZXCI6IDAuMzg4LCBcInJvdGF0aW9uXCI6IDAuMjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjU3LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIENsb25saWZmZSBSb2FkIGFuZCB0aGUgT2xkIFR1cm5waWtlIEhvdXNlIGF0IEJhbGx5Ym91Z2ggQnJpZGdlIC0gTm9ydGggU3RyYW5kIERhdGU6IDE4MjNcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MjNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yNjhcIiwgXCJ4XCI6IC0xNTI4LjAsIFwieVwiOiAxMDUuNSwgXCJ6b29tWFwiOiAwLjA4NiwgXCJ6b29tWVwiOiAwLjA4NiwgXCJyb3RhdGlvblwiOiAwLjA3LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTI2OC0zLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gUGFya2dhdGUgU3RyZWV0LCBDb255bmdoYW0gUm9hZCwgd2l0aCByZWZlcmVuY2UgdG8gbmFtZXMgb2YgdGVuYW50cyBlbmRvcnNlZCBOby4gM1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTcxXCIsIFwieFwiOiAxMTIuMCwgXCJ5XCI6IDE4MS41LCBcInpvb21YXCI6IDAuMDIxLCBcInpvb21ZXCI6IDAuMDIxLCBcInJvdGF0aW9uXCI6IC0wLjI2NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xNzEtMi5qcGVnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgTG93ZXIgQWJiZXkgU3RyZWV0LCB0byBjb3JuZXIgb2YgRWRlbiBRdWF5IChTYWNrdmlsbGUgU3RyZWV0KSBEYXRlOiAxODEzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODEzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzgwXCIsIFwieFwiOiAyNDEuNSwgXCJ5XCI6IDI4NiwgXCJ6b29tWFwiOiAwLjAzMywgXCJ6b29tWVwiOiAwLjAzMywgXCJyb3RhdGlvblwiOiAwLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM4MC0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gRmxlZXQgTWFya2V0LCBQb29sYmVnIFN0cmVldCwgSGF3a2lucyBTdHJlZXQsIFRvd25zZW5kIFN0cmVldCwgRmxlZXQgU3RyZWV0LCBEdWJsaW4gU29jaWV0eSBTdG9yZXMgRGF0ZTogMTgwMFwiLCBcblx0XHRcImRhdGVcIjogMTgwMFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTMwOVwiLCBcInhcIjogMzYuMCwgXCJ5XCI6IC0yOTcsIFwiem9vbVhcIjogMC4yMTksIFwiem9vbVlcIjogMC4yMTksIFwicm90YXRpb25cIjogLTAuNDM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMwOS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBhcnQgb2YgR2FyZGluZXIgU3RyZWV0IGFuZCBwYXJ0IG9mIEdsb3VjZXN0ZXIgU3RyZWV0LCBsYW5kIG91dCBpbiBsb3RzIGZvciBidWlsZGluZyAtIHNob3dpbmcgR2xvdWNlc3RlciBTdHJlZXQsIEdsb3VjZXN0ZXIgUGxhY2UsIHRoZSBEaWFtb25kLCBTdW1tZXIgSGlsbCwgR3JlYXQgQnJpdGFpbiBTdHJlZXQsIEN1bWJlcmxhbmQgU3RyZWV0LCBNYXJsYm9yb+KAmSBTdHJlZXQsIE1hYmJvdCBTdHJlZXQsIE1lY2tsaW5idXJnaCBldGMuRGF0ZTogMTc5MVwiLCBcblx0XHRcImRhdGVcIjogMTc5MVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTI5NFwiLCBcInhcIjogMTI1LjAsIFwieVwiOiAtMTE4LCBcInpvb21YXCI6IDAuMTI5LCBcInpvb21ZXCI6IDAuMTI5LCBcInJvdGF0aW9uXCI6IC0wLjE5NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTI5NC0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIHBhcnQgb2YgdGhlIExvcmRzaGlwIG9mIFNhaW50IE1hcnnigJlzIEFiYmV5IC0gcGFydCBvZiB0aGUgZXN0YXRlIG9mIHRoZSBSaWdodCBIb25vcmFibGUgTHVrZSBWaXNjb3VudCBNb3VudGpveSwgc29sZCB0byBSaWNoYXJkIEZyZW5jaCBFc3EuLCBwdXJzdWFudCB0byBhIERlY3JlZSBvZiBIaXMgTWFqZXN0eeKAmXMgSGlnaCBDb3VydCBvZiBDaGFuY2VyeSwgMTcgRmViIDE3OTRcIiwgXG5cdFx0XCJkYXRlXCI6IDE3OTRcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMTBcIiwgXCJ4XCI6IDQ3NC4wLCBcInlcIjogLTgyMS41LCBcInpvb21YXCI6IDAuNTc2LCBcInpvb21ZXCI6IDAuNTc2LCBcInJvdGF0aW9uXCI6IDAuMTQ1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMxMC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk5vcnRoIExvdHMgLSBmcm9tIHRoZSBOb3J0aCBTdHJhbmQgUm9hZCwgdG8gdGhlIE5vcnRoIGFuZCBFYXN0IFdhbGxzIERhdGU6IDE3OTNcIiwgXG5cdFx0XCJkYXRlXCI6IDE3OTNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMjVcIiwgXCJ4XCI6IC04OTMuMCwgXCJ5XCI6IDQxLCBcInpvb21YXCI6IDAuMjg2LCBcInpvb21ZXCI6IDAuMjg2LCBcInJvdGF0aW9uXCI6IDAuMDMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzI1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU21pdGhmaWVsZCwgQXJyYW4gUXVheSwgSGF5bWFya2V0LCBXZXN0IEFycmFuIFN0cmVldCwgTmV3IENodXJjaCBTdHJlZXQsIEJvdyBMYW5lLCBCb3cgU3RyZWV0LCBNYXkgTGFuZVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzI2LTFcIiwgXCJ4XCI6IC0xNDE1LjUsIFwieVwiOiAxMTIuNSwgXCJ6b29tWFwiOiAwLjExNCwgXCJ6b29tWVwiOiAwLjExMiwgXCJyb3RhdGlvblwiOiAwLjE3LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMyNi0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQmFycmFjayBTdHJlZXQsIFBhcmsgU3RyZWV0LCBQYXJrZ2F0ZSBTdHJlZXQgYW5kIFRlbXBsZSBTdHJlZXQsIHdpdGggcmVmZXJlbmNlIHRvIG5hbWVzIG9mIHRlbmFudHMgYW5kIHByZW1pc2VzIE5vLiAxXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy02MzJcIiwgXCJ4XCI6IDEyNSwgXCJ5XCI6IDM0Ny41LCBcInpvb21YXCI6IDAuMTcyLCBcInpvb21ZXCI6IDAuMTY0LCBcInJvdGF0aW9uXCI6IDAuNTMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNjMyLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIE5hc3NhdSBTdHJlZXQsIGxlYWRpbmcgZnJvbSBHcmFmdG9uIFN0cmVldCB0byBNZXJyaW9uIFNxdWFyZSAtIHNob3dpbmcgdGhlIG9mZiBzdHJlZXRzIGFuZCBwb3J0aW9uIG9mIEdyYWZ0b24gU3RyZWV0IGFuZCBTdWZmb2xrIFN0cmVldCBEYXRlOiAxODMzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODMzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzI2LTJcIiwgXCJ4XCI6IC0xMjU3LjUsIFwieVwiOiAxNDMuNSwgXCJ6b29tWFwiOiAwLjEsIFwiem9vbVlcIjogMC4xLCBcInJvdGF0aW9uXCI6IDAuMDc1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMyNi0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQmFycmFjayBTdHJlZXQsIFBhcmsgU3RyZWV0LCBQYXJrZ2F0ZSBTdHJlZXQgYW5kIFRlbXBsZSBTdHJlZXQsIHdpdGggcmVmZXJlbmNlIHRvIG5hbWVzIG9mIHRlbmFudHMgYW5kIHByZW1pc2VzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMzRcIiwgXCJ4XCI6IDkwLjUsIFwieVwiOiAzNTcsIFwiem9vbVhcIjogMC4xMjgsIFwiem9vbVlcIjogMC4xMjgsIFwicm90YXRpb25cIjogMS4yNjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzM0LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuMSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRGFtZSBTdHJlZXQsIENvbGxlZ2UgR3JlZW4sIEdlb3JnZeKAmXMgTGFuZSwgR2Vvcmdl4oCZcyBTdHJlZXQsIENoZXF1ZXIgU3RyZWV0IGFuZCBhdmVudWVzIHRoZXJlb2ZcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM1NS0yXCIsIFwieFwiOiAxODUsIFwieVwiOiAxMDI5LCBcInpvb21YXCI6IDAuMzAyLCBcInpvb21ZXCI6IDAuMzAyLCBcInJvdGF0aW9uXCI6IC0wLjQ1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM1NS0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBvZiBCYWdnb3QgU3RyZWV0IGFuZCBGaXR6d2lsbGlhbSBTdHJlZXQsIHNob3dpbmcgYXZlbnVlcyB0aGVyZW9mIE5vLiAyIERhdGU6IDE3OTJcIixcblx0XHRcImRhdGVcIjogMTc5MlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM2OFwiLCBcInhcIjogLTY4Ny41LCBcInlcIjogMjc3LjUsIFwiem9vbVhcIjogMC4xNTYsIFwiem9vbVlcIjogMC4xNSwgXCJyb3RhdGlvblwiOiAwLjEyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM2OC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBLaW5n4oCZcyBJbm4gUXVheSBhbmQgTWVyY2hhbnRzIFF1YXksIHNob3dpbmcgc2l0ZSBvZiBPcm1vbmQgQnJpZGdlIC0gYmVsb3cgQ2hhcmxlcyBTdHJlZXQgLSBhZnRlcndhcmRzIHJlbW92ZWQgYW5kIHJlLWVyZWN0ZWQgb3Bwb3NpdGUgV2luZXRhdmVybiBTdHJlZXQgRGF0ZTogMTc5N1wiLCBcblx0XHRcImRhdGVcIjogMTc5N1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM3MlwiLCBcInhcIjogMzQxLjUsIFwieVwiOiAyOTYuNSwgXCJ6b29tWFwiOiAwLjAzNiwgXCJ6b29tWVwiOiAwLjAzMzksIFwicm90YXRpb25cIjogMi45NTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzcyLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiR2VvcmdlJ3MgUXVheSwgV2hpdGVzIExhbmUsIGFuZCBIYXdraW5zIFN0cmVldCwgc2hvd2luZyBzaXRlIG9mIFN3ZWV0bWFuJ3MgQnJld2VyeSB3aGljaCByYW4gZG93biB0byBSaXZlciBMaWZmZXkgRGF0ZTogMTc5OVwiLCBcblx0XHRcImRhdGVcIjogMTc5OVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM5MC0xXCIsIFwieFwiOiAtODA0LjUsIFwieVwiOiA0MjAsIFwiem9vbVhcIjogMC4yMDQsIFwiem9vbVlcIjogMC4yMDIsIFwicm90YXRpb25cIjogLTAuMDcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzkwLTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIHByb3Bvc2VkIE1hcmtldCBIb3VzZSwgYWRqb2luaW5nIFRob21hcyBTdHJlZXQsIFZpY2FyIFN0cmVldCwgTWFya2V0IFN0cmVldCBhbmQgRnJhbmNpcyBTdHJlZXQgRGF0ZTogMTgwMVwiLCBcblx0XHRcImRhdGVcIjogMTgwMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM5NS0zXCIsIFwieFwiOiAtNTg4LCBcInlcIjogNTc4LCBcInpvb21YXCI6IDAuMDM2LCBcInpvb21ZXCI6IDAuMDM2LCBcInJvdGF0aW9uXCI6IC0zLjY1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM5NS0zLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTmV3IFJvdyBhbmQgQ3V0cHVyc2UgUm93IERhdGU6IDE4MDBcIixcblx0XHRcImRhdGVcIjogMTgwMFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQwNFwiLCBcInhcIjogLTE2LCBcInlcIjogMzcyLCBcInpvb21YXCI6IDAuMDYyLCBcInpvb21ZXCI6IDAuMDYsIFwicm90YXRpb25cIjogLTAuMjU1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQwNC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkFuZ2xlc2VhIFN0cmVldCBhbmQgUGFybGlhbWVudCBIb3VzZSBEYXRlOiAxODAyXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODAyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDExXCIsIFwieFwiOiAzNDMuNSwgXCJ5XCI6IDY1NywgXCJ6b29tWFwiOiAwLjA4NiwgXCJ6b29tWVwiOiAwLjA4NiwgXCJyb3RhdGlvblwiOiAwLjMyNSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQxMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkxlaW5zdGVyIEhvdXNlIGFuZCBwYXJ0IG9mIHRoZSBlc3RhdGUgb2YgVmlzY291bnQgRml0endpbGxpYW0gKGZvcm1lcmx5IExlaW5zdGVyIExhd24pLCBsYWlkIG91dCBpbiBsb3RzIGZvciBidWlsZGluZyAtIHNob3dpbmcgS2lsZGFyZSBTdHJlZXQsIFVwcGVyIE1lcnJpb24gU3RyZWV0IGFuZCBMZWluc3RlciBQbGFjZSAoU3RyZWV0KSwgTWVycmlvbiBQbGFjZSwgYW5kIHRoZSBPbGQgQm91bmRhcnkgYmV0d2VlbiBMZWluc3RlciBhbmQgTG9yZCBGaXR6d2lsbGlhbSAtIHRha2VuIGZyb20gYSBtYXAgc2lnbmVkIFJvYmVydCBHaWJzb24sIE1heSAxOCwgMTc1NCBEYXRlOiAxODEyXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODEyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjUxXCIsIFwieFwiOiAyMjAsIFwieVwiOiA2NCwgXCJ6b29tWFwiOiAwLjIzNiwgXCJ6b29tWVwiOiAwLjIzNiwgXCJyb3RhdGlvblwiOiAtMS40OSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTI1MS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwb3J0aW9uIG9mIENpdHksIHNob3dpbmcgTW9udGdvbWVyeSBTdHJlZXQsIE1lY2tsaW5idXJnaCBTdHJlZXQsIExvd2VyIEdsb3VjZXN0ZXIgU3RyZWV0IGFuZCBwb3J0aW9uIG9mIE1hYmJvdCBTdHJlZXRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQxM1wiLCBcInhcIjogLTM3MywgXCJ5XCI6IDgwNi41LCBcInpvb21YXCI6IDAuMDc4LCBcInpvb21ZXCI6IDAuMDc2LCBcInJvdGF0aW9uXCI6IC0wLjE1LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDEzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGV0ZXIgU3RyZWV0LCBQZXRlcuKAmXMgUm93LCBXaGl0ZWZyaWFyIFN0cmVldCwgV29vZCBTdHJlZXQgYW5kIEJyaWRlIFN0cmVldCAtIHNob3dpbmcgc2l0ZSBvZiB0aGUgQW1waGl0aGVhdHJlIGluIEJyaWRlIFN0cmVldCwgd2hlcmUgdGhlIE1vbGV5bmV1eCBDaHVyY2ggbm93ICgxOTAwKSBzdGFuZHMgRGF0ZTogMTgxMlwiLCBcblx0XHRcImRhdGVcIjogMTgxMlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQxNFwiLCBcInhcIjogLTE5My41LCBcInlcIjogMzYzLjUsIFwiem9vbVhcIjogMC4wNzIsIFwiem9vbVlcIjogMC4wNzQsIFwicm90YXRpb25cIjogLTAuMjMsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MTQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJUZW1wbGUgQmFyLCBXZWxsaW5ndG9uIFF1YXksIE9sZCBDdXN0b20gSG91c2UsIEJhZ25pbyBTbGlwIGV0Yy4gRGF0ZTogMTgxM1wiLCBcblx0XHRcImRhdGVcIjogMTgxM1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQyMVwiLCBcInhcIjogLTQ3NC41LCBcInlcIjogNTI3LCBcInpvb21YXCI6IDAuMDYyLCBcInpvb21ZXCI6IDAuMDYsIFwicm90YXRpb25cIjogLTAuMTg1LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDIxLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBwcmVjaW5jdHMgb2YgQ2hyaXN0IENodXJjaCBEdWJsaW4sIHNob3dpbmcgU2tpbm5lcnMgUm93LCB0byB3aGljaCBpcyBhdHRhY2hlZCBhIE1lbW9yYW5kdW0gZGVub21pbmF0aW5nIHRoZSBwcmVtaXNlcywgdGFrZW4gYnkgdGhlIENvbW1pc3Npb25lcnMgb2YgV2lkZSBTdHJlZXRzIGZvciB0aGUgcHVycG9zZSBvZiB3aWRlbmluZyBzYWlkIFNraW5uZXJzIFJvdywgbm93ICgxOTAwKSBrbm93biBhcyBDaHJpc3QgQ2h1cmNoIFBsYWNlIERhdGU6IDE4MTdcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MTdcblx0fSxcblx0eyBcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDA4LTJcIiwgXCJ4XCI6IC0zOTcuNSwgXCJ5XCI6IDU0NS41LCBcInpvb21YXCI6IDAuMDQ0LCBcInpvb21ZXCI6IDAuMDQ0LCBcInJvdGF0aW9uXCI6IC0wLjEyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQwOC0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiV2VyYnVyZ2ggU3RyZWV0LCBTa2lubmVycyBSb3csIEZpc2hhbWJsZSBTdHJlZXQgYW5kIENhc3RsZSBTdHJlZXQgRGF0ZTogYy4gMTgxMFwiLFxuXHRcdFwiZGF0ZVwiOiAxODEwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDI1LTFcIiwgXCJ4XCI6IC05MTcuNSwgXCJ5XCI6IDU3Ny41LCBcInpvb21YXCI6IDAuMDQ1LCBcInpvb21ZXCI6IDAuMDQ2LCBcInJvdGF0aW9uXCI6IC0xLjQyNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MjUtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1lYXRoIFJvdywgTWFya+KAmXMgQWxsZXkgYW5kIERpcnR5IExhbmUgLSBzaG93aW5nIEJyaWRnZWZvb3QgU3RyZWV0LCBNYXNzIExhbmUsIFRob21hcyBTdHJlZXQgYW5kIFN0LiBDYXRoZXJpbmXigJlzIENodXJjaCBEYXRlOiAxODIwLTI0XCIsIFxuXHRcdFwiZGF0ZVwiOiAxODIwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDI2XCIsIFwieFwiOiAtNzM1LjUsIFwieVwiOiA1NzguNSwgXCJ6b29tWFwiOiAwLjAzNCwgXCJ6b29tWVwiOiAwLjAzNCwgXCJyb3RhdGlvblwiOiAxLjU2NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MjYucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2Ygc2V2ZXJhbCBob3VzZXMgYW5kIHByZW1pc2VzIG9uIHRoZSBFYXN0IHNpZGUgb2YgTWVhdGggUm93LCB0aGUgcHJvcGVydHkgb2YgTXIuIEpvaG4gV2Fsc2ggLSBzaG93aW5nIHRoZSBzaXR1YXRpb24gb2YgVGhvbWFzIFN0cmVldCwgSGFuYnVyeSBMYW5lIGFuZCBzaXRlIG9mIENoYXBlbCBEYXRlOiAxODIxXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODIxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTEyLTFcIiwgXCJ4XCI6IC0yOTAuNSwgXCJ5XCI6IDM0NC41LCBcInpvb21YXCI6IDAuMTgsIFwiem9vbVlcIjogMC4xODIsIFwicm90YXRpb25cIjogLTAuMjYsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTEyLTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC4zLFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJEYW1lIFN0cmVldCwgZnJvbSB0aGUgY29ybmVyIG9mIFBhbGFjZSBTdHJlZXQgdG8gdGhlIGNvcm5lciBvZiBHZW9yZ2XigJlzIFN0cmVldCAtIGxhaWQgb3V0IGluIGxvdHMgZm9yIGJ1aWxkaW5nIE5vcnRoIGFuZCBTb3V0aCBhbmQgdmljaW5pdHkgRGF0ZTogMTc4MlwiLCBcblx0XHRcImRhdGVcIjogMTc4MlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTExMlwiLCBcInhcIjogLTI5OCwgXCJ5XCI6IDMzOS41LCBcInpvb21YXCI6IDAuMTg1LCBcInpvb21ZXCI6IDAuMTg1LCBcInJvdGF0aW9uXCI6IC0wLjI1NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xMTIucG5nXCIsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJvcGFjaXR5XCI6IDAuMCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRGFtZSBTdHJlZXQsIGZyb20gdGhlIGNvcm5lciBvZiBQYWxhY2UgU3RyZWV0IHRvIHRoZSBjb3JuZXIgb2YgR2Vvcmdl4oCZcyBTdHJlZXQgLSBsYWlkIG91dCBpbiBsb3RzIGZvciBidWlsZGluZyBOb3J0aCBhbmQgU291dGggYW5kIHZpY2luaXR5IERhdGU6IDE3ODJcIiwgXG5cdFx0XCJkYXRlXCI6IDE3ODJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00NTVcIiwgXCJ4XCI6IDYzNS41LCBcInlcIjogMTI1OCwgXCJ6b29tWFwiOiAwLjI2MywgXCJ6b29tWVwiOiAwLjI2MywgXCJyb3RhdGlvblwiOiAtMC45LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQ1NS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjYsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkhlcmJlcnQgUGxhY2UgYW5kIEF2ZW51ZXMgYWRqYWNlbnQgdG8gVXBwZXIgTW91bnQgU3RyZWV0LCBzaG93aW5nIFVwcGVyIEJhZ2dvdCBTdHJlZXQgLSBIZXJiZXJ0IFN0cmVldCwgV2FycmluZ3RvbiBQbGFjZSBhbmQgUGVyY3kgUGxhY2UsIE5vcnRodW1iZXJsYW5kIFJvYWQgYW5kIExvd2VyIE1vdW50IFN0cmVldCBEYXRlOiAxODMzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODMzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTk5XCIsIFwieFwiOiA4NzguNSwgXCJ5XCI6IDEyMTcuNSwgXCJ6b29tWFwiOiAwLjI0MSwgXCJ6b29tWVwiOiAwLjI0MSwgXCJyb3RhdGlvblwiOiAyLjExNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xOTktMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjYsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwYXJ0IG9mIHRoZSBlc3RhdGUgb2YgdGhlIEhvbi4gU2lkbmV5IEhlcmJlcnQsIGNhbGxlZCBXaWx0b24gUGFyYWRlLCBzaG93aW5nIHRoZSBwcm9wb3NlZCBhcHByb3ByaWF0aW9uIHRoZXJlb2YgaW4gc2l0ZXMgZm9yIGJ1aWxkaW5nLiBBbHNvIHNob3dpbmcgQmFnZ290IFN0cmVldCwgR3JhbmQgQ2FuYWwgYW5kIEZpdHp3aWxsaWFtIFBsYWNlLlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDY1XCIsIFwieFwiOiAzMDEuNSwgXCJ5XCI6IDcxMS41LCBcInpvb21YXCI6IDAuMjA3LCBcInpvb21ZXCI6IDAuMjA3LCBcInJvdGF0aW9uXCI6IDMuMywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00NjUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJHcmFmdG9uIFN0cmVldCwgTmFzc2F1IFN0cmVldCAoU291dGggc2lkZSkgYW5kIERhd3NvbiBTdHJlZXQgRGF0ZTogMTgzN1wiLCBcblx0XHRcImRhdGVcIjogMTgzN1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ4MC0yXCIsIFwieFwiOiAtNjMsIFwieVwiOiAzODIsIFwiem9vbVhcIjogMC4wNjgsIFwiem9vbVlcIjogMC4wNjgsIFwicm90YXRpb25cIjogLTAuMDU1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQ4MC0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTm9ydGggc2lkZSBvZiBDb2xsZWdlIEdyZWVuIHNob3dpbmcgQXZlbnVlcyB0aGVyZW9mLCBhbmQgZ3JvdW5kIHBsYW4gb2YgUGFybGlhbWVudCBIb3VzZSwgQW5nbGVzZWEgU3RyZWV0LCBCbGFja21vb3IgWWFyZCBldGMuIC0gd2l0aCByZWZlcmVuY2UgZ2l2aW5nIHRlbmFudHMsIG5hbWVzIG9mIHByZW1pc2VzIHJlcXVpcmVkIG9yIHB1cnBvc2Ugb2YgaW1wcm92ZW1lbnQuIERhdGU6IDE3ODZcIiwgXG5cdFx0XCJkYXRlXCI6IDE3ODZcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00OTFcIiwgXCJ4XCI6IC0yMS41LCBcInlcIjogOTM4LCBcInpvb21YXCI6IDAuMTY0LCBcInpvb21ZXCI6IDAuMTY0LCBcInJvdGF0aW9uXCI6IC0zLjA4LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQ5MS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkF1bmdpZXIgU3RyZWV0LCBNZXJjZXIgU3RyZWV0LCBZb3JrIFN0cmVldCBhbmQgQXZlbnVlcyB0aGVyZW9mLCB2aXo6IC0gRnJlbmNoIFN0cmVldCAoTWVyY2VyIFN0cmVldCksIEJvdyBMYW5lLCBEaWdnZXMgTGFuZSwgU3RlcGhlbiBTdHJlZXQsIERydXJ5IExhbmUsIEdyZWF0IGFuZCBMaXR0bGUgTG9uZ2ZvcmQgU3RyZWV0c1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDk2XCIsIFwieFwiOiAtMjc4LCBcInlcIjogNDU2LCBcInpvb21YXCI6IDAuMDE4LCBcInpvb21ZXCI6IDAuMDE4LCBcInJvdGF0aW9uXCI6IC0zLjI2LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQ5Ni5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkVzc2V4IFF1YXksIENoYW5nZSBBbGxleSwgU21vY2sgQWxsZXkgYW5kIGdyb3VuZCBwbGFuIG9mIFNtb2NrIEFsbGV5IFRoZWF0cmVcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTUwN1wiLCBcInhcIjogLTI3Mi41LCBcInlcIjogMzQ2LCBcInpvb21YXCI6IDAuMDg3LCBcInpvb21ZXCI6IDAuMDg5LCBcInJvdGF0aW9uXCI6IC0wLjIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNTA3LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRXNzZXggU3RyZWV0LCBQYXJsaWFtZW50IFN0cmVldCwgc2hvd2luZyBPbGQgQ3VzdG9tIEhvdXNlIFF1YXksIExvd2VyIE9ybW9uZCBRdWF5IGFuZCBEYW1lIFN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjA2LTFcIiwgXCJ4XCI6IC00NC41LCBcInlcIjogLTIyMSwgXCJ6b29tWFwiOiAwLjA1LCBcInpvb21ZXCI6IDAuMDUsIFwicm90YXRpb25cIjogLTAuNjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjA2LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgYW5nbGUgb2YgQ2F2ZW5kaXNoIFJvdywgUnV0bGFuZCBTcXVhcmUgYW5kIEdyZWF0IEJyaXRhaW4gU3RyZWV0IC0gc2hvd2luZyB1bnNpZ25lZCBlbGV2YXRpb25zIGFuZCBncm91bmQgcGxhbiBvZiBSb3R1bmRhIGJ5IEZyZWRlcmljayBUcmVuY2guIERhdGU6IDE3ODdcIiwgXG5cdFx0XCJkYXRlXCI6IDE3ODdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yMDNcIiwgXCJ4XCI6IC0zOTIsIFwieVwiOiAyNzIuNSwgXCJ6b29tWFwiOiAwLjA3OCwgXCJ6b29tWVwiOiAwLjA3NiwgXCJyb3RhdGlvblwiOiAtMC4yNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yMDMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDaXR5IFN1cnZleSAtIHNob3dpbmcgT3Jtb25kIFF1YXksIEFycmFuIFN0cmVldCwgTWFyeeKAmXMgQWJiZXksIExpdHRsZSBTdHJhbmQgU3RyZWV0LCBDYXBlbCBTdHJlZXQgYW5kIEVzc2V4IEJyaWRnZSBEYXRlOiAxODExXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODExXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNTE1XCIsIFwieFwiOiAtNzUsIFwieVwiOiA1NTAsIFwiem9vbVhcIjogMC4wODgsIFwiem9vbVlcIjogMC4wODgsIFwicm90YXRpb25cIjogMi45MzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNTE1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwic2hvd2luZyBEYW1lIFN0cmVldCwgRXNzZXggU3RyZWV0IGV0Yy4gLSBhbHNvIHNpdGUgZm9yIHByb3Bvc2VkIE5hdGlvbmFsIEJhbmssIG9uIG9yIGFib3V0IHdoZXJlIHRoZSAnRW1waXJlJyAoZm9ybWVybHkgdGhlICdTdGFyJykgVGhlYXRyZSBvZiBWYXJpZXRpZXMgbm93ICgxOTAwKSBzdGFuZHMgTm8uMVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNTIzLTFcIiwgXCJ4XCI6IC0yOTcuNSwgXCJ5XCI6IDM2OC41LCBcInpvb21YXCI6IDAuMDg4LCBcInpvb21ZXCI6IDAuMDg4LCBcInJvdGF0aW9uXCI6IC0wLjE4NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy01MjMtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkVzc2V4IFN0cmVldCwgVGVtcGxlIEJhciBhbmQgdmljaW5pdHkgdG8gRXNzZXggQnJpZGdlLCBzaG93aW5nIHByb3Bvc2VkIG5ldyBxdWF5IHdhbGwgKFdlbGxpbmd0b24gUXVheSlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQyMy0yXCIsIFwieFwiOiAzNC41LCBcInlcIjogNDc4LjUsIFwiem9vbVhcIjogMC4wNzgsIFwiem9vbVlcIjogMC4wODIsIFwicm90YXRpb25cIjogLTMuMjE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQyMy0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQ3Jvd24gQWxsZXksIENvcGUgU3RyZWV0LCBBcmRpbGzigJlzIFJvdywgVGVtcGxlIEJhciwgQXN0b27igJlzIFF1YXkgYW5kIFdlbGxpbmd0b24gUXVheSBOby4gMiBEYXRlOiAxODIwLTVcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MjBcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy01MzVcIiwgXCJ4XCI6IC0yMDkuNSwgXCJ5XCI6IDMyNSwgXCJ6b29tWFwiOiAwLjEzNCwgXCJ6b29tWVwiOiAwLjEzNCwgXCJyb3RhdGlvblwiOiAtMC4wNywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy01MzUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJXZWxsaW5ndG9uIFF1YXkgLSBjb250aW51YXRpb24gb2YgRXVzdGFjZSBTdHJlZXQgRGF0ZVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNTY3LTNcIiwgXCJ4XCI6IDE5NC41LCBcInlcIjogNDUwLCBcInpvb21YXCI6IDAuMTI2LCBcInpvb21ZXCI6IDAuMTI2LCBcInJvdGF0aW9uXCI6IDEuNDgsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNTY3LTMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgYSBwYXJjZWwgb2YgZ3JvdW5kIGJvdW5kZWQgYnkgR3JhZnRvbiBTdHJlZXQsIENvbGxlZ2UgR3JlZW4sIGFuZCBDaGVxdWVyIExhbmUgLSBsZWFzZWQgdG8gTXIuIFBvb2xleSAoMyBjb3BpZXMpIE5vLiAzIERhdGU6IDE2ODJcIiwgXG5cdFx0XCJkYXRlXCI6IDE2ODJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy01OTQtMVwiLCBcInhcIjogLTU2NC41LCBcInlcIjogNTcyLjUsIFwiem9vbVhcIjogMC4wNDQsIFwiem9vbVlcIjogMC4wNDQsIFwicm90YXRpb25cIjogMi41MzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNTk0LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgTmV3IEhhbGwgTWFya2V0IC0gcGFydCBvZiB0aGUgQ2l0eSBFc3RhdGUgRGF0ZTogMTc4MFwiLCBcblx0XHRcImRhdGVcIjogMTc4MFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTYyNS0xXCIsIFwieFwiOiAtMzIwLjUsIFwieVwiOiA2MDkuNSwgXCJ6b29tWFwiOiAwLjA1OCwgXCJ6b29tWVwiOiAwLjA1OCwgXCJyb3RhdGlvblwiOiAyLjYxLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTYyNS0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBPbGQgVGhvbHNlbGwgZ3JvdW5kLCBmb3JtZXJseSBjYWxsZWQgU291dGhlcuKAmXMgTGFuZSwgYmVsb25naW5nIHRvIHRoZSBDaXR5IG9mIER1YmxpbiAtIGxhaWQgb3V0IGZvciBidWlsZGluZywgTmljaG9sYXMgU3RyZWV0LCBTa2lubmVycyBSb3cgYW5kIFdlcmJ1cmdoIFN0cmVldCBCeSBBLiBSLiBOZXZpbGxlLCBDLiBTLiBEYXRlOiAxODEyXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODEyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNjU0XCIsIFwieFwiOiAtMzk3LjUsIFwieVwiOiA0MDksIFwiem9vbVhcIjogMC4xMjIsIFwiem9vbVlcIjogMC4xMjIsIFwicm90YXRpb25cIjogLTAuMTM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTY1NC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiB0aGUgZ3JvdW5kIHBsb3RzIG9mIHNldmVyYWwgaG9sZGluZ3MgYmVsb25naW5nIHRvIHRoZSBDaXR5IG9mIER1YmxpbiwgTWFkYW0gT+KAmUhhcmEsIENvbG9uZWwgQmVycnkgYW5kIG90aGVycywgb24gQmFjayBRdWF5IC0gKEVzc2V4IFF1YXkpIEJsaW5kIFF1YXkgLSBFeGNoYW5nZSBTdHJlZXQsIEVzc2V4IEJyaWRnZSwgQ3JhbmUgTGFuZSBhbmQgRGFtZSBTdHJlZXQsIFN5Y2Ftb3JlIEFsbGV5IC0gc2hvd2luZyBwb3J0aW9uIG9mIHRoZSBDaXR5IFdhbGwsIEVzc2V4IEdhdGUsIERhbWUgR2F0ZSwgRGFtZXMgTWlsbCBhbmQgYnJhbmNoIG9mIHRoZSBSaXZlciBEb2RkZXJcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTcwNVwiLCBcInhcIjogLTE4Ny41LCBcInlcIjogMzkyLCBcInpvb21YXCI6IDAuMDQsIFwiem9vbVlcIjogMC4wNDIsIFwicm90YXRpb25cIjogLTAuMzgsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNzA1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIEVzc2V4IFN0cmVldCBhbmQgdmljaW5pdHkgRGF0ZTogMTgwNlwiLCBcblx0XHRcImRhdGVcIjogMTgwNlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTcyNVwiLCBcInhcIjogLTY1NCwgXCJ5XCI6IDIyNiwgXCJ6b29tWFwiOiAwLjA5NCwgXCJ6b29tWVwiOiAwLjA5NCwgXCJyb3RhdGlvblwiOiAwLjA3LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTcyNS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNodXJjaCBTdHJlZXQsIENoYXJsZXMgU3RyZWV0LCBJbm7igJlzIFF1YXkgLSAnV2hpdGUgQ3Jvc3MgSW5uJyAtIHJlcmUgb2YgRm91ciBDb3VydHMgLSBVc2hlcnPigJkgUXVheSwgTWVyY2hhbnTigJlzIFF1YXksIFdvb2QgUXVheSAtIHdpdGggcmVmZXJlbmNlIERhdGU6IDE4MzNcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MzNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xOTgtMVwiLCBcInhcIjogLTQ1OS41LCBcInlcIjogNDY5LCBcInpvb21YXCI6IDAuMDI2LCBcInpvb21ZXCI6IDAuMDI2LCBcInJvdGF0aW9uXCI6IC0wLjMwNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xOTgtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBXaGl0ZWhvcnNlIFlhcmQgKFdpbmV0YXZlcm4gU3RyZWV0KSBTdXJ2ZXlvcjogQXJ0aHVyIE5ldmlsbGUgRGF0ZTogMTg0N1wiLCBcblx0XHRcImRhdGVcIjogMTg0N1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA1NVwiLCBcInhcIjogLTE3NzUsIFwieVwiOiAtMTQ0NiwgXCJ6b29tWFwiOiAxLjExLCBcInpvb21ZXCI6IDEuMTYyLCBcInJvdGF0aW9uXCI6IDAuMDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTA1NS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gb2YgTWFpbCBDb2FjaCBSb2FkLCB0aHJvdWdoIEJsZXNzaW5ndG9uIFN0cmVldCB0byBDYWJyYSwgb2YgTmV3IExpbmUgUm9hZCwgYmVpbmcgcGFydCBvZiB0aGUgTmF2YW4gVHVybnBpa2UgUm9hZCBhbmQgY29ubmVjdGluZyBhbiBpbXByb3ZlbWVudCBsYXRlbHkgbWFkZSB1cG9uIHRoYXQgTGluZSB3aXRoIHRoZSBDaXR5IG9mIER1YmxpbiAtIHNob3dpbmcgdGhlIG1vc3QgZGlyZWN0IGxpbmUgYW5kIGFsc28gYSBDaXJjdWl0b25zIGxpbmUgd2hlcmVieSB0aGUgZXhwZW5zZSBvZiBhIEJyaWRnZSBhY3Jvc3MgdGhlIFJveWFsIENhbmFsIG1heSBiZSBhdm9pZGVkLiBEb25lIGJ5IEhpcyBNYWplc3R5J3MgUG9zdCBNYXN0ZXJzIG9mIElyZWxhbmQgYnkgTXIuIExhcmtpbiBEYXRlOiAxODE4XCIsIFxuXHRcdFwiZGF0ZVwiOiAxODE4XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDYwXCIsIFwieFwiOiAtMTA0LjUsIFwieVwiOiAtMSwgXCJ6b29tWFwiOiAwLjY3NCwgXCJ6b29tWVwiOiAwLjcwMiwgXCJyb3RhdGlvblwiOiAzLjE2NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy02MC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBzaG93aW5nIHRoZSBhbHRlcmF0aW9ucyBwcm9wb3NlZCBpbiB0aGUgbmV3IGxpbmUgb2Ygcm9hZCwgbGVhZGluZyBmcm9tIER1YmxpbiB0byBOYXZhbiwgY29tbWVuY2luZyBhdCBCbGVzc2luZ3RvbiBTdHJlZXQ7IHBhc3NpbmcgYWxvbmcgdGhlIENpcmN1bGFyIFJvYWQgdG8gUHJ1c3NpYSBTdHJlZXQsIGFuZCBoZW5jZSBhbG9uZyB0aGUgVHVybnBpa2UgUm9hZCB0byBSYXRvYXRoLCBhbmQgdGVybWluYXRpbmcgYXQgdGhlIFR1cm5waWtlXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNjVcIiwgXCJ4XCI6IC01NDUuNSwgXCJ5XCI6IC0yNzUsIFwiem9vbVhcIjogMC4yOTgsIFwiem9vbVlcIjogMC4yOTIsIFwicm90YXRpb25cIjogLTEuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDY1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIHNob3dpbmcgTW91bnRqb3kgU3RyZWV0LCBEb3JzZXQgU3RyZWV0LCBEb21pbmljayBTdHJlZXQgYW5kIHZpY2luaXR5IC0gcGxhbiBvZiBTYWludCBNYXJ54oCZcyBDaGFwZWwgb2YgRWFzZSwgYW5kIHByb3Bvc2VkIG9wZW5pbmcgbGVhZGluZyB0aGVyZXVudG8gZnJvbSBHcmFuYnkgUm93IC0gVGhvbWFzIFNoZXJyYXJkIDMwIE5vdiAxODI3XCIsIFxuXHRcdFwiZGF0ZVwiOiAxODI3XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDEyXCIsIFwieFwiOiAtMTI1LjUsIFwieVwiOiAxNDkuNSwgXCJ6b29tWFwiOiAwLjA0NCwgXCJ6b29tWVwiOiAwLjA0NCwgXCJyb3RhdGlvblwiOiAtMC4yMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wMTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcHJlbWlzZXMgTG93ZXIgQWJiZXkgU3RyZWV0LCBMb3dlciBTYWNrdmlsbGUgU3RyZWV0IGFuZCBFZGVuIFF1YXlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAxNFwiLCBcInhcIjogLTE1NTUuNSwgXCJ5XCI6IDI3LCBcInpvb21YXCI6IDAuMTQsIFwiem9vbVlcIjogMC4xNCwgXCJyb3RhdGlvblwiOiAwLjA1NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wMTQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJBIHN1cnZleSBvZiBncm91bmQgY29udGlndW91cyB0byB0aGUgSG9yc2UgQmFycmFja3MsIER1YmxpbiAtIHNob3dpbmcgTW9udHBlbGllciBIaWxsLCBCYXJyYWNrIFN0cmVldCwgUGFya2dhdGUgU3RyZWV0IGFuZCBlbnZpcm9ucyAoVGhvbWFzIFNoZXJyYXJkKSBEYXRlOiAxNzkwXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzkwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDE1XCIsIFwieFwiOiAtMTQxNC41LCBcInlcIjogMjksIFwiem9vbVhcIjogMC4xMTYsIFwiem9vbVlcIjogMC4xMTIsIFwicm90YXRpb25cIjogMC4wNzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDE1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQXJib3VyIEhpbGwsIFJveWFsIEJhcnJhY2tzIGFuZCB2aWNpbml0eS4gV2l0aCByZWZlcmVuY2UuIERhdGU6IDE3OTBcIixcblx0XHRcImRhdGVcIjogMTc5MFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAxNlwiLCBcInhcIjogLTg0NywgXCJ5XCI6IDIzMS41LCBcInpvb21YXCI6IDAuMDM4LCBcInpvb21ZXCI6IDAuMDM4LCBcInJvdGF0aW9uXCI6IDAuMDk1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTAxNi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCAtIEFycmFuIFF1YXksIFF1ZWVuIFN0cmVldCBEYXRlOjE3OTBcIixcblx0XHRcImRhdGVcIjogMTc5MCxcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMTdcIiwgXCJ4XCI6IC01NjQsIFwieVwiOiA0NDAsIFwiem9vbVhcIjogMC4wNjgsIFwiem9vbVlcIjogMC4wNiwgXCJyb3RhdGlvblwiOiAzLjM5LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTAxNy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkFycmFuIFF1YXksIENodXJjaCBTdHJlZXRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAxOFwiLCBcInhcIjogLTE5NCwgXCJ5XCI6IC0zOTUuNSwgXCJ6b29tWFwiOiAwLjEyLCBcInpvb21ZXCI6IDAuMTIsIFwicm90YXRpb25cIjogLTAuNjMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDE4LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIEJhcmxleSBmaWVsZHMgZXRjLiAoRG9yc2V0IFN0cmVldCkuIFBsYW4gb2Ygb3BlbmluZyBhIHN0cmVldCBmcm9tIFJ1dGxhbmQgU3F1YXJlIHRvIERvcnNldCBTdHJlZXQgLSAoUGFsYWNlIFJvdyBhbmQgR2FyZGluZXJzIFJvdykgLSBUaG9tYXMgU2hlcnJhcmQgRGF0ZTogMTc4OVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDI1XCIsIFwieFwiOiAtMTAxMCwgXCJ5XCI6IDEwNSwgXCJ6b29tWFwiOiAwLjEyLCBcInpvb21ZXCI6IDAuMTIsIFwicm90YXRpb25cIjogMC4xNiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wMjUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJCbGFja2hhbGwgUGxhY2UgLSBOZXcgU3RyZWV0IHRvIHRoZSBRdWF5XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNTdcIiwgXCJ4XCI6IC0yMjQsIFwieVwiOiAzMzAuNSwgXCJ6b29tWFwiOiAwLjA4NCwgXCJ6b29tWVwiOiAwLjA4NCwgXCJyb3RhdGlvblwiOiAyLjg2NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wNTcucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIHN0cmVldHMgYWJvdXQgTWFyeeKAmXMgQWJiZXkgYW5kIEJvb3QgTGFuZSAtIChPbGQgQmFuaykgRGF0ZTogMTgxMVwiLCBcblx0XHRcImRhdGVcIjogMTgxMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA2M1wiLCBcInhcIjogLTg4LjUsIFwieVwiOiAyNi41LCBcInpvb21YXCI6IDAuMywgXCJ6b29tWVwiOiAwLjMsIFwicm90YXRpb25cIjogLTIuMTQ1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTA2My5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkVsZXZhdGlvbiBvZiB0aGUgd2VzdCBmcm9udCBhbmQgcGxhbiBvZiBNb3VudGpveSBTcXVhcmUgbGFpZCBvdXQgb24gdGhlIHJpc2luZyBncm91bmQsIG5lYXIgR2Vvcmdl4oCZcyBDaHVyY2ggLSB0aGUgZXN0YXRlIG9mIHRoZSBSaWdodCBIb24uIEx1a2UgR2FyZGluZXIsIGFuZCBub3cgKDE3ODcpLCB0byBiZSBsZXQgZm9yIGJ1aWxkaW5nIC0gTG9yZCBNb3VudGpveeKAmXMgcGxhbi4gRGF0ZTogMTc4N1wiLCBcblx0XHRcImRhdGVcIjogMTc4N1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA4Ny0yXCIsIFwieFwiOiAtMTcyLjUsIFwieVwiOiAxNDE5LCBcInpvb21YXCI6IDAuMDg2LCBcInpvb21ZXCI6IDAuMDg2LCBcInJvdGF0aW9uXCI6IC0xLjY5NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wODctMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNhbWRlbiBTdHJlZXQgVXBwZXIgYW5kIENoYXJsb3R0ZSBTdHJlZXQgRGF0ZTogMTg0MVwiLCBcblx0XHRcImRhdGVcIjogMTg0MVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA5MFwiLCBcInhcIjogLTI2MSwgXCJ5XCI6IDUwNSwgXCJ6b29tWFwiOiAwLjA3NCwgXCJ6b29tWVwiOiAwLjA2NiwgXCJyb3RhdGlvblwiOiAtMC4yMywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wOTAucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDYXN0bGUgWWFyZCwgQ2FzdGxlIFN0cmVldCwgRGFtZSBTdHJlZXQsIFBhcmxpYW1lbnQgU3RyZWV0IGFuZCB2aWNpbml0eSBEYXRlOiAxNzY0XCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzY0XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTAwLTJcIiwgXCJ4XCI6IC01MjgsIFwieVwiOiA0NjQsIFwiem9vbVhcIjogMC4wNzgsIFwiem9vbVlcIjogMC4wNzgsIFwicm90YXRpb25cIjogLTAuMjcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTAwLTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcHJlbWlzZXMgdG8gYmUgdmFsdWVkIGJ5IEp1cnk7IENvY2sgSGlsbCwgTWljaGFlbOKAmXMgTGFuZSwgV2luZXRhdmVybiBTdHJlZXQsIEpvaG7igJlzIExhbmUsIENocmlzdGNodXJjaCwgUGF0cmljayBTdHJlZXQgYW5kIFBhdHJpY2vigJlzIENsb3NlIERhdGU6IDE4MTNcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MTNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMDNcIiwgXCJ4XCI6IDk5LjUsIFwieVwiOiA1NjYsIFwiem9vbVhcIjogMC4wNjIsIFwiem9vbVlcIjogMC4wNiwgXCJyb3RhdGlvblwiOiAtMy4xNTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTAzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIFNvdXRoIFNpZGUgb2YgQ29sbGVnZSBHcmVlbiBhbmQgdmljaW5pdHkgRGF0ZTogMTgwOFwiLFxuXHRcdFwiZGF0ZVwiOiAxODA4XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTQ5LTFcIiwgXCJ4XCI6IC0xMDkxLCBcInlcIjogNTE1LjUsIFwiem9vbVhcIjogMC4wNjIsIFwiem9vbVlcIjogMC4wNiwgXCJyb3RhdGlvblwiOiAwLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE0OS0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gSmFtZXPigJlzIEdhdGUsIEphbWVzIFN0cmVldCwgVGhvbWFzIFN0cmVldCBhbmQgV2F0bGluZyBTdHJlZXQuIE1yLiBHdWlubmVzc+KAmXMgUGxhY2UgRGF0ZTogMTg0NVwiLCBcblx0XHRcImRhdGVcIjogMTg0NVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE0OS0yXCIsIFwieFwiOiAtMTA3NC41LCBcInlcIjogNDg4LCBcInpvb21YXCI6IDAuMDQ0LCBcInpvb21ZXCI6IDAuMDQ4LCBcInJvdGF0aW9uXCI6IDAsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTQ5LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBKYW1lc+KAmXMgR2F0ZSwgSmFtZXMgU3RyZWV0LCBUaG9tYXMgU3RyZWV0IGFuZCBXYXRsaW5nIFN0cmVldC4gTXIuIEd1aW5uZXNz4oCZcyBQbGFjZSBEYXRlOiAxODQ1XCIsIFxuXHRcdFwiZGF0ZVwiOiAxODQ1XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjU0XCIsIFwieFwiOiAtNDM4LCBcInlcIjogLTE0MiwgXCJ6b29tWFwiOiAwLjExOCwgXCJ6b29tWVwiOiAwLjEyLCBcInJvdGF0aW9uXCI6IC0wLjQxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yNTQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgTWFiYm90IFN0cmVldCwgTW9udGdvbWVyeSBTdHJlZXQsIERvbWluaWNrIFN0cmVldCwgQ2hlcnJ5IExhbmUsIENyb3NzIExhbmUgYW5kIFR1cm4tYWdhaW4tTGFuZSBEYXRlOiAxODAxXCIsXG5cdFx0XCJkYXRlXCI6IDE4MDFcblx0fVxuXVxuIiwiaW1wb3J0IHsgQ2FudmFzVmlldyB9IGZyb20gXCIuL2d0d28vY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgU3RhdGljSW1hZ2UgfSBmcm9tIFwiLi9ndHdvL3N0YXRpY1wiO1xuaW1wb3J0IHsgQ29udGFpbmVyTGF5ZXIgfSBmcm9tIFwiLi9ndHdvL2xheWVyXCI7XG5pbXBvcnQgeyBCYXNpY1RyYW5zZm9ybSB9IGZyb20gXCIuL2d0d28vdmlld1wiO1xuaW1wb3J0IHsgU3RhdGljR3JpZCB9IGZyb20gXCIuL2d0d28vZ3JpZFwiO1xuaW1wb3J0IHsgVmlld0NvbnRyb2xsZXIgfSBmcm9tIFwiLi9ndHdvL3ZpZXdjb250cm9sbGVyXCI7XG5pbXBvcnQgeyBab29tRGlzcGxheVJhbmdlIH0gZnJvbSBcIi4vZ3R3by9jYW52YXN2aWV3XCI7XG5pbXBvcnQgeyBJbWFnZUNvbnRyb2xsZXIsIERpc3BsYXlFbGVtZW50Q29udHJvbGxlciB9IGZyb20gXCIuL2d0d28vaW1hZ2Vjb250cm9sbGVyXCI7XG5pbXBvcnQgeyBUaWxlTGF5ZXIsIFRpbGVTdHJ1Y3QsIHpvb21CeUxldmVsfSBmcm9tIFwiLi9ndHdvL3RpbGVsYXllclwiO1xuaW1wb3J0IHsgTGF5ZXJNYW5hZ2VyLCBDb250YWluZXJMYXllck1hbmFnZXIsIGRhdGVGaWx0ZXIsIGRhdGVsZXNzRmlsdGVyIH0gZnJvbSBcbiAgXCIuL2d0d28vbGF5ZXJtYW5hZ2VyXCI7XG5pbXBvcnQgeyBMYXllckNvbnRyb2xsZXIgfSBmcm9tIFwiLi9ndHdvL2xheWVyY29udHJvbGxlclwiO1xuXG5pbXBvcnQgKiBhcyBmaXJlbWFwcyBmcm9tIFwiLi9pbWFnZWdyb3Vwcy9maXJlbWFwcy5qc29uXCI7XG5pbXBvcnQgKiBhcyBsYW5kbWFya3MgZnJvbSBcIi4vaW1hZ2Vncm91cHMvbGFuZG1hcmtzLmpzb25cIjtcbmltcG9ydCAqIGFzIHdzYyBmcm9tIFwiLi9pbWFnZWdyb3Vwcy93c2NkLmpzb25cIjtcblxubGV0IGVhcmx5RGF0ZXMgPSBkYXRlRmlsdGVyKHdzYywgMTY4MCwgMTc5Mik7XG5sZXQgbWlkRGF0ZXMgPSBkYXRlRmlsdGVyKHdzYywgMTc5MywgMTgyMCk7XG5sZXQgbGF0ZURhdGVzID0gZGF0ZUZpbHRlcih3c2MsIDE4MjEsIDE5MDApO1xubGV0IG90aGVyRGF0ZXMgPSBkYXRlbGVzc0ZpbHRlcih3c2MpO1xuXG5sZXQgbGF5ZXJTdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgwLCAwLCAxLCAxLCAwKTtcbmxldCBpbWFnZUxheWVyID0gbmV3IENvbnRhaW5lckxheWVyKGxheWVyU3RhdGUpO1xuXG5sZXQgaW1hZ2VTdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtMTQ0MCwtMTQ0MCwgMC4yMjIsIDAuMjIyLCAwKTtcblxubGV0IGNvdW50eVN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0zNjU1LCAtMzU4Ny41LCAxLjcxNiwgMS42NzQsIDApO1xubGV0IGNvdW50eUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKGNvdW50eVN0YXRlLCBcbiAgICBcImltYWdlcy9Db3VudHlfb2ZfdGhlX0NpdHlfb2ZfRHVibGluXzE4MzdfbWFwLnBuZ1wiLCAwLjUsIHRydWUpO1xuXG5sZXQgYmdTdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtMTEyNiwtMTA4NiwgMS41OCwgMS41NSwgMCk7XG5sZXQgYmdJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZShiZ1N0YXRlLCBcImltYWdlcy9mbXNzLmpwZWdcIiwgLjYsIHRydWUpO1xuXG5sZXQgdG1TdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtMTAzMy41LDE0OSwgMC41OSwgMC41OSwgMCk7XG5sZXQgdG1JbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSh0bVN0YXRlLCBcImltYWdlcy90aGluZ21vdC5wbmdcIiwgLjMsIHRydWUpO1xuXG5sZXQgZHVTdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtOTI5LC0xMDUuNSwgMC40NjQsIDAuNTA2LCAwKTtcbmxldCBkdUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKGR1U3RhdGUsIFwiaW1hZ2VzL2R1YmxpbjE2MTAuanBnXCIsIC4zLCBmYWxzZSk7XG5cbmxldCBncmlkVHJhbnNmb3JtID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDEsIDEsIDApO1xubGV0IHN0YXRpY0dyaWQgPSBuZXcgU3RhdGljR3JpZChncmlkVHJhbnNmb3JtLCAxLCBmYWxzZSwgMjU2LCAyNTYpO1xuXG5sZXQgc2VudGluZWxTdHJ1Y3QgPSBuZXcgVGlsZVN0cnVjdChcInF0aWxlL2R1Ymxpbi9cIiwgXCIucG5nXCIsIFwiaW1hZ2VzL3F0aWxlL2R1Ymxpbi9cIik7XG5cbmxldCBzZW50aW5lbFRyYW5zZm9ybSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgwLCAwLCAyLCAyLCAwKTtcbmxldCB6b29tRGlzcGxheSA9IG5ldyBab29tRGlzcGxheVJhbmdlKDAuOCwgNCk7XG5cbmxldCBzZW50aW5lbExheWVyID0gbmV3IFRpbGVMYXllcihzZW50aW5lbFRyYW5zZm9ybSwgc2VudGluZWxTdHJ1Y3QsIHRydWUsIHpvb21EaXNwbGF5LCBcbiAgIDE1ODE2LCAxMDYyNCwgMTUpO1xuXG5sZXQgc2VudGluZWxCVHJhbnNmb3JtID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDQsIDQsIDApO1xubGV0IHpvb21CRGlzcGxheSA9IG5ldyBab29tRGlzcGxheVJhbmdlKC4yLCAwLjgpO1xubGV0IHNlbnRpbmVsQkxheWVyID0gbmV3IFRpbGVMYXllcihzZW50aW5lbEJUcmFuc2Zvcm0sIHNlbnRpbmVsU3RydWN0LCB0cnVlLCB6b29tQkRpc3BsYXksIFxuICAgNzkwOCwgNTMxMiwgMTQpO1xuXG5sZXQgc2VudGluZWxDVHJhbnNmb3JtID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDgsIDgsIDApO1xubGV0IHpvb21DRGlzcGxheSA9IG5ldyBab29tRGlzcGxheVJhbmdlKC4wNCwgLjIpO1xubGV0IHNlbnRpbmVsU0xheWVyID0gbmV3IFRpbGVMYXllcihzZW50aW5lbENUcmFuc2Zvcm0sIHNlbnRpbmVsU3RydWN0LCB0cnVlLCB6b29tQ0Rpc3BsYXksIFxuICAgIDM5NTQsIDI2NTYsIDEzKTtcblxubGV0IHJlY2VudHJlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0xMDI0LCAtMTUzNiwgMSwgMSwgMCk7XG5sZXQgc2VudGluZWxDb250YWluZXJMYXllciA9IG5ldyBDb250YWluZXJMYXllcihyZWNlbnRyZSk7XG5zZW50aW5lbENvbnRhaW5lckxheWVyLnNldChcInpvb21JblwiLCBzZW50aW5lbExheWVyKTtcbnNlbnRpbmVsQ29udGFpbmVyTGF5ZXIuc2V0KFwiem9vbU1pZFwiLCBzZW50aW5lbEJMYXllcik7XG5zZW50aW5lbENvbnRhaW5lckxheWVyLnNldChcInpvb21PdXRcIiwgc2VudGluZWxTTGF5ZXIpO1xuXG5sZXQgZWRpdENvbnRhaW5lckxheWVyID0gbmV3IENvbnRhaW5lckxheWVyKEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0pO1xuXG4vL2ltYWdlTGF5ZXIuc2V0KFwiY291bnR5XCIsIGNvdW50eUltYWdlKTtcbmltYWdlTGF5ZXIuc2V0KFwiYmFja2dyb3VuZFwiLCBiZ0ltYWdlKTtcblxubGV0IGxheWVyTWFuYWdlciA9IG5ldyBMYXllck1hbmFnZXIoKTtcblxuLy9sZXQgcmVjZW50cmVMYXllcnMgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oLTEwMjQsIC0xNTM2LCAxLCAxLCAwKTtcblxubGV0IGZpcmVtYXBMYXllciA9IGxheWVyTWFuYWdlci5hZGRMYXllcihmaXJlbWFwcywgXCJmaXJlbWFwc1wiKTtcbmxldCBsYW5kbWFya3NMYXllciA9IGxheWVyTWFuYWdlci5hZGRMYXllcihsYW5kbWFya3MsIFwibGFuZG1hcmtzXCIpO1xubGV0IHdzY0Vhcmx5TGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkTGF5ZXIoZWFybHlEYXRlcywgXCJ3c2NfZWFybHlcIik7XG5sZXQgd3NjTWlkTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkTGF5ZXIobWlkRGF0ZXMsIFwid3NjX21pZFwiKTtcbndzY01pZExheWVyLnNldFZpc2libGUoZmFsc2UpO1xubGV0IHdzY0xhdGVMYXllciA9IGxheWVyTWFuYWdlci5hZGRMYXllcihsYXRlRGF0ZXMsIFwid3NjX2xhdGVcIik7XG53c2NMYXRlTGF5ZXIuc2V0VmlzaWJsZShmYWxzZSk7XG5sZXQgd3NjT3RoZXJMYXllciA9IGxheWVyTWFuYWdlci5hZGRMYXllcihvdGhlckRhdGVzLCBcIndzY19vdGhlclwiKTtcbndzY090aGVyTGF5ZXIuc2V0VmlzaWJsZShmYWxzZSk7XG5cbmxldCBlZGl0ID0gd3NjRWFybHlMYXllci5nZXQoXCJ3c2MtMzYxXCIpO1xuXG5sZXQgY29udGFpbmVyTGF5ZXJNYW5hZ2VyID0gbmV3IENvbnRhaW5lckxheWVyTWFuYWdlcih3c2NFYXJseUxheWVyLCBlZGl0Q29udGFpbmVyTGF5ZXIpO1xubGV0IG91dGxpbmVMYXllciA9IGNvbnRhaW5lckxheWVyTWFuYWdlci5zZXRTZWxlY3RlZChcIndzYy0zNjFcIik7XG5cbmltYWdlTGF5ZXIuc2V0KFwid3NjX290aGVyXCIsIHdzY090aGVyTGF5ZXIpO1xuaW1hZ2VMYXllci5zZXQoXCJ3c2NfZWFybHlcIiwgd3NjRWFybHlMYXllcik7XG5pbWFnZUxheWVyLnNldChcIndzY19taWRcIiwgd3NjTWlkTGF5ZXIpO1xuaW1hZ2VMYXllci5zZXQoXCJ3c2NfbGF0ZVwiLCB3c2NMYXRlTGF5ZXIpO1xuXG5pbWFnZUxheWVyLnNldChcImZpcmVtYXBzXCIsIGZpcmVtYXBMYXllcik7XG5cbmltYWdlTGF5ZXIuc2V0KFwiZHVibGluMTYxMFwiLCBkdUltYWdlKTtcbmltYWdlTGF5ZXIuc2V0KFwidGhpbmdtb3RcIiwgdG1JbWFnZSk7XG5pbWFnZUxheWVyLnNldChcImxhbmRtYXJrc1wiLCBsYW5kbWFya3NMYXllcik7XG5cbndzY0Vhcmx5TGF5ZXIuc2V0VG9wKFwid3NjLTM2MVwiKTtcblxuZnVuY3Rpb24gc2hvd01hcChkaXZOYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGNhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChkaXZOYW1lKTtcblxuICAgIGxldCB4ID0gb3V0bGluZUxheWVyLng7XG4gICAgbGV0IHkgPSBvdXRsaW5lTGF5ZXIueTtcblxuICAgIGxldCBjYW52YXNUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oeCAtIDIwMCwgeSAtIDIwMCwgMC41LCAwLjUsIDApO1xuICAgIGxldCBjYW52YXNWaWV3ID0gbmV3IENhbnZhc1ZpZXcoY2FudmFzVHJhbnNmb3JtLCBjYW52YXMuY2xpZW50V2lkdGgsIGNhbnZhcy5jbGllbnRIZWlnaHQsIGNhbnZhcyk7XG5cbiAgICBjYW52YXNWaWV3LmxheWVycy5wdXNoKHNlbnRpbmVsQ29udGFpbmVyTGF5ZXIpO1xuICAgIGNhbnZhc1ZpZXcubGF5ZXJzLnB1c2goaW1hZ2VMYXllcik7XG4gICAgY2FudmFzVmlldy5sYXllcnMucHVzaChzdGF0aWNHcmlkKTtcbiAgICBjYW52YXNWaWV3LmxheWVycy5wdXNoKGVkaXRDb250YWluZXJMYXllcik7XG5cbiAgICBsZXQgdGlsZUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHNlbnRpbmVsQ29udGFpbmVyTGF5ZXIsIFwidlwiKTtcbiAgICBsZXQgYmFzZUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGJnSW1hZ2UsIFwiQlwiKTtcbiAgICBsZXQgY291bnR5Q29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgY291bnR5SW1hZ2UsIFwiVlwiKTtcbiAgICBsZXQgZmlyZW1hcENvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGZpcmVtYXBMYXllciwgXCJiXCIpO1xuICAgIGxldCB3c2NFYXJseUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHdzY0Vhcmx5TGF5ZXIsIFwiMVwiKTtcbiAgICBsZXQgd3NjTGF0ZUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHdzY01pZExheWVyLCBcIjJcIik7XG4gICAgbGV0IHdzY01pZENvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHdzY0xhdGVMYXllciwgXCIzXCIpO1xuICAgIGxldCB3c2NPdGhlckNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHdzY090aGVyTGF5ZXIsIFwiNFwiKTtcbiAgICBsZXQgbGFuZG1hcmtDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBsYW5kbWFya3NMYXllciwgXCJtXCIpO1xuICAgIGxldCB0bUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHRtSW1hZ2UsIFwiblwiKTtcbiAgICBsZXQgZHVDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBkdUltYWdlLCBcIk1cIik7XG4gICAgbGV0IGdyaWRDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBzdGF0aWNHcmlkLCBcImdcIik7XG5cbiAgICBsZXQgY29udHJvbGxlciA9IG5ldyBWaWV3Q29udHJvbGxlcihjYW52YXNWaWV3LCBjYW52YXMsIGNhbnZhc1ZpZXcpO1xuXG4gICAgbGV0IGltYWdlQ29udHJvbGxlciA9IG5ldyBJbWFnZUNvbnRyb2xsZXIoY2FudmFzVmlldywgZWRpdCk7XG5cbiAgICBpbWFnZUNvbnRyb2xsZXIuc2V0TGF5ZXJPdXRsaW5lKG91dGxpbmVMYXllcik7XG5cbiAgICBsZXQgbGF5ZXJDb250cm9sbGVyID0gbmV3IExheWVyQ29udHJvbGxlcihjYW52YXNWaWV3LCBjb250YWluZXJMYXllck1hbmFnZXIpO1xuXG4gICAgZHJhd01hcChjYW52YXNWaWV3KTtcblxufVxuXG5mdW5jdGlvbiBkcmF3TWFwKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcpe1xuICAgIGlmICghY2FudmFzVmlldy5kcmF3KCkgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiSW4gdGltZW91dFwiKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpeyBkcmF3TWFwKGNhbnZhc1ZpZXcpfSwgNTAwKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNob3coKXtcblx0c2hvd01hcChcImNhbnZhc1wiLCBcIlR5cGVTY3JpcHRcIik7XG59XG5cbmlmIChcbiAgICBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgfHxcbiAgICAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gXCJsb2FkaW5nXCIgJiYgIWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5kb1Njcm9sbClcbikge1xuXHRzaG93KCk7XG59IGVsc2Uge1xuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBzaG93KTtcbn0iXX0=
