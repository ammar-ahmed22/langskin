let grades = [72, 85, 91, 64, 88];

fun average(arr) {
  let tot = 0;
  for (let i = 0; i < len(arr); i++) {
    tot += arr[i];
  }

  return tot / len(arr);
}

let avg = average(grades);
print("Average grade: " + str(avg));

if (avg >= 80) {
  print("Great job!");
} else {
  print("Needs improvement");
}
