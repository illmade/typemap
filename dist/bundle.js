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
var stephensImage = new canvastile_1.StaticImage(1.725, 4.945, .205, .215, 0.205, "images/maps_145_b_4_(2)_f020R[SVC2].jpg", 0.7);
var stmarysImage = new canvastile_1.StaticImage(-1.055, 1.02, .43, .415, -0.21, "images/maps_145_b_4_(2)_f005r[SVC2].jpg", 0.7);
var steamImage = new canvastile_1.StaticImage(8.145, 0.265, .815, .92, 0.12, "images/maps_145_b_4_(2)_f012r_1[SVC2].jpg", 0.7);
var fifteenImage = new canvastile_1.StaticImage(-4, 2.7, 0.4, .4, -1.4, "images/maps_145_b_4_(2)_f015r_2[SVC2].png", 0.7);
var henriettaImage = new canvastile_1.StaticImage(-2.355, -2.43, 0.61, 0.61, 0.05, "images/henrietta.png", 0.7);
var fourcourtsImage = new canvastile_1.StaticImage(-3.28, 1.77, 0.55, 0.55, -0.03, "images/fourcourts.png", 1);
var michansImage = new canvastile_1.StaticImage(-3.88, 0.7, 0.32, 0.32, -0.03, "images/michans.png", 1);
var bluecoatsImage = new canvastile_1.StaticImage(-6.619, -0.165, 0.4, 0.4, -0.05, "images/bluecoats.png", 0.7);
var hughlaneImage = new canvastile_1.StaticImage(0.11, -3.27, 0.4, 0.4, -0.225, "images/hughlane.png", 0.7);
var mountjoyImage = new canvastile_1.StaticImage(3.335, -5.135, 0.4, 0.4, 0.17, "images/mountjoy.png", 0.7);
var customsImage = new canvastile_1.StaticImage(4.39, 0.32, 0.43, 0.43, -0.05, "images/customshouse.png", 0.7);
var libertyImage = new canvastile_1.StaticImage(3.43, 0.009, 0.43, 0.43, -0.05, "images/liberty.png", 0.7);
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
var rutlandImage = new canvastile_1.StaticImage(2.32, -0.77, 2.015, 2.015, 0, "images/rutland.png", 0.7);
var materImage = new canvastile_1.StaticImage(2.16, -5.42, 2.015, 2.015, 0, "images/mater.png", 0.7);
var townsendImage = new canvastile_1.StaticImage(4.575, 3.995, 2.035, 2.035, 0, "images/townsend.png", 0.7);
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
    viewCanvas.addStaticElement(rutlandImage);
    viewCanvas.addStaticElement(materImage);
    viewCanvas.addStaticElement(townsendImage);
    //viewCanvas.addStaticElement(cutpatrickImage);
    viewCanvas.addStaticElement(cutpatrickOverlayImage);
    viewCanvas.addStaticElement(maryImage);
    viewCanvas.addStaticElement(stephensImage);
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
    viewCanvas.addStaticElement(bluecoatsImage);
    viewCanvas.addStaticElement(hughlaneImage);
    viewCanvas.addStaticElement(mountjoyImage);
    viewCanvas.addStaticElement(customsImage);
    viewCanvas.addStaticElement(libertyImage);
    viewCanvas.addStaticElement(michansImage);
    var imageController = new imageController_1.ImageController(viewCanvas, michansImage);
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
        viewCanvas.ctx.canvas.addEventListener("wheel", function (e) {
            return _this.wheel(e, viewCanvas);
        });
        return _this;
    }
    PanController.prototype.zoom = function (by) {
        console.log("zoom by " + by);
        this.move = this.baseMove / by;
    };
    PanController.prototype.wheel = function (event, viewCanvas) {
        console.log("wheel" + event.target + ", " + event.type);
        var xDelta = event.deltaX / this.move;
        var yDelta = event.deltaY / this.move;
        var newTopLeft = new point2d_1.Point2D(viewCanvas.topLeft.x - xDelta, viewCanvas.topLeft.y - yDelta);
        console.log("topleft " + newTopLeft);
        viewCanvas.moveView(newTopLeft);
        viewCanvas.draw();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2dlb20vdGlsZS50cyIsInNyYy9nZW9tL3ZpZXdwb3J0LnRzIiwic3JjL2dlb20vd29ybGQyZC50cyIsInNyYy9ncmFwaGljcy9jYW52YXN0aWxlLnRzIiwic3JjL2dyYXBoaWNzL2dyaWQudHMiLCJzcmMvZ3JhcGhpY3Mvdmlld2NhbnZhcy50cyIsInNyYy9zaW1wbGVXb3JsZC50cyIsInNyYy91aS9pbWFnZUNvbnRyb2xsZXIudHMiLCJzcmMvdWkvbWFwQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQ0E7SUFPSSxpQkFBWSxDQUFTLEVBQUUsQ0FBUztRQUM1QixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFRSwwQkFBUSxHQUFSO1FBQ0ksT0FBTyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDckQsQ0FBQztJQWJlLFlBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDekIsV0FBRyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQWM1QyxjQUFDO0NBaEJELEFBZ0JDLElBQUE7QUFoQlksMEJBQU87Ozs7O0FDRXBCO0lBRUMsbUJBQW1CLGFBQXFCLEVBQVMsY0FBc0I7UUFBcEQsa0JBQWEsR0FBYixhQUFhLENBQVE7UUFBUyxtQkFBYyxHQUFkLGNBQWMsQ0FBUTtJQUFFLENBQUM7SUFJMUUsNEJBQVEsR0FBUixVQUFTLFFBQWlCLEVBQUUsU0FBaUIsRUFBRSxTQUFpQjtRQUUvRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFD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QztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQO2dCQUNDLFVBQVU7Z0JBQ1YsTUFBTTtTQUNQO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEdBQUksSUFBSSxDQUFD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LE1BQU0sQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFTCxvQkFBQztBQUFELENBNUZBLEFBNEZDLENBNUZrQyxZQUFZLEdBNEY5QztBQTVGWSxzQ0FBYTtBQTRGekIsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlxuZXhwb3J0IGNsYXNzIFBvaW50MkQge1xuICAgIHN0YXRpYyByZWFkb25seSB6ZXJvID0gbmV3IFBvaW50MkQoMCwgMCk7XG4gICAgc3RhdGljIHJlYWRvbmx5IG9uZSA9IG5ldyBQb2ludDJEKDEsIDEpO1xuXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xuICAgIHJlYWRvbmx5IHk6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG5cdH1cblxuICAgIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcIlBvaW50MkQoXCIgKyB0aGlzLnggKyBcIiwgXCIgKyB0aGlzLnkgKyBcIilcIjtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBVbml0cyB9IGZyb20gXCIuL3dvcmxkMmRcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi9wb2ludDJkXCI7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBUaWxlTGF5ZXIge1xuXHRcblx0Y29uc3RydWN0b3IocHVibGljIHdpZHRoTWFwVW5pdHM6IG51bWJlciwgcHVibGljIGhlaWdodE1hcFVuaXRzOiBudW1iZXIpe31cblxuXHRhYnN0cmFjdCBnZXRUaWxlKHhJbmRleDogbnVtYmVyLCB5SW5kZXg6IG51bWJlcik6IFRpbGU7XG5cblx0Z2V0VGlsZXMocG9zaXRpb246IFBvaW50MkQsIHhNYXBVbml0czogbnVtYmVyLCB5TWFwVW5pdHM6IG51bWJlcik6IEFycmF5PFRpbGU+IHtcblxuXHRcdGxldCBmaXJzdFggPSBNYXRoLmZsb29yKHBvc2l0aW9uLnggLyB0aGlzLndpZHRoTWFwVW5pdHMpO1xuXHRcdGxldCBsYXN0WCA9IE1hdGguY2VpbCgocG9zaXRpb24ueCArIHhNYXBVbml0cykvIHRoaXMud2lkdGhNYXBVbml0cyk7XG5cblx0XHRsZXQgZmlyc3RZID0gTWF0aC5mbG9vcihwb3NpdGlvbi55IC8gdGhpcy5oZWlnaHRNYXBVbml0cyk7XG5cdFx0bGV0IGxhc3RZID0gTWF0aC5jZWlsKChwb3NpdGlvbi55ICsgeU1hcFVuaXRzKS8gdGhpcy5oZWlnaHRNYXBVbml0cyk7XG5cblx0XHRsZXQgdGlsZXMgPSBuZXcgQXJyYXk8VGlsZT4oKTtcblxuXHRcdGZvciAodmFyIHg9Zmlyc3RYOyB4PGxhc3RYOyB4Kyspe1xuXHRcdFx0Zm9yICh2YXIgeT1maXJzdFk7IHk8bGFzdFk7IHkrKyl7XG5cdFx0XHRcdHRpbGVzLnB1c2godGhpcy5nZXRUaWxlKHgsIHkpKVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aWxlcztcblx0fVxuXG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlIHtcblx0XG5cdHN0YXRpYyBlbXB0eVRpbGU6IFRpbGUgPSBuZXcgVGlsZSgtMSwtMSk7XG5cblx0Y29uc3RydWN0b3IoeEluZGV4OiBudW1iZXIsIHlJbmRleDogbnVtYmVyKXt9XG5cbn0iLCJpbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4vcG9pbnQyZFwiO1xuaW1wb3J0IHsgVmVjdG9yMkQgfSBmcm9tIFwiLi92ZWN0b3IyZFwiO1xuaW1wb3J0IHsgV29ybGQyRCwgVW5pdHMgfSBmcm9tIFwiLi93b3JsZDJkXCI7XG5cbmV4cG9ydCBjbGFzcyBWaWV3cG9ydCB7XG5cdFxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgdG9wTGVmdDogUG9pbnQyRCwgXG5cdFx0cHJpdmF0ZSB3aWR0aE1hcFVuaXRzOiBudW1iZXIsIHByaXZhdGUgaGVpZ2h0TWFwVW5pdHM6IG51bWJlcil7XG5cblx0XHRjb25zb2xlLmxvZyhcIncgaFwiICsgd2lkdGhNYXBVbml0cyArIFwiLCBcIiArIGhlaWdodE1hcFVuaXRzKTtcblx0fVxuXG5cdG1vdmVWaWV3KHRvcExlZnQ6IFBvaW50MkQpe1xuXHRcdHRoaXMudG9wTGVmdCA9IHRvcExlZnQ7XG5cdH1cblxuXHR6b29tVmlldyh6b29tOiBudW1iZXIpe1xuXHRcdGxldCBuZXdXaWR0aCA9IHRoaXMud2lkdGhNYXBVbml0cyAqIHpvb207XG5cdFx0bGV0IG5ld0hlaWdodCA9IHRoaXMuaGVpZ2h0TWFwVW5pdHMgKiB6b29tO1xuXG5cdFx0bGV0IG1vdmVYID0gKHRoaXMud2lkdGhNYXBVbml0cyAtIG5ld1dpZHRoKSAvIDI7XG5cdFx0bGV0IG1vdmVZID0gKHRoaXMuaGVpZ2h0TWFwVW5pdHMgLSBuZXdIZWlnaHQpIC8gMjtcblxuXHRcdHRoaXMudG9wTGVmdCA9IG5ldyBQb2ludDJEKHRoaXMudG9wTGVmdC54ICsgbW92ZVgsIHRoaXMudG9wTGVmdC55ICsgbW92ZVkpO1xuXG5cdFx0dGhpcy53aWR0aE1hcFVuaXRzID0gbmV3V2lkdGg7XG5cdFx0dGhpcy5oZWlnaHRNYXBVbml0cyA9IG5ld0hlaWdodDtcblx0fVxuXG5cdHpvb21BYm91dCh4UmVsYXRpdmU6IG51bWJlciwgeVJlbGF0aXZlOiBudW1iZXIsIHpvb206IG51bWJlcil7XG5cblx0XHRsZXQgeERpZmYgPSAwLjUgLSB4UmVsYXRpdmU7XG5cdFx0bGV0IHlEaWZmID0gMC41IC0geVJlbGF0aXZlO1xuXG5cdFx0dmFyIHhNb3ZlID0geERpZmYgKiB0aGlzLndpZHRoTWFwVW5pdHM7XG5cdFx0dmFyIHlNb3ZlID0geURpZmYgKiB0aGlzLmhlaWdodE1hcFVuaXRzO1xuXG5cdFx0dGhpcy50b3BMZWZ0ID0gbmV3IFBvaW50MkQodGhpcy50b3BMZWZ0LnggLSB4TW92ZSwgdGhpcy50b3BMZWZ0LnkgLSB5TW92ZSk7XG5cblx0XHR0aGlzLnpvb21WaWV3KHpvb20pO1xuXG5cdFx0eE1vdmUgPSB4RGlmZiAqIHRoaXMud2lkdGhNYXBVbml0cztcblx0XHR5TW92ZSA9IHlEaWZmICogdGhpcy5oZWlnaHRNYXBVbml0cztcblxuXHRcdHRoaXMudG9wTGVmdCA9IG5ldyBQb2ludDJEKHRoaXMudG9wTGVmdC54ICsgeE1vdmUsIHRoaXMudG9wTGVmdC55ICsgeU1vdmUpO1xuXG5cdH1cblxuXHRnZXREaW1lbnNpb25zKCl7XG5cdFx0cmV0dXJuIG5ldyBQb2ludDJEKHRoaXMud2lkdGhNYXBVbml0cywgdGhpcy5oZWlnaHRNYXBVbml0cyk7XG5cdH1cblxufSIsImltcG9ydCB7IFRpbGVMYXllciB9IGZyb20gXCIuL3RpbGVcIjtcblxuZXhwb3J0IGNsYXNzIFVuaXRzIHtcblxuXHRzdGF0aWMgcmVhZG9ubHkgV2ViV1UgPSBuZXcgVW5pdHMoXCJNZXJjYXRvciBXZWIgV29ybGQgVW5pdHNcIik7XG5cblx0Y29uc3RydWN0b3IobmFtZTogc3RyaW5nKXt9XG5cbn1cbi8qKlxuICBBIHdvcmxkIGlzIHRoZSBiYXNlIHRoYXQgYWxsIG90aGVyIGVsZW1lbnRzIG9yaWVudGF0ZSBmcm9tIFxuKiovXG5leHBvcnQgY2xhc3MgV29ybGQyRCB7XG5cblx0cHJpdmF0ZSB0aWxlTGF5ZXJzOiBBcnJheTxUaWxlTGF5ZXI+ID0gW107XG5cdFxuXHRjb25zdHJ1Y3Rvcigpe31cblxuICAgIGFkZFRpbGVMYXllcih0aWxlTGF5ZXI6IFRpbGVMYXllcik6IG51bWJlciB7XG4gICAgXHRyZXR1cm4gdGhpcy50aWxlTGF5ZXJzLnB1c2godGlsZUxheWVyKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBUaWxlLCBUaWxlTGF5ZXIgfSBmcm9tIFwiLi4vZ2VvbS90aWxlXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2FudmFzVGlsZSBleHRlbmRzIFRpbGUge1xuXG5cdGFic3RyYWN0IGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHNjYWxpbmdYOiBudW1iZXIsIHNjYWxpbmdZOiBudW1iZXIsIFxuXHRcdGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKTogdm9pZDtcblxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VTdHJ1Y3Qge1xuXG5cdHByZWZpeDogc3RyaW5nID0gXCJcIjtcblx0c3VmZml4OiBzdHJpbmcgPSBcIlwiO1xuXHR0aWxlRGlyOiBzdHJpbmcgPSBcImltYWdlcy9cIjtcblx0dmlzaWJsZTogYm9vbGVhbiA9IHRydWU7XG5cdG9wYWNpdHk6IG51bWJlciA9IDAuNztcblx0dGlsZVdpZHRoUHg6IG51bWJlciA9IDI1Njtcblx0dGlsZUhlaWdodFB4OiBudW1iZXIgPSAyNTY7XG5cdHdpZHRoTWFwVW5pdHM6IG51bWJlciA9IDE7XG5cdGhlaWdodE1hcFVuaXRzOiBudW1iZXIgPSAxOyBcblxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VUaWxlIGV4dGVuZHMgQ2FudmFzVGlsZSB7XG5cblx0cHJpdmF0ZSBpbWc6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cblx0Y29uc3RydWN0b3IocmVhZG9ubHkgeEluZGV4OiBudW1iZXIsIHJlYWRvbmx5IHlJbmRleDogbnVtYmVyLCBpbWFnZVNyYzogc3RyaW5nKSB7XG5cdFx0c3VwZXIoeEluZGV4LCB5SW5kZXgpO1xuXHRcdHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG5cdFx0dGhpcy5pbWcuc3JjID0gaW1hZ2VTcmM7XG5cdH07XG5cblx0cHJpdmF0ZSBkcmF3SW1hZ2UoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKXtcblx0XHRjdHguZHJhd0ltYWdlKHRoaXMuaW1nLCBjYW52YXNYLCBjYW52YXNZKTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKXtcblx0XHRpZiAodGhpcy5pbWcuY29tcGxldGUpIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5pbWcub25sb2FkID0gKGV2ZW50KSA9PiB7XG5cdFx0XHRcdHRoaXMuaW1nLmNyb3NzT3JpZ2luID0gXCJBbm9ueW1vdXNcIjtcblx0XHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCBjYW52YXNYLCBjYW52YXNZKTtcblx0XHRcdH07XG5cdFx0fVxuXHR9O1xuXG59XG5cbmV4cG9ydCBjbGFzcyBTdGF0aWNJbWFnZSB7XG5cblx0cHJpdmF0ZSBpbWc6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cblx0Y29uc3RydWN0b3IocHVibGljIHhJbmRleDogbnVtYmVyLCBwdWJsaWMgeUluZGV4OiBudW1iZXIsIFxuXHRcdHB1YmxpYyBzY2FsaW5nWDogbnVtYmVyLCBwdWJsaWMgc2NhbGluZ1k6IG51bWJlciwgcHVibGljIHJvdGF0aW9uOiBudW1iZXIsIFxuXHRcdGltYWdlU3JjOiBzdHJpbmcsIHJlYWRvbmx5IGFscGhhOiBudW1iZXIpIHtcblx0XHRcblx0XHR0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuXHRcdHRoaXMuaW1nLnNyYyA9IGltYWdlU3JjO1xuXHR9O1xuXG5cdHByaXZhdGUgZHJhd0ltYWdlKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBjYW52YXNYOiBudW1iZXIsIGNhbnZhc1k6IG51bWJlcil7XG5cblx0XHQvL3NjYWxpbmdYID0gc2NhbGluZ1ggKiB0aGlzLnNjYWxpbmc7XG5cdFx0Ly9zY2FsaW5nWSA9IHNjYWxpbmdZICogdGhpcy5zY2FsaW5nO1xuXG5cdFx0Ly8gbGV0IGNvc1ggPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uKTtcblx0XHQvLyBsZXQgc2luWCA9IE1hdGguc2luKHRoaXMucm90YXRpb24pO1xuXG5cdFx0Y3R4LnRyYW5zbGF0ZShjYW52YXNYLCBjYW52YXNZKTtcblx0XHRjdHgucm90YXRlKHRoaXMucm90YXRpb24pO1xuXHRcdGN0eC5zY2FsZSh0aGlzLnNjYWxpbmdYLCB0aGlzLnNjYWxpbmdZKTtcblx0XHQvL2NvbnNvbGUubG9nKFwieHlTY2FsaW5nIFwiICsgdGhpcy5zY2FsaW5nWCArIFwiLCBcIiArIHRoaXMuc2NhbGluZ1kpO1xuXHRcdGN0eC5nbG9iYWxBbHBoYSA9IHRoaXMuYWxwaGE7XG5cblx0XHQvLyBjdHgudHJhbnNmb3JtKGNvc1ggKiBzY2FsaW5nWCwgc2luWCAqIHNjYWxpbmdZLCAtc2luWCAqIHNjYWxpbmdYLCBjb3NYICogc2NhbGluZ1ksIFxuXHRcdC8vIFx0Y2FudmFzWCAvIHRoaXMuc2NhbGluZywgY2FudmFzWSAvIHRoaXMuc2NhbGluZyk7XG5cblx0XHRjdHguZHJhd0ltYWdlKHRoaXMuaW1nLCAtKHRoaXMuaW1nLndpZHRoLzIpLCAtKHRoaXMuaW1nLmhlaWdodC8yKSk7XG5cdFx0XG5cdFx0Y3R4LnNjYWxlKDEvdGhpcy5zY2FsaW5nWCwgMS90aGlzLnNjYWxpbmdZKTtcblx0XHRjdHgucm90YXRlKC10aGlzLnJvdGF0aW9uKTtcblx0XHRjdHgudHJhbnNsYXRlKC1jYW52YXNYLCAtY2FudmFzWSk7XG5cdFx0Y3R4Lmdsb2JhbEFscGhhID0gMTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKXtcblx0XHRpZiAodGhpcy5pbWcuY29tcGxldGUpIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5pbWcub25sb2FkID0gKGV2ZW50KSA9PiB7XG5cdFx0XHRcdHRoaXMuaW1nLmNyb3NzT3JpZ2luID0gXCJBbm9ueW1vdXNcIjtcblx0XHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCBjYW52YXNYLCBjYW52YXNZKTtcblx0XHRcdH07XG5cdFx0fVxuXHR9O1xuXG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZVRpbGVMYXllciBleHRlbmRzIFRpbGVMYXllciB7XG5cblx0cmVhZG9ubHkgaW1hZ2VQcm9wZXJ0aWVzOiBJbWFnZVN0cnVjdDtcblxuXHRjb25zdHJ1Y3RvcihpbWFnZVByb3BlcnRpZXM6IEltYWdlU3RydWN0KSB7XG5cdFx0c3VwZXIoaW1hZ2VQcm9wZXJ0aWVzLndpZHRoTWFwVW5pdHMsIGltYWdlUHJvcGVydGllcy5oZWlnaHRNYXBVbml0cyk7XG5cdFx0dGhpcy5pbWFnZVByb3BlcnRpZXMgPSBpbWFnZVByb3BlcnRpZXM7XG5cdH1cblxuXHQvKipcblx0ICBsZWF2ZSBjYWNoaW5nIHVwIHRvIHRoZSBicm93c2VyXG5cdCoqL1xuXHRnZXRUaWxlKHhVbml0czogbnVtYmVyLCB5VW5pdHM6IG51bWJlcik6IFRpbGUge1xuXHRcdGxldCBpbWFnZVNyYyA9IHRoaXMuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVEaXIgKyBcblx0XHRcdHRoaXMuaW1hZ2VQcm9wZXJ0aWVzLnByZWZpeCArIHhVbml0cyArIFwiX1wiICsgeVVuaXRzICsgdGhpcy5pbWFnZVByb3BlcnRpZXMuc3VmZml4O1xuXHRcdHJldHVybiBuZXcgSW1hZ2VUaWxlKHhVbml0cywgeVVuaXRzLCBpbWFnZVNyYyk7XG5cdH1cblxufVxuIiwiaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuZXhwb3J0IGNsYXNzIEdyaWRMYXllciB7XG5cblx0cHJpdmF0ZSBncmlkU3BhY2luZzogbnVtYmVyO1xuXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgZ3JpZFNwYWNpbmc6IG51bWJlcikge1xuXHRcdHRoaXMuZ3JpZFNwYWNpbmcgPSBncmlkU3BhY2luZztcblx0fVxuXG5cdHNldEdyaWRTcGFjaW5nKGdyaWRTcGFjaW5nOiBudW1iZXIpe1xuXHRcdHRoaXMuZ3JpZFNwYWNpbmcgPSBncmlkU3BhY2luZztcblx0fVxuXHQvKipcblx0ICBsZWF2ZSBjYWNoaW5nIHVwIHRvIHRoZSBicm93c2VyXG5cdCoqL1xuXHRkcmF3KHRvcExlZnQ6IFBvaW50MkQsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogdm9pZCB7XG5cdFx0bGV0IG1pblggPSBNYXRoLmZsb29yKHRvcExlZnQueCk7XG5cdFx0bGV0IG1pblkgPSBNYXRoLmZsb29yKHRvcExlZnQueSk7XG5cblx0XHR0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IDAuNTtcblx0XHR0aGlzLmN0eC50cmFuc2xhdGUoLTI1NiAqIHRvcExlZnQueCwgLTI1NiAqIHRvcExlZnQueSk7XG5cdFx0Ly9jb25zb2xlLmxvZyhcIm1pbnMgXCIgKyB3aWR0aCArIFwiLCBcIiArIGhlaWdodCk7XG5cblx0XHRsZXQgbGFzdFggPSBNYXRoLmNlaWwodG9wTGVmdC54ICsgd2lkdGgpO1xuXHRcdGxldCBsYXN0WSA9IE1hdGguY2VpbCh0b3BMZWZ0LnkgKyBoZWlnaHQpO1xuXG5cdFx0dGhpcy5jdHguc3Ryb2tlU3R5bGUgPSAnYmx1ZSc7XG5cdFx0dGhpcy5jdHguZm9udCA9ICc0OHB4IHNlcmlmJztcblxuXHRcdGxldCB5WmVybyA9IG1pblkgKiB0aGlzLmdyaWRTcGFjaW5nICogMjU2O1xuXHRcdGxldCB5TWF4ID0gbGFzdFkgKiB0aGlzLmdyaWRTcGFjaW5nICogMjU2O1xuXHRcdGxldCB4SnVtcCA9IHRoaXMuZ3JpZFNwYWNpbmcgKiAyNTY7XG5cblx0XHRsZXQgeFplcm8gPSBtaW5YICogdGhpcy5ncmlkU3BhY2luZyAqIDI1Njtcblx0XHRsZXQgeE1heCA9IGxhc3RYICogdGhpcy5ncmlkU3BhY2luZyAqIDI1Njtcblx0XHRsZXQgeUp1bXAgPSB0aGlzLmdyaWRTcGFjaW5nICogMjU2O1xuXG5cdFx0dGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgXHQvL3RoaXMuY3R4LmNsZWFyUmVjdCh4WmVybywgeVplcm8sIHhNYXgsIHlNYXgpO1xuXG5cdFx0Zm9yICh2YXIgeCA9IG1pblg7IHg8bGFzdFg7IHgrKyl7XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiYXQgXCIgKyBtaW5YKTtcblx0XHRcdGxldCB4TW92ZSA9IHggKiB4SnVtcDtcblx0XHRcdHRoaXMuY3R4Lm1vdmVUbyh4TW92ZSwgeVplcm8pO1xuXHRcdFx0dGhpcy5jdHgubGluZVRvKHhNb3ZlLCB5TWF4KTtcblx0XHR9XG5cblx0XHRmb3IgKHZhciB5ID0gbWluWTsgeTxsYXN0WTsgeSsrKXtcblx0XHRcdGxldCB5TW92ZSA9IHkgKiB5SnVtcDtcblx0XHRcdHRoaXMuY3R4Lm1vdmVUbyh4WmVybywgeU1vdmUpO1xuXHRcdFx0dGhpcy5jdHgubGluZVRvKHhNYXgsIHlNb3ZlKTtcblxuXHRcdFx0Zm9yICh2YXIgeCA9IG1pblg7IHg8bGFzdFg7IHgrKyl7XG5cdFx0XHRcdGxldCB4TW92ZSA9ICh4IC0gMC41KSAqIHhKdW1wO1xuXHRcdFx0XHR5TW92ZSA9ICh5IC0gMC41KSAqIHlKdW1wO1xuXHRcdFx0XHRsZXQgdGV4dCA9IFwiXCIgKyAoeC0xKSArIFwiLCBcIiArICh5LTEpO1xuXHRcdFx0XHR0aGlzLmN0eC5maWxsVGV4dCh0ZXh0LCB4TW92ZSwgeU1vdmUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLmN0eC5zdHJva2UoKTtcblx0XHR0aGlzLmN0eC50cmFuc2xhdGUoMjU2ICogdG9wTGVmdC54LCAyNTYgKiB0b3BMZWZ0LnkpO1xuXHRcdHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gMTtcblx0fVxuXG5cbn0iLCJpbXBvcnQgeyBWaWV3cG9ydCB9IGZyb20gXCIuLi9nZW9tL3ZpZXdwb3J0XCI7XG5pbXBvcnQgeyBXb3JsZDJEIH0gZnJvbSBcIi4uL2dlb20vd29ybGQyZFwiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcbmltcG9ydCB7IFN0YXRpY0ltYWdlLCBJbWFnZVRpbGUsIEltYWdlVGlsZUxheWVyIH0gZnJvbSBcIi4vY2FudmFzdGlsZVwiO1xuaW1wb3J0IHsgR3JpZExheWVyIH0gZnJvbSBcIi4vZ3JpZFwiO1xuXG5leHBvcnQgY2xhc3MgVmlld0NhbnZhcyBleHRlbmRzIFZpZXdwb3J0IHtcblxuICAgIHByaXZhdGUgc3RhdGljRWxlbWVudHM6IEFycmF5PFN0YXRpY0ltYWdlPiA9IFtdO1xuICAgIHByaXZhdGUgaW1hZ2VUaWxlTGF5ZXJzID0gW107XG5cbiAgICBwcml2YXRlIGdyaWRMYXllcjogR3JpZExheWVyO1xuXG4gICAgcHJpdmF0ZSBvZmZzY3JlZW46IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICBwcml2YXRlIHdpZHRoOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBoZWlnaHQ6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHRvcExlZnQ6IFBvaW50MkQsIFxuICAgIFx0d2lkdGhNYXBVbml0czogbnVtYmVyLCBoZWlnaHRNYXBVbml0czogbnVtYmVyLCBwcml2YXRlIGdyaWQ6IGJvb2xlYW4sXG4gICAgXHRwdWJsaWMgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpIHtcblxuICAgIFx0c3VwZXIodG9wTGVmdCwgd2lkdGhNYXBVbml0cywgaGVpZ2h0TWFwVW5pdHMpO1xuXG4gICAgICAgIHRoaXMud2lkdGggPSBjdHguY2FudmFzLmNsaWVudFdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGN0eC5jYW52YXMuY2xpZW50SGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuY3R4LmNhbnZhcy53aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgIHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcblxuICAgICAgICBjb25zb2xlLmxvZyhcIm9uc2NyZWVuIFwiICsgdGhpcy5jdHguY2FudmFzLndpZHRoICsgXCIsIFwiICsgdGhpcy5jdHguY2FudmFzLmhlaWdodCk7XG5cbiAgICAgICAgLy9jb25zdCBjID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICAgICAgY29uc3QgYyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm9mZnNjcmVlblwiKTtcbiAgICAgICAgYy53aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgIGMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5vZmZzY3JlZW4gPSA8Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEPmMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXG4gICAgICAgIGlmIChncmlkKVxuICAgIFx0ICAgIHRoaXMuZ3JpZExheWVyID0gbmV3IEdyaWRMYXllcih0aGlzLm9mZnNjcmVlbiwgMSk7XG4gICAgfVxuXG4gICAgYWRkVGlsZUxheWVyKGltYWdlVGlsZUxheWVyOiBJbWFnZVRpbGVMYXllcik6IHZvaWQge1xuICAgIFx0dGhpcy5pbWFnZVRpbGVMYXllcnMucHVzaChpbWFnZVRpbGVMYXllcik7XG4gICAgfVxuXG4gICAgYWRkU3RhdGljRWxlbWVudChzdGF0aWNJbWFnZTogU3RhdGljSW1hZ2UpOiB2b2lkIHtcbiAgICBcdHRoaXMuc3RhdGljRWxlbWVudHMucHVzaChzdGF0aWNJbWFnZSk7XG4gICAgfVxuXG4gICAgZ2V0Vmlld1NjYWxpbmcocGl4ZWxzUGVyVW5pdDogbnVtYmVyKTogUG9pbnQyRCB7XG4gICAgXHRsZXQgZGltZW5zaW9uID0gdGhpcy5nZXREaW1lbnNpb25zKCk7XG4gICAgXHRsZXQgdmlld1NjYWxpbmdYID0gdGhpcy5jdHguY2FudmFzLmNsaWVudFdpZHRoIC8gZGltZW5zaW9uLnggLyBwaXhlbHNQZXJVbml0O1xuICAgIFx0bGV0IHZpZXdTY2FsaW5nWSA9IHRoaXMuY3R4LmNhbnZhcy5jbGllbnRIZWlnaHQgLyBkaW1lbnNpb24ueSAvIHBpeGVsc1BlclVuaXQ7XG4gICAgXHRyZXR1cm4gbmV3IFBvaW50MkQodmlld1NjYWxpbmdYLCB2aWV3U2NhbGluZ1kpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2NhbGUoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIFxuICAgICAgICBwaXhlbHNQZXJVbml0OiBudW1iZXIsIGRpbWVuc2lvbjogUG9pbnQyRCwgcmV2ZXJzZTogYm9vbGVhbik6IHZvaWQge1xuXG4gICAgXHRsZXQgdmlld1NjYWxpbmcgPSB0aGlzLmdldFZpZXdTY2FsaW5nKHBpeGVsc1BlclVuaXQpO1xuXG4gICAgXHRpZiAocmV2ZXJzZSl7XG4gICAgXHRcdGN0eC5zY2FsZSgxL3ZpZXdTY2FsaW5nLngsIDEvdmlld1NjYWxpbmcueSk7XG4gICAgXHR9IGVsc2Uge1xuICAgIFx0XHRjdHguc2NhbGUodmlld1NjYWxpbmcueCwgdmlld1NjYWxpbmcueSk7XG4gICAgXHR9XG4gICAgXHRcbiAgICB9XG5cbiAgICBkcmF3KCk6IHZvaWQge1xuICAgIFx0bGV0IGRpbWVuc2lvbiA9IHRoaXMuZ2V0RGltZW5zaW9ucygpO1xuXG4gICAgICAgIGxldCBsb2NhbENvbnRleHQgPSB0aGlzLm9mZnNjcmVlbjtcblxuICAgIFx0bG9jYWxDb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG5cbiAgICBcdGZvciAobGV0IHZhbHVlIG9mIHRoaXMuaW1hZ2VUaWxlTGF5ZXJzKXtcbiAgICBcdFx0aWYgKHZhbHVlLmltYWdlUHJvcGVydGllcy52aXNpYmxlKSB7XG5cbiAgICAgICAgICAgICAgICBsb2NhbENvbnRleHQuZ2xvYmFsQWxwaGEgPSB2YWx1ZS5pbWFnZVByb3BlcnRpZXMub3BhY2l0eTtcblxuICAgIFx0XHRcdHRoaXMuc2NhbGUobG9jYWxDb250ZXh0LCB2YWx1ZS5pbWFnZVByb3BlcnRpZXMudGlsZVdpZHRoUHgsIGRpbWVuc2lvbiwgZmFsc2UpO1xuXG4gICAgXHRcdFx0bGV0IHRpbGVTY2FsaW5nWCA9IHZhbHVlLmltYWdlUHJvcGVydGllcy50aWxlV2lkdGhQeCAvIHZhbHVlLndpZHRoTWFwVW5pdHM7XG4gICAgXHRcdFx0bGV0IHRpbGVTY2FsaW5nWSA9IHZhbHVlLmltYWdlUHJvcGVydGllcy50aWxlSGVpZ2h0UHggLyB2YWx1ZS5oZWlnaHRNYXBVbml0cztcblxuICAgIFx0XHRcdGxldCB0aWxlczogQXJyYXk8SW1hZ2VUaWxlPiA9IHZhbHVlLmdldFRpbGVzKHRoaXMudG9wTGVmdCwgXG4gICAgXHRcdFx0XHRkaW1lbnNpb24ueCwgZGltZW5zaW9uLnkpO1xuXG4gICAgXHRcdFx0Zm9yIChsZXQgdGlsZSBvZiB0aWxlcyl7XG4gICAgXHRcdFx0XHR2YXIgdGlsZVggPSAodGlsZS54SW5kZXggLSB0aGlzLnRvcExlZnQueCkgKiB0aWxlU2NhbGluZ1g7XG4gICAgXHRcdFx0XHR2YXIgdGlsZVkgPSAodGlsZS55SW5kZXggLSB0aGlzLnRvcExlZnQueSkgKiB0aWxlU2NhbGluZ1k7XG5cbiAgICBcdFx0XHRcdHRpbGUuZHJhdyhsb2NhbENvbnRleHQsIHRpbGVYLCB0aWxlWSk7XG4gICAgXHRcdFx0fVxuXG4gICAgXHRcdFx0dGhpcy5zY2FsZShsb2NhbENvbnRleHQsIHZhbHVlLmltYWdlUHJvcGVydGllcy50aWxlV2lkdGhQeCwgZGltZW5zaW9uLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBsb2NhbENvbnRleHQuZ2xvYmFsQWxwaGEgPSAxO1xuICAgIFx0XHR9XG4gICAgXHR9XG5cbiAgICBcdGZvciAobGV0IHZhbHVlIG9mIHRoaXMuc3RhdGljRWxlbWVudHMpe1xuICAgIFx0XHQvLzI1NiBweCBpcyAxIG1hcCB1bml0XG5cdFx0XHRsZXQgdGlsZVNjYWxpbmdYID0gMjU2O1xuXHRcdFx0bGV0IHRpbGVTY2FsaW5nWSA9IDI1NjtcblxuICAgIFx0XHR0aGlzLnNjYWxlKGxvY2FsQ29udGV4dCwgMjU2LCBkaW1lbnNpb24sIGZhbHNlKTtcblxuICAgIFx0XHRsZXQgaW1hZ2VYID0gKHZhbHVlLnhJbmRleCAtIHRoaXMudG9wTGVmdC54KSAqIHRpbGVTY2FsaW5nWDtcbiAgICBcdFx0bGV0IGltYWdlWSA9ICh2YWx1ZS55SW5kZXggLSB0aGlzLnRvcExlZnQueSkgKiB0aWxlU2NhbGluZ1k7XG5cbiAgICBcdFx0dmFsdWUuZHJhdyhsb2NhbENvbnRleHQsIGltYWdlWCwgaW1hZ2VZKTtcbiAgICBcdFx0dGhpcy5zY2FsZShsb2NhbENvbnRleHQsIDI1NiwgZGltZW5zaW9uLCB0cnVlKTtcblxuICAgIFx0fVxuXG4gICAgICAgIGlmICh0aGlzLmdyaWQpe1xuICAgICAgICAgICAgdGhpcy5zY2FsZShsb2NhbENvbnRleHQsIDI1NiwgZGltZW5zaW9uLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLmdyaWRMYXllci5kcmF3KHRoaXMudG9wTGVmdCwgZGltZW5zaW9uLngsIGRpbWVuc2lvbi55KTtcbiAgICAgICAgICAgIHRoaXMuc2NhbGUobG9jYWxDb250ZXh0LCAyNTYsIGRpbWVuc2lvbiwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICBcdFxuICAgICAgICBsZXQgaW1hZ2VEYXRhOiBJbWFnZURhdGEgPSBsb2NhbENvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImltYWdlIGRhdGEgXCIsIGltYWdlRGF0YSk7XG4gICAgICAgIHRoaXMuY3R4LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuXG4gICAgICAgIHRoaXMuZHJhd0NlbnRyZSh0aGlzLmN0eCk7XG5cbiAgICB9XG5cbiAgICBkcmF3Q2VudHJlKGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCl7XG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIGNvbnRleHQuZ2xvYmFsQWxwaGEgPSAwLjM7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLndpZHRoLzIsIDYvMTYqdGhpcy5oZWlnaHQpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyh0aGlzLndpZHRoLzIsIDEwLzE2KnRoaXMuaGVpZ2h0KTtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8oNy8xNip0aGlzLndpZHRoLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oOS8xNip0aGlzLndpZHRoLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgV29ybGQyRCB9IGZyb20gXCIuL2dlb20vd29ybGQyZFwiO1xuaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tIFwiLi9nZW9tL3ZpZXdwb3J0XCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBTdGF0aWNJbWFnZSwgSW1hZ2VUaWxlTGF5ZXIsIEltYWdlU3RydWN0IH0gZnJvbSBcIi4vZ3JhcGhpY3MvY2FudmFzdGlsZVwiO1xuaW1wb3J0IHsgVmlld0NhbnZhcyB9IGZyb20gXCIuL2dyYXBoaWNzL3ZpZXdjYW52YXNcIjtcbmltcG9ydCB7IFpvb21Db250cm9sbGVyLCBQYW5Db250cm9sbGVyIH0gZnJvbSBcIi4vdWkvbWFwQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgSW1hZ2VDb250cm9sbGVyIH0gZnJvbSBcIi4vdWkvaW1hZ2VDb250cm9sbGVyXCI7XG5cbmxldCBzaW1wbGVXb3JsZCA9IG5ldyBXb3JsZDJEKCk7XG5cbi8vIGxldCBsYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbi8vIGxheWVyUHJvcGVydGllcy5wcmVmaXggPSBcIlwiO1xuLy8gbGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwiLnBuZ1wiO1xuXG4vLyBsZXQgcm9hZExheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuLy8gcm9hZExheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImIucG5nXCI7XG5cbi8vIGxldCBzZW50aW5lbExheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuLy8gc2VudGluZWxMYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCJsLmpwZWdcIjtcblxuLy8gbGV0IHNlbnRpbmVsVGVycmFpbkxheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuLy8gc2VudGluZWxUZXJyYWluTGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwidC5qcGVnXCI7XG5cbmxldCBsaWZmZXlMYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbmxpZmZleUxheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImxpZmZleS5qcGVnXCI7XG5saWZmZXlMYXllclByb3BlcnRpZXMudGlsZURpciA9IFwiaW1hZ2VzL2xpZmZleS9cIjtcblxubGV0IGxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG5saWZmZXlMYWJlbExheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImxpZmZleS5wbmdcIjtcbmxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzLm9wYWNpdHkgPSAxO1xubGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMudGlsZURpciA9IFwiaW1hZ2VzL2xpZmZleS9cIjtcbmxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzLnZpc2libGUgPSB0cnVlO1xuXG4vLyBsZXQgYmFzZUxheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKGxheWVyUHJvcGVydGllcyk7XG4vLyBsZXQgc2VudGluZWxMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihzZW50aW5lbExheWVyUHJvcGVydGllcyk7XG4vLyBsZXQgcm9hZExheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKHJvYWRMYXllclByb3BlcnRpZXMpO1xuLy8gbGV0IHRlcnJhaW5MYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihzZW50aW5lbFRlcnJhaW5MYXllclByb3BlcnRpZXMpO1xuXG5sZXQgbGlmZmV5U2VudGluZWxMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihsaWZmZXlMYXllclByb3BlcnRpZXMpO1xubGV0IGxpZmZleUxhYmVsTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIobGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMpO1xuXG5sZXQgZG9saWVySW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMi4yNCwgMS44NywgLjQzLCAuNDMsIC0wLjA2LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDE3UltTVkMyXS5qcGdcIiwgLjcpO1xuXG5sZXQgbWFyeUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0uOTYsIC0uNTksIC40MSwgLjQyLCAtMC4zMjUsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDJyXzJbU1ZDMl0gKDEpLnBuZ1wiLCAwLjcpO1xuXG5sZXQgdHJpbml0eUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDEuOTksIDMuNTksIC40MywgLjQzLCAwLjE1LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDE5UltTVkMyXS5qcGdcIiwgLjcpO1xuXG5sZXQgcG9vbGJlZ0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDMuMzQsIDEuNjI1LCAuNDA1LCAuNDMsIDAuMDUsXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAxOFJbU1ZDMl0uanBnXCIsIC43KTtcblxubGV0IGFiYmV5SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMi4zOSwgMC4wMzUsIC40MTUsIC40MzUsIC0uMjUsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDhyW1NWQzJdLmpwZ1wiLCAuNyk7XG5cbmxldCBidXNhcmFzSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMy40OSwgLTAuMjQsIC40MSwgLjQyNSwgLS4yNiwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwOXJbU1ZDMl0uanBnXCIsIC43KTtcblxubGV0IGxvd2VyYWJiZXlJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgxLjI5NSwgMC4zNzc2LCAuNDI1LCAuNDM1LCAtLjIzLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDA3cltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IGRhbWVJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgwLjk4LCAyLjMxNSwgLjQxLCAuNDI4LCAtMC4wOTUsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMTZyXzJbU1ZDMl0ucG5nXCIsIDAuNyk7XG5cbmxldCBjdXN0b21JbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSg1LjIxLCAtLjI0NSwgLjQyLCAuNDQsIDAuMDMsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMTByXzJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBtYW5vckltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDYuMzYsIDAuMDI1LCAuNDE1LCAuNDM1LCAwLjExLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDExcltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IHNhY2t2aWxsZUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDEuMjksIC0xLjI4LCAuNDYsIC40MiwgLTAuMjY1LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDA0cltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IGdyZWF0SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLjE5LCAtMC43MDUsIC40LCAuNDIsIC0uNTEsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDNyW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgbG93ZXJvcm1vbmRJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgwLjE2LCAwLjcxLCAuNDA1LCAuNDQsIC0wLjIwNSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwNnJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBzdGVwaGVuc0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDEuNzI1LCA0Ljk0NSwgLjIwNSwgLjIxNSwgMC4yMDUsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMjBSW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgc3RtYXJ5c0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0xLjA1NSwgMS4wMiwgLjQzLCAuNDE1LCAtMC4yMSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwNXJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBzdGVhbUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDguMTQ1LCAwLjI2NSwgLjgxNSwgLjkyLCAwLjEyLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDEycl8xW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgZmlmdGVlbkltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC00LCAyLjcsIDAuNCwgLjQsIC0xLjQsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMTVyXzJbU1ZDMl0ucG5nXCIsIDAuNyk7XG5cbmxldCBoZW5yaWV0dGFJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMi4zNTUsIC0yLjQzLCAwLjYxLCAwLjYxLCAwLjA1LCBcblx0XCJpbWFnZXMvaGVucmlldHRhLnBuZ1wiLCAwLjcpO1xuXG5sZXQgZm91cmNvdXJ0c0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0zLjI4LCAxLjc3LCAwLjU1LCAwLjU1LCAtMC4wMywgXG5cdFwiaW1hZ2VzL2ZvdXJjb3VydHMucG5nXCIsIDEpO1xuXG5sZXQgbWljaGFuc0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0zLjg4LCAwLjcsIDAuMzIsIDAuMzIsIC0wLjAzLCBcblx0XCJpbWFnZXMvbWljaGFucy5wbmdcIiwgMSk7XG5cbmxldCBibHVlY29hdHNJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtNi42MTksIC0wLjE2NSwgMC40LCAwLjQsIC0wLjA1LCBcblx0XCJpbWFnZXMvYmx1ZWNvYXRzLnBuZ1wiLCAwLjcpO1xuXG5sZXQgaHVnaGxhbmVJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgwLjExLCAtMy4yNywgMC40LCAwLjQsIC0wLjIyNSwgXG5cdFwiaW1hZ2VzL2h1Z2hsYW5lLnBuZ1wiLCAwLjcpO1xuXG5sZXQgbW91bnRqb3lJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgzLjMzNSwgLTUuMTM1LCAwLjQsIDAuNCwgMC4xNywgXG5cdFwiaW1hZ2VzL21vdW50am95LnBuZ1wiLCAwLjcpO1xuXG5sZXQgY3VzdG9tc0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDQuMzksIDAuMzIsIDAuNDMsIDAuNDMsIC0wLjA1LCBcblx0XCJpbWFnZXMvY3VzdG9tc2hvdXNlLnBuZ1wiLCAwLjcpO1xuXG5sZXQgbGliZXJ0eUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDMuNDMsIDAuMDA5LCAwLjQzLCAwLjQzLCAtMC4wNSwgXG5cdFwiaW1hZ2VzL2xpYmVydHkucG5nXCIsIDAuNyk7XG5cbmxldCBjcm9zc1BvZGRsZSA9IG5ldyBTdGF0aWNJbWFnZSgtMi44NDYsIDYuMTI1LCAuMTk5LCAuMjA1LCAtMC4wMjUsIFxuXHRcImltYWdlcy93c2MtbWFwcy00MzMtMi5qcGdcIiwgMC43KTtcblxubGV0IHBhdHJpY2tzSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTIuMjcsIDUuOTUsIC40LCAuNCwgMC4wMzUsIFxuXHRcImltYWdlcy93c2MtbWFwcy0xODQtMS1mcm9udC5qcGdcIiwgMC42KTtcblxubGV0IGNsb25tZWxJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgxLjg0NSwgOC4xMiwgLjgzLCAuODMsIC0yLjcyNSwgXG5cdFwiaW1hZ2VzL3dzYy1tYXBzLTQ2Ny0wMi5wbmdcIiwgMC43KTtcblxubGV0IGJyb2Fkc3RvbmVJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMi42MSwgLTAuMDU1LCAxLjQ1NSwgMS40NTUsIDEuNTY1LCBcblx0XCJpbWFnZXMvd3NjLW1hcHMtMDcyLnBuZ1wiLCAwLjcpO1xuXG5sZXQgcGFybGlhbWVudEltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0wLjksIDIuNjcsIC41LCAuNSwgLTMuMzIsIFxuXHRcImltYWdlcy93c2MtbWFwcy0wODgtMS5wbmdcIiwgMC43KTtcblxubGV0IGN1dHB1cnNlSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTMuODg1LCAzLjQzLCAuNTM1LCAuNTQ1LCAtMC4wNzQsIFxuXHRcImltYWdlcy93c2MtbWFwcy0xMDYtMS5qcGdcIiwgMC43KTtcblxubGV0IGN1dHBhdHJpY2tJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMi45OCwgNC4zMiwgMS41MywgMS41MywgLTAuMDI1LCBcblx0XCJpbWFnZXMvV1NDLU1hcHMtNzU3LnBuZ1wiLCAwLjcpO1xuXG5sZXQgY3V0cGF0cmlja092ZXJsYXlJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMi45OCwgNC4zMiwgMS41MywgMS41MywgLTAuMDI1LCBcblx0XCJpbWFnZXMvV1NDLU1hcHMtNzU3X292ZXJsYXkucG5nXCIsIDAuNyk7XG5cbmxldCB0aGluZ0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0yLjUsIDMuNiwgMS4yMiwgMS4xNiwgMCwgXG5cdFwiaW1hZ2VzL0lNR18wNjQ2LnBuZ1wiLCAwLjQpO1xuXG5sZXQgYmx1ZWNvYXRJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMy40MzUsIC0xLjk5NSwgMi4zOSwgMi4zNTUsIDAsIFxuXHRcImltYWdlcy9ibHVlY29hdC5wbmdcIiwgMC40KTtcblxubGV0IHJ1dGxhbmRJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgyLjMyLCAtMC43NywgMi4wMTUsIDIuMDE1LCAwLCBcblx0XCJpbWFnZXMvcnV0bGFuZC5wbmdcIiwgMC43KTtcblxubGV0IG1hdGVySW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMi4xNiwgLTUuNDIsIDIuMDE1LCAyLjAxNSwgMCwgXG5cdFwiaW1hZ2VzL21hdGVyLnBuZ1wiLCAwLjcpO1xuXG5sZXQgdG93bnNlbmRJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSg0LjU3NSwgMy45OTUsIDIuMDM1LCAyLjAzNSwgMCwgXG5cdFwiaW1hZ2VzL3Rvd25zZW5kLnBuZ1wiLCAwLjcpO1xuXG5sZXQgY2FzdGxlSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTMuNTEsIDIuMzc1LCAxLjk4NSwgMS45OTUsIDAsIFxuXHRcImltYWdlcy9jYXN0bGUucG5nXCIsIDAuNCk7XG5cbmxldCBncmFuZEltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDAuNzU1LCAzLjIsIC42LCAuNiwgMS4yMzUsIFwiaW1hZ2VzL3dzYy1tYXBzLTMzNC5wbmdcIiwgMC40KTtcblxubGV0IHRvdGFsSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoNC40ODUsIC0xLjg3NSwgNy40NjUsIDcuMzUsIDAsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDFyW1NWQzJdLmpwZ1wiLCAuNSk7XG5cbmxldCB0b3RhbE92ZXJsYXlJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSg0LjQ1LCAtMS44NCwgMy44OTMsIDMuODI5LCAwLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDAxcltTVkMyXS5wbmdcIiwgLjUpO1xuXG5mdW5jdGlvbiBzaG93TWFwKGRpdk5hbWU6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpdk5hbWUpO1xuXG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdGxldCB2aWV3Q2FudmFzID0gbmV3IFZpZXdDYW52YXMobmV3IFBvaW50MkQoLTgsLTYpLCA5LCA2LCBmYWxzZSwgY3R4KTtcblx0Ly8gdmlld0NhbnZhcy5hZGRUaWxlTGF5ZXIoYmFzZUxheWVyKTtcblx0Ly8gdmlld0NhbnZhcy5hZGRUaWxlTGF5ZXIoc2VudGluZWxMYXllcik7XG5cdC8vdmlld0NhbnZhcy5hZGRUaWxlTGF5ZXIobGlmZmV5U2VudGluZWxMYXllcik7XG5cdC8vdmlld0NhbnZhcy5hZGRUaWxlTGF5ZXIobGlmZmV5TGFiZWxMYXllcik7XG5cblx0Ly92aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQodG90YWxJbWFnZSk7XG5cdC8vdmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHRvdGFsT3ZlcmxheUltYWdlKTtcblx0Ly92aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoYnJvYWRzdG9uZUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHBhcmxpYW1lbnRJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChjdXRwdXJzZUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGdyYW5kSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQocnV0bGFuZEltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KG1hdGVySW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQodG93bnNlbmRJbWFnZSk7XG5cdC8vdmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGN1dHBhdHJpY2tJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChjdXRwYXRyaWNrT3ZlcmxheUltYWdlKTtcblxuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQobWFyeUltYWdlKTtcdFxuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoc3RlcGhlbnNJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChkb2xpZXJJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudCh0cmluaXR5SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQocG9vbGJlZ0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGFiYmV5SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQobG93ZXJhYmJleUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGJ1c2FyYXNJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChzdGVhbUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGRhbWVJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChjdXN0b21JbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChtYW5vckltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHNhY2t2aWxsZUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGdyZWF0SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQobG93ZXJvcm1vbmRJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChzdG1hcnlzSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQocGF0cmlja3NJbWFnZSk7XG5cdC8vdmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGNyb3NzUG9kZGxlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGNsb25tZWxJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudCh0aGluZ0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGJsdWVjb2F0SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoY2FzdGxlSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoZmlmdGVlbkltYWdlKTtcblxuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoaGVucmlldHRhSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoZm91cmNvdXJ0c0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGJsdWVjb2F0c0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGh1Z2hsYW5lSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQobW91bnRqb3lJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChjdXN0b21zSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQobGliZXJ0eUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KG1pY2hhbnNJbWFnZSk7XG5cblx0bGV0IGltYWdlQ29udHJvbGxlciA9IG5ldyBJbWFnZUNvbnRyb2xsZXIodmlld0NhbnZhcywgbWljaGFuc0ltYWdlKTtcblxuXHRjb25zdCBwbHVzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGx1c1wiKTtcblx0Y29uc3QgbWludXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtaW51c1wiKTtcblxuXHRsZXQgcGFuQ29udHJvbCA9IG5ldyBQYW5Db250cm9sbGVyKHZpZXdDYW52YXMsIGNhbnZhcyk7XG5cdGxldCBjYW52YXNDb250cm9sID0gbmV3IFpvb21Db250cm9sbGVyKHZpZXdDYW52YXMsIHBsdXMsIG1pbnVzKTtcblxuXHRjYW52YXNDb250cm9sLmFkZFpvb21MaXN0ZW5lcihwYW5Db250cm9sKTtcblxuXHR2aWV3Q2FudmFzLmRyYXcoKTtcbn1cblxuZnVuY3Rpb24gc2hvdygpe1xuXHRzaG93TWFwKFwiY2FudmFzXCIsIFwiVHlwZVNjcmlwdFwiKTtcbn1cblxuaWYgKFxuICAgIGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIiB8fFxuICAgIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSBcImxvYWRpbmdcIiAmJiAhZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmRvU2Nyb2xsKVxuKSB7XG5cdHNob3coKTtcbn0gZWxzZSB7XG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIHNob3cpO1xufVxuXG4iLCJpbXBvcnQgeyBTdGF0aWNJbWFnZSB9IGZyb20gXCIuLi9ncmFwaGljcy9jYW52YXN0aWxlXCI7XG5pbXBvcnQgeyBWaWV3Q2FudmFzIH0gZnJvbSBcIi4uL2dyYXBoaWNzL3ZpZXdjYW52YXNcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbmV4cG9ydCBjbGFzcyBJbWFnZUNvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3Iodmlld0NhbnZhczogVmlld0NhbnZhcywgcmVhZG9ubHkgc3RhdGljSW1hZ2U6IFN0YXRpY0ltYWdlKSB7XG4gICAgXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLnByZXNzZWQodmlld0NhbnZhcywgZSAgYXMgS2V5Ym9hcmRFdmVudCkpO1xuICAgIH1cblxuICAgIHByZXNzZWQodmlld0NhbnZhczogVmlld0NhbnZhcywgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBcdGNvbnNvbGUubG9nKFwicHJlc3NlZFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQua2V5KTtcblxuICAgIFx0c3dpdGNoIChldmVudC5rZXkpIHtcbiAgICBcdFx0Y2FzZSBcImFcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnhJbmRleCA9IHRoaXMuc3RhdGljSW1hZ2UueEluZGV4IC0gMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJkXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS54SW5kZXggPSB0aGlzLnN0YXRpY0ltYWdlLnhJbmRleCArIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwid1wiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2UueUluZGV4ID0gdGhpcy5zdGF0aWNJbWFnZS55SW5kZXggLSAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInNcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnlJbmRleCA9IHRoaXMuc3RhdGljSW1hZ2UueUluZGV4ICsgMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJlXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5yb3RhdGlvbiA9IHRoaXMuc3RhdGljSW1hZ2Uucm90YXRpb24gLSAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInFcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnJvdGF0aW9uID0gdGhpcy5zdGF0aWNJbWFnZS5yb3RhdGlvbiArIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwieFwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1ggPSB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdYIC0gMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJYXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWCA9IHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1ggKyAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInpcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdZID0gdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWSAtIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiWlwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1kgPSB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdZICsgMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGRlZmF1bHQ6XG4gICAgXHRcdFx0Ly8gY29kZS4uLlxuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0fVxuICAgIFx0Y29uc29sZS5sb2coXCJpbWFnZSBhdDogXCIgKyAgdGhpcy5zdGF0aWNJbWFnZS54SW5kZXggKyBcIiwgXCIgKyB0aGlzLnN0YXRpY0ltYWdlLnlJbmRleCk7XG4gICAgXHRjb25zb2xlLmxvZyhcImltYWdlIHJvIHNjOiBcIiArICB0aGlzLnN0YXRpY0ltYWdlLnJvdGF0aW9uICsgXCIsIFwiICsgdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWCArIFwiLCBcIiArIHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1kpO1xuICAgIH07XG5cbn07IiwiaW1wb3J0IHsgVmlld0NhbnZhcyB9IGZyb20gXCIuLi9ncmFwaGljcy92aWV3Y2FudmFzXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5hYnN0cmFjdCBjbGFzcyBNb3VzZUNvbnRyb2xsZXIge1xuXG4gICAgbW91c2VQb3NpdGlvbihldmVudDogTW91c2VFdmVudCwgd2l0aGluOiBIVE1MRWxlbWVudCk6IFBvaW50MkQge1xuICAgICAgICBsZXQgbV9wb3N4ID0gZXZlbnQuY2xpZW50WCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0O1xuICAgICAgICBsZXQgbV9wb3N5ID0gZXZlbnQuY2xpZW50WSArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wXG4gICAgICAgICAgICAgICAgICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcblxuICAgICAgICB2YXIgZV9wb3N4ID0gMDtcbiAgICAgICAgdmFyIGVfcG9zeSA9IDA7XG4gICAgICAgIGlmICh3aXRoaW4ub2Zmc2V0UGFyZW50KXtcbiAgICAgICAgICAgIGRvIHsgXG4gICAgICAgICAgICAgICAgZV9wb3N4ICs9IHdpdGhpbi5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgICAgIGVfcG9zeSArPSB3aXRoaW4ub2Zmc2V0VG9wO1xuICAgICAgICAgICAgfSB3aGlsZSAod2l0aGluID0gPEhUTUxFbGVtZW50PndpdGhpbi5vZmZzZXRQYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQb2ludDJEKG1fcG9zeCAtIGVfcG9zeCwgbV9wb3N5IC0gZV9wb3N5KTtcbiAgICB9XG4gICAgXG59XG5cbmFic3RyYWN0IGNsYXNzIFpvb21MaXN0ZW5lciB7XG4gICAgYWJzdHJhY3Qgem9vbShieTogbnVtYmVyKTtcbn1cblxuZXhwb3J0IGNsYXNzIFpvb21Db250cm9sbGVyIGV4dGVuZHMgTW91c2VDb250cm9sbGVyIHtcblxuXHRwcml2YXRlIGxpc3RlbmVyczogQXJyYXk8Wm9vbUxpc3RlbmVyPiA9IFtdO1xuXHRwcml2YXRlIHpvb20gPSAxO1xuXG4gICAgY29uc3RydWN0b3Iodmlld0NhbnZhczogVmlld0NhbnZhcywgcmVhZG9ubHkgem9vbUluOiBIVE1MRWxlbWVudCwgcmVhZG9ubHkgem9vbU91dDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgIFx0em9vbUluLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZTpFdmVudCkgPT4gdGhpcy5jbGlja2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcywgLjk1KSk7XG4gICAgXHR6b29tT3V0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZTpFdmVudCkgPT4gdGhpcy5jbGlja2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcywgMS4wNSkpO1xuICAgIFx0dmlld0NhbnZhcy5jdHguY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJkYmxjbGlja1wiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuY2xpY2tlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdDYW52YXMsIC43NSkpO1xuICAgIH1cblxuICAgIGFkZFpvb21MaXN0ZW5lcih6b29tTGlzdGVuZXI6IFpvb21MaXN0ZW5lcil7XG4gICAgXHR0aGlzLmxpc3RlbmVycy5wdXNoKHpvb21MaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgY2xpY2tlZChldmVudDogTW91c2VFdmVudCwgdmlld0NhbnZhczogVmlld0NhbnZhcywgYnk6IG51bWJlcikge1xuXG4gICAgXHRjb25zb2xlLmxvZyhcImNsaWNrZWRcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LnR5cGUpO1xuXG4gICAgXHRjb25zb2xlLmxvZyhcImxpc3RlbmVycyBcIiArIHRoaXMubGlzdGVuZXJzLmxlbmd0aCk7XG5cbiAgICAgICAgc3dpdGNoKGV2ZW50LnR5cGUpe1xuICAgICAgICAgICAgY2FzZSBcImRibGNsaWNrXCI6XG4gICAgICAgICAgICAgICAgbGV0IGNhbnZhcyA9IHZpZXdDYW52YXMuY3R4LmNhbnZhcztcblxuICAgICAgICAgICAgICAgIGlmICAoZXZlbnQuY3RybEtleSkge1xuICAgICAgICAgICAgICAgICAgICBieSA9IDEgLyBieTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbGV0IG1YWSA9IHRoaXMubW91c2VQb3NpdGlvbihldmVudCwgdmlld0NhbnZhcy5jdHguY2FudmFzKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2aWV3Q2FudmFzLnpvb21BYm91dChtWFkueCAvIGNhbnZhcy5jbGllbnRXaWR0aCwgbVhZLnkgLyBjYW52YXMuY2xpZW50SGVpZ2h0LCBieSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHZpZXdDYW52YXMuem9vbVZpZXcoYnkpO1xuICAgICAgICB9XG5cbiAgICBcdHRoaXMuem9vbSA9IHRoaXMuem9vbSAqIGJ5O1xuICAgIFx0Zm9yIChsZXQgdmFsdWUgb2YgdGhpcy5saXN0ZW5lcnMpe1xuICAgIFx0XHR2YWx1ZS56b29tKHRoaXMuem9vbSk7XG4gICAgXHR9XG5cbiAgICBcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIH07XG5cbn07XG5cbmV4cG9ydCBjbGFzcyBQYW5Db250cm9sbGVyIGV4dGVuZHMgWm9vbUxpc3RlbmVyIHtcblxuXHRwcml2YXRlIHhQcmV2aW91czogbnVtYmVyO1xuXHRwcml2YXRlIHlQcmV2aW91czogbnVtYmVyO1xuXHRwcml2YXRlIHJlY29yZDogYm9vbGVhbiA9IGZhbHNlO1xuXHRwcml2YXRlIGJhc2VNb3ZlOiBudW1iZXIgPSAyNTY7XG5cdHByaXZhdGUgbW92ZTogbnVtYmVyID0gMjU2O1xuXG4gICAgY29uc3RydWN0b3Iodmlld0NhbnZhczogVmlld0NhbnZhcywgcmVhZG9ubHkgZHJhZ0VsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgXHRzdXBlcigpO1xuICAgIFx0ZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdDYW52YXMpKTtcbiAgICBcdGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzKSk7XG4gICAgICAgIGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdDYW52YXMpKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5yZWNvcmQgPSBmYWxzZSk7XG4gICAgICAgIHZpZXdDYW52YXMuY3R4LmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwid2hlZWxcIiwgKGU6IEV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMud2hlZWwoZSBhcyBXaGVlbEV2ZW50LCB2aWV3Q2FudmFzKSk7XG4gICAgfVxuXG4gICAgem9vbShieTogbnVtYmVyKXtcbiAgICBcdGNvbnNvbGUubG9nKFwiem9vbSBieSBcIiArIGJ5KTtcbiAgICBcdHRoaXMubW92ZSA9IHRoaXMuYmFzZU1vdmUgLyBieTtcbiAgICB9XG5cblxuICAgIHdoZWVsKGV2ZW50OiBXaGVlbEV2ZW50LCB2aWV3Q2FudmFzOiBWaWV3Q2FudmFzKSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJ3aGVlbFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQudHlwZSk7XG5cbiAgICAgICAgbGV0IHhEZWx0YSA9IGV2ZW50LmRlbHRhWCAvIHRoaXMubW92ZTtcbiAgICAgICAgbGV0IHlEZWx0YSA9IGV2ZW50LmRlbHRhWSAvIHRoaXMubW92ZTtcblxuICAgICAgICBsZXQgbmV3VG9wTGVmdCA9IG5ldyBQb2ludDJEKHZpZXdDYW52YXMudG9wTGVmdC54IC0geERlbHRhLCBcbiAgICAgICAgICAgIHZpZXdDYW52YXMudG9wTGVmdC55IC0geURlbHRhKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhcInRvcGxlZnQgXCIgKyBuZXdUb3BMZWZ0KTtcblxuICAgICAgICB2aWV3Q2FudmFzLm1vdmVWaWV3KG5ld1RvcExlZnQpO1xuICAgICAgICB2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICB9XG5cblxuICAgIGRyYWdnZWQoZXZlbnQ6IE1vdXNlRXZlbnQsIHZpZXdDYW52YXM6IFZpZXdDYW52YXMpIHtcblxuICAgICAgICBsZXQgY2FudmFzID0gdmlld0NhbnZhcy5jdHguY2FudmFzO1xuXG4gICAgXHRzd2l0Y2goZXZlbnQudHlwZSl7XG4gICAgXHRcdGNhc2UgXCJtb3VzZWRvd25cIjpcbiAgICBcdFx0XHR0aGlzLnJlY29yZCA9IHRydWU7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJtb3VzZXVwXCI6XG4gICAgXHRcdFx0dGhpcy5yZWNvcmQgPSBmYWxzZTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0ZGVmYXVsdDpcbiAgICBcdFx0XHRpZiAodGhpcy5yZWNvcmQpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgeERlbHRhID0gKGV2ZW50LmNsaWVudFggLSB0aGlzLnhQcmV2aW91cykgLyB0aGlzLm1vdmU7XG4gICAgICAgICAgICAgICAgICAgIGxldCB5RGVsdGEgPSAoZXZlbnQuY2xpZW50WSAtIHRoaXMueVByZXZpb3VzKSAvIHRoaXMubW92ZTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3VG9wTGVmdCA9IG5ldyBQb2ludDJEKHZpZXdDYW52YXMudG9wTGVmdC54IC0geERlbHRhLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdDYW52YXMudG9wTGVmdC55IC0geURlbHRhKTtcblxuICAgICAgICAgICAgICAgICAgICB2aWV3Q2FudmFzLm1vdmVWaWV3KG5ld1RvcExlZnQpO1xuICAgICAgICAgICAgICAgICAgICB2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHR9XG4gICAgXHR9XG5cblx0XHR0aGlzLnhQcmV2aW91cyA9IGV2ZW50LmNsaWVudFg7XG5cdFx0dGhpcy55UHJldmlvdXMgPSBldmVudC5jbGllbnRZO1xuXG4gICAgfTtcblxuICAgIG1vdXNlUG9zaXRpb24oZXZlbnQ6IE1vdXNlRXZlbnQsIHdpdGhpbjogSFRNTEVsZW1lbnQpOiBQb2ludDJEIHtcbiAgICAgICAgbGV0IG1fcG9zeCA9IGV2ZW50LmNsaWVudFggKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnRcbiAgICAgICAgICAgICAgICAgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdDtcbiAgICAgICAgbGV0IG1fcG9zeSA9IGV2ZW50LmNsaWVudFkgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7XG5cbiAgICAgICAgdmFyIGVfcG9zeCA9IDA7XG4gICAgICAgIHZhciBlX3Bvc3kgPSAwO1xuICAgICAgICBpZiAod2l0aGluLm9mZnNldFBhcmVudCl7XG4gICAgICAgICAgICBkbyB7IFxuICAgICAgICAgICAgICAgIGVfcG9zeCArPSB3aXRoaW4ub2Zmc2V0TGVmdDtcbiAgICAgICAgICAgICAgICBlX3Bvc3kgKz0gd2l0aGluLm9mZnNldFRvcDtcbiAgICAgICAgICAgIH0gd2hpbGUgKHdpdGhpbiA9IDxIVE1MRWxlbWVudD53aXRoaW4ub2Zmc2V0UGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQyRChtX3Bvc3ggLSBlX3Bvc3gsIG1fcG9zeSAtIGVfcG9zeSk7XG4gICAgfVxuICAgIFxufTtcblxuIl19
