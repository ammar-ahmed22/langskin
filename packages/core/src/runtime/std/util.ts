import { LangError } from "../../errors/error";
import {
  isArrayLiteral,
  isCallableLiteral,
  isInstanceLiteral,
  isNilLiteral,
  isNumberLiteral,
  isStringLiteral,
  Literal,
} from "../literal";
import { StdFunction } from "./stdfunction";

export const typeofFn = new StdFunction({
  name: "typeof",
  func: (_, args, paren) => {
    const [a] = args;
    if (isNumberLiteral(a)) {
      return Literal.string("number");
    }
    if (isStringLiteral(a)) {
      return Literal.string("string");
    }
    if (isArrayLiteral(a)) {
      return Literal.string("array");
    }
    if (isCallableLiteral(a)) {
      return Literal.string("function");
    }
    if (isInstanceLiteral(a)) {
      return Literal.string("instance");
    }
    if (isNilLiteral(a)) {
      return Literal.string("nil");
    }
    throw LangError.runtimeError(
      "Unknown type for 'typeof' function.",
      paren,
    );
  },
  arity: 1,
});

export const lenFn = new StdFunction({
  name: "len",
  func: (_, args, paren) => {
    const [a] = args;
    if (isStringLiteral(a)) {
      return Literal.number(a.value.length);
    }
    if (isArrayLiteral(a)) {
      return Literal.number(a.value.length);
    }
    throw LangError.runtimeError(
      "Argument to 'len' must be a string or array.",
      paren,
    );
  },
  arity: 1,
});

export const nowFn = new StdFunction({
  name: "now",
  func: () => {
    return Literal.number(Date.now());
  },
  arity: 0,
});

export const indexOfFn = new StdFunction({
  name: "index_of",
  func: (interpreter, args, paren) => {
    const [target, search] = args;
    if (isStringLiteral(target)) {
      if (!isStringLiteral(search)) {
        throw LangError.runtimeError(
          "Second argument to 'index_of' must be a string when the first argument is a string.",
          paren,
        );
      }
      return Literal.number(target.value.indexOf(search.value));
    }

    if (isArrayLiteral(target)) {
      const index = target.value.findIndex((item) => {
        return interpreter.isEqual(item, search!);
      });
      return Literal.number(index);
    }

    throw LangError.runtimeError(
      "First argument to 'index_of' must be a string or array.",
      paren,
    );
  },
  arity: 2,
});
