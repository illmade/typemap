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
    addLayer(imageDetails, layerName, layerTransform = view_1.BasicTransform.unitTransform) {
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
const point2d_1 = require("../geom/point2d");
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
        let point = this.mousePosition(e, this.canvasView.canvasElement);
        this.dragPosition = new point2d_1.Point2D(point[0], point[1]);
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
            let xDelta = (point[0] - this.dragPosition.x) / this.canvasView.zoomX;
            let yDelta = (point[1] - this.dragPosition.y) / this.canvasView.zoomY;
            this.dragPoint.x = this.dragPoint.x + xDelta;
            this.dragPoint.y = this.dragPoint.y + yDelta;
            this.editManager.updatePoint(this.dragPoint);
            this.dragPosition = new point2d_1.Point2D(point[0], point[1]);
            this.canvasView.draw();
        }
    }
}
exports.EditController = EditController;

},{"../geom/point2d":1,"../logging/logger":26,"./mousecontroller":24}],20:[function(require,module,exports){
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
        let worldPoint = this.canvasView.getBasePoint(new point2d_1.Point2D(point[0], point[1]));
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
                console.log("toggle visible");
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

},{}],25:[function(require,module,exports){
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
// new BasicTransform(0, 0, 1, 1, 0);
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
let firemapLayer = layerManager.addLayer(firemaps, "firemaps");
let landmarksLayer = layerManager.addLayer(landmarks, "landmarks");
let wscEarlyLayer = layerManager.addLayer(earlyDates, "wsc_early");
let wscMidLayer = layerManager.addLayer(midDates, "wsc_mid");
wscMidLayer.setVisible(false);
let wscLateLayer = layerManager.addLayer(lateDates, "wsc_late");
wscLateLayer.setVisible(false);
let wscOtherLayer = layerManager.addLayer(otherDates, "wsc_other");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2dyYXBoaWNzL2NhbnZhc3ZpZXcudHMiLCJzcmMvZ3JhcGhpY3MvY29udGFpbmVybGF5ZXIudHMiLCJzcmMvZ3JhcGhpY3MvZWRpdG1hbmFnZXIudHMiLCJzcmMvZ3JhcGhpY3MvZ3JpZC50cyIsInNyYy9ncmFwaGljcy9sYXllci50cyIsInNyYy9ncmFwaGljcy9sYXllcm1hbmFnZXIudHMiLCJzcmMvZ3JhcGhpY3MvbXVsdGlyZXNsYXllci50cyIsInNyYy9ncmFwaGljcy9zaGFwZS50cyIsInNyYy9ncmFwaGljcy9zdGF0aWMudHMiLCJzcmMvZ3JhcGhpY3MvdGlsZWxheWVyLnRzIiwic3JjL2dyYXBoaWNzL3ZpZXcudHMiLCJzcmMvaW1hZ2Vncm91cHMvZmlyZW1hcHMuanNvbiIsInNyYy9pbWFnZWdyb3Vwcy9sYW5kbWFya3MuanNvbiIsInNyYy9pbWFnZWdyb3Vwcy93c2NkLmpzb24iLCJzcmMvaW5kZXgvY29udGFpbmVyaW5kZXgudHMiLCJzcmMvaW5kZXgvZ3JpZGluZGV4ZXIudHMiLCJzcmMvaW50ZXJmYWNlL2NhbnZhc2xheWVydmlldy50cyIsInNyYy9pbnRlcmZhY2UvZWRpdGNvbnRyb2xsZXIudHMiLCJzcmMvaW50ZXJmYWNlL2ltYWdlY29udHJvbGxlci50cyIsInNyYy9pbnRlcmZhY2UvaW5kZXhjb250cm9sbGVyLnRzIiwic3JjL2ludGVyZmFjZS9pbmRleHZpZXcudHMiLCJzcmMvaW50ZXJmYWNlL2xheWVyY29udHJvbGxlci50cyIsInNyYy9pbnRlcmZhY2UvbW91c2Vjb250cm9sbGVyLnRzIiwic3JjL2ludGVyZmFjZS92aWV3Y29udHJvbGxlci50cyIsInNyYy9sb2dnaW5nL2xvZ2dlci50cyIsInNyYy9zaW1wbGVXb3JsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQ0EsTUFBYSxPQUFP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QUssQ0FBQztRQUNsQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFFbEMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3hDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUUxQyxJQUFJLFVBQVUsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUM1QyxJQUFJLFFBQVEsR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUU1QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzdDLElBQUksS0FBSyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDL0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzVELElBQUksTUFBTSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFFaEQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5QyxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQy9DLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5RCxJQUFJ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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRXBFLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUVyRSxLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLElBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFDO1lBQy9CLEtBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsSUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUM7Z0JBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7YUFDdEM7U0FDRDtJQUNGLENBQUM7SUFFRCxXQUFXLENBQUMsV0FBd0I7UUFFbkMsSUFBSSxTQUFTLEdBQUcsV0FBVyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRTNDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVwRSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3JELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFH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QyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdkMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNyQyxlQUFlLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3RDLGVBQWUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFdkMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVoQyxJQUFJLGNBQWMsR0FBRyxJQUFJLCtCQUFjLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ2pFLGNBQWMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7QUFFdEMsQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFDLFVBQXNCO0lBQ25DLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUc7UUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixVQUFVLENBQUMsY0FBWSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUEsQ0FBQSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDckQ7QUFDTCxDQUFDO0FBRUQsU0FBUyxJQUFJO0lBQ1osT0FBTyxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBRUQsSUFDSSxRQUFRLENBQUMsVUFBVSxLQUFLLFVBQVU7SUFDbEMsQ0FBQyxRQUFRLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQzNFO0lBQ0QsSUFBSSxFQUFFLENBQUM7Q0FDUDtLQUFNO0lBQ04sUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ3BEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXG5leHBvcnQgY2xhc3MgUG9pbnQyRCB7XG4gICAgc3RhdGljIHJlYWRvbmx5IHplcm8gPSBuZXcgUG9pbnQyRCgwLCAwKTtcbiAgICBzdGF0aWMgcmVhZG9ubHkgb25lID0gbmV3IFBvaW50MkQoMSwgMSk7XG5cbiAgICByZWFkb25seSB4OiBudW1iZXI7XG4gICAgcmVhZG9ubHkgeTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcblx0fVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiUG9pbnQyRChcIiArIHRoaXMueCArIFwiLCBcIiArIHRoaXMueSArIFwiKVwiO1xuICAgIH1cblxufVxuXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlKFxuICBwb2ludDogUG9pbnQyRCwgXG4gIGFuZ2xlOiBudW1iZXIsIFxuICBhYm91dDogUG9pbnQyRCA9IG5ldyBQb2ludDJEKDAsMClcbik6IFBvaW50MkQge1xuXG4gICAgbGV0IHMgPSBNYXRoLnNpbihhbmdsZSk7XG4gICAgbGV0IGMgPSBNYXRoLmNvcyhhbmdsZSk7XG5cbiAgICBsZXQgcHggPSBwb2ludC54IC0gYWJvdXQueDtcbiAgICBsZXQgcHkgPSBwb2ludC55IC0gYWJvdXQueTtcblxuICAgIGxldCB4bmV3ID0gcHggKiBjICsgcHkgKiBzO1xuICAgIGxldCB5bmV3ID0gcHkgKiBjIC0gcHggKiBzO1xuXG4gICAgcmV0dXJuIG5ldyBQb2ludDJEKHhuZXcgKyBhYm91dC54LCB5bmV3ICsgYWJvdXQueSk7XG59XG5cbmV4cG9ydCBjbGFzcyBEaW1lbnNpb24ge1xuXG4gICAgY29uc3RydWN0b3IocHVibGljIHg6IG51bWJlciwgcHVibGljIHk6IG51bWJlciwgcHVibGljIHc6IG51bWJlciwgcHVibGljIGg6IG51bWJlcil7fVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiRGltZW5zaW9uKFwiICsgdGhpcy54ICsgXCIsIFwiICsgdGhpcy55ICsgXCIsIFwiICsgdGhpcy53ICsgXCIsIFwiICsgdGhpcy5oICsgXCIpXCI7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcbmltcG9ydCB7IENhbnZhc0VsZW1lbnQgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgXG5cdGludmVydFRyYW5zZm9ybSwgXG5cdFZpZXdUcmFuc2Zvcm0sIFxuXHRCYXNpY1ZpZXdUcmFuc2Zvcm0sIFxuXHRUcmFuc2Zvcm0sIFxuXHRCYXNpY1RyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcblxuZXhwb3J0IGludGVyZmFjZSBEaXNwbGF5RWxlbWVudCBleHRlbmRzIFRyYW5zZm9ybSB7XG5cdGlzVmlzaWJsZSgpOiBib29sZWFuO1xuXHRzZXRWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4pOiB2b2lkO1xuXHRnZXRPcGFjaXR5KCk6IG51bWJlcjtcblx0c2V0T3BhY2l0eShvcGFjaXR5OiBudW1iZXIpOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgQ2FudmFzVmlldyBleHRlbmRzIEJhc2ljVmlld1RyYW5zZm9ybSB7XG5cblx0bGF5ZXJzOiBBcnJheTxDYW52YXNFbGVtZW50PiA9IFtdO1xuXHRjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHR3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgXG5cdFx0cmVhZG9ubHkgY2FudmFzRWxlbWVudDogSFRNTENhbnZhc0VsZW1lbnQpe1xuXG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0ueCwgbG9jYWxUcmFuc2Zvcm0ueSwgd2lkdGgsIGhlaWdodCwgXG5cdFx0XHRsb2NhbFRyYW5zZm9ybS56b29tWCwgbG9jYWxUcmFuc2Zvcm0uem9vbVksIFxuXHRcdFx0bG9jYWxUcmFuc2Zvcm0ucm90YXRpb24pO1xuXG5cdFx0dGhpcy5pbml0Q2FudmFzKCk7XG5cblx0XHR0aGlzLmN0eCA9IGNhbnZhc0VsZW1lbnQuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHR9XG5cblx0em9vbUFib3V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB6b29tQnk6IG51bWJlcil7XG5cbiAgICAgICAgdGhpcy56b29tWCA9IHRoaXMuem9vbVggKiB6b29tQnk7XG4gICAgICAgIHRoaXMuem9vbVkgPSB0aGlzLnpvb21ZICogem9vbUJ5O1xuXG4gICAgICAgIGxldCByZWxhdGl2ZVggPSB4ICogem9vbUJ5IC0geDtcbiAgICAgICAgbGV0IHJlbGF0aXZlWSA9IHkgKiB6b29tQnkgLSB5O1xuXG4gICAgICAgIGxldCB3b3JsZFggPSByZWxhdGl2ZVggLyB0aGlzLnpvb21YO1xuICAgICAgICBsZXQgd29ybGRZID0gcmVsYXRpdmVZIC8gdGhpcy56b29tWTtcblxuICAgICAgICB0aGlzLnggPSB0aGlzLnggKyB3b3JsZFg7XG4gICAgICAgIHRoaXMueSA9IHRoaXMueSArIHdvcmxkWTtcblxuXHR9XG5cblx0Z2V0QmFzZVBvaW50KGNvb3JkOiBQb2ludDJEKTogUG9pbnQyRCB7XG5cdFx0cmV0dXJuIG5ldyBQb2ludDJEKFxuXHRcdFx0dGhpcy54ICsgY29vcmQueCAvIHRoaXMuem9vbVgsIFxuXHRcdFx0dGhpcy55ICsgY29vcmQueSAvIHRoaXMuem9vbVkpO1xuXHR9XG5cblx0ZHJhdygpOiBib29sZWFuIHtcblx0XHRsZXQgdHJhbnNmb3JtID0gaW52ZXJ0VHJhbnNmb3JtKHRoaXMpO1xuXG5cdFx0dGhpcy5jdHguZmlsbFN0eWxlID0gXCJncmV5XCI7XG5cdFx0dGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXG5cdFx0dmFyIGRyYXdpbmdDb21wbGV0ZSA9IHRydWU7XG5cblx0XHRmb3IgKGxldCBsYXllciBvZiB0aGlzLmxheWVycyl7XG5cdFx0XHRpZiAobGF5ZXIuaXNWaXNpYmxlKCkpe1xuXHRcdFx0XHRkcmF3aW5nQ29tcGxldGUgPSBkcmF3aW5nQ29tcGxldGUgJiYgbGF5ZXIuZHJhdyh0aGlzLmN0eCwgQmFzaWNUcmFuc2Zvcm0udW5pdFRyYW5zZm9ybSwgdGhpcyk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9XG5cblx0XHR0aGlzLmRyYXdDZW50cmUodGhpcy5jdHgpO1xuXHRcdHRoaXMuc2hvd0luZm8odGhpcy5jdHgpO1xuXG5cdFx0cmV0dXJuIGRyYXdpbmdDb21wbGV0ZTtcblx0fVxuXG5cdGRyYXdDZW50cmUoY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKXtcbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IDAuMztcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKHRoaXMud2lkdGgvMiwgNi8xNip0aGlzLmhlaWdodCk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKHRoaXMud2lkdGgvMiwgMTAvMTYqdGhpcy5oZWlnaHQpO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyg3LzE2KnRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LzIpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyg5LzE2KnRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LzIpO1xuICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gXCJibGFja1wiO1xuICAgICAgICBjb250ZXh0Lmdsb2JhbEFscGhhID0gMTtcbiAgICB9XG5cbiAgICBzaG93SW5mbyhjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpe1xuICAgIFx0Y29udGV4dC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG4gICAgXHRjb250ZXh0LmZpbGxUZXh0KFwiem9vbTogXCIgKyB0aGlzLnpvb21YLCAxMCwgMTApO1xuICAgIFx0Y29udGV4dC5maWxsKCk7XG4gICAgfVxuXG5cdHByaXZhdGUgaW5pdENhbnZhcygpe1xuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLmNhbnZhc0VsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLmNhbnZhc0VsZW1lbnQuY2xpZW50SGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQuaGVpZ2h0ID0gaGVpZ2h0O1xuXHR9XG5cbn0iLCJpbXBvcnQgeyBUcmFuc2Zvcm0sIEJhc2ljVHJhbnNmb3JtLCBcblx0Vmlld1RyYW5zZm9ybSwgXG5cdGNvbWJpbmVUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBEaW1lbnNpb24gfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBDYW52YXNFbGVtZW50IH0gZnJvbSBcIi4vbGF5ZXJcIjtcblxuZXhwb3J0IGNsYXNzIENvbnRhaW5lckxheWVyIGV4dGVuZHMgQ2FudmFzRWxlbWVudCB7XG5cblx0bGF5ZXJNYXA6IE1hcDxzdHJpbmcsIENhbnZhc0VsZW1lbnQ+O1xuXHRkaXNwbGF5TGF5ZXJzOiBBcnJheTxDYW52YXNFbGVtZW50PjtcblxuXHRjb25zdHJ1Y3Rvcihsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBvcGFjaXR5OiBudW1iZXIgPSAxLCB2aXNpYmxlOiBib29sZWFuID0gdHJ1ZSkge1xuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCBvcGFjaXR5LCB2aXNpYmxlKTtcblx0XHR0aGlzLmxheWVyTWFwID0gbmV3IE1hcDxzdHJpbmcsIENhbnZhc0VsZW1lbnQ+KCk7XG5cdFx0dGhpcy5kaXNwbGF5TGF5ZXJzID0gW107XG5cdH1cblxuXHRzZXQobmFtZTogc3RyaW5nLCBsYXllcjogQ2FudmFzRWxlbWVudCk6IHZvaWQge1xuXHRcdHRoaXMubGF5ZXJNYXAuc2V0KG5hbWUsIGxheWVyKTtcblx0XHR0aGlzLmRpc3BsYXlMYXllcnMucHVzaChsYXllcik7XG5cdH1cblxuXHRnZXQobmFtZTogc3RyaW5nKTogQ2FudmFzRWxlbWVudCB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXAuZ2V0KG5hbWUpO1xuXHR9XG5cblx0bGF5ZXJzKCk6IEFycmF5PENhbnZhc0VsZW1lbnQ+IHtcblx0XHRyZXR1cm4gdGhpcy5kaXNwbGF5TGF5ZXJzO1xuXHR9XG5cblx0c2V0VG9wKG5hbWU6IHN0cmluZykge1xuXHRcdGxldCB0b3BMYXllciA9IHRoaXMuZ2V0KG5hbWUpO1xuXHRcdGlmICh0b3BMYXllciAhPSB1bmRlZmluZWQpe1xuXHRcdFx0dGhpcy5kaXNwbGF5TGF5ZXJzID0gdGhpcy5kaXNwbGF5TGF5ZXJzLmZpbHRlcihmdW5jdGlvbihlbGVtZW50OiBDYW52YXNFbGVtZW50KXsgXG5cdFx0XHRcdGlmIChlbGVtZW50ID09IHRvcExheWVyKXtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH19KTtcblx0XHRcdHRoaXMuZGlzcGxheUxheWVycy5wdXNoKHRvcExheWVyKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5sb2coXCJ0b3AgbGF5ZXIgdW5kZWZpbmVkIFwiICsgbmFtZSk7XG5cdFx0fVxuXHR9XG5cblx0ZHJhdyhcblx0ICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgXG5cdCAgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHQgIHZpZXc6IFZpZXdUcmFuc2Zvcm0pOiBib29sZWFuIHtcblxuXHRcdGxldCBsYXllclRyYW5zZm9ybSA9IGNvbWJpbmVUcmFuc2Zvcm0odGhpcy5sb2NhbFRyYW5zZm9ybSwgcGFyZW50VHJhbnNmb3JtKTtcblxuXHRcdHZhciBkcmF3aW5nQ29tcGxldGUgPSB0cnVlO1xuXG5cdFx0Zm9yIChsZXQgbGF5ZXIgb2YgdGhpcy5kaXNwbGF5TGF5ZXJzKSB7XG5cdFx0XHRpZiAobGF5ZXIuaXNWaXNpYmxlKCkpe1xuXHRcdFx0XHRkcmF3aW5nQ29tcGxldGUgPSBkcmF3aW5nQ29tcGxldGUgJiYgbGF5ZXIuZHJhdyhjdHgsIGxheWVyVHJhbnNmb3JtLCB2aWV3KTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdH1cblxuXHRcdHJldHVybiBkcmF3aW5nQ29tcGxldGU7XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHR2YXIgeE1pbiA9IHRoaXMueDtcblx0XHR2YXIgeU1pbiA9IHRoaXMueTtcblx0XHR2YXIgeE1heCA9IHRoaXMueDtcblx0XHR2YXIgeU1heCA9IHRoaXMueTtcblxuXHRcdGZvciAobGV0IGxheWVyIG9mIHRoaXMuZGlzcGxheUxheWVycykge1xuXHRcdFx0bGV0IGxheWVyRGltZW5zaW9uID0gbGF5ZXIuZ2V0RGltZW5zaW9uKCk7XG5cdFx0XHR4TWluID0gTWF0aC5taW4oeE1pbiwgdGhpcy54ICsgbGF5ZXJEaW1lbnNpb24ueCk7XG5cdFx0XHR5TWluID0gTWF0aC5taW4oeU1pbiwgdGhpcy55ICsgbGF5ZXJEaW1lbnNpb24ueSk7XG5cdFx0XHR4TWF4ID0gTWF0aC5tYXgoeE1heCwgdGhpcy54ICsgbGF5ZXJEaW1lbnNpb24ueCArIHRoaXMuem9vbVggKiBsYXllckRpbWVuc2lvbi53KTtcblx0XHRcdHlNYXggPSBNYXRoLm1heCh5TWF4LCB0aGlzLnkgKyBsYXllckRpbWVuc2lvbi55ICsgdGhpcy56b29tWSAqIGxheWVyRGltZW5zaW9uLmgpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgRGltZW5zaW9uKHhNaW4sIHlNaW4sIHhNYXggLSB4TWluLCB5TWF4IC0geU1pbik7XG5cdH1cblxufSIsImltcG9ydCB7IENhbnZhc0VsZW1lbnQgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgVHJhbnNmb3JtLCBCYXNpY1RyYW5zZm9ybSwgVmlld1RyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IFNoYXBlLCBQb2ludCB9IGZyb20gXCIuL3NoYXBlXCI7XG5pbXBvcnQgeyBEaW1lbnNpb24sIFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbmV4cG9ydCBjbGFzcyBFZGl0TWFuYWdlciBleHRlbmRzIENhbnZhc0VsZW1lbnQge1xuXG5cdHByaXZhdGUgcG9pbnRNYXA6IE1hcDxQb2ludCwgUG9pbnQyRD47XG5cblx0Y29uc3RydWN0b3IocmVhZG9ubHkgc2hhcGU6IFNoYXBlLCByZWFkb25seSByYWRpdXMgPSA1KXtcblxuXHRcdHN1cGVyKHNoYXBlLmxvY2FsVHJhbnNmb3JtKTtcblxuXHRcdHRoaXMucG9pbnRNYXAgPSBuZXcgTWFwPFBvaW50LCBQb2ludDJEPigpO1xuXG5cdFx0Zm9yICAobGV0IHBvaW50MmQgb2Ygc2hhcGUucG9pbnRzKXtcblx0XHRcdGxldCBwb2ludCA9IG5ldyBQb2ludChwb2ludDJkLngsIHBvaW50MmQueSwgdGhpcy5yYWRpdXMsIDEsIHRydWUpO1xuXHRcdFx0dGhpcy5wb2ludE1hcC5zZXQocG9pbnQsIHBvaW50MmQpO1xuXHRcdH1cblx0fVxuXG5cdGFkZFBvaW50KHg6IG51bWJlciwgeTogbnVtYmVyKTogdm9pZCB7XG5cdFx0bGV0IHBvaW50ID0gbmV3IFBvaW50KHgsIHksIHRoaXMucmFkaXVzLCAxLCB0cnVlKTtcblx0XHRsZXQgcG9pbnQyZCA9IG5ldyBQb2ludDJEKHgsIHkpO1xuXHRcdHRoaXMuc2hhcGUucG9pbnRzLnB1c2gocG9pbnQyZCk7XG5cdFx0dGhpcy5wb2ludE1hcC5zZXQocG9pbnQsIHBvaW50MmQpO1xuXHR9XG5cblx0dXBkYXRlUG9pbnQocG9pbnQ6IFBvaW50KXtcblx0XHRsZXQgc2hhcGVQb2ludCA9IHRoaXMucG9pbnRNYXAuZ2V0KHBvaW50KTtcblx0XHRzaGFwZVBvaW50LnggPSBwb2ludC54O1xuXHRcdHNoYXBlUG9pbnQueSA9IHBvaW50Lnk7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBcblx0ICBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdCAgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0Zm9yIChsZXQgW3BvaW50LCBwb2ludDJkXSBvZiB0aGlzLnBvaW50TWFwKXtcblx0XHRcdHBvaW50LmRyYXcoY3R4LCBwYXJlbnRUcmFuc2Zvcm0sIHZpZXcpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0Z2V0UG9pbnQoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBQb2ludCB7XG5cdFx0Zm9yIChsZXQgW3BvaW50LCBwb2ludDJkXSBvZiB0aGlzLnBvaW50TWFwKXtcblx0XHRcdGlmIChwb2ludC5pbnNpZGUoeCwgeSkpe1xuXHRcdFx0XHRyZXR1cm4gcG9pbnQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHRyZXR1cm4gdGhpcy5zaGFwZS5nZXREaW1lbnNpb24oKTtcblx0fVxufSIsImltcG9ydCB7IERyYXdMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBUcmFuc2Zvcm0sIFZpZXdUcmFuc2Zvcm0sIGNvbWJpbmVUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBEaW1lbnNpb24gfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbi8qKlxuKiBXZSBkb24ndCB3YW50IHRvIGRyYXcgYSBncmlkIGludG8gYSB0cmFuc2Zvcm1lZCBjYW52YXMgYXMgdGhpcyBnaXZlcyB1cyBncmlkIGxpbmVzIHRoYXQgYXJlIHRvb1xudGhpY2sgb3IgdG9vIHRoaW5cbiovXG5leHBvcnQgY2xhc3MgU3RhdGljR3JpZCBleHRlbmRzIERyYXdMYXllciB7XG5cblx0em9vbVdpZHRoOiBudW1iZXI7XG5cdHpvb21IZWlnaHQ6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3Rvcihsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCB6b29tTGV2ZWw6IG51bWJlciwgdmlzaWJsZTogYm9vbGVhbixcblx0XHRyZWFkb25seSBncmlkV2lkdGg6IG51bWJlciA9IDI1NiwgcmVhZG9ubHkgZ3JpZEhlaWdodDogbnVtYmVyID0gMjU2KXtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCAxLCB2aXNpYmxlKTtcblxuXHRcdGxldCB6b29tID0gTWF0aC5wb3coMiwgem9vbUxldmVsKTtcblx0XHR0aGlzLnpvb21XaWR0aCA9IGdyaWRXaWR0aCAvIHpvb207XG5cdFx0dGhpcy56b29tSGVpZ2h0ID0gZ3JpZEhlaWdodCAvIHpvb207XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB0cmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0bGV0IG9mZnNldFggPSB2aWV3LnggKiB2aWV3Lnpvb21YO1xuXHRcdGxldCBvZmZzZXRZID0gdmlldy55ICogdmlldy56b29tWTtcblxuXHRcdGxldCB2aWV3V2lkdGggPSB2aWV3LndpZHRoIC8gdmlldy56b29tWDtcblx0XHRsZXQgdmlld0hlaWdodCA9IHZpZXcuaGVpZ2h0IC8gdmlldy56b29tWTtcblxuXHRcdGxldCBncmlkQWNyb3NzID0gdmlld1dpZHRoIC8gdGhpcy56b29tV2lkdGg7XG5cdFx0bGV0IGdyaWRIaWdoID0gdmlld0hlaWdodCAvIHRoaXMuem9vbUhlaWdodDtcblxuXHRcdGxldCB4TWluID0gTWF0aC5mbG9vcih2aWV3LngvdGhpcy56b29tV2lkdGgpO1xuXHRcdGxldCB4TGVmdCA9IHhNaW4gKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IHhNYXggPSBNYXRoLmNlaWwoKHZpZXcueCArIHZpZXdXaWR0aCkgLyB0aGlzLnpvb21XaWR0aCk7XG5cdFx0bGV0IHhSaWdodCA9IHhNYXggKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cblx0XHRsZXQgeU1pbiA9IE1hdGguZmxvb3Iodmlldy55L3RoaXMuem9vbUhlaWdodCk7XG5cdFx0bGV0IHlUb3AgPSB5TWluICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWDtcblx0XHRsZXQgeU1heCA9IE1hdGguY2VpbCgodmlldy55ICsgdmlld0hlaWdodCkgLyB0aGlzLnpvb21IZWlnaHQpO1xuXHRcdGxldCB5Qm90dG9tID0geU1heCAqIHRoaXMuem9vbUhlaWdodCAqIHZpZXcuem9vbVggO1xuXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcblxuXHRcdGZvciAodmFyIHggPSB4TWluOyB4PD14TWF4OyB4Kyspe1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImF0IFwiICsgbWluWCk7XG5cdFx0XHRsZXQgeE1vdmUgPSB4ICogdGhpcy56b29tV2lkdGggKiB2aWV3Lnpvb21YO1xuXHRcdFx0Y3R4Lm1vdmVUbyh4TW92ZSAtIG9mZnNldFgsIHlUb3AgLSBvZmZzZXRZKTtcblx0XHRcdGN0eC5saW5lVG8oeE1vdmUgLSBvZmZzZXRYLCB5Qm90dG9tIC0gb2Zmc2V0WSk7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgeSA9IHlNaW47IHk8PXlNYXg7IHkrKyl7XG5cblx0XHRcdGxldCB5TW92ZSA9IHkgKiB0aGlzLnpvb21IZWlnaHQgKiB2aWV3Lnpvb21ZO1xuXHRcdFx0Y3R4Lm1vdmVUbyh4TGVmdCAtIG9mZnNldFgsIHlNb3ZlIC0gb2Zmc2V0WSk7XG5cdFx0XHRjdHgubGluZVRvKHhSaWdodCAtIG9mZnNldFgsIHlNb3ZlIC0gb2Zmc2V0WSk7XG5cblx0XHRcdGZvciAodmFyIHggPSB4TWluOyB4PD14TWF4OyB4Kyspe1xuXHRcdFx0XHRsZXQgeE1vdmUgPSAoeC0uNSkgKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cdFx0XHRcdHlNb3ZlID0gKHktLjUpICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWTtcblx0XHRcdFx0bGV0IHRleHQgPSBcIlwiICsgKHgtMSkgKyBcIiwgXCIgKyAoeS0xKTtcblx0XHRcdFx0Y3R4LnN0cm9rZVRleHQodGV4dCwgeE1vdmUgLSBvZmZzZXRYLCB5TW92ZSAtIG9mZnNldFkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHRyZXR1cm4gbmV3IERpbWVuc2lvbigwLCAwLCAwLCAwKTtcblx0fVxufSIsImltcG9ydCB7IFRyYW5zZm9ybSwgQmFzaWNUcmFuc2Zvcm0sIFxuXHRWaWV3VHJhbnNmb3JtLCBcblx0Y29tYmluZVRyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IERpc3BsYXlFbGVtZW50IH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgRGltZW5zaW9uIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2FudmFzRWxlbWVudCBleHRlbmRzIEJhc2ljVHJhbnNmb3JtIGltcGxlbWVudHMgXG4gIERpc3BsYXlFbGVtZW50IHtcblxuXHRjb25zdHJ1Y3Rvcihcblx0ICBwdWJsaWMgbG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdCAgcHVibGljIG9wYWNpdHkgPSAxLCBcblx0ICBwdWJsaWMgdmlzaWJsZSA9IHRydWUsXG5cdCAgcHVibGljIG5hbWUgPSBcIlwiLFxuXHQgIHB1YmxpYyBkZXNjcmlwdGlvbiA9IFwiXCIsXG5cdCAgKXtcblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybS54LCBsb2NhbFRyYW5zZm9ybS55LCBsb2NhbFRyYW5zZm9ybS56b29tWCwgbG9jYWxUcmFuc2Zvcm0uem9vbVksIFxuXHRcdFx0bG9jYWxUcmFuc2Zvcm0ucm90YXRpb24pO1xuXHR9XG5cblx0YWJzdHJhY3QgZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHRcdHZpZXc6IFZpZXdUcmFuc2Zvcm0pOiBib29sZWFuO1xuXG5cdGFic3RyYWN0IGdldERpbWVuc2lvbigpOiBEaW1lbnNpb247XG5cblx0aXNWaXNpYmxlKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnZpc2libGU7XG5cdH1cblxuXHRzZXRWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4pOiB2b2lkIHtcblx0XHRjb25zb2xlLmxvZyhcInNldHRpbmcgdmlzaWJpbGl0eTogXCIgKyB2aXNpYmxlKTtcblx0XHR0aGlzLnZpc2libGUgPSB2aXNpYmxlO1xuXHR9XG5cblx0Z2V0T3BhY2l0eSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLm9wYWNpdHk7XG5cdH1cblxuXHRzZXRPcGFjaXR5KG9wYWNpdHk6IG51bWJlcik6IHZvaWQge1xuXHRcdHRoaXMub3BhY2l0eSA9IG9wYWNpdHk7XG5cdH1cblxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRHJhd0xheWVyIGV4dGVuZHMgQ2FudmFzRWxlbWVudCB7XG5cbiAgICBwcm90ZWN0ZWQgcHJlcGFyZUN0eChjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFRyYW5zZm9ybSk6IHZvaWQge1xuXHRcdGN0eC50cmFuc2xhdGUoKHRyYW5zZm9ybS54IC0gdmlldy54KSAqIHZpZXcuem9vbVgsICh0cmFuc2Zvcm0ueSAtIHZpZXcueSkgKiB2aWV3Lnpvb21ZKTtcblx0XHRjdHguc2NhbGUodHJhbnNmb3JtLnpvb21YICogdmlldy56b29tWCwgdHJhbnNmb3JtLnpvb21ZICogdmlldy56b29tWSk7XG5cdFx0Y3R4LnJvdGF0ZSh0cmFuc2Zvcm0ucm90YXRpb24pO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBjbGVhbkN0eChjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFRyYW5zZm9ybSk6IHZvaWQge1x0XG5cdFx0Y3R4LnJvdGF0ZSgtdHJhbnNmb3JtLnJvdGF0aW9uKTtcblx0XHRjdHguc2NhbGUoMS90cmFuc2Zvcm0uem9vbVgvdmlldy56b29tWCwgMS90cmFuc2Zvcm0uem9vbVkvdmlldy56b29tWSk7XG5cdFx0Y3R4LnRyYW5zbGF0ZSgtKHRyYW5zZm9ybS54IC12aWV3LngpICp2aWV3Lnpvb21YLCAtKHRyYW5zZm9ybS55IC0gdmlldy55KSAqIHZpZXcuem9vbVkpO1xuICAgIH1cblxufSIsImltcG9ydCB7IENvbnRhaW5lckxheWVyIH0gZnJvbSBcIi4vY29udGFpbmVybGF5ZXJcIjtcbmltcG9ydCB7IFN0YXRpY0ltYWdlLCBSZWN0TGF5ZXIgfSBmcm9tIFwiLi9zdGF0aWNcIjtcbmltcG9ydCB7IFRyYW5zZm9ybSAsIEJhc2ljVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgQ2FudmFzVmlldywgRGlzcGxheUVsZW1lbnR9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcblxuZXhwb3J0IGludGVyZmFjZSBJbWFnZVN0cnVjdCBleHRlbmRzIFRyYW5zZm9ybSB7XG5cdG9wYWNpdHk6IG51bWJlcjtcblx0dmlzaWJsZTogYm9vbGVhbjtcblx0c3JjOiBzdHJpbmc7XG5cdG5hbWU6IHN0cmluZztcblx0ZGVzY3JpcHRpb246IHN0cmluZztcblx0ZGF0ZTogbnVtYmVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGF0ZUZpbHRlcihcbiAgaW1hZ2VTdHJ1Y3Q6IEFycmF5PEltYWdlU3RydWN0PiwgXG4gIGZyb206IG51bWJlciwgXG4gIHRvOiBudW1iZXIpOiBBcnJheTxJbWFnZVN0cnVjdD57XG5cdHJldHVybiBpbWFnZVN0cnVjdC5maWx0ZXIoZnVuY3Rpb24oaW1hZ2VTdHJ1Y3QpeyBcblx0XHRpZiAoaW1hZ2VTdHJ1Y3QuZGF0ZSA9PSB1bmRlZmluZWQpXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0aWYgKGltYWdlU3RydWN0LmRhdGUgPj0gZnJvbSAmJiBpbWFnZVN0cnVjdC5kYXRlIDw9IHRvKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlfVxuXHRcdH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGF0ZWxlc3NGaWx0ZXIoXG4gIGltYWdlU3RydWN0OiBBcnJheTxJbWFnZVN0cnVjdD4pOiBBcnJheTxJbWFnZVN0cnVjdD57XG5cdHJldHVybiBpbWFnZVN0cnVjdC5maWx0ZXIoZnVuY3Rpb24oaW1hZ2VTdHJ1Y3QpeyBcblx0XHRpZiAoaW1hZ2VTdHJ1Y3QuZGF0ZSA9PSB1bmRlZmluZWQpXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZX1cblx0XHR9KTtcbn1cblxuZXhwb3J0IGNsYXNzIExheWVyTWFuYWdlciB7XG5cblx0cHJpdmF0ZSBsYXllck1hcDogTWFwPHN0cmluZywgQ29udGFpbmVyTGF5ZXI+OztcblxuXHRyZWFkb25seSBkZWZhdWx0TGF5ZXI6IHN0cmluZyA9IFwiZGVmYXVsdFwiO1xuXG5cdGNvbnN0cnVjdG9yKCl7XG5cdFx0dGhpcy5sYXllck1hcCA9IG5ldyBNYXA8c3RyaW5nLCBDb250YWluZXJMYXllcj4oKTtcblxuXHRcdGxldCBpbWFnZUxheWVyID0gbmV3IENvbnRhaW5lckxheWVyKEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0pO1x0XG5cblx0XHR0aGlzLmxheWVyTWFwLnNldCh0aGlzLmRlZmF1bHRMYXllciwgaW1hZ2VMYXllcik7XG5cdH1cblxuXHRhZGRJbWFnZShpbWFnZTogU3RhdGljSW1hZ2UsIG5hbWU6IHN0cmluZyl7XG5cdFx0dGhpcy5sYXllck1hcC5nZXQodGhpcy5kZWZhdWx0TGF5ZXIpLnNldChuYW1lLCBpbWFnZSk7XG5cdH1cblxuXHRhZGRMYXllcihcblx0ICBpbWFnZURldGFpbHM6IEFycmF5PEltYWdlU3RydWN0PiwgXG5cdCAgbGF5ZXJOYW1lOiBzdHJpbmcsIFxuXHQgIGxheWVyVHJhbnNmb3JtOiBUcmFuc2Zvcm0gPSBCYXNpY1RyYW5zZm9ybS51bml0VHJhbnNmb3JtXG5cdCk6IENvbnRhaW5lckxheWVyIHtcblxuXHRcdGxldCBpbWFnZUxheWVyID0gbmV3IENvbnRhaW5lckxheWVyKGxheWVyVHJhbnNmb3JtLCAxLCB0cnVlKTtcdFxuXG5cdFx0Zm9yICh2YXIgaW1hZ2Ugb2YgaW1hZ2VEZXRhaWxzKXtcblx0XHRcdGxldCBzdGF0aWNJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZShpbWFnZSwgaW1hZ2Uuc3JjLCBcblx0XHRcdFx0aW1hZ2Uub3BhY2l0eSwgaW1hZ2UudmlzaWJsZSwgaW1hZ2UuZGVzY3JpcHRpb24pO1xuXHRcdFx0aW1hZ2VMYXllci5zZXQoaW1hZ2UubmFtZSwgc3RhdGljSW1hZ2UpO1xuXHRcdH1cblxuXHRcdHRoaXMubGF5ZXJNYXAuc2V0KGxheWVyTmFtZSwgaW1hZ2VMYXllcik7XG5cblx0XHRyZXR1cm4gaW1hZ2VMYXllcjtcblx0fVxuXG5cdGdldExheWVycygpOiBNYXA8c3RyaW5nLCBDb250YWluZXJMYXllcj4ge1xuXHRcdHJldHVybiB0aGlzLmxheWVyTWFwO1xuXHR9XG5cblx0Z2V0TGF5ZXIobmFtZTogc3RyaW5nKTogQ29udGFpbmVyTGF5ZXIge1xuXHRcdHJldHVybiB0aGlzLmxheWVyTWFwLmdldChuYW1lKTtcblx0fVxuXG59XG5cbmV4cG9ydCBjbGFzcyBDb250YWluZXJMYXllck1hbmFnZXIge1xuXG5cdHByaXZhdGUgY29udGFpbmVyTGF5ZXI6IENvbnRhaW5lckxheWVyO1xuXHRwcml2YXRlIHNlbGVjdGVkOiBzdHJpbmc7XG5cdFxuXHRjb25zdHJ1Y3Rvcihjb250YWluZXJMYXllcjogQ29udGFpbmVyTGF5ZXIsIFxuXHQgIHJlYWRvbmx5IGRpc3BsYXlMYXllcjogQ29udGFpbmVyTGF5ZXIgPSBjb250YWluZXJMYXllcikge1xuXHRcdHRoaXMuY29udGFpbmVyTGF5ZXIgPSBjb250YWluZXJMYXllcjtcblx0fVxuXG5cdHNldExheWVyQ29udGFpbmVyKGNvbnRhaW5lckxheWVyOiBDb250YWluZXJMYXllcikge1xuXHRcdHRoaXMuY29udGFpbmVyTGF5ZXIgPSBjb250YWluZXJMYXllcjtcblx0fVxuXG5cdHNldFNlbGVjdGVkKG5hbWU6IHN0cmluZyk6IFJlY3RMYXllciB7XG5cdFx0dGhpcy5zZWxlY3RlZCA9IG5hbWU7XG5cblx0XHRsZXQgbGF5ZXI6IENhbnZhc0xheWVyID0gdGhpcy5jb250YWluZXJMYXllci5nZXQodGhpcy5zZWxlY3RlZCk7XG5cblx0XHRsZXQgbGF5ZXJSZWN0ID0gbmV3IFJlY3RMYXllcihsYXllci5nZXREaW1lbnNpb24oKSwgMSwgdHJ1ZSk7XG5cblx0XHRsZXQgbGF5ZXJOYW1lID0gXCJvdXRsaW5lXCI7XG5cblx0XHR0aGlzLmRpc3BsYXlMYXllci5zZXQobGF5ZXJOYW1lLCBsYXllclJlY3QpO1xuXG5cdFx0cmV0dXJuIGxheWVyUmVjdDtcblx0fVxuXG5cdHRvZ2dsZVZpc2liaWxpdHkoc2VsZWN0ZWQ6IGJvb2xlYW4gPSB0cnVlKXtcblx0XHRsZXQgdG9nZ2xlR3JvdXA6IEFycmF5PERpc3BsYXlFbGVtZW50PiA9IFtdO1xuXHRcdGlmIChzZWxlY3RlZCl7XG5cdFx0XHRpZiAodGhpcy5zZWxlY3RlZCAhPSBcIlwiKXtcblx0XHRcdFx0dG9nZ2xlR3JvdXAucHVzaCh0aGlzLmNvbnRhaW5lckxheWVyLmdldCh0aGlzLnNlbGVjdGVkKSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZvciAobGV0IHBhaXIgb2YgdGhpcy5jb250YWluZXJMYXllci5sYXllck1hcCl7XG5cblx0XHRcdFx0aWYgKHBhaXJbMF0gIT0gdGhpcy5zZWxlY3RlZCl7XG5cdFx0XHRcdFx0dG9nZ2xlR3JvdXAucHVzaChwYWlyWzFdKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcImxheWVyTmFtZTogXCIgKyB0aGlzLnNlbGVjdGVkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZvciAobGV0IGVsZW1lbnQgb2YgdG9nZ2xlR3JvdXApe1xuXHRcdFx0ZWxlbWVudC5zZXRWaXNpYmxlKCFlbGVtZW50LmlzVmlzaWJsZSgpKVxuXHRcdH1cblx0fVxuXG59IiwiaW1wb3J0IHsgRGlzcGxheUVsZW1lbnQgfSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5pbXBvcnQgeyBUcmFuc2Zvcm0sIFxuXHRCYXNpY1RyYW5zZm9ybSwgXG5cdFZpZXdUcmFuc2Zvcm0sIFxuXHRjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgRGltZW5zaW9uIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuaW1wb3J0IHsgQ2FudmFzRWxlbWVudCB9IGZyb20gXCIuL2xheWVyXCI7XG5cbmV4cG9ydCBjbGFzcyBEaXNwbGF5UmFuZ2Uge1xuXG4gICAgc3RhdGljIHJlYWRvbmx5IEFsbFJhbmdlID0gbmV3IERpc3BsYXlSYW5nZSgtMSwgLTEpO1xuXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBtaW5ab29tOiBudW1iZXIsIHB1YmxpYyBtYXhab29tOiBudW1iZXIpe31cblxuXHR3aXRoaW5SYW5nZSh6b29tOiBudW1iZXIpOiBCb29sZWFuIHtcblx0XHRyZXR1cm4gKCh6b29tID49IHRoaXMubWluWm9vbSB8fCB0aGlzLm1pblpvb20gPT0gLTEpICYmIFxuXHRcdFx0KHpvb20gPD0gdGhpcy5tYXhab29tIHx8IHRoaXMubWF4Wm9vbSA9PSAtMSkpO1xuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBNdWx0aVJlc0xheWVyIGV4dGVuZHMgQ2FudmFzRWxlbWVudCB7XG5cblx0bGF5ZXJNYXAgPSBuZXcgTWFwPERpc3BsYXlSYW5nZSwgQ2FudmFzRWxlbWVudD4oKTtcblxuXHRzZXQoZGlzcGxheVJhbmdlOiBEaXNwbGF5UmFuZ2UsIGxheWVyOiBDYW52YXNFbGVtZW50KXtcblx0XHR0aGlzLmxheWVyTWFwLnNldChkaXNwbGF5UmFuZ2UsIGxheWVyKTtcblx0fVxuXHRcblx0ZHJhdyhcblx0ICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgXG5cdCAgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHQgIHZpZXc6IFZpZXdUcmFuc2Zvcm0pOiBib29sZWFuIHtcblxuXHRcdGxldCBsYXllclRyYW5zZm9ybSA9IGNvbWJpbmVUcmFuc2Zvcm0odGhpcy5sb2NhbFRyYW5zZm9ybSwgcGFyZW50VHJhbnNmb3JtKTtcblxuXHRcdHZhciBkcmF3aW5nQ29tcGxldGUgPSB0cnVlO1xuXG5cdFx0Zm9yIChsZXQgW3JhbmdlLCBsYXllcl0gb2YgdGhpcy5sYXllck1hcCl7XG5cdFx0XHRpZiAocmFuZ2Uud2l0aGluUmFuZ2Uodmlldy56b29tWCkgJiYgbGF5ZXIuaXNWaXNpYmxlKCkpe1xuXHRcdFx0XHRkcmF3aW5nQ29tcGxldGUgPSBkcmF3aW5nQ29tcGxldGUgJiYgbGF5ZXIuZHJhdyhjdHgsIGxheWVyVHJhbnNmb3JtLCB2aWV3KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZHJhd2luZ0NvbXBsZXRlO1xuXHR9XG5cblx0Z2V0RGltZW5zaW9uKCk6IERpbWVuc2lvbiB7XG5cdFx0dmFyIHhNaW4gPSB0aGlzLng7XG5cdFx0dmFyIHlNaW4gPSB0aGlzLnk7XG5cdFx0dmFyIHhNYXggPSB0aGlzLng7XG5cdFx0dmFyIHlNYXggPSB0aGlzLnk7XG5cblx0XHRmb3IgKGxldCBbcmFuZ2UsIGxheWVyXSBvZiB0aGlzLmxheWVyTWFwKXtcblx0XHRcdGxldCBsYXllckRpbWVuc2lvbiA9IGxheWVyLmdldERpbWVuc2lvbigpO1xuXHRcdFx0eE1pbiA9IE1hdGgubWluKHhNaW4sIHRoaXMueCArIGxheWVyRGltZW5zaW9uLngpO1xuXHRcdFx0eU1pbiA9IE1hdGgubWluKHlNaW4sIHRoaXMueSArIGxheWVyRGltZW5zaW9uLnkpO1xuXHRcdFx0eE1heCA9IE1hdGgubWF4KHhNYXgsIHRoaXMueCArIGxheWVyRGltZW5zaW9uLnggKyB0aGlzLnpvb21YICogbGF5ZXJEaW1lbnNpb24udyk7XG5cdFx0XHR5TWF4ID0gTWF0aC5tYXgoeU1heCwgdGhpcy55ICsgbGF5ZXJEaW1lbnNpb24ueSArIHRoaXMuem9vbVkgKiBsYXllckRpbWVuc2lvbi5oKTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIG5ldyBEaW1lbnNpb24oeE1pbiwgeU1pbiwgeE1heCAtIHhNaW4sIHlNYXggLSB5TWluKTtcblx0fVxufSIsImltcG9ydCB7IFRyYW5zZm9ybSwgQmFzaWNUcmFuc2Zvcm0sIGNvbWJpbmVUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBEcmF3TGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgRGlzcGxheUVsZW1lbnQgfSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5pbXBvcnQgeyBEaW1lbnNpb24sIHJvdGF0ZSwgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGFycmF5VG9Qb2ludHMocG9pbnRBcnJheTogQXJyYXk8QXJyYXk8bnVtYmVyPj4pOiBBcnJheTxQb2ludDJEPiB7XG5cdGxldCBwb2ludHM6IEFycmF5PFBvaW50MkQ+ID0gW107XG5cdGZvciAobGV0IGFycmF5UG9pbnQgb2YgcG9pbnRBcnJheSl7XG5cdFx0bGV0IHBvaW50ID0gbmV3IFBvaW50MkQoYXJyYXlQb2ludFswXSwgYXJyYXlQb2ludFsxXSk7XG5cdFx0cG9pbnRzLnB1c2gocG9pbnQpO1xuXHR9XG5cdHJldHVybiBwb2ludHM7XG59XG5cbmV4cG9ydCBjbGFzcyBTaGFwZSBleHRlbmRzIERyYXdMYXllciAge1xuXG5cdHB1YmxpYyBmaWxsOiBib29sZWFuO1xuXHRwdWJsaWMgcG9pbnRzOiBBcnJheTxQb2ludDJEPjtcblxuXHRjb25zdHJ1Y3Rvcihcblx0ICBsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0ICBvcGFjaXR5OiBudW1iZXIsXG5cdCAgdmlzaWJsZTogYm9vbGVhbixcblx0ICBuYW1lOiBzdHJpbmcsIFxuXHQgIGRlc2NyaXB0aW9uOiBzdHJpbmcsXG5cdCkge1xuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCBvcGFjaXR5LCB2aXNpYmxlLCBuYW1lLCBkZXNjcmlwdGlvbik7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdCAgdmlldzogVHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0ICBcdGxldCBjdHhUcmFuc2Zvcm0gPSBjb21iaW5lVHJhbnNmb3JtKHRoaXMsIHBhcmVudFRyYW5zZm9ybSk7XG5cblx0XHR0aGlzLnByZXBhcmVDdHgoY3R4LCBjdHhUcmFuc2Zvcm0sIHZpZXcpO1xuXG5cdFx0aWYgKHRoaXMudmlzaWJsZSkge1xuXHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0bGV0IHN0YXJ0ID0gdGhpcy5wb2ludHNbMF07XG5cdFx0XHRjdHgubW92ZVRvKHN0YXJ0LngsIHN0YXJ0LnkpO1xuXHRcdFx0Zm9yIChsZXQgcG9pbnQgb2YgdGhpcy5wb2ludHMpe1xuXHRcdFx0XHRjdHgubGluZVRvKHBvaW50LngsIHBvaW50LnkpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMuZmlsbCkge1xuXHRcdFx0XHRjdHguZmlsbCgpO1xuXHRcdFx0fVxuXHRcdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdH1cblxuXHRcdHRoaXMuY2xlYW5DdHgoY3R4LCBjdHhUcmFuc2Zvcm0sIHZpZXcpO1xuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHRyZXR1cm4gbmV3IERpbWVuc2lvbigwLCAwLCAwLCAwKTtcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgUG9pbnQgZXh0ZW5kcyBEcmF3TGF5ZXIgaW1wbGVtZW50cyBEaXNwbGF5RWxlbWVudCB7XG5cblx0Y29uc3RydWN0b3IoeDogbnVtYmVyLCB5Om51bWJlciwgcHVibGljIHJhZGl1czogbnVtYmVyLCBcblx0XHRvcGFjaXR5OiBudW1iZXIsXG5cdFx0dmlzaWJsZTogYm9vbGVhbikge1xuXG5cdFx0c3VwZXIobmV3IEJhc2ljVHJhbnNmb3JtKHgsIHksIDEsIDEsIDApLCBcblx0XHRcdG9wYWNpdHksIHZpc2libGUsIFwicG9pbnRcIik7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdFx0dmlldzogVHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0XHRsZXQgeCA9ICh0aGlzLnggKyBwYXJlbnRUcmFuc2Zvcm0ueCAtIHZpZXcueCkgKiB2aWV3Lnpvb21YO1xuXHRcdGxldCB5ID0gKHRoaXMueSArIHBhcmVudFRyYW5zZm9ybS55IC0gdmlldy55KSAqIHZpZXcuem9vbVk7XG5cblx0XHRsZXQgd2lkdGggPSB0aGlzLnJhZGl1cyAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IGhlaWdodCA9IHRoaXMucmFkaXVzICogdmlldy56b29tWTtcblxuXHRcdGN0eC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG5cdFx0Y3R4LmZpbGxTdHlsZSA9IFwicmVkXCI7XG5cdFx0XG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC5tb3ZlVG8oeCwgeSk7XG5cdFx0Y3R4LmFyYyh4LCB5LCB3aWR0aCwgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcblx0XHRjdHguZmlsbCgpO1xuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHRyZXR1cm4gbmV3IERpbWVuc2lvbih0aGlzLngsIHRoaXMueSwgdGhpcy5yYWRpdXMsIHRoaXMucmFkaXVzKTtcblx0fVxuXG5cdGluc2lkZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IGJvb2xlYW4ge1xuXHRcdGxldCB4ZGlmZiA9IHRoaXMueCAtIHg7XG5cdFx0bGV0IHlkaWZmID0gdGhpcy55IC0geTtcblxuXHRcdGxldCBkaXN0YW5jZSA9IE1hdGguc3FydCh4ZGlmZiAqIHhkaWZmICsgeWRpZmYgKiB5ZGlmZik7XG5cdFx0XG5cdFx0cmV0dXJuIGRpc3RhbmNlIDwgdGhpcy5yYWRpdXM7XG5cdH1cblxufVxuIiwiaW1wb3J0IHsgVHJhbnNmb3JtLCBCYXNpY1RyYW5zZm9ybSwgY29tYmluZVRyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IERyYXdMYXllciwgQ2FudmFzRWxlbWVudCB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBEaXNwbGF5RWxlbWVudCB9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IERpbWVuc2lvbiwgcm90YXRlLCBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRodW1iIGV4dGVuZHMgRGlzcGxheUVsZW1lbnQge1xuXG5cdGRyYXdUaHVtYihjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdzogbnVtYmVyLCBoOiBudW1iZXIpOiBib29sZWFuO1xuXG59XG5cbmV4cG9ydCBjbGFzcyBTdGF0aWNJbWFnZSBleHRlbmRzIERyYXdMYXllciBpbXBsZW1lbnRzIFRodW1iIHtcblxuXHRwcml2YXRlIGltZzogSFRNTEltYWdlRWxlbWVudDtcblxuXHRjb25zdHJ1Y3Rvcihcblx0ICBsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0ICBpbWFnZVNyYzogc3RyaW5nLCBcblx0ICBvcGFjaXR5OiBudW1iZXIsXG5cdCAgdmlzaWJsZTogYm9vbGVhbixcblx0ICBkZXNjcmlwdGlvbjogc3RyaW5nLFxuXHQpIHtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCBvcGFjaXR5LCB2aXNpYmxlLCBpbWFnZVNyYywgZGVzY3JpcHRpb24pO1xuXHRcdFxuXHRcdHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG5cdFx0dGhpcy5pbWcuc3JjID0gaW1hZ2VTcmM7XG5cdH1cblxuXHRwcml2YXRlIGRyYXdJbWFnZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHZpZXc6IFRyYW5zZm9ybSl7XG5cblx0XHRpZiAodGhpcy5pc1Zpc2libGUoKSl7XG5cdFx0XHRsZXQgY3R4VHJhbnNmb3JtID0gY29tYmluZVRyYW5zZm9ybSh0aGlzLCBwYXJlbnRUcmFuc2Zvcm0pO1xuXG5cdFx0XHR0aGlzLnByZXBhcmVDdHgoY3R4LCBjdHhUcmFuc2Zvcm0sIHZpZXcpO1xuXHRcdFx0XG5cdFx0XHRjdHguZ2xvYmFsQWxwaGEgPSB0aGlzLm9wYWNpdHk7XG5cdFx0XHRjdHguZHJhd0ltYWdlKHRoaXMuaW1nLCAwLCAwKTtcblx0XHRcdGN0eC5nbG9iYWxBbHBoYSA9IDE7XG5cblx0XHRcdHRoaXMuY2xlYW5DdHgoY3R4LCBjdHhUcmFuc2Zvcm0sIHZpZXcpO1xuXHRcdH1cblx0XHRcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHBhcmVudFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0ICB2aWV3OiBUcmFuc2Zvcm0pOiBib29sZWFuIHtcblxuXHRcdGlmICh0aGlzLnZpc2libGUgJiYgdGhpcy5pbWcuY29tcGxldGUpIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgcGFyZW50VHJhbnNmb3JtLCB2aWV3KTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRlbHNlIGlmICghdGhpcy5pbWcuY29tcGxldGUpe1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGRyYXdUaHVtYihjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdzogbnVtYmVyLCBoOiBudW1iZXIpOiBib29sZWFuIHtcblx0XHRcblx0XHRpZiAodGhpcy52aXNpYmxlICYmIHRoaXMuaW1nLmNvbXBsZXRlKSB7XG5cdFx0XHRsZXQgc2NhbGVYID0gdyAvIHRoaXMuaW1nLndpZHRoO1xuXHRcdFx0bGV0IHNjYWxlWSA9IGggLyB0aGlzLmltZy5oZWlnaHQ7XG5cdFx0XHRsZXQgc2NhbGUgPSBNYXRoLm1pbihzY2FsZVgsIHNjYWxlWSk7XG5cdFx0XHRjdHguc2NhbGUoc2NhbGUsIHNjYWxlKTtcblx0XHRcdC8vY29uc29sZS5sb2coXCJzY2FsZXggXCIgKyAodGhpcy5pbWcud2lkdGggKiBzY2FsZSkpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcInNjYWxleSBcIiArICh0aGlzLmltZy5oZWlnaHQgKiBzY2FsZSkpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcInh5IFwiICsgdGhpcy5pbWcueCArIFwiLCBcIiArIHRoaXMuaW1nLnkpO1xuXHRcdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZywgMCwgMCk7XG5cdFx0XHRjdHguc2NhbGUoMS9zY2FsZSwgMS9zY2FsZSk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIXRoaXMuaW1nLmNvbXBsZXRlKXtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHRcblx0XHRpZiAodGhpcy5pbWcuY29tcGxldGUpe1xuXHRcdFx0dmFyIHdpZHRoID0gdGhpcy5pbWcud2lkdGggKiB0aGlzLnpvb21YO1xuXHRcdFx0dmFyIGhlaWdodCA9IHRoaXMuaW1nLmhlaWdodCAqIHRoaXMuem9vbVk7XG5cblx0XHRcdGxldCBwMSA9IHJvdGF0ZShuZXcgUG9pbnQyRCh3aWR0aCwgMCksIHRoaXMucm90YXRpb24pO1xuXHRcdFx0bGV0IHAyID0gcm90YXRlKG5ldyBQb2ludDJEKHdpZHRoLCAtaGVpZ2h0KSwgdGhpcy5yb3RhdGlvbik7XG5cdFx0XHRsZXQgcDMgPSByb3RhdGUobmV3IFBvaW50MkQoMCwgLWhlaWdodCksIHRoaXMucm90YXRpb24pO1xuXG5cdFx0XHRsZXQgbWluWCA9IE1hdGgubWluKDAsIHAxLngsIHAyLngsIHAzLngpO1xuXHRcdFx0bGV0IG1pblkgPSBNYXRoLm1pbigwLCBwMS55LCBwMi55LCBwMy55KTtcblx0XHRcdGxldCBtYXhYID0gTWF0aC5tYXgoMCwgcDEueCwgcDIueCwgcDMueCk7XG5cdFx0XHRsZXQgbWF4WSA9IE1hdGgubWF4KDAsIHAxLnksIHAyLnksIHAzLnkpO1xuXG5cdFx0XHRyZXR1cm4gbmV3IERpbWVuc2lvbih0aGlzLnggKyBtaW5YLCB0aGlzLnkgLSBtYXhZLCBtYXhYLW1pblgsIG1heFktbWluWSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBEaW1lbnNpb24odGhpcy54LCB0aGlzLnksIDAsIDApO1xuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWN0TGF5ZXIgZXh0ZW5kcyBEcmF3TGF5ZXIgaW1wbGVtZW50cyBEaXNwbGF5RWxlbWVudCB7XG5cblx0Y29uc3RydWN0b3IocHJpdmF0ZSBkaW1lbnNpb246IERpbWVuc2lvbiwgXG5cdFx0b3BhY2l0eTogbnVtYmVyLFxuXHRcdHZpc2libGU6IGJvb2xlYW4pIHtcblxuXHRcdHN1cGVyKG5ldyBCYXNpY1RyYW5zZm9ybShkaW1lbnNpb24ueCwgZGltZW5zaW9uLnksIDEsIDEsIDApLCBcblx0XHRcdG9wYWNpdHksIHZpc2libGUsIFwicmVjdFwiKTtcblx0fVxuXG5cdHVwZGF0ZURpbWVuc2lvbihkaW1lbnNpb246IERpbWVuc2lvbik6IHZvaWQge1xuXHRcdHRoaXMuZGltZW5zaW9uID0gZGltZW5zaW9uO1xuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHRcdHZpZXc6IFRyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0bGV0IHggPSAodGhpcy5kaW1lbnNpb24ueCArIHBhcmVudFRyYW5zZm9ybS54IC0gdmlldy54KSAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IHkgPSAodGhpcy5kaW1lbnNpb24ueSArIHBhcmVudFRyYW5zZm9ybS55IC0gdmlldy55KSAqIHZpZXcuem9vbVk7XG5cblx0XHRjdHguc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuXHRcdGN0eC5zdHJva2VSZWN0KHgsIHksIHRoaXMuZGltZW5zaW9uLncgKiB2aWV3Lnpvb21YLCB0aGlzLmRpbWVuc2lvbi5oICogdmlldy56b29tWSk7XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGdldERpbWVuc2lvbigpOiBEaW1lbnNpb24ge1xuXHRcdHJldHVybiB0aGlzLmRpbWVuc2lvbjtcblx0fVxuXG59IiwiaW1wb3J0IHsgRHJhd0xheWVyIH0gZnJvbSBcIi4vbGF5ZXJcIjtcbmltcG9ydCB7IFRyYW5zZm9ybSwgQmFzaWNUcmFuc2Zvcm0sIFZpZXdUcmFuc2Zvcm0sIGNvbWJpbmVUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBEaW1lbnNpb24gfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbmV4cG9ydCBjbGFzcyBUaWxlU3RydWN0IHtcblx0XG5cdGNvbnN0cnVjdG9yKFxuXHRcdHB1YmxpYyBwcmVmaXg6IHN0cmluZyxcblx0XHRwdWJsaWMgc3VmZml4OiBzdHJpbmcsXG5cdFx0cHVibGljIHRpbGVEaXJlY3Rvcnk6IHN0cmluZyl7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gem9vbUJ5TGV2ZWwoem9vbUxldmVsOiBudW1iZXIpe1xuXHRyZXR1cm4gTWF0aC5wb3coMiwgem9vbUxldmVsKTtcbn1cblxuZXhwb3J0IGNsYXNzIFRpbGVMYXllciBleHRlbmRzIERyYXdMYXllciB7XG5cblx0dGlsZU1hbmFnZXI6IFRpbGVNYW5hZ2VyO1xuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdGxvY2FsVHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHRcdHJlYWRvbmx5IHRpbGVTdHJ1Y3Q6IFRpbGVTdHJ1Y3QsXG5cdFx0dmlzYmlsZTogYm9vbGVhbixcblx0XHRuYW1lOiBzdHJpbmcgPSBcInRpbGVzXCIsXG5cdFx0cHVibGljIHhPZmZzZXQ6IG51bWJlciA9IDAsXG5cdFx0cHVibGljIHlPZmZzZXQ6IG51bWJlciA9IDAsXG5cdFx0cHVibGljIHpvb206IG51bWJlciA9IDEsXG5cdFx0cmVhZG9ubHkgZ3JpZFdpZHRoOiBudW1iZXIgPSAyNTYsIFxuXHRcdHJlYWRvbmx5IGdyaWRIZWlnaHQ6IG51bWJlciA9IDI1Nixcblx0XHRvcGFjaXR5OiBudW1iZXIgPSAxKXtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCBvcGFjaXR5LCB2aXNiaWxlLCBuYW1lKTtcblxuXHRcdHRoaXMudGlsZU1hbmFnZXIgPSBuZXcgVGlsZU1hbmFnZXIoKTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHBhcmVudFRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBWaWV3VHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0XHRpZiAodGhpcy5pc1Zpc2libGUoKSl7XG5cblx0XHRcdGxldCBjdHhUcmFuc2Zvcm0gPSBjb21iaW5lVHJhbnNmb3JtKHRoaXMsIHBhcmVudFRyYW5zZm9ybSk7XG5cblx0XHRcdGxldCB6b29tV2lkdGg6IG51bWJlciA9IHRoaXMuZ3JpZFdpZHRoICogY3R4VHJhbnNmb3JtLnpvb21YXG5cdFx0XHRsZXQgem9vbUhlaWdodDogbnVtYmVyID0gdGhpcy5ncmlkSGVpZ2h0ICogY3R4VHJhbnNmb3JtLnpvb21ZO1xuXG5cdFx0XHRsZXQgdHJhbnNmb3JtWCA9IHZpZXcueCArIGN0eFRyYW5zZm9ybS54O1xuXHRcdFx0bGV0IHRyYW5zZm9ybVkgPSB2aWV3LnkgKyBjdHhUcmFuc2Zvcm0ueTtcblxuXHRcdFx0bGV0IHZpZXdYID0gdmlldy54ICogdmlldy56b29tWDtcblx0XHRcdGxldCB2aWV3WSA9IHZpZXcueSAqIHZpZXcuem9vbVk7XG5cblx0XHRcdGxldCB2aWV3V2lkdGggPSB2aWV3LndpZHRoIC8gdmlldy56b29tWDtcblx0XHRcdGxldCB2aWV3SGVpZ2h0ID0gdmlldy5oZWlnaHQgLyB2aWV3Lnpvb21ZO1xuXG5cdFx0XHRsZXQgZ3JpZEFjcm9zcyA9IHZpZXdXaWR0aCAvIHpvb21XaWR0aDtcblx0XHRcdGxldCBncmlkSGlnaCA9IHZpZXdIZWlnaHQgLyB6b29tSGVpZ2h0O1xuXG5cdFx0XHRsZXQgeE1pbiA9IE1hdGguZmxvb3IodHJhbnNmb3JtWCAvIHpvb21XaWR0aCk7XG5cdFx0XHRsZXQgeE1heCA9IE1hdGguY2VpbCgodHJhbnNmb3JtWCArIHZpZXdXaWR0aCkgLyB6b29tV2lkdGgpO1xuXG5cdFx0XHRsZXQgeU1pbiA9IE1hdGguZmxvb3IodHJhbnNmb3JtWSAvIHpvb21IZWlnaHQpO1xuXHRcdFx0bGV0IHlNYXggPSBNYXRoLmNlaWwoKHRyYW5zZm9ybVkgKyB2aWV3SGVpZ2h0KSAvIHpvb21IZWlnaHQpO1xuXG5cdFx0XHR2YXIgZHJhd2luZ0NvbXBsZXRlID0gdHJ1ZTtcblxuXHRcdFx0bGV0IGZ1bGxab29tWCA9IGN0eFRyYW5zZm9ybS56b29tWCAqIHZpZXcuem9vbVg7XG5cdFx0XHRsZXQgZnVsbFpvb21ZID0gY3R4VHJhbnNmb3JtLnpvb21ZICogdmlldy56b29tWTtcblxuXHRcdFx0Y3R4LnNjYWxlKGZ1bGxab29tWCwgZnVsbFpvb21ZKTtcblxuXHRcdFx0Zm9yICh2YXIgeCA9IHhNaW47IHg8eE1heDsgeCsrKXtcblx0XHRcdFx0bGV0IHhNb3ZlID0geCAqIHRoaXMuZ3JpZFdpZHRoIC0gdHJhbnNmb3JtWCAvIGN0eFRyYW5zZm9ybS56b29tWDtcblx0XHRcdFx0Zm9yICh2YXIgeSA9IHlNaW47IHk8eU1heDsgeSsrKXtcblx0XHRcdFx0XHRsZXQgeU1vdmUgPSB5ICogdGhpcy5ncmlkSGVpZ2h0IC0gdHJhbnNmb3JtWSAvIGN0eFRyYW5zZm9ybS56b29tWTtcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKFwidGlsZSB4IHkgXCIgKyB4ICsgXCIgXCIgKyB5ICsgXCI6IFwiICsgeE1vdmUgKyBcIiwgXCIgKyB5TW92ZSk7XG5cblx0XHRcdFx0XHRjdHgudHJhbnNsYXRlKHhNb3ZlLCB5TW92ZSk7XG5cdFx0XHRcdFx0bGV0IHRpbGVTcmMgPSB0aGlzLnRpbGVTdHJ1Y3QudGlsZURpcmVjdG9yeSArIHRoaXMuem9vbSArIFwiL1wiICsgXG5cdFx0XHRcdFx0XHQoeCArIHRoaXMueE9mZnNldCkgKyBcIi9cIiArIFxuXHRcdFx0XHRcdFx0KHkgKyB0aGlzLnlPZmZzZXQpICsgdGhpcy50aWxlU3RydWN0LnN1ZmZpeDtcblxuXHRcdFx0XHRcdGlmICh0aGlzLnRpbGVNYW5hZ2VyLmhhcyh0aWxlU3JjKSkge1xuXHRcdFx0XHRcdFx0bGV0IGltYWdlVGlsZSA9IHRoaXMudGlsZU1hbmFnZXIuZ2V0KHRpbGVTcmMpO1xuXHRcdFx0XHRcdFx0ZHJhd2luZ0NvbXBsZXRlID0gZHJhd2luZ0NvbXBsZXRlICYmIGltYWdlVGlsZS5kcmF3KGN0eCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0bGV0IGltYWdlVGlsZSA9IG5ldyBJbWFnZVRpbGUoeCwgeSwgdGlsZVNyYyk7XG5cblx0XHRcdFx0XHRcdGRyYXdpbmdDb21wbGV0ZSA9IGRyYXdpbmdDb21wbGV0ZSAmJiBpbWFnZVRpbGUuZHJhdyhjdHgpO1xuXG5cdFx0XHRcdFx0XHR0aGlzLnRpbGVNYW5hZ2VyLnNldCh0aWxlU3JjLCBpbWFnZVRpbGUpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGN0eC50cmFuc2xhdGUoLXhNb3ZlLCAteU1vdmUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGN0eC5zY2FsZSgxIC8gZnVsbFpvb21YLCAxIC8gZnVsbFpvb21ZKTtcblxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImRyZXcgdGlsZXMgXCIgKyBkcmF3aW5nQ29tcGxldGUpO1xuXHRcdFx0cmV0dXJuIGRyYXdpbmdDb21wbGV0ZTtcblx0XHR9IGVsc2UgeyBcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fVxuXG5cdGdldERpbWVuc2lvbigpOiBEaW1lbnNpb24ge1xuXHRcdHJldHVybiBuZXcgRGltZW5zaW9uKDAsIDAsIDAsIDApO1xuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlTWFuYWdlciB7XG5cblx0dGlsZU1hcDogTWFwPHN0cmluZywgSW1hZ2VUaWxlPjtcblxuXHRjb25zdHJ1Y3Rvcigpe1xuXHRcdHRoaXMudGlsZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBJbWFnZVRpbGU+KCk7XG5cdH1cblxuXHRnZXQodGlsZUtleTogc3RyaW5nKTogSW1hZ2VUaWxlIHtcblx0XHRyZXR1cm4gdGhpcy50aWxlTWFwLmdldCh0aWxlS2V5KTtcblx0fVxuXG5cdGhhcyh0aWxlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy50aWxlTWFwLmhhcyh0aWxlS2V5KTtcblx0fVxuXG5cdHNldCh0aWxlS2V5OiBzdHJpbmcsIHRpbGU6IEltYWdlVGlsZSl7XG5cdFx0dGhpcy50aWxlTWFwLnNldCh0aWxlS2V5LCB0aWxlKTtcblx0fVxuXG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZVRpbGUge1xuXG5cdHByaXZhdGUgaW1nOiBIVE1MSW1hZ2VFbGVtZW50O1xuXHRwcml2YXRlIGV4aXN0czogYm9vbGVhbjtcblxuXHRjb25zdHJ1Y3RvcihyZWFkb25seSB4SW5kZXg6IG51bWJlciwgcmVhZG9ubHkgeUluZGV4OiBudW1iZXIsIGltYWdlU3JjOiBzdHJpbmcpIHtcblx0XHR0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuXHRcdHRoaXMuaW1nLnNyYyA9IGltYWdlU3JjO1xuXHRcdHRoaXMuaW1nLm9uZXJyb3IgPSBmdW5jdGlvbihldmVudE9yTWVzc2FnZTogYW55KXtcblx0XHRcdGV2ZW50T3JNZXNzYWdlLnRhcmdldC5zcmMgPSBcIlwiO1xuXHRcdH07XG5cdH07XG5cblx0cHJpdmF0ZSBkcmF3SW1hZ2UoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpe1xuXHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDApO1xuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCk6IGJvb2xlYW4ge1xuXHRcdGlmICh0aGlzLmltZy5zcmMgIT0gXCJcIiAmJiB0aGlzLmltZy5jb21wbGV0ZSApIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xuXG59IiwiLyoqXG4qIEEgd29ybGQgaXMgMCwwIGJhc2VkIGJ1dCBhbnkgZWxlbWVudCBjYW4gYmUgcG9zaXRpb25lZCByZWxhdGl2ZSB0byB0aGlzLlxuKi9cbmV4cG9ydCBpbnRlcmZhY2UgVHJhbnNmb3JtIHtcblx0eDogbnVtYmVyO1xuXHR5OiBudW1iZXI7XG5cdHpvb21YOiBudW1iZXI7XG5cdHpvb21ZOiBudW1iZXI7XG5cdHJvdGF0aW9uOiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBCYXNpY1RyYW5zZm9ybSBpbXBsZW1lbnRzIFRyYW5zZm9ybSB7XG5cbiAgICBzdGF0aWMgcmVhZG9ubHkgdW5pdFRyYW5zZm9ybSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgwLCAwLCAxLCAxLCAwKTtcblxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgeDogbnVtYmVyLCBwdWJsaWMgeTogbnVtYmVyLCBcblx0XHRwdWJsaWMgem9vbVg6IG51bWJlciwgcHVibGljIHpvb21ZOiBudW1iZXIsIFxuXHRcdHB1YmxpYyByb3RhdGlvbjogbnVtYmVyKXt9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21iaW5lVHJhbnNmb3JtKGNoaWxkOiBUcmFuc2Zvcm0sIGNvbnRhaW5lcjogVHJhbnNmb3JtKTogVHJhbnNmb3JtIHtcblx0bGV0IHpvb21YID0gY2hpbGQuem9vbVggKiBjb250YWluZXIuem9vbVg7XG5cdC8vY29uc29sZS5sb2coXCJtb2RpZmllZCBcIiArIGNoaWxkLnpvb21YICsgXCIgdG8gXCIgKyB6b29tWCk7XG5cdGxldCB6b29tWSA9IGNoaWxkLnpvb21ZICogY29udGFpbmVyLnpvb21ZO1xuXHQvL2NvbnNvbGUubG9nKFwibW9kaWZpZWQgXCIgKyBjaGlsZC56b29tWSArIFwiIGJ5IFwiICsgY29udGFpbmVyLnpvb21ZICsgXCIgdG8gXCIgKyB6b29tWSk7XG5cdGxldCB4ID0gKGNoaWxkLnggKiBjb250YWluZXIuem9vbVgpICsgY29udGFpbmVyLng7XG5cdGxldCB5ID0gKGNoaWxkLnkgKiBjb250YWluZXIuem9vbVkpICsgY29udGFpbmVyLnk7XG5cdC8vY29uc29sZS5sb2coXCJtb2RpZmllZCB4IFwiICsgY2hpbGQueCArIFwiIGJ5IFwiICsgY29udGFpbmVyLnpvb21YICsgXCIgYW5kIFwiICsgY29udGFpbmVyLnggKyBcIiB0byBcIiArIHgpO1xuXHRsZXQgcm90YXRpb24gPSBjaGlsZC5yb3RhdGlvbiArIGNvbnRhaW5lci5yb3RhdGlvbjtcblx0cmV0dXJuIG5ldyBCYXNpY1RyYW5zZm9ybSh4LCB5LCB6b29tWCwgem9vbVksIHJvdGF0aW9uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKHRyYW5zZm9ybTogVHJhbnNmb3JtKTogVHJhbnNmb3JtIHtcblx0cmV0dXJuIG5ldyBCYXNpY1RyYW5zZm9ybSh0cmFuc2Zvcm0ueCwgdHJhbnNmb3JtLnksIFxuXHRcdHRyYW5zZm9ybS56b29tWCwgdHJhbnNmb3JtLnpvb21ZLCB0cmFuc2Zvcm0ucm90YXRpb24pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0VHJhbnNmb3JtKHdvcmxkU3RhdGU6IFRyYW5zZm9ybSk6IFRyYW5zZm9ybSB7XG5cdHJldHVybiBuZXcgQmFzaWNUcmFuc2Zvcm0oLXdvcmxkU3RhdGUueCwgLXdvcmxkU3RhdGUueSwgXG5cdFx0MS93b3JsZFN0YXRlLnpvb21YLCAxL3dvcmxkU3RhdGUuem9vbVksIC13b3JsZFN0YXRlLnJvdGF0aW9uKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBWaWV3VHJhbnNmb3JtIGV4dGVuZHMgVHJhbnNmb3JtIHtcblx0d2lkdGg6IG51bWJlcjtcblx0aGVpZ2h0OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBCYXNpY1ZpZXdUcmFuc2Zvcm0gZXh0ZW5kcyBCYXNpY1RyYW5zZm9ybSBpbXBsZW1lbnRzIFZpZXdUcmFuc2Zvcm0ge1xuXG5cdGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyLCBcblx0XHRyZWFkb25seSB3aWR0aDogbnVtYmVyLCByZWFkb25seSBoZWlnaHQ6IG51bWJlcixcblx0XHR6b29tWDogbnVtYmVyLCB6b29tWTogbnVtYmVyLCBcblx0ICAgIHJvdGF0aW9uOiBudW1iZXIpe1xuXG5cdFx0c3VwZXIoeCwgeSwgem9vbVgsIHpvb21ZLCByb3RhdGlvbik7XG5cdH1cblxufVxuXG5cblxuIiwibW9kdWxlLmV4cG9ydHM9W1xuXHR7XG5cdFwibmFtZVwiOiBcIjItMlwiLCBcInhcIjogLTM2NCwgXCJ5XCI6IC0xMi41LCBcInpvb21YXCI6IDAuMjEzLCBcInpvb21ZXCI6IDAuMjA1LCBcInJvdGF0aW9uXCI6IC0wLjMxLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDJyXzJbU1ZDMl0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiM1wiLCBcInhcIjogLTIxNiwgXCJ5XCI6IC0wLjcwNSwgXCJ6b29tWFwiOiAwLjIsIFwiem9vbVlcIjogMC4yMSwgXCJyb3RhdGlvblwiOiAtMC41MSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDAzcltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI0XCIsIFwieFwiOiAtNzQuMjksIFwieVwiOiAtOTkuNzgsIFwiem9vbVhcIjogMC4yMjIsIFwiem9vbVlcIjogMC4yMDgsIFwicm90YXRpb25cIjogLTAuMjg1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDRyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjVcIiwgXCJ4XCI6IC0zNjYuNSwgXCJ5XCI6IDE4MC4wMTksIFwiem9vbVhcIjogMC4yMTUsIFwiem9vbVlcIjogMC4yMDcsIFwicm90YXRpb25cIjogLTAuMjEsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwNXJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiNlwiLCBcInhcIjogLTIwNi4xNiwgXCJ5XCI6IDE0NiwgXCJ6b29tWFwiOiAwLjIxLCBcInpvb21ZXCI6IDAuMjA4LCBcInJvdGF0aW9uXCI6IC0wLjIxNSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA2cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI3XCIsIFwieFwiOiAtNjMuMywgXCJ5XCI6IDEwMC4zNzc2LCBcInpvb21YXCI6IDAuMjEyNSwgXCJ6b29tWVwiOiAwLjIxMywgXCJyb3RhdGlvblwiOiAtMC4yMywgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA3cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI4XCIsIFwieFwiOiA3OC4xLCBcInlcIjogNTguNTM1LCBcInpvb21YXCI6IDAuMjA3LCBcInpvb21ZXCI6IDAuMjE3LCBcInJvdGF0aW9uXCI6IC0wLjI1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDhyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjlcIiwgXCJ4XCI6IDIxOS41LCBcInlcIjogMjQsIFwiem9vbVhcIjogMC4yMTUsIFwiem9vbVlcIjogMC4yMTQ1LCBcInJvdGF0aW9uXCI6IC0wLjI2LFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwOXJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTBcIiwgXCJ4XCI6IDQ1NC4yMSwgXCJ5XCI6IC0xLjUsIFwiem9vbVhcIjogMC4yMTgsIFwiem9vbVlcIjogMC4yMTQsIFwicm90YXRpb25cIjogMC4wMTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxMHJfMltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxMVwiLCBcInhcIjogNjIxLjg2LCBcInlcIjogMjUuNTI1LCBcInpvb21YXCI6IDAuMjEzLCBcInpvb21ZXCI6IDAuMjExNSwgXCJyb3RhdGlvblwiOiAwLjExLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTFyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LCBcblx0e1xuXHRcIm5hbWVcIjogXCIxMi0xXCIsIFwieFwiOiA3NjkuNjQ1LCBcInlcIjogNTAuMjY1LCBcInpvb21YXCI6IDAuNDI0LCBcInpvb21ZXCI6IDAuNDIyLCBcInJvdGF0aW9uXCI6IDAuMTIsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxMnJfMVtTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxNFwiLCBcInhcIjogLTkxNS42LCBcInlcIjogNTU3Ljg2NSwgXCJ6b29tWFwiOiAwLjIwOCwgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAtMS4yMTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxNFJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTUtMlwiLCBcInhcIjogLTcxNy4zLCBcInlcIjogNTcyLCBcInpvb21YXCI6IDAuMjEsIFwiem9vbVlcIjogMC4yMDYsIFwicm90YXRpb25cIjogLTEuNDcsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxNXJfMltTVkMyXS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxNi0yXCIsIFwieFwiOiAtOTIsIFwieVwiOiAzMzYuNSwgXCJ6b29tWFwiOiAwLjIxNywgXCJ6b29tWVwiOiAwLjIxLCBcInJvdGF0aW9uXCI6IC0wLjEsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxNnJfMltTVkMyXS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxN1wiLCBcInhcIjogNzcsIFwieVwiOiAyNzguNSwgXCJ6b29tWFwiOiAwLjIwNiwgXCJ6b29tWVwiOiAwLjIwNiwgXCJyb3RhdGlvblwiOiAtMC4wNTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxN1JbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMThcIiwgXCJ4XCI6IDIyOSwgXCJ5XCI6IDIzOS41LCBcInpvb21YXCI6IDAuMjA4LCBcInpvb21ZXCI6IDAuMjA4LCBcInJvdGF0aW9uXCI6IDAuMDcsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxOFJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTlcIiwgXCJ4XCI6IDcxLjUsIFwieVwiOiA0NzQsIFwiem9vbVhcIjogMC4yMDMsIFwiem9vbVlcIjogMC4yMDgsIFwicm90YXRpb25cIjogMC4xNywgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDE5UltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIyMFwiLCBcInhcIjogNDMuNSwgXCJ5XCI6IDY0MCwgXCJ6b29tWFwiOiAwLjEsIFwiem9vbVlcIjogMC4xMDQsIFwicm90YXRpb25cIjogMC4yMDUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAyMFJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH1cblxuXVxuXG5cblxuIiwibW9kdWxlLmV4cG9ydHM9W1xuXHR7XG5cdFx0XCJuYW1lXCI6IFwiaGVucmlldHRhXCIsIFwieFwiOiAtNDg2LjUsIFwieVwiOiAtMjUyLjUsIFwiem9vbVhcIjogMC4yOSwgXCJ6b29tWVwiOiAwLjUsIFwicm90YXRpb25cIjogMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2hlbnJpZXR0YS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtYXRlclwiLCBcInhcIjogLTM0MiwgXCJ5XCI6IC03NDcsIFwiem9vbVhcIjogMC4wOCwgXCJ6b29tWVwiOiAwLjE4LCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbWF0ZXJtaXMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwicGV0ZXJzXCIsIFwieFwiOiAtNzE5LCBcInlcIjogLTgzNiwgXCJ6b29tWFwiOiAwLjA3LCBcInpvb21ZXCI6IDAuMTQsIFwicm90YXRpb25cIjogLTAuMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9wZXRlcnMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwib2Nvbm5lbGxcIiwgXCJ4XCI6IC04MjEsIFwieVwiOiAtMTgzNSwgXCJ6b29tWFwiOiAwLjI1LCBcInpvb21ZXCI6IDAuMjUsIFwicm90YXRpb25cIjogMCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL29jb25uZWxsLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiZm91cmNvdXJ0c1wiLCBcInhcIjogLTU2Ny41LCBcInlcIjogMzIzLjUsIFwiem9vbVhcIjogMC4xNiwgXCJ6b29tWVwiOiAwLjMyOCwgXCJyb3RhdGlvblwiOiAtMC4xMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2ZvdXJjb3VydHMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtaWNoYW5zXCIsIFwieFwiOiAtNjM5LCBcInlcIjogMTYwLCBcInpvb21YXCI6IDAuMTQsIFwiem9vbVlcIjogMC4yNCwgXCJyb3RhdGlvblwiOiAwLjAyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbWljaGFucy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjhcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInRoZWNhc3RsZVwiLCBcInhcIjogLTI5MCwgXCJ5XCI6IDUyMCwgXCJ6b29tWFwiOiAwLjIyLCBcInpvb21ZXCI6IDAuNDIsIFwicm90YXRpb25cIjogLTAuMDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvdGhlY2FzdGxlLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm1hcmtldFwiLCBcInhcIjogLTYxNywgXCJ5XCI6IDU2NSwgXCJ6b29tWFwiOiAwLjE1LCBcInpvb21ZXCI6IDAuMjYsIFwicm90YXRpb25cIjogMC4wNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21hcmtldC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjVcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInBhdHJpY2tzXCIsIFwieFwiOiAtNDYyLCBcInlcIjogNzk1LCBcInpvb21YXCI6IDAuMSwgXCJ6b29tWVwiOiAwLjEyLCBcInJvdGF0aW9uXCI6IDAuMDQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9wYXRyaWNrcy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjhcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm5naXJlbGFuZFwiLCBcInhcIjogNDMxLCBcInlcIjogNjk0LCBcInpvb21YXCI6IDAuMTQsIFwiem9vbVlcIjogMC4zNzUsIFwicm90YXRpb25cIjogLTAuMTM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbmdpcmVsYW5kLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiYmx1ZWNvYXRzXCIsIFwieFwiOiAtOTk3LCBcInlcIjogODYsIFwiem9vbVhcIjogMC4xLCBcInpvb21ZXCI6IDAuMiwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2JsdWVjb2F0cy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjZcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImNvbGxpbnNiYXJyYWNrc1wiLCBcInhcIjogLTExMzAsIFwieVwiOiA5MCwgXCJ6b29tWFwiOiAwLjEzLCBcInpvb21ZXCI6IDAuMzcsIFwicm90YXRpb25cIjogMC4wMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9jb2xsaW5zYmFycmFja3MucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJodWdobGFuZVwiLCBcInhcIjogLTE3MiwgXCJ5XCI6IC0zMzUsIFwiem9vbVhcIjogMC4yLCBcInpvb21ZXCI6IDAuMzMsIFwicm90YXRpb25cIjogLTAuMDYsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9odWdobGFuZS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImdwb1wiLCBcInhcIjogNTIsIFwieVwiOiA1MCwgXCJ6b29tWFwiOiAwLjA4NiwgXCJ6b29tWVwiOiAwLjI1LCBcInJvdGF0aW9uXCI6IC0wLjAzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2dwby5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm1vdW50am95XCIsIFwieFwiOiAyNjMsIFwieVwiOiAtNTYwLCBcInpvb21YXCI6IDAuMTUsIFwiem9vbVlcIjogMC4yODUsIFwicm90YXRpb25cIjogMC4xNywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21vdW50am95LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibW91bnRqb3liXCIsIFwieFwiOiAxNTIsIFwieVwiOiAtNTcwLCBcInpvb21YXCI6IDAuMiwgXCJ6b29tWVwiOiAwLjMwNSwgXCJyb3RhdGlvblwiOiAwLjA0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbW91bnRqb3liLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwicm95YWxob3NwaXRhbFwiLCBcInhcIjogLTE4NTEsIFwieVwiOiA0ODcuNSwgXCJ6b29tWFwiOiAwLjIxLCBcInpvb21ZXCI6IDAuMywgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL3JveWFsaG9zcGl0YWwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC45XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJwZXBwZXJcIiwgXCJ4XCI6IDgzNCwgXCJ5XCI6IDk5MCwgXCJ6b29tWFwiOiAwLjA2LCBcInpvb21ZXCI6IDAuMTQ1LCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvcGVwcGVyLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibGliZXJ0eWhhbGxcIiwgXCJ4XCI6IDI3MCwgXCJ5XCI6IC0xNCwgXCJ6b29tWFwiOiAwLjQzLCBcInpvb21ZXCI6IDAuNDMsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9saWJlcnR5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiY3VzdG9tc2hvdXNlXCIsIFwieFwiOiAzODIsIFwieVwiOiAxMDcsIFwiem9vbVhcIjogMC4xNSwgXCJ6b29tWVwiOiAwLjMwLCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvY3VzdG9tc2hvdXNlLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9XG5dIiwibW9kdWxlLmV4cG9ydHM9W1xuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAzMlwiLCBcInhcIjogLTc0NSwgXCJ5XCI6IDEwLjA1LCBcInpvb21YXCI6IDAuMjUsIFwiem9vbVlcIjogMC4yNSwgXCJyb3RhdGlvblwiOiAtMS40MywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTAzMi1tLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNywgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNvbnN0aXR1dGlvbiBIaWxsIC0gVHVybnBpa2UsIEdsYXNuZXZpbiBSb2FkOyBzaG93aW5nIHByb3Bvc2VkIHJvYWQgdG8gQm90YW5pYyBHYXJkZW5zXCIsXG5cdFx0XCJkYXRlXCI6IDE3OThcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNzJcIiwgIFwieFwiOiAtMjYwLjUsIFwieVwiOiAtMjQ3LjUsIFwiem9vbVhcIjogMC4zMSwgXCJ6b29tWVwiOiAwLjMxLCBcInJvdGF0aW9uXCI6IDEuNTg1LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0wNzItbS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gb2YgaW1wcm92aW5nIHRoZSBzdHJlZXRzIGJldHdlZW4gUmljaG1vbmQgQnJpZGdlIChGb3VyIENvdXJ0cykgYW5kIENvbnN0aXR1dGlvbiBIaWxsIChLaW5n4oCZcyBJbm5zKSBEYXRlOiAxODM3XCIsXG5cdFx0XCJkYXRlXCI6IDE4Mzdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNzVcIiwgXCJ4XCI6IC0yMTcuNSwgXCJ5XCI6IC0xNDE0LjUsIFwiem9vbVhcIjogMC44NywgXCJ6b29tWVwiOiAwLjc3MiwgXCJyb3RhdGlvblwiOiAxLjYxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTA3NS1tLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIGEgbGluZSBvZiByb2FkLCBsZWFkaW5nIGZyb20gTGluZW4gSGFsbCB0byBHbGFzbmV2aW4gUm9hZCwgc2hvd2luZyB0aGUgUm95YWwgQ2FuYWwgRGF0ZTogMTgwMFwiLFxuXHRcdFwiZGF0ZVwiOiAxODAwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzYxXCIsIFwieFwiOiA0NjQsIFwieVwiOiAyMTMxLCBcInpvb21YXCI6IDAuNDM2LCBcInpvb21ZXCI6IDAuNDM2LCBcInJvdGF0aW9uXCI6IC0yLjA0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM2MS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkxlZXNvbiBTdHJlZXQsIFBvcnRsYW5kIFN0cmVldCAobm93IFVwcGVyIExlZXNvbiBTdHJlZXQpLCBFdXN0YWNlIFBsYWNlLCBFdXN0YWNlIEJyaWRnZSAobm93IExlZXNvbiBTdHJlZXQpLCBIYXRjaCBTdHJlZXQsIENpcmN1bGFyIFJvYWQgLSBzaWduZWQgYnkgQ29tbWlzc2lvbmVycyBvZiBXaWRlIFN0cmVldHMgRGF0ZTogMTc5MlwiLFxuXHRcdFwiZGF0ZVwiOiAxNzkyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTQyXCIsIFwieFwiOiA5NC45OTUsIFwieVwiOiAyMzc3LjUsIFwiem9vbVhcIjogMC40ODIsIFwiem9vbVlcIjogMC40NzYsIFwicm90YXRpb25cIjogLTIuMDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTQyLWwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMS4wLFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgdGhlIE5ldyBTdHJlZXRzLCBhbmQgb3RoZXIgaW1wcm92ZW1lbnRzIGludGVuZGVkIHRvIGJlIGltbWVkaWF0ZWx5IGV4ZWN1dGVkLiBTaXR1YXRlIG9uIHRoZSBTb3V0aCBTaWRlIG9mIHRoZSBDaXR5IG9mIER1Ymxpbiwgc3VibWl0dGVkIGZvciB0aGUgYXBwcm9iYXRpb24gb2YgdGhlIENvbW1pc3Npb25lcnMgb2YgV2lkZSBTdHJlZXRzLCBwYXJ0aWN1bGFybHkgb2YgdGhvc2UgcGFydHMgYmVsb25naW5nIHRvIFdtLiBDb3BlIGFuZCBKb2huIExvY2tlciwgRXNxLiwgSGFyY291cnQgU3RyZWV0LCBDaGFybGVtb3VudCBTdHJlZXQsIFBvcnRvYmVsbG8sIGV0Yy4gRGF0ZTogMTc5MlwiLFxuXHRcdFwiZGF0ZVwiOiAxNzkyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTU1XCIsIFwieFwiOiAtMTUwNiwgXCJ5XCI6IC01MC41LCBcInpvb21YXCI6IDAuNjcsIFwiem9vbVlcIjogMC42NDQsIFwicm90YXRpb25cIjogLTAuMDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTU1LWwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJOZXcgYXBwcm9hY2ggZnJvbSBNaWxpdGFyeSBSb2FkIHRvIEtpbmfigJlzIEJyaWRnZSwgYW5kIGFsb25nIHRoZSBRdWF5cyB0byBBc3RvbuKAmXMgUXVheSBEYXRlOiAxODQxXCIsXG5cdFx0XCJkYXRlXCI6IDE4NDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNTctM1wiLCBcInhcIjogMy4xMTUsIFwieVwiOiAzLjY1LCBcInpvb21YXCI6IDAuNTI1LCBcInpvb21ZXCI6IDAuNTksIFwicm90YXRpb25cIjogMC41NCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE1Ny0zLW0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC4wLCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwic2hvd2luZyB0aGUgaW1wcm92ZW1lbnRzIHByb3Bvc2VkIGJ5IHRoZSBDb21taXNzaW9uZXJzIG9mIFdpZGUgU3RyZWV0cyBpbiBOYXNzYXUgU3RyZWV0LCBMZWluc3RlciBTdHJlZXQgYW5kIENsYXJlIFN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTY0XCIsIFwieFwiOiAtNDcyLCBcInlcIjo4MDUsIFwiem9vbVhcIjogMC4wNTYsIFwiem9vbVlcIjogMC4wNTYsIFwicm90YXRpb25cIjogMC4wOSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE2NC1sLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDEuMCwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gb2YgU2FpbnQgUGF0cmlja+KAmXMsIGV0Yy4gRGF0ZTogMTgyNFwiLFxuXHRcdFwiZGF0ZVwiOiAxODI0XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDY5LTAyXCIsIFwieFwiOiAyNTUsIFwieVwiOiAxMzg5LjUsIFwiem9vbVhcIjogMC4yNDUsIFwiem9vbVlcIjogMC4yNDUsIFwicm90YXRpb25cIjogLTIuNzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy00NjktMi1tLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkVhcmxzZm9ydCBUZXJyYWNlLCBTdGVwaGVu4oCZcyBHcmVlbiBTb3V0aCBhbmQgSGFyY291cnQgU3RyZWV0IHNob3dpbmcgcGxhbiBvZiBwcm9wb3NlZCBuZXcgc3RyZWV0XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zNTUtMVwiLCBcInhcIjogNjk2LCBcInlcIjogNzEzLjUsIFwiem9vbVhcIjogMC4zMjMsIFwiem9vbVlcIjogMC4yODksIFwicm90YXRpb25cIjogMS4xNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNTUtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIEJhZ2dvdCBTdHJlZXQgYW5kIEZpdHp3aWxsaWFtIFN0cmVldCwgc2hvd2luZyBhdmVudWVzIHRoZXJlb2YgTm8uIDEgRGF0ZTogMTc5MFwiLFxuXHRcdFwiZGF0ZVwiOiAxNzkwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNzI5XCIsIFwieFwiOiAtMTA5NiwgXCJ5XCI6IDY2OSwgXCJ6b29tWFwiOiAwLjEyNiwgXCJ6b29tWVwiOiAwLjExOCwgXCJyb3RhdGlvblwiOiAtMy40MjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy03MjktbC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBKYW1lc+KAmXMgU3RyZWV0LCBCYXNvbiBMYW5lLCBFY2hsaW7igJlzIExhbmUsIEdyYW5kIENhbmFsIFBsYWNlLCBDaXR5IEJhc29uIGFuZCBHcmFuZCBDYW5hbCBIYXJib3VyXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy03NTdcIiwgXCJ4XCI6IC04ODEsIFwieVwiOiAyNjEuNSwgXCJ6b29tWFwiOiAwLjM1NSwgXCJ6b29tWVwiOiAwLjM1NSwgXCJyb3RhdGlvblwiOiAtMC4wMjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy03NTctbC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQYXJ0IG9mIHRoZSBDaXR5IG9mIER1YmxpbiB3aXRoIHByb3Bvc2VkIGltcHJvdmVtZW50cy4gSW1wcm92ZW1lbnRzIHRvIGJlIG1hZGUgb3IgaW50ZW5kZWQgaW4gVGhvbWFzIFN0cmVldCwgSGlnaCBTdHJlZXQsIFdpbmV0YXZlcm4gU3RyZWV0LCBTa2lubmVyIFJvdywgV2VyYnVyZ2ggU3RyZWV0LCBDYW5vbiBTdHJlZXQsIFBhdHJpY2sgU3RyZWV0LCBLZXZpbiBTdHJlZXQsIEJpc2hvcCBTdHJlZXQgYW5kIFRoZSBDb29tYmUgVGhvbWFzIFNoZXJyYXJkIERhdGU6IDE4MTdcIixcblx0XHRcImRhdGVcIjogMTgxN1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTEzOFwiLCBcInhcIjogMjEyLjUsIFwieVwiOiAxNDcsIFwiem9vbVhcIjogMC4xOSwgXCJ6b29tWVwiOiAwLjE3NiwgXCJyb3RhdGlvblwiOiAwLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTM4LWwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcHJlbWlzZXMsIEdlb3JnZeKAmXMgUXVheSwgQ2l0eSBRdWF5LCBUb3duc2VuZCBTdHJlZXQgYW5kIG5laWdoYm91cmhvb2QsIHNob3dpbmcgcHJvcGVydHkgbG9zdCB0byB0aGUgQ2l0eSwgaW4gYSBzdWl0IGJ5ICdUaGUgQ29ycG9yYXRpb24gLSB3aXRoIFRyaW5pdHkgQ29sbGVnZSdcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE4OVwiLCBcInhcIjogLTc5Mi41LCBcInlcIjogMjYyLjUsIFwiem9vbVhcIjogMC4yNiwgXCJ6b29tWVwiOiAwLjI1OCwgXCJyb3RhdGlvblwiOiAwLjAwMywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xODkucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDb3B5IG9mIG1hcCBvZiBwcm9wb3NlZCBOZXcgU3RyZWV0IGZyb20gRXNzZXggU3RyZWV0IHRvIENvcm5tYXJrZXQsIHdpdGggdGhlIGVudmlyb25zIGFuZCBzdHJlZXRzIGJyYW5jaGluZyBvZmZcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA5OFwiLCBcInhcIjogLTQ3NSwgXCJ5XCI6IDUyNCwgXCJ6b29tWFwiOiAwLjA2MywgXCJ6b29tWVwiOiAwLjA2MywgXCJyb3RhdGlvblwiOiAtMC4xNiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wOTgucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgQ2hyaXN0Y2h1cmNoLCBTa2lubmVycyBSb3cgZXRjLiBUaG9tYXMgU2hlcnJhcmQsIDUgSmFudWFyeSAxODIxIERhdGU6IDE4MjFcIixcblx0XHRcImRhdGVcIjogMTgyMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTIwMlwiLCBcInhcIjogMTYsIFwieVwiOiA4MSwgXCJ6b29tWFwiOiAwLjI4OSwgXCJ6b29tWVwiOiAwLjI2MywgXCJyb3RhdGlvblwiOiAtMC4xMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjAyLWMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJhcmVhIGltbWVkaWF0ZWx5IG5vcnRoIG9mIFJpdmVyIExpZmZleSBmcm9tIFNhY2t2aWxsZSBTdCwgTG93ZXIgQWJiZXkgU3QsIEJlcmVzZm9yZCBQbGFjZSwgYXMgZmFyIGFzIGVuZCBvZiBOb3J0aCBXYWxsLiBBbHNvIHNvdXRoIG9mIExpZmZleSBmcm9tIFdlc3Rtb3JsYW5kIFN0cmVldCB0byBlbmQgb2YgSm9obiBSb2dlcnNvbidzIFF1YXlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE3OVwiLCBcInhcIjogLTUzNy41LCBcInlcIjogNzMwLCBcInpvb21YXCI6IDAuMTY4LCBcInpvb21ZXCI6IDAuMTY0LCBcInJvdGF0aW9uXCI6IDAuMDIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTc5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDEuMCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU2FpbnQgUGF0cmlja+KAmXMgQ2F0aGVkcmFsLCBOb3J0aCBDbG9zZSBhbmQgdmljaW5pdHlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTMyOVwiLCBcInhcIjogLTY3MC41LCBcInlcIjogMzQ3LCBcInpvb21YXCI6IDAuMzM4LCBcInpvb21ZXCI6IDAuMzMyLCBcInJvdGF0aW9uXCI6IC0wLjIxLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMyOS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjMsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gZm9yIG9wZW5pbmcgYW5kIHdpZGVuaW5nIGEgcHJpbmNpcGFsIEF2ZW51ZSB0byB0aGUgQ2FzdGxlLCBub3cgKDE5MDApIFBhcmxpYW1lbnQgU3RyZWV0IC0gc2hvd2luZyBEYW1lIFN0cmVldCwgQ2FzdGxlIFN0cmVldCwgYW5kIGFsbCB0aGUgQXZlbnVlcyB0aGVyZW9mIERhdGU6IDE3NTdcIixcblx0XHRcImRhdGVcIjogMTc1N1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE4N1wiLCBcInhcIjogLTIyNiwgXCJ5XCI6IDQ5NC41LCBcInpvb21YXCI6IDAuMDY2LCBcInpvb21ZXCI6IDAuMDY0LCBcInJvdGF0aW9uXCI6IDAuMCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xODcucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMS4wLFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJBIHN1cnZleSBvZiBzZXZlcmFsIGhvbGRpbmdzIGluIFNvdXRoIEdyZWF0IEdlb3JnZSdzIFN0cmVldCAtIHRvdGFsIHB1cmNoYXNlIMKjMTE1MjguMTYuMyBEYXRlOjE4MDFcIixcblx0XHRcImRhdGVcIjogMTgwMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTEyNFwiLCBcInhcIjogLTI3OSwgXCJ5XCI6IDM2NiwgXCJ6b29tWFwiOiAwLjA1NywgXCJ6b29tWVwiOiAwLjA1MSwgXCJyb3RhdGlvblwiOiAtMC4xNiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xMjQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcHJlbWlzZXMgaW4gRXNzZXggU3RyZWV0IGFuZCBQYXJsaWFtZW50IFN0cmVldCwgc2hvd2luZyBFc3NleCBCcmlkZ2UgYW5kIE9sZCBDdXN0b20gSG91c2UuIFQuIGFuZCBELkguIFNoZXJyYXJkIERhdGU6IDE4MTNcIixcblx0XHRcImRhdGVcIjogMTgxM1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM2MFwiLCAgXCJ4XCI6IC0xNDMsIFwieVwiOiA0MjYuNSwgXCJ6b29tWFwiOiAwLjExNywgXCJ6b29tWVwiOiAwLjEwMywgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNjAucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBEYW1lIFN0cmVldCBhbmQgYXZlbnVlcyB0aGVyZW9mIC0gRXVzdGFjZSBTdHJlZXQsIENlY2lsaWEgU3RyZWV0LCBhbmQgc2l0ZSBvZiBPbGQgVGhlYXRyZSwgRm93bmVzIFN0cmVldCwgQ3Jvd24gQWxsZXkgYW5kIENvcGUgU3RyZWV0IERhdGU6IDE3OTJcIiwgXG5cdFx0XCJkYXRlXCI6IDE3OTJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zNjJcIiwgXCJ4XCI6IDM1LjUsIFwieVwiOiA4NC41LCBcInpvb21YXCI6IDAuMjI5LCBcInpvb21ZXCI6IDAuMjM1LCBcInJvdGF0aW9uXCI6IDAuMTI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM2Mi0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwcyAtIENvbGxlZ2UgR3JlZW4sIENvbGxlZ2UgU3RyZWV0LCBXZXN0bW9yZWxhbmQgU3RyZWV0IGFuZCBhdmVudWVzIHRoZXJlb2YsIHNob3dpbmcgdGhlIHNpdGUgb2YgUGFybGlhbWVudCBIb3VzZSBhbmQgVHJpbml0eSBDb2xsZWdlIE5vLiAxIERhdGU6IDE3OTNcIiwgXG5cdFx0XCJkYXRlXCI6IDE3OTNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zODdcIiwgXCJ4XCI6IDI3Mi41LCBcInlcIjogNDIzLjUsIFwiem9vbVhcIjogMC4wODEsIFwiem9vbVlcIjogMC4wNzcsIFwicm90YXRpb25cIjogMy4wMzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzg3LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIGhvbGRpbmdzIGluIEZsZWV0IFN0cmVldCBhbmQgQ29sbGVnZSBTdHJlZXQsIHNob3dpbmcgc2l0ZSBvZiBPbGQgV2F0Y2ggSG91c2UgRGF0ZTogMTgwMVwiLCBcblx0XHRcImRhdGVcIjogMTgwMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTIxOFwiLCBcInhcIjogLTI0NTUsIFwieVwiOiAtMjg0LjUsIFwiem9vbVhcIjogMC40NTMsIFwiem9vbVlcIjogMC40NTEsIFwicm90YXRpb25cIjogLTAuMDQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjE4LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIHRoZSBMb25nIE1lYWRvd3MgYW5kIHBhcnQgb2YgdGhlIFBob2VuaXggUGFyayBhbmQgUGFya2dhdGUgU3RyZWV0IERhdGU6IDE3ODZcIiwgXG5cdFx0XCJkYXRlXCI6IDE3ODZcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yMjlcIiwgXCJ4XCI6IC0yMzg0LCBcInlcIjogNTUuNSwgXCJ6b29tWFwiOiAwLjM3OSwgXCJ6b29tWVwiOiAwLjM3OSwgXCJyb3RhdGlvblwiOiAwLjAxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yMjkucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTZWN0aW9uIGFjcm9zcyB0aGUgcHJvcG9zZWQgUm9hZCBmcm9tIHRoZSBQYXJrIEdhdGUgdG8gSXNsYW5kIEJyaWRnZSBHYXRlIC0gbm93ICgxOTAwKSBDb255bmdoYW0gUm9hZCBEYXRlOiAxNzg5XCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzg5XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjQyXCIsIFwieFwiOiAtNDA1LjUsIFwieVwiOiAyMSwgXCJ6b29tWFwiOiAwLjA4NCwgXCJ6b29tWVwiOiAwLjA4NCwgXCJyb3RhdGlvblwiOiAxLjA4NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yNDItMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiBhIGhvbGRpbmcgaW4gTWFyeeKAmXMgTGFuZSwgdGhlIGVzdGF0ZSBvZiB0aGUgUmlnaHQgSG9ub3VyYWJsZSBMb3JkIE1vdW50am95IERhdGU6IDE3OTNcIiwgXG5cdFx0XCJkYXRlXCI6IDE3OTNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yNDVcIiwgXCJ4XCI6IC0yMTAuMCwgXCJ5XCI6LTM5Ny41LCBcInpvb21YXCI6IDAuMDg0LCBcInpvb21ZXCI6IDAuMDg0LCBcInJvdGF0aW9uXCI6IC0wLjYyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTI0NS0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBCYXJsZXkgRmllbGRzIGV0Yy4sIGFuZCBhIHBsYW4gZm9yIG9wZW5pbmcgYSBzdHJlZXQgZnJvbSBSdXRsYW5kIFNxdWFyZSwgRG9yc2V0IFN0cmVldCwgYmVpbmcgbm93ICgxODk5KSBrbm93biBhcyBTb3V0aCBGcmVkZXJpY2sgU3RyZWV0IC0gd2l0aCByZWZlcmVuY2UgRGF0ZTogMTc4OVwiLFxuXHRcdCBcImRhdGVcIjogMTc4OVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTI1N1wiLCBcInhcIjogNjgxLjAsIFwieVwiOi0xMjIzLjUsIFwiem9vbVhcIjogMC4zNDYsIFwiem9vbVlcIjogMC4zODgsIFwicm90YXRpb25cIjogMC4yNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yNTcucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgQ2xvbmxpZmZlIFJvYWQgYW5kIHRoZSBPbGQgVHVybnBpa2UgSG91c2UgYXQgQmFsbHlib3VnaCBCcmlkZ2UgLSBOb3J0aCBTdHJhbmQgRGF0ZTogMTgyM1wiLCBcblx0XHRcImRhdGVcIjogMTgyM1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTI2OFwiLCBcInhcIjogLTE1MjguMCwgXCJ5XCI6IDEwNS41LCBcInpvb21YXCI6IDAuMDg2LCBcInpvb21ZXCI6IDAuMDg2LCBcInJvdGF0aW9uXCI6IDAuMDcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjY4LTMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBQYXJrZ2F0ZSBTdHJlZXQsIENvbnluZ2hhbSBSb2FkLCB3aXRoIHJlZmVyZW5jZSB0byBuYW1lcyBvZiB0ZW5hbnRzIGVuZG9yc2VkIE5vLiAzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNzFcIiwgXCJ4XCI6IDExMi4wLCBcInlcIjogMTgxLjUsIFwiem9vbVhcIjogMC4wMjEsIFwiem9vbVlcIjogMC4wMjEsIFwicm90YXRpb25cIjogLTAuMjY1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE3MS0yLmpwZWdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBMb3dlciBBYmJleSBTdHJlZXQsIHRvIGNvcm5lciBvZiBFZGVuIFF1YXkgKFNhY2t2aWxsZSBTdHJlZXQpIERhdGU6IDE4MTNcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MTNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zODBcIiwgXCJ4XCI6IDI0MS41LCBcInlcIjogMjg2LCBcInpvb21YXCI6IDAuMDMzLCBcInpvb21ZXCI6IDAuMDMzLCBcInJvdGF0aW9uXCI6IDAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzgwLTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBGbGVldCBNYXJrZXQsIFBvb2xiZWcgU3RyZWV0LCBIYXdraW5zIFN0cmVldCwgVG93bnNlbmQgU3RyZWV0LCBGbGVldCBTdHJlZXQsIER1YmxpbiBTb2NpZXR5IFN0b3JlcyBEYXRlOiAxODAwXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODAwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzA5XCIsIFwieFwiOiAzNi4wLCBcInlcIjogLTI5NywgXCJ6b29tWFwiOiAwLjIxOSwgXCJ6b29tWVwiOiAwLjIxOSwgXCJyb3RhdGlvblwiOiAtMC40MzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzA5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGFydCBvZiBHYXJkaW5lciBTdHJlZXQgYW5kIHBhcnQgb2YgR2xvdWNlc3RlciBTdHJlZXQsIGxhbmQgb3V0IGluIGxvdHMgZm9yIGJ1aWxkaW5nIC0gc2hvd2luZyBHbG91Y2VzdGVyIFN0cmVldCwgR2xvdWNlc3RlciBQbGFjZSwgdGhlIERpYW1vbmQsIFN1bW1lciBIaWxsLCBHcmVhdCBCcml0YWluIFN0cmVldCwgQ3VtYmVybGFuZCBTdHJlZXQsIE1hcmxib3Jv4oCZIFN0cmVldCwgTWFiYm90IFN0cmVldCwgTWVja2xpbmJ1cmdoIGV0Yy5EYXRlOiAxNzkxXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzkxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjk0XCIsIFwieFwiOiAxMjUuMCwgXCJ5XCI6IC0xMTgsIFwiem9vbVhcIjogMC4xMjksIFwiem9vbVlcIjogMC4xMjksIFwicm90YXRpb25cIjogLTAuMTk1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMjk0LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTdXJ2ZXkgb2YgcGFydCBvZiB0aGUgTG9yZHNoaXAgb2YgU2FpbnQgTWFyeeKAmXMgQWJiZXkgLSBwYXJ0IG9mIHRoZSBlc3RhdGUgb2YgdGhlIFJpZ2h0IEhvbm9yYWJsZSBMdWtlIFZpc2NvdW50IE1vdW50am95LCBzb2xkIHRvIFJpY2hhcmQgRnJlbmNoIEVzcS4sIHB1cnN1YW50IHRvIGEgRGVjcmVlIG9mIEhpcyBNYWplc3R54oCZcyBIaWdoIENvdXJ0IG9mIENoYW5jZXJ5LCAxNyBGZWIgMTc5NFwiLCBcblx0XHRcImRhdGVcIjogMTc5NFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTMxMFwiLCBcInhcIjogNDc0LjAsIFwieVwiOiAtODIxLjUsIFwiem9vbVhcIjogMC41NzYsIFwiem9vbVlcIjogMC41NzYsIFwicm90YXRpb25cIjogMC4xNDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzEwLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTm9ydGggTG90cyAtIGZyb20gdGhlIE5vcnRoIFN0cmFuZCBSb2FkLCB0byB0aGUgTm9ydGggYW5kIEVhc3QgV2FsbHMgRGF0ZTogMTc5M1wiLCBcblx0XHRcImRhdGVcIjogMTc5M1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTMyNVwiLCBcInhcIjogLTg5My4wLCBcInlcIjogNDEsIFwiem9vbVhcIjogMC4yODYsIFwiem9vbVlcIjogMC4yODYsIFwicm90YXRpb25cIjogMC4wMywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zMjUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTbWl0aGZpZWxkLCBBcnJhbiBRdWF5LCBIYXltYXJrZXQsIFdlc3QgQXJyYW4gU3RyZWV0LCBOZXcgQ2h1cmNoIFN0cmVldCwgQm93IExhbmUsIEJvdyBTdHJlZXQsIE1heSBMYW5lXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMjYtMVwiLCBcInhcIjogLTE0MTUuNSwgXCJ5XCI6IDExMi41LCBcInpvb21YXCI6IDAuMTE0LCBcInpvb21ZXCI6IDAuMTEyLCBcInJvdGF0aW9uXCI6IDAuMTcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzI2LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJCYXJyYWNrIFN0cmVldCwgUGFyayBTdHJlZXQsIFBhcmtnYXRlIFN0cmVldCBhbmQgVGVtcGxlIFN0cmVldCwgd2l0aCByZWZlcmVuY2UgdG8gbmFtZXMgb2YgdGVuYW50cyBhbmQgcHJlbWlzZXMgTm8uIDFcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTYzMlwiLCBcInhcIjogMTI1LCBcInlcIjogMzQ3LjUsIFwiem9vbVhcIjogMC4xNzIsIFwiem9vbVlcIjogMC4xNjQsIFwicm90YXRpb25cIjogMC41MywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy02MzIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgTmFzc2F1IFN0cmVldCwgbGVhZGluZyBmcm9tIEdyYWZ0b24gU3RyZWV0IHRvIE1lcnJpb24gU3F1YXJlIC0gc2hvd2luZyB0aGUgb2ZmIHN0cmVldHMgYW5kIHBvcnRpb24gb2YgR3JhZnRvbiBTdHJlZXQgYW5kIFN1ZmZvbGsgU3RyZWV0IERhdGU6IDE4MzNcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MzNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMjYtMlwiLCBcInhcIjogLTEyNTcuNSwgXCJ5XCI6IDE0My41LCBcInpvb21YXCI6IDAuMSwgXCJ6b29tWVwiOiAwLjEsIFwicm90YXRpb25cIjogMC4wNzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzI2LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJCYXJyYWNrIFN0cmVldCwgUGFyayBTdHJlZXQsIFBhcmtnYXRlIFN0cmVldCBhbmQgVGVtcGxlIFN0cmVldCwgd2l0aCByZWZlcmVuY2UgdG8gbmFtZXMgb2YgdGVuYW50cyBhbmQgcHJlbWlzZXNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTMzNFwiLCBcInhcIjogOTAuNSwgXCJ5XCI6IDM1NywgXCJ6b29tWFwiOiAwLjEyOCwgXCJ6b29tWVwiOiAwLjEyOCwgXCJyb3RhdGlvblwiOiAxLjI2NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zMzQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJEYW1lIFN0cmVldCwgQ29sbGVnZSBHcmVlbiwgR2Vvcmdl4oCZcyBMYW5lLCBHZW9yZ2XigJlzIFN0cmVldCwgQ2hlcXVlciBTdHJlZXQgYW5kIGF2ZW51ZXMgdGhlcmVvZlwiLFxuXHRcdFwiZGF0ZVwiOiAxNzc4XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzU1LTJcIiwgXCJ4XCI6IDE4NSwgXCJ5XCI6IDEwMjksIFwiem9vbVhcIjogMC4zMDIsIFwiem9vbVlcIjogMC4zMDIsIFwicm90YXRpb25cIjogLTAuNDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzU1LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIEJhZ2dvdCBTdHJlZXQgYW5kIEZpdHp3aWxsaWFtIFN0cmVldCwgc2hvd2luZyBhdmVudWVzIHRoZXJlb2YgTm8uIDIgRGF0ZTogMTc5MlwiLFxuXHRcdFwiZGF0ZVwiOiAxNzkyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzY4XCIsIFwieFwiOiAtNjg3LjUsIFwieVwiOiAyNzMuNSwgXCJ6b29tWFwiOiAwLjE1NiwgXCJ6b29tWVwiOiAwLjE1LCBcInJvdGF0aW9uXCI6IDAuMTIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzY4LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIEtpbmfigJlzIElubiBRdWF5IGFuZCBNZXJjaGFudHMgUXVheSwgc2hvd2luZyBzaXRlIG9mIE9ybW9uZCBCcmlkZ2UgLSBiZWxvdyBDaGFybGVzIFN0cmVldCAtIGFmdGVyd2FyZHMgcmVtb3ZlZCBhbmQgcmUtZXJlY3RlZCBvcHBvc2l0ZSBXaW5ldGF2ZXJuIFN0cmVldCBEYXRlOiAxNzk3XCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzk3XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzcyXCIsIFwieFwiOiAzNDEuNSwgXCJ5XCI6IDI5Ni41LCBcInpvb21YXCI6IDAuMDM2LCBcInpvb21ZXCI6IDAuMDMzOSwgXCJyb3RhdGlvblwiOiAyLjk1NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNzIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJHZW9yZ2UncyBRdWF5LCBXaGl0ZXMgTGFuZSwgYW5kIEhhd2tpbnMgU3RyZWV0LCBzaG93aW5nIHNpdGUgb2YgU3dlZXRtYW4ncyBCcmV3ZXJ5IHdoaWNoIHJhbiBkb3duIHRvIFJpdmVyIExpZmZleSBEYXRlOiAxNzk5XCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzk5XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzkwLTFcIiwgXCJ4XCI6IC04MDQuNSwgXCJ5XCI6IDQyMCwgXCJ6b29tWFwiOiAwLjIwNCwgXCJ6b29tWVwiOiAwLjIwMiwgXCJyb3RhdGlvblwiOiAtMC4wNywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zOTAtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gb2YgcHJvcG9zZWQgTWFya2V0IEhvdXNlLCBhZGpvaW5pbmcgVGhvbWFzIFN0cmVldCwgVmljYXIgU3RyZWV0LCBNYXJrZXQgU3RyZWV0IGFuZCBGcmFuY2lzIFN0cmVldCBEYXRlOiAxODAxXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzk1LTNcIiwgXCJ4XCI6IC01ODgsIFwieVwiOiA1NzgsIFwiem9vbVhcIjogMC4wMzYsIFwiem9vbVlcIjogMC4wMzYsIFwicm90YXRpb25cIjogLTMuNjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzk1LTMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJOZXcgUm93IGFuZCBDdXRwdXJzZSBSb3cgRGF0ZTogMTgwMFwiLFxuXHRcdFwiZGF0ZVwiOiAxODAwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDA0XCIsIFwieFwiOiAtMTYsIFwieVwiOiAzNzIsIFwiem9vbVhcIjogMC4wNjIsIFwiem9vbVlcIjogMC4wNiwgXCJyb3RhdGlvblwiOiAtMC4yNTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDA0LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQW5nbGVzZWEgU3RyZWV0IGFuZCBQYXJsaWFtZW50IEhvdXNlIERhdGU6IDE4MDJcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MDJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MTFcIiwgXCJ4XCI6IDM0My41LCBcInlcIjogNjU3LCBcInpvb21YXCI6IDAuMDg2LCBcInpvb21ZXCI6IDAuMDg2LCBcInJvdGF0aW9uXCI6IDAuMzI1LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDExLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTGVpbnN0ZXIgSG91c2UgYW5kIHBhcnQgb2YgdGhlIGVzdGF0ZSBvZiBWaXNjb3VudCBGaXR6d2lsbGlhbSAoZm9ybWVybHkgTGVpbnN0ZXIgTGF3biksIGxhaWQgb3V0IGluIGxvdHMgZm9yIGJ1aWxkaW5nIC0gc2hvd2luZyBLaWxkYXJlIFN0cmVldCwgVXBwZXIgTWVycmlvbiBTdHJlZXQgYW5kIExlaW5zdGVyIFBsYWNlIChTdHJlZXQpLCBNZXJyaW9uIFBsYWNlLCBhbmQgdGhlIE9sZCBCb3VuZGFyeSBiZXR3ZWVuIExlaW5zdGVyIGFuZCBMb3JkIEZpdHp3aWxsaWFtIC0gdGFrZW4gZnJvbSBhIG1hcCBzaWduZWQgUm9iZXJ0IEdpYnNvbiwgTWF5IDE4LCAxNzU0IERhdGU6IDE4MTJcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MTJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yNTFcIiwgXCJ4XCI6IDIyMCwgXCJ5XCI6IDY0LCBcInpvb21YXCI6IDAuMjM2LCBcInpvb21ZXCI6IDAuMjM2LCBcInJvdGF0aW9uXCI6IC0xLjQ5LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjUxLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHBvcnRpb24gb2YgQ2l0eSwgc2hvd2luZyBNb250Z29tZXJ5IFN0cmVldCwgTWVja2xpbmJ1cmdoIFN0cmVldCwgTG93ZXIgR2xvdWNlc3RlciBTdHJlZXQgYW5kIHBvcnRpb24gb2YgTWFiYm90IFN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDEzXCIsIFwieFwiOiAtMzczLCBcInlcIjogODA2LjUsIFwiem9vbVhcIjogMC4wNzgsIFwiem9vbVlcIjogMC4wNzYsIFwicm90YXRpb25cIjogLTAuMTUsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MTMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQZXRlciBTdHJlZXQsIFBldGVy4oCZcyBSb3csIFdoaXRlZnJpYXIgU3RyZWV0LCBXb29kIFN0cmVldCBhbmQgQnJpZGUgU3RyZWV0IC0gc2hvd2luZyBzaXRlIG9mIHRoZSBBbXBoaXRoZWF0cmUgaW4gQnJpZGUgU3RyZWV0LCB3aGVyZSB0aGUgTW9sZXluZXV4IENodXJjaCBub3cgKDE5MDApIHN0YW5kcyBEYXRlOiAxODEyXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODEyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDE0XCIsIFwieFwiOiAtMTkzLjUsIFwieVwiOiAzNjMuNSwgXCJ6b29tWFwiOiAwLjA3MiwgXCJ6b29tWVwiOiAwLjA3NCwgXCJyb3RhdGlvblwiOiAtMC4yMyxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQxNC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlRlbXBsZSBCYXIsIFdlbGxpbmd0b24gUXVheSwgT2xkIEN1c3RvbSBIb3VzZSwgQmFnbmlvIFNsaXAgZXRjLiBEYXRlOiAxODEzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODEzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDIxXCIsIFwieFwiOiAtNDc0LjUsIFwieVwiOiA1MjcsIFwiem9vbVhcIjogMC4wNjIsIFwiem9vbVlcIjogMC4wNiwgXCJyb3RhdGlvblwiOiAtMC4xODUsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MjEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgdGhlIHByZWNpbmN0cyBvZiBDaHJpc3QgQ2h1cmNoIER1Ymxpbiwgc2hvd2luZyBTa2lubmVycyBSb3csIHRvIHdoaWNoIGlzIGF0dGFjaGVkIGEgTWVtb3JhbmR1bSBkZW5vbWluYXRpbmcgdGhlIHByZW1pc2VzLCB0YWtlbiBieSB0aGUgQ29tbWlzc2lvbmVycyBvZiBXaWRlIFN0cmVldHMgZm9yIHRoZSBwdXJwb3NlIG9mIHdpZGVuaW5nIHNhaWQgU2tpbm5lcnMgUm93LCBub3cgKDE5MDApIGtub3duIGFzIENocmlzdCBDaHVyY2ggUGxhY2UgRGF0ZTogMTgxN1wiLCBcblx0XHRcImRhdGVcIjogMTgxN1xuXHR9LFxuXHR7IFxuXHRcdFwibmFtZVwiOiBcIndzYy00MDgtMlwiLCBcInhcIjogLTM5Ny41LCBcInlcIjogNTQ1LjUsIFwiem9vbVhcIjogMC4wNDQsIFwiem9vbVlcIjogMC4wNDQsIFwicm90YXRpb25cIjogLTAuMTIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDA4LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJXZXJidXJnaCBTdHJlZXQsIFNraW5uZXJzIFJvdywgRmlzaGFtYmxlIFN0cmVldCBhbmQgQ2FzdGxlIFN0cmVldCBEYXRlOiBjLiAxODEwXCIsXG5cdFx0XCJkYXRlXCI6IDE4MTBcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MjUtMVwiLCBcInhcIjogLTkxNy41LCBcInlcIjogNTc3LjUsIFwiem9vbVhcIjogMC4wNDUsIFwiem9vbVlcIjogMC4wNDYsIFwicm90YXRpb25cIjogLTEuNDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQyNS0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWVhdGggUm93LCBNYXJr4oCZcyBBbGxleSBhbmQgRGlydHkgTGFuZSAtIHNob3dpbmcgQnJpZGdlZm9vdCBTdHJlZXQsIE1hc3MgTGFuZSwgVGhvbWFzIFN0cmVldCBhbmQgU3QuIENhdGhlcmluZeKAmXMgQ2h1cmNoIERhdGU6IDE4MjAtMjRcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MjBcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MjZcIiwgXCJ4XCI6IC03MzUuNSwgXCJ5XCI6IDU3OC41LCBcInpvb21YXCI6IDAuMDM0LCBcInpvb21ZXCI6IDAuMDM0LCBcInJvdGF0aW9uXCI6IDEuNTY1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQyNi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBzZXZlcmFsIGhvdXNlcyBhbmQgcHJlbWlzZXMgb24gdGhlIEVhc3Qgc2lkZSBvZiBNZWF0aCBSb3csIHRoZSBwcm9wZXJ0eSBvZiBNci4gSm9obiBXYWxzaCAtIHNob3dpbmcgdGhlIHNpdHVhdGlvbiBvZiBUaG9tYXMgU3RyZWV0LCBIYW5idXJ5IExhbmUgYW5kIHNpdGUgb2YgQ2hhcGVsIERhdGU6IDE4MjFcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MjFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMTItMVwiLCBcInhcIjogLTI5MC41LCBcInlcIjogMzQ0LjUsIFwiem9vbVhcIjogMC4xOCwgXCJ6b29tWVwiOiAwLjE4MiwgXCJyb3RhdGlvblwiOiAtMC4yNiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xMTItMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjMsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkRhbWUgU3RyZWV0LCBmcm9tIHRoZSBjb3JuZXIgb2YgUGFsYWNlIFN0cmVldCB0byB0aGUgY29ybmVyIG9mIEdlb3JnZeKAmXMgU3RyZWV0IC0gbGFpZCBvdXQgaW4gbG90cyBmb3IgYnVpbGRpbmcgTm9ydGggYW5kIFNvdXRoIGFuZCB2aWNpbml0eSBEYXRlOiAxNzgyXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzgyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTEyXCIsIFwieFwiOiAtMjk4LCBcInlcIjogMzM5LjUsIFwiem9vbVhcIjogMC4xODUsIFwiem9vbVlcIjogMC4xODUsIFwicm90YXRpb25cIjogLTAuMjU1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTExMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcIm9wYWNpdHlcIjogMC4wLFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJEYW1lIFN0cmVldCwgZnJvbSB0aGUgY29ybmVyIG9mIFBhbGFjZSBTdHJlZXQgdG8gdGhlIGNvcm5lciBvZiBHZW9yZ2XigJlzIFN0cmVldCAtIGxhaWQgb3V0IGluIGxvdHMgZm9yIGJ1aWxkaW5nIE5vcnRoIGFuZCBTb3V0aCBhbmQgdmljaW5pdHkgRGF0ZTogMTc4MlwiLCBcblx0XHRcImRhdGVcIjogMTc4MlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ1NVwiLCBcInhcIjogNjM1LjUsIFwieVwiOiAxMjU4LCBcInpvb21YXCI6IDAuMjYzLCBcInpvb21ZXCI6IDAuMjYzLCBcInJvdGF0aW9uXCI6IC0wLjksIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDU1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiSGVyYmVydCBQbGFjZSBhbmQgQXZlbnVlcyBhZGphY2VudCB0byBVcHBlciBNb3VudCBTdHJlZXQsIHNob3dpbmcgVXBwZXIgQmFnZ290IFN0cmVldCAtIEhlcmJlcnQgU3RyZWV0LCBXYXJyaW5ndG9uIFBsYWNlIGFuZCBQZXJjeSBQbGFjZSwgTm9ydGh1bWJlcmxhbmQgUm9hZCBhbmQgTG93ZXIgTW91bnQgU3RyZWV0IERhdGU6IDE4MzNcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MzNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xOTlcIiwgXCJ4XCI6IDg3OC41LCBcInlcIjogMTIxNy41LCBcInpvb21YXCI6IDAuMjQxLCBcInpvb21ZXCI6IDAuMjQxLCBcInJvdGF0aW9uXCI6IDIuMTE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE5OS0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHBhcnQgb2YgdGhlIGVzdGF0ZSBvZiB0aGUgSG9uLiBTaWRuZXkgSGVyYmVydCwgY2FsbGVkIFdpbHRvbiBQYXJhZGUsIHNob3dpbmcgdGhlIHByb3Bvc2VkIGFwcHJvcHJpYXRpb24gdGhlcmVvZiBpbiBzaXRlcyBmb3IgYnVpbGRpbmcuIEFsc28gc2hvd2luZyBCYWdnb3QgU3RyZWV0LCBHcmFuZCBDYW5hbCBhbmQgRml0endpbGxpYW0gUGxhY2UuXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00NjVcIiwgXCJ4XCI6IDMwMS41LCBcInlcIjogNzExLjUsIFwiem9vbVhcIjogMC4yMDcsIFwiem9vbVlcIjogMC4yMDcsIFwicm90YXRpb25cIjogMy4zLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQ2NS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjYsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkdyYWZ0b24gU3RyZWV0LCBOYXNzYXUgU3RyZWV0IChTb3V0aCBzaWRlKSBhbmQgRGF3c29uIFN0cmVldCBEYXRlOiAxODM3XCIsIFxuXHRcdFwiZGF0ZVwiOiAxODM3XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDgwLTJcIiwgXCJ4XCI6IC02MywgXCJ5XCI6IDM4MiwgXCJ6b29tWFwiOiAwLjA2OCwgXCJ6b29tWVwiOiAwLjA2OCwgXCJyb3RhdGlvblwiOiAtMC4wNTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDgwLTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJOb3J0aCBzaWRlIG9mIENvbGxlZ2UgR3JlZW4gc2hvd2luZyBBdmVudWVzIHRoZXJlb2YsIGFuZCBncm91bmQgcGxhbiBvZiBQYXJsaWFtZW50IEhvdXNlLCBBbmdsZXNlYSBTdHJlZXQsIEJsYWNrbW9vciBZYXJkIGV0Yy4gLSB3aXRoIHJlZmVyZW5jZSBnaXZpbmcgdGVuYW50cywgbmFtZXMgb2YgcHJlbWlzZXMgcmVxdWlyZWQgb3IgcHVycG9zZSBvZiBpbXByb3ZlbWVudC4gRGF0ZTogMTc4NlwiLCBcblx0XHRcImRhdGVcIjogMTc4NlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ5MVwiLCBcInhcIjogLTIxLjUsIFwieVwiOiA5MzgsIFwiem9vbVhcIjogMC4xNjQsIFwiem9vbVlcIjogMC4xNjQsIFwicm90YXRpb25cIjogLTMuMDgsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDkxLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQXVuZ2llciBTdHJlZXQsIE1lcmNlciBTdHJlZXQsIFlvcmsgU3RyZWV0IGFuZCBBdmVudWVzIHRoZXJlb2YsIHZpejogLSBGcmVuY2ggU3RyZWV0IChNZXJjZXIgU3RyZWV0KSwgQm93IExhbmUsIERpZ2dlcyBMYW5lLCBTdGVwaGVuIFN0cmVldCwgRHJ1cnkgTGFuZSwgR3JlYXQgYW5kIExpdHRsZSBMb25nZm9yZCBTdHJlZXRzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00OTZcIiwgXCJ4XCI6IC0yNzgsIFwieVwiOiA0NTYsIFwiem9vbVhcIjogMC4wMTgsIFwiem9vbVlcIjogMC4wMTgsIFwicm90YXRpb25cIjogLTMuMjYsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDk2LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRXNzZXggUXVheSwgQ2hhbmdlIEFsbGV5LCBTbW9jayBBbGxleSBhbmQgZ3JvdW5kIHBsYW4gb2YgU21vY2sgQWxsZXkgVGhlYXRyZVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNTA3XCIsIFwieFwiOiAtMjcyLjUsIFwieVwiOiAzNDYsIFwiem9vbVhcIjogMC4wODcsIFwiem9vbVlcIjogMC4wODksIFwicm90YXRpb25cIjogLTAuMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy01MDcucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJFc3NleCBTdHJlZXQsIFBhcmxpYW1lbnQgU3RyZWV0LCBzaG93aW5nIE9sZCBDdXN0b20gSG91c2UgUXVheSwgTG93ZXIgT3Jtb25kIFF1YXkgYW5kIERhbWUgU3RyZWV0XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yMDYtMVwiLCBcInhcIjogLTQ0LjUsIFwieVwiOiAtMjIxLCBcInpvb21YXCI6IDAuMDUsIFwiem9vbVlcIjogMC4wNSwgXCJyb3RhdGlvblwiOiAtMC42NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yMDYtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBhbmdsZSBvZiBDYXZlbmRpc2ggUm93LCBSdXRsYW5kIFNxdWFyZSBhbmQgR3JlYXQgQnJpdGFpbiBTdHJlZXQgLSBzaG93aW5nIHVuc2lnbmVkIGVsZXZhdGlvbnMgYW5kIGdyb3VuZCBwbGFuIG9mIFJvdHVuZGEgYnkgRnJlZGVyaWNrIFRyZW5jaC4gRGF0ZTogMTc4N1wiLCBcblx0XHRcImRhdGVcIjogMTc4N1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTIwM1wiLCBcInhcIjogLTM5MiwgXCJ5XCI6IDI3Mi41LCBcInpvb21YXCI6IDAuMDc4LCBcInpvb21ZXCI6IDAuMDc2LCBcInJvdGF0aW9uXCI6IC0wLjI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTIwMy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNpdHkgU3VydmV5IC0gc2hvd2luZyBPcm1vbmQgUXVheSwgQXJyYW4gU3RyZWV0LCBNYXJ54oCZcyBBYmJleSwgTGl0dGxlIFN0cmFuZCBTdHJlZXQsIENhcGVsIFN0cmVldCBhbmQgRXNzZXggQnJpZGdlIERhdGU6IDE4MTFcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MTFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy01MTVcIiwgXCJ4XCI6IC03NSwgXCJ5XCI6IDU1MCwgXCJ6b29tWFwiOiAwLjA4OCwgXCJ6b29tWVwiOiAwLjA4OCwgXCJyb3RhdGlvblwiOiAyLjkzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy01MTUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJzaG93aW5nIERhbWUgU3RyZWV0LCBFc3NleCBTdHJlZXQgZXRjLiAtIGFsc28gc2l0ZSBmb3IgcHJvcG9zZWQgTmF0aW9uYWwgQmFuaywgb24gb3IgYWJvdXQgd2hlcmUgdGhlICdFbXBpcmUnIChmb3JtZXJseSB0aGUgJ1N0YXInKSBUaGVhdHJlIG9mIFZhcmlldGllcyBub3cgKDE5MDApIHN0YW5kcyBOby4xXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy01MjMtMVwiLCBcInhcIjogLTI5Ny41LCBcInlcIjogMzY4LjUsIFwiem9vbVhcIjogMC4wODgsIFwiem9vbVlcIjogMC4wODgsIFwicm90YXRpb25cIjogLTAuMTg1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTUyMy0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRXNzZXggU3RyZWV0LCBUZW1wbGUgQmFyIGFuZCB2aWNpbml0eSB0byBFc3NleCBCcmlkZ2UsIHNob3dpbmcgcHJvcG9zZWQgbmV3IHF1YXkgd2FsbCAoV2VsbGluZ3RvbiBRdWF5KVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDIzLTJcIiwgXCJ4XCI6IDM0LjUsIFwieVwiOiA0NzguNSwgXCJ6b29tWFwiOiAwLjA3OCwgXCJ6b29tWVwiOiAwLjA4MiwgXCJyb3RhdGlvblwiOiAtMy4yMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDIzLTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDcm93biBBbGxleSwgQ29wZSBTdHJlZXQsIEFyZGlsbOKAmXMgUm93LCBUZW1wbGUgQmFyLCBBc3RvbuKAmXMgUXVheSBhbmQgV2VsbGluZ3RvbiBRdWF5IE5vLiAyIERhdGU6IDE4MjAtNVwiLCBcblx0XHRcImRhdGVcIjogMTgyMFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTUzNVwiLCBcInhcIjogLTIwOS41LCBcInlcIjogMzI1LCBcInpvb21YXCI6IDAuMTM0LCBcInpvb21ZXCI6IDAuMTM0LCBcInJvdGF0aW9uXCI6IC0wLjA3LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTUzNS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIldlbGxpbmd0b24gUXVheSAtIGNvbnRpbnVhdGlvbiBvZiBFdXN0YWNlIFN0cmVldCBEYXRlXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy01NjctM1wiLCBcInhcIjogMTk0LjUsIFwieVwiOiA0NTAsIFwiem9vbVhcIjogMC4xMjYsIFwiem9vbVlcIjogMC4xMjYsIFwicm90YXRpb25cIjogMS40OCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy01NjctMy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBhIHBhcmNlbCBvZiBncm91bmQgYm91bmRlZCBieSBHcmFmdG9uIFN0cmVldCwgQ29sbGVnZSBHcmVlbiwgYW5kIENoZXF1ZXIgTGFuZSAtIGxlYXNlZCB0byBNci4gUG9vbGV5ICgzIGNvcGllcykgTm8uIDMgRGF0ZTogMTY4MlwiLCBcblx0XHRcImRhdGVcIjogMTY4MlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTU5NC0xXCIsIFwieFwiOiAtNTY0LjUsIFwieVwiOiA1NzIuNSwgXCJ6b29tWFwiOiAwLjA0NCwgXCJ6b29tWVwiOiAwLjA0NCwgXCJyb3RhdGlvblwiOiAyLjUzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy01OTQtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBOZXcgSGFsbCBNYXJrZXQgLSBwYXJ0IG9mIHRoZSBDaXR5IEVzdGF0ZSBEYXRlOiAxNzgwXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzgwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNjI1LTFcIiwgXCJ4XCI6IC0zMjAuNSwgXCJ5XCI6IDYwOS41LCBcInpvb21YXCI6IDAuMDU4LCBcInpvb21ZXCI6IDAuMDU4LCBcInJvdGF0aW9uXCI6IDIuNjEsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNjI1LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgdGhlIE9sZCBUaG9sc2VsbCBncm91bmQsIGZvcm1lcmx5IGNhbGxlZCBTb3V0aGVy4oCZcyBMYW5lLCBiZWxvbmdpbmcgdG8gdGhlIENpdHkgb2YgRHVibGluIC0gbGFpZCBvdXQgZm9yIGJ1aWxkaW5nLCBOaWNob2xhcyBTdHJlZXQsIFNraW5uZXJzIFJvdyBhbmQgV2VyYnVyZ2ggU3RyZWV0IEJ5IEEuIFIuIE5ldmlsbGUsIEMuIFMuIERhdGU6IDE4MTJcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MTJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy02NTRcIiwgXCJ4XCI6IC0zOTcuNSwgXCJ5XCI6IDQwOSwgXCJ6b29tWFwiOiAwLjEyMiwgXCJ6b29tWVwiOiAwLjEyMiwgXCJyb3RhdGlvblwiOiAtMC4xMzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNjU0LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBncm91bmQgcGxvdHMgb2Ygc2V2ZXJhbCBob2xkaW5ncyBiZWxvbmdpbmcgdG8gdGhlIENpdHkgb2YgRHVibGluLCBNYWRhbSBP4oCZSGFyYSwgQ29sb25lbCBCZXJyeSBhbmQgb3RoZXJzLCBvbiBCYWNrIFF1YXkgLSAoRXNzZXggUXVheSkgQmxpbmQgUXVheSAtIEV4Y2hhbmdlIFN0cmVldCwgRXNzZXggQnJpZGdlLCBDcmFuZSBMYW5lIGFuZCBEYW1lIFN0cmVldCwgU3ljYW1vcmUgQWxsZXkgLSBzaG93aW5nIHBvcnRpb24gb2YgdGhlIENpdHkgV2FsbCwgRXNzZXggR2F0ZSwgRGFtZSBHYXRlLCBEYW1lcyBNaWxsIGFuZCBicmFuY2ggb2YgdGhlIFJpdmVyIERvZGRlclwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNzA1XCIsIFwieFwiOiAtMTg3LjUsIFwieVwiOiAzOTIsIFwiem9vbVhcIjogMC4wNCwgXCJ6b29tWVwiOiAwLjA0MiwgXCJyb3RhdGlvblwiOiAtMC4zOCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy03MDUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgRXNzZXggU3RyZWV0IGFuZCB2aWNpbml0eSBEYXRlOiAxODA2XCIsIFxuXHRcdFwiZGF0ZVwiOiAxODI2XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNzI1XCIsIFwieFwiOiAtNjUzLjUsIFwieVwiOiAyMjIuNSwgXCJ6b29tWFwiOiAwLjA5NCwgXCJ6b29tWVwiOiAwLjA5NCwgXCJyb3RhdGlvblwiOiAwLjA3LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNzI1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQ2h1cmNoIFN0cmVldCwgQ2hhcmxlcyBTdHJlZXQsIElubuKAmXMgUXVheSAtICdXaGl0ZSBDcm9zcyBJbm4nIC0gcmVyZSBvZiBGb3VyIENvdXJ0cyAtIFVzaGVyc+KAmSBRdWF5LCBNZXJjaGFudOKAmXMgUXVheSwgV29vZCBRdWF5IC0gd2l0aCByZWZlcmVuY2UgRGF0ZTogMTgzM1wiLCBcblx0XHRcImRhdGVcIjogMTgzM1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE5OC0xXCIsIFwieFwiOiAtNDYyLCBcInlcIjogNDc2LCBcInpvb21YXCI6IDAuMDMyLCBcInpvb21ZXCI6IDAuMDMyLCBcInJvdGF0aW9uXCI6IC0wLjM0NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xOTgtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBXaGl0ZWhvcnNlIFlhcmQgKFdpbmV0YXZlcm4gU3RyZWV0KSBTdXJ2ZXlvcjogQXJ0aHVyIE5ldmlsbGUgRGF0ZTogMTg0N1wiLCBcblx0XHRcImRhdGVcIjogMTg0N1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA1NVwiLCBcInhcIjogLTE3NzUsIFwieVwiOiAtMTQ0NiwgXCJ6b29tWFwiOiAxLjExLCBcInpvb21ZXCI6IDEuMTYyLCBcInJvdGF0aW9uXCI6IDAuMDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTA1NS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gb2YgTWFpbCBDb2FjaCBSb2FkLCB0aHJvdWdoIEJsZXNzaW5ndG9uIFN0cmVldCB0byBDYWJyYSwgb2YgTmV3IExpbmUgUm9hZCwgYmVpbmcgcGFydCBvZiB0aGUgTmF2YW4gVHVybnBpa2UgUm9hZCBhbmQgY29ubmVjdGluZyBhbiBpbXByb3ZlbWVudCBsYXRlbHkgbWFkZSB1cG9uIHRoYXQgTGluZSB3aXRoIHRoZSBDaXR5IG9mIER1YmxpbiAtIHNob3dpbmcgdGhlIG1vc3QgZGlyZWN0IGxpbmUgYW5kIGFsc28gYSBDaXJjdWl0b25zIGxpbmUgd2hlcmVieSB0aGUgZXhwZW5zZSBvZiBhIEJyaWRnZSBhY3Jvc3MgdGhlIFJveWFsIENhbmFsIG1heSBiZSBhdm9pZGVkLiBEb25lIGJ5IEhpcyBNYWplc3R5J3MgUG9zdCBNYXN0ZXJzIG9mIElyZWxhbmQgYnkgTXIuIExhcmtpbiBEYXRlOiAxODE4XCIsIFxuXHRcdFwiZGF0ZVwiOiAxODE4XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDYwXCIsIFwieFwiOiAtMTA0LjUsIFwieVwiOiAtMSwgXCJ6b29tWFwiOiAwLjY3NCwgXCJ6b29tWVwiOiAwLjcwMiwgXCJyb3RhdGlvblwiOiAzLjE2NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy02MC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBzaG93aW5nIHRoZSBhbHRlcmF0aW9ucyBwcm9wb3NlZCBpbiB0aGUgbmV3IGxpbmUgb2Ygcm9hZCwgbGVhZGluZyBmcm9tIER1YmxpbiB0byBOYXZhbiwgY29tbWVuY2luZyBhdCBCbGVzc2luZ3RvbiBTdHJlZXQ7IHBhc3NpbmcgYWxvbmcgdGhlIENpcmN1bGFyIFJvYWQgdG8gUHJ1c3NpYSBTdHJlZXQsIGFuZCBoZW5jZSBhbG9uZyB0aGUgVHVybnBpa2UgUm9hZCB0byBSYXRvYXRoLCBhbmQgdGVybWluYXRpbmcgYXQgdGhlIFR1cm5waWtlXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNjVcIiwgXCJ4XCI6IC01NDUuNSwgXCJ5XCI6IC0yNzUsIFwiem9vbVhcIjogMC4yOTgsIFwiem9vbVlcIjogMC4yOTIsIFwicm90YXRpb25cIjogLTEuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDY1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIHNob3dpbmcgTW91bnRqb3kgU3RyZWV0LCBEb3JzZXQgU3RyZWV0LCBEb21pbmljayBTdHJlZXQgYW5kIHZpY2luaXR5IC0gcGxhbiBvZiBTYWludCBNYXJ54oCZcyBDaGFwZWwgb2YgRWFzZSwgYW5kIHByb3Bvc2VkIG9wZW5pbmcgbGVhZGluZyB0aGVyZXVudG8gZnJvbSBHcmFuYnkgUm93IC0gVGhvbWFzIFNoZXJyYXJkIDMwIE5vdiAxODI3XCIsIFxuXHRcdFwiZGF0ZVwiOiAxODI3XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDEyXCIsIFwieFwiOiAtMTI1LjUsIFwieVwiOiAxNDkuNSwgXCJ6b29tWFwiOiAwLjA0NCwgXCJ6b29tWVwiOiAwLjA0NCwgXCJyb3RhdGlvblwiOiAtMC4yMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wMTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcHJlbWlzZXMgTG93ZXIgQWJiZXkgU3RyZWV0LCBMb3dlciBTYWNrdmlsbGUgU3RyZWV0IGFuZCBFZGVuIFF1YXlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAxNFwiLCBcInhcIjogLTE1NTUuNSwgXCJ5XCI6IDI3LCBcInpvb21YXCI6IDAuMTQsIFwiem9vbVlcIjogMC4xNCwgXCJyb3RhdGlvblwiOiAwLjA1NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wMTQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJBIHN1cnZleSBvZiBncm91bmQgY29udGlndW91cyB0byB0aGUgSG9yc2UgQmFycmFja3MsIER1YmxpbiAtIHNob3dpbmcgTW9udHBlbGllciBIaWxsLCBCYXJyYWNrIFN0cmVldCwgUGFya2dhdGUgU3RyZWV0IGFuZCBlbnZpcm9ucyAoVGhvbWFzIFNoZXJyYXJkKSBEYXRlOiAxNzkwXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzkwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDE1XCIsIFwieFwiOiAtMTQxNC41LCBcInlcIjogMjksIFwiem9vbVhcIjogMC4xMTYsIFwiem9vbVlcIjogMC4xMTIsIFwicm90YXRpb25cIjogMC4wNzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDE1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQXJib3VyIEhpbGwsIFJveWFsIEJhcnJhY2tzIGFuZCB2aWNpbml0eS4gV2l0aCByZWZlcmVuY2UuIERhdGU6IDE3OTBcIixcblx0XHRcImRhdGVcIjogMTc5MFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAxNlwiLCBcInhcIjogLTg0NywgXCJ5XCI6IDIzMS41LCBcInpvb21YXCI6IDAuMDM4LCBcInpvb21ZXCI6IDAuMDM4LCBcInJvdGF0aW9uXCI6IDAuMDk1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTAxNi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCAtIEFycmFuIFF1YXksIFF1ZWVuIFN0cmVldCBEYXRlOjE3OTBcIixcblx0XHRcImRhdGVcIjogMTc5MCxcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMTdcIiwgXCJ4XCI6IC01NjQsIFwieVwiOiA0NDAsIFwiem9vbVhcIjogMC4wNjgsIFwiem9vbVlcIjogMC4wNiwgXCJyb3RhdGlvblwiOiAzLjM5LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTAxNy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkFycmFuIFF1YXksIENodXJjaCBTdHJlZXRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAxOFwiLCBcInhcIjogLTE5NCwgXCJ5XCI6IC0zOTUuNSwgXCJ6b29tWFwiOiAwLjEyLCBcInpvb21ZXCI6IDAuMTIsIFwicm90YXRpb25cIjogLTAuNjMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDE4LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIEJhcmxleSBmaWVsZHMgZXRjLiAoRG9yc2V0IFN0cmVldCkuIFBsYW4gb2Ygb3BlbmluZyBhIHN0cmVldCBmcm9tIFJ1dGxhbmQgU3F1YXJlIHRvIERvcnNldCBTdHJlZXQgLSAoUGFsYWNlIFJvdyBhbmQgR2FyZGluZXJzIFJvdykgLSBUaG9tYXMgU2hlcnJhcmQgRGF0ZTogMTc4OVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDI1XCIsIFwieFwiOiAtMTAxMCwgXCJ5XCI6IDEwNSwgXCJ6b29tWFwiOiAwLjEyLCBcInpvb21ZXCI6IDAuMTIsIFwicm90YXRpb25cIjogMC4xNiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wMjUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJCbGFja2hhbGwgUGxhY2UgLSBOZXcgU3RyZWV0IHRvIHRoZSBRdWF5XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNTdcIiwgXCJ4XCI6IC0yMjQsIFwieVwiOiAzMzAuNSwgXCJ6b29tWFwiOiAwLjA4NCwgXCJ6b29tWVwiOiAwLjA4NCwgXCJyb3RhdGlvblwiOiAyLjg2NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wNTcucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIHN0cmVldHMgYWJvdXQgTWFyeeKAmXMgQWJiZXkgYW5kIEJvb3QgTGFuZSAtIChPbGQgQmFuaykgRGF0ZTogMTgxMVwiLCBcblx0XHRcImRhdGVcIjogMTgxMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA2M1wiLCBcInhcIjogLTg4LjUsIFwieVwiOiAyNi41LCBcInpvb21YXCI6IDAuMywgXCJ6b29tWVwiOiAwLjMsIFwicm90YXRpb25cIjogLTIuMTQ1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTA2My5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkVsZXZhdGlvbiBvZiB0aGUgd2VzdCBmcm9udCBhbmQgcGxhbiBvZiBNb3VudGpveSBTcXVhcmUgbGFpZCBvdXQgb24gdGhlIHJpc2luZyBncm91bmQsIG5lYXIgR2Vvcmdl4oCZcyBDaHVyY2ggLSB0aGUgZXN0YXRlIG9mIHRoZSBSaWdodCBIb24uIEx1a2UgR2FyZGluZXIsIGFuZCBub3cgKDE3ODcpLCB0byBiZSBsZXQgZm9yIGJ1aWxkaW5nIC0gTG9yZCBNb3VudGpveeKAmXMgcGxhbi4gRGF0ZTogMTc4N1wiLCBcblx0XHRcImRhdGVcIjogMTc4N1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA4Ny0yXCIsIFwieFwiOiAtMTcyLjUsIFwieVwiOiAxNDE5LCBcInpvb21YXCI6IDAuMDg2LCBcInpvb21ZXCI6IDAuMDg2LCBcInJvdGF0aW9uXCI6IC0xLjY5NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wODctMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNhbWRlbiBTdHJlZXQgVXBwZXIgYW5kIENoYXJsb3R0ZSBTdHJlZXQgRGF0ZTogMTg0MVwiLCBcblx0XHRcImRhdGVcIjogMTg0MVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA5MFwiLCBcInhcIjogLTI2MSwgXCJ5XCI6IDUwNSwgXCJ6b29tWFwiOiAwLjA3NCwgXCJ6b29tWVwiOiAwLjA2NiwgXCJyb3RhdGlvblwiOiAtMC4yMywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wOTAucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDYXN0bGUgWWFyZCwgQ2FzdGxlIFN0cmVldCwgRGFtZSBTdHJlZXQsIFBhcmxpYW1lbnQgU3RyZWV0IGFuZCB2aWNpbml0eSBEYXRlOiAxNzY0XCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzY0XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTAwLTJcIiwgXCJ4XCI6IC01MjgsIFwieVwiOiA0NjQsIFwiem9vbVhcIjogMC4wNzgsIFwiem9vbVlcIjogMC4wNzgsIFwicm90YXRpb25cIjogLTAuMjcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTAwLTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcHJlbWlzZXMgdG8gYmUgdmFsdWVkIGJ5IEp1cnk7IENvY2sgSGlsbCwgTWljaGFlbOKAmXMgTGFuZSwgV2luZXRhdmVybiBTdHJlZXQsIEpvaG7igJlzIExhbmUsIENocmlzdGNodXJjaCwgUGF0cmljayBTdHJlZXQgYW5kIFBhdHJpY2vigJlzIENsb3NlIERhdGU6IDE4MTNcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MTNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMDNcIiwgXCJ4XCI6IDk5LjUsIFwieVwiOiA1NjYsIFwiem9vbVhcIjogMC4wNjIsIFwiem9vbVlcIjogMC4wNiwgXCJyb3RhdGlvblwiOiAtMy4xNTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTAzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIFNvdXRoIFNpZGUgb2YgQ29sbGVnZSBHcmVlbiBhbmQgdmljaW5pdHkgRGF0ZTogMTgwOFwiLFxuXHRcdFwiZGF0ZVwiOiAxODA4XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTQ5LTFcIiwgXCJ4XCI6IC0xMDkxLCBcInlcIjogNTE1LjUsIFwiem9vbVhcIjogMC4wNjIsIFwiem9vbVlcIjogMC4wNiwgXCJyb3RhdGlvblwiOiAwLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE0OS0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gSmFtZXPigJlzIEdhdGUsIEphbWVzIFN0cmVldCwgVGhvbWFzIFN0cmVldCBhbmQgV2F0bGluZyBTdHJlZXQuIE1yLiBHdWlubmVzc+KAmXMgUGxhY2UgRGF0ZTogMTg0NVwiLCBcblx0XHRcImRhdGVcIjogMTg0NVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE0OS0yXCIsIFwieFwiOiAtMTA3NC41LCBcInlcIjogNDg4LCBcInpvb21YXCI6IDAuMDQ0LCBcInpvb21ZXCI6IDAuMDQ4LCBcInJvdGF0aW9uXCI6IDAsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTQ5LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBKYW1lc+KAmXMgR2F0ZSwgSmFtZXMgU3RyZWV0LCBUaG9tYXMgU3RyZWV0IGFuZCBXYXRsaW5nIFN0cmVldC4gTXIuIEd1aW5uZXNz4oCZcyBQbGFjZSBEYXRlOiAxODQ1XCIsIFxuXHRcdFwiZGF0ZVwiOiAxODQ1XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjU0XCIsIFwieFwiOiAtNDM4LCBcInlcIjogLTE0MiwgXCJ6b29tWFwiOiAwLjExOCwgXCJ6b29tWVwiOiAwLjEyLCBcInJvdGF0aW9uXCI6IC0wLjQxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yNTQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgTWFiYm90IFN0cmVldCwgTW9udGdvbWVyeSBTdHJlZXQsIERvbWluaWNrIFN0cmVldCwgQ2hlcnJ5IExhbmUsIENyb3NzIExhbmUgYW5kIFR1cm4tYWdhaW4tTGFuZSBEYXRlOiAxODAxXCIsXG5cdFx0XCJkYXRlXCI6IDE4MDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMDYtMVwiLCBcInhcIjogLTc1NywgXCJ5XCI6IDQ5NS41LCBcInpvb21YXCI6IDAuMjY1LCBcInpvb21ZXCI6IDAuMjY1LCBcInJvdGF0aW9uXCI6IC0wLjA3NCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTEwNi0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBzaG93aW5nIHByb3Bvc2VkIGltcHJvdmVtZW50cyB0byBiZSBtYWRlIGluIENvcm5tYXJrZXQsIEN1dHB1cnNlIFJvdywgTGFtYiBBbGxleSAtIEZyYW5jaXMgU3RyZWV0IC0gYW5kIGFuIGltcHJvdmVkIGVudHJhbmNlIGZyb20gS2V2aW4gU3RyZWV0IHRvIFNhaW50IFBhdHJpY2vigJlzIENhdGhlZHJhbCwgdGhyb3VnaCBNaXRyZSBBbGxleSBhbmQgYXQgSmFtZXPigJlzIEdhdGUuIERhdGU6IDE4NDUtNDYgXCIsXG5cdFx0XCJkYXRlXCI6IDE4NDVcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNDYtMVwiLCBcInhcIjogLTY4MywgXCJ5XCI6IDQ3MSwgXCJ6b29tWFwiOiAwLjA4MiwgXCJ6b29tWVwiOiAwLjA4MiwgXCJyb3RhdGlvblwiOiAtMC4xLFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTQ2LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgYW5kIHRyYWNpbmcgb2YgcHJlbWlzZXMgaW4gQ29ybm1hcmtldCwgQ3V0cHVyc2UgUm93IGFuZCB2aWNpbml0eSBEYXRlOiAxODQ5XCIsXG5cdFx0XCJkYXRlXCI6IDE4NDlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy02MDBcIiwgXCJ4XCI6IDEzOS41LCBcInlcIjogNzU4LCBcInpvb21YXCI6IDAuMDYyLCBcInpvb21ZXCI6IDAuMDYyLCBcInJvdGF0aW9uXCI6IC0wLjQxNSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTYwMC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjksXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiB0aGUgZ3JvdW5kIGV0Yy4sIG9mIHRoZSBNYW5zaW9uIEhvdXNlLCBEYXdzb24gU3RyZWV0IERhdGU6IDE3ODFcIixcblx0XHRcImRhdGVcIjogMTc4MVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM0OFwiLCBcInhcIjogLTEzNDUuNSwgXCJ5XCI6IDQ5MywgXCJ6b29tWFwiOiAwLjQsIFwiem9vbVlcIjogMC40NzgsIFwicm90YXRpb25cIjogLTAuMDc1LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzQ4LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHBhcnQgb2YgdGhlIENpdHkgb2YgRHVibGluIG5lYXIgdGhlIEdyYW5kIENhbmFsIC0gc2hvd2luZyBpbXByb3ZlbWVudHMgYW5kIGFwcHJvYWNoZXMgbWFkZSwgYW5kIHRob3NlIHByb3Bvc2VkIHRvIGJlIG1hZGU7IGFuZCB0aGUgc2l0dWF0aW9uIG9mIHRoZSBmb2xsb3dpbmcgc3RyZWV0cyB2aXo6IC0gQmFzb24gTGFuZTsgQ2FuYWwgUGxhY2U7IFBvcnRsYW5kIFN0cmVldDsgUmFpbnNmb3JkIFN0cmVldDsgQ3JhbmUgTGFuZTsgQmVsbHZpZXc7IFRob21hcyBDb3VydDsgSGFuYnVyeSBMYW5lOyBNZWF0aCBSb3c7IE1lYXRoIFN0cmVldDsgRWFybCBTdHJlZXQgV2VzdDsgV2FnZ29uIExhbmU7IENyYXdsZXlgcyBZYXJkOyBSb2JlcnQgU3RyZWV0OyBNYXJrZXQgU3RyZWV0OyBCb25kIFN0cmVldDsgQ2FuYWwgQmFuaywgTmV3cG9ydCBTdHJlZXQ7IE1hcnJvd2JvbmUgTGFuZSwgU3VtbWVyIFN0cmVldDsgQnJhaXRod2FpdGUgU3RyZWV0OyBQaW1ibGljbywgVHJpcG9sbyAoc2l0ZSBvZiBPbGQgQ291cnQgSG91c2UpLCBuZWFyIFRob21hcyBDb3VydDsgQ29sZSBBbGxleTsgU3dpZnRzIEFsbGV5OyBDcm9zdGljayBBbGxleTsgRWxib3cgTGFuZTsgVXBwZXIgQ29vbWJlIGFuZCBUZW50ZXIncyBGaWVsZHMgRGF0ZTogMTc4N1wiLFxuXHRcdFwiZGF0ZVwiOiAxNzg3XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDMzLTJcIiwgXCJ4XCI6IC01MzYuNSwgXCJ5XCI6IDg3MC41LCBcInpvb21YXCI6IDAuMDU4LCBcInpvb21ZXCI6IDAuMDU4LCBcInJvdGF0aW9uXCI6IC0wLjAxLFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDMzLTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBDb29tYmUsIEZyYW5jaXMgU3RyZWV0LCBOZXcgUm93LCBDcm9zcyBQb2RkbGUgKG5vdyBEZWFuIFN0cmVldCksIFRocmVlLVN0b25lLUFsbGV5IChub3cgdGhlIGxvd2VyIGVuZCBvZiBOZXcgU3RyZWV0KSwgUGF0cmljayBTdHJlZXQsIFBhdHJpY2vigJlzIENsb3NlLCBLZXZpbiBTdHJlZXQgYW5kIE1pdHJlIEFsbGV5IERhdGU6IDE4MjQtMjhcIixcblx0XHRcImRhdGVcIjogMTgyNFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA1OVwiLCBcInhcIjogLTUyNy41LCBcInlcIjogLTExOS41LCBcInpvb21YXCI6IDAuMDcsIFwiem9vbVlcIjogMC4wNywgXCJyb3RhdGlvblwiOiAtMC4wOCxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTA1OS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjksXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkdyb3VuZCBwbGFuIG9mIExpbmVuIEhhbGxcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTI3NC0xXCIsIFwieFwiOiAtOTQ0LjUsIFwieVwiOiAyOTUsIFwiem9vbVhcIjogMC4xNjQsIFwiem9vbVlcIjogMC4xNjQsIFwicm90YXRpb25cIjogLTEuNjEsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yNzQtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjksXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBPeG1hbnRvd24gR3JlZW4sIEJvd2xpbmcgR3JlZW4sIFF1ZWVuIFN0cmVldCwgS2luZyBTdHJlZXQsIE5ldyBDaHVyY2ggU3RyZWV0LCBDaGFubmVsIFJvdyAtIHdpdGggbG90IG51bWJlcnNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTMyMy0xXCIsIFwieFwiOiAtMjgwLCBcInlcIjogMzYsIFwiem9vbVhcIjogMC4wNzIsIFwiem9vbVlcIjogMC4wNzIsIFwicm90YXRpb25cIjogLTAuNDQsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zMjMtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjksXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIldpZG93IEFsbXMgSG91c2UgaW4gR3JlYXQgQnJpdGFpbiBTdHJlZXQgLSBjb3JuZXIgb2YgSmVydmlzIFN0cmVldCBhbmQgR3JlYXQgQnJpdGFpbiBTdHJlZXQgTm90ZTogTm90aWNlIG9mIGhvdXNlcyBhbmQgZ3JvdW5kcyB0byBiZSBzZXQsIDE4MjJcIixcblx0XHRcImRhdGVcIjogMTgyMlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTUyNVwiLCBcInhcIjogMTA5MS41LCBcInlcIjogMjUyLjUsIFwiem9vbVhcIjogMC4zNTQsIFwiem9vbVlcIjogMC4zNTQsIFwicm90YXRpb25cIjogMC4xMSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTUyNS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjksXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBSaW5nc2VuZCwgYW5kIHZpY2luaXR5XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wOTQtNFwiLCBcInhcIjogLTE1Mi41LCBcInlcIjogNTY0LCBcInpvb21YXCI6IDAuMDU4LCBcInpvb21ZXCI6IDAuMDU4LCBcInJvdGF0aW9uXCI6IC0zLjMwNSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTA5NC00LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQ2FzdGxlIEFsbGV5LCBDYXN0bGUgTGFuZSwgRGFtZSBTdHJlZXQgYW5kIENvcmsgSGlsbCwgdG8gYmUgc29sZCBieSB0aGUgQ29tbWlzc2lvbmVycyBvZiBXaWRlIFN0cmVldHMsIDE3IEFwcmlsIDE3NjYuIFNob3dpbmcgbG90IHRvIGJlIHJlc2VydmVkIG9uIHdoaWNoIFJveWFsIEV4Y2hhbmdlLCBub3cgKDE4OTkpIHRoZSBDaXR5IEhhbGwsIHdhcyBzdWJzZXF1ZW50bHkgYnVpbHQgLSBKb25hdGhhbiBCYXJrZXJcIixcblx0XHRcImRhdGVcIjogMTc2NlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTIxOS0xXCIsIFwieFwiOiAyNTMuNSwgXCJ5XCI6IDYwLCBcInpvb21YXCI6IDAuMDM0LCBcInpvb21ZXCI6IDAuMDM0LCBcInJvdGF0aW9uXCI6IC0wLjMyNSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTIxOS0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIGEgaG9sZGluZyBpbiBMb3dlciBBYmJleSBTdHJlZXQgb3Igb24gdGhlIE5vcnRoIFN0cmFuZCAtIGJlbG9uZ2luZyB0byB0aGUgUmVwcy4gb2YgR3JpZmZpdGggTGxveWQgLSBzaG93aW5nIExsb3lk4oCZcyBSb3BlIFdhbGssIEdsYXNzIEhvdXNlOyBsYXRlIFNpciBBbm5lc2xleSBTdGV3YXJ04oCZcyBCYXJ0LiBob2xkaW5nIERhdGU6IDE3OTdcIixcblx0XHRcImRhdGVcIjogMTc0N1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTExOFwiLCBcInhcIjogMzksICBcInlcIjogNTYyLjUsIFwiem9vbVhcIjogMC4wNzIsIFwiem9vbVlcIjogMC4wNzIsIFwicm90YXRpb25cIjogMy4wODksXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xMTgucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC45LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgRGFtZSBTdHJlZXQsIERhbWUgQ291cnQsIFNvdXRoIEdyZWF0IEdlb3JnZeKAmXMgU3RyZWV0IGFuZCB2aWNpbml0eVwiLFxuXHRcdFwiZGF0ZVwiOiAxNzg1XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTIyLTFcIiwgXCJ4XCI6IDM2NCwgXCJ5XCI6IDEyNzAuNSwgXCJ6b29tWFwiOiAwLjE1NCwgXCJ6b29tWVwiOiAwLjE1NCwgXCJyb3RhdGlvblwiOiAzLjE0NCxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTEyMi0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIGFuZCBwbGFuIG9mIHBhcnQgb2YgU3RlcGhlbuKAmXMgR3JlZW4sIHNob3dpbmcgcG9zaXRpb24gb2YgaW50ZW5kZWQgbmV3IHN0cmVldCAoRWFybHNmb3J0IFRlcnJhY2UpXCIsXG5cdFx0XCJkYXRlXCI6IDE3ODVcblx0fVxuXVxuIiwiaW1wb3J0IHsgSW5kZXhlciB9IGZyb20gXCIuL2luZGV4ZXJcIjtcbmltcG9ydCB7IEdyaWRJbmRleGVyIH0gZnJvbSBcIi4vZ3JpZGluZGV4ZXJcIjtcbmltcG9ydCB7IENhbnZhc0xheWVyIH0gZnJvbSBcIi4uL2dyYXBoaWNzL2xheWVyXCI7XG5pbXBvcnQgeyBDb250YWluZXJMYXllciB9IGZyb20gXCIuLi9ncmFwaGljcy9jb250YWluZXJsYXllclwiO1xuXG5leHBvcnQgY2xhc3MgQ29udGFpbmVySW5kZXggaW1wbGVtZW50cyBJbmRleGVyIHtcblxuXHRjb25zdHJ1Y3Rvcihcblx0ICByZWFkb25seSBjb250YWluZXI6IENvbnRhaW5lckxheWVyLCBcblx0ICByZWFkb25seSBuYW1lOiBzdHJpbmcsXG5cdCAgcmVhZG9ubHkgaW5kZXhlcjogSW5kZXhlciA9IG5ldyBHcmlkSW5kZXhlcigyNTYpKXtcblx0XHRmb3IgKGxldCBsYXllciBvZiBjb250YWluZXIubGF5ZXJzKCkpe1xuXHRcdFx0dGhpcy5hZGQobGF5ZXIpO1xuXHRcdH1cblx0fVxuXG5cdGdldExheWVycyh4OiBudW1iZXIsIHk6IG51bWJlcik6IEFycmF5PENhbnZhc0xheWVyPntcblx0XHRpZiAodGhpcy5jb250YWluZXIuaXNWaXNpYmxlKCkpe1xuXHRcdFx0Y29uc29sZS5sb2codGhpcy5uYW1lICsgXCIgaXMgdmlzaWJsZSBcIik7XG5cdFx0XHRyZXR1cm4gdGhpcy5pbmRleGVyLmdldExheWVycyh4LCB5KTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRyZXR1cm4gW107XG5cdFx0fVxuXHR9XG5cblx0YWRkKGNhbnZhc0xheWVyOiBDYW52YXNMYXllcik6IHZvaWQge1xuXHRcdHRoaXMuaW5kZXhlci5hZGQoY2FudmFzTGF5ZXIpO1xuXHR9XG5cbn0iLCJpbXBvcnQgeyBDYW52YXNMYXllciB9IGZyb20gXCIuLi9ncmFwaGljcy9sYXllclwiO1xuaW1wb3J0IHsgQ29uc29sZUxvZ2dlciwgTG9nZ2VyIH0gZnJvbSBcIi4uL2xvZ2dpbmcvbG9nZ2VyXCI7XG5pbXBvcnQgeyBJbmRleGVyIH0gZnJvbSBcIi4vaW5kZXhlclwiO1xuXG5jbGFzcyBHcmlkTWFwIHtcblx0cmVhZG9ubHkgbGF5ZXJNYXA6IE1hcDxzdHJpbmcsIEFycmF5PENhbnZhc0xheWVyPj5cblxuXHRjb25zdHJ1Y3Rvcigpe1xuXHRcdHRoaXMubGF5ZXJNYXAgPSBuZXcgTWFwPHN0cmluZywgQXJyYXk8Q2FudmFzTGF5ZXI+PigpO1xuXHR9IFxuXG5cdGFkZCh4OiBudW1iZXIsIHk6IG51bWJlciwgbGF5ZXI6IENhbnZhc0xheWVyKXtcblx0XHR2YXIgbGF5ZXJWYWx1ZXM6IEFycmF5PENhbnZhc0xheWVyPjtcblx0XHRpZiAodGhpcy5sYXllck1hcC5oYXModGhpcy5rZXkoeCwgeSkpKXtcblx0XHRcdGxheWVyVmFsdWVzID0gdGhpcy5sYXllck1hcC5nZXQodGhpcy5rZXkoeCwgeSkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsYXllclZhbHVlcyA9IFtdO1xuXHRcdH1cblx0XHRsYXllclZhbHVlcy5wdXNoKGxheWVyKTtcblx0XHR0aGlzLmxheWVyTWFwLnNldCh0aGlzLmtleSh4LCB5KSwgbGF5ZXJWYWx1ZXMpO1xuXHR9XG5cblx0Z2V0KHg6IG51bWJlciwgeTogbnVtYmVyKTogQXJyYXk8Q2FudmFzTGF5ZXI+e1xuXHRcdHJldHVybiB0aGlzLmxheWVyTWFwLmdldCh0aGlzLmtleSh4LCB5KSk7XG5cdH1cblxuXHRoYXMoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5sYXllck1hcC5oYXModGhpcy5rZXkoeCwgeSkpO1xuXHR9XG5cblx0cHJpdmF0ZSBrZXkoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBzdHJpbmcge1xuXHRcdHJldHVybiB4ICsgXCJfXCIgKyB5O1xuXHR9XG5cbn1cblxuZXhwb3J0IGNsYXNzIEdyaWRJbmRleGVyIGltcGxlbWVudHMgSW5kZXhlciB7XG5cblx0cHJpdmF0ZSBsb2dnZXI6IExvZ2dlcjtcblx0cHJpdmF0ZSBjYW52YXNNYXAgPSBuZXcgR3JpZE1hcCgpO1xuXG5cdGNvbnN0cnVjdG9yKHJlYWRvbmx5IGdyaWRXaWR0aDogbnVtYmVyLCBcblx0ICByZWFkb25seSBncmlkSGVpZ2h0OiBudW1iZXIgPSBncmlkV2lkdGgpe1xuXHRcdHRoaXMubG9nZ2VyID0gbmV3IENvbnNvbGVMb2dnZXIoKTtcblx0fVxuXG5cdHNldExvZ2dlcihsb2dnZXI6IExvZ2dlcik6IHZvaWQge1xuXHRcdHRoaXMubG9nZ2VyID0gbG9nZ2VyO1xuXHR9XG5cblx0Z2V0TGF5ZXJzKHg6IG51bWJlciwgeTogbnVtYmVyKTogQXJyYXk8Q2FudmFzTGF5ZXI+IHtcblx0XHRsZXQgZ3JpZFggPSBNYXRoLmZsb29yKHggLyB0aGlzLmdyaWRXaWR0aCk7XG5cdFx0bGV0IGdyaWRZID0gTWF0aC5mbG9vcih5IC8gdGhpcy5ncmlkSGVpZ2h0KTtcblxuXHRcdHRoaXMubG9nZ2VyLmxvZyhcImdyaWQgeHkgXCIgKyBncmlkWCArIFwiLCBcIiArIGdyaWRZKTtcblxuXHRcdGlmICh0aGlzLmNhbnZhc01hcC5oYXMoZ3JpZFgsIGdyaWRZKSl7XG5cdFx0XHRyZXR1cm4gdGhpcy5jYW52YXNNYXAuZ2V0KGdyaWRYLCBncmlkWSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0cmV0dXJuIFtdO1xuXHRcdH1cblx0fVxuXG5cdGFkZChjYW52YXNMYXllcjogQ2FudmFzTGF5ZXIpe1xuXG5cdFx0bGV0IGRpbWVuc2lvbiA9IGNhbnZhc0xheWVyLmdldERpbWVuc2lvbigpO1xuXG5cdFx0bGV0IHhNaW4gPSBNYXRoLmZsb29yKGRpbWVuc2lvbi54IC8gdGhpcy5ncmlkV2lkdGgpO1xuXHRcdGxldCB4TWF4ID0gTWF0aC5mbG9vcigoZGltZW5zaW9uLnggKyBkaW1lbnNpb24udykgLyB0aGlzLmdyaWRXaWR0aCk7XG5cblx0XHRsZXQgeU1pbiA9IE1hdGguZmxvb3IoZGltZW5zaW9uLnkgLyB0aGlzLmdyaWRIZWlnaHQpO1xuXHRcdGxldCB5TWF4ID0gTWF0aC5mbG9vcigoZGltZW5zaW9uLnkgKyBkaW1lbnNpb24uaCkgLyB0aGlzLmdyaWRIZWlnaHQpO1xuXG5cdFx0Zm9yICh2YXIgeCA9IHhNaW47IHg8PXhNYXg7IHgrKyl7XG5cdFx0XHRmb3IgKHZhciB5ID0geU1pbjsgeTw9eU1heDsgeSsrKXtcblx0XHRcdFx0dGhpcy5jYW52YXNNYXAuYWRkKHgsIHksIGNhbnZhc0xheWVyKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRzaG93SW5kaWNlcyhjYW52YXNMYXllcjogQ2FudmFzTGF5ZXIpOiB2b2lkIHtcblxuXHRcdGxldCBkaW1lbnNpb24gPSBjYW52YXNMYXllci5nZXREaW1lbnNpb24oKTtcblxuXHRcdGxldCB4TWluID0gTWF0aC5mbG9vcihkaW1lbnNpb24ueCAvIHRoaXMuZ3JpZFdpZHRoKTtcblx0XHRsZXQgeE1heCA9IE1hdGguZmxvb3IoKGRpbWVuc2lvbi54ICsgZGltZW5zaW9uLncpIC8gdGhpcy5ncmlkV2lkdGgpO1xuXG5cdFx0bGV0IHlNaW4gPSBNYXRoLmZsb29yKGRpbWVuc2lvbi55IC8gdGhpcy5ncmlkSGVpZ2h0KTtcblx0XHRsZXQgeU1heCA9IE1hdGguZmxvb3IoKGRpbWVuc2lvbi55ICsgZGltZW5zaW9uLmgpIC8gdGhpcy5ncmlkSGVpZ2h0KTtcblxuXHRcdHZhciBtZXNzYWdlID0gXCJncmlkOiBbXCJcblxuXHRcdGZvciAodmFyIHggPSB4TWluOyB4PD14TWF4OyB4Kyspe1xuXHRcdFx0Zm9yICh2YXIgeSA9IHlNaW47IHk8PXlNYXg7IHkrKyl7XG5cdFx0XHRcdG1lc3NhZ2UgPSBtZXNzYWdlICsgXCJbXCIgKyB4ICsgXCIsIFwiICsgeSArIFwiXVwiO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdG1lc3NhZ2UgPSBtZXNzYWdlICsgXCJdXCI7XG5cblx0XHR0aGlzLmxvZ2dlci5sb2cobWVzc2FnZSk7XG5cdH1cbn1cbiIsImltcG9ydCB7IENhbnZhc0VsZW1lbnQgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvbGF5ZXJcIjtcbmltcG9ydCB7IENhbnZhc1ZpZXcgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgVGh1bWIgfSBmcm9tIFwiLi4vZ3JhcGhpY3Mvc3RhdGljXCI7XG5pbXBvcnQgeyBJbWFnZUNvbnRyb2xsZXIgfSBmcm9tIFwiLi9pbWFnZWNvbnRyb2xsZXJcIjtcblxuZXhwb3J0IGNsYXNzIENhbnZhc0xheWVyVmlldyB7XG5cblx0cmVhZG9ubHkgY29udGFpbmVyOiBIVE1MU3BhbkVsZW1lbnQ7XG5cblx0Y29uc3RydWN0b3IoXG5cdCAgbGF5ZXI6IENhbnZhc0VsZW1lbnQsIFxuXHQgIGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIFxuXHQgIGltYWdlQ29udHJvbGxlcjogSW1hZ2VDb250cm9sbGVyXG5cdCl7XG5cblx0XHR0aGlzLmNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuXHRcdHRoaXMuY29udGFpbmVyLmNsYXNzTmFtZSA9IFwibGF5ZXJcIjtcblxuXHRcdGxldCBlZGl0ZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG5cblx0XHRsZXQgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcblx0XHRsYWJlbC5pbm5lckhUTUwgPSBsYXllci5uYW1lO1xuXG5cdFx0bGV0IHZpc2liaWxpdHk6IEhUTUxJbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG5cdFx0dmlzaWJpbGl0eS50eXBlID0gXCJjaGVja2JveFwiO1xuXHRcdHZpc2liaWxpdHkuY2hlY2tlZCA9IHRydWU7XG5cblx0XHRsZXQgZWRpdDogSFRNTElucHV0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcblx0XHRlZGl0LnR5cGUgPSBcInJhZGlvXCI7XG5cdFx0ZWRpdC5uYW1lID0gXCJlZGl0XCI7XG5cblx0XHR2aXNpYmlsaXR5LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdGlmICh0aGlzLmNoZWNrZWQpe1xuXHRcdFx0XHRsYXllci5zZXRWaXNpYmxlKHRydWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bGF5ZXIuc2V0VmlzaWJsZShmYWxzZSk7XG5cdFx0XHR9XG5cdFx0XHRjYW52YXNWaWV3LmRyYXcoKTtcblx0XHR9KTtcblxuXHRcdGVkaXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0aWYgKHRoaXMuY2hlY2tlZCl7XG5cdFx0XHRcdGltYWdlQ29udHJvbGxlci5zZXRDYW52YXNFbGVtZW50KGxheWVyKTtcblx0XHRcdH0gXG5cdFx0XHRjYW52YXNWaWV3LmRyYXcoKTtcblx0XHR9KTtcblxuXHRcdHZhciB0aHVtYiA9IDxUaHVtYj4gbGF5ZXI7XG5cblx0XHRsZXQgY2FudmFzSW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHRcdGxldCB0aHVtYkN0eCA9IGNhbnZhc0ltYWdlLmdldENvbnRleHQoXCIyZFwiKTtcblx0XHR0aHVtYi5kcmF3VGh1bWIodGh1bWJDdHgsIDIwMCwgMjAwKTtcblxuXHRcdGxldCB0aHVtYm5haWw6IEhUTUxJbWFnZUVsZW1lbnQgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aHVtYm5haWwuc3JjID0gY2FudmFzSW1hZ2UudG9EYXRhVVJMKCk7XG5cdFx0dGh1bWJuYWlsLmNsYXNzTmFtZSA9IFwidGh1bWJuYWlsXCI7XG5cdFx0dGh1bWJuYWlsLnRpdGxlID0gbGF5ZXIuZGVzY3JpcHRpb247XG5cblx0XHRlZGl0ZGl2LmFwcGVuZENoaWxkKGxhYmVsKTtcblx0XHRlZGl0ZGl2LmFwcGVuZENoaWxkKHZpc2liaWxpdHkpO1xuXHRcdGVkaXRkaXYuYXBwZW5kQ2hpbGQoZWRpdCk7XG5cdFx0dGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoZWRpdGRpdik7XG5cdFx0dGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGh1bWJuYWlsKTtcblx0fVxuXG59IiwiaW1wb3J0IHsgQ2FudmFzVmlldyB9IGZyb20gXCIuLi9ncmFwaGljcy9jYW52YXN2aWV3XCI7XG5pbXBvcnQgeyBDYW52YXNFbGVtZW50IH0gZnJvbSBcIi4uL2dyYXBoaWNzL2xheWVyXCI7XG5pbXBvcnQgeyBFZGl0TWFuYWdlciB9IGZyb20gXCIuLi9ncmFwaGljcy9lZGl0bWFuYWdlclwiO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi4vZ3JhcGhpY3Mvc2hhcGVcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBNb3VzZUNvbnRyb2xsZXIgfSBmcm9tIFwiLi9tb3VzZWNvbnRyb2xsZXJcIjtcbmltcG9ydCB7IEluZGV4ZXIgfSBmcm9tIFwiLi4vaW5kZXgvaW5kZXhlclwiO1xuaW1wb3J0IHsgVmlld1RyYW5zZm9ybSB9IGZyb20gXCIuLi9ncmFwaGljcy92aWV3XCI7XG5pbXBvcnQgeyBMb2dnZXIsIENvbnNvbGVMb2dnZXIgfSBmcm9tIFwiLi4vbG9nZ2luZy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgQ2FudmFzTGF5ZXJWaWV3IH0gZnJvbSBcIi4vY2FudmFzbGF5ZXJ2aWV3XCI7XG5cbmV4cG9ydCBjbGFzcyBFZGl0Q29udHJvbGxlciBleHRlbmRzIE1vdXNlQ29udHJvbGxlciB7XG5cblx0cHJpdmF0ZSBsb2dnZXI6IExvZ2dlcjtcbiAgICBwcml2YXRlIGRyYWdQb3NpdGlvbjogUG9pbnQyRDtcbiAgICBwcml2YXRlIGRyYWdQb2ludDogUG9pbnQ7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgIHJlYWRvbmx5IGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsXG4gICAgICByZWFkb25seSBlZGl0TWFuYWdlcjogRWRpdE1hbmFnZXJcbiAgICApIHtcbiAgICBcdHN1cGVyKCk7XG5cbiAgICBcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmNsaWNrZWQoZSBhcyBNb3VzZUV2ZW50KSk7XG5cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKGU6IEV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMuZHJhZ1BvaW50ID0gdW5kZWZpbmVkKTtcblxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlOiBFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLmRyYWcoZSBhcyBNb3VzZUV2ZW50KSk7XG5cbiAgICBcdHRoaXMubG9nZ2VyID0gbmV3IENvbnNvbGVMb2dnZXIoKTtcbiAgICB9XG5cbiAgICBzZXRMb2dnaW5nKGxvZ2dlcjogTG9nZ2VyKTogdm9pZCB7XG4gICAgXHR0aGlzLmxvZ2dlciA9IGxvZ2dlcjtcbiAgICB9XG5cbiAgICBjbGlja2VkKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBcdGxldCBwb2ludCAgPSB0aGlzLm1vdXNlUG9zaXRpb24oZSwgdGhpcy5jYW52YXNWaWV3LmNhbnZhc0VsZW1lbnQpO1xuXG4gICAgICAgIHRoaXMuZHJhZ1Bvc2l0aW9uID0gbmV3IFBvaW50MkQocG9pbnRbMF0sIHBvaW50WzFdKTtcblxuICAgIFx0bGV0IHdvcmxkUG9pbnQgPSB0aGlzLmNhbnZhc1ZpZXcuZ2V0QmFzZVBvaW50KFxuICAgIFx0XHR0aGlzLmRyYWdQb3NpdGlvbik7XG5cbiAgICAgICAgbGV0IGVkaXRQb2ludCA9IHRoaXMuZWRpdE1hbmFnZXIuZ2V0UG9pbnQod29ybGRQb2ludC54LCB3b3JsZFBvaW50LnkpO1xuXG4gICAgICAgIGlmIChlZGl0UG9pbnQgIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZm91bmQgZWRpdCBwb2ludCBcIiArIGVkaXRQb2ludC54ICsgXCIsIFwiICsgZWRpdFBvaW50LnkpO1xuICAgICAgICAgICAgdGhpcy5kcmFnUG9pbnQgPSBlZGl0UG9pbnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm5vdCBhbiBlZGl0IHBvaW50IFwiKTtcbiAgICAgICAgICAgIHRoaXMuZWRpdE1hbmFnZXIuYWRkUG9pbnQod29ybGRQb2ludC54LCB3b3JsZFBvaW50LnkpO1xuICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3LmRyYXcoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYWcoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcblxuICAgICAgICBpZiAodGhpcy5kcmFnUG9pbnQgIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIGxldCBwb2ludCAgPSB0aGlzLm1vdXNlUG9zaXRpb24oZXZlbnQsIHRoaXMuY2FudmFzVmlldy5jYW52YXNFbGVtZW50KTtcblxuICAgICAgICAgICAgbGV0IHhEZWx0YSA9IChwb2ludFswXSAtIHRoaXMuZHJhZ1Bvc2l0aW9uLngpIC8gdGhpcy5jYW52YXNWaWV3Lnpvb21YO1xuICAgICAgICAgICAgbGV0IHlEZWx0YSA9IChwb2ludFsxXSAtIHRoaXMuZHJhZ1Bvc2l0aW9uLnkpIC8gdGhpcy5jYW52YXNWaWV3Lnpvb21ZO1xuXG4gICAgICAgICAgICB0aGlzLmRyYWdQb2ludC54ID0gdGhpcy5kcmFnUG9pbnQueCArIHhEZWx0YTtcbiAgICAgICAgICAgIHRoaXMuZHJhZ1BvaW50LnkgPSB0aGlzLmRyYWdQb2ludC55ICsgeURlbHRhO1xuXG4gICAgICAgICAgICB0aGlzLmVkaXRNYW5hZ2VyLnVwZGF0ZVBvaW50KHRoaXMuZHJhZ1BvaW50KTtcblxuICAgICAgICAgICAgdGhpcy5kcmFnUG9zaXRpb24gPSBuZXcgUG9pbnQyRChwb2ludFswXSwgcG9pbnRbMV0pO1xuXG4gICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQge0NhbnZhc1ZpZXcsIERpc3BsYXlFbGVtZW50fSBmcm9tIFwiLi4vZ3JhcGhpY3MvY2FudmFzdmlld1wiO1xuaW1wb3J0IHtDYW52YXNFbGVtZW50fSBmcm9tIFwiLi4vZ3JhcGhpY3MvbGF5ZXJcIjtcbmltcG9ydCB7UmVjdExheWVyfSBmcm9tIFwiLi4vZ3JhcGhpY3Mvc3RhdGljXCI7XG5pbXBvcnQge0dyaWRJbmRleGVyfSBmcm9tIFwiLi4vaW5kZXgvZ3JpZGluZGV4ZXJcIjtcbmltcG9ydCB7RWxlbWVudExvZ2dlcn0gZnJvbSBcIi4uL2xvZ2dpbmcvbG9nZ2VyXCI7XG5cbmV4cG9ydCBjbGFzcyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3IoY2FudmFzVmlldzogQ2FudmFzVmlldywgcmVhZG9ubHkgZGlzcGxheUVsZW1lbnQ6IERpc3BsYXlFbGVtZW50LCAgcHVibGljIG1vZDogc3RyaW5nID0gXCJ2XCIpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZChjYW52YXNWaWV3LCBlICBhcyBLZXlib2FyZEV2ZW50KSk7XG4gICAgfVxuXG4gICAgcHJlc3NlZChjYW52YXNWaWV3OiBDYW52YXNWaWV3LCBldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICBcbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgIGNhc2UgdGhpcy5tb2Q6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0b2dnbGUgdmlzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlFbGVtZW50LnNldFZpc2libGUoIXRoaXMuZGlzcGxheUVsZW1lbnQuaXNWaXNpYmxlKCkpO1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VDb250cm9sbGVyIHtcblxuICAgIHByaXZhdGUgY2FudmFzRWxlbWVudDogQ2FudmFzRWxlbWVudDtcbiAgICBwcml2YXRlIGxheWVyT3V0bGluZTogUmVjdExheWVyO1xuICAgIHByaXZhdGUgZWRpdEluZm9QYW5lOiBIVE1MRWxlbWVudDtcblxuICAgIHByaXZhdGUgaW5kZXhlcjogR3JpZEluZGV4ZXIgPSBuZXcgR3JpZEluZGV4ZXIoMjU2KTtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgY2FudmFzVmlldzogQ2FudmFzVmlldywgY2FudmFzRWxlbWVudDogQ2FudmFzRWxlbWVudCkge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5wcmVzc2VkKGNhbnZhc1ZpZXcsIGUgIGFzIEtleWJvYXJkRXZlbnQpKTtcbiAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50ID0gY2FudmFzRWxlbWVudDtcbiAgICB9XG5cbiAgICBzZXRDYW52YXNFbGVtZW50KENhbnZhc0VsZW1lbnQ6IENhbnZhc0VsZW1lbnQpe1xuICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQgPSBDYW52YXNFbGVtZW50O1xuXG4gICAgICAgIHRoaXMuaW5kZXhlci5zaG93SW5kaWNlcyhDYW52YXNFbGVtZW50KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKHRoaXMuY2FudmFzVmlldyk7XG4gICAgfVxuXG4gICAgc2V0RWRpdEluZm9QYW5lKGVkaXRJbmZvUGFuZTogSFRNTEVsZW1lbnQpe1xuICAgICAgICB0aGlzLmVkaXRJbmZvUGFuZSA9IGVkaXRJbmZvUGFuZTtcbiAgICB9XG5cbiAgICBzZXRMYXllck91dGxpbmUobGF5ZXJPdXRsaW5lOiBSZWN0TGF5ZXIpe1xuICAgICAgICB0aGlzLmxheWVyT3V0bGluZSA9IGxheWVyT3V0bGluZTtcbiAgICB9XG5cbiAgICBwcmVzc2VkKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicHJlc3NlZFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQua2V5KTtcblxuICAgICAgICBsZXQgbXVsdGlwbGllciA9IDE7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgIGNhc2UgXCJhXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LnggPSB0aGlzLmNhbnZhc0VsZW1lbnQueCAtIDAuNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiQVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC54ID0gdGhpcy5jYW52YXNFbGVtZW50LnggLSA1ICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJkXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LnggPSB0aGlzLmNhbnZhc0VsZW1lbnQueCArIDAuNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiRFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC54ID0gdGhpcy5jYW52YXNFbGVtZW50LnggKyA1ICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJ3XCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LnkgPSB0aGlzLmNhbnZhc0VsZW1lbnQueSAtIDAuNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiV1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC55ID0gdGhpcy5jYW52YXNFbGVtZW50LnkgLSA1ICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhazsgICAgXG4gICAgICAgICAgICBjYXNlIFwic1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC55ID0gdGhpcy5jYW52YXNFbGVtZW50LnkgKyAwLjUgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlNcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQueSA9IHRoaXMuY2FudmFzRWxlbWVudC55ICsgNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC5yb3RhdGlvbiA9IHRoaXMuY2FudmFzRWxlbWVudC5yb3RhdGlvbiAtIDAuMDA1O1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIkVcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQucm90YXRpb24gPSB0aGlzLmNhbnZhc0VsZW1lbnQucm90YXRpb24gLSAwLjA1O1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInFcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQucm90YXRpb24gPSB0aGlzLmNhbnZhc0VsZW1lbnQucm90YXRpb24gKyAwLjAwNTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJRXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LnJvdGF0aW9uID0gdGhpcy5jYW52YXNFbGVtZW50LnJvdGF0aW9uICsgMC4wNTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJ4XCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50Lnpvb21YID0gdGhpcy5jYW52YXNFbGVtZW50Lnpvb21YIC0gMC4wMDIgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlhcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQuem9vbVggPSB0aGlzLmNhbnZhc0VsZW1lbnQuem9vbVggKyAwLjAwMiAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwielwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC56b29tWSA9IHRoaXMuY2FudmFzRWxlbWVudC56b29tWSAtIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJaXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50Lnpvb21ZID0gdGhpcy5jYW52YXNFbGVtZW50Lnpvb21ZICsgMC4wMDIgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImNcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQuc2V0VmlzaWJsZSghdGhpcy5jYW52YXNFbGVtZW50LnZpc2libGUpO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQub3BhY2l0eSA9IE1hdGgubWluKDEuMCwgdGhpcy5jYW52YXNFbGVtZW50Lm9wYWNpdHkgKyAwLjEpO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQub3BhY2l0eSA9IE1hdGgubWF4KDAsIHRoaXMuY2FudmFzRWxlbWVudC5vcGFjaXR5IC0gMC4xKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8gY29kZS4uLlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGluZm86IHN0cmluZyA9ICdcIm5hbWVcIjogJyArIHRoaXMuY2FudmFzRWxlbWVudC5uYW1lICtcbiAgICAgICAgICAgICAgJyBcInhcIjogJyArIHRoaXMuY2FudmFzRWxlbWVudC54ICtcbiAgICAgICAgICAgICAgJywgXCJ5XCI6ICcgKyB0aGlzLmNhbnZhc0VsZW1lbnQueSArXG4gICAgICAgICAgICAgICcsIFwiem9vbVhcIjogJysgdGhpcy5jYW52YXNFbGVtZW50Lnpvb21YICsgXG4gICAgICAgICAgICAgICcsIFwiem9vbVlcIjogJyArIHRoaXMuY2FudmFzRWxlbWVudC56b29tWSArIFxuICAgICAgICAgICAgICAnLCBcInJvdGF0aW9uXCI6ICcrIHRoaXMuY2FudmFzRWxlbWVudC5yb3RhdGlvbjtcblxuICAgICAgICBpZiAodGhpcy5lZGl0SW5mb1BhbmUgIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHRoaXMuZWRpdEluZm9QYW5lLmlubmVySFRNTCA9IGluZm87XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhpbmZvKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB1cGRhdGVDYW52YXMoY2FudmFzVmlldzogQ2FudmFzVmlldykge1xuXG4gICAgICAgIGlmICh0aGlzLmxheWVyT3V0bGluZSAhPSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgbGV0IG5ld0RpbWVuc2lvbiA9IHRoaXMuY2FudmFzRWxlbWVudC5nZXREaW1lbnNpb24oKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJpbWFnZSBvdXRsaW5lIFwiICsgbmV3RGltZW5zaW9uKTtcbiAgICAgICAgICAgIHRoaXMubGF5ZXJPdXRsaW5lLnVwZGF0ZURpbWVuc2lvbihuZXdEaW1lbnNpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgfVxuXG59OyIsImltcG9ydCB7IENhbnZhc1ZpZXcgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgQ2FudmFzRWxlbWVudCB9IGZyb20gXCIuLi9ncmFwaGljcy9sYXllclwiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcbmltcG9ydCB7IE1vdXNlQ29udHJvbGxlciB9IGZyb20gXCIuL21vdXNlY29udHJvbGxlclwiO1xuaW1wb3J0IHsgSW5kZXhlciB9IGZyb20gXCIuLi9pbmRleC9pbmRleGVyXCI7XG5pbXBvcnQgeyBMb2dnZXIsIENvbnNvbGVMb2dnZXIgfSBmcm9tIFwiLi4vbG9nZ2luZy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgSW1hZ2VDb250cm9sbGVyIH0gZnJvbSBcIi4vaW1hZ2Vjb250cm9sbGVyXCI7XG5pbXBvcnQgeyBJbmRleFZpZXcgfSBmcm9tIFwiLi9pbmRleHZpZXdcIjtcbmltcG9ydCB7IENhbnZhc0xheWVyVmlldyB9IGZyb20gXCIuL2NhbnZhc2xheWVydmlld1wiO1xuXG5leHBvcnQgY2xhc3MgSW5kZXhDb250cm9sbGVyIGV4dGVuZHMgTW91c2VDb250cm9sbGVyIHtcblxuXHRwcml2YXRlIGxvZ2dlcjogTG9nZ2VyO1xuXHRwcml2YXRlIGluZGV4ZXJzOiBBcnJheTxJbmRleGVyPjtcblx0cHJpdmF0ZSBtZW51OiBIVE1MRWxlbWVudDtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgcmVhZG9ubHkgY2FudmFzVmlldzogQ2FudmFzVmlldyxcbiAgICAgIHJlYWRvbmx5IGltYWdlQ29udHJvbGxlcjogSW1hZ2VDb250cm9sbGVyXG4gICAgKSB7XG5cbiAgICBcdHN1cGVyKCk7XG5cbiAgICBcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkYmxjbGlja1wiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuY2xpY2tlZChlICBhcyBNb3VzZUV2ZW50KSk7XG5cbiAgICBcdHRoaXMuaW5kZXhlcnMgPSBbXTtcbiAgICBcdHRoaXMubG9nZ2VyID0gbmV3IENvbnNvbGVMb2dnZXIoKTtcbiAgICB9XG5cbiAgICBzZXRMb2dnaW5nKGxvZ2dlcjogTG9nZ2VyKXtcbiAgICBcdHRoaXMubG9nZ2VyID0gbG9nZ2VyO1xuICAgIH1cblxuICAgIHNldE1lbnUobWVudTogSFRNTEVsZW1lbnQpe1xuICAgIFx0dGhpcy5tZW51ID0gbWVudTtcbiAgICB9XG5cbiAgICBhZGRJbmRleGVyKGluZGV4ZXI6IEluZGV4ZXIpe1xuICAgIFx0dGhpcy5pbmRleGVycy5wdXNoKGluZGV4ZXIpO1xuICAgIH1cblxuICAgIGNsaWNrZWQoZTogTW91c2VFdmVudCl7XG4gICAgXHRsZXQgcG9pbnQgID0gdGhpcy5tb3VzZVBvc2l0aW9uKGUsIHRoaXMuY2FudmFzVmlldy5jYW52YXNFbGVtZW50KTtcblxuICAgIFx0bGV0IHdvcmxkUG9pbnQgPSB0aGlzLmNhbnZhc1ZpZXcuZ2V0QmFzZVBvaW50KFxuICAgIFx0XHRuZXcgUG9pbnQyRChwb2ludFswXSwgcG9pbnRbMV0pKTtcblxuICAgIFx0dmFyIGxheWVyczogQXJyYXk8Q2FudmFzRWxlbWVudD4gPSBbXTtcblxuICAgIFx0Zm9yIChsZXQgaW5kZXhlciBvZiB0aGlzLmluZGV4ZXJzKSB7XG4gICAgXHRcdGxldCBuZXdMYXllcnMgPSB0aGlzLmZpbHRlclZpc2libGUoXG4gICAgXHRcdFx0aW5kZXhlci5nZXRMYXllcnMod29ybGRQb2ludC54LCB3b3JsZFBvaW50LnkpKTtcbiAgICBcdFx0bGF5ZXJzID0gbGF5ZXJzLmNvbmNhdChuZXdMYXllcnMpO1xuICAgIFx0fVxuXG4gICAgXHRpZiAodGhpcy5tZW51ICE9IHVuZGVmaW5lZCl7XG4gICAgXHRcdGxldCBsYXllclZpZXcgPSBuZXcgSW5kZXhWaWV3KHRoaXMubWVudSwgdGhpcy5jYW52YXNWaWV3LCBcbiAgICBcdFx0XHR0aGlzLmltYWdlQ29udHJvbGxlcik7XG4gICAgXHRcdGxheWVyVmlldy5zZXRFbGVtZW50cyhsYXllcnMpO1xuICAgIFx0fVxuICAgIH1cblxuXHRwcml2YXRlIGZpbHRlclZpc2libGUobGF5ZXJzOiBBcnJheTxDYW52YXNFbGVtZW50Pil7XG5cdFx0cmV0dXJuIGxheWVycy5maWx0ZXIoZnVuY3Rpb24obGF5ZXIpIHsgXG5cdFx0XHRyZXR1cm4gbGF5ZXIuaXNWaXNpYmxlKCk7XG5cdFx0fSk7XG5cdH1cblxufSIsImltcG9ydCB7IENhbnZhc0VsZW1lbnQgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvbGF5ZXJcIjtcbmltcG9ydCB7IENhbnZhc1ZpZXcgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgQ2FudmFzTGF5ZXJWaWV3IH0gZnJvbSBcIi4vY2FudmFzbGF5ZXJ2aWV3XCI7XG5pbXBvcnQgeyBJbWFnZUNvbnRyb2xsZXIgfSBmcm9tIFwiLi9pbWFnZWNvbnRyb2xsZXJcIjtcblxuZXhwb3J0IGNsYXNzIEluZGV4VmlldyB7XG5cblx0Y29uc3RydWN0b3IoXG5cdCAgcmVhZG9ubHkgdmlld0VsZW1lbnQ6IEhUTUxFbGVtZW50LCBcblx0ICByZWFkb25seSBjYW52YXNWaWV3OiBDYW52YXNWaWV3LFxuXHQgIHJlYWRvbmx5IGltYWdlQ29udHJvbGxlcjogSW1hZ2VDb250cm9sbGVyXG5cdCl7fVxuXHRcblx0c2V0RWxlbWVudHMoY2FudmFzRWxlbWVudHM6IEFycmF5PENhbnZhc0VsZW1lbnQ+KTogdm9pZCB7XG5cdFx0dGhpcy5jbGVhcigpO1xuXHRcdFxuXHRcdGZvciAobGV0IGNhbnZhc0xheWVyIG9mIGNhbnZhc0VsZW1lbnRzKXtcblx0XHRcdGxldCBsYXllclZpZXcgPSBuZXcgQ2FudmFzTGF5ZXJWaWV3KGNhbnZhc0xheWVyLCB0aGlzLmNhbnZhc1ZpZXcsIFxuXHRcdFx0XHR0aGlzLmltYWdlQ29udHJvbGxlcik7XG5cdFx0XHR0aGlzLnZpZXdFbGVtZW50LmFwcGVuZENoaWxkKGxheWVyVmlldy5jb250YWluZXIpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgY2xlYXIoKTogYm9vbGVhbiB7XG5cdFx0bGV0IGNoaWxkcmVuID0gdGhpcy52aWV3RWxlbWVudC5jaGlsZHJlbjtcblx0XHRsZXQgaW5pdGlhbExlbmd0aCA9IGNoaWxkcmVuLmxlbmd0aDtcblxuXHRcdHdoaWxlIChjaGlsZHJlbi5sZW5ndGggPiAwKSB7XG5cdFx0XHRjaGlsZHJlblswXS5yZW1vdmUoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG59IiwiaW1wb3J0IHsgQ29udGFpbmVyTGF5ZXJNYW5hZ2VyIH0gZnJvbSBcIi4uL2dyYXBoaWNzL2xheWVybWFuYWdlclwiO1xuaW1wb3J0IHsgQ2FudmFzVmlldyB9IGZyb20gXCIuLi9ncmFwaGljcy9jYW52YXN2aWV3XCI7XG5cbmV4cG9ydCBjbGFzcyBMYXllckNvbnRyb2xsZXIge1xuXG5cdHByaXZhdGUgbW9kOiBzdHJpbmcgPSBcImlcIjtcblxuXHRjb25zdHJ1Y3RvcihjYW52YXNWaWV3OiBDYW52YXNWaWV3LCByZWFkb25seSBjb250YWluZXJMYXllck1hbmFnZXI6IENvbnRhaW5lckxheWVyTWFuYWdlcil7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZChjYW52YXNWaWV3LCBlICBhcyBLZXlib2FyZEV2ZW50KSk7XG5cdH1cblxuXHRwcmVzc2VkKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgIGNhc2UgdGhpcy5tb2Q6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0b2dnbGUgdmlzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lckxheWVyTWFuYWdlci50b2dnbGVWaXNpYmlsaXR5KGZhbHNlKTtcbiAgICAgICAgICAgICAgICBjYW52YXNWaWV3LmRyYXcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxufSIsImV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNb3VzZUNvbnRyb2xsZXIge1xuXG4gICAgbW91c2VQb3NpdGlvbihldmVudDogTW91c2VFdmVudCwgd2l0aGluOiBIVE1MRWxlbWVudCk6IEFycmF5PG51bWJlcj4ge1xuICAgICAgICBsZXQgbV9wb3N4ID0gZXZlbnQuY2xpZW50WCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0O1xuICAgICAgICBsZXQgbV9wb3N5ID0gZXZlbnQuY2xpZW50WSArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wXG4gICAgICAgICAgICAgICAgICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcblxuICAgICAgICB2YXIgZV9wb3N4ID0gMDtcbiAgICAgICAgdmFyIGVfcG9zeSA9IDA7XG5cbiAgICAgICAgaWYgKHdpdGhpbi5vZmZzZXRQYXJlbnQpe1xuICAgICAgICAgICAgZG8geyBcbiAgICAgICAgICAgICAgICBlX3Bvc3ggKz0gd2l0aGluLm9mZnNldExlZnQ7XG4gICAgICAgICAgICAgICAgZV9wb3N5ICs9IHdpdGhpbi5vZmZzZXRUb3A7XG4gICAgICAgICAgICB9IHdoaWxlICh3aXRoaW4gPSA8SFRNTEVsZW1lbnQ+d2l0aGluLm9mZnNldFBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW21fcG9zeCAtIGVfcG9zeCwgbV9wb3N5IC0gZV9wb3N5XTtcbiAgICB9XG5cbn1cbiIsImltcG9ydCB7IFZpZXdUcmFuc2Zvcm0gfSBmcm9tIFwiLi4vZ3JhcGhpY3Mvdmlld1wiO1xuaW1wb3J0IHsgQ2FudmFzVmlldyB9IGZyb20gXCIuLi9ncmFwaGljcy9jYW52YXN2aWV3XCI7XG5pbXBvcnQgeyBNb3VzZUNvbnRyb2xsZXIgfSBmcm9tIFwiLi9tb3VzZWNvbnRyb2xsZXJcIjtcblxuZXhwb3J0IGNsYXNzIFZpZXdDb250cm9sbGVyIGV4dGVuZHMgTW91c2VDb250cm9sbGVyIHtcblxuXHRyZWNvcmQ6IGJvb2xlYW47XG5cdG1vdmU6IG51bWJlciA9IDE7XG5cblx0cHJpdmF0ZSB4UHJldmlvdXM6IG51bWJlcjtcblx0cHJpdmF0ZSB5UHJldmlvdXM6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3Rvcih2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtLCBcbiAgICAgICAgcmVhZG9ubHkgZHJhZ0VsZW1lbnQ6IEhUTUxFbGVtZW50LCByZWFkb25seSBjYW52YXNWaWV3OiBDYW52YXNWaWV3KSB7XG5cbiAgICBcdHN1cGVyKCk7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybSkpO1xuICAgIFx0ZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm0pKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybSkpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLnJlY29yZCA9IGZhbHNlKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5jbGlja2VkKGUgYXMgTW91c2VFdmVudCwgY2FudmFzVmlldywgMS4yKSk7XG4gICAgICAgIGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCAoZTogRXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy53aGVlbChlIGFzIFdoZWVsRXZlbnQsIGNhbnZhc1ZpZXcpKTtcbiAgICB9XG5cbiAgICBjbGlja2VkKGV2ZW50OiBNb3VzZUV2ZW50LCB2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtLCB6b29tQnk6IG51bWJlcil7XG4gICAgXHRzd2l0Y2goZXZlbnQudHlwZSl7XG4gICAgXHRcdGNhc2UgXCJkYmxjbGlja1wiOlxuICAgICAgICAgICAgICAgIC8vIGlmICAoZXZlbnQuY3RybEtleSkge1xuICAgICAgICAgICAgICAgIC8vICAgICB6b29tQnkgPSAxIC8gem9vbUJ5O1xuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBsZXQgbVhZID0gdGhpcy5tb3VzZVBvc2l0aW9uKGV2ZW50LCB0aGlzLmRyYWdFbGVtZW50KTtcblxuICAgICAgICAgICAgICAgIC8vIHRoaXMuY2FudmFzVmlldy56b29tQWJvdXQobVhZWzBdLCBtWFlbMV0sIHpvb21CeSk7XG5cbiAgICAgICAgICAgICAgICAvLyB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYWdnZWQoZXZlbnQ6IE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm06IFZpZXdUcmFuc2Zvcm0pIHtcblxuICAgLy8gIFx0c3dpdGNoKGV2ZW50LnR5cGUpe1xuICAgLy8gIFx0XHRjYXNlIFwibW91c2Vkb3duXCI6XG4gICAvLyAgXHRcdFx0dGhpcy5yZWNvcmQgPSB0cnVlO1xuICAgLy8gIFx0XHRcdGJyZWFrO1xuICAgLy8gIFx0XHRjYXNlIFwibW91c2V1cFwiOlxuICAgLy8gIFx0XHRcdHRoaXMucmVjb3JkID0gZmFsc2U7XG4gICAvLyAgXHRcdFx0YnJlYWs7XG4gICAvLyAgXHRcdGRlZmF1bHQ6XG4gICAvLyAgXHRcdFx0aWYgKHRoaXMucmVjb3JkKXtcbiAgIC8vICAgICAgICAgICAgICAgICAgbGV0IHhEZWx0YSA9IChldmVudC5jbGllbnRYIC0gdGhpcy54UHJldmlvdXMpIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWDtcbiAgIC8vICAgICAgICAgICAgICAgICAgbGV0IHlEZWx0YSA9IChldmVudC5jbGllbnRZIC0gdGhpcy55UHJldmlvdXMpIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWTtcblxuICAgLy8gICAgICAgICAgICAgICAgICB2aWV3VHJhbnNmb3JtLnggPSB2aWV3VHJhbnNmb3JtLnggLSB4RGVsdGE7XG4gICAvLyAgICAgICAgICAgICAgICAgIHZpZXdUcmFuc2Zvcm0ueSA9IHZpZXdUcmFuc2Zvcm0ueSAtIHlEZWx0YTtcblxuICAgLy8gICAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgLy8gIFx0XHRcdH1cblxuXHRcdFx0Ly8gdGhpcy54UHJldmlvdXMgPSBldmVudC5jbGllbnRYO1xuXHRcdFx0Ly8gdGhpcy55UHJldmlvdXMgPSBldmVudC5jbGllbnRZO1xuICAgLy8gIFx0fVxuICAgIH1cblxuICAgIHdoZWVsKGV2ZW50OiBXaGVlbEV2ZW50LCB2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtKSB7XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIndoZWVsXCIgKyBldmVudC50YXJnZXQgKyBcIiwgXCIgKyBldmVudC50eXBlKTtcblxuICAgICAgICBsZXQgeERlbHRhID0gZXZlbnQuZGVsdGFYIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWDtcbiAgICAgICAgbGV0IHlEZWx0YSA9IGV2ZW50LmRlbHRhWSAvIHRoaXMubW92ZSAvIHZpZXdUcmFuc2Zvcm0uem9vbVk7XG5cbiAgICAgICAgaWYgIChldmVudC5jdHJsS2V5KSB7XG4gICAgICAgICAgICBsZXQgbVhZID0gdGhpcy5tb3VzZVBvc2l0aW9uKGV2ZW50LCB0aGlzLmRyYWdFbGVtZW50KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBieSA9IDEuMDU7XG4gICAgICAgICAgICBpZiAoeURlbHRhIDwgMCl7XG4gICAgICAgICAgICAgICAgYnkgPSAwLjk1O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuem9vbUFib3V0KG1YWVswXSwgbVhZWzFdLCBieSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcueCA9ICB0aGlzLmNhbnZhc1ZpZXcueCArIHhEZWx0YTtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy55ID0gIHRoaXMuY2FudmFzVmlldy55ICsgeURlbHRhO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgIH1cblxufVxuIiwiZXhwb3J0IGludGVyZmFjZSBMb2dnZXIge1xuXHRsb2coaW5mbzogc3RyaW5nKTogdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIEVsZW1lbnRMb2dnZXIgaW1wbGVtZW50cyBMb2dnZXIge1xuXG5cdGNvbnN0cnVjdG9yKHJlYWRvbmx5IGRpc3BsYXlFbGVtZW50OiBIVE1MRWxlbWVudCl7fVxuXG5cdGxvZyhpbmZvOiBzdHJpbmcpOiB2b2lkIHtcblx0XHR0aGlzLmRpc3BsYXlFbGVtZW50LmlubmVyVGV4dCA9IGluZm87XG5cdH1cblxufVxuXG5leHBvcnQgY2xhc3MgQ29uc29sZUxvZ2dlciBpbXBsZW1lbnRzIExvZ2dlciB7XG5cblx0bG9nKGluZm86IHN0cmluZyk6IHZvaWQge1xuXHRcdGNvbnNvbGUubG9nKGluZm8pO1xuXHR9XG5cbn0iLCJpbXBvcnQgeyBDYW52YXNWaWV3IH0gZnJvbSBcIi4vZ3JhcGhpY3MvY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgU3RhdGljSW1hZ2UgfSBmcm9tIFwiLi9ncmFwaGljcy9zdGF0aWNcIjtcbmltcG9ydCB7IENvbnRhaW5lckxheWVyIH0gZnJvbSBcIi4vZ3JhcGhpY3MvY29udGFpbmVybGF5ZXJcIjtcbmltcG9ydCB7IE11bHRpUmVzTGF5ZXIgfSBmcm9tIFwiLi9ncmFwaGljcy9tdWx0aXJlc2xheWVyXCI7XG5pbXBvcnQgeyBCYXNpY1RyYW5zZm9ybSB9IGZyb20gXCIuL2dyYXBoaWNzL3ZpZXdcIjtcbmltcG9ydCB7IFN0YXRpY0dyaWQgfSBmcm9tIFwiLi9ncmFwaGljcy9ncmlkXCI7XG5pbXBvcnQgeyBEaXNwbGF5UmFuZ2UgfSBmcm9tIFwiLi9ncmFwaGljcy9tdWx0aXJlc2xheWVyXCI7XG5pbXBvcnQgeyBUaWxlTGF5ZXIsIFRpbGVTdHJ1Y3QsIHpvb21CeUxldmVsfSBmcm9tIFwiLi9ncmFwaGljcy90aWxlbGF5ZXJcIjtcbmltcG9ydCB7IExheWVyTWFuYWdlciwgQ29udGFpbmVyTGF5ZXJNYW5hZ2VyLCBkYXRlRmlsdGVyLCBkYXRlbGVzc0ZpbHRlciB9IGZyb20gXG4gIFwiLi9ncmFwaGljcy9sYXllcm1hbmFnZXJcIjtcblxuaW1wb3J0IHsgSW5kZXhDb250cm9sbGVyIH0gZnJvbSBcIi4vaW50ZXJmYWNlL2luZGV4Y29udHJvbGxlclwiO1xuaW1wb3J0IHsgVmlld0NvbnRyb2xsZXIgfSBmcm9tIFwiLi9pbnRlcmZhY2Uvdmlld2NvbnRyb2xsZXJcIjtcbmltcG9ydCB7IEltYWdlQ29udHJvbGxlciwgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyIH0gZnJvbSBcIi4vaW50ZXJmYWNlL2ltYWdlY29udHJvbGxlclwiO1xuaW1wb3J0IHsgTGF5ZXJDb250cm9sbGVyIH0gZnJvbSBcIi4vaW50ZXJmYWNlL2xheWVyY29udHJvbGxlclwiO1xuXG5pbXBvcnQgeyBHcmlkSW5kZXhlciB9IGZyb20gXCIuL2luZGV4L2dyaWRpbmRleGVyXCI7XG5pbXBvcnQgeyBDb250YWluZXJJbmRleCB9IGZyb20gXCIuL2luZGV4L2NvbnRhaW5lcmluZGV4XCI7XG5pbXBvcnQgeyBFbGVtZW50TG9nZ2VyIH0gZnJvbSBcIi4vbG9nZ2luZy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgUG9pbnQsIFNoYXBlLCBhcnJheVRvUG9pbnRzIH0gZnJvbSBcIi4vZ3JhcGhpY3Mvc2hhcGVcIjtcbmltcG9ydCB7IEVkaXRNYW5hZ2VyIH0gZnJvbSBcIi4vZ3JhcGhpY3MvZWRpdG1hbmFnZXJcIjtcblxuaW1wb3J0IHsgRWRpdENvbnRyb2xsZXIgfSBmcm9tIFwiLi9pbnRlcmZhY2UvZWRpdGNvbnRyb2xsZXJcIjtcblxuaW1wb3J0ICogYXMgZmlyZW1hcHMgZnJvbSBcIi4vaW1hZ2Vncm91cHMvZmlyZW1hcHMuanNvblwiO1xuaW1wb3J0ICogYXMgbGFuZG1hcmtzIGZyb20gXCIuL2ltYWdlZ3JvdXBzL2xhbmRtYXJrcy5qc29uXCI7XG5pbXBvcnQgKiBhcyB3c2MgZnJvbSBcIi4vaW1hZ2Vncm91cHMvd3NjZC5qc29uXCI7XG5cbmxldCB0ZXN0UG9pbnRzID0gW1swLDBdLCBbNDAwLCAwXSwgWzQwMCwgNDAwXSwgWzAsIDQwMF1dO1xuXG5sZXQgdGVzdFNoYXBlID0gbmV3IFNoYXBlKEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0sIDEsIHRydWUsIFwiXCIsIFwiXCIpO1xubGV0IHRlc3RQb2ludCA9IG5ldyBQb2ludCg4MDAsIDgwMCwgMjAsIDEsIHRydWUpO1xudGVzdFNoYXBlLnBvaW50cyA9IGFycmF5VG9Qb2ludHModGVzdFBvaW50cyk7XG5cbmxldCBlZGl0TWFuYWdlciA9IG5ldyBFZGl0TWFuYWdlcih0ZXN0U2hhcGUsIDEyKTtcbi8vdGVzdFNoYXBlLmZpbGwgPSB0cnVlO1xuXG5sZXQgZWFybHlEYXRlcyA9IGRhdGVGaWx0ZXIod3NjLCAxNjgwLCAxNzkyKTtcbmxldCBtaWREYXRlcyA9IGRhdGVGaWx0ZXIod3NjLCAxNzkzLCAxODIwKTtcbmxldCBsYXRlRGF0ZXMgPSBkYXRlRmlsdGVyKHdzYywgMTgyMSwgMTkwMCk7XG5sZXQgb3RoZXJEYXRlcyA9IGRhdGVsZXNzRmlsdGVyKHdzYyk7XG5cbmxldCBsYXllclN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDEsIDEsIDApO1xubGV0IGltYWdlTGF5ZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXIobGF5ZXJTdGF0ZSk7XG5cbmxldCBpbWFnZVN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0xNDQwLC0xNDQwLCAwLjIyMiwgMC4yMjIsIDApO1xuXG5sZXQgY291bnR5U3RhdGUgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oLTI2MzEsIC0yMDUxLjUsIDEuNzE2LCAxLjY3NCwgMCk7XG5sZXQgY291bnR5SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoY291bnR5U3RhdGUsIFxuICAgIFwiaW1hZ2VzL0NvdW50eV9vZl90aGVfQ2l0eV9vZl9EdWJsaW5fMTgzN19tYXAucG5nXCIsIDAuNSwgdHJ1ZSwgXCJjb3VudHlcIik7XG5cbmxldCBiZ1N0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0xMTI2LC0xMDg2LCAxLjU4LCAxLjU1LCAwKTtcbmxldCBiZ0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKGJnU3RhdGUsIFwiaW1hZ2VzL2Ztc3MuanBlZ1wiLCAuNiwgdHJ1ZSwgXCJmaXJlbWFwXCIpO1xuXG5sZXQgdG1TdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtMTAzMy41LDE0OSwgMC41OSwgMC41OSwgMCk7XG5sZXQgdG1JbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSh0bVN0YXRlLCBcImltYWdlcy90aGluZ21vdC5wbmdcIiwgLjMsIHRydWUsIFwidGhpbmdtb3RcIik7XG5cbmxldCBkdVN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC05MjksLTEwNS41LCAwLjQ2NCwgMC41MDYsIDApO1xubGV0IGR1SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoZHVTdGF0ZSwgXCJpbWFnZXMvZHVibGluMTYxMC5qcGdcIiwgLjYsIGZhbHNlLCBcIjE2MTBcIik7XG5cbmxldCBncmlkVHJhbnNmb3JtID0gQmFzaWNUcmFuc2Zvcm0udW5pdFRyYW5zZm9ybTtcbi8vIG5ldyBCYXNpY1RyYW5zZm9ybSgwLCAwLCAxLCAxLCAwKTtcbmxldCBzdGF0aWNHcmlkID0gbmV3IFN0YXRpY0dyaWQoZ3JpZFRyYW5zZm9ybSwgMCwgZmFsc2UsIDI1NiwgMjU2KTtcblxubGV0IHNlbnRpbmVsU3RydWN0ID0gbmV3IFRpbGVTdHJ1Y3QoXCJxdGlsZS9kdWJsaW4vXCIsIFwiLnBuZ1wiLCBcImltYWdlcy9xdGlsZS9kdWJsaW4vXCIpO1xuXG5sZXQgc2VudGluZWxUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgMiwgMiwgMCk7XG5sZXQgZGlzcGxheUNsb3NlID0gbmV3IERpc3BsYXlSYW5nZSgwLjgsIDQpO1xuXG5sZXQgc2VudGluZWxMYXllciA9IG5ldyBUaWxlTGF5ZXIoc2VudGluZWxUcmFuc2Zvcm0sIHNlbnRpbmVsU3RydWN0LCB0cnVlLCBcbiAgICBcInNlbnRpbmVsXCIsIFxuICAgMTU4MTYsIDEwNjI0LCAxNSk7XG5cbmxldCBzZW50aW5lbEJUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgNCwgNCwgMCk7XG5sZXQgZGlzcGxheU1pZCA9IG5ldyBEaXNwbGF5UmFuZ2UoLjIsIDAuOCk7XG5sZXQgc2VudGluZWxCTGF5ZXIgPSBuZXcgVGlsZUxheWVyKHNlbnRpbmVsQlRyYW5zZm9ybSwgc2VudGluZWxTdHJ1Y3QsIHRydWUsIFxuICAgIFwic2VudGluZWxCXCIsIFxuICAgNzkwOCwgNTMxMiwgMTQpO1xuXG5sZXQgc2VudGluZWxDVHJhbnNmb3JtID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDgsIDgsIDApO1xubGV0IGRpc3BsYXlGYXIgPSBuZXcgRGlzcGxheVJhbmdlKC4wNCwgLjIpO1xubGV0IHNlbnRpbmVsU0xheWVyID0gbmV3IFRpbGVMYXllcihzZW50aW5lbENUcmFuc2Zvcm0sIHNlbnRpbmVsU3RydWN0LCB0cnVlLCBcbiAgICBcInNlbnRpbmVsQ1wiLCBcbiAgICAzOTU0LCAyNjU2LCAxMyk7XG5cbmxldCByZWNlbnRyZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtMTAyNCwgLTE1MzYsIDEsIDEsIDApO1xubGV0IHNlbnRpbmVsQ29udGFpbmVyTGF5ZXIgPSBuZXcgTXVsdGlSZXNMYXllcihyZWNlbnRyZSwgMSwgdHJ1ZSk7XG5zZW50aW5lbENvbnRhaW5lckxheWVyLnNldChkaXNwbGF5Q2xvc2UsIHNlbnRpbmVsTGF5ZXIpO1xuc2VudGluZWxDb250YWluZXJMYXllci5zZXQoZGlzcGxheU1pZCwgc2VudGluZWxCTGF5ZXIpO1xuc2VudGluZWxDb250YWluZXJMYXllci5zZXQoZGlzcGxheUZhciwgc2VudGluZWxTTGF5ZXIpO1xuXG5sZXQgZWRpdENvbnRhaW5lckxheWVyID0gbmV3IENvbnRhaW5lckxheWVyKEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0pO1xuXG5pbWFnZUxheWVyLnNldChcImNvdW50eVwiLCBjb3VudHlJbWFnZSk7XG5pbWFnZUxheWVyLnNldChcImJhY2tncm91bmRcIiwgYmdJbWFnZSk7XG5cbmxldCBsYXllck1hbmFnZXIgPSBuZXcgTGF5ZXJNYW5hZ2VyKCk7XG5cbmxldCBmaXJlbWFwTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkTGF5ZXIoZmlyZW1hcHMsIFwiZmlyZW1hcHNcIik7XG5sZXQgbGFuZG1hcmtzTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkTGF5ZXIobGFuZG1hcmtzLCBcImxhbmRtYXJrc1wiKTtcbmxldCB3c2NFYXJseUxheWVyID0gbGF5ZXJNYW5hZ2VyLmFkZExheWVyKGVhcmx5RGF0ZXMsIFwid3NjX2Vhcmx5XCIpO1xuXG5sZXQgd3NjTWlkTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkTGF5ZXIobWlkRGF0ZXMsIFwid3NjX21pZFwiKTtcbndzY01pZExheWVyLnNldFZpc2libGUoZmFsc2UpO1xubGV0IHdzY0xhdGVMYXllciA9IGxheWVyTWFuYWdlci5hZGRMYXllcihsYXRlRGF0ZXMsIFwid3NjX2xhdGVcIik7XG53c2NMYXRlTGF5ZXIuc2V0VmlzaWJsZShmYWxzZSk7XG5sZXQgd3NjT3RoZXJMYXllciA9IGxheWVyTWFuYWdlci5hZGRMYXllcihvdGhlckRhdGVzLCBcIndzY19vdGhlclwiKTtcbndzY090aGVyTGF5ZXIuc2V0VmlzaWJsZShmYWxzZSk7XG5cbmxldCBlZGl0ID0gd3NjRWFybHlMYXllci5nZXQoXCJ3c2MtMTIyLTFcIik7XG5cbmxldCBlYXJseUluZGV4ID0gbmV3IENvbnRhaW5lckluZGV4KHdzY0Vhcmx5TGF5ZXIsIFwiZWFybHlcIik7XG5sZXQgbWlkSW5kZXggPSBuZXcgQ29udGFpbmVySW5kZXgod3NjTWlkTGF5ZXIsIFwibWlkXCIpO1xubGV0IGxhdGVJbmRleCA9IG5ldyBDb250YWluZXJJbmRleCh3c2NMYXRlTGF5ZXIsIFwibGF0ZVwiKTtcbmxldCBvdGhlckluZGV4ID0gbmV3IENvbnRhaW5lckluZGV4KHdzY090aGVyTGF5ZXIsIFwib3RoZXJcIik7XG5cbmxldCBjb250YWluZXJMYXllck1hbmFnZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXJNYW5hZ2VyKHdzY0Vhcmx5TGF5ZXIsIGVkaXRDb250YWluZXJMYXllcik7XG5sZXQgb3V0bGluZUxheWVyID0gY29udGFpbmVyTGF5ZXJNYW5hZ2VyLnNldFNlbGVjdGVkKFwid3NjLTEyMi0xXCIpO1xuXG5pbWFnZUxheWVyLnNldChcIndzY19vdGhlclwiLCB3c2NPdGhlckxheWVyKTtcbmltYWdlTGF5ZXIuc2V0KFwid3NjX2Vhcmx5XCIsIHdzY0Vhcmx5TGF5ZXIpO1xuaW1hZ2VMYXllci5zZXQoXCJ3c2NfbWlkXCIsIHdzY01pZExheWVyKTtcbmltYWdlTGF5ZXIuc2V0KFwid3NjX2xhdGVcIiwgd3NjTGF0ZUxheWVyKTtcblxuLy8gaW1hZ2VMYXllci5zZXQoXCJmaXJlbWFwc1wiLCBmaXJlbWFwTGF5ZXIpO1xuXG4vLyBpbWFnZUxheWVyLnNldChcImR1YmxpbjE2MTBcIiwgZHVJbWFnZSk7XG4vLyBpbWFnZUxheWVyLnNldChcInRoaW5nbW90XCIsIHRtSW1hZ2UpO1xuLy8gaW1hZ2VMYXllci5zZXQoXCJsYW5kbWFya3NcIiwgbGFuZG1hcmtzTGF5ZXIpO1xuXG5pbWFnZUxheWVyLnNldChcInNoYXBlXCIsIHRlc3RTaGFwZSk7XG5pbWFnZUxheWVyLnNldChcImVkaXRvclwiLCBlZGl0TWFuYWdlcik7XG5cbi8vd3NjRWFybHlMYXllci5zZXRUb3AoXCJ3c2MtMzM0XCIpO1xuXG5mdW5jdGlvbiBzaG93TWFwKGRpdk5hbWU6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpdk5hbWUpO1xuXG4gICAgY29uc3QgaW5mbyA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVkaXRfaW5mb1wiKTtcblxuICAgIGNvbnN0IGxheWVycyA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxheWVyc1wiKTtcblxuICAgIGxldCB4ID0gb3V0bGluZUxheWVyLng7XG4gICAgbGV0IHkgPSBvdXRsaW5lTGF5ZXIueTtcblxuICAgIGxldCBjYW52YXNUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oeCAtIDIwMCwgeSAtIDIwMCwgMC41LCAwLjUsIDApO1xuICAgIGxldCBjYW52YXNWaWV3ID0gbmV3IENhbnZhc1ZpZXcoY2FudmFzVHJhbnNmb3JtLCBjYW52YXMuY2xpZW50V2lkdGgsIGNhbnZhcy5jbGllbnRIZWlnaHQsIGNhbnZhcyk7XG5cbiAgICBjYW52YXNWaWV3LmxheWVycy5wdXNoKHNlbnRpbmVsQ29udGFpbmVyTGF5ZXIpO1xuICAgIGNhbnZhc1ZpZXcubGF5ZXJzLnB1c2goaW1hZ2VMYXllcik7XG4gICAgY2FudmFzVmlldy5sYXllcnMucHVzaChzdGF0aWNHcmlkKTtcbiAgICBjYW52YXNWaWV3LmxheWVycy5wdXNoKGVkaXRDb250YWluZXJMYXllcik7XG5cbiAgICBsZXQgdGlsZUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHNlbnRpbmVsQ29udGFpbmVyTGF5ZXIsIFwidlwiKTtcbiAgICBsZXQgYmFzZUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGJnSW1hZ2UsIFwiQlwiKTtcbiAgICBsZXQgY291bnR5Q29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgY291bnR5SW1hZ2UsIFwiVlwiKTtcbiAgICBsZXQgZmlyZW1hcENvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGZpcmVtYXBMYXllciwgXCJiXCIpO1xuICAgIGxldCB3c2NFYXJseUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHdzY0Vhcmx5TGF5ZXIsIFwiMVwiKTtcbiAgICBsZXQgd3NjTGF0ZUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHdzY01pZExheWVyLCBcIjJcIik7XG4gICAgbGV0IHdzY01pZENvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHdzY0xhdGVMYXllciwgXCIzXCIpO1xuICAgIGxldCB3c2NPdGhlckNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHdzY090aGVyTGF5ZXIsIFwiNFwiKTtcbiAgICBsZXQgbGFuZG1hcmtDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBsYW5kbWFya3NMYXllciwgXCJtXCIpO1xuICAgIGxldCB0bUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHRtSW1hZ2UsIFwiblwiKTtcbiAgICBsZXQgZHVDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBkdUltYWdlLCBcIk1cIik7XG4gICAgbGV0IGdyaWRDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBzdGF0aWNHcmlkLCBcImdcIik7XG5cbiAgICBsZXQgY29udHJvbGxlciA9IG5ldyBWaWV3Q29udHJvbGxlcihjYW52YXNWaWV3LCBjYW52YXMsIGNhbnZhc1ZpZXcpO1xuXG4gICAgbGV0IGltYWdlQ29udHJvbGxlciA9IG5ldyBJbWFnZUNvbnRyb2xsZXIoY2FudmFzVmlldywgZWRpdCk7XG5cbiAgICBpbWFnZUNvbnRyb2xsZXIuc2V0TGF5ZXJPdXRsaW5lKG91dGxpbmVMYXllcik7XG5cbiAgICBpbWFnZUNvbnRyb2xsZXIuc2V0RWRpdEluZm9QYW5lKGluZm8pO1xuXG4gICAgbGV0IGxheWVyQ29udHJvbGxlciA9IG5ldyBMYXllckNvbnRyb2xsZXIoY2FudmFzVmlldywgY29udGFpbmVyTGF5ZXJNYW5hZ2VyKTtcblxuICAgIGRyYXdNYXAoY2FudmFzVmlldyk7XG5cbiAgICBsZXQgbG9nZ2VyID0gbmV3IEVsZW1lbnRMb2dnZXIoaW5mbyk7XG5cbiAgICBsZXQgaW5kZXhDb250cm9sbGVyID0gbmV3IEluZGV4Q29udHJvbGxlcihjYW52YXNWaWV3LCBpbWFnZUNvbnRyb2xsZXIpO1xuICAgIGluZGV4Q29udHJvbGxlci5hZGRJbmRleGVyKGVhcmx5SW5kZXgpO1xuICAgIGluZGV4Q29udHJvbGxlci5hZGRJbmRleGVyKG1pZEluZGV4KTtcbiAgICBpbmRleENvbnRyb2xsZXIuYWRkSW5kZXhlcihsYXRlSW5kZXgpO1xuICAgIGluZGV4Q29udHJvbGxlci5hZGRJbmRleGVyKG90aGVySW5kZXgpO1xuXG4gICAgaW5kZXhDb250cm9sbGVyLnNldE1lbnUobGF5ZXJzKTtcblxuICAgIGxldCBlZGl0Q29udHJvbGxlciA9IG5ldyBFZGl0Q29udHJvbGxlcihjYW52YXNWaWV3LCBlZGl0TWFuYWdlcik7XG4gICAgZWRpdENvbnRyb2xsZXIuc2V0TG9nZ2luZyhsb2dnZXIpO1xuXG59XG5cbmZ1bmN0aW9uIGRyYXdNYXAoY2FudmFzVmlldzogQ2FudmFzVmlldyl7XG4gICAgaWYgKCFjYW52YXNWaWV3LmRyYXcoKSApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJJbiB0aW1lb3V0XCIpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGRyYXdNYXAoY2FudmFzVmlldyl9LCA1MDApO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc2hvdygpe1xuXHRzaG93TWFwKFwiY2FudmFzXCIsIFwiVHlwZVNjcmlwdFwiKTtcbn1cblxuaWYgKFxuICAgIGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIiB8fFxuICAgIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSBcImxvYWRpbmdcIiAmJiAhZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmRvU2Nyb2xsKVxuKSB7XG5cdHNob3coKTtcbn0gZWxzZSB7XG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIHNob3cpO1xufSJdfQ==
