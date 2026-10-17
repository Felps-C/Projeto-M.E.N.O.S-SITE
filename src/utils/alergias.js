// O backend guarda as alergias do aluno em UM campo de texto (Estudante.alergias, até 500 caracteres).
// A tela "Saúde e Alergias" tem caixinhas + observações, então aqui convertemos nos dois sentidos:
//   "Intolerância à lactose; Diabetes; Obs: não como ovo"  <->  { marcadas: [...], observacoes: "..." }
// Como os nomes das caixinhas são sempre os mesmos, dá para contar quantos alunos têm cada
// restrição (é o que a tabela de restrições do relatório do Figma precisa).

export const OPCOES_ALERGIA = [
  'Intolerância à lactose',
  'Intolerância ao glúten (Doença Celíaca)',
  'Alergia a amendoim ou castanhas',
  'Alergia a frutos do mar',
  'Diabetes',
];
export const NENHUMA_RESTRICAO = 'Nenhuma restrição alimentar';
export const LIMITE_ALERGIAS = 500; // mesmo limite do backend

const TODAS = [...OPCOES_ALERGIA, NENHUMA_RESTRICAO];
const MARCA_OBS = 'Obs: ';

// Devolve null quando não há nada para guardar.
export function montarAlergias(marcadas, observacoes) {
  const lista = TODAS.filter((opcao) => marcadas.includes(opcao)).join('; '); // sempre na mesma ordem
  const obs = observacoes.trim();
  if (!lista && !obs) return null;
  if (!obs) return lista;
  return lista ? `${lista}; ${MARCA_OBS}${obs}` : `${MARCA_OBS}${obs}`;
}

// Quantos caracteres ainda cabem nas observações, já descontando as caixinhas marcadas.
export function limiteDasObservacoes(marcadas) {
  const lista = montarAlergias(marcadas, '');
  const usado = lista ? lista.length + 2 : 0; // "; " entre a lista e as observações
  return Math.max(0, LIMITE_ALERGIAS - usado - MARCA_OBS.length);
}

export function lerAlergias(texto) {
  if (!texto || !texto.trim()) return { marcadas: [], observacoes: '' };

  let lista = texto;
  let observacoes = '';
  const achou = texto.match(/(?:^|; )Obs: ([\s\S]*)$/);
  if (achou) {
    observacoes = achou[1];
    lista = texto.slice(0, achou.index);
  }

  const marcadas = [];
  const outros = [];
  for (const item of lista.split('; ').map((s) => s.trim()).filter(Boolean)) {
    (TODAS.includes(item) ? marcadas : outros).push(item);
  }
  // Texto que não segue o formato (ex.: cadastrado direto pela API) vai para as observações, sem se perder.
  if (outros.length > 0) observacoes = [outros.join('; '), observacoes].filter(Boolean).join('; ');
  return { marcadas, observacoes };
}

// Conta quantos alunos têm cada restrição (tabela do relatório). Só devolve números, nunca nomes.
// "total" = todos os alunos da escola; "preencheram" = quantos já responderam "Saúde e Alergias".
export function contarRestricoes(estudantes) {
  const total = estudantes.length;
  const contagem = Object.fromEntries(OPCOES_ALERGIA.map((o) => [o, 0]));
  let preencheram = 0;
  let semRestricao = 0;
  let comObservacao = 0;

  for (const estudante of estudantes) {
    const { marcadas, observacoes } = lerAlergias(estudante.alergias);
    if (marcadas.length > 0 || observacoes) preencheram += 1;
    if (marcadas.includes(NENHUMA_RESTRICAO)) semRestricao += 1;
    if (observacoes) comObservacao += 1;
    for (const opcao of OPCOES_ALERGIA) if (marcadas.includes(opcao)) contagem[opcao] += 1;
  }

  const percentual = (alunos) => (total === 0 ? 0 : Math.round((alunos * 100) / total));
  const linhas = OPCOES_ALERGIA.map((restricao) => ({
    restricao,
    alunos: contagem[restricao],
    percentual: percentual(contagem[restricao]),
  })).sort((a, b) => b.alunos - a.alunos);

  return { total, preencheram, semRestricao, comObservacao, linhas, percentual };
}
