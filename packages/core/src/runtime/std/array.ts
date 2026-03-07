import { LangError } from "../../errors/error";
import { isArrayLiteral, Literal } from "../literal";
import { StdFunction } from "./stdfunction";

export const pushFn = new StdFunction({
  name: "push",
  func: (_, args, paren) => {
    const [arr, value] = args;
    if (!isArrayLiteral(arr)) {
      throw LangError.runtimeError(
        "First argument to push must be an array",
        paren,
      );
    }
    arr.value.push(value!);
    return Literal.array(arr.value);
  },
  arity: 2,
});

export const popFn = new StdFunction({
  name: "pop",
  func: (_, args, paren) => {
    const [arr] = args;
    if (!isArrayLiteral(arr)) {
      throw LangError.runtimeError(
        "First argument to pop must be an array",
        paren,
      );
    }
    return arr.value.pop() ?? Literal.nil();
  },
  arity: 1,
});
