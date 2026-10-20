import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Campo from '../components/Campo.jsx';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { cadastrarEstudante, entrar, listarEscolas } from '../api/endpoints.js';

const VAZIO = { escolaId: '', nome: '', matriculaEscolar: '', email: '', senha: '', confirmar: '' };

function validar(f) {
  const e = {};
  if (!f.escolaId) e.escolaId = 'Escolha a sua escola';
  if (!f.nome.trim()) e.nome = 'Informe o seu nome';
  if (!f.matriculaEscolar.trim()) e.matriculaEscolar = 'Informe a sua matrícula';
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Informe um e-mail válido';
  if (f.senha.length < 6) e.senha = 'A senha deve ter pelo menos 6 caracteres';
  if (f.confirmar !== f.senha) e.confirmar = 'As senhas não conferem';
  return e;
}

// Cadastro do aluno. Além de matrícula e senha (Figma), o backend também exige nome, e-mail e escola.
export default function Cadastro() {
  const { sessao, login } = useAuth();
  const [form, setForm] = useState(VAZIO);
  const [escolas, setEscolas] = useState([]);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [recemCadastrado, setRecemCadastrado] = useState(false);

  useEffect(() => {
    listarEscolas()
      .then(setEscolas)
      .catch((e) => setErroGeral(e.message));
  }, []);

  if (sessao) {
    // Quem acabou de criar a conta preenche "Saúde e Alergias" antes de ir para a Home.
    const destino = sessao.tipo === 'escola' ? '/escola/estoque' : recemCadastrado ? '/aluno/saude' : '/aluno';
    return <Navigate to={destino} replace />;
  }

  const mudar = (campo) => (evento) => setForm((f) => ({ ...f, [campo]: evento.target.value }));

  async function enviar(evento) {
    evento.preventDefault();
    setErroGeral('');
    const problemas = validar(form);
    setErros(problemas);
    if (Object.keys(problemas).length > 0) return;

    setEnviando(true);
    try {
      await cadastrarEstudante({
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
        matriculaEscolar: form.matriculaEscolar.trim(),
        escolaId: Number(form.escolaId),
      });
      // Conta criada: já entra no sistema (o login devolve o token que a API exige).
      const dados = await entrar(form.email.trim(), form.senha);
      setRecemCadastrado(true);
      login(dados);
    } catch (e) {
      setErroGeral(e.message);
      setEnviando(false);
    }
  }

  return (
    <div className="tela-auth">
      <Logo />
      <h1>Crie sua conta</h1>
      <p className="subtitulo">Preencha os dados para começar</p>

      <form onSubmit={enviar} noValidate>
        <div className="campo">
          <label>
            <span className="campo-rotulo">Escola</span>
            <div className="campo-caixa">
              <select value={form.escolaId} onChange={mudar('escolaId')}>
                <option value="">Selecione a sua escola</option>
                {escolas.map((e) => (
                  <option key={e.id} value={e.id}>{e.nome}</option>
                ))}
              </select>
            </div>
          </label>
          {erros.escolaId && <span className="campo-erro">{erros.escolaId}</span>}
        </div>

        <Campo rotulo="Nome" value={form.nome} onChange={mudar('nome')} placeholder="Digite seu nome" erro={erros.nome} autoComplete="name" />
        <Campo rotulo="Matrícula" value={form.matriculaEscolar} onChange={mudar('matriculaEscolar')} placeholder="Digite sua matrícula" erro={erros.matriculaEscolar} />
        <Campo rotulo="E-mail" tipo="email" value={form.email} onChange={mudar('email')} placeholder="Digite seu e-mail" erro={erros.email} autoComplete="email" />
        <Campo rotulo="Senha" tipo="senha" value={form.senha} onChange={mudar('senha')} placeholder="Crie uma senha" erro={erros.senha} autoComplete="new-password" />
        <Campo rotulo="Confirmar senha" tipo="senha" value={form.confirmar} onChange={mudar('confirmar')} placeholder="Repita a senha" erro={erros.confirmar} autoComplete="new-password" />

        {erroGeral && <p className="erro-geral" role="alert">{erroGeral}</p>}

        <button className="botao botao-bloco" disabled={enviando}>
          {enviando ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      <p className="rodape-auth">
        Já tem conta? <Link to="/login">Faça login</Link>
      </p>

      <div className="troca-cadastro">
        <span>É uma escola?</span>
        <Link to="/cadastro/escola" className="botao contorno">Cadastrar minha escola</Link>
      </div>
    </div>
  );
}
