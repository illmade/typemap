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

},{"../geom/point2d":1,"./view":7}],3:[function(require,module,exports){
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

},{"../geom/point2d":1,"./canvasview":2,"./view":7}],5:[function(require,module,exports){
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

},{"./layer":4,"./static":6,"./view":7}],6:[function(require,module,exports){
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

},{"../geom/point2d":1,"./canvasview":2,"./layer":4,"./view":7}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
module.exports=[
    {
    "name": "2-2", "x": -364, "y": -12.5, "zoomX": 0.213, "zoomY": 0.205, "rotation": -0.31, 
    "src": "https://github.com/illmade/typemap/tree/master/dist/images/firemap/maps_145_b_4_(2)_f002r_2[SVC2].png", "visible": true, "opacity": 0.7
    },
    {
    "name": "3", "x": -216, "y": -0.705, "zoomX": 0.2, "zoomY": 0.21, "rotation": -0.51, 
    "src": "https://github.com/illmade/typemap/tree/master/dist/images/firemap/maps_145_b_4_(2)_f003r[SVC2].jpg", "visible": true, "opacity": 0.7
    },
    {
    "name": "4", "x": -74.29, "y": -99.78, "zoomX": 0.222, "zoomY": 0.208, "rotation": -0.285, 
    "src": "https://github.com/illmade/typemap/tree/master/dist/images/firemap/maps_145_b_4_(2)_f004r[SVC2].jpg", "visible": true, "opacity": 0.7
    },
    {
    "name": "5", "x": -366.5, "y": 180.019, "zoomX": 0.215, "zoomY": 0.207, "rotation": -0.21, 
    "src": "https://github.com/illmade/typemap/tree/master/dist/images/firemap/maps_145_b_4_(2)_f005r[SVC2].jpg", "visible": true, "opacity": 0.7
    },
    {
    "name": "6", "x": -206.16, "y": 146, "zoomX": 0.21, "zoomY": 0.208, "rotation": -0.215, 
    "src": "https://github.com/illmade/typemap/tree/master/dist/images/firemap/maps_145_b_4_(2)_f006r[SVC2].jpg", "visible": true, "opacity": 0.7
    },
    {
    "name": "7", "x": -63.3, "y": 100.3776, "zoomX": 0.2125, "zoomY": 0.213, "rotation": -0.23, 
    "src": "https://github.com/illmade/typemap/tree/master/dist/images/firemap/maps_145_b_4_(2)_f007r[SVC2].jpg", "visible": true, "opacity": 0.7
    },
    {
    "name": "8", "x": 78.1, "y": 58.535, "zoomX": 0.207, "zoomY": 0.217, "rotation": -0.25, 
    "src": "https://github.com/illmade/typemap/tree/master/dist/images/firemap/maps_145_b_4_(2)_f008r[SVC2].jpg", "visible": true, "opacity": 0.7
    },
    {
    "name": "9", "x": 219.5, "y": 24, "zoomX": 0.215, "zoomY": 0.2145, "rotation": -0.26,
    "src": "https://github.com/illmade/typemap/tree/master/dist/images/firemap/maps_145_b_4_(2)_f009r[SVC2].jpg", "visible": true, "opacity": 0.7
    },
    {
    "name": "10", "x": 454.21, "y": -1.5, "zoomX": 0.218, "zoomY": 0.214, "rotation": 0.015, 
    "src": "https://github.com/illmade/typemap/tree/master/dist/images/firemap/maps_145_b_4_(2)_f010r_2[SVC2].jpg", "visible": true, "opacity": 0.7
    },
    {
    "name": "11", "x": 621.86, "y": 25.525, "zoomX": 0.213, "zoomY": 0.2115, "rotation": 0.11, 
    "src": "https://github.com/illmade/typemap/tree/master/dist/images/firemap/maps_145_b_4_(2)_f011r[SVC2].jpg", "visible": true, "opacity": 0.7
    }, 
    {
    "name": "12-1", "x": 769.645, "y": 50.265, "zoomX": 0.424, "zoomY": 0.422, "rotation": 0.12, 
    "src": "https://github.com/illmade/typemap/tree/master/dist/images/firemap/maps_145_b_4_(2)_f012r_1[SVC2].jpg", "visible": true, "opacity": 0.7
    },
    {
    "name": "14", "x": -915.6, "y": 557.865, "zoomX": 0.208, "zoomY": 0.208, "rotation": -1.215, 
    "src": "https://github.com/illmade/typemap/tree/master/dist/images/firemap/maps_145_b_4_(2)_f014R[SVC2].jpg", "visible": true, "opacity": 0.7
    },
    {
    "name": "15-2", "x": -717.3, "y": 572, "zoomX": 0.21, "zoomY": 0.206, "rotation": -1.47, 
    "src": "https://github.com/illmade/typemap/tree/master/dist/images/firemap/maps_145_b_4_(2)_f015r_2[SVC2].png", "visible": true, "opacity": 0.7
    },
    {
    "name": "16-2", "x": -92, "y": 336.5, "zoomX": 0.217, "zoomY": 0.21, "rotation": -0.1, 
    "src": "https://github.com/illmade/typemap/tree/master/dist/images/firemap/maps_145_b_4_(2)_f016r_2[SVC2].png", "visible": true, "opacity": 0.7
    },
    {
    "name": "17", "x": 77, "y": 278.5, "zoomX": 0.206, "zoomY": 0.206, "rotation": -0.055, 
    "src": "https://github.com/illmade/typemap/tree/master/dist/images/firemap/maps_145_b_4_(2)_f017R[SVC2].jpg", "visible": true, "opacity": 0.7
    },
    {
    "name": "18", "x": 229, "y": 239.5, "zoomX": 0.208, "zoomY": 0.208, "rotation": 0.07, 
    "src": "https://github.com/illmade/typemap/tree/master/dist/images/firemap/maps_145_b_4_(2)_f018R[SVC2].jpg", "visible": true, "opacity": 0.7
    },
    {
    "name": "19", "x": 71.5, "y": 474, "zoomX": 0.203, "zoomY": 0.208, "rotation": 0.17, 
    "src": "https://github.com/illmade/typemap/tree/master/dist/images/firemap/maps_145_b_4_(2)_f019R[SVC2].jpg", "visible": true, "opacity": 0.7
    },
    {
    "name": "20", "x": 43.5, "y": 640, "zoomX": 0.1, "zoomY": 0.104, "rotation": 0.205, 
    "src": "https://github.com/illmade/typemap/tree/master/dist/images/firemap/maps_145_b_4_(2)_f020R[SVC2].jpg", "visible": true, "opacity": 0.7
    }

]
},{}],9:[function(require,module,exports){
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

},{"./gridindexer":10}],10:[function(require,module,exports){
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

},{"../logging/logger":17}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{"../index/gridindexer":10}],13:[function(require,module,exports){
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

},{"../geom/point2d":1,"../logging/logger":17,"./indexview":14,"./viewcontroller":16}],14:[function(require,module,exports){
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

},{"./canvaslayerview":11}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const canvasview_1 = require("./graphics/canvasview");
const static_1 = require("./graphics/static");
const layer_1 = require("./graphics/layer");
const view_1 = require("./graphics/view");
const grid_1 = require("./graphics/grid");
const layermanager_1 = require("./graphics/layermanager");
const indexcontroller_1 = require("./interface/indexcontroller");
const viewcontroller_1 = require("./interface/viewcontroller");
const imagecontroller_1 = require("./interface/imagecontroller");
const layercontroller_1 = require("./interface/layercontroller");
const containerindex_1 = require("./index/containerindex");
const logger_1 = require("./logging/logger");
const firemaps = require("./imagegroups/firemapsab.json");
let layerState = new view_1.BasicTransform(0, 0, 1, 1, 0);
let imageLayer = new layer_1.ContainerLayer(layerState);
let imageState = new view_1.BasicTransform(-1440, -1440, 0.222, 0.222, 0);
let bgState = new view_1.BasicTransform(-1126, -1086, 1.58, 1.55, 0);
let bgImage = new static_1.StaticImage(bgState, "https://github.com/illmade/typemap/tree/master/dist/images/fmss.jpeg", .6, true);
let gridTransform = view_1.BasicTransform.unitTransform;
// new BasicTransform(0, 0, 1, 1, 0);
let staticGrid = new grid_1.StaticGrid(gridTransform, 0, false, 256, 256);
let editContainerLayer = new layer_1.ContainerLayer(view_1.BasicTransform.unitTransform);
imageLayer.set("background", bgImage);
let layerManager = new layermanager_1.LayerManager();
let firemapLayer = layerManager.addLayer(firemaps, "firemaps");
let edit = firemapLayer.get("3");
let fireIndex = new containerindex_1.ContainerIndex(firemapLayer, "firemaps");
let containerLayerManager = new layermanager_1.ContainerLayerManager(firemapLayer, editContainerLayer);
let outlineLayer = containerLayerManager.setSelected("3");
imageLayer.set("firemaps", firemapLayer);
firemapLayer.setTop("3");
function showMap(divName, name) {
    const canvas = document.getElementById(divName);
    const info = document.getElementById("edit_info");
    const layers = document.getElementById("layers");
    let x = outlineLayer.x;
    let y = outlineLayer.y;
    let canvasTransform = new view_1.BasicTransform(x - 200, y - 200, 0.5, 0.5, 0);
    let canvasView = new canvasview_1.CanvasView(canvasTransform, canvas.clientWidth, canvas.clientHeight, canvas);
    canvasView.layers.push(imageLayer);
    canvasView.layers.push(staticGrid);
    canvasView.layers.push(editContainerLayer);
    let firemapController = new imagecontroller_1.DisplayElementController(canvasView, firemapLayer, "b");
    let gridController = new imagecontroller_1.DisplayElementController(canvasView, staticGrid, "g");
    let controller = new viewcontroller_1.ViewController(canvasView, canvas, canvasView);
    let imageController = new imagecontroller_1.ImageController(canvasView, edit);
    imageController.setLayerOutline(outlineLayer);
    imageController.setEditInfoPane(info);
    let layerController = new layercontroller_1.LayerController(canvasView, containerLayerManager);
    drawMap(canvasView);
    let logger = new logger_1.ElementLogger(info);
    let indexController = new indexcontroller_1.IndexController(canvasView, imageController);
    indexController.addIndexer(fireIndex);
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

},{"./graphics/canvasview":2,"./graphics/grid":3,"./graphics/layer":4,"./graphics/layermanager":5,"./graphics/static":6,"./graphics/view":7,"./imagegroups/firemapsab.json":8,"./index/containerindex":9,"./interface/imagecontroller":12,"./interface/indexcontroller":13,"./interface/layercontroller":15,"./interface/viewcontroller":16,"./logging/logger":17}]},{},[18])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2dyYXBoaWNzL2NhbnZhc3ZpZXcudHMiLCJzcmMvZ3JhcGhpY3MvZ3JpZC50cyIsInNyYy9ncmFwaGljcy9sYXllci50cyIsInNyYy9ncmFwaGljcy9sYXllcm1hbmFnZXIudHMiLCJzcmMvZ3JhcGhpY3Mvc3RhdGljLnRzIiwic3JjL2dyYXBoaWNzL3ZpZXcudHMiLCJzcmMvaW1hZ2Vncm91cHMvZmlyZW1hcHNhYi5qc29uIiwic3JjL2luZGV4L2NvbnRhaW5lcmluZGV4LnRzIiwic3JjL2luZGV4L2dyaWRpbmRleGVyLnRzIiwic3JjL2ludGVyZmFjZS9jYW52YXNsYXllcnZpZXcudHMiLCJzcmMvaW50ZXJmYWNlL2ltYWdlY29udHJvbGxlci50cyIsInNyYy9pbnRlcmZhY2UvaW5kZXhjb250cm9sbGVyLnRzIiwic3JjL2ludGVyZmFjZS9pbmRleHZpZXcudHMiLCJzcmMvaW50ZXJmYWNlL2xheWVyY29udHJvbGxlci50cyIsInNyYy9pbnRlcmZhY2Uvdmlld2NvbnRyb2xsZXIudHMiLCJzcmMvbG9nZ2luZy9sb2dnZXIudHMiLCJzcmMvc2ltcGxlV29ybGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0NBLE1BQWEsT0FBTztJQU9oQixZQUFZLENBQVMsRUFBRSxDQUFTO1FBQzVCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVFLFFBQVE7UUFDSixPQUFPLFVBQVUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztJQUNyRCxDQUFDOztBQWJlLFlBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDekIsV0FB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O1FBRTVFLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNsQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFFbEMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3hDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUUxQyxJQUFJLFVBQVUsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUM1QyxJQUFJLFFBQVEsR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUU1QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzdDLElBQUksS0FBSyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDL0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzVELElBQUksTUFBTSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFFaEQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5QyxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQy9DLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5RCxJQUFJLE9BQU8sR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFFO1FBRW5ELGdEQUFnRDtRQUNoRCxnREFBZ0Q7UUFFaEQsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hCLEdBQUcsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO1FBRTFCLEtBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsSUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUM7WUFDL0IsNEJBQTRCO1lBQzVCLElBQUksS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDNUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsT0FBTyxFQUFFLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQztZQUM1QyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxPQUFPLEVBQUUsT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUFDO1NBQy9DO1FBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBQztZQUUvQixJQUFJLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQzdDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sRUFBRSxLQUFLLEdBQUcsT0FBTyxDQUFDLENBQUM7WUFDN0MsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsT0FBTyxFQUFFLEtBQUssR0FBRyxPQUFPLENBQUMsQ0FBQztZQUU5QyxLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLElBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFDO2dCQUMvQixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ2pELEtBQUssR0FBRyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQzlDLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssR0FBRyxPQUFPLEVBQUUsS0FBSyxHQUFHLE9BQU8sQ0FBQyxDQUFDO2FBQ3ZEO1NBQ0Q7UUFFRCxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDaEIsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWIsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsWUFBWTtRQUNYLE9BQU8sSUFBSSxtQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDRDtBQXhFRCxnQ0F3RUM7Ozs7O0FDaEZELGlDQUFvRjtBQUNwRiw2Q0FBZ0U7QUFDaEUsNkNBQTRDO0FBRTVDLE1BQXNCLFdBQVksU0FBUSxxQkFBYztJQUV2RCxZQUNTLGNBQXlCLEVBQ3pCLE9BQWUsRUFDZixPQUFPLEVBQ1AsT0FBTyxFQUFFLEVBQ1IsbUJBQXFDLDZCQUFnQixDQUFDLFlBQVk7UUFDM0UsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsS0FBSyxFQUFFLGNBQWMsQ0FBQyxLQUFLLEVBQ25GLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQU5sQixtQkFBYyxHQUFkLGNBQWMsQ0FBVztRQUN6QixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQ2YsWUFBTyxHQUFQLE9BQU8sQ0FBQTtRQUNQLFNBQUksR0FBSixJQUFJLENBQUs7UUFDUixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtEO0lBRzVFLENBQUM7SUFFRCxtQkFBbUI7UUFDbEIsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7SUFDOUIsQ0FBQztJQU9ELFNBQVM7UUFDUixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDckIsQ0FBQztJQUVELFVBQVUsQ0FBQyxPQUFnQjtRQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxVQUFVO1FBQ1QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxVQUFVLENBQUMsT0FBZTtRQUN6QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUN4QixDQUFDO0NBRUQ7QUF0Q0Qsa0NBc0NDO0FBRUQsTUFBc0IsU0FBVSxTQUFRLFdBQVc7SUFFckMsVUFBVSxDQUFDLEdBQTZCLEVBQUUsU0FBb0IsRUFBRSxJQUFlO1FBQzNGLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hGLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RFLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFUyxRQUFRLENBQUMsR0FBNkIsRUFBRSxTQUFvQixFQUFFLElBQWU7UUFDekYsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBQyxTQUFTLENBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RFLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN0RixDQUFDO0NBRUo7QUFkRCw4QkFjQztBQUVELE1BQWEsY0FBZSxTQUFRLFdBQVc7SUFLOUMsWUFBWSxjQUF5QixFQUFFLFVBQWtCLENBQUMsRUFBRSxVQUFtQixJQUFJO1FBQ2xGLEtBQUssQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQXVCLENBQUM7UUFDL0MsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVELEdBQUcsQ0FBQyxJQUFZLEVBQUUsS0FBa0I7UUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxHQUFHLENBQUMsSUFBWTtRQUNmLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVELE1BQU07UUFDTCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDM0IsQ0FBQztJQUVELE1BQU0sQ0FBQyxJQUFZO1FBQ2xCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUIsSUFBSSxRQUFRLElBQUksU0FBUyxFQUFDO1lBQ3pCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsVUFBUyxPQUFvQjtnQkFDM0UsSUFBSSxPQUFPLElBQUksUUFBUSxFQUFDO29CQUN2QixPQUFPLEtBQUssQ0FBQztpQkFDYjtxQkFBTTtvQkFDTixPQUFPLElBQUksQ0FBQztpQkFDWjtZQUFBLENBQUMsQ0FBQyxDQUFDO1lBQ0wsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDbEM7YUFBTTtZQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDM0M7SUFDRixDQUFDO0lBRUQsSUFBSSxDQUFDLEdBQTZCLEVBQUUsZUFBMEIsRUFBRSxJQUFtQjtRQUVsRixJQUFJLGNBQWMsR0FBRyx1QkFBZ0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRTVFLElBQUksZUFBZSxHQUFHLElBQUksQ0FBQztRQUUzQixLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDckMsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQUM7Z0JBQ3JCLGVBQWUsR0FBRyxlQUFlLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQzNFO1NBRUQ7UUFFRCxPQUFPLGVBQWUsQ0FBQztJQUN4QixDQUFDO0lBRUQsWUFBWTtRQUNYLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNsQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFbEIsS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3JDLElBQUksY0FBYyxHQUFHLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUMxQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakQsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pELElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakYsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqRjtRQUVELE9BQU8sSUFBSSxtQkFBUyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxHQUFHLElBQUksRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDNUQsQ0FBQztDQUdEO0FBekVELHdDQXlFQzs7Ozs7QUNySUQsbUNBQXNEO0FBQ3RELHFDQUFrRDtBQUNsRCxpQ0FBb0Q7QUFXcEQsU0FBZ0IsVUFBVSxDQUN4QixXQUErQixFQUMvQixJQUFZLEVBQ1osRUFBVTtJQUNYLE9BQU8sV0FBVyxDQUFDLE1BQU0sQ0FBQyxVQUFTLFdBQVc7UUFDN0MsSUFBSSxXQUFXLENBQUMsSUFBSSxJQUFJLFNBQVM7WUFDaEMsT0FBTyxLQUFLLENBQUM7UUFDZCxJQUFJLFdBQVcsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLFdBQVcsQ0FBQyxJQUFJLElBQUksRUFBRSxFQUFFO1lBQ3ZELE9BQU8sSUFBSSxDQUFDO1NBQ1o7YUFBTTtZQUNOLE9BQU8sS0FBSyxDQUFBO1NBQUM7SUFDZCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFaRCxnQ0FZQztBQUVELFNBQWdCLGNBQWMsQ0FDNUIsV0FBK0I7SUFDaEMsT0FBTyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQVMsV0FBVztRQUM3QyxJQUFJLFdBQVcsQ0FBQyxJQUFJLElBQUksU0FBUztZQUNoQyxPQUFPLElBQUksQ0FBQzthQUNSO1lBQ0osT0FBTyxLQUFLLENBQUE7U0FBQztJQUNkLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQVJELHdDQVFDO0FBRUQsTUFBYSxZQUFZO0lBTXhCO1FBRlMsaUJBQVksR0FBVyxTQUFTLENBQUM7UUFHekMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBMEIsQ0FBQztRQUVsRCxJQUFJLFVBQVUsR0FBRyxJQUFJLHNCQUFjLENBQUMscUJBQWMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTNFLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQVY2QyxDQUFDO0lBWS9DLFFBQVEsQ0FBQyxLQUFrQixFQUFFLElBQVk7UUFDeEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVELFFBQVEsQ0FDTixZQUFnQyxFQUNoQyxTQUFpQixFQUNqQixpQkFBNEIscUJBQWMsQ0FBQyxhQUFhO1FBRXpELElBQUksVUFBVSxHQUFHLElBQUksc0JBQWMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTdELEtBQUssSUFBSSxLQUFLLElBQUksWUFBWSxFQUFDO1lBQzlCLElBQUksV0FBVyxHQUFHLElBQUksb0JBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFDakQsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0IsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQ3hDO1FBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRXpDLE9BQU8sVUFBVSxDQUFDO0lBQ25CLENBQUM7SUFFRCxTQUFTO1FBQ1IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxRQUFRLENBQUMsSUFBWTtRQUNwQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hDLENBQUM7Q0FFRDtBQTVDRCxvQ0E0Q0M7QUFFRCxNQUFhLHFCQUFxQjtJQUtqQyxZQUFZLGNBQThCLEVBQy9CLGVBQStCLGNBQWM7UUFBN0MsaUJBQVksR0FBWixZQUFZLENBQWlDO1FBQ3ZELElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxpQkFBaUIsQ0FBQyxjQUE4QjtRQUMvQyxJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztJQUN0QyxDQUFDO0lBRUQsV0FBVyxDQUFDLElBQVk7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFFckIsSUFBSSxLQUFLLEdBQWdCLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVoRSxJQUFJLFNBQVMsR0FBRyxJQUFJLGtCQUFTLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUU3RCxJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFFMUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRTVDLE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxXQUFvQixJQUFJO1FBQ3hDLElBQUksV0FBVyxHQUEwQixFQUFFLENBQUM7UUFDNUMsSUFBSSxRQUFRLEVBQUM7WUFDWixJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksRUFBRSxFQUFDO2dCQUN2QixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2FBQ3pEO1NBQ0Q7YUFBTTtZQUNOLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUM7Z0JBRTdDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUM7b0JBQzVCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzFCO3FCQUNJO29CQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDM0M7YUFDRDtTQUNEO1FBRUQsS0FBSyxJQUFJLE9BQU8sSUFBSSxXQUFXLEVBQUM7WUFDL0IsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFBO1NBQ3hDO0lBQ0YsQ0FBQztDQUVEO0FBbkRELHNEQW1EQzs7Ozs7QUN0SUQsaUNBQXFFO0FBQ3JFLG1DQUFpRDtBQUNqRCw2Q0FBZ0U7QUFDaEUsNkNBQTZEO0FBUTdELE1BQWEsV0FBWSxTQUFRLGlCQUFTO0lBSXpDLFlBQVksY0FBeUIsRUFDbkMsUUFBZ0IsRUFDaEIsT0FBZSxFQUNmLE9BQWdCLEVBQ2hCLG1CQUFxQyw2QkFBZ0IsQ0FBQyxZQUFZO1FBRW5FLEtBQUssQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUVwRSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFFTyxTQUFTLENBQUMsR0FBNkIsRUFBRSxlQUEwQixFQUFFLElBQWU7UUFFM0YsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBQztZQUMxRSxJQUFJLFlBQVksR0FBRyx1QkFBZ0IsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFFM0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRXpDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUMvQixHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlCLEdBQUcsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1lBRXBCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztTQUN2QztJQUVGLENBQUM7SUFFRCxJQUFJLENBQUMsR0FBNkIsRUFBRSxlQUEwQixFQUM1RCxJQUFlO1FBRWhCLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTtZQUN0QyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDM0MsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVELFNBQVMsQ0FBQyxHQUE2QixFQUFFLENBQVMsRUFBRSxDQUFTO1FBQzVELElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTtZQUN0QyxJQUFJLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFDaEMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO1lBQ2pDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3JDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3hCLG9EQUFvRDtZQUNwRCxxREFBcUQ7WUFDckQsc0RBQXNEO1lBQ3RELEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsS0FBSyxFQUFFLENBQUMsR0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1QixPQUFPLElBQUksQ0FBQztTQUNaO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQsWUFBWTtRQUVYLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUM7WUFDckIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUN4QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBRTFDLElBQUksRUFBRSxHQUFHLGdCQUFNLENBQUMsSUFBSSxpQkFBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEQsSUFBSSxFQUFFLEdBQUcsZ0JBQU0sQ0FBQyxJQUFJLGlCQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzVELElBQUksRUFBRSxHQUFHLGdCQUFNLENBQUMsSUFBSSxpQkFBTyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUV4RCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXpDLE9BQU8sSUFBSSxtQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLElBQUksR0FBQyxJQUFJLEVBQUUsSUFBSSxHQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pFO1FBRUQsT0FBTyxJQUFJLG1CQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM1QyxDQUFDO0NBQ0Q7QUE5RUQsa0NBOEVDO0FBRUQsTUFBYSxTQUFVLFNBQVEsaUJBQVM7SUFFdkMsWUFBb0IsU0FBb0IsRUFDdkMsT0FBZSxFQUNmLE9BQWdCLEVBQ2hCLG1CQUFxQyw2QkFBZ0IsQ0FBQyxZQUFZO1FBRWxFLEtBQUssQ0FBQyxJQUFJLHFCQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQzFELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFOMUIsY0FBUyxHQUFULFNBQVMsQ0FBVztJQU94QyxDQUFDO0lBRUQsZUFBZSxDQUFDLFNBQW9CO1FBQ25DLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQzVCLENBQUM7SUFFRCxJQUFJLENBQUMsR0FBNkIsRUFBRSxlQUEwQixFQUM3RCxJQUFlO1FBRWYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxlQUFlLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsZUFBZSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUVyRSxHQUFHLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN4QixHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFbkYsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsWUFBWTtRQUNYLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN2QixDQUFDO0NBRUQ7QUEvQkQsOEJBK0JDOzs7OztBQy9HRCxNQUFhLGNBQWM7SUFJMUIsWUFBbUIsQ0FBUyxFQUFTLENBQVMsRUFDdEMsS0FBYSxFQUFTLEtBQWEsRUFDbkMsUUFBZ0I7UUFGTCxNQUFDLEdBQUQsQ0FBQyxDQUFRO1FBQVMsTUFBQyxHQUFELENBQUMsQ0FBUTtRQUN0QyxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUNuQyxhQUFRLEdBQVIsUUFBUSxDQUFRO0lBQUUsQ0FBQzs7QUFKUiw0QkFBYSxHQUFHLElBQUksY0FBYyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUZ0RSx3Q0FPQztBQUVELFNBQWdCLGdCQUFnQixDQUFDLEtBQWdCLEVBQUUsU0FBb0I7SUFDdEUsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO0lBQzFDLDBEQUEwRDtJQUMxRCxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7SUFDMUMscUZBQXFGO0lBQ3JGLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDbEQsdUdBQXVHO0lBQ3ZHLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQztJQUNuRCxPQUFPLElBQUksY0FBYyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN6RCxDQUFDO0FBVkQsNENBVUM7QUFFRCxTQUFnQixLQUFLLENBQUMsU0FBb0I7SUFDekMsT0FBTyxJQUFJLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEVBQ2pELFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEQsQ0FBQztBQUhELHNCQUdDO0FBRUQsU0FBZ0IsZUFBZSxDQUFDLFVBQXFCO0lBQ3BELE9BQU8sSUFBSSxjQUFjLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsRUFDckQsQ0FBQyxHQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDaEUsQ0FBQztBQUhELDBDQUdDO0FBT0QsTUFBYSxrQkFBbUIsU0FBUSxjQUFjO0lBRXJELFlBQVksQ0FBUyxFQUFFLENBQVMsRUFDdEIsS0FBYSxFQUFXLE1BQWMsRUFDL0MsS0FBYSxFQUFFLEtBQWEsRUFDekIsUUFBZ0I7UUFFbkIsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztRQUozQixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQVcsV0FBTSxHQUFOLE1BQU0sQ0FBUTtJQUtoRCxDQUFDO0NBRUQ7QUFWRCxnREFVQzs7O0FDekREO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3pFQSwrQ0FBNEM7QUFHNUMsTUFBYSxjQUFjO0lBRTFCLFlBQ1csU0FBeUIsRUFDekIsSUFBWSxFQUNaLFVBQW1CLElBQUkseUJBQVcsQ0FBQyxHQUFHLENBQUM7UUFGdkMsY0FBUyxHQUFULFNBQVMsQ0FBZ0I7UUFDekIsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLFlBQU8sR0FBUCxPQUFPLENBQWdDO1FBQ2pELEtBQUssSUFBSSxLQUFLLElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRSxFQUFDO1lBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDaEI7SUFDRixDQUFDO0lBRUQsU0FBUyxDQUFDLENBQVMsRUFBRSxDQUFTO1FBQzdCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsRUFBQztZQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsY0FBYyxDQUFDLENBQUM7WUFDeEMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDcEM7YUFDSTtZQUNKLE9BQU8sRUFBRSxDQUFDO1NBQ1Y7SUFDRixDQUFDO0lBRUQsR0FBRyxDQUFDLFdBQXdCO1FBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQy9CLENBQUM7Q0FFRDtBQXpCRCx3Q0F5QkM7Ozs7O0FDNUJELDhDQUEwRDtBQUcxRCxNQUFNLE9BQU87SUFHWjtRQUNDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQThCLENBQUM7SUFDdkQsQ0FBQztJQUVELEdBQUcsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLEtBQWtCO1FBQzNDLElBQUksV0FBK0IsQ0FBQztRQUNwQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUM7WUFDckMsV0FBVyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDaEQ7YUFBTTtZQUNOLFdBQVcsR0FBRyxFQUFFLENBQUM7U0FDakI7UUFDRCxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRCxHQUFHLENBQUMsQ0FBUyxFQUFFLENBQVM7UUFDdkIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxHQUFHLENBQUMsQ0FBUyxFQUFFLENBQVM7UUFDdkIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFTyxHQUFHLENBQUMsQ0FBUyxFQUFFLENBQVM7UUFDL0IsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNwQixDQUFDO0NBRUQ7QUFFRCxNQUFhLFdBQVc7SUFLdkIsWUFBcUIsU0FBaUIsRUFDM0IsYUFBcUIsU0FBUztRQURwQixjQUFTLEdBQVQsU0FBUyxDQUFRO1FBQzNCLGVBQVUsR0FBVixVQUFVLENBQW9CO1FBSGpDLGNBQVMsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBSWpDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxzQkFBYSxFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVELFNBQVMsQ0FBQyxNQUFjO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxTQUFTLENBQUMsQ0FBUyxFQUFFLENBQVM7UUFDN0IsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzNDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUU1QyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQztRQUVuRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBQztZQUNwQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztTQUN4QzthQUNJO1lBQ0osT0FBTyxFQUFFLENBQUM7U0FDVjtJQUNGLENBQUM7SUFFRCxHQUFHLENBQUMsV0FBd0I7UUFFM0IsSUFBSSxTQUFTLEdBQUcsV0FBVyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRTNDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVwRSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3JELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFckUsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBQztZQUMvQixLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLElBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFDO2dCQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQ3RDO1NBQ0Q7SUFDRixDQUFDO0lBRUQsV0FBVyxDQUFDLFdBQXdCO1FBRW5DLElBQUksU0FBUyxHQUFHLFdBQVcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUUzQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3BELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFcEUsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXJFLElBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQTtRQUV2QixLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLElBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFDO1lBQy9CLEtBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxF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LENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRXRDLGVBQWUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFFcEMsQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFDLFVBQXNCO0lBQ25DLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUc7UUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixVQUFVLENBQUMsY0FBWSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUEsQ0FBQSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDckQ7QUFDTCxDQUFDO0FBRUQsU0FBUyxJQUFJO0lBQ1QsT0FBTyxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRUQsSUFDSSxRQUFRLENBQUMsVUFBVSxLQUFLLFVBQVU7SUFDbEMsQ0FBQyxRQUFRLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQzNFO0lBQ0UsSUFBSSxFQUFFLENBQUM7Q0FDVjtLQUFNO0lBQ0gsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ3ZEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXG5leHBvcnQgY2xhc3MgUG9pbnQyRCB7XG4gICAgc3RhdGljIHJlYWRvbmx5IHplcm8gPSBuZXcgUG9pbnQyRCgwLCAwKTtcbiAgICBzdGF0aWMgcmVhZG9ubHkgb25lID0gbmV3IFBvaW50MkQoMSwgMSk7XG5cbiAgICByZWFkb25seSB4OiBudW1iZXI7XG4gICAgcmVhZG9ubHkgeTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcblx0fVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiUG9pbnQyRChcIiArIHRoaXMueCArIFwiLCBcIiArIHRoaXMueSArIFwiKVwiO1xuICAgIH1cblxufVxuXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlKFxuICBwb2ludDogUG9pbnQyRCwgXG4gIGFuZ2xlOiBudW1iZXIsIFxuICBhYm91dDogUG9pbnQyRCA9IG5ldyBQb2ludDJEKDAsMClcbik6IFBvaW50MkQge1xuXG4gICAgbGV0IHMgPSBNYXRoLnNpbihhbmdsZSk7XG4gICAgbGV0IGMgPSBNYXRoLmNvcyhhbmdsZSk7XG5cbiAgICBsZXQgcHggPSBwb2ludC54IC0gYWJvdXQueDtcbiAgICBsZXQgcHkgPSBwb2ludC55IC0gYWJvdXQueTtcblxuICAgIGxldCB4bmV3ID0gcHggKiBjICsgcHkgKiBzO1xuICAgIGxldCB5bmV3ID0gcHkgKiBjIC0gcHggKiBzO1xuXG4gICAgcmV0dXJuIG5ldyBQb2ludDJEKHhuZXcgKyBhYm91dC54LCB5bmV3ICsgYWJvdXQueSk7XG59XG5cbmV4cG9ydCBjbGFzcyBEaW1lbnNpb24ge1xuXG4gICAgY29uc3RydWN0b3IocHVibGljIHg6IG51bWJlciwgcHVibGljIHk6IG51bWJlciwgcHVibGljIHc6IG51bWJlciwgcHVibGljIGg6IG51bWJlcil7fVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiRGltZW5zaW9uKFwiICsgdGhpcy54ICsgXCIsIFwiICsgdGhpcy55ICsgXCIsIFwiICsgdGhpcy53ICsgXCIsIFwiICsgdGhpcy5oICsgXCIpXCI7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcbmltcG9ydCB7IENhbnZhc0xheWVyIH0gZnJvbSBcIi4vbGF5ZXJcIjtcbmltcG9ydCB7IFxuXHRpbnZlcnRUcmFuc2Zvcm0sIFxuXHRWaWV3VHJhbnNmb3JtLCBcblx0QmFzaWNWaWV3VHJhbnNmb3JtLCBcblx0VHJhbnNmb3JtLCBcblx0QmFzaWNUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlzcGxheUVsZW1lbnQgZXh0ZW5kcyBUcmFuc2Zvcm0ge1xuXHRpc1Zpc2libGUoKTogYm9vbGVhbjtcblx0c2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdm9pZDtcblx0Z2V0T3BhY2l0eSgpOiBudW1iZXI7XG5cdHNldE9wYWNpdHkob3BhY2l0eTogbnVtYmVyKTogdm9pZDtcblx0Z2V0Wm9vbURpc3BsYXlSYW5nZSgpOiBab29tRGlzcGxheVJhbmdlO1xufVxuXG5leHBvcnQgY2xhc3MgWm9vbURpc3BsYXlSYW5nZSB7XG5cbiAgICBzdGF0aWMgcmVhZG9ubHkgQWxsWm9vbVJhbmdlID0gbmV3IFpvb21EaXNwbGF5UmFuZ2UoLTEsIC0xKTtcblxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgbWluWm9vbTogbnVtYmVyLCBwdWJsaWMgbWF4Wm9vbTogbnVtYmVyKXt9XG5cblx0d2l0aGluUmFuZ2Uoem9vbTogbnVtYmVyKTogQm9vbGVhbiB7XG5cdFx0cmV0dXJuICgoem9vbSA+PSB0aGlzLm1pblpvb20gfHwgdGhpcy5taW5ab29tID09IC0xKSAmJiBcblx0XHRcdCh6b29tIDw9IHRoaXMubWF4Wm9vbSB8fCB0aGlzLm1heFpvb20gPT0gLTEpKTtcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgQ2FudmFzVmlldyBleHRlbmRzIEJhc2ljVmlld1RyYW5zZm9ybSB7XG5cblx0bGF5ZXJzOiBBcnJheTxDYW52YXNMYXllcj4gPSBbXTtcblx0Y3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0bG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdFx0d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIFxuXHRcdHJlYWRvbmx5IGNhbnZhc0VsZW1lbnQ6IEhUTUxDYW52YXNFbGVtZW50KXtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLngsIGxvY2FsVHJhbnNmb3JtLnksIHdpZHRoLCBoZWlnaHQsIFxuXHRcdFx0bG9jYWxUcmFuc2Zvcm0uem9vbVgsIGxvY2FsVHJhbnNmb3JtLnpvb21ZLCBcblx0XHRcdGxvY2FsVHJhbnNmb3JtLnJvdGF0aW9uKTtcblxuXHRcdHRoaXMuaW5pdENhbnZhcygpO1xuXG5cdFx0dGhpcy5jdHggPSBjYW52YXNFbGVtZW50LmdldENvbnRleHQoXCIyZFwiKTtcblx0fVxuXG5cdHpvb21BYm91dCh4OiBudW1iZXIsIHk6IG51bWJlciwgem9vbUJ5OiBudW1iZXIpe1xuXG4gICAgICAgIHRoaXMuem9vbVggPSB0aGlzLnpvb21YICogem9vbUJ5O1xuICAgICAgICB0aGlzLnpvb21ZID0gdGhpcy56b29tWSAqIHpvb21CeTtcblxuICAgICAgICBsZXQgcmVsYXRpdmVYID0geCAqIHpvb21CeSAtIHg7XG4gICAgICAgIGxldCByZWxhdGl2ZVkgPSB5ICogem9vbUJ5IC0geTtcblxuICAgICAgICBsZXQgd29ybGRYID0gcmVsYXRpdmVYIC8gdGhpcy56b29tWDtcbiAgICAgICAgbGV0IHdvcmxkWSA9IHJlbGF0aXZlWSAvIHRoaXMuem9vbVk7XG5cbiAgICAgICAgdGhpcy54ID0gdGhpcy54ICsgd29ybGRYO1xuICAgICAgICB0aGlzLnkgPSB0aGlzLnkgKyB3b3JsZFk7XG5cblx0fVxuXG5cdGdldEJhc2VQb2ludChjb29yZDogUG9pbnQyRCk6IFBvaW50MkQge1xuXHRcdHJldHVybiBuZXcgUG9pbnQyRChcblx0XHRcdHRoaXMueCArIGNvb3JkLnggLyB0aGlzLnpvb21YLCBcblx0XHRcdHRoaXMueSArIGNvb3JkLnkgLyB0aGlzLnpvb21ZKTtcblx0fVxuXG5cdGRyYXcoKTogYm9vbGVhbiB7XG5cdFx0bGV0IHRyYW5zZm9ybSA9IGludmVydFRyYW5zZm9ybSh0aGlzKTtcblxuXHRcdHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwiZ3JleVwiO1xuXHRcdHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuXHRcdHZhciBkcmF3aW5nQ29tcGxldGUgPSB0cnVlO1xuXG5cdFx0Zm9yIChsZXQgbGF5ZXIgb2YgdGhpcy5sYXllcnMpe1xuXHRcdFx0aWYgKGxheWVyLmlzVmlzaWJsZSgpKXtcblx0XHRcdFx0ZHJhd2luZ0NvbXBsZXRlID0gZHJhd2luZ0NvbXBsZXRlICYmIGxheWVyLmRyYXcodGhpcy5jdHgsIEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm0sIHRoaXMpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fVxuXG5cdFx0dGhpcy5kcmF3Q2VudHJlKHRoaXMuY3R4KTtcblx0XHR0aGlzLnNob3dJbmZvKHRoaXMuY3R4KTtcblxuXHRcdHJldHVybiBkcmF3aW5nQ29tcGxldGU7XG5cdH1cblxuXHRkcmF3Q2VudHJlKGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCl7XG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIGNvbnRleHQuZ2xvYmFsQWxwaGEgPSAwLjM7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLndpZHRoLzIsIDYvMTYqdGhpcy5oZWlnaHQpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyh0aGlzLndpZHRoLzIsIDEwLzE2KnRoaXMuaGVpZ2h0KTtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8oNy8xNip0aGlzLndpZHRoLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oOS8xNip0aGlzLndpZHRoLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcbiAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XG4gICAgfVxuXG4gICAgc2hvd0luZm8oY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKXtcbiAgICBcdGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuICAgIFx0Y29udGV4dC5maWxsVGV4dChcInpvb206IFwiICsgdGhpcy56b29tWCwgMTAsIDEwKTtcbiAgICBcdGNvbnRleHQuZmlsbCgpO1xuICAgIH1cblxuXHRwcml2YXRlIGluaXRDYW52YXMoKXtcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5jYW52YXNFbGVtZW50LmNsaWVudFdpZHRoO1xuICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5jYW52YXNFbGVtZW50LmNsaWVudEhlaWdodDtcblxuICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LmhlaWdodCA9IGhlaWdodDtcblx0fVxuXG59IiwiaW1wb3J0IHsgRHJhd0xheWVyIH0gZnJvbSBcIi4vbGF5ZXJcIjtcbmltcG9ydCB7IFRyYW5zZm9ybSwgVmlld1RyYW5zZm9ybSwgY29tYmluZVRyYW5zZm9ybSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IERpbWVuc2lvbiB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuLyoqXG4qIFdlIGRvbid0IHdhbnQgdG8gZHJhdyBhIGdyaWQgaW50byBhIHRyYW5zZm9ybWVkIGNhbnZhcyBhcyB0aGlzIGdpdmVzIHVzIGdyaWQgbGluZXMgdGhhdCBhcmUgdG9vXG50aGljayBvciB0b28gdGhpblxuKi9cbmV4cG9ydCBjbGFzcyBTdGF0aWNHcmlkIGV4dGVuZHMgRHJhd0xheWVyIHtcblxuXHR6b29tV2lkdGg6IG51bWJlcjtcblx0em9vbUhlaWdodDogbnVtYmVyO1xuXG5cdGNvbnN0cnVjdG9yKGxvY2FsVHJhbnNmb3JtOiBUcmFuc2Zvcm0sIHpvb21MZXZlbDogbnVtYmVyLCB2aXNpYmxlOiBib29sZWFuLFxuXHRcdHJlYWRvbmx5IGdyaWRXaWR0aDogbnVtYmVyID0gMjU2LCByZWFkb25seSBncmlkSGVpZ2h0OiBudW1iZXIgPSAyNTYpe1xuXG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0sIDEsIHZpc2libGUpO1xuXG5cdFx0bGV0IHpvb20gPSBNYXRoLnBvdygyLCB6b29tTGV2ZWwpO1xuXHRcdHRoaXMuem9vbVdpZHRoID0gZ3JpZFdpZHRoIC8gem9vbTtcblx0XHR0aGlzLnpvb21IZWlnaHQgPSBncmlkSGVpZ2h0IC8gem9vbTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHRyYW5zZm9ybTogVHJhbnNmb3JtLCB2aWV3OiBWaWV3VHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0XHRsZXQgb2Zmc2V0WCA9IHZpZXcueCAqIHZpZXcuem9vbVg7XG5cdFx0bGV0IG9mZnNldFkgPSB2aWV3LnkgKiB2aWV3Lnpvb21ZO1xuXG5cdFx0bGV0IHZpZXdXaWR0aCA9IHZpZXcud2lkdGggLyB2aWV3Lnpvb21YO1xuXHRcdGxldCB2aWV3SGVpZ2h0ID0gdmlldy5oZWlnaHQgLyB2aWV3Lnpvb21ZO1xuXG5cdFx0bGV0IGdyaWRBY3Jvc3MgPSB2aWV3V2lkdGggLyB0aGlzLnpvb21XaWR0aDtcblx0XHRsZXQgZ3JpZEhpZ2ggPSB2aWV3SGVpZ2h0IC8gdGhpcy56b29tSGVpZ2h0O1xuXG5cdFx0bGV0IHhNaW4gPSBNYXRoLmZsb29yKHZpZXcueC90aGlzLnpvb21XaWR0aCk7XG5cdFx0bGV0IHhMZWZ0ID0geE1pbiAqIHRoaXMuem9vbVdpZHRoICogdmlldy56b29tWDtcblx0XHRsZXQgeE1heCA9IE1hdGguY2VpbCgodmlldy54ICsgdmlld1dpZHRoKSAvIHRoaXMuem9vbVdpZHRoKTtcblx0XHRsZXQgeFJpZ2h0ID0geE1heCAqIHRoaXMuem9vbVdpZHRoICogdmlldy56b29tWDtcblxuXHRcdGxldCB5TWluID0gTWF0aC5mbG9vcih2aWV3LnkvdGhpcy56b29tSGVpZ2h0KTtcblx0XHRsZXQgeVRvcCA9IHlNaW4gKiB0aGlzLnpvb21IZWlnaHQgKiB2aWV3Lnpvb21YO1xuXHRcdGxldCB5TWF4ID0gTWF0aC5jZWlsKCh2aWV3LnkgKyB2aWV3SGVpZ2h0KSAvIHRoaXMuem9vbUhlaWdodCk7XG5cdFx0bGV0IHlCb3R0b20gPSB5TWF4ICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWCA7XG5cblx0XHQvL2NvbnNvbGUubG9nKFwieE1pbiBcIiArIHhNaW4gKyBcIiB4TWF4IFwiICsgeE1heCk7XG5cdFx0Ly9jb25zb2xlLmxvZyhcInlNaW4gXCIgKyB5TWluICsgXCIgeU1heCBcIiArIHlNYXgpO1xuXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcblxuXHRcdGZvciAodmFyIHggPSB4TWluOyB4PD14TWF4OyB4Kyspe1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImF0IFwiICsgbWluWCk7XG5cdFx0XHRsZXQgeE1vdmUgPSB4ICogdGhpcy56b29tV2lkdGggKiB2aWV3Lnpvb21YO1xuXHRcdFx0Y3R4Lm1vdmVUbyh4TW92ZSAtIG9mZnNldFgsIHlUb3AgLSBvZmZzZXRZKTtcblx0XHRcdGN0eC5saW5lVG8oeE1vdmUgLSBvZmZzZXRYLCB5Qm90dG9tIC0gb2Zmc2V0WSk7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgeSA9IHlNaW47IHk8PXlNYXg7IHkrKyl7XG5cblx0XHRcdGxldCB5TW92ZSA9IHkgKiB0aGlzLnpvb21IZWlnaHQgKiB2aWV3Lnpvb21ZO1xuXHRcdFx0Y3R4Lm1vdmVUbyh4TGVmdCAtIG9mZnNldFgsIHlNb3ZlIC0gb2Zmc2V0WSk7XG5cdFx0XHRjdHgubGluZVRvKHhSaWdodCAtIG9mZnNldFgsIHlNb3ZlIC0gb2Zmc2V0WSk7XG5cblx0XHRcdGZvciAodmFyIHggPSB4TWluOyB4PD14TWF4OyB4Kyspe1xuXHRcdFx0XHRsZXQgeE1vdmUgPSAoeC0uNSkgKiB0aGlzLnpvb21XaWR0aCAqIHZpZXcuem9vbVg7XG5cdFx0XHRcdHlNb3ZlID0gKHktLjUpICogdGhpcy56b29tSGVpZ2h0ICogdmlldy56b29tWTtcblx0XHRcdFx0bGV0IHRleHQgPSBcIlwiICsgKHgtMSkgKyBcIiwgXCIgKyAoeS0xKTtcblx0XHRcdFx0Y3R4LnN0cm9rZVRleHQodGV4dCwgeE1vdmUgLSBvZmZzZXRYLCB5TW92ZSAtIG9mZnNldFkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRnZXREaW1lbnNpb24oKTogRGltZW5zaW9uIHtcblx0XHRyZXR1cm4gbmV3IERpbWVuc2lvbigwLCAwLCAwLCAwKTtcblx0fVxufSIsImltcG9ydCB7IFRyYW5zZm9ybSwgQmFzaWNUcmFuc2Zvcm0sIFZpZXdUcmFuc2Zvcm0sIGNvbWJpbmVUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBEaXNwbGF5RWxlbWVudCwgWm9vbURpc3BsYXlSYW5nZSB9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IERpbWVuc2lvbiB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENhbnZhc0xheWVyIGV4dGVuZHMgQmFzaWNUcmFuc2Zvcm0gaW1wbGVtZW50cyBEaXNwbGF5RWxlbWVudCB7XG5cblx0Y29uc3RydWN0b3IoXG5cdCAgcHVibGljIGxvY2FsVHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHQgIHB1YmxpYyBvcGFjaXR5OiBudW1iZXIsIFxuXHQgIHB1YmxpYyB2aXNpYmxlLFxuXHQgIHB1YmxpYyBuYW1lID0gXCJcIixcblx0ICBwcml2YXRlIHpvb21EaXNwbGF5UmFuZ2U6IFpvb21EaXNwbGF5UmFuZ2UgPSBab29tRGlzcGxheVJhbmdlLkFsbFpvb21SYW5nZSl7XG5cdFx0c3VwZXIobG9jYWxUcmFuc2Zvcm0ueCwgbG9jYWxUcmFuc2Zvcm0ueSwgbG9jYWxUcmFuc2Zvcm0uem9vbVgsIGxvY2FsVHJhbnNmb3JtLnpvb21ZLCBcblx0XHRcdGxvY2FsVHJhbnNmb3JtLnJvdGF0aW9uKTtcblx0fVxuXG5cdGdldFpvb21EaXNwbGF5UmFuZ2UoKTogWm9vbURpc3BsYXlSYW5nZSB7XG5cdFx0cmV0dXJuIHRoaXMuem9vbURpc3BsYXlSYW5nZTtcblx0fVxuXG5cdGFic3RyYWN0IGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHBhcmVudFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0XHR2aWV3OiBWaWV3VHJhbnNmb3JtKTogYm9vbGVhbjtcblxuXHRhYnN0cmFjdCBnZXREaW1lbnNpb24oKTogRGltZW5zaW9uO1xuXG5cdGlzVmlzaWJsZSgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy52aXNpYmxlO1xuXHR9XG5cblx0c2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdm9pZCB7XG5cdFx0Y29uc29sZS5sb2coXCJzZXR0aW5nIHZpc2liaWxpdHk6IFwiICsgdmlzaWJsZSk7XG5cdFx0dGhpcy52aXNpYmxlID0gdmlzaWJsZTtcblx0fVxuXG5cdGdldE9wYWNpdHkoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5vcGFjaXR5O1xuXHR9XG5cblx0c2V0T3BhY2l0eShvcGFjaXR5OiBudW1iZXIpOiB2b2lkIHtcblx0XHR0aGlzLm9wYWNpdHkgPSBvcGFjaXR5O1xuXHR9XG5cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIERyYXdMYXllciBleHRlbmRzIENhbnZhc0xheWVyIHtcblxuICAgIHByb3RlY3RlZCBwcmVwYXJlQ3R4KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB0cmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVHJhbnNmb3JtKTogdm9pZCB7XG5cdFx0Y3R4LnRyYW5zbGF0ZSgodHJhbnNmb3JtLnggLSB2aWV3LngpICogdmlldy56b29tWCwgKHRyYW5zZm9ybS55IC0gdmlldy55KSAqIHZpZXcuem9vbVkpO1xuXHRcdGN0eC5zY2FsZSh0cmFuc2Zvcm0uem9vbVggKiB2aWV3Lnpvb21YLCB0cmFuc2Zvcm0uem9vbVkgKiB2aWV3Lnpvb21ZKTtcblx0XHRjdHgucm90YXRlKHRyYW5zZm9ybS5yb3RhdGlvbik7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNsZWFuQ3R4KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB0cmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVHJhbnNmb3JtKTogdm9pZCB7XHRcblx0XHRjdHgucm90YXRlKC10cmFuc2Zvcm0ucm90YXRpb24pO1xuXHRcdGN0eC5zY2FsZSgxL3RyYW5zZm9ybS56b29tWC92aWV3Lnpvb21YLCAxL3RyYW5zZm9ybS56b29tWS92aWV3Lnpvb21ZKTtcblx0XHRjdHgudHJhbnNsYXRlKC0odHJhbnNmb3JtLnggLXZpZXcueCkgKnZpZXcuem9vbVgsIC0odHJhbnNmb3JtLnkgLSB2aWV3LnkpICogdmlldy56b29tWSk7XG4gICAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBDb250YWluZXJMYXllciBleHRlbmRzIENhbnZhc0xheWVyIHtcblxuXHRsYXllck1hcDogTWFwPHN0cmluZywgQ2FudmFzTGF5ZXI+O1xuXHRkaXNwbGF5TGF5ZXJzOiBBcnJheTxDYW52YXNMYXllcj47XG5cblx0Y29uc3RydWN0b3IobG9jYWxUcmFuc2Zvcm06IFRyYW5zZm9ybSwgb3BhY2l0eTogbnVtYmVyID0gMSwgdmlzaWJsZTogYm9vbGVhbiA9IHRydWUpIHtcblx0XHRzdXBlcihsb2NhbFRyYW5zZm9ybSwgb3BhY2l0eSwgdmlzaWJsZSk7XG5cdFx0dGhpcy5sYXllck1hcCA9IG5ldyBNYXA8c3RyaW5nLCBDYW52YXNMYXllcj4oKTtcblx0XHR0aGlzLmRpc3BsYXlMYXllcnMgPSBbXTtcblx0fVxuXG5cdHNldChuYW1lOiBzdHJpbmcsIGxheWVyOiBDYW52YXNMYXllcil7XG5cdFx0dGhpcy5sYXllck1hcC5zZXQobmFtZSwgbGF5ZXIpO1xuXHRcdHRoaXMuZGlzcGxheUxheWVycy5wdXNoKGxheWVyKTtcblx0fVxuXG5cdGdldChuYW1lOiBzdHJpbmcpOiBDYW52YXNMYXllciB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXAuZ2V0KG5hbWUpO1xuXHR9XG5cblx0bGF5ZXJzKCk6IEFycmF5PENhbnZhc0xheWVyPiB7XG5cdFx0cmV0dXJuIHRoaXMuZGlzcGxheUxheWVycztcblx0fVxuXG5cdHNldFRvcChuYW1lOiBzdHJpbmcpIHtcblx0XHRsZXQgdG9wTGF5ZXIgPSB0aGlzLmdldChuYW1lKTtcblx0XHRpZiAodG9wTGF5ZXIgIT0gdW5kZWZpbmVkKXtcblx0XHRcdHRoaXMuZGlzcGxheUxheWVycyA9IHRoaXMuZGlzcGxheUxheWVycy5maWx0ZXIoZnVuY3Rpb24oZWxlbWVudDogQ2FudmFzTGF5ZXIpeyBcblx0XHRcdFx0aWYgKGVsZW1lbnQgPT0gdG9wTGF5ZXIpe1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fX0pO1xuXHRcdFx0dGhpcy5kaXNwbGF5TGF5ZXJzLnB1c2godG9wTGF5ZXIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcInRvcCBsYXllciB1bmRlZmluZWQgXCIgKyBuYW1lKTtcblx0XHR9XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVmlld1RyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0bGV0IGxheWVyVHJhbnNmb3JtID0gY29tYmluZVRyYW5zZm9ybSh0aGlzLmxvY2FsVHJhbnNmb3JtLCBwYXJlbnRUcmFuc2Zvcm0pO1xuXG5cdFx0dmFyIGRyYXdpbmdDb21wbGV0ZSA9IHRydWU7XG5cblx0XHRmb3IgKGxldCBsYXllciBvZiB0aGlzLmRpc3BsYXlMYXllcnMpIHtcblx0XHRcdGlmIChsYXllci5pc1Zpc2libGUoKSl7XG5cdFx0XHRcdGRyYXdpbmdDb21wbGV0ZSA9IGRyYXdpbmdDb21wbGV0ZSAmJiBsYXllci5kcmF3KGN0eCwgbGF5ZXJUcmFuc2Zvcm0sIHZpZXcpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRyYXdpbmdDb21wbGV0ZTtcblx0fVxuXG5cdGdldERpbWVuc2lvbigpOiBEaW1lbnNpb24ge1xuXHRcdHZhciB4TWluID0gdGhpcy54O1xuXHRcdHZhciB5TWluID0gdGhpcy55O1xuXHRcdHZhciB4TWF4ID0gdGhpcy54O1xuXHRcdHZhciB5TWF4ID0gdGhpcy55O1xuXG5cdFx0Zm9yIChsZXQgbGF5ZXIgb2YgdGhpcy5kaXNwbGF5TGF5ZXJzKSB7XG5cdFx0XHRsZXQgbGF5ZXJEaW1lbnNpb24gPSBsYXllci5nZXREaW1lbnNpb24oKTtcblx0XHRcdHhNaW4gPSBNYXRoLm1pbih4TWluLCB0aGlzLnggKyBsYXllckRpbWVuc2lvbi54KTtcblx0XHRcdHlNaW4gPSBNYXRoLm1pbih5TWluLCB0aGlzLnkgKyBsYXllckRpbWVuc2lvbi55KTtcblx0XHRcdHhNYXggPSBNYXRoLm1heCh4TWF4LCB0aGlzLnggKyBsYXllckRpbWVuc2lvbi54ICsgdGhpcy56b29tWCAqIGxheWVyRGltZW5zaW9uLncpO1xuXHRcdFx0eU1heCA9IE1hdGgubWF4KHlNYXgsIHRoaXMueSArIGxheWVyRGltZW5zaW9uLnkgKyB0aGlzLnpvb21ZICogbGF5ZXJEaW1lbnNpb24uaCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBEaW1lbnNpb24oeE1pbiwgeU1pbiwgeE1heCAtIHhNaW4sIHlNYXggLSB5TWluKTtcblx0fVxuXG5cbn0iLCJpbXBvcnQgeyBDYW52YXNMYXllciwgQ29udGFpbmVyTGF5ZXIgfSBmcm9tIFwiLi9sYXllclwiO1xuaW1wb3J0IHsgU3RhdGljSW1hZ2UsIFJlY3RMYXllciB9IGZyb20gXCIuL3N0YXRpY1wiO1xuaW1wb3J0IHsgVHJhbnNmb3JtICwgQmFzaWNUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQge0NhbnZhc1ZpZXcsIERpc3BsYXlFbGVtZW50fSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW1hZ2VTdHJ1Y3QgZXh0ZW5kcyBUcmFuc2Zvcm0ge1xuXHRvcGFjaXR5OiBudW1iZXI7XG5cdHZpc2libGU6IGJvb2xlYW47XG5cdHNyYzogc3RyaW5nO1xuXHRuYW1lOiBzdHJpbmc7XG5cdGRhdGU6IG51bWJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRhdGVGaWx0ZXIoXG4gIGltYWdlU3RydWN0OiBBcnJheTxJbWFnZVN0cnVjdD4sIFxuICBmcm9tOiBudW1iZXIsIFxuICB0bzogbnVtYmVyKTogQXJyYXk8SW1hZ2VTdHJ1Y3Q+e1xuXHRyZXR1cm4gaW1hZ2VTdHJ1Y3QuZmlsdGVyKGZ1bmN0aW9uKGltYWdlU3RydWN0KXsgXG5cdFx0aWYgKGltYWdlU3RydWN0LmRhdGUgPT0gdW5kZWZpbmVkKVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdGlmIChpbWFnZVN0cnVjdC5kYXRlID49IGZyb20gJiYgaW1hZ2VTdHJ1Y3QuZGF0ZSA8PSB0bykge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZX1cblx0XHR9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRhdGVsZXNzRmlsdGVyKFxuICBpbWFnZVN0cnVjdDogQXJyYXk8SW1hZ2VTdHJ1Y3Q+KTogQXJyYXk8SW1hZ2VTdHJ1Y3Q+e1xuXHRyZXR1cm4gaW1hZ2VTdHJ1Y3QuZmlsdGVyKGZ1bmN0aW9uKGltYWdlU3RydWN0KXsgXG5cdFx0aWYgKGltYWdlU3RydWN0LmRhdGUgPT0gdW5kZWZpbmVkKVxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0ZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2V9XG5cdFx0fSk7XG59XG5cbmV4cG9ydCBjbGFzcyBMYXllck1hbmFnZXIge1xuXG5cdHByaXZhdGUgbGF5ZXJNYXA6IE1hcDxzdHJpbmcsIENvbnRhaW5lckxheWVyPjs7XG5cblx0cmVhZG9ubHkgZGVmYXVsdExheWVyOiBzdHJpbmcgPSBcImRlZmF1bHRcIjtcblxuXHRjb25zdHJ1Y3Rvcigpe1xuXHRcdHRoaXMubGF5ZXJNYXAgPSBuZXcgTWFwPHN0cmluZywgQ29udGFpbmVyTGF5ZXI+KCk7XG5cblx0XHRsZXQgaW1hZ2VMYXllciA9IG5ldyBDb250YWluZXJMYXllcihCYXNpY1RyYW5zZm9ybS51bml0VHJhbnNmb3JtLCAxLCB0cnVlKTtcdFxuXG5cdFx0dGhpcy5sYXllck1hcC5zZXQodGhpcy5kZWZhdWx0TGF5ZXIsIGltYWdlTGF5ZXIpO1xuXHR9XG5cblx0YWRkSW1hZ2UoaW1hZ2U6IFN0YXRpY0ltYWdlLCBuYW1lOiBzdHJpbmcpe1xuXHRcdHRoaXMubGF5ZXJNYXAuZ2V0KHRoaXMuZGVmYXVsdExheWVyKS5zZXQobmFtZSwgaW1hZ2UpO1xuXHR9XG5cblx0YWRkTGF5ZXIoXG5cdCAgaW1hZ2VEZXRhaWxzOiBBcnJheTxJbWFnZVN0cnVjdD4sIFxuXHQgIGxheWVyTmFtZTogc3RyaW5nLCBcblx0ICBsYXllclRyYW5zZm9ybTogVHJhbnNmb3JtID0gQmFzaWNUcmFuc2Zvcm0udW5pdFRyYW5zZm9ybSk6IENvbnRhaW5lckxheWVyIHtcblxuXHRcdGxldCBpbWFnZUxheWVyID0gbmV3IENvbnRhaW5lckxheWVyKGxheWVyVHJhbnNmb3JtLCAxLCB0cnVlKTtcdFxuXG5cdFx0Zm9yICh2YXIgaW1hZ2Ugb2YgaW1hZ2VEZXRhaWxzKXtcblx0XHRcdGxldCBzdGF0aWNJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZShpbWFnZSwgaW1hZ2Uuc3JjLCBcblx0XHRcdFx0aW1hZ2Uub3BhY2l0eSwgaW1hZ2UudmlzaWJsZSk7XG5cdFx0XHRpbWFnZUxheWVyLnNldChpbWFnZS5uYW1lLCBzdGF0aWNJbWFnZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5sYXllck1hcC5zZXQobGF5ZXJOYW1lLCBpbWFnZUxheWVyKTtcblxuXHRcdHJldHVybiBpbWFnZUxheWVyO1xuXHR9XG5cblx0Z2V0TGF5ZXJzKCk6IE1hcDxzdHJpbmcsIENvbnRhaW5lckxheWVyPiB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXA7XG5cdH1cblxuXHRnZXRMYXllcihuYW1lOiBzdHJpbmcpOiBDb250YWluZXJMYXllciB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXAuZ2V0KG5hbWUpO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNsYXNzIENvbnRhaW5lckxheWVyTWFuYWdlciB7XG5cblx0cHJpdmF0ZSBjb250YWluZXJMYXllcjogQ29udGFpbmVyTGF5ZXI7XG5cdHByaXZhdGUgc2VsZWN0ZWQ6IHN0cmluZztcblx0XG5cdGNvbnN0cnVjdG9yKGNvbnRhaW5lckxheWVyOiBDb250YWluZXJMYXllciwgXG5cdCAgcmVhZG9ubHkgZGlzcGxheUxheWVyOiBDb250YWluZXJMYXllciA9IGNvbnRhaW5lckxheWVyKSB7XG5cdFx0dGhpcy5jb250YWluZXJMYXllciA9IGNvbnRhaW5lckxheWVyO1xuXHR9XG5cblx0c2V0TGF5ZXJDb250YWluZXIoY29udGFpbmVyTGF5ZXI6IENvbnRhaW5lckxheWVyKSB7XG5cdFx0dGhpcy5jb250YWluZXJMYXllciA9IGNvbnRhaW5lckxheWVyO1xuXHR9XG5cblx0c2V0U2VsZWN0ZWQobmFtZTogc3RyaW5nKTogUmVjdExheWVyIHtcblx0XHR0aGlzLnNlbGVjdGVkID0gbmFtZTtcblxuXHRcdGxldCBsYXllcjogQ2FudmFzTGF5ZXIgPSB0aGlzLmNvbnRhaW5lckxheWVyLmdldCh0aGlzLnNlbGVjdGVkKTtcblxuXHRcdGxldCBsYXllclJlY3QgPSBuZXcgUmVjdExheWVyKGxheWVyLmdldERpbWVuc2lvbigpLCAxLCB0cnVlKTtcblxuXHRcdGxldCBsYXllck5hbWUgPSBcIm91dGxpbmVcIjtcblxuXHRcdHRoaXMuZGlzcGxheUxheWVyLnNldChsYXllck5hbWUsIGxheWVyUmVjdCk7XG5cblx0XHRyZXR1cm4gbGF5ZXJSZWN0O1xuXHR9XG5cblx0dG9nZ2xlVmlzaWJpbGl0eShzZWxlY3RlZDogYm9vbGVhbiA9IHRydWUpe1xuXHRcdGxldCB0b2dnbGVHcm91cDogQXJyYXk8RGlzcGxheUVsZW1lbnQ+ID0gW107XG5cdFx0aWYgKHNlbGVjdGVkKXtcblx0XHRcdGlmICh0aGlzLnNlbGVjdGVkICE9IFwiXCIpe1xuXHRcdFx0XHR0b2dnbGVHcm91cC5wdXNoKHRoaXMuY29udGFpbmVyTGF5ZXIuZ2V0KHRoaXMuc2VsZWN0ZWQpKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Zm9yIChsZXQgcGFpciBvZiB0aGlzLmNvbnRhaW5lckxheWVyLmxheWVyTWFwKXtcblxuXHRcdFx0XHRpZiAocGFpclswXSAhPSB0aGlzLnNlbGVjdGVkKXtcblx0XHRcdFx0XHR0b2dnbGVHcm91cC5wdXNoKHBhaXJbMV0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwibGF5ZXJOYW1lOiBcIiArIHRoaXMuc2VsZWN0ZWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Zm9yIChsZXQgZWxlbWVudCBvZiB0b2dnbGVHcm91cCl7XG5cdFx0XHRlbGVtZW50LnNldFZpc2libGUoIWVsZW1lbnQuaXNWaXNpYmxlKCkpXG5cdFx0fVxuXHR9XG5cbn0iLCJpbXBvcnQgeyBUcmFuc2Zvcm0sIEJhc2ljVHJhbnNmb3JtLCBjb21iaW5lVHJhbnNmb3JtIH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgRHJhd0xheWVyLCBDYW52YXNMYXllciB9IGZyb20gXCIuL2xheWVyXCI7XG5pbXBvcnQgeyBEaXNwbGF5RWxlbWVudCwgWm9vbURpc3BsYXlSYW5nZSB9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IERpbWVuc2lvbiwgcm90YXRlLCBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRodW1iIGV4dGVuZHMgRGlzcGxheUVsZW1lbnQge1xuXG5cdGRyYXdUaHVtYihjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdzogbnVtYmVyLCBoOiBudW1iZXIpOiBib29sZWFuO1xuXG59XG5cbmV4cG9ydCBjbGFzcyBTdGF0aWNJbWFnZSBleHRlbmRzIERyYXdMYXllciBpbXBsZW1lbnRzIFRodW1iIHtcblxuXHRwcml2YXRlIGltZzogSFRNTEltYWdlRWxlbWVudDtcblxuXHRjb25zdHJ1Y3Rvcihsb2NhbFRyYW5zZm9ybTogVHJhbnNmb3JtLCBcblx0ICBpbWFnZVNyYzogc3RyaW5nLCBcblx0ICBvcGFjaXR5OiBudW1iZXIsXG5cdCAgdmlzaWJsZTogYm9vbGVhbixcblx0ICB6b29tRGlzcGxheVJhbmdlOiBab29tRGlzcGxheVJhbmdlID0gWm9vbURpc3BsYXlSYW5nZS5BbGxab29tUmFuZ2UpIHtcblxuXHRcdHN1cGVyKGxvY2FsVHJhbnNmb3JtLCBvcGFjaXR5LCB2aXNpYmxlLCBpbWFnZVNyYywgem9vbURpc3BsYXlSYW5nZSk7XG5cdFx0XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0fVxuXG5cdHByaXZhdGUgZHJhd0ltYWdlKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgdmlldzogVHJhbnNmb3JtKXtcblxuXHRcdGlmICh0aGlzLmlzVmlzaWJsZSgpICYmIHRoaXMuZ2V0Wm9vbURpc3BsYXlSYW5nZSgpLndpdGhpblJhbmdlKHZpZXcuem9vbVgpKXtcblx0XHRcdGxldCBjdHhUcmFuc2Zvcm0gPSBjb21iaW5lVHJhbnNmb3JtKHRoaXMsIHBhcmVudFRyYW5zZm9ybSk7XG5cblx0XHRcdHRoaXMucHJlcGFyZUN0eChjdHgsIGN0eFRyYW5zZm9ybSwgdmlldyk7XG5cdFx0XHRcblx0XHRcdGN0eC5nbG9iYWxBbHBoYSA9IHRoaXMub3BhY2l0eTtcblx0XHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDApO1xuXHRcdFx0Y3R4Lmdsb2JhbEFscGhhID0gMTtcblxuXHRcdFx0dGhpcy5jbGVhbkN0eChjdHgsIGN0eFRyYW5zZm9ybSwgdmlldyk7XG5cdFx0fVxuXHRcdFxuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgcGFyZW50VHJhbnNmb3JtOiBUcmFuc2Zvcm0sIFxuXHQgIHZpZXc6IFRyYW5zZm9ybSk6IGJvb2xlYW4ge1xuXG5cdFx0aWYgKHRoaXMudmlzaWJsZSAmJiB0aGlzLmltZy5jb21wbGV0ZSkge1xuXHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCBwYXJlbnRUcmFuc2Zvcm0sIHZpZXcpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGRyYXdUaHVtYihjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdzogbnVtYmVyLCBoOiBudW1iZXIpOiBib29sZWFuIHtcblx0XHRpZiAodGhpcy52aXNpYmxlICYmIHRoaXMuaW1nLmNvbXBsZXRlKSB7XG5cdFx0XHRsZXQgc2NhbGVYID0gdyAvIHRoaXMuaW1nLndpZHRoO1xuXHRcdFx0bGV0IHNjYWxlWSA9IGggLyB0aGlzLmltZy5oZWlnaHQ7XG5cdFx0XHRsZXQgc2NhbGUgPSBNYXRoLm1pbihzY2FsZVgsIHNjYWxlWSk7XG5cdFx0XHRjdHguc2NhbGUoc2NhbGUsIHNjYWxlKTtcblx0XHRcdC8vY29uc29sZS5sb2coXCJzY2FsZXggXCIgKyAodGhpcy5pbWcud2lkdGggKiBzY2FsZSkpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcInNjYWxleSBcIiArICh0aGlzLmltZy5oZWlnaHQgKiBzY2FsZSkpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcInh5IFwiICsgdGhpcy5pbWcueCArIFwiLCBcIiArIHRoaXMuaW1nLnkpO1xuXHRcdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZywgMCwgMCk7XG5cdFx0XHRjdHguc2NhbGUoMS9zY2FsZSwgMS9zY2FsZSk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Z2V0RGltZW5zaW9uKCk6IERpbWVuc2lvbiB7XG5cdFx0XG5cdFx0aWYgKHRoaXMuaW1nLmNvbXBsZXRlKXtcblx0XHRcdHZhciB3aWR0aCA9IHRoaXMuaW1nLndpZHRoICogdGhpcy56b29tWDtcblx0XHRcdHZhciBoZWlnaHQgPSB0aGlzLmltZy5oZWlnaHQgKiB0aGlzLnpvb21ZO1xuXG5cdFx0XHRsZXQgcDEgPSByb3RhdGUobmV3IFBvaW50MkQod2lkdGgsIDApLCB0aGlzLnJvdGF0aW9uKTtcblx0XHRcdGxldCBwMiA9IHJvdGF0ZShuZXcgUG9pbnQyRCh3aWR0aCwgLWhlaWdodCksIHRoaXMucm90YXRpb24pO1xuXHRcdFx0bGV0IHAzID0gcm90YXRlKG5ldyBQb2ludDJEKDAsIC1oZWlnaHQpLCB0aGlzLnJvdGF0aW9uKTtcblxuXHRcdFx0bGV0IG1pblggPSBNYXRoLm1pbigwLCBwMS54LCBwMi54LCBwMy54KTtcblx0XHRcdGxldCBtaW5ZID0gTWF0aC5taW4oMCwgcDEueSwgcDIueSwgcDMueSk7XG5cdFx0XHRsZXQgbWF4WCA9IE1hdGgubWF4KDAsIHAxLngsIHAyLngsIHAzLngpO1xuXHRcdFx0bGV0IG1heFkgPSBNYXRoLm1heCgwLCBwMS55LCBwMi55LCBwMy55KTtcblxuXHRcdFx0cmV0dXJuIG5ldyBEaW1lbnNpb24odGhpcy54ICsgbWluWCwgdGhpcy55IC0gbWF4WSwgbWF4WC1taW5YLCBtYXhZLW1pblkpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgRGltZW5zaW9uKHRoaXMueCwgdGhpcy55LCAwLCAwKTtcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgUmVjdExheWVyIGV4dGVuZHMgRHJhd0xheWVyIGltcGxlbWVudHMgRGlzcGxheUVsZW1lbnQge1xuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgZGltZW5zaW9uOiBEaW1lbnNpb24sIFxuXHRcdG9wYWNpdHk6IG51bWJlcixcblx0XHR2aXNpYmxlOiBib29sZWFuLFxuXHRcdHpvb21EaXNwbGF5UmFuZ2U6IFpvb21EaXNwbGF5UmFuZ2UgPSBab29tRGlzcGxheVJhbmdlLkFsbFpvb21SYW5nZSkge1xuXG5cdFx0c3VwZXIobmV3IEJhc2ljVHJhbnNmb3JtKGRpbWVuc2lvbi54LCBkaW1lbnNpb24ueSwgMSwgMSwgMCksIFxuXHRcdFx0b3BhY2l0eSwgdmlzaWJsZSwgXCJyZWN0XCIsIHpvb21EaXNwbGF5UmFuZ2UpO1xuXHR9XG5cblx0dXBkYXRlRGltZW5zaW9uKGRpbWVuc2lvbjogRGltZW5zaW9uKTogdm9pZCB7XG5cdFx0dGhpcy5kaW1lbnNpb24gPSBkaW1lbnNpb247XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBwYXJlbnRUcmFuc2Zvcm06IFRyYW5zZm9ybSwgXG5cdFx0dmlldzogVHJhbnNmb3JtKTogYm9vbGVhbiB7XG5cblx0XHRsZXQgeCA9ICh0aGlzLmRpbWVuc2lvbi54ICsgcGFyZW50VHJhbnNmb3JtLnggLSB2aWV3LngpICogdmlldy56b29tWDtcblx0XHRsZXQgeSA9ICh0aGlzLmRpbWVuc2lvbi55ICsgcGFyZW50VHJhbnNmb3JtLnkgLSB2aWV3LnkpICogdmlldy56b29tWTtcblxuXHRcdGN0eC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG5cdFx0Y3R4LnN0cm9rZVJlY3QoeCwgeSwgdGhpcy5kaW1lbnNpb24udyAqIHZpZXcuem9vbVgsIHRoaXMuZGltZW5zaW9uLmggKiB2aWV3Lnpvb21ZKTtcblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0Z2V0RGltZW5zaW9uKCk6IERpbWVuc2lvbiB7XG5cdFx0cmV0dXJuIHRoaXMuZGltZW5zaW9uO1xuXHR9XG5cbn1cbiIsIi8qKlxuKiBBIHdvcmxkIGlzIDAsMCBiYXNlZCBidXQgYW55IGVsZW1lbnQgY2FuIGJlIHBvc2l0aW9uZWQgcmVsYXRpdmUgdG8gdGhpcy5cbiovXG5leHBvcnQgaW50ZXJmYWNlIFRyYW5zZm9ybSB7XG5cdHg6IG51bWJlcjtcblx0eTogbnVtYmVyO1xuXHR6b29tWDogbnVtYmVyO1xuXHR6b29tWTogbnVtYmVyO1xuXHRyb3RhdGlvbjogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgQmFzaWNUcmFuc2Zvcm0gaW1wbGVtZW50cyBUcmFuc2Zvcm0ge1xuXG4gICAgc3RhdGljIHJlYWRvbmx5IHVuaXRUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgMSwgMSwgMCk7XG5cblx0Y29uc3RydWN0b3IocHVibGljIHg6IG51bWJlciwgcHVibGljIHk6IG51bWJlciwgXG5cdFx0cHVibGljIHpvb21YOiBudW1iZXIsIHB1YmxpYyB6b29tWTogbnVtYmVyLCBcblx0XHRwdWJsaWMgcm90YXRpb246IG51bWJlcil7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tYmluZVRyYW5zZm9ybShjaGlsZDogVHJhbnNmb3JtLCBjb250YWluZXI6IFRyYW5zZm9ybSk6IFRyYW5zZm9ybSB7XG5cdGxldCB6b29tWCA9IGNoaWxkLnpvb21YICogY29udGFpbmVyLnpvb21YO1xuXHQvL2NvbnNvbGUubG9nKFwibW9kaWZpZWQgXCIgKyBjaGlsZC56b29tWCArIFwiIHRvIFwiICsgem9vbVgpO1xuXHRsZXQgem9vbVkgPSBjaGlsZC56b29tWSAqIGNvbnRhaW5lci56b29tWTtcblx0Ly9jb25zb2xlLmxvZyhcIm1vZGlmaWVkIFwiICsgY2hpbGQuem9vbVkgKyBcIiBieSBcIiArIGNvbnRhaW5lci56b29tWSArIFwiIHRvIFwiICsgem9vbVkpO1xuXHRsZXQgeCA9IChjaGlsZC54ICogY29udGFpbmVyLnpvb21YKSArIGNvbnRhaW5lci54O1xuXHRsZXQgeSA9IChjaGlsZC55ICogY29udGFpbmVyLnpvb21ZKSArIGNvbnRhaW5lci55O1xuXHQvL2NvbnNvbGUubG9nKFwibW9kaWZpZWQgeCBcIiArIGNoaWxkLnggKyBcIiBieSBcIiArIGNvbnRhaW5lci56b29tWCArIFwiIGFuZCBcIiArIGNvbnRhaW5lci54ICsgXCIgdG8gXCIgKyB4KTtcblx0bGV0IHJvdGF0aW9uID0gY2hpbGQucm90YXRpb24gKyBjb250YWluZXIucm90YXRpb247XG5cdHJldHVybiBuZXcgQmFzaWNUcmFuc2Zvcm0oeCwgeSwgem9vbVgsIHpvb21ZLCByb3RhdGlvbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZSh0cmFuc2Zvcm06IFRyYW5zZm9ybSk6IFRyYW5zZm9ybSB7XG5cdHJldHVybiBuZXcgQmFzaWNUcmFuc2Zvcm0odHJhbnNmb3JtLngsIHRyYW5zZm9ybS55LCBcblx0XHR0cmFuc2Zvcm0uem9vbVgsIHRyYW5zZm9ybS56b29tWSwgdHJhbnNmb3JtLnJvdGF0aW9uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludmVydFRyYW5zZm9ybSh3b3JsZFN0YXRlOiBUcmFuc2Zvcm0pOiBUcmFuc2Zvcm0ge1xuXHRyZXR1cm4gbmV3IEJhc2ljVHJhbnNmb3JtKC13b3JsZFN0YXRlLngsIC13b3JsZFN0YXRlLnksIFxuXHRcdDEvd29ybGRTdGF0ZS56b29tWCwgMS93b3JsZFN0YXRlLnpvb21ZLCAtd29ybGRTdGF0ZS5yb3RhdGlvbik7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmlld1RyYW5zZm9ybSBleHRlbmRzIFRyYW5zZm9ybSB7XG5cdHdpZHRoOiBudW1iZXI7XG5cdGhlaWdodDogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgQmFzaWNWaWV3VHJhbnNmb3JtIGV4dGVuZHMgQmFzaWNUcmFuc2Zvcm0gaW1wbGVtZW50cyBWaWV3VHJhbnNmb3JtIHtcblxuXHRjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgXG5cdFx0cmVhZG9ubHkgd2lkdGg6IG51bWJlciwgcmVhZG9ubHkgaGVpZ2h0OiBudW1iZXIsXG5cdFx0em9vbVg6IG51bWJlciwgem9vbVk6IG51bWJlciwgXG5cdCAgICByb3RhdGlvbjogbnVtYmVyKXtcblxuXHRcdHN1cGVyKHgsIHksIHpvb21YLCB6b29tWSwgcm90YXRpb24pO1xuXHR9XG5cbn1cblxuXG5cbiIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1xuXHRcIm5hbWVcIjogXCIyLTJcIiwgXCJ4XCI6IC0zNjQsIFwieVwiOiAtMTIuNSwgXCJ6b29tWFwiOiAwLjIxMywgXCJ6b29tWVwiOiAwLjIwNSwgXCJyb3RhdGlvblwiOiAtMC4zMSwgXG5cdFwic3JjXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL2lsbG1hZGUvdHlwZW1hcC90cmVlL21hc3Rlci9kaXN0L2ltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwMnJfMltTVkMyXS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIzXCIsIFwieFwiOiAtMjE2LCBcInlcIjogLTAuNzA1LCBcInpvb21YXCI6IDAuMiwgXCJ6b29tWVwiOiAwLjIxLCBcInJvdGF0aW9uXCI6IC0wLjUxLCBcblx0XCJzcmNcIjogXCJodHRwczovL2dpdGh1Yi5jb20vaWxsbWFkZS90eXBlbWFwL3RyZWUvbWFzdGVyL2Rpc3QvaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDAzcltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI0XCIsIFwieFwiOiAtNzQuMjksIFwieVwiOiAtOTkuNzgsIFwiem9vbVhcIjogMC4yMjIsIFwiem9vbVlcIjogMC4yMDgsIFwicm90YXRpb25cIjogLTAuMjg1LCBcblx0XCJzcmNcIjogXCJodHRwczovL2dpdGh1Yi5jb20vaWxsbWFkZS90eXBlbWFwL3RyZWUvbWFzdGVyL2Rpc3QvaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA0cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI1XCIsIFwieFwiOiAtMzY2LjUsIFwieVwiOiAxODAuMDE5LCBcInpvb21YXCI6IDAuMjE1LCBcInpvb21ZXCI6IDAuMjA3LCBcInJvdGF0aW9uXCI6IC0wLjIxLCBcblx0XCJzcmNcIjogXCJodHRwczovL2dpdGh1Yi5jb20vaWxsbWFkZS90eXBlbWFwL3RyZWUvbWFzdGVyL2Rpc3QvaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA1cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI2XCIsIFwieFwiOiAtMjA2LjE2LCBcInlcIjogMTQ2LCBcInpvb21YXCI6IDAuMjEsIFwiem9vbVlcIjogMC4yMDgsIFwicm90YXRpb25cIjogLTAuMjE1LCBcblx0XCJzcmNcIjogXCJodHRwczovL2dpdGh1Yi5jb20vaWxsbWFkZS90eXBlbWFwL3RyZWUvbWFzdGVyL2Rpc3QvaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA2cltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI3XCIsIFwieFwiOiAtNjMuMywgXCJ5XCI6IDEwMC4zNzc2LCBcInpvb21YXCI6IDAuMjEyNSwgXCJ6b29tWVwiOiAwLjIxMywgXCJyb3RhdGlvblwiOiAtMC4yMywgXG5cdFwic3JjXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL2lsbG1hZGUvdHlwZW1hcC90cmVlL21hc3Rlci9kaXN0L2ltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwN3JbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiOFwiLCBcInhcIjogNzguMSwgXCJ5XCI6IDU4LjUzNSwgXCJ6b29tWFwiOiAwLjIwNywgXCJ6b29tWVwiOiAwLjIxNywgXCJyb3RhdGlvblwiOiAtMC4yNSwgXG5cdFwic3JjXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL2lsbG1hZGUvdHlwZW1hcC90cmVlL21hc3Rlci9kaXN0L2ltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwOHJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiOVwiLCBcInhcIjogMjE5LjUsIFwieVwiOiAyNCwgXCJ6b29tWFwiOiAwLjIxNSwgXCJ6b29tWVwiOiAwLjIxNDUsIFwicm90YXRpb25cIjogLTAuMjYsXG5cdFwic3JjXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL2lsbG1hZGUvdHlwZW1hcC90cmVlL21hc3Rlci9kaXN0L2ltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwOXJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTBcIiwgXCJ4XCI6IDQ1NC4yMSwgXCJ5XCI6IC0xLjUsIFwiem9vbVhcIjogMC4yMTgsIFwiem9vbVlcIjogMC4yMTQsIFwicm90YXRpb25cIjogMC4wMTUsIFxuXHRcInNyY1wiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9pbGxtYWRlL3R5cGVtYXAvdHJlZS9tYXN0ZXIvZGlzdC9pbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTByXzJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTFcIiwgXCJ4XCI6IDYyMS44NiwgXCJ5XCI6IDI1LjUyNSwgXCJ6b29tWFwiOiAwLjIxMywgXCJ6b29tWVwiOiAwLjIxMTUsIFwicm90YXRpb25cIjogMC4xMSwgXG5cdFwic3JjXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL2lsbG1hZGUvdHlwZW1hcC90cmVlL21hc3Rlci9kaXN0L2ltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxMXJbU1ZDMl0uanBnXCIsIFwidmlzaWJsZVwiOiB0cnVlLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sIFxuXHR7XG5cdFwibmFtZVwiOiBcIjEyLTFcIiwgXCJ4XCI6IDc2OS42NDUsIFwieVwiOiA1MC4yNjUsIFwiem9vbVhcIjogMC40MjQsIFwiem9vbVlcIjogMC40MjIsIFwicm90YXRpb25cIjogMC4xMiwgXG5cdFwic3JjXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL2lsbG1hZGUvdHlwZW1hcC90cmVlL21hc3Rlci9kaXN0L2ltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxMnJfMVtTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxNFwiLCBcInhcIjogLTkxNS42LCBcInlcIjogNTU3Ljg2NSwgXCJ6b29tWFwiOiAwLjIwOCwgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAtMS4yMTUsIFxuXHRcInNyY1wiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9pbGxtYWRlL3R5cGVtYXAvdHJlZS9tYXN0ZXIvZGlzdC9pbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTRSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE1LTJcIiwgXCJ4XCI6IC03MTcuMywgXCJ5XCI6IDU3MiwgXCJ6b29tWFwiOiAwLjIxLCBcInpvb21ZXCI6IDAuMjA2LCBcInJvdGF0aW9uXCI6IC0xLjQ3LCBcblx0XCJzcmNcIjogXCJodHRwczovL2dpdGh1Yi5jb20vaWxsbWFkZS90eXBlbWFwL3RyZWUvbWFzdGVyL2Rpc3QvaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDE1cl8yW1NWQzJdLnBuZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE2LTJcIiwgXCJ4XCI6IC05MiwgXCJ5XCI6IDMzNi41LCBcInpvb21YXCI6IDAuMjE3LCBcInpvb21ZXCI6IDAuMjEsIFwicm90YXRpb25cIjogLTAuMSwgXG5cdFwic3JjXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL2lsbG1hZGUvdHlwZW1hcC90cmVlL21hc3Rlci9kaXN0L2ltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxNnJfMltTVkMyXS5wbmdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxN1wiLCBcInhcIjogNzcsIFwieVwiOiAyNzguNSwgXCJ6b29tWFwiOiAwLjIwNiwgXCJ6b29tWVwiOiAwLjIwNiwgXCJyb3RhdGlvblwiOiAtMC4wNTUsIFxuXHRcInNyY1wiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9pbGxtYWRlL3R5cGVtYXAvdHJlZS9tYXN0ZXIvZGlzdC9pbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTdSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjE4XCIsIFwieFwiOiAyMjksIFwieVwiOiAyMzkuNSwgXCJ6b29tWFwiOiAwLjIwOCwgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAwLjA3LCBcblx0XCJzcmNcIjogXCJodHRwczovL2dpdGh1Yi5jb20vaWxsbWFkZS90eXBlbWFwL3RyZWUvbWFzdGVyL2Rpc3QvaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDE4UltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxOVwiLCBcInhcIjogNzEuNSwgXCJ5XCI6IDQ3NCwgXCJ6b29tWFwiOiAwLjIwMywgXCJ6b29tWVwiOiAwLjIwOCwgXCJyb3RhdGlvblwiOiAwLjE3LCBcblx0XCJzcmNcIjogXCJodHRwczovL2dpdGh1Yi5jb20vaWxsbWFkZS90eXBlbWFwL3RyZWUvbWFzdGVyL2Rpc3QvaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDE5UltTVkMyXS5qcGdcIiwgXCJ2aXNpYmxlXCI6IHRydWUsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIyMFwiLCBcInhcIjogNDMuNSwgXCJ5XCI6IDY0MCwgXCJ6b29tWFwiOiAwLjEsIFwiem9vbVlcIjogMC4xMDQsIFwicm90YXRpb25cIjogMC4yMDUsIFxuXHRcInNyY1wiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9pbGxtYWRlL3R5cGVtYXAvdHJlZS9tYXN0ZXIvZGlzdC9pbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMjBSW1NWQzJdLmpwZ1wiLCBcInZpc2libGVcIjogdHJ1ZSwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9XG5cbl0iLCJpbXBvcnQgeyBJbmRleGVyIH0gZnJvbSBcIi4vaW5kZXhlclwiO1xuaW1wb3J0IHsgR3JpZEluZGV4ZXIgfSBmcm9tIFwiLi9ncmlkaW5kZXhlclwiO1xuaW1wb3J0IHsgQ29udGFpbmVyTGF5ZXIsIENhbnZhc0xheWVyIH0gZnJvbSBcIi4uL2dyYXBoaWNzL2xheWVyXCI7XG5cbmV4cG9ydCBjbGFzcyBDb250YWluZXJJbmRleCBpbXBsZW1lbnRzIEluZGV4ZXIge1xuXG5cdGNvbnN0cnVjdG9yKFxuXHQgIHJlYWRvbmx5IGNvbnRhaW5lcjogQ29udGFpbmVyTGF5ZXIsIFxuXHQgIHJlYWRvbmx5IG5hbWU6IHN0cmluZyxcblx0ICByZWFkb25seSBpbmRleGVyOiBJbmRleGVyID0gbmV3IEdyaWRJbmRleGVyKDI1Nikpe1xuXHRcdGZvciAobGV0IGxheWVyIG9mIGNvbnRhaW5lci5sYXllcnMoKSl7XG5cdFx0XHR0aGlzLmFkZChsYXllcik7XG5cdFx0fVxuXHR9XG5cblx0Z2V0TGF5ZXJzKHg6IG51bWJlciwgeTogbnVtYmVyKTogQXJyYXk8Q2FudmFzTGF5ZXI+e1xuXHRcdGlmICh0aGlzLmNvbnRhaW5lci5pc1Zpc2libGUoKSl7XG5cdFx0XHRjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyBcIiBpcyB2aXNpYmxlIFwiKTtcblx0XHRcdHJldHVybiB0aGlzLmluZGV4ZXIuZ2V0TGF5ZXJzKHgsIHkpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHJldHVybiBbXTtcblx0XHR9XG5cdH1cblxuXHRhZGQoY2FudmFzTGF5ZXI6IENhbnZhc0xheWVyKTogdm9pZCB7XG5cdFx0dGhpcy5pbmRleGVyLmFkZChjYW52YXNMYXllcik7XG5cdH1cblxufSIsImltcG9ydCB7IENhbnZhc0xheWVyLCBDb250YWluZXJMYXllciB9IGZyb20gXCIuLi9ncmFwaGljcy9sYXllclwiO1xuaW1wb3J0IHsgQ29uc29sZUxvZ2dlciwgTG9nZ2VyIH0gZnJvbSBcIi4uL2xvZ2dpbmcvbG9nZ2VyXCI7XG5pbXBvcnQgeyBJbmRleGVyIH0gZnJvbSBcIi4vaW5kZXhlclwiO1xuXG5jbGFzcyBHcmlkTWFwIHtcblx0cmVhZG9ubHkgbGF5ZXJNYXA6IE1hcDxzdHJpbmcsIEFycmF5PENhbnZhc0xheWVyPj5cblxuXHRjb25zdHJ1Y3Rvcigpe1xuXHRcdHRoaXMubGF5ZXJNYXAgPSBuZXcgTWFwPHN0cmluZywgQXJyYXk8Q2FudmFzTGF5ZXI+PigpO1xuXHR9IFxuXG5cdGFkZCh4OiBudW1iZXIsIHk6IG51bWJlciwgbGF5ZXI6IENhbnZhc0xheWVyKXtcblx0XHR2YXIgbGF5ZXJWYWx1ZXM6IEFycmF5PENhbnZhc0xheWVyPjtcblx0XHRpZiAodGhpcy5sYXllck1hcC5oYXModGhpcy5rZXkoeCwgeSkpKXtcblx0XHRcdGxheWVyVmFsdWVzID0gdGhpcy5sYXllck1hcC5nZXQodGhpcy5rZXkoeCwgeSkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsYXllclZhbHVlcyA9IFtdO1xuXHRcdH1cblx0XHRsYXllclZhbHVlcy5wdXNoKGxheWVyKTtcblx0XHR0aGlzLmxheWVyTWFwLnNldCh0aGlzLmtleSh4LCB5KSwgbGF5ZXJWYWx1ZXMpO1xuXHR9XG5cblx0Z2V0KHg6IG51bWJlciwgeTogbnVtYmVyKTogQXJyYXk8Q2FudmFzTGF5ZXI+e1xuXHRcdHJldHVybiB0aGlzLmxheWVyTWFwLmdldCh0aGlzLmtleSh4LCB5KSk7XG5cdH1cblxuXHRoYXMoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5sYXllck1hcC5oYXModGhpcy5rZXkoeCwgeSkpO1xuXHR9XG5cblx0cHJpdmF0ZSBrZXkoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBzdHJpbmcge1xuXHRcdHJldHVybiB4ICsgXCJfXCIgKyB5O1xuXHR9XG5cbn1cblxuZXhwb3J0IGNsYXNzIEdyaWRJbmRleGVyIGltcGxlbWVudHMgSW5kZXhlciB7XG5cblx0cHJpdmF0ZSBsb2dnZXI6IExvZ2dlcjtcblx0cHJpdmF0ZSBjYW52YXNNYXAgPSBuZXcgR3JpZE1hcCgpO1xuXG5cdGNvbnN0cnVjdG9yKHJlYWRvbmx5IGdyaWRXaWR0aDogbnVtYmVyLCBcblx0ICByZWFkb25seSBncmlkSGVpZ2h0OiBudW1iZXIgPSBncmlkV2lkdGgpe1xuXHRcdHRoaXMubG9nZ2VyID0gbmV3IENvbnNvbGVMb2dnZXIoKTtcblx0fVxuXG5cdHNldExvZ2dlcihsb2dnZXI6IExvZ2dlcik6IHZvaWQge1xuXHRcdHRoaXMubG9nZ2VyID0gbG9nZ2VyO1xuXHR9XG5cblx0Z2V0TGF5ZXJzKHg6IG51bWJlciwgeTogbnVtYmVyKTogQXJyYXk8Q2FudmFzTGF5ZXI+IHtcblx0XHRsZXQgZ3JpZFggPSBNYXRoLmZsb29yKHggLyB0aGlzLmdyaWRXaWR0aCk7XG5cdFx0bGV0IGdyaWRZID0gTWF0aC5mbG9vcih5IC8gdGhpcy5ncmlkSGVpZ2h0KTtcblxuXHRcdHRoaXMubG9nZ2VyLmxvZyhcImdyaWQgeHkgXCIgKyBncmlkWCArIFwiLCBcIiArIGdyaWRZKTtcblxuXHRcdGlmICh0aGlzLmNhbnZhc01hcC5oYXMoZ3JpZFgsIGdyaWRZKSl7XG5cdFx0XHRyZXR1cm4gdGhpcy5jYW52YXNNYXAuZ2V0KGdyaWRYLCBncmlkWSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0cmV0dXJuIFtdO1xuXHRcdH1cblx0fVxuXG5cdGFkZChjYW52YXNMYXllcjogQ2FudmFzTGF5ZXIpe1xuXG5cdFx0bGV0IGRpbWVuc2lvbiA9IGNhbnZhc0xheWVyLmdldERpbWVuc2lvbigpO1xuXG5cdFx0bGV0IHhNaW4gPSBNYXRoLmZsb29yKGRpbWVuc2lvbi54IC8gdGhpcy5ncmlkV2lkdGgpO1xuXHRcdGxldCB4TWF4ID0gTWF0aC5mbG9vcigoZGltZW5zaW9uLnggKyBkaW1lbnNpb24udykgLyB0aGlzLmdyaWRXaWR0aCk7XG5cblx0XHRsZXQgeU1pbiA9IE1hdGguZmxvb3IoZGltZW5zaW9uLnkgLyB0aGlzLmdyaWRIZWlnaHQpO1xuXHRcdGxldCB5TWF4ID0gTWF0aC5mbG9vcigoZGltZW5zaW9uLnkgKyBkaW1lbnNpb24uaCkgLyB0aGlzLmdyaWRIZWlnaHQpO1xuXG5cdFx0Zm9yICh2YXIgeCA9IHhNaW47IHg8PXhNYXg7IHgrKyl7XG5cdFx0XHRmb3IgKHZhciB5ID0geU1pbjsgeTw9eU1heDsgeSsrKXtcblx0XHRcdFx0dGhpcy5jYW52YXNNYXAuYWRkKHgsIHksIGNhbnZhc0xheWVyKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRzaG93SW5kaWNlcyhjYW52YXNMYXllcjogQ2FudmFzTGF5ZXIpOiB2b2lkIHtcblxuXHRcdGxldCBkaW1lbnNpb24gPSBjYW52YXNMYXllci5nZXREaW1lbnNpb24oKTtcblxuXHRcdGxldCB4TWluID0gTWF0aC5mbG9vcihkaW1lbnNpb24ueCAvIHRoaXMuZ3JpZFdpZHRoKTtcblx0XHRsZXQgeE1heCA9IE1hdGguZmxvb3IoKGRpbWVuc2lvbi54ICsgZGltZW5zaW9uLncpIC8gdGhpcy5ncmlkV2lkdGgpO1xuXG5cdFx0bGV0IHlNaW4gPSBNYXRoLmZsb29yKGRpbWVuc2lvbi55IC8gdGhpcy5ncmlkSGVpZ2h0KTtcblx0XHRsZXQgeU1heCA9IE1hdGguZmxvb3IoKGRpbWVuc2lvbi55ICsgZGltZW5zaW9uLmgpIC8gdGhpcy5ncmlkSGVpZ2h0KTtcblxuXHRcdHZhciBtZXNzYWdlID0gXCJncmlkOiBbXCJcblxuXHRcdGZvciAodmFyIHggPSB4TWluOyB4PD14TWF4OyB4Kyspe1xuXHRcdFx0Zm9yICh2YXIgeSA9IHlNaW47IHk8PXlNYXg7IHkrKyl7XG5cdFx0XHRcdG1lc3NhZ2UgPSBtZXNzYWdlICsgXCJbXCIgKyB4ICsgXCIsIFwiICsgeSArIFwiXVwiO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdG1lc3NhZ2UgPSBtZXNzYWdlICsgXCJdXCI7XG5cblx0XHR0aGlzLmxvZ2dlci5sb2cobWVzc2FnZSk7XG5cdH1cbn1cbiIsImltcG9ydCB7IENhbnZhc0xheWVyIH0gZnJvbSBcIi4uL2dyYXBoaWNzL2xheWVyXCI7XG5pbXBvcnQgeyBDYW52YXNWaWV3IH0gZnJvbSBcIi4uL2dyYXBoaWNzL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IFRodW1iIH0gZnJvbSBcIi4uL2dyYXBoaWNzL3N0YXRpY1wiO1xuaW1wb3J0IHsgSW1hZ2VDb250cm9sbGVyIH0gZnJvbSBcIi4vaW1hZ2Vjb250cm9sbGVyXCI7XG5cbmV4cG9ydCBjbGFzcyBDYW52YXNMYXllclZpZXcge1xuXG5cdHJlYWRvbmx5IGNvbnRhaW5lcjogSFRNTFNwYW5FbGVtZW50O1xuXG5cdGNvbnN0cnVjdG9yKFxuXHQgIGxheWVyOiBDYW52YXNMYXllciwgXG5cdCAgY2FudmFzVmlldzogQ2FudmFzVmlldywgXG5cdCAgaW1hZ2VDb250cm9sbGVyOiBJbWFnZUNvbnRyb2xsZXJcblx0KXtcblxuXHRcdHRoaXMuY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG5cdFx0dGhpcy5jb250YWluZXIuY2xhc3NOYW1lID0gXCJsYXllclwiO1xuXG5cdFx0bGV0IGVkaXRkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcblxuXHRcdGxldCBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuXHRcdGxhYmVsLmlubmVySFRNTCA9IGxheWVyLm5hbWU7XG5cblx0XHRsZXQgdmlzaWJpbGl0eTogSFRNTElucHV0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcblx0XHR2aXNpYmlsaXR5LnR5cGUgPSBcImNoZWNrYm94XCI7XG5cdFx0dmlzaWJpbGl0eS5jaGVja2VkID0gdHJ1ZTtcblxuXHRcdGxldCBlZGl0OiBIVE1MSW5wdXRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuXHRcdGVkaXQudHlwZSA9IFwicmFkaW9cIjtcblx0XHRlZGl0Lm5hbWUgPSBcImVkaXRcIjtcblxuXHRcdHZpc2liaWxpdHkuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0aWYgKHRoaXMuY2hlY2tlZCl7XG5cdFx0XHRcdGxheWVyLnNldFZpc2libGUodHJ1ZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRsYXllci5zZXRWaXNpYmxlKGZhbHNlKTtcblx0XHRcdH1cblx0XHRcdGNhbnZhc1ZpZXcuZHJhdygpO1xuXHRcdH0pO1xuXG5cdFx0ZWRpdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRpZiAodGhpcy5jaGVja2VkKXtcblx0XHRcdFx0aW1hZ2VDb250cm9sbGVyLnNldENhbnZhc0xheWVyKGxheWVyKTtcblx0XHRcdH0gXG5cdFx0XHRjYW52YXNWaWV3LmRyYXcoKTtcblx0XHR9KTtcblxuXHRcdHZhciB0aHVtYiA9IDxUaHVtYj4gbGF5ZXI7XG5cblx0XHRsZXQgY2FudmFzSW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHRcdGxldCB0aHVtYkN0eCA9IGNhbnZhc0ltYWdlLmdldENvbnRleHQoXCIyZFwiKTtcblx0XHR0aHVtYi5kcmF3VGh1bWIodGh1bWJDdHgsIDIwMCwgMjAwKTtcblxuXHRcdGxldCB0aHVtYm5haWw6IEhUTUxJbWFnZUVsZW1lbnQgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aHVtYm5haWwuc3JjID0gY2FudmFzSW1hZ2UudG9EYXRhVVJMKCk7XG5cdFx0dGh1bWJuYWlsLmNsYXNzTmFtZSA9IFwidGh1bWJuYWlsXCI7XG5cblx0XHRlZGl0ZGl2LmFwcGVuZENoaWxkKGxhYmVsKTtcblx0XHRlZGl0ZGl2LmFwcGVuZENoaWxkKHZpc2liaWxpdHkpO1xuXHRcdGVkaXRkaXYuYXBwZW5kQ2hpbGQoZWRpdCk7XG5cdFx0dGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoZWRpdGRpdik7XG5cdFx0dGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGh1bWJuYWlsKTtcblx0fVxuXG59IiwiaW1wb3J0IHtDYW52YXNWaWV3LCBEaXNwbGF5RWxlbWVudH0gZnJvbSBcIi4uL2dyYXBoaWNzL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7Q2FudmFzTGF5ZXJ9IGZyb20gXCIuLi9ncmFwaGljcy9sYXllclwiO1xuaW1wb3J0IHtSZWN0TGF5ZXJ9IGZyb20gXCIuLi9ncmFwaGljcy9zdGF0aWNcIjtcbmltcG9ydCB7R3JpZEluZGV4ZXJ9IGZyb20gXCIuLi9pbmRleC9ncmlkaW5kZXhlclwiO1xuaW1wb3J0IHtFbGVtZW50TG9nZ2VyfSBmcm9tIFwiLi4vbG9nZ2luZy9sb2dnZXJcIjtcblxuZXhwb3J0IGNsYXNzIERpc3BsYXlFbGVtZW50Q29udHJvbGxlciB7XG5cbiAgICBjb25zdHJ1Y3RvcihjYW52YXNWaWV3OiBDYW52YXNWaWV3LCByZWFkb25seSBkaXNwbGF5RWxlbWVudDogRGlzcGxheUVsZW1lbnQsICBwdWJsaWMgbW9kOiBzdHJpbmcgPSBcInZcIikge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5wcmVzc2VkKGNhbnZhc1ZpZXcsIGUgIGFzIEtleWJvYXJkRXZlbnQpKTtcbiAgICB9XG5cbiAgICBwcmVzc2VkKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgICAgICAgICAgY2FzZSB0aGlzLm1vZDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInRvZ2dsZSB2aXNpYmxlXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheUVsZW1lbnQuc2V0VmlzaWJsZSghdGhpcy5kaXNwbGF5RWxlbWVudC5pc1Zpc2libGUoKSk7XG4gICAgICAgICAgICAgICAgY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZUNvbnRyb2xsZXIge1xuXG4gICAgcHJpdmF0ZSBjYW52YXNMYXllcjogQ2FudmFzTGF5ZXI7XG4gICAgcHJpdmF0ZSBsYXllck91dGxpbmU6IFJlY3RMYXllcjtcbiAgICBwcml2YXRlIGVkaXRJbmZvUGFuZTogSFRNTEVsZW1lbnQ7XG5cbiAgICBwcml2YXRlIGluZGV4ZXI6IEdyaWRJbmRleGVyID0gbmV3IEdyaWRJbmRleGVyKDI1Nik7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIGNhbnZhc0xheWVyOiBDYW52YXNMYXllcikge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5wcmVzc2VkKGNhbnZhc1ZpZXcsIGUgIGFzIEtleWJvYXJkRXZlbnQpKTtcbiAgICAgICAgdGhpcy5jYW52YXNMYXllciA9IGNhbnZhc0xheWVyO1xuICAgIH1cblxuICAgIHNldENhbnZhc0xheWVyKGNhbnZhc0xheWVyOiBDYW52YXNMYXllcil7XG4gICAgICAgIHRoaXMuY2FudmFzTGF5ZXIgPSBjYW52YXNMYXllcjtcblxuICAgICAgICB0aGlzLmluZGV4ZXIuc2hvd0luZGljZXMoY2FudmFzTGF5ZXIpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy51cGRhdGVDYW52YXModGhpcy5jYW52YXNWaWV3KTtcbiAgICB9XG5cbiAgICBzZXRFZGl0SW5mb1BhbmUoZWRpdEluZm9QYW5lOiBIVE1MRWxlbWVudCl7XG4gICAgICAgIHRoaXMuZWRpdEluZm9QYW5lID0gZWRpdEluZm9QYW5lO1xuICAgIH1cblxuICAgIHNldExheWVyT3V0bGluZShsYXllck91dGxpbmU6IFJlY3RMYXllcil7XG4gICAgICAgIHRoaXMubGF5ZXJPdXRsaW5lID0gbGF5ZXJPdXRsaW5lO1xuICAgIH1cblxuICAgIHByZXNzZWQoY2FudmFzVmlldzogQ2FudmFzVmlldywgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJwcmVzc2VkXCIgKyBldmVudC50YXJnZXQgKyBcIiwgXCIgKyBldmVudC5rZXkpO1xuXG4gICAgICAgIGxldCBtdWx0aXBsaWVyID0gMTtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgICAgICAgICAgY2FzZSBcImFcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnggPSB0aGlzLmNhbnZhc0xheWVyLnggLSAwLjUgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIkFcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnggPSB0aGlzLmNhbnZhc0xheWVyLnggLSA1ICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJkXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54ICsgMC41ICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJEXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci54ID0gdGhpcy5jYW52YXNMYXllci54ICsgNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwid1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIueSA9IHRoaXMuY2FudmFzTGF5ZXIueSAtIDAuNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiV1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIueSA9IHRoaXMuY2FudmFzTGF5ZXIueSAtIDUgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrOyAgICBcbiAgICAgICAgICAgIGNhc2UgXCJzXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci55ID0gdGhpcy5jYW52YXNMYXllci55ICsgMC41ICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJTXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci55ID0gdGhpcy5jYW52YXNMYXllci55ICsgNSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gPSB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uIC0gMC4wMDU7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiRVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gPSB0aGlzLmNhbnZhc0xheWVyLnJvdGF0aW9uIC0gMC4wNTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJxXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiA9IHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gKyAwLjAwNTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJRXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5yb3RhdGlvbiA9IHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb24gKyAwLjA1O1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInhcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnpvb21YID0gdGhpcy5jYW52YXNMYXllci56b29tWCAtIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJYXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci56b29tWCA9IHRoaXMuY2FudmFzTGF5ZXIuem9vbVggKyAwLjAwMiAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwielwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIuem9vbVkgPSB0aGlzLmNhbnZhc0xheWVyLnpvb21ZIC0gMC4wMDIgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlpcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLnpvb21ZID0gdGhpcy5jYW52YXNMYXllci56b29tWSArIDAuMDAyICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcyhjYW52YXNWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJjXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNMYXllci5zZXRWaXNpYmxlKCF0aGlzLmNhbnZhc0xheWVyLnZpc2libGUpO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0xheWVyLm9wYWNpdHkgPSBNYXRoLm1pbigxLjAsIHRoaXMuY2FudmFzTGF5ZXIub3BhY2l0eSArIDAuMSk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwidFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzTGF5ZXIub3BhY2l0eSA9IE1hdGgubWF4KDAsIHRoaXMuY2FudmFzTGF5ZXIub3BhY2l0eSAtIDAuMSk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYW52YXMoY2FudmFzVmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIGNvZGUuLi5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBpbmZvOiBzdHJpbmcgPSAnXCJuYW1lXCI6ICcgKyB0aGlzLmNhbnZhc0xheWVyLm5hbWUgK1xuICAgICAgICAgICAgICAnIFwieFwiOiAnICsgdGhpcy5jYW52YXNMYXllci54ICtcbiAgICAgICAgICAgICAgJywgXCJ5XCI6ICcgKyB0aGlzLmNhbnZhc0xheWVyLnkgK1xuICAgICAgICAgICAgICAnLCBcInpvb21YXCI6ICcrIHRoaXMuY2FudmFzTGF5ZXIuem9vbVggKyBcbiAgICAgICAgICAgICAgJywgXCJ6b29tWVwiOiAnICsgdGhpcy5jYW52YXNMYXllci56b29tWSArIFxuICAgICAgICAgICAgICAnLCBcInJvdGF0aW9uXCI6ICcrIHRoaXMuY2FudmFzTGF5ZXIucm90YXRpb247XG5cbiAgICAgICAgaWYgKHRoaXMuZWRpdEluZm9QYW5lICE9IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICB0aGlzLmVkaXRJbmZvUGFuZS5pbm5lckhUTUwgPSBpbmZvO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coaW5mbyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdXBkYXRlQ2FudmFzKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcpIHtcblxuICAgICAgICBpZiAodGhpcy5sYXllck91dGxpbmUgIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIGxldCBuZXdEaW1lbnNpb24gPSB0aGlzLmNhbnZhc0xheWVyLmdldERpbWVuc2lvbigpO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcImltYWdlIG91dGxpbmUgXCIgKyBuZXdEaW1lbnNpb24pO1xuICAgICAgICAgICAgdGhpcy5sYXllck91dGxpbmUudXBkYXRlRGltZW5zaW9uKG5ld0RpbWVuc2lvbik7XG4gICAgICAgIH1cblxuICAgICAgICBjYW52YXNWaWV3LmRyYXcoKTtcbiAgICB9XG5cbn07IiwiaW1wb3J0IHsgQ2FudmFzVmlldyB9IGZyb20gXCIuLi9ncmFwaGljcy9jYW52YXN2aWV3XCI7XG5pbXBvcnQgeyBDYW52YXNMYXllciwgQ29udGFpbmVyTGF5ZXIgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvbGF5ZXJcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBNb3VzZUNvbnRyb2xsZXIgfSBmcm9tIFwiLi92aWV3Y29udHJvbGxlclwiO1xuaW1wb3J0IHsgSW5kZXhlciB9IGZyb20gXCIuLi9pbmRleC9pbmRleGVyXCI7XG5pbXBvcnQgeyBMb2dnZXIsIENvbnNvbGVMb2dnZXIgfSBmcm9tIFwiLi4vbG9nZ2luZy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgSW1hZ2VDb250cm9sbGVyIH0gZnJvbSBcIi4vaW1hZ2Vjb250cm9sbGVyXCI7XG5pbXBvcnQgeyBJbmRleFZpZXcgfSBmcm9tIFwiLi9pbmRleHZpZXdcIjtcbmltcG9ydCB7IENhbnZhc0xheWVyVmlldyB9IGZyb20gXCIuL2NhbnZhc2xheWVydmlld1wiO1xuXG5leHBvcnQgY2xhc3MgSW5kZXhDb250cm9sbGVyIGV4dGVuZHMgTW91c2VDb250cm9sbGVyIHtcblxuXHRwcml2YXRlIGxvZ2dlcjogTG9nZ2VyO1xuXHRwcml2YXRlIGluZGV4ZXJzOiBBcnJheTxJbmRleGVyPjtcblx0cHJpdmF0ZSBtZW51OiBIVE1MRWxlbWVudDtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgcmVhZG9ubHkgY2FudmFzVmlldzogQ2FudmFzVmlldyxcbiAgICAgIHJlYWRvbmx5IGltYWdlQ29udHJvbGxlcjogSW1hZ2VDb250cm9sbGVyXG4gICAgKSB7XG5cbiAgICBcdHN1cGVyKCk7XG5cbiAgICBcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkYmxjbGlja1wiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuY2xpY2tlZChlICBhcyBNb3VzZUV2ZW50KSk7XG5cbiAgICBcdHRoaXMuaW5kZXhlcnMgPSBbXTtcbiAgICBcdHRoaXMubG9nZ2VyID0gbmV3IENvbnNvbGVMb2dnZXIoKTtcbiAgICB9XG5cbiAgICBzZXRMb2dnaW5nKGxvZ2dlcjogTG9nZ2VyKXtcbiAgICBcdHRoaXMubG9nZ2VyID0gbG9nZ2VyO1xuICAgIH1cblxuICAgIHNldE1lbnUobWVudTogSFRNTEVsZW1lbnQpe1xuICAgIFx0dGhpcy5tZW51ID0gbWVudTtcbiAgICB9XG5cbiAgICBhZGRJbmRleGVyKGluZGV4ZXI6IEluZGV4ZXIpe1xuICAgIFx0dGhpcy5pbmRleGVycy5wdXNoKGluZGV4ZXIpO1xuICAgIH1cblxuICAgIGNsaWNrZWQoZTogTW91c2VFdmVudCl7XG4gICAgXHRsZXQgcG9pbnQgID0gdGhpcy5tb3VzZVBvc2l0aW9uKGUsIHRoaXMuY2FudmFzVmlldy5jYW52YXNFbGVtZW50KTtcblxuICAgIFx0bGV0IHdvcmxkUG9pbnQgPSB0aGlzLmNhbnZhc1ZpZXcuZ2V0QmFzZVBvaW50KFxuICAgIFx0XHRuZXcgUG9pbnQyRChwb2ludFswXSwgcG9pbnRbMV0pKTtcblxuICAgIFx0dmFyIGxheWVyczogQXJyYXk8Q2FudmFzTGF5ZXI+ID0gW107XG5cbiAgICBcdGZvciAobGV0IGluZGV4ZXIgb2YgdGhpcy5pbmRleGVycykge1xuICAgIFx0XHRsZXQgbmV3TGF5ZXJzID0gdGhpcy5maWx0ZXJWaXNpYmxlKFxuICAgIFx0XHRcdGluZGV4ZXIuZ2V0TGF5ZXJzKHdvcmxkUG9pbnQueCwgd29ybGRQb2ludC55KSk7XG4gICAgXHRcdGxheWVycyA9IGxheWVycy5jb25jYXQobmV3TGF5ZXJzKTtcbiAgICBcdH1cblxuICAgIFx0aWYgKHRoaXMubWVudSAhPSB1bmRlZmluZWQpe1xuICAgIFx0XHRsZXQgbGF5ZXJWaWV3ID0gbmV3IEluZGV4Vmlldyh0aGlzLm1lbnUsIHRoaXMuY2FudmFzVmlldywgXG4gICAgXHRcdFx0dGhpcy5pbWFnZUNvbnRyb2xsZXIpO1xuICAgIFx0XHRsYXllclZpZXcuc2V0RWxlbWVudHMobGF5ZXJzKTtcbiAgICBcdH1cbiAgICB9XG5cblx0cHJpdmF0ZSBmaWx0ZXJWaXNpYmxlKGxheWVyczogQXJyYXk8Q2FudmFzTGF5ZXI+KXtcblx0XHRyZXR1cm4gbGF5ZXJzLmZpbHRlcihmdW5jdGlvbihsYXllcikgeyBcblx0XHRcdHJldHVybiBsYXllci5pc1Zpc2libGUoKTtcblx0XHR9KTtcblx0fVxuXG59IiwiaW1wb3J0IHsgQ2FudmFzTGF5ZXIgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvbGF5ZXJcIjtcbmltcG9ydCB7IENhbnZhc1ZpZXcgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvY2FudmFzdmlld1wiO1xuaW1wb3J0IHsgQ2FudmFzTGF5ZXJWaWV3IH0gZnJvbSBcIi4vY2FudmFzbGF5ZXJ2aWV3XCI7XG5pbXBvcnQgeyBJbWFnZUNvbnRyb2xsZXIgfSBmcm9tIFwiLi9pbWFnZWNvbnRyb2xsZXJcIjtcblxuZXhwb3J0IGNsYXNzIEluZGV4VmlldyB7XG5cblx0Y29uc3RydWN0b3IoXG5cdCAgcmVhZG9ubHkgdmlld0VsZW1lbnQ6IEhUTUxFbGVtZW50LCBcblx0ICByZWFkb25seSBjYW52YXNWaWV3OiBDYW52YXNWaWV3LFxuXHQgIHJlYWRvbmx5IGltYWdlQ29udHJvbGxlcjogSW1hZ2VDb250cm9sbGVyXG5cdCl7fVxuXHRcblx0c2V0RWxlbWVudHMoY2FudmFzRWxlbWVudHM6IEFycmF5PENhbnZhc0xheWVyPik6IHZvaWQge1xuXHRcdHRoaXMuY2xlYXIoKTtcblx0XHRcblx0XHRmb3IgKGxldCBjYW52YXNMYXllciBvZiBjYW52YXNFbGVtZW50cyl7XG5cdFx0XHRsZXQgbGF5ZXJWaWV3ID0gbmV3IENhbnZhc0xheWVyVmlldyhjYW52YXNMYXllciwgdGhpcy5jYW52YXNWaWV3LCBcblx0XHRcdFx0dGhpcy5pbWFnZUNvbnRyb2xsZXIpO1xuXHRcdFx0dGhpcy52aWV3RWxlbWVudC5hcHBlbmRDaGlsZChsYXllclZpZXcuY29udGFpbmVyKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGNsZWFyKCk6IGJvb2xlYW4ge1xuXHRcdGxldCBjaGlsZHJlbiA9IHRoaXMudmlld0VsZW1lbnQuY2hpbGRyZW47XG5cdFx0bGV0IGluaXRpYWxMZW5ndGggPSBjaGlsZHJlbi5sZW5ndGg7XG5cblx0XHR3aGlsZSAoY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuXHRcdFx0Y2hpbGRyZW5bMF0ucmVtb3ZlKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxufSIsImltcG9ydCB7IENvbnRhaW5lckxheWVyIH0gZnJvbSBcIi4uL2dyYXBoaWNzL2xheWVyXCI7XG5pbXBvcnQgeyBDb250YWluZXJMYXllck1hbmFnZXIgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvbGF5ZXJtYW5hZ2VyXCI7XG5pbXBvcnQgeyBDYW52YXNWaWV3IH0gZnJvbSBcIi4uL2dyYXBoaWNzL2NhbnZhc3ZpZXdcIjtcblxuZXhwb3J0IGNsYXNzIExheWVyQ29udHJvbGxlciB7XG5cblx0cHJpdmF0ZSBtb2Q6IHN0cmluZyA9IFwiaVwiO1xuXG5cdGNvbnN0cnVjdG9yKGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcsIHJlYWRvbmx5IGNvbnRhaW5lckxheWVyTWFuYWdlcjogQ29udGFpbmVyTGF5ZXJNYW5hZ2VyKXtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5wcmVzc2VkKGNhbnZhc1ZpZXcsIGUgIGFzIEtleWJvYXJkRXZlbnQpKTtcblx0fVxuXG5cdHByZXNzZWQoY2FudmFzVmlldzogQ2FudmFzVmlldywgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgICAgICAgICAgY2FzZSB0aGlzLm1vZDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInRvZ2dsZSB2aXNpYmxlXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29udGFpbmVyTGF5ZXJNYW5hZ2VyLnRvZ2dsZVZpc2liaWxpdHkoZmFsc2UpO1xuICAgICAgICAgICAgICAgIGNhbnZhc1ZpZXcuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgVmlld1RyYW5zZm9ybSB9IGZyb20gXCIuLi9ncmFwaGljcy92aWV3XCI7XG5pbXBvcnQgeyBDYW52YXNWaWV3IH0gZnJvbSBcIi4uL2dyYXBoaWNzL2NhbnZhc3ZpZXdcIjtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE1vdXNlQ29udHJvbGxlciB7XG5cbiAgICBtb3VzZVBvc2l0aW9uKGV2ZW50OiBNb3VzZUV2ZW50LCB3aXRoaW46IEhUTUxFbGVtZW50KTogQXJyYXk8bnVtYmVyPiB7XG4gICAgICAgIGxldCBtX3Bvc3ggPSBldmVudC5jbGllbnRYICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0XG4gICAgICAgICAgICAgICAgICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQ7XG4gICAgICAgIGxldCBtX3Bvc3kgPSBldmVudC5jbGllbnRZICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3BcbiAgICAgICAgICAgICAgICAgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuXG4gICAgICAgIHZhciBlX3Bvc3ggPSAwO1xuICAgICAgICB2YXIgZV9wb3N5ID0gMDtcblxuICAgICAgICBpZiAod2l0aGluLm9mZnNldFBhcmVudCl7XG4gICAgICAgICAgICBkbyB7IFxuICAgICAgICAgICAgICAgIGVfcG9zeCArPSB3aXRoaW4ub2Zmc2V0TGVmdDtcbiAgICAgICAgICAgICAgICBlX3Bvc3kgKz0gd2l0aGluLm9mZnNldFRvcDtcbiAgICAgICAgICAgIH0gd2hpbGUgKHdpdGhpbiA9IDxIVE1MRWxlbWVudD53aXRoaW4ub2Zmc2V0UGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBbbV9wb3N4IC0gZV9wb3N4LCBtX3Bvc3kgLSBlX3Bvc3ldO1xuICAgIH1cblxufVxuXG5leHBvcnQgY2xhc3MgVmlld0NvbnRyb2xsZXIgZXh0ZW5kcyBNb3VzZUNvbnRyb2xsZXIge1xuXG5cdHJlY29yZDogYm9vbGVhbjtcblx0bW92ZTogbnVtYmVyID0gMTtcblxuXHRwcml2YXRlIHhQcmV2aW91czogbnVtYmVyO1xuXHRwcml2YXRlIHlQcmV2aW91czogbnVtYmVyO1xuXG5cdGNvbnN0cnVjdG9yKHZpZXdUcmFuc2Zvcm06IFZpZXdUcmFuc2Zvcm0sIFxuICAgICAgICByZWFkb25seSBkcmFnRWxlbWVudDogSFRNTEVsZW1lbnQsIHJlYWRvbmx5IGNhbnZhc1ZpZXc6IENhbnZhc1ZpZXcpIHtcblxuICAgIFx0c3VwZXIoKTtcbiAgICBcdGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3VHJhbnNmb3JtKSk7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybSkpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3VHJhbnNmb3JtKSk7XG4gICAgICAgIGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMucmVjb3JkID0gZmFsc2UpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmNsaWNrZWQoZSBhcyBNb3VzZUV2ZW50LCBjYW52YXNWaWV3LCAxLjIpKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIndoZWVsXCIsIChlOiBFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLndoZWVsKGUgYXMgV2hlZWxFdmVudCwgY2FudmFzVmlldykpO1xuICAgIH1cblxuICAgIGNsaWNrZWQoZXZlbnQ6IE1vdXNlRXZlbnQsIHZpZXdUcmFuc2Zvcm06IFZpZXdUcmFuc2Zvcm0sIHpvb21CeTogbnVtYmVyKXtcbiAgICBcdHN3aXRjaChldmVudC50eXBlKXtcbiAgICBcdFx0Y2FzZSBcImRibGNsaWNrXCI6XG4gICAgICAgICAgICAgICAgLy8gaWYgIChldmVudC5jdHJsS2V5KSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHpvb21CeSA9IDEgLyB6b29tQnk7XG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIGxldCBtWFkgPSB0aGlzLm1vdXNlUG9zaXRpb24oZXZlbnQsIHRoaXMuZHJhZ0VsZW1lbnQpO1xuXG4gICAgICAgICAgICAgICAgLy8gdGhpcy5jYW52YXNWaWV3Lnpvb21BYm91dChtWFlbMF0sIG1YWVsxXSwgem9vbUJ5KTtcblxuICAgICAgICAgICAgICAgIC8vIHRoaXMuY2FudmFzVmlldy5kcmF3KCk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHJhZ2dlZChldmVudDogTW91c2VFdmVudCwgdmlld1RyYW5zZm9ybTogVmlld1RyYW5zZm9ybSkge1xuXG4gICAgXHRzd2l0Y2goZXZlbnQudHlwZSl7XG4gICAgXHRcdGNhc2UgXCJtb3VzZWRvd25cIjpcbiAgICBcdFx0XHR0aGlzLnJlY29yZCA9IHRydWU7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJtb3VzZXVwXCI6XG4gICAgXHRcdFx0dGhpcy5yZWNvcmQgPSBmYWxzZTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0ZGVmYXVsdDpcbiAgICBcdFx0XHRpZiAodGhpcy5yZWNvcmQpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgeERlbHRhID0gKGV2ZW50LmNsaWVudFggLSB0aGlzLnhQcmV2aW91cykgLyB0aGlzLm1vdmUgLyB2aWV3VHJhbnNmb3JtLnpvb21YO1xuICAgICAgICAgICAgICAgICAgICBsZXQgeURlbHRhID0gKGV2ZW50LmNsaWVudFkgLSB0aGlzLnlQcmV2aW91cykgLyB0aGlzLm1vdmUgLyB2aWV3VHJhbnNmb3JtLnpvb21ZO1xuXG4gICAgICAgICAgICAgICAgICAgIHZpZXdUcmFuc2Zvcm0ueCA9IHZpZXdUcmFuc2Zvcm0ueCAtIHhEZWx0YTtcbiAgICAgICAgICAgICAgICAgICAgdmlld1RyYW5zZm9ybS55ID0gdmlld1RyYW5zZm9ybS55IC0geURlbHRhO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy5kcmF3KCk7XG4gICAgXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnhQcmV2aW91cyA9IGV2ZW50LmNsaWVudFg7XG5cdFx0XHR0aGlzLnlQcmV2aW91cyA9IGV2ZW50LmNsaWVudFk7XG4gICAgXHR9XG4gICAgfVxuXG4gICAgd2hlZWwoZXZlbnQ6IFdoZWVsRXZlbnQsIHZpZXdUcmFuc2Zvcm06IFZpZXdUcmFuc2Zvcm0pIHtcblxuICAgICAgICAvL2NvbnNvbGUubG9nKFwid2hlZWxcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LnR5cGUpO1xuXG4gICAgICAgIGxldCB4RGVsdGEgPSBldmVudC5kZWx0YVggLyB0aGlzLm1vdmUgLyB2aWV3VHJhbnNmb3JtLnpvb21YO1xuICAgICAgICBsZXQgeURlbHRhID0gZXZlbnQuZGVsdGFZIC8gdGhpcy5tb3ZlIC8gdmlld1RyYW5zZm9ybS56b29tWTtcblxuICAgICAgICBpZiAgKGV2ZW50LmN0cmxLZXkpIHtcbiAgICAgICAgICAgIGxldCBtWFkgPSB0aGlzLm1vdXNlUG9zaXRpb24oZXZlbnQsIHRoaXMuZHJhZ0VsZW1lbnQpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGJ5ID0gMS4wNTtcbiAgICAgICAgICAgIGlmICh5RGVsdGEgPCAwKXtcbiAgICAgICAgICAgICAgICBieSA9IDAuOTU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy56b29tQWJvdXQobVhZWzBdLCBtWFlbMV0sIGJ5KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy54ID0gIHRoaXMuY2FudmFzVmlldy54ICsgeERlbHRhO1xuICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3LnkgPSAgdGhpcy5jYW52YXNWaWV3LnkgKyB5RGVsdGE7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuY2FudmFzVmlldy5kcmF3KCk7XG4gICAgfVxuXG59XG4iLCJleHBvcnQgaW50ZXJmYWNlIExvZ2dlciB7XG5cdGxvZyhpbmZvOiBzdHJpbmcpOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgRWxlbWVudExvZ2dlciBpbXBsZW1lbnRzIExvZ2dlciB7XG5cblx0Y29uc3RydWN0b3IocmVhZG9ubHkgZGlzcGxheUVsZW1lbnQ6IEhUTUxFbGVtZW50KXt9XG5cblx0bG9nKGluZm86IHN0cmluZyk6IHZvaWQge1xuXHRcdHRoaXMuZGlzcGxheUVsZW1lbnQuaW5uZXJUZXh0ID0gaW5mbztcblx0fVxuXG59XG5cbmV4cG9ydCBjbGFzcyBDb25zb2xlTG9nZ2VyIGltcGxlbWVudHMgTG9nZ2VyIHtcblxuXHRsb2coaW5mbzogc3RyaW5nKTogdm9pZCB7XG5cdFx0Y29uc29sZS5sb2coaW5mbyk7XG5cdH1cblxufSIsImltcG9ydCB7IENhbnZhc1ZpZXcgfSBmcm9tIFwiLi9ncmFwaGljcy9jYW52YXN2aWV3XCI7XG5pbXBvcnQgeyBTdGF0aWNJbWFnZSB9IGZyb20gXCIuL2dyYXBoaWNzL3N0YXRpY1wiO1xuaW1wb3J0IHsgQ29udGFpbmVyTGF5ZXIgfSBmcm9tIFwiLi9ncmFwaGljcy9sYXllclwiO1xuaW1wb3J0IHsgQmFzaWNUcmFuc2Zvcm0gfSBmcm9tIFwiLi9ncmFwaGljcy92aWV3XCI7XG5pbXBvcnQgeyBTdGF0aWNHcmlkIH0gZnJvbSBcIi4vZ3JhcGhpY3MvZ3JpZFwiO1xuaW1wb3J0IHsgWm9vbURpc3BsYXlSYW5nZSB9IGZyb20gXCIuL2dyYXBoaWNzL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IFRpbGVMYXllciwgVGlsZVN0cnVjdCwgem9vbUJ5TGV2ZWx9IGZyb20gXCIuL2dyYXBoaWNzL3RpbGVsYXllclwiO1xuaW1wb3J0IHsgTGF5ZXJNYW5hZ2VyLCBDb250YWluZXJMYXllck1hbmFnZXIsIGRhdGVGaWx0ZXIsIGRhdGVsZXNzRmlsdGVyIH0gZnJvbSBcbiAgXCIuL2dyYXBoaWNzL2xheWVybWFuYWdlclwiO1xuXG5pbXBvcnQgeyBJbmRleENvbnRyb2xsZXIgfSBmcm9tIFwiLi9pbnRlcmZhY2UvaW5kZXhjb250cm9sbGVyXCI7XG5pbXBvcnQgeyBWaWV3Q29udHJvbGxlciB9IGZyb20gXCIuL2ludGVyZmFjZS92aWV3Y29udHJvbGxlclwiO1xuaW1wb3J0IHsgSW1hZ2VDb250cm9sbGVyLCBEaXNwbGF5RWxlbWVudENvbnRyb2xsZXIgfSBmcm9tIFwiLi9pbnRlcmZhY2UvaW1hZ2Vjb250cm9sbGVyXCI7XG5pbXBvcnQgeyBMYXllckNvbnRyb2xsZXIgfSBmcm9tIFwiLi9pbnRlcmZhY2UvbGF5ZXJjb250cm9sbGVyXCI7XG5cbmltcG9ydCB7IEdyaWRJbmRleGVyIH0gZnJvbSBcIi4vaW5kZXgvZ3JpZGluZGV4ZXJcIjtcbmltcG9ydCB7IENvbnRhaW5lckluZGV4IH0gZnJvbSBcIi4vaW5kZXgvY29udGFpbmVyaW5kZXhcIjtcbmltcG9ydCB7IEVsZW1lbnRMb2dnZXIgfSBmcm9tIFwiLi9sb2dnaW5nL2xvZ2dlclwiO1xuXG5pbXBvcnQgKiBhcyBmaXJlbWFwcyBmcm9tIFwiLi9pbWFnZWdyb3Vwcy9maXJlbWFwc2FiLmpzb25cIjtcblxubGV0IGxheWVyU3RhdGUgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgMSwgMSwgMCk7XG5sZXQgaW1hZ2VMYXllciA9IG5ldyBDb250YWluZXJMYXllcihsYXllclN0YXRlKTtcblxubGV0IGltYWdlU3RhdGUgPSBuZXcgQmFzaWNUcmFuc2Zvcm0oLTE0NDAsLTE0NDAsIDAuMjIyLCAwLjIyMiwgMCk7XG5cbmxldCBiZ1N0YXRlID0gbmV3IEJhc2ljVHJhbnNmb3JtKC0xMTI2LC0xMDg2LCAxLjU4LCAxLjU1LCAwKTtcbmxldCBiZ0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKGJnU3RhdGUsIFwiaHR0cHM6Ly9naXRodWIuY29tL2lsbG1hZGUvdHlwZW1hcC90cmVlL21hc3Rlci9kaXN0L2ltYWdlcy9mbXNzLmpwZWdcIiwgLjYsIHRydWUpO1xuXG5sZXQgZ3JpZFRyYW5zZm9ybSA9IEJhc2ljVHJhbnNmb3JtLnVuaXRUcmFuc2Zvcm07XG4vLyBuZXcgQmFzaWNUcmFuc2Zvcm0oMCwgMCwgMSwgMSwgMCk7XG5sZXQgc3RhdGljR3JpZCA9IG5ldyBTdGF0aWNHcmlkKGdyaWRUcmFuc2Zvcm0sIDAsIGZhbHNlLCAyNTYsIDI1Nik7XG5cbmxldCBlZGl0Q29udGFpbmVyTGF5ZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXIoQmFzaWNUcmFuc2Zvcm0udW5pdFRyYW5zZm9ybSk7XG5cbmltYWdlTGF5ZXIuc2V0KFwiYmFja2dyb3VuZFwiLCBiZ0ltYWdlKTtcblxubGV0IGxheWVyTWFuYWdlciA9IG5ldyBMYXllck1hbmFnZXIoKTtcblxubGV0IGZpcmVtYXBMYXllciA9IGxheWVyTWFuYWdlci5hZGRMYXllcihmaXJlbWFwcywgXCJmaXJlbWFwc1wiKTtcblxubGV0IGVkaXQgPSBmaXJlbWFwTGF5ZXIuZ2V0KFwiM1wiKTtcblxubGV0IGZpcmVJbmRleCA9IG5ldyBDb250YWluZXJJbmRleChmaXJlbWFwTGF5ZXIsIFwiZmlyZW1hcHNcIik7XG5cbmxldCBjb250YWluZXJMYXllck1hbmFnZXIgPSBuZXcgQ29udGFpbmVyTGF5ZXJNYW5hZ2VyKGZpcmVtYXBMYXllciwgZWRpdENvbnRhaW5lckxheWVyKTtcbmxldCBvdXRsaW5lTGF5ZXIgPSBjb250YWluZXJMYXllck1hbmFnZXIuc2V0U2VsZWN0ZWQoXCIzXCIpO1xuXG5pbWFnZUxheWVyLnNldChcImZpcmVtYXBzXCIsIGZpcmVtYXBMYXllcik7XG5cbmZpcmVtYXBMYXllci5zZXRUb3AoXCIzXCIpO1xuXG5mdW5jdGlvbiBzaG93TWFwKGRpdk5hbWU6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpdk5hbWUpO1xuXG4gICAgY29uc3QgaW5mbyA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVkaXRfaW5mb1wiKTtcblxuICAgIGNvbnN0IGxheWVycyA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxheWVyc1wiKTtcblxuICAgIGxldCB4ID0gb3V0bGluZUxheWVyLng7XG4gICAgbGV0IHkgPSBvdXRsaW5lTGF5ZXIueTtcblxuICAgIGxldCBjYW52YXNUcmFuc2Zvcm0gPSBuZXcgQmFzaWNUcmFuc2Zvcm0oeCAtIDIwMCwgeSAtIDIwMCwgMC41LCAwLjUsIDApO1xuICAgIGxldCBjYW52YXNWaWV3ID0gbmV3IENhbnZhc1ZpZXcoY2FudmFzVHJhbnNmb3JtLCBjYW52YXMuY2xpZW50V2lkdGgsIGNhbnZhcy5jbGllbnRIZWlnaHQsIGNhbnZhcyk7XG5cbiAgICBjYW52YXNWaWV3LmxheWVycy5wdXNoKGltYWdlTGF5ZXIpO1xuICAgIGNhbnZhc1ZpZXcubGF5ZXJzLnB1c2goc3RhdGljR3JpZCk7XG4gICAgY2FudmFzVmlldy5sYXllcnMucHVzaChlZGl0Q29udGFpbmVyTGF5ZXIpO1xuXG4gICAgbGV0IGZpcmVtYXBDb250cm9sbGVyID0gbmV3IERpc3BsYXlFbGVtZW50Q29udHJvbGxlcihjYW52YXNWaWV3LCBmaXJlbWFwTGF5ZXIsIFwiYlwiKTtcbiAgICBsZXQgZ3JpZENvbnRyb2xsZXIgPSBuZXcgRGlzcGxheUVsZW1lbnRDb250cm9sbGVyKGNhbnZhc1ZpZXcsIHN0YXRpY0dyaWQsIFwiZ1wiKTtcblxuICAgIGxldCBjb250cm9sbGVyID0gbmV3IFZpZXdDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGNhbnZhcywgY2FudmFzVmlldyk7XG5cbiAgICBsZXQgaW1hZ2VDb250cm9sbGVyID0gbmV3IEltYWdlQ29udHJvbGxlcihjYW52YXNWaWV3LCBlZGl0KTtcblxuICAgIGltYWdlQ29udHJvbGxlci5zZXRMYXllck91dGxpbmUob3V0bGluZUxheWVyKTtcblxuICAgIGltYWdlQ29udHJvbGxlci5zZXRFZGl0SW5mb1BhbmUoaW5mbyk7XG5cbiAgICBsZXQgbGF5ZXJDb250cm9sbGVyID0gbmV3IExheWVyQ29udHJvbGxlcihjYW52YXNWaWV3LCBjb250YWluZXJMYXllck1hbmFnZXIpO1xuXG4gICAgZHJhd01hcChjYW52YXNWaWV3KTtcblxuICAgIGxldCBsb2dnZXIgPSBuZXcgRWxlbWVudExvZ2dlcihpbmZvKTtcblxuICAgIGxldCBpbmRleENvbnRyb2xsZXIgPSBuZXcgSW5kZXhDb250cm9sbGVyKGNhbnZhc1ZpZXcsIGltYWdlQ29udHJvbGxlcik7XG4gICAgaW5kZXhDb250cm9sbGVyLmFkZEluZGV4ZXIoZmlyZUluZGV4KTtcblxuICAgIGluZGV4Q29udHJvbGxlci5zZXRNZW51KGxheWVycyk7XG5cbn1cblxuZnVuY3Rpb24gZHJhd01hcChjYW52YXNWaWV3OiBDYW52YXNWaWV3KXtcbiAgICBpZiAoIWNhbnZhc1ZpZXcuZHJhdygpICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkluIHRpbWVvdXRcIik7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgZHJhd01hcChjYW52YXNWaWV3KX0sIDUwMCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzaG93KCl7XG4gICAgc2hvd01hcChcImNhbnZhc1wiLCBcIlR5cGVTY3JpcHRcIik7XG59XG5cbmlmIChcbiAgICBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgfHxcbiAgICAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gXCJsb2FkaW5nXCIgJiYgIWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5kb1Njcm9sbClcbikge1xuICAgIHNob3coKTtcbn0gZWxzZSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgc2hvdyk7XG59Il19
