// Único lugar que conhece o endereço da API.
// Em desenvolvimento usa "/api" (proxy do Vite). Em produção (Vercel), defina VITE_API_URL com o endereço
// público da API, ex.: https://nome.trycloudflare.com (sem barra no final). O valor é lido na hora do build:
// depois de mudar a variável, faça um novo deploy.
const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const options = { method, headers };

  // Token do login: o backend recusa (401) qualquer chamada sem ele, exceto login e cadastros.
  const token = localStorage.getItem('menos_token');
  if (token) headers.Authorization = `Bearer ${token}`;

  if (form) {
    options.body = form; // FormData (upload de imagens); o navegador define o Content-Type
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  let resposta;
  try {
    resposta = await fetch(`${BASE}${path}`, options);
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Tente novamente.', 0);
  }

  if (resposta.status === 401 && path !== '/login') {
    // Sessão vencida (ou token inválido): limpa tudo e volta para o login.
    localStorage.removeItem('menos_sessao');
    localStorage.removeItem('menos_token');
    window.location.assign('/login');
  }

  if (!resposta.ok) {
    let mensagem = 'Algo deu errado. Tente novamente.';
    try {
      const dados = await resposta.json();
      mensagem = dados.message || dados.detail || mensagem;
    } catch {
      // resposta sem corpo JSON: mantém a mensagem padrão
    }
    throw new ApiError(mensagem, resposta.status);
  }

  if (resposta.status === 204) return null;
  const tipo = resposta.headers.get('content-type') || '';
  return tipo.includes('application/json') ? resposta.json() : null;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
  upload: (path, formData) => request(path, { method: 'POST', form: formData }),
  // Endereço direto de arquivos (ex.: <img src={api.url('/merendas/1/imagem')} />)
  url: (path) => `${BASE}${path}`,
};
