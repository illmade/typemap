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
var ShowTileLayer = /** @class */ (function (_super) {
    __extends(ShowTileLayer, _super);
    function ShowTileLayer(imageProperties) {
        var _this = _super.call(this, imageProperties.widthMapUnits, imageProperties.heightMapUnits) || this;
        _this.imageProperties = imageProperties;
        return _this;
    }
    return ShowTileLayer;
}(tile_1.TileLayer));
exports.ShowTileLayer = ShowTileLayer;
var ImageTileLayer = /** @class */ (function (_super) {
    __extends(ImageTileLayer, _super);
    function ImageTileLayer(imageProperties) {
        //super(imageProperties.widthMapUnits, imageProperties.heightMapUnits);
        return _super.call(this, imageProperties) || this;
        //this.imageProperties = imageProperties;
    }
    /**
      leave caching up to the browser
    **/
    ImageTileLayer.prototype.getTile = function (xUnits, yUnits) {
        var imageSrc = this.imageProperties.tileDir +
            this.imageProperties.prefix + xUnits + "_" + yUnits + this.imageProperties.suffix;
        return new ImageTile(xUnits - 1, yUnits + 1, imageSrc);
    };
    return ImageTileLayer;
}(ShowTileLayer));
exports.ImageTileLayer = ImageTileLayer;
var SlippyTileLayer = /** @class */ (function (_super) {
    __extends(SlippyTileLayer, _super);
    function SlippyTileLayer(imageProperties, zoom, xOffset, yOffset) {
        var _this = 
        //super(imageProperties.widthMapUnits, imageProperties.heightMapUnits);
        _super.call(this, imageProperties) || this;
        _this.zoom = zoom;
        _this.xOffset = xOffset;
        _this.yOffset = yOffset;
        _this.baseX = 0;
        _this.baseY = 0;
        return _this;
        //this.imageProperties = imageProperties;
    }
    SlippyTileLayer.prototype.offsets = function () {
        var zoomExp = Math.pow(2, this.zoom);
        this.baseX = this.xOffset / zoomExp;
        this.baseY = this.yOffset / zoomExp;
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
}(ShowTileLayer));
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
                console.log("stwh: " + scaledTileWidth + ", " + scaledTileHeight);
                this.scale(localContext, scaledTileWidth, dimension, false);
                var x = this.topLeft.x / value.imageProperties.widthMapUnits;
                var y = this.topLeft.y / value.imageProperties.heightMapUnits;
                var tiles = value.getTiles(this.topLeft, dimension.x, dimension.y);
                for (var _b = 0, tiles_1 = tiles; _b < tiles_1.length; _b++) {
                    var tile = tiles_1[_b];
                    var tileX = scaledTileWidth + (tile.xIndex - x) *
                        value.imageProperties.tileWidthPx;
                    var tileY = -scaledTileHeight + (tile.yIndex - y) *
                        value.imageProperties.tileHeightPx;
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
var stephensImage = new canvastile_1.StaticImage(1.725, 4.9, .205, .215, 0.195, "images/maps_145_b_4_(2)_f020R[SVC2].jpg", 0.6);
var stmarysImage = new canvastile_1.StaticImage(-1.055, 1.02, .43, .415, -0.21, "images/maps_145_b_4_(2)_f005r[SVC2].jpg", 0.7);
var steamImage = new canvastile_1.StaticImage(8.145, 0.265, .815, .92, 0.12, "images/maps_145_b_4_(2)_f012r_1[SVC2].jpg", 0.7);
var fifteenImage = new canvastile_1.StaticImage(-3.8, 2.85, 0.4, .4, -1.47, "images/maps_145_b_4_(2)_f015r_2[SVC2].png", 0.7);
var henriettaImage = new canvastile_1.StaticImage(-2.355, -2.43, 0.61, 0.61, 0.05, "images/henrietta.png", 0.7);
var matermisImage = new canvastile_1.StaticImage(-1.18, -6.4, 0.25, 0.32, 0.145, "images/matermis.png", 0.7);
var oconnellImage = new canvastile_1.StaticImage(-4.54, -13.55, 0.25, 0.32, 0, "images/oconnell.png", 0.7);
var fourcourtsImage = new canvastile_1.StaticImage(-3.28, 1.77, 0.55, 0.55, -0.03, "images/fourcourts.png", 1);
var michansImage = new canvastile_1.StaticImage(-3.88, 0.7, 0.32, 0.32, -0.03, "images/michans.png", 1);
var marketImage = new canvastile_1.StaticImage(-3.365, 3.79, 0.3, 0.3, 0.04, "images/market.png", 0.7);
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
var parliamentImage = new canvastile_1.StaticImage(-0.9, 2.67, .5, .5, -3.32, "images/wsc-maps-088-1.png", 0.7);
var cutpurseImage = new canvastile_1.StaticImage(-3.885, 3.43, .535, .545, -0.074, "images/wsc-maps-106-1.jpg", 0.7);
var cutpatrickOverlayImage = new canvastile_1.StaticImage(-2.98, 4.32, 1.53, 1.53, -0.025, "images/WSC-Maps-757_overlay.png", 0.7);
var broadstoneImage = new canvastile_1.StaticImage(-2.61, -0.055, .62, .62, 1.565, "images/wsc-maps-072-m.png", 0.9);
var broadstoneUpImage = new canvastile_1.StaticImage(-2.675, -6.23, 1.58, 1.58, 1.615, "images/wsc-maps-075-m2.png", 0.9);
var cutpatrickImage = new canvastile_1.StaticImage(-2.96, 4.375, .71499, .71499, -0.025, "images/wsc-maps-757-l.png", 0.7);
var barracksImage = new canvastile_1.StaticImage(-2.11, 2.87, 2.04, 1.945, -0.025, "images/wsc-maps-155-m.png", 0.4);
var jamesImage = new canvastile_1.StaticImage(-9.55, 3.95, .355, .355, -3.46, "images/wsc-maps-729-m.png", 0.5);
var belloImage = new canvastile_1.StaticImage(.995, 11.885, 1.2, 1.2, -2, "images/wsc-maps-142_m.png", 0.7);
var thingImage = new canvastile_1.StaticImage(-2.5, 3.6, 1.22, 1.16, 0, "images/IMG_0646.png", 0.4);
var portoImage = new canvastile_1.StaticImage(-1.7, 12.5, 1.52, 1.63, .54, "images/portobello.png", 0.4);
// let portoImage = new StaticImage(-0.3, 11.3, 1.4, 1.4, .3, 
// 	"images/portobello.png", 0.4);
var donnyImage = new canvastile_1.StaticImage(6, 13.01, 1.345, 1.73, .29, "images/donny.png", 0.2);
var sixteentenImage = new canvastile_1.StaticImage(-1.8, 2.795, .98, 1, .115, "images/dublin1610.png", 0.2);
var bluecoatImage = new canvastile_1.StaticImage(-3.435, -1.995, 2.39, 2.355, 0, "images/bluecoat.png", 0.4);
var rutlandImage = new canvastile_1.StaticImage(2.245, -0.795, 1.975, 1.975, 0, "images/rutland.png", 0.7);
var materImage = new canvastile_1.StaticImage(2.09, -5.355, 2.010, 2.015, 0, "images/mater.png", 0.5);
var townsendImage = new canvastile_1.StaticImage(4.575, 3.995, 2.035, 2.035, 0, "images/townsend.png", 0.7);
var castleImage = new canvastile_1.StaticImage(-3.51, 2.375, 1.985, 1.995, 0, "images/castle.png", 0.4);
var innerDockImage = new canvastile_1.StaticImage(9.215, -0.8, 3.455, 3.42, 0, "images/innerDock.png", 0.4);
var grandImage = new canvastile_1.StaticImage(0.755, 3.2, .6, .6, 1.235, "images/wsc-maps-334.png", 0.4);
var totalImage = new canvastile_1.StaticImage(4.485, -1.875, 7.465, 7.35, 0, "images/maps_145_b_4_(2)_f001r[SVC2].jpg", .3);
var totalOverlayImage = new canvastile_1.StaticImage(4.45, -1.84, 3.893, 3.829, 0, "images/maps_145_b_4_(2)_f001r[SVC2].png", .5);
function showMap(divName, name) {
    var canvas = document.getElementById(divName);
    var ctx = canvas.getContext('2d');
    var viewCanvas = new viewcanvas_1.ViewCanvas(new point2d_1.Point2D(-12, -10), 27, 18, false, ctx);
    // viewCanvas.addTileLayer(baseLayer);
    // viewCanvas.addTileLayer(sentinelLayer);
    viewCanvas.addTileLayer(slippyTileLayer);
    //viewCanvas.addTileLayer(liffeySentinelLayer);
    //viewCanvas.addTileLayer(liffeyLabelLayer);
    viewCanvas.addStaticElement(totalImage);
    //viewCanvas.addStaticElement(totalOverlayImage);
    viewCanvas.addStaticElement(broadstoneImage);
    viewCanvas.addStaticElement(broadstoneUpImage);
    viewCanvas.addStaticElement(parliamentImage);
    viewCanvas.addStaticElement(cutpurseImage);
    viewCanvas.addStaticElement(grandImage);
    viewCanvas.addStaticElement(rutlandImage);
    viewCanvas.addStaticElement(materImage);
    //viewCanvas.addStaticElement(townsendImage);
    viewCanvas.addStaticElement(innerDockImage);
    viewCanvas.addStaticElement(cutpatrickImage);
    //viewCanvas.addStaticElement(cutpatrickOverlayImage);
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
    viewCanvas.addStaticElement(barracksImage);
    viewCanvas.addStaticElement(jamesImage);
    //viewCanvas.addStaticElement(crossPoddle);
    viewCanvas.addStaticElement(clonmelImage);
    viewCanvas.addStaticElement(thingImage);
    viewCanvas.addStaticElement(bluecoatImage);
    viewCanvas.addStaticElement(castleImage);
    viewCanvas.addStaticElement(fifteenImage);
    viewCanvas.addStaticElement(henriettaImage);
    viewCanvas.addStaticElement(matermisImage);
    viewCanvas.addStaticElement(fourcourtsImage);
    viewCanvas.addStaticElement(bluecoatsImage);
    viewCanvas.addStaticElement(hughlaneImage);
    viewCanvas.addStaticElement(mountjoyImage);
    viewCanvas.addStaticElement(customsImage);
    viewCanvas.addStaticElement(libertyImage);
    viewCanvas.addStaticElement(michansImage);
    viewCanvas.addStaticElement(thecastleImage);
    viewCanvas.addStaticElement(ngirelandImage);
    viewCanvas.addStaticElement(oconnellImage);
    viewCanvas.addStaticElement(marketImage);
    //viewCanvas.addStaticElement(portoImage);
    viewCanvas.addStaticElement(donnyImage);
    viewCanvas.addStaticElement(belloImage);
    viewCanvas.addStaticElement(sixteentenImage);
    var imageController = new imageController_1.ImageController(viewCanvas, marketImage);
    var plus = document.getElementById("plus");
    var minus = document.getElementById("minus");
    var panControl = new mapController_1.PanController(viewCanvas, canvas);
    var canvasControl = new mapController_1.ZoomController(viewCanvas, plus, minus);
    canvasControl.addZoomListener(panControl);
    var layerController = new imageController_1.LayerController(viewCanvas, slippyTileLayer);
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
var LayerController = /** @class */ (function () {
    function LayerController(viewCanvas, tileLayer) {
        var _this = this;
        this.tileLayer = tileLayer;
        document.addEventListener("keypress", function (e) {
            return _this.pressed(viewCanvas, e);
        });
    }
    LayerController.prototype.pressed = function (viewCanvas, event) {
        console.log("pressed layer" + event.target + ", " + event.key);
        switch (event.key) {
            case "v":
                this.tileLayer.imageProperties.visible = !this.tileLayer.imageProperties.visible;
                viewCanvas.draw();
                break;
        }
    };
    return LayerController;
}());
exports.LayerController = LayerController;
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
            case "T":
                this.staticImage.alpha = Math.min(1.0, this.staticImage.alpha + 0.1);
                viewCanvas.draw();
                break;
            case "t":
                this.staticImage.alpha = Math.max(0, this.staticImage.alpha - 0.1);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2dlb20vdGlsZS50cyIsInNyYy9nZW9tL3ZpZXdwb3J0LnRzIiwic3JjL2dlb20vd29ybGQyZC50cyIsInNyYy9ncmFwaGljcy9jYW52YXN0aWxlLnRzIiwic3JjL2dyYXBoaWNzL2dyaWQudHMiLCJzcmMvZ3JhcGhpY3Mvdmlld2NhbnZhcy50cyIsInNyYy9zaW1wbGVXb3JsZC50cyIsInNyYy91aS9pbWFnZUNvbnRyb2xsZXIudHMiLCJzcmMvdWkvbWFwQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQ0E7SUFPSSxpQkFBWSxDQUFTLEVBQUUsQ0FBUztRQUM1QixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFRSwwQkFBUSxHQUFSO1FBQ0ksT0FBTyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDckQsQ0FBQztJQWJlLFlBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDekIsV0FBRyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQWM1QyxjQUFDO0NBaEJELEFBZ0JDLElBQUE7QUFoQlksMEJBQU87Ozs7O0FDRXBCO0lBRUMsbUJBQW1CLGFBQXFCLEVBQVMsY0FBc0I7UUFBcEQsa0JBQWEsR0FBYixhQUFhLENBQVE7UUFBUyxtQkFBYyxHQUFkLGNBQWMsQ0FBUTtJQUFFLENBQUM7SUFJMUUsNEJBQVEsR0FBUixVQUFTLFFBQWlCLEVBQUUsU0FBaUIsRUFBRSxTQUFpQjtRQUUvRCxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFH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QzFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN4QyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdkMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3pDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN4QyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDNUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3hDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzlDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMxQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDM0MsVUFBVSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzNDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN4QywyQ0FBMkM7SUFDM0MsVUFBVSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN4QyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDM0MsVUFBVSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3pDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUUxQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDNUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzNDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUM3QyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDNUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzNDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUMzQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDMUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMxQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDNUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzVDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUMzQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFekMsMENBQTBDO0lBQzFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN4QyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDeEMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBRTdDLElBQUksZUFBZSxHQUFHLElBQUksaUNBQWUsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFFbkUsSUFBTSxJQUFJLEdBQXNCLFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEUsSUFBTSxLQUFLLEdBQXNCLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFbEUsSUFBSSxVQUFVLEdBQUcsSUFBSSw2QkFBYSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN2RCxJQUFJLGFBQWEsR0FBRyxJQUFJLDhCQUFjLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUVoRSxhQUFhLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRTFDLElBQUksZUFBZSxHQUFHLElBQUksaUNBQWUsQ0FBQyxVQUFVLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFFdkUsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25CLENBQUM7QUFFRDtJQUNDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDakMsQ0FBQztBQUVELElBQ0ksUUFBUSxDQUFDLFVBQVUsS0FBSyxVQUFVO0lBQ2xDLENBQUMsUUFBUSxDQUFDLFVBQVUsS0FBSyxTQUFTLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxFQUMzRTtJQUNELElBQUksRUFBRSxDQUFDO0NBQ1A7S0FBTTtJQUNOLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztDQUNwRDs7Ozs7QUM5VEQ7SUFFSSx5QkFBWSxVQUFzQixFQUFXLFNBQXdCO1FBQXJFLGlCQUdDO1FBSDRDLGNBQVMsR0FBVCxTQUFTLENBQWU7UUFDakUsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxVQUFDLENBQU87WUFDMUMsT0FBQSxLQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFtQixDQUFDO1FBQTdDLENBQTZDLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQsaUNBQU8sR0FBUCxVQUFRLFVBQXNCLEVBQUUsS0FBb0I7UUFDaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRS9ELFFBQVEsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNmLEtBQUssR0FBRztnQkFDSixJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUM7Z0JBQ2pGLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtTQUNiO0lBQ0wsQ0FBQztJQUNMLHNCQUFDO0FBQUQsQ0FqQkEsQUFpQkMsSUFBQTtBQWpCWSwwQ0FBZTtBQW1CNUI7SUFFSSx5QkFBWSxVQUFzQixFQUFXLFdBQXdCO1FBQXJFLGlCQUdDO1FBSDRDLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQ3BFLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsVUFBQyxDQUFPO1lBQzdDLE9BQUEsS0FBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBbUIsQ0FBQztRQUE3QyxDQUE2QyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELGlDQUFPLEdBQVAsVUFBUSxVQUFzQixFQUFFLEtBQW9CO1FBQ25ELE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV6RCxRQUFRLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDbEIsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztnQkFDMUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztnQkFDMUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztnQkFDMUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztnQkFDMUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ0QsS0FBSyxHQUFHO2dCQUNKLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUNyRSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDVixLQUFLLEdBQUc7Z0JBQ0osSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ25FLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNoQjtnQkFDQyxVQUFVO2dCQUNWLE1BQU07U0FDUDtRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxHQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RGLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxHQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNqSSxDQUFDO0lBQUEsQ0FBQztJQUVOLHNCQUFDO0FBQUQsQ0FuRUEsQUFtRUMsSUFBQTtBQW5FWSwwQ0FBZTtBQW1FM0IsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FDMUZGLDJDQUEwQztBQUUxQztJQUFBO0lBb0JBLENBQUM7SUFsQkcsdUNBQWEsR0FBYixVQUFjLEtBQWlCLEVBQUUsTUFBbUI7UUFDaEQsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVU7Y0FDMUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUM7UUFDL0MsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVM7Y0FDekMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUM7UUFFOUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFDO1lBQ3BCLEdBQUc7Z0JBQ0MsTUFBTSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUM7Z0JBQzVCLE1BQU0sSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDO2FBQzlCLFFBQVEsTUFBTSxHQUFnQixNQUFNLENBQUMsWUFBWSxFQUFFO1NBQ3ZEO1FBRUQsT0FBTyxJQUFJLGlCQUFPLENBQUMsTUFBTSxHQUFHLE1BQU0sRUFBRSxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVMLHNCQUFDO0FBQUQsQ0FwQkEsQUFvQkMsSUFBQTtBQUVEO0lBQUE7SUFFQSxDQUFDO0lBQUQsbUJBQUM7QUFBRCxDQUZBLEFBRUMsSUFBQTtBQUVEO0lBQW9DLGtDQUFlO0lBSy9DLHdCQUFZLFVBQXNCLEVBQVcsTUFBbUIsRUFBVyxPQUFvQjtRQUEvRixZQUNJLGlCQUFPLFNBTVY7UUFQNEMsWUFBTSxHQUFOLE1BQU0sQ0FBYTtRQUFXLGFBQU8sR0FBUCxPQUFPLENBQWE7UUFIMUYsZUFBUyxHQUF3QixFQUFFLENBQUM7UUFDcEMsVUFBSSxHQUFHLENBQUMsQ0FBQztRQUtiLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsVUFBQyxDQUFPLElBQUssT0FBQSxLQUFJLENBQUMsT0FBTyxDQUFDLENBQWUsRUFBRSxVQUFVLEVBQUUsR0FBRyxDQUFDLEVBQTlDLENBQThDLENBQUMsQ0FBQztRQUM5RixPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFVBQUMsQ0FBTyxJQUFLLE9BQUEsS0FBSSxDQUFDLE9BQU8sQ0FBQyxDQUFlLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxFQUEvQyxDQUErQyxDQUFDLENBQUM7UUFDaEcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLFVBQUMsQ0FBTztZQUMxRCxPQUFBLEtBQUksQ0FBQyxPQUFPLENBQUMsQ0FBZSxFQUFFLFVBQVUsRUFBRSxHQUFHLENBQUM7UUFBOUMsQ0FBOEMsQ0FBQyxDQUFDOztJQUNsRCxDQUFDO0lBRUQsd0NBQWUsR0FBZixVQUFnQixZQUEwQjtRQUN6QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsZ0NBQU8sR0FBUCxVQUFRLEtBQWlCLEVBQUUsVUFBc0IsRUFBRSxFQUFVO1FBRTVELE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUxRCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRS9DLFFBQU8sS0FBSyxDQUFDLElBQUksRUFBQztZQUNkLEtBQUssVUFBVTtnQkFDWCxJQUFJLE1BQU0sR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztnQkFFbkMsSUFBSyxLQUFLLENBQUMsT0FBTyxFQUFFO29CQUNoQixFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztpQkFDZjtnQkFFRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUUzRCxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ2xGLE1BQU07WUFDVjtnQkFDSSxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQy9CO1FBRUosSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMzQixLQUFrQixVQUFjLEVBQWQsS0FBQSxJQUFJLENBQUMsU0FBUyxFQUFkLGNBQWMsRUFBZCxJQUFjLEVBQUM7WUFBNUIsSUFBSSxLQUFLLFNBQUE7WUFDYixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN0QjtRQUVELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBQUEsQ0FBQztJQUVOLHFCQUFDO0FBQUQsQ0FoREEsQUFnREMsQ0FoRG1DLGVBQWUsR0FnRGxEO0FBaERZLHdDQUFjO0FBZ0QxQixDQUFDO0FBRUY7SUFBbUMsaUNBQVk7SUFRM0MsdUJBQVksVUFBc0IsRUFBVyxXQUF3QjtRQUFyRSxZQUNDLGlCQUFPLFNBV1A7UUFaNEMsaUJBQVcsR0FBWCxXQUFXLENBQWE7UUFKaEUsWUFBTSxHQUFZLEtBQUssQ0FBQztRQUN4QixjQUFRLEdBQVcsR0FBRyxDQUFDO1FBQ3ZCLFVBQUksR0FBVyxHQUFHLENBQUM7UUFJdkIsV0FBVyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxVQUFDLENBQU87WUFDakQsT0FBQSxLQUFJLENBQUMsT0FBTyxDQUFDLENBQWUsRUFBRSxVQUFVLENBQUM7UUFBekMsQ0FBeUMsQ0FBQyxDQUFDO1FBQzVDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsVUFBQyxDQUFPO1lBQ2pELE9BQUEsS0FBSSxDQUFDLE9BQU8sQ0FBQyxDQUFlLEVBQUUsVUFBVSxDQUFDO1FBQXpDLENBQXlDLENBQUMsQ0FBQztRQUN6QyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFVBQUMsQ0FBTztZQUM1QyxPQUFBLEtBQUksQ0FBQyxPQUFPLENBQUMsQ0FBZSxFQUFFLFVBQVUsQ0FBQztRQUF6QyxDQUF5QyxDQUFDLENBQUM7UUFDL0MsV0FBVyxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxVQUFDLENBQU87WUFDL0MsT0FBQSxLQUFJLENBQUMsTUFBTSxHQUFHLEtBQUs7UUFBbkIsQ0FBbUIsQ0FBQyxDQUFDO1FBQ3pCLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFDLENBQVE7WUFDckQsT0FBQSxLQUFJLENBQUMsS0FBSyxDQUFDLENBQWUsRUFBRSxVQUFVLENBQUM7UUFBdkMsQ0FBdUMsQ0FBQyxDQUFDOztJQUNqRCxDQUFDO0lBRUQsNEJBQUksR0FBSixVQUFLLEVBQVU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFHRCw2QkFBSyxHQUFMLFVBQU0sS0FBaUIsRUFBRSxVQUFzQjtRQUUzQywwREFBMEQ7UUFFMUQsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RDLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUV0QyxJQUFJLFVBQVUsR0FBRyxJQUFJLGlCQUFPLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsTUFBTSxFQUN0RCxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztRQUVuQyx1Q0FBdUM7UUFFdkMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNoQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUdELCtCQUFPLEdBQVAsVUFBUSxLQUFpQixFQUFFLFVBQXNCO1FBRTdDLElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO1FBRXRDLFFBQU8sS0FBSyxDQUFDLElBQUksRUFBQztZQUNqQixLQUFLLFdBQVc7Z0JBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7Z0JBQ25CLE1BQU07WUFDUCxLQUFLLFNBQVM7Z0JBQ2IsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7Z0JBQ3BCLE1BQU07WUFDUDtnQkFDQyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUM7b0JBQ0gsSUFBSSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO29CQUMxRCxJQUFJLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7b0JBRTFELElBQUksVUFBVSxHQUFHLElBQUksaUJBQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxNQUFNLEVBQ3RELFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO29CQUVuQyxVQUFVLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNoQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7aUJBQzlCO1NBQ0Y7UUFFSixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDL0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO0lBRTdCLENBQUM7SUFBQSxDQUFDO0lBRUYscUNBQWEsR0FBYixVQUFjLEtBQWlCLEVBQUUsTUFBbUI7UUFDaEQsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVU7Y0FDMUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUM7UUFDL0MsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVM7Y0FDekMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUM7UUFFOUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFDO1lBQ3BCLEdBQUc7Z0JBQ0MsTUFBTSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUM7Z0JBQzVCLE1BQU0sSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDO2FBQzlCLFFBQVEsTUFBTSxHQUFnQixNQUFNLENBQUMsWUFBWSxFQUFFO1NBQ3ZEO1FBRUQsT0FBTyxJQUFJLGlCQUFPLENBQUMsTUFBTSxHQUFHLE1BQU0sRUFBRSxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVMLG9CQUFDO0FBQUQsQ0E1RkEsQUE0RkMsQ0E1RmtDLFlBQVksR0E0RjlDO0FBNUZZLHNDQUFhO0FBNEZ6QixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXG5leHBvcnQgY2xhc3MgUG9pbnQyRCB7XG4gICAgc3RhdGljIHJlYWRvbmx5IHplcm8gPSBuZXcgUG9pbnQyRCgwLCAwKTtcbiAgICBzdGF0aWMgcmVhZG9ubHkgb25lID0gbmV3IFBvaW50MkQoMSwgMSk7XG5cbiAgICByZWFkb25seSB4OiBudW1iZXI7XG4gICAgcmVhZG9ubHkgeTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcblx0fVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiUG9pbnQyRChcIiArIHRoaXMueCArIFwiLCBcIiArIHRoaXMueSArIFwiKVwiO1xuICAgIH1cblxufSIsImltcG9ydCB7IFVuaXRzIH0gZnJvbSBcIi4vd29ybGQyZFwiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuL3BvaW50MmRcIjtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFRpbGVMYXllciB7XG5cdFxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgd2lkdGhNYXBVbml0czogbnVtYmVyLCBwdWJsaWMgaGVpZ2h0TWFwVW5pdHM6IG51bWJlcil7fVxuXG5cdGFic3RyYWN0IGdldFRpbGUoeEluZGV4OiBudW1iZXIsIHlJbmRleDogbnVtYmVyKTogVGlsZTtcblxuXHRnZXRUaWxlcyhwb3NpdGlvbjogUG9pbnQyRCwgeE1hcFVuaXRzOiBudW1iZXIsIHlNYXBVbml0czogbnVtYmVyKTogQXJyYXk8VGlsZT4ge1xuXG5cdFx0bGV0IHggPSBwb3NpdGlvbi54IC8gdGhpcy53aWR0aE1hcFVuaXRzO1xuXHRcdGxldCB5ID0gcG9zaXRpb24ueSAvIHRoaXMuaGVpZ2h0TWFwVW5pdHM7XG5cblx0XHRsZXQgd2lkdGggPSB4TWFwVW5pdHMgLyB0aGlzLndpZHRoTWFwVW5pdHM7XG5cdFx0bGV0IGhlaWdodCA9IHlNYXBVbml0cyAvIHRoaXMuaGVpZ2h0TWFwVW5pdHM7XG5cblx0XHRsZXQgZmlyc3RYID0gTWF0aC5mbG9vcih4KTtcblx0XHRsZXQgbGFzdFggPSBNYXRoLmNlaWwoeCkgKyB3aWR0aDtcblxuXHRcdGxldCBmaXJzdFkgPSBNYXRoLmZsb29yKHkpO1xuXHRcdGxldCBsYXN0WSA9IE1hdGguY2VpbCh5KSArIGhlaWdodDtcblxuXHRcdGxldCB0aWxlcyA9IG5ldyBBcnJheTxUaWxlPigpO1xuXG5cdFx0Zm9yICh2YXIgeD1maXJzdFg7IHg8bGFzdFg7IHgrKyl7XG5cdFx0XHRmb3IgKHZhciB5PWZpcnN0WTsgeTxsYXN0WTsgeSsrKXtcblx0XHRcdFx0dGlsZXMucHVzaCh0aGlzLmdldFRpbGUoeCwgeSkpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRpbGVzO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNsYXNzIFRpbGUge1xuXHRcblx0c3RhdGljIGVtcHR5VGlsZTogVGlsZSA9IG5ldyBUaWxlKC0xLC0xKTtcblxuXHRjb25zdHJ1Y3Rvcih4SW5kZXg6IG51bWJlciwgeUluZGV4OiBudW1iZXIpe31cblxufSIsImltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi9wb2ludDJkXCI7XG5pbXBvcnQgeyBWZWN0b3IyRCB9IGZyb20gXCIuL3ZlY3RvcjJkXCI7XG5pbXBvcnQgeyBXb3JsZDJELCBVbml0cyB9IGZyb20gXCIuL3dvcmxkMmRcIjtcblxuZXhwb3J0IGNsYXNzIFZpZXdwb3J0IHtcblx0XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB0b3BMZWZ0OiBQb2ludDJELCBcblx0XHRwcml2YXRlIHdpZHRoTWFwVW5pdHM6IG51bWJlciwgcHJpdmF0ZSBoZWlnaHRNYXBVbml0czogbnVtYmVyKXtcblxuXHRcdGNvbnNvbGUubG9nKFwidyBoXCIgKyB3aWR0aE1hcFVuaXRzICsgXCIsIFwiICsgaGVpZ2h0TWFwVW5pdHMpO1xuXHR9XG5cblx0bW92ZVZpZXcodG9wTGVmdDogUG9pbnQyRCl7XG5cdFx0dGhpcy50b3BMZWZ0ID0gdG9wTGVmdDtcblx0fVxuXG5cdHpvb21WaWV3KHpvb206IG51bWJlcil7XG5cdFx0bGV0IG5ld1dpZHRoID0gdGhpcy53aWR0aE1hcFVuaXRzICogem9vbTtcblx0XHRsZXQgbmV3SGVpZ2h0ID0gdGhpcy5oZWlnaHRNYXBVbml0cyAqIHpvb207XG5cblx0XHRsZXQgbW92ZVggPSAodGhpcy53aWR0aE1hcFVuaXRzIC0gbmV3V2lkdGgpIC8gMjtcblx0XHRsZXQgbW92ZVkgPSAodGhpcy5oZWlnaHRNYXBVbml0cyAtIG5ld0hlaWdodCkgLyAyO1xuXG5cdFx0dGhpcy50b3BMZWZ0ID0gbmV3IFBvaW50MkQodGhpcy50b3BMZWZ0LnggKyBtb3ZlWCwgdGhpcy50b3BMZWZ0LnkgKyBtb3ZlWSk7XG5cblx0XHR0aGlzLndpZHRoTWFwVW5pdHMgPSBuZXdXaWR0aDtcblx0XHR0aGlzLmhlaWdodE1hcFVuaXRzID0gbmV3SGVpZ2h0O1xuXHR9XG5cblx0em9vbUFib3V0KHhSZWxhdGl2ZTogbnVtYmVyLCB5UmVsYXRpdmU6IG51bWJlciwgem9vbTogbnVtYmVyKXtcblxuXHRcdGxldCB4RGlmZiA9IDAuNSAtIHhSZWxhdGl2ZTtcblx0XHRsZXQgeURpZmYgPSAwLjUgLSB5UmVsYXRpdmU7XG5cblx0XHR2YXIgeE1vdmUgPSB4RGlmZiAqIHRoaXMud2lkdGhNYXBVbml0cztcblx0XHR2YXIgeU1vdmUgPSB5RGlmZiAqIHRoaXMuaGVpZ2h0TWFwVW5pdHM7XG5cblx0XHR0aGlzLnRvcExlZnQgPSBuZXcgUG9pbnQyRCh0aGlzLnRvcExlZnQueCAtIHhNb3ZlLCB0aGlzLnRvcExlZnQueSAtIHlNb3ZlKTtcblxuXHRcdHRoaXMuem9vbVZpZXcoem9vbSk7XG5cblx0XHR4TW92ZSA9IHhEaWZmICogdGhpcy53aWR0aE1hcFVuaXRzO1xuXHRcdHlNb3ZlID0geURpZmYgKiB0aGlzLmhlaWdodE1hcFVuaXRzO1xuXG5cdFx0dGhpcy50b3BMZWZ0ID0gbmV3IFBvaW50MkQodGhpcy50b3BMZWZ0LnggKyB4TW92ZSwgdGhpcy50b3BMZWZ0LnkgKyB5TW92ZSk7XG5cblx0fVxuXG5cdGdldERpbWVuc2lvbnMoKXtcblx0XHRyZXR1cm4gbmV3IFBvaW50MkQodGhpcy53aWR0aE1hcFVuaXRzLCB0aGlzLmhlaWdodE1hcFVuaXRzKTtcblx0fVxuXG59IiwiaW1wb3J0IHsgVGlsZUxheWVyIH0gZnJvbSBcIi4vdGlsZVwiO1xuXG5leHBvcnQgY2xhc3MgVW5pdHMge1xuXG5cdHN0YXRpYyByZWFkb25seSBXZWJXVSA9IG5ldyBVbml0cyhcIk1lcmNhdG9yIFdlYiBXb3JsZCBVbml0c1wiKTtcblxuXHRjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpe31cblxufVxuLyoqXG4gIEEgd29ybGQgaXMgdGhlIGJhc2UgdGhhdCBhbGwgb3RoZXIgZWxlbWVudHMgb3JpZW50YXRlIGZyb20gXG4qKi9cbmV4cG9ydCBjbGFzcyBXb3JsZDJEIHtcblxuXHRwcml2YXRlIHRpbGVMYXllcnM6IEFycmF5PFRpbGVMYXllcj4gPSBbXTtcblx0XG5cdGNvbnN0cnVjdG9yKCl7fVxuXG4gICAgYWRkVGlsZUxheWVyKHRpbGVMYXllcjogVGlsZUxheWVyKTogbnVtYmVyIHtcbiAgICBcdHJldHVybiB0aGlzLnRpbGVMYXllcnMucHVzaCh0aWxlTGF5ZXIpO1xuICAgIH1cblxufSIsImltcG9ydCB7IFRpbGUsIFRpbGVMYXllciB9IGZyb20gXCIuLi9nZW9tL3RpbGVcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDYW52YXNUaWxlIGV4dGVuZHMgVGlsZSB7XG5cblx0YWJzdHJhY3QgZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgc2NhbGluZ1g6IG51bWJlciwgc2NhbGluZ1k6IG51bWJlciwgXG5cdFx0Y2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpOiB2b2lkO1xuXG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZVN0cnVjdCB7XG5cblx0cHJlZml4OiBzdHJpbmcgPSBcIlwiO1xuXHRzdWZmaXg6IHN0cmluZyA9IFwiXCI7XG5cdHRpbGVEaXI6IHN0cmluZyA9IFwiaW1hZ2VzL1wiO1xuXHR2aXNpYmxlOiBib29sZWFuID0gdHJ1ZTtcblx0b3BhY2l0eTogbnVtYmVyID0gMC43O1xuXHR0aWxlV2lkdGhQeDogbnVtYmVyID0gMjU2O1xuXHR0aWxlSGVpZ2h0UHg6IG51bWJlciA9IDI1Njtcblx0d2lkdGhNYXBVbml0czogbnVtYmVyID0gMTtcblx0aGVpZ2h0TWFwVW5pdHM6IG51bWJlciA9IDE7IFxuXG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZVRpbGUgZXh0ZW5kcyBDYW52YXNUaWxlIHtcblxuXHRwcml2YXRlIGltZzogSFRNTEltYWdlRWxlbWVudDtcblxuXHRjb25zdHJ1Y3RvcihyZWFkb25seSB4SW5kZXg6IG51bWJlciwgcmVhZG9ubHkgeUluZGV4OiBudW1iZXIsIGltYWdlU3JjOiBzdHJpbmcpIHtcblx0XHRzdXBlcih4SW5kZXgsIHlJbmRleCk7XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0fTtcblxuXHRwcml2YXRlIGRyYXdJbWFnZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgY2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpe1xuXHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIGNhbnZhc1gsIGNhbnZhc1kpO1xuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgY2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpe1xuXHRcdGlmICh0aGlzLmltZy5jb21wbGV0ZSkge1xuXHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCBjYW52YXNYLCBjYW52YXNZKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR0aGlzLmltZy5vbmxvYWQgPSAoZXZlbnQpID0+IHtcblx0XHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCBjYW52YXNYLCBjYW52YXNZKTtcblx0XHRcdH07XG5cdFx0fVxuXHR9O1xuXG59XG5cbmV4cG9ydCBjbGFzcyBTdGF0aWNJbWFnZSB7XG5cblx0cHJpdmF0ZSBpbWc6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cblx0Y29uc3RydWN0b3IocHVibGljIHhJbmRleDogbnVtYmVyLCBwdWJsaWMgeUluZGV4OiBudW1iZXIsIFxuXHRcdHB1YmxpYyBzY2FsaW5nWDogbnVtYmVyLCBwdWJsaWMgc2NhbGluZ1k6IG51bWJlciwgcHVibGljIHJvdGF0aW9uOiBudW1iZXIsIFxuXHRcdGltYWdlU3JjOiBzdHJpbmcsIHB1YmxpYyBhbHBoYTogbnVtYmVyKSB7XG5cdFx0XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0fTtcblxuXHRwcml2YXRlIGRyYXdJbWFnZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgY2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpe1xuXG5cdFx0Ly9zY2FsaW5nWCA9IHNjYWxpbmdYICogdGhpcy5zY2FsaW5nO1xuXHRcdC8vc2NhbGluZ1kgPSBzY2FsaW5nWSAqIHRoaXMuc2NhbGluZztcblxuXHRcdC8vIGxldCBjb3NYID0gTWF0aC5jb3ModGhpcy5yb3RhdGlvbik7XG5cdFx0Ly8gbGV0IHNpblggPSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uKTtcblxuXHRcdGN0eC50cmFuc2xhdGUoY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0Y3R4LnJvdGF0ZSh0aGlzLnJvdGF0aW9uKTtcblx0XHRjdHguc2NhbGUodGhpcy5zY2FsaW5nWCwgdGhpcy5zY2FsaW5nWSk7XG5cdFx0Ly9jb25zb2xlLmxvZyhcInh5U2NhbGluZyBcIiArIHRoaXMuc2NhbGluZ1ggKyBcIiwgXCIgKyB0aGlzLnNjYWxpbmdZKTtcblx0XHRjdHguZ2xvYmFsQWxwaGEgPSB0aGlzLmFscGhhO1xuXG5cdFx0Ly8gY3R4LnRyYW5zZm9ybShjb3NYICogc2NhbGluZ1gsIHNpblggKiBzY2FsaW5nWSwgLXNpblggKiBzY2FsaW5nWCwgY29zWCAqIHNjYWxpbmdZLCBcblx0XHQvLyBcdGNhbnZhc1ggLyB0aGlzLnNjYWxpbmcsIGNhbnZhc1kgLyB0aGlzLnNjYWxpbmcpO1xuXG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZywgLSh0aGlzLmltZy53aWR0aC8yKSwgLSh0aGlzLmltZy5oZWlnaHQvMikpO1xuXHRcdFxuXHRcdGN0eC5zY2FsZSgxL3RoaXMuc2NhbGluZ1gsIDEvdGhpcy5zY2FsaW5nWSk7XG5cdFx0Y3R4LnJvdGF0ZSgtdGhpcy5yb3RhdGlvbik7XG5cdFx0Y3R4LnRyYW5zbGF0ZSgtY2FudmFzWCwgLWNhbnZhc1kpO1xuXHRcdGN0eC5nbG9iYWxBbHBoYSA9IDE7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBjYW52YXNYOiBudW1iZXIsIGNhbnZhc1k6IG51bWJlcil7XG5cdFx0aWYgKHRoaXMuaW1nLmNvbXBsZXRlKSB7XG5cdFx0XHR0aGlzLmRyYXdJbWFnZShjdHgsIGNhbnZhc1gsIGNhbnZhc1kpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuaW1nLm9ubG9hZCA9IChldmVudCkgPT4ge1xuXHRcdFx0XHR0aGlzLmltZy5jcm9zc09yaWdpbiA9IFwiQW5vbnltb3VzXCI7XG5cdFx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fTtcblxufVxuXG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTaG93VGlsZUxheWVyIGV4dGVuZHMgVGlsZUxheWVyIHtcblx0XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBpbWFnZVByb3BlcnRpZXM6IEltYWdlU3RydWN0KXtcblx0XHRzdXBlcihpbWFnZVByb3BlcnRpZXMud2lkdGhNYXBVbml0cywgaW1hZ2VQcm9wZXJ0aWVzLmhlaWdodE1hcFVuaXRzKTtcblx0fVxuXG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZVRpbGVMYXllciBleHRlbmRzIFNob3dUaWxlTGF5ZXIge1xuXG5cdHJlYWRvbmx5IGltYWdlUHJvcGVydGllczogSW1hZ2VTdHJ1Y3Q7XG5cblx0Y29uc3RydWN0b3IoaW1hZ2VQcm9wZXJ0aWVzOiBJbWFnZVN0cnVjdCkge1xuXHRcdC8vc3VwZXIoaW1hZ2VQcm9wZXJ0aWVzLndpZHRoTWFwVW5pdHMsIGltYWdlUHJvcGVydGllcy5oZWlnaHRNYXBVbml0cyk7XG5cdFx0c3VwZXIoaW1hZ2VQcm9wZXJ0aWVzKTtcblx0XHQvL3RoaXMuaW1hZ2VQcm9wZXJ0aWVzID0gaW1hZ2VQcm9wZXJ0aWVzO1xuXHR9XG5cblx0LyoqXG5cdCAgbGVhdmUgY2FjaGluZyB1cCB0byB0aGUgYnJvd3NlclxuXHQqKi9cblx0Z2V0VGlsZSh4VW5pdHM6IG51bWJlciwgeVVuaXRzOiBudW1iZXIpOiBUaWxlIHtcblx0XHRsZXQgaW1hZ2VTcmMgPSB0aGlzLmltYWdlUHJvcGVydGllcy50aWxlRGlyICsgXG5cdFx0XHR0aGlzLmltYWdlUHJvcGVydGllcy5wcmVmaXggKyB4VW5pdHMgKyBcIl9cIiArIHlVbml0cyArIHRoaXMuaW1hZ2VQcm9wZXJ0aWVzLnN1ZmZpeDtcblx0XHRyZXR1cm4gbmV3IEltYWdlVGlsZSh4VW5pdHMtMSwgeVVuaXRzKzEsIGltYWdlU3JjKTtcblx0fVxuXG59XG5cbmV4cG9ydCBjbGFzcyBTbGlwcHlUaWxlTGF5ZXIgZXh0ZW5kcyBTaG93VGlsZUxheWVyIHtcblxuXHRyZWFkb25seSBpbWFnZVByb3BlcnRpZXM6IEltYWdlU3RydWN0O1xuXHRwcml2YXRlIGJhc2VYID0gMDtcblx0cHJpdmF0ZSBiYXNlWSA9IDA7XG5cblx0Y29uc3RydWN0b3IoaW1hZ2VQcm9wZXJ0aWVzOiBJbWFnZVN0cnVjdCwgcHJpdmF0ZSB6b29tOiBudW1iZXIsXG5cdFx0cHJpdmF0ZSB4T2Zmc2V0OiBudW1iZXIsIHByaXZhdGUgeU9mZnNldDogbnVtYmVyKSB7XG5cdFx0Ly9zdXBlcihpbWFnZVByb3BlcnRpZXMud2lkdGhNYXBVbml0cywgaW1hZ2VQcm9wZXJ0aWVzLmhlaWdodE1hcFVuaXRzKTtcblx0XHRzdXBlcihpbWFnZVByb3BlcnRpZXMpO1xuXHRcdC8vdGhpcy5pbWFnZVByb3BlcnRpZXMgPSBpbWFnZVByb3BlcnRpZXM7XG5cdH1cblxuXHRwcml2YXRlIG9mZnNldHMoKXtcblx0XHRsZXQgem9vbUV4cCA9IE1hdGgucG93KDIsIHRoaXMuem9vbSk7XG5cdFx0dGhpcy5iYXNlWCA9IHRoaXMueE9mZnNldCAvIHpvb21FeHA7XG5cdFx0dGhpcy5iYXNlWSA9IHRoaXMueU9mZnNldCAvIHpvb21FeHA7XG5cdH1cblxuXHQvKipcblx0ICBsZWF2ZSBjYWNoaW5nIHVwIHRvIHRoZSBicm93c2VyXG5cdCoqL1xuXHRnZXRUaWxlKHhVbml0czogbnVtYmVyLCB5VW5pdHM6IG51bWJlcik6IFRpbGUge1xuXHRcdFxuXHRcdGxldCBpbWFnZVNyYyA9IHRoaXMuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVEaXIgKyB0aGlzLnpvb20gKyBcIi9cIiArICh0aGlzLnhPZmZzZXQreFVuaXRzKSArIFwiL1wiICsgXG5cdFx0XHQgKyAodGhpcy55T2Zmc2V0K3lVbml0cykgKyB0aGlzLmltYWdlUHJvcGVydGllcy5zdWZmaXg7XG5cdFx0cmV0dXJuIG5ldyBJbWFnZVRpbGUoeFVuaXRzLCB5VW5pdHMsIGltYWdlU3JjKTtcblx0fVxuXG59XG4iLCJpbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgY2xhc3MgR3JpZExheWVyIHtcblxuXHRwcml2YXRlIGdyaWRTcGFjaW5nOiBudW1iZXI7XG5cblx0Y29uc3RydWN0b3IocHVibGljIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBncmlkU3BhY2luZzogbnVtYmVyKSB7XG5cdFx0dGhpcy5ncmlkU3BhY2luZyA9IGdyaWRTcGFjaW5nO1xuXHR9XG5cblx0c2V0R3JpZFNwYWNpbmcoZ3JpZFNwYWNpbmc6IG51bWJlcil7XG5cdFx0dGhpcy5ncmlkU3BhY2luZyA9IGdyaWRTcGFjaW5nO1xuXHR9XG5cdC8qKlxuXHQgIGxlYXZlIGNhY2hpbmcgdXAgdG8gdGhlIGJyb3dzZXJcblx0KiovXG5cdGRyYXcodG9wTGVmdDogUG9pbnQyRCwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcblx0XHRsZXQgbWluWCA9IE1hdGguZmxvb3IodG9wTGVmdC54KTtcblx0XHRsZXQgbWluWSA9IE1hdGguZmxvb3IodG9wTGVmdC55KTtcblxuXHRcdHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gMC41O1xuXHRcdHRoaXMuY3R4LnRyYW5zbGF0ZSgtMjU2ICogdG9wTGVmdC54LCAtMjU2ICogdG9wTGVmdC55KTtcblx0XHQvL2NvbnNvbGUubG9nKFwibWlucyBcIiArIHdpZHRoICsgXCIsIFwiICsgaGVpZ2h0KTtcblxuXHRcdGxldCBsYXN0WCA9IE1hdGguY2VpbCh0b3BMZWZ0LnggKyB3aWR0aCk7XG5cdFx0bGV0IGxhc3RZID0gTWF0aC5jZWlsKHRvcExlZnQueSArIGhlaWdodCk7XG5cblx0XHR0aGlzLmN0eC5zdHJva2VTdHlsZSA9ICdibHVlJztcblx0XHR0aGlzLmN0eC5mb250ID0gJzQ4cHggc2VyaWYnO1xuXG5cdFx0bGV0IHlaZXJvID0gbWluWSAqIHRoaXMuZ3JpZFNwYWNpbmcgKiAyNTY7XG5cdFx0bGV0IHlNYXggPSBsYXN0WSAqIHRoaXMuZ3JpZFNwYWNpbmcgKiAyNTY7XG5cdFx0bGV0IHhKdW1wID0gdGhpcy5ncmlkU3BhY2luZyAqIDI1NjtcblxuXHRcdGxldCB4WmVybyA9IG1pblggKiB0aGlzLmdyaWRTcGFjaW5nICogMjU2O1xuXHRcdGxldCB4TWF4ID0gbGFzdFggKiB0aGlzLmdyaWRTcGFjaW5nICogMjU2O1xuXHRcdGxldCB5SnVtcCA9IHRoaXMuZ3JpZFNwYWNpbmcgKiAyNTY7XG5cblx0XHR0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICBcdC8vdGhpcy5jdHguY2xlYXJSZWN0KHhaZXJvLCB5WmVybywgeE1heCwgeU1heCk7XG5cblx0XHRmb3IgKHZhciB4ID0gbWluWDsgeDxsYXN0WDsgeCsrKXtcblx0XHRcdC8vY29uc29sZS5sb2coXCJhdCBcIiArIG1pblgpO1xuXHRcdFx0bGV0IHhNb3ZlID0geCAqIHhKdW1wO1xuXHRcdFx0dGhpcy5jdHgubW92ZVRvKHhNb3ZlLCB5WmVybyk7XG5cdFx0XHR0aGlzLmN0eC5saW5lVG8oeE1vdmUsIHlNYXgpO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIHkgPSBtaW5ZOyB5PGxhc3RZOyB5Kyspe1xuXHRcdFx0bGV0IHlNb3ZlID0geSAqIHlKdW1wO1xuXHRcdFx0dGhpcy5jdHgubW92ZVRvKHhaZXJvLCB5TW92ZSk7XG5cdFx0XHR0aGlzLmN0eC5saW5lVG8oeE1heCwgeU1vdmUpO1xuXG5cdFx0XHRmb3IgKHZhciB4ID0gbWluWDsgeDxsYXN0WDsgeCsrKXtcblx0XHRcdFx0bGV0IHhNb3ZlID0gKHggLSAwLjUpICogeEp1bXA7XG5cdFx0XHRcdHlNb3ZlID0gKHkgLSAwLjUpICogeUp1bXA7XG5cdFx0XHRcdGxldCB0ZXh0ID0gXCJcIiArICh4LTEpICsgXCIsIFwiICsgKHktMSk7XG5cdFx0XHRcdHRoaXMuY3R4LmZpbGxUZXh0KHRleHQsIHhNb3ZlLCB5TW92ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMuY3R4LnN0cm9rZSgpO1xuXHRcdHRoaXMuY3R4LnRyYW5zbGF0ZSgyNTYgKiB0b3BMZWZ0LngsIDI1NiAqIHRvcExlZnQueSk7XG5cdFx0dGhpcy5jdHguZ2xvYmFsQWxwaGEgPSAxO1xuXHR9XG5cblxufSIsImltcG9ydCB7IFZpZXdwb3J0IH0gZnJvbSBcIi4uL2dlb20vdmlld3BvcnRcIjtcbmltcG9ydCB7IFdvcmxkMkQgfSBmcm9tIFwiLi4vZ2VvbS93b3JsZDJkXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuaW1wb3J0IHsgU3RhdGljSW1hZ2UsIEltYWdlVGlsZSwgSW1hZ2VUaWxlTGF5ZXIgfSBmcm9tIFwiLi9jYW52YXN0aWxlXCI7XG5pbXBvcnQgeyBHcmlkTGF5ZXIgfSBmcm9tIFwiLi9ncmlkXCI7XG5cbmV4cG9ydCBjbGFzcyBWaWV3Q2FudmFzIGV4dGVuZHMgVmlld3BvcnQge1xuXG4gICAgcHJpdmF0ZSBzdGF0aWNFbGVtZW50czogQXJyYXk8U3RhdGljSW1hZ2U+ID0gW107XG4gICAgcHJpdmF0ZSBpbWFnZVRpbGVMYXllcnMgPSBbXTtcblxuICAgIHByaXZhdGUgZ3JpZExheWVyOiBHcmlkTGF5ZXI7XG5cbiAgICBwcml2YXRlIG9mZnNjcmVlbjogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgIHByaXZhdGUgd2lkdGg6IG51bWJlcjtcbiAgICBwcml2YXRlIGhlaWdodDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IodG9wTGVmdDogUG9pbnQyRCwgXG4gICAgXHR3aWR0aE1hcFVuaXRzOiBudW1iZXIsIGhlaWdodE1hcFVuaXRzOiBudW1iZXIsIHByaXZhdGUgZ3JpZDogYm9vbGVhbixcbiAgICBcdHB1YmxpYyBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkge1xuXG4gICAgXHRzdXBlcih0b3BMZWZ0LCB3aWR0aE1hcFVuaXRzLCBoZWlnaHRNYXBVbml0cyk7XG5cbiAgICAgICAgdGhpcy53aWR0aCA9IGN0eC5jYW52YXMuY2xpZW50V2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gY3R4LmNhbnZhcy5jbGllbnRIZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5jdHguY2FudmFzLndpZHRoID0gdGhpcy53aWR0aDtcbiAgICAgICAgdGhpcy5jdHguY2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwib25zY3JlZW4gXCIgKyB0aGlzLmN0eC5jYW52YXMud2lkdGggKyBcIiwgXCIgKyB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICAvL2NvbnN0IGMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgICBjb25zdCBjID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib2Zmc2NyZWVuXCIpO1xuICAgICAgICBjLndpZHRoID0gdGhpcy53aWR0aDtcbiAgICAgICAgYy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcblxuICAgICAgICB0aGlzLm9mZnNjcmVlbiA9IDxDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ+Yy5nZXRDb250ZXh0KFwiMmRcIik7XG5cbiAgICAgICAgaWYgKGdyaWQpXG4gICAgXHQgICAgdGhpcy5ncmlkTGF5ZXIgPSBuZXcgR3JpZExheWVyKHRoaXMub2Zmc2NyZWVuLCAxKTtcbiAgICB9XG5cbiAgICBhZGRUaWxlTGF5ZXIoaW1hZ2VUaWxlTGF5ZXI6IEltYWdlVGlsZUxheWVyKTogdm9pZCB7XG4gICAgXHR0aGlzLmltYWdlVGlsZUxheWVycy5wdXNoKGltYWdlVGlsZUxheWVyKTtcbiAgICB9XG5cbiAgICBhZGRTdGF0aWNFbGVtZW50KHN0YXRpY0ltYWdlOiBTdGF0aWNJbWFnZSk6IHZvaWQge1xuICAgIFx0dGhpcy5zdGF0aWNFbGVtZW50cy5wdXNoKHN0YXRpY0ltYWdlKTtcbiAgICB9XG5cbiAgICBnZXRWaWV3U2NhbGluZyhwaXhlbHNQZXJVbml0OiBudW1iZXIpOiBQb2ludDJEIHtcbiAgICBcdGxldCBkaW1lbnNpb24gPSB0aGlzLmdldERpbWVuc2lvbnMoKTtcbiAgICBcdGxldCB2aWV3U2NhbGluZ1ggPSB0aGlzLmN0eC5jYW52YXMuY2xpZW50V2lkdGggLyBkaW1lbnNpb24ueCAvIHBpeGVsc1BlclVuaXQ7XG4gICAgXHRsZXQgdmlld1NjYWxpbmdZID0gdGhpcy5jdHguY2FudmFzLmNsaWVudEhlaWdodCAvIGRpbWVuc2lvbi55IC8gcGl4ZWxzUGVyVW5pdDtcbiAgICBcdHJldHVybiBuZXcgUG9pbnQyRCh2aWV3U2NhbGluZ1gsIHZpZXdTY2FsaW5nWSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzY2FsZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgXG4gICAgICAgIHBpeGVsc1BlclVuaXQ6IG51bWJlciwgZGltZW5zaW9uOiBQb2ludDJELCByZXZlcnNlOiBib29sZWFuKTogdm9pZCB7XG5cbiAgICBcdGxldCB2aWV3U2NhbGluZyA9IHRoaXMuZ2V0Vmlld1NjYWxpbmcocGl4ZWxzUGVyVW5pdCk7XG5cbiAgICBcdGlmIChyZXZlcnNlKXtcbiAgICBcdFx0Y3R4LnNjYWxlKDEvdmlld1NjYWxpbmcueCwgMS92aWV3U2NhbGluZy55KTtcbiAgICBcdH0gZWxzZSB7XG4gICAgXHRcdGN0eC5zY2FsZSh2aWV3U2NhbGluZy54LCB2aWV3U2NhbGluZy55KTtcbiAgICBcdH1cbiAgICBcdFxuICAgIH1cblxuICAgIGRyYXcoKTogdm9pZCB7XG4gICAgXHRsZXQgZGltZW5zaW9uID0gdGhpcy5nZXREaW1lbnNpb25zKCk7XG5cbiAgICAgICAgbGV0IGxvY2FsQ29udGV4dCA9IHRoaXMub2Zmc2NyZWVuO1xuXG4gICAgXHRsb2NhbENvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuICAgIFx0Zm9yIChsZXQgdmFsdWUgb2YgdGhpcy5pbWFnZVRpbGVMYXllcnMpe1xuICAgIFx0XHRpZiAodmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnZpc2libGUpIHtcblxuICAgICAgICAgICAgICAgIGxvY2FsQ29udGV4dC5nbG9iYWxBbHBoYSA9IHZhbHVlLmltYWdlUHJvcGVydGllcy5vcGFjaXR5O1xuXG4gICAgICAgICAgICAgICAgbGV0IHNjYWxlZFRpbGVXaWR0aCA9IHZhbHVlLmltYWdlUHJvcGVydGllcy50aWxlV2lkdGhQeCAvIFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZS5pbWFnZVByb3BlcnRpZXMud2lkdGhNYXBVbml0cztcblxuICAgICAgICAgICAgICAgIGxldCBzY2FsZWRUaWxlSGVpZ2h0ID0gdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVIZWlnaHRQeCAvIFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZS5pbWFnZVByb3BlcnRpZXMuaGVpZ2h0TWFwVW5pdHM7XG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInN0d2g6IFwiICsgc2NhbGVkVGlsZVdpZHRoICsgXCIsIFwiICsgc2NhbGVkVGlsZUhlaWdodCk7XG4gICAgXHRcdFx0dGhpcy5zY2FsZShsb2NhbENvbnRleHQsIHNjYWxlZFRpbGVXaWR0aCwgZGltZW5zaW9uLCBmYWxzZSk7XG5cbiAgICAgICAgICAgICAgICBsZXQgeCA9IHRoaXMudG9wTGVmdC54IC8gdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLndpZHRoTWFwVW5pdHM7XG4gICAgICAgICAgICAgICAgbGV0IHkgPSB0aGlzLnRvcExlZnQueSAvIHZhbHVlLmltYWdlUHJvcGVydGllcy5oZWlnaHRNYXBVbml0cztcbiAgICAgICAgICAgICAgICBcbiAgICBcdFx0XHRsZXQgdGlsZXM6IEFycmF5PEltYWdlVGlsZT4gPSB2YWx1ZS5nZXRUaWxlcyh0aGlzLnRvcExlZnQsIFxuICAgIFx0XHRcdFx0ZGltZW5zaW9uLngsIFxuICAgICAgICAgICAgICAgICAgICBkaW1lbnNpb24ueSk7XG5cbiAgICBcdFx0XHRmb3IgKGxldCB0aWxlIG9mIHRpbGVzKXtcblxuICAgIFx0XHRcdFx0dmFyIHRpbGVYID0gc2NhbGVkVGlsZVdpZHRoICsgKHRpbGUueEluZGV4IC0geCkgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLmltYWdlUHJvcGVydGllcy50aWxlV2lkdGhQeDtcbiAgICBcdFx0XHRcdHZhciB0aWxlWSA9IC1zY2FsZWRUaWxlSGVpZ2h0ICsgKHRpbGUueUluZGV4IC0geSkgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLmltYWdlUHJvcGVydGllcy50aWxlSGVpZ2h0UHg7XG5cbiAgICBcdFx0XHRcdHRpbGUuZHJhdyhsb2NhbENvbnRleHQsIHRpbGVYLCB0aWxlWSk7XG4gICAgXHRcdFx0fVxuXG4gICAgXHRcdFx0dGhpcy5zY2FsZShsb2NhbENvbnRleHQsIHNjYWxlZFRpbGVXaWR0aCwgZGltZW5zaW9uLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBsb2NhbENvbnRleHQuZ2xvYmFsQWxwaGEgPSAxO1xuICAgIFx0XHR9XG4gICAgXHR9XG5cbiAgICBcdGZvciAobGV0IHZhbHVlIG9mIHRoaXMuc3RhdGljRWxlbWVudHMpe1xuICAgIFx0XHQvLzI1NiBweCBpcyAxIG1hcCB1bml0XG5cdFx0XHRsZXQgdGlsZVNjYWxpbmdYID0gMjU2O1xuXHRcdFx0bGV0IHRpbGVTY2FsaW5nWSA9IDI1NjtcblxuICAgIFx0XHR0aGlzLnNjYWxlKGxvY2FsQ29udGV4dCwgMjU2LCBkaW1lbnNpb24sIGZhbHNlKTtcblxuICAgIFx0XHRsZXQgaW1hZ2VYID0gKHZhbHVlLnhJbmRleCAtIHRoaXMudG9wTGVmdC54KSAqIHRpbGVTY2FsaW5nWDtcbiAgICBcdFx0bGV0IGltYWdlWSA9ICh2YWx1ZS55SW5kZXggLSB0aGlzLnRvcExlZnQueSkgKiB0aWxlU2NhbGluZ1k7XG5cbiAgICBcdFx0dmFsdWUuZHJhdyhsb2NhbENvbnRleHQsIGltYWdlWCwgaW1hZ2VZKTtcbiAgICBcdFx0dGhpcy5zY2FsZShsb2NhbENvbnRleHQsIDI1NiwgZGltZW5zaW9uLCB0cnVlKTtcblxuICAgIFx0fVxuXG4gICAgICAgIGlmICh0aGlzLmdyaWQpe1xuICAgICAgICAgICAgdGhpcy5zY2FsZShsb2NhbENvbnRleHQsIDI1NiwgZGltZW5zaW9uLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLmdyaWRMYXllci5kcmF3KHRoaXMudG9wTGVmdCwgZGltZW5zaW9uLngsIGRpbWVuc2lvbi55KTtcbiAgICAgICAgICAgIHRoaXMuc2NhbGUobG9jYWxDb250ZXh0LCAyNTYsIGRpbWVuc2lvbiwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICBcdFxuICAgICAgICBsZXQgaW1hZ2VEYXRhOiBJbWFnZURhdGEgPSBsb2NhbENvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImltYWdlIGRhdGEgXCIsIGltYWdlRGF0YSk7XG4gICAgICAgIHRoaXMuY3R4LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuXG4gICAgICAgIHRoaXMuZHJhd0NlbnRyZSh0aGlzLmN0eCk7XG5cbiAgICB9XG5cbiAgICBkcmF3Q2VudHJlKGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCl7XG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIGNvbnRleHQuZ2xvYmFsQWxwaGEgPSAwLjM7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLndpZHRoLzIsIDYvMTYqdGhpcy5oZWlnaHQpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyh0aGlzLndpZHRoLzIsIDEwLzE2KnRoaXMuaGVpZ2h0KTtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8oNy8xNip0aGlzLndpZHRoLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oOS8xNip0aGlzLndpZHRoLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgV29ybGQyRCB9IGZyb20gXCIuL2dlb20vd29ybGQyZFwiO1xuaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tIFwiLi9nZW9tL3ZpZXdwb3J0XCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBTdGF0aWNJbWFnZSwgSW1hZ2VUaWxlTGF5ZXIsIEltYWdlU3RydWN0LCBTbGlwcHlUaWxlTGF5ZXIgfSBmcm9tIFwiLi9ncmFwaGljcy9jYW52YXN0aWxlXCI7XG5pbXBvcnQgeyBWaWV3Q2FudmFzIH0gZnJvbSBcIi4vZ3JhcGhpY3Mvdmlld2NhbnZhc1wiO1xuaW1wb3J0IHsgWm9vbUNvbnRyb2xsZXIsIFBhbkNvbnRyb2xsZXIgfSBmcm9tIFwiLi91aS9tYXBDb250cm9sbGVyXCI7XG5pbXBvcnQgeyBJbWFnZUNvbnRyb2xsZXIsIExheWVyQ29udHJvbGxlcn0gZnJvbSBcIi4vdWkvaW1hZ2VDb250cm9sbGVyXCI7XG5cbmxldCBzaW1wbGVXb3JsZCA9IG5ldyBXb3JsZDJEKCk7XG5cbi8vIGxldCBsYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbi8vIGxheWVyUHJvcGVydGllcy5wcmVmaXggPSBcIlwiO1xuLy8gbGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwiLnBuZ1wiO1xuXG4vLyBsZXQgcm9hZExheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuLy8gcm9hZExheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImIucG5nXCI7XG5cbi8vIGxldCBzZW50aW5lbExheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuLy8gc2VudGluZWxMYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCJsLmpwZWdcIjtcblxuLy8gbGV0IHNlbnRpbmVsVGVycmFpbkxheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuLy8gc2VudGluZWxUZXJyYWluTGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwidC5qcGVnXCI7XG5cbmxldCBsaWZmZXlMYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbmxpZmZleUxheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImxpZmZleS5qcGVnXCI7XG5saWZmZXlMYXllclByb3BlcnRpZXMudGlsZURpciA9IFwiaW1hZ2VzL2xpZmZleS9cIjtcblxubGV0IGxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG5saWZmZXlMYWJlbExheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImxpZmZleS5wbmdcIjtcbmxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzLm9wYWNpdHkgPSAxO1xubGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMudGlsZURpciA9IFwiaW1hZ2VzL2xpZmZleS9cIjtcbmxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzLnZpc2libGUgPSB0cnVlO1xuXG5sZXQgc2xpcHB5TGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG5zbGlwcHlMYXllclByb3BlcnRpZXMudGlsZURpciA9IFwiaW1hZ2VzL3F0aWxlL2R1Ymxpbi9cIjtcbnNsaXBweUxheWVyUHJvcGVydGllcy5zdWZmaXggPSBcIi5wbmdcIjtcbmxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzLm9wYWNpdHkgPSAuNDtcbnNsaXBweUxheWVyUHJvcGVydGllcy53aWR0aE1hcFVuaXRzID0gMjtcbnNsaXBweUxheWVyUHJvcGVydGllcy5oZWlnaHRNYXBVbml0cyA9IDI7XG5cblxuLy8gbGV0IGJhc2VMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihsYXllclByb3BlcnRpZXMpO1xuLy8gbGV0IHNlbnRpbmVsTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIoc2VudGluZWxMYXllclByb3BlcnRpZXMpO1xuLy8gbGV0IHJvYWRMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihyb2FkTGF5ZXJQcm9wZXJ0aWVzKTtcbi8vIGxldCB0ZXJyYWluTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIoc2VudGluZWxUZXJyYWluTGF5ZXJQcm9wZXJ0aWVzKTtcblxubGV0IGxpZmZleVNlbnRpbmVsTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIobGlmZmV5TGF5ZXJQcm9wZXJ0aWVzKTtcbmxldCBsaWZmZXlMYWJlbExheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKGxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzKTtcblxubGV0IHNsaXBweVRpbGVMYXllciA9IG5ldyBTbGlwcHlUaWxlTGF5ZXIoc2xpcHB5TGF5ZXJQcm9wZXJ0aWVzLCAxNiwgMzE2MjgsIDIxMjQyKTtcblxubGV0IGRvbGllckltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDIuMjQsIDEuODcsIC40MywgLjQzLCAtMC4wNiwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAxN1JbU1ZDMl0uanBnXCIsIC43KTtcblxubGV0IG1hcnlJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtLjk2LCAtLjU5LCAuNDEsIC40MiwgLTAuMzI1LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDAycl8yW1NWQzJdICgxKS5wbmdcIiwgMC43KTtcblxubGV0IHRyaW5pdHlJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgxLjk5LCAzLjU5LCAuNDMsIC40MywgMC4xNSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAxOVJbU1ZDMl0uanBnXCIsIC43KTtcblxubGV0IHBvb2xiZWdJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgzLjM0LCAxLjYyNSwgLjQwNSwgLjQzLCAwLjA1LFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMThSW1NWQzJdLmpwZ1wiLCAuNyk7XG5cbmxldCBhYmJleUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDIuMzksIDAuMDM1LCAuNDE1LCAuNDM1LCAtLjI1LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDA4cltTVkMyXS5qcGdcIiwgLjcpO1xuXG5sZXQgYnVzYXJhc0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDMuNDksIC0wLjI0LCAuNDEsIC40MjUsIC0uMjYsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDlyW1NWQzJdLmpwZ1wiLCAuNyk7XG5cbmxldCBsb3dlcmFiYmV5SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMS4yOTUsIDAuMzc3NiwgLjQyNSwgLjQzNSwgLS4yMywgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwN3JbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBkYW1lSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMC45OCwgMi4zMTUsIC40MSwgLjQyOCwgLTAuMDk1LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDE2cl8yW1NWQzJdLnBuZ1wiLCAwLjcpO1xuXG5sZXQgY3VzdG9tSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoNS4yMSwgLS4yNDUsIC40MiwgLjQ0LCAwLjAzLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDEwcl8yW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgbWFub3JJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSg2LjM2LCAwLjAyNSwgLjQxNSwgLjQzNSwgMC4xMSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAxMXJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBzYWNrdmlsbGVJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgxLjI5LCAtMS4yOCwgLjQ2LCAuNDIsIC0wLjI2NSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwNHJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBncmVhdEltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC4xOSwgLTAuNzA1LCAuNCwgLjQyLCAtLjUxLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDAzcltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IGxvd2Vyb3Jtb25kSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMC4xNiwgMC43MSwgLjQwNSwgLjQ0LCAtMC4yMDUsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDZyW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgc3RlcGhlbnNJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgxLjcyNSwgNC45LCAuMjA1LCAuMjE1LCAwLjE5NSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAyMFJbU1ZDMl0uanBnXCIsIDAuNik7XG5cbmxldCBzdG1hcnlzSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTEuMDU1LCAxLjAyLCAuNDMsIC40MTUsIC0wLjIxLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDA1cltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IHN0ZWFtSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoOC4xNDUsIDAuMjY1LCAuODE1LCAuOTIsIDAuMTIsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMTJyXzFbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBmaWZ0ZWVuSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTMuOCwgMi44NSwgMC40LCAuNCwgLTEuNDcsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMTVyXzJbU1ZDMl0ucG5nXCIsIDAuNyk7XG5cblxubGV0IGhlbnJpZXR0YUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0yLjM1NSwgLTIuNDMsIDAuNjEsIDAuNjEsIDAuMDUsIFxuXHRcImltYWdlcy9oZW5yaWV0dGEucG5nXCIsIDAuNyk7XG5cbmxldCBtYXRlcm1pc0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0xLjE4LCAtNi40LCAwLjI1LCAwLjMyLCAwLjE0NSwgXG5cdFwiaW1hZ2VzL21hdGVybWlzLnBuZ1wiLCAwLjcpO1xuXG5sZXQgb2Nvbm5lbGxJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtNC41NCwgLTEzLjU1LCAwLjI1LCAwLjMyLCAwLCBcblx0XCJpbWFnZXMvb2Nvbm5lbGwucG5nXCIsIDAuNyk7XG5cbmxldCBmb3VyY291cnRzSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTMuMjgsIDEuNzcsIDAuNTUsIDAuNTUsIC0wLjAzLCBcblx0XCJpbWFnZXMvZm91cmNvdXJ0cy5wbmdcIiwgMSk7XG5cbmxldCBtaWNoYW5zSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTMuODgsIDAuNywgMC4zMiwgMC4zMiwgLTAuMDMsIFxuXHRcImltYWdlcy9taWNoYW5zLnBuZ1wiLCAxKTtcblxuXG5sZXQgbWFya2V0SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTMuMzY1LCAzLjc5LCAwLjMsIDAuMywgMC4wNCwgXG5cdFwiaW1hZ2VzL21hcmtldC5wbmdcIiwgMC43KTtcblxuXG5sZXQgdGhlY2FzdGxlSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTAuODcsIDMuNDgsIDAuNDgsIDAuNTYsIC0wLjExNSwgXG5cdFwiaW1hZ2VzL3RoZWNhc3RsZS5wbmdcIiwgMSk7XG5cbmxldCBuZ2lyZWxhbmRJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSg0LjU4LCA0LjkyLCAwLjM2LCAwLjQ2LCAtMC4wODUsIFxuXHRcImltYWdlcy9uZ2lyZWxhbmQucG5nXCIsIDEpO1xuXG5sZXQgYmx1ZWNvYXRzSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTYuNjE5LCAtMC4xNjUsIDAuNCwgMC40LCAtMC4wNSwgXG5cdFwiaW1hZ2VzL2JsdWVjb2F0cy5wbmdcIiwgMC43KTtcblxubGV0IGh1Z2hsYW5lSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMC4xMSwgLTMuMjcsIDAuNCwgMC40LCAtMC4yMjUsIFxuXHRcImltYWdlcy9odWdobGFuZS5wbmdcIiwgMC43KTtcblxubGV0IG1vdW50am95SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMy4zMzUsIC01LjEzNSwgMC40LCAwLjQsIDAuMTcsIFxuXHRcImltYWdlcy9tb3VudGpveS5wbmdcIiwgMC43KTtcblxubGV0IGN1c3RvbXNJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSg0LjM5LCAwLjMyLCAwLjQzLCAwLjQzLCAtMC4wNSwgXG5cdFwiaW1hZ2VzL2N1c3RvbXNob3VzZS5wbmdcIiwgMC43KTtcblxubGV0IGxpYmVydHlJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgzLjQzLCAwLjAwOSwgMC40MywgMC40MywgLTAuMDUsIFxuXHRcImltYWdlcy9saWJlcnR5LnBuZ1wiLCAwLjcpO1xuXG5sZXQgY3Jvc3NQb2RkbGUgPSBuZXcgU3RhdGljSW1hZ2UoLTIuODQ2LCA2LjEyNSwgLjE5OSwgLjIwNSwgLTAuMDI1LCBcblx0XCJpbWFnZXMvd3NjLW1hcHMtNDMzLTIuanBnXCIsIDAuNyk7XG5cbmxldCBwYXRyaWNrc0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0yLjI3LCA1Ljk1LCAuNCwgLjQsIDAuMDM1LCBcblx0XCJpbWFnZXMvd3NjLW1hcHMtMTg0LTEtZnJvbnQuanBnXCIsIDAuNik7XG5cbmxldCBjbG9ubWVsSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMS44NDUsIDguMTIsIC44MywgLjgzLCAtMi43MjUsIFxuXHRcImltYWdlcy93c2MtbWFwcy00NjctMDIucG5nXCIsIDAuNyk7XG5cbmxldCBwYXJsaWFtZW50SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTAuOSwgMi42NywgLjUsIC41LCAtMy4zMiwgXG5cdFwiaW1hZ2VzL3dzYy1tYXBzLTA4OC0xLnBuZ1wiLCAwLjcpO1xuXG5sZXQgY3V0cHVyc2VJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMy44ODUsIDMuNDMsIC41MzUsIC41NDUsIC0wLjA3NCwgXG5cdFwiaW1hZ2VzL3dzYy1tYXBzLTEwNi0xLmpwZ1wiLCAwLjcpO1xuXG5cbmxldCBjdXRwYXRyaWNrT3ZlcmxheUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0yLjk4LCA0LjMyLCAxLjUzLCAxLjUzLCAtMC4wMjUsIFxuXHRcImltYWdlcy9XU0MtTWFwcy03NTdfb3ZlcmxheS5wbmdcIiwgMC43KTtcblxubGV0IGJyb2Fkc3RvbmVJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMi42MSwgLTAuMDU1LCAuNjIsIC42MiwgMS41NjUsIFxuXHRcImltYWdlcy93c2MtbWFwcy0wNzItbS5wbmdcIiwgMC45KTtcblxubGV0IGJyb2Fkc3RvbmVVcEltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0yLjY3NSwgLTYuMjMsIDEuNTgsIDEuNTgsIDEuNjE1LCBcblx0XCJpbWFnZXMvd3NjLW1hcHMtMDc1LW0yLnBuZ1wiLCAwLjkpO1xuXG5sZXQgY3V0cGF0cmlja0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0yLjk2LCA0LjM3NSwgLjcxNDk5LCAuNzE0OTksIC0wLjAyNSwgXG5cdFwiaW1hZ2VzL3dzYy1tYXBzLTc1Ny1sLnBuZ1wiLCAwLjcpO1xuXG5sZXQgYmFycmFja3NJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMi4xMSwgMi44NywgMi4wNCwgMS45NDUsIC0wLjAyNSwgXG5cdFwiaW1hZ2VzL3dzYy1tYXBzLTE1NS1tLnBuZ1wiLCAwLjQpO1xuXG5sZXQgamFtZXNJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtOS41NSwgMy45NSwgLjM1NSwgLjM1NSwgLTMuNDYsIFxuXHRcImltYWdlcy93c2MtbWFwcy03MjktbS5wbmdcIiwgMC41KTtcblxubGV0IGJlbGxvSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLjk5NSwgMTEuODg1LCAxLjIsIDEuMiwgLTIsIFxuXHRcImltYWdlcy93c2MtbWFwcy0xNDJfbS5wbmdcIiwgMC43KTtcblxuXG5cbmxldCB0aGluZ0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0yLjUsIDMuNiwgMS4yMiwgMS4xNiwgMCwgXG5cdFwiaW1hZ2VzL0lNR18wNjQ2LnBuZ1wiLCAwLjQpO1xuXG5sZXQgcG9ydG9JbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMS43LCAxMi41LCAxLjUyLCAxLjYzLCAuNTQsIFxuXHRcImltYWdlcy9wb3J0b2JlbGxvLnBuZ1wiLCAwLjQpO1xuXG4vLyBsZXQgcG9ydG9JbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMC4zLCAxMS4zLCAxLjQsIDEuNCwgLjMsIFxuLy8gXHRcImltYWdlcy9wb3J0b2JlbGxvLnBuZ1wiLCAwLjQpO1xuXG5sZXQgZG9ubnlJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSg2LCAxMy4wMSwgMS4zNDUsIDEuNzMsIC4yOSwgXG5cdFwiaW1hZ2VzL2Rvbm55LnBuZ1wiLCAwLjIpO1xuXG5cbmxldCBzaXh0ZWVudGVuSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTEuOCwgMi43OTUsIC45OCwgMSwgLjExNSwgXG5cdFwiaW1hZ2VzL2R1YmxpbjE2MTAucG5nXCIsIDAuMik7XG5cbmxldCBibHVlY29hdEltYWdlID0gbmV3IFN0YXRpY0ltYWdlKC0zLjQzNSwgLTEuOTk1LCAyLjM5LCAyLjM1NSwgMCwgXG5cdFwiaW1hZ2VzL2JsdWVjb2F0LnBuZ1wiLCAwLjQpO1xuXG5sZXQgcnV0bGFuZEltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDIuMjQ1LCAtMC43OTUsIDEuOTc1LCAxLjk3NSwgMCwgXG5cdFwiaW1hZ2VzL3J1dGxhbmQucG5nXCIsIDAuNyk7XG5cbmxldCBtYXRlckltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDIuMDksIC01LjM1NSwgMi4wMTAsIDIuMDE1LCAwLCBcblx0XCJpbWFnZXMvbWF0ZXIucG5nXCIsIDAuNSk7XG5cbmxldCB0b3duc2VuZEltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDQuNTc1LCAzLjk5NSwgMi4wMzUsIDIuMDM1LCAwLCBcblx0XCJpbWFnZXMvdG93bnNlbmQucG5nXCIsIDAuNyk7XG5cbmxldCBjYXN0bGVJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgtMy41MSwgMi4zNzUsIDEuOTg1LCAxLjk5NSwgMCwgXG5cdFwiaW1hZ2VzL2Nhc3RsZS5wbmdcIiwgMC40KTtcblxubGV0IGlubmVyRG9ja0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDkuMjE1LCAtMC44LCAzLjQ1NSwgMy40MiwgMCwgXG5cdFwiaW1hZ2VzL2lubmVyRG9jay5wbmdcIiwgMC40KTtcblxubGV0IGdyYW5kSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMC43NTUsIDMuMiwgLjYsIC42LCAxLjIzNSwgXG5cdFwiaW1hZ2VzL3dzYy1tYXBzLTMzNC5wbmdcIiwgMC40KTtcblxubGV0IHRvdGFsSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoNC40ODUsIC0xLjg3NSwgNy40NjUsIDcuMzUsIDAsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDFyW1NWQzJdLmpwZ1wiLCAuMyk7XG5cbmxldCB0b3RhbE92ZXJsYXlJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSg0LjQ1LCAtMS44NCwgMy44OTMsIDMuODI5LCAwLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDAxcltTVkMyXS5wbmdcIiwgLjUpO1xuXG5mdW5jdGlvbiBzaG93TWFwKGRpdk5hbWU6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpdk5hbWUpO1xuXG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdGxldCB2aWV3Q2FudmFzID0gbmV3IFZpZXdDYW52YXMobmV3IFBvaW50MkQoLTEyLC0xMCksIDI3LCAxOCwgZmFsc2UsIGN0eCk7XG5cdC8vIHZpZXdDYW52YXMuYWRkVGlsZUxheWVyKGJhc2VMYXllcik7XG5cdC8vIHZpZXdDYW52YXMuYWRkVGlsZUxheWVyKHNlbnRpbmVsTGF5ZXIpO1xuXHR2aWV3Q2FudmFzLmFkZFRpbGVMYXllcihzbGlwcHlUaWxlTGF5ZXIpO1xuXHQvL3ZpZXdDYW52YXMuYWRkVGlsZUxheWVyKGxpZmZleVNlbnRpbmVsTGF5ZXIpO1xuXHQvL3ZpZXdDYW52YXMuYWRkVGlsZUxheWVyKGxpZmZleUxhYmVsTGF5ZXIpO1xuXG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudCh0b3RhbEltYWdlKTtcblx0Ly92aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQodG90YWxPdmVybGF5SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoYnJvYWRzdG9uZUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGJyb2Fkc3RvbmVVcEltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHBhcmxpYW1lbnRJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChjdXRwdXJzZUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGdyYW5kSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQocnV0bGFuZEltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KG1hdGVySW1hZ2UpO1xuXHQvL3ZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudCh0b3duc2VuZEltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGlubmVyRG9ja0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGN1dHBhdHJpY2tJbWFnZSk7XG5cdC8vdmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGN1dHBhdHJpY2tPdmVybGF5SW1hZ2UpO1xuXG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChtYXJ5SW1hZ2UpO1x0XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChzdGVwaGVuc0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGRvbGllckltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHRyaW5pdHlJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChwb29sYmVnSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoYWJiZXlJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChsb3dlcmFiYmV5SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoYnVzYXJhc0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHN0ZWFtSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoZGFtZUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGN1c3RvbUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KG1hbm9ySW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoc2Fja3ZpbGxlSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoZ3JlYXRJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChsb3dlcm9ybW9uZEltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHN0bWFyeXNJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChwYXRyaWNrc0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGJhcnJhY2tzSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoamFtZXNJbWFnZSk7XG5cdC8vdmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGNyb3NzUG9kZGxlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGNsb25tZWxJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudCh0aGluZ0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGJsdWVjb2F0SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoY2FzdGxlSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoZmlmdGVlbkltYWdlKTtcblxuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoaGVucmlldHRhSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQobWF0ZXJtaXNJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChmb3VyY291cnRzSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoYmx1ZWNvYXRzSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoaHVnaGxhbmVJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChtb3VudGpveUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGN1c3RvbXNJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChsaWJlcnR5SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQobWljaGFuc0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHRoZWNhc3RsZUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KG5naXJlbGFuZEltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KG9jb25uZWxsSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQobWFya2V0SW1hZ2UpO1xuXG5cdC8vdmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHBvcnRvSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoZG9ubnlJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChiZWxsb0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHNpeHRlZW50ZW5JbWFnZSk7XG5cblx0bGV0IGltYWdlQ29udHJvbGxlciA9IG5ldyBJbWFnZUNvbnRyb2xsZXIodmlld0NhbnZhcywgbWFya2V0SW1hZ2UpO1xuXG5cdGNvbnN0IHBsdXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwbHVzXCIpO1xuXHRjb25zdCBtaW51cyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1pbnVzXCIpO1xuXG5cdGxldCBwYW5Db250cm9sID0gbmV3IFBhbkNvbnRyb2xsZXIodmlld0NhbnZhcywgY2FudmFzKTtcblx0bGV0IGNhbnZhc0NvbnRyb2wgPSBuZXcgWm9vbUNvbnRyb2xsZXIodmlld0NhbnZhcywgcGx1cywgbWludXMpO1xuXG5cdGNhbnZhc0NvbnRyb2wuYWRkWm9vbUxpc3RlbmVyKHBhbkNvbnRyb2wpO1xuXG5cdGxldCBsYXllckNvbnRyb2xsZXIgPSBuZXcgTGF5ZXJDb250cm9sbGVyKHZpZXdDYW52YXMsIHNsaXBweVRpbGVMYXllcik7XG5cblx0dmlld0NhbnZhcy5kcmF3KCk7XG59XG5cbmZ1bmN0aW9uIHNob3coKXtcblx0c2hvd01hcChcImNhbnZhc1wiLCBcIlR5cGVTY3JpcHRcIik7XG59XG5cbmlmIChcbiAgICBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgfHxcbiAgICAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gXCJsb2FkaW5nXCIgJiYgIWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5kb1Njcm9sbClcbikge1xuXHRzaG93KCk7XG59IGVsc2Uge1xuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBzaG93KTtcbn1cblxuIiwiaW1wb3J0IHsgU3RhdGljSW1hZ2UsIFNob3dUaWxlTGF5ZXIgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvY2FudmFzdGlsZVwiO1xuaW1wb3J0IHsgVmlld0NhbnZhcyB9IGZyb20gXCIuLi9ncmFwaGljcy92aWV3Y2FudmFzXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5cbmV4cG9ydCBjbGFzcyBMYXllckNvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3Iodmlld0NhbnZhczogVmlld0NhbnZhcywgcmVhZG9ubHkgdGlsZUxheWVyOiBTaG93VGlsZUxheWVyKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLnByZXNzZWQodmlld0NhbnZhcywgZSAgYXMgS2V5Ym9hcmRFdmVudCkpO1xuICAgIH1cblxuICAgIHByZXNzZWQodmlld0NhbnZhczogVmlld0NhbnZhcywgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJwcmVzc2VkIGxheWVyXCIgKyBldmVudC50YXJnZXQgKyBcIiwgXCIgKyBldmVudC5rZXkpO1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICAgICAgICBjYXNlIFwidlwiOlxuICAgICAgICAgICAgICAgIHRoaXMudGlsZUxheWVyLmltYWdlUHJvcGVydGllcy52aXNpYmxlID0gIXRoaXMudGlsZUxheWVyLmltYWdlUHJvcGVydGllcy52aXNpYmxlO1xuICAgICAgICAgICAgICAgIHZpZXdDYW52YXMuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VDb250cm9sbGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIHJlYWRvbmx5IHN0YXRpY0ltYWdlOiBTdGF0aWNJbWFnZSkge1xuICAgIFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5wcmVzc2VkKHZpZXdDYW52YXMsIGUgIGFzIEtleWJvYXJkRXZlbnQpKTtcbiAgICB9XG5cbiAgICBwcmVzc2VkKHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgXHRjb25zb2xlLmxvZyhcInByZXNzZWRcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LmtleSk7XG5cbiAgICBcdHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgXHRcdGNhc2UgXCJhXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS54SW5kZXggPSB0aGlzLnN0YXRpY0ltYWdlLnhJbmRleCAtIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiZFwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2UueEluZGV4ID0gdGhpcy5zdGF0aWNJbWFnZS54SW5kZXggKyAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIndcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnlJbmRleCA9IHRoaXMuc3RhdGljSW1hZ2UueUluZGV4IC0gMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJzXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS55SW5kZXggPSB0aGlzLnN0YXRpY0ltYWdlLnlJbmRleCArIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiZVwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uucm90YXRpb24gPSB0aGlzLnN0YXRpY0ltYWdlLnJvdGF0aW9uIC0gMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJxXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5yb3RhdGlvbiA9IHRoaXMuc3RhdGljSW1hZ2Uucm90YXRpb24gKyAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInhcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdYID0gdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWCAtIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiWFwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1ggPSB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdYICsgMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJ6XCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWSA9IHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1kgLSAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIlpcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdZID0gdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWSArIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRpY0ltYWdlLmFscGhhID0gTWF0aC5taW4oMS4wLCB0aGlzLnN0YXRpY0ltYWdlLmFscGhhICsgMC4xKTtcbiAgICAgICAgICAgICAgICB2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJ0XCI6XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0aWNJbWFnZS5hbHBoYSA9IE1hdGgubWF4KDAsIHRoaXMuc3RhdGljSW1hZ2UuYWxwaGEgLSAwLjEpO1xuICAgICAgICAgICAgICAgIHZpZXdDYW52YXMuZHJhdygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgIFx0XHRkZWZhdWx0OlxuICAgIFx0XHRcdC8vIGNvZGUuLi5cbiAgICBcdFx0XHRicmVhaztcbiAgICBcdH1cbiAgICBcdGNvbnNvbGUubG9nKFwiaW1hZ2UgYXQ6IFwiICsgIHRoaXMuc3RhdGljSW1hZ2UueEluZGV4ICsgXCIsIFwiICsgdGhpcy5zdGF0aWNJbWFnZS55SW5kZXgpO1xuICAgIFx0Y29uc29sZS5sb2coXCJpbWFnZSBybyBzYzogXCIgKyAgdGhpcy5zdGF0aWNJbWFnZS5yb3RhdGlvbiArIFwiLCBcIiArIHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1ggKyBcIiwgXCIgKyB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdZKTtcbiAgICB9O1xuXG59OyIsImltcG9ydCB7IFZpZXdDYW52YXMgfSBmcm9tIFwiLi4vZ3JhcGhpY3Mvdmlld2NhbnZhc1wiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuYWJzdHJhY3QgY2xhc3MgTW91c2VDb250cm9sbGVyIHtcblxuICAgIG1vdXNlUG9zaXRpb24oZXZlbnQ6IE1vdXNlRXZlbnQsIHdpdGhpbjogSFRNTEVsZW1lbnQpOiBQb2ludDJEIHtcbiAgICAgICAgbGV0IG1fcG9zeCA9IGV2ZW50LmNsaWVudFggKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnRcbiAgICAgICAgICAgICAgICAgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdDtcbiAgICAgICAgbGV0IG1fcG9zeSA9IGV2ZW50LmNsaWVudFkgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7XG5cbiAgICAgICAgdmFyIGVfcG9zeCA9IDA7XG4gICAgICAgIHZhciBlX3Bvc3kgPSAwO1xuICAgICAgICBpZiAod2l0aGluLm9mZnNldFBhcmVudCl7XG4gICAgICAgICAgICBkbyB7IFxuICAgICAgICAgICAgICAgIGVfcG9zeCArPSB3aXRoaW4ub2Zmc2V0TGVmdDtcbiAgICAgICAgICAgICAgICBlX3Bvc3kgKz0gd2l0aGluLm9mZnNldFRvcDtcbiAgICAgICAgICAgIH0gd2hpbGUgKHdpdGhpbiA9IDxIVE1MRWxlbWVudD53aXRoaW4ub2Zmc2V0UGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQyRChtX3Bvc3ggLSBlX3Bvc3gsIG1fcG9zeSAtIGVfcG9zeSk7XG4gICAgfVxuICAgIFxufVxuXG5hYnN0cmFjdCBjbGFzcyBab29tTGlzdGVuZXIge1xuICAgIGFic3RyYWN0IHpvb20oYnk6IG51bWJlcik7XG59XG5cbmV4cG9ydCBjbGFzcyBab29tQ29udHJvbGxlciBleHRlbmRzIE1vdXNlQ29udHJvbGxlciB7XG5cblx0cHJpdmF0ZSBsaXN0ZW5lcnM6IEFycmF5PFpvb21MaXN0ZW5lcj4gPSBbXTtcblx0cHJpdmF0ZSB6b29tID0gMTtcblxuICAgIGNvbnN0cnVjdG9yKHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIHJlYWRvbmx5IHpvb21JbjogSFRNTEVsZW1lbnQsIHJlYWRvbmx5IHpvb21PdXQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICBcdHpvb21Jbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGU6RXZlbnQpID0+IHRoaXMuY2xpY2tlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdDYW52YXMsIC45NSkpO1xuICAgIFx0em9vbU91dC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGU6RXZlbnQpID0+IHRoaXMuY2xpY2tlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdDYW52YXMsIDEuMDUpKTtcbiAgICBcdHZpZXdDYW52YXMuY3R4LmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmNsaWNrZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzLCAuNzUpKTtcbiAgICB9XG5cbiAgICBhZGRab29tTGlzdGVuZXIoem9vbUxpc3RlbmVyOiBab29tTGlzdGVuZXIpe1xuICAgIFx0dGhpcy5saXN0ZW5lcnMucHVzaCh6b29tTGlzdGVuZXIpO1xuICAgIH1cblxuICAgIGNsaWNrZWQoZXZlbnQ6IE1vdXNlRXZlbnQsIHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIGJ5OiBudW1iZXIpIHtcblxuICAgIFx0Y29uc29sZS5sb2coXCJjbGlja2VkXCIgKyBldmVudC50YXJnZXQgKyBcIiwgXCIgKyBldmVudC50eXBlKTtcblxuICAgIFx0Y29uc29sZS5sb2coXCJsaXN0ZW5lcnMgXCIgKyB0aGlzLmxpc3RlbmVycy5sZW5ndGgpO1xuXG4gICAgICAgIHN3aXRjaChldmVudC50eXBlKXtcbiAgICAgICAgICAgIGNhc2UgXCJkYmxjbGlja1wiOlxuICAgICAgICAgICAgICAgIGxldCBjYW52YXMgPSB2aWV3Q2FudmFzLmN0eC5jYW52YXM7XG5cbiAgICAgICAgICAgICAgICBpZiAgKGV2ZW50LmN0cmxLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgYnkgPSAxIC8gYnk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxldCBtWFkgPSB0aGlzLm1vdXNlUG9zaXRpb24oZXZlbnQsIHZpZXdDYW52YXMuY3R4LmNhbnZhcyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmlld0NhbnZhcy56b29tQWJvdXQobVhZLnggLyBjYW52YXMuY2xpZW50V2lkdGgsIG1YWS55IC8gY2FudmFzLmNsaWVudEhlaWdodCwgYnkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB2aWV3Q2FudmFzLnpvb21WaWV3KGJ5KTtcbiAgICAgICAgfVxuXG4gICAgXHR0aGlzLnpvb20gPSB0aGlzLnpvb20gKiBieTtcbiAgICBcdGZvciAobGV0IHZhbHVlIG9mIHRoaXMubGlzdGVuZXJzKXtcbiAgICBcdFx0dmFsdWUuem9vbSh0aGlzLnpvb20pO1xuICAgIFx0fVxuXG4gICAgXHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICB9O1xuXG59O1xuXG5leHBvcnQgY2xhc3MgUGFuQ29udHJvbGxlciBleHRlbmRzIFpvb21MaXN0ZW5lciB7XG5cblx0cHJpdmF0ZSB4UHJldmlvdXM6IG51bWJlcjtcblx0cHJpdmF0ZSB5UHJldmlvdXM6IG51bWJlcjtcblx0cHJpdmF0ZSByZWNvcmQ6IGJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBiYXNlTW92ZTogbnVtYmVyID0gMjU2O1xuXHRwcml2YXRlIG1vdmU6IG51bWJlciA9IDI1NjtcblxuICAgIGNvbnN0cnVjdG9yKHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIHJlYWRvbmx5IGRyYWdFbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgIFx0c3VwZXIoKTtcbiAgICBcdGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzKSk7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcykpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzKSk7XG4gICAgICAgIGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIChlOkV2ZW50KSA9PiBcbiAgICAgICAgICAgIHRoaXMucmVjb3JkID0gZmFsc2UpO1xuICAgICAgICB2aWV3Q2FudmFzLmN0eC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIndoZWVsXCIsIChlOiBFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLndoZWVsKGUgYXMgV2hlZWxFdmVudCwgdmlld0NhbnZhcykpO1xuICAgIH1cblxuICAgIHpvb20oYnk6IG51bWJlcil7XG4gICAgXHRjb25zb2xlLmxvZyhcInpvb20gYnkgXCIgKyBieSk7XG4gICAgXHR0aGlzLm1vdmUgPSB0aGlzLmJhc2VNb3ZlIC8gYnk7XG4gICAgfVxuXG5cbiAgICB3aGVlbChldmVudDogV2hlZWxFdmVudCwgdmlld0NhbnZhczogVmlld0NhbnZhcykge1xuXG4gICAgICAgIC8vY29uc29sZS5sb2coXCJ3aGVlbFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQudHlwZSk7XG5cbiAgICAgICAgbGV0IHhEZWx0YSA9IGV2ZW50LmRlbHRhWCAvIHRoaXMubW92ZTtcbiAgICAgICAgbGV0IHlEZWx0YSA9IGV2ZW50LmRlbHRhWSAvIHRoaXMubW92ZTtcblxuICAgICAgICBsZXQgbmV3VG9wTGVmdCA9IG5ldyBQb2ludDJEKHZpZXdDYW52YXMudG9wTGVmdC54IC0geERlbHRhLCBcbiAgICAgICAgICAgIHZpZXdDYW52YXMudG9wTGVmdC55IC0geURlbHRhKTtcblxuICAgICAgICAvL2NvbnNvbGUubG9nKFwidG9wbGVmdCBcIiArIG5ld1RvcExlZnQpO1xuXG4gICAgICAgIHZpZXdDYW52YXMubW92ZVZpZXcobmV3VG9wTGVmdCk7XG4gICAgICAgIHZpZXdDYW52YXMuZHJhdygpO1xuICAgIH1cblxuXG4gICAgZHJhZ2dlZChldmVudDogTW91c2VFdmVudCwgdmlld0NhbnZhczogVmlld0NhbnZhcykge1xuXG4gICAgICAgIGxldCBjYW52YXMgPSB2aWV3Q2FudmFzLmN0eC5jYW52YXM7XG5cbiAgICBcdHN3aXRjaChldmVudC50eXBlKXtcbiAgICBcdFx0Y2FzZSBcIm1vdXNlZG93blwiOlxuICAgIFx0XHRcdHRoaXMucmVjb3JkID0gdHJ1ZTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIm1vdXNldXBcIjpcbiAgICBcdFx0XHR0aGlzLnJlY29yZCA9IGZhbHNlO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRkZWZhdWx0OlxuICAgIFx0XHRcdGlmICh0aGlzLnJlY29yZCl7XG4gICAgICAgICAgICAgICAgICAgIGxldCB4RGVsdGEgPSAoZXZlbnQuY2xpZW50WCAtIHRoaXMueFByZXZpb3VzKSAvIHRoaXMubW92ZTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHlEZWx0YSA9IChldmVudC5jbGllbnRZIC0gdGhpcy55UHJldmlvdXMpIC8gdGhpcy5tb3ZlO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdUb3BMZWZ0ID0gbmV3IFBvaW50MkQodmlld0NhbnZhcy50b3BMZWZ0LnggLSB4RGVsdGEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgdmlld0NhbnZhcy50b3BMZWZ0LnkgLSB5RGVsdGEpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZpZXdDYW52YXMubW92ZVZpZXcobmV3VG9wTGVmdCk7XG4gICAgICAgICAgICAgICAgICAgIHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdH1cbiAgICBcdH1cblxuXHRcdHRoaXMueFByZXZpb3VzID0gZXZlbnQuY2xpZW50WDtcblx0XHR0aGlzLnlQcmV2aW91cyA9IGV2ZW50LmNsaWVudFk7XG5cbiAgICB9O1xuXG4gICAgbW91c2VQb3NpdGlvbihldmVudDogTW91c2VFdmVudCwgd2l0aGluOiBIVE1MRWxlbWVudCk6IFBvaW50MkQge1xuICAgICAgICBsZXQgbV9wb3N4ID0gZXZlbnQuY2xpZW50WCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0O1xuICAgICAgICBsZXQgbV9wb3N5ID0gZXZlbnQuY2xpZW50WSArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wXG4gICAgICAgICAgICAgICAgICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcblxuICAgICAgICB2YXIgZV9wb3N4ID0gMDtcbiAgICAgICAgdmFyIGVfcG9zeSA9IDA7XG4gICAgICAgIGlmICh3aXRoaW4ub2Zmc2V0UGFyZW50KXtcbiAgICAgICAgICAgIGRvIHsgXG4gICAgICAgICAgICAgICAgZV9wb3N4ICs9IHdpdGhpbi5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgICAgIGVfcG9zeSArPSB3aXRoaW4ub2Zmc2V0VG9wO1xuICAgICAgICAgICAgfSB3aGlsZSAod2l0aGluID0gPEhUTUxFbGVtZW50PndpdGhpbi5vZmZzZXRQYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQb2ludDJEKG1fcG9zeCAtIGVfcG9zeCwgbV9wb3N5IC0gZV9wb3N5KTtcbiAgICB9XG4gICAgXG59O1xuXG4iXX0=
