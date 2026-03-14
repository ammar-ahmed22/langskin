define hello = "Hello, world!";
log(hello);

proc sum(a, b) {
  emit a + b;
}

define result = sum(3, 4);
log(result);
