(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Point2D = /** @class */ (function () {
    function Point2D(x, y) {
        this.x = x;
        this.y = y;
    }
    Point2D.prototype.toString = function () {
        return "Point2D(" + this.x + ", " + this.y + ")";
    };
    Point2D.zero = new Point2D(0, 0);
    Point2D.one = new Point2D(1, 1);
    return Point2D;
}());
exports.Point2D = Point2D;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TileLayer = /** @class */ (function () {
    function TileLayer(widthMapUnits, heightMapUnits) {
        this.widthMapUnits = widthMapUnits;
        this.heightMapUnits = heightMapUnits;
    }
    TileLayer.prototype.getTiles = function (position, xMapUnits, yMapUnits) {
        var firstX = Math.floor(position.x / this.widthMapUnits);
        var lastX = Math.ceil((position.x + xMapUnits) / this.widthMapUnits);
        var firstY = Math.floor(position.y / this.heightMapUnits);
        var lastY = Math.ceil((position.y + yMapUnits) / this.heightMapUnits);
        var tiles = new Array();
        for (var x = firstX; x < lastX; x++) {
            for (var y = firstY; y < lastY; y++) {
                tiles.push(this.getTile(x, y));
            }
        }
        return tiles;
    };
    return TileLayer;
}());
exports.TileLayer = TileLayer;
var Tile = /** @class */ (function () {
    function Tile(xIndex, yIndex) {
    }
    Tile.emptyTile = new Tile(-1, -1);
    return Tile;
}());
exports.Tile = Tile;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var point2d_1 = require("./point2d");
var Viewport = /** @class */ (function () {
    function Viewport(topLeft, widthMapUnits, heightMapUnits) {
        this.topLeft = topLeft;
        this.widthMapUnits = widthMapUnits;
        this.heightMapUnits = heightMapUnits;
        console.log("w h" + widthMapUnits + ", " + heightMapUnits);
    }
    Viewport.prototype.moveView = function (topLeft) {
        this.topLeft = topLeft;
    };
    Viewport.prototype.zoomView = function (zoom) {
        var newWidth = this.widthMapUnits * zoom;
        var newHeight = this.heightMapUnits * zoom;
        var moveX = (this.widthMapUnits - newWidth) / 2;
        var moveY = (this.heightMapUnits - newHeight) / 2;
        this.topLeft = new point2d_1.Point2D(this.topLeft.x + moveX, this.topLeft.y + moveY);
        this.widthMapUnits = newWidth;
        this.heightMapUnits = newHeight;
    };
    Viewport.prototype.zoomAbout = function (xRelative, yRelative, zoom) {
        var xDiff = 0.5 - xRelative;
        var yDiff = 0.5 - yRelative;
        var xMove = xDiff * this.widthMapUnits;
        var yMove = yDiff * this.heightMapUnits;
        this.topLeft = new point2d_1.Point2D(this.topLeft.x - xMove, this.topLeft.y - yMove);
        this.zoomView(zoom);
        xMove = xDiff * this.widthMapUnits;
        yMove = yDiff * this.heightMapUnits;
        this.topLeft = new point2d_1.Point2D(this.topLeft.x + xMove, this.topLeft.y + yMove);
    };
    Viewport.prototype.getDimensions = function () {
        return new point2d_1.Point2D(this.widthMapUnits, this.heightMapUnits);
    };
    return Viewport;
}());
exports.Viewport = Viewport;

},{"./point2d":1}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Units = /** @class */ (function () {
    function Units(name) {
    }
    Units.WebWU = new Units("Mercator Web World Units");
    return Units;
}());
exports.Units = Units;
/**
  A world is the base that all other elements orientate from
**/
var World2D = /** @class */ (function () {
    function World2D() {
        this.tileLayers = [];
    }
    World2D.prototype.addTileLayer = function (tileLayer) {
        return this.tileLayers.push(tileLayer);
    };
    return World2D;
}());
exports.World2D = World2D;

},{}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var tile_1 = require("../geom/tile");
var CanvasTile = /** @class */ (function (_super) {
    __extends(CanvasTile, _super);
    function CanvasTile() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CanvasTile;
}(tile_1.Tile));
exports.CanvasTile = CanvasTile;
var ImageStruct = /** @class */ (function () {
    function ImageStruct() {
        this.prefix = "";
        this.suffix = "";
        this.tileDir = "images/";
        this.visible = true;
        this.tileWidthPx = 256;
        this.tileHeightPx = 256;
        this.widthMapUnits = 1;
        this.heightMapUnits = 1;
    }
    return ImageStruct;
}());
exports.ImageStruct = ImageStruct;
var ImageTile = /** @class */ (function (_super) {
    __extends(ImageTile, _super);
    function ImageTile(xIndex, yIndex, imageSrc) {
        var _this = _super.call(this, xIndex, yIndex) || this;
        _this.xIndex = xIndex;
        _this.yIndex = yIndex;
        _this.img = new Image();
        _this.img.src = imageSrc;
        return _this;
    }
    ;
    ImageTile.prototype.drawImage = function (ctx, canvasX, canvasY) {
        ctx.drawImage(this.img, canvasX, canvasY);
    };
    ImageTile.prototype.draw = function (ctx, canvasX, canvasY) {
        var _this = this;
        if (this.img.complete) {
            this.drawImage(ctx, canvasX, canvasY);
        }
        else {
            this.img.onload = function (event) {
                _this.img.crossOrigin = "Anonymous";
                _this.drawImage(ctx, canvasX, canvasY);
            };
        }
    };
    ;
    return ImageTile;
}(CanvasTile));
exports.ImageTile = ImageTile;
var StaticImage = /** @class */ (function () {
    function StaticImage(xIndex, yIndex, scalingX, scalingY, rotation, imageSrc, alpha) {
        this.xIndex = xIndex;
        this.yIndex = yIndex;
        this.scalingX = scalingX;
        this.scalingY = scalingY;
        this.rotation = rotation;
        this.alpha = alpha;
        this.img = new Image();
        this.img.src = imageSrc;
    }
    ;
    StaticImage.prototype.drawImage = function (ctx, canvasX, canvasY) {
        //scalingX = scalingX * this.scaling;
        //scalingY = scalingY * this.scaling;
        // let cosX = Math.cos(this.rotation);
        // let sinX = Math.sin(this.rotation);
        ctx.translate(canvasX, canvasY);
        ctx.rotate(this.rotation);
        ctx.scale(this.scalingX, this.scalingY);
        //console.log("xyScaling " + this.scalingX + ", " + this.scalingY);
        ctx.globalAlpha = this.alpha;
        // ctx.transform(cosX * scalingX, sinX * scalingY, -sinX * scalingX, cosX * scalingY, 
        // 	canvasX / this.scaling, canvasY / this.scaling);
        ctx.drawImage(this.img, -(this.img.width / 2), -(this.img.height / 2));
        ctx.scale(1 / this.scalingX, 1 / this.scalingY);
        ctx.rotate(-this.rotation);
        ctx.translate(-canvasX, -canvasY);
        ctx.globalAlpha = 1;
    };
    StaticImage.prototype.draw = function (ctx, canvasX, canvasY) {
        var _this = this;
        if (this.img.complete) {
            this.drawImage(ctx, canvasX, canvasY);
        }
        else {
            this.img.onload = function (event) {
                _this.img.crossOrigin = "Anonymous";
                _this.drawImage(ctx, canvasX, canvasY);
            };
        }
    };
    ;
    return StaticImage;
}());
exports.StaticImage = StaticImage;
var ImageTileLayer = /** @class */ (function (_super) {
    __extends(ImageTileLayer, _super);
    function ImageTileLayer(imageProperties) {
        var _this = _super.call(this, imageProperties.widthMapUnits, imageProperties.heightMapUnits) || this;
        _this.imageProperties = imageProperties;
        return _this;
    }
    /**
      leave caching up to the browser
    **/
    ImageTileLayer.prototype.getTile = function (xUnits, yUnits) {
        var imageSrc = this.imageProperties.tileDir +
            this.imageProperties.prefix + xUnits + "_" + yUnits + this.imageProperties.suffix;
        return new ImageTile(xUnits, yUnits, imageSrc);
    };
    return ImageTileLayer;
}(tile_1.TileLayer));
exports.ImageTileLayer = ImageTileLayer;

},{"../geom/tile":2}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GridLayer = /** @class */ (function () {
    function GridLayer(ctx, gridSpacing) {
        this.ctx = ctx;
        this.gridSpacing = gridSpacing;
    }
    GridLayer.prototype.setGridSpacing = function (gridSpacing) {
        this.gridSpacing = gridSpacing;
    };
    /**
      leave caching up to the browser
    **/
    GridLayer.prototype.draw = function (topLeft, width, height) {
        var minX = Math.floor(topLeft.x);
        var minY = Math.floor(topLeft.y);
        this.ctx.translate(-256 * topLeft.x, -256 * topLeft.y);
        //console.log("mins " + width + ", " + height);
        var lastX = Math.ceil(topLeft.x + width);
        var lastY = Math.ceil(topLeft.y + height);
        this.ctx.strokeStyle = 'blue';
        this.ctx.font = '48px serif';
        var yZero = minY * this.gridSpacing * 256;
        var yMax = lastY * this.gridSpacing * 256;
        var xJump = this.gridSpacing * 256;
        var xZero = minX * this.gridSpacing * 256;
        var xMax = lastX * this.gridSpacing * 256;
        var yJump = this.gridSpacing * 256;
        this.ctx.beginPath();
        //this.ctx.clearRect(xZero, yZero, xMax, yMax);
        for (var x = minX; x < lastX; x++) {
            //console.log("at " + minX);
            var xMove = x * xJump;
            this.ctx.moveTo(xMove, yZero);
            this.ctx.lineTo(xMove, yMax);
        }
        for (var y = minY; y < lastY; y++) {
            var yMove = y * yJump;
            this.ctx.moveTo(xZero, yMove);
            this.ctx.lineTo(xMax, yMove);
            for (var x = minX; x < lastX; x++) {
                var xMove = (x - 0.5) * xJump;
                yMove = (y - 0.5) * yJump;
                var text = "" + (x - 1) + ", " + (y - 1);
                this.ctx.fillText(text, xMove, yMove);
            }
        }
        this.ctx.stroke();
        this.ctx.translate(256 * topLeft.x, 256 * topLeft.y);
    };
    return GridLayer;
}());
exports.GridLayer = GridLayer;

},{}],7:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var viewport_1 = require("../geom/viewport");
var point2d_1 = require("../geom/point2d");
var grid_1 = require("./grid");
var ViewCanvas = /** @class */ (function (_super) {
    __extends(ViewCanvas, _super);
    function ViewCanvas(topLeft, widthMapUnits, heightMapUnits, ctx) {
        var _this = _super.call(this, topLeft, widthMapUnits, heightMapUnits) || this;
        _this.ctx = ctx;
        _this.staticElements = [];
        _this.imageTileLayers = [];
        _this.width = ctx.canvas.clientWidth;
        _this.height = ctx.canvas.clientHeight;
        _this.ctx.canvas.width = _this.width;
        _this.ctx.canvas.height = _this.height;
        console.log("onscreen " + _this.ctx.canvas.width + ", " + _this.ctx.canvas.height);
        //const c = document.createElement("canvas");
        var c = document.getElementById("offscreen");
        c.width = _this.width;
        c.height = _this.height;
        _this.offscreen = c.getContext("2d");
        console.log("offscreen " + _this.ctx.canvas.clientWidth);
        _this.gridLayer = new grid_1.GridLayer(_this.ctx, 1);
        return _this;
    }
    ViewCanvas.prototype.addTileLayer = function (imageTileLayer) {
        this.imageTileLayers.push(imageTileLayer);
    };
    ViewCanvas.prototype.addStaticElement = function (staticImage) {
        this.staticElements.push(staticImage);
    };
    ViewCanvas.prototype.getViewScaling = function (pixelsPerUnit) {
        var dimension = this.getDimensions();
        var viewScalingX = this.ctx.canvas.clientWidth / dimension.x / pixelsPerUnit;
        var viewScalingY = this.ctx.canvas.clientHeight / dimension.y / pixelsPerUnit;
        return new point2d_1.Point2D(viewScalingX, viewScalingY);
    };
    ViewCanvas.prototype.scale = function (pixelsPerUnit, dimension, reverse) {
        var viewScaling = this.getViewScaling(pixelsPerUnit);
        if (reverse) {
            this.ctx.scale(1 / viewScaling.x, 1 / viewScaling.y);
        }
        else {
            this.ctx.scale(viewScaling.x, viewScaling.y);
        }
    };
    ViewCanvas.prototype.draw = function () {
        var dimension = this.getDimensions();
        var localContext = this.ctx;
        localContext.clearRect(0, 0, this.width, this.height);
        for (var _i = 0, _a = this.imageTileLayers; _i < _a.length; _i++) {
            var value = _a[_i];
            if (value.imageProperties.visible) {
                this.scale(value.imageProperties.tileWidthPx, dimension, false);
                var tileScalingX = value.imageProperties.tileWidthPx / value.widthMapUnits;
                var tileScalingY = value.imageProperties.tileHeightPx / value.heightMapUnits;
                var tiles = value.getTiles(this.topLeft, dimension.x, dimension.y);
                for (var _b = 0, tiles_1 = tiles; _b < tiles_1.length; _b++) {
                    var tile = tiles_1[_b];
                    var tileX = (tile.xIndex - this.topLeft.x) * tileScalingX;
                    var tileY = (tile.yIndex - this.topLeft.y) * tileScalingY;
                    tile.draw(localContext, tileX, tileY);
                }
                this.scale(value.imageProperties.tileWidthPx, dimension, true);
            }
        }
        for (var _c = 0, _d = this.staticElements; _c < _d.length; _c++) {
            var value = _d[_c];
            //256 px is 1 map unit
            var tileScalingX = 256;
            var tileScalingY = 256;
            this.scale(256, dimension, false);
            var imageX = (value.xIndex - this.topLeft.x) * tileScalingX;
            var imageY = (value.yIndex - this.topLeft.y) * tileScalingY;
            value.draw(localContext, imageX, imageY);
            this.scale(256, dimension, true);
        }
        this.scale(256, dimension, false);
        this.gridLayer.draw(this.topLeft, dimension.x, dimension.y);
        this.scale(256, dimension, true);
        // let imageData: ImageData = localContext.getImageData(0, 0, this.width, this.height);
        // this.ctx.clearRect(0, 0, this.width, this.height);
        // console.log("image data ", imageData);
        // this.ctx.putImageData(imageData, 0, 0);
        this.drawCentre(this.ctx);
    };
    ViewCanvas.prototype.drawCentre = function (context) {
        context.beginPath();
        context.strokeStyle = "red";
        context.moveTo(this.width / 2, 0);
        context.lineTo(this.width / 2, this.height);
        context.moveTo(0, this.height / 2);
        context.lineTo(this.width, this.height / 2);
        context.stroke();
    };
    return ViewCanvas;
}(viewport_1.Viewport));
exports.ViewCanvas = ViewCanvas;

},{"../geom/point2d":1,"../geom/viewport":3,"./grid":6}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var world2d_1 = require("./geom/world2d");
var point2d_1 = require("./geom/point2d");
var canvastile_1 = require("./graphics/canvastile");
var viewcanvas_1 = require("./graphics/viewcanvas");
var mapController_1 = require("./ui/mapController");
var imageController_1 = require("./ui/imageController");
var simpleWorld = new world2d_1.World2D();
// let layerProperties = new ImageStruct();
// layerProperties.prefix = "";
// layerProperties.suffix = ".png";
// let roadLayerProperties = new ImageStruct();
// roadLayerProperties.suffix = "b.png";
// let sentinelLayerProperties = new ImageStruct();
// sentinelLayerProperties.suffix = "l.jpeg";
// let sentinelTerrainLayerProperties = new ImageStruct();
// sentinelTerrainLayerProperties.suffix = "t.jpeg";
var liffeyLayerProperties = new canvastile_1.ImageStruct();
liffeyLayerProperties.suffix = "liffey.jpeg";
liffeyLayerProperties.tileDir = "images/liffey/";
var liffeyLabelLayerProperties = new canvastile_1.ImageStruct();
liffeyLabelLayerProperties.suffix = "liffey.png";
liffeyLabelLayerProperties.tileDir = "images/liffey/";
liffeyLabelLayerProperties.visible = true;
// let baseLayer = new ImageTileLayer(layerProperties);
// let sentinelLayer = new ImageTileLayer(sentinelLayerProperties);
// let roadLayer = new ImageTileLayer(roadLayerProperties);
// let terrainLayer = new ImageTileLayer(sentinelTerrainLayerProperties);
var liffeySentinelLayer = new canvastile_1.ImageTileLayer(liffeyLayerProperties);
var liffeyLabelLayer = new canvastile_1.ImageTileLayer(liffeyLabelLayerProperties);
var dolierImage = new canvastile_1.StaticImage(2.24, 1.87, .43, .43, -0.06, "images/maps_145_b_4_(2)_f017R[SVC2].jpg", .7);
var trinityImage = new canvastile_1.StaticImage(1.99, 3.59, .43, .43, 0.15, "images/maps_145_b_4_(2)_f019R[SVC2].jpg", .7);
var poolbegImage = new canvastile_1.StaticImage(3.34, 1.625, .405, .43, 0.05, "images/maps_145_b_4_(2)_f018R[SVC2].jpg", .7);
var abbeyImage = new canvastile_1.StaticImage(2.39, 0.035, .415, .435, -.25, "images/maps_145_b_4_(2)_f008r[SVC2].jpg", .7);
var busarasImage = new canvastile_1.StaticImage(3.49, -0.24, .41, .425, -.26, "images/maps_145_b_4_(2)_f009r[SVC2].jpg", .7);
var lowerabbeyImage = new canvastile_1.StaticImage(1.295, 0.3776, .425, .435, -.23, "images/maps_145_b_4_(2)_f007r[SVC2].jpg", 0.7);
var dameImage = new canvastile_1.StaticImage(0.98, 2.315, .41, .428, -0.095, "images/maps_145_b_4_(2)_f016r_2[SVC2].jpg", 0.7);
var customImage = new canvastile_1.StaticImage(5.21, -.245, .42, .44, 0.03, "images/maps_145_b_4_(2)_f010r_2[SVC2].jpg", 0.7);
var manorImage = new canvastile_1.StaticImage(6.36, 0.025, .415, .435, 0.11, "images/maps_145_b_4_(2)_f011r[SVC2].jpg", 0.7);
var sackvilleImage = new canvastile_1.StaticImage(1.29, -1.28, .46, .42, -0.265, "images/maps_145_b_4_(2)_f004r[SVC2].jpg", 0.7);
var greatImage = new canvastile_1.StaticImage(.19, -0.705, .4, .42, -.51, "images/maps_145_b_4_(2)_f003r[SVC2].jpg", 0.7);
var lowerormondImage = new canvastile_1.StaticImage(0.16, 0.71, .405, .44, -0.205, "images/maps_145_b_4_(2)_f006r[SVC2].jpg", 0.7);
var stephensImage = new canvastile_1.StaticImage(1.73, 4.935, .415, .42, 0.205, "images/maps_145_b_4_(2)_f020R[SVC2].jpg", 0.7);
var marysImage = new canvastile_1.StaticImage(-1.055, 0.985, .43, .435, -0.21, "images/maps_145_b_4_(2)_f005r[SVC2].jpg", 0.7);
var totalImage = new canvastile_1.StaticImage(4.485, -1.875, 7.465, 7.35, 0, "images/maps_145_b_4_(2)_f001r[SVC2].jpg", .4);
function showMap(divName, name) {
    var canvas = document.getElementById(divName);
    var ctx = canvas.getContext('2d');
    var viewCanvas = new viewcanvas_1.ViewCanvas(new point2d_1.Point2D(-2, -3), 6, 4, ctx);
    // viewCanvas.addTileLayer(baseLayer);
    // viewCanvas.addTileLayer(sentinelLayer);
    viewCanvas.addTileLayer(liffeySentinelLayer);
    viewCanvas.addTileLayer(liffeyLabelLayer);
    viewCanvas.addStaticElement(totalImage);
    viewCanvas.addStaticElement(dolierImage);
    viewCanvas.addStaticElement(trinityImage);
    viewCanvas.addStaticElement(poolbegImage);
    viewCanvas.addStaticElement(abbeyImage);
    viewCanvas.addStaticElement(lowerabbeyImage);
    viewCanvas.addStaticElement(busarasImage);
    viewCanvas.addStaticElement(dameImage);
    viewCanvas.addStaticElement(customImage);
    viewCanvas.addStaticElement(manorImage);
    viewCanvas.addStaticElement(sackvilleImage);
    viewCanvas.addStaticElement(greatImage);
    viewCanvas.addStaticElement(lowerormondImage);
    viewCanvas.addStaticElement(stephensImage);
    viewCanvas.addStaticElement(marysImage);
    var imageController = new imageController_1.ImageController(viewCanvas, marysImage);
    var plus = document.getElementById("plus");
    var minus = document.getElementById("minus");
    var panControl = new mapController_1.PanController(viewCanvas, canvas);
    var canvasControl = new mapController_1.ZoomController(viewCanvas, plus, minus);
    canvasControl.addZoomListener(panControl);
    viewCanvas.draw();
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

},{"./geom/point2d":1,"./geom/world2d":4,"./graphics/canvastile":5,"./graphics/viewcanvas":7,"./ui/imageController":9,"./ui/mapController":10}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ImageController = /** @class */ (function () {
    function ImageController(viewCanvas, staticImage) {
        var _this = this;
        this.staticImage = staticImage;
        document.addEventListener("keypress", function (e) {
            return _this.pressed(viewCanvas, e);
        });
    }
    ImageController.prototype.pressed = function (viewCanvas, event) {
        console.log("pressed" + event.target + ", " + event.key);
        switch (event.key) {
            case "a":
                this.staticImage.xIndex = this.staticImage.xIndex - 0.005;
                viewCanvas.draw();
                break;
            case "d":
                this.staticImage.xIndex = this.staticImage.xIndex + 0.005;
                viewCanvas.draw();
                break;
            case "w":
                this.staticImage.yIndex = this.staticImage.yIndex - 0.005;
                viewCanvas.draw();
                break;
            case "s":
                this.staticImage.yIndex = this.staticImage.yIndex + 0.005;
                viewCanvas.draw();
                break;
            case "e":
                this.staticImage.rotation = this.staticImage.rotation - 0.005;
                viewCanvas.draw();
                break;
            case "q":
                this.staticImage.rotation = this.staticImage.rotation + 0.005;
                viewCanvas.draw();
                break;
            case "x":
                this.staticImage.scalingX = this.staticImage.scalingX - 0.005;
                viewCanvas.draw();
                break;
            case "X":
                this.staticImage.scalingX = this.staticImage.scalingX + 0.005;
                viewCanvas.draw();
                break;
            case "z":
                this.staticImage.scalingY = this.staticImage.scalingY - 0.005;
                viewCanvas.draw();
                break;
            case "Z":
                this.staticImage.scalingY = this.staticImage.scalingY + 0.005;
                viewCanvas.draw();
                break;
            default:
                // code...
                break;
        }
        console.log("image at: " + this.staticImage.xIndex + ", " + this.staticImage.yIndex);
        console.log("image ro sc: " + this.staticImage.rotation + ", " + this.staticImage.scalingX + ", " + this.staticImage.scalingY);
    };
    ;
    return ImageController;
}());
exports.ImageController = ImageController;
;

},{}],10:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var point2d_1 = require("../geom/point2d");
var ZoomListener = /** @class */ (function () {
    function ZoomListener() {
    }
    return ZoomListener;
}());
var ZoomController = /** @class */ (function () {
    function ZoomController(viewCanvas, zoomIn, zoomOut) {
        var _this = this;
        this.zoomIn = zoomIn;
        this.zoomOut = zoomOut;
        this.listeners = [];
        this.zoom = 1;
        zoomIn.addEventListener("click", function (e) { return _this.clicked(e, viewCanvas, .95); });
        zoomOut.addEventListener("click", function (e) { return _this.clicked(e, viewCanvas, 1.05); });
        viewCanvas.ctx.canvas.addEventListener("dblclick", function (e) {
            return _this.clicked(e, viewCanvas, .75);
        });
    }
    ZoomController.prototype.addZoomListener = function (zoomListener) {
        this.listeners.push(zoomListener);
    };
    ZoomController.prototype.clicked = function (event, viewCanvas, by) {
        console.log("clicked" + event.target + ", " + event.type);
        console.log("listeners " + this.listeners.length);
        switch (event.type) {
            case "dblclick":
                var canvas = viewCanvas.ctx.canvas;
                //TODO how to find relative points?
                var xRel = event.clientX / (canvas.clientWidth - canvas.clientLeft);
                var yRel = (event.clientY - canvas.clientTop) / canvas.clientHeight;
                console.log("centring " + xRel + ", " + yRel);
                viewCanvas.zoomAbout(xRel, yRel, by);
                break;
            default:
                viewCanvas.zoomView(by);
        }
        this.zoom = this.zoom * by;
        for (var _i = 0, _a = this.listeners; _i < _a.length; _i++) {
            var value = _a[_i];
            value.zoom(this.zoom);
        }
        viewCanvas.draw();
    };
    ;
    return ZoomController;
}());
exports.ZoomController = ZoomController;
;
var PanController = /** @class */ (function (_super) {
    __extends(PanController, _super);
    function PanController(viewCanvas, dragElement) {
        var _this = _super.call(this) || this;
        _this.dragElement = dragElement;
        _this.record = false;
        _this.baseMove = 512;
        _this.move = 512;
        dragElement.addEventListener("mousemove", function (e) {
            return _this.dragged(e, viewCanvas);
        });
        dragElement.addEventListener("mousedown", function (e) {
            return _this.dragged(e, viewCanvas);
        });
        dragElement.addEventListener("mouseup", function (e) {
            return _this.dragged(e, viewCanvas);
        });
        return _this;
    }
    PanController.prototype.zoom = function (by) {
        console.log("zoom by " + by);
        this.move = this.baseMove / by;
    };
    PanController.prototype.dragged = function (event, viewCanvas) {
        switch (event.type) {
            case "mousedown":
                this.record = true;
                break;
            case "mouseup":
                this.record = false;
                break;
            default:
                if (this.record) {
                    var xDelta = (event.clientX - this.xPrevious) / this.move;
                    var yDelta = (event.clientY - this.yPrevious) / this.move;
                    var newTopLeft = new point2d_1.Point2D(viewCanvas.topLeft.x - xDelta, viewCanvas.topLeft.y - yDelta);
                    viewCanvas.moveView(newTopLeft);
                    viewCanvas.draw();
                }
        }
        this.xPrevious = event.clientX;
        this.yPrevious = event.clientY;
    };
    ;
    return PanController;
}(ZoomListener));
exports.PanController = PanController;
;

},{"../geom/point2d":1}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2dlb20vdGlsZS50cyIsInNyYy9nZW9tL3ZpZXdwb3J0LnRzIiwic3JjL2dlb20vd29ybGQyZC50cyIsInNyYy9ncmFwaGljcy9jYW52YXN0aWxlLnRzIiwic3JjL2dyYXBoaWNzL2dyaWQudHMiLCJzcmMvZ3JhcGhpY3Mvdmlld2NhbnZhcy50cyIsInNyYy9zaW1wbGVXb3JsZC50cyIsInNyYy91aS9pbWFnZUNvbnRyb2xsZXIudHMiLCJzcmMvdWkvbWFwQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQ0E7SUFPSSxpQkFBWSxDQUFTLEVBQUUsQ0FBUztRQUM1QixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFRSwwQkFBUSxHQUFSO1FBQ0ksT0FBTyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDckQsQ0FBQztJQWJlLFlBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDekIsV0FBRyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQWM1QyxjQUFDO0NBaEJELEFBZ0JDLElBQUE7QUFoQlksMEJBQU87Ozs7O0FDRXBCO0lBRUMsbUJBQW1CLGFBQXFCLEVBQVMsY0FBc0I7UUFBcEQsa0JBQWEsR0FBYixhQUFhLENBQVE7UUFBUyxtQkFBYyxHQUFkLGNBQWMsQ0FBUTtJQUFFLENBQUM7SUFJMUUsNEJBQVEsR0FBUixVQUFTLFFBQWlCLEVBQUUsU0FBaUIsRUFBRSxTQUFpQjtRQUUvRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFD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RSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztnQkFDMUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztnQkFDMUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztnQkFDMUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMs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QUFPLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsTUFBTSxFQUN6RCxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztvQkFFaEMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDaEMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2lCQUNsQjtTQUVGO1FBRUosSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQy9CLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztJQUU3QixDQUFDO0lBQUEsQ0FBQztJQUVOLG9CQUFDO0FBQUQsQ0FwREEsQUFvREMsQ0FwRGtDLFlBQVksR0FvRDlDO0FBcERZLHNDQUFhO0FBb0R6QixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXG5leHBvcnQgY2xhc3MgUG9pbnQyRCB7XG4gICAgc3RhdGljIHJlYWRvbmx5IHplcm8gPSBuZXcgUG9pbnQyRCgwLCAwKTtcbiAgICBzdGF0aWMgcmVhZG9ubHkgb25lID0gbmV3IFBvaW50MkQoMSwgMSk7XG5cbiAgICByZWFkb25seSB4OiBudW1iZXI7XG4gICAgcmVhZG9ubHkgeTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcblx0fVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiUG9pbnQyRChcIiArIHRoaXMueCArIFwiLCBcIiArIHRoaXMueSArIFwiKVwiO1xuICAgIH1cblxufSIsImltcG9ydCB7IFVuaXRzIH0gZnJvbSBcIi4vd29ybGQyZFwiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuL3BvaW50MmRcIjtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFRpbGVMYXllciB7XG5cdFxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgd2lkdGhNYXBVbml0czogbnVtYmVyLCBwdWJsaWMgaGVpZ2h0TWFwVW5pdHM6IG51bWJlcil7fVxuXG5cdGFic3RyYWN0IGdldFRpbGUoeEluZGV4OiBudW1iZXIsIHlJbmRleDogbnVtYmVyKTogVGlsZTtcblxuXHRnZXRUaWxlcyhwb3NpdGlvbjogUG9pbnQyRCwgeE1hcFVuaXRzOiBudW1iZXIsIHlNYXBVbml0czogbnVtYmVyKTogQXJyYXk8VGlsZT4ge1xuXG5cdFx0bGV0IGZpcnN0WCA9IE1hdGguZmxvb3IocG9zaXRpb24ueCAvIHRoaXMud2lkdGhNYXBVbml0cyk7XG5cdFx0bGV0IGxhc3RYID0gTWF0aC5jZWlsKChwb3NpdGlvbi54ICsgeE1hcFVuaXRzKS8gdGhpcy53aWR0aE1hcFVuaXRzKTtcblxuXHRcdGxldCBmaXJzdFkgPSBNYXRoLmZsb29yKHBvc2l0aW9uLnkgLyB0aGlzLmhlaWdodE1hcFVuaXRzKTtcblx0XHRsZXQgbGFzdFkgPSBNYXRoLmNlaWwoKHBvc2l0aW9uLnkgKyB5TWFwVW5pdHMpLyB0aGlzLmhlaWdodE1hcFVuaXRzKTtcblxuXHRcdGxldCB0aWxlcyA9IG5ldyBBcnJheTxUaWxlPigpO1xuXG5cdFx0Zm9yICh2YXIgeD1maXJzdFg7IHg8bGFzdFg7IHgrKyl7XG5cdFx0XHRmb3IgKHZhciB5PWZpcnN0WTsgeTxsYXN0WTsgeSsrKXtcblx0XHRcdFx0dGlsZXMucHVzaCh0aGlzLmdldFRpbGUoeCwgeSkpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRpbGVzO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNsYXNzIFRpbGUge1xuXHRcblx0c3RhdGljIGVtcHR5VGlsZTogVGlsZSA9IG5ldyBUaWxlKC0xLC0xKTtcblxuXHRjb25zdHJ1Y3Rvcih4SW5kZXg6IG51bWJlciwgeUluZGV4OiBudW1iZXIpe31cblxufSIsImltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi9wb2ludDJkXCI7XG5pbXBvcnQgeyBWZWN0b3IyRCB9IGZyb20gXCIuL3ZlY3RvcjJkXCI7XG5pbXBvcnQgeyBXb3JsZDJELCBVbml0cyB9IGZyb20gXCIuL3dvcmxkMmRcIjtcblxuZXhwb3J0IGNsYXNzIFZpZXdwb3J0IHtcblx0XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB0b3BMZWZ0OiBQb2ludDJELCBcblx0XHRwcml2YXRlIHdpZHRoTWFwVW5pdHM6IG51bWJlciwgcHJpdmF0ZSBoZWlnaHRNYXBVbml0czogbnVtYmVyKXtcblxuXHRcdGNvbnNvbGUubG9nKFwidyBoXCIgKyB3aWR0aE1hcFVuaXRzICsgXCIsIFwiICsgaGVpZ2h0TWFwVW5pdHMpO1xuXHR9XG5cblx0bW92ZVZpZXcodG9wTGVmdDogUG9pbnQyRCl7XG5cdFx0dGhpcy50b3BMZWZ0ID0gdG9wTGVmdDtcblx0fVxuXG5cdHpvb21WaWV3KHpvb206IG51bWJlcil7XG5cdFx0bGV0IG5ld1dpZHRoID0gdGhpcy53aWR0aE1hcFVuaXRzICogem9vbTtcblx0XHRsZXQgbmV3SGVpZ2h0ID0gdGhpcy5oZWlnaHRNYXBVbml0cyAqIHpvb207XG5cblx0XHRsZXQgbW92ZVggPSAodGhpcy53aWR0aE1hcFVuaXRzIC0gbmV3V2lkdGgpIC8gMjtcblx0XHRsZXQgbW92ZVkgPSAodGhpcy5oZWlnaHRNYXBVbml0cyAtIG5ld0hlaWdodCkgLyAyO1xuXG5cdFx0dGhpcy50b3BMZWZ0ID0gbmV3IFBvaW50MkQodGhpcy50b3BMZWZ0LnggKyBtb3ZlWCwgdGhpcy50b3BMZWZ0LnkgKyBtb3ZlWSk7XG5cblx0XHR0aGlzLndpZHRoTWFwVW5pdHMgPSBuZXdXaWR0aDtcblx0XHR0aGlzLmhlaWdodE1hcFVuaXRzID0gbmV3SGVpZ2h0O1xuXHR9XG5cblx0em9vbUFib3V0KHhSZWxhdGl2ZTogbnVtYmVyLCB5UmVsYXRpdmU6IG51bWJlciwgem9vbTogbnVtYmVyKXtcblxuXHRcdGxldCB4RGlmZiA9IDAuNSAtIHhSZWxhdGl2ZTtcblx0XHRsZXQgeURpZmYgPSAwLjUgLSB5UmVsYXRpdmU7XG5cblx0XHR2YXIgeE1vdmUgPSB4RGlmZiAqIHRoaXMud2lkdGhNYXBVbml0cztcblx0XHR2YXIgeU1vdmUgPSB5RGlmZiAqIHRoaXMuaGVpZ2h0TWFwVW5pdHM7XG5cblx0XHR0aGlzLnRvcExlZnQgPSBuZXcgUG9pbnQyRCh0aGlzLnRvcExlZnQueCAtIHhNb3ZlLCB0aGlzLnRvcExlZnQueSAtIHlNb3ZlKTtcblxuXHRcdHRoaXMuem9vbVZpZXcoem9vbSk7XG5cblx0XHR4TW92ZSA9IHhEaWZmICogdGhpcy53aWR0aE1hcFVuaXRzO1xuXHRcdHlNb3ZlID0geURpZmYgKiB0aGlzLmhlaWdodE1hcFVuaXRzO1xuXG5cdFx0dGhpcy50b3BMZWZ0ID0gbmV3IFBvaW50MkQodGhpcy50b3BMZWZ0LnggKyB4TW92ZSwgdGhpcy50b3BMZWZ0LnkgKyB5TW92ZSk7XG5cblx0fVxuXG5cdGdldERpbWVuc2lvbnMoKXtcblx0XHRyZXR1cm4gbmV3IFBvaW50MkQodGhpcy53aWR0aE1hcFVuaXRzLCB0aGlzLmhlaWdodE1hcFVuaXRzKTtcblx0fVxuXG59IiwiaW1wb3J0IHsgVGlsZUxheWVyIH0gZnJvbSBcIi4vdGlsZVwiO1xuXG5leHBvcnQgY2xhc3MgVW5pdHMge1xuXG5cdHN0YXRpYyByZWFkb25seSBXZWJXVSA9IG5ldyBVbml0cyhcIk1lcmNhdG9yIFdlYiBXb3JsZCBVbml0c1wiKTtcblxuXHRjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpe31cblxufVxuLyoqXG4gIEEgd29ybGQgaXMgdGhlIGJhc2UgdGhhdCBhbGwgb3RoZXIgZWxlbWVudHMgb3JpZW50YXRlIGZyb20gXG4qKi9cbmV4cG9ydCBjbGFzcyBXb3JsZDJEIHtcblxuXHRwcml2YXRlIHRpbGVMYXllcnM6IEFycmF5PFRpbGVMYXllcj4gPSBbXTtcblx0XG5cdGNvbnN0cnVjdG9yKCl7fVxuXG4gICAgYWRkVGlsZUxheWVyKHRpbGVMYXllcjogVGlsZUxheWVyKTogbnVtYmVyIHtcbiAgICBcdHJldHVybiB0aGlzLnRpbGVMYXllcnMucHVzaCh0aWxlTGF5ZXIpO1xuICAgIH1cblxufSIsImltcG9ydCB7IFRpbGUsIFRpbGVMYXllciB9IGZyb20gXCIuLi9nZW9tL3RpbGVcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDYW52YXNUaWxlIGV4dGVuZHMgVGlsZSB7XG5cblx0YWJzdHJhY3QgZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgc2NhbGluZ1g6IG51bWJlciwgc2NhbGluZ1k6IG51bWJlciwgXG5cdFx0Y2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpOiB2b2lkO1xuXG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZVN0cnVjdCB7XG5cblx0cHJlZml4OiBzdHJpbmcgPSBcIlwiO1xuXHRzdWZmaXg6IHN0cmluZyA9IFwiXCI7XG5cdHRpbGVEaXI6IHN0cmluZyA9IFwiaW1hZ2VzL1wiO1xuXHR2aXNpYmxlOiBib29sZWFuID0gdHJ1ZTtcblx0dGlsZVdpZHRoUHg6IG51bWJlciA9IDI1Njtcblx0dGlsZUhlaWdodFB4OiBudW1iZXIgPSAyNTY7XG5cdHdpZHRoTWFwVW5pdHM6IG51bWJlciA9IDE7XG5cdGhlaWdodE1hcFVuaXRzOiBudW1iZXIgPSAxOyBcblxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VUaWxlIGV4dGVuZHMgQ2FudmFzVGlsZSB7XG5cblx0cHJpdmF0ZSBpbWc6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cblx0Y29uc3RydWN0b3IocmVhZG9ubHkgeEluZGV4OiBudW1iZXIsIHJlYWRvbmx5IHlJbmRleDogbnVtYmVyLCBpbWFnZVNyYzogc3RyaW5nKSB7XG5cdFx0c3VwZXIoeEluZGV4LCB5SW5kZXgpO1xuXHRcdHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG5cdFx0dGhpcy5pbWcuc3JjID0gaW1hZ2VTcmM7XG5cdH07XG5cblx0cHJpdmF0ZSBkcmF3SW1hZ2UoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKXtcblx0XHRjdHguZHJhd0ltYWdlKHRoaXMuaW1nLCBjYW52YXNYLCBjYW52YXNZKTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKXtcblx0XHRpZiAodGhpcy5pbWcuY29tcGxldGUpIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5pbWcub25sb2FkID0gKGV2ZW50KSA9PiB7XG5cdFx0XHRcdHRoaXMuaW1nLmNyb3NzT3JpZ2luID0gXCJBbm9ueW1vdXNcIjtcblx0XHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCBjYW52YXNYLCBjYW52YXNZKTtcblx0XHRcdH07XG5cdFx0fVxuXHR9O1xuXG59XG5cbmV4cG9ydCBjbGFzcyBTdGF0aWNJbWFnZSB7XG5cblx0cHJpdmF0ZSBpbWc6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cblx0Y29uc3RydWN0b3IocHVibGljIHhJbmRleDogbnVtYmVyLCBwdWJsaWMgeUluZGV4OiBudW1iZXIsIFxuXHRcdHB1YmxpYyBzY2FsaW5nWDogbnVtYmVyLCBwdWJsaWMgc2NhbGluZ1k6IG51bWJlciwgcHVibGljIHJvdGF0aW9uOiBudW1iZXIsIFxuXHRcdGltYWdlU3JjOiBzdHJpbmcsIHJlYWRvbmx5IGFscGhhOiBudW1iZXIpIHtcblx0XHRcblx0XHR0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuXHRcdHRoaXMuaW1nLnNyYyA9IGltYWdlU3JjO1xuXHR9O1xuXG5cdHByaXZhdGUgZHJhd0ltYWdlKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBjYW52YXNYOiBudW1iZXIsIGNhbnZhc1k6IG51bWJlcil7XG5cblx0XHQvL3NjYWxpbmdYID0gc2NhbGluZ1ggKiB0aGlzLnNjYWxpbmc7XG5cdFx0Ly9zY2FsaW5nWSA9IHNjYWxpbmdZICogdGhpcy5zY2FsaW5nO1xuXG5cdFx0Ly8gbGV0IGNvc1ggPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uKTtcblx0XHQvLyBsZXQgc2luWCA9IE1hdGguc2luKHRoaXMucm90YXRpb24pO1xuXG5cdFx0Y3R4LnRyYW5zbGF0ZShjYW52YXNYLCBjYW52YXNZKTtcblx0XHRjdHgucm90YXRlKHRoaXMucm90YXRpb24pO1xuXHRcdGN0eC5zY2FsZSh0aGlzLnNjYWxpbmdYLCB0aGlzLnNjYWxpbmdZKTtcblx0XHQvL2NvbnNvbGUubG9nKFwieHlTY2FsaW5nIFwiICsgdGhpcy5zY2FsaW5nWCArIFwiLCBcIiArIHRoaXMuc2NhbGluZ1kpO1xuXHRcdGN0eC5nbG9iYWxBbHBoYSA9IHRoaXMuYWxwaGE7XG5cblx0XHQvLyBjdHgudHJhbnNmb3JtKGNvc1ggKiBzY2FsaW5nWCwgc2luWCAqIHNjYWxpbmdZLCAtc2luWCAqIHNjYWxpbmdYLCBjb3NYICogc2NhbGluZ1ksIFxuXHRcdC8vIFx0Y2FudmFzWCAvIHRoaXMuc2NhbGluZywgY2FudmFzWSAvIHRoaXMuc2NhbGluZyk7XG5cblx0XHRjdHguZHJhd0ltYWdlKHRoaXMuaW1nLCAtKHRoaXMuaW1nLndpZHRoLzIpLCAtKHRoaXMuaW1nLmhlaWdodC8yKSk7XG5cdFx0XG5cdFx0Y3R4LnNjYWxlKDEvdGhpcy5zY2FsaW5nWCwgMS90aGlzLnNjYWxpbmdZKTtcblx0XHRjdHgucm90YXRlKC10aGlzLnJvdGF0aW9uKTtcblx0XHRjdHgudHJhbnNsYXRlKC1jYW52YXNYLCAtY2FudmFzWSk7XG5cdFx0Y3R4Lmdsb2JhbEFscGhhID0gMTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKXtcblx0XHRpZiAodGhpcy5pbWcuY29tcGxldGUpIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5pbWcub25sb2FkID0gKGV2ZW50KSA9PiB7XG5cdFx0XHRcdHRoaXMuaW1nLmNyb3NzT3JpZ2luID0gXCJBbm9ueW1vdXNcIjtcblx0XHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCBjYW52YXNYLCBjYW52YXNZKTtcblx0XHRcdH07XG5cdFx0fVxuXHR9O1xuXG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZVRpbGVMYXllciBleHRlbmRzIFRpbGVMYXllciB7XG5cblx0cmVhZG9ubHkgaW1hZ2VQcm9wZXJ0aWVzOiBJbWFnZVN0cnVjdDtcblxuXHRjb25zdHJ1Y3RvcihpbWFnZVByb3BlcnRpZXM6IEltYWdlU3RydWN0KSB7XG5cdFx0c3VwZXIoaW1hZ2VQcm9wZXJ0aWVzLndpZHRoTWFwVW5pdHMsIGltYWdlUHJvcGVydGllcy5oZWlnaHRNYXBVbml0cyk7XG5cdFx0dGhpcy5pbWFnZVByb3BlcnRpZXMgPSBpbWFnZVByb3BlcnRpZXM7XG5cdH1cblxuXHQvKipcblx0ICBsZWF2ZSBjYWNoaW5nIHVwIHRvIHRoZSBicm93c2VyXG5cdCoqL1xuXHRnZXRUaWxlKHhVbml0czogbnVtYmVyLCB5VW5pdHM6IG51bWJlcik6IFRpbGUge1xuXHRcdGxldCBpbWFnZVNyYyA9IHRoaXMuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVEaXIgKyBcblx0XHRcdHRoaXMuaW1hZ2VQcm9wZXJ0aWVzLnByZWZpeCArIHhVbml0cyArIFwiX1wiICsgeVVuaXRzICsgdGhpcy5pbWFnZVByb3BlcnRpZXMuc3VmZml4O1xuXHRcdHJldHVybiBuZXcgSW1hZ2VUaWxlKHhVbml0cywgeVVuaXRzLCBpbWFnZVNyYyk7XG5cdH1cblxufVxuIiwiaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuZXhwb3J0IGNsYXNzIEdyaWRMYXllciB7XG5cblx0cHJpdmF0ZSBncmlkU3BhY2luZzogbnVtYmVyO1xuXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgZ3JpZFNwYWNpbmc6IG51bWJlcikge1xuXHRcdHRoaXMuZ3JpZFNwYWNpbmcgPSBncmlkU3BhY2luZztcblx0fVxuXG5cdHNldEdyaWRTcGFjaW5nKGdyaWRTcGFjaW5nOiBudW1iZXIpe1xuXHRcdHRoaXMuZ3JpZFNwYWNpbmcgPSBncmlkU3BhY2luZztcblx0fVxuXHQvKipcblx0ICBsZWF2ZSBjYWNoaW5nIHVwIHRvIHRoZSBicm93c2VyXG5cdCoqL1xuXHRkcmF3KHRvcExlZnQ6IFBvaW50MkQsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogdm9pZCB7XG5cdFx0bGV0IG1pblggPSBNYXRoLmZsb29yKHRvcExlZnQueCk7XG5cdFx0bGV0IG1pblkgPSBNYXRoLmZsb29yKHRvcExlZnQueSk7XG5cblx0XHR0aGlzLmN0eC50cmFuc2xhdGUoLTI1NiAqIHRvcExlZnQueCwgLTI1NiAqIHRvcExlZnQueSk7XG5cdFx0Ly9jb25zb2xlLmxvZyhcIm1pbnMgXCIgKyB3aWR0aCArIFwiLCBcIiArIGhlaWdodCk7XG5cblx0XHRsZXQgbGFzdFggPSBNYXRoLmNlaWwodG9wTGVmdC54ICsgd2lkdGgpO1xuXHRcdGxldCBsYXN0WSA9IE1hdGguY2VpbCh0b3BMZWZ0LnkgKyBoZWlnaHQpO1xuXG5cdFx0dGhpcy5jdHguc3Ryb2tlU3R5bGUgPSAnYmx1ZSc7XG5cdFx0dGhpcy5jdHguZm9udCA9ICc0OHB4IHNlcmlmJztcblxuXHRcdGxldCB5WmVybyA9IG1pblkgKiB0aGlzLmdyaWRTcGFjaW5nICogMjU2O1xuXHRcdGxldCB5TWF4ID0gbGFzdFkgKiB0aGlzLmdyaWRTcGFjaW5nICogMjU2O1xuXHRcdGxldCB4SnVtcCA9IHRoaXMuZ3JpZFNwYWNpbmcgKiAyNTY7XG5cblx0XHRsZXQgeFplcm8gPSBtaW5YICogdGhpcy5ncmlkU3BhY2luZyAqIDI1Njtcblx0XHRsZXQgeE1heCA9IGxhc3RYICogdGhpcy5ncmlkU3BhY2luZyAqIDI1Njtcblx0XHRsZXQgeUp1bXAgPSB0aGlzLmdyaWRTcGFjaW5nICogMjU2O1xuXG5cdFx0dGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgXHQvL3RoaXMuY3R4LmNsZWFyUmVjdCh4WmVybywgeVplcm8sIHhNYXgsIHlNYXgpO1xuXG5cdFx0Zm9yICh2YXIgeCA9IG1pblg7IHg8bGFzdFg7IHgrKyl7XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiYXQgXCIgKyBtaW5YKTtcblx0XHRcdGxldCB4TW92ZSA9IHggKiB4SnVtcDtcblx0XHRcdHRoaXMuY3R4Lm1vdmVUbyh4TW92ZSwgeVplcm8pO1xuXHRcdFx0dGhpcy5jdHgubGluZVRvKHhNb3ZlLCB5TWF4KTtcblx0XHR9XG5cblx0XHRmb3IgKHZhciB5ID0gbWluWTsgeTxsYXN0WTsgeSsrKXtcblx0XHRcdGxldCB5TW92ZSA9IHkgKiB5SnVtcDtcblx0XHRcdHRoaXMuY3R4Lm1vdmVUbyh4WmVybywgeU1vdmUpO1xuXHRcdFx0dGhpcy5jdHgubGluZVRvKHhNYXgsIHlNb3ZlKTtcblxuXHRcdFx0Zm9yICh2YXIgeCA9IG1pblg7IHg8bGFzdFg7IHgrKyl7XG5cdFx0XHRcdGxldCB4TW92ZSA9ICh4IC0gMC41KSAqIHhKdW1wO1xuXHRcdFx0XHR5TW92ZSA9ICh5IC0gMC41KSAqIHlKdW1wO1xuXHRcdFx0XHRsZXQgdGV4dCA9IFwiXCIgKyAoeC0xKSArIFwiLCBcIiArICh5LTEpO1xuXHRcdFx0XHR0aGlzLmN0eC5maWxsVGV4dCh0ZXh0LCB4TW92ZSwgeU1vdmUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLmN0eC5zdHJva2UoKTtcblx0XHR0aGlzLmN0eC50cmFuc2xhdGUoMjU2ICogdG9wTGVmdC54LCAyNTYgKiB0b3BMZWZ0LnkpO1xuXHR9XG5cblxufSIsImltcG9ydCB7IFZpZXdwb3J0IH0gZnJvbSBcIi4uL2dlb20vdmlld3BvcnRcIjtcbmltcG9ydCB7IFdvcmxkMkQgfSBmcm9tIFwiLi4vZ2VvbS93b3JsZDJkXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuaW1wb3J0IHsgU3RhdGljSW1hZ2UsIEltYWdlVGlsZSwgSW1hZ2VUaWxlTGF5ZXIgfSBmcm9tIFwiLi9jYW52YXN0aWxlXCI7XG5pbXBvcnQgeyBHcmlkTGF5ZXIgfSBmcm9tIFwiLi9ncmlkXCI7XG5cbmV4cG9ydCBjbGFzcyBWaWV3Q2FudmFzIGV4dGVuZHMgVmlld3BvcnQge1xuXG4gICAgcHJpdmF0ZSBzdGF0aWNFbGVtZW50czogQXJyYXk8U3RhdGljSW1hZ2U+ID0gW107XG4gICAgcHJpdmF0ZSBpbWFnZVRpbGVMYXllcnMgPSBbXTtcblxuICAgIHByaXZhdGUgZ3JpZExheWVyOiBHcmlkTGF5ZXI7XG5cbiAgICBwcml2YXRlIG9mZnNjcmVlbjogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgIHByaXZhdGUgd2lkdGg6IG51bWJlcjtcbiAgICBwcml2YXRlIGhlaWdodDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IodG9wTGVmdDogUG9pbnQyRCwgXG4gICAgXHR3aWR0aE1hcFVuaXRzOiBudW1iZXIsIGhlaWdodE1hcFVuaXRzOiBudW1iZXIsIFxuICAgIFx0cHJpdmF0ZSBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkge1xuXG4gICAgXHRzdXBlcih0b3BMZWZ0LCB3aWR0aE1hcFVuaXRzLCBoZWlnaHRNYXBVbml0cyk7XG5cbiAgICAgICAgdGhpcy53aWR0aCA9IGN0eC5jYW52YXMuY2xpZW50V2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gY3R4LmNhbnZhcy5jbGllbnRIZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5jdHguY2FudmFzLndpZHRoID0gdGhpcy53aWR0aDtcbiAgICAgICAgdGhpcy5jdHguY2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwib25zY3JlZW4gXCIgKyB0aGlzLmN0eC5jYW52YXMud2lkdGggKyBcIiwgXCIgKyB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICAvL2NvbnN0IGMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgICBjb25zdCBjID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib2Zmc2NyZWVuXCIpO1xuICAgICAgICBjLndpZHRoID0gdGhpcy53aWR0aDtcbiAgICAgICAgYy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcblxuICAgICAgICB0aGlzLm9mZnNjcmVlbiA9IDxDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ+Yy5nZXRDb250ZXh0KFwiMmRcIik7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJvZmZzY3JlZW4gXCIgKyB0aGlzLmN0eC5jYW52YXMuY2xpZW50V2lkdGgpO1xuXG4gICAgXHR0aGlzLmdyaWRMYXllciA9IG5ldyBHcmlkTGF5ZXIodGhpcy5jdHgsIDEpO1xuICAgIH1cblxuICAgIGFkZFRpbGVMYXllcihpbWFnZVRpbGVMYXllcjogSW1hZ2VUaWxlTGF5ZXIpOiB2b2lkIHtcbiAgICBcdHRoaXMuaW1hZ2VUaWxlTGF5ZXJzLnB1c2goaW1hZ2VUaWxlTGF5ZXIpO1xuICAgIH1cblxuICAgIGFkZFN0YXRpY0VsZW1lbnQoc3RhdGljSW1hZ2U6IFN0YXRpY0ltYWdlKTogdm9pZCB7XG4gICAgXHR0aGlzLnN0YXRpY0VsZW1lbnRzLnB1c2goc3RhdGljSW1hZ2UpO1xuICAgIH1cblxuICAgIGdldFZpZXdTY2FsaW5nKHBpeGVsc1BlclVuaXQ6IG51bWJlcik6IFBvaW50MkQge1xuICAgIFx0bGV0IGRpbWVuc2lvbiA9IHRoaXMuZ2V0RGltZW5zaW9ucygpO1xuICAgIFx0bGV0IHZpZXdTY2FsaW5nWCA9IHRoaXMuY3R4LmNhbnZhcy5jbGllbnRXaWR0aCAvIGRpbWVuc2lvbi54IC8gcGl4ZWxzUGVyVW5pdDtcbiAgICBcdGxldCB2aWV3U2NhbGluZ1kgPSB0aGlzLmN0eC5jYW52YXMuY2xpZW50SGVpZ2h0IC8gZGltZW5zaW9uLnkgLyBwaXhlbHNQZXJVbml0O1xuICAgIFx0cmV0dXJuIG5ldyBQb2ludDJEKHZpZXdTY2FsaW5nWCwgdmlld1NjYWxpbmdZKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNjYWxlKHBpeGVsc1BlclVuaXQ6IG51bWJlciwgZGltZW5zaW9uOiBQb2ludDJELCByZXZlcnNlOiBib29sZWFuKTogdm9pZCB7XG5cbiAgICBcdGxldCB2aWV3U2NhbGluZyA9IHRoaXMuZ2V0Vmlld1NjYWxpbmcocGl4ZWxzUGVyVW5pdCk7XG5cbiAgICBcdGlmIChyZXZlcnNlKXtcbiAgICBcdFx0dGhpcy5jdHguc2NhbGUoMS92aWV3U2NhbGluZy54LCAxL3ZpZXdTY2FsaW5nLnkpO1xuICAgIFx0fSBlbHNlIHtcbiAgICBcdFx0dGhpcy5jdHguc2NhbGUodmlld1NjYWxpbmcueCwgdmlld1NjYWxpbmcueSk7XG4gICAgXHR9XG4gICAgXHRcbiAgICB9XG5cbiAgICBkcmF3KCk6IHZvaWQge1xuICAgIFx0bGV0IGRpbWVuc2lvbiA9IHRoaXMuZ2V0RGltZW5zaW9ucygpO1xuXG4gICAgICAgIGxldCBsb2NhbENvbnRleHQgPSB0aGlzLmN0eDtcblxuICAgIFx0bG9jYWxDb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG5cbiAgICBcdGZvciAobGV0IHZhbHVlIG9mIHRoaXMuaW1hZ2VUaWxlTGF5ZXJzKXtcbiAgICBcdFx0aWYgKHZhbHVlLmltYWdlUHJvcGVydGllcy52aXNpYmxlKSB7XG5cbiAgICBcdFx0XHR0aGlzLnNjYWxlKHZhbHVlLmltYWdlUHJvcGVydGllcy50aWxlV2lkdGhQeCwgZGltZW5zaW9uLCBmYWxzZSk7XG5cbiAgICBcdFx0XHRsZXQgdGlsZVNjYWxpbmdYID0gdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVXaWR0aFB4IC8gdmFsdWUud2lkdGhNYXBVbml0cztcbiAgICBcdFx0XHRsZXQgdGlsZVNjYWxpbmdZID0gdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVIZWlnaHRQeCAvIHZhbHVlLmhlaWdodE1hcFVuaXRzO1xuXG4gICAgXHRcdFx0bGV0IHRpbGVzOiBBcnJheTxJbWFnZVRpbGU+ID0gdmFsdWUuZ2V0VGlsZXModGhpcy50b3BMZWZ0LCBcbiAgICBcdFx0XHRcdGRpbWVuc2lvbi54LCBkaW1lbnNpb24ueSk7XG5cbiAgICBcdFx0XHRmb3IgKGxldCB0aWxlIG9mIHRpbGVzKXtcbiAgICBcdFx0XHRcdHZhciB0aWxlWCA9ICh0aWxlLnhJbmRleCAtIHRoaXMudG9wTGVmdC54KSAqIHRpbGVTY2FsaW5nWDtcbiAgICBcdFx0XHRcdHZhciB0aWxlWSA9ICh0aWxlLnlJbmRleCAtIHRoaXMudG9wTGVmdC55KSAqIHRpbGVTY2FsaW5nWTtcblxuICAgIFx0XHRcdFx0dGlsZS5kcmF3KGxvY2FsQ29udGV4dCwgdGlsZVgsIHRpbGVZKTtcbiAgICBcdFx0XHR9XG5cbiAgICBcdFx0XHR0aGlzLnNjYWxlKHZhbHVlLmltYWdlUHJvcGVydGllcy50aWxlV2lkdGhQeCwgZGltZW5zaW9uLCB0cnVlKTtcbiAgICBcdFx0fVxuICAgIFx0fVxuXG4gICAgXHRmb3IgKGxldCB2YWx1ZSBvZiB0aGlzLnN0YXRpY0VsZW1lbnRzKXtcbiAgICBcdFx0Ly8yNTYgcHggaXMgMSBtYXAgdW5pdFxuXHRcdFx0bGV0IHRpbGVTY2FsaW5nWCA9IDI1Njtcblx0XHRcdGxldCB0aWxlU2NhbGluZ1kgPSAyNTY7XG5cbiAgICBcdFx0dGhpcy5zY2FsZSgyNTYsIGRpbWVuc2lvbiwgZmFsc2UpO1xuXG4gICAgXHRcdGxldCBpbWFnZVggPSAodmFsdWUueEluZGV4IC0gdGhpcy50b3BMZWZ0LngpICogdGlsZVNjYWxpbmdYO1xuICAgIFx0XHRsZXQgaW1hZ2VZID0gKHZhbHVlLnlJbmRleCAtIHRoaXMudG9wTGVmdC55KSAqIHRpbGVTY2FsaW5nWTtcblxuICAgIFx0XHR2YWx1ZS5kcmF3KGxvY2FsQ29udGV4dCwgaW1hZ2VYLCBpbWFnZVkpO1xuICAgIFx0XHR0aGlzLnNjYWxlKDI1NiwgZGltZW5zaW9uLCB0cnVlKTtcblxuICAgIFx0fVxuXG4gICAgXHR0aGlzLnNjYWxlKDI1NiwgZGltZW5zaW9uLCBmYWxzZSk7XG4gICAgXHR0aGlzLmdyaWRMYXllci5kcmF3KHRoaXMudG9wTGVmdCwgZGltZW5zaW9uLngsIGRpbWVuc2lvbi55KTtcbiAgICBcdHRoaXMuc2NhbGUoMjU2LCBkaW1lbnNpb24sIHRydWUpO1xuXG4gICAgICAgIC8vIGxldCBpbWFnZURhdGE6IEltYWdlRGF0YSA9IGxvY2FsQ29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXG4gICAgICAgIC8vIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiaW1hZ2UgZGF0YSBcIiwgaW1hZ2VEYXRhKTtcbiAgICAgICAgLy8gdGhpcy5jdHgucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG5cbiAgICAgICAgdGhpcy5kcmF3Q2VudHJlKHRoaXMuY3R4KTtcblxuICAgIH1cblxuICAgIGRyYXdDZW50cmUoY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKXtcbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKHRoaXMud2lkdGgvMiwgMCk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKHRoaXMud2lkdGgvMiwgdGhpcy5oZWlnaHQpO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbygwLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8odGhpcy53aWR0aCwgdGhpcy5oZWlnaHQvMik7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgV29ybGQyRCB9IGZyb20gXCIuL2dlb20vd29ybGQyZFwiO1xuaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tIFwiLi9nZW9tL3ZpZXdwb3J0XCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBTdGF0aWNJbWFnZSwgSW1hZ2VUaWxlTGF5ZXIsIEltYWdlU3RydWN0IH0gZnJvbSBcIi4vZ3JhcGhpY3MvY2FudmFzdGlsZVwiO1xuaW1wb3J0IHsgVmlld0NhbnZhcyB9IGZyb20gXCIuL2dyYXBoaWNzL3ZpZXdjYW52YXNcIjtcbmltcG9ydCB7IFpvb21Db250cm9sbGVyLCBQYW5Db250cm9sbGVyIH0gZnJvbSBcIi4vdWkvbWFwQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgSW1hZ2VDb250cm9sbGVyIH0gZnJvbSBcIi4vdWkvaW1hZ2VDb250cm9sbGVyXCI7XG5cbmxldCBzaW1wbGVXb3JsZCA9IG5ldyBXb3JsZDJEKCk7XG5cbi8vIGxldCBsYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbi8vIGxheWVyUHJvcGVydGllcy5wcmVmaXggPSBcIlwiO1xuLy8gbGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwiLnBuZ1wiO1xuXG4vLyBsZXQgcm9hZExheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuLy8gcm9hZExheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImIucG5nXCI7XG5cbi8vIGxldCBzZW50aW5lbExheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuLy8gc2VudGluZWxMYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCJsLmpwZWdcIjtcblxuLy8gbGV0IHNlbnRpbmVsVGVycmFpbkxheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuLy8gc2VudGluZWxUZXJyYWluTGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwidC5qcGVnXCI7XG5cbmxldCBsaWZmZXlMYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbmxpZmZleUxheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImxpZmZleS5qcGVnXCI7XG5saWZmZXlMYXllclByb3BlcnRpZXMudGlsZURpciA9IFwiaW1hZ2VzL2xpZmZleS9cIjtcblxubGV0IGxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG5saWZmZXlMYWJlbExheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImxpZmZleS5wbmdcIjtcbmxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzLnRpbGVEaXIgPSBcImltYWdlcy9saWZmZXkvXCI7XG5saWZmZXlMYWJlbExheWVyUHJvcGVydGllcy52aXNpYmxlID0gdHJ1ZTtcblxuLy8gbGV0IGJhc2VMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihsYXllclByb3BlcnRpZXMpO1xuLy8gbGV0IHNlbnRpbmVsTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIoc2VudGluZWxMYXllclByb3BlcnRpZXMpO1xuLy8gbGV0IHJvYWRMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihyb2FkTGF5ZXJQcm9wZXJ0aWVzKTtcbi8vIGxldCB0ZXJyYWluTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIoc2VudGluZWxUZXJyYWluTGF5ZXJQcm9wZXJ0aWVzKTtcblxubGV0IGxpZmZleVNlbnRpbmVsTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIobGlmZmV5TGF5ZXJQcm9wZXJ0aWVzKTtcbmxldCBsaWZmZXlMYWJlbExheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKGxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzKTtcblxubGV0IGRvbGllckltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDIuMjQsIDEuODcsIC40MywgLjQzLCAtMC4wNiwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAxN1JbU1ZDMl0uanBnXCIsIC43KTtcblxubGV0IHRyaW5pdHlJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgxLjk5LCAzLjU5LCAuNDMsIC40MywgMC4xNSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAxOVJbU1ZDMl0uanBnXCIsIC43KTtcblxubGV0IHBvb2xiZWdJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgzLjM0LCAxLjYyNSwgLjQwNSwgLjQzLCAwLjA1LFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMThSW1NWQzJdLmpwZ1wiLCAuNyk7XG5cbmxldCBhYmJleUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDIuMzksIDAuMDM1LCAuNDE1LCAuNDM1LCAtLjI1LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDA4cltTVkMyXS5qcGdcIiwgLjcpO1xuXG5sZXQgYnVzYXJhc0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDMuNDksIC0wLjI0LCAuNDEsIC40MjUsIC0uMjYsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDlyW1NWQzJdLmpwZ1wiLCAuNyk7XG5cbmxldCBsb3dlcmFiYmV5SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMS4yOTUsIDAuMzc3NiwgLjQyNSwgLjQzNSwgLS4yMywgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwN3JbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBkYW1lSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMC45OCwgMi4zMTUsIC40MSwgLjQyOCwgLTAuMDk1LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDE2cl8yW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgY3VzdG9tSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoNS4yMSwgLS4yNDUsIC40MiwgLjQ0LCAwLjAzLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDEwcl8yW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgbWFub3JJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSg2LjM2LCAwLjAyNSwgLjQxNSwgLjQzNSwgMC4xMSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAxMXJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBzYWNrdmlsbGVJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgxLjI5LCAtMS4yOCwgLjQ2LCAuNDIsIC0wLjI2NSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwNHJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBncmVhdEltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC4xOSwgLTAuNzA1LCAuNCwgLjQyLCAtLjUxLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDAzcltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IGxvd2Vyb3Jtb25kSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMC4xNiwgMC43MSwgLjQwNSwgLjQ0LCAtMC4yMDUsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDZyW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgc3RlcGhlbnNJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgxLjczLCA0LjkzNSwgLjQxNSwgLjQyLCAwLjIwNSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAyMFJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBtYXJ5c0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0xLjA1NSwgMC45ODUsIC40MywgLjQzNSwgLTAuMjEsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDVyW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgdG90YWxJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSg0LjQ4NSwgLTEuODc1LCA3LjQ2NSwgNy4zNSwgMCwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwMXJbU1ZDMl0uanBnXCIsIC40KTtcblxuXG5mdW5jdGlvbiBzaG93TWFwKGRpdk5hbWU6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpdk5hbWUpO1xuXG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdGxldCB2aWV3Q2FudmFzID0gbmV3IFZpZXdDYW52YXMobmV3IFBvaW50MkQoLTIsLTMpLCA2LCA0LCBjdHgpO1xuXHQvLyB2aWV3Q2FudmFzLmFkZFRpbGVMYXllcihiYXNlTGF5ZXIpO1xuXHQvLyB2aWV3Q2FudmFzLmFkZFRpbGVMYXllcihzZW50aW5lbExheWVyKTtcblx0dmlld0NhbnZhcy5hZGRUaWxlTGF5ZXIobGlmZmV5U2VudGluZWxMYXllcik7XG5cdHZpZXdDYW52YXMuYWRkVGlsZUxheWVyKGxpZmZleUxhYmVsTGF5ZXIpO1xuXG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudCh0b3RhbEltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGRvbGllckltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHRyaW5pdHlJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChwb29sYmVnSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoYWJiZXlJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChsb3dlcmFiYmV5SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoYnVzYXJhc0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGRhbWVJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChjdXN0b21JbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChtYW5vckltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHNhY2t2aWxsZUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGdyZWF0SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQobG93ZXJvcm1vbmRJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChzdGVwaGVuc0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KG1hcnlzSW1hZ2UpO1xuXG5cdGxldCBpbWFnZUNvbnRyb2xsZXIgPSBuZXcgSW1hZ2VDb250cm9sbGVyKHZpZXdDYW52YXMsIG1hcnlzSW1hZ2UpO1xuXG5cdGNvbnN0IHBsdXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwbHVzXCIpO1xuXHRjb25zdCBtaW51cyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1pbnVzXCIpO1xuXG5cdGxldCBwYW5Db250cm9sID0gbmV3IFBhbkNvbnRyb2xsZXIodmlld0NhbnZhcywgY2FudmFzKTtcblx0bGV0IGNhbnZhc0NvbnRyb2wgPSBuZXcgWm9vbUNvbnRyb2xsZXIodmlld0NhbnZhcywgcGx1cywgbWludXMpO1xuXG5cdGNhbnZhc0NvbnRyb2wuYWRkWm9vbUxpc3RlbmVyKHBhbkNvbnRyb2wpO1xuXG5cdHZpZXdDYW52YXMuZHJhdygpO1xufVxuXG5mdW5jdGlvbiBzaG93KCl7XG5cdHNob3dNYXAoXCJjYW52YXNcIiwgXCJUeXBlU2NyaXB0XCIpO1xufVxuXG5pZiAoXG4gICAgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiIHx8XG4gICAgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09IFwibG9hZGluZ1wiICYmICFkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZG9TY3JvbGwpXG4pIHtcblx0c2hvdygpO1xufSBlbHNlIHtcblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgc2hvdyk7XG59XG5cbiIsImltcG9ydCB7IFN0YXRpY0ltYWdlIH0gZnJvbSBcIi4uL2dyYXBoaWNzL2NhbnZhc3RpbGVcIjtcbmltcG9ydCB7IFZpZXdDYW52YXMgfSBmcm9tIFwiLi4vZ3JhcGhpY3Mvdmlld2NhbnZhc1wiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuZXhwb3J0IGNsYXNzIEltYWdlQ29udHJvbGxlciB7XG5cbiAgICBjb25zdHJ1Y3Rvcih2aWV3Q2FudmFzOiBWaWV3Q2FudmFzLCByZWFkb25seSBzdGF0aWNJbWFnZTogU3RhdGljSW1hZ2UpIHtcbiAgICBcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMucHJlc3NlZCh2aWV3Q2FudmFzLCBlICBhcyBLZXlib2FyZEV2ZW50KSk7XG4gICAgfVxuXG4gICAgcHJlc3NlZCh2aWV3Q2FudmFzOiBWaWV3Q2FudmFzLCBldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIFx0Y29uc29sZS5sb2coXCJwcmVzc2VkXCIgKyBldmVudC50YXJnZXQgKyBcIiwgXCIgKyBldmVudC5rZXkpO1xuXG4gICAgXHRzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgIFx0XHRjYXNlIFwiYVwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2UueEluZGV4ID0gdGhpcy5zdGF0aWNJbWFnZS54SW5kZXggLSAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcImRcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnhJbmRleCA9IHRoaXMuc3RhdGljSW1hZ2UueEluZGV4ICsgMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJ3XCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS55SW5kZXggPSB0aGlzLnN0YXRpY0ltYWdlLnlJbmRleCAtIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwic1wiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2UueUluZGV4ID0gdGhpcy5zdGF0aWNJbWFnZS55SW5kZXggKyAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcImVcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnJvdGF0aW9uID0gdGhpcy5zdGF0aWNJbWFnZS5yb3RhdGlvbiAtIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwicVwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uucm90YXRpb24gPSB0aGlzLnN0YXRpY0ltYWdlLnJvdGF0aW9uICsgMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJ4XCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWCA9IHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1ggLSAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIlhcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdYID0gdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWCArIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwielwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1kgPSB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdZIC0gMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJaXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWSA9IHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1kgKyAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0ZGVmYXVsdDpcbiAgICBcdFx0XHQvLyBjb2RlLi4uXG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHR9XG4gICAgXHRjb25zb2xlLmxvZyhcImltYWdlIGF0OiBcIiArICB0aGlzLnN0YXRpY0ltYWdlLnhJbmRleCArIFwiLCBcIiArIHRoaXMuc3RhdGljSW1hZ2UueUluZGV4KTtcbiAgICBcdGNvbnNvbGUubG9nKFwiaW1hZ2Ugcm8gc2M6IFwiICsgIHRoaXMuc3RhdGljSW1hZ2Uucm90YXRpb24gKyBcIiwgXCIgKyB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdYICsgXCIsIFwiICsgdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWSk7XG4gICAgfTtcblxufTsiLCJpbXBvcnQgeyBWaWV3Q2FudmFzIH0gZnJvbSBcIi4uL2dyYXBoaWNzL3ZpZXdjYW52YXNcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbmFic3RyYWN0IGNsYXNzIFpvb21MaXN0ZW5lciB7XG5cdGFic3RyYWN0IHpvb20oYnk6IG51bWJlcik7XG59XG5cbmV4cG9ydCBjbGFzcyBab29tQ29udHJvbGxlciB7XG5cblx0cHJpdmF0ZSBsaXN0ZW5lcnM6IEFycmF5PFpvb21MaXN0ZW5lcj4gPSBbXTtcblx0cHJpdmF0ZSB6b29tID0gMTtcblxuICAgIGNvbnN0cnVjdG9yKHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIHJlYWRvbmx5IHpvb21JbjogSFRNTEVsZW1lbnQsIHJlYWRvbmx5IHpvb21PdXQ6IEhUTUxFbGVtZW50KSB7XG4gICAgXHR6b29tSW4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlOkV2ZW50KSA9PiB0aGlzLmNsaWNrZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzLCAuOTUpKTtcbiAgICBcdHpvb21PdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlOkV2ZW50KSA9PiB0aGlzLmNsaWNrZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzLCAxLjA1KSk7XG4gICAgXHR2aWV3Q2FudmFzLmN0eC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5jbGlja2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcywgLjc1KSk7XG4gICAgfVxuXG4gICAgYWRkWm9vbUxpc3RlbmVyKHpvb21MaXN0ZW5lcjogWm9vbUxpc3RlbmVyKXtcbiAgICBcdHRoaXMubGlzdGVuZXJzLnB1c2goem9vbUxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICBjbGlja2VkKGV2ZW50OiBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzOiBWaWV3Q2FudmFzLCBieTogbnVtYmVyKSB7XG4gICAgXHRjb25zb2xlLmxvZyhcImNsaWNrZWRcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LnR5cGUpO1xuXG4gICAgXHRjb25zb2xlLmxvZyhcImxpc3RlbmVycyBcIiArIHRoaXMubGlzdGVuZXJzLmxlbmd0aCk7XG5cbiAgICAgICAgc3dpdGNoKGV2ZW50LnR5cGUpe1xuICAgICAgICAgICAgY2FzZSBcImRibGNsaWNrXCI6XG4gICAgICAgICAgICAgICAgbGV0IGNhbnZhcyA9IHZpZXdDYW52YXMuY3R4LmNhbnZhcztcbiAgICAgICAgICAgICAgICAvL1RPRE8gaG93IHRvIGZpbmQgcmVsYXRpdmUgcG9pbnRzP1xuICAgICAgICAgICAgICAgIGxldCB4UmVsID0gZXZlbnQuY2xpZW50WCAvIChjYW52YXMuY2xpZW50V2lkdGggLSBjYW52YXMuY2xpZW50TGVmdCk7XG4gICAgICAgICAgICAgICAgbGV0IHlSZWwgPSAoZXZlbnQuY2xpZW50WSAtIGNhbnZhcy5jbGllbnRUb3ApIC8gY2FudmFzLmNsaWVudEhlaWdodDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImNlbnRyaW5nIFwiICsgeFJlbCArIFwiLCBcIiArIHlSZWwpO1xuICAgICAgICAgICAgICAgIHZpZXdDYW52YXMuem9vbUFib3V0KHhSZWwsIHlSZWwsIGJ5KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdmlld0NhbnZhcy56b29tVmlldyhieSk7XG4gICAgICAgIH1cblxuICAgIFx0dGhpcy56b29tID0gdGhpcy56b29tICogYnk7XG4gICAgXHRmb3IgKGxldCB2YWx1ZSBvZiB0aGlzLmxpc3RlbmVycyl7XG4gICAgXHRcdHZhbHVlLnpvb20odGhpcy56b29tKTtcbiAgICBcdH1cblxuICAgIFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgfTtcblxufTtcblxuZXhwb3J0IGNsYXNzIFBhbkNvbnRyb2xsZXIgZXh0ZW5kcyBab29tTGlzdGVuZXJ7XG5cblx0cHJpdmF0ZSB4UHJldmlvdXM6IG51bWJlcjtcblx0cHJpdmF0ZSB5UHJldmlvdXM6IG51bWJlcjtcblx0cHJpdmF0ZSByZWNvcmQ6IGJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBiYXNlTW92ZTogbnVtYmVyID0gNTEyO1xuXHRwcml2YXRlIG1vdmU6IG51bWJlciA9IDUxMjtcblxuICAgIGNvbnN0cnVjdG9yKHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIHJlYWRvbmx5IGRyYWdFbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgIFx0c3VwZXIoKTtcbiAgICBcdGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzKSk7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcykpO1xuICAgIFx0ZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzKSk7XG4gICAgfVxuXG4gICAgem9vbShieTogbnVtYmVyKXtcbiAgICBcdGNvbnNvbGUubG9nKFwiem9vbSBieSBcIiArIGJ5KTtcbiAgICBcdHRoaXMubW92ZSA9IHRoaXMuYmFzZU1vdmUgLyBieTtcbiAgICB9XG5cbiAgICBkcmFnZ2VkKGV2ZW50OiBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzOiBWaWV3Q2FudmFzKSB7XG5cbiAgICBcdHN3aXRjaChldmVudC50eXBlKXtcbiAgICBcdFx0Y2FzZSBcIm1vdXNlZG93blwiOlxuICAgIFx0XHRcdHRoaXMucmVjb3JkID0gdHJ1ZTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIm1vdXNldXBcIjpcbiAgICBcdFx0XHR0aGlzLnJlY29yZCA9IGZhbHNlO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRkZWZhdWx0OlxuICAgIFx0XHRcdGlmICh0aGlzLnJlY29yZCl7XG5cbiAgICBcdFx0XHRcdGxldCB4RGVsdGEgPSAoZXZlbnQuY2xpZW50WCAtIHRoaXMueFByZXZpb3VzKSAvIHRoaXMubW92ZTtcblx0ICAgIFx0XHRcdGxldCB5RGVsdGEgPSAoZXZlbnQuY2xpZW50WSAtIHRoaXMueVByZXZpb3VzKSAvIHRoaXMubW92ZTtcblxuXHQgICAgXHRcdFx0bGV0IG5ld1RvcExlZnQgPSBuZXcgUG9pbnQyRCh2aWV3Q2FudmFzLnRvcExlZnQueCAtIHhEZWx0YSwgXG5cdCAgICBcdFx0XHRcdHZpZXdDYW52YXMudG9wTGVmdC55IC0geURlbHRhKTtcblxuXHQgICAgXHRcdFx0dmlld0NhbnZhcy5tb3ZlVmlldyhuZXdUb3BMZWZ0KTtcblx0ICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdH1cbiAgICBcdFx0XHRcbiAgICBcdH1cblxuXHRcdHRoaXMueFByZXZpb3VzID0gZXZlbnQuY2xpZW50WDtcblx0XHR0aGlzLnlQcmV2aW91cyA9IGV2ZW50LmNsaWVudFk7XG5cbiAgICB9O1xuXG59O1xuXG4iXX0=
