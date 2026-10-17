import { useCallback, useEffect, useMemo, useState } from 'react';
import { listarEstudantesDaEscola } from '../../api/endpoints.js';
import { gerarRelatorio, listarRelatorios } from '../../api/relatorios.js';
import Mensagem from '../../components/Mensagem.jsx';
import PaginaTopo from '../../components/PaginaTopo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { contarRestricoes } from '../../utils/alergias.js';
import { formatarData } from '../../utils/formatar.js';
import { baixarArquivo, intervaloDoPeriodo, opcaoLider, PERIODOS, relatorioParaCsv } from '../../utils/relatorio.js';

const arredondar = (n) => Math.round(n * 10) / 10;

function Resumo({ rotulo, valor }) {
  return (
    <div className="resumo-card">
      <span>{rotulo}</span>
      <strong>{valor}</strong>
    </div>
  );
}

function Barra({ percentual }) {
  return (
    <div className="barra-fundo" aria-hidden="true">
      <div className="barra-valor" style={{ width: `${Math.min(100, Math.max(0, percentual))}%` }} />
    </div>
  );
}

export default function Relatorios() {
  const { sessao } = useAuth();
  const escolaId = sessao.escolaId ?? sessao.id;

  const [periodo, setPeriodo] = useState('7');
  const [relatorio, setRelatorio] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState('');
  const [estudantes, setEstudantes] = useState(null);
  const [erroRestricoes, setErroRestricoes] = useState('');

  // Restrições alimentares: são os dados atuais dos alunos, não dependem do período do relatório.
  useEffect(() => {
    let ativo = true;
    listarEstudantesDaEscola(escolaId)
      .then((lista) => ativo && setEstudantes(lista))
      .catch((falha) => ativo && setErroRestricoes(falha.message));
    return () => {
      ativo = false;
    };
  }, [escolaId]);
  const restricoes = useMemo(() => (estudantes ? contarRestricoes(estudantes) : null), [estudantes]);

  // Ao abrir a tela mostra o relatório mais recente já gerado (não cria um novo a cada visita).
  useEffect(() => {
    let ativo = true;
    listarRelatorios(escolaId)
      .then((lista) => {
        if (!ativo) return;
        const maisRecente = [...lista].sort((a, b) => new Date(b.dataGeracao) - new Date(a.dataGeracao))[0];
        setRelatorio(maisRecente ?? null);
      })
      .catch((falha) => ativo && setErro(falha.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [escolaId]);

  const gerar = useCallback(async () => {
    setGerando(true);
    setErro('');
    try {
      const { dataInicio, dataFim } = intervaloDoPeriodo(periodo);
      setRelatorio(await gerarRelatorio(escolaId, dataInicio, dataFim));
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setGerando(false);
    }
  }, [escolaId, periodo]);

  const exportarExcel = () =>
    baixarArquivo('relatorio-menos.csv', relatorioParaCsv(relatorio, restricoes), 'text/csv;charset=utf-8');
  const exportarPdf = () => window.print(); // no diálogo de impressão, escolha "Salvar como PDF"

  const enquetes = relatorio?.enquetes ?? [];
  const comentarios = relatorio?.feedbacks?.recentes ?? [];

  const acoes = (
    <div className="relatorio-acoes">
      <select
        className="filtro-periodo"
        aria-label="Período do relatório"
        value={periodo}
        onChange={(e) => setPeriodo(e.target.value)}
      >
        {PERIODOS.map((p) => (
          <option key={p.valor} value={p.valor}>{p.rotulo}</option>
        ))}
      </select>
      <button type="button" className="botao" onClick={gerar} disabled={gerando}>
        {gerando ? 'Gerando…' : 'Gerar relatório'}
      </button>
      <button type="button" className="botao neutro" onClick={exportarPdf} disabled={!relatorio}>PDF</button>
      <button type="button" className="botao neutro" onClick={exportarExcel} disabled={!relatorio}>Excel</button>
    </div>
  );

  return (
    <div className="pagina relatorios">
      <PaginaTopo
        titulo="Relatórios"
        subtitulo="Aceitação da merenda com base nas enquetes e feedbacks"
        acao={acoes}
      />

      {erro && <Mensagem>{erro}</Mensagem>}

      {carregando ? (
        <p className="suave">Carregando relatório…</p>
      ) : !relatorio ? (
        <div className="tabela-cartao">
          <p className="vazio-relatorio">
            Nenhum relatório gerado ainda. Escolha o período e clique em "Gerar relatório".
          </p>
        </div>
      ) : (
        <>
          <p className="suave relatorio-info">
            Gerado em {formatarData(relatorio.dataGeracao)}
            {relatorio.dataInicio ? ` · período de ${formatarData(relatorio.dataInicio)} a ${formatarData(relatorio.dataFim)}` : ' · todo o período'}
          </p>

          <div className="resumo-grade">
            <Resumo rotulo="Enquetes no período" valor={relatorio.totalEnquete} />
            <Resumo rotulo="Respostas coletadas" valor={relatorio.totalVotos} />
            <Resumo rotulo="Média de votos por enquete" valor={String(arredondar(relatorio.mediaVotos)).replace('.', ',')} />
            <Resumo rotulo="Comentários recebidos" valor={relatorio.feedbacks?.total ?? 0} />
          </div>

          <section className="tabela-cartao">
            <h2 className="cartao-titulo">Enquetes do período</h2>
            <div className="tabela-rolagem">
              <table>
                <thead>
                  <tr>
                    <th>Pergunta</th>
                    <th>Respostas</th>
                    <th>Opção mais votada</th>
                    <th>Aceitação</th>
                  </tr>
                </thead>
                <tbody>
                  {enquetes.length === 0 && (
                    <tr><td colSpan={4} className="vazio">Nenhuma enquete neste período.</td></tr>
                  )}
                  {enquetes.map((enquete) => {
                    const lider = opcaoLider(enquete);
                    return (
                      <tr key={enquete.enqueteId}>
                        <td className="nome">{enquete.titulo}</td>
                        <td className="suave">{enquete.totalVotos}</td>
                        <td className="suave">{lider ? lider.descricao : '—'}</td>
                        <td>
                          {lider ? (
                            <div className="aceitacao">
                              <Barra percentual={lider.percentual} />
                              <span>{Math.round(lider.percentual)}%</span>
                            </div>
                          ) : (
                            <span className="suave">Sem votos</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="tabela-cartao">
            <h2 className="cartao-titulo">Comentários recentes</h2>
            {comentarios.length === 0 ? (
              <p className="vazio-relatorio">Nenhum comentário neste período.</p>
            ) : (
              <ul className="lista-comentarios">
                {comentarios.map((c) => (
                  <li key={c.id}>
                    <span className="suave">{formatarData(c.data)}</span>
                    <p>{c.texto}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

        </>
      )}

      <section className="tabela-cartao restricoes">
        <h2 className="cartao-titulo">Restrições alimentares e alergias dos alunos</h2>
        {erroRestricoes ? (
          <p className="vazio-relatorio">{erroRestricoes}</p>
        ) : !restricoes ? (
          <p className="vazio-relatorio">Carregando…</p>
        ) : restricoes.total === 0 ? (
          <p className="vazio-relatorio">Nenhum aluno cadastrado nesta escola ainda.</p>
        ) : (
          <>
            <p className="restricoes-info suave">
              {restricoes.preencheram} de {restricoes.total} {restricoes.total === 1 ? 'aluno preencheu' : 'alunos preencheram'} a
              ficha de Saúde e Alergias. A proporção é calculada sobre todos os alunos da escola.
            </p>
            <div className="tabela-rolagem">
              <table>
                <thead>
                  <tr>
                    <th>Restrição / Alergia</th>
                    <th>Alunos</th>
                    <th>Proporção</th>
                  </tr>
                </thead>
                <tbody>
                  {restricoes.linhas.map((l) => (
                    <tr key={l.restricao}>
                      <td className="nome">{l.restricao}</td>
                      <td className="suave">{l.alunos} {l.alunos === 1 ? 'aluno' : 'alunos'}</td>
                      <td>
                        <div className="aceitacao">
                          <Barra percentual={l.percentual} />
                          <span>{l.percentual}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {restricoes.comObservacao > 0 && (
                    <tr>
                      <td className="nome">Outras observações informadas</td>
                      <td className="suave">{restricoes.comObservacao} {restricoes.comObservacao === 1 ? 'aluno' : 'alunos'}</td>
                      <td>
                        <div className="aceitacao">
                          <Barra percentual={restricoes.percentual(restricoes.comObservacao)} />
                          <span>{restricoes.percentual(restricoes.comObservacao)}%</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <p className="suave relatorio-info">
        Em breve: aceitação por prato e ao longo da semana (o backend ainda não calcula esses dados).
      </p>
    </div>
  );
}
