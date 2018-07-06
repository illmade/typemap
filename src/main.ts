import { sayHello } from "./greet";

console.log(sayHello("TypeScripts"));

function showHello(divName: string, name: string) {
    const elt = document.getElementById(divName);
    elt.innerText = sayHello(name);
}

showHello("greeting", "TypeScript");