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
    function ViewCanvas(topLeft, widthMapUnits, heightMapUnits, grid, ctx) {
        var _this = _super.call(this, topLeft, widthMapUnits, heightMapUnits) || this;
        _this.grid = grid;
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
        if (grid)
            _this.gridLayer = new grid_1.GridLayer(_this.offscreen, 1);
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
        if (this.grid) {
            this.scale(localContext, 256, dimension, false);
            this.gridLayer.draw(this.topLeft, dimension.x, dimension.y);
            this.scale(localContext, 256, dimension, true);
        }
        var imageData = localContext.getImageData(0, 0, this.width, this.height);
        this.ctx.clearRect(0, 0, this.width, this.height);
        // console.log("image data ", imageData);
        this.ctx.putImageData(imageData, 0, 0);
        this.drawCentre(this.ctx);
    };
    ViewCanvas.prototype.drawCentre = function (context) {
        context.beginPath();
        context.globalAlpha = 0.3;
        context.strokeStyle = "red";
        context.moveTo(this.width / 2, 6 / 16 * this.height);
        context.lineTo(this.width / 2, 10 / 16 * this.height);
        context.moveTo(7 / 16 * this.width, this.height / 2);
        context.lineTo(9 / 16 * this.width, this.height / 2);
        context.stroke();
        context.globalAlpha = 1;
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
var maryImage = new canvastile_1.StaticImage(-.96, -.59, .41, .42, -0.325, "images/maps_145_b_4_(2)_f002r_2[SVC2] (1).png", 0.7);
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
var stmarysImage = new canvastile_1.StaticImage(-1.055, 1.02, .43, .415, -0.21, "images/maps_145_b_4_(2)_f005r[SVC2].jpg", 0.7);
var steamImage = new canvastile_1.StaticImage(8.145, 0.265, .815, .92, 0.12, "images/maps_145_b_4_(2)_f012r_1[SVC2].jpg", 0.7);
var fifteenImage = new canvastile_1.StaticImage(-4, 2.7, 0.4, .4, -1.4, "images/maps_145_b_4_(2)_f015r_2[SVC2].png", 0.7);
var henriettaImage = new canvastile_1.StaticImage(-2.355, -2.43, 0.61, 0.61, 0.05, "images/henrietta.png", 0.7);
var fourcourtsImage = new canvastile_1.StaticImage(-3.28, 1.77, 0.55, 0.55, -0.03, "images/fourcourts.png", 1);
var crossPoddle = new canvastile_1.StaticImage(-2.846, 6.125, .199, .205, -0.025, "images/wsc-maps-433-2.jpg", 0.7);
var patricksImage = new canvastile_1.StaticImage(-2.27, 5.95, .4, .4, 0.035, "images/wsc-maps-184-1-front.jpg", 0.6);
var clonmelImage = new canvastile_1.StaticImage(1.845, 8.12, .83, .83, -2.725, "images/wsc-maps-467-02.png", 0.7);
var broadstoneImage = new canvastile_1.StaticImage(-2.61, -0.055, 1.455, 1.455, 1.565, "images/wsc-maps-072.png", 0.7);
var parliamentImage = new canvastile_1.StaticImage(-0.9, 2.67, .5, .5, -3.32, "images/wsc-maps-088-1.png", 0.7);
var cutpurseImage = new canvastile_1.StaticImage(-3.885, 3.43, .535, .545, -0.074, "images/wsc-maps-106-1.jpg", 0.7);
var cutpatrickImage = new canvastile_1.StaticImage(-2.98, 4.32, 1.53, 1.53, -0.025, "images/WSC-Maps-757.png", 0.7);
var cutpatrickOverlayImage = new canvastile_1.StaticImage(-2.98, 4.32, 1.53, 1.53, -0.025, "images/WSC-Maps-757_overlay.png", 0.7);
var thingImage = new canvastile_1.StaticImage(-2.5, 3.6, 1.22, 1.16, 0, "images/IMG_0646.png", 0.4);
var bluecoatImage = new canvastile_1.StaticImage(-3.435, -1.995, 2.39, 2.355, 0, "images/bluecoat.png", 0.4);
var castleImage = new canvastile_1.StaticImage(-3.51, 2.375, 1.985, 1.995, 0, "images/castle.png", 0.4);
var grandImage = new canvastile_1.StaticImage(0.755, 3.2, .6, .6, 1.235, "images/wsc-maps-334.png", 0.4);
var totalImage = new canvastile_1.StaticImage(4.485, -1.875, 7.465, 7.35, 0, "images/maps_145_b_4_(2)_f001r[SVC2].jpg", .5);
var totalOverlayImage = new canvastile_1.StaticImage(4.45, -1.84, 3.893, 3.829, 0, "images/maps_145_b_4_(2)_f001r[SVC2].png", .5);
function showMap(divName, name) {
    var canvas = document.getElementById(divName);
    var ctx = canvas.getContext('2d');
    var viewCanvas = new viewcanvas_1.ViewCanvas(new point2d_1.Point2D(-8, -6), 9, 6, false, ctx);
    // viewCanvas.addTileLayer(baseLayer);
    // viewCanvas.addTileLayer(sentinelLayer);
    //viewCanvas.addTileLayer(liffeySentinelLayer);
    //viewCanvas.addTileLayer(liffeyLabelLayer);
    //viewCanvas.addStaticElement(totalImage);
    //viewCanvas.addStaticElement(totalOverlayImage);
    //viewCanvas.addStaticElement(broadstoneImage);
    viewCanvas.addStaticElement(parliamentImage);
    viewCanvas.addStaticElement(cutpurseImage);
    viewCanvas.addStaticElement(grandImage);
    //viewCanvas.addStaticElement(cutpatrickImage);
    viewCanvas.addStaticElement(cutpatrickOverlayImage);
    viewCanvas.addStaticElement(maryImage);
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
    viewCanvas.addStaticElement(stmarysImage);
    viewCanvas.addStaticElement(patricksImage);
    //viewCanvas.addStaticElement(crossPoddle);
    viewCanvas.addStaticElement(clonmelImage);
    viewCanvas.addStaticElement(thingImage);
    viewCanvas.addStaticElement(bluecoatImage);
    viewCanvas.addStaticElement(castleImage);
    viewCanvas.addStaticElement(fifteenImage);
    viewCanvas.addStaticElement(henriettaImage);
    viewCanvas.addStaticElement(fourcourtsImage);
    var imageController = new imageController_1.ImageController(viewCanvas, fourcourtsImage);
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
                if (event.ctrlKey) {
                    by = 1 / by;
                }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2dlb20vdGlsZS50cyIsInNyYy9nZW9tL3ZpZXdwb3J0LnRzIiwic3JjL2dlb20vd29ybGQyZC50cyIsInNyYy9ncmFwaGljcy9jYW52YXN0aWxlLnRzIiwic3JjL2dyYXBoaWNzL2dyaWQudHMiLCJzcmMvZ3JhcGhpY3Mvdmlld2NhbnZhcy50cyIsInNyYy9zaW1wbGVXb3JsZC50cyIsInNyYy91aS9pbWFnZUNvbnRyb2xsZXIudHMiLCJzcmMvdWkvbWFwQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQ0E7SUFPSSxpQkFBWSxDQUFTLEVBQUUsQ0FBUztRQUM1QixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFRSwwQkFBUSxHQUFSO1FBQ0ksT0FBTyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDckQsQ0FBQztJQWJlLFlBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDekIsV0FBRyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQWM1QyxjQUFDO0NBaEJELEFBZ0JDLElBQUE7QUFoQlksMEJBQU87Ozs7O0FDRXBCO0lBRUMsbUJBQW1CLGFBQXFCLEVBQVMsY0FBc0I7UUFBcEQsa0JBQWEsR0FBYixhQUFhLENBQVE7UUFBUyxtQkFBYyxHQUFkLGNBQWMsQ0FBUTtJQUFFLENBQUM7SUFJMUUsNEJBQVEsR0FBUixVQUFTLFFBQWlCLEVBQUUsU0FBaUIsRUFBRSxTQUFpQjtRQUUvRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFD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QU0sR0FBRyxLQUFLLENBQUM7Z0JBQzFELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7Z0JBQzFELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7Z0JBQzFELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENB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QVMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO0lBRTdCLENBQUM7SUFBQSxDQUFDO0lBRUYscUNBQWEsR0FBYixVQUFjLEtBQWlCLEVBQUUsTUFBbUI7UUFDaEQsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVU7Y0FDMUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUM7UUFDL0MsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVM7Y0FDekMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUM7UUFFOUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFDO1lBQ3BCLEdBQUc7Z0JBQ0MsTUFBTSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUM7Z0JBQzVCLE1BQU0sSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDO2FBQzlCLFFBQVEsTUFBTSxHQUFnQixNQUFNLENBQUMsWUFBWSxFQUFFO1NBQ3ZEO1FBRUQsT0FBTyxJQUFJLGlCQUFPLENBQUMsTUFBTSxHQUFHLE1BQU0sRUFBRSxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVMLG9CQUFDO0FBQUQsQ0F4RUEsQUF3RUMsQ0F4RWtDLFlBQVksR0F3RTlDO0FBeEVZLHNDQUFhO0FBd0V6QixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXG5leHBvcnQgY2xhc3MgUG9pbnQyRCB7XG4gICAgc3RhdGljIHJlYWRvbmx5IHplcm8gPSBuZXcgUG9pbnQyRCgwLCAwKTtcbiAgICBzdGF0aWMgcmVhZG9ubHkgb25lID0gbmV3IFBvaW50MkQoMSwgMSk7XG5cbiAgICByZWFkb25seSB4OiBudW1iZXI7XG4gICAgcmVhZG9ubHkgeTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcblx0fVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiUG9pbnQyRChcIiArIHRoaXMueCArIFwiLCBcIiArIHRoaXMueSArIFwiKVwiO1xuICAgIH1cblxufSIsImltcG9ydCB7IFVuaXRzIH0gZnJvbSBcIi4vd29ybGQyZFwiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuL3BvaW50MmRcIjtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFRpbGVMYXllciB7XG5cdFxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgd2lkdGhNYXBVbml0czogbnVtYmVyLCBwdWJsaWMgaGVpZ2h0TWFwVW5pdHM6IG51bWJlcil7fVxuXG5cdGFic3RyYWN0IGdldFRpbGUoeEluZGV4OiBudW1iZXIsIHlJbmRleDogbnVtYmVyKTogVGlsZTtcblxuXHRnZXRUaWxlcyhwb3NpdGlvbjogUG9pbnQyRCwgeE1hcFVuaXRzOiBudW1iZXIsIHlNYXBVbml0czogbnVtYmVyKTogQXJyYXk8VGlsZT4ge1xuXG5cdFx0bGV0IGZpcnN0WCA9IE1hdGguZmxvb3IocG9zaXRpb24ueCAvIHRoaXMud2lkdGhNYXBVbml0cyk7XG5cdFx0bGV0IGxhc3RYID0gTWF0aC5jZWlsKChwb3NpdGlvbi54ICsgeE1hcFVuaXRzKS8gdGhpcy53aWR0aE1hcFVuaXRzKTtcblxuXHRcdGxldCBmaXJzdFkgPSBNYXRoLmZsb29yKHBvc2l0aW9uLnkgLyB0aGlzLmhlaWdodE1hcFVuaXRzKTtcblx0XHRsZXQgbGFzdFkgPSBNYXRoLmNlaWwoKHBvc2l0aW9uLnkgKyB5TWFwVW5pdHMpLyB0aGlzLmhlaWdodE1hcFVuaXRzKTtcblxuXHRcdGxldCB0aWxlcyA9IG5ldyBBcnJheTxUaWxlPigpO1xuXG5cdFx0Zm9yICh2YXIgeD1maXJzdFg7IHg8bGFzdFg7IHgrKyl7XG5cdFx0XHRmb3IgKHZhciB5PWZpcnN0WTsgeTxsYXN0WTsgeSsrKXtcblx0XHRcdFx0dGlsZXMucHVzaCh0aGlzLmdldFRpbGUoeCwgeSkpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRpbGVzO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNsYXNzIFRpbGUge1xuXHRcblx0c3RhdGljIGVtcHR5VGlsZTogVGlsZSA9IG5ldyBUaWxlKC0xLC0xKTtcblxuXHRjb25zdHJ1Y3Rvcih4SW5kZXg6IG51bWJlciwgeUluZGV4OiBudW1iZXIpe31cblxufSIsImltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi9wb2ludDJkXCI7XG5pbXBvcnQgeyBWZWN0b3IyRCB9IGZyb20gXCIuL3ZlY3RvcjJkXCI7XG5pbXBvcnQgeyBXb3JsZDJELCBVbml0cyB9IGZyb20gXCIuL3dvcmxkMmRcIjtcblxuZXhwb3J0IGNsYXNzIFZpZXdwb3J0IHtcblx0XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB0b3BMZWZ0OiBQb2ludDJELCBcblx0XHRwcml2YXRlIHdpZHRoTWFwVW5pdHM6IG51bWJlciwgcHJpdmF0ZSBoZWlnaHRNYXBVbml0czogbnVtYmVyKXtcblxuXHRcdGNvbnNvbGUubG9nKFwidyBoXCIgKyB3aWR0aE1hcFVuaXRzICsgXCIsIFwiICsgaGVpZ2h0TWFwVW5pdHMpO1xuXHR9XG5cblx0bW92ZVZpZXcodG9wTGVmdDogUG9pbnQyRCl7XG5cdFx0dGhpcy50b3BMZWZ0ID0gdG9wTGVmdDtcblx0fVxuXG5cdHpvb21WaWV3KHpvb206IG51bWJlcil7XG5cdFx0bGV0IG5ld1dpZHRoID0gdGhpcy53aWR0aE1hcFVuaXRzICogem9vbTtcblx0XHRsZXQgbmV3SGVpZ2h0ID0gdGhpcy5oZWlnaHRNYXBVbml0cyAqIHpvb207XG5cblx0XHRsZXQgbW92ZVggPSAodGhpcy53aWR0aE1hcFVuaXRzIC0gbmV3V2lkdGgpIC8gMjtcblx0XHRsZXQgbW92ZVkgPSAodGhpcy5oZWlnaHRNYXBVbml0cyAtIG5ld0hlaWdodCkgLyAyO1xuXG5cdFx0dGhpcy50b3BMZWZ0ID0gbmV3IFBvaW50MkQodGhpcy50b3BMZWZ0LnggKyBtb3ZlWCwgdGhpcy50b3BMZWZ0LnkgKyBtb3ZlWSk7XG5cblx0XHR0aGlzLndpZHRoTWFwVW5pdHMgPSBuZXdXaWR0aDtcblx0XHR0aGlzLmhlaWdodE1hcFVuaXRzID0gbmV3SGVpZ2h0O1xuXHR9XG5cblx0em9vbUFib3V0KHhSZWxhdGl2ZTogbnVtYmVyLCB5UmVsYXRpdmU6IG51bWJlciwgem9vbTogbnVtYmVyKXtcblxuXHRcdGxldCB4RGlmZiA9IDAuNSAtIHhSZWxhdGl2ZTtcblx0XHRsZXQgeURpZmYgPSAwLjUgLSB5UmVsYXRpdmU7XG5cblx0XHR2YXIgeE1vdmUgPSB4RGlmZiAqIHRoaXMud2lkdGhNYXBVbml0cztcblx0XHR2YXIgeU1vdmUgPSB5RGlmZiAqIHRoaXMuaGVpZ2h0TWFwVW5pdHM7XG5cblx0XHR0aGlzLnRvcExlZnQgPSBuZXcgUG9pbnQyRCh0aGlzLnRvcExlZnQueCAtIHhNb3ZlLCB0aGlzLnRvcExlZnQueSAtIHlNb3ZlKTtcblxuXHRcdHRoaXMuem9vbVZpZXcoem9vbSk7XG5cblx0XHR4TW92ZSA9IHhEaWZmICogdGhpcy53aWR0aE1hcFVuaXRzO1xuXHRcdHlNb3ZlID0geURpZmYgKiB0aGlzLmhlaWdodE1hcFVuaXRzO1xuXG5cdFx0dGhpcy50b3BMZWZ0ID0gbmV3IFBvaW50MkQodGhpcy50b3BMZWZ0LnggKyB4TW92ZSwgdGhpcy50b3BMZWZ0LnkgKyB5TW92ZSk7XG5cblx0fVxuXG5cdGdldERpbWVuc2lvbnMoKXtcblx0XHRyZXR1cm4gbmV3IFBvaW50MkQodGhpcy53aWR0aE1hcFVuaXRzLCB0aGlzLmhlaWdodE1hcFVuaXRzKTtcblx0fVxuXG59IiwiaW1wb3J0IHsgVGlsZUxheWVyIH0gZnJvbSBcIi4vdGlsZVwiO1xuXG5leHBvcnQgY2xhc3MgVW5pdHMge1xuXG5cdHN0YXRpYyByZWFkb25seSBXZWJXVSA9IG5ldyBVbml0cyhcIk1lcmNhdG9yIFdlYiBXb3JsZCBVbml0c1wiKTtcblxuXHRjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpe31cblxufVxuLyoqXG4gIEEgd29ybGQgaXMgdGhlIGJhc2UgdGhhdCBhbGwgb3RoZXIgZWxlbWVudHMgb3JpZW50YXRlIGZyb20gXG4qKi9cbmV4cG9ydCBjbGFzcyBXb3JsZDJEIHtcblxuXHRwcml2YXRlIHRpbGVMYXllcnM6IEFycmF5PFRpbGVMYXllcj4gPSBbXTtcblx0XG5cdGNvbnN0cnVjdG9yKCl7fVxuXG4gICAgYWRkVGlsZUxheWVyKHRpbGVMYXllcjogVGlsZUxheWVyKTogbnVtYmVyIHtcbiAgICBcdHJldHVybiB0aGlzLnRpbGVMYXllcnMucHVzaCh0aWxlTGF5ZXIpO1xuICAgIH1cblxufSIsImltcG9ydCB7IFRpbGUsIFRpbGVMYXllciB9IGZyb20gXCIuLi9nZW9tL3RpbGVcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDYW52YXNUaWxlIGV4dGVuZHMgVGlsZSB7XG5cblx0YWJzdHJhY3QgZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgc2NhbGluZ1g6IG51bWJlciwgc2NhbGluZ1k6IG51bWJlciwgXG5cdFx0Y2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpOiB2b2lkO1xuXG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZVN0cnVjdCB7XG5cblx0cHJlZml4OiBzdHJpbmcgPSBcIlwiO1xuXHRzdWZmaXg6IHN0cmluZyA9IFwiXCI7XG5cdHRpbGVEaXI6IHN0cmluZyA9IFwiaW1hZ2VzL1wiO1xuXHR2aXNpYmxlOiBib29sZWFuID0gdHJ1ZTtcblx0b3BhY2l0eTogbnVtYmVyID0gMC43O1xuXHR0aWxlV2lkdGhQeDogbnVtYmVyID0gMjU2O1xuXHR0aWxlSGVpZ2h0UHg6IG51bWJlciA9IDI1Njtcblx0d2lkdGhNYXBVbml0czogbnVtYmVyID0gMTtcblx0aGVpZ2h0TWFwVW5pdHM6IG51bWJlciA9IDE7IFxuXG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZVRpbGUgZXh0ZW5kcyBDYW52YXNUaWxlIHtcblxuXHRwcml2YXRlIGltZzogSFRNTEltYWdlRWxlbWVudDtcblxuXHRjb25zdHJ1Y3RvcihyZWFkb25seSB4SW5kZXg6IG51bWJlciwgcmVhZG9ubHkgeUluZGV4OiBudW1iZXIsIGltYWdlU3JjOiBzdHJpbmcpIHtcblx0XHRzdXBlcih4SW5kZXgsIHlJbmRleCk7XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0fTtcblxuXHRwcml2YXRlIGRyYXdJbWFnZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgY2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpe1xuXHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIGNhbnZhc1gsIGNhbnZhc1kpO1xuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgY2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpe1xuXHRcdGlmICh0aGlzLmltZy5jb21wbGV0ZSkge1xuXHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCBjYW52YXNYLCBjYW52YXNZKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR0aGlzLmltZy5vbmxvYWQgPSAoZXZlbnQpID0+IHtcblx0XHRcdFx0dGhpcy5pbWcuY3Jvc3NPcmlnaW4gPSBcIkFub255bW91c1wiO1xuXHRcdFx0XHR0aGlzLmRyYXdJbWFnZShjdHgsIGNhbnZhc1gsIGNhbnZhc1kpO1xuXHRcdFx0fTtcblx0XHR9XG5cdH07XG5cbn1cblxuZXhwb3J0IGNsYXNzIFN0YXRpY0ltYWdlIHtcblxuXHRwcml2YXRlIGltZzogSFRNTEltYWdlRWxlbWVudDtcblxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgeEluZGV4OiBudW1iZXIsIHB1YmxpYyB5SW5kZXg6IG51bWJlciwgXG5cdFx0cHVibGljIHNjYWxpbmdYOiBudW1iZXIsIHB1YmxpYyBzY2FsaW5nWTogbnVtYmVyLCBwdWJsaWMgcm90YXRpb246IG51bWJlciwgXG5cdFx0aW1hZ2VTcmM6IHN0cmluZywgcmVhZG9ubHkgYWxwaGE6IG51bWJlcikge1xuXHRcdFxuXHRcdHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG5cdFx0dGhpcy5pbWcuc3JjID0gaW1hZ2VTcmM7XG5cdH07XG5cblx0cHJpdmF0ZSBkcmF3SW1hZ2UoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKXtcblxuXHRcdC8vc2NhbGluZ1ggPSBzY2FsaW5nWCAqIHRoaXMuc2NhbGluZztcblx0XHQvL3NjYWxpbmdZID0gc2NhbGluZ1kgKiB0aGlzLnNjYWxpbmc7XG5cblx0XHQvLyBsZXQgY29zWCA9IE1hdGguY29zKHRoaXMucm90YXRpb24pO1xuXHRcdC8vIGxldCBzaW5YID0gTWF0aC5zaW4odGhpcy5yb3RhdGlvbik7XG5cblx0XHRjdHgudHJhbnNsYXRlKGNhbnZhc1gsIGNhbnZhc1kpO1xuXHRcdGN0eC5yb3RhdGUodGhpcy5yb3RhdGlvbik7XG5cdFx0Y3R4LnNjYWxlKHRoaXMuc2NhbGluZ1gsIHRoaXMuc2NhbGluZ1kpO1xuXHRcdC8vY29uc29sZS5sb2coXCJ4eVNjYWxpbmcgXCIgKyB0aGlzLnNjYWxpbmdYICsgXCIsIFwiICsgdGhpcy5zY2FsaW5nWSk7XG5cdFx0Y3R4Lmdsb2JhbEFscGhhID0gdGhpcy5hbHBoYTtcblxuXHRcdC8vIGN0eC50cmFuc2Zvcm0oY29zWCAqIHNjYWxpbmdYLCBzaW5YICogc2NhbGluZ1ksIC1zaW5YICogc2NhbGluZ1gsIGNvc1ggKiBzY2FsaW5nWSwgXG5cdFx0Ly8gXHRjYW52YXNYIC8gdGhpcy5zY2FsaW5nLCBjYW52YXNZIC8gdGhpcy5zY2FsaW5nKTtcblxuXHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIC0odGhpcy5pbWcud2lkdGgvMiksIC0odGhpcy5pbWcuaGVpZ2h0LzIpKTtcblx0XHRcblx0XHRjdHguc2NhbGUoMS90aGlzLnNjYWxpbmdYLCAxL3RoaXMuc2NhbGluZ1kpO1xuXHRcdGN0eC5yb3RhdGUoLXRoaXMucm90YXRpb24pO1xuXHRcdGN0eC50cmFuc2xhdGUoLWNhbnZhc1gsIC1jYW52YXNZKTtcblx0XHRjdHguZ2xvYmFsQWxwaGEgPSAxO1xuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgY2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpe1xuXHRcdGlmICh0aGlzLmltZy5jb21wbGV0ZSkge1xuXHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCBjYW52YXNYLCBjYW52YXNZKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR0aGlzLmltZy5vbmxvYWQgPSAoZXZlbnQpID0+IHtcblx0XHRcdFx0dGhpcy5pbWcuY3Jvc3NPcmlnaW4gPSBcIkFub255bW91c1wiO1xuXHRcdFx0XHR0aGlzLmRyYXdJbWFnZShjdHgsIGNhbnZhc1gsIGNhbnZhc1kpO1xuXHRcdFx0fTtcblx0XHR9XG5cdH07XG5cbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlVGlsZUxheWVyIGV4dGVuZHMgVGlsZUxheWVyIHtcblxuXHRyZWFkb25seSBpbWFnZVByb3BlcnRpZXM6IEltYWdlU3RydWN0O1xuXG5cdGNvbnN0cnVjdG9yKGltYWdlUHJvcGVydGllczogSW1hZ2VTdHJ1Y3QpIHtcblx0XHRzdXBlcihpbWFnZVByb3BlcnRpZXMud2lkdGhNYXBVbml0cywgaW1hZ2VQcm9wZXJ0aWVzLmhlaWdodE1hcFVuaXRzKTtcblx0XHR0aGlzLmltYWdlUHJvcGVydGllcyA9IGltYWdlUHJvcGVydGllcztcblx0fVxuXG5cdC8qKlxuXHQgIGxlYXZlIGNhY2hpbmcgdXAgdG8gdGhlIGJyb3dzZXJcblx0KiovXG5cdGdldFRpbGUoeFVuaXRzOiBudW1iZXIsIHlVbml0czogbnVtYmVyKTogVGlsZSB7XG5cdFx0bGV0IGltYWdlU3JjID0gdGhpcy5pbWFnZVByb3BlcnRpZXMudGlsZURpciArIFxuXHRcdFx0dGhpcy5pbWFnZVByb3BlcnRpZXMucHJlZml4ICsgeFVuaXRzICsgXCJfXCIgKyB5VW5pdHMgKyB0aGlzLmltYWdlUHJvcGVydGllcy5zdWZmaXg7XG5cdFx0cmV0dXJuIG5ldyBJbWFnZVRpbGUoeFVuaXRzLCB5VW5pdHMsIGltYWdlU3JjKTtcblx0fVxuXG59XG4iLCJpbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgY2xhc3MgR3JpZExheWVyIHtcblxuXHRwcml2YXRlIGdyaWRTcGFjaW5nOiBudW1iZXI7XG5cblx0Y29uc3RydWN0b3IocHVibGljIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBncmlkU3BhY2luZzogbnVtYmVyKSB7XG5cdFx0dGhpcy5ncmlkU3BhY2luZyA9IGdyaWRTcGFjaW5nO1xuXHR9XG5cblx0c2V0R3JpZFNwYWNpbmcoZ3JpZFNwYWNpbmc6IG51bWJlcil7XG5cdFx0dGhpcy5ncmlkU3BhY2luZyA9IGdyaWRTcGFjaW5nO1xuXHR9XG5cdC8qKlxuXHQgIGxlYXZlIGNhY2hpbmcgdXAgdG8gdGhlIGJyb3dzZXJcblx0KiovXG5cdGRyYXcodG9wTGVmdDogUG9pbnQyRCwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcblx0XHRsZXQgbWluWCA9IE1hdGguZmxvb3IodG9wTGVmdC54KTtcblx0XHRsZXQgbWluWSA9IE1hdGguZmxvb3IodG9wTGVmdC55KTtcblxuXHRcdHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gMC41O1xuXHRcdHRoaXMuY3R4LnRyYW5zbGF0ZSgtMjU2ICogdG9wTGVmdC54LCAtMjU2ICogdG9wTGVmdC55KTtcblx0XHQvL2NvbnNvbGUubG9nKFwibWlucyBcIiArIHdpZHRoICsgXCIsIFwiICsgaGVpZ2h0KTtcblxuXHRcdGxldCBsYXN0WCA9IE1hdGguY2VpbCh0b3BMZWZ0LnggKyB3aWR0aCk7XG5cdFx0bGV0IGxhc3RZID0gTWF0aC5jZWlsKHRvcExlZnQueSArIGhlaWdodCk7XG5cblx0XHR0aGlzLmN0eC5zdHJva2VTdHlsZSA9ICdibHVlJztcblx0XHR0aGlzLmN0eC5mb250ID0gJzQ4cHggc2VyaWYnO1xuXG5cdFx0bGV0IHlaZXJvID0gbWluWSAqIHRoaXMuZ3JpZFNwYWNpbmcgKiAyNTY7XG5cdFx0bGV0IHlNYXggPSBsYXN0WSAqIHRoaXMuZ3JpZFNwYWNpbmcgKiAyNTY7XG5cdFx0bGV0IHhKdW1wID0gdGhpcy5ncmlkU3BhY2luZyAqIDI1NjtcblxuXHRcdGxldCB4WmVybyA9IG1pblggKiB0aGlzLmdyaWRTcGFjaW5nICogMjU2O1xuXHRcdGxldCB4TWF4ID0gbGFzdFggKiB0aGlzLmdyaWRTcGFjaW5nICogMjU2O1xuXHRcdGxldCB5SnVtcCA9IHRoaXMuZ3JpZFNwYWNpbmcgKiAyNTY7XG5cblx0XHR0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICBcdC8vdGhpcy5jdHguY2xlYXJSZWN0KHhaZXJvLCB5WmVybywgeE1heCwgeU1heCk7XG5cblx0XHRmb3IgKHZhciB4ID0gbWluWDsgeDxsYXN0WDsgeCsrKXtcblx0XHRcdC8vY29uc29sZS5sb2coXCJhdCBcIiArIG1pblgpO1xuXHRcdFx0bGV0IHhNb3ZlID0geCAqIHhKdW1wO1xuXHRcdFx0dGhpcy5jdHgubW92ZVRvKHhNb3ZlLCB5WmVybyk7XG5cdFx0XHR0aGlzLmN0eC5saW5lVG8oeE1vdmUsIHlNYXgpO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIHkgPSBtaW5ZOyB5PGxhc3RZOyB5Kyspe1xuXHRcdFx0bGV0IHlNb3ZlID0geSAqIHlKdW1wO1xuXHRcdFx0dGhpcy5jdHgubW92ZVRvKHhaZXJvLCB5TW92ZSk7XG5cdFx0XHR0aGlzLmN0eC5saW5lVG8oeE1heCwgeU1vdmUpO1xuXG5cdFx0XHRmb3IgKHZhciB4ID0gbWluWDsgeDxsYXN0WDsgeCsrKXtcblx0XHRcdFx0bGV0IHhNb3ZlID0gKHggLSAwLjUpICogeEp1bXA7XG5cdFx0XHRcdHlNb3ZlID0gKHkgLSAwLjUpICogeUp1bXA7XG5cdFx0XHRcdGxldCB0ZXh0ID0gXCJcIiArICh4LTEpICsgXCIsIFwiICsgKHktMSk7XG5cdFx0XHRcdHRoaXMuY3R4LmZpbGxUZXh0KHRleHQsIHhNb3ZlLCB5TW92ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMuY3R4LnN0cm9rZSgpO1xuXHRcdHRoaXMuY3R4LnRyYW5zbGF0ZSgyNTYgKiB0b3BMZWZ0LngsIDI1NiAqIHRvcExlZnQueSk7XG5cdFx0dGhpcy5jdHguZ2xvYmFsQWxwaGEgPSAxO1xuXHR9XG5cblxufSIsImltcG9ydCB7IFZpZXdwb3J0IH0gZnJvbSBcIi4uL2dlb20vdmlld3BvcnRcIjtcbmltcG9ydCB7IFdvcmxkMkQgfSBmcm9tIFwiLi4vZ2VvbS93b3JsZDJkXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuaW1wb3J0IHsgU3RhdGljSW1hZ2UsIEltYWdlVGlsZSwgSW1hZ2VUaWxlTGF5ZXIgfSBmcm9tIFwiLi9jYW52YXN0aWxlXCI7XG5pbXBvcnQgeyBHcmlkTGF5ZXIgfSBmcm9tIFwiLi9ncmlkXCI7XG5cbmV4cG9ydCBjbGFzcyBWaWV3Q2FudmFzIGV4dGVuZHMgVmlld3BvcnQge1xuXG4gICAgcHJpdmF0ZSBzdGF0aWNFbGVtZW50czogQXJyYXk8U3RhdGljSW1hZ2U+ID0gW107XG4gICAgcHJpdmF0ZSBpbWFnZVRpbGVMYXllcnMgPSBbXTtcblxuICAgIHByaXZhdGUgZ3JpZExheWVyOiBHcmlkTGF5ZXI7XG5cbiAgICBwcml2YXRlIG9mZnNjcmVlbjogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgIHByaXZhdGUgd2lkdGg6IG51bWJlcjtcbiAgICBwcml2YXRlIGhlaWdodDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IodG9wTGVmdDogUG9pbnQyRCwgXG4gICAgXHR3aWR0aE1hcFVuaXRzOiBudW1iZXIsIGhlaWdodE1hcFVuaXRzOiBudW1iZXIsIHByaXZhdGUgZ3JpZDogYm9vbGVhbixcbiAgICBcdHB1YmxpYyBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkge1xuXG4gICAgXHRzdXBlcih0b3BMZWZ0LCB3aWR0aE1hcFVuaXRzLCBoZWlnaHRNYXBVbml0cyk7XG5cbiAgICAgICAgdGhpcy53aWR0aCA9IGN0eC5jYW52YXMuY2xpZW50V2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gY3R4LmNhbnZhcy5jbGllbnRIZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5jdHguY2FudmFzLndpZHRoID0gdGhpcy53aWR0aDtcbiAgICAgICAgdGhpcy5jdHguY2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwib25zY3JlZW4gXCIgKyB0aGlzLmN0eC5jYW52YXMud2lkdGggKyBcIiwgXCIgKyB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICAvL2NvbnN0IGMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgICBjb25zdCBjID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib2Zmc2NyZWVuXCIpO1xuICAgICAgICBjLndpZHRoID0gdGhpcy53aWR0aDtcbiAgICAgICAgYy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcblxuICAgICAgICB0aGlzLm9mZnNjcmVlbiA9IDxDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ+Yy5nZXRDb250ZXh0KFwiMmRcIik7XG5cbiAgICAgICAgaWYgKGdyaWQpXG4gICAgXHQgICAgdGhpcy5ncmlkTGF5ZXIgPSBuZXcgR3JpZExheWVyKHRoaXMub2Zmc2NyZWVuLCAxKTtcbiAgICB9XG5cbiAgICBhZGRUaWxlTGF5ZXIoaW1hZ2VUaWxlTGF5ZXI6IEltYWdlVGlsZUxheWVyKTogdm9pZCB7XG4gICAgXHR0aGlzLmltYWdlVGlsZUxheWVycy5wdXNoKGltYWdlVGlsZUxheWVyKTtcbiAgICB9XG5cbiAgICBhZGRTdGF0aWNFbGVtZW50KHN0YXRpY0ltYWdlOiBTdGF0aWNJbWFnZSk6IHZvaWQge1xuICAgIFx0dGhpcy5zdGF0aWNFbGVtZW50cy5wdXNoKHN0YXRpY0ltYWdlKTtcbiAgICB9XG5cbiAgICBnZXRWaWV3U2NhbGluZyhwaXhlbHNQZXJVbml0OiBudW1iZXIpOiBQb2ludDJEIHtcbiAgICBcdGxldCBkaW1lbnNpb24gPSB0aGlzLmdldERpbWVuc2lvbnMoKTtcbiAgICBcdGxldCB2aWV3U2NhbGluZ1ggPSB0aGlzLmN0eC5jYW52YXMuY2xpZW50V2lkdGggLyBkaW1lbnNpb24ueCAvIHBpeGVsc1BlclVuaXQ7XG4gICAgXHRsZXQgdmlld1NjYWxpbmdZID0gdGhpcy5jdHguY2FudmFzLmNsaWVudEhlaWdodCAvIGRpbWVuc2lvbi55IC8gcGl4ZWxzUGVyVW5pdDtcbiAgICBcdHJldHVybiBuZXcgUG9pbnQyRCh2aWV3U2NhbGluZ1gsIHZpZXdTY2FsaW5nWSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzY2FsZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgXG4gICAgICAgIHBpeGVsc1BlclVuaXQ6IG51bWJlciwgZGltZW5zaW9uOiBQb2ludDJELCByZXZlcnNlOiBib29sZWFuKTogdm9pZCB7XG5cbiAgICBcdGxldCB2aWV3U2NhbGluZyA9IHRoaXMuZ2V0Vmlld1NjYWxpbmcocGl4ZWxzUGVyVW5pdCk7XG5cbiAgICBcdGlmIChyZXZlcnNlKXtcbiAgICBcdFx0Y3R4LnNjYWxlKDEvdmlld1NjYWxpbmcueCwgMS92aWV3U2NhbGluZy55KTtcbiAgICBcdH0gZWxzZSB7XG4gICAgXHRcdGN0eC5zY2FsZSh2aWV3U2NhbGluZy54LCB2aWV3U2NhbGluZy55KTtcbiAgICBcdH1cbiAgICBcdFxuICAgIH1cblxuICAgIGRyYXcoKTogdm9pZCB7XG4gICAgXHRsZXQgZGltZW5zaW9uID0gdGhpcy5nZXREaW1lbnNpb25zKCk7XG5cbiAgICAgICAgbGV0IGxvY2FsQ29udGV4dCA9IHRoaXMub2Zmc2NyZWVuO1xuXG4gICAgXHRsb2NhbENvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuICAgIFx0Zm9yIChsZXQgdmFsdWUgb2YgdGhpcy5pbWFnZVRpbGVMYXllcnMpe1xuICAgIFx0XHRpZiAodmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnZpc2libGUpIHtcblxuICAgICAgICAgICAgICAgIGxvY2FsQ29udGV4dC5nbG9iYWxBbHBoYSA9IHZhbHVlLmltYWdlUHJvcGVydGllcy5vcGFjaXR5O1xuXG4gICAgXHRcdFx0dGhpcy5zY2FsZShsb2NhbENvbnRleHQsIHZhbHVlLmltYWdlUHJvcGVydGllcy50aWxlV2lkdGhQeCwgZGltZW5zaW9uLCBmYWxzZSk7XG5cbiAgICBcdFx0XHRsZXQgdGlsZVNjYWxpbmdYID0gdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVXaWR0aFB4IC8gdmFsdWUud2lkdGhNYXBVbml0cztcbiAgICBcdFx0XHRsZXQgdGlsZVNjYWxpbmdZID0gdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVIZWlnaHRQeCAvIHZhbHVlLmhlaWdodE1hcFVuaXRzO1xuXG4gICAgXHRcdFx0bGV0IHRpbGVzOiBBcnJheTxJbWFnZVRpbGU+ID0gdmFsdWUuZ2V0VGlsZXModGhpcy50b3BMZWZ0LCBcbiAgICBcdFx0XHRcdGRpbWVuc2lvbi54LCBkaW1lbnNpb24ueSk7XG5cbiAgICBcdFx0XHRmb3IgKGxldCB0aWxlIG9mIHRpbGVzKXtcbiAgICBcdFx0XHRcdHZhciB0aWxlWCA9ICh0aWxlLnhJbmRleCAtIHRoaXMudG9wTGVmdC54KSAqIHRpbGVTY2FsaW5nWDtcbiAgICBcdFx0XHRcdHZhciB0aWxlWSA9ICh0aWxlLnlJbmRleCAtIHRoaXMudG9wTGVmdC55KSAqIHRpbGVTY2FsaW5nWTtcblxuICAgIFx0XHRcdFx0dGlsZS5kcmF3KGxvY2FsQ29udGV4dCwgdGlsZVgsIHRpbGVZKTtcbiAgICBcdFx0XHR9XG5cbiAgICBcdFx0XHR0aGlzLnNjYWxlKGxvY2FsQ29udGV4dCwgdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVXaWR0aFB4LCBkaW1lbnNpb24sIHRydWUpO1xuICAgICAgICAgICAgICAgIGxvY2FsQ29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XG4gICAgXHRcdH1cbiAgICBcdH1cblxuICAgIFx0Zm9yIChsZXQgdmFsdWUgb2YgdGhpcy5zdGF0aWNFbGVtZW50cyl7XG4gICAgXHRcdC8vMjU2IHB4IGlzIDEgbWFwIHVuaXRcblx0XHRcdGxldCB0aWxlU2NhbGluZ1ggPSAyNTY7XG5cdFx0XHRsZXQgdGlsZVNjYWxpbmdZID0gMjU2O1xuXG4gICAgXHRcdHRoaXMuc2NhbGUobG9jYWxDb250ZXh0LCAyNTYsIGRpbWVuc2lvbiwgZmFsc2UpO1xuXG4gICAgXHRcdGxldCBpbWFnZVggPSAodmFsdWUueEluZGV4IC0gdGhpcy50b3BMZWZ0LngpICogdGlsZVNjYWxpbmdYO1xuICAgIFx0XHRsZXQgaW1hZ2VZID0gKHZhbHVlLnlJbmRleCAtIHRoaXMudG9wTGVmdC55KSAqIHRpbGVTY2FsaW5nWTtcblxuICAgIFx0XHR2YWx1ZS5kcmF3KGxvY2FsQ29udGV4dCwgaW1hZ2VYLCBpbWFnZVkpO1xuICAgIFx0XHR0aGlzLnNjYWxlKGxvY2FsQ29udGV4dCwgMjU2LCBkaW1lbnNpb24sIHRydWUpO1xuXG4gICAgXHR9XG5cbiAgICAgICAgaWYgKHRoaXMuZ3JpZCl7XG4gICAgICAgICAgICB0aGlzLnNjYWxlKGxvY2FsQ29udGV4dCwgMjU2LCBkaW1lbnNpb24sIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuZ3JpZExheWVyLmRyYXcodGhpcy50b3BMZWZ0LCBkaW1lbnNpb24ueCwgZGltZW5zaW9uLnkpO1xuICAgICAgICAgICAgdGhpcy5zY2FsZShsb2NhbENvbnRleHQsIDI1NiwgZGltZW5zaW9uLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIFx0XG4gICAgICAgIGxldCBpbWFnZURhdGE6IEltYWdlRGF0YSA9IGxvY2FsQ29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiaW1hZ2UgZGF0YSBcIiwgaW1hZ2VEYXRhKTtcbiAgICAgICAgdGhpcy5jdHgucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG5cbiAgICAgICAgdGhpcy5kcmF3Q2VudHJlKHRoaXMuY3R4KTtcblxuICAgIH1cblxuICAgIGRyYXdDZW50cmUoY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKXtcbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IDAuMztcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKHRoaXMud2lkdGgvMiwgNi8xNip0aGlzLmhlaWdodCk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKHRoaXMud2lkdGgvMiwgMTAvMTYqdGhpcy5oZWlnaHQpO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyg3LzE2KnRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LzIpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyg5LzE2KnRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LzIpO1xuICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgICBjb250ZXh0Lmdsb2JhbEFscGhhID0gMTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBXb3JsZDJEIH0gZnJvbSBcIi4vZ2VvbS93b3JsZDJkXCI7XG5pbXBvcnQgeyBWaWV3cG9ydCB9IGZyb20gXCIuL2dlb20vdmlld3BvcnRcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi9nZW9tL3BvaW50MmRcIjtcbmltcG9ydCB7IFN0YXRpY0ltYWdlLCBJbWFnZVRpbGVMYXllciwgSW1hZ2VTdHJ1Y3QgfSBmcm9tIFwiLi9ncmFwaGljcy9jYW52YXN0aWxlXCI7XG5pbXBvcnQgeyBWaWV3Q2FudmFzIH0gZnJvbSBcIi4vZ3JhcGhpY3Mvdmlld2NhbnZhc1wiO1xuaW1wb3J0IHsgWm9vbUNvbnRyb2xsZXIsIFBhbkNvbnRyb2xsZXIgfSBmcm9tIFwiLi91aS9tYXBDb250cm9sbGVyXCI7XG5pbXBvcnQgeyBJbWFnZUNvbnRyb2xsZXIgfSBmcm9tIFwiLi91aS9pbWFnZUNvbnRyb2xsZXJcIjtcblxubGV0IHNpbXBsZVdvcmxkID0gbmV3IFdvcmxkMkQoKTtcblxuLy8gbGV0IGxheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuLy8gbGF5ZXJQcm9wZXJ0aWVzLnByZWZpeCA9IFwiXCI7XG4vLyBsYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCIucG5nXCI7XG5cbi8vIGxldCByb2FkTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG4vLyByb2FkTGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwiYi5wbmdcIjtcblxuLy8gbGV0IHNlbnRpbmVsTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG4vLyBzZW50aW5lbExheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImwuanBlZ1wiO1xuXG4vLyBsZXQgc2VudGluZWxUZXJyYWluTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG4vLyBzZW50aW5lbFRlcnJhaW5MYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCJ0LmpwZWdcIjtcblxubGV0IGxpZmZleUxheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xubGlmZmV5TGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwibGlmZmV5LmpwZWdcIjtcbmxpZmZleUxheWVyUHJvcGVydGllcy50aWxlRGlyID0gXCJpbWFnZXMvbGlmZmV5L1wiO1xuXG5sZXQgbGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbmxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwibGlmZmV5LnBuZ1wiO1xubGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMub3BhY2l0eSA9IDE7XG5saWZmZXlMYWJlbExheWVyUHJvcGVydGllcy50aWxlRGlyID0gXCJpbWFnZXMvbGlmZmV5L1wiO1xubGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMudmlzaWJsZSA9IHRydWU7XG5cbi8vIGxldCBiYXNlTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIobGF5ZXJQcm9wZXJ0aWVzKTtcbi8vIGxldCBzZW50aW5lbExheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKHNlbnRpbmVsTGF5ZXJQcm9wZXJ0aWVzKTtcbi8vIGxldCByb2FkTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIocm9hZExheWVyUHJvcGVydGllcyk7XG4vLyBsZXQgdGVycmFpbkxheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKHNlbnRpbmVsVGVycmFpbkxheWVyUHJvcGVydGllcyk7XG5cbmxldCBsaWZmZXlTZW50aW5lbExheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKGxpZmZleUxheWVyUHJvcGVydGllcyk7XG5sZXQgbGlmZmV5TGFiZWxMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihsaWZmZXlMYWJlbExheWVyUHJvcGVydGllcyk7XG5cbmxldCBkb2xpZXJJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgyLjI0LCAxLjg3LCAuNDMsIC40MywgLTAuMDYsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMTdSW1NWQzJdLmpwZ1wiLCAuNyk7XG5cbmxldCBtYXJ5SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLS45NiwgLS41OSwgLjQxLCAuNDIsIC0wLjMyNSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwMnJfMltTVkMyXSAoMSkucG5nXCIsIDAuNyk7XG5cbmxldCB0cmluaXR5SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMS45OSwgMy41OSwgLjQzLCAuNDMsIDAuMTUsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMTlSW1NWQzJdLmpwZ1wiLCAuNyk7XG5cbmxldCBwb29sYmVnSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMy4zNCwgMS42MjUsIC40MDUsIC40MywgMC4wNSxcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDE4UltTVkMyXS5qcGdcIiwgLjcpO1xuXG5sZXQgYWJiZXlJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgyLjM5LCAwLjAzNSwgLjQxNSwgLjQzNSwgLS4yNSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwOHJbU1ZDMl0uanBnXCIsIC43KTtcblxubGV0IGJ1c2FyYXNJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgzLjQ5LCAtMC4yNCwgLjQxLCAuNDI1LCAtLjI2LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDA5cltTVkMyXS5qcGdcIiwgLjcpO1xuXG5sZXQgbG93ZXJhYmJleUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDEuMjk1LCAwLjM3NzYsIC40MjUsIC40MzUsIC0uMjMsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDdyW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgZGFtZUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDAuOTgsIDIuMzE1LCAuNDEsIC40MjgsIC0wLjA5NSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAxNnJfMltTVkMyXS5wbmdcIiwgMC43KTtcblxubGV0IGN1c3RvbUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDUuMjEsIC0uMjQ1LCAuNDIsIC40NCwgMC4wMywgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAxMHJfMltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IG1hbm9ySW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoNi4zNiwgMC4wMjUsIC40MTUsIC40MzUsIDAuMTEsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMTFyW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgc2Fja3ZpbGxlSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMS4yOSwgLTEuMjgsIC40NiwgLjQyLCAtMC4yNjUsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDRyW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgZ3JlYXRJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSguMTksIC0wLjcwNSwgLjQsIC40MiwgLS41MSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwM3JbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBsb3dlcm9ybW9uZEltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDAuMTYsIDAuNzEsIC40MDUsIC40NCwgLTAuMjA1LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDA2cltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IHN0ZXBoZW5zSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMS43MywgNC45MzUsIC40MTUsIC40MiwgMC4yMDUsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMjBSW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgc3RtYXJ5c0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0xLjA1NSwgMS4wMiwgLjQzLCAuNDE1LCAtMC4yMSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwNXJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBzdGVhbUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDguMTQ1LCAwLjI2NSwgLjgxNSwgLjkyLCAwLjEyLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDEycl8xW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgZmlmdGVlbkltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC00LCAyLjcsIDAuNCwgLjQsIC0xLjQsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMTVyXzJbU1ZDMl0ucG5nXCIsIDAuNyk7XG5cbmxldCBoZW5yaWV0dGFJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMi4zNTUsIC0yLjQzLCAwLjYxLCAwLjYxLCAwLjA1LCBcblx0XCJpbWFnZXMvaGVucmlldHRhLnBuZ1wiLCAwLjcpO1xuXG5sZXQgZm91cmNvdXJ0c0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0zLjI4LCAxLjc3LCAwLjU1LCAwLjU1LCAtMC4wMywgXG5cdFwiaW1hZ2VzL2ZvdXJjb3VydHMucG5nXCIsIDEpO1xuXG5sZXQgY3Jvc3NQb2RkbGUgPSBuZXcgU3RhdGljSW1hZ2UoLTIuODQ2LCA2LjEyNSwgLjE5OSwgLjIwNSwgLTAuMDI1LCBcblx0XCJpbWFnZXMvd3NjLW1hcHMtNDMzLTIuanBnXCIsIDAuNyk7XG5cbmxldCBwYXRyaWNrc0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0yLjI3LCA1Ljk1LCAuNCwgLjQsIDAuMDM1LCBcblx0XCJpbWFnZXMvd3NjLW1hcHMtMTg0LTEtZnJvbnQuanBnXCIsIDAuNik7XG5cbmxldCBjbG9ubWVsSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMS44NDUsIDguMTIsIC44MywgLjgzLCAtMi43MjUsIFxuXHRcImltYWdlcy93c2MtbWFwcy00NjctMDIucG5nXCIsIDAuNyk7XG5cbmxldCBicm9hZHN0b25lSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTIuNjEsIC0wLjA1NSwgMS40NTUsIDEuNDU1LCAxLjU2NSwgXG5cdFwiaW1hZ2VzL3dzYy1tYXBzLTA3Mi5wbmdcIiwgMC43KTtcblxubGV0IHBhcmxpYW1lbnRJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMC45LCAyLjY3LCAuNSwgLjUsIC0zLjMyLCBcblx0XCJpbWFnZXMvd3NjLW1hcHMtMDg4LTEucG5nXCIsIDAuNyk7XG5cbmxldCBjdXRwdXJzZUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0zLjg4NSwgMy40MywgLjUzNSwgLjU0NSwgLTAuMDc0LCBcblx0XCJpbWFnZXMvd3NjLW1hcHMtMTA2LTEuanBnXCIsIDAuNyk7XG5cbmxldCBjdXRwYXRyaWNrSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTIuOTgsIDQuMzIsIDEuNTMsIDEuNTMsIC0wLjAyNSwgXG5cdFwiaW1hZ2VzL1dTQy1NYXBzLTc1Ny5wbmdcIiwgMC43KTtcblxubGV0IGN1dHBhdHJpY2tPdmVybGF5SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTIuOTgsIDQuMzIsIDEuNTMsIDEuNTMsIC0wLjAyNSwgXG5cdFwiaW1hZ2VzL1dTQy1NYXBzLTc1N19vdmVybGF5LnBuZ1wiLCAwLjcpO1xuXG5sZXQgdGhpbmdJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMi41LCAzLjYsIDEuMjIsIDEuMTYsIDAsIFxuXHRcImltYWdlcy9JTUdfMDY0Ni5wbmdcIiwgMC40KTtcblxubGV0IGJsdWVjb2F0SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTMuNDM1LCAtMS45OTUsIDIuMzksIDIuMzU1LCAwLCBcblx0XCJpbWFnZXMvYmx1ZWNvYXQucG5nXCIsIDAuNCk7XG5cbmxldCBjYXN0bGVJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMy41MSwgMi4zNzUsIDEuOTg1LCAxLjk5NSwgMCwgXG5cdFwiaW1hZ2VzL2Nhc3RsZS5wbmdcIiwgMC40KTtcblxubGV0IGdyYW5kSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMC43NTUsIDMuMiwgLjYsIC42LCAxLjIzNSwgXCJpbWFnZXMvd3NjLW1hcHMtMzM0LnBuZ1wiLCAwLjQpO1xuXG5sZXQgdG90YWxJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSg0LjQ4NSwgLTEuODc1LCA3LjQ2NSwgNy4zNSwgMCwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwMXJbU1ZDMl0uanBnXCIsIC41KTtcblxubGV0IHRvdGFsT3ZlcmxheUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDQuNDUsIC0xLjg0LCAzLjg5MywgMy44MjksIDAsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDFyW1NWQzJdLnBuZ1wiLCAuNSk7XG5cbmZ1bmN0aW9uIHNob3dNYXAoZGl2TmFtZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGl2TmFtZSk7XG5cbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cblx0bGV0IHZpZXdDYW52YXMgPSBuZXcgVmlld0NhbnZhcyhuZXcgUG9pbnQyRCgtOCwtNiksIDksIDYsIGZhbHNlLCBjdHgpO1xuXHQvLyB2aWV3Q2FudmFzLmFkZFRpbGVMYXllcihiYXNlTGF5ZXIpO1xuXHQvLyB2aWV3Q2FudmFzLmFkZFRpbGVMYXllcihzZW50aW5lbExheWVyKTtcblx0Ly92aWV3Q2FudmFzLmFkZFRpbGVMYXllcihsaWZmZXlTZW50aW5lbExheWVyKTtcblx0Ly92aWV3Q2FudmFzLmFkZFRpbGVMYXllcihsaWZmZXlMYWJlbExheWVyKTtcblxuXHQvL3ZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudCh0b3RhbEltYWdlKTtcblx0Ly92aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQodG90YWxPdmVybGF5SW1hZ2UpO1xuXHQvL3ZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChicm9hZHN0b25lSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQocGFybGlhbWVudEltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGN1dHB1cnNlSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoZ3JhbmRJbWFnZSk7XG5cdC8vdmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGN1dHBhdHJpY2tJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChjdXRwYXRyaWNrT3ZlcmxheUltYWdlKTtcblxuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQobWFyeUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGRvbGllckltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHRyaW5pdHlJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChwb29sYmVnSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoYWJiZXlJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChsb3dlcmFiYmV5SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoYnVzYXJhc0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHN0ZWFtSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoZGFtZUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGN1c3RvbUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KG1hbm9ySW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoc2Fja3ZpbGxlSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoZ3JlYXRJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChsb3dlcm9ybW9uZEltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHN0ZXBoZW5zSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoc3RtYXJ5c0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHBhdHJpY2tzSW1hZ2UpO1xuXHQvL3ZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChjcm9zc1BvZGRsZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChjbG9ubWVsSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQodGhpbmdJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChibHVlY29hdEltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGNhc3RsZUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGZpZnRlZW5JbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChoZW5yaWV0dGFJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChmb3VyY291cnRzSW1hZ2UpO1xuXG5cdGxldCBpbWFnZUNvbnRyb2xsZXIgPSBuZXcgSW1hZ2VDb250cm9sbGVyKHZpZXdDYW52YXMsIGZvdXJjb3VydHNJbWFnZSk7XG5cblx0Y29uc3QgcGx1cyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBsdXNcIik7XG5cdGNvbnN0IG1pbnVzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWludXNcIik7XG5cblx0bGV0IHBhbkNvbnRyb2wgPSBuZXcgUGFuQ29udHJvbGxlcih2aWV3Q2FudmFzLCBjYW52YXMpO1xuXHRsZXQgY2FudmFzQ29udHJvbCA9IG5ldyBab29tQ29udHJvbGxlcih2aWV3Q2FudmFzLCBwbHVzLCBtaW51cyk7XG5cblx0Y2FudmFzQ29udHJvbC5hZGRab29tTGlzdGVuZXIocGFuQ29udHJvbCk7XG5cblx0dmlld0NhbnZhcy5kcmF3KCk7XG59XG5cbmZ1bmN0aW9uIHNob3coKXtcblx0c2hvd01hcChcImNhbnZhc1wiLCBcIlR5cGVTY3JpcHRcIik7XG59XG5cbmlmIChcbiAgICBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgfHxcbiAgICAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gXCJsb2FkaW5nXCIgJiYgIWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5kb1Njcm9sbClcbikge1xuXHRzaG93KCk7XG59IGVsc2Uge1xuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBzaG93KTtcbn1cblxuIiwiaW1wb3J0IHsgU3RhdGljSW1hZ2UgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvY2FudmFzdGlsZVwiO1xuaW1wb3J0IHsgVmlld0NhbnZhcyB9IGZyb20gXCIuLi9ncmFwaGljcy92aWV3Y2FudmFzXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgY2xhc3MgSW1hZ2VDb250cm9sbGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIHJlYWRvbmx5IHN0YXRpY0ltYWdlOiBTdGF0aWNJbWFnZSkge1xuICAgIFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5wcmVzc2VkKHZpZXdDYW52YXMsIGUgIGFzIEtleWJvYXJkRXZlbnQpKTtcbiAgICB9XG5cbiAgICBwcmVzc2VkKHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgXHRjb25zb2xlLmxvZyhcInByZXNzZWRcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LmtleSk7XG5cbiAgICBcdHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgXHRcdGNhc2UgXCJhXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS54SW5kZXggPSB0aGlzLnN0YXRpY0ltYWdlLnhJbmRleCAtIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiZFwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2UueEluZGV4ID0gdGhpcy5zdGF0aWNJbWFnZS54SW5kZXggKyAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIndcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnlJbmRleCA9IHRoaXMuc3RhdGljSW1hZ2UueUluZGV4IC0gMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJzXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS55SW5kZXggPSB0aGlzLnN0YXRpY0ltYWdlLnlJbmRleCArIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiZVwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uucm90YXRpb24gPSB0aGlzLnN0YXRpY0ltYWdlLnJvdGF0aW9uIC0gMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJxXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5yb3RhdGlvbiA9IHRoaXMuc3RhdGljSW1hZ2Uucm90YXRpb24gKyAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInhcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdYID0gdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWCAtIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiWFwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1ggPSB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdYICsgMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJ6XCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWSA9IHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1kgLSAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIlpcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdZID0gdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWSArIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRkZWZhdWx0OlxuICAgIFx0XHRcdC8vIGNvZGUuLi5cbiAgICBcdFx0XHRicmVhaztcbiAgICBcdH1cbiAgICBcdGNvbnNvbGUubG9nKFwiaW1hZ2UgYXQ6IFwiICsgIHRoaXMuc3RhdGljSW1hZ2UueEluZGV4ICsgXCIsIFwiICsgdGhpcy5zdGF0aWNJbWFnZS55SW5kZXgpO1xuICAgIFx0Y29uc29sZS5sb2coXCJpbWFnZSBybyBzYzogXCIgKyAgdGhpcy5zdGF0aWNJbWFnZS5yb3RhdGlvbiArIFwiLCBcIiArIHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1ggKyBcIiwgXCIgKyB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdZKTtcbiAgICB9O1xuXG59OyIsImltcG9ydCB7IFZpZXdDYW52YXMgfSBmcm9tIFwiLi4vZ3JhcGhpY3Mvdmlld2NhbnZhc1wiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuYWJzdHJhY3QgY2xhc3MgTW91c2VDb250cm9sbGVyIHtcblxuICAgIG1vdXNlUG9zaXRpb24oZXZlbnQ6IE1vdXNlRXZlbnQsIHdpdGhpbjogSFRNTEVsZW1lbnQpOiBQb2ludDJEIHtcbiAgICAgICAgbGV0IG1fcG9zeCA9IGV2ZW50LmNsaWVudFggKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnRcbiAgICAgICAgICAgICAgICAgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdDtcbiAgICAgICAgbGV0IG1fcG9zeSA9IGV2ZW50LmNsaWVudFkgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7XG5cbiAgICAgICAgdmFyIGVfcG9zeCA9IDA7XG4gICAgICAgIHZhciBlX3Bvc3kgPSAwO1xuICAgICAgICBpZiAod2l0aGluLm9mZnNldFBhcmVudCl7XG4gICAgICAgICAgICBkbyB7IFxuICAgICAgICAgICAgICAgIGVfcG9zeCArPSB3aXRoaW4ub2Zmc2V0TGVmdDtcbiAgICAgICAgICAgICAgICBlX3Bvc3kgKz0gd2l0aGluLm9mZnNldFRvcDtcbiAgICAgICAgICAgIH0gd2hpbGUgKHdpdGhpbiA9IDxIVE1MRWxlbWVudD53aXRoaW4ub2Zmc2V0UGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQyRChtX3Bvc3ggLSBlX3Bvc3gsIG1fcG9zeSAtIGVfcG9zeSk7XG4gICAgfVxuICAgIFxufVxuXG5hYnN0cmFjdCBjbGFzcyBab29tTGlzdGVuZXIge1xuICAgIGFic3RyYWN0IHpvb20oYnk6IG51bWJlcik7XG59XG5cbmV4cG9ydCBjbGFzcyBab29tQ29udHJvbGxlciBleHRlbmRzIE1vdXNlQ29udHJvbGxlciB7XG5cblx0cHJpdmF0ZSBsaXN0ZW5lcnM6IEFycmF5PFpvb21MaXN0ZW5lcj4gPSBbXTtcblx0cHJpdmF0ZSB6b29tID0gMTtcblxuICAgIGNvbnN0cnVjdG9yKHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIHJlYWRvbmx5IHpvb21JbjogSFRNTEVsZW1lbnQsIHJlYWRvbmx5IHpvb21PdXQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICBcdHpvb21Jbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGU6RXZlbnQpID0+IHRoaXMuY2xpY2tlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdDYW52YXMsIC45NSkpO1xuICAgIFx0em9vbU91dC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGU6RXZlbnQpID0+IHRoaXMuY2xpY2tlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdDYW52YXMsIDEuMDUpKTtcbiAgICBcdHZpZXdDYW52YXMuY3R4LmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmNsaWNrZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzLCAuNzUpKTtcbiAgICB9XG5cbiAgICBhZGRab29tTGlzdGVuZXIoem9vbUxpc3RlbmVyOiBab29tTGlzdGVuZXIpe1xuICAgIFx0dGhpcy5saXN0ZW5lcnMucHVzaCh6b29tTGlzdGVuZXIpO1xuICAgIH1cblxuICAgIGNsaWNrZWQoZXZlbnQ6IE1vdXNlRXZlbnQsIHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIGJ5OiBudW1iZXIpIHtcblxuICAgIFx0Y29uc29sZS5sb2coXCJjbGlja2VkXCIgKyBldmVudC50YXJnZXQgKyBcIiwgXCIgKyBldmVudC50eXBlKTtcblxuICAgIFx0Y29uc29sZS5sb2coXCJsaXN0ZW5lcnMgXCIgKyB0aGlzLmxpc3RlbmVycy5sZW5ndGgpO1xuXG4gICAgICAgIHN3aXRjaChldmVudC50eXBlKXtcbiAgICAgICAgICAgIGNhc2UgXCJkYmxjbGlja1wiOlxuICAgICAgICAgICAgICAgIGxldCBjYW52YXMgPSB2aWV3Q2FudmFzLmN0eC5jYW52YXM7XG5cbiAgICAgICAgICAgICAgICBpZiAgKGV2ZW50LmN0cmxLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgYnkgPSAxIC8gYnk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxldCBtWFkgPSB0aGlzLm1vdXNlUG9zaXRpb24oZXZlbnQsIHZpZXdDYW52YXMuY3R4LmNhbnZhcyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmlld0NhbnZhcy56b29tQWJvdXQobVhZLnggLyBjYW52YXMuY2xpZW50V2lkdGgsIG1YWS55IC8gY2FudmFzLmNsaWVudEhlaWdodCwgYnkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB2aWV3Q2FudmFzLnpvb21WaWV3KGJ5KTtcbiAgICAgICAgfVxuXG4gICAgXHR0aGlzLnpvb20gPSB0aGlzLnpvb20gKiBieTtcbiAgICBcdGZvciAobGV0IHZhbHVlIG9mIHRoaXMubGlzdGVuZXJzKXtcbiAgICBcdFx0dmFsdWUuem9vbSh0aGlzLnpvb20pO1xuICAgIFx0fVxuXG4gICAgXHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICB9O1xuXG59O1xuXG5leHBvcnQgY2xhc3MgUGFuQ29udHJvbGxlciBleHRlbmRzIFpvb21MaXN0ZW5lciB7XG5cblx0cHJpdmF0ZSB4UHJldmlvdXM6IG51bWJlcjtcblx0cHJpdmF0ZSB5UHJldmlvdXM6IG51bWJlcjtcblx0cHJpdmF0ZSByZWNvcmQ6IGJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBiYXNlTW92ZTogbnVtYmVyID0gMjU2O1xuXHRwcml2YXRlIG1vdmU6IG51bWJlciA9IDI1NjtcblxuICAgIGNvbnN0cnVjdG9yKHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIHJlYWRvbmx5IGRyYWdFbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgIFx0c3VwZXIoKTtcbiAgICBcdGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzKSk7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcykpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzKSk7XG4gICAgICAgIGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMucmVjb3JkID0gZmFsc2UpO1xuICAgIH1cblxuICAgIHpvb20oYnk6IG51bWJlcil7XG4gICAgXHRjb25zb2xlLmxvZyhcInpvb20gYnkgXCIgKyBieSk7XG4gICAgXHR0aGlzLm1vdmUgPSB0aGlzLmJhc2VNb3ZlIC8gYnk7XG4gICAgfVxuXG4gICAgZHJhZ2dlZChldmVudDogTW91c2VFdmVudCwgdmlld0NhbnZhczogVmlld0NhbnZhcykge1xuXG4gICAgICAgIGxldCBjYW52YXMgPSB2aWV3Q2FudmFzLmN0eC5jYW52YXM7XG5cbiAgICBcdHN3aXRjaChldmVudC50eXBlKXtcbiAgICBcdFx0Y2FzZSBcIm1vdXNlZG93blwiOlxuICAgIFx0XHRcdHRoaXMucmVjb3JkID0gdHJ1ZTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIm1vdXNldXBcIjpcbiAgICBcdFx0XHR0aGlzLnJlY29yZCA9IGZhbHNlO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRkZWZhdWx0OlxuICAgIFx0XHRcdGlmICh0aGlzLnJlY29yZCl7XG4gICAgICAgICAgICAgICAgICAgIGxldCB4RGVsdGEgPSAoZXZlbnQuY2xpZW50WCAtIHRoaXMueFByZXZpb3VzKSAvIHRoaXMubW92ZTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHlEZWx0YSA9IChldmVudC5jbGllbnRZIC0gdGhpcy55UHJldmlvdXMpIC8gdGhpcy5tb3ZlO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdUb3BMZWZ0ID0gbmV3IFBvaW50MkQodmlld0NhbnZhcy50b3BMZWZ0LnggLSB4RGVsdGEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgdmlld0NhbnZhcy50b3BMZWZ0LnkgLSB5RGVsdGEpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZpZXdDYW52YXMubW92ZVZpZXcobmV3VG9wTGVmdCk7XG4gICAgICAgICAgICAgICAgICAgIHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdH1cbiAgICBcdH1cblxuXHRcdHRoaXMueFByZXZpb3VzID0gZXZlbnQuY2xpZW50WDtcblx0XHR0aGlzLnlQcmV2aW91cyA9IGV2ZW50LmNsaWVudFk7XG5cbiAgICB9O1xuXG4gICAgbW91c2VQb3NpdGlvbihldmVudDogTW91c2VFdmVudCwgd2l0aGluOiBIVE1MRWxlbWVudCk6IFBvaW50MkQge1xuICAgICAgICBsZXQgbV9wb3N4ID0gZXZlbnQuY2xpZW50WCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0O1xuICAgICAgICBsZXQgbV9wb3N5ID0gZXZlbnQuY2xpZW50WSArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wXG4gICAgICAgICAgICAgICAgICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcblxuICAgICAgICB2YXIgZV9wb3N4ID0gMDtcbiAgICAgICAgdmFyIGVfcG9zeSA9IDA7XG4gICAgICAgIGlmICh3aXRoaW4ub2Zmc2V0UGFyZW50KXtcbiAgICAgICAgICAgIGRvIHsgXG4gICAgICAgICAgICAgICAgZV9wb3N4ICs9IHdpdGhpbi5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgICAgIGVfcG9zeSArPSB3aXRoaW4ub2Zmc2V0VG9wO1xuICAgICAgICAgICAgfSB3aGlsZSAod2l0aGluID0gPEhUTUxFbGVtZW50PndpdGhpbi5vZmZzZXRQYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQb2ludDJEKG1fcG9zeCAtIGVfcG9zeCwgbV9wb3N5IC0gZV9wb3N5KTtcbiAgICB9XG4gICAgXG59O1xuXG4iXX0=
