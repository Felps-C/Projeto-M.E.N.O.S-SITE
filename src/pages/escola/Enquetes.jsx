import { useCallback, useEffect, useState } from 'react';
import Mensagem from '../../components/Mensagem.jsx';
import PaginaTopo from '../../components/PaginaTopo.jsx';
import Selo from '../../components/Selo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  abrirEnquete,
  criarEnquete,
  fecharEnquete,
  listarEnquetesDaEscola,
  listarPratosDaEscola,
} from '../../api/endpoints.js';
import { formatarData } from '../../utils/formatar.js';
import { hojeISO } from '../../utils.js';

const MIN_OPCOES = 2;
const MAX_OPCOES = 6;
const novoForm = () => ({ merendaId: '', titulo: '', dataFim: '', opcoes: ['', ''] });

function validar(form) {
  const erros = {};
  if (!form.titulo.trim()) erros.titulo = 'Informe a pergunta da enquete';
  if (form.dataFim && form.dataFim < hojeISO()) erros.dataFim = 'A data de encerramento não pode ser no passado';

  const preenchidas = form.opcoes.map((o) => o.trim()).filter(Boolean);
  if (preenchidas.length < MIN_OPCOES) {
    erros.opcoes = `Preencha pelo menos ${MIN_OPCOES} opções de resposta`;
  } else if (new Set(preenchidas.map((o) => o.toLowerCase())).size !== preenchidas.length) {
    erros.opcoes = 'As opções não podem se repetir';
  }
  return erros;
}

