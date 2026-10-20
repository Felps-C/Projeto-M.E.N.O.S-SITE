import {
  atualizarCardapio,
  atualizarPrato,
  enviarImagemPrato,
  excluirCardapio,
  excluirPrato,
  publicarCardapio,
  tirarPratoDoCardapio,
} from '../api/endpoints.js';

// Transforma a lista de cardápios (um por data) numa lista de linhas "prato no cardápio".
// Cardápio sem nenhum prato vira uma linha só, para dar para limpar.
export function linhasDoCardapio(cardapios) {
  return cardapios.flatMap((menu) =>
    menu.merendas.length === 0
      ? [{ chave: `m${menu.id}`, menu, prato: null }]
      : menu.merendas.map((prato) => ({ chave: `m${menu.id}-p${prato.id}`, menu, prato })),
  );
}

// Ocultar/publicar: o aluno só enxerga cardápios ativos.
export const alternarPublicacao = (menu) =>
  atualizarCardapio(menu.id, {
    dataInicio: menu.dataInicio,
    ativa: !menu.ativa,
    merendaIds: menu.merendas.map((m) => m.id),
  });

// Salva a edição de um prato: dados do prato -> foto nova (se houver) -> data (se mudou).
export async function salvarEdicaoPrato(escolaId, menu, prato, { nome, tipoRefeicao, descricao, dataInicio, arquivo }) {
  await atualizarPrato(prato.id, {
    nome,
    tipoRefeicao,
    descricao: descricao || null,
    quantidade: prato.quantidade ?? 0,
  });
  if (arquivo) await enviarImagemPrato(prato.id, arquivo);

  if (dataInicio !== menu.dataInicio) {
    if (menu.merendas.length <= 1) {
      // Cardápio só desse prato: basta mudar a data dele.
      await atualizarCardapio(menu.id, {
        dataInicio,
        ativa: menu.ativa,
        merendaIds: menu.merendas.map((m) => m.id),
      });
    } else {
      // Cardápio com vários pratos: leva só este para a nova data.
      await publicarCardapio(escolaId, dataInicio, [prato.id]);
      await tirarPratoDoCardapio(menu.id, prato.id);
    }
  }
}

// Exclui um prato. Se ele era o único do cardápio, o cardápio vazio também sai.
// Cardápio com comentários não pode ser apagado: nesse caso fica oculto (sem pratos) e os comentários são preservados.
export async function excluirPratoDoCardapio(menu, prato) {
  if (menu.merendas.length === 1) {
    try {
      await excluirCardapio(menu.id);
    } catch (erro) {
      if (erro.status !== 409) throw erro;
      await atualizarCardapio(menu.id, { dataInicio: menu.dataInicio, ativa: false, merendaIds: [] });
    }
  } else {
    await tirarPratoDoCardapio(menu.id, prato.id);
  }
  await excluirPrato(prato.id);
}
