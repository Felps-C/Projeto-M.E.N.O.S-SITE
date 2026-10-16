// Ajustes que dependem do backend. Quando o backend ganhar o recurso, é só mudar aqui.
export const RECURSOS = {
  // O Figma tem "Categoria" e "Unidade de medida" no produto, mas o backend ainda não guarda esses
  // campos. Quando guardar (campos "categoria" e "unidade" no Produto), troque para true:
  // o formulário e a tabela passam a mostrá-los.
  categoriaEUnidadeNoProduto: false,

  // Quantos dias antes do vencimento o produto aparece como "Validade próxima".
  diasParaVencer: 7,
};
