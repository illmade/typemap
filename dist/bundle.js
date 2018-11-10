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
const point2d_1 = require("../geom/point2d");
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
    getBasePoint(coord) {
        return new point2d_1.Point2D(this.x + coord.x / this.zoomX, this.y + coord.y / this.zoomY);
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

},{"../geom/point2d":1,"./view":12}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const view_1 = require("./view");
const point2d_1 = require("../geom/point2d");
const layer_1 = require("./layer");
class ContainerLayer extends layer_1.CanvasElement {
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
    layers() {
        return this.displayLayers;
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

},{"../geom/point2d":1,"./layer":6,"./view":12}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const layer_1 = require("./layer");
const shape_1 = require("./shape");
const point2d_1 = require("../geom/point2d");
class EditManager extends layer_1.CanvasElement {
    constructor(shape, radius = 5) {
        super(shape.localTransform);
        this.shape = shape;
        this.radius = radius;
        this.pointMap = new Map();
        for (let point2d of shape.points) {
            let point = new shape_1.Point(point2d.x, point2d.y, this.radius, 1, true);
            this.pointMap.set(point, point2d);
        }
    }
    addPoint(x, y) {
        let point = new shape_1.Point(x, y, this.radius, 1, true);
        let point2d = new point2d_1.Point2D(x, y);
        this.shape.points.push(point2d);
        this.pointMap.set(point, point2d);
    }
    updatePoint(point) {
        let shapePoint = this.pointMap.get(point);
        shapePoint.x = point.x;
        shapePoint.y = point.y;
    }
    draw(ctx, parentTransform, view) {
        for (let [point, point2d] of this.pointMap) {
            point.draw(ctx, parentTransform, view);
        }
        return true;
    }
    getPoint(x, y) {
        for (let [point, point2d] of this.pointMap) {
            if (point.inside(x, y)) {
                return point;
            }
        }
        return undefined;
    }
    getDimension() {
        return this.shape.getDimension();
    }
}
exports.EditManager = EditManager;

},{"../geom/point2d":1,"./layer":6,"./shape":9}],5:[function(require,module,exports){
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
        return true;
    }
    getDimension() {
        return new point2d_1.Dimension(0, 0, 0, 0);
    }
}
exports.StaticGrid = StaticGrid;

},{"../geom/point2d":1,"./layer":6}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const view_1 = require("./view");
class CanvasElement extends view_1.BasicTransform {
    constructor(localTransform, opacity = 1, visible = true, name = "", description = "") {
        super(localTransform.x, localTransform.y, localTransform.zoomX, localTransform.zoomY, localTransform.rotation);
        this.localTransform = localTransform;
        this.opacity = opacity;
        this.visible = visible;
        this.name = name;
        this.description = description;
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
exports.CanvasElement = CanvasElement;
class DrawLayer extends CanvasElement {
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

},{"./view":12}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const containerlayer_1 = require("./containerlayer");
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
        let imageLayer = new containerlayer_1.ContainerLayer(view_1.BasicTransform.unitTransform);
        this.layerMap.set(this.defaultLayer, imageLayer);
    }
    ;
    addImage(image, name) {
        this.layerMap.get(this.defaultLayer).set(name, image);
    }
    addImages(imageDetails, layerName, layerTransform = view_1.BasicTransform.unitTransform) {
        let imageLayer = new containerlayer_1.ContainerLayer(layerTransform, 1, true);
        for (var image of imageDetails) {
            let staticImage = new static_1.StaticImage(image, image.src, image.opacity, image.visible, image.description);
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
        let layerName = "outline";
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

},{"./containerlayer":3,"./static":10,"./view":12}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const view_1 = require("./view");
const point2d_1 = require("../geom/point2d");
const layer_1 = require("./layer");
class DisplayRange {
    constructor(minZoom, maxZoom) {
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
    }
    withinRange(zoom) {
        return ((zoom >= this.minZoom || this.minZoom == -1) &&
            (zoom <= this.maxZoom || this.maxZoom == -1));
    }
}
DisplayRange.AllRange = new DisplayRange(-1, -1);
exports.DisplayRange = DisplayRange;
class MultiResLayer extends layer_1.CanvasElement {
    constructor() {
        super(...arguments);
        this.layerMap = new Map();
    }
    set(displayRange, layer) {
        this.layerMap.set(displayRange, layer);
    }
    draw(ctx, parentTransform, view) {
        let layerTransform = view_1.combineTransform(this.localTransform, parentTransform);
        var drawingComplete = true;
        for (let [range, layer] of this.layerMap) {
            if (range.withinRange(view.zoomX) && layer.isVisible()) {
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
        for (let [range, layer] of this.layerMap) {
            let layerDimension = layer.getDimension();
            xMin = Math.min(xMin, this.x + layerDimension.x);
            yMin = Math.min(yMin, this.y + layerDimension.y);
            xMax = Math.max(xMax, this.x + layerDimension.x + this.zoomX * layerDimension.w);
            yMax = Math.max(yMax, this.y + layerDimension.y + this.zoomY * layerDimension.h);
        }
        return new point2d_1.Dimension(xMin, yMin, xMax - xMin, yMax - yMin);
    }
}
exports.MultiResLayer = MultiResLayer;

},{"../geom/point2d":1,"./layer":6,"./view":12}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const view_1 = require("./view");
const layer_1 = require("./layer");
const point2d_1 = require("../geom/point2d");
function arrayToPoints(pointArray) {
    let points = [];
    for (let arrayPoint of pointArray) {
        let point = new point2d_1.Point2D(arrayPoint[0], arrayPoint[1]);
        points.push(point);
    }
    return points;
}
exports.arrayToPoints = arrayToPoints;
class Shape extends layer_1.DrawLayer {
    constructor(localTransform, opacity, visible, name, description) {
        super(localTransform, opacity, visible, name, description);
    }
    draw(ctx, parentTransform, view) {
        let ctxTransform = view_1.combineTransform(this, parentTransform);
        this.prepareCtx(ctx, ctxTransform, view);
        if (this.visible) {
            ctx.beginPath();
            let start = this.points[0];
            ctx.moveTo(start.x, start.y);
            for (let point of this.points) {
                ctx.lineTo(point.x, point.y);
            }
            if (this.fill) {
                ctx.fill();
            }
            ctx.stroke();
        }
        this.cleanCtx(ctx, ctxTransform, view);
        return true;
    }
    getDimension() {
        return new point2d_1.Dimension(0, 0, 0, 0);
    }
}
exports.Shape = Shape;
class Point extends layer_1.DrawLayer {
    constructor(x, y, radius, opacity, visible) {
        super(new view_1.BasicTransform(x, y, 1, 1, 0), opacity, visible, "point");
        this.radius = radius;
    }
    draw(ctx, parentTransform, view) {
        let x = (this.x + parentTransform.x - view.x) * view.zoomX;
        let y = (this.y + parentTransform.y - view.y) * view.zoomY;
        let width = this.radius * view.zoomX;
        let height = this.radius * view.zoomY;
        ctx.strokeStyle = "red";
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, width, 0, 2 * Math.PI, false);
        ctx.fill();
        return true;
    }
    getDimension() {
        return new point2d_1.Dimension(this.x, this.y, this.radius, this.radius);
    }
    inside(x, y) {
        let xdiff = this.x - x;
        let ydiff = this.y - y;
        let distance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
        return distance < this.radius;
    }
}
exports.Point = Point;

},{"../geom/point2d":1,"./layer":6,"./view":12}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const view_1 = require("./view");
const layer_1 = require("./layer");
const point2d_1 = require("../geom/point2d");
class StaticImage extends layer_1.DrawLayer {
    constructor(localTransform, imageSrc, opacity, visible, description) {
        super(localTransform, opacity, visible, imageSrc, description);
        this.img = new Image();
        this.img.src = imageSrc;
    }
    drawImage(ctx, parentTransform, view) {
        if (this.isVisible()) {
            let ctxTransform = view_1.combineTransform(this, parentTransform);
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
            return true;
        }
        else if (!this.img.complete) {
            return false;
        }
        return true;
    }
    drawThumb(ctx, w, h) {
        if (this.visible && this.img.complete) {
            let scaleX = w / this.img.width;
            let scaleY = h / this.img.height;
            let scale = Math.min(scaleX, scaleY);
            ctx.scale(scale, scale);
            //console.log("scalex " + (this.img.width * scale));
            //console.log("scaley " + (this.img.height * scale));
            //console.log("xy " + this.img.x + ", " + this.img.y);
            ctx.drawImage(this.img, 0, 0);
            ctx.scale(1 / scale, 1 / scale);
            return true;
        }
        else if (!this.img.complete) {
            return false;
        }
        return true;
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
            return new point2d_1.Dimension(this.x + minX, this.y - maxY, maxX - minX, maxY - minY);
        }
        return new point2d_1.Dimension(this.x, this.y, 0, 0);
    }
}
exports.StaticImage = StaticImage;
class RectLayer extends layer_1.DrawLayer {
    constructor(dimension, opacity, visible) {
        super(new view_1.BasicTransform(dimension.x, dimension.y, 1, 1, 0), opacity, visible, "rect");
        this.dimension = dimension;
    }
    updateDimension(dimension) {
        this.dimension = dimension;
    }
    draw(ctx, parentTransform, view) {
        let x = (this.dimension.x + parentTransform.x - view.x) * view.zoomX;
        let y = (this.dimension.y + parentTransform.y - view.y) * view.zoomY;
        ctx.strokeStyle = "red";
        ctx.strokeRect(x, y, this.dimension.w * view.zoomX, this.dimension.h * view.zoomY);
        return true;
    }
    getDimension() {
        return this.dimension;
    }
}
exports.RectLayer = RectLayer;

},{"../geom/point2d":1,"./layer":6,"./view":12}],11:[function(require,module,exports){
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
    constructor(localTransform, tileStruct, visbile, name = "tiles", xOffset = 0, yOffset = 0, zoom = 1, gridWidth = 256, gridHeight = 256, opacity = 1) {
        super(localTransform, opacity, visbile, name);
        this.tileStruct = tileStruct;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.zoom = zoom;
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.tileManager = new TileManager();
    }
    draw(ctx, parentTransform, view) {
        if (this.isVisible()) {
            let ctxTransform = view_1.combineTransform(this, parentTransform);
            let zoomWidth = this.gridWidth * ctxTransform.zoomX;
            let zoomHeight = this.gridHeight * ctxTransform.zoomY;
            let transformX = view.x + ctxTransform.x;
            let transformY = view.y + ctxTransform.y;
            let viewX = view.x * view.zoomX;
            let viewY = view.y * view.zoomY;
            let viewWidth = view.width / view.zoomX;
            let viewHeight = view.height / view.zoomY;
            let gridAcross = viewWidth / zoomWidth;
            let gridHigh = viewHeight / zoomHeight;
            let xMin = Math.floor(transformX / zoomWidth);
            let xMax = Math.ceil((transformX + viewWidth) / zoomWidth);
            let yMin = Math.floor(transformY / zoomHeight);
            let yMax = Math.ceil((transformY + viewHeight) / zoomHeight);
            var drawingComplete = true;
            let fullZoomX = ctxTransform.zoomX * view.zoomX;
            let fullZoomY = ctxTransform.zoomY * view.zoomY;
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

},{"../geom/point2d":1,"./layer":6,"./view":12}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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




},{}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
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
		"src": "images/wsc/wsc-098.png", "visible": true, "opacity": 0.7,
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
		"name": "wsc-360",  "x": -143, "y": 426.5, "zoomX": 0.117, "zoomY": 0.103, "rotation": -0.05, 
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
	},
	{
		"name": "wsc-274-1", "x": -944.5, "y": 295, "zoomX": 0.164, "zoomY": 0.164, "rotation": -1.61,
		"src": "images/wsc/wsc-274-1.png", "visible": true, "opacity": 0.9,
		"description": "Map of Oxmantown Green, Bowling Green, Queen Street, King Street, New Church Street, Channel Row - with lot numbers"
	},
	{
		"name": "wsc-323-1", "x": -280, "y": 36, "zoomX": 0.072, "zoomY": 0.072, "rotation": -0.44,
		"src": "images/wsc/wsc-323-1.png", "visible": true, "opacity": 0.9,
		"description": "Widow Alms House in Great Britain Street - corner of Jervis Street and Great Britain Street Note: Notice of houses and grounds to be set, 1822",
		"date": 1822
	},
	{
		"name": "wsc-525", "x": 1091.5, "y": 252.5, "zoomX": 0.354, "zoomY": 0.354, "rotation": 0.11,
		"src": "images/wsc/wsc-525.png", "visible": true, "opacity": 0.9,
		"description": "Map of Ringsend, and vicinity"
	},
	{
		"name": "wsc-094-4", "x": -152.5, "y": 564, "zoomX": 0.058, "zoomY": 0.058, "rotation": -3.305,
		"src": "images/wsc/wsc-094-4.png", "visible": true, "opacity": 0.9,
		"description": "Castle Alley, Castle Lane, Dame Street and Cork Hill, to be sold by the Commissioners of Wide Streets, 17 April 1766. Showing lot to be reserved on which Royal Exchange, now (1899) the City Hall, was subsequently built - Jonathan Barker",
		"date": 1766
	},
	{
		"name": "wsc-219-1", "x": 253.5, "y": 60, "zoomX": 0.034, "zoomY": 0.034, "rotation": -0.325,
		"src": "images/wsc/wsc-219-1.png", "visible": true, "opacity": 0.9,
		"description": "Survey of a holding in Lower Abbey Street or on the North Strand - belonging to the Reps. of Griffith Lloyd - showing Lloyd’s Rope Walk, Glass House; late Sir Annesley Stewart’s Bart. holding Date: 1797",
		"date": 1747
	},
	{
		"name": "wsc-118", "x": 39,  "y": 562.5, "zoomX": 0.072, "zoomY": 0.072, "rotation": 3.089,
		"src": "images/wsc/wsc-118.png", "visible": true, "opacity": 0.9,
		"description": "Map of Dame Street, Dame Court, South Great George’s Street and vicinity",
		"date": 1785
	},
	{
		"name": "wsc-122-1", "x": 364, "y": 1270.5, "zoomX": 0.154, "zoomY": 0.154, "rotation": 3.144,
		"src": "images/wsc/wsc-122-1.png", "visible": true, "opacity": 0.9,
		"description": "Map and plan of part of Stephen’s Green, showing position of intended new street (Earlsfort Terrace)",
		"date": 1785
	}
]

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gridindexer_1 = require("./gridindexer");
class ContainerIndex {
    constructor(container, name, indexer = new gridindexer_1.GridIndexer(256)) {
        this.container = container;
        this.name = name;
        this.indexer = indexer;
        for (let layer of container.layers()) {
            this.add(layer);
        }
    }
    getLayers(x, y) {
        if (this.container.isVisible()) {
            console.log(this.name + " is visible ");
            return this.indexer.getLayers(x, y);
        }
        else {
            return [];
        }
    }
    add(canvasLayer) {
        this.indexer.add(canvasLayer);
    }
}
exports.ContainerIndex = ContainerIndex;

},{"./gridindexer":17}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../logging/logger");
class GridMap {
    constructor() {
        this.layerMap = new Map();
    }
    add(x, y, layer) {
        var layerValues;
        if (this.layerMap.has(this.key(x, y))) {
            layerValues = this.layerMap.get(this.key(x, y));
        }
        else {
            layerValues = [];
        }
        layerValues.push(layer);
        this.layerMap.set(this.key(x, y), layerValues);
    }
    get(x, y) {
        return this.layerMap.get(this.key(x, y));
    }
    has(x, y) {
        return this.layerMap.has(this.key(x, y));
    }
    key(x, y) {
        return x + "_" + y;
    }
}
class GridIndexer {
    constructor(gridWidth, gridHeight = gridWidth) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.canvasMap = new GridMap();
        this.logger = new logger_1.ConsoleLogger();
    }
    setLogger(logger) {
        this.logger = logger;
    }
    getLayers(x, y) {
        let gridX = Math.floor(x / this.gridWidth);
        let gridY = Math.floor(y / this.gridHeight);
        this.logger.log("grid xy " + gridX + ", " + gridY);
        if (this.canvasMap.has(gridX, gridY)) {
            return this.canvasMap.get(gridX, gridY);
        }
        else {
            return [];
        }
    }
    add(canvasLayer) {
        let dimension = canvasLayer.getDimension();
        let xMin = Math.floor(dimension.x / this.gridWidth);
        let xMax = Math.floor((dimension.x + dimension.w) / this.gridWidth);
        let yMin = Math.floor(dimension.y / this.gridHeight);
        let yMax = Math.floor((dimension.y + dimension.h) / this.gridHeight);
        for (var x = xMin; x <= xMax; x++) {
            for (var y = yMin; y <= yMax; y++) {
                this.canvasMap.add(x, y, canvasLayer);
            }
        }
    }
    showIndices(canvasLayer) {
        let dimension = canvasLayer.getDimension();
        let xMin = Math.floor(dimension.x / this.gridWidth);
        let xMax = Math.floor((dimension.x + dimension.w) / this.gridWidth);
        let yMin = Math.floor(dimension.y / this.gridHeight);
        let yMax = Math.floor((dimension.y + dimension.h) / this.gridHeight);
        var message = "grid: [";
        for (var x = xMin; x <= xMax; x++) {
            for (var y = yMin; y <= yMax; y++) {
                message = message + "[" + x + ", " + y + "]";
            }
        }
        message = message + "]";
        this.logger.log(message);
    }
}
exports.GridIndexer = GridIndexer;

},{"../logging/logger":26}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CanvasLayerView {
    constructor(layer, canvasView, imageController) {
        this.container = document.createElement("span");
        this.container.className = "layer";
        let editdiv = document.createElement("span");
        let label = document.createElement("span");
        label.innerHTML = layer.name;
        let visibility = document.createElement("input");
        visibility.type = "checkbox";
        visibility.checked = true;
        let edit = document.createElement("input");
        edit.type = "radio";
        edit.name = "edit";
        visibility.addEventListener('change', function (event) {
            if (this.checked) {
                layer.setVisible(true);
            }
            else {
                layer.setVisible(false);
            }
            canvasView.draw();
        });
        edit.addEventListener('change', function (event) {
            if (this.checked) {
                imageController.setCanvasElement(layer);
            }
            canvasView.draw();
        });
        var thumb = layer;
        let canvasImage = document.createElement("canvas");
        let thumbCtx = canvasImage.getContext("2d");
        thumb.drawThumb(thumbCtx, 200, 200);
        let thumbnail = new Image();
        thumbnail.src = canvasImage.toDataURL();
        thumbnail.className = "thumbnail";
        thumbnail.title = layer.description;
        editdiv.appendChild(label);
        editdiv.appendChild(visibility);
        editdiv.appendChild(edit);
        this.container.appendChild(editdiv);
        this.container.appendChild(thumbnail);
    }
}
exports.CanvasLayerView = CanvasLayerView;

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mousecontroller_1 = require("./mousecontroller");
const logger_1 = require("../logging/logger");
class EditController extends mousecontroller_1.MouseController {
    constructor(canvasView, editManager) {
        super();
        this.canvasView = canvasView;
        this.editManager = editManager;
        document.addEventListener("mousedown", (e) => this.clicked(e));
        document.addEventListener("mouseup", (e) => this.dragPoint = undefined);
        document.addEventListener("mousemove", (e) => this.drag(e));
        this.logger = new logger_1.ConsoleLogger();
    }
    setLogging(logger) {
        this.logger = logger;
    }
    clicked(e) {
        this.dragPosition = this.mousePosition(e, this.canvasView.canvasElement);
        let worldPoint = this.canvasView.getBasePoint(this.dragPosition);
        let editPoint = this.editManager.getPoint(worldPoint.x, worldPoint.y);
        if (editPoint != undefined) {
            console.log("found edit point " + editPoint.x + ", " + editPoint.y);
            this.dragPoint = editPoint;
        }
        else {
            console.log("not an edit point ");
            this.editManager.addPoint(worldPoint.x, worldPoint.y);
            this.canvasView.draw();
        }
    }
    drag(event) {
        if (this.dragPoint != undefined) {
            let point = this.mousePosition(event, this.canvasView.canvasElement);
            let xDelta = (point.x - this.dragPosition.x) / this.canvasView.zoomX;
            let yDelta = (point.y - this.dragPosition.y) / this.canvasView.zoomY;
            this.dragPoint.x = this.dragPoint.x + xDelta;
            this.dragPoint.y = this.dragPoint.y + yDelta;
            this.editManager.updatePoint(this.dragPoint);
            this.dragPosition = point;
            this.canvasView.draw();
        }
    }
}
exports.EditController = EditController;

},{"../logging/logger":26,"./mousecontroller":24}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gridindexer_1 = require("../index/gridindexer");
class DisplayElementController {
    constructor(canvasView, displayElement, mod = "v") {
        this.displayElement = displayElement;
        this.mod = mod;
        document.addEventListener("keypress", (e) => this.pressed(canvasView, e));
    }
    pressed(canvasView, event) {
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
    constructor(canvasView, canvasElement) {
        this.canvasView = canvasView;
        this.indexer = new gridindexer_1.GridIndexer(256);
        document.addEventListener("keypress", (e) => this.pressed(canvasView, e));
        this.canvasElement = canvasElement;
    }
    setCanvasElement(CanvasElement) {
        this.canvasElement = CanvasElement;
        this.indexer.showIndices(CanvasElement);
        this.updateCanvas(this.canvasView);
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
                this.canvasElement.x = this.canvasElement.x - 0.5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "A":
                this.canvasElement.x = this.canvasElement.x - 5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "d":
                this.canvasElement.x = this.canvasElement.x + 0.5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "D":
                this.canvasElement.x = this.canvasElement.x + 5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "w":
                this.canvasElement.y = this.canvasElement.y - 0.5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "W":
                this.canvasElement.y = this.canvasElement.y - 5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "s":
                this.canvasElement.y = this.canvasElement.y + 0.5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "S":
                this.canvasElement.y = this.canvasElement.y + 5 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "e":
                this.canvasElement.rotation = this.canvasElement.rotation - 0.005;
                this.updateCanvas(canvasView);
                break;
            case "E":
                this.canvasElement.rotation = this.canvasElement.rotation - 0.05;
                this.updateCanvas(canvasView);
                break;
            case "q":
                this.canvasElement.rotation = this.canvasElement.rotation + 0.005;
                this.updateCanvas(canvasView);
                break;
            case "Q":
                this.canvasElement.rotation = this.canvasElement.rotation + 0.05;
                this.updateCanvas(canvasView);
                break;
            case "x":
                this.canvasElement.zoomX = this.canvasElement.zoomX - 0.002 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "X":
                this.canvasElement.zoomX = this.canvasElement.zoomX + 0.002 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "z":
                this.canvasElement.zoomY = this.canvasElement.zoomY - 0.002 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "Z":
                this.canvasElement.zoomY = this.canvasElement.zoomY + 0.002 * multiplier;
                this.updateCanvas(canvasView);
                break;
            case "c":
                this.canvasElement.setVisible(!this.canvasElement.visible);
                this.updateCanvas(canvasView);
                break;
            case "T":
                this.canvasElement.opacity = Math.min(1.0, this.canvasElement.opacity + 0.1);
                this.updateCanvas(canvasView);
                break;
            case "t":
                this.canvasElement.opacity = Math.max(0, this.canvasElement.opacity - 0.1);
                this.updateCanvas(canvasView);
                break;
            default:
                // code...
                break;
        }
        let info = '"name": ' + this.canvasElement.name +
            ' "x": ' + this.canvasElement.x +
            ', "y": ' + this.canvasElement.y +
            ', "zoomX": ' + this.canvasElement.zoomX +
            ', "zoomY": ' + this.canvasElement.zoomY +
            ', "rotation": ' + this.canvasElement.rotation;
        if (this.editInfoPane != undefined) {
            this.editInfoPane.innerHTML = info;
        }
        else {
            console.log(info);
        }
    }
    ;
    updateCanvas(canvasView) {
        if (this.layerOutline != undefined) {
            let newDimension = this.canvasElement.getDimension();
            //console.log("image outline " + newDimension);
            this.layerOutline.updateDimension(newDimension);
        }
        canvasView.draw();
    }
}
exports.ImageController = ImageController;
;

},{"../index/gridindexer":17}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const point2d_1 = require("../geom/point2d");
const mousecontroller_1 = require("./mousecontroller");
const logger_1 = require("../logging/logger");
const indexview_1 = require("./indexview");
class IndexController extends mousecontroller_1.MouseController {
    constructor(canvasView, imageController) {
        super();
        this.canvasView = canvasView;
        this.imageController = imageController;
        document.addEventListener("dblclick", (e) => this.clicked(e));
        this.indexers = [];
        this.logger = new logger_1.ConsoleLogger();
    }
    setLogging(logger) {
        this.logger = logger;
    }
    setMenu(menu) {
        this.menu = menu;
    }
    addIndexer(indexer) {
        this.indexers.push(indexer);
    }
    clicked(e) {
        let point = this.mousePosition(e, this.canvasView.canvasElement);
        let worldPoint = this.canvasView.getBasePoint(new point2d_1.Point2D(point.x, point.y));
        var layers = [];
        for (let indexer of this.indexers) {
            let newLayers = this.filterVisible(indexer.getLayers(worldPoint.x, worldPoint.y));
            layers = layers.concat(newLayers);
        }
        if (this.menu != undefined) {
            let layerView = new indexview_1.IndexView(this.menu, this.canvasView, this.imageController);
            layerView.setElements(layers);
        }
    }
    filterVisible(layers) {
        return layers.filter(function (layer) {
            return layer.isVisible();
        });
    }
}
exports.IndexController = IndexController;

},{"../geom/point2d":1,"../logging/logger":26,"./indexview":22,"./mousecontroller":24}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const canvaslayerview_1 = require("./canvaslayerview");
class IndexView {
    constructor(viewElement, canvasView, imageController) {
        this.viewElement = viewElement;
        this.canvasView = canvasView;
        this.imageController = imageController;
    }
    setElements(canvasElements) {
        this.clear();
        for (let canvasLayer of canvasElements) {
            let layerView = new canvaslayerview_1.CanvasLayerView(canvasLayer, this.canvasView, this.imageController);
            this.viewElement.appendChild(layerView.container);
        }
    }
    clear() {
        let children = this.viewElement.children;
        let initialLength = children.length;
        while (children.length > 0) {
            children[0].remove();
        }
        return true;
    }
}
exports.IndexView = IndexView;

},{"./canvaslayerview":18}],23:[function(require,module,exports){
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
                this.containerLayerManager.toggleVisibility(false);
                canvasView.draw();
                break;
        }
    }
}
exports.LayerController = LayerController;

},{}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const point2d_1 = require("../geom/point2d");
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
        return new point2d_1.Point2D(m_posx - e_posx, m_posy - e_posy);
    }
}
exports.MouseController = MouseController;

},{"../geom/point2d":1}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mousecontroller_1 = require("./mousecontroller");
class ViewController extends mousecontroller_1.MouseController {
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
            // if  (event.ctrlKey) {
            //     zoomBy = 1 / zoomBy;
            // }
            // let mXY = this.mousePosition(event, this.dragElement);
            // this.canvasView.zoomAbout(mXY[0], mXY[1], zoomBy);
            // this.canvasView.draw();
            default:
        }
    }
    dragged(event, viewTransform) {
        //  	switch(event.type){
        //  		case "mousedown":
        //  			this.record = true;
        //  			break;
        //  		case "mouseup":
        //  			this.record = false;
        //  			break;
        //  		default:
        //  			if (this.record){
        //                  let xDelta = (event.clientX - this.xPrevious) / this.move / viewTransform.zoomX;
        //                  let yDelta = (event.clientY - this.yPrevious) / this.move / viewTransform.zoomY;
        //                  viewTransform.x = viewTransform.x - xDelta;
        //                  viewTransform.y = viewTransform.y - yDelta;
        //                  this.canvasView.draw();
        //  			}
        // this.xPrevious = event.clientX;
        // this.yPrevious = event.clientY;
        //  	}
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
            this.canvasView.zoomAbout(mXY.x, mXY.y, by);
        }
        else {
            this.canvasView.x = this.canvasView.x + xDelta;
            this.canvasView.y = this.canvasView.y + yDelta;
        }
        this.canvasView.draw();
    }
}
exports.ViewController = ViewController;

},{"./mousecontroller":24}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const canvasview_1 = require("./graphics/canvasview");
const static_1 = require("./graphics/static");
const containerlayer_1 = require("./graphics/containerlayer");
const multireslayer_1 = require("./graphics/multireslayer");
const view_1 = require("./graphics/view");
const grid_1 = require("./graphics/grid");
const multireslayer_2 = require("./graphics/multireslayer");
const tilelayer_1 = require("./graphics/tilelayer");
const layermanager_1 = require("./graphics/layermanager");
const indexcontroller_1 = require("./interface/indexcontroller");
const viewcontroller_1 = require("./interface/viewcontroller");
const imagecontroller_1 = require("./interface/imagecontroller");
const layercontroller_1 = require("./interface/layercontroller");
const containerindex_1 = require("./index/containerindex");
const logger_1 = require("./logging/logger");
const shape_1 = require("./graphics/shape");
const editmanager_1 = require("./graphics/editmanager");
const editcontroller_1 = require("./interface/editcontroller");
const firemaps = require("./imagegroups/firemaps.json");
const landmarks = require("./imagegroups/landmarks.json");
const wsc = require("./imagegroups/wscd.json");
let testPoints = [[0, 0], [400, 0], [400, 400], [0, 400]];
let testShape = new shape_1.Shape(view_1.BasicTransform.unitTransform, 1, true, "", "");
let testPoint = new shape_1.Point(800, 800, 20, 1, true);
testShape.points = shape_1.arrayToPoints(testPoints);
let editManager = new editmanager_1.EditManager(testShape, 12);
//testShape.fill = true;
let earlyDates = layermanager_1.dateFilter(wsc, 1680, 1792);
let midDates = layermanager_1.dateFilter(wsc, 1793, 1820);
let lateDates = layermanager_1.dateFilter(wsc, 1821, 1900);
let otherDates = layermanager_1.datelessFilter(wsc);
let layerState = new view_1.BasicTransform(0, 0, 1, 1, 0);
let imageLayer = new containerlayer_1.ContainerLayer(layerState);
let imageState = new view_1.BasicTransform(-1440, -1440, 0.222, 0.222, 0);
let countyState = new view_1.BasicTransform(-2631, -2051.5, 1.716, 1.674, 0);
let countyImage = new static_1.StaticImage(countyState, "images/County_of_the_City_of_Dublin_1837_map.png", 0.5, true, "county");
let bgState = new view_1.BasicTransform(-1126, -1086, 1.58, 1.55, 0);
let bgImage = new static_1.StaticImage(bgState, "images/fmss.jpeg", .6, true, "firemap");
let tmState = new view_1.BasicTransform(-1033.5, 149, 0.59, 0.59, 0);
let tmImage = new static_1.StaticImage(tmState, "images/thingmot.png", .3, true, "thingmot");
let duState = new view_1.BasicTransform(-929, -105.5, 0.464, 0.506, 0);
let duImage = new static_1.StaticImage(duState, "images/dublin1610.jpg", .6, false, "1610");
let gridTransform = view_1.BasicTransform.unitTransform;
let staticGrid = new grid_1.StaticGrid(gridTransform, 0, false, 256, 256);
let sentinelStruct = new tilelayer_1.TileStruct("qtile/dublin/", ".png", "images/qtile/dublin/");
let sentinelTransform = new view_1.BasicTransform(0, 0, 2, 2, 0);
let displayClose = new multireslayer_2.DisplayRange(0.8, 4);
let sentinelLayer = new tilelayer_1.TileLayer(sentinelTransform, sentinelStruct, true, "sentinel", 15816, 10624, 15);
let sentinelBTransform = new view_1.BasicTransform(0, 0, 4, 4, 0);
let displayMid = new multireslayer_2.DisplayRange(.2, 0.8);
let sentinelBLayer = new tilelayer_1.TileLayer(sentinelBTransform, sentinelStruct, true, "sentinelB", 7908, 5312, 14);
let sentinelCTransform = new view_1.BasicTransform(0, 0, 8, 8, 0);
let displayFar = new multireslayer_2.DisplayRange(.04, .2);
let sentinelSLayer = new tilelayer_1.TileLayer(sentinelCTransform, sentinelStruct, true, "sentinelC", 3954, 2656, 13);
let recentre = new view_1.BasicTransform(-1024, -1536, 1, 1, 0);
let sentinelContainerLayer = new multireslayer_1.MultiResLayer(recentre, 1, true);
sentinelContainerLayer.set(displayClose, sentinelLayer);
sentinelContainerLayer.set(displayMid, sentinelBLayer);
sentinelContainerLayer.set(displayFar, sentinelSLayer);
let editContainerLayer = new containerlayer_1.ContainerLayer(view_1.BasicTransform.unitTransform);
imageLayer.set("county", countyImage);
imageLayer.set("background", bgImage);
let layerManager = new layermanager_1.LayerManager();
let firemapLayer = layerManager.addImages(firemaps, "firemaps");
let landmarksLayer = layerManager.addImages(landmarks, "landmarks");
let wscEarlyLayer = layerManager.addImages(earlyDates, "wsc_early");
let wscMidLayer = layerManager.addImages(midDates, "wsc_mid");
wscMidLayer.setVisible(false);
let wscLateLayer = layerManager.addImages(lateDates, "wsc_late");
wscLateLayer.setVisible(false);
let wscOtherLayer = layerManager.addImages(otherDates, "wsc_other");
wscOtherLayer.setVisible(false);
let edit = wscEarlyLayer.get("wsc-122-1");
let earlyIndex = new containerindex_1.ContainerIndex(wscEarlyLayer, "early");
let midIndex = new containerindex_1.ContainerIndex(wscMidLayer, "mid");
let lateIndex = new containerindex_1.ContainerIndex(wscLateLayer, "late");
let otherIndex = new containerindex_1.ContainerIndex(wscOtherLayer, "other");
let containerLayerManager = new layermanager_1.ContainerLayerManager(wscEarlyLayer, editContainerLayer);
let outlineLayer = containerLayerManager.setSelected("wsc-122-1");
imageLayer.set("wsc_other", wscOtherLayer);
imageLayer.set("wsc_early", wscEarlyLayer);
imageLayer.set("wsc_mid", wscMidLayer);
imageLayer.set("wsc_late", wscLateLayer);
// imageLayer.set("firemaps", firemapLayer);
// imageLayer.set("dublin1610", duImage);
// imageLayer.set("thingmot", tmImage);
// imageLayer.set("landmarks", landmarksLayer);
imageLayer.set("shape", testShape);
imageLayer.set("editor", editManager);
//wscEarlyLayer.setTop("wsc-334");
function showMap(divName, name) {
    const canvas = document.getElementById(divName);
    const info = document.getElementById("edit_info");
    const layers = document.getElementById("layers");
    let x = outlineLayer.x;
    let y = outlineLayer.y;
    let dimension = outlineLayer.getDimension();
    console.log("outline dimension: " + dimension);
    let canvasZoom = 0.5;
    let w = dimension.w * canvasZoom;
    let canvasTransform = new view_1.BasicTransform(x - 200, y - 200, canvasZoom, canvasZoom, 0);
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
    let logger = new logger_1.ElementLogger(info);
    let indexController = new indexcontroller_1.IndexController(canvasView, imageController);
    indexController.addIndexer(earlyIndex);
    indexController.addIndexer(midIndex);
    indexController.addIndexer(lateIndex);
    indexController.addIndexer(otherIndex);
    indexController.setMenu(layers);
    let editController = new editcontroller_1.EditController(canvasView, editManager);
    editController.setLogging(logger);
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

},{"./graphics/canvasview":2,"./graphics/containerlayer":3,"./graphics/editmanager":4,"./graphics/grid":5,"./graphics/layermanager":7,"./graphics/multireslayer":8,"./graphics/shape":9,"./graphics/static":10,"./graphics/tilelayer":11,"./graphics/view":12,"./imagegroups/firemaps.json":13,"./imagegroups/landmarks.json":14,"./imagegroups/wscd.json":15,"./index/containerindex":16,"./interface/editcontroller":19,"./interface/imagecontroller":20,"./interface/indexcontroller":21,"./interface/layercontroller":23,"./interface/viewcontroller":25,"./logging/logger":26}]},{},[27])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2dyYXBoaWNzL2NhbnZhc3ZpZXcudHMiLCJzcmMvZ3JhcGhpY3MvY29udGFpbmVybGF5ZXIudHMiLCJzcmMvZ3JhcGhpY3MvZWRpdG1hbmFnZXIudHMiLCJzcmMvZ3JhcGhpY3MvZ3JpZC50cyIsInNyYy9ncmFwaGljcy9sYXllci50cyIsInNyYy9ncmFwaGljcy9sYXllcm1hbmFnZXIudHMiLCJzcmMvZ3JhcGhpY3MvbXVsdGlyZXNsYXllci50cyIsInNyYy9ncmFwaGljcy9zaGFwZS50cyIsInNyYy9ncmFwaGljcy9zdGF0aWMudHMiLCJzcmMvZ3JhcGhpY3MvdGlsZWxheWVyLnRzIiwic3JjL2dyYXBoaWNzL3ZpZXcudHMiLCJzcmMvaW1hZ2Vncm91cHMvZmlyZW1hcHMuanNvbiIsInNyYy9pbWFnZWdyb3Vwcy9sYW5kbWFya3MuanNvbiIsInNyYy9pbWFnZWdyb3Vwcy93c2NkLmpzb24iLCJzcmMvaW5kZXgvY29udGFpbmVyaW5kZXgudHMiLCJzcmMvaW5kZXgvZ3JpZGluZGV4ZXIudHMiLCJzcmMvaW50ZXJmYWNlL2NhbnZhc2xheWVydmlldy50cyIsInNyYy9pbnRlcmZhY2UvZWRpdGNvbnRyb2xsZXIudHMiLCJzcmMvaW50ZXJmYWNlL2ltYWdlY29udHJvbGxlci50cyIsInNyYy9pbnRlcmZhY2UvaW5kZXhjb250cm9sbGVyLnRzIiwic3JjL2ludGVyZmFjZS9pbmRleHZpZXcudHMiLCJzcmMvaW50ZXJmYWNlL2xheWVyY29udHJvbGxlci50cyIsInNyYy9pbnRlcmZhY2UvbW91c2Vjb250cm9sbGVyLnRzIiwic3JjL2ludGVyZmFjZS92aWV3Y29udHJvbGxlci50cyIsInNyYy9sb2dnaW5nL2xvZ2dlci50cyIsInNyYy9zaW1wbGVXb3JsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQ0EsTUFBYSxPQUFP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QUssQ0FBQztRQUNsQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFFbEMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3hDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUUxQyxJQUFJLFVBQVUsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUM1QyxJQUFJLFFBQVEsR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUU1QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzdDLElBQUksS0FBSyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDL0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzVELElBQUksTUFBTSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFFaEQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5QyxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQy9DLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5RCxJQUFJ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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRXBFLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUVyRSxLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLElBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFDO1lBQy9CLEtBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsSUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUM7Z0JBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7YUFDdEM7U0FDRDtJQUNGLENBQUM7SUFFRCxXQUFXLENBQUMsV0FBd0I7UUFFbkMsSUFBSSxTQUFTLEdBQUcsV0FBVyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRTNDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVwRSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3JELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFH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Q0FBQyxRQUFRLENBQUMsQ0FBQztJQUNyQyxlQUFlLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3RDLGVBQWUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFdkMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVoQyxJQUFJLGNBQWMsR0FBRyxJQUFJLCtCQUFjLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ2pFLGNBQWMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7QUFFdEMsQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFDLFVBQXNCO0lBQ25DLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUc7UUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixVQUFVLENBQUMsY0FBWSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUEsQ0FBQSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDckQ7QUFDTCxDQUFDO0FBRUQsU0FBUyxJQUFJO0lBQ1osT0FBTyxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBRUQsSUFDSSxRQUFRLENBQUMsVUFBVSxLQUFLLFVBQVU7SUFDbEMsQ0FBQyxRQUFRLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQzNFO0lBQ0QsSUFBSSxFQUFFLENBQUM7Q0FDUDtLQUFNO0lBQ04sUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ3BEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXG5leHBvcnQgY2xhc3MgUG9pbnQyRCB7XG4gICAgc3RhdGljIHJlYWRvbmx5IHplcm8gPSBuZXcgUG9pbnQyRCgwLCAwKTtcbiAgICBzdGF0aWMgcmVhZG9ubHkgb25lID0gbmV3IFBvaW50MkQoMSwgMSk7XG5cbiAgICByZWFkb25seSB4OiBudW1iZXI7XG4gICAgcmVhZG9ubHkgeTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcblx0fVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiUG9pbnQyRChcIiArIHRoaXMueCArIFwiLCBcIiArIHRoaXMueSArIFwiKVwiO1xuICAgIH1cblxufVxuXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlKFxuICBwb2ludDogUG9pbnQyRCwgXG4gIGFuZ2xlOiBudW1iZXIsIFxuICBhYm91dDogUG9pbnQyRCA9IG5ldyBQb2ludDJEKDAsMClcbik6IFBvaW50MkQge1xuXG4gICAgbGV0IHMgPSBNYXRoLnNpbihhbmdsZSk7XG4gICAgbGV0IGMgPSBNYXRoLmNvcyhhbmdsZSk7XG5cbiAgICBsZXQgcHggPSBwb2ludC54IC0gYWJvdXQueDtcbiAgICBsZXQgcHkgPSBwb2ludC55IC0gYWJvdXQueTtcblxuICAgIGxldCB4bmV3ID0gcHggKiBjICsgcHkgKiBzO1xuICAgIGxldCB5bmV3ID0gcHkgKiBjIC0gcHggKiBzO1xuXG4gICAgcmV0dXJuIG5ldyBQb2ludDJEKHhuZXcgKyBhYm91dC54LCB5bmV3ICsgYWJvdXQueSk7XG59XG5cbmV4cG9ydCBjbGFzcyBEaW1lbnNpb24ge1xuXG4gICAgY29uc3RydWN0b3IocHVibGljIHg6IG51bWJlciwgcHVibGljIHk6IG51bWJlciwgcHVibGljIHc6IG51bWJlciwgcHVibGljIGg6IG51bWJlcil7fVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiRGltZW5zaW9uKFwiICsgdGhpcy54ICsgXCIsIFwiICsgdGhpcy55ICsgXCIsIFwiICsgdGhpcy53ICsgXCIsIFwiICsgdGhpcy5oICsgXCIpXCI7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcbmltcG9ydCB7IENhbnZhc0VsZW1lbnQgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgXG5cdGludmVydFRyYW5zZm9ybSwgXG5cdFZpZXdUcmFuc2Zvcm0sIFxuXHRCYXNpY1ZpZXdUcmFuc2Zvcm0sIFxuXHRUcmFuc2Zvcm0sIFxuXHRCYXNpY1RyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcblxuZXhwb3J0IGludGVyZmFjZSBEaXNwbGF5RWxlbWVudCBleHRlbmRzIFRyYW5zZm9ybSB7XG5cdGlzVmlzaWJsZSgpOiBib29sZWFuO1xuXHRzZXRWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4pOiB2b2lkO1xuXHRnZXRPcGFjaXR5KCk6IG51bWJlcjtcblx0c2V0T3BhY2l0eShvcGFjaXR5OiBudW1iZXIpOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgQ2FudmFzVmlldyBleHRlbmRzIEJhc2ljVmlld1RyYW5zZm9ybSB7XG5cblx0bGF5ZXJzOiBBcnJheTxDYW52YXNFbGVtZW50PiA9IFtdO1xuXHRjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHR3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgXG5cdFx0cmVhZG9ubHkgY2FudmFzRWxlbWVudDogSFRNTENhbnZhc0VsZW1lbnQpe1xuXG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0ueCwgbG9jYWxUcmFuc2Zvcm0ueSwgd2lkdGgsIGhlaWdodCwgXG5cdFx0XHRsb2NhbFRyYW5zZm9ybS56b29tWCwgbG9jYWxUcmFuc2Zvcm0uem9vbVksIFxuXHRcdFx0bG9jYWxUcmFuc2Zvcm0ucm90YXRpb24pO1xuXG5cdFx0dGhpcy5pbml0Q2FudmFzKCk7XG5cblx0XHR0aGlzLmN0eCA9IGNhbnZhc0VsZW1lbnQuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHR9XG5cblx0em9vbUFib3V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB6b29tQnk6IG51bWJlcil7XG5cbiAgICAgICAgdGhpcy56b29tWCA9IHRoaXMuem9vbVggKiB6b29tQnk7XG4gICAgICAgIHRoaXMuem9vbVkgPSB0aGlzLnpvb21ZICogem9vbUJ5O1xuXG4gICAgICAgIGxldCByZWxhdGl2ZVggPSB4ICogem9vbUJ5IC0geDtcbiAgICAgICAgbGV0IHJlbGF0aXZlWSA9IHkgKiB6b29tQnkgLSB5O1xuXG4gICAgICAgIGxldCB3b3JsZFggPSByZWxhdGl2ZVggLyB0aGlzLnpvb21YO1xuICAgICAgICBsZXQgd29ybGRZID0gcmVsYXRpdmVZIC8gdGhpcy56b29tWTtcblxuICAgICAgICB0aGlzLnggPSB0aGlzLnggKyB3b3JsZFg7XG4gICAgICAgIHRoaXMueSA9IHRoaXMueSArIHdvcmxkWTtcblxuXHR9XG5cblx0Z2V0QmFzZVBvaW50KGNvb3JkOiBQb2ludDJEKTogUG9pbnQyRCB7XG5cdFx0cmV0dXJuIG5ldyBQb2ludDJEKFxuXHRcdFx0dGhpcy54ICsgY29vcmQueCAvIHRoaXMuem9vbVgsIFxuXHRcdFx0dGhpcy55ICsgY29vcmQueSAvIHRoaXMuem9vbVkpO1xuXHR9XG5cblx0ZHJhdygpOiBib29sZWFuIHtcblx0XHRsZXQgdHJhbnNmb3JtID0gaW52ZXJ0VHJhbnNmb3JtKHRoaXMpO1xuXG5cdFx0dGhpcy5jdHguZmlsbFN0eWxlID0gXCJncmV5XCI7XG5cdFx0dGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXG5cdFx0dmFyIGRyYXdpbmdDb21wbGV0ZSA9IHRydWU7XG5cblx0XHRmb3IgKGxldCBsYXllciBvZiB0aGlzLmxheWVycyl7XG5cdFx0XHRpZiAobGF5ZXIuaXNWaXNpYmxlKCkpe1xuXHRcdFx0XHRkcmF3aW5nQ29tcGxldGUgPSBkcmF3aW5nQ29tcGxldGUgJiYgbGF5ZXIuZHJhdyh0aGlzLmN0eCwgQmFzaWNUcmFuc2Zvcm0udW5pdFRyYW5zZm9ybSwgdGhpcyk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9XG5cblx0XHR0aGlzLmRyYXdDZW50cmUodGhpcy5jdHgpO1xuXHRcdHRoaXMuc2hvd0luZm8odGhpcy5jdHgpO1xuXG5cdFx0cmV0dXJuIGRyYXdpbmdDb21wbGV0ZTtcblx0fVxuXG5cdGRyYXdDZW50cmUoY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKXtcbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IDAuMztcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKHRoaXMud2lkdGgvMiwgNi8xNip0aGlzLmhlaWdodCk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKHRoaXMud2lkdGgvMiwgMTAvMTYqdGhpcy5oZWlnaHQpO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyg3LzE2KnRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LzIpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyg5LzE2KnRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LzIpO1xuICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gXCJibGFja1wiO1xuICAgICAgICBjb250ZXh0Lmdsb2JhbEFscGhhID0gMTtcbiAgICB9XG5cbiAgICBzaG93SW5mbyhjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpe1xuICAgIFx0Y29udGV4dC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG4gICAgXHRjb250ZXh0LmZpbGxUZXh0KFwiem9vbTogXCIgKyB0aGlzLnpvb21YLCAxMCwgMTApO1xuICAgIFx0Y29udGV4dC5maWxsKCk7XG4gICAgfVxuXG5cdHByaXZhdGUgaW5pdENhbnZhcygpe1xuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLmNhbnZhc0VsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLmNhbnZhc0VsZW1lbnQuY2xpZW50SGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQuaGVpZ2h0ID0gaGVpZ2h0O1xuXHR9XG5cbn0iLCJpbXBvcnQgeyBUcmFuc2Zvcm0sIEJhc2ljVHJhbnNmb3JtLCBcblx0Vmlld1RyYW5zZm9ybSwgXG5cdGNvbWJpbmVUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBEaW1lbnNpb24gfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBDYW52YXNFbGVtZW50IH0gZnJvbSBcIi4vbGF5ZXJcIjtcblxuZXhwb3J0IGNsYXNzIENvbnRhaW5lckxheWVyIGV4dGVuZHMgQ2FudmFzRWxlbWVudCB7XG5cblx0bGF5ZXJNYXA6IE1hcDxzdHJpbmcsIENhbnZhc0VsZW1lbnQ+O1xuXHRkaXNwbGF5TGF5ZXJzOiBBcnJheTxDYW52YXNFbGVtZW50PjtcblxuXHRjb25zdHJ1Y3Rvcihsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBvcGFjaXR5OiBudW1iZXIgPSAxLCB2aXNpYmxlOiBib29sZWFuID0gdHJ1ZSkge1xuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCBvcGFjaXR5LCB2aXNpYmxlKTtcblx0XHR0aGlzLmxheWVyTWFwID0gbmV3IE1hcDxzdHJpbmcsIENhbnZhc0VsZW1lbnQ+KCk7XG5cdFx0dGhpcy5kaXNwbGF5TGF5ZXJzID0gW107XG5cdH1cblxuXHRzZXQobmFtZTogc3RyaW5nLCBsYXllcjogQ2FudmFzRWxlbWVudCk6IHZvaWQge1xuXHRcdHRoaXMubGF5ZXJNYXAuc2V0KG5hbWUsIGxheWVyKTtcblx0XHR0aGlzLmRpc3BsYXlMYXllcnMucHVzaChsYXllcik7XG5cdH1cblxuXHRnZXQobmFtZTogc3RyaW5nKTogQ2FudmFzRWxlbWVudCB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXAuZ2V0KG5hbWUpO1xuXHR9XG5cblx0bGF5ZXJzKCk6IEFycmF5PENhbnZhc0VsZW1lbnQ+IHtcblx0XHRyZXR1cm4gdGhpcy5kaXNwbGF5TGF5ZXJzO1xuXHR9XG5cblx0c2V0VG9wKG5hbWU6IHN0cmluZykge1xuXHRcdGxldCB0b3BMYXllciA9IHRoaXMuZ2V0KG5hbWUpO1xuXHRcdGlmICh0b3BMYXllciAhPSB1bmRlZmluZWQpe1xuXHRcdFx0dGhpcy5kaXNwbGF5TGF5ZXJzID0gdGhpcy5kaXNwbGF5TGF5ZXJzLmZpbHRlcihmdW5jdGlvbihlbGVtZW50OiBDYW52YXNFbGVtZW50KXsgXG5cdFx0XHRcdGlmIChlbGVtZW50ID09IHRvcExheWVyKXtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH19KTtcblx0XHRcdHRoaXMuZGlzcGxheUxheWVycy5wdXNoKHRvcExheWVyKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5sb2coXCJ0b3AgbGF5ZXIgdW5kZWZpbmVkIFwiICsgbmFtZSk7XG5cdFx0fVxuXHR9XG5cblx0ZHJhdyhcblx0ICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgXG5cdCAgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHQgIHZpZXc6IFZpZXdUcmFuc2Zvcm0pOiBib29sZWFuIHtcblxuXHRcdGxldCBsYXllclRyYW5zZm9ybSA9IGNvbWJpbmVUcmFuc2Zvcm0odGhpcy5sb2NhbFRyYW5zZm9ybSwgcGFyZW50VHJhbnNmb3JtKTtcblxuXHRcdHZhciBkcmF3aW5nQ29tcGxldGUgPSB0cnVlO1xuXG5cdFx0Zm9yIChsZXQgbGF5ZXIgb2YgdGhpcy5kaXNwbGF5TGF5ZXJzKSB7XG5cdFx0XHRpZiAobGF5ZXIuaXNWaXNpYmxlKCkpe1xuXHRcdFx0XHRkcmF3aW5nQ29tcGxldGUgPSBkcmF3aW5nQ29tcGxldGUgJiYgbGF5ZXIuZHJhdyhjdHgsIGxheWVyVHJhbnNmb3JtLCB2aWV3KTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdH1cblxuXHRcdHJldHVybiBkcmF3aW5nQ29tcGxldGU7XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHR2YXIgeE1pbiA9IHRoaXMueDtcblx0XHR2YXIgeU1pbiA9IHRoaXMueTtcblx0XHR2YXIgeE1heCA9IHRoaXMueDtcblx0XHR2YXIgeU1heCA9IHRoaXMueTtcblxuXHRcdGZvciAobGV0IGxheWVyIG9mIHRoaXMuZGlzcGxheUxheWVycykge1xuXHRcdFx0bGV0IGxheWVyRGltZW5zaW9uID0gbGF5ZXIuZ2V0RGltZW5zaW9uKCk7XG5cdFx0XHR4TWluID0gTWF0aC5taW4oeE1pbiwgdGhpcy54ICsgbGF5ZXJEaW1lbnNpb24ueCk7XG5cdFx0XHR5TWluID0gTWF0aC5taW4oeU1pbiwgdGhpcy55ICsgbGF5ZXJEaW1lbnNpb24ueSk7XG5cdFx0XHR4TWF4ID0gTWF0aC5tYXgoeE1heCwgdGhpcy54ICsgbGF5ZXJEaW1lbnNpb24ueCArIHRoaXMuem9vbVggKiBsYXllckRpbWVuc2lvbi53KTtcblx0XHRcdHlNYXggPSBNYXRoLm1heCh5TWF4LCB0aGlzLnkgKyBsYXllckRpbWVuc2lvbi55ICsgdGhpcy56b29tWSAqIGxheWVyRGltZW5zaW9uLmgpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgRGltZW5zaW9uKHhNaW4sIHlNaW4sIHhNYXggLSB4TWluLCB5TWF4IC0geU1pbik7XG5cdH1cblxufSIsImltcG9ydCB7IENhbnZhc0VsZW1lbnQgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgVHJhbnNmb3JtLCBCYXNpY1RyYW5zZm9ybSwgVmlld1RyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IFNoYXBlLCBQb2ludCB9IGZyb20gXCIuL3NoYXBlXCI7XG5pbXBvcnQgeyBEaW1lbnNpb24sIFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbmV4cG9ydCBjbGFzcyBFZGl0TWFuYWdlciBleHRlbmRzIENhbnZhc0VsZW1lbnQge1xuXG5cdHByaXZhdGUgcG9pbnRNYXA6IE1hcDxQb2ludCwgUG9pbnQyRD47XG5cblx0Y29uc3RydWN0b3IocmVhZG9ubHkgc2hhcGU6IFNoYXBlLCByZWFkb25seSByYWRpdXMgPSA1KXtcblxuXHRcdHN1cGVyKHNoYXBlLmxvY2FsVHJhbnNmb3JtKTtcblxuXHRcdHRoaXMucG9pbnRNYXAgPSBuZXcgTWFwPFBvaW50LCBQb2ludDJEPigpO1xuXG5cdFx0Zm9yICAobGV0IHBvaW50MmQgb2Ygc2hhcGUucG9pbnRzKXtcblx0XHRcdGxldCBwb2ludCA9IG5ldyBQb2ludChwb2ludDJkLngsIHBvaW50MmQueSwgdGhpcy5yYWRpdXMsIDEsIHRydWUpO1xuXHRcdFx0dGhpcy5wb2ludE1hcC5zZXQocG9pbnQsIHBvaW50MmQpO1xuXHRcdH1cblx0fVxuXG5cdGFkZFBvaW50KHg6IG51bWJlciwgeTogbnVtYmVyKTogdm9pZCB7XG5cdFx0bGV0IHBvaW50ID0gbmV3IFBvaW50KHgsIHksIHRoaXMucmFkaXVzLCAxLCB0cnVlKTtcblx0XHRsZXQgcG9pbnQyZCA9IG5ldyBQb2ludDJEKHgsIHkpO1xuXHRcdHRoaXMuc2hhcGUucG9pbnRzLnB1c2gocG9pbnQyZCk7XG5cdFx0dGhpcy5wb2ludE1hcC5zZXQocG9pbnQsIHBvaW50MmQpO1xuXHR9XG5cblx0dXBkYXRlUG9pbnQocG9pbnQ6IFBvaW50KXtcblx0XHRsZXQgc2hhcGVQb2ludCA9IHRoaXMucG9pbnRNYXAuZ2V0KHBvaW50KTtcblx0XHRzaGFwZVBvaW50LnggPSBwb2ludC54O1xuXHRcdHNoYXBlUG9pbnQueSA9IHBvaW50Lnk7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBcblx0ICBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdCAgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0Zm9yIChsZXQgW3BvaW50LCBwb2ludDJkXSBvZiB0aGlzLnBvaW50TWFwKXtcblx0XHRcdHBvaW50LmRyYXcoY3R4LCBwYXJlbnRUcmFuc2Zvcm0sIHZpZXcpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0Z2V0UG9pbnQoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBQb2ludCB7XG5cdFx0Zm9yIChsZXQgW3BvaW50LCBwb2ludDJkXSBvZiB0aGlzLnBvaW50TWFwKXtcblx0XHRcdGlmIChwb2ludC5pbnNpZGUoeCwgeSkpe1xuXHRcdFx0XHRyZXR1cm4gcG9pbnQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHRyZXR1cm4gdGhpcy5zaGFwZS5nZXREaW1lbnNpb24oKTtcblx0fVxufSIsImltcG9ydCB7IERyYXdMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBUcmFuc2Zvcm0sIFZpZXdUcmFuc2Zvcm0sIGNvbWJpbmVUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBEaW1lbnNpb24gfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbi8qKlxuKiBXZSBkb24ndCB3YW50IHRvIGRyYXcgYSBncmlkIGludG8gYSB0cmFuc2Zvcm1lZCBjYW52YXMgYXMgdGhpcyBnaXZlcyB1cyBncmlkIGxpbmVzIHRoYXQgYXJlIHRvb1xudGhpY2sgb3IgdG9vIHRoaW5cbiovXG5leHBvcnQgY2xhc3MgU3RhdGljR3JpZCBleHRlbmRzIERyYXdMYXllciB7XG5cblx0em9vbVdpZHRoOiBudW1iZXI7XG5cdHpvb21IZWlnaHQ6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3Rvcihsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCB6b29tTGV2ZWw6IG51bWJlciwgdmlzaWJsZTogYm9vbGVhbixcblx0XHRyZWFkb25seSBncmlkV2lkdGg6IG51bWJlciA9IDI1NiwgcmVhZG9ubHkgZ3JpZEhlaWdodDogbnVtYmVyID0gMjU2KXtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCAxLCB2aXNpYmxlKTtcblxuXHRcdGxldCB6b29tID0gTWF0aC5wb3coMiwgem9vbUxldmVsKTtcblx0XHR0aGlzLnpvb21XaWR0aCA9IGdyaWRXaWR0aCAvIHpvb207XG5cdFx0dGhpcy56b29tSGVpZ2h0ID0gZ3JpZEhlaWdodCAvIHpvb207XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB0cmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0bGV0IG9mZnNldFggPSB2aWV3LnggKiB2aWV3Lnpvb21YO1xuXHRcdGxldCBvZmZzZXRZID0gdmlldy55ICogdmlldy56b29tWTtcblxuXHRcdGxldCB2aWV3V2lkdGggPSB2aWV3LndpZHRoIC8gdmlldy56b29tWDtcblx0XHRsZXQgdmlld0hlaWdodCA9IHZpZXcuaGVpZ2h0IC8gdmlldy56b29tWTtcblxuXHRcdGxldCBncmlkQWNyb3NzID0gdmlld1dpZHRoIC8gdGhpcy56b29tV2lkdGg7XG5cdFx0bGV0IGdyaWRIaWdoID0gdmlld0hlaWdodCAvIHRoaXMuem9vbUhlaWdodDtcblxuXHRcdGxldCB4TWluID0gTWF0aC5mbG9vcih2aWV3LngvdGhpcy56b29tV2lkdGgpO1xuXHRcdGxldCB4TGVmdCA9IHhNaW4gKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IHhNYXggPSBNYXRoLmNlaWwoKHZpZXcueCArIHZpZXdXaWR0aCkgLyB0aGlzLnpvb21XaWR0aCk7XG5cdFx0bGV0IHhSaWdodCA9IHhNYXggKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cblx0XHRsZXQgeU1pbiA9IE1hdGguZmxvb3Iodmlldy55L3RoaXMuem9vbUhlaWdodCk7XG5cdFx0bGV0IHlUb3AgPSB5TWluICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWDtcblx0XHRsZXQgeU1heCA9IE1hdGguY2VpbCgodmlldy55ICsgdmlld0hlaWdodCkgLyB0aGlzLnpvb21IZWlnaHQpO1xuXHRcdGxldCB5Qm90dG9tID0geU1heCAqIHRoaXMuem9vbUhlaWdodCAqIHZpZXcuem9vbVggO1xuXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcblxuXHRcdGZvciAodmFyIHggPSB4TWluOyB4PD14TWF4OyB4Kyspe1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImF0IFwiICsgbWluWCk7XG5cdFx0XHRsZXQgeE1vdmUgPSB4ICogdGhpcy56b29tV2lkdGggKiB2aWV3Lnpvb21YO1xuXHRcdFx0Y3R4Lm1vdmVUbyh4TW92ZSAtIG9mZnNldFgsIHlUb3AgLSBvZmZzZXRZKTtcblx0XHRcdGN0eC5saW5lVG8oeE1vdmUgLSBvZmZzZXRYLCB5Qm90dG9tIC0gb2Zmc2V0WSk7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgeSA9IHlNaW47IHk8PXlNYXg7IHkrKyl7XG5cblx0XHRcdGxldCB5TW92ZSA9IHkgKiB0aGlzLnpvb21IZWlnaHQgKiB2aWV3Lnpvb21ZO1xuXHRcdFx0Y3R4Lm1vdmVUbyh4TGVmdCAtIG9mZnNldFgsIHlNb3ZlIC0gb2Zmc2V0WSk7XG5cdFx0XHRjdHgubGluZVRvKHhSaWdodCAtIG9mZnNldFgsIHlNb3ZlIC0gb2Zmc2V0WSk7XG5cblx0XHRcdGZvciAodmFyIHggPSB4TWluOyB4PD14TWF4OyB4Kyspe1xuXHRcdFx0XHRsZXQgeE1vdmUgPSAoeC0uNSkgKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cdFx0XHRcdHlNb3ZlID0gKHktLjUpICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWTtcblx0XHRcdFx0bGV0IHRleHQgPSBcIlwiICsgKHgtMSkgKyBcIiwgXCIgKyAoeS0xKTtcblx0XHRcdFx0Y3R4LnN0cm9rZVRleHQodGV4dCwgeE1vdmUgLSBvZmZzZXRYLCB5TW92ZSAtIG9mZnNldFkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHRyZXR1cm4gbmV3IERpbWVuc2lvbigwLCAwLCAwLCAwKTtcblx0fVxufSIsImltcG9ydCB7IFRyYW5zZm9ybSwgQmFzaWNUcmFuc2Zvcm0sIFxuXHRWaWV3VHJhbnNmb3JtLCBcblx0Y29tYmluZVRyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IERpc3BsYXlFbGVtZW50IH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgRGltZW5zaW9uIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2FudmFzRWxlbWVudCBleHRlbmRzIEJhc2ljVHJhbnNmb3JtIGltcGxlbWVudHMgXG4gIERpc3BsYXlFbGVtZW50IHtcblxuXHRjb25zdHJ1Y3Rvcihcblx0ICBwdWJsaWMgbG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdCAgcHVibGljIG9wYWNpdHkgPSAxLCBcblx0ICBwdWJsaWMgdmlzaWJsZSA9IHRydWUsXG5cdCAgcHVibGljIG5hbWUgPSBcIlwiLFxuXHQgIHB1YmxpYyBkZXNjcmlwdGlvbiA9IFwiXCIsXG5cdCAgKXtcblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybS54LCBsb2NhbFRyYW5zZm9ybS55LCBsb2NhbFRyYW5zZm9ybS56b29tWCwgbG9jYWxUcmFuc2Zvcm0uem9vbVksIFxuXHRcdFx0bG9jYWxUcmFuc2Zvcm0ucm90YXRpb24pO1xuXHR9XG5cblx0YWJzdHJhY3QgZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHRcdHZpZXc6IFZpZXdUcmFuc2Zvcm0pOiBib29sZWFuO1xuXG5cdGFic3RyYWN0IGdldERpbWVuc2lvbigpOiBEaW1lbnNpb247XG5cblx0aXNWaXNpYmxlKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnZpc2libGU7XG5cdH1cblxuXHRzZXRWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4pOiB2b2lkIHtcblx0XHRjb25zb2xlLmxvZyhcInNldHRpbmcgdmlzaWJpbGl0eTogXCIgKyB2aXNpYmxlKTtcblx0XHR0aGlzLnZpc2libGUgPSB2aXNpYmxlO1xuXHR9XG5cblx0Z2V0T3BhY2l0eSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLm9wYWNpdHk7XG5cdH1cblxuXHRzZXRPcGFjaXR5KG9wYWNpdHk6IG51bWJlcik6IHZvaWQge1xuXHRcdHRoaXMub3BhY2l0eSA9IG9wYWNpdHk7XG5cdH1cblxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRHJhd0xheWVyIGV4dGVuZHMgQ2FudmFzRWxlbWVudCB7XG5cbiAgICBwcm90ZWN0ZWQgcHJlcGFyZUN0eChjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFRyYW5zZm9ybSk6IHZvaWQge1xuXHRcdGN0eC50cmFuc2xhdGUoKHRyYW5zZm9ybS54IC0gdmlldy54KSAqIHZpZXcuem9vbVgsICh0cmFuc2Zvcm0ueSAtIHZpZXcueSkgKiB2aWV3Lnpvb21ZKTtcblx0XHRjdHguc2NhbGUodHJhbnNmb3JtLnpvb21YICogdmlldy56b29tWCwgdHJhbnNmb3JtLnpvb21ZICogdmlldy56b29tWSk7XG5cdFx0Y3R4LnJvdGF0ZSh0cmFuc2Zvcm0ucm90YXRpb24pO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBjbGVhbkN0eChjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFRyYW5zZm9ybSk6IHZvaWQge1x0XG5cdFx0Y3R4LnJvdGF0ZSgtdHJhbnNmb3JtLnJvdGF0aW9uKTtcblx0XHRjdHguc2NhbGUoMS90cmFuc2Zvcm0uem9vbVgvdmlldy56b29tWCwgMS90cmFuc2Zvcm0uem9vbVkvdmlldy56b29tWSk7XG5cdFx0Y3R4LnRyYW5zbGF0ZSgtKHRyYW5zZm9ybS54IC12aWV3LngpICp2aWV3Lnpvb21YLCAtKHRyYW5zZm9ybS55IC0gdmlldy55KSAqIHZpZXcuem9vbVkpO1xuICAgIH1cblxufSIsImltcG9ydCB7IENvbnRhaW5lckxheWVyIH0gZnJvbSBcIi4vY29udGFpbmVybGF5ZXJcIjtcbmltcG9ydCB7IFN0YXRpY0ltYWdlLCBSZWN0TGF5ZXIgfSBmcm9tIFwiLi9zdGF0aWNcIjtcbmltcG9ydCB7IFRyYW5zZm9ybSAsIEJhc2ljVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgQ2FudmFzVmlldywgRGlzcGxheUVsZW1lbnQgfSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW1hZ2VTdHJ1Y3QgZXh0ZW5kcyBUcmFuc2Zvcm0ge1xuXHRvcGFjaXR5OiBudW1iZXI7XG5cdHZpc2libGU6IGJvb2xlYW47XG5cdHNyYzogc3RyaW5nO1xuXHRuYW1lOiBzdHJpbmc7XG5cdGRlc2NyaXB0aW9uOiBzdHJpbmc7XG5cdGRhdGU6IG51bWJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRhdGVGaWx0ZXIoXG4gIGltYWdlU3RydWN0OiBBcnJheTxJbWFnZVN0cnVjdD4sIFxuICBmcm9tOiBudW1iZXIsXG4gIHRvOiBudW1iZXIpOiBBcnJheTxJbWFnZVN0cnVjdD57XG5cdHJldHVybiBpbWFnZVN0cnVjdC5maWx0ZXIoZnVuY3Rpb24oaW1hZ2VTdHJ1Y3QpeyBcblx0XHRpZiAoaW1hZ2VTdHJ1Y3QuZGF0ZSA9PSB1bmRlZmluZWQpXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0aWYgKGltYWdlU3RydWN0LmRhdGUgPj0gZnJvbSAmJiBpbWFnZVN0cnVjdC5kYXRlIDw9IHRvKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlfVxuXHRcdH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGF0ZWxlc3NGaWx0ZXIoXG4gIGltYWdlU3RydWN0OiBBcnJheTxJbWFnZVN0cnVjdD4pOiBBcnJheTxJbWFnZVN0cnVjdD57XG5cdHJldHVybiBpbWFnZVN0cnVjdC5maWx0ZXIoZnVuY3Rpb24oaW1hZ2VTdHJ1Y3QpeyBcblx0XHRpZiAoaW1hZ2VTdHJ1Y3QuZGF0ZSA9PSB1bmRlZmluZWQpXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZX1cblx0XHR9KTtcbn1cblxuZXhwb3J0IGNsYXNzIExheWVyTWFuYWdlciB7XG5cblx0cHJpdmF0ZSBsYXllck1hcDogTWFwPHN0cmluZywgQ29udGFpbmVyTGF5ZXI+OztcblxuXHRyZWFkb25seSBkZWZhdWx0TGF5ZXI6IHN0cmluZyA9IFwiZGVmYXVsdFwiO1xuXG5cdGNvbnN0cnVjdG9yKCl7XG5cdFx0dGhpcy5sYXllck1hcCA9IG5ldyBNYXA8c3RyaW5nLCBDb250YWluZXJMYXllcj4oKTtcblxuXHRcdGxldCBpbWFnZUxheWVyID0gbmV3IENvbnRhaW5lckxheWVyKEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0pO1x0XG5cblx0XHR0aGlzLmxheWVyTWFwLnNldCh0aGlzLmRlZmF1bHRMYXllciwgaW1hZ2VMYXllcik7XG5cdH1cblxuXHRhZGRJbWFnZShpbWFnZTogU3RhdGljSW1hZ2UsIG5hbWU6IHN0cmluZyl7XG5cdFx0dGhpcy5sYXllck1hcC5nZXQodGhpcy5kZWZhdWx0TGF5ZXIpLnNldChuYW1lLCBpbWFnZSk7XG5cdH1cblxuXHRhZGRJbWFnZXMoXG5cdCAgaW1hZ2VEZXRhaWxzOiBBcnJheTxJbWFnZVN0cnVjdD4sIFxuXHQgIGxheWVyTmFtZTogc3RyaW5nLCBcblx0ICBsYXllclRyYW5zZm9ybTogVHJhbnNmb3JtID0gQmFzaWNUcmFuc2Zvcm0udW5pdFRyYW5zZm9ybVxuXHQpOiBDb250YWluZXJMYXllciB7XG5cblx0XHRsZXQgaW1hZ2VMYXllciA9IG5ldyBDb250YWluZXJMYXllcihsYXllclRyYW5zZm9ybSwgMSwgdHJ1ZSk7XHRcblxuXHRcdGZvciAodmFyIGltYWdlIG9mIGltYWdlRGV0YWlscyl7XG5cdFx0XHRsZXQgc3RhdGljSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoaW1hZ2UsIGltYWdlLnNyYywgXG5cdFx0XHRcdGltYWdlLm9wYWNpdHksIGltYWdlLnZpc2libGUsIGltYWdlLmRlc2NyaXB0aW9uKTtcblx0XHRcdGltYWdlTGF5ZXIuc2V0KGltYWdlLm5hbWUsIHN0YXRpY0ltYWdlKTtcblx0XHR9XG5cblx0XHR0aGlzLmxheWVyTWFwLnNldChsYXllck5hbWUsIGltYWdlTGF5ZXIpO1xuXG5cdFx0cmV0dXJuIGltYWdlTGF5ZXI7XG5cdH1cblxuXHRnZXRMYXllcnMoKTogTWFwPHN0cmluZywgQ29udGFpbmVyTGF5ZXI+IHtcblx0XHRyZXR1cm4gdGhpcy5sYXllck1hcDtcblx0fVxuXG5cdGdldExheWVyKG5hbWU6IHN0cmluZyk6IENvbnRhaW5lckxheWVyIHtcblx0XHRyZXR1cm4gdGhpcy5sYXllck1hcC5nZXQobmFtZSk7XG5cdH1cblxufVxuXG5leHBvcnQgY2xhc3MgQ29udGFpbmVyTGF5ZXJNYW5hZ2VyIHtcblxuXHRwcml2YXRlIGNvbnRhaW5lckxheWVyOiBDb250YWluZXJMYXllcjtcblx0cHJpdmF0ZSBzZWxlY3RlZDogc3RyaW5nO1xuXHRcblx0Y29uc3RydWN0b3IoY29udGFpbmVyTGF5ZXI6IENvbnRhaW5lckxheWVyLCBcblx0ICByZWFkb25seSBkaXNwbGF5TGF5ZXI6IENvbnRhaW5lckxheWVyID0gY29udGFpbmVyTGF5ZXIpIHtcblx0XHR0aGlzLmNvbnRhaW5lckxheWVyID0gY29udGFpbmVyTGF5ZXI7XG5cdH1cblxuXHRzZXRMYXllckNvbnRhaW5lcihjb250YWluZXJMYXllcjogQ29udGFpbmVyTGF5ZXIpIHtcblx0XHR0aGlzLmNvbnRhaW5lckxheWVyID0gY29udGFpbmVyTGF5ZXI7XG5cdH1cblxuXHRzZXRTZWxlY3RlZChuYW1lOiBzdHJpbmcpOiBSZWN0TGF5ZXIge1xuXHRcdHRoaXMuc2VsZWN0ZWQgPSBuYW1lO1xuXG5cdFx0bGV0IGxheWVyOiBDYW52YXNMYXllciA9IHRoaXMuY29udGFpbmVyTGF5ZXIuZ2V0KHRoaXMuc2VsZWN0ZWQpO1xuXG5cdFx0bGV0IGxheWVyUmVjdCA9IG5ldyBSZWN0TGF5ZXIobGF5ZXIuZ2V0RGltZW5zaW9uKCksIDEsIHRydWUpO1xuXG5cdFx0bGV0IGxheWVyTmFtZSA9IFwib3V0bGluZVwiO1xuXG5cdFx0dGhpcy5kaXNwbGF5TGF5ZXIuc2V0KGxheWVyTmFtZSwgbGF5ZXJSZWN0KTtcblxuXHRcdHJldHVybiBsYXllclJlY3Q7XG5cdH1cblxuXHR0b2dnbGVWaXNpYmlsaXR5KHNlbGVjdGVkOiBib29sZWFuID0gdHJ1ZSl7XG5cdFx0bGV0IHRvZ2dsZUdyb3VwOiBBcnJheTxEaXNwbGF5RWxlbWVudD4gPSBbXTtcblx0XHRpZiAoc2VsZWN0ZWQpe1xuXHRcdFx0aWYgKHRoaXMuc2VsZWN0ZWQgIT0gXCJcIil7XG5cdFx0XHRcdHRvZ2dsZUdyb3VwLnB1c2godGhpcy5jb250YWluZXJMYXllci5nZXQodGhpcy5zZWxlY3RlZCkpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRmb3IgKGxldCBwYWlyIG9mIHRoaXMuY29udGFpbmVyTGF5ZXIubGF5ZXJNYXApe1xuXG5cdFx0XHRcdGlmIChwYWlyWzBdICE9IHRoaXMuc2VsZWN0ZWQpe1xuXHRcdFx0XHRcdHRvZ2dsZUdyb3VwLnB1c2gocGFpclsxXSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJsYXllck5hbWU6IFwiICsgdGhpcy5zZWxlY3RlZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRmb3IgKGxldCBlbGVtZW50IG9mIHRvZ2dsZUdyb3VwKXtcblx0XHRcdGVsZW1lbnQuc2V0VmlzaWJsZSghZWxlbWVudC5pc1Zpc2libGUoKSlcblx0XHR9XG5cdH1cblxufSIsImltcG9ydCB7IERpc3BsYXlFbGVtZW50IH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgVHJhbnNmb3JtLCBcblx0QmFzaWNUcmFuc2Zvcm0sIFxuXHRWaWV3VHJhbnNmb3JtLCBcblx0Y29tYmluZVRyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IERpbWVuc2lvbiB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcbmltcG9ydCB7IENhbnZhc0VsZW1lbnQgfSBmcm9tIFwiLi9sYXllclwiO1xuXG5leHBvcnQgY2xhc3MgRGlzcGxheVJhbmdlIHtcblxuICAgIHN0YXRpYyByZWFkb25seSBBbGxSYW5nZSA9IG5ldyBEaXNwbGF5UmFuZ2UoLTEsIC0xKTtcblxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgbWluWm9vbTogbnVtYmVyLCBwdWJsaWMgbWF4Wm9vbTogbnVtYmVyKXt9XG5cblx0d2l0aGluUmFuZ2Uoem9vbTogbnVtYmVyKTogQm9vbGVhbiB7XG5cdFx0cmV0dXJuICgoem9vbSA+PSB0aGlzLm1pblpvb20gfHwgdGhpcy5taW5ab29tID09IC0xKSAmJiBcblx0XHRcdCh6b29tIDw9IHRoaXMubWF4Wm9vbSB8fCB0aGlzLm1heFpvb20gPT0gLTEpKTtcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgTXVsdGlSZXNMYXllciBleHRlbmRzIENhbnZhc0VsZW1lbnQge1xuXG5cdGxheWVyTWFwID0gbmV3IE1hcDxEaXNwbGF5UmFuZ2UsIENhbnZhc0VsZW1lbnQ+KCk7XG5cblx0c2V0KGRpc3BsYXlSYW5nZTogRGlzcGxheVJhbmdlLCBsYXllcjogQ2FudmFzRWxlbWVudCl7XG5cdFx0dGhpcy5sYXllck1hcC5zZXQoZGlzcGxheVJhbmdlLCBsYXllcik7XG5cdH1cblx0XG5cdGRyYXcoXG5cdCAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIFxuXHQgIHBhcmVudFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0ICB2aWV3OiBWaWV3VHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0XHRsZXQgbGF5ZXJUcmFuc2Zvcm0gPSBjb21iaW5lVHJhbnNmb3JtKHRoaXMubG9jYWxUcmFuc2Zvcm0sIHBhcmVudFRyYW5zZm9ybSk7XG5cblx0XHR2YXIgZHJhd2luZ0NvbXBsZXRlID0gdHJ1ZTtcblxuXHRcdGZvciAobGV0IFtyYW5nZSwgbGF5ZXJdIG9mIHRoaXMubGF5ZXJNYXApe1xuXHRcdFx0aWYgKHJhbmdlLndpdGhpblJhbmdlKHZpZXcuem9vbVgpICYmIGxheWVyLmlzVmlzaWJsZSgpKXtcblx0XHRcdFx0ZHJhd2luZ0NvbXBsZXRlID0gZHJhd2luZ0NvbXBsZXRlICYmIGxheWVyLmRyYXcoY3R4LCBsYXllclRyYW5zZm9ybSwgdmlldyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRyYXdpbmdDb21wbGV0ZTtcblx0fVxuXG5cdGdldERpbWVuc2lvbigpOiBEaW1lbnNpb24ge1xuXHRcdHZhciB4TWluID0gdGhpcy54O1xuXHRcdHZhciB5TWluID0gdGhpcy55O1xuXHRcdHZhciB4TWF4ID0gdGhpcy54O1xuXHRcdHZhciB5TWF4ID0gdGhpcy55O1xuXG5cdFx0Zm9yIChsZXQgW3JhbmdlLCBsYXllcl0gb2YgdGhpcy5sYXllck1hcCl7XG5cdFx0XHRsZXQgbGF5ZXJEaW1lbnNpb24gPSBsYXllci5nZXREaW1lbnNpb24oKTtcblx0XHRcdHhNaW4gPSBNYXRoLm1pbih4TWluLCB0aGlzLnggKyBsYXllckRpbWVuc2lvbi54KTtcblx0XHRcdHlNaW4gPSBNYXRoLm1pbih5TWluLCB0aGlzLnkgKyBsYXllckRpbWVuc2lvbi55KTtcblx0XHRcdHhNYXggPSBNYXRoLm1heCh4TWF4LCB0aGlzLnggKyBsYXllckRpbWVuc2lvbi54ICsgdGhpcy56b29tWCAqIGxheWVyRGltZW5zaW9uLncpO1xuXHRcdFx0eU1heCA9IE1hdGgubWF4KHlNYXgsIHRoaXMueSArIGxheWVyRGltZW5zaW9uLnkgKyB0aGlzLnpvb21ZICogbGF5ZXJEaW1lbnNpb24uaCk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBuZXcgRGltZW5zaW9uKHhNaW4sIHlNaW4sIHhNYXggLSB4TWluLCB5TWF4IC0geU1pbik7XG5cdH1cbn0iLCJpbXBvcnQgeyBUcmFuc2Zvcm0sIEJhc2ljVHJhbnNmb3JtLCBjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgRHJhd0xheWVyIH0gZnJvbSBcIi4vbGF5ZXJcIjtcbmltcG9ydCB7IERpc3BsYXlFbGVtZW50IH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgRGltZW5zaW9uLCByb3RhdGUsIFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBhcnJheVRvUG9pbnRzKHBvaW50QXJyYXk6IEFycmF5PEFycmF5PG51bWJlcj4+KTogQXJyYXk8UG9pbnQyRD4ge1xuXHRsZXQgcG9pbnRzOiBBcnJheTxQb2ludDJEPiA9IFtdO1xuXHRmb3IgKGxldCBhcnJheVBvaW50IG9mIHBvaW50QXJyYXkpe1xuXHRcdGxldCBwb2ludCA9IG5ldyBQb2ludDJEKGFycmF5UG9pbnRbMF0sIGFycmF5UG9pbnRbMV0pO1xuXHRcdHBvaW50cy5wdXNoKHBvaW50KTtcblx0fVxuXHRyZXR1cm4gcG9pbnRzO1xufVxuXG5leHBvcnQgY2xhc3MgU2hhcGUgZXh0ZW5kcyBEcmF3TGF5ZXIgIHtcblxuXHRwdWJsaWMgZmlsbDogYm9vbGVhbjtcblx0cHVibGljIHBvaW50czogQXJyYXk8UG9pbnQyRD47XG5cblx0Y29uc3RydWN0b3IoXG5cdCAgbG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdCAgb3BhY2l0eTogbnVtYmVyLFxuXHQgIHZpc2libGU6IGJvb2xlYW4sXG5cdCAgbmFtZTogc3RyaW5nLCBcblx0ICBkZXNjcmlwdGlvbjogc3RyaW5nLFxuXHQpIHtcblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybSwgb3BhY2l0eSwgdmlzaWJsZSwgbmFtZSwgZGVzY3JpcHRpb24pO1xuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHQgIHZpZXc6IFRyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdCAgXHRsZXQgY3R4VHJhbnNmb3JtID0gY29tYmluZVRyYW5zZm9ybSh0aGlzLCBwYXJlbnRUcmFuc2Zvcm0pO1xuXG5cdFx0dGhpcy5wcmVwYXJlQ3R4KGN0eCwgY3R4VHJhbnNmb3JtLCB2aWV3KTtcblxuXHRcdGlmICh0aGlzLnZpc2libGUpIHtcblx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdGxldCBzdGFydCA9IHRoaXMucG9pbnRzWzBdO1xuXHRcdFx0Y3R4Lm1vdmVUbyhzdGFydC54LCBzdGFydC55KTtcblx0XHRcdGZvciAobGV0IHBvaW50IG9mIHRoaXMucG9pbnRzKXtcblx0XHRcdFx0Y3R4LmxpbmVUbyhwb2ludC54LCBwb2ludC55KTtcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLmZpbGwpIHtcblx0XHRcdFx0Y3R4LmZpbGwoKTtcblx0XHRcdH1cblx0XHRcdGN0eC5zdHJva2UoKTtcblx0XHR9XG5cblx0XHR0aGlzLmNsZWFuQ3R4KGN0eCwgY3R4VHJhbnNmb3JtLCB2aWV3KTtcblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0Z2V0RGltZW5zaW9uKCk6IERpbWVuc2lvbiB7XG5cdFx0cmV0dXJuIG5ldyBEaW1lbnNpb24oMCwgMCwgMCwgMCk7XG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIFBvaW50IGV4dGVuZHMgRHJhd0xheWVyIGltcGxlbWVudHMgRGlzcGxheUVsZW1lbnQge1xuXG5cdGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTpudW1iZXIsIHB1YmxpYyByYWRpdXM6IG51bWJlciwgXG5cdFx0b3BhY2l0eTogbnVtYmVyLFxuXHRcdHZpc2libGU6IGJvb2xlYW4pIHtcblxuXHRcdHN1cGVyKG5ldyBCYXNpY1RyYW5zZm9ybSh4LCB5LCAxLCAxLCAwKSwgXG5cdFx0XHRvcGFjaXR5LCB2aXNpYmxlLCBcInBvaW50XCIpO1xuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHRcdHZpZXc6IFRyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0bGV0IHggPSAodGhpcy54ICsgcGFyZW50VHJhbnNmb3JtLnggLSB2aWV3LngpICogdmlldy56b29tWDtcblx0XHRsZXQgeSA9ICh0aGlzLnkgKyBwYXJlbnRUcmFuc2Zvcm0ueSAtIHZpZXcueSkgKiB2aWV3Lnpvb21ZO1xuXG5cdFx0bGV0IHdpZHRoID0gdGhpcy5yYWRpdXMgKiB2aWV3Lnpvb21YO1xuXHRcdGxldCBoZWlnaHQgPSB0aGlzLnJhZGl1cyAqIHZpZXcuem9vbVk7XG5cblx0XHRjdHguc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuXHRcdGN0eC5maWxsU3R5bGUgPSBcInJlZFwiO1xuXHRcdFxuXHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRjdHgubW92ZVRvKHgsIHkpO1xuXHRcdGN0eC5hcmMoeCwgeSwgd2lkdGgsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XG5cdFx0Y3R4LmZpbGwoKTtcblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0Z2V0RGltZW5zaW9uKCk6IERpbWVuc2lvbiB7XG5cdFx0cmV0dXJuIG5ldyBEaW1lbnNpb24odGhpcy54LCB0aGlzLnksIHRoaXMucmFkaXVzLCB0aGlzLnJhZGl1cyk7XG5cdH1cblxuXHRpbnNpZGUoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBib29sZWFuIHtcblx0XHRsZXQgeGRpZmYgPSB0aGlzLnggLSB4O1xuXHRcdGxldCB5ZGlmZiA9IHRoaXMueSAtIHk7XG5cblx0XHRsZXQgZGlzdGFuY2UgPSBNYXRoLnNxcnQoeGRpZmYgKiB4ZGlmZiArIHlkaWZmICogeWRpZmYpO1xuXHRcdFxuXHRcdHJldHVybiBkaXN0YW5jZSA8IHRoaXMucmFkaXVzO1xuXHR9XG5cbn1cbiIsImltcG9ydCB7IFRyYW5zZm9ybSwgQmFzaWNUcmFuc2Zvcm0sIGNvbWJpbmVUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBEcmF3TGF5ZXIsIENhbnZhc0VsZW1lbnQgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgRGlzcGxheUVsZW1lbnQgfSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5pbXBvcnQgeyBEaW1lbnNpb24sIHJvdGF0ZSwgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuZXhwb3J0IGludGVyZmFjZSBUaHVtYiBleHRlbmRzIERpc3BsYXlFbGVtZW50IHtcblxuXHRkcmF3VGh1bWIoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHc6IG51bWJlciwgaDogbnVtYmVyKTogYm9vbGVhbjtcblxufVxuXG5leHBvcnQgY2xhc3MgU3RhdGljSW1hZ2UgZXh0ZW5kcyBEcmF3TGF5ZXIgaW1wbGVtZW50cyBUaHVtYiB7XG5cblx0cHJpdmF0ZSBpbWc6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cblx0Y29uc3RydWN0b3IoXG5cdCAgbG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdCAgaW1hZ2VTcmM6IHN0cmluZywgXG5cdCAgb3BhY2l0eTogbnVtYmVyLFxuXHQgIHZpc2libGU6IGJvb2xlYW4sXG5cdCAgZGVzY3JpcHRpb246IHN0cmluZyxcblx0KSB7XG5cblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybSwgb3BhY2l0eSwgdmlzaWJsZSwgaW1hZ2VTcmMsIGRlc2NyaXB0aW9uKTtcblx0XHRcblx0XHR0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuXHRcdHRoaXMuaW1nLnNyYyA9IGltYWdlU3JjO1xuXHR9XG5cblx0cHJpdmF0ZSBkcmF3SW1hZ2UoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHBhcmVudFRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBUcmFuc2Zvcm0pe1xuXG5cdFx0aWYgKHRoaXMuaXNWaXNpYmxlKCkpe1xuXHRcdFx0bGV0IGN0eFRyYW5zZm9ybSA9IGNvbWJpbmVUcmFuc2Zvcm0odGhpcywgcGFyZW50VHJhbnNmb3JtKTtcblxuXHRcdFx0dGhpcy5wcmVwYXJlQ3R4KGN0eCwgY3R4VHJhbnNmb3JtLCB2aWV3KTtcblx0XHRcdFxuXHRcdFx0Y3R4Lmdsb2JhbEFscGhhID0gdGhpcy5vcGFjaXR5O1xuXHRcdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZywgMCwgMCk7XG5cdFx0XHRjdHguZ2xvYmFsQWxwaGEgPSAxO1xuXG5cdFx0XHR0aGlzLmNsZWFuQ3R4KGN0eCwgY3R4VHJhbnNmb3JtLCB2aWV3KTtcblx0XHR9XG5cdFx0XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdCAgdmlldzogVHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0XHRpZiAodGhpcy52aXNpYmxlICYmIHRoaXMuaW1nLmNvbXBsZXRlKSB7XG5cdFx0XHR0aGlzLmRyYXdJbWFnZShjdHgsIHBhcmVudFRyYW5zZm9ybSwgdmlldyk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIXRoaXMuaW1nLmNvbXBsZXRlKXtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRkcmF3VGh1bWIoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHc6IG51bWJlciwgaDogbnVtYmVyKTogYm9vbGVhbiB7XG5cdFx0XG5cdFx0aWYgKHRoaXMudmlzaWJsZSAmJiB0aGlzLmltZy5jb21wbGV0ZSkge1xuXHRcdFx0bGV0IHNjYWxlWCA9IHcgLyB0aGlzLmltZy53aWR0aDtcblx0XHRcdGxldCBzY2FsZVkgPSBoIC8gdGhpcy5pbWcuaGVpZ2h0O1xuXHRcdFx0bGV0IHNjYWxlID0gTWF0aC5taW4oc2NhbGVYLCBzY2FsZVkpO1xuXHRcdFx0Y3R4LnNjYWxlKHNjYWxlLCBzY2FsZSk7XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwic2NhbGV4IFwiICsgKHRoaXMuaW1nLndpZHRoICogc2NhbGUpKTtcblx0XHRcdC8vY29uc29sZS5sb2coXCJzY2FsZXkgXCIgKyAodGhpcy5pbWcuaGVpZ2h0ICogc2NhbGUpKTtcblx0XHRcdC8vY29uc29sZS5sb2coXCJ4eSBcIiArIHRoaXMuaW1nLnggKyBcIiwgXCIgKyB0aGlzLmltZy55KTtcblx0XHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDApO1xuXHRcdFx0Y3R4LnNjYWxlKDEvc2NhbGUsIDEvc2NhbGUpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCF0aGlzLmltZy5jb21wbGV0ZSl7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0Z2V0RGltZW5zaW9uKCk6IERpbWVuc2lvbiB7XG5cdFx0XG5cdFx0aWYgKHRoaXMuaW1nLmNvbXBsZXRlKXtcblx0XHRcdHZhciB3aWR0aCA9IHRoaXMuaW1nLndpZHRoICogdGhpcy56b29tWDtcblx0XHRcdHZhciBoZWlnaHQgPSB0aGlzLmltZy5oZWlnaHQgKiB0aGlzLnpvb21ZO1xuXG5cdFx0XHRsZXQgcDEgPSByb3RhdGUobmV3IFBvaW50MkQod2lkdGgsIDApLCB0aGlzLnJvdGF0aW9uKTtcblx0XHRcdGxldCBwMiA9IHJvdGF0ZShuZXcgUG9pbnQyRCh3aWR0aCwgLWhlaWdodCksIHRoaXMucm90YXRpb24pO1xuXHRcdFx0bGV0IHAzID0gcm90YXRlKG5ldyBQb2ludDJEKDAsIC1oZWlnaHQpLCB0aGlzLnJvdGF0aW9uKTtcblxuXHRcdFx0bGV0IG1pblggPSBNYXRoLm1pbigwLCBwMS54LCBwMi54LCBwMy54KTtcblx0XHRcdGxldCBtaW5ZID0gTWF0aC5taW4oMCwgcDEueSwgcDIueSwgcDMueSk7XG5cdFx0XHRsZXQgbWF4WCA9IE1hdGgubWF4KDAsIHAxLngsIHAyLngsIHAzLngpO1xuXHRcdFx0bGV0IG1heFkgPSBNYXRoLm1heCgwLCBwMS55LCBwMi55LCBwMy55KTtcblxuXHRcdFx0cmV0dXJuIG5ldyBEaW1lbnNpb24odGhpcy54ICsgbWluWCwgdGhpcy55IC0gbWF4WSwgbWF4WC1taW5YLCBtYXhZLW1pblkpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgRGltZW5zaW9uKHRoaXMueCwgdGhpcy55LCAwLCAwKTtcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgUmVjdExheWVyIGV4dGVuZHMgRHJhd0xheWVyIGltcGxlbWVudHMgRGlzcGxheUVsZW1lbnQge1xuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgZGltZW5zaW9uOiBEaW1lbnNpb24sIFxuXHRcdG9wYWNpdHk6IG51bWJlcixcblx0XHR2aXNpYmxlOiBib29sZWFuKSB7XG5cblx0XHRzdXBlcihuZXcgQmFzaWNUcmFuc2Zvcm0oZGltZW5zaW9uLngsIGRpbWVuc2lvbi55LCAxLCAxLCAwKSwgXG5cdFx0XHRvcGFjaXR5LCB2aXNpYmxlLCBcInJlY3RcIik7XG5cdH1cblxuXHR1cGRhdGVEaW1lbnNpb24oZGltZW5zaW9uOiBEaW1lbnNpb24pOiB2b2lkIHtcblx0XHR0aGlzLmRpbWVuc2lvbiA9IGRpbWVuc2lvbjtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHBhcmVudFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHR2aWV3OiBUcmFuc2Zvcm0pOiBib29sZWFuIHtcblxuXHRcdGxldCB4ID0gKHRoaXMuZGltZW5zaW9uLnggKyBwYXJlbnRUcmFuc2Zvcm0ueCAtIHZpZXcueCkgKiB2aWV3Lnpvb21YO1xuXHRcdGxldCB5ID0gKHRoaXMuZGltZW5zaW9uLnkgKyBwYXJlbnRUcmFuc2Zvcm0ueSAtIHZpZXcueSkgKiB2aWV3Lnpvb21ZO1xuXG5cdFx0Y3R4LnN0cm9rZVN0eWxlID0gXCJyZWRcIjtcblx0XHRjdHguc3Ryb2tlUmVjdCh4LCB5LCB0aGlzLmRpbWVuc2lvbi53ICogdmlldy56b29tWCwgdGhpcy5kaW1lbnNpb24uaCAqIHZpZXcuem9vbVkpO1xuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHRyZXR1cm4gdGhpcy5kaW1lbnNpb247XG5cdH1cblxufSIsImltcG9ydCB7IERyYXdMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBUcmFuc2Zvcm0sIEJhc2ljVHJhbnNmb3JtLCBWaWV3VHJhbnNmb3JtLCBjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgRGltZW5zaW9uIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgY2xhc3MgVGlsZVN0cnVjdCB7XG5cdFxuXHRjb25zdHJ1Y3Rvcihcblx0XHRwdWJsaWMgcHJlZml4OiBzdHJpbmcsXG5cdFx0cHVibGljIHN1ZmZpeDogc3RyaW5nLFxuXHRcdHB1YmxpYyB0aWxlRGlyZWN0b3J5OiBzdHJpbmcpe31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHpvb21CeUxldmVsKHpvb21MZXZlbDogbnVtYmVyKXtcblx0cmV0dXJuIE1hdGgucG93KDIsIHpvb21MZXZlbCk7XG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlTGF5ZXIgZXh0ZW5kcyBEcmF3TGF5ZXIge1xuXG5cdHRpbGVNYW5hZ2VyOiBUaWxlTWFuYWdlcjtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHRyZWFkb25seSB0aWxlU3RydWN0OiBUaWxlU3RydWN0LFxuXHRcdHZpc2JpbGU6IGJvb2xlYW4sXG5cdFx0bmFtZTogc3RyaW5nID0gXCJ0aWxlc1wiLFxuXHRcdHB1YmxpYyB4T2Zmc2V0OiBudW1iZXIgPSAwLFxuXHRcdHB1YmxpYyB5T2Zmc2V0OiBudW1iZXIgPSAwLFxuXHRcdHB1YmxpYyB6b29tOiBudW1iZXIgPSAxLFxuXHRcdHJlYWRvbmx5IGdyaWRXaWR0aDogbnVtYmVyID0gMjU2LCBcblx0XHRyZWFkb25seSBncmlkSGVpZ2h0OiBudW1iZXIgPSAyNTYsXG5cdFx0b3BhY2l0eTogbnVtYmVyID0gMSl7XG5cblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybSwgb3BhY2l0eSwgdmlzYmlsZSwgbmFtZSk7XG5cblx0XHR0aGlzLnRpbGVNYW5hZ2VyID0gbmV3IFRpbGVNYW5hZ2VyKCk7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0aWYgKHRoaXMuaXNWaXNpYmxlKCkpe1xuXG5cdFx0XHRsZXQgY3R4VHJhbnNmb3JtID0gY29tYmluZVRyYW5zZm9ybSh0aGlzLCBwYXJlbnRUcmFuc2Zvcm0pO1xuXG5cdFx0XHRsZXQgem9vbVdpZHRoOiBudW1iZXIgPSB0aGlzLmdyaWRXaWR0aCAqIGN0eFRyYW5zZm9ybS56b29tWFxuXHRcdFx0bGV0IHpvb21IZWlnaHQ6IG51bWJlciA9IHRoaXMuZ3JpZEhlaWdodCAqIGN0eFRyYW5zZm9ybS56b29tWTtcblxuXHRcdFx0bGV0IHRyYW5zZm9ybVggPSB2aWV3LnggKyBjdHhUcmFuc2Zvcm0ueDtcblx0XHRcdGxldCB0cmFuc2Zvcm1ZID0gdmlldy55ICsgY3R4VHJhbnNmb3JtLnk7XG5cblx0XHRcdGxldCB2aWV3WCA9IHZpZXcueCAqIHZpZXcuem9vbVg7XG5cdFx0XHRsZXQgdmlld1kgPSB2aWV3LnkgKiB2aWV3Lnpvb21ZO1xuXG5cdFx0XHRsZXQgdmlld1dpZHRoID0gdmlldy53aWR0aCAvIHZpZXcuem9vbVg7XG5cdFx0XHRsZXQgdmlld0hlaWdodCA9IHZpZXcuaGVpZ2h0IC8gdmlldy56b29tWTtcblxuXHRcdFx0bGV0IGdyaWRBY3Jvc3MgPSB2aWV3V2lkdGggLyB6b29tV2lkdGg7XG5cdFx0XHRsZXQgZ3JpZEhpZ2ggPSB2aWV3SGVpZ2h0IC8gem9vbUhlaWdodDtcblxuXHRcdFx0bGV0IHhNaW4gPSBNYXRoLmZsb29yKHRyYW5zZm9ybVggLyB6b29tV2lkdGgpO1xuXHRcdFx0bGV0IHhNYXggPSBNYXRoLmNlaWwoKHRyYW5zZm9ybVggKyB2aWV3V2lkdGgpIC8gem9vbVdpZHRoKTtcblxuXHRcdFx0bGV0IHlNaW4gPSBNYXRoLmZsb29yKHRyYW5zZm9ybVkgLyB6b29tSGVpZ2h0KTtcblx0XHRcdGxldCB5TWF4ID0gTWF0aC5jZWlsKCh0cmFuc2Zvcm1ZICsgdmlld0hlaWdodCkgLyB6b29tSGVpZ2h0KTtcblxuXHRcdFx0dmFyIGRyYXdpbmdDb21wbGV0ZSA9IHRydWU7XG5cblx0XHRcdGxldCBmdWxsWm9vbVggPSBjdHhUcmFuc2Zvcm0uem9vbVggKiB2aWV3Lnpvb21YO1xuXHRcdFx0bGV0IGZ1bGxab29tWSA9IGN0eFRyYW5zZm9ybS56b29tWSAqIHZpZXcuem9vbVk7XG5cblx0XHRcdGN0eC5zY2FsZShmdWxsWm9vbVgsIGZ1bGxab29tWSk7XG5cblx0XHRcdGZvciAodmFyIHggPSB4TWluOyB4PHhNYXg7IHgrKyl7XG5cdFx0XHRcdGxldCB4TW92ZSA9IHggKiB0aGlzLmdyaWRXaWR0aCAtIHRyYW5zZm9ybVggLyBjdHhUcmFuc2Zvcm0uem9vbVg7XG5cdFx0XHRcdGZvciAodmFyIHkgPSB5TWluOyB5PHlNYXg7IHkrKyl7XG5cdFx0XHRcdFx0bGV0IHlNb3ZlID0geSAqIHRoaXMuZ3JpZEhlaWdodCAtIHRyYW5zZm9ybVkgLyBjdHhUcmFuc2Zvcm0uem9vbVk7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcInRpbGUgeCB5IFwiICsgeCArIFwiIFwiICsgeSArIFwiOiBcIiArIHhNb3ZlICsgXCIsIFwiICsgeU1vdmUpO1xuXG5cdFx0XHRcdFx0Y3R4LnRyYW5zbGF0ZSh4TW92ZSwgeU1vdmUpO1xuXHRcdFx0XHRcdGxldCB0aWxlU3JjID0gdGhpcy50aWxlU3RydWN0LnRpbGVEaXJlY3RvcnkgKyB0aGlzLnpvb20gKyBcIi9cIiArIFxuXHRcdFx0XHRcdFx0KHggKyB0aGlzLnhPZmZzZXQpICsgXCIvXCIgKyBcblx0XHRcdFx0XHRcdCh5ICsgdGhpcy55T2Zmc2V0KSArIHRoaXMudGlsZVN0cnVjdC5zdWZmaXg7XG5cblx0XHRcdFx0XHRpZiAodGhpcy50aWxlTWFuYWdlci5oYXModGlsZVNyYykpIHtcblx0XHRcdFx0XHRcdGxldCBpbWFnZVRpbGUgPSB0aGlzLnRpbGVNYW5hZ2VyLmdldCh0aWxlU3JjKTtcblx0XHRcdFx0XHRcdGRyYXdpbmdDb21wbGV0ZSA9IGRyYXdpbmdDb21wbGV0ZSAmJiBpbWFnZVRpbGUuZHJhdyhjdHgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdGxldCBpbWFnZVRpbGUgPSBuZXcgSW1hZ2VUaWxlKHgsIHksIHRpbGVTcmMpO1xuXG5cdFx0XHRcdFx0XHRkcmF3aW5nQ29tcGxldGUgPSBkcmF3aW5nQ29tcGxldGUgJiYgaW1hZ2VUaWxlLmRyYXcoY3R4KTtcblxuXHRcdFx0XHRcdFx0dGhpcy50aWxlTWFuYWdlci5zZXQodGlsZVNyYywgaW1hZ2VUaWxlKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjdHgudHJhbnNsYXRlKC14TW92ZSwgLXlNb3ZlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRjdHguc2NhbGUoMSAvIGZ1bGxab29tWCwgMSAvIGZ1bGxab29tWSk7XG5cblx0XHRcdC8vY29uc29sZS5sb2coXCJkcmV3IHRpbGVzIFwiICsgZHJhd2luZ0NvbXBsZXRlKTtcblx0XHRcdHJldHVybiBkcmF3aW5nQ29tcGxldGU7XG5cdFx0fSBlbHNlIHsgXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHRyZXR1cm4gbmV3IERpbWVuc2lvbigwLCAwLCAwLCAwKTtcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgVGlsZU1hbmFnZXIge1xuXG5cdHRpbGVNYXA6IE1hcDxzdHJpbmcsIEltYWdlVGlsZT47XG5cblx0Y29uc3RydWN0b3IoKXtcblx0XHR0aGlzLnRpbGVNYXAgPSBuZXcgTWFwPHN0cmluZywgSW1hZ2VUaWxlPigpO1xuXHR9XG5cblx0Z2V0KHRpbGVLZXk6IHN0cmluZyk6IEltYWdlVGlsZSB7XG5cdFx0cmV0dXJuIHRoaXMudGlsZU1hcC5nZXQodGlsZUtleSk7XG5cdH1cblxuXHRoYXModGlsZUtleTogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudGlsZU1hcC5oYXModGlsZUtleSk7XG5cdH1cblxuXHRzZXQodGlsZUtleTogc3RyaW5nLCB0aWxlOiBJbWFnZVRpbGUpe1xuXHRcdHRoaXMudGlsZU1hcC5zZXQodGlsZUtleSwgdGlsZSk7XG5cdH1cblxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VUaWxlIHtcblxuXHRwcml2YXRlIGltZzogSFRNTEltYWdlRWxlbWVudDtcblx0cHJpdmF0ZSBleGlzdHM6IGJvb2xlYW47XG5cblx0Y29uc3RydWN0b3IocmVhZG9ubHkgeEluZGV4OiBudW1iZXIsIHJlYWRvbmx5IHlJbmRleDogbnVtYmVyLCBpbWFnZVNyYzogc3RyaW5nKSB7XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0XHR0aGlzLmltZy5vbmVycm9yID0gZnVuY3Rpb24oZXZlbnRPck1lc3NhZ2U6IGFueSl7XG5cdFx0XHRldmVudE9yTWVzc2FnZS50YXJnZXQuc3JjID0gXCJcIjtcblx0XHR9O1xuXHR9O1xuXG5cdHByaXZhdGUgZHJhd0ltYWdlKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKXtcblx0XHRjdHguZHJhd0ltYWdlKHRoaXMuaW1nLCAwLCAwKTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpOiBib29sZWFuIHtcblx0XHRpZiAodGhpcy5pbWcuc3JjICE9IFwiXCIgJiYgdGhpcy5pbWcuY29tcGxldGUgKSB7XG5cdFx0XHR0aGlzLmRyYXdJbWFnZShjdHgpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fTtcblxufSIsIi8qKlxuKiBBIHdvcmxkIGlzIDAsMCBiYXNlZCBidXQgYW55IGVsZW1lbnQgY2FuIGJlIHBvc2l0aW9uZWQgcmVsYXRpdmUgdG8gdGhpcy5cbiovXG5leHBvcnQgaW50ZXJmYWNlIFRyYW5zZm9ybSB7XG5cdHg6IG51bWJlcjtcblx0eTogbnVtYmVyO1xuXHR6b29tWDogbnVtYmVyO1xuXHR6b29tWTogbnVtYmVyO1xuXHRyb3RhdGlvbjogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgQmFzaWNUcmFuc2Zvcm0gaW1wbGVtZW50cyBUcmFuc2Zvcm0ge1xuXG4gICAgc3RhdGljIHJlYWRvbmx5IHVuaXRUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgMSwgMSwgMCk7XG5cblx0Y29uc3RydWN0b3IocHVibGljIHg6IG51bWJlciwgcHVibGljIHk6IG51bWJlciwgXG5cdFx0cHVibGljIHpvb21YOiBudW1iZXIsIHB1YmxpYyB6b29tWTogbnVtYmVyLCBcblx0XHRwdWJsaWMgcm90YXRpb246IG51bWJlcil7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tYmluZVRyYW5zZm9ybShjaGlsZDogVHJhbnNmb3JtLCBjb250YWluZXI6IFRyYW5zZm9ybSk6IFRyYW5zZm9ybSB7XG5cdGxldCB6b29tWCA9IGNoaWxkLnpvb21YICogY29udGFpbmVyLnpvb21YO1xuXHQvL2NvbnNvbGUubG9nKFwibW9kaWZpZWQgXCIgKyBjaGlsZC56b29tWCArIFwiIHRvIFwiICsgem9vbVgpO1xuXHRsZXQgem9vbVkgPSBjaGlsZC56b29tWSAqIGNvbnRhaW5lci56b29tWTtcblx0Ly9jb25zb2xlLmxvZyhcIm1vZGlmaWVkIFwiICsgY2hpbGQuem9vbVkgKyBcIiBieSBcIiArIGNvbnRhaW5lci56b29tWSArIFwiIHRvIFwiICsgem9vbVkpO1xuXHRsZXQgeCA9IChjaGlsZC54ICogY29udGFpbmVyLnpvb21YKSArIGNvbnRhaW5lci54O1xuXHRsZXQgeSA9IChjaGlsZC55ICogY29udGFpbmVyLnpvb21ZKSArIGNvbnRhaW5lci55O1xuXHQvL2NvbnNvbGUubG9nKFwibW9kaWZpZWQgeCBcIiArIGNoaWxkLnggKyBcIiBieSBcIiArIGNvbnRhaW5lci56b29tWCArIFwiIGFuZCBcIiArIGNvbnRhaW5lci54ICsgXCIgdG8gXCIgKyB4KTtcblx0bGV0IHJvdGF0aW9uID0gY2hpbGQucm90YXRpb24gKyBjb250YWluZXIucm90YXRpb247XG5cdHJldHVybiBuZXcgQmFzaWNUcmFuc2Zvcm0oeCwgeSwgem9vbVgsIHpvb21ZLCByb3RhdGlvbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZSh0cmFuc2Zvcm06IFRyYW5zZm9ybSk6IFRyYW5zZm9ybSB7XG5cdHJldHVybiBuZXcgQmFzaWNUcmFuc2Zvcm0odHJhbnNmb3JtLngsIHRyYW5zZm9ybS55LCBcblx0XHR0cmFuc2Zvcm0uem9vbVgsIHRyYW5zZm9ybS56b29tWSwgdHJhbnNmb3JtLnJvdGF0aW9uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludmVydFRyYW5zZm9ybSh3b3JsZFN0YXRlOiBUcmFuc2Zvcm0pOiBUcmFuc2Zvcm0ge1xuXHRyZXR1cm4gbmV3IEJhc2ljVHJhbnNmb3JtKC13b3JsZFN0YXRlLngsIC13b3JsZFN0YXRlLnksIFxuXHRcdDEvd29ybGRTdGF0ZS56b29tWCwgMS93b3JsZFN0YXRlLnpvb21ZLCAtd29ybGRTdGF0ZS5yb3RhdGlvbik7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmlld1RyYW5zZm9ybSBleHRlbmRzIFRyYW5zZm9ybSB7XG5cdHdpZHRoOiBudW1iZXI7XG5cdGhlaWdodDogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgQmFzaWNWaWV3VHJhbnNmb3JtIGV4dGVuZHMgQmFzaWNUcmFuc2Zvcm0gaW1wbGVtZW50cyBWaWV3VHJhbnNmb3JtIHtcblxuXHRjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgXG5cdFx0cmVhZG9ubHkgd2lkdGg6IG51bWJlciwgcmVhZG9ubHkgaGVpZ2h0OiBudW1iZXIsXG5cdFx0em9vbVg6IG51bWJlciwgem9vbVk6IG51bWJlciwgXG5cdCAgICByb3RhdGlvbjogbnVtYmVyKXtcblxuXHRcdHN1cGVyKHgsIHksIHpvb21YLCB6b29tWSwgcm90YXRpb24pO1xuXHR9XG5cbn1cblxuXG5cbiIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1xuXHRcIm5hbWVcIjogXCIyLTJcIiwgXCJ4XCI6IC0zNjQsIFwieVwiOiAtMTIuNSwgXCJ6b29tWFwiOiAwLjIxMywgXCJ6b29tWVwiOiAwLjIwNSwgXCJyb3RhdGlvblwiOiAtMC4zMSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDAycl8yW1NWQzJdLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjNcIiwgXCJ4XCI6IC0yMTYsIFwieVwiOiAtMC43MDUsIFwiem9vbVhcIjogMC4yLCBcInpvb21ZXCI6IDAuMjEsIFwicm90YXRpb25cIjogLTAuNTEsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwM3JbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiNFwiLCBcInhcIjogLTc0LjI5LCBcInlcIjogLTk5Ljc4LCBcInpvb21YXCI6IDAuMjIyLCBcInpvb21ZXCI6IDAuMjA4LCBcInJvdGF0aW9uXCI6IC0wLjI4NSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA0cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI1XCIsIFwieFwiOiAtMzY2LjUsIFwieVwiOiAxODAuMDE5LCBcInpvb21YXCI6IDAuMjE1LCBcInpvb21ZXCI6IDAuMjA3LCBcInJvdGF0aW9uXCI6IC0wLjIxLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDVyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjZcIiwgXCJ4XCI6IC0yMDYuMTYsIFwieVwiOiAxNDYsIFwiem9vbVhcIjogMC4yMSwgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAtMC4yMTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwNnJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiN1wiLCBcInhcIjogLTYzLjMsIFwieVwiOiAxMDAuMzc3NiwgXCJ6b29tWFwiOiAwLjIxMjUsIFwiem9vbVlcIjogMC4yMTMsIFwicm90YXRpb25cIjogLTAuMjMsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwN3JbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiOFwiLCBcInhcIjogNzguMSwgXCJ5XCI6IDU4LjUzNSwgXCJ6b29tWFwiOiAwLjIwNywgXCJ6b29tWVwiOiAwLjIxNywgXCJyb3RhdGlvblwiOiAtMC4yNSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA4cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI5XCIsIFwieFwiOiAyMTkuNSwgXCJ5XCI6IDI0LCBcInpvb21YXCI6IDAuMjE1LCBcInpvb21ZXCI6IDAuMjE0NSwgXCJyb3RhdGlvblwiOiAtMC4yNixcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDlyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjEwXCIsIFwieFwiOiA0NTQuMjEsIFwieVwiOiAtMS41LCBcInpvb21YXCI6IDAuMjE4LCBcInpvb21ZXCI6IDAuMjE0LCBcInJvdGF0aW9uXCI6IDAuMDE1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTByXzJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTFcIiwgXCJ4XCI6IDYyMS44NiwgXCJ5XCI6IDI1LjUyNSwgXCJ6b29tWFwiOiAwLjIxMywgXCJ6b29tWVwiOiAwLjIxMTUsIFwicm90YXRpb25cIjogMC4xMSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDExcltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSwgXG5cdHtcblx0XCJuYW1lXCI6IFwiMTItMVwiLCBcInhcIjogNzY5LjY0NSwgXCJ5XCI6IDUwLjI2NSwgXCJ6b29tWFwiOiAwLjQyNCwgXCJ6b29tWVwiOiAwLjQyMiwgXCJyb3RhdGlvblwiOiAwLjEyLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTJyXzFbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTRcIiwgXCJ4XCI6IC05MTUuNiwgXCJ5XCI6IDU1Ny44NjUsIFwiem9vbVhcIjogMC4yMDgsIFwiem9vbVlcIjogMC4yMDgsIFwicm90YXRpb25cIjogLTEuMjE1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTRSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE1LTJcIiwgXCJ4XCI6IC03MTcuMywgXCJ5XCI6IDU3MiwgXCJ6b29tWFwiOiAwLjIxLCBcInpvb21ZXCI6IDAuMjA2LCBcInJvdGF0aW9uXCI6IC0xLjQ3LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTVyXzJbU1ZDMl0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTYtMlwiLCBcInhcIjogLTkyLCBcInlcIjogMzM2LjUsIFwiem9vbVhcIjogMC4yMTcsIFwiem9vbVlcIjogMC4yMSwgXCJyb3RhdGlvblwiOiAtMC4xLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTZyXzJbU1ZDMl0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTdcIiwgXCJ4XCI6IDc3LCBcInlcIjogMjc4LjUsIFwiem9vbVhcIjogMC4yMDYsIFwiem9vbVlcIjogMC4yMDYsIFwicm90YXRpb25cIjogLTAuMDU1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTdSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE4XCIsIFwieFwiOiAyMjksIFwieVwiOiAyMzkuNSwgXCJ6b29tWFwiOiAwLjIwOCwgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAwLjA3LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMThSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE5XCIsIFwieFwiOiA3MS41LCBcInlcIjogNDc0LCBcInpvb21YXCI6IDAuMjAzLCBcInpvb21ZXCI6IDAuMjA4LCBcInJvdGF0aW9uXCI6IDAuMTcsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxOVJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMjBcIiwgXCJ4XCI6IDQzLjUsIFwieVwiOiA2NDAsIFwiem9vbVhcIjogMC4xLCBcInpvb21ZXCI6IDAuMTA0LCBcInJvdGF0aW9uXCI6IDAuMjA1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMjBSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9XG5cbl1cblxuXG5cbiIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1xuXHRcdFwibmFtZVwiOiBcImhlbnJpZXR0YVwiLCBcInhcIjogLTQ4Ni41LCBcInlcIjogLTI1Mi41LCBcInpvb21YXCI6IDAuMjksIFwiem9vbVlcIjogMC41LCBcInJvdGF0aW9uXCI6IDAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9oZW5yaWV0dGEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibWF0ZXJcIiwgXCJ4XCI6IC0zNDIsIFwieVwiOiAtNzQ3LCBcInpvb21YXCI6IDAuMDgsIFwiem9vbVlcIjogMC4xOCwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21hdGVybWlzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInBldGVyc1wiLCBcInhcIjogLTcxOSwgXCJ5XCI6IC04MzYsIFwiem9vbVhcIjogMC4wNywgXCJ6b29tWVwiOiAwLjE0LCBcInJvdGF0aW9uXCI6IC0wLjE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvcGV0ZXJzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm9jb25uZWxsXCIsIFwieFwiOiAtODIxLCBcInlcIjogLTE4MzUsIFwiem9vbVhcIjogMC4yNSwgXCJ6b29tWVwiOiAwLjI1LCBcInJvdGF0aW9uXCI6IDAsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9vY29ubmVsbC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImZvdXJjb3VydHNcIiwgXCJ4XCI6IC01NjcuNSwgXCJ5XCI6IDMyMy41LCBcInpvb21YXCI6IDAuMTYsIFwiem9vbVlcIjogMC4zMjgsIFwicm90YXRpb25cIjogLTAuMTIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9mb3VyY291cnRzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibWljaGFuc1wiLCBcInhcIjogLTYzOSwgXCJ5XCI6IDE2MCwgXCJ6b29tWFwiOiAwLjE0LCBcInpvb21ZXCI6IDAuMjQsIFwicm90YXRpb25cIjogMC4wMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21pY2hhbnMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ0aGVjYXN0bGVcIiwgXCJ4XCI6IC0yOTAsIFwieVwiOiA1MjAsIFwiem9vbVhcIjogMC4yMiwgXCJ6b29tWVwiOiAwLjQyLCBcInJvdGF0aW9uXCI6IC0wLjAxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL3RoZWNhc3RsZS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtYXJrZXRcIiwgXCJ4XCI6IC02MTcsIFwieVwiOiA1NjUsIFwiem9vbVhcIjogMC4xNSwgXCJ6b29tWVwiOiAwLjI2LCBcInJvdGF0aW9uXCI6IDAuMDQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9tYXJrZXQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJwYXRyaWNrc1wiLCBcInhcIjogLTQ2MiwgXCJ5XCI6IDc5NSwgXCJ6b29tWFwiOiAwLjEsIFwiem9vbVlcIjogMC4xMiwgXCJyb3RhdGlvblwiOiAwLjA0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvcGF0cmlja3MucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJuZ2lyZWxhbmRcIiwgXCJ4XCI6IDQzMSwgXCJ5XCI6IDY5NCwgXCJ6b29tWFwiOiAwLjE0LCBcInpvb21ZXCI6IDAuMzc1LCBcInJvdGF0aW9uXCI6IC0wLjEzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL25naXJlbGFuZC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjhcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImJsdWVjb2F0c1wiLCBcInhcIjogLTk5NywgXCJ5XCI6IDg2LCBcInpvb21YXCI6IDAuMSwgXCJ6b29tWVwiOiAwLjIsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9ibHVlY29hdHMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJjb2xsaW5zYmFycmFja3NcIiwgXCJ4XCI6IC0xMTMwLCBcInlcIjogOTAsIFwiem9vbVhcIjogMC4xMywgXCJ6b29tWVwiOiAwLjM3LCBcInJvdGF0aW9uXCI6IDAuMDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvY29sbGluc2JhcnJhY2tzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiaHVnaGxhbmVcIiwgXCJ4XCI6IC0xNzIsIFwieVwiOiAtMzM1LCBcInpvb21YXCI6IDAuMiwgXCJ6b29tWVwiOiAwLjMzLCBcInJvdGF0aW9uXCI6IC0wLjA2LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvaHVnaGxhbmUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJncG9cIiwgXCJ4XCI6IDUyLCBcInlcIjogNTAsIFwiem9vbVhcIjogMC4wODYsIFwiem9vbVlcIjogMC4yNSwgXCJyb3RhdGlvblwiOiAtMC4wMzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9ncG8ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtb3VudGpveVwiLCBcInhcIjogMjYzLCBcInlcIjogLTU2MCwgXCJ6b29tWFwiOiAwLjE1LCBcInpvb21ZXCI6IDAuMjg1LCBcInJvdGF0aW9uXCI6IDAuMTcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9tb3VudGpveS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm1vdW50am95YlwiLCBcInhcIjogMTUyLCBcInlcIjogLTU3MCwgXCJ6b29tWFwiOiAwLjIsIFwiem9vbVlcIjogMC4zMDUsIFwicm90YXRpb25cIjogMC4wNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21vdW50am95Yi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInJveWFsaG9zcGl0YWxcIiwgXCJ4XCI6IC0xODUxLCBcInlcIjogNDg3LjUsIFwiem9vbVhcIjogMC4yMSwgXCJ6b29tWVwiOiAwLjMsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9yb3lhbGhvc3BpdGFsLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwicGVwcGVyXCIsIFwieFwiOiA4MzQsIFwieVwiOiA5OTAsIFwiem9vbVhcIjogMC4wNiwgXCJ6b29tWVwiOiAwLjE0NSwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL3BlcHBlci5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImxpYmVydHloYWxsXCIsIFwieFwiOiAyNzAsIFwieVwiOiAtMTQsIFwiem9vbVhcIjogMC40MywgXCJ6b29tWVwiOiAwLjQzLCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbGliZXJ0eS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImN1c3RvbXNob3VzZVwiLCBcInhcIjogMzgyLCBcInlcIjogMTA3LCBcInpvb21YXCI6IDAuMTUsIFwiem9vbVlcIjogMC4zMCwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2N1c3RvbXNob3VzZS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fVxuXSIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMzJcIiwgXCJ4XCI6IC03NDUsIFwieVwiOiAxMC4wNSwgXCJ6b29tWFwiOiAwLjI1LCBcInpvb21ZXCI6IDAuMjUsIFwicm90YXRpb25cIjogLTEuNDMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0wMzItbS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDb25zdGl0dXRpb24gSGlsbCAtIFR1cm5waWtlLCBHbGFzbmV2aW4gUm9hZDsgc2hvd2luZyBwcm9wb3NlZCByb2FkIHRvIEJvdGFuaWMgR2FyZGVuc1wiLFxuXHRcdFwiZGF0ZVwiOiAxNzk4XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDcyXCIsICBcInhcIjogLTI2MC41LCBcInlcIjogLTI0Ny41LCBcInpvb21YXCI6IDAuMzEsIFwiem9vbVlcIjogMC4zMSwgXCJyb3RhdGlvblwiOiAxLjU4NSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMDcyLW0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIGltcHJvdmluZyB0aGUgc3RyZWV0cyBiZXR3ZWVuIFJpY2htb25kIEJyaWRnZSAoRm91ciBDb3VydHMpIGFuZCBDb25zdGl0dXRpb24gSGlsbCAoS2luZ+KAmXMgSW5ucykgRGF0ZTogMTgzN1wiLFxuXHRcdFwiZGF0ZVwiOiAxODM3XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDc1XCIsIFwieFwiOiAtMjE3LjUsIFwieVwiOiAtMTQxNC41LCBcInpvb21YXCI6IDAuODcsIFwiem9vbVlcIjogMC43NzIsIFwicm90YXRpb25cIjogMS42MTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0wNzUtbS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiBhIGxpbmUgb2Ygcm9hZCwgbGVhZGluZyBmcm9tIExpbmVuIEhhbGwgdG8gR2xhc25ldmluIFJvYWQsIHNob3dpbmcgdGhlIFJveWFsIENhbmFsIERhdGU6IDE4MDBcIixcblx0XHRcImRhdGVcIjogMTgwMFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM2MVwiLCBcInhcIjogNDY0LCBcInlcIjogMjEzMSwgXCJ6b29tWFwiOiAwLjQzNiwgXCJ6b29tWVwiOiAwLjQzNiwgXCJyb3RhdGlvblwiOiAtMi4wNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNjEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJMZWVzb24gU3RyZWV0LCBQb3J0bGFuZCBTdHJlZXQgKG5vdyBVcHBlciBMZWVzb24gU3RyZWV0KSwgRXVzdGFjZSBQbGFjZSwgRXVzdGFjZSBCcmlkZ2UgKG5vdyBMZWVzb24gU3RyZWV0KSwgSGF0Y2ggU3RyZWV0LCBDaXJjdWxhciBSb2FkIC0gc2lnbmVkIGJ5IENvbW1pc3Npb25lcnMgb2YgV2lkZSBTdHJlZXRzIERhdGU6IDE3OTJcIixcblx0XHRcImRhdGVcIjogMTc5MlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE0MlwiLCBcInhcIjogOTQuOTk1LCBcInlcIjogMjM3Ny41LCBcInpvb21YXCI6IDAuNDgyLCBcInpvb21ZXCI6IDAuNDc2LCBcInJvdGF0aW9uXCI6IC0yLjAxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE0Mi1sLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDEuMCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBOZXcgU3RyZWV0cywgYW5kIG90aGVyIGltcHJvdmVtZW50cyBpbnRlbmRlZCB0byBiZSBpbW1lZGlhdGVseSBleGVjdXRlZC4gU2l0dWF0ZSBvbiB0aGUgU291dGggU2lkZSBvZiB0aGUgQ2l0eSBvZiBEdWJsaW4sIHN1Ym1pdHRlZCBmb3IgdGhlIGFwcHJvYmF0aW9uIG9mIHRoZSBDb21taXNzaW9uZXJzIG9mIFdpZGUgU3RyZWV0cywgcGFydGljdWxhcmx5IG9mIHRob3NlIHBhcnRzIGJlbG9uZ2luZyB0byBXbS4gQ29wZSBhbmQgSm9obiBMb2NrZXIsIEVzcS4sIEhhcmNvdXJ0IFN0cmVldCwgQ2hhcmxlbW91bnQgU3RyZWV0LCBQb3J0b2JlbGxvLCBldGMuIERhdGU6IDE3OTJcIixcblx0XHRcImRhdGVcIjogMTc5MlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE1NVwiLCBcInhcIjogLTE1MDYsIFwieVwiOiAtNTAuNSwgXCJ6b29tWFwiOiAwLjY3LCBcInpvb21ZXCI6IDAuNjQ0LCBcInJvdGF0aW9uXCI6IC0wLjAyNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE1NS1sLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTmV3IGFwcHJvYWNoIGZyb20gTWlsaXRhcnkgUm9hZCB0byBLaW5n4oCZcyBCcmlkZ2UsIGFuZCBhbG9uZyB0aGUgUXVheXMgdG8gQXN0b27igJlzIFF1YXkgRGF0ZTogMTg0MVwiLFxuXHRcdFwiZGF0ZVwiOiAxODQxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTU3LTNcIiwgXCJ4XCI6IDMuMTE1LCBcInlcIjogMy42NSwgXCJ6b29tWFwiOiAwLjUyNSwgXCJ6b29tWVwiOiAwLjU5LCBcInJvdGF0aW9uXCI6IDAuNTQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0xNTctMy1tLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuMCwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcInNob3dpbmcgdGhlIGltcHJvdmVtZW50cyBwcm9wb3NlZCBieSB0aGUgQ29tbWlzc2lvbmVycyBvZiBXaWRlIFN0cmVldHMgaW4gTmFzc2F1IFN0cmVldCwgTGVpbnN0ZXIgU3RyZWV0IGFuZCBDbGFyZSBTdHJlZXRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE2NFwiLCBcInhcIjogLTQ3MiwgXCJ5XCI6ODA1LCBcInpvb21YXCI6IDAuMDU2LCBcInpvb21ZXCI6IDAuMDU2LCBcInJvdGF0aW9uXCI6IDAuMDksIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0xNjQtbC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxLjAsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIFNhaW50IFBhdHJpY2vigJlzLCBldGMuIERhdGU6IDE4MjRcIixcblx0XHRcImRhdGVcIjogMTgyNFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ2OS0wMlwiLCBcInhcIjogMjU1LCBcInlcIjogMTM4OS41LCBcInpvb21YXCI6IDAuMjQ1LCBcInpvb21ZXCI6IDAuMjQ1LCBcInJvdGF0aW9uXCI6IC0yLjc1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNDY5LTItbS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJFYXJsc2ZvcnQgVGVycmFjZSwgU3RlcGhlbuKAmXMgR3JlZW4gU291dGggYW5kIEhhcmNvdXJ0IFN0cmVldCBzaG93aW5nIHBsYW4gb2YgcHJvcG9zZWQgbmV3IHN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzU1LTFcIiwgXCJ4XCI6IDY5NiwgXCJ5XCI6IDcxMy41LCBcInpvb21YXCI6IDAuMzIzLCBcInpvb21ZXCI6IDAuMjg5LCBcInJvdGF0aW9uXCI6IDEuMTQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzU1LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBvZiBCYWdnb3QgU3RyZWV0IGFuZCBGaXR6d2lsbGlhbSBTdHJlZXQsIHNob3dpbmcgYXZlbnVlcyB0aGVyZW9mIE5vLiAxIERhdGU6IDE3OTBcIixcblx0XHRcImRhdGVcIjogMTc5MFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTcyOVwiLCBcInhcIjogLTEwOTYsIFwieVwiOiA2NjksIFwiem9vbVhcIjogMC4xMjYsIFwiem9vbVlcIjogMC4xMTgsIFwicm90YXRpb25cIjogLTMuNDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNzI5LWwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gSmFtZXPigJlzIFN0cmVldCwgQmFzb24gTGFuZSwgRWNobGlu4oCZcyBMYW5lLCBHcmFuZCBDYW5hbCBQbGFjZSwgQ2l0eSBCYXNvbiBhbmQgR3JhbmQgQ2FuYWwgSGFyYm91clwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNzU3XCIsIFwieFwiOiAtODgxLCBcInlcIjogMjYxLjUsIFwiem9vbVhcIjogMC4zNTUsIFwiem9vbVlcIjogMC4zNTUsIFwicm90YXRpb25cIjogLTAuMDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNzU3LWwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGFydCBvZiB0aGUgQ2l0eSBvZiBEdWJsaW4gd2l0aCBwcm9wb3NlZCBpbXByb3ZlbWVudHMuIEltcHJvdmVtZW50cyB0byBiZSBtYWRlIG9yIGludGVuZGVkIGluIFRob21hcyBTdHJlZXQsIEhpZ2ggU3RyZWV0LCBXaW5ldGF2ZXJuIFN0cmVldCwgU2tpbm5lciBSb3csIFdlcmJ1cmdoIFN0cmVldCwgQ2Fub24gU3RyZWV0LCBQYXRyaWNrIFN0cmVldCwgS2V2aW4gU3RyZWV0LCBCaXNob3AgU3RyZWV0IGFuZCBUaGUgQ29vbWJlIFRob21hcyBTaGVycmFyZCBEYXRlOiAxODE3XCIsXG5cdFx0XCJkYXRlXCI6IDE4MTdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMzhcIiwgXCJ4XCI6IDIxMi41LCBcInlcIjogMTQ3LCBcInpvb21YXCI6IDAuMTksIFwiem9vbVlcIjogMC4xNzYsIFwicm90YXRpb25cIjogMCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTEzOC1sLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHByZW1pc2VzLCBHZW9yZ2XigJlzIFF1YXksIENpdHkgUXVheSwgVG93bnNlbmQgU3RyZWV0IGFuZCBuZWlnaGJvdXJob29kLCBzaG93aW5nIHByb3BlcnR5IGxvc3QgdG8gdGhlIENpdHksIGluIGEgc3VpdCBieSAnVGhlIENvcnBvcmF0aW9uIC0gd2l0aCBUcmluaXR5IENvbGxlZ2UnXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xODlcIiwgXCJ4XCI6IC03OTIuNSwgXCJ5XCI6IDI2Mi41LCBcInpvb21YXCI6IDAuMjYsIFwiem9vbVlcIjogMC4yNTgsIFwicm90YXRpb25cIjogMC4wMDMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTg5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQ29weSBvZiBtYXAgb2YgcHJvcG9zZWQgTmV3IFN0cmVldCBmcm9tIEVzc2V4IFN0cmVldCB0byBDb3JubWFya2V0LCB3aXRoIHRoZSBlbnZpcm9ucyBhbmQgc3RyZWV0cyBicmFuY2hpbmcgb2ZmXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wOThcIiwgXCJ4XCI6IC00NzUsIFwieVwiOiA1MjQsIFwiem9vbVhcIjogMC4wNjMsIFwiem9vbVlcIjogMC4wNjMsIFwicm90YXRpb25cIjogLTAuMTYsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDk4LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIENocmlzdGNodXJjaCwgU2tpbm5lcnMgUm93IGV0Yy4gVGhvbWFzIFNoZXJyYXJkLCA1IEphbnVhcnkgMTgyMSBEYXRlOiAxODIxXCIsXG5cdFx0XCJkYXRlXCI6IDE4MjFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yMDJcIiwgXCJ4XCI6IDE2LCBcInlcIjogODEsIFwiem9vbVhcIjogMC4yODksIFwiem9vbVlcIjogMC4yNjMsIFwicm90YXRpb25cIjogLTAuMTA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTIwMi1jLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiYXJlYSBpbW1lZGlhdGVseSBub3J0aCBvZiBSaXZlciBMaWZmZXkgZnJvbSBTYWNrdmlsbGUgU3QsIExvd2VyIEFiYmV5IFN0LCBCZXJlc2ZvcmQgUGxhY2UsIGFzIGZhciBhcyBlbmQgb2YgTm9ydGggV2FsbC4gQWxzbyBzb3V0aCBvZiBMaWZmZXkgZnJvbSBXZXN0bW9ybGFuZCBTdHJlZXQgdG8gZW5kIG9mIEpvaG4gUm9nZXJzb24ncyBRdWF5XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNzlcIiwgXCJ4XCI6IC01MzcuNSwgXCJ5XCI6IDczMCwgXCJ6b29tWFwiOiAwLjE2OCwgXCJ6b29tWVwiOiAwLjE2NCwgXCJyb3RhdGlvblwiOiAwLjAyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE3OS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxLjAsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlNhaW50IFBhdHJpY2vigJlzIENhdGhlZHJhbCwgTm9ydGggQ2xvc2UgYW5kIHZpY2luaXR5XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMjlcIiwgXCJ4XCI6IC02NzAuNSwgXCJ5XCI6IDM0NywgXCJ6b29tWFwiOiAwLjMzOCwgXCJ6b29tWVwiOiAwLjMzMiwgXCJyb3RhdGlvblwiOiAtMC4yMSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zMjkucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC4zLFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIGZvciBvcGVuaW5nIGFuZCB3aWRlbmluZyBhIHByaW5jaXBhbCBBdmVudWUgdG8gdGhlIENhc3RsZSwgbm93ICgxOTAwKSBQYXJsaWFtZW50IFN0cmVldCAtIHNob3dpbmcgRGFtZSBTdHJlZXQsIENhc3RsZSBTdHJlZXQsIGFuZCBhbGwgdGhlIEF2ZW51ZXMgdGhlcmVvZiBEYXRlOiAxNzU3XCIsXG5cdFx0XCJkYXRlXCI6IDE3NTdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xODdcIiwgXCJ4XCI6IC0yMjYsIFwieVwiOiA0OTQuNSwgXCJ6b29tWFwiOiAwLjA2NiwgXCJ6b29tWVwiOiAwLjA2NCwgXCJyb3RhdGlvblwiOiAwLjAsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTg3LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDEuMCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQSBzdXJ2ZXkgb2Ygc2V2ZXJhbCBob2xkaW5ncyBpbiBTb3V0aCBHcmVhdCBHZW9yZ2UncyBTdHJlZXQgLSB0b3RhbCBwdXJjaGFzZSDCozExNTI4LjE2LjMgRGF0ZToxODAxXCIsXG5cdFx0XCJkYXRlXCI6IDE4MDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMjRcIiwgXCJ4XCI6IC0yNzksIFwieVwiOiAzNjYsIFwiem9vbVhcIjogMC4wNTcsIFwiem9vbVlcIjogMC4wNTEsIFwicm90YXRpb25cIjogLTAuMTYsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTI0LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHByZW1pc2VzIGluIEVzc2V4IFN0cmVldCBhbmQgUGFybGlhbWVudCBTdHJlZXQsIHNob3dpbmcgRXNzZXggQnJpZGdlIGFuZCBPbGQgQ3VzdG9tIEhvdXNlLiBULiBhbmQgRC5ILiBTaGVycmFyZCBEYXRlOiAxODEzXCIsXG5cdFx0XCJkYXRlXCI6IDE4MTNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zNjBcIiwgIFwieFwiOiAtMTQzLCBcInlcIjogNDI2LjUsIFwiem9vbVhcIjogMC4xMTcsIFwiem9vbVlcIjogMC4xMDMsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzYwLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gRGFtZSBTdHJlZXQgYW5kIGF2ZW51ZXMgdGhlcmVvZiAtIEV1c3RhY2UgU3RyZWV0LCBDZWNpbGlhIFN0cmVldCwgYW5kIHNpdGUgb2YgT2xkIFRoZWF0cmUsIEZvd25lcyBTdHJlZXQsIENyb3duIEFsbGV5IGFuZCBDb3BlIFN0cmVldCBEYXRlOiAxNzkyXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzkyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzYyXCIsIFwieFwiOiAzNS41LCBcInlcIjogODQuNSwgXCJ6b29tWFwiOiAwLjIyOSwgXCJ6b29tWVwiOiAwLjIzNSwgXCJyb3RhdGlvblwiOiAwLjEyNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNjItMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjQsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcHMgLSBDb2xsZWdlIEdyZWVuLCBDb2xsZWdlIFN0cmVldCwgV2VzdG1vcmVsYW5kIFN0cmVldCBhbmQgYXZlbnVlcyB0aGVyZW9mLCBzaG93aW5nIHRoZSBzaXRlIG9mIFBhcmxpYW1lbnQgSG91c2UgYW5kIFRyaW5pdHkgQ29sbGVnZSBOby4gMSBEYXRlOiAxNzkzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzkzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzg3XCIsIFwieFwiOiAyNzIuNSwgXCJ5XCI6IDQyMy41LCBcInpvb21YXCI6IDAuMDgxLCBcInpvb21ZXCI6IDAuMDc3LCBcInJvdGF0aW9uXCI6IDMuMDM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM4Ny5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiBob2xkaW5ncyBpbiBGbGVldCBTdHJlZXQgYW5kIENvbGxlZ2UgU3RyZWV0LCBzaG93aW5nIHNpdGUgb2YgT2xkIFdhdGNoIEhvdXNlIERhdGU6IDE4MDFcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yMThcIiwgXCJ4XCI6IC0yNDU1LCBcInlcIjogLTI4NC41LCBcInpvb21YXCI6IDAuNDUzLCBcInpvb21ZXCI6IDAuNDUxLCBcInJvdGF0aW9uXCI6IC0wLjA0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTIxOC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiB0aGUgTG9uZyBNZWFkb3dzIGFuZCBwYXJ0IG9mIHRoZSBQaG9lbml4IFBhcmsgYW5kIFBhcmtnYXRlIFN0cmVldCBEYXRlOiAxNzg2XCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzg2XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjI5XCIsIFwieFwiOiAtMjM4NCwgXCJ5XCI6IDU1LjUsIFwiem9vbVhcIjogMC4zNzksIFwiem9vbVlcIjogMC4zNzksIFwicm90YXRpb25cIjogMC4wMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjI5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU2VjdGlvbiBhY3Jvc3MgdGhlIHByb3Bvc2VkIFJvYWQgZnJvbSB0aGUgUGFyayBHYXRlIHRvIElzbGFuZCBCcmlkZ2UgR2F0ZSAtIG5vdyAoMTkwMCkgQ29ueW5naGFtIFJvYWQgRGF0ZTogMTc4OVwiLCBcblx0XHRcImRhdGVcIjogMTc4OVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTI0MlwiLCBcInhcIjogLTQwNS41LCBcInlcIjogMjEsIFwiem9vbVhcIjogMC4wODQsIFwiem9vbVlcIjogMC4wODQsIFwicm90YXRpb25cIjogMS4wODUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjQyLTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTdXJ2ZXkgb2YgYSBob2xkaW5nIGluIE1hcnnigJlzIExhbmUsIHRoZSBlc3RhdGUgb2YgdGhlIFJpZ2h0IEhvbm91cmFibGUgTG9yZCBNb3VudGpveSBEYXRlOiAxNzkzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzkzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjQ1XCIsIFwieFwiOiAtMjEwLjAsIFwieVwiOi0zOTcuNSwgXCJ6b29tWFwiOiAwLjA4NCwgXCJ6b29tWVwiOiAwLjA4NCwgXCJyb3RhdGlvblwiOiAtMC42MiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yNDUtMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiB0aGUgQmFybGV5IEZpZWxkcyBldGMuLCBhbmQgYSBwbGFuIGZvciBvcGVuaW5nIGEgc3RyZWV0IGZyb20gUnV0bGFuZCBTcXVhcmUsIERvcnNldCBTdHJlZXQsIGJlaW5nIG5vdyAoMTg5OSkga25vd24gYXMgU291dGggRnJlZGVyaWNrIFN0cmVldCAtIHdpdGggcmVmZXJlbmNlIERhdGU6IDE3ODlcIixcblx0XHQgXCJkYXRlXCI6IDE3ODlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yNTdcIiwgXCJ4XCI6IDY4MS4wLCBcInlcIjotMTIyMy41LCBcInpvb21YXCI6IDAuMzQ2LCBcInpvb21ZXCI6IDAuMzg4LCBcInJvdGF0aW9uXCI6IDAuMjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjU3LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIENsb25saWZmZSBSb2FkIGFuZCB0aGUgT2xkIFR1cm5waWtlIEhvdXNlIGF0IEJhbGx5Ym91Z2ggQnJpZGdlIC0gTm9ydGggU3RyYW5kIERhdGU6IDE4MjNcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MjNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yNjhcIiwgXCJ4XCI6IC0xNTI4LjAsIFwieVwiOiAxMDUuNSwgXCJ6b29tWFwiOiAwLjA4NiwgXCJ6b29tWVwiOiAwLjA4NiwgXCJyb3RhdGlvblwiOiAwLjA3LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTI2OC0zLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gUGFya2dhdGUgU3RyZWV0LCBDb255bmdoYW0gUm9hZCwgd2l0aCByZWZlcmVuY2UgdG8gbmFtZXMgb2YgdGVuYW50cyBlbmRvcnNlZCBOby4gM1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTcxXCIsIFwieFwiOiAxMTIuMCwgXCJ5XCI6IDE4MS41LCBcInpvb21YXCI6IDAuMDIxLCBcInpvb21ZXCI6IDAuMDIxLCBcInJvdGF0aW9uXCI6IC0wLjI2NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xNzEtMi5qcGVnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgTG93ZXIgQWJiZXkgU3RyZWV0LCB0byBjb3JuZXIgb2YgRWRlbiBRdWF5IChTYWNrdmlsbGUgU3RyZWV0KSBEYXRlOiAxODEzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODEzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzgwXCIsIFwieFwiOiAyNDEuNSwgXCJ5XCI6IDI4NiwgXCJ6b29tWFwiOiAwLjAzMywgXCJ6b29tWVwiOiAwLjAzMywgXCJyb3RhdGlvblwiOiAwLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM4MC0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gRmxlZXQgTWFya2V0LCBQb29sYmVnIFN0cmVldCwgSGF3a2lucyBTdHJlZXQsIFRvd25zZW5kIFN0cmVldCwgRmxlZXQgU3RyZWV0LCBEdWJsaW4gU29jaWV0eSBTdG9yZXMgRGF0ZTogMTgwMFwiLCBcblx0XHRcImRhdGVcIjogMTgwMFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTMwOVwiLCBcInhcIjogMzYuMCwgXCJ5XCI6IC0yOTcsIFwiem9vbVhcIjogMC4yMTksIFwiem9vbVlcIjogMC4yMTksIFwicm90YXRpb25cIjogLTAuNDM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMwOS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBhcnQgb2YgR2FyZGluZXIgU3RyZWV0IGFuZCBwYXJ0IG9mIEdsb3VjZXN0ZXIgU3RyZWV0LCBsYW5kIG91dCBpbiBsb3RzIGZvciBidWlsZGluZyAtIHNob3dpbmcgR2xvdWNlc3RlciBTdHJlZXQsIEdsb3VjZXN0ZXIgUGxhY2UsIHRoZSBEaWFtb25kLCBTdW1tZXIgSGlsbCwgR3JlYXQgQnJpdGFpbiBTdHJlZXQsIEN1bWJlcmxhbmQgU3RyZWV0LCBNYXJsYm9yb+KAmSBTdHJlZXQsIE1hYmJvdCBTdHJlZXQsIE1lY2tsaW5idXJnaCBldGMuRGF0ZTogMTc5MVwiLCBcblx0XHRcImRhdGVcIjogMTc5MVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTI5NFwiLCBcInhcIjogMTI1LjAsIFwieVwiOiAtMTE4LCBcInpvb21YXCI6IDAuMTI5LCBcInpvb21ZXCI6IDAuMTI5LCBcInJvdGF0aW9uXCI6IC0wLjE5NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTI5NC0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIHBhcnQgb2YgdGhlIExvcmRzaGlwIG9mIFNhaW50IE1hcnnigJlzIEFiYmV5IC0gcGFydCBvZiB0aGUgZXN0YXRlIG9mIHRoZSBSaWdodCBIb25vcmFibGUgTHVrZSBWaXNjb3VudCBNb3VudGpveSwgc29sZCB0byBSaWNoYXJkIEZyZW5jaCBFc3EuLCBwdXJzdWFudCB0byBhIERlY3JlZSBvZiBIaXMgTWFqZXN0eeKAmXMgSGlnaCBDb3VydCBvZiBDaGFuY2VyeSwgMTcgRmViIDE3OTRcIiwgXG5cdFx0XCJkYXRlXCI6IDE3OTRcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMTBcIiwgXCJ4XCI6IDQ3NC4wLCBcInlcIjogLTgyMS41LCBcInpvb21YXCI6IDAuNTc2LCBcInpvb21ZXCI6IDAuNTc2LCBcInJvdGF0aW9uXCI6IDAuMTQ1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMxMC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk5vcnRoIExvdHMgLSBmcm9tIHRoZSBOb3J0aCBTdHJhbmQgUm9hZCwgdG8gdGhlIE5vcnRoIGFuZCBFYXN0IFdhbGxzIERhdGU6IDE3OTNcIiwgXG5cdFx0XCJkYXRlXCI6IDE3OTNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMjVcIiwgXCJ4XCI6IC04OTMuMCwgXCJ5XCI6IDQxLCBcInpvb21YXCI6IDAuMjg2LCBcInpvb21ZXCI6IDAuMjg2LCBcInJvdGF0aW9uXCI6IDAuMDMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzI1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU21pdGhmaWVsZCwgQXJyYW4gUXVheSwgSGF5bWFya2V0LCBXZXN0IEFycmFuIFN0cmVldCwgTmV3IENodXJjaCBTdHJlZXQsIEJvdyBMYW5lLCBCb3cgU3RyZWV0LCBNYXkgTGFuZVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzI2LTFcIiwgXCJ4XCI6IC0xNDE1LjUsIFwieVwiOiAxMTIuNSwgXCJ6b29tWFwiOiAwLjExNCwgXCJ6b29tWVwiOiAwLjExMiwgXCJyb3RhdGlvblwiOiAwLjE3LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMyNi0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQmFycmFjayBTdHJlZXQsIFBhcmsgU3RyZWV0LCBQYXJrZ2F0ZSBTdHJlZXQgYW5kIFRlbXBsZSBTdHJlZXQsIHdpdGggcmVmZXJlbmNlIHRvIG5hbWVzIG9mIHRlbmFudHMgYW5kIHByZW1pc2VzIE5vLiAxXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy02MzJcIiwgXCJ4XCI6IDEyNSwgXCJ5XCI6IDM0Ny41LCBcInpvb21YXCI6IDAuMTcyLCBcInpvb21ZXCI6IDAuMTY0LCBcInJvdGF0aW9uXCI6IDAuNTMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNjMyLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIE5hc3NhdSBTdHJlZXQsIGxlYWRpbmcgZnJvbSBHcmFmdG9uIFN0cmVldCB0byBNZXJyaW9uIFNxdWFyZSAtIHNob3dpbmcgdGhlIG9mZiBzdHJlZXRzIGFuZCBwb3J0aW9uIG9mIEdyYWZ0b24gU3RyZWV0IGFuZCBTdWZmb2xrIFN0cmVldCBEYXRlOiAxODMzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODMzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzI2LTJcIiwgXCJ4XCI6IC0xMjU3LjUsIFwieVwiOiAxNDMuNSwgXCJ6b29tWFwiOiAwLjEsIFwiem9vbVlcIjogMC4xLCBcInJvdGF0aW9uXCI6IDAuMDc1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMyNi0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQmFycmFjayBTdHJlZXQsIFBhcmsgU3RyZWV0LCBQYXJrZ2F0ZSBTdHJlZXQgYW5kIFRlbXBsZSBTdHJlZXQsIHdpdGggcmVmZXJlbmNlIHRvIG5hbWVzIG9mIHRlbmFudHMgYW5kIHByZW1pc2VzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMzRcIiwgXCJ4XCI6IDkwLjUsIFwieVwiOiAzNTcsIFwiem9vbVhcIjogMC4xMjgsIFwiem9vbVlcIjogMC4xMjgsIFwicm90YXRpb25cIjogMS4yNjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzM0LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRGFtZSBTdHJlZXQsIENvbGxlZ2UgR3JlZW4sIEdlb3JnZeKAmXMgTGFuZSwgR2Vvcmdl4oCZcyBTdHJlZXQsIENoZXF1ZXIgU3RyZWV0IGFuZCBhdmVudWVzIHRoZXJlb2ZcIixcblx0XHRcImRhdGVcIjogMTc3OFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM1NS0yXCIsIFwieFwiOiAxODUsIFwieVwiOiAxMDI5LCBcInpvb21YXCI6IDAuMzAyLCBcInpvb21ZXCI6IDAuMzAyLCBcInJvdGF0aW9uXCI6IC0wLjQ1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM1NS0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBvZiBCYWdnb3QgU3RyZWV0IGFuZCBGaXR6d2lsbGlhbSBTdHJlZXQsIHNob3dpbmcgYXZlbnVlcyB0aGVyZW9mIE5vLiAyIERhdGU6IDE3OTJcIixcblx0XHRcImRhdGVcIjogMTc5MlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM2OFwiLCBcInhcIjogLTY4Ny41LCBcInlcIjogMjczLjUsIFwiem9vbVhcIjogMC4xNTYsIFwiem9vbVlcIjogMC4xNSwgXCJyb3RhdGlvblwiOiAwLjEyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM2OC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBLaW5n4oCZcyBJbm4gUXVheSBhbmQgTWVyY2hhbnRzIFF1YXksIHNob3dpbmcgc2l0ZSBvZiBPcm1vbmQgQnJpZGdlIC0gYmVsb3cgQ2hhcmxlcyBTdHJlZXQgLSBhZnRlcndhcmRzIHJlbW92ZWQgYW5kIHJlLWVyZWN0ZWQgb3Bwb3NpdGUgV2luZXRhdmVybiBTdHJlZXQgRGF0ZTogMTc5N1wiLCBcblx0XHRcImRhdGVcIjogMTc5N1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM3MlwiLCBcInhcIjogMzQxLjUsIFwieVwiOiAyOTYuNSwgXCJ6b29tWFwiOiAwLjAzNiwgXCJ6b29tWVwiOiAwLjAzMzksIFwicm90YXRpb25cIjogMi45NTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzcyLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiR2VvcmdlJ3MgUXVheSwgV2hpdGVzIExhbmUsIGFuZCBIYXdraW5zIFN0cmVldCwgc2hvd2luZyBzaXRlIG9mIFN3ZWV0bWFuJ3MgQnJld2VyeSB3aGljaCByYW4gZG93biB0byBSaXZlciBMaWZmZXkgRGF0ZTogMTc5OVwiLCBcblx0XHRcImRhdGVcIjogMTc5OVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM5MC0xXCIsIFwieFwiOiAtODA0LjUsIFwieVwiOiA0MjAsIFwiem9vbVhcIjogMC4yMDQsIFwiem9vbVlcIjogMC4yMDIsIFwicm90YXRpb25cIjogLTAuMDcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzkwLTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIHByb3Bvc2VkIE1hcmtldCBIb3VzZSwgYWRqb2luaW5nIFRob21hcyBTdHJlZXQsIFZpY2FyIFN0cmVldCwgTWFya2V0IFN0cmVldCBhbmQgRnJhbmNpcyBTdHJlZXQgRGF0ZTogMTgwMVwiLCBcblx0XHRcImRhdGVcIjogMTgwMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM5NS0zXCIsIFwieFwiOiAtNTg4LCBcInlcIjogNTc4LCBcInpvb21YXCI6IDAuMDM2LCBcInpvb21ZXCI6IDAuMDM2LCBcInJvdGF0aW9uXCI6IC0zLjY1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM5NS0zLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTmV3IFJvdyBhbmQgQ3V0cHVyc2UgUm93IERhdGU6IDE4MDBcIixcblx0XHRcImRhdGVcIjogMTgwMFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQwNFwiLCBcInhcIjogLTE2LCBcInlcIjogMzcyLCBcInpvb21YXCI6IDAuMDYyLCBcInpvb21ZXCI6IDAuMDYsIFwicm90YXRpb25cIjogLTAuMjU1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQwNC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkFuZ2xlc2VhIFN0cmVldCBhbmQgUGFybGlhbWVudCBIb3VzZSBEYXRlOiAxODAyXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODAyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDExXCIsIFwieFwiOiAzNDMuNSwgXCJ5XCI6IDY1NywgXCJ6b29tWFwiOiAwLjA4NiwgXCJ6b29tWVwiOiAwLjA4NiwgXCJyb3RhdGlvblwiOiAwLjMyNSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQxMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkxlaW5zdGVyIEhvdXNlIGFuZCBwYXJ0IG9mIHRoZSBlc3RhdGUgb2YgVmlzY291bnQgRml0endpbGxpYW0gKGZvcm1lcmx5IExlaW5zdGVyIExhd24pLCBsYWlkIG91dCBpbiBsb3RzIGZvciBidWlsZGluZyAtIHNob3dpbmcgS2lsZGFyZSBTdHJlZXQsIFVwcGVyIE1lcnJpb24gU3RyZWV0IGFuZCBMZWluc3RlciBQbGFjZSAoU3RyZWV0KSwgTWVycmlvbiBQbGFjZSwgYW5kIHRoZSBPbGQgQm91bmRhcnkgYmV0d2VlbiBMZWluc3RlciBhbmQgTG9yZCBGaXR6d2lsbGlhbSAtIHRha2VuIGZyb20gYSBtYXAgc2lnbmVkIFJvYmVydCBHaWJzb24sIE1heSAxOCwgMTc1NCBEYXRlOiAxODEyXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODEyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjUxXCIsIFwieFwiOiAyMjAsIFwieVwiOiA2NCwgXCJ6b29tWFwiOiAwLjIzNiwgXCJ6b29tWVwiOiAwLjIzNiwgXCJyb3RhdGlvblwiOiAtMS40OSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTI1MS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwb3J0aW9uIG9mIENpdHksIHNob3dpbmcgTW9udGdvbWVyeSBTdHJlZXQsIE1lY2tsaW5idXJnaCBTdHJlZXQsIExvd2VyIEdsb3VjZXN0ZXIgU3RyZWV0IGFuZCBwb3J0aW9uIG9mIE1hYmJvdCBTdHJlZXRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQxM1wiLCBcInhcIjogLTM3MywgXCJ5XCI6IDgwNi41LCBcInpvb21YXCI6IDAuMDc4LCBcInpvb21ZXCI6IDAuMDc2LCBcInJvdGF0aW9uXCI6IC0wLjE1LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDEzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGV0ZXIgU3RyZWV0LCBQZXRlcuKAmXMgUm93LCBXaGl0ZWZyaWFyIFN0cmVldCwgV29vZCBTdHJlZXQgYW5kIEJyaWRlIFN0cmVldCAtIHNob3dpbmcgc2l0ZSBvZiB0aGUgQW1waGl0aGVhdHJlIGluIEJyaWRlIFN0cmVldCwgd2hlcmUgdGhlIE1vbGV5bmV1eCBDaHVyY2ggbm93ICgxOTAwKSBzdGFuZHMgRGF0ZTogMTgxMlwiLCBcblx0XHRcImRhdGVcIjogMTgxMlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQxNFwiLCBcInhcIjogLTE5My41LCBcInlcIjogMzYzLjUsIFwiem9vbVhcIjogMC4wNzIsIFwiem9vbVlcIjogMC4wNzQsIFwicm90YXRpb25cIjogLTAuMjMsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MTQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJUZW1wbGUgQmFyLCBXZWxsaW5ndG9uIFF1YXksIE9sZCBDdXN0b20gSG91c2UsIEJhZ25pbyBTbGlwIGV0Yy4gRGF0ZTogMTgxM1wiLCBcblx0XHRcImRhdGVcIjogMTgxM1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQyMVwiLCBcInhcIjogLTQ3NC41LCBcInlcIjogNTI3LCBcInpvb21YXCI6IDAuMDYyLCBcInpvb21ZXCI6IDAuMDYsIFwicm90YXRpb25cIjogLTAuMTg1LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDIxLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBwcmVjaW5jdHMgb2YgQ2hyaXN0IENodXJjaCBEdWJsaW4sIHNob3dpbmcgU2tpbm5lcnMgUm93LCB0byB3aGljaCBpcyBhdHRhY2hlZCBhIE1lbW9yYW5kdW0gZGVub21pbmF0aW5nIHRoZSBwcmVtaXNlcywgdGFrZW4gYnkgdGhlIENvbW1pc3Npb25lcnMgb2YgV2lkZSBTdHJlZXRzIGZvciB0aGUgcHVycG9zZSBvZiB3aWRlbmluZyBzYWlkIFNraW5uZXJzIFJvdywgbm93ICgxOTAwKSBrbm93biBhcyBDaHJpc3QgQ2h1cmNoIFBsYWNlIERhdGU6IDE4MTdcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MTdcblx0fSxcblx0eyBcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDA4LTJcIiwgXCJ4XCI6IC0zOTcuNSwgXCJ5XCI6IDU0NS41LCBcInpvb21YXCI6IDAuMDQ0LCBcInpvb21ZXCI6IDAuMDQ0LCBcInJvdGF0aW9uXCI6IC0wLjEyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQwOC0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiV2VyYnVyZ2ggU3RyZWV0LCBTa2lubmVycyBSb3csIEZpc2hhbWJsZSBTdHJlZXQgYW5kIENhc3RsZSBTdHJlZXQgRGF0ZTogYy4gMTgxMFwiLFxuXHRcdFwiZGF0ZVwiOiAxODEwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDI1LTFcIiwgXCJ4XCI6IC05MTcuNSwgXCJ5XCI6IDU3Ny41LCBcInpvb21YXCI6IDAuMDQ1LCBcInpvb21ZXCI6IDAuMDQ2LCBcInJvdGF0aW9uXCI6IC0xLjQyNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MjUtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1lYXRoIFJvdywgTWFya+KAmXMgQWxsZXkgYW5kIERpcnR5IExhbmUgLSBzaG93aW5nIEJyaWRnZWZvb3QgU3RyZWV0LCBNYXNzIExhbmUsIFRob21hcyBTdHJlZXQgYW5kIFN0LiBDYXRoZXJpbmXigJlzIENodXJjaCBEYXRlOiAxODIwLTI0XCIsIFxuXHRcdFwiZGF0ZVwiOiAxODIwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDI2XCIsIFwieFwiOiAtNzM1LjUsIFwieVwiOiA1NzguNSwgXCJ6b29tWFwiOiAwLjAzNCwgXCJ6b29tWVwiOiAwLjAzNCwgXCJyb3RhdGlvblwiOiAxLjU2NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MjYucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2Ygc2V2ZXJhbCBob3VzZXMgYW5kIHByZW1pc2VzIG9uIHRoZSBFYXN0IHNpZGUgb2YgTWVhdGggUm93LCB0aGUgcHJvcGVydHkgb2YgTXIuIEpvaG4gV2Fsc2ggLSBzaG93aW5nIHRoZSBzaXR1YXRpb24gb2YgVGhvbWFzIFN0cmVldCwgSGFuYnVyeSBMYW5lIGFuZCBzaXRlIG9mIENoYXBlbCBEYXRlOiAxODIxXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODIxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTEyLTFcIiwgXCJ4XCI6IC0yOTAuNSwgXCJ5XCI6IDM0NC41LCBcInpvb21YXCI6IDAuMTgsIFwiem9vbVlcIjogMC4xODIsIFwicm90YXRpb25cIjogLTAuMjYsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTEyLTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC4zLFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJEYW1lIFN0cmVldCwgZnJvbSB0aGUgY29ybmVyIG9mIFBhbGFjZSBTdHJlZXQgdG8gdGhlIGNvcm5lciBvZiBHZW9yZ2XigJlzIFN0cmVldCAtIGxhaWQgb3V0IGluIGxvdHMgZm9yIGJ1aWxkaW5nIE5vcnRoIGFuZCBTb3V0aCBhbmQgdmljaW5pdHkgRGF0ZTogMTc4MlwiLCBcblx0XHRcImRhdGVcIjogMTc4MlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTExMlwiLCBcInhcIjogLTI5OCwgXCJ5XCI6IDMzOS41LCBcInpvb21YXCI6IDAuMTg1LCBcInpvb21ZXCI6IDAuMTg1LCBcInJvdGF0aW9uXCI6IC0wLjI1NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xMTIucG5nXCIsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJvcGFjaXR5XCI6IDAuMCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRGFtZSBTdHJlZXQsIGZyb20gdGhlIGNvcm5lciBvZiBQYWxhY2UgU3RyZWV0IHRvIHRoZSBjb3JuZXIgb2YgR2Vvcmdl4oCZcyBTdHJlZXQgLSBsYWlkIG91dCBpbiBsb3RzIGZvciBidWlsZGluZyBOb3J0aCBhbmQgU291dGggYW5kIHZpY2luaXR5IERhdGU6IDE3ODJcIiwgXG5cdFx0XCJkYXRlXCI6IDE3ODJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00NTVcIiwgXCJ4XCI6IDYzNS41LCBcInlcIjogMTI1OCwgXCJ6b29tWFwiOiAwLjI2MywgXCJ6b29tWVwiOiAwLjI2MywgXCJyb3RhdGlvblwiOiAtMC45LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQ1NS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjYsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkhlcmJlcnQgUGxhY2UgYW5kIEF2ZW51ZXMgYWRqYWNlbnQgdG8gVXBwZXIgTW91bnQgU3RyZWV0LCBzaG93aW5nIFVwcGVyIEJhZ2dvdCBTdHJlZXQgLSBIZXJiZXJ0IFN0cmVldCwgV2FycmluZ3RvbiBQbGFjZSBhbmQgUGVyY3kgUGxhY2UsIE5vcnRodW1iZXJsYW5kIFJvYWQgYW5kIExvd2VyIE1vdW50IFN0cmVldCBEYXRlOiAxODMzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODMzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTk5XCIsIFwieFwiOiA4NzguNSwgXCJ5XCI6IDEyMTcuNSwgXCJ6b29tWFwiOiAwLjI0MSwgXCJ6b29tWVwiOiAwLjI0MSwgXCJyb3RhdGlvblwiOiAyLjExNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xOTktMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjYsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwYXJ0IG9mIHRoZSBlc3RhdGUgb2YgdGhlIEhvbi4gU2lkbmV5IEhlcmJlcnQsIGNhbGxlZCBXaWx0b24gUGFyYWRlLCBzaG93aW5nIHRoZSBwcm9wb3NlZCBhcHByb3ByaWF0aW9uIHRoZXJlb2YgaW4gc2l0ZXMgZm9yIGJ1aWxkaW5nLiBBbHNvIHNob3dpbmcgQmFnZ290IFN0cmVldCwgR3JhbmQgQ2FuYWwgYW5kIEZpdHp3aWxsaWFtIFBsYWNlLlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDY1XCIsIFwieFwiOiAzMDEuNSwgXCJ5XCI6IDcxMS41LCBcInpvb21YXCI6IDAuMjA3LCBcInpvb21ZXCI6IDAuMjA3LCBcInJvdGF0aW9uXCI6IDMuMywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00NjUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJHcmFmdG9uIFN0cmVldCwgTmFzc2F1IFN0cmVldCAoU291dGggc2lkZSkgYW5kIERhd3NvbiBTdHJlZXQgRGF0ZTogMTgzN1wiLCBcblx0XHRcImRhdGVcIjogMTgzN1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ4MC0yXCIsIFwieFwiOiAtNjMsIFwieVwiOiAzODIsIFwiem9vbVhcIjogMC4wNjgsIFwiem9vbVlcIjogMC4wNjgsIFwicm90YXRpb25cIjogLTAuMDU1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQ4MC0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTm9ydGggc2lkZSBvZiBDb2xsZWdlIEdyZWVuIHNob3dpbmcgQXZlbnVlcyB0aGVyZW9mLCBhbmQgZ3JvdW5kIHBsYW4gb2YgUGFybGlhbWVudCBIb3VzZSwgQW5nbGVzZWEgU3RyZWV0LCBCbGFja21vb3IgWWFyZCBldGMuIC0gd2l0aCByZWZlcmVuY2UgZ2l2aW5nIHRlbmFudHMsIG5hbWVzIG9mIHByZW1pc2VzIHJlcXVpcmVkIG9yIHB1cnBvc2Ugb2YgaW1wcm92ZW1lbnQuIERhdGU6IDE3ODZcIiwgXG5cdFx0XCJkYXRlXCI6IDE3ODZcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00OTFcIiwgXCJ4XCI6IC0yMS41LCBcInlcIjogOTM4LCBcInpvb21YXCI6IDAuMTY0LCBcInpvb21ZXCI6IDAuMTY0LCBcInJvdGF0aW9uXCI6IC0zLjA4LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQ5MS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkF1bmdpZXIgU3RyZWV0LCBNZXJjZXIgU3RyZWV0LCBZb3JrIFN0cmVldCBhbmQgQXZlbnVlcyB0aGVyZW9mLCB2aXo6IC0gRnJlbmNoIFN0cmVldCAoTWVyY2VyIFN0cmVldCksIEJvdyBMYW5lLCBEaWdnZXMgTGFuZSwgU3RlcGhlbiBTdHJlZXQsIERydXJ5IExhbmUsIEdyZWF0IGFuZCBMaXR0bGUgTG9uZ2ZvcmQgU3RyZWV0c1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDk2XCIsIFwieFwiOiAtMjc4LCBcInlcIjogNDU2LCBcInpvb21YXCI6IDAuMDE4LCBcInpvb21ZXCI6IDAuMDE4LCBcInJvdGF0aW9uXCI6IC0zLjI2LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQ5Ni5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkVzc2V4IFF1YXksIENoYW5nZSBBbGxleSwgU21vY2sgQWxsZXkgYW5kIGdyb3VuZCBwbGFuIG9mIFNtb2NrIEFsbGV5IFRoZWF0cmVcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTUwN1wiLCBcInhcIjogLTI3Mi41LCBcInlcIjogMzQ2LCBcInpvb21YXCI6IDAuMDg3LCBcInpvb21ZXCI6IDAuMDg5LCBcInJvdGF0aW9uXCI6IC0wLjIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNTA3LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRXNzZXggU3RyZWV0LCBQYXJsaWFtZW50IFN0cmVldCwgc2hvd2luZyBPbGQgQ3VzdG9tIEhvdXNlIFF1YXksIExvd2VyIE9ybW9uZCBRdWF5IGFuZCBEYW1lIFN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjA2LTFcIiwgXCJ4XCI6IC00NC41LCBcInlcIjogLTIyMSwgXCJ6b29tWFwiOiAwLjA1LCBcInpvb21ZXCI6IDAuMDUsIFwicm90YXRpb25cIjogLTAuNjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjA2LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgYW5nbGUgb2YgQ2F2ZW5kaXNoIFJvdywgUnV0bGFuZCBTcXVhcmUgYW5kIEdyZWF0IEJyaXRhaW4gU3RyZWV0IC0gc2hvd2luZyB1bnNpZ25lZCBlbGV2YXRpb25zIGFuZCBncm91bmQgcGxhbiBvZiBSb3R1bmRhIGJ5IEZyZWRlcmljayBUcmVuY2guIERhdGU6IDE3ODdcIiwgXG5cdFx0XCJkYXRlXCI6IDE3ODdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yMDNcIiwgXCJ4XCI6IC0zOTIsIFwieVwiOiAyNzIuNSwgXCJ6b29tWFwiOiAwLjA3OCwgXCJ6b29tWVwiOiAwLjA3NiwgXCJyb3RhdGlvblwiOiAtMC4yNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yMDMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDaXR5IFN1cnZleSAtIHNob3dpbmcgT3Jtb25kIFF1YXksIEFycmFuIFN0cmVldCwgTWFyeeKAmXMgQWJiZXksIExpdHRsZSBTdHJhbmQgU3RyZWV0LCBDYXBlbCBTdHJlZXQgYW5kIEVzc2V4IEJyaWRnZSBEYXRlOiAxODExXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODExXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNTE1XCIsIFwieFwiOiAtNzUsIFwieVwiOiA1NTAsIFwiem9vbVhcIjogMC4wODgsIFwiem9vbVlcIjogMC4wODgsIFwicm90YXRpb25cIjogMi45MzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNTE1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwic2hvd2luZyBEYW1lIFN0cmVldCwgRXNzZXggU3RyZWV0IGV0Yy4gLSBhbHNvIHNpdGUgZm9yIHByb3Bvc2VkIE5hdGlvbmFsIEJhbmssIG9uIG9yIGFib3V0IHdoZXJlIHRoZSAnRW1waXJlJyAoZm9ybWVybHkgdGhlICdTdGFyJykgVGhlYXRyZSBvZiBWYXJpZXRpZXMgbm93ICgxOTAwKSBzdGFuZHMgTm8uMVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNTIzLTFcIiwgXCJ4XCI6IC0yOTcuNSwgXCJ5XCI6IDM2OC41LCBcInpvb21YXCI6IDAuMDg4LCBcInpvb21ZXCI6IDAuMDg4LCBcInJvdGF0aW9uXCI6IC0wLjE4NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy01MjMtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkVzc2V4IFN0cmVldCwgVGVtcGxlIEJhciBhbmQgdmljaW5pdHkgdG8gRXNzZXggQnJpZGdlLCBzaG93aW5nIHByb3Bvc2VkIG5ldyBxdWF5IHdhbGwgKFdlbGxpbmd0b24gUXVheSlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQyMy0yXCIsIFwieFwiOiAzNC41LCBcInlcIjogNDc4LjUsIFwiem9vbVhcIjogMC4wNzgsIFwiem9vbVlcIjogMC4wODIsIFwicm90YXRpb25cIjogLTMuMjE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQyMy0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQ3Jvd24gQWxsZXksIENvcGUgU3RyZWV0LCBBcmRpbGzigJlzIFJvdywgVGVtcGxlIEJhciwgQXN0b27igJlzIFF1YXkgYW5kIFdlbGxpbmd0b24gUXVheSBOby4gMiBEYXRlOiAxODIwLTVcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MjBcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy01MzVcIiwgXCJ4XCI6IC0yMDkuNSwgXCJ5XCI6IDMyNSwgXCJ6b29tWFwiOiAwLjEzNCwgXCJ6b29tWVwiOiAwLjEzNCwgXCJyb3RhdGlvblwiOiAtMC4wNywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy01MzUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJXZWxsaW5ndG9uIFF1YXkgLSBjb250aW51YXRpb24gb2YgRXVzdGFjZSBTdHJlZXQgRGF0ZVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNTY3LTNcIiwgXCJ4XCI6IDE5NC41LCBcInlcIjogNDUwLCBcInpvb21YXCI6IDAuMTI2LCBcInpvb21ZXCI6IDAuMTI2LCBcInJvdGF0aW9uXCI6IDEuNDgsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNTY3LTMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgYSBwYXJjZWwgb2YgZ3JvdW5kIGJvdW5kZWQgYnkgR3JhZnRvbiBTdHJlZXQsIENvbGxlZ2UgR3JlZW4sIGFuZCBDaGVxdWVyIExhbmUgLSBsZWFzZWQgdG8gTXIuIFBvb2xleSAoMyBjb3BpZXMpIE5vLiAzIERhdGU6IDE2ODJcIiwgXG5cdFx0XCJkYXRlXCI6IDE2ODJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy01OTQtMVwiLCBcInhcIjogLTU2NC41LCBcInlcIjogNTcyLjUsIFwiem9vbVhcIjogMC4wNDQsIFwiem9vbVlcIjogMC4wNDQsIFwicm90YXRpb25cIjogMi41MzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNTk0LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgTmV3IEhhbGwgTWFya2V0IC0gcGFydCBvZiB0aGUgQ2l0eSBFc3RhdGUgRGF0ZTogMTc4MFwiLCBcblx0XHRcImRhdGVcIjogMTc4MFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTYyNS0xXCIsIFwieFwiOiAtMzIwLjUsIFwieVwiOiA2MDkuNSwgXCJ6b29tWFwiOiAwLjA1OCwgXCJ6b29tWVwiOiAwLjA1OCwgXCJyb3RhdGlvblwiOiAyLjYxLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTYyNS0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBPbGQgVGhvbHNlbGwgZ3JvdW5kLCBmb3JtZXJseSBjYWxsZWQgU291dGhlcuKAmXMgTGFuZSwgYmVsb25naW5nIHRvIHRoZSBDaXR5IG9mIER1YmxpbiAtIGxhaWQgb3V0IGZvciBidWlsZGluZywgTmljaG9sYXMgU3RyZWV0LCBTa2lubmVycyBSb3cgYW5kIFdlcmJ1cmdoIFN0cmVldCBCeSBBLiBSLiBOZXZpbGxlLCBDLiBTLiBEYXRlOiAxODEyXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODEyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNjU0XCIsIFwieFwiOiAtMzk3LjUsIFwieVwiOiA0MDksIFwiem9vbVhcIjogMC4xMjIsIFwiem9vbVlcIjogMC4xMjIsIFwicm90YXRpb25cIjogLTAuMTM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTY1NC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiB0aGUgZ3JvdW5kIHBsb3RzIG9mIHNldmVyYWwgaG9sZGluZ3MgYmVsb25naW5nIHRvIHRoZSBDaXR5IG9mIER1YmxpbiwgTWFkYW0gT+KAmUhhcmEsIENvbG9uZWwgQmVycnkgYW5kIG90aGVycywgb24gQmFjayBRdWF5IC0gKEVzc2V4IFF1YXkpIEJsaW5kIFF1YXkgLSBFeGNoYW5nZSBTdHJlZXQsIEVzc2V4IEJyaWRnZSwgQ3JhbmUgTGFuZSBhbmQgRGFtZSBTdHJlZXQsIFN5Y2Ftb3JlIEFsbGV5IC0gc2hvd2luZyBwb3J0aW9uIG9mIHRoZSBDaXR5IFdhbGwsIEVzc2V4IEdhdGUsIERhbWUgR2F0ZSwgRGFtZXMgTWlsbCBhbmQgYnJhbmNoIG9mIHRoZSBSaXZlciBEb2RkZXJcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTcwNVwiLCBcInhcIjogLTE4Ny41LCBcInlcIjogMzkyLCBcInpvb21YXCI6IDAuMDQsIFwiem9vbVlcIjogMC4wNDIsIFwicm90YXRpb25cIjogLTAuMzgsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNzA1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIEVzc2V4IFN0cmVldCBhbmQgdmljaW5pdHkgRGF0ZTogMTgwNlwiLCBcblx0XHRcImRhdGVcIjogMTgyNlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTcyNVwiLCBcInhcIjogLTY1My41LCBcInlcIjogMjIyLjUsIFwiem9vbVhcIjogMC4wOTQsIFwiem9vbVlcIjogMC4wOTQsIFwicm90YXRpb25cIjogMC4wNyxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTcyNS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNodXJjaCBTdHJlZXQsIENoYXJsZXMgU3RyZWV0LCBJbm7igJlzIFF1YXkgLSAnV2hpdGUgQ3Jvc3MgSW5uJyAtIHJlcmUgb2YgRm91ciBDb3VydHMgLSBVc2hlcnPigJkgUXVheSwgTWVyY2hhbnTigJlzIFF1YXksIFdvb2QgUXVheSAtIHdpdGggcmVmZXJlbmNlIERhdGU6IDE4MzNcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MzNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xOTgtMVwiLCBcInhcIjogLTQ2MiwgXCJ5XCI6IDQ3NiwgXCJ6b29tWFwiOiAwLjAzMiwgXCJ6b29tWVwiOiAwLjAzMiwgXCJyb3RhdGlvblwiOiAtMC4zNDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTk4LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgV2hpdGVob3JzZSBZYXJkIChXaW5ldGF2ZXJuIFN0cmVldCkgU3VydmV5b3I6IEFydGh1ciBOZXZpbGxlIERhdGU6IDE4NDdcIiwgXG5cdFx0XCJkYXRlXCI6IDE4NDdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNTVcIiwgXCJ4XCI6IC0xNzc1LCBcInlcIjogLTE0NDYsIFwiem9vbVhcIjogMS4xMSwgXCJ6b29tWVwiOiAxLjE2MiwgXCJyb3RhdGlvblwiOiAwLjAxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wNTUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIE1haWwgQ29hY2ggUm9hZCwgdGhyb3VnaCBCbGVzc2luZ3RvbiBTdHJlZXQgdG8gQ2FicmEsIG9mIE5ldyBMaW5lIFJvYWQsIGJlaW5nIHBhcnQgb2YgdGhlIE5hdmFuIFR1cm5waWtlIFJvYWQgYW5kIGNvbm5lY3RpbmcgYW4gaW1wcm92ZW1lbnQgbGF0ZWx5IG1hZGUgdXBvbiB0aGF0IExpbmUgd2l0aCB0aGUgQ2l0eSBvZiBEdWJsaW4gLSBzaG93aW5nIHRoZSBtb3N0IGRpcmVjdCBsaW5lIGFuZCBhbHNvIGEgQ2lyY3VpdG9ucyBsaW5lIHdoZXJlYnkgdGhlIGV4cGVuc2Ugb2YgYSBCcmlkZ2UgYWNyb3NzIHRoZSBSb3lhbCBDYW5hbCBtYXkgYmUgYXZvaWRlZC4gRG9uZSBieSBIaXMgTWFqZXN0eSdzIFBvc3QgTWFzdGVycyBvZiBJcmVsYW5kIGJ5IE1yLiBMYXJraW4gRGF0ZTogMTgxOFwiLCBcblx0XHRcImRhdGVcIjogMTgxOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA2MFwiLCBcInhcIjogLTEwNC41LCBcInlcIjogLTEsIFwiem9vbVhcIjogMC42NzQsIFwiem9vbVlcIjogMC43MDIsIFwicm90YXRpb25cIjogMy4xNjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNjAucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgc2hvd2luZyB0aGUgYWx0ZXJhdGlvbnMgcHJvcG9zZWQgaW4gdGhlIG5ldyBsaW5lIG9mIHJvYWQsIGxlYWRpbmcgZnJvbSBEdWJsaW4gdG8gTmF2YW4sIGNvbW1lbmNpbmcgYXQgQmxlc3Npbmd0b24gU3RyZWV0OyBwYXNzaW5nIGFsb25nIHRoZSBDaXJjdWxhciBSb2FkIHRvIFBydXNzaWEgU3RyZWV0LCBhbmQgaGVuY2UgYWxvbmcgdGhlIFR1cm5waWtlIFJvYWQgdG8gUmF0b2F0aCwgYW5kIHRlcm1pbmF0aW5nIGF0IHRoZSBUdXJucGlrZVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDY1XCIsIFwieFwiOiAtNTQ1LjUsIFwieVwiOiAtMjc1LCBcInpvb21YXCI6IDAuMjk4LCBcInpvb21ZXCI6IDAuMjkyLCBcInJvdGF0aW9uXCI6IC0xLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTA2NS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBzaG93aW5nIE1vdW50am95IFN0cmVldCwgRG9yc2V0IFN0cmVldCwgRG9taW5pY2sgU3RyZWV0IGFuZCB2aWNpbml0eSAtIHBsYW4gb2YgU2FpbnQgTWFyeeKAmXMgQ2hhcGVsIG9mIEVhc2UsIGFuZCBwcm9wb3NlZCBvcGVuaW5nIGxlYWRpbmcgdGhlcmV1bnRvIGZyb20gR3JhbmJ5IFJvdyAtIFRob21hcyBTaGVycmFyZCAzMCBOb3YgMTgyN1wiLCBcblx0XHRcImRhdGVcIjogMTgyN1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAxMlwiLCBcInhcIjogLTEyNS41LCBcInlcIjogMTQ5LjUsIFwiem9vbVhcIjogMC4wNDQsIFwiem9vbVlcIjogMC4wNDQsIFwicm90YXRpb25cIjogLTAuMjIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDEyLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHByZW1pc2VzIExvd2VyIEFiYmV5IFN0cmVldCwgTG93ZXIgU2Fja3ZpbGxlIFN0cmVldCBhbmQgRWRlbiBRdWF5XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMTRcIiwgXCJ4XCI6IC0xNTU1LjUsIFwieVwiOiAyNywgXCJ6b29tWFwiOiAwLjE0LCBcInpvb21ZXCI6IDAuMTQsIFwicm90YXRpb25cIjogMC4wNTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDE0LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQSBzdXJ2ZXkgb2YgZ3JvdW5kIGNvbnRpZ3VvdXMgdG8gdGhlIEhvcnNlIEJhcnJhY2tzLCBEdWJsaW4gLSBzaG93aW5nIE1vbnRwZWxpZXIgSGlsbCwgQmFycmFjayBTdHJlZXQsIFBhcmtnYXRlIFN0cmVldCBhbmQgZW52aXJvbnMgKFRob21hcyBTaGVycmFyZCkgRGF0ZTogMTc5MFwiLCBcblx0XHRcImRhdGVcIjogMTc5MFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAxNVwiLCBcInhcIjogLTE0MTQuNSwgXCJ5XCI6IDI5LCBcInpvb21YXCI6IDAuMTE2LCBcInpvb21ZXCI6IDAuMTEyLCBcInJvdGF0aW9uXCI6IDAuMDc1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTAxNS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkFyYm91ciBIaWxsLCBSb3lhbCBCYXJyYWNrcyBhbmQgdmljaW5pdHkuIFdpdGggcmVmZXJlbmNlLiBEYXRlOiAxNzkwXCIsXG5cdFx0XCJkYXRlXCI6IDE3OTBcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMTZcIiwgXCJ4XCI6IC04NDcsIFwieVwiOiAyMzEuNSwgXCJ6b29tWFwiOiAwLjAzOCwgXCJ6b29tWVwiOiAwLjAzOCwgXCJyb3RhdGlvblwiOiAwLjA5NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wMTYucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBBcnJhbiBRdWF5LCBRdWVlbiBTdHJlZXQgRGF0ZToxNzkwXCIsXG5cdFx0XCJkYXRlXCI6IDE3OTAsXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDE3XCIsIFwieFwiOiAtNTY0LCBcInlcIjogNDQwLCBcInpvb21YXCI6IDAuMDY4LCBcInpvb21ZXCI6IDAuMDYsIFwicm90YXRpb25cIjogMy4zOSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wMTcucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJBcnJhbiBRdWF5LCBDaHVyY2ggU3RyZWV0XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMThcIiwgXCJ4XCI6IC0xOTQsIFwieVwiOiAtMzk1LjUsIFwiem9vbVhcIjogMC4xMiwgXCJ6b29tWVwiOiAwLjEyLCBcInJvdGF0aW9uXCI6IC0wLjYzLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTAxOC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiBCYXJsZXkgZmllbGRzIGV0Yy4gKERvcnNldCBTdHJlZXQpLiBQbGFuIG9mIG9wZW5pbmcgYSBzdHJlZXQgZnJvbSBSdXRsYW5kIFNxdWFyZSB0byBEb3JzZXQgU3RyZWV0IC0gKFBhbGFjZSBSb3cgYW5kIEdhcmRpbmVycyBSb3cpIC0gVGhvbWFzIFNoZXJyYXJkIERhdGU6IDE3ODlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAyNVwiLCBcInhcIjogLTEwMTAsIFwieVwiOiAxMDUsIFwiem9vbVhcIjogMC4xMiwgXCJ6b29tWVwiOiAwLjEyLCBcInJvdGF0aW9uXCI6IDAuMTYsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDI1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQmxhY2toYWxsIFBsYWNlIC0gTmV3IFN0cmVldCB0byB0aGUgUXVheVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDU3XCIsIFwieFwiOiAtMjI0LCBcInlcIjogMzMwLjUsIFwiem9vbVhcIjogMC4wODQsIFwiem9vbVlcIjogMC4wODQsIFwicm90YXRpb25cIjogMi44NjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDU3LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBvZiBzdHJlZXRzIGFib3V0IE1hcnnigJlzIEFiYmV5IGFuZCBCb290IExhbmUgLSAoT2xkIEJhbmspIERhdGU6IDE4MTFcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MTFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNjNcIiwgXCJ4XCI6IC04OC41LCBcInlcIjogMjYuNSwgXCJ6b29tWFwiOiAwLjMsIFwiem9vbVlcIjogMC4zLCBcInJvdGF0aW9uXCI6IC0yLjE0NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wNjMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJFbGV2YXRpb24gb2YgdGhlIHdlc3QgZnJvbnQgYW5kIHBsYW4gb2YgTW91bnRqb3kgU3F1YXJlIGxhaWQgb3V0IG9uIHRoZSByaXNpbmcgZ3JvdW5kLCBuZWFyIEdlb3JnZeKAmXMgQ2h1cmNoIC0gdGhlIGVzdGF0ZSBvZiB0aGUgUmlnaHQgSG9uLiBMdWtlIEdhcmRpbmVyLCBhbmQgbm93ICgxNzg3KSwgdG8gYmUgbGV0IGZvciBidWlsZGluZyAtIExvcmQgTW91bnRqb3nigJlzIHBsYW4uIERhdGU6IDE3ODdcIiwgXG5cdFx0XCJkYXRlXCI6IDE3ODdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wODctMlwiLCBcInhcIjogLTE3Mi41LCBcInlcIjogMTQxOSwgXCJ6b29tWFwiOiAwLjA4NiwgXCJ6b29tWVwiOiAwLjA4NiwgXCJyb3RhdGlvblwiOiAtMS42OTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDg3LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDYW1kZW4gU3RyZWV0IFVwcGVyIGFuZCBDaGFybG90dGUgU3RyZWV0IERhdGU6IDE4NDFcIiwgXG5cdFx0XCJkYXRlXCI6IDE4NDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wOTBcIiwgXCJ4XCI6IC0yNjEsIFwieVwiOiA1MDUsIFwiem9vbVhcIjogMC4wNzQsIFwiem9vbVlcIjogMC4wNjYsIFwicm90YXRpb25cIjogLTAuMjMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDkwLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQ2FzdGxlIFlhcmQsIENhc3RsZSBTdHJlZXQsIERhbWUgU3RyZWV0LCBQYXJsaWFtZW50IFN0cmVldCBhbmQgdmljaW5pdHkgRGF0ZTogMTc2NFwiLCBcblx0XHRcImRhdGVcIjogMTc2NFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTEwMC0yXCIsIFwieFwiOiAtNTI4LCBcInlcIjogNDY0LCBcInpvb21YXCI6IDAuMDc4LCBcInpvb21ZXCI6IDAuMDc4LCBcInJvdGF0aW9uXCI6IC0wLjI3LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTEwMC0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHByZW1pc2VzIHRvIGJlIHZhbHVlZCBieSBKdXJ5OyBDb2NrIEhpbGwsIE1pY2hhZWzigJlzIExhbmUsIFdpbmV0YXZlcm4gU3RyZWV0LCBKb2hu4oCZcyBMYW5lLCBDaHJpc3RjaHVyY2gsIFBhdHJpY2sgU3RyZWV0IGFuZCBQYXRyaWNr4oCZcyBDbG9zZSBEYXRlOiAxODEzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODEzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTAzXCIsIFwieFwiOiA5OS41LCBcInlcIjogNTY2LCBcInpvb21YXCI6IDAuMDYyLCBcInpvb21ZXCI6IDAuMDYsIFwicm90YXRpb25cIjogLTMuMTU1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTEwMy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBTb3V0aCBTaWRlIG9mIENvbGxlZ2UgR3JlZW4gYW5kIHZpY2luaXR5IERhdGU6IDE4MDhcIixcblx0XHRcImRhdGVcIjogMTgwOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE0OS0xXCIsIFwieFwiOiAtMTA5MSwgXCJ5XCI6IDUxNS41LCBcInpvb21YXCI6IDAuMDYyLCBcInpvb21ZXCI6IDAuMDYsIFwicm90YXRpb25cIjogMCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xNDktMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCAtIEphbWVz4oCZcyBHYXRlLCBKYW1lcyBTdHJlZXQsIFRob21hcyBTdHJlZXQgYW5kIFdhdGxpbmcgU3RyZWV0LiBNci4gR3Vpbm5lc3PigJlzIFBsYWNlIERhdGU6IDE4NDVcIiwgXG5cdFx0XCJkYXRlXCI6IDE4NDVcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNDktMlwiLCBcInhcIjogLTEwNzQuNSwgXCJ5XCI6IDQ4OCwgXCJ6b29tWFwiOiAwLjA0NCwgXCJ6b29tWVwiOiAwLjA0OCwgXCJyb3RhdGlvblwiOiAwLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE0OS0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gSmFtZXPigJlzIEdhdGUsIEphbWVzIFN0cmVldCwgVGhvbWFzIFN0cmVldCBhbmQgV2F0bGluZyBTdHJlZXQuIE1yLiBHdWlubmVzc+KAmXMgUGxhY2UgRGF0ZTogMTg0NVwiLCBcblx0XHRcImRhdGVcIjogMTg0NVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTI1NFwiLCBcInhcIjogLTQzOCwgXCJ5XCI6IC0xNDIsIFwiem9vbVhcIjogMC4xMTgsIFwiem9vbVlcIjogMC4xMiwgXCJyb3RhdGlvblwiOiAtMC40MTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjU0LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIE1hYmJvdCBTdHJlZXQsIE1vbnRnb21lcnkgU3RyZWV0LCBEb21pbmljayBTdHJlZXQsIENoZXJyeSBMYW5lLCBDcm9zcyBMYW5lIGFuZCBUdXJuLWFnYWluLUxhbmUgRGF0ZTogMTgwMVwiLFxuXHRcdFwiZGF0ZVwiOiAxODAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTA2LTFcIiwgXCJ4XCI6IC03NTcsIFwieVwiOiA0OTUuNSwgXCJ6b29tWFwiOiAwLjI2NSwgXCJ6b29tWVwiOiAwLjI2NSwgXCJyb3RhdGlvblwiOiAtMC4wNzQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0xMDYtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgc2hvd2luZyBwcm9wb3NlZCBpbXByb3ZlbWVudHMgdG8gYmUgbWFkZSBpbiBDb3JubWFya2V0LCBDdXRwdXJzZSBSb3csIExhbWIgQWxsZXkgLSBGcmFuY2lzIFN0cmVldCAtIGFuZCBhbiBpbXByb3ZlZCBlbnRyYW5jZSBmcm9tIEtldmluIFN0cmVldCB0byBTYWludCBQYXRyaWNr4oCZcyBDYXRoZWRyYWwsIHRocm91Z2ggTWl0cmUgQWxsZXkgYW5kIGF0IEphbWVz4oCZcyBHYXRlLiBEYXRlOiAxODQ1LTQ2IFwiLFxuXHRcdFwiZGF0ZVwiOiAxODQ1XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTQ2LTFcIiwgXCJ4XCI6IC02ODMsIFwieVwiOiA0NzEsIFwiem9vbVhcIjogMC4wODIsIFwiem9vbVlcIjogMC4wODIsIFwicm90YXRpb25cIjogLTAuMSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE0Ni0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIGFuZCB0cmFjaW5nIG9mIHByZW1pc2VzIGluIENvcm5tYXJrZXQsIEN1dHB1cnNlIFJvdyBhbmQgdmljaW5pdHkgRGF0ZTogMTg0OVwiLFxuXHRcdFwiZGF0ZVwiOiAxODQ5XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNjAwXCIsIFwieFwiOiAxMzkuNSwgXCJ5XCI6IDc1OCwgXCJ6b29tWFwiOiAwLjA2MiwgXCJ6b29tWVwiOiAwLjA2MiwgXCJyb3RhdGlvblwiOiAtMC40MTUsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy02MDAucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC45LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgdGhlIGdyb3VuZCBldGMuLCBvZiB0aGUgTWFuc2lvbiBIb3VzZSwgRGF3c29uIFN0cmVldCBEYXRlOiAxNzgxXCIsXG5cdFx0XCJkYXRlXCI6IDE3ODFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zNDhcIiwgXCJ4XCI6IC0xMzQ1LjUsIFwieVwiOiA0OTMsIFwiem9vbVhcIjogMC40LCBcInpvb21ZXCI6IDAuNDc4LCBcInJvdGF0aW9uXCI6IC0wLjA3NSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM0OC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjYsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwYXJ0IG9mIHRoZSBDaXR5IG9mIER1YmxpbiBuZWFyIHRoZSBHcmFuZCBDYW5hbCAtIHNob3dpbmcgaW1wcm92ZW1lbnRzIGFuZCBhcHByb2FjaGVzIG1hZGUsIGFuZCB0aG9zZSBwcm9wb3NlZCB0byBiZSBtYWRlOyBhbmQgdGhlIHNpdHVhdGlvbiBvZiB0aGUgZm9sbG93aW5nIHN0cmVldHMgdml6OiAtIEJhc29uIExhbmU7IENhbmFsIFBsYWNlOyBQb3J0bGFuZCBTdHJlZXQ7IFJhaW5zZm9yZCBTdHJlZXQ7IENyYW5lIExhbmU7IEJlbGx2aWV3OyBUaG9tYXMgQ291cnQ7IEhhbmJ1cnkgTGFuZTsgTWVhdGggUm93OyBNZWF0aCBTdHJlZXQ7IEVhcmwgU3RyZWV0IFdlc3Q7IFdhZ2dvbiBMYW5lOyBDcmF3bGV5YHMgWWFyZDsgUm9iZXJ0IFN0cmVldDsgTWFya2V0IFN0cmVldDsgQm9uZCBTdHJlZXQ7IENhbmFsIEJhbmssIE5ld3BvcnQgU3RyZWV0OyBNYXJyb3dib25lIExhbmUsIFN1bW1lciBTdHJlZXQ7IEJyYWl0aHdhaXRlIFN0cmVldDsgUGltYmxpY28sIFRyaXBvbG8gKHNpdGUgb2YgT2xkIENvdXJ0IEhvdXNlKSwgbmVhciBUaG9tYXMgQ291cnQ7IENvbGUgQWxsZXk7IFN3aWZ0cyBBbGxleTsgQ3Jvc3RpY2sgQWxsZXk7IEVsYm93IExhbmU7IFVwcGVyIENvb21iZSBhbmQgVGVudGVyJ3MgRmllbGRzIERhdGU6IDE3ODdcIixcblx0XHRcImRhdGVcIjogMTc4N1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQzMy0yXCIsIFwieFwiOiAtNTM2LjUsIFwieVwiOiA4NzAuNSwgXCJ6b29tWFwiOiAwLjA1OCwgXCJ6b29tWVwiOiAwLjA1OCwgXCJyb3RhdGlvblwiOiAtMC4wMSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQzMy0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gQ29vbWJlLCBGcmFuY2lzIFN0cmVldCwgTmV3IFJvdywgQ3Jvc3MgUG9kZGxlIChub3cgRGVhbiBTdHJlZXQpLCBUaHJlZS1TdG9uZS1BbGxleSAobm93IHRoZSBsb3dlciBlbmQgb2YgTmV3IFN0cmVldCksIFBhdHJpY2sgU3RyZWV0LCBQYXRyaWNr4oCZcyBDbG9zZSwgS2V2aW4gU3RyZWV0IGFuZCBNaXRyZSBBbGxleSBEYXRlOiAxODI0LTI4XCIsXG5cdFx0XCJkYXRlXCI6IDE4MjRcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNTlcIiwgXCJ4XCI6IC01MjcuNSwgXCJ5XCI6IC0xMTkuNSwgXCJ6b29tWFwiOiAwLjA3LCBcInpvb21ZXCI6IDAuMDcsIFwicm90YXRpb25cIjogLTAuMDgsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wNTkucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC45LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJHcm91bmQgcGxhbiBvZiBMaW5lbiBIYWxsXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yNzQtMVwiLCBcInhcIjogLTk0NC41LCBcInlcIjogMjk1LCBcInpvb21YXCI6IDAuMTY0LCBcInpvb21ZXCI6IDAuMTY0LCBcInJvdGF0aW9uXCI6IC0xLjYxLFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjc0LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC45LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgT3htYW50b3duIEdyZWVuLCBCb3dsaW5nIEdyZWVuLCBRdWVlbiBTdHJlZXQsIEtpbmcgU3RyZWV0LCBOZXcgQ2h1cmNoIFN0cmVldCwgQ2hhbm5lbCBSb3cgLSB3aXRoIGxvdCBudW1iZXJzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMjMtMVwiLCBcInhcIjogLTI4MCwgXCJ5XCI6IDM2LCBcInpvb21YXCI6IDAuMDcyLCBcInpvb21ZXCI6IDAuMDcyLCBcInJvdGF0aW9uXCI6IC0wLjQ0LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzIzLTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC45LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJXaWRvdyBBbG1zIEhvdXNlIGluIEdyZWF0IEJyaXRhaW4gU3RyZWV0IC0gY29ybmVyIG9mIEplcnZpcyBTdHJlZXQgYW5kIEdyZWF0IEJyaXRhaW4gU3RyZWV0IE5vdGU6IE5vdGljZSBvZiBob3VzZXMgYW5kIGdyb3VuZHMgdG8gYmUgc2V0LCAxODIyXCIsXG5cdFx0XCJkYXRlXCI6IDE4MjJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy01MjVcIiwgXCJ4XCI6IDEwOTEuNSwgXCJ5XCI6IDI1Mi41LCBcInpvb21YXCI6IDAuMzU0LCBcInpvb21ZXCI6IDAuMzU0LCBcInJvdGF0aW9uXCI6IDAuMTEsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy01MjUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC45LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgUmluZ3NlbmQsIGFuZCB2aWNpbml0eVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDk0LTRcIiwgXCJ4XCI6IC0xNTIuNSwgXCJ5XCI6IDU2NCwgXCJ6b29tWFwiOiAwLjA1OCwgXCJ6b29tWVwiOiAwLjA1OCwgXCJyb3RhdGlvblwiOiAtMy4zMDUsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wOTQtNC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjksXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNhc3RsZSBBbGxleSwgQ2FzdGxlIExhbmUsIERhbWUgU3RyZWV0IGFuZCBDb3JrIEhpbGwsIHRvIGJlIHNvbGQgYnkgdGhlIENvbW1pc3Npb25lcnMgb2YgV2lkZSBTdHJlZXRzLCAxNyBBcHJpbCAxNzY2LiBTaG93aW5nIGxvdCB0byBiZSByZXNlcnZlZCBvbiB3aGljaCBSb3lhbCBFeGNoYW5nZSwgbm93ICgxODk5KSB0aGUgQ2l0eSBIYWxsLCB3YXMgc3Vic2VxdWVudGx5IGJ1aWx0IC0gSm9uYXRoYW4gQmFya2VyXCIsXG5cdFx0XCJkYXRlXCI6IDE3NjZcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yMTktMVwiLCBcInhcIjogMjUzLjUsIFwieVwiOiA2MCwgXCJ6b29tWFwiOiAwLjAzNCwgXCJ6b29tWVwiOiAwLjAzNCwgXCJyb3RhdGlvblwiOiAtMC4zMjUsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yMTktMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjksXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiBhIGhvbGRpbmcgaW4gTG93ZXIgQWJiZXkgU3RyZWV0IG9yIG9uIHRoZSBOb3J0aCBTdHJhbmQgLSBiZWxvbmdpbmcgdG8gdGhlIFJlcHMuIG9mIEdyaWZmaXRoIExsb3lkIC0gc2hvd2luZyBMbG95ZOKAmXMgUm9wZSBXYWxrLCBHbGFzcyBIb3VzZTsgbGF0ZSBTaXIgQW5uZXNsZXkgU3Rld2FydOKAmXMgQmFydC4gaG9sZGluZyBEYXRlOiAxNzk3XCIsXG5cdFx0XCJkYXRlXCI6IDE3NDdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMThcIiwgXCJ4XCI6IDM5LCAgXCJ5XCI6IDU2Mi41LCBcInpvb21YXCI6IDAuMDcyLCBcInpvb21ZXCI6IDAuMDcyLCBcInJvdGF0aW9uXCI6IDMuMDg5LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTE4LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIERhbWUgU3RyZWV0LCBEYW1lIENvdXJ0LCBTb3V0aCBHcmVhdCBHZW9yZ2XigJlzIFN0cmVldCBhbmQgdmljaW5pdHlcIixcblx0XHRcImRhdGVcIjogMTc4NVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTEyMi0xXCIsIFwieFwiOiAzNjQsIFwieVwiOiAxMjcwLjUsIFwiem9vbVhcIjogMC4xNTQsIFwiem9vbVlcIjogMC4xNTQsIFwicm90YXRpb25cIjogMy4xNDQsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xMjItMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjksXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBhbmQgcGxhbiBvZiBwYXJ0IG9mIFN0ZXBoZW7igJlzIEdyZWVuLCBzaG93aW5nIHBvc2l0aW9uIG9mIGludGVuZGVkIG5ldyBzdHJlZXQgKEVhcmxzZm9ydCBUZXJyYWNlKVwiLFxuXHRcdFwiZGF0ZVwiOiAxNzg1XG5cdH1cbl1cbiIsImltcG9ydCB7IEluZGV4ZXIgfSBmcm9tIFwiLi9pbmRleGVyXCI7XG5pbXBvcnQgeyBHcmlkSW5kZXhlciB9IGZyb20gXCIuL2dyaWRpbmRleGVyXCI7XG5pbXBvcnQgeyBDYW52YXNMYXllciB9IGZyb20gXCIuLi9ncmFwaGljcy9sYXllclwiO1xuaW1wb3J0IHsgQ29udGFpbmVyTGF5ZXIgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvY29udGFpbmVybGF5ZXJcIjtcblxuZXhwb3J0IGNsYXNzIENvbnRhaW5lckluZGV4IGltcGxlbWVudHMgSW5kZXhlciB7XG5cblx0Y29uc3RydWN0b3IoXG5cdCAgcmVhZG9ubHkgY29udGFpbmVyOiBDb250YWluZXJMYXllciwgXG5cdCAgcmVhZG9ubHkgbmFtZTogc3RyaW5nLFxuXHQgIHJlYWRvbmx5IGluZGV4ZXI6IEluZGV4ZXIgPSBuZXcgR3JpZEluZGV4ZXIoMjU2KSl7XG5cdFx0Zm9yIChsZXQgbGF5ZXIgb2YgY29udGFpbmVyLmxheWVycygpKXtcblx0XHRcdHRoaXMuYWRkKGxheWVyKTtcblx0XHR9XG5cdH1cblxuXHRnZXRMYXllcnMoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBBcnJheTxDYW52YXNMYXllcj57XG5cdFx0aWYgKHRoaXMuY29udGFpbmVyLmlzVmlzaWJsZSgpKXtcblx0XHRcdGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiIGlzIHZpc2libGUgXCIpO1xuXHRcdFx0cmV0dXJuIHRoaXMuaW5kZXhlci5nZXRMYXllcnMoeCwgeSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0cmV0dXJuIFtdO1xuXHRcdH1cblx0fVxuXG5cdGFkZChjYW52YXNMYXllcjogQ2FudmFzTGF5ZXIpOiB2b2lkIHtcblx0XHR0aGlzLmluZGV4ZXIuYWRkKGNhbnZhc0xheWVyKTtcblx0fVxuXG59IiwiaW1wb3J0IHsgQ2FudmFzTGF5ZXIgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvbGF5ZXJcIjtcbmltcG9ydCB7IENvbnNvbGVMb2dnZXIsIExvZ2dlciB9IGZyb20gXCIuLi9sb2dnaW5nL2xvZ2dlclwiO1xuaW1wb3J0IHsgSW5kZXhlciB9IGZyb20gXCIuL2luZGV4ZXJcIjtcblxuY2xhc3MgR3JpZE1hcCB7XG5cdHJlYWRvbmx5IGxheWVyTWFwOiBNYXA8c3RyaW5nLCBBcnJheTxDYW52YXNMYXllcj4+XG5cblx0Y29uc3RydWN0b3IoKXtcblx0XHR0aGlzLmxheWVyTWFwID0gbmV3IE1hcDxzdHJpbmcsIEFycmF5PENhbnZhc0xheWVyPj4oKTtcblx0fSBcblxuXHRhZGQoeDogbnVtYmVyLCB5OiBudW1iZXIsIGxheWVyOiBDYW52YXNMYXllcil7XG5cdFx0dmFyIGxheWVyVmFsdWVzOiBBcnJheTxDYW52YXNMYXllcj47XG5cdFx0aWYgKHRoaXMubGF5ZXJNYXAuaGFzKHRoaXMua2V5KHgsIHkpKSl7XG5cdFx0XHRsYXllclZhbHVlcyA9IHRoaXMubGF5ZXJNYXAuZ2V0KHRoaXMua2V5KHgsIHkpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bGF5ZXJWYWx1ZXMgPSBbXTtcblx0XHR9XG5cdFx0bGF5ZXJWYWx1ZXMucHVzaChsYXllcik7XG5cdFx0dGhpcy5sYXllck1hcC5zZXQodGhpcy5rZXkoeCwgeSksIGxheWVyVmFsdWVzKTtcblx0fVxuXG5cdGdldCh4OiBudW1iZXIsIHk6IG51bWJlcik6IEFycmF5PENhbnZhc0xheWVyPntcblx0XHRyZXR1cm4gdGhpcy5sYXllck1hcC5nZXQodGhpcy5rZXkoeCwgeSkpO1xuXHR9XG5cblx0aGFzKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXAuaGFzKHRoaXMua2V5KHgsIHkpKTtcblx0fVxuXG5cdHByaXZhdGUga2V5KHg6IG51bWJlciwgeTogbnVtYmVyKTogc3RyaW5nIHtcblx0XHRyZXR1cm4geCArIFwiX1wiICsgeTtcblx0fVxuXG59XG5cbmV4cG9ydCBjbGFzcyBHcmlkSW5kZXhlciBpbXBsZW1lbnRzIEluZGV4ZXIge1xuXG5cdHByaXZhdGUgbG9nZ2VyOiBMb2dnZXI7XG5cdHByaXZhdGUgY2FudmFzTWFwID0gbmV3IEdyaWRNYXAoKTtcblxuXHRjb25zdHJ1Y3RvcihyZWFkb25seSBncmlkV2lkdGg6IG51bWJlciwgXG5cdCAgcmVhZG9ubHkgZ3JpZEhlaWdodDogbnVtYmVyID0gZ3JpZFdpZHRoKXtcblx0XHR0aGlzLmxvZ2dlciA9IG5ldyBDb25zb2xlTG9nZ2VyKCk7XG5cdH1cblxuXHRzZXRMb2dnZXIobG9nZ2VyOiBMb2dnZXIpOiB2b2lkIHtcblx0XHR0aGlzLmxvZ2dlciA9IGxvZ2dlcjtcblx0fVxuXG5cdGdldExheWVycyh4OiBudW1iZXIsIHk6IG51bWJlcik6IEFycmF5PENhbnZhc0xheWVyPiB7XG5cdFx0bGV0IGdyaWRYID0gTWF0aC5mbG9vcih4IC8gdGhpcy5ncmlkV2lkdGgpO1xuXHRcdGxldCBncmlkWSA9IE1hdGguZmxvb3IoeSAvIHRoaXMuZ3JpZEhlaWdodCk7XG5cblx0XHR0aGlzLmxvZ2dlci5sb2coXCJncmlkIHh5IFwiICsgZ3JpZFggKyBcIiwgXCIgKyBncmlkWSk7XG5cblx0XHRpZiAodGhpcy5jYW52YXNNYXAuaGFzKGdyaWRYLCBncmlkWSkpe1xuXHRcdFx0cmV0dXJuIHRoaXMuY2FudmFzTWFwLmdldChncmlkWCwgZ3JpZFkpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHJldHVybiBbXTtcblx0XHR9XG5cdH1cblxuXHRhZGQoY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyKXtcblxuXHRcdGxldCBkaW1lbnNpb24gPSBjYW52YXNMYXllci5nZXREaW1lbnNpb24oKTtcblxuXHRcdGxldCB4TWluID0gTWF0aC5mbG9vcihkaW1lbnNpb24ueCAvIHRoaXMuZ3JpZFdpZHRoKTtcblx0XHRsZXQgeE1heCA9IE1hdGguZmxvb3IoKGRpbWVuc2lvbi54ICsgZGltZW5zaW9uLncpIC8gdGhpcy5ncmlkV2lkdGgpO1xuXG5cdFx0bGV0IHlNaW4gPSBNYXRoLmZsb29yKGRpbWVuc2lvbi55IC8gdGhpcy5ncmlkSGVpZ2h0KTtcblx0XHRsZXQgeU1heCA9IE1hdGguZmxvb3IoKGRpbWVuc2lvbi55ICsgZGltZW5zaW9uLmgpIC8gdGhpcy5ncmlkSGVpZ2h0KTtcblxuXHRcdGZvciAodmFyIHggPSB4TWluOyB4PD14TWF4OyB4Kyspe1xuXHRcdFx0Zm9yICh2YXIgeSA9IHlNaW47IHk8PXlNYXg7IHkrKyl7XG5cdFx0XHRcdHRoaXMuY2FudmFzTWFwLmFkZCh4LCB5LCBjYW52YXNMYXllcik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0c2hvd0luZGljZXMoY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyKTogdm9pZCB7XG5cblx0XHRsZXQgZGltZW5zaW9uID0gY2FudmFzTGF5ZXIuZ2V0RGltZW5zaW9uKCk7XG5cblx0XHRsZXQgeE1pbiA9IE1hdGguZmxvb3IoZGltZW5zaW9uLnggLyB0aGlzLmdyaWRXaWR0aCk7XG5cdFx0bGV0IHhNYXggPSBNYXRoLmZsb29yKChkaW1lbnNpb24ueCArIGRpbWVuc2lvbi53KSAvIHRoaXMuZ3JpZFdpZHRoKTtcblxuXHRcdGxldCB5TWluID0gTWF0aC5mbG9vcihkaW1lbnNpb24ueSAvIHRoaXMuZ3JpZEhlaWdodCk7XG5cdFx0bGV0IHlNYXggPSBNYXRoLmZsb29yKChkaW1lbnNpb24ueSArIGRpbWVuc2lvbi5oKSAvIHRoaXMuZ3JpZEhlaWdodCk7XG5cblx0XHR2YXIgbWVzc2FnZSA9IFwiZ3JpZDogW1wiXG5cblx0XHRmb3IgKHZhciB4ID0geE1pbjsgeDw9eE1heDsgeCsrKXtcblx0XHRcdGZvciAodmFyIHkgPSB5TWluOyB5PD15TWF4OyB5Kyspe1xuXHRcdFx0XHRtZXNzYWdlID0gbWVzc2FnZSArIFwiW1wiICsgeCArIFwiLCBcIiArIHkgKyBcIl1cIjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRtZXNzYWdlID0gbWVzc2FnZSArIFwiXVwiO1xuXG5cdFx0dGhpcy5sb2dnZXIubG9nKG1lc3NhZ2UpO1xuXHR9XG59XG4iLCJpbXBvcnQgeyBDYW52YXNFbGVtZW50IH0gZnJvbSBcIi4uL2dyYXBoaWNzL2xheWVyXCI7XG5pbXBvcnQgeyBDYW52YXNWaWV3IH0gZnJvbSBcIi4uL2dyYXBoaWNzL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IFRodW1iIH0gZnJvbSBcIi4uL2dyYXBoaWNzL3N0YXRpY1wiO1xuaW1wb3J0IHsgSW1hZ2VDb250cm9sbGVyIH0gZnJvbSBcIi4vaW1hZ2Vjb250cm9sbGVyXCI7XG5cbmV4cG9ydCBjbGFzcyBDYW52YXNMYXllclZpZXcge1xuXG5cdHJlYWRvbmx5IGNvbnRhaW5lcjogSFRNTFNwYW5FbGVtZW50O1xuXG5cdGNvbnN0cnVjdG9yKFxuXHQgIGxheWVyOiBDYW52YXNFbGVtZW50LCBcblx0ICBjYW52YXNWaWV3OiBDYW52YXNWaWV3LCBcblx0ICBpbWFnZUNvbnRyb2xsZXI6IEltYWdlQ29udHJvbGxlclxuXHQpe1xuXG5cdFx0dGhpcy5jb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcblx0XHR0aGlzLmNvbnRhaW5lci5jbGFzc05hbWUgPSBcImxheWVyXCI7XG5cblx0XHRsZXQgZWRpdGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuXG5cdFx0bGV0IGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG5cdFx0bGFiZWwuaW5uZXJIVE1MID0gbGF5ZXIubmFtZTtcblxuXHRcdGxldCB2aXNpYmlsaXR5OiBIVE1MSW5wdXRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuXHRcdHZpc2liaWxpdHkudHlwZSA9IFwiY2hlY2tib3hcIjtcblx0XHR2aXNpYmlsaXR5LmNoZWNrZWQgPSB0cnVlO1xuXG5cdFx0bGV0IGVkaXQ6IEhUTUxJbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG5cdFx0ZWRpdC50eXBlID0gXCJyYWRpb1wiO1xuXHRcdGVkaXQubmFtZSA9IFwiZWRpdFwiO1xuXG5cdFx0dmlzaWJpbGl0eS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRpZiAodGhpcy5jaGVja2VkKXtcblx0XHRcdFx0bGF5ZXIuc2V0VmlzaWJsZSh0cnVlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGxheWVyLnNldFZpc2libGUoZmFsc2UpO1xuXHRcdFx0fVxuXHRcdFx0Y2FudmFzVmlldy5kcmF3KCk7XG5cdFx0fSk7XG5cblx0XHRlZGl0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdGlmICh0aGlzLmNoZWNrZWQpe1xuXHRcdFx0XHRpbWFnZUNvbnRyb2xsZXIuc2V0Q2FudmFzRWxlbWVudChsYXllcik7XG5cdFx0XHR9IFxuXHRcdFx0Y2FudmFzVmlldy5kcmF3KCk7XG5cdFx0fSk7XG5cblx0XHR2YXIgdGh1bWIgPSA8VGh1bWI+IGxheWVyO1xuXG5cdFx0bGV0IGNhbnZhc0ltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcblx0XHRsZXQgdGh1bWJDdHggPSBjYW52YXNJbWFnZS5nZXRDb250ZXh0KFwiMmRcIik7XG5cdFx0dGh1bWIuZHJhd1RodW1iKHRodW1iQ3R4LCAyMDAsIDIwMCk7XG5cblx0XHRsZXQgdGh1bWJuYWlsOiBIVE1MSW1hZ2VFbGVtZW50ID0gbmV3IEltYWdlKCk7XG5cdFx0dGh1bWJuYWlsLnNyYyA9IGNhbnZhc0ltYWdlLnRvRGF0YVVSTCgpO1xuXHRcdHRodW1ibmFpbC5jbGFzc05hbWUgPSBcInRodW1ibmFpbFwiO1xuXHRcdHRodW1ibmFpbC50aXRsZSA9IGxheWVyLmRlc2NyaXB0aW9uO1xuXG5cdFx0ZWRpdGRpdi5hcHBlbmRDaGlsZChsYWJlbCk7XG5cdFx0ZWRpdGRpdi5hcHBlbmRDaGlsZCh2aXNpYmlsaXR5KTtcblx0XHRlZGl0ZGl2LmFwcGVuZENoaWxkKGVkaXQpO1xuXHRcdHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGVkaXRkaXYpO1xuXHRcdHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRodW1ibmFpbCk7XG5cdH1cblxufSIsImltcG9ydCB7IENhbnZhc1ZpZXcgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgQ2FudmFzRWxlbWVudCB9IGZyb20gXCIuLi9ncmFwaGljcy9sYXllclwiO1xuaW1wb3J0IHsgRWRpdE1hbmFnZXIgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvZWRpdG1hbmFnZXJcIjtcbmltcG9ydCB7IFBvaW50IH0gZnJvbSBcIi4uL2dyYXBoaWNzL3NoYXBlXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuaW1wb3J0IHsgTW91c2VDb250cm9sbGVyIH0gZnJvbSBcIi4vbW91c2Vjb250cm9sbGVyXCI7XG5pbXBvcnQgeyBJbmRleGVyIH0gZnJvbSBcIi4uL2luZGV4L2luZGV4ZXJcIjtcbmltcG9ydCB7IFZpZXdUcmFuc2Zvcm0gfSBmcm9tIFwiLi4vZ3JhcGhpY3Mvdmlld1wiO1xuaW1wb3J0IHsgTG9nZ2VyLCBDb25zb2xlTG9nZ2VyIH0gZnJvbSBcIi4uL2xvZ2dpbmcvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IENhbnZhc0xheWVyVmlldyB9IGZyb20gXCIuL2NhbnZhc2xheWVydmlld1wiO1xuXG5leHBvcnQgY2xhc3MgRWRpdENvbnRyb2xsZXIgZXh0ZW5kcyBNb3VzZUNvbnRyb2xsZXIge1xuXG5cdHByaXZhdGUgbG9nZ2VyOiBMb2dnZXI7XG4gICAgcHJpdmF0ZSBkcmFnUG9zaXRpb246IFBvaW50MkQ7XG4gICAgcHJpdmF0ZSBkcmFnUG9pbnQ6IFBvaW50O1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICByZWFkb25seSBjYW52YXNWaWV3OiBDYW52YXNWaWV3LFxuICAgICAgcmVhZG9ubHkgZWRpdE1hbmFnZXI6IEVkaXRNYW5hZ2VyXG4gICAgKSB7XG4gICAgXHRzdXBlcigpO1xuXG4gICAgXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5jbGlja2VkKGUgYXMgTW91c2VFdmVudCkpO1xuXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIChlOiBFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLmRyYWdQb2ludCA9IHVuZGVmaW5lZCk7XG5cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCAoZTogRXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5kcmFnKGUgYXMgTW91c2VFdmVudCkpO1xuXG4gICAgXHR0aGlzLmxvZ2dlciA9IG5ldyBDb25zb2xlTG9nZ2VyKCk7XG4gICAgfVxuXG4gICAgc2V0TG9nZ2luZyhsb2dnZXI6IExvZ2dlcik6IHZvaWQge1xuICAgIFx0dGhpcy5sb2dnZXIgPSBsb2dnZXI7XG4gICAgfVxuXG4gICAgY2xpY2tlZChlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgXHR0aGlzLmRyYWdQb3NpdGlvbiA9IHRoaXMubW91c2VQb3NpdGlvbihlLCB0aGlzLmNhbnZhc1ZpZXcuY2FudmFzRWxlbWVudCk7XG5cbiAgICBcdGxldCB3b3JsZFBvaW50ID0gdGhpcy5jYW52YXNWaWV3LmdldEJhc2VQb2ludChcbiAgICBcdFx0dGhpcy5kcmFnUG9zaXRpb24pO1xuXG4gICAgICAgIGxldCBlZGl0UG9pbnQgPSB0aGlzLmVkaXRNYW5hZ2VyLmdldFBvaW50KHdvcmxkUG9pbnQueCwgd29ybGRQb2ludC55KTtcblxuICAgICAgICBpZiAoZWRpdFBvaW50ICE9IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZvdW5kIGVkaXQgcG9pbnQgXCIgKyBlZGl0UG9pbnQueCArIFwiLCBcIiArIGVkaXRQb2ludC55KTtcbiAgICAgICAgICAgIHRoaXMuZHJhZ1BvaW50ID0gZWRpdFBvaW50O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJub3QgYW4gZWRpdCBwb2ludCBcIik7XG4gICAgICAgICAgICB0aGlzLmVkaXRNYW5hZ2VyLmFkZFBvaW50KHdvcmxkUG9pbnQueCwgd29ybGRQb2ludC55KTtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmFnKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG5cbiAgICAgICAgaWYgKHRoaXMuZHJhZ1BvaW50ICE9IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICBsZXQgcG9pbnQgID0gdGhpcy5tb3VzZVBvc2l0aW9uKGV2ZW50LCB0aGlzLmNhbnZhc1ZpZXcuY2FudmFzRWxlbWVudCk7XG5cbiAgICAgICAgICAgIGxldCB4RGVsdGEgPSAocG9pbnQueCAtIHRoaXMuZHJhZ1Bvc2l0aW9uLngpIC8gdGhpcy5jYW52YXNWaWV3Lnpvb21YO1xuICAgICAgICAgICAgbGV0IHlEZWx0YSA9IChwb2ludC55IC0gdGhpcy5kcmFnUG9zaXRpb24ueSkgLyB0aGlzLmNhbnZhc1ZpZXcuem9vbVk7XG5cbiAgICAgICAgICAgIHRoaXMuZHJhZ1BvaW50LnggPSB0aGlzLmRyYWdQb2ludC54ICsgeERlbHRhO1xuICAgICAgICAgICAgdGhpcy5kcmFnUG9pbnQueSA9IHRoaXMuZHJhZ1BvaW50LnkgKyB5RGVsdGE7XG5cbiAgICAgICAgICAgIHRoaXMuZWRpdE1hbmFnZXIudXBkYXRlUG9pbnQodGhpcy5kcmFnUG9pbnQpO1xuXG4gICAgICAgICAgICB0aGlzLmRyYWdQb3NpdGlvbiA9IHBvaW50O1xuXG4gICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQge0NhbnZhc1ZpZXcsIERpc3BsYXlFbGVtZW50fSBmcm9tIFwiLi4vZ3JhcGhpY3MvY2FudmFzdmlld1wiO1xuaW1wb3J0IHtDYW52YXNFbGVtZW50fSBmcm9tIFwiLi4vZ3JhcGhpY3MvbGF5ZXJcIjtcbmltcG9ydCB7UmVjdExheWVyfSBmcm9tIFwiLi4vZ3JhcGhpY3Mvc3RhdGljXCI7XG5pbXBvcnQge0dyaWRJbmRleGVyfSBmcm9tIFwiLi4vaW5kZXgvZ3JpZGluZGV4ZXJcIjtcbmltcG9ydCB7RWxlbWVudExvZ2dlcn0gZnJvbSBcIi4uL2xvZ2dpbmcvbG9nZ2VyXCI7XG5cbmV4cG9ydCBjbGFzcyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3IoY2FudmFzVmlldzogQ2FudmFzVmlldywgcmVhZG9ubHkgZGlzcGxheUVsZW1lbnQ6IERpc3BsYXlFbGVtZW50LCAgcHVibGljIG1vZDogc3RyaW5nID0gXCJ2XCIpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZChjYW52YXNWaWV3LCBlICBhcyBLZXlib2FyZEV2ZW50KSk7XG4gICAgfVxuXG4gICAgcHJlc3NlZChjYW52YXNWaWV3OiBDYW52YXNWaWV3LCBldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICBcbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgIGNhc2UgdGhpcy5tb2Q6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0b2dnbGUgdmlzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlFbGVtZW50LnNldFZpc2libGUoIXRoaXMuZGlzcGxheUVsZW1lbnQuaXNWaXNpYmxlKCkpO1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VDb250cm9sbGVyIHtcblxuICAgIHByaXZhdGUgY2FudmFzRWxlbWVudDogQ2FudmFzRWxlbWVudDtcbiAgICBwcml2YXRlIGxheWVyT3V0bGluZTogUmVjdExheWVyO1xuICAgIHByaXZhdGUgZWRpdEluZm9QYW5lOiBIVE1MRWxlbWVudDtcblxuICAgIHByaXZhdGUgaW5kZXhlcjogR3JpZEluZGV4ZXIgPSBuZXcgR3JpZEluZGV4ZXIoMjU2KTtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgY2FudmFzVmlldzogQ2FudmFzVmlldywgY2FudmFzRWxlbWVudDogQ2FudmFzRWxlbWVudCkge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5wcmVzc2VkKGNhbnZhc1ZpZXcsIGUgIGFzIEtleWJvYXJkRXZlbnQpKTtcbiAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50ID0gY2FudmFzRWxlbWVudDtcbiAgICB9XG5cbiAgICBzZXRDYW52YXNFbGVtZW50KENhbnZhc0VsZW1lbnQ6IENhbnZhc0VsZW1lbnQpe1xuICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQgPSBDYW52YXNFbGVtZW50O1xuXG4gICAgICAgIHRoaXMuaW5kZXhlci5zaG93SW5kaWNlcyhDYW52YXNFbGVtZW50KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKHRoaXMuY2FudmFzVmlldyk7XG4gICAgfVxuXG4gICAgc2V0RWRpdEluZm9QYW5lKGVkaXRJbmZvUGFuZTogSFRNTEVsZW1lbnQpe1xuICAgICAgICB0aGlzLmVkaXRJbmZvUGFuZSA9IGVkaXRJbmZvUGFuZTtcbiAgICB9XG5cbiAgICBzZXRMYXllck91dGxpbmUobGF5ZXJPdXRsaW5lOiBSZWN0TGF5ZXIpe1xuICAgICAgICB0aGlzLmxheWVyT3V0bGluZSA9IGxheWVyT3V0bGluZTtcbiAgICB9XG5cbiAgICBwcmVzc2VkKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicHJlc3NlZFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQua2V5KTtcblxuICAgICAgICBsZXQgbXVsdGlwbGllciA9IDE7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgIGNhc2UgXCJhXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LnggPSB0aGlzLmNhbnZhc0VsZW1lbnQueCAtIDAuNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiQVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC54ID0gdGhpcy5jYW52YXNFbGVtZW50LnggLSA1ICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJkXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LnggPSB0aGlzLmNhbnZhc0VsZW1lbnQueCArIDAuNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiRFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC54ID0gdGhpcy5jYW52YXNFbGVtZW50LnggKyA1ICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJ3XCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LnkgPSB0aGlzLmNhbnZhc0VsZW1lbnQueSAtIDAuNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiV1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC55ID0gdGhpcy5jYW52YXNFbGVtZW50LnkgLSA1ICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhazsgICAgXG4gICAgICAgICAgICBjYXNlIFwic1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC55ID0gdGhpcy5jYW52YXNFbGVtZW50LnkgKyAwLjUgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlNcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQueSA9IHRoaXMuY2FudmFzRWxlbWVudC55ICsgNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC5yb3RhdGlvbiA9IHRoaXMuY2FudmFzRWxlbWVudC5yb3RhdGlvbiAtIDAuMDA1O1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIkVcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQucm90YXRpb24gPSB0aGlzLmNhbnZhc0VsZW1lbnQucm90YXRpb24gLSAwLjA1O1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInFcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQucm90YXRpb24gPSB0aGlzLmNhbnZhc0VsZW1lbnQucm90YXRpb24gKyAwLjAwNTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJRXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LnJvdGF0aW9uID0gdGhpcy5jYW52YXNFbGVtZW50LnJvdGF0aW9uICsgMC4wNTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJ4XCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50Lnpvb21YID0gdGhpcy5jYW52YXNFbGVtZW50Lnpvb21YIC0gMC4wMDIgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlhcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQuem9vbVggPSB0aGlzLmNhbnZhc0VsZW1lbnQuem9vbVggKyAwLjAwMiAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwielwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC56b29tWSA9IHRoaXMuY2FudmFzRWxlbWVudC56b29tWSAtIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJaXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50Lnpvb21ZID0gdGhpcy5jYW52YXNFbGVtZW50Lnpvb21ZICsgMC4wMDIgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImNcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQuc2V0VmlzaWJsZSghdGhpcy5jYW52YXNFbGVtZW50LnZpc2libGUpO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQub3BhY2l0eSA9IE1hdGgubWluKDEuMCwgdGhpcy5jYW52YXNFbGVtZW50Lm9wYWNpdHkgKyAwLjEpO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQub3BhY2l0eSA9IE1hdGgubWF4KDAsIHRoaXMuY2FudmFzRWxlbWVudC5vcGFjaXR5IC0gMC4xKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8gY29kZS4uLlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGluZm86IHN0cmluZyA9ICdcIm5hbWVcIjogJyArIHRoaXMuY2FudmFzRWxlbWVudC5uYW1lICtcbiAgICAgICAgICAgICAgJyBcInhcIjogJyArIHRoaXMuY2FudmFzRWxlbWVudC54ICtcbiAgICAgICAgICAgICAgJywgXCJ5XCI6ICcgKyB0aGlzLmNhbnZhc0VsZW1lbnQueSArXG4gICAgICAgICAgICAgICcsIFwiem9vbVhcIjogJysgdGhpcy5jYW52YXNFbGVtZW50Lnpvb21YICsgXG4gICAgICAgICAgICAgICcsIFwiem9vbVlcIjogJyArIHRoaXMuY2FudmFzRWxlbWVudC56b29tWSArIFxuICAgICAgICAgICAgICAnLCBcInJvdGF0aW9uXCI6ICcrIHRoaXMuY2FudmFzRWxlbWVudC5yb3RhdGlvbjtcblxuICAgICAgICBpZiAodGhpcy5lZGl0SW5mb1BhbmUgIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHRoaXMuZWRpdEluZm9QYW5lLmlubmVySFRNTCA9IGluZm87XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhpbmZvKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB1cGRhdGVDYW52YXMoY2FudmFzVmlldzogQ2FudmFzVmlldykge1xuXG4gICAgICAgIGlmICh0aGlzLmxheWVyT3V0bGluZSAhPSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgbGV0IG5ld0RpbWVuc2lvbiA9IHRoaXMuY2FudmFzRWxlbWVudC5nZXREaW1lbnNpb24oKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJpbWFnZSBvdXRsaW5lIFwiICsgbmV3RGltZW5zaW9uKTtcbiAgICAgICAgICAgIHRoaXMubGF5ZXJPdXRsaW5lLnVwZGF0ZURpbWVuc2lvbihuZXdEaW1lbnNpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgfVxuXG59OyIsImltcG9ydCB7IENhbnZhc1ZpZXcgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgQ2FudmFzRWxlbWVudCB9IGZyb20gXCIuLi9ncmFwaGljcy9sYXllclwiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcbmltcG9ydCB7IE1vdXNlQ29udHJvbGxlciB9IGZyb20gXCIuL21vdXNlY29udHJvbGxlclwiO1xuaW1wb3J0IHsgSW5kZXhlciB9IGZyb20gXCIuLi9pbmRleC9pbmRleGVyXCI7XG5pbXBvcnQgeyBMb2dnZXIsIENvbnNvbGVMb2dnZXIgfSBmcm9tIFwiLi4vbG9nZ2luZy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgSW1hZ2VDb250cm9sbGVyIH0gZnJvbSBcIi4vaW1hZ2Vjb250cm9sbGVyXCI7XG5pbXBvcnQgeyBJbmRleFZpZXcgfSBmcm9tIFwiLi9pbmRleHZpZXdcIjtcbmltcG9ydCB7IENhbnZhc0xheWVyVmlldyB9IGZyb20gXCIuL2NhbnZhc2xheWVydmlld1wiO1xuXG5leHBvcnQgY2xhc3MgSW5kZXhDb250cm9sbGVyIGV4dGVuZHMgTW91c2VDb250cm9sbGVyIHtcblxuXHRwcml2YXRlIGxvZ2dlcjogTG9nZ2VyO1xuXHRwcml2YXRlIGluZGV4ZXJzOiBBcnJheTxJbmRleGVyPjtcblx0cHJpdmF0ZSBtZW51OiBIVE1MRWxlbWVudDtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgcmVhZG9ubHkgY2FudmFzVmlldzogQ2FudmFzVmlldyxcbiAgICAgIHJlYWRvbmx5IGltYWdlQ29udHJvbGxlcjogSW1hZ2VDb250cm9sbGVyXG4gICAgKSB7XG4gICAgXHRzdXBlcigpO1xuXG4gICAgXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmNsaWNrZWQoZSAgYXMgTW91c2VFdmVudCkpO1xuXG4gICAgXHR0aGlzLmluZGV4ZXJzID0gW107XG4gICAgXHR0aGlzLmxvZ2dlciA9IG5ldyBDb25zb2xlTG9nZ2VyKCk7XG4gICAgfVxuXG4gICAgc2V0TG9nZ2luZyhsb2dnZXI6IExvZ2dlcil7XG4gICAgXHR0aGlzLmxvZ2dlciA9IGxvZ2dlcjtcbiAgICB9XG5cbiAgICBzZXRNZW51KG1lbnU6IEhUTUxFbGVtZW50KXtcbiAgICBcdHRoaXMubWVudSA9IG1lbnU7XG4gICAgfVxuXG4gICAgYWRkSW5kZXhlcihpbmRleGVyOiBJbmRleGVyKXtcbiAgICBcdHRoaXMuaW5kZXhlcnMucHVzaChpbmRleGVyKTtcbiAgICB9XG5cbiAgICBjbGlja2VkKGU6IE1vdXNlRXZlbnQpe1xuICAgIFx0bGV0IHBvaW50ID0gdGhpcy5tb3VzZVBvc2l0aW9uKGUsIHRoaXMuY2FudmFzVmlldy5jYW52YXNFbGVtZW50KTtcblxuICAgIFx0bGV0IHdvcmxkUG9pbnQgPSB0aGlzLmNhbnZhc1ZpZXcuZ2V0QmFzZVBvaW50KFxuICAgIFx0XHRuZXcgUG9pbnQyRChwb2ludC54LCBwb2ludC55KSk7XG5cbiAgICBcdHZhciBsYXllcnM6IEFycmF5PENhbnZhc0VsZW1lbnQ+ID0gW107XG5cbiAgICBcdGZvciAobGV0IGluZGV4ZXIgb2YgdGhpcy5pbmRleGVycykge1xuICAgIFx0XHRsZXQgbmV3TGF5ZXJzID0gdGhpcy5maWx0ZXJWaXNpYmxlKFxuICAgIFx0XHRcdGluZGV4ZXIuZ2V0TGF5ZXJzKHdvcmxkUG9pbnQueCwgd29ybGRQb2ludC55KSk7XG4gICAgXHRcdGxheWVycyA9IGxheWVycy5jb25jYXQobmV3TGF5ZXJzKTtcbiAgICBcdH1cblxuICAgIFx0aWYgKHRoaXMubWVudSAhPSB1bmRlZmluZWQpe1xuICAgIFx0XHRsZXQgbGF5ZXJWaWV3ID0gbmV3IEluZGV4Vmlldyh0aGlzLm1lbnUsIHRoaXMuY2FudmFzVmlldywgXG4gICAgXHRcdFx0dGhpcy5pbWFnZUNvbnRyb2xsZXIpO1xuICAgIFx0XHRsYXllclZpZXcuc2V0RWxlbWVudHMobGF5ZXJzKTtcbiAgICBcdH1cbiAgICB9XG5cblx0cHJpdmF0ZSBmaWx0ZXJWaXNpYmxlKGxheWVyczogQXJyYXk8Q2FudmFzRWxlbWVudD4pe1xuXHRcdHJldHVybiBsYXllcnMuZmlsdGVyKGZ1bmN0aW9uKGxheWVyKSB7IFxuXHRcdFx0cmV0dXJuIGxheWVyLmlzVmlzaWJsZSgpO1xuXHRcdH0pO1xuXHR9XG5cbn0iLCJpbXBvcnQgeyBDYW52YXNFbGVtZW50IH0gZnJvbSBcIi4uL2dyYXBoaWNzL2xheWVyXCI7XG5pbXBvcnQgeyBDYW52YXNWaWV3IH0gZnJvbSBcIi4uL2dyYXBoaWNzL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IENhbnZhc0xheWVyVmlldyB9IGZyb20gXCIuL2NhbnZhc2xheWVydmlld1wiO1xuaW1wb3J0IHsgSW1hZ2VDb250cm9sbGVyIH0gZnJvbSBcIi4vaW1hZ2Vjb250cm9sbGVyXCI7XG5cbmV4cG9ydCBjbGFzcyBJbmRleFZpZXcge1xuXG5cdGNvbnN0cnVjdG9yKFxuXHQgIHJlYWRvbmx5IHZpZXdFbGVtZW50OiBIVE1MRWxlbWVudCwgXG5cdCAgcmVhZG9ubHkgY2FudmFzVmlldzogQ2FudmFzVmlldyxcblx0ICByZWFkb25seSBpbWFnZUNvbnRyb2xsZXI6IEltYWdlQ29udHJvbGxlclxuXHQpe31cblx0XG5cdHNldEVsZW1lbnRzKGNhbnZhc0VsZW1lbnRzOiBBcnJheTxDYW52YXNFbGVtZW50Pik6IHZvaWQge1xuXHRcdHRoaXMuY2xlYXIoKTtcblx0XHRcblx0XHRmb3IgKGxldCBjYW52YXNMYXllciBvZiBjYW52YXNFbGVtZW50cyl7XG5cdFx0XHRsZXQgbGF5ZXJWaWV3ID0gbmV3IENhbnZhc0xheWVyVmlldyhjYW52YXNMYXllciwgdGhpcy5jYW52YXNWaWV3LCBcblx0XHRcdFx0dGhpcy5pbWFnZUNvbnRyb2xsZXIpO1xuXHRcdFx0dGhpcy52aWV3RWxlbWVudC5hcHBlbmRDaGlsZChsYXllclZpZXcuY29udGFpbmVyKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGNsZWFyKCk6IGJvb2xlYW4ge1xuXHRcdGxldCBjaGlsZHJlbiA9IHRoaXMudmlld0VsZW1lbnQuY2hpbGRyZW47XG5cdFx0bGV0IGluaXRpYWxMZW5ndGggPSBjaGlsZHJlbi5sZW5ndGg7XG5cblx0XHR3aGlsZSAoY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuXHRcdFx0Y2hpbGRyZW5bMF0ucmVtb3ZlKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxufSIsImltcG9ydCB7IENvbnRhaW5lckxheWVyTWFuYWdlciB9IGZyb20gXCIuLi9ncmFwaGljcy9sYXllcm1hbmFnZXJcIjtcbmltcG9ydCB7IENhbnZhc1ZpZXcgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvY2FudmFzdmlld1wiO1xuXG5leHBvcnQgY2xhc3MgTGF5ZXJDb250cm9sbGVyIHtcblxuXHRwcml2YXRlIG1vZDogc3RyaW5nID0gXCJpXCI7XG5cblx0Y29uc3RydWN0b3IoY2FudmFzVmlldzogQ2FudmFzVmlldywgcmVhZG9ubHkgY29udGFpbmVyTGF5ZXJNYW5hZ2VyOiBDb250YWluZXJMYXllck1hbmFnZXIpe1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLnByZXNzZWQoY2FudmFzVmlldywgZSAgYXMgS2V5Ym9hcmRFdmVudCkpO1xuXHR9XG5cblx0cHJlc3NlZChjYW52YXNWaWV3OiBDYW52YXNWaWV3LCBldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICAgICAgICBjYXNlIHRoaXMubW9kOlxuICAgICAgICAgICAgICAgIHRoaXMuY29udGFpbmVyTGF5ZXJNYW5hZ2VyLnRvZ2dsZVZpc2liaWxpdHkoZmFsc2UpO1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTW91c2VDb250cm9sbGVyIHtcblxuICAgIG1vdXNlUG9zaXRpb24oZXZlbnQ6IE1vdXNlRXZlbnQsIHdpdGhpbjogSFRNTEVsZW1lbnQpOiBQb2ludDJEIHtcbiAgICAgICAgbGV0IG1fcG9zeCA9IGV2ZW50LmNsaWVudFggKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnRcbiAgICAgICAgICAgICAgICAgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdDtcbiAgICAgICAgbGV0IG1fcG9zeSA9IGV2ZW50LmNsaWVudFkgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7XG5cbiAgICAgICAgdmFyIGVfcG9zeCA9IDA7XG4gICAgICAgIHZhciBlX3Bvc3kgPSAwO1xuXG4gICAgICAgIGlmICh3aXRoaW4ub2Zmc2V0UGFyZW50KXtcbiAgICAgICAgICAgIGRvIHsgXG4gICAgICAgICAgICAgICAgZV9wb3N4ICs9IHdpdGhpbi5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgICAgIGVfcG9zeSArPSB3aXRoaW4ub2Zmc2V0VG9wO1xuICAgICAgICAgICAgfSB3aGlsZSAod2l0aGluID0gPEhUTUxFbGVtZW50PndpdGhpbi5vZmZzZXRQYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQb2ludDJEKG1fcG9zeCAtIGVfcG9zeCwgbV9wb3N5IC0gZV9wb3N5KTtcbiAgICB9XG5cbn1cbiIsImltcG9ydCB7IFZpZXdUcmFuc2Zvcm0gfSBmcm9tIFwiLi4vZ3JhcGhpY3Mvdmlld1wiO1xuaW1wb3J0IHsgQ2FudmFzVmlldyB9IGZyb20gXCIuLi9ncmFwaGljcy9jYW52YXN2aWV3XCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5pbXBvcnQgeyBNb3VzZUNvbnRyb2xsZXIgfSBmcm9tIFwiLi9tb3VzZWNvbnRyb2xsZXJcIjtcblxuZXhwb3J0IGNsYXNzIFZpZXdDb250cm9sbGVyIGV4dGVuZHMgTW91c2VDb250cm9sbGVyIHtcblxuXHRyZWNvcmQ6IGJvb2xlYW47XG5cdG1vdmU6IG51bWJlciA9IDE7XG5cblx0cHJpdmF0ZSB4UHJldmlvdXM6IG51bWJlcjtcblx0cHJpdmF0ZSB5UHJldmlvdXM6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3Rvcih2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtLCBcbiAgICAgICAgcmVhZG9ubHkgZHJhZ0VsZW1lbnQ6IEhUTUxFbGVtZW50LCByZWFkb25seSBjYW52YXNWaWV3OiBDYW52YXNWaWV3KSB7XG5cbiAgICBcdHN1cGVyKCk7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybSkpO1xuICAgIFx0ZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm0pKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybSkpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLnJlY29yZCA9IGZhbHNlKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5jbGlja2VkKGUgYXMgTW91c2VFdmVudCwgY2FudmFzVmlldywgMS4yKSk7XG4gICAgICAgIGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCAoZTogRXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy53aGVlbChlIGFzIFdoZWVsRXZlbnQsIGNhbnZhc1ZpZXcpKTtcbiAgICB9XG5cbiAgICBjbGlja2VkKGV2ZW50OiBNb3VzZUV2ZW50LCB2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtLCB6b29tQnk6IG51bWJlcil7XG4gICAgXHRzd2l0Y2goZXZlbnQudHlwZSl7XG4gICAgXHRcdGNhc2UgXCJkYmxjbGlja1wiOlxuICAgICAgICAgICAgICAgIC8vIGlmICAoZXZlbnQuY3RybEtleSkge1xuICAgICAgICAgICAgICAgIC8vICAgICB6b29tQnkgPSAxIC8gem9vbUJ5O1xuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBsZXQgbVhZID0gdGhpcy5tb3VzZVBvc2l0aW9uKGV2ZW50LCB0aGlzLmRyYWdFbGVtZW50KTtcblxuICAgICAgICAgICAgICAgIC8vIHRoaXMuY2FudmFzVmlldy56b29tQWJvdXQobVhZWzBdLCBtWFlbMV0sIHpvb21CeSk7XG5cbiAgICAgICAgICAgICAgICAvLyB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYWdnZWQoZXZlbnQ6IE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm06IFZpZXdUcmFuc2Zvcm0pIHtcblxuICAgLy8gIFx0c3dpdGNoKGV2ZW50LnR5cGUpe1xuICAgLy8gIFx0XHRjYXNlIFwibW91c2Vkb3duXCI6XG4gICAvLyAgXHRcdFx0dGhpcy5yZWNvcmQgPSB0cnVlO1xuICAgLy8gIFx0XHRcdGJyZWFrO1xuICAgLy8gIFx0XHRjYXNlIFwibW91c2V1cFwiOlxuICAgLy8gIFx0XHRcdHRoaXMucmVjb3JkID0gZmFsc2U7XG4gICAvLyAgXHRcdFx0YnJlYWs7XG4gICAvLyAgXHRcdGRlZmF1bHQ6XG4gICAvLyAgXHRcdFx0aWYgKHRoaXMucmVjb3JkKXtcbiAgIC8vICAgICAgICAgICAgICAgICAgbGV0IHhEZWx0YSA9IChldmVudC5jbGllbnRYIC0gdGhpcy54UHJldmlvdXMpIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWDtcbiAgIC8vICAgICAgICAgICAgICAgICAgbGV0IHlEZWx0YSA9IChldmVudC5jbGllbnRZIC0gdGhpcy55UHJldmlvdXMpIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWTtcblxuICAgLy8gICAgICAgICAgICAgICAgICB2aWV3VHJhbnNmb3JtLnggPSB2aWV3VHJhbnNmb3JtLnggLSB4RGVsdGE7XG4gICAvLyAgICAgICAgICAgICAgICAgIHZpZXdUcmFuc2Zvcm0ueSA9IHZpZXdUcmFuc2Zvcm0ueSAtIHlEZWx0YTtcblxuICAgLy8gICAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgLy8gIFx0XHRcdH1cblxuXHRcdFx0Ly8gdGhpcy54UHJldmlvdXMgPSBldmVudC5jbGllbnRYO1xuXHRcdFx0Ly8gdGhpcy55UHJldmlvdXMgPSBldmVudC5jbGllbnRZO1xuICAgLy8gIFx0fVxuICAgIH1cblxuICAgIHdoZWVsKGV2ZW50OiBXaGVlbEV2ZW50LCB2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtKSB7XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIndoZWVsXCIgKyBldmVudC50YXJnZXQgKyBcIiwgXCIgKyBldmVudC50eXBlKTtcblxuICAgICAgICBsZXQgeERlbHRhID0gZXZlbnQuZGVsdGFYIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWDtcbiAgICAgICAgbGV0IHlEZWx0YSA9IGV2ZW50LmRlbHRhWSAvIHRoaXMubW92ZSAvIHZpZXdUcmFuc2Zvcm0uem9vbVk7XG5cbiAgICAgICAgaWYgIChldmVudC5jdHJsS2V5KSB7XG4gICAgICAgICAgICBsZXQgbVhZOiBQb2ludDJEID0gdGhpcy5tb3VzZVBvc2l0aW9uKGV2ZW50LCB0aGlzLmRyYWdFbGVtZW50KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBieSA9IDEuMDU7XG4gICAgICAgICAgICBpZiAoeURlbHRhIDwgMCl7XG4gICAgICAgICAgICAgICAgYnkgPSAwLjk1O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuem9vbUFib3V0KG1YWS54LCBtWFkueSwgYnkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3LnggPSAgdGhpcy5jYW52YXNWaWV3LnggKyB4RGVsdGE7XG4gICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcueSA9ICB0aGlzLmNhbnZhc1ZpZXcueSArIHlEZWx0YTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5jYW52YXNWaWV3LmRyYXcoKTtcbiAgICB9XG5cbn1cbiIsImV4cG9ydCBpbnRlcmZhY2UgTG9nZ2VyIHtcblx0bG9nKGluZm86IHN0cmluZyk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50TG9nZ2VyIGltcGxlbWVudHMgTG9nZ2VyIHtcblxuXHRjb25zdHJ1Y3RvcihyZWFkb25seSBkaXNwbGF5RWxlbWVudDogSFRNTEVsZW1lbnQpe31cblxuXHRsb2coaW5mbzogc3RyaW5nKTogdm9pZCB7XG5cdFx0dGhpcy5kaXNwbGF5RWxlbWVudC5pbm5lclRleHQgPSBpbmZvO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNsYXNzIENvbnNvbGVMb2dnZXIgaW1wbGVtZW50cyBMb2dnZXIge1xuXG5cdGxvZyhpbmZvOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRjb25zb2xlLmxvZyhpbmZvKTtcblx0fVxuXG59IiwiaW1wb3J0IHsgQ2FudmFzVmlldyB9IGZyb20gXCIuL2dyYXBoaWNzL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IFN0YXRpY0ltYWdlIH0gZnJvbSBcIi4vZ3JhcGhpY3Mvc3RhdGljXCI7XG5pbXBvcnQgeyBDb250YWluZXJMYXllciB9IGZyb20gXCIuL2dyYXBoaWNzL2NvbnRhaW5lcmxheWVyXCI7XG5pbXBvcnQgeyBNdWx0aVJlc0xheWVyIH0gZnJvbSBcIi4vZ3JhcGhpY3MvbXVsdGlyZXNsYXllclwiO1xuaW1wb3J0IHsgQmFzaWNUcmFuc2Zvcm0gfSBmcm9tIFwiLi9ncmFwaGljcy92aWV3XCI7XG5pbXBvcnQgeyBTdGF0aWNHcmlkIH0gZnJvbSBcIi4vZ3JhcGhpY3MvZ3JpZFwiO1xuaW1wb3J0IHsgRGlzcGxheVJhbmdlIH0gZnJvbSBcIi4vZ3JhcGhpY3MvbXVsdGlyZXNsYXllclwiO1xuaW1wb3J0IHsgVGlsZUxheWVyLCBUaWxlU3RydWN0LCB6b29tQnlMZXZlbH0gZnJvbSBcIi4vZ3JhcGhpY3MvdGlsZWxheWVyXCI7XG5pbXBvcnQgeyBMYXllck1hbmFnZXIsIENvbnRhaW5lckxheWVyTWFuYWdlciwgZGF0ZUZpbHRlciwgZGF0ZWxlc3NGaWx0ZXIgfSBmcm9tIFxuICBcIi4vZ3JhcGhpY3MvbGF5ZXJtYW5hZ2VyXCI7XG5cbmltcG9ydCB7IEluZGV4Q29udHJvbGxlciB9IGZyb20gXCIuL2ludGVyZmFjZS9pbmRleGNvbnRyb2xsZXJcIjtcbmltcG9ydCB7IFZpZXdDb250cm9sbGVyIH0gZnJvbSBcIi4vaW50ZXJmYWNlL3ZpZXdjb250cm9sbGVyXCI7XG5pbXBvcnQgeyBJbWFnZUNvbnRyb2xsZXIsIERpc3BsYXlFbGVtZW50Q29udHJvbGxlciB9IGZyb20gXCIuL2ludGVyZmFjZS9pbWFnZWNvbnRyb2xsZXJcIjtcbmltcG9ydCB7IExheWVyQ29udHJvbGxlciB9IGZyb20gXCIuL2ludGVyZmFjZS9sYXllcmNvbnRyb2xsZXJcIjtcblxuaW1wb3J0IHsgR3JpZEluZGV4ZXIgfSBmcm9tIFwiLi9pbmRleC9ncmlkaW5kZXhlclwiO1xuaW1wb3J0IHsgQ29udGFpbmVySW5kZXggfSBmcm9tIFwiLi9pbmRleC9jb250YWluZXJpbmRleFwiO1xuaW1wb3J0IHsgRWxlbWVudExvZ2dlciB9IGZyb20gXCIuL2xvZ2dpbmcvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IFBvaW50LCBTaGFwZSwgYXJyYXlUb1BvaW50cyB9IGZyb20gXCIuL2dyYXBoaWNzL3NoYXBlXCI7XG5pbXBvcnQgeyBFZGl0TWFuYWdlciB9IGZyb20gXCIuL2dyYXBoaWNzL2VkaXRtYW5hZ2VyXCI7XG5cbmltcG9ydCB7IEVkaXRDb250cm9sbGVyIH0gZnJvbSBcIi4vaW50ZXJmYWNlL2VkaXRjb250cm9sbGVyXCI7XG5cbmltcG9ydCAqIGFzIGZpcmVtYXBzIGZyb20gXCIuL2ltYWdlZ3JvdXBzL2ZpcmVtYXBzLmpzb25cIjtcbmltcG9ydCAqIGFzIGxhbmRtYXJrcyBmcm9tIFwiLi9pbWFnZWdyb3Vwcy9sYW5kbWFya3MuanNvblwiO1xuaW1wb3J0ICogYXMgd3NjIGZyb20gXCIuL2ltYWdlZ3JvdXBzL3dzY2QuanNvblwiO1xuXG5sZXQgdGVzdFBvaW50cyA9IFtbMCwwXSwgWzQwMCwgMF0sIFs0MDAsIDQwMF0sIFswLCA0MDBdXTtcblxubGV0IHRlc3RTaGFwZSA9IG5ldyBTaGFwZShCYXNpY1RyYW5zZm9ybS51bml0VHJhbnNmb3JtLCAxLCB0cnVlLCBcIlwiLCBcIlwiKTtcbmxldCB0ZXN0UG9pbnQgPSBuZXcgUG9pbnQoODAwLCA4MDAsIDIwLCAxLCB0cnVlKTtcbnRlc3RTaGFwZS5wb2ludHMgPSBhcnJheVRvUG9pbnRzKHRlc3RQb2ludHMpO1xuXG5sZXQgZWRpdE1hbmFnZXIgPSBuZXcgRWRpdE1hbmFnZXIodGVzdFNoYXBlLCAxMik7XG4vL3Rlc3RTaGFwZS5maWxsID0gdHJ1ZTtcblxubGV0IGVhcmx5RGF0ZXMgPSBkYXRlRmlsdGVyKHdzYywgMTY4MCwgMTc5Mik7XG5sZXQgbWlkRGF0ZXMgPSBkYXRlRmlsdGVyKHdzYywgMTc5MywgMTgyMCk7XG5sZXQgbGF0ZURhdGVzID0gZGF0ZUZpbHRlcih3c2MsIDE4MjEsIDE5MDApO1xubGV0IG90aGVyRGF0ZXMgPSBkYXRlbGVzc0ZpbHRlcih3c2MpO1xuXG5sZXQgbGF5ZXJTdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgwLCAwLCAxLCAxLCAwKTtcbmxldCBpbWFnZUxheWVyID0gbmV3IENvbnRhaW5lckxheWVyKGxheWVyU3RhdGUpO1xuXG5sZXQgaW1hZ2VTdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtMTQ0MCwtMTQ0MCwgMC4yMjIsIDAuMjIyLCAwKTtcblxubGV0IGNvdW50eVN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0yNjMxLCAtMjA1MS41LCAxLjcxNiwgMS42NzQsIDApO1xubGV0IGNvdW50eUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKGNvdW50eVN0YXRlLCBcbiAgICBcImltYWdlcy9Db3VudHlfb2ZfdGhlX0NpdHlfb2ZfRHVibGluXzE4MzdfbWFwLnBuZ1wiLCAwLjUsIHRydWUsIFwiY291bnR5XCIpO1xuXG5sZXQgYmdTdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtMTEyNiwtMTA4NiwgMS41OCwgMS41NSwgMCk7XG5sZXQgYmdJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZShiZ1N0YXRlLCBcImltYWdlcy9mbXNzLmpwZWdcIiwgLjYsIHRydWUsIFwiZmlyZW1hcFwiKTtcblxubGV0IHRtU3RhdGUgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oLTEwMzMuNSwxNDksIDAuNTksIDAuNTksIDApO1xubGV0IHRtSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UodG1TdGF0ZSwgXCJpbWFnZXMvdGhpbmdtb3QucG5nXCIsIC4zLCB0cnVlLCBcInRoaW5nbW90XCIpO1xuXG5sZXQgZHVTdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtOTI5LC0xMDUuNSwgMC40NjQsIDAuNTA2LCAwKTtcbmxldCBkdUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKGR1U3RhdGUsIFwiaW1hZ2VzL2R1YmxpbjE2MTAuanBnXCIsIC42LCBmYWxzZSwgXCIxNjEwXCIpO1xuXG5sZXQgZ3JpZFRyYW5zZm9ybSA9IEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm07XG5cbmxldCBzdGF0aWNHcmlkID0gbmV3IFN0YXRpY0dyaWQoZ3JpZFRyYW5zZm9ybSwgMCwgZmFsc2UsIDI1NiwgMjU2KTtcblxubGV0IHNlbnRpbmVsU3RydWN0ID0gbmV3IFRpbGVTdHJ1Y3QoXCJxdGlsZS9kdWJsaW4vXCIsIFwiLnBuZ1wiLCBcImltYWdlcy9xdGlsZS9kdWJsaW4vXCIpO1xuXG5sZXQgc2VudGluZWxUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgMiwgMiwgMCk7XG5sZXQgZGlzcGxheUNsb3NlID0gbmV3IERpc3BsYXlSYW5nZSgwLjgsIDQpO1xuXG5sZXQgc2VudGluZWxMYXllciA9IG5ldyBUaWxlTGF5ZXIoc2VudGluZWxUcmFuc2Zvcm0sIHNlbnRpbmVsU3RydWN0LCB0cnVlLCBcbiAgICBcInNlbnRpbmVsXCIsIFxuICAgMTU4MTYsIDEwNjI0LCAxNSk7XG5cbmxldCBzZW50aW5lbEJUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgNCwgNCwgMCk7XG5sZXQgZGlzcGxheU1pZCA9IG5ldyBEaXNwbGF5UmFuZ2UoLjIsIDAuOCk7XG5sZXQgc2VudGluZWxCTGF5ZXIgPSBuZXcgVGlsZUxheWVyKHNlbnRpbmVsQlRyYW5zZm9ybSwgc2VudGluZWxTdHJ1Y3QsIHRydWUsIFxuICAgIFwic2VudGluZWxCXCIsIFxuICAgNzkwOCwgNTMxMiwgMTQpO1xuXG5sZXQgc2VudGluZWxDVHJhbnNmb3JtID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDgsIDgsIDApO1xubGV0IGRpc3BsYXlGYXIgPSBuZXcgRGlzcGxheVJhbmdlKC4wNCwgLjIpO1xubGV0IHNlbnRpbmVsU0xheWVyID0gbmV3IFRpbGVMYXllcihzZW50aW5lbENUcmFuc2Zvcm0sIHNlbnRpbmVsU3RydWN0LCB0cnVlLCBcbiAgICBcInNlbnRpbmVsQ1wiLCBcbiAgICAzOTU0LCAyNjU2LCAxMyk7XG5cbmxldCByZWNlbnRyZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtMTAyNCwgLTE1MzYsIDEsIDEsIDApO1xubGV0IHNlbnRpbmVsQ29udGFpbmVyTGF5ZXIgPSBuZXcgTXVsdGlSZXNMYXllcihyZWNlbnRyZSwgMSwgdHJ1ZSk7XG5zZW50aW5lbENvbnRhaW5lckxheWVyLnNldChkaXNwbGF5Q2xvc2UsIHNlbnRpbmVsTGF5ZXIpO1xuc2VudGluZWxDb250YWluZXJMYXllci5zZXQoZGlzcGxheU1pZCwgc2VudGluZWxCTGF5ZXIpO1xuc2VudGluZWxDb250YWluZXJMYXllci5zZXQoZGlzcGxheUZhciwgc2VudGluZWxTTGF5ZXIpO1xuXG5sZXQgZWRpdENvbnRhaW5lckxheWVyID0gbmV3IENvbnRhaW5lckxheWVyKEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0pO1xuXG5pbWFnZUxheWVyLnNldChcImNvdW50eVwiLCBjb3VudHlJbWFnZSk7XG5pbWFnZUxheWVyLnNldChcImJhY2tncm91bmRcIiwgYmdJbWFnZSk7XG5cbmxldCBsYXllck1hbmFnZXIgPSBuZXcgTGF5ZXJNYW5hZ2VyKCk7XG5cbmxldCBmaXJlbWFwTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkSW1hZ2VzKGZpcmVtYXBzLCBcImZpcmVtYXBzXCIpO1xubGV0IGxhbmRtYXJrc0xheWVyID0gbGF5ZXJNYW5hZ2VyLmFkZEltYWdlcyhsYW5kbWFya3MsIFwibGFuZG1hcmtzXCIpO1xubGV0IHdzY0Vhcmx5TGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkSW1hZ2VzKGVhcmx5RGF0ZXMsIFwid3NjX2Vhcmx5XCIpO1xuXG5sZXQgd3NjTWlkTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkSW1hZ2VzKG1pZERhdGVzLCBcIndzY19taWRcIik7XG53c2NNaWRMYXllci5zZXRWaXNpYmxlKGZhbHNlKTtcbmxldCB3c2NMYXRlTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkSW1hZ2VzKGxhdGVEYXRlcywgXCJ3c2NfbGF0ZVwiKTtcbndzY0xhdGVMYXllci5zZXRWaXNpYmxlKGZhbHNlKTtcbmxldCB3c2NPdGhlckxheWVyID0gbGF5ZXJNYW5hZ2VyLmFkZEltYWdlcyhvdGhlckRhdGVzLCBcIndzY19vdGhlclwiKTtcbndzY090aGVyTGF5ZXIuc2V0VmlzaWJsZShmYWxzZSk7XG5cbmxldCBlZGl0ID0gd3NjRWFybHlMYXllci5nZXQoXCJ3c2MtMTIyLTFcIik7XG5cbmxldCBlYXJseUluZGV4ID0gbmV3IENvbnRhaW5lckluZGV4KHdzY0Vhcmx5TGF5ZXIsIFwiZWFybHlcIik7XG5sZXQgbWlkSW5kZXggPSBuZXcgQ29udGFpbmVySW5kZXgod3NjTWlkTGF5ZXIsIFwibWlkXCIpO1xubGV0IGxhdGVJbmRleCA9IG5ldyBDb250YWluZXJJbmRleCh3c2NMYXRlTGF5ZXIsIFwibGF0ZVwiKTtcbmxldCBvdGhlckluZGV4ID0gbmV3IENvbnRhaW5lckluZGV4KHdzY090aGVyTGF5ZXIsIFwib3RoZXJcIik7XG5cbmxldCBjb250YWluZXJMYXllck1hbmFnZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXJNYW5hZ2VyKHdzY0Vhcmx5TGF5ZXIsIGVkaXRDb250YWluZXJMYXllcik7XG5sZXQgb3V0bGluZUxheWVyID0gY29udGFpbmVyTGF5ZXJNYW5hZ2VyLnNldFNlbGVjdGVkKFwid3NjLTEyMi0xXCIpO1xuXG5pbWFnZUxheWVyLnNldChcIndzY19vdGhlclwiLCB3c2NPdGhlckxheWVyKTtcbmltYWdlTGF5ZXIuc2V0KFwid3NjX2Vhcmx5XCIsIHdzY0Vhcmx5TGF5ZXIpO1xuaW1hZ2VMYXllci5zZXQoXCJ3c2NfbWlkXCIsIHdzY01pZExheWVyKTtcbmltYWdlTGF5ZXIuc2V0KFwid3NjX2xhdGVcIiwgd3NjTGF0ZUxheWVyKTtcblxuLy8gaW1hZ2VMYXllci5zZXQoXCJmaXJlbWFwc1wiLCBmaXJlbWFwTGF5ZXIpO1xuXG4vLyBpbWFnZUxheWVyLnNldChcImR1YmxpbjE2MTBcIiwgZHVJbWFnZSk7XG4vLyBpbWFnZUxheWVyLnNldChcInRoaW5nbW90XCIsIHRtSW1hZ2UpO1xuLy8gaW1hZ2VMYXllci5zZXQoXCJsYW5kbWFya3NcIiwgbGFuZG1hcmtzTGF5ZXIpO1xuXG5pbWFnZUxheWVyLnNldChcInNoYXBlXCIsIHRlc3RTaGFwZSk7XG5pbWFnZUxheWVyLnNldChcImVkaXRvclwiLCBlZGl0TWFuYWdlcik7XG5cbi8vd3NjRWFybHlMYXllci5zZXRUb3AoXCJ3c2MtMzM0XCIpO1xuXG5mdW5jdGlvbiBzaG93TWFwKGRpdk5hbWU6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpdk5hbWUpO1xuXG4gICAgY29uc3QgaW5mbyA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVkaXRfaW5mb1wiKTtcblxuICAgIGNvbnN0IGxheWVycyA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxheWVyc1wiKTtcblxuICAgIGxldCB4ID0gb3V0bGluZUxheWVyLng7XG4gICAgbGV0IHkgPSBvdXRsaW5lTGF5ZXIueTtcblxuICAgIGxldCBkaW1lbnNpb24gPSBvdXRsaW5lTGF5ZXIuZ2V0RGltZW5zaW9uKCk7XG4gICAgY29uc29sZS5sb2coXCJvdXRsaW5lIGRpbWVuc2lvbjogXCIgKyBkaW1lbnNpb24pO1xuICAgIGxldCBjYW52YXNab29tID0gMC41O1xuICAgIGxldCB3ID0gZGltZW5zaW9uLncgKiBjYW52YXNab29tO1xuXG4gICAgbGV0IGNhbnZhc1RyYW5zZm9ybSA9IG5ldyBCYXNpY1RyYW5zZm9ybSh4IC0gMjAwLCB5IC0gMjAwLCBjYW52YXNab29tLCBjYW52YXNab29tLCAwKTtcbiAgICBsZXQgY2FudmFzVmlldyA9IG5ldyBDYW52YXNWaWV3KGNhbnZhc1RyYW5zZm9ybSwgY2FudmFzLmNsaWVudFdpZHRoLCBjYW52YXMuY2xpZW50SGVpZ2h0LCBjYW52YXMpO1xuXG4gICAgY2FudmFzVmlldy5sYXllcnMucHVzaChzZW50aW5lbENvbnRhaW5lckxheWVyKTtcbiAgICBjYW52YXNWaWV3LmxheWVycy5wdXNoKGltYWdlTGF5ZXIpO1xuICAgIGNhbnZhc1ZpZXcubGF5ZXJzLnB1c2goc3RhdGljR3JpZCk7XG4gICAgY2FudmFzVmlldy5sYXllcnMucHVzaChlZGl0Q29udGFpbmVyTGF5ZXIpO1xuXG4gICAgbGV0IHRpbGVDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBzZW50aW5lbENvbnRhaW5lckxheWVyLCBcInZcIik7XG4gICAgbGV0IGJhc2VDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBiZ0ltYWdlLCBcIkJcIik7XG4gICAgbGV0IGNvdW50eUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGNvdW50eUltYWdlLCBcIlZcIik7XG4gICAgbGV0IGZpcmVtYXBDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBmaXJlbWFwTGF5ZXIsIFwiYlwiKTtcbiAgICBsZXQgd3NjRWFybHlDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCB3c2NFYXJseUxheWVyLCBcIjFcIik7XG4gICAgbGV0IHdzY0xhdGVDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCB3c2NNaWRMYXllciwgXCIyXCIpO1xuICAgIGxldCB3c2NNaWRDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCB3c2NMYXRlTGF5ZXIsIFwiM1wiKTtcbiAgICBsZXQgd3NjT3RoZXJDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCB3c2NPdGhlckxheWVyLCBcIjRcIik7XG4gICAgbGV0IGxhbmRtYXJrQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgbGFuZG1hcmtzTGF5ZXIsIFwibVwiKTtcbiAgICBsZXQgdG1Db250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCB0bUltYWdlLCBcIm5cIik7XG4gICAgbGV0IGR1Q29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgZHVJbWFnZSwgXCJNXCIpO1xuICAgIGxldCBncmlkQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgc3RhdGljR3JpZCwgXCJnXCIpO1xuXG4gICAgbGV0IGNvbnRyb2xsZXIgPSBuZXcgVmlld0NvbnRyb2xsZXIoY2FudmFzVmlldywgY2FudmFzLCBjYW52YXNWaWV3KTtcblxuICAgIGxldCBpbWFnZUNvbnRyb2xsZXIgPSBuZXcgSW1hZ2VDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGVkaXQpO1xuXG4gICAgaW1hZ2VDb250cm9sbGVyLnNldExheWVyT3V0bGluZShvdXRsaW5lTGF5ZXIpO1xuXG4gICAgaW1hZ2VDb250cm9sbGVyLnNldEVkaXRJbmZvUGFuZShpbmZvKTtcblxuICAgIGxldCBsYXllckNvbnRyb2xsZXIgPSBuZXcgTGF5ZXJDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGNvbnRhaW5lckxheWVyTWFuYWdlcik7XG5cbiAgICBkcmF3TWFwKGNhbnZhc1ZpZXcpO1xuXG4gICAgbGV0IGxvZ2dlciA9IG5ldyBFbGVtZW50TG9nZ2VyKGluZm8pO1xuXG4gICAgbGV0IGluZGV4Q29udHJvbGxlciA9IG5ldyBJbmRleENvbnRyb2xsZXIoY2FudmFzVmlldywgaW1hZ2VDb250cm9sbGVyKTtcbiAgICBpbmRleENvbnRyb2xsZXIuYWRkSW5kZXhlcihlYXJseUluZGV4KTtcbiAgICBpbmRleENvbnRyb2xsZXIuYWRkSW5kZXhlcihtaWRJbmRleCk7XG4gICAgaW5kZXhDb250cm9sbGVyLmFkZEluZGV4ZXIobGF0ZUluZGV4KTtcbiAgICBpbmRleENvbnRyb2xsZXIuYWRkSW5kZXhlcihvdGhlckluZGV4KTtcblxuICAgIGluZGV4Q29udHJvbGxlci5zZXRNZW51KGxheWVycyk7XG5cbiAgICBsZXQgZWRpdENvbnRyb2xsZXIgPSBuZXcgRWRpdENvbnRyb2xsZXIoY2FudmFzVmlldywgZWRpdE1hbmFnZXIpO1xuICAgIGVkaXRDb250cm9sbGVyLnNldExvZ2dpbmcobG9nZ2VyKTtcblxufVxuXG5mdW5jdGlvbiBkcmF3TWFwKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcpe1xuICAgIGlmICghY2FudmFzVmlldy5kcmF3KCkgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiSW4gdGltZW91dFwiKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpeyBkcmF3TWFwKGNhbnZhc1ZpZXcpfSwgNTAwKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNob3coKXtcblx0c2hvd01hcChcImNhbnZhc1wiLCBcIlR5cGVTY3JpcHRcIik7XG59XG5cbmlmIChcbiAgICBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgfHxcbiAgICAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gXCJsb2FkaW5nXCIgJiYgIWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5kb1Njcm9sbClcbikge1xuXHRzaG93KCk7XG59IGVsc2Uge1xuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBzaG93KTtcbn0iXX0=
