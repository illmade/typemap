export interface Logger {
	log(info: string): void;
}

export class ElementLogger implements Logger {

	constructor(readonly displayElement: HTMLElement){}

	log(info: string): void {
		this.displayElement.innerText = info;
	}

}

export class ConsoleLogger implements Logger {

	log(info: string): void {
		console.log(info);
	}

}