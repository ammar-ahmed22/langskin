import { LangError } from "../../errors/error";
import { isNumberLiteral, Literal } from "../literal";
import { StdFunction } from "./stdfunction";

export const maxFn = new StdFunction({
  name: "max",
  func: (_, args, paren) => {
    const [a, b] = args;
    if (isNumberLiteral(a) && isNumberLiteral(b)) {
      return Literal.number(Math.max(a.value, b.value));
    } else {
      throw LangError.runtimeError(
        "Arguments to 'max' must be numbers.",
        paren,
      );
    }
  },
  arity: 2,
});

export const minFn = new StdFunction({
  name: "min",
  func: (_, args, paren) => {
    const [a, b] = args;
    if (isNumberLiteral(a) && isNumberLiteral(b)) {
      return Literal.number(Math.min(a.value, b.value));
    } else {
      throw LangError.runtimeError(
        "Arguments to 'min' must be numbers.",
        paren,
      );
    }
  },
  arity: 2,
});

export const absFn = new StdFunction({
  name: "abs",
  func: (_, args, paren) => {
    const [a] = args;
    if (isNumberLiteral(a)) {
      return Literal.number(Math.abs(a.value));
    } else {
      throw LangError.runtimeError(
        "Argument to 'abs' must be a number.",
        paren,
      );
    }
  },
  arity: 1,
});

export const ceilFn = new StdFunction({
  name: "ceil",
  func: (_, args, paren) => {
    const [a] = args;
    if (isNumberLiteral(a)) {
      return Literal.number(Math.ceil(a.value));
    } else {
      throw LangError.runtimeError(
        "Argument to 'ceil' must be a number.",
        paren,
      );
    }
  },
  arity: 1,
});

export const floorFn = new StdFunction({
  name: "floor",
  func: (_, args, paren) => {
    const [a] = args;
    if (isNumberLiteral(a)) {
      return Literal.number(Math.floor(a.value));
    } else {
      throw LangError.runtimeError(
        "Argument to 'floor' must be a number.",
        paren,
      );
    }
  },
  arity: 1,
});

export const powFn = new StdFunction({
  name: "pow",
  func: (_, args, paren) => {
    const [a, b] = args;
    if (isNumberLiteral(a) && isNumberLiteral(b)) {
      return Literal.number(Math.pow(a.value, b.value));
    } else {
      throw LangError.runtimeError(
        "Arguments to 'pow' must be numbers.",
        paren,
      );
    }
  },
  arity: 2,
});

export const sqrtFn = new StdFunction({
  name: "sqrt",
  func: (_, args, paren) => {
    const [a] = args;
    if (isNumberLiteral(a)) {
      return Literal.number(Math.sqrt(a.value));
    } else {
      throw LangError.runtimeError(
        "Argument to 'sqrt' must be a number.",
        paren,
      );
    }
  },
  arity: 1,
});

export const randFn = new StdFunction({
  name: "rand",
  func: (_, args, paren) => {
    const [min, max] = args;
    if (isNumberLiteral(min) && isNumberLiteral(max)) {
      const minVal = min.value;
      const maxVal = max.value;
      if (minVal > maxVal) {
        throw LangError.runtimeError(
          `First argument to 'rand' must be less than or equal to second argument.`,
          paren,
        );
      }
      const randomValue = Math.random() * (maxVal - minVal) + minVal;
      return Literal.number(randomValue);
    } else {
      throw LangError.runtimeError(
        "Arguments to 'rand' must be numbers.",
        paren,
      );
    }
  },
  arity: 2,
});

export const randIntFn = new StdFunction({
  name: "randint",
  func: (_, args, paren) => {
    const [min, max] = args;
    if (isNumberLiteral(min) && isNumberLiteral(max)) {
      const minVal = Math.ceil(min.value);
      const maxVal = Math.floor(max.value);
      if (minVal > maxVal) {
        throw LangError.runtimeError(
          `First argument to 'randInt' must be less than or equal to second argument.`,
          paren,
        );
      }
      const randomValue =
        Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
      return Literal.number(randomValue);
    } else {
      throw LangError.runtimeError(
        "Arguments to 'randint' must be numbers.",
        paren,
      );
    }
  },
  arity: 2,
});

export const isIntegerFn = new StdFunction({
  name: "isint",
  func: (_, args, paren) => {
    const [a] = args;
    if (isNumberLiteral(a)) {
      return Literal.bool(Number.isInteger(a.value));
    } else {
      throw LangError.runtimeError(
        "Argument to 'isint' must be a number.",
        paren,
      );
    }
  },
  arity: 1,
});
