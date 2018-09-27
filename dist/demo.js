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
    setEditInfoPane(editInfoPane) {
        this.editInfoPane = editInfoPane;
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
        if (this.editInfoPane != undefined) {
            this.editInfoPane.innerHTML = '"name": "wsc-100-2", "x": ' +
                this.canvasLayer.x +
                ', "y": ' + this.canvasLayer.y +
                ', "zoomX": ' + this.canvasLayer.zoomX +
                ', "zoomY": ' + this.canvasLayer.zoomY +
                ', "rotation": ' + this.canvasLayer.rotation;
        }
        else {
            console.log('"name": "wsc-100-2", "x": ' + this.canvasLayer.x +
                ', "y": ' + this.canvasLayer.y +
                ', "zoomX": ' + this.canvasLayer.zoomX +
                ', "zoomY": ' + this.canvasLayer.zoomY +
                ', "rotation": ' + this.canvasLayer.rotation);
        }
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
		"name": "wsc-032", "x": -745, "y": 10.05, "zoomX": 0.25, "zoomY": 0.25, "rotation": -1.43, 
		"src": "images/wsc/wsc-maps-032-m.png", "visible": true, "opacity": 0.7, 
		"description": "Constitution Hill - Turnpike, Glasnevin Road; showing proposed road to Botanic Gardens",
		"date": 1798
	},
	{
		"name": "wsc-072",  "x": -260.5, "y": -247.5, "zoomX": 0.31, "zoomY": 0.31, "rotation": 1.585,
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
		"name": "wsc-142", "x": 94.995, "y": 2377.5, "zoomX": 0.482, "zoomY": 0.476, "rotation": -2.015, 
		"src": "images/wsc/wsc-maps-142-l.png", "visible": true, "opacity": 1.0,
		"description": "Map of the New Streets, and other improvements intended to be immediately executed. Situate on the South Side of the City of Dublin, submitted for the approbation of the Commissioners of Wide Streets, particularly of those parts belonging to Wm. Cope and John Locker, Esq., Harcourt Street, Charlemount Street, Portobello, etc. Date: 1792",
		"date": 1792
	},
	{
		"name": "wsc-155", "x": -1506, "y": -50.5, "zoomX": 0.67, "zoomY": 0.644, "rotation": -0.025, 
		"src": "images/wsc/wsc-maps-155-l.png", "visible": true, "opacity": 0.6,
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
		"name": "wsc-729", "x": -1096, "y": 669, "zoomX": 0.126, "zoomY": 0.118, "rotation": -3.425, 
		"src": "images/wsc/wsc-maps-729-l.png", "visible": true, "opacity": 0.8, 
		"description": "Map - James’s Street, Bason Lane, Echlin’s Lane, Grand Canal Place, City Bason and Grand Canal Harbour"
	},
	{
		"name": "wsc-757", "x": -881, "y": 261.5, "zoomX": 0.355, "zoomY": 0.355, "rotation": -0.025, 
		"src": "images/wsc/wsc-maps-757-l.png", "visible": true, "opacity": 0.5, 
		"description": "Part of the City of Dublin with proposed improvements. Improvements to be made or intended in Thomas Street, High Street, Winetavern Street, Skinner Row, Werburgh Street, Canon Street, Patrick Street, Kevin Street, Bishop Street and The Coombe Thomas Sherrard Date: 1817",
		"date": 1817
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
		"name": "wsc-329", "x": -670.5, "y": 347, "zoomX": 0.338, "zoomY": 0.332, "rotation": -0.21, 
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
		"src": "images/wsc/wsc-334.png", "visible": true, "opacity": 0.5,
		"description": "Dame Street, College Green, George’s Lane, George’s Street, Chequer Street and avenues thereof",
		"date": 1778
	},
	{
		"name": "wsc-355-2", "x": 185, "y": 1029, "zoomX": 0.302, "zoomY": 0.302, "rotation": -0.45, 
		"src": "images/wsc/wsc-355-2.png", "visible": true, "opacity": 0.7,
		"description": "Plan of Baggot Street and Fitzwilliam Street, showing avenues thereof No. 2 Date: 1792",
		"date": 1792
	},
	{
		"name": "wsc-368", "x": -687.5, "y": 273.5, "zoomX": 0.156, "zoomY": 0.15, "rotation": 0.12, 
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
		"date": 1826
	},
	{
		"name": "wsc-725", "x": -653.5, "y": 222.5, "zoomX": 0.094, "zoomY": 0.094, "rotation": 0.07,
		"src": "images/wsc/wsc-725.png", "visible": true, "opacity": 0.5,
		"description": "Church Street, Charles Street, Inn’s Quay - 'White Cross Inn' - rere of Four Courts - Ushers’ Quay, Merchant’s Quay, Wood Quay - with reference Date: 1833", 
		"date": 1833
	},
	{
		"name": "wsc-198-1", "x": -462, "y": 476, "zoomX": 0.032, "zoomY": 0.032, "rotation": -0.345, 
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
	},
	{
		"name": "wsc-106-1", "x": -757, "y": 495.5, "zoomX": 0.265, "zoomY": 0.265, "rotation": -0.074, 
		"src": "images/wsc/wsc-maps-106-1.png", "visible": true, "opacity": 0.8, 
		"description": "Map showing proposed improvements to be made in Cornmarket, Cutpurse Row, Lamb Alley - Francis Street - and an improved entrance from Kevin Street to Saint Patrick’s Cathedral, through Mitre Alley and at James’s Gate. Date: 1845-46 ",
		"date": 1845
	},
	{
		"name": "wsc-146-1", "x": -683, "y": 471, "zoomX": 0.082, "zoomY": 0.082, "rotation": -0.1,
		"src": "images/wsc/wsc-146-1.png", "visible": true, "opacity": 0.5,
		"description": "Map and tracing of premises in Cornmarket, Cutpurse Row and vicinity Date: 1849",
		"date": 1849
	},
	{
		"name": "wsc-600", "x": 139.5, "y": 758, "zoomX": 0.062, "zoomY": 0.062, "rotation": -0.415,
		"src": "images/wsc/wsc-600.png", "visible": true, "opacity": 0.9,
		"description": "Map of the ground etc., of the Mansion House, Dawson Street Date: 1781",
		"date": 1781
	},
	{
		"name": "wsc-348", "x": -1345.5, "y": 493, "zoomX": 0.4, "zoomY": 0.478, "rotation": -0.075,
		"src": "images/wsc/wsc-348.png", "visible": true, "opacity": 0.6,
		"description": "Map of part of the City of Dublin near the Grand Canal - showing improvements and approaches made, and those proposed to be made; and the situation of the following streets viz: - Bason Lane; Canal Place; Portland Street; Rainsford Street; Crane Lane; Bellview; Thomas Court; Hanbury Lane; Meath Row; Meath Street; Earl Street West; Waggon Lane; Crawley`s Yard; Robert Street; Market Street; Bond Street; Canal Bank, Newport Street; Marrowbone Lane, Summer Street; Braithwaite Street; Pimblico, Tripolo (site of Old Court House), near Thomas Court; Cole Alley; Swifts Alley; Crostick Alley; Elbow Lane; Upper Coombe and Tenter's Fields Date: 1787",
		"date": 1787
	},
	{
		"name": "wsc-433-2", "x": -536.5, "y": 870.5, "zoomX": 0.058, "zoomY": 0.058, "rotation": -0.01,
		"src": "images/wsc/wsc-433-2.png", "visible": true, "opacity": 0.7,
		"description": "Map - Coombe, Francis Street, New Row, Cross Poddle (now Dean Street), Three-Stone-Alley (now the lower end of New Street), Patrick Street, Patrick’s Close, Kevin Street and Mitre Alley Date: 1824-28",
		"date": 1824
	},
	{
		"name": "wsc-059", "x": -527.5, "y": -119.5, "zoomX": 0.07, "zoomY": 0.07, "rotation": -0.08,
		"src": "images/wsc/wsc-059.png", "visible": true, "opacity": 0.9,
		"description": "Ground plan of Linen Hall"
	}
]

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../logging/logger");
class GridIndex {
    constructor(gridWidth, gridHeight = gridWidth) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.logger = new logger_1.ConsoleLogger();
    }
    addLayer(canvasLayer) {
        let dimension = canvasLayer.getDimension();
        let xMin = Math.floor(dimension.x / this.gridWidth);
        let xMax = Math.ceil((dimension.x + dimension.w) / this.gridWidth);
        let yMin = Math.floor(dimension.y / this.gridHeight);
        let yMax = Math.ceil((dimension.y + dimension.h) / this.gridHeight);
        this.logger.log("GridIndex xMin: " + xMin + " xMax: " + xMax +
            " yMin: " + yMin + " yMax: " + yMax);
    }
}
exports.GridIndex = GridIndex;

},{"../logging/logger":16}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ElementLogger {
    constructor(displayElement) {
        this.displayElement = displayElement;
    }
    log(info) {
        this.displayElement.innerText = info;
    }
}
exports.ElementLogger = ElementLogger;
class ConsoleLogger {
    log(info) {
        console.log(info);
    }
}
exports.ConsoleLogger = ConsoleLogger;

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const canvasview_1 = require("./gtwo/canvasview");
const static_1 = require("./gtwo/static");
const layer_1 = require("./gtwo/layer");
const view_1 = require("./gtwo/view");
const grid_1 = require("./gtwo/grid");
const viewcontroller_1 = require("./gtwo/viewcontroller");
const canvasview_2 = require("./gtwo/canvasview");
const gridindex_1 = require("./index/gridindex");
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
let countyState = new view_1.BasicTransform(-2631, -2051.5, 1.716, 1.674, 0);
let countyImage = new static_1.StaticImage(countyState, "images/County_of_the_City_of_Dublin_1837_map.png", 0.5, true);
let bgState = new view_1.BasicTransform(-1126, -1086, 1.58, 1.55, 0);
let bgImage = new static_1.StaticImage(bgState, "images/fmss.jpeg", .6, true);
let tmState = new view_1.BasicTransform(-1033.5, 149, 0.59, 0.59, 0);
let tmImage = new static_1.StaticImage(tmState, "images/thingmot.png", .3, true);
let duState = new view_1.BasicTransform(-929, -105.5, 0.464, 0.506, 0);
let duImage = new static_1.StaticImage(duState, "images/dublin1610.jpg", .6, false);
let gridTransform = view_1.BasicTransform.unitTransform;
// new BasicTransform(0, 0, 1, 1, 0);
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
imageLayer.set("county", countyImage);
imageLayer.set("background", bgImage);
let layerManager = new layermanager_1.LayerManager();
let firemapLayer = layerManager.addLayer(firemaps, "firemaps");
let landmarksLayer = layerManager.addLayer(landmarks, "landmarks");
let wscEarlyLayer = layerManager.addLayer(earlyDates, "wsc_early");
let wscMidLayer = layerManager.addLayer(midDates, "wsc_mid");
wscMidLayer.setVisible(false);
let wscLateLayer = layerManager.addLayer(lateDates, "wsc_late");
wscLateLayer.setVisible(false);
let wscOtherLayer = layerManager.addLayer(otherDates, "wsc_other");
wscOtherLayer.setVisible(false);
let edit = wscEarlyLayer.get("wsc-334");
let indexer = new gridindex_1.GridIndex(256);
indexer.addLayer(edit);
let containerLayerManager = new layermanager_1.ContainerLayerManager(wscEarlyLayer, editContainerLayer);
let outlineLayer = containerLayerManager.setSelected("wsc-334");
imageLayer.set("wsc_other", wscOtherLayer);
imageLayer.set("wsc_early", wscEarlyLayer);
imageLayer.set("wsc_mid", wscMidLayer);
imageLayer.set("wsc_late", wscLateLayer);
imageLayer.set("firemaps", firemapLayer);
imageLayer.set("dublin1610", duImage);
imageLayer.set("thingmot", tmImage);
imageLayer.set("landmarks", landmarksLayer);
wscEarlyLayer.setTop("wsc-334");
function showMap(divName, name) {
    const canvas = document.getElementById(divName);
    const info = document.getElementById("edit_info");
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
    imageController.setEditInfoPane(info);
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

},{"./gtwo/canvasview":2,"./gtwo/grid":3,"./gtwo/imagecontroller":4,"./gtwo/layer":5,"./gtwo/layercontroller":6,"./gtwo/layermanager":7,"./gtwo/static":8,"./gtwo/tilelayer":9,"./gtwo/view":10,"./gtwo/viewcontroller":11,"./imagegroups/firemaps.json":12,"./imagegroups/landmarks.json":13,"./imagegroups/wscd.json":14,"./index/gridindex":15}]},{},[17])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2d0d28vY2FudmFzdmlldy50cyIsInNyYy9ndHdvL2dyaWQudHMiLCJzcmMvZ3R3by9pbWFnZWNvbnRyb2xsZXIudHMiLCJzcmMvZ3R3by9sYXllci50cyIsInNyYy9ndHdvL2xheWVyY29udHJvbGxlci50cyIsInNyYy9ndHdvL2xheWVybWFuYWdlci50cyIsInNyYy9ndHdvL3N0YXRpYy50cyIsInNyYy9ndHdvL3RpbGVsYXllci50cyIsInNyYy9ndHdvL3ZpZXcudHMiLCJzcmMvZ3R3by92aWV3Y29udHJvbGxlci50cyIsInNyYy9pbWFnZWdyb3Vwcy9maXJlbWFwcy5qc29uIiwic3JjL2ltYWdlZ3JvdXBzL2xhbmRtYXJrcy5qc29uIiwic3JjL2ltYWdlZ3JvdXBzL3dzY2QuanNvbiIsInNyYy9pbmRleC9ncmlkaW5kZXgudHMiLCJzcmMvbG9nZ2luZy9sb2dnZXIudHMiLCJzcmMvc2ltcGxlV29ybGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0NBLE1BQWEsT0FBTztJQU9oQixZQUFZLENBQVMsRUFBRSxDQUFTO1FBQzVCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVFLFFBQVE7UUFDSixPQUFPLFVBQVUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztJQUNyRCxDQUFDOztBQWJlLFlBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDekIsV0FBRyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUY1QywwQkFnQkM7QUFFRCxTQUFnQixNQUFNLENBQ3BCLEtBQWMs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LFNBQVMsQ0FBQztRQUM1QyxJQUFJLFFBQVEsR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUU1QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzdDLElBQUksS0FBSyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDL0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzVELElBQUksTUFBTSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFFaEQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5QyxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQy9DLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5RCxJQUFJLE9BQU8sR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFFO1FBRW5ELE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUU5QyxHQUFHLENBQUMsU0FBUyxFQUFFLENB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUUsWUFBWSxDQUFDLENBQUM7QUFDakMsQ0FBQztBQUVELElBQ0ksUUFBUSxDQUFDLFVBQVUsS0FBSyxVQUFVO0lBQ2xDLENBQUMsUUFBUSxDQUFDLFVBQVUsS0FBSyxTQUFTLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxFQUMzRTtJQUNELElBQUksRUFBRSxDQUFDO0NBQ1A7S0FBTTtJQUNOLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztDQUNwRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlxuZXhwb3J0IGNsYXNzIFBvaW50MkQge1xuICAgIHN0YXRpYyByZWFkb25seSB6ZXJvID0gbmV3IFBvaW50MkQoMCwgMCk7XG4gICAgc3RhdGljIHJlYWRvbmx5IG9uZSA9IG5ldyBQb2ludDJEKDEsIDEpO1xuXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xuICAgIHJlYWRvbmx5IHk6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG5cdH1cblxuICAgIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcIlBvaW50MkQoXCIgKyB0aGlzLnggKyBcIiwgXCIgKyB0aGlzLnkgKyBcIilcIjtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZShcbiAgcG9pbnQ6IFBvaW50MkQsIFxuICBhbmdsZTogbnVtYmVyLCBcbiAgYWJvdXQ6IFBvaW50MkQgPSBuZXcgUG9pbnQyRCgwLDApXG4pOiBQb2ludDJEIHtcblxuICAgIGxldCBzID0gTWF0aC5zaW4oYW5nbGUpO1xuICAgIGxldCBjID0gTWF0aC5jb3MoYW5nbGUpO1xuXG4gICAgbGV0IHB4ID0gcG9pbnQueCAtIGFib3V0Lng7XG4gICAgbGV0IHB5ID0gcG9pbnQueSAtIGFib3V0Lnk7XG5cbiAgICBsZXQgeG5ldyA9IHB4ICogYyArIHB5ICogcztcbiAgICBsZXQgeW5ldyA9IHB5ICogYyAtIHB4ICogcztcblxuICAgIHJldHVybiBuZXcgUG9pbnQyRCh4bmV3ICsgYWJvdXQueCwgeW5ldyArIGFib3V0LnkpO1xufVxuXG5leHBvcnQgY2xhc3MgRGltZW5zaW9uIHtcblxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyB4OiBudW1iZXIsIHB1YmxpYyB5OiBudW1iZXIsIHB1YmxpYyB3OiBudW1iZXIsIHB1YmxpYyBoOiBudW1iZXIpe31cblxuICAgIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcIkRpbWVuc2lvbihcIiArIHRoaXMueCArIFwiLCBcIiArIHRoaXMueSArIFwiLCBcIiArIHRoaXMudyArIFwiLCBcIiArIHRoaXMuaCArIFwiKVwiO1xuICAgIH1cblxufSIsImltcG9ydCB7IENhbnZhc0xheWVyIH0gZnJvbSBcIi4vbGF5ZXJcIjtcbmltcG9ydCB7IFxuXHRpbnZlcnRUcmFuc2Zvcm0sIFxuXHRWaWV3VHJhbnNmb3JtLCBcblx0QmFzaWNWaWV3VHJhbnNmb3JtLCBcblx0VHJhbnNmb3JtLCBcblx0QmFzaWNUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlzcGxheUVsZW1lbnQgZXh0ZW5kcyBUcmFuc2Zvcm0ge1xuXHRpc1Zpc2libGUoKTogYm9vbGVhbjtcblx0c2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdm9pZDtcblx0Z2V0T3BhY2l0eSgpOiBudW1iZXI7XG5cdHNldE9wYWNpdHkob3BhY2l0eTogbnVtYmVyKTogdm9pZDtcblx0Z2V0Wm9vbURpc3BsYXlSYW5nZSgpOiBab29tRGlzcGxheVJhbmdlO1xufVxuXG5leHBvcnQgY2xhc3MgWm9vbURpc3BsYXlSYW5nZSB7XG5cbiAgICBzdGF0aWMgcmVhZG9ubHkgQWxsWm9vbVJhbmdlID0gbmV3IFpvb21EaXNwbGF5UmFuZ2UoLTEsIC0xKTtcblxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgbWluWm9vbTogbnVtYmVyLCBwdWJsaWMgbWF4Wm9vbTogbnVtYmVyKXt9XG5cblx0d2l0aGluUmFuZ2Uoem9vbTogbnVtYmVyKTogQm9vbGVhbiB7XG5cdFx0cmV0dXJuICgoem9vbSA+PSB0aGlzLm1pblpvb20gfHwgdGhpcy5taW5ab29tID09IC0xKSAmJiBcblx0XHRcdCh6b29tIDw9IHRoaXMubWF4Wm9vbSB8fCB0aGlzLm1heFpvb20gPT0gLTEpKTtcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgQ2FudmFzVmlldyBleHRlbmRzIEJhc2ljVmlld1RyYW5zZm9ybSB7XG5cblx0bGF5ZXJzOiBBcnJheTxDYW52YXNMYXllcj4gPSBbXTtcblx0Y3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0bG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdFx0d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIFxuXHRcdHJlYWRvbmx5IGNhbnZhc0VsZW1lbnQ6IEhUTUxDYW52YXNFbGVtZW50KXtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLngsIGxvY2FsVHJhbnNmb3JtLnksIHdpZHRoLCBoZWlnaHQsIFxuXHRcdFx0bG9jYWxUcmFuc2Zvcm0uem9vbVgsIGxvY2FsVHJhbnNmb3JtLnpvb21ZLCBcblx0XHRcdGxvY2FsVHJhbnNmb3JtLnJvdGF0aW9uKTtcblxuXHRcdHRoaXMuaW5pdENhbnZhcygpO1xuXG5cdFx0dGhpcy5jdHggPSBjYW52YXNFbGVtZW50LmdldENvbnRleHQoXCIyZFwiKTtcblx0fVxuXG5cdHpvb21BYm91dCh4OiBudW1iZXIsIHk6IG51bWJlciwgem9vbUJ5OiBudW1iZXIpe1xuXG4gICAgICAgIHRoaXMuem9vbVggPSB0aGlzLnpvb21YICogem9vbUJ5O1xuICAgICAgICB0aGlzLnpvb21ZID0gdGhpcy56b29tWSAqIHpvb21CeTtcblxuICAgICAgICBsZXQgcmVsYXRpdmVYID0geCAqIHpvb21CeSAtIHg7XG4gICAgICAgIGxldCByZWxhdGl2ZVkgPSB5ICogem9vbUJ5IC0geTtcblxuICAgICAgICBsZXQgd29ybGRYID0gcmVsYXRpdmVYIC8gdGhpcy56b29tWDtcbiAgICAgICAgbGV0IHdvcmxkWSA9IHJlbGF0aXZlWSAvIHRoaXMuem9vbVk7XG5cbiAgICAgICAgdGhpcy54ID0gdGhpcy54ICsgd29ybGRYO1xuICAgICAgICB0aGlzLnkgPSB0aGlzLnkgKyB3b3JsZFk7XG5cblx0fVxuXG5cdGRyYXcoKTogYm9vbGVhbiB7XG5cdFx0bGV0IHRyYW5zZm9ybSA9IGludmVydFRyYW5zZm9ybSh0aGlzKTtcblxuXHRcdHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwiZ3JleVwiO1xuXHRcdHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuXHRcdHZhciBkcmF3aW5nQ29tcGxldGUgPSB0cnVlO1xuXG5cdFx0Zm9yIChsZXQgbGF5ZXIgb2YgdGhpcy5sYXllcnMpe1xuXHRcdFx0aWYgKGxheWVyLmlzVmlzaWJsZSgpKXtcblx0XHRcdFx0ZHJhd2luZ0NvbXBsZXRlID0gZHJhd2luZ0NvbXBsZXRlICYmIGxheWVyLmRyYXcodGhpcy5jdHgsIEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0sIHRoaXMpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fVxuXG5cdFx0dGhpcy5kcmF3Q2VudHJlKHRoaXMuY3R4KTtcblx0XHR0aGlzLnNob3dJbmZvKHRoaXMuY3R4KTtcblxuXHRcdHJldHVybiBkcmF3aW5nQ29tcGxldGU7XG5cdH1cblxuXHRkcmF3Q2VudHJlKGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCl7XG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIGNvbnRleHQuZ2xvYmFsQWxwaGEgPSAwLjM7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLndpZHRoLzIsIDYvMTYqdGhpcy5oZWlnaHQpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyh0aGlzLndpZHRoLzIsIDEwLzE2KnRoaXMuaGVpZ2h0KTtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8oNy8xNip0aGlzLndpZHRoLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oOS8xNip0aGlzLndpZHRoLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcbiAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XG4gICAgfVxuXG4gICAgc2hvd0luZm8oY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKXtcbiAgICBcdGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuICAgIFx0Y29udGV4dC5maWxsVGV4dChcInpvb206IFwiICsgdGhpcy56b29tWCwgMTAsIDEwKTtcbiAgICBcdGNvbnRleHQuZmlsbCgpO1xuICAgIH1cblxuXHRwcml2YXRlIGluaXRDYW52YXMoKXtcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5jYW52YXNFbGVtZW50LmNsaWVudFdpZHRoO1xuICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5jYW52YXNFbGVtZW50LmNsaWVudEhlaWdodDtcblxuICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LmhlaWdodCA9IGhlaWdodDtcblx0fVxuXG59IiwiaW1wb3J0IHsgRHJhd0xheWVyIH0gZnJvbSBcIi4vbGF5ZXJcIjtcbmltcG9ydCB7IFRyYW5zZm9ybSwgVmlld1RyYW5zZm9ybSwgY29tYmluZVRyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IERpbWVuc2lvbiB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuLyoqXG4qIFdlIGRvbid0IHdhbnQgdG8gZHJhdyBhIGdyaWQgaW50byBhIHRyYW5zZm9ybWVkIGNhbnZhcyBhcyB0aGlzIGdpdmVzIHVzIGdyaWQgbGluZXMgdGhhdCBhcmUgdG9vXG50aGljayBvciB0b28gdGhpblxuKi9cbmV4cG9ydCBjbGFzcyBTdGF0aWNHcmlkIGV4dGVuZHMgRHJhd0xheWVyIHtcblxuXHR6b29tV2lkdGg6IG51bWJlcjtcblx0em9vbUhlaWdodDogbnVtYmVyO1xuXG5cdGNvbnN0cnVjdG9yKGxvY2FsVHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHpvb21MZXZlbDogbnVtYmVyLCB2aXNpYmxlOiBib29sZWFuLFxuXHRcdHJlYWRvbmx5IGdyaWRXaWR0aDogbnVtYmVyID0gMjU2LCByZWFkb25seSBncmlkSGVpZ2h0OiBudW1iZXIgPSAyNTYpe1xuXG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0sIDEsIHZpc2libGUpO1xuXG5cdFx0bGV0IHpvb20gPSBNYXRoLnBvdygyLCB6b29tTGV2ZWwpO1xuXHRcdHRoaXMuem9vbVdpZHRoID0gZ3JpZFdpZHRoIC8gem9vbTtcblx0XHR0aGlzLnpvb21IZWlnaHQgPSBncmlkSGVpZ2h0IC8gem9vbTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBWaWV3VHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0XHRsZXQgb2Zmc2V0WCA9IHZpZXcueCAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IG9mZnNldFkgPSB2aWV3LnkgKiB2aWV3Lnpvb21ZO1xuXG5cdFx0bGV0IHZpZXdXaWR0aCA9IHZpZXcud2lkdGggLyB2aWV3Lnpvb21YO1xuXHRcdGxldCB2aWV3SGVpZ2h0ID0gdmlldy5oZWlnaHQgLyB2aWV3Lnpvb21ZO1xuXG5cdFx0bGV0IGdyaWRBY3Jvc3MgPSB2aWV3V2lkdGggLyB0aGlzLnpvb21XaWR0aDtcblx0XHRsZXQgZ3JpZEhpZ2ggPSB2aWV3SGVpZ2h0IC8gdGhpcy56b29tSGVpZ2h0O1xuXG5cdFx0bGV0IHhNaW4gPSBNYXRoLmZsb29yKHZpZXcueC90aGlzLnpvb21XaWR0aCk7XG5cdFx0bGV0IHhMZWZ0ID0geE1pbiAqIHRoaXMuem9vbVdpZHRoICogdmlldy56b29tWDtcblx0XHRsZXQgeE1heCA9IE1hdGguY2VpbCgodmlldy54ICsgdmlld1dpZHRoKSAvIHRoaXMuem9vbVdpZHRoKTtcblx0XHRsZXQgeFJpZ2h0ID0geE1heCAqIHRoaXMuem9vbVdpZHRoICogdmlldy56b29tWDtcblxuXHRcdGxldCB5TWluID0gTWF0aC5mbG9vcih2aWV3LnkvdGhpcy56b29tSGVpZ2h0KTtcblx0XHRsZXQgeVRvcCA9IHlNaW4gKiB0aGlzLnpvb21IZWlnaHQgKiB2aWV3Lnpvb21YO1xuXHRcdGxldCB5TWF4ID0gTWF0aC5jZWlsKCh2aWV3LnkgKyB2aWV3SGVpZ2h0KSAvIHRoaXMuem9vbUhlaWdodCk7XG5cdFx0bGV0IHlCb3R0b20gPSB5TWF4ICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWCA7XG5cblx0XHRjb25zb2xlLmxvZyhcInhNaW4gXCIgKyB4TWluICsgXCIgeE1heCBcIiArIHhNYXgpO1xuXHRcdGNvbnNvbGUubG9nKFwieU1pbiBcIiArIHlNaW4gKyBcIiB5TWF4IFwiICsgeU1heCk7XG5cblx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0Y3R4LnN0cm9rZVN0eWxlID0gXCJibGFja1wiO1xuXG5cdFx0Zm9yICh2YXIgeCA9IHhNaW47IHg8PXhNYXg7IHgrKyl7XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiYXQgXCIgKyBtaW5YKTtcblx0XHRcdGxldCB4TW92ZSA9IHggKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cdFx0XHRjdHgubW92ZVRvKHhNb3ZlIC0gb2Zmc2V0WCwgeVRvcCAtIG9mZnNldFkpO1xuXHRcdFx0Y3R4LmxpbmVUbyh4TW92ZSAtIG9mZnNldFgsIHlCb3R0b20gLSBvZmZzZXRZKTtcblx0XHR9XG5cblx0XHRmb3IgKHZhciB5ID0geU1pbjsgeTw9eU1heDsgeSsrKXtcblxuXHRcdFx0bGV0IHlNb3ZlID0geSAqIHRoaXMuem9vbUhlaWdodCAqIHZpZXcuem9vbVk7XG5cdFx0XHRjdHgubW92ZVRvKHhMZWZ0IC0gb2Zmc2V0WCwgeU1vdmUgLSBvZmZzZXRZKTtcblx0XHRcdGN0eC5saW5lVG8oeFJpZ2h0IC0gb2Zmc2V0WCwgeU1vdmUgLSBvZmZzZXRZKTtcblxuXHRcdFx0Zm9yICh2YXIgeCA9IHhNaW47IHg8PXhNYXg7IHgrKyl7XG5cdFx0XHRcdGxldCB4TW92ZSA9ICh4LS41KSAqIHRoaXMuem9vbVdpZHRoICogdmlldy56b29tWDtcblx0XHRcdFx0eU1vdmUgPSAoeS0uNSkgKiB0aGlzLnpvb21IZWlnaHQgKiB2aWV3Lnpvb21ZO1xuXHRcdFx0XHRsZXQgdGV4dCA9IFwiXCIgKyAoeC0xKSArIFwiLCBcIiArICh5LTEpO1xuXHRcdFx0XHRjdHguc3Ryb2tlVGV4dCh0ZXh0LCB4TW92ZSAtIG9mZnNldFgsIHlNb3ZlIC0gb2Zmc2V0WSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdGN0eC5zdHJva2UoKTtcblx0XHRjb25zb2xlLmxvZyhcImRyZXcgZ3JpZFwiKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGdldERpbWVuc2lvbigpOiBEaW1lbnNpb24ge1xuXHRcdHJldHVybiBuZXcgRGltZW5zaW9uKDAsIDAsIDAsIDApO1xuXHR9XG59IiwiXG5pbXBvcnQge0NhbnZhc1ZpZXcsIERpc3BsYXlFbGVtZW50fSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5pbXBvcnQge0NhbnZhc0xheWVyfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHtSZWN0TGF5ZXJ9IGZyb20gXCIuL3N0YXRpY1wiO1xuXG5leHBvcnQgY2xhc3MgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIHJlYWRvbmx5IGRpc3BsYXlFbGVtZW50OiBEaXNwbGF5RWxlbWVudCwgIHB1YmxpYyBtb2Q6IHN0cmluZyA9IFwidlwiKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLnByZXNzZWQoY2FudmFzVmlldywgZSAgYXMgS2V5Ym9hcmRFdmVudCkpO1xuICAgIH1cblxuICAgIHByZXNzZWQoY2FudmFzVmlldzogQ2FudmFzVmlldywgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcInByZXNzZWQgbGF5ZXJcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LmtleSk7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgIGNhc2UgdGhpcy5tb2Q6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0b2dnbGUgdmlzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlFbGVtZW50LnNldFZpc2libGUoIXRoaXMuZGlzcGxheUVsZW1lbnQuaXNWaXNpYmxlKCkpO1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VDb250cm9sbGVyIHtcblxuICAgIHByaXZhdGUgY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyO1xuICAgIHByaXZhdGUgbGF5ZXJPdXRsaW5lOiBSZWN0TGF5ZXI7XG4gICAgcHJpdmF0ZSBlZGl0SW5mb1BhbmU6IEhUTUxFbGVtZW50O1xuXG4gICAgY29uc3RydWN0b3IoY2FudmFzVmlldzogQ2FudmFzVmlldywgY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyKSB7XG4gICAgXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLnByZXNzZWQoY2FudmFzVmlldywgZSAgYXMgS2V5Ym9hcmRFdmVudCkpO1xuICAgICAgICB0aGlzLmNhbnZhc0xheWVyID0gY2FudmFzTGF5ZXI7XG4gICAgfVxuXG4gICAgc2V0Q2FudmFzTGF5ZXIoY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyKXtcbiAgICAgICAgdGhpcy5jYW52YXNMYXllciA9IGNhbnZhc0xheWVyO1xuICAgIH1cblxuICAgIHNldEVkaXRJbmZvUGFuZShlZGl0SW5mb1BhbmU6IEhUTUxFbGVtZW50KXtcbiAgICAgICAgdGhpcy5lZGl0SW5mb1BhbmUgPSBlZGl0SW5mb1BhbmU7XG4gICAgfVxuXG4gICAgc2V0TGF5ZXJPdXRsaW5lKGxheWVyT3V0bGluZTogUmVjdExheWVyKXtcbiAgICAgICAgdGhpcy5sYXllck91dGxpbmUgPSBsYXllck91dGxpbmU7XG4gICAgfVxuXG4gICAgcHJlc3NlZChjYW52YXNWaWV3OiBDYW52YXNWaWV3LCBldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIFx0Y29uc29sZS5sb2coXCJwcmVzc2VkXCIgKyBldmVudC50YXJnZXQgKyBcIiwgXCIgKyBldmVudC5rZXkpO1xuXG4gICAgICAgIGxldCBtdWx0aXBsaWVyID0gMTtcblxuICAgIFx0c3dpdGNoIChldmVudC5rZXkpIHtcbiAgICBcdFx0Y2FzZSBcImFcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnggPSB0aGlzLmNhbnZhc0xheWVyLnggLSAwLjUgKiBtdWx0aXBsaWVyO1xuICAgIFx0XHRcdHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIkFcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnggPSB0aGlzLmNhbnZhc0xheWVyLnggLSA1ICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICBcdFx0Y2FzZSBcImRcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnggPSB0aGlzLmNhbnZhc0xheWVyLnggKyAwLjUgKiBtdWx0aXBsaWVyO1xuICAgIFx0XHRcdHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIkRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnggPSB0aGlzLmNhbnZhc0xheWVyLnggKyA1ICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICBcdFx0Y2FzZSBcIndcIjpcbiAgICBcdFx0XHR0aGlzLmNhbnZhc0xheWVyLnkgPSB0aGlzLmNhbnZhc0xheWVyLnkgLSAwLjUgKiBtdWx0aXBsaWVyO1xuICAgIFx0XHRcdHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIldcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnkgPSB0aGlzLmNhbnZhc0xheWVyLnkgLSA1ICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhazsgICAgXG4gICAgXHRcdGNhc2UgXCJzXCI6XG4gICAgXHRcdFx0dGhpcy5jYW52YXNMYXllci55ID0gdGhpcy5jYW52YXNMYXllci55ICsgMC41ICogbXVsdGlwbGllcjtcbiAgICBcdFx0XHR0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICBcdFx0XHRicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJTXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci55ID0gdGhpcy5jYW52YXNMYXllci55ICsgNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gPSB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uIC0gMC4wMDU7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiRVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gPSB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uIC0gMC4wNTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJxXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiA9IHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gKyAwLjAwNTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJRXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiA9IHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gKyAwLjA1O1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgIFx0XHRjYXNlIFwieFwiOlxuICAgIFx0XHRcdHRoaXMuY2FudmFzTGF5ZXIuem9vbVggPSB0aGlzLmNhbnZhc0xheWVyLnpvb21YIC0gMC4wMDIgKiBtdWx0aXBsaWVyO1xuICAgIFx0XHRcdHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiWFwiOlxuICAgIFx0XHRcdHRoaXMuY2FudmFzTGF5ZXIuem9vbVggPSB0aGlzLmNhbnZhc0xheWVyLnpvb21YICsgMC4wMDIgKiBtdWx0aXBsaWVyO1xuICAgIFx0XHRcdHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwielwiOlxuICAgIFx0XHRcdHRoaXMuY2FudmFzTGF5ZXIuem9vbVkgPSB0aGlzLmNhbnZhc0xheWVyLnpvb21ZIC0gMC4wMDIgKiBtdWx0aXBsaWVyO1xuICAgIFx0XHRcdHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiWlwiOlxuICAgIFx0XHRcdHRoaXMuY2FudmFzTGF5ZXIuem9vbVkgPSB0aGlzLmNhbnZhc0xheWVyLnpvb21ZICsgMC4wMDIgKiBtdWx0aXBsaWVyO1xuICAgIFx0XHRcdHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImNcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnNldFZpc2libGUoIXRoaXMuY2FudmFzTGF5ZXIudmlzaWJsZSk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiVFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIub3BhY2l0eSA9IE1hdGgubWluKDEuMCwgdGhpcy5jYW52YXNMYXllci5vcGFjaXR5ICsgMC4xKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJ0XCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5vcGFjaXR5ID0gTWF0aC5tYXgoMCwgdGhpcy5jYW52YXNMYXllci5vcGFjaXR5IC0gMC4xKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICBcdFx0ZGVmYXVsdDpcbiAgICBcdFx0XHQvLyBjb2RlLi4uXG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHR9XG4gICAgICAgIGlmICh0aGlzLmVkaXRJbmZvUGFuZSAhPSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgdGhpcy5lZGl0SW5mb1BhbmUuaW5uZXJIVE1MID0gJ1wibmFtZVwiOiBcIndzYy0xMDAtMlwiLCBcInhcIjogJyArIFxuICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnggKyBcbiAgICAgICAgICAgICAgJywgXCJ5XCI6ICcgKyB0aGlzLmNhbnZhc0xheWVyLnkgKyBcbiAgICAgICAgICAgICAgJywgXCJ6b29tWFwiOiAnKyB0aGlzLmNhbnZhc0xheWVyLnpvb21YICsgXG4gICAgICAgICAgICAgICcsIFwiem9vbVlcIjogJyArIHRoaXMuY2FudmFzTGF5ZXIuem9vbVkgKyBcbiAgICAgICAgICAgICAgJywgXCJyb3RhdGlvblwiOiAnKyB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1wibmFtZVwiOiBcIndzYy0xMDAtMlwiLCBcInhcIjogJyArIHRoaXMuY2FudmFzTGF5ZXIueCArIFxuICAgICAgICAgICAgJywgXCJ5XCI6ICcgKyB0aGlzLmNhbnZhc0xheWVyLnkgKyBcbiAgICAgICAgICAgICcsIFwiem9vbVhcIjogJysgdGhpcy5jYW52YXNMYXllci56b29tWCArIFxuICAgICAgICAgICAgJywgXCJ6b29tWVwiOiAnICsgdGhpcy5jYW52YXNMYXllci56b29tWSArIFxuICAgICAgICAgICAgJywgXCJyb3RhdGlvblwiOiAnKyB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICBcdC8vY29uc29sZS5sb2coXCJpbWFnZSBhdDogXCIgKyAgdGhpcy5jYW52YXNMYXllci54ICsgXCIsIFwiICsgdGhpcy5jYW52YXNMYXllci55KTtcbiAgICBcdC8vY29uc29sZS5sb2coXCJpbWFnZSBybyBzYzogXCIgKyAgdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiArIFwiLCBcIiArIHRoaXMuY2FudmFzTGF5ZXIuem9vbVggKyBcIiwgXCIgKyB0aGlzLmNhbnZhc0xheWVyLnpvb21ZKTtcbiAgICB9O1xuXG4gICAgdXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcpIHtcblxuICAgICAgICBpZiAodGhpcy5sYXllck91dGxpbmUgIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIGxldCBuZXdEaW1lbnNpb24gPSB0aGlzLmNhbnZhc0xheWVyLmdldERpbWVuc2lvbigpO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcImltYWdlIG91dGxpbmUgXCIgKyBuZXdEaW1lbnNpb24pO1xuICAgICAgICAgICAgdGhpcy5sYXllck91dGxpbmUudXBkYXRlRGltZW5zaW9uKG5ld0RpbWVuc2lvbik7XG4gICAgICAgIH1cblxuICAgICAgICBjYW52YXNWaWV3LmRyYXcoKTtcbiAgICB9XG5cbn07IiwiaW1wb3J0IHsgVHJhbnNmb3JtLCBCYXNpY1RyYW5zZm9ybSwgVmlld1RyYW5zZm9ybSwgY29tYmluZVRyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IERpc3BsYXlFbGVtZW50LCBab29tRGlzcGxheVJhbmdlIH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgRGltZW5zaW9uIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2FudmFzTGF5ZXIgZXh0ZW5kcyBCYXNpY1RyYW5zZm9ybSBpbXBsZW1lbnRzIERpc3BsYXlFbGVtZW50IHtcblxuXHRjb25zdHJ1Y3Rvcihcblx0ICBwdWJsaWMgbG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdCAgcHVibGljIG9wYWNpdHk6IG51bWJlciwgXG5cdCAgcHVibGljIHZpc2libGUsXG5cdCAgcHJpdmF0ZSB6b29tRGlzcGxheVJhbmdlOiBab29tRGlzcGxheVJhbmdlID0gWm9vbURpc3BsYXlSYW5nZS5BbGxab29tUmFuZ2Upe1xuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLngsIGxvY2FsVHJhbnNmb3JtLnksIGxvY2FsVHJhbnNmb3JtLnpvb21YLCBsb2NhbFRyYW5zZm9ybS56b29tWSwgXG5cdFx0XHRsb2NhbFRyYW5zZm9ybS5yb3RhdGlvbik7XG5cdH1cblxuXHRnZXRab29tRGlzcGxheVJhbmdlKCk6IFpvb21EaXNwbGF5UmFuZ2Uge1xuXHRcdHJldHVybiB0aGlzLnpvb21EaXNwbGF5UmFuZ2U7XG5cdH1cblxuXHRhYnN0cmFjdCBkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdFx0dmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW47XG5cblx0YWJzdHJhY3QgZ2V0RGltZW5zaW9uKCk6IERpbWVuc2lvbjtcblxuXHRpc1Zpc2libGUoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudmlzaWJsZTtcblx0fVxuXG5cdHNldFZpc2libGUodmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xuXHRcdGNvbnNvbGUubG9nKFwic2V0dGluZyB2aXNpYmlsaXR5OiBcIiArIHZpc2libGUpO1xuXHRcdHRoaXMudmlzaWJsZSA9IHZpc2libGU7XG5cdH1cblxuXHRnZXRPcGFjaXR5KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMub3BhY2l0eTtcblx0fVxuXG5cdHNldE9wYWNpdHkob3BhY2l0eTogbnVtYmVyKTogdm9pZCB7XG5cdFx0dGhpcy5vcGFjaXR5ID0gb3BhY2l0eTtcblx0fVxuXG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBEcmF3TGF5ZXIgZXh0ZW5kcyBDYW52YXNMYXllciB7XG5cbiAgICBwcm90ZWN0ZWQgcHJlcGFyZUN0eChjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFRyYW5zZm9ybSk6IHZvaWQge1xuXHRcdGN0eC50cmFuc2xhdGUoKHRyYW5zZm9ybS54IC0gdmlldy54KSAqIHZpZXcuem9vbVgsICh0cmFuc2Zvcm0ueSAtIHZpZXcueSkgKiB2aWV3Lnpvb21ZKTtcblx0XHRjdHguc2NhbGUodHJhbnNmb3JtLnpvb21YICogdmlldy56b29tWCwgdHJhbnNmb3JtLnpvb21ZICogdmlldy56b29tWSk7XG5cdFx0Y3R4LnJvdGF0ZSh0cmFuc2Zvcm0ucm90YXRpb24pO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBjbGVhbkN0eChjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFRyYW5zZm9ybSk6IHZvaWQge1x0XG5cdFx0Y3R4LnJvdGF0ZSgtdHJhbnNmb3JtLnJvdGF0aW9uKTtcblx0XHRjdHguc2NhbGUoMS90cmFuc2Zvcm0uem9vbVgvdmlldy56b29tWCwgMS90cmFuc2Zvcm0uem9vbVkvdmlldy56b29tWSk7XG5cdFx0Y3R4LnRyYW5zbGF0ZSgtKHRyYW5zZm9ybS54IC12aWV3LngpICp2aWV3Lnpvb21YLCAtKHRyYW5zZm9ybS55IC0gdmlldy55KSAqIHZpZXcuem9vbVkpO1xuICAgIH1cblxufVxuXG5leHBvcnQgY2xhc3MgQ29udGFpbmVyTGF5ZXIgZXh0ZW5kcyBDYW52YXNMYXllciB7XG5cblx0bGF5ZXJNYXA6IE1hcDxzdHJpbmcsIENhbnZhc0xheWVyPjtcblx0ZGlzcGxheUxheWVyczogQXJyYXk8Q2FudmFzTGF5ZXI+O1xuXG5cdGNvbnN0cnVjdG9yKGxvY2FsVHJhbnNmb3JtOiBUcmFuc2Zvcm0sIG9wYWNpdHk6IG51bWJlciA9IDEsIHZpc2libGU6IGJvb2xlYW4gPSB0cnVlKSB7XG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0sIG9wYWNpdHksIHZpc2libGUpO1xuXHRcdHRoaXMubGF5ZXJNYXAgPSBuZXcgTWFwPHN0cmluZywgQ2FudmFzTGF5ZXI+KCk7XG5cdFx0dGhpcy5kaXNwbGF5TGF5ZXJzID0gW107XG5cdH1cblxuXHRzZXQobmFtZTogc3RyaW5nLCBsYXllcjogQ2FudmFzTGF5ZXIpe1xuXHRcdHRoaXMubGF5ZXJNYXAuc2V0KG5hbWUsIGxheWVyKTtcblx0XHR0aGlzLmRpc3BsYXlMYXllcnMucHVzaChsYXllcik7XG5cdH1cblxuXHRnZXQobmFtZTogc3RyaW5nKTogQ2FudmFzTGF5ZXIge1xuXHRcdHJldHVybiB0aGlzLmxheWVyTWFwLmdldChuYW1lKTtcblx0fVxuXG5cdHNldFRvcChuYW1lOiBzdHJpbmcpIHtcblx0XHRsZXQgdG9wTGF5ZXIgPSB0aGlzLmdldChuYW1lKTtcblx0XHRpZiAodG9wTGF5ZXIgIT0gdW5kZWZpbmVkKXtcblx0XHRcdHRoaXMuZGlzcGxheUxheWVycyA9IHRoaXMuZGlzcGxheUxheWVycy5maWx0ZXIoZnVuY3Rpb24oZWxlbWVudDogQ2FudmFzTGF5ZXIpeyBcblx0XHRcdFx0aWYgKGVsZW1lbnQgPT0gdG9wTGF5ZXIpe1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fX0pO1xuXHRcdFx0dGhpcy5kaXNwbGF5TGF5ZXJzLnB1c2godG9wTGF5ZXIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcInRvcCBsYXllciB1bmRlZmluZWQgXCIgKyBuYW1lKTtcblx0XHR9XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0bGV0IGxheWVyVHJhbnNmb3JtID0gY29tYmluZVRyYW5zZm9ybSh0aGlzLmxvY2FsVHJhbnNmb3JtLCBwYXJlbnRUcmFuc2Zvcm0pO1xuXG5cdFx0dmFyIGRyYXdpbmdDb21wbGV0ZSA9IHRydWU7XG5cblx0XHRmb3IgKGxldCBsYXllciBvZiB0aGlzLmRpc3BsYXlMYXllcnMpIHtcblx0XHRcdGlmIChsYXllci5pc1Zpc2libGUoKSl7XG5cdFx0XHRcdGRyYXdpbmdDb21wbGV0ZSA9IGRyYXdpbmdDb21wbGV0ZSAmJiBsYXllci5kcmF3KGN0eCwgbGF5ZXJUcmFuc2Zvcm0sIHZpZXcpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRyYXdpbmdDb21wbGV0ZTtcblx0fVxuXG5cdGdldERpbWVuc2lvbigpOiBEaW1lbnNpb24ge1xuXHRcdHZhciB4TWluID0gdGhpcy54O1xuXHRcdHZhciB5TWluID0gdGhpcy55O1xuXHRcdHZhciB4TWF4ID0gdGhpcy54O1xuXHRcdHZhciB5TWF4ID0gdGhpcy55O1xuXG5cdFx0Zm9yIChsZXQgbGF5ZXIgb2YgdGhpcy5kaXNwbGF5TGF5ZXJzKSB7XG5cdFx0XHRsZXQgbGF5ZXJEaW1lbnNpb24gPSBsYXllci5nZXREaW1lbnNpb24oKTtcblx0XHRcdHhNaW4gPSBNYXRoLm1pbih4TWluLCB0aGlzLnggKyBsYXllckRpbWVuc2lvbi54KTtcblx0XHRcdHlNaW4gPSBNYXRoLm1pbih5TWluLCB0aGlzLnkgKyBsYXllckRpbWVuc2lvbi55KTtcblx0XHRcdHhNYXggPSBNYXRoLm1heCh4TWF4LCB0aGlzLnggKyBsYXllckRpbWVuc2lvbi54ICsgdGhpcy56b29tWCAqIGxheWVyRGltZW5zaW9uLncpO1xuXHRcdFx0eU1heCA9IE1hdGgubWF4KHlNYXgsIHRoaXMueSArIGxheWVyRGltZW5zaW9uLnkgKyB0aGlzLnpvb21ZICogbGF5ZXJEaW1lbnNpb24uaCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBEaW1lbnNpb24oeE1pbiwgeU1pbiwgeE1heCAtIHhNaW4sIHlNYXggLSB5TWluKTtcblx0fVxuXG5cbn0iLCJpbXBvcnQgeyBDb250YWluZXJMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBDb250YWluZXJMYXllck1hbmFnZXIgfSBmcm9tIFwiLi9sYXllcm1hbmFnZXJcIjtcbmltcG9ydCB7IENhbnZhc1ZpZXcgfSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5cbmV4cG9ydCBjbGFzcyBMYXllckNvbnRyb2xsZXIge1xuXG5cdHByaXZhdGUgbW9kOiBzdHJpbmcgPSBcImlcIjtcblxuXHRjb25zdHJ1Y3RvcihjYW52YXNWaWV3OiBDYW52YXNWaWV3LCByZWFkb25seSBjb250YWluZXJMYXllck1hbmFnZXI6IENvbnRhaW5lckxheWVyTWFuYWdlcil7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZChjYW52YXNWaWV3LCBlICBhcyBLZXlib2FyZEV2ZW50KSk7XG5cdH1cblxuXHRwcmVzc2VkKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgIGNhc2UgdGhpcy5tb2Q6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0b2dnbGUgdmlzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lckxheWVyTWFuYWdlci50b2dnbGVWaXNpYmlsaXR5KGZhbHNlKTtcbiAgICAgICAgICAgICAgICBjYW52YXNWaWV3LmRyYXcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxufSIsImltcG9ydCB7IENhbnZhc0xheWVyLCBDb250YWluZXJMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBTdGF0aWNJbWFnZSwgUmVjdExheWVyIH0gZnJvbSBcIi4vc3RhdGljXCI7XG5pbXBvcnQgeyBUcmFuc2Zvcm0gLCBCYXNpY1RyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7Q2FudmFzVmlldywgRGlzcGxheUVsZW1lbnR9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcblxuZXhwb3J0IGludGVyZmFjZSBJbWFnZVN0cnVjdCBleHRlbmRzIFRyYW5zZm9ybSB7XG5cdG9wYWNpdHk6IG51bWJlcjtcblx0dmlzaWJsZTogYm9vbGVhbjtcblx0c3JjOiBzdHJpbmc7XG5cdG5hbWU6IHN0cmluZztcblx0ZGF0ZTogbnVtYmVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGF0ZUZpbHRlcihcbiAgaW1hZ2VTdHJ1Y3Q6IEFycmF5PEltYWdlU3RydWN0PiwgXG4gIGZyb206IG51bWJlciwgXG4gIHRvOiBudW1iZXIpOiBBcnJheTxJbWFnZVN0cnVjdD57XG5cdHJldHVybiBpbWFnZVN0cnVjdC5maWx0ZXIoZnVuY3Rpb24oaW1hZ2VTdHJ1Y3QpeyBcblx0XHRpZiAoaW1hZ2VTdHJ1Y3QuZGF0ZSA9PSB1bmRlZmluZWQpXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0aWYgKGltYWdlU3RydWN0LmRhdGUgPj0gZnJvbSAmJiBpbWFnZVN0cnVjdC5kYXRlIDw9IHRvKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlfVxuXHRcdH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGF0ZWxlc3NGaWx0ZXIoXG4gIGltYWdlU3RydWN0OiBBcnJheTxJbWFnZVN0cnVjdD4pOiBBcnJheTxJbWFnZVN0cnVjdD57XG5cdHJldHVybiBpbWFnZVN0cnVjdC5maWx0ZXIoZnVuY3Rpb24oaW1hZ2VTdHJ1Y3QpeyBcblx0XHRpZiAoaW1hZ2VTdHJ1Y3QuZGF0ZSA9PSB1bmRlZmluZWQpXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZX1cblx0XHR9KTtcbn1cblxuZXhwb3J0IGNsYXNzIExheWVyTWFuYWdlciB7XG5cblx0cHJpdmF0ZSBsYXllck1hcDogTWFwPHN0cmluZywgQ29udGFpbmVyTGF5ZXI+OztcblxuXHRyZWFkb25seSBkZWZhdWx0TGF5ZXI6IHN0cmluZyA9IFwiZGVmYXVsdFwiO1xuXG5cdGNvbnN0cnVjdG9yKCl7XG5cdFx0dGhpcy5sYXllck1hcCA9IG5ldyBNYXA8c3RyaW5nLCBDb250YWluZXJMYXllcj4oKTtcblxuXHRcdGxldCBpbWFnZUxheWVyID0gbmV3IENvbnRhaW5lckxheWVyKEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0sIDEsIHRydWUpO1x0XG5cblx0XHR0aGlzLmxheWVyTWFwLnNldCh0aGlzLmRlZmF1bHRMYXllciwgaW1hZ2VMYXllcik7XG5cdH1cblxuXHRhZGRJbWFnZShpbWFnZTogU3RhdGljSW1hZ2UsIG5hbWU6IHN0cmluZyl7XG5cdFx0dGhpcy5sYXllck1hcC5nZXQodGhpcy5kZWZhdWx0TGF5ZXIpLnNldChuYW1lLCBpbWFnZSk7XG5cdH1cblxuXHRhZGRMYXllcihcblx0ICBpbWFnZURldGFpbHM6IEFycmF5PEltYWdlU3RydWN0PiwgXG5cdCAgbGF5ZXJOYW1lOiBzdHJpbmcsIFxuXHQgIGxheWVyVHJhbnNmb3JtOiBUcmFuc2Zvcm0gPSBCYXNpY1RyYW5zZm9ybS51bml0VHJhbnNmb3JtKTogQ29udGFpbmVyTGF5ZXIge1xuXG5cdFx0bGV0IGltYWdlTGF5ZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXIobGF5ZXJUcmFuc2Zvcm0sIDEsIHRydWUpO1x0XG5cblx0XHRmb3IgKHZhciBpbWFnZSBvZiBpbWFnZURldGFpbHMpe1xuXHRcdFx0bGV0IHN0YXRpY0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKGltYWdlLCBpbWFnZS5zcmMsIGltYWdlLm9wYWNpdHksIGltYWdlLnZpc2libGUpO1xuXHRcdFx0aW1hZ2VMYXllci5zZXQoaW1hZ2UubmFtZSwgc3RhdGljSW1hZ2UpO1xuXHRcdH1cblxuXHRcdHRoaXMubGF5ZXJNYXAuc2V0KGxheWVyTmFtZSwgaW1hZ2VMYXllcik7XG5cblx0XHRyZXR1cm4gaW1hZ2VMYXllcjtcblx0fVxuXG5cdGdldExheWVycygpOiBNYXA8c3RyaW5nLCBDb250YWluZXJMYXllcj4ge1xuXHRcdHJldHVybiB0aGlzLmxheWVyTWFwO1xuXHR9XG5cblx0Z2V0TGF5ZXIobmFtZTogc3RyaW5nKTogQ29udGFpbmVyTGF5ZXIge1xuXHRcdHJldHVybiB0aGlzLmxheWVyTWFwLmdldChuYW1lKTtcblx0fVxuXG59XG5cbmV4cG9ydCBjbGFzcyBDb250YWluZXJMYXllck1hbmFnZXIge1xuXG5cdHByaXZhdGUgY29udGFpbmVyTGF5ZXI6IENvbnRhaW5lckxheWVyO1xuXHRwcml2YXRlIHNlbGVjdGVkOiBzdHJpbmc7XG5cdFxuXHRjb25zdHJ1Y3Rvcihjb250YWluZXJMYXllcjogQ29udGFpbmVyTGF5ZXIsIFxuXHQgIHJlYWRvbmx5IGRpc3BsYXlMYXllcjogQ29udGFpbmVyTGF5ZXIgPSBjb250YWluZXJMYXllcikge1xuXHRcdHRoaXMuY29udGFpbmVyTGF5ZXIgPSBjb250YWluZXJMYXllcjtcblx0fVxuXG5cdHNldExheWVyQ29udGFpbmVyKGNvbnRhaW5lckxheWVyOiBDb250YWluZXJMYXllcikge1xuXHRcdHRoaXMuY29udGFpbmVyTGF5ZXIgPSBjb250YWluZXJMYXllcjtcblx0fVxuXG5cdHNldFNlbGVjdGVkKG5hbWU6IHN0cmluZyk6IFJlY3RMYXllciB7XG5cdFx0dGhpcy5zZWxlY3RlZCA9IG5hbWU7XG5cblx0XHRsZXQgbGF5ZXI6IENhbnZhc0xheWVyID0gdGhpcy5jb250YWluZXJMYXllci5nZXQodGhpcy5zZWxlY3RlZCk7XG5cblx0XHRsZXQgbGF5ZXJSZWN0ID0gbmV3IFJlY3RMYXllcihsYXllci5nZXREaW1lbnNpb24oKSwgMSwgdHJ1ZSk7XG5cblx0XHRsZXQgbGF5ZXJOYW1lID0gXCJvdXRsaW5lXCI7Ly9uYW1lICsgXCJfb1wiXG5cblx0XHR0aGlzLmRpc3BsYXlMYXllci5zZXQobGF5ZXJOYW1lLCBsYXllclJlY3QpO1xuXG5cdFx0cmV0dXJuIGxheWVyUmVjdDtcblx0fVxuXG5cdHRvZ2dsZVZpc2liaWxpdHkoc2VsZWN0ZWQ6IGJvb2xlYW4gPSB0cnVlKXtcblx0XHRsZXQgdG9nZ2xlR3JvdXA6IEFycmF5PERpc3BsYXlFbGVtZW50PiA9IFtdO1xuXHRcdGlmIChzZWxlY3RlZCl7XG5cdFx0XHRpZiAodGhpcy5zZWxlY3RlZCAhPSBcIlwiKXtcblx0XHRcdFx0dG9nZ2xlR3JvdXAucHVzaCh0aGlzLmNvbnRhaW5lckxheWVyLmdldCh0aGlzLnNlbGVjdGVkKSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZvciAobGV0IHBhaXIgb2YgdGhpcy5jb250YWluZXJMYXllci5sYXllck1hcCl7XG5cblx0XHRcdFx0aWYgKHBhaXJbMF0gIT0gdGhpcy5zZWxlY3RlZCl7XG5cdFx0XHRcdFx0dG9nZ2xlR3JvdXAucHVzaChwYWlyWzFdKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcImxheWVyTmFtZTogXCIgKyB0aGlzLnNlbGVjdGVkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZvciAobGV0IGVsZW1lbnQgb2YgdG9nZ2xlR3JvdXApe1xuXHRcdFx0ZWxlbWVudC5zZXRWaXNpYmxlKCFlbGVtZW50LmlzVmlzaWJsZSgpKVxuXHRcdH1cblx0fVxuXG59IiwiaW1wb3J0IHsgVHJhbnNmb3JtLCBCYXNpY1RyYW5zZm9ybSwgY29tYmluZVRyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IERyYXdMYXllciwgQ2FudmFzTGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgRGlzcGxheUVsZW1lbnQsIFpvb21EaXNwbGF5UmFuZ2UgfSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5pbXBvcnQgeyBEaW1lbnNpb24sIHJvdGF0ZSwgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuZXhwb3J0IGNsYXNzIFN0YXRpY0ltYWdlIGV4dGVuZHMgRHJhd0xheWVyIGltcGxlbWVudHMgRGlzcGxheUVsZW1lbnQge1xuXG5cdHByaXZhdGUgaW1nOiBIVE1MSW1hZ2VFbGVtZW50O1xuXG5cdGNvbnN0cnVjdG9yKGxvY2FsVHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHQgIGltYWdlU3JjOiBzdHJpbmcsIFxuXHQgIG9wYWNpdHk6IG51bWJlcixcblx0ICB2aXNpYmxlOiBib29sZWFuLFxuXHQgIHpvb21EaXNwbGF5UmFuZ2U6IFpvb21EaXNwbGF5UmFuZ2UgPSBab29tRGlzcGxheVJhbmdlLkFsbFpvb21SYW5nZSkge1xuXG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0sIG9wYWNpdHksIHZpc2libGUsIHpvb21EaXNwbGF5UmFuZ2UpO1xuXHRcdFxuXHRcdHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG5cdFx0dGhpcy5pbWcuc3JjID0gaW1hZ2VTcmM7XG5cdH1cblxuXHRwcml2YXRlIGRyYXdJbWFnZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFRyYW5zZm9ybSl7XG5cblx0XHRpZiAodGhpcy5pc1Zpc2libGUoKSAmJiB0aGlzLmdldFpvb21EaXNwbGF5UmFuZ2UoKS53aXRoaW5SYW5nZSh2aWV3Lnpvb21YKSl7XG5cdFx0XHRsZXQgY3R4VHJhbnNmb3JtID0gY29tYmluZVRyYW5zZm9ybSh0aGlzLCBwYXJlbnRUcmFuc2Zvcm0pO1xuXG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiY3R4IHggXCIgKyBjdHhUcmFuc2Zvcm0ueCk7XG5cblx0XHRcdHRoaXMucHJlcGFyZUN0eChjdHgsIGN0eFRyYW5zZm9ybSwgdmlldyk7XG5cdFx0XHRcblx0XHRcdGN0eC5nbG9iYWxBbHBoYSA9IHRoaXMub3BhY2l0eTtcblx0XHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDApO1xuXHRcdFx0Y3R4Lmdsb2JhbEFscGhhID0gMTtcblxuXHRcdFx0dGhpcy5jbGVhbkN0eChjdHgsIGN0eFRyYW5zZm9ybSwgdmlldyk7XG5cdFx0fVxuXHRcdFxuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFRyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXHRcdGlmICh0aGlzLnZpc2libGUgJiYgdGhpcy5pbWcuY29tcGxldGUpIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgcGFyZW50VHJhbnNmb3JtLCB2aWV3KTtcblx0XHQvL1x0Y29uc29sZS5sb2coXCJkcmV3IGltYWdlIFwiICsgdGhpcy5pbWcuc3JjKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHRcblx0XHRpZiAodGhpcy5pbWcuY29tcGxldGUpe1xuXHRcdFx0dmFyIHdpZHRoID0gdGhpcy5pbWcud2lkdGggKiB0aGlzLnpvb21YO1xuXHRcdFx0dmFyIGhlaWdodCA9IHRoaXMuaW1nLmhlaWdodCAqIHRoaXMuem9vbVk7XG5cblx0XHRcdGxldCBwMSA9IHJvdGF0ZShuZXcgUG9pbnQyRCh3aWR0aCwgMCksIHRoaXMucm90YXRpb24pO1xuXHRcdFx0bGV0IHAyID0gcm90YXRlKG5ldyBQb2ludDJEKHdpZHRoLCAtaGVpZ2h0KSwgdGhpcy5yb3RhdGlvbik7XG5cdFx0XHRsZXQgcDMgPSByb3RhdGUobmV3IFBvaW50MkQoMCwgLWhlaWdodCksIHRoaXMucm90YXRpb24pO1xuXG5cdFx0XHRsZXQgbWluWCA9IE1hdGgubWluKDAsIHAxLngsIHAyLngsIHAzLngpO1xuXHRcdFx0bGV0IG1pblkgPSBNYXRoLm1pbigwLCBwMS55LCBwMi55LCBwMy55KTtcblx0XHRcdGxldCBtYXhYID0gTWF0aC5tYXgoMCwgcDEueCwgcDIueCwgcDMueCk7XG5cdFx0XHRsZXQgbWF4WSA9IE1hdGgubWF4KDAsIHAxLnksIHAyLnksIHAzLnkpO1xuXG5cdFx0XHRjb25zb2xlLmxvZyhcIm1pbng6IFwiICsgbWluWCk7XG5cdFx0XHRjb25zb2xlLmxvZyhcImhlaWdodDogXCIgKyAobWF4WSAtIG1pblkpKTtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIG5ldyBEaW1lbnNpb24odGhpcy54ICsgbWluWCwgdGhpcy55IC0gbWF4WSwgbWF4WC1taW5YLCBtYXhZLW1pblkpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgRGltZW5zaW9uKHRoaXMueCwgdGhpcy55LCAwLCAwKTtcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgUmVjdExheWVyIGV4dGVuZHMgRHJhd0xheWVyIGltcGxlbWVudHMgRGlzcGxheUVsZW1lbnQge1xuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgZGltZW5zaW9uOiBEaW1lbnNpb24sIFxuXHRcdG9wYWNpdHk6IG51bWJlcixcblx0XHR2aXNpYmxlOiBib29sZWFuLFxuXHRcdHpvb21EaXNwbGF5UmFuZ2U6IFpvb21EaXNwbGF5UmFuZ2UgPSBab29tRGlzcGxheVJhbmdlLkFsbFpvb21SYW5nZSkge1xuXG5cdFx0c3VwZXIobmV3IEJhc2ljVHJhbnNmb3JtKGRpbWVuc2lvbi54LCBkaW1lbnNpb24ueSwgMSwgMSwgMCksIFxuXHRcdFx0b3BhY2l0eSwgdmlzaWJsZSwgem9vbURpc3BsYXlSYW5nZSk7XG5cdH1cblxuXHR1cGRhdGVEaW1lbnNpb24oZGltZW5zaW9uOiBEaW1lbnNpb24pe1xuXHRcdHRoaXMuZGltZW5zaW9uID0gZGltZW5zaW9uO1xuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFRyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0bGV0IHggPSAodGhpcy5kaW1lbnNpb24ueCArIHBhcmVudFRyYW5zZm9ybS54IC0gdmlldy54KSAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IHkgPSAodGhpcy5kaW1lbnNpb24ueSArIHBhcmVudFRyYW5zZm9ybS55IC0gdmlldy55KSAqIHZpZXcuem9vbVk7XG5cblx0XHQvL2NvbnNvbGUubG9nKFwiZGltZW5zaW9uIFwiICsgdGhpcy5kaW1lbnNpb24ueCk7XG5cblx0XHQvL2NvbnNvbGUubG9nKFwib3V0bGluZTogXCIgKyB4ICsgXCIgdmlldzogXCIgKyB2aWV3LnggKyBcblx0XHQvL1x0XCIgcGFyZW50IFwiICsgcGFyZW50VHJhbnNmb3JtLnggKyBcIiB3IFwiICsgdGhpcy5kaW1lbnNpb24udyk7XG5cdFx0Y3R4LnN0cm9rZVN0eWxlID0gXCJyZWRcIjtcblx0XHRjdHguc3Ryb2tlUmVjdCh4LCB5LCB0aGlzLmRpbWVuc2lvbi53ICogdmlldy56b29tWCwgdGhpcy5kaW1lbnNpb24uaCAqIHZpZXcuem9vbVkpO1xuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHRyZXR1cm4gdGhpcy5kaW1lbnNpb247XG5cdH1cblxufVxuIiwiaW1wb3J0IHsgRHJhd0xheWVyIH0gZnJvbSBcIi4vbGF5ZXJcIjtcbmltcG9ydCB7IFRyYW5zZm9ybSwgQmFzaWNUcmFuc2Zvcm0sIFZpZXdUcmFuc2Zvcm0sIGNvbWJpbmVUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBEaW1lbnNpb24gfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBab29tRGlzcGxheVJhbmdlIH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuXG5leHBvcnQgY2xhc3MgVGlsZVN0cnVjdCB7XG5cdFxuXHRjb25zdHJ1Y3Rvcihcblx0XHRwdWJsaWMgcHJlZml4OiBzdHJpbmcsXG5cdFx0cHVibGljIHN1ZmZpeDogc3RyaW5nLFxuXHRcdHB1YmxpYyB0aWxlRGlyZWN0b3J5OiBzdHJpbmcpe31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHpvb21CeUxldmVsKHpvb21MZXZlbDogbnVtYmVyKXtcblx0cmV0dXJuIE1hdGgucG93KDIsIHpvb21MZXZlbCk7XG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlTGF5ZXIgZXh0ZW5kcyBEcmF3TGF5ZXIge1xuXG5cdHRpbGVNYW5hZ2VyOiBUaWxlTWFuYWdlcjtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHRyZWFkb25seSB0aWxlU3RydWN0OiBUaWxlU3RydWN0LFxuXHRcdHZpc2JpbGU6IGJvb2xlYW4sXG5cdFx0em9vbURpc3BsYXlSYW5nZTogWm9vbURpc3BsYXlSYW5nZSA9IFpvb21EaXNwbGF5UmFuZ2UuQWxsWm9vbVJhbmdlLCBcblx0XHRwdWJsaWMgeE9mZnNldDogbnVtYmVyID0gMCxcblx0XHRwdWJsaWMgeU9mZnNldDogbnVtYmVyID0gMCxcblx0XHRwdWJsaWMgem9vbTogbnVtYmVyID0gMSxcblx0XHRyZWFkb25seSBncmlkV2lkdGg6IG51bWJlciA9IDI1NiwgXG5cdFx0cmVhZG9ubHkgZ3JpZEhlaWdodDogbnVtYmVyID0gMjU2LFxuXHRcdG9wYWNpdHk6IG51bWJlciA9IDEpe1xuXG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0sIG9wYWNpdHksIHZpc2JpbGUsIHpvb21EaXNwbGF5UmFuZ2UpO1xuXG5cdFx0dGhpcy50aWxlTWFuYWdlciA9IG5ldyBUaWxlTWFuYWdlcigpO1xuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFZpZXdUcmFuc2Zvcm0pOiBib29sZWFuIHtcblxuXHRcdGlmICh0aGlzLmdldFpvb21EaXNwbGF5UmFuZ2UoKS53aXRoaW5SYW5nZSh2aWV3Lnpvb21YKSl7XG5cblx0XHRcdGxldCBjdHhUcmFuc2Zvcm0gPSBjb21iaW5lVHJhbnNmb3JtKHRoaXMsIHBhcmVudFRyYW5zZm9ybSk7XG5cblx0XHRcdGxldCB6b29tV2lkdGg6IG51bWJlciA9IHRoaXMuZ3JpZFdpZHRoICogY3R4VHJhbnNmb3JtLnpvb21YXG5cdFx0XHRsZXQgem9vbUhlaWdodDogbnVtYmVyID0gdGhpcy5ncmlkSGVpZ2h0ICogY3R4VHJhbnNmb3JtLnpvb21ZO1xuXG5cdFx0XHRsZXQgdHJhbnNmb3JtWCA9IHZpZXcueCArIGN0eFRyYW5zZm9ybS54O1xuXHRcdFx0bGV0IHRyYW5zZm9ybVkgPSB2aWV3LnkgKyBjdHhUcmFuc2Zvcm0ueTtcblxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImN0eCB6b29tV2lkdGg6IFwiICsgem9vbVdpZHRoKTtcblxuXHRcdFx0bGV0IHZpZXdYID0gdmlldy54ICogdmlldy56b29tWDtcblx0XHRcdGxldCB2aWV3WSA9IHZpZXcueSAqIHZpZXcuem9vbVk7XG5cblx0XHRcdGxldCB2aWV3V2lkdGggPSB2aWV3LndpZHRoIC8gdmlldy56b29tWDtcblx0XHRcdGxldCB2aWV3SGVpZ2h0ID0gdmlldy5oZWlnaHQgLyB2aWV3Lnpvb21ZO1xuXG5cdFx0XHRsZXQgZ3JpZEFjcm9zcyA9IHZpZXdXaWR0aCAvIHpvb21XaWR0aDsgLy9nb29kXG5cdFx0XHRsZXQgZ3JpZEhpZ2ggPSB2aWV3SGVpZ2h0IC8gem9vbUhlaWdodDsgLy9nb29kXG5cblx0XHRcdGxldCB4TWluID0gTWF0aC5mbG9vcih0cmFuc2Zvcm1YIC8gem9vbVdpZHRoKTtcblx0XHRcdGxldCB4TWF4ID0gTWF0aC5jZWlsKCh0cmFuc2Zvcm1YICsgdmlld1dpZHRoKSAvIHpvb21XaWR0aCk7XG5cblx0XHRcdGxldCB5TWluID0gTWF0aC5mbG9vcih0cmFuc2Zvcm1ZIC8gem9vbUhlaWdodCk7XG5cdFx0XHRsZXQgeU1heCA9IE1hdGguY2VpbCgodHJhbnNmb3JtWSArIHZpZXdIZWlnaHQpIC8gem9vbUhlaWdodCk7XG5cblx0XHRcdC8vY29uc29sZS5sb2coXCJ4IHkgcyBcIiArIHhNaW4gKyBcIiwgXCIgKyB4TWF4ICsgXCI6IFwiICsgeU1pbiArIFwiLCBcIiArIHlNYXgpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImFjcm9zcyBoaWdoXCIgKyBncmlkQWNyb3NzICsgXCIsIFwiICsgZ3JpZEhpZ2gpO1xuXG5cdFx0XHR2YXIgZHJhd2luZ0NvbXBsZXRlID0gdHJ1ZTtcblxuXHRcdFx0bGV0IGZ1bGxab29tWCA9IGN0eFRyYW5zZm9ybS56b29tWCAqIHZpZXcuem9vbVg7XG5cdFx0XHRsZXQgZnVsbFpvb21ZID0gY3R4VHJhbnNmb3JtLnpvb21ZICogdmlldy56b29tWTtcblxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImZ1bGx6b29tcyBcIiArIGZ1bGxab29tWCArIFwiIFwiICsgZnVsbFpvb21ZKTtcblxuXHRcdFx0Y3R4LnNjYWxlKGZ1bGxab29tWCwgZnVsbFpvb21ZKTtcblxuXHRcdFx0Zm9yICh2YXIgeCA9IHhNaW47IHg8eE1heDsgeCsrKXtcblx0XHRcdFx0bGV0IHhNb3ZlID0geCAqIHRoaXMuZ3JpZFdpZHRoIC0gdHJhbnNmb3JtWCAvIGN0eFRyYW5zZm9ybS56b29tWDtcblx0XHRcdFx0Zm9yICh2YXIgeSA9IHlNaW47IHk8eU1heDsgeSsrKXtcblx0XHRcdFx0XHRsZXQgeU1vdmUgPSB5ICogdGhpcy5ncmlkSGVpZ2h0IC0gdHJhbnNmb3JtWSAvIGN0eFRyYW5zZm9ybS56b29tWTtcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKFwidGlsZSB4IHkgXCIgKyB4ICsgXCIgXCIgKyB5ICsgXCI6IFwiICsgeE1vdmUgKyBcIiwgXCIgKyB5TW92ZSk7XG5cblx0XHRcdFx0XHRjdHgudHJhbnNsYXRlKHhNb3ZlLCB5TW92ZSk7XG5cdFx0XHRcdFx0bGV0IHRpbGVTcmMgPSB0aGlzLnRpbGVTdHJ1Y3QudGlsZURpcmVjdG9yeSArIHRoaXMuem9vbSArIFwiL1wiICsgXG5cdFx0XHRcdFx0XHQoeCArIHRoaXMueE9mZnNldCkgKyBcIi9cIiArIFxuXHRcdFx0XHRcdFx0KHkgKyB0aGlzLnlPZmZzZXQpICsgdGhpcy50aWxlU3RydWN0LnN1ZmZpeDtcblxuXHRcdFx0XHRcdGlmICh0aGlzLnRpbGVNYW5hZ2VyLmhhcyh0aWxlU3JjKSkge1xuXHRcdFx0XHRcdFx0bGV0IGltYWdlVGlsZSA9IHRoaXMudGlsZU1hbmFnZXIuZ2V0KHRpbGVTcmMpO1xuXHRcdFx0XHRcdFx0ZHJhd2luZ0NvbXBsZXRlID0gZHJhd2luZ0NvbXBsZXRlICYmIGltYWdlVGlsZS5kcmF3KGN0eCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0bGV0IGltYWdlVGlsZSA9IG5ldyBJbWFnZVRpbGUoeCwgeSwgdGlsZVNyYyk7XG5cblx0XHRcdFx0XHRcdGRyYXdpbmdDb21wbGV0ZSA9IGRyYXdpbmdDb21wbGV0ZSAmJiBpbWFnZVRpbGUuZHJhdyhjdHgpO1xuXG5cdFx0XHRcdFx0XHR0aGlzLnRpbGVNYW5hZ2VyLnNldCh0aWxlU3JjLCBpbWFnZVRpbGUpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGN0eC50cmFuc2xhdGUoLXhNb3ZlLCAteU1vdmUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGN0eC5zY2FsZSgxIC8gZnVsbFpvb21YLCAxIC8gZnVsbFpvb21ZKTtcblxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImRyZXcgdGlsZXMgXCIgKyBkcmF3aW5nQ29tcGxldGUpO1xuXHRcdFx0cmV0dXJuIGRyYXdpbmdDb21wbGV0ZTtcblx0XHR9IGVsc2UgeyBcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fVxuXG5cdGdldERpbWVuc2lvbigpOiBEaW1lbnNpb24ge1xuXHRcdHJldHVybiBuZXcgRGltZW5zaW9uKDAsIDAsIDAsIDApO1xuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlTWFuYWdlciB7XG5cblx0dGlsZU1hcDogTWFwPHN0cmluZywgSW1hZ2VUaWxlPjtcblxuXHRjb25zdHJ1Y3Rvcigpe1xuXHRcdHRoaXMudGlsZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBJbWFnZVRpbGU+KCk7XG5cdH1cblxuXHRnZXQodGlsZUtleTogc3RyaW5nKTogSW1hZ2VUaWxlIHtcblx0XHRyZXR1cm4gdGhpcy50aWxlTWFwLmdldCh0aWxlS2V5KTtcblx0fVxuXG5cdGhhcyh0aWxlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy50aWxlTWFwLmhhcyh0aWxlS2V5KTtcblx0fVxuXG5cdHNldCh0aWxlS2V5OiBzdHJpbmcsIHRpbGU6IEltYWdlVGlsZSl7XG5cdFx0dGhpcy50aWxlTWFwLnNldCh0aWxlS2V5LCB0aWxlKTtcblx0fVxuXG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZVRpbGUge1xuXG5cdHByaXZhdGUgaW1nOiBIVE1MSW1hZ2VFbGVtZW50O1xuXHRwcml2YXRlIGV4aXN0czogYm9vbGVhbjtcblxuXHRjb25zdHJ1Y3RvcihyZWFkb25seSB4SW5kZXg6IG51bWJlciwgcmVhZG9ubHkgeUluZGV4OiBudW1iZXIsIGltYWdlU3JjOiBzdHJpbmcpIHtcblx0XHR0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuXHRcdHRoaXMuaW1nLnNyYyA9IGltYWdlU3JjO1xuXHRcdHRoaXMuaW1nLm9uZXJyb3IgPSBmdW5jdGlvbihldmVudE9yTWVzc2FnZTogYW55KXtcblx0XHRcdGV2ZW50T3JNZXNzYWdlLnRhcmdldC5zcmMgPSBcIlwiO1xuXHRcdH07XG5cdH07XG5cblx0cHJpdmF0ZSBkcmF3SW1hZ2UoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpe1xuXHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDApO1xuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCk6IGJvb2xlYW4ge1xuXHRcdGlmICh0aGlzLmltZy5zcmMgIT0gXCJcIiAmJiB0aGlzLmltZy5jb21wbGV0ZSApIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xuXG59XG4iLCIvKipcbiogQSB3b3JsZCBpcyAwLDAgYmFzZWQgYnV0IGFueSBlbGVtZW50IGNhbiBiZSBwb3NpdGlvbmVkIHJlbGF0aXZlIHRvIHRoaXMuXG4qL1xuZXhwb3J0IGludGVyZmFjZSBUcmFuc2Zvcm0ge1xuXHR4OiBudW1iZXI7XG5cdHk6IG51bWJlcjtcblx0em9vbVg6IG51bWJlcjtcblx0em9vbVk6IG51bWJlcjtcblx0cm90YXRpb246IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIEJhc2ljVHJhbnNmb3JtIGltcGxlbWVudHMgVHJhbnNmb3JtIHtcblxuICAgIHN0YXRpYyByZWFkb25seSB1bml0VHJhbnNmb3JtID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDEsIDEsIDApO1xuXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB4OiBudW1iZXIsIHB1YmxpYyB5OiBudW1iZXIsIFxuXHRcdHB1YmxpYyB6b29tWDogbnVtYmVyLCBwdWJsaWMgem9vbVk6IG51bWJlciwgXG5cdFx0cHVibGljIHJvdGF0aW9uOiBudW1iZXIpe31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbWJpbmVUcmFuc2Zvcm0oY2hpbGQ6IFRyYW5zZm9ybSwgY29udGFpbmVyOiBUcmFuc2Zvcm0pOiBUcmFuc2Zvcm0ge1xuXHRsZXQgem9vbVggPSBjaGlsZC56b29tWCAqIGNvbnRhaW5lci56b29tWDtcblx0Ly9jb25zb2xlLmxvZyhcIm1vZGlmaWVkIFwiICsgY2hpbGQuem9vbVggKyBcIiB0byBcIiArIHpvb21YKTtcblx0bGV0IHpvb21ZID0gY2hpbGQuem9vbVkgKiBjb250YWluZXIuem9vbVk7XG5cdC8vY29uc29sZS5sb2coXCJtb2RpZmllZCBcIiArIGNoaWxkLnpvb21ZICsgXCIgYnkgXCIgKyBjb250YWluZXIuem9vbVkgKyBcIiB0byBcIiArIHpvb21ZKTtcblx0bGV0IHggPSAoY2hpbGQueCAqIGNvbnRhaW5lci56b29tWCkgKyBjb250YWluZXIueDtcblx0bGV0IHkgPSAoY2hpbGQueSAqIGNvbnRhaW5lci56b29tWSkgKyBjb250YWluZXIueTtcblx0Ly9jb25zb2xlLmxvZyhcIm1vZGlmaWVkIHggXCIgKyBjaGlsZC54ICsgXCIgYnkgXCIgKyBjb250YWluZXIuem9vbVggKyBcIiBhbmQgXCIgKyBjb250YWluZXIueCArIFwiIHRvIFwiICsgeCk7XG5cdGxldCByb3RhdGlvbiA9IGNoaWxkLnJvdGF0aW9uICsgY29udGFpbmVyLnJvdGF0aW9uO1xuXHRyZXR1cm4gbmV3IEJhc2ljVHJhbnNmb3JtKHgsIHksIHpvb21YLCB6b29tWSwgcm90YXRpb24pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUodHJhbnNmb3JtOiBUcmFuc2Zvcm0pOiBUcmFuc2Zvcm0ge1xuXHRyZXR1cm4gbmV3IEJhc2ljVHJhbnNmb3JtKHRyYW5zZm9ybS54LCB0cmFuc2Zvcm0ueSwgXG5cdFx0dHJhbnNmb3JtLnpvb21YLCB0cmFuc2Zvcm0uem9vbVksIHRyYW5zZm9ybS5yb3RhdGlvbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnRUcmFuc2Zvcm0od29ybGRTdGF0ZTogVHJhbnNmb3JtKTogVHJhbnNmb3JtIHtcblx0cmV0dXJuIG5ldyBCYXNpY1RyYW5zZm9ybSgtd29ybGRTdGF0ZS54LCAtd29ybGRTdGF0ZS55LCBcblx0XHQxL3dvcmxkU3RhdGUuem9vbVgsIDEvd29ybGRTdGF0ZS56b29tWSwgLXdvcmxkU3RhdGUucm90YXRpb24pO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFZpZXdUcmFuc2Zvcm0gZXh0ZW5kcyBUcmFuc2Zvcm0ge1xuXHR3aWR0aDogbnVtYmVyO1xuXHRoZWlnaHQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIEJhc2ljVmlld1RyYW5zZm9ybSBleHRlbmRzIEJhc2ljVHJhbnNmb3JtIGltcGxlbWVudHMgVmlld1RyYW5zZm9ybSB7XG5cblx0Y29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIFxuXHRcdHJlYWRvbmx5IHdpZHRoOiBudW1iZXIsIHJlYWRvbmx5IGhlaWdodDogbnVtYmVyLFxuXHRcdHpvb21YOiBudW1iZXIsIHpvb21ZOiBudW1iZXIsIFxuXHQgICAgcm90YXRpb246IG51bWJlcil7XG5cblx0XHRzdXBlcih4LCB5LCB6b29tWCwgem9vbVksIHJvdGF0aW9uKTtcblx0fVxuXG59XG5cblxuXG4iLCJpbXBvcnQgeyBWaWV3VHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgQ2FudmFzVmlldyB9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcblxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTW91c2VDb250cm9sbGVyIHtcblxuICAgIG1vdXNlUG9zaXRpb24oZXZlbnQ6IE1vdXNlRXZlbnQsIHdpdGhpbjogSFRNTEVsZW1lbnQpOiBBcnJheTxudW1iZXI+IHtcbiAgICAgICAgbGV0IG1fcG9zeCA9IGV2ZW50LmNsaWVudFggKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnRcbiAgICAgICAgICAgICAgICAgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdDtcbiAgICAgICAgbGV0IG1fcG9zeSA9IGV2ZW50LmNsaWVudFkgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7XG5cbiAgICAgICAgdmFyIGVfcG9zeCA9IDA7XG4gICAgICAgIHZhciBlX3Bvc3kgPSAwO1xuXG4gICAgICAgIGlmICh3aXRoaW4ub2Zmc2V0UGFyZW50KXtcbiAgICAgICAgICAgIGRvIHsgXG4gICAgICAgICAgICAgICAgZV9wb3N4ICs9IHdpdGhpbi5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgICAgIGVfcG9zeSArPSB3aXRoaW4ub2Zmc2V0VG9wO1xuICAgICAgICAgICAgfSB3aGlsZSAod2l0aGluID0gPEhUTUxFbGVtZW50PndpdGhpbi5vZmZzZXRQYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFttX3Bvc3ggLSBlX3Bvc3gsIG1fcG9zeSAtIGVfcG9zeV07XG4gICAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBWaWV3Q29udHJvbGxlciBleHRlbmRzIE1vdXNlQ29udHJvbGxlciB7XG5cblx0cmVjb3JkOiBib29sZWFuO1xuXHRtb3ZlOiBudW1iZXIgPSAxO1xuXG5cdHByaXZhdGUgeFByZXZpb3VzOiBudW1iZXI7XG5cdHByaXZhdGUgeVByZXZpb3VzOiBudW1iZXI7XG5cblx0Y29uc3RydWN0b3Iodmlld1RyYW5zZm9ybTogVmlld1RyYW5zZm9ybSwgXG4gICAgICAgIHJlYWRvbmx5IGRyYWdFbGVtZW50OiBIVE1MRWxlbWVudCwgcmVhZG9ubHkgY2FudmFzVmlldzogQ2FudmFzVmlldykge1xuXG4gICAgXHRzdXBlcigpO1xuICAgIFx0ZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm0pKTtcbiAgICBcdGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3VHJhbnNmb3JtKSk7XG4gICAgICAgIGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm0pKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5yZWNvcmQgPSBmYWxzZSk7XG4gICAgICAgIGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkYmxjbGlja1wiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuY2xpY2tlZChlIGFzIE1vdXNlRXZlbnQsIGNhbnZhc1ZpZXcsIDEuMikpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwid2hlZWxcIiwgKGU6IEV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMud2hlZWwoZSBhcyBXaGVlbEV2ZW50LCBjYW52YXNWaWV3KSk7XG4gICAgfVxuXG4gICAgY2xpY2tlZChldmVudDogTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybTogVmlld1RyYW5zZm9ybSwgem9vbUJ5OiBudW1iZXIpe1xuICAgIFx0c3dpdGNoKGV2ZW50LnR5cGUpe1xuICAgIFx0XHRjYXNlIFwiZGJsY2xpY2tcIjpcbiAgICAgICAgICAgICAgICBpZiAgKGV2ZW50LmN0cmxLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgem9vbUJ5ID0gMSAvIHpvb21CeTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbGV0IG1YWSA9IHRoaXMubW91c2VQb3NpdGlvbihldmVudCwgdGhpcy5kcmFnRWxlbWVudCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuem9vbUFib3V0KG1YWVswXSwgbVhZWzFdLCB6b29tQnkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3LmRyYXcoKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmFnZ2VkKGV2ZW50OiBNb3VzZUV2ZW50LCB2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtKSB7XG5cbiAgICBcdHN3aXRjaChldmVudC50eXBlKXtcbiAgICBcdFx0Y2FzZSBcIm1vdXNlZG93blwiOlxuICAgIFx0XHRcdHRoaXMucmVjb3JkID0gdHJ1ZTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIm1vdXNldXBcIjpcbiAgICBcdFx0XHR0aGlzLnJlY29yZCA9IGZhbHNlO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRkZWZhdWx0OlxuICAgIFx0XHRcdGlmICh0aGlzLnJlY29yZCl7XG4gICAgICAgICAgICAgICAgICAgIGxldCB4RGVsdGEgPSAoZXZlbnQuY2xpZW50WCAtIHRoaXMueFByZXZpb3VzKSAvIHRoaXMubW92ZSAvIHZpZXdUcmFuc2Zvcm0uem9vbVg7XG4gICAgICAgICAgICAgICAgICAgIGxldCB5RGVsdGEgPSAoZXZlbnQuY2xpZW50WSAtIHRoaXMueVByZXZpb3VzKSAvIHRoaXMubW92ZSAvIHZpZXdUcmFuc2Zvcm0uem9vbVk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmlld1RyYW5zZm9ybS54ID0gdmlld1RyYW5zZm9ybS54IC0geERlbHRhO1xuICAgICAgICAgICAgICAgICAgICB2aWV3VHJhbnNmb3JtLnkgPSB2aWV3VHJhbnNmb3JtLnkgLSB5RGVsdGE7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3LmRyYXcoKTtcbiAgICBcdFx0XHR9XG5cblx0XHRcdHRoaXMueFByZXZpb3VzID0gZXZlbnQuY2xpZW50WDtcblx0XHRcdHRoaXMueVByZXZpb3VzID0gZXZlbnQuY2xpZW50WTtcbiAgICBcdH1cbiAgICB9XG5cbiAgICB3aGVlbChldmVudDogV2hlZWxFdmVudCwgdmlld1RyYW5zZm9ybTogVmlld1RyYW5zZm9ybSkge1xuXG4gICAgICAgIC8vY29uc29sZS5sb2coXCJ3aGVlbFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQudHlwZSk7XG5cbiAgICAgICAgbGV0IHhEZWx0YSA9IGV2ZW50LmRlbHRhWCAvIHRoaXMubW92ZSAvIHZpZXdUcmFuc2Zvcm0uem9vbVg7XG4gICAgICAgIGxldCB5RGVsdGEgPSBldmVudC5kZWx0YVkgLyB0aGlzLm1vdmUgLyB2aWV3VHJhbnNmb3JtLnpvb21ZO1xuXG4gICAgICAgIGlmICAoZXZlbnQuY3RybEtleSkge1xuICAgICAgICAgICAgbGV0IG1YWSA9IHRoaXMubW91c2VQb3NpdGlvbihldmVudCwgdGhpcy5kcmFnRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgYnkgPSAxLjA1O1xuICAgICAgICAgICAgaWYgKHlEZWx0YSA8IDApe1xuICAgICAgICAgICAgICAgIGJ5ID0gMC45NTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3Lnpvb21BYm91dChtWFlbMF0sIG1YWVsxXSwgYnkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3LnggPSAgdGhpcy5jYW52YXNWaWV3LnggKyB4RGVsdGE7XG4gICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcueSA9ICB0aGlzLmNhbnZhc1ZpZXcueSArIHlEZWx0YTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5jYW52YXNWaWV3LmRyYXcoKTtcbiAgICB9XG5cbn1cbiIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1xuXHRcIm5hbWVcIjogXCIyLTJcIiwgXCJ4XCI6IC0zNjQsIFwieVwiOiAtMTIuNSwgXCJ6b29tWFwiOiAwLjIxMywgXCJ6b29tWVwiOiAwLjIwNSwgXCJyb3RhdGlvblwiOiAtMC4zMSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDAycl8yW1NWQzJdLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjNcIiwgXCJ4XCI6IC0yMTYsIFwieVwiOiAtMC43MDUsIFwiem9vbVhcIjogMC4yLCBcInpvb21ZXCI6IDAuMjEsIFwicm90YXRpb25cIjogLTAuNTEsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwM3JbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiNFwiLCBcInhcIjogLTc0LjI5LCBcInlcIjogLTk5Ljc4LCBcInpvb21YXCI6IDAuMjIyLCBcInpvb21ZXCI6IDAuMjA4LCBcInJvdGF0aW9uXCI6IC0wLjI4NSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA0cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI1XCIsIFwieFwiOiAtMzY2LjUsIFwieVwiOiAxODAuMDE5LCBcInpvb21YXCI6IDAuMjE1LCBcInpvb21ZXCI6IDAuMjA3LCBcInJvdGF0aW9uXCI6IC0wLjIxLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDVyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjZcIiwgXCJ4XCI6IC0yMDYuMTYsIFwieVwiOiAxNDYsIFwiem9vbVhcIjogMC4yMSwgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAtMC4yMTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwNnJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiN1wiLCBcInhcIjogLTYzLjMsIFwieVwiOiAxMDAuMzc3NiwgXCJ6b29tWFwiOiAwLjIxMjUsIFwiem9vbVlcIjogMC4yMTMsIFwicm90YXRpb25cIjogLTAuMjMsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwN3JbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiOFwiLCBcInhcIjogNzguMSwgXCJ5XCI6IDU4LjUzNSwgXCJ6b29tWFwiOiAwLjIwNywgXCJ6b29tWVwiOiAwLjIxNywgXCJyb3RhdGlvblwiOiAtMC4yNSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA4cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI5XCIsIFwieFwiOiAyMTkuNSwgXCJ5XCI6IDI0LCBcInpvb21YXCI6IDAuMjE1LCBcInpvb21ZXCI6IDAuMjE0NSwgXCJyb3RhdGlvblwiOiAtMC4yNixcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDlyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjEwXCIsIFwieFwiOiA0NTQuMjEsIFwieVwiOiAtMS41LCBcInpvb21YXCI6IDAuMjE4LCBcInpvb21ZXCI6IDAuMjE0LCBcInJvdGF0aW9uXCI6IDAuMDE1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTByXzJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTFcIiwgXCJ4XCI6IDYyMS44NiwgXCJ5XCI6IDI1LjUyNSwgXCJ6b29tWFwiOiAwLjIxMywgXCJ6b29tWVwiOiAwLjIxMTUsIFwicm90YXRpb25cIjogMC4xMSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDExcltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSwgXG5cdHtcblx0XCJuYW1lXCI6IFwiMTItMVwiLCBcInhcIjogNzY5LjY0NSwgXCJ5XCI6IDUwLjI2NSwgXCJ6b29tWFwiOiAwLjQyNCwgXCJ6b29tWVwiOiAwLjQyMiwgXCJyb3RhdGlvblwiOiAwLjEyLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTJyXzFbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTRcIiwgXCJ4XCI6IC05MTUuNiwgXCJ5XCI6IDU1Ny44NjUsIFwiem9vbVhcIjogMC4yMDgsIFwiem9vbVlcIjogMC4yMDgsIFwicm90YXRpb25cIjogLTEuMjE1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTRSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE1LTJcIiwgXCJ4XCI6IC03MTcuMywgXCJ5XCI6IDU3MiwgXCJ6b29tWFwiOiAwLjIxLCBcInpvb21ZXCI6IDAuMjA2LCBcInJvdGF0aW9uXCI6IC0xLjQ3LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTVyXzJbU1ZDMl0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTYtMlwiLCBcInhcIjogLTkyLCBcInlcIjogMzM2LjUsIFwiem9vbVhcIjogMC4yMTcsIFwiem9vbVlcIjogMC4yMSwgXCJyb3RhdGlvblwiOiAtMC4xLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTZyXzJbU1ZDMl0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTdcIiwgXCJ4XCI6IDc3LCBcInlcIjogMjc4LjUsIFwiem9vbVhcIjogMC4yMDYsIFwiem9vbVlcIjogMC4yMDYsIFwicm90YXRpb25cIjogLTAuMDU1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTdSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE4XCIsIFwieFwiOiAyMjksIFwieVwiOiAyMzkuNSwgXCJ6b29tWFwiOiAwLjIwOCwgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAwLjA3LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMThSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE5XCIsIFwieFwiOiA3MS41LCBcInlcIjogNDc0LCBcInpvb21YXCI6IDAuMjAzLCBcInpvb21ZXCI6IDAuMjA4LCBcInJvdGF0aW9uXCI6IDAuMTcsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxOVJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMjBcIiwgXCJ4XCI6IDQzLjUsIFwieVwiOiA2NDAsIFwiem9vbVhcIjogMC4xLCBcInpvb21ZXCI6IDAuMTA0LCBcInJvdGF0aW9uXCI6IDAuMjA1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMjBSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9XG5cbl1cblxuXG5cbiIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1xuXHRcdFwibmFtZVwiOiBcImhlbnJpZXR0YVwiLCBcInhcIjogLTQ4Ni41LCBcInlcIjogLTI1Mi41LCBcInpvb21YXCI6IDAuMjksIFwiem9vbVlcIjogMC41LCBcInJvdGF0aW9uXCI6IDAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9oZW5yaWV0dGEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibWF0ZXJcIiwgXCJ4XCI6IC0zNDIsIFwieVwiOiAtNzQ3LCBcInpvb21YXCI6IDAuMDgsIFwiem9vbVlcIjogMC4xOCwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21hdGVybWlzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInBldGVyc1wiLCBcInhcIjogLTcxOSwgXCJ5XCI6IC04MzYsIFwiem9vbVhcIjogMC4wNywgXCJ6b29tWVwiOiAwLjE0LCBcInJvdGF0aW9uXCI6IC0wLjE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvcGV0ZXJzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm9jb25uZWxsXCIsIFwieFwiOiAtODIxLCBcInlcIjogLTE4MzUsIFwiem9vbVhcIjogMC4yNSwgXCJ6b29tWVwiOiAwLjI1LCBcInJvdGF0aW9uXCI6IDAsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9vY29ubmVsbC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImZvdXJjb3VydHNcIiwgXCJ4XCI6IC01NjcuNSwgXCJ5XCI6IDMyMy41LCBcInpvb21YXCI6IDAuMTYsIFwiem9vbVlcIjogMC4zMjgsIFwicm90YXRpb25cIjogLTAuMTIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9mb3VyY291cnRzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibWljaGFuc1wiLCBcInhcIjogLTYzOSwgXCJ5XCI6IDE2MCwgXCJ6b29tWFwiOiAwLjE0LCBcInpvb21ZXCI6IDAuMjQsIFwicm90YXRpb25cIjogMC4wMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21pY2hhbnMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ0aGVjYXN0bGVcIiwgXCJ4XCI6IC0yOTAsIFwieVwiOiA1MjAsIFwiem9vbVhcIjogMC4yMiwgXCJ6b29tWVwiOiAwLjQyLCBcInJvdGF0aW9uXCI6IC0wLjAxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL3RoZWNhc3RsZS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtYXJrZXRcIiwgXCJ4XCI6IC02MTcsIFwieVwiOiA1NjUsIFwiem9vbVhcIjogMC4xNSwgXCJ6b29tWVwiOiAwLjI2LCBcInJvdGF0aW9uXCI6IDAuMDQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9tYXJrZXQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJwYXRyaWNrc1wiLCBcInhcIjogLTQ2MiwgXCJ5XCI6IDc5NSwgXCJ6b29tWFwiOiAwLjEsIFwiem9vbVlcIjogMC4xMiwgXCJyb3RhdGlvblwiOiAwLjA0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvcGF0cmlja3MucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJuZ2lyZWxhbmRcIiwgXCJ4XCI6IDQzMSwgXCJ5XCI6IDY5NCwgXCJ6b29tWFwiOiAwLjE0LCBcInpvb21ZXCI6IDAuMzc1LCBcInJvdGF0aW9uXCI6IC0wLjEzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL25naXJlbGFuZC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjhcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImJsdWVjb2F0c1wiLCBcInhcIjogLTk5NywgXCJ5XCI6IDg2LCBcInpvb21YXCI6IDAuMSwgXCJ6b29tWVwiOiAwLjIsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9ibHVlY29hdHMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJjb2xsaW5zYmFycmFja3NcIiwgXCJ4XCI6IC0xMTMwLCBcInlcIjogOTAsIFwiem9vbVhcIjogMC4xMywgXCJ6b29tWVwiOiAwLjM3LCBcInJvdGF0aW9uXCI6IDAuMDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvY29sbGluc2JhcnJhY2tzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiaHVnaGxhbmVcIiwgXCJ4XCI6IC0xNzIsIFwieVwiOiAtMzM1LCBcInpvb21YXCI6IDAuMiwgXCJ6b29tWVwiOiAwLjMzLCBcInJvdGF0aW9uXCI6IC0wLjA2LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvaHVnaGxhbmUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJncG9cIiwgXCJ4XCI6IDUyLCBcInlcIjogNTAsIFwiem9vbVhcIjogMC4wODYsIFwiem9vbVlcIjogMC4yNSwgXCJyb3RhdGlvblwiOiAtMC4wMzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9ncG8ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtb3VudGpveVwiLCBcInhcIjogMjYzLCBcInlcIjogLTU2MCwgXCJ6b29tWFwiOiAwLjE1LCBcInpvb21ZXCI6IDAuMjg1LCBcInJvdGF0aW9uXCI6IDAuMTcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9tb3VudGpveS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm1vdW50am95YlwiLCBcInhcIjogMTUyLCBcInlcIjogLTU3MCwgXCJ6b29tWFwiOiAwLjIsIFwiem9vbVlcIjogMC4zMDUsIFwicm90YXRpb25cIjogMC4wNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21vdW50am95Yi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInJveWFsaG9zcGl0YWxcIiwgXCJ4XCI6IC0xODUxLCBcInlcIjogNDg3LjUsIFwiem9vbVhcIjogMC4yMSwgXCJ6b29tWVwiOiAwLjMsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9yb3lhbGhvc3BpdGFsLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwicGVwcGVyXCIsIFwieFwiOiA4MzQsIFwieVwiOiA5OTAsIFwiem9vbVhcIjogMC4wNiwgXCJ6b29tWVwiOiAwLjE0NSwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL3BlcHBlci5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImxpYmVydHloYWxsXCIsIFwieFwiOiAyNzAsIFwieVwiOiAtMTQsIFwiem9vbVhcIjogMC40MywgXCJ6b29tWVwiOiAwLjQzLCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbGliZXJ0eS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImN1c3RvbXNob3VzZVwiLCBcInhcIjogMzgyLCBcInlcIjogMTA3LCBcInpvb21YXCI6IDAuMTUsIFwiem9vbVlcIjogMC4zMCwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2N1c3RvbXNob3VzZS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fVxuXSIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMzJcIiwgXCJ4XCI6IC03NDUsIFwieVwiOiAxMC4wNSwgXCJ6b29tWFwiOiAwLjI1LCBcInpvb21ZXCI6IDAuMjUsIFwicm90YXRpb25cIjogLTEuNDMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0wMzItbS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDb25zdGl0dXRpb24gSGlsbCAtIFR1cm5waWtlLCBHbGFzbmV2aW4gUm9hZDsgc2hvd2luZyBwcm9wb3NlZCByb2FkIHRvIEJvdGFuaWMgR2FyZGVuc1wiLFxuXHRcdFwiZGF0ZVwiOiAxNzk4XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDcyXCIsICBcInhcIjogLTI2MC41LCBcInlcIjogLTI0Ny41LCBcInpvb21YXCI6IDAuMzEsIFwiem9vbVlcIjogMC4zMSwgXCJyb3RhdGlvblwiOiAxLjU4NSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMDcyLW0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIGltcHJvdmluZyB0aGUgc3RyZWV0cyBiZXR3ZWVuIFJpY2htb25kIEJyaWRnZSAoRm91ciBDb3VydHMpIGFuZCBDb25zdGl0dXRpb24gSGlsbCAoS2luZ+KAmXMgSW5ucykgRGF0ZTogMTgzN1wiLFxuXHRcdFwiZGF0ZVwiOiAxODM3XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDc1XCIsIFwieFwiOiAtMjE3LjUsIFwieVwiOiAtMTQxNC41LCBcInpvb21YXCI6IDAuODcsIFwiem9vbVlcIjogMC43NzIsIFwicm90YXRpb25cIjogMS42MTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0wNzUtbS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiBhIGxpbmUgb2Ygcm9hZCwgbGVhZGluZyBmcm9tIExpbmVuIEhhbGwgdG8gR2xhc25ldmluIFJvYWQsIHNob3dpbmcgdGhlIFJveWFsIENhbmFsIERhdGU6IDE4MDBcIixcblx0XHRcImRhdGVcIjogMTgwMFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM2MVwiLCBcInhcIjogNDY0LCBcInlcIjogMjEzMSwgXCJ6b29tWFwiOiAwLjQzNiwgXCJ6b29tWVwiOiAwLjQzNiwgXCJyb3RhdGlvblwiOiAtMi4wNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNjEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJMZWVzb24gU3RyZWV0LCBQb3J0bGFuZCBTdHJlZXQgKG5vdyBVcHBlciBMZWVzb24gU3RyZWV0KSwgRXVzdGFjZSBQbGFjZSwgRXVzdGFjZSBCcmlkZ2UgKG5vdyBMZWVzb24gU3RyZWV0KSwgSGF0Y2ggU3RyZWV0LCBDaXJjdWxhciBSb2FkIC0gc2lnbmVkIGJ5IENvbW1pc3Npb25lcnMgb2YgV2lkZSBTdHJlZXRzIERhdGU6IDE3OTJcIixcblx0XHRcImRhdGVcIjogMTc5MlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE0MlwiLCBcInhcIjogOTQuOTk1LCBcInlcIjogMjM3Ny41LCBcInpvb21YXCI6IDAuNDgyLCBcInpvb21ZXCI6IDAuNDc2LCBcInJvdGF0aW9uXCI6IC0yLjAxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE0Mi1sLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDEuMCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBOZXcgU3RyZWV0cywgYW5kIG90aGVyIGltcHJvdmVtZW50cyBpbnRlbmRlZCB0byBiZSBpbW1lZGlhdGVseSBleGVjdXRlZC4gU2l0dWF0ZSBvbiB0aGUgU291dGggU2lkZSBvZiB0aGUgQ2l0eSBvZiBEdWJsaW4sIHN1Ym1pdHRlZCBmb3IgdGhlIGFwcHJvYmF0aW9uIG9mIHRoZSBDb21taXNzaW9uZXJzIG9mIFdpZGUgU3RyZWV0cywgcGFydGljdWxhcmx5IG9mIHRob3NlIHBhcnRzIGJlbG9uZ2luZyB0byBXbS4gQ29wZSBhbmQgSm9obiBMb2NrZXIsIEVzcS4sIEhhcmNvdXJ0IFN0cmVldCwgQ2hhcmxlbW91bnQgU3RyZWV0LCBQb3J0b2JlbGxvLCBldGMuIERhdGU6IDE3OTJcIixcblx0XHRcImRhdGVcIjogMTc5MlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE1NVwiLCBcInhcIjogLTE1MDYsIFwieVwiOiAtNTAuNSwgXCJ6b29tWFwiOiAwLjY3LCBcInpvb21ZXCI6IDAuNjQ0LCBcInJvdGF0aW9uXCI6IC0wLjAyNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE1NS1sLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTmV3IGFwcHJvYWNoIGZyb20gTWlsaXRhcnkgUm9hZCB0byBLaW5n4oCZcyBCcmlkZ2UsIGFuZCBhbG9uZyB0aGUgUXVheXMgdG8gQXN0b27igJlzIFF1YXkgRGF0ZTogMTg0MVwiLFxuXHRcdFwiZGF0ZVwiOiAxODQxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTU3LTNcIiwgXCJ4XCI6IDMuMTE1LCBcInlcIjogMy42NSwgXCJ6b29tWFwiOiAwLjUyNSwgXCJ6b29tWVwiOiAwLjU5LCBcInJvdGF0aW9uXCI6IDAuNTQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0xNTctMy1tLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuMCwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcInNob3dpbmcgdGhlIGltcHJvdmVtZW50cyBwcm9wb3NlZCBieSB0aGUgQ29tbWlzc2lvbmVycyBvZiBXaWRlIFN0cmVldHMgaW4gTmFzc2F1IFN0cmVldCwgTGVpbnN0ZXIgU3RyZWV0IGFuZCBDbGFyZSBTdHJlZXRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE2NFwiLCBcInhcIjogLTQ3MiwgXCJ5XCI6ODA1LCBcInpvb21YXCI6IDAuMDU2LCBcInpvb21ZXCI6IDAuMDU2LCBcInJvdGF0aW9uXCI6IDAuMDksIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0xNjQtbC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxLjAsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIFNhaW50IFBhdHJpY2vigJlzLCBldGMuIERhdGU6IDE4MjRcIixcblx0XHRcImRhdGVcIjogMTgyNFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ2OS0wMlwiLCBcInhcIjogMjU1LCBcInlcIjogMTM4OS41LCBcInpvb21YXCI6IDAuMjQ1LCBcInpvb21ZXCI6IDAuMjQ1LCBcInJvdGF0aW9uXCI6IC0yLjc1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNDY5LTItbS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJFYXJsc2ZvcnQgVGVycmFjZSwgU3RlcGhlbuKAmXMgR3JlZW4gU291dGggYW5kIEhhcmNvdXJ0IFN0cmVldCBzaG93aW5nIHBsYW4gb2YgcHJvcG9zZWQgbmV3IHN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzU1LTFcIiwgXCJ4XCI6IDY5NiwgXCJ5XCI6IDcxMy41LCBcInpvb21YXCI6IDAuMzIzLCBcInpvb21ZXCI6IDAuMjg5LCBcInJvdGF0aW9uXCI6IDEuMTQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzU1LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBvZiBCYWdnb3QgU3RyZWV0IGFuZCBGaXR6d2lsbGlhbSBTdHJlZXQsIHNob3dpbmcgYXZlbnVlcyB0aGVyZW9mIE5vLiAxIERhdGU6IDE3OTBcIixcblx0XHRcImRhdGVcIjogMTc5MFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTcyOVwiLCBcInhcIjogLTEwOTYsIFwieVwiOiA2NjksIFwiem9vbVhcIjogMC4xMjYsIFwiem9vbVlcIjogMC4xMTgsIFwicm90YXRpb25cIjogLTMuNDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNzI5LWwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gSmFtZXPigJlzIFN0cmVldCwgQmFzb24gTGFuZSwgRWNobGlu4oCZcyBMYW5lLCBHcmFuZCBDYW5hbCBQbGFjZSwgQ2l0eSBCYXNvbiBhbmQgR3JhbmQgQ2FuYWwgSGFyYm91clwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNzU3XCIsIFwieFwiOiAtODgxLCBcInlcIjogMjYxLjUsIFwiem9vbVhcIjogMC4zNTUsIFwiem9vbVlcIjogMC4zNTUsIFwicm90YXRpb25cIjogLTAuMDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNzU3LWwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGFydCBvZiB0aGUgQ2l0eSBvZiBEdWJsaW4gd2l0aCBwcm9wb3NlZCBpbXByb3ZlbWVudHMuIEltcHJvdmVtZW50cyB0byBiZSBtYWRlIG9yIGludGVuZGVkIGluIFRob21hcyBTdHJlZXQsIEhpZ2ggU3RyZWV0LCBXaW5ldGF2ZXJuIFN0cmVldCwgU2tpbm5lciBSb3csIFdlcmJ1cmdoIFN0cmVldCwgQ2Fub24gU3RyZWV0LCBQYXRyaWNrIFN0cmVldCwgS2V2aW4gU3RyZWV0LCBCaXNob3AgU3RyZWV0IGFuZCBUaGUgQ29vbWJlIFRob21hcyBTaGVycmFyZCBEYXRlOiAxODE3XCIsXG5cdFx0XCJkYXRlXCI6IDE4MTdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMzhcIiwgXCJ4XCI6IDIxMi41LCBcInlcIjogMTQ3LCBcInpvb21YXCI6IDAuMTksIFwiem9vbVlcIjogMC4xNzYsIFwicm90YXRpb25cIjogMCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTEzOC1sLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHByZW1pc2VzLCBHZW9yZ2XigJlzIFF1YXksIENpdHkgUXVheSwgVG93bnNlbmQgU3RyZWV0IGFuZCBuZWlnaGJvdXJob29kLCBzaG93aW5nIHByb3BlcnR5IGxvc3QgdG8gdGhlIENpdHksIGluIGEgc3VpdCBieSAnVGhlIENvcnBvcmF0aW9uIC0gd2l0aCBUcmluaXR5IENvbGxlZ2UnXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xODlcIiwgXCJ4XCI6IC03OTIuNSwgXCJ5XCI6IDI2Mi41LCBcInpvb21YXCI6IDAuMjYsIFwiem9vbVlcIjogMC4yNTgsIFwicm90YXRpb25cIjogMC4wMDMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTg5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQ29weSBvZiBtYXAgb2YgcHJvcG9zZWQgTmV3IFN0cmVldCBmcm9tIEVzc2V4IFN0cmVldCB0byBDb3JubWFya2V0LCB3aXRoIHRoZSBlbnZpcm9ucyBhbmQgc3RyZWV0cyBicmFuY2hpbmcgb2ZmXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wOThcIiwgXCJ4XCI6IC00NzUsIFwieVwiOiA1MjQsIFwiem9vbVhcIjogMC4wNjMsIFwiem9vbVlcIjogMC4wNjMsIFwicm90YXRpb25cIjogLTAuMTYsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0wOTgucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgQ2hyaXN0Y2h1cmNoLCBTa2lubmVycyBSb3cgZXRjLiBUaG9tYXMgU2hlcnJhcmQsIDUgSmFudWFyeSAxODIxIERhdGU6IDE4MjFcIixcblx0XHRcImRhdGVcIjogMTgyMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTIwMlwiLCBcInhcIjogMTYsIFwieVwiOiA4MSwgXCJ6b29tWFwiOiAwLjI4OSwgXCJ6b29tWVwiOiAwLjI2MywgXCJyb3RhdGlvblwiOiAtMC4xMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjAyLWMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJhcmVhIGltbWVkaWF0ZWx5IG5vcnRoIG9mIFJpdmVyIExpZmZleSBmcm9tIFNhY2t2aWxsZSBTdCwgTG93ZXIgQWJiZXkgU3QsIEJlcmVzZm9yZCBQbGFjZSwgYXMgZmFyIGFzIGVuZCBvZiBOb3J0aCBXYWxsLiBBbHNvIHNvdXRoIG9mIExpZmZleSBmcm9tIFdlc3Rtb3JsYW5kIFN0cmVldCB0byBlbmQgb2YgSm9obiBSb2dlcnNvbidzIFF1YXlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE3OVwiLCBcInhcIjogLTUzNy41LCBcInlcIjogNzMwLCBcInpvb21YXCI6IDAuMTY4LCBcInpvb21ZXCI6IDAuMTY0LCBcInJvdGF0aW9uXCI6IDAuMDIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTc5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDEuMCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU2FpbnQgUGF0cmlja+KAmXMgQ2F0aGVkcmFsLCBOb3J0aCBDbG9zZSBhbmQgdmljaW5pdHlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTMyOVwiLCBcInhcIjogLTY3MC41LCBcInlcIjogMzQ3LCBcInpvb21YXCI6IDAuMzM4LCBcInpvb21ZXCI6IDAuMzMyLCBcInJvdGF0aW9uXCI6IC0wLjIxLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMyOS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjMsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gZm9yIG9wZW5pbmcgYW5kIHdpZGVuaW5nIGEgcHJpbmNpcGFsIEF2ZW51ZSB0byB0aGUgQ2FzdGxlLCBub3cgKDE5MDApIFBhcmxpYW1lbnQgU3RyZWV0IC0gc2hvd2luZyBEYW1lIFN0cmVldCwgQ2FzdGxlIFN0cmVldCwgYW5kIGFsbCB0aGUgQXZlbnVlcyB0aGVyZW9mIERhdGU6IDE3NTdcIixcblx0XHRcImRhdGVcIjogMTc1N1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE4N1wiLCBcInhcIjogLTIyNiwgXCJ5XCI6IDQ5NC41LCBcInpvb21YXCI6IDAuMDY2LCBcInpvb21ZXCI6IDAuMDY0LCBcInJvdGF0aW9uXCI6IDAuMCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xODcucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMS4wLFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJBIHN1cnZleSBvZiBzZXZlcmFsIGhvbGRpbmdzIGluIFNvdXRoIEdyZWF0IEdlb3JnZSdzIFN0cmVldCAtIHRvdGFsIHB1cmNoYXNlIMKjMTE1MjguMTYuMyBEYXRlOjE4MDFcIixcblx0XHRcImRhdGVcIjogMTgwMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTEyNFwiLCBcInhcIjogLTI3OSwgXCJ5XCI6IDM2NiwgXCJ6b29tWFwiOiAwLjA1NywgXCJ6b29tWVwiOiAwLjA1MSwgXCJyb3RhdGlvblwiOiAtMC4xNiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xMjQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcHJlbWlzZXMgaW4gRXNzZXggU3RyZWV0IGFuZCBQYXJsaWFtZW50IFN0cmVldCwgc2hvd2luZyBFc3NleCBCcmlkZ2UgYW5kIE9sZCBDdXN0b20gSG91c2UuIFQuIGFuZCBELkguIFNoZXJyYXJkIERhdGU6IDE4MTNcIixcblx0XHRcImRhdGVcIjogMTgxM1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM2MFwiLCBcInhcIjogLTE0NCwgXCJ5XCI6IDQyMS41LCBcInpvb21YXCI6IDAuMTIxLCBcInpvb21ZXCI6IDAuMTA3LCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM2MC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCAtIERhbWUgU3RyZWV0IGFuZCBhdmVudWVzIHRoZXJlb2YgLSBFdXN0YWNlIFN0cmVldCwgQ2VjaWxpYSBTdHJlZXQsIGFuZCBzaXRlIG9mIE9sZCBUaGVhdHJlLCBGb3duZXMgU3RyZWV0LCBDcm93biBBbGxleSBhbmQgQ29wZSBTdHJlZXQgRGF0ZTogMTc5MlwiLCBcblx0XHRcImRhdGVcIjogMTc5MlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM2MlwiLCBcInhcIjogMzUuNSwgXCJ5XCI6IDg0LjUsIFwiem9vbVhcIjogMC4yMjksIFwiem9vbVlcIjogMC4yMzUsIFwicm90YXRpb25cIjogMC4xMjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzYyLTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXBzIC0gQ29sbGVnZSBHcmVlbiwgQ29sbGVnZSBTdHJlZXQsIFdlc3Rtb3JlbGFuZCBTdHJlZXQgYW5kIGF2ZW51ZXMgdGhlcmVvZiwgc2hvd2luZyB0aGUgc2l0ZSBvZiBQYXJsaWFtZW50IEhvdXNlIGFuZCBUcmluaXR5IENvbGxlZ2UgTm8uIDEgRGF0ZTogMTc5M1wiLCBcblx0XHRcImRhdGVcIjogMTc5M1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM4N1wiLCBcInhcIjogMjcyLjUsIFwieVwiOiA0MjMuNSwgXCJ6b29tWFwiOiAwLjA4MSwgXCJ6b29tWVwiOiAwLjA3NywgXCJyb3RhdGlvblwiOiAzLjAzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zODcucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTdXJ2ZXkgb2YgaG9sZGluZ3MgaW4gRmxlZXQgU3RyZWV0IGFuZCBDb2xsZWdlIFN0cmVldCwgc2hvd2luZyBzaXRlIG9mIE9sZCBXYXRjaCBIb3VzZSBEYXRlOiAxODAxXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjE4XCIsIFwieFwiOiAtMjQ1NSwgXCJ5XCI6IC0yODQuNSwgXCJ6b29tWFwiOiAwLjQ1MywgXCJ6b29tWVwiOiAwLjQ1MSwgXCJyb3RhdGlvblwiOiAtMC4wNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yMTgucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTdXJ2ZXkgb2YgdGhlIExvbmcgTWVhZG93cyBhbmQgcGFydCBvZiB0aGUgUGhvZW5peCBQYXJrIGFuZCBQYXJrZ2F0ZSBTdHJlZXQgRGF0ZTogMTc4NlwiLCBcblx0XHRcImRhdGVcIjogMTc4NlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTIyOVwiLCBcInhcIjogLTIzODQsIFwieVwiOiA1NS41LCBcInpvb21YXCI6IDAuMzc5LCBcInpvb21ZXCI6IDAuMzc5LCBcInJvdGF0aW9uXCI6IDAuMDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTIyOS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjYsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlNlY3Rpb24gYWNyb3NzIHRoZSBwcm9wb3NlZCBSb2FkIGZyb20gdGhlIFBhcmsgR2F0ZSB0byBJc2xhbmQgQnJpZGdlIEdhdGUgLSBub3cgKDE5MDApIENvbnluZ2hhbSBSb2FkIERhdGU6IDE3ODlcIiwgXG5cdFx0XCJkYXRlXCI6IDE3ODlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yNDJcIiwgXCJ4XCI6IC00MDUuNSwgXCJ5XCI6IDIxLCBcInpvb21YXCI6IDAuMDg0LCBcInpvb21ZXCI6IDAuMDg0LCBcInJvdGF0aW9uXCI6IDEuMDg1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTI0Mi0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIGEgaG9sZGluZyBpbiBNYXJ54oCZcyBMYW5lLCB0aGUgZXN0YXRlIG9mIHRoZSBSaWdodCBIb25vdXJhYmxlIExvcmQgTW91bnRqb3kgRGF0ZTogMTc5M1wiLCBcblx0XHRcImRhdGVcIjogMTc5M1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTI0NVwiLCBcInhcIjogLTIxMC4wLCBcInlcIjotMzk3LjUsIFwiem9vbVhcIjogMC4wODQsIFwiem9vbVlcIjogMC4wODQsIFwicm90YXRpb25cIjogLTAuNjIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjQ1LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgdGhlIEJhcmxleSBGaWVsZHMgZXRjLiwgYW5kIGEgcGxhbiBmb3Igb3BlbmluZyBhIHN0cmVldCBmcm9tIFJ1dGxhbmQgU3F1YXJlLCBEb3JzZXQgU3RyZWV0LCBiZWluZyBub3cgKDE4OTkpIGtub3duIGFzIFNvdXRoIEZyZWRlcmljayBTdHJlZXQgLSB3aXRoIHJlZmVyZW5jZSBEYXRlOiAxNzg5XCIsXG5cdFx0IFwiZGF0ZVwiOiAxNzg5XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjU3XCIsIFwieFwiOiA2ODEuMCwgXCJ5XCI6LTEyMjMuNSwgXCJ6b29tWFwiOiAwLjM0NiwgXCJ6b29tWVwiOiAwLjM4OCwgXCJyb3RhdGlvblwiOiAwLjI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTI1Ny5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBDbG9ubGlmZmUgUm9hZCBhbmQgdGhlIE9sZCBUdXJucGlrZSBIb3VzZSBhdCBCYWxseWJvdWdoIEJyaWRnZSAtIE5vcnRoIFN0cmFuZCBEYXRlOiAxODIzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODIzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjY4XCIsIFwieFwiOiAtMTUyOC4wLCBcInlcIjogMTA1LjUsIFwiem9vbVhcIjogMC4wODYsIFwiem9vbVlcIjogMC4wODYsIFwicm90YXRpb25cIjogMC4wNywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yNjgtMy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCAtIFBhcmtnYXRlIFN0cmVldCwgQ29ueW5naGFtIFJvYWQsIHdpdGggcmVmZXJlbmNlIHRvIG5hbWVzIG9mIHRlbmFudHMgZW5kb3JzZWQgTm8uIDNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE3MVwiLCBcInhcIjogMTEyLjAsIFwieVwiOiAxODEuNSwgXCJ6b29tWFwiOiAwLjAyMSwgXCJ6b29tWVwiOiAwLjAyMSwgXCJyb3RhdGlvblwiOiAtMC4yNjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTcxLTIuanBlZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIExvd2VyIEFiYmV5IFN0cmVldCwgdG8gY29ybmVyIG9mIEVkZW4gUXVheSAoU2Fja3ZpbGxlIFN0cmVldCkgRGF0ZTogMTgxM1wiLCBcblx0XHRcImRhdGVcIjogMTgxM1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM4MFwiLCBcInhcIjogMjQxLjUsIFwieVwiOiAyODYsIFwiem9vbVhcIjogMC4wMzMsIFwiem9vbVlcIjogMC4wMzMsIFwicm90YXRpb25cIjogMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zODAtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjQsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCAtIEZsZWV0IE1hcmtldCwgUG9vbGJlZyBTdHJlZXQsIEhhd2tpbnMgU3RyZWV0LCBUb3duc2VuZCBTdHJlZXQsIEZsZWV0IFN0cmVldCwgRHVibGluIFNvY2lldHkgU3RvcmVzIERhdGU6IDE4MDBcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MDBcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMDlcIiwgXCJ4XCI6IDM2LjAsIFwieVwiOiAtMjk3LCBcInpvb21YXCI6IDAuMjE5LCBcInpvb21ZXCI6IDAuMjE5LCBcInJvdGF0aW9uXCI6IC0wLjQzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zMDkucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQYXJ0IG9mIEdhcmRpbmVyIFN0cmVldCBhbmQgcGFydCBvZiBHbG91Y2VzdGVyIFN0cmVldCwgbGFuZCBvdXQgaW4gbG90cyBmb3IgYnVpbGRpbmcgLSBzaG93aW5nIEdsb3VjZXN0ZXIgU3RyZWV0LCBHbG91Y2VzdGVyIFBsYWNlLCB0aGUgRGlhbW9uZCwgU3VtbWVyIEhpbGwsIEdyZWF0IEJyaXRhaW4gU3RyZWV0LCBDdW1iZXJsYW5kIFN0cmVldCwgTWFybGJvcm/igJkgU3RyZWV0LCBNYWJib3QgU3RyZWV0LCBNZWNrbGluYnVyZ2ggZXRjLkRhdGU6IDE3OTFcIiwgXG5cdFx0XCJkYXRlXCI6IDE3OTFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yOTRcIiwgXCJ4XCI6IDEyNS4wLCBcInlcIjogLTExOCwgXCJ6b29tWFwiOiAwLjEyOSwgXCJ6b29tWVwiOiAwLjEyOSwgXCJyb3RhdGlvblwiOiAtMC4xOTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0yOTQtMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiBwYXJ0IG9mIHRoZSBMb3Jkc2hpcCBvZiBTYWludCBNYXJ54oCZcyBBYmJleSAtIHBhcnQgb2YgdGhlIGVzdGF0ZSBvZiB0aGUgUmlnaHQgSG9ub3JhYmxlIEx1a2UgVmlzY291bnQgTW91bnRqb3ksIHNvbGQgdG8gUmljaGFyZCBGcmVuY2ggRXNxLiwgcHVyc3VhbnQgdG8gYSBEZWNyZWUgb2YgSGlzIE1hamVzdHnigJlzIEhpZ2ggQ291cnQgb2YgQ2hhbmNlcnksIDE3IEZlYiAxNzk0XCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzk0XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzEwXCIsIFwieFwiOiA0NzQuMCwgXCJ5XCI6IC04MjEuNSwgXCJ6b29tWFwiOiAwLjU3NiwgXCJ6b29tWVwiOiAwLjU3NiwgXCJyb3RhdGlvblwiOiAwLjE0NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zMTAucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJOb3J0aCBMb3RzIC0gZnJvbSB0aGUgTm9ydGggU3RyYW5kIFJvYWQsIHRvIHRoZSBOb3J0aCBhbmQgRWFzdCBXYWxscyBEYXRlOiAxNzkzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzkzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzI1XCIsIFwieFwiOiAtODkzLjAsIFwieVwiOiA0MSwgXCJ6b29tWFwiOiAwLjI4NiwgXCJ6b29tWVwiOiAwLjI4NiwgXCJyb3RhdGlvblwiOiAwLjAzLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMyNS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlNtaXRoZmllbGQsIEFycmFuIFF1YXksIEhheW1hcmtldCwgV2VzdCBBcnJhbiBTdHJlZXQsIE5ldyBDaHVyY2ggU3RyZWV0LCBCb3cgTGFuZSwgQm93IFN0cmVldCwgTWF5IExhbmVcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTMyNi0xXCIsIFwieFwiOiAtMTQxNS41LCBcInlcIjogMTEyLjUsIFwiem9vbVhcIjogMC4xMTQsIFwiem9vbVlcIjogMC4xMTIsIFwicm90YXRpb25cIjogMC4xNywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zMjYtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkJhcnJhY2sgU3RyZWV0LCBQYXJrIFN0cmVldCwgUGFya2dhdGUgU3RyZWV0IGFuZCBUZW1wbGUgU3RyZWV0LCB3aXRoIHJlZmVyZW5jZSB0byBuYW1lcyBvZiB0ZW5hbnRzIGFuZCBwcmVtaXNlcyBOby4gMVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNjMyXCIsIFwieFwiOiAxMjUsIFwieVwiOiAzNDcuNSwgXCJ6b29tWFwiOiAwLjE3MiwgXCJ6b29tWVwiOiAwLjE2NCwgXCJyb3RhdGlvblwiOiAwLjUzLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTYzMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBOYXNzYXUgU3RyZWV0LCBsZWFkaW5nIGZyb20gR3JhZnRvbiBTdHJlZXQgdG8gTWVycmlvbiBTcXVhcmUgLSBzaG93aW5nIHRoZSBvZmYgc3RyZWV0cyBhbmQgcG9ydGlvbiBvZiBHcmFmdG9uIFN0cmVldCBhbmQgU3VmZm9sayBTdHJlZXQgRGF0ZTogMTgzM1wiLCBcblx0XHRcImRhdGVcIjogMTgzM1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTMyNi0yXCIsIFwieFwiOiAtMTI1Ny41LCBcInlcIjogMTQzLjUsIFwiem9vbVhcIjogMC4xLCBcInpvb21ZXCI6IDAuMSwgXCJyb3RhdGlvblwiOiAwLjA3NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zMjYtMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkJhcnJhY2sgU3RyZWV0LCBQYXJrIFN0cmVldCwgUGFya2dhdGUgU3RyZWV0IGFuZCBUZW1wbGUgU3RyZWV0LCB3aXRoIHJlZmVyZW5jZSB0byBuYW1lcyBvZiB0ZW5hbnRzIGFuZCBwcmVtaXNlc1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzM0XCIsIFwieFwiOiA5MC41LCBcInlcIjogMzU3LCBcInpvb21YXCI6IDAuMTI4LCBcInpvb21ZXCI6IDAuMTI4LCBcInJvdGF0aW9uXCI6IDEuMjY1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMzNC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkRhbWUgU3RyZWV0LCBDb2xsZWdlIEdyZWVuLCBHZW9yZ2XigJlzIExhbmUsIEdlb3JnZeKAmXMgU3RyZWV0LCBDaGVxdWVyIFN0cmVldCBhbmQgYXZlbnVlcyB0aGVyZW9mXCIsXG5cdFx0XCJkYXRlXCI6IDE3Nzhcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zNTUtMlwiLCBcInhcIjogMTg1LCBcInlcIjogMTAyOSwgXCJ6b29tWFwiOiAwLjMwMiwgXCJ6b29tWVwiOiAwLjMwMiwgXCJyb3RhdGlvblwiOiAtMC40NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNTUtMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gb2YgQmFnZ290IFN0cmVldCBhbmQgRml0endpbGxpYW0gU3RyZWV0LCBzaG93aW5nIGF2ZW51ZXMgdGhlcmVvZiBOby4gMiBEYXRlOiAxNzkyXCIsXG5cdFx0XCJkYXRlXCI6IDE3OTJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zNjhcIiwgXCJ4XCI6IC02ODcuNSwgXCJ5XCI6IDI3My41LCBcInpvb21YXCI6IDAuMTU2LCBcInpvb21ZXCI6IDAuMTUsIFwicm90YXRpb25cIjogMC4xMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNjgucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgS2luZ+KAmXMgSW5uIFF1YXkgYW5kIE1lcmNoYW50cyBRdWF5LCBzaG93aW5nIHNpdGUgb2YgT3Jtb25kIEJyaWRnZSAtIGJlbG93IENoYXJsZXMgU3RyZWV0IC0gYWZ0ZXJ3YXJkcyByZW1vdmVkIGFuZCByZS1lcmVjdGVkIG9wcG9zaXRlIFdpbmV0YXZlcm4gU3RyZWV0IERhdGU6IDE3OTdcIiwgXG5cdFx0XCJkYXRlXCI6IDE3OTdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zNzJcIiwgXCJ4XCI6IDM0MS41LCBcInlcIjogMjk2LjUsIFwiem9vbVhcIjogMC4wMzYsIFwiem9vbVlcIjogMC4wMzM5LCBcInJvdGF0aW9uXCI6IDIuOTU1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM3Mi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkdlb3JnZSdzIFF1YXksIFdoaXRlcyBMYW5lLCBhbmQgSGF3a2lucyBTdHJlZXQsIHNob3dpbmcgc2l0ZSBvZiBTd2VldG1hbidzIEJyZXdlcnkgd2hpY2ggcmFuIGRvd24gdG8gUml2ZXIgTGlmZmV5IERhdGU6IDE3OTlcIiwgXG5cdFx0XCJkYXRlXCI6IDE3OTlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zOTAtMVwiLCBcInhcIjogLTgwNC41LCBcInlcIjogNDIwLCBcInpvb21YXCI6IDAuMjA0LCBcInpvb21ZXCI6IDAuMjAyLCBcInJvdGF0aW9uXCI6IC0wLjA3LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM5MC0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBvZiBwcm9wb3NlZCBNYXJrZXQgSG91c2UsIGFkam9pbmluZyBUaG9tYXMgU3RyZWV0LCBWaWNhciBTdHJlZXQsIE1hcmtldCBTdHJlZXQgYW5kIEZyYW5jaXMgU3RyZWV0IERhdGU6IDE4MDFcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zOTUtM1wiLCBcInhcIjogLTU4OCwgXCJ5XCI6IDU3OCwgXCJ6b29tWFwiOiAwLjAzNiwgXCJ6b29tWVwiOiAwLjAzNiwgXCJyb3RhdGlvblwiOiAtMy42NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zOTUtMy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk5ldyBSb3cgYW5kIEN1dHB1cnNlIFJvdyBEYXRlOiAxODAwXCIsXG5cdFx0XCJkYXRlXCI6IDE4MDBcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MDRcIiwgXCJ4XCI6IC0xNiwgXCJ5XCI6IDM3MiwgXCJ6b29tWFwiOiAwLjA2MiwgXCJ6b29tWVwiOiAwLjA2LCBcInJvdGF0aW9uXCI6IC0wLjI1NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MDQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJBbmdsZXNlYSBTdHJlZXQgYW5kIFBhcmxpYW1lbnQgSG91c2UgRGF0ZTogMTgwMlwiLCBcblx0XHRcImRhdGVcIjogMTgwMlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQxMVwiLCBcInhcIjogMzQzLjUsIFwieVwiOiA2NTcsIFwiem9vbVhcIjogMC4wODYsIFwiem9vbVlcIjogMC4wODYsIFwicm90YXRpb25cIjogMC4zMjUsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJMZWluc3RlciBIb3VzZSBhbmQgcGFydCBvZiB0aGUgZXN0YXRlIG9mIFZpc2NvdW50IEZpdHp3aWxsaWFtIChmb3JtZXJseSBMZWluc3RlciBMYXduKSwgbGFpZCBvdXQgaW4gbG90cyBmb3IgYnVpbGRpbmcgLSBzaG93aW5nIEtpbGRhcmUgU3RyZWV0LCBVcHBlciBNZXJyaW9uIFN0cmVldCBhbmQgTGVpbnN0ZXIgUGxhY2UgKFN0cmVldCksIE1lcnJpb24gUGxhY2UsIGFuZCB0aGUgT2xkIEJvdW5kYXJ5IGJldHdlZW4gTGVpbnN0ZXIgYW5kIExvcmQgRml0endpbGxpYW0gLSB0YWtlbiBmcm9tIGEgbWFwIHNpZ25lZCBSb2JlcnQgR2lic29uLCBNYXkgMTgsIDE3NTQgRGF0ZTogMTgxMlwiLCBcblx0XHRcImRhdGVcIjogMTgxMlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTI1MVwiLCBcInhcIjogMjIwLCBcInlcIjogNjQsIFwiem9vbVhcIjogMC4yMzYsIFwiem9vbVlcIjogMC4yMzYsIFwicm90YXRpb25cIjogLTEuNDksXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yNTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcG9ydGlvbiBvZiBDaXR5LCBzaG93aW5nIE1vbnRnb21lcnkgU3RyZWV0LCBNZWNrbGluYnVyZ2ggU3RyZWV0LCBMb3dlciBHbG91Y2VzdGVyIFN0cmVldCBhbmQgcG9ydGlvbiBvZiBNYWJib3QgU3RyZWV0XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MTNcIiwgXCJ4XCI6IC0zNzMsIFwieVwiOiA4MDYuNSwgXCJ6b29tWFwiOiAwLjA3OCwgXCJ6b29tWVwiOiAwLjA3NiwgXCJyb3RhdGlvblwiOiAtMC4xNSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQxMy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBldGVyIFN0cmVldCwgUGV0ZXLigJlzIFJvdywgV2hpdGVmcmlhciBTdHJlZXQsIFdvb2QgU3RyZWV0IGFuZCBCcmlkZSBTdHJlZXQgLSBzaG93aW5nIHNpdGUgb2YgdGhlIEFtcGhpdGhlYXRyZSBpbiBCcmlkZSBTdHJlZXQsIHdoZXJlIHRoZSBNb2xleW5ldXggQ2h1cmNoIG5vdyAoMTkwMCkgc3RhbmRzIERhdGU6IDE4MTJcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MTJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MTRcIiwgXCJ4XCI6IC0xOTMuNSwgXCJ5XCI6IDM2My41LCBcInpvb21YXCI6IDAuMDcyLCBcInpvb21ZXCI6IDAuMDc0LCBcInJvdGF0aW9uXCI6IC0wLjIzLFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDE0LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiVGVtcGxlIEJhciwgV2VsbGluZ3RvbiBRdWF5LCBPbGQgQ3VzdG9tIEhvdXNlLCBCYWduaW8gU2xpcCBldGMuIERhdGU6IDE4MTNcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MTNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MjFcIiwgXCJ4XCI6IC00NzQuNSwgXCJ5XCI6IDUyNywgXCJ6b29tWFwiOiAwLjA2MiwgXCJ6b29tWVwiOiAwLjA2LCBcInJvdGF0aW9uXCI6IC0wLjE4NSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQyMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjYsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiB0aGUgcHJlY2luY3RzIG9mIENocmlzdCBDaHVyY2ggRHVibGluLCBzaG93aW5nIFNraW5uZXJzIFJvdywgdG8gd2hpY2ggaXMgYXR0YWNoZWQgYSBNZW1vcmFuZHVtIGRlbm9taW5hdGluZyB0aGUgcHJlbWlzZXMsIHRha2VuIGJ5IHRoZSBDb21taXNzaW9uZXJzIG9mIFdpZGUgU3RyZWV0cyBmb3IgdGhlIHB1cnBvc2Ugb2Ygd2lkZW5pbmcgc2FpZCBTa2lubmVycyBSb3csIG5vdyAoMTkwMCkga25vd24gYXMgQ2hyaXN0IENodXJjaCBQbGFjZSBEYXRlOiAxODE3XCIsIFxuXHRcdFwiZGF0ZVwiOiAxODE3XG5cdH0sXG5cdHsgXG5cdFx0XCJuYW1lXCI6IFwid3NjLTQwOC0yXCIsIFwieFwiOiAtMzk3LjUsIFwieVwiOiA1NDUuNSwgXCJ6b29tWFwiOiAwLjA0NCwgXCJ6b29tWVwiOiAwLjA0NCwgXCJyb3RhdGlvblwiOiAtMC4xMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MDgtMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIldlcmJ1cmdoIFN0cmVldCwgU2tpbm5lcnMgUm93LCBGaXNoYW1ibGUgU3RyZWV0IGFuZCBDYXN0bGUgU3RyZWV0IERhdGU6IGMuIDE4MTBcIixcblx0XHRcImRhdGVcIjogMTgxMFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQyNS0xXCIsIFwieFwiOiAtOTE3LjUsIFwieVwiOiA1NzcuNSwgXCJ6b29tWFwiOiAwLjA0NSwgXCJ6b29tWVwiOiAwLjA0NiwgXCJyb3RhdGlvblwiOiAtMS40MjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDI1LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNZWF0aCBSb3csIE1hcmvigJlzIEFsbGV5IGFuZCBEaXJ0eSBMYW5lIC0gc2hvd2luZyBCcmlkZ2Vmb290IFN0cmVldCwgTWFzcyBMYW5lLCBUaG9tYXMgU3RyZWV0IGFuZCBTdC4gQ2F0aGVyaW5l4oCZcyBDaHVyY2ggRGF0ZTogMTgyMC0yNFwiLCBcblx0XHRcImRhdGVcIjogMTgyMFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQyNlwiLCBcInhcIjogLTczNS41LCBcInlcIjogNTc4LjUsIFwiem9vbVhcIjogMC4wMzQsIFwiem9vbVlcIjogMC4wMzQsIFwicm90YXRpb25cIjogMS41NjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDI2LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHNldmVyYWwgaG91c2VzIGFuZCBwcmVtaXNlcyBvbiB0aGUgRWFzdCBzaWRlIG9mIE1lYXRoIFJvdywgdGhlIHByb3BlcnR5IG9mIE1yLiBKb2huIFdhbHNoIC0gc2hvd2luZyB0aGUgc2l0dWF0aW9uIG9mIFRob21hcyBTdHJlZXQsIEhhbmJ1cnkgTGFuZSBhbmQgc2l0ZSBvZiBDaGFwZWwgRGF0ZTogMTgyMVwiLCBcblx0XHRcImRhdGVcIjogMTgyMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTExMi0xXCIsIFwieFwiOiAtMjkwLjUsIFwieVwiOiAzNDQuNSwgXCJ6b29tWFwiOiAwLjE4LCBcInpvb21ZXCI6IDAuMTgyLCBcInJvdGF0aW9uXCI6IC0wLjI2LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTExMi0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuMyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRGFtZSBTdHJlZXQsIGZyb20gdGhlIGNvcm5lciBvZiBQYWxhY2UgU3RyZWV0IHRvIHRoZSBjb3JuZXIgb2YgR2Vvcmdl4oCZcyBTdHJlZXQgLSBsYWlkIG91dCBpbiBsb3RzIGZvciBidWlsZGluZyBOb3J0aCBhbmQgU291dGggYW5kIHZpY2luaXR5IERhdGU6IDE3ODJcIiwgXG5cdFx0XCJkYXRlXCI6IDE3ODJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMTJcIiwgXCJ4XCI6IC0yOTgsIFwieVwiOiAzMzkuNSwgXCJ6b29tWFwiOiAwLjE4NSwgXCJ6b29tWVwiOiAwLjE4NSwgXCJyb3RhdGlvblwiOiAtMC4yNTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTEyLnBuZ1wiLCBcInZpc2libGVcIjogZmFsc2UsIFwib3BhY2l0eVwiOiAwLjAsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkRhbWUgU3RyZWV0LCBmcm9tIHRoZSBjb3JuZXIgb2YgUGFsYWNlIFN0cmVldCB0byB0aGUgY29ybmVyIG9mIEdlb3JnZeKAmXMgU3RyZWV0IC0gbGFpZCBvdXQgaW4gbG90cyBmb3IgYnVpbGRpbmcgTm9ydGggYW5kIFNvdXRoIGFuZCB2aWNpbml0eSBEYXRlOiAxNzgyXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzgyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDU1XCIsIFwieFwiOiA2MzUuNSwgXCJ5XCI6IDEyNTgsIFwiem9vbVhcIjogMC4yNjMsIFwiem9vbVlcIjogMC4yNjMsIFwicm90YXRpb25cIjogLTAuOSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00NTUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJIZXJiZXJ0IFBsYWNlIGFuZCBBdmVudWVzIGFkamFjZW50IHRvIFVwcGVyIE1vdW50IFN0cmVldCwgc2hvd2luZyBVcHBlciBCYWdnb3QgU3RyZWV0IC0gSGVyYmVydCBTdHJlZXQsIFdhcnJpbmd0b24gUGxhY2UgYW5kIFBlcmN5IFBsYWNlLCBOb3J0aHVtYmVybGFuZCBSb2FkIGFuZCBMb3dlciBNb3VudCBTdHJlZXQgRGF0ZTogMTgzM1wiLCBcblx0XHRcImRhdGVcIjogMTgzM1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE5OVwiLCBcInhcIjogODc4LjUsIFwieVwiOiAxMjE3LjUsIFwiem9vbVhcIjogMC4yNDEsIFwiem9vbVlcIjogMC4yNDEsIFwicm90YXRpb25cIjogMi4xMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTk5LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcGFydCBvZiB0aGUgZXN0YXRlIG9mIHRoZSBIb24uIFNpZG5leSBIZXJiZXJ0LCBjYWxsZWQgV2lsdG9uIFBhcmFkZSwgc2hvd2luZyB0aGUgcHJvcG9zZWQgYXBwcm9wcmlhdGlvbiB0aGVyZW9mIGluIHNpdGVzIGZvciBidWlsZGluZy4gQWxzbyBzaG93aW5nIEJhZ2dvdCBTdHJlZXQsIEdyYW5kIENhbmFsIGFuZCBGaXR6d2lsbGlhbSBQbGFjZS5cIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ2NVwiLCBcInhcIjogMzAxLjUsIFwieVwiOiA3MTEuNSwgXCJ6b29tWFwiOiAwLjIwNywgXCJ6b29tWVwiOiAwLjIwNywgXCJyb3RhdGlvblwiOiAzLjMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDY1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiR3JhZnRvbiBTdHJlZXQsIE5hc3NhdSBTdHJlZXQgKFNvdXRoIHNpZGUpIGFuZCBEYXdzb24gU3RyZWV0IERhdGU6IDE4MzdcIiwgXG5cdFx0XCJkYXRlXCI6IDE4Mzdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00ODAtMlwiLCBcInhcIjogLTYzLCBcInlcIjogMzgyLCBcInpvb21YXCI6IDAuMDY4LCBcInpvb21ZXCI6IDAuMDY4LCBcInJvdGF0aW9uXCI6IC0wLjA1NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00ODAtMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjYsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk5vcnRoIHNpZGUgb2YgQ29sbGVnZSBHcmVlbiBzaG93aW5nIEF2ZW51ZXMgdGhlcmVvZiwgYW5kIGdyb3VuZCBwbGFuIG9mIFBhcmxpYW1lbnQgSG91c2UsIEFuZ2xlc2VhIFN0cmVldCwgQmxhY2ttb29yIFlhcmQgZXRjLiAtIHdpdGggcmVmZXJlbmNlIGdpdmluZyB0ZW5hbnRzLCBuYW1lcyBvZiBwcmVtaXNlcyByZXF1aXJlZCBvciBwdXJwb3NlIG9mIGltcHJvdmVtZW50LiBEYXRlOiAxNzg2XCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzg2XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDkxXCIsIFwieFwiOiAtMjEuNSwgXCJ5XCI6IDkzOCwgXCJ6b29tWFwiOiAwLjE2NCwgXCJ6b29tWVwiOiAwLjE2NCwgXCJyb3RhdGlvblwiOiAtMy4wOCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00OTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJBdW5naWVyIFN0cmVldCwgTWVyY2VyIFN0cmVldCwgWW9yayBTdHJlZXQgYW5kIEF2ZW51ZXMgdGhlcmVvZiwgdml6OiAtIEZyZW5jaCBTdHJlZXQgKE1lcmNlciBTdHJlZXQpLCBCb3cgTGFuZSwgRGlnZ2VzIExhbmUsIFN0ZXBoZW4gU3RyZWV0LCBEcnVyeSBMYW5lLCBHcmVhdCBhbmQgTGl0dGxlIExvbmdmb3JkIFN0cmVldHNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ5NlwiLCBcInhcIjogLTI3OCwgXCJ5XCI6IDQ1NiwgXCJ6b29tWFwiOiAwLjAxOCwgXCJ6b29tWVwiOiAwLjAxOCwgXCJyb3RhdGlvblwiOiAtMy4yNiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00OTYucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJFc3NleCBRdWF5LCBDaGFuZ2UgQWxsZXksIFNtb2NrIEFsbGV5IGFuZCBncm91bmQgcGxhbiBvZiBTbW9jayBBbGxleSBUaGVhdHJlXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy01MDdcIiwgXCJ4XCI6IC0yNzIuNSwgXCJ5XCI6IDM0NiwgXCJ6b29tWFwiOiAwLjA4NywgXCJ6b29tWVwiOiAwLjA4OSwgXCJyb3RhdGlvblwiOiAtMC4yLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTUwNy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkVzc2V4IFN0cmVldCwgUGFybGlhbWVudCBTdHJlZXQsIHNob3dpbmcgT2xkIEN1c3RvbSBIb3VzZSBRdWF5LCBMb3dlciBPcm1vbmQgUXVheSBhbmQgRGFtZSBTdHJlZXRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTIwNi0xXCIsIFwieFwiOiAtNDQuNSwgXCJ5XCI6IC0yMjEsIFwiem9vbVhcIjogMC4wNSwgXCJ6b29tWVwiOiAwLjA1LCBcInJvdGF0aW9uXCI6IC0wLjY1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTIwNi0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIGFuZ2xlIG9mIENhdmVuZGlzaCBSb3csIFJ1dGxhbmQgU3F1YXJlIGFuZCBHcmVhdCBCcml0YWluIFN0cmVldCAtIHNob3dpbmcgdW5zaWduZWQgZWxldmF0aW9ucyBhbmQgZ3JvdW5kIHBsYW4gb2YgUm90dW5kYSBieSBGcmVkZXJpY2sgVHJlbmNoLiBEYXRlOiAxNzg3XCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzg3XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjAzXCIsIFwieFwiOiAtMzkyLCBcInlcIjogMjcyLjUsIFwiem9vbVhcIjogMC4wNzgsIFwiem9vbVlcIjogMC4wNzYsIFwicm90YXRpb25cIjogLTAuMjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjAzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQ2l0eSBTdXJ2ZXkgLSBzaG93aW5nIE9ybW9uZCBRdWF5LCBBcnJhbiBTdHJlZXQsIE1hcnnigJlzIEFiYmV5LCBMaXR0bGUgU3RyYW5kIFN0cmVldCwgQ2FwZWwgU3RyZWV0IGFuZCBFc3NleCBCcmlkZ2UgRGF0ZTogMTgxMVwiLCBcblx0XHRcImRhdGVcIjogMTgxMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTUxNVwiLCBcInhcIjogLTc1LCBcInlcIjogNTUwLCBcInpvb21YXCI6IDAuMDg4LCBcInpvb21ZXCI6IDAuMDg4LCBcInJvdGF0aW9uXCI6IDIuOTM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTUxNS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcInNob3dpbmcgRGFtZSBTdHJlZXQsIEVzc2V4IFN0cmVldCBldGMuIC0gYWxzbyBzaXRlIGZvciBwcm9wb3NlZCBOYXRpb25hbCBCYW5rLCBvbiBvciBhYm91dCB3aGVyZSB0aGUgJ0VtcGlyZScgKGZvcm1lcmx5IHRoZSAnU3RhcicpIFRoZWF0cmUgb2YgVmFyaWV0aWVzIG5vdyAoMTkwMCkgc3RhbmRzIE5vLjFcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTUyMy0xXCIsIFwieFwiOiAtMjk3LjUsIFwieVwiOiAzNjguNSwgXCJ6b29tWFwiOiAwLjA4OCwgXCJ6b29tWVwiOiAwLjA4OCwgXCJyb3RhdGlvblwiOiAtMC4xODUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNTIzLTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJFc3NleCBTdHJlZXQsIFRlbXBsZSBCYXIgYW5kIHZpY2luaXR5IHRvIEVzc2V4IEJyaWRnZSwgc2hvd2luZyBwcm9wb3NlZCBuZXcgcXVheSB3YWxsIChXZWxsaW5ndG9uIFF1YXkpXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MjMtMlwiLCBcInhcIjogMzQuNSwgXCJ5XCI6IDQ3OC41LCBcInpvb21YXCI6IDAuMDc4LCBcInpvb21ZXCI6IDAuMDgyLCBcInJvdGF0aW9uXCI6IC0zLjIxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MjMtMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNyb3duIEFsbGV5LCBDb3BlIFN0cmVldCwgQXJkaWxs4oCZcyBSb3csIFRlbXBsZSBCYXIsIEFzdG9u4oCZcyBRdWF5IGFuZCBXZWxsaW5ndG9uIFF1YXkgTm8uIDIgRGF0ZTogMTgyMC01XCIsIFxuXHRcdFwiZGF0ZVwiOiAxODIwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNTM1XCIsIFwieFwiOiAtMjA5LjUsIFwieVwiOiAzMjUsIFwiem9vbVhcIjogMC4xMzQsIFwiem9vbVlcIjogMC4xMzQsIFwicm90YXRpb25cIjogLTAuMDcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNTM1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiV2VsbGluZ3RvbiBRdWF5IC0gY29udGludWF0aW9uIG9mIEV1c3RhY2UgU3RyZWV0IERhdGVcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTU2Ny0zXCIsIFwieFwiOiAxOTQuNSwgXCJ5XCI6IDQ1MCwgXCJ6b29tWFwiOiAwLjEyNiwgXCJ6b29tWVwiOiAwLjEyNiwgXCJyb3RhdGlvblwiOiAxLjQ4LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTU2Ny0zLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIGEgcGFyY2VsIG9mIGdyb3VuZCBib3VuZGVkIGJ5IEdyYWZ0b24gU3RyZWV0LCBDb2xsZWdlIEdyZWVuLCBhbmQgQ2hlcXVlciBMYW5lIC0gbGVhc2VkIHRvIE1yLiBQb29sZXkgKDMgY29waWVzKSBOby4gMyBEYXRlOiAxNjgyXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNjgyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNTk0LTFcIiwgXCJ4XCI6IC01NjQuNSwgXCJ5XCI6IDU3Mi41LCBcInpvb21YXCI6IDAuMDQ0LCBcInpvb21ZXCI6IDAuMDQ0LCBcInJvdGF0aW9uXCI6IDIuNTM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTU5NC0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIE5ldyBIYWxsIE1hcmtldCAtIHBhcnQgb2YgdGhlIENpdHkgRXN0YXRlIERhdGU6IDE3ODBcIiwgXG5cdFx0XCJkYXRlXCI6IDE3ODBcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy02MjUtMVwiLCBcInhcIjogLTMyMC41LCBcInlcIjogNjA5LjUsIFwiem9vbVhcIjogMC4wNTgsIFwiem9vbVlcIjogMC4wNTgsIFwicm90YXRpb25cIjogMi42MSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy02MjUtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiB0aGUgT2xkIFRob2xzZWxsIGdyb3VuZCwgZm9ybWVybHkgY2FsbGVkIFNvdXRoZXLigJlzIExhbmUsIGJlbG9uZ2luZyB0byB0aGUgQ2l0eSBvZiBEdWJsaW4gLSBsYWlkIG91dCBmb3IgYnVpbGRpbmcsIE5pY2hvbGFzIFN0cmVldCwgU2tpbm5lcnMgUm93IGFuZCBXZXJidXJnaCBTdHJlZXQgQnkgQS4gUi4gTmV2aWxsZSwgQy4gUy4gRGF0ZTogMTgxMlwiLCBcblx0XHRcImRhdGVcIjogMTgxMlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTY1NFwiLCBcInhcIjogLTM5Ny41LCBcInlcIjogNDA5LCBcInpvb21YXCI6IDAuMTIyLCBcInpvb21ZXCI6IDAuMTIyLCBcInJvdGF0aW9uXCI6IC0wLjEzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy02NTQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgdGhlIGdyb3VuZCBwbG90cyBvZiBzZXZlcmFsIGhvbGRpbmdzIGJlbG9uZ2luZyB0byB0aGUgQ2l0eSBvZiBEdWJsaW4sIE1hZGFtIE/igJlIYXJhLCBDb2xvbmVsIEJlcnJ5IGFuZCBvdGhlcnMsIG9uIEJhY2sgUXVheSAtIChFc3NleCBRdWF5KSBCbGluZCBRdWF5IC0gRXhjaGFuZ2UgU3RyZWV0LCBFc3NleCBCcmlkZ2UsIENyYW5lIExhbmUgYW5kIERhbWUgU3RyZWV0LCBTeWNhbW9yZSBBbGxleSAtIHNob3dpbmcgcG9ydGlvbiBvZiB0aGUgQ2l0eSBXYWxsLCBFc3NleCBHYXRlLCBEYW1lIEdhdGUsIERhbWVzIE1pbGwgYW5kIGJyYW5jaCBvZiB0aGUgUml2ZXIgRG9kZGVyXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy03MDVcIiwgXCJ4XCI6IC0xODcuNSwgXCJ5XCI6IDM5MiwgXCJ6b29tWFwiOiAwLjA0LCBcInpvb21ZXCI6IDAuMDQyLCBcInJvdGF0aW9uXCI6IC0wLjM4LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTcwNS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBFc3NleCBTdHJlZXQgYW5kIHZpY2luaXR5IERhdGU6IDE4MDZcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MjZcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy03MjVcIiwgXCJ4XCI6IC02NTMuNSwgXCJ5XCI6IDIyMi41LCBcInpvb21YXCI6IDAuMDk0LCBcInpvb21ZXCI6IDAuMDk0LCBcInJvdGF0aW9uXCI6IDAuMDcsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy03MjUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDaHVyY2ggU3RyZWV0LCBDaGFybGVzIFN0cmVldCwgSW5u4oCZcyBRdWF5IC0gJ1doaXRlIENyb3NzIElubicgLSByZXJlIG9mIEZvdXIgQ291cnRzIC0gVXNoZXJz4oCZIFF1YXksIE1lcmNoYW504oCZcyBRdWF5LCBXb29kIFF1YXkgLSB3aXRoIHJlZmVyZW5jZSBEYXRlOiAxODMzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODMzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTk4LTFcIiwgXCJ4XCI6IC00NjIsIFwieVwiOiA0NzYsIFwiem9vbVhcIjogMC4wMzIsIFwiem9vbVlcIjogMC4wMzIsIFwicm90YXRpb25cIjogLTAuMzQ1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE5OC0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIFdoaXRlaG9yc2UgWWFyZCAoV2luZXRhdmVybiBTdHJlZXQpIFN1cnZleW9yOiBBcnRodXIgTmV2aWxsZSBEYXRlOiAxODQ3XCIsIFxuXHRcdFwiZGF0ZVwiOiAxODQ3XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDU1XCIsIFwieFwiOiAtMTc3NSwgXCJ5XCI6IC0xNDQ2LCBcInpvb21YXCI6IDEuMTEsIFwiem9vbVlcIjogMS4xNjIsIFwicm90YXRpb25cIjogMC4wMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDU1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBvZiBNYWlsIENvYWNoIFJvYWQsIHRocm91Z2ggQmxlc3Npbmd0b24gU3RyZWV0IHRvIENhYnJhLCBvZiBOZXcgTGluZSBSb2FkLCBiZWluZyBwYXJ0IG9mIHRoZSBOYXZhbiBUdXJucGlrZSBSb2FkIGFuZCBjb25uZWN0aW5nIGFuIGltcHJvdmVtZW50IGxhdGVseSBtYWRlIHVwb24gdGhhdCBMaW5lIHdpdGggdGhlIENpdHkgb2YgRHVibGluIC0gc2hvd2luZyB0aGUgbW9zdCBkaXJlY3QgbGluZSBhbmQgYWxzbyBhIENpcmN1aXRvbnMgbGluZSB3aGVyZWJ5IHRoZSBleHBlbnNlIG9mIGEgQnJpZGdlIGFjcm9zcyB0aGUgUm95YWwgQ2FuYWwgbWF5IGJlIGF2b2lkZWQuIERvbmUgYnkgSGlzIE1hamVzdHkncyBQb3N0IE1hc3RlcnMgb2YgSXJlbGFuZCBieSBNci4gTGFya2luIERhdGU6IDE4MThcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MThcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNjBcIiwgXCJ4XCI6IC0xMDQuNSwgXCJ5XCI6IC0xLCBcInpvb21YXCI6IDAuNjc0LCBcInpvb21ZXCI6IDAuNzAyLCBcInJvdGF0aW9uXCI6IDMuMTY1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTYwLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIHNob3dpbmcgdGhlIGFsdGVyYXRpb25zIHByb3Bvc2VkIGluIHRoZSBuZXcgbGluZSBvZiByb2FkLCBsZWFkaW5nIGZyb20gRHVibGluIHRvIE5hdmFuLCBjb21tZW5jaW5nIGF0IEJsZXNzaW5ndG9uIFN0cmVldDsgcGFzc2luZyBhbG9uZyB0aGUgQ2lyY3VsYXIgUm9hZCB0byBQcnVzc2lhIFN0cmVldCwgYW5kIGhlbmNlIGFsb25nIHRoZSBUdXJucGlrZSBSb2FkIHRvIFJhdG9hdGgsIGFuZCB0ZXJtaW5hdGluZyBhdCB0aGUgVHVybnBpa2VcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA2NVwiLCBcInhcIjogLTU0NS41LCBcInlcIjogLTI3NSwgXCJ6b29tWFwiOiAwLjI5OCwgXCJ6b29tWVwiOiAwLjI5MiwgXCJyb3RhdGlvblwiOiAtMS4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wNjUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgc2hvd2luZyBNb3VudGpveSBTdHJlZXQsIERvcnNldCBTdHJlZXQsIERvbWluaWNrIFN0cmVldCBhbmQgdmljaW5pdHkgLSBwbGFuIG9mIFNhaW50IE1hcnnigJlzIENoYXBlbCBvZiBFYXNlLCBhbmQgcHJvcG9zZWQgb3BlbmluZyBsZWFkaW5nIHRoZXJldW50byBmcm9tIEdyYW5ieSBSb3cgLSBUaG9tYXMgU2hlcnJhcmQgMzAgTm92IDE4MjdcIiwgXG5cdFx0XCJkYXRlXCI6IDE4Mjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMTJcIiwgXCJ4XCI6IC0xMjUuNSwgXCJ5XCI6IDE0OS41LCBcInpvb21YXCI6IDAuMDQ0LCBcInpvb21ZXCI6IDAuMDQ0LCBcInJvdGF0aW9uXCI6IC0wLjIyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTAxMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwcmVtaXNlcyBMb3dlciBBYmJleSBTdHJlZXQsIExvd2VyIFNhY2t2aWxsZSBTdHJlZXQgYW5kIEVkZW4gUXVheVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDE0XCIsIFwieFwiOiAtMTU1NS41LCBcInlcIjogMjcsIFwiem9vbVhcIjogMC4xNCwgXCJ6b29tWVwiOiAwLjE0LCBcInJvdGF0aW9uXCI6IDAuMDU1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTAxNC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkEgc3VydmV5IG9mIGdyb3VuZCBjb250aWd1b3VzIHRvIHRoZSBIb3JzZSBCYXJyYWNrcywgRHVibGluIC0gc2hvd2luZyBNb250cGVsaWVyIEhpbGwsIEJhcnJhY2sgU3RyZWV0LCBQYXJrZ2F0ZSBTdHJlZXQgYW5kIGVudmlyb25zIChUaG9tYXMgU2hlcnJhcmQpIERhdGU6IDE3OTBcIiwgXG5cdFx0XCJkYXRlXCI6IDE3OTBcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMTVcIiwgXCJ4XCI6IC0xNDE0LjUsIFwieVwiOiAyOSwgXCJ6b29tWFwiOiAwLjExNiwgXCJ6b29tWVwiOiAwLjExMiwgXCJyb3RhdGlvblwiOiAwLjA3NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wMTUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJBcmJvdXIgSGlsbCwgUm95YWwgQmFycmFja3MgYW5kIHZpY2luaXR5LiBXaXRoIHJlZmVyZW5jZS4gRGF0ZTogMTc5MFwiLFxuXHRcdFwiZGF0ZVwiOiAxNzkwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDE2XCIsIFwieFwiOiAtODQ3LCBcInlcIjogMjMxLjUsIFwiem9vbVhcIjogMC4wMzgsIFwiem9vbVlcIjogMC4wMzgsIFwicm90YXRpb25cIjogMC4wOTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDE2LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gQXJyYW4gUXVheSwgUXVlZW4gU3RyZWV0IERhdGU6MTc5MFwiLFxuXHRcdFwiZGF0ZVwiOiAxNzkwLFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAxN1wiLCBcInhcIjogLTU2NCwgXCJ5XCI6IDQ0MCwgXCJ6b29tWFwiOiAwLjA2OCwgXCJ6b29tWVwiOiAwLjA2LCBcInJvdGF0aW9uXCI6IDMuMzksIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDE3LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQXJyYW4gUXVheSwgQ2h1cmNoIFN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDE4XCIsIFwieFwiOiAtMTk0LCBcInlcIjogLTM5NS41LCBcInpvb21YXCI6IDAuMTIsIFwiem9vbVlcIjogMC4xMiwgXCJyb3RhdGlvblwiOiAtMC42MywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wMTgucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTdXJ2ZXkgb2YgQmFybGV5IGZpZWxkcyBldGMuIChEb3JzZXQgU3RyZWV0KS4gUGxhbiBvZiBvcGVuaW5nIGEgc3RyZWV0IGZyb20gUnV0bGFuZCBTcXVhcmUgdG8gRG9yc2V0IFN0cmVldCAtIChQYWxhY2UgUm93IGFuZCBHYXJkaW5lcnMgUm93KSAtIFRob21hcyBTaGVycmFyZCBEYXRlOiAxNzg5XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMjVcIiwgXCJ4XCI6IC0xMDEwLCBcInlcIjogMTA1LCBcInpvb21YXCI6IDAuMTIsIFwiem9vbVlcIjogMC4xMiwgXCJyb3RhdGlvblwiOiAwLjE2LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTAyNS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkJsYWNraGFsbCBQbGFjZSAtIE5ldyBTdHJlZXQgdG8gdGhlIFF1YXlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA1N1wiLCBcInhcIjogLTIyNCwgXCJ5XCI6IDMzMC41LCBcInpvb21YXCI6IDAuMDg0LCBcInpvb21ZXCI6IDAuMDg0LCBcInJvdGF0aW9uXCI6IDIuODY1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTA1Ny5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gb2Ygc3RyZWV0cyBhYm91dCBNYXJ54oCZcyBBYmJleSBhbmQgQm9vdCBMYW5lIC0gKE9sZCBCYW5rKSBEYXRlOiAxODExXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODExXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDYzXCIsIFwieFwiOiAtODguNSwgXCJ5XCI6IDI2LjUsIFwiem9vbVhcIjogMC4zLCBcInpvb21ZXCI6IDAuMywgXCJyb3RhdGlvblwiOiAtMi4xNDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDYzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRWxldmF0aW9uIG9mIHRoZSB3ZXN0IGZyb250IGFuZCBwbGFuIG9mIE1vdW50am95IFNxdWFyZSBsYWlkIG91dCBvbiB0aGUgcmlzaW5nIGdyb3VuZCwgbmVhciBHZW9yZ2XigJlzIENodXJjaCAtIHRoZSBlc3RhdGUgb2YgdGhlIFJpZ2h0IEhvbi4gTHVrZSBHYXJkaW5lciwgYW5kIG5vdyAoMTc4NyksIHRvIGJlIGxldCBmb3IgYnVpbGRpbmcgLSBMb3JkIE1vdW50am954oCZcyBwbGFuLiBEYXRlOiAxNzg3XCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzg3XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDg3LTJcIiwgXCJ4XCI6IC0xNzIuNSwgXCJ5XCI6IDE0MTksIFwiem9vbVhcIjogMC4wODYsIFwiem9vbVlcIjogMC4wODYsIFwicm90YXRpb25cIjogLTEuNjk1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTA4Ny0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQ2FtZGVuIFN0cmVldCBVcHBlciBhbmQgQ2hhcmxvdHRlIFN0cmVldCBEYXRlOiAxODQxXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODQxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDkwXCIsIFwieFwiOiAtMjYxLCBcInlcIjogNTA1LCBcInpvb21YXCI6IDAuMDc0LCBcInpvb21ZXCI6IDAuMDY2LCBcInJvdGF0aW9uXCI6IC0wLjIzLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTA5MC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNhc3RsZSBZYXJkLCBDYXN0bGUgU3RyZWV0LCBEYW1lIFN0cmVldCwgUGFybGlhbWVudCBTdHJlZXQgYW5kIHZpY2luaXR5IERhdGU6IDE3NjRcIiwgXG5cdFx0XCJkYXRlXCI6IDE3NjRcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMDAtMlwiLCBcInhcIjogLTUyOCwgXCJ5XCI6IDQ2NCwgXCJ6b29tWFwiOiAwLjA3OCwgXCJ6b29tWVwiOiAwLjA3OCwgXCJyb3RhdGlvblwiOiAtMC4yNywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xMDAtMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwcmVtaXNlcyB0byBiZSB2YWx1ZWQgYnkgSnVyeTsgQ29jayBIaWxsLCBNaWNoYWVs4oCZcyBMYW5lLCBXaW5ldGF2ZXJuIFN0cmVldCwgSm9obuKAmXMgTGFuZSwgQ2hyaXN0Y2h1cmNoLCBQYXRyaWNrIFN0cmVldCBhbmQgUGF0cmlja+KAmXMgQ2xvc2UgRGF0ZTogMTgxM1wiLCBcblx0XHRcImRhdGVcIjogMTgxM1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTEwM1wiLCBcInhcIjogOTkuNSwgXCJ5XCI6IDU2NiwgXCJ6b29tWFwiOiAwLjA2MiwgXCJ6b29tWVwiOiAwLjA2LCBcInJvdGF0aW9uXCI6IC0zLjE1NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xMDMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgU291dGggU2lkZSBvZiBDb2xsZWdlIEdyZWVuIGFuZCB2aWNpbml0eSBEYXRlOiAxODA4XCIsXG5cdFx0XCJkYXRlXCI6IDE4MDhcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNDktMVwiLCBcInhcIjogLTEwOTEsIFwieVwiOiA1MTUuNSwgXCJ6b29tWFwiOiAwLjA2MiwgXCJ6b29tWVwiOiAwLjA2LCBcInJvdGF0aW9uXCI6IDAsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTQ5LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBKYW1lc+KAmXMgR2F0ZSwgSmFtZXMgU3RyZWV0LCBUaG9tYXMgU3RyZWV0IGFuZCBXYXRsaW5nIFN0cmVldC4gTXIuIEd1aW5uZXNz4oCZcyBQbGFjZSBEYXRlOiAxODQ1XCIsIFxuXHRcdFwiZGF0ZVwiOiAxODQ1XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTQ5LTJcIiwgXCJ4XCI6IC0xMDc0LjUsIFwieVwiOiA0ODgsIFwiem9vbVhcIjogMC4wNDQsIFwiem9vbVlcIjogMC4wNDgsIFwicm90YXRpb25cIjogMCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xNDktMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCAtIEphbWVz4oCZcyBHYXRlLCBKYW1lcyBTdHJlZXQsIFRob21hcyBTdHJlZXQgYW5kIFdhdGxpbmcgU3RyZWV0LiBNci4gR3Vpbm5lc3PigJlzIFBsYWNlIERhdGU6IDE4NDVcIiwgXG5cdFx0XCJkYXRlXCI6IDE4NDVcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yNTRcIiwgXCJ4XCI6IC00MzgsIFwieVwiOiAtMTQyLCBcInpvb21YXCI6IDAuMTE4LCBcInpvb21ZXCI6IDAuMTIsIFwicm90YXRpb25cIjogLTAuNDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTI1NC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBNYWJib3QgU3RyZWV0LCBNb250Z29tZXJ5IFN0cmVldCwgRG9taW5pY2sgU3RyZWV0LCBDaGVycnkgTGFuZSwgQ3Jvc3MgTGFuZSBhbmQgVHVybi1hZ2Fpbi1MYW5lIERhdGU6IDE4MDFcIixcblx0XHRcImRhdGVcIjogMTgwMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTEwNi0xXCIsIFwieFwiOiAtNzU3LCBcInlcIjogNDk1LjUsIFwiem9vbVhcIjogMC4yNjUsIFwiem9vbVlcIjogMC4yNjUsIFwicm90YXRpb25cIjogLTAuMDc0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTA2LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIHNob3dpbmcgcHJvcG9zZWQgaW1wcm92ZW1lbnRzIHRvIGJlIG1hZGUgaW4gQ29ybm1hcmtldCwgQ3V0cHVyc2UgUm93LCBMYW1iIEFsbGV5IC0gRnJhbmNpcyBTdHJlZXQgLSBhbmQgYW4gaW1wcm92ZWQgZW50cmFuY2UgZnJvbSBLZXZpbiBTdHJlZXQgdG8gU2FpbnQgUGF0cmlja+KAmXMgQ2F0aGVkcmFsLCB0aHJvdWdoIE1pdHJlIEFsbGV5IGFuZCBhdCBKYW1lc+KAmXMgR2F0ZS4gRGF0ZTogMTg0NS00NiBcIixcblx0XHRcImRhdGVcIjogMTg0NVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE0Ni0xXCIsIFwieFwiOiAtNjgzLCBcInlcIjogNDcxLCBcInpvb21YXCI6IDAuMDgyLCBcInpvb21ZXCI6IDAuMDgyLCBcInJvdGF0aW9uXCI6IC0wLjEsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xNDYtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBhbmQgdHJhY2luZyBvZiBwcmVtaXNlcyBpbiBDb3JubWFya2V0LCBDdXRwdXJzZSBSb3cgYW5kIHZpY2luaXR5IERhdGU6IDE4NDlcIixcblx0XHRcImRhdGVcIjogMTg0OVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTYwMFwiLCBcInhcIjogMTM5LjUsIFwieVwiOiA3NTgsIFwiem9vbVhcIjogMC4wNjIsIFwiem9vbVlcIjogMC4wNjIsIFwicm90YXRpb25cIjogLTAuNDE1LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNjAwLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBncm91bmQgZXRjLiwgb2YgdGhlIE1hbnNpb24gSG91c2UsIERhd3NvbiBTdHJlZXQgRGF0ZTogMTc4MVwiLFxuXHRcdFwiZGF0ZVwiOiAxNzgxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzQ4XCIsIFwieFwiOiAtMTM0NS41LCBcInlcIjogNDkzLCBcInpvb21YXCI6IDAuNCwgXCJ6b29tWVwiOiAwLjQ3OCwgXCJyb3RhdGlvblwiOiAtMC4wNzUsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNDgucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcGFydCBvZiB0aGUgQ2l0eSBvZiBEdWJsaW4gbmVhciB0aGUgR3JhbmQgQ2FuYWwgLSBzaG93aW5nIGltcHJvdmVtZW50cyBhbmQgYXBwcm9hY2hlcyBtYWRlLCBhbmQgdGhvc2UgcHJvcG9zZWQgdG8gYmUgbWFkZTsgYW5kIHRoZSBzaXR1YXRpb24gb2YgdGhlIGZvbGxvd2luZyBzdHJlZXRzIHZpejogLSBCYXNvbiBMYW5lOyBDYW5hbCBQbGFjZTsgUG9ydGxhbmQgU3RyZWV0OyBSYWluc2ZvcmQgU3RyZWV0OyBDcmFuZSBMYW5lOyBCZWxsdmlldzsgVGhvbWFzIENvdXJ0OyBIYW5idXJ5IExhbmU7IE1lYXRoIFJvdzsgTWVhdGggU3RyZWV0OyBFYXJsIFN0cmVldCBXZXN0OyBXYWdnb24gTGFuZTsgQ3Jhd2xleWBzIFlhcmQ7IFJvYmVydCBTdHJlZXQ7IE1hcmtldCBTdHJlZXQ7IEJvbmQgU3RyZWV0OyBDYW5hbCBCYW5rLCBOZXdwb3J0IFN0cmVldDsgTWFycm93Ym9uZSBMYW5lLCBTdW1tZXIgU3RyZWV0OyBCcmFpdGh3YWl0ZSBTdHJlZXQ7IFBpbWJsaWNvLCBUcmlwb2xvIChzaXRlIG9mIE9sZCBDb3VydCBIb3VzZSksIG5lYXIgVGhvbWFzIENvdXJ0OyBDb2xlIEFsbGV5OyBTd2lmdHMgQWxsZXk7IENyb3N0aWNrIEFsbGV5OyBFbGJvdyBMYW5lOyBVcHBlciBDb29tYmUgYW5kIFRlbnRlcidzIEZpZWxkcyBEYXRlOiAxNzg3XCIsXG5cdFx0XCJkYXRlXCI6IDE3ODdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MzMtMlwiLCBcInhcIjogLTUzNi41LCBcInlcIjogODcwLjUsIFwiem9vbVhcIjogMC4wNTgsIFwiem9vbVlcIjogMC4wNTgsIFwicm90YXRpb25cIjogLTAuMDEsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MzMtMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCAtIENvb21iZSwgRnJhbmNpcyBTdHJlZXQsIE5ldyBSb3csIENyb3NzIFBvZGRsZSAobm93IERlYW4gU3RyZWV0KSwgVGhyZWUtU3RvbmUtQWxsZXkgKG5vdyB0aGUgbG93ZXIgZW5kIG9mIE5ldyBTdHJlZXQpLCBQYXRyaWNrIFN0cmVldCwgUGF0cmlja+KAmXMgQ2xvc2UsIEtldmluIFN0cmVldCBhbmQgTWl0cmUgQWxsZXkgRGF0ZTogMTgyNC0yOFwiLFxuXHRcdFwiZGF0ZVwiOiAxODI0XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDU5XCIsIFwieFwiOiAtNTI3LjUsIFwieVwiOiAtMTE5LjUsIFwiem9vbVhcIjogMC4wNywgXCJ6b29tWVwiOiAwLjA3LCBcInJvdGF0aW9uXCI6IC0wLjA4LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDU5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiR3JvdW5kIHBsYW4gb2YgTGluZW4gSGFsbFwiXG5cdH1cbl1cbiIsImltcG9ydCB7IENhbnZhc0xheWVyIH0gZnJvbSBcIi4uL2d0d28vbGF5ZXJcIjtcbmltcG9ydCB7IENvbnNvbGVMb2dnZXIsIExvZ2dlciB9IGZyb20gXCIuLi9sb2dnaW5nL2xvZ2dlclwiO1xuXG5leHBvcnQgY2xhc3MgR3JpZEluZGV4IHtcblxuXHRwcml2YXRlIGxvZ2dlcjogTG9nZ2VyO1xuXG5cdGNvbnN0cnVjdG9yKHJlYWRvbmx5IGdyaWRXaWR0aDogbnVtYmVyLCBcblx0ICByZWFkb25seSBncmlkSGVpZ2h0OiBudW1iZXIgPSBncmlkV2lkdGgpe1xuXHRcdHRoaXMubG9nZ2VyID0gbmV3IENvbnNvbGVMb2dnZXIoKTtcblx0fVxuXG5cdGFkZExheWVyKGNhbnZhc0xheWVyOiBDYW52YXNMYXllcil7XG5cblx0XHRsZXQgZGltZW5zaW9uID0gY2FudmFzTGF5ZXIuZ2V0RGltZW5zaW9uKCk7XG5cblx0XHRsZXQgeE1pbiA9IE1hdGguZmxvb3IoZGltZW5zaW9uLnggLyB0aGlzLmdyaWRXaWR0aCk7XG5cdFx0bGV0IHhNYXggPSBNYXRoLmNlaWwoKGRpbWVuc2lvbi54ICsgZGltZW5zaW9uLncpIC8gdGhpcy5ncmlkV2lkdGgpO1xuXG5cdFx0bGV0IHlNaW4gPSBNYXRoLmZsb29yKGRpbWVuc2lvbi55IC8gdGhpcy5ncmlkSGVpZ2h0KTtcblx0XHRsZXQgeU1heCA9IE1hdGguY2VpbCgoZGltZW5zaW9uLnkgKyBkaW1lbnNpb24uaCkgLyB0aGlzLmdyaWRIZWlnaHQpO1xuXG5cdFx0dGhpcy5sb2dnZXIubG9nKFwiR3JpZEluZGV4IHhNaW46IFwiICsgeE1pbiArIFwiIHhNYXg6IFwiICsgeE1heCArIFxuXHRcdFx0XCIgeU1pbjogXCIgKyB5TWluICsgXCIgeU1heDogXCIgKyB5TWF4KTtcblxuXHR9XG5cbn1cbiIsImV4cG9ydCBpbnRlcmZhY2UgTG9nZ2VyIHtcblx0bG9nKGluZm86IHN0cmluZyk7XG59XG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50TG9nZ2VyIGltcGxlbWVudHMgTG9nZ2VyIHtcblxuXHRjb25zdHJ1Y3RvcihyZWFkb25seSBkaXNwbGF5RWxlbWVudDogSFRNTEVsZW1lbnQpe31cblxuXHRsb2coaW5mbzogc3RyaW5nKSB7XG5cdFx0dGhpcy5kaXNwbGF5RWxlbWVudC5pbm5lclRleHQgPSBpbmZvO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNsYXNzIENvbnNvbGVMb2dnZXIgaW1wbGVtZW50cyBMb2dnZXIge1xuXG5cdGxvZyhpbmZvOiBzdHJpbmcpIHtcblx0XHRjb25zb2xlLmxvZyhpbmZvKTtcblx0fVxuXG59IiwiaW1wb3J0IHsgQ2FudmFzVmlldyB9IGZyb20gXCIuL2d0d28vY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgU3RhdGljSW1hZ2UgfSBmcm9tIFwiLi9ndHdvL3N0YXRpY1wiO1xuaW1wb3J0IHsgQ29udGFpbmVyTGF5ZXIgfSBmcm9tIFwiLi9ndHdvL2xheWVyXCI7XG5pbXBvcnQgeyBCYXNpY1RyYW5zZm9ybSB9IGZyb20gXCIuL2d0d28vdmlld1wiO1xuaW1wb3J0IHsgU3RhdGljR3JpZCB9IGZyb20gXCIuL2d0d28vZ3JpZFwiO1xuaW1wb3J0IHsgVmlld0NvbnRyb2xsZXIgfSBmcm9tIFwiLi9ndHdvL3ZpZXdjb250cm9sbGVyXCI7XG5pbXBvcnQgeyBab29tRGlzcGxheVJhbmdlIH0gZnJvbSBcIi4vZ3R3by9jYW52YXN2aWV3XCI7XG5pbXBvcnQgeyBHcmlkSW5kZXggfSBmcm9tIFwiLi9pbmRleC9ncmlkaW5kZXhcIjtcbmltcG9ydCB7IEltYWdlQ29udHJvbGxlciwgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyIH0gZnJvbSBcIi4vZ3R3by9pbWFnZWNvbnRyb2xsZXJcIjtcbmltcG9ydCB7IFRpbGVMYXllciwgVGlsZVN0cnVjdCwgem9vbUJ5TGV2ZWx9IGZyb20gXCIuL2d0d28vdGlsZWxheWVyXCI7XG5pbXBvcnQgeyBMYXllck1hbmFnZXIsIENvbnRhaW5lckxheWVyTWFuYWdlciwgZGF0ZUZpbHRlciwgZGF0ZWxlc3NGaWx0ZXIgfSBmcm9tIFxuICBcIi4vZ3R3by9sYXllcm1hbmFnZXJcIjtcbmltcG9ydCB7IExheWVyQ29udHJvbGxlciB9IGZyb20gXCIuL2d0d28vbGF5ZXJjb250cm9sbGVyXCI7XG5cbmltcG9ydCAqIGFzIGZpcmVtYXBzIGZyb20gXCIuL2ltYWdlZ3JvdXBzL2ZpcmVtYXBzLmpzb25cIjtcbmltcG9ydCAqIGFzIGxhbmRtYXJrcyBmcm9tIFwiLi9pbWFnZWdyb3Vwcy9sYW5kbWFya3MuanNvblwiO1xuaW1wb3J0ICogYXMgd3NjIGZyb20gXCIuL2ltYWdlZ3JvdXBzL3dzY2QuanNvblwiO1xuXG5sZXQgZWFybHlEYXRlcyA9IGRhdGVGaWx0ZXIod3NjLCAxNjgwLCAxNzkyKTtcbmxldCBtaWREYXRlcyA9IGRhdGVGaWx0ZXIod3NjLCAxNzkzLCAxODIwKTtcbmxldCBsYXRlRGF0ZXMgPSBkYXRlRmlsdGVyKHdzYywgMTgyMSwgMTkwMCk7XG5sZXQgb3RoZXJEYXRlcyA9IGRhdGVsZXNzRmlsdGVyKHdzYyk7XG5cbmxldCBsYXllclN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDEsIDEsIDApO1xubGV0IGltYWdlTGF5ZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXIobGF5ZXJTdGF0ZSk7XG5cbmxldCBpbWFnZVN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0xNDQwLC0xNDQwLCAwLjIyMiwgMC4yMjIsIDApO1xuXG5sZXQgY291bnR5U3RhdGUgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oLTI2MzEsIC0yMDUxLjUsIDEuNzE2LCAxLjY3NCwgMCk7XG5sZXQgY291bnR5SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoY291bnR5U3RhdGUsIFxuICAgIFwiaW1hZ2VzL0NvdW50eV9vZl90aGVfQ2l0eV9vZl9EdWJsaW5fMTgzN19tYXAucG5nXCIsIDAuNSwgdHJ1ZSk7XG5cbmxldCBiZ1N0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0xMTI2LC0xMDg2LCAxLjU4LCAxLjU1LCAwKTtcbmxldCBiZ0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKGJnU3RhdGUsIFwiaW1hZ2VzL2Ztc3MuanBlZ1wiLCAuNiwgdHJ1ZSk7XG5cbmxldCB0bVN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0xMDMzLjUsMTQ5LCAwLjU5LCAwLjU5LCAwKTtcbmxldCB0bUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKHRtU3RhdGUsIFwiaW1hZ2VzL3RoaW5nbW90LnBuZ1wiLCAuMywgdHJ1ZSk7XG5cbmxldCBkdVN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC05MjksLTEwNS41LCAwLjQ2NCwgMC41MDYsIDApO1xubGV0IGR1SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoZHVTdGF0ZSwgXCJpbWFnZXMvZHVibGluMTYxMC5qcGdcIiwgLjYsIGZhbHNlKTtcblxubGV0IGdyaWRUcmFuc2Zvcm0gPSBCYXNpY1RyYW5zZm9ybS51bml0VHJhbnNmb3JtO1xuLy8gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDEsIDEsIDApO1xubGV0IHN0YXRpY0dyaWQgPSBuZXcgU3RhdGljR3JpZChncmlkVHJhbnNmb3JtLCAxLCBmYWxzZSwgMjU2LCAyNTYpO1xuXG5sZXQgc2VudGluZWxTdHJ1Y3QgPSBuZXcgVGlsZVN0cnVjdChcInF0aWxlL2R1Ymxpbi9cIiwgXCIucG5nXCIsIFwiaW1hZ2VzL3F0aWxlL2R1Ymxpbi9cIik7XG5cbmxldCBzZW50aW5lbFRyYW5zZm9ybSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgwLCAwLCAyLCAyLCAwKTtcbmxldCB6b29tRGlzcGxheSA9IG5ldyBab29tRGlzcGxheVJhbmdlKDAuOCwgNCk7XG5cbmxldCBzZW50aW5lbExheWVyID0gbmV3IFRpbGVMYXllcihzZW50aW5lbFRyYW5zZm9ybSwgc2VudGluZWxTdHJ1Y3QsIHRydWUsIHpvb21EaXNwbGF5LCBcbiAgIDE1ODE2LCAxMDYyNCwgMTUpO1xuXG5sZXQgc2VudGluZWxCVHJhbnNmb3JtID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDQsIDQsIDApO1xubGV0IHpvb21CRGlzcGxheSA9IG5ldyBab29tRGlzcGxheVJhbmdlKC4yLCAwLjgpO1xubGV0IHNlbnRpbmVsQkxheWVyID0gbmV3IFRpbGVMYXllcihzZW50aW5lbEJUcmFuc2Zvcm0sIHNlbnRpbmVsU3RydWN0LCB0cnVlLCB6b29tQkRpc3BsYXksIFxuICAgNzkwOCwgNTMxMiwgMTQpO1xuXG5sZXQgc2VudGluZWxDVHJhbnNmb3JtID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDgsIDgsIDApO1xubGV0IHpvb21DRGlzcGxheSA9IG5ldyBab29tRGlzcGxheVJhbmdlKC4wNCwgLjIpO1xubGV0IHNlbnRpbmVsU0xheWVyID0gbmV3IFRpbGVMYXllcihzZW50aW5lbENUcmFuc2Zvcm0sIHNlbnRpbmVsU3RydWN0LCB0cnVlLCB6b29tQ0Rpc3BsYXksIFxuICAgIDM5NTQsIDI2NTYsIDEzKTtcblxubGV0IHJlY2VudHJlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0xMDI0LCAtMTUzNiwgMSwgMSwgMCk7XG5sZXQgc2VudGluZWxDb250YWluZXJMYXllciA9IG5ldyBDb250YWluZXJMYXllcihyZWNlbnRyZSk7XG5zZW50aW5lbENvbnRhaW5lckxheWVyLnNldChcInpvb21JblwiLCBzZW50aW5lbExheWVyKTtcbnNlbnRpbmVsQ29udGFpbmVyTGF5ZXIuc2V0KFwiem9vbU1pZFwiLCBzZW50aW5lbEJMYXllcik7XG5zZW50aW5lbENvbnRhaW5lckxheWVyLnNldChcInpvb21PdXRcIiwgc2VudGluZWxTTGF5ZXIpO1xuXG5sZXQgZWRpdENvbnRhaW5lckxheWVyID0gbmV3IENvbnRhaW5lckxheWVyKEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0pO1xuXG5pbWFnZUxheWVyLnNldChcImNvdW50eVwiLCBjb3VudHlJbWFnZSk7XG5pbWFnZUxheWVyLnNldChcImJhY2tncm91bmRcIiwgYmdJbWFnZSk7XG5cbmxldCBsYXllck1hbmFnZXIgPSBuZXcgTGF5ZXJNYW5hZ2VyKCk7XG5cbmxldCBmaXJlbWFwTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkTGF5ZXIoZmlyZW1hcHMsIFwiZmlyZW1hcHNcIik7XG5sZXQgbGFuZG1hcmtzTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkTGF5ZXIobGFuZG1hcmtzLCBcImxhbmRtYXJrc1wiKTtcbmxldCB3c2NFYXJseUxheWVyID0gbGF5ZXJNYW5hZ2VyLmFkZExheWVyKGVhcmx5RGF0ZXMsIFwid3NjX2Vhcmx5XCIpO1xubGV0IHdzY01pZExheWVyID0gbGF5ZXJNYW5hZ2VyLmFkZExheWVyKG1pZERhdGVzLCBcIndzY19taWRcIik7XG53c2NNaWRMYXllci5zZXRWaXNpYmxlKGZhbHNlKTtcbmxldCB3c2NMYXRlTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkTGF5ZXIobGF0ZURhdGVzLCBcIndzY19sYXRlXCIpO1xud3NjTGF0ZUxheWVyLnNldFZpc2libGUoZmFsc2UpO1xubGV0IHdzY090aGVyTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkTGF5ZXIob3RoZXJEYXRlcywgXCJ3c2Nfb3RoZXJcIik7XG53c2NPdGhlckxheWVyLnNldFZpc2libGUoZmFsc2UpO1xuXG5sZXQgZWRpdCA9IHdzY0Vhcmx5TGF5ZXIuZ2V0KFwid3NjLTMzNFwiKTtcblxubGV0IGluZGV4ZXIgPSBuZXcgR3JpZEluZGV4KDI1Nik7XG5cbmluZGV4ZXIuYWRkTGF5ZXIoZWRpdCk7XG5cbmxldCBjb250YWluZXJMYXllck1hbmFnZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXJNYW5hZ2VyKHdzY0Vhcmx5TGF5ZXIsIGVkaXRDb250YWluZXJMYXllcik7XG5sZXQgb3V0bGluZUxheWVyID0gY29udGFpbmVyTGF5ZXJNYW5hZ2VyLnNldFNlbGVjdGVkKFwid3NjLTMzNFwiKTtcblxuaW1hZ2VMYXllci5zZXQoXCJ3c2Nfb3RoZXJcIiwgd3NjT3RoZXJMYXllcik7XG5pbWFnZUxheWVyLnNldChcIndzY19lYXJseVwiLCB3c2NFYXJseUxheWVyKTtcbmltYWdlTGF5ZXIuc2V0KFwid3NjX21pZFwiLCB3c2NNaWRMYXllcik7XG5pbWFnZUxheWVyLnNldChcIndzY19sYXRlXCIsIHdzY0xhdGVMYXllcik7XG5cbmltYWdlTGF5ZXIuc2V0KFwiZmlyZW1hcHNcIiwgZmlyZW1hcExheWVyKTtcblxuaW1hZ2VMYXllci5zZXQoXCJkdWJsaW4xNjEwXCIsIGR1SW1hZ2UpO1xuaW1hZ2VMYXllci5zZXQoXCJ0aGluZ21vdFwiLCB0bUltYWdlKTtcbmltYWdlTGF5ZXIuc2V0KFwibGFuZG1hcmtzXCIsIGxhbmRtYXJrc0xheWVyKTtcblxud3NjRWFybHlMYXllci5zZXRUb3AoXCJ3c2MtMzM0XCIpO1xuXG5mdW5jdGlvbiBzaG93TWFwKGRpdk5hbWU6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpdk5hbWUpO1xuXG4gICAgY29uc3QgaW5mbyA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVkaXRfaW5mb1wiKTtcblxuICAgIGxldCB4ID0gb3V0bGluZUxheWVyLng7XG4gICAgbGV0IHkgPSBvdXRsaW5lTGF5ZXIueTtcblxuICAgIGxldCBjYW52YXNUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oeCAtIDIwMCwgeSAtIDIwMCwgMC41LCAwLjUsIDApO1xuICAgIGxldCBjYW52YXNWaWV3ID0gbmV3IENhbnZhc1ZpZXcoY2FudmFzVHJhbnNmb3JtLCBjYW52YXMuY2xpZW50V2lkdGgsIGNhbnZhcy5jbGllbnRIZWlnaHQsIGNhbnZhcyk7XG5cbiAgICBjYW52YXNWaWV3LmxheWVycy5wdXNoKHNlbnRpbmVsQ29udGFpbmVyTGF5ZXIpO1xuICAgIGNhbnZhc1ZpZXcubGF5ZXJzLnB1c2goaW1hZ2VMYXllcik7XG4gICAgY2FudmFzVmlldy5sYXllcnMucHVzaChzdGF0aWNHcmlkKTtcbiAgICBjYW52YXNWaWV3LmxheWVycy5wdXNoKGVkaXRDb250YWluZXJMYXllcik7XG5cbiAgICBsZXQgdGlsZUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHNlbnRpbmVsQ29udGFpbmVyTGF5ZXIsIFwidlwiKTtcbiAgICBsZXQgYmFzZUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGJnSW1hZ2UsIFwiQlwiKTtcbiAgICBsZXQgY291bnR5Q29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgY291bnR5SW1hZ2UsIFwiVlwiKTtcbiAgICBsZXQgZmlyZW1hcENvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGZpcmVtYXBMYXllciwgXCJiXCIpO1xuICAgIGxldCB3c2NFYXJseUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHdzY0Vhcmx5TGF5ZXIsIFwiMVwiKTtcbiAgICBsZXQgd3NjTGF0ZUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHdzY01pZExheWVyLCBcIjJcIik7XG4gICAgbGV0IHdzY01pZENvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHdzY0xhdGVMYXllciwgXCIzXCIpO1xuICAgIGxldCB3c2NPdGhlckNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHdzY090aGVyTGF5ZXIsIFwiNFwiKTtcbiAgICBsZXQgbGFuZG1hcmtDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBsYW5kbWFya3NMYXllciwgXCJtXCIpO1xuICAgIGxldCB0bUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHRtSW1hZ2UsIFwiblwiKTtcbiAgICBsZXQgZHVDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBkdUltYWdlLCBcIk1cIik7XG4gICAgbGV0IGdyaWRDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBzdGF0aWNHcmlkLCBcImdcIik7XG5cbiAgICBsZXQgY29udHJvbGxlciA9IG5ldyBWaWV3Q29udHJvbGxlcihjYW52YXNWaWV3LCBjYW52YXMsIGNhbnZhc1ZpZXcpO1xuXG4gICAgbGV0IGltYWdlQ29udHJvbGxlciA9IG5ldyBJbWFnZUNvbnRyb2xsZXIoY2FudmFzVmlldywgZWRpdCk7XG5cbiAgICBpbWFnZUNvbnRyb2xsZXIuc2V0TGF5ZXJPdXRsaW5lKG91dGxpbmVMYXllcik7XG5cbiAgICBpbWFnZUNvbnRyb2xsZXIuc2V0RWRpdEluZm9QYW5lKGluZm8pO1xuXG4gICAgbGV0IGxheWVyQ29udHJvbGxlciA9IG5ldyBMYXllckNvbnRyb2xsZXIoY2FudmFzVmlldywgY29udGFpbmVyTGF5ZXJNYW5hZ2VyKTtcblxuICAgIGRyYXdNYXAoY2FudmFzVmlldyk7XG5cbn1cblxuZnVuY3Rpb24gZHJhd01hcChjYW52YXNWaWV3OiBDYW52YXNWaWV3KXtcbiAgICBpZiAoIWNhbnZhc1ZpZXcuZHJhdygpICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkluIHRpbWVvdXRcIik7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgZHJhd01hcChjYW52YXNWaWV3KX0sIDUwMCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzaG93KCl7XG5cdHNob3dNYXAoXCJjYW52YXNcIiwgXCJUeXBlU2NyaXB0XCIpO1xufVxuXG5pZiAoXG4gICAgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiIHx8XG4gICAgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09IFwibG9hZGluZ1wiICYmICFkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZG9TY3JvbGwpXG4pIHtcblx0c2hvdygpO1xufSBlbHNlIHtcblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgc2hvdyk7XG59Il19
