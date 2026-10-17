import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Campo from '../../components/Campo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { atualizarEstudante, buscarEstudante } from '../../api/endpoints.js';

// Tela "Editar perfil" do aluno: nome, e-mail, matrícula e (opcional) nova senha.
export default function EditarPerfil() {
  const { sessao, login } = useAuth();
  const navegar = useNavigate();
  const [estudante, setEstudante] = useState(null);
  const [form, setForm] = useState({ nome: '', email: '', matriculaEscolar: '', senha: '' });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;
    buscarEstudante(sessao.id)
      .then((dados) => {
        if (!ativo) return;
        setEstudante(dados);
        setForm({ nome: dados.nome, email: dados.email, matriculaEscolar: dados.matriculaEscolar, senha: '' });
      })
      .catch((e) => ativo && setErroGeral(e.message));
    return () => {
      ativo = false;
    };
  }, [sessao.id]);

  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  function validar() {
    const novo = {};
    if (!form.nome.trim()) novo.nome = 'Informe seu nome';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) novo.email = 'Informe um e-mail válido';
    if (!form.matriculaEscolar.trim()) novo.matriculaEscolar = 'Informe sua matrícula';
    if (form.senha && form.senha.length < 6) novo.senha = 'A senha deve ter pelo menos 6 caracteres';
    return novo;
  }

  async function salvar(evento) {
    evento.preventDefault();
    setErroGeral('');
    const problemas = validar();
    setErros(problemas);
    if (Object.keys(problemas).length > 0) return;

    setSalvando(true);
    try {
      const atualizado = await atualizarEstudante(sessao.id, {
        nome: form.nome.trim(),
        email: form.email.trim(),
        matriculaEscolar: form.matriculaEscolar.trim(),
        escolaId: estudante.escolaId,
        alergias: estudante.alergias, // mantém o que o aluno já informou em "Saúde e Alergias"
        senha: form.senha || undefined, // sem senha nova, o backend mantém a atual
      });
      login({ ...sessao, nome: atualizado?.nome ?? form.nome.trim() });
      navegar('/aluno/perfil');
    } catch (e) {
      setErroGeral(e.message);
      setSalvando(false);
    }
  }

  return (
    <form className="aluno-pagina" onSubmit={salvar} noValidate>
      <h1>Editar perfil</h1>
      <p className="aluno-pagina-sub">Atualize seus dados de acesso</p>

      {!estudante && !erroGeral && <p className="detalhe">Carregando...</p>}

      {estudante && (
        <>
          <Campo rotulo="Nome" value={form.nome} onChange={mudar('nome')} erro={erros.nome} autoComplete="name" />
          <Campo rotulo="E-mail" type="email" value={form.email} onChange={mudar('email')} erro={erros.email} autoComplete="email" />
          <Campo rotulo="Matrícula" value={form.matriculaEscolar} onChange={mudar('matriculaEscolar')} erro={erros.matriculaEscolar} />
          <Campo
            rotulo="Nova senha (opcional)"
            tipo="senha"
            value={form.senha}
            onChange={mudar('senha')}
            erro={erros.senha}
            placeholder="Deixe em branco para manter a atual"
            autoComplete="new-password"
          />
        </>
      )}

      {erroGeral && <p className="erro-geral" role="alert">{erroGeral}</p>}

      <button className="botao botao-bloco" disabled={!estudante || salvando}>
        {salvando ? 'Salvando...' : 'Salvar alterações'}
      </button>
      <Link to="/aluno/perfil" className="perfil-cancelar">Cancelar</Link>
    </form>
  );
}
