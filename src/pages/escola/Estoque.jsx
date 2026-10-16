import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { buscarAlertas, excluirProduto, listarProdutos } from '../../api/estoque.js';
import Mensagem from '../../components/Mensagem.jsx';
import PaginaTopo from '../../components/PaginaTopo.jsx';
import Selo from '../../components/Selo.jsx';
import { RECURSOS } from '../../config.js';
import { useEstoque } from '../../hooks/useEstoque.js';
import { selosDoProduto, situacaoDoEstoque, textoDeAtencao } from '../../utils/estoque.js';
import { formatarData, normalizarTexto } from '../../utils/formatar.js';
import MovimentarModal from './MovimentarModal.jsx';

export default function Estoque() {
  const { estoque, erro: erroEstoque } = useEstoque();
  const navegar = useNavigate();
  const location = useLocation();

  const [produtos, setProdutos] = useState([]);
  const [alertas, setAlertas] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState(location.state?.aviso || '');
  const [busca, setBusca] = useState('');
  const [movimentando, setMovimentando] = useState(null);

  // Limpa o aviso guardado na navegação, para ele não reaparecer ao atualizar a página.
  useEffect(() => {
    if (location.state?.aviso) navegar(location.pathname, { replace: true, state: null });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const carregar = useCallback(async () => {
    if (!estoque) return;
    try {
      const [lista, alertasRecebidos] = await Promise.all([
        listarProdutos(estoque.id),
        buscarAlertas(estoque.id, RECURSOS.diasParaVencer),
      ]);
      setProdutos(lista);
      setAlertas(alertasRecebidos);
      setErro('');
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setCarregando(false);
    }
  }, [estoque]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const situacao = useMemo(() => situacaoDoEstoque(alertas), [alertas]);
  const textoAtencao = useMemo(() => textoDeAtencao(situacao), [situacao]);

  const visiveis = useMemo(() => {
    const termo = normalizarTexto(busca.trim());
    if (!termo) return produtos;
    return produtos.filter((produto) => normalizarTexto(produto.nome).includes(termo));
  }, [produtos, busca]);

  const excluir = async (produto) => {
    if (!window.confirm(`Excluir "${produto.nome}" do estoque?`)) return;
    try {
      await excluirProduto(produto.id);
      setAviso(`"${produto.nome}" foi excluído.`);
      await carregar();
    } catch (falha) {
      setAviso('');
      setErro(falha.message); // ex.: produto em uso numa lista de compras
    }
  };

  const movimentacaoConcluida = async (mensagem) => {
    setMovimentando(null);
    setAviso(mensagem);
    await carregar();
  };

  const mostrarCategoria = RECURSOS.categoriaEUnidadeNoProduto;
  const colunas = mostrarCategoria ? 6 : 5;

  return (
    <div className="pagina">
      <PaginaTopo
        titulo="Estoque"
        subtitulo="Gerencie os produtos e acompanhe os níveis de segurança"
        acao={<Link to="/escola/estoque/novo" className="botao">+ Cadastrar produto</Link>}
      />

      {erroEstoque && <Mensagem>{erroEstoque}</Mensagem>}
      {erro && <Mensagem>{erro}</Mensagem>}
      {aviso && <Mensagem tipo="ok">{aviso}</Mensagem>}
      {textoAtencao && <Mensagem>{textoAtencao}</Mensagem>}

      <input
        type="search"
        className="busca"
        placeholder="Buscar produto..."
        aria-label="Buscar produto"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      {carregando && !erroEstoque ? (
        <p className="suave">Carregando estoque…</p>
      ) : (
        <div className="tabela-cartao">
          <div className="tabela-rolagem">
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  {mostrarCategoria && <th>Categoria</th>}
                  <th>Quantidade</th>
                  <th>Validade</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.length === 0 && (
                  <tr>
                    <td colSpan={colunas} className="vazio">
                      {produtos.length === 0
                        ? 'Nenhum produto cadastrado ainda. Use "+ Cadastrar produto" para começar.'
                        : 'Nenhum produto encontrado para essa busca.'}
                    </td>
                  </tr>
                )}
                {visiveis.map((produto) => {
                  const selos = selosDoProduto(produto, situacao);
                  return (
                    <tr key={produto.id}>
                      <td className="nome">{produto.nome}</td>
                      {mostrarCategoria && <td className="suave">{produto.categoria || '—'}</td>}
                      <td>
                        {produto.quantidade}
                        {mostrarCategoria && produto.unidade ? ` ${produto.unidade}` : ''}
                      </td>
                      <td className="suave">{formatarData(produto.validade)}</td>
                      <td>
                        {selos.length === 0 ? (
                          <Selo tipo="normal">Normal</Selo>
                        ) : (
                          selos.map((texto) => <Selo key={texto} tipo="alerta">{texto}</Selo>)
                        )}
                      </td>
                      <td>
                        <div className="acoes">
                          <button type="button" className="btn-texto" onClick={() => setMovimentando(produto)}>
                            Entrada/Saída
                          </button>
                          <Link
                            to={`/escola/estoque/${produto.id}/editar`}
                            className="btn-icone"
                            title="Editar"
                            aria-label={`Editar ${produto.nome}`}
                          >
                            ✎
                          </Link>
                          <button
                            type="button"
                            className="btn-icone"
                            title="Excluir"
                            aria-label={`Excluir ${produto.nome}`}
                            onClick={() => excluir(produto)}
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
        </div>
      )}

      {movimentando && (
        <MovimentarModal
          estoqueId={estoque.id}
          produto={movimentando}
          aoFechar={() => setMovimentando(null)}
          aoConcluir={movimentacaoConcluida}
        />
      )}
    </div>
  );
}
