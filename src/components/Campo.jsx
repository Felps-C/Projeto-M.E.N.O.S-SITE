import { useState } from 'react';

function Olho({ aberto }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
      {!aberto && <path d="M3 3l18 18" />}
    </svg>
  );
}

// Campo com rótulo, mensagem de erro e (se tipo="senha") botão de mostrar/ocultar.
export default function Campo({ rotulo, tipo = 'text', erro, ...props }) {
  const [visivel, setVisivel] = useState(false);
  const ehSenha = tipo === 'senha';

  return (
    <div className="campo">
      <label>
        <span className="campo-rotulo">{rotulo}</span>
        <div className="campo-caixa">
          <input {...props} type={ehSenha ? (visivel ? 'text' : 'password') : tipo} />
          {ehSenha && (
            <button
              type="button"
              className="campo-olho"
              onClick={() => setVisivel((v) => !v)}
              aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <Olho aberto={visivel} />
            </button>
          )}
        </div>
      </label>
      {erro && <span className="campo-erro">{erro}</span>}
    </div>
  );
}
