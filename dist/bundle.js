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
    function Viewport(world, topLeft, xWidth, yWidth) {
        this.topLeft = topLeft;
        this.xWidth = xWidth;
        this.yWidth = yWidth;
    }
    Viewport.prototype.setView = function (xWidth, yWidth) { };
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
        _this.widthMapUnits = widthMapUnits;
        _this.heightMapUnits = heightMapUnits;
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
                    var tileX = (tile.xIndex - this.topLeft.x) * viewScalingX / canvasScalingX;
                    var tileY = (tile.yIndex - this.topLeft.y) * viewScalingY / canvasScalingY;
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
var zoomController_1 = require("./ui/zoomController");
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
var baseLayer = new canvastile_1.ImageTileLayer(1, 1, layerProperties);
var sentinelLayer = new canvastile_1.ImageTileLayer(1, 1, sentinelLayerProperties);
var roadLayer = new canvastile_1.ImageTileLayer(1, 1, roadLayerProperties);
var terrainLayer = new canvastile_1.ImageTileLayer(1, 1, sentinelTerrainLayerProperties);
function showMap(divName, name) {
    var canvas = document.getElementById(divName);
    var ctx = canvas.getContext('2d');
    var canvasView = new viewcanvas_1.ViewCanvas(simpleWorld, new point2d_1.Point2D(0.5, 0.5), 1.0, 1.0, ctx);
    //canvasView.addTileLayer(baseLayer);
    canvasView.addTileLayer(sentinelLayer);
    canvasView.addTileLayer(terrainLayer);
    canvasView.addTileLayer(roadLayer);
    canvasView.draw();
    var plus = document.getElementById("plus");
    var minus = document.getElementById("minus");
    var canvasControl = new zoomController_1.ZoomController(canvasView, plus, minus);
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

},{"./geom/point2d":1,"./geom/world2d":4,"./graphics/canvastile":5,"./graphics/viewcanvas":6,"./ui/zoomController":8}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ZoomController = /** @class */ (function () {
    function ZoomController(viewCanvas, zoomIn, zoomOut) {
        var _this = this;
        this.zoomIn = zoomIn;
        this.zoomOut = zoomOut;
        zoomIn.addEventListener("click", function (e) { return _this.clicked(e, viewCanvas, 0.1); });
        zoomOut.addEventListener("click", function (e) { return _this.clicked(e, viewCanvas, -0.1); });
    }
    ZoomController.prototype.clicked = function (event, viewCanvas, zoom) {
        console.log("clicked" + event.target + ", " + event.type);
        viewCanvas.setView(viewCanvas.width + zoom, viewCanvas.height + zoom);
        viewCanvas.draw();
    };
    ;
    return ZoomController;
}());
exports.ZoomController = ZoomController;
;

},{}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2dlb20vdGlsZS50cyIsInNyYy9nZW9tL3ZpZXdwb3J0LnRzIiwic3JjL2dlb20vd29ybGQyZC50cyIsInNyYy9ncmFwaGljcy9jYW52YXN0aWxlLnRzIiwic3JjL2dyYXBoaWNzL3ZpZXdjYW52YXMudHMiLCJzcmMvc2ltcGxlV29ybGQudHMiLCJzcmMvdWkvem9vbUNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0NBO0lBT0ksaUJBQVksQ0FBUyxFQUFFLENBQVM7UUFDNUIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBVGtCLFlBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDekIsV0FBRyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQVU1QyxjQUFDO0NBWkQsQUFZQyxJQUFBO0FBWlksMEJBQU87Ozs7O0FDRXBCO0lBRUMsbUJBQW1CLGFBQXFCLEVBQVMsY0FBc0I7UUFBcEQsa0JBQWEsR0FBYixhQUFhLENBQVE7UUFBUyxtQkFBYyxHQUFkLGNBQWMsQ0FBUTtJQUFFLENBQUM7SUFNM0UsZ0JBQUM7QUFBRCxDQVJBLEFBUUMsSUFBQTtBQVJxQiw4QkFBUztBQVUvQjtJQUlDLGNBQVksTUFBYyxFQUFFLE1BQWM7SUFBRSxDQUFDO0lBRnRDLGNBQVMsR0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBSTFDLFdBQUM7Q0FORCxBQU1DLElBQUE7QUFOWSxvQkFBSTs7Ozs7QUNUakI7SUFFQyxrQkFBWSxLQUFjLEVBQVMsT0FBZ0IsRUFBUyxNQUFjLEVBQVMsTUFBYztRQUE5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T0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxFQUFFLFVBQVUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDdEUsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFBQSxDQUFDO0lBRU4scUJBQUM7QUFBRCxDQWJBLEFBYUMsSUFBQTtBQWJZLHdDQUFjO0FBYTFCLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcbmV4cG9ydCBjbGFzcyBQb2ludDJEIHtcbiAgICBzdGF0aWMgcmVhZG9ubHkgemVybyA9IG5ldyBQb2ludDJEKDAsIDApO1xuICAgIHN0YXRpYyByZWFkb25seSBvbmUgPSBuZXcgUG9pbnQyRCgxLCAxKTtcblxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcbiAgICByZWFkb25seSB5OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuXHR9XG5cbn0iLCJpbXBvcnQgeyBVbml0cyB9IGZyb20gXCIuL3dvcmxkMmRcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi9wb2ludDJkXCI7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBUaWxlTGF5ZXIge1xuXHRcblx0Y29uc3RydWN0b3IocHVibGljIHdpZHRoTWFwVW5pdHM6IG51bWJlciwgcHVibGljIGhlaWdodE1hcFVuaXRzOiBudW1iZXIpe31cblxuXHRhYnN0cmFjdCBnZXRUaWxlKHhJbmRleDogbnVtYmVyLCB5SW5kZXg6IG51bWJlcik6IFRpbGU7XG5cblx0YWJzdHJhY3QgZ2V0VGlsZXMocG9zaXRpb246IFBvaW50MkQsIHhVbml0czogbnVtYmVyLCB5VW5pdHM6IG51bWJlcik6IEFycmF5PFRpbGU+O1xuXG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlIHtcblx0XG5cdHN0YXRpYyBlbXB0eVRpbGU6IFRpbGUgPSBuZXcgVGlsZSgtMSwtMSk7XG5cblx0Y29uc3RydWN0b3IoeEluZGV4OiBudW1iZXIsIHlJbmRleDogbnVtYmVyKXt9XG5cbn0iLCJpbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4vcG9pbnQyZFwiO1xuaW1wb3J0IHsgVmVjdG9yMkQgfSBmcm9tIFwiLi92ZWN0b3IyZFwiO1xuaW1wb3J0IHsgV29ybGQyRCwgVW5pdHMgfSBmcm9tIFwiLi93b3JsZDJkXCI7XG5cbmV4cG9ydCBjbGFzcyBWaWV3cG9ydCB7XG5cdFxuXHRjb25zdHJ1Y3Rvcih3b3JsZDogV29ybGQyRCwgcHVibGljIHRvcExlZnQ6IFBvaW50MkQsIHB1YmxpYyB4V2lkdGg6IG51bWJlciwgcHVibGljIHlXaWR0aDogbnVtYmVyKXt9XG5cblx0c2V0Vmlldyh4V2lkdGg6IFVuaXRzLCB5V2lkdGg6IFVuaXRzKXt9O1xuXG59IiwiaW1wb3J0IHsgVGlsZUxheWVyMkQgfSBmcm9tIFwiLi90aWxlMmRcIjtcblxuZXhwb3J0IGNsYXNzIFVuaXRzIHtcblxuXHRzdGF0aWMgcmVhZG9ubHkgV2ViV1UgPSBuZXcgVW5pdHMoXCJNZXJjYXRvciBXZWIgV29ybGQgVW5pdHNcIik7XG5cblx0Y29uc3RydWN0b3IobmFtZTogc3RyaW5nKXt9XG5cbn1cbi8qKlxuICBBIHdvcmxkIGlzIHRoZSBiYXNlIHRoYXQgYWxsIG90aGVyIGVsZW1lbnRzIG9yaWVudGF0ZSBmcm9tIFxuKiovXG5leHBvcnQgY2xhc3MgV29ybGQyRCB7XG5cblx0cHJpdmF0ZSB0aWxlTGF5ZXJzOiBBcnJheTxUaWxlTGF5ZXIyRD4gPSBbXTtcblx0XG5cdGNvbnN0cnVjdG9yKG51bWJlciwgeVVuaXRzOiBudW1iZXIsIHdyYXBYOiBib29sZWFuLCB3cmFwWTogYm9vbGVhbil7fVxuXG4gICAgYWRkVGlsZUxheWVyKHRpbGVMYXllcjogVGlsZUxheWVyMkQpOiBudW1iZXIge1xuICAgIFx0cmV0dXJuIHRoaXMudGlsZUxheWVycy5wdXNoKHRpbGVMYXllcik7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgVGlsZSwgVGlsZUxheWVyIH0gZnJvbSBcIi4uL2dlb20vdGlsZVwiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENhbnZhc1RpbGUgZXh0ZW5kcyBUaWxlIHtcblxuXHRhYnN0cmFjdCBkcmF3KGNhbnZhczogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBzY2FsaW5nWDogbnVtYmVyLCBzY2FsaW5nWTogbnVtYmVyLCBcblx0XHRjYW52YXNYOiBudW1iZXIsIGNhbnZhc1k6IG51bWJlcik6IHZvaWQ7XG5cbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlU3RydWN0IHtcblxuXHRwcmVmaXg6IHN0cmluZyA9IFwiXCI7XG5cdHN1ZmZpeDogc3RyaW5nID0gXCJcIjtcblx0dGlsZURpcjogc3RyaW5nID0gXCJpbWFnZXMvXCI7XG5cdHZpc2libGU6IGJvb2xlYW4gPSB0cnVlO1xuXHR0aWxlV2lkdGhQeDogbnVtYmVyID0gMjU2O1xuXHR0aWxlSGVpZ2h0UHg6IG51bWJlciA9IDI1NjtcblxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VUaWxlIGV4dGVuZHMgQ2FudmFzVGlsZSB7XG5cblx0cHJpdmF0ZSBpbWc6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cblx0Y29uc3RydWN0b3IocmVhZG9ubHkgeEluZGV4OiBudW1iZXIsIHJlYWRvbmx5IHlJbmRleDogbnVtYmVyLCBpbWFnZVNyYzogc3RyaW5nKSB7XG5cdFx0c3VwZXIoeEluZGV4LCB5SW5kZXgpO1xuXHRcdHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG5cdFx0dGhpcy5pbWcuc3JjID0gaW1hZ2VTcmM7XG5cdH07XG5cblx0cHJpdmF0ZSBkcmF3SW1hZ2UoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHNjYWxpbmdYOiBudW1iZXIsICBzY2FsaW5nWTogbnVtYmVyLCBcblx0XHRcdGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKXtcblx0XHRjb25zb2xlLmxvZyhcInNjYWxpbmcgXCIgKyBzY2FsaW5nWCArIFwiIFwiICsgc2NhbGluZ1kpO1xuXHRcdGN0eC5zYXZlKCk7XG5cdFx0Y3R4LnNjYWxlKHNjYWxpbmdYLCBzY2FsaW5nWSk7XG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltZywgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0Y3R4LnJlc3RvcmUoKTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHNjYWxpbmdYOiBudW1iZXIsICBzY2FsaW5nWTogbnVtYmVyLCBcblx0XHRcdGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKXtcblx0XHRpZiAodGhpcy5pbWcuY29tcGxldGUpIHtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgc2NhbGluZ1gsIHNjYWxpbmdZLCBjYW52YXNYLCBjYW52YXNZKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR0aGlzLmltZy5vbmxvYWQgPSAoZXZlbnQpID0+IHtcblx0XHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCBzY2FsaW5nWCwgc2NhbGluZ1ksIGNhbnZhc1gsIGNhbnZhc1kpO1xuXHRcdFx0fTtcblx0XHR9XG5cdH07XG5cbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlVGlsZUxheWVyIGV4dGVuZHMgVGlsZUxheWVyIHtcblxuXHRyZWFkb25seSBpbWFnZVByb3BlcnRpZXM6IEltYWdlU3RydWN0O1xuXG5cdGNvbnN0cnVjdG9yKHdpZHRoTWFwVW5pdHM6IG51bWJlciwgaGVpZ2h0TWFwVW5pdHM6IG51bWJlciwgaW1hZ2VQcm9wZXJ0aWVzOiBJbWFnZVN0cnVjdCkge1xuXHRcdHN1cGVyKHdpZHRoTWFwVW5pdHMsIGhlaWdodE1hcFVuaXRzKTtcblx0XHR0aGlzLmltYWdlUHJvcGVydGllcyA9IGltYWdlUHJvcGVydGllcztcblx0fVxuXG5cdC8qKlxuXHQgIGxlYXZlIGNhY2hpbmcgdXAgdG8gdGhlIGJyb3dzZXJcblx0KiovXG5cdGdldFRpbGUoeFVuaXRzOiBudW1iZXIsIHlVbml0czogbnVtYmVyKTogVGlsZSB7XG5cdFx0bGV0IGltYWdlU3JjID0gdGhpcy5pbWFnZVByb3BlcnRpZXMudGlsZURpciArIFxuXHRcdFx0dGhpcy5pbWFnZVByb3BlcnRpZXMucHJlZml4ICsgeFVuaXRzICsgXCJfXCIgKyB5VW5pdHMgKyB0aGlzLmltYWdlUHJvcGVydGllcy5zdWZmaXg7XG5cdFx0cmV0dXJuIG5ldyBJbWFnZVRpbGUoeFVuaXRzLCB5VW5pdHMsIGltYWdlU3JjKTtcblx0fVxuXG5cdGdldFRpbGVzKHBvc2l0aW9uOiBQb2ludDJELCB4TWFwVW5pdHM6IG51bWJlciwgeU1hcFVuaXRzOiBudW1iZXIpOiBBcnJheTxUaWxlPiB7XG5cblx0XHRsZXQgZmlyc3RYID0gTWF0aC5mbG9vcihwb3NpdGlvbi54IC8gdGhpcy53aWR0aE1hcFVuaXRzKTtcblx0XHRsZXQgbGFzdFggPSBNYXRoLmNlaWwoKHBvc2l0aW9uLnggKyB4TWFwVW5pdHMpLyB0aGlzLndpZHRoTWFwVW5pdHMpO1xuXG5cdFx0bGV0IGZpcnN0WSA9IE1hdGguZmxvb3IocG9zaXRpb24ueSAvIHRoaXMuaGVpZ2h0TWFwVW5pdHMpO1xuXHRcdGxldCBsYXN0WSA9IE1hdGguY2VpbCgocG9zaXRpb24ueSArIHlNYXBVbml0cykvIHRoaXMuaGVpZ2h0TWFwVW5pdHMpO1xuXG5cdFx0bGV0IHRpbGVzID0gbmV3IEFycmF5PFRpbGU+KCk7XG5cblx0XHRmb3IgKHZhciB4PWZpcnN0WDsgeDxsYXN0WDsgeCsrKXtcblx0XHRcdGZvciAodmFyIHk9Zmlyc3RZOyB5PGxhc3RZOyB5Kyspe1xuXHRcdFx0XHR0aWxlcy5wdXNoKHRoaXMuZ2V0VGlsZSh4LCB5KSlcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGlsZXM7XG5cdH1cbn1cbiIsImltcG9ydCB7IFZpZXdwb3J0IH0gZnJvbSBcIi4uL2dlb20vdmlld3BvcnRcIjtcbmltcG9ydCB7IFdvcmxkMkQgfSBmcm9tIFwiLi4vZ2VvbS93b3JsZDJkXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuaW1wb3J0IHsgSW1hZ2VUaWxlLCBJbWFnZVRpbGVMYXllciB9IGZyb20gXCIuL2NhbnZhc3RpbGVcIjtcblxuZXhwb3J0IGNsYXNzIFZpZXdDYW52YXMgZXh0ZW5kcyBWaWV3cG9ydCB7XG5cbiAgICBwcml2YXRlIGltYWdlVGlsZUxheWVycyA9IFtdO1xuXG4gICAgY29uc3RydWN0b3Iod29ybGQ6IFdvcmxkMkQsIHRvcExlZnQ6IFBvaW50MkQsIFxuICAgIFx0cmVhZG9ubHkgd2lkdGhNYXBVbml0czogbnVtYmVyLCByZWFkb25seSBoZWlnaHRNYXBVbml0czogbnVtYmVyLCBcbiAgICBcdHJlYWRvbmx5IGNhbnZhc1JlbmRlckNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkge1xuXG4gICAgXHRzdXBlcih3b3JsZCwgdG9wTGVmdCwgd2lkdGhNYXBVbml0cywgaGVpZ2h0TWFwVW5pdHMpO1xuXG4gICAgXHR0aGlzLmNhbnZhc1JlbmRlckNvbnRleHQuY2FudmFzLndpZHRoID0gdGhpcy5jYW52YXNSZW5kZXJDb250ZXh0LmNhbnZhcy5jbGllbnRXaWR0aDtcbiAgICBcdHRoaXMuY2FudmFzUmVuZGVyQ29udGV4dC5jYW52YXMuaGVpZ2h0ID0gdGhpcy5jYW52YXNSZW5kZXJDb250ZXh0LmNhbnZhcy5jbGllbnRIZWlnaHQ7XG4gICAgfVxuXG4gICAgYWRkVGlsZUxheWVyKGltYWdlVGlsZUxheWVyOiBJbWFnZVRpbGVMYXllcik6IHZvaWQge1xuICAgIFx0dGhpcy5pbWFnZVRpbGVMYXllcnMucHVzaChpbWFnZVRpbGVMYXllcik7XG4gICAgfVxuXG4gICAgZHJhdygpOiB2b2lkIHtcblxuICAgIFx0dmFyIHZpZXdTY2FsaW5nWCA9IHRoaXMuY2FudmFzUmVuZGVyQ29udGV4dC5jYW52YXMuY2xpZW50V2lkdGggLyB0aGlzLndpZHRoTWFwVW5pdHM7XG4gICAgXHR2YXIgdmlld1NjYWxpbmdZID0gdGhpcy5jYW52YXNSZW5kZXJDb250ZXh0LmNhbnZhcy5jbGllbnRIZWlnaHQgLyB0aGlzLmhlaWdodE1hcFVuaXRzO1xuXG4gICAgXHRmb3IgKGxldCB2YWx1ZSBvZiB0aGlzLmltYWdlVGlsZUxheWVycyl7XG4gICAgXHRcdGlmICh2YWx1ZS5pbWFnZVByb3BlcnRpZXMudmlzaWJsZSkge1xuXG4gICAgXHRcdFx0bGV0IHRpbGVTY2FsaW5nWCA9IHZhbHVlLmltYWdlUHJvcGVydGllcy50aWxlV2lkdGhQeCAvIHZhbHVlLndpZHRoTWFwVW5pdHM7XG4gICAgXHRcdFx0bGV0IHRpbGVTY2FsaW5nWSA9IHZhbHVlLmltYWdlUHJvcGVydGllcy50aWxlSGVpZ2h0UHggLyB2YWx1ZS5oZWlnaHRNYXBVbml0cztcblxuICAgIFx0XHRcdGxldCBjYW52YXNTY2FsaW5nWCA9IHZpZXdTY2FsaW5nWCAvIHRpbGVTY2FsaW5nWDtcbiAgICBcdFx0XHRsZXQgY2FudmFzU2NhbGluZ1kgPSB2aWV3U2NhbGluZ1kgLyB0aWxlU2NhbGluZ1k7XG5cbiAgICBcdFx0XHRjb25zb2xlLmxvZyhcInNjYWxpbmcgXCIsIGNhbnZhc1NjYWxpbmdYLCBjYW52YXNTY2FsaW5nWSk7XG5cbiAgICBcdFx0XHRsZXQgdGlsZXM6IEFycmF5PEltYWdlVGlsZT4gPSB2YWx1ZS5nZXRUaWxlcyh0aGlzLnRvcExlZnQsIFxuICAgIFx0XHRcdFx0dGhpcy53aWR0aE1hcFVuaXRzLCB0aGlzLmhlaWdodE1hcFVuaXRzKTtcblxuICAgIFx0XHRcdGZvciAobGV0IHRpbGUgb2YgdGlsZXMpe1xuICAgIFx0XHRcdFx0Y29uc29sZS5sb2coXCJkcmF3aW5nIFwiICsgdGlsZS54SW5kZXggKyBcIiwgXCIgKyB0aGlzLnRvcExlZnQueCk7XG4gICAgXHRcdFx0XHR2YXIgdGlsZVggPSAodGlsZS54SW5kZXggLSB0aGlzLnRvcExlZnQueCkgKiB2aWV3U2NhbGluZ1ggLyBjYW52YXNTY2FsaW5nWDtcbiAgICBcdFx0XHRcdHZhciB0aWxlWSA9ICh0aWxlLnlJbmRleCAtIHRoaXMudG9wTGVmdC55KSAqIHZpZXdTY2FsaW5nWSAvIGNhbnZhc1NjYWxpbmdZO1xuXG4gICAgXHRcdFx0XHR0aWxlLmRyYXcodGhpcy5jYW52YXNSZW5kZXJDb250ZXh0LCBjYW52YXNTY2FsaW5nWCwgY2FudmFzU2NhbGluZ1ksIHRpbGVYLCB0aWxlWSk7XG4gICAgXHRcdFx0fVxuICAgIFx0XHR9XG4gICAgXHR9XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgV29ybGQyRCB9IGZyb20gXCIuL2dlb20vd29ybGQyZFwiO1xuaW1wb3J0IHsgVmlld3BvcnQgfSBmcm9tIFwiLi9nZW9tL3ZpZXdwb3J0XCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4vZ2VvbS9wb2ludDJkXCI7XG5pbXBvcnQgeyBJbWFnZVRpbGVMYXllciwgSW1hZ2VTdHJ1Y3QgfSBmcm9tIFwiLi9ncmFwaGljcy9jYW52YXN0aWxlXCI7XG5pbXBvcnQgeyBWaWV3Q2FudmFzIH0gZnJvbSBcIi4vZ3JhcGhpY3Mvdmlld2NhbnZhc1wiO1xuaW1wb3J0IHsgWm9vbUNvbnRyb2xsZXIgfSBmcm9tIFwiLi91aS96b29tQ29udHJvbGxlclwiO1xuXG5sZXQgc2ltcGxlV29ybGQgPSBuZXcgV29ybGQyRCgyLCAyLCB0cnVlLCBmYWxzZSk7XG5cbmxldCBsYXllclByb3BlcnRpZXMgPSBuZXcgSW1hZ2VTdHJ1Y3QoKTtcbmxheWVyUHJvcGVydGllcy5wcmVmaXggPSBcIlwiO1xubGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwiLnBuZ1wiO1xuXG5cbmxldCByb2FkTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG5yb2FkTGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwiYi5wbmdcIjtcblxubGV0IHNlbnRpbmVsTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG5zZW50aW5lbExheWVyUHJvcGVydGllcy5zdWZmaXggPSBcImwuanBlZ1wiO1xuXG5sZXQgc2VudGluZWxUZXJyYWluTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG5zZW50aW5lbFRlcnJhaW5MYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCJ0LmpwZWdcIjtcblxubGV0IGJhc2VMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcigxLCAxLCBsYXllclByb3BlcnRpZXMpO1xubGV0IHNlbnRpbmVsTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIoMSwgMSwgc2VudGluZWxMYXllclByb3BlcnRpZXMpO1xubGV0IHJvYWRMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcigxLCAxLCByb2FkTGF5ZXJQcm9wZXJ0aWVzKTtcbmxldCB0ZXJyYWluTGF5ZXIgPSBuZXcgSW1hZ2VUaWxlTGF5ZXIoMSwgMSwgc2VudGluZWxUZXJyYWluTGF5ZXJQcm9wZXJ0aWVzKTtcblxuZnVuY3Rpb24gc2hvd01hcChkaXZOYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGNhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChkaXZOYW1lKTtcblxuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHRsZXQgY2FudmFzVmlldyA9IG5ldyBWaWV3Q2FudmFzKHNpbXBsZVdvcmxkLCBuZXcgUG9pbnQyRCgwLjUsIDAuNSksIDEuMCwgMS4wLCBjdHgpO1xuXHQvL2NhbnZhc1ZpZXcuYWRkVGlsZUxheWVyKGJhc2VMYXllcik7XG5cdGNhbnZhc1ZpZXcuYWRkVGlsZUxheWVyKHNlbnRpbmVsTGF5ZXIpO1xuXHRjYW52YXNWaWV3LmFkZFRpbGVMYXllcih0ZXJyYWluTGF5ZXIpO1xuXHRjYW52YXNWaWV3LmFkZFRpbGVMYXllcihyb2FkTGF5ZXIpO1xuXG5cdGNhbnZhc1ZpZXcuZHJhdygpO1xuXG5cdGNvbnN0IHBsdXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwbHVzXCIpO1xuXHRjb25zdCBtaW51cyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1pbnVzXCIpO1xuXG5cdGxldCBjYW52YXNDb250cm9sID0gbmV3IFpvb21Db250cm9sbGVyKGNhbnZhc1ZpZXcsIHBsdXMsIG1pbnVzKTtcbn1cblxuZnVuY3Rpb24gc2hvdygpe1xuXHRzaG93TWFwKFwiY2FudmFzXCIsIFwiVHlwZVNjcmlwdFwiKTtcbn1cblxuaWYgKFxuICAgIGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIiB8fFxuICAgIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSBcImxvYWRpbmdcIiAmJiAhZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmRvU2Nyb2xsKVxuKSB7XG5cdHNob3coKTtcbn0gZWxzZSB7XG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIHNob3cpO1xufVxuXG4iLCJpbXBvcnQgeyBWaWV3Q2FudmFzIH0gZnJvbSBcIi4uL2dyYXBoaWNzL3ZpZXdjYW52YXNcIjtcblxuZXhwb3J0IGNsYXNzIFpvb21Db250cm9sbGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKHZpZXdDYW52YXM6IFZpZXdDYW52YXMsIHJlYWRvbmx5IHpvb21JbjogSFRNTEVsZW1lbnQsIHJlYWRvbmx5IHpvb21PdXQ6IEhUTUxFbGVtZW50KSB7XG4gICAgXHR6b29tSW4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlOkV2ZW50KSA9PiB0aGlzLmNsaWNrZWQoZSwgdmlld0NhbnZhcywgMC4xKSk7XG4gICAgXHR6b29tT3V0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZTpFdmVudCkgPT4gdGhpcy5jbGlja2VkKGUsIHZpZXdDYW52YXMsIC0wLjEpKTtcbiAgICB9XG5cbiAgICBjbGlja2VkKGV2ZW50OiBFdmVudCwgdmlld0NhbnZhczogVmlld0NhbnZhcywgem9vbTogbnVtYmVyKSB7XG4gICAgXHRjb25zb2xlLmxvZyhcImNsaWNrZWRcIiArIGV2ZW50LnRhcmdldCArIFwiLCBcIiArIGV2ZW50LnR5cGUpO1xuICAgIFx0dmlld0NhbnZhcy5zZXRWaWV3KHZpZXdDYW52YXMud2lkdGggKyB6b29tLCB2aWV3Q2FudmFzLmhlaWdodCArIHpvb20pO1xuICAgIFx0dmlld0NhbnZhcy5kcmF3KCk7XG4gICAgfTtcblxufTtcblxuIl19
