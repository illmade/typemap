export interface DisplayElement {
	isVisible(): boolean;
	setVisible(visible: boolean): void;
	getOpacity(): number;
	setOpacity(opacity: number): void;
}
