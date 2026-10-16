import { juntarComOu } from './formatar.js';

// Transforma as listas de alertas do backend em conjuntos de ids, para consultar rápido por produto.
// O backend é quem decide o que é vencido / a vencer / abaixo do mínimo; aqui só exibimos.
export function situacaoDoEstoque(alertas) {
  const ids = (lista) => new Set((lista || []).map((produto) => produto.id));
  return {
    vencidos: ids(alertas?.vencidos),
    aVencer: ids(alertas?.aVencer),
    baixos: ids(alertas?.abaixoDoMinimo),
  };
}

// Textos dos selos de um produto. Lista vazia = está tudo normal.
export function selosDoProduto(produto, situacao) {
  const selos = [];
  if (situacao.vencidos.has(produto.id)) selos.push('Vencido');
  else if (situacao.aVencer.has(produto.id)) selos.push('Validade próxima');
  if (situacao.baixos.has(produto.id)) selos.push('Estoque baixo');
  return selos;
}

// Texto da faixa vermelha do topo. Devolve '' quando não há nada para avisar.
export function textoDeAtencao(situacao) {
  const todos = new Set([...situacao.vencidos, ...situacao.aVencer, ...situacao.baixos]);
  if (todos.size === 0) return '';

  const motivos = [];
  if (situacao.baixos.size) motivos.push('estoque baixo');
  if (situacao.aVencer.size) motivos.push('validade próxima');
  if (situacao.vencidos.size) motivos.push('produto vencido');

  const verbo = todos.size === 1 ? 'item precisa' : 'itens precisam';
  return `${todos.size} ${verbo} de atenção — ${juntarComOu(motivos)}.`;
}
