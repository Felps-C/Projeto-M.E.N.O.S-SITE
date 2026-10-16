import { NavLink, Outlet } from 'react-router-dom';

// Telas do aluno: pensadas para celular, com menu inferior (Home, Enquetes, Perfil).
export default function AlunoLayout() {
  return (
    <div className="aluno">
      <main>
        <Outlet />
      </main>
      <nav className="menu-inferior">
        <NavLink to="/aluno" end>Home</NavLink>
        <NavLink to="/aluno/enquetes">Enquetes</NavLink>
        <NavLink to="/aluno/perfil">Perfil</NavLink>
      </nav>
    </div>
  );
}
