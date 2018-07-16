(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Point2D = /** @class */ (function () {
    function Point2D(x, y) {
        this.x = x;
        this.y = y;
    }
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
var Viewport = /** @class */ (function () {
    function Viewport(world, topLeft, widthMapUnits, heightMapUnits) {
        this.topLeft = topLeft;
        this.widthMapUnits = widthMapUnits;
        this.heightMapUnits = heightMapUnits;
    }
    Viewport.prototype.setView = function (topLeft, width, height) {
        this.topLeft = topLeft;
        this.widthMapUnits = width;
        this.heightMapUnits = height;
    };
    ;
    return Viewport;
}());
exports.Viewport = Viewport;

},{}],4:[function(require,module,exports){
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
    function World2D(number, yUnits, wrapX, wrapY) {
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
    ImageTile.prototype.draw = function (ctx, scalingX, scalingY, canvasX, canvasY) {
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
        var cosX = Math.cos(this.rotation);
        var sinX = Math.sin(this.rotation);
        ctx.translate(canvasX, canvasY);
        ctx.rotate(this.rotation);
        ctx.scale(this.scalingX, this.scalingY);
        ctx.globalAlpha = this.alpha;
        // ctx.transform(cosX * scalingX, sinX * scalingY, -sinX * scalingX, cosX * scalingY, 
        // 	canvasX / this.scaling, canvasY / this.scaling);
        ctx.drawImage(this.img, -(this.img.width / 2), -(this.img.height / 2));
        ctx.scale(1 / this.scalingX, 1 / this.scalingY);
        ctx.rotate(-this.rotation);
        ctx.translate(-canvasX, -canvasY);
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
    function ImageTileLayer(widthMapUnits, heightMapUnits, imageProperties) {
        var _this = _super.call(this, widthMapUnits, heightMapUnits) || this;
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
    function ViewCanvas(world, topLeft, widthMapUnits, heightMapUnits, canvasRenderContext) {
        var _this = _super.call(this, world, topLeft, widthMapUnits, heightMapUnits) || this;
        _this.canvasRenderContext = canvasRenderContext;
        _this.staticElements = [];
        _this.imageTileLayers = [];
        _this.canvasRenderContext.canvas.width = _this.canvasRenderContext.canvas.clientWidth;
        _this.canvasRenderContext.canvas.height = _this.canvasRenderContext.canvas.clientHeight;
        return _this;
    }
    ViewCanvas.prototype.addTileLayer = function (imageTileLayer) {
        this.imageTileLayers.push(imageTileLayer);
    };
    ViewCanvas.prototype.addStaticElement = function (staticImage) {
        this.staticElements.push(staticImage);
    };
    ViewCanvas.prototype.draw = function () {
        var viewScalingX = this.canvasRenderContext.canvas.clientWidth / this.widthMapUnits / 256;
        var viewScalingY = this.canvasRenderContext.canvas.clientHeight / this.heightMapUnits / 256;
        this.canvasRenderContext.save();
        this.canvasRenderContext.scale(viewScalingX, viewScalingY);
        console.log("view scaling ", viewScalingX);
        for (var _i = 0, _a = this.imageTileLayers; _i < _a.length; _i++) {
            var value = _a[_i];
            if (value.imageProperties.visible) {
                var tileScalingX = value.widthMapUnits / value.imageProperties.tileWidthPx;
                var tileScalingY = value.heightMapUnits / value.imageProperties.tileHeightPx;
                var tiles = value.getTiles(this.topLeft, this.widthMapUnits, this.heightMapUnits);
                for (var _b = 0, tiles_1 = tiles; _b < tiles_1.length; _b++) {
                    var tile = tiles_1[_b];
                    var tileX = (tile.xIndex - this.topLeft.x) / tileScalingX;
                    var tileY = (tile.yIndex - this.topLeft.y) / tileScalingY;
                    tile.draw(this.canvasRenderContext, tileScalingX, tileScalingY, tileX, tileY);
                }
            }
        }
        for (var _c = 0, _d = this.staticElements; _c < _d.length; _c++) {
            var value = _d[_c];
            //256 px is 1 map unit
            var tileScalingX = 256;
            var tileScalingY = 256;
            var imageX = (value.xIndex - this.topLeft.x) * tileScalingX;
            var imageY = (value.yIndex - this.topLeft.y) * tileScalingY;
            console.log("image x y " + value.xIndex + ", " + this.topLeft.x);
            value.draw(this.canvasRenderContext, imageX, imageY);
        }
        this.canvasRenderContext.restore();
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
var simpleWorld = new world2d_1.World2D(2, 2, true, false);
var layerProperties = new canvastile_1.ImageStruct();
layerProperties.prefix = "";
layerProperties.suffix = ".png";
var roadLayerProperties = new canvastile_1.ImageStruct();
roadLayerProperties.suffix = "b.png";
var sentinelLayerProperties = new canvastile_1.ImageStruct();
sentinelLayerProperties.suffix = "l.jpeg";
var sentinelTerrainLayerProperties = new canvastile_1.ImageStruct();
sentinelTerrainLayerProperties.suffix = "t.jpeg";
var liffeyLayerProperties = new canvastile_1.ImageStruct();
liffeyLayerProperties.suffix = "liffey.jpeg";
liffeyLayerProperties.tileDir = "images/liffey/";
var liffeyLabelLayerProperties = new canvastile_1.ImageStruct();
liffeyLabelLayerProperties.suffix = "liffey.png";
liffeyLabelLayerProperties.tileDir = "images/liffey/";
var baseLayer = new canvastile_1.ImageTileLayer(1, 1, layerProperties);
var sentinelLayer = new canvastile_1.ImageTileLayer(1, 1, sentinelLayerProperties);
var roadLayer = new canvastile_1.ImageTileLayer(1, 1, roadLayerProperties);
var terrainLayer = new canvastile_1.ImageTileLayer(1, 1, sentinelTerrainLayerProperties);
var liffeySentinelLayer = new canvastile_1.ImageTileLayer(1, 1, liffeyLayerProperties);
var liffeyLabelLayer = new canvastile_1.ImageTileLayer(1, 1, liffeyLabelLayerProperties);
// let dolierImage = new StaticImage(1.46, 1.09, .44, -0.07, 
// 	"images/maps_145_b_4_(2)_f017R[SVC2].jpg", 0.7);
var dolierImage = new canvastile_1.StaticImage(2.24, 1.87, .43, .43, -0.06, "images/maps_145_b_4_(2)_f017R[SVC2].jpg", 0.7);
var trinityImage = new canvastile_1.StaticImage(1.99, 3.59, .43, .43, 0.15, "images/maps_145_b_4_(2)_f019R[SVC2].jpg", 0.7);
var poolbegImage = new canvastile_1.StaticImage(3.34, 1.625, .405, .43, 0.05, "images/maps_145_b_4_(2)_f018R[SVC2].jpg", 0.7);
function showMap(divName, name) {
    var canvas = document.getElementById(divName);
    var ctx = canvas.getContext('2d');
    var canvasView = new viewcanvas_1.ViewCanvas(simpleWorld, new point2d_1.Point2D(1, 1), 2, 2, ctx);
    // canvasView.addTileLayer(baseLayer);
    // canvasView.addTileLayer(sentinelLayer);
    canvasView.addTileLayer(liffeySentinelLayer);
    canvasView.addTileLayer(liffeyLabelLayer);
    canvasView.addStaticElement(dolierImage);
    canvasView.addStaticElement(trinityImage);
    canvasView.addStaticElement(poolbegImage);
    var imageController = new imageController_1.ImageController(canvasView, poolbegImage);
    canvasView.draw();
    var plus = document.getElementById("plus");
    var minus = document.getElementById("minus");
    var panControl = new mapController_1.PanController(canvasView, canvas);
    var canvasControl = new mapController_1.ZoomController(canvasView, plus, minus);
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
        zoomIn.addEventListener("click", function (e) { return _this.clicked(e, viewCanvas, -0.1); });
        zoomOut.addEventListener("click", function (e) { return _this.clicked(e, viewCanvas, +0.1); });
    }
    ZoomController.prototype.clicked = function (event, viewCanvas, zoom) {
        console.log("clicked" + event.target + ", " + event.type);
        viewCanvas.setView(viewCanvas.topLeft, viewCanvas.widthMapUnits + zoom, viewCanvas.heightMapUnits + zoom);
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
                    var newTopLeft = new point2d_1.Point2D((viewCanvas.topLeft.x - xDelta), (viewCanvas.topLeft.y - yDelta));
                    viewCanvas.setView(newTopLeft, viewCanvas.widthMapUnits, viewCanvas.heightMapUnits);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2dlb20vdGlsZS50cyIsInNyYy9nZW9tL3ZpZXdwb3J0LnRzIiwic3JjL2dlb20vd29ybGQyZC50cyIsInNyYy9ncmFwaGljcy9jYW52YXN0aWxlLnRzIiwic3JjL2dyYXBoaWNzL3ZpZXdjYW52YXMudHMiLCJzcmMvc2ltcGxlV29ybGQudHMiLCJzcmMvdWkvaW1hZ2VDb250cm9sbGVyLnRzIiwic3JjL3VpL21hcENvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0NBO0lBT0ksaUJBQVksQ0FBUyxFQUFFLENBQVM7UUFDNUIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBVGtCLFlBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDekIsV0FBRyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQVU1QyxjQUFDO0NBWkQsQUFZQyxJQUFBO0FBWlksMEJBQU87Ozs7O0FDRXBCO0lBRUMsbUJBQW1CLGFBQXFCLEVBQVMsY0FBc0I7UUFBcEQsa0JBQWEsR0FBYixhQUFhLENBQVE7UUFBUyxtQkFBYyxHQUFkLGNBQWMsQ0FBUTtJQUFFLENBQUM7SUFNM0UsZ0JBQUM7QUFBRCxDQVJBLEFBUUMsSUFBQTtBQVJxQiw4QkFBUztBQVUvQjtJQUlDLGNBQVksTUFBYyxFQUFFLE1BQWM7SUFBRSxDQUFDO0lBRnRDLGNBQVMsR0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBSTFDLFdBQUM7Q0FORCxBQU1DLElBQUE7QUFOWSxvQkFBSTs7Ozs7QUNUakI7SUFFQyxrQkFBWSxLQUFjLEVBQVMsT0FB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R0FBUCxVQUFRLFVBQXNCLEVBQUUsS0FBb0I7UUFDbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXpELFFBQVEsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNsQixLQUFLLEdBQUc7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO2dCQUMxRCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDUCxLQUFLLEdBQUc7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO2dCQUMxRCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDUCxLQUFLLEdBQUc7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO2dCQUMxRCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDUCxLQUFLLEdBQUc7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO2dCQUMxRCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDUCxLQUFLLEdBQUc7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2dCQUM5RCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07WUFDUCxLQUFLLEdBQUc7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFR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QUMsT0FBTyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFBO29CQUVqQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFDNUIsVUFBVSxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQ3RELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQkFDbEI7U0FFRjtRQUVKLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUMvQixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7SUFFN0IsQ0FBQztJQUFBLENBQUM7SUFFTixvQkFBQztBQUFELENBNUNBLEFBNENDLElBQUE7QUE1Q1ksc0NBQWE7QUE0Q3pCLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcbmV4cG9ydCBjbGFzcyBQb2ludDJEIHtcbiAgICBzdGF0aWMgcmVhZG9ubHkgemVybyA9IG5ldyBQb2ludDJEKDAsIDApO1xuICAgIHN0YXRpYyByZWFkb25seSBvbmUgPSBuZXcgUG9pbnQyRCgxLCAxKTtcblxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcbiAgICByZWFkb25seSB5OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuXHR9XG5cbn0iLCJpbXBvcnQgeyBVbml0cyB9IGZyb20gXCIuL3dvcmxkMmRcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi9wb2ludDJkXCI7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBUaWxlTGF5ZXIge1xuXHRcblx0Y29uc3RydWN0b3IocHVibGljIHdpZHRoTWFwVW5pdHM6IG51bWJlciwgcHVibGljIGhlaWdodE1hcFVuaXRzOiBudW1iZXIpe31cblxuXHRhYnN0cmFjdCBnZXRUaWxlKHhJbmRleDogbnVtYmVyLCB5SW5kZXg6IG51bWJlcik6IFRpbGU7XG5cblx0YWJzdHJhY3QgZ2V0VGlsZXMocG9zaXRpb246IFBvaW50MkQsIHhVbml0czogbnVtYmVyLCB5VW5pdHM6IG51bWJlcik6IEFycmF5PFRpbGU+O1xuXG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlIHtcblx0XG5cdHN0YXRpYyBlbXB0eVRpbGU6IFRpbGUgPSBuZXcgVGlsZSgtMSwtMSk7XG5cblx0Y29uc3RydWN0b3IoeEluZGV4OiBudW1iZXIsIHlJbmRleDogbnVtYmVyKXt9XG5cbn0iLCJpbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4vcG9pbnQyZFwiO1xuaW1wb3J0IHsgVmVjdG9yMkQgfSBmcm9tIFwiLi92ZWN0b3IyZFwiO1xuaW1wb3J0IHsgV29ybGQyRCwgVW5pdHMgfSBmcm9tIFwiLi93b3JsZDJkXCI7XG5cbmV4cG9ydCBjbGFzcyBWaWV3cG9ydCB7XG5cdFxuXHRjb25zdHJ1Y3Rvcih3b3JsZDogV29ybGQyRCwgcHVibGljIHRvcExlZnQ6IFBvaW50MkQsIFxuXHRcdHB1YmxpYyB3aWR0aE1hcFVuaXRzOiBudW1iZXIsIHB1YmxpYyBoZWlnaHRNYXBVbml0czogbnVtYmVyKXt9XG5cblx0c2V0Vmlldyh0b3BMZWZ0OiBQb2ludDJELCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcil7XG5cdFx0dGhpcy50b3BMZWZ0ID0gdG9wTGVmdDtcblx0XHR0aGlzLndpZHRoTWFwVW5pdHMgPSB3aWR0aDtcblx0XHR0aGlzLmhlaWdodE1hcFVuaXRzID0gaGVpZ2h0O1xuXHR9O1xuXG59IiwiaW1wb3J0IHsgVGlsZUxheWVyMkQgfSBmcm9tIFwiLi90aWxlMmRcIjtcblxuZXhwb3J0IGNsYXNzIFVuaXRzIHtcblxuXHRzdGF0aWMgcmVhZG9ubHkgV2ViV1UgPSBuZXcgVW5pdHMoXCJNZXJjYXRvciBXZWIgV29ybGQgVW5pdHNcIik7XG5cblx0Y29uc3RydWN0b3IobmFtZTogc3RyaW5nKXt9XG5cbn1cbi8qKlxuICBBIHdvcmxkIGlzIHRoZSBiYXNlIHRoYXQgYWxsIG90aGVyIGVsZW1lbnRzIG9yaWVudGF0ZSBmcm9tIFxuKiovXG5leHBvcnQgY2xhc3MgV29ybGQyRCB7XG5cblx0cHJpdmF0ZSB0aWxlTGF5ZXJzOiBBcnJheTxUaWxlTGF5ZXIyRD4gPSBbXTtcblx0XG5cdGNvbnN0cnVjdG9yKG51bWJlciwgeVVuaXRzOiBudW1iZXIsIHdyYXBYOiBib29sZWFuLCB3cmFwWTogYm9vbGVhbil7fVxuXG4gICAgYWRkVGlsZUxheWVyKHRpbGVMYXllcjogVGlsZUxheWVyMkQpOiBudW1iZXIge1xuICAgIFx0cmV0dXJuIHRoaXMudGlsZUxheWVycy5wdXNoKHRpbGVMYXllcik7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgVGlsZSwgVGlsZUxheWVyIH0gZnJvbSBcIi4uL2dlb20vdGlsZVwiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENhbnZhc1RpbGUgZXh0ZW5kcyBUaWxlIHtcblxuXHRhYnN0cmFjdCBkcmF3KGNhbnZhczogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBzY2FsaW5nWDogbnVtYmVyLCBzY2FsaW5nWTogbnVtYmVyLCBcblx0XHRjYW52YXNYOiBudW1iZXIsIGNhbnZhc1k6IG51bWJlcik6IHZvaWQ7XG5cbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlU3RydWN0IHtcblxuXHRwcmVmaXg6IHN0cmluZyA9IFwiXCI7XG5cdHN1ZmZpeDogc3RyaW5nID0gXCJcIjtcblx0dGlsZURpcjogc3RyaW5nID0gXCJpbWFnZXMvXCI7XG5cdHZpc2libGU6IGJvb2xlYW4gPSB0cnVlO1xuXHR0aWxlV2lkdGhQeDogbnVtYmVyID0gMjU2O1xuXHR0aWxlSGVpZ2h0UHg6IG51bWJlciA9IDI1NjtcblxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VUaWxlIGV4dGVuZHMgQ2FudmFzVGlsZSB7XG5cblx0cHJpdmF0ZSBpbWc6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cblx0Y29uc3RydWN0b3IocmVhZG9ubHkgeEluZGV4OiBudW1iZXIsIHJlYWRvbmx5IHlJbmRleDogbnVtYmVyLCBpbWFnZVNyYzogc3RyaW5nKSB7XG5cdFx0c3VwZXIoeEluZGV4LCB5SW5kZXgpO1xuXHRcdHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG5cdFx0dGhpcy5pbWcuc3JjID0gaW1hZ2VTcmM7XG5cdH07XG5cblx0cHJpdmF0ZSBkcmF3SW1hZ2UoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKXtcblx0XHRjdHguZHJhd0ltYWdlKHRoaXMuaW1nLCBjYW52YXNYLCBjYW52YXNZKTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHNjYWxpbmdYOiBudW1iZXIsICBzY2FsaW5nWTogbnVtYmVyLCBcblx0XHRcdGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKXtcblx0XHRpZiAodGhpcy5pbWcuY29tcGxldGUpIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5pbWcub25sb2FkID0gKGV2ZW50KSA9PiB7XG5cdFx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fTtcblxufVxuXG5leHBvcnQgY2xhc3MgU3RhdGljSW1hZ2Uge1xuXG5cdHByaXZhdGUgaW1nOiBIVE1MSW1hZ2VFbGVtZW50O1xuXG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB4SW5kZXg6IG51bWJlciwgcHVibGljIHlJbmRleDogbnVtYmVyLCBcblx0XHRwdWJsaWMgc2NhbGluZ1g6IG51bWJlciwgcHVibGljIHNjYWxpbmdZOiBudW1iZXIsIHB1YmxpYyByb3RhdGlvbjogbnVtYmVyLCBcblx0XHRpbWFnZVNyYzogc3RyaW5nLCByZWFkb25seSBhbHBoYTogbnVtYmVyKSB7XG5cdFx0XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0fTtcblxuXHRwcml2YXRlIGRyYXdJbWFnZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgY2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpe1xuXG5cdFx0Ly9zY2FsaW5nWCA9IHNjYWxpbmdYICogdGhpcy5zY2FsaW5nO1xuXHRcdC8vc2NhbGluZ1kgPSBzY2FsaW5nWSAqIHRoaXMuc2NhbGluZztcblxuXHRcdGxldCBjb3NYID0gTWF0aC5jb3ModGhpcy5yb3RhdGlvbik7XG5cdFx0bGV0IHNpblggPSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uKTtcblxuXHRcdGN0eC50cmFuc2xhdGUoY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0Y3R4LnJvdGF0ZSh0aGlzLnJvdGF0aW9uKTtcblx0XHRjdHguc2NhbGUodGhpcy5zY2FsaW5nWCwgdGhpcy5zY2FsaW5nWSk7XG5cdFx0Y3R4Lmdsb2JhbEFscGhhID0gdGhpcy5hbHBoYTtcblxuXHRcdC8vIGN0eC50cmFuc2Zvcm0oY29zWCAqIHNjYWxpbmdYLCBzaW5YICogc2NhbGluZ1ksIC1zaW5YICogc2NhbGluZ1gsIGNvc1ggKiBzY2FsaW5nWSwgXG5cdFx0Ly8gXHRjYW52YXNYIC8gdGhpcy5zY2FsaW5nLCBjYW52YXNZIC8gdGhpcy5zY2FsaW5nKTtcblxuXHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIC0odGhpcy5pbWcud2lkdGgvMiksIC0odGhpcy5pbWcuaGVpZ2h0LzIpKTtcblx0XHRcblx0XHRjdHguc2NhbGUoMS90aGlzLnNjYWxpbmdYLCAxL3RoaXMuc2NhbGluZ1kpO1xuXHRcdGN0eC5yb3RhdGUoLXRoaXMucm90YXRpb24pO1xuXHRcdGN0eC50cmFuc2xhdGUoLWNhbnZhc1gsIC1jYW52YXNZKTtcblxuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgY2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpe1xuXHRcdGlmICh0aGlzLmltZy5jb21wbGV0ZSkge1xuXHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCBjYW52YXNYLCBjYW52YXNZKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR0aGlzLmltZy5vbmxvYWQgPSAoZXZlbnQpID0+IHtcblx0XHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCBjYW52YXNYLCBjYW52YXNZKTtcblx0XHRcdH07XG5cdFx0fVxuXHR9O1xuXG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZVRpbGVMYXllciBleHRlbmRzIFRpbGVMYXllciB7XG5cblx0cmVhZG9ubHkgaW1hZ2VQcm9wZXJ0aWVzOiBJbWFnZVN0cnVjdDtcblxuXHRjb25zdHJ1Y3Rvcih3aWR0aE1hcFVuaXRzOiBudW1iZXIsIGhlaWdodE1hcFVuaXRzOiBudW1iZXIsIGltYWdlUHJvcGVydGllczogSW1hZ2VTdHJ1Y3QpIHtcblx0XHRzdXBlcih3aWR0aE1hcFVuaXRzLCBoZWlnaHRNYXBVbml0cyk7XG5cdFx0dGhpcy5pbWFnZVByb3BlcnRpZXMgPSBpbWFnZVByb3BlcnRpZXM7XG5cdH1cblxuXHQvKipcblx0ICBsZWF2ZSBjYWNoaW5nIHVwIHRvIHRoZSBicm93c2VyXG5cdCoqL1xuXHRnZXRUaWxlKHhVbml0czogbnVtYmVyLCB5VW5pdHM6IG51bWJlcik6IFRpbGUge1xuXHRcdGxldCBpbWFnZVNyYyA9IHRoaXMuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVEaXIgKyBcblx0XHRcdHRoaXMuaW1hZ2VQcm9wZXJ0aWVzLnByZWZpeCArIHhVbml0cyArIFwiX1wiICsgeVVuaXRzICsgdGhpcy5pbWFnZVByb3BlcnRpZXMuc3VmZml4O1xuXHRcdHJldHVybiBuZXcgSW1hZ2VUaWxlKHhVbml0cywgeVVuaXRzLCBpbWFnZVNyYyk7XG5cdH1cblxuXHRnZXRUaWxlcyhwb3NpdGlvbjogUG9pbnQyRCwgeE1hcFVuaXRzOiBudW1iZXIsIHlNYXBVbml0czogbnVtYmVyKTogQXJyYXk8VGlsZT4ge1xuXG5cdFx0bGV0IGZpcnN0WCA9IE1hdGguZmxvb3IocG9zaXRpb24ueCAvIHRoaXMud2lkdGhNYXBVbml0cyk7XG5cdFx0bGV0IGxhc3RYID0gTWF0aC5jZWlsKChwb3NpdGlvbi54ICsgeE1hcFVuaXRzKS8gdGhpcy53aWR0aE1hcFVuaXRzKTtcblxuXHRcdGxldCBmaXJzdFkgPSBNYXRoLmZsb29yKHBvc2l0aW9uLnkgLyB0aGlzLmhlaWdodE1hcFVuaXRzKTtcblx0XHRsZXQgbGFzdFkgPSBNYXRoLmNlaWwoKHBvc2l0aW9uLnkgKyB5TWFwVW5pdHMpLyB0aGlzLmhlaWdodE1hcFVuaXRzKTtcblxuXHRcdGxldCB0aWxlcyA9IG5ldyBBcnJheTxUaWxlPigpO1xuXG5cdFx0Zm9yICh2YXIgeD1maXJzdFg7IHg8bGFzdFg7IHgrKyl7XG5cdFx0XHRmb3IgKHZhciB5PWZpcnN0WTsgeTxsYXN0WTsgeSsrKXtcblx0XHRcdFx0dGlsZXMucHVzaCh0aGlzLmdldFRpbGUoeCwgeSkpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRpbGVzO1xuXHR9XG59XG4iLCJpbXBvcnQgeyBWaWV3cG9ydCB9IGZyb20gXCIuLi9nZW9tL3ZpZXdwb3J0XCI7XG5pbXBvcnQgeyBXb3JsZDJEIH0gZnJvbSBcIi4uL2dlb20vd29ybGQyZFwiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcbmltcG9ydCB7IFN0YXRpY0ltYWdlLCBJbWFnZVRpbGUsIEltYWdlVGlsZUxheWVyIH0gZnJvbSBcIi4vY2FudmFzdGlsZVwiO1xuXG5leHBvcnQgY2xhc3MgVmlld0NhbnZhcyBleHRlbmRzIFZpZXdwb3J0IHtcblxuICAgIHByaXZhdGUgc3RhdGljRWxlbWVudHM6IEFycmF5PFN0YXRpY0ltYWdlPiA9IFtdO1xuICAgIHByaXZhdGUgaW1hZ2VUaWxlTGF5ZXJzID0gW107XG5cbiAgICBjb25zdHJ1Y3Rvcih3b3JsZDogV29ybGQyRCwgdG9wTGVmdDogUG9pbnQyRCwgXG4gICAgXHR3aWR0aE1hcFVuaXRzOiBudW1iZXIsIGhlaWdodE1hcFVuaXRzOiBudW1iZXIsIFxuICAgIFx0cmVhZG9ubHkgY2FudmFzUmVuZGVyQ29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKSB7XG5cbiAgICBcdHN1cGVyKHdvcmxkLCB0b3BMZWZ0LCB3aWR0aE1hcFVuaXRzLCBoZWlnaHRNYXBVbml0cyk7XG5cbiAgICBcdHRoaXMuY2FudmFzUmVuZGVyQ29udGV4dC5jYW52YXMud2lkdGggPSB0aGlzLmNhbnZhc1JlbmRlckNvbnRleHQuY2FudmFzLmNsaWVudFdpZHRoO1xuICAgIFx0dGhpcy5jYW52YXNSZW5kZXJDb250ZXh0LmNhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhc1JlbmRlckNvbnRleHQuY2FudmFzLmNsaWVudEhlaWdodDtcbiAgICB9XG5cbiAgICBhZGRUaWxlTGF5ZXIoaW1hZ2VUaWxlTGF5ZXI6IEltYWdlVGlsZUxheWVyKTogdm9pZCB7XG4gICAgXHR0aGlzLmltYWdlVGlsZUxheWVycy5wdXNoKGltYWdlVGlsZUxheWVyKTtcbiAgICB9XG5cbiAgICBhZGRTdGF0aWNFbGVtZW50KHN0YXRpY0ltYWdlOiBTdGF0aWNJbWFnZSk6IHZvaWQge1xuICAgIFx0dGhpcy5zdGF0aWNFbGVtZW50cy5wdXNoKHN0YXRpY0ltYWdlKTtcbiAgICB9XG5cbiAgICBkcmF3KCk6IHZvaWQge1xuXG4gICAgXHRsZXQgdmlld1NjYWxpbmdYID0gdGhpcy5jYW52YXNSZW5kZXJDb250ZXh0LmNhbnZhcy5jbGllbnRXaWR0aCAvIHRoaXMud2lkdGhNYXBVbml0cyAvIDI1NjtcbiAgICBcdGxldCB2aWV3U2NhbGluZ1kgPSB0aGlzLmNhbnZhc1JlbmRlckNvbnRleHQuY2FudmFzLmNsaWVudEhlaWdodCAvIHRoaXMuaGVpZ2h0TWFwVW5pdHMgLyAyNTY7XG5cbiAgICBcdHRoaXMuY2FudmFzUmVuZGVyQ29udGV4dC5zYXZlKCk7XG4gICAgXHR0aGlzLmNhbnZhc1JlbmRlckNvbnRleHQuc2NhbGUodmlld1NjYWxpbmdYLCB2aWV3U2NhbGluZ1kpO1xuICAgIFx0Y29uc29sZS5sb2coXCJ2aWV3IHNjYWxpbmcgXCIsIHZpZXdTY2FsaW5nWCk7XG5cbiAgICBcdGZvciAobGV0IHZhbHVlIG9mIHRoaXMuaW1hZ2VUaWxlTGF5ZXJzKXtcbiAgICBcdFx0aWYgKHZhbHVlLmltYWdlUHJvcGVydGllcy52aXNpYmxlKSB7XG5cbiAgICBcdFx0XHRsZXQgdGlsZVNjYWxpbmdYID0gdmFsdWUud2lkdGhNYXBVbml0cyAvIHZhbHVlLmltYWdlUHJvcGVydGllcy50aWxlV2lkdGhQeDtcbiAgICBcdFx0XHRsZXQgdGlsZVNjYWxpbmdZID0gdmFsdWUuaGVpZ2h0TWFwVW5pdHMgLyB2YWx1ZS5pbWFnZVByb3BlcnRpZXMudGlsZUhlaWdodFB4O1xuXG4gICAgXHRcdFx0bGV0IHRpbGVzOiBBcnJheTxJbWFnZVRpbGU+ID0gdmFsdWUuZ2V0VGlsZXModGhpcy50b3BMZWZ0LCBcbiAgICBcdFx0XHRcdHRoaXMud2lkdGhNYXBVbml0cywgdGhpcy5oZWlnaHRNYXBVbml0cyk7XG5cbiAgICBcdFx0XHRmb3IgKGxldCB0aWxlIG9mIHRpbGVzKXtcbiAgICBcdFx0XHRcdHZhciB0aWxlWCA9ICh0aWxlLnhJbmRleCAtIHRoaXMudG9wTGVmdC54KSAvIHRpbGVTY2FsaW5nWDtcbiAgICBcdFx0XHRcdHZhciB0aWxlWSA9ICh0aWxlLnlJbmRleCAtIHRoaXMudG9wTGVmdC55KSAvIHRpbGVTY2FsaW5nWTtcblxuICAgIFx0XHRcdFx0dGlsZS5kcmF3KHRoaXMuY2FudmFzUmVuZGVyQ29udGV4dCwgdGlsZVNjYWxpbmdYLCB0aWxlU2NhbGluZ1ksIFxuICAgIFx0XHRcdFx0XHR0aWxlWCwgdGlsZVkpO1xuICAgIFx0XHRcdH1cbiAgICBcdFx0fVxuICAgIFx0fVxuXG4gICAgXHRmb3IgKGxldCB2YWx1ZSBvZiB0aGlzLnN0YXRpY0VsZW1lbnRzKXtcblxuICAgIFx0XHQvLzI1NiBweCBpcyAxIG1hcCB1bml0XG5cdFx0XHRsZXQgdGlsZVNjYWxpbmdYID0gMjU2O1xuXHRcdFx0bGV0IHRpbGVTY2FsaW5nWSA9IDI1NjtcblxuICAgIFx0XHRsZXQgaW1hZ2VYID0gKHZhbHVlLnhJbmRleCAtIHRoaXMudG9wTGVmdC54KSAqIHRpbGVTY2FsaW5nWDtcbiAgICBcdFx0bGV0IGltYWdlWSA9ICh2YWx1ZS55SW5kZXggLSB0aGlzLnRvcExlZnQueSkgKiB0aWxlU2NhbGluZ1k7XG5cbiAgICBcdFx0Y29uc29sZS5sb2coXCJpbWFnZSB4IHkgXCIgKyB2YWx1ZS54SW5kZXggKyBcIiwgXCIgKyB0aGlzLnRvcExlZnQueCk7XG5cbiAgICBcdFx0dmFsdWUuZHJhdyh0aGlzLmNhbnZhc1JlbmRlckNvbnRleHQsIGltYWdlWCwgaW1hZ2VZKTtcbiAgICBcdH1cbiAgICBcdHRoaXMuY2FudmFzUmVuZGVyQ29udGV4dC5yZXN0b3JlKCk7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgV29ybGQyRCB9IGZyb20gXCIuL2dlb20vd29ybGQyZFwiO1xuaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tIFwiLi9nZW9tL3ZpZXdwb3J0XCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBTdGF0aWNJbWFnZSwgSW1hZ2VUaWxlTGF5ZXIsIEltYWdlU3RydWN0IH0gZnJvbSBcIi4vZ3JhcGhpY3MvY2FudmFzdGlsZVwiO1xuaW1wb3J0IHsgVmlld0NhbnZhcyB9IGZyb20gXCIuL2dyYXBoaWNzL3ZpZXdjYW52YXNcIjtcbmltcG9ydCB7IFpvb21Db250cm9sbGVyLCBQYW5Db250cm9sbGVyIH0gZnJvbSBcIi4vdWkvbWFwQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgSW1hZ2VDb250cm9sbGVyIH0gZnJvbSBcIi4vdWkvaW1hZ2VDb250cm9sbGVyXCI7XG5cbmxldCBzaW1wbGVXb3JsZCA9IG5ldyBXb3JsZDJEKDIsIDIsIHRydWUsIGZhbHNlKTtcblxubGV0IGxheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xubGF5ZXJQcm9wZXJ0aWVzLnByZWZpeCA9IFwiXCI7XG5sYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCIucG5nXCI7XG5cbmxldCByb2FkTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG5yb2FkTGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwiYi5wbmdcIjtcblxubGV0IHNlbnRpbmVsTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG5zZW50aW5lbExheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImwuanBlZ1wiO1xuXG5sZXQgc2VudGluZWxUZXJyYWluTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG5zZW50aW5lbFRlcnJhaW5MYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCJ0LmpwZWdcIjtcblxubGV0IGxpZmZleUxheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xubGlmZmV5TGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwibGlmZmV5LmpwZWdcIjtcbmxpZmZleUxheWVyUHJvcGVydGllcy50aWxlRGlyID0gXCJpbWFnZXMvbGlmZmV5L1wiO1xuXG5sZXQgbGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbmxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwibGlmZmV5LnBuZ1wiO1xubGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMudGlsZURpciA9IFwiaW1hZ2VzL2xpZmZleS9cIjtcblxubGV0IGJhc2VMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcigxLCAxLCBsYXllclByb3BlcnRpZXMpO1xubGV0IHNlbnRpbmVsTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIoMSwgMSwgc2VudGluZWxMYXllclByb3BlcnRpZXMpO1xubGV0IHJvYWRMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcigxLCAxLCByb2FkTGF5ZXJQcm9wZXJ0aWVzKTtcbmxldCB0ZXJyYWluTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIoMSwgMSwgc2VudGluZWxUZXJyYWluTGF5ZXJQcm9wZXJ0aWVzKTtcblxubGV0IGxpZmZleVNlbnRpbmVsTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIoMSwgMSwgbGlmZmV5TGF5ZXJQcm9wZXJ0aWVzKTtcbmxldCBsaWZmZXlMYWJlbExheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKDEsIDEsIGxpZmZleUxhYmVsTGF5ZXJQcm9wZXJ0aWVzKTtcblxuLy8gbGV0IGRvbGllckltYWdlID0gbmV3IFN0YXRpY0ltYWdlKDEuNDYsIDEuMDksIC40NCwgLTAuMDcsIFxuLy8gXHRcImltYWdlcy9tYXBzXzE0NV9iXzRfKDIpX2YwMTdSW1NWQzJdLmpwZ1wiLCAwLjcpO1xuXG5sZXQgZG9saWVySW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMi4yNCwgMS44NywgLjQzLCAuNDMsIC0wLjA2LCBcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDE3UltTVkMyXS5qcGdcIiwgMC43KTtcblxubGV0IHRyaW5pdHlJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZSgxLjk5LCAzLjU5LCAuNDMsIC40MywgMC4xNSwgXG5cdFwiaW1hZ2VzL21hcHNfMTQ1X2JfNF8oMilfZjAxOVJbU1ZDMl0uanBnXCIsIDAuNyk7XG5cbmxldCBwb29sYmVnSW1hZ2UgPSBuZXcgU3RhdGljSW1hZ2UoMy4zNCwgMS42MjUsIC40MDUsIC40MywgMC4wNSxcblx0XCJpbWFnZXMvbWFwc18xNDVfYl80XygyKV9mMDE4UltTVkMyXS5qcGdcIiwgMC43KTtcblxuZnVuY3Rpb24gc2hvd01hcChkaXZOYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGNhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChkaXZOYW1lKTtcblxuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHRsZXQgY2FudmFzVmlldyA9IG5ldyBWaWV3Q2FudmFzKHNpbXBsZVdvcmxkLCBuZXcgUG9pbnQyRCgxLCAxKSwgMiwgMiwgY3R4KTtcblx0Ly8gY2FudmFzVmlldy5hZGRUaWxlTGF5ZXIoYmFzZUxheWVyKTtcblx0Ly8gY2FudmFzVmlldy5hZGRUaWxlTGF5ZXIoc2VudGluZWxMYXllcik7XG5cdGNhbnZhc1ZpZXcuYWRkVGlsZUxheWVyKGxpZmZleVNlbnRpbmVsTGF5ZXIpO1xuXHRjYW52YXNWaWV3LmFkZFRpbGVMYXllcihsaWZmZXlMYWJlbExheWVyKTtcblxuXHRjYW52YXNWaWV3LmFkZFN0YXRpY0VsZW1lbnQoZG9saWVySW1hZ2UpO1xuXHRjYW52YXNWaWV3LmFkZFN0YXRpY0VsZW1lbnQodHJpbml0eUltYWdlKTtcblx0Y2FudmFzVmlldy5hZGRTdGF0aWNFbGVtZW50KHBvb2xiZWdJbWFnZSk7XG5cblx0bGV0IGltYWdlQ29udHJvbGxlciA9IG5ldyBJbWFnZUNvbnRyb2xsZXIoY2FudmFzVmlldywgcG9vbGJlZ0ltYWdlKTtcblxuXHRjYW52YXNWaWV3LmRyYXcoKTtcblxuXHRjb25zdCBwbHVzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGx1c1wiKTtcblx0Y29uc3QgbWludXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtaW51c1wiKTtcblxuXHRsZXQgcGFuQ29udHJvbCA9IG5ldyBQYW5Db250cm9sbGVyKGNhbnZhc1ZpZXcsIGNhbnZhcyk7XG5cdGxldCBjYW52YXNDb250cm9sID0gbmV3IFpvb21Db250cm9sbGVyKGNhbnZhc1ZpZXcsIHBsdXMsIG1pbnVzKTtcbn1cblxuZnVuY3Rpb24gc2hvdygpe1xuXHRzaG93TWFwKFwiY2FudmFzXCIsIFwiVHlwZVNjcmlwdFwiKTtcbn1cblxuaWYgKFxuICAgIGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIiB8fFxuICAgIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSBcImxvYWRpbmdcIiAmJiAhZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmRvU2Nyb2xsKVxuKSB7XG5cdHNob3coKTtcbn0gZWxzZSB7XG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIHNob3cpO1xufVxuXG4iLCJpbXBvcnQgeyBTdGF0aWNJbWFnZSB9IGZyb20gXCIuLi9ncmFwaGljcy9jYW52YXN0aWxlXCI7XG5pbXBvcnQgeyBWaWV3Q2FudmFzIH0gZnJvbSBcIi4uL2dyYXBoaWNzL3ZpZXdjYW52YXNcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5cbmV4cG9ydCBjbGFzcyBJbWFnZUNvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3Iodmlld0NhbnZhczogVmlld0NhbnZhcywgcmVhZG9ubHkgc3RhdGljSW1hZ2U6IFN0YXRpY0ltYWdlKSB7XG4gICAgXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGU6RXZlbnQpID0+IFxuICAgIFx0XHR0aGlzLnByZXNzZWQodmlld0NhbnZhcywgZSAgYXMgS2V5Ym9hcmRFdmVudCkpO1xuICAgIH1cblxuICAgIHByZXNzZWQodmlld0NhbnZhczogVmlld0NhbnZhcywgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBcdGNvbnNvbGUubG9nKFwicHJlc3NlZFwiICsgZXZlbnQudGFyZ2V0ICsgXCIsIFwiICsgZXZlbnQua2V5KTtcblxuICAgIFx0c3dpdGNoIChldmVudC5rZXkpIHtcbiAgICBcdFx0Y2FzZSBcImFcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnhJbmRleCA9IHRoaXMuc3RhdGljSW1hZ2UueEluZGV4IC0gMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJkXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS54SW5kZXggPSB0aGlzLnN0YXRpY0ltYWdlLnhJbmRleCArIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwid1wiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2UueUluZGV4ID0gdGhpcy5zdGF0aWNJbWFnZS55SW5kZXggLSAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInNcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnlJbmRleCA9IHRoaXMuc3RhdGljSW1hZ2UueUluZGV4ICsgMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJlXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5yb3RhdGlvbiA9IHRoaXMuc3RhdGljSW1hZ2Uucm90YXRpb24gLSAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInFcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnJvdGF0aW9uID0gdGhpcy5zdGF0aWNJbWFnZS5yb3RhdGlvbiArIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwieFwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1ggPSB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdYIC0gMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGNhc2UgXCJYXCI6XG4gICAgXHRcdFx0dGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWCA9IHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1ggKyAwLjAwNTtcbiAgICBcdFx0XHR2aWV3Q2FudmFzLmRyYXcoKTtcbiAgICBcdFx0XHRicmVhaztcbiAgICBcdFx0Y2FzZSBcInpcIjpcbiAgICBcdFx0XHR0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdZID0gdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWSAtIDAuMDA1O1xuICAgIFx0XHRcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwiWlwiOlxuICAgIFx0XHRcdHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1kgPSB0aGlzLnN0YXRpY0ltYWdlLnNjYWxpbmdZICsgMC4wMDU7XG4gICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGRlZmF1bHQ6XG4gICAgXHRcdFx0Ly8gY29kZS4uLlxuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0fVxuICAgIFx0Y29uc29sZS5sb2coXCJpbWFnZSBhdDogXCIgKyAgdGhpcy5zdGF0aWNJbWFnZS54SW5kZXggKyBcIiwgXCIgKyB0aGlzLnN0YXRpY0ltYWdlLnlJbmRleCk7XG4gICAgXHRjb25zb2xlLmxvZyhcImltYWdlIHJvIHNjOiBcIiArICB0aGlzLnN0YXRpY0ltYWdlLnJvdGF0aW9uICsgXCIsIFwiICsgdGhpcy5zdGF0aWNJbWFnZS5zY2FsaW5nWCArIFwiLCBcIiArIHRoaXMuc3RhdGljSW1hZ2Uuc2NhbGluZ1kpO1xuICAgIH07XG5cbn07IiwiaW1wb3J0IHsgVmlld0NhbnZhcyB9IGZyb20gXCIuLi9ncmFwaGljcy92aWV3Y2FudmFzXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgY2xhc3MgWm9vbUNvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3Iodmlld0NhbnZhczogVmlld0NhbnZhcywgcmVhZG9ubHkgem9vbUluOiBIVE1MRWxlbWVudCwgcmVhZG9ubHkgem9vbU91dDogSFRNTEVsZW1lbnQpIHtcbiAgICBcdHpvb21Jbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGU6RXZlbnQpID0+IHRoaXMuY2xpY2tlZChlLCB2aWV3Q2FudmFzLCAtMC4xKSk7XG4gICAgXHR6b29tT3V0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZTpFdmVudCkgPT4gdGhpcy5jbGlja2VkKGUsIHZpZXdDYW52YXMsICswLjEpKTtcbiAgICB9XG5cbiAgICBjbGlja2VkKGV2ZW50OiBFdmVudCwgdmlld0NhbnZhczogVmlld0NhbnZhcywgem9vbTogbnVtYmVyKSB7XG4gICAgXHRjb25zb2xlLmxvZyhcImNsaWNrZWRcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LnR5cGUpO1xuICAgIFx0dmlld0NhbnZhcy5zZXRWaWV3KHZpZXdDYW52YXMudG9wTGVmdCwgXG4gICAgXHRcdHZpZXdDYW52YXMud2lkdGhNYXBVbml0cyArIHpvb20sIHZpZXdDYW52YXMuaGVpZ2h0TWFwVW5pdHMgKyB6b29tKTtcbiAgICBcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIH07XG5cbn07XG5cbmV4cG9ydCBjbGFzcyBQYW5Db250cm9sbGVyIHtcblxuXHRwcml2YXRlIHhQcmV2aW91czogbnVtYmVyO1xuXHRwcml2YXRlIHlQcmV2aW91czogbnVtYmVyO1xuXHRwcml2YXRlIHJlY29yZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3Iodmlld0NhbnZhczogVmlld0NhbnZhcywgcmVhZG9ubHkgZHJhZ0VsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcykpO1xuICAgIFx0ZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdDYW52YXMpKTtcbiAgICBcdGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcykpO1xuICAgIH1cblxuICAgIGRyYWdnZWQoZXZlbnQ6IE1vdXNlRXZlbnQsIHZpZXdDYW52YXM6IFZpZXdDYW52YXMpIHtcblxuICAgIFx0c3dpdGNoKGV2ZW50LnR5cGUpe1xuICAgIFx0XHRjYXNlIFwibW91c2Vkb3duXCI6XG4gICAgXHRcdFx0dGhpcy5yZWNvcmQgPSB0cnVlO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwibW91c2V1cFwiOlxuICAgIFx0XHRcdHRoaXMucmVjb3JkID0gZmFsc2U7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGRlZmF1bHQ6XG4gICAgXHRcdFx0aWYgKHRoaXMucmVjb3JkKXtcbiAgICBcdFx0XHRcdGxldCB4RGVsdGEgPSAoZXZlbnQuY2xpZW50WCAtIHRoaXMueFByZXZpb3VzKSAvIDUxMjtcblx0ICAgIFx0XHRcdGxldCB5RGVsdGEgPSAoZXZlbnQuY2xpZW50WSAtIHRoaXMueVByZXZpb3VzKSAvIDUxMjtcblxuXHQgICAgXHRcdFx0bGV0IG5ld1RvcExlZnQgPSBuZXcgUG9pbnQyRCgodmlld0NhbnZhcy50b3BMZWZ0LnggLSB4RGVsdGEpLCBcblx0ICAgIFx0XHRcdFx0KHZpZXdDYW52YXMudG9wTGVmdC55IC0geURlbHRhKSlcblxuXHQgICAgXHRcdFx0dmlld0NhbnZhcy5zZXRWaWV3KG5ld1RvcExlZnQsIFxuXHQgICAgXHRcdFx0XHR2aWV3Q2FudmFzLndpZHRoTWFwVW5pdHMsIHZpZXdDYW52YXMuaGVpZ2h0TWFwVW5pdHMpO1xuXHQgICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0fVxuICAgIFx0XHRcdFxuICAgIFx0fVxuXG5cdFx0dGhpcy54UHJldmlvdXMgPSBldmVudC5jbGllbnRYO1xuXHRcdHRoaXMueVByZXZpb3VzID0gZXZlbnQuY2xpZW50WTtcblxuICAgIH07XG5cbn07XG5cbiJdfQ==
