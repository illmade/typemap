import {Point2D} from "./point2d"

interface RasterProjection {

	toPixel(point : Point2D): Point2D;
	
}

interface GeoProjection {

	toLatLong(point: Point2D): Point2D;

}

class VariableProjection implements RasterProjection {
	
	constructor(private pixelRaster : PixelRaster, private zoom : number = 14){

	}

	toPixel(xy : Point2D): Point2D {
		let x = Math.floor(this.pixelRaster.pixelX(xy.x, this.zoom));
		let y = Math.floor(this.pixelRaster.pixelY(xy.y, this.zoom));
		return new Point2D(x, y)
	}
	
}

interface PixelRaster {
	
	pixelX(x : number, zoom : number) : number
	pixelY(y : number, zoom : number) : number
	
}

class GeoRaster implements PixelRaster {
	
	pixelWidth(zoom: number): number {
		return 256.0 * Math.pow(2, zoom)
	} 
	
	radianLength(zoom : number) : number {
		return this.pixelWidth(zoom) / (2.0 * Math.PI);
	}
	
	worldX(longitude : number): number {
		return 128.0 + 256.0 / 360.0 * longitude;
	}
	
	pixelX(longitude : number, zoom : number) : number {
		return this.worldX(longitude) * Math.pow(2, zoom);
	}
	
	worldLongitude(x : number): number {
		return (x - 128.0)  * 360.0 / 256.0;
	}
	
	zoomLongitude(x: number, zoom: number) {
		return this.worldLongitude(x / Math.pow(2, zoom));
	}
	
	atanh(o : number) : number {
		return Math.log((1+Math.sin(o))/Math.cos(o));
	}

	sinh(x: number) : number {
		return (Math.pow(Math.E, x) - Math.pow(Math.E, -x))/2
	}
	
	worldY(latitude : number): number {
		return 128.0 - this.atanh(this.toRadians(latitude)) * 256.0 / (2.00 * Math.PI)
	} 

	pixelY(latitude : number, zoom : number) : number {
		return this.worldY(latitude) * Math.pow(2, zoom);
	}
	
	worldLatitude(y : number): number {
		return this.toDegrees(Math.atan(this.sinh( (128.0 - y) * 2.0 * Math.PI/256 )));
	} 
	
	zoomLatitude(y : number, zoom : number): number {
		return this.worldLatitude(y / Math.pow(2, zoom));
	}

	toDegrees(r: number): number {
		return r * 180 / Math.PI;
	}

	toRadians(o: number): number {
		return o * Math.PI / 180;
	}
	
}