sea notas = [72, 85, 91, 64, 88];

funcion premedio(arr) {
  sea tot = 0;
  para (sea i = 0; i < len(arr); i++) {
    tot += arr[i];
  }

  retornar tot / len(arr);
}

sea med = premedio(notas);
imprimir("Nota premedio: " + str(med));

si (med >= 80) {
  imprimir("Gran trabajo!");
} sino {
  imprimir("Necesita mejorar");
}
