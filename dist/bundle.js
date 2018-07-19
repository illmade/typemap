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
        this.widthMapUnits = this.widthMapUnits * zoom;
        this.heightMapUnits = this.heightMapUnits * zoom;
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
        _this.gridLayer = new grid_1.GridLayer(ctx, 1);
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
        var width = this.ctx.canvas.clientWidth;
        var height = this.ctx.canvas.clientHeight;
        this.ctx.clearRect(0, 0, width, height);
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
                    tile.draw(this.ctx, tileX, tileY);
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
            value.draw(this.ctx, imageX, imageY);
            this.scale(256, dimension, true);
        }
        this.scale(256, dimension, false);
        this.gridLayer.draw(this.topLeft, dimension.x, dimension.y);
        this.scale(256, dimension, true);
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
var marysImage = new canvastile_1.StaticImage(-2, 0, .4, .4, 0, "images/maps_145_b_4_(2)_f005r[SVC2].jpg", 0.7);
var totalImage = new canvastile_1.StaticImage(4.485, -1.875, 7.465, 7.35, 0, "images/maps_145_b_4_(2)_f001r[SVC2].jpg", .4);
function showMap(divName, name) {
    var canvas = document.getElementById(divName);
    var ctx = canvas.getContext('2d');
    ctx.canvas.width = ctx.canvas.clientWidth;
    ctx.canvas.height = ctx.canvas.clientHeight;
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
    viewCanvas.draw();
    var plus = document.getElementById("plus");
    var minus = document.getElementById("minus");
    var panControl = new mapController_1.PanController(viewCanvas, canvas);
    var canvasControl = new mapController_1.ZoomController(viewCanvas, plus, minus);
    canvasControl.addZoomListener(panControl);
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
        viewCanvas.zoomView(by);
        console.log("listeners " + this.listeners.length);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2dlb20vdGlsZS50cyIsInNyYy9nZW9tL3ZpZXdwb3J0LnRzIiwic3JjL2dlb20vd29ybGQyZC50cyIsInNyYy9ncmFwaGljcy9jYW52YXN0aWxlLnRzIiwic3JjL2dyYXBoaWNzL2dyaWQudHMiLCJzcmMvZ3JhcGhpY3Mvdmlld2NhbnZhcy50cyIsInNyYy9zaW1wbGVXb3JsZC50cyIsInNyYy91aS9pbWFnZUNvbnRyb2xsZXIudHMiLCJzcmMvdWkvbWFwQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQ0E7SUFPSSxpQkFBWSxDQUFTLEVBQUUsQ0FBUztRQUM1QixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFRSwwQkFBUSxHQUFSO1FBQ0ksT0FBTyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDckQsQ0FBQztJQWJlLFlBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDekIsV0FBRyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQWM1QyxjQUFDO0NBaEJELEFBZ0JDLElBQUE7QUFoQlksMEJBQU87Ozs7O0FDRXBCO0lBRUMsbUJBQW1CLGFBQXFCLEVBQVMsY0FBc0I7UUFBcEQsa0JBQWEsR0FBYixhQUFhLENBQVE7UUFBUyxtQkFBYyxHQUFkLGNBQWMsQ0FBUTtJQUFFLENBQUM7SUFJMUUsNEJBQVEsR0FBUixVQUFTLFFBQWlCLEVBQUUsU0FBaUIsRUFBRSxTQUFpQjtRQUUvRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFD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Q0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7Z0JBQzFELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzlELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtZQUNQLEtBQUssR0FBRztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFB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T0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO29CQUMxRCxJQUFJLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7b0JBRTFELElBQUksVUFBVSxHQUFHLElBQUksaUJBQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxNQUFNLEVBQ3pELFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO29CQUVoQyxVQUFVLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNoQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7aUJBQ2xCO1NBRUY7UUFFSixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDL0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO0lBRTdCLENBQUM7SUFBQSxDQUFDO0lBRU4sb0JBQUM7QUFBRCxDQXBEQSxBQW9EQyxDQXBEa0MsWUFBWSxHQW9EOUM7QUFwRFksc0NBQWE7QUFvRHpCLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcbmV4cG9ydCBjbGFzcyBQb2ludDJEIHtcbiAgICBzdGF0aWMgcmVhZG9ubHkgemVybyA9IG5ldyBQb2ludDJEKDAsIDApO1xuICAgIHN0YXRpYyByZWFkb25seSBvbmUgPSBuZXcgUG9pbnQyRCgxLCAxKTtcblxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcbiAgICByZWFkb25seSB5OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuXHR9XG5cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gXCJQb2ludDJEKFwiICsgdGhpcy54ICsgXCIsIFwiICsgdGhpcy55ICsgXCIpXCI7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgVW5pdHMgfSBmcm9tIFwiLi93b3JsZDJkXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4vcG9pbnQyZFwiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVGlsZUxheWVyIHtcblx0XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB3aWR0aE1hcFVuaXRzOiBudW1iZXIsIHB1YmxpYyBoZWlnaHRNYXBVbml0czogbnVtYmVyKXt9XG5cblx0YWJzdHJhY3QgZ2V0VGlsZSh4SW5kZXg6IG51bWJlciwgeUluZGV4OiBudW1iZXIpOiBUaWxlO1xuXG5cdGdldFRpbGVzKHBvc2l0aW9uOiBQb2ludDJELCB4TWFwVW5pdHM6IG51bWJlciwgeU1hcFVuaXRzOiBudW1iZXIpOiBBcnJheTxUaWxlPiB7XG5cblx0XHRsZXQgZmlyc3RYID0gTWF0aC5mbG9vcihwb3NpdGlvbi54IC8gdGhpcy53aWR0aE1hcFVuaXRzKTtcblx0XHRsZXQgbGFzdFggPSBNYXRoLmNlaWwoKHBvc2l0aW9uLnggKyB4TWFwVW5pdHMpLyB0aGlzLndpZHRoTWFwVW5pdHMpO1xuXG5cdFx0bGV0IGZpcnN0WSA9IE1hdGguZmxvb3IocG9zaXRpb24ueSAvIHRoaXMuaGVpZ2h0TWFwVW5pdHMpO1xuXHRcdGxldCBsYXN0WSA9IE1hdGguY2VpbCgocG9zaXRpb24ueSArIHlNYXBVbml0cykvIHRoaXMuaGVpZ2h0TWFwVW5pdHMpO1xuXG5cdFx0bGV0IHRpbGVzID0gbmV3IEFycmF5PFRpbGU+KCk7XG5cblx0XHRmb3IgKHZhciB4PWZpcnN0WDsgeDxsYXN0WDsgeCsrKXtcblx0XHRcdGZvciAodmFyIHk9Zmlyc3RZOyB5PGxhc3RZOyB5Kyspe1xuXHRcdFx0XHR0aWxlcy5wdXNoKHRoaXMuZ2V0VGlsZSh4LCB5KSlcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGlsZXM7XG5cdH1cblxufVxuXG5leHBvcnQgY2xhc3MgVGlsZSB7XG5cdFxuXHRzdGF0aWMgZW1wdHlUaWxlOiBUaWxlID0gbmV3IFRpbGUoLTEsLTEpO1xuXG5cdGNvbnN0cnVjdG9yKHhJbmRleDogbnVtYmVyLCB5SW5kZXg6IG51bWJlcil7fVxuXG59IiwiaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuL3BvaW50MmRcIjtcbmltcG9ydCB7IFZlY3RvcjJEIH0gZnJvbSBcIi4vdmVjdG9yMmRcIjtcbmltcG9ydCB7IFdvcmxkMkQsIFVuaXRzIH0gZnJvbSBcIi4vd29ybGQyZFwiO1xuXG5leHBvcnQgY2xhc3MgVmlld3BvcnQge1xuXHRcblx0Y29uc3RydWN0b3IocHVibGljIHRvcExlZnQ6IFBvaW50MkQsIFxuXHRcdHByaXZhdGUgd2lkdGhNYXBVbml0czogbnVtYmVyLCBwcml2YXRlIGhlaWdodE1hcFVuaXRzOiBudW1iZXIpe1xuXG5cdFx0Y29uc29sZS5sb2coXCJ3IGhcIiArIHdpZHRoTWFwVW5pdHMgKyBcIiwgXCIgKyBoZWlnaHRNYXBVbml0cyk7XG5cdH1cblxuXHRtb3ZlVmlldyh0b3BMZWZ0OiBQb2ludDJEKXtcblx0XHR0aGlzLnRvcExlZnQgPSB0b3BMZWZ0O1xuXHR9XG5cblx0em9vbVZpZXcoem9vbTogbnVtYmVyKXtcblx0XHR0aGlzLndpZHRoTWFwVW5pdHMgPSB0aGlzLndpZHRoTWFwVW5pdHMgKiB6b29tO1xuXHRcdHRoaXMuaGVpZ2h0TWFwVW5pdHMgPSB0aGlzLmhlaWdodE1hcFVuaXRzICogem9vbTtcblx0fVxuXG5cdGdldERpbWVuc2lvbnMoKXtcblx0XHRyZXR1cm4gbmV3IFBvaW50MkQodGhpcy53aWR0aE1hcFVuaXRzLCB0aGlzLmhlaWdodE1hcFVuaXRzKTtcblx0fVxuXG59IiwiaW1wb3J0IHsgVGlsZUxheWVyIH0gZnJvbSBcIi4vdGlsZVwiO1xuXG5leHBvcnQgY2xhc3MgVW5pdHMge1xuXG5cdHN0YXRpYyByZWFkb25seSBXZWJXVSA9IG5ldyBVbml0cyhcIk1lcmNhdG9yIFdlYiBXb3JsZCBVbml0c1wiKTtcblxuXHRjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpe31cblxufVxuLyoqXG4gIEEgd29ybGQgaXMgdGhlIGJhc2UgdGhhdCBhbGwgb3RoZXIgZWxlbWVudHMgb3JpZW50YXRlIGZyb20gXG4qKi9cbmV4cG9ydCBjbGFzcyBXb3JsZDJEIHtcblxuXHRwcml2YXRlIHRpbGVMYXllcnM6IEFycmF5PFRpbGVMYXllcj4gPSBbXTtcblx0XG5cdGNvbnN0cnVjdG9yKCl7fVxuXG4gICAgYWRkVGlsZUxheWVyKHRpbGVMYXllcjogVGlsZUxheWVyKTogbnVtYmVyIHtcbiAgICBcdHJldHVybiB0aGlzLnRpbGVMYXllcnMucHVzaCh0aWxlTGF5ZXIpO1xuICAgIH1cblxufSIsImltcG9ydCB7IFRpbGUsIFRpbGVMYXllciB9IGZyb20gXCIuLi9nZW9tL3RpbGVcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDYW52YXNUaWxlIGV4dGVuZHMgVGlsZSB7XG5cblx0YWJzdHJhY3QgZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgc2NhbGluZ1g6IG51bWJlciwgc2NhbGluZ1k6IG51bWJlciwgXG5cdFx0Y2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpOiB2b2lkO1xuXG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZVN0cnVjdCB7XG5cblx0cHJlZml4OiBzdHJpbmcgPSBcIlwiO1xuXHRzdWZmaXg6IHN0cmluZyA9IFwiXCI7XG5cdHRpbGVEaXI6IHN0cmluZyA9IFwiaW1hZ2VzL1wiO1xuXHR2aXNpYmxlOiBib29sZWFuID0gdHJ1ZTtcblx0dGlsZVdpZHRoUHg6IG51bWJlciA9IDI1Njtcblx0dGlsZUhlaWdodFB4OiBudW1iZXIgPSAyNTY7XG5cdHdpZHRoTWFwVW5pdHM6IG51bWJlciA9IDE7XG5cdGhlaWdodE1hcFVuaXRzOiBudW1iZXIgPSAxOyBcblxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VUaWxlIGV4dGVuZHMgQ2FudmFzVGlsZSB7XG5cblx0cHJpdmF0ZSBpbWc6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cblx0Y29uc3RydWN0b3IocmVhZG9ubHkgeEluZGV4OiBudW1iZXIsIHJlYWRvbmx5IHlJbmRleDogbnVtYmVyLCBpbWFnZVNyYzogc3RyaW5nKSB7XG5cdFx0c3VwZXIoeEluZGV4LCB5SW5kZXgpO1xuXHRcdHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG5cdFx0dGhpcy5pbWcuc3JjID0gaW1hZ2VTcmM7XG5cdH07XG5cblx0cHJpdmF0ZSBkcmF3SW1hZ2UoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKXtcblx0XHRjdHguZHJhd0ltYWdlKHRoaXMuaW1nLCBjYW52YXNYLCBjYW52YXNZKTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKXtcblx0XHRpZiAodGhpcy5pbWcuY29tcGxldGUpIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5pbWcub25sb2FkID0gKGV2ZW50KSA9PiB7XG5cdFx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fTtcblxufVxuXG5leHBvcnQgY2xhc3MgU3RhdGljSW1hZ2Uge1xuXG5cdHByaXZhdGUgaW1nOiBIVE1MSW1hZ2VFbGVtZW50O1xuXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB4SW5kZXg6IG51bWJlciwgcHVibGljIHlJbmRleDogbnVtYmVyLCBcblx0XHRwdWJsaWMgc2NhbGluZ1g6IG51bWJlciwgcHVibGljIHNjYWxpbmdZOiBudW1iZXIsIHB1YmxpYyByb3RhdGlvbjogbnVtYmVyLCBcblx0XHRpbWFnZVNyYzogc3RyaW5nLCByZWFkb25seSBhbHBoYTogbnVtYmVyKSB7XG5cdFx0XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0fTtcblxuXHRwcml2YXRlIGRyYXdJbWFnZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgY2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpe1xuXG5cdFx0Ly9zY2FsaW5nWCA9IHNjYWxpbmdYICogdGhpcy5zY2FsaW5nO1xuXHRcdC8vc2NhbGluZ1kgPSBzY2FsaW5nWSAqIHRoaXMuc2NhbGluZztcblxuXHRcdC8vIGxldCBjb3NYID0gTWF0aC5jb3ModGhpcy5yb3RhdGlvbik7XG5cdFx0Ly8gbGV0IHNpblggPSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uKTtcblxuXHRcdGN0eC50cmFuc2xhdGUoY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0Y3R4LnJvdGF0ZSh0aGlzLnJvdGF0aW9uKTtcblx0XHRjdHguc2NhbGUodGhpcy5zY2FsaW5nWCwgdGhpcy5zY2FsaW5nWSk7XG5cdFx0Ly9jb25zb2xlLmxvZyhcInh5U2NhbGluZyBcIiArIHRoaXMuc2NhbGluZ1ggKyBcIiwgXCIgKyB0aGlzLnNjYWxpbmdZKTtcblx0XHRjdHguZ2xvYmFsQWxwaGEgPSB0aGlzLmFscGhhO1xuXG5cdFx0Ly8gY3R4LnRyYW5zZm9ybShjb3NYICogc2NhbGluZ1gsIHNpblggKiBzY2FsaW5nWSwgLXNpblggKiBzY2FsaW5nWCwgY29zWCAqIHNjYWxpbmdZLCBcblx0XHQvLyBcdGNhbnZhc1ggLyB0aGlzLnNjYWxpbmcsIGNhbnZhc1kgLyB0aGlzLnNjYWxpbmcpO1xuXG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZywgLSh0aGlzLmltZy53aWR0aC8yKSwgLSh0aGlzLmltZy5oZWlnaHQvMikpO1xuXHRcdFxuXHRcdGN0eC5zY2FsZSgxL3RoaXMuc2NhbGluZ1gsIDEvdGhpcy5zY2FsaW5nWSk7XG5cdFx0Y3R4LnJvdGF0ZSgtdGhpcy5yb3RhdGlvbik7XG5cdFx0Y3R4LnRyYW5zbGF0ZSgtY2FudmFzWCwgLWNhbnZhc1kpO1xuXHRcdGN0eC5nbG9iYWxBbHBoYSA9IDE7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBjYW52YXNYOiBudW1iZXIsIGNhbnZhc1k6IG51bWJlcil7XG5cdFx0aWYgKHRoaXMuaW1nLmNvbXBsZXRlKSB7XG5cdFx0XHR0aGlzLmRyYXdJbWFnZShjdHgsIGNhbnZhc1gsIGNhbnZhc1kpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuaW1nLm9ubG9hZCA9IChldmVudCkgPT4ge1xuXHRcdFx0XHR0aGlzLmRyYXdJbWFnZShjdHgsIGNhbnZhc1gsIGNhbnZhc1kpO1xuXHRcdFx0fTtcblx0XHR9XG5cdH07XG5cbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlVGlsZUxheWVyIGV4dGVuZHMgVGlsZUxheWVyIHtcblxuXHRyZWFkb25seSBpbWFnZVByb3BlcnRpZXM6IEltYWdlU3RydWN0O1xuXG5cdGNvbnN0cnVjdG9yKGltYWdlUHJvcGVydGllczogSW1hZ2VTdHJ1Y3QpIHtcblx0XHRzdXBlcihpbWFnZVByb3BlcnRpZXMud2lkdGhNYXBVbml0cywgaW1hZ2VQcm9wZXJ0aWVzLmhlaWdodE1hcFVuaXRzKTtcblx0XHR0aGlzLmltYWdlUHJvcGVydGllcyA9IGltYWdlUHJvcGVydGllcztcblx0fVxuXG5cdC8qKlxuXHQgIGxlYXZlIGNhY2hpbmcgdXAgdG8gdGhlIGJyb3dzZXJcblx0KiovXG5cdGdldFRpbGUoeFVuaXRzOiBudW1iZXIsIHlVbml0czogbnVtYmVyKTogVGlsZSB7XG5cdFx0bGV0IGltYWdlU3JjID0gdGhpcy5pbWFnZVByb3BlcnRpZXMudGlsZURpciArIFxuXHRcdFx0dGhpcy5pbWFnZVByb3BlcnRpZXMucHJlZml4ICsgeFVuaXRzICsgXCJfXCIgKyB5VW5pdHMgKyB0aGlzLmltYWdlUHJvcGVydGllcy5zdWZmaXg7XG5cdFx0cmV0dXJuIG5ldyBJbWFnZVRpbGUoeFVuaXRzLCB5VW5pdHMsIGltYWdlU3JjKTtcblx0fVxuXG59XG4iLCJpbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgY2xhc3MgR3JpZExheWVyIHtcblxuXHRwcml2YXRlIGdyaWRTcGFjaW5nOiBudW1iZXI7XG5cblx0Y29uc3RydWN0b3IocHVibGljIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBncmlkU3BhY2luZzogbnVtYmVyKSB7XG5cdFx0dGhpcy5ncmlkU3BhY2luZyA9IGdyaWRTcGFjaW5nO1xuXHR9XG5cblx0c2V0R3JpZFNwYWNpbmcoZ3JpZFNwYWNpbmc6IG51bWJlcil7XG5cdFx0dGhpcy5ncmlkU3BhY2luZyA9IGdyaWRTcGFjaW5nO1xuXHR9XG5cdC8qKlxuXHQgIGxlYXZlIGNhY2hpbmcgdXAgdG8gdGhlIGJyb3dzZXJcblx0KiovXG5cdGRyYXcodG9wTGVmdDogUG9pbnQyRCwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcblx0XHRsZXQgbWluWCA9IE1hdGguZmxvb3IodG9wTGVmdC54KTtcblx0XHRsZXQgbWluWSA9IE1hdGguZmxvb3IodG9wTGVmdC55KTtcblxuXHRcdHRoaXMuY3R4LnRyYW5zbGF0ZSgtMjU2ICogdG9wTGVmdC54LCAtMjU2ICogdG9wTGVmdC55KTtcblx0XHQvL2NvbnNvbGUubG9nKFwibWlucyBcIiArIHdpZHRoICsgXCIsIFwiICsgaGVpZ2h0KTtcblxuXHRcdGxldCBsYXN0WCA9IE1hdGguY2VpbCh0b3BMZWZ0LnggKyB3aWR0aCk7XG5cdFx0bGV0IGxhc3RZID0gTWF0aC5jZWlsKHRvcExlZnQueSArIGhlaWdodCk7XG5cblx0XHR0aGlzLmN0eC5zdHJva2VTdHlsZSA9ICdibHVlJztcblx0XHR0aGlzLmN0eC5mb250ID0gJzQ4cHggc2VyaWYnO1xuXG5cdFx0bGV0IHlaZXJvID0gbWluWSAqIHRoaXMuZ3JpZFNwYWNpbmcgKiAyNTY7XG5cdFx0bGV0IHlNYXggPSBsYXN0WSAqIHRoaXMuZ3JpZFNwYWNpbmcgKiAyNTY7XG5cdFx0bGV0IHhKdW1wID0gdGhpcy5ncmlkU3BhY2luZyAqIDI1NjtcblxuXHRcdGxldCB4WmVybyA9IG1pblggKiB0aGlzLmdyaWRTcGFjaW5nICogMjU2O1xuXHRcdGxldCB4TWF4ID0gbGFzdFggKiB0aGlzLmdyaWRTcGFjaW5nICogMjU2O1xuXHRcdGxldCB5SnVtcCA9IHRoaXMuZ3JpZFNwYWNpbmcgKiAyNTY7XG5cblx0XHR0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICBcdC8vdGhpcy5jdHguY2xlYXJSZWN0KHhaZXJvLCB5WmVybywgeE1heCwgeU1heCk7XG5cblx0XHRmb3IgKHZhciB4ID0gbWluWDsgeDxsYXN0WDsgeCsrKXtcblx0XHRcdC8vY29uc29sZS5sb2coXCJhdCBcIiArIG1pblgpO1xuXHRcdFx0bGV0IHhNb3ZlID0geCAqIHhKdW1wO1xuXHRcdFx0dGhpcy5jdHgubW92ZVRvKHhNb3ZlLCB5WmVybyk7XG5cdFx0XHR0aGlzLmN0eC5saW5lVG8oeE1vdmUsIHlNYXgpO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIHkgPSBtaW5ZOyB5PGxhc3RZOyB5Kyspe1xuXHRcdFx0bGV0IHlNb3ZlID0geSAqIHlKdW1wO1xuXHRcdFx0dGhpcy5jdHgubW92ZVRvKHhaZXJvLCB5TW92ZSk7XG5cdFx0XHR0aGlzLmN0eC5saW5lVG8oeE1heCwgeU1vdmUpO1xuXG5cdFx0XHRmb3IgKHZhciB4ID0gbWluWDsgeDxsYXN0WDsgeCsrKXtcblx0XHRcdFx0bGV0IHhNb3ZlID0gKHggLSAwLjUpICogeEp1bXA7XG5cdFx0XHRcdHlNb3ZlID0gKHkgLSAwLjUpICogeUp1bXA7XG5cdFx0XHRcdGxldCB0ZXh0ID0gXCJcIiArICh4LTEpICsgXCIsIFwiICsgKHktMSk7XG5cdFx0XHRcdHRoaXMuY3R4LmZpbGxUZXh0KHRleHQsIHhNb3ZlLCB5TW92ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMuY3R4LnN0cm9rZSgpO1xuXHRcdHRoaXMuY3R4LnRyYW5zbGF0ZSgyNTYgKiB0b3BMZWZ0LngsIDI1NiAqIHRvcExlZnQueSk7XG5cdH1cblxuXG59IiwiaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tIFwiLi4vZ2VvbS92aWV3cG9ydFwiO1xuaW1wb3J0IHsgV29ybGQyRCB9IGZyb20gXCIuLi9nZW9tL3dvcmxkMmRcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBTdGF0aWNJbWFnZSwgSW1hZ2VUaWxlLCBJbWFnZVRpbGVMYXllciB9IGZyb20gXCIuL2NhbnZhc3RpbGVcIjtcbmltcG9ydCB7IEdyaWRMYXllciB9IGZyb20gXCIuL2dyaWRcIjtcblxuZXhwb3J0IGNsYXNzIFZpZXdDYW52YXMgZXh0ZW5kcyBWaWV3cG9ydCB7XG5cbiAgICBwcml2YXRlIHN0YXRpY0VsZW1lbnRzOiBBcnJheTxTdGF0aWNJbWFnZT4gPSBbXTtcbiAgICBwcml2YXRlIGltYWdlVGlsZUxheWVycyA9IFtdO1xuXG4gICAgcHJpdmF0ZSBncmlkTGF5ZXI6IEdyaWRMYXllcjtcblxuICAgIGNvbnN0cnVjdG9yKHRvcExlZnQ6IFBvaW50MkQsIFxuICAgIFx0d2lkdGhNYXBVbml0czogbnVtYmVyLCBoZWlnaHRNYXBVbml0czogbnVtYmVyLCBcbiAgICBcdHJlYWRvbmx5IGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKSB7XG5cbiAgICBcdHN1cGVyKHRvcExlZnQsIHdpZHRoTWFwVW5pdHMsIGhlaWdodE1hcFVuaXRzKTtcblxuICAgIFx0dGhpcy5ncmlkTGF5ZXIgPSBuZXcgR3JpZExheWVyKGN0eCwgMSk7XG4gICAgfVxuXG4gICAgYWRkVGlsZUxheWVyKGltYWdlVGlsZUxheWVyOiBJbWFnZVRpbGVMYXllcik6IHZvaWQge1xuICAgIFx0dGhpcy5pbWFnZVRpbGVMYXllcnMucHVzaChpbWFnZVRpbGVMYXllcik7XG4gICAgfVxuXG4gICAgYWRkU3RhdGljRWxlbWVudChzdGF0aWNJbWFnZTogU3RhdGljSW1hZ2UpOiB2b2lkIHtcbiAgICBcdHRoaXMuc3RhdGljRWxlbWVudHMucHVzaChzdGF0aWNJbWFnZSk7XG4gICAgfVxuXG4gICAgZ2V0Vmlld1NjYWxpbmcocGl4ZWxzUGVyVW5pdDogbnVtYmVyKTogUG9pbnQyRCB7XG4gICAgXHRsZXQgZGltZW5zaW9uID0gdGhpcy5nZXREaW1lbnNpb25zKCk7XG4gICAgXHRsZXQgdmlld1NjYWxpbmdYID0gdGhpcy5jdHguY2FudmFzLmNsaWVudFdpZHRoIC8gZGltZW5zaW9uLnggLyBwaXhlbHNQZXJVbml0O1xuICAgIFx0bGV0IHZpZXdTY2FsaW5nWSA9IHRoaXMuY3R4LmNhbnZhcy5jbGllbnRIZWlnaHQgLyBkaW1lbnNpb24ueSAvIHBpeGVsc1BlclVuaXQ7XG4gICAgXHRyZXR1cm4gbmV3IFBvaW50MkQodmlld1NjYWxpbmdYLCB2aWV3U2NhbGluZ1kpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2NhbGUocGl4ZWxzUGVyVW5pdDogbnVtYmVyLCBkaW1lbnNpb246IFBvaW50MkQsIHJldmVyc2U6IGJvb2xlYW4pOiB2b2lkIHtcblxuICAgIFx0bGV0IHZpZXdTY2FsaW5nID0gdGhpcy5nZXRWaWV3U2NhbGluZyhwaXhlbHNQZXJVbml0KTtcblxuICAgIFx0aWYgKHJldmVyc2Upe1xuICAgIFx0XHR0aGlzLmN0eC5zY2FsZSgxL3ZpZXdTY2FsaW5nLngsIDEvdmlld1NjYWxpbmcueSk7XG4gICAgXHR9IGVsc2Uge1xuICAgIFx0XHR0aGlzLmN0eC5zY2FsZSh2aWV3U2NhbGluZy54LCB2aWV3U2NhbGluZy55KTtcbiAgICBcdH1cbiAgICBcdFxuICAgIH1cblxuICAgIGRyYXcoKTogdm9pZCB7XG4gICAgXHRsZXQgZGltZW5zaW9uID0gdGhpcy5nZXREaW1lbnNpb25zKCk7XG5cbiAgICBcdGxldCB3aWR0aCA9IHRoaXMuY3R4LmNhbnZhcy5jbGllbnRXaWR0aDtcbiAgICBcdGxldCBoZWlnaHQgPSB0aGlzLmN0eC5jYW52YXMuY2xpZW50SGVpZ2h0O1xuXG4gICAgXHR0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICBcdGZvciAobGV0IHZhbHVlIG9mIHRoaXMuaW1hZ2VUaWxlTGF5ZXJzKXtcbiAgICBcdFx0aWYgKHZhbHVlLmltYWdlUHJvcGVydGllcy52aXNpYmxlKSB7XG5cbiAgICBcdFx0XHR0aGlzLnNjYWxlKHZhbHVlLmltYWdlUHJvcGVydGllcy50aWxlV2lkdGhQeCwgZGltZW5zaW9uLCBmYWxzZSk7XG5cbiAgICBcdFx0XHRsZXQgdGlsZVNjYWxpbmdYID0gdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVXaWR0aFB4IC8gdmFsdWUud2lkdGhNYXBVbml0cztcbiAgICBcdFx0XHRsZXQgdGlsZVNjYWxpbmdZID0gdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVIZWlnaHRQeCAvIHZhbHVlLmhlaWdodE1hcFVuaXRzO1xuXG4gICAgXHRcdFx0bGV0IHRpbGVzOiBBcnJheTxJbWFnZVRpbGU+ID0gdmFsdWUuZ2V0VGlsZXModGhpcy50b3BMZWZ0LCBcbiAgICBcdFx0XHRcdGRpbWVuc2lvbi54LCBkaW1lbnNpb24ueSk7XG5cbiAgICBcdFx0XHRmb3IgKGxldCB0aWxlIG9mIHRpbGVzKXtcbiAgICBcdFx0XHRcdHZhciB0aWxlWCA9ICh0aWxlLnhJbmRleCAtIHRoaXMudG9wTGVmdC54KSAqIHRpbGVTY2FsaW5nWDtcbiAgICBcdFx0XHRcdHZhciB0aWxlWSA9ICh0aWxlLnlJbmRleCAtIHRoaXMudG9wTGVmdC55KSAqIHRpbGVTY2FsaW5nWTtcblxuICAgIFx0XHRcdFx0dGlsZS5kcmF3KHRoaXMuY3R4LCB0aWxlWCwgdGlsZVkpO1xuICAgIFx0XHRcdH1cblxuICAgIFx0XHRcdHRoaXMuc2NhbGUodmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVXaWR0aFB4LCBkaW1lbnNpb24sIHRydWUpO1xuICAgIFx0XHR9XG4gICAgXHR9XG5cbiAgICBcdGZvciAobGV0IHZhbHVlIG9mIHRoaXMuc3RhdGljRWxlbWVudHMpe1xuICAgIFx0XHQvLzI1NiBweCBpcyAxIG1hcCB1bml0XG5cdFx0XHRsZXQgdGlsZVNjYWxpbmdYID0gMjU2O1xuXHRcdFx0bGV0IHRpbGVTY2FsaW5nWSA9IDI1NjtcblxuICAgIFx0XHR0aGlzLnNjYWxlKDI1NiwgZGltZW5zaW9uLCBmYWxzZSk7XG5cbiAgICBcdFx0bGV0IGltYWdlWCA9ICh2YWx1ZS54SW5kZXggLSB0aGlzLnRvcExlZnQueCkgKiB0aWxlU2NhbGluZ1g7XG4gICAgXHRcdGxldCBpbWFnZVkgPSAodmFsdWUueUluZGV4IC0gdGhpcy50b3BMZWZ0LnkpICogdGlsZVNjYWxpbmdZO1xuXG4gICAgXHRcdHZhbHVlLmRyYXcodGhpcy5jdHgsIGltYWdlWCwgaW1hZ2VZKTtcbiAgICBcdFx0dGhpcy5zY2FsZSgyNTYsIGRpbWVuc2lvbiwgdHJ1ZSk7XG5cbiAgICBcdH1cblxuICAgIFx0dGhpcy5zY2FsZSgyNTYsIGRpbWVuc2lvbiwgZmFsc2UpO1xuICAgIFx0dGhpcy5ncmlkTGF5ZXIuZHJhdyh0aGlzLnRvcExlZnQsIGRpbWVuc2lvbi54LCBkaW1lbnNpb24ueSk7XG4gICAgXHR0aGlzLnNjYWxlKDI1NiwgZGltZW5zaW9uLCB0cnVlKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBXb3JsZDJEIH0gZnJvbSBcIi4vZ2VvbS93b3JsZDJkXCI7XG5pbXBvcnQgeyBWaWV3cG9ydCB9IGZyb20gXCIuL2dlb20vdmlld3BvcnRcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi9nZW9tL3BvaW50MmRcIjtcbmltcG9ydCB7IFN0YXRpY0ltYWdlLCBJbWFnZVRpbGVMYXllciwgSW1hZ2VTdHJ1Y3QgfSBmcm9tIFwiLi9ncmFwaGljcy9jYW52YXN0aWxlXCI7XG5pbXBvcnQgeyBWaWV3Q2FudmFzIH0gZnJvbSBcIi4vZ3JhcGhpY3Mvdmlld2NhbnZhc1wiO1xuaW1wb3J0IHsgWm9vbUNvbnRyb2xsZXIsIFBhbkNvbnRyb2xsZXIgfSBmcm9tIFwiLi91aS9tYXBDb250cm9sbGVyXCI7XG5pbXBvcnQgeyBJbWFnZUNvbnRyb2xsZXIgfSBmcm9tIFwiLi91aS9pbWFnZUNvbnRyb2xsZXJcIjtcblxubGV0IHNpbXBsZVdvcmxkID0gbmV3IFdvcmxkMkQoKTtcblxuLy8gbGV0IGxheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuLy8gbGF5ZXJQcm9wZXJ0aWVzLnByZWZpeCA9IFwiXCI7XG4vLyBsYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCIucG5nXCI7XG5cbi8vIGxldCByb2FkTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG4vLyByb2FkTGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwiYi5wbmdcIjtcblxuLy8gbGV0IHNlbnRpbmVsTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG4vLyBzZW50aW5lbExheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImwuanBlZ1wiO1xuXG4vLyBsZXQgc2VudGluZWxUZXJyYWluTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG4vLyBzZW50aW5lbFRlcnJhaW5MYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCJ0LmpwZWdcIjtcblxubGV0IGxpZmZleUxheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xubGlmZmV5TGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwibGlmZmV5LmpwZWdcIjtcbmxpZmZleUxheWVyUHJvcGVydGllcy50aWxlRGlyID0gXCJpbWFnZXMvbGlmZmV5L1wiO1xuXG5sZXQgbGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbmxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwibGlmZmV5LnBuZ1wiO1xubGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMudGlsZURpciA9IFwiaW1hZ2VzL2xpZmZleS9cIjtcbmxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzLnZpc2libGUgPSB0cnVlO1xuXG4vLyBsZXQgYmFzZUxheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKGxheWVyUHJvcGVydGllcyk7XG4vLyBsZXQgc2VudGluZWxMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihzZW50aW5lbExheWVyUHJvcGVydGllcyk7XG4vLyBsZXQgcm9hZExheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKHJvYWRMYXllclByb3BlcnRpZXMpO1xuLy8gbGV0IHRlcnJhaW5MYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihzZW50aW5lbFRlcnJhaW5MYXllclByb3BlcnRpZXMpO1xuXG5sZXQgbGlmZmV5U2VudGluZWxMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihsaWZmZXlMYXllclByb3BlcnRpZXMpO1xubGV0IGxpZmZleUxhYmVsTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIobGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMpO1xuXG5sZXQgZG9saWVySW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMi4yNCwgMS44NywgLjQzLCAuNDMsIC0wLjA2LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDE3UltTVkMyXS5qcGdcIiwgLjcpO1xuXG5sZXQgdHJpbml0eUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDEuOTksIDMuNTksIC40MywgLjQzLCAwLjE1LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDE5UltTVkMyXS5qcGdcIiwgLjcpO1xuXG5sZXQgcG9vbGJlZ0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDMuMzQsIDEuNjI1LCAuNDA1LCAuNDMsIDAuMDUsXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAxOFJbU1ZDMl0uanBnXCIsIC43KTtcblxubGV0IGFiYmV5SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMi4zOSwgMC4wMzUsIC40MTUsIC40MzUsIC0uMjUsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDhyW1NWQzJdLmpwZ1wiLCAuNyk7XG5cbmxldCBidXNhcmFzSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMy40OSwgLTAuMjQsIC40MSwgLjQyNSwgLS4yNiwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwOXJbU1ZDMl0uanBnXCIsIC43KTtcblxubGV0IGxvd2VyYWJiZXlJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgxLjI5NSwgMC4zNzc2LCAuNDI1LCAuNDM1LCAtLjIzLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDA3cltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IGRhbWVJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgwLjk4LCAyLjMxNSwgLjQxLCAuNDI4LCAtMC4wOTUsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMTZyXzJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBjdXN0b21JbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSg1LjIxLCAtLjI0NSwgLjQyLCAuNDQsIDAuMDMsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMTByXzJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBtYW5vckltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDYuMzYsIDAuMDI1LCAuNDE1LCAuNDM1LCAwLjExLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDExcltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IHNhY2t2aWxsZUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDEuMjksIC0xLjI4LCAuNDYsIC40MiwgLTAuMjY1LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDA0cltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IGdyZWF0SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLjE5LCAtMC43MDUsIC40LCAuNDIsIC0uNTEsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDNyW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgbG93ZXJvcm1vbmRJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgwLjE2LCAwLjcxLCAuNDA1LCAuNDQsIC0wLjIwNSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwNnJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBzdGVwaGVuc0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDEuNzMsIDQuOTM1LCAuNDE1LCAuNDIsIDAuMjA1LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDIwUltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IG1hcnlzSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoLTIsIDAsIC40LCAuNCwgMCwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwNXJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCB0b3RhbEltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDQuNDg1LCAtMS44NzUsIDcuNDY1LCA3LjM1LCAwLCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDAxcltTVkMyXS5qcGdcIiwgLjQpO1xuXG5cbmZ1bmN0aW9uIHNob3dNYXAoZGl2TmFtZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGl2TmFtZSk7XG5cbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgY3R4LmNhbnZhcy53aWR0aCA9IGN0eC5jYW52YXMuY2xpZW50V2lkdGg7XG4gICAgY3R4LmNhbnZhcy5oZWlnaHQgPSBjdHguY2FudmFzLmNsaWVudEhlaWdodDtcblxuXHRsZXQgdmlld0NhbnZhcyA9IG5ldyBWaWV3Q2FudmFzKG5ldyBQb2ludDJEKC0yLC0zKSwgNiwgNCwgY3R4KTtcblx0Ly8gdmlld0NhbnZhcy5hZGRUaWxlTGF5ZXIoYmFzZUxheWVyKTtcblx0Ly8gdmlld0NhbnZhcy5hZGRUaWxlTGF5ZXIoc2VudGluZWxMYXllcik7XG5cdHZpZXdDYW52YXMuYWRkVGlsZUxheWVyKGxpZmZleVNlbnRpbmVsTGF5ZXIpO1xuXHR2aWV3Q2FudmFzLmFkZFRpbGVMYXllcihsaWZmZXlMYWJlbExheWVyKTtcblxuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQodG90YWxJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChkb2xpZXJJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudCh0cmluaXR5SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQocG9vbGJlZ0ltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGFiYmV5SW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQobG93ZXJhYmJleUltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGJ1c2FyYXNJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChkYW1lSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoY3VzdG9tSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQobWFub3JJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChzYWNrdmlsbGVJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChncmVhdEltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGxvd2Vyb3Jtb25kSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoc3RlcGhlbnNJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChtYXJ5c0ltYWdlKTtcblxuXHRsZXQgaW1hZ2VDb250cm9sbGVyID0gbmV3IEltYWdlQ29udHJvbGxlcih2aWV3Q2FudmFzLCBtYXJ5c0ltYWdlKTtcblxuXHR2aWV3Q2FudmFzLmRyYXcoKTtcblxuXHRjb25zdCBwbHVzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGx1c1wiKTtcblx0Y29uc3QgbWludXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtaW51c1wiKTtcblxuXHRsZXQgcGFuQ29udHJvbCA9IG5ldyBQYW5Db250cm9sbGVyKHZpZXdDYW52YXMsIGNhbnZhcyk7XG5cdGxldCBjYW52YXNDb250cm9sID0gbmV3IFpvb21Db250cm9sbGVyKHZpZXdDYW52YXMsIHBsdXMsIG1pbnVzKTtcblxuXHRjYW52YXNDb250cm9sLmFkZFpvb21MaXN0ZW5lcihwYW5Db250cm9sKTtcbn1cblxuZnVuY3Rpb24gc2hvdygpe1xuXHRzaG93TWFwKFwiY2FudmFzXCIsIFwiVHlwZVNjcmlwdFwiKTtcbn1cblxuaWYgKFxuICAgIGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIiB8fFxuICAgIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSBcImxvYWRpbmdcIiAmJiAhZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmRvU2Nyb2xsKVxuKSB7XG5cdHNob3coKTtcbn0gZWxzZSB7XG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIHNob3cpO1xufVxuXG4iLCJpbXBvcnQgeyBTdGF0aWNJbWFnZSB9IGZyb20gXCIuLi9ncmFwaGljcy9jYW52YXN0aWxlXCI7XG5pbXBvcnQgeyBWaWV3Q2FudmFzIH0gZnJvbSBcIi4uL2dyYXBoaWNzL3ZpZXdjYW52YXNcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbmV4cG9ydCBjbGFzcyBJbWFnZUNvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3Iodmlld0NhbnZhczogVmlld0NhbnZhcywgcmVhZG9ubHkgc3RhdGljSW1hZ2U6IFN0YXRpY0ltYWdlKSB7XG4gICAgXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLnByZXNzZWQodmlld0NhbnZhcywgZSAgYXMgS2V5Ym9hcmRFdmVudCkpO1xuICAgIH1cblxuICAgIHByZXNzZWQodmlld0NhbnZhczogVmlld0NhbnZhcywgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBcdGNvbnNvbGUubG9nKFwicHJlc3NlZFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQua2V5KTtcblxuICAgIFx0c3dpdGNoIChldmVudC5rZXkpIHtcbiAgICBcdFx0Y2FzZSBcImFcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnhJbmRleCA9IHRoaXMuc3RhdGljSW1hZ2UueEluZGV4IC0gMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJkXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS54SW5kZXggPSB0aGlzLnN0YXRpY0ltYWdlLnhJbmRleCArIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwid1wiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2UueUluZGV4ID0gdGhpcy5zdGF0aWNJbWFnZS55SW5kZXggLSAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInNcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnlJbmRleCA9IHRoaXMuc3RhdGljSW1hZ2UueUluZGV4ICsgMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJlXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5yb3RhdGlvbiA9IHRoaXMuc3RhdGljSW1hZ2Uucm90YXRpb24gLSAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInFcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnJvdGF0aW9uID0gdGhpcy5zdGF0aWNJbWFnZS5yb3RhdGlvbiArIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwieFwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1ggPSB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdYIC0gMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJYXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWCA9IHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1ggKyAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInpcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdZID0gdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWSAtIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiWlwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1kgPSB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdZICsgMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGRlZmF1bHQ6XG4gICAgXHRcdFx0Ly8gY29kZS4uLlxuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0fVxuICAgIFx0Y29uc29sZS5sb2coXCJpbWFnZSBhdDogXCIgKyAgdGhpcy5zdGF0aWNJbWFnZS54SW5kZXggKyBcIiwgXCIgKyB0aGlzLnN0YXRpY0ltYWdlLnlJbmRleCk7XG4gICAgXHRjb25zb2xlLmxvZyhcImltYWdlIHJvIHNjOiBcIiArICB0aGlzLnN0YXRpY0ltYWdlLnJvdGF0aW9uICsgXCIsIFwiICsgdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWCArIFwiLCBcIiArIHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1kpO1xuICAgIH07XG5cbn07IiwiaW1wb3J0IHsgVmlld0NhbnZhcyB9IGZyb20gXCIuLi9ncmFwaGljcy92aWV3Y2FudmFzXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5hYnN0cmFjdCBjbGFzcyBab29tTGlzdGVuZXIge1xuXHRhYnN0cmFjdCB6b29tKGJ5OiBudW1iZXIpO1xufVxuXG5leHBvcnQgY2xhc3MgWm9vbUNvbnRyb2xsZXIge1xuXG5cdHByaXZhdGUgbGlzdGVuZXJzOiBBcnJheTxab29tTGlzdGVuZXI+ID0gW107XG5cdHByaXZhdGUgem9vbSA9IDE7XG5cbiAgICBjb25zdHJ1Y3Rvcih2aWV3Q2FudmFzOiBWaWV3Q2FudmFzLCByZWFkb25seSB6b29tSW46IEhUTUxFbGVtZW50LCByZWFkb25seSB6b29tT3V0OiBIVE1MRWxlbWVudCkge1xuICAgIFx0em9vbUluLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZTpFdmVudCkgPT4gdGhpcy5jbGlja2VkKGUsIHZpZXdDYW52YXMsIC45NSkpO1xuICAgIFx0em9vbU91dC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGU6RXZlbnQpID0+IHRoaXMuY2xpY2tlZChlLCB2aWV3Q2FudmFzLCAxLjA1KSk7XG4gICAgXHR2aWV3Q2FudmFzLmN0eC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5jbGlja2VkKGUsIHZpZXdDYW52YXMsIC43NSkpO1xuICAgIH1cblxuICAgIGFkZFpvb21MaXN0ZW5lcih6b29tTGlzdGVuZXI6IFpvb21MaXN0ZW5lcil7XG4gICAgXHR0aGlzLmxpc3RlbmVycy5wdXNoKHpvb21MaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgY2xpY2tlZChldmVudDogRXZlbnQsIHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIGJ5OiBudW1iZXIpIHtcbiAgICBcdGNvbnNvbGUubG9nKFwiY2xpY2tlZFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQudHlwZSk7XG5cbiAgICBcdHZpZXdDYW52YXMuem9vbVZpZXcoYnkpO1xuICAgIFx0Y29uc29sZS5sb2coXCJsaXN0ZW5lcnMgXCIgKyB0aGlzLmxpc3RlbmVycy5sZW5ndGgpO1xuXG4gICAgXHR0aGlzLnpvb20gPSB0aGlzLnpvb20gKiBieTtcbiAgICBcdGZvciAobGV0IHZhbHVlIG9mIHRoaXMubGlzdGVuZXJzKXtcbiAgICBcdFx0dmFsdWUuem9vbSh0aGlzLnpvb20pO1xuICAgIFx0fVxuXG4gICAgXHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICB9O1xuXG59O1xuXG5leHBvcnQgY2xhc3MgUGFuQ29udHJvbGxlciBleHRlbmRzIFpvb21MaXN0ZW5lcntcblxuXHRwcml2YXRlIHhQcmV2aW91czogbnVtYmVyO1xuXHRwcml2YXRlIHlQcmV2aW91czogbnVtYmVyO1xuXHRwcml2YXRlIHJlY29yZDogYm9vbGVhbiA9IGZhbHNlO1xuXHRwcml2YXRlIGJhc2VNb3ZlOiBudW1iZXIgPSA1MTI7XG5cdHByaXZhdGUgbW92ZTogbnVtYmVyID0gNTEyO1xuXG4gICAgY29uc3RydWN0b3Iodmlld0NhbnZhczogVmlld0NhbnZhcywgcmVhZG9ubHkgZHJhZ0VsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgXHRzdXBlcigpO1xuICAgIFx0ZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdDYW52YXMpKTtcbiAgICBcdGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzKSk7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdDYW52YXMpKTtcbiAgICB9XG5cbiAgICB6b29tKGJ5OiBudW1iZXIpe1xuICAgIFx0Y29uc29sZS5sb2coXCJ6b29tIGJ5IFwiICsgYnkpO1xuICAgIFx0dGhpcy5tb3ZlID0gdGhpcy5iYXNlTW92ZSAvIGJ5O1xuICAgIH1cblxuICAgIGRyYWdnZWQoZXZlbnQ6IE1vdXNlRXZlbnQsIHZpZXdDYW52YXM6IFZpZXdDYW52YXMpIHtcblxuICAgIFx0c3dpdGNoKGV2ZW50LnR5cGUpe1xuICAgIFx0XHRjYXNlIFwibW91c2Vkb3duXCI6XG4gICAgXHRcdFx0dGhpcy5yZWNvcmQgPSB0cnVlO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwibW91c2V1cFwiOlxuICAgIFx0XHRcdHRoaXMucmVjb3JkID0gZmFsc2U7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGRlZmF1bHQ6XG4gICAgXHRcdFx0aWYgKHRoaXMucmVjb3JkKXtcblxuICAgIFx0XHRcdFx0bGV0IHhEZWx0YSA9IChldmVudC5jbGllbnRYIC0gdGhpcy54UHJldmlvdXMpIC8gdGhpcy5tb3ZlO1xuXHQgICAgXHRcdFx0bGV0IHlEZWx0YSA9IChldmVudC5jbGllbnRZIC0gdGhpcy55UHJldmlvdXMpIC8gdGhpcy5tb3ZlO1xuXG5cdCAgICBcdFx0XHRsZXQgbmV3VG9wTGVmdCA9IG5ldyBQb2ludDJEKHZpZXdDYW52YXMudG9wTGVmdC54IC0geERlbHRhLCBcblx0ICAgIFx0XHRcdFx0dmlld0NhbnZhcy50b3BMZWZ0LnkgLSB5RGVsdGEpO1xuXG5cdCAgICBcdFx0XHR2aWV3Q2FudmFzLm1vdmVWaWV3KG5ld1RvcExlZnQpO1xuXHQgICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0fVxuICAgIFx0XHRcdFxuICAgIFx0fVxuXG5cdFx0dGhpcy54UHJldmlvdXMgPSBldmVudC5jbGllbnRYO1xuXHRcdHRoaXMueVByZXZpb3VzID0gZXZlbnQuY2xpZW50WTtcblxuICAgIH07XG5cbn07XG5cbiJdfQ==
