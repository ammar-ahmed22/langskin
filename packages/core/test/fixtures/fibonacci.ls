fun fibonacci(n) {
  let a = 0;
  let b = 1;
  let i = 0;
  while (i < n) {
    print a;
    let next = a + b;
    a = b;
    b = next;
    i = i + 1;
  }
}

fibonacci(8);
