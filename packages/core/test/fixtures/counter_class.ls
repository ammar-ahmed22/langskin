class Counter {
  init(start) {
    this.count = start;
  }

  increment() {
    this.count = this.count + 1;
  }

  value() {
    return this.count;
  }
}

let c = Counter(0);
c.increment();
c.increment();
c.increment();
print c.value();
