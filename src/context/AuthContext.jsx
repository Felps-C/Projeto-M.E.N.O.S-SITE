import { createContext, useContext, useState } from 'react';

// Guarda quem está usando o sistema ({ tipo, id, escolaId, nome }) e o token do login.
// O token fica separado ("menos_token") e o api/client.js o envia em toda chamada à API.
const AuthContext = createContext(null);
const CHAVE = 'menos_sessao';

function lerSessao() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(lerSessao);

  // Recebe a resposta do login ({ tipo, id, escolaId, nome, token }).
  // Sem "token" (ex.: só trocar o nome depois de editar o perfil), mantém o token que já existe.
  const login = ({ token, ...dados }) => {
    if (token) localStorage.setItem('menos_token', token);
    setSessao(dados);
    localStorage.setItem(CHAVE, JSON.stringify(dados));
  };

  const logout = () => {
    setSessao(null);
    localStorage.removeItem(CHAVE);
    localStorage.removeItem('menos_token');
  };

  return <AuthContext.Provider value={{ sessao, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
