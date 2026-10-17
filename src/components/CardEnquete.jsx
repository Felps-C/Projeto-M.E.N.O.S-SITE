import { useVoto } from '../hooks/useVoto.js';

// Card de enquete da Home: botões para votar; depois de votar, mostra o resultado em barras.
export default function CardEnquete({ enquete, estudanteId }) {
  const { votou, resultado, erro, enviando, escolher } = useVoto(enquete, estudanteId);

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
