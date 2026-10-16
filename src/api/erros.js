// Transforma a resposta de erro do Spring em mensagem amigável.
// Precisa de "server.error.include-message=always" e "server.error.include-binding-errors=always"
// no application.properties do backend; sem isso o Spring esconde a mensagem e só vale o texto padrão.

const MENSAGENS_PADRAO = {
  400: 'Confira os dados informados.',
  401: 'Sua sessão expirou. Entre novamente.',
  403: 'Você não tem permissão para fazer isso.',
  404: 'Não encontrado.',
  409: 'Essa operação conflita com dados que já existem.',
  500: 'Erro no servidor. Tente novamente em instantes.',
};

// Erros de validação do Spring (@Valid): [{ field: "email", defaultMessage: "E-mail inválido" }]
function listaDeErrosDeCampo(dados) {
  if (!dados || !Array.isArray(dados.errors)) return [];
  return dados.errors.filter((e) => e && e.defaultMessage);
}

// { email: "E-mail inválido", ... } para mostrar a mensagem embaixo de cada campo
export function extrairCampos(dados) {
  const campos = {};
  for (const erro of listaDeErrosDeCampo(dados)) {
    if (erro.field && !campos[erro.field]) campos[erro.field] = erro.defaultMessage;
  }
  return campos;
}

export function extrairMensagem(dados, status) {
  const doCampo = listaDeErrosDeCampo(dados)[0];
  if (doCampo) return doCampo.defaultMessage;

  if (dados && typeof dados.message === 'string' && dados.message && !dados.message.startsWith('Validation failed')) {
    return dados.message;
  }
  if (dados && typeof dados.detail === 'string' && dados.detail) return dados.detail;

  return MENSAGENS_PADRAO[status] || 'Algo deu errado. Tente novamente.';
}
