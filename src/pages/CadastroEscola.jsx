import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Campo from '../components/Campo.jsx';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { cadastrarEscola, entrar } from '../api/endpoints.js';

const VAZIO = { nome: '', cnpj: '', email: '', senha: '', confirmar: '' };

function validar(f) {
  const e = {};
  if (!f.nome.trim()) e.nome = 'Informe o nome da escola';
  // Fase de testes: qualquer número serve, sem formato nem dígito verificador.
  // Para validar de verdade depois, use cnpjValido() de utils/cnpj.js.
  if (!f.cnpj.trim()) e.cnpj = 'Informe o CNPJ';
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Informe um e-mail válido';
  if (f.senha.length < 6) e.senha = 'A senha deve ter pelo menos 6 caracteres';
  if (f.confirmar !== f.senha) e.confirmar = 'As senhas não conferem';
  return e;
}

// Cadastro da escola (Figma: "Tela Cadastro Escola"). Chega aqui pelo botão da tela de cadastro do aluno.
export default function CadastroEscola() {
  const { sessao, login } = useAuth();
  const [form, setForm] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (sessao) return <Navigate to={sessao.tipo === 'escola' ? '/escola/estoque' : '/aluno'} replace />;

  const mudar = (campo) => (evento) => setForm((f) => ({ ...f, [campo]: evento.target.value }));

  async function enviar(evento) {
    evento.preventDefault();
    setErroGeral('');
    const problemas = validar(form);
    setErros(problemas);
    if (Object.keys(problemas).length > 0) return;

    setEnviando(true);
    try {
      await cadastrarEscola({
        nome: form.nome.trim(),
        cnpj: form.cnpj.trim(),
        email: form.email.trim(),
        senha: form.senha,
      });
      // Conta criada: já entra no sistema (o login devolve o token; a página redireciona para o Estoque).
      login(await entrar(form.email.trim(), form.senha));
    } catch (e) {
      setErroGeral(e.message); // ex.: "Já existe uma escola com este CNPJ"
      setEnviando(false);
    }
  }

  return (
    <div className="tela-auth-escola">
      <div className="cartao-auth">
        <Logo />
        <h1>Crie a conta da escola</h1>
        <p className="subtitulo">Preencha os dados para começar</p>

        <form onSubmit={enviar} noValidate>
          <Campo rotulo="Nome da escola" value={form.nome} onChange={mudar('nome')} placeholder="Ex: Escola Municipal Irecê" erro={erros.nome} autoComplete="organization" />
          <Campo
            rotulo="CNPJ"
            value={form.cnpj}
            onChange={mudar('cnpj')}
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
            erro={erros.cnpj}
          />
          <Campo rotulo="E-mail institucional" tipo="email" value={form.email} onChange={mudar('email')} placeholder="contato@escola.edu.br" erro={erros.email} autoComplete="email" />
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
        <p className="rodape-auth rodape-troca">
          Você é aluno? <Link to="/cadastro">Cadastre-se como aluno</Link>
        </p>
      </div>
    </div>
  );
}
