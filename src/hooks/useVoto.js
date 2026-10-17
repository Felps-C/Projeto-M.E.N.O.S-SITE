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

// Lógica de votar numa enquete (usada pelos cards da Home e da tela de Enquetes).
export function useVoto(enquete, estudanteId) {
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

  return { votou, resultado, erro, enviando, escolher };
}

// Quantas enquetes este aluno já respondeu neste aparelho (o backend ainda não tem essa contagem).
export function contarVotos(estudanteId) {
  try {
    return JSON.parse(localStorage.getItem(chave(estudanteId)) || '[]').length;
  } catch {
    return 0;
  }
}
