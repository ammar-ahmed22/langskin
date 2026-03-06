import { LangError } from "../../errors/error";
import {
  isNumberLiteral,
  isStringLiteral,
  Literal,
} from "../literal";
import { StdFunction } from "./stdfunction";

export const ordFn = new StdFunction({
  name: "ord",
  func: (_, args, paren) => {
    const [str] = args;
    if (isStringLiteral(str)) {
      if (str.value.length !== 1) {
        throw LangError.runtimeError(
          "'ord' function expects a single character string",
          paren,
        );
      }
      return Literal.number(str.value.charCodeAt(0));
    } else {
      throw LangError.runtimeError(
        "'ord' function expects a string literal",
        paren,
      );
    }
  },
  arity: 1,
});

export const strFn = new StdFunction({
  name: "str",
  func: (_, args) => {
    const [value] = args;
    if (value) {
      return Literal.string(value.toString());
    }
    return Literal.nil();
  },
  arity: 1,
});

export const substrFn = new StdFunction({
  name: "substr",
  func: (_, args, paren) => {
    const [str, start, length] = args;
    if (!isStringLiteral(str)) {
      throw LangError.runtimeError(
        "'substr' function expects a string as the first argument",
        paren,
      );
    }

    if (!isNumberLiteral(start)) {
      throw LangError.runtimeError(
        "'substr' function expects a number as the second argument",
        paren,
      );
    }

    if (!isNumberLiteral(length)) {
      throw LangError.runtimeError(
        "'substr' function expects a number as the third argument",
        paren,
      );
    }
    const strValue = str.value;
    const startIndex = start.value;
    const endIndex = startIndex + length.value;
    if (startIndex < 0 || endIndex > strValue.length) {
      throw LangError.runtimeError(
        "'substr' function indices are out of bounds",
        paren,
      );
    }
    return Literal.string(strValue.substring(startIndex, endIndex));
  },
  arity: 3,
});

export const replaceFn = new StdFunction({
  name: "replace",
  func: (_, args, paren) => {
    const [str, search, replacement] = args;
    if (!isStringLiteral(str)) {
      throw LangError.runtimeError(
        "'replace' function expects a string as the first argument",
        paren,
      );
    }

    if (!isStringLiteral(search)) {
      throw LangError.runtimeError(
        "'replace' function expects a string as the second argument",
        paren,
      );
    }

    if (!isStringLiteral(replacement)) {
      throw LangError.runtimeError(
        "'replace' function expects a string as the third argument",
        paren,
      );
    }
    const strValue = str.value;
    const searchValue = search.value;
    const replacementValue = replacement.value;
    const result = strValue.replace(searchValue, replacementValue);
    return Literal.string(result);
  },
  arity: 3,
});

export const replaceAllFn = new StdFunction({
  name: "replace_all",
  func: (_, args, paren) => {
    const [str, search, replacement] = args;
    if (!isStringLiteral(str)) {
      throw LangError.runtimeError(
        "'replace_all' function expects a string as the first argument",
        paren,
      );
    }

    if (!isStringLiteral(search)) {
      throw LangError.runtimeError(
        "'replace_all' function expects a string as the second argument",
        paren,
      );
    }

    if (!isStringLiteral(replacement)) {
      throw LangError.runtimeError(
        "'replace_all' function expects a string as the third argument",
        paren,
      );
    }
    const strValue = str.value;
    const searchValue = search.value;
    const replacementValue = replacement.value;
    const result = strValue.split(searchValue).join(replacementValue);
    return Literal.string(result);
  },
  arity: 3,
});
