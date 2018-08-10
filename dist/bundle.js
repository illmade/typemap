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
        var relativeX = position.x / this.widthMapUnits;
        var relativeY = position.y / this.heightMapUnits;
        var width = xMapUnits / this.widthMapUnits;
        var height = yMapUnits / this.heightMapUnits;
        var firstX = Math.floor(relativeX);
        var lastX = Math.ceil(relativeX) + width;
        var firstY = Math.floor(relativeY);
        var lastY = Math.ceil(relativeY) + height;
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
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
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
    function StaticImage(xIndex, yIndex, scalingX, scalingY, rotation, imageSrc, opacity) {
        this.xIndex = xIndex;
        this.yIndex = yIndex;
        this.scalingX = scalingX;
        this.scalingY = scalingY;
        this.rotation = rotation;
        this.opacity = opacity;
        this.visible = true;
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
        ctx.globalAlpha = this.opacity;
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
    function ShowTileLayer(widthMapUnits, heightMapUnits, visible, opacity) {
        var _this = _super.call(this, widthMapUnits, heightMapUnits) || this;
        _this.visible = visible;
        _this.opacity = opacity;
        return _this;
    }
    return ShowTileLayer;
}(tile_1.TileLayer));
exports.ShowTileLayer = ShowTileLayer;
var ImageTileLayer = /** @class */ (function (_super) {
    __extends(ImageTileLayer, _super);
    function ImageTileLayer(imageProperties) {
        var _this = 
        //super(imageProperties.widthMapUnits, imageProperties.heightMapUnits);
        _super.call(this, imageProperties.heightMapUnits, imageProperties.heightMapUnits, imageProperties.visible, imageProperties.opacity) || this;
        _this.imageProperties = imageProperties;
        return _this;
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
        _super.call(this, imageProperties.heightMapUnits, imageProperties.heightMapUnits, imageProperties.visible, imageProperties.opacity) || this;
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
Object.defineProperty(exports, "__esModule", { value: true });
var canvastile_1 = require("./canvastile");
var ImageLayer = /** @class */ (function () {
    function ImageLayer() {
        this.visible = true;
        this.opacity = 0.7;
        this.images = [];
        this.imageMap = new Map();
    }
    ImageLayer.prototype.addImage = function (image, name) {
        this.images.push(image);
        this.imageMap.set(name, image);
    };
    ImageLayer.prototype.getImage = function (name) {
        return this.imageMap.get(name);
    };
    return ImageLayer;
}());
exports.ImageLayer = ImageLayer;
var LayerManager = /** @class */ (function () {
    function LayerManager() {
        this.defaultLayer = "default";
        this.layerMap = new Map();
        this.layerMap.set(this.defaultLayer, new ImageLayer());
    }
    ;
    LayerManager.prototype.addImage = function (image, name) {
        this.layerMap.get(this.defaultLayer).addImage(image, name);
    };
    LayerManager.prototype.addLayer = function (imageDetails, layerName) {
        var imageLayer = new ImageLayer();
        for (var _i = 0, imageDetails_1 = imageDetails; _i < imageDetails_1.length; _i++) {
            var image = imageDetails_1[_i];
            var staticImage = new canvastile_1.StaticImage(image.x, image.y, image.sx, image.sy, image.rot, image.src, image.opacity);
            imageLayer.addImage(staticImage, image.name);
        }
        this.layerMap.set(layerName, imageLayer);
        return imageLayer;
    };
    LayerManager.prototype.getLayers = function () {
        return this.layerMap;
    };
    return LayerManager;
}());
exports.LayerManager = LayerManager;

},{"./canvastile":5}],8:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
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
var layerloader_1 = require("./layerloader");
var ViewCanvas = /** @class */ (function (_super) {
    __extends(ViewCanvas, _super);
    function ViewCanvas(topLeft, widthMapUnits, heightMapUnits, grid, ctx) {
        var _this = _super.call(this, topLeft, widthMapUnits, heightMapUnits) || this;
        _this.grid = grid;
        _this.ctx = ctx;
        _this.layerManager = new layerloader_1.LayerManager();
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
        console.log("adding: " + imageTileLayer);
        this.imageTileLayers.push(imageTileLayer);
    };
    ViewCanvas.prototype.addStaticElement = function (staticImage) {
        this.layerManager.addImage(staticImage, "hi");
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
            if (value.visible) {
                localContext.globalAlpha = value.opacity;
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
        var staticLayers = this.layerManager.getLayers();
        var keys = staticLayers.keys();
        var entries = staticLayers.entries();
        for (var _c = 0, _d = Array.from(keys); _c < _d.length; _c++) {
            var layerName = _d[_c];
            var layer = staticLayers.get(layerName);
            if (layer.visible) {
                for (var _e = 0, _f = layer.images; _e < _f.length; _e++) {
                    var value = _f[_e];
                    //256 px is 1 map unit
                    var tileScalingX = 256;
                    var tileScalingY = 256;
                    this.scale(localContext, 256, dimension, false);
                    var imageX = (value.xIndex - this.topLeft.x) * tileScalingX;
                    var imageY = (value.yIndex - this.topLeft.y) * tileScalingY;
                    value.draw(localContext, imageX, imageY);
                    this.scale(localContext, 256, dimension, true);
                }
            }
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

},{"../geom/point2d":1,"../geom/viewport":3,"./grid":6,"./layerloader":7}],9:[function(require,module,exports){
module.exports=[
	{
	"name": "1", "x": 4.485, "y": -1.875, "sx": 7.465, "sy": 7.35, "rot": 0, 
	"src": "images/firemap/maps_145_b_4_(2)_f001r[SVC2].jpg", "opacity": 0.4
	},
	{
	"name": "2_2", "x": -0.96, "y": -0.59, "sx": 0.41, "sy": 0.42, "rot": -0.325, 
	"src": "images/firemap/maps_145_b_4_(2)_f002r_2[SVC2].png", "opacity": 0.7
	},
	{
	"name": "3", "x": 0.19, "y": -0.705, "sx": 0.4, "sy": 0.42, "rot": -0.51, 
	"src": "images/firemap/maps_145_b_4_(2)_f003r[SVC2].jpg", "opacity": 0.7
	},
	{
	"name": "4", "x": 1.29, "y": -1.28, "sx": 0.46, "sy": 0.42, "rot": -0.265, 
	"src": "images/firemap/maps_145_b_4_(2)_f004r[SVC2].jpg", "opacity": 0.7
	},
	{
	"name": "5", "x": -1.055, "y": 1.02, "sx": 0.43, "sy": 0.415, "rot": -0.21, 
	"src": "images/firemap/maps_145_b_4_(2)_f005r[SVC2].jpg", "opacity": 0.7
	},
	{
	"name": "6", "x": 0.16, "y": 0.71, "sx": 0.405, "sy": 0.44, "rot": -0.205, 
	"src": "images/firemap/maps_145_b_4_(2)_f006r[SVC2].jpg", "opacity": 0.7
	},
	{
	"name": "7", "x": 1.295, "y": 0.3776, "sx": 0.425, "sy": 0.435, "rot": -0.23, 
	"src": "images/firemap/maps_145_b_4_(2)_f007r[SVC2].jpg", "opacity": 0.7
	},
	{
	"name": "8", "x": 2.39, "y": 0.035, "sx": 0.415, "sy": 0.435, "rot": -0.25, 
	"src": "images/firemap/maps_145_b_4_(2)_f008r[SVC2].jpg", "opacity": 0.7
	},
	{
	"name": "9", "x": 3.49, "y": -0.24, "sx": 0.41, "sy": 0.425, "rot": -0.26,
	"src": "images/firemap/maps_145_b_4_(2)_f009r[SVC2].jpg", "opacity": 0.7
	},
	{
	"name": "10", "x": 5.21, "y": -0245, "sx": 0.42, "sy": 0.44, "rot": 0.03, 
	"src": "images/firemap/maps_145_b_4_(2)_f010r_2[SVC2].jpg", "opacity": 0.7
	},
	{
	"name": "11", "x": 6.36, "y": 0.025, "sx": 0.415, "sy": 0.435, "rot": 0.11, 
	"src": "images/firemap/maps_145_b_4_(2)_f011r[SVC2].jpg", "opacity": 0.7
	}, 
	{
	"name": "12-1", "x": 8.145, "y": 0.265, "sx": 0.815, "sy": 0.92, "rot": 0.12, 
	"src": "images/firemap/maps_145_b_4_(2)_f012r_1[SVC2].jpg", "opacity": 0.7
	},
	{
	"name": "14", "x": -5.1, "y": 2.865, "sx": 0.41, "sy": 0.47, "rot": -1.3, 
	"src": "images/firemap/maps_145_b_4_(2)_f014R[SVC2].jpg", "opacity": 0.7
	},
	{
	"name": "15-2", "x": -3.8, "y": 2.85, "sx": 0.4, "sy": 0.4, "rot": -1.47, 
	"src": "images/firemap/maps_145_b_4_(2)_f015r_2[SVC2].png", "opacity": 0.7
	},
	{
	"name": "16-2", "x": 0.98, "y": 2.315, "sx": 0.41, "sy": 0.428, "rot": -0.095, 
	"src": "images/firemap/maps_145_b_4_(2)_f016r_2[SVC2].png", "opacity": 0.7
	},
	{
	"name": "17", "x": 2.24, "y": 1.87, "sx": 0.43, "sy": 0.43, "rot": -0.06, 
	"src": "images/firemap/maps_145_b_4_(2)_f017R[SVC2].jpg", "opacity": 0.7
	},
	{
	"name": "18", "x": 3.34, "y": 1.625, "sx": 0.405, "sy": 0.43, "rot": 0.05, 
	"src": "images/firemap/maps_145_b_4_(2)_f018R[SVC2].jpg", "opacity": 0.7
	},
	{
	"name": "19", "x": 1.99, "y": 3.59, "sx": 0.43, "sy": 0.43, "rot": 0.15, 
	"src": "images/firemap/maps_145_b_4_(2)_f019R[SVC2].jpg", "opacity": 0.7
	},
	{
	"name": "20", "x": 1.725, "y": 4.9, "sx": 0.205, "sy": 0.215, "rot": 0.195, 
	"src": "images/firemap/maps_145_b_4_(2)_f020R[SVC2].jpg", "opacity": 0.7
	}

]




},{}],10:[function(require,module,exports){
module.exports=[
	{
		"name": "wsc-032", "x": -2.61, "y": -0.055, "sx": 0.62, "sy": 0.62, "rot": 1.565, 
		"src": "images/wsc/wsc-maps-032-m.png", "opacity": 0.5, 
		"description": "Constitution Hill - Turnpike, Glasnevin Road; showing proposed road to Botanic Gardens"
	},
	{
		"name": "wsc-072", "x": -2.61, "y": -0.055, "sx": 0.62, "sy": 0.62, "rot": 1.565, 
		"src": "images/wsc/wsc-maps-072-m.png", "opacity": 0.5
	},
	{
		"name": "wsc-075", "x": -2.675, "y": -6.23, "sx": 1.58, "sy": 1.58, "rot": 1.615, 
		"src": "images/wsc/wsc-maps-075-m2.png", "opacity": 0.5
	},
	{
		"name": "wsc-088-1", "x": -0.9, "y": 2.67, "sx": 0.5, "sy": 0.5, "rot": -3.32, 
		"src": "images/wsc/wsc-maps-088-1.jpg", "opacity": 0.5
	},
	{
		"name": "wsc-106-1", "x": -3.885, "y": 3.43, "sx": 0.535, "sy": 0.545, "rot": -0.074, 
		"src": "images/wsc/wsc-maps-106-1.jpg", "opacity": 0.5
	},
	{
		"name": "wsc-142", "x": 0.995, "y": 11.885, "sx": 1.2, "sy": 1.2, "rot": -2, 
		"src": "images/wsc/wsc-maps-142_m.png", "opacity": 0.5
	},
	{
		"name": "wsc-155", "x": -2.11, "y": 2.87, "sx": 2.04, "sy": 1.945, "rot": -0.025, 
		"src": "images/wsc/wsc-maps-155-m.png", "opacity": 0.5
	},
	{
		"name": "wsc-184-1", "x": -2.27, "y": 5.95, "sx": 0.4, "sy": 0.4, "rot": 0.035, 
		"src": "images/wsc/wsc-maps-184-1-front.jpg", "opacity": 0.5
	},
	{
		"name": "wsc-433-2", "x": -2.846, "y": 6.125, "sx": 0.199, "sy": 0.205, "rot": -0.025, 
		"src": "images/wsc/wsc-maps-433-2.jpg", "opacity": 0.5
	},
	{
		"name": "wsc-467-02", "x": 1.845, "y": 8.12, "sx": 0.83, "sy": 0.83, "rot": -2.725, 
		"src": "images/wsc/wsc-maps-467-02.jpg", "opacity": 0.1
	},
	{
		"name": "wsc-469-02", "x": 1.82, "y": 8.02, "sx": 0.465, "sy": 0.465, "rot": -2.75, 
		"src": "images/wsc/wsc-maps-469-2-m.png", "opacity": 0.5, 
		"description": "Earlsfort Terrace, Stephen’s Green South and Harcourt Street showing plan of proposed new street"
	},
	{
		"name": "wsc-757", "x": -2.96, "y": 4.375, "sx": 0.715, "sy": 0.715, "rot": -0.025, 
		"src": "images/wsc/wsc-maps-757-l.png", "opacity": 0.5, 
		"description": "four courts to st patrics, the castle to thomas street"
	}
]

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var world2d_1 = require("./geom/world2d");
var point2d_1 = require("./geom/point2d");
var canvastile_1 = require("./graphics/canvastile");
var viewcanvas_1 = require("./graphics/viewcanvas");
var mapController_1 = require("./ui/mapController");
var imageController_1 = require("./ui/imageController");
var firemaps = require("./imagegroups/firemaps.json");
var wsc = require("./imagegroups/wsc.json");
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
    var fireImages = viewCanvas.layerManager.addLayer(firemaps, "firemaps");
    var wscImages = viewCanvas.layerManager.addLayer(wsc, "wsc");
    //viewCanvas.addStaticElement(totalOverlayImage);
    var moveImage = fireImages.getImage("14");
    var imageController = new imageController_1.ImageController(viewCanvas, moveImage);
    var plus = document.getElementById("plus");
    var minus = document.getElementById("minus");
    var panControl = new mapController_1.PanController(viewCanvas, canvas);
    var canvasControl = new mapController_1.ZoomController(viewCanvas, plus, minus);
    canvasControl.addZoomListener(panControl);
    var layerController = new imageController_1.LayerController(viewCanvas, slippyTileLayer);
    var layerControllerb = new imageController_1.LayerController(viewCanvas, wscImages);
    layerControllerb.mod = "b";
    var layerControllerc = new imageController_1.LayerController(viewCanvas, fireImages);
    layerControllerc.mod = "n";
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

},{"./geom/point2d":1,"./geom/world2d":4,"./graphics/canvastile":5,"./graphics/viewcanvas":8,"./imagegroups/firemaps.json":9,"./imagegroups/wsc.json":10,"./ui/imageController":12,"./ui/mapController":13}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LayerController = /** @class */ (function () {
    function LayerController(viewCanvas, layer) {
        var _this = this;
        this.layer = layer;
        this.mod = "v";
        document.addEventListener("keypress", function (e) {
            return _this.pressed(viewCanvas, e);
        });
    }
    LayerController.prototype.pressed = function (viewCanvas, event) {
        //console.log("pressed layer" + event.target + ", " + event.key);
        switch (event.key) {
            case this.mod:
                this.layer.visible = !this.layer.visible;
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
                this.staticImage.opacity = Math.min(1.0, this.staticImage.opacity + 0.1);
                viewCanvas.draw();
                break;
            case "t":
                this.staticImage.opacity = Math.max(0, this.staticImage.opacity - 0.1);
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

},{}],13:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
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

},{"../geom/point2d":1}]},{},[11])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2dlb20vdGlsZS50cyIsInNyYy9nZW9tL3ZpZXdwb3J0LnRzIiwic3JjL2dlb20vd29ybGQyZC50cyIsInNyYy9ncmFwaGljcy9jYW52YXN0aWxlLnRzIiwic3JjL2dyYXBoaWNzL2dyaWQudHMiLCJzcmMvZ3JhcGhpY3MvbGF5ZXJsb2FkZXIudHMiLCJzcmMvZ3JhcGhpY3Mvdmlld2NhbnZhcy50cyIsInNyYy9pbWFnZWdyb3Vwcy9maXJlbWFwcy5qc29uIiwic3JjL2ltYWdlZ3JvdXBzL3dzYy5qc29uIiwic3JjL3NpbXBsZVdvcmxkLnRzIiwic3JjL3VpL2ltYWdlQ29udHJvbGxlci50cyIsInNyYy91aS9tYXBDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNDQTtJQU9JLGlCQUFZLENBQVMsRUFBRSxDQUFTO1FBQzVCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVFLDBCQUFRLEdBQVI7UUFDSSxPQUFPLFVBQVUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztJQUNyRCxDQUFDO0lBYmUsWUFBSSxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN6QixXQUFHLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBYzVDLGNBQUM7Q0FoQkQsQUFnQkMsSUFBQTtBQWhCWSwwQkFBTzs7Ozs7QUNFcEI7SUFFQyxtQkFBbUIsYUFBcUIsRUFBUyxjQUFzQjtRQUFwRCxrQkFBYSxHQUFiLGFBQWEsQ0FBUTtRQUFTLG1CQUFjLEdBQWQsY0FBYyxDQUFRO0lBQUUsQ0FBQztJ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QUM7Z0JBQ2xCLE1BQU07WUFDUCxLQUFLLEdBQUc7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2dCQUM5RCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDUCxLQUFLLEdBQUc7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2dCQUM5RCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDUCxLQUFLLEdBQUc7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2dCQUM5RCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDUCxLQUFLLEdBQUc7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2dCQUM5RCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDUCxLQUFLLEdBQUc7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2dCQUM5RCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDUCxLQUFLLEdBQUc7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2dCQUM5RCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDRCxLQUFLLEdBQUc7Z0JBQ0osSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFH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RyxDQUFDLENBQUM7UUFDZixJQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQUM7WUFDcEIsR0FBRztnQkFDQyxNQUFNLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQztnQkFDNUIsTUFBTSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUM7YUFDOUIsUUFBUSxNQUFNLEdBQWdCLE1BQU0sQ0FBQyxZQUFZLEVBQUU7U0FDdkQ7UUFFRCxPQUFPLElBQUksaUJBQU8sQ0FBQyxNQUFNLEdBQUcsTUFBTSxFQUFFLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRUwsb0JBQUM7QUFBRCxDQTVGQSxBQTRGQyxDQTVGa0MsWUFBWSxHQTRGOUM7QUE1Rlksc0NBQWE7QUE0RnpCLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcbmV4cG9ydCBjbGFzcyBQb2ludDJEIHtcbiAgICBzdGF0aWMgcmVhZG9ubHkgemVybyA9IG5ldyBQb2ludDJEKDAsIDApO1xuICAgIHN0YXRpYyByZWFkb25seSBvbmUgPSBuZXcgUG9pbnQyRCgxLCAxKTtcblxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcbiAgICByZWFkb25seSB5OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuXHR9XG5cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gXCJQb2ludDJEKFwiICsgdGhpcy54ICsgXCIsIFwiICsgdGhpcy55ICsgXCIpXCI7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgVW5pdHMgfSBmcm9tIFwiLi93b3JsZDJkXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4vcG9pbnQyZFwiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVGlsZUxheWVyIHtcblx0XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB3aWR0aE1hcFVuaXRzOiBudW1iZXIsIHB1YmxpYyBoZWlnaHRNYXBVbml0czogbnVtYmVyKXt9XG5cblx0YWJzdHJhY3QgZ2V0VGlsZSh4SW5kZXg6IG51bWJlciwgeUluZGV4OiBudW1iZXIpOiBUaWxlO1xuXG5cdGdldFRpbGVzKHBvc2l0aW9uOiBQb2ludDJELCB4TWFwVW5pdHM6IG51bWJlciwgeU1hcFVuaXRzOiBudW1iZXIpOiBBcnJheTxUaWxlPiB7XG5cblx0XHRsZXQgcmVsYXRpdmVYID0gcG9zaXRpb24ueCAvIHRoaXMud2lkdGhNYXBVbml0cztcblx0XHRsZXQgcmVsYXRpdmVZID0gcG9zaXRpb24ueSAvIHRoaXMuaGVpZ2h0TWFwVW5pdHM7XG5cblx0XHRsZXQgd2lkdGggPSB4TWFwVW5pdHMgLyB0aGlzLndpZHRoTWFwVW5pdHM7XG5cdFx0bGV0IGhlaWdodCA9IHlNYXBVbml0cyAvIHRoaXMuaGVpZ2h0TWFwVW5pdHM7XG5cblx0XHRsZXQgZmlyc3RYID0gTWF0aC5mbG9vcihyZWxhdGl2ZVgpO1xuXHRcdGxldCBsYXN0WCA9IE1hdGguY2VpbChyZWxhdGl2ZVgpICsgd2lkdGg7XG5cblx0XHRsZXQgZmlyc3RZID0gTWF0aC5mbG9vcihyZWxhdGl2ZVkpO1xuXHRcdGxldCBsYXN0WSA9IE1hdGguY2VpbChyZWxhdGl2ZVkpICsgaGVpZ2h0O1xuXG5cdFx0bGV0IHRpbGVzID0gbmV3IEFycmF5PFRpbGU+KCk7XG5cblx0XHRmb3IgKHZhciB4PWZpcnN0WDsgeDxsYXN0WDsgeCsrKXtcblx0XHRcdGZvciAodmFyIHk9Zmlyc3RZOyB5PGxhc3RZOyB5Kyspe1xuXHRcdFx0XHR0aWxlcy5wdXNoKHRoaXMuZ2V0VGlsZSh4LCB5KSlcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGlsZXM7XG5cdH1cblxufVxuXG5leHBvcnQgY2xhc3MgVGlsZSB7XG5cdFxuXHRzdGF0aWMgZW1wdHlUaWxlOiBUaWxlID0gbmV3IFRpbGUoLTEsLTEpO1xuXG5cdGNvbnN0cnVjdG9yKHhJbmRleDogbnVtYmVyLCB5SW5kZXg6IG51bWJlcil7fVxuXG59IiwiaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuL3BvaW50MmRcIjtcbmltcG9ydCB7IFZlY3RvcjJEIH0gZnJvbSBcIi4vdmVjdG9yMmRcIjtcbmltcG9ydCB7IFdvcmxkMkQsIFVuaXRzIH0gZnJvbSBcIi4vd29ybGQyZFwiO1xuXG5leHBvcnQgY2xhc3MgVmlld3BvcnQge1xuXHRcblx0Y29uc3RydWN0b3IocHVibGljIHRvcExlZnQ6IFBvaW50MkQsIFxuXHRcdHByaXZhdGUgd2lkdGhNYXBVbml0czogbnVtYmVyLCBwcml2YXRlIGhlaWdodE1hcFVuaXRzOiBudW1iZXIpe1xuXG5cdFx0Y29uc29sZS5sb2coXCJ3IGhcIiArIHdpZHRoTWFwVW5pdHMgKyBcIiwgXCIgKyBoZWlnaHRNYXBVbml0cyk7XG5cdH1cblxuXHRtb3ZlVmlldyh0b3BMZWZ0OiBQb2ludDJEKXtcblx0XHR0aGlzLnRvcExlZnQgPSB0b3BMZWZ0O1xuXHR9XG5cblx0em9vbVZpZXcoem9vbTogbnVtYmVyKXtcblx0XHRsZXQgbmV3V2lkdGggPSB0aGlzLndpZHRoTWFwVW5pdHMgKiB6b29tO1xuXHRcdGxldCBuZXdIZWlnaHQgPSB0aGlzLmhlaWdodE1hcFVuaXRzICogem9vbTtcblxuXHRcdGxldCBtb3ZlWCA9ICh0aGlzLndpZHRoTWFwVW5pdHMgLSBuZXdXaWR0aCkgLyAyO1xuXHRcdGxldCBtb3ZlWSA9ICh0aGlzLmhlaWdodE1hcFVuaXRzIC0gbmV3SGVpZ2h0KSAvIDI7XG5cblx0XHR0aGlzLnRvcExlZnQgPSBuZXcgUG9pbnQyRCh0aGlzLnRvcExlZnQueCArIG1vdmVYLCB0aGlzLnRvcExlZnQueSArIG1vdmVZKTtcblxuXHRcdHRoaXMud2lkdGhNYXBVbml0cyA9IG5ld1dpZHRoO1xuXHRcdHRoaXMuaGVpZ2h0TWFwVW5pdHMgPSBuZXdIZWlnaHQ7XG5cdH1cblxuXHR6b29tQWJvdXQoeFJlbGF0aXZlOiBudW1iZXIsIHlSZWxhdGl2ZTogbnVtYmVyLCB6b29tOiBudW1iZXIpe1xuXG5cdFx0bGV0IHhEaWZmID0gMC41IC0geFJlbGF0aXZlO1xuXHRcdGxldCB5RGlmZiA9IDAuNSAtIHlSZWxhdGl2ZTtcblxuXHRcdHZhciB4TW92ZSA9IHhEaWZmICogdGhpcy53aWR0aE1hcFVuaXRzO1xuXHRcdHZhciB5TW92ZSA9IHlEaWZmICogdGhpcy5oZWlnaHRNYXBVbml0cztcblxuXHRcdHRoaXMudG9wTGVmdCA9IG5ldyBQb2ludDJEKHRoaXMudG9wTGVmdC54IC0geE1vdmUsIHRoaXMudG9wTGVmdC55IC0geU1vdmUpO1xuXG5cdFx0dGhpcy56b29tVmlldyh6b29tKTtcblxuXHRcdHhNb3ZlID0geERpZmYgKiB0aGlzLndpZHRoTWFwVW5pdHM7XG5cdFx0eU1vdmUgPSB5RGlmZiAqIHRoaXMuaGVpZ2h0TWFwVW5pdHM7XG5cblx0XHR0aGlzLnRvcExlZnQgPSBuZXcgUG9pbnQyRCh0aGlzLnRvcExlZnQueCArIHhNb3ZlLCB0aGlzLnRvcExlZnQueSArIHlNb3ZlKTtcblxuXHR9XG5cblx0Z2V0RGltZW5zaW9ucygpe1xuXHRcdHJldHVybiBuZXcgUG9pbnQyRCh0aGlzLndpZHRoTWFwVW5pdHMsIHRoaXMuaGVpZ2h0TWFwVW5pdHMpO1xuXHR9XG5cbn0iLCJpbXBvcnQgeyBUaWxlTGF5ZXIgfSBmcm9tIFwiLi90aWxlXCI7XG5cbmV4cG9ydCBjbGFzcyBVbml0cyB7XG5cblx0c3RhdGljIHJlYWRvbmx5IFdlYldVID0gbmV3IFVuaXRzKFwiTWVyY2F0b3IgV2ViIFdvcmxkIFVuaXRzXCIpO1xuXG5cdGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyl7fVxuXG59XG4vKipcbiAgQSB3b3JsZCBpcyB0aGUgYmFzZSB0aGF0IGFsbCBvdGhlciBlbGVtZW50cyBvcmllbnRhdGUgZnJvbSBcbioqL1xuZXhwb3J0IGNsYXNzIFdvcmxkMkQge1xuXG5cdHByaXZhdGUgdGlsZUxheWVyczogQXJyYXk8VGlsZUxheWVyPiA9IFtdO1xuXHRcblx0Y29uc3RydWN0b3IoKXt9XG5cbiAgICBhZGRUaWxlTGF5ZXIodGlsZUxheWVyOiBUaWxlTGF5ZXIpOiBudW1iZXIge1xuICAgIFx0cmV0dXJuIHRoaXMudGlsZUxheWVycy5wdXNoKHRpbGVMYXllcik7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgVGlsZSwgVGlsZUxheWVyIH0gZnJvbSBcIi4uL2dlb20vdGlsZVwiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENhbnZhc1RpbGUgZXh0ZW5kcyBUaWxlIHtcblxuXHRhYnN0cmFjdCBkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBzY2FsaW5nWDogbnVtYmVyLCBzY2FsaW5nWTogbnVtYmVyLCBcblx0XHRjYW52YXNYOiBudW1iZXIsIGNhbnZhc1k6IG51bWJlcik6IHZvaWQ7XG5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBEaXNwbGF5RWxlbWVudCB7XG5cdHZpc2libGU6IGJvb2xlYW47XG5cdG9wYWNpdHk6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlU3RydWN0IGltcGxlbWVudHMgRGlzcGxheUVsZW1lbnQge1xuXG5cdHByZWZpeDogc3RyaW5nID0gXCJcIjtcblx0c3VmZml4OiBzdHJpbmcgPSBcIlwiO1xuXHR0aWxlRGlyOiBzdHJpbmcgPSBcImltYWdlcy9cIjtcblx0dmlzaWJsZTogYm9vbGVhbiA9IHRydWU7XG5cdG9wYWNpdHk6IG51bWJlciA9IDAuNztcblx0dGlsZVdpZHRoUHg6IG51bWJlciA9IDI1Njtcblx0dGlsZUhlaWdodFB4OiBudW1iZXIgPSAyNTY7XG5cdHdpZHRoTWFwVW5pdHM6IG51bWJlciA9IDE7XG5cdGhlaWdodE1hcFVuaXRzOiBudW1iZXIgPSAxOyBcblxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VUaWxlIGV4dGVuZHMgQ2FudmFzVGlsZSB7XG5cblx0cHJpdmF0ZSBpbWc6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cblx0Y29uc3RydWN0b3IocmVhZG9ubHkgeEluZGV4OiBudW1iZXIsIHJlYWRvbmx5IHlJbmRleDogbnVtYmVyLCBpbWFnZVNyYzogc3RyaW5nKSB7XG5cdFx0c3VwZXIoeEluZGV4LCB5SW5kZXgpO1xuXHRcdHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG5cdFx0dGhpcy5pbWcuc3JjID0gaW1hZ2VTcmM7XG5cdH07XG5cblx0cHJpdmF0ZSBkcmF3SW1hZ2UoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKXtcblx0XHRjdHguZHJhd0ltYWdlKHRoaXMuaW1nLCBjYW52YXNYLCBjYW52YXNZKTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKXtcblx0XHRpZiAodGhpcy5pbWcuY29tcGxldGUpIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5pbWcub25sb2FkID0gKGV2ZW50KSA9PiB7XG5cdFx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fTtcblxufVxuXG5leHBvcnQgY2xhc3MgU3RhdGljSW1hZ2UgaW1wbGVtZW50cyBEaXNwbGF5RWxlbWVudCB7XG5cblx0cHJpdmF0ZSBpbWc6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cblx0cHVibGljIHZpc2libGUgPSB0cnVlO1xuXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB4SW5kZXg6IG51bWJlciwgcHVibGljIHlJbmRleDogbnVtYmVyLCBcblx0XHRwdWJsaWMgc2NhbGluZ1g6IG51bWJlciwgcHVibGljIHNjYWxpbmdZOiBudW1iZXIsIHB1YmxpYyByb3RhdGlvbjogbnVtYmVyLCBcblx0XHRpbWFnZVNyYzogc3RyaW5nLCBwdWJsaWMgb3BhY2l0eTogbnVtYmVyKSB7XG5cdFx0XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0fTtcblxuXHRwcml2YXRlIGRyYXdJbWFnZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgY2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpe1xuXG5cdFx0Ly9zY2FsaW5nWCA9IHNjYWxpbmdYICogdGhpcy5zY2FsaW5nO1xuXHRcdC8vc2NhbGluZ1kgPSBzY2FsaW5nWSAqIHRoaXMuc2NhbGluZztcblxuXHRcdC8vIGxldCBjb3NYID0gTWF0aC5jb3ModGhpcy5yb3RhdGlvbik7XG5cdFx0Ly8gbGV0IHNpblggPSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uKTtcblxuXHRcdGN0eC50cmFuc2xhdGUoY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0Y3R4LnJvdGF0ZSh0aGlzLnJvdGF0aW9uKTtcblx0XHRjdHguc2NhbGUodGhpcy5zY2FsaW5nWCwgdGhpcy5zY2FsaW5nWSk7XG5cdFx0Ly9jb25zb2xlLmxvZyhcInh5U2NhbGluZyBcIiArIHRoaXMuc2NhbGluZ1ggKyBcIiwgXCIgKyB0aGlzLnNjYWxpbmdZKTtcblx0XHRjdHguZ2xvYmFsQWxwaGEgPSB0aGlzLm9wYWNpdHk7XG5cblx0XHQvLyBjdHgudHJhbnNmb3JtKGNvc1ggKiBzY2FsaW5nWCwgc2luWCAqIHNjYWxpbmdZLCAtc2luWCAqIHNjYWxpbmdYLCBjb3NYICogc2NhbGluZ1ksIFxuXHRcdC8vIFx0Y2FudmFzWCAvIHRoaXMuc2NhbGluZywgY2FudmFzWSAvIHRoaXMuc2NhbGluZyk7XG5cblx0XHRjdHguZHJhd0ltYWdlKHRoaXMuaW1nLCAtKHRoaXMuaW1nLndpZHRoLzIpLCAtKHRoaXMuaW1nLmhlaWdodC8yKSk7XG5cdFx0XG5cdFx0Y3R4LnNjYWxlKDEvdGhpcy5zY2FsaW5nWCwgMS90aGlzLnNjYWxpbmdZKTtcblx0XHRjdHgucm90YXRlKC10aGlzLnJvdGF0aW9uKTtcblx0XHRjdHgudHJhbnNsYXRlKC1jYW52YXNYLCAtY2FudmFzWSk7XG5cdFx0Y3R4Lmdsb2JhbEFscGhhID0gMTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKXtcblx0XHRpZiAodGhpcy5pbWcuY29tcGxldGUpIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5pbWcub25sb2FkID0gKGV2ZW50KSA9PiB7XG5cdFx0XHRcdHRoaXMuaW1nLmNyb3NzT3JpZ2luID0gXCJBbm9ueW1vdXNcIjtcblx0XHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCBjYW52YXNYLCBjYW52YXNZKTtcblx0XHRcdH07XG5cdFx0fVxuXHR9O1xuXG59XG5cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFNob3dUaWxlTGF5ZXIgZXh0ZW5kcyBUaWxlTGF5ZXIgaW1wbGVtZW50cyBEaXNwbGF5RWxlbWVudCB7XG5cdFxuXHRjb25zdHJ1Y3Rvcih3aWR0aE1hcFVuaXRzOiBudW1iZXIsIGhlaWdodE1hcFVuaXRzOiBudW1iZXIsIHB1YmxpYyB2aXNpYmxlLCBwdWJsaWMgb3BhY2l0eSl7XG5cdFx0c3VwZXIod2lkdGhNYXBVbml0cywgaGVpZ2h0TWFwVW5pdHMpO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlVGlsZUxheWVyIGV4dGVuZHMgU2hvd1RpbGVMYXllciB7XG5cblx0cmVhZG9ubHkgaW1hZ2VQcm9wZXJ0aWVzOiBJbWFnZVN0cnVjdDtcblxuXHRjb25zdHJ1Y3RvcihpbWFnZVByb3BlcnRpZXM6IEltYWdlU3RydWN0KSB7XG5cdFx0Ly9zdXBlcihpbWFnZVByb3BlcnRpZXMud2lkdGhNYXBVbml0cywgaW1hZ2VQcm9wZXJ0aWVzLmhlaWdodE1hcFVuaXRzKTtcblx0XHRzdXBlcihpbWFnZVByb3BlcnRpZXMuaGVpZ2h0TWFwVW5pdHMsIGltYWdlUHJvcGVydGllcy5oZWlnaHRNYXBVbml0cywgXG5cdFx0XHRpbWFnZVByb3BlcnRpZXMudmlzaWJsZSwgaW1hZ2VQcm9wZXJ0aWVzLm9wYWNpdHkpO1x0XG5cdFx0dGhpcy5pbWFnZVByb3BlcnRpZXMgPSBpbWFnZVByb3BlcnRpZXM7XG5cdH1cblxuXHQvKipcblx0ICBsZWF2ZSBjYWNoaW5nIHVwIHRvIHRoZSBicm93c2VyXG5cdCoqL1xuXHRnZXRUaWxlKHhVbml0czogbnVtYmVyLCB5VW5pdHM6IG51bWJlcik6IFRpbGUge1xuXHRcdGxldCBpbWFnZVNyYyA9IHRoaXMuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVEaXIgKyBcblx0XHRcdHRoaXMuaW1hZ2VQcm9wZXJ0aWVzLnByZWZpeCArIHhVbml0cyArIFwiX1wiICsgeVVuaXRzICsgdGhpcy5pbWFnZVByb3BlcnRpZXMuc3VmZml4O1xuXHRcdHJldHVybiBuZXcgSW1hZ2VUaWxlKHhVbml0cy0xLCB5VW5pdHMrMSwgaW1hZ2VTcmMpO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNsYXNzIFNsaXBweVRpbGVMYXllciBleHRlbmRzIFNob3dUaWxlTGF5ZXIge1xuXG5cdHJlYWRvbmx5IGltYWdlUHJvcGVydGllczogSW1hZ2VTdHJ1Y3Q7XG5cdHByaXZhdGUgYmFzZVggPSAwO1xuXHRwcml2YXRlIGJhc2VZID0gMDtcblxuXHRjb25zdHJ1Y3RvcihpbWFnZVByb3BlcnRpZXM6IEltYWdlU3RydWN0LCBwcml2YXRlIHpvb206IG51bWJlcixcblx0XHRwcml2YXRlIHhPZmZzZXQ6IG51bWJlciwgcHJpdmF0ZSB5T2Zmc2V0OiBudW1iZXIpIHtcblx0XHQvL3N1cGVyKGltYWdlUHJvcGVydGllcy53aWR0aE1hcFVuaXRzLCBpbWFnZVByb3BlcnRpZXMuaGVpZ2h0TWFwVW5pdHMpO1xuXHRcdHN1cGVyKGltYWdlUHJvcGVydGllcy5oZWlnaHRNYXBVbml0cywgaW1hZ2VQcm9wZXJ0aWVzLmhlaWdodE1hcFVuaXRzLCBcblx0XHRcdGltYWdlUHJvcGVydGllcy52aXNpYmxlLCBpbWFnZVByb3BlcnRpZXMub3BhY2l0eSk7XG5cdFx0dGhpcy5pbWFnZVByb3BlcnRpZXMgPSBpbWFnZVByb3BlcnRpZXM7XG5cdH1cblxuXHRwcml2YXRlIG9mZnNldHMoKXtcblx0XHRsZXQgem9vbUV4cCA9IE1hdGgucG93KDIsIHRoaXMuem9vbSk7XG5cdFx0dGhpcy5iYXNlWCA9IHRoaXMueE9mZnNldCAvIHpvb21FeHA7XG5cdFx0dGhpcy5iYXNlWSA9IHRoaXMueU9mZnNldCAvIHpvb21FeHA7XG5cdH1cblxuXHQvKipcblx0ICBsZWF2ZSBjYWNoaW5nIHVwIHRvIHRoZSBicm93c2VyXG5cdCoqL1xuXHRnZXRUaWxlKHhVbml0czogbnVtYmVyLCB5VW5pdHM6IG51bWJlcik6IFRpbGUge1xuXHRcdFxuXHRcdGxldCBpbWFnZVNyYyA9IHRoaXMuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVEaXIgKyB0aGlzLnpvb20gKyBcIi9cIiArICh0aGlzLnhPZmZzZXQreFVuaXRzKSArIFwiL1wiICsgXG5cdFx0XHQgKyAodGhpcy55T2Zmc2V0K3lVbml0cykgKyB0aGlzLmltYWdlUHJvcGVydGllcy5zdWZmaXg7XG5cdFx0cmV0dXJuIG5ldyBJbWFnZVRpbGUoeFVuaXRzLCB5VW5pdHMsIGltYWdlU3JjKTtcblx0fVxuXG59XG4iLCJpbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgY2xhc3MgR3JpZExheWVyIHtcblxuXHRwcml2YXRlIGdyaWRTcGFjaW5nOiBudW1iZXI7XG5cblx0Y29uc3RydWN0b3IocHVibGljIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBncmlkU3BhY2luZzogbnVtYmVyKSB7XG5cdFx0dGhpcy5ncmlkU3BhY2luZyA9IGdyaWRTcGFjaW5nO1xuXHR9XG5cblx0c2V0R3JpZFNwYWNpbmcoZ3JpZFNwYWNpbmc6IG51bWJlcil7XG5cdFx0dGhpcy5ncmlkU3BhY2luZyA9IGdyaWRTcGFjaW5nO1xuXHR9XG5cdC8qKlxuXHQgIGxlYXZlIGNhY2hpbmcgdXAgdG8gdGhlIGJyb3dzZXJcblx0KiovXG5cdGRyYXcodG9wTGVmdDogUG9pbnQyRCwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcblx0XHRsZXQgbWluWCA9IE1hdGguZmxvb3IodG9wTGVmdC54KTtcblx0XHRsZXQgbWluWSA9IE1hdGguZmxvb3IodG9wTGVmdC55KTtcblxuXHRcdHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gMC41O1xuXHRcdHRoaXMuY3R4LnRyYW5zbGF0ZSgtMjU2ICogdG9wTGVmdC54LCAtMjU2ICogdG9wTGVmdC55KTtcblx0XHQvL2NvbnNvbGUubG9nKFwibWlucyBcIiArIHdpZHRoICsgXCIsIFwiICsgaGVpZ2h0KTtcblxuXHRcdGxldCBsYXN0WCA9IE1hdGguY2VpbCh0b3BMZWZ0LnggKyB3aWR0aCk7XG5cdFx0bGV0IGxhc3RZID0gTWF0aC5jZWlsKHRvcExlZnQueSArIGhlaWdodCk7XG5cblx0XHR0aGlzLmN0eC5zdHJva2VTdHlsZSA9ICdibHVlJztcblx0XHR0aGlzLmN0eC5mb250ID0gJzQ4cHggc2VyaWYnO1xuXG5cdFx0bGV0IHlaZXJvID0gbWluWSAqIHRoaXMuZ3JpZFNwYWNpbmcgKiAyNTY7XG5cdFx0bGV0IHlNYXggPSBsYXN0WSAqIHRoaXMuZ3JpZFNwYWNpbmcgKiAyNTY7XG5cdFx0bGV0IHhKdW1wID0gdGhpcy5ncmlkU3BhY2luZyAqIDI1NjtcblxuXHRcdGxldCB4WmVybyA9IG1pblggKiB0aGlzLmdyaWRTcGFjaW5nICogMjU2O1xuXHRcdGxldCB4TWF4ID0gbGFzdFggKiB0aGlzLmdyaWRTcGFjaW5nICogMjU2O1xuXHRcdGxldCB5SnVtcCA9IHRoaXMuZ3JpZFNwYWNpbmcgKiAyNTY7XG5cblx0XHR0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICBcdC8vdGhpcy5jdHguY2xlYXJSZWN0KHhaZXJvLCB5WmVybywgeE1heCwgeU1heCk7XG5cblx0XHRmb3IgKHZhciB4ID0gbWluWDsgeDxsYXN0WDsgeCsrKXtcblx0XHRcdC8vY29uc29sZS5sb2coXCJhdCBcIiArIG1pblgpO1xuXHRcdFx0bGV0IHhNb3ZlID0geCAqIHhKdW1wO1xuXHRcdFx0dGhpcy5jdHgubW92ZVRvKHhNb3ZlLCB5WmVybyk7XG5cdFx0XHR0aGlzLmN0eC5saW5lVG8oeE1vdmUsIHlNYXgpO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIHkgPSBtaW5ZOyB5PGxhc3RZOyB5Kyspe1xuXHRcdFx0bGV0IHlNb3ZlID0geSAqIHlKdW1wO1xuXHRcdFx0dGhpcy5jdHgubW92ZVRvKHhaZXJvLCB5TW92ZSk7XG5cdFx0XHR0aGlzLmN0eC5saW5lVG8oeE1heCwgeU1vdmUpO1xuXG5cdFx0XHRmb3IgKHZhciB4ID0gbWluWDsgeDxsYXN0WDsgeCsrKXtcblx0XHRcdFx0bGV0IHhNb3ZlID0gKHggLSAwLjUpICogeEp1bXA7XG5cdFx0XHRcdHlNb3ZlID0gKHkgLSAwLjUpICogeUp1bXA7XG5cdFx0XHRcdGxldCB0ZXh0ID0gXCJcIiArICh4LTEpICsgXCIsIFwiICsgKHktMSk7XG5cdFx0XHRcdHRoaXMuY3R4LmZpbGxUZXh0KHRleHQsIHhNb3ZlLCB5TW92ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMuY3R4LnN0cm9rZSgpO1xuXHRcdHRoaXMuY3R4LnRyYW5zbGF0ZSgyNTYgKiB0b3BMZWZ0LngsIDI1NiAqIHRvcExlZnQueSk7XG5cdFx0dGhpcy5jdHguZ2xvYmFsQWxwaGEgPSAxO1xuXHR9XG5cblxufSIsImltcG9ydCB7U3RhdGljSW1hZ2UsIERpc3BsYXlFbGVtZW50fSBmcm9tIFwiLi9jYW52YXN0aWxlXCI7XG5cbmludGVyZmFjZSBJbWFnZVN0cnVjdCB7XG5cdG5hbWU6IHN0cmluZztcblx0eDogbnVtYmVyO1xuXHR5OiBudW1iZXI7XG5cdHN4OiBudW1iZXI7XG5cdHN5OiBudW1iZXI7XG5cdHJvdDogbnVtYmVyO1xuXHRzcmM6IHN0cmluZztcblx0b3BhY2l0eTogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VMYXllciBpbXBsZW1lbnRzIERpc3BsYXlFbGVtZW50IHtcblxuXHRwdWJsaWMgdmlzaWJsZTogYm9vbGVhbiA9IHRydWU7XG5cdHB1YmxpYyBvcGFjaXR5OiBudW1iZXIgPSAwLjc7XG5cblx0cHVibGljIGltYWdlczogQXJyYXk8U3RhdGljSW1hZ2U+ID0gW107XG5cdHByaXZhdGUgaW1hZ2VNYXA6IE1hcDxzdHJpbmcsIFN0YXRpY0ltYWdlPjtcblxuXHRjb25zdHJ1Y3Rvcigpe1xuXHRcdHRoaXMuaW1hZ2VNYXAgPSBuZXcgTWFwPHN0cmluZywgU3RhdGljSW1hZ2U+KCk7XG5cdH1cblxuXHRhZGRJbWFnZShpbWFnZTogU3RhdGljSW1hZ2UsIG5hbWU6IHN0cmluZyl7XG5cdFx0dGhpcy5pbWFnZXMucHVzaChpbWFnZSk7XG5cdFx0dGhpcy5pbWFnZU1hcC5zZXQobmFtZSwgaW1hZ2UpO1xuXHR9XG5cblx0Z2V0SW1hZ2UobmFtZTogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHRoaXMuaW1hZ2VNYXAuZ2V0KG5hbWUpO1xuXHR9XG5cblxufVxuXG5leHBvcnQgY2xhc3MgTGF5ZXJNYW5hZ2VyIHtcblxuXHRwcml2YXRlIGxheWVyTWFwOiBNYXA8c3RyaW5nLCBJbWFnZUxheWVyPjs7XG5cblx0cmVhZG9ubHkgZGVmYXVsdExheWVyOiBzdHJpbmcgPSBcImRlZmF1bHRcIjtcblxuXHRjb25zdHJ1Y3Rvcigpe1xuXHRcdHRoaXMubGF5ZXJNYXAgPSBuZXcgTWFwPHN0cmluZywgSW1hZ2VMYXllcj4oKTtcblx0XHR0aGlzLmxheWVyTWFwLnNldCh0aGlzLmRlZmF1bHRMYXllciwgbmV3IEltYWdlTGF5ZXIoKSk7XG5cdH1cblxuXHRhZGRJbWFnZShpbWFnZTogU3RhdGljSW1hZ2UsIG5hbWU6IHN0cmluZyl7XG5cdFx0dGhpcy5sYXllck1hcC5nZXQodGhpcy5kZWZhdWx0TGF5ZXIpLmFkZEltYWdlKGltYWdlLCBuYW1lKTtcblx0fVxuXG5cdGFkZExheWVyKGltYWdlRGV0YWlsczogQXJyYXk8SW1hZ2VTdHJ1Y3Q+LCBsYXllck5hbWU6IHN0cmluZyk6IEltYWdlTGF5ZXIge1xuXG5cdFx0bGV0IGltYWdlTGF5ZXIgPSBuZXcgSW1hZ2VMYXllcigpO1xuXG5cdFx0Zm9yICh2YXIgaW1hZ2Ugb2YgaW1hZ2VEZXRhaWxzKXtcblx0XHRcdGxldCBzdGF0aWNJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZShpbWFnZS54LCBpbWFnZS55LCBcblx0XHRcdFx0aW1hZ2Uuc3gsIGltYWdlLnN5LCBpbWFnZS5yb3QsIGltYWdlLnNyYywgaW1hZ2Uub3BhY2l0eSk7XG5cdFx0XHRpbWFnZUxheWVyLmFkZEltYWdlKHN0YXRpY0ltYWdlLCBpbWFnZS5uYW1lKTtcblx0XHR9XG5cblx0XHR0aGlzLmxheWVyTWFwLnNldChsYXllck5hbWUsIGltYWdlTGF5ZXIpO1xuXG5cdFx0cmV0dXJuIGltYWdlTGF5ZXI7XG5cdH1cblxuXHRnZXRMYXllcnMoKSB7XG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJNYXA7XG5cdH1cblxufSIsImltcG9ydCB7IFZpZXdwb3J0IH0gZnJvbSBcIi4uL2dlb20vdmlld3BvcnRcIjtcbmltcG9ydCB7IFdvcmxkMkQgfSBmcm9tIFwiLi4vZ2VvbS93b3JsZDJkXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuaW1wb3J0IHsgU3RhdGljSW1hZ2UsIEltYWdlVGlsZSwgSW1hZ2VUaWxlTGF5ZXIgfSBmcm9tIFwiLi9jYW52YXN0aWxlXCI7XG5pbXBvcnQgeyBHcmlkTGF5ZXIgfSBmcm9tIFwiLi9ncmlkXCI7XG5pbXBvcnQgeyBMYXllck1hbmFnZXIgfSBmcm9tIFwiLi9sYXllcmxvYWRlclwiO1xuXG5leHBvcnQgY2xhc3MgVmlld0NhbnZhcyBleHRlbmRzIFZpZXdwb3J0IHtcblxuICAgIHB1YmxpYyBsYXllck1hbmFnZXI6IExheWVyTWFuYWdlciA9IG5ldyBMYXllck1hbmFnZXIoKTtcblxuICAgIHByaXZhdGUgaW1hZ2VUaWxlTGF5ZXJzID0gW107XG5cbiAgICBwcml2YXRlIGdyaWRMYXllcjogR3JpZExheWVyO1xuXG4gICAgcHJpdmF0ZSBvZmZzY3JlZW46IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICBwcml2YXRlIHdpZHRoOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBoZWlnaHQ6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHRvcExlZnQ6IFBvaW50MkQsIFxuICAgIFx0d2lkdGhNYXBVbml0czogbnVtYmVyLCBoZWlnaHRNYXBVbml0czogbnVtYmVyLCBwcml2YXRlIGdyaWQ6IGJvb2xlYW4sXG4gICAgXHRwdWJsaWMgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpIHtcblxuICAgIFx0c3VwZXIodG9wTGVmdCwgd2lkdGhNYXBVbml0cywgaGVpZ2h0TWFwVW5pdHMpO1xuXG4gICAgICAgIHRoaXMud2lkdGggPSBjdHguY2FudmFzLmNsaWVudFdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGN0eC5jYW52YXMuY2xpZW50SGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuY3R4LmNhbnZhcy53aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgIHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcblxuICAgICAgICBjb25zb2xlLmxvZyhcIm9uc2NyZWVuIFwiICsgdGhpcy5jdHguY2FudmFzLndpZHRoICsgXCIsIFwiICsgdGhpcy5jdHguY2FudmFzLmhlaWdodCk7XG5cbiAgICAgICAgLy9jb25zdCBjID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICAgICAgY29uc3QgYyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm9mZnNjcmVlblwiKTtcbiAgICAgICAgYy53aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgIGMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5vZmZzY3JlZW4gPSA8Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEPmMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXG4gICAgICAgIGlmIChncmlkKVxuICAgIFx0ICAgIHRoaXMuZ3JpZExheWVyID0gbmV3IEdyaWRMYXllcih0aGlzLm9mZnNjcmVlbiwgMSk7XG4gICAgfVxuXG4gICAgYWRkVGlsZUxheWVyKGltYWdlVGlsZUxheWVyOiBJbWFnZVRpbGVMYXllcik6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhcImFkZGluZzogXCIgKyBpbWFnZVRpbGVMYXllcik7XG4gICAgXHR0aGlzLmltYWdlVGlsZUxheWVycy5wdXNoKGltYWdlVGlsZUxheWVyKTtcbiAgICB9XG5cbiAgICBhZGRTdGF0aWNFbGVtZW50KHN0YXRpY0ltYWdlOiBTdGF0aWNJbWFnZSk6IHZvaWQge1xuICAgIFx0dGhpcy5sYXllck1hbmFnZXIuYWRkSW1hZ2Uoc3RhdGljSW1hZ2UsIFwiaGlcIik7XG4gICAgfVxuXG4gICAgZ2V0Vmlld1NjYWxpbmcocGl4ZWxzUGVyVW5pdDogbnVtYmVyKTogUG9pbnQyRCB7XG4gICAgXHRsZXQgZGltZW5zaW9uID0gdGhpcy5nZXREaW1lbnNpb25zKCk7XG4gICAgXHRsZXQgdmlld1NjYWxpbmdYID0gdGhpcy5jdHguY2FudmFzLmNsaWVudFdpZHRoIC8gZGltZW5zaW9uLnggLyBwaXhlbHNQZXJVbml0O1xuICAgIFx0bGV0IHZpZXdTY2FsaW5nWSA9IHRoaXMuY3R4LmNhbnZhcy5jbGllbnRIZWlnaHQgLyBkaW1lbnNpb24ueSAvIHBpeGVsc1BlclVuaXQ7XG4gICAgXHRyZXR1cm4gbmV3IFBvaW50MkQodmlld1NjYWxpbmdYLCB2aWV3U2NhbGluZ1kpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2NhbGUoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIFxuICAgICAgICBwaXhlbHNQZXJVbml0OiBudW1iZXIsIGRpbWVuc2lvbjogUG9pbnQyRCwgcmV2ZXJzZTogYm9vbGVhbik6IHZvaWQge1xuXG4gICAgXHRsZXQgdmlld1NjYWxpbmcgPSB0aGlzLmdldFZpZXdTY2FsaW5nKHBpeGVsc1BlclVuaXQpO1xuXG4gICAgXHRpZiAocmV2ZXJzZSl7XG4gICAgXHRcdGN0eC5zY2FsZSgxL3ZpZXdTY2FsaW5nLngsIDEvdmlld1NjYWxpbmcueSk7XG4gICAgXHR9IGVsc2Uge1xuICAgIFx0XHRjdHguc2NhbGUodmlld1NjYWxpbmcueCwgdmlld1NjYWxpbmcueSk7XG4gICAgXHR9XG4gICAgXHRcbiAgICB9XG5cbiAgICBkcmF3KCk6IHZvaWQge1xuICAgIFx0bGV0IGRpbWVuc2lvbiA9IHRoaXMuZ2V0RGltZW5zaW9ucygpO1xuXG4gICAgICAgIGxldCBsb2NhbENvbnRleHQgPSB0aGlzLm9mZnNjcmVlbjtcblxuICAgIFx0bG9jYWxDb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG5cbiAgICBcdGZvciAobGV0IHZhbHVlIG9mIHRoaXMuaW1hZ2VUaWxlTGF5ZXJzKXtcbiAgICBcdFx0aWYgKHZhbHVlLnZpc2libGUpIHtcblxuICAgICAgICAgICAgICAgIGxvY2FsQ29udGV4dC5nbG9iYWxBbHBoYSA9IHZhbHVlLm9wYWNpdHk7XG5cbiAgICAgICAgICAgICAgICBsZXQgc2NhbGVkVGlsZVdpZHRoID0gdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVXaWR0aFB4IC8gXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLmltYWdlUHJvcGVydGllcy53aWR0aE1hcFVuaXRzO1xuXG4gICAgICAgICAgICAgICAgbGV0IHNjYWxlZFRpbGVIZWlnaHQgPSB2YWx1ZS5pbWFnZVByb3BlcnRpZXMudGlsZUhlaWdodFB4IC8gXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLmltYWdlUHJvcGVydGllcy5oZWlnaHRNYXBVbml0cztcblxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic3R3aDogXCIgKyBzY2FsZWRUaWxlV2lkdGggKyBcIiwgXCIgKyBzY2FsZWRUaWxlSGVpZ2h0KTtcbiAgICBcdFx0XHR0aGlzLnNjYWxlKGxvY2FsQ29udGV4dCwgc2NhbGVkVGlsZVdpZHRoLCBkaW1lbnNpb24sIGZhbHNlKTtcblxuICAgICAgICAgICAgICAgIGxldCB4ID0gdGhpcy50b3BMZWZ0LnggLyB2YWx1ZS5pbWFnZVByb3BlcnRpZXMud2lkdGhNYXBVbml0cztcbiAgICAgICAgICAgICAgICBsZXQgeSA9IHRoaXMudG9wTGVmdC55IC8gdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLmhlaWdodE1hcFVuaXRzO1xuICAgICAgICAgICAgICAgIFxuICAgIFx0XHRcdGxldCB0aWxlczogQXJyYXk8SW1hZ2VUaWxlPiA9IHZhbHVlLmdldFRpbGVzKHRoaXMudG9wTGVmdCwgXG4gICAgXHRcdFx0XHRkaW1lbnNpb24ueCwgXG4gICAgICAgICAgICAgICAgICAgIGRpbWVuc2lvbi55KTtcblxuICAgIFx0XHRcdGZvciAobGV0IHRpbGUgb2YgdGlsZXMpe1xuXG4gICAgXHRcdFx0XHR2YXIgdGlsZVggPSBzY2FsZWRUaWxlV2lkdGggKyAodGlsZS54SW5kZXggLSB4KSAqIFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVXaWR0aFB4O1xuICAgIFx0XHRcdFx0dmFyIHRpbGVZID0gLXNjYWxlZFRpbGVIZWlnaHQgKyAodGlsZS55SW5kZXggLSB5KSAqIFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVIZWlnaHRQeDtcblxuICAgIFx0XHRcdFx0dGlsZS5kcmF3KGxvY2FsQ29udGV4dCwgdGlsZVgsIHRpbGVZKTtcbiAgICBcdFx0XHR9XG5cbiAgICBcdFx0XHR0aGlzLnNjYWxlKGxvY2FsQ29udGV4dCwgc2NhbGVkVGlsZVdpZHRoLCBkaW1lbnNpb24sIHRydWUpO1xuICAgICAgICAgICAgICAgIGxvY2FsQ29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XG4gICAgXHRcdH1cbiAgICBcdH1cblxuICAgICAgICBsZXQgc3RhdGljTGF5ZXJzID0gdGhpcy5sYXllck1hbmFnZXIuZ2V0TGF5ZXJzKCk7XG4gICAgICAgIGxldCBrZXlzID0gc3RhdGljTGF5ZXJzLmtleXMoKTtcbiAgICAgICAgbGV0IGVudHJpZXMgPSBzdGF0aWNMYXllcnMuZW50cmllcygpO1xuXG4gICAgICAgIGZvciAobGV0IGxheWVyTmFtZSBvZiBBcnJheS5mcm9tKGtleXMpKSB7XG4gICAgICAgICAgICBsZXQgbGF5ZXIgPSBzdGF0aWNMYXllcnMuZ2V0KGxheWVyTmFtZSk7XG5cbiAgICAgICAgICAgIGlmIChsYXllci52aXNpYmxlKXtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB2YWx1ZSBvZiBsYXllci5pbWFnZXMpe1xuICAgICAgICAgICAgICAgICAgICAvLzI1NiBweCBpcyAxIG1hcCB1bml0XG4gICAgICAgICAgICAgICAgICAgIGxldCB0aWxlU2NhbGluZ1ggPSAyNTY7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0aWxlU2NhbGluZ1kgPSAyNTY7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY2FsZShsb2NhbENvbnRleHQsIDI1NiwgZGltZW5zaW9uLCBmYWxzZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGltYWdlWCA9ICh2YWx1ZS54SW5kZXggLSB0aGlzLnRvcExlZnQueCkgKiB0aWxlU2NhbGluZ1g7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbWFnZVkgPSAodmFsdWUueUluZGV4IC0gdGhpcy50b3BMZWZ0LnkpICogdGlsZVNjYWxpbmdZO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLmRyYXcobG9jYWxDb250ZXh0LCBpbWFnZVgsIGltYWdlWSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NhbGUobG9jYWxDb250ZXh0LCAyNTYsIGRpbWVuc2lvbiwgdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmdyaWQpe1xuICAgICAgICAgICAgdGhpcy5zY2FsZShsb2NhbENvbnRleHQsIDI1NiwgZGltZW5zaW9uLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLmdyaWRMYXllci5kcmF3KHRoaXMudG9wTGVmdCwgZGltZW5zaW9uLngsIGRpbWVuc2lvbi55KTtcbiAgICAgICAgICAgIHRoaXMuc2NhbGUobG9jYWxDb250ZXh0LCAyNTYsIGRpbWVuc2lvbiwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICBcdFxuICAgICAgICBsZXQgaW1hZ2VEYXRhOiBJbWFnZURhdGEgPSBsb2NhbENvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImltYWdlIGRhdGEgXCIsIGltYWdlRGF0YSk7XG4gICAgICAgIHRoaXMuY3R4LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuXG4gICAgICAgIHRoaXMuZHJhd0NlbnRyZSh0aGlzLmN0eCk7XG5cbiAgICB9XG5cbiAgICBkcmF3Q2VudHJlKGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCl7XG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIGNvbnRleHQuZ2xvYmFsQWxwaGEgPSAwLjM7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLndpZHRoLzIsIDYvMTYqdGhpcy5oZWlnaHQpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyh0aGlzLndpZHRoLzIsIDEwLzE2KnRoaXMuaGVpZ2h0KTtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8oNy8xNip0aGlzLndpZHRoLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oOS8xNip0aGlzLndpZHRoLCB0aGlzLmhlaWdodC8yKTtcbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XG4gICAgfVxuXG59IiwibW9kdWxlLmV4cG9ydHM9W1xuXHR7XG5cdFwibmFtZVwiOiBcIjFcIiwgXCJ4XCI6IDQuNDg1LCBcInlcIjogLTEuODc1LCBcInN4XCI6IDcuNDY1LCBcInN5XCI6IDcuMzUsIFwicm90XCI6IDAsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwMXJbU1ZDMl0uanBnXCIsIFwib3BhY2l0eVwiOiAwLjRcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIyXzJcIiwgXCJ4XCI6IC0wLjk2LCBcInlcIjogLTAuNTksIFwic3hcIjogMC40MSwgXCJzeVwiOiAwLjQyLCBcInJvdFwiOiAtMC4zMjUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwMnJfMltTVkMyXS5wbmdcIiwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjNcIiwgXCJ4XCI6IDAuMTksIFwieVwiOiAtMC43MDUsIFwic3hcIjogMC40LCBcInN5XCI6IDAuNDIsIFwicm90XCI6IC0wLjUxLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDNyW1NWQzJdLmpwZ1wiLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiNFwiLCBcInhcIjogMS4yOSwgXCJ5XCI6IC0xLjI4LCBcInN4XCI6IDAuNDYsIFwic3lcIjogMC40MiwgXCJyb3RcIjogLTAuMjY1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMDRyW1NWQzJdLmpwZ1wiLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiNVwiLCBcInhcIjogLTEuMDU1LCBcInlcIjogMS4wMiwgXCJzeFwiOiAwLjQzLCBcInN5XCI6IDAuNDE1LCBcInJvdFwiOiAtMC4yMSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA1cltTVkMyXS5qcGdcIiwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjZcIiwgXCJ4XCI6IDAuMTYsIFwieVwiOiAwLjcxLCBcInN4XCI6IDAuNDA1LCBcInN5XCI6IDAuNDQsIFwicm90XCI6IC0wLjIwNSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA2cltTVkMyXS5qcGdcIiwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjdcIiwgXCJ4XCI6IDEuMjk1LCBcInlcIjogMC4zNzc2LCBcInN4XCI6IDAuNDI1LCBcInN5XCI6IDAuNDM1LCBcInJvdFwiOiAtMC4yMywgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA3cltTVkMyXS5qcGdcIiwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjhcIiwgXCJ4XCI6IDIuMzksIFwieVwiOiAwLjAzNSwgXCJzeFwiOiAwLjQxNSwgXCJzeVwiOiAwLjQzNSwgXCJyb3RcIjogLTAuMjUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAwOHJbU1ZDMl0uanBnXCIsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCI5XCIsIFwieFwiOiAzLjQ5LCBcInlcIjogLTAuMjQsIFwic3hcIjogMC40MSwgXCJzeVwiOiAwLjQyNSwgXCJyb3RcIjogLTAuMjYsXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDA5cltTVkMyXS5qcGdcIiwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9LFxuXHR7XG5cdFwibmFtZVwiOiBcIjEwXCIsIFwieFwiOiA1LjIxLCBcInlcIjogLTAyNDUsIFwic3hcIjogMC40MiwgXCJzeVwiOiAwLjQ0LCBcInJvdFwiOiAwLjAzLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTByXzJbU1ZDMl0uanBnXCIsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxMVwiLCBcInhcIjogNi4zNiwgXCJ5XCI6IDAuMDI1LCBcInN4XCI6IDAuNDE1LCBcInN5XCI6IDAuNDM1LCBcInJvdFwiOiAwLjExLCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTFyW1NWQzJdLmpwZ1wiLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sIFxuXHR7XG5cdFwibmFtZVwiOiBcIjEyLTFcIiwgXCJ4XCI6IDguMTQ1LCBcInlcIjogMC4yNjUsIFwic3hcIjogMC44MTUsIFwic3lcIjogMC45MiwgXCJyb3RcIjogMC4xMiwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDEycl8xW1NWQzJdLmpwZ1wiLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTRcIiwgXCJ4XCI6IC01LjEsIFwieVwiOiAyLjg2NSwgXCJzeFwiOiAwLjQxLCBcInN5XCI6IDAuNDcsIFwicm90XCI6IC0xLjMsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxNFJbU1ZDMl0uanBnXCIsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxNS0yXCIsIFwieFwiOiAtMy44LCBcInlcIjogMi44NSwgXCJzeFwiOiAwLjQsIFwic3lcIjogMC40LCBcInJvdFwiOiAtMS40NywgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDE1cl8yW1NWQzJdLnBuZ1wiLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTYtMlwiLCBcInhcIjogMC45OCwgXCJ5XCI6IDIuMzE1LCBcInN4XCI6IDAuNDEsIFwic3lcIjogMC40MjgsIFwicm90XCI6IC0wLjA5NSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDE2cl8yW1NWQzJdLnBuZ1wiLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMTdcIiwgXCJ4XCI6IDIuMjQsIFwieVwiOiAxLjg3LCBcInN4XCI6IDAuNDMsIFwic3lcIjogMC40MywgXCJyb3RcIjogLTAuMDYsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxN1JbU1ZDMl0uanBnXCIsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxOFwiLCBcInhcIjogMy4zNCwgXCJ5XCI6IDEuNjI1LCBcInN4XCI6IDAuNDA1LCBcInN5XCI6IDAuNDMsIFwicm90XCI6IDAuMDUsIFxuXHRcInNyY1wiOiBcImltYWdlcy9maXJlbWFwL21hcHNfMTQ1X2JfNF8oMilfZjAxOFJbU1ZDMl0uanBnXCIsIFwib3BhY2l0eVwiOiAwLjdcblx0fSxcblx0e1xuXHRcIm5hbWVcIjogXCIxOVwiLCBcInhcIjogMS45OSwgXCJ5XCI6IDMuNTksIFwic3hcIjogMC40MywgXCJzeVwiOiAwLjQzLCBcInJvdFwiOiAwLjE1LCBcblx0XCJzcmNcIjogXCJpbWFnZXMvZmlyZW1hcC9tYXBzXzE0NV9iXzRfKDIpX2YwMTlSW1NWQzJdLmpwZ1wiLCBcIm9wYWNpdHlcIjogMC43XG5cdH0sXG5cdHtcblx0XCJuYW1lXCI6IFwiMjBcIiwgXCJ4XCI6IDEuNzI1LCBcInlcIjogNC45LCBcInN4XCI6IDAuMjA1LCBcInN5XCI6IDAuMjE1LCBcInJvdFwiOiAwLjE5NSwgXG5cdFwic3JjXCI6IFwiaW1hZ2VzL2ZpcmVtYXAvbWFwc18xNDVfYl80XygyKV9mMDIwUltTVkMyXS5qcGdcIiwgXCJvcGFjaXR5XCI6IDAuN1xuXHR9XG5cbl1cblxuXG5cbiIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wMzJcIiwgXCJ4XCI6IC0yLjYxLCBcInlcIjogLTAuMDU1LCBcInN4XCI6IDAuNjIsIFwic3lcIjogMC42MiwgXCJyb3RcIjogMS41NjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0wMzItbS5wbmdcIiwgXCJvcGFjaXR5XCI6IDAuNSwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNvbnN0aXR1dGlvbiBIaWxsIC0gVHVybnBpa2UsIEdsYXNuZXZpbiBSb2FkOyBzaG93aW5nIHByb3Bvc2VkIHJvYWQgdG8gQm90YW5pYyBHYXJkZW5zXCJcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0wNzJcIiwgXCJ4XCI6IC0yLjYxLCBcInlcIjogLTAuMDU1LCBcInN4XCI6IDAuNjIsIFwic3lcIjogMC42MiwgXCJyb3RcIjogMS41NjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy0wNzItbS5wbmdcIiwgXCJvcGFjaXR5XCI6IDAuNVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA3NVwiLCBcInhcIjogLTIuNjc1LCBcInlcIjogLTYuMjMsIFwic3hcIjogMS41OCwgXCJzeVwiOiAxLjU4LCBcInJvdFwiOiAxLjYxNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTA3NS1tMi5wbmdcIiwgXCJvcGFjaXR5XCI6IDAuNVxuXHR9LFxuXHR7XG5cdFx0XCJuYW1lXCI6IFwid3NjLTA4OC0xXCIsIFwieFwiOiAtMC45LCBcInlcIjogMi42NywgXCJzeFwiOiAwLjUsIFwic3lcIjogMC41LCBcInJvdFwiOiAtMy4zMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTA4OC0xLmpwZ1wiLCBcIm9wYWNpdHlcIjogMC41XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTA2LTFcIiwgXCJ4XCI6IC0zLjg4NSwgXCJ5XCI6IDMuNDMsIFwic3hcIjogMC41MzUsIFwic3lcIjogMC41NDUsIFwicm90XCI6IC0wLjA3NCwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTEwNi0xLmpwZ1wiLCBcIm9wYWNpdHlcIjogMC41XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTQyXCIsIFwieFwiOiAwLjk5NSwgXCJ5XCI6IDExLjg4NSwgXCJzeFwiOiAxLjIsIFwic3lcIjogMS4yLCBcInJvdFwiOiAtMiwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTE0Ml9tLnBuZ1wiLCBcIm9wYWNpdHlcIjogMC41XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtMTU1XCIsIFwieFwiOiAtMi4xMSwgXCJ5XCI6IDIuODcsIFwic3hcIjogMi4wNCwgXCJzeVwiOiAxLjk0NSwgXCJyb3RcIjogLTAuMDI1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTU1LW0ucG5nXCIsIFwib3BhY2l0eVwiOiAwLjVcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy0xODQtMVwiLCBcInhcIjogLTIuMjcsIFwieVwiOiA1Ljk1LCBcInN4XCI6IDAuNCwgXCJzeVwiOiAwLjQsIFwicm90XCI6IDAuMDM1LCBcblx0XHRcInNyY1wiOiBcImltYWdlcy93c2Mvd3NjLW1hcHMtMTg0LTEtZnJvbnQuanBnXCIsIFwib3BhY2l0eVwiOiAwLjVcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00MzMtMlwiLCBcInhcIjogLTIuODQ2LCBcInlcIjogNi4xMjUsIFwic3hcIjogMC4xOTksIFwic3lcIjogMC4yMDUsIFwicm90XCI6IC0wLjAyNSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTQzMy0yLmpwZ1wiLCBcIm9wYWNpdHlcIjogMC41XG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNDY3LTAyXCIsIFwieFwiOiAxLjg0NSwgXCJ5XCI6IDguMTIsIFwic3hcIjogMC44MywgXCJzeVwiOiAwLjgzLCBcInJvdFwiOiAtMi43MjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy00NjctMDIuanBnXCIsIFwib3BhY2l0eVwiOiAwLjFcblx0fSxcblx0e1xuXHRcdFwibmFtZVwiOiBcIndzYy00NjktMDJcIiwgXCJ4XCI6IDEuODIsIFwieVwiOiA4LjAyLCBcInN4XCI6IDAuNDY1LCBcInN5XCI6IDAuNDY1LCBcInJvdFwiOiAtMi43NSwgXG5cdFx0XCJzcmNcIjogXCJpbWFnZXMvd3NjL3dzYy1tYXBzLTQ2OS0yLW0ucG5nXCIsIFwib3BhY2l0eVwiOiAwLjUsIFxuXHRcdFwiZGVzY3JpcHRpb25cIjogXCJFYXJsc2ZvcnQgVGVycmFjZSwgU3RlcGhlbuKAmXMgR3JlZW4gU291dGggYW5kIEhhcmNvdXJ0IFN0cmVldCBzaG93aW5nIHBsYW4gb2YgcHJvcG9zZWQgbmV3IHN0cmVldFwiXG5cdH0sXG5cdHtcblx0XHRcIm5hbWVcIjogXCJ3c2MtNzU3XCIsIFwieFwiOiAtMi45NiwgXCJ5XCI6IDQuMzc1LCBcInN4XCI6IDAuNzE1LCBcInN5XCI6IDAuNzE1LCBcInJvdFwiOiAtMC4wMjUsIFxuXHRcdFwic3JjXCI6IFwiaW1hZ2VzL3dzYy93c2MtbWFwcy03NTctbC5wbmdcIiwgXCJvcGFjaXR5XCI6IDAuNSwgXG5cdFx0XCJkZXNjcmlwdGlvblwiOiBcImZvdXIgY291cnRzIHRvIHN0IHBhdHJpY3MsIHRoZSBjYXN0bGUgdG8gdGhvbWFzIHN0cmVldFwiXG5cdH1cbl1cbiIsImltcG9ydCB7IFdvcmxkMkQgfSBmcm9tIFwiLi9nZW9tL3dvcmxkMmRcIjtcbmltcG9ydCB7IFZpZXdwb3J0IH0gZnJvbSBcIi4vZ2VvbS92aWV3cG9ydFwiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuL2dlb20vcG9pbnQyZFwiO1xuaW1wb3J0IHsgU3RhdGljSW1hZ2UsIEltYWdlVGlsZUxheWVyLCBJbWFnZVN0cnVjdCwgU2xpcHB5VGlsZUxheWVyIH0gZnJvbSBcIi4vZ3JhcGhpY3MvY2FudmFzdGlsZVwiO1xuaW1wb3J0IHsgVmlld0NhbnZhcyB9IGZyb20gXCIuL2dyYXBoaWNzL3ZpZXdjYW52YXNcIjtcbmltcG9ydCB7IFpvb21Db250cm9sbGVyLCBQYW5Db250cm9sbGVyIH0gZnJvbSBcIi4vdWkvbWFwQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgSW1hZ2VDb250cm9sbGVyLCBMYXllckNvbnRyb2xsZXJ9IGZyb20gXCIuL3VpL2ltYWdlQ29udHJvbGxlclwiO1xuXG5pbXBvcnQgKiBhcyBmaXJlbWFwcyBmcm9tIFwiLi9pbWFnZWdyb3Vwcy9maXJlbWFwcy5qc29uXCI7XG5pbXBvcnQgKiBhcyB3c2MgZnJvbSBcIi4vaW1hZ2Vncm91cHMvd3NjLmpzb25cIjtcblxubGV0IHNpbXBsZVdvcmxkID0gbmV3IFdvcmxkMkQoKTtcblxuLy8gbGV0IGxheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuLy8gbGF5ZXJQcm9wZXJ0aWVzLnByZWZpeCA9IFwiXCI7XG4vLyBsYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCIucG5nXCI7XG5cbi8vIGxldCByb2FkTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG4vLyByb2FkTGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwiYi5wbmdcIjtcblxuLy8gbGV0IHNlbnRpbmVsTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG4vLyBzZW50aW5lbExheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImwuanBlZ1wiO1xuXG4vLyBsZXQgc2VudGluZWxUZXJyYWluTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG4vLyBzZW50aW5lbFRlcnJhaW5MYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCJ0LmpwZWdcIjtcblxubGV0IGxpZmZleUxheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xubGlmZmV5TGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwibGlmZmV5LmpwZWdcIjtcbmxpZmZleUxheWVyUHJvcGVydGllcy50aWxlRGlyID0gXCJpbWFnZXMvbGlmZmV5L1wiO1xuXG5sZXQgbGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbmxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwibGlmZmV5LnBuZ1wiO1xubGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMub3BhY2l0eSA9IDE7XG5saWZmZXlMYWJlbExheWVyUHJvcGVydGllcy50aWxlRGlyID0gXCJpbWFnZXMvbGlmZmV5L1wiO1xubGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMudmlzaWJsZSA9IHRydWU7XG5cbmxldCBzbGlwcHlMYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbnNsaXBweUxheWVyUHJvcGVydGllcy50aWxlRGlyID0gXCJpbWFnZXMvcXRpbGUvZHVibGluL1wiO1xuc2xpcHB5TGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwiLnBuZ1wiO1xubGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMub3BhY2l0eSA9IC40O1xuc2xpcHB5TGF5ZXJQcm9wZXJ0aWVzLndpZHRoTWFwVW5pdHMgPSAyO1xuc2xpcHB5TGF5ZXJQcm9wZXJ0aWVzLmhlaWdodE1hcFVuaXRzID0gMjtcblxuXG4vLyBsZXQgYmFzZUxheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKGxheWVyUHJvcGVydGllcyk7XG4vLyBsZXQgc2VudGluZWxMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihzZW50aW5lbExheWVyUHJvcGVydGllcyk7XG4vLyBsZXQgcm9hZExheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKHJvYWRMYXllclByb3BlcnRpZXMpO1xuLy8gbGV0IHRlcnJhaW5MYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihzZW50aW5lbFRlcnJhaW5MYXllclByb3BlcnRpZXMpO1xuXG5sZXQgbGlmZmV5U2VudGluZWxMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihsaWZmZXlMYXllclByb3BlcnRpZXMpO1xubGV0IGxpZmZleUxhYmVsTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIobGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMpO1xuXG5sZXQgc2xpcHB5VGlsZUxheWVyID0gbmV3IFNsaXBweVRpbGVMYXllcihzbGlwcHlMYXllclByb3BlcnRpZXMsIDE2LCAzMTYyOCwgMjEyNDIpO1xuXG5sZXQgdG90YWxJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSg0LjQ4NSwgLTEuODc1LCA3LjQ2NSwgNy4zNSwgMCwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwMXJbU1ZDMl0uanBnXCIsIC4zKTtcblxubGV0IHRvdGFsT3ZlcmxheUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDQuNDUsIC0xLjg0LCAzLjg5MywgMy44MjksIDAsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDFyW1NWQzJdLnBuZ1wiLCAuNSk7XG5cbmZ1bmN0aW9uIHNob3dNYXAoZGl2TmFtZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGl2TmFtZSk7XG5cbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cblx0bGV0IHZpZXdDYW52YXMgPSBuZXcgVmlld0NhbnZhcyhuZXcgUG9pbnQyRCgtMTIsLTEwKSwgMjcsIDE4LCBmYWxzZSwgY3R4KTtcblx0Ly8gdmlld0NhbnZhcy5hZGRUaWxlTGF5ZXIoYmFzZUxheWVyKTtcblx0Ly8gdmlld0NhbnZhcy5hZGRUaWxlTGF5ZXIoc2VudGluZWxMYXllcik7XG5cdHZpZXdDYW52YXMuYWRkVGlsZUxheWVyKHNsaXBweVRpbGVMYXllcik7XG5cdC8vdmlld0NhbnZhcy5hZGRUaWxlTGF5ZXIobGlmZmV5U2VudGluZWxMYXllcik7XG5cdC8vdmlld0NhbnZhcy5hZGRUaWxlTGF5ZXIobGlmZmV5TGFiZWxMYXllcik7XG5cblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHRvdGFsSW1hZ2UpO1xuXHRsZXQgZmlyZUltYWdlcyA9IHZpZXdDYW52YXMubGF5ZXJNYW5hZ2VyLmFkZExheWVyKGZpcmVtYXBzLCBcImZpcmVtYXBzXCIpO1xuXHRsZXQgd3NjSW1hZ2VzID0gdmlld0NhbnZhcy5sYXllck1hbmFnZXIuYWRkTGF5ZXIod3NjLCBcIndzY1wiKTtcblx0Ly92aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQodG90YWxPdmVybGF5SW1hZ2UpO1xuXG5cdGxldCBtb3ZlSW1hZ2UgPSBmaXJlSW1hZ2VzLmdldEltYWdlKFwiMTRcIik7XG5cblx0bGV0IGltYWdlQ29udHJvbGxlciA9IG5ldyBJbWFnZUNvbnRyb2xsZXIodmlld0NhbnZhcywgbW92ZUltYWdlKTtcblxuXHRjb25zdCBwbHVzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGx1c1wiKTtcblx0Y29uc3QgbWludXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtaW51c1wiKTtcblxuXHRsZXQgcGFuQ29udHJvbCA9IG5ldyBQYW5Db250cm9sbGVyKHZpZXdDYW52YXMsIGNhbnZhcyk7XG5cdGxldCBjYW52YXNDb250cm9sID0gbmV3IFpvb21Db250cm9sbGVyKHZpZXdDYW52YXMsIHBsdXMsIG1pbnVzKTtcblxuXHRjYW52YXNDb250cm9sLmFkZFpvb21MaXN0ZW5lcihwYW5Db250cm9sKTtcblxuXHRsZXQgbGF5ZXJDb250cm9sbGVyID0gbmV3IExheWVyQ29udHJvbGxlcih2aWV3Q2FudmFzLCBzbGlwcHlUaWxlTGF5ZXIpO1xuXHRsZXQgbGF5ZXJDb250cm9sbGVyYiA9IG5ldyBMYXllckNvbnRyb2xsZXIodmlld0NhbnZhcywgd3NjSW1hZ2VzKTtcblx0bGF5ZXJDb250cm9sbGVyYi5tb2QgPSBcImJcIjtcblx0bGV0IGxheWVyQ29udHJvbGxlcmMgPSBuZXcgTGF5ZXJDb250cm9sbGVyKHZpZXdDYW52YXMsIGZpcmVJbWFnZXMpO1xuXHRsYXllckNvbnRyb2xsZXJjLm1vZCA9IFwiblwiO1xuXG5cdHZpZXdDYW52YXMuZHJhdygpO1xufVxuXG5mdW5jdGlvbiBzaG93KCl7XG5cdHNob3dNYXAoXCJjYW52YXNcIiwgXCJUeXBlU2NyaXB0XCIpO1xufVxuXG5pZiAoXG4gICAgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiIHx8XG4gICAgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09IFwibG9hZGluZ1wiICYmICFkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZG9TY3JvbGwpXG4pIHtcblx0c2hvdygpO1xufSBlbHNlIHtcblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgc2hvdyk7XG59XG5cbiIsImltcG9ydCB7IFN0YXRpY0ltYWdlLCBEaXNwbGF5RWxlbWVudCB9IGZyb20gXCIuLi9ncmFwaGljcy9jYW52YXN0aWxlXCI7XG5pbXBvcnQgeyBWaWV3Q2FudmFzIH0gZnJvbSBcIi4uL2dyYXBoaWNzL3ZpZXdjYW52YXNcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cblxuZXhwb3J0IGNsYXNzIExheWVyQ29udHJvbGxlciB7XG5cbiAgICBwdWJsaWMgbW9kOiBzdHJpbmcgPSBcInZcIjtcblxuICAgIGNvbnN0cnVjdG9yKHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIHJlYWRvbmx5IGxheWVyOiBEaXNwbGF5RWxlbWVudCkge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5wcmVzc2VkKHZpZXdDYW52YXMsIGUgIGFzIEtleWJvYXJkRXZlbnQpKTtcbiAgICB9XG5cbiAgICBwcmVzc2VkKHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJwcmVzc2VkIGxheWVyXCIgKyBldmVudC50YXJnZXQgKyBcIiwgXCIgKyBldmVudC5rZXkpO1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICAgICAgICBjYXNlIHRoaXMubW9kOlxuICAgICAgICAgICAgICAgIHRoaXMubGF5ZXIudmlzaWJsZSA9ICF0aGlzLmxheWVyLnZpc2libGU7XG4gICAgICAgICAgICAgICAgdmlld0NhbnZhcy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZUNvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3Iodmlld0NhbnZhczogVmlld0NhbnZhcywgcmVhZG9ubHkgc3RhdGljSW1hZ2U6IFN0YXRpY0ltYWdlKSB7XG4gICAgXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLnByZXNzZWQodmlld0NhbnZhcywgZSAgYXMgS2V5Ym9hcmRFdmVudCkpO1xuICAgIH1cblxuICAgIHByZXNzZWQodmlld0NhbnZhczogVmlld0NhbnZhcywgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBcdGNvbnNvbGUubG9nKFwicHJlc3NlZFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQua2V5KTtcblxuICAgIFx0c3dpdGNoIChldmVudC5rZXkpIHtcbiAgICBcdFx0Y2FzZSBcImFcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnhJbmRleCA9IHRoaXMuc3RhdGljSW1hZ2UueEluZGV4IC0gMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJkXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS54SW5kZXggPSB0aGlzLnN0YXRpY0ltYWdlLnhJbmRleCArIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwid1wiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2UueUluZGV4ID0gdGhpcy5zdGF0aWNJbWFnZS55SW5kZXggLSAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInNcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnlJbmRleCA9IHRoaXMuc3RhdGljSW1hZ2UueUluZGV4ICsgMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJlXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5yb3RhdGlvbiA9IHRoaXMuc3RhdGljSW1hZ2Uucm90YXRpb24gLSAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInFcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnJvdGF0aW9uID0gdGhpcy5zdGF0aWNJbWFnZS5yb3RhdGlvbiArIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwieFwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1ggPSB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdYIC0gMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJYXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWCA9IHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1ggKyAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInpcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdZID0gdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWSAtIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiWlwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1kgPSB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdZICsgMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiVFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGljSW1hZ2Uub3BhY2l0eSA9IE1hdGgubWluKDEuMCwgdGhpcy5zdGF0aWNJbWFnZS5vcGFjaXR5ICsgMC4xKTtcbiAgICAgICAgICAgICAgICB2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJ0XCI6XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0aWNJbWFnZS5vcGFjaXR5ID0gTWF0aC5tYXgoMCwgdGhpcy5zdGF0aWNJbWFnZS5vcGFjaXR5IC0gMC4xKTtcbiAgICAgICAgICAgICAgICB2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICBcdFx0ZGVmYXVsdDpcbiAgICBcdFx0XHQvLyBjb2RlLi4uXG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHR9XG4gICAgXHRjb25zb2xlLmxvZyhcImltYWdlIGF0OiBcIiArICB0aGlzLnN0YXRpY0ltYWdlLnhJbmRleCArIFwiLCBcIiArIHRoaXMuc3RhdGljSW1hZ2UueUluZGV4KTtcbiAgICBcdGNvbnNvbGUubG9nKFwiaW1hZ2Ugcm8gc2M6IFwiICsgIHRoaXMuc3RhdGljSW1hZ2Uucm90YXRpb24gKyBcIiwgXCIgKyB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdYICsgXCIsIFwiICsgdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWSk7XG4gICAgfTtcblxufTsiLCJpbXBvcnQgeyBWaWV3Q2FudmFzIH0gZnJvbSBcIi4uL2dyYXBoaWNzL3ZpZXdjYW52YXNcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbmFic3RyYWN0IGNsYXNzIE1vdXNlQ29udHJvbGxlciB7XG5cbiAgICBtb3VzZVBvc2l0aW9uKGV2ZW50OiBNb3VzZUV2ZW50LCB3aXRoaW46IEhUTUxFbGVtZW50KTogUG9pbnQyRCB7XG4gICAgICAgIGxldCBtX3Bvc3ggPSBldmVudC5jbGllbnRYICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0XG4gICAgICAgICAgICAgICAgICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQ7XG4gICAgICAgIGxldCBtX3Bvc3kgPSBldmVudC5jbGllbnRZICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3BcbiAgICAgICAgICAgICAgICAgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuXG4gICAgICAgIHZhciBlX3Bvc3ggPSAwO1xuICAgICAgICB2YXIgZV9wb3N5ID0gMDtcbiAgICAgICAgaWYgKHdpdGhpbi5vZmZzZXRQYXJlbnQpe1xuICAgICAgICAgICAgZG8geyBcbiAgICAgICAgICAgICAgICBlX3Bvc3ggKz0gd2l0aGluLm9mZnNldExlZnQ7XG4gICAgICAgICAgICAgICAgZV9wb3N5ICs9IHdpdGhpbi5vZmZzZXRUb3A7XG4gICAgICAgICAgICB9IHdoaWxlICh3aXRoaW4gPSA8SFRNTEVsZW1lbnQ+d2l0aGluLm9mZnNldFBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFBvaW50MkQobV9wb3N4IC0gZV9wb3N4LCBtX3Bvc3kgLSBlX3Bvc3kpO1xuICAgIH1cbiAgICBcbn1cblxuYWJzdHJhY3QgY2xhc3MgWm9vbUxpc3RlbmVyIHtcbiAgICBhYnN0cmFjdCB6b29tKGJ5OiBudW1iZXIpO1xufVxuXG5leHBvcnQgY2xhc3MgWm9vbUNvbnRyb2xsZXIgZXh0ZW5kcyBNb3VzZUNvbnRyb2xsZXIge1xuXG5cdHByaXZhdGUgbGlzdGVuZXJzOiBBcnJheTxab29tTGlzdGVuZXI+ID0gW107XG5cdHByaXZhdGUgem9vbSA9IDE7XG5cbiAgICBjb25zdHJ1Y3Rvcih2aWV3Q2FudmFzOiBWaWV3Q2FudmFzLCByZWFkb25seSB6b29tSW46IEhUTUxFbGVtZW50LCByZWFkb25seSB6b29tT3V0OiBIVE1MRWxlbWVudCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgXHR6b29tSW4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlOkV2ZW50KSA9PiB0aGlzLmNsaWNrZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzLCAuOTUpKTtcbiAgICBcdHpvb21PdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlOkV2ZW50KSA9PiB0aGlzLmNsaWNrZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzLCAxLjA1KSk7XG4gICAgXHR2aWV3Q2FudmFzLmN0eC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5jbGlja2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcywgLjc1KSk7XG4gICAgfVxuXG4gICAgYWRkWm9vbUxpc3RlbmVyKHpvb21MaXN0ZW5lcjogWm9vbUxpc3RlbmVyKXtcbiAgICBcdHRoaXMubGlzdGVuZXJzLnB1c2goem9vbUxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICBjbGlja2VkKGV2ZW50OiBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzOiBWaWV3Q2FudmFzLCBieTogbnVtYmVyKSB7XG5cbiAgICBcdGNvbnNvbGUubG9nKFwiY2xpY2tlZFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQudHlwZSk7XG5cbiAgICBcdGNvbnNvbGUubG9nKFwibGlzdGVuZXJzIFwiICsgdGhpcy5saXN0ZW5lcnMubGVuZ3RoKTtcblxuICAgICAgICBzd2l0Y2goZXZlbnQudHlwZSl7XG4gICAgICAgICAgICBjYXNlIFwiZGJsY2xpY2tcIjpcbiAgICAgICAgICAgICAgICBsZXQgY2FudmFzID0gdmlld0NhbnZhcy5jdHguY2FudmFzO1xuXG4gICAgICAgICAgICAgICAgaWYgIChldmVudC5jdHJsS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGJ5ID0gMSAvIGJ5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsZXQgbVhZID0gdGhpcy5tb3VzZVBvc2l0aW9uKGV2ZW50LCB2aWV3Q2FudmFzLmN0eC5jYW52YXMpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZpZXdDYW52YXMuem9vbUFib3V0KG1YWS54IC8gY2FudmFzLmNsaWVudFdpZHRoLCBtWFkueSAvIGNhbnZhcy5jbGllbnRIZWlnaHQsIGJ5KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdmlld0NhbnZhcy56b29tVmlldyhieSk7XG4gICAgICAgIH1cblxuICAgIFx0dGhpcy56b29tID0gdGhpcy56b29tICogYnk7XG4gICAgXHRmb3IgKGxldCB2YWx1ZSBvZiB0aGlzLmxpc3RlbmVycyl7XG4gICAgXHRcdHZhbHVlLnpvb20odGhpcy56b29tKTtcbiAgICBcdH1cblxuICAgIFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgfTtcblxufTtcblxuZXhwb3J0IGNsYXNzIFBhbkNvbnRyb2xsZXIgZXh0ZW5kcyBab29tTGlzdGVuZXIge1xuXG5cdHByaXZhdGUgeFByZXZpb3VzOiBudW1iZXI7XG5cdHByaXZhdGUgeVByZXZpb3VzOiBudW1iZXI7XG5cdHByaXZhdGUgcmVjb3JkOiBib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgYmFzZU1vdmU6IG51bWJlciA9IDI1Njtcblx0cHJpdmF0ZSBtb3ZlOiBudW1iZXIgPSAyNTY7XG5cbiAgICBjb25zdHJ1Y3Rvcih2aWV3Q2FudmFzOiBWaWV3Q2FudmFzLCByZWFkb25seSBkcmFnRWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgICBcdHN1cGVyKCk7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcykpO1xuICAgIFx0ZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdDYW52YXMpKTtcbiAgICAgICAgZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKGU6RXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcykpO1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoZTpFdmVudCkgPT4gXG4gICAgICAgICAgICB0aGlzLnJlY29yZCA9IGZhbHNlKTtcbiAgICAgICAgdmlld0NhbnZhcy5jdHguY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCAoZTogRXZlbnQpID0+IFxuICAgICAgICAgICAgdGhpcy53aGVlbChlIGFzIFdoZWVsRXZlbnQsIHZpZXdDYW52YXMpKTtcbiAgICB9XG5cbiAgICB6b29tKGJ5OiBudW1iZXIpe1xuICAgIFx0Y29uc29sZS5sb2coXCJ6b29tIGJ5IFwiICsgYnkpO1xuICAgIFx0dGhpcy5tb3ZlID0gdGhpcy5iYXNlTW92ZSAvIGJ5O1xuICAgIH1cblxuXG4gICAgd2hlZWwoZXZlbnQ6IFdoZWVsRXZlbnQsIHZpZXdDYW52YXM6IFZpZXdDYW52YXMpIHtcblxuICAgICAgICAvL2NvbnNvbGUubG9nKFwid2hlZWxcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LnR5cGUpO1xuXG4gICAgICAgIGxldCB4RGVsdGEgPSBldmVudC5kZWx0YVggLyB0aGlzLm1vdmU7XG4gICAgICAgIGxldCB5RGVsdGEgPSBldmVudC5kZWx0YVkgLyB0aGlzLm1vdmU7XG5cbiAgICAgICAgbGV0IG5ld1RvcExlZnQgPSBuZXcgUG9pbnQyRCh2aWV3Q2FudmFzLnRvcExlZnQueCAtIHhEZWx0YSwgXG4gICAgICAgICAgICB2aWV3Q2FudmFzLnRvcExlZnQueSAtIHlEZWx0YSk7XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhcInRvcGxlZnQgXCIgKyBuZXdUb3BMZWZ0KTtcblxuICAgICAgICB2aWV3Q2FudmFzLm1vdmVWaWV3KG5ld1RvcExlZnQpO1xuICAgICAgICB2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICB9XG5cblxuICAgIGRyYWdnZWQoZXZlbnQ6IE1vdXNlRXZlbnQsIHZpZXdDYW52YXM6IFZpZXdDYW52YXMpIHtcblxuICAgICAgICBsZXQgY2FudmFzID0gdmlld0NhbnZhcy5jdHguY2FudmFzO1xuXG4gICAgXHRzd2l0Y2goZXZlbnQudHlwZSl7XG4gICAgXHRcdGNhc2UgXCJtb3VzZWRvd25cIjpcbiAgICBcdFx0XHR0aGlzLnJlY29yZCA9IHRydWU7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJtb3VzZXVwXCI6XG4gICAgXHRcdFx0dGhpcy5yZWNvcmQgPSBmYWxzZTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0ZGVmYXVsdDpcbiAgICBcdFx0XHRpZiAodGhpcy5yZWNvcmQpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgeERlbHRhID0gKGV2ZW50LmNsaWVudFggLSB0aGlzLnhQcmV2aW91cykgLyB0aGlzLm1vdmU7XG4gICAgICAgICAgICAgICAgICAgIGxldCB5RGVsdGEgPSAoZXZlbnQuY2xpZW50WSAtIHRoaXMueVByZXZpb3VzKSAvIHRoaXMubW92ZTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3VG9wTGVmdCA9IG5ldyBQb2ludDJEKHZpZXdDYW52YXMudG9wTGVmdC54IC0geERlbHRhLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdDYW52YXMudG9wTGVmdC55IC0geURlbHRhKTtcblxuICAgICAgICAgICAgICAgICAgICB2aWV3Q2FudmFzLm1vdmVWaWV3KG5ld1RvcExlZnQpO1xuICAgICAgICAgICAgICAgICAgICB2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHR9XG4gICAgXHR9XG5cblx0XHR0aGlzLnhQcmV2aW91cyA9IGV2ZW50LmNsaWVudFg7XG5cdFx0dGhpcy55UHJldmlvdXMgPSBldmVudC5jbGllbnRZO1xuXG4gICAgfTtcblxuICAgIG1vdXNlUG9zaXRpb24oZXZlbnQ6IE1vdXNlRXZlbnQsIHdpdGhpbjogSFRNTEVsZW1lbnQpOiBQb2ludDJEIHtcbiAgICAgICAgbGV0IG1fcG9zeCA9IGV2ZW50LmNsaWVudFggKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnRcbiAgICAgICAgICAgICAgICAgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdDtcbiAgICAgICAgbGV0IG1fcG9zeSA9IGV2ZW50LmNsaWVudFkgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxuICAgICAgICAgICAgICAgICArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7XG5cbiAgICAgICAgdmFyIGVfcG9zeCA9IDA7XG4gICAgICAgIHZhciBlX3Bvc3kgPSAwO1xuICAgICAgICBpZiAod2l0aGluLm9mZnNldFBhcmVudCl7XG4gICAgICAgICAgICBkbyB7IFxuICAgICAgICAgICAgICAgIGVfcG9zeCArPSB3aXRoaW4ub2Zmc2V0TGVmdDtcbiAgICAgICAgICAgICAgICBlX3Bvc3kgKz0gd2l0aGluLm9mZnNldFRvcDtcbiAgICAgICAgICAgIH0gd2hpbGUgKHdpdGhpbiA9IDxIVE1MRWxlbWVudD53aXRoaW4ub2Zmc2V0UGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQyRChtX3Bvc3ggLSBlX3Bvc3gsIG1fcG9zeSAtIGVfcG9zeSk7XG4gICAgfVxuICAgIFxufTtcblxuIl19
