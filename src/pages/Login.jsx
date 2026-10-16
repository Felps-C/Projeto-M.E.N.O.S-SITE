import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Campo from '../components/Campo.jsx';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { entrar } from '../api/endpoints.js';

const destino = (tipo) => (tipo === 'escola' ? '/escola/estoque' : '/aluno');

// Login único (como no Figma): matrícula ou CNPJ + senha. O backend decide se é aluno ou escola.
export default function Login() {
  const { sessao, login } = useAuth();
  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Já está logado: vai direto para a área certa.
  if (sessao) return <Navigate to={destino(sessao.tipo)} replace />;

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');
    setAviso('');
    if (!identificador.trim() || !senha) {
      setErro('Informe a matrícula (ou CNPJ) e a senha.');
      return;
    }
    setEnviando(true);
    try {
      const dados = await entrar(identificador.trim(), senha); // { tipo, id, escolaId, nome }
      login(dados); // ao guardar a sessão, a página redireciona sozinha
    } catch (e) {
      setErro(e.message);
      setEnviando(false);
    }
  }

  return (
    <div className="tela-auth">
      <Logo />
      <h1>Bem-vindo(a)</h1>
      <p className="subtitulo">Acesse sua conta para continuar</p>

      <form onSubmit={enviar} noValidate>
        <Campo
          rotulo="Matrícula ou CNPJ"
          value={identificador}
          onChange={(e) => setIdentificador(e.target.value)}
          placeholder="Digite sua matrícula ou CNPJ"
          autoComplete="username"
        />
        <Campo
          rotulo="Senha"
          tipo="senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Digite sua senha"
          autoComplete="current-password"
        />

        <button
          type="button"
          className="link-coral"
          onClick={() => setAviso('A recuperação de senha ainda não está disponível.')}
        >
          Esqueci minha senha
        </button>

        {erro && <p className="erro-geral" role="alert">{erro}</p>}
        {aviso && <p className="aviso-info">{aviso}</p>}

        <button className="botao botao-bloco" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="rodape-auth">
        Não tem login? <Link to="/cadastro">Cadastre-se</Link>
      </p>
    </div>
  );
}
