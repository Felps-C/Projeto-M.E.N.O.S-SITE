// "2026-10-16T00:00:00" no horário local (sem fuso), que é o formato que o backend lê.
function paraLocalDateTime(data) {
  const dois = (n) => String(n).padStart(2, '0');
  return `${data.getFullYear()}-${dois(data.getMonth() + 1)}-${dois(data.getDate())}T${dois(data.getHours())}:${dois(data.getMinutes())}:${dois(data.getSeconds())}`;
}

// Períodos do filtro. "dias: null" = todas as enquetes da escola.
export const PERIODOS = [
  { valor: '7', rotulo: 'Últimos 7 dias', dias: 7 },
  { valor: '30', rotulo: 'Últimos 30 dias', dias: 30 },
  { valor: 'tudo', rotulo: 'Todo o período', dias: null },
];

export function intervaloDoPeriodo(valor) {
  const periodo = PERIODOS.find((p) => p.valor === valor);
  if (!periodo || periodo.dias === null) return { dataInicio: null, dataFim: null };
  const fim = new Date();
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - periodo.dias);
  inicio.setHours(0, 0, 0, 0);
  return { dataInicio: paraLocalDateTime(inicio), dataFim: paraLocalDateTime(fim) };
}

// A opção mais votada de uma enquete (ou null se ninguém votou).
export function opcaoLider(enquete) {
  const opcoes = enquete.opcoes ?? [];
  if (enquete.totalVotos === 0 || opcoes.length === 0) return null;
  return opcoes.reduce((melhor, atual) => (atual.votos > melhor.votos ? atual : melhor));
}

// Aspas e ";" para o Excel (configuração brasileira) abrir as colunas certinhas.
const celula = (valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`;

export function relatorioParaCsv(relatorio, restricoes) {
  const linhas = [
    ['Relatório M.E.N.O.S'],
    ['Enquetes no período', relatorio.totalEnquete],
    ['Respostas coletadas', relatorio.totalVotos],
    ['Média de votos por enquete', String(relatorio.mediaVotos).replace('.', ',')],
    ['Comentários no período', relatorio.feedbacks?.total ?? 0],
    [],
    ['Enquete', 'Situação', 'Opção', 'Votos', 'Percentual (%)'],
  ];
  for (const enquete of relatorio.enquetes ?? []) {
    for (const opcao of enquete.opcoes ?? []) {
      linhas.push([
        enquete.titulo,
        enquete.aberta ? 'Aberta' : 'Encerrada',
        opcao.descricao,
        opcao.votos,
        String(Math.round(opcao.percentual * 10) / 10).replace('.', ','),
      ]);
    }
  }
  if (restricoes && restricoes.total > 0) {
    linhas.push([], ['Restrição / Alergia', 'Alunos', 'Proporção (%)']);
    for (const l of restricoes.linhas) linhas.push([l.restricao, l.alunos, l.percentual]);
    if (restricoes.comObservacao > 0) {
      linhas.push(['Outras observações', restricoes.comObservacao, restricoes.percentual(restricoes.comObservacao)]);
    }
    linhas.push(['Total de alunos', restricoes.total, ''], ['Alunos que preencheram a ficha', restricoes.preencheram, '']);
  }
  // BOM no começo: sem ele o Excel mostra os acentos errados.
  return '﻿' + linhas.map((l) => l.map(celula).join(';')).join('\r\n');
}

export function baixarArquivo(nome, conteudo, tipo) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  link.click();
  URL.revokeObjectURL(url);
}
