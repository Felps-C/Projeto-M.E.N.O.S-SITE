import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { alternarCurtida, resumoCardapio } from '../api/endpoints.js';
import Comentarios from './Comentarios.jsx';

// Card do cardápio de hoje: foto, pratos, curtir e comentar.
export default function CardCardapio({ cardapio, estudanteId }) {
  const pratos = cardapio.merendas || [];
  const principal = pratos[0];

  const [resumo, setResumo] = useState({ curtidas: 0, curtiu: false, comentarios: 0 });
  const [semFoto, setSemFoto] = useState(false);
  const [comentando, setComentando] = useState(false);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    resumoCardapio(cardapio.id, estudanteId)
      .then(setResumo)
      .catch(() => {});
  }, [cardapio.id, estudanteId]);

  async function curtir() {
    const antes = resumo;
    setAviso('');
    // Atualiza a tela na hora; se o servidor recusar, volta ao que era.
    setResumo({ ...antes, curtiu: !antes.curtiu, curtidas: antes.curtidas + (antes.curtiu ? -1 : 1) });
    try {
      await alternarCurtida(cardapio.id, estudanteId, antes.curtiu);
    } catch {
      setResumo(antes);
      setAviso('Não foi possível curtir agora.');
    }
  }

  const detalhe = [principal?.tipoRefeicao, principal?.descricao].filter(Boolean).join(' · ');

  return (
    <article className="cartao-aluno">
      {principal && !semFoto && (
        <img
          className="foto-prato"
          src={api.url(`/merendas/${principal.id}/imagem`)}
          alt={principal.nome}
          onError={() => setSemFoto(true)}
        />
      )}
      <h3>{pratos.map((p) => p.nome).join(', ') || 'Cardápio'}</h3>
      {detalhe && <p className="detalhe">{detalhe}</p>}

      <div className="acoes">
        <button type="button" className={`acao${resumo.curtiu ? ' ativa' : ''}`} onClick={curtir}>
          {resumo.curtiu ? '♥' : '♡'} Curtir ({resumo.curtidas})
        </button>
        <button type="button" className="acao" onClick={() => setComentando(true)}>
          💬 Comentar ({resumo.comentarios})
        </button>
      </div>
      {aviso && <p className="aviso-erro">{aviso}</p>}

      {comentando && (
        <Comentarios
          menuId={cardapio.id}
          estudanteId={estudanteId}
          onFechar={() => setComentando(false)}
          onNovo={() => setResumo((r) => ({ ...r, comentarios: r.comentarios + 1 }))}
        />
      )}
    </article>
  );
}
