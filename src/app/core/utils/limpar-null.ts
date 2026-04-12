export function limparNull<T>(obj: any): T {
  const novo: any = {};

  for (const key in obj) {
    const valor = obj[key];

    if (valor === null) {
      novo[key] = undefined;
    } else {
      novo[key] = valor;
    }
  }

  return novo;
}