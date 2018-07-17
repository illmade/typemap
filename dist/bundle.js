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
        console.log("xyScaling " + this.scalingX + ", " + this.scalingY);
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
    ImageTileLayer.prototype.getTiles = function (position, xMapUnits, yMapUnits) {
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
        console.log("tiles " + tiles);
        return tiles;
    };
    return ImageTileLayer;
}(tile_1.TileLayer));
exports.ImageTileLayer = ImageTileLayer;

},{"../geom/tile":2}],6:[function(require,module,exports){
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
var ViewCanvas = /** @class */ (function (_super) {
    __extends(ViewCanvas, _super);
    function ViewCanvas(topLeft, widthMapUnits, heightMapUnits, ctx) {
        var _this = _super.call(this, topLeft, widthMapUnits, heightMapUnits) || this;
        _this.ctx = ctx;
        _this.staticElements = [];
        _this.imageTileLayers = [];
        return _this;
    }
    ViewCanvas.prototype.addTileLayer = function (imageTileLayer) {
        this.imageTileLayers.push(imageTileLayer);
    };
    ViewCanvas.prototype.addStaticElement = function (staticImage) {
        this.staticElements.push(staticImage);
    };
    ViewCanvas.prototype.scale = function (pixelsPerUnit, dimension, reverse) {
        var viewScalingX = this.ctx.canvas.clientWidth / dimension.x / pixelsPerUnit;
        var viewScalingY = this.ctx.canvas.clientHeight / dimension.y / pixelsPerUnit;
        console.log("view scaling " + viewScalingX, ", " + viewScalingY);
        console.log("dimensions: " + dimension);
        if (reverse) {
            this.ctx.scale(1 / viewScalingX, 1 / viewScalingY);
        }
        else {
            this.ctx.scale(viewScalingX, viewScalingY);
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
                console.log("layer scaling is " + tileScalingX + ", " + tileScalingY);
                var tiles = value.getTiles(this.topLeft, dimension.x, dimension.y);
                for (var _b = 0, tiles_1 = tiles; _b < tiles_1.length; _b++) {
                    var tile = tiles_1[_b];
                    var tileX = (tile.xIndex - this.topLeft.x) * tileScalingX;
                    var tileY = (tile.yIndex - this.topLeft.y) * tileScalingY;
                    tile.draw(this.ctx, tileX, tileY);
                }
                this.scale(256, dimension, true);
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
    };
    return ViewCanvas;
}(viewport_1.Viewport));
exports.ViewCanvas = ViewCanvas;

},{"../geom/viewport":3}],7:[function(require,module,exports){
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
var totalImage = new canvastile_1.StaticImage(4.485, -1.875, 7.465, 7.35, 0, "images/maps_145_b_4_(2)_f001r[SVC2].jpg", .7);
function showMap(divName, name) {
    var canvas = document.getElementById(divName);
    var ctx = canvas.getContext('2d');
    ctx.canvas.width = ctx.canvas.clientWidth;
    ctx.canvas.height = ctx.canvas.clientHeight;
    var viewCanvas = new viewcanvas_1.ViewCanvas(new point2d_1.Point2D(-1, -1), 12, 8, ctx);
    // viewCanvas.addTileLayer(baseLayer);
    // viewCanvas.addTileLayer(sentinelLayer);
    viewCanvas.addTileLayer(liffeySentinelLayer);
    viewCanvas.addTileLayer(liffeyLabelLayer);
    viewCanvas.addStaticElement(totalImage);
    viewCanvas.addStaticElement(dolierImage);
    viewCanvas.addStaticElement(trinityImage);
    viewCanvas.addStaticElement(poolbegImage);
    viewCanvas.addStaticElement(abbeyImage);
    viewCanvas.addStaticElement(busarasImage);
    var imageController = new imageController_1.ImageController(viewCanvas, busarasImage);
    viewCanvas.draw();
    var plus = document.getElementById("plus");
    var minus = document.getElementById("minus");
    var panControl = new mapController_1.PanController(viewCanvas, canvas);
    var canvasControl = new mapController_1.ZoomController(viewCanvas, plus, minus);
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

},{"./geom/point2d":1,"./geom/world2d":4,"./graphics/canvastile":5,"./graphics/viewcanvas":6,"./ui/imageController":8,"./ui/mapController":9}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var point2d_1 = require("../geom/point2d");
var ZoomController = /** @class */ (function () {
    function ZoomController(viewCanvas, zoomIn, zoomOut) {
        var _this = this;
        this.zoomIn = zoomIn;
        this.zoomOut = zoomOut;
        zoomIn.addEventListener("click", function (e) { return _this.clicked(e, viewCanvas, .95); });
        zoomOut.addEventListener("click", function (e) { return _this.clicked(e, viewCanvas, 1.05); });
        viewCanvas.ctx.canvas.addEventListener("dblclick", function (e) {
            return _this.clicked(e, viewCanvas, .75);
        });
    }
    ZoomController.prototype.clicked = function (event, viewCanvas, zoom) {
        console.log("clicked" + event.target + ", " + event.type);
        viewCanvas.zoomView(zoom);
        viewCanvas.draw();
    };
    ;
    return ZoomController;
}());
exports.ZoomController = ZoomController;
;
var PanController = /** @class */ (function () {
    function PanController(viewCanvas, dragElement) {
        var _this = this;
        this.dragElement = dragElement;
        this.record = false;
        dragElement.addEventListener("mousemove", function (e) {
            return _this.dragged(e, viewCanvas);
        });
        dragElement.addEventListener("mousedown", function (e) {
            return _this.dragged(e, viewCanvas);
        });
        dragElement.addEventListener("mouseup", function (e) {
            return _this.dragged(e, viewCanvas);
        });
    }
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
                    var xDelta = (event.clientX - this.xPrevious) / 512;
                    var yDelta = (event.clientY - this.yPrevious) / 512;
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
}());
exports.PanController = PanController;
;

},{"../geom/point2d":1}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2dlb20vdGlsZS50cyIsInNyYy9nZW9tL3ZpZXdwb3J0LnRzIiwic3JjL2dlb20vd29ybGQyZC50cyIsInNyYy9ncmFwaGljcy9jYW52YXN0aWxlLnRzIiwic3JjL2dyYXBoaWNzL3ZpZXdjYW52YXMudHMiLCJzcmMvc2ltcGxlV29ybGQudHMiLCJzcmMvdWkvaW1hZ2VDb250cm9sbGVyLnRzIiwic3JjL3VpL21hcENvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0NBO0lBT0ksaUJBQVksQ0FBUyxFQUFFLENBQVM7UUFDNUIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBRUUsMEJBQVEsR0FBUjtRQUNJLE9BQU8sVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQ3JELENBQUM7SUFiZSxZQUFJLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3pCLFdBQUcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFjNUMsY0FBQztDQWhCRCxBQWdCQyxJQUFBO0FBaEJZLDBCQUFPOzs7OztBQ0VwQjtJQUVDLG1CQUFtQixhQUFxQixFQUFTLGNBQXNCO1FBQXBELGtCQUFhLEdBQWIsYUFBYSxDQUFRO1FBQVMsbUJBQWMsR0FBZCxjQUFjLENBQVE7SUFBRSxDQUFDO0lBTTNFLGdCQUFDO0FBQUQsQ0FSQSxBQVFDLElBQUE7QUFScUIsOEJBQVM7QUFVL0I7SUFJQyxjQUFZLE1BQWMsRUFBRSxNQUFjO0lBQUUsQ0FBQztJQUZ0QyxjQUFTLEdBQVMsSUFBSSxJQUFJLENB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LEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV6RCxRQUFRLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDbEIsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztnQkFDMUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztnQkFDMUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztnQkFDMUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztnQkFDMUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1AsS0FBSyxHQUFHO2dCQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDOUQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1A7Z0JBQ0MsVUFBVTtnQkFDVixNQUFNO1NBQ1A7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksR0FBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0RixPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsR0FBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakksQ0FBQztJQUFBLENBQUM7SUFFTixzQkFBQztBQUFELENBM0RBLEFBMkRDLElBQUE7QUEzRFksMENBQWU7QUEy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T0FBTyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztvQkFFaEMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDaEMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2lCQUNsQjtTQUVGO1FBRUosSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQy9CLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztJQUU3QixDQUFDO0lBQUEsQ0FBQztJQUVOLG9CQUFDO0FBQUQsQ0EzQ0EsQUEyQ0MsSUFBQTtBQTNDWSxzQ0FBYTtBQTJDekIsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlxuZXhwb3J0IGNsYXNzIFBvaW50MkQge1xuICAgIHN0YXRpYyByZWFkb25seSB6ZXJvID0gbmV3IFBvaW50MkQoMCwgMCk7XG4gICAgc3RhdGljIHJlYWRvbmx5IG9uZSA9IG5ldyBQb2ludDJEKDEsIDEpO1xuXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xuICAgIHJlYWRvbmx5IHk6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG5cdH1cblxuICAgIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcIlBvaW50MkQoXCIgKyB0aGlzLnggKyBcIiwgXCIgKyB0aGlzLnkgKyBcIilcIjtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBVbml0cyB9IGZyb20gXCIuL3dvcmxkMmRcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi9wb2ludDJkXCI7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBUaWxlTGF5ZXIge1xuXHRcblx0Y29uc3RydWN0b3IocHVibGljIHdpZHRoTWFwVW5pdHM6IG51bWJlciwgcHVibGljIGhlaWdodE1hcFVuaXRzOiBudW1iZXIpe31cblxuXHRhYnN0cmFjdCBnZXRUaWxlKHhJbmRleDogbnVtYmVyLCB5SW5kZXg6IG51bWJlcik6IFRpbGU7XG5cblx0YWJzdHJhY3QgZ2V0VGlsZXMocG9zaXRpb246IFBvaW50MkQsIHhVbml0czogbnVtYmVyLCB5VW5pdHM6IG51bWJlcik6IEFycmF5PFRpbGU+O1xuXG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlIHtcblx0XG5cdHN0YXRpYyBlbXB0eVRpbGU6IFRpbGUgPSBuZXcgVGlsZSgtMSwtMSk7XG5cblx0Y29uc3RydWN0b3IoeEluZGV4OiBudW1iZXIsIHlJbmRleDogbnVtYmVyKXt9XG5cbn0iLCJpbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4vcG9pbnQyZFwiO1xuaW1wb3J0IHsgVmVjdG9yMkQgfSBmcm9tIFwiLi92ZWN0b3IyZFwiO1xuaW1wb3J0IHsgV29ybGQyRCwgVW5pdHMgfSBmcm9tIFwiLi93b3JsZDJkXCI7XG5cbmV4cG9ydCBjbGFzcyBWaWV3cG9ydCB7XG5cdFxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgdG9wTGVmdDogUG9pbnQyRCwgXG5cdFx0cHJpdmF0ZSB3aWR0aE1hcFVuaXRzOiBudW1iZXIsIHByaXZhdGUgaGVpZ2h0TWFwVW5pdHM6IG51bWJlcil7XG5cblx0XHRjb25zb2xlLmxvZyhcIncgaFwiICsgd2lkdGhNYXBVbml0cyArIFwiLCBcIiArIGhlaWdodE1hcFVuaXRzKTtcblx0fVxuXG5cdG1vdmVWaWV3KHRvcExlZnQ6IFBvaW50MkQpe1xuXHRcdHRoaXMudG9wTGVmdCA9IHRvcExlZnQ7XG5cdH1cblxuXHR6b29tVmlldyh6b29tOiBudW1iZXIpe1xuXHRcdHRoaXMud2lkdGhNYXBVbml0cyA9IHRoaXMud2lkdGhNYXBVbml0cyAqIHpvb207XG5cdFx0dGhpcy5oZWlnaHRNYXBVbml0cyA9IHRoaXMuaGVpZ2h0TWFwVW5pdHMgKiB6b29tO1xuXHR9XG5cblx0Z2V0RGltZW5zaW9ucygpe1xuXHRcdHJldHVybiBuZXcgUG9pbnQyRCh0aGlzLndpZHRoTWFwVW5pdHMsIHRoaXMuaGVpZ2h0TWFwVW5pdHMpO1xuXHR9XG5cbn0iLCJpbXBvcnQgeyBUaWxlTGF5ZXIgfSBmcm9tIFwiLi90aWxlXCI7XG5cbmV4cG9ydCBjbGFzcyBVbml0cyB7XG5cblx0c3RhdGljIHJlYWRvbmx5IFdlYldVID0gbmV3IFVuaXRzKFwiTWVyY2F0b3IgV2ViIFdvcmxkIFVuaXRzXCIpO1xuXG5cdGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyl7fVxuXG59XG4vKipcbiAgQSB3b3JsZCBpcyB0aGUgYmFzZSB0aGF0IGFsbCBvdGhlciBlbGVtZW50cyBvcmllbnRhdGUgZnJvbSBcbioqL1xuZXhwb3J0IGNsYXNzIFdvcmxkMkQge1xuXG5cdHByaXZhdGUgdGlsZUxheWVyczogQXJyYXk8VGlsZUxheWVyPiA9IFtdO1xuXHRcblx0Y29uc3RydWN0b3IoKXt9XG5cbiAgICBhZGRUaWxlTGF5ZXIodGlsZUxheWVyOiBUaWxlTGF5ZXIpOiBudW1iZXIge1xuICAgIFx0cmV0dXJuIHRoaXMudGlsZUxheWVycy5wdXNoKHRpbGVMYXllcik7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgVGlsZSwgVGlsZUxheWVyIH0gZnJvbSBcIi4uL2dlb20vdGlsZVwiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENhbnZhc1RpbGUgZXh0ZW5kcyBUaWxlIHtcblxuXHRhYnN0cmFjdCBkcmF3KGNhbnZhczogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBzY2FsaW5nWDogbnVtYmVyLCBzY2FsaW5nWTogbnVtYmVyLCBcblx0XHRjYW52YXNYOiBudW1iZXIsIGNhbnZhc1k6IG51bWJlcik6IHZvaWQ7XG5cbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlU3RydWN0IHtcblxuXHRwcmVmaXg6IHN0cmluZyA9IFwiXCI7XG5cdHN1ZmZpeDogc3RyaW5nID0gXCJcIjtcblx0dGlsZURpcjogc3RyaW5nID0gXCJpbWFnZXMvXCI7XG5cdHZpc2libGU6IGJvb2xlYW4gPSB0cnVlO1xuXHR0aWxlV2lkdGhQeDogbnVtYmVyID0gMjU2O1xuXHR0aWxlSGVpZ2h0UHg6IG51bWJlciA9IDI1Njtcblx0d2lkdGhNYXBVbml0czogbnVtYmVyID0gMTtcblx0aGVpZ2h0TWFwVW5pdHM6IG51bWJlciA9IDE7IFxuXG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZVRpbGUgZXh0ZW5kcyBDYW52YXNUaWxlIHtcblxuXHRwcml2YXRlIGltZzogSFRNTEltYWdlRWxlbWVudDtcblxuXHRjb25zdHJ1Y3RvcihyZWFkb25seSB4SW5kZXg6IG51bWJlciwgcmVhZG9ubHkgeUluZGV4OiBudW1iZXIsIGltYWdlU3JjOiBzdHJpbmcpIHtcblx0XHRzdXBlcih4SW5kZXgsIHlJbmRleCk7XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0fTtcblxuXHRwcml2YXRlIGRyYXdJbWFnZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgY2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpe1xuXHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIGNhbnZhc1gsIGNhbnZhc1kpO1xuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgY2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpe1xuXHRcdGlmICh0aGlzLmltZy5jb21wbGV0ZSkge1xuXHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCBjYW52YXNYLCBjYW52YXNZKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR0aGlzLmltZy5vbmxvYWQgPSAoZXZlbnQpID0+IHtcblx0XHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCBjYW52YXNYLCBjYW52YXNZKTtcblx0XHRcdH07XG5cdFx0fVxuXHR9O1xuXG59XG5cbmV4cG9ydCBjbGFzcyBTdGF0aWNJbWFnZSB7XG5cblx0cHJpdmF0ZSBpbWc6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cblx0Y29uc3RydWN0b3IocHVibGljIHhJbmRleDogbnVtYmVyLCBwdWJsaWMgeUluZGV4OiBudW1iZXIsIFxuXHRcdHB1YmxpYyBzY2FsaW5nWDogbnVtYmVyLCBwdWJsaWMgc2NhbGluZ1k6IG51bWJlciwgcHVibGljIHJvdGF0aW9uOiBudW1iZXIsIFxuXHRcdGltYWdlU3JjOiBzdHJpbmcsIHJlYWRvbmx5IGFscGhhOiBudW1iZXIpIHtcblx0XHRcblx0XHR0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuXHRcdHRoaXMuaW1nLnNyYyA9IGltYWdlU3JjO1xuXHR9O1xuXG5cdHByaXZhdGUgZHJhd0ltYWdlKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBjYW52YXNYOiBudW1iZXIsIGNhbnZhc1k6IG51bWJlcil7XG5cblx0XHQvL3NjYWxpbmdYID0gc2NhbGluZ1ggKiB0aGlzLnNjYWxpbmc7XG5cdFx0Ly9zY2FsaW5nWSA9IHNjYWxpbmdZICogdGhpcy5zY2FsaW5nO1xuXG5cdFx0Ly8gbGV0IGNvc1ggPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uKTtcblx0XHQvLyBsZXQgc2luWCA9IE1hdGguc2luKHRoaXMucm90YXRpb24pO1xuXG5cdFx0Y3R4LnRyYW5zbGF0ZShjYW52YXNYLCBjYW52YXNZKTtcblx0XHRjdHgucm90YXRlKHRoaXMucm90YXRpb24pO1xuXHRcdGN0eC5zY2FsZSh0aGlzLnNjYWxpbmdYLCB0aGlzLnNjYWxpbmdZKTtcblx0XHRjb25zb2xlLmxvZyhcInh5U2NhbGluZyBcIiArIHRoaXMuc2NhbGluZ1ggKyBcIiwgXCIgKyB0aGlzLnNjYWxpbmdZKTtcblx0XHRjdHguZ2xvYmFsQWxwaGEgPSB0aGlzLmFscGhhO1xuXG5cdFx0Ly8gY3R4LnRyYW5zZm9ybShjb3NYICogc2NhbGluZ1gsIHNpblggKiBzY2FsaW5nWSwgLXNpblggKiBzY2FsaW5nWCwgY29zWCAqIHNjYWxpbmdZLCBcblx0XHQvLyBcdGNhbnZhc1ggLyB0aGlzLnNjYWxpbmcsIGNhbnZhc1kgLyB0aGlzLnNjYWxpbmcpO1xuXG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZywgLSh0aGlzLmltZy53aWR0aC8yKSwgLSh0aGlzLmltZy5oZWlnaHQvMikpO1xuXHRcdFxuXHRcdGN0eC5zY2FsZSgxL3RoaXMuc2NhbGluZ1gsIDEvdGhpcy5zY2FsaW5nWSk7XG5cdFx0Y3R4LnJvdGF0ZSgtdGhpcy5yb3RhdGlvbik7XG5cdFx0Y3R4LnRyYW5zbGF0ZSgtY2FudmFzWCwgLWNhbnZhc1kpO1xuXHRcdGN0eC5nbG9iYWxBbHBoYSA9IDE7XG5cdH1cblxuXHRkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBjYW52YXNYOiBudW1iZXIsIGNhbnZhc1k6IG51bWJlcil7XG5cdFx0aWYgKHRoaXMuaW1nLmNvbXBsZXRlKSB7XG5cdFx0XHR0aGlzLmRyYXdJbWFnZShjdHgsIGNhbnZhc1gsIGNhbnZhc1kpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuaW1nLm9ubG9hZCA9IChldmVudCkgPT4ge1xuXHRcdFx0XHR0aGlzLmRyYXdJbWFnZShjdHgsIGNhbnZhc1gsIGNhbnZhc1kpO1xuXHRcdFx0fTtcblx0XHR9XG5cdH07XG5cbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlVGlsZUxheWVyIGV4dGVuZHMgVGlsZUxheWVyIHtcblxuXHRyZWFkb25seSBpbWFnZVByb3BlcnRpZXM6IEltYWdlU3RydWN0O1xuXG5cdGNvbnN0cnVjdG9yKGltYWdlUHJvcGVydGllczogSW1hZ2VTdHJ1Y3QpIHtcblx0XHRzdXBlcihpbWFnZVByb3BlcnRpZXMud2lkdGhNYXBVbml0cywgaW1hZ2VQcm9wZXJ0aWVzLmhlaWdodE1hcFVuaXRzKTtcblx0XHR0aGlzLmltYWdlUHJvcGVydGllcyA9IGltYWdlUHJvcGVydGllcztcblx0fVxuXG5cdC8qKlxuXHQgIGxlYXZlIGNhY2hpbmcgdXAgdG8gdGhlIGJyb3dzZXJcblx0KiovXG5cdGdldFRpbGUoeFVuaXRzOiBudW1iZXIsIHlVbml0czogbnVtYmVyKTogVGlsZSB7XG5cdFx0bGV0IGltYWdlU3JjID0gdGhpcy5pbWFnZVByb3BlcnRpZXMudGlsZURpciArIFxuXHRcdFx0dGhpcy5pbWFnZVByb3BlcnRpZXMucHJlZml4ICsgeFVuaXRzICsgXCJfXCIgKyB5VW5pdHMgKyB0aGlzLmltYWdlUHJvcGVydGllcy5zdWZmaXg7XG5cdFx0cmV0dXJuIG5ldyBJbWFnZVRpbGUoeFVuaXRzLCB5VW5pdHMsIGltYWdlU3JjKTtcblx0fVxuXG5cdGdldFRpbGVzKHBvc2l0aW9uOiBQb2ludDJELCB4TWFwVW5pdHM6IG51bWJlciwgeU1hcFVuaXRzOiBudW1iZXIpOiBBcnJheTxUaWxlPiB7XG5cblx0XHRsZXQgZmlyc3RYID0gTWF0aC5mbG9vcihwb3NpdGlvbi54IC8gdGhpcy53aWR0aE1hcFVuaXRzKTtcblx0XHRsZXQgbGFzdFggPSBNYXRoLmNlaWwoKHBvc2l0aW9uLnggKyB4TWFwVW5pdHMpLyB0aGlzLndpZHRoTWFwVW5pdHMpO1xuXG5cdFx0bGV0IGZpcnN0WSA9IE1hdGguZmxvb3IocG9zaXRpb24ueSAvIHRoaXMuaGVpZ2h0TWFwVW5pdHMpO1xuXHRcdGxldCBsYXN0WSA9IE1hdGguY2VpbCgocG9zaXRpb24ueSArIHlNYXBVbml0cykvIHRoaXMuaGVpZ2h0TWFwVW5pdHMpO1xuXG5cdFx0bGV0IHRpbGVzID0gbmV3IEFycmF5PFRpbGU+KCk7XG5cblx0XHRmb3IgKHZhciB4PWZpcnN0WDsgeDxsYXN0WDsgeCsrKXtcblx0XHRcdGZvciAodmFyIHk9Zmlyc3RZOyB5PGxhc3RZOyB5Kyspe1xuXHRcdFx0XHR0aWxlcy5wdXNoKHRoaXMuZ2V0VGlsZSh4LCB5KSlcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zb2xlLmxvZyhcInRpbGVzIFwiICsgdGlsZXMpO1xuXHRcdHJldHVybiB0aWxlcztcblx0fVxufVxuIiwiaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tIFwiLi4vZ2VvbS92aWV3cG9ydFwiO1xuaW1wb3J0IHsgV29ybGQyRCB9IGZyb20gXCIuLi9nZW9tL3dvcmxkMmRcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBTdGF0aWNJbWFnZSwgSW1hZ2VUaWxlLCBJbWFnZVRpbGVMYXllciB9IGZyb20gXCIuL2NhbnZhc3RpbGVcIjtcblxuZXhwb3J0IGNsYXNzIFZpZXdDYW52YXMgZXh0ZW5kcyBWaWV3cG9ydCB7XG5cbiAgICBwcml2YXRlIHN0YXRpY0VsZW1lbnRzOiBBcnJheTxTdGF0aWNJbWFnZT4gPSBbXTtcbiAgICBwcml2YXRlIGltYWdlVGlsZUxheWVycyA9IFtdO1xuXG4gICAgY29uc3RydWN0b3IodG9wTGVmdDogUG9pbnQyRCwgXG4gICAgXHR3aWR0aE1hcFVuaXRzOiBudW1iZXIsIGhlaWdodE1hcFVuaXRzOiBudW1iZXIsIFxuICAgIFx0cmVhZG9ubHkgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpIHtcblxuICAgIFx0c3VwZXIodG9wTGVmdCwgd2lkdGhNYXBVbml0cywgaGVpZ2h0TWFwVW5pdHMpO1xuICAgIH1cblxuICAgIGFkZFRpbGVMYXllcihpbWFnZVRpbGVMYXllcjogSW1hZ2VUaWxlTGF5ZXIpOiB2b2lkIHtcbiAgICBcdHRoaXMuaW1hZ2VUaWxlTGF5ZXJzLnB1c2goaW1hZ2VUaWxlTGF5ZXIpO1xuICAgIH1cblxuICAgIGFkZFN0YXRpY0VsZW1lbnQoc3RhdGljSW1hZ2U6IFN0YXRpY0ltYWdlKTogdm9pZCB7XG4gICAgXHR0aGlzLnN0YXRpY0VsZW1lbnRzLnB1c2goc3RhdGljSW1hZ2UpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2NhbGUocGl4ZWxzUGVyVW5pdDogbnVtYmVyLCBkaW1lbnNpb246IFBvaW50MkQsIHJldmVyc2U6IGJvb2xlYW4pOiB2b2lkIHtcblxuICAgIFx0bGV0IHZpZXdTY2FsaW5nWCA9IHRoaXMuY3R4LmNhbnZhcy5jbGllbnRXaWR0aCAvIGRpbWVuc2lvbi54IC8gcGl4ZWxzUGVyVW5pdDtcbiAgICBcdGxldCB2aWV3U2NhbGluZ1kgPSB0aGlzLmN0eC5jYW52YXMuY2xpZW50SGVpZ2h0IC8gZGltZW5zaW9uLnkgLyBwaXhlbHNQZXJVbml0O1xuXG4gICAgXHRjb25zb2xlLmxvZyhcInZpZXcgc2NhbGluZyBcIiArICB2aWV3U2NhbGluZ1gsIFwiLCBcIiArIHZpZXdTY2FsaW5nWSk7XG4gICAgXHRjb25zb2xlLmxvZyhcImRpbWVuc2lvbnM6IFwiICsgZGltZW5zaW9uKTtcblxuICAgIFx0aWYgKHJldmVyc2Upe1xuICAgIFx0XHR0aGlzLmN0eC5zY2FsZSgxL3ZpZXdTY2FsaW5nWCwgMS92aWV3U2NhbGluZ1kpO1xuICAgIFx0fSBlbHNlIHtcbiAgICBcdFx0dGhpcy5jdHguc2NhbGUodmlld1NjYWxpbmdYLCB2aWV3U2NhbGluZ1kpO1xuICAgIFx0fVxuICAgIFx0XG4gICAgfVxuXG4gICAgZHJhdygpOiB2b2lkIHtcbiAgICBcdGxldCBkaW1lbnNpb24gPSB0aGlzLmdldERpbWVuc2lvbnMoKTtcblxuICAgIFx0bGV0IHdpZHRoID0gdGhpcy5jdHguY2FudmFzLmNsaWVudFdpZHRoO1xuICAgIFx0bGV0IGhlaWdodCA9IHRoaXMuY3R4LmNhbnZhcy5jbGllbnRIZWlnaHQ7XG5cbiAgICBcdHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgIFx0Zm9yIChsZXQgdmFsdWUgb2YgdGhpcy5pbWFnZVRpbGVMYXllcnMpe1xuICAgIFx0XHRpZiAodmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnZpc2libGUpIHtcblxuICAgIFx0XHRcdHRoaXMuc2NhbGUodmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVXaWR0aFB4LCBkaW1lbnNpb24sIGZhbHNlKTtcblxuICAgIFx0XHRcdGxldCB0aWxlU2NhbGluZ1ggPSB2YWx1ZS5pbWFnZVByb3BlcnRpZXMudGlsZVdpZHRoUHggLyB2YWx1ZS53aWR0aE1hcFVuaXRzO1xuICAgIFx0XHRcdGxldCB0aWxlU2NhbGluZ1kgPSB2YWx1ZS5pbWFnZVByb3BlcnRpZXMudGlsZUhlaWdodFB4IC8gdmFsdWUuaGVpZ2h0TWFwVW5pdHM7XG5cbiAgICBcdFx0XHRjb25zb2xlLmxvZyhcImxheWVyIHNjYWxpbmcgaXMgXCIgKyB0aWxlU2NhbGluZ1ggKyBcIiwgXCIgKyB0aWxlU2NhbGluZ1kpO1xuXG4gICAgXHRcdFx0bGV0IHRpbGVzOiBBcnJheTxJbWFnZVRpbGU+ID0gdmFsdWUuZ2V0VGlsZXModGhpcy50b3BMZWZ0LCBcbiAgICBcdFx0XHRcdGRpbWVuc2lvbi54LCBkaW1lbnNpb24ueSk7XG5cbiAgICBcdFx0XHRmb3IgKGxldCB0aWxlIG9mIHRpbGVzKXtcbiAgICBcdFx0XHRcdHZhciB0aWxlWCA9ICh0aWxlLnhJbmRleCAtIHRoaXMudG9wTGVmdC54KSAqIHRpbGVTY2FsaW5nWDtcbiAgICBcdFx0XHRcdHZhciB0aWxlWSA9ICh0aWxlLnlJbmRleCAtIHRoaXMudG9wTGVmdC55KSAqIHRpbGVTY2FsaW5nWTtcblxuICAgIFx0XHRcdFx0dGlsZS5kcmF3KHRoaXMuY3R4LCB0aWxlWCwgdGlsZVkpO1xuICAgIFx0XHRcdH1cblxuICAgIFx0XHRcdHRoaXMuc2NhbGUoMjU2LCBkaW1lbnNpb24sIHRydWUpO1xuICAgIFx0XHR9XG4gICAgXHR9XG5cbiAgICBcdGZvciAobGV0IHZhbHVlIG9mIHRoaXMuc3RhdGljRWxlbWVudHMpe1xuICAgIFx0XHQvLzI1NiBweCBpcyAxIG1hcCB1bml0XG5cdFx0XHRsZXQgdGlsZVNjYWxpbmdYID0gMjU2O1xuXHRcdFx0bGV0IHRpbGVTY2FsaW5nWSA9IDI1NjtcblxuICAgIFx0XHR0aGlzLnNjYWxlKDI1NiwgZGltZW5zaW9uLCBmYWxzZSk7XG5cbiAgICBcdFx0bGV0IGltYWdlWCA9ICh2YWx1ZS54SW5kZXggLSB0aGlzLnRvcExlZnQueCkgKiB0aWxlU2NhbGluZ1g7XG4gICAgXHRcdGxldCBpbWFnZVkgPSAodmFsdWUueUluZGV4IC0gdGhpcy50b3BMZWZ0LnkpICogdGlsZVNjYWxpbmdZO1xuXG4gICAgXHRcdHZhbHVlLmRyYXcodGhpcy5jdHgsIGltYWdlWCwgaW1hZ2VZKTtcbiAgICBcdFx0dGhpcy5zY2FsZSgyNTYsIGRpbWVuc2lvbiwgdHJ1ZSk7XG5cbiAgICBcdH1cblxuICAgIH1cblxufSIsImltcG9ydCB7IFdvcmxkMkQgfSBmcm9tIFwiLi9nZW9tL3dvcmxkMmRcIjtcbmltcG9ydCB7IFZpZXdwb3J0IH0gZnJvbSBcIi4vZ2VvbS92aWV3cG9ydFwiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuL2dlb20vcG9pbnQyZFwiO1xuaW1wb3J0IHsgU3RhdGljSW1hZ2UsIEltYWdlVGlsZUxheWVyLCBJbWFnZVN0cnVjdCB9IGZyb20gXCIuL2dyYXBoaWNzL2NhbnZhc3RpbGVcIjtcbmltcG9ydCB7IFZpZXdDYW52YXMgfSBmcm9tIFwiLi9ncmFwaGljcy92aWV3Y2FudmFzXCI7XG5pbXBvcnQgeyBab29tQ29udHJvbGxlciwgUGFuQ29udHJvbGxlciB9IGZyb20gXCIuL3VpL21hcENvbnRyb2xsZXJcIjtcbmltcG9ydCB7IEltYWdlQ29udHJvbGxlciB9IGZyb20gXCIuL3VpL2ltYWdlQ29udHJvbGxlclwiO1xuXG5sZXQgc2ltcGxlV29ybGQgPSBuZXcgV29ybGQyRCgpO1xuXG4vLyBsZXQgbGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG4vLyBsYXllclByb3BlcnRpZXMucHJlZml4ID0gXCJcIjtcbi8vIGxheWVyUHJvcGVydGllcy5zdWZmaXggPSBcIi5wbmdcIjtcblxuLy8gbGV0IHJvYWRMYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbi8vIHJvYWRMYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCJiLnBuZ1wiO1xuXG4vLyBsZXQgc2VudGluZWxMYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbi8vIHNlbnRpbmVsTGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwibC5qcGVnXCI7XG5cbi8vIGxldCBzZW50aW5lbFRlcnJhaW5MYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbi8vIHNlbnRpbmVsVGVycmFpbkxheWVyUHJvcGVydGllcy5zdWZmaXggPSBcInQuanBlZ1wiO1xuXG5sZXQgbGlmZmV5TGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG5saWZmZXlMYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCJsaWZmZXkuanBlZ1wiO1xubGlmZmV5TGF5ZXJQcm9wZXJ0aWVzLnRpbGVEaXIgPSBcImltYWdlcy9saWZmZXkvXCI7XG5cbmxldCBsaWZmZXlMYWJlbExheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xubGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCJsaWZmZXkucG5nXCI7XG5saWZmZXlMYWJlbExheWVyUHJvcGVydGllcy50aWxlRGlyID0gXCJpbWFnZXMvbGlmZmV5L1wiO1xuXG4vLyBsZXQgYmFzZUxheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKGxheWVyUHJvcGVydGllcyk7XG4vLyBsZXQgc2VudGluZWxMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihzZW50aW5lbExheWVyUHJvcGVydGllcyk7XG4vLyBsZXQgcm9hZExheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKHJvYWRMYXllclByb3BlcnRpZXMpO1xuLy8gbGV0IHRlcnJhaW5MYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihzZW50aW5lbFRlcnJhaW5MYXllclByb3BlcnRpZXMpO1xuXG5sZXQgbGlmZmV5U2VudGluZWxMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcihsaWZmZXlMYXllclByb3BlcnRpZXMpO1xubGV0IGxpZmZleUxhYmVsTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIobGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMpO1xuXG5sZXQgZG9saWVySW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMi4yNCwgMS44NywgLjQzLCAuNDMsIC0wLjA2LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDE3UltTVkMyXS5qcGdcIiwgLjcpO1xuXG5sZXQgdHJpbml0eUltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDEuOTksIDMuNTksIC40MywgLjQzLCAwLjE1LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDE5UltTVkMyXS5qcGdcIiwgLjcpO1xuXG5sZXQgcG9vbGJlZ0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDMuMzQsIDEuNjI1LCAuNDA1LCAuNDMsIDAuMDUsXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAxOFJbU1ZDMl0uanBnXCIsIC43KTtcblxubGV0IGFiYmV5SW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMi4zOSwgMC4wMzUsIC40MTUsIC40MzUsIC0uMjUsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDhyW1NWQzJdLmpwZ1wiLCAuNyk7XG5cbmxldCBidXNhcmFzSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMy40OSwgLTAuMjQsIC40MSwgLjQyNSwgLS4yNiwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAwOXJbU1ZDMl0uanBnXCIsIC43KTtcblxubGV0IHRvdGFsSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoNC40ODUsIC0xLjg3NSwgNy40NjUsIDcuMzUsIDAsIFxuXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMDFyW1NWQzJdLmpwZ1wiLCAuNyk7XG5cbmZ1bmN0aW9uIHNob3dNYXAoZGl2TmFtZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGl2TmFtZSk7XG5cbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgY3R4LmNhbnZhcy53aWR0aCA9IGN0eC5jYW52YXMuY2xpZW50V2lkdGg7XG4gICAgY3R4LmNhbnZhcy5oZWlnaHQgPSBjdHguY2FudmFzLmNsaWVudEhlaWdodDtcblxuXHRsZXQgdmlld0NhbnZhcyA9IG5ldyBWaWV3Q2FudmFzKG5ldyBQb2ludDJEKC0xLCAtMSksIDEyLCA4LCBjdHgpO1xuXHQvLyB2aWV3Q2FudmFzLmFkZFRpbGVMYXllcihiYXNlTGF5ZXIpO1xuXHQvLyB2aWV3Q2FudmFzLmFkZFRpbGVMYXllcihzZW50aW5lbExheWVyKTtcblx0dmlld0NhbnZhcy5hZGRUaWxlTGF5ZXIobGlmZmV5U2VudGluZWxMYXllcik7XG5cdHZpZXdDYW52YXMuYWRkVGlsZUxheWVyKGxpZmZleUxhYmVsTGF5ZXIpO1xuXG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudCh0b3RhbEltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KGRvbGllckltYWdlKTtcblx0dmlld0NhbnZhcy5hZGRTdGF0aWNFbGVtZW50KHRyaW5pdHlJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChwb29sYmVnSW1hZ2UpO1xuXHR2aWV3Q2FudmFzLmFkZFN0YXRpY0VsZW1lbnQoYWJiZXlJbWFnZSk7XG5cdHZpZXdDYW52YXMuYWRkU3RhdGljRWxlbWVudChidXNhcmFzSW1hZ2UpO1xuXG5cdGxldCBpbWFnZUNvbnRyb2xsZXIgPSBuZXcgSW1hZ2VDb250cm9sbGVyKHZpZXdDYW52YXMsIGJ1c2FyYXNJbWFnZSk7XG5cblx0dmlld0NhbnZhcy5kcmF3KCk7XG5cblx0Y29uc3QgcGx1cyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBsdXNcIik7XG5cdGNvbnN0IG1pbnVzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWludXNcIik7XG5cblx0bGV0IHBhbkNvbnRyb2wgPSBuZXcgUGFuQ29udHJvbGxlcih2aWV3Q2FudmFzLCBjYW52YXMpO1xuXHRsZXQgY2FudmFzQ29udHJvbCA9IG5ldyBab29tQ29udHJvbGxlcih2aWV3Q2FudmFzLCBwbHVzLCBtaW51cyk7XG59XG5cbmZ1bmN0aW9uIHNob3coKXtcblx0c2hvd01hcChcImNhbnZhc1wiLCBcIlR5cGVTY3JpcHRcIik7XG59XG5cbmlmIChcbiAgICBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgfHxcbiAgICAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gXCJsb2FkaW5nXCIgJiYgIWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5kb1Njcm9sbClcbikge1xuXHRzaG93KCk7XG59IGVsc2Uge1xuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBzaG93KTtcbn1cblxuIiwiaW1wb3J0IHsgU3RhdGljSW1hZ2UgfSBmcm9tIFwiLi4vZ3JhcGhpY3MvY2FudmFzdGlsZVwiO1xuaW1wb3J0IHsgVmlld0NhbnZhcyB9IGZyb20gXCIuLi9ncmFwaGljcy92aWV3Y2FudmFzXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgY2xhc3MgSW1hZ2VDb250cm9sbGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIHJlYWRvbmx5IHN0YXRpY0ltYWdlOiBTdGF0aWNJbWFnZSkge1xuICAgIFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5wcmVzc2VkKHZpZXdDYW52YXMsIGUgIGFzIEtleWJvYXJkRXZlbnQpKTtcbiAgICB9XG5cbiAgICBwcmVzc2VkKHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgXHRjb25zb2xlLmxvZyhcInByZXNzZWRcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LmtleSk7XG5cbiAgICBcdHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgXHRcdGNhc2UgXCJhXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS54SW5kZXggPSB0aGlzLnN0YXRpY0ltYWdlLnhJbmRleCAtIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiZFwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2UueEluZGV4ID0gdGhpcy5zdGF0aWNJbWFnZS54SW5kZXggKyAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIndcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnlJbmRleCA9IHRoaXMuc3RhdGljSW1hZ2UueUluZGV4IC0gMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJzXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS55SW5kZXggPSB0aGlzLnN0YXRpY0ltYWdlLnlJbmRleCArIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiZVwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uucm90YXRpb24gPSB0aGlzLnN0YXRpY0ltYWdlLnJvdGF0aW9uIC0gMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJxXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5yb3RhdGlvbiA9IHRoaXMuc3RhdGljSW1hZ2Uucm90YXRpb24gKyAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInhcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdYID0gdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWCAtIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiWFwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1ggPSB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdYICsgMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJ6XCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWSA9IHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1kgLSAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcIlpcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdZID0gdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWSArIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRkZWZhdWx0OlxuICAgIFx0XHRcdC8vIGNvZGUuLi5cbiAgICBcdFx0XHRicmVhaztcbiAgICBcdH1cbiAgICBcdGNvbnNvbGUubG9nKFwiaW1hZ2UgYXQ6IFwiICsgIHRoaXMuc3RhdGljSW1hZ2UueEluZGV4ICsgXCIsIFwiICsgdGhpcy5zdGF0aWNJbWFnZS55SW5kZXgpO1xuICAgIFx0Y29uc29sZS5sb2coXCJpbWFnZSBybyBzYzogXCIgKyAgdGhpcy5zdGF0aWNJbWFnZS5yb3RhdGlvbiArIFwiLCBcIiArIHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1ggKyBcIiwgXCIgKyB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdZKTtcbiAgICB9O1xuXG59OyIsImltcG9ydCB7IFZpZXdDYW52YXMgfSBmcm9tIFwiLi4vZ3JhcGhpY3Mvdmlld2NhbnZhc1wiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuZXhwb3J0IGNsYXNzIFpvb21Db250cm9sbGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIHJlYWRvbmx5IHpvb21JbjogSFRNTEVsZW1lbnQsIHJlYWRvbmx5IHpvb21PdXQ6IEhUTUxFbGVtZW50KSB7XG4gICAgXHR6b29tSW4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlOkV2ZW50KSA9PiB0aGlzLmNsaWNrZWQoZSwgdmlld0NhbnZhcywgLjk1KSk7XG4gICAgXHR6b29tT3V0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZTpFdmVudCkgPT4gdGhpcy5jbGlja2VkKGUsIHZpZXdDYW52YXMsIDEuMDUpKTtcbiAgICBcdHZpZXdDYW52YXMuY3R4LmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmNsaWNrZWQoZSwgdmlld0NhbnZhcywgLjc1KSk7XG4gICAgfVxuXG4gICAgY2xpY2tlZChldmVudDogRXZlbnQsIHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIHpvb206IG51bWJlcikge1xuICAgIFx0Y29uc29sZS5sb2coXCJjbGlja2VkXCIgKyBldmVudC50YXJnZXQgKyBcIiwgXCIgKyBldmVudC50eXBlKTtcblxuICAgIFx0dmlld0NhbnZhcy56b29tVmlldyh6b29tKTtcblxuICAgIFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgfTtcblxufTtcblxuZXhwb3J0IGNsYXNzIFBhbkNvbnRyb2xsZXIge1xuXG5cdHByaXZhdGUgeFByZXZpb3VzOiBudW1iZXI7XG5cdHByaXZhdGUgeVByZXZpb3VzOiBudW1iZXI7XG5cdHByaXZhdGUgcmVjb3JkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3Rvcih2aWV3Q2FudmFzOiBWaWV3Q2FudmFzLCByZWFkb25seSBkcmFnRWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgICBcdGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzKSk7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcykpO1xuICAgIFx0ZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLmRyYWdnZWQoZSBhcyBNb3VzZUV2ZW50LCB2aWV3Q2FudmFzKSk7XG4gICAgfVxuXG4gICAgZHJhZ2dlZChldmVudDogTW91c2VFdmVudCwgdmlld0NhbnZhczogVmlld0NhbnZhcykge1xuXG4gICAgXHRzd2l0Y2goZXZlbnQudHlwZSl7XG4gICAgXHRcdGNhc2UgXCJtb3VzZWRvd25cIjpcbiAgICBcdFx0XHR0aGlzLnJlY29yZCA9IHRydWU7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJtb3VzZXVwXCI6XG4gICAgXHRcdFx0dGhpcy5yZWNvcmQgPSBmYWxzZTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0ZGVmYXVsdDpcbiAgICBcdFx0XHRpZiAodGhpcy5yZWNvcmQpe1xuICAgIFx0XHRcdFx0bGV0IHhEZWx0YSA9IChldmVudC5jbGllbnRYIC0gdGhpcy54UHJldmlvdXMpIC8gNTEyO1xuXHQgICAgXHRcdFx0bGV0IHlEZWx0YSA9IChldmVudC5jbGllbnRZIC0gdGhpcy55UHJldmlvdXMpIC8gNTEyO1xuXG5cdCAgICBcdFx0XHRsZXQgbmV3VG9wTGVmdCA9IG5ldyBQb2ludDJEKHZpZXdDYW52YXMudG9wTGVmdC54IC0geERlbHRhLCBcblx0ICAgIFx0XHRcdFx0dmlld0NhbnZhcy50b3BMZWZ0LnkgLSB5RGVsdGEpO1xuXG5cdCAgICBcdFx0XHR2aWV3Q2FudmFzLm1vdmVWaWV3KG5ld1RvcExlZnQpO1xuXHQgICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0fVxuICAgIFx0XHRcdFxuICAgIFx0fVxuXG5cdFx0dGhpcy54UHJldmlvdXMgPSBldmVudC5jbGllbnRYO1xuXHRcdHRoaXMueVByZXZpb3VzID0gZXZlbnQuY2xpZW50WTtcblxuICAgIH07XG5cbn07XG5cbiJdfQ==
