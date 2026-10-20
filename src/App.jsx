import { Navigate, Route, Routes } from 'react-router-dom';
import AlunoLayout from './layouts/AlunoLayout.jsx';
import EscolaLayout from './layouts/EscolaLayout.jsx';
import RotaProtegida from './components/RotaProtegida.jsx';
import EmConstrucao from './pages/EmConstrucao.jsx';
import Login from './pages/Login.jsx';
import Cadastro from './pages/Cadastro.jsx';
import CadastroEscola from './pages/CadastroEscola.jsx';
import Home from './pages/aluno/Home.jsx';
import EnquetesAluno from './pages/aluno/Enquetes.jsx';
import Saude from './pages/aluno/Saude.jsx';
import Perfil from './pages/aluno/Perfil.jsx';
import EditarPerfil from './pages/aluno/EditarPerfil.jsx';
import CriarCardapio from './pages/escola/CriarCardapio.jsx';
import EnquetesEscola from './pages/escola/Enquetes.jsx';
import Estoque from './pages/escola/Estoque.jsx';
import ProdutoForm from './pages/escola/ProdutoForm.jsx';
import Relatorios from './pages/escola/Relatorios.jsx';

export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/cadastro/escola" element={<CadastroEscola />} />

      {/* Aluno */}
      <Route path="/aluno" element={<RotaProtegida tipo="aluno"><AlunoLayout /></RotaProtegida>}>
        <Route index element={<Home />} />
        <Route path="enquetes" element={<EnquetesAluno />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="perfil/editar" element={<EditarPerfil />} />
        <Route path="saude" element={<Saude />} />
      </Route>

      {/* Escola */}
      <Route path="/escola" element={<RotaProtegida tipo="escola"><EscolaLayout /></RotaProtegida>}>
        <Route index element={<Navigate to="estoque" replace />} />
        <Route path="estoque" element={<Estoque />} />
        <Route path="estoque/novo" element={<ProdutoForm />} />
        <Route path="estoque/:produtoId/editar" element={<ProdutoForm />} />
        <Route path="cardapio" element={<CriarCardapio />} />
        <Route path="enquetes" element={<EnquetesEscola />} />
        <Route path="relatorios" element={<Relatorios />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
