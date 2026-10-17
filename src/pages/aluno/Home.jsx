import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CardCardapio from '../../components/CardCardapio.jsx';
import CardEnquete from '../../components/CardEnquete.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { cardapiosDeHoje, enquetesAtivas } from '../../api/endpoints.js';
import { hojeISO, inicial } from '../../utils.js';

// Home do aluno: cardápio de hoje + enquete aberta (igual ao Figma).
export default function Home() {
  const { sessao } = useAuth();
  const [cardapios, setCardapios] = useState(null);
  const [enquetes, setEnquetes] = useState([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    Promise.all([cardapiosDeHoje(sessao.escolaId, hojeISO()), enquetesAtivas(sessao.escolaId)])
      .then(([listaCardapios, listaEnquetes]) => {
        if (!ativo) return;
        setCardapios(listaCardapios);
        setEnquetes(listaEnquetes.filter((e) => e.aberta));
      })
      .catch((e) => ativo && setErro(e.message));
    return () => {
      ativo = false;
    };
  }, [sessao.escolaId]);

  return (
    <>
      <header className="aluno-cabecalho">
        <div className="avatar">{inicial(sessao.nome)}</div>
        <div>
          <h1>Olá, {sessao.nome}!</h1>
          <p>Confira o cardápio e as enquetes de hoje</p>
        </div>
      </header>

      <div className="aluno-conteudo">
        <h2>Cardápio de hoje</h2>
        {erro && <p className="erro-geral">{erro}</p>}
        {!erro && cardapios === null && <p className="detalhe">Carregando...</p>}
        {cardapios && cardapios.length === 0 && (
          <p className="detalhe">A escola ainda não publicou o cardápio de hoje.</p>
        )}
        {(cardapios || []).map((c) => (
          <CardCardapio key={c.id} cardapio={c} estudanteId={sessao.id} />
        ))}

        {enquetes.length > 0 && (
          <>
            <CardEnquete key={enquetes[0].id} enquete={enquetes[0]} estudanteId={sessao.id} />
            {enquetes.length > 1 && (
              <p className="ver-mais"><Link to="/aluno/enquetes">Ver todas as enquetes</Link></p>
            )}
          </>
        )}
      </div>
    </>
  );
}
