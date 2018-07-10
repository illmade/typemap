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
    function TileLayer(tileWidth, tileHeight) {
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
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
    ImageTile.prototype.draw = function (canvas, canvasX, canvasY) {
        var _this = this;
        if (this.img.complete) {
            canvas.drawImage(this.img, canvasX, canvasY);
        }
        else {
            this.img.onload = function (event) {
                canvas.drawImage(_this.img, canvasX, canvasY);
            };
        }
    };
    ;
    return ImageTile;
}(CanvasTile));
exports.ImageTile = ImageTile;
var ImageTileLayer = /** @class */ (function (_super) {
    __extends(ImageTileLayer, _super);
    function ImageTileLayer(tileWidth, tileHeight, imageProperties) {
        var _this = _super.call(this, tileWidth, tileHeight) || this;
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
    ImageTileLayer.prototype.getTiles = function (position, xWidth, yWidth) {
        var firstX = Math.floor(position.x / this.tileWidth);
        var lastX = Math.ceil((position.x + xWidth) / this.tileWidth);
        var firstY = Math.floor(position.y / this.tileHeight);
        var lastY = Math.ceil((position.y + yWidth) / this.tileHeight);
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
    function ViewCanvas(world, topLeft, xWidth, yWidth, canvasRenderContext) {
        var _this = _super.call(this, world, topLeft, xWidth, yWidth) || this;
        _this.xWidth = xWidth;
        _this.yWidth = yWidth;
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
        var scalingX = this.canvasRenderContext.canvas.clientWidth / this.xWidth;
        var scalingY = this.canvasRenderContext.canvas.clientHeight / this.yWidth;
        console.log("scaling ", scalingX, scalingY);
        for (var _i = 0, _a = this.imageTileLayers; _i < _a.length; _i++) {
            var value = _a[_i];
            if (value.imageProperties.visible) {
                var tiles = value.getTiles(this.topLeft, this.xWidth, this.yWidth);
                for (var _b = 0, tiles_1 = tiles; _b < tiles_1.length; _b++) {
                    var tile = tiles_1[_b];
                    console.log("drawing " + tile.xIndex + ", " + this.topLeft.x);
                    var tileX = (tile.xIndex - this.topLeft.x) * scalingX;
                    var tileY = (tile.yIndex - this.topLeft.y) * scalingY;
                    tile.draw(this.canvasRenderContext, tileX, tileY);
                }
                console.log("got tiles ", tiles);
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
var simpleWorld = new world2d_1.World2D(2, 2, true, false);
var layerProperties = new canvastile_1.ImageStruct();
layerProperties.prefix = "";
layerProperties.suffix = ".png";
layerProperties.tileDir = "images/";
layerProperties.visible = true;
var roadLayerProperties = new canvastile_1.ImageStruct();
roadLayerProperties.prefix = "";
roadLayerProperties.suffix = "b.png";
roadLayerProperties.tileDir = "images/";
roadLayerProperties.visible = true;
var sentinelLayerProperties = new canvastile_1.ImageStruct();
sentinelLayerProperties.prefix = "";
sentinelLayerProperties.suffix = "l.jpeg";
sentinelLayerProperties.tileDir = "images/";
sentinelLayerProperties.visible = true;
var baseLayer = new canvastile_1.ImageTileLayer(1, 1, layerProperties);
var sentinelLayer = new canvastile_1.ImageTileLayer(1, 1, sentinelLayerProperties);
var roadLayer = new canvastile_1.ImageTileLayer(1, 1, roadLayerProperties);
function showMap(divName, name) {
    var canvas = document.getElementById(divName);
    var ctx = canvas.getContext('2d');
    var canvasView = new viewcanvas_1.ViewCanvas(simpleWorld, new point2d_1.Point2D(0, 0), 2, 2, ctx);
    canvasView.addTileLayer(baseLayer);
    canvasView.addTileLayer(sentinelLayer);
    canvasView.addTileLayer(roadLayer);
    canvasView.draw();
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

},{"./geom/point2d":1,"./geom/world2d":4,"./graphics/canvastile":5,"./graphics/viewcanvas":6}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ2VvbS9wb2ludDJkLnRzIiwic3JjL2dlb20vdGlsZS50cyIsInNyYy9nZW9tL3ZpZXdwb3J0LnRzIiwic3JjL2dlb20vd29ybGQyZC50cyIsInNyYy9ncmFwaGljcy9jYW52YXN0aWxlLnRzIiwic3JjL2dyYXBoaWNzL3ZpZXdjYW52YXMudHMiLCJzcmMvc2ltcGxlV29ybGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0NBO0lBT0ksaUJBQVksQ0FBUyxFQUFFLENBQVM7UUFDNUIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBVGtCLFlBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDekIsV0FBRyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQVU1QyxjQUFDO0NBWkQsQUFZQyxJQUFBO0FBWlksMEJBQU87Ozs7O0FDRXBCO0lBRUMsbUJBQW1CLFNBQWlCLEVBQVMsVUFBa0I7UUFBNUMsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUFTLGVBQVUsR0FBVixVQUFVLENBQVE7SUFBRSxDQUFDO0lBTW5FLGdCQUFDO0FBQUQsQ0FSQSxBQVFDLElBQUE7QUFScUIsOEJBQVM7QUFVL0I7SUFJQyxjQUFZLE1BQWMsRUFBRSxNQUFjO0lBQUUsQ0FBQztJQUZ0QyxjQUFTLEdBQVMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUkxQyxXQUFDO0NBTkQsQUFNQyxJQUFBO0FBTlksb0JBQUk7Ozs7O0FDVGpCO0lBRUMsa0JBQVksS0FBYyxFQUFTLE9BQWdCLEVBQVMsTUFBYyxFQUFTLE1BQWM7UUFBOUQsWUFBTyxHQUFQLE9BQU8sQ0FBUztRQUFTLFdB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QVMsQ0FBQyxDQUFDO0lBQ25DLFVBQVUsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDdkMsVUFBVSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUVuQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsQ0FBQztBQUVEO0lBQ0MsT0FBTyxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBRUQsSUFDSSxRQUFRLENBQUMsVUFBVSxLQUFLLFVBQVU7SUFDbEMsQ0FBQyxRQUFRLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQzNFO0lBQ0EsSUFBSSxFQUFFLENBQUM7Q0FDUjtLQUFNO0lBQ0wsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ3JEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXG5leHBvcnQgY2xhc3MgUG9pbnQyRCB7XG4gICAgc3RhdGljIHJlYWRvbmx5IHplcm8gPSBuZXcgUG9pbnQyRCgwLCAwKTtcbiAgICBzdGF0aWMgcmVhZG9ubHkgb25lID0gbmV3IFBvaW50MkQoMSwgMSk7XG5cbiAgICByZWFkb25seSB4OiBudW1iZXI7XG4gICAgcmVhZG9ubHkgeTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcblx0fVxuXG59IiwiaW1wb3J0IHsgVW5pdHMgfSBmcm9tIFwiLi93b3JsZDJkXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4vcG9pbnQyZFwiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVGlsZUxheWVyIHtcblx0XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB0aWxlV2lkdGg6IG51bWJlciwgcHVibGljIHRpbGVIZWlnaHQ6IG51bWJlcil7fVxuXG5cdGFic3RyYWN0IGdldFRpbGUoeFVuaXRzOiBudW1iZXIsIHlVbml0czogbnVtYmVyKTogVGlsZTtcblxuXHRhYnN0cmFjdCBnZXRUaWxlcyhwb3NpdGlvbjogUG9pbnQyRCwgeFdpZHRoOiBudW1iZXIsIHlXaWR0aDogbnVtYmVyKTogQXJyYXk8VGlsZT47XG5cbn1cblxuZXhwb3J0IGNsYXNzIFRpbGUge1xuXHRcblx0c3RhdGljIGVtcHR5VGlsZTogVGlsZSA9IG5ldyBUaWxlKC0xLC0xKTtcblxuXHRjb25zdHJ1Y3Rvcih4SW5kZXg6IG51bWJlciwgeUluZGV4OiBudW1iZXIpe31cblxufSIsImltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi9wb2ludDJkXCI7XG5pbXBvcnQgeyBWZWN0b3IyRCB9IGZyb20gXCIuL3ZlY3RvcjJkXCI7XG5pbXBvcnQgeyBXb3JsZDJELCBVbml0cyB9IGZyb20gXCIuL3dvcmxkMmRcIjtcblxuZXhwb3J0IGNsYXNzIFZpZXdwb3J0IHtcblx0XG5cdGNvbnN0cnVjdG9yKHdvcmxkOiBXb3JsZDJELCBwdWJsaWMgdG9wTGVmdDogUG9pbnQyRCwgcHVibGljIHhXaWR0aDogbnVtYmVyLCBwdWJsaWMgeVdpZHRoOiBudW1iZXIpe31cblxuXHRzZXRWaWV3KHhXaWR0aDogVW5pdHMsIHlXaWR0aDogVW5pdHMpe307XG5cbn0iLCJpbXBvcnQgeyBUaWxlTGF5ZXIyRCB9IGZyb20gXCIuL3RpbGUyZFwiO1xuXG5leHBvcnQgY2xhc3MgVW5pdHMge1xuXG5cdHN0YXRpYyByZWFkb25seSBXZWJXVSA9IG5ldyBVbml0cyhcIk1lcmNhdG9yIFdlYiBXb3JsZCBVbml0c1wiKTtcblxuXHRjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpe31cblxufVxuLyoqXG4gIEEgd29ybGQgaXMgdGhlIGJhc2UgdGhhdCBhbGwgb3RoZXIgZWxlbWVudHMgb3JpZW50YXRlIGZyb20gXG4qKi9cbmV4cG9ydCBjbGFzcyBXb3JsZDJEIHtcblxuXHRwcml2YXRlIHRpbGVMYXllcnM6IEFycmF5PFRpbGVMYXllcjJEPiA9IFtdO1xuXHRcblx0Y29uc3RydWN0b3IobnVtYmVyLCB5VW5pdHM6IG51bWJlciwgd3JhcFg6IGJvb2xlYW4sIHdyYXBZOiBib29sZWFuKXt9XG5cbiAgICBhZGRUaWxlTGF5ZXIodGlsZUxheWVyOiBUaWxlTGF5ZXIyRCk6IG51bWJlciB7XG4gICAgXHRyZXR1cm4gdGhpcy50aWxlTGF5ZXJzLnB1c2godGlsZUxheWVyKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBUaWxlLCBUaWxlTGF5ZXIgfSBmcm9tIFwiLi4vZ2VvbS90aWxlXCI7XG5pbXBvcnQgeyBQb2ludDJEIH0gZnJvbSBcIi4uL2dlb20vcG9pbnQyZFwiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2FudmFzVGlsZSBleHRlbmRzIFRpbGUge1xuXG5cdGFic3RyYWN0IGRyYXcoY2FudmFzOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNhbnZhc1g6IG51bWJlciwgY2FudmFzWTogbnVtYmVyKTogdm9pZDtcblxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2VTdHJ1Y3Qge1xuXG5cdHByZWZpeDogc3RyaW5nO1xuXHRzdWZmaXg6IHN0cmluZztcblx0dGlsZURpcjogc3RyaW5nO1xuXHR2aXNpYmxlOiBib29sZWFuO1xuXG59XG5cbmV4cG9ydCBjbGFzcyBJbWFnZVRpbGUgZXh0ZW5kcyBDYW52YXNUaWxlIHtcblxuXHRwcml2YXRlIGltZzogSFRNTEltYWdlRWxlbWVudDtcblxuXHRjb25zdHJ1Y3RvcihyZWFkb25seSB4SW5kZXg6IG51bWJlciwgcmVhZG9ubHkgeUluZGV4OiBudW1iZXIsIGltYWdlU3JjOiBzdHJpbmcpIHtcblx0XHRzdXBlcih4SW5kZXgsIHlJbmRleCk7XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0fTtcblxuXHRkcmF3KGNhbnZhczogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBjYW52YXNYOiBudW1iZXIsIGNhbnZhc1k6IG51bWJlcikge1xuXHRcdGlmICh0aGlzLmltZy5jb21wbGV0ZSkge1xuXHRcdFx0Y2FudmFzLmRyYXdJbWFnZSh0aGlzLmltZywgY2FudmFzWCwgY2FudmFzWSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5pbWcub25sb2FkID0gKGV2ZW50KSA9PiB7XG5cdFx0XHRcdGNhbnZhcy5kcmF3SW1hZ2UodGhpcy5pbWcsIGNhbnZhc1gsIGNhbnZhc1kpO1xuXHRcdFx0fTtcblx0XHR9XG5cdH07XG5cbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlVGlsZUxheWVyIGV4dGVuZHMgVGlsZUxheWVyIHtcblxuXHRyZWFkb25seSBpbWFnZVByb3BlcnRpZXM6IEltYWdlU3RydWN0O1xuXG5cdGNvbnN0cnVjdG9yKHRpbGVXaWR0aDogbnVtYmVyLCB0aWxlSGVpZ2h0OiBudW1iZXIsIGltYWdlUHJvcGVydGllczogSW1hZ2VTdHJ1Y3QpIHtcblx0XHRzdXBlcih0aWxlV2lkdGgsIHRpbGVIZWlnaHQpO1xuXHRcdHRoaXMuaW1hZ2VQcm9wZXJ0aWVzID0gaW1hZ2VQcm9wZXJ0aWVzO1xuXHR9XG5cblx0LyoqXG5cdCAgbGVhdmUgY2FjaGluZyB1cCB0byB0aGUgYnJvd3NlclxuXHQqKi9cblx0Z2V0VGlsZSh4VW5pdHM6IG51bWJlciwgeVVuaXRzOiBudW1iZXIpOiBUaWxlIHtcblx0XHRsZXQgaW1hZ2VTcmMgPSB0aGlzLmltYWdlUHJvcGVydGllcy50aWxlRGlyICsgXG5cdFx0XHR0aGlzLmltYWdlUHJvcGVydGllcy5wcmVmaXggKyB4VW5pdHMgKyBcIl9cIiArIHlVbml0cyArIHRoaXMuaW1hZ2VQcm9wZXJ0aWVzLnN1ZmZpeDtcblx0XHRyZXR1cm4gbmV3IEltYWdlVGlsZSh4VW5pdHMsIHlVbml0cywgaW1hZ2VTcmMpO1xuXHR9XG5cblx0Z2V0VGlsZXMocG9zaXRpb246IFBvaW50MkQsIHhXaWR0aDogbnVtYmVyLCB5V2lkdGg6IG51bWJlcik6IEFycmF5PFRpbGU+IHtcblxuXHRcdGxldCBmaXJzdFggPSBNYXRoLmZsb29yKHBvc2l0aW9uLnggLyB0aGlzLnRpbGVXaWR0aCk7XG5cdFx0bGV0IGxhc3RYID0gTWF0aC5jZWlsKChwb3NpdGlvbi54ICsgeFdpZHRoKS8gdGhpcy50aWxlV2lkdGgpO1xuXG5cdFx0bGV0IGZpcnN0WSA9IE1hdGguZmxvb3IocG9zaXRpb24ueSAvIHRoaXMudGlsZUhlaWdodCk7XG5cdFx0bGV0IGxhc3RZID0gTWF0aC5jZWlsKChwb3NpdGlvbi55ICsgeVdpZHRoKS8gdGhpcy50aWxlSGVpZ2h0KTtcblxuXHRcdGxldCB0aWxlcyA9IG5ldyBBcnJheTxUaWxlPigpO1xuXG5cdFx0Zm9yICh2YXIgeD1maXJzdFg7IHg8bGFzdFg7IHgrKyl7XG5cdFx0XHRmb3IgKHZhciB5PWZpcnN0WTsgeTxsYXN0WTsgeSsrKXtcblx0XHRcdFx0dGlsZXMucHVzaCh0aGlzLmdldFRpbGUoeCwgeSkpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRpbGVzO1xuXHR9XG59XG4iLCJpbXBvcnQgeyBWaWV3cG9ydCB9IGZyb20gXCIuLi9nZW9tL3ZpZXdwb3J0XCI7XG5pbXBvcnQgeyBXb3JsZDJEIH0gZnJvbSBcIi4uL2dlb20vd29ybGQyZFwiO1xuaW1wb3J0IHsgUG9pbnQyRCB9IGZyb20gXCIuLi9nZW9tL3BvaW50MmRcIjtcbmltcG9ydCB7IEltYWdlVGlsZSwgSW1hZ2VUaWxlTGF5ZXIgfSBmcm9tIFwiLi9jYW52YXN0aWxlXCI7XG5cbmV4cG9ydCBjbGFzcyBWaWV3Q2FudmFzIGV4dGVuZHMgVmlld3BvcnQge1xuXG4gICAgcHJpdmF0ZSBpbWFnZVRpbGVMYXllcnMgPSBbXTtcblxuICAgIGNvbnN0cnVjdG9yKHdvcmxkOiBXb3JsZDJELCB0b3BMZWZ0OiBQb2ludDJELCByZWFkb25seSB4V2lkdGg6IG51bWJlciwgcmVhZG9ubHkgeVdpZHRoOiBudW1iZXIsIFxuICAgIFx0cmVhZG9ubHkgY2FudmFzUmVuZGVyQ29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKSB7XG5cbiAgICBcdHN1cGVyKHdvcmxkLCB0b3BMZWZ0LCB4V2lkdGgsIHlXaWR0aCk7XG5cbiAgICBcdHRoaXMuY2FudmFzUmVuZGVyQ29udGV4dC5jYW52YXMud2lkdGggPSB0aGlzLmNhbnZhc1JlbmRlckNvbnRleHQuY2FudmFzLmNsaWVudFdpZHRoO1xuICAgIFx0dGhpcy5jYW52YXNSZW5kZXJDb250ZXh0LmNhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhc1JlbmRlckNvbnRleHQuY2FudmFzLmNsaWVudEhlaWdodDtcbiAgICB9XG5cbiAgICBhZGRUaWxlTGF5ZXIoaW1hZ2VUaWxlTGF5ZXI6IEltYWdlVGlsZUxheWVyKTogdm9pZCB7XG4gICAgXHR0aGlzLmltYWdlVGlsZUxheWVycy5wdXNoKGltYWdlVGlsZUxheWVyKTtcbiAgICB9XG5cbiAgICBkcmF3KCk6IHZvaWQge1xuXG4gICAgXHR2YXIgc2NhbGluZ1ggPSB0aGlzLmNhbnZhc1JlbmRlckNvbnRleHQuY2FudmFzLmNsaWVudFdpZHRoIC8gdGhpcy54V2lkdGg7XG4gICAgXHR2YXIgc2NhbGluZ1kgPSB0aGlzLmNhbnZhc1JlbmRlckNvbnRleHQuY2FudmFzLmNsaWVudEhlaWdodCAvIHRoaXMueVdpZHRoO1xuICAgIFx0Y29uc29sZS5sb2coXCJzY2FsaW5nIFwiLCBzY2FsaW5nWCwgc2NhbGluZ1kpO1xuXG4gICAgXHRmb3IgKGxldCB2YWx1ZSBvZiB0aGlzLmltYWdlVGlsZUxheWVycyl7XG4gICAgXHRcdGlmICh2YWx1ZS5pbWFnZVByb3BlcnRpZXMudmlzaWJsZSkge1xuICAgIFx0XHRcdGxldCB0aWxlczogQXJyYXk8SW1hZ2VUaWxlPiA9IHZhbHVlLmdldFRpbGVzKHRoaXMudG9wTGVmdCwgdGhpcy54V2lkdGgsIHRoaXMueVdpZHRoKTtcblxuICAgIFx0XHRcdGZvciAobGV0IHRpbGUgb2YgdGlsZXMpe1xuICAgIFx0XHRcdFx0Y29uc29sZS5sb2coXCJkcmF3aW5nIFwiICsgdGlsZS54SW5kZXggKyBcIiwgXCIgKyB0aGlzLnRvcExlZnQueClcbiAgICBcdFx0XHRcdHZhciB0aWxlWCA9ICh0aWxlLnhJbmRleCAtIHRoaXMudG9wTGVmdC54KSAqIHNjYWxpbmdYO1xuICAgIFx0XHRcdFx0dmFyIHRpbGVZID0gKHRpbGUueUluZGV4IC0gdGhpcy50b3BMZWZ0LnkpICogc2NhbGluZ1k7XG5cbiAgICBcdFx0XHRcdHRpbGUuZHJhdyh0aGlzLmNhbnZhc1JlbmRlckNvbnRleHQsIHRpbGVYLCB0aWxlWSk7XG4gICAgXHRcdFx0fVxuICAgIFx0XHRcdGNvbnNvbGUubG9nKFwiZ290IHRpbGVzIFwiLCB0aWxlcyk7XG4gICAgXHRcdH1cbiAgICBcdH1cbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBXb3JsZDJEIH0gZnJvbSBcIi4vZ2VvbS93b3JsZDJkXCI7XG5pbXBvcnQgeyBWaWV3cG9ydCB9IGZyb20gXCIuL2dlb20vdmlld3BvcnRcIjtcbmltcG9ydCB7IFBvaW50MkQgfSBmcm9tIFwiLi9nZW9tL3BvaW50MmRcIjtcbmltcG9ydCB7IEltYWdlVGlsZUxheWVyLCBJbWFnZVN0cnVjdCB9IGZyb20gXCIuL2dyYXBoaWNzL2NhbnZhc3RpbGVcIjtcbmltcG9ydCB7IFZpZXdDYW52YXMgfSBmcm9tIFwiLi9ncmFwaGljcy92aWV3Y2FudmFzXCI7XG5cbmxldCBzaW1wbGVXb3JsZCA9IG5ldyBXb3JsZDJEKDIsIDIsIHRydWUsIGZhbHNlKTtcblxubGV0IGxheWVyUHJvcGVydGllcyA9IG5ldyBJbWFnZVN0cnVjdCgpO1xubGF5ZXJQcm9wZXJ0aWVzLnByZWZpeCA9IFwiXCI7XG5sYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCIucG5nXCI7XG5sYXllclByb3BlcnRpZXMudGlsZURpciA9IFwiaW1hZ2VzL1wiO1xubGF5ZXJQcm9wZXJ0aWVzLnZpc2libGUgPSB0cnVlO1xuXG5cbmxldCByb2FkTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG5yb2FkTGF5ZXJQcm9wZXJ0aWVzLnByZWZpeCA9IFwiXCI7XG5yb2FkTGF5ZXJQcm9wZXJ0aWVzLnN1ZmZpeCA9IFwiYi5wbmdcIjtcbnJvYWRMYXllclByb3BlcnRpZXMudGlsZURpciA9IFwiaW1hZ2VzL1wiO1xucm9hZExheWVyUHJvcGVydGllcy52aXNpYmxlID0gdHJ1ZTtcblxubGV0IHNlbnRpbmVsTGF5ZXJQcm9wZXJ0aWVzID0gbmV3IEltYWdlU3RydWN0KCk7XG5zZW50aW5lbExheWVyUHJvcGVydGllcy5wcmVmaXggPSBcIlwiO1xuc2VudGluZWxMYXllclByb3BlcnRpZXMuc3VmZml4ID0gXCJsLmpwZWdcIjtcbnNlbnRpbmVsTGF5ZXJQcm9wZXJ0aWVzLnRpbGVEaXIgPSBcImltYWdlcy9cIjtcbnNlbnRpbmVsTGF5ZXJQcm9wZXJ0aWVzLnZpc2libGUgPSB0cnVlO1xuXG5sZXQgYmFzZUxheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKDEsIDEsIGxheWVyUHJvcGVydGllcyk7XG5sZXQgc2VudGluZWxMYXllciA9IG5ldyBJbWFnZVRpbGVMYXllcigxLCAxLCBzZW50aW5lbExheWVyUHJvcGVydGllcyk7XG5sZXQgcm9hZExheWVyID0gbmV3IEltYWdlVGlsZUxheWVyKDEsIDEsIHJvYWRMYXllclByb3BlcnRpZXMpO1xuXG5mdW5jdGlvbiBzaG93TWFwKGRpdk5hbWU6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpdk5hbWUpO1xuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHRsZXQgY2FudmFzVmlldyA9IG5ldyBWaWV3Q2FudmFzKHNpbXBsZVdvcmxkLCBuZXcgUG9pbnQyRCgwLCAwKSwgMiwgMiwgY3R4KTtcblx0Y2FudmFzVmlldy5hZGRUaWxlTGF5ZXIoYmFzZUxheWVyKTtcblx0Y2FudmFzVmlldy5hZGRUaWxlTGF5ZXIoc2VudGluZWxMYXllcik7XG5cdGNhbnZhc1ZpZXcuYWRkVGlsZUxheWVyKHJvYWRMYXllcik7XG5cblx0Y2FudmFzVmlldy5kcmF3KCk7XG59XG5cbmZ1bmN0aW9uIHNob3coKXtcblx0c2hvd01hcChcImNhbnZhc1wiLCBcIlR5cGVTY3JpcHRcIik7XG59XG5cbmlmIChcbiAgICBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgfHxcbiAgICAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gXCJsb2FkaW5nXCIgJiYgIWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5kb1Njcm9sbClcbikge1xuICBzaG93KCk7XG59IGVsc2Uge1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBzaG93KTtcbn1cblxuIl19