// Tela "Enquetes" da escola (Figma: "Nova enquete") + lista das enquetes já criadas.
export default function Enquetes() {
  const { sessao } = useAuth();
  const [form, setForm] = useState(novoForm);
  const [pratos, setPratos] = useState([]);
  const [enquetes, setEnquetes] = useState(null);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [aviso, setAviso] = useState('');
  const [enviando, setEnviando] = useState(false);

  const carregarEnquetes = useCallback(async () => {
    try {
      setEnquetes(await listarEnquetesDaEscola(sessao.escolaId));
    } catch (e) {
      setErroGeral(e.message);
      setEnquetes([]);
    }
  }, [sessao.escolaId]);

  useEffect(() => {
    carregarEnquetes();
    listarPratosDaEscola(sessao.escolaId)
      .then(setPratos)
      .catch((e) => setErroGeral(e.message));
  }, [sessao.escolaId, carregarEnquetes]);

  const mudar = (campo) => (evento) => {
    setForm((f) => ({ ...f, [campo]: evento.target.value }));
    setAviso('');
  };
  const mudarOpcao = (indice, valor) =>
    setForm((f) => ({ ...f, opcoes: f.opcoes.map((o, i) => (i === indice ? valor : o)) }));
  const adicionarOpcao = () => setForm((f) => ({ ...f, opcoes: [...f.opcoes, ''] }));
  const removerOpcao = (indice) => setForm((f) => ({ ...f, opcoes: f.opcoes.filter((_, i) => i !== indice) }));

  function cancelar() {
    setForm(novoForm());
    setErros({});
    setErroGeral('');
    setAviso('');
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErroGeral('');
    setAviso('');
    const problemas = validar(form);
    setErros(problemas);
    if (Object.keys(problemas).length > 0) return;

    setEnviando(true);
    try {
      await criarEnquete(sessao.escolaId, {
        titulo: form.titulo.trim(),
        ativa: true,
        merendaId: form.merendaId ? Number(form.merendaId) : undefined,
        // Encerra no fim do dia escolhido.
        dataFim: form.dataFim ? `${form.dataFim}T23:59:59` : undefined,
        opcoes: form.opcoes.map((o) => o.trim()).filter(Boolean),
      });
      setForm(novoForm());
      setAviso('Enquete criada! Os alunos já podem votar.');
      await carregarEnquetes();
    } catch (e) {
      setErroGeral(e.message);
    } finally {
      setEnviando(false);
    }
  }

  async function alternarSituacao(enquete) {
    setErroGeral('');
    setAviso('');
    try {
      if (enquete.aberta) await fecharEnquete(enquete.id);
      else await abrirEnquete(enquete.id);
      await carregarEnquetes();
    } catch (e) {
      setErroGeral(e.message); // ex.: "A data de término já passou..."
    }
  }

  return (
    <div className="pagina">
      <PaginaTopo titulo="Enquetes" subtitulo="Crie uma nova enquete sobre a merenda" />

      <form className="cartao-form" onSubmit={enviar} noValidate>
        <h2>Nova enquete</h2>
        <p className="suave">Crie uma enquete para coletar a opinião dos alunos</p>

        {aviso && <Mensagem tipo="ok">{aviso}</Mensagem>}

        <div className="grade-2">
          <div className="campo">
            <label htmlFor="enq-prato">Prato vinculado</label>
            <select id="enq-prato" value={form.merendaId} onChange={mudar('merendaId')}>
              <option value="">Selecione um prato do cardápio</option>
              {pratos.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
            <p className="dica">Opcional. Sem prato, a enquete vale para a merenda em geral.</p>
          </div>

          <div className={`campo${erros.titulo ? ' com-erro' : ''}`}>
            <label htmlFor="enq-titulo">Pergunta da enquete</label>
            <input
              id="enq-titulo"
              value={form.titulo}
              onChange={mudar('titulo')}
              placeholder="Ex: Você gostou da merenda de hoje?"
            />
            {erros.titulo && <p className="erro-texto">{erros.titulo}</p>}
          </div>
        </div>

        <div className="grade-enquete">
          <div className={`campo${erros.dataFim ? ' com-erro' : ''}`}>
            <label htmlFor="enq-data">Data de encerramento</label>
            <input id="enq-data" type="date" min={hojeISO()} value={form.dataFim} onChange={mudar('dataFim')} />
            <p className="dica">Opcional. Sem data, a enquete fica aberta até você fechar.</p>
            {erros.dataFim && <p className="erro-texto">{erros.dataFim}</p>}
          </div>

          <div className={`campo${erros.opcoes ? ' com-erro' : ''}`}>
            <span className="rotulo-grupo">Opções de resposta</span>
            {form.opcoes.map((valor, i) => (
              <div key={i} className="opcao-linha">
                <label htmlFor={`enq-opcao-${i}`}>Opção {i + 1}</label>
                <div className="opcao-entrada">
                  <input
                    id={`enq-opcao-${i}`}
                    value={valor}
                    onChange={(e) => mudarOpcao(i, e.target.value)}
                    placeholder={i === 0 ? 'Ex: Sim, gostei' : i === 1 ? 'Ex: Não gostei' : 'Outra opção'}
                  />
                  {form.opcoes.length > MIN_OPCOES && (
                    <button
                      type="button"
                      className="btn-icone"
                      title="Remover opção"
                      aria-label={`Remover opção ${i + 1}`}
                      onClick={() => removerOpcao(i)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
            {erros.opcoes && <p className="erro-texto">{erros.opcoes}</p>}
            {form.opcoes.length < MAX_OPCOES && (
              <button type="button" className="botao-adicionar" onClick={adicionarOpcao}>
                + Adicionar opção
              </button>
            )}
          </div>
        </div>

        {erroGeral && <Mensagem>{erroGeral}</Mensagem>}

        <div className="acoes-form">
          <button type="button" className="botao neutro" onClick={cancelar} disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" className="botao" disabled={enviando}>
            {enviando ? 'Criando…' : 'Criar enquete'}
          </button>
        </div>
      </form>

      <h2 className="titulo-secao">Enquetes criadas</h2>
      {enquetes === null ? (
        <p className="suave">Carregando enquetes…</p>
      ) : (
        <div className="tabela-cartao">
          <div className="tabela-rolagem">
            <table>
              <thead>
                <tr>
                  <th>Pergunta</th>
                  <th>Prato</th>
                  <th>Encerra em</th>
                  <th>Situação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {enquetes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="vazio">Nenhuma enquete criada ainda.</td>
                  </tr>
                )}
                {enquetes.map((e) => (
                  <tr key={e.id}>
                    <td className="nome">{e.titulo}</td>
                    <td className="suave">{e.merendaNome || '—'}</td>
                    <td className="suave">{e.dataFim ? formatarData(e.dataFim) : 'Sem data'}</td>
                    <td>
                      {e.aberta ? <Selo tipo="normal">Aberta</Selo> : <Selo tipo="alerta">Encerrada</Selo>}
                    </td>
                    <td>
                      <button type="button" className="btn-texto" onClick={() => alternarSituacao(e)}>
                        {e.aberta ? 'Fechar' : 'Reabrir'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
