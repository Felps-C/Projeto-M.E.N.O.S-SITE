import { useEffect, useState } from 'react';
import { comentar, listarComentarios } from '../api/endpoints.js';
import { formatarData } from '../utils.js';

// Janela que sobe de baixo (celular) com os comentários de um cardápio.
export default function Comentarios({ menuId, estudanteId, onFechar, onNovo }) {
  const [lista, setLista] = useState(null);
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    listarComentarios(menuId)
      .then(setLista)
      .catch((e) => setErro(e.message));
  }, [menuId]);

  async function enviar(evento) {
    evento.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    setErro('');
    try {
      const novo = await comentar(menuId, estudanteId, texto.trim());
      setLista((atual) => [novo, ...(atual || [])]);
      setTexto('');
      onNovo();
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="folha-fundo" onClick={onFechar}>
      <div className="folha" role="dialog" aria-label="Comentários" onClick={(e) => e.stopPropagation()}>
        <div className="folha-topo">
          <h3>Comentários</h3>
          <button type="button" className="folha-fechar" onClick={onFechar} aria-label="Fechar">✕</button>
        </div>

        <form onSubmit={enviar} className="comentar-form">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={255}
            rows={2}
            placeholder="Escreva um comentário sobre a merenda"
          />
          <button className="botao" disabled={enviando || !texto.trim()}>
            {enviando ? 'Enviando...' : 'Enviar'}
          </button>
        </form>

        {erro && <p className="aviso-erro">{erro}</p>}
        {lista === null && !erro && <p className="detalhe">Carregando...</p>}
        {lista && lista.length === 0 && <p className="detalhe">Ainda não há comentários. Seja o primeiro!</p>}

        <ul className="comentarios">
          {(lista || []).map((c) => (
            <li key={c.id}>
              <strong>{c.estudanteId === estudanteId ? 'Você' : 'Aluno'}</strong>
              <span className="detalhe"> · {formatarData(c.data)}</span>
              <p>{c.texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
