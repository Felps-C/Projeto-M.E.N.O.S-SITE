import { useVoto } from '../hooks/useVoto.js';

// Card da tela "Enquetes" do aluno (Figma): prato, pergunta e opções.
// Antes de votar são botões; depois, barras finas com o percentual.
export default function CardEnqueteLista({ enquete, estudanteId }) {
  const { votou, resultado, erro, enviando, escolher } = useVoto(enquete, estudanteId);

  return (
    <article className="enquete-card">
      {enquete.merendaNome && <p className="enquete-prato">{enquete.merendaNome}</p>}
      <h3 className="enquete-pergunta">{enquete.titulo}</h3>

      {!votou &&
        enquete.opcoes.map((o) => (
          <button key={o.id} type="button" className="enquete-opcao" disabled={enviando} onClick={() => escolher(o.id)}>
            {o.descricao}
          </button>
        ))}

      {votou && resultado &&
        resultado.opcoes.map((o) => (
          <div key={o.opcaoId} className="enquete-resultado">
            <div className="enquete-resultado-linha">
              <span>{o.descricao}</span>
              <span>{Math.round(o.percentual)}%</span>
            </div>
            <div className="enquete-trilho">
              <div className="enquete-preenche" style={{ width: `${o.percentual}%` }} />
            </div>
          </div>
        ))}

      {votou && !resultado && !erro && <p className="detalhe">Carregando resultado...</p>}
      {votou && resultado && <p className="enquete-total">Obrigado por votar! {resultado.totalVotos} voto(s) no total.</p>}
      {erro && <p className="aviso-erro">{erro}</p>}
    </article>
  );
}
