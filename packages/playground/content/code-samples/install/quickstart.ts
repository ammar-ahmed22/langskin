import { createLangskin } from "langskin";

const lang = createLangskin({
  keywords: {
    var: "variable",
    print: "imprimir",
  },
});

const result = lang.run(`
  variable x = 5;
  imprimir(x);
`);

console.log(result.getOutput()); // ["5"]
