"use client";
import CodeEditor from "@/components/ui/code/code-editor";
import CodeBlock from "@/components/ui/code/code-block";
import { createTextMateGrammar, DEFAULT_SPEC } from "langskin";
import { IRawGrammar } from "vscode-textmate";
import { useState } from "react";
import { defaultTheme } from "@/components/ui/code/theme";

const codeSample = `// This is a comment
// Functions
fun add(a, b) {
  return a + b;
}

// Variables
let x  = 5;
let y = 10;
let result = add(x, y);

// Printing
print(result); // Output: 15

// Control Flow
if (result > 10) {
  print("Result is greater than 10");
} else {
  print("Result is 10 or less");
}

// Arrays and Loops
let numbers = [1, 2, 3, 4, 5];
for (let i = 0; i < len(numbers); i++) {
  print(numbers[i]);
}

while (x < 10) {
  print(x);
  x++;
}

// Classes and Inheritance
class Person {
  init(name) {
    this.name = name;
  }

  introduce() {
    print("Hi, I'm " + this.name);
  }
}

class Teacher inherits Person {
  init(name, subject) {
    super.init(name);
    this.subject = subject;
  }

  introduce() {
    super.introduce();
    print("I teach " + this.subject);
  }
}

let person = Person("Ammar");
person.introduce();

let teacher = Teacher("Zaid", "Math");
teacher.introduce();
`;

const heroCode = `variable saludo = "¡Hola, Mundo!";
imprimir saludo;
 
funcion sumar(a, b) {
  retornar a + b;
}
 
variable resultado = sumar(3, 4);
imprimir resultado;
`;

export default function Playground() {
  const grammar = createTextMateGrammar(DEFAULT_SPEC);
  const parsed = JSON.parse(grammar) as IRawGrammar;
  const [code, setCode] = useState("");
  // TODO: Define theme properly for these
  return (
    <div className="min-h-screen bg-background">
      <h3>Editable:</h3>
      <CodeEditor
        grammar={parsed}
        value={code}
        onChange={setCode}
        scopeName="source.langskin"
        showLineNumbers
        theme={defaultTheme}
        className="text-muted-foreground bg-background border-muted-foreground rounded-sm p-4"
      ></CodeEditor>
      <h3>Read-only:</h3>
      <CodeBlock
        grammar={parsed}
        value={codeSample}
        scopeName="source.langskin"
        theme={defaultTheme}
        showLineNumbers
        className="text-muted-foreground bg-background border-muted-foreground rounded-sm p-4"
      ></CodeBlock>
    </div>
  );
}
