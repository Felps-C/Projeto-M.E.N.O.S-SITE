// Chamadas da tela de estoque. Cada função corresponde a um endpoint do backend.
import { api, ApiError } from './client.js';

// A escola tem um único estoque. Se ainda não existe (404), cria na primeira vez.
async function buscarOuCriar(escolaId) {
  try {
    return await api.get(`/estoques/escola/${escolaId}`);
  } catch (erro) {
    if (!(erro instanceof ApiError) || erro.status !== 404) throw erro;
  }
  try {
    return await api.post(`/estoques/escola/${escolaId}`);
  } catch (erro) {
    // 409 = outra chamada criou o estoque no mesmo instante; é só buscar de novo
    if (erro instanceof ApiError && erro.status === 409) return api.get(`/estoques/escola/${escolaId}`);
    throw erro;
  }
}

// Junta chamadas simultâneas para a mesma escola (o React em desenvolvimento chama duas vezes).
const emAndamento = new Map();
export function obterOuCriarEstoque(escolaId) {
  if (!emAndamento.has(escolaId)) {
    emAndamento.set(escolaId, buscarOuCriar(escolaId).finally(() => emAndamento.delete(escolaId)));
  }
  return emAndamento.get(escolaId);
}

export const listarProdutos = (estoqueId) => api.get(`/estoques/${estoqueId}/produtos`);
export const buscarAlertas = (estoqueId, dias) => api.get(`/estoques/${estoqueId}/alertas?dias=${dias}`);
export const criarProduto = (estoqueId, produto) => api.post(`/estoques/${estoqueId}/produtos`, produto);

export const buscarProduto = (produtoId) => api.get(`/produtos/${produtoId}`);
export const atualizarProduto = (produtoId, produto) => api.put(`/produtos/${produtoId}`, produto);
export const excluirProduto = (produtoId) => api.delete(`/produtos/${produtoId}`);

export const registrarEntrada = (estoqueId, produtoId, quantidade) =>
  api.post(`/estoques/${estoqueId}/produtos/${produtoId}/entrada`, { quantidade });
export const registrarSaida = (estoqueId, produtoId, quantidade) =>
  api.post(`/estoques/${estoqueId}/produtos/${produtoId}/saida`, { quantidade });
