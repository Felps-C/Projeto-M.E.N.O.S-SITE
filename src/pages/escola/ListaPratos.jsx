import { useCallback, useEffect, useMemo, useState } from 'react';
import Mensagem from '../../components/Mensagem.jsx';
import Selo from '../../components/Selo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { excluirCardapio, listarCardapiosDaEscola, urlImagemPrato } from '../../api/endpoints.js';
import { alternarPublicacao, excluirPratoDoCardapio, linhasDoCardapio } from '../../utils/cardapio.js';
import { formatarData, hojeISO } from '../../utils.js';
import EditarPratoModal from './EditarPratoModal.jsx';

const FILTROS = [
  ['proximos', 'De hoje em diante'],
  ['anteriores', 'Anteriores'],
  ['todos', 'Todos'],
];

function Foto({ pratoId }) {
  const [ok, setOk] = useState(true);
  if (!ok) return <span className="prato-miniatura vazia" aria-hidden="true">🍽</span>;
  return <img className="prato-miniatura" src={urlImagemPrato(pratoId)} alt="" onError={() => setOk(false)} />;
}

// Lista dos pratos já publicados, com editar, ocultar/publicar e excluir.
// "recarregar" muda toda vez que um prato novo é publicado no formulário de cima.
export default function ListaPratos({ recarregar }) {
  const { sessao } = useAuth();
  const [cardapios, setCardapios] = useState(null);
  const [filtro, setFiltro] = useState('proximos');
  const [editando, setEditando] = useState(null); // { menu, prato }
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  const carregar = useCallback(async () => {
    try {
      setCardapios(await listarCardapiosDaEscola(sessao.escolaId));
    } catch (e) {
      setErro(e.message);
      setCardapios([]);
    }
  }, [sessao.escolaId]);

  useEffect(() => {
    carregar();
  }, [carregar, recarregar]);

  const hoje = hojeISO();
  const linhas = useMemo(() => {
    const todas = linhasDoCardapio(cardapios ?? []);
    if (filtro === 'proximos') return todas.filter((l) => l.menu.dataInicio >= hoje).reverse(); // mais próximo primeiro
    if (filtro === 'anteriores') return todas.filter((l) => l.menu.dataInicio < hoje);
    return todas;
  }, [cardapios, filtro, hoje]);

  async function executar(acao, mensagem) {
    setErro('');
    setAviso('');
    try {
      await acao();
      setAviso(mensagem);
    } catch (e) {
      setErro(e.message);
    }
    await carregar();
  }

  const alternar = ({ menu, prato }) =>
    executar(
      () => alternarPublicacao(menu),
      menu.ativa ? `"${prato?.nome ?? 'Cardápio'}" foi ocultado dos alunos.` : `"${prato?.nome ?? 'Cardápio'}" voltou a aparecer para os alunos.`,
    );

  const excluir = ({ menu, prato }) => {
    const texto = prato ? `Excluir o prato "${prato.nome}" do cardápio de ${formatarData(menu.dataInicio)}?` : 'Excluir este cardápio vazio?';
    if (!window.confirm(texto)) return undefined;
    return executar(
      () => (prato ? excluirPratoDoCardapio(menu, prato) : excluirCardapio(menu.id)),
      prato ? `Prato "${prato.nome}" excluído.` : 'Cardápio excluído.',
    );
  };

  return (
    <section className="tabela-cartao lista-pratos">
      <div className="lista-pratos-topo">
        <h2 className="cartao-titulo">Pratos publicados</h2>
        <select className="filtro-periodo" aria-label="Filtrar pratos" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          {FILTROS.map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
        </select>
      </div>

      {aviso && <Mensagem tipo="ok">{aviso}</Mensagem>}
      {erro && <Mensagem>{erro}</Mensagem>}

      {cardapios === null ? (
        <p className="vazio-relatorio">Carregando pratos…</p>
      ) : (
        <div className="tabela-rolagem">
          <table>
            <thead>
              <tr>
                <th>Prato</th>
                <th>Refeição</th>
                <th>Data</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {linhas.length === 0 && (
                <tr><td colSpan={5} className="vazio">Nenhum prato {filtro === 'todos' ? 'publicado ainda' : 'neste filtro'}.</td></tr>
              )}
              {linhas.map((linha) => {
                const { menu, prato, chave } = linha;
                return (
                  <tr key={chave}>
                    <td>
                      <div className="prato-celula">
                        {prato ? <Foto pratoId={prato.id} /> : <span className="prato-miniatura vazia" aria-hidden="true">—</span>}
                        <div>
                          <div className="nome">{prato ? prato.nome : 'Cardápio sem pratos'}</div>
                          {prato?.descricao && <div className="suave prato-descricao">{prato.descricao}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="suave">{prato?.tipoRefeicao || '—'}</td>
                    <td className="suave">
                      {formatarData(menu.dataInicio)}
                      {menu.dataInicio === hoje && <> · hoje</>}
                    </td>
                    <td>{menu.ativa ? <Selo tipo="normal">Publicado</Selo> : <Selo tipo="alerta">Oculto</Selo>}</td>
                    <td>
                      <div className="acoes">
                        {prato && (
                          <button type="button" className="btn-texto" onClick={() => setEditando({ menu, prato })}>Editar</button>
                        )}
                        {prato && (
                          <button type="button" className="btn-texto" onClick={() => alternar(linha)}>
                            {menu.ativa ? 'Ocultar' : 'Publicar'}
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-icone"
                          title="Excluir"
                          aria-label={`Excluir ${prato ? prato.nome : 'cardápio vazio'}`}
                          onClick={() => excluir(linha)}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editando && (
        <EditarPratoModal
          menu={editando.menu}
          prato={editando.prato}
          aoFechar={() => setEditando(null)}
          aoConcluir={(mensagem) => {
            setEditando(null);
            setErro('');
            setAviso(mensagem);
            carregar();
          }}
        />
      )}
    </section>
  );
}
