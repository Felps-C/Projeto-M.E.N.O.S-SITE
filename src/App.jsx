import { Navigate, Route, Routes } from 'react-router-dom';
import AlunoLayout from './layouts/AlunoLayout.jsx';
import EscolaLayout from './layouts/EscolaLayout.jsx';
import RotaProtegida from './components/RotaProtegida.jsx';
import EmConstrucao from './pages/EmConstrucao.jsx';
import Login from './pages/Login.jsx';
import Cadastro from './pages/Cadastro.jsx';
import Home from './pages/aluno/Home.jsx';
import CriarCardapio from './pages/escola/CriarCardapio.jsx';
import Estoque from './pages/escola/Estoque.jsx';
import ProdutoForm from './pages/escola/ProdutoForm.jsx';
import Relatorios from './pages/escola/Relatorios.jsx';

export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      {/* Aluno */}
      <Route path="/aluno" element={<RotaProtegida tipo="aluno"><AlunoLayout /></RotaProtegida>}>
        <Route index element={<Home />} />
        <Route path="enquetes" element={<EmConstrucao titulo="Enquetes" />} />
        <Route path="perfil" element={<EmConstrucao titulo="Perfil" />} />
        <Route path="perfil/editar" element={<EmConstrucao titulo="Editar perfil" />} />
        <Route path="saude" element={<EmConstrucao titulo="Saúde e Alergias" />} />
      </Route>

      {/* Escola */}
      <Route path="/escola" element={<RotaProtegida tipo="escola"><EscolaLayout /></RotaProtegida>}>
        <Route index element={<Navigate to="estoque" replace />} />
        <Route path="estoque" element={<Estoque />} />
        <Route path="estoque/novo" element={<ProdutoForm />} />
        <Route path="estoque/:produtoId/editar" element={<ProdutoForm />} />
        <Route path="cardapio" element={<CriarCardapio />} />
        <Route path="enquetes" element={<EmConstrucao titulo="Enquetes" />} />
        <Route path="relatorios" element={<Relatorios />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
