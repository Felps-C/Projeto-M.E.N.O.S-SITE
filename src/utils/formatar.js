// "2026-11-14" -> "14/11/2026". Não usa Date de propósito, para o fuso horário não mudar o dia.
export function formatarData(iso) {
  if (!iso) return '—';
  const [ano, mes, dia] = String(iso).slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

// Minúsculas e sem acento, para a busca achar "feijao" em "Feijão".
export function normalizarTexto(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// ["a", "b", "c"] -> "a, b ou c"
export function juntarComOu(itens) {
  if (itens.length <= 1) return itens.join('');
  return `${itens.slice(0, -1).join(', ')} ou ${itens[itens.length - 1]}`;
}
