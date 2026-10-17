// Ajustes que dependem do backend. Quando o backend ganhar o recurso, é só mudar aqui.
export const RECURSOS = {
  // "Categoria" e "Unidade de medida" do produto (Figma). O backend já guarda os dois campos
  // (Produto.categoria e Produto.unidade); se precisar esconder, troque para false.
  categoriaEUnidadeNoProduto: true,

  // Quantos dias antes do vencimento o produto aparece como "Validade próxima".
  diasParaVencer: 7,
};
