import { LangError } from "../../errors/error";
import {
  isArrayLiteral,
  isNumberLiteral,
  isStringLiteral,
  Literal,
} from "../literal";
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

export const joinFn = new StdFunction({
  name: "join",
  func: (_, args, paren) => {
    const [arr, separator] = args;
    if (!isArrayLiteral(arr)) {
      throw LangError.runtimeError(
        "'join' function expects an array as the first argument",
        paren,
      );
    }

    if (!isStringLiteral(separator)) {
      throw LangError.runtimeError(
        "'join' function expects a string as the second argument",
        paren,
      );
    }
    const arrValue = arr.value;
    const separatorValue = separator.value;
    const result = arrValue
      .map((item) => item.toString())
      .join(separatorValue);
    return Literal.string(result);
  },
  arity: 2,
});

export const sliceFn = new StdFunction({
  name: "slice",
  func: (_, args, paren) => {
    const [arr, start, end] = args;
    if (!isArrayLiteral(arr)) {
      throw LangError.runtimeError(
        "'slice' function expects an array as the first argument",
        paren,
      );
    }

    if (!isNumberLiteral(start)) {
      throw LangError.runtimeError(
        "'slice' function expects a number as the second argument",
        paren,
      );
    }

    if (!isNumberLiteral(end)) {
      throw LangError.runtimeError(
        "'slice' function expects a number as the third argument",
        paren,
      );
    }

    const arrValue = arr.value;
    const startValue = start.value;
    const endValue = end.value;
    const result = arrValue.slice(startValue, endValue);
    return Literal.array(result);
  },
  arity: 3,
});

export const reversedFn = new StdFunction({
  name: "reversed",
  func: (_, args, paren) => {
    const [arr] = args;
    if (!isArrayLiteral(arr)) {
      throw LangError.runtimeError(
        "'reversed' function expects an array as the argument",
        paren,
      );
    }
    const arrValue = arr.value;
    const result = [...arrValue].reverse();
    return Literal.array(result);
  },
  arity: 1,
});
