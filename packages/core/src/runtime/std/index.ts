import { Callable } from "../callable";
import * as mathLib from "./math";
import * as utillib from "./util";
import * as stringlib from "./string";
import * as arraylib from "./array";

type StdLib = {
  [name: string]: Callable;
};

export const stdlib: StdLib = {};

// Add the functions to the stdlib with their name as the key
for (const func of Object.values(mathLib)) {
  stdlib[func.name] = func;
}

for (const func of Object.values(utillib)) {
  stdlib[func.name] = func;
}

for (const func of Object.values(stringlib)) {
  stdlib[func.name] = func;
}

for (const func of Object.values(arraylib)) {
  stdlib[func.name] = func;
}
