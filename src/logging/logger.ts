export interface Logger {
	log(info: string);
}

export class ElementLogger implements Logger {

	constructor(readonly displayElement: HTMLElement){}

	log(info: string) {
		this.displayElement.innerText = info;
	}

}

export class ConsoleLogger implements Logger {

	log(info: string) {
		console.log(info);
	}

}