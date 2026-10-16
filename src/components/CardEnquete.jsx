import { useEffect, useState } from 'react';
import { resultadoEnquete, votar } from '../api/endpoints.js';

// O backend ainda não informa se o aluno já votou; por enquanto o navegador lembra.
const chave = (estudanteId) => `menos_votos_${estudanteId}`;

function jaVotei(estudanteId, enqueteId) {
  try {
    return JSON.parse(localStorage.getItem(chave(estudanteId)) || '[]').includes(enqueteId);
  } catch {
    return false;
  }
}

function lembrarVoto(estudanteId, enqueteId) {
  try {
    const lista = JSON.parse(localStorage.getItem(chave(estudanteId)) || '[]');
    localStorage.setItem(chave(estudanteId), JSON.stringify([...lista, enqueteId]));
  } catch {
    // sem armazenamento: o aluno só verá os botões de novo
  }
}

// Card de enquete: botões para votar; depois de votar, mostra o resultado em barras.
export default function CardEnquete({ enquete, estudanteId }) {
  const [votou, setVotou] = useState(() => jaVotei(estudanteId, enquete.id));
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!votou) return;
    resultadoEnquete(enquete.id)
      .then(setResultado)
      .catch((e) => setErro(e.message));
  }, [votou, enquete.id]);

  async function escolher(opcaoId) {
    setEnviando(true);
    setErro('');
    try {
      await votar(enquete.id, estudanteId, opcaoId);
    } catch (e) {
      // "já votou" não é erro para o aluno: só mostramos o resultado.
      if (!(e.status === 409 && /já votou/i.test(e.message))) {
        setErro(e.message);
        setEnviando(false);
        return;
      }
    }
    lembrarVoto(estudanteId, enquete.id);
    setVotou(true);
    setEnviando(false);
  }

  return (
    <article className="cartao-aluno">
      <h3>Enquete: {enquete.titulo}</h3>
      {enquete.merendaNome && <p className="detalhe">Prato: {enquete.merendaNome}</p>}

      {!votou &&
        enquete.opcoes.map((o) => (
          <button key={o.id} type="button" className="opcao" disabled={enviando} onClick={() => escolher(o.id)}>
            {o.descricao}
          </button>
        ))}

      {votou && resultado &&
        resultado.opcoes.map((o) => (
          <div key={o.opcaoId} className="opcao resultado">
            <div className="barra" style={{ width: `${o.percentual}%` }} />
            <span>{o.descricao} — {Math.round(o.percentual)}%</span>
          </div>
        ))}

      {votou && !resultado && !erro && <p className="detalhe">Carregando resultado...</p>}
      {votou && resultado && <p className="detalhe">Obrigado por votar! Total de votos: {resultado.totalVotos}</p>}
      {erro && <p className="aviso-erro">{erro}</p>}
    </article>
  );
}
