import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { atualizarProduto, buscarProduto, criarProduto } from '../../api/estoque.js';
import Campo from '../../components/Campo.jsx';
import Mensagem from '../../components/Mensagem.jsx';
import PaginaTopo from '../../components/PaginaTopo.jsx';
import { RECURSOS } from '../../config.js';
import { useEstoque } from '../../hooks/useEstoque.js';

const VAZIO = { nome: '', categoria: '', unidade: '', quantidade: '', estoqueMinimo: '', validade: '' };
const INTEIRO = /^\d+$/;

function validar(valores) {
  const erros = {};
  if (!valores.nome.trim()) erros.nome = 'Informe o nome do produto.';
  if (!INTEIRO.test(valores.quantidade)) erros.quantidade = 'Informe um número inteiro (0 ou mais).';
  if (valores.estoqueMinimo !== '' && !INTEIRO.test(valores.estoqueMinimo)) {
    erros.estoqueMinimo = 'Informe um número inteiro (0 ou mais).';
  }
  if (!valores.validade) erros.validade = 'Informe a data de validade.';
  return erros;
}

// Serve para cadastrar (/escola/estoque/novo) e editar (/escola/estoque/:produtoId/editar).
export default function ProdutoForm() {
  const { produtoId } = useParams();
  const editando = Boolean(produtoId);
  const navegar = useNavigate();
  const { estoque, erro: erroEstoque } = useEstoque();

  const [valores, setValores] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!editando) return;
    buscarProduto(produtoId)
      .then((produto) =>
        setValores({
          nome: produto.nome ?? '',
          categoria: produto.categoria ?? '',
          unidade: produto.unidade ?? '',
          quantidade: String(produto.quantidade ?? 0),
          estoqueMinimo: String(produto.estoqueMinimo ?? 0),
          validade: produto.validade ?? '',
        })
      )
      .catch((falha) => setErroGeral(falha.message))
      .finally(() => setCarregando(false));
  }, [editando, produtoId]);

  const alterar = (campo) => (evento) => setValores((atual) => ({ ...atual, [campo]: evento.target.value }));

  const enviar = async (evento) => {
    evento.preventDefault();
    setErroGeral('');
    const encontrados = validar(valores);
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;
    if (!editando && !estoque) {
      setErroGeral('O estoque ainda está carregando. Tente de novo em instantes.');
      return;
    }

    const produto = {
      nome: valores.nome.trim(),
      validade: valores.validade, // "2026-11-14", o formato que o backend espera
      quantidade: Number(valores.quantidade),
      estoqueMinimo: valores.estoqueMinimo === '' ? 0 : Number(valores.estoqueMinimo),
    };
    if (RECURSOS.categoriaEUnidadeNoProduto) {
      produto.categoria = valores.categoria.trim();
      produto.unidade = valores.unidade.trim();
    }

    setSalvando(true);
    try {
      if (editando) await atualizarProduto(produtoId, produto);
      else await criarProduto(estoque.id, produto);
      navegar('/escola/estoque', {
        state: { aviso: editando ? 'Produto atualizado.' : 'Produto cadastrado.' },
      });
    } catch (falha) {
      setErros(falha.campos || {}); // mensagens do backend embaixo de cada campo
      setErroGeral(falha.message);
      setSalvando(false);
    }
  };

  return (
    <div className="pagina">
      <PaginaTopo
        titulo="Estoque"
        subtitulo={editando ? 'Edite as informações do produto' : 'Cadastre um novo produto no estoque'}
      />

      <div className="cartao-form">
        <h2>{editando ? 'Editar produto' : 'Novo produto'}</h2>
        <p className="suave">
          {editando
            ? 'Atualize as informações do item.'
            : 'Preencha as informações do item para adicioná-lo ao estoque.'}
        </p>

        {erroEstoque && <Mensagem>{erroEstoque}</Mensagem>}

        {carregando ? (
          <p className="suave">Carregando produto…</p>
        ) : (
          <form onSubmit={enviar} noValidate>
            <Campo
              rotulo="Nome do produto"
              placeholder="Ex: Arroz branco"
              value={valores.nome}
              onChange={alterar('nome')}
              erro={erros.nome}
              autoFocus
            />

            {RECURSOS.categoriaEUnidadeNoProduto && (
              <div className="grade-2">
                <Campo rotulo="Categoria" placeholder="Grãos" value={valores.categoria} onChange={alterar('categoria')} />
                <Campo rotulo="Unidade de medida" placeholder="kg" value={valores.unidade} onChange={alterar('unidade')} />
              </div>
            )}

            <div className="grade-2">
              <Campo
                rotulo={editando ? 'Quantidade em estoque' : 'Quantidade inicial'}
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                placeholder="0"
                value={valores.quantidade}
                onChange={alterar('quantidade')}
                erro={erros.quantidade}
                disabled={editando}
                dica={editando ? 'Para mudar a quantidade, use "Entrada/Saída" na lista do estoque.' : undefined}
              />
              <Campo
                rotulo="Quantidade mínima (alerta)"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                placeholder="0"
                value={valores.estoqueMinimo}
                onChange={alterar('estoqueMinimo')}
                erro={erros.estoqueMinimo}
              />
            </div>

            <Campo
              rotulo="Data de validade"
              type="date"
              value={valores.validade}
              onChange={alterar('validade')}
              erro={erros.validade}
            />

            {erroGeral && <Mensagem>{erroGeral}</Mensagem>}

            <div className="acoes-form">
              <Link to="/escola/estoque" className="botao neutro">Cancelar</Link>
              <button type="submit" className="botao" disabled={salvando}>
                {salvando ? 'Salvando…' : 'Salvar produto'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
