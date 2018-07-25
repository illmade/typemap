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
        this.opacity = 0.7;
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
        this.ctx.globalAlpha = 0.5;
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
        this.ctx.globalAlpha = 1;
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
    ViewCanvas.prototype.scale = function (ctx, pixelsPerUnit, dimension, reverse) {
        var viewScaling = this.getViewScaling(pixelsPerUnit);
        if (reverse) {
            ctx.scale(1 / viewScaling.x, 1 / viewScaling.y);
        }
        else {
            ctx.scale(viewScaling.x, viewScaling.y);
        }
    };
    ViewCanvas.prototype.draw = function () {
        var dimension = this.getDimensions();
        var localContext = this.offscreen;
        localContext.clearRect(0, 0, this.width, this.height);
        for (var _i = 0, _a = this.imageTileLayers; _i < _a.length; _i++) {
            var value = _a[_i];
            if (value.imageProperties.visible) {
                localContext.globalAlpha = value.imageProperties.opacity;
                this.scale(localContext, value.imageProperties.tileWidthPx, dimension, false);
                var tileScalingX = value.imageProperties.tileWidthPx / value.widthMapUnits;
                var tileScalingY = value.imageProperties.tileHeightPx / value.heightMapUnits;
                var tiles = value.getTiles(this.topLeft, dimension.x, dimension.y);
                for (var _b = 0, tiles_1 = tiles; _b < tiles_1.length; _b++) {
                    var tile = tiles_1[_b];
                    var tileX = (tile.xIndex - this.topLeft.x) * tileScalingX;
                    var tileY = (tile.yIndex - this.topLeft.y) * tileScalingY;
                    tile.draw(localContext, tileX, tileY);
                }
                this.scale(localContext, value.imageProperties.tileWidthPx, dimension, true);
                localContext.globalAlpha = 1;
            }
        }
        for (var _c = 0, _d = this.staticElements; _c < _d.length; _c++) {
            var value = _d[_c];
            //256 px is 1 map unit
            var tileScalingX = 256;
            var tileScalingY = 256;
            this.scale(localContext, 256, dimension, false);
            var imageX = (value.xIndex - this.topLeft.x) * tileScalingX;
            var imageY = (value.yIndex - this.topLeft.y) * tileScalingY;
            value.draw(localContext, imageX, imageY);
            this.scale(localContext, 256, dimension, true);
        }
        this.scale(localContext, 256, dimension, false);
        this.gridLayer.draw(this.topLeft, dimension.x, dimension.y);
        this.scale(localContext, 256, dimension, true);
        var imageData = localContext.getImageData(0, 0, this.width, this.height);
        this.ctx.clearRect(0, 0, this.width, this.height);
        // console.log("image data ", imageData);
        this.ctx.putImageData(imageData, 0, 0);
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
liffeyLabelLayerProperties.opacity = 1;
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
var dameImage = new canvastile_1.StaticImage(0.98, 2.315, .41, .428, -0.095, "images/maps_145_b_4_(2)_f016r_2[SVC2].png", 0.7);
var customImage = new canvastile_1.StaticImage(5.21, -.245, .42, .44, 0.03, "images/maps_145_b_4_(2)_f010r_2[SVC2].jpg", 0.7);
var manorImage = new canvastile_1.StaticImage(6.36, 0.025, .415, .435, 0.11, "images/maps_145_b_4_(2)_f011r[SVC2].jpg", 0.7);
var sackvilleImage = new canvastile_1.StaticImage(1.29, -1.28, .46, .42, -0.265, "images/maps_145_b_4_(2)_f004r[SVC2].jpg", 0.7);
var greatImage = new canvastile_1.StaticImage(.19, -0.705, .4, .42, -.51, "images/maps_145_b_4_(2)_f003r[SVC2].jpg", 0.7);
var lowerormondImage = new canvastile_1.StaticImage(0.16, 0.71, .405, .44, -0.205, "images/maps_145_b_4_(2)_f006r[SVC2].jpg", 0.7);
var stephensImage = new canvastile_1.StaticImage(1.73, 4.935, .415, .42, 0.205, "images/maps_145_b_4_(2)_f020R[SVC2].jpg", 0.7);
var marysImage = new canvastile_1.StaticImage(-1.055, 0.985, .43, .435, -0.21, "images/maps_145_b_4_(2)_f005r[SVC2].jpg", 0.7);
var steamImage = new canvastile_1.StaticImage(8.145, 0.265, .815, .92, 0.12, "images/maps_145_b_4_(2)_f012r_1[SVC2].jpg", 0.7);
var crossPoddle = new canvastile_1.StaticImage(-2.846, 6.125, .199, .205, -0.025, "images/wsc-maps-433-2.jpg", 0.7);
var patricksImage = new canvastile_1.StaticImage(-2.27, 5.95, .4, .4, 0.035, "images/wsc-maps-184-1-front.jpg", 0.6);
var clonmelImage = new canvastile_1.StaticImage(1.845, 8.12, .83, .83, -2.725, "images/wsc-maps-467-02.png", 0.7);
var broadstoneImage = new canvastile_1.StaticImage(-2.61, -0.055, 1.455, 1.455, 1.565, "images/wsc-maps-072.png", 0.7);
var parliamentImage = new canvastile_1.StaticImage(-0.9, 2.67, .5, .5, -3.32, "images/wsc-maps-088-1.png", 0.7);
var cutpurseImage = new canvastile_1.StaticImage(-3.885, 3.43, .535, .545, -0.074, "images/wsc-maps-106-1.jpg", 0.7);
var cutpatrickImage = new canvastile_1.StaticImage(-2.98, 4.32, 1.53, 1.53, -0.025, "images/WSC-Maps-757.png", 0.7);
var cutpatrickOverlayImage = new canvastile_1.StaticImage(-2.98, 4.32, 1.53, 1.53, -0.025, "images/WSC-Maps-757_overlay.png", 0.7);
var thingImage = new canvastile_1.StaticImage(-2.5, 3.6, 1.22, 1.16, 0, "images/IMG_0646.png", 0.4);
var grandImage = new canvastile_1.StaticImage(0.755, 3.2, .6, .6, 1.235, "images/wsc-maps-334.png", 0.4);
var totalImage = new canvastile_1.StaticImage(4.485, -1.875, 7.465, 7.35, 0, "images/maps_145_b_4_(2)_f001r[SVC2].jpg", .5);
var totalOverlayImage = new canvastile_1.StaticImage(4.45, -1.84, 3.893, 3.829, 0, "images/maps_145_b_4_(2)_f001r[SVC2].png", .5);
function showMap(divName, name) {
    var canvas = document.getElementById(divName);
    var ctx = canvas.getContext('2d');
    var viewCanvas = new viewcanvas_1.ViewCanvas(new point2d_1.Point2D(0, 0), 9, 6, ctx);
    // viewCanvas.addTileLayer(baseLayer);
    // viewCanvas.addTileLayer(sentinelLayer);
    //viewCanvas.addTileLayer(liffeySentinelLayer);
    viewCanvas.addTileLayer(liffeyLabelLayer);
    viewCanvas.addStaticElement(totalImage);
    viewCanvas.addStaticElement(totalOverlayImage);
    viewCanvas.addStaticElement(broadstoneImage);
    viewCanvas.addStaticElement(parliamentImage);
    viewCanvas.addStaticElement(cutpurseImage);
    viewCanvas.addStaticElement(grandImage);
    //viewCanvas.addStaticElement(cutpatrickImage);
    viewCanvas.addStaticElement(cutpatrickOverlayImage);
    viewCanvas.addStaticElement(dolierImage);
    viewCanvas.addStaticElement(trinityImage);
    viewCanvas.addStaticElement(poolbegImage);
    viewCanvas.addStaticElement(abbeyImage);
    viewCanvas.addStaticElement(lowerabbeyImage);
    viewCanvas.addStaticElement(busarasImage);
    viewCanvas.addStaticElement(steamImage);
    viewCanvas.addStaticElement(dameImage);
    viewCanvas.addStaticElement(customImage);
    viewCanvas.addStaticElement(manorImage);
    viewCanvas.addStaticElement(sackvilleImage);
    viewCanvas.addStaticElement(greatImage);
    viewCanvas.addStaticElement(lowerormondImage);
    viewCanvas.addStaticElement(stephensImage);
    viewCanvas.addStaticElement(marysImage);
    viewCanvas.addStaticElement(patricksImage);
    //viewCanvas.addStaticElement(crossPoddle);
    viewCanvas.addStaticElement(clonmelImage);
    viewCanvas.addStaticElement(thingImage);
    var imageController = new imageController_1.ImageController(viewCanvas, totalOverlayImage);
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
var MouseController = /** @class */ (function () {
    function MouseController() {
    }
    MouseController.prototype.mousePosition = function (event, within) {
        var m_posx = event.clientX + document.body.scrollLeft
            + document.documentElement.scrollLeft;
        var m_posy = event.clientY + document.body.scrollTop
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
    };
    return MouseController;
}());
var ZoomListener = /** @class */ (function () {
    function ZoomListener() {
    }
    return ZoomListener;
}());
var ZoomController = /** @class */ (function (_super) {
    __extends(ZoomController, _super);
    function ZoomController(viewCanvas, zoomIn, zoomOut) {
        var _this = _super.call(this) || this;
        _this.zoomIn = zoomIn;
        _this.zoomOut = zoomOut;
        _this.listeners = [];
        _this.zoom = 1;
        zoomIn.addEventListener("click", function (e) { return _this.clicked(e, viewCanvas, .95); });
        zoomOut.addEventListener("click", function (e) { return _this.clicked(e, viewCanvas, 1.05); });
        viewCanvas.ctx.canvas.addEventListener("dblclick", function (e) {
            return _this.clicked(e, viewCanvas, .75);
        });
        return _this;
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
                var mXY = this.mousePosition(event, viewCanvas.ctx.canvas);
                viewCanvas.zoomAbout(mXY.x / canvas.clientWidth, mXY.y / canvas.clientHeight, by);
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
}(MouseController));
exports.ZoomController = ZoomController;
;
var PanController = /** @class */ (function (_super) {
    __extends(PanController, _super);
    function PanController(viewCanvas, dragElement) {
        var _this = _super.call(this) || this;
        _this.dragElement = dragElement;
        _this.record = false;
        _this.baseMove = 256;
        _this.move = 256;
        dragElement.addEventListener("mousemove", function (e) {
            return _this.dragged(e, viewCanvas);
        });
        dragElement.addEventListener("mousedown", function (e) {
            return _this.dragged(e, viewCanvas);
        });
        dragElement.addEventListener("mouseup", function (e) {
            return _this.dragged(e, viewCanvas);
        });
        dragElement.addEventListener("mouseleave", function (e) {
            return _this.record = false;
        });
        return _this;
    }
    PanController.prototype.zoom = function (by) {
        console.log("zoom by " + by);
        this.move = this.baseMove / by;
    };
    PanController.prototype.dragged = function (event, viewCanvas) {
        var canvas = viewCanvas.ctx.canvas;
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
    PanController.prototype.mousePosition = function (event, within) {
        var m_posx = event.clientX + document.body.scrollLeft
            + document.documentElement.scrollLeft;
        var m_posy = event.clientY + document.body.scrollTop
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
    };
    return PanController;
}(ZoomListener));
exports.PanController = PanController;
;

},{"../geom/point2d":1}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2dlb20vdGlsZS50cyIsInNyYy9nZW9tL3ZpZXdwb3J0LnRzIiwic3JjL2dlb20vd29ybGQyZC50cyIsInNyYy9ncmFwaGljcy9jYW52YXN0aWxlLnRzIiwic3JjL2dyYXBoaWNzL2dyaWQudHMiLCJzcmMvZ3JhcGhpY3Mvdmlld2NhbnZhcy50cyIsInNyYy9zaW1wbGVXb3JsZC50cyIsInNyYy91aS9pbWFnZUNvbnRyb2xsZXIudHMiLCJzcmMvdWkvbWFwQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQ0E7SUFPSSxpQkFBWSxDQUFTLEVBQUUsQ0FBUztRQUM1QixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFRSwwQkFBUSxHQUFSO1FBQ0ksT0FBTyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDckQsQ0FBQztJQWJlLFlBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDekIsV0FBRyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQWM1QyxjQUFDO0NBaEJELEFBZ0JDLElBQUE7QUFoQlksMEJBQU87Ozs7O0FDRXBCO0lBRUMsbUJBQW1CLGFBQXFCLEVBQVMsY0FBc0I7UUFBcEQsa0JBQWEsR0FBYixhQUFhLENBQVE7UUFBUyxtQkFBYyxHQUFkLGNBQWMsQ0FBUTtJQUFFLENBQUM7SUFJMUUsNEJBQVEsR0FBUixVQUFTLFFBQWlCLEVBQUUsU0FBaUIsRUFBRSxTQUFpQjtRQUUvRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFD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QUM7Z0JBQ2xCLE1BQU07WUFDUCxLQUFLLEdBQUc7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO2dCQUMxRCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDUCxLQUFLLEdBQUc7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2dCQUM5RCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDUCxLQUFLLEdBQUc7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2dCQUM5RCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDUCxLQUFLLEdBQUc7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2dCQUM5RCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDUCxLQUFLLEdBQUc7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2dCQUM5RCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDUCxLQUFLLEdBQUc7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2dCQUM5RCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDUCxLQUFLLEdBQUc7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFR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QUN6QyxRQUFRLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQztRQUU5QyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQUM7WUFDcEIsR0FBRztnQkFDQyxNQUFNLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQztnQkFDNUIsTUFBTSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUM7YUFDOUIsUUFBUSxNQUFNLEdBQWdCLE1BQU0sQ0FBQyxZQUFZLEVBQUU7U0FDdkQ7UUFFRCxPQUFPLElBQUksaUJBQU8sQ0FBQyxNQUFNLEdBQUcsTUFBTSxFQUFFLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRUwsb0JBQUM7QUFBRCxDQXhFQSxBQXdFQyxDQXhFa0MsWUFBWSxHQXdFOUM7QUF4RVksc0NBQWE7QUF3RXpCLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcbmV4cG9ydCBjbGFzcyBQb2ludDJEIHtcbiAgICBzdGF0aWMgcmVhZG9ubHkgemVybyA9IG5ldyBQb2ludDJEKDAsIDApO1xuICAgIHN0YXRpYyByZWFkb25seSBvbmUgPSBuZXcgUG9pbnQyRCgxLCAxKTtcblxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcbiAgICByZWFkb25seSB5OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuXHR9XG5cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gXCJQb2ludDJEKFwiICsgdGhpcy54ICsgXCIsIFwiICsgdGhpcy55ICsgXCIpXCI7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgVW5pdHMgfSBmcm9tIFwiLi93b3JsZDJkXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4vcG9pbnQyZFwiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVGlsZUxheWVyIHtcblx0XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB3aWR0aE1hcFVuaXRzOiBudW1iZXIsIHB1YmxpYyBoZWlnaHRNYXBVbml0czogbnVtYmVyKXt9XG5cblx0YWJzdHJhY3QgZ2V0VGlsZSh4SW5kZXg6IG51bWJlciwgeUluZGV4OiBudW1iZXIpOiBUaWxlO1xuXG5cdGdldFRpbGVzKHBvc2l0aW9uOiBQb2ludDJELCB4TWFwVW5pdHM6IG51bWJlciwgeU1hcFVuaXRzOiBudW1iZXIpOiBBcnJheTxUaWxlPiB7XG5cblx0XHRsZXQgZmlyc3RYID0gTWF0aC5mbG9vcihwb3NpdGlvbi54IC8gdGhpcy53aWR0aE1hcFVuaXRzKTtcblx0XHRsZXQgbGFzdFggPSBNYXRoLmNlaWwoKHBvc2l0aW9uLnggKyB4TWFwVW5pdHMpLyB0aGlzLndpZHRoTWFwVW5pdHMpO1xuXG5cdFx0bGV0IGZpcnN0WSA9IE1hdGguZmxvb3IocG9zaXRpb24ueSAvIHRoaXMuaGVpZ2h0TWFwVW5pdHMpO1xuXHRcdGxldCBsYXN0WSA9IE1hdGguY2VpbCgocG9zaXRpb24ueSArIHlNYXBVbml0cykvIHRoaXMuaGVpZ2h0TWFwVW5pdHMpO1xuXG5cdFx0bGV0IHRpbGVzID0gbmV3IEFycmF5PFRpbGU+KCk7XG5cblx0XHRmb3IgKHZhciB4PWZpcnN0WDsgeDxsYXN0WDsgeCsrKXtcblx0XHRcdGZvciAodmFyIHk9Zmlyc3RZOyB5PGxhc3RZOyB5Kyspe1xuXHRcdFx0XHR0aWxlcy5wdXNoKHRoaXMuZ2V0VGlsZSh4LCB5KSlcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGlsZXM7XG5cdH1cblxufVxuXG5leHBvcnQgY2xhc3MgVGlsZSB7XG5cdFxuXHRzdGF0aWMgZW1wdHlUaWxlOiBUaWxlID0gbmV3IFRpbGUoLTEsLTEpO1xuXG5cdGNvbnN0cnVjdG9yKHhJbmRleDogbnVtYmVyLCB5SW5kZXg6IG51bWJlcil7fVxuXG59IiwiaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuL3BvaW50MmRcIjtcbmltcG9ydCB7IFZlY3RvcjJEIH0gZnJvbSBcIi4vdmVjdG9yMmRcIjtcbmltcG9ydCB7IFdvcmxkMkQsIFVuaXRzIH0gZnJvbSBcIi4vd29ybGQyZFwiO1xuXG5leHBvcnQgY2xhc3MgVmlld3BvcnQge1xuXHRcblx0Y29uc3RydWN0b3IocHVibGljIHRvcExlZnQ6IFBvaW50MkQsIFxuXHRcdHByaXZhdGUgd2lkdGhNYXBVbml0czogbnVtYmVyLCBwcml2YXRlIGhlaWdodE1hcFVuaXRzOiBudW1iZXIpe1xuXG5cdFx0Y29uc29sZS5sb2coXCJ3IGhcIiArIHdpZHRoTWFwVW5pdHMgKyBcIiwgXCIgKyBoZWlnaHRNYXBVbml0cyk7XG5cdH1cblxuXHRtb3ZlVmlldyh0b3BMZWZ0OiBQb2ludDJEKXtcblx0XHR0aGlzLnRvcExlZnQgPSB0b3BMZWZ0O1xuXHR9XG5cblx0em9vbVZpZXcoem9vbTogbnVtYmVyKXtcblx0XHRsZXQgbmV3V2lkdGggPSB0aGlzLndpZHRoTWFwVW5pdHMgKiB6b29tO1xuXHRcdGxldCBuZXdIZWlnaHQgPSB0aGlzLmhlaWdodE1hcFVuaXRzICogem9vbTtcblxuXHRcdGxldCBtb3ZlWCA9ICh0aGlzLndpZHRoTWFwVW5pdHMgLSBuZXdXaWR0aCkgLyAyO1xuXHRcdGxldCBtb3ZlWSA9ICh0aGlzLmhlaWdodE1hcFVuaXRzIC0gbmV3SGVpZ2h0KSAvIDI7XG5cblx0XHR0aGlzLnRvcExlZnQgPSBuZXcgUG9pbnQyRCh0aGlzLnRvcExlZnQueCArIG1vdmVYLCB0aGlzLnRvcExlZnQueSArIG1vdmVZKTtcblxuXHRcdHRoaXMud2lkdGhNYXBVbml0cyA9IG5ld1dpZHRoO1xuXHRcdHRoaXMuaGVpZ2h0TWFwVW5pdHMgPSBuZXdIZWlnaHQ7XG5cdH1cblxuXHR6b29tQWJvdXQoeFJlbGF0aXZlOiBudW1iZXIsIHlSZWxhdGl2ZTogbnVtYmVyLCB6b29tOiBudW1iZXIpe1xuXG5cdFx0bGV0IHhEaWZmID0gMC41IC0geFJlbGF0aXZlO1xuXHRcdGxldCB5RGlmZiA9IDAuNSAtIHlSZWxhdGl2ZTtcblxuXHRcdHZhciB4TW92ZSA9IHhEaWZmICogdGhpcy53aWR0aE1hcFVuaXRzO1xuXHRcdHZhciB5TW92ZSA9IHlEaWZmICogdGhpcy5oZWlnaHRNYXBVbml0cztcblxuXHRcdHRoaXMudG9wTGVmdCA9IG5ldyBQb2ludDJEKHRoaXMudG9wTGVmdC54IC0geE1vdmUsIHRoaXMudG9wTGVmdC55IC0geU1vdmUpO1xuXG5cdFx0dGhpcy56b29tVmlldyh6b29tKTtcblxuXHRcdHhNb3ZlID0geERpZmYgKiB0aGlzLndpZHRoTWFwVW5pdHM7XG5cdFx0eU1vdmUgPSB5RGlmZiAqIHRoaXMuaGVpZ2h0TWFwVW5pdHM7XG5cblx0XHR0aGlzLnRvcExlZnQgPSBuZXcgUG9pbnQyRCh0aGlzLnRvcExlZnQueCArIHhNb3ZlLCB0aGlzLnRvcExlZnQueSArIHlNb3ZlKTtcblxuXHR9XG5cblx0Z2V0RGltZW5zaW9ucygpe1xuXHRcdHJldHVybiBuZXcgUG9pbnQyRCh0aGlzLndpZHRoTWFwVW5pdHMsIHRoaXMuaGVpZ2h0TWFwVW5pdHMpO1xuXHR9XG5cbn0iLCJpbXBvcnQgeyBUaWxlTGF5ZXIgfSBmcm9tIFwiLi90aWxlXCI7XG5cbmV4cG9ydCBjbGFzcyBVbml0cyB7XG5cblx0c3RhdGljIHJlYWRvbmx5IFdlYldVID0gbmV3IFVuaXRzKFwiTWVyY2F0b3IgV2ViIFdvcmxkIFVuaXRzXCIpO1xuXG5cdGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyl7fVxuXG59XG4vKipcbiAgQSB3b3JsZCBpcyB0aGUgYmFzZSB0aGF0IGFsbCBvdGhlciBlbGVtZW50cyBvcmllbnRhdGUgZnJvbSBcbioqL1xuZXhwb3J0IGNsYXNzIFdvcmxkMkQge1xuXG5cdHByaXZhdGUgdGlsZUxheWVyczogQXJyYXk8VGlsZUxheWVyPiA9IFtdO1xuXHRcblx0Y29uc3RydWN0b3IoKXt9XG5cbiAgICBhZGRUaWxlTGF5ZXIodGlsZUxheWVyOiBUaWxlTGF5ZXIpOiBudW1iZXIge1xuICAgIFx0cmV0dXJuIHRoaXMudGlsZUxheWVycy5wdXNoKHRpbGVMYXllcik7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgVGlsZSwgVGlsZUxheWVyIH0gZnJvbSBcIi4uL2dlb20vdGlsZVwiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENhbnZhc1RpbGUgZXh0ZW5kcyBUaWxlIHtcblxuXHRhYnN0cmFjdCBkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBzY2FsaW5nWDogbnVtYmVyLCBzY2FsaW5nWTogbnVtYmVyLCBcblx0XHRjYW52YXNYOiBudW1iZXIsIGNhbnZhc1k6IG51bWJlcik6IHZvaWQ7XG5cbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlU3RydWN0IHtcblxuXHRwcmVmaXg6IHN0cmluZyA9IFwiXCI7XG5cdHN1ZmZpeDogc3RyaW5nID0gXCJcIjtcblx0dGlsZURpcjogc3RyaW5nID0gXCJpbWFnZXMvXCI7XG5cdHZpc2libGU6IGJvb2xlYW4gPSB0cnVlO1xuXHRvcGFjaXR5OiBudW1iZXIgPSAwLjc7XG5cdHRpbGVXaWR0aFB4OiBudW1iZXIgPSAyNTY7XG5cdHRpbGVIZWlnaHRQeDogbnVtYmVyID0gMjU2O1xuXHR3aWR0aE1hcFVuaXRzOiBudW1iZXIgPSAxO1xuXHRoZWlnaHRNYXBVbml0czogbnVtYmVyID0gMTsgXG5cbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlVGlsZSBleHRlbmRzIENhbnZhc1RpbGUge1xuXG5cdHByaXZhdGUgaW1nOiBIVE1MSW1hZ2VFbGVtZW50O1xuXG5cdGNvbnN0cnVjdG9yKHJlYWRvbmx5IHhJbmRleDogbnVtYmVyLCByZWFkb25seSB5SW5kZXg6IG51bWJlciwgaW1hZ2VTcmM6IHN0cmluZykge1xuXHRcdHN1cGVyKHhJbmRleCwgeUluZGV4KTtcblx0XHR0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuXHRcdHRoaXMuaW1nLnNyYyA9IGltYWdlU3JjO1xuXHR9O1xuXG5cdHByaXZhdGUgZHJhd0ltYWdlKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBjYW52YXNYOiBudW1iZXIsIGNhbnZhc1k6IG51bWJlcil7XG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZywgY2FudmFzWCwgY2FudmFzWSk7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBjYW52YXNYOiBudW1iZXIsIGNhbnZhc1k6IG51bWJlcil7XG5cdFx0aWYgKHRoaXMuaW1nLmNvbXBsZXRlKSB7XG5cdFx0XHR0aGlzLmRyYXdJbWFnZShjdHgsIGNhbnZhc1gsIGNhbnZhc1kpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuaW1nLm9ubG9hZCA9IChldmVudCkgPT4ge1xuXHRcdFx0XHR0aGlzLmltZy5jcm9zc09yaWdpbiA9IFwiQW5vbnltb3VzXCI7XG5cdFx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fTtcblxufVxuXG5leHBvcnQgY2xhc3MgU3RhdGljSW1hZ2Uge1xuXG5cdHByaXZhdGUgaW1nOiBIVE1MSW1hZ2VFbGVtZW50O1xuXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB4SW5kZXg6IG51bWJlciwgcHVibGljIHlJbmRleDogbnVtYmVyLCBcblx0XHRwdWJsaWMgc2NhbGluZ1g6IG51bWJlciwgcHVibGljIHNjYWxpbmdZOiBudW1iZXIsIHB1YmxpYyByb3RhdGlvbjogbnVtYmVyLCBcblx0XHRpbWFnZVNyYzogc3RyaW5nLCByZWFkb25seSBhbHBoYTogbnVtYmVyKSB7XG5cdFx0XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0fTtcblxuXHRwcml2YXRlIGRyYXdJbWFnZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgY2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpe1xuXG5cdFx0Ly9zY2FsaW5nWCA9IHNjYWxpbmdYICogdGhpcy5zY2FsaW5nO1xuXHRcdC8vc2NhbGluZ1kgPSBzY2FsaW5nWSAqIHRoaXMuc2NhbGluZztcblxuXHRcdC8vIGxldCBjb3NYID0gTWF0aC5jb3ModGhpcy5yb3RhdGlvbik7XG5cdFx0Ly8gbGV0IHNpblggPSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uKTtcblxuXHRcdGN0eC50cmFuc2xhdGUoY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0Y3R4LnJvdGF0ZSh0aGlzLnJvdGF0aW9uKTtcblx0XHRjdHguc2NhbGUodGhpcy5zY2FsaW5nWCwgdGhpcy5zY2FsaW5nWSk7XG5cdFx0Ly9jb25zb2xlLmxvZyhcInh5U2NhbGluZyBcIiArIHRoaXMuc2NhbGluZ1ggKyBcIiwgXCIgKyB0aGlzLnNjYWxpbmdZKTtcblx0XHRjdHguZ2xvYmFsQWxwaGEgPSB0aGlzLmFscGhhO1xuXG5cdFx0Ly8gY3R4LnRyYW5zZm9ybShjb3NYICogc2NhbGluZ1gsIHNpblggKiBzY2FsaW5nWSwgLXNpblggKiBzY2FsaW5nWCwgY29zWCAqIHNjYWxpbmdZLCBcblx0XHQvLyBcdGNhbnZhc1ggLyB0aGlzLnNjYWxpbmcsIGNhbnZhc1kgLyB0aGlzLnNjYWxpbmcpO1xuXG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZywgLSh0aGlzLmltZy53aWR0aC8yKSwgLSh0aGlzLmltZy5oZWlnaHQvMikpO1xuXHRcdFxuXHRcdGN0eC5zY2FsZSgxL3RoaXMuc2NhbGluZ1gsIDEvdGhpcy5zY2FsaW5nWSk7XG5cdFx0Y3R4LnJvdGF0ZSgtdGhpcy5yb3RhdGlvbik7XG5cdFx0Y3R4LnRyYW5zbGF0ZSgtY2FudmFzWCwgLWNhbnZhc1kpO1xuXHRcdGN0eC5nbG9iYWxBbHBoYSA9IDE7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBjYW52YXNYOiBudW1iZXIsIGNhbnZhc1k6IG51bWJlcil7XG5cdFx0aWYgKHRoaXMuaW1nLmNvbXBsZXRlKSB7XG5cdFx0XHR0aGlzLmRyYXdJbWFnZShjdHgsIGNhbnZhc1gsIGNhbnZhc1kpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuaW1nLm9ubG9hZCA9IChldmVudCkgPT4ge1xuXHRcdFx0XHR0aGlzLmltZy5jcm9zc09yaWdpbiA9IFwiQW5vbnltb3VzXCI7XG5cdFx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fTtcblxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VUaWxlTGF5ZXIgZXh0ZW5kcyBUaWxlTGF5ZXIge1xuXG5cdHJlYWRvbmx5IGltYWdlUHJvcGVydGllczogSW1hZ2VTdHJ1Y3Q7XG5cblx0Y29uc3RydWN0b3IoaW1hZ2VQcm9wZXJ0aWVzOiBJbWFnZVN0cnVjdCkge1xuXHRcdHN1cGVyKGltYWdlUHJvcGVydGllcy53aWR0aE1hcFVuaXRzLCBpbWFnZVByb3BlcnRpZXMuaGVpZ2h0TWFwVW5pdHMpO1xuXHRcdHRoaXMuaW1hZ2VQcm9wZXJ0aWVzID0gaW1hZ2VQcm9wZXJ0aWVzO1xuXHR9XG5cblx0LyoqXG5cdCAgbGVhdmUgY2FjaGluZyB1cCB0byB0aGUgYnJvd3NlclxuXHQqKi9cblx0Z2V0VGlsZSh4VW5pdHM6IG51bWJlciwgeVVuaXRzOiBudW1iZXIpOiBUaWxlIHtcblx0XHRsZXQgaW1hZ2VTcmMgPSB0aGlzLmltYWdlUHJvcGVydGllcy50aWxlRGlyICsgXG5cdFx0XHR0aGlzLmltYWdlUHJvcGVydGllcy5wcmVmaXggKyB4VW5pdHMgKyBcIl9cIiArIHlVbml0cyArIHRoaXMuaW1hZ2VQcm9wZXJ0aWVzLnN1ZmZpeDtcblx0XHRyZXR1cm4gbmV3IEltYWdlVGlsZSh4VW5pdHMsIHlVbml0cywgaW1hZ2VTcmMpO1xuXHR9XG5cbn1cbiIsImltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbmV4cG9ydCBjbGFzcyBHcmlkTGF5ZXIge1xuXG5cdHByaXZhdGUgZ3JpZFNwYWNpbmc6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGdyaWRTcGFjaW5nOiBudW1iZXIpIHtcblx0XHR0aGlzLmdyaWRTcGFjaW5nID0gZ3JpZFNwYWNpbmc7XG5cdH1cblxuXHRzZXRHcmlkU3BhY2luZyhncmlkU3BhY2luZzogbnVtYmVyKXtcblx0XHR0aGlzLmdyaWRTcGFjaW5nID0gZ3JpZFNwYWNpbmc7XG5cdH1cblx0LyoqXG5cdCAgbGVhdmUgY2FjaGluZyB1cCB0byB0aGUgYnJvd3NlclxuXHQqKi9cblx0ZHJhdyh0b3BMZWZ0OiBQb2ludDJELCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IHZvaWQge1xuXHRcdGxldCBtaW5YID0gTWF0aC5mbG9vcih0b3BMZWZ0LngpO1xuXHRcdGxldCBtaW5ZID0gTWF0aC5mbG9vcih0b3BMZWZ0LnkpO1xuXG5cdFx0dGhpcy5jdHguZ2xvYmFsQWxwaGEgPSAwLjU7XG5cdFx0dGhpcy5jdHgudHJhbnNsYXRlKC0yNTYgKiB0b3BMZWZ0LngsIC0yNTYgKiB0b3BMZWZ0LnkpO1xuXHRcdC8vY29uc29sZS5sb2coXCJtaW5zIFwiICsgd2lkdGggKyBcIiwgXCIgKyBoZWlnaHQpO1xuXG5cdFx0bGV0IGxhc3RYID0gTWF0aC5jZWlsKHRvcExlZnQueCArIHdpZHRoKTtcblx0XHRsZXQgbGFzdFkgPSBNYXRoLmNlaWwodG9wTGVmdC55ICsgaGVpZ2h0KTtcblxuXHRcdHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gJ2JsdWUnO1xuXHRcdHRoaXMuY3R4LmZvbnQgPSAnNDhweCBzZXJpZic7XG5cblx0XHRsZXQgeVplcm8gPSBtaW5ZICogdGhpcy5ncmlkU3BhY2luZyAqIDI1Njtcblx0XHRsZXQgeU1heCA9IGxhc3RZICogdGhpcy5ncmlkU3BhY2luZyAqIDI1Njtcblx0XHRsZXQgeEp1bXAgPSB0aGlzLmdyaWRTcGFjaW5nICogMjU2O1xuXG5cdFx0bGV0IHhaZXJvID0gbWluWCAqIHRoaXMuZ3JpZFNwYWNpbmcgKiAyNTY7XG5cdFx0bGV0IHhNYXggPSBsYXN0WCAqIHRoaXMuZ3JpZFNwYWNpbmcgKiAyNTY7XG5cdFx0bGV0IHlKdW1wID0gdGhpcy5ncmlkU3BhY2luZyAqIDI1NjtcblxuXHRcdHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgIFx0Ly90aGlzLmN0eC5jbGVhclJlY3QoeFplcm8sIHlaZXJvLCB4TWF4LCB5TWF4KTtcblxuXHRcdGZvciAodmFyIHggPSBtaW5YOyB4PGxhc3RYOyB4Kyspe1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImF0IFwiICsgbWluWCk7XG5cdFx0XHRsZXQgeE1vdmUgPSB4ICogeEp1bXA7XG5cdFx0XHR0aGlzLmN0eC5tb3ZlVG8oeE1vdmUsIHlaZXJvKTtcblx0XHRcdHRoaXMuY3R4LmxpbmVUbyh4TW92ZSwgeU1heCk7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgeSA9IG1pblk7IHk8bGFzdFk7IHkrKyl7XG5cdFx0XHRsZXQgeU1vdmUgPSB5ICogeUp1bXA7XG5cdFx0XHR0aGlzLmN0eC5tb3ZlVG8oeFplcm8sIHlNb3ZlKTtcblx0XHRcdHRoaXMuY3R4LmxpbmVUbyh4TWF4LCB5TW92ZSk7XG5cblx0XHRcdGZvciAodmFyIHggPSBtaW5YOyB4PGxhc3RYOyB4Kyspe1xuXHRcdFx0XHRsZXQgeE1vdmUgPSAoeCAtIDAuNSkgKiB4SnVtcDtcblx0XHRcdFx0eU1vdmUgPSAoeSAtIDAuNSkgKiB5SnVtcDtcblx0XHRcdFx0bGV0IHRleHQgPSBcIlwiICsgKHgtMSkgKyBcIiwgXCIgKyAoeS0xKTtcblx0XHRcdFx0dGhpcy5jdHguZmlsbFRleHQodGV4dCwgeE1vdmUsIHlNb3ZlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5jdHguc3Ryb2tlKCk7XG5cdFx0dGhpcy5jdHgudHJhbnNsYXRlKDI1NiAqIHRvcExlZnQueCwgMjU2ICogdG9wTGVmdC55KTtcblx0XHR0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IDE7XG5cdH1cblxuXG59IiwiaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tIFwiLi4vZ2VvbS92aWV3cG9ydFwiO1xuaW1wb3J0IHsgV29ybGQyRCB9IGZyb20gXCIuLi9nZW9tL3dvcmxkMmRcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBTdGF0aWNJbWFnZSwgSW1hZ2VUaWxlLCBJbWFnZVRpbGVMYXllciB9IGZyb20gXCIuL2NhbnZhc3RpbGVcIjtcbmltcG9ydCB7IEdyaWRMYXllciB9IGZyb20gXCIuL2dyaWRcIjtcblxuZXhwb3J0IGNsYXNzIFZpZXdDYW52YXMgZXh0ZW5kcyBWaWV3cG9ydCB7XG5cbiAgICBwcml2YXRlIHN0YXRpY0VsZW1lbnRzOiBBcnJheTxTdGF0aWNJbWFnZT4gPSBbXTtcbiAgICBwcml2YXRlIGltYWdlVGlsZUxheWVycyA9IFtdO1xuXG4gICAgcHJpdmF0ZSBncmlkTGF5ZXI6IEdyaWRMYXllcjtcblxuICAgIHByaXZhdGUgb2Zmc2NyZWVuOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgcHJpdmF0ZSB3aWR0aDogbnVtYmVyO1xuICAgIHByaXZhdGUgaGVpZ2h0OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcih0b3BMZWZ0OiBQb2ludDJELCBcbiAgICBcdHdpZHRoTWFwVW5pdHM6IG51bWJlciwgaGVpZ2h0TWFwVW5pdHM6IG51bWJlciwgXG4gICAgXHRwdWJsaWMgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpIHtcblxuICAgIFx0c3VwZXIodG9wTGVmdCwgd2lkdGhNYXBVbml0cywgaGVpZ2h0TWFwVW5pdHMpO1xuXG4gICAgICAgIHRoaXMud2lkdGggPSBjdHguY2FudmFzLmNsaWVudFdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGN0eC5jYW52YXMuY2xpZW50SGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuY3R4LmNhbnZhcy53aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgIHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcblxuICAgICAgICBjb25zb2xlLmxvZyhcIm9uc2NyZWVuIFwiICsgdGhpcy5jdHguY2FudmFzLndpZHRoICsgXCIsIFwiICsgdGhpcy5jdHguY2FudmFzLmhlaWdodCk7XG5cbiAgICAgICAgLy9jb25zdCBjID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICAgICAgY29uc3QgYyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm9mZnNjcmVlblwiKTtcbiAgICAgICAgYy53aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgIGMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5vZmZzY3JlZW4gPSA8Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEPmMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwib2Zmc2NyZWVuIFwiICsgdGhpcy5jdHguY2FudmFzLmNsaWVudFdpZHRoKTtcblxuICAgIFx0dGhpcy5ncmlkTGF5ZXIgPSBuZXcgR3JpZExheWVyKHRoaXMuY3R4LCAxKTtcbiAgICB9XG5cbiAgICBhZGRUaWxlTGF5ZXIoaW1hZ2VUaWxlTGF5ZXI6IEltYWdlVGlsZUxheWVyKTogdm9pZCB7XG4gICAgXHR0aGlzLmltYWdlVGlsZUxheWVycy5wdXNoKGltYWdlVGlsZUxheWVyKTtcbiAgICB9XG5cbiAgICBhZGRTdGF0aWNFbGVtZW50KHN0YXRpY0ltYWdlOiBTdGF0aWNJbWFnZSk6IHZvaWQge1xuICAgIFx0dGhpcy5zdGF0aWNFbGVtZW50cy5wdXNoKHN0YXRpY0ltYWdlKTtcbiAgICB9XG5cbiAgICBnZXRWaWV3U2NhbGluZyhwaXhlbHNQZXJVbml0OiBudW1iZXIpOiBQb2ludDJEIHtcbiAgICBcdGxldCBkaW1lbnNpb24gPSB0aGlzLmdldERpbWVuc2lvbnMoKTtcbiAgICBcdGxldCB2aWV3U2NhbGluZ1ggPSB0aGlzLmN0eC5jYW52YXMuY2xpZW50V2lkdGggLyBkaW1lbnNpb24ueCAvIHBpeGVsc1BlclVuaXQ7XG4gICAgXHRsZXQgdmlld1NjYWxpbmdZID0gdGhpcy5jdHguY2FudmFzLmNsaWVudEhlaWdodCAvIGRpbWVuc2lvbi55IC8gcGl4ZWxzUGVyVW5pdDtcbiAgICBcdHJldHVybiBuZXcgUG9pbnQyRCh2aWV3U2NhbGluZ1gsIHZpZXdTY2FsaW5nWSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzY2FsZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgXG4gICAgICAgIHBpeGVsc1BlclVuaXQ6IG51bWJlciwgZGltZW5zaW9uOiBQb2ludDJELCByZXZlcnNlOiBib29sZWFuKTogdm9pZCB7XG5cbiAgICBcdGxldCB2aWV3U2NhbGluZyA9IHRoaXMuZ2V0Vmlld1NjYWxpbmcocGl4ZWxzUGVyVW5pdCk7XG5cbiAgICBcdGlmIChyZXZlcnNlKXtcbiAgICBcdFx0Y3R4LnNjYWxlKDEvdmlld1NjYWxpbmcueCwgMS92aWV3U2NhbGluZy55KTtcbiAgICBcdH0gZWxzZSB7XG4gICAgXHRcdGN0eC5zY2FsZSh2aWV3U2NhbGluZy54LCB2aWV3U2NhbGluZy55KTtcbiAgICBcdH1cbiAgICBcdFxuICAgIH1cblxuICAgIGRyYXcoKTogdm9pZCB7XG4gICAgXHRsZXQgZGltZW5zaW9uID0gdGhpcy5nZXREaW1lbnNpb25zKCk7XG5cbiAgICAgICAgbGV0IGxvY2FsQ29udGV4dCA9IHRoaXMub2Zmc2NyZWVuO1xuXG4gICAgXHRsb2NhbENvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuICAgIFx0Zm9yIChsZXQgdmFsdWUgb2YgdGhpcy5pbWFnZVRpbGVMYXllcnMpe1xuICAgIFx0XHRpZiAodmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnZpc2libGUpIHtcblxuICAgICAgICAgICAgICAgIGxvY2FsQ29udGV4dC5nbG9iYWxBbHBoYSA9IHZhbHVlLmltYWdlUHJvcGVydGllcy5vcGFjaXR5O1xuXG4gICAgXHRcdFx0dGhpcy5zY2FsZShsb2NhbENvbnRleHQsIHZhbHVlLmltYWdlUHJvcGVydGllcy50aWxlV2lkdGhQeCwgZGltZW5zaW9uLCBmYWxzZSk7XG5cbiAgICBcdFx0XHRsZXQgdGlsZVNjYWxpbmdYID0gdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVXaWR0aFB4IC8gdmFsdWUud2lkdGhNYXBVbml0cztcbiAgICBcdFx0XHRsZXQgdGlsZVNjYWxpbmdZID0gdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVIZWlnaHRQeCAvIHZhbHVlLmhlaWdodE1hcFVuaXRzO1xuXG4gICAgXHRcdFx0bGV0IHRpbGVzOiBBcnJheTxJbWFnZVRpbGU+ID0gdmFsdWUuZ2V0VGlsZXModGhpcy50b3BMZWZ0LCBcbiAgICBcdFx0XHRcdGRpbWVuc2lvbi54LCBkaW1lbnNpb24ueSk7XG5cbiAgICBcdFx0XHRmb3IgKGxldCB0aWxlIG9mIHRpbGVzKXtcbiAgICBcdFx0XHRcdHZhciB0aWxlWCA9ICh0aWxlLnhJbmRleCAtIHRoaXMudG9wTGVmdC54KSAqIHRpbGVTY2FsaW5nWDtcbiAgICBcdFx0XHRcdHZhciB0aWxlWSA9ICh0aWxlLnlJbmRleCAtIHRoaXMudG9wTGVmdC55KSAqIHRpbGVTY2FsaW5nWTtcblxuICAgIFx0XHRcdFx0dGlsZS5kcmF3KGxvY2FsQ29udGV4dCwgdGlsZVgsIHRpbGVZKTtcbiAgICBcdFx0XHR9XG5cbiAgICBcdFx0XHR0aGlzLnNjYWxlKGxvY2FsQ29udGV4dCwgdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVXaWR0aFB4LCBkaW1lbnNpb24sIHRydWUpO1xuICAgICAgICAgICAgICAgIGxvY2FsQ29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XG4gICAgXHRcdH1cbiAgICBcdH1cblxuICAgIFx0Zm9yIChsZXQgdmFsdWUgb2YgdGhpcy5zdGF0aWNFbGVtZW50cyl7XG4gICAgXHRcdC8vMjU2IHB4IGlzIDEgbWFwIHVuaXRcblx0XHRcdGxldCB0aWxlU2NhbGluZ1ggPSAyNTY7XG5cdFx0XHRsZXQgdGlsZVNjYWxpbmdZID0gMjU2O1xuXG4gICAgXHRcdHRoaXMuc2NhbGUobG9jYWxDb250ZXh0LCAyNTYsIGRpbWVuc2lvbiwgZmFsc2UpO1xuXG4gICAgXHRcdGxldCBpbWFnZVggPSAodmFsdWUueEluZGV4IC0gdGhpcy50b3BMZWZ0LngpICogdGlsZVNjYWxpbmdYO1xuICAgIFx0XHRsZXQgaW1hZ2VZID0gKHZhbHVlLnlJbmRleCAtIHRoaXMudG9wTGVmdC55KSAqIHRpbGVTY2FsaW5nWTtcblxuICAgIFx0XHR2YWx1ZS5kcmF3KGxvY2FsQ29udGV4dCwgaW1hZ2VYLCBpbWFnZVkpO1xuICAgIFx0XHR0aGlzLnNjYWxlKGxvY2FsQ29udGV4dCwgMjU2LCBkaW1lbnNpb24sIHRydWUpO1xuXG4gICAgXHR9XG5cbiAgICBcdHRoaXMuc2NhbGUobG9jYWxDb250ZXh0LCAyNTYsIGRpbWVuc2lvbiwgZmFsc2UpO1xuICAgIFx0dGhpcy5ncmlkTGF5ZXIuZHJhdyh0aGlzLnRvcExlZnQsIGRpbWVuc2lvbi54LCBkaW1lbnNpb24ueSk7XG4gICAgXHR0aGlzLnNjYWxlKGxvY2FsQ29udGV4dCwgMjU2LCBkaW1lbnNpb24sIHRydWUpO1xuXG4gICAgICAgIGxldCBpbWFnZURhdGE6IEltYWdlRGF0YSA9IGxvY2FsQ29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiaW1hZ2UgZGF0YSBcIiwgaW1hZ2VEYXRhKTtcbiAgICAgICAgdGhpcy5jdHgucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG5cbiAgICAgICAgdGhpcy5kcmF3Q2VudHJlKHRoaXMuY3R4KTtcblxuICAgIH1cblxuICAgIGRyYXdDZW50cmUoY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKXtcbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKHRoaXMud2lkdGgvMiwgMCk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKHRoaXMud2lkdGgvMiwgdGhpcy5oZWlnaHQpO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbygwLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8odGhpcy53aWR0aCwgdGhpcy5oZWlnaHQvMik7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgV29ybGQyRCB9IGZyb20gXCIuL2dlb20vd29ybGQyZFwiO1xuaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tIFwiLi9nZW9tL3ZpZXdwb3J0XCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBTdGF0aWNJbWFnZSwgSW1hZ2VUaWxlTGF5ZXIsIEltYWdlU3RydWN0IH0gZnJvbSBcIi4vZ3JhcGhpY3MvY2FudmFzdGlsZVwiO1xuaW1wb3J0IHsgVmlld0NhbnZhcyB9IGZyb20gXCIuL2dyYXBoaWNzL3ZpZXdjYW52YXNcIjtcbmltcG9ydCB7IFpvb21Db250cm9sbGVyLCBQYW5Db250cm9sbGVyIH0gZnJvbSBcIi4vdWkvbWFwQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgSW1hZ2VDb250cm9sbGVyIH0gZnJvbSBcIi4vdWkvaW1hZ2VDb250cm9sbGVyXCI7XG5cbmxldCBzaW1wbGVXb3JsZCA9IG5ldyBXb3JsZDJEKCk7XG5cbi8vIGxldCBsYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbi8vIGxheWVyUHJvcGVydGllcy5wcmVmaXggPSBcIlwiO1xuLy8gbGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwiLnBuZ1wiO1xuXG4vLyBsZXQgcm9hZExheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuLy8gcm9hZExheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImIucG5nXCI7XG5cbi8vIGxldCBzZW50aW5lbExheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuLy8gc2VudGluZWxMYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCJsLmpwZWdcIjtcblxuLy8gbGV0IHNlbnRpbmVsVGVycmFpbkxheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuLy8gc2VudGluZWxUZXJyYWluTGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwidC5qcGVnXCI7XG5cbmxldCBsaWZmZXlMYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbmxpZmZleUxheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImxpZmZleS5qcGVnXCI7XG5saWZmZXlMYXllclByb3BlcnRpZXMudGlsZURpciA9IFwiaW1hZ2VzL2xpZmZleS9cIjtcblxubGV0IGxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG5saWZmZXlMYWJlbExheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImxpZmZleS5wbmdcIjtcbmxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzLm9wYWNpdHkgPSAxO1xubGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMudGlsZURpciA9IFwiaW1hZ2VzL2xpZmZleS9cIjtcbmxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzLnZpc2libGUgPSB0cnVlO1xuXG4vLyBsZXQgYmFzZUxheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKGxheWVyUHJvcGVydGllcyk7XG4vLyBsZXQgc2VudGluZWxMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihzZW50aW5lbExheWVyUHJvcGVydGllcyk7XG4vLyBsZXQgcm9hZExheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKHJvYWRMYXllclByb3BlcnRpZXMpO1xuLy8gbGV0IHRlcnJhaW5MYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihzZW50aW5lbFRlcnJhaW5MYXllclByb3BlcnRpZXMpO1xuXG5sZXQgbGlmZmV5U2VudGluZWxMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihsaWZmZXlMYXllclByb3BlcnRpZXMpO1xubGV0IGxpZmZleUxhYmVsTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIobGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMpO1xuXG5sZXQgZG9saWVySW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMi4yNCwgMS44NywgLjQzLCAuNDMsIC0wLjA2LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDE3UltTVkMyXS5qcGdcIiwgLjcpO1xuXG5sZXQgdHJpbml0eUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDEuOTksIDMuNTksIC40MywgLjQzLCAwLjE1LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDE5UltTVkMyXS5qcGdcIiwgLjcpO1xuXG5sZXQgcG9vbGJlZ0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDMuMzQsIDEuNjI1LCAuNDA1LCAuNDMsIDAuMDUsXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAxOFJbU1ZDMl0uanBnXCIsIC43KTtcblxubGV0IGFiYmV5SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMi4zOSwgMC4wMzUsIC40MTUsIC40MzUsIC0uMjUsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDhyW1NWQzJdLmpwZ1wiLCAuNyk7XG5cbmxldCBidXNhcmFzSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMy40OSwgLTAuMjQsIC40MSwgLjQyNSwgLS4yNiwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwOXJbU1ZDMl0uanBnXCIsIC43KTtcblxubGV0IGxvd2VyYWJiZXlJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgxLjI5NSwgMC4zNzc2LCAuNDI1LCAuNDM1LCAtLjIzLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDA3cltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IGRhbWVJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgwLjk4LCAyLjMxNSwgLjQxLCAuNDI4LCAtMC4wOTUsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMTZyXzJbU1ZDMl0ucG5nXCIsIDAuNyk7XG5cbmxldCBjdXN0b21JbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSg1LjIxLCAtLjI0NSwgLjQyLCAuNDQsIDAuMDMsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMTByXzJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBtYW5vckltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDYuMzYsIDAuMDI1LCAuNDE1LCAuNDM1LCAwLjExLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDExcltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IHNhY2t2aWxsZUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDEuMjksIC0xLjI4LCAuNDYsIC40MiwgLTAuMjY1LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDA0cltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IGdyZWF0SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLjE5LCAtMC43MDUsIC40LCAuNDIsIC0uNTEsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDNyW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgbG93ZXJvcm1vbmRJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgwLjE2LCAwLjcxLCAuNDA1LCAuNDQsIC0wLjIwNSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwNnJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBzdGVwaGVuc0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDEuNzMsIDQuOTM1LCAuNDE1LCAuNDIsIDAuMjA1LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDIwUltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IG1hcnlzSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTEuMDU1LCAwLjk4NSwgLjQzLCAuNDM1LCAtMC4yMSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwNXJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBzdGVhbUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDguMTQ1LCAwLjI2NSwgLjgxNSwgLjkyLCAwLjEyLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDEycl8xW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgY3Jvc3NQb2RkbGUgPSBuZXcgU3RhdGljSW1hZ2UoLTIuODQ2LCA2LjEyNSwgLjE5OSwgLjIwNSwgLTAuMDI1LCBcblx0XCJpbWFnZXMvd3NjLW1hcHMtNDMzLTIuanBnXCIsIDAuNyk7XG5cbmxldCBwYXRyaWNrc0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0yLjI3LCA1Ljk1LCAuNCwgLjQsIDAuMDM1LCBcblx0XCJpbWFnZXMvd3NjLW1hcHMtMTg0LTEtZnJvbnQuanBnXCIsIDAuNik7XG5cbmxldCBjbG9ubWVsSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMS44NDUsIDguMTIsIC44MywgLjgzLCAtMi43MjUsIFxuXHRcImltYWdlcy93c2MtbWFwcy00NjctMDIucG5nXCIsIDAuNyk7XG5cbmxldCBicm9hZHN0b25lSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTIuNjEsIC0wLjA1NSwgMS40NTUsIDEuNDU1LCAxLjU2NSwgXG5cdFwiaW1hZ2VzL3dzYy1tYXBzLTA3Mi5wbmdcIiwgMC43KTtcblxubGV0IHBhcmxpYW1lbnRJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMC45LCAyLjY3LCAuNSwgLjUsIC0zLjMyLCBcblx0XCJpbWFnZXMvd3NjLW1hcHMtMDg4LTEucG5nXCIsIDAuNyk7XG5cbmxldCBjdXRwdXJzZUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0zLjg4NSwgMy40MywgLjUzNSwgLjU0NSwgLTAuMDc0LCBcblx0XCJpbWFnZXMvd3NjLW1hcHMtMTA2LTEuanBnXCIsIDAuNyk7XG5cbmxldCBjdXRwYXRyaWNrSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTIuOTgsIDQuMzIsIDEuNTMsIDEuNTMsIC0wLjAyNSwgXG5cdFwiaW1hZ2VzL1dTQy1NYXBzLTc1Ny5wbmdcIiwgMC43KTtcblxubGV0IGN1dHBhdHJpY2tPdmVybGF5SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTIuOTgsIDQuMzIsIDEuNTMsIDEuNTMsIC0wLjAyNSwgXG5cdFwiaW1hZ2VzL1dTQy1NYXBzLTc1N19vdmVybGF5LnBuZ1wiLCAwLjcpO1xuXG5sZXQgdGhpbmdJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMi41LCAzLjYsIDEuMjIsIDEuMTYsIDAsIFxuXHRcImltYWdlcy9JTUdfMDY0Ni5wbmdcIiwgMC40KTtcblxubGV0IGdyYW5kSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMC43NTUsIDMuMiwgLjYsIC42LCAxLjIzNSwgXCJpbWFnZXMvd3NjLW1hcHMtMzM0LnBuZ1wiLCAwLjQpO1xuXG5sZXQgdG90YWxJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSg0LjQ4NSwgLTEuODc1LCA3LjQ2NSwgNy4zNSwgMCwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwMXJbU1ZDMl0uanBnXCIsIC41KTtcblxubGV0IHRvdGFsT3ZlcmxheUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDQuNDUsIC0xLjg0LCAzLjg5MywgMy44MjksIDAsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDFyW1NWQzJdLnBuZ1wiLCAuNSk7XG5cbmZ1bmN0aW9uIHNob3dNYXAoZGl2TmFtZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGl2TmFtZSk7XG5cbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cblx0bGV0IHZpZXdDYW52YXMgPSBuZXcgVmlld0NhbnZhcyhuZXcgUG9pbnQyRCgwLDApLCA5LCA2LCBjdHgpO1xuXHQvLyB2aWV3Q2FudmFzLmFkZFRpbGVMYXllcihiYXNlTGF5ZXIpO1xuXHQvLyB2aWV3Q2FudmFzLmFkZFRpbGVMYXllcihzZW50aW5lbExheWVyKTtcblx0Ly92aWV3Q2FudmFzLmFkZFRpbGVMYXllcihsaWZmZXlTZW50aW5lbExheWVyKTtcblx0dmlld0NhbnZhcy5hZGRUaWxlTGF5ZXIobGlmZmV5TGFiZWxMYXllcik7XG5cblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHRvdGFsSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQodG90YWxPdmVybGF5SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoYnJvYWRzdG9uZUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHBhcmxpYW1lbnRJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChjdXRwdXJzZUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGdyYW5kSW1hZ2UpO1xuXHQvL3ZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChjdXRwYXRyaWNrSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoY3V0cGF0cmlja092ZXJsYXlJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChkb2xpZXJJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudCh0cmluaXR5SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQocG9vbGJlZ0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGFiYmV5SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQobG93ZXJhYmJleUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGJ1c2FyYXNJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChzdGVhbUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGRhbWVJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChjdXN0b21JbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChtYW5vckltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHNhY2t2aWxsZUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGdyZWF0SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQobG93ZXJvcm1vbmRJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChzdGVwaGVuc0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KG1hcnlzSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQocGF0cmlja3NJbWFnZSk7XG5cdC8vdmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGNyb3NzUG9kZGxlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGNsb25tZWxJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudCh0aGluZ0ltYWdlKTtcblxuXHRsZXQgaW1hZ2VDb250cm9sbGVyID0gbmV3IEltYWdlQ29udHJvbGxlcih2aWV3Q2FudmFzLCB0b3RhbE92ZXJsYXlJbWFnZSk7XG5cblx0Y29uc3QgcGx1cyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBsdXNcIik7XG5cdGNvbnN0IG1pbnVzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWludXNcIik7XG5cblx0bGV0IHBhbkNvbnRyb2wgPSBuZXcgUGFuQ29udHJvbGxlcih2aWV3Q2FudmFzLCBjYW52YXMpO1xuXHRsZXQgY2FudmFzQ29udHJvbCA9IG5ldyBab29tQ29udHJvbGxlcih2aWV3Q2FudmFzLCBwbHVzLCBtaW51cyk7XG5cblx0Y2FudmFzQ29udHJvbC5hZGRab29tTGlzdGVuZXIocGFuQ29udHJvbCk7XG5cblx0dmlld0NhbnZhcy5kcmF3KCk7XG59XG5cbmZ1bmN0aW9uIHNob3coKXtcblx0c2hvd01hcChcImNhbnZhc1wiLCBcIlR5cGVTY3JpcHRcIik7XG59XG5cbmlmIChcbiAgICBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgfHxcbiAgICAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gXCJsb2FkaW5nXCIgJiYgIWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5kb1Njcm9sbClcbikge1xuXHRzaG93KCk7XG59IGVsc2Uge1xuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBzaG93KTtcbn1cblxuIiwiaW1wb3J0IHsgU3RhdGljSW1hZ2UgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvY2FudmFzdGlsZVwiO1xuaW1wb3J0IHsgVmlld0NhbnZhcyB9IGZyb20gXCIuLi9ncmFwaGljcy92aWV3Y2FudmFzXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgY2xhc3MgSW1hZ2VDb250cm9sbGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIHJlYWRvbmx5IHN0YXRpY0ltYWdlOiBTdGF0aWNJbWFnZSkge1xuICAgIFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5wcmVzc2VkKHZpZXdDYW52YXMsIGUgIGFzIEtleWJvYXJkRXZlbnQpKTtcbiAgICB9XG5cbiAgICBwcmVzc2VkKHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgXHRjb25zb2xlLmxvZyhcInByZXNzZWRcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LmtleSk7XG5cbiAgICBcdHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgXHRcdGNhc2UgXCJhXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS54SW5kZXggPSB0aGlzLnN0YXRpY0ltYWdlLnhJbmRleCAtIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiZFwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2UueEluZGV4ID0gdGhpcy5zdGF0aWNJbWFnZS54SW5kZXggKyAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIndcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnlJbmRleCA9IHRoaXMuc3RhdGljSW1hZ2UueUluZGV4IC0gMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJzXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS55SW5kZXggPSB0aGlzLnN0YXRpY0ltYWdlLnlJbmRleCArIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiZVwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uucm90YXRpb24gPSB0aGlzLnN0YXRpY0ltYWdlLnJvdGF0aW9uIC0gMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJxXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5yb3RhdGlvbiA9IHRoaXMuc3RhdGljSW1hZ2Uucm90YXRpb24gKyAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInhcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdYID0gdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWCAtIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiWFwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1ggPSB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdYICsgMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJ6XCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWSA9IHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1kgLSAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIlpcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdZID0gdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWSArIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRkZWZhdWx0OlxuICAgIFx0XHRcdC8vIGNvZGUuLi5cbiAgICBcdFx0XHRicmVhaztcbiAgICBcdH1cbiAgICBcdGNvbnNvbGUubG9nKFwiaW1hZ2UgYXQ6IFwiICsgIHRoaXMuc3RhdGljSW1hZ2UueEluZGV4ICsgXCIsIFwiICsgdGhpcy5zdGF0aWNJbWFnZS55SW5kZXgpO1xuICAgIFx0Y29uc29sZS5sb2coXCJpbWFnZSBybyBzYzogXCIgKyAgdGhpcy5zdGF0aWNJbWFnZS5yb3RhdGlvbiArIFwiLCBcIiArIHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1ggKyBcIiwgXCIgKyB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdZKTtcbiAgICB9O1xuXG59OyIsImltcG9ydCB7IFZpZXdDYW52YXMgfSBmcm9tIFwiLi4vZ3JhcGhpY3Mvdmlld2NhbnZhc1wiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuYWJzdHJhY3QgY2xhc3MgTW91c2VDb250cm9sbGVyIHtcblxuICAgIG1vdXNlUG9zaXRpb24oZXZlbnQ6IE1vdXNlRXZlbnQsIHdpdGhpbjogSFRNTEVsZW1lbnQpOiBQb2ludDJEIHtcbiAgICAgICAgbGV0IG1fcG9zeCA9IGV2ZW50LmNsaWVudFggKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnRcbiAgICAgICAgICAgICAgICAgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdDtcbiAgICAgICAgbGV0IG1fcG9zeSA9IGV2ZW50LmNsaWVudFkgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7XG5cbiAgICAgICAgdmFyIGVfcG9zeCA9IDA7XG4gICAgICAgIHZhciBlX3Bvc3kgPSAwO1xuICAgICAgICBpZiAod2l0aGluLm9mZnNldFBhcmVudCl7XG4gICAgICAgICAgICBkbyB7IFxuICAgICAgICAgICAgICAgIGVfcG9zeCArPSB3aXRoaW4ub2Zmc2V0TGVmdDtcbiAgICAgICAgICAgICAgICBlX3Bvc3kgKz0gd2l0aGluLm9mZnNldFRvcDtcbiAgICAgICAgICAgIH0gd2hpbGUgKHdpdGhpbiA9IDxIVE1MRWxlbWVudD53aXRoaW4ub2Zmc2V0UGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQyRChtX3Bvc3ggLSBlX3Bvc3gsIG1fcG9zeSAtIGVfcG9zeSk7XG4gICAgfVxuICAgIFxufVxuXG5hYnN0cmFjdCBjbGFzcyBab29tTGlzdGVuZXIge1xuICAgIGFic3RyYWN0IHpvb20oYnk6IG51bWJlcik7XG59XG5cbmV4cG9ydCBjbGFzcyBab29tQ29udHJvbGxlciBleHRlbmRzIE1vdXNlQ29udHJvbGxlciB7XG5cblx0cHJpdmF0ZSBsaXN0ZW5lcnM6IEFycmF5PFpvb21MaXN0ZW5lcj4gPSBbXTtcblx0cHJpdmF0ZSB6b29tID0gMTtcblxuICAgIGNvbnN0cnVjdG9yKHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIHJlYWRvbmx5IHpvb21JbjogSFRNTEVsZW1lbnQsIHJlYWRvbmx5IHpvb21PdXQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICBcdHpvb21Jbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGU6RXZlbnQpID0+IHRoaXMuY2xpY2tlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdDYW52YXMsIC45NSkpO1xuICAgIFx0em9vbU91dC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGU6RXZlbnQpID0+IHRoaXMuY2xpY2tlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdDYW52YXMsIDEuMDUpKTtcbiAgICBcdHZpZXdDYW52YXMuY3R4LmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmNsaWNrZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzLCAuNzUpKTtcbiAgICB9XG5cbiAgICBhZGRab29tTGlzdGVuZXIoem9vbUxpc3RlbmVyOiBab29tTGlzdGVuZXIpe1xuICAgIFx0dGhpcy5saXN0ZW5lcnMucHVzaCh6b29tTGlzdGVuZXIpO1xuICAgIH1cblxuICAgIGNsaWNrZWQoZXZlbnQ6IE1vdXNlRXZlbnQsIHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIGJ5OiBudW1iZXIpIHtcbiAgICBcdGNvbnNvbGUubG9nKFwiY2xpY2tlZFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQudHlwZSk7XG5cbiAgICBcdGNvbnNvbGUubG9nKFwibGlzdGVuZXJzIFwiICsgdGhpcy5saXN0ZW5lcnMubGVuZ3RoKTtcblxuICAgICAgICBzd2l0Y2goZXZlbnQudHlwZSl7XG4gICAgICAgICAgICBjYXNlIFwiZGJsY2xpY2tcIjpcbiAgICAgICAgICAgICAgICBsZXQgY2FudmFzID0gdmlld0NhbnZhcy5jdHguY2FudmFzO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxldCBtWFkgPSB0aGlzLm1vdXNlUG9zaXRpb24oZXZlbnQsIHZpZXdDYW52YXMuY3R4LmNhbnZhcyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmlld0NhbnZhcy56b29tQWJvdXQobVhZLnggLyBjYW52YXMuY2xpZW50V2lkdGgsIG1YWS55IC8gY2FudmFzLmNsaWVudEhlaWdodCwgYnkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB2aWV3Q2FudmFzLnpvb21WaWV3KGJ5KTtcbiAgICAgICAgfVxuXG4gICAgXHR0aGlzLnpvb20gPSB0aGlzLnpvb20gKiBieTtcbiAgICBcdGZvciAobGV0IHZhbHVlIG9mIHRoaXMubGlzdGVuZXJzKXtcbiAgICBcdFx0dmFsdWUuem9vbSh0aGlzLnpvb20pO1xuICAgIFx0fVxuXG4gICAgXHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICB9O1xuXG59O1xuXG5leHBvcnQgY2xhc3MgUGFuQ29udHJvbGxlciBleHRlbmRzIFpvb21MaXN0ZW5lciB7XG5cblx0cHJpdmF0ZSB4UHJldmlvdXM6IG51bWJlcjtcblx0cHJpdmF0ZSB5UHJldmlvdXM6IG51bWJlcjtcblx0cHJpdmF0ZSByZWNvcmQ6IGJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBiYXNlTW92ZTogbnVtYmVyID0gMjU2O1xuXHRwcml2YXRlIG1vdmU6IG51bWJlciA9IDI1NjtcblxuICAgIGNvbnN0cnVjdG9yKHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIHJlYWRvbmx5IGRyYWdFbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgIFx0c3VwZXIoKTtcbiAgICBcdGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzKSk7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcykpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzKSk7XG4gICAgICAgIGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMucmVjb3JkID0gZmFsc2UpO1xuICAgIH1cblxuICAgIHpvb20oYnk6IG51bWJlcil7XG4gICAgXHRjb25zb2xlLmxvZyhcInpvb20gYnkgXCIgKyBieSk7XG4gICAgXHR0aGlzLm1vdmUgPSB0aGlzLmJhc2VNb3ZlIC8gYnk7XG4gICAgfVxuXG4gICAgZHJhZ2dlZChldmVudDogTW91c2VFdmVudCwgdmlld0NhbnZhczogVmlld0NhbnZhcykge1xuXG4gICAgICAgIGxldCBjYW52YXMgPSB2aWV3Q2FudmFzLmN0eC5jYW52YXM7XG5cbiAgICBcdHN3aXRjaChldmVudC50eXBlKXtcbiAgICBcdFx0Y2FzZSBcIm1vdXNlZG93blwiOlxuICAgIFx0XHRcdHRoaXMucmVjb3JkID0gdHJ1ZTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIm1vdXNldXBcIjpcbiAgICBcdFx0XHR0aGlzLnJlY29yZCA9IGZhbHNlO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRkZWZhdWx0OlxuICAgIFx0XHRcdGlmICh0aGlzLnJlY29yZCl7XG4gICAgICAgICAgICAgICAgICAgIGxldCB4RGVsdGEgPSAoZXZlbnQuY2xpZW50WCAtIHRoaXMueFByZXZpb3VzKSAvIHRoaXMubW92ZTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHlEZWx0YSA9IChldmVudC5jbGllbnRZIC0gdGhpcy55UHJldmlvdXMpIC8gdGhpcy5tb3ZlO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdUb3BMZWZ0ID0gbmV3IFBvaW50MkQodmlld0NhbnZhcy50b3BMZWZ0LnggLSB4RGVsdGEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgdmlld0NhbnZhcy50b3BMZWZ0LnkgLSB5RGVsdGEpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZpZXdDYW52YXMubW92ZVZpZXcobmV3VG9wTGVmdCk7XG4gICAgICAgICAgICAgICAgICAgIHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdH1cbiAgICBcdH1cblxuXHRcdHRoaXMueFByZXZpb3VzID0gZXZlbnQuY2xpZW50WDtcblx0XHR0aGlzLnlQcmV2aW91cyA9IGV2ZW50LmNsaWVudFk7XG5cbiAgICB9O1xuXG4gICAgbW91c2VQb3NpdGlvbihldmVudDogTW91c2VFdmVudCwgd2l0aGluOiBIVE1MRWxlbWVudCk6IFBvaW50MkQge1xuICAgICAgICBsZXQgbV9wb3N4ID0gZXZlbnQuY2xpZW50WCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0O1xuICAgICAgICBsZXQgbV9wb3N5ID0gZXZlbnQuY2xpZW50WSArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wXG4gICAgICAgICAgICAgICAgICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcblxuICAgICAgICB2YXIgZV9wb3N4ID0gMDtcbiAgICAgICAgdmFyIGVfcG9zeSA9IDA7XG4gICAgICAgIGlmICh3aXRoaW4ub2Zmc2V0UGFyZW50KXtcbiAgICAgICAgICAgIGRvIHsgXG4gICAgICAgICAgICAgICAgZV9wb3N4ICs9IHdpdGhpbi5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgICAgIGVfcG9zeSArPSB3aXRoaW4ub2Zmc2V0VG9wO1xuICAgICAgICAgICAgfSB3aGlsZSAod2l0aGluID0gPEhUTUxFbGVtZW50PndpdGhpbi5vZmZzZXRQYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQb2ludDJEKG1fcG9zeCAtIGVfcG9zeCwgbV9wb3N5IC0gZV9wb3N5KTtcbiAgICB9XG4gICAgXG59O1xuXG4iXX0=
