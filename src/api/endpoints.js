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

// ---- Estudante: perfil e "Saúde e Alergias" (EstudanteController) ----
export const buscarEstudante = (id) => api.get(`/estudantes/${id}`);
// O PUT exige o cadastro inteiro (nome, e-mail, matrícula, escolaId). Sem "senha", a senha atual é mantida.
export const atualizarEstudante = (id, dados) => api.put(`/estudantes/${id}`, dados);

// ---- Escola: enquetes (EnqueteController) ----
export const listarEnquetesDaEscola = (escolaId) => api.get(`/enquetes/escola/${escolaId}`);
export const criarEnquete = (escolaId, dados) => api.post(`/enquetes/escola/${escolaId}`, dados);
export const abrirEnquete = (enqueteId) => api.post(`/enquetes/${enqueteId}/abrir`);
export const fecharEnquete = (enqueteId) => api.post(`/enquetes/${enqueteId}/fechar`);
// Pratos da escola, para escolher o "Prato vinculado" da enquete.
export const listarPratosDaEscola = (escolaId) => api.get(`/merendas/escola/${escolaId}`);

// Alunos da escola (usado no relatório de restrições alimentares; o front só conta, não exibe nomes).
export const listarEstudantesDaEscola = (escolaId) => api.get(`/estudantes?escolaId=${escolaId}`);

// Comentários de uma escola inteira (a tela de Perfil conta os do próprio aluno).
export const listarComentariosDaEscola = (escolaId) => api.get(`/feedbacks?escolaId=${escolaId}`);

// Cadastro de escola: { nome, email, senha, cnpj }
export const cadastrarEscola = (dados) => api.post('/escolas', dados);

// ---- Escola: gerenciar o cardápio já publicado (listar, editar, ocultar, excluir) ----
// Cada item da lista é um cardápio (uma data) com seus pratos em "merendas".
export const listarCardapiosDaEscola = (escolaId) => api.get(`/cardapios/escola/${escolaId}`);
// O PUT do prato troca nome, descrição, tipo e quantidade; por isso reenviamos a quantidade que já existe.
export const atualizarPrato = (merendaId, dados) => api.put(`/merendas/${merendaId}`, dados);
// O PUT do cardápio substitui data, situação (ativa) e a lista de pratos.
export const atualizarCardapio = (menuId, dados) => api.put(`/cardapios/${menuId}`, dados);
export const tirarPratoDoCardapio = (menuId, merendaId) => api.delete(`/cardapios/${menuId}/merendas/${merendaId}`);
export const excluirCardapio = (menuId) => api.delete(`/cardapios/${menuId}`);
// Foto do prato (404 quando o prato não tem foto). O "v" muda depois de trocar a foto, para o navegador recarregar.
export const urlImagemPrato = (merendaId, v = 0) => api.url(`/merendas/${merendaId}/imagem?v=${v}`);
