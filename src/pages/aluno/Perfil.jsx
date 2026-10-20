import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { buscarEstudante, listarComentariosDaEscola } from '../../api/endpoints.js';
import { contarVotos } from '../../hooks/useVoto.js';
import { inicial } from '../../utils.js';

function Opcao({ children, para, aoClicar, aberta }) {
  const seta = <span className={`perfil-seta${aberta ? ' aberta' : ''}`} aria-hidden="true">›</span>;
  if (para) return <Link to={para} className="perfil-opcao">{children}{seta}</Link>;
  return (
    <button type="button" className="perfil-opcao" onClick={aoClicar} aria-expanded={aberta}>
      {children}{seta}
    </button>
  );
}

// Tela "Perfil" do aluno (Figma): avatar, nome, matrícula, números e menu.
export default function Perfil() {
  const { sessao, logout } = useAuth();
  const navegar = useNavigate();
  const [estudante, setEstudante] = useState(null);
  const [comentarios, setComentarios] = useState(null);
  const [mostrarInfo, setMostrarInfo] = useState(false);
  const respondidas = contarVotos(sessao.id);

  useEffect(() => {
    let ativo = true;
    buscarEstudante(sessao.id)
      .then((dados) => ativo && setEstudante(dados))
      .catch(() => {}); // sem os dados extras a tela continua útil com o que está na sessão
    listarComentariosDaEscola(sessao.escolaId)
      .then((lista) => ativo && setComentarios(lista.filter((c) => (c.estudanteId ?? c.estudante?.id) === sessao.id).length))
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [sessao.id, sessao.escolaId]);

  const sair = () => {
    logout();
    navegar('/login');
  };

  return (
    <div className="aluno-pagina perfil">
      <div className="perfil-avatar">{inicial(sessao.nome)}</div>
      <h1 className="perfil-nome">{sessao.nome}</h1>
      {estudante?.matriculaEscolar && <p className="perfil-matricula">Matrícula {estudante.matriculaEscolar}</p>}

      <div className="perfil-stats">
        <div className="perfil-stat">
          <strong>{respondidas}</strong>
          <span>Enquetes respondidas</span>
        </div>
        <div className="perfil-stat">
          <strong>{comentarios ?? '—'}</strong>
          <span>Comentários feitos</span>
        </div>
      </div>

      <nav className="perfil-menu">
        <Opcao para="/aluno/perfil/editar">Editar perfil</Opcao>
        <Opcao aoClicar={() => setMostrarInfo((v) => !v)} aberta={mostrarInfo}>Informações do perfil</Opcao>
        {mostrarInfo && (
          <dl className="perfil-info">
            <dt>Nome</dt>
            <dd>{estudante?.nome ?? sessao.nome}</dd>
            <dt>E-mail</dt>
            <dd>{estudante?.email ?? '—'}</dd>
            <dt>Matrícula</dt>
            <dd>{estudante?.matriculaEscolar ?? '—'}</dd>
          </dl>
        )}
        <Opcao para="/aluno/saude">Saúde e alergias</Opcao>
        <button type="button" className="perfil-opcao desativada" disabled>
          Notificações <span className="perfil-breve">Em breve</span>
        </button>
        <button type="button" className="perfil-opcao desativada" disabled>
          Histórico de enquetes <span className="perfil-breve">Em breve</span>
        </button>
        <button type="button" className="perfil-opcao desativada" disabled>
          Ajuda e suporte <span className="perfil-breve">Em breve</span>
        </button>
      </nav>

      <button type="button" className="perfil-sair" onClick={sair}>Sair da conta</button>
    </div>
  );
}
