import { useEffect, useState } from 'react';
import CardEnqueteLista from '../../components/CardEnqueteLista.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { enquetesAtivas } from '../../api/endpoints.js';

// Tela "Enquetes" do aluno: todas as enquetes abertas da escola.
export default function Enquetes() {
  const { sessao } = useAuth();
  const [enquetes, setEnquetes] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    enquetesAtivas(sessao.escolaId)
      .then((lista) => ativo && setEnquetes(lista.filter((e) => e.aberta)))
      .catch((e) => ativo && setErro(e.message));
    return () => {
      ativo = false;
    };
  }, [sessao.escolaId]);

  return (
    <div className="aluno-pagina">
      <h1>Enquetes</h1>
      <p className="aluno-pagina-sub">Dê sua opinião sobre a merenda da semana</p>

      {erro && <p className="erro-geral" role="alert">{erro}</p>}
      {!erro && enquetes === null && <p className="detalhe">Carregando...</p>}
      {enquetes && enquetes.length === 0 && <p className="detalhe">Não há enquetes abertas no momento.</p>}

      {(enquetes || []).map((e) => (
        <CardEnqueteLista key={e.id} enquete={e} estudanteId={sessao.id} />
      ))}
    </div>
  );
}
