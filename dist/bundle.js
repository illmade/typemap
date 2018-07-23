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
var crossPoddle = new canvastile_1.StaticImage(-2.846, 6.125, .199, .205, -0.025, "images/wsc-maps-433-2.jpg", 0.7);
var patricksImage = new canvastile_1.StaticImage(-2.27, 5.95, .4, .4, 0.035, "images/wsc-maps-184-1-front.jpg", 0.6);
var clonmelImage = new canvastile_1.StaticImage(1.845, 8.12, .83, .83, -2.725, "images/wsc-maps-467-02.png", 0.7);
var broadstoneImage = new canvastile_1.StaticImage(-2.61, -0.055, 1.455, 1.455, 1.565, "images/wsc-maps-072.png", 0.7);
var parliamentImage = new canvastile_1.StaticImage(-0.9, 2.67, .5, .5, -3.32, "images/wsc-maps-088-1.png", 0.7);
var cutpurseImage = new canvastile_1.StaticImage(-3.85, 3.425, .55, .59, -0.059, "images/wsc-maps-106-1.jpg", 0.7);
var cutpatrickImage = new canvastile_1.StaticImage(-2.98, 4.32, 1.53, 1.53, -0.025, "images/WSC-Maps-757.png", 0.7);
var thingImage = new canvastile_1.StaticImage(-2.5, 3.6, 1.22, 1.16, 0, "images/IMG_0646.png", 0.4);
var totalImage = new canvastile_1.StaticImage(4.485, -1.875, 7.465, 7.35, 0, "images/maps_145_b_4_(2)_f001r[SVC2].jpg", .5);
function showMap(divName, name) {
    var canvas = document.getElementById(divName);
    var ctx = canvas.getContext('2d');
    var viewCanvas = new viewcanvas_1.ViewCanvas(new point2d_1.Point2D(-4, 4), 9, 6, ctx);
    // viewCanvas.addTileLayer(baseLayer);
    // viewCanvas.addTileLayer(sentinelLayer);
    viewCanvas.addTileLayer(liffeySentinelLayer);
    viewCanvas.addTileLayer(liffeyLabelLayer);
    viewCanvas.addStaticElement(totalImage);
    viewCanvas.addStaticElement(broadstoneImage);
    viewCanvas.addStaticElement(parliamentImage);
    viewCanvas.addStaticElement(cutpurseImage);
    viewCanvas.addStaticElement(cutpatrickImage);
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
    viewCanvas.addStaticElement(patricksImage);
    viewCanvas.addStaticElement(crossPoddle);
    viewCanvas.addStaticElement(clonmelImage);
    viewCanvas.addStaticElement(thingImage);
    var imageController = new imageController_1.ImageController(viewCanvas, thingImage);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2dlb20vdGlsZS50cyIsInNyYy9nZW9tL3ZpZXdwb3J0LnRzIiwic3JjL2dlb20vd29ybGQyZC50cyIsInNyYy9ncmFwaGljcy9jYW52YXN0aWxlLnRzIiwic3JjL2dyYXBoaWNzL2dyaWQudHMiLCJzcmMvZ3JhcGhpY3Mvdmlld2NhbnZhcy50cyIsInNyYy9zaW1wbGVXb3JsZC50cyIsInNyYy91aS9pbWFnZUNvbnRyb2xsZXIudHMiLCJzcmMvdWkvbWFwQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQ0E7SUFPSSxpQkFBWSxDQUFTLEVBQUUsQ0FBUztRQUM1QixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFRSwwQkFBUSxHQUFSO1FBQ0ksT0FBTyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDckQsQ0FBQztJQWJlLFlBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDekIsV0FBRyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQWM1QyxjQUFDO0NBaEJELEFBZ0JDLElBQUE7QUFoQlksMEJBQU87Ozs7O0FDRXBCO0lBRUMsbUJBQW1CLGFBQXFCLEVBQVMsY0FBc0I7UUFBcEQsa0JBQWEsR0FBYixhQUFhLENBQVE7UUFBUyxtQkFBYyxHQUFkLGNBQWMsQ0FBUTtJQUFFLENBQUM7SUFJMUUsNEJBQVEsR0FBUixVQUFTLFFBQWlCLEVBQUUsU0FBaUIsRUFBRSxTQUFpQjtRQUUvRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFD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QUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQO2dCQUNDLFVBQVU7Z0JBQ1YsTUFBTTtTQUNQO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEdBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7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QVMsQ0FBQzthQUM5QixRQUFRLE1BQU0sR0FBZ0IsTUFBTSxDQUFDLFlBQVksRUFBRTtTQUN2RDtRQUVELE9BQU8sSUFBSSxpQkFBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLEVBQUUsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFTCxvQkFBQztBQUFELENBeEVBLEFBd0VDLENBeEVrQyxZQUFZLEdBd0U5QztBQXhFWSxzQ0FBYTtBQXdFekIsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlxuZXhwb3J0IGNsYXNzIFBvaW50MkQge1xuICAgIHN0YXRpYyByZWFkb25seSB6ZXJvID0gbmV3IFBvaW50MkQoMCwgMCk7XG4gICAgc3RhdGljIHJlYWRvbmx5IG9uZSA9IG5ldyBQb2ludDJEKDEsIDEpO1xuXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xuICAgIHJlYWRvbmx5IHk6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG5cdH1cblxuICAgIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcIlBvaW50MkQoXCIgKyB0aGlzLnggKyBcIiwgXCIgKyB0aGlzLnkgKyBcIilcIjtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBVbml0cyB9IGZyb20gXCIuL3dvcmxkMmRcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi9wb2ludDJkXCI7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBUaWxlTGF5ZXIge1xuXHRcblx0Y29uc3RydWN0b3IocHVibGljIHdpZHRoTWFwVW5pdHM6IG51bWJlciwgcHVibGljIGhlaWdodE1hcFVuaXRzOiBudW1iZXIpe31cblxuXHRhYnN0cmFjdCBnZXRUaWxlKHhJbmRleDogbnVtYmVyLCB5SW5kZXg6IG51bWJlcik6IFRpbGU7XG5cblx0Z2V0VGlsZXMocG9zaXRpb246IFBvaW50MkQsIHhNYXBVbml0czogbnVtYmVyLCB5TWFwVW5pdHM6IG51bWJlcik6IEFycmF5PFRpbGU+IHtcblxuXHRcdGxldCBmaXJzdFggPSBNYXRoLmZsb29yKHBvc2l0aW9uLnggLyB0aGlzLndpZHRoTWFwVW5pdHMpO1xuXHRcdGxldCBsYXN0WCA9IE1hdGguY2VpbCgocG9zaXRpb24ueCArIHhNYXBVbml0cykvIHRoaXMud2lkdGhNYXBVbml0cyk7XG5cblx0XHRsZXQgZmlyc3RZID0gTWF0aC5mbG9vcihwb3NpdGlvbi55IC8gdGhpcy5oZWlnaHRNYXBVbml0cyk7XG5cdFx0bGV0IGxhc3RZID0gTWF0aC5jZWlsKChwb3NpdGlvbi55ICsgeU1hcFVuaXRzKS8gdGhpcy5oZWlnaHRNYXBVbml0cyk7XG5cblx0XHRsZXQgdGlsZXMgPSBuZXcgQXJyYXk8VGlsZT4oKTtcblxuXHRcdGZvciAodmFyIHg9Zmlyc3RYOyB4PGxhc3RYOyB4Kyspe1xuXHRcdFx0Zm9yICh2YXIgeT1maXJzdFk7IHk8bGFzdFk7IHkrKyl7XG5cdFx0XHRcdHRpbGVzLnB1c2godGhpcy5nZXRUaWxlKHgsIHkpKVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aWxlcztcblx0fVxuXG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlIHtcblx0XG5cdHN0YXRpYyBlbXB0eVRpbGU6IFRpbGUgPSBuZXcgVGlsZSgtMSwtMSk7XG5cblx0Y29uc3RydWN0b3IoeEluZGV4OiBudW1iZXIsIHlJbmRleDogbnVtYmVyKXt9XG5cbn0iLCJpbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4vcG9pbnQyZFwiO1xuaW1wb3J0IHsgVmVjdG9yMkQgfSBmcm9tIFwiLi92ZWN0b3IyZFwiO1xuaW1wb3J0IHsgV29ybGQyRCwgVW5pdHMgfSBmcm9tIFwiLi93b3JsZDJkXCI7XG5cbmV4cG9ydCBjbGFzcyBWaWV3cG9ydCB7XG5cdFxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgdG9wTGVmdDogUG9pbnQyRCwgXG5cdFx0cHJpdmF0ZSB3aWR0aE1hcFVuaXRzOiBudW1iZXIsIHByaXZhdGUgaGVpZ2h0TWFwVW5pdHM6IG51bWJlcil7XG5cblx0XHRjb25zb2xlLmxvZyhcIncgaFwiICsgd2lkdGhNYXBVbml0cyArIFwiLCBcIiArIGhlaWdodE1hcFVuaXRzKTtcblx0fVxuXG5cdG1vdmVWaWV3KHRvcExlZnQ6IFBvaW50MkQpe1xuXHRcdHRoaXMudG9wTGVmdCA9IHRvcExlZnQ7XG5cdH1cblxuXHR6b29tVmlldyh6b29tOiBudW1iZXIpe1xuXHRcdGxldCBuZXdXaWR0aCA9IHRoaXMud2lkdGhNYXBVbml0cyAqIHpvb207XG5cdFx0bGV0IG5ld0hlaWdodCA9IHRoaXMuaGVpZ2h0TWFwVW5pdHMgKiB6b29tO1xuXG5cdFx0bGV0IG1vdmVYID0gKHRoaXMud2lkdGhNYXBVbml0cyAtIG5ld1dpZHRoKSAvIDI7XG5cdFx0bGV0IG1vdmVZID0gKHRoaXMuaGVpZ2h0TWFwVW5pdHMgLSBuZXdIZWlnaHQpIC8gMjtcblxuXHRcdHRoaXMudG9wTGVmdCA9IG5ldyBQb2ludDJEKHRoaXMudG9wTGVmdC54ICsgbW92ZVgsIHRoaXMudG9wTGVmdC55ICsgbW92ZVkpO1xuXG5cdFx0dGhpcy53aWR0aE1hcFVuaXRzID0gbmV3V2lkdGg7XG5cdFx0dGhpcy5oZWlnaHRNYXBVbml0cyA9IG5ld0hlaWdodDtcblx0fVxuXG5cdHpvb21BYm91dCh4UmVsYXRpdmU6IG51bWJlciwgeVJlbGF0aXZlOiBudW1iZXIsIHpvb206IG51bWJlcil7XG5cblx0XHRsZXQgeERpZmYgPSAwLjUgLSB4UmVsYXRpdmU7XG5cdFx0bGV0IHlEaWZmID0gMC41IC0geVJlbGF0aXZlO1xuXG5cdFx0dmFyIHhNb3ZlID0geERpZmYgKiB0aGlzLndpZHRoTWFwVW5pdHM7XG5cdFx0dmFyIHlNb3ZlID0geURpZmYgKiB0aGlzLmhlaWdodE1hcFVuaXRzO1xuXG5cdFx0dGhpcy50b3BMZWZ0ID0gbmV3IFBvaW50MkQodGhpcy50b3BMZWZ0LnggLSB4TW92ZSwgdGhpcy50b3BMZWZ0LnkgLSB5TW92ZSk7XG5cblx0XHR0aGlzLnpvb21WaWV3KHpvb20pO1xuXG5cdFx0eE1vdmUgPSB4RGlmZiAqIHRoaXMud2lkdGhNYXBVbml0cztcblx0XHR5TW92ZSA9IHlEaWZmICogdGhpcy5oZWlnaHRNYXBVbml0cztcblxuXHRcdHRoaXMudG9wTGVmdCA9IG5ldyBQb2ludDJEKHRoaXMudG9wTGVmdC54ICsgeE1vdmUsIHRoaXMudG9wTGVmdC55ICsgeU1vdmUpO1xuXG5cdH1cblxuXHRnZXREaW1lbnNpb25zKCl7XG5cdFx0cmV0dXJuIG5ldyBQb2ludDJEKHRoaXMud2lkdGhNYXBVbml0cywgdGhpcy5oZWlnaHRNYXBVbml0cyk7XG5cdH1cblxufSIsImltcG9ydCB7IFRpbGVMYXllciB9IGZyb20gXCIuL3RpbGVcIjtcblxuZXhwb3J0IGNsYXNzIFVuaXRzIHtcblxuXHRzdGF0aWMgcmVhZG9ubHkgV2ViV1UgPSBuZXcgVW5pdHMoXCJNZXJjYXRvciBXZWIgV29ybGQgVW5pdHNcIik7XG5cblx0Y29uc3RydWN0b3IobmFtZTogc3RyaW5nKXt9XG5cbn1cbi8qKlxuICBBIHdvcmxkIGlzIHRoZSBiYXNlIHRoYXQgYWxsIG90aGVyIGVsZW1lbnRzIG9yaWVudGF0ZSBmcm9tIFxuKiovXG5leHBvcnQgY2xhc3MgV29ybGQyRCB7XG5cblx0cHJpdmF0ZSB0aWxlTGF5ZXJzOiBBcnJheTxUaWxlTGF5ZXI+ID0gW107XG5cdFxuXHRjb25zdHJ1Y3Rvcigpe31cblxuICAgIGFkZFRpbGVMYXllcih0aWxlTGF5ZXI6IFRpbGVMYXllcik6IG51bWJlciB7XG4gICAgXHRyZXR1cm4gdGhpcy50aWxlTGF5ZXJzLnB1c2godGlsZUxheWVyKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBUaWxlLCBUaWxlTGF5ZXIgfSBmcm9tIFwiLi4vZ2VvbS90aWxlXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2FudmFzVGlsZSBleHRlbmRzIFRpbGUge1xuXG5cdGFic3RyYWN0IGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHNjYWxpbmdYOiBudW1iZXIsIHNjYWxpbmdZOiBudW1iZXIsIFxuXHRcdGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKTogdm9pZDtcblxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VTdHJ1Y3Qge1xuXG5cdHByZWZpeDogc3RyaW5nID0gXCJcIjtcblx0c3VmZml4OiBzdHJpbmcgPSBcIlwiO1xuXHR0aWxlRGlyOiBzdHJpbmcgPSBcImltYWdlcy9cIjtcblx0dmlzaWJsZTogYm9vbGVhbiA9IHRydWU7XG5cdHRpbGVXaWR0aFB4OiBudW1iZXIgPSAyNTY7XG5cdHRpbGVIZWlnaHRQeDogbnVtYmVyID0gMjU2O1xuXHR3aWR0aE1hcFVuaXRzOiBudW1iZXIgPSAxO1xuXHRoZWlnaHRNYXBVbml0czogbnVtYmVyID0gMTsgXG5cbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlVGlsZSBleHRlbmRzIENhbnZhc1RpbGUge1xuXG5cdHByaXZhdGUgaW1nOiBIVE1MSW1hZ2VFbGVtZW50O1xuXG5cdGNvbnN0cnVjdG9yKHJlYWRvbmx5IHhJbmRleDogbnVtYmVyLCByZWFkb25seSB5SW5kZXg6IG51bWJlciwgaW1hZ2VTcmM6IHN0cmluZykge1xuXHRcdHN1cGVyKHhJbmRleCwgeUluZGV4KTtcblx0XHR0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuXHRcdHRoaXMuaW1nLnNyYyA9IGltYWdlU3JjO1xuXHR9O1xuXG5cdHByaXZhdGUgZHJhd0ltYWdlKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBjYW52YXNYOiBudW1iZXIsIGNhbnZhc1k6IG51bWJlcil7XG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZywgY2FudmFzWCwgY2FudmFzWSk7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBjYW52YXNYOiBudW1iZXIsIGNhbnZhc1k6IG51bWJlcil7XG5cdFx0aWYgKHRoaXMuaW1nLmNvbXBsZXRlKSB7XG5cdFx0XHR0aGlzLmRyYXdJbWFnZShjdHgsIGNhbnZhc1gsIGNhbnZhc1kpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuaW1nLm9ubG9hZCA9IChldmVudCkgPT4ge1xuXHRcdFx0XHR0aGlzLmltZy5jcm9zc09yaWdpbiA9IFwiQW5vbnltb3VzXCI7XG5cdFx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fTtcblxufVxuXG5leHBvcnQgY2xhc3MgU3RhdGljSW1hZ2Uge1xuXG5cdHByaXZhdGUgaW1nOiBIVE1MSW1hZ2VFbGVtZW50O1xuXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB4SW5kZXg6IG51bWJlciwgcHVibGljIHlJbmRleDogbnVtYmVyLCBcblx0XHRwdWJsaWMgc2NhbGluZ1g6IG51bWJlciwgcHVibGljIHNjYWxpbmdZOiBudW1iZXIsIHB1YmxpYyByb3RhdGlvbjogbnVtYmVyLCBcblx0XHRpbWFnZVNyYzogc3RyaW5nLCByZWFkb25seSBhbHBoYTogbnVtYmVyKSB7XG5cdFx0XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0fTtcblxuXHRwcml2YXRlIGRyYXdJbWFnZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgY2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpe1xuXG5cdFx0Ly9zY2FsaW5nWCA9IHNjYWxpbmdYICogdGhpcy5zY2FsaW5nO1xuXHRcdC8vc2NhbGluZ1kgPSBzY2FsaW5nWSAqIHRoaXMuc2NhbGluZztcblxuXHRcdC8vIGxldCBjb3NYID0gTWF0aC5jb3ModGhpcy5yb3RhdGlvbik7XG5cdFx0Ly8gbGV0IHNpblggPSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uKTtcblxuXHRcdGN0eC50cmFuc2xhdGUoY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0Y3R4LnJvdGF0ZSh0aGlzLnJvdGF0aW9uKTtcblx0XHRjdHguc2NhbGUodGhpcy5zY2FsaW5nWCwgdGhpcy5zY2FsaW5nWSk7XG5cdFx0Ly9jb25zb2xlLmxvZyhcInh5U2NhbGluZyBcIiArIHRoaXMuc2NhbGluZ1ggKyBcIiwgXCIgKyB0aGlzLnNjYWxpbmdZKTtcblx0XHRjdHguZ2xvYmFsQWxwaGEgPSB0aGlzLmFscGhhO1xuXG5cdFx0Ly8gY3R4LnRyYW5zZm9ybShjb3NYICogc2NhbGluZ1gsIHNpblggKiBzY2FsaW5nWSwgLXNpblggKiBzY2FsaW5nWCwgY29zWCAqIHNjYWxpbmdZLCBcblx0XHQvLyBcdGNhbnZhc1ggLyB0aGlzLnNjYWxpbmcsIGNhbnZhc1kgLyB0aGlzLnNjYWxpbmcpO1xuXG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZywgLSh0aGlzLmltZy53aWR0aC8yKSwgLSh0aGlzLmltZy5oZWlnaHQvMikpO1xuXHRcdFxuXHRcdGN0eC5zY2FsZSgxL3RoaXMuc2NhbGluZ1gsIDEvdGhpcy5zY2FsaW5nWSk7XG5cdFx0Y3R4LnJvdGF0ZSgtdGhpcy5yb3RhdGlvbik7XG5cdFx0Y3R4LnRyYW5zbGF0ZSgtY2FudmFzWCwgLWNhbnZhc1kpO1xuXHRcdGN0eC5nbG9iYWxBbHBoYSA9IDE7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBjYW52YXNYOiBudW1iZXIsIGNhbnZhc1k6IG51bWJlcil7XG5cdFx0aWYgKHRoaXMuaW1nLmNvbXBsZXRlKSB7XG5cdFx0XHR0aGlzLmRyYXdJbWFnZShjdHgsIGNhbnZhc1gsIGNhbnZhc1kpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuaW1nLm9ubG9hZCA9IChldmVudCkgPT4ge1xuXHRcdFx0XHR0aGlzLmltZy5jcm9zc09yaWdpbiA9IFwiQW5vbnltb3VzXCI7XG5cdFx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fTtcblxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VUaWxlTGF5ZXIgZXh0ZW5kcyBUaWxlTGF5ZXIge1xuXG5cdHJlYWRvbmx5IGltYWdlUHJvcGVydGllczogSW1hZ2VTdHJ1Y3Q7XG5cblx0Y29uc3RydWN0b3IoaW1hZ2VQcm9wZXJ0aWVzOiBJbWFnZVN0cnVjdCkge1xuXHRcdHN1cGVyKGltYWdlUHJvcGVydGllcy53aWR0aE1hcFVuaXRzLCBpbWFnZVByb3BlcnRpZXMuaGVpZ2h0TWFwVW5pdHMpO1xuXHRcdHRoaXMuaW1hZ2VQcm9wZXJ0aWVzID0gaW1hZ2VQcm9wZXJ0aWVzO1xuXHR9XG5cblx0LyoqXG5cdCAgbGVhdmUgY2FjaGluZyB1cCB0byB0aGUgYnJvd3NlclxuXHQqKi9cblx0Z2V0VGlsZSh4VW5pdHM6IG51bWJlciwgeVVuaXRzOiBudW1iZXIpOiBUaWxlIHtcblx0XHRsZXQgaW1hZ2VTcmMgPSB0aGlzLmltYWdlUHJvcGVydGllcy50aWxlRGlyICsgXG5cdFx0XHR0aGlzLmltYWdlUHJvcGVydGllcy5wcmVmaXggKyB4VW5pdHMgKyBcIl9cIiArIHlVbml0cyArIHRoaXMuaW1hZ2VQcm9wZXJ0aWVzLnN1ZmZpeDtcblx0XHRyZXR1cm4gbmV3IEltYWdlVGlsZSh4VW5pdHMsIHlVbml0cywgaW1hZ2VTcmMpO1xuXHR9XG5cbn1cbiIsImltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbmV4cG9ydCBjbGFzcyBHcmlkTGF5ZXIge1xuXG5cdHByaXZhdGUgZ3JpZFNwYWNpbmc6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGdyaWRTcGFjaW5nOiBudW1iZXIpIHtcblx0XHR0aGlzLmdyaWRTcGFjaW5nID0gZ3JpZFNwYWNpbmc7XG5cdH1cblxuXHRzZXRHcmlkU3BhY2luZyhncmlkU3BhY2luZzogbnVtYmVyKXtcblx0XHR0aGlzLmdyaWRTcGFjaW5nID0gZ3JpZFNwYWNpbmc7XG5cdH1cblx0LyoqXG5cdCAgbGVhdmUgY2FjaGluZyB1cCB0byB0aGUgYnJvd3NlclxuXHQqKi9cblx0ZHJhdyh0b3BMZWZ0OiBQb2ludDJELCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IHZvaWQge1xuXHRcdGxldCBtaW5YID0gTWF0aC5mbG9vcih0b3BMZWZ0LngpO1xuXHRcdGxldCBtaW5ZID0gTWF0aC5mbG9vcih0b3BMZWZ0LnkpO1xuXG5cdFx0dGhpcy5jdHgudHJhbnNsYXRlKC0yNTYgKiB0b3BMZWZ0LngsIC0yNTYgKiB0b3BMZWZ0LnkpO1xuXHRcdC8vY29uc29sZS5sb2coXCJtaW5zIFwiICsgd2lkdGggKyBcIiwgXCIgKyBoZWlnaHQpO1xuXG5cdFx0bGV0IGxhc3RYID0gTWF0aC5jZWlsKHRvcExlZnQueCArIHdpZHRoKTtcblx0XHRsZXQgbGFzdFkgPSBNYXRoLmNlaWwodG9wTGVmdC55ICsgaGVpZ2h0KTtcblxuXHRcdHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gJ2JsdWUnO1xuXHRcdHRoaXMuY3R4LmZvbnQgPSAnNDhweCBzZXJpZic7XG5cblx0XHRsZXQgeVplcm8gPSBtaW5ZICogdGhpcy5ncmlkU3BhY2luZyAqIDI1Njtcblx0XHRsZXQgeU1heCA9IGxhc3RZICogdGhpcy5ncmlkU3BhY2luZyAqIDI1Njtcblx0XHRsZXQgeEp1bXAgPSB0aGlzLmdyaWRTcGFjaW5nICogMjU2O1xuXG5cdFx0bGV0IHhaZXJvID0gbWluWCAqIHRoaXMuZ3JpZFNwYWNpbmcgKiAyNTY7XG5cdFx0bGV0IHhNYXggPSBsYXN0WCAqIHRoaXMuZ3JpZFNwYWNpbmcgKiAyNTY7XG5cdFx0bGV0IHlKdW1wID0gdGhpcy5ncmlkU3BhY2luZyAqIDI1NjtcblxuXHRcdHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgIFx0Ly90aGlzLmN0eC5jbGVhclJlY3QoeFplcm8sIHlaZXJvLCB4TWF4LCB5TWF4KTtcblxuXHRcdGZvciAodmFyIHggPSBtaW5YOyB4PGxhc3RYOyB4Kyspe1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImF0IFwiICsgbWluWCk7XG5cdFx0XHRsZXQgeE1vdmUgPSB4ICogeEp1bXA7XG5cdFx0XHR0aGlzLmN0eC5tb3ZlVG8oeE1vdmUsIHlaZXJvKTtcblx0XHRcdHRoaXMuY3R4LmxpbmVUbyh4TW92ZSwgeU1heCk7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgeSA9IG1pblk7IHk8bGFzdFk7IHkrKyl7XG5cdFx0XHRsZXQgeU1vdmUgPSB5ICogeUp1bXA7XG5cdFx0XHR0aGlzLmN0eC5tb3ZlVG8oeFplcm8sIHlNb3ZlKTtcblx0XHRcdHRoaXMuY3R4LmxpbmVUbyh4TWF4LCB5TW92ZSk7XG5cblx0XHRcdGZvciAodmFyIHggPSBtaW5YOyB4PGxhc3RYOyB4Kyspe1xuXHRcdFx0XHRsZXQgeE1vdmUgPSAoeCAtIDAuNSkgKiB4SnVtcDtcblx0XHRcdFx0eU1vdmUgPSAoeSAtIDAuNSkgKiB5SnVtcDtcblx0XHRcdFx0bGV0IHRleHQgPSBcIlwiICsgKHgtMSkgKyBcIiwgXCIgKyAoeS0xKTtcblx0XHRcdFx0dGhpcy5jdHguZmlsbFRleHQodGV4dCwgeE1vdmUsIHlNb3ZlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5jdHguc3Ryb2tlKCk7XG5cdFx0dGhpcy5jdHgudHJhbnNsYXRlKDI1NiAqIHRvcExlZnQueCwgMjU2ICogdG9wTGVmdC55KTtcblx0fVxuXG5cbn0iLCJpbXBvcnQgeyBWaWV3cG9ydCB9IGZyb20gXCIuLi9nZW9tL3ZpZXdwb3J0XCI7XG5pbXBvcnQgeyBXb3JsZDJEIH0gZnJvbSBcIi4uL2dlb20vd29ybGQyZFwiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcbmltcG9ydCB7IFN0YXRpY0ltYWdlLCBJbWFnZVRpbGUsIEltYWdlVGlsZUxheWVyIH0gZnJvbSBcIi4vY2FudmFzdGlsZVwiO1xuaW1wb3J0IHsgR3JpZExheWVyIH0gZnJvbSBcIi4vZ3JpZFwiO1xuXG5leHBvcnQgY2xhc3MgVmlld0NhbnZhcyBleHRlbmRzIFZpZXdwb3J0IHtcblxuICAgIHByaXZhdGUgc3RhdGljRWxlbWVudHM6IEFycmF5PFN0YXRpY0ltYWdlPiA9IFtdO1xuICAgIHByaXZhdGUgaW1hZ2VUaWxlTGF5ZXJzID0gW107XG5cbiAgICBwcml2YXRlIGdyaWRMYXllcjogR3JpZExheWVyO1xuXG4gICAgcHJpdmF0ZSBvZmZzY3JlZW46IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICBwcml2YXRlIHdpZHRoOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBoZWlnaHQ6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHRvcExlZnQ6IFBvaW50MkQsIFxuICAgIFx0d2lkdGhNYXBVbml0czogbnVtYmVyLCBoZWlnaHRNYXBVbml0czogbnVtYmVyLCBcbiAgICBcdHB1YmxpYyBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkge1xuXG4gICAgXHRzdXBlcih0b3BMZWZ0LCB3aWR0aE1hcFVuaXRzLCBoZWlnaHRNYXBVbml0cyk7XG5cbiAgICAgICAgdGhpcy53aWR0aCA9IGN0eC5jYW52YXMuY2xpZW50V2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gY3R4LmNhbnZhcy5jbGllbnRIZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5jdHguY2FudmFzLndpZHRoID0gdGhpcy53aWR0aDtcbiAgICAgICAgdGhpcy5jdHguY2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwib25zY3JlZW4gXCIgKyB0aGlzLmN0eC5jYW52YXMud2lkdGggKyBcIiwgXCIgKyB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICAvL2NvbnN0IGMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgICBjb25zdCBjID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib2Zmc2NyZWVuXCIpO1xuICAgICAgICBjLndpZHRoID0gdGhpcy53aWR0aDtcbiAgICAgICAgYy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcblxuICAgICAgICB0aGlzLm9mZnNjcmVlbiA9IDxDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ+Yy5nZXRDb250ZXh0KFwiMmRcIik7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJvZmZzY3JlZW4gXCIgKyB0aGlzLmN0eC5jYW52YXMuY2xpZW50V2lkdGgpO1xuXG4gICAgXHR0aGlzLmdyaWRMYXllciA9IG5ldyBHcmlkTGF5ZXIodGhpcy5jdHgsIDEpO1xuICAgIH1cblxuICAgIGFkZFRpbGVMYXllcihpbWFnZVRpbGVMYXllcjogSW1hZ2VUaWxlTGF5ZXIpOiB2b2lkIHtcbiAgICBcdHRoaXMuaW1hZ2VUaWxlTGF5ZXJzLnB1c2goaW1hZ2VUaWxlTGF5ZXIpO1xuICAgIH1cblxuICAgIGFkZFN0YXRpY0VsZW1lbnQoc3RhdGljSW1hZ2U6IFN0YXRpY0ltYWdlKTogdm9pZCB7XG4gICAgXHR0aGlzLnN0YXRpY0VsZW1lbnRzLnB1c2goc3RhdGljSW1hZ2UpO1xuICAgIH1cblxuICAgIGdldFZpZXdTY2FsaW5nKHBpeGVsc1BlclVuaXQ6IG51bWJlcik6IFBvaW50MkQge1xuICAgIFx0bGV0IGRpbWVuc2lvbiA9IHRoaXMuZ2V0RGltZW5zaW9ucygpO1xuICAgIFx0bGV0IHZpZXdTY2FsaW5nWCA9IHRoaXMuY3R4LmNhbnZhcy5jbGllbnRXaWR0aCAvIGRpbWVuc2lvbi54IC8gcGl4ZWxzUGVyVW5pdDtcbiAgICBcdGxldCB2aWV3U2NhbGluZ1kgPSB0aGlzLmN0eC5jYW52YXMuY2xpZW50SGVpZ2h0IC8gZGltZW5zaW9uLnkgLyBwaXhlbHNQZXJVbml0O1xuICAgIFx0cmV0dXJuIG5ldyBQb2ludDJEKHZpZXdTY2FsaW5nWCwgdmlld1NjYWxpbmdZKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNjYWxlKHBpeGVsc1BlclVuaXQ6IG51bWJlciwgZGltZW5zaW9uOiBQb2ludDJELCByZXZlcnNlOiBib29sZWFuKTogdm9pZCB7XG5cbiAgICBcdGxldCB2aWV3U2NhbGluZyA9IHRoaXMuZ2V0Vmlld1NjYWxpbmcocGl4ZWxzUGVyVW5pdCk7XG5cbiAgICBcdGlmIChyZXZlcnNlKXtcbiAgICBcdFx0dGhpcy5jdHguc2NhbGUoMS92aWV3U2NhbGluZy54LCAxL3ZpZXdTY2FsaW5nLnkpO1xuICAgIFx0fSBlbHNlIHtcbiAgICBcdFx0dGhpcy5jdHguc2NhbGUodmlld1NjYWxpbmcueCwgdmlld1NjYWxpbmcueSk7XG4gICAgXHR9XG4gICAgXHRcbiAgICB9XG5cbiAgICBkcmF3KCk6IHZvaWQge1xuICAgIFx0bGV0IGRpbWVuc2lvbiA9IHRoaXMuZ2V0RGltZW5zaW9ucygpO1xuXG4gICAgICAgIGxldCBsb2NhbENvbnRleHQgPSB0aGlzLmN0eDtcblxuICAgIFx0bG9jYWxDb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG5cbiAgICBcdGZvciAobGV0IHZhbHVlIG9mIHRoaXMuaW1hZ2VUaWxlTGF5ZXJzKXtcbiAgICBcdFx0aWYgKHZhbHVlLmltYWdlUHJvcGVydGllcy52aXNpYmxlKSB7XG5cbiAgICBcdFx0XHR0aGlzLnNjYWxlKHZhbHVlLmltYWdlUHJvcGVydGllcy50aWxlV2lkdGhQeCwgZGltZW5zaW9uLCBmYWxzZSk7XG5cbiAgICBcdFx0XHRsZXQgdGlsZVNjYWxpbmdYID0gdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVXaWR0aFB4IC8gdmFsdWUud2lkdGhNYXBVbml0cztcbiAgICBcdFx0XHRsZXQgdGlsZVNjYWxpbmdZID0gdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVIZWlnaHRQeCAvIHZhbHVlLmhlaWdodE1hcFVuaXRzO1xuXG4gICAgXHRcdFx0bGV0IHRpbGVzOiBBcnJheTxJbWFnZVRpbGU+ID0gdmFsdWUuZ2V0VGlsZXModGhpcy50b3BMZWZ0LCBcbiAgICBcdFx0XHRcdGRpbWVuc2lvbi54LCBkaW1lbnNpb24ueSk7XG5cbiAgICBcdFx0XHRmb3IgKGxldCB0aWxlIG9mIHRpbGVzKXtcbiAgICBcdFx0XHRcdHZhciB0aWxlWCA9ICh0aWxlLnhJbmRleCAtIHRoaXMudG9wTGVmdC54KSAqIHRpbGVTY2FsaW5nWDtcbiAgICBcdFx0XHRcdHZhciB0aWxlWSA9ICh0aWxlLnlJbmRleCAtIHRoaXMudG9wTGVmdC55KSAqIHRpbGVTY2FsaW5nWTtcblxuICAgIFx0XHRcdFx0dGlsZS5kcmF3KGxvY2FsQ29udGV4dCwgdGlsZVgsIHRpbGVZKTtcbiAgICBcdFx0XHR9XG5cbiAgICBcdFx0XHR0aGlzLnNjYWxlKHZhbHVlLmltYWdlUHJvcGVydGllcy50aWxlV2lkdGhQeCwgZGltZW5zaW9uLCB0cnVlKTtcbiAgICBcdFx0fVxuICAgIFx0fVxuXG4gICAgXHRmb3IgKGxldCB2YWx1ZSBvZiB0aGlzLnN0YXRpY0VsZW1lbnRzKXtcbiAgICBcdFx0Ly8yNTYgcHggaXMgMSBtYXAgdW5pdFxuXHRcdFx0bGV0IHRpbGVTY2FsaW5nWCA9IDI1Njtcblx0XHRcdGxldCB0aWxlU2NhbGluZ1kgPSAyNTY7XG5cbiAgICBcdFx0dGhpcy5zY2FsZSgyNTYsIGRpbWVuc2lvbiwgZmFsc2UpO1xuXG4gICAgXHRcdGxldCBpbWFnZVggPSAodmFsdWUueEluZGV4IC0gdGhpcy50b3BMZWZ0LngpICogdGlsZVNjYWxpbmdYO1xuICAgIFx0XHRsZXQgaW1hZ2VZID0gKHZhbHVlLnlJbmRleCAtIHRoaXMudG9wTGVmdC55KSAqIHRpbGVTY2FsaW5nWTtcblxuICAgIFx0XHR2YWx1ZS5kcmF3KGxvY2FsQ29udGV4dCwgaW1hZ2VYLCBpbWFnZVkpO1xuICAgIFx0XHR0aGlzLnNjYWxlKDI1NiwgZGltZW5zaW9uLCB0cnVlKTtcblxuICAgIFx0fVxuXG4gICAgXHR0aGlzLnNjYWxlKDI1NiwgZGltZW5zaW9uLCBmYWxzZSk7XG4gICAgXHR0aGlzLmdyaWRMYXllci5kcmF3KHRoaXMudG9wTGVmdCwgZGltZW5zaW9uLngsIGRpbWVuc2lvbi55KTtcbiAgICBcdHRoaXMuc2NhbGUoMjU2LCBkaW1lbnNpb24sIHRydWUpO1xuXG4gICAgICAgIC8vIGxldCBpbWFnZURhdGE6IEltYWdlRGF0YSA9IGxvY2FsQ29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXG4gICAgICAgIC8vIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiaW1hZ2UgZGF0YSBcIiwgaW1hZ2VEYXRhKTtcbiAgICAgICAgLy8gdGhpcy5jdHgucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG5cbiAgICAgICAgdGhpcy5kcmF3Q2VudHJlKHRoaXMuY3R4KTtcblxuICAgIH1cblxuICAgIGRyYXdDZW50cmUoY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKXtcbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKHRoaXMud2lkdGgvMiwgMCk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKHRoaXMud2lkdGgvMiwgdGhpcy5oZWlnaHQpO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbygwLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8odGhpcy53aWR0aCwgdGhpcy5oZWlnaHQvMik7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgV29ybGQyRCB9IGZyb20gXCIuL2dlb20vd29ybGQyZFwiO1xuaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tIFwiLi9nZW9tL3ZpZXdwb3J0XCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBTdGF0aWNJbWFnZSwgSW1hZ2VUaWxlTGF5ZXIsIEltYWdlU3RydWN0IH0gZnJvbSBcIi4vZ3JhcGhpY3MvY2FudmFzdGlsZVwiO1xuaW1wb3J0IHsgVmlld0NhbnZhcyB9IGZyb20gXCIuL2dyYXBoaWNzL3ZpZXdjYW52YXNcIjtcbmltcG9ydCB7IFpvb21Db250cm9sbGVyLCBQYW5Db250cm9sbGVyIH0gZnJvbSBcIi4vdWkvbWFwQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgSW1hZ2VDb250cm9sbGVyIH0gZnJvbSBcIi4vdWkvaW1hZ2VDb250cm9sbGVyXCI7XG5cbmxldCBzaW1wbGVXb3JsZCA9IG5ldyBXb3JsZDJEKCk7XG5cbi8vIGxldCBsYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbi8vIGxheWVyUHJvcGVydGllcy5wcmVmaXggPSBcIlwiO1xuLy8gbGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwiLnBuZ1wiO1xuXG4vLyBsZXQgcm9hZExheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuLy8gcm9hZExheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImIucG5nXCI7XG5cbi8vIGxldCBzZW50aW5lbExheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuLy8gc2VudGluZWxMYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCJsLmpwZWdcIjtcblxuLy8gbGV0IHNlbnRpbmVsVGVycmFpbkxheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuLy8gc2VudGluZWxUZXJyYWluTGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwidC5qcGVnXCI7XG5cbmxldCBsaWZmZXlMYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbmxpZmZleUxheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImxpZmZleS5qcGVnXCI7XG5saWZmZXlMYXllclByb3BlcnRpZXMudGlsZURpciA9IFwiaW1hZ2VzL2xpZmZleS9cIjtcblxubGV0IGxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG5saWZmZXlMYWJlbExheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImxpZmZleS5wbmdcIjtcbmxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzLnRpbGVEaXIgPSBcImltYWdlcy9saWZmZXkvXCI7XG5saWZmZXlMYWJlbExheWVyUHJvcGVydGllcy52aXNpYmxlID0gdHJ1ZTtcblxuLy8gbGV0IGJhc2VMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihsYXllclByb3BlcnRpZXMpO1xuLy8gbGV0IHNlbnRpbmVsTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIoc2VudGluZWxMYXllclByb3BlcnRpZXMpO1xuLy8gbGV0IHJvYWRMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihyb2FkTGF5ZXJQcm9wZXJ0aWVzKTtcbi8vIGxldCB0ZXJyYWluTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIoc2VudGluZWxUZXJyYWluTGF5ZXJQcm9wZXJ0aWVzKTtcblxubGV0IGxpZmZleVNlbnRpbmVsTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIobGlmZmV5TGF5ZXJQcm9wZXJ0aWVzKTtcbmxldCBsaWZmZXlMYWJlbExheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKGxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzKTtcblxubGV0IGRvbGllckltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDIuMjQsIDEuODcsIC40MywgLjQzLCAtMC4wNiwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAxN1JbU1ZDMl0uanBnXCIsIC43KTtcblxubGV0IHRyaW5pdHlJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgxLjk5LCAzLjU5LCAuNDMsIC40MywgMC4xNSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAxOVJbU1ZDMl0uanBnXCIsIC43KTtcblxubGV0IHBvb2xiZWdJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgzLjM0LCAxLjYyNSwgLjQwNSwgLjQzLCAwLjA1LFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMThSW1NWQzJdLmpwZ1wiLCAuNyk7XG5cbmxldCBhYmJleUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDIuMzksIDAuMDM1LCAuNDE1LCAuNDM1LCAtLjI1LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDA4cltTVkMyXS5qcGdcIiwgLjcpO1xuXG5sZXQgYnVzYXJhc0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDMuNDksIC0wLjI0LCAuNDEsIC40MjUsIC0uMjYsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDlyW1NWQzJdLmpwZ1wiLCAuNyk7XG5cbmxldCBsb3dlcmFiYmV5SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMS4yOTUsIDAuMzc3NiwgLjQyNSwgLjQzNSwgLS4yMywgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwN3JbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBkYW1lSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMC45OCwgMi4zMTUsIC40MSwgLjQyOCwgLTAuMDk1LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDE2cl8yW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgY3VzdG9tSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoNS4yMSwgLS4yNDUsIC40MiwgLjQ0LCAwLjAzLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDEwcl8yW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgbWFub3JJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSg2LjM2LCAwLjAyNSwgLjQxNSwgLjQzNSwgMC4xMSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAxMXJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBzYWNrdmlsbGVJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgxLjI5LCAtMS4yOCwgLjQ2LCAuNDIsIC0wLjI2NSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwNHJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBncmVhdEltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC4xOSwgLTAuNzA1LCAuNCwgLjQyLCAtLjUxLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDAzcltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IGxvd2Vyb3Jtb25kSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMC4xNiwgMC43MSwgLjQwNSwgLjQ0LCAtMC4yMDUsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDZyW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgc3RlcGhlbnNJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgxLjczLCA0LjkzNSwgLjQxNSwgLjQyLCAwLjIwNSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAyMFJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBtYXJ5c0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0xLjA1NSwgMC45ODUsIC40MywgLjQzNSwgLTAuMjEsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDVyW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgY3Jvc3NQb2RkbGUgPSBuZXcgU3RhdGljSW1hZ2UoLTIuODQ2LCA2LjEyNSwgLjE5OSwgLjIwNSwgLTAuMDI1LCBcblx0XCJpbWFnZXMvd3NjLW1hcHMtNDMzLTIuanBnXCIsIDAuNyk7XG5cbmxldCBwYXRyaWNrc0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0yLjI3LCA1Ljk1LCAuNCwgLjQsIDAuMDM1LCBcblx0XCJpbWFnZXMvd3NjLW1hcHMtMTg0LTEtZnJvbnQuanBnXCIsIDAuNik7XG5cbmxldCBjbG9ubWVsSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMS44NDUsIDguMTIsIC44MywgLjgzLCAtMi43MjUsIFxuXHRcImltYWdlcy93c2MtbWFwcy00NjctMDIucG5nXCIsIDAuNyk7XG5cbmxldCBicm9hZHN0b25lSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTIuNjEsIC0wLjA1NSwgMS40NTUsIDEuNDU1LCAxLjU2NSwgXG5cdFwiaW1hZ2VzL3dzYy1tYXBzLTA3Mi5wbmdcIiwgMC43KTtcblxubGV0IHBhcmxpYW1lbnRJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMC45LCAyLjY3LCAuNSwgLjUsIC0zLjMyLCBcblx0XCJpbWFnZXMvd3NjLW1hcHMtMDg4LTEucG5nXCIsIDAuNyk7XG5cbmxldCBjdXRwdXJzZUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0zLjg1LCAzLjQyNSwgLjU1LCAuNTksIC0wLjA1OSwgXG5cdFwiaW1hZ2VzL3dzYy1tYXBzLTEwNi0xLmpwZ1wiLCAwLjcpO1xuXG5sZXQgY3V0cGF0cmlja0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0yLjk4LCA0LjMyLCAxLjUzLCAxLjUzLCAtMC4wMjUsIFxuXHRcImltYWdlcy9XU0MtTWFwcy03NTcucG5nXCIsIDAuNyk7XG5cbmxldCB0aGluZ0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0yLjUsIDMuNiwgMS4yMiwgMS4xNiwgMCwgXG5cdFwiaW1hZ2VzL0lNR18wNjQ2LnBuZ1wiLCAwLjQpO1xuXG5sZXQgdG90YWxJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSg0LjQ4NSwgLTEuODc1LCA3LjQ2NSwgNy4zNSwgMCwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwMXJbU1ZDMl0uanBnXCIsIC41KTtcblxuXG5mdW5jdGlvbiBzaG93TWFwKGRpdk5hbWU6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpdk5hbWUpO1xuXG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdGxldCB2aWV3Q2FudmFzID0gbmV3IFZpZXdDYW52YXMobmV3IFBvaW50MkQoLTQsNCksIDksIDYsIGN0eCk7XG5cdC8vIHZpZXdDYW52YXMuYWRkVGlsZUxheWVyKGJhc2VMYXllcik7XG5cdC8vIHZpZXdDYW52YXMuYWRkVGlsZUxheWVyKHNlbnRpbmVsTGF5ZXIpO1xuXHR2aWV3Q2FudmFzLmFkZFRpbGVMYXllcihsaWZmZXlTZW50aW5lbExheWVyKTtcblx0dmlld0NhbnZhcy5hZGRUaWxlTGF5ZXIobGlmZmV5TGFiZWxMYXllcik7XG5cblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHRvdGFsSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoYnJvYWRzdG9uZUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHBhcmxpYW1lbnRJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChjdXRwdXJzZUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGN1dHBhdHJpY2tJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChkb2xpZXJJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudCh0cmluaXR5SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQocG9vbGJlZ0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGFiYmV5SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQobG93ZXJhYmJleUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGJ1c2FyYXNJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChkYW1lSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoY3VzdG9tSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQobWFub3JJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChzYWNrdmlsbGVJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChncmVhdEltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGxvd2Vyb3Jtb25kSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoc3RlcGhlbnNJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChtYXJ5c0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHBhdHJpY2tzSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoY3Jvc3NQb2RkbGUpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoY2xvbm1lbEltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHRoaW5nSW1hZ2UpO1xuXG5cdGxldCBpbWFnZUNvbnRyb2xsZXIgPSBuZXcgSW1hZ2VDb250cm9sbGVyKHZpZXdDYW52YXMsIHRoaW5nSW1hZ2UpO1xuXG5cdGNvbnN0IHBsdXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwbHVzXCIpO1xuXHRjb25zdCBtaW51cyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1pbnVzXCIpO1xuXG5cdGxldCBwYW5Db250cm9sID0gbmV3IFBhbkNvbnRyb2xsZXIodmlld0NhbnZhcywgY2FudmFzKTtcblx0bGV0IGNhbnZhc0NvbnRyb2wgPSBuZXcgWm9vbUNvbnRyb2xsZXIodmlld0NhbnZhcywgcGx1cywgbWludXMpO1xuXG5cdGNhbnZhc0NvbnRyb2wuYWRkWm9vbUxpc3RlbmVyKHBhbkNvbnRyb2wpO1xuXG5cdHZpZXdDYW52YXMuZHJhdygpO1xufVxuXG5mdW5jdGlvbiBzaG93KCl7XG5cdHNob3dNYXAoXCJjYW52YXNcIiwgXCJUeXBlU2NyaXB0XCIpO1xufVxuXG5pZiAoXG4gICAgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiIHx8XG4gICAgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09IFwibG9hZGluZ1wiICYmICFkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZG9TY3JvbGwpXG4pIHtcblx0c2hvdygpO1xufSBlbHNlIHtcblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgc2hvdyk7XG59XG5cbiIsImltcG9ydCB7IFN0YXRpY0ltYWdlIH0gZnJvbSBcIi4uL2dyYXBoaWNzL2NhbnZhc3RpbGVcIjtcbmltcG9ydCB7IFZpZXdDYW52YXMgfSBmcm9tIFwiLi4vZ3JhcGhpY3Mvdmlld2NhbnZhc1wiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuZXhwb3J0IGNsYXNzIEltYWdlQ29udHJvbGxlciB7XG5cbiAgICBjb25zdHJ1Y3Rvcih2aWV3Q2FudmFzOiBWaWV3Q2FudmFzLCByZWFkb25seSBzdGF0aWNJbWFnZTogU3RhdGljSW1hZ2UpIHtcbiAgICBcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMucHJlc3NlZCh2aWV3Q2FudmFzLCBlICBhcyBLZXlib2FyZEV2ZW50KSk7XG4gICAgfVxuXG4gICAgcHJlc3NlZCh2aWV3Q2FudmFzOiBWaWV3Q2FudmFzLCBldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIFx0Y29uc29sZS5sb2coXCJwcmVzc2VkXCIgKyBldmVudC50YXJnZXQgKyBcIiwgXCIgKyBldmVudC5rZXkpO1xuXG4gICAgXHRzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgIFx0XHRjYXNlIFwiYVwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2UueEluZGV4ID0gdGhpcy5zdGF0aWNJbWFnZS54SW5kZXggLSAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcImRcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnhJbmRleCA9IHRoaXMuc3RhdGljSW1hZ2UueEluZGV4ICsgMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJ3XCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS55SW5kZXggPSB0aGlzLnN0YXRpY0ltYWdlLnlJbmRleCAtIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwic1wiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2UueUluZGV4ID0gdGhpcy5zdGF0aWNJbWFnZS55SW5kZXggKyAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcImVcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnJvdGF0aW9uID0gdGhpcy5zdGF0aWNJbWFnZS5yb3RhdGlvbiAtIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwicVwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uucm90YXRpb24gPSB0aGlzLnN0YXRpY0ltYWdlLnJvdGF0aW9uICsgMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJ4XCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWCA9IHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1ggLSAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIlhcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdYID0gdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWCArIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwielwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1kgPSB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdZIC0gMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJaXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWSA9IHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1kgKyAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0ZGVmYXVsdDpcbiAgICBcdFx0XHQvLyBjb2RlLi4uXG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHR9XG4gICAgXHRjb25zb2xlLmxvZyhcImltYWdlIGF0OiBcIiArICB0aGlzLnN0YXRpY0ltYWdlLnhJbmRleCArIFwiLCBcIiArIHRoaXMuc3RhdGljSW1hZ2UueUluZGV4KTtcbiAgICBcdGNvbnNvbGUubG9nKFwiaW1hZ2Ugcm8gc2M6IFwiICsgIHRoaXMuc3RhdGljSW1hZ2Uucm90YXRpb24gKyBcIiwgXCIgKyB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdYICsgXCIsIFwiICsgdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWSk7XG4gICAgfTtcblxufTsiLCJpbXBvcnQgeyBWaWV3Q2FudmFzIH0gZnJvbSBcIi4uL2dyYXBoaWNzL3ZpZXdjYW52YXNcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbmFic3RyYWN0IGNsYXNzIE1vdXNlQ29udHJvbGxlciB7XG5cbiAgICBtb3VzZVBvc2l0aW9uKGV2ZW50OiBNb3VzZUV2ZW50LCB3aXRoaW46IEhUTUxFbGVtZW50KTogUG9pbnQyRCB7XG4gICAgICAgIGxldCBtX3Bvc3ggPSBldmVudC5jbGllbnRYICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0XG4gICAgICAgICAgICAgICAgICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQ7XG4gICAgICAgIGxldCBtX3Bvc3kgPSBldmVudC5jbGllbnRZICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3BcbiAgICAgICAgICAgICAgICAgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuXG4gICAgICAgIHZhciBlX3Bvc3ggPSAwO1xuICAgICAgICB2YXIgZV9wb3N5ID0gMDtcbiAgICAgICAgaWYgKHdpdGhpbi5vZmZzZXRQYXJlbnQpe1xuICAgICAgICAgICAgZG8geyBcbiAgICAgICAgICAgICAgICBlX3Bvc3ggKz0gd2l0aGluLm9mZnNldExlZnQ7XG4gICAgICAgICAgICAgICAgZV9wb3N5ICs9IHdpdGhpbi5vZmZzZXRUb3A7XG4gICAgICAgICAgICB9IHdoaWxlICh3aXRoaW4gPSA8SFRNTEVsZW1lbnQ+d2l0aGluLm9mZnNldFBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFBvaW50MkQobV9wb3N4IC0gZV9wb3N4LCBtX3Bvc3kgLSBlX3Bvc3kpO1xuICAgIH1cbiAgICBcbn1cblxuYWJzdHJhY3QgY2xhc3MgWm9vbUxpc3RlbmVyIHtcbiAgICBhYnN0cmFjdCB6b29tKGJ5OiBudW1iZXIpO1xufVxuXG5leHBvcnQgY2xhc3MgWm9vbUNvbnRyb2xsZXIgZXh0ZW5kcyBNb3VzZUNvbnRyb2xsZXIge1xuXG5cdHByaXZhdGUgbGlzdGVuZXJzOiBBcnJheTxab29tTGlzdGVuZXI+ID0gW107XG5cdHByaXZhdGUgem9vbSA9IDE7XG5cbiAgICBjb25zdHJ1Y3Rvcih2aWV3Q2FudmFzOiBWaWV3Q2FudmFzLCByZWFkb25seSB6b29tSW46IEhUTUxFbGVtZW50LCByZWFkb25seSB6b29tT3V0OiBIVE1MRWxlbWVudCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgXHR6b29tSW4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlOkV2ZW50KSA9PiB0aGlzLmNsaWNrZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzLCAuOTUpKTtcbiAgICBcdHpvb21PdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlOkV2ZW50KSA9PiB0aGlzLmNsaWNrZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzLCAxLjA1KSk7XG4gICAgXHR2aWV3Q2FudmFzLmN0eC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5jbGlja2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcywgLjc1KSk7XG4gICAgfVxuXG4gICAgYWRkWm9vbUxpc3RlbmVyKHpvb21MaXN0ZW5lcjogWm9vbUxpc3RlbmVyKXtcbiAgICBcdHRoaXMubGlzdGVuZXJzLnB1c2goem9vbUxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICBjbGlja2VkKGV2ZW50OiBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzOiBWaWV3Q2FudmFzLCBieTogbnVtYmVyKSB7XG4gICAgXHRjb25zb2xlLmxvZyhcImNsaWNrZWRcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LnR5cGUpO1xuXG4gICAgXHRjb25zb2xlLmxvZyhcImxpc3RlbmVycyBcIiArIHRoaXMubGlzdGVuZXJzLmxlbmd0aCk7XG5cbiAgICAgICAgc3dpdGNoKGV2ZW50LnR5cGUpe1xuICAgICAgICAgICAgY2FzZSBcImRibGNsaWNrXCI6XG4gICAgICAgICAgICAgICAgbGV0IGNhbnZhcyA9IHZpZXdDYW52YXMuY3R4LmNhbnZhcztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsZXQgbVhZID0gdGhpcy5tb3VzZVBvc2l0aW9uKGV2ZW50LCB2aWV3Q2FudmFzLmN0eC5jYW52YXMpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZpZXdDYW52YXMuem9vbUFib3V0KG1YWS54IC8gY2FudmFzLmNsaWVudFdpZHRoLCBtWFkueSAvIGNhbnZhcy5jbGllbnRIZWlnaHQsIGJ5KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdmlld0NhbnZhcy56b29tVmlldyhieSk7XG4gICAgICAgIH1cblxuICAgIFx0dGhpcy56b29tID0gdGhpcy56b29tICogYnk7XG4gICAgXHRmb3IgKGxldCB2YWx1ZSBvZiB0aGlzLmxpc3RlbmVycyl7XG4gICAgXHRcdHZhbHVlLnpvb20odGhpcy56b29tKTtcbiAgICBcdH1cblxuICAgIFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgfTtcblxufTtcblxuZXhwb3J0IGNsYXNzIFBhbkNvbnRyb2xsZXIgZXh0ZW5kcyBab29tTGlzdGVuZXIge1xuXG5cdHByaXZhdGUgeFByZXZpb3VzOiBudW1iZXI7XG5cdHByaXZhdGUgeVByZXZpb3VzOiBudW1iZXI7XG5cdHByaXZhdGUgcmVjb3JkOiBib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgYmFzZU1vdmU6IG51bWJlciA9IDI1Njtcblx0cHJpdmF0ZSBtb3ZlOiBudW1iZXIgPSAyNTY7XG5cbiAgICBjb25zdHJ1Y3Rvcih2aWV3Q2FudmFzOiBWaWV3Q2FudmFzLCByZWFkb25seSBkcmFnRWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgICBcdHN1cGVyKCk7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcykpO1xuICAgIFx0ZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdDYW52YXMpKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcykpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLnJlY29yZCA9IGZhbHNlKTtcbiAgICB9XG5cbiAgICB6b29tKGJ5OiBudW1iZXIpe1xuICAgIFx0Y29uc29sZS5sb2coXCJ6b29tIGJ5IFwiICsgYnkpO1xuICAgIFx0dGhpcy5tb3ZlID0gdGhpcy5iYXNlTW92ZSAvIGJ5O1xuICAgIH1cblxuICAgIGRyYWdnZWQoZXZlbnQ6IE1vdXNlRXZlbnQsIHZpZXdDYW52YXM6IFZpZXdDYW52YXMpIHtcblxuICAgICAgICBsZXQgY2FudmFzID0gdmlld0NhbnZhcy5jdHguY2FudmFzO1xuXG4gICAgXHRzd2l0Y2goZXZlbnQudHlwZSl7XG4gICAgXHRcdGNhc2UgXCJtb3VzZWRvd25cIjpcbiAgICBcdFx0XHR0aGlzLnJlY29yZCA9IHRydWU7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJtb3VzZXVwXCI6XG4gICAgXHRcdFx0dGhpcy5yZWNvcmQgPSBmYWxzZTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0ZGVmYXVsdDpcbiAgICBcdFx0XHRpZiAodGhpcy5yZWNvcmQpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgeERlbHRhID0gKGV2ZW50LmNsaWVudFggLSB0aGlzLnhQcmV2aW91cykgLyB0aGlzLm1vdmU7XG4gICAgICAgICAgICAgICAgICAgIGxldCB5RGVsdGEgPSAoZXZlbnQuY2xpZW50WSAtIHRoaXMueVByZXZpb3VzKSAvIHRoaXMubW92ZTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3VG9wTGVmdCA9IG5ldyBQb2ludDJEKHZpZXdDYW52YXMudG9wTGVmdC54IC0geERlbHRhLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdDYW52YXMudG9wTGVmdC55IC0geURlbHRhKTtcblxuICAgICAgICAgICAgICAgICAgICB2aWV3Q2FudmFzLm1vdmVWaWV3KG5ld1RvcExlZnQpO1xuICAgICAgICAgICAgICAgICAgICB2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHR9XG4gICAgXHR9XG5cblx0XHR0aGlzLnhQcmV2aW91cyA9IGV2ZW50LmNsaWVudFg7XG5cdFx0dGhpcy55UHJldmlvdXMgPSBldmVudC5jbGllbnRZO1xuXG4gICAgfTtcblxuICAgIG1vdXNlUG9zaXRpb24oZXZlbnQ6IE1vdXNlRXZlbnQsIHdpdGhpbjogSFRNTEVsZW1lbnQpOiBQb2ludDJEIHtcbiAgICAgICAgbGV0IG1fcG9zeCA9IGV2ZW50LmNsaWVudFggKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnRcbiAgICAgICAgICAgICAgICAgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdDtcbiAgICAgICAgbGV0IG1fcG9zeSA9IGV2ZW50LmNsaWVudFkgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7XG5cbiAgICAgICAgdmFyIGVfcG9zeCA9IDA7XG4gICAgICAgIHZhciBlX3Bvc3kgPSAwO1xuICAgICAgICBpZiAod2l0aGluLm9mZnNldFBhcmVudCl7XG4gICAgICAgICAgICBkbyB7IFxuICAgICAgICAgICAgICAgIGVfcG9zeCArPSB3aXRoaW4ub2Zmc2V0TGVmdDtcbiAgICAgICAgICAgICAgICBlX3Bvc3kgKz0gd2l0aGluLm9mZnNldFRvcDtcbiAgICAgICAgICAgIH0gd2hpbGUgKHdpdGhpbiA9IDxIVE1MRWxlbWVudD53aXRoaW4ub2Zmc2V0UGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQyRChtX3Bvc3ggLSBlX3Bvc3gsIG1fcG9zeSAtIGVfcG9zeSk7XG4gICAgfVxuICAgIFxufTtcblxuIl19
