import { api } from './client.js';

// ---- Login e cadastro ----
export const entrar = (identificador, senha) => api.post('/login', { identificador, senha });
export const listarEscolas = () => api.get('/escolas');
export const cadastrarEstudante = (dados) => api.post('/estudantes', dados);

// ---- Cardápio ----
export const cardapiosDeHoje = (escolaId, dataISO) =>
  api.get(`/cardapios/escola/${escolaId}?ativa=true&data=${dataISO}`);
export const resumoCardapio = (menuId, estudanteId) =>
  api.get(`/cardapios/${menuId}/resumo?estudanteId=${estudanteId}`);

// Curtidas (CurtidaController): POST /curtidas, DELETE /curtidas?estudanteId=&menuId=
export const alternarCurtida = (menuId, estudanteId, jaCurtiu) =>
  jaCurtiu
    ? api.delete(`/curtidas?estudanteId=${estudanteId}&menuId=${menuId}`)
    : api.post('/curtidas', { estudanteId, menuId });

// ---- Comentários (feedbacks) ----
export const listarComentarios = (menuId) => api.get(`/feedbacks?menuId=${menuId}`);
export const comentar = (menuId, estudanteId, texto) =>
  api.post('/feedbacks', { texto, estudanteId, menuId });

// ---- Enquetes ----
export const enquetesAtivas = (escolaId) => api.get(`/enquetes/escola/${escolaId}?ativa=true`);
export const votar = (enqueteId, estudanteId, opcaoId) =>
  api.post(`/enquetes/${enqueteId}/votos`, { estudanteId, opcaoId });
export const resultadoEnquete = (enqueteId) => api.get(`/enquetes/${enqueteId}/resultado`);

// ---- Escola: pratos e cardápio ----
export const criarPrato = (escolaId, prato) => api.post(`/merendas/escola/${escolaId}`, prato);
export const excluirPrato = (merendaId) => api.delete(`/merendas/${merendaId}`);
export const enviarImagemPrato = (merendaId, arquivo) => {
  const formulario = new FormData();
  formulario.append('arquivo', arquivo); // o backend espera o campo "arquivo"
  return api.upload(`/merendas/${merendaId}/imagem`, formulario);
};
export const publicarCardapio = (escolaId, dataInicio, merendaIds) =>
  api.post(`/cardapios/escola/${escolaId}`, { dataInicio, ativa: true, merendaIds });

// Publica um prato em 3 passos: cria o prato -> envia a foto (se houver) -> publica o cardápio.
// Se algum passo falhar, apaga o prato criado, para não sobrar prato "solto" no banco.
export async function publicarPrato(escolaId, { nome, tipoRefeicao, descricao, dataInicio, arquivo }) {
  const prato = await criarPrato(escolaId, {
    nome,
    tipoRefeicao,
    descricao: descricao || null,
    quantidade: 0, // o Figma não pede quantidade; o backend exige o campo
  });
  try {
    if (arquivo) await enviarImagemPrato(prato.id, arquivo);
    return await publicarCardapio(escolaId, dataInicio, [prato.id]);
  } catch (erro) {
    try {
      await excluirPrato(prato.id);
    } catch {
      // se nem a limpeza funcionar, mostramos o erro original mesmo assim
    }
    throw erro;
  }
}
