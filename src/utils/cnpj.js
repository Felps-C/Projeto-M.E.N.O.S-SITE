// Deixa só os números e aplica a máscara 00.000.000/0000-00 enquanto a pessoa digita.
export function mascararCnpj(texto) {
  const n = texto.replace(/\D/g, '').slice(0, 14);
  return n
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

// Confere os 14 dígitos e os dois dígitos verificadores.
export function cnpjValido(texto) {
  const n = texto.replace(/\D/g, '');
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false;
  const digito = (base) => {
    const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = [...base].reduce((total, d, i) => total + Number(d) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const d1 = digito(n.slice(0, 12));
  const d2 = digito(n.slice(0, 12) + d1);
  return n.endsWith(`${d1}${d2}`);
}
