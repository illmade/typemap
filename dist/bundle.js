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

},{"../geom/point2d":1,"./view":10}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const view_1 = require("./view");
const point2d_1 = require("../geom/point2d");
const layer_1 = require("./layer");
class ContainerLayer extends layer_1.CanvasLayer {
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

},{"../geom/point2d":1,"./layer":5,"./view":10}],4:[function(require,module,exports){
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

},{"../geom/point2d":1,"./layer":5}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const view_1 = require("./view");
class CanvasLayer extends view_1.BasicTransform {
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

},{"./view":10}],6:[function(require,module,exports){
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

},{"./containerlayer":3,"./static":8,"./view":10}],7:[function(require,module,exports){
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
class MultiResLayer extends layer_1.CanvasLayer {
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

},{"../geom/point2d":1,"./layer":5,"./view":10}],8:[function(require,module,exports){
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
        return false;
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
	}
]

},{}],14:[function(require,module,exports){
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

},{"./gridindexer":15}],15:[function(require,module,exports){
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

},{"../logging/logger":22}],16:[function(require,module,exports){
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
                imageController.setCanvasLayer(layer);
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

},{}],17:[function(require,module,exports){
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
    constructor(canvasView, canvasLayer) {
        this.canvasView = canvasView;
        this.indexer = new gridindexer_1.GridIndexer(256);
        document.addEventListener("keypress", (e) => this.pressed(canvasView, e));
        this.canvasLayer = canvasLayer;
    }
    setCanvasLayer(canvasLayer) {
        this.canvasLayer = canvasLayer;
        this.indexer.showIndices(canvasLayer);
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
        let info = '"name": ' + this.canvasLayer.name +
            ' "x": ' + this.canvasLayer.x +
            ', "y": ' + this.canvasLayer.y +
            ', "zoomX": ' + this.canvasLayer.zoomX +
            ', "zoomY": ' + this.canvasLayer.zoomY +
            ', "rotation": ' + this.canvasLayer.rotation;
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
            let newDimension = this.canvasLayer.getDimension();
            //console.log("image outline " + newDimension);
            this.layerOutline.updateDimension(newDimension);
        }
        canvasView.draw();
    }
}
exports.ImageController = ImageController;
;

},{"../index/gridindexer":15}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const point2d_1 = require("../geom/point2d");
const viewcontroller_1 = require("./viewcontroller");
const logger_1 = require("../logging/logger");
const indexview_1 = require("./indexview");
class IndexController extends viewcontroller_1.MouseController {
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

},{"../geom/point2d":1,"../logging/logger":22,"./indexview":19,"./viewcontroller":21}],19:[function(require,module,exports){
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

},{"./canvaslayerview":16}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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
const firemaps = require("./imagegroups/firemaps.json");
const landmarks = require("./imagegroups/landmarks.json");
const wsc = require("./imagegroups/wscd.json");
let earlyDates = layermanager_1.dateFilter(wsc, 1680, 1792);
let midDates = layermanager_1.dateFilter(wsc, 1793, 1820);
let lateDates = layermanager_1.dateFilter(wsc, 1821, 1900);
let otherDates = layermanager_1.datelessFilter(wsc);
let layerState = new view_1.BasicTransform(0, 0, 1, 1, 0);
let imageLayer = new containerlayer_1.ContainerLayer(layerState);
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
let edit = wscEarlyLayer.get("wsc-355-2");
let earlyIndex = new containerindex_1.ContainerIndex(wscEarlyLayer, "early");
let midIndex = new containerindex_1.ContainerIndex(wscMidLayer, "mid");
let lateIndex = new containerindex_1.ContainerIndex(wscLateLayer, "late");
let otherIndex = new containerindex_1.ContainerIndex(wscOtherLayer, "other");
let containerLayerManager = new layermanager_1.ContainerLayerManager(wscEarlyLayer, editContainerLayer);
let outlineLayer = containerLayerManager.setSelected("wsc-355-2");
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

},{"./graphics/canvasview":2,"./graphics/containerlayer":3,"./graphics/grid":4,"./graphics/layermanager":6,"./graphics/multireslayer":7,"./graphics/static":8,"./graphics/tilelayer":9,"./graphics/view":10,"./imagegroups/firemaps.json":11,"./imagegroups/landmarks.json":12,"./imagegroups/wscd.json":13,"./index/containerindex":14,"./interface/imagecontroller":17,"./interface/indexcontroller":18,"./interface/layercontroller":20,"./interface/viewcontroller":21,"./logging/logger":22}]},{},[23])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2dyYXBoaWNzL2NhbnZhc3ZpZXcudHMiLCJzcmMvZ3JhcGhpY3MvY29udGFpbmVybGF5ZXIudHMiLCJzcmMvZ3JhcGhpY3MvZ3JpZC50cyIsInNyYy9ncmFwaGljcy9sYXllci50cyIsInNyYy9ncmFwaGljcy9sYXllcm1hbmFnZXIudHMiLCJzcmMvZ3JhcGhpY3MvbXVsdGlyZXNsYXllci50cyIsInNyYy9ncmFwaGljcy9zdGF0aWMudHMiLCJzcmMvZ3JhcGhpY3MvdGlsZWxheWVyLnRzIiwic3JjL2dyYXBoaWNzL3ZpZXcudHMiLCJzcmMvaW1hZ2Vncm91cHMvZmlyZW1hcHMuanNvbiIsInNyYy9pbWFnZWdyb3Vwcy9sYW5kbWFya3MuanNvbiIsInNyYy9pbWFnZWdyb3Vwcy93c2NkLmpzb24iLCJzcmMvaW5kZXgvY29udGFpbmVyaW5kZXgudHMiLCJzcmMvaW5kZXgvZ3JpZGluZGV4ZXIudHMiLCJzcmMvaW50ZXJmYWNlL2NhbnZhc2xheWVydmlldy50cyIsInNyYy9pbnRlcmZhY2UvaW1hZ2Vjb250cm9sbGVyLnRzIiwic3JjL2ludGVyZmFjZS9pbmRleGNvbnRyb2xsZXIudHMiLCJzcmMvaW50ZXJmYWNlL2luZGV4dmlldy50cyIsInNyYy9pbnRlcmZhY2UvbGF5ZXJjb250cm9sbGVyLnRzIiwic3JjL2ludGVyZmFjZS92aWV3Y29udHJvbGxlci50cyIsInNyYy9sb2dnaW5nL2xvZ2dlci50cyIsInNyYy9zaW1wbGVXb3JsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQ0EsTUFBYSxPQUFPO0lBT2hCLFlBQVksQ0FBUyxFQUFFLENBQVM7UUFDNUIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBRUUsUUFBUTtRQUNK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R0FBTixNQUFNLENBQVE7SUFLaEQsQ0FBQztDQUVEO0FBVkQsZ0RBVUM7OztBQ3pERDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3JELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFckUsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBQztZQUMvQixLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLElBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFDO2dCQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQ3RDO1NBQ0Q7SUFDRixDQUFDO0lBRUQsV0FBVyxDQUFDLFdBQXdCO1FBRW5DLElBQUksU0FBUyxHQUFHLFdBQVcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUUzQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3BELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFcEUsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXJFLElBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQTtRQUV2QixLQUFLLElBQUksQ0FBQyxHQUFHLElB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WUFBWSxDQUFDLENBQUM7QUFDakMsQ0FBQztBQUVELElBQ0ksUUFBUSxDQUFDLFVBQVUsS0FBSyxVQUFVO0lBQ2xDLENBQUMsUUFBUSxDQUFDLFVBQVUsS0FBSyxTQUFTLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxFQUMzRTtJQUNELElBQUksRUFBRSxDQUFDO0NBQ1A7S0FBTTtJQUNOLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztDQUNwRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlxuZXhwb3J0IGNsYXNzIFBvaW50MkQge1xuICAgIHN0YXRpYyByZWFkb25seSB6ZXJvID0gbmV3IFBvaW50MkQoMCwgMCk7XG4gICAgc3RhdGljIHJlYWRvbmx5IG9uZSA9IG5ldyBQb2ludDJEKDEsIDEpO1xuXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xuICAgIHJlYWRvbmx5IHk6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG5cdH1cblxuICAgIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcIlBvaW50MkQoXCIgKyB0aGlzLnggKyBcIiwgXCIgKyB0aGlzLnkgKyBcIilcIjtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZShcbiAgcG9pbnQ6IFBvaW50MkQsIFxuICBhbmdsZTogbnVtYmVyLCBcbiAgYWJvdXQ6IFBvaW50MkQgPSBuZXcgUG9pbnQyRCgwLDApXG4pOiBQb2ludDJEIHtcblxuICAgIGxldCBzID0gTWF0aC5zaW4oYW5nbGUpO1xuICAgIGxldCBjID0gTWF0aC5jb3MoYW5nbGUpO1xuXG4gICAgbGV0IHB4ID0gcG9pbnQueCAtIGFib3V0Lng7XG4gICAgbGV0IHB5ID0gcG9pbnQueSAtIGFib3V0Lnk7XG5cbiAgICBsZXQgeG5ldyA9IHB4ICogYyArIHB5ICogcztcbiAgICBsZXQgeW5ldyA9IHB5ICogYyAtIHB4ICogcztcblxuICAgIHJldHVybiBuZXcgUG9pbnQyRCh4bmV3ICsgYWJvdXQueCwgeW5ldyArIGFib3V0LnkpO1xufVxuXG5leHBvcnQgY2xhc3MgRGltZW5zaW9uIHtcblxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyB4OiBudW1iZXIsIHB1YmxpYyB5OiBudW1iZXIsIHB1YmxpYyB3OiBudW1iZXIsIHB1YmxpYyBoOiBudW1iZXIpe31cblxuICAgIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcIkRpbWVuc2lvbihcIiArIHRoaXMueCArIFwiLCBcIiArIHRoaXMueSArIFwiLCBcIiArIHRoaXMudyArIFwiLCBcIiArIHRoaXMuaCArIFwiKVwiO1xuICAgIH1cblxufSIsImltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBDYW52YXNMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBcblx0aW52ZXJ0VHJhbnNmb3JtLCBcblx0Vmlld1RyYW5zZm9ybSwgXG5cdEJhc2ljVmlld1RyYW5zZm9ybSwgXG5cdFRyYW5zZm9ybSwgXG5cdEJhc2ljVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIERpc3BsYXlFbGVtZW50IGV4dGVuZHMgVHJhbnNmb3JtIHtcblx0aXNWaXNpYmxlKCk6IGJvb2xlYW47XG5cdHNldFZpc2libGUodmlzaWJsZTogYm9vbGVhbik6IHZvaWQ7XG5cdGdldE9wYWNpdHkoKTogbnVtYmVyO1xuXHRzZXRPcGFjaXR5KG9wYWNpdHk6IG51bWJlcik6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBDYW52YXNWaWV3IGV4dGVuZHMgQmFzaWNWaWV3VHJhbnNmb3JtIHtcblxuXHRsYXllcnM6IEFycmF5PENhbnZhc0xheWVyPiA9IFtdO1xuXHRjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHR3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgXG5cdFx0cmVhZG9ubHkgY2FudmFzRWxlbWVudDogSFRNTENhbnZhc0VsZW1lbnQpe1xuXG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0ueCwgbG9jYWxUcmFuc2Zvcm0ueSwgd2lkdGgsIGhlaWdodCwgXG5cdFx0XHRsb2NhbFRyYW5zZm9ybS56b29tWCwgbG9jYWxUcmFuc2Zvcm0uem9vbVksIFxuXHRcdFx0bG9jYWxUcmFuc2Zvcm0ucm90YXRpb24pO1xuXG5cdFx0dGhpcy5pbml0Q2FudmFzKCk7XG5cblx0XHR0aGlzLmN0eCA9IGNhbnZhc0VsZW1lbnQuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHR9XG5cblx0em9vbUFib3V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB6b29tQnk6IG51bWJlcil7XG5cbiAgICAgICAgdGhpcy56b29tWCA9IHRoaXMuem9vbVggKiB6b29tQnk7XG4gICAgICAgIHRoaXMuem9vbVkgPSB0aGlzLnpvb21ZICogem9vbUJ5O1xuXG4gICAgICAgIGxldCByZWxhdGl2ZVggPSB4ICogem9vbUJ5IC0geDtcbiAgICAgICAgbGV0IHJlbGF0aXZlWSA9IHkgKiB6b29tQnkgLSB5O1xuXG4gICAgICAgIGxldCB3b3JsZFggPSByZWxhdGl2ZVggLyB0aGlzLnpvb21YO1xuICAgICAgICBsZXQgd29ybGRZID0gcmVsYXRpdmVZIC8gdGhpcy56b29tWTtcblxuICAgICAgICB0aGlzLnggPSB0aGlzLnggKyB3b3JsZFg7XG4gICAgICAgIHRoaXMueSA9IHRoaXMueSArIHdvcmxkWTtcblxuXHR9XG5cblx0Z2V0QmFzZVBvaW50KGNvb3JkOiBQb2ludDJEKTogUG9pbnQyRCB7XG5cdFx0cmV0dXJuIG5ldyBQb2ludDJEKFxuXHRcdFx0dGhpcy54ICsgY29vcmQueCAvIHRoaXMuem9vbVgsIFxuXHRcdFx0dGhpcy55ICsgY29vcmQueSAvIHRoaXMuem9vbVkpO1xuXHR9XG5cblx0ZHJhdygpOiBib29sZWFuIHtcblx0XHRsZXQgdHJhbnNmb3JtID0gaW52ZXJ0VHJhbnNmb3JtKHRoaXMpO1xuXG5cdFx0dGhpcy5jdHguZmlsbFN0eWxlID0gXCJncmV5XCI7XG5cdFx0dGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXG5cdFx0dmFyIGRyYXdpbmdDb21wbGV0ZSA9IHRydWU7XG5cblx0XHRmb3IgKGxldCBsYXllciBvZiB0aGlzLmxheWVycyl7XG5cdFx0XHRpZiAobGF5ZXIuaXNWaXNpYmxlKCkpe1xuXHRcdFx0XHRkcmF3aW5nQ29tcGxldGUgPSBkcmF3aW5nQ29tcGxldGUgJiYgbGF5ZXIuZHJhdyh0aGlzLmN0eCwgQmFzaWNUcmFuc2Zvcm0udW5pdFRyYW5zZm9ybSwgdGhpcyk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9XG5cblx0XHR0aGlzLmRyYXdDZW50cmUodGhpcy5jdHgpO1xuXHRcdHRoaXMuc2hvd0luZm8odGhpcy5jdHgpO1xuXG5cdFx0cmV0dXJuIGRyYXdpbmdDb21wbGV0ZTtcblx0fVxuXG5cdGRyYXdDZW50cmUoY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKXtcbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IDAuMztcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKHRoaXMud2lkdGgvMiwgNi8xNip0aGlzLmhlaWdodCk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKHRoaXMud2lkdGgvMiwgMTAvMTYqdGhpcy5oZWlnaHQpO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyg3LzE2KnRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LzIpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyg5LzE2KnRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LzIpO1xuICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gXCJibGFja1wiO1xuICAgICAgICBjb250ZXh0Lmdsb2JhbEFscGhhID0gMTtcbiAgICB9XG5cbiAgICBzaG93SW5mbyhjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpe1xuICAgIFx0Y29udGV4dC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG4gICAgXHRjb250ZXh0LmZpbGxUZXh0KFwiem9vbTogXCIgKyB0aGlzLnpvb21YLCAxMCwgMTApO1xuICAgIFx0Y29udGV4dC5maWxsKCk7XG4gICAgfVxuXG5cdHByaXZhdGUgaW5pdENhbnZhcygpe1xuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLmNhbnZhc0VsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLmNhbnZhc0VsZW1lbnQuY2xpZW50SGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQuaGVpZ2h0ID0gaGVpZ2h0O1xuXHR9XG5cbn0iLCJpbXBvcnQgeyBUcmFuc2Zvcm0sIEJhc2ljVHJhbnNmb3JtLCBcblx0Vmlld1RyYW5zZm9ybSwgXG5cdGNvbWJpbmVUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBEaW1lbnNpb24gfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBDYW52YXNMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5cbmV4cG9ydCBjbGFzcyBDb250YWluZXJMYXllciBleHRlbmRzIENhbnZhc0xheWVyIHtcblxuXHRsYXllck1hcDogTWFwPHN0cmluZywgQ2FudmFzTGF5ZXI+O1xuXHRkaXNwbGF5TGF5ZXJzOiBBcnJheTxDYW52YXNMYXllcj47XG5cblx0Y29uc3RydWN0b3IobG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgb3BhY2l0eTogbnVtYmVyID0gMSwgdmlzaWJsZTogYm9vbGVhbiA9IHRydWUpIHtcblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybSwgb3BhY2l0eSwgdmlzaWJsZSk7XG5cdFx0dGhpcy5sYXllck1hcCA9IG5ldyBNYXA8c3RyaW5nLCBDYW52YXNMYXllcj4oKTtcblx0XHR0aGlzLmRpc3BsYXlMYXllcnMgPSBbXTtcblx0fVxuXG5cdHNldChuYW1lOiBzdHJpbmcsIGxheWVyOiBDYW52YXNMYXllcik6IHZvaWQge1xuXHRcdHRoaXMubGF5ZXJNYXAuc2V0KG5hbWUsIGxheWVyKTtcblx0XHR0aGlzLmRpc3BsYXlMYXllcnMucHVzaChsYXllcik7XG5cdH1cblxuXHRnZXQobmFtZTogc3RyaW5nKTogQ2FudmFzTGF5ZXIge1xuXHRcdHJldHVybiB0aGlzLmxheWVyTWFwLmdldChuYW1lKTtcblx0fVxuXG5cdGxheWVycygpOiBBcnJheTxDYW52YXNMYXllcj4ge1xuXHRcdHJldHVybiB0aGlzLmRpc3BsYXlMYXllcnM7XG5cdH1cblxuXHRzZXRUb3AobmFtZTogc3RyaW5nKSB7XG5cdFx0bGV0IHRvcExheWVyID0gdGhpcy5nZXQobmFtZSk7XG5cdFx0aWYgKHRvcExheWVyICE9IHVuZGVmaW5lZCl7XG5cdFx0XHR0aGlzLmRpc3BsYXlMYXllcnMgPSB0aGlzLmRpc3BsYXlMYXllcnMuZmlsdGVyKGZ1bmN0aW9uKGVsZW1lbnQ6IENhbnZhc0xheWVyKXsgXG5cdFx0XHRcdGlmIChlbGVtZW50ID09IHRvcExheWVyKXtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH19KTtcblx0XHRcdHRoaXMuZGlzcGxheUxheWVycy5wdXNoKHRvcExheWVyKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5sb2coXCJ0b3AgbGF5ZXIgdW5kZWZpbmVkIFwiICsgbmFtZSk7XG5cdFx0fVxuXHR9XG5cblx0ZHJhdyhcblx0ICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgXG5cdCAgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHQgIHZpZXc6IFZpZXdUcmFuc2Zvcm0pOiBib29sZWFuIHtcblxuXHRcdGxldCBsYXllclRyYW5zZm9ybSA9IGNvbWJpbmVUcmFuc2Zvcm0odGhpcy5sb2NhbFRyYW5zZm9ybSwgcGFyZW50VHJhbnNmb3JtKTtcblxuXHRcdHZhciBkcmF3aW5nQ29tcGxldGUgPSB0cnVlO1xuXG5cdFx0Zm9yIChsZXQgbGF5ZXIgb2YgdGhpcy5kaXNwbGF5TGF5ZXJzKSB7XG5cdFx0XHRpZiAobGF5ZXIuaXNWaXNpYmxlKCkpe1xuXHRcdFx0XHRkcmF3aW5nQ29tcGxldGUgPSBkcmF3aW5nQ29tcGxldGUgJiYgbGF5ZXIuZHJhdyhjdHgsIGxheWVyVHJhbnNmb3JtLCB2aWV3KTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdH1cblxuXHRcdHJldHVybiBkcmF3aW5nQ29tcGxldGU7XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHR2YXIgeE1pbiA9IHRoaXMueDtcblx0XHR2YXIgeU1pbiA9IHRoaXMueTtcblx0XHR2YXIgeE1heCA9IHRoaXMueDtcblx0XHR2YXIgeU1heCA9IHRoaXMueTtcblxuXHRcdGZvciAobGV0IGxheWVyIG9mIHRoaXMuZGlzcGxheUxheWVycykge1xuXHRcdFx0bGV0IGxheWVyRGltZW5zaW9uID0gbGF5ZXIuZ2V0RGltZW5zaW9uKCk7XG5cdFx0XHR4TWluID0gTWF0aC5taW4oeE1pbiwgdGhpcy54ICsgbGF5ZXJEaW1lbnNpb24ueCk7XG5cdFx0XHR5TWluID0gTWF0aC5taW4oeU1pbiwgdGhpcy55ICsgbGF5ZXJEaW1lbnNpb24ueSk7XG5cdFx0XHR4TWF4ID0gTWF0aC5tYXgoeE1heCwgdGhpcy54ICsgbGF5ZXJEaW1lbnNpb24ueCArIHRoaXMuem9vbVggKiBsYXllckRpbWVuc2lvbi53KTtcblx0XHRcdHlNYXggPSBNYXRoLm1heCh5TWF4LCB0aGlzLnkgKyBsYXllckRpbWVuc2lvbi55ICsgdGhpcy56b29tWSAqIGxheWVyRGltZW5zaW9uLmgpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgRGltZW5zaW9uKHhNaW4sIHlNaW4sIHhNYXggLSB4TWluLCB5TWF4IC0geU1pbik7XG5cdH1cblxufSIsImltcG9ydCB7IERyYXdMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBUcmFuc2Zvcm0sIFZpZXdUcmFuc2Zvcm0sIGNvbWJpbmVUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBEaW1lbnNpb24gfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbi8qKlxuKiBXZSBkb24ndCB3YW50IHRvIGRyYXcgYSBncmlkIGludG8gYSB0cmFuc2Zvcm1lZCBjYW52YXMgYXMgdGhpcyBnaXZlcyB1cyBncmlkIGxpbmVzIHRoYXQgYXJlIHRvb1xudGhpY2sgb3IgdG9vIHRoaW5cbiovXG5leHBvcnQgY2xhc3MgU3RhdGljR3JpZCBleHRlbmRzIERyYXdMYXllciB7XG5cblx0em9vbVdpZHRoOiBudW1iZXI7XG5cdHpvb21IZWlnaHQ6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3Rvcihsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCB6b29tTGV2ZWw6IG51bWJlciwgdmlzaWJsZTogYm9vbGVhbixcblx0XHRyZWFkb25seSBncmlkV2lkdGg6IG51bWJlciA9IDI1NiwgcmVhZG9ubHkgZ3JpZEhlaWdodDogbnVtYmVyID0gMjU2KXtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCAxLCB2aXNpYmxlKTtcblxuXHRcdGxldCB6b29tID0gTWF0aC5wb3coMiwgem9vbUxldmVsKTtcblx0XHR0aGlzLnpvb21XaWR0aCA9IGdyaWRXaWR0aCAvIHpvb207XG5cdFx0dGhpcy56b29tSGVpZ2h0ID0gZ3JpZEhlaWdodCAvIHpvb207XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB0cmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0bGV0IG9mZnNldFggPSB2aWV3LnggKiB2aWV3Lnpvb21YO1xuXHRcdGxldCBvZmZzZXRZID0gdmlldy55ICogdmlldy56b29tWTtcblxuXHRcdGxldCB2aWV3V2lkdGggPSB2aWV3LndpZHRoIC8gdmlldy56b29tWDtcblx0XHRsZXQgdmlld0hlaWdodCA9IHZpZXcuaGVpZ2h0IC8gdmlldy56b29tWTtcblxuXHRcdGxldCBncmlkQWNyb3NzID0gdmlld1dpZHRoIC8gdGhpcy56b29tV2lkdGg7XG5cdFx0bGV0IGdyaWRIaWdoID0gdmlld0hlaWdodCAvIHRoaXMuem9vbUhlaWdodDtcblxuXHRcdGxldCB4TWluID0gTWF0aC5mbG9vcih2aWV3LngvdGhpcy56b29tV2lkdGgpO1xuXHRcdGxldCB4TGVmdCA9IHhNaW4gKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IHhNYXggPSBNYXRoLmNlaWwoKHZpZXcueCArIHZpZXdXaWR0aCkgLyB0aGlzLnpvb21XaWR0aCk7XG5cdFx0bGV0IHhSaWdodCA9IHhNYXggKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cblx0XHRsZXQgeU1pbiA9IE1hdGguZmxvb3Iodmlldy55L3RoaXMuem9vbUhlaWdodCk7XG5cdFx0bGV0IHlUb3AgPSB5TWluICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWDtcblx0XHRsZXQgeU1heCA9IE1hdGguY2VpbCgodmlldy55ICsgdmlld0hlaWdodCkgLyB0aGlzLnpvb21IZWlnaHQpO1xuXHRcdGxldCB5Qm90dG9tID0geU1heCAqIHRoaXMuem9vbUhlaWdodCAqIHZpZXcuem9vbVggO1xuXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcblxuXHRcdGZvciAodmFyIHggPSB4TWluOyB4PD14TWF4OyB4Kyspe1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImF0IFwiICsgbWluWCk7XG5cdFx0XHRsZXQgeE1vdmUgPSB4ICogdGhpcy56b29tV2lkdGggKiB2aWV3Lnpvb21YO1xuXHRcdFx0Y3R4Lm1vdmVUbyh4TW92ZSAtIG9mZnNldFgsIHlUb3AgLSBvZmZzZXRZKTtcblx0XHRcdGN0eC5saW5lVG8oeE1vdmUgLSBvZmZzZXRYLCB5Qm90dG9tIC0gb2Zmc2V0WSk7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgeSA9IHlNaW47IHk8PXlNYXg7IHkrKyl7XG5cblx0XHRcdGxldCB5TW92ZSA9IHkgKiB0aGlzLnpvb21IZWlnaHQgKiB2aWV3Lnpvb21ZO1xuXHRcdFx0Y3R4Lm1vdmVUbyh4TGVmdCAtIG9mZnNldFgsIHlNb3ZlIC0gb2Zmc2V0WSk7XG5cdFx0XHRjdHgubGluZVRvKHhSaWdodCAtIG9mZnNldFgsIHlNb3ZlIC0gb2Zmc2V0WSk7XG5cblx0XHRcdGZvciAodmFyIHggPSB4TWluOyB4PD14TWF4OyB4Kyspe1xuXHRcdFx0XHRsZXQgeE1vdmUgPSAoeC0uNSkgKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cdFx0XHRcdHlNb3ZlID0gKHktLjUpICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWTtcblx0XHRcdFx0bGV0IHRleHQgPSBcIlwiICsgKHgtMSkgKyBcIiwgXCIgKyAoeS0xKTtcblx0XHRcdFx0Y3R4LnN0cm9rZVRleHQodGV4dCwgeE1vdmUgLSBvZmZzZXRYLCB5TW92ZSAtIG9mZnNldFkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHRyZXR1cm4gbmV3IERpbWVuc2lvbigwLCAwLCAwLCAwKTtcblx0fVxufSIsImltcG9ydCB7IFRyYW5zZm9ybSwgQmFzaWNUcmFuc2Zvcm0sIFxuXHRWaWV3VHJhbnNmb3JtLCBcblx0Y29tYmluZVRyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IERpc3BsYXlFbGVtZW50IH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgRGltZW5zaW9uIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2FudmFzTGF5ZXIgZXh0ZW5kcyBCYXNpY1RyYW5zZm9ybSBpbXBsZW1lbnRzIFxuICBEaXNwbGF5RWxlbWVudCB7XG5cblx0Y29uc3RydWN0b3IoXG5cdCAgcHVibGljIGxvY2FsVHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHQgIHB1YmxpYyBvcGFjaXR5ID0gMSwgXG5cdCAgcHVibGljIHZpc2libGUgPSB0cnVlLFxuXHQgIHB1YmxpYyBuYW1lID0gXCJcIixcblx0ICBwdWJsaWMgZGVzY3JpcHRpb24gPSBcIlwiLFxuXHQgICl7XG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0ueCwgbG9jYWxUcmFuc2Zvcm0ueSwgbG9jYWxUcmFuc2Zvcm0uem9vbVgsIGxvY2FsVHJhbnNmb3JtLnpvb21ZLCBcblx0XHRcdGxvY2FsVHJhbnNmb3JtLnJvdGF0aW9uKTtcblx0fVxuXG5cdGFic3RyYWN0IGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHBhcmVudFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHR2aWV3OiBWaWV3VHJhbnNmb3JtKTogYm9vbGVhbjtcblxuXHRhYnN0cmFjdCBnZXREaW1lbnNpb24oKTogRGltZW5zaW9uO1xuXG5cdGlzVmlzaWJsZSgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy52aXNpYmxlO1xuXHR9XG5cblx0c2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdm9pZCB7XG5cdFx0Y29uc29sZS5sb2coXCJzZXR0aW5nIHZpc2liaWxpdHk6IFwiICsgdmlzaWJsZSk7XG5cdFx0dGhpcy52aXNpYmxlID0gdmlzaWJsZTtcblx0fVxuXG5cdGdldE9wYWNpdHkoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5vcGFjaXR5O1xuXHR9XG5cblx0c2V0T3BhY2l0eShvcGFjaXR5OiBudW1iZXIpOiB2b2lkIHtcblx0XHR0aGlzLm9wYWNpdHkgPSBvcGFjaXR5O1xuXHR9XG5cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIERyYXdMYXllciBleHRlbmRzIENhbnZhc0xheWVyIHtcblxuICAgIHByb3RlY3RlZCBwcmVwYXJlQ3R4KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB0cmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVHJhbnNmb3JtKTogdm9pZCB7XG5cdFx0Y3R4LnRyYW5zbGF0ZSgodHJhbnNmb3JtLnggLSB2aWV3LngpICogdmlldy56b29tWCwgKHRyYW5zZm9ybS55IC0gdmlldy55KSAqIHZpZXcuem9vbVkpO1xuXHRcdGN0eC5zY2FsZSh0cmFuc2Zvcm0uem9vbVggKiB2aWV3Lnpvb21YLCB0cmFuc2Zvcm0uem9vbVkgKiB2aWV3Lnpvb21ZKTtcblx0XHRjdHgucm90YXRlKHRyYW5zZm9ybS5yb3RhdGlvbik7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNsZWFuQ3R4KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB0cmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVHJhbnNmb3JtKTogdm9pZCB7XHRcblx0XHRjdHgucm90YXRlKC10cmFuc2Zvcm0ucm90YXRpb24pO1xuXHRcdGN0eC5zY2FsZSgxL3RyYW5zZm9ybS56b29tWC92aWV3Lnpvb21YLCAxL3RyYW5zZm9ybS56b29tWS92aWV3Lnpvb21ZKTtcblx0XHRjdHgudHJhbnNsYXRlKC0odHJhbnNmb3JtLnggLXZpZXcueCkgKnZpZXcuem9vbVgsIC0odHJhbnNmb3JtLnkgLSB2aWV3LnkpICogdmlldy56b29tWSk7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgQ2FudmFzTGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgQ29udGFpbmVyTGF5ZXIgfSBmcm9tIFwiLi9jb250YWluZXJsYXllclwiO1xuaW1wb3J0IHsgU3RhdGljSW1hZ2UsIFJlY3RMYXllciB9IGZyb20gXCIuL3N0YXRpY1wiO1xuaW1wb3J0IHsgVHJhbnNmb3JtICwgQmFzaWNUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBDYW52YXNWaWV3LCBEaXNwbGF5RWxlbWVudH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEltYWdlU3RydWN0IGV4dGVuZHMgVHJhbnNmb3JtIHtcblx0b3BhY2l0eTogbnVtYmVyO1xuXHR2aXNpYmxlOiBib29sZWFuO1xuXHRzcmM6IHN0cmluZztcblx0bmFtZTogc3RyaW5nO1xuXHRkZXNjcmlwdGlvbjogc3RyaW5nO1xuXHRkYXRlOiBudW1iZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkYXRlRmlsdGVyKFxuICBpbWFnZVN0cnVjdDogQXJyYXk8SW1hZ2VTdHJ1Y3Q+LCBcbiAgZnJvbTogbnVtYmVyLCBcbiAgdG86IG51bWJlcik6IEFycmF5PEltYWdlU3RydWN0Pntcblx0cmV0dXJuIGltYWdlU3RydWN0LmZpbHRlcihmdW5jdGlvbihpbWFnZVN0cnVjdCl7IFxuXHRcdGlmIChpbWFnZVN0cnVjdC5kYXRlID09IHVuZGVmaW5lZClcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRpZiAoaW1hZ2VTdHJ1Y3QuZGF0ZSA+PSBmcm9tICYmIGltYWdlU3RydWN0LmRhdGUgPD0gdG8pIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2V9XG5cdFx0fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkYXRlbGVzc0ZpbHRlcihcbiAgaW1hZ2VTdHJ1Y3Q6IEFycmF5PEltYWdlU3RydWN0Pik6IEFycmF5PEltYWdlU3RydWN0Pntcblx0cmV0dXJuIGltYWdlU3RydWN0LmZpbHRlcihmdW5jdGlvbihpbWFnZVN0cnVjdCl7IFxuXHRcdGlmIChpbWFnZVN0cnVjdC5kYXRlID09IHVuZGVmaW5lZClcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlfVxuXHRcdH0pO1xufVxuXG5leHBvcnQgY2xhc3MgTGF5ZXJNYW5hZ2VyIHtcblxuXHRwcml2YXRlIGxheWVyTWFwOiBNYXA8c3RyaW5nLCBDb250YWluZXJMYXllcj47O1xuXG5cdHJlYWRvbmx5IGRlZmF1bHRMYXllcjogc3RyaW5nID0gXCJkZWZhdWx0XCI7XG5cblx0Y29uc3RydWN0b3IoKXtcblx0XHR0aGlzLmxheWVyTWFwID0gbmV3IE1hcDxzdHJpbmcsIENvbnRhaW5lckxheWVyPigpO1xuXG5cdFx0bGV0IGltYWdlTGF5ZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXIoQmFzaWNUcmFuc2Zvcm0udW5pdFRyYW5zZm9ybSk7XHRcblxuXHRcdHRoaXMubGF5ZXJNYXAuc2V0KHRoaXMuZGVmYXVsdExheWVyLCBpbWFnZUxheWVyKTtcblx0fVxuXG5cdGFkZEltYWdlKGltYWdlOiBTdGF0aWNJbWFnZSwgbmFtZTogc3RyaW5nKXtcblx0XHR0aGlzLmxheWVyTWFwLmdldCh0aGlzLmRlZmF1bHRMYXllcikuc2V0KG5hbWUsIGltYWdlKTtcblx0fVxuXG5cdGFkZExheWVyKFxuXHQgIGltYWdlRGV0YWlsczogQXJyYXk8SW1hZ2VTdHJ1Y3Q+LCBcblx0ICBsYXllck5hbWU6IHN0cmluZywgXG5cdCAgbGF5ZXJUcmFuc2Zvcm06IFRyYW5zZm9ybSA9IEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm1cblx0KTogQ29udGFpbmVyTGF5ZXIge1xuXG5cdFx0bGV0IGltYWdlTGF5ZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXIobGF5ZXJUcmFuc2Zvcm0sIDEsIHRydWUpO1x0XG5cblx0XHRmb3IgKHZhciBpbWFnZSBvZiBpbWFnZURldGFpbHMpe1xuXHRcdFx0bGV0IHN0YXRpY0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKGltYWdlLCBpbWFnZS5zcmMsIFxuXHRcdFx0XHRpbWFnZS5vcGFjaXR5LCBpbWFnZS52aXNpYmxlLCBpbWFnZS5kZXNjcmlwdGlvbik7XG5cdFx0XHRpbWFnZUxheWVyLnNldChpbWFnZS5uYW1lLCBzdGF0aWNJbWFnZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5sYXllck1hcC5zZXQobGF5ZXJOYW1lLCBpbWFnZUxheWVyKTtcblxuXHRcdHJldHVybiBpbWFnZUxheWVyO1xuXHR9XG5cblx0Z2V0TGF5ZXJzKCk6IE1hcDxzdHJpbmcsIENvbnRhaW5lckxheWVyPiB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXA7XG5cdH1cblxuXHRnZXRMYXllcihuYW1lOiBzdHJpbmcpOiBDb250YWluZXJMYXllciB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXAuZ2V0KG5hbWUpO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNsYXNzIENvbnRhaW5lckxheWVyTWFuYWdlciB7XG5cblx0cHJpdmF0ZSBjb250YWluZXJMYXllcjogQ29udGFpbmVyTGF5ZXI7XG5cdHByaXZhdGUgc2VsZWN0ZWQ6IHN0cmluZztcblx0XG5cdGNvbnN0cnVjdG9yKGNvbnRhaW5lckxheWVyOiBDb250YWluZXJMYXllciwgXG5cdCAgcmVhZG9ubHkgZGlzcGxheUxheWVyOiBDb250YWluZXJMYXllciA9IGNvbnRhaW5lckxheWVyKSB7XG5cdFx0dGhpcy5jb250YWluZXJMYXllciA9IGNvbnRhaW5lckxheWVyO1xuXHR9XG5cblx0c2V0TGF5ZXJDb250YWluZXIoY29udGFpbmVyTGF5ZXI6IENvbnRhaW5lckxheWVyKSB7XG5cdFx0dGhpcy5jb250YWluZXJMYXllciA9IGNvbnRhaW5lckxheWVyO1xuXHR9XG5cblx0c2V0U2VsZWN0ZWQobmFtZTogc3RyaW5nKTogUmVjdExheWVyIHtcblx0XHR0aGlzLnNlbGVjdGVkID0gbmFtZTtcblxuXHRcdGxldCBsYXllcjogQ2FudmFzTGF5ZXIgPSB0aGlzLmNvbnRhaW5lckxheWVyLmdldCh0aGlzLnNlbGVjdGVkKTtcblxuXHRcdGxldCBsYXllclJlY3QgPSBuZXcgUmVjdExheWVyKGxheWVyLmdldERpbWVuc2lvbigpLCAxLCB0cnVlKTtcblxuXHRcdGxldCBsYXllck5hbWUgPSBcIm91dGxpbmVcIjtcblxuXHRcdHRoaXMuZGlzcGxheUxheWVyLnNldChsYXllck5hbWUsIGxheWVyUmVjdCk7XG5cblx0XHRyZXR1cm4gbGF5ZXJSZWN0O1xuXHR9XG5cblx0dG9nZ2xlVmlzaWJpbGl0eShzZWxlY3RlZDogYm9vbGVhbiA9IHRydWUpe1xuXHRcdGxldCB0b2dnbGVHcm91cDogQXJyYXk8RGlzcGxheUVsZW1lbnQ+ID0gW107XG5cdFx0aWYgKHNlbGVjdGVkKXtcblx0XHRcdGlmICh0aGlzLnNlbGVjdGVkICE9IFwiXCIpe1xuXHRcdFx0XHR0b2dnbGVHcm91cC5wdXNoKHRoaXMuY29udGFpbmVyTGF5ZXIuZ2V0KHRoaXMuc2VsZWN0ZWQpKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Zm9yIChsZXQgcGFpciBvZiB0aGlzLmNvbnRhaW5lckxheWVyLmxheWVyTWFwKXtcblxuXHRcdFx0XHRpZiAocGFpclswXSAhPSB0aGlzLnNlbGVjdGVkKXtcblx0XHRcdFx0XHR0b2dnbGVHcm91cC5wdXNoKHBhaXJbMV0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwibGF5ZXJOYW1lOiBcIiArIHRoaXMuc2VsZWN0ZWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Zm9yIChsZXQgZWxlbWVudCBvZiB0b2dnbGVHcm91cCl7XG5cdFx0XHRlbGVtZW50LnNldFZpc2libGUoIWVsZW1lbnQuaXNWaXNpYmxlKCkpXG5cdFx0fVxuXHR9XG5cbn0iLCJpbXBvcnQgeyBEaXNwbGF5RWxlbWVudCB9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IFRyYW5zZm9ybSwgXG5cdEJhc2ljVHJhbnNmb3JtLCBcblx0Vmlld1RyYW5zZm9ybSwgXG5cdGNvbWJpbmVUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBEaW1lbnNpb24gfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBDYW52YXNMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5cbmV4cG9ydCBjbGFzcyBEaXNwbGF5UmFuZ2Uge1xuXG4gICAgc3RhdGljIHJlYWRvbmx5IEFsbFJhbmdlID0gbmV3IERpc3BsYXlSYW5nZSgtMSwgLTEpO1xuXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBtaW5ab29tOiBudW1iZXIsIHB1YmxpYyBtYXhab29tOiBudW1iZXIpe31cblxuXHR3aXRoaW5SYW5nZSh6b29tOiBudW1iZXIpOiBCb29sZWFuIHtcblx0XHRyZXR1cm4gKCh6b29tID49IHRoaXMubWluWm9vbSB8fCB0aGlzLm1pblpvb20gPT0gLTEpICYmIFxuXHRcdFx0KHpvb20gPD0gdGhpcy5tYXhab29tIHx8IHRoaXMubWF4Wm9vbSA9PSAtMSkpO1xuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBNdWx0aVJlc0xheWVyIGV4dGVuZHMgQ2FudmFzTGF5ZXIge1xuXG5cdGxheWVyTWFwID0gbmV3IE1hcDxEaXNwbGF5UmFuZ2UsIENhbnZhc0xheWVyPigpO1xuXG5cdHNldChkaXNwbGF5UmFuZ2U6IERpc3BsYXlSYW5nZSwgbGF5ZXI6IENhbnZhc0xheWVyKXtcblx0XHR0aGlzLmxheWVyTWFwLnNldChkaXNwbGF5UmFuZ2UsIGxheWVyKTtcblx0fVxuXHRcblx0ZHJhdyhcblx0ICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgXG5cdCAgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHQgIHZpZXc6IFZpZXdUcmFuc2Zvcm0pOiBib29sZWFuIHtcblxuXHRcdGxldCBsYXllclRyYW5zZm9ybSA9IGNvbWJpbmVUcmFuc2Zvcm0odGhpcy5sb2NhbFRyYW5zZm9ybSwgcGFyZW50VHJhbnNmb3JtKTtcblxuXHRcdHZhciBkcmF3aW5nQ29tcGxldGUgPSB0cnVlO1xuXG5cdFx0Zm9yIChsZXQgW3JhbmdlLCBsYXllcl0gb2YgdGhpcy5sYXllck1hcCl7XG5cdFx0XHRpZiAocmFuZ2Uud2l0aGluUmFuZ2Uodmlldy56b29tWCkgJiYgbGF5ZXIuaXNWaXNpYmxlKCkpe1xuXHRcdFx0XHRkcmF3aW5nQ29tcGxldGUgPSBkcmF3aW5nQ29tcGxldGUgJiYgbGF5ZXIuZHJhdyhjdHgsIGxheWVyVHJhbnNmb3JtLCB2aWV3KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZHJhd2luZ0NvbXBsZXRlO1xuXHR9XG5cblx0Z2V0RGltZW5zaW9uKCk6IERpbWVuc2lvbiB7XG5cdFx0dmFyIHhNaW4gPSB0aGlzLng7XG5cdFx0dmFyIHlNaW4gPSB0aGlzLnk7XG5cdFx0dmFyIHhNYXggPSB0aGlzLng7XG5cdFx0dmFyIHlNYXggPSB0aGlzLnk7XG5cblx0XHRmb3IgKGxldCBbcmFuZ2UsIGxheWVyXSBvZiB0aGlzLmxheWVyTWFwKXtcblx0XHRcdGxldCBsYXllckRpbWVuc2lvbiA9IGxheWVyLmdldERpbWVuc2lvbigpO1xuXHRcdFx0eE1pbiA9IE1hdGgubWluKHhNaW4sIHRoaXMueCArIGxheWVyRGltZW5zaW9uLngpO1xuXHRcdFx0eU1pbiA9IE1hdGgubWluKHlNaW4sIHRoaXMueSArIGxheWVyRGltZW5zaW9uLnkpO1xuXHRcdFx0eE1heCA9IE1hdGgubWF4KHhNYXgsIHRoaXMueCArIGxheWVyRGltZW5zaW9uLnggKyB0aGlzLnpvb21YICogbGF5ZXJEaW1lbnNpb24udyk7XG5cdFx0XHR5TWF4ID0gTWF0aC5tYXgoeU1heCwgdGhpcy55ICsgbGF5ZXJEaW1lbnNpb24ueSArIHRoaXMuem9vbVkgKiBsYXllckRpbWVuc2lvbi5oKTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIG5ldyBEaW1lbnNpb24oeE1pbiwgeU1pbiwgeE1heCAtIHhNaW4sIHlNYXggLSB5TWluKTtcblx0fVxufSIsImltcG9ydCB7IFRyYW5zZm9ybSwgQmFzaWNUcmFuc2Zvcm0sIGNvbWJpbmVUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBEcmF3TGF5ZXIsIENhbnZhc0xheWVyIH0gZnJvbSBcIi4vbGF5ZXJcIjtcbmltcG9ydCB7IERpc3BsYXlFbGVtZW50IH0gZnJvbSBcIi4vY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgRGltZW5zaW9uLCByb3RhdGUsIFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGh1bWIgZXh0ZW5kcyBEaXNwbGF5RWxlbWVudCB7XG5cblx0ZHJhd1RodW1iKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB3OiBudW1iZXIsIGg6IG51bWJlcik6IGJvb2xlYW47XG5cbn1cblxuZXhwb3J0IGNsYXNzIFN0YXRpY0ltYWdlIGV4dGVuZHMgRHJhd0xheWVyIGltcGxlbWVudHMgVGh1bWIge1xuXG5cdHByaXZhdGUgaW1nOiBIVE1MSW1hZ2VFbGVtZW50O1xuXG5cdGNvbnN0cnVjdG9yKFxuXHQgIGxvY2FsVHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHQgIGltYWdlU3JjOiBzdHJpbmcsIFxuXHQgIG9wYWNpdHk6IG51bWJlcixcblx0ICB2aXNpYmxlOiBib29sZWFuLFxuXHQgIGRlc2NyaXB0aW9uOiBzdHJpbmcsXG5cdCkge1xuXG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0sIG9wYWNpdHksIHZpc2libGUsIGltYWdlU3JjLCBkZXNjcmlwdGlvbik7XG5cdFx0XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0fVxuXG5cdHByaXZhdGUgZHJhd0ltYWdlKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVHJhbnNmb3JtKXtcblxuXHRcdGlmICh0aGlzLmlzVmlzaWJsZSgpKXtcblx0XHRcdGxldCBjdHhUcmFuc2Zvcm0gPSBjb21iaW5lVHJhbnNmb3JtKHRoaXMsIHBhcmVudFRyYW5zZm9ybSk7XG5cblx0XHRcdHRoaXMucHJlcGFyZUN0eChjdHgsIGN0eFRyYW5zZm9ybSwgdmlldyk7XG5cdFx0XHRcblx0XHRcdGN0eC5nbG9iYWxBbHBoYSA9IHRoaXMub3BhY2l0eTtcblx0XHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDApO1xuXHRcdFx0Y3R4Lmdsb2JhbEFscGhhID0gMTtcblxuXHRcdFx0dGhpcy5jbGVhbkN0eChjdHgsIGN0eFRyYW5zZm9ybSwgdmlldyk7XG5cdFx0fVxuXHRcdFxuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHQgIHZpZXc6IFRyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0aWYgKHRoaXMudmlzaWJsZSAmJiB0aGlzLmltZy5jb21wbGV0ZSkge1xuXHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCBwYXJlbnRUcmFuc2Zvcm0sIHZpZXcpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGRyYXdUaHVtYihjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdzogbnVtYmVyLCBoOiBudW1iZXIpOiBib29sZWFuIHtcblx0XHRcblx0XHRpZiAodGhpcy52aXNpYmxlICYmIHRoaXMuaW1nLmNvbXBsZXRlKSB7XG5cdFx0XHRsZXQgc2NhbGVYID0gdyAvIHRoaXMuaW1nLndpZHRoO1xuXHRcdFx0bGV0IHNjYWxlWSA9IGggLyB0aGlzLmltZy5oZWlnaHQ7XG5cdFx0XHRsZXQgc2NhbGUgPSBNYXRoLm1pbihzY2FsZVgsIHNjYWxlWSk7XG5cdFx0XHRjdHguc2NhbGUoc2NhbGUsIHNjYWxlKTtcblx0XHRcdC8vY29uc29sZS5sb2coXCJzY2FsZXggXCIgKyAodGhpcy5pbWcud2lkdGggKiBzY2FsZSkpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcInNjYWxleSBcIiArICh0aGlzLmltZy5oZWlnaHQgKiBzY2FsZSkpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcInh5IFwiICsgdGhpcy5pbWcueCArIFwiLCBcIiArIHRoaXMuaW1nLnkpO1xuXHRcdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZywgMCwgMCk7XG5cdFx0XHRjdHguc2NhbGUoMS9zY2FsZSwgMS9zY2FsZSk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Z2V0RGltZW5zaW9uKCk6IERpbWVuc2lvbiB7XG5cdFx0XG5cdFx0aWYgKHRoaXMuaW1nLmNvbXBsZXRlKXtcblx0XHRcdHZhciB3aWR0aCA9IHRoaXMuaW1nLndpZHRoICogdGhpcy56b29tWDtcblx0XHRcdHZhciBoZWlnaHQgPSB0aGlzLmltZy5oZWlnaHQgKiB0aGlzLnpvb21ZO1xuXG5cdFx0XHRsZXQgcDEgPSByb3RhdGUobmV3IFBvaW50MkQod2lkdGgsIDApLCB0aGlzLnJvdGF0aW9uKTtcblx0XHRcdGxldCBwMiA9IHJvdGF0ZShuZXcgUG9pbnQyRCh3aWR0aCwgLWhlaWdodCksIHRoaXMucm90YXRpb24pO1xuXHRcdFx0bGV0IHAzID0gcm90YXRlKG5ldyBQb2ludDJEKDAsIC1oZWlnaHQpLCB0aGlzLnJvdGF0aW9uKTtcblxuXHRcdFx0bGV0IG1pblggPSBNYXRoLm1pbigwLCBwMS54LCBwMi54LCBwMy54KTtcblx0XHRcdGxldCBtaW5ZID0gTWF0aC5taW4oMCwgcDEueSwgcDIueSwgcDMueSk7XG5cdFx0XHRsZXQgbWF4WCA9IE1hdGgubWF4KDAsIHAxLngsIHAyLngsIHAzLngpO1xuXHRcdFx0bGV0IG1heFkgPSBNYXRoLm1heCgwLCBwMS55LCBwMi55LCBwMy55KTtcblxuXHRcdFx0cmV0dXJuIG5ldyBEaW1lbnNpb24odGhpcy54ICsgbWluWCwgdGhpcy55IC0gbWF4WSwgbWF4WC1taW5YLCBtYXhZLW1pblkpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgRGltZW5zaW9uKHRoaXMueCwgdGhpcy55LCAwLCAwKTtcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgUmVjdExheWVyIGV4dGVuZHMgRHJhd0xheWVyIGltcGxlbWVudHMgRGlzcGxheUVsZW1lbnQge1xuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgZGltZW5zaW9uOiBEaW1lbnNpb24sIFxuXHRcdG9wYWNpdHk6IG51bWJlcixcblx0XHR2aXNpYmxlOiBib29sZWFuKSB7XG5cblx0XHRzdXBlcihuZXcgQmFzaWNUcmFuc2Zvcm0oZGltZW5zaW9uLngsIGRpbWVuc2lvbi55LCAxLCAxLCAwKSwgXG5cdFx0XHRvcGFjaXR5LCB2aXNpYmxlLCBcInJlY3RcIik7XG5cdH1cblxuXHR1cGRhdGVEaW1lbnNpb24oZGltZW5zaW9uOiBEaW1lbnNpb24pOiB2b2lkIHtcblx0XHR0aGlzLmRpbWVuc2lvbiA9IGRpbWVuc2lvbjtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHBhcmVudFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHR2aWV3OiBUcmFuc2Zvcm0pOiBib29sZWFuIHtcblxuXHRcdGxldCB4ID0gKHRoaXMuZGltZW5zaW9uLnggKyBwYXJlbnRUcmFuc2Zvcm0ueCAtIHZpZXcueCkgKiB2aWV3Lnpvb21YO1xuXHRcdGxldCB5ID0gKHRoaXMuZGltZW5zaW9uLnkgKyBwYXJlbnRUcmFuc2Zvcm0ueSAtIHZpZXcueSkgKiB2aWV3Lnpvb21ZO1xuXG5cdFx0Y3R4LnN0cm9rZVN0eWxlID0gXCJyZWRcIjtcblx0XHRjdHguc3Ryb2tlUmVjdCh4LCB5LCB0aGlzLmRpbWVuc2lvbi53ICogdmlldy56b29tWCwgdGhpcy5kaW1lbnNpb24uaCAqIHZpZXcuem9vbVkpO1xuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHRyZXR1cm4gdGhpcy5kaW1lbnNpb247XG5cdH1cblxufVxuIiwiaW1wb3J0IHsgRHJhd0xheWVyIH0gZnJvbSBcIi4vbGF5ZXJcIjtcbmltcG9ydCB7IFRyYW5zZm9ybSwgQmFzaWNUcmFuc2Zvcm0sIFZpZXdUcmFuc2Zvcm0sIGNvbWJpbmVUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBEaW1lbnNpb24gfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBab29tRGlzcGxheVJhbmdlIH0gZnJvbSBcIi4vbXVsdGlyZXNsYXllclwiO1xuXG5leHBvcnQgY2xhc3MgVGlsZVN0cnVjdCB7XG5cdFxuXHRjb25zdHJ1Y3Rvcihcblx0XHRwdWJsaWMgcHJlZml4OiBzdHJpbmcsXG5cdFx0cHVibGljIHN1ZmZpeDogc3RyaW5nLFxuXHRcdHB1YmxpYyB0aWxlRGlyZWN0b3J5OiBzdHJpbmcpe31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHpvb21CeUxldmVsKHpvb21MZXZlbDogbnVtYmVyKXtcblx0cmV0dXJuIE1hdGgucG93KDIsIHpvb21MZXZlbCk7XG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlTGF5ZXIgZXh0ZW5kcyBEcmF3TGF5ZXIge1xuXG5cdHRpbGVNYW5hZ2VyOiBUaWxlTWFuYWdlcjtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHRyZWFkb25seSB0aWxlU3RydWN0OiBUaWxlU3RydWN0LFxuXHRcdHZpc2JpbGU6IGJvb2xlYW4sXG5cdFx0bmFtZTogc3RyaW5nID0gXCJ0aWxlc1wiLFxuXHRcdHB1YmxpYyB4T2Zmc2V0OiBudW1iZXIgPSAwLFxuXHRcdHB1YmxpYyB5T2Zmc2V0OiBudW1iZXIgPSAwLFxuXHRcdHB1YmxpYyB6b29tOiBudW1iZXIgPSAxLFxuXHRcdHJlYWRvbmx5IGdyaWRXaWR0aDogbnVtYmVyID0gMjU2LCBcblx0XHRyZWFkb25seSBncmlkSGVpZ2h0OiBudW1iZXIgPSAyNTYsXG5cdFx0b3BhY2l0eTogbnVtYmVyID0gMSl7XG5cblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybSwgb3BhY2l0eSwgdmlzYmlsZSwgbmFtZSk7XG5cblx0XHR0aGlzLnRpbGVNYW5hZ2VyID0gbmV3IFRpbGVNYW5hZ2VyKCk7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0aWYgKHRoaXMuaXNWaXNpYmxlKCkpe1xuXG5cdFx0XHRsZXQgY3R4VHJhbnNmb3JtID0gY29tYmluZVRyYW5zZm9ybSh0aGlzLCBwYXJlbnRUcmFuc2Zvcm0pO1xuXG5cdFx0XHRsZXQgem9vbVdpZHRoOiBudW1iZXIgPSB0aGlzLmdyaWRXaWR0aCAqIGN0eFRyYW5zZm9ybS56b29tWFxuXHRcdFx0bGV0IHpvb21IZWlnaHQ6IG51bWJlciA9IHRoaXMuZ3JpZEhlaWdodCAqIGN0eFRyYW5zZm9ybS56b29tWTtcblxuXHRcdFx0bGV0IHRyYW5zZm9ybVggPSB2aWV3LnggKyBjdHhUcmFuc2Zvcm0ueDtcblx0XHRcdGxldCB0cmFuc2Zvcm1ZID0gdmlldy55ICsgY3R4VHJhbnNmb3JtLnk7XG5cblx0XHRcdGxldCB2aWV3WCA9IHZpZXcueCAqIHZpZXcuem9vbVg7XG5cdFx0XHRsZXQgdmlld1kgPSB2aWV3LnkgKiB2aWV3Lnpvb21ZO1xuXG5cdFx0XHRsZXQgdmlld1dpZHRoID0gdmlldy53aWR0aCAvIHZpZXcuem9vbVg7XG5cdFx0XHRsZXQgdmlld0hlaWdodCA9IHZpZXcuaGVpZ2h0IC8gdmlldy56b29tWTtcblxuXHRcdFx0bGV0IGdyaWRBY3Jvc3MgPSB2aWV3V2lkdGggLyB6b29tV2lkdGg7XG5cdFx0XHRsZXQgZ3JpZEhpZ2ggPSB2aWV3SGVpZ2h0IC8gem9vbUhlaWdodDtcblxuXHRcdFx0bGV0IHhNaW4gPSBNYXRoLmZsb29yKHRyYW5zZm9ybVggLyB6b29tV2lkdGgpO1xuXHRcdFx0bGV0IHhNYXggPSBNYXRoLmNlaWwoKHRyYW5zZm9ybVggKyB2aWV3V2lkdGgpIC8gem9vbVdpZHRoKTtcblxuXHRcdFx0bGV0IHlNaW4gPSBNYXRoLmZsb29yKHRyYW5zZm9ybVkgLyB6b29tSGVpZ2h0KTtcblx0XHRcdGxldCB5TWF4ID0gTWF0aC5jZWlsKCh0cmFuc2Zvcm1ZICsgdmlld0hlaWdodCkgLyB6b29tSGVpZ2h0KTtcblxuXHRcdFx0dmFyIGRyYXdpbmdDb21wbGV0ZSA9IHRydWU7XG5cblx0XHRcdGxldCBmdWxsWm9vbVggPSBjdHhUcmFuc2Zvcm0uem9vbVggKiB2aWV3Lnpvb21YO1xuXHRcdFx0bGV0IGZ1bGxab29tWSA9IGN0eFRyYW5zZm9ybS56b29tWSAqIHZpZXcuem9vbVk7XG5cblx0XHRcdGN0eC5zY2FsZShmdWxsWm9vbVgsIGZ1bGxab29tWSk7XG5cblx0XHRcdGZvciAodmFyIHggPSB4TWluOyB4PHhNYXg7IHgrKyl7XG5cdFx0XHRcdGxldCB4TW92ZSA9IHggKiB0aGlzLmdyaWRXaWR0aCAtIHRyYW5zZm9ybVggLyBjdHhUcmFuc2Zvcm0uem9vbVg7XG5cdFx0XHRcdGZvciAodmFyIHkgPSB5TWluOyB5PHlNYXg7IHkrKyl7XG5cdFx0XHRcdFx0bGV0IHlNb3ZlID0geSAqIHRoaXMuZ3JpZEhlaWdodCAtIHRyYW5zZm9ybVkgLyBjdHhUcmFuc2Zvcm0uem9vbVk7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcInRpbGUgeCB5IFwiICsgeCArIFwiIFwiICsgeSArIFwiOiBcIiArIHhNb3ZlICsgXCIsIFwiICsgeU1vdmUpO1xuXG5cdFx0XHRcdFx0Y3R4LnRyYW5zbGF0ZSh4TW92ZSwgeU1vdmUpO1xuXHRcdFx0XHRcdGxldCB0aWxlU3JjID0gdGhpcy50aWxlU3RydWN0LnRpbGVEaXJlY3RvcnkgKyB0aGlzLnpvb20gKyBcIi9cIiArIFxuXHRcdFx0XHRcdFx0KHggKyB0aGlzLnhPZmZzZXQpICsgXCIvXCIgKyBcblx0XHRcdFx0XHRcdCh5ICsgdGhpcy55T2Zmc2V0KSArIHRoaXMudGlsZVN0cnVjdC5zdWZmaXg7XG5cblx0XHRcdFx0XHRpZiAodGhpcy50aWxlTWFuYWdlci5oYXModGlsZVNyYykpIHtcblx0XHRcdFx0XHRcdGxldCBpbWFnZVRpbGUgPSB0aGlzLnRpbGVNYW5hZ2VyLmdldCh0aWxlU3JjKTtcblx0XHRcdFx0XHRcdGRyYXdpbmdDb21wbGV0ZSA9IGRyYXdpbmdDb21wbGV0ZSAmJiBpbWFnZVRpbGUuZHJhdyhjdHgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdGxldCBpbWFnZVRpbGUgPSBuZXcgSW1hZ2VUaWxlKHgsIHksIHRpbGVTcmMpO1xuXG5cdFx0XHRcdFx0XHRkcmF3aW5nQ29tcGxldGUgPSBkcmF3aW5nQ29tcGxldGUgJiYgaW1hZ2VUaWxlLmRyYXcoY3R4KTtcblxuXHRcdFx0XHRcdFx0dGhpcy50aWxlTWFuYWdlci5zZXQodGlsZVNyYywgaW1hZ2VUaWxlKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjdHgudHJhbnNsYXRlKC14TW92ZSwgLXlNb3ZlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRjdHguc2NhbGUoMSAvIGZ1bGxab29tWCwgMSAvIGZ1bGxab29tWSk7XG5cblx0XHRcdC8vY29uc29sZS5sb2coXCJkcmV3IHRpbGVzIFwiICsgZHJhd2luZ0NvbXBsZXRlKTtcblx0XHRcdHJldHVybiBkcmF3aW5nQ29tcGxldGU7XG5cdFx0fSBlbHNlIHsgXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHRyZXR1cm4gbmV3IERpbWVuc2lvbigwLCAwLCAwLCAwKTtcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgVGlsZU1hbmFnZXIge1xuXG5cdHRpbGVNYXA6IE1hcDxzdHJpbmcsIEltYWdlVGlsZT47XG5cblx0Y29uc3RydWN0b3IoKXtcblx0XHR0aGlzLnRpbGVNYXAgPSBuZXcgTWFwPHN0cmluZywgSW1hZ2VUaWxlPigpO1xuXHR9XG5cblx0Z2V0KHRpbGVLZXk6IHN0cmluZyk6IEltYWdlVGlsZSB7XG5cdFx0cmV0dXJuIHRoaXMudGlsZU1hcC5nZXQodGlsZUtleSk7XG5cdH1cblxuXHRoYXModGlsZUtleTogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudGlsZU1hcC5oYXModGlsZUtleSk7XG5cdH1cblxuXHRzZXQodGlsZUtleTogc3RyaW5nLCB0aWxlOiBJbWFnZVRpbGUpe1xuXHRcdHRoaXMudGlsZU1hcC5zZXQodGlsZUtleSwgdGlsZSk7XG5cdH1cblxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VUaWxlIHtcblxuXHRwcml2YXRlIGltZzogSFRNTEltYWdlRWxlbWVudDtcblx0cHJpdmF0ZSBleGlzdHM6IGJvb2xlYW47XG5cblx0Y29uc3RydWN0b3IocmVhZG9ubHkgeEluZGV4OiBudW1iZXIsIHJlYWRvbmx5IHlJbmRleDogbnVtYmVyLCBpbWFnZVNyYzogc3RyaW5nKSB7XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0XHR0aGlzLmltZy5vbmVycm9yID0gZnVuY3Rpb24oZXZlbnRPck1lc3NhZ2U6IGFueSl7XG5cdFx0XHRldmVudE9yTWVzc2FnZS50YXJnZXQuc3JjID0gXCJcIjtcblx0XHR9O1xuXHR9O1xuXG5cdHByaXZhdGUgZHJhd0ltYWdlKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKXtcblx0XHRjdHguZHJhd0ltYWdlKHRoaXMuaW1nLCAwLCAwKTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpOiBib29sZWFuIHtcblx0XHRpZiAodGhpcy5pbWcuc3JjICE9IFwiXCIgJiYgdGhpcy5pbWcuY29tcGxldGUgKSB7XG5cdFx0XHR0aGlzLmRyYXdJbWFnZShjdHgpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fTtcblxufSIsIi8qKlxuKiBBIHdvcmxkIGlzIDAsMCBiYXNlZCBidXQgYW55IGVsZW1lbnQgY2FuIGJlIHBvc2l0aW9uZWQgcmVsYXRpdmUgdG8gdGhpcy5cbiovXG5leHBvcnQgaW50ZXJmYWNlIFRyYW5zZm9ybSB7XG5cdHg6IG51bWJlcjtcblx0eTogbnVtYmVyO1xuXHR6b29tWDogbnVtYmVyO1xuXHR6b29tWTogbnVtYmVyO1xuXHRyb3RhdGlvbjogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgQmFzaWNUcmFuc2Zvcm0gaW1wbGVtZW50cyBUcmFuc2Zvcm0ge1xuXG4gICAgc3RhdGljIHJlYWRvbmx5IHVuaXRUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgMSwgMSwgMCk7XG5cblx0Y29uc3RydWN0b3IocHVibGljIHg6IG51bWJlciwgcHVibGljIHk6IG51bWJlciwgXG5cdFx0cHVibGljIHpvb21YOiBudW1iZXIsIHB1YmxpYyB6b29tWTogbnVtYmVyLCBcblx0XHRwdWJsaWMgcm90YXRpb246IG51bWJlcil7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tYmluZVRyYW5zZm9ybShjaGlsZDogVHJhbnNmb3JtLCBjb250YWluZXI6IFRyYW5zZm9ybSk6IFRyYW5zZm9ybSB7XG5cdGxldCB6b29tWCA9IGNoaWxkLnpvb21YICogY29udGFpbmVyLnpvb21YO1xuXHQvL2NvbnNvbGUubG9nKFwibW9kaWZpZWQgXCIgKyBjaGlsZC56b29tWCArIFwiIHRvIFwiICsgem9vbVgpO1xuXHRsZXQgem9vbVkgPSBjaGlsZC56b29tWSAqIGNvbnRhaW5lci56b29tWTtcblx0Ly9jb25zb2xlLmxvZyhcIm1vZGlmaWVkIFwiICsgY2hpbGQuem9vbVkgKyBcIiBieSBcIiArIGNvbnRhaW5lci56b29tWSArIFwiIHRvIFwiICsgem9vbVkpO1xuXHRsZXQgeCA9IChjaGlsZC54ICogY29udGFpbmVyLnpvb21YKSArIGNvbnRhaW5lci54O1xuXHRsZXQgeSA9IChjaGlsZC55ICogY29udGFpbmVyLnpvb21ZKSArIGNvbnRhaW5lci55O1xuXHQvL2NvbnNvbGUubG9nKFwibW9kaWZpZWQgeCBcIiArIGNoaWxkLnggKyBcIiBieSBcIiArIGNvbnRhaW5lci56b29tWCArIFwiIGFuZCBcIiArIGNvbnRhaW5lci54ICsgXCIgdG8gXCIgKyB4KTtcblx0bGV0IHJvdGF0aW9uID0gY2hpbGQucm90YXRpb24gKyBjb250YWluZXIucm90YXRpb247XG5cdHJldHVybiBuZXcgQmFzaWNUcmFuc2Zvcm0oeCwgeSwgem9vbVgsIHpvb21ZLCByb3RhdGlvbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZSh0cmFuc2Zvcm06IFRyYW5zZm9ybSk6IFRyYW5zZm9ybSB7XG5cdHJldHVybiBuZXcgQmFzaWNUcmFuc2Zvcm0odHJhbnNmb3JtLngsIHRyYW5zZm9ybS55LCBcblx0XHR0cmFuc2Zvcm0uem9vbVgsIHRyYW5zZm9ybS56b29tWSwgdHJhbnNmb3JtLnJvdGF0aW9uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludmVydFRyYW5zZm9ybSh3b3JsZFN0YXRlOiBUcmFuc2Zvcm0pOiBUcmFuc2Zvcm0ge1xuXHRyZXR1cm4gbmV3IEJhc2ljVHJhbnNmb3JtKC13b3JsZFN0YXRlLngsIC13b3JsZFN0YXRlLnksIFxuXHRcdDEvd29ybGRTdGF0ZS56b29tWCwgMS93b3JsZFN0YXRlLnpvb21ZLCAtd29ybGRTdGF0ZS5yb3RhdGlvbik7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmlld1RyYW5zZm9ybSBleHRlbmRzIFRyYW5zZm9ybSB7XG5cdHdpZHRoOiBudW1iZXI7XG5cdGhlaWdodDogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgQmFzaWNWaWV3VHJhbnNmb3JtIGV4dGVuZHMgQmFzaWNUcmFuc2Zvcm0gaW1wbGVtZW50cyBWaWV3VHJhbnNmb3JtIHtcblxuXHRjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgXG5cdFx0cmVhZG9ubHkgd2lkdGg6IG51bWJlciwgcmVhZG9ubHkgaGVpZ2h0OiBudW1iZXIsXG5cdFx0em9vbVg6IG51bWJlciwgem9vbVk6IG51bWJlciwgXG5cdCAgICByb3RhdGlvbjogbnVtYmVyKXtcblxuXHRcdHN1cGVyKHgsIHksIHpvb21YLCB6b29tWSwgcm90YXRpb24pO1xuXHR9XG5cbn1cblxuXG5cbiIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1xuXHRcIm5hbWVcIjogXCIyLTJcIiwgXCJ4XCI6IC0zNjQsIFwieVwiOiAtMTIuNSwgXCJ6b29tWFwiOiAwLjIxMywgXCJ6b29tWVwiOiAwLjIwNSwgXCJyb3RhdGlvblwiOiAtMC4zMSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDAycl8yW1NWQzJdLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjNcIiwgXCJ4XCI6IC0yMTYsIFwieVwiOiAtMC43MDUsIFwiem9vbVhcIjogMC4yLCBcInpvb21ZXCI6IDAuMjEsIFwicm90YXRpb25cIjogLTAuNTEsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwM3JbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiNFwiLCBcInhcIjogLTc0LjI5LCBcInlcIjogLTk5Ljc4LCBcInpvb21YXCI6IDAuMjIyLCBcInpvb21ZXCI6IDAuMjA4LCBcInJvdGF0aW9uXCI6IC0wLjI4NSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA0cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI1XCIsIFwieFwiOiAtMzY2LjUsIFwieVwiOiAxODAuMDE5LCBcInpvb21YXCI6IDAuMjE1LCBcInpvb21ZXCI6IDAuMjA3LCBcInJvdGF0aW9uXCI6IC0wLjIxLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDVyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjZcIiwgXCJ4XCI6IC0yMDYuMTYsIFwieVwiOiAxNDYsIFwiem9vbVhcIjogMC4yMSwgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAtMC4yMTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwNnJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiN1wiLCBcInhcIjogLTYzLjMsIFwieVwiOiAxMDAuMzc3NiwgXCJ6b29tWFwiOiAwLjIxMjUsIFwiem9vbVlcIjogMC4yMTMsIFwicm90YXRpb25cIjogLTAuMjMsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwN3JbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiOFwiLCBcInhcIjogNzguMSwgXCJ5XCI6IDU4LjUzNSwgXCJ6b29tWFwiOiAwLjIwNywgXCJ6b29tWVwiOiAwLjIxNywgXCJyb3RhdGlvblwiOiAtMC4yNSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA4cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI5XCIsIFwieFwiOiAyMTkuNSwgXCJ5XCI6IDI0LCBcInpvb21YXCI6IDAuMjE1LCBcInpvb21ZXCI6IDAuMjE0NSwgXCJyb3RhdGlvblwiOiAtMC4yNixcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDlyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjEwXCIsIFwieFwiOiA0NTQuMjEsIFwieVwiOiAtMS41LCBcInpvb21YXCI6IDAuMjE4LCBcInpvb21ZXCI6IDAuMjE0LCBcInJvdGF0aW9uXCI6IDAuMDE1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTByXzJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTFcIiwgXCJ4XCI6IDYyMS44NiwgXCJ5XCI6IDI1LjUyNSwgXCJ6b29tWFwiOiAwLjIxMywgXCJ6b29tWVwiOiAwLjIxMTUsIFwicm90YXRpb25cIjogMC4xMSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDExcltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSwgXG5cdHtcblx0XCJuYW1lXCI6IFwiMTItMVwiLCBcInhcIjogNzY5LjY0NSwgXCJ5XCI6IDUwLjI2NSwgXCJ6b29tWFwiOiAwLjQyNCwgXCJ6b29tWVwiOiAwLjQyMiwgXCJyb3RhdGlvblwiOiAwLjEyLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTJyXzFbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTRcIiwgXCJ4XCI6IC05MTUuNiwgXCJ5XCI6IDU1Ny44NjUsIFwiem9vbVhcIjogMC4yMDgsIFwiem9vbVlcIjogMC4yMDgsIFwicm90YXRpb25cIjogLTEuMjE1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTRSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE1LTJcIiwgXCJ4XCI6IC03MTcuMywgXCJ5XCI6IDU3MiwgXCJ6b29tWFwiOiAwLjIxLCBcInpvb21ZXCI6IDAuMjA2LCBcInJvdGF0aW9uXCI6IC0xLjQ3LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTVyXzJbU1ZDMl0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTYtMlwiLCBcInhcIjogLTkyLCBcInlcIjogMzM2LjUsIFwiem9vbVhcIjogMC4yMTcsIFwiem9vbVlcIjogMC4yMSwgXCJyb3RhdGlvblwiOiAtMC4xLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTZyXzJbU1ZDMl0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTdcIiwgXCJ4XCI6IDc3LCBcInlcIjogMjc4LjUsIFwiem9vbVhcIjogMC4yMDYsIFwiem9vbVlcIjogMC4yMDYsIFwicm90YXRpb25cIjogLTAuMDU1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTdSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE4XCIsIFwieFwiOiAyMjksIFwieVwiOiAyMzkuNSwgXCJ6b29tWFwiOiAwLjIwOCwgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAwLjA3LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMThSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE5XCIsIFwieFwiOiA3MS41LCBcInlcIjogNDc0LCBcInpvb21YXCI6IDAuMjAzLCBcInpvb21ZXCI6IDAuMjA4LCBcInJvdGF0aW9uXCI6IDAuMTcsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxOVJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMjBcIiwgXCJ4XCI6IDQzLjUsIFwieVwiOiA2NDAsIFwiem9vbVhcIjogMC4xLCBcInpvb21ZXCI6IDAuMTA0LCBcInJvdGF0aW9uXCI6IDAuMjA1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMjBSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9XG5cbl1cblxuXG5cbiIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1xuXHRcdFwibmFtZVwiOiBcImhlbnJpZXR0YVwiLCBcInhcIjogLTQ4Ni41LCBcInlcIjogLTI1Mi41LCBcInpvb21YXCI6IDAuMjksIFwiem9vbVlcIjogMC41LCBcInJvdGF0aW9uXCI6IDAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9oZW5yaWV0dGEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibWF0ZXJcIiwgXCJ4XCI6IC0zNDIsIFwieVwiOiAtNzQ3LCBcInpvb21YXCI6IDAuMDgsIFwiem9vbVlcIjogMC4xOCwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21hdGVybWlzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInBldGVyc1wiLCBcInhcIjogLTcxOSwgXCJ5XCI6IC04MzYsIFwiem9vbVhcIjogMC4wNywgXCJ6b29tWVwiOiAwLjE0LCBcInJvdGF0aW9uXCI6IC0wLjE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvcGV0ZXJzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm9jb25uZWxsXCIsIFwieFwiOiAtODIxLCBcInlcIjogLTE4MzUsIFwiem9vbVhcIjogMC4yNSwgXCJ6b29tWVwiOiAwLjI1LCBcInJvdGF0aW9uXCI6IDAsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9vY29ubmVsbC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImZvdXJjb3VydHNcIiwgXCJ4XCI6IC01NjcuNSwgXCJ5XCI6IDMyMy41LCBcInpvb21YXCI6IDAuMTYsIFwiem9vbVlcIjogMC4zMjgsIFwicm90YXRpb25cIjogLTAuMTIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9mb3VyY291cnRzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibWljaGFuc1wiLCBcInhcIjogLTYzOSwgXCJ5XCI6IDE2MCwgXCJ6b29tWFwiOiAwLjE0LCBcInpvb21ZXCI6IDAuMjQsIFwicm90YXRpb25cIjogMC4wMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21pY2hhbnMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ0aGVjYXN0bGVcIiwgXCJ4XCI6IC0yOTAsIFwieVwiOiA1MjAsIFwiem9vbVhcIjogMC4yMiwgXCJ6b29tWVwiOiAwLjQyLCBcInJvdGF0aW9uXCI6IC0wLjAxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL3RoZWNhc3RsZS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtYXJrZXRcIiwgXCJ4XCI6IC02MTcsIFwieVwiOiA1NjUsIFwiem9vbVhcIjogMC4xNSwgXCJ6b29tWVwiOiAwLjI2LCBcInJvdGF0aW9uXCI6IDAuMDQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9tYXJrZXQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJwYXRyaWNrc1wiLCBcInhcIjogLTQ2MiwgXCJ5XCI6IDc5NSwgXCJ6b29tWFwiOiAwLjEsIFwiem9vbVlcIjogMC4xMiwgXCJyb3RhdGlvblwiOiAwLjA0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvcGF0cmlja3MucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJuZ2lyZWxhbmRcIiwgXCJ4XCI6IDQzMSwgXCJ5XCI6IDY5NCwgXCJ6b29tWFwiOiAwLjE0LCBcInpvb21ZXCI6IDAuMzc1LCBcInJvdGF0aW9uXCI6IC0wLjEzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL25naXJlbGFuZC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjhcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImJsdWVjb2F0c1wiLCBcInhcIjogLTk5NywgXCJ5XCI6IDg2LCBcInpvb21YXCI6IDAuMSwgXCJ6b29tWVwiOiAwLjIsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9ibHVlY29hdHMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJjb2xsaW5zYmFycmFja3NcIiwgXCJ4XCI6IC0xMTMwLCBcInlcIjogOTAsIFwiem9vbVhcIjogMC4xMywgXCJ6b29tWVwiOiAwLjM3LCBcInJvdGF0aW9uXCI6IDAuMDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvY29sbGluc2JhcnJhY2tzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiaHVnaGxhbmVcIiwgXCJ4XCI6IC0xNzIsIFwieVwiOiAtMzM1LCBcInpvb21YXCI6IDAuMiwgXCJ6b29tWVwiOiAwLjMzLCBcInJvdGF0aW9uXCI6IC0wLjA2LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvaHVnaGxhbmUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJncG9cIiwgXCJ4XCI6IDUyLCBcInlcIjogNTAsIFwiem9vbVhcIjogMC4wODYsIFwiem9vbVlcIjogMC4yNSwgXCJyb3RhdGlvblwiOiAtMC4wMzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9ncG8ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtb3VudGpveVwiLCBcInhcIjogMjYzLCBcInlcIjogLTU2MCwgXCJ6b29tWFwiOiAwLjE1LCBcInpvb21ZXCI6IDAuMjg1LCBcInJvdGF0aW9uXCI6IDAuMTcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9tb3VudGpveS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm1vdW50am95YlwiLCBcInhcIjogMTUyLCBcInlcIjogLTU3MCwgXCJ6b29tWFwiOiAwLjIsIFwiem9vbVlcIjogMC4zMDUsIFwicm90YXRpb25cIjogMC4wNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21vdW50am95Yi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInJveWFsaG9zcGl0YWxcIiwgXCJ4XCI6IC0xODUxLCBcInlcIjogNDg3LjUsIFwiem9vbVhcIjogMC4yMSwgXCJ6b29tWVwiOiAwLjMsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9yb3lhbGhvc3BpdGFsLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwicGVwcGVyXCIsIFwieFwiOiA4MzQsIFwieVwiOiA5OTAsIFwiem9vbVhcIjogMC4wNiwgXCJ6b29tWVwiOiAwLjE0NSwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL3BlcHBlci5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImxpYmVydHloYWxsXCIsIFwieFwiOiAyNzAsIFwieVwiOiAtMTQsIFwiem9vbVhcIjogMC40MywgXCJ6b29tWVwiOiAwLjQzLCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbGliZXJ0eS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImN1c3RvbXNob3VzZVwiLCBcInhcIjogMzgyLCBcInlcIjogMTA3LCBcInpvb21YXCI6IDAuMTUsIFwiem9vbVlcIjogMC4zMCwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2N1c3RvbXNob3VzZS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fVxuXSIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMzJcIiwgXCJ4XCI6IC03NDUsIFwieVwiOiAxMC4wNSwgXCJ6b29tWFwiOiAwLjI1LCBcInpvb21ZXCI6IDAuMjUsIFwicm90YXRpb25cIjogLTEuNDMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0wMzItbS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDb25zdGl0dXRpb24gSGlsbCAtIFR1cm5waWtlLCBHbGFzbmV2aW4gUm9hZDsgc2hvd2luZyBwcm9wb3NlZCByb2FkIHRvIEJvdGFuaWMgR2FyZGVuc1wiLFxuXHRcdFwiZGF0ZVwiOiAxNzk4XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDcyXCIsICBcInhcIjogLTI2MC41LCBcInlcIjogLTI0Ny41LCBcInpvb21YXCI6IDAuMzEsIFwiem9vbVlcIjogMC4zMSwgXCJyb3RhdGlvblwiOiAxLjU4NSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMDcyLW0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIGltcHJvdmluZyB0aGUgc3RyZWV0cyBiZXR3ZWVuIFJpY2htb25kIEJyaWRnZSAoRm91ciBDb3VydHMpIGFuZCBDb25zdGl0dXRpb24gSGlsbCAoS2luZ+KAmXMgSW5ucykgRGF0ZTogMTgzN1wiLFxuXHRcdFwiZGF0ZVwiOiAxODM3XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDc1XCIsIFwieFwiOiAtMjE3LjUsIFwieVwiOiAtMTQxNC41LCBcInpvb21YXCI6IDAuODcsIFwiem9vbVlcIjogMC43NzIsIFwicm90YXRpb25cIjogMS42MTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0wNzUtbS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiBhIGxpbmUgb2Ygcm9hZCwgbGVhZGluZyBmcm9tIExpbmVuIEhhbGwgdG8gR2xhc25ldmluIFJvYWQsIHNob3dpbmcgdGhlIFJveWFsIENhbmFsIERhdGU6IDE4MDBcIixcblx0XHRcImRhdGVcIjogMTgwMFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM2MVwiLCBcInhcIjogNDY0LCBcInlcIjogMjEzMSwgXCJ6b29tWFwiOiAwLjQzNiwgXCJ6b29tWVwiOiAwLjQzNiwgXCJyb3RhdGlvblwiOiAtMi4wNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNjEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJMZWVzb24gU3RyZWV0LCBQb3J0bGFuZCBTdHJlZXQgKG5vdyBVcHBlciBMZWVzb24gU3RyZWV0KSwgRXVzdGFjZSBQbGFjZSwgRXVzdGFjZSBCcmlkZ2UgKG5vdyBMZWVzb24gU3RyZWV0KSwgSGF0Y2ggU3RyZWV0LCBDaXJjdWxhciBSb2FkIC0gc2lnbmVkIGJ5IENvbW1pc3Npb25lcnMgb2YgV2lkZSBTdHJlZXRzIERhdGU6IDE3OTJcIixcblx0XHRcImRhdGVcIjogMTc5MlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE0MlwiLCBcInhcIjogOTQuOTk1LCBcInlcIjogMjM3Ny41LCBcInpvb21YXCI6IDAuNDgyLCBcInpvb21ZXCI6IDAuNDc2LCBcInJvdGF0aW9uXCI6IC0yLjAxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE0Mi1sLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDEuMCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBOZXcgU3RyZWV0cywgYW5kIG90aGVyIGltcHJvdmVtZW50cyBpbnRlbmRlZCB0byBiZSBpbW1lZGlhdGVseSBleGVjdXRlZC4gU2l0dWF0ZSBvbiB0aGUgU291dGggU2lkZSBvZiB0aGUgQ2l0eSBvZiBEdWJsaW4sIHN1Ym1pdHRlZCBmb3IgdGhlIGFwcHJvYmF0aW9uIG9mIHRoZSBDb21taXNzaW9uZXJzIG9mIFdpZGUgU3RyZWV0cywgcGFydGljdWxhcmx5IG9mIHRob3NlIHBhcnRzIGJlbG9uZ2luZyB0byBXbS4gQ29wZSBhbmQgSm9obiBMb2NrZXIsIEVzcS4sIEhhcmNvdXJ0IFN0cmVldCwgQ2hhcmxlbW91bnQgU3RyZWV0LCBQb3J0b2JlbGxvLCBldGMuIERhdGU6IDE3OTJcIixcblx0XHRcImRhdGVcIjogMTc5MlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE1NVwiLCBcInhcIjogLTE1MDYsIFwieVwiOiAtNTAuNSwgXCJ6b29tWFwiOiAwLjY3LCBcInpvb21ZXCI6IDAuNjQ0LCBcInJvdGF0aW9uXCI6IC0wLjAyNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE1NS1sLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTmV3IGFwcHJvYWNoIGZyb20gTWlsaXRhcnkgUm9hZCB0byBLaW5n4oCZcyBCcmlkZ2UsIGFuZCBhbG9uZyB0aGUgUXVheXMgdG8gQXN0b27igJlzIFF1YXkgRGF0ZTogMTg0MVwiLFxuXHRcdFwiZGF0ZVwiOiAxODQxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTU3LTNcIiwgXCJ4XCI6IDMuMTE1LCBcInlcIjogMy42NSwgXCJ6b29tWFwiOiAwLjUyNSwgXCJ6b29tWVwiOiAwLjU5LCBcInJvdGF0aW9uXCI6IDAuNTQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0xNTctMy1tLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuMCwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcInNob3dpbmcgdGhlIGltcHJvdmVtZW50cyBwcm9wb3NlZCBieSB0aGUgQ29tbWlzc2lvbmVycyBvZiBXaWRlIFN0cmVldHMgaW4gTmFzc2F1IFN0cmVldCwgTGVpbnN0ZXIgU3RyZWV0IGFuZCBDbGFyZSBTdHJlZXRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE2NFwiLCBcInhcIjogLTQ3MiwgXCJ5XCI6ODA1LCBcInpvb21YXCI6IDAuMDU2LCBcInpvb21ZXCI6IDAuMDU2LCBcInJvdGF0aW9uXCI6IDAuMDksIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0xNjQtbC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxLjAsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIFNhaW50IFBhdHJpY2vigJlzLCBldGMuIERhdGU6IDE4MjRcIixcblx0XHRcImRhdGVcIjogMTgyNFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ2OS0wMlwiLCBcInhcIjogMjU1LCBcInlcIjogMTM4OS41LCBcInpvb21YXCI6IDAuMjQ1LCBcInpvb21ZXCI6IDAuMjQ1LCBcInJvdGF0aW9uXCI6IC0yLjc1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNDY5LTItbS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJFYXJsc2ZvcnQgVGVycmFjZSwgU3RlcGhlbuKAmXMgR3JlZW4gU291dGggYW5kIEhhcmNvdXJ0IFN0cmVldCBzaG93aW5nIHBsYW4gb2YgcHJvcG9zZWQgbmV3IHN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzU1LTFcIiwgXCJ4XCI6IDY5NiwgXCJ5XCI6IDcxMy41LCBcInpvb21YXCI6IDAuMzIzLCBcInpvb21ZXCI6IDAuMjg5LCBcInJvdGF0aW9uXCI6IDEuMTQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzU1LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBvZiBCYWdnb3QgU3RyZWV0IGFuZCBGaXR6d2lsbGlhbSBTdHJlZXQsIHNob3dpbmcgYXZlbnVlcyB0aGVyZW9mIE5vLiAxIERhdGU6IDE3OTBcIixcblx0XHRcImRhdGVcIjogMTc5MFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTcyOVwiLCBcInhcIjogLTEwOTYsIFwieVwiOiA2NjksIFwiem9vbVhcIjogMC4xMjYsIFwiem9vbVlcIjogMC4xMTgsIFwicm90YXRpb25cIjogLTMuNDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNzI5LWwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gSmFtZXPigJlzIFN0cmVldCwgQmFzb24gTGFuZSwgRWNobGlu4oCZcyBMYW5lLCBHcmFuZCBDYW5hbCBQbGFjZSwgQ2l0eSBCYXNvbiBhbmQgR3JhbmQgQ2FuYWwgSGFyYm91clwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNzU3XCIsIFwieFwiOiAtODgxLCBcInlcIjogMjYxLjUsIFwiem9vbVhcIjogMC4zNTUsIFwiem9vbVlcIjogMC4zNTUsIFwicm90YXRpb25cIjogLTAuMDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtNzU3LWwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGFydCBvZiB0aGUgQ2l0eSBvZiBEdWJsaW4gd2l0aCBwcm9wb3NlZCBpbXByb3ZlbWVudHMuIEltcHJvdmVtZW50cyB0byBiZSBtYWRlIG9yIGludGVuZGVkIGluIFRob21hcyBTdHJlZXQsIEhpZ2ggU3RyZWV0LCBXaW5ldGF2ZXJuIFN0cmVldCwgU2tpbm5lciBSb3csIFdlcmJ1cmdoIFN0cmVldCwgQ2Fub24gU3RyZWV0LCBQYXRyaWNrIFN0cmVldCwgS2V2aW4gU3RyZWV0LCBCaXNob3AgU3RyZWV0IGFuZCBUaGUgQ29vbWJlIFRob21hcyBTaGVycmFyZCBEYXRlOiAxODE3XCIsXG5cdFx0XCJkYXRlXCI6IDE4MTdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMzhcIiwgXCJ4XCI6IDIxMi41LCBcInlcIjogMTQ3LCBcInpvb21YXCI6IDAuMTksIFwiem9vbVlcIjogMC4xNzYsIFwicm90YXRpb25cIjogMCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTEzOC1sLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHByZW1pc2VzLCBHZW9yZ2XigJlzIFF1YXksIENpdHkgUXVheSwgVG93bnNlbmQgU3RyZWV0IGFuZCBuZWlnaGJvdXJob29kLCBzaG93aW5nIHByb3BlcnR5IGxvc3QgdG8gdGhlIENpdHksIGluIGEgc3VpdCBieSAnVGhlIENvcnBvcmF0aW9uIC0gd2l0aCBUcmluaXR5IENvbGxlZ2UnXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xODlcIiwgXCJ4XCI6IC03OTIuNSwgXCJ5XCI6IDI2Mi41LCBcInpvb21YXCI6IDAuMjYsIFwiem9vbVlcIjogMC4yNTgsIFwicm90YXRpb25cIjogMC4wMDMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTg5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQ29weSBvZiBtYXAgb2YgcHJvcG9zZWQgTmV3IFN0cmVldCBmcm9tIEVzc2V4IFN0cmVldCB0byBDb3JubWFya2V0LCB3aXRoIHRoZSBlbnZpcm9ucyBhbmQgc3RyZWV0cyBicmFuY2hpbmcgb2ZmXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wOThcIiwgXCJ4XCI6IC00NzUsIFwieVwiOiA1MjQsIFwiem9vbVhcIjogMC4wNjMsIFwiem9vbVlcIjogMC4wNjMsIFwicm90YXRpb25cIjogLTAuMTYsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0wOTgucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgQ2hyaXN0Y2h1cmNoLCBTa2lubmVycyBSb3cgZXRjLiBUaG9tYXMgU2hlcnJhcmQsIDUgSmFudWFyeSAxODIxIERhdGU6IDE4MjFcIixcblx0XHRcImRhdGVcIjogMTgyMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTIwMlwiLCBcInhcIjogMTYsIFwieVwiOiA4MSwgXCJ6b29tWFwiOiAwLjI4OSwgXCJ6b29tWVwiOiAwLjI2MywgXCJyb3RhdGlvblwiOiAtMC4xMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjAyLWMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJhcmVhIGltbWVkaWF0ZWx5IG5vcnRoIG9mIFJpdmVyIExpZmZleSBmcm9tIFNhY2t2aWxsZSBTdCwgTG93ZXIgQWJiZXkgU3QsIEJlcmVzZm9yZCBQbGFjZSwgYXMgZmFyIGFzIGVuZCBvZiBOb3J0aCBXYWxsLiBBbHNvIHNvdXRoIG9mIExpZmZleSBmcm9tIFdlc3Rtb3JsYW5kIFN0cmVldCB0byBlbmQgb2YgSm9obiBSb2dlcnNvbidzIFF1YXlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE3OVwiLCBcInhcIjogLTUzNy41LCBcInlcIjogNzMwLCBcInpvb21YXCI6IDAuMTY4LCBcInpvb21ZXCI6IDAuMTY0LCBcInJvdGF0aW9uXCI6IDAuMDIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTc5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDEuMCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU2FpbnQgUGF0cmlja+KAmXMgQ2F0aGVkcmFsLCBOb3J0aCBDbG9zZSBhbmQgdmljaW5pdHlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTMyOVwiLCBcInhcIjogLTY3MC41LCBcInlcIjogMzQ3LCBcInpvb21YXCI6IDAuMzM4LCBcInpvb21ZXCI6IDAuMzMyLCBcInJvdGF0aW9uXCI6IC0wLjIxLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMyOS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjMsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gZm9yIG9wZW5pbmcgYW5kIHdpZGVuaW5nIGEgcHJpbmNpcGFsIEF2ZW51ZSB0byB0aGUgQ2FzdGxlLCBub3cgKDE5MDApIFBhcmxpYW1lbnQgU3RyZWV0IC0gc2hvd2luZyBEYW1lIFN0cmVldCwgQ2FzdGxlIFN0cmVldCwgYW5kIGFsbCB0aGUgQXZlbnVlcyB0aGVyZW9mIERhdGU6IDE3NTdcIixcblx0XHRcImRhdGVcIjogMTc1N1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE4N1wiLCBcInhcIjogLTIyNiwgXCJ5XCI6IDQ5NC41LCBcInpvb21YXCI6IDAuMDY2LCBcInpvb21ZXCI6IDAuMDY0LCBcInJvdGF0aW9uXCI6IDAuMCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xODcucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMS4wLFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJBIHN1cnZleSBvZiBzZXZlcmFsIGhvbGRpbmdzIGluIFNvdXRoIEdyZWF0IEdlb3JnZSdzIFN0cmVldCAtIHRvdGFsIHB1cmNoYXNlIMKjMTE1MjguMTYuMyBEYXRlOjE4MDFcIixcblx0XHRcImRhdGVcIjogMTgwMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTEyNFwiLCBcInhcIjogLTI3OSwgXCJ5XCI6IDM2NiwgXCJ6b29tWFwiOiAwLjA1NywgXCJ6b29tWVwiOiAwLjA1MSwgXCJyb3RhdGlvblwiOiAtMC4xNiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xMjQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcHJlbWlzZXMgaW4gRXNzZXggU3RyZWV0IGFuZCBQYXJsaWFtZW50IFN0cmVldCwgc2hvd2luZyBFc3NleCBCcmlkZ2UgYW5kIE9sZCBDdXN0b20gSG91c2UuIFQuIGFuZCBELkguIFNoZXJyYXJkIERhdGU6IDE4MTNcIixcblx0XHRcImRhdGVcIjogMTgxM1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM2MFwiLCAgXCJ4XCI6IC0xNDMsIFwieVwiOiA0MjYuNSwgXCJ6b29tWFwiOiAwLjExNywgXCJ6b29tWVwiOiAwLjEwMywgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNjAucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBEYW1lIFN0cmVldCBhbmQgYXZlbnVlcyB0aGVyZW9mIC0gRXVzdGFjZSBTdHJlZXQsIENlY2lsaWEgU3RyZWV0LCBhbmQgc2l0ZSBvZiBPbGQgVGhlYXRyZSwgRm93bmVzIFN0cmVldCwgQ3Jvd24gQWxsZXkgYW5kIENvcGUgU3RyZWV0IERhdGU6IDE3OTJcIiwgXG5cdFx0XCJkYXRlXCI6IDE3OTJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zNjJcIiwgXCJ4XCI6IDM1LjUsIFwieVwiOiA4NC41LCBcInpvb21YXCI6IDAuMjI5LCBcInpvb21ZXCI6IDAuMjM1LCBcInJvdGF0aW9uXCI6IDAuMTI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM2Mi0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwcyAtIENvbGxlZ2UgR3JlZW4sIENvbGxlZ2UgU3RyZWV0LCBXZXN0bW9yZWxhbmQgU3RyZWV0IGFuZCBhdmVudWVzIHRoZXJlb2YsIHNob3dpbmcgdGhlIHNpdGUgb2YgUGFybGlhbWVudCBIb3VzZSBhbmQgVHJpbml0eSBDb2xsZWdlIE5vLiAxIERhdGU6IDE3OTNcIiwgXG5cdFx0XCJkYXRlXCI6IDE3OTNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zODdcIiwgXCJ4XCI6IDI3Mi41LCBcInlcIjogNDIzLjUsIFwiem9vbVhcIjogMC4wODEsIFwiem9vbVlcIjogMC4wNzcsIFwicm90YXRpb25cIjogMy4wMzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzg3LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIGhvbGRpbmdzIGluIEZsZWV0IFN0cmVldCBhbmQgQ29sbGVnZSBTdHJlZXQsIHNob3dpbmcgc2l0ZSBvZiBPbGQgV2F0Y2ggSG91c2UgRGF0ZTogMTgwMVwiLCBcblx0XHRcImRhdGVcIjogMTgwMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTIxOFwiLCBcInhcIjogLTI0NTUsIFwieVwiOiAtMjg0LjUsIFwiem9vbVhcIjogMC40NTMsIFwiem9vbVlcIjogMC40NTEsIFwicm90YXRpb25cIjogLTAuMDQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjE4LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIHRoZSBMb25nIE1lYWRvd3MgYW5kIHBhcnQgb2YgdGhlIFBob2VuaXggUGFyayBhbmQgUGFya2dhdGUgU3RyZWV0IERhdGU6IDE3ODZcIiwgXG5cdFx0XCJkYXRlXCI6IDE3ODZcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yMjlcIiwgXCJ4XCI6IC0yMzg0LCBcInlcIjogNTUuNSwgXCJ6b29tWFwiOiAwLjM3OSwgXCJ6b29tWVwiOiAwLjM3OSwgXCJyb3RhdGlvblwiOiAwLjAxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yMjkucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTZWN0aW9uIGFjcm9zcyB0aGUgcHJvcG9zZWQgUm9hZCBmcm9tIHRoZSBQYXJrIEdhdGUgdG8gSXNsYW5kIEJyaWRnZSBHYXRlIC0gbm93ICgxOTAwKSBDb255bmdoYW0gUm9hZCBEYXRlOiAxNzg5XCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzg5XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjQyXCIsIFwieFwiOiAtNDA1LjUsIFwieVwiOiAyMSwgXCJ6b29tWFwiOiAwLjA4NCwgXCJ6b29tWVwiOiAwLjA4NCwgXCJyb3RhdGlvblwiOiAxLjA4NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yNDItMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiBhIGhvbGRpbmcgaW4gTWFyeeKAmXMgTGFuZSwgdGhlIGVzdGF0ZSBvZiB0aGUgUmlnaHQgSG9ub3VyYWJsZSBMb3JkIE1vdW50am95IERhdGU6IDE3OTNcIiwgXG5cdFx0XCJkYXRlXCI6IDE3OTNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yNDVcIiwgXCJ4XCI6IC0yMTAuMCwgXCJ5XCI6LTM5Ny41LCBcInpvb21YXCI6IDAuMDg0LCBcInpvb21ZXCI6IDAuMDg0LCBcInJvdGF0aW9uXCI6IC0wLjYyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTI0NS0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBCYXJsZXkgRmllbGRzIGV0Yy4sIGFuZCBhIHBsYW4gZm9yIG9wZW5pbmcgYSBzdHJlZXQgZnJvbSBSdXRsYW5kIFNxdWFyZSwgRG9yc2V0IFN0cmVldCwgYmVpbmcgbm93ICgxODk5KSBrbm93biBhcyBTb3V0aCBGcmVkZXJpY2sgU3RyZWV0IC0gd2l0aCByZWZlcmVuY2UgRGF0ZTogMTc4OVwiLFxuXHRcdCBcImRhdGVcIjogMTc4OVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTI1N1wiLCBcInhcIjogNjgxLjAsIFwieVwiOi0xMjIzLjUsIFwiem9vbVhcIjogMC4zNDYsIFwiem9vbVlcIjogMC4zODgsIFwicm90YXRpb25cIjogMC4yNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yNTcucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgQ2xvbmxpZmZlIFJvYWQgYW5kIHRoZSBPbGQgVHVybnBpa2UgSG91c2UgYXQgQmFsbHlib3VnaCBCcmlkZ2UgLSBOb3J0aCBTdHJhbmQgRGF0ZTogMTgyM1wiLCBcblx0XHRcImRhdGVcIjogMTgyM1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTI2OFwiLCBcInhcIjogLTE1MjguMCwgXCJ5XCI6IDEwNS41LCBcInpvb21YXCI6IDAuMDg2LCBcInpvb21ZXCI6IDAuMDg2LCBcInJvdGF0aW9uXCI6IDAuMDcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjY4LTMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBQYXJrZ2F0ZSBTdHJlZXQsIENvbnluZ2hhbSBSb2FkLCB3aXRoIHJlZmVyZW5jZSB0byBuYW1lcyBvZiB0ZW5hbnRzIGVuZG9yc2VkIE5vLiAzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNzFcIiwgXCJ4XCI6IDExMi4wLCBcInlcIjogMTgxLjUsIFwiem9vbVhcIjogMC4wMjEsIFwiem9vbVlcIjogMC4wMjEsIFwicm90YXRpb25cIjogLTAuMjY1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE3MS0yLmpwZWdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBMb3dlciBBYmJleSBTdHJlZXQsIHRvIGNvcm5lciBvZiBFZGVuIFF1YXkgKFNhY2t2aWxsZSBTdHJlZXQpIERhdGU6IDE4MTNcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MTNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zODBcIiwgXCJ4XCI6IDI0MS41LCBcInlcIjogMjg2LCBcInpvb21YXCI6IDAuMDMzLCBcInpvb21ZXCI6IDAuMDMzLCBcInJvdGF0aW9uXCI6IDAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzgwLTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBGbGVldCBNYXJrZXQsIFBvb2xiZWcgU3RyZWV0LCBIYXdraW5zIFN0cmVldCwgVG93bnNlbmQgU3RyZWV0LCBGbGVldCBTdHJlZXQsIER1YmxpbiBTb2NpZXR5IFN0b3JlcyBEYXRlOiAxODAwXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODAwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzA5XCIsIFwieFwiOiAzNi4wLCBcInlcIjogLTI5NywgXCJ6b29tWFwiOiAwLjIxOSwgXCJ6b29tWVwiOiAwLjIxOSwgXCJyb3RhdGlvblwiOiAtMC40MzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzA5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGFydCBvZiBHYXJkaW5lciBTdHJlZXQgYW5kIHBhcnQgb2YgR2xvdWNlc3RlciBTdHJlZXQsIGxhbmQgb3V0IGluIGxvdHMgZm9yIGJ1aWxkaW5nIC0gc2hvd2luZyBHbG91Y2VzdGVyIFN0cmVldCwgR2xvdWNlc3RlciBQbGFjZSwgdGhlIERpYW1vbmQsIFN1bW1lciBIaWxsLCBHcmVhdCBCcml0YWluIFN0cmVldCwgQ3VtYmVybGFuZCBTdHJlZXQsIE1hcmxib3Jv4oCZIFN0cmVldCwgTWFiYm90IFN0cmVldCwgTWVja2xpbmJ1cmdoIGV0Yy5EYXRlOiAxNzkxXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzkxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjk0XCIsIFwieFwiOiAxMjUuMCwgXCJ5XCI6IC0xMTgsIFwiem9vbVhcIjogMC4xMjksIFwiem9vbVlcIjogMC4xMjksIFwicm90YXRpb25cIjogLTAuMTk1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMjk0LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTdXJ2ZXkgb2YgcGFydCBvZiB0aGUgTG9yZHNoaXAgb2YgU2FpbnQgTWFyeeKAmXMgQWJiZXkgLSBwYXJ0IG9mIHRoZSBlc3RhdGUgb2YgdGhlIFJpZ2h0IEhvbm9yYWJsZSBMdWtlIFZpc2NvdW50IE1vdW50am95LCBzb2xkIHRvIFJpY2hhcmQgRnJlbmNoIEVzcS4sIHB1cnN1YW50IHRvIGEgRGVjcmVlIG9mIEhpcyBNYWplc3R54oCZcyBIaWdoIENvdXJ0IG9mIENoYW5jZXJ5LCAxNyBGZWIgMTc5NFwiLCBcblx0XHRcImRhdGVcIjogMTc5NFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTMxMFwiLCBcInhcIjogNDc0LjAsIFwieVwiOiAtODIxLjUsIFwiem9vbVhcIjogMC41NzYsIFwiem9vbVlcIjogMC41NzYsIFwicm90YXRpb25cIjogMC4xNDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzEwLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTm9ydGggTG90cyAtIGZyb20gdGhlIE5vcnRoIFN0cmFuZCBSb2FkLCB0byB0aGUgTm9ydGggYW5kIEVhc3QgV2FsbHMgRGF0ZTogMTc5M1wiLCBcblx0XHRcImRhdGVcIjogMTc5M1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTMyNVwiLCBcInhcIjogLTg5My4wLCBcInlcIjogNDEsIFwiem9vbVhcIjogMC4yODYsIFwiem9vbVlcIjogMC4yODYsIFwicm90YXRpb25cIjogMC4wMywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zMjUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTbWl0aGZpZWxkLCBBcnJhbiBRdWF5LCBIYXltYXJrZXQsIFdlc3QgQXJyYW4gU3RyZWV0LCBOZXcgQ2h1cmNoIFN0cmVldCwgQm93IExhbmUsIEJvdyBTdHJlZXQsIE1heSBMYW5lXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMjYtMVwiLCBcInhcIjogLTE0MTUuNSwgXCJ5XCI6IDExMi41LCBcInpvb21YXCI6IDAuMTE0LCBcInpvb21ZXCI6IDAuMTEyLCBcInJvdGF0aW9uXCI6IDAuMTcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzI2LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJCYXJyYWNrIFN0cmVldCwgUGFyayBTdHJlZXQsIFBhcmtnYXRlIFN0cmVldCBhbmQgVGVtcGxlIFN0cmVldCwgd2l0aCByZWZlcmVuY2UgdG8gbmFtZXMgb2YgdGVuYW50cyBhbmQgcHJlbWlzZXMgTm8uIDFcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTYzMlwiLCBcInhcIjogMTI1LCBcInlcIjogMzQ3LjUsIFwiem9vbVhcIjogMC4xNzIsIFwiem9vbVlcIjogMC4xNjQsIFwicm90YXRpb25cIjogMC41MywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy02MzIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgTmFzc2F1IFN0cmVldCwgbGVhZGluZyBmcm9tIEdyYWZ0b24gU3RyZWV0IHRvIE1lcnJpb24gU3F1YXJlIC0gc2hvd2luZyB0aGUgb2ZmIHN0cmVldHMgYW5kIHBvcnRpb24gb2YgR3JhZnRvbiBTdHJlZXQgYW5kIFN1ZmZvbGsgU3RyZWV0IERhdGU6IDE4MzNcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MzNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMjYtMlwiLCBcInhcIjogLTEyNTcuNSwgXCJ5XCI6IDE0My41LCBcInpvb21YXCI6IDAuMSwgXCJ6b29tWVwiOiAwLjEsIFwicm90YXRpb25cIjogMC4wNzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzI2LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJCYXJyYWNrIFN0cmVldCwgUGFyayBTdHJlZXQsIFBhcmtnYXRlIFN0cmVldCBhbmQgVGVtcGxlIFN0cmVldCwgd2l0aCByZWZlcmVuY2UgdG8gbmFtZXMgb2YgdGVuYW50cyBhbmQgcHJlbWlzZXNcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTMzNFwiLCBcInhcIjogOTAuNSwgXCJ5XCI6IDM1NywgXCJ6b29tWFwiOiAwLjEyOCwgXCJ6b29tWVwiOiAwLjEyOCwgXCJyb3RhdGlvblwiOiAxLjI2NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zMzQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJEYW1lIFN0cmVldCwgQ29sbGVnZSBHcmVlbiwgR2Vvcmdl4oCZcyBMYW5lLCBHZW9yZ2XigJlzIFN0cmVldCwgQ2hlcXVlciBTdHJlZXQgYW5kIGF2ZW51ZXMgdGhlcmVvZlwiLFxuXHRcdFwiZGF0ZVwiOiAxNzc4XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzU1LTJcIiwgXCJ4XCI6IDE4NSwgXCJ5XCI6IDEwMjksIFwiem9vbVhcIjogMC4zMDIsIFwiem9vbVlcIjogMC4zMDIsIFwicm90YXRpb25cIjogLTAuNDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzU1LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIEJhZ2dvdCBTdHJlZXQgYW5kIEZpdHp3aWxsaWFtIFN0cmVldCwgc2hvd2luZyBhdmVudWVzIHRoZXJlb2YgTm8uIDIgRGF0ZTogMTc5MlwiLFxuXHRcdFwiZGF0ZVwiOiAxNzkyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzY4XCIsIFwieFwiOiAtNjg3LjUsIFwieVwiOiAyNzMuNSwgXCJ6b29tWFwiOiAwLjE1NiwgXCJ6b29tWVwiOiAwLjE1LCBcInJvdGF0aW9uXCI6IDAuMTIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzY4LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIEtpbmfigJlzIElubiBRdWF5IGFuZCBNZXJjaGFudHMgUXVheSwgc2hvd2luZyBzaXRlIG9mIE9ybW9uZCBCcmlkZ2UgLSBiZWxvdyBDaGFybGVzIFN0cmVldCAtIGFmdGVyd2FyZHMgcmVtb3ZlZCBhbmQgcmUtZXJlY3RlZCBvcHBvc2l0ZSBXaW5ldGF2ZXJuIFN0cmVldCBEYXRlOiAxNzk3XCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzk3XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzcyXCIsIFwieFwiOiAzNDEuNSwgXCJ5XCI6IDI5Ni41LCBcInpvb21YXCI6IDAuMDM2LCBcInpvb21ZXCI6IDAuMDMzOSwgXCJyb3RhdGlvblwiOiAyLjk1NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNzIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJHZW9yZ2UncyBRdWF5LCBXaGl0ZXMgTGFuZSwgYW5kIEhhd2tpbnMgU3RyZWV0LCBzaG93aW5nIHNpdGUgb2YgU3dlZXRtYW4ncyBCcmV3ZXJ5IHdoaWNoIHJhbiBkb3duIHRvIFJpdmVyIExpZmZleSBEYXRlOiAxNzk5XCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzk5XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzkwLTFcIiwgXCJ4XCI6IC04MDQuNSwgXCJ5XCI6IDQyMCwgXCJ6b29tWFwiOiAwLjIwNCwgXCJ6b29tWVwiOiAwLjIwMiwgXCJyb3RhdGlvblwiOiAtMC4wNywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zOTAtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gb2YgcHJvcG9zZWQgTWFya2V0IEhvdXNlLCBhZGpvaW5pbmcgVGhvbWFzIFN0cmVldCwgVmljYXIgU3RyZWV0LCBNYXJrZXQgU3RyZWV0IGFuZCBGcmFuY2lzIFN0cmVldCBEYXRlOiAxODAxXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzk1LTNcIiwgXCJ4XCI6IC01ODgsIFwieVwiOiA1NzgsIFwiem9vbVhcIjogMC4wMzYsIFwiem9vbVlcIjogMC4wMzYsIFwicm90YXRpb25cIjogLTMuNjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzk1LTMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJOZXcgUm93IGFuZCBDdXRwdXJzZSBSb3cgRGF0ZTogMTgwMFwiLFxuXHRcdFwiZGF0ZVwiOiAxODAwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDA0XCIsIFwieFwiOiAtMTYsIFwieVwiOiAzNzIsIFwiem9vbVhcIjogMC4wNjIsIFwiem9vbVlcIjogMC4wNiwgXCJyb3RhdGlvblwiOiAtMC4yNTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDA0LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQW5nbGVzZWEgU3RyZWV0IGFuZCBQYXJsaWFtZW50IEhvdXNlIERhdGU6IDE4MDJcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MDJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MTFcIiwgXCJ4XCI6IDM0My41LCBcInlcIjogNjU3LCBcInpvb21YXCI6IDAuMDg2LCBcInpvb21ZXCI6IDAuMDg2LCBcInJvdGF0aW9uXCI6IDAuMzI1LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDExLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTGVpbnN0ZXIgSG91c2UgYW5kIHBhcnQgb2YgdGhlIGVzdGF0ZSBvZiBWaXNjb3VudCBGaXR6d2lsbGlhbSAoZm9ybWVybHkgTGVpbnN0ZXIgTGF3biksIGxhaWQgb3V0IGluIGxvdHMgZm9yIGJ1aWxkaW5nIC0gc2hvd2luZyBLaWxkYXJlIFN0cmVldCwgVXBwZXIgTWVycmlvbiBTdHJlZXQgYW5kIExlaW5zdGVyIFBsYWNlIChTdHJlZXQpLCBNZXJyaW9uIFBsYWNlLCBhbmQgdGhlIE9sZCBCb3VuZGFyeSBiZXR3ZWVuIExlaW5zdGVyIGFuZCBMb3JkIEZpdHp3aWxsaWFtIC0gdGFrZW4gZnJvbSBhIG1hcCBzaWduZWQgUm9iZXJ0IEdpYnNvbiwgTWF5IDE4LCAxNzU0IERhdGU6IDE4MTJcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MTJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yNTFcIiwgXCJ4XCI6IDIyMCwgXCJ5XCI6IDY0LCBcInpvb21YXCI6IDAuMjM2LCBcInpvb21ZXCI6IDAuMjM2LCBcInJvdGF0aW9uXCI6IC0xLjQ5LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjUxLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHBvcnRpb24gb2YgQ2l0eSwgc2hvd2luZyBNb250Z29tZXJ5IFN0cmVldCwgTWVja2xpbmJ1cmdoIFN0cmVldCwgTG93ZXIgR2xvdWNlc3RlciBTdHJlZXQgYW5kIHBvcnRpb24gb2YgTWFiYm90IFN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDEzXCIsIFwieFwiOiAtMzczLCBcInlcIjogODA2LjUsIFwiem9vbVhcIjogMC4wNzgsIFwiem9vbVlcIjogMC4wNzYsIFwicm90YXRpb25cIjogLTAuMTUsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MTMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQZXRlciBTdHJlZXQsIFBldGVy4oCZcyBSb3csIFdoaXRlZnJpYXIgU3RyZWV0LCBXb29kIFN0cmVldCBhbmQgQnJpZGUgU3RyZWV0IC0gc2hvd2luZyBzaXRlIG9mIHRoZSBBbXBoaXRoZWF0cmUgaW4gQnJpZGUgU3RyZWV0LCB3aGVyZSB0aGUgTW9sZXluZXV4IENodXJjaCBub3cgKDE5MDApIHN0YW5kcyBEYXRlOiAxODEyXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODEyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDE0XCIsIFwieFwiOiAtMTkzLjUsIFwieVwiOiAzNjMuNSwgXCJ6b29tWFwiOiAwLjA3MiwgXCJ6b29tWVwiOiAwLjA3NCwgXCJyb3RhdGlvblwiOiAtMC4yMyxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQxNC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlRlbXBsZSBCYXIsIFdlbGxpbmd0b24gUXVheSwgT2xkIEN1c3RvbSBIb3VzZSwgQmFnbmlvIFNsaXAgZXRjLiBEYXRlOiAxODEzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODEzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDIxXCIsIFwieFwiOiAtNDc0LjUsIFwieVwiOiA1MjcsIFwiem9vbVhcIjogMC4wNjIsIFwiem9vbVlcIjogMC4wNiwgXCJyb3RhdGlvblwiOiAtMC4xODUsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MjEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgdGhlIHByZWNpbmN0cyBvZiBDaHJpc3QgQ2h1cmNoIER1Ymxpbiwgc2hvd2luZyBTa2lubmVycyBSb3csIHRvIHdoaWNoIGlzIGF0dGFjaGVkIGEgTWVtb3JhbmR1bSBkZW5vbWluYXRpbmcgdGhlIHByZW1pc2VzLCB0YWtlbiBieSB0aGUgQ29tbWlzc2lvbmVycyBvZiBXaWRlIFN0cmVldHMgZm9yIHRoZSBwdXJwb3NlIG9mIHdpZGVuaW5nIHNhaWQgU2tpbm5lcnMgUm93LCBub3cgKDE5MDApIGtub3duIGFzIENocmlzdCBDaHVyY2ggUGxhY2UgRGF0ZTogMTgxN1wiLCBcblx0XHRcImRhdGVcIjogMTgxN1xuXHR9LFxuXHR7IFxuXHRcdFwibmFtZVwiOiBcIndzYy00MDgtMlwiLCBcInhcIjogLTM5Ny41LCBcInlcIjogNTQ1LjUsIFwiem9vbVhcIjogMC4wNDQsIFwiem9vbVlcIjogMC4wNDQsIFwicm90YXRpb25cIjogLTAuMTIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDA4LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJXZXJidXJnaCBTdHJlZXQsIFNraW5uZXJzIFJvdywgRmlzaGFtYmxlIFN0cmVldCBhbmQgQ2FzdGxlIFN0cmVldCBEYXRlOiBjLiAxODEwXCIsXG5cdFx0XCJkYXRlXCI6IDE4MTBcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MjUtMVwiLCBcInhcIjogLTkxNy41LCBcInlcIjogNTc3LjUsIFwiem9vbVhcIjogMC4wNDUsIFwiem9vbVlcIjogMC4wNDYsIFwicm90YXRpb25cIjogLTEuNDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQyNS0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWVhdGggUm93LCBNYXJr4oCZcyBBbGxleSBhbmQgRGlydHkgTGFuZSAtIHNob3dpbmcgQnJpZGdlZm9vdCBTdHJlZXQsIE1hc3MgTGFuZSwgVGhvbWFzIFN0cmVldCBhbmQgU3QuIENhdGhlcmluZeKAmXMgQ2h1cmNoIERhdGU6IDE4MjAtMjRcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MjBcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MjZcIiwgXCJ4XCI6IC03MzUuNSwgXCJ5XCI6IDU3OC41LCBcInpvb21YXCI6IDAuMDM0LCBcInpvb21ZXCI6IDAuMDM0LCBcInJvdGF0aW9uXCI6IDEuNTY1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQyNi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBzZXZlcmFsIGhvdXNlcyBhbmQgcHJlbWlzZXMgb24gdGhlIEVhc3Qgc2lkZSBvZiBNZWF0aCBSb3csIHRoZSBwcm9wZXJ0eSBvZiBNci4gSm9obiBXYWxzaCAtIHNob3dpbmcgdGhlIHNpdHVhdGlvbiBvZiBUaG9tYXMgU3RyZWV0LCBIYW5idXJ5IExhbmUgYW5kIHNpdGUgb2YgQ2hhcGVsIERhdGU6IDE4MjFcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MjFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMTItMVwiLCBcInhcIjogLTI5MC41LCBcInlcIjogMzQ0LjUsIFwiem9vbVhcIjogMC4xOCwgXCJ6b29tWVwiOiAwLjE4MiwgXCJyb3RhdGlvblwiOiAtMC4yNiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xMTItMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjMsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkRhbWUgU3RyZWV0LCBmcm9tIHRoZSBjb3JuZXIgb2YgUGFsYWNlIFN0cmVldCB0byB0aGUgY29ybmVyIG9mIEdlb3JnZeKAmXMgU3RyZWV0IC0gbGFpZCBvdXQgaW4gbG90cyBmb3IgYnVpbGRpbmcgTm9ydGggYW5kIFNvdXRoIGFuZCB2aWNpbml0eSBEYXRlOiAxNzgyXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzgyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTEyXCIsIFwieFwiOiAtMjk4LCBcInlcIjogMzM5LjUsIFwiem9vbVhcIjogMC4xODUsIFwiem9vbVlcIjogMC4xODUsIFwicm90YXRpb25cIjogLTAuMjU1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTExMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IGZhbHNlLCBcIm9wYWNpdHlcIjogMC4wLFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJEYW1lIFN0cmVldCwgZnJvbSB0aGUgY29ybmVyIG9mIFBhbGFjZSBTdHJlZXQgdG8gdGhlIGNvcm5lciBvZiBHZW9yZ2XigJlzIFN0cmVldCAtIGxhaWQgb3V0IGluIGxvdHMgZm9yIGJ1aWxkaW5nIE5vcnRoIGFuZCBTb3V0aCBhbmQgdmljaW5pdHkgRGF0ZTogMTc4MlwiLCBcblx0XHRcImRhdGVcIjogMTc4MlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ1NVwiLCBcInhcIjogNjM1LjUsIFwieVwiOiAxMjU4LCBcInpvb21YXCI6IDAuMjYzLCBcInpvb21ZXCI6IDAuMjYzLCBcInJvdGF0aW9uXCI6IC0wLjksIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDU1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiSGVyYmVydCBQbGFjZSBhbmQgQXZlbnVlcyBhZGphY2VudCB0byBVcHBlciBNb3VudCBTdHJlZXQsIHNob3dpbmcgVXBwZXIgQmFnZ290IFN0cmVldCAtIEhlcmJlcnQgU3RyZWV0LCBXYXJyaW5ndG9uIFBsYWNlIGFuZCBQZXJjeSBQbGFjZSwgTm9ydGh1bWJlcmxhbmQgUm9hZCBhbmQgTG93ZXIgTW91bnQgU3RyZWV0IERhdGU6IDE4MzNcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MzNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xOTlcIiwgXCJ4XCI6IDg3OC41LCBcInlcIjogMTIxNy41LCBcInpvb21YXCI6IDAuMjQxLCBcInpvb21ZXCI6IDAuMjQxLCBcInJvdGF0aW9uXCI6IDIuMTE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE5OS0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHBhcnQgb2YgdGhlIGVzdGF0ZSBvZiB0aGUgSG9uLiBTaWRuZXkgSGVyYmVydCwgY2FsbGVkIFdpbHRvbiBQYXJhZGUsIHNob3dpbmcgdGhlIHByb3Bvc2VkIGFwcHJvcHJpYXRpb24gdGhlcmVvZiBpbiBzaXRlcyBmb3IgYnVpbGRpbmcuIEFsc28gc2hvd2luZyBCYWdnb3QgU3RyZWV0LCBHcmFuZCBDYW5hbCBhbmQgRml0endpbGxpYW0gUGxhY2UuXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00NjVcIiwgXCJ4XCI6IDMwMS41LCBcInlcIjogNzExLjUsIFwiem9vbVhcIjogMC4yMDcsIFwiem9vbVlcIjogMC4yMDcsIFwicm90YXRpb25cIjogMy4zLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQ2NS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjYsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkdyYWZ0b24gU3RyZWV0LCBOYXNzYXUgU3RyZWV0IChTb3V0aCBzaWRlKSBhbmQgRGF3c29uIFN0cmVldCBEYXRlOiAxODM3XCIsIFxuXHRcdFwiZGF0ZVwiOiAxODM3XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDgwLTJcIiwgXCJ4XCI6IC02MywgXCJ5XCI6IDM4MiwgXCJ6b29tWFwiOiAwLjA2OCwgXCJ6b29tWVwiOiAwLjA2OCwgXCJyb3RhdGlvblwiOiAtMC4wNTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDgwLTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJOb3J0aCBzaWRlIG9mIENvbGxlZ2UgR3JlZW4gc2hvd2luZyBBdmVudWVzIHRoZXJlb2YsIGFuZCBncm91bmQgcGxhbiBvZiBQYXJsaWFtZW50IEhvdXNlLCBBbmdsZXNlYSBTdHJlZXQsIEJsYWNrbW9vciBZYXJkIGV0Yy4gLSB3aXRoIHJlZmVyZW5jZSBnaXZpbmcgdGVuYW50cywgbmFtZXMgb2YgcHJlbWlzZXMgcmVxdWlyZWQgb3IgcHVycG9zZSBvZiBpbXByb3ZlbWVudC4gRGF0ZTogMTc4NlwiLCBcblx0XHRcImRhdGVcIjogMTc4NlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ5MVwiLCBcInhcIjogLTIxLjUsIFwieVwiOiA5MzgsIFwiem9vbVhcIjogMC4xNjQsIFwiem9vbVlcIjogMC4xNjQsIFwicm90YXRpb25cIjogLTMuMDgsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDkxLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQXVuZ2llciBTdHJlZXQsIE1lcmNlciBTdHJlZXQsIFlvcmsgU3RyZWV0IGFuZCBBdmVudWVzIHRoZXJlb2YsIHZpejogLSBGcmVuY2ggU3RyZWV0IChNZXJjZXIgU3RyZWV0KSwgQm93IExhbmUsIERpZ2dlcyBMYW5lLCBTdGVwaGVuIFN0cmVldCwgRHJ1cnkgTGFuZSwgR3JlYXQgYW5kIExpdHRsZSBMb25nZm9yZCBTdHJlZXRzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00OTZcIiwgXCJ4XCI6IC0yNzgsIFwieVwiOiA0NTYsIFwiem9vbVhcIjogMC4wMTgsIFwiem9vbVlcIjogMC4wMTgsIFwicm90YXRpb25cIjogLTMuMjYsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDk2LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRXNzZXggUXVheSwgQ2hhbmdlIEFsbGV5LCBTbW9jayBBbGxleSBhbmQgZ3JvdW5kIHBsYW4gb2YgU21vY2sgQWxsZXkgVGhlYXRyZVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNTA3XCIsIFwieFwiOiAtMjcyLjUsIFwieVwiOiAzNDYsIFwiem9vbVhcIjogMC4wODcsIFwiem9vbVlcIjogMC4wODksIFwicm90YXRpb25cIjogLTAuMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy01MDcucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJFc3NleCBTdHJlZXQsIFBhcmxpYW1lbnQgU3RyZWV0LCBzaG93aW5nIE9sZCBDdXN0b20gSG91c2UgUXVheSwgTG93ZXIgT3Jtb25kIFF1YXkgYW5kIERhbWUgU3RyZWV0XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yMDYtMVwiLCBcInhcIjogLTQ0LjUsIFwieVwiOiAtMjIxLCBcInpvb21YXCI6IDAuMDUsIFwiem9vbVlcIjogMC4wNSwgXCJyb3RhdGlvblwiOiAtMC42NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yMDYtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBhbmdsZSBvZiBDYXZlbmRpc2ggUm93LCBSdXRsYW5kIFNxdWFyZSBhbmQgR3JlYXQgQnJpdGFpbiBTdHJlZXQgLSBzaG93aW5nIHVuc2lnbmVkIGVsZXZhdGlvbnMgYW5kIGdyb3VuZCBwbGFuIG9mIFJvdHVuZGEgYnkgRnJlZGVyaWNrIFRyZW5jaC4gRGF0ZTogMTc4N1wiLCBcblx0XHRcImRhdGVcIjogMTc4N1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTIwM1wiLCBcInhcIjogLTM5MiwgXCJ5XCI6IDI3Mi41LCBcInpvb21YXCI6IDAuMDc4LCBcInpvb21ZXCI6IDAuMDc2LCBcInJvdGF0aW9uXCI6IC0wLjI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTIwMy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNpdHkgU3VydmV5IC0gc2hvd2luZyBPcm1vbmQgUXVheSwgQXJyYW4gU3RyZWV0LCBNYXJ54oCZcyBBYmJleSwgTGl0dGxlIFN0cmFuZCBTdHJlZXQsIENhcGVsIFN0cmVldCBhbmQgRXNzZXggQnJpZGdlIERhdGU6IDE4MTFcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MTFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy01MTVcIiwgXCJ4XCI6IC03NSwgXCJ5XCI6IDU1MCwgXCJ6b29tWFwiOiAwLjA4OCwgXCJ6b29tWVwiOiAwLjA4OCwgXCJyb3RhdGlvblwiOiAyLjkzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy01MTUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJzaG93aW5nIERhbWUgU3RyZWV0LCBFc3NleCBTdHJlZXQgZXRjLiAtIGFsc28gc2l0ZSBmb3IgcHJvcG9zZWQgTmF0aW9uYWwgQmFuaywgb24gb3IgYWJvdXQgd2hlcmUgdGhlICdFbXBpcmUnIChmb3JtZXJseSB0aGUgJ1N0YXInKSBUaGVhdHJlIG9mIFZhcmlldGllcyBub3cgKDE5MDApIHN0YW5kcyBOby4xXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy01MjMtMVwiLCBcInhcIjogLTI5Ny41LCBcInlcIjogMzY4LjUsIFwiem9vbVhcIjogMC4wODgsIFwiem9vbVlcIjogMC4wODgsIFwicm90YXRpb25cIjogLTAuMTg1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTUyMy0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRXNzZXggU3RyZWV0LCBUZW1wbGUgQmFyIGFuZCB2aWNpbml0eSB0byBFc3NleCBCcmlkZ2UsIHNob3dpbmcgcHJvcG9zZWQgbmV3IHF1YXkgd2FsbCAoV2VsbGluZ3RvbiBRdWF5KVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDIzLTJcIiwgXCJ4XCI6IDM0LjUsIFwieVwiOiA0NzguNSwgXCJ6b29tWFwiOiAwLjA3OCwgXCJ6b29tWVwiOiAwLjA4MiwgXCJyb3RhdGlvblwiOiAtMy4yMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDIzLTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDcm93biBBbGxleSwgQ29wZSBTdHJlZXQsIEFyZGlsbOKAmXMgUm93LCBUZW1wbGUgQmFyLCBBc3RvbuKAmXMgUXVheSBhbmQgV2VsbGluZ3RvbiBRdWF5IE5vLiAyIERhdGU6IDE4MjAtNVwiLCBcblx0XHRcImRhdGVcIjogMTgyMFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTUzNVwiLCBcInhcIjogLTIwOS41LCBcInlcIjogMzI1LCBcInpvb21YXCI6IDAuMTM0LCBcInpvb21ZXCI6IDAuMTM0LCBcInJvdGF0aW9uXCI6IC0wLjA3LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTUzNS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIldlbGxpbmd0b24gUXVheSAtIGNvbnRpbnVhdGlvbiBvZiBFdXN0YWNlIFN0cmVldCBEYXRlXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy01NjctM1wiLCBcInhcIjogMTk0LjUsIFwieVwiOiA0NTAsIFwiem9vbVhcIjogMC4xMjYsIFwiem9vbVlcIjogMC4xMjYsIFwicm90YXRpb25cIjogMS40OCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy01NjctMy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBhIHBhcmNlbCBvZiBncm91bmQgYm91bmRlZCBieSBHcmFmdG9uIFN0cmVldCwgQ29sbGVnZSBHcmVlbiwgYW5kIENoZXF1ZXIgTGFuZSAtIGxlYXNlZCB0byBNci4gUG9vbGV5ICgzIGNvcGllcykgTm8uIDMgRGF0ZTogMTY4MlwiLCBcblx0XHRcImRhdGVcIjogMTY4MlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTU5NC0xXCIsIFwieFwiOiAtNTY0LjUsIFwieVwiOiA1NzIuNSwgXCJ6b29tWFwiOiAwLjA0NCwgXCJ6b29tWVwiOiAwLjA0NCwgXCJyb3RhdGlvblwiOiAyLjUzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy01OTQtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBOZXcgSGFsbCBNYXJrZXQgLSBwYXJ0IG9mIHRoZSBDaXR5IEVzdGF0ZSBEYXRlOiAxNzgwXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzgwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNjI1LTFcIiwgXCJ4XCI6IC0zMjAuNSwgXCJ5XCI6IDYwOS41LCBcInpvb21YXCI6IDAuMDU4LCBcInpvb21ZXCI6IDAuMDU4LCBcInJvdGF0aW9uXCI6IDIuNjEsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNjI1LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgdGhlIE9sZCBUaG9sc2VsbCBncm91bmQsIGZvcm1lcmx5IGNhbGxlZCBTb3V0aGVy4oCZcyBMYW5lLCBiZWxvbmdpbmcgdG8gdGhlIENpdHkgb2YgRHVibGluIC0gbGFpZCBvdXQgZm9yIGJ1aWxkaW5nLCBOaWNob2xhcyBTdHJlZXQsIFNraW5uZXJzIFJvdyBhbmQgV2VyYnVyZ2ggU3RyZWV0IEJ5IEEuIFIuIE5ldmlsbGUsIEMuIFMuIERhdGU6IDE4MTJcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MTJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy02NTRcIiwgXCJ4XCI6IC0zOTcuNSwgXCJ5XCI6IDQwOSwgXCJ6b29tWFwiOiAwLjEyMiwgXCJ6b29tWVwiOiAwLjEyMiwgXCJyb3RhdGlvblwiOiAtMC4xMzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNjU0LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBncm91bmQgcGxvdHMgb2Ygc2V2ZXJhbCBob2xkaW5ncyBiZWxvbmdpbmcgdG8gdGhlIENpdHkgb2YgRHVibGluLCBNYWRhbSBP4oCZSGFyYSwgQ29sb25lbCBCZXJyeSBhbmQgb3RoZXJzLCBvbiBCYWNrIFF1YXkgLSAoRXNzZXggUXVheSkgQmxpbmQgUXVheSAtIEV4Y2hhbmdlIFN0cmVldCwgRXNzZXggQnJpZGdlLCBDcmFuZSBMYW5lIGFuZCBEYW1lIFN0cmVldCwgU3ljYW1vcmUgQWxsZXkgLSBzaG93aW5nIHBvcnRpb24gb2YgdGhlIENpdHkgV2FsbCwgRXNzZXggR2F0ZSwgRGFtZSBHYXRlLCBEYW1lcyBNaWxsIGFuZCBicmFuY2ggb2YgdGhlIFJpdmVyIERvZGRlclwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNzA1XCIsIFwieFwiOiAtMTg3LjUsIFwieVwiOiAzOTIsIFwiem9vbVhcIjogMC4wNCwgXCJ6b29tWVwiOiAwLjA0MiwgXCJyb3RhdGlvblwiOiAtMC4zOCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy03MDUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgRXNzZXggU3RyZWV0IGFuZCB2aWNpbml0eSBEYXRlOiAxODA2XCIsIFxuXHRcdFwiZGF0ZVwiOiAxODI2XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNzI1XCIsIFwieFwiOiAtNjUzLjUsIFwieVwiOiAyMjIuNSwgXCJ6b29tWFwiOiAwLjA5NCwgXCJ6b29tWVwiOiAwLjA5NCwgXCJyb3RhdGlvblwiOiAwLjA3LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNzI1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQ2h1cmNoIFN0cmVldCwgQ2hhcmxlcyBTdHJlZXQsIElubuKAmXMgUXVheSAtICdXaGl0ZSBDcm9zcyBJbm4nIC0gcmVyZSBvZiBGb3VyIENvdXJ0cyAtIFVzaGVyc+KAmSBRdWF5LCBNZXJjaGFudOKAmXMgUXVheSwgV29vZCBRdWF5IC0gd2l0aCByZWZlcmVuY2UgRGF0ZTogMTgzM1wiLCBcblx0XHRcImRhdGVcIjogMTgzM1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE5OC0xXCIsIFwieFwiOiAtNDYyLCBcInlcIjogNDc2LCBcInpvb21YXCI6IDAuMDMyLCBcInpvb21ZXCI6IDAuMDMyLCBcInJvdGF0aW9uXCI6IC0wLjM0NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xOTgtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBXaGl0ZWhvcnNlIFlhcmQgKFdpbmV0YXZlcm4gU3RyZWV0KSBTdXJ2ZXlvcjogQXJ0aHVyIE5ldmlsbGUgRGF0ZTogMTg0N1wiLCBcblx0XHRcImRhdGVcIjogMTg0N1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA1NVwiLCBcInhcIjogLTE3NzUsIFwieVwiOiAtMTQ0NiwgXCJ6b29tWFwiOiAxLjExLCBcInpvb21ZXCI6IDEuMTYyLCBcInJvdGF0aW9uXCI6IDAuMDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTA1NS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gb2YgTWFpbCBDb2FjaCBSb2FkLCB0aHJvdWdoIEJsZXNzaW5ndG9uIFN0cmVldCB0byBDYWJyYSwgb2YgTmV3IExpbmUgUm9hZCwgYmVpbmcgcGFydCBvZiB0aGUgTmF2YW4gVHVybnBpa2UgUm9hZCBhbmQgY29ubmVjdGluZyBhbiBpbXByb3ZlbWVudCBsYXRlbHkgbWFkZSB1cG9uIHRoYXQgTGluZSB3aXRoIHRoZSBDaXR5IG9mIER1YmxpbiAtIHNob3dpbmcgdGhlIG1vc3QgZGlyZWN0IGxpbmUgYW5kIGFsc28gYSBDaXJjdWl0b25zIGxpbmUgd2hlcmVieSB0aGUgZXhwZW5zZSBvZiBhIEJyaWRnZSBhY3Jvc3MgdGhlIFJveWFsIENhbmFsIG1heSBiZSBhdm9pZGVkLiBEb25lIGJ5IEhpcyBNYWplc3R5J3MgUG9zdCBNYXN0ZXJzIG9mIElyZWxhbmQgYnkgTXIuIExhcmtpbiBEYXRlOiAxODE4XCIsIFxuXHRcdFwiZGF0ZVwiOiAxODE4XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDYwXCIsIFwieFwiOiAtMTA0LjUsIFwieVwiOiAtMSwgXCJ6b29tWFwiOiAwLjY3NCwgXCJ6b29tWVwiOiAwLjcwMiwgXCJyb3RhdGlvblwiOiAzLjE2NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy02MC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBzaG93aW5nIHRoZSBhbHRlcmF0aW9ucyBwcm9wb3NlZCBpbiB0aGUgbmV3IGxpbmUgb2Ygcm9hZCwgbGVhZGluZyBmcm9tIER1YmxpbiB0byBOYXZhbiwgY29tbWVuY2luZyBhdCBCbGVzc2luZ3RvbiBTdHJlZXQ7IHBhc3NpbmcgYWxvbmcgdGhlIENpcmN1bGFyIFJvYWQgdG8gUHJ1c3NpYSBTdHJlZXQsIGFuZCBoZW5jZSBhbG9uZyB0aGUgVHVybnBpa2UgUm9hZCB0byBSYXRvYXRoLCBhbmQgdGVybWluYXRpbmcgYXQgdGhlIFR1cm5waWtlXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNjVcIiwgXCJ4XCI6IC01NDUuNSwgXCJ5XCI6IC0yNzUsIFwiem9vbVhcIjogMC4yOTgsIFwiem9vbVlcIjogMC4yOTIsIFwicm90YXRpb25cIjogLTEuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDY1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIHNob3dpbmcgTW91bnRqb3kgU3RyZWV0LCBEb3JzZXQgU3RyZWV0LCBEb21pbmljayBTdHJlZXQgYW5kIHZpY2luaXR5IC0gcGxhbiBvZiBTYWludCBNYXJ54oCZcyBDaGFwZWwgb2YgRWFzZSwgYW5kIHByb3Bvc2VkIG9wZW5pbmcgbGVhZGluZyB0aGVyZXVudG8gZnJvbSBHcmFuYnkgUm93IC0gVGhvbWFzIFNoZXJyYXJkIDMwIE5vdiAxODI3XCIsIFxuXHRcdFwiZGF0ZVwiOiAxODI3XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDEyXCIsIFwieFwiOiAtMTI1LjUsIFwieVwiOiAxNDkuNSwgXCJ6b29tWFwiOiAwLjA0NCwgXCJ6b29tWVwiOiAwLjA0NCwgXCJyb3RhdGlvblwiOiAtMC4yMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wMTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcHJlbWlzZXMgTG93ZXIgQWJiZXkgU3RyZWV0LCBMb3dlciBTYWNrdmlsbGUgU3RyZWV0IGFuZCBFZGVuIFF1YXlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAxNFwiLCBcInhcIjogLTE1NTUuNSwgXCJ5XCI6IDI3LCBcInpvb21YXCI6IDAuMTQsIFwiem9vbVlcIjogMC4xNCwgXCJyb3RhdGlvblwiOiAwLjA1NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wMTQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJBIHN1cnZleSBvZiBncm91bmQgY29udGlndW91cyB0byB0aGUgSG9yc2UgQmFycmFja3MsIER1YmxpbiAtIHNob3dpbmcgTW9udHBlbGllciBIaWxsLCBCYXJyYWNrIFN0cmVldCwgUGFya2dhdGUgU3RyZWV0IGFuZCBlbnZpcm9ucyAoVGhvbWFzIFNoZXJyYXJkKSBEYXRlOiAxNzkwXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzkwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDE1XCIsIFwieFwiOiAtMTQxNC41LCBcInlcIjogMjksIFwiem9vbVhcIjogMC4xMTYsIFwiem9vbVlcIjogMC4xMTIsIFwicm90YXRpb25cIjogMC4wNzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDE1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQXJib3VyIEhpbGwsIFJveWFsIEJhcnJhY2tzIGFuZCB2aWNpbml0eS4gV2l0aCByZWZlcmVuY2UuIERhdGU6IDE3OTBcIixcblx0XHRcImRhdGVcIjogMTc5MFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAxNlwiLCBcInhcIjogLTg0NywgXCJ5XCI6IDIzMS41LCBcInpvb21YXCI6IDAuMDM4LCBcInpvb21ZXCI6IDAuMDM4LCBcInJvdGF0aW9uXCI6IDAuMDk1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTAxNi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCAtIEFycmFuIFF1YXksIFF1ZWVuIFN0cmVldCBEYXRlOjE3OTBcIixcblx0XHRcImRhdGVcIjogMTc5MCxcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMTdcIiwgXCJ4XCI6IC01NjQsIFwieVwiOiA0NDAsIFwiem9vbVhcIjogMC4wNjgsIFwiem9vbVlcIjogMC4wNiwgXCJyb3RhdGlvblwiOiAzLjM5LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTAxNy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkFycmFuIFF1YXksIENodXJjaCBTdHJlZXRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAxOFwiLCBcInhcIjogLTE5NCwgXCJ5XCI6IC0zOTUuNSwgXCJ6b29tWFwiOiAwLjEyLCBcInpvb21ZXCI6IDAuMTIsIFwicm90YXRpb25cIjogLTAuNjMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDE4LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIEJhcmxleSBmaWVsZHMgZXRjLiAoRG9yc2V0IFN0cmVldCkuIFBsYW4gb2Ygb3BlbmluZyBhIHN0cmVldCBmcm9tIFJ1dGxhbmQgU3F1YXJlIHRvIERvcnNldCBTdHJlZXQgLSAoUGFsYWNlIFJvdyBhbmQgR2FyZGluZXJzIFJvdykgLSBUaG9tYXMgU2hlcnJhcmQgRGF0ZTogMTc4OVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDI1XCIsIFwieFwiOiAtMTAxMCwgXCJ5XCI6IDEwNSwgXCJ6b29tWFwiOiAwLjEyLCBcInpvb21ZXCI6IDAuMTIsIFwicm90YXRpb25cIjogMC4xNiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wMjUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJCbGFja2hhbGwgUGxhY2UgLSBOZXcgU3RyZWV0IHRvIHRoZSBRdWF5XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNTdcIiwgXCJ4XCI6IC0yMjQsIFwieVwiOiAzMzAuNSwgXCJ6b29tWFwiOiAwLjA4NCwgXCJ6b29tWVwiOiAwLjA4NCwgXCJyb3RhdGlvblwiOiAyLjg2NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wNTcucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIHN0cmVldHMgYWJvdXQgTWFyeeKAmXMgQWJiZXkgYW5kIEJvb3QgTGFuZSAtIChPbGQgQmFuaykgRGF0ZTogMTgxMVwiLCBcblx0XHRcImRhdGVcIjogMTgxMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA2M1wiLCBcInhcIjogLTg4LjUsIFwieVwiOiAyNi41LCBcInpvb21YXCI6IDAuMywgXCJ6b29tWVwiOiAwLjMsIFwicm90YXRpb25cIjogLTIuMTQ1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTA2My5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkVsZXZhdGlvbiBvZiB0aGUgd2VzdCBmcm9udCBhbmQgcGxhbiBvZiBNb3VudGpveSBTcXVhcmUgbGFpZCBvdXQgb24gdGhlIHJpc2luZyBncm91bmQsIG5lYXIgR2Vvcmdl4oCZcyBDaHVyY2ggLSB0aGUgZXN0YXRlIG9mIHRoZSBSaWdodCBIb24uIEx1a2UgR2FyZGluZXIsIGFuZCBub3cgKDE3ODcpLCB0byBiZSBsZXQgZm9yIGJ1aWxkaW5nIC0gTG9yZCBNb3VudGpveeKAmXMgcGxhbi4gRGF0ZTogMTc4N1wiLCBcblx0XHRcImRhdGVcIjogMTc4N1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA4Ny0yXCIsIFwieFwiOiAtMTcyLjUsIFwieVwiOiAxNDE5LCBcInpvb21YXCI6IDAuMDg2LCBcInpvb21ZXCI6IDAuMDg2LCBcInJvdGF0aW9uXCI6IC0xLjY5NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wODctMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNhbWRlbiBTdHJlZXQgVXBwZXIgYW5kIENoYXJsb3R0ZSBTdHJlZXQgRGF0ZTogMTg0MVwiLCBcblx0XHRcImRhdGVcIjogMTg0MVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA5MFwiLCBcInhcIjogLTI2MSwgXCJ5XCI6IDUwNSwgXCJ6b29tWFwiOiAwLjA3NCwgXCJ6b29tWVwiOiAwLjA2NiwgXCJyb3RhdGlvblwiOiAtMC4yMywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wOTAucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDYXN0bGUgWWFyZCwgQ2FzdGxlIFN0cmVldCwgRGFtZSBTdHJlZXQsIFBhcmxpYW1lbnQgU3RyZWV0IGFuZCB2aWNpbml0eSBEYXRlOiAxNzY0XCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzY0XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTAwLTJcIiwgXCJ4XCI6IC01MjgsIFwieVwiOiA0NjQsIFwiem9vbVhcIjogMC4wNzgsIFwiem9vbVlcIjogMC4wNzgsIFwicm90YXRpb25cIjogLTAuMjcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTAwLTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcHJlbWlzZXMgdG8gYmUgdmFsdWVkIGJ5IEp1cnk7IENvY2sgSGlsbCwgTWljaGFlbOKAmXMgTGFuZSwgV2luZXRhdmVybiBTdHJlZXQsIEpvaG7igJlzIExhbmUsIENocmlzdGNodXJjaCwgUGF0cmljayBTdHJlZXQgYW5kIFBhdHJpY2vigJlzIENsb3NlIERhdGU6IDE4MTNcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MTNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMDNcIiwgXCJ4XCI6IDk5LjUsIFwieVwiOiA1NjYsIFwiem9vbVhcIjogMC4wNjIsIFwiem9vbVlcIjogMC4wNiwgXCJyb3RhdGlvblwiOiAtMy4xNTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTAzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIFNvdXRoIFNpZGUgb2YgQ29sbGVnZSBHcmVlbiBhbmQgdmljaW5pdHkgRGF0ZTogMTgwOFwiLFxuXHRcdFwiZGF0ZVwiOiAxODA4XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTQ5LTFcIiwgXCJ4XCI6IC0xMDkxLCBcInlcIjogNTE1LjUsIFwiem9vbVhcIjogMC4wNjIsIFwiem9vbVlcIjogMC4wNiwgXCJyb3RhdGlvblwiOiAwLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE0OS0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gSmFtZXPigJlzIEdhdGUsIEphbWVzIFN0cmVldCwgVGhvbWFzIFN0cmVldCBhbmQgV2F0bGluZyBTdHJlZXQuIE1yLiBHdWlubmVzc+KAmXMgUGxhY2UgRGF0ZTogMTg0NVwiLCBcblx0XHRcImRhdGVcIjogMTg0NVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE0OS0yXCIsIFwieFwiOiAtMTA3NC41LCBcInlcIjogNDg4LCBcInpvb21YXCI6IDAuMDQ0LCBcInpvb21ZXCI6IDAuMDQ4LCBcInJvdGF0aW9uXCI6IDAsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTQ5LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBKYW1lc+KAmXMgR2F0ZSwgSmFtZXMgU3RyZWV0LCBUaG9tYXMgU3RyZWV0IGFuZCBXYXRsaW5nIFN0cmVldC4gTXIuIEd1aW5uZXNz4oCZcyBQbGFjZSBEYXRlOiAxODQ1XCIsIFxuXHRcdFwiZGF0ZVwiOiAxODQ1XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjU0XCIsIFwieFwiOiAtNDM4LCBcInlcIjogLTE0MiwgXCJ6b29tWFwiOiAwLjExOCwgXCJ6b29tWVwiOiAwLjEyLCBcInJvdGF0aW9uXCI6IC0wLjQxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yNTQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgTWFiYm90IFN0cmVldCwgTW9udGdvbWVyeSBTdHJlZXQsIERvbWluaWNrIFN0cmVldCwgQ2hlcnJ5IExhbmUsIENyb3NzIExhbmUgYW5kIFR1cm4tYWdhaW4tTGFuZSBEYXRlOiAxODAxXCIsXG5cdFx0XCJkYXRlXCI6IDE4MDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xMDYtMVwiLCBcInhcIjogLTc1NywgXCJ5XCI6IDQ5NS41LCBcInpvb21YXCI6IDAuMjY1LCBcInpvb21ZXCI6IDAuMjY1LCBcInJvdGF0aW9uXCI6IC0wLjA3NCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTEwNi0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBzaG93aW5nIHByb3Bvc2VkIGltcHJvdmVtZW50cyB0byBiZSBtYWRlIGluIENvcm5tYXJrZXQsIEN1dHB1cnNlIFJvdywgTGFtYiBBbGxleSAtIEZyYW5jaXMgU3RyZWV0IC0gYW5kIGFuIGltcHJvdmVkIGVudHJhbmNlIGZyb20gS2V2aW4gU3RyZWV0IHRvIFNhaW50IFBhdHJpY2vigJlzIENhdGhlZHJhbCwgdGhyb3VnaCBNaXRyZSBBbGxleSBhbmQgYXQgSmFtZXPigJlzIEdhdGUuIERhdGU6IDE4NDUtNDYgXCIsXG5cdFx0XCJkYXRlXCI6IDE4NDVcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNDYtMVwiLCBcInhcIjogLTY4MywgXCJ5XCI6IDQ3MSwgXCJ6b29tWFwiOiAwLjA4MiwgXCJ6b29tWVwiOiAwLjA4MiwgXCJyb3RhdGlvblwiOiAtMC4xLFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTQ2LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgYW5kIHRyYWNpbmcgb2YgcHJlbWlzZXMgaW4gQ29ybm1hcmtldCwgQ3V0cHVyc2UgUm93IGFuZCB2aWNpbml0eSBEYXRlOiAxODQ5XCIsXG5cdFx0XCJkYXRlXCI6IDE4NDlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy02MDBcIiwgXCJ4XCI6IDEzOS41LCBcInlcIjogNzU4LCBcInpvb21YXCI6IDAuMDYyLCBcInpvb21ZXCI6IDAuMDYyLCBcInJvdGF0aW9uXCI6IC0wLjQxNSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTYwMC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjksXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiB0aGUgZ3JvdW5kIGV0Yy4sIG9mIHRoZSBNYW5zaW9uIEhvdXNlLCBEYXdzb24gU3RyZWV0IERhdGU6IDE3ODFcIixcblx0XHRcImRhdGVcIjogMTc4MVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM0OFwiLCBcInhcIjogLTEzNDUuNSwgXCJ5XCI6IDQ5MywgXCJ6b29tWFwiOiAwLjQsIFwiem9vbVlcIjogMC40NzgsIFwicm90YXRpb25cIjogLTAuMDc1LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzQ4LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHBhcnQgb2YgdGhlIENpdHkgb2YgRHVibGluIG5lYXIgdGhlIEdyYW5kIENhbmFsIC0gc2hvd2luZyBpbXByb3ZlbWVudHMgYW5kIGFwcHJvYWNoZXMgbWFkZSwgYW5kIHRob3NlIHByb3Bvc2VkIHRvIGJlIG1hZGU7IGFuZCB0aGUgc2l0dWF0aW9uIG9mIHRoZSBmb2xsb3dpbmcgc3RyZWV0cyB2aXo6IC0gQmFzb24gTGFuZTsgQ2FuYWwgUGxhY2U7IFBvcnRsYW5kIFN0cmVldDsgUmFpbnNmb3JkIFN0cmVldDsgQ3JhbmUgTGFuZTsgQmVsbHZpZXc7IFRob21hcyBDb3VydDsgSGFuYnVyeSBMYW5lOyBNZWF0aCBSb3c7IE1lYXRoIFN0cmVldDsgRWFybCBTdHJlZXQgV2VzdDsgV2FnZ29uIExhbmU7IENyYXdsZXlgcyBZYXJkOyBSb2JlcnQgU3RyZWV0OyBNYXJrZXQgU3RyZWV0OyBCb25kIFN0cmVldDsgQ2FuYWwgQmFuaywgTmV3cG9ydCBTdHJlZXQ7IE1hcnJvd2JvbmUgTGFuZSwgU3VtbWVyIFN0cmVldDsgQnJhaXRod2FpdGUgU3RyZWV0OyBQaW1ibGljbywgVHJpcG9sbyAoc2l0ZSBvZiBPbGQgQ291cnQgSG91c2UpLCBuZWFyIFRob21hcyBDb3VydDsgQ29sZSBBbGxleTsgU3dpZnRzIEFsbGV5OyBDcm9zdGljayBBbGxleTsgRWxib3cgTGFuZTsgVXBwZXIgQ29vbWJlIGFuZCBUZW50ZXIncyBGaWVsZHMgRGF0ZTogMTc4N1wiLFxuXHRcdFwiZGF0ZVwiOiAxNzg3XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDMzLTJcIiwgXCJ4XCI6IC01MzYuNSwgXCJ5XCI6IDg3MC41LCBcInpvb21YXCI6IDAuMDU4LCBcInpvb21ZXCI6IDAuMDU4LCBcInJvdGF0aW9uXCI6IC0wLjAxLFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDMzLTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBDb29tYmUsIEZyYW5jaXMgU3RyZWV0LCBOZXcgUm93LCBDcm9zcyBQb2RkbGUgKG5vdyBEZWFuIFN0cmVldCksIFRocmVlLVN0b25lLUFsbGV5IChub3cgdGhlIGxvd2VyIGVuZCBvZiBOZXcgU3RyZWV0KSwgUGF0cmljayBTdHJlZXQsIFBhdHJpY2vigJlzIENsb3NlLCBLZXZpbiBTdHJlZXQgYW5kIE1pdHJlIEFsbGV5IERhdGU6IDE4MjQtMjhcIixcblx0XHRcImRhdGVcIjogMTgyNFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA1OVwiLCBcInhcIjogLTUyNy41LCBcInlcIjogLTExOS41LCBcInpvb21YXCI6IDAuMDcsIFwiem9vbVlcIjogMC4wNywgXCJyb3RhdGlvblwiOiAtMC4wOCxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTA1OS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjksXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkdyb3VuZCBwbGFuIG9mIExpbmVuIEhhbGxcIlxuXHR9XG5dXG4iLCJpbXBvcnQgeyBJbmRleGVyIH0gZnJvbSBcIi4vaW5kZXhlclwiO1xuaW1wb3J0IHsgR3JpZEluZGV4ZXIgfSBmcm9tIFwiLi9ncmlkaW5kZXhlclwiO1xuaW1wb3J0IHsgQ2FudmFzTGF5ZXIgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvbGF5ZXJcIjtcbmltcG9ydCB7IENvbnRhaW5lckxheWVyIH0gZnJvbSBcIi4uL2dyYXBoaWNzL2NvbnRhaW5lcmxheWVyXCI7XG5cbmV4cG9ydCBjbGFzcyBDb250YWluZXJJbmRleCBpbXBsZW1lbnRzIEluZGV4ZXIge1xuXG5cdGNvbnN0cnVjdG9yKFxuXHQgIHJlYWRvbmx5IGNvbnRhaW5lcjogQ29udGFpbmVyTGF5ZXIsIFxuXHQgIHJlYWRvbmx5IG5hbWU6IHN0cmluZyxcblx0ICByZWFkb25seSBpbmRleGVyOiBJbmRleGVyID0gbmV3IEdyaWRJbmRleGVyKDI1Nikpe1xuXHRcdGZvciAobGV0IGxheWVyIG9mIGNvbnRhaW5lci5sYXllcnMoKSl7XG5cdFx0XHR0aGlzLmFkZChsYXllcik7XG5cdFx0fVxuXHR9XG5cblx0Z2V0TGF5ZXJzKHg6IG51bWJlciwgeTogbnVtYmVyKTogQXJyYXk8Q2FudmFzTGF5ZXI+e1xuXHRcdGlmICh0aGlzLmNvbnRhaW5lci5pc1Zpc2libGUoKSl7XG5cdFx0XHRjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyBcIiBpcyB2aXNpYmxlIFwiKTtcblx0XHRcdHJldHVybiB0aGlzLmluZGV4ZXIuZ2V0TGF5ZXJzKHgsIHkpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHJldHVybiBbXTtcblx0XHR9XG5cdH1cblxuXHRhZGQoY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyKTogdm9pZCB7XG5cdFx0dGhpcy5pbmRleGVyLmFkZChjYW52YXNMYXllcik7XG5cdH1cblxufSIsImltcG9ydCB7IENhbnZhc0xheWVyIH0gZnJvbSBcIi4uL2dyYXBoaWNzL2xheWVyXCI7XG5pbXBvcnQgeyBDb25zb2xlTG9nZ2VyLCBMb2dnZXIgfSBmcm9tIFwiLi4vbG9nZ2luZy9sb2dnZXJcIjtcbmltcG9ydCB7IEluZGV4ZXIgfSBmcm9tIFwiLi9pbmRleGVyXCI7XG5cbmNsYXNzIEdyaWRNYXAge1xuXHRyZWFkb25seSBsYXllck1hcDogTWFwPHN0cmluZywgQXJyYXk8Q2FudmFzTGF5ZXI+PlxuXG5cdGNvbnN0cnVjdG9yKCl7XG5cdFx0dGhpcy5sYXllck1hcCA9IG5ldyBNYXA8c3RyaW5nLCBBcnJheTxDYW52YXNMYXllcj4+KCk7XG5cdH0gXG5cblx0YWRkKHg6IG51bWJlciwgeTogbnVtYmVyLCBsYXllcjogQ2FudmFzTGF5ZXIpe1xuXHRcdHZhciBsYXllclZhbHVlczogQXJyYXk8Q2FudmFzTGF5ZXI+O1xuXHRcdGlmICh0aGlzLmxheWVyTWFwLmhhcyh0aGlzLmtleSh4LCB5KSkpe1xuXHRcdFx0bGF5ZXJWYWx1ZXMgPSB0aGlzLmxheWVyTWFwLmdldCh0aGlzLmtleSh4LCB5KSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxheWVyVmFsdWVzID0gW107XG5cdFx0fVxuXHRcdGxheWVyVmFsdWVzLnB1c2gobGF5ZXIpO1xuXHRcdHRoaXMubGF5ZXJNYXAuc2V0KHRoaXMua2V5KHgsIHkpLCBsYXllclZhbHVlcyk7XG5cdH1cblxuXHRnZXQoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBBcnJheTxDYW52YXNMYXllcj57XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXAuZ2V0KHRoaXMua2V5KHgsIHkpKTtcblx0fVxuXG5cdGhhcyh4OiBudW1iZXIsIHk6IG51bWJlcik6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLmxheWVyTWFwLmhhcyh0aGlzLmtleSh4LCB5KSk7XG5cdH1cblxuXHRwcml2YXRlIGtleSh4OiBudW1iZXIsIHk6IG51bWJlcik6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHggKyBcIl9cIiArIHk7XG5cdH1cblxufVxuXG5leHBvcnQgY2xhc3MgR3JpZEluZGV4ZXIgaW1wbGVtZW50cyBJbmRleGVyIHtcblxuXHRwcml2YXRlIGxvZ2dlcjogTG9nZ2VyO1xuXHRwcml2YXRlIGNhbnZhc01hcCA9IG5ldyBHcmlkTWFwKCk7XG5cblx0Y29uc3RydWN0b3IocmVhZG9ubHkgZ3JpZFdpZHRoOiBudW1iZXIsIFxuXHQgIHJlYWRvbmx5IGdyaWRIZWlnaHQ6IG51bWJlciA9IGdyaWRXaWR0aCl7XG5cdFx0dGhpcy5sb2dnZXIgPSBuZXcgQ29uc29sZUxvZ2dlcigpO1xuXHR9XG5cblx0c2V0TG9nZ2VyKGxvZ2dlcjogTG9nZ2VyKTogdm9pZCB7XG5cdFx0dGhpcy5sb2dnZXIgPSBsb2dnZXI7XG5cdH1cblxuXHRnZXRMYXllcnMoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBBcnJheTxDYW52YXNMYXllcj4ge1xuXHRcdGxldCBncmlkWCA9IE1hdGguZmxvb3IoeCAvIHRoaXMuZ3JpZFdpZHRoKTtcblx0XHRsZXQgZ3JpZFkgPSBNYXRoLmZsb29yKHkgLyB0aGlzLmdyaWRIZWlnaHQpO1xuXG5cdFx0dGhpcy5sb2dnZXIubG9nKFwiZ3JpZCB4eSBcIiArIGdyaWRYICsgXCIsIFwiICsgZ3JpZFkpO1xuXG5cdFx0aWYgKHRoaXMuY2FudmFzTWFwLmhhcyhncmlkWCwgZ3JpZFkpKXtcblx0XHRcdHJldHVybiB0aGlzLmNhbnZhc01hcC5nZXQoZ3JpZFgsIGdyaWRZKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRyZXR1cm4gW107XG5cdFx0fVxuXHR9XG5cblx0YWRkKGNhbnZhc0xheWVyOiBDYW52YXNMYXllcil7XG5cblx0XHRsZXQgZGltZW5zaW9uID0gY2FudmFzTGF5ZXIuZ2V0RGltZW5zaW9uKCk7XG5cblx0XHRsZXQgeE1pbiA9IE1hdGguZmxvb3IoZGltZW5zaW9uLnggLyB0aGlzLmdyaWRXaWR0aCk7XG5cdFx0bGV0IHhNYXggPSBNYXRoLmZsb29yKChkaW1lbnNpb24ueCArIGRpbWVuc2lvbi53KSAvIHRoaXMuZ3JpZFdpZHRoKTtcblxuXHRcdGxldCB5TWluID0gTWF0aC5mbG9vcihkaW1lbnNpb24ueSAvIHRoaXMuZ3JpZEhlaWdodCk7XG5cdFx0bGV0IHlNYXggPSBNYXRoLmZsb29yKChkaW1lbnNpb24ueSArIGRpbWVuc2lvbi5oKSAvIHRoaXMuZ3JpZEhlaWdodCk7XG5cblx0XHRmb3IgKHZhciB4ID0geE1pbjsgeDw9eE1heDsgeCsrKXtcblx0XHRcdGZvciAodmFyIHkgPSB5TWluOyB5PD15TWF4OyB5Kyspe1xuXHRcdFx0XHR0aGlzLmNhbnZhc01hcC5hZGQoeCwgeSwgY2FudmFzTGF5ZXIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHNob3dJbmRpY2VzKGNhbnZhc0xheWVyOiBDYW52YXNMYXllcik6IHZvaWQge1xuXG5cdFx0bGV0IGRpbWVuc2lvbiA9IGNhbnZhc0xheWVyLmdldERpbWVuc2lvbigpO1xuXG5cdFx0bGV0IHhNaW4gPSBNYXRoLmZsb29yKGRpbWVuc2lvbi54IC8gdGhpcy5ncmlkV2lkdGgpO1xuXHRcdGxldCB4TWF4ID0gTWF0aC5mbG9vcigoZGltZW5zaW9uLnggKyBkaW1lbnNpb24udykgLyB0aGlzLmdyaWRXaWR0aCk7XG5cblx0XHRsZXQgeU1pbiA9IE1hdGguZmxvb3IoZGltZW5zaW9uLnkgLyB0aGlzLmdyaWRIZWlnaHQpO1xuXHRcdGxldCB5TWF4ID0gTWF0aC5mbG9vcigoZGltZW5zaW9uLnkgKyBkaW1lbnNpb24uaCkgLyB0aGlzLmdyaWRIZWlnaHQpO1xuXG5cdFx0dmFyIG1lc3NhZ2UgPSBcImdyaWQ6IFtcIlxuXG5cdFx0Zm9yICh2YXIgeCA9IHhNaW47IHg8PXhNYXg7IHgrKyl7XG5cdFx0XHRmb3IgKHZhciB5ID0geU1pbjsgeTw9eU1heDsgeSsrKXtcblx0XHRcdFx0bWVzc2FnZSA9IG1lc3NhZ2UgKyBcIltcIiArIHggKyBcIiwgXCIgKyB5ICsgXCJdXCI7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bWVzc2FnZSA9IG1lc3NhZ2UgKyBcIl1cIjtcblxuXHRcdHRoaXMubG9nZ2VyLmxvZyhtZXNzYWdlKTtcblx0fVxufVxuIiwiaW1wb3J0IHsgQ2FudmFzTGF5ZXIgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvbGF5ZXJcIjtcbmltcG9ydCB7IENhbnZhc1ZpZXcgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgVGh1bWIgfSBmcm9tIFwiLi4vZ3JhcGhpY3Mvc3RhdGljXCI7XG5pbXBvcnQgeyBJbWFnZUNvbnRyb2xsZXIgfSBmcm9tIFwiLi9pbWFnZWNvbnRyb2xsZXJcIjtcblxuZXhwb3J0IGNsYXNzIENhbnZhc0xheWVyVmlldyB7XG5cblx0cmVhZG9ubHkgY29udGFpbmVyOiBIVE1MU3BhbkVsZW1lbnQ7XG5cblx0Y29uc3RydWN0b3IoXG5cdCAgbGF5ZXI6IENhbnZhc0xheWVyLCBcblx0ICBjYW52YXNWaWV3OiBDYW52YXNWaWV3LCBcblx0ICBpbWFnZUNvbnRyb2xsZXI6IEltYWdlQ29udHJvbGxlclxuXHQpe1xuXG5cdFx0dGhpcy5jb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcblx0XHR0aGlzLmNvbnRhaW5lci5jbGFzc05hbWUgPSBcImxheWVyXCI7XG5cblx0XHRsZXQgZWRpdGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuXG5cdFx0bGV0IGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG5cdFx0bGFiZWwuaW5uZXJIVE1MID0gbGF5ZXIubmFtZTtcblxuXHRcdGxldCB2aXNpYmlsaXR5OiBIVE1MSW5wdXRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuXHRcdHZpc2liaWxpdHkudHlwZSA9IFwiY2hlY2tib3hcIjtcblx0XHR2aXNpYmlsaXR5LmNoZWNrZWQgPSB0cnVlO1xuXG5cdFx0bGV0IGVkaXQ6IEhUTUxJbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG5cdFx0ZWRpdC50eXBlID0gXCJyYWRpb1wiO1xuXHRcdGVkaXQubmFtZSA9IFwiZWRpdFwiO1xuXG5cdFx0dmlzaWJpbGl0eS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRpZiAodGhpcy5jaGVja2VkKXtcblx0XHRcdFx0bGF5ZXIuc2V0VmlzaWJsZSh0cnVlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGxheWVyLnNldFZpc2libGUoZmFsc2UpO1xuXHRcdFx0fVxuXHRcdFx0Y2FudmFzVmlldy5kcmF3KCk7XG5cdFx0fSk7XG5cblx0XHRlZGl0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdGlmICh0aGlzLmNoZWNrZWQpe1xuXHRcdFx0XHRpbWFnZUNvbnRyb2xsZXIuc2V0Q2FudmFzTGF5ZXIobGF5ZXIpO1xuXHRcdFx0fSBcblx0XHRcdGNhbnZhc1ZpZXcuZHJhdygpO1xuXHRcdH0pO1xuXG5cdFx0dmFyIHRodW1iID0gPFRodW1iPiBsYXllcjtcblxuXHRcdGxldCBjYW52YXNJbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG5cdFx0bGV0IHRodW1iQ3R4ID0gY2FudmFzSW1hZ2UuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHRcdHRodW1iLmRyYXdUaHVtYih0aHVtYkN0eCwgMjAwLCAyMDApO1xuXG5cdFx0bGV0IHRodW1ibmFpbDogSFRNTEltYWdlRWxlbWVudCA9IG5ldyBJbWFnZSgpO1xuXHRcdHRodW1ibmFpbC5zcmMgPSBjYW52YXNJbWFnZS50b0RhdGFVUkwoKTtcblx0XHR0aHVtYm5haWwuY2xhc3NOYW1lID0gXCJ0aHVtYm5haWxcIjtcblx0XHR0aHVtYm5haWwudGl0bGUgPSBsYXllci5kZXNjcmlwdGlvbjtcblxuXHRcdGVkaXRkaXYuYXBwZW5kQ2hpbGQobGFiZWwpO1xuXHRcdGVkaXRkaXYuYXBwZW5kQ2hpbGQodmlzaWJpbGl0eSk7XG5cdFx0ZWRpdGRpdi5hcHBlbmRDaGlsZChlZGl0KTtcblx0XHR0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChlZGl0ZGl2KTtcblx0XHR0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aHVtYm5haWwpO1xuXHR9XG5cbn0iLCJpbXBvcnQge0NhbnZhc1ZpZXcsIERpc3BsYXlFbGVtZW50fSBmcm9tIFwiLi4vZ3JhcGhpY3MvY2FudmFzdmlld1wiO1xuaW1wb3J0IHtDYW52YXNMYXllcn0gZnJvbSBcIi4uL2dyYXBoaWNzL2xheWVyXCI7XG5pbXBvcnQge1JlY3RMYXllcn0gZnJvbSBcIi4uL2dyYXBoaWNzL3N0YXRpY1wiO1xuaW1wb3J0IHtHcmlkSW5kZXhlcn0gZnJvbSBcIi4uL2luZGV4L2dyaWRpbmRleGVyXCI7XG5pbXBvcnQge0VsZW1lbnRMb2dnZXJ9IGZyb20gXCIuLi9sb2dnaW5nL2xvZ2dlclwiO1xuXG5leHBvcnQgY2xhc3MgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIHJlYWRvbmx5IGRpc3BsYXlFbGVtZW50OiBEaXNwbGF5RWxlbWVudCwgIHB1YmxpYyBtb2Q6IHN0cmluZyA9IFwidlwiKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLnByZXNzZWQoY2FudmFzVmlldywgZSAgYXMgS2V5Ym9hcmRFdmVudCkpO1xuICAgIH1cblxuICAgIHByZXNzZWQoY2FudmFzVmlldzogQ2FudmFzVmlldywgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICAgICAgICBjYXNlIHRoaXMubW9kOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidG9nZ2xlIHZpc2libGVcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5RWxlbWVudC5zZXRWaXNpYmxlKCF0aGlzLmRpc3BsYXlFbGVtZW50LmlzVmlzaWJsZSgpKTtcbiAgICAgICAgICAgICAgICBjYW52YXNWaWV3LmRyYXcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlQ29udHJvbGxlciB7XG5cbiAgICBwcml2YXRlIGNhbnZhc0xheWVyOiBDYW52YXNMYXllcjtcbiAgICBwcml2YXRlIGxheWVyT3V0bGluZTogUmVjdExheWVyO1xuICAgIHByaXZhdGUgZWRpdEluZm9QYW5lOiBIVE1MRWxlbWVudDtcblxuICAgIHByaXZhdGUgaW5kZXhlcjogR3JpZEluZGV4ZXIgPSBuZXcgR3JpZEluZGV4ZXIoMjU2KTtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgY2FudmFzVmlldzogQ2FudmFzVmlldywgY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLnByZXNzZWQoY2FudmFzVmlldywgZSAgYXMgS2V5Ym9hcmRFdmVudCkpO1xuICAgICAgICB0aGlzLmNhbnZhc0xheWVyID0gY2FudmFzTGF5ZXI7XG4gICAgfVxuXG4gICAgc2V0Q2FudmFzTGF5ZXIoY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyKXtcbiAgICAgICAgdGhpcy5jYW52YXNMYXllciA9IGNhbnZhc0xheWVyO1xuXG4gICAgICAgIHRoaXMuaW5kZXhlci5zaG93SW5kaWNlcyhjYW52YXNMYXllcik7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyh0aGlzLmNhbnZhc1ZpZXcpO1xuICAgIH1cblxuICAgIHNldEVkaXRJbmZvUGFuZShlZGl0SW5mb1BhbmU6IEhUTUxFbGVtZW50KXtcbiAgICAgICAgdGhpcy5lZGl0SW5mb1BhbmUgPSBlZGl0SW5mb1BhbmU7XG4gICAgfVxuXG4gICAgc2V0TGF5ZXJPdXRsaW5lKGxheWVyT3V0bGluZTogUmVjdExheWVyKXtcbiAgICAgICAgdGhpcy5sYXllck91dGxpbmUgPSBsYXllck91dGxpbmU7XG4gICAgfVxuXG4gICAgcHJlc3NlZChjYW52YXNWaWV3OiBDYW52YXNWaWV3LCBldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInByZXNzZWRcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LmtleSk7XG5cbiAgICAgICAgbGV0IG11bHRpcGxpZXIgPSAxO1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICAgICAgICBjYXNlIFwiYVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIueCA9IHRoaXMuY2FudmFzTGF5ZXIueCAtIDAuNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiQVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIueCA9IHRoaXMuY2FudmFzTGF5ZXIueCAtIDUgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnggPSB0aGlzLmNhbnZhc0xheWVyLnggKyAwLjUgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIkRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnggPSB0aGlzLmNhbnZhc0xheWVyLnggKyA1ICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJ3XCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci55ID0gdGhpcy5jYW52YXNMYXllci55IC0gMC41ICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJXXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci55ID0gdGhpcy5jYW52YXNMYXllci55IC0gNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7ICAgIFxuICAgICAgICAgICAgY2FzZSBcInNcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnkgPSB0aGlzLmNhbnZhc0xheWVyLnkgKyAwLjUgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlNcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnkgPSB0aGlzLmNhbnZhc0xheWVyLnkgKyA1ICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJlXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiA9IHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gLSAwLjAwNTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJFXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiA9IHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gLSAwLjA1O1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInFcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uID0gdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiArIDAuMDA1O1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlFcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uID0gdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiArIDAuMDU7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwieFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIuem9vbVggPSB0aGlzLmNhbnZhc0xheWVyLnpvb21YIC0gMC4wMDIgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlhcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnpvb21YID0gdGhpcy5jYW52YXNMYXllci56b29tWCArIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJ6XCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci56b29tWSA9IHRoaXMuY2FudmFzTGF5ZXIuem9vbVkgLSAwLjAwMiAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiWlwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIuem9vbVkgPSB0aGlzLmNhbnZhc0xheWVyLnpvb21ZICsgMC4wMDIgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImNcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnNldFZpc2libGUoIXRoaXMuY2FudmFzTGF5ZXIudmlzaWJsZSk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiVFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIub3BhY2l0eSA9IE1hdGgubWluKDEuMCwgdGhpcy5jYW52YXNMYXllci5vcGFjaXR5ICsgMC4xKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJ0XCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5vcGFjaXR5ID0gTWF0aC5tYXgoMCwgdGhpcy5jYW52YXNMYXllci5vcGFjaXR5IC0gMC4xKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8gY29kZS4uLlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGluZm86IHN0cmluZyA9ICdcIm5hbWVcIjogJyArIHRoaXMuY2FudmFzTGF5ZXIubmFtZSArXG4gICAgICAgICAgICAgICcgXCJ4XCI6ICcgKyB0aGlzLmNhbnZhc0xheWVyLnggK1xuICAgICAgICAgICAgICAnLCBcInlcIjogJyArIHRoaXMuY2FudmFzTGF5ZXIueSArXG4gICAgICAgICAgICAgICcsIFwiem9vbVhcIjogJysgdGhpcy5jYW52YXNMYXllci56b29tWCArIFxuICAgICAgICAgICAgICAnLCBcInpvb21ZXCI6ICcgKyB0aGlzLmNhbnZhc0xheWVyLnpvb21ZICsgXG4gICAgICAgICAgICAgICcsIFwicm90YXRpb25cIjogJysgdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbjtcblxuICAgICAgICBpZiAodGhpcy5lZGl0SW5mb1BhbmUgIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHRoaXMuZWRpdEluZm9QYW5lLmlubmVySFRNTCA9IGluZm87XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhpbmZvKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB1cGRhdGVDYW52YXMoY2FudmFzVmlldzogQ2FudmFzVmlldykge1xuXG4gICAgICAgIGlmICh0aGlzLmxheWVyT3V0bGluZSAhPSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgbGV0IG5ld0RpbWVuc2lvbiA9IHRoaXMuY2FudmFzTGF5ZXIuZ2V0RGltZW5zaW9uKCk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiaW1hZ2Ugb3V0bGluZSBcIiArIG5ld0RpbWVuc2lvbik7XG4gICAgICAgICAgICB0aGlzLmxheWVyT3V0bGluZS51cGRhdGVEaW1lbnNpb24obmV3RGltZW5zaW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgIH1cblxufTsiLCJpbXBvcnQgeyBDYW52YXNWaWV3IH0gZnJvbSBcIi4uL2dyYXBoaWNzL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IENhbnZhc0xheWVyIH0gZnJvbSBcIi4uL2dyYXBoaWNzL2xheWVyXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuaW1wb3J0IHsgTW91c2VDb250cm9sbGVyIH0gZnJvbSBcIi4vdmlld2NvbnRyb2xsZXJcIjtcbmltcG9ydCB7IEluZGV4ZXIgfSBmcm9tIFwiLi4vaW5kZXgvaW5kZXhlclwiO1xuaW1wb3J0IHsgTG9nZ2VyLCBDb25zb2xlTG9nZ2VyIH0gZnJvbSBcIi4uL2xvZ2dpbmcvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IEltYWdlQ29udHJvbGxlciB9IGZyb20gXCIuL2ltYWdlY29udHJvbGxlclwiO1xuaW1wb3J0IHsgSW5kZXhWaWV3IH0gZnJvbSBcIi4vaW5kZXh2aWV3XCI7XG5pbXBvcnQgeyBDYW52YXNMYXllclZpZXcgfSBmcm9tIFwiLi9jYW52YXNsYXllcnZpZXdcIjtcblxuZXhwb3J0IGNsYXNzIEluZGV4Q29udHJvbGxlciBleHRlbmRzIE1vdXNlQ29udHJvbGxlciB7XG5cblx0cHJpdmF0ZSBsb2dnZXI6IExvZ2dlcjtcblx0cHJpdmF0ZSBpbmRleGVyczogQXJyYXk8SW5kZXhlcj47XG5cdHByaXZhdGUgbWVudTogSFRNTEVsZW1lbnQ7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgIHJlYWRvbmx5IGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsXG4gICAgICByZWFkb25seSBpbWFnZUNvbnRyb2xsZXI6IEltYWdlQ29udHJvbGxlclxuICAgICkge1xuXG4gICAgXHRzdXBlcigpO1xuXG4gICAgXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmNsaWNrZWQoZSAgYXMgTW91c2VFdmVudCkpO1xuXG4gICAgXHR0aGlzLmluZGV4ZXJzID0gW107XG4gICAgXHR0aGlzLmxvZ2dlciA9IG5ldyBDb25zb2xlTG9nZ2VyKCk7XG4gICAgfVxuXG4gICAgc2V0TG9nZ2luZyhsb2dnZXI6IExvZ2dlcil7XG4gICAgXHR0aGlzLmxvZ2dlciA9IGxvZ2dlcjtcbiAgICB9XG5cbiAgICBzZXRNZW51KG1lbnU6IEhUTUxFbGVtZW50KXtcbiAgICBcdHRoaXMubWVudSA9IG1lbnU7XG4gICAgfVxuXG4gICAgYWRkSW5kZXhlcihpbmRleGVyOiBJbmRleGVyKXtcbiAgICBcdHRoaXMuaW5kZXhlcnMucHVzaChpbmRleGVyKTtcbiAgICB9XG5cbiAgICBjbGlja2VkKGU6IE1vdXNlRXZlbnQpe1xuICAgIFx0bGV0IHBvaW50ICA9IHRoaXMubW91c2VQb3NpdGlvbihlLCB0aGlzLmNhbnZhc1ZpZXcuY2FudmFzRWxlbWVudCk7XG5cbiAgICBcdGxldCB3b3JsZFBvaW50ID0gdGhpcy5jYW52YXNWaWV3LmdldEJhc2VQb2ludChcbiAgICBcdFx0bmV3IFBvaW50MkQocG9pbnRbMF0sIHBvaW50WzFdKSk7XG5cbiAgICBcdHZhciBsYXllcnM6IEFycmF5PENhbnZhc0xheWVyPiA9IFtdO1xuXG4gICAgXHRmb3IgKGxldCBpbmRleGVyIG9mIHRoaXMuaW5kZXhlcnMpIHtcbiAgICBcdFx0bGV0IG5ld0xheWVycyA9IHRoaXMuZmlsdGVyVmlzaWJsZShcbiAgICBcdFx0XHRpbmRleGVyLmdldExheWVycyh3b3JsZFBvaW50LngsIHdvcmxkUG9pbnQueSkpO1xuICAgIFx0XHRsYXllcnMgPSBsYXllcnMuY29uY2F0KG5ld0xheWVycyk7XG4gICAgXHR9XG5cbiAgICBcdGlmICh0aGlzLm1lbnUgIT0gdW5kZWZpbmVkKXtcbiAgICBcdFx0bGV0IGxheWVyVmlldyA9IG5ldyBJbmRleFZpZXcodGhpcy5tZW51LCB0aGlzLmNhbnZhc1ZpZXcsIFxuICAgIFx0XHRcdHRoaXMuaW1hZ2VDb250cm9sbGVyKTtcbiAgICBcdFx0bGF5ZXJWaWV3LnNldEVsZW1lbnRzKGxheWVycyk7XG4gICAgXHR9XG4gICAgfVxuXG5cdHByaXZhdGUgZmlsdGVyVmlzaWJsZShsYXllcnM6IEFycmF5PENhbnZhc0xheWVyPil7XG5cdFx0cmV0dXJuIGxheWVycy5maWx0ZXIoZnVuY3Rpb24obGF5ZXIpIHsgXG5cdFx0XHRyZXR1cm4gbGF5ZXIuaXNWaXNpYmxlKCk7XG5cdFx0fSk7XG5cdH1cblxufSIsImltcG9ydCB7IENhbnZhc0xheWVyIH0gZnJvbSBcIi4uL2dyYXBoaWNzL2xheWVyXCI7XG5pbXBvcnQgeyBDYW52YXNWaWV3IH0gZnJvbSBcIi4uL2dyYXBoaWNzL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IENhbnZhc0xheWVyVmlldyB9IGZyb20gXCIuL2NhbnZhc2xheWVydmlld1wiO1xuaW1wb3J0IHsgSW1hZ2VDb250cm9sbGVyIH0gZnJvbSBcIi4vaW1hZ2Vjb250cm9sbGVyXCI7XG5cbmV4cG9ydCBjbGFzcyBJbmRleFZpZXcge1xuXG5cdGNvbnN0cnVjdG9yKFxuXHQgIHJlYWRvbmx5IHZpZXdFbGVtZW50OiBIVE1MRWxlbWVudCwgXG5cdCAgcmVhZG9ubHkgY2FudmFzVmlldzogQ2FudmFzVmlldyxcblx0ICByZWFkb25seSBpbWFnZUNvbnRyb2xsZXI6IEltYWdlQ29udHJvbGxlclxuXHQpe31cblx0XG5cdHNldEVsZW1lbnRzKGNhbnZhc0VsZW1lbnRzOiBBcnJheTxDYW52YXNMYXllcj4pOiB2b2lkIHtcblx0XHR0aGlzLmNsZWFyKCk7XG5cdFx0XG5cdFx0Zm9yIChsZXQgY2FudmFzTGF5ZXIgb2YgY2FudmFzRWxlbWVudHMpe1xuXHRcdFx0bGV0IGxheWVyVmlldyA9IG5ldyBDYW52YXNMYXllclZpZXcoY2FudmFzTGF5ZXIsIHRoaXMuY2FudmFzVmlldywgXG5cdFx0XHRcdHRoaXMuaW1hZ2VDb250cm9sbGVyKTtcblx0XHRcdHRoaXMudmlld0VsZW1lbnQuYXBwZW5kQ2hpbGQobGF5ZXJWaWV3LmNvbnRhaW5lcik7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBjbGVhcigpOiBib29sZWFuIHtcblx0XHRsZXQgY2hpbGRyZW4gPSB0aGlzLnZpZXdFbGVtZW50LmNoaWxkcmVuO1xuXHRcdGxldCBpbml0aWFsTGVuZ3RoID0gY2hpbGRyZW4ubGVuZ3RoO1xuXG5cdFx0d2hpbGUgKGNoaWxkcmVuLmxlbmd0aCA+IDApIHtcblx0XHRcdGNoaWxkcmVuWzBdLnJlbW92ZSgpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cbn0iLCJpbXBvcnQgeyBDb250YWluZXJMYXllck1hbmFnZXIgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvbGF5ZXJtYW5hZ2VyXCI7XG5pbXBvcnQgeyBDYW52YXNWaWV3IH0gZnJvbSBcIi4uL2dyYXBoaWNzL2NhbnZhc3ZpZXdcIjtcblxuZXhwb3J0IGNsYXNzIExheWVyQ29udHJvbGxlciB7XG5cblx0cHJpdmF0ZSBtb2Q6IHN0cmluZyA9IFwiaVwiO1xuXG5cdGNvbnN0cnVjdG9yKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIHJlYWRvbmx5IGNvbnRhaW5lckxheWVyTWFuYWdlcjogQ29udGFpbmVyTGF5ZXJNYW5hZ2VyKXtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5wcmVzc2VkKGNhbnZhc1ZpZXcsIGUgIGFzIEtleWJvYXJkRXZlbnQpKTtcblx0fVxuXG5cdHByZXNzZWQoY2FudmFzVmlldzogQ2FudmFzVmlldywgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgICAgICAgICAgY2FzZSB0aGlzLm1vZDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInRvZ2dsZSB2aXNpYmxlXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29udGFpbmVyTGF5ZXJNYW5hZ2VyLnRvZ2dsZVZpc2liaWxpdHkoZmFsc2UpO1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgVmlld1RyYW5zZm9ybSB9IGZyb20gXCIuLi9ncmFwaGljcy92aWV3XCI7XG5pbXBvcnQgeyBDYW52YXNWaWV3IH0gZnJvbSBcIi4uL2dyYXBoaWNzL2NhbnZhc3ZpZXdcIjtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE1vdXNlQ29udHJvbGxlciB7XG5cbiAgICBtb3VzZVBvc2l0aW9uKGV2ZW50OiBNb3VzZUV2ZW50LCB3aXRoaW46IEhUTUxFbGVtZW50KTogQXJyYXk8bnVtYmVyPiB7XG4gICAgICAgIGxldCBtX3Bvc3ggPSBldmVudC5jbGllbnRYICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0XG4gICAgICAgICAgICAgICAgICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQ7XG4gICAgICAgIGxldCBtX3Bvc3kgPSBldmVudC5jbGllbnRZICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3BcbiAgICAgICAgICAgICAgICAgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuXG4gICAgICAgIHZhciBlX3Bvc3ggPSAwO1xuICAgICAgICB2YXIgZV9wb3N5ID0gMDtcblxuICAgICAgICBpZiAod2l0aGluLm9mZnNldFBhcmVudCl7XG4gICAgICAgICAgICBkbyB7IFxuICAgICAgICAgICAgICAgIGVfcG9zeCArPSB3aXRoaW4ub2Zmc2V0TGVmdDtcbiAgICAgICAgICAgICAgICBlX3Bvc3kgKz0gd2l0aGluLm9mZnNldFRvcDtcbiAgICAgICAgICAgIH0gd2hpbGUgKHdpdGhpbiA9IDxIVE1MRWxlbWVudD53aXRoaW4ub2Zmc2V0UGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBbbV9wb3N4IC0gZV9wb3N4LCBtX3Bvc3kgLSBlX3Bvc3ldO1xuICAgIH1cblxufVxuXG5leHBvcnQgY2xhc3MgVmlld0NvbnRyb2xsZXIgZXh0ZW5kcyBNb3VzZUNvbnRyb2xsZXIge1xuXG5cdHJlY29yZDogYm9vbGVhbjtcblx0bW92ZTogbnVtYmVyID0gMTtcblxuXHRwcml2YXRlIHhQcmV2aW91czogbnVtYmVyO1xuXHRwcml2YXRlIHlQcmV2aW91czogbnVtYmVyO1xuXG5cdGNvbnN0cnVjdG9yKHZpZXdUcmFuc2Zvcm06IFZpZXdUcmFuc2Zvcm0sIFxuICAgICAgICByZWFkb25seSBkcmFnRWxlbWVudDogSFRNTEVsZW1lbnQsIHJlYWRvbmx5IGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcpIHtcblxuICAgIFx0c3VwZXIoKTtcbiAgICBcdGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3VHJhbnNmb3JtKSk7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybSkpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3VHJhbnNmb3JtKSk7XG4gICAgICAgIGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMucmVjb3JkID0gZmFsc2UpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmNsaWNrZWQoZSBhcyBNb3VzZUV2ZW50LCBjYW52YXNWaWV3LCAxLjIpKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIndoZWVsXCIsIChlOiBFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLndoZWVsKGUgYXMgV2hlZWxFdmVudCwgY2FudmFzVmlldykpO1xuICAgIH1cblxuICAgIGNsaWNrZWQoZXZlbnQ6IE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm06IFZpZXdUcmFuc2Zvcm0sIHpvb21CeTogbnVtYmVyKXtcbiAgICBcdHN3aXRjaChldmVudC50eXBlKXtcbiAgICBcdFx0Y2FzZSBcImRibGNsaWNrXCI6XG4gICAgICAgICAgICAgICAgLy8gaWYgIChldmVudC5jdHJsS2V5KSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHpvb21CeSA9IDEgLyB6b29tQnk7XG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIGxldCBtWFkgPSB0aGlzLm1vdXNlUG9zaXRpb24oZXZlbnQsIHRoaXMuZHJhZ0VsZW1lbnQpO1xuXG4gICAgICAgICAgICAgICAgLy8gdGhpcy5jYW52YXNWaWV3Lnpvb21BYm91dChtWFlbMF0sIG1YWVsxXSwgem9vbUJ5KTtcblxuICAgICAgICAgICAgICAgIC8vIHRoaXMuY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHJhZ2dlZChldmVudDogTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybTogVmlld1RyYW5zZm9ybSkge1xuXG4gICAgXHRzd2l0Y2goZXZlbnQudHlwZSl7XG4gICAgXHRcdGNhc2UgXCJtb3VzZWRvd25cIjpcbiAgICBcdFx0XHR0aGlzLnJlY29yZCA9IHRydWU7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJtb3VzZXVwXCI6XG4gICAgXHRcdFx0dGhpcy5yZWNvcmQgPSBmYWxzZTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0ZGVmYXVsdDpcbiAgICBcdFx0XHRpZiAodGhpcy5yZWNvcmQpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgeERlbHRhID0gKGV2ZW50LmNsaWVudFggLSB0aGlzLnhQcmV2aW91cykgLyB0aGlzLm1vdmUgLyB2aWV3VHJhbnNmb3JtLnpvb21YO1xuICAgICAgICAgICAgICAgICAgICBsZXQgeURlbHRhID0gKGV2ZW50LmNsaWVudFkgLSB0aGlzLnlQcmV2aW91cykgLyB0aGlzLm1vdmUgLyB2aWV3VHJhbnNmb3JtLnpvb21ZO1xuXG4gICAgICAgICAgICAgICAgICAgIHZpZXdUcmFuc2Zvcm0ueCA9IHZpZXdUcmFuc2Zvcm0ueCAtIHhEZWx0YTtcbiAgICAgICAgICAgICAgICAgICAgdmlld1RyYW5zZm9ybS55ID0gdmlld1RyYW5zZm9ybS55IC0geURlbHRhO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy5kcmF3KCk7XG4gICAgXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnhQcmV2aW91cyA9IGV2ZW50LmNsaWVudFg7XG5cdFx0XHR0aGlzLnlQcmV2aW91cyA9IGV2ZW50LmNsaWVudFk7XG4gICAgXHR9XG4gICAgfVxuXG4gICAgd2hlZWwoZXZlbnQ6IFdoZWVsRXZlbnQsIHZpZXdUcmFuc2Zvcm06IFZpZXdUcmFuc2Zvcm0pIHtcblxuICAgICAgICAvL2NvbnNvbGUubG9nKFwid2hlZWxcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LnR5cGUpO1xuXG4gICAgICAgIGxldCB4RGVsdGEgPSBldmVudC5kZWx0YVggLyB0aGlzLm1vdmUgLyB2aWV3VHJhbnNmb3JtLnpvb21YO1xuICAgICAgICBsZXQgeURlbHRhID0gZXZlbnQuZGVsdGFZIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWTtcblxuICAgICAgICBpZiAgKGV2ZW50LmN0cmxLZXkpIHtcbiAgICAgICAgICAgIGxldCBtWFkgPSB0aGlzLm1vdXNlUG9zaXRpb24oZXZlbnQsIHRoaXMuZHJhZ0VsZW1lbnQpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGJ5ID0gMS4wNTtcbiAgICAgICAgICAgIGlmICh5RGVsdGEgPCAwKXtcbiAgICAgICAgICAgICAgICBieSA9IDAuOTU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy56b29tQWJvdXQobVhZWzBdLCBtWFlbMV0sIGJ5KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy54ID0gIHRoaXMuY2FudmFzVmlldy54ICsgeERlbHRhO1xuICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3LnkgPSAgdGhpcy5jYW52YXNWaWV3LnkgKyB5RGVsdGE7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuY2FudmFzVmlldy5kcmF3KCk7XG4gICAgfVxuXG59XG4iLCJleHBvcnQgaW50ZXJmYWNlIExvZ2dlciB7XG5cdGxvZyhpbmZvOiBzdHJpbmcpOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgRWxlbWVudExvZ2dlciBpbXBsZW1lbnRzIExvZ2dlciB7XG5cblx0Y29uc3RydWN0b3IocmVhZG9ubHkgZGlzcGxheUVsZW1lbnQ6IEhUTUxFbGVtZW50KXt9XG5cblx0bG9nKGluZm86IHN0cmluZyk6IHZvaWQge1xuXHRcdHRoaXMuZGlzcGxheUVsZW1lbnQuaW5uZXJUZXh0ID0gaW5mbztcblx0fVxuXG59XG5cbmV4cG9ydCBjbGFzcyBDb25zb2xlTG9nZ2VyIGltcGxlbWVudHMgTG9nZ2VyIHtcblxuXHRsb2coaW5mbzogc3RyaW5nKTogdm9pZCB7XG5cdFx0Y29uc29sZS5sb2coaW5mbyk7XG5cdH1cblxufSIsImltcG9ydCB7IENhbnZhc1ZpZXcgfSBmcm9tIFwiLi9ncmFwaGljcy9jYW52YXN2aWV3XCI7XG5pbXBvcnQgeyBTdGF0aWNJbWFnZSB9IGZyb20gXCIuL2dyYXBoaWNzL3N0YXRpY1wiO1xuaW1wb3J0IHsgQ29udGFpbmVyTGF5ZXIgfSBmcm9tIFwiLi9ncmFwaGljcy9jb250YWluZXJsYXllclwiO1xuaW1wb3J0IHsgTXVsdGlSZXNMYXllciB9IGZyb20gXCIuL2dyYXBoaWNzL211bHRpcmVzbGF5ZXJcIjtcbmltcG9ydCB7IEJhc2ljVHJhbnNmb3JtIH0gZnJvbSBcIi4vZ3JhcGhpY3Mvdmlld1wiO1xuaW1wb3J0IHsgU3RhdGljR3JpZCB9IGZyb20gXCIuL2dyYXBoaWNzL2dyaWRcIjtcbmltcG9ydCB7IERpc3BsYXlSYW5nZSB9IGZyb20gXCIuL2dyYXBoaWNzL211bHRpcmVzbGF5ZXJcIjtcbmltcG9ydCB7IFRpbGVMYXllciwgVGlsZVN0cnVjdCwgem9vbUJ5TGV2ZWx9IGZyb20gXCIuL2dyYXBoaWNzL3RpbGVsYXllclwiO1xuaW1wb3J0IHsgTGF5ZXJNYW5hZ2VyLCBDb250YWluZXJMYXllck1hbmFnZXIsIGRhdGVGaWx0ZXIsIGRhdGVsZXNzRmlsdGVyIH0gZnJvbSBcbiAgXCIuL2dyYXBoaWNzL2xheWVybWFuYWdlclwiO1xuXG5pbXBvcnQgeyBJbmRleENvbnRyb2xsZXIgfSBmcm9tIFwiLi9pbnRlcmZhY2UvaW5kZXhjb250cm9sbGVyXCI7XG5pbXBvcnQgeyBWaWV3Q29udHJvbGxlciB9IGZyb20gXCIuL2ludGVyZmFjZS92aWV3Y29udHJvbGxlclwiO1xuaW1wb3J0IHsgSW1hZ2VDb250cm9sbGVyLCBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIgfSBmcm9tIFwiLi9pbnRlcmZhY2UvaW1hZ2Vjb250cm9sbGVyXCI7XG5pbXBvcnQgeyBMYXllckNvbnRyb2xsZXIgfSBmcm9tIFwiLi9pbnRlcmZhY2UvbGF5ZXJjb250cm9sbGVyXCI7XG5cbmltcG9ydCB7IEdyaWRJbmRleGVyIH0gZnJvbSBcIi4vaW5kZXgvZ3JpZGluZGV4ZXJcIjtcbmltcG9ydCB7IENvbnRhaW5lckluZGV4IH0gZnJvbSBcIi4vaW5kZXgvY29udGFpbmVyaW5kZXhcIjtcbmltcG9ydCB7IEVsZW1lbnRMb2dnZXIgfSBmcm9tIFwiLi9sb2dnaW5nL2xvZ2dlclwiO1xuXG5pbXBvcnQgKiBhcyBmaXJlbWFwcyBmcm9tIFwiLi9pbWFnZWdyb3Vwcy9maXJlbWFwcy5qc29uXCI7XG5pbXBvcnQgKiBhcyBsYW5kbWFya3MgZnJvbSBcIi4vaW1hZ2Vncm91cHMvbGFuZG1hcmtzLmpzb25cIjtcbmltcG9ydCAqIGFzIHdzYyBmcm9tIFwiLi9pbWFnZWdyb3Vwcy93c2NkLmpzb25cIjtcblxubGV0IGVhcmx5RGF0ZXMgPSBkYXRlRmlsdGVyKHdzYywgMTY4MCwgMTc5Mik7XG5sZXQgbWlkRGF0ZXMgPSBkYXRlRmlsdGVyKHdzYywgMTc5MywgMTgyMCk7XG5sZXQgbGF0ZURhdGVzID0gZGF0ZUZpbHRlcih3c2MsIDE4MjEsIDE5MDApO1xubGV0IG90aGVyRGF0ZXMgPSBkYXRlbGVzc0ZpbHRlcih3c2MpO1xuXG5sZXQgbGF5ZXJTdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgwLCAwLCAxLCAxLCAwKTtcbmxldCBpbWFnZUxheWVyID0gbmV3IENvbnRhaW5lckxheWVyKGxheWVyU3RhdGUpO1xuXG5sZXQgaW1hZ2VTdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtMTQ0MCwtMTQ0MCwgMC4yMjIsIDAuMjIyLCAwKTtcblxubGV0IGNvdW50eVN0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0yNjMxLCAtMjA1MS41LCAxLjcxNiwgMS42NzQsIDApO1xubGV0IGNvdW50eUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKGNvdW50eVN0YXRlLCBcbiAgICBcImltYWdlcy9Db3VudHlfb2ZfdGhlX0NpdHlfb2ZfRHVibGluXzE4MzdfbWFwLnBuZ1wiLCAwLjUsIHRydWUpO1xuXG5sZXQgYmdTdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtMTEyNiwtMTA4NiwgMS41OCwgMS41NSwgMCk7XG5sZXQgYmdJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZShiZ1N0YXRlLCBcImltYWdlcy9mbXNzLmpwZWdcIiwgLjYsIHRydWUpO1xuXG5sZXQgdG1TdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtMTAzMy41LDE0OSwgMC41OSwgMC41OSwgMCk7XG5sZXQgdG1JbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSh0bVN0YXRlLCBcImltYWdlcy90aGluZ21vdC5wbmdcIiwgLjMsIHRydWUpO1xuXG5sZXQgZHVTdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtOTI5LC0xMDUuNSwgMC40NjQsIDAuNTA2LCAwKTtcbmxldCBkdUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKGR1U3RhdGUsIFwiaW1hZ2VzL2R1YmxpbjE2MTAuanBnXCIsIC42LCBmYWxzZSk7XG5cbmxldCBncmlkVHJhbnNmb3JtID0gQmFzaWNUcmFuc2Zvcm0udW5pdFRyYW5zZm9ybTtcbi8vIG5ldyBCYXNpY1RyYW5zZm9ybSgwLCAwLCAxLCAxLCAwKTtcbmxldCBzdGF0aWNHcmlkID0gbmV3IFN0YXRpY0dyaWQoZ3JpZFRyYW5zZm9ybSwgMCwgZmFsc2UsIDI1NiwgMjU2KTtcblxubGV0IHNlbnRpbmVsU3RydWN0ID0gbmV3IFRpbGVTdHJ1Y3QoXCJxdGlsZS9kdWJsaW4vXCIsIFwiLnBuZ1wiLCBcImltYWdlcy9xdGlsZS9kdWJsaW4vXCIpO1xuXG5sZXQgc2VudGluZWxUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgMiwgMiwgMCk7XG5sZXQgZGlzcGxheUNsb3NlID0gbmV3IERpc3BsYXlSYW5nZSgwLjgsIDQpO1xuXG5sZXQgc2VudGluZWxMYXllciA9IG5ldyBUaWxlTGF5ZXIoc2VudGluZWxUcmFuc2Zvcm0sIHNlbnRpbmVsU3RydWN0LCB0cnVlLCBcbiAgICBcInNlbnRpbmVsXCIsIFxuICAgMTU4MTYsIDEwNjI0LCAxNSk7XG5cbmxldCBzZW50aW5lbEJUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgNCwgNCwgMCk7XG5sZXQgZGlzcGxheU1pZCA9IG5ldyBEaXNwbGF5UmFuZ2UoLjIsIDAuOCk7XG5sZXQgc2VudGluZWxCTGF5ZXIgPSBuZXcgVGlsZUxheWVyKHNlbnRpbmVsQlRyYW5zZm9ybSwgc2VudGluZWxTdHJ1Y3QsIHRydWUsIFxuICAgIFwic2VudGluZWxCXCIsIFxuICAgNzkwOCwgNTMxMiwgMTQpO1xuXG5sZXQgc2VudGluZWxDVHJhbnNmb3JtID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDgsIDgsIDApO1xubGV0IGRpc3BsYXlGYXIgPSBuZXcgRGlzcGxheVJhbmdlKC4wNCwgLjIpO1xubGV0IHNlbnRpbmVsU0xheWVyID0gbmV3IFRpbGVMYXllcihzZW50aW5lbENUcmFuc2Zvcm0sIHNlbnRpbmVsU3RydWN0LCB0cnVlLCBcbiAgICBcInNlbnRpbmVsQ1wiLCBcbiAgICAzOTU0LCAyNjU2LCAxMyk7XG5cbmxldCByZWNlbnRyZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtMTAyNCwgLTE1MzYsIDEsIDEsIDApO1xubGV0IHNlbnRpbmVsQ29udGFpbmVyTGF5ZXIgPSBuZXcgTXVsdGlSZXNMYXllcihyZWNlbnRyZSwgMSwgdHJ1ZSk7XG5zZW50aW5lbENvbnRhaW5lckxheWVyLnNldChkaXNwbGF5Q2xvc2UsIHNlbnRpbmVsTGF5ZXIpO1xuc2VudGluZWxDb250YWluZXJMYXllci5zZXQoZGlzcGxheU1pZCwgc2VudGluZWxCTGF5ZXIpO1xuc2VudGluZWxDb250YWluZXJMYXllci5zZXQoZGlzcGxheUZhciwgc2VudGluZWxTTGF5ZXIpO1xuXG5sZXQgZWRpdENvbnRhaW5lckxheWVyID0gbmV3IENvbnRhaW5lckxheWVyKEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0pO1xuXG5pbWFnZUxheWVyLnNldChcImNvdW50eVwiLCBjb3VudHlJbWFnZSk7XG5pbWFnZUxheWVyLnNldChcImJhY2tncm91bmRcIiwgYmdJbWFnZSk7XG5cbmxldCBsYXllck1hbmFnZXIgPSBuZXcgTGF5ZXJNYW5hZ2VyKCk7XG5cbmxldCBmaXJlbWFwTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkTGF5ZXIoZmlyZW1hcHMsIFwiZmlyZW1hcHNcIik7XG5sZXQgbGFuZG1hcmtzTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkTGF5ZXIobGFuZG1hcmtzLCBcImxhbmRtYXJrc1wiKTtcbmxldCB3c2NFYXJseUxheWVyID0gbGF5ZXJNYW5hZ2VyLmFkZExheWVyKGVhcmx5RGF0ZXMsIFwid3NjX2Vhcmx5XCIpO1xuXG5sZXQgd3NjTWlkTGF5ZXIgPSBsYXllck1hbmFnZXIuYWRkTGF5ZXIobWlkRGF0ZXMsIFwid3NjX21pZFwiKTtcbndzY01pZExheWVyLnNldFZpc2libGUoZmFsc2UpO1xubGV0IHdzY0xhdGVMYXllciA9IGxheWVyTWFuYWdlci5hZGRMYXllcihsYXRlRGF0ZXMsIFwid3NjX2xhdGVcIik7XG53c2NMYXRlTGF5ZXIuc2V0VmlzaWJsZShmYWxzZSk7XG5sZXQgd3NjT3RoZXJMYXllciA9IGxheWVyTWFuYWdlci5hZGRMYXllcihvdGhlckRhdGVzLCBcIndzY19vdGhlclwiKTtcbndzY090aGVyTGF5ZXIuc2V0VmlzaWJsZShmYWxzZSk7XG5cbmxldCBlZGl0ID0gd3NjRWFybHlMYXllci5nZXQoXCJ3c2MtMzU1LTJcIik7XG5cbmxldCBlYXJseUluZGV4ID0gbmV3IENvbnRhaW5lckluZGV4KHdzY0Vhcmx5TGF5ZXIsIFwiZWFybHlcIik7XG5sZXQgbWlkSW5kZXggPSBuZXcgQ29udGFpbmVySW5kZXgod3NjTWlkTGF5ZXIsIFwibWlkXCIpO1xubGV0IGxhdGVJbmRleCA9IG5ldyBDb250YWluZXJJbmRleCh3c2NMYXRlTGF5ZXIsIFwibGF0ZVwiKTtcbmxldCBvdGhlckluZGV4ID0gbmV3IENvbnRhaW5lckluZGV4KHdzY090aGVyTGF5ZXIsIFwib3RoZXJcIik7XG5cbmxldCBjb250YWluZXJMYXllck1hbmFnZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXJNYW5hZ2VyKHdzY0Vhcmx5TGF5ZXIsIGVkaXRDb250YWluZXJMYXllcik7XG5sZXQgb3V0bGluZUxheWVyID0gY29udGFpbmVyTGF5ZXJNYW5hZ2VyLnNldFNlbGVjdGVkKFwid3NjLTM1NS0yXCIpO1xuXG5pbWFnZUxheWVyLnNldChcIndzY19vdGhlclwiLCB3c2NPdGhlckxheWVyKTtcbmltYWdlTGF5ZXIuc2V0KFwid3NjX2Vhcmx5XCIsIHdzY0Vhcmx5TGF5ZXIpO1xuaW1hZ2VMYXllci5zZXQoXCJ3c2NfbWlkXCIsIHdzY01pZExheWVyKTtcbmltYWdlTGF5ZXIuc2V0KFwid3NjX2xhdGVcIiwgd3NjTGF0ZUxheWVyKTtcblxuaW1hZ2VMYXllci5zZXQoXCJmaXJlbWFwc1wiLCBmaXJlbWFwTGF5ZXIpO1xuXG5pbWFnZUxheWVyLnNldChcImR1YmxpbjE2MTBcIiwgZHVJbWFnZSk7XG5pbWFnZUxheWVyLnNldChcInRoaW5nbW90XCIsIHRtSW1hZ2UpO1xuaW1hZ2VMYXllci5zZXQoXCJsYW5kbWFya3NcIiwgbGFuZG1hcmtzTGF5ZXIpO1xuXG53c2NFYXJseUxheWVyLnNldFRvcChcIndzYy0zMzRcIik7XG5cbmZ1bmN0aW9uIHNob3dNYXAoZGl2TmFtZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGl2TmFtZSk7XG5cbiAgICBjb25zdCBpbmZvID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZWRpdF9pbmZvXCIpO1xuXG4gICAgY29uc3QgbGF5ZXJzID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGF5ZXJzXCIpO1xuXG4gICAgbGV0IHggPSBvdXRsaW5lTGF5ZXIueDtcbiAgICBsZXQgeSA9IG91dGxpbmVMYXllci55O1xuXG4gICAgbGV0IGNhbnZhc1RyYW5zZm9ybSA9IG5ldyBCYXNpY1RyYW5zZm9ybSh4IC0gMjAwLCB5IC0gMjAwLCAwLjUsIDAuNSwgMCk7XG4gICAgbGV0IGNhbnZhc1ZpZXcgPSBuZXcgQ2FudmFzVmlldyhjYW52YXNUcmFuc2Zvcm0sIGNhbnZhcy5jbGllbnRXaWR0aCwgY2FudmFzLmNsaWVudEhlaWdodCwgY2FudmFzKTtcblxuICAgIGNhbnZhc1ZpZXcubGF5ZXJzLnB1c2goc2VudGluZWxDb250YWluZXJMYXllcik7XG4gICAgY2FudmFzVmlldy5sYXllcnMucHVzaChpbWFnZUxheWVyKTtcbiAgICBjYW52YXNWaWV3LmxheWVycy5wdXNoKHN0YXRpY0dyaWQpO1xuICAgIGNhbnZhc1ZpZXcubGF5ZXJzLnB1c2goZWRpdENvbnRhaW5lckxheWVyKTtcblxuICAgIGxldCB0aWxlQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgc2VudGluZWxDb250YWluZXJMYXllciwgXCJ2XCIpO1xuICAgIGxldCBiYXNlQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgYmdJbWFnZSwgXCJCXCIpO1xuICAgIGxldCBjb3VudHlDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBjb3VudHlJbWFnZSwgXCJWXCIpO1xuICAgIGxldCBmaXJlbWFwQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgZmlyZW1hcExheWVyLCBcImJcIik7XG4gICAgbGV0IHdzY0Vhcmx5Q29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgd3NjRWFybHlMYXllciwgXCIxXCIpO1xuICAgIGxldCB3c2NMYXRlQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgd3NjTWlkTGF5ZXIsIFwiMlwiKTtcbiAgICBsZXQgd3NjTWlkQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgd3NjTGF0ZUxheWVyLCBcIjNcIik7XG4gICAgbGV0IHdzY090aGVyQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgd3NjT3RoZXJMYXllciwgXCI0XCIpO1xuICAgIGxldCBsYW5kbWFya0NvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGxhbmRtYXJrc0xheWVyLCBcIm1cIik7XG4gICAgbGV0IHRtQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgdG1JbWFnZSwgXCJuXCIpO1xuICAgIGxldCBkdUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGR1SW1hZ2UsIFwiTVwiKTtcbiAgICBsZXQgZ3JpZENvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHN0YXRpY0dyaWQsIFwiZ1wiKTtcblxuICAgIGxldCBjb250cm9sbGVyID0gbmV3IFZpZXdDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGNhbnZhcywgY2FudmFzVmlldyk7XG5cbiAgICBsZXQgaW1hZ2VDb250cm9sbGVyID0gbmV3IEltYWdlQ29udHJvbGxlcihjYW52YXNWaWV3LCBlZGl0KTtcblxuICAgIGltYWdlQ29udHJvbGxlci5zZXRMYXllck91dGxpbmUob3V0bGluZUxheWVyKTtcblxuICAgIGltYWdlQ29udHJvbGxlci5zZXRFZGl0SW5mb1BhbmUoaW5mbyk7XG5cbiAgICBsZXQgbGF5ZXJDb250cm9sbGVyID0gbmV3IExheWVyQ29udHJvbGxlcihjYW52YXNWaWV3LCBjb250YWluZXJMYXllck1hbmFnZXIpO1xuXG4gICAgZHJhd01hcChjYW52YXNWaWV3KTtcblxuICAgIGxldCBsb2dnZXIgPSBuZXcgRWxlbWVudExvZ2dlcihpbmZvKTtcblxuICAgIGxldCBpbmRleENvbnRyb2xsZXIgPSBuZXcgSW5kZXhDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGltYWdlQ29udHJvbGxlcik7XG4gICAgaW5kZXhDb250cm9sbGVyLmFkZEluZGV4ZXIoZWFybHlJbmRleCk7XG4gICAgaW5kZXhDb250cm9sbGVyLmFkZEluZGV4ZXIobWlkSW5kZXgpO1xuICAgIGluZGV4Q29udHJvbGxlci5hZGRJbmRleGVyKGxhdGVJbmRleCk7XG4gICAgaW5kZXhDb250cm9sbGVyLmFkZEluZGV4ZXIob3RoZXJJbmRleCk7XG5cbiAgICBpbmRleENvbnRyb2xsZXIuc2V0TWVudShsYXllcnMpO1xuXG59XG5cbmZ1bmN0aW9uIGRyYXdNYXAoY2FudmFzVmlldzogQ2FudmFzVmlldyl7XG4gICAgaWYgKCFjYW52YXNWaWV3LmRyYXcoKSApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJJbiB0aW1lb3V0XCIpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGRyYXdNYXAoY2FudmFzVmlldyl9LCA1MDApO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc2hvdygpe1xuXHRzaG93TWFwKFwiY2FudmFzXCIsIFwiVHlwZVNjcmlwdFwiKTtcbn1cblxuaWYgKFxuICAgIGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIiB8fFxuICAgIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSBcImxvYWRpbmdcIiAmJiAhZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmRvU2Nyb2xsKVxuKSB7XG5cdHNob3coKTtcbn0gZWxzZSB7XG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIHNob3cpO1xufSJdfQ==
