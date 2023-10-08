import {multiplication} from "./multiplication.js";
import {division} from "./division.js";

export function mathFunction(x: number): number {
    return multiplication(x) + division(x);
}
