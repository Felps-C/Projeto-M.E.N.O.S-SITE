import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Só deixa entrar quem está logado como o tipo esperado ("aluno" ou "escola").
export default function RotaProtegida({ tipo, children }) {
  const { sessao } = useAuth();
  if (!sessao || sessao.tipo !== tipo) return <Navigate to="/login" replace />;
  return children;
}
