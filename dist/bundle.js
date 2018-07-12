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
    ImageTile.prototype.drawImage = function (ctx, scalingX, scalingY, canvasX, canvasY) {
        console.log("scaling " + scalingX + " " + scalingY);
        ctx.save();
        ctx.scale(scalingX, scalingY);
        ctx.drawImage(this.img, canvasX, canvasY);
        ctx.restore();
    };
    ImageTile.prototype.draw = function (ctx, scalingX, scalingY, canvasX, canvasY) {
        var _this = this;
        if (this.img.complete) {
            this.drawImage(ctx, scalingX, scalingY, canvasX, canvasY);
        }
        else {
            this.img.onload = function (event) {
                _this.drawImage(ctx, scalingX, scalingY, canvasX, canvasY);
            };
        }
    };
    ;
    return ImageTile;
}(CanvasTile));
exports.ImageTile = ImageTile;
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
        _this.imageTileLayers = [];
        _this.canvasRenderContext.canvas.width = _this.canvasRenderContext.canvas.clientWidth;
        _this.canvasRenderContext.canvas.height = _this.canvasRenderContext.canvas.clientHeight;
        return _this;
    }
    ViewCanvas.prototype.addTileLayer = function (imageTileLayer) {
        this.imageTileLayers.push(imageTileLayer);
    };
    ViewCanvas.prototype.draw = function () {
        var viewScalingX = this.canvasRenderContext.canvas.clientWidth / this.widthMapUnits;
        var viewScalingY = this.canvasRenderContext.canvas.clientHeight / this.heightMapUnits;
        for (var _i = 0, _a = this.imageTileLayers; _i < _a.length; _i++) {
            var value = _a[_i];
            if (value.imageProperties.visible) {
                var tileScalingX = value.imageProperties.tileWidthPx / value.widthMapUnits;
                var tileScalingY = value.imageProperties.tileHeightPx / value.heightMapUnits;
                var canvasScalingX = viewScalingX / tileScalingX;
                var canvasScalingY = viewScalingY / tileScalingY;
                console.log("scaling ", canvasScalingX, canvasScalingY);
                var tiles = value.getTiles(this.topLeft, this.widthMapUnits, this.heightMapUnits);
                for (var _b = 0, tiles_1 = tiles; _b < tiles_1.length; _b++) {
                    var tile = tiles_1[_b];
                    console.log("drawing " + tile.xIndex + ", " + this.topLeft.x);
                    var tileX = (tile.xIndex - this.topLeft.x) * tileScalingX;
                    var tileY = (tile.yIndex - this.topLeft.y) * tileScalingY;
                    tile.draw(this.canvasRenderContext, canvasScalingX, canvasScalingY, tileX, tileY);
                }
            }
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
var liffeyLabelLayerProperties = new canvastile_1.ImageStruct();
liffeyLabelLayerProperties.suffix = "liffey.png";
var baseLayer = new canvastile_1.ImageTileLayer(1, 1, layerProperties);
var sentinelLayer = new canvastile_1.ImageTileLayer(1, 1, sentinelLayerProperties);
var roadLayer = new canvastile_1.ImageTileLayer(1, 1, roadLayerProperties);
var terrainLayer = new canvastile_1.ImageTileLayer(1, 1, sentinelTerrainLayerProperties);
var liffeySentinelLayer = new canvastile_1.ImageTileLayer(1, 1, liffeyLayerProperties);
var liffeyLabelLayer = new canvastile_1.ImageTileLayer(1, 1, liffeyLabelLayerProperties);
function showMap(divName, name) {
    var canvas = document.getElementById(divName);
    var ctx = canvas.getContext('2d');
    var canvasView = new viewcanvas_1.ViewCanvas(simpleWorld, new point2d_1.Point2D(0.5, 0.5), 2, 2, ctx);
    //canvasView.addTileLayer(baseLayer);
    // canvasView.addTileLayer(sentinelLayer);
    canvasView.addTileLayer(liffeySentinelLayer);
    canvasView.addTileLayer(liffeyLabelLayer);
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

},{"./geom/point2d":1,"./geom/world2d":4,"./graphics/canvastile":5,"./graphics/viewcanvas":6,"./ui/mapController":8}],8:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2dlb20vdGlsZS50cyIsInNyYy9nZW9tL3ZpZXdwb3J0LnRzIiwic3JjL2dlb20vd29ybGQyZC50cyIsInNyYy9ncmFwaGljcy9jYW52YXN0aWxlLnRzIiwic3JjL2dyYXBoaWNzL3ZpZXdjYW52YXMudHMiLCJzcmMvc2ltcGxlV29ybGQudHMiLCJzcmMvdWkvbWFwQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQ0E7SUFPSSxpQkFBWSxDQUFTLEVBQUUsQ0FBUztRQUM1QixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFUa0IsWUFBSSxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN6QixXQUFHLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBVTVDLGNBQUM7Q0FaRCxBQVlDLElBQUE7QUFaWSwwQkFBTzs7Ozs7QUNFcEI7SUFFQyxtQkFBbUIsYUFBcUIsRUFBUyxjQUFzQjtRQUFwRCxrQkFBYSxHQUFiLGFBQWEsQ0FBUTtRQUFTLG1CQUFjLEdBQWQsY0FBYyxDQUFRO0lBQUUsQ0FBQztJQU0zRSxnQkFBQztBQUFELENBUkEsQUFRQyxJQUFBO0FBUnFCLDhCQUFTO0FBVS9CO0lBSUMsY0FBWSxNQUFjLEVBQUUsTUFBYztJQUFFLENBQUM7SUFGdEMsY0FBUyxHQUFTLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFJMUMsV0FBQztDQU5ELEFBTUMsSUFBQTtBQU5ZLG9CQUFJOzs7OztBQ1RqQjtJQUVDLGtCQUFZLEtBQWMsRUFBUyxPQUFnQixFQUMzQyxhQUFxQixFQUFTLGNBQXNCO1FB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TyxDQUFDO1FBQy9CLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztJQUU3QixDQUFDO0lBQUEsQ0FBQztJQUVOLG9CQUFDO0FBQUQsQ0E1Q0EsQUE0Q0MsSUFBQTtBQTVDWSxzQ0FBYTtBQTRDekIsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlxuZXhwb3J0IGNsYXNzIFBvaW50MkQge1xuICAgIHN0YXRpYyByZWFkb25seSB6ZXJvID0gbmV3IFBvaW50MkQoMCwgMCk7XG4gICAgc3RhdGljIHJlYWRvbmx5IG9uZSA9IG5ldyBQb2ludDJEKDEsIDEpO1xuXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xuICAgIHJlYWRvbmx5IHk6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG5cdH1cblxufSIsImltcG9ydCB7IFVuaXRzIH0gZnJvbSBcIi4vd29ybGQyZFwiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuL3BvaW50MmRcIjtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFRpbGVMYXllciB7XG5cdFxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgd2lkdGhNYXBVbml0czogbnVtYmVyLCBwdWJsaWMgaGVpZ2h0TWFwVW5pdHM6IG51bWJlcil7fVxuXG5cdGFic3RyYWN0IGdldFRpbGUoeEluZGV4OiBudW1iZXIsIHlJbmRleDogbnVtYmVyKTogVGlsZTtcblxuXHRhYnN0cmFjdCBnZXRUaWxlcyhwb3NpdGlvbjogUG9pbnQyRCwgeFVuaXRzOiBudW1iZXIsIHlVbml0czogbnVtYmVyKTogQXJyYXk8VGlsZT47XG5cbn1cblxuZXhwb3J0IGNsYXNzIFRpbGUge1xuXHRcblx0c3RhdGljIGVtcHR5VGlsZTogVGlsZSA9IG5ldyBUaWxlKC0xLC0xKTtcblxuXHRjb25zdHJ1Y3Rvcih4SW5kZXg6IG51bWJlciwgeUluZGV4OiBudW1iZXIpe31cblxufSIsImltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi9wb2ludDJkXCI7XG5pbXBvcnQgeyBWZWN0b3IyRCB9IGZyb20gXCIuL3ZlY3RvcjJkXCI7XG5pbXBvcnQgeyBXb3JsZDJELCBVbml0cyB9IGZyb20gXCIuL3dvcmxkMmRcIjtcblxuZXhwb3J0IGNsYXNzIFZpZXdwb3J0IHtcblx0XG5cdGNvbnN0cnVjdG9yKHdvcmxkOiBXb3JsZDJELCBwdWJsaWMgdG9wTGVmdDogUG9pbnQyRCwgXG5cdFx0cHVibGljIHdpZHRoTWFwVW5pdHM6IG51bWJlciwgcHVibGljIGhlaWdodE1hcFVuaXRzOiBudW1iZXIpe31cblxuXHRzZXRWaWV3KHRvcExlZnQ6IFBvaW50MkQsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKXtcblx0XHR0aGlzLnRvcExlZnQgPSB0b3BMZWZ0O1xuXHRcdHRoaXMud2lkdGhNYXBVbml0cyA9IHdpZHRoO1xuXHRcdHRoaXMuaGVpZ2h0TWFwVW5pdHMgPSBoZWlnaHQ7XG5cdH07XG5cbn0iLCJpbXBvcnQgeyBUaWxlTGF5ZXIyRCB9IGZyb20gXCIuL3RpbGUyZFwiO1xuXG5leHBvcnQgY2xhc3MgVW5pdHMge1xuXG5cdHN0YXRpYyByZWFkb25seSBXZWJXVSA9IG5ldyBVbml0cyhcIk1lcmNhdG9yIFdlYiBXb3JsZCBVbml0c1wiKTtcblxuXHRjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpe31cblxufVxuLyoqXG4gIEEgd29ybGQgaXMgdGhlIGJhc2UgdGhhdCBhbGwgb3RoZXIgZWxlbWVudHMgb3JpZW50YXRlIGZyb20gXG4qKi9cbmV4cG9ydCBjbGFzcyBXb3JsZDJEIHtcblxuXHRwcml2YXRlIHRpbGVMYXllcnM6IEFycmF5PFRpbGVMYXllcjJEPiA9IFtdO1xuXHRcblx0Y29uc3RydWN0b3IobnVtYmVyLCB5VW5pdHM6IG51bWJlciwgd3JhcFg6IGJvb2xlYW4sIHdyYXBZOiBib29sZWFuKXt9XG5cbiAgICBhZGRUaWxlTGF5ZXIodGlsZUxheWVyOiBUaWxlTGF5ZXIyRCk6IG51bWJlciB7XG4gICAgXHRyZXR1cm4gdGhpcy50aWxlTGF5ZXJzLnB1c2godGlsZUxheWVyKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBUaWxlLCBUaWxlTGF5ZXIgfSBmcm9tIFwiLi4vZ2VvbS90aWxlXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2FudmFzVGlsZSBleHRlbmRzIFRpbGUge1xuXG5cdGFic3RyYWN0IGRyYXcoY2FudmFzOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHNjYWxpbmdYOiBudW1iZXIsIHNjYWxpbmdZOiBudW1iZXIsIFxuXHRcdGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKTogdm9pZDtcblxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VTdHJ1Y3Qge1xuXG5cdHByZWZpeDogc3RyaW5nID0gXCJcIjtcblx0c3VmZml4OiBzdHJpbmcgPSBcIlwiO1xuXHR0aWxlRGlyOiBzdHJpbmcgPSBcImltYWdlcy9cIjtcblx0dmlzaWJsZTogYm9vbGVhbiA9IHRydWU7XG5cdHRpbGVXaWR0aFB4OiBudW1iZXIgPSAyNTY7XG5cdHRpbGVIZWlnaHRQeDogbnVtYmVyID0gMjU2O1xuXG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZVRpbGUgZXh0ZW5kcyBDYW52YXNUaWxlIHtcblxuXHRwcml2YXRlIGltZzogSFRNTEltYWdlRWxlbWVudDtcblxuXHRjb25zdHJ1Y3RvcihyZWFkb25seSB4SW5kZXg6IG51bWJlciwgcmVhZG9ubHkgeUluZGV4OiBudW1iZXIsIGltYWdlU3JjOiBzdHJpbmcpIHtcblx0XHRzdXBlcih4SW5kZXgsIHlJbmRleCk7XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0fTtcblxuXHRwcml2YXRlIGRyYXdJbWFnZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgc2NhbGluZ1g6IG51bWJlciwgIHNjYWxpbmdZOiBudW1iZXIsIFxuXHRcdFx0Y2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpe1xuXHRcdGNvbnNvbGUubG9nKFwic2NhbGluZyBcIiArIHNjYWxpbmdYICsgXCIgXCIgKyBzY2FsaW5nWSk7XG5cdFx0Y3R4LnNhdmUoKTtcblx0XHRjdHguc2NhbGUoc2NhbGluZ1gsIHNjYWxpbmdZKTtcblx0XHRjdHguZHJhd0ltYWdlKHRoaXMuaW1nLCBjYW52YXNYLCBjYW52YXNZKTtcblx0XHRjdHgucmVzdG9yZSgpO1xuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgc2NhbGluZ1g6IG51bWJlciwgIHNjYWxpbmdZOiBudW1iZXIsIFxuXHRcdFx0Y2FudmFzWDogbnVtYmVyLCBjYW52YXNZOiBudW1iZXIpe1xuXHRcdGlmICh0aGlzLmltZy5jb21wbGV0ZSkge1xuXHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCBzY2FsaW5nWCwgc2NhbGluZ1ksIGNhbnZhc1gsIGNhbnZhc1kpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuaW1nLm9ubG9hZCA9IChldmVudCkgPT4ge1xuXHRcdFx0XHR0aGlzLmRyYXdJbWFnZShjdHgsIHNjYWxpbmdYLCBzY2FsaW5nWSwgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fTtcblxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VUaWxlTGF5ZXIgZXh0ZW5kcyBUaWxlTGF5ZXIge1xuXG5cdHJlYWRvbmx5IGltYWdlUHJvcGVydGllczogSW1hZ2VTdHJ1Y3Q7XG5cblx0Y29uc3RydWN0b3Iod2lkdGhNYXBVbml0czogbnVtYmVyLCBoZWlnaHRNYXBVbml0czogbnVtYmVyLCBpbWFnZVByb3BlcnRpZXM6IEltYWdlU3RydWN0KSB7XG5cdFx0c3VwZXIod2lkdGhNYXBVbml0cywgaGVpZ2h0TWFwVW5pdHMpO1xuXHRcdHRoaXMuaW1hZ2VQcm9wZXJ0aWVzID0gaW1hZ2VQcm9wZXJ0aWVzO1xuXHR9XG5cblx0LyoqXG5cdCAgbGVhdmUgY2FjaGluZyB1cCB0byB0aGUgYnJvd3NlclxuXHQqKi9cblx0Z2V0VGlsZSh4VW5pdHM6IG51bWJlciwgeVVuaXRzOiBudW1iZXIpOiBUaWxlIHtcblx0XHRsZXQgaW1hZ2VTcmMgPSB0aGlzLmltYWdlUHJvcGVydGllcy50aWxlRGlyICsgXG5cdFx0XHR0aGlzLmltYWdlUHJvcGVydGllcy5wcmVmaXggKyB4VW5pdHMgKyBcIl9cIiArIHlVbml0cyArIHRoaXMuaW1hZ2VQcm9wZXJ0aWVzLnN1ZmZpeDtcblx0XHRyZXR1cm4gbmV3IEltYWdlVGlsZSh4VW5pdHMsIHlVbml0cywgaW1hZ2VTcmMpO1xuXHR9XG5cblx0Z2V0VGlsZXMocG9zaXRpb246IFBvaW50MkQsIHhNYXBVbml0czogbnVtYmVyLCB5TWFwVW5pdHM6IG51bWJlcik6IEFycmF5PFRpbGU+IHtcblxuXHRcdGxldCBmaXJzdFggPSBNYXRoLmZsb29yKHBvc2l0aW9uLnggLyB0aGlzLndpZHRoTWFwVW5pdHMpO1xuXHRcdGxldCBsYXN0WCA9IE1hdGguY2VpbCgocG9zaXRpb24ueCArIHhNYXBVbml0cykvIHRoaXMud2lkdGhNYXBVbml0cyk7XG5cblx0XHRsZXQgZmlyc3RZID0gTWF0aC5mbG9vcihwb3NpdGlvbi55IC8gdGhpcy5oZWlnaHRNYXBVbml0cyk7XG5cdFx0bGV0IGxhc3RZID0gTWF0aC5jZWlsKChwb3NpdGlvbi55ICsgeU1hcFVuaXRzKS8gdGhpcy5oZWlnaHRNYXBVbml0cyk7XG5cblx0XHRsZXQgdGlsZXMgPSBuZXcgQXJyYXk8VGlsZT4oKTtcblxuXHRcdGZvciAodmFyIHg9Zmlyc3RYOyB4PGxhc3RYOyB4Kyspe1xuXHRcdFx0Zm9yICh2YXIgeT1maXJzdFk7IHk8bGFzdFk7IHkrKyl7XG5cdFx0XHRcdHRpbGVzLnB1c2godGhpcy5nZXRUaWxlKHgsIHkpKVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aWxlcztcblx0fVxufVxuIiwiaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tIFwiLi4vZ2VvbS92aWV3cG9ydFwiO1xuaW1wb3J0IHsgV29ybGQyRCB9IGZyb20gXCIuLi9nZW9tL3dvcmxkMmRcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBJbWFnZVRpbGUsIEltYWdlVGlsZUxheWVyIH0gZnJvbSBcIi4vY2FudmFzdGlsZVwiO1xuXG5leHBvcnQgY2xhc3MgVmlld0NhbnZhcyBleHRlbmRzIFZpZXdwb3J0IHtcblxuICAgIHByaXZhdGUgaW1hZ2VUaWxlTGF5ZXJzID0gW107XG5cbiAgICBjb25zdHJ1Y3Rvcih3b3JsZDogV29ybGQyRCwgdG9wTGVmdDogUG9pbnQyRCwgXG4gICAgXHR3aWR0aE1hcFVuaXRzOiBudW1iZXIsIGhlaWdodE1hcFVuaXRzOiBudW1iZXIsIFxuICAgIFx0cmVhZG9ubHkgY2FudmFzUmVuZGVyQ29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKSB7XG5cbiAgICBcdHN1cGVyKHdvcmxkLCB0b3BMZWZ0LCB3aWR0aE1hcFVuaXRzLCBoZWlnaHRNYXBVbml0cyk7XG5cbiAgICBcdHRoaXMuY2FudmFzUmVuZGVyQ29udGV4dC5jYW52YXMud2lkdGggPSB0aGlzLmNhbnZhc1JlbmRlckNvbnRleHQuY2FudmFzLmNsaWVudFdpZHRoO1xuICAgIFx0dGhpcy5jYW52YXNSZW5kZXJDb250ZXh0LmNhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhc1JlbmRlckNvbnRleHQuY2FudmFzLmNsaWVudEhlaWdodDtcbiAgICB9XG5cbiAgICBhZGRUaWxlTGF5ZXIoaW1hZ2VUaWxlTGF5ZXI6IEltYWdlVGlsZUxheWVyKTogdm9pZCB7XG4gICAgXHR0aGlzLmltYWdlVGlsZUxheWVycy5wdXNoKGltYWdlVGlsZUxheWVyKTtcbiAgICB9XG5cbiAgICBkcmF3KCk6IHZvaWQge1xuXG4gICAgXHR2YXIgdmlld1NjYWxpbmdYID0gdGhpcy5jYW52YXNSZW5kZXJDb250ZXh0LmNhbnZhcy5jbGllbnRXaWR0aCAvIHRoaXMud2lkdGhNYXBVbml0cztcbiAgICBcdHZhciB2aWV3U2NhbGluZ1kgPSB0aGlzLmNhbnZhc1JlbmRlckNvbnRleHQuY2FudmFzLmNsaWVudEhlaWdodCAvIHRoaXMuaGVpZ2h0TWFwVW5pdHM7XG5cbiAgICBcdGZvciAobGV0IHZhbHVlIG9mIHRoaXMuaW1hZ2VUaWxlTGF5ZXJzKXtcbiAgICBcdFx0aWYgKHZhbHVlLmltYWdlUHJvcGVydGllcy52aXNpYmxlKSB7XG5cbiAgICBcdFx0XHRsZXQgdGlsZVNjYWxpbmdYID0gdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVXaWR0aFB4IC8gdmFsdWUud2lkdGhNYXBVbml0cztcbiAgICBcdFx0XHRsZXQgdGlsZVNjYWxpbmdZID0gdmFsdWUuaW1hZ2VQcm9wZXJ0aWVzLnRpbGVIZWlnaHRQeCAvIHZhbHVlLmhlaWdodE1hcFVuaXRzO1xuXG4gICAgXHRcdFx0bGV0IGNhbnZhc1NjYWxpbmdYID0gdmlld1NjYWxpbmdYIC8gdGlsZVNjYWxpbmdYO1xuICAgIFx0XHRcdGxldCBjYW52YXNTY2FsaW5nWSA9IHZpZXdTY2FsaW5nWSAvIHRpbGVTY2FsaW5nWTtcblxuICAgIFx0XHRcdGNvbnNvbGUubG9nKFwic2NhbGluZyBcIiwgY2FudmFzU2NhbGluZ1gsIGNhbnZhc1NjYWxpbmdZKTtcblxuICAgIFx0XHRcdGxldCB0aWxlczogQXJyYXk8SW1hZ2VUaWxlPiA9IHZhbHVlLmdldFRpbGVzKHRoaXMudG9wTGVmdCwgXG4gICAgXHRcdFx0XHR0aGlzLndpZHRoTWFwVW5pdHMsIHRoaXMuaGVpZ2h0TWFwVW5pdHMpO1xuXG4gICAgXHRcdFx0Zm9yIChsZXQgdGlsZSBvZiB0aWxlcyl7XG4gICAgXHRcdFx0XHRjb25zb2xlLmxvZyhcImRyYXdpbmcgXCIgKyB0aWxlLnhJbmRleCArIFwiLCBcIiArIHRoaXMudG9wTGVmdC54KTtcbiAgICBcdFx0XHRcdHZhciB0aWxlWCA9ICh0aWxlLnhJbmRleCAtIHRoaXMudG9wTGVmdC54KSAqIHRpbGVTY2FsaW5nWDtcbiAgICBcdFx0XHRcdHZhciB0aWxlWSA9ICh0aWxlLnlJbmRleCAtIHRoaXMudG9wTGVmdC55KSAqIHRpbGVTY2FsaW5nWTtcblxuICAgIFx0XHRcdFx0dGlsZS5kcmF3KHRoaXMuY2FudmFzUmVuZGVyQ29udGV4dCwgY2FudmFzU2NhbGluZ1gsIGNhbnZhc1NjYWxpbmdZLCB0aWxlWCwgdGlsZVkpO1xuICAgIFx0XHRcdH1cbiAgICBcdFx0fVxuICAgIFx0fVxuICAgIH1cblxufSIsImltcG9ydCB7IFdvcmxkMkQgfSBmcm9tIFwiLi9nZW9tL3dvcmxkMmRcIjtcbmltcG9ydCB7IFZpZXdwb3J0IH0gZnJvbSBcIi4vZ2VvbS92aWV3cG9ydFwiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuL2dlb20vcG9pbnQyZFwiO1xuaW1wb3J0IHsgSW1hZ2VUaWxlTGF5ZXIsIEltYWdlU3RydWN0IH0gZnJvbSBcIi4vZ3JhcGhpY3MvY2FudmFzdGlsZVwiO1xuaW1wb3J0IHsgVmlld0NhbnZhcyB9IGZyb20gXCIuL2dyYXBoaWNzL3ZpZXdjYW52YXNcIjtcbmltcG9ydCB7IFpvb21Db250cm9sbGVyLCBQYW5Db250cm9sbGVyIH0gZnJvbSBcIi4vdWkvbWFwQ29udHJvbGxlclwiO1xuXG5sZXQgc2ltcGxlV29ybGQgPSBuZXcgV29ybGQyRCgyLCAyLCB0cnVlLCBmYWxzZSk7XG5cbmxldCBsYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbmxheWVyUHJvcGVydGllcy5wcmVmaXggPSBcIlwiO1xubGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwiLnBuZ1wiO1xuXG5sZXQgcm9hZExheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xucm9hZExheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImIucG5nXCI7XG5cbmxldCBzZW50aW5lbExheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuc2VudGluZWxMYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCJsLmpwZWdcIjtcblxubGV0IHNlbnRpbmVsVGVycmFpbkxheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xuc2VudGluZWxUZXJyYWluTGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwidC5qcGVnXCI7XG5cbmxldCBsaWZmZXlMYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbmxpZmZleUxheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImxpZmZleS5qcGVnXCI7XG5cbmxldCBsaWZmZXlMYWJlbExheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xubGlmZmV5TGFiZWxMYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCJsaWZmZXkucG5nXCI7XG5cbmxldCBiYXNlTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIoMSwgMSwgbGF5ZXJQcm9wZXJ0aWVzKTtcbmxldCBzZW50aW5lbExheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKDEsIDEsIHNlbnRpbmVsTGF5ZXJQcm9wZXJ0aWVzKTtcbmxldCByb2FkTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIoMSwgMSwgcm9hZExheWVyUHJvcGVydGllcyk7XG5sZXQgdGVycmFpbkxheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKDEsIDEsIHNlbnRpbmVsVGVycmFpbkxheWVyUHJvcGVydGllcyk7XG5cbmxldCBsaWZmZXlTZW50aW5lbExheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKDEsIDEsIGxpZmZleUxheWVyUHJvcGVydGllcyk7XG5sZXQgbGlmZmV5TGFiZWxMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcigxLCAxLCBsaWZmZXlMYWJlbExheWVyUHJvcGVydGllcyk7XG5cbmZ1bmN0aW9uIHNob3dNYXAoZGl2TmFtZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGl2TmFtZSk7XG5cbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cblx0bGV0IGNhbnZhc1ZpZXcgPSBuZXcgVmlld0NhbnZhcyhzaW1wbGVXb3JsZCwgbmV3IFBvaW50MkQoMC41LCAwLjUpLCAyLCAyLCBjdHgpO1xuXHQvL2NhbnZhc1ZpZXcuYWRkVGlsZUxheWVyKGJhc2VMYXllcik7XG5cdC8vIGNhbnZhc1ZpZXcuYWRkVGlsZUxheWVyKHNlbnRpbmVsTGF5ZXIpO1xuXHRjYW52YXNWaWV3LmFkZFRpbGVMYXllcihsaWZmZXlTZW50aW5lbExheWVyKTtcblx0Y2FudmFzVmlldy5hZGRUaWxlTGF5ZXIobGlmZmV5TGFiZWxMYXllcik7XG5cblx0Y2FudmFzVmlldy5kcmF3KCk7XG5cblx0Y29uc3QgcGx1cyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBsdXNcIik7XG5cdGNvbnN0IG1pbnVzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWludXNcIik7XG5cblx0bGV0IHBhbkNvbnRyb2wgPSBuZXcgUGFuQ29udHJvbGxlcihjYW52YXNWaWV3LCBjYW52YXMpO1xuXHRsZXQgY2FudmFzQ29udHJvbCA9IG5ldyBab29tQ29udHJvbGxlcihjYW52YXNWaWV3LCBwbHVzLCBtaW51cyk7XG59XG5cbmZ1bmN0aW9uIHNob3coKXtcblx0c2hvd01hcChcImNhbnZhc1wiLCBcIlR5cGVTY3JpcHRcIik7XG59XG5cbmlmIChcbiAgICBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgfHxcbiAgICAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gXCJsb2FkaW5nXCIgJiYgIWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5kb1Njcm9sbClcbikge1xuXHRzaG93KCk7XG59IGVsc2Uge1xuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBzaG93KTtcbn1cblxuIiwiaW1wb3J0IHsgVmlld0NhbnZhcyB9IGZyb20gXCIuLi9ncmFwaGljcy92aWV3Y2FudmFzXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgY2xhc3MgWm9vbUNvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3Iodmlld0NhbnZhczogVmlld0NhbnZhcywgcmVhZG9ubHkgem9vbUluOiBIVE1MRWxlbWVudCwgcmVhZG9ubHkgem9vbU91dDogSFRNTEVsZW1lbnQpIHtcbiAgICBcdHpvb21Jbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGU6RXZlbnQpID0+IHRoaXMuY2xpY2tlZChlLCB2aWV3Q2FudmFzLCAtMC4xKSk7XG4gICAgXHR6b29tT3V0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZTpFdmVudCkgPT4gdGhpcy5jbGlja2VkKGUsIHZpZXdDYW52YXMsICswLjEpKTtcbiAgICB9XG5cbiAgICBjbGlja2VkKGV2ZW50OiBFdmVudCwgdmlld0NhbnZhczogVmlld0NhbnZhcywgem9vbTogbnVtYmVyKSB7XG4gICAgXHRjb25zb2xlLmxvZyhcImNsaWNrZWRcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LnR5cGUpO1xuICAgIFx0dmlld0NhbnZhcy5zZXRWaWV3KHZpZXdDYW52YXMudG9wTGVmdCwgXG4gICAgXHRcdHZpZXdDYW52YXMud2lkdGhNYXBVbml0cyArIHpvb20sIHZpZXdDYW52YXMuaGVpZ2h0TWFwVW5pdHMgKyB6b29tKTtcbiAgICBcdHZpZXdDYW52YXMuZHJhdygpO1xuICAgIH07XG5cbn07XG5cbmV4cG9ydCBjbGFzcyBQYW5Db250cm9sbGVyIHtcblxuXHRwcml2YXRlIHhQcmV2aW91czogbnVtYmVyO1xuXHRwcml2YXRlIHlQcmV2aW91czogbnVtYmVyO1xuXHRwcml2YXRlIHJlY29yZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3Iodmlld0NhbnZhczogVmlld0NhbnZhcywgcmVhZG9ubHkgZHJhZ0VsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgXHRkcmFnRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcykpO1xuICAgIFx0ZHJhZ0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZTpFdmVudCkgPT4gXG4gICAgXHRcdHRoaXMuZHJhZ2dlZChlIGFzIE1vdXNlRXZlbnQsIHZpZXdDYW52YXMpKTtcbiAgICBcdGRyYWdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIChlOkV2ZW50KSA9PiBcbiAgICBcdFx0dGhpcy5kcmFnZ2VkKGUgYXMgTW91c2VFdmVudCwgdmlld0NhbnZhcykpO1xuICAgIH1cblxuICAgIGRyYWdnZWQoZXZlbnQ6IE1vdXNlRXZlbnQsIHZpZXdDYW52YXM6IFZpZXdDYW52YXMpIHtcblxuICAgIFx0c3dpdGNoKGV2ZW50LnR5cGUpe1xuICAgIFx0XHRjYXNlIFwibW91c2Vkb3duXCI6XG4gICAgXHRcdFx0dGhpcy5yZWNvcmQgPSB0cnVlO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHRjYXNlIFwibW91c2V1cFwiOlxuICAgIFx0XHRcdHRoaXMucmVjb3JkID0gZmFsc2U7XG4gICAgXHRcdFx0YnJlYWs7XG4gICAgXHRcdGRlZmF1bHQ6XG4gICAgXHRcdFx0aWYgKHRoaXMucmVjb3JkKXtcbiAgICBcdFx0XHRcdGxldCB4RGVsdGEgPSAoZXZlbnQuY2xpZW50WCAtIHRoaXMueFByZXZpb3VzKSAvIDUxMjtcblx0ICAgIFx0XHRcdGxldCB5RGVsdGEgPSAoZXZlbnQuY2xpZW50WSAtIHRoaXMueVByZXZpb3VzKSAvIDUxMjtcblxuXHQgICAgXHRcdFx0bGV0IG5ld1RvcExlZnQgPSBuZXcgUG9pbnQyRCgodmlld0NhbnZhcy50b3BMZWZ0LnggLSB4RGVsdGEpLCBcblx0ICAgIFx0XHRcdFx0KHZpZXdDYW52YXMudG9wTGVmdC55IC0geURlbHRhKSlcblxuXHQgICAgXHRcdFx0dmlld0NhbnZhcy5zZXRWaWV3KG5ld1RvcExlZnQsIFxuXHQgICAgXHRcdFx0XHR2aWV3Q2FudmFzLndpZHRoTWFwVW5pdHMsIHZpZXdDYW52YXMuaGVpZ2h0TWFwVW5pdHMpO1xuXHQgICAgXHRcdFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgXHRcdFx0fVxuICAgIFx0XHRcdFxuICAgIFx0fVxuXG5cdFx0dGhpcy54UHJldmlvdXMgPSBldmVudC5jbGllbnRYO1xuXHRcdHRoaXMueVByZXZpb3VzID0gZXZlbnQuY2xpZW50WTtcblxuICAgIH07XG5cbn07XG5cbiJdfQ==
