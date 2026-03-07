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

export const roundFn = new StdFunction({
  name: "round",
  func: (_, args, paren) => {
    const [a] = args;
    if (isNumberLiteral(a)) {
      return Literal.number(Math.round(a.value));
    } else {
      throw LangError.runtimeError(
        "Argument to 'round' must be a number.",
        paren,
      );
    }
  },
  arity: 1,
});

export const signFn = new StdFunction({
  name: "sign",
  func: (_, args, paren) => {
    const [a] = args;
    if (isNumberLiteral(a)) {
      return Literal.number(Math.sign(a.value));
    } else {
      throw LangError.runtimeError(
        "Argument to 'sign' must be a number.",
        paren,
      );
    }
  },
  arity: 1,
});

export const sinFn = new StdFunction({
  name: "sin",
  func: (_, args, paren) => {
    const [a] = args;
    if (isNumberLiteral(a)) {
      return Literal.number(Math.sin(a.value));
    } else {
      throw LangError.runtimeError(
        "Argument to 'sin' must be a number.",
        paren,
      );
    }
  },
  arity: 1,
});

export const cosFn = new StdFunction({
  name: "cos",
  func: (_, args, paren) => {
    const [a] = args;
    if (isNumberLiteral(a)) {
      return Literal.number(Math.cos(a.value));
    } else {
      throw LangError.runtimeError(
        "Argument to 'cos' must be a number.",
        paren,
      );
    }
  },
  arity: 1,
});

export const tanFn = new StdFunction({
  name: "tan",
  func: (_, args, paren) => {
    const [a] = args;
    if (isNumberLiteral(a)) {
      return Literal.number(Math.tan(a.value));
    } else {
      throw LangError.runtimeError(
        "Argument to 'tan' must be a number.",
        paren,
      );
    }
  },
  arity: 1,
});

export const asinFn = new StdFunction({
  name: "asin",
  func: (_, args, paren) => {
    const [a] = args;
    if (isNumberLiteral(a)) {
      return Literal.number(Math.asin(a.value));
    } else {
      throw LangError.runtimeError(
        "Argument to 'asin' must be a number.",
        paren,
      );
    }
  },
  arity: 1,
});

export const acosFn = new StdFunction({
  name: "acos",
  func: (_, args, paren) => {
    const [a] = args;
    if (isNumberLiteral(a)) {
      return Literal.number(Math.acos(a.value));
    } else {
      throw LangError.runtimeError(
        "Argument to 'acos' must be a number.",
        paren,
      );
    }
  },
  arity: 1,
});

export const atanFn = new StdFunction({
  name: "atan",
  func: (_, args, paren) => {
    const [a] = args;
    if (isNumberLiteral(a)) {
      return Literal.number(Math.atan(a.value));
    } else {
      throw LangError.runtimeError(
        "Argument to 'atan' must be a number.",
        paren,
      );
    }
  },
  arity: 1,
});

export const atan2Fn = new StdFunction({
  name: "atan2",
  func: (_, args, paren) => {
    const [y, x] = args;
    if (isNumberLiteral(y) && isNumberLiteral(x)) {
      return Literal.number(Math.atan2(y.value, x.value));
    } else {
      throw LangError.runtimeError(
        "Arguments to 'atan2' must be numbers.",
        paren,
      );
    }
  },
  arity: 2,
});

export const logFn = new StdFunction({
  name: "log",
  func: (_, args, paren) => {
    const [a] = args;
    if (isNumberLiteral(a)) {
      return Literal.number(Math.log(a.value));
    } else {
      throw LangError.runtimeError(
        "Argument to 'log' must be a number.",
        paren,
      );
    }
  },
  arity: 1,
});

export const log10Fn = new StdFunction({
  name: "log10",
  func: (_, args, paren) => {
    const [a] = args;
    if (isNumberLiteral(a)) {
      return Literal.number(Math.log10(a.value));
    } else {
      throw LangError.runtimeError(
        "Argument to 'log10' must be a number.",
        paren,
      );
    }
  },
  arity: 1,
});

export const log2Fn = new StdFunction({
  name: "log2",
  func: (_, args, paren) => {
    const [a] = args;
    if (isNumberLiteral(a)) {
      return Literal.number(Math.log2(a.value));
    } else {
      throw LangError.runtimeError(
        "Argument to 'log2' must be a number.",
        paren,
      );
    }
  },
  arity: 1,
});

export const expFn = new StdFunction({
  name: "exp",
  func: (_, args, paren) => {
    const [a] = args;
    if (isNumberLiteral(a)) {
      return Literal.number(Math.exp(a.value));
    } else {
      throw LangError.runtimeError(
        "Argument to 'exp' must be a number.",
        paren,
      );
    }
  },
  arity: 1,
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
