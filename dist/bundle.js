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

},{"../geom/point2d":1,"./view":8}],3:[function(require,module,exports){
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
        //console.log("xMin " + xMin + " xMax " + xMax);
        //console.log("yMin " + yMin + " yMax " + yMax);
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

},{"../geom/point2d":1,"./layer":4}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const view_1 = require("./view");
const canvasview_1 = require("./canvasview");
const point2d_1 = require("../geom/point2d");
class CanvasLayer extends view_1.BasicTransform {
    constructor(localTransform, opacity, visible, name = "", zoomDisplayRange = canvasview_1.ZoomDisplayRange.AllZoomRange) {
        super(localTransform.x, localTransform.y, localTransform.zoomX, localTransform.zoomY, localTransform.rotation);
        this.localTransform = localTransform;
        this.opacity = opacity;
        this.visible = visible;
        this.name = name;
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

},{"../geom/point2d":1,"./canvasview":2,"./view":8}],5:[function(require,module,exports){
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

},{"./layer":4,"./static":6,"./view":8}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const view_1 = require("./view");
const layer_1 = require("./layer");
const canvasview_1 = require("./canvasview");
const point2d_1 = require("../geom/point2d");
class StaticImage extends layer_1.DrawLayer {
    constructor(localTransform, imageSrc, opacity, visible, zoomDisplayRange = canvasview_1.ZoomDisplayRange.AllZoomRange) {
        super(localTransform, opacity, visible, imageSrc, zoomDisplayRange);
        this.img = new Image();
        this.img.src = imageSrc;
    }
    drawImage(ctx, parentTransform, view) {
        if (this.isVisible() && this.getZoomDisplayRange().withinRange(view.zoomX)) {
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
    constructor(dimension, opacity, visible, zoomDisplayRange = canvasview_1.ZoomDisplayRange.AllZoomRange) {
        super(new view_1.BasicTransform(dimension.x, dimension.y, 1, 1, 0), opacity, visible, "rect", zoomDisplayRange);
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

},{"../geom/point2d":1,"./canvasview":2,"./layer":4,"./view":8}],7:[function(require,module,exports){
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
    constructor(localTransform, tileStruct, visbile, name = "tiles", zoomDisplayRange = canvasview_1.ZoomDisplayRange.AllZoomRange, xOffset = 0, yOffset = 0, zoom = 1, gridWidth = 256, gridHeight = 256, opacity = 1) {
        super(localTransform, opacity, visbile, name, zoomDisplayRange);
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

},{"../geom/point2d":1,"./canvasview":2,"./layer":4,"./view":8}],8:[function(require,module,exports){
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




},{}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{"./gridindexer":13}],13:[function(require,module,exports){
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

},{"../logging/logger":20}],14:[function(require,module,exports){
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
        editdiv.appendChild(label);
        editdiv.appendChild(visibility);
        editdiv.appendChild(edit);
        this.container.appendChild(editdiv);
        this.container.appendChild(thumbnail);
    }
}
exports.CanvasLayerView = CanvasLayerView;

},{}],15:[function(require,module,exports){
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

},{"../index/gridindexer":13}],16:[function(require,module,exports){
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

},{"../geom/point2d":1,"../logging/logger":20,"./indexview":17,"./viewcontroller":19}],17:[function(require,module,exports){
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

},{"./canvaslayerview":14}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const canvasview_1 = require("./graphics/canvasview");
const static_1 = require("./graphics/static");
const layer_1 = require("./graphics/layer");
const view_1 = require("./graphics/view");
const grid_1 = require("./graphics/grid");
const canvasview_2 = require("./graphics/canvasview");
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
let staticGrid = new grid_1.StaticGrid(gridTransform, 0, false, 256, 256);
let sentinelStruct = new tilelayer_1.TileStruct("qtile/dublin/", ".png", "images/qtile/dublin/");
let sentinelTransform = new view_1.BasicTransform(0, 0, 2, 2, 0);
let zoomDisplay = new canvasview_2.ZoomDisplayRange(0.8, 4);
let sentinelLayer = new tilelayer_1.TileLayer(sentinelTransform, sentinelStruct, true, "sentinel", zoomDisplay, 15816, 10624, 15);
let sentinelBTransform = new view_1.BasicTransform(0, 0, 4, 4, 0);
let zoomBDisplay = new canvasview_2.ZoomDisplayRange(.2, 0.8);
let sentinelBLayer = new tilelayer_1.TileLayer(sentinelBTransform, sentinelStruct, true, "sentinelB", zoomBDisplay, 7908, 5312, 14);
let sentinelCTransform = new view_1.BasicTransform(0, 0, 8, 8, 0);
let zoomCDisplay = new canvasview_2.ZoomDisplayRange(.04, .2);
let sentinelSLayer = new tilelayer_1.TileLayer(sentinelCTransform, sentinelStruct, true, "sentinelC", zoomCDisplay, 3954, 2656, 13);
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

},{"./graphics/canvasview":2,"./graphics/grid":3,"./graphics/layer":4,"./graphics/layermanager":5,"./graphics/static":6,"./graphics/tilelayer":7,"./graphics/view":8,"./imagegroups/firemaps.json":9,"./imagegroups/landmarks.json":10,"./imagegroups/wscd.json":11,"./index/containerindex":12,"./interface/imagecontroller":15,"./interface/indexcontroller":16,"./interface/layercontroller":18,"./interface/viewcontroller":19,"./logging/logger":20}]},{},[21])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2dyYXBoaWNzL2NhbnZhc3ZpZXcudHMiLCJzcmMvZ3JhcGhpY3MvZ3JpZC50cyIsInNyYy9ncmFwaGljcy9sYXllci50cyIsInNyYy9ncmFwaGljcy9sYXllcm1hbmFnZXIudHMiLCJzcmMvZ3JhcGhpY3Mvc3RhdGljLnRzIiwic3JjL2dyYXBoaWNzL3RpbGVsYXllci50cyIsInNyYy9ncmFwaGljcy92aWV3LnRzIiwic3JjL2ltYWdlZ3JvdXBzL2ZpcmVtYXBzLmpzb24iLCJzcmMvaW1hZ2Vncm91cHMvbGFuZG1hcmtzLmpzb24iLCJzcmMvaW1hZ2Vncm91cHMvd3NjZC5qc29uIiwic3JjL2luZGV4L2NvbnRhaW5lcmluZGV4LnRzIiwic3JjL2luZGV4L2dyaWRpbmRleGVyLnRzIiwic3JjL2ludGVyZmFjZS9jYW52YXNsYXllcnZpZXcudHMiLCJzcmMvaW50ZXJmYWNlL2ltYWdlY29udHJvbGxlci50cyIsInNyYy9pbnRlcmZhY2UvaW5kZXhjb250cm9sbGVyLnRzIiwic3JjL2ludGVyZmFjZS9pbmRleHZpZXcudHMiLCJzcmMvaW50ZXJmYWNlL2xheWVyY29udHJvbGxlci50cyIsInNyYy9pbnRlcmZhY2Uvdmlld2NvbnRyb2xsZXIudHMiLCJzcmMvbG9nZ2luZy9sb2dnZXIudHMiLCJzcmMvc2ltcGxlV29ybGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0NBLE1BQWEsT0FBTztJQU9oQixZQUFZLENBQVMsRUFBRSxDQUFTO1FBQzVCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVFLFFBQVE7UUFDSixPQUFPLFVBQVUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFH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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUMsSUFBSSxDQUFDLENBQUM7SUFFckMsSUFBSSxlQUFlLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQztJQUN2RSxlQUFlLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3ZDLGVBQWUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDckMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN0QyxlQUFlLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRXZDLGVBQWUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFFcEMsQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFDLFVBQXNCO0lBQ25DLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUc7UUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixVQUFVLENBQUMsY0FBWSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUEsQ0FBQSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDckQ7QUFDTCxDQUFDO0FBRUQsU0FBUyxJQUFJO0lBQ1osT0FBTyxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBRUQsSUFDSSxRQUFRLENBQUMsVUFBVSxLQUFLLFVBQVU7SUFDbEMsQ0FBQyxRQUFRLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQzNFO0lBQ0QsSUFBSSxFQUFFLENBQUM7Q0FDUDtLQUFNO0lBQ04sUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ3BEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXG5leHBvcnQgY2xhc3MgUG9pbnQyRCB7XG4gICAgc3RhdGljIHJlYWRvbmx5IHplcm8gPSBuZXcgUG9pbnQyRCgwLCAwKTtcbiAgICBzdGF0aWMgcmVhZG9ubHkgb25lID0gbmV3IFBvaW50MkQoMSwgMSk7XG5cbiAgICByZWFkb25seSB4OiBudW1iZXI7XG4gICAgcmVhZG9ubHkgeTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcblx0fVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiUG9pbnQyRChcIiArIHRoaXMueCArIFwiLCBcIiArIHRoaXMueSArIFwiKVwiO1xuICAgIH1cblxufVxuXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlKFxuICBwb2ludDogUG9pbnQyRCwgXG4gIGFuZ2xlOiBudW1iZXIsIFxuICBhYm91dDogUG9pbnQyRCA9IG5ldyBQb2ludDJEKDAsMClcbik6IFBvaW50MkQge1xuXG4gICAgbGV0IHMgPSBNYXRoLnNpbihhbmdsZSk7XG4gICAgbGV0IGMgPSBNYXRoLmNvcyhhbmdsZSk7XG5cbiAgICBsZXQgcHggPSBwb2ludC54IC0gYWJvdXQueDtcbiAgICBsZXQgcHkgPSBwb2ludC55IC0gYWJvdXQueTtcblxuICAgIGxldCB4bmV3ID0gcHggKiBjICsgcHkgKiBzO1xuICAgIGxldCB5bmV3ID0gcHkgKiBjIC0gcHggKiBzO1xuXG4gICAgcmV0dXJuIG5ldyBQb2ludDJEKHhuZXcgKyBhYm91dC54LCB5bmV3ICsgYWJvdXQueSk7XG59XG5cbmV4cG9ydCBjbGFzcyBEaW1lbnNpb24ge1xuXG4gICAgY29uc3RydWN0b3IocHVibGljIHg6IG51bWJlciwgcHVibGljIHk6IG51bWJlciwgcHVibGljIHc6IG51bWJlciwgcHVibGljIGg6IG51bWJlcil7fVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiRGltZW5zaW9uKFwiICsgdGhpcy54ICsgXCIsIFwiICsgdGhpcy55ICsgXCIsIFwiICsgdGhpcy53ICsgXCIsIFwiICsgdGhpcy5oICsgXCIpXCI7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcbmltcG9ydCB7IENhbnZhc0xheWVyIH0gZnJvbSBcIi4vbGF5ZXJcIjtcbmltcG9ydCB7IFxuXHRpbnZlcnRUcmFuc2Zvcm0sIFxuXHRWaWV3VHJhbnNmb3JtLCBcblx0QmFzaWNWaWV3VHJhbnNmb3JtLCBcblx0VHJhbnNmb3JtLCBcblx0QmFzaWNUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlzcGxheUVsZW1lbnQgZXh0ZW5kcyBUcmFuc2Zvcm0ge1xuXHRpc1Zpc2libGUoKTogYm9vbGVhbjtcblx0c2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdm9pZDtcblx0Z2V0T3BhY2l0eSgpOiBudW1iZXI7XG5cdHNldE9wYWNpdHkob3BhY2l0eTogbnVtYmVyKTogdm9pZDtcblx0Z2V0Wm9vbURpc3BsYXlSYW5nZSgpOiBab29tRGlzcGxheVJhbmdlO1xufVxuXG5leHBvcnQgY2xhc3MgWm9vbURpc3BsYXlSYW5nZSB7XG5cbiAgICBzdGF0aWMgcmVhZG9ubHkgQWxsWm9vbVJhbmdlID0gbmV3IFpvb21EaXNwbGF5UmFuZ2UoLTEsIC0xKTtcblxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgbWluWm9vbTogbnVtYmVyLCBwdWJsaWMgbWF4Wm9vbTogbnVtYmVyKXt9XG5cblx0d2l0aGluUmFuZ2Uoem9vbTogbnVtYmVyKTogQm9vbGVhbiB7XG5cdFx0cmV0dXJuICgoem9vbSA+PSB0aGlzLm1pblpvb20gfHwgdGhpcy5taW5ab29tID09IC0xKSAmJiBcblx0XHRcdCh6b29tIDw9IHRoaXMubWF4Wm9vbSB8fCB0aGlzLm1heFpvb20gPT0gLTEpKTtcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgQ2FudmFzVmlldyBleHRlbmRzIEJhc2ljVmlld1RyYW5zZm9ybSB7XG5cblx0bGF5ZXJzOiBBcnJheTxDYW52YXNMYXllcj4gPSBbXTtcblx0Y3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0bG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdFx0d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIFxuXHRcdHJlYWRvbmx5IGNhbnZhc0VsZW1lbnQ6IEhUTUxDYW52YXNFbGVtZW50KXtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLngsIGxvY2FsVHJhbnNmb3JtLnksIHdpZHRoLCBoZWlnaHQsIFxuXHRcdFx0bG9jYWxUcmFuc2Zvcm0uem9vbVgsIGxvY2FsVHJhbnNmb3JtLnpvb21ZLCBcblx0XHRcdGxvY2FsVHJhbnNmb3JtLnJvdGF0aW9uKTtcblxuXHRcdHRoaXMuaW5pdENhbnZhcygpO1xuXG5cdFx0dGhpcy5jdHggPSBjYW52YXNFbGVtZW50LmdldENvbnRleHQoXCIyZFwiKTtcblx0fVxuXG5cdHpvb21BYm91dCh4OiBudW1iZXIsIHk6IG51bWJlciwgem9vbUJ5OiBudW1iZXIpe1xuXG4gICAgICAgIHRoaXMuem9vbVggPSB0aGlzLnpvb21YICogem9vbUJ5O1xuICAgICAgICB0aGlzLnpvb21ZID0gdGhpcy56b29tWSAqIHpvb21CeTtcblxuICAgICAgICBsZXQgcmVsYXRpdmVYID0geCAqIHpvb21CeSAtIHg7XG4gICAgICAgIGxldCByZWxhdGl2ZVkgPSB5ICogem9vbUJ5IC0geTtcblxuICAgICAgICBsZXQgd29ybGRYID0gcmVsYXRpdmVYIC8gdGhpcy56b29tWDtcbiAgICAgICAgbGV0IHdvcmxkWSA9IHJlbGF0aXZlWSAvIHRoaXMuem9vbVk7XG5cbiAgICAgICAgdGhpcy54ID0gdGhpcy54ICsgd29ybGRYO1xuICAgICAgICB0aGlzLnkgPSB0aGlzLnkgKyB3b3JsZFk7XG5cblx0fVxuXG5cdGdldEJhc2VQb2ludChjb29yZDogUG9pbnQyRCk6IFBvaW50MkQge1xuXHRcdHJldHVybiBuZXcgUG9pbnQyRChcblx0XHRcdHRoaXMueCArIGNvb3JkLnggLyB0aGlzLnpvb21YLCBcblx0XHRcdHRoaXMueSArIGNvb3JkLnkgLyB0aGlzLnpvb21ZKTtcblx0fVxuXG5cdGRyYXcoKTogYm9vbGVhbiB7XG5cdFx0bGV0IHRyYW5zZm9ybSA9IGludmVydFRyYW5zZm9ybSh0aGlzKTtcblxuXHRcdHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwiZ3JleVwiO1xuXHRcdHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuXHRcdHZhciBkcmF3aW5nQ29tcGxldGUgPSB0cnVlO1xuXG5cdFx0Zm9yIChsZXQgbGF5ZXIgb2YgdGhpcy5sYXllcnMpe1xuXHRcdFx0aWYgKGxheWVyLmlzVmlzaWJsZSgpKXtcblx0XHRcdFx0ZHJhd2luZ0NvbXBsZXRlID0gZHJhd2luZ0NvbXBsZXRlICYmIGxheWVyLmRyYXcodGhpcy5jdHgsIEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0sIHRoaXMpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fVxuXG5cdFx0dGhpcy5kcmF3Q2VudHJlKHRoaXMuY3R4KTtcblx0XHR0aGlzLnNob3dJbmZvKHRoaXMuY3R4KTtcblxuXHRcdHJldHVybiBkcmF3aW5nQ29tcGxldGU7XG5cdH1cblxuXHRkcmF3Q2VudHJlKGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCl7XG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIGNvbnRleHQuZ2xvYmFsQWxwaGEgPSAwLjM7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLndpZHRoLzIsIDYvMTYqdGhpcy5oZWlnaHQpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyh0aGlzLndpZHRoLzIsIDEwLzE2KnRoaXMuaGVpZ2h0KTtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8oNy8xNip0aGlzLndpZHRoLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oOS8xNip0aGlzLndpZHRoLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcbiAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XG4gICAgfVxuXG4gICAgc2hvd0luZm8oY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKXtcbiAgICBcdGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuICAgIFx0Y29udGV4dC5maWxsVGV4dChcInpvb206IFwiICsgdGhpcy56b29tWCwgMTAsIDEwKTtcbiAgICBcdGNvbnRleHQuZmlsbCgpO1xuICAgIH1cblxuXHRwcml2YXRlIGluaXRDYW52YXMoKXtcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5jYW52YXNFbGVtZW50LmNsaWVudFdpZHRoO1xuICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5jYW52YXNFbGVtZW50LmNsaWVudEhlaWdodDtcblxuICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LmhlaWdodCA9IGhlaWdodDtcblx0fVxuXG59IiwiaW1wb3J0IHsgRHJhd0xheWVyIH0gZnJvbSBcIi4vbGF5ZXJcIjtcbmltcG9ydCB7IFRyYW5zZm9ybSwgVmlld1RyYW5zZm9ybSwgY29tYmluZVRyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IERpbWVuc2lvbiB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuLyoqXG4qIFdlIGRvbid0IHdhbnQgdG8gZHJhdyBhIGdyaWQgaW50byBhIHRyYW5zZm9ybWVkIGNhbnZhcyBhcyB0aGlzIGdpdmVzIHVzIGdyaWQgbGluZXMgdGhhdCBhcmUgdG9vXG50aGljayBvciB0b28gdGhpblxuKi9cbmV4cG9ydCBjbGFzcyBTdGF0aWNHcmlkIGV4dGVuZHMgRHJhd0xheWVyIHtcblxuXHR6b29tV2lkdGg6IG51bWJlcjtcblx0em9vbUhlaWdodDogbnVtYmVyO1xuXG5cdGNvbnN0cnVjdG9yKGxvY2FsVHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHpvb21MZXZlbDogbnVtYmVyLCB2aXNpYmxlOiBib29sZWFuLFxuXHRcdHJlYWRvbmx5IGdyaWRXaWR0aDogbnVtYmVyID0gMjU2LCByZWFkb25seSBncmlkSGVpZ2h0OiBudW1iZXIgPSAyNTYpe1xuXG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0sIDEsIHZpc2libGUpO1xuXG5cdFx0bGV0IHpvb20gPSBNYXRoLnBvdygyLCB6b29tTGV2ZWwpO1xuXHRcdHRoaXMuem9vbVdpZHRoID0gZ3JpZFdpZHRoIC8gem9vbTtcblx0XHR0aGlzLnpvb21IZWlnaHQgPSBncmlkSGVpZ2h0IC8gem9vbTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBWaWV3VHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0XHRsZXQgb2Zmc2V0WCA9IHZpZXcueCAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IG9mZnNldFkgPSB2aWV3LnkgKiB2aWV3Lnpvb21ZO1xuXG5cdFx0bGV0IHZpZXdXaWR0aCA9IHZpZXcud2lkdGggLyB2aWV3Lnpvb21YO1xuXHRcdGxldCB2aWV3SGVpZ2h0ID0gdmlldy5oZWlnaHQgLyB2aWV3Lnpvb21ZO1xuXG5cdFx0bGV0IGdyaWRBY3Jvc3MgPSB2aWV3V2lkdGggLyB0aGlzLnpvb21XaWR0aDtcblx0XHRsZXQgZ3JpZEhpZ2ggPSB2aWV3SGVpZ2h0IC8gdGhpcy56b29tSGVpZ2h0O1xuXG5cdFx0bGV0IHhNaW4gPSBNYXRoLmZsb29yKHZpZXcueC90aGlzLnpvb21XaWR0aCk7XG5cdFx0bGV0IHhMZWZ0ID0geE1pbiAqIHRoaXMuem9vbVdpZHRoICogdmlldy56b29tWDtcblx0XHRsZXQgeE1heCA9IE1hdGguY2VpbCgodmlldy54ICsgdmlld1dpZHRoKSAvIHRoaXMuem9vbVdpZHRoKTtcblx0XHRsZXQgeFJpZ2h0ID0geE1heCAqIHRoaXMuem9vbVdpZHRoICogdmlldy56b29tWDtcblxuXHRcdGxldCB5TWluID0gTWF0aC5mbG9vcih2aWV3LnkvdGhpcy56b29tSGVpZ2h0KTtcblx0XHRsZXQgeVRvcCA9IHlNaW4gKiB0aGlzLnpvb21IZWlnaHQgKiB2aWV3Lnpvb21YO1xuXHRcdGxldCB5TWF4ID0gTWF0aC5jZWlsKCh2aWV3LnkgKyB2aWV3SGVpZ2h0KSAvIHRoaXMuem9vbUhlaWdodCk7XG5cdFx0bGV0IHlCb3R0b20gPSB5TWF4ICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWCA7XG5cblx0XHQvL2NvbnNvbGUubG9nKFwieE1pbiBcIiArIHhNaW4gKyBcIiB4TWF4IFwiICsgeE1heCk7XG5cdFx0Ly9jb25zb2xlLmxvZyhcInlNaW4gXCIgKyB5TWluICsgXCIgeU1heCBcIiArIHlNYXgpO1xuXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcblxuXHRcdGZvciAodmFyIHggPSB4TWluOyB4PD14TWF4OyB4Kyspe1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImF0IFwiICsgbWluWCk7XG5cdFx0XHRsZXQgeE1vdmUgPSB4ICogdGhpcy56b29tV2lkdGggKiB2aWV3Lnpvb21YO1xuXHRcdFx0Y3R4Lm1vdmVUbyh4TW92ZSAtIG9mZnNldFgsIHlUb3AgLSBvZmZzZXRZKTtcblx0XHRcdGN0eC5saW5lVG8oeE1vdmUgLSBvZmZzZXRYLCB5Qm90dG9tIC0gb2Zmc2V0WSk7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgeSA9IHlNaW47IHk8PXlNYXg7IHkrKyl7XG5cblx0XHRcdGxldCB5TW92ZSA9IHkgKiB0aGlzLnpvb21IZWlnaHQgKiB2aWV3Lnpvb21ZO1xuXHRcdFx0Y3R4Lm1vdmVUbyh4TGVmdCAtIG9mZnNldFgsIHlNb3ZlIC0gb2Zmc2V0WSk7XG5cdFx0XHRjdHgubGluZVRvKHhSaWdodCAtIG9mZnNldFgsIHlNb3ZlIC0gb2Zmc2V0WSk7XG5cblx0XHRcdGZvciAodmFyIHggPSB4TWluOyB4PD14TWF4OyB4Kyspe1xuXHRcdFx0XHRsZXQgeE1vdmUgPSAoeC0uNSkgKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cdFx0XHRcdHlNb3ZlID0gKHktLjUpICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWTtcblx0XHRcdFx0bGV0IHRleHQgPSBcIlwiICsgKHgtMSkgKyBcIiwgXCIgKyAoeS0xKTtcblx0XHRcdFx0Y3R4LnN0cm9rZVRleHQodGV4dCwgeE1vdmUgLSBvZmZzZXRYLCB5TW92ZSAtIG9mZnNldFkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHRyZXR1cm4gbmV3IERpbWVuc2lvbigwLCAwLCAwLCAwKTtcblx0fVxufSIsImltcG9ydCB7IFRyYW5zZm9ybSwgQmFzaWNUcmFuc2Zvcm0sIFZpZXdUcmFuc2Zvcm0sIGNvbWJpbmVUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBEaXNwbGF5RWxlbWVudCwgWm9vbURpc3BsYXlSYW5nZSB9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IERpbWVuc2lvbiB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENhbnZhc0xheWVyIGV4dGVuZHMgQmFzaWNUcmFuc2Zvcm0gaW1wbGVtZW50cyBEaXNwbGF5RWxlbWVudCB7XG5cblx0Y29uc3RydWN0b3IoXG5cdCAgcHVibGljIGxvY2FsVHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHQgIHB1YmxpYyBvcGFjaXR5OiBudW1iZXIsIFxuXHQgIHB1YmxpYyB2aXNpYmxlLFxuXHQgIHB1YmxpYyBuYW1lID0gXCJcIixcblx0ICBwcml2YXRlIHpvb21EaXNwbGF5UmFuZ2U6IFpvb21EaXNwbGF5UmFuZ2UgPSBab29tRGlzcGxheVJhbmdlLkFsbFpvb21SYW5nZSl7XG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0ueCwgbG9jYWxUcmFuc2Zvcm0ueSwgbG9jYWxUcmFuc2Zvcm0uem9vbVgsIGxvY2FsVHJhbnNmb3JtLnpvb21ZLCBcblx0XHRcdGxvY2FsVHJhbnNmb3JtLnJvdGF0aW9uKTtcblx0fVxuXG5cdGdldFpvb21EaXNwbGF5UmFuZ2UoKTogWm9vbURpc3BsYXlSYW5nZSB7XG5cdFx0cmV0dXJuIHRoaXMuem9vbURpc3BsYXlSYW5nZTtcblx0fVxuXG5cdGFic3RyYWN0IGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHBhcmVudFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHR2aWV3OiBWaWV3VHJhbnNmb3JtKTogYm9vbGVhbjtcblxuXHRhYnN0cmFjdCBnZXREaW1lbnNpb24oKTogRGltZW5zaW9uO1xuXG5cdGlzVmlzaWJsZSgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy52aXNpYmxlO1xuXHR9XG5cblx0c2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdm9pZCB7XG5cdFx0Y29uc29sZS5sb2coXCJzZXR0aW5nIHZpc2liaWxpdHk6IFwiICsgdmlzaWJsZSk7XG5cdFx0dGhpcy52aXNpYmxlID0gdmlzaWJsZTtcblx0fVxuXG5cdGdldE9wYWNpdHkoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5vcGFjaXR5O1xuXHR9XG5cblx0c2V0T3BhY2l0eShvcGFjaXR5OiBudW1iZXIpOiB2b2lkIHtcblx0XHR0aGlzLm9wYWNpdHkgPSBvcGFjaXR5O1xuXHR9XG5cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIERyYXdMYXllciBleHRlbmRzIENhbnZhc0xheWVyIHtcblxuICAgIHByb3RlY3RlZCBwcmVwYXJlQ3R4KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB0cmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVHJhbnNmb3JtKTogdm9pZCB7XG5cdFx0Y3R4LnRyYW5zbGF0ZSgodHJhbnNmb3JtLnggLSB2aWV3LngpICogdmlldy56b29tWCwgKHRyYW5zZm9ybS55IC0gdmlldy55KSAqIHZpZXcuem9vbVkpO1xuXHRcdGN0eC5zY2FsZSh0cmFuc2Zvcm0uem9vbVggKiB2aWV3Lnpvb21YLCB0cmFuc2Zvcm0uem9vbVkgKiB2aWV3Lnpvb21ZKTtcblx0XHRjdHgucm90YXRlKHRyYW5zZm9ybS5yb3RhdGlvbik7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNsZWFuQ3R4KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB0cmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVHJhbnNmb3JtKTogdm9pZCB7XHRcblx0XHRjdHgucm90YXRlKC10cmFuc2Zvcm0ucm90YXRpb24pO1xuXHRcdGN0eC5zY2FsZSgxL3RyYW5zZm9ybS56b29tWC92aWV3Lnpvb21YLCAxL3RyYW5zZm9ybS56b29tWS92aWV3Lnpvb21ZKTtcblx0XHRjdHgudHJhbnNsYXRlKC0odHJhbnNmb3JtLnggLXZpZXcueCkgKnZpZXcuem9vbVgsIC0odHJhbnNmb3JtLnkgLSB2aWV3LnkpICogdmlldy56b29tWSk7XG4gICAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBDb250YWluZXJMYXllciBleHRlbmRzIENhbnZhc0xheWVyIHtcblxuXHRsYXllck1hcDogTWFwPHN0cmluZywgQ2FudmFzTGF5ZXI+O1xuXHRkaXNwbGF5TGF5ZXJzOiBBcnJheTxDYW52YXNMYXllcj47XG5cblx0Y29uc3RydWN0b3IobG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgb3BhY2l0eTogbnVtYmVyID0gMSwgdmlzaWJsZTogYm9vbGVhbiA9IHRydWUpIHtcblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybSwgb3BhY2l0eSwgdmlzaWJsZSk7XG5cdFx0dGhpcy5sYXllck1hcCA9IG5ldyBNYXA8c3RyaW5nLCBDYW52YXNMYXllcj4oKTtcblx0XHR0aGlzLmRpc3BsYXlMYXllcnMgPSBbXTtcblx0fVxuXG5cdHNldChuYW1lOiBzdHJpbmcsIGxheWVyOiBDYW52YXNMYXllcil7XG5cdFx0dGhpcy5sYXllck1hcC5zZXQobmFtZSwgbGF5ZXIpO1xuXHRcdHRoaXMuZGlzcGxheUxheWVycy5wdXNoKGxheWVyKTtcblx0fVxuXG5cdGdldChuYW1lOiBzdHJpbmcpOiBDYW52YXNMYXllciB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXAuZ2V0KG5hbWUpO1xuXHR9XG5cblx0bGF5ZXJzKCk6IEFycmF5PENhbnZhc0xheWVyPiB7XG5cdFx0cmV0dXJuIHRoaXMuZGlzcGxheUxheWVycztcblx0fVxuXG5cdHNldFRvcChuYW1lOiBzdHJpbmcpIHtcblx0XHRsZXQgdG9wTGF5ZXIgPSB0aGlzLmdldChuYW1lKTtcblx0XHRpZiAodG9wTGF5ZXIgIT0gdW5kZWZpbmVkKXtcblx0XHRcdHRoaXMuZGlzcGxheUxheWVycyA9IHRoaXMuZGlzcGxheUxheWVycy5maWx0ZXIoZnVuY3Rpb24oZWxlbWVudDogQ2FudmFzTGF5ZXIpeyBcblx0XHRcdFx0aWYgKGVsZW1lbnQgPT0gdG9wTGF5ZXIpe1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fX0pO1xuXHRcdFx0dGhpcy5kaXNwbGF5TGF5ZXJzLnB1c2godG9wTGF5ZXIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcInRvcCBsYXllciB1bmRlZmluZWQgXCIgKyBuYW1lKTtcblx0XHR9XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0bGV0IGxheWVyVHJhbnNmb3JtID0gY29tYmluZVRyYW5zZm9ybSh0aGlzLmxvY2FsVHJhbnNmb3JtLCBwYXJlbnRUcmFuc2Zvcm0pO1xuXG5cdFx0dmFyIGRyYXdpbmdDb21wbGV0ZSA9IHRydWU7XG5cblx0XHRmb3IgKGxldCBsYXllciBvZiB0aGlzLmRpc3BsYXlMYXllcnMpIHtcblx0XHRcdGlmIChsYXllci5pc1Zpc2libGUoKSl7XG5cdFx0XHRcdGRyYXdpbmdDb21wbGV0ZSA9IGRyYXdpbmdDb21wbGV0ZSAmJiBsYXllci5kcmF3KGN0eCwgbGF5ZXJUcmFuc2Zvcm0sIHZpZXcpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRyYXdpbmdDb21wbGV0ZTtcblx0fVxuXG5cdGdldERpbWVuc2lvbigpOiBEaW1lbnNpb24ge1xuXHRcdHZhciB4TWluID0gdGhpcy54O1xuXHRcdHZhciB5TWluID0gdGhpcy55O1xuXHRcdHZhciB4TWF4ID0gdGhpcy54O1xuXHRcdHZhciB5TWF4ID0gdGhpcy55O1xuXG5cdFx0Zm9yIChsZXQgbGF5ZXIgb2YgdGhpcy5kaXNwbGF5TGF5ZXJzKSB7XG5cdFx0XHRsZXQgbGF5ZXJEaW1lbnNpb24gPSBsYXllci5nZXREaW1lbnNpb24oKTtcblx0XHRcdHhNaW4gPSBNYXRoLm1pbih4TWluLCB0aGlzLnggKyBsYXllckRpbWVuc2lvbi54KTtcblx0XHRcdHlNaW4gPSBNYXRoLm1pbih5TWluLCB0aGlzLnkgKyBsYXllckRpbWVuc2lvbi55KTtcblx0XHRcdHhNYXggPSBNYXRoLm1heCh4TWF4LCB0aGlzLnggKyBsYXllckRpbWVuc2lvbi54ICsgdGhpcy56b29tWCAqIGxheWVyRGltZW5zaW9uLncpO1xuXHRcdFx0eU1heCA9IE1hdGgubWF4KHlNYXgsIHRoaXMueSArIGxheWVyRGltZW5zaW9uLnkgKyB0aGlzLnpvb21ZICogbGF5ZXJEaW1lbnNpb24uaCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBEaW1lbnNpb24oeE1pbiwgeU1pbiwgeE1heCAtIHhNaW4sIHlNYXggLSB5TWluKTtcblx0fVxuXG5cbn0iLCJpbXBvcnQgeyBDYW52YXNMYXllciwgQ29udGFpbmVyTGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgU3RhdGljSW1hZ2UsIFJlY3RMYXllciB9IGZyb20gXCIuL3N0YXRpY1wiO1xuaW1wb3J0IHsgVHJhbnNmb3JtICwgQmFzaWNUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQge0NhbnZhc1ZpZXcsIERpc3BsYXlFbGVtZW50fSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW1hZ2VTdHJ1Y3QgZXh0ZW5kcyBUcmFuc2Zvcm0ge1xuXHRvcGFjaXR5OiBudW1iZXI7XG5cdHZpc2libGU6IGJvb2xlYW47XG5cdHNyYzogc3RyaW5nO1xuXHRuYW1lOiBzdHJpbmc7XG5cdGRhdGU6IG51bWJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRhdGVGaWx0ZXIoXG4gIGltYWdlU3RydWN0OiBBcnJheTxJbWFnZVN0cnVjdD4sIFxuICBmcm9tOiBudW1iZXIsIFxuICB0bzogbnVtYmVyKTogQXJyYXk8SW1hZ2VTdHJ1Y3Q+e1xuXHRyZXR1cm4gaW1hZ2VTdHJ1Y3QuZmlsdGVyKGZ1bmN0aW9uKGltYWdlU3RydWN0KXsgXG5cdFx0aWYgKGltYWdlU3RydWN0LmRhdGUgPT0gdW5kZWZpbmVkKVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdGlmIChpbWFnZVN0cnVjdC5kYXRlID49IGZyb20gJiYgaW1hZ2VTdHJ1Y3QuZGF0ZSA8PSB0bykge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZX1cblx0XHR9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRhdGVsZXNzRmlsdGVyKFxuICBpbWFnZVN0cnVjdDogQXJyYXk8SW1hZ2VTdHJ1Y3Q+KTogQXJyYXk8SW1hZ2VTdHJ1Y3Q+e1xuXHRyZXR1cm4gaW1hZ2VTdHJ1Y3QuZmlsdGVyKGZ1bmN0aW9uKGltYWdlU3RydWN0KXsgXG5cdFx0aWYgKGltYWdlU3RydWN0LmRhdGUgPT0gdW5kZWZpbmVkKVxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0ZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2V9XG5cdFx0fSk7XG59XG5cbmV4cG9ydCBjbGFzcyBMYXllck1hbmFnZXIge1xuXG5cdHByaXZhdGUgbGF5ZXJNYXA6IE1hcDxzdHJpbmcsIENvbnRhaW5lckxheWVyPjs7XG5cblx0cmVhZG9ubHkgZGVmYXVsdExheWVyOiBzdHJpbmcgPSBcImRlZmF1bHRcIjtcblxuXHRjb25zdHJ1Y3Rvcigpe1xuXHRcdHRoaXMubGF5ZXJNYXAgPSBuZXcgTWFwPHN0cmluZywgQ29udGFpbmVyTGF5ZXI+KCk7XG5cblx0XHRsZXQgaW1hZ2VMYXllciA9IG5ldyBDb250YWluZXJMYXllcihCYXNpY1RyYW5zZm9ybS51bml0VHJhbnNmb3JtLCAxLCB0cnVlKTtcdFxuXG5cdFx0dGhpcy5sYXllck1hcC5zZXQodGhpcy5kZWZhdWx0TGF5ZXIsIGltYWdlTGF5ZXIpO1xuXHR9XG5cblx0YWRkSW1hZ2UoaW1hZ2U6IFN0YXRpY0ltYWdlLCBuYW1lOiBzdHJpbmcpe1xuXHRcdHRoaXMubGF5ZXJNYXAuZ2V0KHRoaXMuZGVmYXVsdExheWVyKS5zZXQobmFtZSwgaW1hZ2UpO1xuXHR9XG5cblx0YWRkTGF5ZXIoXG5cdCAgaW1hZ2VEZXRhaWxzOiBBcnJheTxJbWFnZVN0cnVjdD4sIFxuXHQgIGxheWVyTmFtZTogc3RyaW5nLCBcblx0ICBsYXllclRyYW5zZm9ybTogVHJhbnNmb3JtID0gQmFzaWNUcmFuc2Zvcm0udW5pdFRyYW5zZm9ybSk6IENvbnRhaW5lckxheWVyIHtcblxuXHRcdGxldCBpbWFnZUxheWVyID0gbmV3IENvbnRhaW5lckxheWVyKGxheWVyVHJhbnNmb3JtLCAxLCB0cnVlKTtcdFxuXG5cdFx0Zm9yICh2YXIgaW1hZ2Ugb2YgaW1hZ2VEZXRhaWxzKXtcblx0XHRcdGxldCBzdGF0aWNJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZShpbWFnZSwgaW1hZ2Uuc3JjLCBcblx0XHRcdFx0aW1hZ2Uub3BhY2l0eSwgaW1hZ2UudmlzaWJsZSk7XG5cdFx0XHRpbWFnZUxheWVyLnNldChpbWFnZS5uYW1lLCBzdGF0aWNJbWFnZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5sYXllck1hcC5zZXQobGF5ZXJOYW1lLCBpbWFnZUxheWVyKTtcblxuXHRcdHJldHVybiBpbWFnZUxheWVyO1xuXHR9XG5cblx0Z2V0TGF5ZXJzKCk6IE1hcDxzdHJpbmcsIENvbnRhaW5lckxheWVyPiB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXA7XG5cdH1cblxuXHRnZXRMYXllcihuYW1lOiBzdHJpbmcpOiBDb250YWluZXJMYXllciB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXAuZ2V0KG5hbWUpO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNsYXNzIENvbnRhaW5lckxheWVyTWFuYWdlciB7XG5cblx0cHJpdmF0ZSBjb250YWluZXJMYXllcjogQ29udGFpbmVyTGF5ZXI7XG5cdHByaXZhdGUgc2VsZWN0ZWQ6IHN0cmluZztcblx0XG5cdGNvbnN0cnVjdG9yKGNvbnRhaW5lckxheWVyOiBDb250YWluZXJMYXllciwgXG5cdCAgcmVhZG9ubHkgZGlzcGxheUxheWVyOiBDb250YWluZXJMYXllciA9IGNvbnRhaW5lckxheWVyKSB7XG5cdFx0dGhpcy5jb250YWluZXJMYXllciA9IGNvbnRhaW5lckxheWVyO1xuXHR9XG5cblx0c2V0TGF5ZXJDb250YWluZXIoY29udGFpbmVyTGF5ZXI6IENvbnRhaW5lckxheWVyKSB7XG5cdFx0dGhpcy5jb250YWluZXJMYXllciA9IGNvbnRhaW5lckxheWVyO1xuXHR9XG5cblx0c2V0U2VsZWN0ZWQobmFtZTogc3RyaW5nKTogUmVjdExheWVyIHtcblx0XHR0aGlzLnNlbGVjdGVkID0gbmFtZTtcblxuXHRcdGxldCBsYXllcjogQ2FudmFzTGF5ZXIgPSB0aGlzLmNvbnRhaW5lckxheWVyLmdldCh0aGlzLnNlbGVjdGVkKTtcblxuXHRcdGxldCBsYXllclJlY3QgPSBuZXcgUmVjdExheWVyKGxheWVyLmdldERpbWVuc2lvbigpLCAxLCB0cnVlKTtcblxuXHRcdGxldCBsYXllck5hbWUgPSBcIm91dGxpbmVcIjtcblxuXHRcdHRoaXMuZGlzcGxheUxheWVyLnNldChsYXllck5hbWUsIGxheWVyUmVjdCk7XG5cblx0XHRyZXR1cm4gbGF5ZXJSZWN0O1xuXHR9XG5cblx0dG9nZ2xlVmlzaWJpbGl0eShzZWxlY3RlZDogYm9vbGVhbiA9IHRydWUpe1xuXHRcdGxldCB0b2dnbGVHcm91cDogQXJyYXk8RGlzcGxheUVsZW1lbnQ+ID0gW107XG5cdFx0aWYgKHNlbGVjdGVkKXtcblx0XHRcdGlmICh0aGlzLnNlbGVjdGVkICE9IFwiXCIpe1xuXHRcdFx0XHR0b2dnbGVHcm91cC5wdXNoKHRoaXMuY29udGFpbmVyTGF5ZXIuZ2V0KHRoaXMuc2VsZWN0ZWQpKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Zm9yIChsZXQgcGFpciBvZiB0aGlzLmNvbnRhaW5lckxheWVyLmxheWVyTWFwKXtcblxuXHRcdFx0XHRpZiAocGFpclswXSAhPSB0aGlzLnNlbGVjdGVkKXtcblx0XHRcdFx0XHR0b2dnbGVHcm91cC5wdXNoKHBhaXJbMV0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwibGF5ZXJOYW1lOiBcIiArIHRoaXMuc2VsZWN0ZWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Zm9yIChsZXQgZWxlbWVudCBvZiB0b2dnbGVHcm91cCl7XG5cdFx0XHRlbGVtZW50LnNldFZpc2libGUoIWVsZW1lbnQuaXNWaXNpYmxlKCkpXG5cdFx0fVxuXHR9XG5cbn0iLCJpbXBvcnQgeyBUcmFuc2Zvcm0sIEJhc2ljVHJhbnNmb3JtLCBjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgRHJhd0xheWVyLCBDYW52YXNMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBEaXNwbGF5RWxlbWVudCwgWm9vbURpc3BsYXlSYW5nZSB9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IERpbWVuc2lvbiwgcm90YXRlLCBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRodW1iIGV4dGVuZHMgRGlzcGxheUVsZW1lbnQge1xuXG5cdGRyYXdUaHVtYihjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdzogbnVtYmVyLCBoOiBudW1iZXIpOiBib29sZWFuO1xuXG59XG5cbmV4cG9ydCBjbGFzcyBTdGF0aWNJbWFnZSBleHRlbmRzIERyYXdMYXllciBpbXBsZW1lbnRzIFRodW1iIHtcblxuXHRwcml2YXRlIGltZzogSFRNTEltYWdlRWxlbWVudDtcblxuXHRjb25zdHJ1Y3Rvcihsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0ICBpbWFnZVNyYzogc3RyaW5nLCBcblx0ICBvcGFjaXR5OiBudW1iZXIsXG5cdCAgdmlzaWJsZTogYm9vbGVhbixcblx0ICB6b29tRGlzcGxheVJhbmdlOiBab29tRGlzcGxheVJhbmdlID0gWm9vbURpc3BsYXlSYW5nZS5BbGxab29tUmFuZ2UpIHtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCBvcGFjaXR5LCB2aXNpYmxlLCBpbWFnZVNyYywgem9vbURpc3BsYXlSYW5nZSk7XG5cdFx0XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0fVxuXG5cdHByaXZhdGUgZHJhd0ltYWdlKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVHJhbnNmb3JtKXtcblxuXHRcdGlmICh0aGlzLmlzVmlzaWJsZSgpICYmIHRoaXMuZ2V0Wm9vbURpc3BsYXlSYW5nZSgpLndpdGhpblJhbmdlKHZpZXcuem9vbVgpKXtcblx0XHRcdGxldCBjdHhUcmFuc2Zvcm0gPSBjb21iaW5lVHJhbnNmb3JtKHRoaXMsIHBhcmVudFRyYW5zZm9ybSk7XG5cblx0XHRcdHRoaXMucHJlcGFyZUN0eChjdHgsIGN0eFRyYW5zZm9ybSwgdmlldyk7XG5cdFx0XHRcblx0XHRcdGN0eC5nbG9iYWxBbHBoYSA9IHRoaXMub3BhY2l0eTtcblx0XHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDApO1xuXHRcdFx0Y3R4Lmdsb2JhbEFscGhhID0gMTtcblxuXHRcdFx0dGhpcy5jbGVhbkN0eChjdHgsIGN0eFRyYW5zZm9ybSwgdmlldyk7XG5cdFx0fVxuXHRcdFxuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHQgIHZpZXc6IFRyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0aWYgKHRoaXMudmlzaWJsZSAmJiB0aGlzLmltZy5jb21wbGV0ZSkge1xuXHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCBwYXJlbnRUcmFuc2Zvcm0sIHZpZXcpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGRyYXdUaHVtYihjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdzogbnVtYmVyLCBoOiBudW1iZXIpOiBib29sZWFuIHtcblx0XHRpZiAodGhpcy52aXNpYmxlICYmIHRoaXMuaW1nLmNvbXBsZXRlKSB7XG5cdFx0XHRsZXQgc2NhbGVYID0gdyAvIHRoaXMuaW1nLndpZHRoO1xuXHRcdFx0bGV0IHNjYWxlWSA9IGggLyB0aGlzLmltZy5oZWlnaHQ7XG5cdFx0XHRsZXQgc2NhbGUgPSBNYXRoLm1pbihzY2FsZVgsIHNjYWxlWSk7XG5cdFx0XHRjdHguc2NhbGUoc2NhbGUsIHNjYWxlKTtcblx0XHRcdC8vY29uc29sZS5sb2coXCJzY2FsZXggXCIgKyAodGhpcy5pbWcud2lkdGggKiBzY2FsZSkpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcInNjYWxleSBcIiArICh0aGlzLmltZy5oZWlnaHQgKiBzY2FsZSkpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcInh5IFwiICsgdGhpcy5pbWcueCArIFwiLCBcIiArIHRoaXMuaW1nLnkpO1xuXHRcdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZywgMCwgMCk7XG5cdFx0XHRjdHguc2NhbGUoMS9zY2FsZSwgMS9zY2FsZSk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Z2V0RGltZW5zaW9uKCk6IERpbWVuc2lvbiB7XG5cdFx0XG5cdFx0aWYgKHRoaXMuaW1nLmNvbXBsZXRlKXtcblx0XHRcdHZhciB3aWR0aCA9IHRoaXMuaW1nLndpZHRoICogdGhpcy56b29tWDtcblx0XHRcdHZhciBoZWlnaHQgPSB0aGlzLmltZy5oZWlnaHQgKiB0aGlzLnpvb21ZO1xuXG5cdFx0XHRsZXQgcDEgPSByb3RhdGUobmV3IFBvaW50MkQod2lkdGgsIDApLCB0aGlzLnJvdGF0aW9uKTtcblx0XHRcdGxldCBwMiA9IHJvdGF0ZShuZXcgUG9pbnQyRCh3aWR0aCwgLWhlaWdodCksIHRoaXMucm90YXRpb24pO1xuXHRcdFx0bGV0IHAzID0gcm90YXRlKG5ldyBQb2ludDJEKDAsIC1oZWlnaHQpLCB0aGlzLnJvdGF0aW9uKTtcblxuXHRcdFx0bGV0IG1pblggPSBNYXRoLm1pbigwLCBwMS54LCBwMi54LCBwMy54KTtcblx0XHRcdGxldCBtaW5ZID0gTWF0aC5taW4oMCwgcDEueSwgcDIueSwgcDMueSk7XG5cdFx0XHRsZXQgbWF4WCA9IE1hdGgubWF4KDAsIHAxLngsIHAyLngsIHAzLngpO1xuXHRcdFx0bGV0IG1heFkgPSBNYXRoLm1heCgwLCBwMS55LCBwMi55LCBwMy55KTtcblxuXHRcdFx0cmV0dXJuIG5ldyBEaW1lbnNpb24odGhpcy54ICsgbWluWCwgdGhpcy55IC0gbWF4WSwgbWF4WC1taW5YLCBtYXhZLW1pblkpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgRGltZW5zaW9uKHRoaXMueCwgdGhpcy55LCAwLCAwKTtcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgUmVjdExheWVyIGV4dGVuZHMgRHJhd0xheWVyIGltcGxlbWVudHMgRGlzcGxheUVsZW1lbnQge1xuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgZGltZW5zaW9uOiBEaW1lbnNpb24sIFxuXHRcdG9wYWNpdHk6IG51bWJlcixcblx0XHR2aXNpYmxlOiBib29sZWFuLFxuXHRcdHpvb21EaXNwbGF5UmFuZ2U6IFpvb21EaXNwbGF5UmFuZ2UgPSBab29tRGlzcGxheVJhbmdlLkFsbFpvb21SYW5nZSkge1xuXG5cdFx0c3VwZXIobmV3IEJhc2ljVHJhbnNmb3JtKGRpbWVuc2lvbi54LCBkaW1lbnNpb24ueSwgMSwgMSwgMCksIFxuXHRcdFx0b3BhY2l0eSwgdmlzaWJsZSwgXCJyZWN0XCIsIHpvb21EaXNwbGF5UmFuZ2UpO1xuXHR9XG5cblx0dXBkYXRlRGltZW5zaW9uKGRpbWVuc2lvbjogRGltZW5zaW9uKTogdm9pZCB7XG5cdFx0dGhpcy5kaW1lbnNpb24gPSBkaW1lbnNpb247XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdFx0dmlldzogVHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0XHRsZXQgeCA9ICh0aGlzLmRpbWVuc2lvbi54ICsgcGFyZW50VHJhbnNmb3JtLnggLSB2aWV3LngpICogdmlldy56b29tWDtcblx0XHRsZXQgeSA9ICh0aGlzLmRpbWVuc2lvbi55ICsgcGFyZW50VHJhbnNmb3JtLnkgLSB2aWV3LnkpICogdmlldy56b29tWTtcblxuXHRcdGN0eC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG5cdFx0Y3R4LnN0cm9rZVJlY3QoeCwgeSwgdGhpcy5kaW1lbnNpb24udyAqIHZpZXcuem9vbVgsIHRoaXMuZGltZW5zaW9uLmggKiB2aWV3Lnpvb21ZKTtcblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0Z2V0RGltZW5zaW9uKCk6IERpbWVuc2lvbiB7XG5cdFx0cmV0dXJuIHRoaXMuZGltZW5zaW9uO1xuXHR9XG5cbn1cbiIsImltcG9ydCB7IERyYXdMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBUcmFuc2Zvcm0sIEJhc2ljVHJhbnNmb3JtLCBWaWV3VHJhbnNmb3JtLCBjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgRGltZW5zaW9uIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuaW1wb3J0IHsgWm9vbURpc3BsYXlSYW5nZSB9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcblxuZXhwb3J0IGNsYXNzIFRpbGVTdHJ1Y3Qge1xuXHRcblx0Y29uc3RydWN0b3IoXG5cdFx0cHVibGljIHByZWZpeDogc3RyaW5nLFxuXHRcdHB1YmxpYyBzdWZmaXg6IHN0cmluZyxcblx0XHRwdWJsaWMgdGlsZURpcmVjdG9yeTogc3RyaW5nKXt9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB6b29tQnlMZXZlbCh6b29tTGV2ZWw6IG51bWJlcil7XG5cdHJldHVybiBNYXRoLnBvdygyLCB6b29tTGV2ZWwpO1xufVxuXG5leHBvcnQgY2xhc3MgVGlsZUxheWVyIGV4dGVuZHMgRHJhd0xheWVyIHtcblxuXHR0aWxlTWFuYWdlcjogVGlsZU1hbmFnZXI7XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0bG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdFx0cmVhZG9ubHkgdGlsZVN0cnVjdDogVGlsZVN0cnVjdCxcblx0XHR2aXNiaWxlOiBib29sZWFuLFxuXHRcdG5hbWU6IHN0cmluZyA9IFwidGlsZXNcIixcblx0XHR6b29tRGlzcGxheVJhbmdlOiBab29tRGlzcGxheVJhbmdlID0gWm9vbURpc3BsYXlSYW5nZS5BbGxab29tUmFuZ2UsIFxuXHRcdHB1YmxpYyB4T2Zmc2V0OiBudW1iZXIgPSAwLFxuXHRcdHB1YmxpYyB5T2Zmc2V0OiBudW1iZXIgPSAwLFxuXHRcdHB1YmxpYyB6b29tOiBudW1iZXIgPSAxLFxuXHRcdHJlYWRvbmx5IGdyaWRXaWR0aDogbnVtYmVyID0gMjU2LCBcblx0XHRyZWFkb25seSBncmlkSGVpZ2h0OiBudW1iZXIgPSAyNTYsXG5cdFx0b3BhY2l0eTogbnVtYmVyID0gMSl7XG5cblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybSwgb3BhY2l0eSwgdmlzYmlsZSwgbmFtZSwgem9vbURpc3BsYXlSYW5nZSk7XG5cblx0XHR0aGlzLnRpbGVNYW5hZ2VyID0gbmV3IFRpbGVNYW5hZ2VyKCk7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0aWYgKHRoaXMuZ2V0Wm9vbURpc3BsYXlSYW5nZSgpLndpdGhpblJhbmdlKHZpZXcuem9vbVgpKXtcblxuXHRcdFx0bGV0IGN0eFRyYW5zZm9ybSA9IGNvbWJpbmVUcmFuc2Zvcm0odGhpcywgcGFyZW50VHJhbnNmb3JtKTtcblxuXHRcdFx0bGV0IHpvb21XaWR0aDogbnVtYmVyID0gdGhpcy5ncmlkV2lkdGggKiBjdHhUcmFuc2Zvcm0uem9vbVhcblx0XHRcdGxldCB6b29tSGVpZ2h0OiBudW1iZXIgPSB0aGlzLmdyaWRIZWlnaHQgKiBjdHhUcmFuc2Zvcm0uem9vbVk7XG5cblx0XHRcdGxldCB0cmFuc2Zvcm1YID0gdmlldy54ICsgY3R4VHJhbnNmb3JtLng7XG5cdFx0XHRsZXQgdHJhbnNmb3JtWSA9IHZpZXcueSArIGN0eFRyYW5zZm9ybS55O1xuXG5cdFx0XHRsZXQgdmlld1ggPSB2aWV3LnggKiB2aWV3Lnpvb21YO1xuXHRcdFx0bGV0IHZpZXdZID0gdmlldy55ICogdmlldy56b29tWTtcblxuXHRcdFx0bGV0IHZpZXdXaWR0aCA9IHZpZXcud2lkdGggLyB2aWV3Lnpvb21YO1xuXHRcdFx0bGV0IHZpZXdIZWlnaHQgPSB2aWV3LmhlaWdodCAvIHZpZXcuem9vbVk7XG5cblx0XHRcdGxldCBncmlkQWNyb3NzID0gdmlld1dpZHRoIC8gem9vbVdpZHRoO1xuXHRcdFx0bGV0IGdyaWRIaWdoID0gdmlld0hlaWdodCAvIHpvb21IZWlnaHQ7XG5cblx0XHRcdGxldCB4TWluID0gTWF0aC5mbG9vcih0cmFuc2Zvcm1YIC8gem9vbVdpZHRoKTtcblx0XHRcdGxldCB4TWF4ID0gTWF0aC5jZWlsKCh0cmFuc2Zvcm1YICsgdmlld1dpZHRoKSAvIHpvb21XaWR0aCk7XG5cblx0XHRcdGxldCB5TWluID0gTWF0aC5mbG9vcih0cmFuc2Zvcm1ZIC8gem9vbUhlaWdodCk7XG5cdFx0XHRsZXQgeU1heCA9IE1hdGguY2VpbCgodHJhbnNmb3JtWSArIHZpZXdIZWlnaHQpIC8gem9vbUhlaWdodCk7XG5cblx0XHRcdC8vY29uc29sZS5sb2coXCJ4IHkgcyBcIiArIHhNaW4gKyBcIiwgXCIgKyB4TWF4ICsgXCI6IFwiICsgeU1pbiArIFwiLCBcIiArIHlNYXgpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImFjcm9zcyBoaWdoXCIgKyBncmlkQWNyb3NzICsgXCIsIFwiICsgZ3JpZEhpZ2gpO1xuXG5cdFx0XHR2YXIgZHJhd2luZ0NvbXBsZXRlID0gdHJ1ZTtcblxuXHRcdFx0bGV0IGZ1bGxab29tWCA9IGN0eFRyYW5zZm9ybS56b29tWCAqIHZpZXcuem9vbVg7XG5cdFx0XHRsZXQgZnVsbFpvb21ZID0gY3R4VHJhbnNmb3JtLnpvb21ZICogdmlldy56b29tWTtcblxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImZ1bGx6b29tcyBcIiArIGZ1bGxab29tWCArIFwiIFwiICsgZnVsbFpvb21ZKTtcblxuXHRcdFx0Y3R4LnNjYWxlKGZ1bGxab29tWCwgZnVsbFpvb21ZKTtcblxuXHRcdFx0Zm9yICh2YXIgeCA9IHhNaW47IHg8eE1heDsgeCsrKXtcblx0XHRcdFx0bGV0IHhNb3ZlID0geCAqIHRoaXMuZ3JpZFdpZHRoIC0gdHJhbnNmb3JtWCAvIGN0eFRyYW5zZm9ybS56b29tWDtcblx0XHRcdFx0Zm9yICh2YXIgeSA9IHlNaW47IHk8eU1heDsgeSsrKXtcblx0XHRcdFx0XHRsZXQgeU1vdmUgPSB5ICogdGhpcy5ncmlkSGVpZ2h0IC0gdHJhbnNmb3JtWSAvIGN0eFRyYW5zZm9ybS56b29tWTtcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKFwidGlsZSB4IHkgXCIgKyB4ICsgXCIgXCIgKyB5ICsgXCI6IFwiICsgeE1vdmUgKyBcIiwgXCIgKyB5TW92ZSk7XG5cblx0XHRcdFx0XHRjdHgudHJhbnNsYXRlKHhNb3ZlLCB5TW92ZSk7XG5cdFx0XHRcdFx0bGV0IHRpbGVTcmMgPSB0aGlzLnRpbGVTdHJ1Y3QudGlsZURpcmVjdG9yeSArIHRoaXMuem9vbSArIFwiL1wiICsgXG5cdFx0XHRcdFx0XHQoeCArIHRoaXMueE9mZnNldCkgKyBcIi9cIiArIFxuXHRcdFx0XHRcdFx0KHkgKyB0aGlzLnlPZmZzZXQpICsgdGhpcy50aWxlU3RydWN0LnN1ZmZpeDtcblxuXHRcdFx0XHRcdGlmICh0aGlzLnRpbGVNYW5hZ2VyLmhhcyh0aWxlU3JjKSkge1xuXHRcdFx0XHRcdFx0bGV0IGltYWdlVGlsZSA9IHRoaXMudGlsZU1hbmFnZXIuZ2V0KHRpbGVTcmMpO1xuXHRcdFx0XHRcdFx0ZHJhd2luZ0NvbXBsZXRlID0gZHJhd2luZ0NvbXBsZXRlICYmIGltYWdlVGlsZS5kcmF3KGN0eCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0bGV0IGltYWdlVGlsZSA9IG5ldyBJbWFnZVRpbGUoeCwgeSwgdGlsZVNyYyk7XG5cblx0XHRcdFx0XHRcdGRyYXdpbmdDb21wbGV0ZSA9IGRyYXdpbmdDb21wbGV0ZSAmJiBpbWFnZVRpbGUuZHJhdyhjdHgpO1xuXG5cdFx0XHRcdFx0XHR0aGlzLnRpbGVNYW5hZ2VyLnNldCh0aWxlU3JjLCBpbWFnZVRpbGUpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGN0eC50cmFuc2xhdGUoLXhNb3ZlLCAteU1vdmUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGN0eC5zY2FsZSgxIC8gZnVsbFpvb21YLCAxIC8gZnVsbFpvb21ZKTtcblxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImRyZXcgdGlsZXMgXCIgKyBkcmF3aW5nQ29tcGxldGUpO1xuXHRcdFx0cmV0dXJuIGRyYXdpbmdDb21wbGV0ZTtcblx0XHR9IGVsc2UgeyBcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fVxuXG5cdGdldERpbWVuc2lvbigpOiBEaW1lbnNpb24ge1xuXHRcdHJldHVybiBuZXcgRGltZW5zaW9uKDAsIDAsIDAsIDApO1xuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlTWFuYWdlciB7XG5cblx0dGlsZU1hcDogTWFwPHN0cmluZywgSW1hZ2VUaWxlPjtcblxuXHRjb25zdHJ1Y3Rvcigpe1xuXHRcdHRoaXMudGlsZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBJbWFnZVRpbGU+KCk7XG5cdH1cblxuXHRnZXQodGlsZUtleTogc3RyaW5nKTogSW1hZ2VUaWxlIHtcblx0XHRyZXR1cm4gdGhpcy50aWxlTWFwLmdldCh0aWxlS2V5KTtcblx0fVxuXG5cdGhhcyh0aWxlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy50aWxlTWFwLmhhcyh0aWxlS2V5KTtcblx0fVxuXG5cdHNldCh0aWxlS2V5OiBzdHJpbmcsIHRpbGU6IEltYWdlVGlsZSl7XG5cdFx0dGhpcy50aWxlTWFwLnNldCh0aWxlS2V5LCB0aWxlKTtcblx0fVxuXG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZVRpbGUge1xuXG5cdHByaXZhdGUgaW1nOiBIVE1MSW1hZ2VFbGVtZW50O1xuXHRwcml2YXRlIGV4aXN0czogYm9vbGVhbjtcblxuXHRjb25zdHJ1Y3RvcihyZWFkb25seSB4SW5kZXg6IG51bWJlciwgcmVhZG9ubHkgeUluZGV4OiBudW1iZXIsIGltYWdlU3JjOiBzdHJpbmcpIHtcblx0XHR0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuXHRcdHRoaXMuaW1nLnNyYyA9IGltYWdlU3JjO1xuXHRcdHRoaXMuaW1nLm9uZXJyb3IgPSBmdW5jdGlvbihldmVudE9yTWVzc2FnZTogYW55KXtcblx0XHRcdGV2ZW50T3JNZXNzYWdlLnRhcmdldC5zcmMgPSBcIlwiO1xuXHRcdH07XG5cdH07XG5cblx0cHJpdmF0ZSBkcmF3SW1hZ2UoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpe1xuXHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDApO1xuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCk6IGJvb2xlYW4ge1xuXHRcdGlmICh0aGlzLmltZy5zcmMgIT0gXCJcIiAmJiB0aGlzLmltZy5jb21wbGV0ZSApIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xuXG59IiwiLyoqXG4qIEEgd29ybGQgaXMgMCwwIGJhc2VkIGJ1dCBhbnkgZWxlbWVudCBjYW4gYmUgcG9zaXRpb25lZCByZWxhdGl2ZSB0byB0aGlzLlxuKi9cbmV4cG9ydCBpbnRlcmZhY2UgVHJhbnNmb3JtIHtcblx0eDogbnVtYmVyO1xuXHR5OiBudW1iZXI7XG5cdHpvb21YOiBudW1iZXI7XG5cdHpvb21ZOiBudW1iZXI7XG5cdHJvdGF0aW9uOiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBCYXNpY1RyYW5zZm9ybSBpbXBsZW1lbnRzIFRyYW5zZm9ybSB7XG5cbiAgICBzdGF0aWMgcmVhZG9ubHkgdW5pdFRyYW5zZm9ybSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgwLCAwLCAxLCAxLCAwKTtcblxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgeDogbnVtYmVyLCBwdWJsaWMgeTogbnVtYmVyLCBcblx0XHRwdWJsaWMgem9vbVg6IG51bWJlciwgcHVibGljIHpvb21ZOiBudW1iZXIsIFxuXHRcdHB1YmxpYyByb3RhdGlvbjogbnVtYmVyKXt9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21iaW5lVHJhbnNmb3JtKGNoaWxkOiBUcmFuc2Zvcm0sIGNvbnRhaW5lcjogVHJhbnNmb3JtKTogVHJhbnNmb3JtIHtcblx0bGV0IHpvb21YID0gY2hpbGQuem9vbVggKiBjb250YWluZXIuem9vbVg7XG5cdC8vY29uc29sZS5sb2coXCJtb2RpZmllZCBcIiArIGNoaWxkLnpvb21YICsgXCIgdG8gXCIgKyB6b29tWCk7XG5cdGxldCB6b29tWSA9IGNoaWxkLnpvb21ZICogY29udGFpbmVyLnpvb21ZO1xuXHQvL2NvbnNvbGUubG9nKFwibW9kaWZpZWQgXCIgKyBjaGlsZC56b29tWSArIFwiIGJ5IFwiICsgY29udGFpbmVyLnpvb21ZICsgXCIgdG8gXCIgKyB6b29tWSk7XG5cdGxldCB4ID0gKGNoaWxkLnggKiBjb250YWluZXIuem9vbVgpICsgY29udGFpbmVyLng7XG5cdGxldCB5ID0gKGNoaWxkLnkgKiBjb250YWluZXIuem9vbVkpICsgY29udGFpbmVyLnk7XG5cdC8vY29uc29sZS5sb2coXCJtb2RpZmllZCB4IFwiICsgY2hpbGQueCArIFwiIGJ5IFwiICsgY29udGFpbmVyLnpvb21YICsgXCIgYW5kIFwiICsgY29udGFpbmVyLnggKyBcIiB0byBcIiArIHgpO1xuXHRsZXQgcm90YXRpb24gPSBjaGlsZC5yb3RhdGlvbiArIGNvbnRhaW5lci5yb3RhdGlvbjtcblx0cmV0dXJuIG5ldyBCYXNpY1RyYW5zZm9ybSh4LCB5LCB6b29tWCwgem9vbVksIHJvdGF0aW9uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKHRyYW5zZm9ybTogVHJhbnNmb3JtKTogVHJhbnNmb3JtIHtcblx0cmV0dXJuIG5ldyBCYXNpY1RyYW5zZm9ybSh0cmFuc2Zvcm0ueCwgdHJhbnNmb3JtLnksIFxuXHRcdHRyYW5zZm9ybS56b29tWCwgdHJhbnNmb3JtLnpvb21ZLCB0cmFuc2Zvcm0ucm90YXRpb24pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0VHJhbnNmb3JtKHdvcmxkU3RhdGU6IFRyYW5zZm9ybSk6IFRyYW5zZm9ybSB7XG5cdHJldHVybiBuZXcgQmFzaWNUcmFuc2Zvcm0oLXdvcmxkU3RhdGUueCwgLXdvcmxkU3RhdGUueSwgXG5cdFx0MS93b3JsZFN0YXRlLnpvb21YLCAxL3dvcmxkU3RhdGUuem9vbVksIC13b3JsZFN0YXRlLnJvdGF0aW9uKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBWaWV3VHJhbnNmb3JtIGV4dGVuZHMgVHJhbnNmb3JtIHtcblx0d2lkdGg6IG51bWJlcjtcblx0aGVpZ2h0OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBCYXNpY1ZpZXdUcmFuc2Zvcm0gZXh0ZW5kcyBCYXNpY1RyYW5zZm9ybSBpbXBsZW1lbnRzIFZpZXdUcmFuc2Zvcm0ge1xuXG5cdGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyLCBcblx0XHRyZWFkb25seSB3aWR0aDogbnVtYmVyLCByZWFkb25seSBoZWlnaHQ6IG51bWJlcixcblx0XHR6b29tWDogbnVtYmVyLCB6b29tWTogbnVtYmVyLCBcblx0ICAgIHJvdGF0aW9uOiBudW1iZXIpe1xuXG5cdFx0c3VwZXIoeCwgeSwgem9vbVgsIHpvb21ZLCByb3RhdGlvbik7XG5cdH1cblxufVxuXG5cblxuIiwibW9kdWxlLmV4cG9ydHM9W1xuXHR7XG5cdFwibmFtZVwiOiBcIjItMlwiLCBcInhcIjogLTM2NCwgXCJ5XCI6IC0xMi41LCBcInpvb21YXCI6IDAuMjEzLCBcInpvb21ZXCI6IDAuMjA1LCBcInJvdGF0aW9uXCI6IC0wLjMxLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDJyXzJbU1ZDMl0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiM1wiLCBcInhcIjogLTIxNiwgXCJ5XCI6IC0wLjcwNSwgXCJ6b29tWFwiOiAwLjIsIFwiem9vbVlcIjogMC4yMSwgXCJyb3RhdGlvblwiOiAtMC41MSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDAzcltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI0XCIsIFwieFwiOiAtNzQuMjksIFwieVwiOiAtOTkuNzgsIFwiem9vbVhcIjogMC4yMjIsIFwiem9vbVlcIjogMC4yMDgsIFwicm90YXRpb25cIjogLTAuMjg1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDRyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjVcIiwgXCJ4XCI6IC0zNjYuNSwgXCJ5XCI6IDE4MC4wMTksIFwiem9vbVhcIjogMC4yMTUsIFwiem9vbVlcIjogMC4yMDcsIFwicm90YXRpb25cIjogLTAuMjEsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwNXJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiNlwiLCBcInhcIjogLTIwNi4xNiwgXCJ5XCI6IDE0NiwgXCJ6b29tWFwiOiAwLjIxLCBcInpvb21ZXCI6IDAuMjA4LCBcInJvdGF0aW9uXCI6IC0wLjIxNSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA2cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI3XCIsIFwieFwiOiAtNjMuMywgXCJ5XCI6IDEwMC4zNzc2LCBcInpvb21YXCI6IDAuMjEyNSwgXCJ6b29tWVwiOiAwLjIxMywgXCJyb3RhdGlvblwiOiAtMC4yMywgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA3cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI4XCIsIFwieFwiOiA3OC4xLCBcInlcIjogNTguNTM1LCBcInpvb21YXCI6IDAuMjA3LCBcInpvb21ZXCI6IDAuMjE3LCBcInJvdGF0aW9uXCI6IC0wLjI1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDhyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjlcIiwgXCJ4XCI6IDIxOS41LCBcInlcIjogMjQsIFwiem9vbVhcIjogMC4yMTUsIFwiem9vbVlcIjogMC4yMTQ1LCBcInJvdGF0aW9uXCI6IC0wLjI2LFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwOXJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTBcIiwgXCJ4XCI6IDQ1NC4yMSwgXCJ5XCI6IC0xLjUsIFwiem9vbVhcIjogMC4yMTgsIFwiem9vbVlcIjogMC4yMTQsIFwicm90YXRpb25cIjogMC4wMTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxMHJfMltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxMVwiLCBcInhcIjogNjIxLjg2LCBcInlcIjogMjUuNTI1LCBcInpvb21YXCI6IDAuMjEzLCBcInpvb21ZXCI6IDAuMjExNSwgXCJyb3RhdGlvblwiOiAwLjExLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTFyW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LCBcblx0e1xuXHRcIm5hbWVcIjogXCIxMi0xXCIsIFwieFwiOiA3NjkuNjQ1LCBcInlcIjogNTAuMjY1LCBcInpvb21YXCI6IDAuNDI0LCBcInpvb21ZXCI6IDAuNDIyLCBcInJvdGF0aW9uXCI6IDAuMTIsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxMnJfMVtTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxNFwiLCBcInhcIjogLTkxNS42LCBcInlcIjogNTU3Ljg2NSwgXCJ6b29tWFwiOiAwLjIwOCwgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAtMS4yMTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxNFJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTUtMlwiLCBcInhcIjogLTcxNy4zLCBcInlcIjogNTcyLCBcInpvb21YXCI6IDAuMjEsIFwiem9vbVlcIjogMC4yMDYsIFwicm90YXRpb25cIjogLTEuNDcsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxNXJfMltTVkMyXS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxNi0yXCIsIFwieFwiOiAtOTIsIFwieVwiOiAzMzYuNSwgXCJ6b29tWFwiOiAwLjIxNywgXCJ6b29tWVwiOiAwLjIxLCBcInJvdGF0aW9uXCI6IC0wLjEsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxNnJfMltTVkMyXS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxN1wiLCBcInhcIjogNzcsIFwieVwiOiAyNzguNSwgXCJ6b29tWFwiOiAwLjIwNiwgXCJ6b29tWVwiOiAwLjIwNiwgXCJyb3RhdGlvblwiOiAtMC4wNTUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxN1JbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMThcIiwgXCJ4XCI6IDIyOSwgXCJ5XCI6IDIzOS41LCBcInpvb21YXCI6IDAuMjA4LCBcInpvb21ZXCI6IDAuMjA4LCBcInJvdGF0aW9uXCI6IDAuMDcsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxOFJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTlcIiwgXCJ4XCI6IDcxLjUsIFwieVwiOiA0NzQsIFwiem9vbVhcIjogMC4yMDMsIFwiem9vbVlcIjogMC4yMDgsIFwicm90YXRpb25cIjogMC4xNywgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDE5UltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIyMFwiLCBcInhcIjogNDMuNSwgXCJ5XCI6IDY0MCwgXCJ6b29tWFwiOiAwLjEsIFwiem9vbVlcIjogMC4xMDQsIFwicm90YXRpb25cIjogMC4yMDUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAyMFJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH1cblxuXVxuXG5cblxuIiwibW9kdWxlLmV4cG9ydHM9W1xuXHR7XG5cdFx0XCJuYW1lXCI6IFwiaGVucmlldHRhXCIsIFwieFwiOiAtNDg2LjUsIFwieVwiOiAtMjUyLjUsIFwiem9vbVhcIjogMC4yOSwgXCJ6b29tWVwiOiAwLjUsIFwicm90YXRpb25cIjogMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2hlbnJpZXR0YS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtYXRlclwiLCBcInhcIjogLTM0MiwgXCJ5XCI6IC03NDcsIFwiem9vbVhcIjogMC4wOCwgXCJ6b29tWVwiOiAwLjE4LCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbWF0ZXJtaXMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwicGV0ZXJzXCIsIFwieFwiOiAtNzE5LCBcInlcIjogLTgzNiwgXCJ6b29tWFwiOiAwLjA3LCBcInpvb21ZXCI6IDAuMTQsIFwicm90YXRpb25cIjogLTAuMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9wZXRlcnMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwib2Nvbm5lbGxcIiwgXCJ4XCI6IC04MjEsIFwieVwiOiAtMTgzNSwgXCJ6b29tWFwiOiAwLjI1LCBcInpvb21ZXCI6IDAuMjUsIFwicm90YXRpb25cIjogMCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL29jb25uZWxsLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiZm91cmNvdXJ0c1wiLCBcInhcIjogLTU2Ny41LCBcInlcIjogMzIzLjUsIFwiem9vbVhcIjogMC4xNiwgXCJ6b29tWVwiOiAwLjMyOCwgXCJyb3RhdGlvblwiOiAtMC4xMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2ZvdXJjb3VydHMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJtaWNoYW5zXCIsIFwieFwiOiAtNjM5LCBcInlcIjogMTYwLCBcInpvb21YXCI6IDAuMTQsIFwiem9vbVlcIjogMC4yNCwgXCJyb3RhdGlvblwiOiAwLjAyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbWljaGFucy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjhcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInRoZWNhc3RsZVwiLCBcInhcIjogLTI5MCwgXCJ5XCI6IDUyMCwgXCJ6b29tWFwiOiAwLjIyLCBcInpvb21ZXCI6IDAuNDIsIFwicm90YXRpb25cIjogLTAuMDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvdGhlY2FzdGxlLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm1hcmtldFwiLCBcInhcIjogLTYxNywgXCJ5XCI6IDU2NSwgXCJ6b29tWFwiOiAwLjE1LCBcInpvb21ZXCI6IDAuMjYsIFwicm90YXRpb25cIjogMC4wNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21hcmtldC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjVcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcInBhdHJpY2tzXCIsIFwieFwiOiAtNDYyLCBcInlcIjogNzk1LCBcInpvb21YXCI6IDAuMSwgXCJ6b29tWVwiOiAwLjEyLCBcInJvdGF0aW9uXCI6IDAuMDQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9wYXRyaWNrcy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjhcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm5naXJlbGFuZFwiLCBcInhcIjogNDMxLCBcInlcIjogNjk0LCBcInpvb21YXCI6IDAuMTQsIFwiem9vbVlcIjogMC4zNzUsIFwicm90YXRpb25cIjogLTAuMTM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbmdpcmVsYW5kLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiYmx1ZWNvYXRzXCIsIFwieFwiOiAtOTk3LCBcInlcIjogODYsIFwiem9vbVhcIjogMC4xLCBcInpvb21ZXCI6IDAuMiwgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2JsdWVjb2F0cy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjZcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImNvbGxpbnNiYXJyYWNrc1wiLCBcInhcIjogLTExMzAsIFwieVwiOiA5MCwgXCJ6b29tWFwiOiAwLjEzLCBcInpvb21ZXCI6IDAuMzcsIFwicm90YXRpb25cIjogMC4wMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9jb2xsaW5zYmFycmFja3MucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJodWdobGFuZVwiLCBcInhcIjogLTE3MiwgXCJ5XCI6IC0zMzUsIFwiem9vbVhcIjogMC4yLCBcInpvb21ZXCI6IDAuMzMsIFwicm90YXRpb25cIjogLTAuMDYsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9odWdobGFuZS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcImdwb1wiLCBcInhcIjogNTIsIFwieVwiOiA1MCwgXCJ6b29tWFwiOiAwLjA4NiwgXCJ6b29tWVwiOiAwLjI1LCBcInJvdGF0aW9uXCI6IC0wLjAzNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL2dwby5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIm1vdW50am95XCIsIFwieFwiOiAyNjMsIFwieVwiOiAtNTYwLCBcInpvb21YXCI6IDAuMTUsIFwiem9vbVlcIjogMC4yODUsIFwicm90YXRpb25cIjogMC4xNywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL21vdW50am95LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibW91bnRqb3liXCIsIFwieFwiOiAxNTIsIFwieVwiOiAtNTcwLCBcInpvb21YXCI6IDAuMiwgXCJ6b29tWVwiOiAwLjMwNSwgXCJyb3RhdGlvblwiOiAwLjA0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvbW91bnRqb3liLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwicm95YWxob3NwaXRhbFwiLCBcInhcIjogLTE4NTEsIFwieVwiOiA0ODcuNSwgXCJ6b29tWFwiOiAwLjIxLCBcInpvb21ZXCI6IDAuMywgXCJyb3RhdGlvblwiOiAtMC4wNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvbGFuZG1hcmtzL3JveWFsaG9zcGl0YWwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC45XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJwZXBwZXJcIiwgXCJ4XCI6IDgzNCwgXCJ5XCI6IDk5MCwgXCJ6b29tWFwiOiAwLjA2LCBcInpvb21ZXCI6IDAuMTQ1LCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvcGVwcGVyLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwibGliZXJ0eWhhbGxcIiwgXCJ4XCI6IDI3MCwgXCJ5XCI6IC0xNCwgXCJ6b29tWFwiOiAwLjQzLCBcInpvb21ZXCI6IDAuNDMsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL2xhbmRtYXJrcy9saWJlcnR5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwiY3VzdG9tc2hvdXNlXCIsIFwieFwiOiAzODIsIFwieVwiOiAxMDcsIFwiem9vbVhcIjogMC4xNSwgXCJ6b29tWVwiOiAwLjMwLCBcInJvdGF0aW9uXCI6IC0wLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy9sYW5kbWFya3MvY3VzdG9tc2hvdXNlLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9XG5dIiwibW9kdWxlLmV4cG9ydHM9W1xuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAzMlwiLCBcInhcIjogLTc0NSwgXCJ5XCI6IDEwLjA1LCBcInpvb21YXCI6IDAuMjUsIFwiem9vbVlcIjogMC4yNSwgXCJyb3RhdGlvblwiOiAtMS40MywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTAzMi1tLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNywgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNvbnN0aXR1dGlvbiBIaWxsIC0gVHVybnBpa2UsIEdsYXNuZXZpbiBSb2FkOyBzaG93aW5nIHByb3Bvc2VkIHJvYWQgdG8gQm90YW5pYyBHYXJkZW5zXCIsXG5cdFx0XCJkYXRlXCI6IDE3OThcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNzJcIiwgIFwieFwiOiAtMjYwLjUsIFwieVwiOiAtMjQ3LjUsIFwiem9vbVhcIjogMC4zMSwgXCJ6b29tWVwiOiAwLjMxLCBcInJvdGF0aW9uXCI6IDEuNTg1LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0wNzItbS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gb2YgaW1wcm92aW5nIHRoZSBzdHJlZXRzIGJldHdlZW4gUmljaG1vbmQgQnJpZGdlIChGb3VyIENvdXJ0cykgYW5kIENvbnN0aXR1dGlvbiBIaWxsIChLaW5n4oCZcyBJbm5zKSBEYXRlOiAxODM3XCIsXG5cdFx0XCJkYXRlXCI6IDE4Mzdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNzVcIiwgXCJ4XCI6IC0yMTcuNSwgXCJ5XCI6IC0xNDE0LjUsIFwiem9vbVhcIjogMC44NywgXCJ6b29tWVwiOiAwLjc3MiwgXCJyb3RhdGlvblwiOiAxLjYxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTA3NS1tLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIGEgbGluZSBvZiByb2FkLCBsZWFkaW5nIGZyb20gTGluZW4gSGFsbCB0byBHbGFzbmV2aW4gUm9hZCwgc2hvd2luZyB0aGUgUm95YWwgQ2FuYWwgRGF0ZTogMTgwMFwiLFxuXHRcdFwiZGF0ZVwiOiAxODAwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzYxXCIsIFwieFwiOiA0NjQsIFwieVwiOiAyMTMxLCBcInpvb21YXCI6IDAuNDM2LCBcInpvb21ZXCI6IDAuNDM2LCBcInJvdGF0aW9uXCI6IC0yLjA0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM2MS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkxlZXNvbiBTdHJlZXQsIFBvcnRsYW5kIFN0cmVldCAobm93IFVwcGVyIExlZXNvbiBTdHJlZXQpLCBFdXN0YWNlIFBsYWNlLCBFdXN0YWNlIEJyaWRnZSAobm93IExlZXNvbiBTdHJlZXQpLCBIYXRjaCBTdHJlZXQsIENpcmN1bGFyIFJvYWQgLSBzaWduZWQgYnkgQ29tbWlzc2lvbmVycyBvZiBXaWRlIFN0cmVldHMgRGF0ZTogMTc5MlwiLFxuXHRcdFwiZGF0ZVwiOiAxNzkyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTQyXCIsIFwieFwiOiA5NC45OTUsIFwieVwiOiAyMzc3LjUsIFwiem9vbVhcIjogMC40ODIsIFwiem9vbVlcIjogMC40NzYsIFwicm90YXRpb25cIjogLTIuMDE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTQyLWwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMS4wLFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgdGhlIE5ldyBTdHJlZXRzLCBhbmQgb3RoZXIgaW1wcm92ZW1lbnRzIGludGVuZGVkIHRvIGJlIGltbWVkaWF0ZWx5IGV4ZWN1dGVkLiBTaXR1YXRlIG9uIHRoZSBTb3V0aCBTaWRlIG9mIHRoZSBDaXR5IG9mIER1Ymxpbiwgc3VibWl0dGVkIGZvciB0aGUgYXBwcm9iYXRpb24gb2YgdGhlIENvbW1pc3Npb25lcnMgb2YgV2lkZSBTdHJlZXRzLCBwYXJ0aWN1bGFybHkgb2YgdGhvc2UgcGFydHMgYmVsb25naW5nIHRvIFdtLiBDb3BlIGFuZCBKb2huIExvY2tlciwgRXNxLiwgSGFyY291cnQgU3RyZWV0LCBDaGFybGVtb3VudCBTdHJlZXQsIFBvcnRvYmVsbG8sIGV0Yy4gRGF0ZTogMTc5MlwiLFxuXHRcdFwiZGF0ZVwiOiAxNzkyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTU1XCIsIFwieFwiOiAtMTUwNiwgXCJ5XCI6IC01MC41LCBcInpvb21YXCI6IDAuNjcsIFwiem9vbVlcIjogMC42NDQsIFwicm90YXRpb25cIjogLTAuMDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTU1LWwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJOZXcgYXBwcm9hY2ggZnJvbSBNaWxpdGFyeSBSb2FkIHRvIEtpbmfigJlzIEJyaWRnZSwgYW5kIGFsb25nIHRoZSBRdWF5cyB0byBBc3RvbuKAmXMgUXVheSBEYXRlOiAxODQxXCIsXG5cdFx0XCJkYXRlXCI6IDE4NDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNTctM1wiLCBcInhcIjogMy4xMTUsIFwieVwiOiAzLjY1LCBcInpvb21YXCI6IDAuNTI1LCBcInpvb21ZXCI6IDAuNTksIFwicm90YXRpb25cIjogMC41NCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE1Ny0zLW0ucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC4wLCBcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwic2hvd2luZyB0aGUgaW1wcm92ZW1lbnRzIHByb3Bvc2VkIGJ5IHRoZSBDb21taXNzaW9uZXJzIG9mIFdpZGUgU3RyZWV0cyBpbiBOYXNzYXUgU3RyZWV0LCBMZWluc3RlciBTdHJlZXQgYW5kIENsYXJlIFN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTY0XCIsIFwieFwiOiAtNDcyLCBcInlcIjo4MDUsIFwiem9vbVhcIjogMC4wNTYsIFwiem9vbVlcIjogMC4wNTYsIFwicm90YXRpb25cIjogMC4wOSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE2NC1sLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDEuMCwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBsYW4gb2YgU2FpbnQgUGF0cmlja+KAmXMsIGV0Yy4gRGF0ZTogMTgyNFwiLFxuXHRcdFwiZGF0ZVwiOiAxODI0XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDY5LTAyXCIsIFwieFwiOiAyNTUsIFwieVwiOiAxMzg5LjUsIFwiem9vbVhcIjogMC4yNDUsIFwiem9vbVlcIjogMC4yNDUsIFwicm90YXRpb25cIjogLTIuNzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy00NjktMi1tLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkVhcmxzZm9ydCBUZXJyYWNlLCBTdGVwaGVu4oCZcyBHcmVlbiBTb3V0aCBhbmQgSGFyY291cnQgU3RyZWV0IHNob3dpbmcgcGxhbiBvZiBwcm9wb3NlZCBuZXcgc3RyZWV0XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zNTUtMVwiLCBcInhcIjogNjk2LCBcInlcIjogNzEzLjUsIFwiem9vbVhcIjogMC4zMjMsIFwiem9vbVlcIjogMC4yODksIFwicm90YXRpb25cIjogMS4xNCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNTUtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIEJhZ2dvdCBTdHJlZXQgYW5kIEZpdHp3aWxsaWFtIFN0cmVldCwgc2hvd2luZyBhdmVudWVzIHRoZXJlb2YgTm8uIDEgRGF0ZTogMTc5MFwiLFxuXHRcdFwiZGF0ZVwiOiAxNzkwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNzI5XCIsIFwieFwiOiAtMTA5NiwgXCJ5XCI6IDY2OSwgXCJ6b29tWFwiOiAwLjEyNiwgXCJ6b29tWVwiOiAwLjExOCwgXCJyb3RhdGlvblwiOiAtMy40MjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy03MjktbC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBKYW1lc+KAmXMgU3RyZWV0LCBCYXNvbiBMYW5lLCBFY2hsaW7igJlzIExhbmUsIEdyYW5kIENhbmFsIFBsYWNlLCBDaXR5IEJhc29uIGFuZCBHcmFuZCBDYW5hbCBIYXJib3VyXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy03NTdcIiwgXCJ4XCI6IC04ODEsIFwieVwiOiAyNjEuNSwgXCJ6b29tWFwiOiAwLjM1NSwgXCJ6b29tWVwiOiAwLjM1NSwgXCJyb3RhdGlvblwiOiAtMC4wMjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy03NTctbC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQYXJ0IG9mIHRoZSBDaXR5IG9mIER1YmxpbiB3aXRoIHByb3Bvc2VkIGltcHJvdmVtZW50cy4gSW1wcm92ZW1lbnRzIHRvIGJlIG1hZGUgb3IgaW50ZW5kZWQgaW4gVGhvbWFzIFN0cmVldCwgSGlnaCBTdHJlZXQsIFdpbmV0YXZlcm4gU3RyZWV0LCBTa2lubmVyIFJvdywgV2VyYnVyZ2ggU3RyZWV0LCBDYW5vbiBTdHJlZXQsIFBhdHJpY2sgU3RyZWV0LCBLZXZpbiBTdHJlZXQsIEJpc2hvcCBTdHJlZXQgYW5kIFRoZSBDb29tYmUgVGhvbWFzIFNoZXJyYXJkIERhdGU6IDE4MTdcIixcblx0XHRcImRhdGVcIjogMTgxN1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTEzOFwiLCBcInhcIjogMjEyLjUsIFwieVwiOiAxNDcsIFwiem9vbVhcIjogMC4xOSwgXCJ6b29tWVwiOiAwLjE3NiwgXCJyb3RhdGlvblwiOiAwLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTM4LWwucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC40LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgcHJlbWlzZXMsIEdlb3JnZeKAmXMgUXVheSwgQ2l0eSBRdWF5LCBUb3duc2VuZCBTdHJlZXQgYW5kIG5laWdoYm91cmhvb2QsIHNob3dpbmcgcHJvcGVydHkgbG9zdCB0byB0aGUgQ2l0eSwgaW4gYSBzdWl0IGJ5ICdUaGUgQ29ycG9yYXRpb24gLSB3aXRoIFRyaW5pdHkgQ29sbGVnZSdcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE4OVwiLCBcInhcIjogLTc5Mi41LCBcInlcIjogMjYyLjUsIFwiem9vbVhcIjogMC4yNiwgXCJ6b29tWVwiOiAwLjI1OCwgXCJyb3RhdGlvblwiOiAwLjAwMywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xODkucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDb3B5IG9mIG1hcCBvZiBwcm9wb3NlZCBOZXcgU3RyZWV0IGZyb20gRXNzZXggU3RyZWV0IHRvIENvcm5tYXJrZXQsIHdpdGggdGhlIGVudmlyb25zIGFuZCBzdHJlZXRzIGJyYW5jaGluZyBvZmZcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA5OFwiLCBcInhcIjogLTQ3NSwgXCJ5XCI6IDUyNCwgXCJ6b29tWFwiOiAwLjA2MywgXCJ6b29tWVwiOiAwLjA2MywgXCJyb3RhdGlvblwiOiAtMC4xNiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTA5OC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBDaHJpc3RjaHVyY2gsIFNraW5uZXJzIFJvdyBldGMuIFRob21hcyBTaGVycmFyZCwgNSBKYW51YXJ5IDE4MjEgRGF0ZTogMTgyMVwiLFxuXHRcdFwiZGF0ZVwiOiAxODIxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjAyXCIsIFwieFwiOiAxNiwgXCJ5XCI6IDgxLCBcInpvb21YXCI6IDAuMjg5LCBcInpvb21ZXCI6IDAuMjYzLCBcInJvdGF0aW9uXCI6IC0wLjEwNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yMDItYy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjQsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcImFyZWEgaW1tZWRpYXRlbHkgbm9ydGggb2YgUml2ZXIgTGlmZmV5IGZyb20gU2Fja3ZpbGxlIFN0LCBMb3dlciBBYmJleSBTdCwgQmVyZXNmb3JkIFBsYWNlLCBhcyBmYXIgYXMgZW5kIG9mIE5vcnRoIFdhbGwuIEFsc28gc291dGggb2YgTGlmZmV5IGZyb20gV2VzdG1vcmxhbmQgU3RyZWV0IHRvIGVuZCBvZiBKb2huIFJvZ2Vyc29uJ3MgUXVheVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTc5XCIsIFwieFwiOiAtNTM3LjUsIFwieVwiOiA3MzAsIFwiem9vbVhcIjogMC4xNjgsIFwiem9vbVlcIjogMC4xNjQsIFwicm90YXRpb25cIjogMC4wMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xNzkucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMS4wLFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTYWludCBQYXRyaWNr4oCZcyBDYXRoZWRyYWwsIE5vcnRoIENsb3NlIGFuZCB2aWNpbml0eVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzI5XCIsIFwieFwiOiAtNjcwLjUsIFwieVwiOiAzNDcsIFwiem9vbVhcIjogMC4zMzgsIFwiem9vbVlcIjogMC4zMzIsIFwicm90YXRpb25cIjogLTAuMjEsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzI5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuMyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBmb3Igb3BlbmluZyBhbmQgd2lkZW5pbmcgYSBwcmluY2lwYWwgQXZlbnVlIHRvIHRoZSBDYXN0bGUsIG5vdyAoMTkwMCkgUGFybGlhbWVudCBTdHJlZXQgLSBzaG93aW5nIERhbWUgU3RyZWV0LCBDYXN0bGUgU3RyZWV0LCBhbmQgYWxsIHRoZSBBdmVudWVzIHRoZXJlb2YgRGF0ZTogMTc1N1wiLFxuXHRcdFwiZGF0ZVwiOiAxNzU3XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTg3XCIsIFwieFwiOiAtMjI2LCBcInlcIjogNDk0LjUsIFwiem9vbVhcIjogMC4wNjYsIFwiem9vbVlcIjogMC4wNjQsIFwicm90YXRpb25cIjogMC4wLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE4Ny5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAxLjAsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkEgc3VydmV5IG9mIHNldmVyYWwgaG9sZGluZ3MgaW4gU291dGggR3JlYXQgR2VvcmdlJ3MgU3RyZWV0IC0gdG90YWwgcHVyY2hhc2UgwqMxMTUyOC4xNi4zIERhdGU6MTgwMVwiLFxuXHRcdFwiZGF0ZVwiOiAxODAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTI0XCIsIFwieFwiOiAtMjc5LCBcInlcIjogMzY2LCBcInpvb21YXCI6IDAuMDU3LCBcInpvb21ZXCI6IDAuMDUxLCBcInJvdGF0aW9uXCI6IC0wLjE2LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTEyNC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjQsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwcmVtaXNlcyBpbiBFc3NleCBTdHJlZXQgYW5kIFBhcmxpYW1lbnQgU3RyZWV0LCBzaG93aW5nIEVzc2V4IEJyaWRnZSBhbmQgT2xkIEN1c3RvbSBIb3VzZS4gVC4gYW5kIEQuSC4gU2hlcnJhcmQgRGF0ZTogMTgxM1wiLFxuXHRcdFwiZGF0ZVwiOiAxODEzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzYwXCIsIFwieFwiOiAtMTQ0LCBcInlcIjogNDIxLjUsIFwiem9vbVhcIjogMC4xMjEsIFwiem9vbVlcIjogMC4xMDcsIFwicm90YXRpb25cIjogLTAuMDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzYwLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gRGFtZSBTdHJlZXQgYW5kIGF2ZW51ZXMgdGhlcmVvZiAtIEV1c3RhY2UgU3RyZWV0LCBDZWNpbGlhIFN0cmVldCwgYW5kIHNpdGUgb2YgT2xkIFRoZWF0cmUsIEZvd25lcyBTdHJlZXQsIENyb3duIEFsbGV5IGFuZCBDb3BlIFN0cmVldCBEYXRlOiAxNzkyXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzkyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzYyXCIsIFwieFwiOiAzNS41LCBcInlcIjogODQuNSwgXCJ6b29tWFwiOiAwLjIyOSwgXCJ6b29tWVwiOiAwLjIzNSwgXCJyb3RhdGlvblwiOiAwLjEyNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0zNjItMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjQsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcHMgLSBDb2xsZWdlIEdyZWVuLCBDb2xsZWdlIFN0cmVldCwgV2VzdG1vcmVsYW5kIFN0cmVldCBhbmQgYXZlbnVlcyB0aGVyZW9mLCBzaG93aW5nIHRoZSBzaXRlIG9mIFBhcmxpYW1lbnQgSG91c2UgYW5kIFRyaW5pdHkgQ29sbGVnZSBOby4gMSBEYXRlOiAxNzkzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzkzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzg3XCIsIFwieFwiOiAyNzIuNSwgXCJ5XCI6IDQyMy41LCBcInpvb21YXCI6IDAuMDgxLCBcInpvb21ZXCI6IDAuMDc3LCBcInJvdGF0aW9uXCI6IDMuMDM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM4Ny5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiBob2xkaW5ncyBpbiBGbGVldCBTdHJlZXQgYW5kIENvbGxlZ2UgU3RyZWV0LCBzaG93aW5nIHNpdGUgb2YgT2xkIFdhdGNoIEhvdXNlIERhdGU6IDE4MDFcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yMThcIiwgXCJ4XCI6IC0yNDU1LCBcInlcIjogLTI4NC41LCBcInpvb21YXCI6IDAuNDUzLCBcInpvb21ZXCI6IDAuNDUxLCBcInJvdGF0aW9uXCI6IC0wLjA0LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTIxOC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiB0aGUgTG9uZyBNZWFkb3dzIGFuZCBwYXJ0IG9mIHRoZSBQaG9lbml4IFBhcmsgYW5kIFBhcmtnYXRlIFN0cmVldCBEYXRlOiAxNzg2XCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzg2XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjI5XCIsIFwieFwiOiAtMjM4NCwgXCJ5XCI6IDU1LjUsIFwiem9vbVhcIjogMC4zNzksIFwiem9vbVlcIjogMC4zNzksIFwicm90YXRpb25cIjogMC4wMTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjI5LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU2VjdGlvbiBhY3Jvc3MgdGhlIHByb3Bvc2VkIFJvYWQgZnJvbSB0aGUgUGFyayBHYXRlIHRvIElzbGFuZCBCcmlkZ2UgR2F0ZSAtIG5vdyAoMTkwMCkgQ29ueW5naGFtIFJvYWQgRGF0ZTogMTc4OVwiLCBcblx0XHRcImRhdGVcIjogMTc4OVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTI0MlwiLCBcInhcIjogLTQwNS41LCBcInlcIjogMjEsIFwiem9vbVhcIjogMC4wODQsIFwiem9vbVlcIjogMC4wODQsIFwicm90YXRpb25cIjogMS4wODUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjQyLTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJTdXJ2ZXkgb2YgYSBob2xkaW5nIGluIE1hcnnigJlzIExhbmUsIHRoZSBlc3RhdGUgb2YgdGhlIFJpZ2h0IEhvbm91cmFibGUgTG9yZCBNb3VudGpveSBEYXRlOiAxNzkzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxNzkzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjQ1XCIsIFwieFwiOiAtMjEwLjAsIFwieVwiOi0zOTcuNSwgXCJ6b29tWFwiOiAwLjA4NCwgXCJ6b29tWVwiOiAwLjA4NCwgXCJyb3RhdGlvblwiOiAtMC42MiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yNDUtMi5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiB0aGUgQmFybGV5IEZpZWxkcyBldGMuLCBhbmQgYSBwbGFuIGZvciBvcGVuaW5nIGEgc3RyZWV0IGZyb20gUnV0bGFuZCBTcXVhcmUsIERvcnNldCBTdHJlZXQsIGJlaW5nIG5vdyAoMTg5OSkga25vd24gYXMgU291dGggRnJlZGVyaWNrIFN0cmVldCAtIHdpdGggcmVmZXJlbmNlIERhdGU6IDE3ODlcIixcblx0XHQgXCJkYXRlXCI6IDE3ODlcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yNTdcIiwgXCJ4XCI6IDY4MS4wLCBcInlcIjotMTIyMy41LCBcInpvb21YXCI6IDAuMzQ2LCBcInpvb21ZXCI6IDAuMzg4LCBcInJvdGF0aW9uXCI6IDAuMjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjU3LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIENsb25saWZmZSBSb2FkIGFuZCB0aGUgT2xkIFR1cm5waWtlIEhvdXNlIGF0IEJhbGx5Ym91Z2ggQnJpZGdlIC0gTm9ydGggU3RyYW5kIERhdGU6IDE4MjNcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MjNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yNjhcIiwgXCJ4XCI6IC0xNTI4LjAsIFwieVwiOiAxMDUuNSwgXCJ6b29tWFwiOiAwLjA4NiwgXCJ6b29tWVwiOiAwLjA4NiwgXCJyb3RhdGlvblwiOiAwLjA3LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTI2OC0zLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gUGFya2dhdGUgU3RyZWV0LCBDb255bmdoYW0gUm9hZCwgd2l0aCByZWZlcmVuY2UgdG8gbmFtZXMgb2YgdGVuYW50cyBlbmRvcnNlZCBOby4gM1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTcxXCIsIFwieFwiOiAxMTIuMCwgXCJ5XCI6IDE4MS41LCBcInpvb21YXCI6IDAuMDIxLCBcInpvb21ZXCI6IDAuMDIxLCBcInJvdGF0aW9uXCI6IC0wLjI2NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xNzEtMi5qcGVnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC44LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgTG93ZXIgQWJiZXkgU3RyZWV0LCB0byBjb3JuZXIgb2YgRWRlbiBRdWF5IChTYWNrdmlsbGUgU3RyZWV0KSBEYXRlOiAxODEzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODEzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzgwXCIsIFwieFwiOiAyNDEuNSwgXCJ5XCI6IDI4NiwgXCJ6b29tWFwiOiAwLjAzMywgXCJ6b29tWVwiOiAwLjAzMywgXCJyb3RhdGlvblwiOiAwLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM4MC0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gRmxlZXQgTWFya2V0LCBQb29sYmVnIFN0cmVldCwgSGF3a2lucyBTdHJlZXQsIFRvd25zZW5kIFN0cmVldCwgRmxlZXQgU3RyZWV0LCBEdWJsaW4gU29jaWV0eSBTdG9yZXMgRGF0ZTogMTgwMFwiLCBcblx0XHRcImRhdGVcIjogMTgwMFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTMwOVwiLCBcInhcIjogMzYuMCwgXCJ5XCI6IC0yOTcsIFwiem9vbVhcIjogMC4yMTksIFwiem9vbVlcIjogMC4yMTksIFwicm90YXRpb25cIjogLTAuNDM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMwOS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlBhcnQgb2YgR2FyZGluZXIgU3RyZWV0IGFuZCBwYXJ0IG9mIEdsb3VjZXN0ZXIgU3RyZWV0LCBsYW5kIG91dCBpbiBsb3RzIGZvciBidWlsZGluZyAtIHNob3dpbmcgR2xvdWNlc3RlciBTdHJlZXQsIEdsb3VjZXN0ZXIgUGxhY2UsIHRoZSBEaWFtb25kLCBTdW1tZXIgSGlsbCwgR3JlYXQgQnJpdGFpbiBTdHJlZXQsIEN1bWJlcmxhbmQgU3RyZWV0LCBNYXJsYm9yb+KAmSBTdHJlZXQsIE1hYmJvdCBTdHJlZXQsIE1lY2tsaW5idXJnaCBldGMuRGF0ZTogMTc5MVwiLCBcblx0XHRcImRhdGVcIjogMTc5MVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTI5NFwiLCBcInhcIjogMTI1LjAsIFwieVwiOiAtMTE4LCBcInpvb21YXCI6IDAuMTI5LCBcInpvb21ZXCI6IDAuMTI5LCBcInJvdGF0aW9uXCI6IC0wLjE5NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTI5NC0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU3VydmV5IG9mIHBhcnQgb2YgdGhlIExvcmRzaGlwIG9mIFNhaW50IE1hcnnigJlzIEFiYmV5IC0gcGFydCBvZiB0aGUgZXN0YXRlIG9mIHRoZSBSaWdodCBIb25vcmFibGUgTHVrZSBWaXNjb3VudCBNb3VudGpveSwgc29sZCB0byBSaWNoYXJkIEZyZW5jaCBFc3EuLCBwdXJzdWFudCB0byBhIERlY3JlZSBvZiBIaXMgTWFqZXN0eeKAmXMgSGlnaCBDb3VydCBvZiBDaGFuY2VyeSwgMTcgRmViIDE3OTRcIiwgXG5cdFx0XCJkYXRlXCI6IDE3OTRcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMTBcIiwgXCJ4XCI6IDQ3NC4wLCBcInlcIjogLTgyMS41LCBcInpvb21YXCI6IDAuNTc2LCBcInpvb21ZXCI6IDAuNTc2LCBcInJvdGF0aW9uXCI6IDAuMTQ1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMxMC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk5vcnRoIExvdHMgLSBmcm9tIHRoZSBOb3J0aCBTdHJhbmQgUm9hZCwgdG8gdGhlIE5vcnRoIGFuZCBFYXN0IFdhbGxzIERhdGU6IDE3OTNcIiwgXG5cdFx0XCJkYXRlXCI6IDE3OTNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMjVcIiwgXCJ4XCI6IC04OTMuMCwgXCJ5XCI6IDQxLCBcInpvb21YXCI6IDAuMjg2LCBcInpvb21ZXCI6IDAuMjg2LCBcInJvdGF0aW9uXCI6IDAuMDMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzI1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU21pdGhmaWVsZCwgQXJyYW4gUXVheSwgSGF5bWFya2V0LCBXZXN0IEFycmFuIFN0cmVldCwgTmV3IENodXJjaCBTdHJlZXQsIEJvdyBMYW5lLCBCb3cgU3RyZWV0LCBNYXkgTGFuZVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzI2LTFcIiwgXCJ4XCI6IC0xNDE1LjUsIFwieVwiOiAxMTIuNSwgXCJ6b29tWFwiOiAwLjExNCwgXCJ6b29tWVwiOiAwLjExMiwgXCJyb3RhdGlvblwiOiAwLjE3LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMyNi0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuOCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQmFycmFjayBTdHJlZXQsIFBhcmsgU3RyZWV0LCBQYXJrZ2F0ZSBTdHJlZXQgYW5kIFRlbXBsZSBTdHJlZXQsIHdpdGggcmVmZXJlbmNlIHRvIG5hbWVzIG9mIHRlbmFudHMgYW5kIHByZW1pc2VzIE5vLiAxXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy02MzJcIiwgXCJ4XCI6IDEyNSwgXCJ5XCI6IDM0Ny41LCBcInpvb21YXCI6IDAuMTcyLCBcInpvb21ZXCI6IDAuMTY0LCBcInJvdGF0aW9uXCI6IDAuNTMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNjMyLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIE5hc3NhdSBTdHJlZXQsIGxlYWRpbmcgZnJvbSBHcmFmdG9uIFN0cmVldCB0byBNZXJyaW9uIFNxdWFyZSAtIHNob3dpbmcgdGhlIG9mZiBzdHJlZXRzIGFuZCBwb3J0aW9uIG9mIEdyYWZ0b24gU3RyZWV0IGFuZCBTdWZmb2xrIFN0cmVldCBEYXRlOiAxODMzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODMzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMzI2LTJcIiwgXCJ4XCI6IC0xMjU3LjUsIFwieVwiOiAxNDMuNSwgXCJ6b29tWFwiOiAwLjEsIFwiem9vbVlcIjogMC4xLCBcInJvdGF0aW9uXCI6IDAuMDc1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTMyNi0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQmFycmFjayBTdHJlZXQsIFBhcmsgU3RyZWV0LCBQYXJrZ2F0ZSBTdHJlZXQgYW5kIFRlbXBsZSBTdHJlZXQsIHdpdGggcmVmZXJlbmNlIHRvIG5hbWVzIG9mIHRlbmFudHMgYW5kIHByZW1pc2VzXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zMzRcIiwgXCJ4XCI6IDkwLjUsIFwieVwiOiAzNTcsIFwiem9vbVhcIjogMC4xMjgsIFwiem9vbVlcIjogMC4xMjgsIFwicm90YXRpb25cIjogMS4yNjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzM0LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRGFtZSBTdHJlZXQsIENvbGxlZ2UgR3JlZW4sIEdlb3JnZeKAmXMgTGFuZSwgR2Vvcmdl4oCZcyBTdHJlZXQsIENoZXF1ZXIgU3RyZWV0IGFuZCBhdmVudWVzIHRoZXJlb2ZcIixcblx0XHRcImRhdGVcIjogMTc3OFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM1NS0yXCIsIFwieFwiOiAxODUsIFwieVwiOiAxMDI5LCBcInpvb21YXCI6IDAuMzAyLCBcInpvb21ZXCI6IDAuMzAyLCBcInJvdGF0aW9uXCI6IC0wLjQ1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM1NS0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBvZiBCYWdnb3QgU3RyZWV0IGFuZCBGaXR6d2lsbGlhbSBTdHJlZXQsIHNob3dpbmcgYXZlbnVlcyB0aGVyZW9mIE5vLiAyIERhdGU6IDE3OTJcIixcblx0XHRcImRhdGVcIjogMTc5MlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM2OFwiLCBcInhcIjogLTY4Ny41LCBcInlcIjogMjczLjUsIFwiem9vbVhcIjogMC4xNTYsIFwiem9vbVlcIjogMC4xNSwgXCJyb3RhdGlvblwiOiAwLjEyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM2OC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBLaW5n4oCZcyBJbm4gUXVheSBhbmQgTWVyY2hhbnRzIFF1YXksIHNob3dpbmcgc2l0ZSBvZiBPcm1vbmQgQnJpZGdlIC0gYmVsb3cgQ2hhcmxlcyBTdHJlZXQgLSBhZnRlcndhcmRzIHJlbW92ZWQgYW5kIHJlLWVyZWN0ZWQgb3Bwb3NpdGUgV2luZXRhdmVybiBTdHJlZXQgRGF0ZTogMTc5N1wiLCBcblx0XHRcImRhdGVcIjogMTc5N1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM3MlwiLCBcInhcIjogMzQxLjUsIFwieVwiOiAyOTYuNSwgXCJ6b29tWFwiOiAwLjAzNiwgXCJ6b29tWVwiOiAwLjAzMzksIFwicm90YXRpb25cIjogMi45NTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzcyLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiR2VvcmdlJ3MgUXVheSwgV2hpdGVzIExhbmUsIGFuZCBIYXdraW5zIFN0cmVldCwgc2hvd2luZyBzaXRlIG9mIFN3ZWV0bWFuJ3MgQnJld2VyeSB3aGljaCByYW4gZG93biB0byBSaXZlciBMaWZmZXkgRGF0ZTogMTc5OVwiLCBcblx0XHRcImRhdGVcIjogMTc5OVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM5MC0xXCIsIFwieFwiOiAtODA0LjUsIFwieVwiOiA0MjAsIFwiem9vbVhcIjogMC4yMDQsIFwiem9vbVlcIjogMC4yMDIsIFwicm90YXRpb25cIjogLTAuMDcsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMzkwLTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIHByb3Bvc2VkIE1hcmtldCBIb3VzZSwgYWRqb2luaW5nIFRob21hcyBTdHJlZXQsIFZpY2FyIFN0cmVldCwgTWFya2V0IFN0cmVldCBhbmQgRnJhbmNpcyBTdHJlZXQgRGF0ZTogMTgwMVwiLCBcblx0XHRcImRhdGVcIjogMTgwMVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTM5NS0zXCIsIFwieFwiOiAtNTg4LCBcInlcIjogNTc4LCBcInpvb21YXCI6IDAuMDM2LCBcInpvb21ZXCI6IDAuMDM2LCBcInJvdGF0aW9uXCI6IC0zLjY1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM5NS0zLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTmV3IFJvdyBhbmQgQ3V0cHVyc2UgUm93IERhdGU6IDE4MDBcIixcblx0XHRcImRhdGVcIjogMTgwMFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQwNFwiLCBcInhcIjogLTE2LCBcInlcIjogMzcyLCBcInpvb21YXCI6IDAuMDYyLCBcInpvb21ZXCI6IDAuMDYsIFwicm90YXRpb25cIjogLTAuMjU1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQwNC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkFuZ2xlc2VhIFN0cmVldCBhbmQgUGFybGlhbWVudCBIb3VzZSBEYXRlOiAxODAyXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODAyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDExXCIsIFwieFwiOiAzNDMuNSwgXCJ5XCI6IDY1NywgXCJ6b29tWFwiOiAwLjA4NiwgXCJ6b29tWVwiOiAwLjA4NiwgXCJyb3RhdGlvblwiOiAwLjMyNSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQxMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkxlaW5zdGVyIEhvdXNlIGFuZCBwYXJ0IG9mIHRoZSBlc3RhdGUgb2YgVmlzY291bnQgRml0endpbGxpYW0gKGZvcm1lcmx5IExlaW5zdGVyIExhd24pLCBsYWlkIG91dCBpbiBsb3RzIGZvciBidWlsZGluZyAtIHNob3dpbmcgS2lsZGFyZSBTdHJlZXQsIFVwcGVyIE1lcnJpb24gU3RyZWV0IGFuZCBMZWluc3RlciBQbGFjZSAoU3RyZWV0KSwgTWVycmlvbiBQbGFjZSwgYW5kIHRoZSBPbGQgQm91bmRhcnkgYmV0d2VlbiBMZWluc3RlciBhbmQgTG9yZCBGaXR6d2lsbGlhbSAtIHRha2VuIGZyb20gYSBtYXAgc2lnbmVkIFJvYmVydCBHaWJzb24sIE1heSAxOCwgMTc1NCBEYXRlOiAxODEyXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODEyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjUxXCIsIFwieFwiOiAyMjAsIFwieVwiOiA2NCwgXCJ6b29tWFwiOiAwLjIzNiwgXCJ6b29tWVwiOiAwLjIzNiwgXCJyb3RhdGlvblwiOiAtMS40OSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTI1MS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwb3J0aW9uIG9mIENpdHksIHNob3dpbmcgTW9udGdvbWVyeSBTdHJlZXQsIE1lY2tsaW5idXJnaCBTdHJlZXQsIExvd2VyIEdsb3VjZXN0ZXIgU3RyZWV0IGFuZCBwb3J0aW9uIG9mIE1hYmJvdCBTdHJlZXRcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQxM1wiLCBcInhcIjogLTM3MywgXCJ5XCI6IDgwNi41LCBcInpvb21YXCI6IDAuMDc4LCBcInpvb21ZXCI6IDAuMDc2LCBcInJvdGF0aW9uXCI6IC0wLjE1LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDEzLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGV0ZXIgU3RyZWV0LCBQZXRlcuKAmXMgUm93LCBXaGl0ZWZyaWFyIFN0cmVldCwgV29vZCBTdHJlZXQgYW5kIEJyaWRlIFN0cmVldCAtIHNob3dpbmcgc2l0ZSBvZiB0aGUgQW1waGl0aGVhdHJlIGluIEJyaWRlIFN0cmVldCwgd2hlcmUgdGhlIE1vbGV5bmV1eCBDaHVyY2ggbm93ICgxOTAwKSBzdGFuZHMgRGF0ZTogMTgxMlwiLCBcblx0XHRcImRhdGVcIjogMTgxMlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQxNFwiLCBcInhcIjogLTE5My41LCBcInlcIjogMzYzLjUsIFwiem9vbVhcIjogMC4wNzIsIFwiem9vbVlcIjogMC4wNzQsIFwicm90YXRpb25cIjogLTAuMjMsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MTQucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJUZW1wbGUgQmFyLCBXZWxsaW5ndG9uIFF1YXksIE9sZCBDdXN0b20gSG91c2UsIEJhZ25pbyBTbGlwIGV0Yy4gRGF0ZTogMTgxM1wiLCBcblx0XHRcImRhdGVcIjogMTgxM1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQyMVwiLCBcInhcIjogLTQ3NC41LCBcInlcIjogNTI3LCBcInpvb21YXCI6IDAuMDYyLCBcInpvb21ZXCI6IDAuMDYsIFwicm90YXRpb25cIjogLTAuMTg1LFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNDIxLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBwcmVjaW5jdHMgb2YgQ2hyaXN0IENodXJjaCBEdWJsaW4sIHNob3dpbmcgU2tpbm5lcnMgUm93LCB0byB3aGljaCBpcyBhdHRhY2hlZCBhIE1lbW9yYW5kdW0gZGVub21pbmF0aW5nIHRoZSBwcmVtaXNlcywgdGFrZW4gYnkgdGhlIENvbW1pc3Npb25lcnMgb2YgV2lkZSBTdHJlZXRzIGZvciB0aGUgcHVycG9zZSBvZiB3aWRlbmluZyBzYWlkIFNraW5uZXJzIFJvdywgbm93ICgxOTAwKSBrbm93biBhcyBDaHJpc3QgQ2h1cmNoIFBsYWNlIERhdGU6IDE4MTdcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MTdcblx0fSxcblx0eyBcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDA4LTJcIiwgXCJ4XCI6IC0zOTcuNSwgXCJ5XCI6IDU0NS41LCBcInpvb21YXCI6IDAuMDQ0LCBcInpvb21ZXCI6IDAuMDQ0LCBcInJvdGF0aW9uXCI6IC0wLjEyLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQwOC0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiV2VyYnVyZ2ggU3RyZWV0LCBTa2lubmVycyBSb3csIEZpc2hhbWJsZSBTdHJlZXQgYW5kIENhc3RsZSBTdHJlZXQgRGF0ZTogYy4gMTgxMFwiLFxuXHRcdFwiZGF0ZVwiOiAxODEwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDI1LTFcIiwgXCJ4XCI6IC05MTcuNSwgXCJ5XCI6IDU3Ny41LCBcInpvb21YXCI6IDAuMDQ1LCBcInpvb21ZXCI6IDAuMDQ2LCBcInJvdGF0aW9uXCI6IC0xLjQyNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MjUtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1lYXRoIFJvdywgTWFya+KAmXMgQWxsZXkgYW5kIERpcnR5IExhbmUgLSBzaG93aW5nIEJyaWRnZWZvb3QgU3RyZWV0LCBNYXNzIExhbmUsIFRob21hcyBTdHJlZXQgYW5kIFN0LiBDYXRoZXJpbmXigJlzIENodXJjaCBEYXRlOiAxODIwLTI0XCIsIFxuXHRcdFwiZGF0ZVwiOiAxODIwXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDI2XCIsIFwieFwiOiAtNzM1LjUsIFwieVwiOiA1NzguNSwgXCJ6b29tWFwiOiAwLjAzNCwgXCJ6b29tWVwiOiAwLjAzNCwgXCJyb3RhdGlvblwiOiAxLjU2NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00MjYucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2Ygc2V2ZXJhbCBob3VzZXMgYW5kIHByZW1pc2VzIG9uIHRoZSBFYXN0IHNpZGUgb2YgTWVhdGggUm93LCB0aGUgcHJvcGVydHkgb2YgTXIuIEpvaG4gV2Fsc2ggLSBzaG93aW5nIHRoZSBzaXR1YXRpb24gb2YgVGhvbWFzIFN0cmVldCwgSGFuYnVyeSBMYW5lIGFuZCBzaXRlIG9mIENoYXBlbCBEYXRlOiAxODIxXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODIxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTEyLTFcIiwgXCJ4XCI6IC0yOTAuNSwgXCJ5XCI6IDM0NC41LCBcInpvb21YXCI6IDAuMTgsIFwiem9vbVlcIjogMC4xODIsIFwicm90YXRpb25cIjogLTAuMjYsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTEyLTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC4zLFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJEYW1lIFN0cmVldCwgZnJvbSB0aGUgY29ybmVyIG9mIFBhbGFjZSBTdHJlZXQgdG8gdGhlIGNvcm5lciBvZiBHZW9yZ2XigJlzIFN0cmVldCAtIGxhaWQgb3V0IGluIGxvdHMgZm9yIGJ1aWxkaW5nIE5vcnRoIGFuZCBTb3V0aCBhbmQgdmljaW5pdHkgRGF0ZTogMTc4MlwiLCBcblx0XHRcImRhdGVcIjogMTc4MlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTExMlwiLCBcInhcIjogLTI5OCwgXCJ5XCI6IDMzOS41LCBcInpvb21YXCI6IDAuMTg1LCBcInpvb21ZXCI6IDAuMTg1LCBcInJvdGF0aW9uXCI6IC0wLjI1NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xMTIucG5nXCIsIFwidmlzaWJsZVwiOiBmYWxzZSwgXCJvcGFjaXR5XCI6IDAuMCxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRGFtZSBTdHJlZXQsIGZyb20gdGhlIGNvcm5lciBvZiBQYWxhY2UgU3RyZWV0IHRvIHRoZSBjb3JuZXIgb2YgR2Vvcmdl4oCZcyBTdHJlZXQgLSBsYWlkIG91dCBpbiBsb3RzIGZvciBidWlsZGluZyBOb3J0aCBhbmQgU291dGggYW5kIHZpY2luaXR5IERhdGU6IDE3ODJcIiwgXG5cdFx0XCJkYXRlXCI6IDE3ODJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00NTVcIiwgXCJ4XCI6IDYzNS41LCBcInlcIjogMTI1OCwgXCJ6b29tWFwiOiAwLjI2MywgXCJ6b29tWVwiOiAwLjI2MywgXCJyb3RhdGlvblwiOiAtMC45LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQ1NS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjYsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkhlcmJlcnQgUGxhY2UgYW5kIEF2ZW51ZXMgYWRqYWNlbnQgdG8gVXBwZXIgTW91bnQgU3RyZWV0LCBzaG93aW5nIFVwcGVyIEJhZ2dvdCBTdHJlZXQgLSBIZXJiZXJ0IFN0cmVldCwgV2FycmluZ3RvbiBQbGFjZSBhbmQgUGVyY3kgUGxhY2UsIE5vcnRodW1iZXJsYW5kIFJvYWQgYW5kIExvd2VyIE1vdW50IFN0cmVldCBEYXRlOiAxODMzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODMzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTk5XCIsIFwieFwiOiA4NzguNSwgXCJ5XCI6IDEyMTcuNSwgXCJ6b29tWFwiOiAwLjI0MSwgXCJ6b29tWVwiOiAwLjI0MSwgXCJyb3RhdGlvblwiOiAyLjExNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xOTktMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjYsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwYXJ0IG9mIHRoZSBlc3RhdGUgb2YgdGhlIEhvbi4gU2lkbmV5IEhlcmJlcnQsIGNhbGxlZCBXaWx0b24gUGFyYWRlLCBzaG93aW5nIHRoZSBwcm9wb3NlZCBhcHByb3ByaWF0aW9uIHRoZXJlb2YgaW4gc2l0ZXMgZm9yIGJ1aWxkaW5nLiBBbHNvIHNob3dpbmcgQmFnZ290IFN0cmVldCwgR3JhbmQgQ2FuYWwgYW5kIEZpdHp3aWxsaWFtIFBsYWNlLlwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDY1XCIsIFwieFwiOiAzMDEuNSwgXCJ5XCI6IDcxMS41LCBcInpvb21YXCI6IDAuMjA3LCBcInpvb21ZXCI6IDAuMjA3LCBcInJvdGF0aW9uXCI6IDMuMywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy00NjUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC42LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJHcmFmdG9uIFN0cmVldCwgTmFzc2F1IFN0cmVldCAoU291dGggc2lkZSkgYW5kIERhd3NvbiBTdHJlZXQgRGF0ZTogMTgzN1wiLCBcblx0XHRcImRhdGVcIjogMTgzN1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQ4MC0yXCIsIFwieFwiOiAtNjMsIFwieVwiOiAzODIsIFwiem9vbVhcIjogMC4wNjgsIFwiem9vbVlcIjogMC4wNjgsIFwicm90YXRpb25cIjogLTAuMDU1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQ4MC0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNixcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTm9ydGggc2lkZSBvZiBDb2xsZWdlIEdyZWVuIHNob3dpbmcgQXZlbnVlcyB0aGVyZW9mLCBhbmQgZ3JvdW5kIHBsYW4gb2YgUGFybGlhbWVudCBIb3VzZSwgQW5nbGVzZWEgU3RyZWV0LCBCbGFja21vb3IgWWFyZCBldGMuIC0gd2l0aCByZWZlcmVuY2UgZ2l2aW5nIHRlbmFudHMsIG5hbWVzIG9mIHByZW1pc2VzIHJlcXVpcmVkIG9yIHB1cnBvc2Ugb2YgaW1wcm92ZW1lbnQuIERhdGU6IDE3ODZcIiwgXG5cdFx0XCJkYXRlXCI6IDE3ODZcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00OTFcIiwgXCJ4XCI6IC0yMS41LCBcInlcIjogOTM4LCBcInpvb21YXCI6IDAuMTY0LCBcInpvb21ZXCI6IDAuMTY0LCBcInJvdGF0aW9uXCI6IC0zLjA4LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQ5MS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkF1bmdpZXIgU3RyZWV0LCBNZXJjZXIgU3RyZWV0LCBZb3JrIFN0cmVldCBhbmQgQXZlbnVlcyB0aGVyZW9mLCB2aXo6IC0gRnJlbmNoIFN0cmVldCAoTWVyY2VyIFN0cmVldCksIEJvdyBMYW5lLCBEaWdnZXMgTGFuZSwgU3RlcGhlbiBTdHJlZXQsIERydXJ5IExhbmUsIEdyZWF0IGFuZCBMaXR0bGUgTG9uZ2ZvcmQgU3RyZWV0c1wiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDk2XCIsIFwieFwiOiAtMjc4LCBcInlcIjogNDU2LCBcInpvb21YXCI6IDAuMDE4LCBcInpvb21ZXCI6IDAuMDE4LCBcInJvdGF0aW9uXCI6IC0zLjI2LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQ5Ni5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjcsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkVzc2V4IFF1YXksIENoYW5nZSBBbGxleSwgU21vY2sgQWxsZXkgYW5kIGdyb3VuZCBwbGFuIG9mIFNtb2NrIEFsbGV5IFRoZWF0cmVcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTUwN1wiLCBcInhcIjogLTI3Mi41LCBcInlcIjogMzQ2LCBcInpvb21YXCI6IDAuMDg3LCBcInpvb21ZXCI6IDAuMDg5LCBcInJvdGF0aW9uXCI6IC0wLjIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNTA3LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiRXNzZXggU3RyZWV0LCBQYXJsaWFtZW50IFN0cmVldCwgc2hvd2luZyBPbGQgQ3VzdG9tIEhvdXNlIFF1YXksIExvd2VyIE9ybW9uZCBRdWF5IGFuZCBEYW1lIFN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMjA2LTFcIiwgXCJ4XCI6IC00NC41LCBcInlcIjogLTIyMSwgXCJ6b29tWFwiOiAwLjA1LCBcInpvb21ZXCI6IDAuMDUsIFwicm90YXRpb25cIjogLTAuNjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjA2LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgYW5nbGUgb2YgQ2F2ZW5kaXNoIFJvdywgUnV0bGFuZCBTcXVhcmUgYW5kIEdyZWF0IEJyaXRhaW4gU3RyZWV0IC0gc2hvd2luZyB1bnNpZ25lZCBlbGV2YXRpb25zIGFuZCBncm91bmQgcGxhbiBvZiBSb3R1bmRhIGJ5IEZyZWRlcmljayBUcmVuY2guIERhdGU6IDE3ODdcIiwgXG5cdFx0XCJkYXRlXCI6IDE3ODdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0yMDNcIiwgXCJ4XCI6IC0zOTIsIFwieVwiOiAyNzIuNSwgXCJ6b29tWFwiOiAwLjA3OCwgXCJ6b29tWVwiOiAwLjA3NiwgXCJyb3RhdGlvblwiOiAtMC4yNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0yMDMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDaXR5IFN1cnZleSAtIHNob3dpbmcgT3Jtb25kIFF1YXksIEFycmFuIFN0cmVldCwgTWFyeeKAmXMgQWJiZXksIExpdHRsZSBTdHJhbmQgU3RyZWV0LCBDYXBlbCBTdHJlZXQgYW5kIEVzc2V4IEJyaWRnZSBEYXRlOiAxODExXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODExXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNTE1XCIsIFwieFwiOiAtNzUsIFwieVwiOiA1NTAsIFwiem9vbVhcIjogMC4wODgsIFwiem9vbVlcIjogMC4wODgsIFwicm90YXRpb25cIjogMi45MzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNTE1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwic2hvd2luZyBEYW1lIFN0cmVldCwgRXNzZXggU3RyZWV0IGV0Yy4gLSBhbHNvIHNpdGUgZm9yIHByb3Bvc2VkIE5hdGlvbmFsIEJhbmssIG9uIG9yIGFib3V0IHdoZXJlIHRoZSAnRW1waXJlJyAoZm9ybWVybHkgdGhlICdTdGFyJykgVGhlYXRyZSBvZiBWYXJpZXRpZXMgbm93ICgxOTAwKSBzdGFuZHMgTm8uMVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNTIzLTFcIiwgXCJ4XCI6IC0yOTcuNSwgXCJ5XCI6IDM2OC41LCBcInpvb21YXCI6IDAuMDg4LCBcInpvb21ZXCI6IDAuMDg4LCBcInJvdGF0aW9uXCI6IC0wLjE4NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy01MjMtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkVzc2V4IFN0cmVldCwgVGVtcGxlIEJhciBhbmQgdmljaW5pdHkgdG8gRXNzZXggQnJpZGdlLCBzaG93aW5nIHByb3Bvc2VkIG5ldyBxdWF5IHdhbGwgKFdlbGxpbmd0b24gUXVheSlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQyMy0yXCIsIFwieFwiOiAzNC41LCBcInlcIjogNDc4LjUsIFwiem9vbVhcIjogMC4wNzgsIFwiem9vbVlcIjogMC4wODIsIFwicm90YXRpb25cIjogLTMuMjE1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQyMy0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQ3Jvd24gQWxsZXksIENvcGUgU3RyZWV0LCBBcmRpbGzigJlzIFJvdywgVGVtcGxlIEJhciwgQXN0b27igJlzIFF1YXkgYW5kIFdlbGxpbmd0b24gUXVheSBOby4gMiBEYXRlOiAxODIwLTVcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MjBcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy01MzVcIiwgXCJ4XCI6IC0yMDkuNSwgXCJ5XCI6IDMyNSwgXCJ6b29tWFwiOiAwLjEzNCwgXCJ6b29tWVwiOiAwLjEzNCwgXCJyb3RhdGlvblwiOiAtMC4wNywgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy01MzUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJXZWxsaW5ndG9uIFF1YXkgLSBjb250aW51YXRpb24gb2YgRXVzdGFjZSBTdHJlZXQgRGF0ZVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNTY3LTNcIiwgXCJ4XCI6IDE5NC41LCBcInlcIjogNDUwLCBcInpvb21YXCI6IDAuMTI2LCBcInpvb21ZXCI6IDAuMTI2LCBcInJvdGF0aW9uXCI6IDEuNDgsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNTY3LTMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgYSBwYXJjZWwgb2YgZ3JvdW5kIGJvdW5kZWQgYnkgR3JhZnRvbiBTdHJlZXQsIENvbGxlZ2UgR3JlZW4sIGFuZCBDaGVxdWVyIExhbmUgLSBsZWFzZWQgdG8gTXIuIFBvb2xleSAoMyBjb3BpZXMpIE5vLiAzIERhdGU6IDE2ODJcIiwgXG5cdFx0XCJkYXRlXCI6IDE2ODJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy01OTQtMVwiLCBcInhcIjogLTU2NC41LCBcInlcIjogNTcyLjUsIFwiem9vbVhcIjogMC4wNDQsIFwiem9vbVlcIjogMC4wNDQsIFwicm90YXRpb25cIjogMi41MzUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNTk0LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgTmV3IEhhbGwgTWFya2V0IC0gcGFydCBvZiB0aGUgQ2l0eSBFc3RhdGUgRGF0ZTogMTc4MFwiLCBcblx0XHRcImRhdGVcIjogMTc4MFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTYyNS0xXCIsIFwieFwiOiAtMzIwLjUsIFwieVwiOiA2MDkuNSwgXCJ6b29tWFwiOiAwLjA1OCwgXCJ6b29tWVwiOiAwLjA1OCwgXCJyb3RhdGlvblwiOiAyLjYxLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTYyNS0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHRoZSBPbGQgVGhvbHNlbGwgZ3JvdW5kLCBmb3JtZXJseSBjYWxsZWQgU291dGhlcuKAmXMgTGFuZSwgYmVsb25naW5nIHRvIHRoZSBDaXR5IG9mIER1YmxpbiAtIGxhaWQgb3V0IGZvciBidWlsZGluZywgTmljaG9sYXMgU3RyZWV0LCBTa2lubmVycyBSb3cgYW5kIFdlcmJ1cmdoIFN0cmVldCBCeSBBLiBSLiBOZXZpbGxlLCBDLiBTLiBEYXRlOiAxODEyXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODEyXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNjU0XCIsIFwieFwiOiAtMzk3LjUsIFwieVwiOiA0MDksIFwiem9vbVhcIjogMC4xMjIsIFwiem9vbVlcIjogMC4xMjIsIFwicm90YXRpb25cIjogLTAuMTM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTY1NC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiB0aGUgZ3JvdW5kIHBsb3RzIG9mIHNldmVyYWwgaG9sZGluZ3MgYmVsb25naW5nIHRvIHRoZSBDaXR5IG9mIER1YmxpbiwgTWFkYW0gT+KAmUhhcmEsIENvbG9uZWwgQmVycnkgYW5kIG90aGVycywgb24gQmFjayBRdWF5IC0gKEVzc2V4IFF1YXkpIEJsaW5kIFF1YXkgLSBFeGNoYW5nZSBTdHJlZXQsIEVzc2V4IEJyaWRnZSwgQ3JhbmUgTGFuZSBhbmQgRGFtZSBTdHJlZXQsIFN5Y2Ftb3JlIEFsbGV5IC0gc2hvd2luZyBwb3J0aW9uIG9mIHRoZSBDaXR5IFdhbGwsIEVzc2V4IEdhdGUsIERhbWUgR2F0ZSwgRGFtZXMgTWlsbCBhbmQgYnJhbmNoIG9mIHRoZSBSaXZlciBEb2RkZXJcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTcwNVwiLCBcInhcIjogLTE4Ny41LCBcInlcIjogMzkyLCBcInpvb21YXCI6IDAuMDQsIFwiem9vbVlcIjogMC4wNDIsIFwicm90YXRpb25cIjogLTAuMzgsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNzA1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIEVzc2V4IFN0cmVldCBhbmQgdmljaW5pdHkgRGF0ZTogMTgwNlwiLCBcblx0XHRcImRhdGVcIjogMTgyNlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTcyNVwiLCBcInhcIjogLTY1My41LCBcInlcIjogMjIyLjUsIFwiem9vbVhcIjogMC4wOTQsIFwiem9vbVlcIjogMC4wOTQsIFwicm90YXRpb25cIjogMC4wNyxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTcyNS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNodXJjaCBTdHJlZXQsIENoYXJsZXMgU3RyZWV0LCBJbm7igJlzIFF1YXkgLSAnV2hpdGUgQ3Jvc3MgSW5uJyAtIHJlcmUgb2YgRm91ciBDb3VydHMgLSBVc2hlcnPigJkgUXVheSwgTWVyY2hhbnTigJlzIFF1YXksIFdvb2QgUXVheSAtIHdpdGggcmVmZXJlbmNlIERhdGU6IDE4MzNcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MzNcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xOTgtMVwiLCBcInhcIjogLTQ2MiwgXCJ5XCI6IDQ3NiwgXCJ6b29tWFwiOiAwLjAzMiwgXCJ6b29tWVwiOiAwLjAzMiwgXCJyb3RhdGlvblwiOiAtMC4zNDUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMTk4LTEucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgV2hpdGVob3JzZSBZYXJkIChXaW5ldGF2ZXJuIFN0cmVldCkgU3VydmV5b3I6IEFydGh1ciBOZXZpbGxlIERhdGU6IDE4NDdcIiwgXG5cdFx0XCJkYXRlXCI6IDE4NDdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNTVcIiwgXCJ4XCI6IC0xNzc1LCBcInlcIjogLTE0NDYsIFwiem9vbVhcIjogMS4xMSwgXCJ6b29tWVwiOiAxLjE2MiwgXCJyb3RhdGlvblwiOiAwLjAxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wNTUucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJQbGFuIG9mIE1haWwgQ29hY2ggUm9hZCwgdGhyb3VnaCBCbGVzc2luZ3RvbiBTdHJlZXQgdG8gQ2FicmEsIG9mIE5ldyBMaW5lIFJvYWQsIGJlaW5nIHBhcnQgb2YgdGhlIE5hdmFuIFR1cm5waWtlIFJvYWQgYW5kIGNvbm5lY3RpbmcgYW4gaW1wcm92ZW1lbnQgbGF0ZWx5IG1hZGUgdXBvbiB0aGF0IExpbmUgd2l0aCB0aGUgQ2l0eSBvZiBEdWJsaW4gLSBzaG93aW5nIHRoZSBtb3N0IGRpcmVjdCBsaW5lIGFuZCBhbHNvIGEgQ2lyY3VpdG9ucyBsaW5lIHdoZXJlYnkgdGhlIGV4cGVuc2Ugb2YgYSBCcmlkZ2UgYWNyb3NzIHRoZSBSb3lhbCBDYW5hbCBtYXkgYmUgYXZvaWRlZC4gRG9uZSBieSBIaXMgTWFqZXN0eSdzIFBvc3QgTWFzdGVycyBvZiBJcmVsYW5kIGJ5IE1yLiBMYXJraW4gRGF0ZTogMTgxOFwiLCBcblx0XHRcImRhdGVcIjogMTgxOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA2MFwiLCBcInhcIjogLTEwNC41LCBcInlcIjogLTEsIFwiem9vbVhcIjogMC42NzQsIFwiem9vbVlcIjogMC43MDIsIFwicm90YXRpb25cIjogMy4xNjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtNjAucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgc2hvd2luZyB0aGUgYWx0ZXJhdGlvbnMgcHJvcG9zZWQgaW4gdGhlIG5ldyBsaW5lIG9mIHJvYWQsIGxlYWRpbmcgZnJvbSBEdWJsaW4gdG8gTmF2YW4sIGNvbW1lbmNpbmcgYXQgQmxlc3Npbmd0b24gU3RyZWV0OyBwYXNzaW5nIGFsb25nIHRoZSBDaXJjdWxhciBSb2FkIHRvIFBydXNzaWEgU3RyZWV0LCBhbmQgaGVuY2UgYWxvbmcgdGhlIFR1cm5waWtlIFJvYWQgdG8gUmF0b2F0aCwgYW5kIHRlcm1pbmF0aW5nIGF0IHRoZSBUdXJucGlrZVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDY1XCIsIFwieFwiOiAtNTQ1LjUsIFwieVwiOiAtMjc1LCBcInpvb21YXCI6IDAuMjk4LCBcInpvb21ZXCI6IDAuMjkyLCBcInJvdGF0aW9uXCI6IC0xLjA1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTA2NS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBzaG93aW5nIE1vdW50am95IFN0cmVldCwgRG9yc2V0IFN0cmVldCwgRG9taW5pY2sgU3RyZWV0IGFuZCB2aWNpbml0eSAtIHBsYW4gb2YgU2FpbnQgTWFyeeKAmXMgQ2hhcGVsIG9mIEVhc2UsIGFuZCBwcm9wb3NlZCBvcGVuaW5nIGxlYWRpbmcgdGhlcmV1bnRvIGZyb20gR3JhbmJ5IFJvdyAtIFRob21hcyBTaGVycmFyZCAzMCBOb3YgMTgyN1wiLCBcblx0XHRcImRhdGVcIjogMTgyN1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAxMlwiLCBcInhcIjogLTEyNS41LCBcInlcIjogMTQ5LjUsIFwiem9vbVhcIjogMC4wNDQsIFwiem9vbVlcIjogMC4wNDQsIFwicm90YXRpb25cIjogLTAuMjIsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDEyLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHByZW1pc2VzIExvd2VyIEFiYmV5IFN0cmVldCwgTG93ZXIgU2Fja3ZpbGxlIFN0cmVldCBhbmQgRWRlbiBRdWF5XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMTRcIiwgXCJ4XCI6IC0xNTU1LjUsIFwieVwiOiAyNywgXCJ6b29tWFwiOiAwLjE0LCBcInpvb21ZXCI6IDAuMTQsIFwicm90YXRpb25cIjogMC4wNTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDE0LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQSBzdXJ2ZXkgb2YgZ3JvdW5kIGNvbnRpZ3VvdXMgdG8gdGhlIEhvcnNlIEJhcnJhY2tzLCBEdWJsaW4gLSBzaG93aW5nIE1vbnRwZWxpZXIgSGlsbCwgQmFycmFjayBTdHJlZXQsIFBhcmtnYXRlIFN0cmVldCBhbmQgZW52aXJvbnMgKFRob21hcyBTaGVycmFyZCkgRGF0ZTogMTc5MFwiLCBcblx0XHRcImRhdGVcIjogMTc5MFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAxNVwiLCBcInhcIjogLTE0MTQuNSwgXCJ5XCI6IDI5LCBcInpvb21YXCI6IDAuMTE2LCBcInpvb21ZXCI6IDAuMTEyLCBcInJvdGF0aW9uXCI6IDAuMDc1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTAxNS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkFyYm91ciBIaWxsLCBSb3lhbCBCYXJyYWNrcyBhbmQgdmljaW5pdHkuIFdpdGggcmVmZXJlbmNlLiBEYXRlOiAxNzkwXCIsXG5cdFx0XCJkYXRlXCI6IDE3OTBcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMTZcIiwgXCJ4XCI6IC04NDcsIFwieVwiOiAyMzEuNSwgXCJ6b29tWFwiOiAwLjAzOCwgXCJ6b29tWVwiOiAwLjAzOCwgXCJyb3RhdGlvblwiOiAwLjA5NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wMTYucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgLSBBcnJhbiBRdWF5LCBRdWVlbiBTdHJlZXQgRGF0ZToxNzkwXCIsXG5cdFx0XCJkYXRlXCI6IDE3OTAsXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDE3XCIsIFwieFwiOiAtNTY0LCBcInlcIjogNDQwLCBcInpvb21YXCI6IDAuMDY4LCBcInpvb21ZXCI6IDAuMDYsIFwicm90YXRpb25cIjogMy4zOSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wMTcucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJBcnJhbiBRdWF5LCBDaHVyY2ggU3RyZWV0XCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMThcIiwgXCJ4XCI6IC0xOTQsIFwieVwiOiAtMzk1LjUsIFwiem9vbVhcIjogMC4xMiwgXCJ6b29tWVwiOiAwLjEyLCBcInJvdGF0aW9uXCI6IC0wLjYzLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTAxOC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIlN1cnZleSBvZiBCYXJsZXkgZmllbGRzIGV0Yy4gKERvcnNldCBTdHJlZXQpLiBQbGFuIG9mIG9wZW5pbmcgYSBzdHJlZXQgZnJvbSBSdXRsYW5kIFNxdWFyZSB0byBEb3JzZXQgU3RyZWV0IC0gKFBhbGFjZSBSb3cgYW5kIEdhcmRpbmVycyBSb3cpIC0gVGhvbWFzIFNoZXJyYXJkIERhdGU6IDE3ODlcIlxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTAyNVwiLCBcInhcIjogLTEwMTAsIFwieVwiOiAxMDUsIFwiem9vbVhcIjogMC4xMiwgXCJ6b29tWVwiOiAwLjEyLCBcInJvdGF0aW9uXCI6IDAuMTYsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDI1LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQmxhY2toYWxsIFBsYWNlIC0gTmV3IFN0cmVldCB0byB0aGUgUXVheVwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMDU3XCIsIFwieFwiOiAtMjI0LCBcInlcIjogMzMwLjUsIFwiem9vbVhcIjogMC4wODQsIFwiem9vbVlcIjogMC4wODQsIFwicm90YXRpb25cIjogMi44NjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDU3LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiUGxhbiBvZiBzdHJlZXRzIGFib3V0IE1hcnnigJlzIEFiYmV5IGFuZCBCb290IExhbmUgLSAoT2xkIEJhbmspIERhdGU6IDE4MTFcIiwgXG5cdFx0XCJkYXRlXCI6IDE4MTFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNjNcIiwgXCJ4XCI6IC04OC41LCBcInlcIjogMjYuNSwgXCJ6b29tWFwiOiAwLjMsIFwiem9vbVlcIjogMC4zLCBcInJvdGF0aW9uXCI6IC0yLjE0NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wNjMucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJFbGV2YXRpb24gb2YgdGhlIHdlc3QgZnJvbnQgYW5kIHBsYW4gb2YgTW91bnRqb3kgU3F1YXJlIGxhaWQgb3V0IG9uIHRoZSByaXNpbmcgZ3JvdW5kLCBuZWFyIEdlb3JnZeKAmXMgQ2h1cmNoIC0gdGhlIGVzdGF0ZSBvZiB0aGUgUmlnaHQgSG9uLiBMdWtlIEdhcmRpbmVyLCBhbmQgbm93ICgxNzg3KSwgdG8gYmUgbGV0IGZvciBidWlsZGluZyAtIExvcmQgTW91bnRqb3nigJlzIHBsYW4uIERhdGU6IDE3ODdcIiwgXG5cdFx0XCJkYXRlXCI6IDE3ODdcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wODctMlwiLCBcInhcIjogLTE3Mi41LCBcInlcIjogMTQxOSwgXCJ6b29tWFwiOiAwLjA4NiwgXCJ6b29tWVwiOiAwLjA4NiwgXCJyb3RhdGlvblwiOiAtMS42OTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDg3LTIucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC41LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJDYW1kZW4gU3RyZWV0IFVwcGVyIGFuZCBDaGFybG90dGUgU3RyZWV0IERhdGU6IDE4NDFcIiwgXG5cdFx0XCJkYXRlXCI6IDE4NDFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wOTBcIiwgXCJ4XCI6IC0yNjEsIFwieVwiOiA1MDUsIFwiem9vbVhcIjogMC4wNzQsIFwiem9vbVlcIjogMC4wNjYsIFwicm90YXRpb25cIjogLTAuMjMsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMDkwLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQ2FzdGxlIFlhcmQsIENhc3RsZSBTdHJlZXQsIERhbWUgU3RyZWV0LCBQYXJsaWFtZW50IFN0cmVldCBhbmQgdmljaW5pdHkgRGF0ZTogMTc2NFwiLCBcblx0XHRcImRhdGVcIjogMTc2NFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTEwMC0yXCIsIFwieFwiOiAtNTI4LCBcInlcIjogNDY0LCBcInpvb21YXCI6IDAuMDc4LCBcInpvb21ZXCI6IDAuMDc4LCBcInJvdGF0aW9uXCI6IC0wLjI3LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTEwMC0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIHByZW1pc2VzIHRvIGJlIHZhbHVlZCBieSBKdXJ5OyBDb2NrIEhpbGwsIE1pY2hhZWzigJlzIExhbmUsIFdpbmV0YXZlcm4gU3RyZWV0LCBKb2hu4oCZcyBMYW5lLCBDaHJpc3RjaHVyY2gsIFBhdHJpY2sgU3RyZWV0IGFuZCBQYXRyaWNr4oCZcyBDbG9zZSBEYXRlOiAxODEzXCIsIFxuXHRcdFwiZGF0ZVwiOiAxODEzXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTAzXCIsIFwieFwiOiA5OS41LCBcInlcIjogNTY2LCBcInpvb21YXCI6IDAuMDYyLCBcInpvb21ZXCI6IDAuMDYsIFwicm90YXRpb25cIjogLTMuMTU1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTEwMy5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjUsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBTb3V0aCBTaWRlIG9mIENvbGxlZ2UgR3JlZW4gYW5kIHZpY2luaXR5IERhdGU6IDE4MDhcIixcblx0XHRcImRhdGVcIjogMTgwOFxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTE0OS0xXCIsIFwieFwiOiAtMTA5MSwgXCJ5XCI6IDUxNS41LCBcInpvb21YXCI6IDAuMDYyLCBcInpvb21ZXCI6IDAuMDYsIFwicm90YXRpb25cIjogMCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0xNDktMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCAtIEphbWVz4oCZcyBHYXRlLCBKYW1lcyBTdHJlZXQsIFRob21hcyBTdHJlZXQgYW5kIFdhdGxpbmcgU3RyZWV0LiBNci4gR3Vpbm5lc3PigJlzIFBsYWNlIERhdGU6IDE4NDVcIiwgXG5cdFx0XCJkYXRlXCI6IDE4NDVcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xNDktMlwiLCBcInhcIjogLTEwNzQuNSwgXCJ5XCI6IDQ4OCwgXCJ6b29tWFwiOiAwLjA0NCwgXCJ6b29tWVwiOiAwLjA0OCwgXCJyb3RhdGlvblwiOiAwLCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE0OS0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gSmFtZXPigJlzIEdhdGUsIEphbWVzIFN0cmVldCwgVGhvbWFzIFN0cmVldCBhbmQgV2F0bGluZyBTdHJlZXQuIE1yLiBHdWlubmVzc+KAmXMgUGxhY2UgRGF0ZTogMTg0NVwiLCBcblx0XHRcImRhdGVcIjogMTg0NVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTI1NFwiLCBcInhcIjogLTQzOCwgXCJ5XCI6IC0xNDIsIFwiem9vbVhcIjogMC4xMTgsIFwiem9vbVlcIjogMC4xMiwgXCJyb3RhdGlvblwiOiAtMC40MTUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtMjU0LnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIG9mIE1hYmJvdCBTdHJlZXQsIE1vbnRnb21lcnkgU3RyZWV0LCBEb21pbmljayBTdHJlZXQsIENoZXJyeSBMYW5lLCBDcm9zcyBMYW5lIGFuZCBUdXJuLWFnYWluLUxhbmUgRGF0ZTogMTgwMVwiLFxuXHRcdFwiZGF0ZVwiOiAxODAxXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTA2LTFcIiwgXCJ4XCI6IC03NTcsIFwieVwiOiA0OTUuNSwgXCJ6b29tWFwiOiAwLjI2NSwgXCJ6b29tWVwiOiAwLjI2NSwgXCJyb3RhdGlvblwiOiAtMC4wNzQsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0xMDYtMS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjgsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgc2hvd2luZyBwcm9wb3NlZCBpbXByb3ZlbWVudHMgdG8gYmUgbWFkZSBpbiBDb3JubWFya2V0LCBDdXRwdXJzZSBSb3csIExhbWIgQWxsZXkgLSBGcmFuY2lzIFN0cmVldCAtIGFuZCBhbiBpbXByb3ZlZCBlbnRyYW5jZSBmcm9tIEtldmluIFN0cmVldCB0byBTYWludCBQYXRyaWNr4oCZcyBDYXRoZWRyYWwsIHRocm91Z2ggTWl0cmUgQWxsZXkgYW5kIGF0IEphbWVz4oCZcyBHYXRlLiBEYXRlOiAxODQ1LTQ2IFwiLFxuXHRcdFwiZGF0ZVwiOiAxODQ1XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTQ2LTFcIiwgXCJ4XCI6IC02ODMsIFwieVwiOiA0NzEsIFwiem9vbVhcIjogMC4wODIsIFwiem9vbVlcIjogMC4wODIsIFwicm90YXRpb25cIjogLTAuMSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTE0Ni0xLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNSxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIGFuZCB0cmFjaW5nIG9mIHByZW1pc2VzIGluIENvcm5tYXJrZXQsIEN1dHB1cnNlIFJvdyBhbmQgdmljaW5pdHkgRGF0ZTogMTg0OVwiLFxuXHRcdFwiZGF0ZVwiOiAxODQ5XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNjAwXCIsIFwieFwiOiAxMzkuNSwgXCJ5XCI6IDc1OCwgXCJ6b29tWFwiOiAwLjA2MiwgXCJ6b29tWVwiOiAwLjA2MiwgXCJyb3RhdGlvblwiOiAtMC40MTUsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy02MDAucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC45LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJNYXAgb2YgdGhlIGdyb3VuZCBldGMuLCBvZiB0aGUgTWFuc2lvbiBIb3VzZSwgRGF3c29uIFN0cmVldCBEYXRlOiAxNzgxXCIsXG5cdFx0XCJkYXRlXCI6IDE3ODFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0zNDhcIiwgXCJ4XCI6IC0xMzQ1LjUsIFwieVwiOiA0OTMsIFwiem9vbVhcIjogMC40LCBcInpvb21ZXCI6IDAuNDc4LCBcInJvdGF0aW9uXCI6IC0wLjA3NSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTM0OC5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjYsXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIk1hcCBvZiBwYXJ0IG9mIHRoZSBDaXR5IG9mIER1YmxpbiBuZWFyIHRoZSBHcmFuZCBDYW5hbCAtIHNob3dpbmcgaW1wcm92ZW1lbnRzIGFuZCBhcHByb2FjaGVzIG1hZGUsIGFuZCB0aG9zZSBwcm9wb3NlZCB0byBiZSBtYWRlOyBhbmQgdGhlIHNpdHVhdGlvbiBvZiB0aGUgZm9sbG93aW5nIHN0cmVldHMgdml6OiAtIEJhc29uIExhbmU7IENhbmFsIFBsYWNlOyBQb3J0bGFuZCBTdHJlZXQ7IFJhaW5zZm9yZCBTdHJlZXQ7IENyYW5lIExhbmU7IEJlbGx2aWV3OyBUaG9tYXMgQ291cnQ7IEhhbmJ1cnkgTGFuZTsgTWVhdGggUm93OyBNZWF0aCBTdHJlZXQ7IEVhcmwgU3RyZWV0IFdlc3Q7IFdhZ2dvbiBMYW5lOyBDcmF3bGV5YHMgWWFyZDsgUm9iZXJ0IFN0cmVldDsgTWFya2V0IFN0cmVldDsgQm9uZCBTdHJlZXQ7IENhbmFsIEJhbmssIE5ld3BvcnQgU3RyZWV0OyBNYXJyb3dib25lIExhbmUsIFN1bW1lciBTdHJlZXQ7IEJyYWl0aHdhaXRlIFN0cmVldDsgUGltYmxpY28sIFRyaXBvbG8gKHNpdGUgb2YgT2xkIENvdXJ0IEhvdXNlKSwgbmVhciBUaG9tYXMgQ291cnQ7IENvbGUgQWxsZXk7IFN3aWZ0cyBBbGxleTsgQ3Jvc3RpY2sgQWxsZXk7IEVsYm93IExhbmU7IFVwcGVyIENvb21iZSBhbmQgVGVudGVyJ3MgRmllbGRzIERhdGU6IDE3ODdcIixcblx0XHRcImRhdGVcIjogMTc4N1xuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTQzMy0yXCIsIFwieFwiOiAtNTM2LjUsIFwieVwiOiA4NzAuNSwgXCJ6b29tWFwiOiAwLjA1OCwgXCJ6b29tWVwiOiAwLjA1OCwgXCJyb3RhdGlvblwiOiAtMC4wMSxcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLTQzMy0yLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuNyxcblx0XHRcImRlc2NyaXB0aW9uXCI6IFwiTWFwIC0gQ29vbWJlLCBGcmFuY2lzIFN0cmVldCwgTmV3IFJvdywgQ3Jvc3MgUG9kZGxlIChub3cgRGVhbiBTdHJlZXQpLCBUaHJlZS1TdG9uZS1BbGxleSAobm93IHRoZSBsb3dlciBlbmQgb2YgTmV3IFN0cmVldCksIFBhdHJpY2sgU3RyZWV0LCBQYXRyaWNr4oCZcyBDbG9zZSwgS2V2aW4gU3RyZWV0IGFuZCBNaXRyZSBBbGxleSBEYXRlOiAxODI0LTI4XCIsXG5cdFx0XCJkYXRlXCI6IDE4MjRcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNTlcIiwgXCJ4XCI6IC01MjcuNSwgXCJ5XCI6IC0xMTkuNSwgXCJ6b29tWFwiOiAwLjA3LCBcInpvb21ZXCI6IDAuMDcsIFwicm90YXRpb25cIjogLTAuMDgsXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy0wNTkucG5nXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC45LFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJHcm91bmQgcGxhbiBvZiBMaW5lbiBIYWxsXCJcblx0fVxuXVxuIiwiaW1wb3J0IHsgSW5kZXhlciB9IGZyb20gXCIuL2luZGV4ZXJcIjtcbmltcG9ydCB7IEdyaWRJbmRleGVyIH0gZnJvbSBcIi4vZ3JpZGluZGV4ZXJcIjtcbmltcG9ydCB7IENvbnRhaW5lckxheWVyLCBDYW52YXNMYXllciB9IGZyb20gXCIuLi9ncmFwaGljcy9sYXllclwiO1xuXG5leHBvcnQgY2xhc3MgQ29udGFpbmVySW5kZXggaW1wbGVtZW50cyBJbmRleGVyIHtcblxuXHRjb25zdHJ1Y3Rvcihcblx0ICByZWFkb25seSBjb250YWluZXI6IENvbnRhaW5lckxheWVyLCBcblx0ICByZWFkb25seSBuYW1lOiBzdHJpbmcsXG5cdCAgcmVhZG9ubHkgaW5kZXhlcjogSW5kZXhlciA9IG5ldyBHcmlkSW5kZXhlcigyNTYpKXtcblx0XHRmb3IgKGxldCBsYXllciBvZiBjb250YWluZXIubGF5ZXJzKCkpe1xuXHRcdFx0dGhpcy5hZGQobGF5ZXIpO1xuXHRcdH1cblx0fVxuXG5cdGdldExheWVycyh4OiBudW1iZXIsIHk6IG51bWJlcik6IEFycmF5PENhbnZhc0xheWVyPntcblx0XHRpZiAodGhpcy5jb250YWluZXIuaXNWaXNpYmxlKCkpe1xuXHRcdFx0Y29uc29sZS5sb2codGhpcy5uYW1lICsgXCIgaXMgdmlzaWJsZSBcIik7XG5cdFx0XHRyZXR1cm4gdGhpcy5pbmRleGVyLmdldExheWVycyh4LCB5KTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRyZXR1cm4gW107XG5cdFx0fVxuXHR9XG5cblx0YWRkKGNhbnZhc0xheWVyOiBDYW52YXNMYXllcik6IHZvaWQge1xuXHRcdHRoaXMuaW5kZXhlci5hZGQoY2FudmFzTGF5ZXIpO1xuXHR9XG5cbn0iLCJpbXBvcnQgeyBDYW52YXNMYXllciwgQ29udGFpbmVyTGF5ZXIgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvbGF5ZXJcIjtcbmltcG9ydCB7IENvbnNvbGVMb2dnZXIsIExvZ2dlciB9IGZyb20gXCIuLi9sb2dnaW5nL2xvZ2dlclwiO1xuaW1wb3J0IHsgSW5kZXhlciB9IGZyb20gXCIuL2luZGV4ZXJcIjtcblxuY2xhc3MgR3JpZE1hcCB7XG5cdHJlYWRvbmx5IGxheWVyTWFwOiBNYXA8c3RyaW5nLCBBcnJheTxDYW52YXNMYXllcj4+XG5cblx0Y29uc3RydWN0b3IoKXtcblx0XHR0aGlzLmxheWVyTWFwID0gbmV3IE1hcDxzdHJpbmcsIEFycmF5PENhbnZhc0xheWVyPj4oKTtcblx0fSBcblxuXHRhZGQoeDogbnVtYmVyLCB5OiBudW1iZXIsIGxheWVyOiBDYW52YXNMYXllcil7XG5cdFx0dmFyIGxheWVyVmFsdWVzOiBBcnJheTxDYW52YXNMYXllcj47XG5cdFx0aWYgKHRoaXMubGF5ZXJNYXAuaGFzKHRoaXMua2V5KHgsIHkpKSl7XG5cdFx0XHRsYXllclZhbHVlcyA9IHRoaXMubGF5ZXJNYXAuZ2V0KHRoaXMua2V5KHgsIHkpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bGF5ZXJWYWx1ZXMgPSBbXTtcblx0XHR9XG5cdFx0bGF5ZXJWYWx1ZXMucHVzaChsYXllcik7XG5cdFx0dGhpcy5sYXllck1hcC5zZXQodGhpcy5rZXkoeCwgeSksIGxheWVyVmFsdWVzKTtcblx0fVxuXG5cdGdldCh4OiBudW1iZXIsIHk6IG51bWJlcik6IEFycmF5PENhbnZhc0xheWVyPntcblx0XHRyZXR1cm4gdGhpcy5sYXllck1hcC5nZXQodGhpcy5rZXkoeCwgeSkpO1xuXHR9XG5cblx0aGFzKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXAuaGFzKHRoaXMua2V5KHgsIHkpKTtcblx0fVxuXG5cdHByaXZhdGUga2V5KHg6IG51bWJlciwgeTogbnVtYmVyKTogc3RyaW5nIHtcblx0XHRyZXR1cm4geCArIFwiX1wiICsgeTtcblx0fVxuXG59XG5cbmV4cG9ydCBjbGFzcyBHcmlkSW5kZXhlciBpbXBsZW1lbnRzIEluZGV4ZXIge1xuXG5cdHByaXZhdGUgbG9nZ2VyOiBMb2dnZXI7XG5cdHByaXZhdGUgY2FudmFzTWFwID0gbmV3IEdyaWRNYXAoKTtcblxuXHRjb25zdHJ1Y3RvcihyZWFkb25seSBncmlkV2lkdGg6IG51bWJlciwgXG5cdCAgcmVhZG9ubHkgZ3JpZEhlaWdodDogbnVtYmVyID0gZ3JpZFdpZHRoKXtcblx0XHR0aGlzLmxvZ2dlciA9IG5ldyBDb25zb2xlTG9nZ2VyKCk7XG5cdH1cblxuXHRzZXRMb2dnZXIobG9nZ2VyOiBMb2dnZXIpOiB2b2lkIHtcblx0XHR0aGlzLmxvZ2dlciA9IGxvZ2dlcjtcblx0fVxuXG5cdGdldExheWVycyh4OiBudW1iZXIsIHk6IG51bWJlcik6IEFycmF5PENhbnZhc0xheWVyPiB7XG5cdFx0bGV0IGdyaWRYID0gTWF0aC5mbG9vcih4IC8gdGhpcy5ncmlkV2lkdGgpO1xuXHRcdGxldCBncmlkWSA9IE1hdGguZmxvb3IoeSAvIHRoaXMuZ3JpZEhlaWdodCk7XG5cblx0XHR0aGlzLmxvZ2dlci5sb2coXCJncmlkIHh5IFwiICsgZ3JpZFggKyBcIiwgXCIgKyBncmlkWSk7XG5cblx0XHRpZiAodGhpcy5jYW52YXNNYXAuaGFzKGdyaWRYLCBncmlkWSkpe1xuXHRcdFx0cmV0dXJuIHRoaXMuY2FudmFzTWFwLmdldChncmlkWCwgZ3JpZFkpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHJldHVybiBbXTtcblx0XHR9XG5cdH1cblxuXHRhZGQoY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyKXtcblxuXHRcdGxldCBkaW1lbnNpb24gPSBjYW52YXNMYXllci5nZXREaW1lbnNpb24oKTtcblxuXHRcdGxldCB4TWluID0gTWF0aC5mbG9vcihkaW1lbnNpb24ueCAvIHRoaXMuZ3JpZFdpZHRoKTtcblx0XHRsZXQgeE1heCA9IE1hdGguZmxvb3IoKGRpbWVuc2lvbi54ICsgZGltZW5zaW9uLncpIC8gdGhpcy5ncmlkV2lkdGgpO1xuXG5cdFx0bGV0IHlNaW4gPSBNYXRoLmZsb29yKGRpbWVuc2lvbi55IC8gdGhpcy5ncmlkSGVpZ2h0KTtcblx0XHRsZXQgeU1heCA9IE1hdGguZmxvb3IoKGRpbWVuc2lvbi55ICsgZGltZW5zaW9uLmgpIC8gdGhpcy5ncmlkSGVpZ2h0KTtcblxuXHRcdGZvciAodmFyIHggPSB4TWluOyB4PD14TWF4OyB4Kyspe1xuXHRcdFx0Zm9yICh2YXIgeSA9IHlNaW47IHk8PXlNYXg7IHkrKyl7XG5cdFx0XHRcdHRoaXMuY2FudmFzTWFwLmFkZCh4LCB5LCBjYW52YXNMYXllcik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0c2hvd0luZGljZXMoY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyKTogdm9pZCB7XG5cblx0XHRsZXQgZGltZW5zaW9uID0gY2FudmFzTGF5ZXIuZ2V0RGltZW5zaW9uKCk7XG5cblx0XHRsZXQgeE1pbiA9IE1hdGguZmxvb3IoZGltZW5zaW9uLnggLyB0aGlzLmdyaWRXaWR0aCk7XG5cdFx0bGV0IHhNYXggPSBNYXRoLmZsb29yKChkaW1lbnNpb24ueCArIGRpbWVuc2lvbi53KSAvIHRoaXMuZ3JpZFdpZHRoKTtcblxuXHRcdGxldCB5TWluID0gTWF0aC5mbG9vcihkaW1lbnNpb24ueSAvIHRoaXMuZ3JpZEhlaWdodCk7XG5cdFx0bGV0IHlNYXggPSBNYXRoLmZsb29yKChkaW1lbnNpb24ueSArIGRpbWVuc2lvbi5oKSAvIHRoaXMuZ3JpZEhlaWdodCk7XG5cblx0XHR2YXIgbWVzc2FnZSA9IFwiZ3JpZDogW1wiXG5cblx0XHRmb3IgKHZhciB4ID0geE1pbjsgeDw9eE1heDsgeCsrKXtcblx0XHRcdGZvciAodmFyIHkgPSB5TWluOyB5PD15TWF4OyB5Kyspe1xuXHRcdFx0XHRtZXNzYWdlID0gbWVzc2FnZSArIFwiW1wiICsgeCArIFwiLCBcIiArIHkgKyBcIl1cIjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRtZXNzYWdlID0gbWVzc2FnZSArIFwiXVwiO1xuXG5cdFx0dGhpcy5sb2dnZXIubG9nKG1lc3NhZ2UpO1xuXHR9XG59XG4iLCJpbXBvcnQgeyBDYW52YXNMYXllciB9IGZyb20gXCIuLi9ncmFwaGljcy9sYXllclwiO1xuaW1wb3J0IHsgQ2FudmFzVmlldyB9IGZyb20gXCIuLi9ncmFwaGljcy9jYW52YXN2aWV3XCI7XG5pbXBvcnQgeyBUaHVtYiB9IGZyb20gXCIuLi9ncmFwaGljcy9zdGF0aWNcIjtcbmltcG9ydCB7IEltYWdlQ29udHJvbGxlciB9IGZyb20gXCIuL2ltYWdlY29udHJvbGxlclwiO1xuXG5leHBvcnQgY2xhc3MgQ2FudmFzTGF5ZXJWaWV3IHtcblxuXHRyZWFkb25seSBjb250YWluZXI6IEhUTUxTcGFuRWxlbWVudDtcblxuXHRjb25zdHJ1Y3Rvcihcblx0ICBsYXllcjogQ2FudmFzTGF5ZXIsIFxuXHQgIGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIFxuXHQgIGltYWdlQ29udHJvbGxlcjogSW1hZ2VDb250cm9sbGVyXG5cdCl7XG5cblx0XHR0aGlzLmNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuXHRcdHRoaXMuY29udGFpbmVyLmNsYXNzTmFtZSA9IFwibGF5ZXJcIjtcblxuXHRcdGxldCBlZGl0ZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG5cblx0XHRsZXQgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcblx0XHRsYWJlbC5pbm5lckhUTUwgPSBsYXllci5uYW1lO1xuXG5cdFx0bGV0IHZpc2liaWxpdHk6IEhUTUxJbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG5cdFx0dmlzaWJpbGl0eS50eXBlID0gXCJjaGVja2JveFwiO1xuXHRcdHZpc2liaWxpdHkuY2hlY2tlZCA9IHRydWU7XG5cblx0XHRsZXQgZWRpdDogSFRNTElucHV0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcblx0XHRlZGl0LnR5cGUgPSBcInJhZGlvXCI7XG5cdFx0ZWRpdC5uYW1lID0gXCJlZGl0XCI7XG5cblx0XHR2aXNpYmlsaXR5LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdGlmICh0aGlzLmNoZWNrZWQpe1xuXHRcdFx0XHRsYXllci5zZXRWaXNpYmxlKHRydWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bGF5ZXIuc2V0VmlzaWJsZShmYWxzZSk7XG5cdFx0XHR9XG5cdFx0XHRjYW52YXNWaWV3LmRyYXcoKTtcblx0XHR9KTtcblxuXHRcdGVkaXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0aWYgKHRoaXMuY2hlY2tlZCl7XG5cdFx0XHRcdGltYWdlQ29udHJvbGxlci5zZXRDYW52YXNMYXllcihsYXllcik7XG5cdFx0XHR9IFxuXHRcdFx0Y2FudmFzVmlldy5kcmF3KCk7XG5cdFx0fSk7XG5cblx0XHR2YXIgdGh1bWIgPSA8VGh1bWI+IGxheWVyO1xuXG5cdFx0bGV0IGNhbnZhc0ltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcblx0XHRsZXQgdGh1bWJDdHggPSBjYW52YXNJbWFnZS5nZXRDb250ZXh0KFwiMmRcIik7XG5cdFx0dGh1bWIuZHJhd1RodW1iKHRodW1iQ3R4LCAyMDAsIDIwMCk7XG5cblx0XHRsZXQgdGh1bWJuYWlsOiBIVE1MSW1hZ2VFbGVtZW50ID0gbmV3IEltYWdlKCk7XG5cdFx0dGh1bWJuYWlsLnNyYyA9IGNhbnZhc0ltYWdlLnRvRGF0YVVSTCgpO1xuXHRcdHRodW1ibmFpbC5jbGFzc05hbWUgPSBcInRodW1ibmFpbFwiO1xuXG5cdFx0ZWRpdGRpdi5hcHBlbmRDaGlsZChsYWJlbCk7XG5cdFx0ZWRpdGRpdi5hcHBlbmRDaGlsZCh2aXNpYmlsaXR5KTtcblx0XHRlZGl0ZGl2LmFwcGVuZENoaWxkKGVkaXQpO1xuXHRcdHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGVkaXRkaXYpO1xuXHRcdHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRodW1ibmFpbCk7XG5cdH1cblxufSIsImltcG9ydCB7Q2FudmFzVmlldywgRGlzcGxheUVsZW1lbnR9IGZyb20gXCIuLi9ncmFwaGljcy9jYW52YXN2aWV3XCI7XG5pbXBvcnQge0NhbnZhc0xheWVyfSBmcm9tIFwiLi4vZ3JhcGhpY3MvbGF5ZXJcIjtcbmltcG9ydCB7UmVjdExheWVyfSBmcm9tIFwiLi4vZ3JhcGhpY3Mvc3RhdGljXCI7XG5pbXBvcnQge0dyaWRJbmRleGVyfSBmcm9tIFwiLi4vaW5kZXgvZ3JpZGluZGV4ZXJcIjtcbmltcG9ydCB7RWxlbWVudExvZ2dlcn0gZnJvbSBcIi4uL2xvZ2dpbmcvbG9nZ2VyXCI7XG5cbmV4cG9ydCBjbGFzcyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3IoY2FudmFzVmlldzogQ2FudmFzVmlldywgcmVhZG9ubHkgZGlzcGxheUVsZW1lbnQ6IERpc3BsYXlFbGVtZW50LCAgcHVibGljIG1vZDogc3RyaW5nID0gXCJ2XCIpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZChjYW52YXNWaWV3LCBlICBhcyBLZXlib2FyZEV2ZW50KSk7XG4gICAgfVxuXG4gICAgcHJlc3NlZChjYW52YXNWaWV3OiBDYW52YXNWaWV3LCBldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICBcbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgIGNhc2UgdGhpcy5tb2Q6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0b2dnbGUgdmlzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlFbGVtZW50LnNldFZpc2libGUoIXRoaXMuZGlzcGxheUVsZW1lbnQuaXNWaXNpYmxlKCkpO1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VDb250cm9sbGVyIHtcblxuICAgIHByaXZhdGUgY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyO1xuICAgIHByaXZhdGUgbGF5ZXJPdXRsaW5lOiBSZWN0TGF5ZXI7XG4gICAgcHJpdmF0ZSBlZGl0SW5mb1BhbmU6IEhUTUxFbGVtZW50O1xuXG4gICAgcHJpdmF0ZSBpbmRleGVyOiBHcmlkSW5kZXhlciA9IG5ldyBHcmlkSW5kZXhlcigyNTYpO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBjYW52YXNWaWV3OiBDYW52YXNWaWV3LCBjYW52YXNMYXllcjogQ2FudmFzTGF5ZXIpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZChjYW52YXNWaWV3LCBlICBhcyBLZXlib2FyZEV2ZW50KSk7XG4gICAgICAgIHRoaXMuY2FudmFzTGF5ZXIgPSBjYW52YXNMYXllcjtcbiAgICB9XG5cbiAgICBzZXRDYW52YXNMYXllcihjYW52YXNMYXllcjogQ2FudmFzTGF5ZXIpe1xuICAgICAgICB0aGlzLmNhbnZhc0xheWVyID0gY2FudmFzTGF5ZXI7XG5cbiAgICAgICAgdGhpcy5pbmRleGVyLnNob3dJbmRpY2VzKGNhbnZhc0xheWVyKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKHRoaXMuY2FudmFzVmlldyk7XG4gICAgfVxuXG4gICAgc2V0RWRpdEluZm9QYW5lKGVkaXRJbmZvUGFuZTogSFRNTEVsZW1lbnQpe1xuICAgICAgICB0aGlzLmVkaXRJbmZvUGFuZSA9IGVkaXRJbmZvUGFuZTtcbiAgICB9XG5cbiAgICBzZXRMYXllck91dGxpbmUobGF5ZXJPdXRsaW5lOiBSZWN0TGF5ZXIpe1xuICAgICAgICB0aGlzLmxheWVyT3V0bGluZSA9IGxheWVyT3V0bGluZTtcbiAgICB9XG5cbiAgICBwcmVzc2VkKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicHJlc3NlZFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQua2V5KTtcblxuICAgICAgICBsZXQgbXVsdGlwbGllciA9IDE7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgIGNhc2UgXCJhXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54IC0gMC41ICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJBXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54IC0gNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIueCA9IHRoaXMuY2FudmFzTGF5ZXIueCArIDAuNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiRFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIueCA9IHRoaXMuY2FudmFzTGF5ZXIueCArIDUgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIndcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnkgPSB0aGlzLmNhbnZhc0xheWVyLnkgLSAwLjUgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIldcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnkgPSB0aGlzLmNhbnZhc0xheWVyLnkgLSA1ICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhazsgICAgXG4gICAgICAgICAgICBjYXNlIFwic1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIueSA9IHRoaXMuY2FudmFzTGF5ZXIueSArIDAuNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiU1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIueSA9IHRoaXMuY2FudmFzTGF5ZXIueSArIDUgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImVcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uID0gdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiAtIDAuMDA1O1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIkVcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uID0gdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiAtIDAuMDU7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwicVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gPSB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uICsgMC4wMDU7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiUVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gPSB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uICsgMC4wNTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJ4XCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci56b29tWCA9IHRoaXMuY2FudmFzTGF5ZXIuem9vbVggLSAwLjAwMiAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiWFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIuem9vbVggPSB0aGlzLmNhbnZhc0xheWVyLnpvb21YICsgMC4wMDIgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInpcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnpvb21ZID0gdGhpcy5jYW52YXNMYXllci56b29tWSAtIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJaXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci56b29tWSA9IHRoaXMuY2FudmFzTGF5ZXIuem9vbVkgKyAwLjAwMiAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiY1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIuc2V0VmlzaWJsZSghdGhpcy5jYW52YXNMYXllci52aXNpYmxlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJUXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5vcGFjaXR5ID0gTWF0aC5taW4oMS4wLCB0aGlzLmNhbnZhc0xheWVyLm9wYWNpdHkgKyAwLjEpO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLm9wYWNpdHkgPSBNYXRoLm1heCgwLCB0aGlzLmNhbnZhc0xheWVyLm9wYWNpdHkgLSAwLjEpO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBjb2RlLi4uXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaW5mbzogc3RyaW5nID0gJ1wibmFtZVwiOiAnICsgdGhpcy5jYW52YXNMYXllci5uYW1lICtcbiAgICAgICAgICAgICAgJyBcInhcIjogJyArIHRoaXMuY2FudmFzTGF5ZXIueCArXG4gICAgICAgICAgICAgICcsIFwieVwiOiAnICsgdGhpcy5jYW52YXNMYXllci55ICtcbiAgICAgICAgICAgICAgJywgXCJ6b29tWFwiOiAnKyB0aGlzLmNhbnZhc0xheWVyLnpvb21YICsgXG4gICAgICAgICAgICAgICcsIFwiem9vbVlcIjogJyArIHRoaXMuY2FudmFzTGF5ZXIuem9vbVkgKyBcbiAgICAgICAgICAgICAgJywgXCJyb3RhdGlvblwiOiAnKyB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uO1xuXG4gICAgICAgIGlmICh0aGlzLmVkaXRJbmZvUGFuZSAhPSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgdGhpcy5lZGl0SW5mb1BhbmUuaW5uZXJIVE1MID0gaW5mbztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGluZm8pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3OiBDYW52YXNWaWV3KSB7XG5cbiAgICAgICAgaWYgKHRoaXMubGF5ZXJPdXRsaW5lICE9IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICBsZXQgbmV3RGltZW5zaW9uID0gdGhpcy5jYW52YXNMYXllci5nZXREaW1lbnNpb24oKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJpbWFnZSBvdXRsaW5lIFwiICsgbmV3RGltZW5zaW9uKTtcbiAgICAgICAgICAgIHRoaXMubGF5ZXJPdXRsaW5lLnVwZGF0ZURpbWVuc2lvbihuZXdEaW1lbnNpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgfVxuXG59OyIsImltcG9ydCB7IENhbnZhc1ZpZXcgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgQ2FudmFzTGF5ZXIsIENvbnRhaW5lckxheWVyIH0gZnJvbSBcIi4uL2dyYXBoaWNzL2xheWVyXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuaW1wb3J0IHsgTW91c2VDb250cm9sbGVyIH0gZnJvbSBcIi4vdmlld2NvbnRyb2xsZXJcIjtcbmltcG9ydCB7IEluZGV4ZXIgfSBmcm9tIFwiLi4vaW5kZXgvaW5kZXhlclwiO1xuaW1wb3J0IHsgTG9nZ2VyLCBDb25zb2xlTG9nZ2VyIH0gZnJvbSBcIi4uL2xvZ2dpbmcvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IEltYWdlQ29udHJvbGxlciB9IGZyb20gXCIuL2ltYWdlY29udHJvbGxlclwiO1xuaW1wb3J0IHsgSW5kZXhWaWV3IH0gZnJvbSBcIi4vaW5kZXh2aWV3XCI7XG5pbXBvcnQgeyBDYW52YXNMYXllclZpZXcgfSBmcm9tIFwiLi9jYW52YXNsYXllcnZpZXdcIjtcblxuZXhwb3J0IGNsYXNzIEluZGV4Q29udHJvbGxlciBleHRlbmRzIE1vdXNlQ29udHJvbGxlciB7XG5cblx0cHJpdmF0ZSBsb2dnZXI6IExvZ2dlcjtcblx0cHJpdmF0ZSBpbmRleGVyczogQXJyYXk8SW5kZXhlcj47XG5cdHByaXZhdGUgbWVudTogSFRNTEVsZW1lbnQ7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgIHJlYWRvbmx5IGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsXG4gICAgICByZWFkb25seSBpbWFnZUNvbnRyb2xsZXI6IEltYWdlQ29udHJvbGxlclxuICAgICkge1xuXG4gICAgXHRzdXBlcigpO1xuXG4gICAgXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmNsaWNrZWQoZSAgYXMgTW91c2VFdmVudCkpO1xuXG4gICAgXHR0aGlzLmluZGV4ZXJzID0gW107XG4gICAgXHR0aGlzLmxvZ2dlciA9IG5ldyBDb25zb2xlTG9nZ2VyKCk7XG4gICAgfVxuXG4gICAgc2V0TG9nZ2luZyhsb2dnZXI6IExvZ2dlcil7XG4gICAgXHR0aGlzLmxvZ2dlciA9IGxvZ2dlcjtcbiAgICB9XG5cbiAgICBzZXRNZW51KG1lbnU6IEhUTUxFbGVtZW50KXtcbiAgICBcdHRoaXMubWVudSA9IG1lbnU7XG4gICAgfVxuXG4gICAgYWRkSW5kZXhlcihpbmRleGVyOiBJbmRleGVyKXtcbiAgICBcdHRoaXMuaW5kZXhlcnMucHVzaChpbmRleGVyKTtcbiAgICB9XG5cbiAgICBjbGlja2VkKGU6IE1vdXNlRXZlbnQpe1xuICAgIFx0bGV0IHBvaW50ICA9IHRoaXMubW91c2VQb3NpdGlvbihlLCB0aGlzLmNhbnZhc1ZpZXcuY2FudmFzRWxlbWVudCk7XG5cbiAgICBcdGxldCB3b3JsZFBvaW50ID0gdGhpcy5jYW52YXNWaWV3LmdldEJhc2VQb2ludChcbiAgICBcdFx0bmV3IFBvaW50MkQocG9pbnRbMF0sIHBvaW50WzFdKSk7XG5cbiAgICBcdHZhciBsYXllcnM6IEFycmF5PENhbnZhc0xheWVyPiA9IFtdO1xuXG4gICAgXHRmb3IgKGxldCBpbmRleGVyIG9mIHRoaXMuaW5kZXhlcnMpIHtcbiAgICBcdFx0bGV0IG5ld0xheWVycyA9IHRoaXMuZmlsdGVyVmlzaWJsZShcbiAgICBcdFx0XHRpbmRleGVyLmdldExheWVycyh3b3JsZFBvaW50LngsIHdvcmxkUG9pbnQueSkpO1xuICAgIFx0XHRsYXllcnMgPSBsYXllcnMuY29uY2F0KG5ld0xheWVycyk7XG4gICAgXHR9XG5cbiAgICBcdGlmICh0aGlzLm1lbnUgIT0gdW5kZWZpbmVkKXtcbiAgICBcdFx0bGV0IGxheWVyVmlldyA9IG5ldyBJbmRleFZpZXcodGhpcy5tZW51LCB0aGlzLmNhbnZhc1ZpZXcsIFxuICAgIFx0XHRcdHRoaXMuaW1hZ2VDb250cm9sbGVyKTtcbiAgICBcdFx0bGF5ZXJWaWV3LnNldEVsZW1lbnRzKGxheWVycyk7XG4gICAgXHR9XG4gICAgfVxuXG5cdHByaXZhdGUgZmlsdGVyVmlzaWJsZShsYXllcnM6IEFycmF5PENhbnZhc0xheWVyPil7XG5cdFx0cmV0dXJuIGxheWVycy5maWx0ZXIoZnVuY3Rpb24obGF5ZXIpIHsgXG5cdFx0XHRyZXR1cm4gbGF5ZXIuaXNWaXNpYmxlKCk7XG5cdFx0fSk7XG5cdH1cblxufSIsImltcG9ydCB7IENhbnZhc0xheWVyIH0gZnJvbSBcIi4uL2dyYXBoaWNzL2xheWVyXCI7XG5pbXBvcnQgeyBDYW52YXNWaWV3IH0gZnJvbSBcIi4uL2dyYXBoaWNzL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IENhbnZhc0xheWVyVmlldyB9IGZyb20gXCIuL2NhbnZhc2xheWVydmlld1wiO1xuaW1wb3J0IHsgSW1hZ2VDb250cm9sbGVyIH0gZnJvbSBcIi4vaW1hZ2Vjb250cm9sbGVyXCI7XG5cbmV4cG9ydCBjbGFzcyBJbmRleFZpZXcge1xuXG5cdGNvbnN0cnVjdG9yKFxuXHQgIHJlYWRvbmx5IHZpZXdFbGVtZW50OiBIVE1MRWxlbWVudCwgXG5cdCAgcmVhZG9ubHkgY2FudmFzVmlldzogQ2FudmFzVmlldyxcblx0ICByZWFkb25seSBpbWFnZUNvbnRyb2xsZXI6IEltYWdlQ29udHJvbGxlclxuXHQpe31cblx0XG5cdHNldEVsZW1lbnRzKGNhbnZhc0VsZW1lbnRzOiBBcnJheTxDYW52YXNMYXllcj4pOiB2b2lkIHtcblx0XHR0aGlzLmNsZWFyKCk7XG5cdFx0XG5cdFx0Zm9yIChsZXQgY2FudmFzTGF5ZXIgb2YgY2FudmFzRWxlbWVudHMpe1xuXHRcdFx0bGV0IGxheWVyVmlldyA9IG5ldyBDYW52YXNMYXllclZpZXcoY2FudmFzTGF5ZXIsIHRoaXMuY2FudmFzVmlldywgXG5cdFx0XHRcdHRoaXMuaW1hZ2VDb250cm9sbGVyKTtcblx0XHRcdHRoaXMudmlld0VsZW1lbnQuYXBwZW5kQ2hpbGQobGF5ZXJWaWV3LmNvbnRhaW5lcik7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBjbGVhcigpOiBib29sZWFuIHtcblx0XHRsZXQgY2hpbGRyZW4gPSB0aGlzLnZpZXdFbGVtZW50LmNoaWxkcmVuO1xuXHRcdGxldCBpbml0aWFsTGVuZ3RoID0gY2hpbGRyZW4ubGVuZ3RoO1xuXG5cdFx0d2hpbGUgKGNoaWxkcmVuLmxlbmd0aCA+IDApIHtcblx0XHRcdGNoaWxkcmVuWzBdLnJlbW92ZSgpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cbn0iLCJpbXBvcnQgeyBDb250YWluZXJMYXllciB9IGZyb20gXCIuLi9ncmFwaGljcy9sYXllclwiO1xuaW1wb3J0IHsgQ29udGFpbmVyTGF5ZXJNYW5hZ2VyIH0gZnJvbSBcIi4uL2dyYXBoaWNzL2xheWVybWFuYWdlclwiO1xuaW1wb3J0IHsgQ2FudmFzVmlldyB9IGZyb20gXCIuLi9ncmFwaGljcy9jYW52YXN2aWV3XCI7XG5cbmV4cG9ydCBjbGFzcyBMYXllckNvbnRyb2xsZXIge1xuXG5cdHByaXZhdGUgbW9kOiBzdHJpbmcgPSBcImlcIjtcblxuXHRjb25zdHJ1Y3RvcihjYW52YXNWaWV3OiBDYW52YXNWaWV3LCByZWFkb25seSBjb250YWluZXJMYXllck1hbmFnZXI6IENvbnRhaW5lckxheWVyTWFuYWdlcil7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZChjYW52YXNWaWV3LCBlICBhcyBLZXlib2FyZEV2ZW50KSk7XG5cdH1cblxuXHRwcmVzc2VkKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgIGNhc2UgdGhpcy5tb2Q6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0b2dnbGUgdmlzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lckxheWVyTWFuYWdlci50b2dnbGVWaXNpYmlsaXR5KGZhbHNlKTtcbiAgICAgICAgICAgICAgICBjYW52YXNWaWV3LmRyYXcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxufSIsImltcG9ydCB7IFZpZXdUcmFuc2Zvcm0gfSBmcm9tIFwiLi4vZ3JhcGhpY3Mvdmlld1wiO1xuaW1wb3J0IHsgQ2FudmFzVmlldyB9IGZyb20gXCIuLi9ncmFwaGljcy9jYW52YXN2aWV3XCI7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNb3VzZUNvbnRyb2xsZXIge1xuXG4gICAgbW91c2VQb3NpdGlvbihldmVudDogTW91c2VFdmVudCwgd2l0aGluOiBIVE1MRWxlbWVudCk6IEFycmF5PG51bWJlcj4ge1xuICAgICAgICBsZXQgbV9wb3N4ID0gZXZlbnQuY2xpZW50WCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0O1xuICAgICAgICBsZXQgbV9wb3N5ID0gZXZlbnQuY2xpZW50WSArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wXG4gICAgICAgICAgICAgICAgICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcblxuICAgICAgICB2YXIgZV9wb3N4ID0gMDtcbiAgICAgICAgdmFyIGVfcG9zeSA9IDA7XG5cbiAgICAgICAgaWYgKHdpdGhpbi5vZmZzZXRQYXJlbnQpe1xuICAgICAgICAgICAgZG8geyBcbiAgICAgICAgICAgICAgICBlX3Bvc3ggKz0gd2l0aGluLm9mZnNldExlZnQ7XG4gICAgICAgICAgICAgICAgZV9wb3N5ICs9IHdpdGhpbi5vZmZzZXRUb3A7XG4gICAgICAgICAgICB9IHdoaWxlICh3aXRoaW4gPSA8SFRNTEVsZW1lbnQ+d2l0aGluLm9mZnNldFBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW21fcG9zeCAtIGVfcG9zeCwgbV9wb3N5IC0gZV9wb3N5XTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIFZpZXdDb250cm9sbGVyIGV4dGVuZHMgTW91c2VDb250cm9sbGVyIHtcblxuXHRyZWNvcmQ6IGJvb2xlYW47XG5cdG1vdmU6IG51bWJlciA9IDE7XG5cblx0cHJpdmF0ZSB4UHJldmlvdXM6IG51bWJlcjtcblx0cHJpdmF0ZSB5UHJldmlvdXM6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3Rvcih2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtLCBcbiAgICAgICAgcmVhZG9ubHkgZHJhZ0VsZW1lbnQ6IEhUTUxFbGVtZW50LCByZWFkb25seSBjYW52YXNWaWV3OiBDYW52YXNWaWV3KSB7XG5cbiAgICBcdHN1cGVyKCk7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybSkpO1xuICAgIFx0ZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm0pKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybSkpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLnJlY29yZCA9IGZhbHNlKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5jbGlja2VkKGUgYXMgTW91c2VFdmVudCwgY2FudmFzVmlldywgMS4yKSk7XG4gICAgICAgIGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCAoZTogRXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy53aGVlbChlIGFzIFdoZWVsRXZlbnQsIGNhbnZhc1ZpZXcpKTtcbiAgICB9XG5cbiAgICBjbGlja2VkKGV2ZW50OiBNb3VzZUV2ZW50LCB2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtLCB6b29tQnk6IG51bWJlcil7XG4gICAgXHRzd2l0Y2goZXZlbnQudHlwZSl7XG4gICAgXHRcdGNhc2UgXCJkYmxjbGlja1wiOlxuICAgICAgICAgICAgICAgIC8vIGlmICAoZXZlbnQuY3RybEtleSkge1xuICAgICAgICAgICAgICAgIC8vICAgICB6b29tQnkgPSAxIC8gem9vbUJ5O1xuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBsZXQgbVhZID0gdGhpcy5tb3VzZVBvc2l0aW9uKGV2ZW50LCB0aGlzLmRyYWdFbGVtZW50KTtcblxuICAgICAgICAgICAgICAgIC8vIHRoaXMuY2FudmFzVmlldy56b29tQWJvdXQobVhZWzBdLCBtWFlbMV0sIHpvb21CeSk7XG5cbiAgICAgICAgICAgICAgICAvLyB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYWdnZWQoZXZlbnQ6IE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm06IFZpZXdUcmFuc2Zvcm0pIHtcblxuICAgIFx0c3dpdGNoKGV2ZW50LnR5cGUpe1xuICAgIFx0XHRjYXNlIFwibW91c2Vkb3duXCI6XG4gICAgXHRcdFx0dGhpcy5yZWNvcmQgPSB0cnVlO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwibW91c2V1cFwiOlxuICAgIFx0XHRcdHRoaXMucmVjb3JkID0gZmFsc2U7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGRlZmF1bHQ6XG4gICAgXHRcdFx0aWYgKHRoaXMucmVjb3JkKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHhEZWx0YSA9IChldmVudC5jbGllbnRYIC0gdGhpcy54UHJldmlvdXMpIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHlEZWx0YSA9IChldmVudC5jbGllbnRZIC0gdGhpcy55UHJldmlvdXMpIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWTtcblxuICAgICAgICAgICAgICAgICAgICB2aWV3VHJhbnNmb3JtLnggPSB2aWV3VHJhbnNmb3JtLnggLSB4RGVsdGE7XG4gICAgICAgICAgICAgICAgICAgIHZpZXdUcmFuc2Zvcm0ueSA9IHZpZXdUcmFuc2Zvcm0ueSAtIHlEZWx0YTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgIFx0XHRcdH1cblxuXHRcdFx0dGhpcy54UHJldmlvdXMgPSBldmVudC5jbGllbnRYO1xuXHRcdFx0dGhpcy55UHJldmlvdXMgPSBldmVudC5jbGllbnRZO1xuICAgIFx0fVxuICAgIH1cblxuICAgIHdoZWVsKGV2ZW50OiBXaGVlbEV2ZW50LCB2aWV3VHJhbnNmb3JtOiBWaWV3VHJhbnNmb3JtKSB7XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIndoZWVsXCIgKyBldmVudC50YXJnZXQgKyBcIiwgXCIgKyBldmVudC50eXBlKTtcblxuICAgICAgICBsZXQgeERlbHRhID0gZXZlbnQuZGVsdGFYIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWDtcbiAgICAgICAgbGV0IHlEZWx0YSA9IGV2ZW50LmRlbHRhWSAvIHRoaXMubW92ZSAvIHZpZXdUcmFuc2Zvcm0uem9vbVk7XG5cbiAgICAgICAgaWYgIChldmVudC5jdHJsS2V5KSB7XG4gICAgICAgICAgICBsZXQgbVhZID0gdGhpcy5tb3VzZVBvc2l0aW9uKGV2ZW50LCB0aGlzLmRyYWdFbGVtZW50KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBieSA9IDEuMDU7XG4gICAgICAgICAgICBpZiAoeURlbHRhIDwgMCl7XG4gICAgICAgICAgICAgICAgYnkgPSAwLjk1O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuem9vbUFib3V0KG1YWVswXSwgbVhZWzFdLCBieSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcueCA9ICB0aGlzLmNhbnZhc1ZpZXcueCArIHhEZWx0YTtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy55ID0gIHRoaXMuY2FudmFzVmlldy55ICsgeURlbHRhO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuZHJhdygpO1xuICAgIH1cblxufVxuIiwiZXhwb3J0IGludGVyZmFjZSBMb2dnZXIge1xuXHRsb2coaW5mbzogc3RyaW5nKTogdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIEVsZW1lbnRMb2dnZXIgaW1wbGVtZW50cyBMb2dnZXIge1xuXG5cdGNvbnN0cnVjdG9yKHJlYWRvbmx5IGRpc3BsYXlFbGVtZW50OiBIVE1MRWxlbWVudCl7fVxuXG5cdGxvZyhpbmZvOiBzdHJpbmcpOiB2b2lkIHtcblx0XHR0aGlzLmRpc3BsYXlFbGVtZW50LmlubmVyVGV4dCA9IGluZm87XG5cdH1cblxufVxuXG5leHBvcnQgY2xhc3MgQ29uc29sZUxvZ2dlciBpbXBsZW1lbnRzIExvZ2dlciB7XG5cblx0bG9nKGluZm86IHN0cmluZyk6IHZvaWQge1xuXHRcdGNvbnNvbGUubG9nKGluZm8pO1xuXHR9XG5cbn0iLCJpbXBvcnQgeyBDYW52YXNWaWV3IH0gZnJvbSBcIi4vZ3JhcGhpY3MvY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgU3RhdGljSW1hZ2UgfSBmcm9tIFwiLi9ncmFwaGljcy9zdGF0aWNcIjtcbmltcG9ydCB7IENvbnRhaW5lckxheWVyIH0gZnJvbSBcIi4vZ3JhcGhpY3MvbGF5ZXJcIjtcbmltcG9ydCB7IEJhc2ljVHJhbnNmb3JtIH0gZnJvbSBcIi4vZ3JhcGhpY3Mvdmlld1wiO1xuaW1wb3J0IHsgU3RhdGljR3JpZCB9IGZyb20gXCIuL2dyYXBoaWNzL2dyaWRcIjtcbmltcG9ydCB7IFpvb21EaXNwbGF5UmFuZ2UgfSBmcm9tIFwiLi9ncmFwaGljcy9jYW52YXN2aWV3XCI7XG5pbXBvcnQgeyBUaWxlTGF5ZXIsIFRpbGVTdHJ1Y3QsIHpvb21CeUxldmVsfSBmcm9tIFwiLi9ncmFwaGljcy90aWxlbGF5ZXJcIjtcbmltcG9ydCB7IExheWVyTWFuYWdlciwgQ29udGFpbmVyTGF5ZXJNYW5hZ2VyLCBkYXRlRmlsdGVyLCBkYXRlbGVzc0ZpbHRlciB9IGZyb20gXG4gIFwiLi9ncmFwaGljcy9sYXllcm1hbmFnZXJcIjtcblxuaW1wb3J0IHsgSW5kZXhDb250cm9sbGVyIH0gZnJvbSBcIi4vaW50ZXJmYWNlL2luZGV4Y29udHJvbGxlclwiO1xuaW1wb3J0IHsgVmlld0NvbnRyb2xsZXIgfSBmcm9tIFwiLi9pbnRlcmZhY2Uvdmlld2NvbnRyb2xsZXJcIjtcbmltcG9ydCB7IEltYWdlQ29udHJvbGxlciwgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyIH0gZnJvbSBcIi4vaW50ZXJmYWNlL2ltYWdlY29udHJvbGxlclwiO1xuaW1wb3J0IHsgTGF5ZXJDb250cm9sbGVyIH0gZnJvbSBcIi4vaW50ZXJmYWNlL2xheWVyY29udHJvbGxlclwiO1xuXG5pbXBvcnQgeyBHcmlkSW5kZXhlciB9IGZyb20gXCIuL2luZGV4L2dyaWRpbmRleGVyXCI7XG5pbXBvcnQgeyBDb250YWluZXJJbmRleCB9IGZyb20gXCIuL2luZGV4L2NvbnRhaW5lcmluZGV4XCI7XG5pbXBvcnQgeyBFbGVtZW50TG9nZ2VyIH0gZnJvbSBcIi4vbG9nZ2luZy9sb2dnZXJcIjtcblxuaW1wb3J0ICogYXMgZmlyZW1hcHMgZnJvbSBcIi4vaW1hZ2Vncm91cHMvZmlyZW1hcHMuanNvblwiO1xuaW1wb3J0ICogYXMgbGFuZG1hcmtzIGZyb20gXCIuL2ltYWdlZ3JvdXBzL2xhbmRtYXJrcy5qc29uXCI7XG5pbXBvcnQgKiBhcyB3c2MgZnJvbSBcIi4vaW1hZ2Vncm91cHMvd3NjZC5qc29uXCI7XG5cbmxldCBlYXJseURhdGVzID0gZGF0ZUZpbHRlcih3c2MsIDE2ODAsIDE3OTIpO1xubGV0IG1pZERhdGVzID0gZGF0ZUZpbHRlcih3c2MsIDE3OTMsIDE4MjApO1xubGV0IGxhdGVEYXRlcyA9IGRhdGVGaWx0ZXIod3NjLCAxODIxLCAxOTAwKTtcbmxldCBvdGhlckRhdGVzID0gZGF0ZWxlc3NGaWx0ZXIod3NjKTtcblxubGV0IGxheWVyU3RhdGUgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgMSwgMSwgMCk7XG5sZXQgaW1hZ2VMYXllciA9IG5ldyBDb250YWluZXJMYXllcihsYXllclN0YXRlKTtcblxubGV0IGltYWdlU3RhdGUgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oLTE0NDAsLTE0NDAsIDAuMjIyLCAwLjIyMiwgMCk7XG5cbmxldCBjb3VudHlTdGF0ZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtMjYzMSwgLTIwNTEuNSwgMS43MTYsIDEuNjc0LCAwKTtcbmxldCBjb3VudHlJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZShjb3VudHlTdGF0ZSwgXG4gICAgXCJpbWFnZXMvQ291bnR5X29mX3RoZV9DaXR5X29mX0R1Ymxpbl8xODM3X21hcC5wbmdcIiwgMC41LCB0cnVlKTtcblxubGV0IGJnU3RhdGUgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oLTExMjYsLTEwODYsIDEuNTgsIDEuNTUsIDApO1xubGV0IGJnSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoYmdTdGF0ZSwgXCJpbWFnZXMvZm1zcy5qcGVnXCIsIC42LCB0cnVlKTtcblxubGV0IHRtU3RhdGUgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oLTEwMzMuNSwxNDksIDAuNTksIDAuNTksIDApO1xubGV0IHRtSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UodG1TdGF0ZSwgXCJpbWFnZXMvdGhpbmdtb3QucG5nXCIsIC4zLCB0cnVlKTtcblxubGV0IGR1U3RhdGUgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oLTkyOSwtMTA1LjUsIDAuNDY0LCAwLjUwNiwgMCk7XG5sZXQgZHVJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZShkdVN0YXRlLCBcImltYWdlcy9kdWJsaW4xNjEwLmpwZ1wiLCAuNiwgZmFsc2UpO1xuXG5sZXQgZ3JpZFRyYW5zZm9ybSA9IEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm07XG4vLyBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgMSwgMSwgMCk7XG5sZXQgc3RhdGljR3JpZCA9IG5ldyBTdGF0aWNHcmlkKGdyaWRUcmFuc2Zvcm0sIDAsIGZhbHNlLCAyNTYsIDI1Nik7XG5cbmxldCBzZW50aW5lbFN0cnVjdCA9IG5ldyBUaWxlU3RydWN0KFwicXRpbGUvZHVibGluL1wiLCBcIi5wbmdcIiwgXCJpbWFnZXMvcXRpbGUvZHVibGluL1wiKTtcblxubGV0IHNlbnRpbmVsVHJhbnNmb3JtID0gbmV3IEJhc2ljVHJhbnNmb3JtKDAsIDAsIDIsIDIsIDApO1xubGV0IHpvb21EaXNwbGF5ID0gbmV3IFpvb21EaXNwbGF5UmFuZ2UoMC44LCA0KTtcblxubGV0IHNlbnRpbmVsTGF5ZXIgPSBuZXcgVGlsZUxheWVyKHNlbnRpbmVsVHJhbnNmb3JtLCBzZW50aW5lbFN0cnVjdCwgdHJ1ZSwgXG4gICAgXCJzZW50aW5lbFwiLCB6b29tRGlzcGxheSwgXG4gICAxNTgxNiwgMTA2MjQsIDE1KTtcblxubGV0IHNlbnRpbmVsQlRyYW5zZm9ybSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgwLCAwLCA0LCA0LCAwKTtcbmxldCB6b29tQkRpc3BsYXkgPSBuZXcgWm9vbURpc3BsYXlSYW5nZSguMiwgMC44KTtcbmxldCBzZW50aW5lbEJMYXllciA9IG5ldyBUaWxlTGF5ZXIoc2VudGluZWxCVHJhbnNmb3JtLCBzZW50aW5lbFN0cnVjdCwgdHJ1ZSwgXG4gICAgXCJzZW50aW5lbEJcIiwgem9vbUJEaXNwbGF5LCBcbiAgIDc5MDgsIDUzMTIsIDE0KTtcblxubGV0IHNlbnRpbmVsQ1RyYW5zZm9ybSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgwLCAwLCA4LCA4LCAwKTtcbmxldCB6b29tQ0Rpc3BsYXkgPSBuZXcgWm9vbURpc3BsYXlSYW5nZSguMDQsIC4yKTtcbmxldCBzZW50aW5lbFNMYXllciA9IG5ldyBUaWxlTGF5ZXIoc2VudGluZWxDVHJhbnNmb3JtLCBzZW50aW5lbFN0cnVjdCwgdHJ1ZSwgXG4gICAgXCJzZW50aW5lbENcIiwgem9vbUNEaXNwbGF5LCBcbiAgICAzOTU0LCAyNjU2LCAxMyk7XG5cbmxldCByZWNlbnRyZSA9IG5ldyBCYXNpY1RyYW5zZm9ybSgtMTAyNCwgLTE1MzYsIDEsIDEsIDApO1xubGV0IHNlbnRpbmVsQ29udGFpbmVyTGF5ZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXIocmVjZW50cmUpO1xuc2VudGluZWxDb250YWluZXJMYXllci5zZXQoXCJ6b29tSW5cIiwgc2VudGluZWxMYXllcik7XG5zZW50aW5lbENvbnRhaW5lckxheWVyLnNldChcInpvb21NaWRcIiwgc2VudGluZWxCTGF5ZXIpO1xuc2VudGluZWxDb250YWluZXJMYXllci5zZXQoXCJ6b29tT3V0XCIsIHNlbnRpbmVsU0xheWVyKTtcblxubGV0IGVkaXRDb250YWluZXJMYXllciA9IG5ldyBDb250YWluZXJMYXllcihCYXNpY1RyYW5zZm9ybS51bml0VHJhbnNmb3JtKTtcblxuaW1hZ2VMYXllci5zZXQoXCJjb3VudHlcIiwgY291bnR5SW1hZ2UpO1xuaW1hZ2VMYXllci5zZXQoXCJiYWNrZ3JvdW5kXCIsIGJnSW1hZ2UpO1xuXG5sZXQgbGF5ZXJNYW5hZ2VyID0gbmV3IExheWVyTWFuYWdlcigpO1xuXG5sZXQgZmlyZW1hcExheWVyID0gbGF5ZXJNYW5hZ2VyLmFkZExheWVyKGZpcmVtYXBzLCBcImZpcmVtYXBzXCIpO1xubGV0IGxhbmRtYXJrc0xheWVyID0gbGF5ZXJNYW5hZ2VyLmFkZExheWVyKGxhbmRtYXJrcywgXCJsYW5kbWFya3NcIik7XG5sZXQgd3NjRWFybHlMYXllciA9IGxheWVyTWFuYWdlci5hZGRMYXllcihlYXJseURhdGVzLCBcIndzY19lYXJseVwiKTtcbmxldCB3c2NNaWRMYXllciA9IGxheWVyTWFuYWdlci5hZGRMYXllcihtaWREYXRlcywgXCJ3c2NfbWlkXCIpO1xud3NjTWlkTGF5ZXIuc2V0VmlzaWJsZShmYWxzZSk7XG5sZXQgd3NjTGF0ZUxheWVyID0gbGF5ZXJNYW5hZ2VyLmFkZExheWVyKGxhdGVEYXRlcywgXCJ3c2NfbGF0ZVwiKTtcbndzY0xhdGVMYXllci5zZXRWaXNpYmxlKGZhbHNlKTtcbmxldCB3c2NPdGhlckxheWVyID0gbGF5ZXJNYW5hZ2VyLmFkZExheWVyKG90aGVyRGF0ZXMsIFwid3NjX290aGVyXCIpO1xud3NjT3RoZXJMYXllci5zZXRWaXNpYmxlKGZhbHNlKTtcblxubGV0IGVkaXQgPSB3c2NFYXJseUxheWVyLmdldChcIndzYy0zNTUtMlwiKTtcblxubGV0IGVhcmx5SW5kZXggPSBuZXcgQ29udGFpbmVySW5kZXgod3NjRWFybHlMYXllciwgXCJlYXJseVwiKTtcbmxldCBtaWRJbmRleCA9IG5ldyBDb250YWluZXJJbmRleCh3c2NNaWRMYXllciwgXCJtaWRcIik7XG5sZXQgbGF0ZUluZGV4ID0gbmV3IENvbnRhaW5lckluZGV4KHdzY0xhdGVMYXllciwgXCJsYXRlXCIpO1xubGV0IG90aGVySW5kZXggPSBuZXcgQ29udGFpbmVySW5kZXgod3NjT3RoZXJMYXllciwgXCJvdGhlclwiKTtcblxubGV0IGNvbnRhaW5lckxheWVyTWFuYWdlciA9IG5ldyBDb250YWluZXJMYXllck1hbmFnZXIod3NjRWFybHlMYXllciwgZWRpdENvbnRhaW5lckxheWVyKTtcbmxldCBvdXRsaW5lTGF5ZXIgPSBjb250YWluZXJMYXllck1hbmFnZXIuc2V0U2VsZWN0ZWQoXCJ3c2MtMzU1LTJcIik7XG5cbmltYWdlTGF5ZXIuc2V0KFwid3NjX290aGVyXCIsIHdzY090aGVyTGF5ZXIpO1xuaW1hZ2VMYXllci5zZXQoXCJ3c2NfZWFybHlcIiwgd3NjRWFybHlMYXllcik7XG5pbWFnZUxheWVyLnNldChcIndzY19taWRcIiwgd3NjTWlkTGF5ZXIpO1xuaW1hZ2VMYXllci5zZXQoXCJ3c2NfbGF0ZVwiLCB3c2NMYXRlTGF5ZXIpO1xuXG5pbWFnZUxheWVyLnNldChcImZpcmVtYXBzXCIsIGZpcmVtYXBMYXllcik7XG5cbmltYWdlTGF5ZXIuc2V0KFwiZHVibGluMTYxMFwiLCBkdUltYWdlKTtcbmltYWdlTGF5ZXIuc2V0KFwidGhpbmdtb3RcIiwgdG1JbWFnZSk7XG5pbWFnZUxheWVyLnNldChcImxhbmRtYXJrc1wiLCBsYW5kbWFya3NMYXllcik7XG5cbndzY0Vhcmx5TGF5ZXIuc2V0VG9wKFwid3NjLTMzNFwiKTtcblxuZnVuY3Rpb24gc2hvd01hcChkaXZOYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGNhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChkaXZOYW1lKTtcblxuICAgIGNvbnN0IGluZm8gPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlZGl0X2luZm9cIik7XG5cbiAgICBjb25zdCBsYXllcnMgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsYXllcnNcIik7XG5cbiAgICBsZXQgeCA9IG91dGxpbmVMYXllci54O1xuICAgIGxldCB5ID0gb3V0bGluZUxheWVyLnk7XG5cbiAgICBsZXQgY2FudmFzVHJhbnNmb3JtID0gbmV3IEJhc2ljVHJhbnNmb3JtKHggLSAyMDAsIHkgLSAyMDAsIDAuNSwgMC41LCAwKTtcbiAgICBsZXQgY2FudmFzVmlldyA9IG5ldyBDYW52YXNWaWV3KGNhbnZhc1RyYW5zZm9ybSwgY2FudmFzLmNsaWVudFdpZHRoLCBjYW52YXMuY2xpZW50SGVpZ2h0LCBjYW52YXMpO1xuXG4gICAgY2FudmFzVmlldy5sYXllcnMucHVzaChzZW50aW5lbENvbnRhaW5lckxheWVyKTtcbiAgICBjYW52YXNWaWV3LmxheWVycy5wdXNoKGltYWdlTGF5ZXIpO1xuICAgIGNhbnZhc1ZpZXcubGF5ZXJzLnB1c2goc3RhdGljR3JpZCk7XG4gICAgY2FudmFzVmlldy5sYXllcnMucHVzaChlZGl0Q29udGFpbmVyTGF5ZXIpO1xuXG4gICAgbGV0IHRpbGVDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBzZW50aW5lbENvbnRhaW5lckxheWVyLCBcInZcIik7XG4gICAgbGV0IGJhc2VDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBiZ0ltYWdlLCBcIkJcIik7XG4gICAgbGV0IGNvdW50eUNvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGNvdW50eUltYWdlLCBcIlZcIik7XG4gICAgbGV0IGZpcmVtYXBDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBmaXJlbWFwTGF5ZXIsIFwiYlwiKTtcbiAgICBsZXQgd3NjRWFybHlDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCB3c2NFYXJseUxheWVyLCBcIjFcIik7XG4gICAgbGV0IHdzY0xhdGVDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCB3c2NNaWRMYXllciwgXCIyXCIpO1xuICAgIGxldCB3c2NNaWRDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCB3c2NMYXRlTGF5ZXIsIFwiM1wiKTtcbiAgICBsZXQgd3NjT3RoZXJDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCB3c2NPdGhlckxheWVyLCBcIjRcIik7XG4gICAgbGV0IGxhbmRtYXJrQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgbGFuZG1hcmtzTGF5ZXIsIFwibVwiKTtcbiAgICBsZXQgdG1Db250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCB0bUltYWdlLCBcIm5cIik7XG4gICAgbGV0IGR1Q29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgZHVJbWFnZSwgXCJNXCIpO1xuICAgIGxldCBncmlkQ29udHJvbGxlciA9IG5ldyBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIoY2FudmFzVmlldywgc3RhdGljR3JpZCwgXCJnXCIpO1xuXG4gICAgbGV0IGNvbnRyb2xsZXIgPSBuZXcgVmlld0NvbnRyb2xsZXIoY2FudmFzVmlldywgY2FudmFzLCBjYW52YXNWaWV3KTtcblxuICAgIGxldCBpbWFnZUNvbnRyb2xsZXIgPSBuZXcgSW1hZ2VDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGVkaXQpO1xuXG4gICAgaW1hZ2VDb250cm9sbGVyLnNldExheWVyT3V0bGluZShvdXRsaW5lTGF5ZXIpO1xuXG4gICAgaW1hZ2VDb250cm9sbGVyLnNldEVkaXRJbmZvUGFuZShpbmZvKTtcblxuICAgIGxldCBsYXllckNvbnRyb2xsZXIgPSBuZXcgTGF5ZXJDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGNvbnRhaW5lckxheWVyTWFuYWdlcik7XG5cbiAgICBkcmF3TWFwKGNhbnZhc1ZpZXcpO1xuXG4gICAgbGV0IGxvZ2dlciA9IG5ldyBFbGVtZW50TG9nZ2VyKGluZm8pO1xuXG4gICAgbGV0IGluZGV4Q29udHJvbGxlciA9IG5ldyBJbmRleENvbnRyb2xsZXIoY2FudmFzVmlldywgaW1hZ2VDb250cm9sbGVyKTtcbiAgICBpbmRleENvbnRyb2xsZXIuYWRkSW5kZXhlcihlYXJseUluZGV4KTtcbiAgICBpbmRleENvbnRyb2xsZXIuYWRkSW5kZXhlcihtaWRJbmRleCk7XG4gICAgaW5kZXhDb250cm9sbGVyLmFkZEluZGV4ZXIobGF0ZUluZGV4KTtcbiAgICBpbmRleENvbnRyb2xsZXIuYWRkSW5kZXhlcihvdGhlckluZGV4KTtcblxuICAgIGluZGV4Q29udHJvbGxlci5zZXRNZW51KGxheWVycyk7XG5cbn1cblxuZnVuY3Rpb24gZHJhd01hcChjYW52YXNWaWV3OiBDYW52YXNWaWV3KXtcbiAgICBpZiAoIWNhbnZhc1ZpZXcuZHJhdygpICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkluIHRpbWVvdXRcIik7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgZHJhd01hcChjYW52YXNWaWV3KX0sIDUwMCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzaG93KCl7XG5cdHNob3dNYXAoXCJjYW52YXNcIiwgXCJUeXBlU2NyaXB0XCIpO1xufVxuXG5pZiAoXG4gICAgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiIHx8XG4gICAgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09IFwibG9hZGluZ1wiICYmICFkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZG9TY3JvbGwpXG4pIHtcblx0c2hvdygpO1xufSBlbHNlIHtcblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgc2hvdyk7XG59Il19
