define grades = [72, 85, 91, 64, 88];

proc average(arr) {
  define tot = 0;
  each (define i = 0; i < len(arr); i++) {
    tot += arr[i];
  }

  emit tot / len(arr);
}

define avg = average(grades);
log("Average grade: " + str(avg));

when (avg >= 80) {
  log("Great job!");
} otherwise {
  log("Needs improvement");
}
