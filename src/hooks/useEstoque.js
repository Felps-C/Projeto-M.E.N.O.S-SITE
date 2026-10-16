import { useEffect, useState } from 'react';
import { obterOuCriarEstoque } from '../api/estoque.js';
import { useAuth } from '../context/AuthContext.jsx';

// Descobre (e cria, se for a primeira vez) o estoque da escola que está logada.
export function useEstoque() {
  const { sessao } = useAuth();
  const escolaId = sessao.escolaId ?? sessao.id;
  const [estoque, setEstoque] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    setErro('');
    obterOuCriarEstoque(escolaId)
      .then((resultado) => ativo && setEstoque(resultado))
      .catch((falha) => ativo && setErro(falha.message));
    return () => {
      ativo = false;
    };
  }, [escolaId]);

  return { estoque, erro };
}
