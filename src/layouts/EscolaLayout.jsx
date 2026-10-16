import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Telas da escola: pensadas para computador, com menu lateral (igual ao Figma).
export default function EscolaLayout() {
  const { logout } = useAuth();
  const navegar = useNavigate();

  const sair = () => {
    logout();
    navegar('/login');
  };

  return (
    <div className="escola">
      <nav className="menu-lateral">
        <p className="marca">M.E.N.O.S</p>
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
