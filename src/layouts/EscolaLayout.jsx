import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { inicial } from '../utils.js';

// Telas da escola: pensadas para computador, com menu lateral (igual ao Figma).
export default function EscolaLayout() {
  const { sessao, logout } = useAuth();
  const navegar = useNavigate();

  const sair = () => {
    logout();
    navegar('/login');
  };

  return (
    <div className="escola">
      <nav className="menu-lateral">
        <p className="marca">
          <span className="marca-logo">{inicial(sessao.nome)}</span>
          <span>{sessao.nome}</span>
        </p>
        <NavLink to="/escola/estoque">Estoque</NavLink>
        <NavLink to="/escola/cardapio">Cardápio</NavLink>
        <NavLink to="/escola/enquetes">Enquetes</NavLink>
        <NavLink to="/escola/relatorios">Relatórios</NavLink>
        <button className="sair" onClick={sair}>Sair</button>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
