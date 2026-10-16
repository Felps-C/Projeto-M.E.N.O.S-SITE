import { createContext, useContext, useState } from 'react';

// SESSÃO PROVISÓRIA: guarda quem está usando o sistema ({ tipo, id, escolaId, nome }).
// Quando o login do backend ficar pronto, só a função login() muda:
// ela passa a receber a resposta da API (com token) em vez de dados de teste.
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

  const login = (dados) => {
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
