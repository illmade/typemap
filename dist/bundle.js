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
        var x = position.x / this.widthMapUnits;
        var y = position.y / this.heightMapUnits;
        var width = xMapUnits / this.widthMapUnits;
        var height = yMapUnits / this.heightMapUnits;
        var firstX = Math.floor(x);
        var lastX = Math.ceil(x) + width;
        var firstY = Math.floor(y);
        var lastY = Math.ceil(y) + height;
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
var SlippyTileLayer = /** @class */ (function (_super) {
    __extends(SlippyTileLayer, _super);
    function SlippyTileLayer(imageProperties, zoom, xOffset, yOffset) {
        var _this = _super.call(this, imageProperties.widthMapUnits, imageProperties.heightMapUnits) || this;
        _this.zoom = zoom;
        _this.xOffset = xOffset;
        _this.yOffset = yOffset;
        _this.baseX = 0;
        _this.baseY = 0;
        _this.imageProperties = imageProperties;
        return _this;
    }
    SlippyTileLayer.prototype.offsets = function () {
        var zoomExp = Math.pow(2, this.zoom);
        this.baseX = xOffset / zoomExp;
        this.baseY = yOffset / zoomExp;
    };
    /**
      leave caching up to the browser
    **/
    SlippyTileLayer.prototype.getTile = function (xUnits, yUnits) {
        var imageSrc = this.imageProperties.tileDir + this.zoom + "/" + (this.xOffset + xUnits) + "/" +
            +(this.yOffset + yUnits) + this.imageProperties.suffix;
        return new ImageTile(xUnits, yUnits, imageSrc);
    };
    return SlippyTileLayer;
}(tile_1.TileLayer));
exports.SlippyTileLayer = SlippyTileLayer;

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
                var scaledTileWidth = value.imageProperties.tileWidthPx /
                    value.imageProperties.widthMapUnits;
                var scaledTileHeight = value.imageProperties.tileHeightPx /
                    value.imageProperties.heightMapUnits;
                this.scale(localContext, scaledTileWidth, dimension, false);
                var x = this.topLeft.x / 2;
                var y = this.topLeft.y / 2;
                var tiles = value.getTiles(this.topLeft, dimension.x, dimension.y);
                for (var _b = 0, tiles_1 = tiles; _b < tiles_1.length; _b++) {
                    var tile = tiles_1[_b];
                    var tileX = 128 + (tile.xIndex - x) *
                        value.imageProperties.tileWidthPx;
                    var tileY = -128 + (tile.yIndex - y) *
                        value.imageProperties.tileHeightPx;
                    //console.log("tile draw " + tileX + ", " + tileY);
                    tile.draw(localContext, tileX, tileY);
                }
                this.scale(localContext, scaledTileWidth, dimension, true);
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
var slippyLayerProperties = new canvastile_1.ImageStruct();
slippyLayerProperties.tileDir = "images/qtile/dublin/";
slippyLayerProperties.suffix = ".png";
liffeyLabelLayerProperties.opacity = .4;
slippyLayerProperties.widthMapUnits = 2;
slippyLayerProperties.heightMapUnits = 2;
// let baseLayer = new ImageTileLayer(layerProperties);
// let sentinelLayer = new ImageTileLayer(sentinelLayerProperties);
// let roadLayer = new ImageTileLayer(roadLayerProperties);
// let terrainLayer = new ImageTileLayer(sentinelTerrainLayerProperties);
var liffeySentinelLayer = new canvastile_1.ImageTileLayer(liffeyLayerProperties);
var liffeyLabelLayer = new canvastile_1.ImageTileLayer(liffeyLabelLayerProperties);
var slippyTileLayer = new canvastile_1.SlippyTileLayer(slippyLayerProperties, 16, 31628, 21242);
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
var thecastleImage = new canvastile_1.StaticImage(-0.87, 3.48, 0.48, 0.56, -0.115, "images/thecastle.png", 1);
var ngirelandImage = new canvastile_1.StaticImage(4.58, 4.92, 0.36, 0.46, -0.085, "images/ngireland.png", 1);
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
    viewCanvas.addTileLayer(slippyTileLayer);
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
    viewCanvas.addStaticElement(thecastleImage);
    viewCanvas.addStaticElement(ngirelandImage);
    var imageController = new imageController_1.ImageController(viewCanvas, materImage);
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
        //console.log("wheel" + event.target + ", " + event.type);
        var xDelta = event.deltaX / this.move;
        var yDelta = event.deltaY / this.move;
        var newTopLeft = new point2d_1.Point2D(viewCanvas.topLeft.x - xDelta, viewCanvas.topLeft.y - yDelta);
        //console.log("topleft " + newTopLeft);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2dlb20vdGlsZS50cyIsInNyYy9nZW9tL3ZpZXdwb3J0LnRzIiwic3JjL2dlb20vd29ybGQyZC50cyIsInNyYy9ncmFwaGljcy9jYW52YXN0aWxlLnRzIiwic3JjL2dyYXBoaWNzL2dyaWQudHMiLCJzcmMvZ3JhcGhpY3Mvdmlld2NhbnZhcy50cyIsInNyYy9zaW1wbGVXb3JsZC50cyIsInNyYy91aS9pbWFnZUNvbnRyb2xsZXIudHMiLCJzcmMvdWkvbWFwQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQ0E7SUFPSSxpQkFBWSxDQUFTLEVBQUUsQ0FBUztRQUM1QixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFRSwwQkFBUSxHQUFSO1FBQ0ksT0FBTyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDckQsQ0FBQztJQWJlLFlBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDekIsV0FBRyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQWM1QyxjQUFDO0NBaEJELEFBZ0JDLElBQUE7QUFoQlksMEJBQU87Ozs7O0FDRXBCO0lBRUMsbUJBQW1CLGFBQXFCLEVBQVMsY0FBc0I7UUFBcEQsa0JBQWEsR0FBYixhQUFhLENBQVE7UUFBUyxtQkFBYyxHQUFkLGNBQWMsQ0FBUTtJQUFFLENBQUM7SUFJMUUsNEJBQVEsR0FBUixVQUFTLFFBQWlCLEVBQUUsU0FBaUIsRUFBRSxTQUFpQjtRQUUvRCxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFH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RUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUM1RCx5Q0FBeUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUVoRCxJQUFJLFNBQVMsR0FBRyxJQUFJLHdCQUFXLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFDM0QsK0NBQStDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFFdkQsSUFBSSxZQUFZLEdBQUcsSUFBSSx3QkFBVyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQzVELHlDQUF5QyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBRWhELElBQUksWUFBWSxHQUFHLElBQUksd0JBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUM5RCx5Q0FBeUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUVoRCxJQUFJLFVBQVUsR0FBRyxJQUFJLHdCQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUM3RCx5Q0FBeUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUVoRCxJQUFJLFlBQVksR0FBRyxJQUFJLHdCQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQzlELHlDQUF5QyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBRWhELElBQUksZUFBZSxHQUFHLElBQUksd0JBQVcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQ3BFLHlDQUF5QyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBRWpELElBQUksU0FBUyxHQUFHLElBQUksd0JBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQzdELDJDQUEyQyxFQUFFLEdB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QUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1A7Z0JBQ0MsVUFBVTtnQkFDVixNQUFNO1NBQ1A7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksR0FBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcs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bnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlxuZXhwb3J0IGNsYXNzIFBvaW50MkQge1xuICAgIHN0YXRpYyByZWFkb25seSB6ZXJvID0gbmV3IFBvaW50MkQoMCwgMCk7XG4gICAgc3RhdGljIHJlYWRvbmx5IG9uZSA9IG5ldyBQb2ludDJEKDEsIDEpO1xuXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xuICAgIHJlYWRvbmx5IHk6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG5cdH1cblxuICAgIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcIlBvaW50MkQoXCIgKyB0aGlzLnggKyBcIiwgXCIgKyB0aGlzLnkgKyBcIilcIjtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBVbml0cyB9IGZyb20gXCIuL3dvcmxkMmRcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi9wb2ludDJkXCI7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBUaWxlTGF5ZXIge1xuXHRcblx0Y29uc3RydWN0b3IocHVibGljIHdpZHRoTWFwVW5pdHM6IG51bWJlciwgcHVibGljIGhlaWdodE1hcFVuaXRzOiBudW1iZXIpe31cblxuXHRhYnN0cmFjdCBnZXRUaWxlKHhJbmRleDogbnVtYmVyLCB5SW5kZXg6IG51bWJlcik6IFRpbGU7XG5cblx0Z2V0VGlsZXMocG9zaXRpb246IFBvaW50MkQsIHhNYXBVbml0czogbnVtYmVyLCB5TWFwVW5pdHM6IG51bWJlcik6IEFycmF5PFRpbGU+IHtcblxuXHRcdGxldCB4ID0gcG9zaXRpb24ueCAvIHRoaXMud2lkdGhNYXBVbml0cztcblx0XHRsZXQgeSA9IHBvc2l0aW9uLnkgLyB0aGlzLmhlaWdodE1hcFVuaXRzO1xuXG5cdFx0bGV0IHdpZHRoID0geE1hcFVuaXRzIC8gdGhpcy53aWR0aE1hcFVuaXRzO1xuXHRcdGxldCBoZWlnaHQgPSB5TWFwVW5pdHMgLyB0aGlzLmhlaWdodE1hcFVuaXRzO1xuXG5cdFx0bGV0IGZpcnN0WCA9IE1hdGguZmxvb3IoeCk7XG5cdFx0bGV0IGxhc3RYID0gTWF0aC5jZWlsKHgpICsgd2lkdGg7XG5cblx0XHRsZXQgZmlyc3RZID0gTWF0aC5mbG9vcih5KTtcblx0XHRsZXQgbGFzdFkgPSBNYXRoLmNlaWwoeSkgKyBoZWlnaHQ7XG5cblx0XHRsZXQgdGlsZXMgPSBuZXcgQXJyYXk8VGlsZT4oKTtcblxuXHRcdGZvciAodmFyIHg9Zmlyc3RYOyB4PGxhc3RYOyB4Kyspe1xuXHRcdFx0Zm9yICh2YXIgeT1maXJzdFk7IHk8bGFzdFk7IHkrKyl7XG5cdFx0XHRcdHRpbGVzLnB1c2godGhpcy5nZXRUaWxlKHgsIHkpKVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aWxlcztcblx0fVxuXG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlIHtcblx0XG5cdHN0YXRpYyBlbXB0eVRpbGU6IFRpbGUgPSBuZXcgVGlsZSgtMSwtMSk7XG5cblx0Y29uc3RydWN0b3IoeEluZGV4OiBudW1iZXIsIHlJbmRleDogbnVtYmVyKXt9XG5cbn0iLCJpbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4vcG9pbnQyZFwiO1xuaW1wb3J0IHsgVmVjdG9yMkQgfSBmcm9tIFwiLi92ZWN0b3IyZFwiO1xuaW1wb3J0IHsgV29ybGQyRCwgVW5pdHMgfSBmcm9tIFwiLi93b3JsZDJkXCI7XG5cbmV4cG9ydCBjbGFzcyBWaWV3cG9ydCB7XG5cdFxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgdG9wTGVmdDogUG9pbnQyRCwgXG5cdFx0cHJpdmF0ZSB3aWR0aE1hcFVuaXRzOiBudW1iZXIsIHByaXZhdGUgaGVpZ2h0TWFwVW5pdHM6IG51bWJlcil7XG5cblx0XHRjb25zb2xlLmxvZyhcIncgaFwiICsgd2lkdGhNYXBVbml0cyArIFwiLCBcIiArIGhlaWdodE1hcFVuaXRzKTtcblx0fVxuXG5cdG1vdmVWaWV3KHRvcExlZnQ6IFBvaW50MkQpe1xuXHRcdHRoaXMudG9wTGVmdCA9IHRvcExlZnQ7XG5cdH1cblxuXHR6b29tVmlldyh6b29tOiBudW1iZXIpe1xuXHRcdGxldCBuZXdXaWR0aCA9IHRoaXMud2lkdGhNYXBVbml0cyAqIHpvb207XG5cdFx0bGV0IG5ld0hlaWdodCA9IHRoaXMuaGVpZ2h0TWFwVW5pdHMgKiB6b29tO1xuXG5cdFx0bGV0IG1vdmVYID0gKHRoaXMud2lkdGhNYXBVbml0cyAtIG5ld1dpZHRoKSAvIDI7XG5cdFx0bGV0IG1vdmVZID0gKHRoaXMuaGVpZ2h0TWFwVW5pdHMgLSBuZXdIZWlnaHQpIC8gMjtcblxuXHRcdHRoaXMudG9wTGVmdCA9IG5ldyBQb2ludDJEKHRoaXMudG9wTGVmdC54ICsgbW92ZVgsIHRoaXMudG9wTGVmdC55ICsgbW92ZVkpO1xuXG5cdFx0dGhpcy53aWR0aE1hcFVuaXRzID0gbmV3V2lkdGg7XG5cdFx0dGhpcy5oZWlnaHRNYXBVbml0cyA9IG5ld0hlaWdodDtcblx0fVxuXG5cdHpvb21BYm91dCh4UmVsYXRpdmU6IG51bWJlciwgeVJlbGF0aXZlOiBudW1iZXIsIHpvb206IG51bWJlcil7XG5cblx0XHRsZXQgeERpZmYgPSAwLjUgLSB4UmVsYXRpdmU7XG5cdFx0bGV0IHlEaWZmID0gMC41IC0geVJlbGF0aXZlO1xuXG5cdFx0dmFyIHhNb3ZlID0geERpZmYgKiB0aGlzLndpZHRoTWFwVW5pdHM7XG5cdFx0dmFyIHlNb3ZlID0geURpZmYgKiB0aGlzLmhlaWdodE1hcFVuaXRzO1xuXG5cdFx0dGhpcy50b3BMZWZ0ID0gbmV3IFBvaW50MkQodGhpcy50b3BMZWZ0LnggLSB4TW92ZSwgdGhpcy50b3BMZWZ0LnkgLSB5TW92ZSk7XG5cblx0XHR0aGlzLnpvb21WaWV3KHpvb20pO1xuXG5cdFx0eE1vdmUgPSB4RGlmZiAqIHRoaXMud2lkdGhNYXBVbml0cztcblx0XHR5TW92ZSA9IHlEaWZmICogdGhpcy5oZWlnaHRNYXBVbml0cztcblxuXHRcdHRoaXMudG9wTGVmdCA9IG5ldyBQb2ludDJEKHRoaXMudG9wTGVmdC54ICsgeE1vdmUsIHRoaXMudG9wTGVmdC55ICsgeU1vdmUpO1xuXG5cdH1cblxuXHRnZXREaW1lbnNpb25zKCl7XG5cdFx0cmV0dXJuIG5ldyBQb2ludDJEKHRoaXMud2lkdGhNYXBVbml0cywgdGhpcy5oZWlnaHRNYXBVbml0cyk7XG5cdH1cblxufSIsImltcG9ydCB7IFRpbGVMYXllciB9IGZyb20gXCIuL3RpbGVcIjtcblxuZXhwb3J0IGNsYXNzIFVuaXRzIHtcblxuXHRzdGF0aWMgcmVhZG9ubHkgV2ViV1UgPSBuZXcgVW5pdHMoXCJNZXJjYXRvciBXZWIgV29ybGQgVW5pdHNcIik7XG5cblx0Y29uc3RydWN0b3IobmFtZTogc3RyaW5nKXt9XG5cbn1cbi8qKlxuICBBIHdvcmxkIGlzIHRoZSBiYXNlIHRoYXQgYWxsIG90aGVyIGVsZW1lbnRzIG9yaWVudGF0ZSBmcm9tIFxuKiovXG5leHBvcnQgY2xhc3MgV29ybGQyRCB7XG5cblx0cHJpdmF0ZSB0aWxlTGF5ZXJzOiBBcnJheTxUaWxlTGF5ZXI+ID0gW107XG5cdFxuXHRjb25zdHJ1Y3Rvcigpe31cblxuICAgIGFkZFRpbGVMYXllcih0aWxlTGF5ZXI6IFRpbGVMYXllcik6IG51bWJlciB7XG4gICAgXHRyZXR1cm4gdGhpcy50aWxlTGF5ZXJzLnB1c2godGlsZUxheWVyKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBUaWxlLCBUaWxlTGF5ZXIgfSBmcm9tIFwiLi4vZ2VvbS90aWxlXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2FudmFzVGlsZSBleHRlbmRzIFRpbGUge1xuXG5cdGFic3RyYWN0IGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHNjYWxpbmdYOiBudW1iZXIsIHNjYWxpbmdZOiBudW1iZXIsIFxuXHRcdGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKTogdm9pZDtcblxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VTdHJ1Y3Qge1xuXG5cdHByZWZpeDogc3RyaW5nID0gXCJcIjtcblx0c3VmZml4OiBzdHJpbmcgPSBcIlwiO1xuXHR0aWxlRGlyOiBzdHJpbmcgPSBcImltYWdlcy9cIjtcblx0dmlzaWJsZTogYm9vbGVhbiA9IHRydWU7XG5cdG9wYWNpdHk6IG51bWJlciA9IDAuNztcblx0dGlsZVdpZHRoUHg6IG51bWJlciA9IDI1Njtcblx0dGlsZUhlaWdodFB4OiBudW1iZXIgPSAyNTY7XG5cdHdpZHRoTWFwVW5pdHM6IG51bWJlciA9IDE7XG5cdGhlaWdodE1hcFVuaXRzOiBudW1iZXIgPSAxOyBcblxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VUaWxlIGV4dGVuZHMgQ2FudmFzVGlsZSB7XG5cblx0cHJpdmF0ZSBpbWc6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cblx0Y29uc3RydWN0b3IocmVhZG9ubHkgeEluZGV4OiBudW1iZXIsIHJlYWRvbmx5IHlJbmRleDogbnVtYmVyLCBpbWFnZVNyYzogc3RyaW5nKSB7XG5cdFx0c3VwZXIoeEluZGV4LCB5SW5kZXgpO1xuXHRcdHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG5cdFx0dGhpcy5pbWcuc3JjID0gaW1hZ2VTcmM7XG5cdH07XG5cblx0cHJpdmF0ZSBkcmF3SW1hZ2UoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKXtcblx0XHRjdHguZHJhd0ltYWdlKHRoaXMuaW1nLCBjYW52YXNYLCBjYW52YXNZKTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKXtcblx0XHRpZiAodGhpcy5pbWcuY29tcGxldGUpIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5pbWcub25sb2FkID0gKGV2ZW50KSA9PiB7XG5cdFx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fTtcblxufVxuXG5leHBvcnQgY2xhc3MgU3RhdGljSW1hZ2Uge1xuXG5cdHByaXZhdGUgaW1nOiBIVE1MSW1hZ2VFbGVtZW50O1xuXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB4SW5kZXg6IG51bWJlciwgcHVibGljIHlJbmRleDogbnVtYmVyLCBcblx0XHRwdWJsaWMgc2NhbGluZ1g6IG51bWJlciwgcHVibGljIHNjYWxpbmdZOiBudW1iZXIsIHB1YmxpYyByb3RhdGlvbjogbnVtYmVyLCBcblx0XHRpbWFnZVNyYzogc3RyaW5nLCByZWFkb25seSBhbHBoYTogbnVtYmVyKSB7XG5cdFx0XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0fTtcblxuXHRwcml2YXRlIGRyYXdJbWFnZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgY2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpe1xuXG5cdFx0Ly9zY2FsaW5nWCA9IHNjYWxpbmdYICogdGhpcy5zY2FsaW5nO1xuXHRcdC8vc2NhbGluZ1kgPSBzY2FsaW5nWSAqIHRoaXMuc2NhbGluZztcblxuXHRcdC8vIGxldCBjb3NYID0gTWF0aC5jb3ModGhpcy5yb3RhdGlvbik7XG5cdFx0Ly8gbGV0IHNpblggPSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uKTtcblxuXHRcdGN0eC50cmFuc2xhdGUoY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0Y3R4LnJvdGF0ZSh0aGlzLnJvdGF0aW9uKTtcblx0XHRjdHguc2NhbGUodGhpcy5zY2FsaW5nWCwgdGhpcy5zY2FsaW5nWSk7XG5cdFx0Ly9jb25zb2xlLmxvZyhcInh5U2NhbGluZyBcIiArIHRoaXMuc2NhbGluZ1ggKyBcIiwgXCIgKyB0aGlzLnNjYWxpbmdZKTtcblx0XHRjdHguZ2xvYmFsQWxwaGEgPSB0aGlzLmFscGhhO1xuXG5cdFx0Ly8gY3R4LnRyYW5zZm9ybShjb3NYICogc2NhbGluZ1gsIHNpblggKiBzY2FsaW5nWSwgLXNpblggKiBzY2FsaW5nWCwgY29zWCAqIHNjYWxpbmdZLCBcblx0XHQvLyBcdGNhbnZhc1ggLyB0aGlzLnNjYWxpbmcsIGNhbnZhc1kgLyB0aGlzLnNjYWxpbmcpO1xuXG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZywgLSh0aGlzLmltZy53aWR0aC8yKSwgLSh0aGlzLmltZy5oZWlnaHQvMikpO1xuXHRcdFxuXHRcdGN0eC5zY2FsZSgxL3RoaXMuc2NhbGluZ1gsIDEvdGhpcy5zY2FsaW5nWSk7XG5cdFx0Y3R4LnJvdGF0ZSgtdGhpcy5yb3RhdGlvbik7XG5cdFx0Y3R4LnRyYW5zbGF0ZSgtY2FudmFzWCwgLWNhbnZhc1kpO1xuXHRcdGN0eC5nbG9iYWxBbHBoYSA9IDE7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBjYW52YXNYOiBudW1iZXIsIGNhbnZhc1k6IG51bWJlcil7XG5cdFx0aWYgKHRoaXMuaW1nLmNvbXBsZXRlKSB7XG5cdFx0XHR0aGlzLmRyYXdJbWFnZShjdHgsIGNhbnZhc1gsIGNhbnZhc1kpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuaW1nLm9ubG9hZCA9IChldmVudCkgPT4ge1xuXHRcdFx0XHR0aGlzLmltZy5jcm9zc09yaWdpbiA9IFwiQW5vbnltb3VzXCI7XG5cdFx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fTtcblxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VUaWxlTGF5ZXIgZXh0ZW5kcyBUaWxlTGF5ZXIge1xuXG5cdHJlYWRvbmx5IGltYWdlUHJvcGVydGllczogSW1hZ2VTdHJ1Y3Q7XG5cblx0Y29uc3RydWN0b3IoaW1hZ2VQcm9wZXJ0aWVzOiBJbWFnZVN0cnVjdCkge1xuXHRcdHN1cGVyKGltYWdlUHJvcGVydGllcy53aWR0aE1hcFVuaXRzLCBpbWFnZVByb3BlcnRpZXMuaGVpZ2h0TWFwVW5pdHMpO1xuXHRcdHRoaXMuaW1hZ2VQcm9wZXJ0aWVzID0gaW1hZ2VQcm9wZXJ0aWVzO1xuXHR9XG5cblx0LyoqXG5cdCAgbGVhdmUgY2FjaGluZyB1cCB0byB0aGUgYnJvd3NlclxuXHQqKi9cblx0Z2V0VGlsZSh4VW5pdHM6IG51bWJlciwgeVVuaXRzOiBudW1iZXIpOiBUaWxlIHtcblx0XHRsZXQgaW1hZ2VTcmMgPSB0aGlzLmltYWdlUHJvcGVydGllcy50aWxlRGlyICsgXG5cdFx0XHR0aGlzLmltYWdlUHJvcGVydGllcy5wcmVmaXggKyB4VW5pdHMgKyBcIl9cIiArIHlVbml0cyArIHRoaXMuaW1hZ2VQcm9wZXJ0aWVzLnN1ZmZpeDtcblx0XHRyZXR1cm4gbmV3IEltYWdlVGlsZSh4VW5pdHMsIHlVbml0cywgaW1hZ2VTcmMpO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNsYXNzIFNsaXBweVRpbGVMYXllciBleHRlbmRzIFRpbGVMYXllciB7XG5cblx0cmVhZG9ubHkgaW1hZ2VQcm9wZXJ0aWVzOiBJbWFnZVN0cnVjdDtcblx0cHJpdmF0ZSBiYXNlWCA9IDA7XG5cdHByaXZhdGUgYmFzZVkgPSAwO1xuXG5cdGNvbnN0cnVjdG9yKGltYWdlUHJvcGVydGllczogSW1hZ2VTdHJ1Y3QsIHByaXZhdGUgem9vbTogbnVtYmVyLFxuXHRcdHByaXZhdGUgeE9mZnNldDogbnVtYmVyLCBwcml2YXRlIHlPZmZzZXQ6IG51bWJlcikge1xuXG5cdFx0c3VwZXIoaW1hZ2VQcm9wZXJ0aWVzLndpZHRoTWFwVW5pdHMsIGltYWdlUHJvcGVydGllcy5oZWlnaHRNYXBVbml0cyk7XG5cdFx0dGhpcy5pbWFnZVByb3BlcnRpZXMgPSBpbWFnZVByb3BlcnRpZXM7XG5cdH1cblxuXHRwcml2YXRlIG9mZnNldHMoKXtcblx0XHRsZXQgem9vbUV4cCA9IE1hdGgucG93KDIsIHRoaXMuem9vbSk7XG5cdFx0dGhpcy5iYXNlWCA9IHhPZmZzZXQgLyB6b29tRXhwO1xuXHRcdHRoaXMuYmFzZVkgPSB5T2Zmc2V0IC8gem9vbUV4cDtcblx0fVxuXG5cdC8qKlxuXHQgIGxlYXZlIGNhY2hpbmcgdXAgdG8gdGhlIGJyb3dzZXJcblx0KiovXG5cdGdldFRpbGUoeFVuaXRzOiBudW1iZXIsIHlVbml0czogbnVtYmVyKTogVGlsZSB7XG5cdFx0XG5cdFx0bGV0IGltYWdlU3JjID0gdGhpcy5pbWFnZVByb3BlcnRpZXMudGlsZURpciArIHRoaXMuem9vbSArIFwiL1wiICsgKHRoaXMueE9mZnNldCt4VW5pdHMpICsgXCIvXCIgKyBcblx0XHRcdCArICh0aGlzLnlPZmZzZXQreVVuaXRzKSArIHRoaXMuaW1hZ2VQcm9wZXJ0aWVzLnN1ZmZpeDtcblx0XHRyZXR1cm4gbmV3IEltYWdlVGlsZSh4VW5pdHMsIHlVbml0cywgaW1hZ2VTcmMpO1xuXHR9XG5cbn1cbiIsImltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbmV4cG9ydCBjbGFzcyBHcmlkTGF5ZXIge1xuXG5cdHByaXZhdGUgZ3JpZFNwYWNpbmc6IG51bWJlcjtcblxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGdyaWRTcGFjaW5nOiBudW1iZXIpIHtcblx0XHR0aGlzLmdyaWRTcGFjaW5nID0gZ3JpZFNwYWNpbmc7XG5cdH1cblxuXHRzZXRHcmlkU3BhY2luZyhncmlkU3BhY2luZzogbnVtYmVyKXtcblx0XHR0aGlzLmdyaWRTcGFjaW5nID0gZ3JpZFNwYWNpbmc7XG5cdH1cblx0LyoqXG5cdCAgbGVhdmUgY2FjaGluZyB1cCB0byB0aGUgYnJvd3NlclxuXHQqKi9cblx0ZHJhdyh0b3BMZWZ0OiBQb2ludDJELCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IHZvaWQge1xuXHRcdGxldCBtaW5YID0gTWF0aC5mbG9vcih0b3BMZWZ0LngpO1xuXHRcdGxldCBtaW5ZID0gTWF0aC5mbG9vcih0b3BMZWZ0LnkpO1xuXG5cdFx0dGhpcy5jdHguZ2xvYmFsQWxwaGEgPSAwLjU7XG5cdFx0dGhpcy5jdHgudHJhbnNsYXRlKC0yNTYgKiB0b3BMZWZ0LngsIC0yNTYgKiB0b3BMZWZ0LnkpO1xuXHRcdC8vY29uc29sZS5sb2coXCJtaW5zIFwiICsgd2lkdGggKyBcIiwgXCIgKyBoZWlnaHQpO1xuXG5cdFx0bGV0IGxhc3RYID0gTWF0aC5jZWlsKHRvcExlZnQueCArIHdpZHRoKTtcblx0XHRsZXQgbGFzdFkgPSBNYXRoLmNlaWwodG9wTGVmdC55ICsgaGVpZ2h0KTtcblxuXHRcdHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gJ2JsdWUnO1xuXHRcdHRoaXMuY3R4LmZvbnQgPSAnNDhweCBzZXJpZic7XG5cblx0XHRsZXQgeVplcm8gPSBtaW5ZICogdGhpcy5ncmlkU3BhY2luZyAqIDI1Njtcblx0XHRsZXQgeU1heCA9IGxhc3RZICogdGhpcy5ncmlkU3BhY2luZyAqIDI1Njtcblx0XHRsZXQgeEp1bXAgPSB0aGlzLmdyaWRTcGFjaW5nICogMjU2O1xuXG5cdFx0bGV0IHhaZXJvID0gbWluWCAqIHRoaXMuZ3JpZFNwYWNpbmcgKiAyNTY7XG5cdFx0bGV0IHhNYXggPSBsYXN0WCAqIHRoaXMuZ3JpZFNwYWNpbmcgKiAyNTY7XG5cdFx0bGV0IHlKdW1wID0gdGhpcy5ncmlkU3BhY2luZyAqIDI1NjtcblxuXHRcdHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgIFx0Ly90aGlzLmN0eC5jbGVhclJlY3QoeFplcm8sIHlaZXJvLCB4TWF4LCB5TWF4KTtcblxuXHRcdGZvciAodmFyIHggPSBtaW5YOyB4PGxhc3RYOyB4Kyspe1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImF0IFwiICsgbWluWCk7XG5cdFx0XHRsZXQgeE1vdmUgPSB4ICogeEp1bXA7XG5cdFx0XHR0aGlzLmN0eC5tb3ZlVG8oeE1vdmUsIHlaZXJvKTtcblx0XHRcdHRoaXMuY3R4LmxpbmVUbyh4TW92ZSwgeU1heCk7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgeSA9IG1pblk7IHk8bGFzdFk7IHkrKyl7XG5cdFx0XHRsZXQgeU1vdmUgPSB5ICogeUp1bXA7XG5cdFx0XHR0aGlzLmN0eC5tb3ZlVG8oeFplcm8sIHlNb3ZlKTtcblx0XHRcdHRoaXMuY3R4LmxpbmVUbyh4TWF4LCB5TW92ZSk7XG5cblx0XHRcdGZvciAodmFyIHggPSBtaW5YOyB4PGxhc3RYOyB4Kyspe1xuXHRcdFx0XHRsZXQgeE1vdmUgPSAoeCAtIDAuNSkgKiB4SnVtcDtcblx0XHRcdFx0eU1vdmUgPSAoeSAtIDAuNSkgKiB5SnVtcDtcblx0XHRcdFx0bGV0IHRleHQgPSBcIlwiICsgKHgtMSkgKyBcIiwgXCIgKyAoeS0xKTtcblx0XHRcdFx0dGhpcy5jdHguZmlsbFRleHQodGV4dCwgeE1vdmUsIHlNb3ZlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5jdHguc3Ryb2tlKCk7XG5cdFx0dGhpcy5jdHgudHJhbnNsYXRlKDI1NiAqIHRvcExlZnQueCwgMjU2ICogdG9wTGVmdC55KTtcblx0XHR0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IDE7XG5cdH1cblxuXG59IiwiaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tIFwiLi4vZ2VvbS92aWV3cG9ydFwiO1xuaW1wb3J0IHsgV29ybGQyRCB9IGZyb20gXCIuLi9nZW9tL3dvcmxkMmRcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBTdGF0aWNJbWFnZSwgSW1hZ2VUaWxlLCBJbWFnZVRpbGVMYXllciB9IGZyb20gXCIuL2NhbnZhc3RpbGVcIjtcbmltcG9ydCB7IEdyaWRMYXllciB9IGZyb20gXCIuL2dyaWRcIjtcblxuZXhwb3J0IGNsYXNzIFZpZXdDYW52YXMgZXh0ZW5kcyBWaWV3cG9ydCB7XG5cbiAgICBwcml2YXRlIHN0YXRpY0VsZW1lbnRzOiBBcnJheTxTdGF0aWNJbWFnZT4gPSBbXTtcbiAgICBwcml2YXRlIGltYWdlVGlsZUxheWVycyA9IFtdO1xuXG4gICAgcHJpdmF0ZSBncmlkTGF5ZXI6IEdyaWRMYXllcjtcblxuICAgIHByaXZhdGUgb2Zmc2NyZWVuOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgcHJpdmF0ZSB3aWR0aDogbnVtYmVyO1xuICAgIHByaXZhdGUgaGVpZ2h0OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcih0b3BMZWZ0OiBQb2ludDJELCBcbiAgICBcdHdpZHRoTWFwVW5pdHM6IG51bWJlciwgaGVpZ2h0TWFwVW5pdHM6IG51bWJlciwgcHJpdmF0ZSBncmlkOiBib29sZWFuLFxuICAgIFx0cHVibGljIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKSB7XG5cbiAgICBcdHN1cGVyKHRvcExlZnQsIHdpZHRoTWFwVW5pdHMsIGhlaWdodE1hcFVuaXRzKTtcblxuICAgICAgICB0aGlzLndpZHRoID0gY3R4LmNhbnZhcy5jbGllbnRXaWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBjdHguY2FudmFzLmNsaWVudEhlaWdodDtcblxuICAgICAgICB0aGlzLmN0eC5jYW52YXMud2lkdGggPSB0aGlzLndpZHRoO1xuICAgICAgICB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJvbnNjcmVlbiBcIiArIHRoaXMuY3R4LmNhbnZhcy53aWR0aCArIFwiLCBcIiArIHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQpO1xuXG4gICAgICAgIC8vY29uc3QgYyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG4gICAgICAgIGNvbnN0IGMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvZmZzY3JlZW5cIik7XG4gICAgICAgIGMud2lkdGggPSB0aGlzLndpZHRoO1xuICAgICAgICBjLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMub2Zmc2NyZWVuID0gPENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRD5jLmdldENvbnRleHQoXCIyZFwiKTtcblxuICAgICAgICBpZiAoZ3JpZClcbiAgICBcdCAgICB0aGlzLmdyaWRMYXllciA9IG5ldyBHcmlkTGF5ZXIodGhpcy5vZmZzY3JlZW4sIDEpO1xuICAgIH1cblxuICAgIGFkZFRpbGVMYXllcihpbWFnZVRpbGVMYXllcjogSW1hZ2VUaWxlTGF5ZXIpOiB2b2lkIHtcbiAgICBcdHRoaXMuaW1hZ2VUaWxlTGF5ZXJzLnB1c2goaW1hZ2VUaWxlTGF5ZXIpO1xuICAgIH1cblxuICAgIGFkZFN0YXRpY0VsZW1lbnQoc3RhdGljSW1hZ2U6IFN0YXRpY0ltYWdlKTogdm9pZCB7XG4gICAgXHR0aGlzLnN0YXRpY0VsZW1lbnRzLnB1c2goc3RhdGljSW1hZ2UpO1xuICAgIH1cblxuICAgIGdldFZpZXdTY2FsaW5nKHBpeGVsc1BlclVuaXQ6IG51bWJlcik6IFBvaW50MkQge1xuICAgIFx0bGV0IGRpbWVuc2lvbiA9IHRoaXMuZ2V0RGltZW5zaW9ucygpO1xuICAgIFx0bGV0IHZpZXdTY2FsaW5nWCA9IHRoaXMuY3R4LmNhbnZhcy5jbGllbnRXaWR0aCAvIGRpbWVuc2lvbi54IC8gcGl4ZWxzUGVyVW5pdDtcbiAgICBcdGxldCB2aWV3U2NhbGluZ1kgPSB0aGlzLmN0eC5jYW52YXMuY2xpZW50SGVpZ2h0IC8gZGltZW5zaW9uLnkgLyBwaXhlbHNQZXJVbml0O1xuICAgIFx0cmV0dXJuIG5ldyBQb2ludDJEKHZpZXdTY2FsaW5nWCwgdmlld1NjYWxpbmdZKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNjYWxlKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBcbiAgICAgICAgcGl4ZWxzUGVyVW5pdDogbnVtYmVyLCBkaW1lbnNpb246IFBvaW50MkQsIHJldmVyc2U6IGJvb2xlYW4pOiB2b2lkIHtcblxuICAgIFx0bGV0IHZpZXdTY2FsaW5nID0gdGhpcy5nZXRWaWV3U2NhbGluZyhwaXhlbHNQZXJVbml0KTtcblxuICAgIFx0aWYgKHJldmVyc2Upe1xuICAgIFx0XHRjdHguc2NhbGUoMS92aWV3U2NhbGluZy54LCAxL3ZpZXdTY2FsaW5nLnkpO1xuICAgIFx0fSBlbHNlIHtcbiAgICBcdFx0Y3R4LnNjYWxlKHZpZXdTY2FsaW5nLngsIHZpZXdTY2FsaW5nLnkpO1xuICAgIFx0fVxuICAgIFx0XG4gICAgfVxuXG4gICAgZHJhdygpOiB2b2lkIHtcbiAgICBcdGxldCBkaW1lbnNpb24gPSB0aGlzLmdldERpbWVuc2lvbnMoKTtcblxuICAgICAgICBsZXQgbG9jYWxDb250ZXh0ID0gdGhpcy5vZmZzY3JlZW47XG5cbiAgICBcdGxvY2FsQ29udGV4dC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXG4gICAgXHRmb3IgKGxldCB2YWx1ZSBvZiB0aGlzLmltYWdlVGlsZUxheWVycyl7XG4gICAgXHRcdGlmICh2YWx1ZS5pbWFnZVByb3BlcnRpZXMudmlzaWJsZSkge1xuXG4gICAgICAgICAgICAgICAgbG9jYWxDb250ZXh0Lmdsb2JhbEFscGhhID0gdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLm9wYWNpdHk7XG5cbiAgICAgICAgICAgICAgICBsZXQgc2NhbGVkVGlsZVdpZHRoID0gdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVXaWR0aFB4IC8gXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLmltYWdlUHJvcGVydGllcy53aWR0aE1hcFVuaXRzO1xuXG4gICAgICAgICAgICAgICAgbGV0IHNjYWxlZFRpbGVIZWlnaHQgPSB2YWx1ZS5pbWFnZVByb3BlcnRpZXMudGlsZUhlaWdodFB4IC8gXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLmltYWdlUHJvcGVydGllcy5oZWlnaHRNYXBVbml0cztcblxuICAgIFx0XHRcdHRoaXMuc2NhbGUobG9jYWxDb250ZXh0LCBzY2FsZWRUaWxlV2lkdGgsIGRpbWVuc2lvbiwgZmFsc2UpO1xuXG4gICAgICAgICAgICAgICAgbGV0IHggPSB0aGlzLnRvcExlZnQueCAvIDI7XG4gICAgICAgICAgICAgICAgbGV0IHkgPSB0aGlzLnRvcExlZnQueSAvIDI7XG4gICAgICAgICAgICAgICAgXG4gICAgXHRcdFx0bGV0IHRpbGVzOiBBcnJheTxJbWFnZVRpbGU+ID0gdmFsdWUuZ2V0VGlsZXModGhpcy50b3BMZWZ0LCBcbiAgICBcdFx0XHRcdGRpbWVuc2lvbi54LCBcbiAgICAgICAgICAgICAgICAgICAgZGltZW5zaW9uLnkpO1xuXG4gICAgXHRcdFx0Zm9yIChsZXQgdGlsZSBvZiB0aWxlcyl7XG4gICAgXHRcdFx0XHR2YXIgdGlsZVggPSAxMjggKyAodGlsZS54SW5kZXggLSB4KSAqIFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVXaWR0aFB4O1xuICAgIFx0XHRcdFx0dmFyIHRpbGVZID0gLTEyOCArICh0aWxlLnlJbmRleCAtIHkpICogXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5pbWFnZVByb3BlcnRpZXMudGlsZUhlaWdodFB4O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJ0aWxlIGRyYXcgXCIgKyB0aWxlWCArIFwiLCBcIiArIHRpbGVZKTtcbiAgICBcdFx0XHRcdHRpbGUuZHJhdyhsb2NhbENvbnRleHQsIHRpbGVYLCB0aWxlWSk7XG4gICAgXHRcdFx0fVxuXG4gICAgXHRcdFx0dGhpcy5zY2FsZShsb2NhbENvbnRleHQsIHNjYWxlZFRpbGVXaWR0aCwgZGltZW5zaW9uLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBsb2NhbENvbnRleHQuZ2xvYmFsQWxwaGEgPSAxO1xuICAgIFx0XHR9XG4gICAgXHR9XG5cbiAgICBcdGZvciAobGV0IHZhbHVlIG9mIHRoaXMuc3RhdGljRWxlbWVudHMpe1xuICAgIFx0XHQvLzI1NiBweCBpcyAxIG1hcCB1bml0XG5cdFx0XHRsZXQgdGlsZVNjYWxpbmdYID0gMjU2O1xuXHRcdFx0bGV0IHRpbGVTY2FsaW5nWSA9IDI1NjtcblxuICAgIFx0XHR0aGlzLnNjYWxlKGxvY2FsQ29udGV4dCwgMjU2LCBkaW1lbnNpb24sIGZhbHNlKTtcblxuICAgIFx0XHRsZXQgaW1hZ2VYID0gKHZhbHVlLnhJbmRleCAtIHRoaXMudG9wTGVmdC54KSAqIHRpbGVTY2FsaW5nWDtcbiAgICBcdFx0bGV0IGltYWdlWSA9ICh2YWx1ZS55SW5kZXggLSB0aGlzLnRvcExlZnQueSkgKiB0aWxlU2NhbGluZ1k7XG5cbiAgICBcdFx0dmFsdWUuZHJhdyhsb2NhbENvbnRleHQsIGltYWdlWCwgaW1hZ2VZKTtcbiAgICBcdFx0dGhpcy5zY2FsZShsb2NhbENvbnRleHQsIDI1NiwgZGltZW5zaW9uLCB0cnVlKTtcblxuICAgIFx0fVxuXG4gICAgICAgIGlmICh0aGlzLmdyaWQpe1xuICAgICAgICAgICAgdGhpcy5zY2FsZShsb2NhbENvbnRleHQsIDI1NiwgZGltZW5zaW9uLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLmdyaWRMYXllci5kcmF3KHRoaXMudG9wTGVmdCwgZGltZW5zaW9uLngsIGRpbWVuc2lvbi55KTtcbiAgICAgICAgICAgIHRoaXMuc2NhbGUobG9jYWxDb250ZXh0LCAyNTYsIGRpbWVuc2lvbiwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICBcdFxuICAgICAgICBsZXQgaW1hZ2VEYXRhOiBJbWFnZURhdGEgPSBsb2NhbENvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImltYWdlIGRhdGEgXCIsIGltYWdlRGF0YSk7XG4gICAgICAgIHRoaXMuY3R4LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuXG4gICAgICAgIHRoaXMuZHJhd0NlbnRyZSh0aGlzLmN0eCk7XG5cbiAgICB9XG5cbiAgICBkcmF3Q2VudHJlKGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCl7XG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIGNvbnRleHQuZ2xvYmFsQWxwaGEgPSAwLjM7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLndpZHRoLzIsIDYvMTYqdGhpcy5oZWlnaHQpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyh0aGlzLndpZHRoLzIsIDEwLzE2KnRoaXMuaGVpZ2h0KTtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8oNy8xNip0aGlzLndpZHRoLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oOS8xNip0aGlzLndpZHRoLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgV29ybGQyRCB9IGZyb20gXCIuL2dlb20vd29ybGQyZFwiO1xuaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tIFwiLi9nZW9tL3ZpZXdwb3J0XCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBTdGF0aWNJbWFnZSwgSW1hZ2VUaWxlTGF5ZXIsIEltYWdlU3RydWN0LCBTbGlwcHlUaWxlTGF5ZXIgfSBmcm9tIFwiLi9ncmFwaGljcy9jYW52YXN0aWxlXCI7XG5pbXBvcnQgeyBWaWV3Q2FudmFzIH0gZnJvbSBcIi4vZ3JhcGhpY3Mvdmlld2NhbnZhc1wiO1xuaW1wb3J0IHsgWm9vbUNvbnRyb2xsZXIsIFBhbkNvbnRyb2xsZXIgfSBmcm9tIFwiLi91aS9tYXBDb250cm9sbGVyXCI7XG5pbXBvcnQgeyBJbWFnZUNvbnRyb2xsZXIgfSBmcm9tIFwiLi91aS9pbWFnZUNvbnRyb2xsZXJcIjtcblxubGV0IHNpbXBsZVdvcmxkID0gbmV3IFdvcmxkMkQoKTtcblxuLy8gbGV0IGxheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuLy8gbGF5ZXJQcm9wZXJ0aWVzLnByZWZpeCA9IFwiXCI7XG4vLyBsYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCIucG5nXCI7XG5cbi8vIGxldCByb2FkTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG4vLyByb2FkTGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwiYi5wbmdcIjtcblxuLy8gbGV0IHNlbnRpbmVsTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG4vLyBzZW50aW5lbExheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImwuanBlZ1wiO1xuXG4vLyBsZXQgc2VudGluZWxUZXJyYWluTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG4vLyBzZW50aW5lbFRlcnJhaW5MYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCJ0LmpwZWdcIjtcblxubGV0IGxpZmZleUxheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xubGlmZmV5TGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwibGlmZmV5LmpwZWdcIjtcbmxpZmZleUxheWVyUHJvcGVydGllcy50aWxlRGlyID0gXCJpbWFnZXMvbGlmZmV5L1wiO1xuXG5sZXQgbGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbmxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwibGlmZmV5LnBuZ1wiO1xubGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMub3BhY2l0eSA9IDE7XG5saWZmZXlMYWJlbExheWVyUHJvcGVydGllcy50aWxlRGlyID0gXCJpbWFnZXMvbGlmZmV5L1wiO1xubGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMudmlzaWJsZSA9IHRydWU7XG5cbmxldCBzbGlwcHlMYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbnNsaXBweUxheWVyUHJvcGVydGllcy50aWxlRGlyID0gXCJpbWFnZXMvcXRpbGUvZHVibGluL1wiO1xuc2xpcHB5TGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwiLnBuZ1wiO1xubGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMub3BhY2l0eSA9IC40O1xuc2xpcHB5TGF5ZXJQcm9wZXJ0aWVzLndpZHRoTWFwVW5pdHMgPSAyO1xuc2xpcHB5TGF5ZXJQcm9wZXJ0aWVzLmhlaWdodE1hcFVuaXRzID0gMjtcblxuXG4vLyBsZXQgYmFzZUxheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKGxheWVyUHJvcGVydGllcyk7XG4vLyBsZXQgc2VudGluZWxMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihzZW50aW5lbExheWVyUHJvcGVydGllcyk7XG4vLyBsZXQgcm9hZExheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKHJvYWRMYXllclByb3BlcnRpZXMpO1xuLy8gbGV0IHRlcnJhaW5MYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihzZW50aW5lbFRlcnJhaW5MYXllclByb3BlcnRpZXMpO1xuXG5sZXQgbGlmZmV5U2VudGluZWxMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihsaWZmZXlMYXllclByb3BlcnRpZXMpO1xubGV0IGxpZmZleUxhYmVsTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIobGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMpO1xuXG5sZXQgc2xpcHB5VGlsZUxheWVyID0gbmV3IFNsaXBweVRpbGVMYXllcihzbGlwcHlMYXllclByb3BlcnRpZXMsIDE2LCAzMTYyOCwgMjEyNDIpO1xuXG5sZXQgZG9saWVySW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMi4yNCwgMS44NywgLjQzLCAuNDMsIC0wLjA2LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDE3UltTVkMyXS5qcGdcIiwgLjcpO1xuXG5sZXQgbWFyeUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0uOTYsIC0uNTksIC40MSwgLjQyLCAtMC4zMjUsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDJyXzJbU1ZDMl0gKDEpLnBuZ1wiLCAwLjcpO1xuXG5sZXQgdHJpbml0eUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDEuOTksIDMuNTksIC40MywgLjQzLCAwLjE1LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDE5UltTVkMyXS5qcGdcIiwgLjcpO1xuXG5sZXQgcG9vbGJlZ0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDMuMzQsIDEuNjI1LCAuNDA1LCAuNDMsIDAuMDUsXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAxOFJbU1ZDMl0uanBnXCIsIC43KTtcblxubGV0IGFiYmV5SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMi4zOSwgMC4wMzUsIC40MTUsIC40MzUsIC0uMjUsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDhyW1NWQzJdLmpwZ1wiLCAuNyk7XG5cbmxldCBidXNhcmFzSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMy40OSwgLTAuMjQsIC40MSwgLjQyNSwgLS4yNiwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwOXJbU1ZDMl0uanBnXCIsIC43KTtcblxubGV0IGxvd2VyYWJiZXlJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgxLjI5NSwgMC4zNzc2LCAuNDI1LCAuNDM1LCAtLjIzLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDA3cltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IGRhbWVJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgwLjk4LCAyLjMxNSwgLjQxLCAuNDI4LCAtMC4wOTUsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMTZyXzJbU1ZDMl0ucG5nXCIsIDAuNyk7XG5cbmxldCBjdXN0b21JbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSg1LjIxLCAtLjI0NSwgLjQyLCAuNDQsIDAuMDMsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMTByXzJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBtYW5vckltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDYuMzYsIDAuMDI1LCAuNDE1LCAuNDM1LCAwLjExLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDExcltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IHNhY2t2aWxsZUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDEuMjksIC0xLjI4LCAuNDYsIC40MiwgLTAuMjY1LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDA0cltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IGdyZWF0SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLjE5LCAtMC43MDUsIC40LCAuNDIsIC0uNTEsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDNyW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgbG93ZXJvcm1vbmRJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgwLjE2LCAwLjcxLCAuNDA1LCAuNDQsIC0wLjIwNSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwNnJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBzdGVwaGVuc0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDEuNzI1LCA0Ljk0NSwgLjIwNSwgLjIxNSwgMC4yMDUsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMjBSW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgc3RtYXJ5c0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0xLjA1NSwgMS4wMiwgLjQzLCAuNDE1LCAtMC4yMSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwNXJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBzdGVhbUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDguMTQ1LCAwLjI2NSwgLjgxNSwgLjkyLCAwLjEyLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDEycl8xW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgZmlmdGVlbkltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC00LCAyLjcsIDAuNCwgLjQsIC0xLjQsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMTVyXzJbU1ZDMl0ucG5nXCIsIDAuNyk7XG5cbmxldCBoZW5yaWV0dGFJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMi4zNTUsIC0yLjQzLCAwLjYxLCAwLjYxLCAwLjA1LCBcblx0XCJpbWFnZXMvaGVucmlldHRhLnBuZ1wiLCAwLjcpO1xuXG5sZXQgZm91cmNvdXJ0c0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0zLjI4LCAxLjc3LCAwLjU1LCAwLjU1LCAtMC4wMywgXG5cdFwiaW1hZ2VzL2ZvdXJjb3VydHMucG5nXCIsIDEpO1xuXG5sZXQgbWljaGFuc0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0zLjg4LCAwLjcsIDAuMzIsIDAuMzIsIC0wLjAzLCBcblx0XCJpbWFnZXMvbWljaGFucy5wbmdcIiwgMSk7XG5cbmxldCB0aGVjYXN0bGVJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMC44NywgMy40OCwgMC40OCwgMC41NiwgLTAuMTE1LCBcblx0XCJpbWFnZXMvdGhlY2FzdGxlLnBuZ1wiLCAxKTtcblxubGV0IG5naXJlbGFuZEltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDQuNTgsIDQuOTIsIDAuMzYsIDAuNDYsIC0wLjA4NSwgXG5cdFwiaW1hZ2VzL25naXJlbGFuZC5wbmdcIiwgMSk7XG5cblxuXG5sZXQgYmx1ZWNvYXRzSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTYuNjE5LCAtMC4xNjUsIDAuNCwgMC40LCAtMC4wNSwgXG5cdFwiaW1hZ2VzL2JsdWVjb2F0cy5wbmdcIiwgMC43KTtcblxubGV0IGh1Z2hsYW5lSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMC4xMSwgLTMuMjcsIDAuNCwgMC40LCAtMC4yMjUsIFxuXHRcImltYWdlcy9odWdobGFuZS5wbmdcIiwgMC43KTtcblxubGV0IG1vdW50am95SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMy4zMzUsIC01LjEzNSwgMC40LCAwLjQsIDAuMTcsIFxuXHRcImltYWdlcy9tb3VudGpveS5wbmdcIiwgMC43KTtcblxubGV0IGN1c3RvbXNJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSg0LjM5LCAwLjMyLCAwLjQzLCAwLjQzLCAtMC4wNSwgXG5cdFwiaW1hZ2VzL2N1c3RvbXNob3VzZS5wbmdcIiwgMC43KTtcblxubGV0IGxpYmVydHlJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgzLjQzLCAwLjAwOSwgMC40MywgMC40MywgLTAuMDUsIFxuXHRcImltYWdlcy9saWJlcnR5LnBuZ1wiLCAwLjcpO1xuXG5sZXQgY3Jvc3NQb2RkbGUgPSBuZXcgU3RhdGljSW1hZ2UoLTIuODQ2LCA2LjEyNSwgLjE5OSwgLjIwNSwgLTAuMDI1LCBcblx0XCJpbWFnZXMvd3NjLW1hcHMtNDMzLTIuanBnXCIsIDAuNyk7XG5cbmxldCBwYXRyaWNrc0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0yLjI3LCA1Ljk1LCAuNCwgLjQsIDAuMDM1LCBcblx0XCJpbWFnZXMvd3NjLW1hcHMtMTg0LTEtZnJvbnQuanBnXCIsIDAuNik7XG5cbmxldCBjbG9ubWVsSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMS44NDUsIDguMTIsIC44MywgLjgzLCAtMi43MjUsIFxuXHRcImltYWdlcy93c2MtbWFwcy00NjctMDIucG5nXCIsIDAuNyk7XG5cbmxldCBicm9hZHN0b25lSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTIuNjEsIC0wLjA1NSwgMS40NTUsIDEuNDU1LCAxLjU2NSwgXG5cdFwiaW1hZ2VzL3dzYy1tYXBzLTA3Mi5wbmdcIiwgMC43KTtcblxubGV0IHBhcmxpYW1lbnRJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMC45LCAyLjY3LCAuNSwgLjUsIC0zLjMyLCBcblx0XCJpbWFnZXMvd3NjLW1hcHMtMDg4LTEucG5nXCIsIDAuNyk7XG5cbmxldCBjdXRwdXJzZUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0zLjg4NSwgMy40MywgLjUzNSwgLjU0NSwgLTAuMDc0LCBcblx0XCJpbWFnZXMvd3NjLW1hcHMtMTA2LTEuanBnXCIsIDAuNyk7XG5cbmxldCBjdXRwYXRyaWNrSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTIuOTgsIDQuMzIsIDEuNTMsIDEuNTMsIC0wLjAyNSwgXG5cdFwiaW1hZ2VzL1dTQy1NYXBzLTc1Ny5wbmdcIiwgMC43KTtcblxubGV0IGN1dHBhdHJpY2tPdmVybGF5SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTIuOTgsIDQuMzIsIDEuNTMsIDEuNTMsIC0wLjAyNSwgXG5cdFwiaW1hZ2VzL1dTQy1NYXBzLTc1N19vdmVybGF5LnBuZ1wiLCAwLjcpO1xuXG5sZXQgdGhpbmdJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMi41LCAzLjYsIDEuMjIsIDEuMTYsIDAsIFxuXHRcImltYWdlcy9JTUdfMDY0Ni5wbmdcIiwgMC40KTtcblxubGV0IGJsdWVjb2F0SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTMuNDM1LCAtMS45OTUsIDIuMzksIDIuMzU1LCAwLCBcblx0XCJpbWFnZXMvYmx1ZWNvYXQucG5nXCIsIDAuNCk7XG5cbmxldCBydXRsYW5kSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMi4zMiwgLTAuNzcsIDIuMDE1LCAyLjAxNSwgMCwgXG5cdFwiaW1hZ2VzL3J1dGxhbmQucG5nXCIsIDAuNyk7XG5cbmxldCBtYXRlckltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDIuMTYsIC01LjQyLCAyLjAxNSwgMi4wMTUsIDAsIFxuXHRcImltYWdlcy9tYXRlci5wbmdcIiwgMC43KTtcblxubGV0IHRvd25zZW5kSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoNC41NzUsIDMuOTk1LCAyLjAzNSwgMi4wMzUsIDAsIFxuXHRcImltYWdlcy90b3duc2VuZC5wbmdcIiwgMC43KTtcblxubGV0IGNhc3RsZUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0zLjUxLCAyLjM3NSwgMS45ODUsIDEuOTk1LCAwLCBcblx0XCJpbWFnZXMvY2FzdGxlLnBuZ1wiLCAwLjQpO1xuXG5sZXQgZ3JhbmRJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgwLjc1NSwgMy4yLCAuNiwgLjYsIDEuMjM1LCBcImltYWdlcy93c2MtbWFwcy0zMzQucG5nXCIsIDAuNCk7XG5cbmxldCB0b3RhbEltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDQuNDg1LCAtMS44NzUsIDcuNDY1LCA3LjM1LCAwLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDAxcltTVkMyXS5qcGdcIiwgLjUpO1xuXG5sZXQgdG90YWxPdmVybGF5SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoNC40NSwgLTEuODQsIDMuODkzLCAzLjgyOSwgMCwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwMXJbU1ZDMl0ucG5nXCIsIC41KTtcblxuZnVuY3Rpb24gc2hvd01hcChkaXZOYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGNhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChkaXZOYW1lKTtcblxuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHRsZXQgdmlld0NhbnZhcyA9IG5ldyBWaWV3Q2FudmFzKG5ldyBQb2ludDJEKC04LC02KSwgOSwgNiwgZmFsc2UsIGN0eCk7XG5cdC8vIHZpZXdDYW52YXMuYWRkVGlsZUxheWVyKGJhc2VMYXllcik7XG5cdC8vIHZpZXdDYW52YXMuYWRkVGlsZUxheWVyKHNlbnRpbmVsTGF5ZXIpO1xuXHR2aWV3Q2FudmFzLmFkZFRpbGVMYXllcihzbGlwcHlUaWxlTGF5ZXIpO1xuXHQvL3ZpZXdDYW52YXMuYWRkVGlsZUxheWVyKGxpZmZleVNlbnRpbmVsTGF5ZXIpO1xuXHQvL3ZpZXdDYW52YXMuYWRkVGlsZUxheWVyKGxpZmZleUxhYmVsTGF5ZXIpO1xuXG5cdC8vdmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHRvdGFsSW1hZ2UpO1xuXHQvL3ZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudCh0b3RhbE92ZXJsYXlJbWFnZSk7XG5cdC8vdmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGJyb2Fkc3RvbmVJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChwYXJsaWFtZW50SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoY3V0cHVyc2VJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChncmFuZEltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHJ1dGxhbmRJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChtYXRlckltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHRvd25zZW5kSW1hZ2UpO1xuXHQvL3ZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChjdXRwYXRyaWNrSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoY3V0cGF0cmlja092ZXJsYXlJbWFnZSk7XG5cblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KG1hcnlJbWFnZSk7XHRcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHN0ZXBoZW5zSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoZG9saWVySW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQodHJpbml0eUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHBvb2xiZWdJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChhYmJleUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGxvd2VyYWJiZXlJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChidXNhcmFzSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoc3RlYW1JbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChkYW1lSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoY3VzdG9tSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQobWFub3JJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChzYWNrdmlsbGVJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChncmVhdEltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGxvd2Vyb3Jtb25kSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoc3RtYXJ5c0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHBhdHJpY2tzSW1hZ2UpO1xuXHQvL3ZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChjcm9zc1BvZGRsZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChjbG9ubWVsSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQodGhpbmdJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChibHVlY29hdEltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGNhc3RsZUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGZpZnRlZW5JbWFnZSk7XG5cblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGhlbnJpZXR0YUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGZvdXJjb3VydHNJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChibHVlY29hdHNJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChodWdobGFuZUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KG1vdW50am95SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoY3VzdG9tc0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGxpYmVydHlJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChtaWNoYW5zSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQodGhlY2FzdGxlSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQobmdpcmVsYW5kSW1hZ2UpO1xuXG5cdGxldCBpbWFnZUNvbnRyb2xsZXIgPSBuZXcgSW1hZ2VDb250cm9sbGVyKHZpZXdDYW52YXMsIG1hdGVySW1hZ2UpO1xuXG5cdGNvbnN0IHBsdXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwbHVzXCIpO1xuXHRjb25zdCBtaW51cyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1pbnVzXCIpO1xuXG5cdGxldCBwYW5Db250cm9sID0gbmV3IFBhbkNvbnRyb2xsZXIodmlld0NhbnZhcywgY2FudmFzKTtcblx0bGV0IGNhbnZhc0NvbnRyb2wgPSBuZXcgWm9vbUNvbnRyb2xsZXIodmlld0NhbnZhcywgcGx1cywgbWludXMpO1xuXG5cdGNhbnZhc0NvbnRyb2wuYWRkWm9vbUxpc3RlbmVyKHBhbkNvbnRyb2wpO1xuXG5cdHZpZXdDYW52YXMuZHJhdygpO1xufVxuXG5mdW5jdGlvbiBzaG93KCl7XG5cdHNob3dNYXAoXCJjYW52YXNcIiwgXCJUeXBlU2NyaXB0XCIpO1xufVxuXG5pZiAoXG4gICAgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiIHx8XG4gICAgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09IFwibG9hZGluZ1wiICYmICFkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZG9TY3JvbGwpXG4pIHtcblx0c2hvdygpO1xufSBlbHNlIHtcblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgc2hvdyk7XG59XG5cbiIsImltcG9ydCB7IFN0YXRpY0ltYWdlIH0gZnJvbSBcIi4uL2dyYXBoaWNzL2NhbnZhc3RpbGVcIjtcbmltcG9ydCB7IFZpZXdDYW52YXMgfSBmcm9tIFwiLi4vZ3JhcGhpY3Mvdmlld2NhbnZhc1wiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuZXhwb3J0IGNsYXNzIEltYWdlQ29udHJvbGxlciB7XG5cbiAgICBjb25zdHJ1Y3Rvcih2aWV3Q2FudmFzOiBWaWV3Q2FudmFzLCByZWFkb25seSBzdGF0aWNJbWFnZTogU3RhdGljSW1hZ2UpIHtcbiAgICBcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMucHJlc3NlZCh2aWV3Q2FudmFzLCBlICBhcyBLZXlib2FyZEV2ZW50KSk7XG4gICAgfVxuXG4gICAgcHJlc3NlZCh2aWV3Q2FudmFzOiBWaWV3Q2FudmFzLCBldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIFx0Y29uc29sZS5sb2coXCJwcmVzc2VkXCIgKyBldmVudC50YXJnZXQgKyBcIiwgXCIgKyBldmVudC5rZXkpO1xuXG4gICAgXHRzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgIFx0XHRjYXNlIFwiYVwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2UueEluZGV4ID0gdGhpcy5zdGF0aWNJbWFnZS54SW5kZXggLSAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcImRcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnhJbmRleCA9IHRoaXMuc3RhdGljSW1hZ2UueEluZGV4ICsgMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJ3XCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS55SW5kZXggPSB0aGlzLnN0YXRpY0ltYWdlLnlJbmRleCAtIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwic1wiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2UueUluZGV4ID0gdGhpcy5zdGF0aWNJbWFnZS55SW5kZXggKyAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcImVcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnJvdGF0aW9uID0gdGhpcy5zdGF0aWNJbWFnZS5yb3RhdGlvbiAtIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwicVwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uucm90YXRpb24gPSB0aGlzLnN0YXRpY0ltYWdlLnJvdGF0aW9uICsgMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJ4XCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWCA9IHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1ggLSAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIlhcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdYID0gdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWCArIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwielwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1kgPSB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdZIC0gMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJaXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWSA9IHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1kgKyAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0ZGVmYXVsdDpcbiAgICBcdFx0XHQvLyBjb2RlLi4uXG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHR9XG4gICAgXHRjb25zb2xlLmxvZyhcImltYWdlIGF0OiBcIiArICB0aGlzLnN0YXRpY0ltYWdlLnhJbmRleCArIFwiLCBcIiArIHRoaXMuc3RhdGljSW1hZ2UueUluZGV4KTtcbiAgICBcdGNvbnNvbGUubG9nKFwiaW1hZ2Ugcm8gc2M6IFwiICsgIHRoaXMuc3RhdGljSW1hZ2Uucm90YXRpb24gKyBcIiwgXCIgKyB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdYICsgXCIsIFwiICsgdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWSk7XG4gICAgfTtcblxufTsiLCJpbXBvcnQgeyBWaWV3Q2FudmFzIH0gZnJvbSBcIi4uL2dyYXBoaWNzL3ZpZXdjYW52YXNcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbmFic3RyYWN0IGNsYXNzIE1vdXNlQ29udHJvbGxlciB7XG5cbiAgICBtb3VzZVBvc2l0aW9uKGV2ZW50OiBNb3VzZUV2ZW50LCB3aXRoaW46IEhUTUxFbGVtZW50KTogUG9pbnQyRCB7XG4gICAgICAgIGxldCBtX3Bvc3ggPSBldmVudC5jbGllbnRYICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0XG4gICAgICAgICAgICAgICAgICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQ7XG4gICAgICAgIGxldCBtX3Bvc3kgPSBldmVudC5jbGllbnRZICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3BcbiAgICAgICAgICAgICAgICAgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuXG4gICAgICAgIHZhciBlX3Bvc3ggPSAwO1xuICAgICAgICB2YXIgZV9wb3N5ID0gMDtcbiAgICAgICAgaWYgKHdpdGhpbi5vZmZzZXRQYXJlbnQpe1xuICAgICAgICAgICAgZG8geyBcbiAgICAgICAgICAgICAgICBlX3Bvc3ggKz0gd2l0aGluLm9mZnNldExlZnQ7XG4gICAgICAgICAgICAgICAgZV9wb3N5ICs9IHdpdGhpbi5vZmZzZXRUb3A7XG4gICAgICAgICAgICB9IHdoaWxlICh3aXRoaW4gPSA8SFRNTEVsZW1lbnQ+d2l0aGluLm9mZnNldFBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFBvaW50MkQobV9wb3N4IC0gZV9wb3N4LCBtX3Bvc3kgLSBlX3Bvc3kpO1xuICAgIH1cbiAgICBcbn1cblxuYWJzdHJhY3QgY2xhc3MgWm9vbUxpc3RlbmVyIHtcbiAgICBhYnN0cmFjdCB6b29tKGJ5OiBudW1iZXIpO1xufVxuXG5leHBvcnQgY2xhc3MgWm9vbUNvbnRyb2xsZXIgZXh0ZW5kcyBNb3VzZUNvbnRyb2xsZXIge1xuXG5cdHByaXZhdGUgbGlzdGVuZXJzOiBBcnJheTxab29tTGlzdGVuZXI+ID0gW107XG5cdHByaXZhdGUgem9vbSA9IDE7XG5cbiAgICBjb25zdHJ1Y3Rvcih2aWV3Q2FudmFzOiBWaWV3Q2FudmFzLCByZWFkb25seSB6b29tSW46IEhUTUxFbGVtZW50LCByZWFkb25seSB6b29tT3V0OiBIVE1MRWxlbWVudCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgXHR6b29tSW4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlOkV2ZW50KSA9PiB0aGlzLmNsaWNrZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzLCAuOTUpKTtcbiAgICBcdHpvb21PdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlOkV2ZW50KSA9PiB0aGlzLmNsaWNrZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzLCAxLjA1KSk7XG4gICAgXHR2aWV3Q2FudmFzLmN0eC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5jbGlja2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcywgLjc1KSk7XG4gICAgfVxuXG4gICAgYWRkWm9vbUxpc3RlbmVyKHpvb21MaXN0ZW5lcjogWm9vbUxpc3RlbmVyKXtcbiAgICBcdHRoaXMubGlzdGVuZXJzLnB1c2goem9vbUxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICBjbGlja2VkKGV2ZW50OiBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzOiBWaWV3Q2FudmFzLCBieTogbnVtYmVyKSB7XG5cbiAgICBcdGNvbnNvbGUubG9nKFwiY2xpY2tlZFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQudHlwZSk7XG5cbiAgICBcdGNvbnNvbGUubG9nKFwibGlzdGVuZXJzIFwiICsgdGhpcy5saXN0ZW5lcnMubGVuZ3RoKTtcblxuICAgICAgICBzd2l0Y2goZXZlbnQudHlwZSl7XG4gICAgICAgICAgICBjYXNlIFwiZGJsY2xpY2tcIjpcbiAgICAgICAgICAgICAgICBsZXQgY2FudmFzID0gdmlld0NhbnZhcy5jdHguY2FudmFzO1xuXG4gICAgICAgICAgICAgICAgaWYgIChldmVudC5jdHJsS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGJ5ID0gMSAvIGJ5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsZXQgbVhZID0gdGhpcy5tb3VzZVBvc2l0aW9uKGV2ZW50LCB2aWV3Q2FudmFzLmN0eC5jYW52YXMpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZpZXdDYW52YXMuem9vbUFib3V0KG1YWS54IC8gY2FudmFzLmNsaWVudFdpZHRoLCBtWFkueSAvIGNhbnZhcy5jbGllbnRIZWlnaHQsIGJ5KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdmlld0NhbnZhcy56b29tVmlldyhieSk7XG4gICAgICAgIH1cblxuICAgIFx0dGhpcy56b29tID0gdGhpcy56b29tICogYnk7XG4gICAgXHRmb3IgKGxldCB2YWx1ZSBvZiB0aGlzLmxpc3RlbmVycyl7XG4gICAgXHRcdHZhbHVlLnpvb20odGhpcy56b29tKTtcbiAgICBcdH1cblxuICAgIFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgfTtcblxufTtcblxuZXhwb3J0IGNsYXNzIFBhbkNvbnRyb2xsZXIgZXh0ZW5kcyBab29tTGlzdGVuZXIge1xuXG5cdHByaXZhdGUgeFByZXZpb3VzOiBudW1iZXI7XG5cdHByaXZhdGUgeVByZXZpb3VzOiBudW1iZXI7XG5cdHByaXZhdGUgcmVjb3JkOiBib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgYmFzZU1vdmU6IG51bWJlciA9IDI1Njtcblx0cHJpdmF0ZSBtb3ZlOiBudW1iZXIgPSAyNTY7XG5cbiAgICBjb25zdHJ1Y3Rvcih2aWV3Q2FudmFzOiBWaWV3Q2FudmFzLCByZWFkb25seSBkcmFnRWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgICBcdHN1cGVyKCk7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcykpO1xuICAgIFx0ZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdDYW52YXMpKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcykpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLnJlY29yZCA9IGZhbHNlKTtcbiAgICAgICAgdmlld0NhbnZhcy5jdHguY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCAoZTogRXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy53aGVlbChlIGFzIFdoZWVsRXZlbnQsIHZpZXdDYW52YXMpKTtcbiAgICB9XG5cbiAgICB6b29tKGJ5OiBudW1iZXIpe1xuICAgIFx0Y29uc29sZS5sb2coXCJ6b29tIGJ5IFwiICsgYnkpO1xuICAgIFx0dGhpcy5tb3ZlID0gdGhpcy5iYXNlTW92ZSAvIGJ5O1xuICAgIH1cblxuXG4gICAgd2hlZWwoZXZlbnQ6IFdoZWVsRXZlbnQsIHZpZXdDYW52YXM6IFZpZXdDYW52YXMpIHtcblxuICAgICAgICAvL2NvbnNvbGUubG9nKFwid2hlZWxcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LnR5cGUpO1xuXG4gICAgICAgIGxldCB4RGVsdGEgPSBldmVudC5kZWx0YVggLyB0aGlzLm1vdmU7XG4gICAgICAgIGxldCB5RGVsdGEgPSBldmVudC5kZWx0YVkgLyB0aGlzLm1vdmU7XG5cbiAgICAgICAgbGV0IG5ld1RvcExlZnQgPSBuZXcgUG9pbnQyRCh2aWV3Q2FudmFzLnRvcExlZnQueCAtIHhEZWx0YSwgXG4gICAgICAgICAgICB2aWV3Q2FudmFzLnRvcExlZnQueSAtIHlEZWx0YSk7XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhcInRvcGxlZnQgXCIgKyBuZXdUb3BMZWZ0KTtcblxuICAgICAgICB2aWV3Q2FudmFzLm1vdmVWaWV3KG5ld1RvcExlZnQpO1xuICAgICAgICB2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICB9XG5cblxuICAgIGRyYWdnZWQoZXZlbnQ6IE1vdXNlRXZlbnQsIHZpZXdDYW52YXM6IFZpZXdDYW52YXMpIHtcblxuICAgICAgICBsZXQgY2FudmFzID0gdmlld0NhbnZhcy5jdHguY2FudmFzO1xuXG4gICAgXHRzd2l0Y2goZXZlbnQudHlwZSl7XG4gICAgXHRcdGNhc2UgXCJtb3VzZWRvd25cIjpcbiAgICBcdFx0XHR0aGlzLnJlY29yZCA9IHRydWU7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJtb3VzZXVwXCI6XG4gICAgXHRcdFx0dGhpcy5yZWNvcmQgPSBmYWxzZTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0ZGVmYXVsdDpcbiAgICBcdFx0XHRpZiAodGhpcy5yZWNvcmQpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgeERlbHRhID0gKGV2ZW50LmNsaWVudFggLSB0aGlzLnhQcmV2aW91cykgLyB0aGlzLm1vdmU7XG4gICAgICAgICAgICAgICAgICAgIGxldCB5RGVsdGEgPSAoZXZlbnQuY2xpZW50WSAtIHRoaXMueVByZXZpb3VzKSAvIHRoaXMubW92ZTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3VG9wTGVmdCA9IG5ldyBQb2ludDJEKHZpZXdDYW52YXMudG9wTGVmdC54IC0geERlbHRhLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdDYW52YXMudG9wTGVmdC55IC0geURlbHRhKTtcblxuICAgICAgICAgICAgICAgICAgICB2aWV3Q2FudmFzLm1vdmVWaWV3KG5ld1RvcExlZnQpO1xuICAgICAgICAgICAgICAgICAgICB2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHR9XG4gICAgXHR9XG5cblx0XHR0aGlzLnhQcmV2aW91cyA9IGV2ZW50LmNsaWVudFg7XG5cdFx0dGhpcy55UHJldmlvdXMgPSBldmVudC5jbGllbnRZO1xuXG4gICAgfTtcblxuICAgIG1vdXNlUG9zaXRpb24oZXZlbnQ6IE1vdXNlRXZlbnQsIHdpdGhpbjogSFRNTEVsZW1lbnQpOiBQb2ludDJEIHtcbiAgICAgICAgbGV0IG1fcG9zeCA9IGV2ZW50LmNsaWVudFggKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnRcbiAgICAgICAgICAgICAgICAgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdDtcbiAgICAgICAgbGV0IG1fcG9zeSA9IGV2ZW50LmNsaWVudFkgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7XG5cbiAgICAgICAgdmFyIGVfcG9zeCA9IDA7XG4gICAgICAgIHZhciBlX3Bvc3kgPSAwO1xuICAgICAgICBpZiAod2l0aGluLm9mZnNldFBhcmVudCl7XG4gICAgICAgICAgICBkbyB7IFxuICAgICAgICAgICAgICAgIGVfcG9zeCArPSB3aXRoaW4ub2Zmc2V0TGVmdDtcbiAgICAgICAgICAgICAgICBlX3Bvc3kgKz0gd2l0aGluLm9mZnNldFRvcDtcbiAgICAgICAgICAgIH0gd2hpbGUgKHdpdGhpbiA9IDxIVE1MRWxlbWVudD53aXRoaW4ub2Zmc2V0UGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQyRChtX3Bvc3ggLSBlX3Bvc3gsIG1fcG9zeSAtIGVfcG9zeSk7XG4gICAgfVxuICAgIFxufTtcblxuIl19
