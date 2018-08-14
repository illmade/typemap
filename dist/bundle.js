(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
exports.__esModule = true;
var view_1 = require("./view");
var CanvasLayer = /** @class */ (function () {
    function CanvasLayer(worldState) {
        this.worldState = worldState;
    }
    return CanvasLayer;
}());
exports.CanvasLayer = CanvasLayer;
var DrawLayer = /** @class */ (function (_super) {
    __extends(DrawLayer, _super);
    function DrawLayer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DrawLayer.prototype.prepareCtx = function (ctx, transform, width, height) {
        var widthTranslate = width * transform.zoomX;
        var heightTranslate = height * transform.zoomY;
        ctx.translate(-widthTranslate / 2, -heightTranslate / 2);
        ctx.rotate(transform.rotation);
        ctx.translate(widthTranslate / 2 + transform.x, heightTranslate / 2 + transform.y);
        ctx.scale(transform.zoomX, transform.zoomY);
    };
    DrawLayer.prototype.cleanCtx = function (ctx, transform, width, height) {
        ctx.scale(1 / transform.zoomX, 1 / transform.zoomY);
        ctx.translate(-transform.x, -transform.y);
        ctx.rotate(-transform.rotation);
    };
    return DrawLayer;
}(CanvasLayer));
exports.DrawLayer = DrawLayer;
var CanvasView = /** @class */ (function (_super) {
    __extends(CanvasView, _super);
    function CanvasView(worldState, width, height, canvasElement) {
        var _this = _super.call(this, worldState.x, worldState.y, width, height, worldState.zoomX, worldState.zoomY, worldState.rotation) || this;
        _this.canvasElement = canvasElement;
        _this.layers = [];
        _this.initCanvas();
        _this.ctx = canvasElement.getContext("2d");
        return _this;
    }
    CanvasView.prototype.draw = function () {
        var transform = view_1.toTransform(this);
        for (var _i = 0, _a = this.layers; _i < _a.length; _i++) {
            var layer = _a[_i];
            layer.draw(this.ctx, transform);
        }
    };
    CanvasView.prototype.initCanvas = function () {
        var width = this.canvasElement.clientWidth;
        var height = this.canvasElement.clientHeight;
        this.canvasElement.width = width;
        this.canvasElement.height = height;
    };
    return CanvasView;
}(view_1.BasicViewElement));
exports.CanvasView = CanvasView;

},{"./view":4}],2:[function(require,module,exports){
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
exports.__esModule = true;
var canvasview_1 = require("./canvasview");
var ImageLayer = /** @class */ (function (_super) {
    __extends(ImageLayer, _super);
    function ImageLayer(worldState, opacity) {
        var _this = _super.call(this, worldState) || this;
        _this.visible = true;
        _this.opacity = 1.0;
        _this.layers = [];
        _this.opacity = opacity;
        return _this;
    }
    ;
    ImageLayer.prototype.isVisible = function () {
        return this.visible;
    };
    ImageLayer.prototype.setVisible = function (visible) {
        this.visible = visible;
    };
    ImageLayer.prototype.getOpacity = function () {
        return this.opacity;
    };
    ImageLayer.prototype.setOpacity = function (opacity) {
        this.opacity = opacity;
    };
    ImageLayer.prototype.draw = function (ctx, transform) {
        var layerTransform = transform.modify(this.worldState);
        for (var _i = 0, _a = this.layers; _i < _a.length; _i++) {
            var layer = _a[_i];
            layer.draw(ctx, layerTransform);
        }
    };
    return ImageLayer;
}(canvasview_1.CanvasLayer));
exports.ImageLayer = ImageLayer;

},{"./canvasview":1}],3:[function(require,module,exports){
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
exports.__esModule = true;
var canvasview_1 = require("./canvasview");
var StaticImage = /** @class */ (function (_super) {
    __extends(StaticImage, _super);
    function StaticImage(worldState, imageSrc, opacity) {
        var _this = _super.call(this, worldState) || this;
        _this.opacity = opacity;
        _this.visible = true;
        _this.img = new Image();
        _this.img.src = imageSrc;
        return _this;
    }
    ;
    StaticImage.prototype.isVisible = function () {
        return this.visible;
    };
    StaticImage.prototype.setVisible = function (visible) {
        this.visible = visible;
    };
    StaticImage.prototype.getOpacity = function () {
        return this.opacity;
    };
    StaticImage.prototype.setOpacity = function (opacity) {
        this.opacity = opacity;
    };
    StaticImage.prototype.drawImage = function (ctx, transform) {
        var ctxTransform = transform.modify(this.worldState);
        var width = this.img.width * ctxTransform.zoomX;
        var height = this.img.height * ctxTransform.zoomY;
        this.prepareCtx(ctx, ctxTransform, width, height);
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(this.img, 0, 0);
        ctx.globalAlpha = 1;
        this.cleanCtx(ctx, ctxTransform);
    };
    StaticImage.prototype.draw = function (ctx, transform) {
        var _this = this;
        if (this.visible) {
            if (this.img.complete) {
                this.drawImage(ctx, transform);
            }
            else {
                this.img.onload = function (event) {
                    _this.img.crossOrigin = "Anonymous";
                    _this.drawImage(ctx, transform);
                };
            }
        }
    };
    ;
    return StaticImage;
}(canvasview_1.DrawLayer));
exports.StaticImage = StaticImage;

},{"./canvasview":1}],4:[function(require,module,exports){
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
exports.__esModule = true;
var BasicState = /** @class */ (function () {
    function BasicState(x, y, zoomX, zoomY, rotation) {
        this.x = x;
        this.y = y;
        this.zoomX = zoomX;
        this.zoomY = zoomY;
        this.rotation = rotation;
    }
    return BasicState;
}());
exports.BasicState = BasicState;
var Transform = /** @class */ (function (_super) {
    __extends(Transform, _super);
    function Transform() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Transform.prototype.copy = function () {
        return new BasicState(this.x, this.y, this.zoomX, this.zoomY, this.rotation);
    };
    Transform.prototype.modify = function (worldState) {
        var zoomX = this.zoomX * worldState.zoomX;
        console.log("modified " + this.zoomX + " to " + zoomX);
        var zoomY = this.zoomY * worldState.zoomY;
        console.log("modified " + this.zoomY + " by " + worldState.zoomY + " to " + zoomY);
        var x = (this.x * this.zoomX) + worldState.x;
        var y = (this.y * this.zoomY) + worldState.y;
        var rotation = this.rotation + worldState.rotation;
        return new Transform(x, y, zoomX, zoomY, rotation);
    };
    return Transform;
}(BasicState));
exports.Transform = Transform;
function toTransform(worldState) {
    return new Transform(worldState.x, worldState.y, worldState.zoomX, worldState.zoomY, worldState.rotation);
}
exports.toTransform = toTransform;
var BasicViewElement = /** @class */ (function () {
    function BasicViewElement(x, y, width, height, zoomX, zoomY, rotation) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.zoomX = zoomX;
        this.zoomY = zoomY;
        this.rotation = rotation;
    }
    return BasicViewElement;
}());
exports.BasicViewElement = BasicViewElement;

},{}],5:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var canvasview_1 = require("./gtwo/canvasview");
var static_1 = require("./gtwo/static");
var view_1 = require("./gtwo/view");
var layer_1 = require("./gtwo/layer");
function showMap(divName, name) {
    var canvas = document.getElementById(divName);
    var worldState = new view_1.BasicState(0, 0, 1, 1, 0);
    var canvasView = new canvasview_1.CanvasView(worldState, canvas.clientWidth, canvas.clientHeight, canvas);
    var layerState = new view_1.BasicState(0, 0, 4, 4, 0);
    var imageLayer = new layer_1.ImageLayer(layerState, 1);
    var imageState = new view_1.BasicState(10, 10, 0.15, 0.15, 0);
    var helloImage = new static_1.StaticImage(imageState, "images/mater.png", .5);
    var lctx = canvas.getContext("2d");
    lctx.fillRect(0, 0, 50, 50);
    lctx.fillStyle = "red";
    lctx.fillRect(0, 0, 10, 10);
    var rotateState = new view_1.BasicState(50, 50, 0.10, 0.10, Math.PI / 6);
    var nextImage = new static_1.StaticImage(rotateState, "images/rutland.png", 0.8);
    imageLayer.layers.push(helloImage);
    imageLayer.layers.push(nextImage);
    canvasView.layers.push(imageLayer);
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

},{"./gtwo/canvasview":1,"./gtwo/layer":2,"./gtwo/static":3,"./gtwo/view":4}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZ3R3by9jYW52YXN2aWV3LnRzIiwic3JjL2d0d28vbGF5ZXIudHMiLCJzcmMvZ3R3by9zdGF0aWMudHMiLCJzcmMvZ3R3by92aWV3LnRzIiwic3JjL3NpbXBsZVdvcmxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0FDQUEsK0JBQTBGO0FBRTFGO0lBRUMscUJBQTRCLFVBQXNCO1FBQXRCLGVBQVUsR0FBVixVQUFVLENBQVk7SUFBRSxDQUFDO0lBSXRELGtCQUFDO0FBQUQsQ0FOQSxBQU1DLElBQUE7QUFOcUIsa0NBQVc7QUFRakM7SUFBd0MsNkJBQVc7SUFBbkQ7O0lBc0JBLENBQUM7SUFwQmEsOEJBQVUsR0FBcEIsVUFBcUIsR0FBNkIsRUFBRSxTQUFvQixFQUN2RSxLQUFhLEVBQUUsTUFBYztRQUU3QixJQUFJLGNBQWMsR0FBRyxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztRQUM3QyxJQUFJLGVBQWUsR0FBRyxNQUFNLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztRQUdsRCxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsY0FBYyxHQUFDLENBQUMsRUFBRSxDQUFDLGVBQWUsR0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRCxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvQixHQUFHLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsRUFBRSxlQUFlLEdBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvRSxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFUyw0QkFBUSxHQUFsQixVQUFtQixHQUE2QixFQUFFLFNBQW9CLEVBQ3JF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QUcsQ0FBQyxDQUFDO0lBRXhFLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ25DLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2xDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ25DLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN0QixDQUFDO0FBRUQsU0FBUyxJQUFJO0lBQ1osT0FBTyxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBRUQsSUFDSSxRQUFRLENBQUMsVUFBVSxLQUFLLFVBQVU7SUFDbEMsQ0FBQyxRQUFRLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQzNFO0lBQ0QsSUFBSSxFQUFFLENBQUM7Q0FDUDtLQUFNO0lBQ04sUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ3BEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IHsgdG9UcmFuc2Zvcm0sIFdvcmxkU3RhdGUsIFZpZXdFbGVtZW50LCBCYXNpY1ZpZXdFbGVtZW50LCBUcmFuc2Zvcm0gfSBmcm9tIFwiLi92aWV3XCJcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENhbnZhc0xheWVyIHtcblxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgd29ybGRTdGF0ZTogV29ybGRTdGF0ZSl7fVxuXG5cdGFic3RyYWN0IGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHRyYW5zZm9ybTogVHJhbnNmb3JtKTtcblxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRHJhd0xheWVyIGV4dGVuZHMgQ2FudmFzTGF5ZXIge1xuXG4gICAgcHJvdGVjdGVkIHByZXBhcmVDdHgoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHRyYW5zZm9ybTogVHJhbnNmb3JtLCBcbiAgICBcdHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogdm9pZCB7XG5cbiAgICBcdGxldCB3aWR0aFRyYW5zbGF0ZSA9IHdpZHRoICogdHJhbnNmb3JtLnpvb21YO1xuICAgIFx0bGV0IGhlaWdodFRyYW5zbGF0ZSA9IGhlaWdodCAqIHRyYW5zZm9ybS56b29tWTtcblxuXG5cdFx0Y3R4LnRyYW5zbGF0ZSgtd2lkdGhUcmFuc2xhdGUvMiwgLWhlaWdodFRyYW5zbGF0ZS8yKTtcblx0XHRjdHgucm90YXRlKHRyYW5zZm9ybS5yb3RhdGlvbik7XG5cdFx0Y3R4LnRyYW5zbGF0ZSh3aWR0aFRyYW5zbGF0ZS8yICsgdHJhbnNmb3JtLngsIGhlaWdodFRyYW5zbGF0ZS8yICsgdHJhbnNmb3JtLnkpO1xuXHRcdGN0eC5zY2FsZSh0cmFuc2Zvcm0uem9vbVgsIHRyYW5zZm9ybS56b29tWSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNsZWFuQ3R4KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB0cmFuc2Zvcm06IFRyYW5zZm9ybSwgXG4gICAgXHR3aWR0aD86IG51bWJlciwgaGVpZ2h0PzogbnVtYmVyKTogdm9pZCB7XG4gICAgXHRcblx0XHRjdHguc2NhbGUoMS90cmFuc2Zvcm0uem9vbVgsIDEvdHJhbnNmb3JtLnpvb21ZKTtcblx0XHRjdHgudHJhbnNsYXRlKC10cmFuc2Zvcm0ueCwgLXRyYW5zZm9ybS55KTtcblx0XHRjdHgucm90YXRlKC10cmFuc2Zvcm0ucm90YXRpb24pO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIENhbnZhc1ZpZXcgZXh0ZW5kcyBCYXNpY1ZpZXdFbGVtZW50IGltcGxlbWVudHMgVmlld0VsZW1lbnQge1xuXG5cdGxheWVyczogQXJyYXk8Q2FudmFzTGF5ZXI+ID0gW107XG5cdGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHdvcmxkU3RhdGU6IFdvcmxkU3RhdGUsIFxuXHRcdHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBcblx0XHRyZWFkb25seSBjYW52YXNFbGVtZW50OiBIVE1MQ2FudmFzRWxlbWVudCl7XG5cblx0XHRzdXBlcih3b3JsZFN0YXRlLngsIHdvcmxkU3RhdGUueSwgd2lkdGgsIGhlaWdodCwgXG5cdFx0XHR3b3JsZFN0YXRlLnpvb21YLCB3b3JsZFN0YXRlLnpvb21ZLCBcblx0XHRcdHdvcmxkU3RhdGUucm90YXRpb24pO1xuXG5cdFx0dGhpcy5pbml0Q2FudmFzKCk7XG5cblx0XHR0aGlzLmN0eCA9IGNhbnZhc0VsZW1lbnQuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHR9XG5cblx0ZHJhdygpe1xuXHRcdGxldCB0cmFuc2Zvcm0gPSB0b1RyYW5zZm9ybSh0aGlzKTtcblx0XHRmb3IgKGxldCBsYXllciBvZiB0aGlzLmxheWVycyl7XG5cdFx0XHRsYXllci5kcmF3KHRoaXMuY3R4LCB0cmFuc2Zvcm0pO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgaW5pdENhbnZhcygpe1xuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLmNhbnZhc0VsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLmNhbnZhc0VsZW1lbnQuY2xpZW50SGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQuaGVpZ2h0ID0gaGVpZ2h0O1xuXHR9XG5cbn0iLCJpbXBvcnQgeyBUcmFuc2Zvcm0sIFdvcmxkU3RhdGUgfSBmcm9tIFwiLi92aWV3XCI7XG5pbXBvcnQgeyBDYW52YXNMYXllciB9IGZyb20gXCIuL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IERpc3BsYXlFbGVtZW50IH0gZnJvbSBcIi4vZGlzcGxheVwiO1xuXG5leHBvcnQgY2xhc3MgSW1hZ2VMYXllciBleHRlbmRzIENhbnZhc0xheWVyIGltcGxlbWVudHMgRGlzcGxheUVsZW1lbnQge1xuXG5cdHByaXZhdGUgdmlzaWJsZSA9IHRydWU7XG5cdHByaXZhdGUgb3BhY2l0eSA9IDEuMDtcblx0cHVibGljIGxheWVyczogQXJyYXk8Q2FudmFzTGF5ZXI+ID0gW107XG5cblx0Y29uc3RydWN0b3Iod29ybGRTdGF0ZTogV29ybGRTdGF0ZSwgb3BhY2l0eTogbnVtYmVyKSB7XG5cdFx0c3VwZXIod29ybGRTdGF0ZSk7XG5cdFx0dGhpcy5vcGFjaXR5ID0gb3BhY2l0eTtcblx0fTtcblxuXHRpc1Zpc2libGUoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudmlzaWJsZTtcblx0fVxuXG5cdHNldFZpc2libGUodmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xuXHRcdHRoaXMudmlzaWJsZSA9IHZpc2libGU7XG5cdH1cblxuXHRnZXRPcGFjaXR5KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMub3BhY2l0eTtcblx0fVxuXG5cdHNldE9wYWNpdHkob3BhY2l0eTogbnVtYmVyKTogdm9pZCB7XG5cdFx0dGhpcy5vcGFjaXR5ID0gb3BhY2l0eTtcblx0fVxuXG5cdGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHRyYW5zZm9ybTogVHJhbnNmb3JtKXtcblx0XHRsZXQgbGF5ZXJUcmFuc2Zvcm0gPSB0cmFuc2Zvcm0ubW9kaWZ5KHRoaXMud29ybGRTdGF0ZSk7XG5cdFx0Zm9yIChsZXQgbGF5ZXIgb2YgdGhpcy5sYXllcnMpe1xuXHRcdFx0bGF5ZXIuZHJhdyhjdHgsIGxheWVyVHJhbnNmb3JtKTtcblx0XHR9XG5cdH1cblxufSIsImltcG9ydCB7IFRyYW5zZm9ybSwgV29ybGRTdGF0ZSB9IGZyb20gXCIuL3ZpZXdcIjtcbmltcG9ydCB7IERyYXdMYXllciwgQ2FudmFzTGF5ZXIgfSBmcm9tIFwiLi9jYW52YXN2aWV3XCI7XG5pbXBvcnQgeyBEaXNwbGF5RWxlbWVudCB9IGZyb20gXCIuL2Rpc3BsYXlcIjtcblxuZXhwb3J0IGNsYXNzIFN0YXRpY0ltYWdlIGV4dGVuZHMgRHJhd0xheWVyIGltcGxlbWVudHMgRGlzcGxheUVsZW1lbnQge1xuXG5cdHByaXZhdGUgaW1nOiBIVE1MSW1hZ2VFbGVtZW50O1xuXG5cdHByaXZhdGUgdmlzaWJsZSA9IHRydWU7XG5cblx0Y29uc3RydWN0b3Iod29ybGRTdGF0ZTogV29ybGRTdGF0ZSwgXG5cdFx0aW1hZ2VTcmM6IHN0cmluZywgXG5cdFx0cHVibGljIG9wYWNpdHk6IG51bWJlcikge1xuXG5cdFx0c3VwZXIod29ybGRTdGF0ZSk7XG5cdFx0XG5cdFx0dGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLmltZy5zcmMgPSBpbWFnZVNyYztcblx0fTtcblxuXHRpc1Zpc2libGUoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudmlzaWJsZTtcblx0fVxuXG5cdHNldFZpc2libGUodmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xuXHRcdHRoaXMudmlzaWJsZSA9IHZpc2libGU7XG5cdH1cblxuXHRnZXRPcGFjaXR5KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMub3BhY2l0eTtcblx0fVxuXG5cdHNldE9wYWNpdHkob3BhY2l0eTogbnVtYmVyKTogdm9pZCB7XG5cdFx0dGhpcy5vcGFjaXR5ID0gb3BhY2l0eTtcblx0fVxuXG5cdHByaXZhdGUgZHJhd0ltYWdlKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB0cmFuc2Zvcm06IFRyYW5zZm9ybSl7XG5cblx0XHRsZXQgY3R4VHJhbnNmb3JtID0gdHJhbnNmb3JtLm1vZGlmeSh0aGlzLndvcmxkU3RhdGUpO1xuXHRcdGxldCB3aWR0aCA9IHRoaXMuaW1nLndpZHRoICogY3R4VHJhbnNmb3JtLnpvb21YO1xuXHRcdGxldCBoZWlnaHQgPSB0aGlzLmltZy5oZWlnaHQgKiBjdHhUcmFuc2Zvcm0uem9vbVk7XG5cblx0XHR0aGlzLnByZXBhcmVDdHgoY3R4LCBjdHhUcmFuc2Zvcm0sIHdpZHRoLCBoZWlnaHQpO1xuXHRcdFxuXHRcdGN0eC5nbG9iYWxBbHBoYSA9IHRoaXMub3BhY2l0eTtcblxuXHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDApO1xuXHRcdFxuXHRcdGN0eC5nbG9iYWxBbHBoYSA9IDE7XG5cblx0XHR0aGlzLmNsZWFuQ3R4KGN0eCwgY3R4VHJhbnNmb3JtKTtcblxuXHR9XG5cblx0ZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdHJhbnNmb3JtOiBUcmFuc2Zvcm0pe1xuXHRcdGlmICh0aGlzLnZpc2libGUpe1xuXHRcdFx0aWYgKHRoaXMuaW1nLmNvbXBsZXRlKSB7XG5cdFx0XHRcdHRoaXMuZHJhd0ltYWdlKGN0eCwgdHJhbnNmb3JtKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aGlzLmltZy5vbmxvYWQgPSAoZXZlbnQpID0+IHtcblx0XHRcdFx0XHR0aGlzLmltZy5jcm9zc09yaWdpbiA9IFwiQW5vbnltb3VzXCI7XG5cdFx0XHRcdFx0dGhpcy5kcmF3SW1hZ2UoY3R4LCB0cmFuc2Zvcm0pO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxufVxuIiwiLyoqXG4qIEEgd29ybGQgaXMgMCwwIGJhc2VkIGJ1dCBhbnkgZWxlbWVudCBjYW4gYmUgcG9zaXRpb25lZCByZWxhdGl2ZSB0byB0aGlzLlxuKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ybGRTdGF0ZSB7XG5cdHg6IG51bWJlcjtcblx0eTogbnVtYmVyO1xuXHR6b29tWDogbnVtYmVyO1xuXHR6b29tWTogbnVtYmVyO1xuXHRyb3RhdGlvbjogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgQmFzaWNTdGF0ZSBpbXBsZW1lbnRzIFdvcmxkU3RhdGV7XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB4OiBudW1iZXIsIHB1YmxpYyB5OiBudW1iZXIsIFxuXHRcdHB1YmxpYyB6b29tWDogbnVtYmVyLCBwdWJsaWMgem9vbVk6IG51bWJlciwgXG5cdFx0cHVibGljIHJvdGF0aW9uOiBudW1iZXIpe31cbn1cblxuZXhwb3J0IGNsYXNzIFRyYW5zZm9ybSBleHRlbmRzIEJhc2ljU3RhdGUge1xuXG5cdGNvcHkoKXtcblx0XHRyZXR1cm4gbmV3IEJhc2ljU3RhdGUodGhpcy54LCB0aGlzLnksIHRoaXMuem9vbVgsIHRoaXMuem9vbVksIHRoaXMucm90YXRpb24pO1xuXHR9XG5cblx0bW9kaWZ5KHdvcmxkU3RhdGU6IFdvcmxkU3RhdGUpOiBUcmFuc2Zvcm0ge1xuXHRcdGxldCB6b29tWCA9IHRoaXMuem9vbVggKiB3b3JsZFN0YXRlLnpvb21YO1xuXHRcdGNvbnNvbGUubG9nKFwibW9kaWZpZWQgXCIgKyB0aGlzLnpvb21YICsgXCIgdG8gXCIgKyB6b29tWCk7XG5cdFx0bGV0IHpvb21ZID0gdGhpcy56b29tWSAqIHdvcmxkU3RhdGUuem9vbVk7XG5cdFx0Y29uc29sZS5sb2coXCJtb2RpZmllZCBcIiArIHRoaXMuem9vbVkgKyBcIiBieSBcIiArIHdvcmxkU3RhdGUuem9vbVkgKyBcIiB0byBcIiArIHpvb21ZKTtcblx0XHRsZXQgeCA9ICh0aGlzLnggKiB0aGlzLnpvb21YKSArIHdvcmxkU3RhdGUueDtcblx0XHRsZXQgeSA9ICh0aGlzLnkgKiB0aGlzLnpvb21ZKSArIHdvcmxkU3RhdGUueTtcblx0XHRsZXQgcm90YXRpb24gPSB0aGlzLnJvdGF0aW9uICsgd29ybGRTdGF0ZS5yb3RhdGlvbjtcblx0XHRyZXR1cm4gbmV3IFRyYW5zZm9ybSh4LCB5LCB6b29tWCwgem9vbVksIHJvdGF0aW9uKTtcblx0fVxuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b1RyYW5zZm9ybSh3b3JsZFN0YXRlOiBXb3JsZFN0YXRlKTogVHJhbnNmb3JtIHtcblx0cmV0dXJuIG5ldyBUcmFuc2Zvcm0od29ybGRTdGF0ZS54LCB3b3JsZFN0YXRlLnksIFxuXHRcdHdvcmxkU3RhdGUuem9vbVgsIHdvcmxkU3RhdGUuem9vbVksIHdvcmxkU3RhdGUucm90YXRpb24pO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFZpZXdFbGVtZW50IGV4dGVuZHMgV29ybGRTdGF0ZSB7XG5cdHdpZHRoOiBudW1iZXI7XG5cdGhlaWdodDogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgQmFzaWNWaWV3RWxlbWVudCBpbXBsZW1lbnRzIFZpZXdFbGVtZW50IHtcblxuXHRjb25zdHJ1Y3RvcihwdWJsaWMgeDogbnVtYmVyLCBwdWJsaWMgeTogbnVtYmVyLCBcblx0XHRyZWFkb25seSB3aWR0aDogbnVtYmVyLCByZWFkb25seSBoZWlnaHQ6IG51bWJlcixcblx0XHRwdWJsaWMgem9vbVg6IG51bWJlciwgcHVibGljIHpvb21ZOiBudW1iZXIsIFxuXHRcdHB1YmxpYyByb3RhdGlvbjogbnVtYmVyKXt9XG5cbn1cblxuXG5cbiIsImltcG9ydCB7IENhbnZhc1ZpZXcgfSBmcm9tIFwiLi9ndHdvL2NhbnZhc3ZpZXdcIjtcbmltcG9ydCB7IFN0YXRpY0ltYWdlIH0gZnJvbSBcIi4vZ3R3by9zdGF0aWNcIjtcbmltcG9ydCB7IEJhc2ljU3RhdGUgfSBmcm9tIFwiLi9ndHdvL3ZpZXdcIjtcbmltcG9ydCB7IEltYWdlTGF5ZXIgfSBmcm9tIFwiLi9ndHdvL2xheWVyXCI7XG5cblxuZnVuY3Rpb24gc2hvd01hcChkaXZOYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGNhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChkaXZOYW1lKTtcbiAgICBsZXQgd29ybGRTdGF0ZSA9IG5ldyBCYXNpY1N0YXRlKDAsIDAsIDEsIDEsIDApO1xuICAgIGxldCBjYW52YXNWaWV3ID0gbmV3IENhbnZhc1ZpZXcod29ybGRTdGF0ZSwgY2FudmFzLmNsaWVudFdpZHRoLCBjYW52YXMuY2xpZW50SGVpZ2h0LCBjYW52YXMpO1xuXG4gICAgbGV0IGxheWVyU3RhdGUgPSBuZXcgQmFzaWNTdGF0ZSgwLCAwLCA0LCA0LCAwKTtcbiAgICBsZXQgaW1hZ2VMYXllciA9IG5ldyBJbWFnZUxheWVyKGxheWVyU3RhdGUsIDEpO1xuXG4gICAgbGV0IGltYWdlU3RhdGUgPSBuZXcgQmFzaWNTdGF0ZSgxMCwgMTAsIDAuMTUsIDAuMTUsIDApO1xuICAgIGxldCBoZWxsb0ltYWdlID0gbmV3IFN0YXRpY0ltYWdlKGltYWdlU3RhdGUsIFwiaW1hZ2VzL21hdGVyLnBuZ1wiLCAuNSk7XG5cbiAgICBsZXQgbGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgbGN0eC5maWxsUmVjdCgwLCAwLCA1MCwgNTApO1xuICAgIGxjdHguZmlsbFN0eWxlID0gXCJyZWRcIjtcbiAgICBsY3R4LmZpbGxSZWN0KDAsIDAsIDEwLCAxMCk7XG5cbiAgICBsZXQgcm90YXRlU3RhdGUgPSBuZXcgQmFzaWNTdGF0ZSg1MCwgNTAsIDAuMTAsIDAuMTAsIE1hdGguUEkvNik7XG4gICAgbGV0IG5leHRJbWFnZSA9IG5ldyBTdGF0aWNJbWFnZShyb3RhdGVTdGF0ZSwgXCJpbWFnZXMvcnV0bGFuZC5wbmdcIiwgMC44KTtcblxuICAgIGltYWdlTGF5ZXIubGF5ZXJzLnB1c2goaGVsbG9JbWFnZSk7XG4gICAgaW1hZ2VMYXllci5sYXllcnMucHVzaChuZXh0SW1hZ2UpO1xuICAgIGNhbnZhc1ZpZXcubGF5ZXJzLnB1c2goaW1hZ2VMYXllcik7XG4gICAgY2FudmFzVmlldy5kcmF3KCk7XG59XG5cbmZ1bmN0aW9uIHNob3coKXtcblx0c2hvd01hcChcImNhbnZhc1wiLCBcIlR5cGVTY3JpcHRcIik7XG59XG5cbmlmIChcbiAgICBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgfHxcbiAgICAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gXCJsb2FkaW5nXCIgJiYgIWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5kb1Njcm9sbClcbikge1xuXHRzaG93KCk7XG59IGVsc2Uge1xuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBzaG93KTtcbn0iXX0=
