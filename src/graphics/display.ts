export interface DisplayElement {
	isVisible(): boolean;
	setVisible(visible: boolean);
	getOpacity(): number;
}

export interface ImageStruct {
	x: number;
	y: number;
	sx: number;
	sy: number;
	rot: number;
	opacity: number;

	src: string;
	name: string;
}

export interface FileElement {
	prefix: string;
	suffix: string;
	tileDirectory: string;
}

export class TileStruct implements FileElement {
	prefix: string = "";
	suffix: string = "";
	tileDirectory: string = "images/";
}

export class ImageStruct implements DisplayElement {

	private visible: boolean = true;
	
	opacity: number = 0.7;
	tileWidthPx: number = 256;
	tileHeightPx: number = 256;
	widthMapUnits: number = 1;
	heightMapUnits: number = 1; 

	getOpacity(): number {
		return this.opacity;
	}

	isVisible(): boolean {
		return this.visible;
	}

	setVisible(visible: boolean) {
		this.visible = visible;
	}
}
